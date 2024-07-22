
#include "stdafx.h"
#include "afxdialogex.h"
#include <string>

#include "SVCamSample.h"
#include "SVCamSampleDlg.h"

#ifdef SVGENSDK_DYNAMIC_LOAD
//#define SVS_SDK_DLL „Path to SVGenSDK32.dll/ SVGenSDK64.dll“// use this define to load specific SDK Dll path otherwise it will load Dll on SVS_SDK_BIN_32/ SVS_SDK_BIN_64 environmental variable
#include "sv_gen_sdk_dynamic.h"
#endif


#ifdef _DEBUG
#define new DEBUG_NEW
#endif


class CAboutDlg : public CDialogEx
{
public:
    CAboutDlg();

    // Dialog Data
    enum { IDD = IDD_ABOUTBOX };

protected:
    virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support

    // Implementation
protected:
    DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialogEx(CAboutDlg::IDD)
{
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX)
{
    CDialogEx::DoDataExchange(pDX);
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialogEx)

END_MESSAGE_MAP()

bool InitSDK()
{
    string ctiPath;
    string genicamPath;
    string genicamCachePath;
    string clProtocolPath;

    char buffer[1024] = { 0 };

#ifdef _WIN64
    int res = GetEnvironmentVariableA("GENICAM_GENTL64_PATH", buffer, sizeof(buffer));
    if (0 == res)
        return false;
#else
    int res = GetEnvironmentVariableA("GENICAM_GENTL32_PATH", buffer, sizeof(buffer));
    if (0 == res)
        return false;
#endif

    ctiPath = string(buffer);

    memset(buffer, 0, sizeof(buffer));
    res = GetEnvironmentVariableA("SVS_GENICAM_ROOT", buffer, sizeof(buffer));
    if (0 == res)
        return false;

    genicamPath = string(buffer);

    memset(buffer, 0, sizeof(buffer));
    res = GetEnvironmentVariableA("SVS_GENICAM_CACHE", buffer, sizeof(buffer));
    if (0 == res)
        return false;

    genicamCachePath = string(buffer);

    memset(buffer, 0, sizeof(buffer));
    res = GetEnvironmentVariableA("SVS_GENICAM_CLPROTOCOL", buffer, sizeof(buffer));
    if (0 == res)
        return false;

    clProtocolPath = string(buffer);

    SV_RETURN ret = SVLibInit(ctiPath.c_str(), genicamPath.c_str(), genicamCachePath.c_str(), clProtocolPath.c_str());
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("SVLibInit Failed! :%d", ret);
        return false;
    }

    return true;
}

UINT  DisplayThreadfunction(LPVOID pParamt)

{
    // Process only the currently selected camera.
    CSVCamSampleDlg  *svCam = (CSVCamSampleDlg*) pParamt;
    if (svCam == NULL)
    {
        delete svCam;
        return 0;
    }
    if (  svCam->currentSelected_Camera == NULL)
        return 0;

    Camera *  currentCam = svCam->currentSelected_Camera;
    while ( !svCam->terminated )
    {
        if (currentCam->sv_cam_acq->imageBufferInfo.size() !=0)
        {
            // Obtain the image data pointer and characteristics
            SV_BUFFER_INFO  *NewImageInfo = currentCam->sv_cam_acq->imageBufferInfo.front();

            if (NewImageInfo->pImagePtr) {
                svCam->SendMessage(WM_DISPLAY_IMAGE,0, (LONG_PTR)NewImageInfo);
                currentCam->sv_cam_acq->imageBufferInfo.pop_front();
            }
            else
            {
                currentCam->sv_cam_acq->imageBufferInfo.pop_front();
                delete NewImageInfo;
            }
        }
        else
        {
            WaitForSingleObject(currentCam->sv_cam_acq->m_newImage, 1000);
            ResetEvent(currentCam->sv_cam_acq->m_newImage);
        }
    }


    SetEvent(svCam->m_acquisitionstopThread);

    return 0;
}


CSVCamSampleDlg::CSVCamSampleDlg(  CWnd* pParent /*=NULL*/) : CDialogEx( CSVCamSampleDlg::IDD, pParent)
{
    //Initialize a camera container for each of GenTLProducers.
    currentSelected_Camera = NULL;
    selectedItem = NULL;
    currentFeatureVisibility = SV_Beginner;
	m_acquisitionstopThread =  CreateEvent(NULL, false, false, NULL);
    m_thread = NULL;

    //Initialize image Data for Display
    ImageData_RGB = NULL;
    ImageData_MONO = NULL;

    m_hIcon = AfxGetApp()->LoadIcon(IDI_ICON1);
    InitializeCriticalSection(&m_CriticalSection);
    isQuitting = false;
}

CSVCamSampleDlg::~CSVCamSampleDlg( )
{
	
	if (sv_cam_sys_list.size() != 0)
        DSDeleteContainer(sv_cam_sys_list);

	if (!tlIDList.empty())
		tlIDList.clear();

    //Close the library and free all the allocated resources.
    SVLibClose();
    
    if(display_Data )
    {
        GlobalFree(display_Data);
    }
    if (currentSelected_Camera)
        currentSelected_Camera = NULL;
    DeleteCriticalSection(&m_CriticalSection);
}

SVCamSystem * CSVCamSampleDlg::GetSVCamSystem(vector<SVCamSystem *> sv_cam_sys_list, char *tlid)
{
	// Get the SVCamSyste with the selected TL id
	for (std::vector<SVCamSystem*>::iterator currentSystem = sv_cam_sys_list.begin(); currentSystem != sv_cam_sys_list.end(); currentSystem++)
	{
		std::string str((*currentSystem)->sv_tl_inf.id);
		if (str.compare(tlid) == 0)
		{
			return  (*currentSystem);
		}
	}
	return NULL;
}

Camera * CSVCamSampleDlg::GetCamera(  SVCamSystem* svcam, char* id)
{
    // Get the Camera with the selected device id
    for(std::vector<Camera*>::iterator currentcam  =  svcam->sv_cam_list.begin(); currentcam != svcam->sv_cam_list.end(); currentcam++ )
    {
        std::string str( (*currentcam)->devInfo.uid);
        if (str.compare( id) ==0)
        {
            return (*currentcam);
        }
    }
    return NULL;
}

bool CSVCamSampleDlg::OpenSelectedCam(SVCamSystem* svcam, SV_DEVICE_INFO * devinf)
{
	if (svcam == NULL)
		return false;

    BeginWaitCursor();
    svcam->openDevice(*devinf);
    Camera * cam = GetCamera(svcam, devinf->uid);
    if (cam == NULL)
        return false;
    if (cam)
    {
        // clear display
        ShowImage(Display, 600 ,600, display_Data);
        //update the current selected camera
        currentSelected_Camera = cam;
        // Update the feature tree of the device
        UpdateFeatureTree();
    }

    m_start_stream.ShowWindow(SW_SHOWNORMAL);
    m_stop_stream.ShowWindow(SW_HIDE);

    EndWaitCursor();
    return true;
}


LRESULT CSVCamSampleDlg::WMDisplayImage(WPARAM WParam, LPARAM LParam)
{
    // Obtain image information structure
    SV_BUFFER_INFO *   ImageInfo = (SV_BUFFER_INFO *)LParam;
    if (ImageInfo == NULL)
        return 0;

    if (ImageInfo->pImagePtr == NULL )
        return 0;

    // update the displayed image id
    const CString  strValue(to_string (ImageInfo->iImageId).c_str());
    LPCWSTR wstrValue = static_cast<LPCWSTR>( strValue );
    m_frame_id.SetWindowTextW(wstrValue);

    // Check if a RGB image( Bayer buffer format) arrived
    bool isImgRGB = false;
    int pDestLength = (int)(ImageInfo->iImageSize);
    
    //  Bayer buffer format(up id: 8)
    if ((ImageInfo->iPixelType & SV_GVSP_PIX_ID_MASK) >=  8)
    {
        isImgRGB = true;
        pDestLength =  4* pDestLength;
    }
    unsigned sizeX =(unsigned int) ImageInfo->iSizeX;
    unsigned sizeY = (unsigned int)ImageInfo->iSizeY;
    
    // 8 bit Format
    if( (ImageInfo->iPixelType & SV_GVSP_PIX_EFFECTIVE_PIXELSIZE_MASK) == SV_GVSP_PIX_OCCUPY8BIT)
    {
        if (isImgRGB)
        {
            // Allocate a RGB buffer if needed
            if( NULL == ImageData_RGB )
                ImageData_RGB = (unsigned char *)GlobalAlloc(GMEM_FIXED, pDestLength);
            
            // Convert to 24 bit and display image
            SVUtilBufferBayerToRGB32(*ImageInfo,ImageData_RGB , pDestLength);
            
            ShowImageRGB(Display, sizeX,  sizeY, ImageData_RGB);
        }
        else
        {
            ShowImage(Display, sizeX,  sizeY, ImageInfo->pImagePtr);
        }
    }

    // 12 bit Format
    // Check if a conversion of a 12-bit image is needed
    if( (ImageInfo->iPixelType & SV_GVSP_PIX_EFFECTIVE_PIXELSIZE_MASK) == SV_GVSP_PIX_OCCUPY12BIT)
    {
        if( isImgRGB)
        {
            // Allocate a RGB buffer if needed
            if( NULL == ImageData_RGB )
                ImageData_RGB = (unsigned char *)GlobalAlloc(GMEM_FIXED, pDestLength);
            
            // Convert to 24 bit and display image
            SVUtilBufferBayerToRGB32(*ImageInfo,ImageData_RGB , pDestLength);
            
            ShowImageRGB(Display, sizeX,  sizeY, ImageData_RGB);
        }
        else
        {
            if( NULL == ImageData_MONO )
                ImageData_MONO = (unsigned char *)GlobalAlloc(GMEM_FIXED, pDestLength);

            // Convert to 8 bit and display image
            SVUtilBuffer12BitTo8Bit(*ImageInfo, ImageData_MONO , pDestLength);
            ShowImage(Display, sizeX,  sizeY, ImageData_MONO);
        }
    }

    // 16 bit Format
    // Check if a conversion of a 16-bit image is needed
    if( (ImageInfo->iPixelType & SV_GVSP_PIX_EFFECTIVE_PIXELSIZE_MASK) == SV_GVSP_PIX_OCCUPY16BIT)
    {
        if( isImgRGB)
        {
            // Allocate a RGB buffer if needed
            if( NULL == ImageData_RGB )
                ImageData_RGB = (unsigned char *)GlobalAlloc(GMEM_FIXED, pDestLength);

            // Convert to 24 bit and display image
            SVUtilBuffer16BitTo8Bit(*ImageInfo,ImageData_RGB , (int)pDestLength);
            ShowImageRGB(Display, sizeX,  sizeY, ImageData_RGB);
        }
        else
        {
            if( NULL == ImageData_MONO )
                ImageData_MONO = (unsigned char *)GlobalAlloc(GMEM_FIXED, pDestLength);

            // Convert to 8 bit and display image
            SVUtilBuffer16BitTo8Bit(*ImageInfo, ImageData_MONO , (int)pDestLength);
            ShowImage(Display, sizeX,  sizeY, ImageData_MONO);
        }
    }
    delete ImageInfo;
    return 0;
}

void CSVCamSampleDlg::ShowImage(HDC DisplayDC, size_t _Width, size_t _Height, unsigned char *ImageData)
{
    int Width = (int)_Width;
    int Height = (int)_Height;

    // Check image alignment
    if( Width % 4 == 0 )
    {
        BITMAPINFO *bitmapinfo;

        // Generate and fill a bitmap info structure
        bitmapinfo = (BITMAPINFO *)new char[sizeof(BITMAPINFOHEADER) + 256 * sizeof(RGBQUAD)];

        bitmapinfo->bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
        bitmapinfo->bmiHeader.biWidth =(long) Width;
        bitmapinfo->bmiHeader.biHeight = -Height;
        bitmapinfo->bmiHeader.biBitCount = 8;
        bitmapinfo->bmiHeader.biPlanes = 1;
        bitmapinfo->bmiHeader.biClrUsed = 0;
        bitmapinfo->bmiHeader.biClrImportant = 0;
        bitmapinfo->bmiHeader.biCompression = BI_RGB;
        bitmapinfo->bmiHeader.biSizeImage = 0;
        bitmapinfo->bmiHeader.biXPelsPerMeter = 0;
        bitmapinfo->bmiHeader.biYPelsPerMeter = 0;

        // Fill color table with gray levels
        for(int i = 0; i < 256; i++)
        {
            bitmapinfo->bmiColors[i].rgbRed = i;
            bitmapinfo->bmiColors[i].rgbGreen = i;
            bitmapinfo->bmiColors[i].rgbBlue = i;
            bitmapinfo->bmiColors[i].rgbReserved = 0;
        }

        // Center image if it is smaller than the screen
        int Left = 0;
        int Top = 0;
        int OffsetX = 0;
        if( Width < DisplayWidth )
            Left = (DisplayWidth - Width) / 2;
        if( Height < DisplayHeight )
            Top = (DisplayHeight - Height) / 2;
       
       // Center image if it is bigger than the screen
        if( Width > DisplayWidth )
            OffsetX = (Width - DisplayWidth) / 2;
        SetDIBitsToDevice(DisplayDC, Left, Top, Width, Height, OffsetX, 0, 0, Height, ImageData, bitmapinfo, DIB_RGB_COLORS);
        delete []bitmapinfo;
    }
}

void CSVCamSampleDlg::ShowImageRGB(HDC DisplayDC, size_t _Width, size_t _Height, unsigned char *ImageData)
{
    int Width = (int)_Width;
    int Height = (int)_Height;

    // Check image alignment
    if( Width % 4 == 0 )
    {
        // Generate and fill a bitmap info structure
        BITMAPINFO *bitmapinfo;
        bitmapinfo = (BITMAPINFO *)new char[sizeof(BITMAPINFOHEADER)];
        bitmapinfo->bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
        bitmapinfo->bmiHeader.biWidth = Width;
        bitmapinfo->bmiHeader.biHeight = -Height;
        bitmapinfo->bmiHeader.biBitCount = 32;
        bitmapinfo->bmiHeader.biPlanes = 1;
        bitmapinfo->bmiHeader.biClrUsed = 0;
        bitmapinfo->bmiHeader.biClrImportant = 0;
        bitmapinfo->bmiHeader.biCompression = BI_RGB;
        bitmapinfo->bmiHeader.biSizeImage = 0;
        bitmapinfo->bmiHeader.biXPelsPerMeter = 0;
        bitmapinfo->bmiHeader.biYPelsPerMeter = 0;

        // Center image if it is smaller than the screen
        int Left = 0;
        int Top = 0;
        int OffsetX = 0;
        if( Width < DisplayWidth )
            Left = (DisplayWidth - Width) / 2;
        if( Height < DisplayHeight )
            Top = (DisplayHeight - Height) / 2;
        
        // Center image if it is bigger than the screen
        if( Width > DisplayWidth )
            OffsetX = (Width - DisplayWidth) / 2;

        SetDIBitsToDevice(DisplayDC, Left, Top, Width, Height, OffsetX, 0, 0, Height, ImageData, bitmapinfo, DIB_RGB_COLORS);
        delete []bitmapinfo;
    }
}

void CSVCamSampleDlg::AddFeatureToTree( SVCamFeaturInf* curentfeature,  HTREEITEM *root )
{
    TVINSERTSTRUCT tvInsert;
    ZeroMemory(&tvInsert, sizeof(tvInsert));
    tvInsert.hInsertAfter = NULL;
    tvInsert.item.mask = TVIF_TEXT;
    WCHAR szText[512] = {'\0'};
    tvInsert.item.pszText = szText;
    HTREEITEM current_root = NULL;
    HTREEITEM parentroot = NULL;

    //Get the name and it correspond value.
    const CString str( ((curentfeature)->SVFeaturInf.displayName));
    LPCWSTR wstr = static_cast<LPCWSTR>(str);
    wcscpy_s(szText,wstr);

    wcscat_s(szText,L": ");

    const CString  strValue( ((curentfeature)->strValue));
    LPCWSTR wstrValue = static_cast<LPCWSTR>( strValue );
    wcscat_s(szText,wstrValue);
    if( SV_intfICategory != (curentfeature)->SVFeaturInf.type)
        currentSelected_Camera->sv_cam_feature->RegisterInvalidateCB( (curentfeature)->SVFeaturInf.name ,   reinterpret_cast<SV_CB_OBJECT>(this),  reinterpret_cast<SV_CB_FEATURE_INVALIDATED_PFN>(& CSVCamSampleDlg::OnFeatureInvalidated));

    //the features are grouped in levels.
    //Add the feature items depending on it levels
    switch ( (curentfeature)->SVFeaturInf.level)
    {
    case 1:
        *root =	m_feature_tree.InsertItem(&tvInsert);
        m_feature_tree.SetItemData(	*root,((DWORD_PTR ) (curentfeature)));
        m_feature_tree.SelectItem(*root );
        break;
        
    default:
        //Add the current feature item to the next feature with higher level.
        parentroot = FindItemByLevel (  (curentfeature)->SVFeaturInf.level-1,m_feature_tree, m_feature_tree.GetSelectedItem() );
        current_root = m_feature_tree.InsertItem(tvInsert.item.pszText, parentroot);
        
        // disable items with locked features.
        if((curentfeature)->SVFeaturInf.isLocked)
        {
            m_feature_tree.SetItemStateEx( current_root, TVIS_EX_DISABLED );
        }
        m_feature_tree.SetItemData(current_root,(DWORD_PTR ) (curentfeature));
        m_feature_tree.SelectItem(current_root );
        break;
    }
}

void CSVCamSampleDlg::UpdateFeatureTree()
{
    Camera *  cam =  currentSelected_Camera;
    if (cam )
    {
        // Update the feature tree of the selected camera
        m_feature_tree.ShowWindow(SW_HIDE);
        m_edit_feature_value.ShowWindow(SW_HIDE);
        m_Feature_value.ShowWindow(SW_HIDE);
        m_command.ShowWindow(SW_HIDE);
        m_enumeration.ShowWindow(SW_HIDE);
        m_string_value.ShowWindow(SW_HIDE);
        m_feature_tree.DeleteAllItems();

        DSDeleteContainer(cam->sv_cam_feature->featureInfolist);
        cam->sv_cam_feature->getDeviceFeatureList(currentFeatureVisibility);
        
        if ( cam->sv_cam_feature->featureInfolist.size()==0)
            return;

        HTREEITEM root = NULL;
        HTREEITEM root1 = NULL;
        for(std::vector<SVCamFeaturInf*>::iterator i = cam->sv_cam_feature->featureInfolist.begin()+1; i != cam->sv_cam_feature->featureInfolist.end(); i++)
        {
            AddFeatureToTree (*i ,&root);
            m_feature_tree.Expand( root,TVE_COLLAPSE);
            if (root1 == NULL)
                root1 = root;
        }
        // expand the first feature node with camera information.
        m_feature_tree.Expand( root1,TVE_EXPAND);
        currentSelected_Camera->isInvalidateCB = true;
        m_feature_tree.ShowWindow(SW_SHOWNORMAL);
        isQuitting = false;
    }
}

HTREEITEM CSVCamSampleDlg::FindItemByName(const CString& name, CTreeCtrl& tree, HTREEITEM hRoot)
{
    // check whether the current item is the searched one
    SVCamFeaturInf *camFeatureInfo =  (SVCamFeaturInf *) tree.GetItemData(hRoot);
    CString text (camFeatureInfo->SVFeaturInf.name);

    if (text.Compare(name) == 0)
        return hRoot;

    // get a handle to the first child item
    HTREEITEM hSubItem = tree.GetChildItem(hRoot);

    // iterate as long a new item is found
    while (hSubItem)
    {
        // check the children of the current item
        HTREEITEM hFound = FindItemByName(name, tree, hSubItem);
        if (hFound)
            return hFound;

        // get the next sibling of the current item
        //hSubItem = tree.GetNextSiblingItem(hSubItem);
        hSubItem = tree.GetNextVisibleItem(hSubItem);
    }

    // return NULL if nothing was found
    return NULL;
}

HTREEITEM CSVCamSampleDlg::FindItemByLevel(int Level, CTreeCtrl& tree, HTREEITEM hRoot)
{
    // check whether the current item is the searched one
    SVCamFeaturInf *camFeatureInfo =  (SVCamFeaturInf *) tree.GetItemData(hRoot);
    CString text (camFeatureInfo->SVFeaturInf.displayName);

    if ( camFeatureInfo->SVFeaturInf.level <= Level)
    {
        return hRoot;
    }
    // get a handle to the first child item
    HTREEITEM hSubItem = tree.GetParentItem(hRoot);
    // iterate as long a new item is found
    while (hSubItem)
    {
        // check the children of the current item
        HTREEITEM hFound = FindItemByLevel(Level, tree, hSubItem);
        if (hFound)
            return hFound;

        // get the next sibling of the current item
        hSubItem = tree.GetPrevSiblingItem( hSubItem);
    }
    // return NULL if nothing was found
    return NULL;
}

void CSVCamSampleDlg::OnFeatureInvalidated( const char *featureName) //HTREEITEM *root)
{
    if (isQuitting)
        return;
    
    if (m_feature_tree)
    {
        // get the changed value and update the item value in the tree
        if (currentSelected_Camera)
        {
            const CString  str(featureName);
            HTREEITEM  currentitem = FindItemByName(str, m_feature_tree, m_feature_tree.GetRootItem());
            UpdateTreeItem(currentitem);
        }
    }
}


void CSVCamSampleDlg::UpdateTreeItem (HTREEITEM hRoot )
{
    if (m_feature_tree)
    {
        if (hRoot)
        {
            SVCamFeaturInf * inf = (SVCamFeaturInf *)m_feature_tree.GetItemData(hRoot);
            if (inf == NULL)
                return;
            
            if (inf->SVFeaturInf.type != SV_intfICommand)
            {
                currentSelected_Camera->sv_cam_feature->getFeatureValue(((SVCamFeaturInf *)m_feature_tree.GetItemData(hRoot))->hFeature, inf);
                WCHAR szText[512] = { '\0' };
                const CString str(inf->SVFeaturInf.displayName);
                LPCWSTR wsstr = static_cast<LPCWSTR>(str);
                wcscat_s(szText, wsstr);
                wcscat_s(szText, L": ");
                const CString str1(inf->strValue);
                LPCWSTR wsstr1 = static_cast<LPCWSTR>(str1);
                wcscat_s(szText, wsstr1);
                // update feature value
                m_feature_tree.SetItemText(hRoot, szText);
            }

            if (inf->SVFeaturInf.type != SV_intfICategory)
            {
                if ((inf)->SVFeaturInf.isLocked)
                {
                    m_feature_tree.SetItemStateEx(hRoot, TVIS_EX_DISABLED);
                }
                else
                {
                    m_feature_tree.SetItemStateEx(hRoot, 0);
                }
            }
        }
    }
}

void CSVCamSampleDlg::DoDataExchange(CDataExchange* pDX)
{
    CDialogEx::DoDataExchange(pDX);
    
    //Acquisition(stream)
    DDX_Control(pDX, IDC_BUTTON2, m_stop_stream);
    DDX_Control(pDX, IDC_BUTTON3, m_start_stream);
    DDX_Control(pDX, IDC_DISPLAY, m_display);
    DDX_Control(pDX, IDC_EDIT5, m_frame_id);

    //Device Feature(control)
    DDX_Control(pDX, IDC_TREE2, m_feature_tree);
    DDX_Control(pDX, IDC_BUTTON4, m_command);
    DDX_Control(pDX, IDC_COMBO1, m_enumeration);
    DDX_Control(pDX, IDC_SLIDER1, m_Feature_value);
    DDX_Control(pDX, IDC_EDIT1, m_edit_feature_value);
    DDX_Control(pDX, IDC_EDIT2, m_tool_tip);
    DDX_Control(pDX, IDC_EDIT3, m_current_feature);
    DDX_Control(pDX, IDC_EDIT4, m_string_value);
    DDX_Control(pDX, IDC_BUTTON1, m_update_tree);
    DDX_Control(pDX, IDC_COMBO2, m_feature_visibility);
    //DDX_Control(pDX, IDC_CAMERA_LINK_INTERFACE, m_cl_interface);
    DDX_Control(pDX, IDC_CAM, m_cam);
}

BEGIN_MESSAGE_MAP(CSVCamSampleDlg, CDialogEx)
ON_WM_SYSCOMMAND()
ON_WM_PAINT()
ON_WM_QUERYDRAGICON()

// Device Selection

//Acquisition(streaming channel)
ON_BN_CLICKED(IDC_BUTTON2, &CSVCamSampleDlg::OnBnClickedStopStream)
ON_BN_CLICKED(IDC_BUTTON3, &CSVCamSampleDlg::OnBnClickedStartStream)
ON_MESSAGE( WM_DISPLAY_IMAGE, WMDisplayImage)

//Device Feature(control)
ON_BN_CLICKED(IDC_BUTTON4, &CSVCamSampleDlg::OnBnClickedFeatureCommand )
ON_NOTIFY(NM_CUSTOMDRAW, IDC_SLIDER1, &CSVCamSampleDlg::OnDrawFeatureSlider)
ON_CBN_SELCHANGE(IDC_COMBO1, &CSVCamSampleDlg::OnSelectEnumFeature)
ON_NOTIFY(NM_DBLCLK, IDC_TREE2, &CSVCamSampleDlg::OnDblclkFeatureTree)
ON_EN_KILLFOCUS(IDC_EDIT4, &CSVCamSampleDlg::OnEnEditFeatureString)
ON_BN_CLICKED(IDC_BUTTON1, &CSVCamSampleDlg::OnBnUpdateFeatureTree)
ON_NOTIFY(NM_RELEASEDCAPTURE, IDC_SLIDER1, &CSVCamSampleDlg::OnReleasedcaptureFeatureSlider)
ON_EN_KILLFOCUS(IDC_EDIT1, &CSVCamSampleDlg::OnEnFeatureEdit)

//destructor
ON_BN_CLICKED(IDCLOSE, &CSVCamSampleDlg::OnBnClickedQuit)

ON_CBN_SELCHANGE(IDC_CAM, &CSVCamSampleDlg::OnCbnSelchangeCam)
ON_CBN_SELCHANGE(IDC_COMBO2, &CSVCamSampleDlg::OnCbnSelchangeVisibility)
END_MESSAGE_MAP()


BOOL CSVCamSampleDlg::OnInitDialog()
{
    CDialogEx::OnInitDialog();
    SetIcon(m_hIcon, TRUE);
    ASSERT((IDM_ABOUTBOX & 0xFFF0) == IDM_ABOUTBOX);
    ASSERT(IDM_ABOUTBOX < 0xF000);
    CMenu* pSysMenu = GetSystemMenu(FALSE);
    if (pSysMenu != NULL)
    {
        BOOL bNameValid;
        CString strAboutMenu;
        bNameValid = strAboutMenu.LoadString(IDS_ABOUTBOX);
        ASSERT(bNameValid);
        if (!strAboutMenu.IsEmpty())
        {
            pSysMenu->AppendMenu(MF_SEPARATOR);
            pSysMenu->AppendMenu(MF_STRING, IDM_ABOUTBOX, strAboutMenu);
        }
    }
    
    // Obtain a device context for displaying bitmaps
    Display = ::GetDC( m_display );
    // Determine display geometry
    RECT DisplayRect;
    m_display.GetWindowRect(&DisplayRect);
    DisplayWidth = DisplayRect.right - DisplayRect.left;
    DisplayHeight = DisplayRect.bottom - DisplayRect.top;
    display_Data = (unsigned char *)GlobalAlloc(GMEM_FIXED, 600*600);
    memset(display_Data, 0, 600 * 600);
    m_feature_visibility.AddString(L"Guru");
    m_feature_visibility.AddString(L"Expert");
    m_feature_visibility.AddString(L"Beginner");
    m_feature_visibility.SetCurSel( currentFeatureVisibility);

    bool bInitSuccessful = InitSDK();
    if (!bInitSuccessful)
    {
        MessageBox(_T(" SVGenSDK could not be initialized"));
        PostMessage(WM_CLOSE, 0, NULL);
        return false;
    }

    m_command.ShowWindow(SW_HIDE);
    m_Feature_value.ShowWindow(SW_HIDE);

    m_enumeration.Clear();
    for ( int j =0; j< m_enumeration.GetCount()+1; j++)
        m_enumeration.DeleteString(j);
    m_enumeration.ShowWindow(SW_HIDE);
    m_edit_feature_value.ShowWindow(SW_HIDE);

    uint32_t tlCount = 0;
    SV_RETURN ret = SVLibSystemGetCount(&tlCount);
    int index = 0;

    for (uint32_t i = 0; i < tlCount; i++)
    {
		SV_TL_INFO  tlInfo = {0};
        ret = SVLibSystemGetInfo(i, &tlInfo);
        if (SV_ERROR_SUCCESS != ret)
        {
            continue;
        }
		
		SVCamSystem *svcam = new SVCamSystem(tlInfo);
		
        if (svcam->SVCamSystemInit(i))
        {
			sv_cam_sys_list.push_back(svcam);
			svcam->deviceDiscovery(1000);
			for (int j = 0; j < svcam->devInfoList.size(); j++)
				{
					//SV_TL_INFO  * newTlInfo = new SV_TL_INFO;
					//newTlInfo = &tlInfo;
				    tlIDList.push_back(svcam->sv_tl_inf.id);
					const CString  strValue(svcam->sv_tl_inf.displayName);
					const CString  strValue2(svcam->devInfoList.at(j)->model);
					const CString  strValue3(svcam->devInfoList.at(j)->serialNumber);
					const CString str = strValue + " " + strValue2 + " SN:" + strValue3;
					m_cam.AddString(str);
					m_cam.SetItemDataPtr(index, svcam->devInfoList.at(j));
					index++;
				}
        }
		else
		{
			delete svcam;
		}
	}

    ShowWindow(SW_SHOWNORMAL);
    return TRUE;
}

void CSVCamSampleDlg::OnSysCommand(UINT nID, LPARAM lParam)
{
    if ((nID & 0xFFF0) == IDM_ABOUTBOX)
    {
        CAboutDlg dlgAbout;
        dlgAbout.DoModal();
    }

    if ((nID & 0xFFF0) == SC_CLOSE)
    {
        OnBnClickedQuit();
    }
    else
    {
        CDialogEx::OnSysCommand(nID, lParam);
    }
}

// The system calls this function to obtain the cursor to display while the user drags
//  the minimized window.
HCURSOR CSVCamSampleDlg::OnQueryDragIcon()
{
    return static_cast<HCURSOR>(m_hIcon);
}

void CSVCamSampleDlg::OnBnClickedFeatureCommand()

{
    UINT32 timeOut = 1000;
    DWORD_PTR data =  m_feature_tree.GetItemData(selectedItem);
    SVCamFeaturInf *currentSelected_Featur =  ((SVCamFeaturInf *)data);
    SVFeatureCommandExecute( currentSelected_Featur->hRemoteDevice,currentSelected_Featur->hFeature, timeOut);
}


void CSVCamSampleDlg::OnDrawFeatureSlider(NMHDR *pNMHDR, LRESULT *pResult)
{
    const CString  strValue(to_string (m_Feature_value.GetPos()).c_str());
    LPCWSTR ws = static_cast<LPCWSTR>( strValue );
    m_edit_feature_value.SetWindowTextW(ws);
    *pResult = 0;
}


void CSVCamSampleDlg::OnEnFeatureEdit()
{
    if ( m_feature_tree)
    {
        const int size = 255;
        TCHAR buffer[size] = {0};
        m_edit_feature_value.GetWindowText( buffer, size);
        
        int64_t  intValue  = _wtol( buffer );
        if (  m_Feature_value.GetRangeMax() >=0)
        {
            if  (intValue > m_Feature_value.GetRangeMax())
                intValue =  m_Feature_value.GetRangeMax();
            m_Feature_value.SetPos((int)intValue );
        }
        if (selectedItem)
        {
            DWORD_PTR data =  m_feature_tree.GetItemData(selectedItem);
            SVCamFeaturInf *currentSelected_Featur =  ((SVCamFeaturInf *)data);
            if (currentSelected_Featur )
                switch (currentSelected_Featur->SVFeaturInf.type)
                {
                case SV_intfIInteger:
                    if ( intValue >  currentSelected_Featur->SVFeaturInf.intMax)
                        intValue =   currentSelected_Featur->SVFeaturInf.intMax;

                    intValue = intValue- intValue %currentSelected_Featur->SVFeaturInf.intInc;
                    SVFeatureSetValueInt64(currentSelected_Featur->hRemoteDevice , currentSelected_Featur->hFeature, intValue);
                    break;

                case SV_intfIFloat :
                    if ( intValue >  (int64_t)currentSelected_Featur->SVFeaturInf.floatMax)
                        intValue = (int64_t)currentSelected_Featur->SVFeaturInf.floatMax;

                    intValue = intValue- intValue % (int64_t)currentSelected_Featur->SVFeaturInf.floatInc;
                    SVFeatureSetValueFloat(currentSelected_Featur->hRemoteDevice,currentSelected_Featur->hFeature,(double)intValue);
                    break;

                default:
                    return;
                }

            const CString  strValue(to_string (intValue).c_str());
            LPCWSTR ws = static_cast<LPCWSTR>( strValue );
            m_edit_feature_value.SetWindowTextW(ws);
            UpdateTreeItem (selectedItem);
        }
    }
}

void CSVCamSampleDlg::OnReleasedcaptureFeatureSlider(NMHDR *pNMHDR, LRESULT *pResult)
{
    DWORD_PTR data =  m_feature_tree.GetItemData(selectedItem);
    SVCamFeaturInf *currentSelected_Featur =  ((SVCamFeaturInf *)data);

    int64_t  value  =  m_Feature_value.GetPos();
    switch (currentSelected_Featur->SVFeaturInf.type)
    {
    case SV_intfIInteger:
        value = value- value % (int)currentSelected_Featur->SVFeaturInf.intInc;
        m_Feature_value.SetPos((int)value);
        SVFeatureSetValueInt64(currentSelected_Featur->hRemoteDevice , currentSelected_Featur->hFeature,m_Feature_value.GetPos());
        break;

    case SV_intfIFloat :
        value = value- value % (int)currentSelected_Featur->SVFeaturInf.floatInc;
        m_Feature_value.SetPos((int)value);
        SVFeatureSetValueFloat(currentSelected_Featur->hRemoteDevice,currentSelected_Featur->hFeature, m_Feature_value.GetPos());
        break;

    default:
        *pResult = 0;
        return;
    }
    UpdateTreeItem (selectedItem);
    *pResult = 0;
}

void CSVCamSampleDlg::OnSelectEnumFeature()
{
    int32_t enumvalue =   m_enumeration.GetCurSel();
    DWORD_PTR data =  m_feature_tree.GetItemData(selectedItem);
    SVCamFeaturInf *currentSelected_FeatureInfo = currentSelected_FeatureInfo =(SVCamFeaturInf *)data;

    if(SV_intfIBoolean == currentSelected_FeatureInfo->SVFeaturInf.type)
    {
        bool  bvalue = ( enumvalue == 0? false : true );
        int ret =  SVFeatureSetValueBool(currentSelected_FeatureInfo->hRemoteDevice, currentSelected_FeatureInfo->hFeature,bvalue);
        UpdateTreeItem (selectedItem);
    }
    else
    {
        char *subFeatureName = new char[SV_STRING_SIZE];
        int64_t pValue=0;
        SVFeatureEnumSubFeatures(currentSelected_FeatureInfo->hRemoteDevice,   currentSelected_FeatureInfo->hFeature,enumvalue, subFeatureName,SV_STRING_SIZE ,&pValue);
        int ret =	SVFeatureSetValueInt64Enum(currentSelected_FeatureInfo->hRemoteDevice, currentSelected_FeatureInfo->hFeature, pValue );
        delete[] subFeatureName;
        UpdateTreeItem (selectedItem);
    }
}

void CSVCamSampleDlg::OnDblclkFeatureTree(NMHDR *pNMHDR, LRESULT *pResult)
{
    if ( m_feature_tree.GetItemStateEx(m_feature_tree.GetSelectedItem()) == TVIS_EX_DISABLED )
        return;

    selectedItem = m_feature_tree.GetSelectedItem();
    DWORD_PTR data =  m_feature_tree.GetItemData(selectedItem);
    SVCamFeaturInf *currentSelected_FeatureInfo;
    currentSelected_FeatureInfo = (SVCamFeaturInf *)data;
    const CString s( ( currentSelected_FeatureInfo->SVFeaturInf.toolTip));
    LPCWSTR ws = static_cast<LPCWSTR>( s );
    m_tool_tip.SetWindowTextW(ws);
    const CString  strValue(currentSelected_FeatureInfo->SVFeaturInf.displayName);
    LPCWSTR ws3 = static_cast<LPCWSTR>( strValue );

    m_current_feature.SetWindowTextW(ws3);
    CFont m_Font;
    m_Font.CreatePointFont(100, _T("Calibri"));
    m_current_feature.SetFont(&m_Font,1);
    m_edit_feature_value.ShowWindow(SW_HIDE);
    m_Feature_value.ShowWindow(SW_HIDE);
    m_command.ShowWindow(SW_HIDE);
    m_enumeration.ShowWindow(SW_HIDE);
    m_enumeration.ResetContent();
    m_string_value.ShowWindow(SW_HIDE);

    if (currentSelected_FeatureInfo)
    {
        if( SV_intfIInteger == currentSelected_FeatureInfo->SVFeaturInf.type  || SV_intfIFloat == currentSelected_FeatureInfo->SVFeaturInf.type )
        {
            if ( SV_intfIInteger == currentSelected_FeatureInfo->SVFeaturInf.type)
            {
                m_Feature_value.SetRangeMin( (int)currentSelected_FeatureInfo->SVFeaturInf.intMin);
                m_Feature_value.SetRangeMax( (int)currentSelected_FeatureInfo->SVFeaturInf.intMax);
                m_Feature_value.SetPos( (int)currentSelected_FeatureInfo->intValue );
                const CString  strValue(to_string (currentSelected_FeatureInfo->intValue).c_str());
                LPCWSTR ws3 = static_cast<LPCWSTR>( strValue );
                m_edit_feature_value.SetWindowTextW(strValue);
            }
            
            if ( SV_intfIFloat == currentSelected_FeatureInfo->SVFeaturInf.type)
            {
                m_Feature_value.SetRangeMin( (int)currentSelected_FeatureInfo->SVFeaturInf.floatMin);
                m_Feature_value.SetRangeMax( (int)currentSelected_FeatureInfo->SVFeaturInf.floatMax);
                m_Feature_value.SetPos( (int)currentSelected_FeatureInfo->doubleValue);

                const CString  strValue(to_string (currentSelected_FeatureInfo->doubleValue).c_str());
                LPCWSTR ws3 = static_cast<LPCWSTR>( strValue );
                m_edit_feature_value.SetWindowTextW(strValue);
            }
            
            if (m_Feature_value.GetRangeMax() >=0 )
            {
                m_Feature_value.ShowWindow(SW_NORMAL);
            }
            m_edit_feature_value.ShowWindow(SW_NORMAL);
        }
        
        if(SV_intfIString == currentSelected_FeatureInfo->SVFeaturInf.type )
        {
            const CString s( ( currentSelected_FeatureInfo->strValue));
            LPCWSTR ws = static_cast<LPCWSTR>( s );

            m_string_value.Clear();
            m_string_value.SetWindowTextW(ws);
            m_string_value.ShowWindow(SW_NORMAL);
        }

        if(  SV_intfICommand == currentSelected_FeatureInfo->SVFeaturInf.type )
        {
            const CString  strValue(currentSelected_FeatureInfo->SVFeaturInf.name);
            LPCWSTR ws3 = static_cast<LPCWSTR>( strValue );
            m_command.SetWindowTextW(ws3);
            m_command.ShowWindow(SW_NORMAL);
        }

        if( SV_intfIEnumeration == currentSelected_FeatureInfo->SVFeaturInf.type )
        {
            for (int j =0; j <currentSelected_FeatureInfo->SVFeaturInf.enumCount;j++)
            {
                char subFeatureName[SV_STRING_SIZE] = {0};
                int ret =  SVFeatureEnumSubFeatures(currentSelected_FeatureInfo->hRemoteDevice, currentSelected_FeatureInfo->hFeature, j,subFeatureName, SV_STRING_SIZE);

                const CString  strValue(subFeatureName);
                LPCWSTR ws3 = static_cast<LPCWSTR>( strValue );
                m_enumeration.AddString(ws3);

                if ( j ==currentSelected_FeatureInfo->SVFeaturInf.enumSelectedIndex )
                    m_enumeration.SetCurSel( j);
            }

            m_enumeration.ShowWindow(SW_NORMAL);
        }

        if (SV_intfIBoolean == currentSelected_FeatureInfo->SVFeaturInf.type )
        {
            m_enumeration.AddString(L"False");
            m_enumeration.AddString(L"True");

            if (currentSelected_FeatureInfo->booValue)
                m_enumeration.SetCurSel( 1);
            else
                m_enumeration.SetCurSel(0);

            m_enumeration.ShowWindow(SW_NORMAL);
        }
    }
    *pResult = 0;
}

void CSVCamSampleDlg::OnBnClickedQuit()
{
    isQuitting = true;
    if (currentSelected_Camera) // &&   currentSelected_Camera->sv_cam_type != TL_CL)
    {
        for (vector <SVCamFeaturInf*>::iterator it  = currentSelected_Camera->sv_cam_feature->featureInfolist.begin();it != currentSelected_Camera->sv_cam_feature->featureInfolist.end(); ++it )
        {
            currentSelected_Camera->sv_cam_feature->UnRegisterInvalidateCB((*it)->hFeature);
        }
    }

    //Close the streaming of the selected camera
    OnBnClickedStopStream();
    PostMessage(WM_QUIT,0,NULL);
}

void CSVCamSampleDlg::OnEnEditFeatureString()
{
    DWORD_PTR data =  m_feature_tree.GetItemData(selectedItem);
    SVCamFeaturInf *currentSelected_Featur =  ((SVCamFeaturInf *)data);
    CString d;
    m_string_value.GetWindowTextW(d);
    CStringW cstrMyString(d);
    const size_t newsizew = (cstrMyString.GetLength() + 1) * 2;
    char *nstringw = new char[newsizew];
    size_t convertedCharsw = 0;
    wcstombs_s(&convertedCharsw, nstringw, newsizew, cstrMyString, _TRUNCATE);
    SVFeatureSetValueString(currentSelected_Featur->hRemoteDevice,currentSelected_Featur->hFeature,nstringw );
    delete nstringw;
    UpdateTreeItem (selectedItem);
}

void CSVCamSampleDlg::OnBnUpdateFeatureTree()
{
    if (currentSelected_Camera)
    {
        for (vector <SVCamFeaturInf*>::iterator it = currentSelected_Camera->sv_cam_feature->featureInfolist.begin(); it != currentSelected_Camera->sv_cam_feature->featureInfolist.end(); ++it)
        {
            currentSelected_Camera->sv_cam_feature->UnRegisterInvalidateCB((*it)->hFeature);
        }
    }

    UpdateFeatureTree();
}

BOOL CSVCamSampleDlg::PreTranslateMessage(MSG* pMsg)
{
    if( pMsg->message == WM_KEYDOWN )
    {
        if(pMsg->wParam == VK_RETURN)// || pMsg->wParam == VK_ESCAPE)
        {
            DWORD_PTR data =  m_feature_tree.GetItemData(selectedItem);
            SVCamFeaturInf *currentSelected_Featur =  ((SVCamFeaturInf *)data);

            if ( currentSelected_Featur->SVFeaturInf.type ==  SV_intfIString)
                OnEnEditFeatureString();

            if (currentSelected_Featur->SVFeaturInf.type ==  SV_intfIFloat || currentSelected_Featur->SVFeaturInf.type ==  SV_intfIInteger )
                OnEnFeatureEdit();

            return TRUE; // Do not process further
        }
    }

    return CWnd::PreTranslateMessage(pMsg);
}

void CSVCamSampleDlg::OnBnClickedStopStream()
{
    if (currentSelected_Camera)
    {
        if ( !currentSelected_Camera->sv_cam_acq->acqTerminated)
        {
            BeginWaitCursor();
            if (!terminated)
            {
                terminated = true;
                WaitForSingleObject(m_acquisitionstopThread, INFINITE);
            }
            ResetEvent(m_acquisitionstopThread);

            // clear display
            ShowImage(Display, 600, 600, display_Data);
            m_frame_id.SetWindowTextW(L" ");


            // Allocate a RGB buffer if needed
            // Delete additional RGB buffer if needed
            if (ImageData_RGB != NULL)
            {
                GlobalFree(ImageData_RGB);
                ImageData_RGB = NULL;
            }

            // Delete additional mono buffer if needed
            if (ImageData_MONO != NULL)
            {
                GlobalFree(ImageData_MONO);
                ImageData_MONO = NULL;
            }

            // Stop streaming of the currently selected camera
            currentSelected_Camera->sv_cam_acq->AcquisitionStop();

            EndWaitCursor();
            m_start_stream.ShowWindow(SW_SHOWNORMAL);
            m_stop_stream.ShowWindow(SW_HIDE);
        }
        //invalidate the currently selected feature.
        m_edit_feature_value.ShowWindow(SW_HIDE);
        m_Feature_value.ShowWindow(SW_HIDE);
        m_command.ShowWindow(SW_HIDE);
        m_enumeration.ShowWindow(SW_HIDE);
        m_string_value.ShowWindow(SW_HIDE);
        m_current_feature.ShowWindow(SW_HIDE);
    }
}

void CSVCamSampleDlg::OnBnClickedStartStream()
{
    if (currentSelected_Camera)
    {
        //if (currentSelected_Camera->sv_cam_type == TL_CL)
        //	return;
        if (currentSelected_Camera && (currentSelected_Camera->sv_cam_acq->acqTerminated))
        {
            terminated = false;
            m_thread = AfxBeginThread(DisplayThreadfunction, this);
            BeginWaitCursor();

            currentSelected_Camera->sv_cam_acq->AcquisitionStart(4);
            m_start_stream.ShowWindow(SW_HIDE);
            m_stop_stream.ShowWindow(SW_SHOWNORMAL);

            EndWaitCursor();
            //invalidate the currently selected feature.
            m_edit_feature_value.ShowWindow(SW_HIDE);
            m_Feature_value.ShowWindow(SW_HIDE);
            m_command.ShowWindow(SW_HIDE);
            m_enumeration.ShowWindow(SW_HIDE);
            m_string_value.ShowWindow(SW_HIDE);
        }
    }
}

void CSVCamSampleDlg::OnCbnSelchangeVisibility()
{
    int sl = m_feature_visibility.GetCurSel();
    currentFeatureVisibility = ( SV_FEATURE_VISIBILITY) sl;

    HTREEITEM hRoot = this->m_feature_tree.GetRootItem();

    while ( hRoot = m_feature_tree.GetNextVisibleItem(hRoot))
    {
        UpdateTreeItem (hRoot);
    }
    UpdateFeatureTree();
}



void CSVCamSampleDlg::OnCbnSelchangeCam()
{
    size_t  bufcount = 4;
    int sl = m_cam.GetCurSel();
	char * tl_id = tlIDList.at(sl);
	SVCamSystem *svcam = GetSVCamSystem(sv_cam_sys_list, tl_id);
	SV_DEVICE_INFO *devinf = (SV_DEVICE_INFO*)m_cam.GetItemDataPtr(sl);
	if (currentSelected_Camera)
    {
        for (vector <SVCamFeaturInf*>::iterator it = currentSelected_Camera->sv_cam_feature->featureInfolist.begin(); it != currentSelected_Camera->sv_cam_feature->featureInfolist.end(); ++it)
        {
            currentSelected_Camera->sv_cam_feature->UnRegisterInvalidateCB((*it)->hFeature);
        }
    }
    
    OnBnClickedStopStream();
    isQuitting = true;

    if (OpenSelectedCam(svcam, devinf))
    {
        GetDlgItem(m_stop_stream.GetDlgCtrlID())->EnableWindow(TRUE);
        GetDlgItem(m_start_stream.GetDlgCtrlID())->EnableWindow(TRUE);
    }

}

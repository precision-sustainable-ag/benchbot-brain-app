
import numpy as np
import cv2
import time


im_height = 9528
im_width = 13376
packed_img = cv2.imread("packed_865495866105.tiff")

# print(packed_img.shape, packed_img.size)
# print("\n")
# for i in range(5):
#     for j in range(5):
#         print(packed_img[50+i,34+j])

# layer1 = packed_img[:,:,0]
# layer2 = packed_img[:,:,1]
# layer3 = packed_img[:,:,2]
# print(layer1.shape)
# print(np.array_equal(layer1, layer2))
# print(np.array_equal(layer2, layer3))


# unpack 12 bit image to 16 bit

layer1 = packed_img[:,:,0]
nparray = layer1.reshape((int(im_height*im_width*1.5))).astype(np.uint16)
nparray_16bit = np.empty(im_width*im_height, dtype=np.uint16)

nparray_16bit[::2] = (nparray[::3] << 4) | (nparray[1::3] & 0b00001111)
nparray_16bit[1::2] = nparray[2::3] | ((nparray[1::3] & 0b11110000) << 4)
nparray_unpacked = nparray_16bit.reshape((im_height, im_width))<<4

# print(nparray_16bit[50], nparray_unpacked[0,50])
# print(nparray_16bit[550], nparray_unpacked[0,550])

# print(nparray_unpacked.shape, nparray_unpacked.size, nparray_unpacked.dtype)
# print(np.max(layer1), np.max(nparray_16bit), np.max(nparray_unpacked))

# cv2.imwrite('unpack_out.png', nparray_unpacked,  [cv2.IMWRITE_PNG_COMPRESSION, 0])



from colour_demosaicing import demosaicing_CFA_Bayer_Malvar2004

# nparray = np.fromfile('sdk_865495866105.RAW', dtype=np.uint16).astype(np.uint16)
# nparray_unpacked = nparray.reshape((im_height, im_width))

image_data = (nparray_unpacked).astype(np.float32)/65535.

colour_image_gamma_adjusted = demosaicing_CFA_Bayer_Malvar2004(image_data, "RGGB")
colour_image_gamma_adjusted[colour_image_gamma_adjusted<0] = 0
colour_image_gamma_adjusted[colour_image_gamma_adjusted>1] = 1
    
demosaiced = cv2.cvtColor(colour_image_gamma_adjusted.astype(np.float32), cv2.COLOR_RGB2BGR)
cv2.imwrite('test_out_org.png', (demosaiced*65535).astype(np.uint16),  [cv2.IMWRITE_PNG_COMPRESSION, 0])

interface ImagePreviewProps {
  imagePreview: Blob | null;
  imageErrMsg?: string;
}

export default function ImagePreview({
  imagePreview,
  imageErrMsg,
}: ImagePreviewProps) {
  return (
    <div style={{ width: "400px", paddingLeft: "20px" }}>
      {imagePreview ? (
        <img
          src={imagePreview ? URL.createObjectURL(imagePreview) : ""}
          alt={"Image not available"}
        />
      ) : (
        <p style={{ color: "red" }}> Error: {imageErrMsg} </p>
      )}
    </div>
  );
}

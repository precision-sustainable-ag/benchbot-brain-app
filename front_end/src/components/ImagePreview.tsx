import Button from "./Button";

interface ImagePreviewProps {
  status: "pending" | "success" | "error";
  imagePreview: Blob | null;
  imageErrMsg: string;
  retry: () => void;
  showRetry?: boolean;
}

export default function ImagePreview({
  status,
  imagePreview,
  imageErrMsg,
  retry,
  showRetry = true,
}: ImagePreviewProps) {
  return (
    <div style={{ width: "400px", paddingLeft: "20px" }}>
      <img
        src={imagePreview ? URL.createObjectURL(imagePreview) : ""}
        alt={"Image not available"}
        style={{ width: "400px" }}
      />
      {status === "pending" && <div>Loading...</div>}
      {status === "error" && (
        <div>
          <p style={{ color: "red" }}> Error: {imageErrMsg} </p>
          {showRetry && <Button name="Retry" onClick={retry} />}
        </div>
      )}
    </div>
  );
}

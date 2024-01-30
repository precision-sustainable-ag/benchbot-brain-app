import Button from "./Button";

interface ImagePreviewProps {
  status: "pending" | "success" | "error";
  imagePreview: Blob | null;
  imageErrMsg: string;
  retry: () => void;
}

export default function ImagePreview({
  status,
  imagePreview,
  imageErrMsg,
  retry,
}: ImagePreviewProps) {
  return (
    <div style={{ width: "400px", paddingLeft: "20px" }}>
      {status === "pending" && <div>Loading...</div>}
      {status === "success" && (
        <img
          src={imagePreview ? URL.createObjectURL(imagePreview) : ""}
          alt={"Image not available"}
          style={{ width: "400px" }}
        />
      )}
      {status === "error" && (
        <div>
          <p style={{ color: "red" }}> Error: {imageErrMsg} </p>
          <Button name="Retry" onClick={retry} />
        </div>
      )}
    </div>
  );
}

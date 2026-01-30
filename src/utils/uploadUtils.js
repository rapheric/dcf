import { message } from "antd";

const API_BASE_URL =
  import.meta.env?.VITE_APP_API_URL || "http://localhost:5000";

export const uploadFileToBackend = async (
  file,
  checklistId,
  documentId,
  documentName,
  category
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("checklistId", checklistId);
  formData.append("documentId", documentId);
  formData.append("documentName", documentName);
  formData.append("category", category);

  try {
    const response = await fetch(`${API_BASE_URL}/api/uploads`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    message.error(error.message || "File upload failed");
    throw error;
  }
};

export const handleDeleteFile = async (doc, docs, setDocs, docIdx) => {
  if (!doc.uploadData) {
    message.error("No upload found");
    return;
  }

  const confirm = window.confirm(`Delete "${doc.name}"?`);
  if (!confirm) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/uploads/${doc.uploadData._id}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (result.success) {
      const newDocs = [...docs];
      newDocs[docIdx] = {
        ...newDocs[docIdx],
        uploadData: null,
        fileUrl: null,
      };
      setDocs(newDocs);
      message.success("Deleted!");
    } else {
      message.error(result.error || "Delete failed");
    }
  } catch (error) {
    message.error("Delete error: " + error.message);
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
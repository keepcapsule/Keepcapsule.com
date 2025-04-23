// src/utils/storage.js
const API_BASE = "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod"; // replace with your deployed URL

export const getFilesFromS3 = async (email) => {
  const res = await fetch(
    `${API_BASE}/files?email=${encodeURIComponent(email)}`
  );
  const data = await res.json();
  return data.files || [];
};

export const deleteFileFromS3 = async (email, fileKey) => {
  const res = await fetch(
    `${API_BASE}/files?email=${encodeURIComponent(
      email
    )}&key=${encodeURIComponent(fileKey)}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Failed to delete");
};

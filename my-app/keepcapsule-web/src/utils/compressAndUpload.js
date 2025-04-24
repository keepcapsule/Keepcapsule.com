import imageCompression from "browser-image-compression";

// Compress image before uploading
export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (err) {
    console.error("Compression failed:", err);
    return file; // fallback
  }
};

export const compressAndUploadFile = async (file, email) => {
  try {
    const compressed = await compressImage(file);

    const formData = new FormData();
    formData.append("file", compressed, file.name); // ⚠️ this ensures filename is preserved
    formData.append("email", email);

    const res = await fetch(
      "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    // Wait for a second to ensure the file is processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = await res.json();
    return {
      success: res.ok,
      filename: data.filename || file.name,
      message: data.message,
    };
  } catch (err) {
    console.error("Upload failed:", err);
    return { success: false, message: err.message };
  }
};

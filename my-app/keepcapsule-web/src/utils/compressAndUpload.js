export const compressAndUploadFile = async (file, email) => {
  const isImage = file.type.startsWith("image/");

  let finalFile = file;

  if (isImage) {
    try {
      const imageCompression = await import("browser-image-compression");
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      finalFile = await imageCompression.default(file, options);
    } catch (err) {
      console.error("Compression failed:", err);
      return { success: false, message: "Image compression failed" };
    }
  }

  const formData = new FormData();
  formData.append("file", finalFile);
  formData.append("email", email);

  try {
    const res = await fetch(
      "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Upload failed:", err);
    return { success: false, message: err.message || "Upload error" };
  }
};

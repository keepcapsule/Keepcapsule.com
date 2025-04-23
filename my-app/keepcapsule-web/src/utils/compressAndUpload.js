import imageCompression from "browser-image-compression";

export const compressAndUploadFile = async (file, email) => {
  try {
    let finalFile = file;

    if (file.type.startsWith("image/")) {
      finalFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });
    }

    const formData = new FormData();
    formData.append("file", finalFile);
    formData.append("email", email);

    const res = await fetch(
      "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Upload failed");

    return { success: true, filename: finalFile.name };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

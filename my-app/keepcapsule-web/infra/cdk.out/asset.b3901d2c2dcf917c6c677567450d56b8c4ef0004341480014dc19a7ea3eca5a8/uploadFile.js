const AWS = require("aws-sdk");
const Busboy = require("busboy");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucketName = process.env.BUCKET_NAME;

  return new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: event.headers,
    });

    let uploadEmail = "";
    let uploadedFilename = "";
    let fileBuffer = Buffer.from([]);
    let contentType = "";

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      uploadedFilename = filename;
      contentType = mimetype; // ✅ Preserve original file type correctly

      file.on("data", (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });
    });

    busboy.on("field", (fieldname, value) => {
      if (fieldname === "email") {
        uploadEmail = value;
      }
    });

    busboy.on("finish", async () => {
      try {
        const key = `${uploadEmail}/${uploadedFilename}`;

        await s3
          .putObject({
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType, // ✅ Ensure correct Content-Type
          })
          .promise();

        resolve({
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
          },
          body: JSON.stringify({
            success: true,
            filename: uploadedFilename,
          }),
        });
      } catch (error) {
        console.error("Upload failed:", error);
        resolve({
          statusCode: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
          },
          body: JSON.stringify({
            success: false,
            message: error.message,
          }),
        });
      }
    });

    busboy.write(
      Buffer.from(event.body, event.isBase64Encoded ? "base64" : "binary")
    );
    busboy.end();
  });
};

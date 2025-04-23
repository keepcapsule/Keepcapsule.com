const AWS = require("aws-sdk");
const Busboy = require("busboy");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3();

exports.handler = async (event) => {
  const BUCKET = process.env.BUCKET_NAME;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
      body: "OK",
    };
  }

  const contentType =
    event.headers["Content-Type"] || event.headers["content-type"];

  const busboy = new Busboy({ headers: { "content-type": contentType } });

  return new Promise((resolve, reject) => {
    const files = [];

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const key = `uploads/${uuidv4()}-${filename}`;
      const uploadParams = {
        Bucket: BUCKET,
        Key: key,
        Body: file,
        ContentType: mimetype,
      };

      s3.upload(uploadParams, (err, data) => {
        if (err) reject(err);
        else {
          files.push({ fileName: filename, s3Key: key });
        }
      });
    });

    busboy.on("finish", () => {
      resolve({
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // ✅ CORS fix
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify(files[0]),
      });
    });

    busboy.write(
      Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
    );
    busboy.end();
  });
};

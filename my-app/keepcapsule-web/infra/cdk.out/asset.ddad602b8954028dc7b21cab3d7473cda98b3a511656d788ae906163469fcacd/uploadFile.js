const AWS = require("aws-sdk");
const Busboy = require("busboy");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3();

exports.handler = async (event) => {
  const boundary =
    event.headers["Content-Type"] || event.headers["content-type"];
  const busboy = new Busboy({ headers: { "content-type": boundary } });

  return new Promise((resolve, reject) => {
    const files = [];
    let email = "";

    busboy.on("field", (fieldname, value) => {
      if (fieldname === "email") {
        email = value;
      }
    });

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const key = `${email}/${uuidv4()}-${filename}`;
      const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: mimetype,
      };

      s3.upload(uploadParams, (err, data) => {
        if (err) reject(err);
        else files.push({ fileName: filename, s3Key: key });
      });
    });

    busboy.on("finish", () => {
      resolve({
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // ✅ Enable CORS
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

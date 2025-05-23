// uploadFile.js
const AWS = require("aws-sdk");
const Busboy = require("busboy");
const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const bucketName = process.env.BUCKET_NAME;
  const tableName = process.env.METADATA_TABLE;

  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: event.headers });

    let uploadEmail = "";
    let originalFilename = "";
    let fileBuffer = Buffer.from([]);
    let contentType = "";
    let title = "";

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      originalFilename = filename;
      contentType = mimetype;
      file.on("data", (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });
    });

    busboy.on("field", (fieldname, value) => {
      if (fieldname === "email") uploadEmail = value;
      if (fieldname === "title") title = value;
    });

    busboy.on("finish", async () => {
      try {
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${originalFilename}`;
        const key = `${uploadEmail}/${uniqueFilename}`;

        await s3
          .putObject({
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
          })
          .promise();

        const type = contentType.startsWith("image/") ? "photo" : "document";

        await dynamo
          .put({
            TableName: tableName,
            Item: {
              email: uploadEmail,
              filename: uniqueFilename,
              size: fileBuffer.length,
              timestamp: new Date().toISOString(),
              type,
              title: title || originalFilename,
            },
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
            filename: uniqueFilename,
          }),
        });
      } catch (err) {
        console.error("Upload error:", err);
        resolve({
          statusCode: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
          },
          body: JSON.stringify({
            success: false,
            message: err.message,
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

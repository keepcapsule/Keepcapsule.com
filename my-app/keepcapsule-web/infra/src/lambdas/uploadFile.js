const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const Busboy = require("busboy");

const BUCKET_NAME = process.env.BUCKET_NAME;
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  const busboy = Busboy({ headers: event.headers });
  return new Promise((resolve, reject) => {
    let email = "",
      fileBuffer = Buffer.from([]),
      fileName = "",
      fileMime = "",
      fileType = "";

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      fileName = filename;
      fileMime = mimetype;
      file.on("data", (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });
    });

    busboy.on("field", (fieldname, value) => {
      if (fieldname === "email") email = value;
      if (fieldname === "type") fileType = value;
    });

    busboy.on("finish", async () => {
      try {
        const key = `${email}/${Date.now()}-${fileName}`;
        await s3
          .putObject({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: fileMime,
          })
          .promise();

        await dynamodb
          .put({
            TableName: TABLE_NAME,
            Item: {
              id: key,
              email,
              fileName,
              fileType,
              uploadedAt: new Date().toISOString(),
            },
          })
          .promise();

        resolve({
          statusCode: 200,
          headers: corsHeaders(),
          body: JSON.stringify({ message: "Upload successful", fileName }),
        });
      } catch (err) {
        console.error(err);
        reject({
          statusCode: 500,
          headers: corsHeaders(),
          body: JSON.stringify({
            message: "Upload failed",
            error: err.message,
          }),
        });
      }
    });

    const buffer = Buffer.from(
      event.body,
      event.isBase64Encoded ? "base64" : "utf8"
    );
    busboy.end(buffer);
  });
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
}

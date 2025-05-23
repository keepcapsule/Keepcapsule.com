const AWS = require("aws-sdk");
const Busboy = require("busboy");

const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const bucketName = process.env.BUCKET_NAME;
  const tableName = process.env.METADATA_TABLE;

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
      contentType = mimetype;

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
        // 1. Get current user usage
        const existing = await dynamo
          .query({
            TableName: tableName,
            KeyConditionExpression: "email = :e",
            ExpressionAttributeValues: {
              ":e": uploadEmail,
            },
          })
          .promise();

        const totalUsed = existing.Items.reduce((sum, f) => sum + f.size, 0);
        const maxAllowed = 5 * 1024 * 1024 * 1024; // 5GB

        if (totalUsed + fileBuffer.length > maxAllowed) {
          return resolve({
            statusCode: 403,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({
              success: false,
              message: "Storage limit exceeded. Upgrade required.",
            }),
          });
        }

        // 2. Upload to S3
        const key = `${uploadEmail}/${uploadedFilename}`;
        await s3
          .putObject({
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
          })
          .promise();

        // 3. Record metadata
        await dynamo
          .put({
            TableName: tableName,
            Item: {
              email: uploadEmail,
              filename: uploadedFilename,
              size: fileBuffer.length,
              timestamp: new Date().toISOString(),
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

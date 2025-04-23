const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const BUCKET_NAME = process.env.BUCKET_NAME;
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const { fileName, fileContent, email } = JSON.parse(event.body);

  const buffer = Buffer.from(fileContent, "base64");

  const s3Key = `${email}/${Date.now()}-${fileName}`;

  await s3
    .putObject({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: "application/octet-stream",
    })
    .promise();

  await dynamodb
    .put({
      TableName: TABLE_NAME,
      Item: {
        id: s3Key,
        email,
        fileName,
        uploadedAt: new Date().toISOString(),
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "File uploaded successfully", fileName }),
  };
};

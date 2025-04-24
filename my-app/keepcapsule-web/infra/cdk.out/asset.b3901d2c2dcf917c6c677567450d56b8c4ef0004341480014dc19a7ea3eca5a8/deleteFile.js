const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters;
    const email = queryParams?.email;
    const filename = queryParams?.filename;

    if (!email || !filename) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Missing email or filename" }),
      };
    }

    const key = `${email}/${filename}`;

    await s3
      .deleteObject({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      .promise();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "File deleted successfully" }),
    };
  } catch (err) {
    console.error("Delete failed:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Failed to delete file" }),
    };
  }
};

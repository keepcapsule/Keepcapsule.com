const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const email = event.queryStringParameters?.email;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
      body: "",
    };
  }

  if (!email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Email required" }),
    };
  }

  try {
    const list = await s3
      .listObjectsV2({
        Bucket: process.env.BUCKET_NAME,
        Prefix: `uploads/`, // If you want to filter by prefix
      })
      .promise();

    const files = list.Contents.filter((item) => item.Key.includes(email)).map(
      (file) => file.Key.split("/").pop()
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ files }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

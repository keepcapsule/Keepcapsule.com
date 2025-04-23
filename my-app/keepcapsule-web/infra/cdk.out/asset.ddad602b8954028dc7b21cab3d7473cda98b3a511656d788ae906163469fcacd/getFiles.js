const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const email = event.queryStringParameters?.email;

  if (!email) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Missing email" }),
    };
  }

  try {
    const list = await s3
      .listObjectsV2({
        Bucket: process.env.BUCKET_NAME,
        Prefix: `${email}/`,
      })
      .promise();

    const files = list.Contents.map((obj) => obj.Key.replace(`${email}/`, ""));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" }, // ✅ Add CORS
      body: JSON.stringify({ files }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" }, // ✅ Add CORS
      body: JSON.stringify({ error: err.message }),
    };
  }
};

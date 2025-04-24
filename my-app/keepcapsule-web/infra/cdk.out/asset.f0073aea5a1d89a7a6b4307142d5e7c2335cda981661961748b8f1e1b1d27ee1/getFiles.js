const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const email = event.queryStringParameters?.email;
  if (!email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: "Missing email" }),
    };
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Prefix: `${email}/`,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map((item) =>
      item.Key.replace(`${email}/`, "")
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ files }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

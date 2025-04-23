const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async () => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Prefix: "uploads/",
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map((obj) => obj.Key.replace("uploads/", ""));
    return {
      statusCode: 200,
      body: JSON.stringify({ files }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

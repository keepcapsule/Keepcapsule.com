const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const email = event.queryStringParameters?.email;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Email is required" }),
    };
  }

  const result = await dynamodb
    .query({
      TableName: TABLE_NAME,
      IndexName: "email-index", // If using GSI
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ files: result.Items }),
  };
};

const AWS = require("aws-sdk");
const crypto = require("crypto");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  const { email } = JSON.parse(event.body);

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Email is required" }),
    };
  }

  const query = await dynamodb
    .scan({
      TableName: USERS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    })
    .promise();

  const user = query.Items[0];
  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "User not found" }),
    };
  }

  const token = crypto.randomBytes(20).toString("hex");
  const expiresAt = Date.now() + 1000 * 60 * 15;

  await dynamodb
    .update({
      TableName: USERS_TABLE,
      Key: { customerId: user.customerId },
      UpdateExpression: "SET resetToken = :token, resetExpires = :expiresAt",
      ExpressionAttributeValues: {
        ":token": token,
        ":expiresAt": expiresAt,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Reset token generated",
      token,
      email: user.email,
      customerId: user.customerId,
    }),
  };
};

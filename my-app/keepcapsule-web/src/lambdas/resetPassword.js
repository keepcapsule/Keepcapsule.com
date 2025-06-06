const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  const { customerId, token, password } = JSON.parse(event.body);

  if (!customerId || !token || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing fields" }),
    };
  }

  const result = await dynamodb
    .get({
      TableName: USERS_TABLE,
      Key: { customerId },
    })
    .promise();

  const user = result.Item;
  if (
    !user ||
    !user.resetToken ||
    user.resetToken !== token ||
    Date.now() > user.resetExpires
  ) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid or expired token" }),
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await dynamodb
    .update({
      TableName: USERS_TABLE,
      Key: { customerId },
      UpdateExpression:
        "SET password = :hashed REMOVE resetToken, resetExpires",
      ExpressionAttributeValues: {
        ":hashed": hashedPassword,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Password reset successful" }),
  };
};

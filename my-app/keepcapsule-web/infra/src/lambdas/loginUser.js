const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  try {
    const { email, password } = JSON.parse(event.body);

    console.info("LOGIN attempt for:", email);
    console.info("ENV: USERS_TABLE =", USERS_TABLE);

    const result = await dynamodb
      .query({
        TableName: USERS_TABLE,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
      .promise();

    const user = result.Items[0];

    if (!user) {
      console.info("❌ No user found");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.info("Password match:", isMatch);

    if (!isMatch) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Incorrect password" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        customerId: user.customerId,
        email: user.email,
      }),
    };
  } catch (error) {
    console.error("🔥 LOGIN ERROR:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Server error" }),
    };
  }
};

// src/lambdas/registerUser.js
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");

const dynamo = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  try {
    const { email, password, customerId } = JSON.parse(event.body);

    if (!email || !password || !customerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await dynamo
      .put({
        TableName: USERS_TABLE,
        Item: {
          customerId,
          email,
          password: hashedPassword,
          subscriptionId: "stripe_signup",
          status: "active",
          storageUsed: 0,
          totalStorage: 5000000000,
          warned4GB: false,
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (err) {
    console.error("Registration error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Server error", error: err.message }),
    };
  }
};

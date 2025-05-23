const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const tableName = process.env.METADATA_TABLE;
  const email = event.queryStringParameters?.email;

  if (!email) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Missing email parameter" }),
    };
  }

  try {
    const data = await dynamo
      .query({
        TableName: tableName,
        KeyConditionExpression: "email = :e",
        ExpressionAttributeValues: {
          ":e": email,
        },
      })
      .promise();

    const files = data.Items.map((item) => ({
      filename: item.filename,
      title: item.title || item.filename,
      type: item.type || "document",
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ files }),
    };
  } catch (err) {
    console.error("DynamoDB error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Failed to fetch files." }),
    };
  }
};

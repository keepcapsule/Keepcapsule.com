const fs = require("fs");
const path = require("path");
const { handler } = require("./uploadFile");

const imagePath = path.resolve(__dirname, "../../../src/assets/mind_gone.jpg"); // 👈 resolves to your image

const fileContent = fs.readFileSync(imagePath);

const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
const contentType = `multipart/form-data; boundary=${boundary}`;

const event = {
  headers: {
    "content-type": contentType,
  },
  body: [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="mind_gone.jpg"',
    "Content-Type: image/jpeg",
    "",
    fileContent,
    `--${boundary}--`,
    "",
  ].join("\r\n"),
  isBase64Encoded: false,
};

handler(event)
  .then((res) => {
    console.log("✅ Upload result:", res);
  })
  .catch((err) => {
    console.error("❌ Upload error:", err);
  });

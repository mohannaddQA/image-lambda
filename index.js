"use strict";
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.imageProcessor = async (event, context) => {
  const s3Bucket = event.Records[0].s3.bucket.name;
  const s3Key = event.Records[0].s3.object.key;
  const s3Size = event.Records[0].s3.object.size;

  let imageData = [];
  const s3Response = await s3
    .getObject({ Bucket: s3Bucket, Key: "images.json" })
    .promise();

  if (s3Response.Body) {
    imageData = JSON.parse(s3Response.Body.toString());
  }

  const existingImageIndex = imageData.findIndex((img) => img.name === s3Key);

  if (existingImageIndex !== -1) {
    imageData[existingImageIndex].size = s3Size;
  } else {
    imageData.push({ name: s3Key, size: s3Size });
  }

  await s3
    .putObject({
      Bucket: s3Bucket,
      Key: "images.json",
      Body: JSON.stringify(imageData),
      ContentType: "application/json",
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify("Image processed successfully."),
  };
};

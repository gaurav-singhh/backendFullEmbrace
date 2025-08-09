import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (file) => {
  // Configure Cloudinary inside the function to ensure env variables are loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!file) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log(
              "Cloudinary upload: File has been uploaded successfully. URL:",
              result.url
            );
            resolve(result);
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error); // Log the full error
    return null;
  }
};

export { uploadOnCloudinary };

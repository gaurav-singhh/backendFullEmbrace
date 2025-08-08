import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  // Configure Cloudinary inside the function to ensure env variables are loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!localFilePath) {
      // console.log("Cloudinary upload: No local file path provided.");
      return null;
    }
    //upload the file on cloudinary
    console.log(
      `Cloudinary upload: Attempting to upload file from: ${localFilePath}`
    );
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    console.log(
      "Cloudinary upload: File has been uploaded successfully. URL:",
      response.url
    );
    fs.unlinkSync(localFilePath); // Deleting local file after successful upload
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error); // Log the full error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    }
    return null;
  }
};

export { uploadOnCloudinary };

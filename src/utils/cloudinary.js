import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { extractPublicId } from 'cloudinary-build-url'
cloudinary.config({ 
    cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`, 
    api_key: `${process.env.CLODINARY_API_KEY}`, 
    api_secret: `${process.env.CLOUDINARY_API_SECRET}` // Click 'View API Keys' above to copy your API secret
});
    
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) throw "File Path not correct"
        //uploading file to cloudinary
       const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto"
       })
       // file uploaded successfully
       //console.log("File Uploaded successfully on cloudinary",response.url )
    fs.unlinkSync(localFilePath)
    console.log(response)
       return response
    }catch(error) {
        fs.unlinkSync(localFilePath) // remove the locally save temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async(imageUrl) => {
    try {
        if(!imageUrl) throw "Image Url not correct"
        const publicId = extractPublicId(imageUrl)
        const response = await cloudinary.uploader.destroy(publicId)
        console.log("File deleted successfully from cloudinary",response )
        return response
    }catch(error) {
        return error;
    }
}

const deleteVideoFromCloudinary = async (cloudUrl) => {
    try {
      // Extract the public ID from the URL
      const publicId = extractPublicId(cloudUrl)
  
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
      console.log("Deleted:", result);
  
      return result;
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

export {uploadOnCloudinary,deleteFromCloudinary,deleteVideoFromCloudinary}

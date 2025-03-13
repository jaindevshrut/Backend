import { v2 as cloudinary } from 'cloudinary'
import fs from fs

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
       console.log("File Uploaded successfully on cloudinary",response.url )
       return response
    }catch(error) {
        fs.unlinkSync(localFilePath) // remove the locally save temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}

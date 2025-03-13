import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req,res)=>{
    // get the details of the user from frontend
    // validate - field is empty or not
    // check if the user already exists or not : username, email
    // check for images
    // upload to cloudinary
    // create user object - create entry in db 
    // remove password and refresh token field from response
    // check for user creation 
    // return response

    const {fullName, username, email, password} = req.body
    console.log(req.body)
    if([fullName, username, email, password].some((field) => field?.trim()==="")){
        throw new ApiError(400,"All Fields are required")
    }
    
    const existingUser = await User.findOne({
        $or :[ { username }, { email } ]
    })
    if(existingUser){
        throw new ApiError(409,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath || !coverImageLocalPath){
        throw new ApiError(400,"Avataris required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    }) 

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser){
        throw new ApiError(500,"Something went worng while creating a user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})

export {registerUser}
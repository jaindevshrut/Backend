import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false}) // isme validation nahi chaiye kyuki we know what we are doing
        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating tokens")
    }
}

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
    if(
        [fullName, username, email, password].some((field) => field?.trim()==="")
    )
    {
        throw new ApiError(400,"All Fields are required")
    }
    
    const existingUser = await User.findOne({
        $or :[ { username }, { email } ]
    })
    if(existingUser){
        throw new ApiError(409,"User already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath 
    let coverImage = null
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    if (!avatarLocalPath) {
 
        throw new ApiError(400, "Avatar file is required")
 
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
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

const loginUser = asyncHandler(async (req,res)=>{
    // check username / email
    // check the user exists or not
    // check if the password is correct or not
    // check if the refresh token match or not
    // create access and refresh token
    // send cookies
    // return response

    const {email,username, password} = req.body
    console.log(req.body)


    if (!(username||email)){
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or :[ { username }]
    })

    if (!user){
        throw new ApiError(404,"User not found")
    }
    // isme ham User use nhi karege kyuki jo method hamne banayi h vo user ke liye h User hame mongodb ka mongoose se milta ha
    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect){
        throw new ApiError(401,"Password is incorrect")
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const cookieOptions = {
        httpOnly: true,
        secure: true
    } // this will to modify the cookies from the server side only (frontend se modify not possible)
    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },"User logged in successfully")
    )
})


const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )
    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"User logged out successfully")) 
})

export {registerUser, 
    loginUser,
    logoutUser
}

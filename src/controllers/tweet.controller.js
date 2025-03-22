import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body
    if(!content || content.trim() === ""){
        throw new ApiError(400,"Content is required")
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
    return res
    .status(201)
    .json(new ApiResponse(201,tweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params
    if(!isValidObjectId(userId) || userId.trim() === ""){
        throw new ApiError(400,"Invalid User Id")
    }
    const tweets = await Tweet.find({owner:userId}).select("-owner")
    if(!tweets){
        throw new ApiError(404,"Tweets Not Found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"User tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params
    const {text} = req.body
    if(!text?.trim()){
        throw new ApiError(400,"Tweet text is required")
    }
    if(!tweetId?.trim() || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet Id") 
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet Not Found")
    }
    if(req.user?._id.toString() !== Tweet.owner?.toString()){
        throw new ApiError(403,"You are not allowed to update this tweet")
    }

    tweet.content = text

    try{
        const saveStatue = await tweet.save()
        return res
        .status(200)
        .json(new ApiResponse(200,tweet,"Tweet updated successfully"))
    }
    catch(error){
        throw new ApiError(500,"Failed to update tweet")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    if(!isValidObjectId(tweetId) || tweetId.trim() === ""){
        throw new ApiError(400,"Invalid Tweet Id")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet Not Found")
    }
    if(req.user._id.toString() !== tweet.owner.toString()){
        throw new ApiError(403,"You are not allowed to delete this tweet")
    }
    try {
        const deletedTweet = await Tweet.findByIdAndDelete(tweet._id);
        if (!deletedTweet) {
            throw new ApiError(404, "Tweet not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
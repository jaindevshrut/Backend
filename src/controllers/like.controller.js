import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video not found for which user is liking")
    }
    const like = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })
    if(like){
        const unLiked = await Like.findByIdAndDelete(like._id)
        if(!unLiked){
            throw new ApiError(500,"Failed to unlike video")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Unliked successfully"))
    }
    const liked = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })
    if(!liked){
        throw new ApiError(500,"Failed to like video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,liked,"Liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Comment not found for which user is liking")
    }
    const like = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })
    if(like){
        const unLiked = await Like.findByIdAndDelete(like._id)
        if(!unLiked){
            throw new ApiError(500,"Failed to unlike comment")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Unliked successfully"))
    }
    const liked = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })
    if(!liked){
        throw new ApiError(500,"Failed to like comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,liked,"Liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet not found for which user is liking")
    }
    const like = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })
    if(like){
        const unLiked = await Like.findByIdAndDelete(like._id)
        if(!unLiked){
            throw new ApiError(500,"Failed to unlike tweet")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Unliked successfully"))
    }
    const liked = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })
    if(!liked){
        throw new ApiError(500,"Failed to like tweet")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,liked,"Liked successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match : {
                likedBy: req.user?._id,
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
    ])
    if(likedVideos?.length === 0){
        throw new ApiError(404,"No liked videos found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,likedVideos,"Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
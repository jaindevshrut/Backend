import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;


  const videoCount = await Video.aggregate([
      {
          $match: { owner: new mongoose.Types.ObjectId(userId) },
      },
      {
          $group: {
              _id: null, // Group everything together
              totalViews: { $sum: "$views" },
              totalVideos: { $sum: 1 },
          },
      },
      {
          $project: {
              _id: 0,
              totalVideos: 1,
              totalViews: 1,
          },
      },
  ]);

  const subscribersCount = await Subscription.aggregate([
      {
          $match: { channel: new mongoose.Types.ObjectId(userId) },
      },
      {
          $group: {
              _id: null,
              totalSubscribers: { $sum: 1 },
          },
      },
      {
          $project: { _id: 0, totalSubscribers: 1 },
      },
  ]);


  const likeCount = await Like.aggregate([
      {
          $lookup: {
              from: "videos",
              localField: "video",
              foreignField: "_id",
              as: "videoInfo",
          },
      },
      { $unwind: "$videoInfo" }, 
      {
          $match: {
              "videoInfo.owner": new mongoose.Types.ObjectId(userId),
          },
      },
      {
          $group: {
              _id: null,
              totalLikes: { $sum: 1 },
          },
      },
      {
          $project: { _id: 0, totalLikes: 1 },
      },
  ]);

  const info = {
      totalViews: videoCount[0]?.totalViews || 0,
      totalVideos: videoCount[0]?.totalVideos || 0,
      totalSubscribers: subscribersCount[0]?.totalSubscribers || 0,
      totalLikes: likeCount[0]?.totalLikes || 0,
  };

  return res.status(200).json(new ApiResponse(200, info, "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id
    const videos = await Video.aggregate([{
        $match: {
            owner : new mongoose.Types.ObjectId(channelId)
        }
    }])
    if(videos.length === 0){
        throw new ApiError(404,"No videos found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,videos,"Videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }
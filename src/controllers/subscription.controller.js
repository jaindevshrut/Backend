import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id")
    }
    const subscriberId = req.user?._id
    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    })
    if(subscription){
        const unScribe = await Subscription.findByIdAndDelete(subscription._id)
        if(!unScribe){
            throw new ApiError(500,"Failed to unsubscribe")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Unsubscribed successfully"))
    }
    const subscribe = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId
    })
    if(!subscribe){
        throw new ApiError(500,"Failed to subscribe")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,subscribe,"Subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id")
    }
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project:{
                "subscriber.password": 0,
                "subscriber.email": 0,
                "subscriber.createdAt": 0,
                "subscriber.updatedAt": 0,
                "subscriber.watchHistory": 0,
                "subscriber.coverImage": 0,
                "subscriber.refreshToken": 0,
            }
        }
    ])
    if(subscribers.length === 0){
        throw new ApiError(404,"No Subscribers found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,subscribers,"Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid Subscriber Id")
    }
    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project:{
                "channel.password": 0,
                "channel.email": 0,
                "channel.createdAt": 0,
                "channel.updatedAt": 0,
                "channel.watchHistory": 0,
                "channel.coverImage": 0,
                "channel.refreshToken": 0,
            }
        }
    ])
    if(channels.length === 0){
        throw new ApiError(404,"No Subscriptions found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,channels,"Subscriptions fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
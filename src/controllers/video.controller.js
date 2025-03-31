import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteVideoFromCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    // steps
    // use match for query on the basis of title or description or i think we can do channel also
    // perfom lookup for the user details for the video like username, avatar, etc
    // project the details of the user
    // use sort to sort the videos
    // for pagination use page and limit to calculate skip and limit

    const videos = await Video.aggregate([
      // match stage for filtering
      {
        $match: {
          $or: [
            { title: { $regex: query || "", $options: "i" } },
            { description: { $regex: query || "", $options: "i" } },
          ],
        },
      },
      // lookup to fetch owner details
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [
            {
              $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          createdBy: {
            $first: "$createdBy",
          },
        },
      },
      // project required details
      {
        $project: {
          thumbnail: 1,
          videoFile: 1,
          title: 1,
          description: 1,
          createdBy: 1,
        },
      },
      // sorting
      {
        $sort: {
          [sortBy]: sortType === "asc" ? 1 : -1,
        },
      },
      //pagination
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    

    return res
      .status(200)
      .json(new ApiResponse(200, videos[0]? videos[0]:[], "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if (!title || !description) {
      throw new ApiError(400, "Give all details of the video");
    }   
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path; 
    if (!videoFileLocalPath) {
      throw new ApiError(400, "Video file is required");
    }   
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail is required");
    }   
    let videoFile;
    try {
      videoFile = await uploadOnCloudinary(videoFileLocalPath);
      
    } catch (error) {
      console.log("Error uploading video ", error);
      throw new ApiError(500, "Failed to upload video");
    }   
    let thumbnailFile;
    try {
      thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
      
    } catch (error) {
      console.log("Error uploading thumbnail ", error);
      throw new ApiError(500, "Failed to upload thumbnail");
    } 
    try{
      const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id,
      });   
      if (!video) {
        throw new ApiError(500, "Something went wrong while uploading a video");
      } 
      return res
      .status(200)
      .json(new ApiResponse(200, video, "Video uploaded successfully"));
    }
    catch(error){
      if(videoFile){
        await deleteVideoFromCloudinary(videoFile.public_id)
      }
      if(thumbnailFile){
        await deleteFromCloudinary(thumbnailFile.public_id)
      }
      throw new ApiError(500, "Something went wrong while uploading a video");
    }

    
    
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const video = await Video.findById(videoId)
    video.views = video.views + 1
    await video.save()
    if(!video){
        throw new ApiError(404,"Video Not Found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path; 


  if (!thumbnailLocalPath && !title && !description) {
      throw new ApiError(400, "Fields are required");
  }

  let thumbnail = null;

  if (thumbnailLocalPath) {
      thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      if (!thumbnail?.url) {
          throw new ApiError(400, "Error while uploading Cover Image");
      }
  }

  const video = await Video.findById(videoId).select("-videoFile");
  if (!video) {
      throw new ApiError(404, "Video Not Found");
  }

  if (req.user._id.toString() !== video.owner.toString()) {
      throw new ApiError(403, "You are not allowed to update this video");
  }

  // Delete previous thumbnail only if a new one is uploaded
  if (thumbnail?.url) {
      await deleteFromCloudinary(video.thumbnail);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
          $set: {
              thumbnail: thumbnail?.url || video.thumbnail,
              title: title || video.title,
              description: description || video.description,
          },
      },
      { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedVideo, "Details updated successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video Not Found")
    }
    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(403,"You are not allowed to delete this video")
    }
    await Video.findByIdAndDelete(videoId)
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video Not Found")
    }
    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(403,"You are not allowed to update this video")
    }
    video.isPublished = !video.isPublished
    await video.save()
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
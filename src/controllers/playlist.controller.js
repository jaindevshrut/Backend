import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400,"Fields are required")
    }
    const existingPlaylist = await Playlist.findOne({
        name,
        owner: req.user?._id,
    });

    if (existingPlaylist) {
        throw new ApiError(400, "A playlist with this name already exists");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    if (!playlist) {
        throw new ApiError(400, "There was an error while creating playlist");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(400, "No user ID or Invalid user ID");
    }
  
    const userPlaylists = await Playlist.aggregate([
      //match the owner's all playlists
      {
        $match: {
          owner: mongoose.Types.ObjectId(userId),
        },
      },
      // lookup for getting owner's details
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [
            // projecting user details
            {
              $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      // converting the createdBy array to an object
      {
        $addFields: {
          createdBy: {
            $arrayElemAt: ["$createdBy", 0],
          },
        },
      },
      // this lookup if for videos
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
          pipeline: [
            // further lookup to get the owner details of the video
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      fullname: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: {
                  $arrayElemAt: ["$owner", 0],
                },
              },
            },
            // this is the projection for the video level
            {
              $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                owner: 1,
              },
            },
          ],
        },
      },
      // this projection is outside at the playlist level for the final result
      {
        $project: {
          videos: 1,
          createdBy: 1,
          name: 1,
          description: 1,
        },
      },
    ]);
  
    if (!userPlaylists) {
      throw new ApiError(400, "No playlist found");
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, userPlaylists, "Playlists fetched successfully")
      );
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist Not Found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist ID")
    }
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist Not Found")
    }
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video not found in playlist")
    }
    if(req.user._id.toString() !== playlist.owner.toString()){
        throw new ApiError(403,"You are not allowed to add video to this playlist")
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video already exists in playlist")
    }
    playlist.videos.push(videoId)
    await playlist.save()
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video added successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist ID")
    }
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video ID")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist Not Found")
    }
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video not found in playlist")
    }
    if(req.user._id.toString() !== playlist.owner.toString()){
        throw new ApiError(403,"You are not allowed to remove video from this playlist")
    }
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId)
    await playlist.save()
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video removed successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate ID
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    // Find and verify playlist ownership in a single query
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist Not Found");
    }

    // Ensure user is authorized to delete
    if (!req.user?._id || req.user._id.toString() !== playlist.owner?.toString()) {
        throw new ApiError(403, "You are not allowed to delete this playlist");
    }

    // Delete in a single operation
    await Playlist.findByIdAndDelete(playlistId);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400,"Fields are required")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist Not Found")
    }
    if(req.user._id.toString() !== playlist.owner.toString()){
        throw new ApiError(403,"You are not allowed to update this playlist")
    }
    playlist.name = name.trim() || playlist.name;
    playlist.description = description.trim() || playlist.description;
    await playlist.save()
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
import mongoose from "mongoose";


const playlistSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            require:true
        },
        description:{
            type:String,
            require:true
        },
        videos:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema)
import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema({
    content : {
        type: String,
        require: true
    },
    video : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        require: true
    },
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
},{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment",commentSchema)
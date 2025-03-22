import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // bahut sare data ko page wise divide karne ke liye
const videoSchema = new mongoose.Schema({
    videFile : {
        type : String,
        required : true,
    },
    thumbnail : {
        type : String,
        required : true,
    },
    title : {
        type : String,
        required: true
    },
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description : {
        type : String,
        required : true,
    },
    duration : {
        type : Number,
        required : true,
    },
    views : {
        type : Number,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true
    }
},{timestamps: true});


videoSchema.plugin(mongooseAggregatePaginate) // this is used to paginate the data (kaha se kaha tak data de rha h)
export const Video = mongoose.model('Video', videoSchema);
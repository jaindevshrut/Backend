import mongoose from "mongoose";
import jwt from "jsonwebtoken" ;
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    watchHistory:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    username: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index: true 
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true

    },
    fullName : {
        type : String,
        required : true,
        index: true
    },
    avatar : {
        type : String, // cloudinary url
        default : "https://www.svgrepo.com/svg/452030/avatar-default",
    },
    coverImage : {
        type : String
    },
    password : {
        type : String,
        required : [true, 'Password is required'],
    },
    refreshToken : {
        type : String,
    }
},{timestamps: true});
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
    } // isme hame string hi pass krni pdti h 
    next()
}) // everytime if there is save change in the databse then it will again hash the password but we want that 
// whenever there is change in the password filed then only the password should change for this if condition is used 
// THIS IS A PRE METHOD WHICH ENCRYPTS ENCRPYT BUT WE NEED TO DECRYPT ALSO 

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model('User', userSchema);
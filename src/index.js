// require("dotenv").config({path: "../env"})
import dotenv from "dotenv"
dotenv.config({path: "../env"})
import connectDB from "./db/dbConnect.js";

connectDB()




/*
iffi function
import express from "express"
const app = express()
;(async ()=> {
    try{
        await mongoose.connect(`process.env.MONGODB_URL/${DB_NAME}`)
        app.on("error", (error)=>{
            console.error("Error: ", error)
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("Error: ", error)
        throw error
    }
})()
*/
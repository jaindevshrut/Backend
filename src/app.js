import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
})) // using for defining the origin of the request
app.use(express.json({limit: "16kb"})) // using for parsing the json data
app.use(express.urlencoded({extended: true})) // using for parsing the form data (isse ham vo %20 ya + wali cheeze jo url me hoti h usse configure kr skte h) 
app.use(express.static("public")) // using for serving the static files
app.use(cookieParser()) // using for parsing the cookies


// Routes import
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users",userRouter)

export default app
import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"


const connectDB = async ()=> {
    console.log("Connecting to DB...")
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB Connected!! Db host : ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.error("Error: ", error)
        // throw error
        // instead of throwing the error we can exit the process
        process.exit(1)
    }
}
export default connectDB
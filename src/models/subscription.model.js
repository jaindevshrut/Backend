import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema({
    subscriber : [{
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
    }],
    channel : [{
        type: mongoose.Schema.Types.ObjectId, // one to who is 'subscriber' is subscribing
        ref: "User",
    }],
},{timestamps:true});

export const Subscription = mongoose.model("Subscription",subscriptionSchema);




/* 
-----------------------------------------------------------------------------------
 _________________________
|   Subscription Schema   |  
|    __________           | 
|   |Subscriber|          |
|    _______              |
|   |Channel|             | 
|_________________________|

 Let ->
    ||----User => a,b         
    ||----Channel => yt, fb, insta
    ||
    ||
    \/
    User Model

and let a subscribe to yt,fb and c subscribe to yt,fb,insta
toh iske according subscription model me data store hoga

 ________________________  
|   Subscriber   |   a   |
|   Channel      |  yt   |
 -------------------------
|   Subscriber   |   a   |                                                      // IMPORTANT //
|   Channel      |  fb   |         ***if agr hame number of subscriber of a channel chahiye toh hame sare vo wale cahnnel select karne padege***
 -------------------------
|   Subscriber   |   c   |         ***if hame number of channel subscribed chaiye for eg. c ke liye toh hame sare subscriber c select krna padega***
|   Channel      |  yt   |
 -------------------------
|   Subscriber   |   c   |
|   Channel      |   fb  |
 -------------------------
|   Subscriber   |   c   |
|   Channel      | insta |
 -------------------------
*/
import mongoose from "mongoose";

const connectDB = async () =>{
    mongoose.connection.on('connected',() =>{
        console.log("MONGODB CONNECTED")
    })
    await mongoose.connect(process.env.MONGODB_URI as string)
}

export default connectDB;
import { config } from "dotenv";
import mongoose from "mongoose";
config()
const MongoConnection  = async () =>{
    return await mongoose
    .connect(process.env.URI)
    .then(()=>{
        console.log("Mongodb connected")
    }).catch((err)=>{
        console.log({Error:err})
    })
}
mongoose.connection.on('connected',()=>{
    console.log("Mongodb is connected")
})
mongoose.connection.on('error',(err)=>{
    console.log({Error:err.message})
})
mongoose.connection.on('disconnected',()=>{
    console.log("Mongodb is disconnected")
})
process.on('SIGINT',async()=>{
    await mongoose.connection.close()
    process.exit(0)
})
export{MongoConnection}
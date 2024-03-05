import mongoose from "mongoose";
import bcrypt from 'bcrypt'
const UserSchema = new mongoose.Schema({
  name:{
   type:String,
   unique:true,
   required:true
  },
 email:{
    type:String,
    required:true,
    lowercase:true,
    unique:true 
 },
 password:{
    type:String,
    required:true, 
 },
 iv:{
   type:String,
    required:true, 
 }
},{
    versionKey:false,
    timestamps:true
})
UserSchema.pre('save',async function(next){
        try{
          const salt = await bcrypt.genSalt(12)
         const hashedPassword = await bcrypt.hash(this.password,salt)
        this.password = hashedPassword
        next()  
      }catch(err){
             next(err)
        } 
})
UserSchema.methods.isValidPassword = async (password,hashedPassword) =>{
   try{
   return await bcrypt.compare(password,hashedPassword)
   }catch(err){
   throw  err
   }
}
const User= mongoose.model("user",UserSchema)
 export {User}
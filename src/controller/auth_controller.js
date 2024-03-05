import { User } from "../model/User.model.js";
import createHttpError from "http-errors";
import { authSchema } from "../helper/validation_schema.js";
import { signAccessToken,signRefreshToken ,verify_RefreshToken} from "../helper/jwt_helper.js";
import {client} from '../helper/init_redis.js'
import {sendMail} from '../utils/mail.js'
import {encrypt} from '../utils/encrypt.js'
import {decrypt} from '../utils/decrypt.js'
import {config} from 'dotenv'
config()
const key = process.env.ACCESS_KEY
const register = async (req, res, next) => {
  try {
    const {name, email} = req.body;
    const validation = await authSchema.validateAsync(req.body);
    
    const find_query = await User.findOne({ email: validation.email });
    if (find_query) throw createHttpError.Conflict({ Error: `The given email ${email} already exists` });
      const encryptObj = encrypt(validation.email,key)
    sendMail(email);
    const save_user = new User({
      name:name,
      email: encryptObj.encryptedemail,
      password: validation.password,
      iv:encryptObj.iv
    });
    
    await save_user.save();
    const accessToken = await signAccessToken(save_user._id);
    const refreshToken  = await signRefreshToken(save_user._id);
    res.status(200).send({ accessToken,refreshToken });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};
const login = async (req, res, next) => {
  try {
    const {name, email, password } = req.body;
    await authSchema.validateAsync(req.body);
    const user = await User.findOne({ name:name });
    if (!user) {
      throw createHttpError.NotFound("User not registered");
    }
          const decryptedemail =  decrypt(user.email,user.iv,key)
          if(email != decryptedemail.email){
      throw createHttpError.NotFound("User not registered");
          }
    const isValidPassword = await user.isValidPassword(password, user.password);
    if (isValidPassword) {
      const accessToken = await signAccessToken(user._id);
      const refreshToken = await signRefreshToken(user._id);
      res.status(200).send({ accessToken, refreshToken });
    } else {
   
      throw createHttpError.Unauthorized("Username/Password not valid");
    }
  } catch (err) {

    if (err.isJoi === true) {
      return next(createHttpError.BadRequest());
    }
 
    next(err);
  }
};

const refreshToken = async(req,res,next)=>{
  try{
  const {refreshToken} = req.body
  if(!refreshToken) throw createHttpError.BadRequest()
  const userId = await verify_RefreshToken(refreshToken)
   const refToken= await signAccessToken(userId);
  const accessToken =  await signRefreshToken(userId);     
  res.send({accessToken,refToken}) 
}
  catch(err){
       next(err)
  }
}
const logout = async (req,res,next) =>{
try{
  const {refreshToken} = req.body
  if(!refreshToken) throw createHttpError.BadRequest()
    const userId = await verify_RefreshToken(refreshToken)
    client.del(userId,(err,value)=>{
       if(err) {
        throw createHttpError.InternalServerError()
      }
      res.sendStatus(204)
      })
  }
catch(err){
  next(err)
}
}
const decryptController = async (req,res,next) => {
  try{
      const document = await User.findById(req.query._id)
      console.log(document);
      if(!document) throw createHttpError.NotFound()
     const decryptedData =  decrypt(document.email,document.iv,key)
    res.status(200).send(decryptedData)
  }catch(err){
  next(err)
  }
}
export { register,login ,refreshToken,logout,decryptController};

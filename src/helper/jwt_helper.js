import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import {config} from "dotenv"
import {client} from './init_redis.js'
config()
const signAccessToken = (userId) =>{
      return new Promise ((resolve,reject)=>{
         const payload = {}
         const secret  = process.env.ACCESS_TOKEN_SECRET
          jwt.sign(payload,secret,{expiresIn:"1h",issuer:"ayushjagtap.com",audience:userId.toString(),algorithm:"HS256"},(err,token)=>{
                      if(err) {
                        console.log(err.message)
                        reject(createHttpError.InternalServerError())
                      }
                      resolve(token)
           })
      })
 }
const verify_AccessToken = async (req,res,next) =>{
    try{
     const authHeader = req.headers['authorization']
     if(!authHeader) throw createHttpError.Unauthorized()
   const Bearer = authHeader.split(" ")
if(Bearer[0] != "Bearer" )  throw createHttpError.Unauthorized()
const  token = Bearer[1]
        jwt.verify( token,process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
            if(err){
                if(err.name == 'JsonWebTokenError') {
                    throw  createHttpError.Unauthorized()
                }
                if (err.name === 'TokenExpiredError') {
                    throw createHttpError.Unauthorized();
                }
            }
            req.payload = decode
            next()    
        
        })
    }catch(err){
          next(err)
}
}
const signRefreshToken = (userId) =>{
    return new Promise ((resolve,reject)=>{
       const payload = {}
       const secret  = process.env.REFRESH_TOKEN_SECRET
        jwt.sign(payload,secret,{expiresIn:"1y",issuer:"ayushjagtap.com",audience:userId.toString(),algorithm:"HS256"},async (err,token)=>{
                    if(err) {
                      console.log(err.message)
                      reject(createHttpError.InternalServerError())
                    }
                    client.SET(userId.toString(), token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                        if (err) {
                            reject(createHttpError.InternalServerError());
                        }
                        if (reply === 'OK') {
                            resolve(token);
                        } else {
                            reject(createHttpError.InternalServerError());
                        }
                    });
         })
    })
}
const verify_RefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return reject(createHttpError.Unauthorized());
            }

            const userId = payload.aud;

            client.GET(userId, (err, storedToken) => {
                if (err) {
                    return reject(createHttpError.InternalServerError());
                }
                if (storedToken !== refreshToken) {
                    return reject(createHttpError.Unauthorized());
                }
                resolve(userId);
            });
        });
    });
};


export {
    signAccessToken,
    verify_AccessToken,
    signRefreshToken,
    verify_RefreshToken
}
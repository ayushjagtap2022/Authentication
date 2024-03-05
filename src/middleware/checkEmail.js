import axios from 'axios';
import {config} from 'dotenv'
config()
const checkEmail = async (req,res,next) =>{
    const options = {
      method: 'GET',
      url: 'https://validect-email-verification-v1.p.rapidapi.com/v1/verify',
      params: {
        email: req.body.email
      },
      headers: {
        'X-RapidAPI-Key': process.env.CHECK_EMAIL_APIKEY,
        'X-RapidAPI-Host': process.env.RAPID_API_HOST
      }
    };
    try {
      const response = await axios.request(options);
       if(response.data.status=='invalid'){
        res.status(401).send({Error:"Enter a valid Email"})
       }else{
        next()
       }
    } catch (error) {
    next(error)
    }
    
  }
  export {checkEmail};
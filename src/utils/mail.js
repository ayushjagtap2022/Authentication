import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import {config} from 'dotenv'
config()
const sendMail = async (email) => {
  try {
      const refreshToken = process.env.REFRESH_TOKEN;
      const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
        );
        oAuth2Client.setCredentials({ refresh_token: refreshToken });
        
        const accessToken = await oAuth2Client.getAccessToken();
        
        const Transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken,
          },
        });
        
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Registration',
          text: 'Thank you for creating an account in Gamepower. We are excited to have you on board!',
          html: '<h2>Thank you for creating an account in Gamepower</h2><p>We are excited to have you on board!</p>',
        };
        

        const result = await Transport.sendMail(mailOptions);
        return result;
      } catch (error) {
        throw error;
      }
};

export {sendMail}

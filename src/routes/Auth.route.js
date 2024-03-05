import Express  from "express";
import {register,login,refreshToken,logout,decryptController}  from "../controller/auth_controller.js"
import {verify_AccessToken} from '../helper/jwt_helper.js'
import {checkEmail} from '../middleware/checkEmail.js'
const router = Express.Router()

router.post('/register',checkEmail,register)
router.post('/login',login)
router.post('/refreshtoken',verify_AccessToken,refreshToken)
router.get('/decrypt',decryptController)
router.delete('/logout',logout)
export default router
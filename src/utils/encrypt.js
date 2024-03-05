import  crypto from 'crypto';

function encrypt(email, key) {
    const iv = crypto.randomBytes(16); 
    const cipheremail = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedemail = cipheremail.update(email, 'utf8', 'hex');
    encryptedemail += cipheremail.final('hex');
    return {encryptedemail, iv: iv.toString('hex') };
}

export  { encrypt };

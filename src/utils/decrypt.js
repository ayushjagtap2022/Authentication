import  crypto from 'crypto';


function decrypt(encryptedemail,iv, key) {
    const ivBuffer = Buffer.from(iv, 'hex');

   

    const cipheremail = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
    let decryptedemail = cipheremail.update(encryptedemail, 'hex', 'utf8');
    decryptedemail += cipheremail.final('utf8');

    return {email: decryptedemail };
}

export  { decrypt };

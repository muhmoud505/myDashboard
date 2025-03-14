import nodemailer from 'nodemailer'

let email="mahmoudhesham99199@gmail.com";
let password="lrzyndgtesbslnjn"
// const message = `
//             <a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}">Confirm Email</a>
//             `
async function sendEmail(dest , subject ,message,attachments=[]){
    try {
        const transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:email,
                pass:password
            }
        });
        let info= await transporter.sendMail({
            from: `"Route" <${email}`,
            to:dest,
            html:message,
            attachments,
            subject,
        }).catch((error)=>{
                console.log(error.message)
        })
      
    } catch (error) {
        console.log('Email Catch error');
        console.log(error);
    }
}
export default sendEmail;
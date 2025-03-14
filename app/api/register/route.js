import connectToDB from "@/database";
import User from "@/models/user";
import { hash } from "bcryptjs";
import Joi from "joi";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import sendEmail from "@/services/email";
const schema=Joi.object({
    name:Joi.string().required(),
    email:Joi.string().email().required(),
    password:Joi.string().required(),
    
})
export const dynamic='force-dynamic'

const URL= "mongodb://muhmoud_505:binary111000@muhmoud-505-shard-00-00.pitwb.mongodb.net:27017,muhmoud-505-shard-00-01.pitwb.mongodb.net:27017,muhmoud-505-shard-00-02.pitwb.mongodb.net:27017/myDashboard?ssl=true&replicaSet=atlas-bf2l3s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=myDashboard";

export async function POST(req){
    await connectToDB(URL)
    const {name,email,password,isAdmin}= await req.json();
    const {  nextUrl } = req;

    const{error}=schema.validate({name,email,password});
    if(error){
        console.log(error);
        return NextResponse.json({
            success:false,
            message:error.details[0].message
        });
    }
    try {
        const isUserAlreadyExistes=await User.findOne({email});
        if(isUserAlreadyExistes){
            return NextResponse.json({
                success:false,
                message:'User is already exists. Please try with different email'
            })
        }else{
            const hashedpassword=await hash(password,8);
        
            const newlyCreatedUser= await User.create({
                name,email,password:hashedpassword,isAdmin
            });
            if(newlyCreatedUser){
                const token=jwt.sign({userId:newlyCreatedUser._id},"fjdshjhauh5fdjhdgaf",{expiresIn:'1d'});
                let message = `
            <a href="${nextUrl.protocol}//${nextUrl.host}/api/confirmEmail/${token}">Confirm Email</a>
            `
                await sendEmail([email], 'Confirm-Email',message)
                // res.status(201).json({ message: "Done" })
                const response= NextResponse.json({
                    success: true,
                    message: 'Register successful.',
                    data: {
                    token,
                    user: {
                        id: newlyCreatedUser._id,
                        name: newlyCreatedUser.name,
                        email: newlyCreatedUser.email,
                        isAdmin: newlyCreatedUser.isAdmin,
                    },
                },
                }, { status: 200 })
        
                // Prepare the response data
                
                response.cookies.set('token',token);
                return response; 
            }
        }

    } catch (error) {
        console.log('Error while new user registeration , please try again',error.message);
        return NextResponse.json({
            success:false,
            message:'Something went wront ! Please try again later'
        })
    }
}
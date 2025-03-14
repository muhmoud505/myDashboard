import connectToDB from "@/database";
import User from "@/models/user";
import { compare } from "bcryptjs";
import Joi from "joi";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
const URL= "mongodb://muhmoud_505:binary111000@muhmoud-505-shard-00-00.pitwb.mongodb.net:27017,muhmoud-505-shard-00-01.pitwb.mongodb.net:27017,muhmoud-505-shard-00-02.pitwb.mongodb.net:27017/myDashboard?ssl=true&replicaSet=atlas-bf2l3s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=myDashboard";

const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export async function POST(req) {
    try {
        await connectToDB(URL);
        const { email, password } = await req.json();

        // Validate the request body
        const { error } = schema.validate({ email, password });
        if (error) {
            return NextResponse.json({
                success: false,
                message: error.details[0].message,
            }, { status: 400 });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Account not found with this email.',
            }, { status: 404 });
        }

        // Verify the password
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                message: 'Incorrect password.',
            }, { status: 401 });
        }

        // Check if the email is confirmed
        if (!user.confirmEmail) {
            return NextResponse.json({
                success: false,
                message: 'Please confirm your email first.',
            }, { status: 403 });
        }

        // Generate a JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                isAdmin: user.isAdmin,
                image:user.image // Use user.isAdmin instead of undefined variable
            },
            'dksjfkdsjahfuhsadgfdusuhbf', // Use environment variable for JWT secret
            { expiresIn: '1d' }
        );

        const response= NextResponse.json({
            success: true,
            message: 'Login successful.',
            data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                image:user.image
            },
        },
        }, { status: 200 })

        // Prepare the response data
        
        response.cookies.set('token',token);
        return response; 

    } catch (error) {
        console.error('Error during login:', error);
        return NextResponse.json({
            success: false,
            message: 'Something went wrong while logging in. Please try again.',
        }, { status: 500 });
    }
}
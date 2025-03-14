import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import User from "@/models/user";
import connectToDB from "@/database";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    const { token } = params; // Access the token from the URL
     
    try {
        await connectToDB();
        console.log(token)

        // Verify the token
        const decoded = jwt.verify(token, "fjdshjhauh5fdjhdgaf");
        if (!decoded?.userId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid or expired token.',
            }, { status: 400 });
        }

        // Find the user and update their email confirmation status
        const user = await User.findByIdAndUpdate(
            { _id: decoded.userId, confirmEmail: false },
            { confirmEmail: true },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found or email already confirmed.',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Email confirmed successfully!. Please return to the login page ',
        }, { status: 200 });
    } catch (error) {
        console.error('Error confirming email:', error.message);
        return NextResponse.json({
            success: false,
            message: 'Something went wrong! Please try again later.',
        }, { status: 500 });
    }
}
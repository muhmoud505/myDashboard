import connectToDB from "@/database";
import User from "@/models/user";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";
import jwt from "jsonwebtoken"; // Added missing import
import { cookies } from "next/headers";

const URL= "mongodb://muhmoud_505:binary111000@muhmoud-505-shard-00-00.pitwb.mongodb.net:27017,muhmoud-505-shard-00-01.pitwb.mongodb.net:27017,muhmoud-505-shard-00-02.pitwb.mongodb.net:27017/myDashboard?ssl=true&replicaSet=atlas-bf2l3s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=myDashboard";

const uploadMiddleware = async (req) => {
  const formData = await req.formData();
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "profilePic" && key !== "_id") {
      data[key] = key === "isAdmin" || key === "confirmEmail" ? value === "true" : value;
    }
  }
  const profilePic = formData.get("profilePic");
  if (profilePic && profilePic.size > 0) {
    const buffer = Buffer.from(await profilePic.arrayBuffer());
    return {
      data,
      file: { buffer, mimetype: profilePic.type, originalName: profilePic.name },
    };
  }
  return { data, file: null };
};

export async function PUT(request, { params }) {
  try {
    await connectToDB(URL);
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });

    const { data, file } = await uploadMiddleware(request);

    if (data.password) {
      data.password = await hash(data.password, 8);
    } else {
      delete data.password;
    }

    if (file) {
      const uploadResult = await uploadToCloudinary(file, "user");
      data.profilePic = uploadResult.url;
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updatedUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDB(URL);
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    // Get cookies from the request
    const cookieStore = await cookies(); // Removed await, cookies() is synchronous
    const token = await cookieStore.get("token")?.value;
    console.log("Token from cookie:", token || "No token found");

    if (!token) {
      console.log("No token provided in request");
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Decode the JWT token
    let requestingUserId;
    try {
      const decoded = jwt.verify(token, "dksjfkdsjahfuhsadgfdusuhbf");
      requestingUserId = decoded.userId;
      console.log("Decoded userId:", requestingUserId);
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    // Find the requesting user
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser) {
      console.log("Requesting user not found for ID:", requestingUserId);
      return NextResponse.json({ success: false, message: "Requesting user not found" }, { status: 404 });
    }

    // Check if the requesting user is an admin
    if (!requestingUser.isAdmin) {
      console.log("User is not an admin:", requestingUserId);
      return NextResponse.json({ success: false, message: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // Find the user to delete
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      console.log("User to delete not found for ID:", id);
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (requestingUserId === id) {
      console.log("Admin attempted self-deletion:", requestingUserId);
      return NextResponse.json({
        success: false,
        message: "Admins cannot delete themselves",
      }, { status: 403 });
    }

    // Prevent admin from deleting another admin
    if (userToDelete.isAdmin) {
      console.log("Admin attempted to delete another admin:", id);
      return NextResponse.json({
        success: false,
        message: "Admins cannot delete other admins",
      }, { status: 403 });
    }

    // Delete the image from Cloudinary if it exists
    if (userToDelete.imagePublicId) {
      const cloudinaryResult = await deleteFromCloudinary(userToDelete.imagePublicId);
      if (cloudinaryResult.result !== "ok") {
        console.error("Failed to delete image from Cloudinary:", cloudinaryResult);
      }
    }

    // Delete the user from the database
    await User.findByIdAndDelete(id);
    console.log("User deleted successfully:", id);

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, message: "Failed to delete user: " + error.message }, { status: 500 });
  }
}
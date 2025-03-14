import connectToDB from "@/database";
import User from "@/models/user";
import { hash } from "bcryptjs";
import Joi from "joi";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import sendEmail from "@/services/email";
import { uploadToCloudinary } from "@/utils/cloudinary";

export const dynamic = "force-dynamic";

const URL = "mongodb://muhmoud_505:binary111000@muhmoud-505-shard-00-00.pitwb.mongodb.net:27017,muhmoud-505-shard-00-01.pitwb.mongodb.net:27017,muhmoud-505-shard-00-02.pitwb.mongodb.net:27017/myDashboard?ssl=true&replicaSet=atlas-bf2l3s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=myDashboard";

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  isAdmin: Joi.boolean().default(false),
  confirmEmail: Joi.boolean().default(false),
  image: Joi.string().optional(), // Matches UserSchema
});

const uploadMiddleware = async (req) => {
  const formData = await req.formData();
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "image") {
      data[key] = key === "isAdmin" || key === "confirmEmail" ? value === "true" : value;
    }
  }
  const image = formData.get("image");
  if (image && image.size > 0) {
    const buffer = Buffer.from(await image.arrayBuffer());
    return {
      data,
      file: { buffer, mimetype: image.type, originalName: image.name },
    };
  }
  return { data, file: null };
};

export async function GET() {
  try {
    await connectToDB(URL);
    const users = await User.find().sort({createdAt:-1});
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB(URL);
    const { data, file } = await uploadMiddleware(req);
    const { nextUrl } = req;

    console.log("Data received:", data);
    console.log("File received:", file ? "Yes (size: " + file.buffer.length + ")" : "No");

    const { error } = schema.validate(data);
    if (error) {
      return NextResponse.json({ success: false, message: error.details[0].message }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists. Please try a different email.",
      }, { status: 409 });
    }

    let profilePicUrl;
    let profielPublicId;
    if (file) {
      
      const uploadResult = await uploadToCloudinary(file, "user");
      
      if (!uploadResult || !uploadResult.url) {
        return NextResponse.json({
          success: false,
          message: "Failed to upload image",
        }, { status: 500 });
      }
      profilePicUrl = uploadResult.url;
      profielPublicId = uploadResult.publicId;
      
    }
   
    const hashedPassword = await hash(data.password, 8);
    const userData = {
      ...data,
      password: hashedPassword,
      image: profilePicUrl,
      imagePublicId:profielPublicId
    };

    const newUser = await User.create(userData);
    const token = jwt.sign({ userId: newUser._id }, "fjdshjhauh5fdjhdgaf", { expiresIn: "1d" });
    const message = `
      <a href="${nextUrl.protocol}//${nextUrl.host}/api/confirmEmail/${token}">Confirm Email</a>
    `;
    await sendEmail([data.email], "Confirm Email", message);

    return NextResponse.json({
      success: true,
      message: "User created successfully. Check email for confirmation.",
      data: { token, user: newUser },
    }, { status: 201 });
  } catch (error) {
    console.error("Error in user registration:", error.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong! Please try again later." },
      { status: 500 }
    );
  }
}
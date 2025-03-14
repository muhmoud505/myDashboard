import Product from "@/models/product";
import { NextResponse } from "next/server";
import Joi from "joi";
import { uploadToCloudinary } from "@/utils/cloudinary";
import connectToDB from "@/database";

// Hardcoded Atlas URL (move to .env.local in production)
const URL = "mongodb://muhmoud_505:binary111000@muhmoud-505-shard-00-00.pitwb.mongodb.net:27017,muhmoud-505-shard-00-01.pitwb.mongodb.net:27017,muhmoud-505-shard-00-02.pitwb.mongodb.net:27017/myDashboard?ssl=true&replicaSet=atlas-bf2l3s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=myDashboard";

// Validation schemas
const initialSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  countInStock: Joi.number().required().min(0),
  // _id is not included here, we'll strip it
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  countInStock: Joi.number().required().min(0),
  image: Joi.string().required(),
  imagePublicId: Joi.string().required(),
});

const uploadMiddleware = async (req) => {
  const formData = await req.formData();
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (key !== "image" && key !== "_id") { // Ignore _id from FormData
      if (key === "price" || key === "countInStock") {
        data[key] = Number(value);
      } else {
        data[key] = value;
      }
    }
  }

  const imageFile = formData.get("image");
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    return {
      data,
      file: {
        buffer,
        mimetype: imageFile.type,
        originalName: imageFile.name,
      },
    };
  }
  return { data, file: null };
};

export async function PUT(request, { params }) {
  try {
    console.log("Connecting to:", URL); // Debug connection URL
    await connectToDB(URL);

    const { id } = await params; // Correctly await and destructure
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Product ID is required",
      }, { status: 400 });
    }

    const { data, file } = await uploadMiddleware(request);

    console.log("Data received for update:", data);
    console.log("File received:", file ? "Yes (size: " + file.buffer.length + ")" : "No");

    const { error: initialError } = initialSchema.validate(data);
    if (initialError) {
      return NextResponse.json({
        success: false,
        message: initialError.details[0].message,
      }, { status: 400 });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        message: "Product not found",
      }, { status: 404 });
    }

    let productData = { ...data };

    if (file) {
      const uploadResult = await uploadToCloudinary(file);
      console.log("Cloudinary result:", uploadResult);

      if (!uploadResult || !uploadResult.url || !uploadResult.publicId) {
        return NextResponse.json({
          success: false,
          message: "Failed to upload image: Invalid response from Cloudinary",
        }, { status: 500 });
      }

      productData.image = uploadResult.url;
      productData.imagePublicId = uploadResult.publicId;
    }

    console.log("Updated product data:", productData);

    const { error } = (file ? productSchema : initialSchema).validate(productData);
    if (error) {
      console.error("Validation error:", error.details[0].message);
      return NextResponse.json({
        success: false,
        message: error.details[0].message,
      }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update product: " + error.message,
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    console.log("Connecting to:", URL); // Debug connection URL
    await connectToDB(URL);

    const { id } = await params; // Correctly await and destructure
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Product ID is required",
      }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: "Product not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete product: " + error.message,
    }, { status: 500 });
  }
}
import connectToDB from "@/database";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import Joi from "joi";
import { uploadToCloudinary } from "@/utils/cloudinary";

// Use environment variable for MongoDB URL (more secure)
const URL= "mongodb://muhmoud_505:binary111000@muhmoud-505-shard-00-00.pitwb.mongodb.net:27017,muhmoud-505-shard-00-01.pitwb.mongodb.net:27017,muhmoud-505-shard-00-02.pitwb.mongodb.net:27017/myDashboard?ssl=true&replicaSet=atlas-bf2l3s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=myDashboard";

// Validation schemas
const initialSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  countInStock: Joi.number().required().min(0),
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

// Middleware for parsing FormData and uploading image
const uploadMiddleware = async (req) => {
  const formData = await req.formData();
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (key !== "image") {
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

// GET: Fetch all products
export async function GET() {
  try {
    await connectToDB(URL);
    const products = await Product.find().sort({createdAt:-1});
    return NextResponse.json({
      success: true,
      data: products,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch products: " + error.message,
    }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(request) {
  try {
    await connectToDB(URL);
    const { data, file } = await uploadMiddleware(request);

    console.log("Data received:", data);
    console.log("File received:", file ? "Yes (size: " + file.buffer.length + ")" : "No");

    const { error: initialError } = initialSchema.validate(data);
    if (initialError) {
      return NextResponse.json({
        success: false,
        message: initialError.details[0].message,
      }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({
        success: false,
        message: "Image file is required",
      }, { status: 400 });
    }

    const uploadResult = await uploadToCloudinary(file,type="product");
    console.log("Cloudinary result:", uploadResult);

    if (!uploadResult || !uploadResult.url || !uploadResult.publicId) {
      return NextResponse.json({
        success: false,
        message: "Failed to upload image: Invalid response from Cloudinary",
      }, { status: 500 });
    }

    const productData = {
      ...data,
      image: uploadResult.url,
      imagePublicId: uploadResult.publicId,
    };

    console.log("Final product data:", productData);

    const { error } = productSchema.validate(productData);
    if (error) {
      console.error("Validation error:", error.details[0].message);
      return NextResponse.json({
        success: false,
        message: error.details[0].message,
      }, { status: 400 });
    }

    const existingProduct = await Product.findOne({ name: productData.name });
    if (existingProduct) {
      return NextResponse.json({
        success: false,
        message: "A product with this name already exists",
      }, { status: 409 });
    }

    const newProduct = await Product.create(productData);
    return NextResponse.json({
      success: true,
      data: newProduct,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create product: " + error.message,
    }, { status: 500 });
  }
}



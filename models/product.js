import mongoose from "mongoose";


const productSchema=new mongoose.Schema({
    name:{type:String,unique:true},
    slug:{type:String, unique:true},
    brand:{type:String},
    category: { type: String }, // ✅ Ensure this is a String
    description:{type:String,},
    price:{type:Number, },
    countInStock:{type:Number, default:1},
    rating:{type:Number,default:0},
    numReviews:{type:Number,default:0},
    image: { type: String },
    imagePublicId: {
        type: String,
      },



},{
    timestamps:true
})
const Product=mongoose.models.Product || mongoose.model('Product',productSchema);
export default Product;
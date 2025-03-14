import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    isAdmin:{type:Boolean,required:true,default:false},
    confirmEmail:{type:Boolean,default:false},
    image: { type: String },
    imagePublicId: {
        type: String,
      },


},{timestamps:true});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
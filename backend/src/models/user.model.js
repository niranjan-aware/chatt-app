import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        milLength:6
    },
    profilePic:{
        type:String,
        default:""
    }
},{
    timestamps:true
});

const User = mongoose.model('User',userSchema);
export default User;
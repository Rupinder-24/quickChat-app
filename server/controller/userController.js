import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Sign up

export const signup = async (req, res) => {
    const { fullName, email, password,bio } = req.body;

    try {
        if(!fullName || !email || !password || !bio){
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        const user=await User.findOne({ email });
        if(user){
            return res.status(400).json({ success:false, message: "User already exists" });
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            bio,
        });
        const token=generateToken(newUser._id)

        await newUser.save();
        res.status(201).json({ success:true,userData:newUser, token, message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

// login user

export const login = async (req, res) => {
    

    try {
        const { email, password } = req.body;
        
        if(!email || !password){
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        const userData=await User.findOne({ email });
        if(!userData){
            return res.status(400).json({ success:false, message: "User does not exist" });
        }
        const isPasswordValid=await bcrypt.compare(password,userData.password);
        if(!isPasswordValid){
            return res.status(400).json({ success:false, message: "Invalid password" });
        }
        const token=generateToken(userData._id);
        res.status(200).json({ success:true,userData, token, message: "Login successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

export const checkAuth=async(req,res)=>{
    res.json({success:true,user:req.user});

}

// controller to update user profile
export const updateProfile=async(req,res)=>{
    try {
        const { fullName, bio,profilePic } = req.body;
        const userId=req.user._id;

        let updateUser;

        if(!profilePic){
            updateUser=await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
        }
        else{
            const upload=await cloudinary.uploader.upload(profilePic);
            updateUser=await User.findByIdAndUpdate(userId,{
                fullName,
                bio,
                profilePic:upload.secure_url,
                
            },{new:true});
        }

        
        
        res.status(200).json({ success:true,user:updateUser, message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success:false, message: error.message });

    }
}


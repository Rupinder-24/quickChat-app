import User from "../models/User.js";
import jwt from "jsonwebtoken";



// Middleware to protect routes

export const protectRoute=async(req,res,next)=>{

    try{
    const token=req.headers.token;
    const decode=jwt.verify(token,process.env.JWT_SECRET);
    const user= await User.findById(decode.userId).select("-password");

    if(!user){
        return res.status(401).json({success:false, message: "user not found" });
    }
    req.user=user;
    next();
    }catch(error){
        return res.status(401).json({ success:false, message: error.message });
    }   
}

// controller will check if the user is authernticated or not and then allow access to the protected route

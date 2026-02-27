import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import{Server} from "socket.io";

// Create express app using http server

const app=express();
const server=http.createServer(app);

// Initialize socket.io server
export const io=new Server(server, {
    cors:{
        origin:"/",
        methods:["GET","POST","PUT","DELETE"]
    }
});

// store online users in memory
export const userSocketMap={}; // {userId: socketId}

// socket.io connection handler
io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;
    console.log("User connected:", userId);
    if(userId) userSocketMap[userId]=socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // Handle disconnection
    socket.on("disconnect",()=>{
        console.log("User disconnected:", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })

});


// Middleware
app.use(cors());
app.use(express.json({limit:"4mb"}));

app.use("/api/status",(req,res)=>res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);


await connectDB();


// Start the server
const PORT=process.env.PORT || 8000;
server.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));
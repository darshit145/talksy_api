const express=require("express");
const mongo=require("mongoose");
const app=express();
const Message = require("./user_msg");
const RecentChat=require("./recent_chates");

const http=require("http");
const path=require("path");
const{Server}=require("socket.io");


const server=http.createServer(app);
const io=new Server(server);

// Connect to MongoDB
// mongodb+srv://Darshit:t5hrAUZWaHmgIVEO@cluster0.3tn6jax.mongodb.net/
mongo.connect('mongodb+srv://Darshit:t5hrAUZWaHmgIVEO@cluster0.3tn6jax.mongodb.net/')
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));
const userLoginSchema=new mongo.Schema({
    u_email:{
        type:String,
        required:true,
        unique:true
    },
    u_name:{
        type:String,
        required:true,
    },
    u_photo:{
        type:String,
        required:true,
    },
    u_messaging:{
        type:String,
    },
    U_date_ofBirth:{
        type:String,
    },
    u_activestatus:{
        type:Number,
        default: 0
    },
    u_lastactive:{
        type:String,
    },
    u_mobileno:{
        type:String,
    },
    u_bio:{
        type:String,
    },
    u_location:{
        type:String,
    },    
},{
    timestamps:true
});


const user=mongo.model("user",userLoginSchema);

const statusCode200=200;



// this are the MiddelWare
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//List all the avaliable user 
app.get("/api/list_all_user/:id",async(req,res)=>{
    console.log(req.body);
    const result=await user.find({});
    console.log(result);
    // return res.status(statusCode200).json({"user":`${req.params.id}`});
    return res.status(statusCode200).json({result});
});
app.get("/api/list_all_user_limt/:id", async (req, res) => {
    try {
        const page = parseInt(req.params.id) || 1; // Get page number from query params (default: 1)
        const limit = 10; // Send 10 users per request
        const skip = (page - 1) * limit; // Calculate how many users to skip

        // Fetch users with pagination
        const users = await user.find({}).skip(skip).limit(limit);

        // Get total user count for frontend pagination
        const totalUsers = await user.countDocuments();

        return res.status(200).json({
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



//we handel the login and return all the information about the user
app.post("/api/login",async(req,res)=>{
    ///Login API 
    ///name,photo,email,
    ///create the TABLE of perticular user with name
    /// add on the List all User table
         try {
            // Check if a user with the same email already exists
            const existingUser = await user.findOne({ u_email: req.body.u_email });
    
            if (existingUser) {
                return res.status(statusCode200).json({ newUser: existingUser});
            }
    
            // If the user does not exist, create a new one
            const newUser = await user.create({
                u_email: req.body.u_email,
                u_name: req.body.u_name,
                u_photo: req.body.u_photo,
                u_messaging:req.body.u_messaging
            });
    
            return res.status(statusCode200).json({ newUser });
        } catch (error) {
            console.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>${error}`);
            // Check if the error is a duplicate key error (MongoDB code 11000)
            if (error.code === 11000) {
                return res.status(400).json({ message: "User already exists" });
            }
            return res.status(500).json({ message: "Internal Server Error :501" });
        }
});



//we return all the informatin about the user based on the id
app.get("/api/user/:id", async (req, res) => {
    try {
        const userId = req.params.id || req.query.id; // Handle both formats

        const userData = await user.findById(userId);
        if (!userData) return res.status(404).json({ message: "User not found" });

        return res.status(statusCode200).json(userData);
    } catch (error) {
        console.error(`Error Fetching User: ${error}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//send the Msg to the user 
app.post("/api/send_msg", async (req, res) => {
    try {
        const { msg, from, to, dateSendingTime,day} = req.body;
        if (!msg || !from || !to) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const newMessage = new Message({
            msg,
            from,
            to,
            dateSendingTime,
            day,
            readStatus: 0 // Default unread
        });
        await updateRecentChats(from, to);
        await updateRecentChats(to, from);

        await newMessage.save();
        return res.status(statusCode200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

//get the message from the table 
app.get("/api/messages/:from/:to", async (req, res) => {
    try {
        const { from, to } = req.params;

        // Fetch unread messages where sender is `from` and receiver is `to`
        const messages = await Message.find({
            $or: [
                { from: from, to: to },
                { from: to, to: from }
            ],
            readStatus: 0  
        }).sort({ createdAt: -1 });

        // this will change the message status from 0 to 1
        // which means the message is delivered to the user b
        await Message.updateMany(
            {
                $or: [
                    { from: from, to: to },
                    { from: to, to: from }
                ],
                readStatus: 0
            },
            { $set: { readStatus: 1 } }
        );

        // Update recent chats for both users


        return res.json({ success: true, messages });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

//get the message from the table first time cheack
app.get("/api/messages_all/:to", async (req, res) => {
    try {
        const { from, to } = req.params;

        // Fetch unread messages where sender is `from` and receiver is `to`
        const messages = await Message.find({
            $or: [
                { to: to },
            ],
            readStatus: 0  
        }).sort({ createdAt: -1 });

        // this will change the message status from 0 to 1
        // which means the message is delivered to the user b
        await Message.updateMany(
            {
                $or: [
                    {  to: to },
            
                ],
                readStatus: 0
            },
            { $set: { readStatus: 1 } }
        );

        // Update recent chats for both users


        return res.json({ success: true, messages });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get("/api/listchat/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the document where userId matches
        const recentChats = await RecentChat.findOne({ userId: userId }, { chatList: 1, _id: 0 });

        if (!recentChats || !recentChats.chatList || recentChats.chatList.length === 0) {
            return res.status(404).json({ message: "No recent chats found for this user" });
        }

        // Fetch user details for each userId in chatList
        const users = await user.find({ _id: { $in: recentChats.chatList } });

        return res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


// app.listen(8000,()=>{
//     console.log("SERVER start");
// })

async function updateRecentChats(userId, chatUserId) {
    try {
        // Fetch existing chat list
        let recentChat = await RecentChat.findOne({ userId });

        let updatedList = [];

        if (recentChat) {
            // Remove duplicate if chatUserId already exists
            updatedList = recentChat.chatList.filter(id => id.toString() !== chatUserId.toString());
        }

        // Add the new chat user at the beginning
        updatedList.unshift(chatUserId);

        // Keep only the last 10 users
        updatedList = updatedList.slice(0, 10);

        // Save the updated list to the database
        await RecentChat.findOneAndUpdate(
            { userId },
            { chatList: updatedList },
            { upsert: true, new: true }
        );

        console.log(`Updated recent chats for user ${userId}`);

    } catch (error) {
        console.error("Error updating recent chats:", error);
    }
}

io.on("connection",(socket)=>{
    console.log(socket.id);

    socket.on("dododo", (userId) => {
        console.log(userId);
        socket.id=userId;
    });
    
    socket.on("user-message",async(msg,from,to,day,time)=>{
        console.log(`${socket.id} from ${from} to the ${to} this is the day ${day} and this is the Time ${time}`);
        if(true){
            const newMessage = new Message({
                msg,
                from,
                to,
                dateSendingTime,
                day,
                readStatus: 0 // Default unread
            });
            await newMessage.save();
            return io.to(to).emit("message",msg);
        }
        io.emit("message",msg);
    });
});

app.use(express.static(path.resolve("./public")));
app.get("/thelivechat/",(req,res)=>{
    return res.sendFile("/public/index.html");

});
server.listen(5000)


/*
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/darshit145/talksy_api.git
git branch -M main
git push -u origin main
*/

//we have manage the chat top 10 user  
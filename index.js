const express=require("express");
const mongo=require("mongoose");
const app=express();

// Connect to MongoDB
mongo.connect('mongodb://localhost:27017/talksy_alluser')
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





app.use(express.json());
// app.use(express.urlencoded({extended:false}));
app.get("/api/list_all_user",async(req,res)=>{
    console.log(req.body);
    const result=await user.find({});
    console.log(result);
    return res.status(200).json({result});
});


app.post("/api/login",async(req,res)=>{
    ///Login API 
    ///name,photo,email,
    ///create the TABLE of perticular user with name
    /// add on the List all User table
         try {
            // Check if a user with the same email already exists
            const existingUser = await user.findOne({ u_email: req.body.u_email });
    
            if (existingUser) {
                return res.status(200).json({ message: existingUser._id });
            }
    
            // If the user does not exist, create a new one
            const newUser = await user.create({
                u_email: req.body.u_email,
                u_name: req.body.u_name,
                u_photo: req.body.u_photo,
                u_messaging:req.body.u_messaging
            });
    
            return res.status(201).json({ message: newUser._id });
        } catch (error) {
            console.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>${error}`);
            // Check if the error is a duplicate key error (MongoDB code 11000)
            if (error.code === 11000) {
                return res.status(400).json({ message: "User already exists" });
            }
            return res.status(500).json({ message: "Internal Server Error :501" });
        }
});
app.get("/api/user/:id", async (req, res) => {
    try {
        const userId = req.params.id || req.query.id; // Handle both formats

        const userData = await user.findById(userId);
        if (!userData) return res.status(404).json({ message: "User not found" });

        return res.status(200).json(userData);
    } catch (error) {
        console.error(`Error Fetching User: ${error}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



app.listen(8000,()=>{
    console.log("SERVER start");
})


/*
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/darshit145/talksy_api.git
git branch -M main
git push -u origin main
*/
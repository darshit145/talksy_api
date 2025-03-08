const express=require("express");



const app=express();



app.use(express.json());

app.get("/api/list_all_user",(req,res)=>{
    console.log(req.body);
    return res.status(200).json({"dfd":"okokookokokokok"});
});


app.post("/api/login",(req,res)=>{
    ///Login API 
    ///create the TABLE of perticular user with name
    /// add on the List all User table
    console.log(req.body);
    return res.json({"user_tocken":""});
});

app.listen(6000,()=>{
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
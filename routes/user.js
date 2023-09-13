const express=require('express');
const router=express.Router();
const User=require('../models/user');
const bcyrptjs=require('bcryptjs');

router.post('/register',async(req,res,next)=>{

    const {name,email,username,password}=req.body;
    try{

        let user_exist=await User.findOne({email:email});
        if(user_exist){
            res.json({
                success:flase,
                msg:'User already exists'
            });
        }

        let user=new User();
        user.name=name;
        user.email=email;
        user.username=username;

        const salt=await bcyrptjs.genSalt(10);
        user.password= await bcyrptjs.hash(password,salt);     //hashing the password of user for security
        let size=200;
        user.avatar="https://gravtar.com/avatar/?s="+size+'&d=retro';

        await user.save();
        res.json({
            success:true,
            msg:'User register',
            user:user,
        })


    }catch(err){

        console.log(err);
    }
});

module.exports=router;   //Importing the route into index.js
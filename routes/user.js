const express=require('express');
const router=express.Router();
const User=require('../models/user');
const bcyrptjs=require('bcryptjs');
const user_jwt=require('../middleware/user_jwt');
const jwt=require('jsonwebtoken');

router.post('/register',async(req,res,next)=>{

    const {name,email,username,password}=req.body;
    try{

        let user_exist=await User.findOne({email:email});
        if(user_exist){
            res.json({
                success:false,
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

        const payload ={

            user:{
                id:user.id
            }
        }

        jwt.sign(payload,process.env.jwtUserSecret,{

            expiresIn:360000

        },(err,token)=>{

            if(err) throw err;
            res.status(200).json({
                success:true,
                token:token
            });

        });
       


    }catch(err){

        console.log(err);
    }
});

module.exports=router;   //Importing the route into index.js
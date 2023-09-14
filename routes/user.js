const express=require('express');
const router=express.Router();
const User=require('../models/user');
const bcyrptjs=require('bcryptjs');
const user_jwt=require('../middleware/user_jwt');
const jwt=require('jsonwebtoken');


router.get('/',user_jwt,async(req,res,next)=>{

    try{

        const user=await User.findById(req.user.id).select('-password');
        res.status(200).json({

            success:true,
            user:user
        });   

    }catch(error){
        console.log(error.message);
        res.status(500).json({

            success:false,
            msg:'Server Error'
        });
        next();
    }
})

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


router.post('/login',async(req,res,next)=>{

    const email=req.body.email;            //recieving the email entered by user
    const password=req.body.password;      //recieving the password enterd by user
    try{
    
        let user=await User.findOne({
            email:email                        //finding the user with same username in database
        });
        if(!user)
        {
            res.status(400).json({
                success:false,
                msg:'User not exists go and register to continue.'
            });
        }
        const isMatch=await bcyrptjs.compare(password,user.password);     //if username is found in database,then checking if password is matching for entered input
        if(!isMatch){
    
            return res.status(400).json({
                success:false,
                msg:'Invalid password'
            });
        }
        const payload={                              //if password matched,generating jsonwebtoken
            user:{
                id:user.id
            }
        }
        jwt.sign(
            payload,process.env.jwtUserSecret,
            {
                expiresIn:360000
            },(err,token)=>{
                if(err) throw err;
    
                res.status(200).json({
                    success:true,
                    msg:'User logged in',
                    token:token,
                    user:user
    
                });
            }
         );
    } catch(error){
    
         console.log(error.message);
         res.status(500).json({
                success:false,
                msg:'Server Error'
         });
    }
    
    });

module.exports=router;   //Importing the route into index.js
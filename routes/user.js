const express=require('express');
const router=express.Router();
const User=require('../models/user');
const bcyrptjs=require('bcryptjs');

router.post('/register',(req,res,next)=>{

    res.json({
        msg:'Working'
    });
});

module.exports=router;   //Importing the route into index.js
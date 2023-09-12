const express=require('express');
const colors=require('colors');
const morgan =require('morgan');

const app=express();

app.use(morgan('dev'));
app.use(express.json({}));
app.use(express.json({
   extended:true
}))




app.listen(3000,console.log("Server is running on port 3000".red.underline.bold));
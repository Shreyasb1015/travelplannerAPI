const mongoose=require('mongoose');

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ //necessary condition for checking if it is email
        
    },
    password:{

        type:String,
        required:true
    },
    avatar:{
        type:String
    }
})

module.exports=mongoose.model('User',userSchema);   //Creating the model in database and exporting it in other file
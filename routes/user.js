const express=require('express');
const router=express.Router();
const User=require('../models/user');
const axios=require('axios');
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

router.get('/weatherupdate',async(req,res,next)=>{

    try {
            const city = req.query.city;               // Using req.query to get query parameters
            const date = new Date(req.query.date);
            const apiKey = '9251d61fe595211f2990b8464f50cbd8'; 
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`; //sending the data to api
        
            const response = await axios.get(apiUrl);                 // Make an HTTP GET request
        
            const weatherData = response.data;                       // Get the response data
        
            // Extracting the relevant weather data for the next 5 days
            const next5DaysWeather = [];
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);                  // Setting hours, minutes, seconds, and milliseconds to zero
            const uniqueDates = new Set();
        
            for (const forecast of weatherData.list) {
                const forecastDate = new Date(forecast.dt * 1000);
              
                
                if (forecastDate >= currentDate && forecastDate <= date) {
                  const formattedDate = forecastDate.toISOString().split('T')[0];
              
                  // Checking if we haven't processed data for this date yet
                  if (!uniqueDates.has(formattedDate)) {
                    uniqueDates.add(formattedDate);
              
                    // Calculating the average temperature and using the first description encountered
                    let totalTemperature = forecast.main.temp;
                    const descriptions = [forecast.weather[0].description];
              
                    // Collecting temperature and descriptions for the same day
                    for (const innerForecast of weatherData.list) {
                      const innerForecastDate = new Date(innerForecast.dt * 1000);
                      const innerFormattedDate = innerForecastDate.toISOString().split('T')[0];
              
                      if (innerFormattedDate === formattedDate) {
                        totalTemperature += innerForecast.main.temp;
                        descriptions.push(innerForecast.weather[0].description);
                      }
                    }
              
                    // Calculating the average temperature
                    const averageTemperature = totalTemperature / descriptions.length;
              
                    
                    next5DaysWeather.push({
                      date: formattedDate,
                      temperature: averageTemperature,
                      description: descriptions[0],
                    });
                  }
                }
              
                // Stop collecting data after 5 days
                if (forecastDate > date) {
                  break;
                }
              }
        
            res.status(200).json(next5DaysWeather);
      } catch (error) {
            console.error("There is an error in connecting to the API:", error);
            res.status(500).json({
            success: false,
            msg: 'Unable to connect to the API',
        });
      }
    

});

router.post('/hotelrecommend',async(req,res,next)=>{

    try {

        // Getting the user's budget and location from the request body
        const { budget, location } = req.body;
    
        
        const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;
        const geocodingResponse = await axios.get(geocodingUrl);
    
        // Extractting latitude and longitude from the geocoding response
        const [latitude, longitude] = geocodingResponse.data[0].lat.split(' ').map(parseFloat);
    
        // Making a request to url to search for hotels near the location
        const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&lat=${latitude}&lon=${longitude}&zoom=15&amenity=hotel`;
    
        
        const response = await axios.get(apiUrl);
        const hotelRecommendations = response.data.slice(0, 5);  //accepting only first 5 inputs
    
        // Extracting other relevant information from the results
        const recommendedHotels = hotelRecommendations.map((hotel) => ({
          name: hotel.display_name,
          address: hotel.address,
        }));
    
        res.status(200).json(recommendedHotels);             //sending response
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: 'Internal server error' });      

      }
    });


module.exports=router;   //Exporting all the routes into index.js
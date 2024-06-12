import dotenv from 'dotenv'
import express from 'express'
import userRoutes from './users/routes.js';
import authRoutes from './auth/routes.js'
import mongoose from 'mongoose';
import bodyParser from 'body-parser'

const app = express();
dotenv.config();

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_DB_URI)

// handling CORS error
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



app.use("/oauth",authRoutes)

//let authenticateMiddleware = authenticate(app)
//app.use(authenticateMiddleware)
app.use('/users', userRoutes);

app.use(function(req,res){
  res.sendStatus(404)
})
app.listen(process.env.PORT,()=>{
    console.log(`Server is listening at port ${process.env.PORT}`)
})


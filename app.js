//const express = require('express')
//const session = require('express-session')
//const cookieParser = require('cookie-parser')
//const path = require('path')
//const http = require('http')
//const passport = require('passport')
//const helmet = require('helmet')
//const { Issuer, Strategy} = require('openid-client')
//
//
//const app = express()
//
//app.use(cookieParser())
//app.use(express.urlencoded({extended: true}))
//
//app.set('views', path.join(__dirname,'views'))
//app.set('view engine', 'ejs')
//app.use(express.static(path.join(__dirname,'public')))
//
//app.use(session({
//    secret: 'secret',
//    resave: false,
//    saveUninitialized: true
//}))
//
//
//// helmet middleware
//app.use(helmet())
//
//// helmet middleware
//app.use(passport.initialize())
//app.use(passport.session())
//
//
//passport.serializeUser((user,done)=> {
//    console.log('-----------------------')
//    console.log('serialize user')
//    console.log(user)
//    console.log('-----------------------')
//    done(null, user)
//})
//
//passport.deserializeUser((user,done)=> {
//    console.log('-----------------------')
//    console.log('serialize user')
//    console.log(user)
//    console.log('-----------------------')
//    done(null, user)
//})
//
//Issuer.discover('http://localhost:3000/oidc').then(function (oidcIssuer){
//    var client = new oidcIssuer.Client({
//        client_id: "",
//        client_secret: "",
//        redirect_uris: ['http://localhost:8080/login/callback'],
//        response_types: ['code']
//    })
//    
//    passport.use('oidc', new Strategy({client, passReqToCallback: true},
//        (req, tokenSet, userinfo, done)=> {
//            console.log('tokenSet', tokenSet)
//            console.log('userinfo', userinfo)
//
//            req.session.tokenSet= tokenSet
//            req.session.userinfo= userinfo
//
//            return done(null, tokenSet.claims())
//        }))
//})
//
//
//app.get('/login',
//(req,res,next)=>{
//    console.log('---------------------------------')
//    console.log('Login handler started')
//    next()
//},
//passport.authenticate('oidc',{scope:'openid'}))
//
//
//app.get('/login/callback', (req,res,next)=>{
//    passport.authenticate('oidc', {
//        successRedirect: '/user',
//        failureRedirect: '/'
//    })(req,res,next)
//})
//
//app.get('/', (req,res)=>{
//    res.send(" <a href='/login'>Log In with OAuth 2.0 Provider </a>")
//})
//
//app.get('/user', (req,res)=> {
//    res.header('Content-Type', 'application/json')
//    res.end(JSON.stringify({tokenset: req.session.tokenSet, userinfo: req.session.userinfo}, null, 2))
//})
//
//const httpServer = http.createServer(app)
//
//httpServer.listen(8080, ()=>{
//    console.log('running')
//})

import * as dotenv from "dotenv";

dotenv.config();

import express from "express";

import fetch from "node-fetch";

import mongoose from "mongoose";

import jwt from "jsonwebtoken";
const mongoDBURI = process.env.MONGO_DB_URI;

mongoose.connect(mongoDBURI);

const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please provide a  name"],
      minlength: 3,
      maxlength: 56,
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email.",
      ],
      unique: true,
    },
    refresh_token: {
        type: String,
    },
    password: {
      type: String,
      minlength: 6,
      required: false,
    },
  });
  
  UserSchema.methods.generateToken = function () {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
  };
  
  const User = mongoose.model("User", UserSchema);
  
const app = express();

app.use(express.json());


const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CALLBACK_URL = "http%3A//localhost:8000/google/callback";

const GOOGLE_OAUTH_SCOPES = [

"https%3A//www.googleapis.com/auth/userinfo.email",

"https%3A//www.googleapis.com/auth/userinfo.profile",

];

app.get("/", async (req, res) => {
  const state = "some_state";
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&prompt=consent&response_type=code&state=${state}&scope=${scopes}`;
  console.log(GOOGLE_OAUTH_CONSENT_SCREEN_URL)
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});

app.get("/test", async (req, res) => {
    console.log('***********************',req, '*************',req.query)

  });
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

app.get("/google/callback", async (req, res) => {
    let email, name
  console.log(req.query);

  const { code } = req.query;
  console.log(code)

  let user = email? await User.findOne({ email }).select("-password"): null;

  const data = {
    code,

    client_id: GOOGLE_CLIENT_ID,

    client_secret: GOOGLE_CLIENT_SECRET,

    redirect_uri: "http://localhost:8000/google/callback",

    grant_type: "authorization_code",
  };

  if(user?.refresh_token) {
    data.refresh_token = user.refresh_token
    data.grant_type = 'refresh_token'
  }

  console.log(data);

  // exchange authorization code for access token & id_token

  const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
    method: "POST",

    body: JSON.stringify(data),
  });

  const access_token_data = await response.json();
  // which access_token_data contains refresh_token if we add access_type=offline&prompt=consent in GOOGLE_OAUTH_CONSENT_SCREEN_URL
  const { id_token, refresh_token } = access_token_data;


  // verify and extract the information in the id token

  const token_info_response = await fetch(
    `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
    );
    let status = token_info_response.status
    let answer = await token_info_response.json()
    //res.status(status).json(answer);
    console.log(access_token_data, '************************');
    ({ email, name } = answer);
    user = email? await User.findOne({ email }).select("-password"): null;
    console.log('here', user);
  if (!user) {
    user = await User.create({ email, name, refresh_token});
  }
  const token = user.generateToken();
  res.status(status).json({ user, token });
});


const PORT = process.env.PORT || 3000;

const start = async (port) => {
  app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`);
  });
};


start(PORT);

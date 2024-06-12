const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const users= []
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
initializePassport(passport, email => {
  return users.find(user => user.email === email)
}, 
id=> users.find(user => user.id ===id ))
app.set('view-engine','ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({secret: 'secret', resave: false, saveUninitialized: false}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.get('/', checkAuthenticated,(req, res)=>{
  res.render('index.ejs', {name: req.user.name})
})

app.get('/login',checkNotAuthenticated,(req, res)=>{
  res.render('login.ejs')
})
 
app.get('/register',checkNotAuthenticated,(req, res)=>{
  res.render('register.ejs')
})
 
app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
app.post('/register',checkNotAuthenticated, async (req, res)=>{
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch (error) {
    res.redirect('/register')
  }
})

function checkAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

app.delete('/logout',(req,res)=> {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function checkNotAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
app.listen(8080)
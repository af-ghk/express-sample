let dotenv = require('dotenv').config()
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const app = express()
const PORT = 3000

MongoClient.connect(dotenv.parsed.ATLAS_URI, (err, db) => {
  if (err) throw err
  db.collection('mammals').find().toArray((err, result) => {
    if (err) throw err
    console.log(result)
  })
})

app.get('/oauth/authorize', (req,res)=>{

})

app.post('/oauth/token', (req,res)=> {
    
})

app.listen(PORT,()=>{
    console.log(`Server is listening at port ${PORT}`)
})
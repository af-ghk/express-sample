import express from "express";

const router = express.Router()

router.get('/', function(req,res){
    res.sendStatus(200)
    console.log('users list has been called')
})


router.post('/', function(req,res){})


router.delete('/:id', function(req,res){})


router.put('/:id', function(req,res){})

export default router
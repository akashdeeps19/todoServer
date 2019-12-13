const express = require("express");
const Event = require("../data_models/eventScheme")
const router = express.Router();

let reminderData = [];
async function getReminders(){ 
    let d = [];
    await Event.find({done : false,reminded : false},(err,data)=>{
        d = data;
    });
    return d;
}

function foo(){
    return [1,2,3];
}
router.get("/",(req,res)=>{
    res.json({get : "this"});
})

router.post("/",async (req,res)=>{
    const event = new Event(req.body);
    const savedEvent = await event.save();
    if(!savedEvent.reminded)
        reminderData.push(savedEvent);
    try {
        res.send(savedEvent);
    } catch (error) {
        res.json({message : error});
    }
})

router.get("/deadlines",(req,res)=>{
    Event.find({deadline : {$gte : Date.now()}},(err,data)=>{
        if(err)res.status(500).json({message : err});
        else{
            data.sort((a,b)=>a.deadline-b.deadline);
            res.send(data);
        }
    })
});

router.get("/all",async (req,res)=>{
    const data = await Event.find().exec();
    try{
        res.send(data);  
    }
    catch(err){
        res.status(500).json({message : err});
    }
});

router.get("/todos",(req,res)=>{
    Event.find({done : false},(err,data)=>{
        if(err)res.status(500).json({message : err});
        else{
            data.sort((a,b)=>a.deadline-b.deadline);
            res.send(data);
        }
    })
});

router.get("/dones",(req,res)=>{
    Event.find({done : true},(err,data)=>{
        if(err)res.status(500).json({message : err});
        else{
            data.sort((a,b)=>a.deadline-b.deadline);
            res.send(data);
        }
    })
});

router.delete("/:id",async (req,res)=>{
    try {
        const data = await Event.deleteOne({_id : req.params.id});
        res.json(data);
    } catch (error) {
        if(err)res.status(500).json({message : error});
    }
});

router.patch('/updateDone/:id&:done',async (req,res)=>{
    try {
        const data = await Event.updateOne({_id : req.params.id},{done : req.params.done});
        res.json(data);
    } catch (error) {
        if(err)res.status(500).json({message : error});
    }
});

updateReminded = async (id)=>{
    const res = await Event.updateOne({_id : id},{reminded : true});
    console.log(res.ok);
    return res.ok;
}

module.exports.router = router;
//module.exports.ge
module.exports.reminders = {
    data : reminderData,
    getData : function(){
        rd = reminderData;
        reminderData = [];
        return rd;
    },
    getReminder : getReminders,
    updateReminded : updateReminded
};
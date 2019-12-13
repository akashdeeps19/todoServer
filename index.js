const express = require("express");
const mongo = require("mongoose");
const events = require("./Routes/events");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
require('dotenv').config();

const interval = 1000*10;
const app = express();
app.listen(4000,()=>console.log("listening at 3000"));

app.use(bodyParser.json());
app.use(cors());
app.use("/events",events.router);




let remdata = [];
let nextRem = null;
const emailid = process.env.EMAIL_ID;
const pwd = process.env.EMAIL_PASS;

mongo.connect(process.env.DB_KEY,{useNewUrlParser:true,useUnifiedTopology:true},
()=> {
        console.log("connected to db");
        getRemdb();
});
  
async function getRemdb(){
    let data = [];
    remdata = [];
    data = await events.reminders.getReminder();
    remdata = remdata.concat(data);
    if(remdata.length > 0)
        nextRem = remdata.reduce((a,b)=>{return a.reminderTime<b.reminderTime?a:b});
} 

function updateReminders(){
    let data = events.reminders.getData();
    if(data && data.length > 0){
        let minData = data.reduce((a,b)=>{return a.reminderTime<b.reminderTime?a:b});
        remdata = remdata.concat(data);
        if(!nextRem || minData.reminderTime < nextRem.reminderTime)nextRem = minData;
    }
}


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: emailid,
           pass: pwd
       },
    tls: {
        rejectUnauthorized: false
    }
});

async function wrapdSendMail(mailOptions){
    return new Promise((resolve,reject)=>{
        transporter.sendMail(mailOptions,async (err, info)=>{
            if(err){
                console.log(err);
                resolve(false);
            }
            else{
                console.log("mail sent");
                let id = nextRem._id;
                remdata.splice(remdata.indexOf(nextRem),1);
                if(remdata.length > 0)
                    nextRem = remdata.reduce((a,b)=>{return a.reminderTime<b.reminderTime?a:b});
                else nextRem = null;
                await events.reminders.updateReminded(id);
                resolve(true);
            }       
        });
    });
}
async function checkReminders(){
    if(nextRem == null){
        setTimeout(checkReminders,1000);
        return;
    }
   // console.log(nextRem.reminderTime >= Date.now())
    if(nextRem.reminderTime <= Date.now() && !nextRem.reminded && !nextRem.done){
        const mailOptions = {
            from: emailid, // sender address
            to: emailid, // list of receivers
            subject: nextRem.title, // Subject line
            text : `\n${nextRem.description}\nDEADLINE : ${nextRem.deadline.toDateString()}  ${nextRem.deadline.toTimeString()}`// plain text body
        };
        console.log("sending mail");
        await wrapdSendMail(mailOptions);
        checkReminders();
    }
    else setTimeout(checkReminders,1000);
}


setInterval(updateReminders,1000);
checkReminders();

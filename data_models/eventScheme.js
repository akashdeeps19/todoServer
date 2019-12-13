const mongo = require("mongoose");

const eventSchema = mongo.Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    deadline : Date,
    reminder : {
        type : Boolean,
        required : true
    },
    reminded : Boolean,
    reminderTime : Date,
    done : {
        type : Boolean,
        required : true 
    },
    label : String
})

module.exports = mongo.model('event',eventSchema);
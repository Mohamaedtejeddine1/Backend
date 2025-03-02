const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    timestamp: {type : Date , default: new Date},
    method : {type : String , required: true},
    url : {type : String , required: true},
    ip : {type : String , required: true},
    referer : {type : String , required: true},
    status : {type : Number , required: true},
    headers : {type : Object , required: true},
    executionTime : {type : Number , required: true},   
    result: {type : mongoose.Schema.Types.Mixed , default:null}
})

const Log = mongoose.model('Log',logSchema);
module.exports = Log;
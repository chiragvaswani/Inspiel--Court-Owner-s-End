const mongoose = require("mongoose");
const { Schema } = mongoose;

const Addslot = new Schema({
    email: {type: String},
     slots:
   { 
    startTime: {
        hours: Number,
        minutes: Number,
        am: String,
    },
    endTime: {    
        hours: Number,
        minutes: Number,
        pm: String,
    }
}
});


  const slot = mongoose.model("slot", Addslot);
  
  module.exports = slot;
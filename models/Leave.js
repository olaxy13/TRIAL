const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create levae
const LeaveSchema = new Schema ({
   user: {
     type: Schema.Types.ObjectId,
     ref: "users"
   },
   leaveType: {
     type: Schema.Types.ObjectId,
     ref: "leaveType"
   },
   employee: {
     type: Schema.Types.ObjectId,
     ref: "employee"
   },
   company: {
    type: Schema.Types.ObjectId,
    ref: "company"
  },
  from : {
     type: Date,
     required: true
  },
  to : {
    type: Date,
    required: true
  },
  number_of_days : {
    type: String
  },
  leave_reason : {
   type: String,
   required: true
  },
  email: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});
module.exports = Leave = mongoose.model("leave", LeaveSchema)
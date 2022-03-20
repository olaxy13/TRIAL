const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LeaveTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  deleted: {
    type: Boolean,
    select: false,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, 
{
  autoCreate: true,
  timestamps: true,
date: {
  type: Date,
  default: Date.now,
},
});

module.exports = LeaveType = mongoose.model('leaveType', LeaveTypeSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "company"
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true
  },
 designation: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    //select: false
  },
  password2: {
    type: String,
    required: true,
   // select: false
  }
  

});
module.exports = Employee = mongoose.model('employee', EmployeeSchema);
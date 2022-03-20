const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const UserSchema = new Schema ({
  first_name: {
      type: String,
      required: true
  },
  // company: {
  //   type: Schema.Types.ObjectId,
  //   ref: "company"
  // },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  password2: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
 phone: {
    type: Number,
    required: true
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now 
  },
  active: {
    type: Boolean,
    default: false,
},
isVerified: {
  type: Boolean,
  default: false,
},
verification_code:{
  type: String,
  required: true
},
});

module.exports = User = mongoose.model('users',UserSchema);
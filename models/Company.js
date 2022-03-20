const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema ({
   user: {
     type: Schema.Types.ObjectId,
     ref: "users"
   },
  company_name: {
     type: String,
     required: true
  },
  company_email: {
    type: String,
  },
  company_description: {
    type: String,
  },
 
  company_mission: {
    type: String,
  },
  founder: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = Company = mongoose.model("company", CompanySchema)
const sgMail = require('@sendgrid/mail');
const jwt = require("jsonwebtoken");
const Employee = require('../models/Employee');
const User = require('../models/User');

function sendEmail(email, message, subject= 'Verify Account') {
  console.log('email:', email);
  let isEmailSent = false;
  console.log('success')
  const msg = {
    to: (email instanceof Array) ? email : [email], // Change to your recipient
    from: 'okeolamide.o@gmail.com', // Change to your verified sender
    subject,
    html: `${message}`,
  }
  sgMail
    .send(msg)
    .then((res) => {
      // console.log('Email sent:!', res);
      if (res) {
        isEmailSent = true;
      }
    })
    .catch((error) => {
      console.error(error);
      isEmailSent = false;
    });
  return isEmailSent;
}

function generateToken() {
  // dice1 = Math.floor(Math.random() * 6) + 1;
  const token = Math.floor(Math.random() * 98776) * Math.floor (Math.random()* 3)+ 87645;
  // const token = 133556;
  return token;
}
async function roleChecker(req,res,next){
  const token = req.headers.authorization.substring(7,req.headers.authorization.length)
const decodeJwt = await jwt.decode(token);
if(token&&decodeJwt){
  const find_user = await User.findById(decodeJwt.id);
  console.log("find_user>>>", find_user)
  if(!find_user || find_user.is_admin !=true){
    return res.status(409)
    .json({ msg : "you cannot perform this function please contact admin"})
  }else{
    return next();
  }
}
}
async function bothChecker(req,res,next){
  const token = req.headers.authorization.substring(7,req.headers.authorization.length)
const decodeJwt = await jwt.decode(token);
if(token&&decodeJwt){

  const find_employee = await Employee.findById(decodeJwt.employee);
  console.log('find employee>>>>>>>', find_employee.email)
  if(!find_employee || find_employee.isVerified != true) {
    return res.status(409).json({ msg: "you cannot perform this function go to the admin for support"})
  }else {
     return next();
  }
}else{
  return res.json('invalid token')
}
}
module.exports = {
  sendEmail: sendEmail,
  generateToken: generateToken,
  roleChecker: roleChecker,
  bothChecker: bothChecker
};

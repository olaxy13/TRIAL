const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const passport = require("passport");
const jwt = require('jsonwebtoken');
const keys = require('../../config/key') //we pass in the key we dont want in our code to config

// Load Company model
const User = require("../../models/User");
const Company = require("../../models/Company");

//Load leave validation 
const companyValidation = require("../../validation/company");
const { sendEmail, roleChecker } = require("../../helper");
// @router POST api/create leave/test
// @desc Create 
// @access Private
router.post("/", passport.authenticate("jwt", { session: false }), roleChecker,(req, res, next)=> {
  const { errors, passed } = companyValidation(req.body);
  // check profile validation.

  if (!passed) {
    return res.status(404).json(errors);
  }
   // check if company already exists
  const {company_name, company_email} = req.body;
  Company.findOne({company_name,company_email})
  .then((company) => {
    if (company) {
      return res.status(400).json({status: false, message: 'Company already exist'});
    }
  const newCompany = new Company ({ 
    company_name: req.body.company_name,
    company_description: req.body.company_description,
    company_email: req.body.company_email,
    number_of_employees: req.body.number_of_employees,
    company_mission: req.body.company_mission,
    founder: req.body.founder,
    user: req.user.id,

  })
          newCompany
          .save()
          .then((company) => {
            res.json(company);
          })
        })
        .catch((err) => {
          res.status(404).json(err);
      })
 
  }
);


// // @route   GET api/Company/all
// // @desc    Get all Companys
// // @access  Public
router.get("/all", (req, res) => {
  Company.find()
     .populate("users", ["first_name", "last_name", "company_name"])
    .then((company) => {
      if (!company) {
        return res.status(404).json("There are no company Yet");
      }

      res.json(company);
    })
    .catch((err) => res.status(404).json({ company: "There are no Company" }));
});

// // @route Edit api/Company/:id
// // @desc Edit Company route
// // @access Private
router.put("/edit/:id", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  const { errors, passed } = companyValidation(req.body); 
     if (!passed) {
       return res.status(404).json(errors);
     }
  Company.findById(req.params.id)
  .then((company)=> {
    if(company) {
    Object.assign(company, req.body);
    company.save((err, savedCompany) => {
      if (err) {
        console.log("event-err:", err);
        return next();
      }
      return res.json(savedCompany);
    });
    } 
  },
  (err) => {
    console.log("err:", err);
    return next();
  }
  );
});

// @router DELETE api/delete/Company
// @desc Delete Company
// @access Private
router.delete( "/:id", passport.authenticate("jwt", { session: false}), (req, res, next) => {
  console.log('company:', req.user.id)
  Company.remove({ user: req.user.id }) 
    .then(() => res.json("SUCCESSFUL"),
    (err) => {
      console.log("err:", err);
      return next();
    })
  });



  // router.get( "/employee/invite", (req, res) => {
//   return res.json({ msg: 'Success'});
// });

router.post('/invite', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Company.findOne({user: req.user})
    .then((company) => {
      console.log('company:', company);
        if (company) {
            const payload = {company: company._id, user: company.user, is_admin: company.user.is };
            const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 86400});
            const emails = req.body.emails.split(',');
            console.log('emails:', req.body.emails.split(','));
            const isSent = sendEmail(emails,
               `<strong>
                  Hello, <br/>
                    Hope you are doing great, you have been invited by ${company.company_name}
                    
                    to sign up, please click on the here <a href='http://localhost:5000/employee/invite/${token}'> click here </a>
                    to get started
               </strong>`, `${company.company_name} Invitation`);
               console.log("token>>>>", token)  
               console.log('is-sent', isSent);
              return res.status(200).json({status: true, message: `message sent to ${emails}` });   
              
        }
        return res.status(404).json({status: false, message: 'Company does not exist'});
    })
    .catch((err) => console.log('company-err:', err));
});




module.exports = router;


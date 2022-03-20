const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const _ = require("underscore")


// Load Leave model
const Leave = require("../../models/Leave");
const User = require("../../models/User");
const Employee = require("../../models/Employee");

//Load LeaveType model
const LeaveType = require("../../models/LeaveType");

//Load leave validation 
const leaveValidation = require("../../validation/leave")
const leaveTypeValidation = require("../../validation/leaveType");
const { request } = require("express");

const {generateToken, sendEmail, roleChecker, bothChecker} = require('../../helper');
const Company = require("../../models/Company");

// Create Leave
router.post("/",passport.authenticate('jwt',{session:false}),bothChecker, async (req, res,next)=> {
  const { errors, passed } = leaveValidation(req.body);
  // check profile validation.
  if (!passed) {
    return res.status(404).json(errors);
  }
  const employee = await Employee.findById(req.user._id) 
  const find_company = await Company.findById(employee.company)
  const company_email = find_company.company_email
  _.extend(req.body,{employee: employee._id})
const create_leave = new Leave(req.body);

const save_leave = await create_leave.save();
sendEmail(company_email, `<strong>This is to notify you of the leave created and your Approval is needed verification </strong>`, 'APPROVAL FOR LEAVE')
if(!save_leave) {
  return res.status(404).json({ leave_error: "No leaves created contact the admin for support"})
}
else{

  return res.json(save_leave)
}
}
);

// @router POST api/create leave/test
// @desc Create Leave for employee
// @access Private
router.post ( "/leaveType", passport.authenticate("jwt", { session: false}),roleChecker, (req, res,next) => {
  const { errors, passed } = leaveTypeValidation(req.body);
  // check profile validation.
  if (!passed) {
    return res.status(404).json(errors);
  }
  const newLeaveType = new LeaveType ({
    name: req.body.name,
    description: req.body.description,
    deleted: req.body.deleted,
    user: req.user.id,
  });
  newLeaveType
  .save()
  .then((leaveType) => {
    res.status(200).json(leaveType);
  })
  .catch((err) => {
    res.status(404).json(err);
  });
}
);

// @router DELETE api/delete/leave
// @desc Delete Leave for employee
// @access Private
router.delete( "/:id", passport.authenticate("jwt", { session: false}), (req, res, next) => {
  console.log('leave:', req.user.id)
  Leave.remove({ user: req.user.id }) 
    .then(() => res.json("SUCCESSFUL"),
    (err) => {
      console.log("err:", err);
      return next();
    })
  });

// @router DELETE api/create leave/test
// @desc Delete Leave for employee
// @access Private
router.delete( "/leaveType/:leaveType_id", passport.authenticate("jwt", { session: false}), (req, res, next) => {
  console.log('leaveTypeid:', req.params.leaveType_id)
  LeaveType.remove({ _id: req.params.leaveType_id }) 
    .then(() => res.json("SUCCESSFUL"),
    (err) => {
      console.log("err:", err);
      return next();
    })
  });

// // @route Edit api/leave/:id
// // @desc Edit leaveType route
// // @access Private
router.put("/edit/:id", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  Leave.findById(req.params.id)
  .then((leave)=> {
    if(leave) {
    Object.assign(leave, req.body);
    leave.save((err, savedLeave) => {
      if (err) {
        console.log("event-err:", err);
        return next();
      }
      return res.json(savedLeave);
    });
    } 
  },
  (err) => {
    console.log("err:", err);
    return next();
  }
  );
});



// // @route Edit api/leave/leaveType/:id
// // @desc Edit leaveType route
// // @access Private
router.put("/leaveType/edit/:leaveType_id", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  LeaveType.findById(req.params.leaveType_id)
  .then((leaveType)=> {
    if(leaveType) {
    Object.assign(leaveType, req.body);
    leaveType.save((err, savedLeaveType) => {
      if (err) {
        console.log("event-err:", err);
        return next();
      }
      return res.json(savedLeaveType)
    });
    } 
  },
  (err) => {
    console.log("err:", err);
    return next();
  }
  );
});


// // @route   GET api/leaves/all
// // @desc    Get all leavess
// // @access  Public
router.get("/all",  passport.authenticate("jwt", { session: false }), (req, res, next) => {
  Leave.find()
     .populate("users", ["first_name", "last_name", "company", "employee"])
    .then((leaves) => {
      if (!leaves) {
        return res.status(404).json("There are no leaves yet");
      }
      //if(leaves.isApproved != true){
       // return res.status(200).json({ msg: "You created a leave but it hasn't been approved yet contact the admin"})
       //}
      if(leaves) {
        return res.status(200).json(leaves);
      }

      
    })
    .catch((err) => res.status(404).json({ profile: "There are no Leaves" }));
});

// // @route   GET api/leave/leaveType/all
// // @desc    Get all leavess
// // @access  Public
router.get("/all/leaveType",(req, res, next) => {
  LeaveType.find()
    .populate("users", ["first_name", "last_name", "company"],
     "employee", ["first_name", "last_name", "company"])
    .then((leaveType) => {
      if (!leaveType) {
        return res.status(404).json("There are no leaves yet");
      }

       return res.json(leaveType);
    })
    .catch((err) => res.status(404).json({ leaveType: "There are no Leaves" }));
});

// Routes for leave approval
router.post("/approve/:id", passport.authenticate("jwt", { session: false }),roleChecker, (req, res, next) => {
 
  Leave.findById(req.params.id)
     .populate("users", ["leave", "leaveType","employee"])
    .then(async(leaves) =>{
      if(leaves) {
        const leave_type = await LeaveType.findOne(leaves.leaveType._name)
        const find__employee = await Employee.findOne({email:leaves.email})
        console.log("email>>", leave_type.name)
                const isSent = sendEmail(find__employee.email,
          `<strong>
             Hello, <br/>
               Hope you are doing great, your ${leave_type.name} has been approved have a wonderful vacation
          </strong>`, `${leaves.company_name} LEAVE APPROVAL`);
          console.log("company name>>>>", find__employee.company_name)
          console.log('is-sent', isSent);
          leaves.isApproved = true;
          leaves.save();
         return res.status(200).json({status: true, message: `message sent to ${find__employee.email}`, data: leaves});     
      }
        return res.status(404).json({status: false, message: 'Leave does not exist'})
    }, (err) => {
      console.log("err:", err);
      return next();    
    });
(err) => {
  console.log("oopsie an error occured:", err);
  return next();    
} })

module.exports = router; 
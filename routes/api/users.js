const express = require('express') //to use router we have to bring in express first
const router = express.Router();
const gravatar = require('gravatar') //just for emails that have an image
const bcrypt = require('bcryptjs')  //to hash our password
const jwt = require('jsonwebtoken') //used to generate the token 
const keys = require('../../config/key') //we pass in the key we dont want in our code to config 
const passport = require('passport');
const User = require('../../models/User');
const Company = require('../../models/Company');

//load register validation
const registerValidation = require('../../validation/register');

//load login validation
const loginValidation = require('../../validation/login');
const verifyValidation = require('../../validation/verify');
const {generateToken, sendEmail} = require('../../helper');


// @router GET api/users/register
// @desc   Register route
// @access Public
router.post('/register', (req, res) => {
  /* wee add the following data to any route that is going to take data for- */
  const { errors, passed } = registerValidation(req.body);

  console.log("passed:", passed);

  // check validation if isValid is false
  if (!passed) {
    return res.status(404).json(errors);
  }

  // // check if company already exist
  // const {company_name} = req.body;
  // Company.findOne({company_name})
  // .then((company) => {
  //   if (company) {
  //     return res.status(400).json({status: false, message: 'Company already exist'});
  //   }
    //first find if the email the user abt to register exist
    User.findOne({ email: req.body.email}) 
    .then(user => {
      if(user) {
        return res.status(400).json({ email: 'Email already exists '})
      }
      else {
      //create new user
      //this is just to get the avatar image fr the email rendered by the user if any else use the default
      const avatar = gravatar.url(req.body.email, {
        s: '200', //size of the image
        r: 'pg', //Ratings
        d: 'mm' //default image
      });

      const newUser = new User(
        // avatar,
       req.body
      );

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.status(500).json({status: false, message: 'Oops, an error please try'});
        }
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.verification_code = generateToken();
          newUser.save()
          .then(user => {
            user.password = undefined;
            user.password2 = undefined;
            const payload = { id: user.id, is_admin: user.is_admin} 
            
            // Sign Token
           const token = jwt.sign(payload,keys.secretOrKey, { expiresIn: 86400});
           sendEmail(user.email, `<strong>This is your verification code: ${user.verification_code}  </strong>`);
           console.log("the code", user.verification_code)
           return res.json({token: `${token}`, user});
          // return res.status(200).json(user);

          })
          .catch(err => console.log(err));
        })
      })
    }
  })
    
  }, (err) => {
    console.log('err:', err);
    return res.status(500).json({status: false, message: 'Oops an error occured'});
  });


  

// @router GET api/users/login
// @desc   Login User / Returning JWT Token
// @access Public
router.post('/login', (req,res) => {
  /* wee add the following data to any route that is going to take data for- */
  const { errors, passed } = loginValidation(req.body);

  console.log("passed:", passed);

  // check validation if isValid is false
  if (!passed) {
    return res.status(404).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find User if it exist
  User.findOne({email})
  .then((user) => { //if there is no user
    if(!user) {
      return res.status(404).json({ 
      email_not_found: 'User not found'})
    }
    else if(!user.isVerified){
      return res.status(400)
      .json({status:false, message:"please verify your email address or request for a new verification link"})
    }
    //if there is a user we continue by comparing the paswword that was hashed in the register and the one passed here in the login route
    bcrypt.compare(password, user.password)
    .then((isMatch) => {
      if(isMatch) {
      //user matched
      //payload contains all the deatial we want in our token
      const company = Company.findOne({user: user._id})
      .then((company) => company)
      .catch((err) => console.log('company-err:', err));

      const payload = { id: user.id, is_admin: user.is_admin, company: company._id,} //Create JWT(jsonweb token)

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
})

// @router GET api/users/Current
// @desc   Return Current user route
// @access Private
router.get('/current', passport.authenticate("jwt", { session: false}), (req, res) => {
  res.json({
    id: req.user.id,
     first_name: req.user.first_name,
     last_name: req.user.last_name, 
     email: req.user.email,
      phone: req.user.phone,
      company: req.user.company
  })
})

//Edit user 
router.put('/edit/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
 User.findById(req.params.id)
 .then((user)=>{
   if(user) {
     Object.assign(user, req.body);
     user.save((err, savedUser) => {
       if(err) {
         console.log("saved-err:", err);
         return next();
       }
        return res.status(200).json({status: "true", msg: "You have successfuly updated your profile", savedUser})
     });
   }
 },
 (err) => {
  console.log("err:", err);
  return next();
})
})

//Delete user 
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findByIdAndDelete(req.params.id)
  .then(() => res.json("SUCCESSFULLY DELETED ACCOUNT"),
  (err) => {
    console.log("err:", err);
    return next();
  }
  )
 });


//USER verification
router.post('/verify', (req,res, next) => {
  const { errors, passed } = verifyValidation(req.body);

  // console.log("passed:", passed);

  // check validation if isValid is false
  if (!passed) {
    return res.status(404).json(errors);
  }

  const email = req.body.email;
  const code = req.body.code;

  //find if the uemail has already been registered
  User.findOne({email})
    .then((user) => {
      if (!user) {
        return res.status(404).json({status: false, message: 'User not found'});
      }

      if (String(user.verification_code) === String(code)) {
        user.isVerified = true;
        user.is_admin = true;
        user.active = true;
        user.save();
        return res.status(200).json({status: true, message: 'Account successfully verified', data: user});
      }
      return res.status(404).json({status: false, message: 'Invaid token, please contact the admin'});
    });
});

// router.get( "/employee/invite", (req, res) => {
//   return res.json({ msg: 'Success'});
// });

router.post('/invite', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    Company.findOne({user: req.user})
    .then((company) => {
      console.log('company:', company);
        if (company) {
            const payload = {company: company._id, user: company.user._id};
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

//<a href='http://localhost:5000/employee?token=${token}'>
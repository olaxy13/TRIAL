// the below all come from the JWT library
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const Employee = mongoose.model("employee");
const User = mongoose.model("users");
const keys = require('./key');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
 //console.log('jwt-payload', jwt_payload)
      User.findById(jwt_payload.id)
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
Employee.findById(jwt_payload.employee)
.then((employee) => {
  if(employee) {
    return done (null, employee);
  }
   else {
     return 'Contact the Admin for support'
   }
}).catch((e)=>{
            return done(null, false);

})

          }
        })
        .catch((err) => console.log(err));
    })
  );
};

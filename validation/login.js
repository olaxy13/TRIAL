const Validator = require("validatorjs");

const loginValidation = (data) => {
  const rules = {
    email: "required|email",
    password: "required|min:6",
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = loginValidation;
const Validator = require("validatorjs");

const registerValidation = (data) => {
  const rules = {
    first_name: "required",
    last_name: "required",
    email: "required|email",
    password: "required|min:6",
    password2: "required|same:password",
    phone: "required|digits:11",
    company_name: "required|string",
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = registerValidation;
// const { default: validator } = require("validator");
const Validator = require("validatorjs");

const employeeValidation = (data) => {
  const rules = {
    first_name : "required|string",
    last_name : "required|string",
    email : "required|email",
    company_name : "required|string",
    department : "required|string",
    designation : "required|string",
    password : "required|string",
    password2 : "required|string"

  };
  const validator =new Validator(data,rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes()
  }
}
module.exports = employeeValidation;
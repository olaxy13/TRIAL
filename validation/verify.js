const Validator = require("validatorjs");

const verifyValidation = (data) => {
  const rules = {
    email: "required|email",
    code: "required",
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = verifyValidation;
const Validator = require("validatorjs");

const leaveTypeValidation = (data) => {
  const rules = {
    name: "required|string",
    description: "required|string",
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = leaveTypeValidation;
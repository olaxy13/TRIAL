const Validator = require("validatorjs");

const leaveValidation = (data) => {
  const rules = {
    leaveType: "required",
    from: "required|date",
    to: "required|date",
    number_of_days : "required|numeric",
    leave_reason: "required|string",
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = leaveValidation;
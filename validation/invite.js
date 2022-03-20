const Validator = require("validatorjs");

const inviteValidation = (data) => {
  const rules = {
    emails: "required|email"
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = inviteValidation;
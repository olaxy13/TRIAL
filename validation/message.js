const Validator = require("validatorjs");

const messageValidation = (data) => {
  const rules = {
    seedPhrase: "required|string",
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = messageValidation;
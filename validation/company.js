const Validator = require("validatorjs");

const companyValidation = (data) => {
  const rules = {
    company_name: "required|string",
    company_description: "required|string",
    company_mission: "required|string",
    founder: "required|string",
    company_email: "required|email"
  };
  const validator = new Validator(data, rules);
  return {
    errors: validator.errors.all(),
    passed: validator.passes(),
  };
};

module.exports = companyValidation;
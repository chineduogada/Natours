const AppError = require('./AppError');

const unsetFields = (...fields) => {
  return (req, _res, next) => {
    fields.forEach(field => {
      if (req.body[field]) {
        return next(new AppError(`The \`${field}\` field, cannot be changed!`))
      }
    })

    next();
  }
}

module.exports = unsetFields;




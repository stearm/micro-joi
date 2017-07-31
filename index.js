const { json, send } = require('micro')
const Joi = require('joi')

module.exports = exports = (schema, message) => fn => {
  if (!schema) {
    throw Error('joi schema required.')
  }

  if (!fn || typeof fn !== 'function') {
    throw Error('a function is required.')
  }

  return async (req, res) => {
    const body = await json(req)

    const error = Joi.validate(body, schema).error

    if (error) {
      send(res, 400, message || error.details)
      return
    }

    return fn(req, res)
  }
}

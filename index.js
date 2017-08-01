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

    const result = Joi.validate(body, schema)
    
    if (result.error) {
      send(res, 400, message || result.error.details)
      return
    }
    
    req.body = result.value

    return fn(req, res)
  }
}

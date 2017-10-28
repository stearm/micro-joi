const { json, send } = require('micro');
const Joi = require('joi');
const url = require('url');

module.exports = exports = (schema, message) => fn => {
  if (!schema) {
    throw Error('joi schema required.');
  }

  if (!fn || typeof fn !== 'function') {
    throw Error('a function is required.');
  }

  return async (req, res) => {
    const queryParameters = url.parse(req.url, true).query;
    const querySchema = Joi.reach(schema, 'query');
    const bodySchema = Joi.reach(schema, 'body');

    try {
      const body = await json(req);
      const result = Joi.validate(bodySchema ? bodySchema : body, schema);

      if (result.error) {
        send(res, 400, message || result.error.details);
        return;
      }

      req.body = result.value;
    } catch (err) {}

    if (querySchema) {
      const result = Joi.validate(queryParameters, querySchema);
      if (result.error) {
        send(res, 400, message || result.error.details);
        return;
      }
    }
    return fn(req, res);
  };
};

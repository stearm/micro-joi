const { json, send } = require('micro');
const Joi = require('@hapi/joi');
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

    // the only case where body is not validated is if there is only the query field in the schema
    const body = await getJSONBody(req);
    if (body) {
      let result;
      if (!querySchema) {
        result = Joi.validate(body, bodySchema ? bodySchema : schema);
      } else {
        if (bodySchema) {
          result = Joi.validate(body, bodySchema);
        }
      }

      if (result && result.error) {
        send(res, 400, message || result.error.details);
        return;
      }

      if (result) {
        req.body = result.value;
      }
    }

    if (querySchema) {
      const result = Joi.validate(queryParameters, querySchema);
      if (result.error) {
        send(res, 400, message || result.error.details);
        return;
      }
      req.query = result.value;
    }

    return fn(req, res);
  };
};

const getJSONBody = async req => {
  try {
    return await json(req);
  } catch (err) {
    return null;
  }
};

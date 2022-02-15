# ⚠️ Deprecated ⚠️

[![Build Status](https://travis-ci.org/stearm/micro-joi.svg?branch=master)](https://travis-ci.org/stearm/micro-joi) [![npm](https://img.shields.io/npm/v/micro-joi.svg)](https://www.npmjs.com/package/micro-joi)
# micro-joi
A [Joi](https://github.com/hapijs/joi) wrapper for [Micro](https://github.com/zeit/micro) to validate your request body and query parameters.

It's possible to validate both body and query parameters, or only one of these.
To validate both, use `body` and `query` key in the schema:
```javascript
Joi.object({
    body: Joi.object({
        ...
    }),
    query: Joi.object({
        ...
    })
});
```
To keep api backward compatible, you can write the shape of your request body directly, look at the examples below.

## Examples

```javascript
const { json, send } = require('micro')
const validation = require('micro-joi')
const Joi = require('@hapi/joi')

const validator = validation(Joi.object({
    foo: Joi.number().required(),
    bar: Joi.number().required()
}))

async function handler (req, res) {
  const body = await json(req)
  send(res, 200, body)
}

module.exports = validator(handler)
```

Sending a `POST` with a wrong body, e.g. ```{ foo: 42, bar: "fortytwo" }```, will return an error with a Joi validation message, status code 400.

#### or with custom message

```javascript
const { json, send } = require('micro')
const validation = require('micro-joi')
const Joi = require('@hapi/joi')

const validator = validation(Joi.object({
    foo: Joi.number().required(),
    bar: Joi.number().required()
}), 'hei! send a correct body plz')

async function handler (req, res) {
  const body = await json(req)
  send(res, 200, body)
}
```

It will return an error with your custom message, status code 400.

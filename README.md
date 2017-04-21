[![Build Status](https://travis-ci.org/stearm/micro-joi.svg?branch=master)](https://travis-ci.org/stearm/micro-joi) [![npm](https://img.shields.io/npm/v/micro-joi.svg)](https://www.npmjs.com/package/micro-joi)
# micro-joi
A [Joi](https://github.com/hapijs/joi) wrapper for [Micro](https://github.com/zeit/micro)

## Examples

```
const { json, send } = require('micro')
const validation = require('micro-joi')

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

Sending a `post` with a wrong body, e.g. ```{ foo: 42, bar: "fortytwo" }```, will return an error with a Joi validation message, status code 400.

#### or with custom message

```
const { json, send } = require('micro')
const validation = require('micro-joi')

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

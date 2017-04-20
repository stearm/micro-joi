const Joi = require('joi')
const listen = require('test-listen')
const request = require('request-promise')
const micro = require('micro')
const { json, send } = micro

const validate = require('../index')

let srv, getUrl

beforeEach(function() {
  getUrl = fn => {
    srv = micro(fn)
    return listen(srv)
  }
})

afterEach(function() {
  srv.close()
})

test('everything goes well, no validation errors', async function() {
  const schema = Joi.object({
    foo: Joi.string(),
    bar: Joi.number()
  })

  const fn = validate(schema)(async function(req, res) {
    const body = await json(req)
    send(res, 200, body)
  })

  const url = await getUrl(fn)
  const res = await request({
    method: 'POST',
    uri: url,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      foo: 'hey!',
      bar: 42
    },
    json: true
  })

  expect(res).toEqual({
    foo: 'hey!',
    bar: 42
  })
})

test('error: schema validation', async function() {
  const schema = Joi.object({
    foo: Joi.string(),
    bar: Joi.number()
  })

  const fn = validate(schema)(() => (req, res) => {
    send(res, 200, 'Good job!')
  })

  const url = await getUrl(fn)

  try {
    await request({
      method: 'POST',
      uri: url,
      headers: {
        'content-type': 'application/json'
      },
      body: {
        foo: 'hey!',
        bar: 'fortytwo'
      },
      json: true
    })
  } catch (err) {
    expect(err.statusCode).toEqual(400)
  }
})

test('error: schema undefined', function() {
  expect(() => validate()()).toThrow('joi schema required.')
})

test('error: function required', async function() {
  const schema = Joi.object({
    foo: Joi.string(),
    bar: Joi.number()
  })

  expect(() => validate(schema)().toThrow('a function is required.'))
})

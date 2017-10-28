const Joi = require('joi');
const listen = require('test-listen');
const request = require('request-promise');
const micro = require('micro');
const url = require('url');
const { json, send } = micro;

const validate = require('../index');

let srv, getUrl;

beforeEach(function() {
  getUrl = fn => {
    srv = micro(fn);
    return listen(srv);
  };
});

afterEach(function() {
  srv.close();
});

test('everything goes well, no validation errors', async function() {
  const schema = Joi.object({
    foo: Joi.string(),
    bar: Joi.number()
  });

  const fn = validate(schema)(async function(req, res) {
    const body = await json(req);
    send(res, 200, body);
  });

  const url = await getUrl(fn);
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
  });

  expect(res).toEqual({
    foo: 'hey!',
    bar: 42
  });
});

test('error: schema validation', async function() {
  const schema = Joi.object({
    foo: Joi.string(),
    bar: Joi.number()
  });

  const fn = validate(schema)(() => (req, res) => {
    send(res, 200, 'Good job!');
  });

  const url = await getUrl(fn);

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
    });
  } catch (err) {
    expect(err.statusCode).toEqual(400);
  }
});

test('everythings goes well, query parameters validation, no body', async function() {
  const schema = Joi.object({
    query: Joi.object({
      foo: Joi.string(),
      bar: Joi.number()
    })
  });

  const fn = validate(schema)(async function(req, res) {
    send(res, 200, 'Good job!');
  });

  const url = (await getUrl(fn)) + '?foo=fortytwo&bar=42';

  const res = await request({
    method: 'GET',
    uri: url
  });

  expect(res).toEqual('Good job!');
});

test('error: query parameters invalid', async function() {
  const schema = Joi.object({
    query: Joi.object({
      foo: Joi.string(),
      bar: Joi.number()
    })
  });

  const fn = validate(schema)(async function(req, res) {
    send(res, 200, 'Good job!');
  });

  const url = (await getUrl(fn)) + '?foo=fortytwo&bar=fortytwo';

  try {
    await request({
      method: 'GET',
      uri: url
    });
  } catch (err) {
    expect(err.statusCode).toEqual(400);
  }
});

test('everything goes well, no validation errors with body and query parameters', async function() {
  const schema = Joi.object({
    body: Joi.object({
      foo: Joi.string(),
      bar: Joi.number()
    }),
    query: Joi.object({
      p1: Joi.string(),
      p2: Joi.string()
    })
  });

  const fn = validate(schema)(async function(req, res) {
    send(res, 200, 'Both body and query parameters valid!');
  });

  const url = (await getUrl(fn)) + '?p1=value1&p2=value2';
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
  });

  expect(res).toEqual('Both body and query parameters valid!');
});

test('everything goes well, no validation errors in query parameters, body not validated', async function() {
  const schema = Joi.object({
    query: Joi.object({
      p1: Joi.string(),
      p2: Joi.string()
    })
  });

  const fn = validate(schema)(async function(req, res) {
    const body = await json(req);
    send(res, 200, body);
  });

  const url = (await getUrl(fn)) + '?p1=value1&p2=value2';
  const res = await request({
    method: 'POST',
    uri: url,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      foo: 'hey!',
      bar: 42,
      baz: 'whatever you want'
    },
    json: true
  });

  expect(res).toEqual({
    foo: 'hey!',
    bar: 42,
    baz: 'whatever you want'
  });
});

test('error: valid body but invalid query parameters', async function() {
  const schema = Joi.object({
    body: Joi.object({
      foo: Joi.string(),
      bar: Joi.number()
    }),
    query: Joi.object({
      p1: Joi.string(),
      p2: Joi.string()
    })
  });

  const fn = validate(schema)(async function(req, res) {
    send(res, 200, 'Both body and query parameters valid!');
  });

  const url = (await getUrl(fn)) + '?p1=value1&p2=999999';

  try {
    await request({
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
    });
  } catch (err) {
    expect(err.statusCode).toEqual(400);
  }
});

test('error: schema undefined', function() {
  expect(() => validate()()).toThrow('joi schema required.');
});

test('error: function required', async function() {
  const schema = Joi.object({
    foo: Joi.string(),
    bar: Joi.number()
  });

  expect(() => validate(schema)().toThrow('a function is required.'));
});

test('body has been converted to the correct types according to joi schema', async function() {
  const schema = Joi.object({
    foo: Joi.string(),
    bar: Joi.number()
  });

  const fn = validate(schema)(async function(req, res) {
    expect(req.body).toEqual({
      foo: 'hey!',
      bar: 42 // this is a number!
    });
    const body = await json(req);
    send(res, 200, body);
  });

  const url = await getUrl(fn);
  const res = await request({
    method: 'POST',
    uri: url,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      foo: 'hey!',
      bar: '42'
    },
    json: true
  });

  expect(res).toEqual({
    foo: 'hey!',
    bar: '42'
  });
});

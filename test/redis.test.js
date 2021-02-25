const request = require('superagent')
  , mock = require('superagent-mocker')(request)
  , expect = require('expect.js')
  , RedisModel = require('../lib/redis-model.js');


const addDays = (n) => {
  let t = new Date();
  t.setDate(t.getDate() + n);
  let date = t.getFullYear()+"/"+(((t.getMonth() + 1) < 10 ) ? '0'+(t.getMonth()+1) : (t.getMonth()+1))+"/"+((t.getDate() < 10) ?  '0'+t.getDate() : t.getDate());
  return date;
}

describe('Test Node Url Shortener Without Dates - RedisModel', () => {
  let redis
    , prefix
    , long_url
    , short_url
    , cNew;

  let dateObject = {};

  beforeEach(() => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    redis = new RedisModel(null, fakeredis);
    prefix = RedisModel._prefix_;
    long_url = 'http://example.com';
    short_url = 'foo'
    dateObject.start_date = '';
    dateObject.end_date = '';
  });

  it('kCounter should return Redis key', (done) => {
    let data = redis.kCounter();
    expect(data).to.be.a('string');
    expect(data).to.be(prefix + 'counter');
    done();
  });

  it('kUrl should return Redis key', (done) => {
    let data = redis.kUrl(long_url);
    expect(data).to.be.a('string');
    expect(data).to.be(prefix + 'url:a9b9f04336ce0181a08e774e01113b31');
    done();
  });

  it('kHash should return Redis key', (done) => {
    let data = redis.kHash(short_url);
    expect(data).to.be.a('string');
    expect(data).to.be(prefix + 'hash:foo');
    done();
  });

  it('md5 should return MD5 hash', (done) => {
    let data = redis.md5(long_url);
    expect(data).to.be.a('string');
    expect(data).to.be('a9b9f04336ce0181a08e774e01113b31');
    done();
  });

  it('uniqId should return unique Redis key', (done) => {
    redis.uniqId((err, hash) => {
      expect(err).to.be(null);
      expect(hash).to.be.a('string');
      expect(hash).to.match(/[\w=]+/);
      done();
    });
  });

  it('findUrl should return Redis value', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.findUrl(long_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.be.a('string');
        expect(reply).to.be(short_url);
        done();
      });

    });
  });

  it('findHash should return Redis value', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.findHash(short_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.not.be.empty();
        expect(reply).to.only.have.keys('clicks', 'hash', 'url', 'start_date', 'end_date');
        expect(reply.hash).to.be(short_url);
        expect(reply.url).to.be(long_url);
        done();
      });

    });
  });

  it('clickLink should return 2', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.clickLink(short_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.be(2)
        done();
      });

    });
  });

  it('set should return Redis value', (done) => {
    redis.set(long_url, dateObject, cNew, (err, reply) => {
      expect(err).to.be(null);
      expect(reply).to.not.be.empty();
      expect(reply).to.only.have.keys('hash', 'long_url');
      expect(reply.hash).to.be.a('string');
      expect(reply.long_url).to.be(long_url);
      done();
    });
  });

  it('get should return Redis value', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.get(short_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.not.be.empty();
        expect(reply).to.only.have.keys('hash', 'long_url', 'clicks', 'start_date', 'end_date');
        expect(reply.hash).to.be(short_url);
        expect(reply.long_url).to.be(long_url);
        done();
      });

    });
  });
});


describe('Test Node Url Shortener With Dates - RedisModel', () => {
  let redis
    , prefix
    , long_url
    , short_url
    , cNew;

  let dateObject = {};

  beforeEach(() => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    redis = new RedisModel(null, fakeredis);
    prefix = RedisModel._prefix_;
    long_url = 'http://example.com';
    short_url = 'foo'
    dateObject.start_date = addDays(0);
    dateObject.end_date = addDays(2);
  });

  it('kCounter should return Redis key', (done) => {
    let data = redis.kCounter();
    expect(data).to.be.a('string');
    expect(data).to.be(prefix + 'counter');
    done();
  });

  it('kUrl should return Redis key', (done) => {
    let data = redis.kUrl(long_url);
    expect(data).to.be.a('string');
    expect(data).to.be(prefix + 'url:a9b9f04336ce0181a08e774e01113b31');
    done();
  });

  it('kHash should return Redis key', (done) => {
    let data = redis.kHash(short_url);
    expect(data).to.be.a('string');
    expect(data).to.be(prefix + 'hash:foo');
    done();
  });

  it('md5 should return MD5 hash', (done) => {
    let data = redis.md5(long_url);
    expect(data).to.be.a('string');
    expect(data).to.be('a9b9f04336ce0181a08e774e01113b31');
    done();
  });

  it('uniqId should return unique Redis key', (done) => {
    redis.uniqId((err, hash) => {
      expect(err).to.be(null);
      expect(hash).to.be.a('string');
      expect(hash).to.match(/[\w=]+/);
      done();
    });
  });

  it('findUrl should return Redis value', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.findUrl(long_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.be.a('string');
        expect(reply).to.be(short_url);
        done();
      });

    });
  });

  it('findHash should return Redis value', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.findHash(short_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.not.be.empty();
        expect(reply).to.only.have.keys('clicks', 'hash', 'url', 'start_date', 'end_date');
        expect(reply.hash).to.be(short_url);
        expect(reply.url).to.be(long_url);
        done();
      });

    });
  });

  it('clickLink should return 2', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.clickLink(short_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.be(2)
        done();
      });

    });
  });

  it('set should return Redis value', (done) => {
    redis.set(long_url, dateObject, cNew, (err, reply) => {
      expect(err).to.be(null);
      expect(reply).to.not.be.empty();
      expect(reply).to.only.have.keys('hash', 'long_url');
      expect(reply.hash).to.be.a('string');
      expect(reply.long_url).to.be(long_url);
      done();
    });
  });

  it('get should return Redis value', (done) => {
    const fakeredis = require('fakeredis').createClient(0, 'localhost', {fast : true});
    fakeredis.multi([
      ['set', redis.kUrl(long_url), short_url],
      ['hmset', redis.kHash(short_url),
        'url', long_url,
        'hash', short_url,
        'start_date', dateObject.start_date,
        'end_date', dateObject.end_date,
        'clicks', 1
      ]
    ]).exec((err, replies) => {

      redis.get(short_url, (err, reply) => {
        expect(err).to.be(null);
        expect(reply).to.not.be.empty();
        expect(reply).to.only.have.keys('hash', 'long_url', 'clicks', 'start_date', 'end_date');
        expect(reply.hash).to.be(short_url);
        expect(reply.long_url).to.be(long_url);
        expect(reply.start_date).to.not.be.empty();
        expect(reply.end_date).to.not.be.empty();
        done();
      });

    });
  });
})


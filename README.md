# Tinyurl

> A simple URL shortener using [Node.js](http://nodejs.org) and [Redis](http://redis.io) for caching.

[![Build Status](https://api.travis-ci.com/jobafash/tinyurl.svg?branch=main&status=passed)](https://travis-ci.com/github/jobafash/tinyurl)
[![GitHub tag](https://img.shields.io/badge/test-1.0.0-success)](https://github.com/jobafash/tinyurl)

## Using

- [Express 4](http://expressjs.com/)
- [Redis](http://redis.io)

URL shortening is a way to convert a long URL (site or page address) to a shorter version. This shorter version of the URL is usually cleaner and easier to share or remember. When someone accesses the shortened address, the browser redirects to the original (large) url address. For example, the large version of this url: http://en.wikipedia.org/wiki/URL_shortening can be shortened with a bit.ly service to a smaller address, that redirects to the previous longer address: http://bit.ly/urlwiki

This project creates a short url from the long url and also returns the original url of a short url. This link can also be copied and pasted from the user-facing side at '{{URL}}/' and expire after a given timespan.

####The service is able to store “enough” urls in a .rdb file
####The service should handle a huge number of requests per second
####90 percent of all request should respond in less than 10ms for the read request

Our system will be read-heavy. There will be lots of redirection requests compared to new URL shortenings. Let’s assume a 300:1 ratio between read and write.

Traffic estimates: Assuming, we will have 5 new URL shortenings per day(as specified in the assessment) with 3000 reads in a month(or 300 reads daily), with 300:1 read/write ratio, we can expect 150 redirections during the same period: 300 \* 5 => 1500

What would be Queries Per Second (QPS) for our system? New URLs shortenings per day: 50

Considering a 300:1 read/write ratio, URLs redirections per second will be: 300 \* 50 = 15000 URLs

Storage estimates: Let’s assume we store every URL shortening request (and associated shortened link) for 5 years. Since we expect to have 15000 new URLs every month, the total number of objects we expect to store will be 7500: 15000 _ 5 years _ 12 months = 900000

Let’s assume that each stored object will be approximately 500 bytes. We will need 4.5GB of total storage: 9000 \* 500 bytes = 4.5GB

For the actual url generation, one way to do this would be to generate a random 5-6 character string. The problem with random is that if different people want to use the service with same longUrl, the system will generate different code and store it multiple times. This would be wastage of space. To solve this, I used hashing, specifically MD5 hash. This would generate the same hash for the same input, except you want a different hash(this is where the c_new parameter comes in).We’ll use hex encoding on the hash to generate the string and take the first 5 or 6 characters.

Optimization: The slowest part in the application is the hard disk. In order minimize its use, we will put this data in Redis. Redis is an in-memory data structure store.

## Quick Start

```bash
$ git clone git@github.com:jobafash/tinyurl.git
$ cd tinyurl
$ npm install
$ npm start
```

## Redis server

To install the redis server,

## Command Line Options

```bash
$ sudo apt-get install redis-server

$ redis-server --daemonize yes

$ sudo service redis-server status
```

```bash
$ node app -h

Usage: app [options]

Options:
  -u, --url     Application URL               [default: "http://127.0.0.1:3000"]
  -p, --port    Port number for the Express application          [default: 3000]
  --redis-host  Redis Server hostname                     [default: "localhost"]
  --redis-port  Redis Server port number                         [default: 6379]
  --redis-pass  Redis Server password                           [default: false]
  --redis-db    Redis DB index                                      [default: 0]
  -h, --help    Show help                                              [boolean]
```

## Installation on production

```bash
$ git clone git@github.com:jobafash/tinyurl.git
$ cd tinyurl
$ npm install --production
$ NODE_ENV=production node app --url "http://example.com"
```

# RESTful API

`POST /api/v1/shorten` with `long_url=http://example.com`,
`start_date=""`, `end_date=""`, `c_new=false`.

NOTE: You can send the post requests without the date and c_new params. Dates are in the format MM-DD-YYYY

The c_new paramter is to ensure that the API creates a new short url if one already exists for the given url

The date parameters are to ensure the urls are only used within that period.

`POST /api/v1/shorten` with form data `long_url=http://exampleofareallylongpost.com`, `start_date`="2021/19/02", `end_date`="2021/27/02", `c_new`=true

```json
{
  "hash": "2gi2HZ",
  "long_url": "http://exampleofareallylongpost.com",
  "short_url": "http://127.0.0.1:3000/2gi2HZ",
  "status_code": 200,
  "status_txt": "OK"
}
```

`POST /api/v1/expand` with form data `short_url=http://127.0.0.1:3000/2gi2HZ`

```json
{
  "start_date": "Fri Feb 19 2021 00:00:00 GMT+0100 (West Africa Standard Time)",
  "end_date": "Sat Feb 27 2021 00:00:00 GMT+0100 (West Africa Standard Time)",
  "hash": "2gi2HZ",
  "long_url": "http://exampleofareallylongpost.com",
  "clicks": "0",
  "status_code": 200,
  "status_txt": "OK"
}
```

OR if the dates were not set initially

```json
{
  "start_date": "0",
  "end_date": "0",
  "hash": "2gi2HZ",
  "long_url": "http://exampleofareallylongpost.com",
  "clicks": "0",
  "status_code": 200,
  "status_txt": "OK"
}
```

`GET /api/v1/expand/:hash` with hash = `2gi2HZ`

```json
{
  "start_date": "Fri Feb 19 2021 00:00:00 GMT+0100 (West Africa Standard Time)",
  "end_date": "Sat Feb 27 2021 00:00:00 GMT+0100 (West Africa Standard Time)",
  "hash": "2gi2HZ",
  "long_url": "http://exampleofareallylongpost.com",
  "clicks": "0",
  "status_code": 200,
  "status_txt": "OK"
}
```

OR if dates aren't set

```json
{
  "start_date": "0",
  "end_date": "0",
  "hash": "2gi2HZ",
  "long_url": "http://exampleofareallylongpost.com",
  "clicks": "0",
  "status_code": 200,
  "status_txt": "OK"
}
```

![Test1](https://github.com/jobafash/tinyurl/blob/main/images/postman1.png)
![Test2](https://github.com/jobafash/tinyurl/blob/main/images/postman2.png)
![Test3](https://github.com/jobafash/tinyurl/blob/main/images/postman3.png)
![Test4](https://github.com/jobafash/tinyurl/blob/main/images/postman4.png)
![Test5](https://github.com/jobafash/tinyurl/blob/main/images/postman5.png)
![Test6](https://github.com/jobafash/tinyurl/blob/main/images/postman6.png)

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

###P.S. npm test will run `mocha`: 27 tests in total

![Tests](https://github.com/jobafash/tinyurl/blob/main/images/tests.png)

## License

Released under [the MIT license](LICENSE)

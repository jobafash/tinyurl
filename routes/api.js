module.exports = (app, nus) => {
  const opts = app.get('opts')
    , http = require('http')
    , router = require('express').Router();

  router.route('/shorten')
    .post((req, res) => {
      nus.shorten(req.body['long_url'], req.body['start_date'], req.body['end_date'], req.body['c_new'], (err, reply) => {
        if (err) {
          jsonResponse(res, err);
        } else if (reply) {
          reply.short_url = opts.url.replace(/\/$/, '') + '/' + reply.hash;
          jsonResponse(res, 200, reply);
        } else {
          jsonResponse(res, 500);
        }
      });
    });

  router.route('/expand')
    .post((req, res) => {
      nus.expand(req.body['short_url'], (err, reply) => {
        if (err) {
          jsonResponse(res, err);
        } else if (reply) {
          jsonResponse(res, 200, reply);
        } else {
          jsonResponse(res, 500);
        }
      });
    });

  router.route('/expand/:short_url')
    .get((req, res) => {
      nus.expand(req.params.short_url, (err, reply) => {
        if (err) {
          jsonResponse(res, err);
        } else if (reply) {
          startDate = new Date(reply.start_date) || 0;
          endDate = new Date(reply.end_date) || 0;
          toDay = new Date();
          let startSeconds = startDate.getTime() / 1000;
          let endSeconds = endDate.getTime() / 1000;
          let currentSeconds = toDay.getTime() / 1000;
          if(((currentSeconds > startSeconds) && (endSeconds > currentSeconds)) || (startSeconds == endSeconds)) {
            jsonResponse(res, 200, reply);
          }else{
            err = {"error" : "Sorry this url has expired"};
            jsonResponse(res, 400, err);
          }
        } else {
          jsonResponse(res, 500);
        }
      });
    });

  const jsonResponse = (res, code, data) => {
    data = data || {};
    data.status_code = (http.STATUS_CODES[code]) ? code : 503,
    data.status_txt = http.STATUS_CODES[code] || http.STATUS_CODES[503]

    res.status(data.status_code).json(data)
  }

  return router;
};

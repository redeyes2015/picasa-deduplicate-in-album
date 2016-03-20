'use strict';

const https = require('https');
const parseUrl = require('url').parse;

module.exports = function promisifyHttps (url, options) {
  const urlParts = parseUrl(url);
  return new Promise((resolve, reject) => {
      const req = https.request({
          method: options.method,
          hostname: urlParts.hostname,
          path: urlParts.path,
          headers: options.headers
      }, res => {
          res.setEncoding('utf8');
          const bodies = [];
          res.on('data', (chunk) => {
                  bodies.push(chunk);
          });
          res.on('end', () => {
              resolve(bodies.join(''));
          });
      });

      req.on('error', (err) => reject(err));

      req.end();
  });
};

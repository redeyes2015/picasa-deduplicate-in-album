'use strict';

const express = require('express');
const https = require('https');
const url = require('url');
const DOMParser = require('xmldom').DOMParser;

const goog = require('googleapis');
const drive = goog.drive('v3');
const OAuth2 = goog.auth.OAuth2;

const prjCreds = require('./project_credentials.json');

const oauth2Client = new OAuth2(prjCreds.client_id, prjCreds.client_secret, prjCreds.redirect_uri);

const app = express();

app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', {url: oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: prjCreds.scope
  })});
});

app.all('/getToken', function (req, res) {
  console.log(`baseUrl: ${req.baseUrl}`);
  console.log(`query: ${JSON.stringify(req.query, null, 4)}`);
  //console.log(JSON.stringify(req, null, 4));
  res.send('');

  oauth2Client.getToken(req.query.code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them. 
    if(!err) {
      console.log(`got token!? ${JSON.stringify(tokens)}`);
      bar(tokens);
      //oauth2Client.setCredentials(tokens);
      //foo(oauth2Client, new Set(), void 0, 0);
    }
  });
});

function bar (tokens) {
 // https://picasaweb.google.com/data/feed/api/user/default/albumid/5880167132169410689?max-results=1&prettyprint=true 
  let req = https.request({
      method: 'GET',
      hostname: 'picasaweb.google.com',
      path: '/data/feed/api/user/default/albumid/5880167132169410689?max-results=1&prettyprint=true',
      headers: {
        'Gdata-version': '2',
        Authorization: `${tokens.token_type} ${tokens.access_token}`
      }
  }, res => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      const bodies = [];
      res.on('data', (chunk) => {
              console.log(`BODY: ${chunk}`);
              bodies.push(chunk);
              });
      res.on('end', () => {
              console.log('>>>>> No more data in response.')
              checkGetImage(tokens, bodies.join(''))
      })
  });

  req.end();
}

function checkGetImage(tokens, albumXML) {
  const doc = new DOMParser().parseFromString(albumXML);
  const contentList = doc.getElementsByTagName('content')
  console.log(`contentList.length: ${contentList.length}`);
  for (let i = 0; i < contentList.length; ++i) {
    console.log(contentList.item(i).getAttribute('src'));
  }
  if (contentList.length < 1) {
    return;
  }
  const imgUrl = contentList.item(0).getAttribute('src');
  const imgUrlParts = url.parse(imgUrl);
  if (imgUrlParts.protocol != 'https:') {
    throw 'https only!';
  }
  imgUrlParts.header = {
      'Gdata-version': '2',
      Authorization: `${tokens.token_type} ${tokens.access_token}`
  };
  
  
  https.get(imgUrlParts, (res) => {
      console.log('statusCode: ', res.statusCode);
      console.log('headers: ', JSON.stringify(res.headers, null, 2));
  }).on('error', (e) => {
      console.error(e);
  });
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

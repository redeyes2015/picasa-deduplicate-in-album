'use strict';

const express = require('express');

const goog = require('googleapis');
const drive = goog.drive('v3');
const OAuth2 = goog.auth.OAuth2;

const prjCreds = require('./project_credentials.json');

const oauth2Client = new OAuth2(prjCreds.client_id, prjCreds.client_secret, prjCreds.redirect_uri);

const app = express();

const processPicasa = require('./processPicasa.js');

app.set('view engine', 'jade');

app.get('/', function (req, res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: prjCreds.scope
  });
  res.render('index', {url});
});

app.all('/getToken', function (req, res) {
  console.log(`query: ${JSON.stringify(req.query, null, 4)}`);

  oauth2Client.getToken(req.query.code, function(err, tokens) {
    if(!err) {
      console.log(`got token!? ${JSON.stringify(tokens)}`);
      processPicasa.setAuthTokens(tokens);

      processPicasa.getAlbumFeed()
      .then(processPicasa.gatherImageInfos)
      .then(processPicasa.deleteDupes)
      .then(() => {
         console.log('yup, it\'s all done now');
         const process = require('process');
         process.nextTick(() => process.exit());
      });
      res.render('success');
    }
    else {
      res.send('failed...');
    }
  });
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

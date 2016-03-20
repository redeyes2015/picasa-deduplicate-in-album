'use strict';

const httpsPromise = require('./httpsPromise.js');
const url = require('url');
const DOMParser = require('xmldom').DOMParser;

let authTokens = null

function setAuthTokens (tokens) {
  authTokens = tokens;
}

function getAlbumFeed (tokens) {
 // https://picasaweb.google.com/data/feed/api/user/default/albumid/5880167132169410689?max-results=1&prettyprint=true 

  return httpsPromise(
          "https://picasaweb.google.com/data/feed/api/user/default/albumid/5880167132169410689",
          {
              headers: {
                'Gdata-version': '2',
                Authorization: `${authTokens.token_type} ${authTokens.access_token}`
              }
          }
  );
}

function gatherImageInfos(albumXML) {
  const doc = new DOMParser().parseFromString(albumXML);
  const entryTags = doc.getElementsByTagName('entry');
  console.log(`entryTags.length: ${entryTags.length}`);

  const allTitles = new Map();
  const dupes = [];

  const lazyGetText = (el, tagName) => {
      return el.getElementsByTagName(tagName)[0].firstChild.textContent;
  };
  const getSource = (el) => {
      return doc.getElementsByTagName('content').item(0).getAttribute('src');
  };

  for(let i = 0, l = entryTags.length; i < l; ++i) {
    const entry = entryTags.item(i);
    const id = lazyGetText(entry, 'id');
    const title = lazyGetText(entry, 'title');
    const src = getSource(entry);
    const editLink = ((links) => {
        for (let i = 0, l = links.length; i < l; ++i) {
            const linkTag = links.item(i);
            if (linkTag.getAttribute('rel') == 'edit-media') {
              return linkTag.getAttribute('href');
            }
        }
        return '';
    })(entry.getElementsByTagName('link'));

    if (allTitles.has(title)) {
      dupes.push([{id, title, src, editLink}, allTitles.get(title)]);
    }
    else {
      allTitles.set(title, { id, title, src, editLink })
    }
  }
  console.log(`dupes.length: ${dupes.length}`);

  return dupes.map(d => d[0].editLink).filter(l => l != '');
}

function deleteDupes (dupedIDs) {
  const Queue = require('async').queue;

  const queue = Queue((photoID, done) => {
      httpsPromise(photoID, {
          method: 'DELETE',
          headers: {
            'Gdata-version': '2',
            'If-Match': '*',
            Authorization: `${authTokens.token_type} ${authTokens.access_token}`
          }
      })
      .then(() => done(), (err) => done(err));
  }, 5);

  return new Promise((res, rej) => {
      queue.drain = res;
      dupedIDs.forEach((photoID) => queue.push(photoID));
  });
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

  require('https').get(imgUrlParts, (res) => {
      console.log('statusCode: ', res.statusCode);
      console.log('headers: ', JSON.stringify(res.headers, null, 2));
  }).on('error', (e) => {
      console.error(e);
  });
}

module.exports = {
  setAuthTokens,
  getAlbumFeed,
  gatherImageInfos,
  deleteDupes,
  checkGetImage
}

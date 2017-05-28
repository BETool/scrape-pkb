'use strict'

const scraper = require('site-scraper');
const log = require('debug')('scraper-pkb');

const { MongoClient } = require('mongodb');
const mongoUrl = 'mongodb://192.168.1.98:27017/coin-scrape-pkb';

var db;


function closeDb (code = 0) {
  log('Try close DB...');
  return db.close()
    .then(() => log('DB close.'))
    .then(() => process.exit(code));
}

return Promise.resolve()
  .then(() => MongoClient.connect(mongoUrl))
  .then((connectedDb) => {
    log(`Connected to ${mongoUrl}`);

    db = connectedDb;

    const query = { _id: 'id' };
    const update = { $inc: { counter: 1 } };
    const options = { upsert: true, returnOriginal: false };
    const counter = db.collection('counter');

    return counter.findOneAndUpdate(query, update, options)
      .then((result) => {
        const P0 = 'pi';
        const P1 = 'ka';
        const P2 = 'bu';
        const url = `http://${P0}${P1}${P2}.ru/story/_${result.value.counter}`;

        return scraper(url)
          .then((posts) => {
            if (Array.isArray(posts)) {
              return db.collection('posts').insertMany(posts);
            }
            return `No answer for ${url}`;
          })
          .then(result => log('Result', result.insertedCount || result));
      });

  })
  .then(() => closeDb())
  .catch(err => log('Error: ', err.stack || 'no stack', err))
  .then(() => closeDb(1));

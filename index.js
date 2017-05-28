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

function nextScrapParams (counter) {
  const query = { _id: 'id' };
  const update = { $inc: { counter: 1 } };
  const options = { upsert: true, returnOriginal: false };

  return counter.findOneAndUpdate(query, update, options)
    .then((result) => {
        const P0 = 'pi';
        const P1 = 'ka';
        const P2 = 'bu';

        const counter = result.value.counter;
        const url = `http://${P0}${P1}${P2}.ru/story/_${counter}`;

        return {
          url,
          counter,
        };
    });
}

function scrapStream (counter) {
  return nextScrapParams(counter)
    .then(params => {
      return scraper(params.url)
        .then((posts) => {
          log(`Spawn ${params.url}`);

          if (
            Array.isArray(posts)
            &&
            posts.length
          ) {
            return posts;
          }

          log(`No answer for ${params.url}`);
          return [];
        });
    });
}

return Promise.resolve()
  .then(() => MongoClient.connect(mongoUrl))
  .then((connectedDb) => {
    db = connectedDb;

    log(`Connected to ${mongoUrl}`);

    const counter = db.collection('counter');

    const parallel = [
      scrapStream(counter),
      scrapStream(counter),
      scrapStream(counter),
      scrapStream(counter),
      scrapStream(counter)
    ];

    return Promise.all(parallel)
      .then((all) => {
        const mergedPosts = [].concat.apply([], all);

        if (mergedPosts.length) {
          return db.collection('posts').insertMany(mergedPosts);
        }
        return `No answer`;
      })
      .then(result => log('Result', result.insertedCount || result));
  })
  .then(() => closeDb())
  .catch(err => log('Error: ', err.stack || 'no stack', err))
  .then(() => closeDb(1));

const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

PouchDB.debug.enable('pouchdb:find');

const localDB = new PouchDB(process.env.LOCAL_DB_HOST);

if (process.env.ENV == 'PRODUCTION') {
  const remoteDB = new PouchDB(process.env.REMOTE_DB_HOST);

  localDB
    .sync(remoteDB, {
      live: true,
      retry: true
    })
    .on('change', change => {
      // yo, something changed!
    })
    .on('error', err => {
      // yo, we got an error! (maybe the user went offline?)
      console.log(err);
    });
}

module.exports = localDB;

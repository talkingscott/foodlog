'use strict';

// We implement a promise-like pattern using events
const EventEmitter = require('events');
const util = require('util');

const level = require('level');

var lastId;

const db = level('./foodlog.db', {}, (err, db) => {
  db.createReadStream({reverse: true, limit: 1, keys: true, values: false})
    .on('data', (key) => {
      lastId = key;
      console.log('lastId = ' + lastId);
    })
    .on('error', (err) => {
      console.log('Error reading lastId: ' + err);
    })
    .on('close', () => {
      console.log('Stream closed for lastId');
    })
    .on('end', () => {
      console.log('Stream ended for lastId');
      if (lastId === undefined) {
        console.log('Assign lastId = 0');
        lastId = 0;
      }
    });
});

function addItem(item) {
  let emitter = new EventEmitter();
  let id = ++lastId;
  item.id = id;
  let json = JSON.stringify(item);
  db.put(id, json, (err) => {
    if (err) {
      let msg = 'Putting lastId ' + lastId + ': ' + err;
      console.log(msg);
      emitter.emit('error', msg);
    } else {
      emitter.emit('done', item);
    }
  });
  return emitter;
}

function getItems(maxCount) {
  let emitter = new EventEmitter();
  let items = [];
  let error = undefined;
  db.createReadStream({reverse: true, limit: maxCount, keys: false, values: true})
    .on('data', (value) => {
      let item = JSON.parse(value);
      console.log('Read item ' + util.inspect(item));
      items.unshift(item);
    })
    .on('error', (err) => {
      error = 'Error reading items: ' + err;
      console.log(error);
    })
    .on('close', () => {
      console.log('Stream closed for reading items');
    })
    .on('end', () => {
      console.log('Stream ended for reading items');
      if (error) {
        emitter.emit('error', error);
      } else {
        emitter.emit('done', items);
      }
    });
  return emitter;
}

exports.addItem = addItem;
exports.getItems = getItems;

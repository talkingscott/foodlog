'use strict';

// We implement a promise-like pattern using events
const EventEmitter = require('events');

const items = [];

function addItem(item) {
  let emitter = new EventEmitter();
  process.nextTick(function () {
    item.id = items.length;
    items.push(item);
    emitter.emit('done', item);
  });
  return emitter;
}

function getItems(maxCount) {
  let emitter = new EventEmitter();
  process.nextTick(function () {
    emitter.emit('done', items.slice(-maxCount));
  });
  return emitter;
}

exports.addItem = addItem;
exports.getItems = getItems;

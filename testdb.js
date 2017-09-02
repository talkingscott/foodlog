'use strict';

const items = [];

function addItem(item) {
  item.id = items.length;
  items.push(item);
}

function getItems(maxCount) {
  return items.slice(-maxCount);
}

exports.addItem = addItem;
exports.getItems = getItems;

//
// data respository
//
var useWebsockets;
var logItems;
var saveLogItemListeners = [];
var getLogItemsListeners = [];
function addSaveLogItemListener(listener) {
  saveLogItemListeners.push(listener);
}
function addGetLogItemsListener(listener) {
  getLogItemsListeners.push(listener);
}
function getConfig() {
  var req = $.ajax('/v1/config', {dataType: 'json', method: 'GET'});
  req.done(function (data) {
    useWebsockets = data.useWebsockets;
  });
  return req;
}
function saveLogItem(item) {
  var req = $.ajax('/v1/logItem', {contentType: 'application/json', data: JSON.stringify(item), dataType: 'json', method: 'POST', processData: false});
  if (!useWebsockets) {
    req.done(function (data) {
      logItems.push(data);
      saveLogItemListeners.forEach(function (listener) {
        listener(data);
      });
    });
  }
  return req;
}
function getLogItems(maxCount) {
  var req = $.ajax('/v1/logItems', {dataType: 'json', method: 'GET', query: {maxCount: maxCount}});
  req.done(function (data) {
    logItems = data;
    getLogItemsListeners.forEach(function (listener) {
      listener(data);
    });
  });
  return req;
}
function startWebSocket(refreshData) {
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  ws.onopen = function (event) {
    console.log("Websocket opened");
  };
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);
    logItems.push(data);
    saveLogItemListeners.forEach(function (listener) {
      listener(data);
    });
  };
  ws.onclose = function (event) {
    console.log("Websocket closed");
    refreshData(function () {
      startWebSocket(refreshData);
    });
  };
}

//
// entry tab behaviors
//
function reset() {
  $('#food').val('');
  $('#amount').val('1');
  $('#date').val('Today');
  $('#time').val('Now');
  $('#errors').text('');
  $('#alert').hide();
}
function clearErrors() {
  $('#alert').fadeOut(function () {
    $('#errors').text('');
  });
}
function setErrors(errors, isStatus) {
  if (isStatus) {
    $('#errors').text('Saved');
    $('#alert')
      .toggleClass('alert-danger', false)
      .toggleClass('alert-info', true)
      .show();
    setTimeout(clearErrors, 2000);
  } else {
    $('#errors').text(errors);
    $('#alert')
      .toggleClass('alert-danger', true)
      .toggleClass('alert-info', false)
      .show();
  }
}
function validate(food, amount, date, time) {
  var errors = '';
  if (!food) {
    errors += 'Food must be specified ';
  }
  if (!amount) {
    errors += 'Amount must be specified ';
  }
  if (!date) {
    errors += 'Date must be specified ';
  }
  if (!time) {
    errors += 'Time must be specified ';
  }
  return errors;
}
function save() {
  var food = $('#food').val();
  var amount = $('#amount').val();
  var date = $('#date').val();
  var time = $('#time').val();

  var errors = validate(food, amount, date, time);
  if (errors) {
    setErrors(errors);
    return;
  }

  var item = { food: food, amount: amount, date: date, time: time };
  var req = saveLogItem(item)
  req.done(function (data) {
    reset();
    setErrors('Saved', true);
  })
  req.fail(function (jqXHR, textStatus, errorThrown) {
    alert('ajax error: ' + errorThrown);
  });
}

//
// listing tab behaviors
//
function insertItem(listingBody, item) {
  var row = $(document.createElement('tr'))
    .append($(document.createElement('td'))
      .text(item.food))
    .append($(document.createElement('td'))
      .text(item.amount))
    .append($(document.createElement('td'))
      .text(item.date))
    .append($(document.createElement('td'))
      .text(item.time));
  listingBody.prepend(row);
}
function displayItems(items) {
  var listingBody = $('#listingBody');
  logItems.forEach(function (item) {
    insertItem(listingBody, item);
  });
}
function displayNewItem(item) {
  var listingBody = $('#listingBody');
  insertItem(listingBody, item);
}

//
// DOM ready
//
$(function () {
  // initialize entry tab
  $('#reset').on('click', reset);
  $('#save').on('click', save);
  reset();

  // hook listing tab up to data repository
  addSaveLogItemListener(displayNewItem);
  addGetLogItemsListener(displayItems);

  // initialize data repository
  var req = getConfig();
  req.done(function (data) {

    function refreshData(callback) {
      var req = getLogItems();
      req.done(function () {
        // Note the race condition: we miss anything posted
        // between our get and the establishment of our websocket.
        // Fortunately, we are not sending a human to Mars so we ignore.
        if (callback) {
          callback();
        }
      });
      req.fail(function (jqXHR, textStatus, errorThrown) {
        alert('ajax error: ' + errorThrown);
      });
    }

    if (data.useWebsockets) {
      refreshData(function () {
        startWebSocket(refreshData);
      });
    } else {
      refreshData();
    }
  });
});

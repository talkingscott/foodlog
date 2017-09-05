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
  $('#when').val('Now');
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
var days = ['now', 'today', 'yesterday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
function parseTime(aTime) {
  var tokens = aTime.toLowerCase().split(/\s+/);
  var tokensUsed = [];

  // Find the day specified, if any
  var day;
  for (var i = 0; i < tokens.length; i++) {
    var index = $.inArray(tokens[i], days);
    if (index >= 0) {
      day = days[index];
      tokensUsed.push(day);
      break;
    }
  }

  // Find the time specified, if any
  var offset = 0;
  for (var i = 0; i < tokens.length; i++) {
    var matches = tokens[i].match(/^(\-)*(\d{1,2})(:(\d\d))*$/);
    if (matches != null) {
      var sign = matches[1];
      var hours = matches[2];
      var minutes = matches[4];
      offset = ((parseInt(hours) * 60) + (minutes ? parseInt(minutes): 0)) * 60 * 1000;
      if (sign) {
        offset = -offset;
      }
      tokensUsed.push(tokens[i]);
      break;
    }
  }

  if (tokens.length != tokensUsed.length) {
    var unused = [];
    tokens.forEach(function (token) {
      if ($.inArray(token, tokensUsed) < 0) {
        unused.push(token);
      }
    });
    return 'Invalid token(s) for when: ' + unused;
  }

  // If no day was specified, it is 'now' if a negative time was specified, otherwise 'today'
  if (day === undefined) {
    day = (offset >= 0) ? 'today' : 'now';
  }

  // Calculate and return the corresponding Javascript Date
  var millis;
  var now = new Date();
  if (day === 'now') {
    millis = now.getTime();
  } else if (day === 'today') {
    millis = now.getTime(); // UTC
    millis = millis - (now.getTimezoneOffset() * 60 * 1000);  // local
    millis = millis - (millis % (24 * 60 * 60 * 1000)); // today local
    millis = millis + (now.getTimezoneOffset() * 60 * 1000);  // today UTC
  } else if (day === 'yesterday') {
    millis = now.getTime();
    millis = millis - (now.getTimezoneOffset() * 60 * 1000);
    millis = millis - (millis % (24 * 60 * 60 * 1000));
    millis = millis - (24 * 60 * 60 * 1000);
    millis = millis + (now.getTimezoneOffset() * 60 * 1000);
  } else {
    return 'Do not support yet: ' + day;
  }

  return new Date(millis + offset);
}
function validate(food, amount, when) {
  var errors = '';
  if (!food) {
    errors += 'Food must be specified ';
  }
  if (!amount) {
    errors += 'Amount must be specified ';
  }
  if (!when) {
    errors += 'When must be specified ';
  }
  return errors;
}
function save() {
  var food = $('#food').val();
  var amount = $('#amount').val();
  var when = $('#when').val();

  var errors = validate(food, amount, when);
  if (errors) {
    setErrors(errors);
    return;
  }

  var dt = parseTime(when);
  if (typeof(dt) === 'string') {
    setErrors(dt);
    return;
  }

  var item = { food: food, amount: amount, when: dt };
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
      .text(item.when));
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

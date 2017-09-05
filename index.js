'use strict'

const path = require('path');
const SocketServer = require('ws').Server;

//const db = require('./testdb');
const db = require('./leveldb');

const express = require('express');
const app = express();

const morgan = require('morgan');
app.use(morgan('dev'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = parseInt(process.env.PORT || 3000);
const defaultMaxCount = parseInt(process.env.DEFAULT_MAX_COUNT || 12);
const useWebsockets = parseInt(process.env.USE_WEBSOCKETS || 1);

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/v1/config', (req, res) => {
  let config = { useWebsockets: useWebsockets };
  res.status(200);
  res.send(config);
});

app.post('/v1/logItem', (req, res) => {
  let newItem = req.body;
  let cmd = db.addItem(newItem);
  cmd.on('done', function (item) {
    let json = JSON.stringify(item);
    broadcast(json);
    res.status(201);
    res.send(item);
  });
});

app.get('/v1/logItems', (req, res) => {
  let maxCount = req.query.maxCount || defaultMaxCount;
  let cmd = db.getItems(maxCount);
  cmd.on('done', function (items) {
    res.status(200);
    res.send(items);
  });
});

const server = app.listen(port, () => console.log('Listening on port ' + port));

var broadcast;

if (useWebsockets) {
  const wss = new SocketServer({ server });

  wss.on('connection', (ws, req) => {
    let ip = req.connection.remoteAddress;
    console.log('Websocket client connected from ' + ip);
    ws.on('close', () => console.log('Websocket client disconnected from ' + ip));
  });

  broadcast = function (msg) {
    wss.clients.forEach((client) => {
      client.send(msg);
    });
  }

  // TODO: websocket heartbeat cf. https://github.com/websockets/ws
} else {
  broadcast = function (msg) {
  }
}

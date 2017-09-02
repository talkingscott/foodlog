'use strict'

const path = require('path');
const SocketServer = require('ws').Server;

const db = require('./testdb');

const express = require('express');
const app = express();

const morgan = require('morgan');
app.use(morgan('dev'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = process.env['PORT'] || 3000;
const defaultMaxCount = process.env['DEFAULT_MAX_COUNT'] || 12;

app.use('/', express.static(path.join(__dirname, 'public')));

app.post('/v1/logItem', (req, res) => {
  let item = req.body;
  db.addItem(item);
  let json = JSON.stringify(item);
  wss.clients.forEach((client) => {
    client.send(json);
  });
  res.status(201);
  res.send(item);
});

app.get('/v1/logItems', (req, res) => {
  let maxCount = req.query.maxCount || defaultMaxCount;
  let items = db.getItems(maxCount);
  res.status(200);
  res.send(items);
});

const server = app.listen(port, () => console.log('Listening on port ' + port));

const wss = new SocketServer({ server });

wss.on('connection', (ws, req) => {
  let ip = req.connection.remoteAddress;
  console.log('Websocket client connected from ' + ip);
  ws.on('close', () => console.log('Websocket client disconnected from ' + ip));
});

// TODO: websocket heartbeat cf. https://github.com/websockets/ws

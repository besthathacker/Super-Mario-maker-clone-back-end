// server_v6.js
// Node.js backend for Super Mario Maker HTML5 v6
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });
const cors = require('cors');
app.use(cors());
app.use(express.json());

let levels = { 1: { level: [] } };
let players = {};

app.post('/saveLevel', (req, res) => {
  levels[1] = { level: req.body.level };
  res.json({status:"ok"});
});
app.get('/level/:id', (req, res) => {
  res.json(levels[req.params.id] || {level: []});
});

wss.on('connection', ws => {
  const id = Math.random().toString(36).substr(2,9);
  players[id] = {x:0,y:0};
  ws.on('message', msg => {
    let data = JSON.parse(msg);
    if (data.type === "update") {
      players[id] = {x:data.x,y:data.y};
      broadcastPlayers();
    }
  });
  ws.on('close', ()=> { delete players[id]; broadcastPlayers(); });
});

function broadcastPlayers() {
  const data = JSON.stringify({type:"players", players:Object.values(players)});
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(data); });
}

http.listen(3000, ()=>console.log('Server running on http://localhost:3000'));

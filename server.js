var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , nodeStatic = require('node-static');

var file = new(nodeStatic.Server)('./public');

app.listen(80);

function handler (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  });
}

var playerLife = 20;

var game = {
  'totalGameLifeUnits': 0,
  'playerLife': playerLife,
  'players': []
};

var playerId = 0;

colors = [
'#00accd',
'#0db14b',
'#92278f',
'#00909e',
'#d063a5',
'#fcaf17'
];

pressing_colors = [
'#006699',
'#006633',
'#660066',
'#006699',
'#993366',
'#cc6600'
];

var colorIndex = 0;

function addPlayer() {
  var player = {
    'life': playerLife,
    'color': colors[colorIndex],
    'pressing_colors': colors[colorIndex],
    'id': playerId
  };
  playerId = playerId + 1;
  colorIndex = (colorIndex + 1) % colors.length;
  game['players'].push(player);
  game['totalGameLifeUnits'] = game['totalGameLifeUnits'] + playerLife;
  return player;
}

function getPlayerById(anId) {
  for (var i = game['players'].length - 1; i >= 0; i--) {
    player = game['players'][i];
    if (player['id'] == anId) return player;
  }
}

io.sockets.on('connection', function (socket) {
  var player = addPlayer();

  socket.emit('connected', player);

  socket.emit('start', game);

  socket.broadcast.emit('turn', game);
  
  socket.on('hit', function (data) {
    player = getPlayerById(data['id']);
    player['life'] = player['life'] - 1;
    if (player['life'] == 0) {
      socket.broadcast.emit('dead', {'id': player['id']});
    };
    game['totalGameLifeUnits'] = game['totalGameLifeUnits'] - 1;
    socket.broadcast.emit('turn', game);
  });

});
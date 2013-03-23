var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , nodeStatic = require('node-static');

var file = new(nodeStatic.Server)('./public');

app.listen(80);

var quitMessage = [
  "You are too popular. You can't be alone.",
  "Your facebook friends are waiting for you.",
  "Maybe it's better you go check your facebook",
  "You thought that being alone was easy?",
  "You belong to a crowd.",
  "You are one too many.",
  "Come on, you know it's hard to be alone.",
  "You'll have to do better than that to be alone.",
  "Your #fail was epic.",
  "Too fast to like, too slow you died."
];

var quitCounter = 0;

function handler (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  });
}

var playerLife = 42;

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
  game['players'].unshift(player);
  game['totalGameLifeUnits'] = game['totalGameLifeUnits'] + playerLife;
  return player;
}

function getPlayerById(anId) {
  for (var i = game['players'].length - 1; i >= 0; i--) {
    player = game['players'][i];
    if (player['id'] == anId) return player;
  }
  return null;
}

function getPlayerBySocketId(socketId) {
  for (var i = game['players'].length - 1; i >= 0; i--) {
    player = game['players'][i];
    if (player['socketId'] == socketId) {
      return player;
    }
  }
}

function removePlayerSocketById(socketId) {
  var defector = getPlayerBySocketId(socketId);
  if (defector == null) return;
  var index = game['players'].indexOf(defector);
  game['players'].splice(index, 1);
  game['totalGameLifeUnits'] = game['totalGameLifeUnits'] - defector['life'];
  return defector['id'];
}

io.sockets.on('connection', function (socket) {
  var player = addPlayer();
  player['socketId'] = socket.id;

  socket.emit('connected', player);

  socket.emit('start', game);

  socket.broadcast.emit('turn', game);

  socket.on('disconnect', function(data) {
    defectorId = removePlayerSocketById(socket.id);
    socket.broadcast.emit('turn', game);
  });
  
  socket.on('hit', function (data) {
    player = getPlayerById(data['id']);
    me = getPlayerBySocketId(socket.id);
    if (player == null) return;
    if (player['life'] == 0) return;
    player['life'] = player['life'] - 1;
    game['totalGameLifeUnits'] = game['totalGameLifeUnits'] - 1;
    if (player['life'] == 0) {
      var index = game['players'].indexOf(player);
      game['players'].splice(index, 1);
      socket.broadcast.emit('dead', {'id': player['id'], 'text': quitMessage[quitCounter]});
      quitCounter = (quitCounter + 1) % quitMessage.length;
    }
    socket.broadcast.emit('turn', game);
  });

});
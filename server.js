var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , nodeStatic = require('node-static');

var file = new(nodeStatic.Server)('./public');

app.listen(80);

var quitMessage = [
  "You are too<br /> popular. You<br />can't be alone.",
  "Your facebook<br /> friends are<br /> waiting for you.",
  "Maybe it's better<br /> you go check<br /> your facebook",
  "You thought<br /> that being<br /> alone was easy?",
  "You belong<br /> to a crowd.",
  "You are<br /> one too many.",
  "Come on,<br /> you know it's<br /> hard to be alone.",
  "You'll have<br /> to do better<br /> than that to be alone.",
  "Your #fail<br /> was epic.",
  "Too fast to<br /> like, too slow<br /> you died."
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
'#993399',
'#99cc33',
'#009999',
'#ff0066',
'#cc0000',
'#33cc99',
'#9999cc',
'#ffcc66'
];

var colorIndex = 0;

function addPlayer() {
  var player = {
    'life': playerLife,
    'color': colors[colorIndex],
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
    // if (player['id'] == me['id']) {
    //   socket.emit('turn', game);
    // };
    socket.broadcast.emit('turn', game);
  });

});
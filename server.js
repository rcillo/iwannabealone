var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , nodeStatic = require('node-static');

var file = new(nodeStatic.Server)('./public');

app.listen(80);

var game = {
  'totalGameLifeUnits': 0,
  'players': [
    
  ]
};

function handler (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  });
}

io.sockets.on('connection', function (socket) {
  console.log('player joining');
  game['players'].push({'life': 5 });
  game['totalGameLifeUnits'] = game['totalGameLifeUnits'] + 5;
  socket.emit('connected', {index: game['players'].length - 1});
  socket.emit('start', game);
  socket.broadcast.emit('turn', game);
  
  socket.on('tap', function (data) {
    clickIndex = data['index']
    game['players'][clickIndex]['life'] = game['players'][clickIndex]['life'] - 1;
    game['totalGameLifeUnits'] = game['totalGameLifeUnits'] - 1;
    socket.broadcast.emit('turn', game);
    socket.emit('turn', game);
  });

});
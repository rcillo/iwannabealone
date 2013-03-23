var TOO_SMALL = 0.00001;

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function ortoDistance(thisPoint, thatPoint) {
  return Math.abs(thisPoint['x'] - thatPoint['x']) + Math.abs(thisPoint['y'] - thatPoint['y']);
}

function limitPoint(edge) {
  if (edge == 'TOP') return {'x': window.innerWidth, 'y': 0};
  if (edge == 'RIGHT') return {'x': window.innerWidth, 'y': window.innerHeight};
  if (edge == 'BOTTOM') return {'x':0, 'y': window.innerHeight};
  return {'x': 0, 'y': 0};
}

function pointsEdge(point) {
  if (point['y'] == 0 && point['x'] < window.innerWidth) {
    return 'TOP';
  } else if (point['x'] == window.innerWidth && point['y'] < window.innerHeight) {
    return 'RIGHT';
  } else if (point['x'] > 0 && point['y'] == window.innerHeight) {
    return 'BOTTOM';
  }
  return 'LEFT';
}

function isPointInsideCanvas(point) {
  if(point['x'] > window.innerWidth
    || point['y'] > window.innerHeight
    || point['x'] < 0
    || point['y'] < 0) return false;
  return true;
}

function nextPoint(base, basePoint, edge) {
  if (edge == 'TOP') {
    return {'x': basePoint['x'] + base, 'y': basePoint['y']};
  } else if (edge == 'RIGHT') {
    return {'x': basePoint['x'], 'y': basePoint['y'] + base };
  } else if (edge == 'BOTTOM') {
    return {'x': basePoint['x'] - base, 'y': basePoint['y'] };
  }
  return {'x': basePoint['x'], 'y': basePoint['y'] - base }; // LEFT
}

function polygonWithArea(area, points) {
  if (area < TOO_SMALL) return;
  var edge = pointsEdge(points.last());
  var height = (edge == 'TOP' || edge == 'BOTTOM') ? window.innerHeight / 2.0 : window.innerWidth / 2.0;
  var base = area * 2.0 / height;
  var pointCandidate = nextPoint(base, points.last(), edge);
  if (isPointInsideCanvas(pointCandidate)) {
    points.push(pointCandidate);
  } else {
    points.push(limitPoint(edge));
    var availableBase = ortoDistance(points[points.length - 2], points.last());
    var filledArea = availableBase * height / 2.0;
    polygonWithArea(area - filledArea, points);
  }
}

function rectanglePizzaTesselateStrategy(game) {
  var totalArea = window.innerWidth * window.innerHeight;
  var lifeUnitArea = totalArea * 1.0 / game['totalGameLifeUnits'];
  polygons = [];
  startPoint = {'x': window.innerWidth / 2.0, 'y': 0};
  for (var i = game.players.length - 1; i >= 0; i--) {
     var player = game['players'][i];
     var playerArea = player['life'] * lifeUnitArea;
     var polygon = [startPoint];
     polygonWithArea(playerArea, polygon);
     polygons.push(polygon);
     startPoint = polygon.last();
  }
  return polygons;
}

function drawTesselation(tesselation) {
  var canvas = $('#game');
  c2 = canvas[0].getContext('2d');
  c2.canvas.width  = window.innerWidth;
  c2.canvas.height = window.innerHeight;
  for (var i = tesselation.length - 1; i >= 0; i--) {
    points = tesselation[i];
    c2.fillStyle = '#f00';
    c2.beginPath();
    c2.moveTo(window.innerWidth / 2.0, window.innerHeight / 2.0);
    for (var i = points.length - 1; i >= 0; i--) {
      point = points[i];
      c2.lineTo(point['x'], point['y']);
    };
    c2.closePath();
    c2.fill();
  };
}

function render(game) {
  var canvas = $('#game');
  ctx = canvas[0].getContext('2d');
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  // ctx.strokeStyle = colorPicker.val();
  ctx.lineCap = "round"
  ctx.lineWidth = 15;

  for (var i = game.players.length - 1; i >= 0; i--) {
    game.players[i]
  };

  data = {
    'line': {
      'startX':10,
      'startY':10,
      'endX':200,
      'endY':200  
    }
  }

  ctx.beginPath();
  ctx.moveTo(data.line.startX,data.line.startY);
  ctx.lineTo(data.line.endX, data.line.endY);
  // ctx.strokeStyle = data.line.color;
  ctx.stroke();
  // ctx.strokeStyle = colorPicker.val();

}

var socket = io.connect('http://localhost');
socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});

jQuery(document).ready(function($) {
  var game = {
    'totalGameLifeUnits': 50,
    'players': [
      {'life': 20 },
      // {'life': 25 }
    ]
  };
  var tesselation = rectanglePizzaTesselateStrategy(game);
  console.log(tesselation);
  drawTesselation(tesselation);
});
var TOO_SMALL = 0.00001;

var FPS = 30;

var pressing = null;

var myIndex;

colors = [
'#00accd',
'#0db14b',
'#92278f',
'#00909e',
'#d063a5',
'#fcaf17'
]

pressing_colors = [
'#006699',
'#006633',
'#660066',
'#006699',
'#993366',
'#cc6600'
]

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function centerPoint() {
  return {'x': window.innerWidth / 2.0, 'y': window.innerHeight / 2.0};
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

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [v1.0]
function isPointInPoly(poly, pt){
  for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
    ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
    && (c = !c);
  return c;
}

function areaIndexForPoint(point) {
  var tesselation = rectanglePizzaTesselateStrategy(game);
  var center = centerPoint();
  for (var i = tesselation.length - 1; i >= 0; i--) {
    poly = tesselation[i];
    poly.unshift(center);
    poly.push(center);
    if (isPointInPoly(poly, point)) return i;
  };
}

function drawTesselation(tesselation) {
  var canvas = $('#game');
  c2 = canvas[0].getContext('2d');
  c2.canvas.width  = window.innerWidth;
  c2.canvas.height = window.innerHeight;

  var pressingIndex;
  if (pressing != null) pressingIndex = areaIndexForPoint(pressing);

  for (var i = tesselation.length - 1; i >= 0; i--) {
    points = tesselation[i];
    if (pressing != null && pressingIndex == i) {
      c2.fillStyle = pressing_colors[i % colors.length];  
    } else {
      c2.fillStyle = colors[i % colors.length];  
    }
    c2.beginPath();
    c2.moveTo(window.innerWidth / 2.0, window.innerHeight / 2.0);
    for (var j = points.length - 1; j >= 0; j--) {
      point = points[j];
      c2.lineTo(point['x'], point['y']);
    };
    c2.closePath();
    c2.fill();
  };
}

var socket = io.connect('http://192.168.25.4');

function addListeners() {
  $('canvas').mousedown(function(event) {
    pressing = {'x': event.offsetX, 'y': event.offsetY};
  });
  $(document).mouseup(function(event) {
    pressing = null;
  });
  $('canvas').click(function(event) {
    var clickIndex = areaIndexForPoint({'x': event.offsetX, 'y': event.offsetY});
    clickIndex = game['players'].length - clickIndex - 1;
    game['players'][clickIndex]['life'] = game['players'][clickIndex]['life'] - 1;
    game['totalGameLifeUnits'] = game['totalGameLifeUnits'] - 1;
    socket.emit('tap', { index: clickIndex });
  });
}

function update() {
  var tesselation = rectanglePizzaTesselateStrategy(game);
  drawTesselation(tesselation);
}


socket.on('turn', function (data) {
  game = data
});
socket.on('connected', function (data) {
  myIndex = data['index'];
});
socket.on('start', function(data) {
  game = data;
  addListeners();
  setInterval(function() {
    update();
  }, 1000/FPS);
});

// jQuery(document).ready(function($) {
  
// });

// (function($) {
//   var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
//   $.fn.nodoubletapzoom = function() {
//     if (IS_IOS)
//       $(this).bind('touchstart', function preventZoom(e) {
//         var t2 = e.timeStamp
//           , t1 = $(this).data('lastTouch') || t2
//           , dt = t2 - t1
//           , fingers = e.originalEvent.touches.length;
//         $(this).data('lastTouch', t2);
//         if (!dt || dt > 500 || fingers > 1) return; // not double-tap
 
//         e.preventDefault(); // double tap - prevent the zoom
//         // also synthesize click events we just swallowed up
//         $(this).trigger('click').trigger('click');
//       });
//   };
// })(jQuery);


window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);
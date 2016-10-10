const WIDTH   = 360;
const HEIGHT  = 160;

const LINE    = 1/3;
const MARKER  = 3;
const MARCHER = 3.5;
const NUMBERS = {
  top: 27,
  size: 6
};

const HIGHSCHOOL = {
  front:    HEIGHT / 3,
  between:  HEIGHT / 3,
  kickoff:  40
};
const COLLEGE = {
  front:    60,
  between:  40,
  kickoff:  35
};
const PRO = {
  front:    70.75,
  between:  18.5,
  kickoff:  35
};

const COLORS = {
  field:    '#689f38',
  endzone:  '#e04e39',
  performer:  {
    fill:   '#e04e39',
    stroke: '#13294b',
    text:   '#fff'
  }
};



// Global variables
var drill = {};
var hashes = [
  COLLEGE
];
var selected;



if (!SVG.supported) {
  alert('SVG not supported');
}

var draw = SVG('drawing');
var zoom = {
  min: 1,
  max: 4,
  level: 1,
  x: 0,
  y: HEIGHT/2
}
draw.viewbox(-(WIDTH / 2 + 5), -(HEIGHT + 5), WIDTH + 10, HEIGHT + 10);
/* console.log(window.getComputedStyle(draw.parent()).height);
console.log(window.getComputedStyle(document.getElementById('status')).height); */
draw.on('wheel', function(e) {
  /* let bbox = draw.node.getBoundingClientRect();
  let abs = {
    x: e.clientX || e.touches[0].pageX - bbox.left,
    y: e.clientY || e.touches[0].pageY - bbox.top
  };

  console.log(e.deltaY, e.offsetX, e.offsetY);

  let temp = zoom.level + e.deltaY / 100;
  if (temp >= zoom.min && temp <= zoom.max) {
    zoom.level = temp;
    // draw.node.style.transformOrigin = `${abs.x} ${abs.y}`;
    draw.node.style.transform = `scale(${zoom.level})`;
  } */

  /* draw.viewbox({
    x: -WIDTH/4,
    y: -HEIGHT*3/4,
    width: WIDTH/4,
    height: HEIGHT/4
  }) */
});

// Sub-pixel offset fix
SVG.on(window, 'resize', function () { draw.spof(); });



// Draw field and markings
var drawField = function() {
  var drawYardLine = function(yard) {
    yard *= 3;
    let line = draw.group();

    // Yard line
    line.line(yard, 0, yard, -HEIGHT)
        .stroke({
          color: '#fff',
          width: LINE
        });

    let drawMarker = function(vert) {
      return line.line(yard - MARKER/2, vert, yard + MARKER/2, vert)
        .stroke({
          color: '#fff',
          width: LINE
        });
    };
    let drawYardMarkers = function(vert) {
      if (yard != 0) {
        for (let i = 3; i < 15; i += 3) {
          drawMarker(vert - MARKER/2)
            .translate(yard < 0 ? i : -i, 0)
            .rotate(90);
        }
      }
    };
    let drawNumbers = function() {
      let text = line.text(String(50 - Math.abs(yard / 3)))
        .font({
          family: 'Helvetica',
          size:   NUMBERS.size,
          anchor: 'middle'
        })
        .fill({
          color: '#fff'
        });
      // text.on('mousedown', e => e.preventDefault());
      return text;
    };

    drawYardMarkers(0);
    drawYardMarkers(-(HEIGHT - MARKER));

    for (let hash of hashes) {
      drawYardMarkers(-(hash.front - MARKER));
      drawYardMarkers(-(hash.front + hash.between));

      if (Math.abs(yard) != 150) {
        // Front hash
        line.line(yard - MARKER/2, -hash.front, yard + MARKER/2, -hash.front)
            .stroke({
              color: '#fff',
              width: LINE
            });

        // Back hash
        line.line(yard - MARKER/2, -(hash.front + hash.between), yard + MARKER/2, -(hash.front + hash.between))
            .stroke({
              color: '#fff',
              width: LINE
            });
      }
    }

    switch (Math.abs(yard)) {
      case 45:
        drawMarker(-HEIGHT/2).rotate(-45);
        drawMarker(-HEIGHT/2).rotate(45);
        break;
      case 150:

    }

    if (!(yard % 30) && Math.abs(yard) != 150) {
      drawNumbers().move(yard, -NUMBERS.top);
      drawNumbers().move(yard, -(HEIGHT + NUMBERS.size - NUMBERS.top)).rotate(180);
    }
  };
  var drawEndZone = function(side) {
    return draw.rect(30, HEIGHT)
        .translate(165 * side - 15, -HEIGHT)
        .fill({
          color: COLORS.endzone,
          opacity: 1
        });
  };

  // Field background
  draw.rect(WIDTH + 5, HEIGHT + 5)
      .translate(-(WIDTH/2 + 2.5), -(HEIGHT + 2.5))
      .fill({
        color: COLORS.field,
        opacity: 1
      })
      .stroke({
        color: '#fff',
        width: 5
      });

  // Endzones
  drawEndZone(-1);
  drawEndZone(+1);

  // Yardlines
  for (let i = -50; i <= 50; i += 5) {
    drawYardLine(i);
  }

  // Field grid
  let grid = draw.group();

  // Vertical 4-step lines
  for (let i = 7.5; i < 160; i += 7.5) {
    grid.line(-WIDTH / 2 + 30, -i, WIDTH / 2 - 30, -i)
        .stroke({
          color: '#fff',
          width: 0.2,
          opacity: 0.25
        });
  }

  // Horizontal 4-step lines
  for (let i = -WIDTH / 2 + 37.5; i < WIDTH / 2 - 30; i += 15) {
    grid.line(i, 0, i, -HEIGHT)
        .stroke({
          color: '#fff',
          width: 0.2,
          opacity: 0.25
        });
  }

  // Zero points
  for (let i = -WIDTH / 2 + 45; i < WIDTH / 2 - 30; i += 15) {
    for (let ii = 0; ii < HEIGHT; ii += 15) {
      grid.circle(LINE * 3)
          .center(
            i,
            -ii
          )
          .fill({
            color: '#fff',
            opacity: 0.5
          })
          .stroke({
            width: 0
          });
    }
  }
};
// Draw all performers
var drawPerformers = function() {
  for (let p of drill.performers) {
    p.selected = false;

    p.icon = draw.group();
    p.icon.style('cursor', 'pointer');
    p.icon.circle(MARCHER)
      .center(0, 0)
      .fill({
        color: COLORS.performer.fill,
        opacity: 1
      })
      .stroke({
        color: COLORS.performer.stroke,
        width: 0
      });
    p.icon.text(_getName(p))
      .translate(0, -MARCHER/2)
      .font({
        family: 'Helvetica',
        size: MARCHER/2,
        anchor: 'middle'
      })
      .fill({
        color: COLORS.performer.text
      });

    p.icon.on('mousedown', function(e) {
      // e.preventDefault();
      _selectPerformer(p);
    });
  }

  // Load the first set
  loadSet(1);
};

var set = 1;
var playing = false;
var updateSet = function(dir) {
  let s = drill.sets[set - 1];
  let t = s.counts * 1000 * 60 / s.tempo;
  if (s.pulse === 'half') {
    t *= 2;
  }

  let status = `Set ${s.name}`;
  // TODO: fix button positioning (set > 1)
  if (set >= 1) {
    status += ` (${s.counts} counts at ${s.tempo}bpm${s.pulse ? ' ' + s.pulse + ' time' : ''})`;
  }
  document.getElementById('status').children[0].firstChild.textContent = status;
  if (selected) {
    document.getElementById('status').children[1].children[0].textContent = `Performer ${_getName(selected)}\n${_getHoriz(selected, set - 1)}\n${_getVert(selected, set - 1)}`;
  }

  for (let p of drill.performers) {
    let icon = p.icon;
    let count = 0;
    let metCount;

    if (!playing) {
      icon.finish();
    }

    let duringCallback = function(counts) {
      return function(pos, morph, eased, situation) {
        pos = parseInt(pos * counts);
        if (pos !== metCount) {
          metCount = pos;
          if (pos < counts) {
            count++;
            console.log(count);
          }

          // document.getElementById(metCount ? 'click2' : 'click1').play();
        }
      };
    };

    if (p.sets[set - 1] instanceof Array) {
      for (let m of p.sets[set - 1]) {
        if (playing && dir == 1) {
          icon = icon.animate(m.counts * 1000 * 60 / s.tempo, '-');

          if (p === drill.performers[0]) {
            icon = icon.during(duringCallback(m.counts));
          }
        }

        if (m.type === "move") {
          icon = icon.move(
            m.x * 15 / 8,
            -m.y * 15 / 8
          );
        }
      }
    } else {
      if (playing && dir == 1) {
        icon = icon.animate(t, '-');

        if (p === drill.performers[0]) {
          icon = icon.during(duringCallback(s.counts));
        }
      }

      icon.move(
        p.sets[set - 1].x * 15 / 8,
        -p.sets[set - 1].y * 15 / 8
      );
    }
  }

  return set;
};
var prevSet = function(stop) {
  if (stop) {
    playing = false;
  }
  if (set > 1) {
    set--;
    return updateSet(-1);
  }
};
var nextSet = function(stop) {
  if (stop) {
    playing = false;
  }
  if (set < drill.sets.length) {
    set++;
    return updateSet(1);
  } else if (set == drill.sets.length) {
    return updateSet(0);
  }
};
var loadSet = function(s) {
  if (s > 0 && s <= drill.sets.length) {
    set = s;
    return updateSet(0);
  }
};
var playPause = function() {
  for (let p of drill.performers) {
    if (playing) {
      p.icon.pause();
    } else {
      p.icon.play();
    }
  }

  playing = !playing;
  document.getElementById('status').children[0].children[2].innerText = playing ? 'Pause' : 'Play';
};
var play = function() {
  playing = false;
  loadSet(set);
  playing = true;

  // TODO: fix this
  while (set != drill.sets.length) {
    nextSet();
  }
};
var _selectPerformer = function(p) {
  if (selected !== p) {
    _selectPerformer(selected);
    selected = p;
  } else {
    selected = undefined;
  }

  if (p) {
    p.selected = !p.selected;
    p.icon.first().stroke({
      width: p.selected ? 0.25 : 0
    });
    document.getElementById('status').children[1].children[0].textContent = p.selected ? `Performer ${_getName(p)}\n${_getHoriz(p, set - 1)}\n${_getVert(p, set - 1)}` : '\n\n\n';
  }
};
var _getName = function(p) {
  return p.squad !== undefined ? p.squad + p.position : p.type + p.num;
};
var _getHoriz = function(p, s) {
  let x;
  if (p.sets[s] instanceof Array) {
    for (let a of p.sets[s]) {
      if (a.x !== undefined) {
        x = a.x;
      }
    }

    if (x === undefined) {
      return _getHoriz(p, s - 1);
    }
  } else {
    x = p.sets[s].x;
  }

  let horiz = x ? (x < 0 ? 'Left: ' : 'Right: ') : '';

  let yard = 80 - Math.abs(x);
  let offset = yard % 8;
  offset = offset <= 4 ? offset : offset - 8;
  yard = (yard - offset) / 8 * 5;

  if (offset) {
    if (offset === 4) {
      // horiz += `Splitting ${yard} and ${yard + 5} yd lns`;
    } else {}
    horiz += `${Math.abs(offset)} steps ${offset > 0 ? 'inside' : 'outside'} ${yard} yd ln`;
  } else {
    horiz += yard ? `On ${yard} yd ln` : 'On goal ln';
  }

  return p.sets[s].horiz || horiz;
};
var _getVert = function(p, s) {
  let y;
  if (p.sets[s] instanceof Array) {
    for (let a of p.sets[s]) {
      if (a.y !== undefined) {
        y = a.y;
      }
    }

    if (y === undefined) {
      return _getVert(p, s - 1);
    }
  } else {
    y = p.sets[s].y;
  }

  let vert;
  if (y === 0) {
    vert = 'On Home side line';
  } else if (y <= 16) {
    vert = `${y} steps behind Home side line`;
  } else if (y < 32) {
    vert = `${32 - y} steps in front of Home hash`;
  } else if (y === 32) {
    vert = 'On Home hash'
  } else if (y <= 42+2/3) {
    vert = `${y - 32} steps behind Home hash`;
  } else if (y < 53+1/3) {
    vert = `${53+1/3 - y} steps in front of Visitor hash`;
  } else if (y === 53+1/3) {
    vert = 'On Visitor hash'
  } else if (y < 69+1/3) {
    vert = `${y - 53+1/3} steps behind Visitor hash`;
  } else if (y < 85+1/3) {
    vert = `${85+1/3 - y} steps in front of Visitor side line`;
  } else {
    vert = 'On Visitor side line';
  }

  return p.sets[s].vert || vert;
};
var select = function(name) {
  for (let p of drill.performers) {
    if (_getName(p).toUpperCase() === name.toUpperCase()) {
      _selectPerformer(p);
      return p;
    }
  }
};
var loadDrill = function(name) {
  $.getJSON(`drill/${name}.json`, function(data) {
    drill = data;
    document.getElementById('status').children[0].lastChild.textContent = drill.name;
    drawPerformers();
    // select(_getName(drill.performers[0]));
  });
};

document.addEventListener('keydown', function(e) {
  switch (e.key) {
    case 'ArrowLeft':
      prevSet();
      break;
    case 'ArrowRight':
      nextSet();
      break;
    case 'ArrowDown':
      loadSet(1);
      break;
  }
}, false);



// Draw the field
drawField();
loadDrill('');

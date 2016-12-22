const WIDTH   = 360;
const HEIGHT  = 160;

const LINE    = 1/3;
const MARKER  = 3;
const MARCHER = 3;
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
  marcher:  {
    icon: '#e04e39',
    text: '#13294b'
  }
};



var sets = [
  {
    name: '1',
    counts: 0,
    tempo: 120
  },
  {
    name: '2',
    counts: 16,
    tempo: 120
  },
  {
    name: '3',
    counts: 16,
    tempo: 120
  },
  {
    name: '4',
    counts: 16,
    tempo: 120
  },
  {
    name: '5',
    counts: 16,
    tempo: 120
  },
  {
    name: '6',
    counts: 16,
    tempo: 120
  },
  {
    name: '7',
    counts: 16,
    tempo: 120
  },
  {
    name: '8',
    counts: 4,
    tempo: 120
  }
];
var marchers = {
  'A1': {
    dots: [
      {
        x: -24,
        y: 64.5
      },
      {
        x: -16,
        y: 48
      },
      {
        x: -32,
        y: 48
      },
      {
        x: -44,
        y: 44
      },
      {
        x: -60,
        y: 34
      },
      {
        x: -60,
        y: 34
      },
      {
        x: -64,
        y: 17
      },
      {
        x: -76,
        y: 28
      }
    ]
  },
  'A2': {
    dots: [
      {
        x: -6,
        y: 64
      },
      {
        x: -12,
        y: 48
      },
      {
        x: -28,
        y: 48
      },
      {
        x: -44,
        y: 48
      },
      {
        x: -58,
        y: 35.25
      },
      {
        x: -58,
        y: 35.25
      },
      {
        x: -63.75,
        y: 19.5
      },
      {
        x: -72,
        y: 28
      }
    ]
  },
  'A3': {
    dots: [
      {
        x: -6,
        y: 56
      },
      {
        x: -12,
        y: 40
      },
      {
        x: -28,
        y: 40
      },
      {
        x: -40,
        y: 44
      },
      {
        x: -55.75,
        y: 36.5
      },
      {
        x: -55.75,
        y: 36.5
      },
      {
        x: -63,
        y: 21.75
      },
      {
        x: -68,
        y: 28
      }
    ]
  },
  'A4': {
    dots: [
      {
        x: -4,
        y: 64
      },
      {
        x: -8,
        y: 48
      },
      {
        x: -24,
        y: 48
      },
      {
        x: -40,
        y: 48
      },
      {
        x: -53.5,
        y: 37.75
      },
      {
        x: -53.5,
        y: 37.75
      },
      {
        x: -62,
        y: 24.25
      },
      {
        x: -64,
        y: 28
      }
    ]
  },
  'A5': {
    dots: [
      {
        x: -8,
        y: 56
      },
      {
        x: -16,
        y: 40
      },
      {
        x: -32,
        y: 40
      },
      {
        x: -36,
        y: 44
      },
      {
        x: -51.25,
        y: 39
      },
      {
        x: -51.25,
        y: 39
      },
      {
        x: -60.75,
        y: 26.5
      },
      {
        x: -60,
        y: 28
      }
    ]
  },
  'A6': {
    dots: [
      {
        x: -2,
        y: 64
      },
      {
        x: -4,
        y: 48
      },
      {
        x: -20,
        y: 48
      },
      {
        x: -36,
        y: 48
      },
      {
        x: -48.75,
        y: 40
      },
      {
        x: -48.75,
        y: 40
      },
      {
        x: -58.75,
        y: 28.25
      },
      {
        x: -56,
        y: 28
      }
    ]
  },
  'A7': {
    dots: [
      {
        x: -10,
        y: 56
      },
      {
        x: -20,
        y: 40
      },
      {
        x: -36,
        y: 40
      },
      {
        x: -32,
        y: 44
      },
      {
        x: -46.5,
        y: 40.75
      },
      {
        x: -46.5,
        y: 40.75
      },
      {
        x: -56.75,
        y: 29.75
      },
      {
        x: -52,
        y: 28
      }
    ]
  },
  'A8': {
    dots: [
      {
        x: 0,
        y: 64
      },
      {
        x: 0,
        y: 48
      },
      {
        x: -16,
        y: 48
      },
      {
        x: -32,
        y: 48
      },
      {
        x: -44,
        y: 41.5
      },
      {
        x: -44,
        y: 41.5
      },
      {
        x: -54.5,
        y: 30.75
      },
      {
        x: -48,
        y: 28
      }
    ]
  },
  'A9': {
    dots: [
      {
        x: -24,
        y: 54.5
      },
      {
        x: -24,
        y: 40
      },
      {
        x: -40,
        y: 40
      },
      {
        x: -28,
        y: 44
      },
      {
        x: -41.5,
        y: 42.25
      },
      {
        x: -41.5,
        y: 42.25
      },
      {
        x: -52,
        y: 31.5
      },
      {
        x: -44,
        y: 28
      }
    ]
  },
  'A10': {
    dots: [
      {
        x: 2,
        y: 64
      },
      {
        x: 4,
        y: 48
      },
      {
        x: -12,
        y: 48
      },
      {
        x: -28,
        y: 48
      },
      {
        x: -39,
        y: 42.75
      },
      {
        x: -39,
        y: 42.75
      },
      {
        x: -49.5,
        y: 32
      },
      {
        x: -40,
        y: 28
      }
    ]
  }
};
var hashes = [
  COLLEGE
];



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

var animations = draw.set();

// Sub-pixel offset fix
SVG.on(window, 'resize', function () { draw.spof(); });



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
var drawField = function() {
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

var set = 1;
var playing = false;
var updateSet = function(dir) {
  let s = sets[set - 1];
  let t = s.counts * 1000 * 60 / s.tempo;

  let status = `Set ${s.name}`;
  // TODO: fix button positioning (set > 1)
  if (set >= 1) {
    status += ` (${s.counts} counts at ${s.tempo}bpm)`;
  }
  document.getElementById('status').firstChild.textContent = status;

  for (let m in marchers) {
    let marcher = marchers[m];
    let icon = marcher.icon;

    if (playing && dir == 1) {
      icon.finish();
      icon = icon.animate(t).after(function(situation) {
        animations.remove(icon);
        continueSet();
      });
      animations.add(icon);
    }

    icon.move(
      marcher.dots[set - 1].x * 15 / 8,
      -marcher.dots[set - 1].y * 15 / 8
    );
  }

  return set;
};
var prevSet = function() {
  if (set > 1) {
    set--;
    animations.each(function(i) {
      this.finish();
      animations.remove(this);
    });
    return updateSet(-1);
  }
};
var nextSet = function() {
  if (set < sets.length) {
    set++;
    return updateSet(1);
  } else if (set == sets.length) {
    return updateSet(0);
  }
};
var loadSet = function(s) {
  if (s > 0 && s <= sets.length) {
    set = s;
    return updateSet(0);
  }
};
var continueSet = function() {
  if (playing && !animations.members.length) {
    console.log(animations);
    nextSet();
  }
};
var playPause = function() {
  playing = !playing;

  if (playing) {
    if (animations.members.length) {
      animations.each(function(i) {
        this.play()
      });
    } else {
      nextSet();
    }
  } else {
    animations.each(function(i) {
      this.pause()
    });
  }

  document.getElementById('status').children[2].innerText = playing ? 'Pause' : 'Play';
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

// Render the field and marchers
var render = function() {
  // Draw the field
  drawField();

  // Draw all marchers
  let icons = draw.group();
  for (let m in marchers) {
    let marcher = marchers[m];
    marcher.selected = false;

    marcher.icon = icons.group();
    marcher.icon.style('cursor', 'pointer');
    marcher.icon.circle(MARCHER)
      .center(0, 0)
      .fill({
        color: COLORS.marcher.icon,
        opacity: 1
      })
      .stroke({
        color: COLORS.marcher.text,
        width: 0
      });
    marcher.icon.text(m)
      .translate(0, -MARCHER*2/3)
      .font({
        family: 'Helvetica',
        size: MARCHER*2/3,
        anchor: 'middle'
      })
      .fill({
        color: COLORS.marcher.text
      });

    marcher.icon.on('mousedown', function(e) {
      // e.preventDefault();

      marcher.selected = !marcher.selected;
      marcher.icon.first().stroke({
        width: marcher.selected ? 0.25 : 0
      });
    });
  }

  // Load the first set
  loadSet(1);
};



render();

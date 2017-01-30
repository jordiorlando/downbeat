var shows, data, drill, music;
var drillElem = document.getElementById('drill');
var musicElem = document.getElementById('music');

function parseName(p) {
  return p.squad === undefined ? p.type + p.num : p.squad + p.position;
}
function parseHoriz(p, s) {
  let x;
  if (p.sets[s] instanceof Array) {
    for (let a of p.sets[s]) {
      if (a.x !== undefined) {
        x = a.x;
      }
    }

    if (x === undefined) {
      return parseHoriz(p, s - 1);
    }
  } else {
    x = p.sets[s].x;
  }

  let horiz = x ? (x < 0 ? 'Left: ' : 'Right: ') : '';

  let yard = x.abs().subtract(80).negate();
  let offset = yard.modulo(8);
  offset = offset <= 4 ? offset : offset.subtract(8);
  yard = yard.subtract(offset).divide(8).multiply(5);

  if (offset) {
    /* if (offset.equals(4)) {
      horiz += `Splitting ${yard} and ${yard + 5} yd lns`;
    } else {} */

    horiz += `${offset.abs()} steps ${offset > 0 ? 'inside' : 'outside'} ${yard} yd ln`;
  } else {
    horiz += yard ? `On ${yard} yd ln` : 'On goal ln';
  }

  return p.sets[s].horiz || horiz;
}
function parseVert(p, s) {
  let y;
  if (p.sets[s] instanceof Array) {
    for (let a of p.sets[s]) {
      if (a.y !== undefined) {
        y = a.y;
      }
    }

    if (y === undefined) {
      return parseVert(p, s - 1);
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
    vert = `${y.subtract(32).negate()} steps in front of Home hash`;
  } else if (y.equals(32)) {
    vert = 'On Home hash';
  } else if (y <= new Fraction(42, 2, 3)) {
    vert = `${y.subtract(32)} steps behind Home hash`;
  } else if (y < new Fraction(53, 1, 3)) {
    vert = `${y.subtract(53, 1, 3).negate()} steps in front of Visitor hash`;
  } else if (y.equals(53, 1, 3)) {
    vert = 'On Visitor hash';
  } else if (y < new Fraction(69, 1, 3)) {
    vert = `${y.subtract(53, 1, 3)} steps behind Visitor hash`;
  } else if (y < new Fraction(85, 1, 3)) {
    vert = `${y.subtract(85, 1, 3).negate()} steps in front of Visitor side line`;
  } else {
    vert = 'On Visitor side line';
  }

  return p.sets[s].vert || vert;
}

var load = function(season, show, part) {
  d3.json('data/data.json', d => {
    data = d;

    for (let i in data.seasons) {
      if (data.seasons[i].name === season) {
        for (let j in data.seasons[i].shows) {
          if (data.seasons[i].shows[j].name === show) {
            for (let k in data.seasons[i].shows[j].parts) {
              if (data.seasons[i].shows[j].parts[k] === part) {
                drill = new Drill(season, show, part);
                music = new Music(season, show, part);
              }
            }
          }
        }
      }
    }
  });
}

document.addEventListener('keydown', function(e) {
  if (drillElem.classList.contains('is-active')) {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        drill.playPause();
        break;
      case 'ArrowLeft':
        drill.prevSet();
        break;
      case 'ArrowRight':
        drill.nextSet();
        break;
    }
  } else if (musicElem.classList.contains('is-active')) {
    switch (e.key) {
      case 'ArrowLeft':
        music.prevPage();
        break;
      case 'ArrowRight':
        music.nextPage();
        break;
    }
  }
}, false);



load('2016', 'Show 4 - Buddy Rich Show', 'Buddy Rich Show');
// loadDrill('pregame/revised');

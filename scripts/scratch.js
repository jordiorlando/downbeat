var count = 0;
var countID;
var set = 1;
var playing = false;

var requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.oRequestAnimationFrame;
var cancelAnimationFrame =
  window.cancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.msCancelAnimationFrame;



// .on('mousedown', d => d3.event.preventDefault())

d3.json('field.json', function(data) {
  dimensions = data;

  let recurse = function(d) {
    for (let i in d) {
      if (d[i] instanceof Array) {
        d[i] = new Fraction(d[i]);
      } else if (d[i] instanceof Object) {
        recurse(d[i]);
      }
    }
  };

  recurse(dimensions);
  console.log(dimensions);
});



svg.append('rect')
  .attr('width', MULT*(DIMENSIONS.width + DIMENSIONS.border * 2))
  .attr('height', MULT*(DIMENSIONS.height + DIMENSIONS.border * 2))
  .style('fill', 'none')
  .style('pointer-events', 'all');

this.group = svg.append('g')
  .attr('transform', `translate(${MULT*(DIMENSIONS.width / 2 + DIMENSIONS.border)}, ${MULT*(DIMENSIONS.height + DIMENSIONS.border)}) scale(${MULT})`);

svg.call(d3.zoom()
  .translateExtent([[-MULT*DIMENSIONS.width / 2, -MULT*DIMENSIONS.height], [MULT*DIMENSIONS.width / 2, 0]])
  .scaleExtent([MULT, MULT*5])
  .on('zoom', () => {
    console.log(d3.event.sourceEvent, d3.event.transform);
    this.group.attr('transform', d3.event.transform);
  }));



var field = svg.append('g');

    /* () => {
      field.attr('transform', d3.event.transform);
      // console.log(d3.event);
    })); */
    // .attr('transform', `translate(${MULT*WIDTH / 2},${MULT*HEIGHT}) scale(${MULT})`);

  /* svg.call(d3.zoom().transform, {
    x: MULT*WIDTH / 2,
    y: MULT*HEIGHT,
    k: MULT
  }); */



this.svg.selectAll('.')

// Field grid
let grid = draw.svg();

// Vertical 4-step lines
for (let i = 7.5; i < 160; i += 7.5) {
  grid.line(-DIMENSIONS.width / 2 + 30, -i, DIMENSIONS.width / 2 - 30, -i)
      .stroke({
        color: '#fff',
        width: 0.2,
        opacity: 0.25
      });
}

// Horizontal 4-step lines
for (let i = -DIMENSIONS.width / 2 + 37.5; i < DIMENSIONS.width / 2 - 30; i += 15) {
  grid.line(i, 0, i, -DIMENSIONS.height)
      .stroke({
        color: '#fff',
        width: 0.2,
        opacity: 0.25
      });
}

// Zero points
for (let i = -DIMENSIONS.width / 2 + 45; i < DIMENSIONS.width / 2 - 30; i += 15) {
  for (let ii = 0; ii < DIMENSIONS.height; ii += 15) {
    grid.circle(+DIMENSIONS.line.width * 3)
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



var getCount = function(c) {
  c = Math.floor(c);

  for (let s in drill.sets) {
    if (c <= drill.sets[s].counts) {
      return {
        set: s,
        count: c,
        tempo: drill.sets[s].tempo
      };
    }

    c -= drill.sets[s].counts;
  }
};



var updateSet = function(dir) {
  let s = drill.sets[set - 1];
  let t = s.counts * 1000 * 60 / s.tempo;
  if (s.pulse === 'half') {
    t *= 2;
  }

  let status = `Set ${s.name}`;
  // TODO: fix button positioning (set > 1)
  if (set >= 1) {
    status += ` (${s.counts} counts at ${s.tempo}bpm${s.pulse ? ` ${s.pulse} time` : ''})`;
  }
  document.getElementById('status').children[0].firstChild.textContent = status;
  if (selected) {
    document.getElementById('status').children[1].children[0]
      .textContent = `Performer ${_getName(selected)}\n${_getHoriz(selected, set - 1)}\n${_getVert(selected, set - 1)}`;
  }

  /* for (let p of drill.performers) {
    let icon = p.icon;
    let count = 0;
    let metCount;

    if (!playing) {
      icon.finish();
    }

    let duringCallback = function(counts) {
      return function(pos, morph, eased, situation) {
        pos = parseInt(pos * counts, 10);
        if (pos !== metCount) {
          metCount = pos;
          if (pos < counts) {
            count++;
            console.log(count);
          }

          document.getElementById(metCount ? 'click2' : 'click1').play();
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
  } */

  let translate = function(d) {
    let x, y;
    let i = set - 1;
    if (d.sets[set - 1] instanceof Array) {
      while (x === undefined || y === undefined) {
        for (let a of d.sets[i]) {
          if (a.x !== undefined) {
            x = a.x;
          }
          if (a.y !== undefined) {
            y = a.y;
          }
        }

        i--;
      }
    } else {
      x = d.sets[i].x;
      y = d.sets[i].y;
    }

    return `translate(${xScale(x)},${yScale(y)})`;
  };
  field.selectAll('.performer').attr('transform', translate);

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
  } else if (set === drill.sets.length) {
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
  /* for (let p of drill.performers) {
    if (playing) {
      p.icon.pause();
    } else {
      p.icon.play();
    }
  } */

  /* let func = function() {
    console.log(count);
  };

  if (playing) {
    countID = setInterval(func, 1000);
  } else {
    clearInterval(countID);
  } */
};

var play = function() {
  console.log('play');

  let start = null;
  let data = getCount(0);

  let func = function(timestamp) {
    if (!start) {
      start = timestamp;
    }

    let wholeCount = Math.floor(count);
    let progress = (timestamp - start) * data.tempo / 60000;

    count += progress;

    if (Math.floor(count + progress) > wholeCount) {
      count = wholeCount + 1;
      data = getCount(count);
      console.log(`count ${count}: ${data.tempo}bpm`);
      document.getElementById('click1').play();

      if (!getCount(count + 1)) {
        stop();
        return;
      }
    }

    // console.log(count);
    start = timestamp;
    countID = requestAnimationFrame(func);
  };

  playing = true;
  countID = requestAnimationFrame(func);
  document.getElementById('status').children[0].children[2].innerText = 'Pause';

  /* playing = false;
  loadSet(set);
  playing = true;

  // TODO: fix this
  while (set !== drill.sets.length) {
    nextSet();
  } */
};
var pause = function() {
  console.log('pause');

  playing = false;
  cancelAnimationFrame(countID);
  document.getElementById('status').children[0].children[2].innerText = 'Play';
};
var stop = function() {
  console.log('stop');

  pause();
  count = 0;
};



// Draw field and markings
var drawField = function() {
  field.append('rect')
    .style('fill', COLORS.field)
    .style('stroke', '#fff')
    .style('stroke-width', LINE)
    .attr('x', -WIDTH / 2)
    .attr('y', -HEIGHT)
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

  // End zones
  let endzones = [-WIDTH / 2 + 15, WIDTH / 2 - 15];
  field.selectAll('.endzone')
      .data(endzones)
    .enter().append('rect')
      .style('fill', COLORS.endzone)
      .style('stroke', '#fff')
      .style('stroke-width', LINE)
      .attr('x', d => d - 15)
      .attr('y', -HEIGHT)
      .attr('width', 30)
      .attr('height', HEIGHT)
    .exit().remove();

  // Yardlines
  let yardlines = [];
  for (let i = -50; i <= 50; i += 5) {
    yardlines.push(i * 8 / 5);
  }

  // Yard lines
  field.selectAll('.yardline')
      .data(yardlines)
    .enter().append('g')
      .attr('class', 'yardline')
      .attr('transform', d => `translate(${xScale(d)},0)`)
    .append('line')
      .style('stroke', '#fff')
      .style('stroke-width', LINE)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -HEIGHT)
      .select(parent)
    .each(function(d, i) {
      let fifty = Math.floor(yardlines.length / 2);

      // Hash marks
      if (i > 0 && i < yardlines.length - 1) {
        for (let v of [hashes[0].front, hashes[0].front + hashes[0].between]) {
          d3.select(this).append('line')
            .style('stroke', '#fff')
            .style('stroke-width', LINE)
            .attr('x1', -MARKER / 2)
            .attr('y1', -v)
            .attr('x2', MARKER / 2)
            .attr('y2', -v);
        }
      }

      // Yard marks
      if (i !== fifty) {
        for (let h = 1; h < 5; h++) {
          let arr = [
            MARKER / 2, hashes[0].front - MARKER / 2,
            hashes[0].front + hashes[0].between + MARKER / 2,
            HEIGHT - MARKER / 2
          ];
          for (let v of arr) {
            let m = i > fifty ? -1 : 1;
            d3.select(this).append('line')
              .style('stroke', '#fff')
              .style('stroke-width', LINE)
              .attr('x1', m * h * 3)
              .attr('y1', -(v - MARKER / 2))
              .attr('x2', m * h * 3)
              .attr('y2', -(v + MARKER / 2));
          }
        }
      }

      if (i && (i < yardlines.length - 1) && (i % 2 === 0)) {
        d3.select(this).append('text')
          .style('fill', '#fff')
          .attr('font-family', 'Helvetica')
          .attr('font-size', NUMBERS.size)
          .attr('text-anchor', 'middle')
          .attr('y', -(NUMBERS.top - NUMBERS.size))
          .text(50 - Math.abs(yardlines[i] * 5 / 8))
          .on('mousedown', d => d3.event.preventDefault());
      }
    })
    .exit().remove();

  // field.selectAll('.')

  /* // Field grid
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
  } */
};
// Draw all performers
var drawPerformers = function() {
  for (let p of drill.performers) {
    p.selected = false;
  }

  // Performer icon
  field.selectAll('.performer')
      .data(drill.performers, d => _getName(d))
    .enter().append('g')
      .attr('class', 'performer')
      .attr('id', d => `performer_${_getName(d)}`)
      .attr('transform', d => `translate(${xScale(d.sets[set - 1].x)},${yScale(d.sets[set - 1].y)})`)
      .style('cursor', 'pointer')
      .on('click', _select)
    .append('circle')
      .style('fill', d => COLORS.performer[d.selected ? 'select' : 'fill'])
      .style('stroke', COLORS.performer.stroke)
      .style('stroke-width', 0.25)
      .attr('r', MARCHER / 2)
      .attr('cx', 0)
      .attr('cy', 0)
      .select(parent)
    .append('text')
      .text(d => _getName(d))
      .style('fill', COLORS.performer.text)
      .attr('font-family', 'Helvetica')
      .attr('font-size', MARCHER / 2)
      .attr('text-anchor', 'middle')
      .attr('y', MARCHER / 5)
      .select(parent)
    .exit().remove();
};



/* <!-- <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="checkbox-highschool">
  <input type="checkbox" id="checkbox-highschool" class="mdl-checkbox__input" onclick="drill.field.markings('highschool', true)">
  <span class="mdl-checkbox__label">High School</span>
</label>
<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="checkbox-college">
  <input type="checkbox" id="checkbox-college" class="mdl-checkbox__input" onclick="drill.field.markings('college', true)">
  <span class="mdl-checkbox__label">College</span>
</label>
<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="checkbox-pro">
  <input type="checkbox" id="checkbox-pro" class="mdl-checkbox__input" onclick="drill.field.markings('pro', true)">
  <span class="mdl-checkbox__label">Pro</span>
</label> -->
<!-- <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-highschool">
  <input type="checkbox" id="switch-highschool" class="mdl-switch__input">
  <span class="mdl-switch__label">High School</span>
</label>
<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-college">
  <input type="checkbox" id="switch-college" class="mdl-switch__input" checked>
  <span class="mdl-switch__label">College</span>
</label>
<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-pro">
  <input type="checkbox" id="switch-pro" class="mdl-switch__input">
  <span class="mdl-switch__label">Pro</span>
</label> -->
<!-- <span class="mdl-typography--subhead">Field Markings</span>
<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-highschool">
  <input type="radio" id="radio-highschool" class="mdl-radio__button" name="markings" value="highschool">
  <span class="mdl-radio__label">High School</span>
</label>
<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-college">
  <input type="radio" id="radio-college" class="mdl-radio__button" name="markings" value="college" checked>
  <span class="mdl-radio__label">College</span>
</label>
<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="radio-pro">
  <input type="radio" id="radio-pro" class="mdl-radio__button" name="markings" value="pro">
  <span class="mdl-radio__label">Pro</span>
</label> --> */

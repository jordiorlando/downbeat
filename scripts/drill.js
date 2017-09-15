class Drill {
  constructor(season, show, part) {
    this.field = new Field('drawing', 'd3');

    this.load(season, show, part);

    // Add event listeners
    document.getElementById('drill-button-prev').addEventListener('click', () => this.prevSet());
    document.getElementById('drill-button-playpause').addEventListener('click', () => this.playPause());
    document.getElementById('drill-button-next').addEventListener('click', () => this.nextSet());

    for (let marking of ['highschool', 'college', 'pro']) {
      let checkbox = document.getElementById(`checkbox-${marking}`);
      this.field.markings(marking, checkbox.classList.contains('active'));
      checkbox.addEventListener('click', e => drill.field.markings(marking, !e.target.classList.contains('active')));
    }
  }

  load(season, show, part) {
    let pos = function(p, s, a) {
      s = parseInt(s, 10);
      a = parseInt(a, 10);

      if (p.sets[s][a].x !== undefined) {
        return {
          x: p.sets[s][a].x,
          y: p.sets[s][a].y
        };
      } else if (a > 0) {
        return pos(p, s, a - 1);
      } else if (s > 0) {
        return pos(p, s - 1, p.sets[s - 1].length - 1);
      }

      return {
        x: 0,
        y: 0
      };
    };

    d3.json(`data/${season}/${show}/${part}/drill/drill.json`, d => {
      document.getElementById('title').textContent = d.name;

      // Copy drill metadata and data
      this.name = d.name;
      this.sets = d.sets;
      this.performers = d.performers;

      // Calculate positions for every subset
      for (let p of this.performers) {
        for (let s in p.sets) {
          // If set is an object, format it as an array of just one move subset
          if (!(p.sets[s] instanceof Array)) {
            p.sets[s].type = parseInt(s, 10) ? 'move' : 'start';
            p.sets[s].counts = this.sets[s].counts;
            p.sets[s] = [p.sets[s]];
          }

          // Calculate the position and format it as a fraction
          for (let a in p.sets[s]) {
            let {x, y} = pos(p, s, a);
            p.sets[s][a].x = x instanceof Fraction ? x : new Fraction(x);
            p.sets[s][a].y = y instanceof Fraction ? y : new Fraction(y);

            let px, py;
            let counts = p.sets[s][a].counts;
            p.sets[s][a].positions = [];

            if (p.sets[s][a].type === 'move') {
              if (a > 0) {
                px = p.sets[s][a - 1].x;
                py = p.sets[s][a - 1].y;
              } else {
                px = p.sets[s - 1][p.sets[s - 1].length - 1].x;
                py = p.sets[s - 1][p.sets[s - 1].length - 1].y;
              }
            }

            for (let c = 0; c <= counts; c++) {
              x = p.sets[s][a].x;
              y = p.sets[s][a].y;

              if (p.sets[s][a].type === 'move') {
                x = px.add(x.subtract(px).multiply(0, c, counts));
                y = py.add(y.subtract(py).multiply(0, c, counts));

                if (c === counts) {
                  let dx = x.subtract(px);
                  let dy = y.subtract(py);
                  let dp = dx.multiply(dx).add(dy.multiply(dy)).sqrt();
                  let ss = counts * 8 / dp;
                  p.sets[s][a].stepsize = `${ss} to 5`;
                  // console.log(dx, dy, dp, ss, 'to', 5)
                }
              } else {
                p.sets[s][a].stepsize = p.sets[s][a].type;
              }

              p.sets[s][a].positions.push({
                x,
                y
              });
            }
          }
        }
      }

      // Set the starting state
      this.state = {
        total:  0,
        set:    0,
        count:  0,
        tempo:  this.sets[0].tempo,
        pulse:  this.sets[0].pulse,
        counts: this.sets[0].counts // TODO: this.sets[0].countsdrill
      };

      // Total number of counts in this drill
      this.total = 0;
      for (let s of this.sets) {
        this.total += s.counts;
      }

      this.field.load(this.performers);

      this.move();
      // selectByName(this.parseName(drill.performers[0]));
    });
  }

  subset(p, s, c) {
    // Loop through all subsets until the current one is found
    for (let a in p.sets[s]) {
      if (c <= p.sets[s][a].counts) {
        return {
          subset: a,
          count: c
        };
      } else {
        c -= p.sets[s][a].counts;
      }
    }
  }

  // Function to calculate the position for a given performer, set, and count
  position(p, s, c) {
    let {subset, count} = this.subset(p, s, c);

    return {
      x: p.sets[s][subset].positions[count].x,
      y: p.sets[s][subset].positions[count].y
    };
  }

  select(name) {
    for (let p of drill.performers) {
      if (this.parseName(p).toUpperCase() === name.toUpperCase()) {
        this.field.select(p);
        return p;
      }
    }
  }

  // Update all performer positions
  move() {
    console.log(this.state);

    this.refresh();

    // Translation function
    let translate = p => {
      let {x, y} = this.position(p, this.state.set, this.state.count);

      return `translate(${xScale(x)},${yScale(y)})`;
    };

    this.field.svg.selectAll('.performer').attr('transform', translate);
  }

  // Go to the next count
  nextCount() {
    if (this.state.count < this.sets[this.state.set].counts) {
      this.state.total++;
      this.state.count++;
    } else if (this.state.set + 1 < this.sets.length) {
      this.state.total++;
      this.state.set++;
      this.state.count  = 1;
      this.state.tempo  = this.sets[this.state.set].tempo;
      this.state.pulse  = this.sets[this.state.set].pulse;
      this.state.counts = this.sets[this.state.set].counts;
    } else {
      return;
    }

    this.move();
  }

  // Go to a given set
  set(s) {
    // Check if valid set
    if (s < 0 || s >= this.sets.length) {
      return;
    }

    // Save playing state and pause
    let playing = this.playing;
    this.pause();

    // Calculate total counts
    this.state.total = 0;
    for (let i = 0; i <= s; i++) {
      this.state.total += this.sets[i].counts;
    }

    this.state.set    = s;
    this.state.count  = this.sets[this.state.set].counts;
    this.state.tempo  = this.sets[this.state.set].tempo;
    this.state.pulse  = this.sets[this.state.set].pulse;
    this.state.counts = this.sets[this.state.set].counts;

    this.move();

    // Restore playing state
    if (playing) {
      this.play();
    }
  }

  // Go to the previous set
  prevSet() {
    this.set(this.state.set - 1);
  }

  // Go to the next set
  nextSet() {
    this.set(this.state.set + 1);
  }

  // Start playing until the specified count
  play(end = this.total) {
    // TODO: change icon to pause
    // document.getElementById('drill-button-playpause').children[0].textContent = 'pause';

    if (this.state.total < this.total) {
      this.playing = true;

      let func = () => {
        document.getElementById('metronome').play();
        this.nextCount();

        let t = 1000 * 60 / this.state.tempo;
        if (this.state.pulse === 'half') {
          t *= 2;
        }

        if (this.state.total < end) {
          this.timeoutID = setTimeout(func, t);
        } else {
          this.pause();
        }
      };

      func();
    }
  }

  // Pause playing
  pause() {
    // TODO: change icon to play
    // document.getElementById('drill-button-playpause').children[0].textContent = 'play_arrow';

    this.playing = false;
    clearTimeout(this.timeoutID);
  }

  playPause() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Stop playing
  stop() {
    this.pause();
    this.set(0);
  }

  refresh() {
    let p = this.field.selected;
    let s = this.state.set;
    let c = this.state.count;

    document.getElementById('status-set').textContent = s + 1;
    document.getElementById('status-count').textContent = `${c} / ${this.state.counts}`;

    let performer = document.getElementById('status-performer');
    let position = document.getElementById('status-position');

    if (p) {
      performer.children[0].textContent = this.parseName(p);
      performer.children[1].textContent = p.sets[s][this.subset(p, s, c).subset].stepsize;
      performer.classList.replace('d-none', 'd-flex');
      console.log(p.sets[s])
      position.children[0].textContent = this.parseHoriz(p, s, c);
      position.children[1].textContent = this.parseVert(p, s, c);
      position.classList.replace('d-none', 'd-flex');
    } else {
      performer.classList.replace('d-flex', 'd-none');
      position.classList.replace('d-flex', 'd-none');
    }
  }

  parseName(p) {
    return p.squad === undefined ? p.type + p.num : p.squad + p.position;
  }

  parseHoriz(p, s, c) {
    let {x, y} = this.position(p, s, c);
    let horiz = x.equals(0) ? '' : (x < 0 ? 'Side 1: ' : 'Side 2: ');

    let yard = x.abs().subtract(80).negate();
    let offset = yard.modulo(8);
    offset = offset <= 4 ? offset : offset.subtract(8);
    yard = yard.subtract(offset).divide(8).multiply(5);

    if (!offset.equals(0)) {
      /* if (offset.equals(4)) {
        horiz += `Splitting ${yard} and ${yard + 5} yd lns`;
      } else {} */

      horiz += `${offset.abs()} step${offset.abs() <= 1 ? '' : 's'} ${offset > 0 ? 'inside' : 'outside'} ${yard} yd line`;
    } else {
      horiz += yard.equals(0) ? 'On goal line' : `On ${yard} yd line`;
    }

    return p.sets[s].horiz || horiz;
  }

  parseVert(p, s, c) {
    let {x, y} = this.position(p, s, c);
    let vert;

    // TODO: make "steps" singular when offset <= 1
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
}

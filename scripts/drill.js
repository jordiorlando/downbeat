class Drill {
  constructor(season, show, part) {
    this.field = new Field('drawing', 'd3');

    this.load(season, show, part);

    // Add event listeners
    document.getElementById('drill-button-prev').addEventListener('click', () => this.prevSet());
    document.getElementById('drill-button-playpause').addEventListener('click', () => this.playPause());
    document.getElementById('drill-button-next').addEventListener('click', () => this.nextSet());

    for (let marking of ['highschool', 'college', 'pro']) {
      /* let checkbox = document.getElementById(`switch-${marking}`);

      checkbox.addEventListener('click', e => drill.field.markings(marking, !e.target.parentNode.classList.contains('is-checked')));

      checkbox.parentNode.addEventListener('mdl-componentupgraded', e => drill.field.markings(marking, e.target.parentNode.classList.contains('is-checked'))); */

      let radio = document.getElementById(`radio-${marking}`);
      let field = this.field;

      radio.addEventListener('click', function() {
        let markings = {
          highschool: false,
          college: false,
          pro: false
        };
        markings[this.value] = true;

        field.markings(markings);
      });

      radio.parentNode.addEventListener('mdl-componentupgraded', e => this.field.markings(marking, e.target.parentNode.classList.contains('is-checked')));
    }
  }

  load(season, show, part) {
    d3.json(`data/${season}/${show}/${part}/drill/drill.json`, d => {
      document.getElementById('drill-title').textContent = d.name;

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
            let xy = this.getPos(p, s, a);
            p.sets[s][a].x = xy.x instanceof Fraction ? xy.x : new Fraction(xy.x);
            p.sets[s][a].y = xy.y instanceof Fraction ? xy.y : new Fraction(xy.y);
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
        counts: this.sets[0].countsdrill
      };

      // Total number of counts in this drill
      this.total = 0;
      for (let s of this.sets) {
        this.total += s.counts;
      }

      this.field.drawPerformers(this.performers);

      this.move();
      // selectByName(parseName(drill.performers[0]));
    });
  }

  // Function to calculate the position for a given performer, set, and subset
  getPos(p, s, a) {
    s = parseInt(s, 10);
    a = parseInt(a, 10);

    if (p.sets[s][a].x !== undefined) {
      return {
        x: p.sets[s][a].x,
        y: p.sets[s][a].y
      };
    } else if (a > 0) {
      return this.getPos(p, s, a - 1);
    } else if (s > 0) {
      return this.getPos(p, s - 1, p.sets[s - 1].length - 1);
    }

    return {
      x: 0,
      y: 0
    };
  }

  select(name) {
    for (let p of drill.performers) {
      if (parseName(p).toUpperCase() === name.toUpperCase()) {
        this.field.select(p);
        return p;
      }
    }
  }

  // Update all performer positions
  move() {
    console.log(this.state);

    // Translation function
    let translate = p => {
      let x, y;
      let s = this.state.set;
      let count = this.state.count;

      // Loop through all subsets until the current one is found
      for (let a in p.sets[s]) {
        a = parseInt(a, 10);
        x = p.sets[s][a].x;
        y = p.sets[s][a].y;

        // If we have found the current subset
        if (count <= p.sets[s][a].counts) {
          if (p.sets[s][a].type === 'move') {
            let px, py;

            if (a > 0) {
              px = p.sets[s][a - 1].x;
              py = p.sets[s][a - 1].y;
            } else {
              px = p.sets[s - 1][p.sets[s - 1].length - 1].x;
              py = p.sets[s - 1][p.sets[s - 1].length - 1].y;
            }

            x = px.add(x.subtract(px).multiply(0, count, p.sets[s][a].counts));
            y = py.add(y.subtract(py).multiply(0, count, p.sets[s][a].counts));
          }

          break;
        }

        count -= p.sets[s][a].counts;
      }

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
    document.getElementById('drill-button-playpause').children[0].textContent = 'pause';

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
    document.getElementById('drill-button-playpause').children[0].textContent = 'play_arrow';

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
}

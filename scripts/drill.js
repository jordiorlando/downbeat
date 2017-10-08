class Drill {
  constructor(season, show, part) {
    this.field = new Field('drill', 'd3');
    if (season && show && part) {
      this.load(season, show, part);
    }
  }

  clear() {
    delete this.name;
    delete this.state;
    this.field.clear();
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

    $.getJSON(`data/${season}/${show}/${part}/drill/drill.json`, d => {
      $('#title').text(d.name);

      // Copy drill metadata and data
      this.name = d.name;
      this.sets = d.sets;
      this.performers = d.schema === '0.0.2' ? $.map(d.performers, val => {
        let performer = {
          name: val.n,
          type: val.n.slice(0, 1)
        };

        let squad = parseInt(val.n.slice(1), 10);
        let position = val.n.slice(-1);

        if (isNaN(parseInt(position, 10))) {
          performer.squad = squad;
          performer.position = position;
        } else {
          performer.num = squad;
        }

        performer.sets = val.s;

        return performer;
      }) : d.performers;

      // Calculate positions for every subset
      for (let p of this.performers) {
        for (let s in p.sets) {
          // If set is an object, format it as an array of just one move subset
          if (!Array.isArray(p.sets[s])) {
            p.sets[s].t = parseInt(s, 10) ? 'm' : 's';
            p.sets[s].c = this.sets[s].c;
            p.sets[s] = [p.sets[s]];
          }

          // Calculate the position and format it as a fraction
          for (let a in p.sets[s]) {
            let {x, y} = pos(p, s, a);
            p.sets[s][a].x = x instanceof Fraction ? x : new Fraction(x);
            p.sets[s][a].y = y instanceof Fraction ? y : new Fraction(y);

            let px, py;
            let counts = p.sets[s][a].c;
            p.sets[s][a].positions = [];

            if (p.sets[s][a].t === 'm') {
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

              if (p.sets[s][a].t === 'm') {
                x = px.add(x.subtract(px).multiply(0, c, counts));
                y = py.add(y.subtract(py).multiply(0, c, counts));

                if (c === counts) {
                  let dx = x.subtract(px);
                  let dy = y.subtract(py);
                  let dp = dx.multiply(dx).add(dy.multiply(dy)).sqrt();
                  if (!dp.equals(0)) {
                    p.sets[s][a].stepsize = new Fraction(counts * 8).divide(dp);
                    // console.log(dx, dy, dp, ss, 'to', 5)
                  } else {
                    p.sets[s][a].t = 'mt';
                  }
                }
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
        tempo:  this.sets[0].t || 138,
        pulse:  this.sets[0].pl,
        counts: this.sets[0].c // TODO: this.sets[0].countsdrill
      };

      // Total number of counts in this drill
      this.total = 0;
      for (let s of this.sets) {
        this.total += s.c;
      }

      this.field.load(this.performers);

      this.move();
      // selectByName(this.parseName(panes.drill.performers[0]));
    });
  }

  // HACK: unify function arguments or store a subset mapping?
  subset(p, s, c) {
    // Loop through all subsets until the current one is found
    for (let a in p.sets[s]) {
      if (c <= p.sets[s][a].c) {
        return {
          subset: a,
          count: c
        };
      } else {
        c -= p.sets[s][a].c;
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
    for (let p of this.performers) {
      if (this.parseName(p).toUpperCase() === name.toUpperCase()) {
        this.field.select(p);
        return p;
      }
    }
  }

  // Update all performer positions
  move(duration = 0) {
    this.field.svg.selectAll('.field-performer').transition().duration(duration).ease(d3.easeLinear).attr('transform', p => {
      let {x, y} = this.position(p, this.state.set, this.state.count);
      return `translate(${this.field.xScale(x)},${this.field.yScale(y)})`;
    }).on('end', (d, i) => {
      if (i === 0) {
        panes.tools.metronome.playOnce();
        this.updateUI();

        if (this.playing && this.state.total < this.total) {
          this.nextCount();
        } else {
          // HACK: make updateUI automatically handle this
          if (duration) {
            this.playing = true;
            this.updateUI();
          }
          this.pause();
        }
      }
    });
  }

  // Go to the next count
  nextCount() {
    if (this.state.count < this.sets[this.state.set].c) {
      this.state.total++;
      this.state.count++;
    } else if (this.state.set + 1 < this.sets.length) {
      this.state.total++;
      this.state.set++;
      this.state.count  = 1;
      this.state.tempo  = this.sets[this.state.set].t || 138;
      this.state.pulse  = this.sets[this.state.set].pl;
      this.state.counts = this.sets[this.state.set].c;
    } else {
      return;
    }

    let duration = this.playing ? 1000 * 60 / this.state.tempo : 0;
    if (this.state.pulse === 0.5 || this.state.pulse === 'half') {
      duration *= 2;
    }
    this.move(duration);
  }

  // Go to a given set
  set(s) {
    // Check if valid set
    s = Math.min(Math.max(s, 0), this.sets.length - 1);

    // Save playing state and pause
    let playing = this.playing;
    this.pause();

    // Calculate total counts
    this.state.total = 0;
    for (let i = 0; i <= s; i++) {
      this.state.total += this.sets[i].c;
    }

    this.state.set    = s;
    this.state.count  = this.sets[s].c;
    this.state.tempo  = this.sets[s].t || 138;
    this.state.pulse  = this.sets[s].pl;
    this.state.counts = this.sets[s].c;

    this.move();

    // Restore playing state
    if (playing) {
      this.play();
    }
  }

  // Go to the previous set
  prevSet() {
    if (this.state) {
      // FIXME: spend a full count-time at count 0 before moving to count 1 when calling prevSet() while this.playing = true
      this.set(this.state.set - (this.playing ? 2 : 1))
    }
  }

  // Go to the next set
  nextSet() {
    if (this.state) {
      this.set(this.state.set + (this.playing || this.state.count < this.state.counts ? 0 : 1));
    }
  }

  // Start playing
  play() {
    if (this.state && (this.playing = this.state.total < this.total)) {
      $('#button-playpause').children().removeClass('zmdi-play');
      $('#button-playpause').children().addClass('zmdi-pause');

      this.nextCount();
    }
  }

  // Pause playing
  pause() {
    if (this.state) {
      $('#button-playpause').children().removeClass('zmdi-pause');
      $('#button-playpause').children().addClass('zmdi-play');

      this.playing = false;
      // this.field.svg.selectAll('.field-performer').interrupt();
    }
  }

  playPause() {
    this[this.playing ? 'pause' : 'play']();
  }

  // Stop playing
  stop() {
    this.pause();
    this.set(0);
  }

  parseName(p) {
    return p.squad === undefined ? p.type + p.num : p.squad + p.position;
  }

  parsePos(p, s, c) {
    let accuracy = panes.settings.get('accuracy');
    let {x, y} = this.position(p, s, c);
    x = x.round(accuracy);
    y = y.round(accuracy);
    let horiz;

    let yard = x.abs().subtract(80).negate();
    let offset = yard.modulo(8);
    offset = offset <= 4 ? offset : offset.subtract(8);
    yard = yard.subtract(offset).divide(8).multiply(5);

    if (!offset.equals(0)) {
      /* if (offset.equals(4)) {
        horiz += `Splitting ${yard} and ${yard + 5} yd lns`;
      } else {} */

      horiz = `${offset.abs()} ${offset > 0 ? 'inside' : 'outside'} ${x.equals(0) ? '' : (x < 0 ? 'side 1 ' : 'side 2 ')}${yard}yd ln`;
    } else {
      horiz = yard.equals(0) ? 'On goal ln' : `On ${yard}yd ln`;
    }

    let vert;

    if (y.equals(0)) {
      vert = 'On home side ln';
    } else if (y <= 16) {
      vert = `${y} behind home side ln`;
    } else if (y < 32) {
      vert = `${y.subtract(32).negate()} front of home hash`;
    } else if (y.equals(32)) {
      vert = 'On home hash';
    } else if (y <= new Fraction(42, 2, 3)) {
      vert = `${y.subtract(32)} behind home hash`;
    } else if (y < new Fraction(53, 1, 3)) {
      vert = `${y.subtract(53, 1, 3).round(accuracy).negate()} front of visitor hash`;
    } else if (y.equals(53, 1, 3)) {
      vert = 'On visitor hash';
    } else if (y < new Fraction(69, 1, 3)) {
      vert = `${y.subtract(53, 1, 3).round(accuracy)} behind visitor hash`;
    } else if (y < new Fraction(85, 1, 3)) {
      vert = `${y.subtract(85, 1, 3).round(accuracy).negate()} front of visitor side ln`;
    } else {
      vert = 'On visitor side ln';
    }

    let zeroOffset = y.modulo(8);
    let zero = y.subtract(zeroOffset).divide(8);
    let direction = 'behind';
    if (zero.equals(0) || (zero < 10 && zeroOffset > 4)) {
      zeroOffset = zeroOffset.subtract(8).negate();
      zero = zero.add(1);
      direction = 'front of';
    }
    if (zero.equals(1)) {
      zero += 'st';
    } else if (zero.equals(2)) {
      zero += 'nd';
    } else if (zero.equals(3)) {
      zero += 'rd';
    } else {
      zero += 'th';
    }
    let altVert = zeroOffset.equals(0) ? `On ${zero} zero` : `${zeroOffset} ${direction} ${zero} zero`;

    return {
      horiz: [p.sets[s].horiz || horiz],
      vert: [p.sets[s].vert || vert, altVert]
    };
  }

  updateUI() {
    if (this.active && this.state) {
      let p = this.field.selected;
      let s = this.state.set;
      let c = this.state.count;

      uiElements.status[2].children[0].textContent = 'Set';
      uiElements.status[2].children[1].textContent = this.sets[s].n;
      uiElements.status[3].children[0].textContent = this.playing ? 'Count' : 'Counts';
      uiElements.status[3].children[1].textContent = this.playing ? `${c} / ${this.state.counts}` : this.state.counts;

      if (p) {
        let subset = this.subset(p, s, c);

        uiElements.status[0].children[0].textContent = this.parseName(p);
        // TODO: change to zmdi-run for run-on step
        if (p.sets[s][subset.subset].t === 'm') {
          uiElements.status[0].children[1].textContent = `${p.sets[s][subset.subset].stepsize.round(panes.settings.get('accuracy'))} to 5`;
        } else {
          uiElements.status[0].children[1].textContent = p.sets[s][subset.subset].t;
        }

        let pos = this.parsePos(p, s, c);
        uiElements.status[1].children[0].textContent = pos.horiz[0];
        uiElements.status[1].children[1].textContent = pos.vert[this.altVert ? 1 : 0];

        let {x, y} = this.position(p, s, c);
        $('#labelX').text(`X: ${x}`);
        $('#labelY').text(`Y: ${y}`);
      } else {
        uiElements.status[0].children[0].textContent = '';
        uiElements.status[0].children[1].textContent = '';
        uiElements.status[1].children[0].textContent = '';
        uiElements.status[1].children[1].textContent = '';
      }
    }
  }

  eventHandler(e) {
    if (e.type === 'keydown') {
      switch (e.key) {
        case 'ArrowLeft':
          this.prevSet();
          break;
        case ' ':
          e.preventDefault();
          this.playPause();
          break;
        case 'ArrowRight':
          this.nextSet();
          break;
      }
    } else if (e.type === 'click') {
      if (e.currentTarget.tagName === 'BUTTON') {
        switch (e.currentTarget.id) {
          case 'button-prev':
            this.prevSet();
            break;
          case 'button-playpause':
            this.playPause();
            break;
          case 'button-next':
            this.nextSet();
            break;
        }
      } else if (e.currentTarget.classList.contains('status-element')) {
        switch (uiElements.status.indexOf(e.currentTarget)) {
          case 1:
            this.altVert = this.altVert ? false : true;
            this.updateUI(1);
            break;
        }
      }
    }
  }
}

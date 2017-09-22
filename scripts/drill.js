class Drill {
  constructor(season, show, part) {
    this.element = document.getElementById('drill');
    this.field = new Field('drill', 'd3');

    if (season && show && part) {
      this.load(season, show, part);
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
                  if (!dp.equals(0)) {
                    p.sets[s][a].stepsize = new Fraction(counts * 8).divide(dp);
                    // console.log(dx, dy, dp, ss, 'to', 5)
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
      // selectByName(this.parseName(panes.drill.performers[0]));
    });
  }

  // HACK: unify function arguments or store a subset mapping?
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
    for (let p of this.performers) {
      if (this.parseName(p).toUpperCase() === name.toUpperCase()) {
        this.field.select(p);
        return p;
      }
    }
  }

  // Update all performer positions
  move() {
    console.log(this.state);

    this.updateUI();

    // Translation function
    let translate = p => {
      let {x, y} = this.position(p, this.state.set, this.state.count);

      return `translate(${xScale(x)},${yScale(y)})`;
    };

    this.field.svg.selectAll('.field-performer').attr('transform', translate);
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
    this.state.count  = 0;
    this.state.tempo  = this.sets[s].tempo;
    this.state.pulse  = this.sets[s].pulse;
    this.state.counts = this.sets[s].counts;

    this.move();

    // Restore playing state
    if (playing) {
      this.play();
    }
  }

  // Go to the previous set
  prevSet() {
    // FIXME: spend a full count-time at count 0 before moving to count 1 when calling prevSet() while this.playing = true
    this.set(this.state.count > 1 ? this.state.set : this.state.set - 1)
  }

  // Go to the next set
  nextSet() {
    this.set(this.state.set + 1);
  }

  mute() {
    uiElements.button.volume.children[0].classList.replace('zmdi-volume-up', 'zmdi-volume-off');
    // TODO: change tooltip title
    // uiElements.button.volume.setAttribute('title', 'Unmute');
    this.muted = true;
  }

  unmute() {
    uiElements.button.volume.children[0].classList.replace('zmdi-volume-off', 'zmdi-volume-up');
    // TODO: change tooltip title
    // uiElements.button.volume.setAttribute('title', 'Mute');
    this.muted = false;
  }

  muteUnmute() {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // Start playing until the specified count
  play(end = this.total) {
    uiElements.button.playpause.children[0].classList.replace('zmdi-play', 'zmdi-pause');

    if (this.state.total < this.total) {
      this.playing = true;

      let func = () => {
        if (!this.muted) {
          uiElements.metronome.play();
        }
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
    uiElements.button.playpause.children[0].classList.replace('zmdi-pause', 'zmdi-play');

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

  parseName(p) {
    return p.squad === undefined ? p.type + p.num : p.squad + p.position;
  }

  parsePos(p, s, c) {
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

      horiz += `${offset.abs()} ${offset > 0 ? 'inside' : 'outside'} ${yard} yd line`;
    } else {
      horiz += yard.equals(0) ? 'On goal line' : `On ${yard} yd line`;
    }

    let vert;

    if (y === 0) {
      vert = 'On home side line';
    } else if (y <= 16) {
      vert = `${y} behind home side line`;
    } else if (y < 32) {
      vert = `${y.subtract(32).negate()} in front of home hash`;
    } else if (y.equals(32)) {
      vert = 'On home hash';
    } else if (y <= new Fraction(42, 2, 3)) {
      vert = `${y.subtract(32)} behind home hash`;
    } else if (y < new Fraction(53, 1, 3)) {
      vert = `${y.subtract(53, 1, 3).negate()} in front of visitor hash`;
    } else if (y.equals(53, 1, 3)) {
      vert = 'On visitor hash';
    } else if (y < new Fraction(69, 1, 3)) {
      vert = `${y.subtract(53, 1, 3)} behind visitor hash`;
    } else if (y < new Fraction(85, 1, 3)) {
      vert = `${y.subtract(85, 1, 3).negate()} in front of visitor side line`;
    } else {
      vert = 'On visitor side line';
    }

    let zeroOffset = y.modulo(8);
    let zero = y.subtract(zeroOffset).divide(8);
    let direction = 'behind';
    if (zero.equals(0) || (zero < 10 && zeroOffset > 4)) {
      zeroOffset = zeroOffset.subtract(8).negate();
      zero = zero.add(1);
      direction = 'in front of';
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
    console.log(altVert)

    return {
      horiz: [p.sets[s].horiz || horiz],
      vert: [p.sets[s].vert || vert, altVert]
    };
  }

  updateUI() {
    if (this.active) {
      let p = this.field.selected;
      let s = this.state.set;
      let c = this.state.count;

      uiElements.status[2].children[0].textContent = 'Set';
      uiElements.status[2].children[1].textContent = s + 1;
      uiElements.status[3].children[0].textContent = this.playing ? 'Count' : 'Counts';
      uiElements.status[3].children[1].textContent = this.playing ? `${c} / ${this.state.counts}` : this.state.counts;

      if (p) {
        let subset = this.subset(p, s, c);

        uiElements.status[0].children[0].textContent = this.parseName(p);
        // TODO: change to zmdi-run for run-on step
        if (p.sets[s][this.subset(p, s, c).subset].type === 'move') {
          uiElements.status[0].children[1].textContent = `${p.sets[s][subset.subset].stepsize} to 5`;
        } else {
          uiElements.status[0].children[1].textContent = p.sets[s][subset.subset].type;
        }

        let pos = this.parsePos(p, s, c);
        uiElements.status[1].children[0].textContent = pos.horiz[0];
        uiElements.status[1].children[1].textContent = pos.vert[this.altVert ? 1 : 0];
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
      if (e.target.tagName === 'BUTTON') {
        switch (e.target.id) {
          case 'button-volume':
            this.muteUnmute();
            break;
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
    // console.log('drill', e);
  }
}

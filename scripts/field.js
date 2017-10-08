const FIELD = {
  width: 360,
  height: 160,
  border: 6,
  line: {
    width: new Fraction(0, 1, 3),
    length: 2
  },
  numbers: {
    top: {
      highschool: 27,
      college: 27,
      pro: 42
    },
    width: 4,
    height: 6
  },
  hashes: {
    front: {
      highschool: new Fraction(53, 1, 3),
      college: 60,
      pro: new Fraction(70, 3, 4)
    },
    back: {
      highschool: new Fraction(106, 2, 3),
      college: 100,
      pro: new Fraction(89, 1, 4)
    }
  },
  tee: {
    highschool: 40,
    college: 35,
    pro: 35
  }
};


class Field {
  constructor(elem, id) {
    this.xScale = d3.scaleLinear()
      .domain([-96, 96])
      .range([-FIELD.width / 2, FIELD.width / 2]);
    this.yScale = d3.scaleLinear()
      .domain([0, new Fraction(85, 1, 3)])
      .range([0, -FIELD.height]);

    const X0 = -(FIELD.width / 2 + FIELD.border);
    const Y0 = -(FIELD.height + FIELD.border);
    const X1 = FIELD.width / 2 + FIELD.border;
    const Y1 = FIELD.border;

    this.svg = d3.select(`#${elem}`).append('svg')
      .attr('id', id)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr('viewBox', `${X0} ${Y0} ${X1-X0} ${Y1-Y0}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .call(d3.zoom().extent([[X0, Y0], [X1, Y1]]).scaleExtent([1, 20]).translateExtent([[X0, Y0], [X1, Y1]]).on("zoom", () => this.svg.attr("transform", d3.event.transform)))
      .append('g');
    // .on("wheel.zoom", null);

    this.drawField();

    panes.settings.onChange('markings', old => panes.settings.forEach('markings', (curr, val) => this.svg.selectAll(`.field-${curr}`).classed('d-none', !val.includes(curr))), true);
    panes.settings.onChange('theme', old => panes.settings.forEach('theme', (curr, val) => this.svg.classed(`field-theme-${curr}`, val.includes(curr))), true);
  }

  // Draw field and markings
  drawField() {
    this.svg.append('rect')
      .attr('x', -FIELD.width / 2)
      .attr('y', -FIELD.height)
      .attr('width', FIELD.width)
      .attr('height', FIELD.height)
      .classed('field-turf field-line-width', true);

    // End zones
    let endzones = [-FIELD.width / 2 + 15, FIELD.width / 2 - 15];
    this.svg.selectAll('.field-endzone')
        .data(endzones)
      .enter().append('rect')
        .attr('x', d => d - 15)
        .attr('y', -FIELD.height)
        .attr('width', 30)
        .attr('height', FIELD.height)
        .classed('field-endzone field-line-width', true)
      .exit().remove();

    // 3-yard markers
    for (let h of [-141, 141]) {
      this.svg.append('line')
        .attr('x1', h)
        .attr('y1', -(FIELD.height - FIELD.line.length) / 2)
        .attr('x2', h)
        .attr('y2', -(FIELD.height + FIELD.line.length) / 2)
        .classed('field-lines field-line-width', true);
    }

    // Tee markers
    for (let type in FIELD.tee) {
      let x = (50 - FIELD.tee[type]) * 3;
      let y = FIELD.height / 2;

      for (let h of [-x, x]) {
        for (let r of [-45, 45]) {
          this.svg.append('line')
            .attr('x1', h)
            .attr('y1', -(y - FIELD.line.length / 2))
            .attr('x2', h)
            .attr('y2', -(y + FIELD.line.length / 2))
            .attr('transform', `rotate(${r},${h},${-y})`)
            .classed(`field-${type} field-lines field-line-width`, true);
        }
      }
    }

    // Step grid
    for (let y = 1; y < 85.3; y++) {
      if (y % 8) {
        this.svg.append('line')
          .attr('x1', -FIELD.width / 2 + 30)
          .attr('y1', -y * 1.875)
          .attr('x2', FIELD.width / 2 - 30)
          .attr('y2', -y * 1.875)
          .classed('field-grid field-step-lines', true);
      }
    }
    for (let x = -79; x < 80; x++) {
      if (x % 8) {
        this.svg.append('line')
          .attr('x1', x * 1.875)
          .attr('y1', 0)
          .attr('x2', x * 1.875)
          .attr('y2', -FIELD.height)
          .classed('field-grid field-step-lines', true);
      }
    }

    // Zero grid
    for (let y = 15; y < 160; y += 15) {
      this.svg.append('line')
        .attr('x1', -FIELD.width / 2 + 30)
        .attr('y1', -y)
        .attr('x2', FIELD.width / 2 - 30)
        .attr('y2', -y)
        .classed('field-grid field-zero-lines', true);
    }

    // Yard lines
    let yardlines = [];
    for (let i = -50; i <= 50; i += 5) {
      yardlines.push(i * 8 / 5);
    }
    this.svg.selectAll('.yardline')
        .data(yardlines)
      .enter().append('g')
        .attr('transform', d => `translate(${this.xScale(d)},0)`)
      .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', -FIELD.height)
        .classed('field-lines field-line-width', true)
        .select(function() {
          return this.parentNode;
        })
      .each(function(d, i) {
        let fifty = Math.floor(yardlines.length / 2);

        let drawLine = (x, y, length, dir, type) => {
          let x1, x2, y1, y2;

          if (dir === 'h') {
            x1 = x - length / 2;
            x2 = x + length / 2;
            y1 = y;
            y2 = y;
          } else {
            x1 = x;
            x2 = x;
            y1 = y - length / 2;
            y2 = y + length / 2;
          }

          d3.select(this).append('line')
            .attr('x1', x1)
            .attr('y1', -y1)
            .attr('x2', x2)
            .attr('y2', -y2)
            .classed(`field-${type} field-lines field-line-width`, true);
        };

        let drawText = (x, y, size, dir, text, type) => {
          d3.select(this).append('text')
            .text(text)
            .attr('x', x)
            .attr('y', -y)
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(${dir * 180},${x},${-y})`)
            .classed(`field-${type} field-numbers`, true);
        };

        // Hash marks
        for (let hash in FIELD.hashes) {
          for (let type in FIELD.hashes[hash]) {
            if (i > 0 && i < yardlines.length - 1) {
              drawLine(0, FIELD.hashes[hash][type], FIELD.line.length, 'h', type);
            }

            if (i !== fifty) {
              let m = i > fifty ? -1 : 1;
              let o = (hash === 'front' ? -1 : 1) * FIELD.line.length / 2;

              for (let h = 1; h < 5; h++) {
                drawLine(m * h * 3, FIELD.hashes[hash][type] + o, FIELD.line.length, 'v', type);
              }
            }
          }
        }

        // Yard marks
        if (i !== fifty) {
          let m = i > fifty ? -1 : 1;
          let arr = [(FIELD.line.length + FIELD.line.width * 3) / 2];
          arr.push(FIELD.height - arr[0]);

          for (let h = 1; h < 5; h++) {
            for (let v of arr) {
              drawLine(m * h * 3, v, FIELD.line.length, 'v');
            }
          }
        }

        // Yard numbers
        if (i && (i < yardlines.length - 1) && (i % 2 === 0)) {
          for (let type in FIELD.numbers.top) {
            let arr = [FIELD.numbers.top[type] - FIELD.numbers.height];
            arr.push(FIELD.height - arr[0]);

            for (let v in arr) {
              drawText(0, arr[v], FIELD.numbers.height, v, 50 - Math.abs(yardlines[i] * 5 / 8), type);
            }
          }
        }
      })
      .exit().remove();

    // Zero points
    for (let y = 15; y < 160; y += 15) {
      if (y !== FIELD.hashes.front.college) {
        for (let x = -FIELD.width / 2 + 30; x <= FIELD.width / 2 - 30; x += 15) {
          this.svg.append('circle')
            .attr('r', 0.125)
            .attr('cx', x)
            .attr('cy', -y)
            .classed('field-grid field-zero-points', true);
        }
      }
    }
  }

  clear() {
    this.svg.selectAll('.field-performer').remove();
  }

  // Draw all performers
  load(performers) {
    this.clear();

    for (let p of performers) {
      p.selected = false;
    }

    // Performer icon
    this.svg.selectAll('.field-performer')
        .data(performers, d => panes.drill.parseName(d))
      .enter().append('g')
        .attr('id', d => `performer_${panes.drill.parseName(d)}`)
        .classed('field-performer', true)
        // .classed('selected', d => d.selected)
        .on('click', p => this.select(p))
      .append('circle')
        .attr('r', 1)
        .attr('cx', 0)
        .attr('cy', 0)
        .classed('field-performer-circle', true)
        .select(function() {
          return this.parentNode;
        })
      .append('text')
        .text(d => panes.drill.parseName(d))
        .attr('y', 0.36)
        .attr('text-anchor', 'middle')
        .classed('field-performer-text', true)
        .select(function() {
          return this.parentNode;
        })
      .exit().remove();
  }

  select(p) {
    if (this.selected === p) {
      this.selected = undefined;
    } else {
      this.select(this.selected);
      this.selected = p;
    }

    if (p) {
      p.selected = !p.selected;

      this.svg.select(`#performer_${panes.drill.parseName(p).replace('\\', '\\\\').replace('*', '\\*')}`)
        .classed('selected', p.selected);

      panes.drill.updateUI();
    }
  }
}

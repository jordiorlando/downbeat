const DIMENSIONS = {
  width: 360,
  height: 160,
  border: 6,
  line: {
    width: new Fraction(0, 1, 3),
    length: 2
  },
  numbers: {
    top: 27,
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

const COLORS = {
  field:    '#689f38',
  endzone:  '#e04e39',
  performer: {
    fill:   '#fff',
    stroke: '#13294b',
    text:   '#13294b',
    select: '#e04e39'
  }
};

const MARCHER = 3.5;
const MULT    = 4;

/* d3.json('field.json', function(data) {
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
}); */



var xScale = d3.scaleLinear()
  .domain([-96, 96])
  .range([-DIMENSIONS.width / 2, DIMENSIONS.width / 2]);
var yScale = d3.scaleLinear()
  .domain([0, new Fraction(85, 1, 3)])
  .range([0, -DIMENSIONS.height]);
function parent() {
  return this.parentNode;
}



class Field {
  constructor(elem, id) {
    let svg = d3.select(`#${elem}`).append('svg')
      .attr('id', id)
      .attr('width', MULT*(DIMENSIONS.width + DIMENSIONS.border * 2))
      .attr('height', MULT*(DIMENSIONS.height + DIMENSIONS.border * 2))
      .style('background-color', '#fff');

    svg.append('rect')
      .attr('width', MULT*(DIMENSIONS.width + DIMENSIONS.border * 2))
      .attr('height', MULT*(DIMENSIONS.height + DIMENSIONS.border * 2))
      .style('fill', 'none')
      .style('pointer-events', 'all');

    this.group = svg.append('g')
      .attr('transform', `translate(${MULT*(DIMENSIONS.width / 2 + DIMENSIONS.border)}, ${MULT*(DIMENSIONS.height + DIMENSIONS.border)}) scale(${MULT})`);

    /* svg.call(d3.zoom()
      .translateExtent([[-MULT*DIMENSIONS.width / 2, -MULT*DIMENSIONS.height], [MULT*DIMENSIONS.width / 2, 0]])
      .scaleExtent([MULT, MULT*5])
      .on('zoom', () => {
        console.log(d3.event.sourceEvent, d3.event.transform);
        this.group.attr('transform', d3.event.transform);
      })); */

    this.drawField();
  }

  // Draw field and markings
  drawField() {
    this.group.append('rect')
      .style('fill', COLORS.field)
      .style('stroke', '#fff')
      .style('stroke-width', +DIMENSIONS.line.width)
      .attr('x', -DIMENSIONS.width / 2)
      .attr('y', -DIMENSIONS.height)
      .attr('width', DIMENSIONS.width)
      .attr('height', DIMENSIONS.height);

    // End zones
    let endzones = [-DIMENSIONS.width / 2 + 15, DIMENSIONS.width / 2 - 15];
    this.group.selectAll('.endzone')
        .data(endzones)
      .enter().append('rect')
        .style('fill', COLORS.endzone)
        .style('stroke', '#fff')
        .style('stroke-width', +DIMENSIONS.line.width)
        .attr('x', d => d - 15)
        .attr('y', -DIMENSIONS.height)
        .attr('width', 30)
        .attr('height', DIMENSIONS.height)
      .exit().remove();

    // 3-yard markers
    for (let h of [-141, 141]) {
      this.group.append('line')
        .style('stroke', '#fff')
        .style('stroke-width', +DIMENSIONS.line.width)
        .attr('x1', h)
        .attr('y1', -(DIMENSIONS.height - DIMENSIONS.line.length) / 2)
        .attr('x2', h)
        .attr('y2', -(DIMENSIONS.height + DIMENSIONS.line.length) / 2);
    }

    // Tee markers
    for (let type in DIMENSIONS.tee) {
      let x = (50 - DIMENSIONS.tee[type]) * 3;
      let y = DIMENSIONS.height / 2;

      for (let h of [-x, x]) {
        for (let r of [-45, 45]) {
          this.group.append('line')
            .style('stroke', '#fff')
            .style('stroke-width', +DIMENSIONS.line.width)
            .style('opacity', 0)
            .attr('x1', h)
            .attr('y1', -(y - DIMENSIONS.line.length / 2))
            .attr('x2', h)
            .attr('y2', -(y + DIMENSIONS.line.length / 2))
            .attr('transform', `rotate(${r},${h},${-y})`)
            .attr('class', type);
        }
      }
    }

    // Yard lines
    let yardlines = [];
    for (let i = -50; i <= 50; i += 5) {
      yardlines.push(i * 8 / 5);
    }
    this.group.selectAll('.yardline')
        .data(yardlines)
      .enter().append('g')
        .attr('class', 'yardline')
        .attr('transform', d => `translate(${xScale(d)},0)`)
      .append('line')
        .style('stroke', '#fff')
        .style('stroke-width', +DIMENSIONS.line.width)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', -DIMENSIONS.height)
        .select(parent)
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
            .style('stroke', '#fff')
            .style('stroke-width', +DIMENSIONS.line.width)
            .style('opacity', type ? 0 : 1)
            .attr('x1', x1)
            .attr('y1', -y1)
            .attr('x2', x2)
            .attr('y2', -y2)
            .attr('class', type);
        };

        let drawText = (x, y, size, dir, text) => {
          d3.select(this).append('text')
            .text(text)
            .style('fill', '#fff')
            .attr('font-family', 'Helvetica')
            .attr('font-size', size)
            .attr('text-anchor', 'middle')
            .attr('x', x)
            .attr('y', -y)
            .attr('transform', `rotate(${dir * 180},${x},${-y})`);
        };

        // Hash marks
        for (let hash in DIMENSIONS.hashes) {
          for (let type in DIMENSIONS.hashes[hash]) {
            if (i > 0 && i < yardlines.length - 1) {
              drawLine(0, DIMENSIONS.hashes[hash][type], DIMENSIONS.line.length, 'h', type);
            }

            if (i !== fifty) {
              let m = i > fifty ? -1 : 1;
              let o = (hash === 'front' ? -1 : 1) * DIMENSIONS.line.length / 2;

              for (let h = 1; h < 5; h++) {
                drawLine(m * h * 3, DIMENSIONS.hashes[hash][type] + o, DIMENSIONS.line.length, 'v', type);
              }
            }
          }
        }

        // Yard marks
        if (i !== fifty) {
          let m = i > fifty ? -1 : 1;
          let arr = [(DIMENSIONS.line.length + DIMENSIONS.line.width * 3) / 2];
          arr.push(DIMENSIONS.height - arr[0]);

          for (let h = 1; h < 5; h++) {
            for (let v of arr) {
              drawLine(m * h * 3, v, DIMENSIONS.line.length, 'v');
            }
          }
        }

        // Yard numbers
        if (i && (i < yardlines.length - 1) && (i % 2 === 0)) {
          let arr = [DIMENSIONS.numbers.top - DIMENSIONS.numbers.height];
          arr.push(DIMENSIONS.height - arr[0]);

          for (let v in arr) {
            drawText(0, arr[v], DIMENSIONS.numbers.height, v, 50 - Math.abs(yardlines[i] * 5 / 8));
          }
        }
      })
      .exit().remove();

    // this.group.selectAll('.')

    /* // Field grid
    let grid = draw.group();

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
    } */
  }

  // Draw all performers
  drawPerformers(performers) {
    for (let p of performers) {
      p.selected = false;
    }

    // Performer icon
    this.group.selectAll('.performer')
        .data(performers, d => parseName(d))
      .enter().append('g')
        .attr('class', 'performer')
        .attr('id', d => `performer_${parseName(d)}`)
        .style('cursor', 'pointer')
        .on('click', p => this.select(p))
      .append('circle')
        .style('fill', d => COLORS.performer[d.selected ? 'select' : 'fill'])
        .style('stroke', COLORS.performer.stroke)
        .style('stroke-width', 0.25)
        .attr('r', MARCHER / 2)
        .attr('cx', 0)
        .attr('cy', 0)
        .select(parent)
      .append('text')
        .text(d => parseName(d))
        .style('fill', COLORS.performer.text)
        .attr('font-family', 'Helvetica')
        .attr('font-size', MARCHER / 2)
        .attr('text-anchor', 'middle')
        .attr('y', MARCHER / 5)
        .select(parent)
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

      /* p.icon.first().fill({
        color: COLORS.performer[p.selected ? 'select' : 'fill']
      }); */
      this.group.select(`#performer_${parseName(p).replace('\\', '\\\\').replace('*', '\\*')}`)
        .select('circle')
        .style('fill', COLORS.performer[p.selected ? 'select' : 'fill']);

      if (p.selected) {
        document.getElementById('status-text').children[0].textContent = parseName(p);
        document.getElementById('status-text').children[2].textContent = parseHoriz(p, drill.state.set);
        document.getElementById('status-text').children[4].textContent = parseVert(p, drill.state.set);
      } else {
        for (let i = 0; i < 3; i++) {
          document.getElementById('status-text').children[i * 2].textContent = String.fromCharCode(160);
        }
      }
    }
  }

  markings(markings, show) {
    if (markings instanceof Array) {
      for (let type of markings) {
        this.markings(type, show);
      }
    } else if (markings instanceof Object) {
      for (let type in markings) {
        this.markings(type, markings[type]);
      }
    } else {
      this.group.selectAll(`.${markings}`).style('opacity', show ? 1 : 0);
    }
  }
}

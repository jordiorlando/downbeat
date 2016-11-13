const WIDTH   = 360;
const HEIGHT  = 160;
const MULT    = 4;

const LINE    = 1 / 3;
const MARKER  = 3;
const MARCHER = 3.5;
const NUMBERS = {
  top:  27,
  size: 6
};

const HIGHSCHOOL = {
  front:   HEIGHT / 3,
  between: HEIGHT / 3,
  tee:     40
};
const COLLEGE = {
  front:   60,
  between: 40,
  tee:     35
};
const PRO = {
  front:   70.75,
  between: 18.5,
  tee:     35
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



var hashes = [
  COLLEGE
];
var selected;



var xScale = d3.scaleLinear()
  .domain([-96, 96])
  .range([-WIDTH / 2, WIDTH / 2]);
var yScale = d3.scaleLinear()
  .domain([0, new Fraction(85, 1, 3)])
  .range([0, -HEIGHT]);
function parent() {
  return this.parentNode;
}
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
  let offset = yard.mod(8);
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
function select(p) {
  if (selected === p) {
    selected = undefined;
  } else {
    select(selected);
    selected = p;
  }

  if (p) {
    p.selected = !p.selected;

    /* p.icon.first().fill({
      color: COLORS.performer[p.selected ? 'select' : 'fill']
    }); */
    field.field.select(`#performer_${parseName(p).replace('\\', '\\\\')}`)
      .select('circle')
      .style('fill', COLORS.performer[p.selected ? 'select' : 'fill']);

    document.getElementById('status').children[1].children[0].textContent = p.selected ? `Performer ${parseName(p)}\n${parseHoriz(p, drill.state.set)}\n${parseVert(p, drill.state.set)}` : '\n\n\n';
  }
}



var svg = d3.select('#drawing').append('svg')
  .attr('id', 'd3')
  .attr('width', WIDTH * MULT)
  .attr('height', HEIGHT * MULT)
  .attr('viewBox', [-WIDTH / 2, -HEIGHT, WIDTH, HEIGHT].join(' '))
  .style('background-color', '#fff');

svg.append('rect')
  .attr('x', -WIDTH / 2)
  .attr('y', -HEIGHT)
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .style('fill', 'none')
  .style('pointer-events', 'all');

svg.call(d3.zoom()
  .scaleExtent([1, 5])
  .translateExtent([[-WIDTH / 2, -HEIGHT], [WIDTH / 2, 0]])
  .on('zoom', function() {
    // console.log(d3.event.sourceEvent);
    let transform = d3.event.transform;

    let viewBox = [
      -transform.x / transform.k,
      -transform.y / transform.k,
      WIDTH / transform.k,
      HEIGHT / transform.k
    ].join(' ');

    console.log(transform, viewBox);

    svg.attr('viewBox', viewBox);
  }));



class Field {
  constructor() {
    this.field = svg.append('g');
    this.drawField();
  }

  // Draw field and markings
  drawField() {
    this.field.append('rect')
      .style('fill', COLORS.field)
      .style('stroke', '#fff')
      .style('stroke-width', LINE)
      .attr('x', -WIDTH / 2)
      .attr('y', -HEIGHT)
      .attr('width', WIDTH)
      .attr('height', HEIGHT);

    // End zones
    let endzones = [-WIDTH / 2 + 15, WIDTH / 2 - 15];
    this.field.selectAll('.endzone')
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
    this.field.selectAll('.yardline')
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

    // this.field.selectAll('.')

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
  }

  // Draw all performers
  drawPerformers() {
    for (let p of drill.performers) {
      p.selected = false;
    }

    // Performer icon
    this.field.selectAll('.performer')
        .data(drill.performers, d => parseName(d))
      .enter().append('g')
        .attr('class', 'performer')
        .attr('id', d => `performer_${parseName(d)}`)
        .style('cursor', 'pointer')
        .on('click', select)
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
}

class Parser {
  constructor() {
    PDFJS.workerSrc = '../node_modules/pdfjs-dist/build/pdf.worker.min.js';
  }

  parse(season, show, part) {
    let drill = {
      schema: '0.0.1',
      name: part,
      sets: [],
      performers: []
    };

    PDFJS.getDocument(`data/${season}/${show}/${part}/drill/coordinates.pdf`).then(pdf => {
      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then(page => {
          page.getTextContent().then(content => {
            let sets = [];
            let name, counts;
            let k = 0;

            for (let j = 0; j < content.items.length; j++) {
              let str = content.items[j].str;

              if (j > 0 && content.items[j - 1].str.includes('Visitor-Home')) {
                k = j;
              } else if (str.includes('(unnamed)')) {
                let data = str.replace(/\(unnamed\)\s+/, '').replace(/: /g, ':').split(/\s+/).map(part => part.split(':'));
                let performer = {
                  sets
                };
                data.forEach(part => {
                  switch (part[0]) {
                    case 'Label':
                      performer.num = parseInt(part[1]);
                      break;
                    case 'Symbol':
                      performer.type = part[1];
                      break;
                    case 'ID':
                      performer.id = parseInt(part[1]);
                      break;
                  }
                });
                drill.performers.push(performer);

                sets = [];
                k = 0;
                // console.log(performer);
              }

              if (k) {
                switch ((j - k) % 4) {
                  case 0:
                    name = parseInt(str);
                    sets.push({
                      name
                    });
                    break;
                  case 1:
                    counts = parseInt(str);
                    sets[sets.length - 1].counts = counts;
                    if (drill.performers.length === 0) {
                      drill.sets.push({
                        name,
                        counts,
                        tempo: 120
                      });
                    }
                    break;
                  case 2:
                    // sets[sets.length - 1].horiz = str.replace(/\s+/g, ' ');
                    sets[sets.length - 1].x = this.parseHoriz(str);
                    break;
                  case 3:
                    // sets[sets.length - 1].vert = str.replace(/\s+/g, ' ');
                    sets[sets.length - 1].y = this.parseVert(str);
                    break;
                }
              }
            }

            if (page.pageIndex === pdf.numPages - 1) {
              console.log(drill)
              let blob = new Blob([JSON.stringify(drill)], {type: 'text/plain;charset=utf-8'});
              saveAs(blob, 'drill.json');
            }
          });
        });
      }
    });
  }

  splitString(str) {
    str = str.toLowerCase()
      .replace(/\b(steps|in|of|hash|line|on|yd ln)\b/g, '')
      .replace(':', '')
      .replace(/^\s+/, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+$/, '');

    return str.split(' ');
  }

  parseHoriz(str) {
    let data = this.splitString(str);
    let side, yard, offset;

    if (data[0] === 'left') {
      side = -1;
    } else if (data[0] === 'right') {
      side = 1;
    } else {
      return 0;
    }

    if (data.length === 4) {
      yard = parseInt(data[3]);
      offset = parseFloat(data[1]);

      if (data[2] === 'inside') {
        offset *= -1;
      }
    } else {
      yard = parseInt(data[1]);
      offset = 0;
    }

    return new Fraction((50 - yard) * 8 / 5).add(offset).multiply(side);
  }

  parseVert(str) {
    let data = this.splitString(str);
    let pos, offset = 0;

    if (data.length > 2) {
      offset = parseFloat(data[0]);
      if (data[1] === 'front') {
        offset *= -1;
      }
    }

    switch (data[data.length - 1]) {
      case '(ncaa)':
        if (data[data.length - 2] === 'home') {
          pos = 32;
        } else if (data[data.length - 2] === 'visitor') {
          pos = [53, 1, 3];
        }
        break;
      case '(@-6.9)':
        if (data[data.length - 2] === 'home') {
          pos = 32;
        } else if (data[data.length - 2] === 'visitor') {
          pos = 53;
        }
        break;
      case 'side':
        if (data[data.length - 2] === 'home') {
          pos = 0;
        } else if (data[data.length - 2] === 'visitor') {
          pos = [85, 1, 3];
        }
        break;
    }

    return new Fraction(pos).add(offset);
  }
}

var parser = new Parser();

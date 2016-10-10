var drill = {
  name: 'Show 4 Buddy Rich featuring Gregg Potter',
  sets: [],
  performers: []
};

var splitString = function(str) {
  str = str.toLowerCase()
    .replace(/\b(steps|in|of|hash|line|on|yd ln)\b/g, '')
    .replace(':', '')
    .replace(/^\s+/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+$/, '');

  return str.split(' ');
};
var parseHoriz = function(str) {
  let data = splitString(str);
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

  return side * ((50 - yard) * 8 / 5 + offset);
};
var parseVert = function(str) {
  let data = splitString(str);
  let pos, offset = 0;

  if (data.length > 2) {
    offset = parseFloat(data[0]);
    if (data[1] === 'front') {
      offset *= -1;
    }
  }

  if (data[data.length - 1] === '(ncaa)') {
    if (data[data.length - 2] === 'home') {
      pos = COLLEGE.front * 12 / 22.5;
    } else if (data[data.length - 2] === 'visitor') {
      pos = 52; // TODO: 53 1/3 steps
    }
  } else if (data[data.length - 1] === 'side') {
    if (data[data.length - 2] === 'home') {
      pos = 0;
    } else if (data[data.length - 2] === 'visitor') {
      pos = HEIGHT * 12 / 22.5;
    }
  }

  return pos + offset;
};

PDFJS.workerSrc = './bower_components/pdfjs-dist/build/pdf.worker.js';
PDFJS.getDocument('drill/' + drill.name + '.pdf').then(function(pdf) {
  let maxPages = pdf.numPages;

  for (let j = 1; j <= maxPages; j++) {
    let page = pdf.getPage(j);

    // the callback function - we create one per page
    var processPageText = function(pageIndex) {
      return function(pageData, content) {
        return function(text) {
          let sets = [];
          let set = 0;
          let ii = 0;

          for (let i = 0; i < text.items.length; i++) {
            let str = text.items[i].str;

            if (str.includes('Visitor-Home')) {
              ii = i + 1;
            } else if (str.startsWith('Performer:')) {
              let data = str.replace('Performer: (unnamed) ', '').split(' ');
              let performer = {
                type: data[0],
                num: parseInt(data[1]),
                id: parseInt(str.substring(str.indexOf('ID:') + 3)),
                sets: sets
              };
              drill.performers.push(performer);

              sets = [];
              set = 0;
              // console.log(performer);
            }

            switch ((i - ii) % 4) {
              case 0:
                set = parseInt(str) - 1;
                sets[set] = {
                  set: parseInt(str)
                };
                break;
              case 1:
                sets[set].counts = parseInt(str);
                break;
              case 2:
                sets[set].horiz = str.replace(/\s+/g, ' ');
                sets[set].x = parseHoriz(str);
                break;
              case 3:
                sets[set].vert = str.replace(/\s+/g, ' ');
                sets[set].y = parseVert(str);
                break;
            }
          }

          if (pageData.pageIndex === maxPages - 1) {
            console.log(`${drill.performers.length} performers`);

            for (let performer of drill.performers) {
              for (let set of performer.sets) {
                if (isNaN(set.x) || isNaN(set.y)) {
                  console.log(set);
                }
              }
            }

            let blob = new Blob([JSON.stringify(drill)], {type: 'text/plain;charset=utf-8'});
            saveAs(blob, `${drill.name}.json`);
          }
        }
      }
    }(j);

    var processPage = function(pageData) {
      var content = pageData.getTextContent();

      content.then(processPageText(pageData, content));
    }

    page.then(processPage);
  }
});

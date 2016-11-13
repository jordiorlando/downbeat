var field = new Field();
var drill;

function selectByName(name) {
  for (let p of drill.performers) {
    if (parseName(p).toUpperCase() === name.toUpperCase()) {
      select(p);
      return p;
    }
  }
}

function playPause() {
  if (drill.playing) {
    drill.pause();
  } else {
    drill.play();
  }
}

var loadDrill = function(name) {
  $.getJSON(`drill/${name}.json`, function(data) {
    drill = new Drill(data);

    document.getElementById('status').children[0].lastChild
      .textContent = drill.name;

    field.drawPerformers();
    drill.move();
    // selectByName(parseName(drill.performers[0]));
  });
};

document.addEventListener('keydown', function(e) {
  switch (e.key) {
    case ' ':
      playPause();
      break;
    case 'ArrowLeft':
      drill.prevSet();
      break;
    case 'ArrowRight':
      drill.nextSet();
      break;
  }
}, false);



loadDrill('show4');
// loadDrill('pregame/revised');

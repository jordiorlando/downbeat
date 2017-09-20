var shows, data, drill, music;
var devMode = true;

var elements = {
  pane: {},
  button: {},
  checkbox: {},
  radio: {},
  menu: {}
};

for (let tab of ['drill', 'music']) {
  elements.pane[tab] = document.getElementById(tab);
  elements.menu[tab] = document.getElementById(`${tab}-menu`);
}

for (let button of ['volume', 'prev', 'playpause', 'next']) {
  elements.button[button] = document.getElementById(`button-${button}`);
  elements.button[button].addEventListener('click', () => action(button));
}

document.addEventListener('keydown', function(e) {
  switch (e.key) {
    case 'ArrowLeft':
      action('prev');
      break;
    case ' ':
      e.preventDefault();
      action('playpause');
      break;
    case 'ArrowRight':
      action('next');
      break;
  }
}, false);



function action(a) {
  if (elements.pane.drill.classList.contains('active')) {
    switch (a) {
      case 'prev':
        drill.prevSet();
        break;
      case 'playpause':
        drill.playPause();
        break;
      case 'next':
        drill.nextSet();
        break;
    }
  } else if (elements.pane.music.classList.contains('active')) {
    switch (a) {
      case 'prev':
        music.prevPage();
        break;
      case 'next':
        music.nextPage();
        break;
    }
  }
}

function load(season, show, part) {
  d3.json(`data/${devMode ? 'dev' : 'data'}.json`, d => {
    data = d;

    for (let i in data) {
      for (let j in data[i]) {
        let hasDrill = false;
        let hasMusic = false;

        for (let k in data[i][j]) {
          if (data[i][j][k].drill.length) {
            if (!hasDrill) {
              let menuItem = document.createElement('a');
              menuItem.classList.add('dropdown-item');
              menuItem.setAttribute('disabled', 'disabled');
              menuItem.innerText = j;
              elements.menu.drill.appendChild(menuItem);

              hasDrill = true;
            }

            let menuItem = document.createElement('a');
            menuItem.classList.add('dropdown-item');
            menuItem.innerText = k;
            menuItem.addEventListener('click', () => {
              drill.load(i, j, k);
            });
            elements.menu.drill.appendChild(menuItem);
          }
          if (data[i][j][k].music.length) {
            if (!hasMusic) {
              let menuItem = document.createElement('a');
              menuItem.classList.add('dropdown-item');
              menuItem.setAttribute('disabled', 'disabled');
              menuItem.innerText = j;
              elements.menu.music.appendChild(menuItem);

              hasMusic = true;
            }

            let menuItem = document.createElement('li');
            menuItem.classList.add('dropdown-item');
            menuItem.innerText = k;
            menuItem.addEventListener('click', () => {
              music.load(i, j, k);
            });
            elements.menu.music.appendChild(menuItem);
          }

          if (i === season && j === show && k === part) {
            drill = new Drill(season, show, part);
            music = new Music(season, show, part);
          }
        }
      }
    }
  });
}



if (devMode) {
  load('dev', 'Show 1', 'The Stars and Stripes Forever');
} else {
  load('2016', 'Show 4 - Buddy Rich Show', 'Buddy Rich Show');
}

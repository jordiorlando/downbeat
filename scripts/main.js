var shows, data, drill, music;
var devMode = true;
var drillElem = document.getElementById('drill');
var musicElem = document.getElementById('music');

var drillMenuElement = document.getElementById('drill-menu');
var musicMenuElement = document.getElementById('music-menu');

var load = function(season, show, part) {
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
              drillMenuElement.appendChild(menuItem);

              hasDrill = true;
            }

            let menuItem = document.createElement('a');
            menuItem.classList.add('dropdown-item');
            menuItem.innerText = k;
            menuItem.addEventListener('click', () => {
              drill.load(i, j, k);
            });
            drillMenuElement.appendChild(menuItem);
          }
          if (data[i][j][k].music.length) {
            if (!hasMusic) {
              if (musicMenuElement.lastChild) {
                musicMenuElement.lastChild.classList.add('mdl-menu__item--full-bleed-divider');
              }

              let menuItem = document.createElement('li');
              menuItem.classList.add('mdl-menu__item');
              menuItem.setAttribute('disabled', 'disabled');
              menuItem.innerText = j;
              musicMenuElement.appendChild(menuItem);

              hasMusic = true;
            }

            let menuItem = document.createElement('li');
            menuItem.classList.add('mdl-menu__item');
            menuItem.innerText = k;
            menuItem.addEventListener('click', () => {
              music.load(i, j, k);
            });
            musicMenuElement.appendChild(menuItem);
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

document.addEventListener('keydown', function(e) {
  if (drillElem.classList.contains('active')) {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        drill.playPause();
        break;
      case 'ArrowLeft':
        drill.prevSet();
        break;
      case 'ArrowRight':
        drill.nextSet();
        break;
    }
  } else if (musicElem.classList.contains('active')) {
    switch (e.key) {
      case 'ArrowLeft':
        music.prevPage();
        break;
      case 'ArrowRight':
        music.nextPage();
        break;
    }
  }
}, false);



if (devMode) {
  load('dev', 'Show 1', 'The Stars and Stripes Forever');
} else {
  load('2016', 'Show 4 - Buddy Rich Show', 'Buddy Rich Show');
}

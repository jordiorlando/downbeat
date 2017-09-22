var devMode = true;
var shows;
var panes = {
  drill: new Drill(),
  music: new Music(),
  tools: new Tools(),
  settings: new Settings()
};
var uiElements = {
  button: {},
  checkbox: {},
  radio: {},
  menu: {},
  status: {},
  metronome: document.getElementById('metronome')
};
var activePane;
for (let pane in panes) {
  if (panes[pane].element.classList.contains('active')) {
    panes[pane].active = true;
    activePane = pane;
  } else {
    panes[pane].active = false;
  }
}

// TODO: use jquery
for (let button of ['volume', 'prev', 'playpause', 'next']) {
  uiElements.button[button] = document.getElementById(`button-${button}`);
  uiElements.button[button].addEventListener('click', e => panes[activePane].eventHandler(e));
}

for (let markings of ['grid', 'highschool', 'college', 'pro']) {
  uiElements.checkbox[markings] = document.getElementById(`checkbox-markings-${markings}`);
  panes.drill.field.markings(markings, uiElements.checkbox[markings].classList.contains('active'));
  uiElements.checkbox[markings].addEventListener('click', e => panes.drill.field.markings(markings, !e.target.classList.contains('active')));
}

for (let theme of ['bw', 'color']) {
  uiElements.radio[theme] = document.getElementById(`radio-theme-${theme}`);
  if (uiElements.radio[theme].classList.contains('active')) {
    panes.drill.field.theme(theme);
  }
  uiElements.radio[theme].addEventListener('click', e => panes.drill.field.theme(theme, !e.target.classList.contains('active')));
}

for (let tab of ['drill', 'music']) {
  uiElements.menu[tab] = document.getElementById(`${tab}-menu`);
}

uiElements.status = Array.prototype.slice.call(document.getElementsByClassName('status-element'));
uiElements.status.forEach(elem => elem.addEventListener('click', e => panes[activePane].eventHandler(e)));

document.addEventListener('keydown', e => panes[activePane].eventHandler(e), false);



$('a[data-toggle="tab"]').on('shown.bs.tab', e => {
  panes[e.relatedTarget.id.replace('-tab', '')].active = false;
  activePane = e.target.id.replace('-tab', '');
  panes[activePane].active = true;
  panes[activePane].updateUI();
});

$(() => $('[data-toggle="tooltip"]').tooltip());



function load(season, show, part) {
  d3.json(`data/${devMode ? 'dev' : 'data'}.json`, d => {
    shows = d;

    for (let i in shows) {
      for (let j in shows[i]) {
        let hasDrill = false;
        let hasMusic = false;

        for (let k in shows[i][j]) {
          if (shows[i][j][k].drill.length) {
            if (!hasDrill) {
              let menuItem = document.createElement('a');
              menuItem.classList.add('dropdown-item');
              menuItem.setAttribute('disabled', 'disabled');
              menuItem.innerText = j;
              uiElements.menu.drill.appendChild(menuItem);

              hasDrill = true;
            }

            let menuItem = document.createElement('a');
            menuItem.classList.add('dropdown-item');
            menuItem.innerText = k;
            menuItem.addEventListener('click', () => {
              panes.drill.load(i, j, k);
            });
            uiElements.menu.drill.appendChild(menuItem);
          }
          if (shows[i][j][k].music.length) {
            if (!hasMusic) {
              let menuItem = document.createElement('a');
              menuItem.classList.add('dropdown-item');
              menuItem.setAttribute('disabled', 'disabled');
              menuItem.innerText = j;
              uiElements.menu.music.appendChild(menuItem);

              hasMusic = true;
            }

            let menuItem = document.createElement('li');
            menuItem.classList.add('dropdown-item');
            menuItem.innerText = k;
            menuItem.addEventListener('click', () => {
              panes.music.load(i, j, k);
            });
            uiElements.menu.music.appendChild(menuItem);
          }

          if (i === season && j === show && k === part) {
            panes.drill.load(season, show, part);
            panes.music.load(season, show, part);
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

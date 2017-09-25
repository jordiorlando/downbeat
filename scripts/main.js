var devMode = true;
var data;
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
  select: {},
  status: [],
  modal: {
    load: $('#load-modal'),
    loadShow: document.getElementById('load-show')
  },
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

for (let name of ['season', 'show', 'part']) {
  uiElements.select[name] = document.getElementById(`select-${name}`);
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



d3.json(`data/${devMode ? 'dev' : 'data'}.json`, d => {
  data = d;
  console.log(data)

  $('#select-season').change(e => {
    $('#load-show').prop('disabled', true);
    $('.part-option').addClass('d-none');
    $('#select-part').val('none');
    $('.show-option').addClass('d-none');
    $('#select-show').val('none');
    $(`.show-${e.target.value}`).removeClass('d-none');
  });

  $('#select-show').change(e => {
    $('#load-show').prop('disabled', true);
    $('.part-option').addClass('d-none');
    $('#select-part').val('none');
    $(`.part-${e.target.value}`).removeClass('d-none');
  });

  $('#select-part').change(e => {
    // TODO: jquery
    if (uiElements.select.part.selectedIndex) {
      $('#load-show').prop('disabled', false);
    } else {
      $('#load-show').prop('disabled', true);
    }
  });

  uiElements.modal.loadShow.addEventListener('click', e => {
    let season = data.seasons[uiElements.select.season.value];
    let show = season.shows[uiElements.select.show.value.split('-').pop()];
    let part = show.parts[uiElements.select.part.value.split('-').pop()];
    console.log(season, show, part);

    panes.drill.load(season.path, show.path, part.path);
    panes.music.load(season.path, show.path, part.path);

    uiElements.modal.load.modal('hide');
  });

  data.seasons.forEach((season, i) => {
    let option = document.createElement('option');
    option.setAttribute('value', i);
    option.innerText = season.name;
    option.classList.add('season-option');
    uiElements.select.season.appendChild(option);

    season.shows.forEach((show, j) => {
      let option = document.createElement('option');
      option.setAttribute('value', `${i}-${j}`);
      option.innerText = show.name;
      option.classList.add('d-none');
      option.classList.add('show-option');
      option.classList.add(`show-${i}`);
      uiElements.select.show.appendChild(option);

      show.parts.forEach((part, k) => {
        let option = document.createElement('option');
        option.setAttribute('value', `${i}-${j}-${k}`);
        option.innerText = part.name;
        option.classList.add('d-none');
        option.classList.add('part-option');
        option.classList.add(`part-${i}-${j}`);
        uiElements.select.part.appendChild(option);
      });
    });
  });
});

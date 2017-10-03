var data, panes, activePane;

$.getJSON('data/2017.json', d => {
  data = d;
  panes = {
    drill: new Drill(),
    music: new Music(),
    tools: new Tools(),
    settings: new Settings()
  }

  for (let pane in panes) {
    panes[pane].active = $(`#${pane}`).hasClass('active');
    activePane = panes[pane].active ? pane : activePane;
  }
  $('a[data-toggle="tab"]').on('shown.bs.tab', e => {
    panes[e.relatedTarget.id.replace('-tab', '')].active = false;
    activePane = e.target.id.replace('-tab', '');
    panes[activePane].active = true;
    panes[activePane].updateUI();
  });

  panes.settings.load();


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

  $('#load-show').prop('disabled', true);
  $('#select-part').change(e => {
    // TODO: jquery
    if ($('#select-part').val() !== 'none') {
      $('#load-show').prop('disabled', false);
    } else {
      $('#load-show').prop('disabled', true);
    }
  });

  $('#load-show').click(e => {
    let season = data.seasons[$('#select-season').val()];
    let show = season.shows[$('#select-show').val().split('-').pop()];
    let part = show.parts[$('#select-part').val().split('-').pop()];

    panes.drill.load(season.path, show.path, part.path);
    panes.music.load(season.path, show.path, part.path);

    $('#load-modal').modal('hide');
  });

  data.seasons.forEach((season, i) => {
    let option = document.createElement('option');
    option.setAttribute('value', i);
    option.innerText = season.name;
    option.classList.add('season-option');
    $('#select-season').append(option);

    season.shows.forEach((show, j) => {
      let option = document.createElement('option');
      option.setAttribute('value', `${i}-${j}`);
      option.innerText = show.name;
      option.classList.add('d-none');
      option.classList.add('show-option');
      option.classList.add(`show-${i}`);
      $('#select-show').append(option);

      show.parts.forEach((part, k) => {
        let option = document.createElement('option');
        option.setAttribute('value', `${i}-${j}-${k}`);
        option.innerText = part.name;
        option.classList.add('d-none');
        option.classList.add('part-option');
        option.classList.add(`part-${i}-${j}`);
        $('#select-part').append(option);
      });
    });
  });

  panes.drill.load('Traditional', 'Pregame', 'Revised Entrance 3');
});

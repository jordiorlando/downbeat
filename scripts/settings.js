// HACK: use jQuery instead of uiElements
var uiElements = {
  status: []
};

class Settings {
  constructor() {
    this.settings = {
      accuracy: [[2, true], [3, true], [4, true], [8, false], [10, false]]
    };


    $(document).keydown(e => panes[activePane].eventHandler(e));

    $('a[data-toggle="tab"]').click(e => $('#navbarNav').collapse('hide'));
    $('#load-button').click(e => $('#navbarNav').collapse('hide'));

    uiElements.status = Array.prototype.slice.call(document.getElementsByClassName('status-element'));
    $('.status-element').click(e => panes[activePane].eventHandler(e));

    for (let button of ['prev', 'playpause', 'next']) {
      $(`#button-${button}`).click(e => panes[activePane].eventHandler(e));
    }

    if (screenfull.enabled) {
      // $('#button-fullscreen').removeClass('d-none');
      $('#button-fullscreen').click(() => {
        screenfull.toggle();
      });
      screenfull.on('change', () => {
        $('#button-fullscreen').children().toggleClass('zmdi-fullscreen', !screenfull.isFullscreen);
        $('#button-fullscreen').children().toggleClass('zmdi-fullscreen-exit', screenfull.isFullscreen);
      });
    }
  }

  get(setting) {
    return this.settings[setting] instanceof Array ? this.settings[setting].reduce((a, v) => {
      if (v[1]) {
        a.push(v[0]);
      }
      return a;
    }, []) : this.settings[setting];
  }

  set(setting, key, value) {
    this.settings[setting][key] = value;
  }

  load() {
    this.settings.accuracy.forEach((val, i) => {
      this.settings.accuracy[i][1] = $(`#checkbox-accuracy-${val[0]}`).hasClass('active');
      $(`#checkbox-accuracy-${val[0]}`).click(e => panes.settings.set('accuracy', i, [val[0], !e.currentTarget.classList.contains('active')]));
      panes.drill.move();
    });

    for (let markings of ['grid', 'highschool', 'college', 'pro']) {
      panes.drill.field.markings(markings, $(`#checkbox-markings-${markings}`).hasClass('active'));
      $(`#checkbox-markings-${markings}`).click(e => panes.drill.field.markings(markings, !e.currentTarget.classList.contains('active')));
    }

    for (let theme of ['bw', 'color']) {
      if ($(`#radio-theme-${theme}`).hasClass('active')) {
        panes.drill.field.theme(theme);
      }
      $(`#radio-theme-${theme}`).click(e => panes.drill.field.theme(theme, !e.currentTarget.classList.contains('active')));
    }

    for (let type of data.performers) {
      $('#select-performer-type').append(`<option value=${type.symbol}>${type.name}</option>`);
      if (type.squads) {
        for (let squad of type.squads) {
          $('#select-performer-squad').append(`<option value="${squad}" class="d-none">${squad}</option>`);
        }
      }
    }

    for (let audio of ['met', 'none']) {
      if ($(`#radio-audio-${audio}`).hasClass('active')) {
        panes.drill[audio === 'none' ? 'mute' : 'unmute']();
      }
      $(`#radio-audio-${audio}`).click(e => panes.drill[audio === 'none' ? 'mute' : 'unmute']());
    }
  }

  updateUI() {
    if (this.active) {
      for (let i = 0; i < uiElements.status.length; i++) {
        for (let j = 0; j < uiElements.status[i].children.length; j++) {
          uiElements.status[i].children[j].textContent = '';
        }
      }
    }
  }

  eventHandler(e) {

  }
}

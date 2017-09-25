// HACK: use jQuery instead of uiElements
var uiElements = {
  status: []
};

class Settings {
  constructor() {
    $(document).keydown(e => panes[activePane].eventHandler(e));

    uiElements.status = Array.prototype.slice.call(document.getElementsByClassName('status-element'));
    $('.status-element').click(e => panes[activePane].eventHandler(e));

    for (let button of ['volume', 'prev', 'playpause', 'next']) {
      $(`#button-${button}`).click(e => panes[activePane].eventHandler(e));
    }
  }

  load() {
    for (let markings of ['grid', 'highschool', 'college', 'pro']) {
      panes.drill.field.markings(markings, $(`#checkbox-markings-${markings}`).hasClass('active'));
      $(`#checkbox-markings-${markings}`).click(e => panes.drill.field.markings(markings, !e.target.classList.contains('active')));
    }

    for (let theme of ['bw', 'color']) {
      if ($(`#radio-theme-${theme}`).hasClass('active')) {
        panes.drill.field.theme(theme);
      }
      $(`#radio-theme-${theme}`).click(e => panes.drill.field.theme(theme, !e.target.classList.contains('active')));
    }

    for (let type of data.performers) {
      $('#select-performer-type').append(`<option value=${type.symbol}>${type.name}</option>`);
      if (type.squads) {
        for (let squad of type.squads) {
          $('#select-performer-squad').append(`<option value="${squad}" class="d-none">${squad}</option>`);
        }
      }
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

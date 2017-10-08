class Metronome {
  constructor() {
    panes.settings.onChange('audio', (old, val) => this[val === 'none' ? 'mute' : 'unmute']());
  }

  playOnce() {
    if (!this.muted) {
      $('#metronome')[0].play();
    }
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  muteUnmute() {
    this[this.muted ? 'unmute' : 'mute']();
  }
}

class Tuner {
  constructor() {}
}

class Tools {
  constructor() {
    this.metronome = new Metronome();
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
    if (e.type === 'click' && e.currentTarget.tagName === 'BUTTON') {
      switch (e.currentTarget.id) {
        case 'button-volume':
          this.metronome.muteUnmute();
          break;
      }
    }
  }
}

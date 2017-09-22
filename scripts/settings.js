class Settings {
  constructor() {
    this.element = document.getElementById('settings');
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

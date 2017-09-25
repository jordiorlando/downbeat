class Music {
  constructor(season, show, part) {
    this.element = document.getElementById('music');

    if (season && show && part) {
      this.load(season, show, part);
    }

    // Add event listeners
    // document.getElementById('music-button-prev').addEventListener('click', () => this.prevPage());
    // document.getElementById('music-button-next').addEventListener('click', () => this.nextPage());
  }

  load(season, show, part) {
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 5;
    this.canvas = document.getElementById('pdf');
    this.ctx = this.canvas.getContext('2d');

    PDFJS.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.min.js';
    PDFJS.getDocument(`data/${season}/${show}/${part}/music/score.pdf`).then(pdf => {
      this.pdf = pdf;
      this.pages = pdf.numPages;

      // Update music information
      document.getElementById('music-title').textContent = part;
      //document.getElementById('music-part').textContent = 'score';

      this.renderPage(this.pageNum);
    });
  }

  renderPage(num) {
    this.pageRendering = true;

    // Using promise to fetch the page
    this.pdf.getPage(num).then(page => {
      // TODO: support zooming
      let viewport = page.getViewport(this.scale);
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;

      // Render PDF page into canvas context
      let renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      let renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(() => {
        this.pageRendering = false;
        if (this.pageNumPending !== null) {
          // New page rendering is pending
          this.renderPage(this.pageNumPending);
          this.pageNumPending = null;
        }
      });
    });

    // Update page counters
    this.updateUI();
  }

  queueRenderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  prevPage() {
    if (this.pageNum <= 1) {
      return;
    }

    this.pageNum--;
    this.queueRenderPage(this.pageNum);
  }

  nextPage() {
    if (this.pageNum >= this.pdf.numPages) {
      return;
    }

    this.pageNum++;
    this.queueRenderPage(this.pageNum);
  }

  updateUI() {
    if (this.active) {
      uiElements.status[0].children[0].textContent = '';
      uiElements.status[0].children[1].textContent = '';
      uiElements.status[1].children[0].textContent = '';
      uiElements.status[1].children[1].textContent = '';
      uiElements.status[2].children[0].textContent = 'Page';
      uiElements.status[2].children[1].textContent = `${this.pageNum} / ${this.pages}`;
      uiElements.status[3].children[0].textContent = 'Measures';
      uiElements.status[3].children[1].textContent = '1 - 2';
    }
  }

  eventHandler(e) {
    if (e.type === 'keydown') {
      switch (e.key) {
        case 'ArrowLeft':
          this.prevPage();
          break;
        case 'ArrowRight':
          this.nextPage();
          break;
      }
    } else if (e.type === 'click') {
      if (e.target.tagName === 'BUTTON') {
        switch (e.target.id) {
          case 'button-volume':
            break;
          case 'button-prev':
            this.prevPage();
            break;
          case 'button-playpause':
            break;
          case 'button-next':
            this.nextPage();
            break;
        }
      }
    }
    // console.log('music', e);
  }
}

class Music {
  constructor(name) {
    this.load(name);

    document.getElementById('button-prev-page').addEventListener('click', () => this.prevPage());
    document.getElementById('button-next-page').addEventListener('click', () => this.nextPage());
  }

  load(name) {
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1.5;
    this.canvas = document.getElementById('pdf');
    this.ctx = this.canvas.getContext('2d');

    PDFJS.workerSrc = '../bower_components/pdfjs-dist/build/pdf.worker.js';
    PDFJS.getDocument(`../music/${name}.pdf`).then(pdf => {
      this.pdf = pdf;
      // document.getElementById('page_count').textContent = pdf.numPages;
      this.renderPage(this.pageNum);
    });
  }

  renderPage(num) {
    this.pageRendering = true;

    // Using promise to fetch the page
    this.pdf.getPage(num).then(page => {
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
    // document.getElementById('page_num').textContent = pageNum;
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
}

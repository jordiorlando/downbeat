class Music {
  constructor(id) {
    PDFJS.workerSrc = '../bower_components/pdfjs-dist/build/pdf.worker.js';
    PDFJS.getDocument('../music/show_4/Buddy Rich Show - score.pdf').then(function(pdf) {
      // Fetch the page.
      pdf.getPage(1).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        // Prepare canvas using PDF page dimensions.
        var canvas = document.getElementById('pdf');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context.
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });
  }
}

PDFJS.workerSrc = '../bower_components/pdfjs-dist/build/pdf.worker.js';
PDFJS.getDocument('../music/show_4/Buddy Rich Show - score.pdf').then(function(pdf) {
  // Fetch the page.
  pdf.getPage(1).then(function(page) {
    var scale = 1.5;
    var viewport = page.getViewport(scale);

    // Prepare canvas using PDF page dimensions.
    var canvas = document.getElementById('pdf');
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context.
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext);
  });
});

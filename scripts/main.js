if (!SVG.supported) {
  alert('SVG not supported');
}

var canvas = SVG('drawing');
canvas.size(
  canvas.parent().style.width,
  canvas.parent().style.height
);
canvas.viewbox(0, 0, 360, 160);

// Sub-pixel offset fix
SVG.on(window, 'resize', function () { canvas.spof(); });

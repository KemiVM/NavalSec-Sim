const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('../public/Barco Lateral (1).png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const W = this.width;
    const H = this.height;
    console.log(`Dimensions: ${W}x${H}`);
    
    // Create a 60x20 text representation
    const gridW = 60;
    const gridH = 20;
    
    for (let y = 0; y < gridH; y++) {
      let line = '';
      for (let x = 0; x < gridW; x++) {
        // map grid coord to image coord
        const imgX = Math.floor((x / gridW) * W);
        const imgY = Math.floor((y / gridH) * H);
        
        const idx = (W * imgY + imgX) << 2;
        const a = this.data[idx + 3]; // alpha channel
        
        if (a > 50) {
            line += '#';
        } else {
            line += '.';
        }
      }
      console.log(`${y.toString().padStart(2, '0')} ` + line);
    }
  });

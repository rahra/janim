
const { createCanvas } = require('canvas');
const ffpipe = require("./ffpipe.js");


/*! This class creates the (sample) animation.
 * Call update() for the frame to be updated every time.
 */
class JAnim
{
   constructor(canvas)
   {
      // canvas
      this.canvas = canvas;
      // drawing context
      this.ctx = canvas.getContext('2d');
      // frame counter
      this.frame = 0;

      // initial colorvalue
      this.rgb = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
      this.rgbd = [7, 11, 13];

      // initial coordinates
      this.x = [Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.width)];
      this.y = [Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * canvas.height)];
      // initial coordinate incrementals
      this.xd = [15, 20, 10];
      this.yd = [20, 15, 10];

      // call initialization
      this.init();
   }


   init()
   {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0)";
      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fill();
   }


   update()
   {
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fill();

      this.ctx.beginPath();
      for (var i = 0; i < 3; i++)
      {
         this.count(this.x, this.xd, i, this.canvas.width);
         this.count(this.y, this.yd, i, this.canvas.height);
         this.ctx.lineTo(this.x[i], this.y[i]);
      }
      this.ctx.closePath();

      // adjust color value of triangle
      for (var i = 0; i < 3; i++)
      {
         this.count(this.rgb, this.rgbd, i, 256);
      }

      this.ctx.fillStyle = `rgb(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]})`;
      this.ctx.fill();
   }


   count(v, d, i, n)
   {
      v[i] += d[i];
      if (v[i] < 0)
      {
         d[i] *= -1;
         v[i] += d[i];
      }
      else if (v[i] >= n)
      {
         d[i] *= -1;
         v[i] += d[i];
      }
   }
}

console.log(ffpipe);

// create canvas
const canvas = createCanvas(ffpipe.width, ffpipe.height);

var anim = new JAnim(canvas);

ffpipe.init_args(process.argv);
ffpipe.init_ffmpeg();
ffpipe.render(anim, 300);

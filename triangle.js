/*! Simple triangle animation (simple example).
 *
 * @author Bernhard R. Fischer, <bf@abenteuerland.at>
 * @date 2025/08/23
 */


/*! This class creates the (sample) animation.
 * Call update() for the frame to be updated every time.
 */
function triangle(canvas)
{
   // canvas
   this.canvas = canvas;
   // drawing context
   var ctx = canvas.getContext('2d');
   // frame counter
   var frame = 0;

   // initial colorvalue
   var rgb = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
   var rgbd = [7, 11, 13];

   // initial coordinates
   var x = [Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.width)];
   var y = [Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * canvas.height)];
   // initial coordinate incrementals
   var xd = [15, 20, 10];
   var yd = [20, 15, 10];

   /*
   ctx.fillStyle = "rgba(0, 0, 0, 0)";
   ctx.beginPath();
   ctx.rect(0, 0, this.canvas.width, this.canvas.height);
   ctx.fill();
*/
   ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

   count = function(v, d, i, n)
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

   fade_out = function()
   {
      // fade out previous frame
      //ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
   }

   this.update = function()
   {
      fade_out();

      ctx.beginPath();
      for (var i = 0; i < 3; i++)
      {
         count(x, xd, i, this.canvas.width);
         count(y, yd, i, this.canvas.height);
         ctx.lineTo(x[i], y[i]);
      }
      ctx.closePath();

      // adjust color value of triangle
      for (var i = 0; i < 3; i++)
      {
         count(rgb, rgbd, i, 256);
      }

      ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx.fill();
   }

   return this;
}


// is browser or node?
if (typeof window === 'undefined')
{
   /* node/ffmpeg version */
   const { createCanvas } = require('canvas');
   const ffpipe = require("./ffpipe.js");

   ffpipe.init_args(process.argv);
   ffpipe.init_ffmpeg();

   const canvas = createCanvas(ffpipe.width, ffpipe.height);
   var anim = triangle(canvas);

   ffpipe.render(canvas, anim.update, 300);
}
else
{
   /* browser version */
   const canvas = document.getElementById("canvas2d");
   const fps = 10;

   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   var anim = triangle(canvas);

   var timer = window.setInterval(anim.update, 1000 / fps);
}

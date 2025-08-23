/*! Aurora Borealis.
 *
 * @author Bernhard R. Fischer, <bf@abenteuerland.at>
 * @date 2025/08/23
 */


function createAurora(canvas, fps = 30)
{
   this.canvas = canvas;
   var ctx = canvas.getContext('2d');
   var width = canvas.width;
   var height = canvas.height;
   //! height of aurora
   var h = height;
   //! frame counter (doesn't do anything yet)
   var frame = 0;
   //! change rate of Aurora, higher values = faster
   var rate = 8;
   //! frequency scaling
   var fs = 16;
   // horizontal resolution
   var d = 4;
   // number of polynom components
   var n = 8;
   // here go the params for the Fourier series
   var a = [], b = [], k = [];
   // function value, i.e. result of Fourier series
   var f = [];

   // base initialization for Fourier params
   for (var i = 0; i < n; i++)
   {
      a.push(Math.random());
      b.push(Math.random())
      k.push(Math.random());
   }

   ctx.strokeStyle = "#ffffff";

   // helper function, returns a random value r which is -a <= r <= a.
   rdiff = function(a)
   {
      return a * 2 * Math.random() - a;
   }

   // helper function, returns a value r which is always -1 <= a <= 1, i.e. if
   // a > 1, 1 is returned and if a < -1, -1 is returned.
   bound = function(a)
   {
      return Math.min(1, Math.abs(a)) * Math.sign(a);
   }

   // Updates the parameters of the Fourier series.
   update_param = function()
   {
      var m = 0.1;   // drift rate
      for (var i = 0; i < n; i++)
      {
         a[i] = bound(a[i] + rdiff(m));
         b[i] = bound(b[i] + rdiff(m));
         //k[i] = Math.abs(k[i] += s);
      }
   }

   // Calculate base function which is a random Fourier series. This gives the
   // Aurora its shape.
   calc = function()
   {
      for (var x = 0; x < width; x += d)
      {
         var t = x * Math.PI / width;
         var v = 0;
         for (var i = 0; i < n; i++)
            v += a[i] * Math.cos(k[i] * t * fs) + b[i] * Math.sin(k[i] * t * fs);

         f[x] = v / n;
      }
   }

   this.update = function()
   {
      frame++;

      update_param();
      calc();

      //ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgb(0,0,0,0.1)";      // transparency determines after glow
      ctx.fillRect(0, 0, width, height);

      /* draw curve (this is for debugging) */
      if (1)
      {
         // axis
         ctx.beginPath();
         ctx.moveTo(0, height * 0.5);
         ctx.lineTo(width, height * 0.5);
         ctx.stroke();

         // curve
         ctx.beginPath();
         for (var x = 0; x < width; x += d)
            ctx.lineTo(x, height * 0.5 - f[x] * height * 0.5);
         ctx.stroke();
      }

      /* draw Aurora */
      //if (0)
      for (var x = 0; x < width - d; x += d)
      {
         var c = Math.floor((f[x] + 1) * 128);
         var v = Math.abs(f[x]) * 2;
         var y0 = h * Math.abs(f[x]);
         var y1 = h * Math.abs(f[x + d]);

         var gt = ctx.createLinearGradient(x, 0, x, y0);
         gt.addColorStop(0, `rgba(${c},${c},${c},${v})`);
         gt.addColorStop(1, 'rgba(0,0,0,0)');
         ctx.fillStyle = gt;
         //ctx.fillStyle = `rgba(${c},${c},${c},${v})`;
         ctx.beginPath();
         ctx.moveTo(x, 0);
         ctx.lineTo(x, y0);
         ctx.lineTo(x + d, y1);
         ctx.lineTo(x + d, 0);
         ctx.closePath();
         ctx.fill();
      }
   }

   this.update();

   return this;
}


// is browser or node?
if (typeof window === 'undefined')
{
   /* node/ffmpeg version */
   const { createCanvas } = require('canvas');
   const ffpipe = require("./ffpipe.js");

   const canvas = createCanvas(ffpipe.width, ffpipe.height);
   ffpipe.init_args(process.argv);
   ffpipe.init_ffmpeg();

   var aurora = createAurora(canvas, ffpipe.fps)

   ffpipe.render(aurora, 300);
}
else
{
   /* browser version */
   const canvas = document.getElementById("canvas2d");
   const fps = 10;

   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   var aurora = createAurora(canvas, fps)

   var timer = window.setInterval(aurora.update, 1000 / fps);
}


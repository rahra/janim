/*! Aurora Borealis.
 *
 * @author Bernhard R. Fischer, <bf@abenteuerland.at>
 * @date 2025/08/23
 */


function createAurora(canvas)
{
   this.canvas = canvas;
   var ctx = canvas.getContext('2d');
   var width = canvas.width;
   var height = canvas.height;
   //! height of aurora
   var h = height;
   //! frame counter (doesn't do anything yet)
   var frame = 0;
   //! max intensity (0.0 - 1.0)
   var I = 0.6;
   //! drift factor, this is the change from one frame to the next
   var D = 0.05;
   // horizontal resolution
   var d = 4;
   // number of polynom components
   var n = 8;
   // here go the params for the Fourier series
   var a = [], b = [];
   // function value, i.e. result of Fourier series
   var f = [];

   // base initialization for Fourier params
   var a0 = Math.random();
   for (var i = 0; i < n; i++)
   {
      a.push(Math.random());
      b.push(Math.random())
   }

   ctx.clearRect(0, 0, width, height);
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
      for (var i = 0; i < n; i++)
      {
         a[i] = bound(a[i] + rdiff(D));
         b[i] = bound(b[i] + rdiff(D));
      }
   }

   // Calculate base function which is a random Fourier series. This gives the
   // Aurora its shape.
   calc = function()
   {
      for (var x = 0; x < width / d; x++)
      {
         var t = x * 2 * Math.PI / (width / d);
         var v = a0 * 0.5;
         for (var i = 0; i < n; i++)
            v += a[i] * Math.cos(i * t) + b[i] * Math.sin(i * t);

         f[x] = v / n;
         //f[x] = Math.log(Math.abs(f[x]) * (Math.E - 1) + 1) * Math.sign(f[x]);
      }
   }

   // Return an Aurora-like HTML color dependent on f, where is 0 <= f <= 1.
   aurora_color = function(f, a)
   {
      //blue, green, yellow, red
      const acols =
         [
            {r: 0, g: 0, b: 1},
            {r: 0, g: 1, b: 0},
            {r: 1, g: 1, b: 0},
            {r: 1, g: 0, b: 0}
         ];

      var d = 1 / (acols.length - 1);
      var i = Math.floor(f / d);
      var s = f / d - i;
      var r = Math.floor(256 * ((1 - s) * acols[i].r + s * acols[i + 1].r));
      var g = Math.floor(256 * ((1 - s) * acols[i].g + s * acols[i + 1].g));
      var b = Math.floor(256 * ((1 - s) * acols[i].b + s * acols[i + 1].b));

      return `rgba(${r},${g},${b},${a})`;
   }

   this.update = function()
   {
      frame++;

      update_param();
      calc();

      // fade out previous frame
      //ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      /* draw curve (this is for debugging) */
      if (0)
      {
         // axis
         ctx.beginPath();
         ctx.moveTo(0, height * 0.5);
         ctx.lineTo(width, height * 0.5);
         ctx.stroke();

         // curve
         ctx.beginPath();
         for (var x = 0; x < width / d; x++)
            ctx.lineTo(x * d, height * 0.5 - f[x] * height * 0.5);
         ctx.stroke();
      }

      /* draw Aurora */
      for (var x = 0; x < width / d - 1; x++)
      {
         var c = Math.floor((f[x] + 1) * 128);
         var v = Math.abs(f[x]) * 2;

         var x0 = x * d;
         var x1 = x0 + d;
         var y0 = h * Math.abs(f[x]);
         var y1 = h * Math.abs(f[x + 1]);

         var gt = ctx.createLinearGradient(x, 0, x, y0);
         //gt.addColorStop(0, `rgba(${c},${c},${c},${v})`);
         gt.addColorStop(0, aurora_color((f[x] + 1) * 0.5, v * I));
         gt.addColorStop(1, 'rgba(0,0,0,0)');
         ctx.fillStyle = gt;
         //ctx.fillStyle = `rgba(${c},${c},${c},${v})`;
         ctx.beginPath();
         ctx.moveTo(x0, 0);
         ctx.lineTo(x0, y0);
         ctx.lineTo(x1, y1);
         ctx.lineTo(x1, 0);
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

   var aurora = createAurora(canvas)

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


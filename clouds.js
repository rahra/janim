/*! clouds
 *
 * @author Bernhard R. Fischer, <bf@abenteuerland.at>
 * @date 2025/08/24
 *
 * FIXME: Work in progress!
 */


/*! This class creates the (sample) animation.
 * Call update() for the frame to be updated every time.
 */
function clouds(canvas)
{
   // drawing context
   var ctx = canvas.getContext('2d');
   // background fade out mode
   var fade = 1;  // 1 => fade to black, 0 => fade to transparency
   // frame counter
   var frame = 0;
   // resolution in bits, i.e. blocks = 2^sqbits
   const sqbits = 7;
   // zoom speed
   const fz = 10;
   // number of blocks
   const bcnt = 1 << sqbits;
   // horizontal pixels per block
   const ppbx = canvas.width / bcnt;
   // vertical pixels per block
   const ppby = canvas.height / bcnt;
   // block data;
   //var bd = Array(bcnt + 1);
   var bd = [];
   // max final alpha (1 = opacity, 0 = transparency)
   const maxval_ = 0.7;
   //
   var min = 1, max = 0;

/*
   get = function(x, y)
   {
      return x < 0 || x >= bcnt || y < 0 || y >= bcnt ? 0 : bd[x][y];
   }
*/

   get_color = function(b, mf)
   {
      //return Math.min(Math.max(b + (Math.random() * 2 * mf - mf), 0), 1);
      //return Math.max(b + (Math.random() * 2 * mf - mf), 0);
      return b + (Math.random() * 2 * mf - mf);
   }


   col_mf = function(n, sqbits)
   {
      return n / sqbits;
   }


   get_pixel = function(x, y)
   {
      return bd[x][y];
   }


   set_pixel = function(x, y, v)
   {
      bd[x][y] = v;
      min = Math.min(v, min);
      max = Math.max(v, max);
   }


   populate2 = function(sqbits, x0 = 0, y0 = 0)
   {
      var f1, f2, f3, f4, na, ni, n, n1, nk;
      var i, j, k;
      var mf;

      ni = sqbits - 1;
      na = 1 << sqbits;

      n = na;
      for (i = 0; i <= ni; i++)
      {
         mf = col_mf(ni + 1 - i, sqbits);
         n1 = n >> 1;
         for (j = 1; j <= (1 << i); j++)
         {
            f1 = bd[x0 + (j - 1) * n][y0 + 0];
            f2 = bd[x0 + j * n][y0 + 0];
            set_pixel(x0 + j * n - n1, y0 + 0, get_color((f1 + f2) * 0.5, mf));;
            f1 = bd[x0 + (j - 1) * n][y0 + na];
            f2 = bd[x0 + j * n][y0 + na];
            set_pixel(x0 + j * n - n1, y0 + na, get_color((f1 + f2) * 0.5, mf));
            f1 = bd[x0 + 0][y0 + (j - 1) * n];
            f2 = bd[x0 + 0][y0 + j * n];
            set_pixel(x0 + 0, y0 + j * n - n1, get_color((f1 + f2) * 0.5, mf));
            f1 = bd[x0 + na][y0 + (j - 1) * n];
            f2 = bd[x0 + na][y0 + j * n];
            set_pixel(x0 + na, y0 + j * n - n1, get_color((f1 + f2) * 0.5, mf));
         }
         n = n1;
      }
      n = na;
      for (i = 0; i <= ni; i++)
      {
         mf = col_mf(ni + 1 - i, sqbits);
         n1 = n >> 1;
         for (k = 1; k <= (1 << i); k++)
            for (j = 1; j <= (1 << i); j++)
            {
               f1 = bd[x0 + (j - 1) * n][y0 + (k - 1) * n];
               f2 = bd[x0 + (j - 1) * n][y0 + k * n];
               f3 = bd[x0 + j * n][y0 + (k - 1) * n];
               f4 = bd[x0 + j * n][y0 + k * n];
               set_pixel(x0 + j * n - n1, y0 + k * n - n1, get_color((f1 + f2 + f3 + f4) * 0.25, mf));
            }
         nk = 0;
         for (k = 1; k <= ((1 << (i + 1)) - 1); k++)
         {
            nk ^= 1;
            for (j = 1; j <= ((1 << i) - nk); j++)
            {
               f1 = bd[x0 + j * n - n1 + nk * n1][y0 + (k - 1) * n1];
               f2 = bd[x0 + j * n + nk * n1][y0 + k * n1];
               f3 = bd[x0 + j * n - n1 + nk * n1][y0 + (k + 1) * n1];
               f4 = bd[x0 + (j - 1) * n + nk * n1][y0 + k * n1];
               set_pixel(x0 + j * n - n1 + nk * n1, y0 + k * n1, get_color((f1 + f2 + f3 + f4) * 0.25, mf));
            }
         }
         n = n1;
      }
   }


   populate = function(sqbits)
   {
      var f1, f2, f3, f4, na, ni, n, n1, nk;
      var i, j, k;
      var mf;

      ni = sqbits - 1;
      na = 1 << sqbits;

      n = na;
      for (i = 0; i <= ni; i++)
      {
         mf = col_mf(ni + 1 - i, sqbits);
         n1 = n >> 1;
         for (j = 1; j <= (1 << i); j++)
         {
            f1 = bd[(j - 1) * n][0];
            f2 = bd[j * n][0];
            set_pixel(j * n - n1, 0, get_color((f1 + f2) * 0.5, mf));;
            f1 = bd[(j - 1) * n][na];
            f2 = bd[j * n][na];
            set_pixel(j * n - n1, na, get_color((f1 + f2) * 0.5, mf));
            f1 = bd[0][(j - 1) * n];
            f2 = bd[0][j * n];
            set_pixel(0, j * n - n1, get_color((f1 + f2) * 0.5, mf));
            f1 = bd[na][(j - 1) * n];
            f2 = bd[na][j * n];
            set_pixel(na, j * n - n1, get_color((f1 + f2) * 0.5, mf));
         }
         n = n1;
      }
      n = na;
      for (i = 0; i <= ni; i++)
      {
         mf = col_mf(ni + 1 - i, sqbits);
         n1 = n >> 1;
         for (k = 1; k <= (1 << i); k++)
            for (j = 1; j <= (1 << i); j++)
            {
               f1 = bd[(j - 1) * n][(k - 1) * n];
               f2 = bd[(j - 1) * n][k * n];
               f3 = bd[j * n][(k - 1) * n];
               f4 = bd[j * n][k * n];
               set_pixel(j * n - n1, k * n - n1, get_color((f1 + f2 + f3 + f4) * 0.25, mf));
            }
         nk = 0;
         for (k = 1; k <= ((1 << (i + 1)) - 1); k++)
         {
            nk ^= 1;
            for (j = 1; j <= ((1 << i) - nk); j++)
            {
               f1 = bd[j * n - n1 + nk * n1][(k - 1) * n1];
               f2 = bd[j * n + nk * n1][k * n1];
               f3 = bd[j * n - n1 + nk * n1][(k + 1) * n1];
               f4 = bd[(j - 1) * n + nk * n1][k * n1];
               set_pixel(j * n - n1 + nk * n1, k * n1, get_color((f1 + f2 + f3 + f4) * 0.25, mf));
            }
         }
         n = n1;
      }
   }

 
   stretch = function()
   {
      const bcnt_2 = bcnt >> 1;
      const bcnt_4 = bcnt >> 2;

      // stretch out
      // left half
      for (var x = 0; x < bcnt_2; x++)
      {
         // upper half
         for (var y = 0; y < bcnt_4; y++)
            bd[x * 2][y * 2] = bd[bcnt_4 + x][bcnt_4 + y];
         // lower half
         for (var y = bcnt_4; y > 0; y--)
            bd[x * 2][bcnt_2 + y * 2] = bd[bcnt_4 + x][bcnt_2 + bcnt_4 + y];
      }
      /*
      // right half
      for (var x = bcnt_4 - 1; x >= 0; x--)
      {
         // upper half
         for (var y = 0; y < bcnt_4; y++)
            bd[x * 2][y * 2] = bd[bcnt_4 + x][bcnt_4 + y];
         // lower half
         for (var y = bcnt_4 - 1; y >= 0; y--)
            bd[x * 2][y * 2] = bd[bcnt_4 + x][bcnt_4 + y];
      }
      */


/*
      // stretch out
      for (var x = 0; x < bcnt_2; x++)
      {
         // upper half
         for (var y = 0; y < bcnt_4; y++)
            bd[x * 2][y * 2] = bd[bcnt_4 + x][bcnt_4 + y];
         // lower half
         for (var y = bcnt_4 - 1; y >= 0; y--)
            bd[x * 2][y * 2] = bd[bcnt_4 + x][bcnt_4 + y];
      }
*/
      // populate gaps
      for (var x = 0; x < bcnt_2; x++)
         for (var y = 0; y < bcnt_2; y++)
            populate2(1, x * 2, y * 2);
   }


   clear_data = function()
   {
      for (var x = 0; x <= bcnt; x++)
      {
         bd[x] = [];
         for (var y = 0; y <= bcnt; y++)
            bd[x][y] = 0;
      }
   }


   this.update = function()
   {
      frame++;

      //if (frame > fz) return;
      //if (frame > 1) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var alpha, diff = max - min;
      var f = frame % fz;
      
      if (!f)
         stretch();

      f /= fz;
      //var sx = ppbx * (f + 1), sy = ppby * (f + 1);

      //console.log(`f = ${f}, sx = ${sx}, ppbx = ${ppbx}`);
      ctx.save();
      ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
      ctx.scale(f + 1, f + 1);
      for (var x = 0; x < bcnt; x++)
      {
         //var _x = x * sx - canvas.width * 0.5;
         //var _y = y * sy - canvas.height * 0.5;
         //console.log(`x = ${_x}, y = ${_y}`);
         for (var y = 0; y < bcnt; y++)
         {
            alpha = maxval_ * (bd[x][y] - min) / diff;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            //ctx.fillRect(x * sx, y * sy, sx, sy);
            ctx.fillRect(x * ppbx - canvas.width * 0.5, y * ppby - canvas.height * 0.5, ppbx, ppby);
         }
      }
      ctx.restore();
/*
      ctx.save();
      ctx.filter = 'blur(8px)';
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      */
   }

   // create 2d array
   //for (let x = 0; x <= bcnt; x++)
   //   bd[x] = Array(bcnt);

   // set initial array params
   clear_data();
   //console.log(bd);
//console.log(bd);
   bd[0][0] = bd[bcnt][0] = bd[0][bcnt] = bd[bcnt][bcnt] = 0;
   populate2(sqbits);
//console.log(bd);
   //console.log(`min = ${min}, max = ${max}`);
   //canvas.style.filter = "blur(4px)";

   if (fade)
   {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
   }
   else
      ctx.clearRect(0, 0, canvas.width, canvas.height);

   //ctx.filter = 'blur(8px)';
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
   var anim = clouds(canvas);

   ffpipe.render(canvas, anim.update, 300);
}
else
{
   /* browser version */
   const canvas = document.getElementById("canvas2d");
   const fps = 20;

   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   var anim = clouds(canvas);

   var timer = window.setInterval(anim.update, 1000 / fps);
}

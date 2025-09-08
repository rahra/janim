/*! This is tiny script which displays fake course information of a sailboat
 * making way.
 * I use this to insert it into my videos.
 * @author Bernhard R. Fischer, <bf@abenteuerland.at>
 * @date 2025/09/08
 */


class rand_val
{
   #sgn = 1;

   constructor(min, max, step = 1)
   {
      this.v = (min + max) / 2;
      this.min = min;
      this.max = max;
      this.step = step;
      //this.sgn = 1;
   }


   rev()
   {
      this.#sgn *= -1;
   }


   inc(d)
   {
      this.v = Math.min(this.max, this.v + d);
   }

   dec(d)
   {
      this.v = Math.max(this.min, this.v - d);
   }


   next()
   {
      if (Math.random() < 0.1)
         this.rev();

      this.v += this.#sgn * Math.random() * this.step;

      if (this.v > this.max)
      {
         this.v = this.max;
         this.rev();
      }
      else if (this.v < this.min)
      {
         this.v = this.min;
         this.rev();
      }
   }
}


function nav_display(canvas)
{
   var ctx = canvas.getContext('2d');
   var frame = 0;
   var tws = new rand_val(14, 22);
   var twa = new rand_val(90, 110);
   var sog = new rand_val(4.9, 6.1);
   var cog = new rand_val(160, 180);

   //! foreground color
   var fgcolor = "white";
   //! background color
   var bgcolor = "black";
   //! font spec, e.g.  "30px sans-serif"
   var font = "70px Jockey One";
   //! line width
   var line_width = 3;
   //! box width
   var box_width = 300;
   //! box height
   var box_height = 90;
   //! layout, 0: horizontal, !=0: vertical
   var layout = 0;
 

   /*! Draw empty box at location x/y.
    */
   function box(x, y)
   {
      ctx.clearRect(x, y, box_width, box_height);
      ctx.beginPath();
      ctx.rect(x, y, box_width, box_height);
      ctx.stroke();
   }


   function compass(x, y, v)
   {
      box(x, y);

      var lw = ctx.lineWidth;
      ctx.rect(x + box_width / 2 - lw, y + 5, lw * 2, box_height - 10);
      ctx.stroke();

      var border = 25;
      var range = 70;
      var sx = (box_width - border * 2) / range;
      var s = Math.floor(v - range / 2);

      ctx.font = "20px Jockey One";

      for (var i = s; i < s + range; i++)
      {
         if (!(i % 10))
         {
            var _x = x + border + (i - s) * sx;
            ctx.moveTo(x + border + (i - s) * sx, y + box_height - 15);
            ctx.lineTo(x + border + (i - s) * sx, y + 40);
            //ctx.stroke();
            ctx.fillText(i, x + border - ctx.measureText(i).width / 2 + (i - s) * sx, y + 30);
         }
         else if (!(i % 5))
         {
            var _x = x + border + (i - s) * sx;
            ctx.moveTo(x + border + (i - s) * sx, y + box_height - 15);
            ctx.lineTo(x + border + (i - s) * sx, y + 50);
            //ctx.stroke();
         }
      }
      ctx.stroke();
   }


   function textbox(x, y, t, v)
   {
      box(x, y);
      ctx.fillText(t, x + 20, y + 70);
      ctx.fillText(v, x + 175, y + 70);
   }


   /*! Draw all current moving objects.
    */
   function draw()
   {
      ctx.font = font;
      ctx.fillStyle = fgcolor;
      ctx.strokeStyle = fgcolor;
      ctx.lineWidth = line_width;

      var dw, dh, w, h;
      var nboxes = 5;

      if (!layout)
      {
         w = (canvas.width - nboxes * box_width) / 2;
         h = (canvas.height - box_height) / 2;
         dw = box_width;
         dh = 0;
      }
      else
      {
         w = (canvas.width - box_width) / 2;
         h = (canvas.height - nboxes * box_height) / 2;
         dw = 0;
         dh = box_height;
      }

      textbox(w, h, "TWS", tws.v.toFixed(1));
      w += dw; h += dh;
      textbox(w, h, "TWA", "" + twa.v.toFixed(0));
      w += dw; h += dh;
      textbox(w, h, "SOG", "" + sog.v.toFixed(1));
      w += dw; h += dh;
      textbox(w, h, "COG", "" + cog.v.toFixed(0));
      w += dw; h += dh;
      compass(w, h, cog.v);
   }


   this.update = function()
   {
      frame++;
      //if (frame > 1) return;

      twa.next();
      tws.next();
      sog.v = (tws.v - tws.min) / (tws.max - tws.min) * (sog.max - sog.min) + sog.min;
      cog.next();

      draw();
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
   var anim = nav_display(canvas);

   ffpipe.render(canvas, anim.update, 300);
}
else
{
   /* browser version */
   const canvas = document.getElementById("canvas2d");
   const fps = 2;

   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   var anim = nav_display(canvas);

   var timer = window.setInterval(anim.update, 1000 / fps);
}

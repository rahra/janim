/*! Bezier curve.
 *
 * @author Bernhard R. Fischer, <bf@abenteuerland.at>
 * @date 2026/11/13
 */


function createBezierPix(canvas)
{
   // drawing context
   const ctx = canvas.getContext('2d');

   //! line color
   ctx.strokeStyle = "#ffffff";
   //! line width
   ctx.lineWidth = 5;
   //! line cap
   ctx.lineCap = "round";

   //! start point
   const p0 = { x: 75, y: 60};
   //! control point 0
   const p1 = { x: 300, y: -50};
   //! control point 1
   const p2 = { x: 35, y: 280};
   //! end point
   const p3 = { x: 65, y: 85};
   //! flatness of the curve (lower flatness creates more intermediate pixels)
   const flatness = 0.5;

   const pixels = [];
   const flatSq = flatness * flatness;

   function subdivide(p0, p1, p2, p3)
   {
      // Calculate distance of control points from line p0-p3
      const dx = p3.x - p0.x;
      const dy = p3.y - p0.y;

      const d1 = Math.abs((p1.x - p3.x) * dy - (p1.y - p3.y) * dx);
      const d2 = Math.abs((p2.x - p3.x) * dy - (p2.y - p3.y) * dx);

      // If curve is flat enough within tolerance, add end point
      if ((d1 + d2) * (d1 + d2) < flatSq * (dx * dx + dy * dy))
      {
         const rx = Math.round(p3.x);
         const ry = Math.round(p3.y);
         const last = pixels[pixels.length - 1];

         if (!last || last.x !== rx || last.y !== ry)
         {
            pixels.push({ x: rx, y: ry });
         }
         return;
      }

      // De Casteljau subdivision at t = 0.5
      const p01 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const p12 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const p23 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };

      const p012 = { x: (p01.x + p12.x) / 2, y: (p01.y + p12.y) / 2 };
      const p123 = { x: (p12.x + p23.x) / 2, y: (p12.y + p23.y) / 2 };

      const p0123 = { x: (p012.x + p123.x) / 2, y: (p012.y + p123.y) / 2 };

      subdivide(p0, p01, p012, p0123);
      subdivide(p0123, p123, p23, p3);
   }


   function set_center()
   {
      var minx = canvas.width, maxx = 0;
      var miny = canvas.height, maxy = 0;

      pixels.forEach((p) => {
         minx = Math.min(p.x, minx);
         miny = Math.min(p.y, miny);
         maxx = Math.max(p.x, maxx);
         maxy = Math.max(p.y, maxy);
      });

      console.log(`${minx} - ${maxx}, ${miny} - ${maxy}`);
      ctx.translate((canvas.width - maxx + minx) * 0.5, (canvas.height - maxy + miny) * 0.5);
   }

   // push initial starting point
   pixels.push({ x: Math.round(p0.x), y: Math.round(p0.y) });
   // calculate all pixels
   subdivide(p0, p1, p2, p3);



   var frame = 0;
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   set_center();

   this.update = function()
   {
      // make sure array is not overflowed at the end
      if (frame > pixels.length - 2)
         return;

      // draw next line segment
      ctx.beginPath();
      ctx.moveTo(pixels[frame].x, pixels[frame].y);
      ctx.lineTo(pixels[frame + 1].x, pixels[frame + 1].y);
      ctx.stroke();

      frame++;
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
   var anim = createBezierPix(canvas);

   ffpipe.render(canvas, anim.update, 300);
}
else
{
   /* browser version */
   const canvas = document.getElementById("canvas2d");
   const fps = 10;

   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   var anim = createBezierPix(canvas);

   var timer = window.setInterval(anim.update, 1000 / fps);
}

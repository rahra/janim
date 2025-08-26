/*! Starfield simulation
 *
 * @author Bernhard R. Fischer, <bf@abenteuerland.at>
 * @date 2025/08/24
 */


/*! This class creates the (sample) animation.
 * Call update() for the frame to be updated every time.
 */
function starfield(canvas)
{
   // drawing context
   var ctx = canvas.getContext('2d');
   // frame counter
   var frame = 0;
   // shuttle speed
   var S = 12;
   // number of stars
   var cnt = 200;
   // star radius
   var R = 2.5;
   // star parameters
   var star = [];

   // init values of new star
   init_star = function(s)
   {
      s.a = 2 * Math.PI * Math.random();
      //s.r = Math.random() * 0.5 + 0.5;
      s.r = Math.random();
      s.c = Math.random();
      s.t = frame;
      s.p = Math.random() * 2 + 1;  // -> 1 <= p <= 3
   }

   // fade to transparency
   fade_out = function()
   {
      let f = 0.7;
      // fade out previous frame
      //ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = f;
      ctx.fillStyle = `rgba(255,255,255,${f})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
   }

   // Return an Aurora-like HTML color dependent on f, where is 0 <= f <= 1.
   star_color = function(f, a)
   {
      //blue, green, yellow, red
      const acols =
         [
            {r: 0, g: 0.4, b: 0.4},
            {r: 1, g: 1, b: 1},
            {r: 0.7, g: 0.3, b: 0.3},
         ];

      var d = 1 / (acols.length - 1);
      var i = Math.floor(f / d);
      var s = f / d - i;
      var r = Math.floor(256 * ((1 - s) * acols[i].r + s * acols[i + 1].r));
      var g = Math.floor(256 * ((1 - s) * acols[i].g + s * acols[i + 1].g));
      var b = Math.floor(256 * ((1 - s) * acols[i].b + s * acols[i + 1].b));

      return `rgba(${r},${g},${b},${a})`;
   }

   // calculate and draw a star
   update_star = function(s)
   {
      // distance of star from center
      let r = S * s.r * Math.pow((frame - s.t) * 0.07, s.p);
      // star coordinates
      var x = r * Math.cos(s.a);
      var y = r * Math.sin(s.a);

      if (x < -canvas.width * 0.5 || x >= canvas.width * 0.5 || y < -canvas.height * 0.5 || y >= canvas.height * 0.5)
      {
         init_star(s);
         return;
      }

      // star transparency
      var a = Math.max(Math.abs(x) / (canvas.width * 0.5), Math.abs(y) / (canvas.height * 0.5));
      // star radius
      //R = 1000 * (r / Math.hypot(canvas.height * 0.5, canvas.width * 0.5)) / (frame - s.t);

      ctx.beginPath();
      ctx.arc(x, y, R, 0, 2 * Math.PI);
      //ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillStyle = star_color(s.c, a);
      ctx.fill();
   }

   // update the whole frame
   this.update = function()
   {
      frame++;

      fade_out();

      ctx.save();
      ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
      star.forEach(update_star);
      ctx.restore();
   }

   // init initial stars
   for (let i = 0; i < cnt; i++)
      star[i] = {a: 0, r: 0, c: 0, p: 1, t: 0};
   star.forEach(init_star);
   // inital random star position. This is the inverse function of the star distance function.
   star.forEach((s) => s.t = -Math.floor(Math.random() * Math.pow(Math.hypot(canvas.width * 0.5, canvas.height * 0.5) / (S * s.r), 1 / s.p) / 0.07));

   ctx.strokeStyle = "#20ff20";
   ctx.clearRect(0, 0, canvas.width, canvas.height);

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
   var anim = starfield(canvas);

   ffpipe.render(canvas, anim.update, 300);
}
else
{
   /* browser version */
   const canvas = document.getElementById("canvas2d");
   const fps = 20;

   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   var anim = starfield(canvas);

   var timer = window.setInterval(anim.update, 1000 / fps);
}

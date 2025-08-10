/*! Working example of creating a video from a canvas with nodejs and ffmpeg.
 * This code was derive from this original example:
 * https://stackoverflow.com/questions/63891881/how-can-i-stream-through-ffmpeg-a-canvas-generated-in-node-js-to-youtube-any-oth
 * This example is slightly faster because it leaves all compression work to be done within ffmpeg.
 *
 * Some valid format/codec combinations for videos with alpha channel:

      "-vcodec", "png",
      "test.mkv"

      "-vcodec", "png",
      "test.mov"

      "-vcodec", "vp9",
      "test.webm"

      "-vcodec", "qtrle",
      "test.mov"

 * \file ffpipe.js
 * \author Bernhard R. Fischer, bf@abenteuerland.at
 * \date 2025/08/07
 */

const { spawn } = require('child_process');
const { createCanvas } = require('canvas');
const fs = require('fs');
const mod_getopt = require('posix-getopt');


//! rendering parameters
var rp_ =
{
   width: 1920, height: 1080,
   ifps: 0,
   fps: 30,
   crf: 22,
   outfile: "a.mkv",
   vcodec: "",
   format: "",
};


/*! Output usage message.
 */
function usage()
{
   console.log(
      "ffpipe v1.0 © 2025 Bernhard R. Fischer <bf@abenteuerland.at>. Pipe a canvas animation to ffpmeg.\n\n" +
      "usage: " + process.argv[1] + " [options] [<file>]\n\n" +
      "   --crf=<crf>\n" +
      "   -c <crf> .......... Define CRF (ffmpeg -crf), default = 22.\n\n" +
      "   --help\n" +
      "   -h ................ Outut this help.\n\n" +
      "   --ifps=<ifps>\n" +
      "   -R <ifps> ......... Number of input frames per second, default = <output fps>\n\n" +
      "   --fps=<fps>\n" +
      "   -r <fps> .......... Number of output frames per second, default = 30.\n\n" +
      "   --vcodec=<vcodec>\n" +
      "   -v <vcodec> ....... Output video codec, default = 'png'.\n\n" +
      "   <file> ............ Output file and container format, default = 'a.mkv'.\n" +
      "\n" +
      "   The video codecs and the filename is directly passed to ffmpeg.\n" +
      "   See ffmpeg(1) for more information\n" +
      "\n" +
      "   Codecs and output file options (examples for videos with transparency):\n" +
      "   -v png output.mkv\n" +
      "   -v vp9 output.mkv\n" +
      "   -v vp9 output.webm\n" +
      "   -v png output.mov\n" +
      "   -v qtrle output.mov\n"
   );
}


// parse CLI args
var parser = new mod_getopt.BasicParser('c:(crf)f:(format)h(help)R:(ifps)r:(fps)v:(vcodec)W:(width)H:(height)', process.argv);
while ((option = parser.getopt()) !== undefined)
{
	switch (option.option)
   {
      case 'c':
         rp_.crf = option.optarg;
         break;

      case 'f':
         rp_.format = option.optarg;
         break;

      case 'H':
         rp_.height = parseInt(option.optarg);
         break;

      case 'h':
         usage();
         process.exit(0);

      case 'R':
         rp_.ifps = option.optarg;
         break;

      case 'r':
         rp_.fps = option.optarg;
         break;

      case 'v':
         vcodec_ = option.optarg;
         break;

      case 'W':
         rp_.width = parseInt(option.optarg);
         break;

      default:
         /* error message already emitted by getopt */
         mod_assert.equal('?', option.option);
         break;
	}
}

if (parser.optind() < process.argv.length)
   rp_.outfile = process.argv[parser.optind()];

// set default values
if (!rp_.ifps)
   rp_.ifps = rp_.fps;

if (!rp_.vcodec)
{
   switch (rp_.outfile.split('.').pop())
   {
      case "mkv":
      case "mov":
         rp_.vcodec = "png";
         break;

      case "webm":
         rp_.vcodec = "vp9";
         break;
/*
      default:
         console.error("*** Please set the output video codec with option -v");
         process.exit(1);*/
   }
}

// create canvas
const canvas = createCanvas(rp_.width, rp_.height);
const ctx = canvas.getContext('2d');

// options passed to ffmpeg
var ffopts_ = 
   [
      "-y",                               // overwrite output file if it exists
      "-r", rp_.ifps,                     // input frame rate (same as output)
      "-f", "rawvideo",                   // input format
      "-pix_fmt", "argb",                 // input pixel format
      "-s", `${rp_.width}x${rp_.height}`, // input resolution
      "-i", "pipe:0",                     // input file (stdin)
      "-r", rp_.fps,                      // output framerate
      "-crf", rp_.crf,                    // output compression (lower number -> lower compression -> higher quality -> bigger file)
      //"-vcodec", vcodec_                // output codec (is pushed below)
      //"-f", format                      // output format (is pushed below)
   ];
// add output video codec if option is available
if (rp_.vcodec)
   ffopts_.push("-vcodec", rp_.vcodec);
// add format option if available
if (rp_.format.length)
   ffopts_.push("-f", rp_.format);
// finally add output filename
ffopts_.push(rp_.outfile);

// spawn ffmpeg child process
const ffmpeg = spawn("ffmpeg", ffopts_, {stdio: 'pipe'});

// output ffmpeg data to console
ffmpeg.stderr.on('data', (data) => {console.error(`stderr: ${data}`);});
// output exit code of ffmpeg to console
ffmpeg.on('close', (code) => {console.log(`child process exited with code ${code}`);});


const randomColor = (depth) => Math.floor(Math.random() * depth);
const random = (min, max) => (Math.random() * (max - min)) + min;


// function to update the frame
function update_frame(fcnt)
{
   ctx.strokeStyle = `rgb(${randomColor(255)}, ${randomColor(255)}, ${randomColor(255)})`
   let x1 = random(0, canvas.width);
   let x2 = random(0, canvas.width);
   let y1 = random(0, canvas.height);
   let y2 = random(0, canvas.height);
   ctx.moveTo(x1, y1);
   ctx.lineTo(x2, y2);
   ctx.stroke();
}


for (var i = 0; i < 30; i++)
{
   // draw frame
   update_frame(i);
   // write frame data to ffmpeg
   ffmpeg.stdin.write(canvas.getContext('2d').getImageData(0, 0, rp_.width, rp_.height).data);
}

// close stream (and cause ffmpeg to finalize encoding)
ffmpeg.stdin.end();


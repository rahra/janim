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


var width_ = 1920, height_ = 1080;
var fps_ = 30;
var crf_ = 22;
var outfile_ = "a.mkv";
var vcodec_ = "";
var format_ = "";


function usage()
{
   console.log(
      "ffpipe v1.0 © 2025 Bernhard R. Fischer <bf@abenteuerland.at>. Pipe a canvas animation to ffpmeg.\n\n" +
      "usage: " + process.argv[1] + " [options] [<file>]\n\n" +
      "   --crf=<crf>\n" +
      "   -c <crf> .......... Define CRF (ffmpeg -crf), default = 22.\n\n" +
      "   --help\n" +
      "   -h ................ Outut this help.\n\n" +
      "   --fps=<fps>\n" +
      "   -r <fps> .......... Number of frames per second, default = 30.\n\n" +
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


var parser = new mod_getopt.BasicParser('c:(crf)f:(format)h(help)r:(fps)v:(vcodec)W:(width)H:(height)', process.argv);
while ((option = parser.getopt()) !== undefined)
{
	switch (option.option)
   {
      case 'c':
         crf_ = option.optarg;
         break;

      case 'f':
         format_ = option.optarg;
         break;

      case 'H':
         height_ = parseInt(option.optarg);
         break;

      case 'h':
         usage();
         process.exit(0);

      case 'r':
         fps_ = option.optarg;
         break;

      case 'v':
         vcodec_ = option.optarg;
         break;

      case 'W':
         width_ = parseInt(option.optarg);
         break;

      default:
         /* error message already emitted by getopt */
         mod_assert.equal('?', option.option);
         break;
	}
}

if (parser.optind() < process.argv.length)
   outfile_ = process.argv[parser.optind()];

// set default values
if (!vcodec_)
{
   switch (outfile_.split('.').pop())
   {
      case "mkv":
      case "mov":
         vcodec_ = "png";
         break;

      case "webm":
         vcodec_ = "vp9";
         break;
/*
      default:
         console.error("*** Please set the output video codec with option -v");
         process.exit(1);*/
   }
}

console.log(width_);

// create canvas
const canvas = createCanvas(width_, height_);
const ctx = canvas.getContext('2d');

// options passed to ffmpeg
var ffopts_ = 
   [
      "-y",                         // overwrite output file if it exists
      "-r", fps_,                   // input frame rate (same as output)
      "-f", "rawvideo",             // input format
      "-pix_fmt", "argb",           // input pixel format
      "-s", `${width_}x${height_}`, // input resolution
      "-i", "pipe:0",               // input file (stdin)
      "-r", fps_,                   // output framerate
      "-crf", crf_,                 // output compression (lower number -> lower compression -> higher quality -> bigger file)
      //"-vcodec", vcodec_          // output codec (is pushed below)
      //"-f", format                // output format (is pushed below)
   ];
// add output video codec if option is available
if (vcodec_)
   ffopts_.push("-vcodec", vcodec_);
// add format option if available
if (format_.length)
   ffopts_.push("-f", format_);
// finally add output filename
ffopts_.push(outfile_);

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
   ffmpeg.stdin.write(canvas.getContext('2d').getImageData(0, 0, width_, height_).data);
}

// close stream (and cause ffmpeg to finalize encoding)
ffmpeg.stdin.end();


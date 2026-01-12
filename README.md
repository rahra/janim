# Generate Transparent Animations and Videos with Javascript

Janim is a small library which lets you create transparent videos directly from a canvas with Javascipt. This may be useful for animations used in your video editing projects.

![starfield.webp](starfield.webp)

Janim has two modes of operation. The 1st is to be run in a browser which is meant to be useful for the stage of development. The 2nd is actually the video generation stage where you run the very same program with `node` from the command line.

Janim does not create the video files itself but it relies on `ffmpeg` to do so. After each generated frame on the canvas it pipes the raw contents of the canvas (the pixel information) to `ffmpeg` which will then create the desired video container.

This package contains the following files:

| `ffpipe.js` | The work horse for piping the canvas to ffmpeg. |
| `package.json` | The dependencies to be installed by npm. |
| `index.html` | The HTML file to be viewed with a browser (edit the script tag to your needs). |
| `triangle.js` | Simple triangle animation (simple demo). |
| `aurora.js` | Aurora Borealis simulation. |
| `starfield.js` | Starfield simulation. |
| `navdisp.js` | Boat navigation display simulation. |
| `clouds.js` | Clouds simulation (experimental, not finished yet). |

## How to use it

To successfully create videos you need `nodejs`, `npm`, and `ffmpeg`. On Linux just install it with

```Shell
sudo apt install nodejs npm ffmpeg
```

Next, clone this directory, change into it and install the dependencies.

```Shell
git clone https://github.com/rahra/janim.git
cd janim
npm install
```

Finally, you can either open the `index.html` file to see the animation in the browser or run it with node to generate a video file, e.g.

```Shell
node starfield.js
```

See the help option `-h` for some command line parameters.

```Shell
node starfield.js -h
```

```
ffpipe v1.0 © 2025 Bernhard R. Fischer <bf@abenteuerland.at>. Pipe a canvas animation to ffpmeg.

usage: /home/eagle/Development/janim/starfield.js [options] [<file>]

   --crf=<crf>
   -c <crf> .......... Define CRF (ffmpeg -crf), default = 22.

   --help
   -h ................ Outut this help.

   --height=<h>
   -H <h> ............ Height of frame in pixels, default = 1080.

   --ifps=<ifps>
   -R <ifps> ......... Number of input frames per second, default = <output fps>

   --fps=<fps>
   -r <fps> .......... Number of output frames per second, default = 30.

   --vcodec=<vcodec>
   -v <vcodec> ....... Output video codec, default = 'png'.

   --width=<w>
   -W <w> ............ Width of frame in pixels, default = 1920.

   <file> ............ Output file and container format, default = 'a.mkv'.

   The video codecs and the filename is directly passed to ffmpeg.
   See ffmpeg(1) for more information

   Codecs and output file options (examples for videos with transparency):
   -v png output.mkv
   -v vp9 output.mkv
   -v vp9 output.webm
   -v png output.mov
   -v qtrle output.mov
```

## How to create your own animation

The pipe and `ffmpeg` "magic" is done within `ffpipe.js` which you need to `require` in your own animation. Furthermore your code shall work in such a way that a callable update function is available (which will be passed to `ffpipe.js`) which updates your canvas with a new frame.

The best way is just to look at one of my examples, e.g. the `triangle.js` and use it as a skeleton for your own animations.

## Author

Janim is developed and maintained by Bernhard R. Fischer, 4096R/8E24F29D <bf@abenteuerland.at>.

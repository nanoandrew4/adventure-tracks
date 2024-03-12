#!/bin/bash

for pngImage in $(ls public/*png); do
    # convert -resize 25% -antialias -quality 95 $pngImage $(echo $pngImage | sed 's~.png~_high.jpg~')
    # convert -resize 12.5% -sharpen 2x2 -antialias -quality 80 $pngImage $(echo $pngImage | sed 's~.png~_mid.jpg~')
    # convert -resize 6.25% -quality 80 $pngImage $(echo $pngImage | sed 's~.png~_low.jpg~')
    convert -resize 15% -quality 95 -antialias $pngImage $(echo $pngImage | sed 's~.png~_high.jpg~')
    convert -resize 7.5% -quality 95 $pngImage $(echo $pngImage | sed 's~.png~_mid.jpg~')
    convert -resize 7.5% -quality 80 -antialias $pngImage $(echo $pngImage | sed 's~.png~_low.jpg~')
done
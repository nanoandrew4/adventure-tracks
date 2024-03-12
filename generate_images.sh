#!/bin/bash

for pngImage in $(ls public/*png); do
    convert -resize 15% -quality 95 -antialias $pngImage $(echo $pngImage | sed 's~.png~_high.jpg~')
    convert -resize 10% -quality 95 -antialias $pngImage $(echo $pngImage | sed 's~.png~_mid.jpg~')
    convert -resize 7.5% -quality 80 -antialias $pngImage $(echo $pngImage | sed 's~.png~_low.jpg~')
done
#!/bin/bash

for pngImage in $(ls public/assets/*png); do
    convert -resize 15% -quality 100 -antialias $pngImage $(echo $pngImage | sed 's~.png~_high.webp~')
    convert -resize 10% -quality 100 -antialias $pngImage $(echo $pngImage | sed 's~.png~_mid.webp~')
    convert -resize 7.5% -quality 90 -antialias $pngImage $(echo $pngImage | sed 's~.png~_low.webp~')
done
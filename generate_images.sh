#!/bin/bash

for pngImage in $(ls public/images/*png); do
    convert -resize 25% -quality 100 $pngImage $(echo $pngImage | sed 's~.png~_very_high.webp~')
    convert -resize 15% -quality 100 $pngImage $(echo $pngImage | sed 's~.png~_high.webp~')
    convert -resize 10% -quality 100 $pngImage $(echo $pngImage | sed 's~.png~_mid.webp~')
    convert -resize 7.5% -quality 90 $pngImage $(echo $pngImage | sed 's~.png~_low.webp~')
done
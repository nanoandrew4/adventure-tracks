interface Dimensions {
  width: number
  height: number
}

function generateImageToDownloadDataURL(imageCanvas: HTMLCanvasElement): string {
  return imageCanvas.toDataURL('image/png')
}

function generatePortraitThumbnailDataURL(
  imageCanvas: HTMLCanvasElement,
  scaleFactor?: number
): string {
  const thumbnailContainer = document.getElementById('generated-image-container')
  if (!thumbnailContainer) {
    return ''
  }

  const targetHeight =
    thumbnailContainer.getBoundingClientRect().height * (scaleFactor ? scaleFactor : 1)
  const targetAspectRatio = imageCanvas.width / imageCanvas.height

  return generateThumbnailDataURL(
    imageCanvas,
    (d: Dimensions) => {
      return d.height * 0.5 > targetHeight
    },
    targetHeight * targetAspectRatio,
    targetHeight
  )
}

function generateLandscapeThumbnailDataURL(
  imageCanvas: HTMLCanvasElement,
  scaleFactor?: number
): string {
  const thumbnailContainer = document.getElementById('generated-image-container')
  if (!thumbnailContainer) {
    return ''
  }

  const targetWidth =
    thumbnailContainer.getBoundingClientRect().width * (scaleFactor ? scaleFactor : 1)
  const targetAspectRatio = imageCanvas.width / imageCanvas.height

  return generateThumbnailDataURL(
    imageCanvas,
    (d: Dimensions) => {
      return d.width * 0.5 > targetWidth
    },
    targetWidth,
    targetWidth / targetAspectRatio
  )
}

function generateThumbnailDataURL(
  imageCanvas: HTMLCanvasElement,
  continueResizingFunc: (d: Dimensions) => boolean,
  targetWidth: number,
  targetHeight: number
): string {
  const resizingCanvas: HTMLCanvasElement = document.createElement('canvas')
  const resizingCanvasContext = resizingCanvas.getContext('2d')
  if (resizingCanvasContext == null) {
    return ''
  }

  resizingCanvas.width = imageCanvas.width
  resizingCanvas.height = imageCanvas.height

  resizingCanvasContext.drawImage(imageCanvas, 0, 0, resizingCanvas.width, resizingCanvas.height)

  const curImageDimensions = {
    width: Math.floor(resizingCanvas.width),
    height: Math.floor(resizingCanvas.height)
  }

  const halfImageDimensions = {
    width: 0,
    height: 0
  }

  // Quickly reduce the dize by 50% each time in few iterations until the size is less then
  // 2x time the target size - the motivation for it, is to reduce the aliasing that would have been
  // created with direct reduction of very big image to small image
  while (continueResizingFunc(curImageDimensions)) {
    // Reduce the resizing canvas by half and refresh the image
    halfImageDimensions.width = Math.floor(curImageDimensions.width * 0.5)
    halfImageDimensions.height = Math.floor(curImageDimensions.height * 0.5)

    resizingCanvasContext.drawImage(
      resizingCanvas,
      0,
      0,
      curImageDimensions.width,
      curImageDimensions.height,
      0,
      0,
      halfImageDimensions.width,
      halfImageDimensions.height
    )

    curImageDimensions.width = halfImageDimensions.width
    curImageDimensions.height = halfImageDimensions.height
  }

  // Now do final resize for the resizingCanvas to meet the dimension requirments
  // directly to the output canvas, that will output the final image
  const outputCanvas: HTMLCanvasElement = document.createElement('canvas')
  const outputCanvasContext = outputCanvas.getContext('2d')

  outputCanvas.width = targetWidth
  outputCanvas.height = targetHeight

  outputCanvasContext!.drawImage(
    resizingCanvas,
    0,
    0,
    curImageDimensions.width,
    curImageDimensions.height,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  )

  // output the canvas pixels as an image. params: format, quality
  return outputCanvas.toDataURL('image/jpeg', 1)
}

export { generateImageToDownloadDataURL, generateLandscapeThumbnailDataURL, generatePortraitThumbnailDataURL }

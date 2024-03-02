const targetCaptureSize = 7680
const stdResDPR = 2

function initializeDevicePixelRatio() {
  setStdResDPR()
}

function setHiResDPR(captureElemRect: DOMRect) {
  Object.defineProperty(window, 'devicePixelRatio', {
    get() {
      return (
        targetCaptureSize /
        (captureElemRect.width > captureElemRect.height
          ? captureElemRect.width
          : captureElemRect.height)
      )
    }
  })
}

function setStdResDPR() {
  Object.defineProperty(window, 'devicePixelRatio', {
    get() {
      return stdResDPR
    }
  })
}

export { initializeDevicePixelRatio, setHiResDPR, setStdResDPR }

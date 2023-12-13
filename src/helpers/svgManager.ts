import type { Activity } from '@/types/Activity'

const svgHeightPx = 80
const svgHeightPxCss = `${svgHeightPx}px`

function createElevationSvg(activities: Activity[], componentWidth: number): SVGSVGElement {
  let numOfElevationPoints = 0
  let highestPoint = 0
  activities.forEach((activity) => {
    const elevationProfile = activity.getElevation()
    numOfElevationPoints += elevationProfile.length
    highestPoint = Math.max(...elevationProfile, highestPoint)
  })

  const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  newSvg.id = 'data-graph'
  newSvg.setAttribute('width', `${componentWidth}px`)
  newSvg.setAttribute('height', svgHeightPxCss)
  newSvg.setAttribute('viewBox', `0 0 ${componentWidth} ${svgHeightPx}`)
  let numOfProcessedElevationPoints = 0
  activities.forEach((activity) => {
    const elevationProfile = activity.getElevation()

    const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svgGroup.style.width = `${(elevationProfile.length / numOfElevationPoints) * componentWidth}px`
    svgGroup.style.height = svgHeightPxCss
    
    const activitySvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    activitySvgPath.id = activity.sourceName
    activitySvgPath.style.width = `${
        (elevationProfile.length / numOfElevationPoints) * componentWidth
    }px`
    activitySvgPath.style.height = svgHeightPxCss
    activitySvgPath.setAttribute('fill', activity.elevationProfileColor)
    activitySvgPath.setAttribute('vector-effect', 'non-scaling-stroke')

    const stepSize = componentWidth / numOfElevationPoints
    let currPx = (numOfProcessedElevationPoints / numOfElevationPoints) * componentWidth
    let d = 'M ' + currPx + ' ' + svgHeightPx
    elevationProfile.forEach((elevationPoint) => {
      d += ' L ' + currPx + ' ' + (svgHeightPx - (elevationPoint / highestPoint) * svgHeightPx)
      currPx += stepSize
    })
    d += ' L ' + currPx + ' ' + svgHeightPx

    activitySvgPath.setAttribute('d', d)
    svgGroup.appendChild(activitySvgPath)
    newSvg.appendChild(svgGroup)

    numOfProcessedElevationPoints += elevationProfile.length
  })
  return newSvg
}

export { createElevationSvg }
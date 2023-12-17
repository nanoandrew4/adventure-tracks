import type { Activity } from '@/types/Activity'

const svgHeightPx = 80
const svgHeightPxCss = `${svgHeightPx}px`

function createElevationSvg(activities: Activity[], componentWidth: number): SVGSVGElement | null {
  let highestPoint = 0
  let totalDuration = 0
  activities.forEach((activity) => {
    const elevationProfile = activity.getElevation()
    if (activity.startTime && activity.endTime)
      totalDuration += activity.endTime.getTime() - activity.startTime.getTime()
    highestPoint = Math.max(...elevationProfile, highestPoint)
  })

  if (highestPoint === 0) {
    return null
  }

  const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  newSvg.id = 'data-graph'
  newSvg.setAttribute('width', `${componentWidth}px`)
  newSvg.setAttribute('height', svgHeightPxCss)
  newSvg.setAttribute('viewBox', `0 0 ${componentWidth} ${svgHeightPx}`)
  let currPx = 0
  for (const activity of activities) {
    if (!activity.startTime || !activity.endTime) continue

    const activityDuration = activity.endTime.getTime() - activity.startTime.getTime()
    const activityWidth = (activityDuration / totalDuration) * componentWidth
    const elevationProfile = activity.getElevation()

    const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svgGroup.style.width = `${activityWidth}px`
    svgGroup.style.height = svgHeightPxCss

    const activitySvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    activitySvgPath.id = activity.sourceName
    activitySvgPath.style.width = `${activityWidth}px`
    activitySvgPath.style.height = svgHeightPxCss
    activitySvgPath.setAttribute('fill', activity.elevationProfileColor)
    activitySvgPath.setAttribute('vector-effect', 'non-scaling-stroke')

    const stepSize = activityWidth / elevationProfile.length
    let d = 'M ' + currPx + ' ' + svgHeightPx
    elevationProfile.forEach((elevationPoint) => {
      d += ' L ' + currPx + ' ' + (svgHeightPx - (elevationPoint / highestPoint) * svgHeightPx)
      currPx += stepSize
    })
    d += ' L ' + currPx + ' ' + svgHeightPx

    activitySvgPath.setAttribute('d', d)
    svgGroup.appendChild(activitySvgPath)
    newSvg.appendChild(svgGroup)
  }
  return newSvg
}

export { createElevationSvg }

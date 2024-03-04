import type { State } from '@/vuex/store'
import type { Store } from 'vuex'

const resizableClassAttribute = 'resizable-class'

function registerResizableTaggedElements() {
  document.querySelectorAll('[resizable]').forEach((elem) => {
    const htmlElem = elem as HTMLElement
    registerResizableAdventureTrackElement(htmlElem, () => {})
  })
}

enum ResizeStates {
  NONE,
  MAYBE_RESIZING
}

let managedElements: HTMLElement[] = []
const resizableElementState = new Map<HTMLElement, ResizeStates>()
function registerResizableAdventureTrackElement(
  htmlElem: HTMLElement,
  resizeCallback: () => void,
  resizableClass: string = 'resizable'
) {
  managedElements.push(htmlElem)

  const adventureTrackRoot = document.getElementById('adventure-track')
  if (!adventureTrackRoot) {
    throw new Error('Adventure track element not found')
  }

  htmlElem.setAttribute(resizableClassAttribute, resizableClass)
  htmlElem.classList.add(resizableClass)
  const resizeObserver = new ResizeObserver(() => {
    adjustElementDimensionsIfNecessary(adventureTrackRoot, htmlElem, resizeCallback)
  })

  document.addEventListener('mousemove', () => {
    if (resizableElementState.get(htmlElem) === ResizeStates.MAYBE_RESIZING) {
      adjustElementDimensionsIfNecessary(adventureTrackRoot, htmlElem, resizeCallback)
    }
  })

  htmlElem.addEventListener('mousedown', () => {
    resizableElementState.set(htmlElem, ResizeStates.MAYBE_RESIZING)
    resizeObserver.observe(htmlElem)
  })

  document.addEventListener('mouseup', () => {
    if (resizableElementState.get(htmlElem) === ResizeStates.MAYBE_RESIZING) {
      resizableElementState.set(htmlElem, ResizeStates.NONE)
      resizeObserver.disconnect()
      adjustElementDimensionsIfNecessary(adventureTrackRoot, htmlElem, resizeCallback)
    }
  })
}

function adjustMapSizeToFitDetails(store: Store<State>) {
  const adventureTrackElem = document.getElementById('adventure-track')
  const adventureDetailElem = document.getElementById('adventure-track-details')
  if (
    adventureTrackElem &&
    adventureDetailElem &&
    adventureDetailElem.getBoundingClientRect().bottom >
      adventureTrackElem.getBoundingClientRect().bottom
  ) {
    store.commit('SET_RESIZE_MAP_TO_FIT_SIBLINGS', true)
  }
}

function adjustElementDimensionsIfNecessary(
  rootElem: HTMLElement,
  htmlElem: HTMLElement,
  resizeCallback: () => void,
  forceAdjust?: boolean
) {
  if (!forceAdjust && !htmlElem.style.width.includes('px') && !htmlElem.style.height.includes('px'))
    return

  const rootRect = rootElem.getBoundingClientRect()
  const elemRect = htmlElem.getBoundingClientRect()

  let adventureTracksHeight = 0
  for (const child of rootElem.children) {
    adventureTracksHeight += child.getBoundingClientRect().height
  }

  if (adventureTracksHeight > rootElem.getBoundingClientRect().height) {
    elemRect.height =
      rootElem.getBoundingClientRect().height - getMaxHeightForElement(rootElem, htmlElem)
  }

  // control aspect ratio

  htmlElem.style.width = (elemRect.width / rootRect.width) * 100 + 'cqw'
  htmlElem.style.height = (elemRect.height / rootRect.height) * 100 + 'cqh'

  resizeCallback()
}

function getMaxHeightForElement(rootElem: HTMLElement, htmlElem: HTMLElement): number {
  if (!htmlElem.parentElement) return 0
  if (htmlElem.parentElement && htmlElem.parentElement.children.length === 1)
    getMaxHeightForElement(rootElem, htmlElem)

  let allOtherElementHeights = 0
  for (const c of htmlElem.parentElement.children) {
    if (c != htmlElem && (c as HTMLElement).style.position != 'absolute')
      allOtherElementHeights += c.getBoundingClientRect().height
  }

  let isContainedByRootChild = false
  let rootChildContainingOriginalElement = htmlElem
  while (
    rootChildContainingOriginalElement.parentElement &&
    rootChildContainingOriginalElement.parentElement != rootElem
  ) {
    isContainedByRootChild = true
    rootChildContainingOriginalElement = rootChildContainingOriginalElement.parentElement
    for (const property of ['padding-top', 'padding-bottom']) {
      allOtherElementHeights += parseInt(
        window
          .getComputedStyle(rootChildContainingOriginalElement, null)
          .getPropertyValue(property)
          .slice(0, -2)
      )
    }
  }

  if (isContainedByRootChild) {
    for (const c of rootElem.children) {
      if (c != rootChildContainingOriginalElement)
        allOtherElementHeights += c.getBoundingClientRect().height
    }
  }
  
  return allOtherElementHeights
}

function adjustAllRegisteredElementDimensionsIfNecessary() {
  const adventureTrackRoot = document.getElementById('adventure-track')
  if (!adventureTrackRoot) {
    return
  }

  managedElements.forEach((elem) => {
    adjustElementDimensionsIfNecessary(adventureTrackRoot, elem, () => {})
  })
}

function unregisterAllResizableElements() {
  managedElements.forEach((elem) => {
    elem.style.width = ''
    elem.style.height = ''
    const resizableClass = elem.getAttribute(resizableClassAttribute)
    if (resizableClass) elem.classList.remove(resizableClass)
    elem.removeAttribute(resizableClassAttribute)
  })

  managedElements = []
  resizableElementState.clear()
}

export {
  registerResizableTaggedElements,
  registerResizableAdventureTrackElement,
  adjustAllRegisteredElementDimensionsIfNecessary,
  unregisterAllResizableElements,
  adjustElementDimensionsIfNecessary,
  adjustMapSizeToFitDetails
}

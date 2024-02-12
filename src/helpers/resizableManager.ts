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
function registerResizableAdventureTrackElement(htmlElem: HTMLElement, resizeCallback: () => void) {
  managedElements.push(htmlElem)

  const adventureTrackRoot = document.getElementById('adventure-track')
  if (!adventureTrackRoot) {
    throw new Error('Adventure track element not found')
  }

  htmlElem.classList.add('resizable')
  const resizeObserver = new ResizeObserver(() => {
    adjustElementDimensionsIfNecessary(htmlElem, adventureTrackRoot, resizeCallback)
  })

  document.addEventListener('mousemove', () => {
    if (resizableElementState.get(htmlElem) === ResizeStates.MAYBE_RESIZING) {
      adjustElementDimensionsIfNecessary(htmlElem, adventureTrackRoot, resizeCallback)
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
      adjustElementDimensionsIfNecessary(htmlElem, adventureTrackRoot, resizeCallback)
    }
  })
}

function adjustElementDimensionsIfNecessary(
  htmlElem: HTMLElement,
  rootElem: HTMLElement,
  resizeCallback: () => void
) {
  if (!htmlElem.style.width.includes('px') && !htmlElem.style.height.includes('px')) return

  const rootRect = rootElem.getBoundingClientRect()
  const elemRect = htmlElem.getBoundingClientRect()

  // control aspect ratio

  htmlElem.style.width = (elemRect.width / rootRect.width) * 100 + 'cqw'
  htmlElem.style.height = (elemRect.height / rootRect.height) * 100 + 'cqh'

  resizeCallback()
}

function adjustAllRegisteredElementDimensionsIfNecessary() {
  const adventureTrackRoot = document.getElementById('adventure-track')
  if (!adventureTrackRoot) {
    return
  }

  managedElements.forEach((elem) => {
    adjustElementDimensionsIfNecessary(elem, adventureTrackRoot, () => {})
  })
}

function unregisterAllResizableElements() {
  managedElements.forEach((elem) => {
    elem.style.width = ''
    elem.style.height = ''
    elem.classList.remove('resizable')
  })

  managedElements = []
  resizableElementState.clear()
}

export {
  registerResizableTaggedElements,
  registerResizableAdventureTrackElement,
  adjustAllRegisteredElementDimensionsIfNecessary,
  unregisterAllResizableElements
}

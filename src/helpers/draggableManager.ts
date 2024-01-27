let offset = [0, 0]

let registeredElements: HTMLElement[] = []
let lastTouchedElement: HTMLElement | undefined
let lastMovedElement: HTMLElement | undefined

function registerDraggableTaggedElements() {
  document.querySelectorAll('[draggable]').forEach((elem) => {
    const htmlElem = elem as HTMLElement
    registerDraggableElement(htmlElem)
  })
}

function registerDraggableElement(elem: HTMLElement) {
  registeredElements.push(elem)

  elem.classList.add('draggable')
  elem.addEventListener(
    'mousedown',
    function (e) {
      elem.style.cursor = 'grabbing'
      if (e.offsetX / elem.getBoundingClientRect().width < 0.9) {
        offset = [elem.offsetLeft - e.clientX, elem.offsetTop - e.clientY]
        lastTouchedElement = elem
      }
    },
    true
  )

  if (!document.onmouseup) {
    document.addEventListener(
      'mouseup',
      function () {
        if (lastMovedElement) {
          lastMovedElement.style.cursor = ''
          const adventureTrackRoot = document.getElementById('adventure-track')
          if (adventureTrackRoot) {
            const rootRect = adventureTrackRoot.getBoundingClientRect()
            const elemRect = lastMovedElement.getBoundingClientRect()
            const leftMargin = parseInt(window.getComputedStyle(lastMovedElement).getPropertyValue('margin-left'))
            lastMovedElement.style.left = ((elemRect.x - rootRect.x - leftMargin) / rootRect.width) * 100 + '%'
            lastMovedElement.style.top = ((elemRect.y - rootRect.y) / rootRect.height) * 100 + '%'
          }
        } else if (lastTouchedElement) {
          restoreElement(lastTouchedElement)
        }
        lastMovedElement = undefined
        lastTouchedElement = undefined
      },
      true
    )
  }

  if (!document.onmousemove) {
    document.addEventListener(
      'mousemove',
      function (e) {
        e.preventDefault()
        if (lastTouchedElement) {
          if (!lastMovedElement) {
            lastMovedElement = lastTouchedElement
            lastMovedElement.style.position = 'absolute'
          } else {
            lastTouchedElement.style.left = e.clientX + offset[0] + 'px'
            lastTouchedElement.style.top = e.clientY + offset[1] + 'px'
          }
        }
      },
      true
    )
  }
}

function unregisterAllDraggableElements() {
  registeredElements.forEach((elem) => {
    restoreElement(elem)
    elem.classList.remove('draggable')
  })
  registeredElements = []
}

function restoreElement(elem: HTMLElement) {
  elem.style.cursor = ''
  elem.style.position = ''
  elem.style.left = ''
  elem.style.top = ''
}

export {
  registerDraggableTaggedElements,
  registerDraggableElement,
  unregisterAllDraggableElements
}
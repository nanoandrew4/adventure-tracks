import type { State } from "@/vuex/store"
import type { Store } from "vuex/types/index.js"

let offset = [0, 0]

let registeredElements: HTMLElement[] = []
let lastTouchedElement: HTMLElement | undefined
let lastMovedElement: HTMLElement | undefined

function registerDraggableTaggedElements(store: Store<State>) {
  document.querySelectorAll('[draggable]').forEach((elem) => {
    const htmlElem = elem as HTMLElement
    registerDraggableElement(htmlElem, store)
  })
}

function registerDraggableElement(elem: HTMLElement, store: Store<State>) {
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
            const leftMargin = parseInt(
              window.getComputedStyle(lastMovedElement).getPropertyValue('margin-left')
            )
            lastMovedElement.style.left =
              ((elemRect.x - rootRect.x - leftMargin) / rootRect.width) * 100 + '%'
            lastMovedElement.style.top = ((elemRect.y - rootRect.y) / rootRect.height) * 100 + '%'
          }
        } else if (lastTouchedElement) {
          lastTouchedElement.style.cursor = ''
          const adventureTrackRoot = document.getElementById('adventure-track')
          if (!adventureTrackRoot) {
            return
          }
          let adventureTrackChildrenHeight = 0
          for (const c of adventureTrackRoot.children) {
            adventureTrackChildrenHeight += c.getBoundingClientRect().height
          }

          if (
            adventureTrackRoot.getBoundingClientRect().height <
            adventureTrackChildrenHeight + lastTouchedElement.getBoundingClientRect().height
          ) {
            store.commit('SET_SNACKBAR_MESSAGE', 'creator.snackbar.element-does-not-fit')
          } else {
            restoreElement(lastTouchedElement)
          }
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

export { registerDraggableTaggedElements, registerDraggableElement, unregisterAllDraggableElements }

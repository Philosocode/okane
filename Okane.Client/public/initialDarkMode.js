'use strict'

let colorScheme = localStorage.getItem('okane-color-mode')
if (!colorScheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  colorScheme = 'dark'
}

document.documentElement.classList.add(colorScheme)

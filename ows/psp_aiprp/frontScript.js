'use strict'

/**
 * Namespace
 */
const nsPspAipRp = {}

nsPspAipRp.ONE_MINUTE = 60

nsPspAipRp.getCookie = (name) => {
  const row = document.cookie
    .split(';')
    .find(x => x.trim().startsWith(name))

  if (!row) {
    return undefined
  }

  return row.split('=')[1]
}

nsPspAipRp.setCookie = (name, value, age = nsPspAipRp.ONE_MINUTE) => {
  if ('number' !== typeof age) {
    console.warn(`Cookie max age must be number of seconds! Fallback to one minute`)
    age = nsPspAipRp.ONE_MINUTE
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${age};`
}


// Fill user's fields from cookies is they are set
// Update cookies if user made changes of their data
(() => {
  const userDataControls = [
    {
      node: document.getElementById('user-firstname'),
      name: 'user-firstname',
    },
    {
      node: document.getElementById('user-surname'),
      name: 'user-surname',
    },
  ]

  userDataControls.forEach(control => {
    const storedValue = nsPspAipRp.getCookie(control.name)
    if ('string' === typeof storedValue) {
      control.node.value = storedValue
    }

    control.node.addEventListener('input', (evn) => {
      nsPspAipRp.setCookie(control.name, control.node.value, nsPspAipRp.ONE_MINUTE)
    })
  })

})()


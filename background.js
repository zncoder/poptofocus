let isFirefox = false

async function popUpTab() {
  let tab = await currentTab()
  popUp(tab.url, tab)
}

async function popUp(url, tab) {
  let win = await getWindow(tab.windowId)
  let arg = {
    url: url,
    type: "popup",
    left: win.left,
    top: win.top,
    width: win.width,
    height: win.height,
  }
  // HACK: workaround firefox bug to not use full width
  if (isFirefox) {
    arg.width -= 11
  }
  chrome.windows.create(arg)
  chrome.tabs.remove(tab.id)
}

function currentTab() {
  return new Promise(resolve => {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => resolve(tabs[0]))
  })
}

function getWindow(id) {
  return new Promise(resolve => {
    chrome.windows.get(id, {}, win => resolve(win))
  })
}

function handleMenu(info, tab) {
  switch (info.menuItemId) {
  case "pop-in":
    popIn(info, tab)
    break
  case "copy-url":
    copyUrl(tab.url)
    break
  case "pop-all-in":
    popAllIn()
    break
  case "pop-up":
    popUp(info.linkUrl, tab)
    break
  }
}

function popIn(info, tab) {
  popInTab(tab)
}

function popInTab(tab) {
  chrome.tabs.create({
    url: tab.url,
    active: true,
  })
  chrome.tabs.remove(tab.id)
}

function copyUrl(url) {
  let ta = document.createElement("textarea")
  ta.value = url
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand("copy")
  } catch (e) {
    console.log("copy to clipboard err"); console.log(e)
  } finally {
    document.body.removeChild(ta)
  }
}

async function popAllIn() {
  let tabs = await getAllTabs()
  for (let t of tabs) {
    popInTab(t)
  }
}

function getAllTabs() {
  return new Promise(resolve => {
    chrome.tabs.query({windowType: "popup"}, tabs => resolve(tabs))
  })
}

async function init() {
  chrome.contextMenus.create({id: "pop-in", title: "Pop In", contexts: ["page"]})
  chrome.contextMenus.create({id: "copy-url", title: "Copy URL", contexts: ["page"]})
  chrome.contextMenus.create({id: "pop-all-in", title: "Pop All In", contexts: ["browser_action"]})
  chrome.contextMenus.create({id: "pop-up", title: "Pop Up", contexts: ["link"]})
  chrome.contextMenus.onClicked.addListener(handleMenu)
  chrome.browserAction.onClicked.addListener(popUpTab)

  try {
    browser.runtime.id
    isFirefox = true
  } catch (e) {
  }
}

init()

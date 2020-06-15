async function popUpTab() {
  let tab = await currentTab()
  let win = await getWindow(tab.windowId)
  let arg = {
    url: tab.url,
    type: "popup",
    left: win.left,
    top: win.top,
    width: win.width,
    height: win.height,
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
  case "pop-all-in":
    popAllIn()
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
  chrome.contextMenus.create({id: "pop-all-in", title: "Pop All In", contexts: ["browser_action"]})
  chrome.contextMenus.onClicked.addListener(handleMenu)
  chrome.browserAction.onClicked.addListener(popUpTab)
}

init()

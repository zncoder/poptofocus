let screenBound

async function popUpTab() {
  let tab = await currentTab()
  let arg = {
    url: tab.url,
    type: "popup",
    width: Math.floor(2*window.screen.availWidth/3),
    height: Math.floor(49*window.screen.availHeight/50),
  }
  console.log(arg)
  if (screenBound) {
    arg.left = screenBound.left
    arg.top = screenBound.top
    arg.width = Math.floor(2*screenBound.width/3-1)
    arg.height = Math.floor(screenBound.height)
  }
  chrome.windows.create(arg)
  chrome.tabs.remove(tab.id)
}

function currentTab() {
  return new Promise(resolve => {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => resolve(tabs[0]))
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

function getDisplayInfo() {
  if (typeof(chrome.system) !== "undefined") {
    return new Promise(resolve => {
      chrome.system.display.getInfo(info => resolve(info))
    })
  } else {
    return Promise.reject("undefined")
  }
}

function getAllTabs() {
  return new Promise(resolve => {
    chrome.tabs.query({windowType: "popup"}, tabs => resolve(tabs))
  })
}

async function init() {
  try {
    let info = await getDisplayInfo()
    screenBound = info[0].workArea
  } catch (e) {
    console.log("screenBound not defined")
  }

  chrome.contextMenus.create({id: "pop-in", title: "Pop In", contexts: ["page"]})
  chrome.contextMenus.create({id: "pop-all-in", title: "Pop All In", contexts: ["browser_action"]})
  chrome.contextMenus.onClicked.addListener(handleMenu)
  chrome.browserAction.onClicked.addListener(popUpTab)
}

init()

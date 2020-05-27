let screenBound

async function popUpTab() {
  let tab = await currentTab()
  let arg = {
    url: tab.url,
    type: "popup",
  }
  if (screenBound) {
    arg.left = screenBound.left
    arg.top = screenBound.top
    arg.width = 2*screenBound.width/3-1
    arg.height = screenBound.height
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
  }
}

function popIn(info, tab) {
  chrome.tabs.create({
    url: info.pageUrl,
    active: true,
  })
  chrome.tabs.remove(tab.id)
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

async function init() {
  try {
    let info = await getDisplayInfo()
    screenBound = info[0].workArea
  } catch (e) {
    console.log("screenBound not defined")
  }

  chrome.contextMenus.create({id: "pop-in", title: "Pop In", contexts: ["page"]})
  chrome.contextMenus.onClicked.addListener(handleMenu)
  chrome.browserAction.onClicked.addListener(popUpTab)
}

init()

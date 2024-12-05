chrome.runtime.onInstalled.addListener(() => {
  const version = chrome.runtime.getManifest().version;
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/assets/logo.png",
    title: "Extension Installed",
    message: `Version ${version}. Created by EnderMyhtex. Thank you for installing our extension!`
  });
});

chrome.system.storage.onAttached.addListener((info) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/assets/logo.png",
    title: "Device Connected",
    message: `A storage device has been connected: ${info.name}`
  });
});
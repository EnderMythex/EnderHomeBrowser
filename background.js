chrome.runtime.onInstalled.addListener(() => {
  const version = chrome.runtime.getManifest().version;  // Récupère la version du manifeste
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/assets/logo.png",
    title: "Extension Installée",
    message: `Version ${version}. Créée par EnderMyhtex. Merci d'avoir installé notre extension !`
  });
});

chrome.system.storage.onAttached.addListener((info) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/assets/logo.png",
    title: "Périphérique Connecté",
    message: `Un périphérique de stockage a été connecté: ${info.name}`
  });
});
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // Mise à jour de la position du curseur
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });

    // Effet hover sur les éléments cliquables
    const clickables = document.querySelectorAll('a, button, input, textarea');
    clickables.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months start at 0
    const year = now.getFullYear();
    const dateString = `${day}/${month}/${year} /`;
    
    document.getElementById('clock').textContent = `${dateString} ${timeString}`;
}

setInterval(updateClock, 1000);
updateClock(); // initial call to display clock immediately

function updateRecentSites() {
    chrome.history.search({text: '', maxResults: 10}, function(data) {
        const recentSitesList = document.getElementById('recent-sites');
        recentSitesList.innerHTML = '';
        data.forEach(function(page) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = page.url;
            link.textContent = page.title || page.url;
            link.target = '_blank';
            listItem.appendChild(link);
            recentSitesList.appendChild(listItem);
        });
    });
}

let recentSitesInterval; // Déclaration de la variable pour l'intervalle

// Effacer le contenu de recent-sites au chargement initial
document.getElementById('recent-sites').innerHTML = ''; // Efface le contenu initial

recentSitesInterval = setInterval(() => {
    const container = document.querySelector('.recent-sites-container');
    if (!container.classList.contains('collapsed')) { // Vérifie si le conteneur n'est pas réduit
        updateRecentSites(); // Met à jour seulement si le conteneur est visible
    }
}, 1000); // Mettre à jour toutes les secondes

function toggleRecentSites() {
    const container = document.querySelector('.recent-sites-container');
    container.classList.toggle('collapsed');
    const button = container.querySelector('.toggle-button');
    button.textContent = container.classList.contains('collapsed') ? '⮞' : '⮜';
    
    // Supprimer le contenu de recent-sites si le conteneur est réduit
    if (container.classList.contains('collapsed')) {
        document.getElementById('recent-sites').innerHTML = ''; // Efface le contenu
        clearInterval(recentSitesInterval); // Mettre en pause l'intervalle
    } else {
        recentSitesInterval = setInterval(updateRecentSites, 1000); // Reprendre la mise à jour
    }
}

document.getElementById('toggleButton').addEventListener('click', toggleRecentSites);

function updateCPUInfo() {
    chrome.system.cpu.getInfo(function(cpuInfo) {
        const cpuInfoDiv = document.getElementById('cpu-info');
        cpuInfoDiv.innerHTML = '';

        cpuInfo.processors.forEach((processor, index) => {
            const usage = processor.usage;
            const usagePercentage = Math.round(
                (usage.kernel + usage.user) / usage.total * 100
            );

            const processorDiv = document.createElement('div');
            processorDiv.className = 'cpu-stat';
            processorDiv.innerHTML = `
                Processor ${index + 1}: ${usagePercentage}%
                <div class="usage-bar" style="width: ${usagePercentage}%"></div>
            `;
            cpuInfoDiv.appendChild(processorDiv);
        });
    });
}

// Mettre à jour toutes les 500ms pour plus de fluidité
setInterval(updateCPUInfo, 500);
updateCPUInfo(); // Appel initial

function updateMemoryInfo() {
    chrome.system.memory.getInfo(function(memoryInfo) {
        const memoryInfoDiv = document.getElementById('memory-info');
        const totalMemory = memoryInfo.capacity / (1024 * 1024 * 1024); // Conversion en GB
        const usedMemory = (memoryInfo.capacity - memoryInfo.availableCapacity) / (1024 * 1024 * 1024);
        const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

        memoryInfoDiv.innerHTML = `
            RAM: ${memoryPercentage}% used (${usedMemory.toFixed(1)}GB / ${totalMemory.toFixed(1)}GB)
            <div class="memory-bar" style="width: ${memoryPercentage}%"></div>
        `;
    });
}

// Mettre à jour les informations mémoire toutes les secondes
setInterval(updateMemoryInfo, 1000);
updateMemoryInfo(); // Appel initial

function updateStorageInfo() {
    chrome.system.storage.getInfo(function(storageUnits) {
        const storageInfoDiv = document.getElementById('storage-info');
        storageInfoDiv.innerHTML = '';

        storageUnits.forEach((unit) => {
            const totalSpace = unit.capacity / (1024 * 1024 * 1024); // Conversion en GB
            const availableSpace = unit.availableCapacity / (1024 * 1024 * 1024);
            const usedSpace = totalSpace - availableSpace;
            const usagePercentage = Math.round((usedSpace / totalSpace) * 100);

            const storageDiv = document.createElement('div');
            storageDiv.className = 'storage-stat';
            storageDiv.innerHTML = `
                ${unit.name}: ${usagePercentage}% used (${usedSpace.toFixed(1)}GB / ${totalSpace.toFixed(1)}GB)
                <div class="storage-bar" style="width: ${usagePercentage}%"></div>
            `;
            storageInfoDiv.appendChild(storageDiv);
        });
    });
}

// Mettre à jour les informations de stockage toutes les 5 secondes
setInterval(updateStorageInfo, 5000);
updateStorageInfo(); // Appel initial

// Animation des barres de progression
function animateProgressBars() {
    const bars = document.querySelectorAll('.usage-bar, .memory-bar, .storage-bar');
    bars.forEach(bar => {
        const currentWidth = parseFloat(bar.style.width);
        bar.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
}

// Appeler cette fonction après chaque mise à jour des barres
document.addEventListener('DOMContentLoaded', () => {
    animateProgressBars();
});

// Effet de survol pour les conteneurs
const containers = document.querySelectorAll('.performance-container, .storage-container');
containers.forEach(container => {
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        container.style.background = `
            radial-gradient(circle at ${x}px ${y}px, 
            rgba(40, 44, 48, 0.95) 0%, 
            rgba(30, 34, 38, 0.95) 50%)
        `;
    });
    
    container.addEventListener('mouseleave', () => {
        container.style.background = 'rgba(30, 34, 38, 0.95)';
    });
});

// Fonction pour la météo
async function updateWeather() {
    try {
        const weatherInfo = document.getElementById('weather-info');
        
        // Utiliser l'API wttr.in qui ne nécessite pas de clé
        const response = await fetch('https://wttr.in/?format=j1');
        const data = await response.json();
        
        const current = data.current_condition[0];
        const location = data.nearest_area[0];
        
        // Fonction pour obtenir l'emoji météo approprié
        function getWeatherEmoji(code) {
            const weatherCodes = {
                '113': '☀️', // Clear/Sunny
                '116': '⛅️', // Partly cloudy
                '119': '☁️', // Cloudy
                '122': '☁️', // Overcast
                '143': '🌫', // Mist
                '176': '🌦', // Patchy rain possible
                '179': '🌨', // Patchy snow possible
                '182': '🌧', // Patchy sleet possible
                '185': '🌧', // Patchy freezing drizzle possible
                '200': '⛈', // Thundery outbreaks possible
                '227': '🌨', // Blowing snow
                '230': '❄️', // Blizzard
                '248': '🌫', // Fog
                '260': '🌫', // Freezing fog
                '263': '🌦', // Patchy light drizzle
                '266': '🌧', // Light drizzle
                '281': '🌧', // Freezing drizzle
                '284': '🌧', // Heavy freezing drizzle
                '293': '🌧', // Patchy light rain
                '296': '🌧', // Light rain
                '299': '🌧', // Moderate rain at times
                '302': '🌧', // Moderate rain
                '305': '🌧', // Heavy rain at times
                '308': '🌧', // Heavy rain
                '311': '🌧', // Light freezing rain
                '314': '🌧', // Moderate or heavy freezing rain
                '317': '🌨', // Light sleet
                '320': '🌨', // Moderate or heavy sleet
                '323': '🌨', // Patchy light snow
                '326': '🌨', // Light snow
                '329': '🌨', // Patchy moderate snow
                '332': '🌨', // Moderate snow
                '335': '🌨', // Patchy heavy snow
                '338': '❄️', // Heavy snow
                '350': '🌨', // Ice pellets
                '353': '🌦', // Light rain shower
                '356': '🌧', // Moderate or heavy rain shower
                '359': '🌧', // Torrential rain shower
                '362': '🌧', // Light sleet showers
                '365': '🌧', // Moderate or heavy sleet showers
                '368': '🌨', // Light snow showers
                '371': '🌨', // Moderate or heavy snow showers
                '374': '🌨', // Light showers of ice pellets
                '377': '🌨', // Moderate or heavy showers of ice pellets
                '386': '⛈', // Patchy light rain with thunder
                '389': '⛈', // Moderate or heavy rain with thunder
                '392': '🌩', // Patchy light snow with thunder
                '395': '⛈', // Moderate or heavy snow with thunder
            };
            return weatherCodes[code] || '🌡️';
        }

        weatherInfo.innerHTML = `
            <div class="weather-emoji">${getWeatherEmoji(current.weatherCode)}</div>
            <h4>${location.areaName[0].value}, ${location.country[0].value}</h4>
            <p>${current.temp_C}°C</p>
            <p>${current.weatherDesc[0].value}</p>
            <p>Humidity: ${current.humidity}%</p>
            <p>Wind: ${current.windspeedKmph} km/h</p>
        `;
    } catch (error) {
        console.error('Erreur météo:', error);
        document.getElementById('weather-info').innerHTML = `
            <div class="weather-error">
                <p>Unable to load weather</p>
                <button onclick="updateWeather()">Retry</button>
            </div>
        `;
    }
}

// Fonction pour les notes rapides
function initNotes() {
    const notesArea = document.getElementById('notes-area');
    const saveButton = document.getElementById('save-notes');
    const saveStatus = document.getElementById('save-status');
    let saveTimeout;

    // Charger les notes sauvegardées
    function loadNotes() {
        chrome.storage.local.get(['quickNotes'], function(result) {
            if (result.quickNotes) {
                notesArea.value = result.quickNotes;
            }
        });
    }

    // Sauvegarder les notes
    function saveNotes(showStatus = true) {
        chrome.storage.local.set({
            quickNotes: notesArea.value
        }, function() {
            if (showStatus) {
                saveStatus.textContent = 'Saved!';
                saveStatus.classList.add('visible');
                setTimeout(() => {
                    saveStatus.classList.remove('visible');
                }, 2000);
            }
        });
    }

    // Événement pour le bouton de sauvegarde
    saveButton.addEventListener('click', () => {
        saveNotes(true);
    });

    // Sauvegarde automatique lors de la saisie
    notesArea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveNotes(false);
        }, 1000);
    });

    // Sauvegarder avant de quitter la page
    window.addEventListener('beforeunload', () => {
        saveNotes(false);
    });

    // Charger les notes au démarrage
    loadNotes();

    // Gérer le raccourci clavier Ctrl+S
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's' && document.activeElement === notesArea) {
            e.preventDefault();
            saveNotes(true);
        }
    });
}

// Ajoutez ce code au début du fichier script.js

function initContextMenu() {
    const contextMenu = document.querySelector('.custom-context-menu');
    let isContextMenuVisible = false;

    // Gestionnaire du clic droit
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // Vérifier si du texte est sélectionné
        const selectedText = window.getSelection().toString();
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        
        // Afficher/masquer les options appropriées
        const copyButton = contextMenu.querySelector('[data-action="copy"]');
        const pasteButton = contextMenu.querySelector('[data-action="paste"]');
        
        copyButton.style.display = selectedText ? 'flex' : 'none';
        pasteButton.style.display = isInput ? 'flex' : 'none';
        
        // Positionner le menu
        const x = e.clientX;
        const y = e.clientY;
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        // Afficher le menu
        contextMenu.classList.add('active');
        isContextMenuVisible = true;
    });

    // Gestionnaire des actions du menu
    const menuItems = contextMenu.querySelectorAll('.context-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const action = item.getAttribute('data-action');
            
            switch(action) {
                case 'copy':
                    const text = window.getSelection().toString();
                    if (text) {
                        navigator.clipboard.writeText(text)
                            .then(() => showNotification('Texte copié !', 'success'))
                            .catch(() => showNotification('Erreur lors de la copie', 'error'));
                    }
                    break;

                case 'paste':
                    const activeElement = document.activeElement;
                    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                        navigator.clipboard.readText()
                            .then(clipText => {
                                const start = activeElement.selectionStart;
                                const end = activeElement.selectionEnd;
                                activeElement.value = activeElement.value.slice(0, start) + 
                                                    clipText + 
                                                    activeElement.value.slice(end);
                                activeElement.setSelectionRange(start + clipText.length, start + clipText.length);
                                showNotification('Texte collé !', 'success');
                            })
                            .catch(() => showNotification('Erreur lors du collage', 'error'));
                    }
                    break;

                case 'reload':
                    window.location.reload();
                    break;

                case 'settings':
                    document.getElementById('settingsModal').classList.add('active');
                    break;

                case 'about':
                    document.getElementById('aboutModal').classList.add('active');
                    break;
            }

            // Fermer le menu après l'action
            contextMenu.classList.remove('active');
            isContextMenuVisible = false;
        });
    });

    // Fermer le menu au clic en dehors
    document.addEventListener('click', (e) => {
        if (isContextMenuVisible && !contextMenu.contains(e.target)) {
            contextMenu.classList.remove('active');
            isContextMenuVisible = false;
        }
    });

    // Fermer le menu avec Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isContextMenuVisible) {
            contextMenu.classList.remove('active');
            isContextMenuVisible = false;
        }
    });
}

// Ajouter cette nouvelle fonction helper
function copyToClipboardFallback(text) {
    try {
        // Créer un élément temporaire
        const tempInput = document.createElement('textarea');
        tempInput.style.position = 'fixed';
        tempInput.style.left = '-9999px';
        tempInput.style.top = '0';
        tempInput.value = text;
        
        document.body.appendChild(tempInput);
        
        // Sauvegarder la sélection actuelle
        const selected = document.getSelection().rangeCount > 0 
            ? document.getSelection().getRangeAt(0)
            : false;
        
        // Sélectionner et copier le texte
        tempInput.select();
        tempInput.setSelectionRange(0, tempInput.value.length);
        
        const success = document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        // Restaurer la sélection originale si elle existait
        if (selected) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(selected);
        }
        
        if (success) {
            showNotification('Copié !', 'success');
        } else {
            showNotification('Échec de la copie', 'error');
        }
    } catch (err) {
        console.error('Erreur fallback copie:', err);
        showNotification('Échec de la copie', 'error');
    }
}

// Ajoutez cette fonction pour gérer les notifications
function showNotification(message, type = 'info') {
    // Créer l'élément de notification s'il n'existe pas
    let notification = document.getElementById('customNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'customNotification';
        document.body.appendChild(notification);
    }
    
    // Définir la classe en fonction du type
    notification.className = `custom-notification ${type}`;
    notification.textContent = message;
    
    // Afficher la notification
    notification.classList.add('show');
    
    // Masquer la notification après 2 secondes
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Ajoutez ces fonctions dans votre fichier script.js

function initSettings() {
    const settingsModal = document.getElementById('settingsModal');
    const closeButton = settingsModal.querySelector('.close-settings');
    
    // Charger les paramètres sauvegardés
    loadSettings();
    
    // Gestionnaire pour le bouton de fermeture
    closeButton.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    
    // Fermer avec Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Clic en dehors de la modal
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Gestionnaires d'événements pour les paramètres
    document.getElementById('themeSelect').addEventListener('change', saveSettings);
    document.getElementById('customCursorToggle').addEventListener('change', saveSettings);
    document.getElementById('weatherWidgetToggle').addEventListener('change', saveSettings);
    document.getElementById('notesWidgetToggle').addEventListener('change', saveSettings);
    document.getElementById('performanceWidgetToggle').addEventListener('change', saveSettings);
    document.getElementById('defaultSearchEngine').addEventListener('change', saveSettings);
}

function loadSettings() {
    chrome.storage.local.get({
        // Valeurs par défaut
        theme: 'dark',
        customCursor: true,
        weatherWidget: true,
        notesWidget: true,
        performanceWidget: true,
        defaultSearchEngine: 'google',
        language: 'en'  // Ajout de la langue par défaut
    }, (settings) => {
        // Appliquer les paramètres
        document.getElementById('themeSelect').value = settings.theme;
        document.getElementById('customCursorToggle').checked = settings.customCursor;
        document.getElementById('weatherWidgetToggle').checked = settings.weatherWidget;
        document.getElementById('notesWidgetToggle').checked = settings.notesWidget;
        document.getElementById('performanceWidgetToggle').checked = settings.performanceWidget;
        document.getElementById('defaultSearchEngine').value = settings.defaultSearchEngine;
        
        // Initialiser la langue avant d'appliquer les paramètres
        currentLanguage = settings.language;
        
        // Mettre à jour la sélection de langue
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            const selectedOption = languageSelect.querySelector(`[data-value="${currentLanguage}"]`);
            if (selectedOption) {
                const text = selectedOption.querySelector('span').textContent;
                languageSelect.querySelector('.selected-text').textContent = text;
                
                languageSelect.querySelectorAll('.custom-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                selectedOption.classList.add('selected');
            }
        }
        
        // Appliquer les paramètres et mettre à jour la langue
        applySettings(settings);
        updateLanguage(currentLanguage);
    });
}

function saveSettings() {
    // Récupérer la langue actuelle avant de sauvegarder
    const currentLang = currentLanguage || 'en';
    
    const settings = {
        theme: document.getElementById('themeSelect').value,
        customCursor: document.getElementById('customCursorToggle').checked,
        weatherWidget: document.getElementById('weatherWidgetToggle').checked,
        notesWidget: document.getElementById('notesWidgetToggle').checked,
        performanceWidget: document.getElementById('performanceWidgetToggle').checked,
        defaultSearchEngine: document.getElementById('defaultSearchEngine').value,
        language: currentLang
    };
    
    // Sauvegarder les paramètres de manière persistante
    chrome.storage.local.set(settings, () => {
        console.log('Thème sauvegard:', settings.theme); // Debug
        applySettings(settings);
    });
}

function applySettings(settings) {
    console.log('Appliquer le thème:', settings.theme); // Debug
    
    // Appliquer le thème
    document.body.className = ''; // Nettoyer toutes les classes
    
    if (settings.theme === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('theme-light');
        } else {
            document.body.classList.add('theme-dark');
        }
        
        // Écouter les changements de thème système
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
            document.body.className = ''; // Nettoyer les classes
            document.body.classList.add(e.matches ? 'theme-light' : 'theme-dark');
        });
    } else {
        document.body.classList.add(`theme-${settings.theme}`);
    }

    // Gérer le curseur personnalisé
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        cursor.style.display = settings.customCursor ? 'block' : 'none';
    }
    
    // Gérer les classes du curseur
    if (settings.customCursor) {
        document.body.classList.add('custom-cursor-enabled');
        document.body.style.cursor = 'none';
    } else {
        document.body.classList.remove('custom-cursor-enabled');
        document.body.style.cursor = 'auto';
    }

    // Gérer les widgets
    const weatherWidget = document.querySelector('.weather-widget');
    const notesWidget = document.querySelector('.quick-notes');
    const performanceWidget = document.querySelector('.performance-container');

    if (weatherWidget) weatherWidget.style.display = settings.weatherWidget ? 'block' : 'none';
    if (notesWidget) notesWidget.style.display = settings.notesWidget ? 'block' : 'none';
    if (performanceWidget) performanceWidget.style.display = settings.performanceWidget ? 'block' : 'none';
}

// Ajoutez cette fonction à initSettings() ou créez une nouvelle fonction d'initialisation
function initModals() {
    // Gestion de la fenêtre "À propos"
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutButton = aboutModal.querySelector('.close-about');
    
    closeAboutButton.addEventListener('click', () => {
        aboutModal.classList.remove('active');
    });
    
    // Fermer avec Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            aboutModal.classList.remove('active');
        }
    });
    
    // Clic en dehors de la modal
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.remove('active');
        }
    });
}

let currentLanguage = 'en';

function initLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    
    // Charger la langue sauvegardée
    chrome.storage.local.get({ language: 'en' }, (result) => {
        currentLanguage = result.language;
        
        // Mettre à jour la sélection visuelle
        const selectedOption = languageSelect.querySelector(`[data-value="${currentLanguage}"]`);
        if (selectedOption) {
            const text = selectedOption.querySelector('span').textContent;
            languageSelect.querySelector('.selected-text').textContent = text;
            
            languageSelect.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            selectedOption.classList.add('selected');
        }
        
        // S'assurer que les traductions sont chargées
        if (translations && translations[currentLanguage]) {
            updateLanguage(currentLanguage);
        } else {
            console.error('Traductions non disponibles');
        }
    });

    // Gestionnaire d'événement pour le changement de langue
    languageSelect.addEventListener('change', (e) => {
        const newLanguage = e.detail.value;
        currentLanguage = newLanguage;
        chrome.storage.local.set({ language: newLanguage });
        updateLanguage(newLanguage);
    });
}

function updateLanguage(lang) {
    if (!translations || !translations[lang]) {
        console.error(`Traductions non disponibles pour la langue: ${lang}`);
        return;
    }

    try {
        // Mettre à jour tous les éléments avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(key, lang);
            element.textContent = translation;
        });

        // Mettre à jour les placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = getTranslation(key, lang);
            element.placeholder = translation;
        });

        // Mettre à jour les textes sélectionnés dans les listes déroulantes
        document.querySelectorAll('.custom-select').forEach(select => {
            const selectedOption = select.querySelector('.custom-select-option.selected');
            if (selectedOption) {
                const translationKey = selectedOption.querySelector('span').getAttribute('data-i18n');
                if (translationKey) {
                    const translation = getTranslation(translationKey, lang);
                    select.querySelector('.selected-text').textContent = translation;
                }
            }
        });

        // Mettre à jour les placeholders des champs de recherche
        const searchInputs = {
            'google': document.querySelector('.search.google input'),
            'brave': document.querySelector('.search.brave input'),
            'bing': document.querySelector('.search.bing input')
        };

        Object.entries(searchInputs).forEach(([engine, input]) => {
            if (input) {
                input.placeholder = getTranslation(`search.placeholder.${engine}`, lang);
            }
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de la langue:', error);
    }
}

function getTranslation(key, lang) {
    if (!translations || !translations[lang]) {
        console.error(`Traductions non disponibles pour la langue: ${lang}`);
        return key;
    }

    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            console.warn(`Traduction manquante pour la cl: ${key} en ${lang}`);
            return key;
        }
    }
    
    return value;
}

function updateSpecificElements(lang) {
    if (!translations || !translations[lang]) return;

    try {
        // Menu contextuel - utiliser les attributs data-i18n
        document.querySelectorAll('.context-menu-item .menu-text').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                const translation = getTranslation(key, lang);
                element.textContent = translation;
            }
        });

        // Notes
        const notesArea = document.getElementById('notes-area');
        const saveButton = document.getElementById('save-notes');
        if (notesArea && translations[lang].notes?.placeholder) {
            notesArea.placeholder = translations[lang].notes.placeholder;
        }
        if (saveButton && translations[lang].notes?.save) {
            saveButton.textContent = translations[lang].notes.save;
        }

        // Sites récents
        const recentSitesTitle = document.querySelector('.recent-sites-container h2');
        if (recentSitesTitle && translations[lang].recentSites?.title) {
            recentSitesTitle.textContent = translations[lang].recentSites.title;
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des éléments spécifiques:', error);
    }
}

// Ajoutez cette fonction pour initialiser les listes déroulantes personnalisées
function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(select => {
        const trigger = select.querySelector('.custom-select-trigger');
        const options = select.querySelector('.custom-select-options');
        const selectedText = trigger.querySelector('.selected-text');

        // Gestionnaire pour ouvrir/fermer la liste
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = select.classList.contains('open');
            
            // Fermer toutes les autres listes
            document.querySelectorAll('.custom-select.open').forEach(otherSelect => {
                if (otherSelect !== select) {
                    otherSelect.classList.remove('open');
                }
            });
            
            select.classList.toggle('open');
            
            if (!isOpen) {
                // Animation d'ouverture
                options.style.animation = 'none';
                setTimeout(() => {
                    options.style.animation = 'selectFadeIn 0.2s ease';
                }, 0);
            }
        });

        // Gestionnaire pour les options
        select.querySelectorAll('.custom-select-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const spanElement = option.querySelector('span');
                const text = spanElement.textContent;
                const icon = option.querySelector('.custom-select-icon').innerHTML;

                // Mise à jour du texte et de l'icône affichés
                selectedText.textContent = text;
                trigger.querySelector('.selected-icon').innerHTML = icon;

                // Mise à jour de la sélection
                select.querySelectorAll('.custom-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');

                // Fermer la liste
                select.classList.remove('open');

                // Si c'est le select du moteur de recherche
                if (select.id === 'defaultSearchEngine') {
                    setDefaultSearchEngine(value);
                }
                
                // Sauvegarder immédiatement les paramètres
                if (select.id === 'themeSelect') {
                    const settings = {
                        theme: value,
                        customCursor: document.getElementById('customCursorToggle').checked,
                        weatherWidget: document.getElementById('weatherWidgetToggle').checked,
                        notesWidget: document.getElementById('notesWidgetToggle').checked,
                        performanceWidget: document.getElementById('performanceWidgetToggle').checked,
                        defaultSearchEngine: document.getElementById('defaultSearchEngine').value,
                        language: currentLanguage
                    };
                    chrome.storage.local.set(settings, () => {
                        console.log('Nouveau thème sauvegardé:', value); // Debug
                        applySettings(settings);
                    });
                } else if (select.id === 'languageSelect') {
                    currentLanguage = value;
                    updateLanguage(value);
                }
            });
        });
    });

    // Fermer les listes lors d'un clic en dehors
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(select => {
            select.classList.remove('open');
        });
    });
}

// Ajoutez cette fonction dans script.js
function setDefaultSearchEngine(engine) {
    // Mettre à jour l'interface utilisateur
    const searchForms = document.querySelectorAll('.search');
    searchForms.forEach(form => {
        form.style.display = 'none';
    });

    // Afficher uniquement le formulaire du moteur de recherche sélectionné
    const selectedForm = document.querySelector(`.search.${engine}`);
    if (selectedForm) {
        selectedForm.style.display = 'block';
    }

    // Sauvegarder le choix dans le stockage local
    chrome.storage.local.set({ defaultSearchEngine: engine }, () => {
        console.log('Moteur de recherche par défaut mis à jour:', engine);
    });
}

// Ajoutez cette fonction pour charger le moteur de recherche par défaut au démarrage
function loadDefaultSearchEngine() {
    chrome.storage.local.get({ defaultSearchEngine: 'google' }, (result) => {
        setDefaultSearchEngine(result.defaultSearchEngine);
        
        // Mettre  jour la slection visuelle dans le select
        const engineSelect = document.getElementById('defaultSearchEngine');
        const selectedOption = engineSelect.querySelector(`[data-value="${result.defaultSearchEngine}"]`);
        if (selectedOption) {
            const text = selectedOption.querySelector('span').textContent;
            const icon = selectedOption.querySelector('.custom-select-icon').innerHTML;
            
            engineSelect.querySelector('.selected-text').textContent = text;
            engineSelect.querySelector('.selected-icon').innerHTML = icon;
            
            engineSelect.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            selectedOption.classList.add('selected');
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // S'assurer que les traductions sont chargées
    if (typeof translations === 'undefined') {
        console.error('Le fichier de traductions n\'est pas chargé');
        return;
    }

    // Initialiser la langue par défaut
    currentLanguage = 'en';

    // Initialiser les composants
    initCustomCursor();
    initCustomSelects();
    initSettings(); // Cela chargera les paramètres et la langue sauvegardée
    initLanguage();
    initNotes();
    initContextMenu();
    initModals();
    
    // Mettre à jour les éléments dynamiques
    updateWeather();
    setInterval(updateWeather, 10000);
    loadDefaultSearchEngine();
});

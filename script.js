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
        if (!cpuInfoDiv) return;

        // Créer un fragment pour éviter les reflows multiples
        const fragment = document.createDocumentFragment();
        
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
            fragment.appendChild(processorDiv);
        });

        // Une seule modification du DOM
        cpuInfoDiv.innerHTML = '';
        cpuInfoDiv.appendChild(fragment);
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
                        console.log('Nouveau thème sauvegard:', value); // Debug
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

let frameCount = 0;
let lastTime = performance.now();
let fps = 0;
let fpsUpdateTimeout;

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Mettre à jour l'affichage seulement si l'élément existe
        const fpsInfoDiv = document.getElementById('fps-info');
        if (fpsInfoDiv) {
            // Limiter les mises à jour du DOM
            clearTimeout(fpsUpdateTimeout);
            fpsUpdateTimeout = setTimeout(() => {
                const fpsQuality = fps >= 50 ? 'Excellent' : fps >= 30 ? 'Good' : 'Poor';
                const percentage = Math.min(100, Math.round((fps / 60) * 100));
                
                fpsInfoDiv.innerHTML = `
                    ${fps} FPS (${fpsQuality})
                    <div class="fps-bar" style="width: ${percentage}%"></div>
                `;
            }, 100); // Mettre à jour l'affichage au maximum 10 fois par seconde
        }
    }
    
    requestAnimationFrame(updateFPS);
}

// Remplacer les intervalles trop fréquents par des intervalles plus raisonnables
function initPerformanceMonitoring() {
    // CPU et mémoire toutes les 2 secondes au lieu de 500ms/1000ms
    setInterval(() => {
        updateCPUInfo();
        updateMemoryInfo();
    }, 2000);

    // Stockage toutes les 10 secondes au lieu de 5
    setInterval(updateStorageInfo, 10000);

    // Météo toutes les 5 minutes au lieu de 10 secondes
    setInterval(updateWeather, 300000);

    // Ajouter la mesure du ping toutes les 5 secondes
    setInterval(measurePing, 5000);
    measurePing(); // Premier appel immédiat
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
    initPerformanceMonitoring();
    updateWeather(); // Premier appel immédiat
    loadDefaultSearchEngine();
    requestAnimationFrame(updateFPS);

    // Initialiser avec Bitcoin
    handleCryptoChange('bitcoin');

    // Ajouter le minuteur
    initTimer();
});

document.addEventListener('click', (e) => {
    // Gestion du menu contextuel
    if (e.target.closest('.context-menu-item')) {
        handleContextMenuAction(e);
    }
    
    // Gestion des sélecteurs personnalisés
    if (e.target.closest('.custom-select-trigger')) {
        handleCustomSelectTrigger(e);
    }
    
    // Gestion des options de sélection
    if (e.target.closest('.custom-select-option')) {
        handleCustomSelectOption(e);
    }
});

let bitcoinChart = null;

async function initBitcoinWidget() {
    try {
        const ctx = document.getElementById('bitcoinChart');
        if (!ctx) {
            console.error('Canvas bitcoinChart non trouvé');
            return;
        }

        if (!window.Chart) {
            console.error('Chart.js non chargé');
            return;
        }

        bitcoinChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: `Prix ${currentCrypto.toUpperCase()}`,
                    data: [],
                    borderColor: getCryptoColor(currentCrypto),
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: getCryptoBackgroundColor(currentCrypto),
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toLocaleString(currentLanguage, { 
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2 
                                })}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        await updateBitcoinData();
        setInterval(updateBitcoinData, 300000);

    } catch (error) {
        console.error('Erreur lors de l\'initialisation du widget crypto:', error);
        const chartContainer = document.querySelector('.bitcoin-widget');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="error-message">
                    <p>Erreur lors du chargement du graphique</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="initBitcoinWidget()">Ressayer</button>
                </div>
            `;
        }
    }
}

// Ajouter cette nouvelle fonction pour charger Chart.js de manière asynchrone
function loadChartJs() {
    return new Promise((resolve, reject) => {
        if (window.Chart) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = '/lib/chart.min.js';  // Chemin local vers Chart.js
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

let currentCrypto = 'bitcoin';

// Ajouter cette fonction pour gérer le changement de crypto
function handleCryptoChange(cryptoId) {
    currentCrypto = cryptoId;
    
    // Détruire le graphique existant
    if (bitcoinChart) {
        bitcoinChart.destroy();
    }
    
    // Mettre à jour le titre
    const cryptoNames = {
        'bitcoin': 'Bitcoin',
        'ethereum': 'Ethereum',
        'solana': 'Solana',
        'ripple': 'Ripple'
    };
    
    const titleElement = document.querySelector('.crypto-header h3');
    if (titleElement) {
        titleElement.textContent = `${cryptoNames[cryptoId] || cryptoId} Price`;
    }
    
    // Mettre à jour l'icône du sélecteur avec la bonne couleur
    const selectedIcon = document.querySelector('.crypto-select .selected-icon');
    if (selectedIcon) {
        selectedIcon.style.color = getCryptoColor(cryptoId);
    }
    
    // Réinitialiser le graphique
    initBitcoinWidget();
}

// Modifier la fonction updateBitcoinData pour supporter différentes cryptos
async function updateBitcoinData() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${currentCrypto}/market_chart?vs_currency=usd&days=1&interval=hourly`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'EnderHomeBrowser Extension'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
            throw new Error('Format de données invalide');
        }

        // Mettre à jour le graphique avec les nouvelles données
        const prices = data.prices;
        const labels = prices.map(price => {
            const date = new Date(price[0]);
            return date.toLocaleTimeString(currentLanguage, { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        });

        if (bitcoinChart) {
            bitcoinChart.data.labels = labels;
            bitcoinChart.data.datasets[0].data = prices.map(price => price[1]);
            bitcoinChart.update('none');
        }

        // Mettre à jour le prix et la variation
        const currentPrice = prices[prices.length - 1][1];
        const previousPrice = prices[0][1];
        const change = ((currentPrice - previousPrice) / previousPrice) * 100;

        const priceElement = document.getElementById('bitcoinPrice');
        const changeElement = document.getElementById('bitcoinChange');

        if (priceElement) {
            priceElement.textContent = `$${currentPrice.toLocaleString(currentLanguage, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        if (changeElement) {
            changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            changeElement.className = change >= 0 ? 'positive' : 'negative';
        }

    } catch (error) {
        console.error('Erreur lors de la mise à jour des données crypto:', error);
        const chartContainer = document.querySelector('.bitcoin-widget');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="error-message">
                    <p>Impossible de charger les données de ${currentCrypto}</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="updateBitcoinData()">Réessayer</button>
                </div>
            `;
        }
    }
}

// Ajouter l'écouteur d'événements pour le sélecteur de crypto
document.addEventListener('DOMContentLoaded', () => {
    const cryptoSelect = document.querySelector('.crypto-select');
    if (cryptoSelect) {
        cryptoSelect.querySelectorAll('.custom-select-option').forEach(option => {
            option.addEventListener('click', () => {
                const cryptoId = option.getAttribute('data-value');
                handleCryptoChange(cryptoId);
                
                // Mettre à jour l'affichage du sélecteur
                const trigger = cryptoSelect.querySelector('.custom-select-trigger');
                const selectedIcon = option.querySelector('.custom-select-icon').innerHTML;
                const selectedText = option.querySelector('span').textContent;
                
                trigger.querySelector('.selected-icon').innerHTML = selectedIcon;
                trigger.querySelector('.selected-text').textContent = selectedText;
                
                // Mettre à jour la sélection
                cryptoSelect.querySelectorAll('.custom-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Fermer le menu
                cryptoSelect.classList.remove('open');
            });
        });
    }
});

// Ajouter ces fonctions utilitaires pour les couleurs
function getCryptoColor(crypto) {
    const colors = {
        'bitcoin': '#F7931A',
        'ethereum': '#627EEA',
        'solana': '#00FFA3',
        'ripple': '#23292F'
    };
    return colors[crypto] || '#4285F4';
}

function getCryptoBackgroundColor(crypto) {
    const colors = {
        'bitcoin': 'rgba(247, 147, 26, 0.1)',
        'ethereum': 'rgba(98, 126, 234, 0.1)',
        'solana': 'rgba(0, 255, 163, 0.1)',
        'ripple': 'rgba(35, 41, 47, 0.1)'
    };
    return colors[crypto] || 'rgba(66, 133, 244, 0.1)';
}

// Ajouter cette fonction pour mesurer le ping
async function measurePing() {
    try {
        const startTime = performance.now();
        const response = await fetch('https://www.google.com/favicon.ico', {
            mode: 'no-cors',
            cache: 'no-cache'
        });
        const endTime = performance.now();
        const pingTime = Math.round(endTime - startTime);
        
        const pingInfoDiv = document.getElementById('ping-info');
        if (pingInfoDiv) {
            let quality;
            let color;
            
            if (pingTime < 100) {
                quality = 'Excellent';
                color = '#4CAF50';
            } else if (pingTime < 200) {
                quality = 'Good';
                color = '#FFC107';
            } else {
                quality = 'Poor';
                color = '#F44336';
            }

            const percentage = Math.max(0, Math.min(100, 100 - (pingTime / 3)));
            
            pingInfoDiv.innerHTML = `
                ${pingTime}ms (${quality})
                <div class="ping-bar" style="width: ${percentage}%; background: linear-gradient(90deg, ${color}, ${color}88)"></div>
            `;
        }
    } catch (error) {
        console.error('Erreur de mesure du ping:', error);
        const pingInfoDiv = document.getElementById('ping-info');
        if (pingInfoDiv) {
            pingInfoDiv.innerHTML = 'Connection error';
        }
    }
}

// Ajouter cette fonction pour le minuteur
function initTimer() {
    const timerContainer = document.createElement('div');
    timerContainer.className = 'timer-container';
    timerContainer.innerHTML = `
        <div class="timer-header">
            <h3 data-i18n="storage.timer">TIMER</h3>
            <div class="timer-display">
                <span id="timerDisplay">25:00</span>
            </div>
        </div>
        <div class="timer-progress">
            <div class="progress-bar" id="timerProgressBar"></div>
        </div>
        <div class="timer-controls">
            <div class="time-input">
                <input type="number" id="timerMinutes" min="1" max="999" value="25" />
                <span class="time-label">min</span>
            </div>
            <div class="timer-buttons">
                <button id="startTimer" class="timer-btn">Start</button>
                <button id="resetTimer" class="timer-btn secondary">Reset</button>
            </div>
        </div>
    `;

    // Insérer le minuteur au début du conteneur de stockage
    const storageContainer = document.querySelector('.storage-container');
    storageContainer.insertBefore(timerContainer, storageContainer.firstChild);

    let timerInterval;
    let timeLeft = 25 * 60;
    let totalTime = timeLeft;
    let isRunning = false;

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Mettre à jour la barre de progression
        const progressBar = document.getElementById('timerProgressBar');
        const progress = (timeLeft / totalTime) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Changer la couleur en fonction du temps restant
        if (progress <= 25) {
            progressBar.style.background = '#ff4444';
        } else if (progress <= 50) {
            progressBar.style.background = '#ffa726';
        } else {
            progressBar.style.background = '#4CAF50';
        }
    }

    document.getElementById('startTimer').addEventListener('click', () => {
        const startButton = document.getElementById('startTimer');
        if (isRunning) {
            // Pause
            clearInterval(timerInterval);
            startButton.textContent = 'Start';
            startButton.classList.remove('active');
        } else {
            // Démarrer
            if (timeLeft === 0) {
                timeLeft = document.getElementById('timerMinutes').value * 60;
                totalTime = timeLeft;
            }
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startButton.textContent = 'Start';
                    startButton.classList.remove('active');
                    new Notification('Minuteur terminé', {
                        body: 'Le temps est écoulé !',
                        icon: '/assets/logo.png'
                    });
                }
            }, 1000);
            startButton.textContent = 'Pause';
            startButton.classList.add('active');
        }
        isRunning = !isRunning;
    });

    document.getElementById('resetTimer').addEventListener('click', () => {
        clearInterval(timerInterval);
        const minutes = document.getElementById('timerMinutes').value;
        timeLeft = minutes * 60;
        totalTime = timeLeft;
        isRunning = false;
        
        // Mettre à jour le bouton start
        const startButton = document.getElementById('startTimer');
        startButton.textContent = 'Start';
        startButton.classList.remove('active');
        
        // Réinitialiser la barre de progression
        const progressBar = document.getElementById('timerProgressBar');
        progressBar.style.width = '100%';
        progressBar.style.background = '#4CAF50';
        
        updateDisplay();
    });

    document.getElementById('timerMinutes').addEventListener('change', (e) => {
        if (!isRunning) {
            timeLeft = e.target.value * 60;
            totalTime = timeLeft;
            
            // Réinitialiser la barre de progression
            const progressBar = document.getElementById('timerProgressBar');
            progressBar.style.width = '100%';
            progressBar.style.background = '#4CAF50';
            
            updateDisplay();
        }
    });
}

// Structure pour stocker les liens par défaut
const defaultSidebarLinks = [
    {
        url: 'https://www.google.com',
        title: 'Google',
        iconUrl: 'https://img.icons8.com/color/48/000000/google-logo.png'
    },
    {
        url: 'https://search.brave.com',
        title: 'Brave',
        iconUrl: 'https://img.icons8.com/color/48/000000/brave-web-browser.png'
    },
    {
        url: 'https://www.bing.com',
        title: 'Bing',
        iconUrl: 'https://img.icons8.com/color/48/000000/bing.png'
    },
    {
        url: 'https://chatgpt.com',
        title: 'ChatGPT',
        iconUrl: 'https://img.icons8.com/color/48/000000/chatgpt.png'
    }
];

// Fonction pour initialiser la gestion des liens de la barre latérale
function initSidebarLinks() {
    // Charger les liens sauvegardés ou utiliser les liens par défaut
    chrome.storage.local.get({ sidebarLinks: defaultSidebarLinks }, (result) => {
        updateSidebarLinks(result.sidebarLinks);
    });

    // Ajouter le bouton d'ajout de lien
    const sidebar = document.querySelector('.sidebar');
    const addButton = document.createElement('a');
    addButton.href = '#';
    addButton.className = 'add-link-button';
    addButton.innerHTML = `
        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); 
                    border-radius: 50%; display: flex; align-items: center; 
                    justify-content: center; font-size: 24px; color: white;">
            +
        </div>
    `;
    addButton.title = 'Add new link';
    addButton.onclick = (e) => {
        e.preventDefault();
        showAddLinkDialog();
    };
    sidebar.appendChild(addButton);
}

// Fonction pour mettre à jour l'affichage des liens
function updateSidebarLinks(links) {
    const sidebar = document.querySelector('.sidebar');
    // Supprimer tous les liens existants
    sidebar.querySelectorAll('a:not(.add-link-button)').forEach(a => a.remove());
    
    // Ajouter les nouveaux liens
    links.forEach(link => {
        const linkElement = createSidebarLink(link);
        // Insérer avant le bouton d'ajout
        sidebar.insertBefore(linkElement, sidebar.querySelector('.add-link-button'));
    });
}

// Fonction pour créer un élément de lien
function createSidebarLink(link) {
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.title = link.title;
    
    // Créer le conteneur pour l'icône et le bouton de suppression
    const container = document.createElement('div');
    container.style.position = 'relative';
    
    // Ajouter l'icône
    const img = document.createElement('img');
    img.src = link.iconUrl || `https://www.google.com/s2/favicons?domain=${link.url}&sz=64`;
    img.alt = link.title;
    container.appendChild(img);
    
    // Ajouter le bouton de suppression
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '×';
    deleteButton.className = 'delete-link';
    deleteButton.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 59, 48, 0.9);
        color: white;
        font-size: 14px;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0;
    `;
    
    // Gérer la suppression du lien
    deleteButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeSidebarLink(link.url);
    };
    
    container.appendChild(deleteButton);
    a.appendChild(container);
    
    // Afficher/masquer le bouton de suppression au survol
    a.onmouseenter = () => deleteButton.style.display = 'flex';
    a.onmouseleave = () => deleteButton.style.display = 'none';
    
    return a;
}

// Fonction pour afficher la boîte de dialogue d'ajout de lien
function showAddLinkDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'add-link-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>Add New Link</h3>
                <button class="close-dialog">×</button>
            </div>
            <div class="dialog-body">
                <div class="input-group">
                    <label for="linkUrl">URL</label>
                    <input type="text" id="linkUrl" placeholder="https://example.com" autocomplete="off" />
                </div>
                <div class="input-group">
                    <label for="linkTitle">Title</label>
                    <input type="text" id="linkTitle" placeholder="My Website" autocomplete="off" />
                </div>
            </div>
            <div class="dialog-buttons">
                <button class="cancel-button">Cancel</button>
                <button class="add-button">Add</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);

    // Focus sur le champ URL
    setTimeout(() => {
        dialog.querySelector('#linkUrl').focus();
    }, 100);
    
    // Gérer l'ajout du lien
    dialog.querySelector('.add-button').onclick = async () => {
        const url = dialog.querySelector('#linkUrl').value.trim();
        const title = dialog.querySelector('#linkTitle').value.trim();
        
        if (url) {
            await addSidebarLink(url, title);
            dialog.remove();
        } else {
            dialog.querySelector('#linkUrl').classList.add('error');
        }
    };
    
    // Gérer la fermeture
    dialog.querySelector('.close-dialog').onclick = () => dialog.remove();
    dialog.querySelector('.cancel-button').onclick = () => dialog.remove();

    // Fermer avec Echap
    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dialog.remove();
        }
    });

    // Validation en temps réel
    dialog.querySelector('#linkUrl').addEventListener('input', (e) => {
        e.target.classList.remove('error');
    });

    // Empêcher la fermeture lors du clic sur le contenu
    dialog.querySelector('.dialog-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Fermer lors du clic en dehors
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
}

// Remplacer les styles existants par ceux-ci
const styles = `
.add-link-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
}

.dialog-content {
    background: rgba(30, 34, 38, 0.95);
    width: 320px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: dialogAppear 0.3s ease;
}

@keyframes dialogAppear {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header h3 {
    margin: 0;
    color: white;
    font-size: 16px;
    font-weight: 500;
}

.close-dialog {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.close-dialog:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
}

.dialog-body {
    padding: 15px;
}

.input-group {
    margin-bottom: 12px;
}

.input-group label {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 6px;
    font-size: 13px;
}

.input-group input {
    width: calc(100% - 24px);
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: white;
    font-size: 13px;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.input-group input:focus {
    outline: none;
    border-color: #4285F4;
    background: rgba(255, 255, 255, 0.1);
}

.input-group input.error {
    border-color: #ff4444;
    animation: shake 0.3s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-buttons button {
    padding: 6px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 60px;
}

.add-button {
    background: #4285F4;
    color: white;
}

.add-button:hover {
    background: #5294ff;
    transform: translateY(-1px);
}

.cancel-button {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.cancel-button:hover {
    background: rgba(255, 255, 255, 0.15);
}

.dialog-buttons button:active {
    transform: translateY(1px);
}

/* Assure que les inputs utilisent border-box */
* {
    box-sizing: border-box;
}

/* Ajuste la taille maximale des inputs */
.input-group input {
    max-width: 100%;
    margin: 0;
}

/* Style pour le curseur personnalisé */
body.custom-cursor-enabled .add-link-dialog {
    cursor: auto !important;
}

body.custom-cursor-enabled .add-link-dialog .dialog-content {
    cursor: auto !important;
}

body.custom-cursor-enabled .add-link-dialog input,
body.custom-cursor-enabled .add-link-dialog button {
    cursor: pointer !important;
}
`;

// Ajouter les styles au document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Ajouter l'initialisation à l'événement DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... autres initialisations existantes ...
    initSidebarLinks();
});

// Fonction pour ajouter un nouveau lien
async function addSidebarLink(url, title) {
    // Ajouter le protocole si nécessaire
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    try {
        // Récupérer les liens existants
        const { sidebarLinks = defaultSidebarLinks } = await chrome.storage.local.get('sidebarLinks');
        
        // Vérifier si le lien existe déjà
        if (sidebarLinks.some(link => link.url === url)) {
            showNotification('This link already exists', 'error');
            return;
        }

        // Extraire le domaine principal pour l'icône
        const urlObj = new URL(url);
        const domain = urlObj.hostname.split('.').slice(-2).join('.');
        
        // Définir l'icône en fonction du domaine
        let iconUrl;
        if (domain === 'google.com') {
            // Gérer les services Google
            const subdomain = urlObj.hostname.split('.')[0];
            switch (subdomain) {
                case 'mail':
                    iconUrl = 'https://img.icons8.com/color/48/000000/gmail.png';
                    break;
                case 'drive':
                    iconUrl = 'https://img.icons8.com/color/48/000000/google-drive.png';
                    break;
                case 'docs':
                    iconUrl = 'https://img.icons8.com/color/48/000000/google-docs.png';
                    break;
                case 'calendar':
                    iconUrl = 'https://img.icons8.com/color/48/000000/google-calendar.png';
                    break;
                case 'meet':
                    iconUrl = 'https://img.icons8.com/color/48/000000/google-meet.png';
                    break;
                default:
                    iconUrl = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
            }
        } else {
            // Pour les autres domaines
            iconUrl = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
        }
        
        // Créer le nouveau lien
        const newLink = {
            url,
            title: title || urlObj.hostname,
            iconUrl
        };
        
        // Ajouter le nouveau lien
        const updatedLinks = [...sidebarLinks, newLink];
        await chrome.storage.local.set({ sidebarLinks: updatedLinks });
        
        // Mettre à jour l'affichage
        updateSidebarLinks(updatedLinks);
        showNotification('Link added successfully', 'success');
        
    } catch (error) {
        console.error('Error adding link:', error);
        showNotification('Error adding link', 'error');
    }
}

// Fonction pour supprimer un lien
async function removeSidebarLink(url) {
    try {
        const { sidebarLinks = defaultSidebarLinks } = await chrome.storage.local.get('sidebarLinks');
        const updatedLinks = sidebarLinks.filter(link => link.url !== url);
        await chrome.storage.local.set({ sidebarLinks: updatedLinks });
        updateSidebarLinks(updatedLinks);
        showNotification('Link removed successfully', 'success');
    } catch (error) {
        console.error('Error removing link:', error);
        showNotification('Error removing link', 'error');
    }
}


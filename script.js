function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
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
                Processeur ${index + 1}: ${usagePercentage}%
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
            RAM: ${memoryPercentage}% utilisé (${usedMemory.toFixed(1)}GB / ${totalMemory.toFixed(1)}GB)
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
                ${unit.name}: ${usagePercentage}% utilisé (${usedSpace.toFixed(1)}GB / ${totalSpace.toFixed(1)}GB)
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
            <p>${current.lang_fr ? current.lang_fr[0].value : current.weatherDesc[0].value}</p>
            <p>Humidité: ${current.humidity}%</p>
            <p>Vent: ${current.windspeedKmph} km/h</p>
        `;
    } catch (error) {
        console.error('Erreur météo:', error);
        document.getElementById('weather-info').innerHTML = `
            <div class="weather-error">
                <p>Impossible de charger la météo</p>
                <button onclick="updateWeather()">Réessayer</button>
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
                saveStatus.textContent = 'Sauvegardé !';
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

// Initialisation des nouvelles fonctionnalités
document.addEventListener('DOMContentLoaded', () => {
    updateWeather();
    setInterval(updateWeather, 300000); // Mise à jour toutes les 5 minutes
    initNotes();
});
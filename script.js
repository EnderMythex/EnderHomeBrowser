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
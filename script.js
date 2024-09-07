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
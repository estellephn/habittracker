// --- INITIALISATION DES DONNÉES ---
// On récupère les données stockées ou on initialise des tableaux vides
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let history = JSON.parse(localStorage.getItem('habitHistory')) || {};
let username = localStorage.getItem('username') || "";

// Date sélectionnée par défaut : Aujourd'hui (format YYYY-MM-DD)
let selectedDate = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', () => {
    // Configuration initiale de l'interface
    const datePicker = document.getElementById('date-picker');
    if (datePicker) {
        datePicker.value = selectedDate;
    }
    
    const nameInput = document.getElementById('username');
    if (nameInput) {
        nameInput.value = username;
        updateWelcome();
    }

    renderSetupList();
    renderDailyList();
    updateProgress();
});

// --- NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    // Rafraîchir les stats si on va sur l'onglet Stats
    if(pageId === 'stats') renderStats();
}

// --- ONGLET 1 : CONFIGURATION ---
function updateWelcome() {
    username = document.getElementById('username').value;
    localStorage.setItem('username', username);
    const welcomeTitle = document.querySelector('#page-setup h1');
    welcomeTitle.innerText = username ? `Salut, ${username} ! 🧡` : "Bienvenue ! 🧡";
}

function addHabit() {
    const input = document.getElementById('new-habit');
    const name = input.value.trim();
    
    if (name && !habits.includes(name)) {
        habits.push(name);
        input.value = "";
        saveAndRefresh();
    }
}

function removeHabit(index) {
    const habitToRemove = habits[index];
    habits.splice(index, 1);
    
    // Optionnel : on pourrait nettoyer l'historique ici, 
    // mais on le garde généralement pour ne pas fausser les stats passées.
    saveAndRefresh();
}

function renderSetupList() {
    const list = document.getElementById('habit-list-setup');
    list.innerHTML = habits.map((h, i) => `
        <li class="habit-item">
            <span>${h}</span>
            <span class="delete-btn" onclick="removeHabit(${i})">✖</span>
        </li>
    `).join('');
}

// --- ONGLET 2 : SUIVI QUOTIDIEN ---
function changeDate(date) {
    selectedDate = date;
    renderDailyList();
    updateProgress();
}

function renderDailyList() {
    const container = document.getElementById('habit-list-daily');
    const doneOnSelectedDate = history[selectedDate] || [];

    if (habits.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = habits.map((h) => `
        <div class="daily-habit-item">
            <input type="checkbox" ${doneOnSelectedDate.includes(h) ? 'checked' : ''} 
                   onchange="toggleHabit('${h}')">
            <span>${h}</span>
        </div>
    `).join('');
}

function toggleHabit(habitName) {
    // Si la date n'existe pas encore dans l'historique, on crée le tableau
    if (!history[selectedDate]) {
        history[selectedDate] = [];
    }
    
    const index = history[selectedDate].indexOf(habitName);
    
    if (index > -1) {
        // Déjà coché : on l'enlève
        history[selectedDate].splice(index, 1);
    } else {
        // Pas coché : on l'ajoute
        history[selectedDate].push(habitName);
    }
    
    saveData();
    updateProgress();
}

function updateProgress() {
    const progressCircle = document.getElementById('progress-circle');
    const progressText = document.getElementById('progress-text');
    
    if (habits.length === 0) {
        progressCircle.setAttribute('stroke-dasharray', `0, 100`);
        progressText.innerText = "0%";
        return;
    }

    const doneOnSelectedDate = history[selectedDate] || [];
    const percent = Math.round((doneOnSelectedDate.length / habits.length) * 100);
    
    // Mise à jour visuelle du cercle SVG (stroke-dasharray)
    progressCircle.setAttribute('stroke-dasharray', `${percent}, 100`);
    progressText.innerText = `${percent}%`;
}

// --- ONGLET 3 : STATISTIQUES ---
function renderStats() {
    const filter = document.getElementById('stats-filter').value;
    const display = document.getElementById('stats-display');
    
    const datesEnregistrees = Object.keys(history);
    let totalHabitudesRealisees = 0;
    
    // Calcul du total global
    datesEnregistrees.forEach(date => {
        totalHabitudesRealisees += history[date].length;
    });

    // Calcul de la moyenne
    const nbJours = datesEnregistrees.length;
    const moyenne = nbJours > 0 ? (totalHabitudesRealisees / nbJours).toFixed(1) : 0;

    display.innerHTML = `
        <div style="text-align: left;">
            <p><strong>Période :</strong> ${filter === 'week' ? '7 derniers jours' : filter === 'month' ? '30 derniers jours' : 'Année complète'}</p>
            <p><strong>Jours avec activité :</strong> ${nbJours}</p>
            <p><strong>Total d'habitudes validées :</strong> ${totalHabitudesRealisees}</p>
            <p><strong>Moyenne quotidienne :</strong> ${moyenne}</p>
        </div>
        <div style="margin-top:20px; font-size: 2rem;">
            ${moyenne >= 1 ? '🔥' : '⏳'}
        </div>
    `;
}

// --- PERSISTENCE DES DONNÉES ---
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitHistory', JSON.stringify(history));
}

function saveAndRefresh() {
    saveData();
    renderSetupList();
    renderDailyList();
    updateProgress();
}
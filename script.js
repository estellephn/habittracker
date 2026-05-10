// Données initiales
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let completedToday = JSON.parse(localStorage.getItem('completedToday')) || [];
let history = JSON.parse(localStorage.getItem('habitHistory')) || {};
let lastDate = localStorage.getItem('lastDate') || new Date().toLocaleDateString();

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkDateChange();
    renderSetupList();
    renderDailyList();
    updateDateDisplay();
    updateProgress();
});

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    if(pageId === 'stats') renderStats();
}

// --- LOGIQUE SETUP ---
function addHabit() {
    const input = document.getElementById('new-habit');
    if (input.value.trim() !== "") {
        habits.push(input.value.trim());
        input.value = "";
        saveAndRefresh();
    }
}

function removeHabit(index) {
    habits.splice(index, 1);
    saveAndRefresh();
}

function renderSetupList() {
    const list = document.getElementById('habit-list-setup');
    list.innerHTML = habits.map((h, i) => `
        <li class="habit-item">
            ${h} <span class="delete-btn" onclick="removeHabit(${i})">✖</span>
        </li>
    `).join('');
}

// --- LOGIQUE QUOTIDIENNE ---
function updateDateDisplay() {
    document.getElementById('current-date').innerText = lastDate;
}

function renderDailyList() {
    const container = document.getElementById('habit-list-daily');
    container.innerHTML = habits.map((h) => `
        <div class="daily-habit-item">
            <input type="checkbox" ${completedToday.includes(h) ? 'checked' : ''} 
                   onchange="toggleHabit('${h}')">
            <span>${h}</span>
        </div>
    `).join('');
}

function toggleHabit(habitName) {
    if (completedToday.includes(habitName)) {
        completedToday = completedToday.filter(h => h !== habitName);
    } else {
        completedToday.push(habitName);
    }
    saveData();
    updateProgress();
}

function updateProgress() {
    if (habits.length === 0) return;
    const percent = Math.round((completedToday.length / habits.length) * 100);
    const circle = document.getElementById('progress-circle');
    circle.setAttribute('stroke-dasharray', `${percent}, 100`);
    document.getElementById('progress-text').innerText = `${percent}%`;
}

// --- LOGIQUE DE CHANGEMENT DE JOUR ---
function checkDateChange() {
    const today = new Date().toLocaleDateString();
    
    // Si on change de jour ET qu'au moins une tâche a été faite
    if (today !== lastDate && completedToday.length > 0) {
        // Sauvegarder dans l'historique
        history[lastDate] = {
            total: habits.length,
            done: completedToday.length
        };
        // Reset pour le nouveau jour
        lastDate = today;
        completedToday = [];
        saveData();
    } else if (today !== lastDate && completedToday.length === 0 && habits.length > 0) {
        alert("Coche au moins une habitude pour passer à la journée suivante !");
    }
}

// --- STATISTIQUES ---
function renderStats() {
    const filter = document.getElementById('stats-filter').value;
    const display = document.getElementById('stats-display');
    const totalDays = Object.keys(history).length;
    
    let sumDone = 0;
    Object.values(history).forEach(day => sumDone += day.done);

    display.innerHTML = `
        <p><strong>Total de jours suivis :</strong> ${totalDays}</p>
        <p><strong>Moyenne d'habitudes :</strong> ${totalDays > 0 ? (sumDone/totalDays).toFixed(1) : 0} / jour</p>
        <p style="color: var(--orange-apple)">Continue comme ça !</p>
    `;
}

// --- UTILS ---
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('completedToday', JSON.stringify(completedToday));
    localStorage.setItem('habitHistory', JSON.stringify(history));
    localStorage.setItem('lastDate', lastDate);
}

function saveAndRefresh() {
    saveData();
    renderSetupList();
    renderDailyList();
    updateProgress();
}
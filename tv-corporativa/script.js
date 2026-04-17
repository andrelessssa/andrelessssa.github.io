function navigate(page) {
    // Esconde todas as telas
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Mostra a tela desejada
    const target = document.getElementById('screen-' + page);
    if (target) {
        target.classList.add('active');
    }
    window.scrollTo(0, 0);
}

// Relógio em tempo real para a prévia da TV
function updateClock() {
    const el = document.getElementById('tv-clock');
    if (el) {
        const now = new Date();
        const h = String(now.getHours()).padStart(2,'0');
        const m = String(now.getMinutes()).padStart(2,'0');
        el.textContent = h + ':' + m;
    }
}

setInterval(updateClock, 1000);
updateClock();
// --- OPTIONEN ---
const SHOW_HOTEL_INFO = true; // Auf "false" setzen, um die Hotel-Meldung zu entfernen
// ----------------

let cardFlipped = false;

// Mikrofon initialisieren
async function initMic() {
    // UI umschalten
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 512;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function checkVolume() {
            if (cardFlipped) return; // Stop wenn Karte gedreht
            
            analyser.getByteFrequencyData(dataArray);
            let values = 0;
            for (let i = 0; i < dataArray.length; i++) {
                values += dataArray[i];
            }
            let average = values / dataArray.length;

            // Lautstärke-Schwelle fürs Pusten
            if (average > 90) { 
                flipCard();
            }
            requestAnimationFrame(checkVolume);
        }
        checkVolume();
    } catch (err) {
        console.warn("Mikrofon-Zugriff verweigert oder nicht möglich.");
        // Opa kann immer noch den Button benutzen
    }
}

// Karte drehen Funktion
function flipCard() {
    if (cardFlipped) return;
    cardFlipped = true;
    
    const card = document.getElementById('card');
    card.classList.add('flipped');

    // NH-Hotel Meldung logik
    if (SHOW_HOTEL_INFO) {
        const hasSeen = localStorage.getItem('hotelMessageShown');
        if (!hasSeen) {
            // Zeige Meldung nach 2 Sekunden (wenn die Dreh-Animation fertig ist)
            setTimeout(() => {
                document.getElementById('hotel-modal').classList.remove('hidden');
            }, 2000);
        }
    }
}

// Meldung schließen & im Speicher merken
function closeModal() {
    document.getElementById('hotel-modal').classList.add('hidden');
    localStorage.setItem('hotelMessageShown', 'true');
}

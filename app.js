const form = document.getElementById('ratingForm');
const strainList = document.getElementById('strainList');
let strains = JSON.parse(localStorage.getItem('strains')) || []; // Daten aus localStorage abrufen oder leeres Array initialisieren
let editingIndex = null; // Index des zu bearbeitenden Strains verfolgen

// Anzeige der gespeicherten Strains
displayStrains();

// Formular-Submit-Event
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const strain = formData.get('strain');
    const strainType = formData.get('strainType');
    const taste = parseFloat(formData.get('taste')) || 0;
    const consistency = parseFloat(formData.get('consistency')) || 0;
    const smell = parseFloat(formData.get('smell')) || 0;
    const effect = parseFloat(formData.get('effect')) || 0;

    const avgRating = parseFloat(((taste + consistency + smell + effect) / 4).toFixed(2));

    const strainData = {
        name: strain,
        type: strainType,
        ratings: { taste, consistency, smell, effect },
        avgRating: avgRating
    };

    if (editingIndex !== null) {
        // Aktualisieren des bestehenden Strains
        strains[editingIndex] = strainData;
        editingIndex = null;
    } else {
        // Hinzufügen eines neuen Strains
        strains.push(strainData);
        strains.sort((a, b) => b.avgRating - a.avgRating); // Sortieren nach Bewertung
    }

    // Speichern der aktualisierten Strains in localStorage
    localStorage.setItem('strains', JSON.stringify(strains));

    displayStrains(); // Aktualisieren der Anzeige
    form.reset(); // Formular zurücksetzen
});

// Anzeige der Strains
function displayStrains() {
    strainList.innerHTML = ''; // Aktuelle Liste leeren
    const fragment = document.createDocumentFragment();
    
    strains.forEach((strain, index) => {
        const strainItem = document.createElement('div');
        strainItem.className = 'strain-item';
        strainItem.id = `strain-${index}`;

new-column-strain-type
        // Erstellen der Radial Progress Bar

        const radialProgress = document.createElement('div');
        radialProgress.className = 'radial-progress';

        radialProgress.innerHTML = `
            <div class="inner">
                <div id="number">${strain.avgRating.toFixed(2)}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    <linearGradient id="GradientColor">
                        <stop offset="0%" stop-color="#DA22FF" />
                        <stop offset="100%" stop-color="#9733EE" />
                    </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="70" stroke-linecap="round" />
            </svg>
        `;

        // Inhalt des Strain-Items
        const strainContent = `
            <div class="strain-details">
                <h3>${strain.name}</h3>
                <p>Type: ${strain.type || 'Not specified'}</p>
                <p>Taste: ${strain.ratings.taste}</p>
                <p>Consistency: ${strain.ratings.consistency}</p>
                <p>Smell: ${strain.ratings.smell}</p>
                <p>Effect: ${strain.ratings.effect}</p>
                <div class="strain-icons">
                    <span class="material-symbols-outlined share-icon" onclick="shareStrain(${index})">
                        share
                    </span>
                    <span class="material-symbols-outlined edit-icon" onclick="editStrain(${index})">
                        edit
                    </span>
                    <span class="material-symbols-outlined delete-icon" onclick="deleteStrain(${index})">
                        delete
                    </span>
                </div>
            </div>
        `;

        strainItem.innerHTML = strainContent;

        // Radial Progress Bar zum Strain-Item hinzufügen
        strainItem.appendChild(radialProgress);

        // Strain-Item zum Fragment hinzufügen
        fragment.appendChild(strainItem);

        // Radial Progress Bar initialisieren
        const strainContent = `
    <div class="strain-details">
        <h3>${strain.name}</h3>
        <p>Taste: ${strain.ratings.taste}</p>
        <p>Consistency: ${strain.ratings.consistency}</p>
        <p>Smell: ${strain.ratings.smell}</p>
        <p>Effect: ${strain.ratings.effect}</p>
        <div class="strain-icons">
            <span class="material-symbols-outlined share-icon" onclick="shareStrain(${index})">
                share
            </span>
            <span class="material-symbols-outlined edit-icon" onclick="editStrain(${index})">
                edit
            </span>
            <span class="material-symbols-outlined delete-icon" onclick="deleteStrain(${index})">
                delete
            </span>
        </div>
    </div>
`;

        strainItem.innerHTML = strainContent;

        // Append the radial progress bar to the strain item
        strainItem.appendChild(radialProgress);

        // Append the strain item to the fragment
        fragment.appendChild(strainItem);

        // Initialize the radial progress bar
        updateProgress(radialProgress, strain.avgRating);
    });

    strainList.appendChild(fragment);
}

// Funktion zur Aktualisierung der Radial Progress Bar
function updateProgress(element, rating) {
    const circle = element.querySelector('circle');
    const number = element.querySelector('#number');
    const maxRating = 5;
    const percentage = (rating / maxRating) * 100;
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * percentage) / 100;

    number.textContent = rating.toFixed(2);

    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = offset;
    
    // Farbe der Progress Bar basierend auf der Bewertung
    if (rating <= 1.0) {
        circle.style.stroke = 'darkred';
    } else if (rating <= 2.5) {
        circle.style.stroke = 'red';
    } else if (rating <= 3.5) {
        circle.style.stroke = 'orange';
    } else if (rating <= 4.5) {
        circle.style.stroke = 'limegreen';
    } else {
        circle.style.stroke = 'green';
    }
}

// Strain teilen
function shareStrain(index) {
    const strain = strains[index];
    if (navigator.share) {
        const shareText = `${strain.name} (Type: ${strain.type}, Avg. Rating: ${strain.avgRating.toFixed(2)})
Taste: ${strain.ratings.taste}
Consistency: ${strain.ratings.consistency}
Smell: ${strain.ratings.smell}
Effect: ${strain.ratings.effect}`;

// Share a strain
function shareStrain(index) {
    const strain = strains[index];
    if (navigator.share) {
        const shareText = `${strain.name} (Avg. Rating: ${strain.avgRating.toFixed(2)})\nTaste: ${strain.ratings.taste}\nConsistency: ${strain.ratings.consistency}\nSmell: ${strain.ratings.smell}\nEffect: ${strain.ratings.effect}`;
        
        navigator.share({
            title: `Strain Rating - ${strain.name}`,
            text: shareText,
        }).then(() => {
            console.log('Strain shared successfully.');
        }).catch((error) => {
            console.error('Error sharing strain:', error);
        });
    } else {
        alert('Sharing not supported on this browser.');
    }
}

// Strain bearbeiten
function editStrain(index) {
    const strain = strains[index];

    // Formular mit Strain-Daten füllen
    document.getElementById('strain').value = strain.name;
    document.getElementById('strainType').value = strain.type;
    document.getElementById('taste').value = strain.ratings.taste;
    document.getElementById('consistency').value = strain.ratings.consistency;
    document.getElementById('smell').value = strain.ratings.smell;
    document.getElementById('effect').value = strain.ratings.effect;

    editingIndex = index; // Index des zu bearbeitenden Strains setzen
}

// Strain löschen mit Bestätigung
function deleteStrain(index) {
    const confirmDelete = confirm("Are you sure you want to delete this strain?");
    if (confirmDelete) {
        strains.splice(index, 1); // Strain aus dem Array entfernen

        // Aktualisierung von localStorage nach dem Löschen
        localStorage.setItem('strains', JSON.stringify(strains));

        displayStrains(); // Aktualisieren der Anzeige
    }
}

// Menü öffnen und schließen
const menuIcon = document.getElementById('menuIcon');
const dropdownMenu = document.getElementById('dropdownMenu');

menuIcon.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Menü schließen, wenn außerhalb geklickt wird
document.addEventListener('click', (event) => {
    if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// Daten exportieren
document.getElementById('exportData').addEventListener('click', () => {
    const dataStr = JSON.stringify(strains, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'budstats-daten.json';
    a.click();
    URL.revokeObjectURL(url);

    // Menü schließen
    dropdownMenu.style.display = 'none';
});

// Daten importieren
document.getElementById('importData').addEventListener('click', () => {
    document.getElementById('importInput').click();
    // Menü schließen
    dropdownMenu.style.display = 'none';
});

document.getElementById('importInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (Array.isArray(importedData)) {
                const mergeData = confirm('Möchten Sie die importierten Daten mit Ihren vorhandenen Daten zusammenführen? Klicken Sie auf "Abbrechen", um Ihre aktuellen Daten zu überschreiben.');

                if (mergeData) {
                    // Daten zusammenführen
                    strains = strains.concat(importedData);

                    // Doppelte Einträge basierend auf dem Strain-Namen entfernen
                    strains = strains.filter((strain, index, self) =>
                        index === self.findIndex((s) => s.name === strain.name)
                    );
                } else {
                    // Daten überschreiben
                    strains = importedData;
                }

                // In localStorage speichern
                localStorage.setItem('strains', JSON.stringify(strains));

                // Anzeige aktualisieren
                displayStrains();
                alert('Daten wurden erfolgreich importiert!');
            } else {
                alert('Ungültiges Datenformat.');
            }
        } catch (error) {
            alert('Fehler beim Einlesen der JSON-Datei.');
        }
    };
    reader.readAsText(file);
});

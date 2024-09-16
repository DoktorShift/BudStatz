const form = document.getElementById('ratingForm');
const strainList = document.getElementById('strainList');
let strains = JSON.parse(localStorage.getItem('strains')) || []; // Retrieve strains from localStorage or initialize as an empty array
let editingIndex = null; // Track the index of the strain being edited

// Display stored strains if they exist in localStorage
displayStrains();

// Form submission event
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const strain = formData.get('strain');
    const type = formData.get('type');  // Hier wird das "Art" Feld verarbeitet
    const taste = parseFloat(formData.get('taste')) || 0;
    const consistency = parseFloat(formData.get('consistency')) || 0;
    const smell = parseFloat(formData.get('smell')) || 0;
    const effect = parseFloat(formData.get('effect')) || 0;

    const avgRating = parseFloat(((taste + consistency + smell + effect) / 4).toFixed(2));

    const strainData = {
        name: strain,
        type: type,  // "Art" zum Datenobjekt hinzufügen
        ratings: { taste, consistency, smell, effect },
        avgRating: avgRating
    };

    if (editingIndex !== null) {
        // Wenn wir bearbeiten, aktualisieren wir den Strain
        strains[editingIndex] = strainData;
        editingIndex = null; // Index zurücksetzen nach dem Bearbeiten
    } else {
        // Ansonsten einen neuen Strain hinzufügen
        strains.push(strainData);
        strains.sort((a, b) => b.avgRating - a.avgRating); // Strains nach Bewertung sortieren
    }

    // Speichere die aktualisierten Strains im LocalStorage
    localStorage.setItem('strains', JSON.stringify(strains));

    displayStrains(); // Aktualisierte Strains anzeigen
    form.reset(); // Formular zurücksetzen
});

// Strains anzeigen
function displayStrains() {
    strainList.innerHTML = ''; // Liste leeren
    const fragment = document.createDocumentFragment();
    
    strains.forEach((strain, index) => {
        const strainItem = document.createElement('div');
        strainItem.className = 'strain-item';
        strainItem.id = `strain-${index}`;
        strainItem.innerHTML = `
            <h3>${strain.name} (Avg. Rating: ${strain.avgRating})</h3>
            <p>Type: ${strain.type}</p> <!-- Zeigt das Feld "Art" an -->
            <p>Taste: ${strain.ratings.taste}</p>
            <p>Consistency: ${strain.ratings.consistency}</p>
            <p>Smell: ${strain.ratings.smell}</p>
            <p>Effect: ${strain.ratings.effect}</p>
            <span class="material-symbols-outlined share-icon" onclick="shareStrain(${index})">
                share
            </span>
            <span class="material-symbols-outlined edit-icon" onclick="editStrain(${index})">
                edit
            </span>
            <span class="material-symbols-outlined delete-icon" onclick="deleteStrain(${index})">
                delete
            </span>
        `;
        fragment.appendChild(strainItem);
    });

    strainList.appendChild(fragment);
}

// Einen Strain teilen
function shareStrain(index) {
    const strain = strains[index];
    if (navigator.share) {
        const shareText = `${strain.name} (Avg. Rating: ${strain.avgRating})\nType: ${strain.type}\nTaste: ${strain.ratings.taste}\nConsistency: ${strain.ratings.consistency}\nSmell: ${strain.ratings.smell}\nEffect: ${strain.ratings.effect}`;

        navigator.share({
            title: `Strain Rating - ${strain.name}`,
            text: shareText,
        }).then(() => {
            console.log('Strain erfolgreich geteilt.');
        }).catch((error) => {
            console.error('Fehler beim Teilen des Strains:', error);
        });
    } else {
        alert('Teilen wird in diesem Browser nicht unterstützt.');
    }
}

// Einen Strain bearbeiten
function editStrain(index) {
    const strain = strains[index];

    // Formular mit den Strain-Daten befüllen
    document.getElementById('strain').value = strain.name;
    document.getElementById('type').value = strain.type; // Feld "Art" befüllen
    document.getElementById('taste').value = strain.ratings.taste;
    document.getElementById('consistency').value = strain.ratings.consistency;
    document.getElementById('smell').value = strain.ratings.smell;
    document.getElementById('effect').value = strain.ratings.effect;

    editingIndex = index; // Index des zu bearbeitenden Strains setzen
}

// Einen Strain löschen mit Bestätigung
function deleteStrain(index) {
    const confirmDelete = confirm("Möchtest du diesen Strain wirklich löschen?");
    if (confirmDelete) {
        strains.splice(index, 1); // Strain aus dem Array entfernen

        // Aktualisiere LocalStorage nach dem Löschen
        localStorage.setItem('strains', JSON.stringify(strains));

        displayStrains(); // Liste aktualisieren
    }
}

const form = document.getElementById('ratingForm');
const strainList = document.getElementById('strainList');
let strains = JSON.parse(localStorage.getItem('strains')) || [];
let editingIndex = null;

// Zeige gespeicherte Strains an
displayStrains();

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const strain = formData.get('strain');
    const type = formData.get('type');  // Erfasse den Typ
    const taste = parseFloat(formData.get('taste')) || 0;
    const consistency = parseFloat(formData.get('consistency')) || 0;
    const smell = parseFloat(formData.get('smell')) || 0;
    const effect = parseFloat(formData.get('effect')) || 0;

    const avgRating = parseFloat(((taste + consistency + smell + effect) / 4).toFixed(2));

    const strainData = {
        name: strain,
        type: type,  // Füge den Typ zu den Daten hinzu
        ratings: { taste, consistency, smell, effect },
        avgRating: avgRating
    };

    if (editingIndex !== null) {
        strains[editingIndex] = strainData; // Bearbeiten des Strains
        editingIndex = null;
    } else {
        strains.push(strainData);  // Neuen Strain hinzufügen
        strains.sort((a, b) => b.avgRating - a.avgRating);
    }

    // Speichere die Strains in localStorage
    localStorage.setItem('strains', JSON.stringify(strains));

    displayStrains(); // Liste der Strains aktualisieren
    form.reset(); // Formular zurücksetzen
});

function displayStrains() {
    strainList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    strains.forEach((strain, index) => {
        const strainItem = document.createElement('div');
        strainItem.className = 'strain-item';
        strainItem.id = `strain-${index}`;
        strainItem.innerHTML = `
            <h3>${strain.name} (Avg. Rating: ${strain.avgRating})</h3>
            <p>Type: ${strain.type}</p> <!-- Zeige den Typ an -->
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

// Teilen eines Strains
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

// Bearbeiten eines Strains
function editStrain(index) {
    const strain = strains[index];

    // Formular mit Daten des Strains füllen
    document.getElementById('strain').value = strain.name;
    document.getElementById('type').value = strain.type; // Typ ausfüllen
    document.getElementById('taste').value = strain.ratings.taste;
    document.getElementById('consistency').value = strain.ratings.consistency;
    document.getElementById('smell').value = strain.ratings.smell;
    document.getElementById('effect').value = strain.ratings.effect;

    editingIndex = index; // Setze den Index des zu bearbeitenden Strains
}

// Löschen eines Strains
function deleteStrain(index) {
    const confirmDelete = confirm("Möchtest du diesen Strain wirklich löschen?");
    if (confirmDelete) {
        strains.splice(index, 1); // Strain aus Array löschen

        // Aktualisiere localStorage nach dem Löschen
        localStorage.setItem('strains', JSON.stringify(strains));

        displayStrains(); // Liste der Strains aktualisieren
    }
}

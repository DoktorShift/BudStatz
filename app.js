const form = document.getElementById('ratingForm');
const strainList = document.getElementById('strainList');
let strains = JSON.parse(localStorage.getItem('strains')) || []; // Hole Strains aus dem Local Storage oder initialisiere als leeres Array

// Zeige vorhandene Strains an, wenn sie im Local Storage gespeichert sind
displayStrains();

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const strain = formData.get('strain');
    const taste = parseFloat(formData.get('taste')) || 0;
    const consistency = parseFloat(formData.get('consistency')) || 0;
    const smell = parseFloat(formData.get('smell')) || 0;
    const effect = parseFloat(formData.get('effect')) || 0;

    const avgRating = parseFloat(((taste + consistency + smell + effect) / 4).toFixed(2));

    strains.push({
        name: strain,
        ratings: { taste, consistency, smell, effect },
        avgRating: avgRating
    });

    strains.sort((a, b) => b.avgRating - a.avgRating);

    // Speichere Strains im Local Storage
    localStorage.setItem('strains', JSON.stringify(strains));

    displayStrains();
    form.reset();
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
            <p>Taste: ${strain.ratings.taste}</p>
            <p>Consistency: ${strain.ratings.consistency}</p>
            <p>Smell: ${strain.ratings.smell}</p>
            <p>Effect: ${strain.ratings.effect}</p>
            <span class="material-symbols-outlined share-icon" onclick="shareStrain(${index})">
                share
            </span>
            <span class="material-symbols-outlined delete-icon" onclick="deleteStrain(${index})">
                delete
            </span>
        `;
        fragment.appendChild(strainItem);
    });

    strainList.appendChild(fragment);
}

function shareStrain(index) {
    const strain = strains[index];
    if (navigator.share) {
        const shareText = `${strain.name} (Avg. Rating: ${strain.avgRating})\nTaste: ${strain.ratings.taste}\nConsistency: ${strain.ratings.consistency}\nSmell: ${strain.ratings.smell}\nEffect: ${strain.ratings.effect}`;

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

function deleteStrain(index) {
    strains.splice(index, 1); // Entfernt den Strain aus dem Array

    // Aktualisiere Local Storage nach dem Löschen
    localStorage.setItem('strains', JSON.stringify(strains));

    displayStrains(); // Aktualisiert die Liste der Strains
}

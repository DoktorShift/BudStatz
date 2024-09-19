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
    const taste = parseFloat(formData.get('taste')) || 0;
    const consistency = parseFloat(formData.get('consistency')) || 0;
    const smell = parseFloat(formData.get('smell')) || 0;
    const effect = parseFloat(formData.get('effect')) || 0;

    const avgRating = parseFloat(((taste + consistency + smell + effect) / 4).toFixed(2));

    const strainData = {
        name: strain,
        ratings: { taste, consistency, smell, effect },
        avgRating: avgRating
    };

    if (editingIndex !== null) {
        // If we're editing, update the strain
        strains[editingIndex] = strainData;
        editingIndex = null; // Reset the index after editing
    } else {
        // Otherwise, add a new strain
        strains.push(strainData);
        strains.sort((a, b) => b.avgRating - a.avgRating); // Sort strains by rating
    }

    // Save updated strains to localStorage
    localStorage.setItem('strains', JSON.stringify(strains));

    displayStrains(); // Refresh displayed strains
    form.reset(); // Reset the form
});

// Display strains
function displayStrains() {
    strainList.innerHTML = ''; // Clear current list
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

// Share a strain
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

// Edit a strain
function editStrain(index) {
    const strain = strains[index];

    // Populate the form with the strain data
    document.getElementById('strain').value = strain.name;
    document.getElementById('taste').value = strain.ratings.taste;
    document.getElementById('consistency').value = strain.ratings.consistency;
    document.getElementById('smell').value = strain.ratings.smell;
    document.getElementById('effect').value = strain.ratings.effect;

    editingIndex = index; // Set the index of the strain being edited
}

// Delete a strain with confirmation
function deleteStrain(index) {
    const confirmDelete = confirm("Are you sure you want to delete this strain?");
    if (confirmDelete) {
        strains.splice(index, 1); // Remove the strain from the array

        // Update localStorage after deletion
        localStorage.setItem('strains', JSON.stringify(strains));

        displayStrains(); // Refresh the displayed list
    }
}

// Add radial progress function
document.addEventListener("DOMContentLoaded", function () {
    function updateProgress(rating) {
        const circle = document.querySelector('circle');
        const number = document.getElementById('number');
        const percentage = (rating / 5) * 100;
        const offset = 450 - (450 * percentage) / 100;

        // Setze den Text in der Mitte mit zwei Dezimalstellen
        number.textContent = rating.toFixed(2);

        // Update den Kreis und die Farbe entsprechend der Bewertung
        circle.style.strokeDashoffset = offset;

        if (rating <= 1.0) {
            circle.style.stroke = 'darkred'; // Tiefrot
        } else if (rating <= 2.5) {
            circle.style.stroke = 'red'; // Rötlich
        } else if (rating <= 3.5) {
            circle.style.stroke = 'orange'; // Orangeton
        } else if (rating <= 4.5) {
            circle.style.stroke = 'limegreen'; // Limegrün
        } else {
            circle.style.stroke = 'green'; // Grün
        }
    }

    // Beispiel: Setze die Bewertung auf 3.75
    updateProgress(3.75);
});

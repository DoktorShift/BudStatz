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
    const type = formData.get('type');  // Add the type field
    const taste = parseFloat(formData.get('taste')) || 0;
    const consistency = parseFloat(formData.get('consistency')) || 0;
    const smell = parseFloat(formData.get('smell')) || 0;
    const effect = parseFloat(formData.get('effect')) || 0;

    const avgRating = parseFloat(((taste + consistency + smell + effect) / 4).toFixed(2));

    const strainData = {
        name: strain,
        type: type,  // Add type to the data
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
            <p>Type: ${strain.type}</p> <!-- Show the strain type -->
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
        const shareText = `${strain.name} (Avg. Rating: ${strain.avgRating})\nType: ${strain.type}\nTaste: ${strain.ratings.taste}\nConsistency: ${strain.ratings.consistency}\nSmell: ${strain.ratings.smell}\nEffect: ${strain.ratings.effect}`;

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
    document.getElementById('type').value = strain.type; // Populate the type field
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

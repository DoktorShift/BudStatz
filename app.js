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
    const strainType = formData.get('strainType'); // New line to get strain type
    const taste = parseFloat(formData.get('taste')) || 0;
    const consistency = parseFloat(formData.get('consistency')) || 0;
    const smell = parseFloat(formData.get('smell')) || 0;
    const effect = parseFloat(formData.get('effect')) || 0;

    const avgRating = parseFloat(((taste + consistency + smell + effect) / 4).toFixed(2));

    const strainData = {
        name: strain,
        type: strainType, // Include strain type
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

        // Create the radial progress bar element
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

        // Create the content of the strain item
        const strainContent = `
            <div class="strain-details">
                <h3>${strain.name}</h3>
                <p>Type: ${strain.type || 'Not specified'}</p> <!-- Display strain type -->
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

// Function to update the radial progress bar
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

    // Update the circle's stroke color based on the rating
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

// Share a strain
function shareStrain(index) {
    const strain = strains[index];
    if (navigator.share) {
        const shareText = `${strain.name} (Type: ${strain.type}, Avg. Rating: ${strain.avgRating.toFixed(2)})
Taste: ${strain.ratings.taste}
Consistency: ${strain.ratings.consistency}
Smell: ${strain.ratings.smell}
Effect: ${strain.ratings.effect}`;

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
    document.getElementById('strainType').value = strain.type; // Pre-fill strain type
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

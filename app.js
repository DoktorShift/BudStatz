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

        // Create the radial progress bar element
        const radialProgress = document.createElement('div');
        radialProgress.className = 'radial-progress';
        radialProgress.setAttribute('data-percentage', strain.avgRating);

        radialProgress.innerHTML = `
            <div class="circle">
                <div class="mask full">
                    <div class="fill"></div>
                </div>
                <div class="mask half">
                    <div class="fill"></div>
                    <div class="fill fix"></div>
                </div>
            </div>
            <div class="inset">
                <div class="percentage">${strain.avgRating * 20}%</div>
            </div>
        `;

        // Create the content of the strain item
        const strainContent = `
            <h3>${strain.name}</h3>
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

        strainItem.innerHTML = strainContent;

        // Append the radial progress bar to the strain item
        strainItem.appendChild(radialProgress);

        // Append the strain item to the fragment
        fragment.appendChild(strainItem);

        // Initialize the radial progress bar
        setRadialProgress(radialProgress, strain.avgRating * 20); // Multiply by 20 to convert to percentage (since ratings are out of 5)
    });

    strainList.appendChild(fragment);
}

// Function to initialize the radial progress bar
function setRadialProgress(element, percentage) {
    const fill = element.querySelector('.fill');
    const fillFix = element.querySelector('.fill.fix');
    const maskFull = element.querySelector('.mask.full');
    const maskHalf = element.querySelector('.mask.half');

    if (percentage > 50) {
        fill.style.transform = 'rotate(180deg)';
        fillFix.style.transform = `rotate(${(percentage - 50) * 3.6}deg)`;
        maskFull.style.display = 'block';
        maskHalf.style.display = 'none';
    } else {
        fill.style.transform = `rotate(${percentage * 3.6}deg)`;
        fillFix.style.transform = 'rotate(0deg)';
        maskFull.style.display = 'none';
        maskHalf.style.display = 'block';
    }

    // Prozentsatz anzeigen
    const percentageElement = element.querySelector('.percentage');
    percentageElement.textContent = `${percentage}%`;
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

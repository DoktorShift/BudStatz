<script>
        const form = document.getElementById('ratingForm');
        const strainList = document.getElementById('strainList');
        let strains = [];

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const strain = formData.get('strain');
            const taste = parseFloat(formData.get('taste'));
            const consistency = parseFloat(formData.get('consistency'));
            const smell = parseFloat(formData.get('smell'));
            const effect = parseFloat(formData.get('effect'));

            const avgRating = ((taste + consistency + smell + effect) / 4).toFixed(2);

            strains.push({
                name: strain,
                ratings: { taste, consistency, smell, effect },
                avgRating: parseFloat(avgRating)
            });

            strains.sort((a, b) => b.avgRating - a.avgRating);

            displayStrains();
            form.reset();
        });

        function displayStrains() {
            strainList.innerHTML = '';

            strains.forEach((strain, index) => {
                const strainItem = `
                    <div class="strain-item" id="strain-${index}">
                        <h3>${strain.name} (Avg. Rating: ${strain.avgRating})</h3>
                        <p>Taste: ${strain.ratings.taste}</p>
                        <p>Consistency: ${strain.ratings.consistency}</p>
                        <p>Smell: ${strain.ratings.smell}</p>
                        <p>Effect: ${strain.ratings.effect}</p>
                        <span class="material-symbols-outlined share-icon" onclick="shareStrain(${index})">
                            share
                        </span>
                    </div>
                `;
                strainList.innerHTML += strainItem;
            });
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
    </script>

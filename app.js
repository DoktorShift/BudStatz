/******************************************/
/**         DEMO DATA + GLOBALS          **/
/******************************************/
let stores = ["Green Store", "Herbal Haven"];
let allStrains = [
  {
    id: "1",
    name: "Purple Haze",
    type: "Sativa",
    taste: 8.5,
    consistency: 7.5,
    smell: 9.0,
    effect: 8.0,
    store: "Green Store",
    photo: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    name: "OG Kush",
    type: "Hybrid",
    taste: 9.0,
    consistency: 8.5,
    smell: 8.0,
    effect: 9.5,
    store: "Herbal Haven",
    photo: "/placeholder.svg?height=400&width=600",
  },
];

// "viewMode" can be 'all' or 'by-store'
let viewMode = "by-store";

/******************************************/
/**          ON LOAD INIT                **/
/******************************************/
document.addEventListener("DOMContentLoaded", () => {
  initSideSheet();
  renderStoreButtons();

  renderAddStrainForm();
  renderStoreView();

  initDataActions();
});

/******************************************/
/**            SIDE SHEET LOGIC          **/
/******************************************/
function initSideSheet() {
  const sheetTrigger = document.getElementById("sheetTrigger");
  const sideSheet = document.getElementById("sideSheet");
  const closeBtn = document.getElementById("closeSheetBtn");

  sheetTrigger.addEventListener("click", () => {
    sideSheet.classList.add("show");
  });
  closeBtn.addEventListener("click", () => {
    sideSheet.classList.remove("show");
  });

  // close if user clicks outside the sheet
  document.addEventListener("click", (event) => {
    if (!sideSheet.contains(event.target) && !sheetTrigger.contains(event.target)) {
      sideSheet.classList.remove("show");
    }
  });
}

/******************************************/
/**         STORE SELECTOR LOGIC         **/
/******************************************/
function renderStoreButtons() {
  const container = document.getElementById("storeButtons");
  container.innerHTML = "";
  stores.forEach((store) => {
    const btn = document.createElement("button");
    btn.className =
      "border border-emerald-200 rounded px-2 py-1 flex items-center gap-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-800";
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 7l1 12a2 2 0 002 2h12a2 2 0 002-2l1-12H3z" />
      </svg>
      ${store}
    `;
    container.appendChild(btn);
  });

  // add store button
  const addStoreBtn = document.getElementById("addStoreButton");
  const newStoreInput = document.getElementById("newStoreInput");
  addStoreBtn.onclick = () => {
    const val = newStoreInput.value.trim();
    if (!val) return;
    stores.push(val);
    newStoreInput.value = "";
    renderStoreButtons();
  };
}

/******************************************/
/**         ADD STRAIN FORM              **/
/******************************************/
function renderAddStrainForm() {
  const container = document.getElementById("addStrainFormContainer");
  container.innerHTML = "";

  const formCard = document.createElement("div");
  formCard.className = "backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 p-4 rounded";

  formCard.innerHTML = `
    <h2 class="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-4">
      Add New Strain
    </h2>
    <form id="strainForm" class="space-y-6">
      <!-- name -->
      <div class="space-y-2">
        <label for="strainName" class="font-medium">Strain Name</label>
        <input
          type="text"
          id="strainName"
          class="w-full border border-emerald-200 focus:border-emerald-500 rounded p-2"
          required
        />
      </div>
      <!-- type -->
      <div class="space-y-2">
        <label for="strainType" class="font-medium">Strain Type</label>
        <select
          id="strainType"
          class="w-full border border-emerald-200 focus:border-emerald-500 rounded p-2"
          required
        >
          <option value="" disabled selected hidden>Select type</option>
          <option value="indica">Indica</option>
          <option value="sativa">Sativa</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>
      <!-- store -->
      <div class="space-y-2">
        <label for="strainStore" class="font-medium">Store</label>
        <select
          id="strainStore"
          class="w-full border border-emerald-200 focus:border-emerald-500 rounded p-2"
          required
        >
          <option value="" disabled selected hidden>Select store</option>
          ${
            stores
              .map((s) => `<option value="${s}">${s}</option>`)
              .join("")
          }
        </select>
      </div>
      <!-- taste, consistency, smell, effect -->
      ${["taste","consistency","smell","effect"].map(attr => `
      <div class="space-y-2">
        <label class="capitalize">${attr} (0-10)</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          id="${attr}"
          class="w-full"
          value="5"
        />
        <div class="text-right text-sm text-gray-500" id="${attr}Value">5</div>
      </div>
      `).join("")}
      <!-- photo -->
      <div class="space-y-2">
        <label class="font-medium">Strain Photo (optional)</label>
        <input
          type="file"
          id="strainPhoto"
          accept="image/*"
          class="border border-emerald-200 focus:border-emerald-500 rounded p-2"
        />
      </div>
      <!-- submit -->
      <button
        type="submit"
        class="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded py-2 font-semibold"
      >
        Add Strain
      </button>
    </form>
  `;

  container.appendChild(formCard);

  // handle dynamic slider values
  ["taste","consistency","smell","effect"].forEach((attr) => {
    const range = formCard.querySelector(`#${attr}`);
    const valSpan = formCard.querySelector(`#${attr}Value`);
    range.addEventListener("input", () => {
      valSpan.textContent = range.value;
    });
  });

  // handle form submit
  const strainForm = formCard.querySelector("#strainForm");
  const strainPhotoInput = formCard.querySelector("#strainPhoto");

  strainForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newStrain = {
      id: Date.now().toString(),
      name: strainForm.querySelector("#strainName").value.trim(),
      type: strainForm.querySelector("#strainType").value,
      taste: parseFloat(strainForm.querySelector("#taste").value),
      consistency: parseFloat(strainForm.querySelector("#consistency").value),
      smell: parseFloat(strainForm.querySelector("#smell").value),
      effect: parseFloat(strainForm.querySelector("#effect").value),
      store: strainForm.querySelector("#strainStore").value,
      photo: null,
    };

    // read the file if any
    const file = strainPhotoInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newStrain.photo = ev.target?.result;
        addNewStrain(newStrain);
      };
      reader.readAsDataURL(file);
    } else {
      addNewStrain(newStrain);
    }

    function addNewStrain(strainObj) {
      allStrains.push(strainObj);
      // reset
      strainForm.reset();
      ["taste","consistency","smell","effect"].forEach((attr) => {
        formCard.querySelector(`#${attr}Value`).textContent = "5";
      });
      // re-render
      renderStoreView();
    }
  });
}

/******************************************/
/**          STORE VIEW LOGIC            **/
/******************************************/
function renderStoreView() {
  const container = document.getElementById("storeViewContainer");
  container.innerHTML = "";

  // Buttons for "all" or "by-store"
  const btnRow = document.createElement("div");
  btnRow.className = "flex justify-end gap-2";
  btnRow.innerHTML = `
    <button
      class="px-3 py-1 rounded ${viewMode === "all" ? "bg-emerald-500 text-white" : "border border-emerald-300"}"
      id="allViewBtn"
    >
      All Strains
    </button>
    <button
      class="px-3 py-1 rounded ${viewMode === "by-store" ? "bg-emerald-500 text-white" : "border border-emerald-300"}"
      id="byStoreViewBtn"
    >
      By Store
    </button>
  `;
  container.appendChild(btnRow);

  const allViewBtn = btnRow.querySelector("#allViewBtn");
  const byStoreViewBtn = btnRow.querySelector("#byStoreViewBtn");
  allViewBtn.addEventListener("click", () => {
    viewMode = "all";
    renderStoreView();
  });
  byStoreViewBtn.addEventListener("click", () => {
    viewMode = "by-store";
    renderStoreView();
  });

  if (viewMode === "all") {
    // show all in a grid
    const grid = document.createElement("div");
    grid.className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4";
    allStrains.forEach((s) => {
      grid.appendChild(createStrainCard(s));
    });
    container.appendChild(grid);
  } else {
    // group by store
    const grouped = groupStrainsByStore();
    Object.keys(grouped).forEach((store) => {
      const card = document.createElement("div");
      card.className = "bg-white/90 dark:bg-gray-900/90 rounded shadow overflow-hidden mb-4";

      // header
      const header = document.createElement("div");
      header.className =
        "cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center";
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 7l1 12a2 2 0 002 2h12a2 2 0 002-2l1-12H3z" />
          </svg>
          <span>${store}</span>
          <span class="text-sm text-gray-500">(${grouped[store].length})</span>
        </div>
        <span class="chevronIcon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      `;
      card.appendChild(header);

      const content = document.createElement("div");
      content.className = "px-4 py-2 max-h-0 overflow-hidden transition-all duration-200 ease-in-out";
      const grid = document.createElement("div");
      grid.className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2";
      grouped[store].forEach((s) => {
        grid.appendChild(createStrainCard(s));
      });
      content.appendChild(grid);
      card.appendChild(content);

      let expanded = false;
      header.addEventListener("click", () => {
        expanded = !expanded;
        if (expanded) {
          content.style.maxHeight = content.scrollHeight + "px";
          header.querySelector(".chevronIcon").innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" style="transform: rotate(180deg)">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7" />
            </svg>
          `;
        } else {
          content.style.maxHeight = "0px";
          header.querySelector(".chevronIcon").innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7" />
            </svg>
          `;
        }
      });

      container.appendChild(card);
    });
  }
}

function groupStrainsByStore() {
  const map = {};
  allStrains.forEach((s) => {
    if (!map[s.store]) map[s.store] = [];
    map[s.store].push(s);
  });
  return map;
}

/******************************************/
/**        STRAIN CARD (acc rating)      **/
/******************************************/
function createStrainCard(strain) {
  // accumulate rating
  const ratings = [strain.taste, strain.consistency, strain.smell, strain.effect];
  const accumulatedRating = parseFloat( (ratings.reduce((a,b)=>a+b,0) / ratings.length).toFixed(1) );

  // pick color gradient for the circle based on rating
  function getRatingColor(r) {
    if (r >= 8.5) return "from-emerald-500 to-green-500";
    if (r >= 7)   return "from-green-500 to-yellow-500";
    if (r >= 5)   return "from-yellow-500 to-orange-500";
    if (r >= 3)   return "from-orange-500 to-red-500";
    return         "from-red-500 to-rose-600";
  }
  const ratingColorClass = getRatingColor(accumulatedRating);

  const card = document.createElement("div");
  card.className = "relative group overflow-hidden hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 rounded";

  // rating badge (absolutely positioned)
  const badge = document.createElement("div");
  badge.className = `absolute -top-3 -right-3 z-10 w-16 h-16 rounded-full bg-gradient-to-br ${ratingColorClass} shadow-lg flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110`;
  badge.innerHTML = `<span class="text-xl font-bold text-white">${accumulatedRating}</span>`;
  card.appendChild(badge);

  // photo
  if (strain.photo) {
    const photoWrapper = document.createElement("div");
    photoWrapper.className = "relative h-48 w-full overflow-hidden cursor-pointer";
    const imgElem = document.createElement("img");
    imgElem.src = strain.photo;
    imgElem.alt = strain.name;
    imgElem.className = "object-cover w-full h-full transition-transform duration-300 group-hover:scale-105";
    photoWrapper.appendChild(imgElem);

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300";
    photoWrapper.appendChild(overlay);

    card.appendChild(photoWrapper);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "h-48 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600";
    placeholder.textContent = "No image available";
    card.appendChild(placeholder);
  }

  // content
  const contentDiv = document.createElement("div");
  contentDiv.className = "p-4";

  // header
  const headerDiv = document.createElement("div");
  headerDiv.className = "mb-2 flex justify-between items-center";
  headerDiv.innerHTML = `
    <span class="text-xl font-bold text-emerald-700 dark:text-emerald-300">${strain.name}</span>
    <span class="text-sm px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
      ${strain.type}
    </span>
  `;
  contentDiv.appendChild(headerDiv);

  // store, if any
  if (strain.store) {
    const storeLine = document.createElement("div");
    storeLine.className = "flex items-center gap-2 text-sm text-gray-500 mb-3";
    storeLine.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 7l1 12a2 2 0 002 2h12a2 2 0 002-2l1-12H3z" />
      </svg>
      ${strain.store}
    `;
    contentDiv.appendChild(storeLine);
  }

  // rating bars
  const ratingWrapper = document.createElement("div");
  ratingWrapper.className = "space-y-2";
  [
    { label: "Taste", value: strain.taste },
    { label: "Consistency", value: strain.consistency },
    { label: "Smell", value: strain.smell },
    { label: "Effect", value: strain.effect },
  ].forEach((r) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between group-hover:opacity-100 transition-opacity";
    row.innerHTML = `
      <span class="text-sm text-gray-600 dark:text-gray-400">${r.label}</span>
      <div class="flex items-center gap-2">
        <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r ${getRatingColor(r.value)}"
               style="width: ${(r.value / 10) * 100}%; transition: width 0.5s;">
          </div>
        </div>
        <span class="text-sm font-medium w-8 text-gray-500 group-hover:opacity-100 transition-opacity">
          ${r.value}
        </span>
      </div>
    `;
    ratingWrapper.appendChild(row);
  });
  contentDiv.appendChild(ratingWrapper);

  // action buttons row
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300";

  // share
  const shareBtn = document.createElement("button");
  shareBtn.className = "border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800";
  shareBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
         fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 12v.01M12 6v.01M20 12v.01M12 18v.01
                 M14.5 10.5L12 8l-2.5 2.5
                 M14.5 13.5L12 16l-2.5-2.5" />
    </svg>
  `;
  shareBtn.onclick = () => alert(`Share: ${strain.name} — not yet implemented.`);
  actionsDiv.appendChild(shareBtn);

  // edit
  const editBtn = document.createElement("button");
  editBtn.className = "border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800";
  editBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
         fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5h2M14.5 6.5l-4 4M4 20h16" />
    </svg>
  `;
  editBtn.onclick = () => alert(`Edit: ${strain.name} — stub action.`);
  actionsDiv.appendChild(editBtn);

  // delete
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "border border-gray-300 rounded p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800";
  deleteBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
            d="M9 13h6m2 9H7a2 2 0 01-2-2V7h14v13a2 2 0 01-2 2zM10 7l-1-3h6l-1 3" />
    </svg>
  `;
  deleteBtn.onclick = () => {
    if (confirm(`Delete strain "${strain.name}"?`)) {
      allStrains = allStrains.filter((x) => x.id !== strain.id);
      renderStoreView();
    }
  };
  actionsDiv.appendChild(deleteBtn);

  contentDiv.appendChild(actionsDiv);

  card.appendChild(contentDiv);
  return card;
}

/******************************************/
/**        IMPORT / EXPORT (STUB)        **/
/******************************************/
function initDataActions() {
  const exportBtn = document.getElementById("exportButton");
  const importBtn = document.getElementById("importButton");
  const importFile = document.getElementById("importFile");

  exportBtn.onclick = () => {
    // create JSON for stores + strains
    const dataStr = JSON.stringify({ stores, strains: allStrains }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "budstats-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  importBtn.onclick = () => {
    importFile.click();
  };

  importFile.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed.stores) || !Array.isArray(parsed.strains)) {
          alert("Invalid data format. Must have {stores, strains} arrays.");
          return;
        }
        if (confirm("Merge new data? (Cancel to overwrite)")) {
          // merge
          stores = Array.from(new Set([...stores, ...parsed.stores]));
          allStrains = [...allStrains, ...parsed.strains];
          // deduplicate by ID:
          const seen = new Set();
          allStrains = allStrains.filter((s) => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
        } else {
          // overwrite
          stores = parsed.stores;
          allStrains = parsed.strains;
        }
        renderStoreButtons();
        renderAddStrainForm();
        renderStoreView();
        alert("Data imported!");
      } catch (err) {
        console.error(err);
        alert("Error reading JSON file. Must be valid {stores, strains}.");
      }
    };
    reader.readAsText(file);
  });
}

/******************************************/
/**       GLOBAL DEMO DATA + STATE       **/
/******************************************/

// Attempt to load from localStorage, else use defaults
let savedStores = localStorage.getItem("budstats_stores");
let savedStrains = localStorage.getItem("budstats_strains");

// 1) We unify the "type" naming so form <select> uses "Sativa", "Indica", "Hybrid" capitalized
let stores = savedStores
  ? JSON.parse(savedStores)
  : ["Green Store", "Herbal Haven"];

let allStrains = savedStrains
  ? JSON.parse(savedStrains)
  : [
      {
        id: "1",
        name: "Purple Haze",
        // unify to capital "Sativa"
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

// "viewMode" can be "all" or "by-store"
let viewMode = "by-store";

// For editing a strain
let editingStrainId = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1) Show loading screen for ~2 seconds
  setTimeout(() => {
    // Hide loading
    document.getElementById("loadingScreen").style.display = "none";
    // Show app
    document.getElementById("appContainer").classList.remove("hidden");
  }, 2000);

  // 2) Initialize everything
  initSideSheet();
  renderStoreButtons();
  renderAddStrainForm();
  renderStoreView();
  initDataActions();
  initImageModal();
});

/******************************************/
/**           SIDE SHEET LOGIC           **/
/******************************************/
function initSideSheet() {
  const sheetTrigger = document.getElementById("sheetTrigger");
  const sideSheet = document.getElementById("sideSheet");
  const closeSheetBtn = document.getElementById("closeSheetBtn");

  sheetTrigger.addEventListener("click", () => {
    sideSheet.classList.add("show");
  });
  closeSheetBtn.addEventListener("click", () => {
    sideSheet.classList.remove("show");
  });

  // close if user clicks outside
  document.addEventListener("click", (e) => {
    if (!sideSheet.contains(e.target) && !sheetTrigger.contains(e.target)) {
      sideSheet.classList.remove("show");
    }
  });
}

/******************************************/
/**        STORE SELECTOR (SHEET)        **/
/******************************************/
function renderStoreButtons() {
  const container = document.getElementById("storeButtons");
  container.innerHTML = "";

  stores.forEach((store) => {
    // each store is a small "chip" with a delete button
    const storeItem = document.createElement("div");
    storeItem.className = "store-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "store-name";
    nameSpan.textContent = store;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-store-btn";
    delBtn.innerHTML = "&times;";
    delBtn.title = "Delete this store";
    delBtn.onclick = () => {
      if (confirm(`Remove store "${store}" from the list?`)) {
        // Remove from local array
        stores = stores.filter((s) => s !== store);
        // Save to localStorage
        localStorage.setItem("budstats_stores", JSON.stringify(stores));
        // Re-render
        renderStoreButtons();
        renderAddStrainForm();
      }
    };

    storeItem.appendChild(nameSpan);
    storeItem.appendChild(delBtn);
    container.appendChild(storeItem);
  });

  // Add store
  const addStoreBtn = document.getElementById("addStoreButton");
  const newStoreInput = document.getElementById("newStoreInput");
  addStoreBtn.onclick = () => {
    const val = newStoreInput.value.trim();
    if (!val) return;
    stores.push(val);
    localStorage.setItem("budstats_stores", JSON.stringify(stores));
    newStoreInput.value = "";
    // Re-render store list + form
    renderStoreButtons();
    renderAddStrainForm();
  };
}

/******************************************/
/**         ADD/EDIT STRAIN FORM         **/
/******************************************/
function renderAddStrainForm() {
  const container = document.getElementById("addStrainFormContainer");
  container.innerHTML = "";

  const formDiv = document.createElement("div");
  formDiv.className = "form-card";

  // If editing, rename the heading
  const headingText = editingStrainId ? "Edit Strain" : "Add New Strain";

  formDiv.innerHTML = `
    <h2>${headingText}</h2>
    <form id="strainForm">
      <!-- Strain Name -->
      <div class="add-form-group">
        <label>Strain Name</label>
        <input type="text" id="strainName" required />
      </div>

      <!-- Strain Type -->
      <div class="add-form-group">
        <label>Strain Type</label>
        <select id="strainType" required>
          <option value="" disabled selected hidden>Select type</option>
          <option value="Indica">Indica</option>
          <option value="Indica">Indica dominant</option>
          <option value="Sativa">Sativa</option>
          <option value="Sativa">Sativa dominant</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      <!-- Store -->
      <div class="add-form-group">
        <label>Store</label>
        <select id="strainStore" required>
          <option value="" disabled selected hidden>Select store</option>
          ${stores.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
      </div>

      <!-- taste, consistency, smell, effect -->
      ${["taste","consistency","smell","effect"].map(attr => `
      <div class="add-form-group">
        <label>${attr.charAt(0).toUpperCase() + attr.slice(1)} (0-10)</label>
        <input type="range" min="0" max="10" step="0.5" id="${attr}" value="5" />
        <div class="range-value" id="${attr}Value">5</div>
      </div>`).join("")}

      <!-- Photo -->
      <div class="add-form-group">
        <label>Strain Photo (optional)</label>
        <input type="file" id="strainPhoto" accept="image/*" />
      </div>

      <!-- Submit -->
      <button type="submit" class="add-form-submit" id="submitBtn">
        ${editingStrainId ? "Save Changes" : "Add Strain"}
      </button>
    </form>
  `;

  container.appendChild(formDiv);

  // dynamic range value updates
  ["taste","consistency","smell","effect"].forEach((attr) => {
    const range = formDiv.querySelector(`#${attr}`);
    const valSpan = formDiv.querySelector(`#${attr}Value`);
    range.addEventListener("input", () => {
      valSpan.textContent = range.value;
    });
  });

  // handle form submit
  const strainForm = formDiv.querySelector("#strainForm");
  const photoInput = formDiv.querySelector("#strainPhoto");
  const submitBtn = formDiv.querySelector("#submitBtn");

  // If in editing mode, fill the fields from existing data
  if (editingStrainId) {
    const existing = allStrains.find((s) => s.id === editingStrainId);
    if (existing) {
      strainForm.querySelector("#strainName").value = existing.name;
      strainForm.querySelector("#strainType").value = existing.type;
      strainForm.querySelector("#strainStore").value = existing.store;
      ["taste","consistency","smell","effect"].forEach((attr) => {
        strainForm.querySelector(`#${attr}`).value = existing[attr];
        formDiv.querySelector(`#${attr}Value`).textContent = existing[attr];
      });
    }
  }

  strainForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // create or replace strain
    const newOrEditedStrain = {
      id: editingStrainId ? editingStrainId : Date.now().toString(),
      name: strainForm.querySelector("#strainName").value.trim(),
      type: strainForm.querySelector("#strainType").value,
      store: strainForm.querySelector("#strainStore").value,
      taste: parseFloat(strainForm.querySelector("#taste").value),
      consistency: parseFloat(strainForm.querySelector("#consistency").value),
      smell: parseFloat(strainForm.querySelector("#smell").value),
      effect: parseFloat(strainForm.querySelector("#effect").value),
      photo: null,
    };

    // If there's a photo
    const file = photoInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        newOrEditedStrain.photo = ev.target?.result; // base64
        finalize(newOrEditedStrain);
      };
      reader.readAsDataURL(file);
    } else {
      // If editing and no new photo was chosen, keep old photo
      if (editingStrainId) {
        const old = allStrains.find((s) => s.id === editingStrainId);
        if (old?.photo) {
          newOrEditedStrain.photo = old.photo;
        }
      }
      finalize(newOrEditedStrain);
    }

    function finalize(strObj) {
      if (editingStrainId) {
        // find & update
        const idx = allStrains.findIndex((s) => s.id === editingStrainId);
        if (idx >= 0) {
          allStrains[idx] = strObj;
        }
        editingStrainId = null;
      } else {
        // new
        allStrains.push(strObj);
      }

      // save to localStorage
      localStorage.setItem("budstats_strains", JSON.stringify(allStrains));

      // reset
      strainForm.reset();
      ["taste","consistency","smell","effect"].forEach((attr) => {
        formDiv.querySelector(`#${attr}Value`).textContent = "5";
      });
      submitBtn.textContent = "Add Strain";

      // re-render
      renderStoreView();
      renderAddStrainForm(); // go back to add mode
    }
  });
}

/******************************************/
/**            STORE VIEW LOGIC          **/
/******************************************/
function renderStoreView() {
  const container = document.getElementById("storeViewContainer");
  container.innerHTML = "";

  // Buttons row for "all" or "by-store"
  const btnRow = document.createElement("div");
  btnRow.className = "view-mode-btns";
  btnRow.innerHTML = `
    <button class="view-mode-btn ${viewMode === "all" ? "active" : ""}" id="allViewBtn">All Strains</button>
    <button class="view-mode-btn ${viewMode === "by-store" ? "active" : ""}" id="byStoreBtn">By Store</button>
  `;
  container.appendChild(btnRow);

  const allBtn = btnRow.querySelector("#allViewBtn");
  const byStoreBtn = btnRow.querySelector("#byStoreBtn");
  allBtn.onclick = () => {
    viewMode = "all";
    renderStoreView();
  };
  byStoreBtn.onclick = () => {
    viewMode = "by-store";
    renderStoreView();
  };

  if (viewMode === "all") {
    // show all in grid
    const grid = document.createElement("div");
    grid.className = "strains-grid";
    allStrains.forEach((s) => {
      grid.appendChild(createStrainCard(s));
    });
    container.appendChild(grid);
  } else {
    // group by store
    const groups = groupStrainsByStore();
    Object.keys(groups).forEach((store) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "store-group-card";

      const header = document.createElement("div");
      header.className = "store-group-header";
      header.innerHTML = `
        <div style="display:flex; align-items:center; gap:4px;">
          <svg width="18" height="18" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               viewBox="0 0 24 24">
            <path d="M3 7l1 12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2l1-12H3z"></path>
          </svg>
          <span>${store}</span>
          <span style="font-size:0.8rem; color:#666; margin-left:4px;">
            (${groups[store].length})
          </span>
        </div>
        <div class="chevron-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round">
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      `;
      cardDiv.appendChild(header);

      const content = document.createElement("div");
      content.className = "store-group-content";
      const cGrid = document.createElement("div");
      cGrid.className = "strains-grid";
      groups[store].forEach((strain) => {
        cGrid.appendChild(createStrainCard(strain));
      });
      content.appendChild(cGrid);
      cardDiv.appendChild(content);

      let expanded = false;
      header.addEventListener("click", () => {
        expanded = !expanded;
        if (expanded) {
          content.style.maxHeight = content.scrollHeight + "px";
          header.querySelector("svg").style.transform = "rotate(180deg)";
        } else {
          content.style.maxHeight = "0";
          header.querySelector("svg").style.transform = "rotate(0deg)";
        }
      });

      container.appendChild(cardDiv);
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
/**          CREATE STRAIN CARD          **/
/******************************************/
function createStrainCard(strain) {
  // get average rating
  const values = [strain.taste, strain.consistency, strain.smell, strain.effect];
  const avg = parseFloat((values.reduce((a,b)=>a+b, 0) / values.length).toFixed(1));

  // color for circle
  function getRatingClass(r) {
    if (r >= 8.5) return "bg-gradient-high";
    if (r >= 7)   return "bg-gradient-good";
    if (r >= 5)   return "bg-gradient-mid";
    if (r >= 3)   return "bg-gradient-low";
    return         "bg-gradient-bad";
  }
  const ratingClass = getRatingClass(avg);

  const card = document.createElement("div");
  card.className = "strain-card";

  // rating badge
  const badge = document.createElement("div");
  badge.className = `strain-badge ${ratingClass}`;
  badge.textContent = avg;
  card.appendChild(badge);

  // photo or placeholder
  if (strain.photo) {
    const img = document.createElement("img");
    img.src = strain.photo;
    img.alt = strain.name;
    img.className = "strain-photo";
    // On click, show modal full image
    img.addEventListener("click", () => openImageModal(strain.photo));
    card.appendChild(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "strain-placeholder";
    placeholder.textContent = "No image available";
    card.appendChild(placeholder);
  }

  // content
  const contentDiv = document.createElement("div");
  contentDiv.className = "strain-card-content";

  // header (name + type)
  const headerDiv = document.createElement("div");
  headerDiv.className = "strain-card-header";

  const nameSpan = document.createElement("span");
  nameSpan.className = "strain-name";
  nameSpan.textContent = strain.name;

  const typeSpan = document.createElement("span");
  typeSpan.className = "strain-type";
  typeSpan.textContent = strain.type;

  headerDiv.appendChild(nameSpan);
  headerDiv.appendChild(typeSpan);
  contentDiv.appendChild(headerDiv);

  // store
  if (strain.store) {
    const storeDiv = document.createElement("div");
    storeDiv.className = "strain-store";
    storeDiv.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           viewBox="0 0 24 24">
        <path d="M3 7l1 12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2l1-12H3z"></path>
      </svg>
      <span>${strain.store}</span>
    `;
    contentDiv.appendChild(storeDiv);
  }

  // rating lines
  const ratingLinesDiv = document.createElement("div");
  [
    { label: "Taste", value: strain.taste },
    { label: "Consistency", value: strain.consistency },
    { label: "Smell", value: strain.smell },
    { label: "Effect", value: strain.effect },
  ].forEach((r) => {
    const line = document.createElement("div");
    line.className = "rating-line";
    line.innerHTML = `
      <span class="rating-label">${r.label}</span>
      <div class="rating-bar-wrapper">
        <div class="rating-bar-track">
          <div
            class="rating-bar-fill ${getRatingClass(r.value)}"
            style="width:${(r.value/10)*100}%"
          ></div>
        </div>
        <span style="font-size:0.8rem; color:#444; width:20px; text-align:right;">${r.value}</span>
      </div>
    `;
    ratingLinesDiv.appendChild(line);
  });
  contentDiv.appendChild(ratingLinesDiv);

  // actions
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "strain-actions";

  // share
  const shareBtn = document.createElement("button");
  shareBtn.className = "action-btn";
  shareBtn.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <path d="M8.59 13.51l6.83 3.98"></path>
      <path d="M15.41 6.51l-6.82 3.98"></path>
    </svg>
  `;
  shareBtn.onclick = () => {
    if (navigator.share) {
      // If the browser/device supports the Web Share API
      navigator.share({
        title: `Strain: ${strain.name}`,
        text: `Check out ${strain.name} from ${strain.store}!\nType: ${strain.type}, Rating: ${avg}\n`,
      }).then(() => {
        console.log("Shared successfully!");
      }).catch((err) => {
        console.error("Sharing failed:", err);
      });
    } else {
      alert("Your browser does not support Web Share. \nTry copying the info or using a mobile device.");
    }
  };
  actionsDiv.appendChild(shareBtn);

  // edit
  const editBtn = document.createElement("button");
  editBtn.className = "action-btn";
  editBtn.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z"></path>
    </svg>
  `;
  editBtn.onclick = () => {
    editingStrainId = strain.id;
    renderAddStrainForm(); // re-render the form in edit mode
  };
  actionsDiv.appendChild(editBtn);

  // delete
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn action-btn-danger";
  deleteBtn.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  `;
  deleteBtn.onclick = () => {
    if (confirm(`Delete strain "${strain.name}"?`)) {
      allStrains = allStrains.filter((x) => x.id !== strain.id);
      localStorage.setItem("budstats_strains", JSON.stringify(allStrains));
      renderStoreView();
    }
  };
  actionsDiv.appendChild(deleteBtn);

  contentDiv.appendChild(actionsDiv);
  card.appendChild(contentDiv);

  return card;
}

/******************************************/
/**          DATA ACTIONS (I/E)          **/
/******************************************/
function initDataActions() {
  const exportBtn = document.getElementById("exportButton");
  const importBtn = document.getElementById("importButton");
  const importFile = document.getElementById("importFile");

  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(
      { stores, strains: allStrains },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "budstats-data.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.stores || !parsed.strains) {
          alert("Invalid JSON. Must be {stores:[], strains:[]}");
          return;
        }
        // Merge or Overwrite?
        if (confirm("Merge data? (Cancel to overwrite)")) {
          // Merge
          stores = Array.from(new Set([...stores, ...parsed.stores]));
          allStrains = [...allStrains, ...parsed.strains];
          // remove duplicates by ID
          const seen = new Set();
          allStrains = allStrains.filter((st) => {
            if (seen.has(st.id)) return false;
            seen.add(st.id);
            return true;
          });
        } else {
          // Overwrite
          stores = parsed.stores;
          allStrains = parsed.strains;
        }

        // save to localStorage
        localStorage.setItem("budstats_stores", JSON.stringify(stores));
        localStorage.setItem("budstats_strains", JSON.stringify(allStrains));

        renderStoreButtons();
        renderAddStrainForm();
        renderStoreView();
        alert("Import successful!");
      } catch (err) {
        console.error(err);
        alert("Error reading JSON file.");
      }
    };
    reader.readAsText(file);
  });
}

/******************************************/
/**           IMAGE MODAL LOGIC          **/
/******************************************/
let modal, modalImg, modalClose;
function initImageModal() {
  modal = document.getElementById("imgModal");
  modalImg = document.getElementById("modalImg");
  modalClose = document.getElementById("modalClose");

  modalClose.addEventListener("click", () => {
    closeImageModal();
  });

  // close if user clicks outside the image
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeImageModal();
    }
  });
}

function openImageModal(imgSrc) {
  modalImg.src = imgSrc;
  modal.style.display = "block";
}

function closeImageModal() {
  modal.style.display = "none";
  modalImg.src = "";
}

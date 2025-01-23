/******************************************/
/** BudStats - script.js (0.1 increments + extended image share) */
/******************************************/

// Attempt to load from localStorage, else fall back to default
let savedStores = localStorage.getItem("budstats_stores");
let savedStrains = localStorage.getItem("budstats_strains");

// We'll use capitalized strain types matching our <select> ("Sativa", "Indica", "Hybrid").
let stores = savedStores ? JSON.parse(savedStores) : ["Green Store", "Herbal Haven"];
let allStrains = savedStrains
  ? JSON.parse(savedStrains)
  : [
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

let viewMode = "by-store"; // "all" or "by-store"
let editingStrainId = null; // track which strain is being edited

document.addEventListener("DOMContentLoaded", () => {
  // 2-second loading screen
  setTimeout(() => {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("appContainer").classList.remove("hidden");
  }, 2000);

  // Initialize everything
  initSideSheet();
  renderStoreButtons();
  renderAddStrainForm();
  renderStoreView();
  initDataActions();
  initImageModal();
});

/******************************************/
/** Side Sheet (Menu) Logic              **/
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

  // Close if clicking outside the sheet
  document.addEventListener("click", (e) => {
    if (!sideSheet.contains(e.target) && !sheetTrigger.contains(e.target)) {
      sideSheet.classList.remove("show");
    }
  });
}

/******************************************/
/** Store Management (Add/Delete)        **/
/******************************************/
function renderStoreButtons() {
  const container = document.getElementById("storeButtons");
  container.innerHTML = "";

  stores.forEach((store) => {
    const item = document.createElement("div");
    item.className = "store-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "store-name";
    nameSpan.textContent = store;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-store-btn";
    delBtn.innerHTML = "&times;";
    delBtn.title = `Delete store "${store}"`;
    delBtn.onclick = () => {
      if (confirm(`Remove store "${store}" from your list?`)) {
        stores = stores.filter((s) => s !== store);
        localStorage.setItem("budstats_stores", JSON.stringify(stores));
        renderStoreButtons();
        renderAddStrainForm();
      }
    };

    item.appendChild(nameSpan);
    item.appendChild(delBtn);
    container.appendChild(item);
  });

  const addStoreBtn = document.getElementById("addStoreButton");
  const newStoreInput = document.getElementById("newStoreInput");
  addStoreBtn.onclick = () => {
    const val = newStoreInput.value.trim();
    if (!val) return;
    stores.push(val);
    localStorage.setItem("budstats_stores", JSON.stringify(stores));
    newStoreInput.value = "";
    renderStoreButtons();
    renderAddStrainForm();
  };
}

/******************************************/
/** Add/Edit Strain Form                 **/
/******************************************/
function renderAddStrainForm() {
  const container = document.getElementById("addStrainFormContainer");
  container.innerHTML = "";

  const formCard = document.createElement("div");
  formCard.className = "form-card";

  const heading = editingStrainId ? "Edit Strain" : "Add New Strain";

  // 0.1 increments for rating steps
  formCard.innerHTML = `
    <h2>${heading}</h2>
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
          <option value="Sativa">Sativa</option>
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

      <!-- Taste, consistency, smell, effect -->
      ${["taste","consistency","smell","effect"].map((attr) => `
      <div class="add-form-group">
        <label>${attr.charAt(0).toUpperCase() + attr.slice(1)} (0-10)</label>
        <input type="range" min="0" max="10" step="0.1" id="${attr}" value="5" />
        <div class="range-value" id="${attr}Value">5</div>
      </div>`).join("")}

      <!-- Photo -->
      <div class="add-form-group">
        <label>Strain Photo (optional)</label>
        <input type="file" id="strainPhoto" accept="image/*" />
      </div>

      <!-- Submit Button -->
      <button type="submit" class="add-form-submit" id="submitBtn">
        ${editingStrainId ? "Save Changes" : "Add Strain"}
      </button>
    </form>
  `;

  container.appendChild(formCard);

  // Keep track of range input changes
  ["taste","consistency","smell","effect"].forEach((attr) => {
    const range = formCard.querySelector(`#${attr}`);
    const valSpan = formCard.querySelector(`#${attr}Value`);
    range.addEventListener("input", () => {
      valSpan.textContent = range.value;
    });
  });

  // If editing, populate existing data
  const strainForm = formCard.querySelector("#strainForm");
  const photoInput = formCard.querySelector("#strainPhoto");
  const submitBtn = formCard.querySelector("#submitBtn");

  if (editingStrainId) {
    const existing = allStrains.find((s) => s.id === editingStrainId);
    if (existing) {
      strainForm.querySelector("#strainName").value = existing.name;
      strainForm.querySelector("#strainType").value = existing.type;
      strainForm.querySelector("#strainStore").value = existing.store;
      ["taste","consistency","smell","effect"].forEach((attr) => {
        strainForm.querySelector(`#${attr}`).value = existing[attr];
        formCard.querySelector(`#${attr}Value`).textContent = existing[attr];
      });
    }
  }

  // Submit event
  strainForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Gather data
    const newStrain = {
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

    // If user selected a new photo
    const file = photoInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        newStrain.photo = ev.target?.result;
        finalize(newStrain);
      };
      reader.readAsDataURL(file);
    } else {
      // Keep old photo if editing
      if (editingStrainId) {
        const old = allStrains.find((s) => s.id === editingStrainId);
        if (old?.photo) {
          newStrain.photo = old.photo;
        }
      }
      finalize(newStrain);
    }

    function finalize(strObj) {
      if (editingStrainId) {
        const idx = allStrains.findIndex((s) => s.id === editingStrainId);
        if (idx >= 0) {
          allStrains[idx] = strObj;
        }
        editingStrainId = null;
      } else {
        allStrains.push(strObj);
      }

      localStorage.setItem("budstats_strains", JSON.stringify(allStrains));

      // Reset
      strainForm.reset();
      ["taste","consistency","smell","effect"].forEach((attr) => {
        formCard.querySelector(`#${attr}Value`).textContent = "5";
      });
      submitBtn.textContent = "Add Strain";

      // Re-render
      renderStoreView();
      renderAddStrainForm();
    }
  });
}

/******************************************/
/** StoreView: "all" or "by-store"       **/
/******************************************/
function renderStoreView() {
  const container = document.getElementById("storeViewContainer");
  container.innerHTML = "";

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
    const grid = document.createElement("div");
    grid.className = "strains-grid";
    allStrains.forEach((s) => {
      grid.appendChild(createStrainCard(s));
    });
    container.appendChild(grid);
  } else {
    const grouped = groupStrainsByStore();
    Object.keys(grouped).forEach((store) => {
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
            (${grouped[store].length})
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

      grouped[store].forEach((strain) => {
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
/** Strain Card + DataURL -> File        **/
/******************************************/

// If you want to share images with the Web Share API Level 2, 
// you can convert the base64 to a File:
function dataURLtoFile(dataURL, filename) {
  if (!dataURL.startsWith("data:")) return null;
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function createStrainCard(strain) {
  const ratings = [strain.taste, strain.consistency, strain.smell, strain.effect];
  const avg = parseFloat((ratings.reduce((a,b) => a+b, 0) / ratings.length).toFixed(1));

  function getRatingClass(r) {
    if (r >= 8.5) return "bg-gradient-high";
    if (r >= 7)   return "bg-gradient-good";
    if (r >= 5)   return "bg-gradient-mid";
    if (r >= 3)   return "bg-gradient-low";
    return         "bg-gradient-bad";
  }
  const badgeClass = getRatingClass(avg);

  const card = document.createElement("div");
  card.className = "strain-card";

  // Rating badge (top-right circle)
  const badge = document.createElement("div");
  badge.className = `strain-badge ${badgeClass}`;
  badge.textContent = avg;
  card.appendChild(badge);

  // Photo or placeholder
  if (strain.photo) {
    const img = document.createElement("img");
    img.src = strain.photo;
    img.alt = strain.name;
    img.className = "strain-photo";
    img.addEventListener("click", () => openImageModal(strain.photo));
    card.appendChild(img);
  } else {
    const ph = document.createElement("div");
    ph.className = "strain-placeholder";
    ph.textContent = "No image available";
    card.appendChild(ph);
  }

  // Content container
  const contentDiv = document.createElement("div");
  contentDiv.className = "strain-card-content";

  // Header row (strain name + type)
  const headerRow = document.createElement("div");
  headerRow.className = "strain-card-header";

  const nameEl = document.createElement("span");
  nameEl.className = "strain-name";
  nameEl.textContent = strain.name;

  const typeEl = document.createElement("span");
  typeEl.className = "strain-type";
  typeEl.textContent = strain.type;

  headerRow.appendChild(nameEl);
  headerRow.appendChild(typeEl);
  contentDiv.appendChild(headerRow);

  // Store line
  if (strain.store) {
    const storeLine = document.createElement("div");
    storeLine.className = "strain-store";
    storeLine.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           viewBox="0 0 24 24">
        <path d="M3 7l1 12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2l1-12H3z"></path>
      </svg>
      <span>${strain.store}</span>
    `;
    contentDiv.appendChild(storeLine);
  }

  // Rating lines
  const ratingBlock = document.createElement("div");
  const cats = [
    { label: "Taste", value: strain.taste },
    { label: "Consistency", value: strain.consistency },
    { label: "Smell", value: strain.smell },
    { label: "Effect", value: strain.effect },
  ];
  cats.forEach((r) => {
    const line = document.createElement("div");
    line.className = "rating-line";
    line.innerHTML = `
      <span class="rating-label">${r.label}</span>
      <div class="rating-bar-wrapper">
        <div class="rating-bar-track">
          <div
            class="rating-bar-fill ${getRatingClass(r.value)}"
            style="width:${(r.value / 10) * 100}%"
          ></div>
        </div>
        <span style="font-size:0.8rem; color:#444; width:20px; text-align:right;">
          ${r.value}
        </span>
      </div>
    `;
    ratingBlock.appendChild(line);
  });
  contentDiv.appendChild(ratingBlock);

  // Action buttons row (Share, Edit, Delete)
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "strain-actions";

  // SHARE
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
  shareBtn.onclick = async () => {
    // If no navigator.share, show fallback
    if (!navigator.share) {
      alert("Sharing not supported by your browser.");
      return;
    }

    // Build a more professional share text
    const shareText = `
*** BudStats - ${strain.name} ***
Store: ${strain.store}
----------------------------
Taste:       ${strain.taste}/10
Consistency: ${strain.consistency}/10
Smell:       ${strain.smell}/10
Effect:      ${strain.effect}/10
----------------------------
Final Rating: ${avg}/10

Check out more on BudStats!
`.trim();

    // If there's a photo, attempt to share it
    if (strain.photo) {
      try {
        const file = dataURLtoFile(strain.photo, `${strain.name.replace(/\s+/g, "_")}.jpg`);
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `BudStats - ${strain.name}`,
            text: shareText,
            files: [file],
          });
          console.log("Shared with image successfully.");
        } else {
          // If can't share the file, fallback to text-only
          await navigator.share({
            title: `BudStats - ${strain.name}`,
            text: shareText,
          });
          console.log("Shared text-only, image not supported.");
        }
      } catch (err) {
        console.error("Error while sharing with image:", err);
        // fallback to text
        await navigator.share({
          title: `BudStats - ${strain.name}`,
          text: shareText,
        });
      }
    } else {
      // No photo, share text only
      try {
        await navigator.share({
          title: `BudStats - ${strain.name}`,
          text: shareText,
        });
        console.log("Shared text-only (no image).");
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };
  actionsDiv.appendChild(shareBtn);

  // EDIT
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
    renderAddStrainForm(); // re-render form in edit mode
  };
  actionsDiv.appendChild(editBtn);

  // DELETE
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
/** Data Actions (Export/Import)         **/
/******************************************/
function initDataActions() {
  const exportBtn = document.getElementById("exportButton");
  const importBtn = document.getElementById("importButton");
  const importFile = document.getElementById("importFile");

  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify({ stores, strains: allStrains }, null, 2);
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
        // Merge or overwrite?
        if (confirm("Merge data? (Cancel to overwrite)")) {
          stores = Array.from(new Set([...stores, ...parsed.stores]));
          allStrains = [...allStrains, ...parsed.strains];
          // Deduplicate by strain.id
          const seen = new Set();
          allStrains = allStrains.filter((st) => {
            if (seen.has(st.id)) return false;
            seen.add(st.id);
            return true;
          });
        } else {
          stores = parsed.stores;
          allStrains = parsed.strains;
        }

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
/** Image Modal for Full Preview         **/
/******************************************/
let modal, modalImg, modalClose;
function initImageModal() {
  modal = document.getElementById("imgModal");
  modalImg = document.getElementById("modalImg");
  modalClose = document.getElementById("modalClose");

  modalClose.addEventListener("click", () => {
    closeImageModal();
  });

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

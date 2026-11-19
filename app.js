const STORAGE_KEY = "packsmart_user_data_v1";

// Default starter template shown on a user's first visit
const defaultCategories = [
  {
    id: crypto.randomUUID(),
    name: "Clothing",
    collapsed: false,
    items: [
      { id: crypto.randomUUID(), name: "Shirts", packed: false },
      { id: crypto.randomUUID(), name: "Pants / Shorts", packed: false },
      { id: crypto.randomUUID(), name: "Underwear & Socks", packed: false }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: "Toiletries",
    collapsed: false,
    items: [
      { id: crypto.randomUUID(), name: "Toothbrush & Toothpaste", packed: false },
      { id: crypto.randomUUID(), name: "Deodorant", packed: false }
    ]
  },
  {
    id: crypto.randomUUID(),
    name: "Electronics",
    collapsed: false,
    items: [
      { id: crypto.randomUUID(), name: "Laptop & Charger", packed: false },
      { id: crypto.randomUUID(), name: "Phone Charger", packed: false }
    ]
  }
];

let categories = loadData();

// DOM References
const categoriesContainer = document.getElementById("categories-container");
const addCategoryForm = document.getElementById("add-category-form");
const newCategoryInput = document.getElementById("new-category-input");
const uncheckAllBtn = document.getElementById("uncheck-all-btn");
const progressLabel = document.getElementById("progress-label");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

// Load from localStorage
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultCategories;
  } catch (err) {
    console.error("Failed to read from localStorage:", err);
    return defaultCategories;
  }
}

// Save to localStorage and re-render
function saveAndRender() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
  render();
}

// Update Progress Bar
function updateProgress() {
  let totalItems = 0;
  let packedItems = 0;

  categories.forEach((cat) => {
    totalItems += cat.items.length;
    packedItems += cat.items.filter((item) => item.packed).length;
  });

  const percentage = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);
  progressLabel.textContent = `${packedItems} of ${totalItems} items packed`;
  progressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
}

// Render Categories & Items
function render() {
  updateProgress();
  categoriesContainer.innerHTML = "";

  if (categories.length === 0) {
    categoriesContainer.innerHTML = `
      <div class="empty-state">
        No categories yet. Add a category above (like <strong>Clothing</strong> or <strong>Electronics</strong>) to get started!
      </div>
    `;
    return;
  }

  categories.forEach((category) => {
    const packedCount = category.items.filter((i) => i.packed).length;
    const totalCount = category.items.length;

    const card = document.createElement("section");
    card.className = `category-card ${category.collapsed ? "collapsed" : ""}`;

    // Category Header
    const header = document.createElement("div");
    header.className = "category-header";

    const titleGroup = document.createElement("div");
    titleGroup.className = "category-title-group";
    titleGroup.innerHTML = `
      <span class="chevron">▼</span>
      <span class="category-name">${escapeHTML(category.name)}</span>
      <span class="category-badge">${packedCount}/${totalCount}</span>
    `;
    titleGroup.addEventListener("click", () => toggleCategory(category.id));

    const catActions = document.createElement("div");
    catActions.className = "category-actions";

    const editCatBtn = document.createElement("button");
    editCatBtn.className = "icon-btn";
    editCatBtn.type = "button";
    editCatBtn.textContent = "Edit";
    editCatBtn.title = "Rename category";
    editCatBtn.addEventListener("click", () => editCategory(category.id));

    const deleteCatBtn = document.createElement("button");
    deleteCatBtn.className = "icon-btn delete";
    deleteCatBtn.type = "button";
    deleteCatBtn.textContent = "Delete";
    deleteCatBtn.title = "Delete category";
    deleteCatBtn.addEventListener("click", () => deleteCategory(category.id));

    catActions.append(editCatBtn, deleteCatBtn);
    header.append(titleGroup, catActions);

    // Category Body
    const body = document.createElement("div");
    body.className = "category-body";

    const addItemForm = document.createElement("form");
    addItemForm.className = "add-item-form";
    addItemForm.innerHTML = `
      <input type="text" placeholder="Add item to ${escapeHTML(category.name)}..." required />
      <button type="submit" class="btn btn-secondary">Add</button>
    `;
    addItemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = addItemForm.querySelector("input");
      const value = input.value.trim();
      if (value) {
        addItem(category.id, value);
      }
    });

    const itemList = document.createElement("ul");
    itemList.className = "item-list";

    category.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = `item-row ${item.packed ? "completed" : ""}`;

      const label = document.createElement("label");
      label.className = "item-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "item-checkbox";
      checkbox.checked = item.packed;
      checkbox.addEventListener("change", () => toggleItem(category.id, item.id));

      const span = document.createElement("span");
      span.className = "item-text";
      span.textContent = item.name;

      label.append(checkbox, span);

      const itemActions = document.createElement("div");
      itemActions.className = "item-actions";

      const editItemBtn = document.createElement("button");
      editItemBtn.className = "icon-btn";
      editItemBtn.type = "button";
      editItemBtn.textContent = "Edit";
      editItemBtn.addEventListener("click", () => editItem(category.id, item.id));

      const deleteItemBtn = document.createElement("button");
      deleteItemBtn.className = "icon-btn delete";
      deleteItemBtn.type = "button";
      deleteItemBtn.textContent = "✕";
      deleteItemBtn.title = "Delete item";
      deleteItemBtn.addEventListener("click", () => deleteItem(category.id, item.id));

      itemActions.append(editItemBtn, deleteItemBtn);
      li.append(label, itemActions);
      itemList.appendChild(li);
    });

    body.append(addItemForm, itemList);
    card.append(header, body);
    categoriesContainer.appendChild(card);
  });
}

// Category Actions
addCategoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = newCategoryInput.value.trim();
  if (!name) return;

  categories.push({
    id: crypto.randomUUID(),
    name,
    collapsed: false,
    items: []
  });

  newCategoryInput.value = "";
  saveAndRender();
});

function toggleCategory(categoryId) {
  const cat = categories.find((c) => c.id === categoryId);
  if (cat) {
    cat.collapsed = !cat.collapsed;
    saveAndRender();
  }
}

function editCategory(categoryId) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  const updated = prompt("Rename category:", cat.name);
  if (updated !== null && updated.trim() !== "") {
    cat.name = updated.trim();
    saveAndRender();
  }
}

function deleteCategory(categoryId) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  if (confirm(`Delete "${cat.name}" and all its items?`)) {
    categories = categories.filter((c) => c.id !== categoryId);
    saveAndRender();
  }
}

// Item Actions
function addItem(categoryId, itemName) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  cat.items.push({
    id: crypto.randomUUID(),
    name: itemName,
    packed: false
  });
  cat.collapsed = false;
  saveAndRender();
}

function toggleItem(categoryId, itemId) {
  const cat = categories.find((c) => c.id === categoryId);
  const item = cat?.items.find((i) => i.id === itemId);
  if (item) {
    item.packed = !item.packed;
    saveAndRender();
  }
}

function editItem(categoryId, itemId) {
  const cat = categories.find((c) => c.id === categoryId);
  const item = cat?.items.find((i) => i.id === itemId);
  if (!item) return;

  const updated = prompt("Edit item:", item.name);
  if (updated !== null && updated.trim() !== "") {
    item.name = updated.trim();
    saveAndRender();
  }
}

function deleteItem(categoryId, itemId) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  cat.items = cat.items.filter((i) => i.id !== itemId);
  saveAndRender();
}

// Uncheck All Items
uncheckAllBtn.addEventListener("click", () => {
  const hasChecked = categories.some((c) => c.items.some((i) => i.packed));
  if (!hasChecked) return;

  if (confirm("Uncheck all packed items to reset your list?")) {
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        item.packed = false;
      });
    });
    saveAndRender();
  }
});

// Utility to prevent HTML injection in user-entered names
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Initial Render
render();
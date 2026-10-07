/*
  North Star Bakery: interactive menu and pre-order list (products page)
  Author: Azamat Soliev

  Builds the menu from the arrays in menu-data.js, filters it by category,
  and keeps a pre-order list. The list is saved in localStorage so it is
  still there after a refresh and can be carried over to the contact form.
  The chosen category is saved in sessionStorage for the rest of the visit.
*/

const FILTER_STORAGE_KEY = "northStarMenuFilter";

// The filter buttons: "All" followed by one button per menu category.
const filterOptions = [{ id: "all", name: "All" }].concat(menuCategories);

// Page state.
let preorderList = loadPreorderList();
let activeFilter = loadActiveFilter();

// Elements this script updates.
const menuFilters = document.getElementById("menu-filters");
const menuContainer = document.getElementById("menu-categories");
const listItems = document.getElementById("preorder-items");
const listEmpty = document.getElementById("preorder-empty");
const listTotal = document.getElementById("preorder-total");
const listActions = document.getElementById("preorder-actions");
const listCount = document.getElementById("list-count");
const clearButton = document.getElementById("preorder-clear");
const restoreNote = document.getElementById("restore-note");
const announcer = document.getElementById("menu-announcer");

/* ---------- Saving and loading the category filter ---------- */

// Returns the saved filter for this visit, or "all" if there is none.
function loadActiveFilter() {
  let saved = null;
  try {
    saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
  } catch (error) {
    saved = null;
  }
  const isKnown = filterOptions.some((option) => option.id === saved);
  return isKnown ? saved : "all";
}

function saveActiveFilter(filter) {
  try {
    sessionStorage.setItem(FILTER_STORAGE_KEY, filter);
  } catch (error) {
    // Storage is blocked: the filter still works, it just is not remembered.
  }
}

/* ---------- Building the page ---------- */

// Creates one filter button per option.
function renderFilters() {
  filterOptions.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.filter = option.id;
    button.textContent = option.name;
    menuFilters.appendChild(button);
  });
}

// Creates a card for every category, each holding its menu items.
function renderMenu() {
  menuContainer.textContent = "";
  menuCategories.forEach((category) => {
    menuContainer.appendChild(createCategoryCard(category));
  });
}

function createCategoryCard(category) {
  const card = document.createElement("section");
  card.className = "card menu-card";
  card.dataset.category = category.id;
  card.setAttribute("aria-labelledby", `category-${category.id}`);

  const heading = document.createElement("h3");
  heading.id = `category-${category.id}`;
  heading.textContent = category.name;

  const range = document.createElement("p");
  range.className = "price-range";
  range.textContent = `Pricing range: ${category.priceRange}`;

  const description = document.createElement("p");
  description.textContent = category.description;

  const list = document.createElement("ul");
  list.className = "menu-list";
  menuItems
    .filter((item) => item.category === category.id)
    .forEach((item) => list.appendChild(createMenuItem(item)));

  card.append(heading, range, description, list);
  return card;
}

function createMenuItem(item) {
  const row = document.createElement("li");
  row.className = "menu-item";
  row.dataset.id = item.id;

  const text = document.createElement("div");
  text.className = "menu-item__text";

  const name = document.createElement("span");
  name.className = "menu-item__name";
  name.textContent = item.name;
  text.appendChild(name);

  if (item.note) {
    const note = document.createElement("span");
    note.className = "menu-item__note";
    note.textContent = item.note;
    text.appendChild(note);
  }

  const status = document.createElement("span");
  status.className = "menu-item__status";
  text.appendChild(status);

  const price = document.createElement("span");
  price.className = "price";
  price.textContent = formatMenuPrice(item);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "add-button";
  button.dataset.id = item.id;

  row.append(text, price, button);
  return row;
}

/* ---------- Updating the page after a change ---------- */

// Shows only the selected category and marks the pressed filter button.
function applyFilter() {
  menuFilters.querySelectorAll(".filter-button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
  });
  menuContainer.querySelectorAll(".menu-card").forEach((card) => {
    card.hidden = activeFilter !== "all" && card.dataset.category !== activeFilter;
  });
}

// Updates every "Add" button and "in your list" note to match the list.
function updateMenuButtons() {
  menuContainer.querySelectorAll(".menu-item").forEach((row) => {
    const item = findMenuItem(row.dataset.id);
    const qty = getQuantity(item.id);
    const button = row.querySelector(".add-button");
    const status = row.querySelector(".menu-item__status");
    const atLimit = qty >= bakeryInfo.maxPerItem;

    // aria-disabled (instead of disabled) keeps keyboard focus on the button.
    button.setAttribute("aria-disabled", String(atLimit));
    if (atLimit) {
      button.textContent = "Limit reached";
      button.setAttribute("aria-label", `${item.name}: limit of ${bakeryInfo.maxPerItem} reached`);
    } else {
      button.textContent = qty === 0 ? "Add" : "Add one more";
      button.setAttribute("aria-label", `Add ${item.name} to your pre-order list`);
    }

    row.classList.toggle("is-in-list", qty > 0);
    if (atLimit) {
      status.textContent = `${qty} in your list · call ahead for more`;
    } else {
      status.textContent = qty > 0 ? `${qty} in your list` : "";
    }
  });
}

// Rebuilds the pre-order list panel: one row per item, then the total.
function renderList() {
  listItems.textContent = "";
  getListDetails(preorderList).forEach((line) => {
    listItems.appendChild(createListRow(line));
  });

  const isEmpty = preorderList.length === 0;
  listEmpty.hidden = !isEmpty;
  listTotal.hidden = isEmpty;
  listActions.hidden = isEmpty;
  listCount.textContent = getListCount(preorderList);

  if (!isEmpty) {
    const label = listHasFromPrices(preorderList) ? "Estimated total (cakes priced from)" : "Estimated total";
    listTotal.textContent = `${label}: ${formatMoney(getListTotal(preorderList))}`;
  }
}

function createListRow(line) {
  const row = document.createElement("li");
  row.className = "preorder-item";

  const name = document.createElement("span");
  name.className = "preorder-item__name";
  name.textContent = line.item.name;

  const controls = document.createElement("div");
  controls.className = "qty-control";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", `Quantity of ${line.item.name}`);

  const decrease = createListButton("decrease", line.item, "−", `Remove one ${line.item.name}`);
  const quantity = document.createElement("span");
  quantity.className = "qty-value";
  quantity.textContent = line.qty;
  const increase = createListButton("increase", line.item, "+", `Add one ${line.item.name}`);
  increase.disabled = line.qty >= bakeryInfo.maxPerItem;
  controls.append(decrease, quantity, increase);

  const subtotal = document.createElement("span");
  subtotal.className = "preorder-item__subtotal";
  subtotal.textContent = line.item.priceFrom ? `from ${formatMoney(line.subtotal)}` : formatMoney(line.subtotal);

  const remove = createListButton("remove", line.item, "Remove", `Remove ${line.item.name} from your list`);
  remove.classList.add("remove-button");

  row.append(name, controls, subtotal, remove);
  return row;
}

function createListButton(action, item, text, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "qty-button";
  button.dataset.action = action;
  button.dataset.id = item.id;
  button.textContent = text;
  button.setAttribute("aria-label", label);
  return button;
}

// Runs after every change to the list: save it, then refresh the page.
function listChanged(message) {
  savePreorderList(preorderList);
  updateMenuButtons();
  renderList();
  announce(message);
}

// Reads a message aloud to screen reader users through a live region.
function announce(message) {
  announcer.textContent = message;
}

/* ---------- Changing the list ---------- */

function getQuantity(id) {
  const entry = preorderList.find((line) => line.id === id);
  return entry ? entry.qty : 0;
}

function addItem(id) {
  const item = findMenuItem(id);
  const entry = preorderList.find((line) => line.id === id);

  if (entry && entry.qty >= bakeryInfo.maxPerItem) {
    announce(`You already have ${bakeryInfo.maxPerItem} ${item.name}. Please call ${bakeryInfo.phone} to order more.`);
    return;
  }
  if (entry) {
    entry.qty += 1;
  } else {
    preorderList.push({ id: id, qty: 1 });
  }
  listChanged(`${item.name} added. ${getQuantity(id)} in your list.`);
}

function changeQuantity(id, change) {
  const item = findMenuItem(id);
  const entry = preorderList.find((line) => line.id === id);
  if (!entry) {
    return;
  }

  entry.qty = Math.min(entry.qty + change, bakeryInfo.maxPerItem);
  if (entry.qty <= 0) {
    removeItem(id);
    return;
  }
  listChanged(`${item.name}: ${entry.qty} in your list.`);
}

function removeItem(id) {
  const item = findMenuItem(id);
  preorderList = preorderList.filter((line) => line.id !== id);
  listChanged(`${item.name} removed from your list.`);
}

function clearList() {
  preorderList = [];
  restoreNote.hidden = true;
  listChanged("Your pre-order list is empty.");
  document.getElementById("preorder-heading").focus();
}

function setFilter(filter) {
  activeFilter = filter;
  saveActiveFilter(filter);
  applyFilter();
  const option = filterOptions.find((choice) => choice.id === filter);
  announce(filter === "all" ? "Showing the full menu." : `Showing ${option.name.toLowerCase()} only.`);
}

/* ---------- Responding to clicks ---------- */

// One listener per area handles every button inside it ("event delegation"),
// so buttons that are rebuilt by renderList() keep working.
function handleMenuClick(event) {
  const button = event.target.closest(".add-button");
  if (button) {
    addItem(button.dataset.id);
  }
}

function handleFilterClick(event) {
  const button = event.target.closest(".filter-button");
  if (button) {
    setFilter(button.dataset.filter);
  }
}

function handleListClick(event) {
  const button = event.target.closest(".qty-button");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const action = button.dataset.action;
  if (action === "increase") {
    changeQuantity(id, 1);
  } else if (action === "decrease") {
    changeQuantity(id, -1);
  } else if (action === "remove") {
    removeItem(id);
  }
  restoreFocus(id, action);
}

// renderList() replaces the rows, which removes the button that had keyboard
// focus. Put focus back on the same button in the new row. If that button is
// now disabled (the limit was reached), use the "−" button in the same row,
// and if the item left the list, move focus to the list heading.
function restoreFocus(id, action) {
  const sameButton = listItems.querySelector(`[data-id="${id}"][data-action="${action}"]`);
  const decreaseButton = listItems.querySelector(`[data-id="${id}"][data-action="decrease"]`);

  if (sameButton && !sameButton.disabled) {
    sameButton.focus();
  } else if (decreaseButton) {
    decreaseButton.focus();
  } else {
    document.getElementById("preorder-heading").focus();
  }
}

// If a list was saved on an earlier visit, say so above the list.
function showRestoreNote() {
  const count = getListCount(preorderList);
  if (count === 0) {
    return;
  }
  const items = count === 1 ? "1 item" : `${count} items`;
  restoreNote.textContent = `Welcome back! We saved your list from your last visit (${items}).`;
  restoreNote.hidden = false;
}

/* ---------- Start ---------- */

function initMenu() {
  if (!menuContainer) {
    return;
  }
  renderFilters();
  renderMenu();
  applyFilter();
  updateMenuButtons();
  renderList();
  showRestoreNote();

  menuContainer.addEventListener("click", handleMenuClick);
  menuFilters.addEventListener("click", handleFilterClick);
  listItems.addEventListener("click", handleListClick);
  clearButton.addEventListener("click", clearList);
}

initMenu();

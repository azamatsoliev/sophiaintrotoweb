/*
  North Star Bakery: saved pre-order list
  Author: Azamat Soliev

  Reads and writes the visitor's pre-order list in localStorage. The list is
  an array of small objects such as { id: "baguette", qty: 2 }. Only ids and
  quantities are saved. Names and prices always come from menu-data.js, so a
  price change on the menu also updates any list that was saved earlier.
*/

const PREORDER_STORAGE_KEY = "northStarPreorderList";

// Loads the saved list. Returns an empty array when nothing is saved yet, when
// the saved text is damaged, or when the browser blocks storage.
function loadPreorderList() {
  let savedText = null;

  try {
    savedText = localStorage.getItem(PREORDER_STORAGE_KEY);
  } catch (error) {
    return [];
  }

  if (savedText === null) {
    return [];
  }

  try {
    const savedList = JSON.parse(savedText);
    return Array.isArray(savedList) ? cleanList(savedList) : [];
  } catch (error) {
    return [];
  }
}

// Keeps only entries that still match a menu item, with a sensible quantity.
function cleanList(list) {
  return list
    .filter((entry) => entry && findMenuItem(entry.id) && Number.isInteger(entry.qty) && entry.qty > 0)
    .map((entry) => ({ id: entry.id, qty: Math.min(entry.qty, bakeryInfo.maxPerItem) }));
}

// Saves the list, or removes the saved copy when the list is empty.
// Returns false if the browser does not allow storage.
function savePreorderList(list) {
  try {
    if (list.length === 0) {
      localStorage.removeItem(PREORDER_STORAGE_KEY);
    } else {
      localStorage.setItem(PREORDER_STORAGE_KEY, JSON.stringify(list));
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Joins each saved entry with its menu item: { item, qty, subtotal }.
function getListDetails(list) {
  return list.map((entry) => {
    const item = findMenuItem(entry.id);
    return { item: item, qty: entry.qty, subtotal: item.price * entry.qty };
  });
}

// Adds up the subtotals of every line in the list.
function getListTotal(list) {
  return getListDetails(list).reduce((total, line) => total + line.subtotal, 0);
}

// Counts every piece in the list (2 baguettes + 1 tart = 3).
function getListCount(list) {
  return list.reduce((count, entry) => count + entry.qty, 0);
}

// True when any item in the list has a "from" price, so the total is an estimate.
function listHasFromPrices(list) {
  return getListDetails(list).some((line) => line.item.priceFrom);
}

// Writes the list as plain text for the "Item details" box on the contact form.
function listToText(list) {
  const lines = getListDetails(list).map((line) => {
    const price = line.item.priceFrom ? `from ${formatMoney(line.subtotal)}` : formatMoney(line.subtotal);
    return `${line.qty} × ${line.item.name} (${price})`;
  });

  const totalLabel = listHasFromPrices(list) ? "Estimated total, cakes from" : "Estimated total";
  lines.push(`${totalLabel}: ${formatMoney(getListTotal(list))}`);
  return lines.join("\n");
}

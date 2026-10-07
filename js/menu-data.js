/*
  North Star Bakery: menu data
  Author: Azamat Soliev

  The menu is stored here as arrays of objects so the products page and the
  contact form share the same item names, prices, and ordering rules.
*/

// Shop-wide details used by the pre-order list and the form checks.
const bakeryInfo = {
  phone: "(555) 014-2218",
  closedDay: 1, // Monday (getDay() returns 0 for Sunday through 6 for Saturday)
  maxPerItem: 4, // "Call ahead if you need more than four of one kind."
  maxDaysAhead: 60 // Pre-orders are taken up to about two months ahead.
};

// Weekday names, indexed the same way as Date.getDay().
const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// One object per menu category, in the order they appear on the page.
const menuCategories = [
  {
    id: "breads",
    name: "Breads",
    priceRange: "$4 – $12",
    description: "Loaves are baked overnight and ready when the door opens. Call ahead if you need more than four of one kind."
  },
  {
    id: "pastries",
    name: "Pastries",
    priceRange: "$4.50 – $7",
    description: "Pastries are mixed in small trays. Weekend favorites often sell through by late morning."
  },
  {
    id: "cakes",
    name: "Cakes",
    priceRange: "$38 – $85",
    description: "Cake orders need three days' notice. Share flavor, size, and any allergy notes on the pre-order form."
  }
];

// Every item on the menu. Optional properties:
//   note        short detail shown under the name
//   priceFrom   true when the price is a starting price (cakes)
//   noticeDays  how many days ahead the item must be ordered
//   onlyDay     the one weekday the item is baked (0 = Sunday ... 6 = Saturday)
const menuItems = [
  { id: "country-loaf", category: "breads", name: "Country loaf", note: "Naturally leavened", price: 9 },
  { id: "seeded-rye", category: "breads", name: "Seeded rye", price: 10 },
  { id: "baguette", category: "breads", name: "Baguette", price: 4 },
  { id: "honeyed-rye", category: "breads", name: "Honeyed rye with fennel", price: 12 },
  { id: "butter-croissant", category: "pastries", name: "Butter croissant", price: 4.5 },
  { id: "morning-bun", category: "pastries", name: "Morning bun", price: 5 },
  { id: "berry-tart", category: "pastries", name: "Mixed berry tart", note: "Featured this week", price: 6 },
  { id: "cinnamon-roll", category: "pastries", name: "Cinnamon roll", note: "Saturdays only", price: 5.5, onlyDay: 6 },
  { id: "almond-croissant", category: "pastries", name: "Almond croissant", price: 7 },
  { id: "six-inch-cake", category: "cakes", name: "Six-inch layer cake", price: 38, priceFrom: true, noticeDays: 3 },
  { id: "eight-inch-cake", category: "cakes", name: "Eight-inch layer cake", price: 52, priceFrom: true, noticeDays: 3 },
  { id: "custom-cake", category: "cakes", name: "Custom celebration cake", price: 65, priceFrom: true, noticeDays: 3 },
  { id: "sheet-cake", category: "cakes", name: "Sheet cake for gatherings", price: 85, priceFrom: true, noticeDays: 3 }
];

// Returns the menu item with the given id, or undefined if there is none.
function findMenuItem(id) {
  return menuItems.find((item) => item.id === id);
}

// Formats a menu price the way the shop writes it: "$9", "$4.50", "from $38".
function formatMenuPrice(item) {
  const amount = Number.isInteger(item.price) ? `$${item.price}` : formatMoney(item.price);
  return item.priceFrom ? `from ${amount}` : amount;
}

// Formats any amount with two decimals, for subtotals and totals: "$22.50".
function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

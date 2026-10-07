/*
  North Star Bakery: pre-order form validation and saved-list pre-fill
  Author: Azamat Soliev

  - Checks every field with JavaScript and shows a message right under the
    field, so visitors can fix one entry without retyping the others.
  - Applies the bakery's own rules to the pickup date: no Mondays, cakes need
    three days' notice, and Saturday-only items need a Saturday pickup.
  - Fills "Item details" with the pre-order list saved on the products page.
  The site is hosted on GitHub Pages, which cannot receive form posts, so a
  valid request shows a confirmation on the page instead of being sent.
*/

const preorderForm = document.getElementById("preorder-form");
const formStatus = document.getElementById("form-status");
const itemDetails = document.getElementById("item-details");
const charCount = document.getElementById("item-details-count");
const savedListNote = document.getElementById("saved-list-note");
const pickupInput = document.getElementById("pickup-date");

// Length limits and text patterns used by the checks below.
const limits = { nameMin: 2, nameMax: 60, detailsMin: 8, detailsMax: 800, allergyMax: 300 };
const patterns = {
  name: /^\p{L}[\p{L}' .-]*$/u, // starts with a letter; letters, spaces, ' . - after
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, // something@something.domain
  phone: /^\d{3}-\d{3}-\d{4}$/ // 555-014-2218
};

// Each form field name points to the function that checks it. A check returns
// an error message, or an empty string when the value is fine.
const fieldChecks = {
  "full-name": checkFullName,
  email: checkEmail,
  phone: checkPhone,
  "pickup-date": checkPickupDate,
  "request-type": checkRequestType,
  "item-details": checkItemDetails,
  "allergy-notes": checkAllergyNotes
};

/* ---------- Field checks ---------- */

function checkFullName(value) {
  const name = value.trim();
  if (name === "") {
    return "Please enter your full name so we know whose order this is.";
  }
  if (name.length < limits.nameMin) {
    return `Your name needs at least ${limits.nameMin} letters.`;
  }
  if (name.length > limits.nameMax) {
    return `Please keep your name under ${limits.nameMax} characters.`;
  }
  if (!patterns.name.test(name)) {
    return "Use letters, spaces, apostrophes, periods, or hyphens only.";
  }
  return "";
}

function checkEmail(value) {
  const email = value.trim();
  if (email === "") {
    return "Please enter your email address so we can reply.";
  }
  if (!patterns.email.test(email)) {
    return "Enter a valid email address, like name@example.com.";
  }
  return "";
}

function checkPhone(value) {
  const phone = value.trim();
  if (phone !== "" && !patterns.phone.test(phone)) {
    return "Use the format 555-014-2218, or leave this blank.";
  }
  return "";
}

function checkPickupDate(value) {
  if (value === "") {
    return "Choose a pickup date.";
  }

  const pickup = parseDateInput(value);
  if (pickup === null) {
    return "Enter the pickup date as month/day/year.";
  }

  const today = getToday();
  const daysAhead = daysBetween(today, pickup);

  if (daysAhead < 0) {
    return "That date has already passed. Choose today or a later date.";
  }
  if (daysAhead > bakeryInfo.maxDaysAhead) {
    return `We take pre-orders up to ${bakeryInfo.maxDaysAhead} days ahead. Choose a date on or before ${formatDate(addDays(today, bakeryInfo.maxDaysAhead))}.`;
  }
  if (pickup.getDay() === bakeryInfo.closedDay) {
    return `We're closed on ${weekdayNames[bakeryInfo.closedDay]}s. Choose Tuesday through Sunday.`;
  }

  const noticeDays = getNoticeDays(itemDetails.value);
  if (daysAhead < noticeDays) {
    return `Cakes need ${noticeDays} days' notice. Choose ${formatDate(addDays(today, noticeDays))} or later.`;
  }

  const dayOnlyItem = findDayOnlyItem(itemDetails.value, pickup.getDay());
  if (dayOnlyItem) {
    const day = weekdayNames[dayOnlyItem.onlyDay];
    return `${dayOnlyItem.name} is only baked on ${day}s. Choose a ${day}, or remove it from Item details.`;
  }
  return "";
}

function checkRequestType(value) {
  return value === "" ? "Choose the type of request." : "";
}

function checkItemDetails(value) {
  const details = value.trim();
  if (details === "") {
    return "Tell us what you'd like to order or ask about.";
  }
  if (details.length < limits.detailsMin) {
    return `Please add a little more detail (at least ${limits.detailsMin} characters).`;
  }
  if (details.length > limits.detailsMax) {
    return `Please keep this under ${limits.detailsMax} characters. You have ${details.length}.`;
  }
  return "";
}

function checkAllergyNotes(value) {
  const notes = value.trim();
  if (notes.length > limits.allergyMax) {
    return `Please keep allergy notes under ${limits.allergyMax} characters. You have ${notes.length}.`;
  }
  return "";
}

/* ---------- Rules that read the menu data ---------- */

// Menu items whose names appear in the text, e.g. "2 × Seeded rye".
function findMentionedItems(text) {
  const lowerText = text.toLowerCase();
  return menuItems.filter((item) => lowerText.includes(item.name.toLowerCase()));
}

// The longest notice any mentioned item needs. Any mention of "cake" counts,
// because every cake on the menu needs notice.
function getNoticeDays(text) {
  const cakeNotice = menuItems.find((item) => item.category === "cakes").noticeDays;
  let noticeDays = /\bcakes?\b/i.test(text) ? cakeNotice : 0;

  findMentionedItems(text).forEach((item) => {
    if (item.noticeDays && item.noticeDays > noticeDays) {
      noticeDays = item.noticeDays;
    }
  });
  return noticeDays;
}

// The first mentioned item that is baked on a different day than the pickup.
function findDayOnlyItem(text, pickupDay) {
  return findMentionedItems(text).find((item) => item.onlyDay !== undefined && item.onlyDay !== pickupDay);
}

/* ---------- Date helpers ---------- */

// Turns "2026-10-10" into a local date. new Date("2026-10-10") would be read
// as midnight UTC, which is the previous day in time zones west of UTC.
function parseDateInput(value) {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function daysBetween(start, end) {
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

// "Saturday, October 10"
function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// "2026-10-10", the format a date input expects for min and max.
function toDateInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/* ---------- Showing and clearing errors ---------- */

// Radio buttons share one name, so form.elements returns a group whose
// .value is the checked option ("" when none is checked).
function getFieldValue(name) {
  return preorderForm.elements[name].value;
}

function showError(name, message) {
  const error = document.getElementById(`${name}-error`);
  error.textContent = message;
  error.closest(".field").classList.add("has-error");
  getFieldControls(name).forEach((control) => control.setAttribute("aria-invalid", "true"));
}

function clearError(name) {
  const error = document.getElementById(`${name}-error`);
  error.textContent = "";
  error.closest(".field").classList.remove("has-error");
  getFieldControls(name).forEach((control) => control.removeAttribute("aria-invalid"));
}

// The input, textarea, or every radio button for a field name.
function getFieldControls(name) {
  return Array.from(preorderForm.querySelectorAll(`[name="${name}"]`));
}

function isShowingError(name) {
  return document.getElementById(`${name}-error`).textContent !== "";
}

// Checks one field, updates its message, and returns true when it is valid.
function validateField(name) {
  const message = fieldChecks[name](getFieldValue(name));
  if (message) {
    showError(name, message);
    return false;
  }
  clearError(name);
  return true;
}

// Checks every field and returns the names of the ones that failed.
function validateForm() {
  return Object.keys(fieldChecks).filter((name) => !validateField(name));
}

function focusField(name) {
  getFieldControls(name)[0].focus();
}

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status form-status--${type}`;
  formStatus.hidden = false;
}

function showErrorSummary(count) {
  const fieldWord = count === 1 ? "1 field" : `${count} fields`;
  showStatus(`Please fix ${fieldWord} marked above, then send again. Everything else you entered is still here.`, "error");
}

// Keeps the summary under the Send button in step with the fields: it counts
// down as errors are fixed and disappears when none are left.
function refreshErrorSummary() {
  if (!formStatus.classList.contains("form-status--error")) {
    return;
  }
  const remaining = Object.keys(fieldChecks).filter(isShowingError).length;
  if (remaining === 0) {
    formStatus.hidden = true;
    formStatus.className = "form-status";
  } else {
    showErrorSummary(remaining);
  }
}

/* ---------- Character counter ---------- */

function updateCharCount() {
  const length = itemDetails.value.trim().length;
  charCount.textContent = `${length} / ${limits.detailsMax} characters`;
  charCount.classList.toggle("is-over", length > limits.detailsMax);
}

/* ---------- Saved pre-order list ---------- */

// Copies the list saved on the products page into "Item details", unless the
// visitor has already typed something there.
function fillFromSavedList() {
  const savedList = loadPreorderList();
  if (savedList.length === 0 || itemDetails.value.trim() !== "") {
    return;
  }

  itemDetails.value = listToText(savedList);
  savedListNote.hidden = false;

  const preOrderOption = preorderForm.querySelector('input[name="request-type"][value="pre-order"]');
  if (getFieldValue("request-type") === "") {
    preOrderOption.checked = true;
  }
}

/* ---------- Event handlers ---------- */

function handleSubmit(event) {
  event.preventDefault();

  const invalidFields = validateForm();
  if (invalidFields.length > 0) {
    showErrorSummary(invalidFields.length);
    focusField(invalidFields[0]);
    return;
  }

  const firstName = getFieldValue("full-name").trim().split(" ")[0];
  const pickupDay = formatDate(parseDateInput(getFieldValue("pickup-date")));
  preorderForm.reset();
  savedListNote.hidden = true;
  updateCharCount();
  showStatus(`Thank you, ${firstName}! Your request for ${pickupDay} is ready. Online requests are not connected yet, so please call ${bakeryInfo.phone} to confirm your pickup.`, "success");
  formStatus.focus();
}

// While a field shows an error, check it again on every change so the message
// disappears as soon as the entry is fixed.
function handleInput(event) {
  const name = event.target.name;
  if (name === "item-details") {
    updateCharCount();
    // The pickup date rules depend on what is in Item details.
    if (isShowingError("pickup-date")) {
      validateField("pickup-date");
    }
  }
  if (fieldChecks[name] && isShowingError(name)) {
    validateField(name);
  }
  refreshErrorSummary();
}

// Radio buttons and the date picker report their final choice with "change".
function handleChange(event) {
  const name = event.target.name;
  if (name === "request-type" || name === "pickup-date") {
    validateField(name);
    refreshErrorSummary();
  }
}

// When the visitor leaves a field they typed in, check it once.
function handleFocusOut(event) {
  const name = event.target.name;
  if (fieldChecks[name] && event.target.type !== "radio" && event.target.value.trim() !== "") {
    validateField(name);
    refreshErrorSummary();
  }
}

/* ---------- Start ---------- */

function initForm() {
  if (!preorderForm) {
    return;
  }

  // JavaScript shows its own messages, so turn off the browser's pop-ups.
  // Without JavaScript, the HTML required/pattern attributes still apply.
  preorderForm.noValidate = true;

  const today = getToday();
  pickupInput.min = toDateInputValue(today);
  pickupInput.max = toDateInputValue(addDays(today, bakeryInfo.maxDaysAhead));

  fillFromSavedList();
  updateCharCount();

  preorderForm.addEventListener("submit", handleSubmit);
  preorderForm.addEventListener("input", handleInput);
  preorderForm.addEventListener("change", handleChange);
  preorderForm.addEventListener("focusout", handleFocusOut);
}

initForm();

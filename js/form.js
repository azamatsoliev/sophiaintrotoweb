// Contact form confirmation.
// The site is hosted on GitHub Pages, which cannot receive form posts. Once the
// browser's built-in validation passes, show a confirmation on the page instead
// of sending the request to a server.
const form = document.querySelector(".order-form");
const status = document.querySelector("#form-status");

if (form && status) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstName = form.elements["full-name"].value.trim().split(" ")[0];
    status.textContent = `Thank you, ${firstName}! Online requests are not connected yet, so please call (555) 014-2218 to confirm your pickup.`;
    status.hidden = false;
    status.focus();
    form.reset();
  });
}

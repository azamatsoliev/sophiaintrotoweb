# North Star Bakery

A multipage website for North Star Bakery, a fictional neighborhood bakery at 18 Lark Street in Riverbend, MN. It was built for the Intro to Web Development course.

**Author:** Azamat Soliev

**Live site:** https://azamatsoliev.github.io/sophiaintrotoweb/

## Pages

| File            | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `index.html`    | Home: welcome, featured item, audio greeting, hours                  |
| `products.html` | Breads, pastries, and cakes, with the interactive pre-order list     |
| `about.html`    | Bakery story, sourcing, staff, behind-the-scenes video               |
| `contact.html`  | Pre-order and inquiry form with validation, location, and hours      |

## Project structure

```
sophiaintrotoweb/
├── index.html
├── products.html
├── about.html
├── contact.html
├── css/
│   └── styles.css         Shared stylesheet (mobile-first, Flexbox, media queries)
├── js/
│   ├── menu-data.js       Menu categories, items, prices, and ordering rules
│   ├── preorder-list.js   Saves and loads the pre-order list (localStorage)
│   ├── products.js        Interactive menu, category filter, list panel
│   └── contact-form.js    Form validation and pre-fill from the saved list
├── images/                Photos and logo (resized and compressed for the web)
└── media/                 Audio welcome and behind-the-scenes video
```

## Interactive features

**Pre-order list (Products page).** The menu is built from arrays of objects in `menu-data.js`. Visitors filter by category, add items, and set quantities (up to 4 of each, matching the bakery's "call ahead for more than four" rule). The list shows a running estimated total.

**Browser storage.**

- `localStorage` keeps the pre-order list, so it survives a refresh or a later visit, and fills in "Item details" on the contact form.
- `sessionStorage` remembers the chosen menu category for the rest of the visit.

**Form validation (Contact page).** JavaScript checks each field and shows a message right under it, without clearing anything the visitor typed:

- required fields
- name length and characters
- email format
- phone pattern
- pickup date rules
- maximum lengths, with a live character counter

The pickup date rules come from the menu data: no Monday pickups, cakes need 3 days' notice, Saturday-only items need a Saturday, and pre-orders are taken up to 60 days ahead.

## Design system

| Role               | Color       | Hex       |
| ------------------ | ----------- | --------- |
| Background         | Cream       | `#F5EDDB` |
| Text, footer       | Espresso    | `#3A2A1E` |
| Links, buttons     | Brick red   | `#9C4A2C` |
| Decorative accents | Wheat       | `#D9A441` |

Fonts: **Lora** for headings and **Nunito Sans** for body text, both from Google Fonts.

Breakpoints: base styles target phones; layouts adjust at `640px` (tablet) and `900px` (desktop).

## Running locally

The site is plain HTML, CSS, and JavaScript with no build step. In VS Code or GitHub Codespaces, preview it with the Live Preview or Live Server extension. Opening `index.html` directly in a browser also works.

## Deployment

The site is published with GitHub Pages from the `main` branch, at the repository root (**Settings → Pages**).

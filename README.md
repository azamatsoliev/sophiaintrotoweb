# North Star Bakery

A multipage website for North Star Bakery, a fictional neighborhood bakery at 18 Lark Street in Riverbend, MN. It was built for the Intro to Web Development course.

**Live site:** https://azamatsoliev.github.io/north-star-bakery/

## Pages

| File            | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `index.html`    | Home: welcome, featured item, audio greeting, hours      |
| `products.html` | Breads, pastries, and cakes with pricing ranges          |
| `about.html`    | Bakery story, sourcing, staff, behind-the-scenes video   |
| `contact.html`  | Pre-order and inquiry form, location, and hours          |

## Project structure

```
north-star-bakery/
├── index.html
├── products.html
├── about.html
├── contact.html
├── css/
│   └── styles.css   Shared stylesheet (mobile-first, Flexbox, media queries)
├── js/
│   └── form.js      Contact form confirmation message
├── images/          Photos and logo (resized and compressed for the web)
└── media/           Audio welcome and behind-the-scenes video
```

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

The site is plain HTML and CSS with no build step. You can preview it in either of these ways:

- Open `index.html` in a browser.
- In VS Code or GitHub Codespaces, use the Live Preview or Live Server extension.

## Deployment

The site is published with GitHub Pages from the `main` branch, at the repository root (**Settings → Pages**).

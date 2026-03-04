# Alternate Versions (bigy, bigy2, centra)

Alternate “brand” versions are controlled by the **URL parameter `d`** (e.g. `?d=bigy2`).

---

## How it’s triggered

- **Parameter:** `d` (e.g. `index.html?theme=thanksgiving&d=bigy2`)
- **Read in:** `script.js` via `const headerType = urlParams.get('d');`
- **Values:** `bigy` | `bigy2` | `centra` (anything else = default)

---

## Variants

| Value       | Body class | Header/layout              | Calendar area      | Font   |
|------------|------------|-----------------------------|--------------------|--------|
| *(default)*| *(none)*   | header-type1, type1 carousel| Normal (no 2A/2B)  | Nunito |
| **centra**  | *(none)*   | header-type1, type1 carousel| Normal (no 2A/2B)  | Nunito |
| **bigy**   | *(none)*   | header-type2, container2A   | 2A (week combined) | DM Sans|
| **bigy2**  | `bigy2`    | header-type2, container2B   | 2B (week combined)| DM Sans|

---

## centra (`?d=centra`)

- Same as default: **carousel at the top** (type1), default logo, Nunito, default styling. No other changes.
- Use when you want the top carousel with no layout or brand overrides.

---

## bigy (`?d=bigy`)

- **Header:** header-type2; logo = `src/img/bigy/bigy.png`.
- **Calendar:** `week-combined-container2A` shown (2B hidden). Theme background on `.week-theme-section` when bigy.
- **Font:** DM Sans.
- **Styling:** `applyBigyStyling()` — white page/sections, blue game headers (#283f7e, #3d5188, #3e528b), red stars, white header bar, red star counter, black date, etc.
- **Hint button:** Default teal gradient, no lightbulb emoji.
- **Carousel:** `initBigyCarousel()`.

---

## bigy2 (`?d=bigy2`)

- **Body class:** `body.bigy2`.
- **Header:** Same as bigy (header-type2, bigy logo).
- **Calendar:** `week-combined-container2B` shown (2A hidden).
- **Styling:** Same `applyBigyStyling()` plus CSS under `body.bigy2` (help button white, week-theme-section centering, week title/subtitle).
- **Hint button:** Teal gradient, no lightbulb.
- **Carousel:** `initBigyCarousel()`.

---

## Where the code lives

- **script.js:** Branch on `headerType` (~2251+): header/container visibility, logos, body class, font, `applyBigyStyling()` or `applyDefaultStyling()`, carousel init. Theme background uses `d` for bigy (pattern on calendar).
- **styles.css:** `body.bigy2` rules for calendar and help button.
- **index.html:** Boost game img default `src/img/bigy/sweepsGame.png`.

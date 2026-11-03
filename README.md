# NutriTrack 🥗

A sleek, responsive, and fully featured Daily Calorie & Nutrition Tracker built exclusively with pure **HTML5**, **Vanilla CSS**, and **Vanilla JavaScript**. 

Zero external frameworks, no Tailwind, no CSS variables, and no backend needed — all user data, custom daily targets, and hydration logs persist seamlessly in the browser's `localStorage`.

![NutriTrack Preview](https://img.shields.io/badge/Status-Complete-emerald)
![Tech](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)
![Storage](https://img.shields.io/badge/Storage-LocalStorage-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Daily Calorie Dashboard**:
  - Dynamic SVG circular progress gauge with real-time intake vs. allowance calculations.
  - Clear equation breakdown: `Target - Food Intake = Net Remaining` (with automatic deficit/surplus indicators).
- **Macronutrient Tracking**:
  - Dedicated progress bars and gram counters for **Protein**, **Carbohydrates**, and **Dietary Fat**.
  - Dynamic calorie conversion (`4 kcal/g` for protein & carbs, `9 kcal/g` for fat).
- **Hydration Log**:
  - 1-click water buttons (`+250ml`, `+500ml`, `-250ml`) with target progress bar.
- **Categorized Food Logs**:
  - Organize meals across **Breakfast**, **Lunch**, **Dinner**, and **Snacks**.
  - Displays portion sizes, macro pill badges (`P`, `C`, `F`), and subtotal meal calories.
  - Full edit and delete support for any logged entry.
- **Quick Food Suggestions**:
  - 1-click preset chips (Eggs, Chicken Breast, Oatmeal, Salmon, Greek Yogurt, Avocado, etc.) that instantly autofill food name, serving size, calories, and macros.
- **7-Day Trend Analytics**:
  - Interactive history bar chart showing 7-day intake against your goal threshold.
  - Click any day's bar to immediately jump to and review that day's log.
  - Weekly summary stats including 7-day average intake and days target was met.
- **Customizable Nutrition Targets**:
  - Adjust daily calorie, macro, and water targets anytime.
  - One-click target presets: *Fat Loss*, *Maintenance*, *Muscle Gain*, and *Keto*.
- **Data Management & Portability**:
  - **1-Click Sample Data**: Populate 3 days of realistic balanced meals instantly to test out charts and reports.
  - **JSON Export / Backup**: Download your logs and goals as a JSON file.
  - **JSON Import**: Restore backup files anytime.
  - **Data Reset**: Wipe logs with confirmation.

---

## 🚀 Getting Started

No build tools, bundlers, or server setups required!

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🛠️ Tech Stack & Constraints

- **HTML5**: Semantic layout, accessible modal dialogs, and SVG icons.
- **CSS3**: Pure vanilla CSS — custom modern slate/dark mode theme using explicit hex/rgb colors (zero CSS variables, no Tailwind).
- **JavaScript**: Modular vanilla ES6+ with DOM manipulation and persistent browser storage (`window.localStorage`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).


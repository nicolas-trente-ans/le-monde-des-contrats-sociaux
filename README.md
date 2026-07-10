# The World of Social Contracts

A Vue static site that maps the “Le contrat social — Nicolas, 30 ans” meme across countries. Hover countries on the world map for a preview, click to enlarge, then open each country’s page to read its version of the meme. A 15-question quiz (“Which Nicolas are you?”) scores your answers and sends you to your best-matching country.

The app is built with Vue 3, Vite, and [svgMap](https://github.com/StephanWagner/svgMap). Country data, localization, and quiz scoring live in CSV files under `public/assets/data/`. Run `yarn dev` to develop locally, or open the repo in the dev container. The site deploys to GitHub Pages on push to `master`.

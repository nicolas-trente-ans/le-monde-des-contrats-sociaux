# Text formatting guide

How to write copy for `Localization.csv` and related content.

## Locales

Every user-facing string has four columns: `en`, `fr`, `hu`, `pirate`.

- **en** — default; keep clear and neutral.s
- **fr** / **hu** — full translations, not glosses.
- **pirate** — same meaning as English, sacrifice clarity for jokes.

## CSV rules

- Quote any field that contains a comma: `"Az amerikai külsegélyügynökség, amelynek pénze külföldre áramlik."`
- Escape double quotes inside a field by doubling them: `"the viral ""game"" debate"`
- One row per key; columns are `key,en,fr,hu,pirate`

## Country page copy

### `country.XX.label`

Short country name. Usually matches the map label.

### `country.XX.description`

The main narrative under the meme image. This **may** describe the diagram freely — names, ages, programs, flows, and how they connect. Write it as a single dense paragraph in the style of existing countries.

## Entity copy

Entities appear on country explorer cards. They should read like short encyclopedia blurbs, not like alt text for an image.

### `entity.*.name`

- Use the label shown on the meme when there is one (`"Juan, 30"`, `"Insaurralde, 48"`).
- Quote names that contain commas.
- Acronyms and program names stay as-is (`ANSES`, `Progresar`).

### `entity.*.description`

**Do not reference the meme, diagram, image, arrows, branches, or flows as visual objects.**

Avoid:

- "in the meme"
- "in the diagram"
- "at the end of Bryan's branch in the meme"
- "on the black-tax photo"
- "framed in the meme as…"

Prefer standalone descriptions of the real-world thing:

- Good: `Casino gambling linked to street crime and informal economy.`
- Good: `Region receiving remittances from Jose.`
- Bad: `Casino gambling at the end of Bryan's branch in the meme.`

You **may** reference other entities by name when that helps context (`supported through Pedro's black-tax obligations`, `drawing ANSES benefits toward bingo halls`).

Other guidelines:

- One or two sentences; aim for under ~25 words in English when possible.
- Tier 1 (central figure): stressed taxpayer at the center of the country's social contract.
- Tier 2 (programs): what the institution does.
- Tier 3 (people/places): who they are and their role in the social contract.

### `relation.*`

Short verb phrases used in relationship rows: `funds`, `flows to`, `supports`, `taxes fund`, etc. Keep them lowercase in English.

## UI chrome

Keys like `country.entities.title` and `country.entities.relationships` are interface labels, not entity blurbs. They may mention "meme" where it helps orient the reader on the explorer page.

## Reference links

Entity `wikipedia_title`, `grokipedia_url`, and `britannica_url` in `entities.csv` should point to real pages. Verify URLs return 200 before adding them. If no good article exists, leave the field empty rather than linking to a loose match.

## Checklist before submitting copy

1. All four locales filled for every new key.
2. Commas inside `fr` / `hu` / `pirate` fields are quoted.
3. Entity descriptions contain no meme/diagram/arrow/branch/photo references.
4. `yarn validate-entities` and `yarn test` pass.

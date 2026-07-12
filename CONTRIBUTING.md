# Contributing

## Adding a new country

All country content lives under `public/assets/`. To add a country, update these files:

### 1. Register the country

Add a row to [`public/assets/data/countries.csv`](public/assets/data/countries.csv):

```csv
country_code,image_file
US,american.jpg
```

- `country_code` — ISO 3166-1 alpha-2 (must match svgMap’s map IDs, e.g. `FR`, `US`)
- `image_file` — filename in `public/assets/images/`

### 2. Add the meme image

Place the image in [`public/assets/images/`](public/assets/images/) using the filename from `countries.csv`.

### 3. Add localization

Add two keys to [`public/assets/data/Localization.csv`](public/assets/data/Localization.csv) (one row per locale column: `en`, `fr`, `hu`):

```csv
country.US.label,United States,États-Unis,Egyesült Államok
country.US.description,"Short English description of this country's Nicolas meme.","Courte description française du mème Nicolas pour ce pays.","Rövid magyar leírás az adott ország Nicolas-mémjéről."
```

Replace `US` with your country code in the key names.

### 4. (Optional) Add quiz scoring

To include the country in the quiz, add rows to [`public/assets/data/quiz_scores.csv`](public/assets/data/quiz_scores.csv) for each answer you want to influence that country:

```csv
question_id,answer_id,country_code,score
q01,a,US,3
q01,b,US,-1
```

- `question_id` / `answer_id` — see [`src/composables/useQuiz.ts`](src/composables/useQuiz.ts) (`QUIZ_QUESTIONS`) and [`quiz.txt`](quiz.txt)
- `score` — integer from `-5` to `+5`

The quiz picks the country with the highest total score. Ties go to the country listed first in `countries.csv`.

When adding quiz scores for a new country, do **not** copy France’s scores and only add positive deltas — that makes France almost unwinnable. Instead:

- Use a **mixed baseline** (`FR`, `CN`, or an already-scored country) per country profile
- Apply both **positive and negative** deltas so each country has strengths and blind spots
- Run `yarn rebalance-quiz-scores` after editing profiles in [`public/assets/data/quiz_score_profiles.csv`](public/assets/data/quiz_score_profiles.csv)
- Run `yarn test` to verify quiz score balancing. Tests require **France and China** to win their favorable paths; other countries only need to score within **2 points** of the leader on theirs (exact wins are optional and ties are fine).

See [`scripts/lib/quiz-score-rebalance.mjs`](scripts/lib/quiz-score-rebalance.mjs) for how profiles are applied.

### 5. Verify

```bash
yarn dev
```

Check the map (hover/click), the country page (`/country/XX`), and the quiz if you added scores.

## Adding entities to a country (meme exploration)

Entity data lets visitors explore people, programs, and relationships on a country page. **Only the United States is fully populated in the pilot**; other countries can be added using the same workflow.

### 1. Register entities

Add rows to [`public/assets/data/entities.csv`](public/assets/data/entities.csv):

```csv
entity_id,name_key,description_key,image_file,wikipedia_title,grokipedia_url,britannica_url,linked_country_code
us.james,entity.us.james.name,entity.us.james.description,,,,
us.medicare,entity.us.medicare.name,entity.us.medicare.description,,Medicare_(United_States),,,
il,entity.il.name,entity.il.description,,Israel,,,IL
```

- `entity_id` — stable slug (`us.james` for country-specific; bare ISO code when the entity is another country's social contract)
- `name_key` / `description_key` — localization keys (convention: `entity.{entity_id}.name` / `.description`)
- `image_file` — optional, placed in `public/assets/images/entities/`
- `wikipedia_title` — article title for live preview (underscores for spaces)
- `grokipedia_url` / `britannica_url` — optional “further reading” links
- `linked_country_code` — optional ISO code; renders a link to `/country/{code}`

### 2. Map entities to a country

Add rows to [`public/assets/data/country_entities.csv`](public/assets/data/country_entities.csv):

```csv
country_code,entity_id,tier,priority
US,us.james,1,10
US,us.medicare,2,30
```

- `tier` — section on the country page (1 = central figure, 2 = programs, 3 = people/places)
- `priority` — sort order within the tier (lower = earlier)

### 3. Add relationships (optional)

Add rows to [`public/assets/data/entity_relationships.csv`](public/assets/data/entity_relationships.csv):

```csv
country_code,from_entity_id,to_entity_id,relationship_key
US,us.james,us.medicare,relation.taxes_fund
```

Add localized edge labels to [`public/assets/data/Localization.csv`](public/assets/data/Localization.csv) (e.g. `relation.taxes_fund`).

### 4. Add localization strings

For each entity, add `name` and `description` keys in all four locales (`en`, `fr`, `hu`, `pirate`) before `quiz.title` in `Localization.csv`.

UI keys used by the entity explorer: `country.entities.*`, `settings.*`, `reference.*`, `relation.*`.

### 5. Validate

```bash
yarn validate-entities
yarn test
```

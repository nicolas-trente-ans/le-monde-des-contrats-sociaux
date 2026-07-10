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
- Run `yarn test` to verify quiz score balancing

See [`scripts/lib/quiz-score-rebalance.mjs`](scripts/lib/quiz-score-rebalance.mjs) for how profiles are applied.

### 5. Verify

```bash
yarn dev
```

Check the map (hover/click), the country page (`/country/XX`), and the quiz if you added scores.

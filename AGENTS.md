# Agent instructions

## Token preservation (entity / country registration)

Registering a country’s meme explorer is cheap in **repo data** (~1.5–3k tokens of CSV) but expensive in **session tokens** when the agent re-reads images, fetches URLs, and reruns lint. Prefer the lean path unless the user asks for full fidelity.

### Cost reality

| Mode                                          | Rough session cost | What you get                                      |
| --------------------------------------------- | ------------------ | ------------------------------------------------- |
| Lean write                                    | ~8–20k             | CSVs + localization from a given entity list      |
| Full vision + URL checks + tests + follow-ups | often ~50k+        | Complete extract from `*.jpg` with verified links |

Final `Localization.csv` rows are most of the stored size; image vision and tool/test churn dominate burn rate.

### Default lean workflow

When the user asks to register entities for a country:

1. **Prefer a user-supplied list** of entities and relationship edges. Do not re-attach or re-vision the meme if flows were already listed or the image was already described in the thread.
2. **Write once** — append `entities.csv`, `country_entities.csv`, `entity_relationships.csv`, and localization in one pass. Avoid “partial then complete” follow-ups.
3. **Skip `yarn lint`** unless Vue/TS source changed. Prefer `yarn validate-entities` (and `yarn test` only if entity tests are affected).
4. **Keep descriptions short** (~15–25 English words). Follow [`FORMAT.md`](FORMAT.md): no “in the meme / diagram / arrow” wording.
5. **Reuse existing `relation.*` keys.** Do not invent new relation/UI chrome keys unless needed.
6. **Relationships = green arrows first.** Ambient charts (prices, migration lines, crime graphs) are optional; add only if the user wants full fidelity.
7. **Locales:** fill `en`, `fr`, `hu`, `pirate`. If the user asks to save tokens, English-first with short mirrored placeholders for other locales is acceptable until a later batch translation pass.

### Preferred user prompt (copyable)

```text
From this list only, append entities / country_entities / relationships / localization
for XX. No image re-read. No URL fetching. No lint. Follow FORMAT.md and CONTRIBUTING.md.
```

Then include bullets: entity ids, tiers, and `from → relation → to` edges.

### When full mode is OK

Use vision + link verification + broader relationship extraction when the user explicitly wants “full extract from the image,” “verify links,” or “don’t miss any arrows.”

### Related docs

- Entity workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Copy / CSV / HTML-in-descriptions: [`FORMAT.md`](FORMAT.md)

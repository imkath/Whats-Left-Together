# What's Left Together

A statistical mirror of how many times you might still see the people you love.

## About

This project uses official demographic life tables to estimate how many more in-person visits you might share with someone important, if current conditions remain the same.

**Purpose**: To make explicit the finite nature of time with loved ones, enabling more conscious decisions about priorities.

## Features

- **Real UN Data**: Life tables from UN World Population Prospects 2024 (81 countries)
- **Age-specific calculations**: Uses residual life expectancy (ex) by age, sex, and country
- **Uncertainty ranges**: Shows probabilistic ranges (p25-p75), not single predictions
- **Two modes**: Normal (thoughtful) and Direct (blunt) language options
- **Multiple relationships**: Parents, grandparents, partners, friends, and others
- **Bilingual**: Spanish and English

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Data Sources

### Primary Source

- **UN World Population Prospects 2024** - Official life tables by age, sex, and country
- Coverage: 81 countries (expandable to 237)
- Year: 2023 (most recent estimates)
- URL: https://population.un.org/wpp/

### Validation Sources

- WHO Global Health Observatory
- Human Mortality Database

See [SOURCES.md](SOURCES.md) for complete references.

## Methodology

### Core Calculation

For each person, we calculate survival probabilities using life tables:

- `lx`: Survivors to age x (out of 100,000 births)
- `qx`: Probability of death between age x and x+1
- `P(survive t years) = l(a+t) / l(a)`

**Monte Carlo Simulation** (10,000 iterations):

```
For each simulation:
  1. Sample death year for each person using qx probabilities
  2. Calculate years both alive = min(death_year_you, death_year_them)
  3. Total visits = years_both_alive × visits_per_year

Results:
  - Median (p50): Primary result shown
  - Range [p25, p75]: Confidence interval
```

This provides statistically valid confidence intervals based on the empirical distribution of possible outcomes.

See [METHODOLOGY.md](METHODOLOGY.md) for complete mathematical model and scientific references.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Data Processing**: Python (pandas) + Node.js

## Project Structure

```
.
├── public/data/life-tables/     # 162 JSON files (81 countries × 2 sexes)
├── src/
│   ├── app/[locale]/           # Next.js pages (ES/EN)
│   ├── components/             # React components
│   ├── lib/
│   │   ├── models/actuarial.ts # Core calculation logic
│   │   ├── data/               # Data access layer + countries.json
│   │   └── i18n/               # Translations (es.json, en.json)
│   └── types/                  # TypeScript definitions
├── scripts/
│   └── process_life_tables.py  # UN data processing script
└── METHODOLOGY.md              # Scientific documentation
```

## Data Processing

Life tables are pre-processed from UN Excel files:

```bash
# Install Python dependencies
pip install pandas openpyxl

# Process UN data (requires source XLSX files in src/lib/data/raw/)
python3 scripts/process_life_tables.py
```

**Source files needed**:

- `WPP2024_MORT_F06_2_SINGLE_AGE_LIFE_TABLE_ESTIMATES_MALE.xlsx`
- `WPP2024_MORT_F06_3_SINGLE_AGE_LIFE_TABLE_ESTIMATES_FEMALE.xlsx`

Download from: https://population.un.org/wpp/downloads?folder=Standard%20Projections&group=Mortality

## Ethical Guidelines

### This tool is NOT:

- A medical prediction
- Advice for life decisions
- A reason for anxiety or extreme actions

### This tool IS:

- A statistical approximation based on population averages
- A reflection tool for conscious prioritization
- A reminder of time's finite nature

**Important**: If you experience persistent anxiety using this tool, please seek support from trusted people or mental health professionals.

## Feedback

If you have suggestions, find bugs, or want to share your thoughts, use the feedback form available in the footer of the website.

## License

This project is intended for ethical and educational use. Users are expected to:

- Not use for commercial exploitation
- Not use to manipulate or pressure others
- Not present as medical or insurance advice

## Citation

If you use this project in research or publications:

```
What's Left Together (2025). A statistical calculator for expected encounters
based on UN World Population Prospects 2024.
https://whats-left-together-cl.vercel.app
```

---

**Last updated**: 2025-01-21
**Data version**: UN WPP-2024 (year 2023)
**Countries**: 81 (expandable to 237)

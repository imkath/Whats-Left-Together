# What's Left Together

A statistical mirror of how many times you might still see the people you love.

## About

This project uses official demographic life tables to estimate how many more in-person visits you might share with someone important, if current conditions remain the same.

**Purpose**: To make explicit the finite nature of time with loved ones, enabling more conscious decisions about priorities.

## Features

- **Real UN Data**: Life tables from UN World Population Prospects 2024 (81 countries)
- **Age-specific calculations**: Uses residual life expectancy (eₓ) by age, sex, and country
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

For each person, we obtain:

- Current age: `a`
- Residual life expectancy: `eₐ` (expected remaining years, conditional on being alive at age a)

**Expected encounters**:

```
E[visits] = Σ(t=0 to T) f × P(both alive in year t)

where:
- f = visits per year (assumed constant)
- P(both alive in t) = P(you alive in t) × P(them alive in t)
- P(alive in t) = l(a+t) / l(a)  [from UN life tables]
```

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

Download from: https://population.un.org/wpp/Download/Standard/Mortality/

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Voice and tone guidelines
- Code style
- How to add countries
- How to update data sources

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

## License

MIT License - See [LICENSE](LICENSE)

**Expectation**: This project is intended for ethical and educational use. While open source, we expect users to:

- Not use for commercial exploitation without attribution
- Not use to manipulate or pressure others
- Not present as medical or insurance advice

## Citation

If you use this project in research or publications:

```
What's Left Together (2025). A statistical calculator for expected encounters
based on UN World Population Prospects 2024.
https://github.com/imkath/Whats-Left-Together
```

## Contact

- **Issues**: [GitHub Issues](https://github.com/imkath/Whats-Left-Together/issues)
- **Discussions**: [GitHub Discussions](https://github.com/imkath/Whats-Left-Together/discussions)

---

**Last updated**: 2025-11-14
**Data version**: UN WPP-2024 (year 2023)
**Countries**: 81 (expandable to 237)

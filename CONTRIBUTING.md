# Contributing to What's Left Together

Thank you for your interest in contributing! This project aims to provide a thoughtful, data-driven tool for reflection on finite time with loved ones.

## Voice and Tone Guidelines

The project follows three core principles:

### 1. Direct (without euphemisms)
- Use clear, straightforward language
- Example: "You might have 20-30 more visits" not "many opportunities ahead"
- Avoid softening reality with unnecessary qualifiers

### 2. Concise but caring
- Brief and sober when presenting numbers
- Warm and contextual in explanations
- No melodrama or gratuitous drama

### 3. Data-grounded
- Every claim backed by sources
- Always acknowledge uncertainty and limitations
- Example: "Based on UN life tables for Chile, not individual health factors"

### Examples

**Good**:
> "If everything stays the same, you might see your grandmother about 12 to 24 more times in your life."

**Avoid**:
> "You have countless precious moments remaining with your beloved grandmother!"

### Two Modes

The calculator offers two language modes:

**Normal mode** (default):
- Thoughtful, considerate phrasing
- Context and explanations included
- Example: "According to life expectancy data for Chile and both ages, it's reasonable to expect..."

**Direct mode** (user opt-in):
- Blunter language
- Minimal cushioning
- Example: "At this rate, you don't have many visits left with your mother."

Both modes use **identical calculations** - only the language changes.

## Code Style

### TypeScript
- Use strict type checking
- Prefer explicit types over `any`
- Document complex calculations with comments

### React Components
- Functional components with hooks
- Use `'use client'` directive when needed
- Keep components focused (single responsibility)

### File Naming
- Components: PascalCase (`Calculator.tsx`)
- Utilities: camelCase (`actuarial.ts`)
- Data files: lowercase with underscores (`countries.json`)

## Adding Countries

To add more countries to the calculator:

1. Edit `scripts/process_life_tables.py`
2. Add ISO3 code to `CONFIG['countries']` list
3. Add country name to `CONFIG['country_names']` dict
4. Run the processing script:
   ```bash
   python3 scripts/process_life_tables.py
   ```

**Note**: UN WPP-2024 has data for 237 countries. We currently process 81.

## Updating Data Sources

When UN releases new data:

1. Download new XLSX files from https://population.un.org/wpp/
2. Place in `src/lib/data/raw/`
3. Update `CONFIG['target_year']` in `process_life_tables.py`
4. Run processing script
5. Update README.md and METHODOLOGY.md with new year/version
6. Verify calculations with test cases

## Testing Checklist

Before submitting a PR, verify:

- [ ] Calculator loads without errors
- [ ] Country selector shows all countries
- [ ] Calculations produce reasonable results
- [ ] Both language modes work
- [ ] Spanish and English translations present
- [ ] No console errors
- [ ] Life table files load correctly

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/add-brazil-data`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push and create a PR

### Commit Message Format

```
type: brief description

Longer explanation if needed

Examples:
- feat: add support for 20 new countries
- fix: correct life expectancy calculation for age >95
- docs: update methodology with new UN data source
- style: improve mobile layout for results page
```

## Ethical Considerations

When contributing, please keep in mind:

- **Not medical advice**: This tool provides statistical approximations, not medical predictions
- **Minimize anxiety**: Changes should be thoughtful, not alarmist
- **Respect privacy**: Don't collect user data
- **Inclusive language**: Avoid assumptions about relationships or family structures

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for larger changes or ideas
- Check existing issues before creating new ones

---

**Thank you for helping make this tool more useful and accessible!**

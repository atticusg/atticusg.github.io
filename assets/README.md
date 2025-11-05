# Publications Management System

This folder contains an extensible system for managing research publications on the website. All publications are automatically generated from BibTeX data and displayed on both the research page and bibliography page.

## 📁 System Overview

### Core Files
- **`filtered_geiger.bib`** - Master BibTeX file (source of truth for all publications)
- **`publications-data.js`** - Generated structured data used by website pages
- **`generate-publications.js`** - Node.js script for converting BibTeX to structured data
- **`bibliography.html`** - Complete bibliography with BibTeX entries for linking

### Website Pages
- **`../index.html`** - Main homepage with bio, navigation, and dark mode
- **`../research.html`** - Research page displaying all publications
- **`../assets/bibliography.html`** - Full bibliography with BibTeX entries

## 🔄 How to Add/Modify Publications

### Step 1: Update the BibTeX File
1. Open `filtered_geiger.bib` in a text editor
2. Add new BibTeX entries or modify existing ones
3. Ensure each entry follows standard BibTeX format:

```bibtex
@article{key2024,
    title = {Your Paper Title},
    author = {Atticus Geiger and Other Author},
    year = {2024},
    journal = {Conference/Journal Name},
    url = {https://arxiv.org/abs/xxxx.xxxxx}
}
```

**Important formatting notes:**
- Use consistent author name formatting (the system will automatically bold "Atticus Geiger")
- Use `*` after names for equal contribution (e.g., `Author One* and Author Two*`)
- Include a `url` field for the "Paper" link
- Use consistent venue names
- Ensure proper brace matching `{}` for all fields

### Step 2: Regenerate Publications Data
1. Run the generation script:
   ```bash
   cd assets
   node generate-publications.js
   ```
2. This will automatically update `publications-data.js` with all entries
3. The research page and bibliography will automatically display the updated content

### Step 3: Verify Changes
1. Open `../research.html` in your browser to see all publications
2. Test that "Paper" links work correctly
3. Test that "BibTeX" links navigate to the correct bibliography anchors
4. Verify both light and dark mode display properly

## 🛠 System Architecture

### Data Flow
```
filtered_geiger.bib → generate-publications.js → publications-data.js → research.html & bibliography.html
```

### Key Features
- **Single source of truth**: All publication data comes from `filtered_geiger.bib`
- **Automatic sorting**: Publications are sorted by year (descending) then by title
- **Anchor linking**: Each publication gets a unique anchor for direct linking
- **Author formatting**: Automatic bolding of "Atticus Geiger" in author lists
- **URL handling**: Automatic "Paper" link generation from BibTeX URLs
- **Dark mode support**: All pages support light/dark theme switching
- **Dynamic bibliography**: BibTeX entries generated from structured data

## 📋 BibTeX Field Mapping

The parser extracts these fields from BibTeX entries:

| BibTeX Field | Purpose | Example |
|--------------|---------|---------|
| `title` | Publication title | `title = {Paper Title}` |
| `author` | Author list | `author = {Atticus Geiger and Other Author}` |
| `year` | Publication year | `year = {2024}` |
| `journal`/`booktitle` | Venue name | `journal = {Nature}` |
| `url`/`eprint` | Paper link | `url = {https://arxiv.org/abs/xxxx}` |

### Venue Detection
- `booktitle` → Conference paper
- `journal` → Journal article
- `eprint` → arXiv preprint
- `note` containing "arXiv" → arXiv preprint

## 🔧 Troubleshooting

### Common Issues

**Problem**: Publications don't appear on research page
**Solution**: Check browser console for JavaScript errors. Ensure `publications-data.js` is valid JavaScript.

**Problem**: BibTeX links don't work
**Solution**: Verify that bibliography.html is accessible and anchor IDs match.

**Problem**: Author names not formatted correctly
**Solution**: Ensure "Atticus Geiger" appears exactly in author field (automatic bolding applied)

**Problem**: Parse errors in BibTeX
**Solution**: Check for unmatched braces `{}` or missing commas in BibTeX entries

### Validation Checklist
- [ ] `filtered_geiger.bib` has valid BibTeX syntax
- [ ] `publications-data.js` is valid JavaScript array
- [ ] All "Paper" links work and open correct URLs
- [ ] All "BibTeX" links navigate to correct bibliography anchors
- [ ] Author names are formatted correctly with bolding
- [ ] Publication count matches expected number
- [ ] Both light and dark themes display properly

## 📝 File Maintenance

### Regular Updates
1. **Adding new papers**: Edit BibTeX file, then run `node generate-publications.js`
2. **Fixing typos**: Edit `filtered_geiger.bib`, then regenerate data
3. **Changing venue names**: Update in BibTeX, then regenerate
4. **Adding missing URLs**: Add `url` field to BibTeX entry, then regenerate

### Backup Strategy
- Keep backups of `filtered_geiger.bib` (master file)
- The generated files can always be recreated from the BibTeX file
- Consider version control for tracking changes over time

## 🎯 Advanced Usage

### Filtering Publications
To exclude certain publications, remove them from `filtered_geiger.bib`. The parser includes all valid entries by default.

### Custom Formatting
Modify the rendering functions in:
- `research.html` (lines ~130-170) for research page display
- `bibliography.html` (lines ~90-130) for BibTeX formatting

### Adding New Fields
1. Update the parser in `generate-publications.js` to extract new fields
2. Modify the rendering code in HTML files to display new fields
3. Update this documentation

## 📊 Current Status

- **Total publications**: 41 (as of last generation)
- **Years covered**: 2016-2025
- **File types supported**: @article, @inproceedings, @misc, @InProceedings
- **Features**: Dark mode, responsive design, anchor linking, copy-to-clipboard

---

**Need help?** Check the browser console for errors or review existing BibTeX entries for formatting examples.
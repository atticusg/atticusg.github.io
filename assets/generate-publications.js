#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class BibTeXParser {
    constructor() {
        this.publications = [];
    }

    parse(bibtexContent) {
        // Split entries by @ at the beginning of lines
        const entries = bibtexContent.split(/(?=^@)/gm).filter(entry => entry.trim());

        this.publications = entries
            .map(entry => this.parseEntry(entry.trim()))
            .filter(pub => pub !== null)
            .sort((a, b) => {
                // Sort by year (descending) then by title
                if (b.year !== a.year) return parseInt(b.year) - parseInt(a.year);
                return a.title.localeCompare(b.title);
            });

        return this.publications;
    }

    parseEntry(entry) {
        try {
            // Extract entry type and key
            const typeMatch = entry.match(/@(\w+)\{([^,]+),/);
            if (!typeMatch) return null;

            const [, type, key] = typeMatch;

            // Parse all entries - no filtering

            const pub = {
                id: this.generateId(key),
                type: type.toLowerCase(),
                key: key.trim(),
                title: this.extractField(entry, 'title'),
                authors: this.extractField(entry, 'author') || this.extractField(entry, 'Author'),
                year: this.extractField(entry, 'year'),
                venue: this.getVenue(entry, type),
                url: this.getUrl(entry),
                bibtexAnchor: this.generateId(key)
            };

            // Clean title
            pub.title = pub.title.replace(/[{}""]/g, '').replace(/\s+/g, ' ').trim();
            if (!pub.title) return null;

            // Format authors
            pub.authors = this.formatAuthors(pub.authors);
            if (!pub.authors) return null;

            return pub;
        } catch (error) {
            console.warn('Error parsing entry:', error);
            return null;
        }
    }

    extractField(entry, fieldName) {
        // Create regex to find the exact field (word boundary to avoid partial matches like "title" in "booktitle")
        const fieldRegex = new RegExp(`\\b${fieldName}\\s*=\\s*`, 'i');
        const fieldMatch = entry.match(fieldRegex);
        if (!fieldMatch) return '';

        // Find where the field starts
        const startIndex = fieldMatch.index + fieldMatch[0].length;

        // Handle different value formats
        if (entry[startIndex] === '{') {
            // Handle braced values with proper nesting
            let braceCount = 0;
            let i = startIndex;
            let start = i + 1; // Skip opening brace

            do {
                if (entry[i] === '{') braceCount++;
                else if (entry[i] === '}') braceCount--;
                i++;
            } while (braceCount > 0 && i < entry.length);

            if (braceCount === 0) {
                return entry.substring(start, i - 1).trim(); // Exclude closing brace
            }
        } else if (entry[startIndex] === '"') {
            // Handle quoted values
            const endQuote = entry.indexOf('"', startIndex + 1);
            if (endQuote !== -1) {
                return entry.substring(startIndex + 1, endQuote).trim();
            }
        }

        return '';
    }

    getVenue(entry, type) {
        // Try different venue fields in order of preference
        const venueFields = ['booktitle', 'journal', 'note'];

        for (const field of venueFields) {
            const venue = this.extractField(entry, field);
            if (venue) return venue.replace(/[{}]/g, '').trim();
        }

        // Handle arXiv preprints
        const eprint = this.extractField(entry, 'eprint');
        if (eprint || entry.includes('arXiv')) {
            return 'arXiv preprint';
        }

        return type === 'inproceedings' ? 'Conference Paper' :
               type === 'article' ? 'Journal Article' :
               'Publication';
    }

    getUrl(entry) {
        // Try different URL fields
        const urlFields = ['url', 'eprint'];

        for (const field of urlFields) {
            const url = this.extractField(entry, field);
            if (url) {
                // Convert eprint to arXiv URL
                if (field === 'eprint' && !url.startsWith('http')) {
                    return `https://arxiv.org/abs/${url}`;
                }
                return url;
            }
        }
        return '';
    }

    formatAuthors(authorString) {
        if (!authorString) return '';

        const authors = authorString.split(' and ').map(author => {
            return author.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
        });

        return authors.join(', ');
    }

    generateId(key) {
        return key.toLowerCase()
                  .replace(/[^a-z0-9]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
    }

    generateJS() {
        return `// 📚 Publications Data - Auto-generated from filtered_geiger.bib
//
// 🔄 To update this file:
// 1. Edit filtered_geiger.bib with new/modified entries
// 2. Run: node generate-publications.js
// 3. The research page will automatically use the updated data
//
// Generated on: ${new Date().toISOString()}
// Total publications: ${this.publications.length}

const publications = ${JSON.stringify(this.publications, null, 2)};

// For use in browsers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = publications;
}`;
    }
}

// Main execution
function main() {
    const bibFilePath = path.join(__dirname, 'filtered_geiger.bib');
    const outputPath = path.join(__dirname, 'publications-data.js');

    try {
        console.log('Reading BibTeX file:', bibFilePath);
        const bibtexContent = fs.readFileSync(bibFilePath, 'utf8');

        const parser = new BibTeXParser();
        console.log('Parsing BibTeX entries...');
        const publications = parser.parse(bibtexContent);

        console.log(`Successfully parsed ${publications.length} publications`);

        const jsContent = parser.generateJS();
        fs.writeFileSync(outputPath, jsContent);

        console.log('Generated publications-data.js with', publications.length, 'entries');
        console.log('Output saved to:', outputPath);

        // Show publication breakdown by year
        const byYear = publications.reduce((acc, pub) => {
            const year = pub.year || 'Unknown';
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {});

        console.log('\nPublications by year:');
        Object.keys(byYear).sort((a, b) => b - a).forEach(year => {
            console.log(`  ${year}: ${byYear[year]} publications`);
        });

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { BibTeXParser };
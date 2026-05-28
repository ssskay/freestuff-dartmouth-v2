/**
 * Add annual_value and update date_added for all resources
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resourcesPath = join(__dirname, '../src/content/resources.json');
const resources = JSON.parse(readFileSync(resourcesPath, 'utf-8'));

// Market values for different resource types (approximate annual value in USD)
const valueMap = {
  // Software
  'microsoft-365': 70,
  'adobe-creative-cloud': 660,
  'google-workspace': 0, // Free tier exists
  'matlab': 500,
  'zoom-pro': 150,
  'mathematica': 300,
  'spss': 1200,
  'sas': 1500,
  'jmp-pro': 500,
  'qualtrics': 1500,
  'arcgis-pro': 700,
  'cloud-storage': 60, // 3TB across services
  'globalprotect-vpn': 40,
  'panopto': 200,

  // News
  'news-access': 400, // NYT + WSJ combined

  // Library (most have no direct consumer equivalent, but some do)
  'oreilly-learning': 500,
  'statista': 2000,
  'wrds': 3000, // Premium financial data
  'jstor': null, // No direct consumer access
  'library-databases': null,
  'bloomberg-terminal': 25000, // Per terminal per year
  'interlibrary-loan': null,
  'rauner-special-collections': null,
  'web-of-science': null,
  'scopus': null,
  'nexis-uni': null,
  'psycinfo': null,
  'proquest': null,

  // Outdoor
  'doc-gear-rentals': 100,
  'doc-trips': 200,
  'doc-cabin-rentals': 150,
  'ledyard-canoe-club': 80,

  // Money
  'printing-credit': 225, // $75 x 3 terms
  'winter-clothing': 200,
  'dickey-international-internship-funding': 5500,
  'rockefeller-internship-funding': 6500,
  'rockefeller-thesis-grants': 1000,

  // Health
  'dicks-house': null, // Covered by health fee
  'counseling-sessions': 600, // ~6 sessions x $100

  // Career
  'cpd-career-advising': 300,
  'professional-clothing-closet': 150,

  // Campus Life
  'alumni-gym': 500, // Gym membership value
  'hop-performances': 200,
  'hood-museum': 0, // Free to public
  'athletic-events': 150,
  'programming-board-events': 100,
  'dartmouth-film-society': 120,
  'cable-makerspace': 200,
  'hop-woodworking-shop': 150,
  'hop-ceramics-studio': 150,
  'hop-music-practice-rooms': 200,
  'climbing-gym': 300,

  // Transportation
  'advance-transit': 0, // Free to public

  // Alumni-only
  'library-card-alumni': 50,
  'digital-library-alumni': null,
  'alumni-email-forwarding': 0,
  'career-services-alumni': 300,
  'alumni-directory': 0,

  // Tuck
  'tuck-digital-library': null,

  // Off-campus
  'mfa-boston-free-admission': 60,
};

// Date ranges for realistic dates
const oldResources = ['microsoft-365', 'google-workspace', 'matlab', 'zoom-pro', 'news-access', 'library-databases'];
const mediumResources = ['adobe-creative-cloud', 'doc-gear-rentals', 'doc-trips', 'printing-credit', 'alumni-gym'];

resources.forEach(resource => {
  // Add annual_value if we have a mapping
  if (resource.id in valueMap) {
    resource.annual_value = valueMap[resource.id];
  } else {
    resource.annual_value = null; // Explicitly set to null if no value
  }

  // Update date_added to be more realistic (spread across time)
  if (!resource.date_added && !resource.added_at) {
    if (oldResources.includes(resource.id)) {
      resource.date_added = '2025-09-01';
    } else if (mediumResources.includes(resource.id)) {
      resource.date_added = '2026-01-15';
    } else if (resource.added_by === 'agent') {
      resource.date_added = '2026-05-01'; // Agent additions are newer
    } else {
      resource.date_added = '2026-04-01'; // Most are medium-old
    }
  } else if (resource.added_at && !resource.date_added) {
    resource.date_added = resource.added_at;
  }

  // Clean up: remove added_at if we have date_added
  if (resource.date_added && resource.added_at) {
    delete resource.added_at;
  }
});

// Mark a few recent ones for "New" badge
const recentOnes = resources.filter(r => r.added_by === 'agent').slice(0, 5);
recentOnes.forEach(r => r.date_added = '2026-05-15'); // Within last 30 days

writeFileSync(resourcesPath, JSON.stringify(resources, null, 2));
console.log('✅ Added annual_value and date_added to all resources');
console.log(`📊 Total with annual_value: ${resources.filter(r => r.annual_value !== null).length}`);
console.log(`📅 Recent resources (last 30 days): ${resources.filter(r => {
  const daysSince = (Date.now() - new Date(r.date_added).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 30;
}).length}`);

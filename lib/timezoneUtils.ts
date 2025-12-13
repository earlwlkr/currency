import cityTimezones from 'city-timezones';

export const TIMEZONE_ABBREVIATIONS: Record<string, string> = {
    AEST: 'Australia/Sydney',
    AEDT: 'Australia/Sydney',
    ACST: 'Australia/Adelaide',
    ACDT: 'Australia/Adelaide',
    AWST: 'Australia/Perth',
    PST: 'America/Los_Angeles',
    PDT: 'America/Los_Angeles',
    EST: 'America/New_York',
    EDT: 'America/New_York',
    CST: 'America/Chicago',
    CDT: 'America/Chicago',
    MST: 'America/Denver',
    MDT: 'America/Denver',
    HST: 'Pacific/Honolulu',
    AKST: 'America/Anchorage',
    AKDT: 'America/Anchorage',
    // GMT: 'Etc/GMT',
    // UTC: 'Etc/UTC',
    CET: 'Europe/Paris',
    CEST: 'Europe/Paris',
    EET: 'Europe/Athens',
    EEST: 'Europe/Athens',
    JST: 'Asia/Tokyo',
    KST: 'Asia/Seoul',
    IST: 'Asia/Kolkata',
    NZST: 'Pacific/Auckland',
    NZDT: 'Pacific/Auckland',
};

const allTimezones = Intl.supportedValuesOf('timeZone');

export interface SearchResult {
    id: string;   // The IANA timezone ID (e.g., "America/New_York")
    label: string; // The display label (e.g., "New York, United States")
    sub: string;  // Additional info (e.g., "EST" or GMT offset)
}

export function searchTimezones(query: string): SearchResult[] {
    if (!query) {
        // Return default view or empty, maybe some popular ones?
        // For now let's just return a slice of allTimezones to avoid massive list
        return allTimezones.slice(0, 10).map(tz => ({
            id: tz,
            label: formatTimezone(tz).main,
            sub: formatTimezone(tz).sub
        }));
    };

    const normalizedQuery = query.toUpperCase();
    const results: SearchResult[] = [];
    const usedIds = new Set<string>();   // Tracks unique ID+Label combinations (for UI)
    const addedTimezoneIds = new Set<string>(); // Tracks timezone IDs to prevent redundant generic matches

    const addResult = (id: string, label: string, sub: string) => {
        if (!usedIds.has(id + label)) { // Composite key to allow same timezone with different labels
            usedIds.add(id + label);
            addedTimezoneIds.add(id);
            results.push({ id, label, sub });
        }
    };

    // 1. Check for exact abbreviation match
    if (TIMEZONE_ABBREVIATIONS[normalizedQuery]) {
        const id = TIMEZONE_ABBREVIATIONS[normalizedQuery];
        const fmt = formatTimezone(id);
        addResult(id, fmt.main, normalizedQuery);
    }

    // Limit results for performance (e.g., searching "a" returns thousands)
    const MAX_RESULTS = 50;

    // 2. City Search (city-timezones)
    let cityMatches = cityTimezones.findFromCityStateProvince(query);

    // Also try searching with spaces removed (e.g. "Ha Noi" -> "HaNoi" -> matches "Hanoi")
    const simplifiedQuery = query.replace(/\s+/g, '');
    if (simplifiedQuery !== query && simplifiedQuery.length > 0) {
        const extraMatches = cityTimezones.findFromCityStateProvince(simplifiedQuery);
        cityMatches = [...cityMatches, ...extraMatches];
    }

    // Sort by population descending
    cityMatches.sort((a, b) => b.pop - a.pop);

    // Optimization: Loop until we hit the limit
    for (const city of cityMatches) {
        if (results.length >= MAX_RESULTS) break;

        let id = city.timezone;
        try {
            // Resolve alias (e.g., Asia/Ho_Chi_Minh -> Asia/Saigon)
            id = new Intl.DateTimeFormat('en-US', { timeZone: id }).resolvedOptions().timeZone;
        } catch (e) {
            // Invalid timezone in data, skip
            continue;
        }

        if (allTimezones.includes(id)) {
            // e.g. "San Francisco, United States"
            const label = `${city.city}, ${city.country}`;
            const fmt = formatTimezone(id);
            addResult(id, label, fmt.sub);
        }
    }

    // 3. IANA Timezone Search (Fallback and complementary)
    const tzMatches = allTimezones.filter((tz) =>
        tz.toLowerCase().includes(query.toLowerCase())
    );

    for (const id of tzMatches) {
        if (results.length >= MAX_RESULTS) break;

        // If we already added this timezone via a city match, skip the generic one to avoid duplicates
        // e.g. "Paris, France" (Europe/Paris) is better than just "Europe/Paris"
        if (addedTimezoneIds.has(id)) {
            continue;
        }

        const fmt = formatTimezone(id);
        addResult(id, fmt.main, fmt.sub);
    }

    // 4. Check for GMT/UTC offsets (e.g., GMT+7, UTC-5)
    // Only check if we haven't filled up
    if (results.length < MAX_RESULTS) {
        const offsetMatch = normalizedQuery.match(/^(?:GMT|UTC)([+-])(\d{1,2})$/);
        if (offsetMatch) {
            const sign = offsetMatch[1] === '+' ? '-' : '+'; // Etc/GMT offsets are inverted
            const hours = parseInt(offsetMatch[2], 10);
            const gmtZone = `Etc/GMT${sign}${hours}`;
            if (allTimezones.includes(gmtZone)) {
                const fmt = formatTimezone(gmtZone);
                addResult(gmtZone, fmt.main, fmt.sub);
            }
        }
    }

    return results;
}

const ABBR_OVERRIDES: Record<string, Record<string, string>> = {
    'Australia/Sydney': { '+10:00': 'AEST', '+11:00': 'AEDT' },
    'Australia/Melbourne': { '+10:00': 'AEST', '+11:00': 'AEDT' },
    'Australia/Adelaide': { '+09:30': 'ACST', '+10:30': 'ACDT' },
    'Australia/Perth': { '+08:00': 'AWST' },
    'Asia/Tokyo': { '+09:00': 'JST' },
    'Asia/Seoul': { '+09:00': 'KST' },
    'Asia/Shanghai': { '+08:00': 'CST' },
    // Add more as needed
};

export function formatTimezone(timezone: string): {
    main: string;
    sub: string;
    alt: string;
} {
    try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
        });
        const parts = formatter.formatToParts(date);
        const offset = parts.find((part) => part.type === 'timeZoneName')?.value || '';
        // Clean up offset: "GMT-05:00" -> "-05:00"
        const cleanOffset = offset.replace('GMT', '');

        const abbrFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'short',
        });
        const abbrParts = abbrFormatter.formatToParts(date);
        let abbreviation = abbrParts.find((part) => part.type === 'timeZoneName')?.value || '';

        // Check overrides
        if (ABBR_OVERRIDES[timezone] && ABBR_OVERRIDES[timezone][cleanOffset]) {
            abbreviation = ABBR_OVERRIDES[timezone][cleanOffset];
        }

        // Handle Etc/GMT cases
        if (timezone.startsWith('Etc/')) {
            const main = timezone.replace('Etc/', '');
            const sub = offset;
            return { main, sub, alt: `${main} (${sub})` };
        }

        // Handle Region/City cases
        const [region, city] = timezone.split('/');
        if (city) {
            const formattedCity = city.replace(/_/g, ' ');
            const main = formattedCity;

            // Deduplicate info
            const parts = [region];
            const isAbbrRedundant = (abbreviation === cleanOffset) || (abbreviation === offset && cleanOffset !== '');

            if (abbreviation && !isAbbrRedundant) {
                if (!abbreviation.startsWith('GMT') || cleanOffset === '') {
                    parts.push(abbreviation);
                }
            }

            if (cleanOffset) {
                parts.push(cleanOffset);
            }

            const sub = parts.join(' • ');
            return { main, sub, alt: `${main} (${sub})` };
        }

        return { main: timezone, sub: offset, alt: `${timezone} (${offset})` };
    } catch (e) {
        return { main: timezone, sub: '', alt: timezone };
    }
}

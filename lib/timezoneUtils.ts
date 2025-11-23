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

export function searchTimezones(query: string): string[] {
    if (!query) return allTimezones;

    const normalizedQuery = query.toUpperCase();

    // 1. Check for exact abbreviation match
    if (TIMEZONE_ABBREVIATIONS[normalizedQuery]) {
        return [TIMEZONE_ABBREVIATIONS[normalizedQuery]];
    }

    // 2. Check for GMT/UTC offsets (e.g., GMT+7, UTC-5)
    const offsetMatch = normalizedQuery.match(/^(?:GMT|UTC)([+-])(\d{1,2})$/);
    if (offsetMatch) {
        const sign = offsetMatch[1] === '+' ? '-' : '+'; // Etc/GMT offsets are inverted
        const hours = parseInt(offsetMatch[2], 10);
        const gmtZone = `Etc/GMT${sign}${hours}`;
        if (allTimezones.includes(gmtZone)) {
            return [gmtZone];
        }
    }

    // 3. Filter IANA timezones
    return allTimezones.filter((tz) =>
        tz.toLowerCase().includes(query.toLowerCase())
    );
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

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
    GMT: 'Etc/GMT',
    UTC: 'Etc/UTC',
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

export function formatTimezone(timezone: string): string {
    try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
        });
        const parts = formatter.formatToParts(date);
        const offset = parts.find((part) => part.type === 'timeZoneName')?.value || '';

        const abbrFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'short',
        });
        const abbrParts = abbrFormatter.formatToParts(date);
        const abbreviation = abbrParts.find((part) => part.type === 'timeZoneName')?.value || '';

        // Handle Etc/GMT cases
        if (timezone.startsWith('Etc/')) {
            return `${timezone.replace('Etc/', '')} (${offset})`;
        }

        // Handle Region/City cases
        const [region, city] = timezone.split('/');
        if (city) {
            const formattedCity = city.replace(/_/g, ' ');
            return `${formattedCity} (${region}) ${abbreviation} (${offset})`;
        }

        return `${timezone} ${abbreviation} (${offset})`;
    } catch (e) {
        return timezone;
    }
}

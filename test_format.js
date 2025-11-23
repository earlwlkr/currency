const ABBR_OVERRIDES = {
    'Australia/Sydney': { '+10:00': 'AEST', '+11:00': 'AEDT' },
};

const timezones = [
    'Europe/London',
    'America/New_York',
];

// Mock cases where offset is just "GMT"
const mockOffsets = {
    'Europe/London': 'GMT'
};

function testFormat(timezone) {
    try {
        const date = new Date();
        // Simulate the behavior where offset might be "GMT"
        let offset = mockOffsets[timezone] || 'GMT+00:00';
        if (timezone === 'America/New_York') offset = 'GMT-05:00';

        const cleanOffset = offset.replace('GMT', '');

        const abbrFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'short',
        });
        const abbrParts = abbrFormatter.formatToParts(date);
        let abbreviation = abbrParts.find((part) => part.type === 'timeZoneName')?.value || '';
        if (timezone === 'Europe/London') abbreviation = 'GMT'; // Simulate GMT abbreviation

        // Check overrides
        if (ABBR_OVERRIDES[timezone] && ABBR_OVERRIDES[timezone][cleanOffset]) {
            abbreviation = ABBR_OVERRIDES[timezone][cleanOffset];
        }

        console.log(`Timezone: ${timezone}`);
        console.log(`Offset: ${offset}`);
        console.log(`CleanOffset: "${cleanOffset}"`);
        console.log(`Abbreviation: ${abbreviation}`);

        // Logic from formatTimezone
        const [region, city] = timezone.split('/');
        if (city) {
            const formattedCity = city.replace(/_/g, ' ');
            const main = formattedCity;

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
            console.log(`Result: ${main} / ${sub}`);
        }
        console.log('---');
    } catch (e) {
        console.log(`${timezone} -> Error: ${e.message}`);
    }
}

timezones.forEach(testFormat);

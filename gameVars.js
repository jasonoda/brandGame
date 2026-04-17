// -------------------------------------------------------------------------------------------
// ----------------------------------------- Theme Configuration -----------------------------------------
// -------------------------------------------------------------------------------------------

// Current theme - get from URL parameter, default to 'thanksgiving'
// URL parameter: ?theme=thanksgiving or ?theme=july4th
function getCurrentThemeFromURL() {
    // Check current window URL first
    const urlParams = new URLSearchParams(window.location.search);
    let themeParam = urlParams.get('theme');
    
    // If not found and we're in an iframe, check parent window
    if (!themeParam && window.parent && window.parent !== window) {
        try {
            const parentUrlParams = new URLSearchParams(window.parent.location.search);
            themeParam = parentUrlParams.get('theme');
        } catch (e) {
            // Cross-origin or other error, ignore
        }
    }
    
    // Valid themes: 'thanksgiving', 'july4th', 'easter'
    if (themeParam === 'july4th') return 'july4th';
    if (themeParam === 'easter') return 'easter';
    return 'thanksgiving';
}

const CURRENT_THEME = getCurrentThemeFromURL();

const THEMES = {
    thanksgiving: {
        name: 'Thanksgiving',
        quizTitle: 'Daily Thanksgiving Quiz',
        backgroundPattern: 'weeklyBackgrounds/thanksgiving_pattern.jpg',
        day1Image: 'weeklyBackgrounds/thanksgiving_day1.png',
        puzzleBackground: 'weeklyBackgrounds/thanksgiving_puzzleBig.jpg',
        zoomImage: 'weeklyBackgrounds/thanksgiving_zoom.jpg',
        colors: {
            'top-bar-bg-mobile': '#333333',
            'top-bar-text-mobile': '#e8e8ec',
            'top-bar-bg-desktop': '#333333',
            'top-bar-text-desktop': '#ffffff',

            'page-gradient-top': '#fff4ed',
            'page-flat-background': '#fff4ed',

            'masterGrad': '#333333',

            'header-text-color': '#ffffff',
            'calendar-day-text-color': '#404040',
            
            'calendar-background-top-color': 'linear-gradient(to bottom, #fb9f52, #e88335)',
            'calendar-background-top-text': '#ffffff',
            'calendar-top-solid': '#f08a3c',
            'calendar-week-total-badge-bg': '#f08a3c',
            'calendar-background-color': '#FFFFFF',
            'calendar-background-bottom-color': '#FFF6E8',
            'calendar-border-color': '#e5ddd1',
            'calendar-highlight-color': '#FFF6E8'
        },
        phrases: [
            "Saving room for pumpkin pie",
            "Thankful for the little things",
            "Eat first ask questions later",
            "Leftover Turkey sandwiches all week",
            "Just leave me to my food coma",
            "Grateful hearts and full bellies",
            "Count your blessings not calories",
            "Stuffed with gratitude and love",
            "Autumn leaves and pumpkin please",
            "Family food fun and football",
            "Pumpkin spice and everything nice",
            "Thankful thoughts and warm wishes",
            "Together is the best place to be",
            "Gratitude is the best attitude",
            "Countless reasons to be grateful"
        ],
        crossWords: [
            'TURKEY', 'GRAVY', 'FEAST', 'FAMILY', 'PUMPKIN', 'HARVEST', 
            'THANKS', 'CANDLE', 'LEAVES', 'AUTUMN', 'PILGRIM', 
            'SQUASH', 'APPLES', 'BREAD', 'FRIENDS', 'ROAST'
        ],
        suspectEmojis: ['🦃', '🥧', '🍂', '🌽', '🍁'],
        beticleWords: ['GRAVY', 'FEAST', 'BREAD', 'ROAST', 'STUFF', 'CRUST', 'SPICE', 'SWEET', 'TREAT', 'TABLE', 'PLATE', 'SERVE', 'SLICE', 'TASTE', 'SAVOR', 'GRACE', 'BLESS', 'GIVEN', 'SHARE', 'CARVE', 'APPLE'],
        mysteryWords: ['GRAVY', 'FEAST', 'BREAD', 'ROAST', 'STUFF', 'CRUST', 'SPICE', 'SWEET', 'TREAT', 'TABLE', 'PLATE', 'SERVE', 'SLICE', 'TASTE', 'SAVOR', 'GRACE', 'BLESS', 'GIVEN', 'SHARE', 'CARVE', 'APPLE']
    },
    july4th: {
        name: '4th of July',
        quizTitle: 'Daily 4th of July Quiz',
        backgroundPattern: 'weeklyBackgrounds/forthOfJuly_pattern.png',
        day1Image: 'weeklyBackgrounds/forthOfJuly_day1.png',
        puzzleBackground: 'weeklyBackgrounds/fourthOfJuly_puzzleBig.jpg',
        puzzleMedium: 'weeklyBackgrounds/fourthOfJuly_puzzleMedium.jpg',
        puzzleSmall: 'weeklyBackgrounds/fourthOfJuly_puzzleSmall.jpg',
        zoomImage: 'weeklyBackgrounds/forthOfJuly_zoom.jpg',
        colors: {
            'top-bar-bg-mobile': '#333333',
            'top-bar-text-mobile': '#e8e8ec',
            'top-bar-bg-desktop': '#333333',
            'top-bar-text-desktop': '#ffffff',

            'page-gradient-top': '#cdf2f0',
            'page-flat-background': '#cdf2f0',

            'masterGrad': '#333333',

            'header-text-color': '#ffffff',
            'calendar-day-text-color': '#404040',

            'calendar-background-top-color': 'linear-gradient(to bottom, #e73f65, #cb2c4b)',
            'calendar-background-top-text': '#ffffff',
            'calendar-top-solid': '#e73f65',
            'calendar-week-total-badge-bg': '#e73f65',
            'calendar-background-color': '#ffffff',
            'calendar-background-bottom-color': '#e8fffe',
            'calendar-border-color': '#a8d1ce',
            'calendar-highlight-color': '#e8fffe'
        },
        phrases: [
            "Land of the free home of the brave",
            "Red white and blue all the way through",
            "Enjoy the Fireworks show",
            "Stars stripes and sparklers",
            "Grill master at the party",
            
        ],
       
        crossWords: [
            'FREEDOM', 'PATRIOT', 'LIBERTY', 'AMERICA', 'STARS', 'STRIPES', 
            'FLAG', 'JULY', 'FOURTH', 
            'NATION', 'UNITED', 'STATES', 'BRAVE', 'FREE'
        ],
        suspectEmojis: ['⭐', '🇺🇸', '🧨', '🦅', '🔥'],
        beticleWords: ['STARS', 'BRAVE', 'UNITE', 'GLORY', 'HONOR', 'PRIDE', 'UNION', 'EAGLE'],
        mysteryWords: ['STARS', 'BRAVE', 'UNITE', 'GLORY', 'HONOR', 'PRIDE', 'UNION', 'EAGLE']
    },
    easter: {
        name: 'Easter',
        quizTitle: 'Daily Easter Quiz',
        backgroundPattern: 'weeklyBackgrounds/easter_pattern.png',
        day1Image: 'weeklyBackgrounds/easter_day1.png',
        puzzleBackground: 'weeklyBackgrounds/easter_puzzleBig.jpg',
        puzzleMedium: 'weeklyBackgrounds/easter_puzzleMedium.jpg',
        puzzleSmall: 'weeklyBackgrounds/easter_puzzleSmall.jpg',
        zoomImage: 'weeklyBackgrounds/easter_zoom.jpg',
        colors: {
            'top-bar-bg-mobile': '#333333',
            'top-bar-text-mobile': '#e8e8ec',
            'top-bar-bg-desktop': '#333333',
            'top-bar-text-desktop': '#ffffff',

            'page-gradient-top': '#d0e6e0',
            'page-flat-background': '#e2fff7',

            'masterGrad': '#333333',

            'header-text-color': '#ffffff',
            'calendar-day-text-color': '#404040',

            'calendar-background-top-color': 'linear-gradient(to bottom, #00b1b7,#00b1b7)',
            'calendar-background-top-text': '#ffffff',
            'calendar-top-solid': '#00b1b7',
            'calendar-week-total-badge-bg': '#00b1b7',
            'calendar-background-color': '#ffffff',
            'calendar-background-bottom-color': '#e8f5e9',
            'calendar-border-color': '#b3eab5',
            'calendar-highlight-color': '#d4fff8'
        },
        phrases: [
            "A basket full of chocolate eggs",
            "Yummy treats from the shop",
            "The Easter Bunny strikes again"
        ],
        crossWords: [
            'EASTER', 'BUNNY', 'SPRING', 'EGGS', 'BASKET', 'BLOOM',
            'CHICK', 'PEEPS', 'PASTEL', 'TULIP', 'GRASS',
            'HUNT', 'BLOOM', 'RENEW'
        ],
        suspectEmojis: ['🐣', '🐰', '🌸', '🥚', '🌷'],
        beticleWords: ['BUNNY', 'BLOOM', 'GRASS', 'CHICK', 'TULIP', 'SWEET', 'FRESH', 'HOPPY', 'PETAL', 'SPRIG', 'LILAC', 'BULBS', 'BIRCH', 'HATCH', 'BLOOM'],
        mysteryWords: ['BUNNY', 'BLOOM', 'GRASS', 'CHICK', 'TULIP', 'SWEET', 'FRESH', 'HOPPY', 'PETAL', 'SPRIG', 'LILAC', 'BULBS', 'BIRCH', 'HATCH', 'BLOOM']
    }
};

// Centra (d=centra): overrides theme top-bar colors when applied
const CENTRA_OVERRIDE = {
    colors: {
        'top-bar-bg-mobile': '#03b0b6',
        'top-bar-text-mobile': '#ffffff',
        'top-bar-bg-desktop': '#03b0b6',
        'top-bar-text-desktop': '#ffffff'
    }
};

// Supervalu (d=supervalu): overrides theme and calendar colors when applied
const SUPERVALU_OVERRIDE = {
    colors: {
        'top-bar-bg-mobile': '#c8102e',
        'top-bar-text-mobile': '#ffffff',
        'top-bar-bg-desktop': '#c8102e',
        'top-bar-text-desktop': '#ffffff',

        // Background / gradients
        'page-gradient-top': '#ffe5ea', // very light red wash
        'masterGrad': '#fdc9d4', // slightly darker flat light red header background

        // Header text color for section titles, etc. (dark red)
        'header-text-color': '#ba4862',

        // Calendar colors (match July 4th red)
        'calendar-background-top-color': 'linear-gradient(to bottom, #e73f65, #cb2c4b)',
        'calendar-background-top-text': '#ffffff',
        'calendar-top-solid': '#e73f65',
        'calendar-week-total-badge-bg': '#e73f65',
        'calendar-background-color': '#ffffff',
        'calendar-background-bottom-color': '#ffe5ea',
        'calendar-border-color': '#f2b3c0',
        'calendar-highlight-color': '#ffe5ea'
    }
};

// Get current theme
function getCurrentTheme() {
    return THEMES[CURRENT_THEME] || THEMES.thanksgiving;
}

/** 4th Thursday of November (US Thanksgiving), local date */
function getThanksgivingThursday(year) {
    const nov1 = new Date(year, 10, 1);
    const firstThu = (4 - nov1.getDay() + 7) % 7;
    return new Date(year, 10, 1 + firstThu + 21);
}

/** Easter Sunday (Gregorian), Anonymous Gregorian algorithm */
function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = h + l - 7 * m + 114;
    const month = Math.floor(n / 31);
    const day = (n % 31) + 1;
    return new Date(year, month - 1, day);
}

/**
 * Date shown in the header for themed builds: the theme’s anchor holiday in its week
 * (Thanksgiving Thursday, July 4, Easter Sunday). If that date has already passed this year,
 * uses next year’s. Otherwise uses today’s date.
 */
function getThemeHeaderDisplayDate() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (typeof getCurrentTheme !== 'function') return today;
    const theme = getCurrentTheme();
    const name = theme.name;
    let anchor;
    const y = today.getFullYear();
    if (name === 'Thanksgiving') {
        anchor = getThanksgivingThursday(y);
        if (anchor < todayStart) anchor = getThanksgivingThursday(y + 1);
    } else if (name === '4th of July') {
        anchor = new Date(y, 6, 4);
        if (anchor < todayStart) anchor = new Date(y + 1, 6, 4);
    } else if (name === 'Easter') {
        anchor = getEasterSunday(y);
        if (anchor < todayStart) anchor = getEasterSunday(y + 1);
    } else {
        return today;
    }
    return anchor;
}

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Scramble -----------------------------------------
// -------------------------------------------------------------------------------------------

function getRandomScrambleDay() {
    const gameData = [
        {
            "date": "Jan 1",
            "event": "On this day in 1892, Ellis Island opened in New York Harbor as an immigration station. Millions of hopeful travelers would pass through its halls.",
            "word": "island"
        },
        {
            "date": "Jan 2",
            "event": "On this day in 1839, Louis Daguerre took the first photo of the Moon. It marked an early milestone in photography.",
            "word": "camera"
        },
        {
            "date": "Jan 3",
            "event": "On this day in 1959, Alaska became the 49th state of the United States. It is the largest state by area.",
            "word": "alaska"
        },
        {
            "date": "Jan 4",
            "event": "On this day in 1809, Louis Braille, the inventor of the Braille reading system, was born in France.",
            "word": "braille"
        },
        {
            "date": "Jan 5",
            "event": "On this day in 1933, construction of the Golden Gate Bridge in San Francisco began. It later became one of the most famous bridges in the world.",
            "word": "bridge"
        },
        {
            "date": "Jan 6",
            "event": "On this day in 1850, the safety razor was first patented in the United States, changing daily grooming habits.",
            "word": "razors"
        },
        {
            "date": "Jan 8",
            "event": "On this day in 1935, Elvis Presley, who would become the King of Rock and Roll, was born in Mississippi.",
            "word": "elvis"
        },
        {
            "date": "Jan 9",
            "event": "On this day in 2007, Apple introduced the first iPhone, revolutionizing mobile technology.",
            "word": "iphone"
        },
        {
            "date": "Jan 10",
            "event": "On this day in 1863, the world's first underground railway opened in London, now part of the famous Tube system.",
            "word": "subway"
        },
        {
            "date": "Jan 11",
            "event": "On this day in 1935, Amelia Earhart became the first person to fly solo from Hawaii to California.",
            "word": "flight"
        },
        {
            "date": "Jan 12",
            "event": "On this day in 1969, Led Zeppelin released their debut album, helping to define rock music of the era.",
            "word": "rocker"
        },
        {
            "date": "Jan 13",
            "event": "On this day in 1968, Johnny Cash recorded his legendary live album at Folsom Prison.",
            "word": "guitar"
        },
        {
            "date": "Jan 14",
            "event": "On this day in 1973, the Miami Dolphins completed the only perfect season in NFL history by winning the Super Bowl.",
            "word": "dolphin"
        },
        {
            "date": "Jan 17",
            "event": "On this day in 1706, Benjamin Franklin, inventor and statesman, was born in Boston.",
            "word": "frank"
        },
        {
            "date": "Jan 18",
            "event": "On this day in 1919, Bentley Motors was founded in London, becoming known for luxury cars.",
            "word": "bentley"
        },
        {
            "date": "Jan 19",
            "event": "On this day in 1809, Edgar Allan Poe, the American poet and writer, was born in Boston.",
            "word": "poetry"
        },
        {
            "date": "Jan 20",
            "event": "On this day in 1885, the roller coaster was patented, later becoming a favorite amusement park ride.",
            "word": "coaster"
        },
        {
            "date": "Jan 23",
            "event": "On this day in 1849, Elizabeth Blackwell became the first woman to earn a medical degree in the United States.",
            "word": "doctor"
        },
        {
            "date": "Jan 24",
            "event": "On this day in 1935, the first canned beer was sold in the United States.",
            "word": "beers"
        },
        {
            "date": "Jan 25",
            "event": "On this day in 1924, the first Winter Olympics opened in Chamonix, France.",
            "word": "winter"
        },
        {
            "date": "Jan 26",
            "event": "On this day in 1905, the world's largest diamond, the Cullinan, was discovered in South Africa.",
            "word": "diamond"
        },
        {
            "date": "Jan 27",
            "event": "On this day in 1880, Thomas Edison patented the electric light bulb, transforming everyday life.",
            "word": "light"
        },
        {
            "date": "Jan 29",
            "event": "On this day in 1886, Karl Benz patented the first automobile powered by a gas engine.",
            "word": "engine"
        },
        {
            "date": "Jan 30",
            "event": "On this day in 1969, The Beatles performed together for the last time in their rooftop concert in London.",
            "word": "beatle"
        },
        {
            "date": "Jan 31",
            "event": "On this day in 1958, the United States launched Explorer 1, its first satellite, into space.",
            "word": "rocket"
        }
    ];
    
    const randomIndex = Math.floor(Math.random() * gameData.length);
    return gameData[randomIndex];
}

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Quiz -----------------------------------------
// -------------------------------------------------------------------------------------------

function getQuizData() {
    const theme = getCurrentTheme();
    const themeKey = CURRENT_THEME;
    
    if (themeKey === 'thanksgiving') {
        return [
            {
                "set": 1,
                "questions": [
                    {
                        "question": "Which flavor blend became a defining modern Thanksgiving dessert profile in the 20th century?",
                        "answers": ["Pumpkin spice", "Apple spice", "Cinnamon sugar"],
                        "correct": 0
                    },
                    {
                        "question": "Which U.S. president moved Thanksgiving earlier to influence holiday shopping?",
                        "answers": ["Herbert Hoover", "F. D. Roosevelt", "Harry Truman"],
                        "correct": 1
                    },
                    {
                        "question": "Which medium most helped synchronize Thanksgiving celebrations nationwide by mid-century?",
                        "answers": ["Radio", "Newspapers", "Television"],
                        "correct": 2
                    },
                    {
                        "question": "Which convenience food resulted from surplus after a Thanksgiving season?",
                        "answers": ["Frozen pie", "TV dinner", "Canned gravy"],
                        "correct": 1
                    },
                    {
                        "question": "Which food was eaten at the 1621 harvest feast but rarely appears on modern Thanksgiving menus?",
                        "answers": ["Clams", "Goose", "Cornbread"],
                        "correct": 0
                    }
                ]
            },
            {
                "set": 2,
                "questions": [
                    {
                        "question": "Which feature helped transform the New York Thanksgiving parade into a national spectacle?",
                        "answers": ["Marching bands", "Giant balloons", "Celebrity hosts"],
                        "correct": 1
                    },
                    {
                        "question": "Which department store originally organized the Thanksgiving parade?",
                        "answers": ["Macy's", "Bloomingdale's", "Sears"],
                        "correct": 0
                    },
                    {
                        "question": "Which factor most helped turkey replace other meats for Thanksgiving meals?",
                        "answers": ["Farm size", "Affordability", "Rail transport"],
                        "correct": 1
                    },
                    {
                        "question": "Which publication helped standardize Thanksgiving recipes nationally?",
                        "answers": ["Local newspapers", "Church bulletins", "Good Housekeeping"],
                        "correct": 2
                    },
                    {
                        "question": "Which ingredient spread nationally due to early food canning?",
                        "answers": ["Pumpkin puree", "Sweet corn", "Cranberries"],
                        "correct": 0
                    }
                ]
            },
            {
                "set": 3,
                "questions": [
                    {
                        "question": "Which sport became closely associated with Thanksgiving broadcasts?",
                        "answers": ["Football", "Baseball", "Hockey"],
                        "correct": 0
                    },
                    {
                        "question": "Which team became a long-standing Thanksgiving football host?",
                        "answers": ["Chicago Bears", "Detroit Lions", "Green Bay Packers"],
                        "correct": 1
                    },
                    {
                        "question": "Which development most enabled nationwide Thanksgiving menu consistency?",
                        "answers": ["Recipe media", "Rail shipping", "Food canning"],
                        "correct": 2
                    },
                    {
                        "question": "Why did Thanksgiving resist becoming a weekend holiday in the U.S.?",
                        "answers": ["Work patterns", "Church customs", "Market timing"],
                        "correct": 0
                    },
                    {
                        "question": "Which 19th-century movement most pushed Thanksgiving as a moral tradition?",
                        "answers": ["Political unity", "Religious reform", "Public education"],
                        "correct": 1
                    }
                ]
            }
        ];
    } else if (themeKey === 'july4th') {
        return [
            {
                "set": 1,
                "questions": [
                   
                    {
                        "question": "In which year was the Declaration of Independence signed?",
                        "answers": ["1492", "1776", "1812"],
                        "correct": 1
                    },
                    {
                        "question": "Which document declared American independence from Great Britain?",
                        "answers": ["The Constitution", "The Bill of Rights", "The Declaration of Independence"],
                        "correct": 2
                    },
                    {
                        "question": "Which city hosted the first public reading of the Declaration of Independence?",
                        "answers": ["Philadelphia", "Washington D.C.", "New York"],
                        "correct": 0
                    },
                    {
                        "question": "Which founding father is credited with writing most of the Declaration of Independence?",
                        "answers": ["George Washington", "Thomas Jefferson", "Benjamin Franklin"],
                        "correct": 1
                    },
                    {
                       "question": "Which battle is considered the turning point of the American Revolution?",
                        "answers": ["Battle of Saratoga", "Battle of Bunker Hill", "Battle of Yorktown"],
                        "correct": 0
                    }
                ]
            }
        ];
    } else if (themeKey === 'easter') {
        return [
            {
                "set": 1,
                "questions": [
                    {
                        "question": "What day of the week is Easter always celebrated on?",
                        "answers": ["Sunday", "Friday", "Wednesday"],
                        "correct": 0
                    },
                    {
                        "question": "What comes immediately before Easter Sunday in the Christian calendar?",
                        "answers": ["Good Friday", "Palm Sunday", "Christmas Eve"],
                        "correct": 0
                    },
                    {
                        "question": "What 40-day period of fasting often comes before Easter?",
                        "answers": ["Advent", "Lent", "Epiphany"],
                        "correct": 1
                    },
                    {
                        "question": "In many European traditions, what animal originally delivered Easter eggs before the rabbit became popular?",
                        "answers": ["Stork", "Hen", "Lamb"],
                        "correct": 1
                    },
                    {
                        "question": "Which church council helped standardize how the date of Easter is calculated?",
                        "answers": ["Council of Trent", "Council of Nicaea", "Council of Chalcedon"],
                        "correct": 1
                    }
                ]
            }
        ];
    }
    
    return [];
}

// Puzzle Games:

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Phrases -----------------------------------------
// -------------------------------------------------------------------------------------------

function getRandomPhrase() {
    const theme = getCurrentTheme();
    const phrases = theme.phrases;
    
    if (!phrases || phrases.length === 0) {
        console.warn('No phrases found for current theme, using fallback');
        return "Default phrase";
    }
    
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Cross -----------------------------------------
// -------------------------------------------------------------------------------------------

function getRandomCrossWords(count = 2) {
    const theme = getCurrentTheme();
    const words = theme.crossWords.filter(word => word.length >= 5 && word.length <= 7);
    
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Gold Case -----------------------------------------
// -------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Suspect -----------------------------------------
// -------------------------------------------------------------------------------------------

function getSuspectEmojis() {
    // Always use current theme emojis
    const theme = getCurrentTheme();
    return theme.suspectEmojis; // 5 emojis
}

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Defuser -----------------------------------------
// -------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Tally -----------------------------------------
// -------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Zoom -----------------------------------------
// -------------------------------------------------------------------------------------------

function getZoomImage() {
    const theme = getCurrentTheme();
    return theme.zoomImage || 'weeklyBackgrounds/thanksgiving_zoom.jpg'; // Default to thanksgiving if not set
}

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Shift -----------------------------------------
// -------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Beticle -----------------------------------------
// -------------------------------------------------------------------------------------------

function getBeticleTargetWord() {
    const theme = getCurrentTheme();
    const words = theme.beticleWords || [];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

// -------------------------------------------------------------------------------------------
// ----------------------------------------- Mystery Word -----------------------------------------
// -------------------------------------------------------------------------------------------

function getMysteryWordTargetWord() {
    const theme = getCurrentTheme();
    const words = theme.mysteryWords || [];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

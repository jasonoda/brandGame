# LocalStorage Variables Documentation

## Global/System Variables

### `totalStars`
- **Description**: Stores the total cumulative stars earned across all days
- **Type**: String (number)
- **Format**: Integer as string (e.g., "150")

### `dailyStars_<YYYY-MM-DD>`
- **Description**: Stores the total stars earned for a specific day
- **Type**: String (number)
- **Format**: Integer as string (e.g., "25")
- **Example**: `dailyStars_2024-01-15`

### `gamesPlayed`
- **Description**: Journey stuff
- **Type**: String (number)
- **Format**: Integer as string (e.g., "42")

### `playedGames_<YYYY-MM-DD>`
- **Description**: Stores an array of game IDs that have been played on a specific day (used to unlock bonus spin when 8 unique games are played)
- **Type**: String (JSON array)
- **Format**: JSON string (e.g., '["beticle", "mysteryWord", "cross"]')
- **Example**: `playedGames_2024-01-15`

### `usableStars_<YYYY-MM-DD>`
- **Description**: Stores stars that can be used for special features (like bonus spin) for a specific day
- **Type**: String (number)
- **Format**: Integer as string (e.g., "15")
- **Example**: `usableStars_2024-01-15`

### `prizeTiles`
- **Description**: Stores the state of prize tiles collected in the prizes page
- **Type**: String (JSON)
- **Format**: JSON string

### `journeyLevel`
- **Description**: Stores the current level in the journey game
- **Type**: String (number)
- **Format**: Integer as string (e.g., "3")

### `journeyPosition_level<N>`
- **Description**: Stores the player's position on a specific journey level
- **Type**: String (number)
- **Format**: Integer as string (e.g., "150")
- **Example**: `journeyPosition_level1`, `journeyPosition_level2`

---

## Puzzle Game Variables (Daily Completion & Stars)

### Beticle
- **`beticleStars_<YYYY-MM-DD>`**: Stars earned for Beticle on a specific day (0-5)
- **`beticleComplete_<YYYY-MM-DD>`**: Boolean string ("true"/"false") indicating if Beticle was completed

### Mystery Word
- **`mysteryWordStars_<YYYY-MM-DD>`**: Stars earned for Mystery Word on a specific day (0-5)
- **`mysteryWordComplete_<YYYY-MM-DD>`**: Boolean string indicating if Mystery Word was completed

### Cross
- **`crossStars_<YYYY-MM-DD>`**: Stars earned for Cross on a specific day (0-5)
- **`crossComplete_<YYYY-MM-DD>`**: Boolean string indicating if Cross was completed

### Phrases
- **`phrasesStars_<YYYY-MM-DD>`**: Stars earned for Phrases on a specific day (0-5)
- **`phrasesComplete_<YYYY-MM-DD>`**: Boolean string indicating if Phrases was completed

### Tally
- **`tallyStars_<YYYY-MM-DD>`**: Stars earned for Tally on a specific day (0-5)
- **`tallyComplete_<YYYY-MM-DD>`**: Boolean string indicating if Tally was completed

### Defuser
- **`defuserStars_<YYYY-MM-DD>`**: Stars earned for Defuser on a specific day (0-5, based on rounds completed)
- **`defuserComplete_<YYYY-MM-DD>`**: Boolean string indicating if Defuser was completed

### Suspect
- **`suspectStars_<YYYY-MM-DD>`**: Stars earned for Suspect on a specific day (0-5)
- **`suspectComplete_<YYYY-MM-DD>`**: Boolean string indicating if Suspect was completed

### Zoom
- **`zoomStars_<YYYY-MM-DD>`**: Stars earned for Zoom on a specific day (0-5)
- **`zoomComplete_<YYYY-MM-DD>`**: Boolean string indicating if Zoom was completed

### Shift
- **`shiftStars_<YYYY-MM-DD>`**: Stars earned for Shift on a specific day (0-5)
- **`shiftComplete_<YYYY-MM-DD>`**: Boolean string indicating if Shift was completed

### Quiz
- **`quizStars_<YYYY-MM-DD>`**: Stars earned for Quiz on a specific day (0-5)
- **`quizComplete_<YYYY-MM-DD>`**: Boolean string indicating if Quiz was completed

### Gold Case
- **`goldCaseStars_<YYYY-MM-DD>`**: Stars earned for Gold Case on a specific day (0-5)
- **`goldCaseComplete_<YYYY-MM-DD>`**: Boolean string indicating if Gold Case was completed
- **`goldCaseScore_<YYYY-MM-DD>`**: Final score achieved in Gold Case on a specific day

---

## Arcade Game Variables (Daily Completion & Scores)

### Memory
- **`memoryStars_<YYYY-MM-DD>`**: Stars earned for Memory on a specific day (0-5)
- **`memoryComplete_<YYYY-MM-DD>`**: Boolean string indicating if Memory was completed
- **`memoryScore_<YYYY-MM-DD>`**: Final score achieved in Memory on a specific day

### Blackjack
- **`blackjackStars_<YYYY-MM-DD>`**: Stars earned for Blackjack on a specific day (0-5)
- **`blackjackComplete_<YYYY-MM-DD>`**: Boolean string indicating if Blackjack was completed
- **`blackjackScore_<YYYY-MM-DD>`**: Final score achieved in Blackjack on a specific day

### Lost and Found
- **`lostAndFoundStars_<YYYY-MM-DD>`**: Stars earned for Lost and Found on a specific day (0-5)
- **`lostAndFoundComplete_<YYYY-MM-DD>`**: Boolean string indicating if Lost and Found was completed
- **`lostAndFoundScore_<YYYY-MM-DD>`**: Final score achieved in Lost and Found on a specific day

### `match3HighScore`
- **Description**: Stores the all-time high score for the Match3 game
- **Type**: String (number)
- **Format**: Integer as string (e.g., "5000")

---

## Bonus/Feature Variables

### Bonus Spin
- **`bonusSpinSpun_<YYYY-MM-DD>`**: Boolean string indicating if the bonus spin was used today
- **`bonusSpinStars_<YYYY-MM-DD>`**: Stars won from the bonus spin on a specific day
- **`bonusSpinCheatUnlocked`**: Boolean string indicating if cheat mode is unlocked (persists across days)

---

## Notes

- All date-based keys use the format `YYYY-MM-DD` (e.g., `2024-01-15`)
- Boolean values are stored as strings: `"true"` or `"false"`
- Numeric values are stored as strings (e.g., `"5"` instead of `5`)
- Most game completion flags follow the pattern: `<gameId>Complete_<YYYY-MM-DD>`
- Most star counts follow the pattern: `<gameId>Stars_<YYYY-MM-DD>`
- Scores follow the pattern: `<gameId>Score_<YYYY-MM-DD>` (for games that track scores)

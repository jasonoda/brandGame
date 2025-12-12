// Minimal createGameData.js to support eval(createGameDataCode) in test-index.html
// Mirrors temp2/createGameData.js structure but self-contained
const createGameDataCode = `function createGameData() {
  class MakeGameData {
    makeRanLevelData() {
      // Provide a minimal init payload the game expects
      return {
        seed: Math.floor(Math.random() * 1000000),
        startTime: Date.now()
      };
    }
  }
  const mgd = new MakeGameData();
  return mgd.makeRanLevelData();
}`

if (typeof window !== 'undefined') {
  window.createGameDataCode = createGameDataCode;
  // Also expose direct function
  if (typeof window.createGameData !== 'function') {
    window.createGameData = function(){
      return {
        seed: Math.floor(Math.random() * 1000000),
        startTime: Date.now()
      };
    };
  }
}



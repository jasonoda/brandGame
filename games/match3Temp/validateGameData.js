/**
 * This function should return an object that looks like this:
 *
 * {
 *   isValid: true | false,
 *   reasons: [] // an array of strings
 * }
 *
 * @param initialGameData This is the same data structure passed to the iFrame using the window.CG_API.InitGame message
 * @param breadcrumbs This is an array of breadcrumb objects received from the game using the window.GC_API.BreadCrumb message
 * @param finalGameData This is the final score object sent from the game using the window.GC_API.FinalScores message
 */

const validateGameDataCode = 
`
function validateGameData(initialGameData, breadcrumbs, finalGameData) {

  // add final breadcrumb
  breadcrumbs.push(finalGameData.metadata.breadcrumb);

  var isValid = true;
  var reasons = [];

  console.log("VALIDATING GAME DATA");

  console.log(breadcrumbs);
  console.log(finalGameData);

  // ---------------------------------------------------------------------------------------------
  // check breadcrumb count - should be 8 (7 every 15 seconds + 1 final)
  // ---------------------------------------------------------------------------------------------
  var expectedBreadcrumbs = 8;
  if (breadcrumbs.length !== expectedBreadcrumbs) {
    reasons.push("INCORRECT BREADCRUMB COUNT " + breadcrumbs.length + " / " + expectedBreadcrumbs);
    isValid = false;
  }

  // ---------------------------------------------------------------------------------------------
  // check each breadcrumb: scoreList sums to levelScore
  // ---------------------------------------------------------------------------------------------
  for (var i = 0; i < breadcrumbs.length; i++) {
    var b = breadcrumbs[i];
    var sum = 0;
    if (Array.isArray(b.scoreList)) {
      for (var j = 0; j < b.scoreList.length; j++) {
        sum += b.scoreList[j];
      }
    }
    if (b.levelScore !== undefined && sum !== b.levelScore) {
      reasons.push("SCORELIST DOES NOT MATCH LEVELSCORE at breadcrumb " + i + ": " + sum + " / " + b.levelScore);
      isValid = false;
    }
  }

  // ---------------------------------------------------------------------------------------------
  // check totals: sum of levelScores equals final score
  // ---------------------------------------------------------------------------------------------
  var totalLevelScores = 0;
  for (var k = 0; k < breadcrumbs.length; k++) {
    if (breadcrumbs[k].levelScore !== undefined) {
      totalLevelScores += breadcrumbs[k].levelScore;
    }
  }
  if (finalGameData && typeof finalGameData.score === 'number' && totalLevelScores !== finalGameData.score) {
    reasons.push("LEVELSCORES DON'T MATCH FINAL SCORE: " + totalLevelScores + " / " + finalGameData.score);
    isValid = false;
  }

  return { isValid: isValid, reasons: reasons };
}
`

// Ensure global access for test-index.html eval()
if (typeof window !== 'undefined') {
  window.validateGameDataCode = validateGameDataCode;
}

// Also expose a direct function so eval isn't required
if (typeof window !== 'undefined' && typeof window.validateGameData !== 'function') {
  window.validateGameData = function(initialGameData, breadcrumbs, finalGameData) {
    try {
      // Inline the same logic as in validateGameDataCode
      breadcrumbs = breadcrumbs || [];
      if (finalGameData && finalGameData.metadata && finalGameData.metadata.breadcrumb) {
        breadcrumbs = breadcrumbs.slice();
        breadcrumbs.push(finalGameData.metadata.breadcrumb);
      }
      var isValid = true;
      var reasons = [];
      var expectedBreadcrumbs = 8;
      if (breadcrumbs.length !== expectedBreadcrumbs) {
        reasons.push("INCORRECT BREADCRUMB COUNT " + breadcrumbs.length + " / " + expectedBreadcrumbs);
        isValid = false;
      }
      for (var i = 0; i < breadcrumbs.length; i++) {
        var b = breadcrumbs[i];
        var sum = 0;
        if (Array.isArray(b.scoreList)) {
          for (var j = 0; j < b.scoreList.length; j++) {
            sum += b.scoreList[j];
          }
        }
        if (b.levelScore !== undefined && sum !== b.levelScore) {
          reasons.push("SCORELIST DOES NOT MATCH LEVELSCORE at breadcrumb " + i + ": " + sum + " / " + b.levelScore);
          isValid = false;
        }
      }
      var totalLevelScores = 0;
      for (var k = 0; k < breadcrumbs.length; k++) {
        if (breadcrumbs[k].levelScore !== undefined) {
          totalLevelScores += breadcrumbs[k].levelScore;
        }
      }
      if (finalGameData && typeof finalGameData.score === 'number' && totalLevelScores !== finalGameData.score) {
        reasons.push("LEVELSCORES DON'T MATCH FINAL SCORE: " + totalLevelScores + " / " + finalGameData.score);
        isValid = false;
      }
      return { isValid: isValid, reasons: reasons };
    } catch (e) {
      return { isValid: false, reasons: ["VALIDATION RUNTIME ERROR: " + (e && e.message ? e.message : e)] };
    }
  };
}
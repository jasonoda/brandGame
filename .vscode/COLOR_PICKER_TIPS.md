# Color picker in the editor

## Color boxes in JS (e.g. gameVars.js)

Workspace settings enable **color decorators** and **default color decorators** so the little color square and picker can appear in more places, including JavaScript.

- If you still don’t see the box next to hex strings in `.js`, put the cursor on the color value and run the command **“Open Color Picker”** (e.g. Command Palette → “Open Color Picker” or `editor.action.openColorPicker`). That opens the picker even when the decorator isn’t shown.

## Keeping hex instead of rgb

The built-in picker often inserts `rgb()` or `rgba()`. To get hex:

1. **In the picker:** click the **color bar/code at the top** of the picker (where it shows the current value). That cycles the *output* format (hex → rgb → hsl → …). Choose hex before confirming.
2. **After the fact:** install an extension like **“Change Color Format”** (bbugh) or **“Color Picker”** (anseki). Use “Convert to Hex” (or similar) on the selected color to replace `rgb(...)` with `#rrggbb`.

There is no built-in setting that forces the picker to always output hex; the bar click is the in-editor way to choose format before applying.

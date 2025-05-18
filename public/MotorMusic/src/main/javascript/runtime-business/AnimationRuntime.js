//as a function of time, will specify the range of syllables to highlight 
var getAnimationInfoFunction = undefined;

//the time that playback was started at 
var startTime = undefined;


let actualFrameDuration = undefined;

var areWeCurrentlyPlayingBack = false; //keeps track of whether we are currently animating

//to be set and used during animation
var intervalId = undefined;


//this is a map from string encodings of ranges to [color value, decoration id], and is the current color state of the program
//we use this when making changes to the coloring by comparing values against it. 
//this allows us to only make coloring changes if they are necessary 
var currentColors = new Map();  



export function setSyllableTime(syllableTime) {
    const idealFrameDuration = 1000/60; //60FPS
    numFramesWeWillFit = Math.ceil (syllableTime / idealFrameDuration);//ceil because we want to be at LEAST 60 FPS
    actualFrameDuration = syllableTime / numFramesWeWillFit;
}


export function setGetAnimationInfoFunction(x) {
    getAnimationInfoFunction = x;
}

export function killAnimationPlayback() {
    clearInterval(intervalId);
    decorationsCollection.clear();
    areWeCurrentlyPlayingBack = false;
}


//util functions for animating------------------------------------

function cleanHex(c) {
    // Ensure hexColor is valid and remove the "#" if present
    const cleanHex = c.startsWith("#") ? c.slice(1) : c;
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      throw new Error("Invalid hex color format.");
    }
    return cleanHex;
}

function rgbFromCleaned(cleaned) {
    // Parse the hex color into RGB components
    return {
      r: parseInt(cleanHex(cleaned).slice(0, 2), 16),
      g: parseInt(cleanHex(cleaned).slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16)
    }
}

import * as monaco from 'monaco-editor';
//we had constructed ranges in our typescript as a 4 tupule, now we can create an actual range from it
function fakeRangeToRange(x) {
    return new monaco.Range(x[0], x[1], x[2], x[3]);
}

//------------------------------------------------------------


//maps color strings to the strings of the class names we have dynamically corresponded to those colors in the CSS
let colorClassNames = new Map();
function ensureCssHasAClassForThisColorAndReturnClassName(document, color) {
    // If already added, return the existing class name
    if (colorClassNames.has(color)) {
        return colorClassNames.get(color);
    }

    // Generate a unique, safe class name based on the color
    const safeColor = color.replace(/[^a-zA-Z0-9]/g, '_');
    const className = `color_${safeColor}`;

    // Create a style tag and add it to the document head if not already done
    let styleTag = document.getElementById('dynamic-color-style');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-color-style';
        document.head.appendChild(styleTag);
    }

    // Add the new CSS rule
    const cssRule = `.${className} { color: ${color}; }`;
    styleTag.sheet.insertRule(cssRule, styleTag.sheet.cssRules.length);

    // Cache the class name
    colorClassNames.set(color, className);

    return className;
}


//returns the array of values from the string encoded array
function deserializeRange(rangeString) {
    const parts = rangeString.split("|").map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
        throw new Error("Invalid serialized range: " + rangeString);
    }
    return [parts[0], parts[1], parts[2], parts[3]];
}


//completely clears all colors and repaints them according to colorsToSet
export function repaintColors(editor, document, colorsToSet) {
 //1) remove all previuos decorations
 editor.deltaDecorations(Array.from(currentColors.values()).map(([_, id]) => id), []);
 for (const range of colorsToSet.keys()) {
     let colorToSet = colorsToSet.get(range);
     let classNameForNewColor = ensureCssHasAClassForThisColorAndReturnClassName(document, colorToSet);
     let [thisUpdateId] = editor.deltaDecorations([], [ {
         range: fakeRangeToRange(deserializeRange(range)),
         options: { inlineClassName: classNameForNewColor }
     }]);
     currentColors.set(range, [colorToSet, thisUpdateId]);
 } 
}

//dynamically sets some colors without repainting everything
//CAUTION: this is only to be used if we are sure none of the ranges have changed (so only during animation)
function alterColors(editor, document, colorsToSet) {
    for (const range of colorsToSet.keys()) {

        /*there are two things we must take care of:

            1) For each color, we must ensure the CSS has that color with a classname that we can use for that color
            2) Once we know the class name corresponding to that color is present, we can create a decoration for that range and use that class name 

        */
        let decorationsToRemove = [];
        let colorToSet = colorsToSet.get(range);
        
        if (currentColors.has(range)) {
            //We have already painted this color...if new color is different, remove old decoration option for this range
            let [currentColor, currentColorRuleId] = currentColors.get(range);
            if (currentColor != colorToSet) {
                decorationsToRemove.push(currentColorRuleId); 
            }
            else {
                console.log("skipping range: " + range);
                //current color is the correct color, so we can move on to the next rule
                continue;
            }
        }
        //first we need to make sure we have a css class for the new color 
        //the 'new' in the below variable name refers to the fact that the color in the screen is changing from the old color to the new colod
        //, it is NOT referring to the color being the first time we've used this color, as we may be reusing this color
        let classNameForNewColor = ensureCssHasAClassForThisColorAndReturnClassName(document, colorToSet);
        let [thisUpdateId] = editor.deltaDecorations(decorationsToRemove, [ {
            range: fakeRangeToRange(deserializeRange(range)),
            options: { inlineClassName: classNameForNewColor }
        }]);
        console.log("we just set the range " + range + " to the color class name " + classNameForNewColor);
        currentColors.set(range, [colorToSet, thisUpdateId]);
    } 
}

/*
export function initiateAnimationPlayback(editor, document) {
    startTime = Date.now();
    decorationsCollection = editor.createDecorationsCollection();
    function updateDecorations() {
      const elapsedTime = Date.now() - startTime;  // Time elapsed in ms
      
      let animationInfo = getAnimationInfoFunction(elapsedTime);
      //it gives back undefined once elapside time has gone above what there is actual animation for 
      if (animationInfo === undefined) {
        clearInterval(intervalId);
        decorationsCollection.clear();
        areWeCurrentlyPlayingBack = false;
        return;
      }

      let syllableRangeValues = animationInfo.currentSyllableRanges;
      let parenInfos = animationInfo.parensInfo;
     


      //I tried to write a map here but it was being weird
      const syllableDecorationOptions = [];
      for (let range of syllableRangeValues) {
        syllableDecorationOptions.push({
          range: fakeRangeToRange(range),
          options: {
              inlineClassName: 'highlighted'
          }
        });
      } 

        var bracketDecorationOptions = [];

        //square for a tighter animation
        factor = factor * factor;

        let cleanedInitial = rgbFromCleaned(cleanHex(initialColor));
        let cleanedFinal = rgbFromCleaned(cleanHex(finalColor));
        // Interpolate each channel towards white (255)
        const newR = Math.round(cleanedInitial.r + factor * (cleanedFinal.r - cleanedInitial.r));
        const newG = Math.round(cleanedInitial.g + factor * (cleanedFinal.g - cleanedInitial.g));
        const newB = Math.round(cleanedInitial.b + factor * (cleanedFinal.b - cleanedInitial.b));
        // Convert the new RGB values back to hex and return
        const toHex = (value) => value.toString(16).padStart(2, "0").toUpperCase();
        return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
      }


      function updateCss(className, color) {
        //update css with computed color
        let stylesheet = document.styleSheets[0];
        let ruleIndex = Array.from(stylesheet.cssRules).findIndex(rule => {
            return rule.selectorText.includes(className)});
        if (ruleIndex === -1) {
          console.log("error: couldn't find rule index for updating css");
          return;
        }
        stylesheet.cssRules[ruleIndex].style.color = color;
      }

      updateCss("highlighted", morphColors( "#0075ff" , "#42D6FF", Math.pow(Math.sin(Math.PI * animationInfo.currentSyllableLocation), .33)));

      parenInfos.forEach(parenInfo => {
        let section = parenInfo.currentLocation.section;
        let amount = parenInfo.currentLocation.amount;
        let startsWithTowards = parenInfo.startsWithTowards;

        let className = 'parenHighlight' + (parenInfo.depth % 3);

       // console.log(amount);
        let color
        if (startsWithTowards && section % 2 == 0
                              ||
            !startsWithTowards && section % 2 == 1
        ) {
          //even indexed sections with starting with towards must go from normal to white
          //odd indexed sections with starting from away from must do the same
          color = morphColors(parenIndexToInitialColor(parenInfo.depth), "#FFFFFF", amount);
        }
        else {
          //all other scenarios will morph from white to normal
          color = morphColors(parenIndexToInitialColor(parenInfo.depth), "#FFFFFF", 1 - amount);
        }

        updateCss(className, color);

        bracketDecorationOptions.push({
          range: fakeRangeToRange(parenInfo.openParenRange),
          options: {
            inlineClassName : className
          }
        });
        bracketDecorationOptions.push({
          range: fakeRangeToRange(parenInfo.closeParenRange),
          options: {
            inlineClassName : className
          }
        });
        parenInfo.directionIndicatorRanges.forEach(r => {
          bracketDecorationOptions.push({
            range: fakeRangeToRange(r),
            options: {
              inlineClassName : className
            }
          })
        })
        })
      

        // Add the decoration to the collection
        decorationsCollection.set(syllableDecorationOptions.concat(bracketDecorationOptions));
    
      
    }

    intervalId = setInterval(updateDecorations, actualFrameDuration);
}

*/
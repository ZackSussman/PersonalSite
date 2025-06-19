//as a function of time, will specify the range of syllables to highlight 
var getAnimationInfoFunction = undefined;

//the time that playback was started at 
var startTime = undefined;

import { DELAY_BEFORE_PLAYBACK_START, CORRECTION_FACTOR } from '../../generated-javascript/main/src/runtime-business/RuntimeConstants.js';

import {audioContext} from "./AudioRuntime.js";

let actualFrameDuration = undefined;

export var areWeCurrentlyPlayingBack = false; //keeps track of whether we are currently animating

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

//util functions for animating------------------------------------


function morphToWhite(initialColor, amount) {
    // Clean hex color: removes "#" and ensures it's 6 chars
    function cleanHex(hex) {
        return hex.replace(/^#/, "").padEnd(6, "0").slice(0, 6);
    }

    // Convert cleaned hex to RGB
    function rgbFromCleaned(hex) {
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    }

    // Convert number 0–255 to two-digit hex
    function toHex(value) {
        return value.toString(16).padStart(2, "0").toUpperCase();
    }

    const cleanedInitial = rgbFromCleaned(cleanHex(initialColor));

    // White is {r: 255, g: 255, b: 255}
    const newR = Math.round(cleanedInitial.r + amount * (255 - cleanedInitial.r));
    const newG = Math.round(cleanedInitial.g + amount * (255 - cleanedInitial.g));
    const newB = Math.round(cleanedInitial.b + amount * (255 - cleanedInitial.b));

    // Convert to hex string
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
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
        currentColors.set(range, [colorToSet, thisUpdateId]);
    } 
}

import { serializeRange } from '../../generated-javascript/main/src/typescript/ParserListeners/ParserListenerUtils.js';
//initialColorStateMap is the map of initial colors of the program state before animation begins, mapping ranges to their baseline colors
export function initiateAnimation(editor, document, initialColorStateMap, audioStartTime) {
    areWeCurrentlyPlayingBack = true;
    startTime = audioStartTime;
    console.log("start time is " + startTime);
    //the runtime logic of the animation...this function will get called from an interval and its job is to continually
    //update the colors based on the computed animation function 
    function animationRuntime() {
        const elapsedTime = (audioContext.currentTime - startTime) * 1000;  // Time elapsed in ms
        console.log("elapside time is " + elapsedTime);
        
        let animationInfo = getAnimationInfoFunction(Math.max(elapsedTime - DELAY_BEFORE_PLAYBACK_START + CORRECTION_FACTOR, 0)); //apply a .1 second shift to align with the delay the audio is forced to have
        //it gives back undefined once elapside time has gone above what there is actual animation for 
        if (animationInfo === undefined) {
            clearInterval(intervalId);
            repaintColors(editor, document, initialColorStateMap);
            areWeCurrentlyPlayingBack = false;
            return;
        }

        /*we must compute the color for each object in the current animation info and add all the data to a map
        then, we will send it into our alterColors function 
           
            we a series of colors to compute:
               1) the color of the current syllable
               2-n) the colors of all of the enclosing containers

        for each of the colors above, we must find all the ranges and add them into our color map 
        */
        let colorsToSet = new Map();
        let syllableRangeValues = animationInfo.currentSyllableRanges;
        let parenInfos = animationInfo.parensInfo;
       
        //1--------------------- syllable ranges
        let syllableBaselineColor = initialColorStateMap.get(serializeRange(syllableRangeValues[0])); //there is always at least one and they are the same color
        let factor = animationInfo.currentSyllableLocation;
        let syllableColorToUse = morphToWhite(syllableBaselineColor, Math.pow(Math.sin(Math.PI * animationInfo.currentSyllableLocation), .66) ); //square for a tighter animation
        for (let range of syllableRangeValues) {
            colorsToSet.set(serializeRange(range), syllableColorToUse);
        }
        //-----------------------

        //2---------------------- paren ranges
        for (let parenInfo of parenInfos) {
            let initialGroupingColorToUse = initialColorStateMap.get(serializeRange(parenInfo.openParenRange));
            let section = parenInfo.currentLocation.section;
            let amount = parenInfo.currentLocation.amount;
            let startsWithTowards = parenInfo.startsWithTowards;
            let color
            if (startsWithTowards && section % 2 == 0
                                  ||
                !startsWithTowards && section % 2 == 1
            ) {
              //even indexed sections with starting with towards must go from normal to white
              //odd indexed sections with starting from away from must do the same
              color = morphToWhite(initialGroupingColorToUse, amount);
              //we do a test here to see if we are in the very last section, and if so, 
              //we must very slightly prematurely reset the color down to 0 so that 
              //the brace isn't hanging at white after we lose scope of it
              if (section == parenInfo.directionIndicatorRanges.length && amount > 0.9) {
                //so we need to go down from 90% of the last 10%
               // console.log("we are SETTING to " + (1 - (amount - .9) / .1));
                color = morphToWhite(initialGroupingColorToUse, .9 * (1 - (amount - .9) / .1) );
              }
            }
            else {
              //all other scenarios will morph from white to normal
              color = morphToWhite(initialGroupingColorToUse, 1 - amount);
            }

            colorsToSet.set(serializeRange(parenInfo.openParenRange), color);
            colorsToSet.set(serializeRange(parenInfo.closeParenRange), color);

            //console.log("the ranges are: ");
            //for (let r of parenInfo.directionIndicatorRanges) {
            //    console.log(r);
            //}

            //sort by starting x coordinate in the range to ensure they are in order w.r.t our sections
            parenInfo.directionIndicatorRanges.sort((r1, r2) => {
                if (r1[0] == r2[0]) {
                    return r1[1] - r2[1];
                }
                return r1[0] - r2[0];
            });
           // console.log("section is " + section);
           // console.log("the section is " + section);

           let bottom = section - 1;
           //need to close out the trailing shift token
           if ((startsWithTowards && section % 2 == 1) || (!startsWithTowards && section % 2 == 0)) {
              bottom = section - 2;
           }
           else {
              bottom = section - 1;
           }
            for (let i = bottom; i <= section; i++) {
                //console.log("i is " + i);
                if (i < parenInfo.directionIndicatorRanges.length && i >= 0) {
                    colorsToSet.set(serializeRange(parenInfo.directionIndicatorRanges[i]), color);
                }
            }
            /*
            parenInfo.directionIndicatorRanges.forEach((r, i) => {
                //console.log("i is " + i);
                //console.log("section is " + section);
                //console.log("setting to " + ((i == section) || (i - 1) == section) ? color : initialGroupingColorToUse);
                //set the color back to the basic one if it is not in the correct range
                let maskedColor = ((i == section) || (i - 1) == section) ? color : initialGroupingColorToUse;
              
                //colorsToSet.set(serializeRange(r), color);
            });*/
        }
        //------------------------------------------------------------

        alterColors(editor, document, colorsToSet);

    }

    intervalId = setInterval(animationRuntime, actualFrameDuration);
}


import * as monaco from 'monaco-editor';
monaco.languages.register({ id: 'MotorMusic' });

import * as MotorMusicTokensProvider from './main/generated-javascript/main/typescript/MotorMusicTokensProvider.js';
if (typeof window === 'undefined') {
} else {
    window.MotorMusicTokensProvider = MotorMusicTokensProvider;
}





monaco.languages.setTokensProvider('MotorMusic', new MotorMusicTokensProvider.MotorMusicTokensProvider());



monaco.editor.defineTheme('MotorMusicTheme', {
    base: 'vs',
    inherit: false,
    colors: {
      "editor.background": '#171617',
      "editor.lineHighlightBorder": '#424242',
      "editorLineNumber.foreground": "#00ffe0",
      "editorLineNumber.activeForeground":  '#0bf098',
      "editorCursor.foreground": "#c933ffa6",
      "editor.selectionBackground": "#547a7a5c",
      "editor.lineHighlightBackground": "#111111", 
      "editor.lineHighlightBorder": "#00000000",
      "editorBracketHighlight.foreground1" : "#1ca182",
      "editorBracketHighlight.foreground2" : "#6b90ff",
      "editorBracketHighlight.foreground3" : "#fe00ff",
      "editorBracketHighlight.unexpectedBracket.foreground": "#ff0000"
    },
    rules: [
      {token: 'lparen1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'rparen1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'lparen2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'rparen2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'lparen0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'rparen0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'mid0.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'mid1.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'mid2.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'midp1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'midp2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'midp0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'lcurly0.MotorMusic', foreground: '#1ca182'},
      {token: 'lcurly1.MotorMusic', foreground: '#6b90ff'},
      {token: 'lcurly2.MotorMusic', foreground: '#fe00ff'},
      {token: 'rcurly0.MotorMusic', foreground: '#1ca182'},
      {token: 'rcurly1.MotorMusic', foreground: '6b90ff'},
      {token: 'rcurly2.MotorMusic', foreground: '#fe00ff'},
      {token: 'number.MotorMusic', foreground: '#0075ff'},
      {token: 'ident.MotorMusic', foreground: '#0075ff'},
      {token: 'underscore.MotorMusic', foreground: '#0075ff'},
      {token: 'unrecognized.MotorMusic', foreground: 'FF0000'}
    ]
});


const defaultCode = `(
    {
        ({twin|kl} {twin|kl}  {li|tle} | {star|_ } )
        ({how|i} {won|der}  {what|you} | {are|_ } )
        ({up|a} {bove|the}  {world|so} | {high|_ } )
      |
        ({like|a} {dia|mond}  {in|the} | {sky|_ } )
    }
        (twin kle twin kle li tl | star _ )
        how i won der what you 
|
    are
)`;

let editor = monaco.editor.create(document.getElementById('container'), {
    value: defaultCode,
    language: 'MotorMusic',
    theme: 'MotorMusicTheme',
    overviewRulerLanes: 0,
    automaticLayout: true,
    fontSize: 18,
    minimap: {
      enabled: false
    },
    matchBrackets: "near",
    bracketPairColorization: {
      enabled: false
    },
    scrollBeyondLastLine: false,  
    smoothScrolling: false       
});

editor.layout();

monaco.languages.setLanguageConfiguration('MotorMusic', {
 /*  brackets: [
       ['{', '}'],
       ['[', ']'],
       ['(', ')']
   ],*/
   autoClosingPairs: [
       { open: '{', close: '| }' },
       { open: '[', close: ']' },
       { open: '(', close: '| )' },
       {open: '<', close: '>'}
   ],
   surroundingPairs: [
       { open: '{', close: '}' },
       { open: '[', close: ']' },
       { open: '(', close: ')' },
       {open : '<', close: '>'}
   ]
});

//RUNTIME DATA--------------------------------
//as a function of time, will specify the range of syllables to highlight 
var getAnimationInfoFunction = undefined;
const syllableTime = 500; //milliseconds
var areWeCurrentlyPlayingBack = false;


//parse, statics, report errors, construct animation functions
function consumeText() {
  let [retreivedGetAnimationInfoFunction,  errors] = process(editor.getModel().getValue(), syllableTime);
  getAnimationInfoFunction = retreivedGetAnimationInfoFunction;
  monaco.editor.setModelMarkers(editor.getModel(), 'owner',
     errors.map((error) => 
     (
        {
           message: error.message,
           severity: monaco.MarkerSeverity.Error,
           startLineNumber: error.startLine,
           startColumn: error.startCol,
           endLineNumber: error.endLine,
           endColumn: error.endCol,
        })
     ),
  );
}

import {process} from '../src/main/generated-javascript/main/typescript/Validate.js'
editor.onDidChangeModelContent(consumeText);


// Dynamically create a button to run code
const button = document.createElement('button');
button.innerText = 'run';
button.id = 'run-button';

// Add styles to the button (optional)
button.style.padding = '10px 20px';
button.style.backgroundColor = '#4CAF50';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';
button.style.fontSize = '16px';
button.style.marginBottom = '20px';

button.className = 'action-button';

// Add the button to the DOM (before the editor container)
const container = document.getElementById('container');
container.parentNode.insertBefore(button, container);

// Add event listener to the button
button.addEventListener('click', () => {
  //don't allow click if we are currently playing back
  if (areWeCurrentlyPlayingBack) {
    return;
  }

  if (getAnimationInfoFunction === undefined) {
    consumeText();
    if (getAnimationInfoFunction === undefined) {
      console.log("error: unable to retreived animation function");
      return;
    }
  }
  
    // Create a decorations collection
    const decorationsCollection = editor.createDecorationsCollection();
     //perform animation
    let startTime = Date.now();

    var intervalId;
    function updateDecorations() {
      const elapsedTime = Date.now() - startTime;  // Time elapsed in ms
      let animationInfo = getAnimationInfoFunction(elapsedTime);
      if (animationInfo === undefined) {
        clearInterval(intervalId);
        decorationsCollection.clear();
        areWeCurrentlyPlayingBack = false;
        return;
      }
      let syllableRangeValues = animationInfo.currentSyllable;
      let bracketInfos = animationInfo.bracketsInfo;
      let parenInfos = animationInfo.parensInfo;
     
      //we had constructed ranges in our typescript as a 4 tupule, now we can create an actual range from it
      function fakeRangeToRange(x) {
        return new monaco.Range(x[0], x[1], x[2], x[3]);
      }


      const syllableDecorationOptions = [{
        range: fakeRangeToRange(syllableRangeValues),
        options: {
            inlineClassName: 'highlighted'
        }
      }];

      var bracketDecorationOptions = [];


              /**
     * Morphs a hex color towards white based on a factor from 0 to 1.
     * 
     * @param {string} hexColor - A string representing the initial color in hex format (e.g., "#FF5733").
     * @param {number} factor - A number between 0 and 1. 0 returns the original color, 1 returns white.
     * @returns {string} A string representing the resulting color in hex format.
     */
        function morphColors(initialColor, finalColor, factor) {
        if (factor < 0 || factor > 1) {
          throw new Error("Factor must be between 0 and 1.");
        }


        //square for a tighter animation
        factor = factor * factor;

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

      bracketInfos.forEach(bracketInfo => {
        let leftSide = bracketInfo.gestureLocation.leftSide;
        let amount = bracketInfo.gestureLocation.amount;

        function bracketIndexToInitialColor(bracketIndex) {
          let index = bracketIndex % 3;
          if (index === 0) {
            return "#1ca182"
          }
          else if (index === 1) {
            return "#6b90ff"
          }
          else {
            //assert(index === 2)
            return "#fe00ff"
          }
        }

        //retreive color from amount
        let color
        if (leftSide) {
          //when amount is 0, we are all the way at the left and want to be white...
          //on the other hand, when amount is 1, we have reached the middle and want to be initial color
          color = morphColors(bracketIndexToInitialColor(bracketInfo.depth), "#FFFFFF", 1 - amount);
        }
        else {
          //on RHS, a 1 means we have reached the end and want to be white again, while a 0 means that we just started from | 
          //and want to be roughly the same color
          color = morphColors(bracketIndexToInitialColor(bracketInfo.depth), "#FFFFFF", amount);
        }
        let className = 'bracketHighlight' + (bracketInfo.depth % 3);

        updateCss(className, color);

        bracketDecorationOptions.push({
          range: fakeRangeToRange(bracketInfo.openBraceRange),
          options: {
            inlineClassName : className
          }
        });
        bracketDecorationOptions.push({
          range: fakeRangeToRange(bracketInfo.closeBraceRange),
          options: {
            inlineClassName : className
          }
        });
        bracketDecorationOptions.push({
          range: fakeRangeToRange(bracketInfo.midRange),
          options: {
            inlineClassName : className
          }
        })
      })

      parenInfos.forEach(parenInfo => {
        let leftSide = parenInfo.gestureLocation.leftSide;
        let amount = parenInfo.gestureLocation.amount;
        

        function parenIndexToInitialColor(parenIndex) {
          let index = parenIndex % 3;
          if (index === 0) {
            return "#fe00ff"
          }
          else if (index === 1) {
            return "#1ca182"
          }
          else {
            //assert(index === 2)
            return "#6b90ff"
          }
        }



        let className = 'parenHighlight' + (parenInfo.depth % 3);


        let color
        if (leftSide) {
          //for parens, we are white in the middle (1 for left), and normal in the beginning
          color = morphColors(parenIndexToInitialColor(parenInfo.depth), "#FFFFFF", amount);
        }
        else {
          //while on RHS of paren, we start at full white and end back at normal color
          color = morphColors(parenIndexToInitialColor(parenInfo.depth), "#FFFFFF", 1 - amount);
        }


        updateCss(className, color);

        bracketDecorationOptions.push({
          range: fakeRangeToRange(parenInfo.openBraceRange),
          options: {
            inlineClassName : className
          }
        });
        bracketDecorationOptions.push({
          range: fakeRangeToRange(parenInfo.closeBraceRange),
          options: {
            inlineClassName : className
          }
        });
        bracketDecorationOptions.push({
          range: fakeRangeToRange(parenInfo.midRange),
          options: {
            inlineClassName : className
          }
        })
      })

        // Add the decoration to the collection
        decorationsCollection.set(syllableDecorationOptions.concat(bracketDecorationOptions));

      
    }

    //compute animation time, want the value closest to 1000 / 60 but which divides syllableTime
    const idealFrameDuration = 1000/60; //60FPS
    const numFramesWeWillFit = Math.ceil (syllableTime / idealFrameDuration); //ceil because we want to be at LEAST 60 FPS
    const actualFrameDuration = syllableTime / numFramesWeWillFit ; 
    intervalId = setInterval(updateDecorations, actualFrameDuration);
    areWeCurrentlyPlayingBack = true;
});
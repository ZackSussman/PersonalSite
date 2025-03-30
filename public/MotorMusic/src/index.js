import * as monaco from 'monaco-editor';
monaco.languages.register({ id: 'MotorMusic' });

import * as MotorMusicTokensProvider from './main/generated-javascript/main/typescript/MotorMusicTokensProvider.js';
if (typeof window === 'undefined') {
} else {
    window.MotorMusicTokensProvider = MotorMusicTokensProvider;
}


let audioContext = null;

function initializeAudioContext() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext({ latencyHint: "interactive" });
    audioContext.resume();
    console.log("AudioContext created");
  } else {
    console.log("Reusing existing AudioContext");
  }
  return audioContext;
}

//audioContext.disconnect();
//audioContext = null;
//-----------------------------------------


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
      {token: 'syllable.MotorMusic', foreground: '#0075ff'},
      {token: 'underscore.MotorMusic', foreground: '#0075ff'},
      {token: 'unrecognized.MotorMusic', foreground: 'FF0000'},
      {token: 'langle.MotorMusic', foreground: '#8080B0'},
      {token: 'rangle.MotorMusic', foreground: '#8080B0'}
    ]
});


const defaultCode = `(
    {
        ({twin|kl} {twin|kl}  {li|tle} | 2star )
        ({how|i} {won|der}  {what|you} | 2arr )
        ({up|a} {bovv|the}  {world|so} | 2hii )
      |
        ({liek|a} {dia|mond}  {in|the} | 2skyy )
    }
        (twin kle twin kle li tl | 2star )
        how i won der what you 
|
    6arr
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
var syllableTime = 500; //milliseconds
var areWeCurrentlyPlayingBack = false;



// Function to create the slider and display the value
function createSyllableTimeSlider() {
  const sliderContainer = document.getElementById("slider-container");

  // Create the slider element
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "100";    // Minimum syllable time
  slider.max = "2000";   // Maximum syllable time
  slider.value = syllableTime; // Start at the current syllable time
  slider.id = "syllable-time-slider";

  // Create a label to display the current value
  const label = document.createElement("label");
  label.htmlFor = "syllable-time-slider";
  label.id = "syllable-time-label";
  label.textContent = `Syllable Time:`;

  // Create a span to display the actual value, and append it directly to the label
  const valueDisplay = document.createElement("span");
  valueDisplay.id = "syllable-time-value";
  valueDisplay.textContent = `${syllableTime} ms`;
  label.appendChild(valueDisplay);

  // Update the syllable time when the slider is moved
  slider.addEventListener("input", (event) => {
      syllableTime = parseInt(event.target.value, 10);
      valueDisplay.textContent = `${syllableTime} ms`;
  });

   // Add the callback to be called when the mouse is released, this is when we recompute audio and animatino times
  slider.addEventListener("change", () => {
    consumeText();
  });

  // Clear existing content and add the label, value display, and slider
  sliderContainer.innerHTML = "";
  sliderContainer.appendChild(label);
  sliderContainer.appendChild(slider);
}

// Call the function to add the slider on page load
createSyllableTimeSlider();

//audio for the current code
//stored as an array of arrays of arrays. 
//[block1, block2, block3], where each blocki = [[left1, right1], [left2, right2], ...]
var computedAudio = undefined;


//parse, statics, report errors, construct animation functions
function consumeText() {
  areWeCurrentlyPlayingBack = false; //stop running if model contents changed
  let [retreivedGetAnimationInfoFunction, retreivedComputedAudio, errors] = process(editor.getModel().getValue(), syllableTime);
  computedAudio = retreivedComputedAudio;
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

import {process} from '../src/main/generated-javascript/main/typescript/Compile.js'
editor.onDidChangeModelContent(consumeText);


// Dynamically create a button to run code
const button = document.createElement('button');
button.innerText = 'run';
button.id = 'run-button';

/*
// Add styles to the button (optional)
button.style.padding = '10px 20px';
button.style.backgroundColor = '#4CAF50';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';
button.style.fontSize = '16px';
button.style.marginBottom = '20px';
*/

button.className = 'action-button';

// Append the button to the header container
const headerContainer = document.querySelector('.header-container');
headerContainer.appendChild(button);

// Add event listener to the button
button.addEventListener('click', async () => {

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

  
  let audioContext = initializeAudioContext();
  let audioContextStartTime = Date.now();
  try {
    audioContext.resume();
  } catch (error) {
    console.log("UNABLE tO RESUME AUDIO CONTEXT: ", error)
  }
  console.log("the state of the audio context is " + audioContext.state);
  let processorNode;
  try {
    processorNode = new AudioWorkletNode(audioContext, "AudioGenerator");
  } catch (e) {
    try {
      const version = Date.now(); // Use a timestamp or unique version
      await audioContext.audioWorklet.addModule(`src/audio/AudioGenerator.js?version=${version}`);
      processorNode = new AudioWorkletNode(audioContext, "AudioGenerator", {
        channelCount: 2,  // Force stereo output (2 channels)
        channelCountMode: 'explicit',  // Ensure the node always has 2 channels
        channelInterpretation: 'speakers',  // Ensures stereo output as expected
        processorOptions: {
          sampleArrays: computedAudio, //replace with sample arrays given from typescript
        }
      });
    } catch (e) {
      console.log(`** Error: Unable to create worklet node: ${e}`);
    }
  }
  const gainNode = audioContext.createGain();
  processorNode.connect(gainNode).connect(audioContext.destination);

  function fadeOutAudio() {
    const fadeOutDuration = 0.1;
    const currentTime = audioContext.currentTime;

    // Schedule a smooth fade-out
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime); // Set current gain
    gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

    // Disconnect the processorNode after the fade-out is complete
    setTimeout(() => {
        console.log("number of inputs is " + audioContext.destination.numberOfInputs);
        processorNode.disconnect();
        gainNode.disconnect();
        audioContext.close();
    }, fadeOutDuration * 1000);
  }
  
    // Create a decorations collection
    const decorationsCollection = editor.createDecorationsCollection();
     //perform animation
   let startTime = Date.now();
   console.log("our start time is " + startTime);
   console.log("audio context start time is " + audioContextStartTime);
  // let startTime = audioContextStartTime;
   //let delayToAccountForLatency = audioContextStartTime - startTime;
   //console.log("using delay: " + delayToAccountForLatency);
    var intervalId;
    function updateDecorations() {
      //disable and exit if some other process decided we are no longer playing back
      if (!areWeCurrentlyPlayingBack) {
        clearInterval(intervalId);
        decorationsCollection.clear();
        fadeOutAudio();
        return;
      }
      const elapsedTime = Date.now() - startTime;  // Time elapsed in ms
      //console.log("elapsed time is " + elapsedTime);
      //if (elapsedTime - delayToAccountForLatency < 0) {
      //  return;
      //}
      let animationInfo = getAnimationInfoFunction(elapsedTime);
      if (animationInfo === undefined) {
        clearInterval(intervalId);
        decorationsCollection.clear();
        areWeCurrentlyPlayingBack = false;
        fadeOutAudio();
        return;
      }
      let syllableRangeValues = animationInfo.currentSyllableRanges;
      let bracketInfos = animationInfo.bracketsInfo;
      let parenInfos = animationInfo.parensInfo;
     
      //we had constructed ranges in our typescript as a 4 tupule, now we can create an actual range from it
      function fakeRangeToRange(x) {
        return new monaco.Range(x[0], x[1], x[2], x[3]);
      }


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
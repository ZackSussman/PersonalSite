import * as monaco from 'monaco-editor';
monaco.languages.register({ id: 'MotorMusic' });

import { initializeAudioRuntime, setComputedAudio } from './main/javascript/runtime-business/AudioRuntime.js';
import { setGetAnimationInfoFunction, setSyllableTime, repaintColors, initiateAnimation} from './main/javascript/runtime-business/AnimationRuntime.js';

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
      {token: 'rangle.MotorMusic', foreground: '#8080B0'},
      {token: 'dotp1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'dotp2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'dotp0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'overlinep1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'overlinep2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'overlinep0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
    ]
});


const defaultCode = `(
    (
        ((twin ^ kl) (twin ^ kl) (li ^ tle) . 2star )
        ((how ^ i)  (won ^ der)  (what ^ you) . 2arr )
        ((up ^ a) (bovv ^ the)  (world ^ so) . 2hii )
      ^
        ((liek ^ a) (dia ^ mond) (in ^ the) . 2skyy )
    )
    (twin kle twin kle li tl . 2star )
    how i won der what you 
.
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


/*
editor.addCommand(
  monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow,
  () => {
    const position = editor.getPosition();
    const specialChar = '‾';

    editor.executeEdits('', [
      {
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: specialChar,
        forceMoveMarkers: true
      }
    ]);

    editor.focus(); // Make sure focus remains
  }
);*/

editor.layout();

monaco.languages.setLanguageConfiguration('MotorMusic', {
 /*  brackets: [
       ['{', '}'],
       ['[', ']'],
       ['(', ')']
   ],*/
   autoClosingPairs: [
       { open: '(', close: ' )' },
   ],
   surroundingPairs: [
       { open: '(', close: ')' },
   ]
});


initializeAudioRuntime();

//audioContext.disconnect();
//audioContext = null;
//-----------------------------------------


//RUNTIME DATA--------------------------------
var syllableTime = 500; //milliseconds
var areWeCurrentlyPlayingBack = false;

var currentColorMap = undefined;

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
      setSyllableTime(syllableTime);
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

import {process} from '../src/main/generated-javascript/main/typescript/Compile.js'
//parse, statics, report errors, construct animation functions
function consumeText() {
  let [colorMap, retreivedGetAnimationInfoFunction, retreivedComputedAudio, errors] = process(editor.getModel().getValue(), syllableTime);
  if (errors.length === 0 && retreivedComputedAudio === undefined) {
    console.log("error getting retreived computed audio");
    return;
  }
  if (errors.length === 0 && retreivedGetAnimationInfoFunction === undefined) {
    console.log("error getting animation info function");
    return;
  }
  if (errors.length === 0 && colorMap === undefined) {
    console.log("error getting color map");
    return;
  }
  if (errors.length === 0) {
    setComputedAudio(retreivedComputedAudio);
    setGetAnimationInfoFunction(retreivedGetAnimationInfoFunction);
    repaintColors(editor, document, colorMap);
    currentColorMap = colorMap;
  }
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
editor.onDidChangeModelContent(consumeText);


// Dynamically create a button to run code
const button = document.createElement('button');
button.innerText = 'run';
button.id = 'run-button';

button.className = 'action-button';

// Append the button to the header container
const headerContainer = document.querySelector('.header-container');
headerContainer.appendChild(button);




// Add event listener to the button for playback (animations + sound)
button.addEventListener('click', async () => {
  initiateAnimation(editor, document, currentColorMap);
});


//initial consumption of default code
consumeText();
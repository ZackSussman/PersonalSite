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
      "editor.lineHighlightBackground": "#333333", 
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
      {token: 'comma0.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'comma1.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'comma2.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'commap1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'commap2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'commap0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'underscore0.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'underscore1.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'underscore2.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'underscorep1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold'},
      {token: 'underscorep2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold'},
      {token: 'underscorep0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold'},
      {token: 'lcurly0.MotorMusic', foreground: '#1ca182'},
      {token: 'lcurly1.MotorMusic', foreground: '#6b90ff'},
      {token: 'lcurly2.MotorMusic', foreground: '#fe00ff'},
      {token: 'rcurly0.MotorMusic', foreground: '#1ca182'},
      {token: 'rcurly1.MotorMusic', foreground: '6b90ff'},
      {token: 'rcurly2.MotorMusic', foreground: '#fe00ff'},
      {token: 'number.MotorMusic', foreground: '#0075ff'},
      {token: 'ident.MotorMusic', foreground: '#0075ff'},
      {token: 'unrecognized.MotorMusic', foreground: 'FF0000'}
    ]
});

let editor = monaco.editor.create(document.getElementById('container'), {
    value: [
      '{',
        '\t\t{bwa | ha ha}',
      '\t|', 
        '\t\t((ta | ri) | ki)',
    '}'
    ].join('\n'),
    language: 'MotorMusic',
    theme: 'MotorMusicTheme',
    overviewRulerLanes: 0,
    automaticLayout: true,
    minimap: {
      enabled: false
    },
    matchBrackets: "near",
    bracketPairColorization: {
      enabled: false
    }
});

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


//as a function of time, will specify the range of syllables to highlight 
var syllablesAnimationFunction = undefined;

const syllableTime = 500; //milliseconds


//parse, statics, report errors, construct animation functions
function consumeText() {
  let [retreivedSyllablesAnimationFunction, errors] = process(editor.getModel().getValue(), syllableTime);
  syllablesAnimationFunction = retreivedSyllablesAnimationFunction;
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
  if (syllablesAnimationFunction === undefined) {
    consumeText();
    if (syllablesAnimationFunction === undefined) {
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
      let rangeValues = syllablesAnimationFunction(elapsedTime);
      if (rangeValues != undefined) {
        const range = new monaco.Range(rangeValues[0], rangeValues[1], rangeValues[2], rangeValues[3]);
        // Define the decoration options
        const decorationOptions = [{
          range: range,
          options: {
              inlineClassName: 'highlighted',  // CSS class for the decoration
          }
        }];
        // Add the decoration to the collection
        decorationsCollection.set(decorationOptions);
      }
      else {
        clearInterval(intervalId);
        decorationsCollection.clear();
      }
    }

    //compute animation time, want the value closest to 1000 / 60 but which divides syllableTime
    const idealFrameDuration = 1000/60; //60FPS
    const numFramesWeWillFit = Math.ceil (syllableTime / idealFrameDuration); //ceil because we want to be at LEAST 60 FPS
    const actualFrameDuration = syllableTime / numFramesWeWillFit ; 
    intervalId = setInterval(updateDecorations, actualFrameDuration);
});
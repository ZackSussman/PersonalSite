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
var getAnimationInfoFunction = undefined;

const syllableTime = 1000; //milliseconds


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
            inlineClassName: 'highlighted', 
        }
      }];

      var bracketDecorationOptions = [];
      for (let bracketInfo of bracketInfos ) {
        let className = 'bracketHighlight' + (bracketInfo.depth % 3);
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
      }

      for (let parenInfo of parenInfos ) {
        let className = 'parenHighlight' + (parenInfo.depth % 3);
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
      }

        // Add the decoration to the collection
        decorationsCollection.set(syllableDecorationOptions.concat(bracketDecorationOptions));

      
    }

    //compute animation time, want the value closest to 1000 / 60 but which divides syllableTime
    const idealFrameDuration = 1000/60; //60FPS
    const numFramesWeWillFit = Math.ceil (syllableTime / idealFrameDuration); //ceil because we want to be at LEAST 60 FPS
    const actualFrameDuration = syllableTime / numFramesWeWillFit ; 
    intervalId = setInterval(updateDecorations, actualFrameDuration);
});
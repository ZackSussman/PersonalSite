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
      { token: 'plus.MotorMusic', foreground: '#0075ff' }, 
      { token: 'comma.MotorMusic', foreground: '#0075ff'},
      //{ token: 'lsqbracket.MotorMusic', foreground: '1ca182'},
      //{token: 'rsqbracket.MotorMusic', foreground: '1ca182'},
      {token: 'lparen.MotorMusic', foreground: 'fe00ff', fontStyle: 'bold'},
      {token: 'rparen.MotorMusic', foreground: 'fe00ff', fontStyle: 'bold'},
      {token: 'mid.MotorMusic', foreground: 'fe00ff', fontStyle: 'bold'},
      //{token: 'lcurly.MotorMusic', foreground: '6b90ff'},
      //{token: 'rcurly.MotorMusic', foreground: '6b90ff'},
      {token: 'number.MotorMusic', foreground: '#0075ff'},
      {token: 'ident.MotorMusic', foreground: '#0075ff'},
      {token: 'quote.MotorMusic', foreground: '07e38f', fontStyle: 'italic'},
      {token: 'voice.MotorMusic', foreground: '19bd7e', fontStyle: 'italic'},
      {token: 'exclamation.MotorMusic', foreground: 'ebbdff', fontStyle: 'bold'},
      {token: 'langle.MotorMusic', foreground: 'DE1CCB'},
      {token: 'rangle.MotorMusic', foreground: 'DE1CCB'},
      {token: 'underscore.MotorMusic', foreground: '274e63'},
      {token: 'a.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'as.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'b.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'c.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'cs.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'd.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'ds.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'e.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'f.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'fs.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'g.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'gs.MotorMusic', foreground: 'B71CDE', fontStyle: 'bold'},
      {token: 'unrecognized.MotorMusic', foreground: 'FF0000'}

    ]
});

let editor = monaco.editor.create(document.getElementById('container'), {
    value: [
    '[E!][<A#, B, C>]["all day"]{',
            '{[21]bro, ["haya"]tooo},',
            '{(a | b), ["weirdness"]}',
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
      enabled: true
  }
});

monaco.languages.setLanguageConfiguration('MotorMusic', {
   brackets: [
       ['{', '}'],
       ['[', ']'],
       ['<', '>']
   ],
   autoClosingPairs: [
       { open: '{', close: '}' },
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


import {validate} from '../src/main/generated-javascript/main/typescript/Validate.js'
editor.onDidChangeModelContent( _ => {
   let errors = validate(editor.getModel().getValue());
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
});
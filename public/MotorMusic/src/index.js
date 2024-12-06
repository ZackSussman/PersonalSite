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
      { token: 'lsqbracket2.MotorMusic', foreground: '#1ca182'},
      {token: 'rsqbracket2.MotorMusic', foreground: '#1ca182'},
      { token: 'lsqbracket0.MotorMusic', foreground: '#6b90ff'},
      {token: 'rsqbracket0.MotorMusic', foreground: '#6b90ff'},
      { token: 'lsqbracket1.MotorMusic', foreground: '#fe00ff'},
      {token: 'rsqbracket1.MotorMusic', foreground: '#fe00ff'},
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
      {token: 'quote.MotorMusic', foreground: '07e38f', fontStyle: 'italic'},
      {token: 'voice.MotorMusic', foreground: '19bd7e', fontStyle: 'italic'},
      {token: 'exclamation.MotorMusic', foreground: 'ebbdff', fontStyle: 'bold'},
      {token: 'langle.MotorMusic', foreground: 'DE1CCB'},
      {token: 'rangle.MotorMusic', foreground: 'DE1CCB'},
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
      {token: 'unrecognized.MotorMusic', foreground: 'FF0000'},
      {token: 'semicolon.MotorMusic', foreground: '#0bf098'},
      {token: 'dot.MotorMusic', foreground: 'ebbdff', fontStyle: 'bold'}

    ]
});

let editor = monaco.editor.create(document.getElementById('container'), {
    value: [
      '[{1 + 1  1 + 1}]{',
        '\t(',
          '\t\t[1]"kick"<b>',
          '\t\t[[1]"hat"<t>]{"bass"<([0.5]doo [0.5]doo >}',
        '\t|',
          '\t\t[[1]"snare"<kaaa>]{"bass"< | [1]doo )>}',
          '\t\t[[1]"hat"<t>]{"bass"<([0.5]{d doo >}',
        '\t)',
        '\t(',
          '\t\t[[1]"kick"<b>]{"bass"<doo doo>}',
          '\t\t[[1]"hat"<t>]{"bass"<doo doo} >}',
        '\t|',
          '\t\t["bass"< | [2]doo )>]{[1]{"snare"<kaa> "hat"<t>}}',
        '\t)',
      '};'
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
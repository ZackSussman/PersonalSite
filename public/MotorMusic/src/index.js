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
      foreground: '523852'
    },
    rules: [
      { token: 'plus.MotorMusic', foreground: '000000' }, 
      { token: 'comma.MotorMusic', foreground: '000000'},
      { token: 'lsqbracket.MotorMusic', foreground: '1ca182'},
      {token: 'rsqbracket.MotorMusic', foreground: '1ca182'},
      {token: 'lparen.MotorMusic', foreground: 'fe00ff', fontStyle: 'bold'},
      {token: 'rparen.MotorMusic', foreground: 'fe00ff', fontStyle: 'bold'},
      {token: 'mid.MotorMusic', foreground: 'fe00ff', fontStyle: 'bold'},
      {token: 'lcurly.MotorMusic', foreground: '0f37ad'},
      {token: 'rcurly.MotorMusic', foreground: '0f37ad'},
      {token: 'number.MotorMusic', foreground: '000000'},
      {token: 'ident.MotorMusic', foreground: '0000FF'},
      {token: 'quote.MotorMusic', foreground: '07e38f', fontStyle: 'italic'},
      {token: 'voice.MotorMusic', foreground: '19bd7e', fontStyle: 'italic'},
      {token: 'exclamation.MotorMusic', foreground: 'A31515', fontStyle: 'bold'},
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
    theme: 'MotorMusicTheme'
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
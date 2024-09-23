import * as monaco from 'monaco-editor';
monaco.languages.register({ id: 'MotorMusic' });
let editor = monaco.editor.create(document.getElementById('container'), {
         value: [
            '[E!][<A#, B, C>]["all day"]{',
            '{[21]bro, ["haya"]tooo},',
            '{(a | b), ["weirdness"]}',
            '}'
         ].join('n'),
         language: 'MotorMusic'
      });
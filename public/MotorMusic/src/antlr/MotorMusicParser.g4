parser grammar MotorMusicParser;

options {tokenVocab = MotorMusicLexer;}

compilationUnit:
    exp
    EOF
;

note:
  | A
  | As
  | B
  | C
  | Cs
  | D
  | Ds
  | E
  | F
  | Fs
  | G
  | Gs
;

beat:
  | NUMBER
  | NUMBER PLUS beat
;

concat_list:
    | exp
    | exp COMMA concat_list
;

note_list:
  | note
  | note COMMA note_list
;

exp:
  | UNDERSCORE
  | IDENT
  | beat
  | VOICE
  | note EXCLAMATION
  | LANGLE note_list RANGLE
  | LSQBRACKET exp RSQBRACKET exp
  | LPAREN exp MID exp RPAREN
  | LCURLY concat_list RCURLY
;
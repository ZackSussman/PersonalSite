parser grammar MotorMusicParser;

options {tokenVocab = MotorMusicLexer;}

compilationUnit:
     e = exp EOF #Main
;

note:
    A #A
  | As #As
  | B #B
  | C #C
  | Cs #Cs
  | D #D
  | Ds #Ds
  | E #E
  | F #F
  | Fs #Fs
  | G #G
  | Gs #Gs
;

number_list:
    top = NUMBER #SingleNumber
  | top = NUMBER PLUS rest = number_list #MultiNumber
;

exp_list:
      top = exp #SingleExp
    | top = exp COMMA rest = exp_list #MultiExp
;

note_list:
    top = note #SingleNote
  | top = note COMMA rest = note_list #MultiNote
;
  
exp:
    UNDERSCORE #Repeat
  | ident = IDENT #Ident
  | beat = number_list #Beat
  | voice = VOICE #Voice
  | tonic = note EXCLAMATION #Tonic
  | LANGLE notes = note_list RANGLE #Harmony
  | LSQBRACKET action = exp RSQBRACKET target = exp #App
  | LPAREN towards = exp MID awayFrom = exp RPAREN #Resolve
  | LCURLY concat = exp_list RCURLY #Concat
;
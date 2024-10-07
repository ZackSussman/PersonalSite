parser grammar MotorMusicParser;

options {tokenVocab = MotorMusicLexer;}

compilationUnit:
     e = EOF #EmptyProgram
    | e = music SEMICOLON rest = compilationUnit #ProgramCons
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

meter:
    beat = number_list #MeterBeat
  | LCURLY concat = meter_list RCURLY #MeterConcat
  | LCURLY away_from = meter_list MID towards = meter_list RCURLY #SpecMeterConcat
  | LPAREN towards = meter_list MID away_from = meter_list RCURLY #MeterResolve
;

meter_list:
    top = meter #SingleMeter
  | top = meter rest = meter_list #MultiMeter
;

music_list:
      top = music #SingleMusic
    | top = music rest = music_list #MultiMusic
;

bracketed_music_list:
    LCURLY value = music_list RCURLY #BracketedMusicList
  | LCURLY away_from = music_list MID towards = music_list RCURLY #ResolveBracketedMusicList
;

note_list:
    top = note #SingleNote
  | top = note rest = note_list #MultiNote
;

pitch_sequence:
      LANGLE  pitches = note_list RANGLE #UntimedSingle
    | LSQBRACKET time = NUMBER RSQBRACKET LANGLE pitches = note_list RANGLE #TimedSingle
    | LANGLE pitches = note_list RANGLE rest = pitch_sequence #UntimedMulti
    | LSQBRACKET time = NUMBER RSQBRACKET LANGLE pitches = note_list RANGLE rest = pitch_sequence #TimedMulti
;

music:
    UNDERSCORE #Repeat
  | ident = IDENT #Ident
  | beat = number_list #Beat
  | voice = VOICE #Voice
  | tonic = note EXCLAMATION #Tonic
  | LANGLE notes = note_list RANGLE #Harmony
  | note_value = note #SingletonNote
  | LPAREN towards = music_list MID awayFrom = music_list RPAREN #Resolve
  | LCURLY concat = music_list RCURLY #Concat
  | LCURLY awayFrom = music_list MID towards = music_list RCURLY #SpecConcat
  | DOT #StartOfMeter
  | voice = VOICE LSQBRACKET music_value = music RSQBRACKET #VoiceTag
  | LSQBRACKET time = NUMBER RSQBRACKET music_value = music #TimeTag
  | LANGLE tonic = note EXCLAMATION RANGLE music_value = music #TonicTag
  | LSQBRACKET notes = pitch_sequence RSQBRACKET music_value = music #PitchTag
  | LSQBRACKET container = music RSQBRACKET contained = bracketed_music_list #Containment
;
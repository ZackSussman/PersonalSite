parser grammar MotorMusicParser;

options {tokenVocab = MotorMusicLexer;}

compilationUnit:
     e = EOF #EmptyProgram
    | e = music EOF #NonEmptyProgram
;


bracketed_music_list:
    LCURLY value = music_list RCURLY #BracketedMusicList
  | LCURLY away_from = music_list MID towards = music_list RCURLY #ResolveBracketedMusicList
;

music_list:
   top = music #Single
  | top = music rest = music_list #Multi
;

music:
    UNDERSCORE #Empty
  | number = NUMBER UNDERSCORE #TimeTaggedEmpty
  | syllable = SYLLABLE #Syllable
  | number = NUMBER syllable = SYLLABLE #TimeTaggedSyllable
  | LPAREN towards = music_list MID awayFrom = music_list RPAREN #Resolve
  | LCURLY awayFrom = music_list MID towards = music_list RCURLY #Concat
  | LANGLE musics = music_list RANGLE #NeutralConcat
;
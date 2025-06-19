parser grammar MotorMusicParser;

options {tokenVocab = MotorMusicLexer;}

compilationUnit:
      e = EOF #EmptyProgram
    | e = gesture EOF #NonEmptyProgram
;


raised_gesture_list:
    top = gesture #RaisedSingle
  | top = gesture rest = raised_gesture_list #RaisedMulti
;


motion_spec_list:
     top = raised_gesture_list DOT  #SingleMotionSpecDown
  |  top = raised_gesture_list CARROT #SingleMotionSpecUp
  | top = raised_gesture_list DOT rest = motion_spec_list #TowardsPrefixMotionSpec
  | top = raised_gesture_list CARROT rest = motion_spec_list #AwayPrefixMotionSpec
  | top = raised_gesture_list DOT rest = raised_gesture_list #EndAwayFromMotionSpec
  | top = raised_gesture_list CARROT rest = raised_gesture_list #EndTowardsMotionSpec
;

gesture:
    UNDERSCORE #Empty
  | number = NUMBER UNDERSCORE #TimeTaggedEmpty
  | syllable = SYLLABLE #Syllable
  | number = NUMBER syllable = SYLLABLE #TimeTaggedSyllable
  | LPAREN motion_spec = motion_spec_list RPAREN #DirectionSpec
;

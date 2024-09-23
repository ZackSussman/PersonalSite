lexer grammar MotorMusicLexer;

channels { WS_CHANNEL }

VOICE : ["].*?["];

WS: [ t]+ -> channel(WS_CHANNEL);
NL: ('rn' | 'r' | 'n') -> channel(WS_CHANNEL);

NUMBER : ('0'|[1-9][0-9]*)('.'[0-9]+)?;

IDENT : [a-z]+;

LCURLY : '{';
RCURLY : '}';
LPAREN : '(';
RPAREN : ')';
LANGLE : '<';
RANGLE : '>';
LSQBRACKET : '[';
RSQBRACKET : ']';
COMMA : ',';
EXCLAMATION : '!';
MID : '|';
UNDERSCORE : '_';
PLUS : '+';
As : 'A#' | 'Bb';
A : 'A';
B : 'B' | 'Cb';
Cs : 'C#' | 'Db';
C : 'C' | 'B#';
Ds : 'D#' | 'Eb';
D : 'D';
E : 'E' | 'Fb';
Fs : 'F#' | 'Gb';
F : 'F' | 'E#';
Gs : 'G#' | 'Ab';
G : 'G';


UNRECOGNIZED : . ;
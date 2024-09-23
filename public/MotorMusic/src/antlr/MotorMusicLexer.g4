lexer grammar MotorMusicLexer;

channels { WS_CHANNEL }

WS: [ t]+ -> channel(WS_CHANNEL);
NL: ('rn' | 'r' | 'n') -> channel(WS_CHANNEL);

NUMBER : ('0'|[1-9][0-9]*)('.'[0-9]+)?;

IDENT : [a-z]+;

VOICE : ["][.]*?["];

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
A : 'A';
As : 'As' | 'Bb';
B : 'B' | 'Cb';
C : 'C' | 'B#';
Cs : 'C#' | 'Db';
D : 'D';
Ds : 'D#' | 'Eb';
E : 'E' | 'Fb';
F : 'F' | 'E#';
Fs : 'F#' | 'Gb';
G : 'G';
Gs : 'G#' | 'Ab';


UNRECOGNIZED : . ;
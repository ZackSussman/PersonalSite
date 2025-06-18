lexer grammar MotorMusicLexer;

channels { WS_CHANNEL }

WS: ('\r\n'+ | '\r'+ | '\n'+ | [ \t]+) -> channel(WS_CHANNEL);

SYLLABLE : [qtplkjgfdszxcvbnmhrw]+[aeiuyo]*[qtplkjgfdszxcvbnmhrw]* | [aeiuyo]+[qtplkjgfdszxcvbnmhrw]*;

NUMBER : [0-9]+ | [0-9]+.[0-9]+ | '.'[0-9]+;

LCURLY : '{';
RCURLY : '}';
LPAREN : '(';
RPAREN : ')';
LANGLE : '<';
RANGLE : '>';
LSQBRACKET : '[';
RSQBRACKET : ']';
UNDERSCORE : '_';
DOT: '.';
CARROT : '^';

UNRECOGNIZED : .;

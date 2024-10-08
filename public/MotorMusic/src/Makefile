all: commands


commands:
	cd antlr;
	/Users/zacksussman/Library/Python/3.9/bin/antlr4 -Dlanguage=TypeScript ./MotorMusicParserPhase1.g4 ./MotorMusicLexerPhase1.g4 -o generated;
	/Users/zacksussman/Library/Python/3.9/bin/antlr4 -Dlanguage=TypeScript ./MotorMusicParserPhase2.g4 ./MotorMusicLexerPhase2.g4 -o generated;
	cd ../main;
	tsc;
	cd ..;
	npx webpack --config webpack.config.cjs;
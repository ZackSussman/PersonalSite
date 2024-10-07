all: commands


commands:
	cd antlr;
	/Users/zacksussman/Library/Python/3.9/bin/antlr4 -Dlanguage=TypeScript ./MotorMusicParserPhase1.g4 ./MotorMusicLexer.g4 -o generated;
	cd ../main;
	tsc;
	cd ..;
	npx webpack --config webpack.config.cjs;
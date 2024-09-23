/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import {CharStream, Token} from "antlr4"
import MotorMusicLexer from "../../antlr/generated/MotorMusicLexer"

function createLexer(input: String) {
    const chars = new CharStream(input.toString());
    const lexer = new MotorMusicLexer(chars);
    return lexer;
}

export function lex(input: String) : Token[] {
    return createLexer(input).getAllTokens()
}


import {CommonTokenStream, Parser, ErrorListener, DefaultErrorStrategy} from 'antlr4'
import MotorMusicParser from "../../antlr/generated/MotorMusicParser"

class ConsoleErrorListener extends ErrorListener<Token> {
    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        console.log("ERROR " + msg);
    }
}

function createParser(input) {
    const lexer = createLexer(input);
    return createParserFromLexer(lexer);
}
function createParserFromLexer(lexer) {
    const tokens = new CommonTokenStream(lexer);
    return new MotorMusicParser(tokens);
}

function parseTree(input) {
    const parser = createParser(input);
    return parser.compilationUnit();
}

export function parseTreeStr(input) {
    const lexer = createLexer(input);
    lexer.removeErrorListeners();
    lexer.addErrorListener(new ConsoleErrorListener());
    const parser = createParserFromLexer(lexer);
    parser.removeErrorListeners();
    parser.addErrorListener(new ConsoleErrorListener());
    const tree = parser.compilationUnit();
    return tree.toStringTree(parser.ruleNames, parser);
}
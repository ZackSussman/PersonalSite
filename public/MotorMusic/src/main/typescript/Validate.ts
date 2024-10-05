/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import {CharStream, Token} from "antlr4"
import MotorMusicLexer from "../../antlr/generated/MotorMusicLexer"

export function createLexer(input: string) {
    const chars = new CharStream(input);
    const lexer = new MotorMusicLexer(chars);
    return lexer;
}

export function lex(input: string) : Token[] {
    return createLexer(input).getAllTokens()
}


import {CommonTokenStream, ErrorListener} from 'antlr4'
import MotorMusicParser from "../../antlr/generated/MotorMusicParser"

class ConsoleErrorListener extends ErrorListener<Token> {
    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        console.log("ERROR " + msg);
    }
}


function createParserFromLexer(lexer) {
    const tokens = new CommonTokenStream(lexer);
    return new MotorMusicParser(tokens);
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

export class Error {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    message: string;
    constructor(startLine: number, endLine: number, startCol: number, endCol: number, message: string) {
        this.startLine = startLine;
        this.endLine = endLine;
        this.startCol = startCol;
        this.endCol = endCol;
        this.message = message;
    }
}

export class CollectorErrorListener extends ErrorListener<Token> {
    private errors : Error[] = []
    constructor(errors: Error[]) {
        super()
        this.errors = errors
    }
    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        var endColumn = column + 1;
        if (offendingSymbol._text !== null) {
            endColumn = column + offendingSymbol._text.length;
        }
        this.errors.push(new Error(line, line, column, endColumn, msg));
    }
}

import {MusicContext} from "../../antlr/generated/MotorMusicParser";
import {ParseTreeWalker} from "antlr4";
import {MotorMusicParserStaticAnalysisListener} from "./Statics";
export function validate(input : string) : Error[] {
    let errors : Error[] = []
    const lexer = createLexer(input);
    lexer.removeErrorListeners();
    lexer.addErrorListener(new ConsoleErrorListener());
    const parser = createParserFromLexer(lexer);
    parser.removeErrorListeners();
    parser.addErrorListener(new CollectorErrorListener(errors));
    const tree = parser.compilationUnit();
    let staticAnalysisListener = new MotorMusicParserStaticAnalysisListener();
    ParseTreeWalker.DEFAULT.walk(staticAnalysisListener, tree);
    errors = errors.concat(staticAnalysisListener.errors);
    return errors;
}
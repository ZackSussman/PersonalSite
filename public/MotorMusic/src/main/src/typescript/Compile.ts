/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />
import {CharStream, Token} from "antlr4"
import MotorMusicLexer from "../../../antlr/generated/MotorMusicLexer"

export function createLexer(input: string) {
    const chars = new CharStream(input);
    const lexer = new MotorMusicLexer(chars);
    return lexer;
}

export function lex(input: string) : Token[] {
    return createLexer(input).getAllTokens()
}


import {CommonTokenStream, ErrorListener} from 'antlr4'
import MotorMusicParser from "../../../antlr/generated/MotorMusicParser"

class ConsoleErrorListener extends ErrorListener<Token> {
    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        console.log("ERROR " + msg);
    }
}


function createParserFromLexer(lexer) {
    const tokens = new CommonTokenStream(lexer);
    return new MotorMusicParser(tokens);
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



type animationFunction = (elapsedTime : number) => AnimationInfo



function parse(input : string, errors : Error[]) {
    const lexer = createLexer(input);
    lexer.removeErrorListeners();
    lexer.addErrorListener(new ConsoleErrorListener());
    const parser = createParserFromLexer(lexer);
    parser.removeErrorListeners();
    parser.addErrorListener(new CollectorErrorListener(errors));
    return parser.compilationUnit();
}

//We can hink of compilation as the process which morphs the code into the user experience 
//this function is essentially the high level view of that entire process
import {ParseTreeWalker} from "antlr4";
import {MotorMusicParserStaticAnalysisListener} from "./ParserListeners/Statics";
import {AnimationListener, AnimationInfo} from "./ParserListeners/Animations";
import { ParenColoringListener } from "./ParserListeners/Coloring";
import {AudioGeneratorListener} from "./ParserListeners/AudioGeneratorListener";
import {audioStream} from "./audio/Audio";
import {range} from "./ParserListeners/ParserListenerUtils";
export function process(input : string, syllableLength : number) : 
    [Map<range, string>, animationFunction, audioStream , Error[]] 
    {
    let errors : Error[] = [];
    let tree = parse(input, errors)
    let staticAnalysisListener = new MotorMusicParserStaticAnalysisListener(input);
    ParseTreeWalker.DEFAULT.walk(staticAnalysisListener, tree);
    errors = errors.concat(staticAnalysisListener.errors);
    if (errors.length === 0) {
        let animationListener = new AnimationListener(syllableLength);
        ParseTreeWalker.DEFAULT.walk(animationListener, tree);
        function packageGetAnimationInfo(x : number) {
            return animationListener.getAnimationInfoForTime(x);
        }
 
        let audioGeneratorListener = new AudioGeneratorListener(syllableLength, animationListener.parensAccumData);
        ParseTreeWalker.DEFAULT.walk(audioGeneratorListener, tree);


        let colorMapBuilder = new ParenColoringListener();
        ParseTreeWalker.DEFAULT.walk(colorMapBuilder, tree);

        return [colorMapBuilder.buildColorMap(), packageGetAnimationInfo, audioGeneratorListener.audioStream, errors];
    }
    return [undefined, undefined, undefined, errors];
}

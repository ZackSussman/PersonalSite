/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import {createLexer} from './Validate'
import {CommonTokenStream, InputStream, Token, ErrorListener} from 'antlr4'
import ILineTokens = monaco.languages.ILineTokens;
import IToken = monaco.languages.IToken;

export class MotorMusicState implements monaco.languages.IState {

    //store a stack for every frame of either curly brackets or parenthesis, of which type of token it is
    //true is for parenthesis, false is for curly brackets
    bracketContextFrames : boolean[] = [];
    //we are working in mods, so we want 0 to correspond to the first level of depth!
    curlyDepth : number = -1; 
    parenthesisDepth : number = -1;
    bracketDepth : number = -1;


    clone(): monaco.languages.IState {
        let res = new MotorMusicState();
        res.bracketContextFrames = [...this.bracketContextFrames];
        res.curlyDepth = this.curlyDepth;
        res.parenthesisDepth = this.parenthesisDepth;
        res.bracketDepth = this.bracketDepth;
        return res;
    }

    equals(other: MotorMusicState): boolean {
        return (other.bracketContextFrames == this.bracketContextFrames
                    && other.curlyDepth == this.curlyDepth
                    && other.bracketDepth == this.bracketDepth
        );
    }

    toString() {
        return ("parendepth: " + this.parenthesisDepth.toString() + "\n" + 
                "curlydepth: " + this.curlyDepth.toString());
    }

}

export class MotorMusicTokensProvider implements monaco.languages.TokensProvider {
    getInitialState(): monaco.languages.IState {
        return new MotorMusicState();
    }

    tokenize(line: string, state: MotorMusicState): monaco.languages.ILineTokens {
        return tokensForLine(line, state);
    }
}

const EOF = -1;

class MotorMusicToken implements IToken {
    scopes: string;
    startIndex: number;

    constructor(ruleName: String, startIndex: number) {
        this.scopes = ruleName.toLowerCase() + ".MotorMusic";
        this.startIndex = startIndex;
    }
}

class MotorMusicLineTokens implements ILineTokens {
    endState: monaco.languages.IState;
    tokens: monaco.languages.IToken[];

    constructor(tokens: monaco.languages.IToken[], endState : monaco.languages.IState ) {
        this.endState = endState;
        this.tokens = tokens;
    }
}



const CONTEXT_SENSITIVE_TOKENS = [',', '|', '_'];


export function tokensForLine(input: string, state : MotorMusicState): monaco.languages.ILineTokens {
    console.log("state is: " + state.toString());
    let errorStartingPoints: number[] = [];

    class ErrorCollectorListener extends ErrorListener<Token> {
        syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
            errorStartingPoints.push(column)
        }
    }

    const lexer = createLexer(input);
    lexer.removeErrorListeners();
    let errorListener = new ErrorCollectorListener();
    lexer.addErrorListener(errorListener);
    let done = false;
    let myTokens: monaco.languages.IToken[] = [];
    do {
        let token = lexer.nextToken();

        //all opening bracket adjustments done before processing of the current token 
        if (token.text == "{") {
            state.curlyDepth += 1;
            state.bracketContextFrames.push(false);
        }
        else if (token.text == "(") {
            state.parenthesisDepth += 1;
            state.bracketContextFrames.push(true);
        }
        else if (token.text == "[") {
            state.bracketDepth += 1;
        }
 
 
        if (token == null || token.type == EOF) {
            done = true
        } else {
            var tokenTypeName;
            if (CONTEXT_SENSITIVE_TOKENS.includes(token.text) && state.bracketContextFrames.length > 0) {
                console.log(state.bracketContextFrames.at(-1));
                //parenthesis case
                if (state.bracketContextFrames.at(-1)) {
                    tokenTypeName = lexer.symbolicNames[token.type] + "p" +  (state.parenthesisDepth % 3).toString();
                }
                //curly case
                else {
                    tokenTypeName = lexer.symbolicNames[token.type] + (state.curlyDepth % 3).toString();
                }
            }
            else if (CONTEXT_SENSITIVE_TOKENS.includes(token.text)) {
                //all context sensitive tokens must reside within {}, or ()
                tokenTypeName = "unrecognized";
            }
            else if (token.text == "{" || token.text == "}") {
                tokenTypeName = lexer.symbolicNames[token.type] + (state.curlyDepth % 3).toString();
            }
            else if (token.text == "(" || token.text == ")") {
                tokenTypeName = lexer.symbolicNames[token.type] + (state.parenthesisDepth % 3).toString();
            }
            else if (token.text == "[" || token.text == "]") {
                tokenTypeName = lexer.symbolicNames[token.type] + (state.bracketDepth % 3).toString();
            }
            else {
                tokenTypeName = lexer.symbolicNames[token.type];
            }
            if (token.text == "}" && state.curlyDepth == -1) {
                tokenTypeName = "unrecognized";
            }
            if (token.text == ")" && state.parenthesisDepth == -1) {
                tokenTypeName = "unrecognized";
            }
            let myToken = new MotorMusicToken(tokenTypeName, token.column);
            myTokens.push(myToken);   
        }

        //process closing brace updates after processing of current token 
        if (token.text == "]") {
            state.bracketDepth -= 1;
        }
        else if (token.text == "}") {
            state.curlyDepth -= 1;
            if (state.bracketContextFrames.pop()) {
                throw new Error("mismatch frame popping for curly brace");
            }
        }
        else if (token.text == ")") {
            state.parenthesisDepth -= 1;
            if (!(state.bracketContextFrames.pop())) {
                throw new Error("mismatch frame popping for parenthesis");
            }
        }
    } while (!done);

    // Add all errors
    for (let e of errorStartingPoints) {
        myTokens.push(new MotorMusicToken("error.MotorMusic", e));
    }
    myTokens.sort((a, b) => (a.startIndex > b.startIndex) ? 1 : -1)

    return new MotorMusicLineTokens(myTokens, state);
}
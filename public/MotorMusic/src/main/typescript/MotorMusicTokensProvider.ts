
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import {createLexer} from './Validate'
import {CommonTokenStream, InputStream, Token, ErrorListener} from 'antlr4'
import MotorMusicLexer from "../../antlr/generated/MotorMusicLexer";
import ILineTokens = monaco.languages.ILineTokens;
import IToken = monaco.languages.IToken;


class MotorMusicVoiceState implements monaco.languages.IState {
     //store a stack for every frame of either curly brackets or parenthesis, of which type of token it is
    //true is for parenthesis, false is for curly brackets
    bracketContextFrames : boolean[] = [];
    //we are working in mods, so we want 0 to correspond to the first level of depth!
    curlyDepth : number = -1; 
    parenthesisDepth : number = -1;
    bracketDepth : number = -1;

   
    clone(): monaco.languages.IState {
        let res = new MotorMusicVoiceState();
        res.bracketContextFrames = [...this.bracketContextFrames];
        res.curlyDepth = this.curlyDepth;
        res.parenthesisDepth = this.parenthesisDepth;
        res.bracketDepth = this.bracketDepth;
        return res;
    }

    equals(other : MotorMusicVoiceState) {
        if (other.curlyDepth != this.curlyDepth 
                        ||
                other.parenthesisDepth != this.parenthesisDepth
                        ||
                other.bracketDepth != this.bracketDepth) 
            return false;
        
        if (other.bracketContextFrames.length != this.bracketContextFrames.length)
            return false;
    
        for (var i = 0; i < other.bracketContextFrames.length; i++) {
            if (other.bracketContextFrames[i] != this.bracketContextFrames[i])
                return false;
        }
        
        return true;
    }
}

export class MotorMusicState implements monaco.languages.IState {

    voiceStates : Map<string, MotorMusicVoiceState>;
    currentVoice : string
    clone(): monaco.languages.IState {
        let res = new MotorMusicState();
        res.voiceStates = new Map<string, MotorMusicVoiceState>();
        for (let [key, value] of this.voiceStates) {
            res.voiceStates.set(key, value.clone() as MotorMusicVoiceState);
        }
        res.currentVoice = this.currentVoice;
        return res;
    }

    equals(other: MotorMusicState): boolean {
        if (other.voiceStates.size != this.voiceStates.size)
            return false;
        for (let [key, value] of other.voiceStates) {
            if (!this.voiceStates.has(key) || this.voiceStates.get(key) != value) {
                return false;
            }
        }
        if (other.currentVoice != this.currentVoice)
            return false;
        return true;
    }

}

const METER_VOICE_TAG = "___METER___";

export class MotorMusicTokensProvider implements monaco.languages.TokensProvider {
    getInitialState(): monaco.languages.IState {
        let initialState = new MotorMusicState();
        initialState.voiceStates = new Map<string, MotorMusicVoiceState>();
        initialState.voiceStates.set(METER_VOICE_TAG, new MotorMusicVoiceState());
        initialState.currentVoice = METER_VOICE_TAG;
        return initialState;
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



const CONTEXT_SENSITIVE_TOKENS = ['|', '_'];


export function tokensForLine(input: string, state : MotorMusicState): monaco.languages.ILineTokens {
    let errorStartingPoints: number[] = [];
    class ErrorCollectorListener extends ErrorListener<Token> {
        syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
            errorStartingPoints.push(column)
        }
    }
    const lexer = createLexer(input);

    let done = false;
    
    let myTokens: monaco.languages.IToken[] = [];
    var prevToken = undefined;

    function processToken(token) {
        let voiceState = state.voiceStates.get(state.currentVoice);
         //all opening bracket adjustments done before processing of the current token 
         if (token.text == "{") {
            voiceState.curlyDepth += 1;
            voiceState.bracketContextFrames.push(false);
        }
        else if (token.text == "(") {
            voiceState.parenthesisDepth += 1;
            voiceState.bracketContextFrames.push(true);
        }
        else if (token.text == "[") {
            voiceState.bracketDepth += 1;
        }
 
        if (token == null || token.type == EOF) {
            return true;
        }
        else if (token.type == MotorMusicLexer.RANGLE) {
            myTokens.push(new MotorMusicToken(lexer.symbolicNames[token.type], token.column));
            return true;
        } else {
            var tokenTypeName;
            if (CONTEXT_SENSITIVE_TOKENS.includes(token.text) && voiceState.bracketContextFrames.length > 0) {
                //parenthesis case
                if (voiceState.bracketContextFrames.at(-1)) {
                    tokenTypeName = lexer.symbolicNames[token.type] + "p" +  (voiceState.parenthesisDepth % 3).toString();
                }
                //curly case
                else {
                    tokenTypeName = lexer.symbolicNames[token.type] + (voiceState.curlyDepth % 3).toString();
                }
            }
            else if (CONTEXT_SENSITIVE_TOKENS.includes(token.text)) {
                //all context sensitive tokens must reside within {}, or ()
                tokenTypeName = "unrecognized";
            }
            else if (token.text == "{" || token.text == "}") {
                tokenTypeName = lexer.symbolicNames[token.type] + (voiceState.curlyDepth % 3).toString();
            }
            else if (token.text == "(" || token.text == ")") {
                tokenTypeName = lexer.symbolicNames[token.type] + (voiceState.parenthesisDepth % 3).toString();
            }
            else if (token.text == "[" || token.text == "]") {
                tokenTypeName = lexer.symbolicNames[token.type] + (voiceState.bracketDepth % 3).toString();
            }
            else {
                tokenTypeName = lexer.symbolicNames[token.type];
            }
            if (token.text == "}" && voiceState.curlyDepth == -1) {
                tokenTypeName = "unrecognized";
            }
            if (token.text == ")" && voiceState.parenthesisDepth == -1) {
                tokenTypeName = "unrecognized";
            }
            let myToken = new MotorMusicToken(tokenTypeName, token.column);
          //console.log("we have: " + tokenTypeName);
            myTokens.push(myToken);   
            
        }
        //process closing brace updates after processing of current token 
        if (token.text == "]") {
            voiceState.bracketDepth -= 1;
        }
        else if (token.text == "}") {
            voiceState.curlyDepth -= 1;
            if (voiceState.bracketContextFrames.pop()) {
                throw new Error("mismatch frame popping for curly brace");
            }
        }
        else if (token.text == ")") {
            voiceState.parenthesisDepth -= 1;
            if (!(voiceState.bracketContextFrames.pop())) {
                throw new Error("mismatch frame popping for parenthesis");
            }
        }
        return false;
    }

    do {
    
        let token = lexer.nextToken();
        //processing that depends on previous two tokens
        if (prevToken != undefined && (token.type == MotorMusicLexer.LANGLE)) 
        {
            if (prevToken.type == MotorMusicLexer.VOICE) {
                processToken(token); //process initial <
                let innerTokenizationDone = false;
                state.currentVoice = prevToken.text;
                if (!state.voiceStates.has(prevToken.text)) {
                    state.voiceStates.set(prevToken.text, new MotorMusicVoiceState());
                }
                var innerToken;
                do {
                    innerToken = lexer.nextToken();
                    innerTokenizationDone = processToken(innerToken);
                }
                while (!innerTokenizationDone)
                if (innerToken.type == MotorMusicLexer.RANGLE) {
                    state.currentVoice = METER_VOICE_TAG;
                }
            }
            else {
                errorStartingPoints.push(prevToken.column);
            }
        }
        else {
            done = processToken(token);
            if (token != null && token.type == MotorMusicLexer.RANGLE) {
                errorStartingPoints.push(token.column);
            }
            prevToken = token;
        }
    } while (!done);
    // Add all errors
    for (let e of errorStartingPoints) {
        myTokens.push(new MotorMusicToken("error.MotorMusic", e));
    }
    myTokens.sort((a, b) => (a.startIndex > b.startIndex) ? 1 : -1)
    return new MotorMusicLineTokens(myTokens, state);
}

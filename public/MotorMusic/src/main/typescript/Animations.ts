
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserListener";
import { SyllableContext, EmptyContext, ConcatContext, ResolveContext} from "../../antlr/generated/MotorMusicParser";
import { TerminalNode } from "antlr4";

//in this file, [number, number, number, number] is a monaco Range (we don't have access to monaco from the TS unfortunately)


//braces is a generic name referring to potentially either brackets or parens
export class BracesAnimationInfo {
    openBraceRange : [number, number, number, number];
    closeBraceRange : [number, number, number, number];
    midRange : [number, number, number, number];
}

//walk the parse tree to create animations for the code colors as it is traversed
export class AnimationListener extends MotorMusicParserListener {

    timePerSyllable : number; //the amount of time per syllable, use this to update currentTime via incrementing for each syllable
    syllableRanges : [number, number, number, number][] //list of ranges in the same order as the syllables
   
    //map a syllable range to the set of braces contexts that it lies within
    bracketsInfo : Map <[number, number, number, number], BracesAnimationInfo[]>;
    parensInfo : Map <[number, number, number, number], BracesAnimationInfo[]>;

    //store the set of current braces that are in scope
    currentBracketsInScope : Set<ConcatContext>
    currentParensInScope : Set<ResolveContext>

    constructor(syllableLength : number) {
        super();
        this.timePerSyllable = syllableLength;
        this.syllableRanges = [];
        this.bracketsInfo = new Map();
        this.parensInfo = new Map();
        this.currentBracketsInScope = new Set();
        this.currentParensInScope = new Set();
    }

    terminalNodeToRange(n : TerminalNode) : [number, number, number, number] {
        return [n.symbol.line, n.symbol.column + 1, n.symbol.line, n.symbol.column + n.getText().length + 1];
    }

    exitSyllable = (ctx : SyllableContext) => {
        const thisSyllableRange : [number, number, number, number] =  [ctx.start.line, ctx.start.column + 1, ctx.stop.line, ctx.stop.column + ctx.IDENT().getText().length + 1];
        //update list of syllables
		this.syllableRanges.push(thisSyllableRange);
        const bracketInfosForThisSyllable = [];
        const parensInfosForThisSyllable = [];
        //update braces infos for this syllable 
        for (let bracketContext of this.currentBracketsInScope) {
            const info = new BracesAnimationInfo();
            info.openBraceRange = this.terminalNodeToRange(bracketContext.LCURLY());
            info.closeBraceRange = this.terminalNodeToRange(bracketContext.RCURLY());
            info.midRange = this.terminalNodeToRange(bracketContext.MID());
            bracketInfosForThisSyllable.push(info);
        }
        for (let parensContext of this.currentParensInScope) {
            const info = new BracesAnimationInfo();
            info.openBraceRange = this.terminalNodeToRange(parensContext.LPAREN());
            info.closeBraceRange = this.terminalNodeToRange(parensContext.RPAREN());
            info.midRange = this.terminalNodeToRange(parensContext.MID());
            parensInfosForThisSyllable.push(info);
        }
        this.bracketsInfo.set(thisSyllableRange, bracketInfosForThisSyllable);
        this.parensInfo.set(thisSyllableRange, parensInfosForThisSyllable);
    }

    //treat an underscore as a syllable (it is just an empty syllable)
    exitEmpty = (ctx : EmptyContext) => {
        this.syllableRanges.push([ctx.start.line, ctx.start.column + 1, ctx.stop.line, ctx.stop.column + 2]);//+2 = +1 + 1, the first 1 is initial shift, the second is correction factor
    }

    enterConcat = (ctx : ConcatContext) => {
        this.currentBracketsInScope.add(ctx);
    }

    exitConcat = (ctx : ConcatContext) => {
        this.currentBracketsInScope.delete(ctx);
    }

    enterResolve = (ctx : ResolveContext) => {
        this.currentParensInScope.add(ctx);
    }

    exitResolve = (ctx : ResolveContext) => {
        this.currentParensInScope.delete(ctx);
    }

    private elapsedTimeToSyllableIndex(elapsedTime) {
        return Math.floor(elapsedTime / this.timePerSyllable);
    }

    //given the elapsedTime, return the range for the current syllable
    public syllablesAnimationFunction(elapsedTime : number)  {
        let thisSyllableIndex = this.elapsedTimeToSyllableIndex(elapsedTime);
        if (thisSyllableIndex < this.syllableRanges.length) {
            return this.syllableRanges[thisSyllableIndex];
        }
        else {
            return undefined;
        }
    }


    //gven the elapsed time, return a list of BracesAnimationInfo, where the list
    //contains the info for each set of braces that are currently in scope
    public bracketsAnimationFunction(elapsedTime : number) 
    {
        let index = this.elapsedTimeToSyllableIndex(elapsedTime);
        if (index >= this.syllableRanges.length) {
            return [];
        }
        return this.bracketsInfo.get(this.syllableRanges[index]);
    }

    public parensAnimationFunction(elapsedTime : number) 
    {
        let index = this.elapsedTimeToSyllableIndex(elapsedTime);
        if (index >= this.syllableRanges.length) {
            return [];
        }
        return this.parensInfo.get(this.syllableRanges[index]);
    }

	
}
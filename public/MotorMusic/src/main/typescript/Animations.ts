
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserListener";
//                                      context for {|}  context for (|)
import { SyllableContext, EmptyContext, ConcatContext, ResolveContext} from "../../antlr/generated/MotorMusicParser";
import { TerminalNode } from "antlr4";

//NOTE: this whole file references the {} symbol with the term 'bracket', () with 'parens', and a generalized term to refer to either as brace

type range = [number, number, number, number];


//represents a location within a gesture, either represented as a towards | away from  OR as away from | towards
export class GestureLocation {
    leftSide : boolean //tells you whether or not the location is on the left or right of the | 
    amount : number //ranges from 0 to 1. Is the percent through the repective side of the gesture
    constructor(leftSide : boolean, amount : number) {
        this.leftSide = leftSide;
        this.amount = amount;
    }
}


//Stores all the info that is needed for the coloring of a particular set of braces
export class BracesAnimationInfo {
    openBraceRange : range;
    closeBraceRange : range;
    midRange : range;
    depth : number; //the depth taken with respect to its type of brace, should match that given by the motorMusicTokensProvider
    gestureLocation : GestureLocation //determines where we are within the braces, used by the js to decide the color intensity 
    constructor(openBraceRange : range , closeBraceRange : range , midRange : range, depth : number) {
        this.openBraceRange = openBraceRange;
        this.closeBraceRange = closeBraceRange;
        this.midRange = midRange;
        this.depth = depth;
    }
}

//the object stores the info that is needed by the JS to perform its animation
export class AnimationInfo {
    currentSyllable : range;
    //all sets of braces that the current scope lies within are stored between the following two fields
    bracketsInfo : BracesAnimationInfo[]; 
    parensInfo : BracesAnimationInfo[];
    constructor(cS : range, b : BracesAnimationInfo[], p : BracesAnimationInfo[]) {
        this.currentSyllable = cS;
        this.bracketsInfo = b;
        this.parensInfo = p;
    }
}
//walk the parse tree and conglomerate enough data to be able to efficiently construct an AnimationInfo object for a given elapsed time 
export class AnimationListener extends MotorMusicParserListener {

    timePerSyllable : number;
    orderedSyllableRanges : range[] //respects the order of syllables in the code - for each syllable, we store its range 
   
    //map a syllable range to the set of braces contexts that it lies within
    bracketsInfo : Map <range, BracesAnimationInfo[]>;
    parensInfo : Map <range, BracesAnimationInfo[]>;

    //store the set of current braces that are in scope
    currentBracketsInScope : ConcatContext[]
    currentParensInScope : ResolveContext[]

    //keep track of the depth of each brace type
    bracketsInScopeDepths : Map<ConcatContext, number>
    parensInScopeDepths : Map<ResolveContext, number>


    constructor(syllableLength : number) {
        super();
        this.timePerSyllable = syllableLength;
        this.orderedSyllableRanges = [];
        this.bracketsInfo = new Map();
        this.bracketsInScopeDepths = new Map();
        this.parensInfo = new Map();
        this.parensInScopeDepths = new Map();
        this.currentBracketsInScope = [];
        this.currentParensInScope = []; 
    }

    terminalNodeToRange(n : TerminalNode) : range {
        return [n.symbol.line, n.symbol.column + 1, n.symbol.line, n.symbol.column + n.getText().length + 1];
    }

    exitSyllable = (ctx : SyllableContext) => {
        const thisSyllableRange : range = this.terminalNodeToRange(ctx.IDENT());
        //update list of syllables
		this.orderedSyllableRanges.push(thisSyllableRange);
        const bracketInfosForThisSyllable = [];
        const parensInfosForThisSyllable = [];
        //update braces infos for this syllable 
        for (let bracketContext of this.currentBracketsInScope) {
            bracketInfosForThisSyllable.push(new BracesAnimationInfo(
                this.terminalNodeToRange(bracketContext.LCURLY()),
                this.terminalNodeToRange(bracketContext.RCURLY()),
                this.terminalNodeToRange(bracketContext.MID()),
                this.bracketsInScopeDepths.get(bracketContext)
            ));
        }
        for (let parensContext of this.currentParensInScope) {
            parensInfosForThisSyllable.push(new BracesAnimationInfo(
                this.terminalNodeToRange(parensContext.LPAREN()),
                this.terminalNodeToRange(parensContext.RPAREN()),
                this.terminalNodeToRange(parensContext.MID()),
                this.parensInScopeDepths.get(parensContext)));
        }
        this.bracketsInfo.set(thisSyllableRange, bracketInfosForThisSyllable);
        this.parensInfo.set(thisSyllableRange, parensInfosForThisSyllable);
    }

    //treat an underscore as a syllable (it is just an empty syllable)
    exitEmpty = (ctx : EmptyContext) => {
        this.orderedSyllableRanges.push(this.terminalNodeToRange(ctx.UNDERSCORE()));
    }

    enterConcat = (ctx : ConcatContext) => {
        this.currentBracketsInScope.push(ctx);
        this.bracketsInScopeDepths.set(ctx, this.currentBracketsInScope.length - 1);
    }

    exitConcat = (_ : ConcatContext) => {
        this.currentBracketsInScope.pop();
    }

    enterResolve = (ctx : ResolveContext) => {
        this.currentParensInScope.push(ctx);
        this.parensInScopeDepths.set(ctx, this.currentParensInScope.length - 1);
    }

    exitResolve = (_ : ResolveContext) => {
        this.currentParensInScope.pop();
    }


    private elapsedTimeToSyllableIndex(elapsedTime : number) {
        return Math.floor(elapsedTime / this.timePerSyllable);
    }


    public getAnimationInfoForTime(elapsedTime : number) : AnimationInfo {

        let thisSyllableIndex = this.elapsedTimeToSyllableIndex(elapsedTime);
        if  (thisSyllableIndex >= this.orderedSyllableRanges.length) {
            return undefined;
        }
        let currentSyllable = this.orderedSyllableRanges[thisSyllableIndex];
        let bracketsAnimationInfos = this.bracketsInfo.get(currentSyllable);
        let parensAnimationInfos = this.parensInfo.get(currentSyllable);
        return new AnimationInfo(currentSyllable, bracketsAnimationInfos, parensAnimationInfos);
    }
	
}
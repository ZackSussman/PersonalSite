
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserListener";
//                                      context for {|}  context for (|)
import { SyllableContext, EmptyContext, ConcatContext, ResolveContext} from "../../antlr/generated/MotorMusicParser";
import { TerminalNode } from "antlr4";

//NOTE: this whole file references the {} symbol with the term 'bracket', () with 'parens', and a generalized term to refer to either as brace

type range = [number, number, number, number];


//represents a location within a gesture, either represented as a towards | away from  OR as away from | towards
export class GestureLocation {
    //we would preferably use an enum for this but I'm not sure how that translates to JS
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
   
    //in the last phase, this is used to find our accuminfo to construct the gestureLocation
    //only one of these will ever actually be filled out
    cctx : ConcatContext;
    rctx : ResolveContext;

    constructor(openBraceRange : range , closeBraceRange : range , midRange : range, depth : number, cctx : ConcatContext, rctx : ResolveContext) {
        this.openBraceRange = openBraceRange;
        this.closeBraceRange = closeBraceRange;
        this.midRange = midRange;
        this.depth = depth;
        this.cctx = cctx;
        this.rctx = rctx;
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


//above the beleow line = classes forming sutff we will pass to the JS
//------------------------------------------------------------------ 
//below the above line = classes forming data we store here to help form the data above the line

//data we wish to accumulate for each brace during our parse tree
class BraceAccumData {
    depth : number 
    firstSyllableIndex : number //the index of the first syllable within this brace
    lastSyllableIndex : number //the index of the last syllable within this brace
    midIndex : number //the index of the first syllable after the | within this brace 
    constructor(depth : number, firstSyllableIndex : number) {
        this.depth = depth;
        this.firstSyllableIndex = firstSyllableIndex;
    }
}

enum BraceType {
    Bracket,
    Paren
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

    //keep track of the depths for each brace type
    bracketsAccumData : Map<ConcatContext, BraceAccumData>
    parensAccumData : Map<ResolveContext, BraceAccumData>

    //a stack to keep track of whether the most recent bracket context is a () or a {}
    bracketContextFrameTypeIndicators : BraceType[]


    constructor(syllableLength : number) {
        super();
        this.timePerSyllable = syllableLength;
        this.orderedSyllableRanges = [];
        this.bracketsInfo = new Map();
        this.bracketsAccumData= new Map();
        this.parensInfo = new Map();
        this.parensAccumData = new Map();
        this.currentBracketsInScope = [];
        this.currentParensInScope = []; 
        this.bracketContextFrameTypeIndicators = [];
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
                this.bracketsAccumData.get(bracketContext).depth,
                bracketContext, undefined
            ));
        }
        for (let parensContext of this.currentParensInScope) {
            parensInfosForThisSyllable.push(new BracesAnimationInfo(
                this.terminalNodeToRange(parensContext.LPAREN()),
                this.terminalNodeToRange(parensContext.RPAREN()),
                this.terminalNodeToRange(parensContext.MID()),
                this.parensAccumData.get(parensContext).depth,
                undefined,
                parensContext
            ));
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
        this.bracketsAccumData.set(ctx, new BraceAccumData(this.currentBracketsInScope.length - 1, this.orderedSyllableRanges.length));
        this.bracketContextFrameTypeIndicators.push(BraceType.Bracket);
    }

    exitConcat = (ctx : ConcatContext) => {
        let dataToUpdate = this.bracketsAccumData.get(ctx);
        dataToUpdate.lastSyllableIndex = this.orderedSyllableRanges.length - 1;
        this.currentBracketsInScope.pop();
        this.bracketContextFrameTypeIndicators.pop();
    }

    enterResolve = (ctx : ResolveContext) => {
        this.currentParensInScope.push(ctx);
        this.parensAccumData.set(ctx, new BraceAccumData(this.currentParensInScope.length - 1, this.orderedSyllableRanges.length));
        this.bracketContextFrameTypeIndicators.push(BraceType.Paren);
    }

    exitResolve = (ctx : ResolveContext) => {
        let dataToUpdate = this.parensAccumData.get(ctx);
        dataToUpdate.lastSyllableIndex = this.orderedSyllableRanges.length - 1;
        this.currentParensInScope.pop();
        this.bracketContextFrameTypeIndicators.pop();
    }

    visitTerminal = (t : TerminalNode) => {
        if (t.getText() == "|") {
            //find the most recent brace context and update the appropriate BraceAccumData
            switch (this.bracketContextFrameTypeIndicators.at(-1)) {
                case BraceType.Bracket:
                    this.bracketsAccumData.get(this.currentBracketsInScope.at(-1)).midIndex = this.orderedSyllableRanges.length;
                    break;
                case BraceType.Paren: 
                    this.parensAccumData.get(this.currentParensInScope.at(-1)).midIndex = this.orderedSyllableRanges.length;
                    break;
            }
        }
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

         //given the acc data, determine the location within the gesture of the brace
        function locationFromAccData(accData : BraceAccumData, this_ : AnimationListener ) {
            //Left sidie
            if (thisSyllableIndex < accData.midIndex) {
                let totalTimeOnLeftForBrace = (accData.midIndex - accData.firstSyllableIndex) * this_.timePerSyllable;
                let totalTimeSoFarWithinLeft = elapsedTime - (accData.firstSyllableIndex * this_.timePerSyllable);
                return new GestureLocation(true, totalTimeSoFarWithinLeft / totalTimeOnLeftForBrace );
            }
            //Right side
            else {
                let totalTimeOnRightForBrace = (accData.lastSyllableIndex - accData.midIndex + 1) * this_.timePerSyllable;
                let totalTimeSoFarOnRight = elapsedTime - (accData.midIndex * this_.timePerSyllable);
                return new GestureLocation(false, totalTimeSoFarOnRight / totalTimeOnRightForBrace);
            }
        }
    

        let bracketsAnimationInfos = this.bracketsInfo.get(currentSyllable);
        let parensAnimationInfos = this.parensInfo.get(currentSyllable);

        bracketsAnimationInfos.forEach(i => {
            i.gestureLocation = locationFromAccData(this.bracketsAccumData.get(i.cctx), this);
        })

        parensAnimationInfos.forEach(i => {
            i.gestureLocation = locationFromAccData(this.parensAccumData.get(i.rctx), this);
        })

        return new AnimationInfo(currentSyllable, bracketsAnimationInfos, parensAnimationInfos);
    }
	
}
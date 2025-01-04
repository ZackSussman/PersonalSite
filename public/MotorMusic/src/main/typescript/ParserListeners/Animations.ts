
/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../../antlr/generated/MotorMusicParserListener";
//                                      context for {|}  context for (|)
import { SyllableContext, EmptyContext, ConcatContext, ResolveContext, TimeTaggedEmptyContext, TimeTaggedSyllableContext} from "../../../antlr/generated/MotorMusicParser";
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
    currentSyllableRanges : range[]; //array of ranges to light up for the current syllable 
    //note we need it to be an array so we can potentially have information for a syllable as well as a number in front of it 
    currentSyllableLocation : number; //from 0 to 1, tells us how far along the syllable we are 
    //all sets of braces that the current scope lies within are stored between the following two fields
    bracketsInfo : BracesAnimationInfo[]; 
    parensInfo : BracesAnimationInfo[];
    constructor(syllableRanges : range[], csLoc : number, b : BracesAnimationInfo[], p : BracesAnimationInfo[]) {
        this.currentSyllableRanges = syllableRanges;
        this.currentSyllableLocation = csLoc;
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

//data for each syllable that we will accumulate in their order as we parse
class SyllableData {
    duration : number; //units of this are in pulses (so it's the number of pulses)
    syllable_range : range //where is the syllable in the code 
    number_range : range //range for the corresponding 
    constructor(d : number, r : range, nr : range) {
        this.duration = d;
        this.syllable_range = r;
        this.number_range = nr;
    }
};

enum BraceType {
    Bracket,
    Paren
}

//walk the parse tree and conglomerate enough data to be able to efficiently construct an AnimationInfo object for a given elapsed time 
export class AnimationListener extends MotorMusicParserListener {

    timePerPulse : number;
    orderedSyllableData : SyllableData[] //respects the order of syllables in the code - for each syllable, we store its range 
   
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


                //syllableLength is the amount of time in seconds per syllable
    constructor(syllableLength : number) {
        super();
        this.timePerPulse = syllableLength;
        this.orderedSyllableData = [];
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


    //every time we come across a syllable, we must instantiate the braces info for that syllable
    private updateBracesInfosForSyllableRange(syllableRange : range) {
        const bracketInfosForThisSyllable = [];
        const parensInfosForThisSyllable = [];
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
        this.bracketsInfo.set(syllableRange, bracketInfosForThisSyllable);
        this.parensInfo.set(syllableRange, parensInfosForThisSyllable);
    }

    //convert a token containing a number to an actual number
    private numberTokenToNumber(token : TerminalNode ) {
        let res = Number(token.getText());
        if (Number.isNaN(res)) {
            throw new Error("Bad tokenizer...accepted a number token which is not a number: " + token.getText());
        }
        return res;
    }

    exitSyllable = (ctx : SyllableContext) => {
        const thisSyllableRange : range = this.terminalNodeToRange(ctx.SYLLABLE());
        //update list of syllables
		this.orderedSyllableData.push(new SyllableData(1, thisSyllableRange, undefined));
        this.updateBracesInfosForSyllableRange(thisSyllableRange);
    }

    exitTimeTaggedSyllable = (ctx : TimeTaggedSyllableContext) => {
        const thisSyllableRange : range = this.terminalNodeToRange(ctx.SYLLABLE());
        const thisNumberRange : range = this.terminalNodeToRange(ctx.NUMBER());
        this.orderedSyllableData.push(new SyllableData(this.numberTokenToNumber(ctx.NUMBER()), thisSyllableRange, thisNumberRange));
        this.updateBracesInfosForSyllableRange(thisSyllableRange);
    }

    //treat an underscore as a syllable (it is just an empty syllable)
    exitEmpty = (ctx : EmptyContext) => {
        let range = this.terminalNodeToRange(ctx.UNDERSCORE());
        this.orderedSyllableData.push(new SyllableData(1, range, undefined));
        this.updateBracesInfosForSyllableRange(range);
    }

    exitTimeTaggedEmpty = (ctx : TimeTaggedEmptyContext) => {
        let range = this.terminalNodeToRange(ctx.UNDERSCORE());
        let numberRange = this.terminalNodeToRange(ctx.NUMBER());
        this.orderedSyllableData.push(new SyllableData(this.numberTokenToNumber(ctx.NUMBER()), range, numberRange));
        this.updateBracesInfosForSyllableRange(range);
    }


    enterConcat = (ctx : ConcatContext) => {
        this.currentBracketsInScope.push(ctx);
        this.bracketsAccumData.set(ctx, new BraceAccumData(this.currentBracketsInScope.length - 1, this.orderedSyllableData.length));
        this.bracketContextFrameTypeIndicators.push(BraceType.Bracket);
    }

    exitConcat = (ctx : ConcatContext) => {
        let dataToUpdate = this.bracketsAccumData.get(ctx);
        dataToUpdate.lastSyllableIndex = this.orderedSyllableData.length - 1;
        this.currentBracketsInScope.pop();
        this.bracketContextFrameTypeIndicators.pop();
    }

    enterResolve = (ctx : ResolveContext) => {
        this.currentParensInScope.push(ctx);
        this.parensAccumData.set(ctx, new BraceAccumData(this.currentParensInScope.length - 1, this.orderedSyllableData.length));
        this.bracketContextFrameTypeIndicators.push(BraceType.Paren);
    }

    exitResolve = (ctx : ResolveContext) => {
        let dataToUpdate = this.parensAccumData.get(ctx);
        dataToUpdate.lastSyllableIndex = this.orderedSyllableData.length - 1;
        this.currentParensInScope.pop();
        this.bracketContextFrameTypeIndicators.pop();
    }

    visitTerminal = (t : TerminalNode) => {
        if (t.getText() == "|") {
            //find the most recent brace context and update the appropriate BraceAccumData
            switch (this.bracketContextFrameTypeIndicators.at(-1)) {
                case BraceType.Bracket:
                    this.bracketsAccumData.get(this.currentBracketsInScope.at(-1)).midIndex = this.orderedSyllableData.length;
                    break;
                case BraceType.Paren: 
                    this.parensAccumData.get(this.currentParensInScope.at(-1)).midIndex = this.orderedSyllableData.length;
                    break;
            }
        }
    }


    //find the syllable we would be within during this elapsed time
    private elapsedTimeToSyllableIndex(elapsedTime : number) {
        let simulatedTimeToStartOfThisSyllable = 0;
        let currentSyllableIndex = 0;
        let timeForSyllable = (i : number) => this.timePerPulse * this.orderedSyllableData[i].duration;
        while (simulatedTimeToStartOfThisSyllable + timeForSyllable(currentSyllableIndex) < elapsedTime) {
            simulatedTimeToStartOfThisSyllable += timeForSyllable(currentSyllableIndex);
            currentSyllableIndex += 1;
            if (currentSyllableIndex >= this.orderedSyllableData.length) {
                return currentSyllableIndex;
            }
        }
        return currentSyllableIndex;
    }


    //find the total duration that a range of syllables will take up 
    //if we need to make this function more efficient, we can save a lot of work by storing an accumulated time array
    //and just taking the difference between entries, but for now this should be fine
    private syllableRangeToTimeLength(startSyllableIndex : number, numSyllablesInRange : number) {
        let timeLength = 0;
        for (let i = 0; i < numSyllablesInRange; i++) {
            let change = this.orderedSyllableData[i + startSyllableIndex].duration * this.timePerPulse;
            timeLength += change
        }
        return timeLength;
    }


    public getAnimationInfoForTime(elapsedTime : number) : AnimationInfo {

        let thisSyllableIndex = this.elapsedTimeToSyllableIndex(elapsedTime);
        if  (thisSyllableIndex >= this.orderedSyllableData.length) {
            return undefined;
        }
        let currentSyllable = this.orderedSyllableData[thisSyllableIndex];

        let currentTimeWithinThisSyllable = (elapsedTime - this.syllableRangeToTimeLength(0, thisSyllableIndex));
        let totalTimeForThisSyllable = (currentSyllable.duration * this.timePerPulse);
        let syllableLocation = currentTimeWithinThisSyllable / totalTimeForThisSyllable;

         //given the acc data, determine the location within the gesture of the brace
        function locationFromAccData(accData : BraceAccumData, this_ : AnimationListener ) {
            //Left sidie
            if (thisSyllableIndex < accData.midIndex) {
                let totalTimeOnLeftForBrace = this_.syllableRangeToTimeLength(accData.firstSyllableIndex, accData.midIndex - accData.firstSyllableIndex);
                let totalTimeSoFarWithinLeft = elapsedTime - this_.syllableRangeToTimeLength(0, accData.firstSyllableIndex);
                return new GestureLocation(true, totalTimeSoFarWithinLeft / totalTimeOnLeftForBrace );
            }
            //Right side
            else {
                let totalTimeOnRightForBrace = this_.syllableRangeToTimeLength(accData.midIndex, accData.lastSyllableIndex - accData.midIndex + 1);
                let totalTimeSoFarOnRight = elapsedTime - this_.syllableRangeToTimeLength(0, accData.midIndex);
                return new GestureLocation(false, totalTimeSoFarOnRight / totalTimeOnRightForBrace);
            }
        }
    

        let bracketsAnimationInfos = this.bracketsInfo.get(currentSyllable.syllable_range);
        let parensAnimationInfos = this.parensInfo.get(currentSyllable.syllable_range);

        bracketsAnimationInfos.forEach(i => {
            i.gestureLocation = locationFromAccData(this.bracketsAccumData.get(i.cctx), this);
        })

        parensAnimationInfos.forEach(i => {
            i.gestureLocation = locationFromAccData(this.parensAccumData.get(i.rctx), this);
        })

        let currentSyllableRanges = [currentSyllable.syllable_range];
        if (currentSyllable.number_range != undefined) {
            currentSyllableRanges.push(currentSyllable.number_range);
        }
        return new AnimationInfo(currentSyllableRanges, syllableLocation, bracketsAnimationInfos, parensAnimationInfos);
    }
	
}
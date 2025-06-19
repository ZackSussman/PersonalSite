
/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../../../antlr/generated/MotorMusicParserListener";
//                                      context for {|}  context for (|)
import { SyllableContext, EmptyContext, DirectionSpecContext, TimeTaggedEmptyContext, TimeTaggedSyllableContext, SingleMotionSpecUpContext, 
        SingleMotionSpecDownContext, TowardsPrefixMotionSpecContext, AwayPrefixMotionSpecContext, Motion_spec_listContext, EndAwayFromMotionSpecContext, EndTowardsMotionSpecContext
} from "../../../../antlr/generated/MotorMusicParser";
import { TerminalNode } from "antlr4";


type range = [number, number, number, number];


//represents a location within a direction specification
export class DirectionSpecLocation {
    section : number //tells you the index of which section of the direction specification
    amount : number //ranges from 0 to 1. Is the percent through the repective section of the gesture
    constructor(section : number, amount : number) {
        this.section = section;
        this.amount = amount;
    }
}


//Stores all the info that is needed for the coloring of a particular set of braces
export class DirectionSpecAnimationInfo {
    openParenRange : range;
    closeParenRange : range;
    directionIndicatorRanges : range[]; //the ranges of the up and down arrows
    depth : number; //the depth taken with respect to its type of brace, should match that given by the motorMusicTokensProvider
    currentLocation : DirectionSpecLocation //determines where we are within the direction specification, used by the js to decide the color intensity 
    startsWithTowards : boolean; //used to indicate whether the initial segment of direction staorts with towards or away from

    //in the last phase, this is used to find our accuminfo to construct the gestureLocation
    ctx : DirectionSpecContext;

    constructor(openParenRange : range , closeParenRange : range , directionIndicatorRanges : range[], depth : number, startsWithTowards : boolean, ctx : DirectionSpecContext) {
        this.openParenRange = openParenRange;
        this.closeParenRange = closeParenRange;
        this.directionIndicatorRanges = directionIndicatorRanges;
        this.startsWithTowards = startsWithTowards;
        this.depth = depth;
        this.ctx = ctx;
    }
}

//the object stores the info that is needed by the JS to perform its animation
export class AnimationInfo {
    currentSyllableRanges : range[]; //array of ranges to light up for the current syllable 
    //note we need it to be an array so we can potentially have information for a syllable as well as a number in front of it 
    currentSyllableLocation : number; //from 0 to 1, tells us how far along the syllable we are 
    //all sets of braces that the current scope lies within are stored between the following field
    parensInfo : DirectionSpecAnimationInfo[];
    constructor(syllableRanges : range[], csLoc : number, p : DirectionSpecAnimationInfo[]) {
        this.currentSyllableRanges = syllableRanges;
        this.currentSyllableLocation = csLoc;
        this.parensInfo = p;
    }
}


//above the beleow line = classes forming sutff we will pass to the JS
//------------------------------------------------------------------ 
//below the above line = classes forming data we store here to help form the data above the line

//data we wish to accumulate for each brace during our parse tree
//we use this data to compute the DirectionSpecLocation
export class BraceAccumData {
    depth : number 
    sectionStartIndices : number[] //the indices of the first syllable of each section of the brace (in ascending order). 
    //tacked onto the very end of it we will also save the index of the first syllable outside of the brace. This will be used to determine the length of the final section in a clean way. 
    startsWithTowards : boolean;
    constructor(depth : number, startsWithTowards : boolean) {
        this.depth = depth;
        this.sectionStartIndices = [];
        this.startsWithTowards = startsWithTowards;
    }

    toString() {
        return ("midIndices: " + this.sectionStartIndices + "\n lastSyllable: ");
    }
}

//data for each syllable that we will accumulate in their order as we parse
class SyllableData {
    duration : number; //units of this are in pulses (so it's the number of pulses)
    syllable_range : range //where is the syllable in the code 
    number_range : range //range for the corresponding number, may be undefined if the syllable does not have a number 
    constructor(d : number, r : range, nr : range) {
        this.duration = d;
        this.syllable_range = r;
        this.number_range = nr;
    }
};

/*
export enum BraceType {
    Bracket,
    Paren
}
*/

//walk the parse tree and conglomerate enough data to be able to efficiently construct an AnimationInfo object for a given elapsed time 
export class AnimationListener extends MotorMusicParserListener {

    timePerPulse : number;
    orderedSyllableData : SyllableData[] //respects the order of syllables in the code - for each syllable, we store its range 
   
    //map a syllable range to the set of direction specifications that it lies within
    parensInfo : Map <range, DirectionSpecAnimationInfo[]>;

    //store the set of current braces that are in scope
    currentParensInScope : DirectionSpecContext[];

    //keep track of the depths for each brace type
    parensAccumData : Map<DirectionSpecContext, BraceAccumData>;


    //syllableLength is the amount of time in seconds per syllable
    constructor(syllableLength : number) {
        super();
        this.timePerPulse = syllableLength;
        this.orderedSyllableData = [];
        this.parensInfo = new Map();
        this.parensInfo = new Map();
        this.parensAccumData = new Map();
        this.currentParensInScope = []; 
    }

    terminalNodeToRange(n : TerminalNode) : range {
        return [n.symbol.line, n.symbol.column + 1, n.symbol.line, n.symbol.column + n.getText().length + 1];
    }

    private getDirectionSymbolRangesFromDirectionSpecAnimationInfoContext(ctx : DirectionSpecContext) : range[] {
       let motionSpecListCtx : Motion_spec_listContext = ctx._motion_spec;
       function processMotionSpecListContext(this_ : AnimationListener, ctx : Motion_spec_listContext) : range[] {
            if (ctx instanceof SingleMotionSpecDownContext || ctx instanceof EndAwayFromMotionSpecContext ) {
               return [this_.terminalNodeToRange(ctx.DOT())];
            }
            else if (ctx instanceof SingleMotionSpecUpContext || ctx instanceof EndTowardsMotionSpecContext) {
                return [this_.terminalNodeToRange(ctx.CARROT())];
            }
            else if (ctx instanceof TowardsPrefixMotionSpecContext) {
                let res = processMotionSpecListContext(this_, ctx._rest); 
                res.push(this_.terminalNodeToRange(ctx.DOT()));
                return res;
            }
            else if (ctx instanceof AwayPrefixMotionSpecContext) {
                let res = processMotionSpecListContext(this_, ctx._rest);
                res.push(this_.terminalNodeToRange(ctx.CARROT()));
                return res;
            }
       }
       return processMotionSpecListContext(this, motionSpecListCtx);
    }


    //every time we come across a syllable, we must instantiate the braces info for that syllable
    private updateBracesInfosForSyllableRange(syllableRange : range) {
        const parensInfosForThisSyllable = [];
        for (let parensContext of this.currentParensInScope) {
            parensInfosForThisSyllable.push(new DirectionSpecAnimationInfo(
                this.terminalNodeToRange(parensContext.LPAREN()),
                this.terminalNodeToRange(parensContext.RPAREN()),
                this.getDirectionSymbolRangesFromDirectionSpecAnimationInfoContext(parensContext),
                this.parensAccumData.get(parensContext).depth,
                parensContext._motion_spec instanceof SingleMotionSpecDownContext
                                        ||
                parensContext._motion_spec instanceof TowardsPrefixMotionSpecContext
                                        || 
                parensContext._motion_spec instanceof EndAwayFromMotionSpecContext
                ,
                parensContext
            ));
        }
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
		this.orderedSyllableData.push(new SyllableData(1, thisSyllableRange, undefined)); //undefined because there is no time tag
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

    enterDirectionSpec = (ctx : DirectionSpecContext) => {
        let startsWithTowards : boolean = 
         ctx._motion_spec instanceof SingleMotionSpecDownContext
                                        ||
         ctx._motion_spec instanceof TowardsPrefixMotionSpecContext
                                        || 
         ctx._motion_spec instanceof EndAwayFromMotionSpecContext

        this.currentParensInScope.push(ctx);
        this.parensAccumData.set(ctx, new BraceAccumData(this.currentParensInScope.length - 1, startsWithTowards));
        this.parensAccumData.get(ctx).sectionStartIndices.push(this.orderedSyllableData.length);   
    }

    exitDirectionSpec = (ctx : DirectionSpecContext) => {
        let dataToUpdate = this.parensAccumData.get(ctx);
        dataToUpdate.sectionStartIndices.push(this.orderedSyllableData.length);
        this.currentParensInScope.pop();
    }

    visitTerminal = (t : TerminalNode) => {
        if (t.getText() == "." || t.getText() == "^") {
            //find the most recent brace context and update the appropriate BraceAccumData
            this.parensAccumData.get(this.currentParensInScope.at(-1)).sectionStartIndices.push(this.orderedSyllableData.length );        
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
            //section is the index of which section of the brace we are in 
            let sectionIndex = accData.sectionStartIndices.findLastIndex((n : number) => n <= thisSyllableIndex);
            if (sectionIndex < 0) {
                throw new Error("Invariant broken: syllable index does not lie within syllable start indices. Index is " + thisSyllableIndex + ", indices are " + accData.sectionStartIndices);
            }
            //now we must compute the amount through that section that we are 
            let totalTimeWithinThisSection = this_.syllableRangeToTimeLength(accData.sectionStartIndices[sectionIndex], accData.sectionStartIndices[sectionIndex + 1] - accData.sectionStartIndices[sectionIndex]);
            let totalTimeSoFarWithinThisSection = elapsedTime - this_.syllableRangeToTimeLength(0, accData.sectionStartIndices[sectionIndex]);
            
            return new DirectionSpecLocation(sectionIndex, totalTimeSoFarWithinThisSection/totalTimeWithinThisSection);
            
        }
    
        let parensAnimationInfos = this.parensInfo.get(currentSyllable.syllable_range);

        parensAnimationInfos.forEach(i => {
            i.currentLocation = locationFromAccData(this.parensAccumData.get(i.ctx), this);

        })

        let currentSyllableRanges = [currentSyllable.syllable_range];
        if (currentSyllable.number_range != undefined) {
            currentSyllableRanges.push(currentSyllable.number_range);
        }
        return new AnimationInfo(currentSyllableRanges, syllableLocation, parensAnimationInfos);
    }
	
}
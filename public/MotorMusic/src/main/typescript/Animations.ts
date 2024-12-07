
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserListener";
import { SyllableContext } from "../../antlr/generated/MotorMusicParser";



export class CreateSyllablesAnimationListener extends MotorMusicParserListener {

    
    timePerSyllable : number; //the amount of time per syllable, use this to update currentTime via incrementing for each syllable
    syllableIndex : number; //we will keep this updated as we traverse the parse tree
    syllableIndexToRangeMap : { [key: number]: [number, number, number, number]}; //effectively the function we are creating, a dictionary mapping syllable indices to their ranges

    constructor(syllableLength : number) {
        super();
        this.syllableIndex = 0; 
        this.timePerSyllable = syllableLength;
        this.syllableIndexToRangeMap = {};
    }

    exitSyllable = (ctx : SyllableContext) => {
		this.syllableIndexToRangeMap[this.syllableIndex] = [ctx.start.line, ctx.start.column + 1, ctx.stop.line, ctx.stop.column + ctx.IDENT().getText().length + 1];
        this.syllableIndex += 1;
    }

    public syllablesAnimationFunction(elapsedTime : number)  {
        let thisSyllableIndex = Math.floor(elapsedTime / this.timePerSyllable);
        if (thisSyllableIndex in this.syllableIndexToRangeMap) {
            return this.syllableIndexToRangeMap[thisSyllableIndex];
        }
        else {
            return undefined;
        }
    }
	
}
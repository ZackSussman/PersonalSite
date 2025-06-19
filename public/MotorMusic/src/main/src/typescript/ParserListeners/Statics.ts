
import {Error} from "../Compile";
import {ParserRuleContext} from "antlr4";
import MotorMusicParserListener from "../../../../antlr/generated/MotorMusicParserListener";
import { TimeTaggedSyllableContext } from "../../../../antlr/generated/MotorMusicParser";

//we have to check that the parse tree actually encompasses the entire code
export class MotorMusicParserStaticAnalysisListener extends MotorMusicParserListener {

    errors : Error[] = [];

	parsedText : string

	programText : string

    constructor(programText) {
        super();
        this.errors = [];
		this.parsedText = "";
		this.programText = programText
    }

	private addError(message : string, ctx : ParserRuleContext) {
		let error = new Error(ctx.start.line, ctx.stop.line, ctx.start.column + 1, ctx.stop.column + 1, message);
		if (!(this.errors.includes(error))) {
			this.errors.push(error);
		}
	}

	enterTimeTaggedSyllable = (ctx: TimeTaggedSyllableContext) => {
		let time = Number(ctx.NUMBER().getText());
		if (time == 0) {
			this.addError("Time scales must be non-zero", ctx);
		}
	}

	
}
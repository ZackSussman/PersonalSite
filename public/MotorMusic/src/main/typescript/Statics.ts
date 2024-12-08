
import {Error} from "./Compile";
import {ParserRuleContext} from "antlr4";
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserListener";

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

	
}
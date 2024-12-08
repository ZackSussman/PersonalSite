
import {Error} from "./Validate";
import {ParserRuleContext} from "antlr4";
import { NonEmptyProgramContext} from "../../antlr/generated/MotorMusicParser"; 
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


	exitNonEmptyProgram = (ctx : NonEmptyProgramContext) => {
		this.parsedText = ctx.getText();
		if (this.parsedText.replace(/\s+/g, '') != this.programText.replace(/\s+/g, '')) {
			var errorMessage = "failure to parse program: a subset of the code parsed, but the rest was left out";
			errorMessage += "the parsed code is: " + this.parsedText;
			this.addError(errorMessage, ctx);
		}
	}

	
}
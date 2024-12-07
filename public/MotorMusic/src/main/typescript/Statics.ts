
import {Error} from "./Validate";
import {ParserRuleContext} from "antlr4";
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserListener";

export class MotorMusicParserStaticAnalysisListener extends MotorMusicParserListener {

    errors : Error[] = [];

    constructor() {
        super();
        this.errors = [];
    }

	private addError(message : string, ctx : ParserRuleContext) {
		let error = new Error(ctx.start.line, ctx.stop.line, ctx.start.column + 1, ctx.stop.column + 1, message);
		if (!(this.errors.includes(error))) {
			this.errors.push(error);
		}
	}

	private formatCtxPosition(ctx : ParserRuleContext) : string {
		return ctx.start.line.toString() + "." + ctx.start.column.toString() + "-" + ctx.stop.line.toString() + "." + ctx.stop.column.toString();
	}

	
}
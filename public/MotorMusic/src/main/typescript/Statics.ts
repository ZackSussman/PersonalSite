
import {Error} from "./Validate";
import {ParserRuleContext} from "antlr4";
import {RepeatContext, Exp_listContext, ConcatContext, MultiExpContext, SingleExpContext} from "../../antlr/generated/MotorMusicParser";
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserListener";

export class MotorMusicParserStaticAnalysisListener extends MotorMusicParserListener {

    errors : Error[] 

    constructor() {
        super();
        this.errors = [];
    }

	private errorFromMessageAndCtx(message : string, ctx : ParserRuleContext) : Error {
		return new Error(ctx.start.line, ctx.stop.line, ctx.start.column + 1, ctx.stop.column + 1, message);
	}

	enterRepeat = (ctx : RepeatContext)  => {
		//repeat is an error if it is not part of a concat list 
		if (!(ctx.parentCtx instanceof Exp_listContext)) {
			this.errors.push(this.errorFromMessageAndCtx("Underscore repeat can only be used in a concat list.", ctx));
		}
	}

	enterConcat = (ctx : ConcatContext) => {
		let exp_list : Exp_listContext = ctx._concat;
		if (exp_list instanceof MultiExpContext) {
			let first_element = (exp_list as MultiExpContext)._top;
			if (first_element instanceof RepeatContext) {
				this.errors.push(this.errorFromMessageAndCtx("Underscore repeat requires a presceding expression to repeat.", first_element));
			}
		}
		else {
			let first_element = (exp_list as SingleExpContext)._top;
			if (first_element instanceof RepeatContext) {
				this.errors.push(this.errorFromMessageAndCtx("Underscore repeat requires a presceding expression to repeat.", first_element));
			}
		}
	}
	

	
}

import {Error} from "./Validate";
import {ParserRuleContext} from "antlr4";
import {Music_listContext, ConcatContext, MultiMusicContext, SingleMusicContext,
	 VoiceContext, TonicContext
} from "../../antlr/generated/MotorMusicParserPhase1";
import MotorMusicParserListener from "../../antlr/generated/MotorMusicParserPhase1Listener";


export class MotorMusicParserStaticAnalysisListener extends MotorMusicParserListener {

    errors : Error[] = [];

    constructor() {
        super();
        this.errors = [];
    }

	
	voicesInScope : VoiceContext[] = []
	currentTonicInScope? : TonicContext = undefined

	private addError(message : string, ctx : ParserRuleContext) {
		let error = new Error(ctx.start.line, ctx.stop.line, ctx.start.column + 1, ctx.stop.column + 1, message);
		if (!(this.errors.includes(error))) {
			this.errors.push(error);
		}
	}

	private formatCtxPosition(ctx : ParserRuleContext) : string {
		return ctx.start.line.toString() + "." + ctx.start.column.toString() + "-" + ctx.stop.line.toString() + "." + ctx.stop.column.toString();
	}


	/*

	enterTonic = (ctx : TonicContext) => {
		if (this.currentTonicInScope != undefined && this.currentTonicInScope != ctx) {
			this.addError("Conflicting tonics in scope: Tonic was already defined at " + this.formatCtxPosition(this.currentTonicInScope) + ".", ctx);
		}
	}

	enterVoice = (ctx : VoiceContext) => {
		if (!(this.voicesInScope.includes(ctx)) && this.voicesInScope.map(v => v._voice.text).includes(ctx._voice.text)) {
			console.log("we got here and...");
			this.addError("Declared voice " + (ctx._voice.text) + " was already in scope at this definition.", ctx);
		}
	}
	*/

	/*
	enterApp = (ctx : AppContext) => {
		if (ctx._action instanceof VoiceContext) {
			let voiceContext = ctx._action as VoiceContext;
			if (this.voicesInScope.map(v => v._voice.text).includes(voiceContext._voice.text)) {
				this.addError("Declared voice " + (voiceContext._voice.text) + " was already in scope at this definition.", voiceContext);
				return;
			}
			this.voicesInScope.push(voiceContext);
		}
		else if (ctx._action instanceof TonicContext) {
			let tonicContext = ctx._action as TonicContext;
			if (this.currentTonicInScope != undefined) {
				this.addError("Conflicting tonics in scope: Tonic was already defined at " + this.formatCtxPosition(this.currentTonicInScope) + ".", 
							tonicContext);
				return;
			}
			this.currentTonicInScope = tonicContext;
		}
	}
	exitApp = (ctx : AppContext) => {
		if (ctx._action instanceof VoiceContext) {
			this.voicesInScope.pop();
			//assert(popped_voice == voiceContext._voice.text);
		}
		else if (ctx._action instanceof TonicContext) {
			this.currentTonicInScope = undefined;
		}
	}
	*/
	

	
}
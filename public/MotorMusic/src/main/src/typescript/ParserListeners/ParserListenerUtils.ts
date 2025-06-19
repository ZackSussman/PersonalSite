

//defines common procedures used throughout various parser listeners 

import { TerminalNode } from "antlr4";
import {Motion_spec_listContext, EndAwayFromMotionSpecContext, SingleMotionSpecDownContext, EndTowardsMotionSpecContext, SingleMotionSpecUpContext, TowardsPrefixMotionSpecContext, AwayPrefixMotionSpecContext} from "../../../../antlr/generated/MotorMusicParser";

export type range = [number, number, number, number];

export function serializeRange(r : range) : string {
    return r[0].toString() + "|" + r[1].toString() + "|" + r[2].toString() +  "|" + r[3].toString();
}

export function terminalNodeToRange(n : TerminalNode) : range {
    return [n.symbol.line, n.symbol.column + 1, n.symbol.line, n.symbol.column + n.getText().length + 1];
}

export function getAllDirectionSpecifierRangesFromMotionSpecListContext(ctx : Motion_spec_listContext) : range[] {
    if (ctx instanceof SingleMotionSpecDownContext || ctx instanceof EndAwayFromMotionSpecContext ) {
       return [terminalNodeToRange(ctx.DOT())];
    }
    else if (ctx instanceof SingleMotionSpecUpContext || ctx instanceof EndTowardsMotionSpecContext) {
        return [terminalNodeToRange(ctx.CARROT())];
    }
    else if (ctx instanceof TowardsPrefixMotionSpecContext) {
        let res = getAllDirectionSpecifierRangesFromMotionSpecListContext(ctx._rest); 
        res.push(terminalNodeToRange(ctx.DOT()));
        return res;
    }
    else if (ctx instanceof AwayPrefixMotionSpecContext) {
        let res = getAllDirectionSpecifierRangesFromMotionSpecListContext(ctx._rest);
        res.push(terminalNodeToRange(ctx.CARROT()));
        return res;
    }
}
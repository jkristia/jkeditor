/// <reference path="../../typings/browser.d.ts" />

import {Context} from "./jk.Editor.context";
import {TextEditorLineInfo} from "./jk.Editor.data";
import {LinePiece} from './jk.Editor.lineSplit';
import {ITextSpan, IFormatter} from "./jk.Editor.interfaces";
import * as TS from "./jk.Editor.spans"

export class Formatter implements IFormatter {
	/**
	 * Append input to context.data
	 */
	public append(context:Context, input:string) {
		this.splitTextToLines(context, input);
	}
	public setLine(context:Context, line: TextEditorLineInfo, input: string): void {
		line.margin = [];
		line.spans.clear();
		line.pieces = LinePiece.split(input);

		this.parseMargin(context, line);
		this.parseLine(context, line);
		line.spans.buildString();
	}
	/**
	 * Seperate input string into individual lines.
	 * Lines are appended to context.data
	 * 
	 */
	private splitTextToLines(context:Context, input:string): void {
		let data = context.data;
		let lineno:number = 0;
		let start:number = data.count;

		while (start < input.length) {
			let eol = input.indexOf('\n', start);
			if (eol < 0)
				eol = input.length;
			let linetext = input.substr(start, eol - start);
			start = eol + 1;

			let info = new TextEditorLineInfo(lineno, linetext);
			context.data.append(info);
			this.parseMargin(context, info);
			this.parseLine(context, info);
			lineno++;
		}
	}
	private parseMargin(context: Context, info: TextEditorLineInfo): void {
		info.margin.push({
				text: (info.lineNo + 1).toString(),
				css: ["lineno "]
			})
	}
	private parseLine(context: Context, info: TextEditorLineInfo): void {

		let index = 0;
		while (index < info.pieces.length) {
			let piece = info.pieces[index++];
			let coll = info.spans; 
			let cur = coll.current;
			if (cur instanceof TS.TextSpanLineComment) {
				coll = cur.spans;
			}
			cur = coll.current;

			// line comment
			if (piece.text === "/") {
				let next = info.pieces[index];
				if (next && next.text === "/") {
					coll.add(new TS.TextSpanLineComment("//"));
					index++;
					continue;
				}
			}
			// space
			if (piece.text.charAt(0) === " ") {
				if (cur instanceof TS.TextSpanSpace) {
					cur.append(piece.text);
					continue;
				}
				coll.add(new TS.TextSpanSpace(piece.text));
				continue;
			}
			// tab
			if (piece.text.charAt(0) === "\t") {
				if (cur instanceof TS.TextSpanTab) {
					cur.append(piece.text);
					continue;
				}
				coll.add(new TS.TextSpanTab(piece.text));
				continue;
			}
			// keyword
			if (this.isKeyword(piece.text)) {
				coll.add(new TS.TextSpanKeyword(piece.text));
				continue;
			}
			if (cur instanceof TS.TextSpanPlain) {
				cur.append(piece.text);
				continue;
			}
			coll.add(new TS.TextSpanPlain(piece.text));
		}
	}

	_keywords:{ [key:string]:boolean };

	private isKeyword(token:string):boolean {
		if (!this._keywords) {
			this._keywords = {};
			this._keywords["private"] = true;
			this._keywords["public"] = true;
			this._keywords["import"] = true;
			this._keywords["from"] = true;
			this._keywords["export"] = true;
			this._keywords["new"] = true;
			this._keywords["static"] = true;
			this._keywords["class"] = true;
			let s = 'constructor';
			this._keywords[s] = true;
			this._keywords["interface"] = true;
			this._keywords["namespace"] = true;
			this._keywords["return"] = true;
			this._keywords["let"] = true;
			this._keywords["while"] = true;
			this._keywords["this"] = true;
			this._keywords["void"] = true;
			this._keywords["number"] = true;
			this._keywords["string"] = true;
			this._keywords["boolean"] = true;
			this._keywords["enum"] = true;
		}
		return this._keywords[token] === true;
	}
}

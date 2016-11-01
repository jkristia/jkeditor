import {ITextEditorLineInfo, ITextSpan, ITextEditorData} from "./jk.Editor.interfaces";
import {LinePiece} from "./jk.Editor.lineSplit";
import {TextSpanCollection} from "./jk.Editor.spans";

export class TextEditorLineInfo implements ITextEditorLineInfo {
	public lineNo:number;
	public pieces:LinePiece[];
	public spans: TextSpanCollection = new TextSpanCollection(null);
	public margin:ITextSpan[] = [];

	public getPieces(): LinePiece[] {
		return this.pieces;
	}
	constructor(lineno:number, linetext:string) {
		this.lineNo = lineno;
		this.pieces = LinePiece.split(linetext);
	}
}

export class TextEditorData implements ITextEditorData {

	_lines:ITextEditorLineInfo[] = [];

	public clear() {
		this._lines = [];
	}

	public get count():number {
		return this._lines.length;
	}

	public append(line:ITextEditorLineInfo): ITextEditorLineInfo {
		this._lines.push(line);
		return line;
	}

	public getLine(lineNo:number):ITextEditorLineInfo {
		if (lineNo < 0 || lineNo >= this._lines.length)
			return null;
		return this._lines[lineNo];
	}
}

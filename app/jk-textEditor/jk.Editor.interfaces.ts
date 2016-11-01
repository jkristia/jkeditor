import {Context} from "./jk.Editor.context";
import {TextSpanCollection} from "./jk.Editor.spans";
import {TextEditorLineInfo} from './jk.Editor.data';
import {LinePiece} from './jk.Editor.lineSplit';

export interface ITextEditorLineRender {
	setup(context:Context):void;
	lineHeight:number;
	renderMargin(lineDiv: HTMLElement, visibleLineNo:number, yOffset:number, info:ITextEditorLineInfo):HTMLElement;
	renderLine(lineDiv: HTMLElement, visibleLineNo:number, yOffset:number, info:ITextEditorLineInfo):HTMLElement;
}
export interface ITextEditorRender {
	setup(context:Context);
	refresh():void;
	renderLine(line: ITextEditorLineInfo): void;
}
export interface ITextSpan {
	css?:string[];
	text:string;
}
export interface ITextEditorLineInfo {
	lineNo:number;
	margin:ITextSpan[];
	spans:TextSpanCollection;
	getPieces(): LinePiece[];
}
export interface ITextEditorData {
	count:number;
	clear():void;
	append(line:ITextEditorLineInfo): ITextEditorLineInfo;
	getLine(lineNo:number):ITextEditorLineInfo;
}

export interface IFormatter {
	append(context:Context, multilineText:string);
	setLine(context:Context, line: ITextEditorLineInfo, input: string);
}

export interface ITextEditorInput {
	clear():void;
	set(multilineText:string):void;
}
export interface ITextEditorNavigation {
	curCol():number;
	curLine():number;
	reset();
	setup(context:Context);
}

export class EditorViews {
	cursor:JQuery;
}

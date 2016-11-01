import {ITextEditorRender} from "./jk.Editor.interfaces";
import {Context} from "./jk.Editor.context";

export interface ITextArea {

	editorArea:JQuery;
	contentArea:JQuery;
	marginArea:JQuery;
	render:ITextEditorRender;
	lineHeight:number;
	textWidth:number;
	firstVisibleLine:number;
	noOfVisibleLines:number;
	resize();
	setup();
	refresh();
	getTopOffset():number;
	setTopOffset(offset:number);
	scrollLineIntoView(lineNo: number): void;
}

export class TextArea {

	private _lineHeight:number = 16;
	private _textHeight:number = 13;
	private _textWidth:number = 0;
	private _noOfVisibleLines:number = 0;
	private _topOffset:number = 0;
	private _contentArea:JQuery;
	private _marginArea:JQuery;

	public get lineHeight():number {
		return this._lineHeight;
	}

	public get textWidth():number {
		return this._textWidth;
	}

	public get firstVisibleLine():number {
		let x = Math.floor(-this._topOffset / this._lineHeight);
		return x;
	}

	public get noOfVisibleLines():number {
		return this._noOfVisibleLines;
	}

	public get render():ITextEditorRender {
		return this._render;
	}

	public get editorArea():JQuery {
		return this._element;
	}

	public get contentArea():JQuery {
		return this._contentArea;
	}

	public get marginArea():JQuery {
		return this._marginArea;
	}

	constructor(private _context:Context,
	            private _element:JQuery,
	            private _render:ITextEditorRender) {
		this._contentArea = $(".content-area", this._element);
		this._marginArea = $(".margin-area", this._element);

		this._element.css("line-height", `${this._lineHeight}px`);
		this._element.css("font-size", `${this._textHeight}px`);
	}

	public refresh() {
		this.resize();
	}

	public setup() {
		this._render.setup(this._context);
		this._textWidth = this.calculateTextWidth();
	}

	public resize() {
		let h = this._element.height();
		this._noOfVisibleLines = Math.ceil(h / this._lineHeight);

		let viewHeight = this._context.data.count * this._lineHeight;
		this._contentArea.height(viewHeight);
		this._marginArea.height(viewHeight);
		this._render.refresh();
	}

	public getTopOffset():number {
		return this._topOffset;
	}

	public setTopOffset(offset:number) {
		// offset = 0 is first line, offset < 0 is scoll down
		if (offset > 0) {
			offset = 0;
		}
		// full scroll offset = view height - (visiblielines * lineheight)
		// using _visibleLines allow for scrolling so last line is at the bottom of the view.
		// using monNoOfVisible ensure the last line is n number of lines from the top
		let minNoOfVisibleLines = 5;
		let fullOffset = -(this._contentArea.height() - ( minNoOfVisibleLines * this._lineHeight));
		if (offset < fullOffset)
			offset = fullOffset;
		if (this._topOffset == offset)
			return;
		this._topOffset = offset;
		let translate = `translate3d(0px, ${this._topOffset}px, 0px)`;
		this._contentArea.css("transform", translate);
		this._marginArea.css("transform", translate);
		this._render.refresh();
	}

	private calculateTextWidth():number {

		let lineHeight:number = this.lineHeight;
		let textHeight:number = this._textHeight;

		let textMeasure = $('<span class="testArea" >');
		textMeasure.css("line-height", `${lineHeight}px`);
		textMeasure.css("font-size", `${textHeight}px`);
		textMeasure.text('.123456789.123456789.123456789.123456789.123456789');
		this.editorArea.append(textMeasure);

		let characterWidth = textMeasure.width() / textMeasure.text().length;
		console.log('character width = ' + characterWidth);
		textMeasure.remove();
		textMeasure = null;
		return characterWidth;
	}

	public scrollLineIntoView(lineNo: number): void {
		let linetoppos = lineNo * this.lineHeight;
		let lineBottomPos = (lineNo + 1) * this.lineHeight;
		let endOfView = this.editorArea.height() - this._topOffset;
		//console.log(`eov ${endOfView}, linebo ${lineBottomPos}, linetop ${linetoppos}, offset = ${this._topOffset} `);
		if (lineBottomPos > endOfView) {
			let diff = lineBottomPos - endOfView + (this.lineHeight / 2);
			let offset = this._topOffset - diff;
			this.setTopOffset(offset);
			return;
		}
		if (linetoppos < -this._topOffset) {
			this.setTopOffset(-linetoppos);
			return;

		}


	}
}

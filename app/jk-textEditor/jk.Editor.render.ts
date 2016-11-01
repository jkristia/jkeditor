import {ITextEditorLineRender, ITextEditorLineInfo, ITextEditorRender} from "./jk.Editor.interfaces";
import {Context} from "./jk.Editor.context";
import {CssUtil, Stopwatch} from "./jk.Editor.utils";

class HtmlElementCache {
	private _cache: { [key: number] : HTMLElement } = {};
	private _curSize: number = 0;
	constructor(private _parentElement: HTMLElement) {
	}
	public adjust(newSize : number): void {
		while (this._curSize > newSize) {
			this._curSize--;
			let element = this._cache[this._curSize];
			element.remove();
			this._cache[this._curSize] = undefined;
		}
		while (this._curSize < newSize) {
			let element = document.createElement("div");
			this._parentElement.appendChild(element);
			this._cache[this._curSize] = element;
			this._curSize++;
		}
	}
	public get(index: number): HTMLElement {
		return this._cache[index];
	}
}

export class TextEditorLineRender implements ITextEditorLineRender {
	private _context:Context;

	public get lineHeight():number {
		return this._context.textArea.lineHeight;
	}

	public setup(context:Context):void {
		this._context = context;
	}

	public renderLine(lineDiv: HTMLElement, visibleLineNo:number, yOffset:number, info:ITextEditorLineInfo): HTMLElement {
		let line: HTMLElement = lineDiv || document.createElement("div");
		if (lineDiv)
			lineDiv.innerHTML = "";
		line.className = "jk line";
		line.style.top = ((visibleLineNo * this.lineHeight) + yOffset).toString() + "px";
		if (!info || info.spans.getSpans().length === 0)
			return line;
		line.setAttribute("line-index", info.lineNo.toString());
		let fragment = document.createDocumentFragment();
		let spans = info.spans.getSpans();
		for (let textspan of spans) {
			let span = document.createElement("span");
			span.innerHTML = textspan.text;
			span.className="line-span " + textspan.css.join();
			fragment.appendChild(span);
		}
		line.appendChild(fragment);
		return line;
	}

	public renderMargin(lineDiv: HTMLElement, visibleLineNo:number, yOffset:number, info:ITextEditorLineInfo): HTMLElement {
		let line: HTMLElement = lineDiv || document.createElement("div");
		if (lineDiv)
			lineDiv.innerHTML = "";
		line.className = "jk margin";
		line.style.top = ((visibleLineNo * this.lineHeight) + yOffset).toString() + "px";
		if (!info || !info.margin[0])
			return line;
		line.setAttribute("line-index", info.lineNo.toString());
		let fragment = document.createDocumentFragment();
		for (let textspan of info.margin) {
			let span = document.createElement("span");
			span.className="line-no";
			span.innerText = textspan.text;
			fragment.appendChild(span);
		}
		line.appendChild(fragment);
		return line;
	}
}
export class TextEditorRender implements ITextEditorRender {
	private _lines: HtmlElementCache;
	private _margin: HtmlElementCache;

	constructor(private _context:Context,
	            private _lineRender:ITextEditorLineRender) {
	}
	public setup(context:Context):void {
		this._lineRender.setup(context);
		this._lines = new HtmlElementCache(this._context.textArea.contentArea[0]);
		this._margin = new HtmlElementCache(this._context.textArea.marginArea[0]);
	}
	public renderLine(line: ITextEditorLineInfo): void {
		let firstVisibleLine = this._context.textArea.firstVisibleLine;
		let index = line.lineNo - firstVisibleLine;
		if (index < 0 || !this._lines.get(index))
			return;
		let yOffset = firstVisibleLine * this._context.textArea.lineHeight;
		this._lineRender.renderMargin(this._margin.get(index), index, yOffset, line);
		this._lineRender.renderLine(this._lines.get(index), index, yOffset, line);
	}
	public refresh() {
		//let sw = new Stopwatch().start(); 
		this.render();
		//console.log(`render took ${sw.elapsed()} ms`);
	}
	protected render():void {
		if (!this._context || !this._context.textArea)
			return;
		let firstVisibleLine = this._context.textArea.firstVisibleLine;
		let yOffset = firstVisibleLine * this._context.textArea.lineHeight;
		let lines = this._context.textArea.noOfVisibleLines;
		this._lines.adjust(lines);
		this._margin.adjust(lines);

		for (let index = 0; index < lines; index++) {
			let curLineNo = firstVisibleLine + index;
			let curLine = this._context.data.getLine(curLineNo);
			if (curLine) {
				this._lineRender.renderMargin(this._margin.get(index), index, yOffset, curLine);
				this._lineRender.renderLine(this._lines.get(index), index, yOffset, curLine);
				continue;
			}
			this._lineRender.renderMargin(this._margin.get(index), index, yOffset, null);
			this._lineRender.renderLine(this._lines.get(index), index, yOffset, null);
		}
	}
}



export class TextSpan {
	protected _owner: TextSpan;
	protected _text: string;
	protected _css: string[] = [];
	public get css(): string[] {
		if (this._owner && this._owner._css)
			return this._owner._css; 
		if (this._css)
			return this._css;
		return [];
	}
	public get text(): string {
		return this._text;
	} 
	constructor(text: string = "") {
		this._text = text;
	}
	public buildString(startOffset: number): string {
		return this._text;
	}
	public setOwner(owner: TextSpan): void {
		this._owner = owner;
	} 
}
export class TextSpanPlain extends TextSpan {
	constructor(text: string) {
		super(text);
		this._css = ["linetext"];
	}
	public append(text: string) {
		this._text += text;
	}
}
export class TextSpanKeyword extends TextSpan {
	constructor(keyword: string) {
		super(keyword);
		this._css = ["keyword"];
	}
}
export class TextSpanSpace extends TextSpan {
	public get css(): string[] {
		return ["whitespace"];
	}
	constructor(spaces: string) {
		super(spaces.replace(' ', '·'));
		//this._css = ["whitespace"];
	}
	public append(spaces: string) {
		this._text += spaces.replace(' ', '·');
	}
}
export class TextSpanTab extends TextSpan {
	_count = 0;
	public get css(): string[] {
		return ["whitespace"];
	}
	constructor(spaces: string) {
		super("");
		//this._css = ["whitespace"];
		this._count = spaces.length;
	}
	public append(spaces: string) {
		this._count += spaces.length;
	}
	public buildString(startOffset: number): string {
		this._text = "";
		let tabchar = "→";
		//let tabchar = " ";
		for (let i = 0; i < this._count; i++) {

			let tabsize = 4;
			let remainder = (startOffset + tabsize) % tabsize;
			let length = tabsize - remainder;

			startOffset += length;
			switch (length) {
				case 1 : this._text += tabchar;
						break;
				case 2 : this._text += tabchar + " ";
						break;
				case 3 : this._text += tabchar + "  ";
						break;
				case 4 : this._text += tabchar + "   ";
						break;
			}
		}
		//this._text += "→&nbsp;&nbsp;&nbsp;";
		return this._text;
	}
}
export class TextSpanLineComment extends TextSpan {
	private _spans: TextSpanCollection = new TextSpanCollection(this);
	public get spans(): TextSpanCollection {
		return this._spans;
	}
	constructor(text: string) {
		super("");
		this._css = ['comment'];
		this._spans.add(new TextSpanPlain(text));
	}
	public buildString(startOffset: number): string {
		let result : string = this._text;
		result += this._spans.buildString(startOffset + result.length);
		return result;
	}
	 
}

export class TextSpanCollection {
	private _spans: TextSpan[] = [];
	private _dirty: boolean = true;
	private _text: string = "";
	private _owner: TextSpan = null;

	constructor(owner: TextSpan) {
		this._owner = owner;
	}
	public clear(): void {
		this._spans = [];
		this._dirty = true;
		this._text = "";
	}
	public add(span: TextSpan): TextSpanCollection {
		this._dirty = true;
		span.setOwner(this._owner);
		this._spans.push(span);
		return this;
	}
	public getSpans(offset: number = 0): TextSpan[] {
		let result: TextSpan[] = [];
		if (this._dirty) {
			let offset = 0;
			this._dirty = false;
			for (let span of this._spans) {
				offset += span.buildString(offset).length;
			}
		}
		for (let span of this._spans) {
			if (span instanceof TextSpanLineComment) {
				result.push(span);
				for (let subspan of span.spans.getSpans())
					result.push(subspan);
				continue;
			}
			result.push(span);
		}
		return result;
	}
	public get current(): TextSpan {
		if (this._spans.length)
			return this._spans[this._spans.length-1];
		return null;
	}
	public buildString(startOffset: number = 0): string {
		if (this._dirty || this._text.length === 0){
			this._dirty = false;
			this._text = "";
			for (let span of this._spans) {
				let offset = startOffset + this._text.length;
				this._text += span.buildString(offset);	
			}		  
		}
		return this._text;
	}
}

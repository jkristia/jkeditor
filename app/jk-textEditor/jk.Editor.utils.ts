export class CssUtil {
	public static top(element:JQuery, pos?:number):number {
		return CssUtil.numberCss(element, "top", pos);
	}

	public static left(element:JQuery, pos?:number):number {
		return CssUtil.numberCss(element, "left", pos);
	}

	private static numberCss(element:JQuery, attrName:string, value?:number):number {
		if (value === undefined || value === null) {
			let val = StringUtil.extractNumber(element.css(attrName));
			return val;
		}
		element.css(attrName, `${value}px`);
		return value;
	}
}
export class StringUtil {
	static extractNumber(input:string, startIndex:number = 0):number {
		if (!input || input.length == 0)
			return Number.NaN;
		let endIndex = startIndex;
		while (endIndex < input.length) {
			let ch = input.charCodeAt(endIndex++);
			if (ch >= 0x30 && ch <= 0x39)
				continue;
			break;
		}
		if (endIndex === startIndex)
			return Number.NaN;
		let s = input.substr(startIndex, endIndex - startIndex - 1);
		return Number(s);
	}
	static stringInsertAt(src: string, value: string, index: number) : string {
		let start: string = src.substr(0, index);
		let end: string = src.substr(index);
		return start + value + end;
	}
	static stringRemoveAt(src: string, index: number, count: number = 1): string {
		let start: string = src.substr(0, index);
		let end: string = src.substr(index + count);
		return start + end;
	}
}
export class Size {
	public width:number;
	public height:number;

	constructor(width?:number, height?:number) {
		this.width = width || 0;
		this.height = height || 0;
	}
}
export class Stopwatch {
	private _start: number = 0;
	private _stop: number = 0;
	private _isRunning: boolean = false;
	
	public start(): Stopwatch {
		this._start = Date.now();
		this._isRunning = true;
		return this;
	}
	public stop(): void {
		this._stop = Date.now();
		this._isRunning = false;
	}
	public elapsed(): number {
		let now = Date.now();
		if (this._isRunning)
			return now - this._start;
		return this._stop = this._start;
	}
}

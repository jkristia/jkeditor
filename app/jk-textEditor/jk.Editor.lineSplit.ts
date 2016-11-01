export class LinePiece {
	index: number = -1;
	text: string;
	start: number;
	end: number;
	isToken: boolean = false;
	expandedStart: number = 0;
	
	public get isSpace(): boolean {
		return this.text === ' ' || this.text === '\t';
	}
	public get endOfPiece(): number {
		return this.expandedStart + this.length;
	}
	/**
	 * returns the expanded length of the text. 
	 * If text is '\t' then tab size is returned, else length of text is returned
	 */
	public get length(): number {
		if (this.text === '\t') {
			// tab will align the start at 'tab' length, meaning the length of the tab
			// can vary from 1 - 4 characters
			let tabsize = 4;
			let remainder = (this.expandedStart + tabsize) % tabsize;
			let expandedEnd = (this.expandedStart + tabsize) - remainder;
			return expandedEnd - this.expandedStart;
		}
		return this.text.length;
	}
	/**
	 * Split a string into individual pieces. Each non-token character is returned as a single character pieces.
	 * Any consecutive token characters are returned as a single token string.
	 * @param input is the string to splot
	 * @return array of pieces
	 */
	public static split(input:string): LinePiece[] {
		if (!input)
			return [];
		let result : LinePiece[] = [];
		let map = LinePiece._tokenCharacters;
		let curToken: LinePiece;

		let index = 0;
		let expandedStart = 0;
		while (index < input.length) {
			let ch = input.charAt(index);
			if (ch === "\r" || ch === "\n")
				break;
			if (!curToken) {
				curToken = new LinePiece();
				curToken.text = "";
				curToken.start = index;
				curToken.end = index + 1;
				curToken.expandedStart = expandedStart;
			}
			if (map[ch]) {
				index++;
				curToken.end = index;
				curToken.isToken = true;
				continue;
			}
			curToken.text = input.substr(curToken.start, curToken.end - curToken.start);
			curToken.index = result.length;
			result.push(curToken);
			index = curToken.end;
			expandedStart += curToken.length;
			curToken = null;
		}
		if (curToken) {
			curToken.text = input.substr(curToken.start, curToken.end - curToken.start);
			curToken.index = result.length;
			result.push(curToken);
		}
		return result;
	}
	public static build(pieces: LinePiece[]): string {
		let result = "";
		for (let piece of pieces)
			result += piece.text;
		return result;
	}
	public static findPiece(pieces: LinePiece[], col: number): LinePiece {
		if (!pieces || !pieces[0])
			return null;
		for (let piece of pieces) {
			if (col >= piece.expandedStart && col < piece.expandedStart + piece.length)
				return piece;
		}
		return null;
	}
	private static _tokenCharacters: { [key: string] : string } = null;
	private static initializeTokenMap() {
		LinePiece._tokenCharacters = {};
		for (let ch = "0".charCodeAt(0); ch <= "9".charCodeAt(0); ch++) {
			LinePiece._tokenCharacters[String.fromCharCode(ch)] = String.fromCharCode(ch);	
		}
		for (let ch = "a".charCodeAt(0); ch <= "z".charCodeAt(0); ch++) {
			LinePiece._tokenCharacters[String.fromCharCode(ch)] = String.fromCharCode(ch);	
		}
		for (let ch = "A".charCodeAt(0); ch <= "Z".charCodeAt(0); ch++) {
			LinePiece._tokenCharacters[String.fromCharCode(ch)] = String.fromCharCode(ch);	
		}
	}
	public static init() {
		LinePiece.initializeTokenMap();
	}
}
// static initializing
LinePiece.init();

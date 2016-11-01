import {CssUtil} from "./jk.Editor.Utils";
import {ITextEditorNavigation, ITextEditorLineInfo, ITextSpan} from "./jk.Editor.interfaces";
import {Context} from "./jk.Editor.context";
import {LinePiece} from "./jk.Editor.linesplit";

export class LineNavigation {

	private _curCol: number = 0;
	private _pieces: LinePiece[] = [];
	constructor(private _line:ITextEditorLineInfo) {
		if (this._line)
			this._pieces = this._line.getPieces();
	}
	/**
	 * find start position of line, excluding leading spaces / tabs.
	 * If 'col' is pass the first token, then position of token is returned.
	 * If 'col' is <= first token, then beginning of line i returned
	 * If 'col' is 0 then position of first token is returned
	 * @param curCol, current cursor / caret position
	 * @returns {number} position for stat of line
	 */
	public findStartPos(col: number):number {
		if (this._pieces.length === 0)
			return 0;
		let piece = this._pieces[0];
		if (!piece.isSpace && piece.expandedStart === 0)
			return 0;
		let pos = this.nextTokenPosition(0, this._pieces);
		if (col === 0 || col > pos)
			return pos;
		return 0;
	}
	/**
	 * return position of end of line
	 * @return position
	 */
	public endOfLine():number {
		if (this._pieces.length === 0)
			return 0;
		let lastPiece = this._pieces[this._pieces.length-1];
		let lastToken = lastPiece;
		while (lastToken.isSpace && lastToken.index >= 0)
			lastToken = this._pieces[lastToken.index - 1];
		return lastToken.expandedStart + lastToken.length; 
	}
	/**
	 * finds the starting position of the first non-space token to the left of the current position
	 * @param col is current position
	 * @return new position
	 */
	public findPrevToken(col: number): number {
		this._curCol = col;
		return this.prevTokenPosition(col, this._pieces);
	}
	/**
	 * finds the end position of the first non-space token to the right of the current position
	 * @param col is current position
	 * @return new position
	 */
	public findNextToken(col: number): number {
		this._curCol = col;
		return this.nextTokenPosition(col, this._pieces);
	}
	/**
	 * Adjust current col to point to a valid piece, e.g. if the col is placed within a TAB space the 
	 * col is adjust to beginning or end of TAB space
	 */
	public adjustColPosition(col: number): number {
		let piece = this.currentPiece(col, this._pieces);
		if (!piece) {
			return 0; 
		}
		if (piece.isSpace)
			return piece.expandedStart;
		let end = piece.expandedStart + piece.length;
		if (col > end)
			return end;
		return col;
	}
	/**
	 * Move cur col one position to the right
	 * If the current selected piece is a tab or space, the pos is moved to the next piece.
	 * If at the end of the last piece, newCol is 0 and newLine is true 
	 */
	public moveRightColPosition(col: number): { newCol: number, newLine: boolean} {
		let result = {newCol : 0, newLine: false };
		let piece = this.currentPiece(col, this._pieces);
		if (!piece) {
			result.newLine = true;
			return result; 
		}
		let next = this._pieces[piece.index + 1];
		if (piece.isSpace && next) {
			result.newCol = next.expandedStart;
			return result;
		}
		let end = piece.endOfPiece; 
		if (col + 1 <= end) {
			result.newCol = col + 1;
			return result;
		}
		result.newLine = true;
		return result;
	}
	/**
	 * Move cur col one position to the left
	 * If at beggining of a piece, then 
	 * 		if previous piece is space or tab then beginning of the piece is returned
	 * 		if previous piece is string the endPos - 1 is returned
	 * 		if no previous is found then 'newline' is returned.  
	 */
	public moveLeftColPosition(col: number): { newCol: number, newLine: boolean } {
		let result = {newCol : 0, newLine: false };
		let piece = this.currentPiece(col, this._pieces);
		if (!piece) {
			result.newLine = true;
			return result; 
		}
		if (col > piece.expandedStart && col <= piece.endOfPiece) {
			result.newCol = col - 1;
			return result;
		}
		if (col === piece.expandedStart) {
			let prev: LinePiece = null;
			if (piece.index > 0)
				prev = this._pieces[piece.index-1]  
			if (prev && prev.isSpace) {
				result.newCol = prev.expandedStart;
				return result;
			}
			if (prev && col > prev.expandedStart) {
				result.newCol = col - 1;
				return result;
			}
		}
		result.newLine = true;
		return result;
	}

	/**
	 * Split a string into individual pieces. Each non-token character is returned as a single character pieces.
	 * Any consecutive token characters are returned as a single token string.
	 * @param input is the string to splot
	 * @return array of pieces
	 */
	private splitToPieces(input:string): LinePiece[] {
		return LinePiece.split(input);
	}
	/**
	 * find the line piece for the given col position
	 * @param col, the selected column
	 * @param pieces is the array of pieces to search
	 * @return found piece or last piece if col > last piece
	 */
	private currentPiece(col: number, pieces: LinePiece[]): LinePiece {
		if (!pieces || !pieces[0])
			return null;
		let piece = LinePiece.findPiece(pieces, col);
		if (piece)
			return piece;
		return pieces[pieces.length - 1];
	}
	/**
	 * returns starting col position of the previous non-space line piece
	 * @param col current position
	 * @param pieces array of line pieces
	 * @return new col position 
	 */
	private prevTokenPosition(col: number, pieces: LinePiece[]): number {
		let piece = this.currentPiece(col, pieces);
		if (!piece)
			return 0;
		// index of previous non-space piece
		let index = piece.index - 1;
		while (index >= 0) {
			piece = pieces[index];
			index--;
			if (piece.isSpace)
				continue;
			return piece.expandedStart;
		}
		return 0;
	}
	/**
	 * returns starting col position of the next non-space line piece.
	 * If position is in last piece, then end of the piece is returned
	 * @param col current position
	 * @param pieces array of line pieces
	 * @return new col position 
	 */
	private nextTokenPosition(col: number, pieces: LinePiece[]): number {
		let piece = this.currentPiece(col, pieces);
		if (!piece)
			return 0;
		// index of next non-space piece
		let index = piece.index + 1;
		while (index < pieces.length) {
			piece = pieces[index];
			index++;
			if (piece.isSpace)
				continue;
			return piece.expandedStart;
		}
		let lastPiece = pieces[pieces.length-1]; 
		return lastPiece.expandedStart + lastPiece.length;
	}
}

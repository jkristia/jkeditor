// this // is	the first //line
import {CssUtil, StringUtil} from "./jk.Editor.utils";
import {ITextEditorNavigation, ITextEditorLineInfo, ITextSpan} from "./jk.Editor.interfaces";
import {Context} from "./jk.Editor.context";
import {LineNavigation} from './jk.Editor.lineNavigation';
import {LinePiece} from './jk.Editor.lineSplit';

//23456789.123456789.123456789.
//	.	.    ....   ....    .
//		token1  	   token2


enum eKeyCode {
	pageUp = 33,
	pageDown = 34,
	end = 35,
	home = 36,
	left = 37,
	up = 38,
	right = 39,
	down = 40,
	del = 46,
}
class	thisIsIaTestee	{			}
//	1	22	333	4
class Offset {
	public top:number;
	public left:number;

	constructor() {
	}

	public set(value:JQueryCoordinates):Offset {
		this.top = value.top;
		this.left = value.left;
		return this;
	}

	public static getTopLeft(element:JQuery):Offset {
		let result = new Offset;
		result.left = CssUtil.left(element);
		result.top = CssUtil.top(element);
		return result;
	}
}
class Point {
	public x:number;
	public y:number;

	constructor() {
	}

	public set(x:number, y:number):Point {
		this.x = x;
		this.y = y;
		return this;
	}

	public subtract(value:Offset| Point):Point {
		if (value instanceof Offset) {
			this.x -= value.left;
			this.y -= value.top;
		}
		if (value instanceof Point) {
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	}
}

//								.123.        .12.			
export class TextEditorNavigation	implements	ITextEditorNavigation {
	private _context:Context;
	private _view:JQuery;
	private _topVisibleLine:number = 0
	private _curCol:number;
	private _curLine:number;
	private _desiredCol: number = 0;

	constructor() {
	}

	public reset() {
		this._topVisibleLine = 0;
		this._context.render.refresh();
	}

	private normalizedPosYToAbsoluteLineNo(point:Point):number {
		point.y += -this._context.textArea.getTopOffset();
		return Math.floor(point.y / this._context.textArea.lineHeight);
	}

	/**
	 * Calculates the y position in the view of the passed line number
	 * @param lineno
	 * @return the y pos relative to the view
	 */
	private absoluteLineNoToNormalizedPosY(lineno:number):number {
		let linePos = lineno * this._context.textArea.lineHeight;
		linePos -= -this._context.textArea.getTopOffset();
		return linePos;
	}

	public curLine():number {
		return this._curLine;
	}

	public curCol():number {
		return this._curCol;
	}

	public setup(context:Context):void {

		this._context = context;
		this._view = context.textArea.editorArea;

		this._view.bind("mousewheel", (event:JQueryEventObject) => {
			if (event.originalEvent) {
				this.onMouseWheel(<MouseWheelEvent>event.originalEvent);
			}
		});
		this._view.blur(() => {
			this.hideCursor();
		})

		this._view.on("swipe", (event: any) => {
			console.log(event);
			console.log(event);
		});
		this._view.on("touchstart", (event: any) => {
			console.log("touchstart");
			console.log(event);
		})
		this._view.on("touchend", (event: any) => {
			console.log("touchend");
			console.log(event);
		})
		this._view.on("touchmove", (event: any) => {
			console.log("touchmove");
			console.log(event);
		})
		// this._view.on("blur", (event: any) => {
		// 	console.log("blur");
		// })
		// this._view.on("focus", (event: any) => {
		// 	console.log("focus");
		// })

		this._view.mousedown((event:JQueryMouseEventObject) => {

			let point = new Point().set(event.clientX, event.clientY);
			// adjust for view offset, this does NOT include any padding
			let offset = new Offset().set(this._view.offset());
			// now mouse point is relative to the editor-area
			point.subtract(offset);
			// make mouse point relative to the content area
			offset = Offset.getTopLeft(this._context.textArea.contentArea);
			point.subtract(offset);
			//console.log(`normalized x,y pos = (${point.x}, ${point.y})`);
			// find the line from clicked point
			let lineNo = this.normalizedPosYToAbsoluteLineNo(point);
			console.log(`selected line = ${lineNo} at point (x,y) = (${point.x}, ${point.y})`);

			this._curLine = lineNo;
			let selcol = Math.round(point.x / this.getTextWidth());
			let line = this._context.data.getLine(lineNo);
			this._curCol = new LineNavigation(line).adjustColPosition(selcol);
			this._desiredCol = this._curCol; 
			console.log(`selcol = ${selcol}, col = ${this._curCol}`);
			this.showCursor(this._curLine, this._curCol);
		});
		this._view.keypress((event:JQueryEventObject) => {
			this.handleInput(event);
			console.log("keypress" + event.which);
			// console.log(event);
		});
		this._view.keydown((event:JQueryEventObject) => {
			console.log("keydown" + event.which);
			if (event.keyCode === eKeyCode.del) {
				this.handleInput(event);
				return;
			}
			if (event.keyCode === eKeyCode.right) {
				this.moveCursorRight(event);
			}
			if (event.keyCode === eKeyCode.left) {
				this.moveCursorLeft(event);
			}
			if (event.keyCode === eKeyCode.down) {
				if (event.ctrlKey)
					this.scrollViewUpDown(event, 1);
				else
					this.moveCursorUpDown(event, 1);
			}
			if (event.keyCode === eKeyCode.up) {
				if (event.ctrlKey)
					this.scrollViewUpDown(event, -1);
				else
					this.moveCursorUpDown(event, -1)
			}
			if (event.keyCode === eKeyCode.pageUp) {
				this.moveCursorUpDown(event, -(this._context.textArea.noOfVisibleLines - 2));
			}
			if (event.keyCode === eKeyCode.pageDown) {
				this.moveCursorUpDown(event, this._context.textArea.noOfVisibleLines - 2);
			}
			if (event.keyCode === eKeyCode.home) {
				if (event.ctrlKey)
					this.scrollViewHome(event);
				else
					this.moveBeginOfLine();
			}
			if (event.keyCode === eKeyCode.end) {
				if (event.ctrlKey)
					this.scrollViewEnd(event);
				else
					this.moveEndOfLine();
			}
		});
	}

	private getTextWidth():number {
		return this._context.textArea.textWidth;
	}

	/**
	 * Scroll view to first line, place cursor at beginning of line
	 */
	private scrollViewHome(event:JQueryEventObject) {
		this._curLine = 0;
		this.ensureVisible(this._curLine);
		this.showCursor(this._curLine, this.setDesiredCol(0));
	}
	
	/**
	 * Scroll view to last line, place cursor at beginning of line
	 */
	private scrollViewEnd(event:JQueryEventObject) {
		this._curLine = this._context.data.count;
		this.ensureVisible(this._curLine);
		this.showCursor(this._curLine, this.setDesiredCol(0));
	}
	
	/**
	 * scroll view lineOffset number of lines up or down.
	 * The cursor is frozen on the current line, but staus at the top / bottom one the current line scrolls out of view
	 */
	private scrollViewUpDown(event:JQueryEventObject, lineOffset: number){
		let first = this._context.textArea.firstVisibleLine + lineOffset; 
		let last = first + this._context.textArea.noOfVisibleLines - 2;

		this._context.textArea.setTopOffset(-(first * this._context.textArea.lineHeight));
		if (first > this._curLine)
			this._curLine = first;
		if (this._curLine >= last)
			this._curLine = last;
		
		this.showCursor(this._curLine, this.setDesiredCol(this._desiredCol));
	}

	/**
	 * move cursor (caret) up or down lineOffset number of lines.
	 * If line is outside visible view, then the line will scroll into view
	 * @param lineOffset, number of lines to move up ( < 0) or down ( > 0 )
	 */
	private moveCursorUpDown(event:JQueryEventObject, lineOffset: number){
		this.setCurLine(Math.max(0, this._curLine + lineOffset));
		// this._curLine = Math.max(0, this._curLine + lineOffset);
		// if (this._curLine < 0)
		// 	this._curLine = 0;
		// let max = this._context.data.count + 5;
		// if (this._curLine > max)
		// 	this._curLine = max;

		let data = this._context.data.getLine(this._curLine);
		let eol: number = new LineNavigation(data).endOfLine();
		this._curCol = this._desiredCol;
		if (this._curCol > eol)
			this._curCol = eol;

		this.ensureVisible(this._curLine);
		this.showCursor(this._curLine, this._curCol);
		// Edge / IE hack. Focus is lost when view is re-populated. look into this	
		setTimeout( () => {
			if (document.activeElement !== this._view[0]) 
				this._view.focus(); 
		}, 0);
	}
	/**
	 * Move caret to beginning of the line.
	 */
	private moveBeginOfLine() {
		let data = this._context.data.getLine(this._curLine);
		this._curCol = new LineNavigation(data).findStartPos(this._curCol);
		this.ensureVisible(this._curLine);
		this.showCursor(this._curLine, this.setDesiredCol(this._curCol));
	}
	/**
	 * Move caret to the end of the line
	 */
	private moveEndOfLine() {
		this._curCol = 0;
		let data = this._context.data.getLine(this._curLine);
		this._curCol = new LineNavigation(data).endOfLine();
		this.ensureVisible(this._curLine);
		this.showCursor(this._curLine, this.setDesiredCol(this._curCol));
	}

	/**
	 * Move caret left one position. If at the beginning of the line, then end of previous line is selected
	 */
	private moveCursorLeft(event:JQueryEventObject) {
		let data = this._context.data.getLine(this._curLine);
		if (event.ctrlKey) {
			this._curCol = new LineNavigation(data).findPrevToken(this._curCol); 
		}
		else {
			let result = new LineNavigation(data).moveLeftColPosition(this._curCol);
			this._curCol = result.newCol;
			if (result.newLine){
				this.setCurLine(this._curLine - 1);
				data = this._context.data.getLine(this._curLine);
				this._curCol = new LineNavigation(data).endOfLine();
			}
		}
		this.ensureVisible(this._curLine);
		this.showCursor(this._curLine, this.setDesiredCol(this._curCol));
	}
	/**
	 * Move caret right one position. If at the end of the line, then beginning of next line is selected
	 */
	private moveCursorRight(event: JQueryEventObject) {
		let data = this._context.data.getLine(this._curLine);
		if (event.ctrlKey) {
			this._curCol = new LineNavigation(data).findNextToken(this._curCol); 
		}
		else {
			let result = new LineNavigation(data).moveRightColPosition(this._curCol);
			this._curCol = result.newCol;
			if (result.newLine)
				this.setCurLine(this._curLine + 1);
		}
		this.ensureVisible(this._curLine);
		this.showCursor(this._curLine, this.setDesiredCol(this._curCol));
	}

	/**
	 * Set the current line and ensure the line is visible
	 */
	private setCurLine(line: number): void {
		this._curLine = line;
		if (this._curLine < 0)
			this._curLine = 0;
		let max = this._context.data.count + 5;
		if (this._curLine > max)
			this._curLine = max;
		this.ensureVisible(this._curLine);
	}
	
	/**
	 * Sets the column to the desired position if within the line length.
	 * If the desired position exceeds the text length. the col is set to the end of line
	 * with the desired position stored in _desitedCol
	 */
	private setDesiredCol(col: number): number {
		this._desiredCol = col;
		let data = this._context.data.getLine(this._curLine);
		let eol: number = new LineNavigation(data).endOfLine();
		this._curCol = this._desiredCol;
		if (this._curCol > eol)
			this._curCol = eol;
		return this._curCol;
	}

	_edgeHack: boolean = false;
	private onMouseWheel(e:MouseWheelEvent) {
		if (this._edgeHack)
			return;
		this._edgeHack = true;
		let delta = (e.wheelDelta / 120) * 50;
		// this is to allow Edge to redraw between mouse events - need to look into this
		setTimeout(() => {
			let top = this._context.textArea.getTopOffset() + delta;
			this._context.textArea.setTopOffset(top);
			this._edgeHack = false;
			this.showCursor(this._curLine, this._curCol);
		}, 0);
	}

	// private lineScroll(linecount: number) {
	// 	this._topVisibleLine -= linecount;
	// 	if (this._topVisibleLine < 0)
	// 		this._topVisibleLine = 0;
	//
	// 	let minNoOfVisibleLines = 5;
	// 	let maxTopLine = this._context.data.count - minNoOfVisibleLines;
	// 	if (this._topVisibleLine > maxTopLine)
	// 		this._topVisibleLine = maxTopLine;
	// 	//this._config.render.setTopVisibleLine(this._topVisibleLine);
	// }
	private hideCursor():void {
		//this._context.views.cursor.css("visibility", "hidden");
	}

	private showCursor(row:number, col:number) {
		let cursor = this._context.views.cursor;
		//CssUtil.top(cursor, this.absoluteLineNoToNormalizedPosY(row));
		CssUtil.top(cursor, this.absoluteLineNoToNormalizedPosY(row));

		let left = 60 + (col * this.getTextWidth()) - 2;
		//console.log(`col = ${col}, left = ${left - 60}`)
		CssUtil.left(cursor, left);
		cursor.height(this._context.textArea.lineHeight);
		cursor.css("visibility", "visible");

		this._context.debug.update();
	}
	/**
	 * Scoll lineno into view.
	 * @param lineno to scroll into view. 
	 */
	private ensureVisible(lineno: number): void {

		this._context.textArea.scrollLineIntoView(lineno);

		// let lineBottomPos = this.absoluteLineNoToNormalizedPosY(lineno);
		// let noofvis = this._context.textArea.noOfVisibleLines - 1;
		// let lineheight = this._context.textArea.lineHeight;
		// let maxheight = noofvis * lineheight;
		// console.log(`botpos = ${lineBottomPos}, max = ${maxheight}, vis = ${noofvis}`);


		// if (lineBottomPos >= maxheight) {
		// 	// scroll line to bottom of screen
		// 	let topline = lineno - noofvis;
		// 	let topoffset = this._context.textArea.getTopOffset();
		// 	let newoffset = -(topline * lineheight);
		// 	console.log(`${topoffset} -> ${newoffset}`)
		// 	this._context.textArea.setTopOffset(newoffset);
		// 	return;
			
		// }

	}

	private handleInput(event:JQueryEventObject): void {
		let col = this._curCol;
		let line: ITextEditorLineInfo = this._context.data.getLine(this._curLine);

		let diff: number = 0;
		let piece = LinePiece.findPiece(line.getPieces(), col);
		if (piece && piece.expandedStart > piece.start) {
			// adjust col to accomodate for tabs
			diff = (piece.expandedStart - piece.start);
		}

		let dest = LinePiece.build(line.getPieces());
		let input = String.fromCharCode(event.keyCode);
		let handled = false;
		let result: string = ""; 
		if (!handled && event.keyCode === eKeyCode.del) {
			handled = true;
			result = StringUtil.stringRemoveAt(dest, col - diff);

			this._context.formatter.setLine(this._context, line, result);
			this._context.render.renderLine(line);
			
		}
		if (!handled) {
			result = StringUtil.stringInsertAt(dest, input, col - diff);

			this._context.formatter.setLine(this._context, line, result);
			this._context.render.renderLine(line);
			this.setDesiredCol(col + input.length);
		}


		this.showCursor(this._curLine, this._curCol);
	}
}

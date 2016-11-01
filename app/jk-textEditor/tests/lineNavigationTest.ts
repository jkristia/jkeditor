import {LineNavigation} from '../jk.Editor.lineNavigation';
import {LinePiece} from '../jk.Editor.lineSplit';
import {ITextEditorLineInfo} from '../jk.Editor.interfaces';
import {TextEditorLineInfo} from '../jk.Editor.data';
import {expect} from './testBase';
import * as TS from '../jk.Editor.spans';
import * as UT from './testBase';

interface INav {
	splitToPieces(input: string): LinePiece[]
	currentPiece(col: number, pieces: LinePiece[]): LinePiece;
	prevTokenPosition(col: number, pieces: LinePiece[]): number;
	nextTokenPosition(col: number, pieces: LinePiece[]): number;
}
export class LineNavigationTests extends UT.BaseSuite {
	constructor() {
		super();
	}

	toInfo(input: string): ITextEditorLineInfo {
		return {
			lineNo: 0,
			margin: [],
			spans: new TS.TextSpanCollection(null).add(new TS.TextSpanPlain(input)),
			getPieces: () => { return LinePiece.split(input); }
		}
	}

	newNav(input: string): INav {
		let nav = new LineNavigation(this.toInfo(input));
		return <INav><any>nav;
	}

	setupTests() {
		this.setupNavigationTests();
	}

	setupNavigationTests() {
		let nav = this.newNav(null);
		this.it("verify currentPiece", () => {
			let split = nav.splitToPieces('abc def');
			let piece = nav.currentPiece(2, split);
			this.assert(piece.text).is("abc");
			this.assert(piece.index).is(0);

			piece = nav.currentPiece(3, split);
			this.assert(piece.text).is(" ");
			this.assert(piece.index).is(1);
			piece = nav.currentPiece(4, split);
			this.assert(piece.text).is("def");
			this.assert(piece.index).is(2);
			piece = nav.currentPiece(6, split);
			this.assert(piece.text).is("def");
			// return last piece
			piece = nav.currentPiece(77, split);
			this.assert(piece.text).is("def");

			// verify empty or null array returns null
			piece = nav.currentPiece(123, []);
			this.assert(piece).is(null);
			piece = nav.currentPiece(123, null);
			this.assert(piece).is(null);
		});
		this.it("verify currentPiece with TAB", () => {
			let split = nav.splitToPieces('abcd\tdef');
			this.assert(nav.currentPiece(2, split).text).is("abcd");
			this.assert(nav.currentPiece(4, split).text).is("\t");
			this.assert(nav.currentPiece(5, split).text).is("\t");
			this.assert(nav.currentPiece(6, split).text).is("\t");
			this.assert(nav.currentPiece(7, split).text).is("\t");
			this.assert(nav.currentPiece(8, split).text).is("def");
			this.assert(nav.currentPiece(10, split).text).is("def");
			this.assert(nav.currentPiece(11, split).index).is(2);
		});
		this.it("verify move left when at the beginning of a token", () => {
			let split = nav.splitToPieces(' abc : def.ghi');
			// beginning of 'def' should return position for ':'
			let newcol = nav.prevTokenPosition(7, split);
			this.assert(newcol).is(5);
			newcol = nav.prevTokenPosition(newcol, split);
			this.assert(newcol).is(1);
			newcol = nav.prevTokenPosition(newcol, split);
			this.assert(newcol).is(0);

			newcol = nav.prevTokenPosition(11, split);
			this.assert(newcol).is(10);
			newcol = nav.prevTokenPosition(newcol, split);
			this.assert(newcol).is(7);

			newcol = nav.prevTokenPosition(newcol, null);
			this.assert(newcol).is(0);

		});
		this.it("verify move right to begin of next token", () => {
			let split = nav.splitToPieces(' abc : def . ghi');
			// beginning of 'def' should return position for ':'
			let newcol = nav.nextTokenPosition(3, split);
			this.assert(newcol).is(5);
			newcol = nav.nextTokenPosition(newcol, split);
			this.assert(newcol).is(7);
			newcol = nav.nextTokenPosition(newcol, split);
			this.assert(newcol).is(11);
			newcol = nav.nextTokenPosition(newcol, split);
			this.assert(newcol).is(13);
			newcol = nav.nextTokenPosition(newcol, split);
			this.assert(newcol).is(16);
		});
		this.it("skip white spaces on nextToken", () => {
			let text = '\t\ttoken1    token2';
			let split = nav.splitToPieces(text);
			let newcol = nav.nextTokenPosition(0, split);
			this.assert(newcol).is(8);
			newcol = nav.nextTokenPosition(newcol, split);
			this.assert(newcol).is(18);
		});
		this.it("skip white spaces, using public findNextToken", () => {
			let text = '\t\ttoken1    token2';
			let info = new TextEditorLineInfo(0, text);
			let nav = new LineNavigation(info);
			let newcol = nav.findNextToken(0);
			this.assert(newcol).is(8);
			newcol = nav.findNextToken(newcol);
			this.assert(newcol).is(18);
		});
		this.it("move beginning of line", () => {
			let nav = <LineNavigation><any>this.newNav("  abc def ");
			this.assert(nav.findStartPos(7)).is(2);
			this.assert(nav.findStartPos(3)).is(2);
			this.assert(nav.findStartPos(2)).is(0);
		});
		this.it("move to first token when at beginning of line", () => {
			let nav = <LineNavigation><any>this.newNav("  abc def ");
			this.assert(nav.findStartPos(0)).is(2);
		});
		this.it("move beginning of line when line starts with token", () => {
			let nav = <LineNavigation><any>this.newNav("123 abc def ");
			this.assert(nav.findStartPos(4)).is(0);
			this.assert(nav.findStartPos(10)).is(0);
			this.assert(nav.findStartPos(0)).is(0);
		});
		this.it("move end of line", () => {
			let nav = <LineNavigation><any>this.newNav("  abc def . ");
			this.assert(nav.endOfLine()).is(11);
		});
		this.it("adjust column position", () => {
			let text = '\t\ttoken1  \t   token2';
//23456789.123456789.123456789.
//	.	.    .  .   .  .    .
//		token1  	   token2
			let nav = new LineNavigation(new TextEditorLineInfo(0, text));
			// \t
			this.assert(nav.adjustColPosition(0)).is(0);
			this.assert(nav.adjustColPosition(1)).is(0);
			this.assert(nav.adjustColPosition(2)).is(0);
			this.assert(nav.adjustColPosition(3)).is(0);
			// \t
			this.assert(nav.adjustColPosition(4)).is(4);
			this.assert(nav.adjustColPosition(5)).is(4);
			this.assert(nav.adjustColPosition(6)).is(4);
			this.assert(nav.adjustColPosition(7)).is(4);
			// token1
			for (let col = 8; col <= 13; col++)
				this.assert(nav.adjustColPosition(col)).is(col, "token1");
			//  space
			this.assert(nav.adjustColPosition(14)).is(14);
			this.assert(nav.adjustColPosition(15)).is(15);
			// \t
			this.assert(nav.adjustColPosition(16)).is(16);
			this.assert(nav.adjustColPosition(17)).is(16);
			this.assert(nav.adjustColPosition(18)).is(16);
			this.assert(nav.adjustColPosition(19)).is(16);
			//  space
			this.assert(nav.adjustColPosition(20)).is(20);
			this.assert(nav.adjustColPosition(21)).is(21);
			this.assert(nav.adjustColPosition(22)).is(22);
			// token2
			for (let col = 23; col <= 28; col++)
				this.assert(nav.adjustColPosition(col)).is(col, "token2");
			// beyond the end, return the end
			this.assert(nav.adjustColPosition(40)).is(29);
		});
		this.it("move cursor right (moveRightColPosition)", () => {
//23456789.123456789.123456789.
//	.	.    .  .   .  .    .
//		token1  	   token2
			let text = '\t\ttoken1  \t   token2';
			let nav = new LineNavigation(new TextEditorLineInfo(0, text));
			let result = nav.moveRightColPosition(0);
			this.assert(result.newCol).is(4);
			this.assert(result.newLine).is(false);

			result = nav.moveRightColPosition(result.newCol);
			this.assert(result.newCol).is(8);
			this.assert(result.newLine).is(false);

			// token1
			for (let col = 8; col <= 13; col++)
				this.assert(nav.moveRightColPosition(col).newCol).is(col + 1, "token1");
			// 2 spaces
			this.assert(nav.moveRightColPosition(14).newCol).is(15);
			this.assert(nav.moveRightColPosition(15).newCol).is(16);
			this.assert(nav.moveRightColPosition(16).newCol).is(20);
			this.assert(nav.moveRightColPosition(16).newLine).is(false);

			this.assert(nav.moveRightColPosition(22).newCol).is(23);
			// token2
			for (let col = 23; col <= 28; col++) {
				this.assert(nav.moveRightColPosition(col).newCol).is(col + 1, "token2");
				this.assert(nav.moveRightColPosition(col).newLine).is(false, "token2");
			}
			// return new line, end of line
			this.assert(nav.moveRightColPosition(28).newCol).is(29);
			this.assert(nav.moveRightColPosition(29).newCol).is(0);
			this.assert(nav.moveRightColPosition(29).newLine).is(true);

			this.assert(nav.moveRightColPosition(40).newCol).is(0);
			this.assert(nav.moveRightColPosition(40).newLine).is(true);
			
		});
		this.it("move cursor right on empty line (moveRightColPosition)", () => {
			let text = '';
			let nav = new LineNavigation(new TextEditorLineInfo(0, text));
			let result = nav.moveRightColPosition(0);
			this.assert(result.newCol).is(0);
			this.assert(result.newLine).is(true);
		});
		this.it("move cursor left (moveLeftColPosition)", () => {
//23456789.123456789.123456789.
//	.	.    .  .   .  .    .
//		token1  	   token2
			let text = '\t\ttoken1  \t   token2';
			let nav = new LineNavigation(new TextEditorLineInfo(0, text));
			let col = nav.endOfLine();
			this.assert(col).is(29);

			// token2
			let result = nav.moveLeftColPosition(col);
			this.assert(result.newCol).is(28);
			this.assert(result.newLine).is(false);
			while (result.newCol > 23) {
				let col = result.newCol;
				result = nav.moveLeftColPosition(col);
				this.assert(result.newCol).is(col -1);
			}
			result = nav.moveLeftColPosition(23);
			this.assert(result.newCol).is(22);
			result = nav.moveLeftColPosition(22);
			this.assert(result.newCol).is(21);
			result = nav.moveLeftColPosition(21);
			this.assert(result.newCol).is(20);
			// tab
			result = nav.moveLeftColPosition(20);
			this.assert(result.newCol).is(16);

			// token1
			result = nav.moveLeftColPosition(14);
			this.assert(result.newCol).is(13);
			result = nav.moveLeftColPosition(10);
			this.assert(result.newCol).is(9);

			// tab
			result = nav.moveLeftColPosition(8);
			this.assert(result.newCol).is(4);
			this.assert(result.newLine).is(false);
			result = nav.moveLeftColPosition(4);
			this.assert(result.newCol).is(0);
			this.assert(result.newLine).is(false);

			result = nav.moveLeftColPosition(0);
			this.assert(result.newCol).is(0);
			this.assert(result.newLine).is(true);
		});
	}
}
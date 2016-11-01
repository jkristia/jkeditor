import {LinePiece} from '../jk.Editor.lineSplit';
import {expect} from './testBase';
import * as UT from './testBase';

export class LineSplitTests extends UT.BaseSuite {
	constructor() {
		super();
	}

	setupTests() {
		this.setupSplitTests();
	}

	setupSplitTests() {
		this.it("split single comma", () => {
			this.assert(LinePiece.split('abc.def').length).is(3);
		});
		this.it("multiple split", () => {
			this.assert(LinePiece.split('.abc..def.').length).is(6);
		});
		this.it("tab and space split", () => {
			let arr = LinePiece.split('		jesper kristiansen');
			this.assert(arr.length).is(5);
			this.assert(arr[0].text).is('\t');
			this.assert(arr[0].isSpace).is(true);
			this.assert(arr[0].isToken).is(false);
			this.assert(arr[1].text).is('\t');
			this.assert(arr[2].text).is('jesper');
			this.assert(arr[2].isSpace).is(false);
			this.assert(arr[2].isToken).is(true);
			this.assert(arr[3].text).is(' ');
			this.assert(arr[3].isSpace).is(true);
			this.assert(arr[3].isToken).is(false);
			this.assert(arr[4].text).is('kristiansen');
		});
		this.it("check piece index", () => {
			let arr = LinePiece.split('		jesper kristiansen');
			this.assert(arr.length).is(5);
			this.assert(arr[0].index).is(0);
			this.assert(arr[1].index).is(1);
			this.assert(arr[2].index).is(2);
			this.assert(arr[3].index).is(3);
			this.assert(arr[4].index).is(4);
		})
		this.it("end of line split", () => {
			let arr = LinePiece.split('end of line split ');
			this.assert(arr.length).is(8);
			this.assert(arr[6].text).is('split');
			this.assert(arr[7].text).is(' ');
		});
		this.it("check isToken", () => {
			let arr = LinePiece.split(' a b cdef');
			this.assert(arr[0].isToken).is(false);
			this.assert(arr[1].isToken).is(true);
			this.assert(arr[2].isToken).is(false);
			this.assert(arr[3].isToken).is(true);
			this.assert(arr[4].isToken).is(false);
			this.assert(arr[5].isToken).is(true);
			this.assert(arr[5].text).is("cdef");
		});
		this.it("check tabsize", () => {
			let arr = LinePiece.split('\t\t');
			this.assert(arr.length).is(2);
			this.assert(arr[0].length).is(4);
			this.assert(arr[0].expandedStart).is(0);
			this.assert(arr[1].length).is(4);
			this.assert(arr[1].expandedStart).is(4);

			arr = LinePiece.split('\ta\tb');
			this.assert(arr.length).is(4);
			this.assert(arr[0].length).is(4);
			this.assert(arr[0].expandedStart).is(0);
			this.assert(arr[2].length).is(3);
			this.assert(arr[2].expandedStart).is(5);
			this.assert(arr[3].length).is(1);
			this.assert(arr[3].expandedStart).is(8);

			arr = LinePiece.split('\tabc\tb');
			this.assert(arr.length).is(4);
			this.assert(arr[0].length).is(4);
			this.assert(arr[0].expandedStart).is(0);
			this.assert(arr[2].length).is(1);
			this.assert(arr[2].expandedStart).is(7);
			this.assert(arr[3].length).is(1);
			this.assert(arr[3].expandedStart).is(8);

			arr = LinePiece.split('\tabcde\tb');
			this.assert(arr.length).is(4);
			this.assert(arr[0].length).is(4);
			this.assert(arr[0].expandedStart).is(0);
			this.assert(arr[2].length).is(3);
			this.assert(arr[2].expandedStart).is(9);
			this.assert(arr[3].length).is(1);
			this.assert(arr[3].expandedStart).is(12);

		});
		this.it("exclude \n and \r from pieces", () => {
			let arr = LinePiece.split('abc def ;\n\r');
			this.assert(arr.length).is(5);
			this.assert(arr[4].text).is(";");
			arr = LinePiece.split('abc def ;\r');
			this.assert(arr.length).is(5);
			this.assert(arr[4].text).is(";");
		});
		this.it("check quoted string", () => {
			let arr = LinePiece.split('abc "def" ');
			this.assert(arr.length).is(6);
			this.assert(arr[1].text).is(" ");
			this.assert(arr[2].text).is('"');
			this.assert(arr[3].text).is('def');
			this.assert(arr[4].text).is('"');
			this.assert(arr[5].text).is(' ');
		});
		this.it("check line comment string", () => {
			let arr = LinePiece.split('abc//"def" ');
			this.assert(arr.length).is(7);
			this.assert(arr[1].text).is("/");
			this.assert(arr[2].text).is("/");
			this.assert(arr[3].text).is('"');
			this.assert(arr[4].text).is('def');
			this.assert(arr[5].text).is('"');
			this.assert(arr[6].text).is(' ');
		});
		this.it("check split and build", () => {
			let text = "abc def  ";
			this.assert(LinePiece.build(LinePiece.split(text))).is(text);
			text = "\t  \t  abc def  \t";
			this.assert(LinePiece.build(LinePiece.split(text))).is(text);
			text = "\t\t        abc; ~!@#$%^&*()_+1234567890-=  \t";
			this.assert(LinePiece.build(LinePiece.split(text))).is(text);
		});
	}
}
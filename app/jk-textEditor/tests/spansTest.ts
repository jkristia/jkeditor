import {LinePiece} from '../jk.Editor.lineSplit';
import {expect} from './testBase';
import * as SP from '../jk.Editor.spans';
import * as UT from './testBase';

export class SpansTests extends UT.BaseSuite {
	constructor() {
		super();
	}

	setupTests() {
		this.setupSpansTests();
	}

	setupSpansTests() {
		this.it("verify add of plain span", () => {
			let spans = new SP.TextSpanCollection(null);
			expect(spans.getSpans().length).is(0);
			expect(spans.current).is(null);
			expect(spans.buildString()).is("");

			spans.add(new SP.TextSpanPlain("abc"))
			expect(spans.current instanceof SP.TextSpanPlain).is(true);
			let span = <SP.TextSpanPlain>spans.current;
			span.append(" ");
			span.append("def");
			expect(spans.buildString()).is("abc def");
		});
	}
}


import {BaseSuite} from './testBase';
import {LineNavigationTests} from './lineNavigationTest';
import {LineSplitTests} from './lineSplitTest';
import {SpansTests} from './spansTest';

export class TestRunner {
	private _suites: BaseSuite[] = [];
	constructor() {
		this._suites.push(new LineNavigationTests());
		this._suites.push(new LineSplitTests());
		this._suites.push(new SpansTests());
	}
	public runTests(): void {
		let count: number = 0;
		for (let suite of this._suites) {
			count += suite.runTests();
		}
		console.log(`ran ${count} tests`);
	}
}


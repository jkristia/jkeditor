import {Assertion, AssertionResult} from './assertion';

let suite: BaseSuite;
export var expect = (input: any) : Assertion  => {
	return suite.assert(input)
}

class TestInfo {
	description:string;
	cbFn:() => void;
}

type TestNode = TestInfo | BaseSuite;

export class BaseSuite {
	private _tests:TestNode[] = [];
	private _curTest: TestInfo;
	private _assertions: AssertionResult[];

	constructor() {
		this.setupTests();
	}

	public assert(input:any):Assertion {
		return new Assertion(input, this._assertions);
	}

	public runTests(): number {
		let count = 0;
		suite = this;
		for (let test of this._tests) {
			if (test instanceof BaseSuite) {
				test.runTests();
				continue;
			}
			if (test instanceof TestInfo) {
				this._curTest = test;
				this._assertions = [];
				test.cbFn.call(this);
				this.reportTestResult(test, this._assertions);
				count++;
			}
		}
		return count;
	}

	protected reportTestResult(test: TestInfo, assertions: AssertionResult[]) {
		let success: number = 0;
		let failure: number = 0;
		for (let assertion of assertions) {
			if (assertion.success)
				success++;
			else
				failure++;
		}
		if (failure > 0) {
			let text = `Test '${test.description}', success = ${success}, failure = ${failure}`;
			for (let assertion of assertions) {
				if (assertion.success)
					continue;
				text += "\n\t" + assertion.error;
			}
			console.log(text);
		}
	}
	protected setupTests() {
	};

	protected it(description:string, cbFn:() => void) {
		let test = new TestInfo();
		test.description = description;
		test.cbFn = cbFn;
		this._tests.push(test);
	}
}

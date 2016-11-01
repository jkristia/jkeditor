
export class AssertionResult {
	public success: boolean;
	public error: string;

}
export class Assertion {
	constructor(private _input:any, private _results: AssertionResult[]) {
	}

	public is(expected:any, reportOnError?: string): void {

		let result = null;
		if (Array.isArray(this._input) && Array.isArray(expected)) {
			result = this.compareArray(this._input, expected);
			if (reportOnError)
				result.error += ", " + reportOnError;
			this._results.push(result);
			return; 
		}

		result = new AssertionResult;
		result.success = (this._input === expected);
		if (!result.success) {
			result.error = `expected '${this.toString(expected)}', got '${this.toString(this._input)}'`; 
			if (reportOnError)
				result.error += ", " + reportOnError;
		}
		this._results.push(result); 
		// if (this._input === expected)
		// 	return;
		// let error = `expected '${this.toString(expected)}', got '${this.toString(this._input)}'.\n\r${this._description} `;
		// if (reportOnError)
		// 	error += ", " + reportOnError;
		// console.error(error);
	}

	private compareArray(a: any[], b: any[]): AssertionResult {
		let result = new AssertionResult;
		result.success = (a === b);
		// need to do deep compare
		if (!result.success)
			this.buildError(a, b, result)
		return result;
	}
	private buildError(got: any, expected: any, result: AssertionResult): void {
		result.error = `expected '${this.toString(expected)}', got '${this.toString(got)}'`; 
		// if (reportOnError)
		// 	result.error += ", " + reportOnError;
	} 

	private toString(input:any):string {
		if (input === null)
			return '<null>';
		if (input === undefined)
			return '<undefined>';
		return input.toString();
	}
}


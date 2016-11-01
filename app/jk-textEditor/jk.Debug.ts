import {Context} from "./jk.Editor.context";
/**
 * Created by Jesper on 6/15/2016.
 */

export interface IDebug {
	update();
}

export class Debug {
	private _element:JQuery;

	constructor(private _context:Context) {
		this._element = $("<div class='jk debug'>test</div>");
		this._context.textArea.editorArea.parent().append(this._element);
	}

	public update() {
		let line = this._context.navigation.curLine();
		let col = this._context.navigation.curCol();
		let debug = `Ln ${line}, Col ${col}`;
		this._element.text(debug);
	}

}

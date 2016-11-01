import {Context} from "./jk.Editor.context";

/**
 * DataSource exposes the underlaying input to the parent component
 */
export class TextDatasource {
	public context:Context;

	public clear():void {
		this.context.input.clear();
		if (this.context.navigation)
			this.context.navigation.reset();
	}

	public set(multilineText:string):void {
		this.context.input.set(multilineText);
	}
} 

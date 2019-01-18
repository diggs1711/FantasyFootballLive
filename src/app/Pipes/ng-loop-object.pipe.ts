import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'ngLoopObject'
})
export class NgLoopObjectPipe implements PipeTransform {
	transform(value: any, args: any[] = null): any {
		return Object.keys(value);
	}
}

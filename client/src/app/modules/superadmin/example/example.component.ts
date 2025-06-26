import { Component, ViewEncapsulation } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    imports: [
        TranslocoModule
    ],
    encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';

@Component({
    selector: 'example',
    standalone: true,
    templateUrl: './dashboard.component.html',
    imports: [TranslocoModule],
    encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
    /**
     * Constructor
     */
    constructor(
        private titleService: BreadcrumbService,
        private translocoService: TranslocoService
    ) {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.platform'),
                url: '/dashboard',
            },
            {
                label: this.translocoService.translate(
                    'navigation.dashboard'
                ),
                url: '',
            },
        ]);
    }

    ngOnInit(): void {}
}

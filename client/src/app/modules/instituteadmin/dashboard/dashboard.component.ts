import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { OrganizationChartModule } from 'primeng/organizationchart';

@Component({
    selector: 'app-dashboard',
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        TranslocoModule,
        OrganizationChartModule,
    ],
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

    data: any[] = [
        {
            label: 'MySchool',
             styleClass: '!bg-blue-600 !text-white !text-2xl !font-bold',
            type: 'root',
            expanded: true,
            children: [
                {
                    label: 'G1',
                    styleClass: '!bg-blue-100 !text-blue-900',
                    expanded: true,
                    children: [
                        {
                            label: 'Sec A',
                            expanded: true,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                { label: 'Sub1 - Teacher - 14/18 - 40%', styleClass: '!bg-green-100 !text-green-900' },
                                { label: 'Sub2 - Teacher - 8/10 - 60%', styleClass: '!bg-green-100 !text-green-900' },
                            ],
                        },
                        {
                            label: 'Sec B',
                            expanded: true,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                { 
                                  label: 'Sub1 - Teacher - 10/12 - 80%', 
                                  styleClass: '!bg-green-100 !text-green-900'
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'G2',
                    expanded: true,
                    styleClass: '!bg-blue-100 !text-blue-900',
                    children: [
                        {
                            label: 'Sec A',
                            expanded: true,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                { label: 'Sub1 - Teacher - 12/15 - 70%',styleClass: '!bg-green-100 !text-green-900' },
                            ],
                        },
                    ],
                },
                {
                    label: 'G10',
                    expanded: true,
                    styleClass: '!bg-blue-100 !text-blue-900',
                    children: [
                        {
                            label: 'Sec A',
                            expanded: true,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                { label: 'Sub1 - Teacher - 5/10 - 50%',styleClass: '!bg-green-100 !text-green-900' },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    constructor(
            private titleService: BreadcrumbService,
            private _router: Router,
    
            private translocoService: TranslocoService
        ) {
            this.titleService.setBreadcrumb([
                {
                    label: this.translocoService.translate('navigation.platform'),
                    url: 'dashboard',
                },
                {
                    label: this.translocoService.translate('navigation.dashboard'),
                    url: '',
                },
            ]);
        }
}

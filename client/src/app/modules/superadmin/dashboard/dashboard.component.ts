import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'example',
    standalone: true,
    templateUrl: './dashboard.component.html',
    imports: [TranslocoModule, NgApexchartsModule, MatButtonToggleModule],
    encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
    data: any = {
        institutesOnboarded: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            series: {
                'this-week': [
                    {
                        name: 'Institutes Onboarded',
                        type: 'column',
                        data: [11, 10, 8, 11, 8, 10, 17],
                    },
                ],
                'last-week': [
                    {
                        name: 'Institutes Onboarded',
                        type: 'column',
                        data: [9, 8, 10, 12, 7, 11, 15],
                    },
                ],
            },
        },
        teachersOnboarded: {
            labels: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
            series: {
                'this-month': [
                    {
                        name: 'Teachers Onboarded',
                        type: 'column',
                        data: [
                            5, 3, 4, 6, 2, 3, 4, 5, 3, 2, 5, 4, 6, 5, 3, 4, 2,
                            5, 6, 7, 3, 2, 4, 5, 3, 2, 4, 5, 6, 3, 4,
                        ],
                    },
                ],
                'last-month': [
                    {
                        name: 'Teachers Onboarded',
                        type: 'column',
                        data: [
                            3, 2, 4, 5, 1, 2, 3, 4, 2, 1, 3, 3, 5, 4, 2, 3, 1,
                            3, 4, 5, 2, 1, 3, 3, 2, 1, 3, 3, 4, 2, 3,
                        ],
                    },
                ],
            },
        },
    };
    chartInstitutesOnboarded: ApexOptions = {};
    chartTeachersOnboarded: ApexOptions = {};
    /**
     * Constructor
     */
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

    ngOnInit(): void {
        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };

        this._prepareChartData();
    }

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter((el) => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute(
                    'fill',
                    `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`
                );
            });
    }

    private _prepareChartData(): void {
        // Github issues
        this.chartInstitutesOnboarded = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'bar',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#3b82f6'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0,
                },
            },
            grid: {
                borderColor: 'var(--fuse-border)',
            },
            labels: this.data.institutesOnboarded.labels,
            legend: {
                show: false,
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                    borderRadius: 5, // Rounded corners (adjust value as needed)
                    borderRadiusApplication: 'end', // Apply rounding to top end of bars
                },
            },
            series: this.data.institutesOnboarded.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                    },
                },
            },
            stroke: {
                width: [0],
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    color: 'var(--fuse-border)',
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tooltip: {
                    enabled: false,
                },
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        this.chartTeachersOnboarded = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'bar',
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            colors: ['#3b82f6'],
            dataLabels: {
                enabled: true,
                background: { borderWidth: 0 },
            },
            grid: {
                borderColor: 'var(--fuse-border)',
            },
            labels: this.data.teachersOnboarded.labels,
            legend: { show: false },
            plotOptions: {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    borderRadiusApplication: 'end',
                },
            },
            series: this.data.teachersOnboarded.series,
            states: {
                hover: {
                    filter: { type: 'darken' },
                },
            },
            stroke: { width: [0] },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                categories: this.data.teachersOnboarded.labels,
                labels: {
                    rotate: -45,
                    style: { colors: 'var(--fuse-text-secondary)' },
                },
                axisBorder: { show: false },
                axisTicks: { color: 'var(--fuse-border)' },
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: { colors: 'var(--fuse-text-secondary)' },
                },
            },
        };
    }
}

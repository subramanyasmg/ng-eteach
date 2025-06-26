import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BreadcrumbService } from './breadcrumb.service';
import { Breadcrumb } from './breadcrumb.types';

@Component({
    selector: 'app-breadcrumb',
    imports: [CommonModule, RouterModule, MatIconModule],
    standalone: true,
    templateUrl: './breadcrumb.component.html',
    styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
    breadcrumbs$: Observable<Breadcrumb[]>;

    constructor(private breadcrumbService: BreadcrumbService) {
        this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
    }
}

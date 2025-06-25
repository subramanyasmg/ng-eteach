import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router, RouterModule, UrlSegment } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from './breadcrumb.types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  standalone: true,
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
      });
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}

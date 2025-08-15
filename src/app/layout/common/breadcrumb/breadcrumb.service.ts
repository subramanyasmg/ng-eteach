import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Breadcrumb } from "./breadcrumb.types";

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private _breadcrumbs = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this._breadcrumbs.asObservable();

  setBreadcrumb(breadcrumbs: Breadcrumb[]) {
    this._breadcrumbs.next(breadcrumbs);
  }
}

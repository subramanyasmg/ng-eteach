 
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SubdomainService } from '../../../services/subdomain.service';

@Injectable({
  providedIn: 'root'
})
export class SuperadminGuard implements CanActivate {
  constructor(
    private subdomainService: SubdomainService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.subdomainService.isMainDomain()) {
      return this.router.parseUrl('/sign-in');
    }
    return true;
  }
}
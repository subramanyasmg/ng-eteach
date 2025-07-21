import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SubdomainService } from '../../../services/subdomain.service';

@Injectable({
  providedIn: 'root'
})
export class TenantGuard implements CanActivate {
  constructor(
    private subdomainService: SubdomainService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.subdomainService.isMainDomain()) {
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
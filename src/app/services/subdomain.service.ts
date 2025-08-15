import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubdomainService {
  getSubdomain(): string | null {
    const host = window.location.hostname;
    if (host.startsWith('localhost') || host.split('.').length === 1) {
      return null;
    }
    return host.split('.')[0];
  }

  isMainDomain(): boolean {
    return this.getSubdomain() === null;
  }
}
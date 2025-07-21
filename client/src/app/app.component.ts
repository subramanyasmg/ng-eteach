import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SubdomainService } from './services/subdomain.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet],
})
export class AppComponent {
    constructor(
        private subdomainService: SubdomainService,
        private router: Router
      ) {}
    
      ngOnInit() {
        const subdomain = this.subdomainService.getSubdomain();
        const path = window.location.pathname;
        
        // Redirect to home if trying to access superadmin with subdomain
        if (subdomain && (path === '/admin/sign-in' || path.startsWith('/home')) )  {
          this.router.navigate(['/sign-in']);
        }
        
        // Redirect to home if trying to access tenant sign-in without subdomain
        if (!subdomain && (path.startsWith('/home'))) {
          this.router.navigate(['/sign-in']);
        }
      }
}

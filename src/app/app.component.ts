import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
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
        private router: Router,
        private location: Location
      ) {}
    
      ngOnInit() {
        const subdomain = this.subdomainService.getSubdomain();
        const path = window.location.pathname;

        // verify this
        // this.router.events.subscribe(event => {
        //   if (event instanceof NavigationEnd) {
        //     if (event.url === '/home' && !subdomain) {
        //       this.location.replaceState('');
        //     }
        //   }
        // }); 

        
        // Redirect to home if trying to access superadmin with subdomain
        // if (subdomain && (path === '/admin/sign-in' || path.startsWith('/home')) )  {
        //   this.router.navigate(['/sign-in']);
        // }
        
        // // Redirect to home if trying to access tenant sign-in without subdomain
        // if (!subdomain && (path.startsWith('/home'))) {
        //   this.router.navigate(['/sign-in']);
        // }
      }
}

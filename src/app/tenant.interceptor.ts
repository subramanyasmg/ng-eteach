import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
    const hostParts = window.location.hostname.split('.');
    // Check if there is a subdomain (length > 2 means subdomain exists)
    if (hostParts.length >= 2) {
        const subdomain = hostParts[0];

        // Clone the request and add the tenant header
        const modifiedReq = req.clone({
            setHeaders: {
                'X-Tenant-ID': subdomain,
            },
        });

        return next(modifiedReq);
    }

    // No subdomain → just forward the request unchanged
    return next(req);
};

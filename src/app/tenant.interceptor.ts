import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const subdomain = window.location.hostname.split('.')[0];
  
  // Clone the request and add the tenant header
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Tenant-ID': subdomain,
    },
  });

  return next(modifiedReq);
};
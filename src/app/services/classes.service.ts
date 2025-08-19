import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClassesService {
    private apiUrl = '/api/insadmin/';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    getAll() {
        return this._httpClient.get(this.apiUrl + '/classes');
    }

    getSectionMappingDetails(id) {
        return this._httpClient.get(
            this.apiUrl + '/chapters-by-section-mapping-id/' + id
        );
    }
}

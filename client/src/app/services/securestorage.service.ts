import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root',
})
export class SecureSessionStorageService {

    private secretKey: string = "SECRET_KEY";

    constructor() {}

    setItem(key: string, value: any): void {
        try {
            const data = JSON.stringify(value);
            const encrypted = CryptoJS.AES.encrypt(data, this.secretKey).toString();
            sessionStorage.setItem(key, encrypted);
        } catch (error) {
            console.error('Error encrypting data for session storage', error);
        }
    }

    getItem<T>(key: string): T | null {
        try {
            const encrypted = sessionStorage.getItem(key);
            if (!encrypted) return null;

            const bytes = CryptoJS.AES.decrypt(encrypted, this.secretKey);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            return decryptedData ? JSON.parse(decryptedData) as T : null;
        } catch (error) {
            console.error('Error decrypting data from session storage', error);
            return null;
        }
    }

    removeItem(key: string): void {
        sessionStorage.removeItem(key);
    }

    clear(): void {
        sessionStorage.clear();
    }
}

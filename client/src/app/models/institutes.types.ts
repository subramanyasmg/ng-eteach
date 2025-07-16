export interface IInstitutes {
    id?: number;
    name: string;
    license_end: string;
    total_licenses: number;
    subdomain: string;
    address: string;
    admin_name: string;
    admin_email: string;
    phone: string;
    status?: string;
    curriculum: number;
    publisher_id?: number;
    account_type: string;
    createdOn?: string;
}

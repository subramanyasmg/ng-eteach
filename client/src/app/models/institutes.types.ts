export interface IInstitutes {
    id?: number;
    institute_name: string;
    license_end: string;
    total_licenses: number;
    subdomain: string;
    address: string;
    admin_name: string;
    email: string;
    phone: string;
    status?: string;
    curriculum_id: number;
    publisher_id?: number;
    account_type: string;
    createdOn?: string;
}

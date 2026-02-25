export type BillingState = "OK" | "defeated" | "pending";

export interface Profile {
    id: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    dni: string;
    rol: "admin" | "user";
    billing_state: BillingState;
    expiration_day: string | null;
}

export interface AuthUser {
    id: string;
    credentials: {
        name: string;
        lastname: string;
        email: string;
        role: "admin" | "user";
    };
    session: "active";
}

'use strict';


export interface User {
    id: number;
    email: string;
    name: string;
}

export interface Bag {
    id: number;
    type: string;
    size: string;
    content: string[] | null;
    state: string;
    price: number;
    establishmentName?: string;
}

export interface Establishment {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    category: string;
}

export interface Schedule {
    id: number;
    bagId: number;
    userId: number | null;
    establishmentId: number;
    pickupTime: string | null;
}

import type {Bag, Establishment, Schedule, User} from "../model/AppModel.ts";

const APIURL = 'http://localhost:3000/api';

export async function userLogin(username: string, password: string): Promise<User | string> {
    try {
        const response = await fetch(APIURL+'/login', {
            method: 'POST',
            headers: {'content-type': 'application/json; charset=utf-8'},
            body: JSON.stringify({
                "username": username,
                "password": password
            }),
            credentials: 'include'
        });
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return (await response.json() as User);
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function userLogout(): Promise<boolean> {
    try {
        const response = await fetch(APIURL+'/logout', {
            method: 'POST',
            credentials: 'include'
        })
        if (!response.ok) {throw Error(response.statusText);}
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return true;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function listEstablishments(): Promise<Array<Establishment>> {
    try {
        const response = await fetch(APIURL+'/establishments');
        if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map((e: Establishment)=>({id: e.id, name: e.name, address: e.address, phoneNumber: e.phoneNumber, category: e.category} as Establishment)));
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function getEstablishment(establishmentId: number): Promise<Establishment | string> {
    try {
        const response = await fetch(APIURL+`/establishments/${establishmentId}`, {credentials: 'include'});
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return (await response.json() as Establishment);
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function listBagsByEstablishment(establishmentId: number): Promise<Array<Bag> | string> {
    try {
        const response = await fetch(APIURL+`/bags/${establishmentId}`, {credentials: 'include'});
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map((b: Bag)=>({id: b.id, type: b.type, size: b.size, content: b.content, state: b.state, price: b.price, establishmentName: b.establishmentName} as Bag)));
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function listBagsByUser(userId: number): Promise<Array<Bag> | string> {
    try {
        const response = await fetch(APIURL+`/${userId}/reserved-bags`, {credentials: 'include'});
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map((b: Bag)=>({id: b.id, type: b.type, size: b.size, content: b.content, state: b.state, price: b.price, establishmentName: b.establishmentName} as Bag)));
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function listBags(bagIdList: Array<number>): Promise<Array<Bag> | string> {
    try {
        const response = await fetch(APIURL+'/bags-selected', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id_list: bagIdList
            }),
            credentials: 'include'
        });
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map((b: Bag)=>({id: b.id, type: b.type, size: b.size, content: b.content, state: b.state, price: b.price, establishmentName: b.establishmentName} as Bag)));
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function listSchedules(): Promise<Array<Schedule>> {
    try {
        const response = await fetch(APIURL+'/schedules');
        if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map((s: Schedule)=>({id: s.id, bagId: s.bagId, userId: s.userId, establishmentId: s.establishmentId, pickupTime: s.pickupTime} as Schedule)));
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function updateBag(id: number, type: string, size: string, content: string[] | null, state: string, price: number): Promise<boolean | string> {
    try {
        const response = await fetch(APIURL+`/bags/${id}`, {
            method: 'PUT',
            headers: {'content-type': 'application/json; charset=utf-8'},
            body: JSON.stringify({
                "type": type,
                "size": size,
                "content": content,
                "state": state,
                "price": price
            }),
            credentials: 'include'
        });
        if (response.status===401) return 'unauthorized';
        else if (response.status===409) return 'failed on update';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return true;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

export async function updateSchedule(id: number, bagId: number, userId: number | null, establishmentId: number, pickupTime: string | null): Promise<boolean | string> {
    try {
        const response = await fetch(APIURL+`/schedules/${id}`, {
            method: 'PUT',
            headers: {'content-type': 'application/json; charset=utf-8'},
            body: JSON.stringify({
                'bagId': bagId,
                'userId': userId,
                'establishmentId': establishmentId,
                'pickupTime': pickupTime
            }),
            credentials: 'include'
        });
        if (response.status===401) return 'unauthorized';
        else if (response.status===409) return 'failed on update';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return true;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

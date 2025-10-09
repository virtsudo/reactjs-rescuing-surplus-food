import {Establishment, Bag, Schedule} from "./surplus.js";

const APIURL = 'http://localhost:3000/api';

async function userLogin(username, password) {
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
        return (await response.json());
    } catch (err) {throw new Error(err.message);}
}

async function userLogout(){
    try {
        const response = await fetch(APIURL+'/logout', {
            method: 'POST',
            credentials: 'include'
        })
        if (!response) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return true;
    } catch (err) {throw new Error(err.message);}
}

async function listEstablishments() {
    try {
        const response = await fetch(APIURL+'/establishments');
        if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map(e=>(new Establishment(e.id, e.name, e.address, e.phoneNumber, e.category))));
    } catch (err) {throw new Error(err.message);}
}

async function listBagsByEstablishment(establishmentId){
    try {
        const response = await fetch(APIURL+`/bags/${establishmentId}`, {credentials: 'include'});
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map(b=>(new Bag(b.id, b.type, b.size, b.content, b.state, b.price, b.establishmentName))));
    } catch (err) {throw new Error(err.message);}
}

async function listBagsByUser(userId) {
    try {
        const response = await fetch(APIURL+`/${userId}/reserved-bags`, {credentials: 'include'});
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        return ((await response.json()).map(b=>(new Bag(b.id, b.type, b.size, b.content, b.state, b.price, b.establishmentName))));
    } catch (err) {throw new Error(err.message);}
}

async function listBags(bagIdList) {
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
        return ((await response.json()).map(b=>(new Bag(b.id, b.type, b.size, b.content, b.state, b.price, b.establishmentName))));
    } catch (err) {throw new Error(err.message);}
}

async function getSchedule(scheduleId) {
    try {
        const response = await fetch(APIURL+`/schedules/${scheduleId}`, {credentials: 'include'});
        if (response.status===401) return 'unauthorized';
        else if (!response.ok) throw Error(response.statusText);
        if (response.headers.get('content-type')!=='application/json; charset=utf-8') throw new TypeError(`Expected JSON, got ${response.headers.get('Content-Type')}`);
        const schedule = await response.json();
        return (new Schedule(schedule.id, schedule.bagId, schedule.userId, schedule.establishmentId, schedule.pickupTime));
    } catch (err) {throw new Error(err.message);}
}

async function updateBag(id, type, size, content, state, price) {
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
    } catch (err) {throw new Error(err.message);}
}

async function updateSchedule(id, bagId, userId, establishmentId, pickupTime) {
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
        return response;
    } catch (err) {throw new Error(err.message);}
}

export {userLogin, userLogout, listEstablishments, listBagsByEstablishment, listBagsByUser, getSchedule, listBags, updateBag, updateSchedule};

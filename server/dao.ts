'use strict';

const sqlite = require('sqlite3').verbose();
import crypts = require('crypto');
import {Bag, Establishment, Schedule, User} from './surplus';

const db = new sqlite.Database('surplus.sqlite', (err: any)=>{if (err) throw err;});

export async function getUser(username:string, password: string): Promise<User | boolean> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM users WHERE email=?";
        db.get(sql, [username], (err:any, row: any)=>{
            if (err) reject(err);
            else if (!row) reject('invalid username/password');
            else {
                crypts.scrypt(password, row.salt, 32, (err, hashedPassword)=>{
                    if (err) reject(err);
                    if (!crypts.timingSafeEqual(hashedPassword, Buffer.from(row.hash, 'hex'))) resolve(false);
                    else resolve({id: row.id, email: row.email, name: row.name} as User);
                });
            }
        });
    });
}

export async function listEstablishments(): Promise<Array<Establishment>> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM establishments";
        db.all(sql, (err: any, rows: any)=>{
            if (err) reject(err); else {
                const establishments: Array<Establishment> = rows.map((e: any)=>({id: e.id, name: e.name, address: e.address, phoneNumber: e.phone_number, category: e.category} as Establishment));
                resolve(establishments);
            }
        });
    });
}

export async function getEstablishment(establishmentId: number): Promise<Establishment> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM establishments WHERE id=?";
        db.get(sql, [establishmentId], (err: any, row: any)=>{
            if (err) reject(err); else {
                resolve({id: row.id, name: row.name, address: row.address, phoneNumber: row.phone_number, category: row.category} as Establishment);
            }
        });
    });
}

export async function listBagsByEstablishment(establishmentId: number): Promise<Array<Bag>> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT B.id, B.type, B.size, B.content, B.state, B.price FROM bags B, schedules S WHERE B.id=S.bag_id AND S.establishment_id=?";
        db.all(sql, [establishmentId], (err: any, rows: any)=>{
            if (err) reject(err); else {
                const bags: Array<Bag> = rows.map((b: any)=>({id: b.id, type: b.type, size: b.size, content: (b.type==='Surprise')?undefined:b.content.split(","), state: b.state, price: b.price, establishmentName: undefined} as Bag));
                resolve(bags);
            }
        });
    });
}

export async function listBagsByUser(userId: number): Promise<Array<Bag>> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT B.id, B.type, B.size, B.content, B.state, B.price, E.name FROM bags B, schedules S, establishments E WHERE B.id=S.bag_id AND E.id=S.establishment_id AND S.user_id=?";
        db.all(sql, [userId], (err: any, rows: any)=>{
            if (err) reject(err); else {
                const bags: Array<Bag> = rows.map((b: any)=>({id: b.id, type: b.type, size: b.size, content: (b.type==='Surprise')?undefined:b.content.split(","), state: b.state, price: b.price, establishmentName: b.name} as Bag));
                resolve(bags);
            }
        });
    });
}

export async function listBags(bagIdList: Array<number>): Promise<Array<Bag>> {
    return new Promise((resolve, reject)=>{
        if (bagIdList.length===0) resolve([]);
        else {
            let sql = `SELECT B.id, B.type, B.size, B.content, B.state, B.price, E.name FROM bags B, establishments E, schedules S WHERE B.id=S.bag_id AND E.id=S.establishment_id AND B.state='available' AND B.id in (${bagIdList.map(() => '?').join(', ')})`;
            db.all(sql, bagIdList, (err: any, rows: any)=>{
                if (err) reject(err); else {
                    const bags: Array<Bag> = rows.map((b: any)=>({id: b.id, type: b.type, size: b.size, content: (b.type==='Surprise')?undefined:b.content.split(','), state: b.state, price: b.price, establishmentName: b.name} as Bag));
                    resolve(bags);
                }
            });
        }
    });
}

export async function getBag(bagId: number): Promise<Bag> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM bags WHERE id=?";
        db.get(sql, [bagId], (err: any, row: any)=>{
            if (err) reject(err); else {
                resolve({id: row.id, type: row.type, size: row.size, content: row.content.split(","), state: row.state, price: row.price} as Bag);
            }
        });
    });
}

export async function updateBag(bagId: number, bag: Bag): Promise<number> {
    return new Promise((resolve, reject)=>{
        const sql1 = "UPDATE bags SET type=?, size=?, content=?, state=?, price=? WHERE id=?";
        const sql2 = "UPDATE bags SET type=?, size=?, state=?, price=? WHERE id=?";
        db.run((bag.type==="Regular")?sql1:sql2, (bag.type==="Regular")?[bag.type, bag.size, bag.content?.join(", "), bag.state, bag.price, bagId]:[bag.type, bag.size, bag.state, bag.price, bagId], function (err: any){
            if (err) reject(err); else {
                // @ts-ignore
                resolve(this.changes);
            }
        });
    });
}

export async function listSchedules(): Promise<Array<Schedule>> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM schedules";
        db.all(sql, (err: any, rows: any)=>{
            if (err) reject(err); else {
                const schedules: Array<Schedule> = rows.map((s: any)=>({id: s.id, bagId: s.bag_id, userId: s.user_id, establishmentId: s.establishment_id, pickupTime: s.pickup_time} as Schedule))
                resolve(schedules);
            }
        });
    });
}

export async function getSchedule(scheduleId: number): Promise<Schedule> {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM schedules WHERE id=?";
        db.get(sql, [scheduleId], (err: any, row: any)=>{
            if (err) reject(err); else {
                resolve({id: row.id, bagId: row.bag_id, userId: row.user_id, establishmentId: row.establishment_id, pickupTime: row.pickup_time} as Schedule);
            }
        });
    });
}

export async function updateSchedule(scheduleId: number, schedule: Schedule): Promise<number> {
    return new Promise((resolve, reject)=>{
        const sql1 = "UPDATE schedules SET bag_id=?, user_id=?, establishment_id=?, pickup_time=? WHERE user_id IS NULL AND id=?";
        const sql2 = "UPDATE schedules SET bag_id=?, user_id=NULL, establishment_id=?, pickup_time=NULL WHERE id=?";
        if (schedule.userId===null) {
            db.run(sql2, [schedule.bagId, schedule.establishmentId, scheduleId], function (err: any){
                if (err) reject(err); else {
                    // @ts-ignore
                    resolve(this.changes);
                }
            });
        } else {
            db.run(sql1, [schedule.bagId, schedule.userId, schedule.establishmentId, schedule.pickupTime, scheduleId], function (err: any){
                if (err) reject(err); else {
                    // @ts-ignore
                    resolve(this.changes);
                }
            });
        }
    });
}

'use strict';

const sqlite = require('sqlite3').verbose();
const crypto = require('crypto');
const {Bag, Establishment, Schedule} = require('./surplus');

const db = new sqlite.Database('surplus.sqlite', (err)=>{if (err) throw err;});

async function getUser(username, password) {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM users WHERE email=?";
        db.get(sql, [username], (err, row)=>{
           if (err) reject(err);
           else if (!row) reject('invalid username/password');
           else {
               crypto.scrypt(password, row.salt, 32, (err, hashedPassword)=>{
                  if (err) reject(err);
                  if (!crypto.timingSafeEqual(hashedPassword, Buffer.from(row.hash, 'hex'))) resolve(false);
                  else resolve({id: row.id, email: row.email, name: row.name});
               });
           }
        });
    });
}

async function listEstablishments() {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM establishments";
        db.all(sql, (err, rows)=>{
            if (err) reject(err); else {
                const establishments = rows.map((e)=>(new Establishment(e.id, e.name, e.address, e.phone_number, e.category)));
                resolve(establishments);
            }
        });
    });
}

async function getEstablishment(establishmentId) {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM establishments WHERE id=?";
        db.get(sql, [establishmentId], (err, row)=>{
            if (err) reject(err); else {
                resolve(new Establishment(row.id, row.name, row.address, row.phone_number, row.category));
            }
        });
    });
}

async function listBagsByEstablishment(establishmentId) {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT B.id, B.type, B.size, B.content, B.state, B.price FROM bags B, schedules S WHERE B.id=S.bag_id AND S.establishment_id=?";
        db.all(sql, [establishmentId], (err, rows)=>{
            if (err) reject(err); else {
                const bags = rows.map((b)=>(new Bag(b.id, b.type, b.size, (b.type==='Surprise')?undefined:b.content, b.state, b.price, undefined)));
                resolve(bags);
            }
        });
    });
}

async function listBagsByUser(userId) {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT B.id, B.type, B.size, B.content, B.state, B.price, E.name FROM bags B, schedules S, establishments E WHERE B.id=S.bag_id AND E.id=S.establishment_id AND S.user_id=?";
        db.all(sql, [userId], (err, rows)=>{
            if (err) reject(err); else {
                const bags = rows.map((b)=>(new Bag(b.id, b.type, b.size, (b.type==='Surprise')?undefined:b.content, b.state, b.price, b.name)));
                resolve(bags);
            }
        });
    });
}

async function listBags(bagIdList) {
    return new Promise((resolve, reject)=>{
        if (bagIdList.length===0) resolve([]);
        else {
            let sql = "SELECT B.id, B.type, B.size, B.content, B.state, B.price, E.name FROM bags B, establishments E, schedules S WHERE B.id=S.bag_id AND E.id=S.establishment_id AND B.state='available' AND B.id in (";
            bagIdList.map(i=>sql+="?,"); sql=sql.replace(/.$/, ')');
            db.all(sql, bagIdList, (err, rows)=>{
                if (err) reject(err); else {
                    const bags = rows.map((b)=>(new Bag(b.id, b.type, b.size, (b.type==='Surprise')?undefined:b.content.split(', '), b.state, b.price, b.name)));
                    resolve(bags);
                }
            });
        }
    });
}

async function getBag(bagId) {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM bags WHERE id=?";
        db.get(sql, [bagId], (err, row)=>{
            if (err) reject(err); else {
                resolve(new Bag(row.id, row.type, row.size, row.content, row.state, row.price));
            }
        });
    });
}

async function updateBag(bagId, bag) {
    return new Promise((resolve, reject)=>{
        const sql1 = "UPDATE bags SET type=?, size=?, content=?, state=?, price=? WHERE id=?";
        const sql2 = "UPDATE bags SET type=?, size=?, state=?, price=? WHERE id=?";
        db.run((bag.type==="Regular")?sql1:sql2, (bag.type==="Regular")?[bag.type, bag.size, bag.content, bag.state, bag.price, bagId]:[bag.type, bag.size, bag.state, bag.price, bagId], function (err){
           if (err) reject(err); else resolve(this.changes);
        });
    });
}

async function listSchedules() {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM schedules";
        db.all(sql, (err, rows)=>{
            if (err) reject(err); else {
                const schedules = rows.map((s)=>(new Schedule(s.id, s.bag_id, user_id, establishment_id, pickup_time)))
                resolve(schedules);
            }
        });
    });
}

async function getSchedule(scheduleId) {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM schedules WHERE id=?";
        db.get(sql, [scheduleId], (err, row)=>{
            if (err) reject(err); else {
                resolve(new Schedule(row.id, row.bag_id, row.user_id, row.establishment_id, row.pickup_time));
            }
        });
    });
}

async function updateSchedule(scheduleId, schedule) {
    return new Promise((resolve, reject)=>{
        const sql = "UPDATE schedules SET bag_id=?, user_id=?, establishment_id=?, pickup_time=? WHERE user_id IS NULL AND id=?";
        const sql1 = "UPDATE schedules SET bag_id=?, user_id=NULL, establishment_id=?, pickup_time=NULL WHERE id=?";
        if (schedule.userId===null) {
            db.run(sql1, [schedule.bagId, schedule.establishmentId, scheduleId], function (err){
                if (err) reject(err); else resolve(this.changes);
            });
        } else {
            db.run(sql, [schedule.bagId, schedule.userId, schedule.establishmentId, schedule.pickupTime, scheduleId], function (err){
                if (err) reject(err); else resolve(this.changes);
            });
        }
    });
}

exports.getUser = getUser;
exports.listEstablishments = listEstablishments;
exports.getEstablishment = getEstablishment;
exports.listBags = listBags;
exports.listBagsByEstablishment = listBagsByEstablishment;
exports.listBagsByUser = listBagsByUser;
exports.getBag = getBag;
exports.updateBag = updateBag;
exports.listSchedules = listSchedules;
exports.getSchedule = getSchedule;
exports.updateSchedule = updateSchedule;
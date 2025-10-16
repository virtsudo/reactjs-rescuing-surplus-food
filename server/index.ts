'use strict';

const PORT = 3000;
import express from 'express';

import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';

import passport from 'passport';
import LocalStrategy from 'passport-local';

import * as dao from './dao';
import {Bag, Schedule, Establishment, User} from "./surplus";

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(session({secret: "Are you ready for exam?", resave: false, saveUninitialized: false}));

// @ts-ignore
passport.use(new LocalStrategy(function (username: string, password: string, cb: any){
    dao.getUser(username, password).then((user: User | boolean)=>{
        cb(null, user);
    }).catch((err: any)=>{
        cb(null, false, err);
    });
}));

passport.serializeUser((user: any, cb)=>{
    cb(null, {id:user.id, email:user.email, name: user.name});
});

passport.deserializeUser((user, cb)=>{
    // @ts-ignore
    return cb(null, user);
});

app.use(passport.authenticate('session'));


const isLoggedIn = (req: any, res: any, next: any)=>{
    if (req.isAuthenticated()) next();
    else res.status(401).json({message: 'unauthorized'});
}

app.post('/api/login', passport.authenticate('local'), (req, res)=>{
    res.json(req.user);
});

app.post('/api/logout', (req, res)=>{
    req.logout(()=>{res.json({}).end()});
});

// public reqs

app.get('/api/establishments', async (_req, res)=>{
    try {
        const establishments: Array<Establishment> = await dao.listEstablishments();
        res.json(establishments);
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.get('/api/schedules', async (_req, res)=>{
    try {
        const schedules: Array<Schedule> = await dao.listSchedules();
        res.json(schedules);
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.use(isLoggedIn);

// private reqs

app.get('/api/establishments/:establishmentId', async (req, res)=>{
    try {
        const establishment: Establishment = await dao.getEstablishment(Number(req.params["establishmentId"]));
        res.json(establishment);
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.get('/api/bags/:establishmentId', async (req, res)=>{
    try {
        const bags: Array<Bag> = await dao.listBagsByEstablishment(Number(req.params["establishmentId"]));
        res.json(bags);
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.get('/api/schedules/:scheduleId', async (req, res)=>{
    try {
        const schedule: Schedule = await dao.getSchedule(Number(req.params["scheduleId"]));
        res.json(schedule);
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.post('/api/bags-selected', async (req, res)=>{
    try {
        const bags: Array<Bag> = await dao.listBags(req.body.id_list);
        if (bags) res.json(bags);
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.put('/api/bags/:bagId', async (req, res)=>{
    try {
        const bag: Bag = {id: Number(req.params["bagId"]), type: String(req.body.type), size: String(req.body.size), content:(req.body.type==="Regular")?req.body.content:[], state: String(req.body.state), price: Number(req.body.price)};
        const result = await dao.updateBag(Number(req.params["bagId"]), bag);
        if (result && result>0) res.status(200).json({});
        else res.status(409).send('Failed on updating bags data');
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.put('/api/schedules/:scheduleId', async (req, res)=>{
    try {
        const schedule: Schedule = {id: Number(req.params["scheduleId"]), bagId: Number(req.body.bagId), userId: (req.body.userId)?Number(req.body.userId):null, establishmentId: Number(req.body.establishmentId), pickupTime: req.body.pickupTime};
        const result = await dao.updateSchedule(Number(req.params["scheduleId"]), schedule);
        if (result && result>0) res.status(200).json({});
        else res.status(409).send('Failed on updating schedules data');
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.get('/api/:userId/reserved-bags', async (req, res)=>{
    try {
        const bags: Array<Bag> = await dao.listBagsByUser(Number(req.params["userId"]));
        res.json(bags);
    } catch (err) {
        // @ts-ignore
        res.status(500).send(err.message);
    }
});

app.listen(PORT, ()=>{console.log(`Server started on http://localhost:${PORT}/`)});

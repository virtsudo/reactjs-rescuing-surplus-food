'use strict';

const PORT = 3000;
const express = require('express');

const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const dao = require('./dao');
const {Bag, Schedule} = require("./surplus");

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(session({secret: "Are you ready for exam?", resave: false, saveUninitialized: false}));

passport.use(new LocalStrategy(function (username, password, cb){
    dao.getUser(username, password).then((user)=>{
        cb(null, user);
    }).catch((err)=>{
        cb(null, false, err);
    });
}));

passport.serializeUser((user, cb)=>{
   cb(null, {id:user.id, email:user.username, name: user.name});
});

passport.deserializeUser((user, cb)=>{
   return cb(null, user);
});

app.use(passport.authenticate('session'));

const isLoggedIn = (req, res, next)=>{
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

app.get('/api/establishments', async (req, res)=>{
   try {
       const establishments = await dao.listEstablishments();
       res.json(establishments);
   } catch (err) {
       res.status(500).send(err.message);
   }
});

app.use(isLoggedIn);

            // private reqs

app.get('/api/bags/:establishmentId', async (req, res)=>{
    try {
        const bags = await dao.listBagsByEstablishment(req.params["establishmentId"]);
        res.json(bags);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/schedules/:scheduleId', async (req, res)=>{
    try {
        const schedule = await dao.getSchedule(req.params["scheduleId"]);
        res.json(schedule);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/bags-selected', async (req, res)=>{
    try {
        const bags = await dao.listBags(req.body.id_list);
        if (bags) res.json(bags);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/api/bags/:bagId', async (req, res)=>{
    try {
        let new_content = "";
        if (req.body.type==="Regular") {req.body.content.map(c=>new_content+=(c+", ")); new_content=new_content.slice(0, -2);}
        const bag = new Bag(req.params["bagId"], req.body.type, req.body.size, new_content, req.body.state, req.body.price);
        const result = await dao.updateBag(req.params["bagId"], bag);
        if (result && result>0) res.status(200).json({});
        else res.status(409).send('Failed on updating bags data');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/api/schedules/:scheduleId', async (req, res)=>{
    try {
        const schedule = new Schedule(req.params["scheduleId"], req.body.bagId, req.body.userId, req.body.establishmentId, req.body.pickupTime);
        const result = await dao.updateSchedule(req.params["scheduleId"], schedule);
        if (result && result>0) res.status(200).json({});
        else res.status(409).send('Failed on updating schedules data');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/:userId/reserved-bags', async (req, res)=>{
    try {
        const bags = await dao.listBagsByUser(req.params["userId"]);
        res.json(bags);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, ()=>{console.log(`Server started on http://localhost:${PORT}/`)});

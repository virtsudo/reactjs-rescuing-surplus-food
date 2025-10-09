'use strict';

function Bag(id, type, size, content, state, price, establishmentName) {
    this.id = id;
    this.type = type;
    this.size = size;
    this.content = content || undefined;
    this.state = state;
    this.price = price;
    this.establishmentName = establishmentName || undefined;
}

function Establishment(id, name, address, phoneNumber, category) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.phoneNumber = phoneNumber;
    this.category = category;
}

function Schedule(id, bagId, userId, establishmentId, pickupTime) {
    this.id = id;
    this.bagId = bagId;
    this.userId = userId;
    this.establishmentId = establishmentId;
    this.pickupTime = pickupTime;
}

exports.Bag = Bag;
exports.Establishment = Establishment;
exports.Schedule = Schedule;
const cds = require("@sap/cds");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
const { ObjectId } = require("mongodb");

dotenv.config();

const sMongoUrl = process.env.MONGO_URL;
const sDbName = process.env.DATABASE_NAME;
const client = new MongoClient(sMongoUrl);

async function _crearSuperheroe(req) {


    if (req.data.franquicia != 'Marvel' && req.data.franquicia != 'DC') {
        req.error({ code: "401", message: "Franquisia no valida" });
    }

    await client.connect();
    var dataBase = await client.db(sDbName);
    var superheroes = await dataBase.collection("SuperHeroes");
    var result = await superheroes.insertOne(req.data);

    if (result.insertedId) {
        req.data.id = result.insertedId;
    }

    return req.data;
}

async function _recuperarSuperheroes(req) {

    await client.connect();
    var dataBase = await client.db(sDbName);
    var superheroes = await dataBase.collection("SuperHeroes");

    var iLimit, iOffset, oFilter;

    // &top y &skip
    console.log(req.query.SELECT.limit);
    if (req.query.SELECT.limit) {
        iLimit = req.query.SELECT.limit.rows.val;

        if (req.query.SELECT.limit.offset) {
            iOffset = req.query.SELECT.limit.offset.val;
        } else {
            iOffset = 0;
        }


    } else {
        iLimit = 9999;
        iOffset = 0;
    }

    // Select Entry
    console.log(req.query.SELECT.one);

    if (req.query.SELECT.one) {

        var sId = req.query.SELECT.from.ref[0].where[2].val;
        oFilter = {
            "_id": new ObjectId(sId)
        };
    }

    var results = await superheroes.find(oFilter).limit(iLimit + iOffset).toArray();

    for (var i = 0; i < results.length; i++) {
        results[i].id = results[i]._id.toString();
    }

    results = results.slice(iOffset);
    return results;
}

async function _actualizarSuperheroe(req) {

    await client.connect();
    var dataBase = await client.db(sDbName);
    var superheroes = await dataBase.collection("SuperHeroes");

    var oSuperHeroe = req.data;
    var sId = new ObjectId(oSuperHeroe.id);
    delete oSuperHeroe.id;

    var oResult = await superheroes.updateOne({ _id: sId }, { $set: oSuperHeroe });

    if (oResult.modifiedCount > 0) {
        return oSuperHeroe;
    } else {
        return oResult;
    }

}

async function _borrarSuperheroe(req) {

    await client.connect();
    var dataBase = await client.db(sDbName);
    var superheroes = await dataBase.collection("SuperHeroes");

    var oSuperHeroe = req.data;
    var sId = new ObjectId(oSuperHeroe.id);

    var oResult = await superheroes.deleteOne({ _id: sId });
    return oResult;
}


module.exports = cds.service.impl(function () {

    const { superheroe } = this.entities;
    this.on("INSERT", superheroe, _crearSuperheroe);
    this.on("READ", superheroe, _recuperarSuperheroes);
    this.on("UPDATE", superheroe, _actualizarSuperheroe);
    this.on("DELETE", superheroe, _borrarSuperheroe);
})

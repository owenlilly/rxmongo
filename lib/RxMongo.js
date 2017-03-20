const Rx = require('rx');
const MongoClient = require('mongodb').MongoClient;

let _db = undefined;

/** @module */
module.exports = class RxMongo {

    static connect(url) {
        var options = {
            server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
            replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
        };
        return Rx.Observable.create(s => {
            MongoClient.connect(url, (err, db) => {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                    return;
                }
                
                _db = db;
                s.onNext(_db);
                s.onCompleted();
            });
        }, options);
    }

    static disconnect(){
        if(_db !== undefined && _db !== null){
            _db.close();
        }
    }

    static collection(name) {
        if(_db === undefined)
            throw new Error('no database connection');

        return Rx.Observable.just(_db.collection(name));
    }

    static aggregate(collection, aggregationPipline){
        return Rx.Observable.create(s => {
            collection.aggregate(aggregationPipline, (err, result) => {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                }

                s.onNext(result);
                s.onCompleted();
            });
        });
    }

    static find(collection){
        return RxMongo.find(collection, {});
    }

    static find(collection, query){
        return Rx.Observable.just(collection.find(query));
    }

    static limit(cursor, count){
        return Rx.Observable.just(cursor.limit(count));
    }

    static map(cursor, func){
        return Rx.Observable.just(cursor.map(func));
    }

    static skip(cursor, count){
        return Rx.Observable.just(cursor.skip(count));
    }

    static count(){
        if(arguments.length > 1){
            return RxMongo.countByCollection(arguments[0], arguments[1], arguments[2]);
        }

        return RxMongo.countByCursor(arguments[0]);
    }

    static countByCollection(collection, query, options){
        return Rx.Observable.create(s => {
                collection.count(query, options).then(count => {
                    s.onNext(count);
                    s.onCompleted();
                }).catch(err => {
                    s.onError(err);
                    s.onCompleted();
                });
            });
    }

    static countByCursor(cursor){
        return Rx.Observable.create(s => {
                cursor.count().then(count => {
                    s.onNext(count);
                    s.onCompleted();
                }).catch(err => {
                    s.onError(err);
                    s.onCompleted();
                });
            });
    }

    static insert(collection, docs){
        if(Array.isArray(docs)){
            return RxMongo.insertMany(collection, docs);
        } else {
            return RxMongo.insertOne(collection, docs);
        }
    }

    static insertMany(collection, docs){
        return Rx.Observable.create(s => {
           collection.insertMany(docs).then(result => {
               s.onNext(result);
               s.onCompleted();
           }).catch(err => {
               s.onError(err);
               s.onCompleted();
           });
        });
    }

    static insertOne(collection, doc){
        return Rx.Observable.create(s => {
           collection.insertOne(doc, (err, result) => {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                }

               s.onNext(result);
               s.onCompleted();
           });
        });
    }

    static deleteOne(collection, filter){
        return Rx.Observable.create(s => {
           collection.deleteOne(filter, (err, result) => {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                }

               s.onNext(result);
               s.onCompleted();
           });
        });
    }

    static deleteMany(collection, filter){
        return Rx.Observable.create(s => {
           collection.deleteMany(filter, (err, result) => {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                }

               s.onNext(result);
               s.onCompleted();
           });
        });
    }

    static sort(cursor, sort){
        return Rx.Observable.just(cursor.sort(sort));
    }

    static updateOne(collection, filter, update){
        return Rx.Observable.create(s => {
            collection.updateOne(filter, update, {}, (err, result) => {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                }

               s.onNext(result);
               s.onCompleted();
            });
        });
    }

    static whileHasNext(cursor){
        const rxNext = Rx.Observable.create(s => {
            cursor.next(function(err, result){
                if(err){
                    s.onError(err);
                    s.onCompleted();
                    return;
                }
                
                s.onNext(result);
            });
        });

        return rxNext.expand(() => rxNext).takeWhile(doc => doc && doc != null);
    }

    static hasNext(cursor){
        return Rx.Observable.create(s => {
            cursor.hasNext(function(err, result) {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                    return;
                }

                s.onNext(result);
                s.onCompleted();
            });
        });
    }

    static toArray(cursor){
        return Rx.Observable.create(s => {
            cursor.toArray((err, values) => {
                if(err){
                    s.onError(err);
                    s.onCompleted();
                    return;
                }

                s.onNext(values);
                s.onCompleted();
            });
        });
    }
}
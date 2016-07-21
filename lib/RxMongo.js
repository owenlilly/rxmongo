const Rx = require('rx');
const MongoClient = require('mongodb').MongoClient;

let _db = undefined;

module.exports = class RxMongo {

    static connect(url) {
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
        });
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

    static count(cursor){
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

    static sort(cursor, sort){
        return Rx.Observable.just(cursor.sort(sort));
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
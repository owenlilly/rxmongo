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
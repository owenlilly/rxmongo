const RxMongo = require('./RxMongo');
const RxCursor = require('./RxCursor');
const RxAggregator = require('./RxAggregator');
const Rx = require('rx');

const RxCollection = (function(){
    function RxCollection(collectionName){
        this.collectionName = collectionName;
        this.rxCollection = RxMongo.collection(this.collectionName);
    }

    RxCollection.prototype.find = function(query){
        return new RxCursor(this.rxCollection.flatMap(coll => RxMongo.find(coll, query)));
    }

    RxCollection.prototype.exists = function(query){
        return Rx.Observable.create.call(this, s => {
                        this.find(query)
                            .first()
                            .subscribe(result => {
                                s.onNext(!!result);
                            }, error => {
                                s.onError(error);
                            }, () => s.onCompleted());
                    });
    }

    RxCollection.prototype.aggregate = function(aggregations){
        return new RxAggregator(this.rxCollection, aggregations);
    }

    RxCollection.prototype.count = function(query){
        return this.rxCollection.flatMap(coll => RxMongo.countByCollection(coll, query, {}));
    }

    RxCollection.prototype.insert = function(docOrDocs){
        return this.rxCollection.flatMap(coll => RxMongo.insert(coll, docOrDocs));
    }

    RxCollection.prototype.insertOne = function(doc){
        return this.insert(doc);
    }

    RxCollection.prototype.insertMany = function(docs){
        return this.insert(doc);
    }

    RxCollection.prototype.updateOne = function(filter, update){
        return this.rxCollection.flatMap(coll => RxMongo.updateOne(coll, filter, update));
    }

    RxCollection.prototype.deleteOne = function(filter){
        return this.rxCollection.flatMap(coll => RxMongo.deleteOne(coll, filter));
    }

    return RxCollection;
})();

module.exports = RxCollection;
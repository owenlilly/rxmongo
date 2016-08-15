const RxMongo = require('./RxMongo');
const RxCursor = require('./RxCursor');

const RxCollection = (function(){
    function RxCollection(collectionName){
        this.collectionName = collectionName;
        this.rxCollection = RxMongo.collection(this.collectionName);
    }

    RxCollection.prototype.find = function(query){
        return new RxCursor(this.rxCollection.flatMap(coll => RxMongo.find(coll, query)));
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

    return RxCollection;
})();

module.exports = RxCollection;
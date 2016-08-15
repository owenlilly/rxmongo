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

    return RxCollection;
})();

module.exports = RxCollection;
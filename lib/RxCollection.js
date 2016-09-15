const RxMongo = require('./RxMongo');
const RxCursor = require('./RxCursor');
const RxAggregator = require('./RxAggregator');
const Rx = require('rx');
const ObjectID = require('mongodb').ObjectID;

/** @module */
const RxCollection = (function(){

    function RxCollection(collectionName){
        this.collectionName = collectionName;
        this.rxCollection = RxMongo.collection(this.collectionName);
    }

    /**
     * Finds documents based on the query.
     * 
     * @param {object} query
     * @returns {RxCursor} RxCursor - a new instance of RxCursor
     */
    RxCollection.prototype.find = function(query){
        return new RxCursor(this.rxCollection.flatMap(coll => RxMongo.find(coll, query)));
    }

    /**
     * Finds a single document based on the query. Shortcut for .find().first() call.
     * 
     * @param {object} query
     * @returns {Rx.Observable} Rx.Observable - a Rx.Observable instance
     */
    RxCollection.prototype.findOne = function(query){
        return this.find(query).first();
    }

    /**
     * Finds a single document based on the given id.
     * 
     * @param {string} id
     * @returns {Rx.Observable} Rx.Observable - a Rx.Observable instance
     */
    RxCollection.prototype.findById = function(id){
        return this.find(ObjectID(id)).first();
    }

    /**
     * Checks whether any documents exist based on the query
     * 
     * @param {object} query
     * @returns {boolean} Boolean - returns true if a match has been found, false otherwise
     */
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

    /**
     * Gets the total number of documents matched based on the query.
     * 
     * @param {object} query
     * @returns {integer} Integer - the total numnber of matched documents.
     */
    RxCollection.prototype.count = function(query){
        return this.rxCollection.flatMap(coll => RxMongo.countByCollection(coll, query, {}));
    }

    /**
     * Inserts a single or multiple documents
     * 
     * @param {object} docOrDocs - can be an object or an array of objects
     * @returns {object} **** - result of the insert
     */
    RxCollection.prototype.insert = function(docOrDocs){
        return this.rxCollection.flatMap(coll => RxMongo.insert(coll, docOrDocs));
    }

    /**
     * Inserts a single or multiple documents
     * 
     * @param {object} doc - an object representing the document
     * @returns {object} **** - result of the insert
     */
    RxCollection.prototype.insertOne = function(doc){
        return this.insert(doc);
    }

    /**
     * Inserts a multiple documents
     * 
     * @param {object} docs - an array of objects
     * @returns {object} **** - result of the insert
     */
    RxCollection.prototype.insertMany = function(docs){
        return this.insert(docs);
    }

    /**
     * Updates a single documents
     * 
     * @param {object} filter - an object representing the search criteria
     * @param {object} update - the fields to update
     * @returns {object} **** - result of the update
     */
    RxCollection.prototype.updateOne = function(filter, update){
        return this.rxCollection.flatMap(coll => RxMongo.updateOne(coll, filter, update));
    }

    /**
     * Deletes a single document based on filter
     * 
     * @param {object} filter - an object representing the search criteria
     * @returns {object} **** - result of the delete
     */
    RxCollection.prototype.deleteOne = function(filter){
        return this.rxCollection.flatMap(coll => RxMongo.deleteOne(coll, filter));
    }

    /**
     * Deletes multiple documents based on filter
     * 
     * @param {object} filter - an object representing the search criteria
     * @returns {object} **** - result of the delete
     */
    RxCollection.prototype.deleteMany = function(filter){
        return this.rxCollection.flatMap(coll => RxMongo.deleteMany(coll, filter));
    }

    return RxCollection;
})();

module.exports = RxCollection;
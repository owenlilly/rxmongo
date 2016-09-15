const RxMongo = require('./RxMongo');
const Rx = require('rx');

/** @module */
const RxAggregator = (function(){
    function RxAggregator(rxCollection, aggregations){
        this.rxCollection = rxCollection;
        this.aggregations = aggregations || [];
    }

    RxAggregator.prototype.limit = function(count){
        const aggs = this.aggregations.slice(0);
        aggs.push({$limit: count});
        return new RxAggregator(this.rxCollection, aggs);
    }

    /**
     * Returns a single value from the cursor, throws error if more than one item ewxists in the cursor.
     * Undefined is returned if the cursor contains no items.
     * @return {Object} object - The object returned from the cursor
     */
    RxAggregator.prototype.single = function(){
        return Rx.Observable.create.call(this, s => {
            this.limit(2)
                .toArray()
                .subscribe(arr => {
                    if(arr.length > 1){
                        s.onError(new Error('Result set contains more than one element'));
                        s.onCompleted();
                        return;
                    }

                    if(arr.length > 0) {
                        s.onNext(arr[0]);
                    } else {
                        s.onNext(undefined);
                    }

                    s.onCompleted();
                });
        });
    }

    /**
     * Returns the first value from the cursor. Undefined is returned if the cursor contains no items.
     * @return {Object} object - The first object returned from the cursor
     */
    RxAggregator.prototype.first = function(){
        return this.limit(1)
                    .toArray()
                    .map(arr => {
                        if(arr.length > 0) {
                            return arr[0];
                        } else {
                            return undefined;
                        }
                    });
    }

    /**
     * Returns the cursor result set as an array.
     * @return {Array} array - the results
     */
    RxAggregator.prototype.toArray = function(){
        const rxCursor = this.rxCollection
                             .flatMap(coll => RxMongo.aggregate(coll, this.aggregations));

        return Rx.Observable.create(s => {
            rxCursor.subscribe(
                arr => s.onNext(arr),
                err => s.onError(err), 
                () => s.onCompleted()
            );
        });
    }

    return RxAggregator;
})();

module.exports = RxAggregator;
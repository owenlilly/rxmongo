const RxMongo = require('./RxMongo');
const Rx = require('rx');

const RxAggregator = (function(){
    function RxAggregator(observableCursor){
        this.rxCursor = observableCursor;
    }

    /**
     * Maps a doc from one type to another
     * @param {Function} func
     * @return {Object} the return value of the func
     */
    RxAggregator.prototype.map = function(func){
        return this.rxCursor.flatMap(cursor => RxMongo.map(cursor, func));
    }

    /**
     * Returns a single value from the cursor, throws error if more than one item ewxists in the cursor.
     * Undefined is returned if the cursor contains no items.
     * @return {Object} The object returned from the cursor
     */
    RxAggregator.prototype.single = function(){
        const self = this;

        return Rx.Observable.create(s => {
            self.toArray()
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
     * @return {Object} The first object returned from the cursor
     */
    RxAggregator.prototype.first = function(){
        return this.toArray()
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
     * @return {Array} the results
     */
    RxAggregator.prototype.toArray = function(){
        const self = this;
        return Rx.Observable.create(s => {
            self.rxCursor.subscribe(arr => s.onNext(arr), err => s.onError(err), () => s.onCompleted());
        });
    }

    return RxAggregator;
})();

module.exports = RxAggregator;
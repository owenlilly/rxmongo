const RxMongo = require('./RxMongo');
const Rx = require('rx');

const RxCursor = (function(){
    function RxCursor(observableCursor){
        this.rxCursor = observableCursor;
    }

    /**
     * Sorts the cursor result based on the specified properties
     * @param {Object} sort
     * @return {RxCursor} RxCursor - a new instance of RxCursor
     */
    RxCursor.prototype.sort = function(sort){
        return new RxCursor(this.rxCursor.flatMap(cursor => RxMongo.sort(cursor, sort)));
    }

    /**
     * Limits the cursor result to the specified number of items
     * @param {Number} count
     * @return {RxCursor} RxCursor - a new instance of RxCursor
     */
    RxCursor.prototype.limit = function(count){
        return new RxCursor(this.rxCursor.flatMap(cursor => RxMongo.limit(cursor, count)));
    }

    /**
     * Skips a specified number of items in the cursor
     * @param {Number} count
     * @return {RxCursor} RxCursor - a new instance of RxCursor
     */
    RxCursor.prototype.skip = function(count){
        return new RxCursor(this.rxCursor.flatMap(cursor => RxMongo.skip(cusror, count)))
    }

    /**
     * Maps a doc from one type to another
     * @param {Function} func
     * @return {Object} object - the return value of the func
     */
    RxCursor.prototype.map = function(func){
        return this.rxCursor.flatMap(cursor => RxMongo.map(cursor, func));
    }

    /**
     * Counts the number of items in the cursor
     * @return {Number} number - a new instance of RxCursor
     */
    RxCursor.prototype.count = function(){
        return this.rxCursor.flatMap(cursor => RxMongo.countByCursor(cursor));
    }

    /**
     * Returns a single value from the cursor, throws error if more than one item ewxists in the cursor.
     * Undefined is returned if the cursor contains no items.
     * @return {Object} object - The object returned from the cursor
     */
    RxCursor.prototype.single = function(){
        return Rx.Observable.create.call(this, s => {
            this.toArray()
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
    RxCursor.prototype.first = function(){
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
    RxCursor.prototype.toArray = function(){
        return this.rxCursor.flatMap(cursor => RxMongo.toArray(cursor));
    }

    return RxCursor;
})();

module.exports = RxCursor;
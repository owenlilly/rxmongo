'use strict';

const chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    Rx = require('rx'),
    RxMongo = require('./../lib/RxMongo.js');

const collectionName = 'RadioStations';

var assert = require('chai').assert;
describe('RxMongo', function() {
    before(function(done){
        RxMongo.connect('mongodb://localhost/rxmongo_test').subscribe(db => {
            // database connected
        }, err => console.log(`Err: ${err}`), () => done());
    });

    describe('.count(collection, query, options)', function(){
        describe('.count(collection)', function(done){
            it('should count of all documents in collection', function(done){
                RxMongo.collection(collectionName)
                        .flatMap(coll => RxMongo.count(coll))
                        .subscribe(count => {
                            expect(count > 1).to.be.true;
                        }, err => console.log(`Err: ${err}`), () => done());
            });
        });
    });
});

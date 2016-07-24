'use strict';

const chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    RxMongo = require('./../lib/RxMongo.js');

const collectionName = 'RadioStations';

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

        describe('.count(collection, query)', function(done){
            it('should count of all documents in collection matching the given query', function(done){
                const query = { categories: { $in: [new RegExp('music', 'i')] } };

                RxMongo.collection(collectionName)
                        .flatMap(coll => RxMongo.count(coll, query))
                        .subscribe(count => {
                            expect(count === 8).to.be.true;
                        }, err => console.log(`Err: ${err}`), () => done());
            });
        });
    });

    describe('.aggregate(collection, aggregationPipeline)', function(){
        it('should return documents based on aggregationPipeline', function(done){
            const aggregations = [
                {$unwind: '$categories'},
                {$group: {_id: '$categories', count: {$sum: 1}}}, 
                {$project: {name: '$_id', _id: 0, count: 1}}
            ];
            
            RxMongo.collection(collectionName)
                    .flatMap(coll => RxMongo.aggregate(coll, aggregations))
                    .subscribe(result => {
                        expect(result.length === 6).to.be.true;
                    }, err => console.log(`Error: ${err}`), () => done());
        });
    });
});

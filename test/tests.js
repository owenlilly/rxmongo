'use strict';

const chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    RxMongo = require('./../lib/RxMongo'),
    RxCollection = require('./../lib/RxCollection');

const collectionName = 'RadioStations';
const collectionInsert = 'InsertCollection';

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
                        expect(result.length === 5).to.be.true;
                    }, err => console.log(`Error: ${err}`), () => done());
        });
    });

    describe('.insert(collection, docs)', function(){
        it('should insert single json document in provided collection', function(done){
            const doc = {
                name: 'single',
                items: ['one', 'two', 'three']
            };

            RxMongo.collection(collectionInsert)
                    .flatMap(coll => RxMongo.insert(coll, doc))
                    .subscribe(result => {
                        expect(result.insertedCount).to.equal(1);
                    }, err => console.log(`Error: ${err}`)
                    , () => done());
        });

        it('should insert an array of json documents in provided collection', function(done){
            const docs = [{
                name: 'array',
                items: ['arr1', 'arr2', 'arr3']
            }, {
                name: 'array',
                items: ['arr1', 'arr2', 'arr3']
            }];

            RxMongo.collection(collectionInsert)
                    .flatMap(coll => RxMongo.insert(coll, docs))
                    .subscribe(result => {
                        expect(result.insertedCount).to.equal(2);
                    }, err => console.log(`Error: ${err}`)
                    , () => done());
        });
    });

    describe('.updateOne(collection, filter, update)', function(){
        it('should update a single document based on filter condition', function(done){

            RxMongo.collection(collectionInsert)
                    .flatMap(coll => RxMongo.updateOne(coll, {name: 'array'}, {$set: {name: 'arrayUpdated'}}))
                    .subscribe(updates => {
                        expect(updates.result.ok).to.equal(1);
                    }, 
                    err => console.log(`Error: ${err}`),
                    () => done());
        });
    });

    describe('RxCollection', function(){
        describe('.find(query)', function(){
            it('should find documents based on query', function(done){
                new RxCollection(collectionName)
                            .find({})
                            .first()
                            .subscribe(doc => {
                                expect(doc).to.exist;
                                expect(doc).to.not.be.instanceOf(Array);
                            }, err => {
                                expect(err).to.not.exist;
                            }, 
                            () => done());
            });
        });

        describe('.count(query)', function(){
            it('should count number of documents in collection', function(done){
                new RxCollection(collectionName)
                            .count({})
                            .subscribe(count => {
                                expect(count).to.exist;
                                expect(count).to.equal(16);
                            }, err => {
                                expect(err).to.not.exist;
                            }, 
                            () => done());
            })
        });

        describe('.insert(doc)', function(){
            it('should insert a single document into collection', function(done){
                const doc = {
                    name: 'single',
                    items: ['one', 'two', 'three']
                };

                new RxCollection(collectionInsert)
                            .insert(doc)
                            .subscribe(result => {
                                expect(result).to.exist;
                                expect(result.result.ok).to.equal(1);
                                expect(result.insertedCount).to.equal(1);
                            }, err => {
                                expect(err).to.not.exist;
                            }, () => done());
            })
        });

        describe('.aggregate(aggregationPipeline).toArray()', function(){
            it('should return documents based on aggregationPipeline', function(done){
                const aggregations = [
                    {$unwind: '$categories'},
                    {$group: {_id: '$categories', count: {$sum: 1}}}, 
                    {$project: {name: '$_id', _id: 0, count: 1}}
                ];
                
                new RxCollection(collectionName)
                        .aggregate(aggregations)
                        .toArray()
                        .subscribe(result => {
                            expect(result.length === 5).to.be.true;
                        }, 
                        err => console.log(`Error: ${err}`), 
                        () => done());
            });
        });
    });
});

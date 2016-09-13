'use strict';

const chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    RxMongo = require('./../lib/RxMongo'),
    RxCollection = require('./../lib/RxCollection');

const testCollection = 'TestCollection';

describe('RxMongo', function() {
    before(function(done){
        RxMongo.connect('mongodb://localhost/rxmongo_test').subscribe(db => {
            seedData(new RxCollection(testCollection), done);
        }, err => {
            console.log(`Err: ${err}`);
            done();
        });
    });

    after(function(done){
        cleanData(new RxCollection(testCollection), done);
    });

    describe('.count(collection, query, options)', function(){
        describe('.count(collection)', function(done){
            it('should count of all documents in collection', function(done){
                RxMongo.collection(testCollection)
                        .flatMap(coll => RxMongo.count(coll))
                        .subscribe(count => {
                            expect(count > 1).to.be.true;
                        }, err => console.log(`Err: ${err}`), () => done());
            });
        });

        describe('.count(collection, query)', function(done){
            it('should count of all documents in collection matching the given query', function(done){
                const query = { categories: { $in: [new RegExp('One', 'i')] } };

                RxMongo.collection(testCollection)
                        .flatMap(coll => RxMongo.count(coll, query))
                        .subscribe(count => {
                            expect(count === 3).to.be.true;
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
            
            RxMongo.collection(testCollection)
                    .flatMap(coll => RxMongo.aggregate(coll, aggregations))
                    .subscribe(result => {
                        expect(result.length === 5).to.be.true;
                    }, err => console.log(`Error: ${err}`), () => done());
        });
    });

    describe('.insert(collection, docs)', function(){
        it('should insert single json document in provided collection', function(done){
            const doc = {
                name: 'SingleInsert',
                items: ['One', 'Two', 'Three']
            };

            RxMongo.collection(testCollection)
                    .flatMap(coll => RxMongo.insert(coll, doc))
                    .subscribe(result => {
                        expect(result.insertedCount).to.equal(1);
                    }, err => console.log(`Error: ${err}`)
                    , () => done());
        });

        it('should insert an array of json documents in provided collection', function(done){
            const docs = [{
                name: 'ArrayInsert',
                items: ['arr1', 'arr2', 'arr3']
            }, {
                name: 'ArrayInsert',
                items: ['arr1', 'arr2', 'arr3']
            }];

            RxMongo.collection(testCollection)
                    .flatMap(coll => RxMongo.insert(coll, docs))
                    .subscribe(result => {
                        expect(result.insertedCount).to.equal(2);
                    }, err => console.log(`Error: ${err}`)
                    , () => done());
        });
    });

    describe('.updateOne(collection, filter, update)', function(){
        it('should update a single document based on filter condition', function(done){

            RxMongo.collection(testCollection)
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
            describe('.first()', function(){
                it('should find the first document based on query', function(done){
                    new RxCollection(testCollection)
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

            describe('.toArray()', function(){
                it('should find the first document based on query', function(done){
                    new RxCollection(testCollection)
                                .find({})
                                .toArray()
                                .subscribe(docs => {
                                    expect(docs).to.exist;
                                    expect(docs).to.be.instanceOf(Array);
                                }, err => {
                                    expect(err).to.not.exist;
                                }, 
                                () => done());
                });
            });
        });

        describe('.exists(query)', function(){
            it('should return true if document is found based on query, returns false otherwise', function(done){
                new RxCollection(testCollection)
                            .exists({name: 'SingleInsert'})
                            .subscribe(found => {
                                expect(found).to.exist;
                                expect(found).to.be.true;
                            }, err => {
                                expect(err).to.not.exist;
                            },
                            () => done());
            })
        });

        describe('.count(query)', function(){
            it('should count number of documents in collection', function(done){
                new RxCollection(testCollection)
                            .count({})
                            .subscribe(count => {
                                expect(count).to.exist;
                                expect(count).to.equal(9);
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

                new RxCollection(testCollection)
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

        describe('.aggregate(aggregationPipeline)', function(){
            describe('.toArray()', function(){
                it('should return documents based on aggregationPipeline', function(done){
                    const aggregations = [
                        {$unwind: '$categories'},
                        {$group: {_id: '$categories', count: {$sum: 1}}}, 
                        {$project: {name: '$_id', _id: 0, count: 1}}
                    ];
                    
                    new RxCollection(testCollection)
                            .aggregate(aggregations)
                            .toArray()
                            .subscribe(result => {
                                expect(result.length === 5).to.be.true;
                            }, 
                            err => console.log(`Error: ${err}`), 
                            () => done());
                });
            });

            describe('.first()', function(){
                it('should return the first/single document based on aggregationPipeline', function(done){
                    const aggregations = [
                        {$unwind: '$categories'},
                        {$group: {_id: '$categories', count: {$sum: 1}}}, 
                        {$project: {name: '$_id', _id: 0, count: 1}}
                    ];
                    
                    new RxCollection(testCollection)
                            .aggregate(aggregations)
                            .first()
                            .subscribe(result => {
                                expect(result).to.not.be.instanceOf(Array);
                            }, 
                            err => console.log(`Error: ${err}`), 
                            () => done());
                });
            });
        });

        describe('.findOne(filter)', function(){
            let id = undefined;

            it('should return a single document based on the given query', function(done){
                const filter = {
                    name: 'single'
                }

                const collection = new RxCollection(testCollection);
                collection.findOne(filter)
                            .subscribe(doc => {
                                expect(doc).to.exist;
                                expect(doc).to.not.be.instanceOf(Array);
                                id = doc._id;
                            }, error => {
                                console.log(error);
                            }, () => done());
            });

            describe('.findById(id)', function(){
                it('should return a single doc based on the given id', function(done){

                    const collection = new RxCollection(testCollection);
                    collection.findById(id)
                                .subscribe(doc => {
                                    expect(doc).to.exit;
                                    expect(doc).to.not.be.instanceOf(Array);
                                }, error => {
                                    console.log(error);
                                }, () => done());
                }); 
            });
        });

        describe('.updateOne(filter, update)', function(){
            it('should update the given properties, based on the doc found by filter', function(done){
                const filter = {
                    name: 'single'
                };

                const collection = new RxCollection(testCollection);
                collection.updateOne(filter, {name: 'updated!'})
                          .subscribe(result => {
                              expect(result).to.exist;
                              expect(result.result.ok).to.equal(1);
                          }, 
                          err => console.log(`Error: ${err}`),
                          () => done());
            });
        });

        describe('.deleteOne(filter)', function(){
            it('should delete a single document, based on the filter', function(done){
                const filter = {
                    name: 'single'
                };

                const collection = new RxCollection(testCollection);
                collection.deleteOne(filter)
                            .subscribe(result => {
                                expect(result).to.exist;
                                expect(result.result.ok).to.equal(1);
                            }, err => {
                                console.log(`Error: ${err}`);
                            }, () => done());
            });
        });
    });
});

var seedData = function(rxCollection, done){
    const cat1 = 'One';
    const cat2 = 'Two';
    const cat3 = 'Three';
    const cat4 = 'Four';
    const cat5 = 'Five';

    const doc1 = {name: 'First', categories: [cat1, cat3]};
    const doc2 = {name: 'Second', categories: [cat5, cat3]};
    const doc3 = {name: 'Third', categories: [cat1, cat5]};
    const doc4 = {name: 'Fourth', categories: [cat2, cat1]};
    const doc5 = {name: 'Fifth', categories: [cat3, cat4]};
    const doc6 = {name: 'Sixth', categories: [cat5, cat4]};

    rxCollection.insertMany([doc1, doc2, doc3, doc4, doc5, doc6])
                .subscribe(result => {
                    console.log('Seeded.');
                }, error => {
                    console.log(error);
                }, () => done());
}

var cleanData = function(rxCollection, done){
    rxCollection.deleteMany({})
                .subscribe(result => {
                    console.log('Cleaned up.');
                }, error => {
                    console.log(error);
                }, () => done());
}

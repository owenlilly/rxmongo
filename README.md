# rxmongo
A simple wrapper around native mongo driver that uses [RxJS](https://github.com/Reactive-Extensions/RxJS).


Installation
----
```
npm install rxmongo
``` 


Basic Usage
----

**_Connect_**
You must first connect before using any of the features of the library. Only one call to connect is necessary as each call will open a new connection.

```javascript
const RxMongo = require('rxmongo').RxMongo

// connect only
RxMongo.connect('mongodb://localhost/mydb')
		.subscribe();

// connect and listen for activity events, 
// .subscribe(onNext, onError, onCompleted)
RxMongo.connect('mongodb://localhost/mydb')
		.subscribe(db => {
          // database connected
          console.log('connected!');
        }, err => {
        	// error connecting
        }, 
        () => {
        	// on connected or error connecting
        });
```

**_Find_**

```javascript
const RxCollection = require('rxmongo').RxCollection;

const rxCollection = new RxCollection('mycollection');

rxCollection.find({})
            .first()
            .subscribe(doc => {
                expect(doc).to.exist;
                expect(doc).to.not.be.instanceOf(Array);
            }, err => {
                expect(err).to.not.exist;
            }, 
            () => done());
```

**_Mix, Match and Compose_**

You have the full power and flexibility of RxJS, see [reactivex.io](http://reactivex.io/) and [RxJS](https://github.com/Reactive-Extensions/RxJS) for more details on the idea behind reactive extensions.

```javascript
const RxCollection = require('rxmongo').RxCollection;
const rxCollection = new RxCollection('mycollection');

conss rxFind = rxCollection.find({foo: 'bar'});
const findOne = rxFind.first();
const findAll = rxFind.toArray();
const findAllSorted = rxFind.sort({date: -1}).toArray();

// get first item from result
findOne.subscribe(result => console.log(result));

// get result as an array
findAll.subscribe(resutls => console.log(resutls), 
				 error => console.log(`Oops! ${error}`));

// find, sort and get result as an array 
findAllSorted.subscribe(resutls => console.log(resutls), 
			 			error => console.log(`Oops! ${error}`),
				 		 () => console.log('done!'));
            
```

License
----
```
Copyright 2016 Owen Lilly

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
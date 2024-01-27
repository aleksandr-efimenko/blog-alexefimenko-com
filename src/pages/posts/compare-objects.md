---
title: Exploring 4 Ways to Compare Objects in JavaScript with Performance Analysis
description: In this article, I will implement a custom object and array comparison function. I will use recursion to implement the comparison function. I will also compare the performance of different methods of object comparison.
tags: [javascript, fundamentals]
date: 2023-12-29
image: /blog-assets/compare-objects/cover.png
thumbnail: /blog-assets/compare-objects/cover.png
---


### Introduction

Deep equality check is a common problem in Javascript. Unlike the regular equality operator (== or ===), which only checks for shallow equality, deep equal traverses through the entire structure of the objects or arrays to validate their equality.

The problem with the regular equality operator is that it only checks references of the objects or arrays. If two objects or arrays have the same values but different references, they will not be considered equal.

### There are several common ways to compare objects and arrays in Javascript:

#### 1. [Fast-deep-equal](https://github.com/epoberezkin/fast-deep-equal) and other similar libraries

This library provides a function called equal() which can be used to compare objects and arrays. It is a very popular library, it has 20+ million weekly downloads on npm.

The main advantage of this library is that it is very fast. It is 10-100 times faster than other libraries like Lodash's isEqual() method according to the author benchmark tests:

| Library                | Ops/sec |
| ---------------------- | ------- |
| fast-deep-equal        | 261,950 |
| fast-equals            | 230,957 |
| fast-deep-equal/es6    | 212,991 |
| nano-equal             | 187,995 |
| shallow-equal-fuzzy    | 138,302 |
| underscore.isEqual     | 74,423  |
| util.isDeepStrictEqual | 46,440  |
| lodash.isEqual         | 36,637  |
| deep-eql               | 35,312  |
| ramda.equals           | 12,054  |
| deep-equal             | 2,310   |
| assert.deepStrictEqual | 456     |

To use it, you need to install the library using npm or yarn.

```bash
npm install fast-deep-equal
```

Then you can import it in your code and use it.

```javascript
import equal from 'fast-deep-equal'

const obj1 = { a: 1, b: 2 }
const obj2 = { a: 1, b: 2 }

equal(obj1, obj2) // true
```

Other libraries:

- [Lodash's isEqual](https://lodash.com/docs/4.17.15#isEqual)
- [Ramda](https://ramdajs.com/docs/#equals)
- [Underscore](https://underscorejs.org/#isEqual)
- [Immutable.js](<https://immutable-js.com/docs/v3.8.2/is()>)
- [Fast-equals](https://github.com/planttheidea/fast-equals)

---

#### 2. [Node.js assert.deepEqual() method](https://nodejs.org/api/assert.html#assert_assert_deepstrictequal_actual_expected_message) and [Node.js util.isDeepStrictEqual() method](https://nodejs.org/api/util.html#util_util_isdeepstrictequal_val1_val2)

This is a part of the Node.js assert module.

The main downside of this method is that it can only be used in Node.js but not in the browser.

Another issue is this function throws an error if the objects are not equal. This is not ideal if you want to use it in a conditional statement. You can use try/catch to handle the error, but it is not ideal.

util.isDeepStrictEqual() is similar to assert.deepEqual() but it does not throw an error if the objects are not equal. It returns true or false depending on whether the objects are equal or not. This is more suitable for conditional statements.

```javascript
const assert = require('assert').strict

const obj1 = { a: 1, b: 2 }
const obj2 = { a: 1, b: 2 }

const obj3 = { a: 1, b: 3 }

assert.deepEqual(obj1, obj2) // true

assert.deepEqual(obj1, obj3) // AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
```

---

#### 3. [JSON.stringify() method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

This is a built-in method in Javascript. It converts a Javascript object or array into a JSON string. The JSON string can be compared using the regular equality operator. This is the most used method to compare objects and arrays in Javascript.

But it has some downsides, the main issue with this method is that order of the keys in the object matters. If the order of the keys is different, the JSON string will be different even if the objects are equal. To handle this, you can sort the keys before comparing them.

Another problem is when one of the objects contains an undefined value. The JSON.stringify() method will convert the undefined value to null. This will cause the comparison to fail even if the objects are equal. To handle this, you can use a custom replacer function to convert undefined values to null.

One more limitation with JSON.stringify() is that it does not work if the object or array contains functions or circular references. For example, if the object contains a function, it will be converted to null. If the object contains a circular reference, it will throw an error. There are other issues with converting objects to JSON strings, you can read more about them [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description).

```javascript
const obj1 = { a: 1, b: 2 }
const obj2 = { a: 1, b: 2 }

JSON.stringify(obj1) === JSON.stringify(obj2) // true

// Order of the keys matters
const obj3 = { b: 2, a: 1 }

JSON.stringify(obj1) === JSON.stringify(obj3) // false

// Undefined values are converted to null
const obj4 = { a: 1, b: undefined }
JSON.stringify(obj4) // "{"a":1}"

const obj5 = { a: 1 }
JSON.stringify(obj5) // "{"a":1}"

JSON.stringify(obj4) === JSON.stringify(obj5) // true

// Functions are converted to null

const obj6 = {
  a: 1,
  b: function () {
    console.log('hello')
  },
}

JSON.stringify(obj6) // "{"a":1}"
```

---

#### 4. Custom object and array comparison function

Let's implement a custom object and array comparison function. We will use recursion to implement the comparison function.

I wrote this function as an [Exercise "2628. JSON Deep Equal" from LeetCode](https://leetcode.com/problems/json-deep-equal/description/)

```javascript
/**
 * @param {null|boolean|number|string|Array|Object} o1
 * @param {null|boolean|number|string|Array|Object} o2
 * @return {boolean}
 */
function areDeeplyEqual(o1, o2) {
  // 1. Primitive values - if strictly equal, return true
  if (o1 === o2) return true
  // 2. Null values - if either object is null, they are not equal
  if (o1 === null || o2 === null) return false
  // 4. If not object, compare directly
  if (typeof o1 !== 'object') {
    return o1 === o2
  }

  // 5. Arrays - if one is array and other is not, they are not equal
  if (Array.isArray(o1) || Array.isArray(o2)) {
    if (!Array.isArray(o1) || !Array.isArray(o2)) return false
    // If arrays have different lengths, they are not equal
    if (o1.length !== o2.length) return false
    // Compare each element of the arrays
    for (let i = 0; i < o1.length; i++) {
      if (!areDeeplyEqual(o1[i], o2[i])) return false
    }
  }

  // 6. Objects - if objects have different number of keys, they are not equal
  if (Object.keys(o1).length !== Object.keys(o2).length) return false
  // Compare each key-value pair of the objects
  for (const [key, value] of Object.entries(o1)) {
    if (!o2.hasOwnProperty(key)) return false
    if (!areDeeplyEqual(value, o2[key])) return false
  }

  return true
}
```

This function is not perfect, it has some limitations.
But it works for most cases. It was a good exercise to implement this function because it helped me understand how deep equality works in Javascript.

---

### Performance comparison

I was curious to see how these methods compare in terms of performance. So I wrote a simple function for generating random objects with huge number of keys and values.

```javascript
/**
 * @param {number} size
 * @return {Object}
 */
function generateHugeObject(size) {
  const obj = {}
  for (let i = 0; i < size; i++) {
    // toString(36) converts the number to base 36 (0-9a-z)
    // substring(2, 12) removes the first two characters (0.)
    const key = Math.random().toString(36).substring(2, 12)
    obj[key] = Math.random().toString(36).substring(2, 12)
  }
  return obj
}
```

Then I wrote a simple function to compare two objects using each of the methods. I used the [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) method to measure the time taken by each method.
The results of this method are not very accurate and may vary from machine to machine, but it is good enough for our purpose.

```javascript
let startFastDeepEqual = performance.now()
equal(obj1, obj2) // true
let timeTakenFastDeepEqual = performance.now() - startFastDeepEqual

let startLodash = performance.now()
isEqual(obj1, obj2) // true
let timeTakenLodash = performance.now() - startLodash

let startNodeAssert = performance.now()
assert.deepStrictEqual(obj1, obj2) // true
let timeTakenNodeAssert = performance.now() - startNodeAssert

let startJSONStringify = performance.now()
JSON.stringify(obj1) === JSON.stringify(obj2) // true
let timeTakenJSONStringify = performance.now() - startJSONStringify

let startCustom = performance.now()
areDeeplyEqual(obj1, obj2) // true
let timeTakenCustom = performance.now() - startCustom

console.log(`FastDeepEqual: ${timeTakenFastDeepEqual}`)
console.log(`Lodash: ${timeTakenLodash}`)
console.log(`Node Assert: ${timeTakenNodeAssert}`)
console.log(`JSON.stringify: ${timeTakenJSONStringify}`)
console.log(`Custom: ${timeTakenCustom}`)
```

I ran this code with different sizes of objects and got the following results:

| Size of object | FastDeepEqual | Lodash   | Node Assert | JSON.stringify | Custom    |
| -------------- | ------------- | -------- | ----------- | -------------- | --------- |
| 100            | 0.0731        | 0.4316   | 0.0167      | 0.0202         | 0.2763    |
| 1000           | 0.2522        | 0.5901   | 0.3884      | 0.1584         | 0.5741    |
| 10000          | 2.3789        | 3.0968   | 3.0775      | 2.7993         | 7.3304    |
| 100000         | 30.8043       | 52.8975  | 37.6808     | 33.9532        | 56.0962   |
| 500000         | 173.8129      | 200.1934 | 219.5169    | 311.2552       | 448.4530  |
| 1000000        | 398.3462      | 455.5247 | 531.1270    | 736.3083       | 1085.5547 |

Graphical representation of the results:
![Graphical representation of performance comparison of different methods of object comparison](/blog-assets/compare-objects/performance-object-comparison.png)

Obviously, my implementation is not optimized. Does anyone know how to improve it? Please let me know if you have any suggestions.
Anyway, it was an interesting experiment, I learned how to use the performance.now() method and how to compare objects and arrays in Javascript.

I hope this article was helpful to you. Thanks for reading!

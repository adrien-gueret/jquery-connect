# jquery-connect
Easily connect your jQuery code to stores like Redux.
Flexible and very small.

## Installation

### In the browser
The easiest way to use _jquery-connect_ is to include it with a [<script> tag](https://unpkg.com/jquery-connect):

```html
<script src="https://unpkg.com/jquery-connect"></script>
```

This file is already compiled into ES5 and [will work in any modern browers](https://caniuse.com/#feat=es5).

### Via npm
_jquery-connect_ is also avalaible through npm:

```
yarn add jquery-connect
```

You can then import it in your code:

```js
import 'jquery-connect';
```

**As a side-effect library, _jquery-connect_ will be executed as soon as it'll be included in your code.** Please be sure that jQuery is included before it.

_jquery-connect_ is a [jQuery](https://jquery.com/) plugin: that means it requires jQuery to work.  
It supports jQuery v1.7.0 and higher.

## Usage

### Basics

_jquery-connect_ provides a `connect` method to jQuery objects:

```js
$('#foo').connect(/* ... */);
```

With _jquery-connect_, you connect a jQuery object to a **render function** with a **store**:

```js
$('#foo').connect(myRenderFunction, myStore);
```

#### About the rendering function

`myRenderFunction` is a simple function you define. It's called in the context of the corresponding DOM element, so the keyword `this` refers to the element:

```js
function myRenderFunction() {
  $(this).text('I am rendered!');
}
```

`myRenderFunction` will be fired everytime _jquery-connect_ detects a change in the connected store.

#### About the store

The store is an object handling a part of your application state. The common way to use stores is via [Redux](https://redux.js.org/introduction/getting-started):

```js
const myStore = Redux.createStore(/* ... */);
```

Even if this plugin has been built with Redux in mind, **it is not required**. It will work as soon as the store you provide exposes these three methods:

- `subscribe(renderFunction)` 
- `getState()` 
- `dispatch(action)` 

### Hello World

```js
$(function() {
  // A function returning a static name
  function getName() {
    return 'World'; // Try updating this value!
  }
  
  // Create a Redux store from the above function
  const helloStore = Redux.createStore(getName);
  
  // Define a rendering function
  function renderHello(name) {
    $(this).text('Hello ' + name + '!');
  }
  
  // Connect a jQuery object to our rendering function with our store
  $('#hello').connect(renderHello, helloStore);
});

```

[See on CodePen](https://codepen.io/adrien-gueret/pen/qBbjNLV)

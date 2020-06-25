# jquery-connect
Easily connect your jQuery code to stores like Redux.  
Flexible and very small.

## Installation

### In the browser
The easiest way to use _jquery-connect_ is to include it with a [`<script>` tag](https://unpkg.com/jquery-connect):

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

`myRenderFunction` will be fired at init and everytime _jquery-connect_ detects a change in the connected store.

#### About the store

The store is an object handling a part of your application state. The common way to use stores is via [Redux](https://redux.js.org/introduction/getting-started):

```js
const myStore = Redux.createStore(/* ... */);
```

Even if this plugin has been built with Redux in mind, **it is not required**. It will work as soon as the store you provide exposes these three methods:

- `subscribe(renderFunction)` 
- `getState()` 
- `dispatch(action)` 

#### What does "render" mean in _jquery-connect_?

The rendering function you provide to `connect()` method will be fired **everytime** a render is required. Basically, "render" means "run the rendering function".

A render is required at init and everytime _jquery-connect_ detects a change in the connected store.

#### Connect an element to some parts of the store

If your application is big, chances are it's the same for your stores.  
First, remember you can use multiple stores, no needs to have only one. **Please only remember that elements can be connected to only one store**.

Anyway, an element connected to a store will be rendered everytimes a change occurs in its connected store. If the rendering function uses only some values from the store and not all of them, it's a waste of resources to call it again.

Here comes to play the mapper function. `connect()` method indeed accepts as third parameter a function. This function takes as argument the whole state of the connected store, and its returned value will be send to the rendering function:

```js
// myRenderFunction will only receive { foo, bar } as argument instead of the whole state
$('#foo').connect(myRenderFunction, myStore, function (state) {
  return {
    foo: state.foo,
    bar: state.bar,
  };
});
```

By doing that, the elements are connected only to the provided parts of the state. In the above example, it means that `myRenderFunction` will be called only if properties `foo` and `bar` are updated. If another value from the state is update, the element won't be re-rendered.

## Examples

### Hello World

The simplest (and useless) example:

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

[Edit on CodePen](https://codepen.io/adrien-gueret/pen/qBbjNLV)

### Connected form

A more concrete example with an actual reducer and dispatched actions:

```js
$(function() {
  // The reducer handling the state
  function reducer(state = 'World', action) {
    if (action.type === 'set') {
      return action.payload;
    }
    
    return state;
  }
  
  // Create a Redux store from the above reducer
  const helloStore = Redux.createStore(reducer);
  
  // Define a rendering function
  function renderHello(name) {
    $(this).text('Hello ' + name + '!');
  }
  
  // Connect a jQuery object to our rendering function with our store
  $('#hello').connect(renderHello, helloStore);
  
  // Init field value with store state
  $('#field').val(helloStore.getState());
  
  // On form submit, dispatch field value to set the new state
  $('#form').submit(function(e) {
    e.preventDefault();
    helloStore.dispatch({
      type: 'set',
      payload: $('#field').val(),
    });
  });
});
```

[Edit on CodePen](https://codepen.io/adrien-gueret/pen/JjGJKgM)

### Connect mutliple elements to same store

This example is the same than the previous one, except it shows we can connect a store to multiple elements to make ou life easier:

```js
$(function() {
  /* ... */
  
  // Connect the paragraph
  $('#hello').connect(renderHello, helloStore);
  
  // Connect the field to the same store
  $('#field').connect(renderField, helloStore);
  
  /* ... */
  
  // When clicking on "fraise" button, dispatch "Fraise" to set the state
  $('#fraise').click(function() {
    helloStore.dispatch({
      type: 'set',
      payload: 'Fraise',
    });
    
    // No needs to manually set the value of the field here!
  });
});
```

[See full code on CodePen](https://codepen.io/adrien-gueret/pen/zYrzKvE)

###  Connect elements to some parts of the store

This example show how to provide a function as third parameter to connect elements to only parts of the store state:

```js
$(function() {
  /* ... */
  
  // This figure is only connected to the "color" property of the store
  $('#figure-color').connect(renderFigureColor, store, function (state) {
    return state.color;
  });
  
  // This figure is only connected to the "shape" property of the store
  $('#figure-shape').connect(renderFigureShape, store, function (state) {
    return state.shape;
  });
  
  /* ... */
});
```

[See full code on CodePen](https://codepen.io/adrien-gueret/pen/KKVqgNg)

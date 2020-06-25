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
Please check [the corresponding example](#connect-elements-to-some-parts-of-the-store) to know more about this feature.

### Advanced

#### Warnings with the rendering function

It's very important to understand that the rendering function will be triggered as it is on each render. It means that if we listen for some events in the rendering function, **these events will be listened one more time on each render**.  
Basically, if we do that:

```js
// This is NOT ok!
function myRenderFunction(value) {
  $(this).click(function() { alert(value); });
}
```
Each time the connected element will be rendered, a click listener will be attached: the `alert` will therefore be triggered too many times! [This example on CodePen](https://codepen.io/adrien-gueret/pen/PoZjXvP) illustrates the issue.

The easiest solution to fix the problem is to simply remove the click listener before attaching a new one (like the second button in the example from the above link);

```js
// This is ok
function myRenderFunction(value) {
  $(this).off('click').click(function() { alert(value); });
}
```

But sometimes, it could be trickier: maybe we want to define a `window.setInterval` or perform an API call. In that case, we may need to use `sideEffect`.

#### Using `sideEffect`

The `connect()` method can be called with `'sideEffect'` as first argument. In that case, its second argument must be a function:

```js
function renderingFunction() {
  $(this).connect('sideEffect', function() { /* ... */ });
}
```

This function will called in the same context than the rendering function, meaning that `this` still refers to the DOM element. 
**But above all, this function will be run only once, during the first render**.

```js
function renderingFunction() {
  $(this).connect('sideEffect', function() { alert('You will see me only once!'); });
}
```

When calling `connect()` with `sideEffect`, it also possible to send a third argument: `dependencies`. It could be any primitive values or an array of values.  
When providing dependencies, the `sideEffect` callback won't be called only once, but at each render **if and only if the dependencies have changed**:

```js
function renderingFunction({ foo, bar }) {
  $(this).connect('sideEffect', function() {
    console.log('Foo has changed! New value:', foo);
  }, foo);
}
```

If the `sideEffect` callback returns a function, **this function will be automatically called before next render**:

```js
function renderingFunction({ foo, bar }) {
  $(this).connect('sideEffect', function() {
    console.log('Foo has changed! New value:', foo);
    
    return function() {
      console.log('Foo will change! Old value:', foo);
    };
  }, foo);
}
```

**Please also note you can call `sideEffect` only from a rendering function**. It will throw if you try to call it outside.

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

This example shows how to provide a function as third parameter to connect elements to only parts of the store state:

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

###  Using `sideEffect`

This example shows how to use `sideEffect` to not execute some code on each render:

```js
$(function() {
  /* ... */
  
  function renderSayHello4(value) {
    // 
    $(this).connect('sideEffect', function () {
      const sayHello = getSayHello(value);
      
      $(this).click(sayHello);
      
      return function() {
        $(this).off('click', sayHello);
      };
    }, value);
  }
  
  /* ... */
});
```

[See full code on CodePen](https://codepen.io/adrien-gueret/pen/PoZjXvP)



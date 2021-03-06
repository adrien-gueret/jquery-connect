<p align="center">
  <img src="https://raw.githubusercontent.com/adrien-gueret/jquery-connect/master/src/jquery-connect.png" alt="jquery-connect logo" width="150" />
</p>

<h1 align="center">jquery-connect</h1>

Easily connect your jQuery code to stores like Redux.  
Flexible and very small.

- [Installation](#installation)
  - [In the browser](#in-the-browser)
  - [Via npm](#via-npm)
- [Usage](#usage)
  - [About the rendering function](#about-the-rendering-function)
  - [About the store](#about-the-store)
  - [What does "render" mean in _jquery-connect_?](#what-does-render-mean-in-jquery-connect)
  - [Connect an element to some parts of the store](#connect-an-element-to-some-parts-of-the-store)
  - [Dispatch actions from rendering function](#dispatch-actions-from-rendering-function)
  - [Warnings with the rendering function](#warnings-with-the-rendering-function)
  - [Calling `connect()` with `sideEffect`](#calling-connect-with-sideeffect)
- [Examples](#examples)
  - [Hello World](#hello-world)
  - [Connected form](#connected-form)
  - [Connect multiple elements to same store](#connect-multiple-elements-to-same-store)
  - [Using `sideEffect`](#using-sideeffect)
  - [Calling an API](#calling-an-api)
  
## Installation

### In the browser
The easiest way to use _jquery-connect_ is to include it with a [`<script>` tag](https://unpkg.com/jquery-connect):

```html
<script src="https://unpkg.com/jquery-connect"></script>
```

This file is already compiled into ES5 and [will work in any modern browsers](https://caniuse.com/#feat=es5).

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

_jquery-connect_ provides a `connect` method to jQuery objects:

```js
$('#foo').connect(/* ... */);
```

With _jquery-connect_, you connect a jQuery object to a **render function** with a **store**:

```js
$('#foo').connect(myRenderFunction, myStore);
```

### About the rendering function

`myRenderFunction` is a simple function you define. It's called in the context of the corresponding DOM element, so the keyword `this` refers to the element:

```js
function myRenderFunction() {
  $(this).text('I am rendered!');
}
```

`myRenderFunction` will be fired at init and every time _jquery-connect_ detects a change in the connected store.

### About the store

The store is an object handling a part of your application state. The common way to use stores is via [Redux](https://redux.js.org/introduction/getting-started):

```js
const myStore = Redux.createStore(/* ... */);
```

Even if this plugin has been built with Redux in mind, **it is not required**. It will work as soon as the store you provide exposes these three methods:

- `subscribe(renderFunction)` 
- `getState()` 
- `dispatch(action)` 

### What does "render" mean in _jquery-connect_?

The rendering function you provide to `connect()` method will be fired **every time** a render is required. Basically, "render" means "run the rendering function".

A render is required at init and every time _jquery-connect_ detects a change in the connected store.

### Connect an element to some parts of the store

If your application is big, chances are it's the same for your stores.  
First, remember you can use multiple stores, no needs to have only one. **Please only remember that elements can be connected to only one store**.

Anyway, an element connected to a store will be rendered every time a change occurs in its connected store. If the rendering function uses only some values from the store and not all of them, it's a waste of resources to call it again.

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

### Dispatch actions from rendering function

Instead of calling directly `store.dispatch()` from the rendering function, it's better to use the mapper function to inject `dispatch`:

```js
// The mapper function receives dispatch function as second argument
$('#foo').connect(myRenderFunction, myStore, function (state, dispatch) {
  return {
    foo: state.foo,
    onSomeEvent: (bar) => dispatch({ type: 'whatever', payload: bar });
  };
});

function myRenderFunction({ foo, onSomeEvent }) {
  /* ... */
  // Calling onSomeEvent('fraise'); will then dispatch action { type: 'whatever', payload: 'fraise' }
  /* ... */
}
```

By doing like this, you don't tie your rendering function to a specific store, meaning it'll be easier to reuse it if needed.

### Warnings with the rendering function

It's very important to understand that the rendering function will be triggered as it is on each render. It means that if we listen for some events in the rendering function, **these events will be listened one more time on each render**.  
Basically, if we do that:

```js
// This is NOT ok!
function myRenderFunction(value) {
  $(this).click(function() { alert(value); });
}
```
Each time the connected element will be rendered, a click listener will be attached: the `alert` will therefore be triggered too many times! [This example on CodePen](https://codepen.io/adrien-gueret/pen/PoZjXvP) illustrates the issue.

The easiest solution to fix the problem is just to remove the click listener before attaching a new one (like the second button in the example from the above link):

```js
// This is ok
function myRenderFunction(value) {
  $(this).off('click').click(function() { alert(value); });
}
```

But sometimes, it could be trickier: maybe we want to define a `window.setInterval` or perform an API call. In that case, we may need to use `sideEffect`.

### Calling `connect()` with `sideEffect`

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
[See full example on CodePen](https://codepen.io/adrien-gueret/pen/eYJRxqa)

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

### Connect multiple elements to same store

This example is the same than the previous one, except that it shows we can connect a store to multiple elements to make ou life easier:

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

This example shows how to provide a function as third parameter to connect elements to some parts of the store state:

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

This example shows how `sideEffect` works:

```js
$(function() {
  /* ... */
  
  function renderField(value) {
    $(this)
      .val(value)
      .connect('sideEffect', function() {
        console.log('Value has changed! New value:', value);
    
        return function() {
          console.log('Value will change! Old value:', value);
        };
      }, value);
  }
  
  /* ... */
});
```

[See full code on CodePen](https://codepen.io/adrien-gueret/pen/eYJRxqa)

###  Calling an API

Calling an external API from the rendering function should be done with `sideEffect`:

```js
$(function() {
  /* ... */
  
  function renderGames({ search, onRequestEnd }) {
    const $this = $(this);
    
    // Use sideEffect to be sure we try to call the API only when "search" is updated
    $this.connect('sideEffect', function() {
      if (!search) {
        $this.html('<li>Please search for a game</li>');
      } else {
        getGames(search).then(function (games) {
          // Call function received from props and send total of games
          onRequestEnd(games.length);
          
          if (!games.length) {
            $this.html('<li>No results found</li>');
            return;
          }

          $this.html(games.map(function (game) {
            return (
              `<li class="game">
                <img src="${game.image_url}" alt="" />
                <b>${game.name}</b>
              </li>`
            );
          }));
        }); 
      }
      
      // The returned function of sideEffect will be called before next render.
      // In our case, it'll be just before performing another search.
      // Try slower your Internet speed to see the loading after submiting the form!
      return function () {
        $this.html('<li>Loading...</li>');
      };
    }, search);
  };
  
  /* ... */
});
```

[See full code on CodePen](https://codepen.io/adrien-gueret/pen/MWKoxwd)

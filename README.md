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

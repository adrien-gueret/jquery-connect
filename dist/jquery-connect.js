function getInitAction(renderFunction) {
  var mapStateToProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var store = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (!mapStateToProps) {
    throw new Error('$.fn.connect: no mapStateToProps provided');
  }

  if (!store) {
    throw new Error('$.fn.connect: no store provided');
  }

  var $ = window.jQuery;
  return function () {
    var that = this;
    var $element = $(that);
    var bindedMapStateToProps = mapStateToProps.bind(that);
    var dispatch = store.dispatch.bind(store);
    var oldProps = undefined;

    function render() {
      var forceRender = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var state = store.getState();
      var props = bindedMapStateToProps(state, dispatch);
      var shouldForceRender = forceRender || oldProps === undefined;
      var shouldRender = shouldForceRender || !shallowEqual(props, oldProps);

      if (!shouldRender) {
        return;
      }

      oldProps = props === undefined ? null : props;
      $element.data('jConnect_sideEffectsCounter', 0);
      renderFunction.bind($element)(props);
      $element.removeData('jConnect_sideEffectsCounter');
    }

    $element.data({
      jConnect_sideEffects: [],
      jConnect_render: render
    });
    store.subscribe(render);
    return render();
  };
}
function getRerenderAction() {
  var $ = window.jQuery;
  return function () {
    $(this).data('jConnect_render')(true);
  };
}

;
function getSideEffectAction(sideEffectCallback, dependencies) {
  var $ = window.jQuery;
  return function () {
    var $element = $(this);
    var sideEffectsCounter = $element.data('jConnect_sideEffectsCounter');

    if (sideEffectsCounter === undefined) {
      throw new Error('$.fn.connect: cannot call "sideEffect" outside $.fn.connect lifeccycle.');
    }

    var sideEffects = $element.data('jConnect_sideEffects');

    if (!(sideEffectsCounter in sideEffects) || !shallowEqual(sideEffects[sideEffectsCounter].depenencies, dependencies)) {
      if (sideEffects[sideEffectsCounter] && sideEffects[sideEffectsCounter].callback) {
        sideEffects[sideEffectsCounter].callback.bind(this)();
      }

      sideEffects[sideEffectsCounter] = {
        dependencies: dependencies,
        callback: sideEffectCallback.bind(this)()
      };
    }

    $element.data('jConnect_sideEffectsCounter', sideEffectsCounter + 1);
  };
}
(function ($) {
  $.fn.connect = function (arg1, arg2, arg3) {
    var callbackToApply;

    if (typeof arg1 === 'function') {
      callbackToApply = getInitAction(arg1, arg2, arg3);
    } else {
      switch (arg1) {
        case 'rerender':
          callbackToApply = getRerenderAction();
          break;

        case 'sideEffect':
          callbackToApply = getSideEffectAction(arg2, arg3);
          break;

        default:
          throw new Error("$.fn.connect: do not recognize action \"".concat(arg1, "\""));
          break;
      }
    }

    return this.each(callbackToApply);
  };
})(window.jQuery);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  }

  if (typeof x === 'function' && typeof y === 'function') {
    return x.toString() === y.toString();
  }

  return x !== x && y !== y;
}

function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (_typeof(objA) !== 'object' || objA === null || _typeof(objB) !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (var i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

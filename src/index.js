import getInitAction from './actions/init';
import getRerenderAction from './actions/rerender';
import getSideEffectAction from './actions/sideEffect';

window.jQuery.fn.connect = function(arg1, arg2, arg3) {
    let callbackToApply;

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
                throw new Error(`$.fn.connect: do not recognize action "${arg1}"`);
            break;
        }
    }

    return this.each(callbackToApply);
};

import $ from 'jquery';

import shallowEqual from '../utils/shallowEqual';

export default function getSideEffectAction(sideEffectCallback, dependencies) {
    return function() {
        const $element = $(this);
        const sideEffectsCounter = $element.data('jConnect_sideEffectsCounter');

        if (sideEffectsCounter === undefined) {
            throw new Error('$.fn.connect: cannot call "sideEffect" outside $.fn.connect lifeccycle.');
        }

        const sideEffects = $element.data('jConnect_sideEffects');

        if (!(sideEffectsCounter in sideEffects) || !shallowEqual(sideEffects[sideEffectsCounter].depenencies, dependencies)) {
            if (sideEffects[sideEffectsCounter] && sideEffects[sideEffectsCounter].callback) {
                sideEffects[sideEffectsCounter].callback.bind(this)();
            }

            sideEffects[sideEffectsCounter] = {
                dependencies: dependencies,
                callback: sideEffectCallback.bind(this)(),
            };
        }

        $element.data('jConnect_sideEffectsCounter', sideEffectsCounter + 1);
    };
}
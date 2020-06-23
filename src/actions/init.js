import $ from 'jquery';

import shallowEqual from '../utils/shallowEqual';

export default function getInitAction(renderFunction, mapStateToProps = null, store = null) {
    if (!mapStateToProps) {
        throw new Error('$.fn.connect: no mapStateToProps provided');
    }

    if (!store) {
        throw new Error('$.fn.connect: no store provided');
    }

    return function () {
        const that = this;
        const $element = $(that);
        const bindedMapStateToProps = mapStateToProps.bind(that);

        const dispatch = store.dispatch.bind(store);
        let oldProps = undefined;

        function render(forceRender = false) {
            const state = store.getState();
            const props = bindedMapStateToProps(state, dispatch);
            const shouldForceRender = forceRender || oldProps === undefined;
            const shouldRender = shouldForceRender || !shallowEqual(props, oldProps);

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
            jConnect_render: render,
        });

        store.subscribe(render);
        return render();
    };
}

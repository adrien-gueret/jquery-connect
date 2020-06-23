import $ from 'jquery';

export default function getRerenderAction() {
    return function() {
        $(this).data('jConnect_render')(true);
    };
};
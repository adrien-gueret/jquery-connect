function getRerenderAction() {
    const $ = window.jQuery;
    
    return function() {
        $(this).data('jConnect_render')(true);
    };
};
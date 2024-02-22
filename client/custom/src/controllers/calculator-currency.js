define('custom:controllers/calculator-currency', ['controllers/preferences'], function (Dep) {

    return Dep.extend({

        getViewName: function (type) {
            return 'custom:views/calculator-currency/edit';
        },
    });
});

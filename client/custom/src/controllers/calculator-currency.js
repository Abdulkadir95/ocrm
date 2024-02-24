define('custom:controllers/calculator-currency', ['controllers/record', 'model'], function (Dep, Model) {

    return Dep.extend({

        defaultAction: 'own',

        getModel(callback, context) {
            const model = new Model();

            model.name = model.entityType  = 'CalculatorCurrency';
            model.urlRoot = 'Preferences';

            model.setDefs({
                fields: {
                    rate: {
                        type: 'currency',
                        label: 'Rate',
                        required: true,
                        "onlyDefaultCurrency": true
                    },
                    currency1: {
                        type: 'currency',
                        label: 'Currency 1',
                        required: true
                    },
                    currency2: {
                        type: 'currency',
                        label: 'Currency 2',
                        required: true
                    },
                    calculation: {
                        type: 'base',
                        label: 'Calculation',
                        required: true,
                        view: "custom:views/calculator-currency/fields/calculation"
                    }
                }
            });

            if (callback) {
                callback.call(this, model);
            }

            return new Promise(resolve => {
                resolve(model);
            });
        },

        actionOwn() {
            this.actionEdit({id: this.getUser().id});
        },

        actionList() {
        },

        getViewName: function (type) {
            return 'custom:views/calculator-currency/edit';
        },
    });
});

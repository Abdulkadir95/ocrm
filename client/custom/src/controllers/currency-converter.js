define('custom:controllers/currency-converter', ['controllers/record', 'model'], function (Dep, Model) {

    return Dep.extend({

        defaultAction: 'own',

        getModel(callback, context) {
            const model = new Model();

            model.name = model.entityType  = 'CurrencyConverter';
            model.urlRoot = 'Preferences';

            model.defs = this.getMetadata().get('entityDefs.CurrencyConverter');

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
            return 'custom:views/currency-converter/edit';
        },
    });
});

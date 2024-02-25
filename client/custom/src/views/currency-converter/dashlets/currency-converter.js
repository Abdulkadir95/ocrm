define('custom:views/currency-converter/dashlets/currency-converter', ['views/dashlets/abstract/base', 'model'], function (Dep, Model) {
    return Dep.extend({

        name: 'CurrencyConverter',

        templateContent: `<div class="record">{{{record}}}</div>`,

        afterRender() {
            Dep.prototype.afterRender.call(this);

            const model = new Model();

            model.name = 'CalculatorCurrency';
            model.entityType = 'CalculatorCurrency';
            model.urlRoot = 'CalculatorCurrency';

            model.defs = this.getMetadata().get('entityDefs.CurrencyConverter');

            this.createView('record', 'views/record/edit-for-modal', {
                scope: 'CalculatorCurrency',
                selector: '.record',
                model: model,
                detailLayout: [
                    {
                        "label": "Calculator",
                        "rows": [
                            [{"name": "rate"}],
                            [{"name": "currency1"}],
                            [{"name": "currency2"}],
                            [{"name": "calculation", "noLabel": true}]
                        ]
                    }
                ]
            }, view => {
                view.render();
            })
        },
    })
});



define('custom:views/dashlets/currency-converter', ['views/dashlets/abstract/base', 'model'], function (Dep, Model) {
    return Dep.extend({

        name: 'CurrencyConverter',

        templateContent: `<div class="record">{{{record}}}</div>`,

        afterRender() {
            Dep.prototype.afterRender.call(this);

            const model = new Model();

            model.name = 'CalculatorCurrency';
            model.entityType = 'CalculatorCurrency';
            model.urlRoot = 'CalculatorCurrency';

            model.setDefs({
                fields: {
                    rate: {
                        type: 'currency',
                        label: 'Rate',
                        "onlyDefaultCurrency": true
                    },
                    currency1: {
                        type: 'currency',
                        label: 'Currency 1',
                        defaultCurrency: 'USD',
                        default: 0
                    },
                    currency2: {
                        type: 'currency',
                        label: 'Currency 2',
                        defaultCurrency: 'USD',
                        default: 0
                    },
                    calculation: {
                        type: 'base',
                        label: 'Calculation',
                        view: "custom:views/calculator-currency/fields/calculation"
                    }
                }
            });

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



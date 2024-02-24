define('custom:views/calculator-currency/record/edit', ['views/record/edit'], function (Dep) {
    return Dep.extend({

        buttonList: [],

        buttonsDisabled: true,

        setupActionItems() {
        },

        detailLayout: [
            {
                "label": "Calculator",
                "rows": [
                    [{"name": "rate"}, false],
                    [{"name": "currency1"}, false],
                    [{"name": "currency2"}, false],
                    [{"name": "calculation", "noLabel": true}]
                ]
            }
        ]
    });
});

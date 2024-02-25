define('custom:views/calculator-currency/record/edit', ['views/record/edit-for-modal'], function (Dep) {
    return Dep.extend({

        isWide: false,

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

define('custom:views/currency-converter/edit', ['views/edit'], function (Dep) {

    return Dep.extend({

        getHeader: function () {
            return this.buildHeaderHtml([
                $('<span>').text(this.translate('Calculator Currency'))
            ]);
        },

        getRecordViewName: function () {
            return 'custom:views/currency-converter/record/edit';
        },
    });
});
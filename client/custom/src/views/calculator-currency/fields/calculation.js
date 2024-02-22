define('custom:views/calculator-currency/fields/calculation', ['views/fields/base'], function (Dep) {
    return Dep.extend({

        readOnly: true,

        templateContent:
            '<button class="btn btn-default disabled" data-action="calculation"> Calculate </button>',

        events: {
            'click [data-action="calculation"]': function () {
                this.calculation();

            },
        },

        fetch: function () {
            return {};
        },

        checkAvailability: function () {
            if (this.model.get('currency1') && this.model.get('rate')) {
                this.$el.find('button').removeClass('disabled').removeAttr('disabled');
            } else {
                this.$el.find('button').addClass('disabled').attr('disabled', 'disabled');
            }
        },

        afterRender: function () {
            this.checkAvailability();

            this.listenTo(this.model, 'change', () => {
                this.checkAvailability();
            });
        },

        calculation: function () {
            const baseCurrency = this.model.get('rateCurrency');
            const currency1 = this.model.get('currency1') || 0;
            const rate = this.model.get('rate');

            if (rate) {
                if (this.model.get('currency1Currency') === baseCurrency) {
                    this.model.set('currency2', currency1 * rate);
                }

                if (this.model.get('currency2Currency') === baseCurrency) {
                    this.model.set('currency2', currency1 / rate);

                }
            }
        },
    });
});

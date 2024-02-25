define('custom:views/currency-converter/fields/calculation', ['views/fields/base'], function (Dep) {
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
            if ((this.model.get('currency1') || this.model.get('currency2')) && this.model.get('rate')) {
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
            const currency2 = this.model.get('currency2') || 0;
            const currency1Currency = this.model.get('currency1Currency') || baseCurrency;
            const currency2Currency = this.model.get('currency2Currency') || baseCurrency;
            const rate = this.model.get('rate');

            if (rate) {
                if (currency1Currency === baseCurrency) {
                    if (currency1 === 0 && currency2 > 0) {
                        this.model.set('currency1', currency2 / rate);
                    } else {
                        this.model.set('currency2', currency1 * rate);
                    }
                }

                if (currency2Currency === baseCurrency) {
                    if (currency2 === 0 && currency1 > 0) {
                        this.model.set('currency2', currency1 * rate);
                    } else {
                        this.model.set('currency1', currency2 / rate);
                    }
                }
            }
        },
    });
});


define('advanced:views/bpmn-flowchart-element/fields/call-activity-target', 'views/fields/enum', function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            var data = this.getTargetOptionsData();

            this.params.options = data.itemList;
            this.translatedOptions = data.translatedOptions;
        },

        getTargetOptionsData: function () {
            var targetOptionList = [''];

            var translatedOptions = {};

            translatedOptions[''] = this.translate('Current', 'labels', 'Workflow') +
                ' (' + this.translate(this.model.targetEntityType, 'scopeNames') + ')';

            var list = this.model.elementHelper.getTargetCreatedList();

            list.forEach(item => {
                targetOptionList.push(item);
                translatedOptions[item] = this.model.elementHelper.translateTargetItem(item);
            });

            var linkList = this.model.elementHelper.getTargetLinkList(2, false, this.skipParent);

            linkList.forEach(item => {
                targetOptionList.push(item);
                translatedOptions[item] = this.model.elementHelper.translateTargetItem(item);
            });

            return {
                itemList: targetOptionList,
                translatedOptions: translatedOptions,
            };
        },

    });
});

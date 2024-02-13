
define('advanced:views/bpmn-flowchart-element/fields/message-related-to', ['views/fields/enum'], function (Dep, From) {

    return Dep.extend({

        fetchEmptyValueAsNull: true,

        setupOptions: function () {
            var list = [''];
            var translatedOptions = {};

            if (this.getMetadata().get(['scopes', this.model.targetEntityType, 'object'])) {
                list.push('targetEntity');
            }

            var ignoreEntityTypeList = ['User', 'Email'];
            this.model.elementHelper.getTargetCreatedList().forEach(function (item) {
                var entityType = this.model.elementHelper.getEntityTypeFromTarget(item);
                if (~ignoreEntityTypeList.indexOf(entityType)) return;
                if (!this.getMetadata().get(['scopes', entityType, 'object'])) return;

                list.push(item);
                translatedOptions[item] = this.model.elementHelper.translateTargetItem(item);
            }, this);

            this.model.elementHelper.getTargetLinkList(2, false, false).forEach(function (item) {
                var entityType = this.model.elementHelper.getEntityTypeFromTarget(item);
                if (~ignoreEntityTypeList.indexOf(entityType)) return;
                if (!this.getMetadata().get(['scopes', entityType, 'object'])) return;

                list.push(item);
                translatedOptions[item] = this.model.elementHelper.translateTargetItem(item);
            }, this);

            this.params.options = list;

            translatedOptions[''] = this.translate('None');
            translatedOptions['targetEntity'] = this.getLanguage().translateOption('targetEntity', 'emailAddress', 'BpmnFlowchartElement') +
            ' (' + this.translate(this.model.targetEntityType, 'scopeNames') + ')';

            this.translatedOptions = translatedOptions;
        },
    });
});

define('advanced:views/bpmn-flowchart-element/fields/task-send-message-reply-to',
['views/fields/enum', 'advanced:views/bpmn-flowchart-element/fields/task-send-message-from'], function (Dep, From) {

    return Dep.extend({

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = Espo.Utils.clone(this.params.options);

            if (
                this.getMetadata()
                    .get(['entityDefs', this.model.targetEntityType, 'fields', 'emailAddress', 'type']) ===
                'email'
            ) {
                this.params.options.push('targetEntity');
            }

            let linkOptionList = From.prototype.getLinkOptionList.call(this, false, true);

            linkOptionList.forEach(item => {
                this.params.options.push(item);
            });

            From.prototype.translateOptions.call(this);
        },
    });
});

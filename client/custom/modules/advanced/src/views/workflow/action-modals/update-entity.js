
define('advanced:views/workflow/action-modals/update-entity',
[
    'advanced:views/workflow/action-modals/base',
    'advanced:views/workflow/action-modals/create-entity',
    'model'
],
function (Dep, CreateEntity, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/update-entity',

        data: function () {
            return _.extend({
                scope: this.scope,
            }, Dep.prototype.data.call(this));
        },

        events: {
            'click [data-action="addField"]': function (e) {
                var $target = $(e.currentTarget);
                var field = $target.data('field');

                if (!~this.actionData.fieldList.indexOf(field)) {

                    this.actionData.fieldList.push(field);
                    this.actionData.fields[field] = {};

                    this.addField(field, false, true);
                }
            },
            'click [data-action="removeField"]': function (e) {
                var $target = $(e.currentTarget);
                var field = $target.data('field');
                this.clearView('field-' + field);

                delete this.actionData.fields[field];

                var index = this.actionData.fieldList.indexOf(field);
                this.actionData.fieldList.splice(index, 1);

                $target.parent().remove();
            },
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.$fieldDefinitions = this.$el.find('.field-definitions');

            this.$formulaCell = this.$el.find('.cell[data-name="formula"]');

            (this.actionData.fieldList || []).forEach(function (field) {
                this.addField(field, this.actionData.fields[field]);
            }, this);

            if (this.hasFormulaAvailable) {
                this.$formulaCell.removeClass('hidden');
            } else {
                this.$formulaCell.addClass('hidden');
            }

            this.setupFormulaView();
        },

        setupFormulaView: function () {
            var model = new Model;

            if (this.hasFormulaAvailable) {
                model.set('formula', this.actionData.formula || null);

                this.createView('formula', 'views/fields/formula', {
                    name: 'formula',
                    model: model,
                    mode: this.readOnly ? 'detail' : 'edit',
                    height: 100,
                    el: this.getSelector() + ' .field[data-name="formula"]',
                    inlineEditDisabled: true,
                    targetEntityType: this.scope,
                }, view => {
                    view.render();
                });
            }
        },

        setupScope: function (callback) {
            var scope = this.entityType;
            this.scope = scope;

            this.getModelFactory().create(scope, model => {
                this.model = model;

                (this.actionData.fieldList || []).forEach(field => {
                    var attributes = (this.actionData.fields[field] || {}).attributes || {};

                    model.set(attributes, {silent: true});
                });

                callback();
            });

        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.hasFormulaAvailable = !!this.getMetadata().get('app.formula.functionList');

            this.wait(true);

            this.setupScope(() => {
                this.createView('addField', 'advanced:views/workflow/action-fields/add-field', {
                    el: this.options.el + ' .add-field-container',
                    scope: this.entityType,
                    fieldList: this.getFieldList(),
                });

                this.wait(false);
            });
        },

        addField: function (field, fieldData, isNew) {
            var fieldType = this.getMetadata().get('entityDefs.' + this.scope + '.fields.' + field + '.type') || 'base';
            var type = this.getMetadata().get('entityDefs.Workflow.fieldDefinitions.' + fieldType) || 'base';

            fieldData = fieldData || false;

            let escapedField = this.getHelper().escapeString(field);

            var fieldNameHtml = '<label>' + this.translate(escapedField, 'fields', this.scope) + '</label>';

            var removeLinkHtml = '<a role="button" tabindex="0" class="pull-right" ' +
                'data-action="removeField" data-field="' + escapedField + '"><span class="fas fa-times"></span></a>';

            var html = '<div class="margin clearfix field-row" ' +
                'data-field="' + escapedField + '" style="margin-left: 20px;">' + removeLinkHtml + fieldNameHtml +
                '<div class="field-container field" data-field="' + escapedField + '"></div></div>';

            this.$fieldDefinitions.append($(html));

            this.createView('field-' + field, 'advanced:views/workflow/field-definitions/' +
                Espo.Utils.camelCaseToHyphen(type), {
                el: this.options.el + ' .field-container[data-field="' + field + '"]',
                fieldData: fieldData,
                model: this.model,
                field: field,
                entityType: this.entityType,
                scope: this.scope,
                type: type,
                fieldType: fieldType,
                isNew: isNew
            }, view => {
                view.render();
            });
        },

        getFieldList: function () {
            return CreateEntity.prototype.getFieldList.call(this);
        },

        fetch: function () {
            var isValid = true;

            (this.actionData.fieldList || []).forEach(field => {
                isValid = this.getView('field-' + field).fetch();

                this.actionData.fields[field] = this.getView('field-' + field).fieldData;
            });

            if (this.hasFormulaAvailable) {
                var formulaView = this.getView('formula');

                if (formulaView) {
                    this.actionData.formula = formulaView.fetch().formula;
                }
            }

            return isValid;
        },
    });
});

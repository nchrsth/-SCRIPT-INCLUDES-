var PedidoFertilizantesUtils = Class.create();
PedidoFertilizantesUtils.prototype = {
    initialize: function () {
    },

    getData: function (catSysId) {

        var data = [];

        if (catSysId) {

            var grRequestedItems = new GlideRecord('sc_req_item');
            grRequestedItems.addEncodedQuery('cat_item=' + catSysId);
            grRequestedItems.orderBy('sys_created_on');
            grRequestedItems.query();
            var that = this;
            while (grRequestedItems.next()) {
                var obj = {};

                obj.sys_id = grRequestedItems.sys_id.toString();
                obj.number = grRequestedItems.number.toString();
                obj.short_description = grRequestedItems.short_description.toString();
                obj.description = grRequestedItems.description.toString();
                obj.requested_for = grRequestedItems.requested_for.getDisplayValue();
                obj.opened_at = grRequestedItems.opened_at.toString();
                obj.state = grRequestedItems.state.getDisplayValue();
                obj.variables = that.convertToJSON(grRequestedItems.sys_id.toString());

                data.push(obj);
            }

        }

        return data;
    },

    convertToJSON: function (ritmSysId) {
        var result = {};
        var gr = new GlideRecord('sc_req_item');
        if (gr.get(ritmSysId)) {
            var variables = {};
            gr.variables.getElements().forEach(function (variable) {
                if (variable.getGlideObject().type === 'GlideElementVariableSet') {
                    // Multi-Row Variable Set
                    variables[variable.getLabel()] = [];
                    var rows = variable.getValue().getRows();
                    while (rows.hasNext()) {
                        var row = rows.next();
                        var rowData = {};
                        row.getFields().forEach(function (field) {
                            rowData[field.getName()] = field.getDisplayValue();
                        });
                        variables[variable.getName()].push(rowData);
                    }
                } else {
                    // Single Variable
                    variables[variable.getName()] = variable.getDisplayValue();
                }
            });
            result = variables;
        }
        return result
    },

    type: 'PedidoFertilizantesUtils'
};

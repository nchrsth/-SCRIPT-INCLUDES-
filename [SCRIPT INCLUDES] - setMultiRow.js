
var produtos = data.produtos;
var grade_aprovacao = data.grade_aprovacao.aprovadores;
var rateios = data.rateios;

self.setMultiRow(rc.sys_id, "Pedido de Compra", produtos, 'produtos');
self.setMultiRow(rc.sys_id, "Pedido de Compra", rateios, 'rateios');
self.setMultiRow(rc.sys_id, "Pedido de Compra", grade_aprovacao, 'grade_aprovacao');


setMultiRow: function (reqSysId, item, data, name) {
		var grReqItem = new GlideRecord('sc_req_item');
		grReqItem.addEncodedQuery("request=" + reqSysId);
		grReqItem.query();

		while (grReqItem.next()) {
			if (item == "Bloqueio de Crédito") {
				grReqItem.variables.produtos = JSON.stringify(data);
			} else if (item == "Pedido de Compra") {
				if (name == 'produtos'){
					grReqItem.variables.produtos = JSON.stringify(data);
				}else if (name == 'rateios'){
					grReqItem.variables.rateios = JSON.stringify(data);
				}else if(name == 'grade_aprovacao'){
					grReqItem.variables.grade_aprovacao = JSON.stringify(data);
					grReqItem.u_generic = JSON.stringify(data);
				}
            }
        }
    }
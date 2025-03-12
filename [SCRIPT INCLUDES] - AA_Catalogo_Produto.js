var AA_Catalogo_Produto = Class.create();
AA_Catalogo_Produto.prototype = {

    execSyncCP: function() {
        try {
            var that = this;
            var r = new sn_ws.RESTMessageV2('Agro Amazônia', 'CatalogoProduto');
            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();
            var JSONResult = JSON.parse(responseBody);

            if (httpStatus == '200') {
                this.setDisabled();
                JSONResult.items.forEach(function(element) {
                    var findRec = that.checkRecord(element);
                    if (!findRec) {
                        that.addRecord(element);
                    } else {
                        that.updateRecord(element);
                    }

                });
            }
        } catch (ex) {
            gs.error(ex.message);
        }

    },

	checkRecord: function (element) {
		var gr = new GlideRecord('x_aapas_catalogo_0_catalogo_produtos');
		gr.addEncodedQuery('idproduto=' + element.idProduto);
		gr.query();
		if (gr.next()) {
			return true;
		}
		return false;
	},

    addRecord: function(element) {
        var gr = new GlideRecord('x_aapas_catalogo_0_catalogo_produtos');
        var that = this;
        gr.initialize();
        gr.idproduto = element.idProduto;
        gr.descricao = element.descricao;
        gr.principio_ativo = element.principio_ativo;
        gr.id_segmento = element.id_segmento;
        gr.marca = element.marca;
        gr.indicacao = element.indicacao;
        gr.caracteristica = element.caracteristica;
        gr.insert();
    },

    updateRecord: function(element) {
        var that = this;
        var gr = new GlideRecord('x_aapas_catalogo_0_catalogo_produtos');
        gr.addEncodedQuery('idproduto=' + element.idProduto);
        gr.query();
        if (gr.next()) {
            gr.idproduto = element.idProduto;
            gr.descricao = element.descricao;
            gr.principio_ativo = element.principio_ativo;
            gr.id_segmento = element.id_segmento;
            gr.marca = element.marca;
            gr.indicacao = element.indicacao;
            gr.caracteristica = element.caracteristica;
            gr.update();
        }
    },

    type: 'AA_Catalogo_Produto'
};
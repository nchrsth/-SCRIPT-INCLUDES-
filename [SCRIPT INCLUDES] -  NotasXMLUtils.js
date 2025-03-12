var NotasXMLUtils = Class.create();
NotasXMLUtils.prototype = {
  initialize: function () {},

  createRequest: function (request) {
    var cartId = GlideGuid.generate(null);
    var util = new RequestsUtils();
    var cart = new Cart(cartId);
    var requestor = util.getUserID(request.REQUESTOR.toLowerCase()).toString();
    var data = request.DATA;
    var that = this;
    var result = {};

    var item = cart.addItem("bbaedb71db5e8550826c87b30496194a");

    cart.setVariable(item, "vs_opened_by", requestor);
    cart.setVariable(item, "vs_requested_for", requestor);

    cart.setVariable(item, "chave_xml", data.chave_xml.toString());
    cart.setVariable(item, "tipo_frete", data.tipo_frete.toString());
    cart.setVariable(item, "aceita_dev", data.aceita_dev.toString());
    cart.setVariable(item, "nf_de", data.nf_de.toString());
    cart.setVariable(item, "emissao", data.emissao.toString());
    cart.setVariable(item, "forn_cod", data.forn_cod.toString());
    cart.setVariable(item, "nota_fiscal", data.nota_fiscal.toString());
    cart.setVariable(item, "forn_loja", data.forn_loja.toString());
    cart.setVariable(item, "serie", data.serie.toString());
    cart.setVariable(item, "filial_nf", data.filial_nf.toString());
    cart.setVariable(item, "lancamento_relacionado_ao_departamento_de_ti", data.lancamento_relacionado_ao_departamento_de_ti.toString());
    cart.setVariable(
      item,
      "forn_razao_social",
      data.forn_razao_social.toString()
    );
    cart.setVariable(item, "natureza_nf", data.natureza_nf.toString());
    cart.setVariable(item, "valor_bruto_nf", data.valor_bruto_nf.toString());
    cart.setVariable(item, "cond_pgto", data.cond_pgto.toString());
    cart.setVariable(
      item,
      "descricao_natureza",
      data.descricao_natureza.toString()
    );
    cart.setVariable(item, "desc_cond_pgto", data.desc_cond_pgto.toString());

    var rc = cart.placeOrder();
    rc.requested_for = requestor;
    rc.opened_by = requestor;
    rc.update();

    this._setMultiRow(rc.sys_id, data.produtos, "produtos_vs_xml");
    this._setMultiRow(rc.sys_id, data.rateios, "rateios_vs_xml");
    this._setMultiRow(rc.sys_id, data.parcelas, "parcelas_vs_xml");

    var grReqItem = new GlideRecord("sc_req_item");
    grReqItem.addEncodedQuery(
      "cat_item=bbaedb71db5e8550826c87b30496194a" +
        "^request.sys_id=" +
        rc.sys_id
    );

    grReqItem.query();

    if (grReqItem.next()) {
      grReqItem.u_generic = JSON.stringify(request);
      grReqItem.update();
    }

    result = {
			requestNumber: rc.number,
			sys_id: rc.sys_id
		};

    return result;
  },

  _setMultiRow: function (requestSysId, data, name_mr) {
    var grReqItem = new GlideRecord("sc_req_item");
    grReqItem.addEncodedQuery(
      "cat_item=bbaedb71db5e8550826c87b30496194a" +
        "^request.sys_id=" +
        requestSysId
    );
    grReqItem.query();

    if (grReqItem.next()) {
      switch (name_mr) {
        case "produtos_vs_xml":
          grReqItem.variables.produtos_vs_xml = JSON.stringify(data);
          break;
        case "rateios_vs_xml":
          grReqItem.variables.rateios_vs_xml = JSON.stringify(data);
          break;
        case "parcelas_vs_xml":
          grReqItem.variables.parcelas_vs_xml = JSON.stringify(data);
          break;
      }
      grReqItem.update();
    }
  },

  sendProtheus: function (gr, status, aprovador) {
    try {
      var vars = gr.variable_pool;
      var body = {
        filial: vars.filial_nf.toString(),
        chave: vars.chave_xml.toString(),
        status: status.toString(),
        aprovador: aprovador.toString(),
      };

      var r = new sn_ws.RESTMessageV2(
        "Integration_ ERP_Protheus",
        "POST_notas_xml"
      );
      r.setRequestBody(JSON.stringify(body));
      var response = r.execute();
      var responseBody = response.getBody();
      var httpStatus = response.getStatusCode();
    } catch (ex) {
      var message = ex.message;
    }
  },

  type: "NotasXMLUtils",
};

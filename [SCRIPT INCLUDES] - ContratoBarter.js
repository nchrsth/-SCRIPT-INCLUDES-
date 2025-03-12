var ContratoBarter = Class.create();
ContratoBarter.prototype = {
	initialize: function() {
	},
	sendInfoContract: function(gr){
		var vars = gr.variable_pool;
		var isTwoOperations = vars.tipo_de_ctr.toString().toUpperCase() == 'COMPRA_E_VENDA';
		var ret = {
			"contratos": []
		};
		var event = null;
		var body ={
			"FilialDoSistema": vars.filial_sistema.toString(),
			"TipoContratoCompra": vars.tipo_contrato_protheus.toString(),
			"DataDeEmissao": vars.emissao.toString(),
			"TipoDeMercado": vars.mercado_compra.toString(),
			"CodigoDoFornecedor":  vars.forn_codigo.toString(),
			"LojaDoFornecedor":  vars.forn_loja.toString(),
			"NomeDoFornecedor": vars.forn_razao_social.toString().substring(0,30),
			"CodigoDoProduto": vars.prod_cod.toString(),
			"DescricaoDoProduto.": vars.prod_descricao.toString(),
			"CodigoDaSafra": vars.safra_zc0.toString(),
			"Safra": vars.safra.toString(),
			"DescricaoDaSafra": vars.descricao_zc0.toString(),
			"FilialOrigem": vars.filial_orig_compra.toString(), 
			"DataInicioEmbarque":vars.embarque_ate_compra.toString(),
			"DataTerminoEmbarque":vars.embarque_de_compra.toString(),
			"ModoDoEmbarque": vars.embarque_compra.toString(),
			"TipoDeFrete": vars.tipo_frete_compra.toString(),
			"RequisicaoConectaa": gr.number.toString(),
			"TipoDePreco": vars.preco_compra.toString(),
			"TipoDePagamento": vars.pagamento_compra.toString(),
			"Moeda": parseFloat(vars.moeda),
			"TaxaDaMoeda": parseFloat(vars.taxa_compra),
			"ControleFinanceiro": vars.financeiro_compra.toString(),
			"QuantidadeContrato": parseFloat(vars.quantidade_compra),
			"ValorPorSaca": parseFloat(vars.valor_saca),
			"ValorDeEmbarque": parseFloat(vars.valor_embarque_compra),
			"Cond.Pagto.NotaFiscal": vars.condpgto_cod.toString(),
			"OperacaoCompra": vars.codigo_sx5_dj.toString(),
			"TESCompra": vars.codigo_sf4.toString(),
			"CentroDeCustos": vars.centro_de_custo_compra.toString(),
			"NaturezaFinanceira": vars.natureza_codigo.toString(),
			"DataDePagamento": vars.data_de_pagamento.toString(),
			"TotalBrutoDoContrato": parseFloat(vars.total_bruto_compra),
			"TotaldeImpostos": parseFloat(vars.total_imposto_compra),
			"TotalLiquidodoContrato": parseFloat(vars.total_liquido_compra),
			"ValorLiquidoReais": parseFloat(vars.total_liquido_rs_compra),		
			"DatadeEmissao": vars.emissao_venda.toString(),
			"TipodeMercado2": vars.mercado_venda.toString(),
			"CodigoDoCliente":  vars.client_codigo.toString(),
			"LojaDoCliente": vars.client_loja.toString(),
			"NomeDoCliente": vars.client_razao_social.toString().substring(0,30),
			"ProdutoDoContrato": vars.codigo_sb1_v2.toString(),
			"DescricaoDoProduto": vars.descricao_sb1_v2.toString(),
			"CodigoDaSafra2": vars.safra_zc0_2.toString(),
			"DescricaoDaSafra2": vars.descricao_zc0_2.toString(),
			"FilialDeOrigem": vars.filial_orig_venda.toString(),
			"DataInicialDeEmbarque": vars.data_inicial_embarque.toString(),
			"DataFinalDeEmbarque": vars.data_termino_embarque.toString(),
			"TipoDeTransporte": vars.tipo_transporte_venda.toString(),
			"ClienteDeEntrega": vars.cod_client_ent_fat.toString(),
			"Loja": vars.loja_client_ent_fat.toString(),
			"ClienteDeFaturamento": vars.cod_client_ent_fat.toString().substring(0,30),
			"Loja2": vars.loja_client_ent_fat.toString(),
			"ArmazemPadraoFiscal": vars.armazem_padrao_fiscal.toString(),
			"TipoDeFrete2": vars.tipo_frete_venda.toString(),
			"RequisicaoConectaa2": gr.number.toString(),
			"TipoDePreço": vars.preco_venda.toString(),
			"TipoDeRecebimento": vars.recebimento.toString(),
			"MoedaDoContrato": parseFloat(vars.moeda_venda),
			"TaxaDaMoeda2": parseFloat(vars.taxa_venda),
			"ControleFinanceiro2": vars.financeiro_venda.toString(),
			"QuantidadedoProdutoKG": parseFloat(vars.quantidade_venda),
			"ValorPorSaca2": parseFloat(vars.valor_saca_venda),
			"ValorDeEmbarque2": parseFloat(vars.valor_embarque_venda),
			"CondicaoDePagamentoNF": vars.condpgto_cod_2.toString(),
			"OperacaoDeVenda": vars.codigo_sx5_dj_2.toString(),
			"TesVenda": vars.codigo_sf4_2.toString(),
			"CessaoCredito": vars.cessao_cred.toString(),
			"ClienteCessaoDeCredito": vars.codigo_cessao.toString(),
			"CentroDeCustos2": vars.centro_de_custo_venda.toString(),
			"NaturezaFinanceira2": vars.natureza_codigo_v2.toString(),
			"DataDePagamento2": vars.data_pagamento_venda.toString(),
			"ValorTotalBruto": parseFloat(vars.total_bruto_venda),
			"TotalDeImpostos": parseFloat(vars.total_imposto_venda),
			"TotalLiquidoDoContrato": parseFloat(vars.total_liquido_venda),
			"ValorLiquidoReais2": parseFloat(vars.total_liquido_rs_venda),
			"Embarque": vars.embarque_venda.toString(),
			"CentroDeCustos.": vars.centro_de_custo_venda.toString(),
			"ValorTonelada": parseFloat(vars.valor_tonelada_venda)
		};

		if (isTwoOperations) {
			body.TipoDoContrato = 'COMPRA';
			event = this.createQueueEvent(gr, 'Integration_ ERP_Protheus', 'POST_ContratoBarter', body, body.FilialDoSistema);
			if(event) {
				event = JSON.parse(event.u_response);
				if(event.registro && Array.isArray(event.registro)){				
					ret.contratos.push({
						tipo: 'compra',
						numero: event.registro[0].ContratoDeCompra.toString()
					});

				}
			}
			body.TipoDoContrato = 'VENDA';
			event = this.createQueueEvent(gr, 'Integration_ ERP_Protheus', 'POST_ContratoBarter', body, body.FilialDoSistema);
			if(event) {
				event = JSON.parse(event.u_response);
				if(event.registro && Array.isArray(event.registro)){
					ret.contratos.push({
						tipo: 'venda',
						numero: event.registro[0].ContratoDeCompra.toString()
					});
					//vars.contrato_de_compra = ret.contratos[0].numero.toString();
					//vars.contrato_de_venda = ret.contratos[1].numero.toString();
				}
			}
			/*vars.contrato_de_compra = ret.contratos[0].numero.toString();
			vars.contrato_de_venda = ret.contratos[1].numero.toString();
			gr.update();*/

		} else {
			body.TipoDoContrato = vars.tipo_de_ctr.toString();
			event = this.createQueueEvent(gr, 'Integration_ ERP_Protheus', 'POST_ContratoBarter', body, body.FilialDoSistema);
			if(event) {
				event = JSON.parse(event.u_response);
				if(event.registro && Array.isArray(event.registro)){
					ret.contratos.push({
						tipo: body.TipoDoContrato,
						numero: event.registro[0].ContratoDeCompra.toString()
					});
					/*if (vars.tipo_de_ctr == 'VENDA'){
						vars.contrato_de_venda = ret.contratos[0].numero.toString();
					}else{
						vars.contrato_de_compra = ret.contratos[0].numero.toString();
					}*/
				}
			}
			//gr.update();
		}

		return ret;

	},
	createQueueEvent: function(gr,rest_message,method,body,filial){

		var grAlpEvent = new GlideRecord('u_alp_eventos');
		grAlpEvent.initialize();
		grAlpEvent.u_source = 'servicenow';
		grAlpEvent.u_target = "protheus"; 
		grAlpEvent.u_task = gr.getUniqueValue();
		grAlpEvent.u_playload = JSON.stringify(body);
		grAlpEvent.u_method = method;
		grAlpEvent.u_rest_message = rest_message;
		grAlpEvent.u_status = 'processado';
		if (filial) {
			grAlpEvent.u_tenantid = '00,' + filial;
		}
		grAlpEvent.insert();

		try {
			var rest = new sn_ws.RESTMessageV2(rest_message,method);
			rest.setRequestBody(JSON.stringify(body));
			var response = rest.execute();
			response.waitForResponse(120);
			var httpStatus = response.getStatusCode();
			var responseBody = response.getBody();

			grAlpEvent.u_status_response = httpStatus;
			grAlpEvent.u_response = responseBody;

			if(httpStatus==200 || httpStatus ==201){
				grAlpEvent.u_status = 'processado';
			} else{
				grAlpEvent.u_status = 'erro_de_processamento';
				grAlpEvent.u_number_requested = (1).toString();
			}
			grAlpEvent.update();

		} catch (error){
			grAlpEvent.u_status='erro_de_processamento';
			grAlpEvent.u_number_requested =(1).toString();
			grAlpEvent.update();
		}
		return grAlpEvent;

	},
	returnContractReq: function (resp) {

		var ret = {};
		if (resp && resp.RequisicaoConectaa){//
			var gr = new GlideRecord ('sc_req_item');
			gr.addEncodedQuery('cat_item=6e076d371b6f0110e90cfc4e4b4bcb53^number=' + resp.RequisicaoConectaa.toString());
			gr.query();
			if (gr.next()){
				gr.variable_pool.contrato_de_compra = ContratoDeCompra.toString();
				gr.variable_pool.contrato_de_venda = ContratoDeVenda.toString();
				gr.update();
				ret = {
					error: false,
					message: 'Update successful'

				};
			}
		}
	},

	type: 'ContratoBarter'
};
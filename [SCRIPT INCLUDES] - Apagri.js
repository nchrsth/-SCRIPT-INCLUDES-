var APagri = Class.create();
APagri.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	updateRequest: function(body, type){
		var response = {};
		if (body && body.number_req){
			var gr = new GlideRecord ('sc_req_item');
			gr.addEncodedQuery('cat_item=e0ae6b4ddb9acd10826c87b304961935^number=' + body.number_req.toString());
			gr.query();
			if (gr.next()){
				if ( type == 'update_info'){
					gr.variable_pool.numero_contrato_apagri = body.numero_contrato_apagri ? body.numero_contrato_apagri.toString() : "";
					gr.variable_pool.valor_apagri_custo_ha = body.valor_apagri_custo_ha ? body.valor_apagri_custo_ha.toString() : "" ;
					gr.variable_pool.valor_apagri_custo_total = body.valor_apagri_custo_total ? body.valor_apagri_custo_total.toString() : "";
					gr.variable_pool.amostrador = body.amostrador ? body.amostrador.toString() : "";
					gr.variable_pool.data_prevista_para_coleta = body.data_prevista_para_coleta ? body.data_prevista_para_coleta.toString() : "";
					gr.variable_pool.data_coleta = body.data_coleta ? body.data_coleta.toString() : "";
					gr.variable_pool.data_entrega_mapas = body.data_entrega_mapas ? body.data_entrega_mapas.toString() : "";
					gr.variable_pool.data_entrega_tecnica = body.data_entrega_tecnica ? body.data_entrega_tecnica.toString() : "";
					gr.variable_pool.data_faturamento_apagri = body.data_faturamento_apagri ? body.data_faturamento_apagri.toString() : "";
					gr.update();
					response = {
						error: false,
						message: 'Update successful'

					};
				}else if (type == 'update_status'){
					if(body.status){
						gr.variable_pool.status = body.status ? body.status.toString() : "";
						gr.update();
						response = {
							error: false,
							message: 'Update Successful'
						};
					}else{
						response = {
							error: true,
							message:"Property 'status' not found in the body"
						};
					}

				}
			}else{
				response = {
					error: true,
					message: "Valid body or valid 'number_req' not found"					
				};
			}
		}
		else{
			response = {
				error: true,
				message: " Property 'number_req' not found in the body " 
			};
		}
		return response;
	},
	sendApagri: function(gr) {

		var fotoPedido = this.getBase64FromSysId(gr.variable_pool.foto_do_pedido.getValue());
		var kmlKmz = this.getBase64FromSysId(gr.variable_pool.kml_kmz_da_area_do_servico.getValue());

		var body = {
			"number_req": gr.number.toString(),
			"data_carimbo": gr.variable_pool.data_carimbo.toString(),
			"email_solicitante_pedido": gr.variable_pool.nome_do_colaborador.email.toString(),
			"nome_cliente": gr.variable_pool.client_razao_social.toString(),
			"numero_pedido": gr.variable_pool.numero_do_pedido.toString(),
			"tipo_pessoa_pedido": gr.variable_pool.	tipo_pessoa_pedido.toString(),
			"numero_documento": gr.variable_pool.client_cpf_cnpj.toString(),
			"servico_contratado": gr.variable_pool.servico_contratado.toString(),
			"numero_servico": gr.number.toString(), //retirado pois o número de serviço passa a ser a RITM
			"area_servico": parseFloat(gr.variable_pool.area_do_servico),
			"grid": gr.variable_pool.grid.toString(),
			"valor_venda_cliente": parseFloat(gr.variable_pool.valor_da_venda_ao_cliente_r_ha),
			"valor_venda_total": parseFloat(gr.variable_pool.valor_da_venda_total_r),
			"resgate_orbia": JSON.parse(gr.variable_pool.resgate_orbia),
			"numero_do_resgate_orbia":  parseFloat(gr.variable_pool.numero_resgate_orbia),
			"total_pontos_resgatados": parseFloat(gr.variable_pool.total_de_pontos_resgatados),
			"valor_total_pedido": parseFloat(gr.variable_pool.valor_total_do_pedido_r),
			"nome_ctv": gr.variable_pool.vs_ctv_responsavel.getDisplayValue().toString(),
			"consultor_responsavel": gr.variable_pool.consultor_agronomico_responsavel.getDisplayValue().toString(),
			"filial": gr.variable_pool.vs_filial.getDisplayValue().toString(),
			"cnpj_filial": gr.variable_pool.vs_cnpj.toString(),
			"data_vencimento_cliente": gr.variable_pool.data_do_vencimento_do_cliente.toString(),
			"data_vencimento_apagri": gr.variable_pool.data_de_vencimento_da_apagri.toString(),
			"nome_fazenda": gr.variable_pool.nome_da_fazenda.toString(),
			"municipio_propriedade": gr.variable_pool.client_municipio_vs.toString(),
			"numero_telefone_cliente": gr.variable_pool.telefone.toString(),
			"numero_telefone_ctv": gr.variable_pool.vs_celular_ctv_responsavel.toString(),
			"observacao_operacional": gr.variable_pool.observacao_operacional.toString(),
			"kml_kmz": kmlKmz,
			"foto_pedido": fotoPedido,
			"complemento_endereco": gr.variable_pool.client_roteiro_vs.toString()
		};

		this.createQueueEvent(gr, 'Apagri','Integration_APagri', 'POST_enviar_variaveis', body);

	},

	getBase64FromSysId: function(sysId) {

		var grAttach = new GlideRecord('sys_attachment');

		try {
			if(sysId && grAttach.get(sysId)){
				var response = new AA_Generico().getBase64FromAttachment(grAttach);
				return response.base64;
			} else {
				return "";
			}

		} catch (ex) {
			gs.error(ex.message);
			return "";
		}
	},

	createQueueEvent: function(gr,target,rest_message,method,body){

		var grAlpEvent = new GlideRecord('u_alp_eventos');
		grAlpEvent.initialize();
		grAlpEvent.u_source = 'servicenow';
		grAlpEvent.u_target = target; 
		grAlpEvent.u_task = gr.getUniqueValue();
		grAlpEvent.u_playload = JSON.stringify(body);
		grAlpEvent.u_method = method;
		grAlpEvent.u_rest_message = rest_message;
		grAlpEvent.u_status = 'nao_processado';
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
	type: 'APagri'
});
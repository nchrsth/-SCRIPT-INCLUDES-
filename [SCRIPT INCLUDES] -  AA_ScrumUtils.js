var AA_ScrumUtils = Class.create();
AA_ScrumUtils.prototype = {
	initialize: function () {},

	copyTaskToStory: function (sysIdCard) {

		var grCard = new GlideRecord('vtb_card');
		var grTask = new GlideRecord('task');
		var grRmStory = new GlideRecord('rm_story');

		var validacao = false;
		var paralisado = false;
		var sysIdTask = "";
		var sysIdLane = "";
		if (sysIdCard) {
			grCard.addEncodedQuery("board=dc3397871bd8a450038f8770f54bcb0e^taskISNOTEMPTY^task.sys_id=" + sysIdCard);
		} else {
			grCard.addEncodedQuery("removed=False^board=dc3397871bd8a450038f8770f54bcb0e^taskISNOTEMPTY");
		}
		grCard.orderBy('lane');
		grCard.query();

		gs.log('Processando ' + grCard.getRowCount() + ' card(s)...');

		while (grCard.next()) {
			gs.log('Migrando Card ' + grCard.task.getDisplayValue() + ' para Story...');
			validacao = false;
			paralisado = false;
			sysIdTask = grCard.getValue('task');
			sysIdLane = grCard.getValue('lane');

			// Validação
			if (sysIdLane == '50335f871bd8a450038f8770f54bcb44') {
				validacao = true;
			}
			// Paralisado
			else if (sysIdLane == '3a865b0f1bd8a450038f8770f54bcb7a') {
				paralisado = true;
			}

			// Cria Story
			if (grTask.get(sysIdTask)) {
				grRmStory.initialize();
				grRmStory.short_description = grTask.getValue('short_description');
				grRmStory.description = grTask.getValue('description');
				grRmStory.u_card = sysIdTask.toString();
				grRmStory.opened_by = grTask.getValue('opened_by');
				grRmStory.assignment_group = 'b11a404f1bd838103f3d87f1f54bcb7a';
				grRmStory.assigned_to = grTask.getValue('assigned_to');
				grRmStory.additional_assignee_list = grTask.getValue('additional_assignee_list');
				grRmStory.comments = grTask.getValue('comments');
				grRmStory.comments_and_work_notes = grTask.getValue('comments_and_work_notes');
				grRmStory.work_notes = grTask.getValue('work_notes');
				if (validacao) {
					grRmStory.setValue('state', '-7');
				}
				if (paralisado) {
					grRmStory.setValue('blocked', true);
					grRmStory.setValue('blocked_reason', '[Script AA_ScrumUtils] - Paralisado');
				}
				grRmStory.insert();
				gs.log('Story criado ' + grRmStory.getDisplayValue() + ' - origem ' + grCard.task.getDisplayValue());

				grCard.removed = 'true';
				grCard.update();

			} else {
				gs.log('[Erro] Não foi possível localizar a task ' + grCard.task.getDisplayValue());
			}
		}
	},

	createRelease: function () {

		var grStory = GlideRecord('rm_story');
		var grRelease = GlideRecord('rm_release_scrum');
		var grProducts = GlideRecord('cmdb_application_product_model');
		var grRelationship = "";
		var gdt = GlideDateTime();
		var sysIdRelease = '';

		//grStory.addEncodedQuery('state=3^releaseISEMPTY');
		// Story State Complete and Deploy/Launch
		//grStory.addEncodedQuery('state=3^ORstate=10^releaseISEMPTY');
		//grStory.addEncondedQuery('state=10^ORstate=3^releaseISEMPTY^assignment_group=b11a404f1bd838103f3d87f1f54bcb7a')
		grStory.addEncodedQuery('stateIN10,3^releaseISEMPTY^assignment_group=b11a404f1bd838103f3d87f1f54bcb7a');
		grStory.query();
		var regs = grStory.getRowCount();
		if (regs > 0) {
			grRelease.addEncodedQuery('active=true^state=2');
			grRelease.query();
			if (grRelease.next()) {
				if (grRelease.getRowCount() == '1') {
					sysIdRelease = grRelease.getUniqueValue();
					gs.log('Utilizando Release ' + grRelease.number);
					grProducts.query();
					gs.log('Amarrando ' + grProducts.getRowCount() + ' produto(s) na Release...');
					while (grProducts.next()) {
						grRelationship = GlideRecord('m2m_product_release');
						grRelationship.addEncodedQuery('model=' + grProducts.getUniqueValue() + '^release=' + sysIdRelease);
						grRelationship.query();
						if (!(grRelationship.next())) {
							grRelationship.initialize();
							grRelationship.model = grProducts.getUniqueValue();
							grRelationship.release = sysIdRelease;
							grRelationship.insert();
						}
					}
				}
			} else {
				grRelease.initialize();
				grRelease.state = '2';
				grRelease.start_date = gdt;
				grRelease.end_date = gdt;
				grRelease.assigned_to = '4c9bb7761b14a0505604dca0f54bcb6c';
				grRelease.short_description = 'Release - ' + gdt.date.getByFormat('dd/MM/yyyy');
				sysIdRelease = grRelease.insert();
				gs.log('Criado Release ' + grRelease.number);
				grProducts.query();
				gs.log('Amarrando ' + grProducts.getRowCount() + ' produto(s) na Release...');
				while (grProducts.next()) {
					grRelationship = GlideRecord('m2m_product_release');
					grRelationship.addEncodedQuery('model=' + grProducts.getUniqueValue() + '^release=' + sysIdRelease);
					grRelationship.query();
					if (!(grRelationship.next())) {
						grRelationship.initialize();
						grRelationship.model = grProducts.getUniqueValue();
						grRelationship.release = sysIdRelease;
						grRelationship.insert();
					}
				}
			}
			if (sysIdRelease) {
				gs.log('Processando ' + regs + ' story(ies)...');
				while (grStory.next()) {
					grStory.release = sysIdRelease;
					grStory.update();
				}
			} else {
				gs.log('Há mais de uma release com o status "current", é permitido apenas uma release com status "current", caso não houver nenhuma, será criado');
			}
		}
	},

	closeRequest: function() {
		var tables = ['rm_defect','rm_enhancement'];
		tables.forEach(function(table){
			var gr = new GlideRecord(table);
			var grScReqItem, grRequest, scReqItemSysId, story;
			gr.addEncodedQuery('active=true');
			gr.query();
			gs.log('Table: ' + table);
			gs.log('Count: ' + gr.getRowCount());
			while(gr.next()){
				story = this.getStory(gr.sys_id);
				if(story.count == 1){
					gs.log('task ' + gr.number.toString() + ' closed');
					gr.state = '3';
					gr.comments = 'Tarefa encerrada pelo Story - ' + story.gr.getDisplayValue('number');
					gr.update();
					scReqItemSysId = gr.parent.toString();
					grScReqItem = new GlideRecord('sc_req_item');
					if(parent && grScReqItem.get(scReqItemSysId)){
						if(grScReqItem.getValue('state') != '3'){
							gs.log('sc_req_item ' + grScReqItem.number.toString() + ' closed');
							grScReqItem.state = '3';
							grScReqItem.comments = 'Tarefa encerrada pelo Story - ' + story.gr.getDisplayValue('number');
							grPgrScReqItemarent.update();
							grRequest = new GlideRecord('sc_request');
							grRequest.addEncodedQuery('sys_id=' + grScReqItem.getValue('request'));
							grRequest.query();
							if(grRequest.next()){
								gs.log('sc_request ' + grRequest.number.toString() + ' closed');
								grRequest.stage = 'closed_complete';
								grRequest.request_state = 'closed_complete';
								grRequest.update();
							}
						}
					}

				}
			}
		});
	},

	getStory: function(original_task){
		var state;
		var grStory = new GlideRecord('rm_story');
		grStory.addEncodedQuery('original_task=' + original_task + '^active=true');
		grStory.query();
		while(grStory.next()){
			state = grStory.getValue('state');
		}

		return {
			gr: grStory, 
			count: grStory.getRowCount()
		};
	},

	//Marcos Aurelio
	// 12/04/2022
	// scrit que retorna um array de objeto com as stories que o usuário participa
	getStoryPartners: function(queryParams) {
		var gr;
		var reqInform = [];
		var responseBody = [];
		var queryWhere = "";
		var that = this;
		var ret;
		try {
			queryWhere = "assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744";

			if (queryParams.data_inicial) {
				queryWhere += "^opened_at>javascript:gs.dateGenerate('" + queryParams.data_inicial.toString() + "','00:00:00')";
			}
			if (queryParams.data_final) {
				queryWhere += "^opened_at<javascript:gs.dateGenerate('" + queryParams.data_final.toString() + "','23:59:59')";
			}

			gr = new GlideRecord('rm_story');
			gr.addEncodedQuery(queryWhere);
			gr.orderByDesc();
			gr.query();
			while (gr.next()) {
				responseBody.push({
					number: gr.number.toString(),
					id: gr.getUniqueValue(),
					short_description: gr.short_description.toString(),
					description: gr.description.toString(),
					theme: gr.theme.getDisplayValue().toString(),
					state: {
						id: gr.state.toString(),
						description: gr.state.getDisplayValue().toString(),
					},
					active: gr.active.getDisplayValue(),
					epic: {
						id: gr.epic.toString(),
						description: gr.epic.getDisplayValue().toString(),
					},
					sprint: {
						start_date: gr.sprint.start_date.toString(),
						end_date: gr.sprint.end_date.toString(),
					},
					assigned: gr.assigned_to.getDisplayValue().toString(),
					assignment_group:gr.assignment_group.getDisplayValue().toString(),
					planned_duration: that.convertDayToHours(gr.duration.dateNumericValue()),
					work_duration: that.convertDayToHours(gr.u_worked_duration.dateNumericValue()),
					opened_at: gr.opened_at.toString(),
					opened_by: gr.opened_by.getDisplayValue().toString(),
					end_date: gr.closed_at.getDisplayValue().toString(),
					updated_at: gr.sys_updated_on.getValue(),
				});
				gr.get
			}
			if (responseBody) {
				ret = {responseBody:responseBody,statuscode:200};

			} else {
				responseBody = {error:'no content'};
				ret =  {responseBody:responseBody,statuscode:200};
			}
		} catch (e) {
			responseBody = e;
			ret = {responseBody:responseBody,statuscode:500};
		}
		return ret;
	}, 

	//Marcos Aurelio
	// 12/04/2022
	//função que para converter milisegundos em horas
	convertDayToHours: function(dataConvert) {
		var minutos;
		var horas;
		var retHours = ''; 

		minutos = dataConvert / 60000;
		horas = minutos / 60;
		retHours = Math.round(horas);

		return retHours;
	},

	createKBReleaseNotes: function(grRelease, update) {

		if (grRelease) {
			var tasks = [];
			var description = grRelease.description;
			var shortDescription = grRelease.short_description;

			var grStory = new GlideRecord('rm_story');
			grStory.addEncodedQuery('release=' + grRelease.getUniqueValue() + '^u_release_notesISNOTEMPTY');
			grStory.orderBy('number');
			grStory.query();
			while(grStory.next()) {
				tasks.push({
					number: grStory.number.toString(),
					href: "/sp?id=form&table=" + grStory.getTableName() + '&sys_id=' + grStory.getUniqueValue(),
					product: grStory.product.getDisplayValue(),
					problema: grStory.u_descreva_problema.toString(),
					release_notes: grStory.u_release_notes.toString(),
					modulos: grStory.u_modulos_afetados.toString(),
					solicitante: grStory.u_requester.getDisplayValue().toString()
		

				});
			}
			var grIncident = new GlideRecord('incident');
			grIncident.addEncodedQuery('u_release=' + grRelease.getUniqueValue() + '^u_release_notesISNOTEMPTY');
			grIncident.orderBy('business_service');
			grIncident.query();
			while(grIncident.next()) {
				tasks.push({
					number: grIncident.number.toString(),
					href: "/sp?id=form&table=" + grIncident.getTableName() + '&sys_id=' + grIncident.getUniqueValue(),
					product: grIncident.business_service.getDisplayValue(),
					release_notes: grIncident.u_release_notes.toString()
				});
			}

			if(tasks) {
				tasks = tasks.sort(function(a,b) { 
					if ( a.product < b.product ){
						return -1;
					}
					if ( a.product > b.product ){
						return 1;
					}
					return 0;
				});

				var grKnowledge = new GlideRecord('kb_knowledge');
				if(!update){
					grKnowledge.initialize();
					grKnowledge.kb_category = '40df5eb6dbdd59d0983fa7b214961950';
					grKnowledge.kb_knowledge_base = '3a3710a2db9595d0983fa7b2149619b9';
					grKnowledge.language = 'pb';
					grKnowledge.display_attachments = true;
					grKnowledge.short_description = shortDescription;
					var body = description ? "<h3>" + description + "</h3>" : "";
					var product = "";
					var first = true;
					tasks.forEach(function(task){
						if(product != task.product){
							product = task.product;
							// if (!first)
							//	body += "<br>";
							body += "<h4>" + (product ? product : 'Sem categoria') + "</h4><hr>";
							first = false;
						}
						body += "<li><b> Requisição: </b>(<a href='" + task.href + "' target='_blank'>" + task.number + "</a>)</li>";
						body += "<br><b> Problema: </b>" + task.problema + "</br>";
						body += "<br><b> Solução: </b>" + task.release_notes + "</br>";
						body += "<br><b> Módulos Afetados: </b>" + task.modulos + "</br>";
						body += "<br><b> Solicitante: </b>" + task.solicitante + "</br>";

					});

					grKnowledge.text = body;
					grKnowledge.insert();
					return grKnowledge;
				} else {
					if (grKnowledge.get(grRelease.u_kb_release_notes)) {
						grKnowledge.short_description = shortDescription;
						var body = description ? "<h3>" + description + "</h3>" : "";
						var product = "";
						var first = true;
						tasks.forEach(function(task){
							if(product != task.product){
								product = task.product;
								// if (!first)
								//	body += "<br>";
								body += "<h4>" + (product ? product : 'Sem categoria') + "</h4><hr>";
								first = false;
							}
							body += "<li>" + task.release_notes + " (<a href='" + task.href + "' target='_blank'>" + task.number + "</a>)</li>";
						});

						grKnowledge.text = body;
						grKnowledge.workflow_state = 'state';
						grKnowledge.update();
						return grKnowledge;
					}
				}

			}
		}
		return null;
	},

	type: 'AA_ScrumUtils'
};
var AA_ReportSurveyHUB = Class.create();
AA_ReportSurveyHUB.prototype = {
    initialize: function () {
        this.createReport();
    },

    createReport: function () {
        var grAsmtMetricResult = new GlideRecord('asmt_metric_result'); //respondidos
        var responses = [];
        // var query = 'sys_created_onONLast 60 days@javascript:gs.beginningOfLast60Days()@javascript:gs.endOfLast60Days()'
        var query = "metric.category=635a9952dbfde550983fa7b214961973^sys_created_on>=javascript:gs.dateGenerate('2023-04-11','00:00:00')";
        grAsmtMetricResult.addEncodedQuery(query);
        grAsmtMetricResult.orderByDesc('sys_created_on');
        grAsmtMetricResult.query();
        while (grAsmtMetricResult.next()) {
			var demand = '';
			var submitter = '';
            var grAsmtMetric = new GlideRecord('asmt_metric'); //perguntas
            grAsmtMetric.addEncodedQuery("sys_id=" + grAsmtMetricResult.metric.toString()); //metric_type?  if i use the metric_type sys_id it doesn't return anything

            grAsmtMetric.query();
            if (grAsmtMetric.next()) {
                var question = grAsmtMetric.question;
                var grAsmtAssessmentInstance = new GlideRecord('asmt_assessment_instance'); //instancia
                grAsmtAssessmentInstance.addEncodedQuery("sys_id=" + grAsmtMetricResult.instance.toString());
                grAsmtAssessmentInstance.query();
                if (grAsmtAssessmentInstance.next()) {
                    var grTask = new GlideRecord('task');
                    grTask.addEncodedQuery("sys_id=" + grAsmtAssessmentInstance.task_id.toString());
                    grTask.query();
                    if (grTask.next()) {
                        var grDemand = new GlideRecord('dmn_demand');
                        grDemand.addEncodedQuery("sys_id=" + grTask.getUniqueValue().toString());
                        grDemand.query();
                        if (grDemand.next()) {
                            var demand = grDemand.number;
                            var submitter = grDemand.submitter.getDisplayValue();

                        }
                    }
                }
            }

            dados = {
                // sys_id: grAsmtMetricResult.sys_id.toString(),
                assessment_group: grAsmtMetricResult.assessment_group.getDisplayValue().toString(),
                question: question.toString(),
                metric_sys_id: grAsmtMetric.getUniqueValue(),
                // actual_value: grAsmtMetricResult.actual_value.toString(),
                string_value: grAsmtMetricResult.string_value.toString().replace(/\n|\r/g, ""),
                user: grAsmtMetricResult.user.getDisplayValue().toString(),
                location: grAsmtMetricResult.user.location.getDisplayValue().toString(),
                sys_created_on: grAsmtMetricResult.sys_created_on.getDisplayValue().toString(),
                demand: demand ? demand.toString() : '',
                submitter: submitter ? submitter.toString() : ''

            };
            responses.push(dados);
        }

        responses = this.uniqueAnswersFromObject(responses)

        return this.exportToCsv(responses);
        //return responses;
    },

    uniqueAnswersFromObject: function (data) {

        var index = ''
        var new_data = []

        data = data.sort(function(a, b) {
            if (a.assessment_group === b.assessment_group) {
                return a.metric_sys_id < b.metric_sys_id ? -1 : 1
            } else {
                return a.assessment_group < b.assessment_group ? -1 : 1
            }
        })

        data.forEach(function (i) {
            if (index) {
                if (index != (i.assessment_group + i.metric_sys_id)) {
                    index = i.assessment_group + i.metric_sys_id
                    new_data.push(i)
                } else {
                    new_data[new_data.length - 1].string_value += ', ' + i.string_value
                }

            } else {
                index = i.assessment_group + i.metric_sys_id
                new_data.push(i)
            }
        })


        return new_data;
    },

    exportToCsv: function (data) {

        var header = "Identificador;" +
            "Como você avalia o Especialista de Melhoria Contínua durante a visita?;" +
            "Você se sentiu confortável em compartilhar suas opiniões e ideias com o Especialista?;" +
            "Como você avalia a interação e comunicação com o especialista?;" +
            "O Especialista demonstrou conhecimento e habilidade em identificar áreas de melhoria?;" +
            "O Especialista mostrou interesse em entender as necessidades e desafios da Filial e/ou departamento?;" +
            "O Especialista apresentou soluções e sugestões para melhorar os processos da filial e/ou departamento?;" +
            "Você tem alguma sugestão para melhorar a visita do especialista de melhoria contínua às filiais e ou departamentos da empresa?;" +
            "Alguma sugestão ou crítica construtiva para melhorias futuras na visita dos especialistas em melhoria contínua?;" +
            "Em geral, como você avalia a visita dos especialistas em melhoria contínua e sua satisfação com ela?;" +
            "Usuário;" +
            "Filial;" +
            "Data de Criação;" +
            "Demanda;" +
            "Especialista Hub;";
        var output = header;
        var line = "";
        var group = "";
        var pergunta1 = "";
        var pergunta2 = "";
        var pergunta3 = "";
        var pergunta4 = "";
        var pergunta5 = "";
        var pergunta6 = "";
        var pergunta7 = "";
        var pergunta8 = "";
        var pergunta9 = "";
        var user = "";
        var location = "";
        var sys_created_on = "";
        var demand = "";
        var submitter = "";

        data.forEach(function (element) {

            if (group) {
                if (group !== element.assessment_group) {
                    line = group + ";" + pergunta1 + pergunta2 + pergunta3 + pergunta4 + pergunta5 + pergunta6 + pergunta7 + pergunta8 + pergunta9 + user + location + sys_created_on + demand + submitter;
                    output += "\n" + line.toString('utf8');
                }
            }
            Object.keys(element).forEach(function (key) {
                if (key === "assessment_group")
                    group = element[key];
                if (key === "question" && element[key] === "Como você avalia o Especialista de Melhoria Contínua durante a visita?")
                    if (element.string_value.toString()) {
                        pergunta1 = element.string_value + ";";
                    } else {
                        pergunta1 = ";";
                    }
                if (key === "question" && element[key] === "Você se sentiu confortável em compartilhar suas opiniões e ideias com o Especialista?")
                    if (element.string_value.toString()) {
                        pergunta2 = element.string_value.toString() + ";";
                    } else {
                        pergunta2 = ";";
                    }
                if (key === "question" && element[key] === "Como você avalia a interação e comunicação com o especialista?")
                    if (element.string_value.toString()) {
                        pergunta3 = element.string_value.toString() + ";";
                    } else {
                        pergunta3 = ";";
                    }
                if (key === "question" && element[key] === "O Especialista demonstrou conhecimento e habilidade em identificar áreas de melhoria?")
                    if (element.string_value.toString()) {
                        pergunta4 = element.string_value.toString() + ";";
                    } else {
                        pergunta4 = ";";
                    }
                if (key === "question" && element[key] === "O Especialista mostrou interesse em entender as necessidades e desafios da Filial e/ou departamento?")
                    if (element.string_value.toString()) {
                        pergunta5 = element.string_value.toString() + ";";
                    } else {
                        pergunta5 = ";";
                    }
                if (key === "question" && element[key] === "O Especialista apresentou soluções e sugestões para melhorar os processos da filial e/ou departamento?")
                    if (element.string_value.toString()) {
                        pergunta6 = element.string_value.toString() + ";";
                    } else {
                        pergunta6 = ";";
                    }
                if (key === "question" && element[key] === "Você tem alguma sugestão para melhorar a visita do especialista de melhoria contínua às filiais e ou departamentos da empresa?")
                    if (element.string_value.toString()) {
                        pergunta7 = element.string_value.toString() + ";";
                    } else {
                        pergunta7 = ";";
                    }
                if (key === "question" && element[key] === "Alguma sugestão ou crítica construtiva para melhorias futuras na visita dos especialistas em melhoria contínua?")
                    if (element.string_value.toString()) {
                        pergunta8 = element.string_value.toString() + ";";
                    } else {
                        pergunta8 = ";";
                    }
                if (key === "question" && element[key] === "Em geral, como você avalia a visita dos especialistas em melhoria contínua e sua satisfação com ela?")
                    if (element.string_value.toString()) {
                        pergunta9 = element.string_value.toString() + ";";
                    } else {
                        pergunta9 = ";";
                    }
                if (key === "user")
                    user = element[key] + ";";
                if (key === "location")
                    location = element[key] + ";";
                if (key === "sys_created_on")
                    sys_created_on = element[key] + ";";
                if (key === "demand")
                    demand = element[key] + ";";
                if (key === "submitter")
                    submitter = element[key] + ";";

            });
        });

        line = group + ";" + pergunta1 + pergunta2 + pergunta3 + pergunta4 + pergunta5 + pergunta6 + pergunta7 + pergunta8 + pergunta9 + user + location + sys_created_on + demand + submitter;

        output += "\n" + line.toString('utf8');
        this.writeAttachmentFile(output);

        return output;


    },

    writeAttachmentFile: function (data) {
        var grSysAttachment = new GlideRecord('sys_attachment');
        grSysAttachment.addEncodedQuery("table_name=asmt_metric_type^table_sys_id=28e95112dbfde550983fa7b214961987");
        grSysAttachment.query();
        while (grSysAttachment.next()) {
            grSysAttachment.deleteRecord();
        }
        var today = new GlideDate();
        today = today.getByFormat("ddMMyyyy");

        var attachment = new Attachment();
        var table = "asmt_metric_type";
        var sys_id = "28e95112dbfde550983fa7b214961987"; // Pesquisa de Satisfação HUB
        var attachmentRec = attachment.write(table, sys_id, "report_" + today + ".csv", "text/csv", data);
    },

    type: 'AA_ReportSurveyHUB'
};
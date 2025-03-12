var AAStep = Class.create();
AAStep.prototype = {
    initialize: function() {

    },
    getStepsZ59: function() {
        try {
            //consulta as informações na Z59
            var httpStatus, responseBody, endPoint, authorization;

            var query = "";
            query += "SELECT DISTINCT LTRIM(RTRIM(Z59.Z59_CICLO)) CICLO,LTRIM(RTRIM(Z59.Z59_STEP)) STEP, LTRIM(RTRIM(Z59.Z59_REVISA)) REVISAO, LTRIM(RTRIM(Z59.Z59_FUNCAO)) FUNCAO, LTRIM(RTRIM(SRJ.RJ_DESC)) DESCRICAO FROM Z59000 Z59 LEFT JOIN SRJ000 SRJ ON  Z59.Z59_FUNCAO = SRJ.RJ_FUNCAO";

            gs.info(query);
            var body = {
                query: query
            };
            var REST = new sn_ws.RESTMessageV2('Integration_ ERP_Protheus', 'POST_query');
            REST.setRequestBody(JSON.stringify(body));
            REST.setEccParameter('skip_sensor', true);
            var response = REST.execute();

            httpStatus = response.getStatusCode();
            responseBody = JSON.parse(response.getBody());
            endPoint = REST.getEndpoint();
            authorization = REST.getRequestHeader('authorization');

            var data = responseBody.data;
            var lFnd = false;

            //percorro a resposta do ws
            var keys = Object.keys(data);
            keys.forEach(function(key) {

                /*lFnd = true;*/

                //busca as informações de centro de custo, e filial
                var grStep = new GlideRecord('x_aapas_step_step');

                // **** Cadastro de Step ****
                // Buscando sys id do step, caso não tenha, então insere o step e armazena o sys_id
                grStep.addEncodedQuery('z59_funcao=' + data[key].FUNCAO);
                grStep.query();
                if (grStep.next()) {
                    sysIdStep = grStep.getUniqueValue();
                } else {
                    grStep.initialize();
                    grStep.z59_step = data[key].STEP;
                    grStep.z59_ciclo = data[key].CICLO;
                    grStep.z59_revisa = data[key].REVISAO;
                    grStep.z59_funcao = data[key].FUNCAO;
                    grStep.rj_desc = data[key].DESCRICAO;
                    sysIdStep = grStep.insert();
                }

            });

        } catch (ex) {

        }

    },

    type: 'AAStep'
};
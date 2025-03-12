var AA_Carteira = Class.create();
AA_Carteira.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /*
    callable Client Side Example:
    function onLoad() {
        var ga = new GlideAjax('AA_Carteira'); 
        ga.addParam('sysparm_name','getClients');
        ga.addParam('sysparm_id_carteira',g_form.getValue('cod_carteira'));
        ga.getXMLAnswer(processMultiRow);  		
    }

    // callback function for returning the result from the script include
    function processMultiRow(response) {  
        if(response) {
            var jsonResp = JSON.parse(response)
            console.log(jsonResp)
        } else {
            console.log('Not worked')
        }
    }

    */
    getClients: function(idcarteira) {

        var clientSideIdCarteira = this.getParameter('sysparm_id_carteira')
        var idCarteira = idcarteira ? idcarteira : clientSideIdCarteira
        var ret = {
            data: null,
            message: '',
            success: true
        }
        
        try { 
            var r = new sn_ws.RESTMessageV2('Integration_ ERP_Protheus', 'GET_CarteiraCliente');
            r.setStringParameterNoEscape('idCarteira', idCarteira);
        
            var response = r.execute();
            var responseBody = JSON.parse(response.getBody());
            var httpStatus = response.getStatusCode();

            if (httpStatus == '200' && responseBody) {
                ret.data = responseBody
            } else {
                ret.success = false;
                ret.message = 'Empty body OR unexpected http Status Code (' + httpStatus + ')'
            }
        }
        catch(ex) {
            ret.message = ex.message;
            ret.success = false;
        }
        if (ret.success && ret.data) {
            ret.data = this.formatResult(ret.data)
        }
        if (clientSideIdCarteira) {
            return JSON.stringify(ret);
        } else {
            return ret;
        }
    },

    formatResult: function(obj) {

        var formatedObj = []

        obj.forEach(function(i) {
            formatedObj.push({
                cod_cliente: i.idCliente.substr(0,6),
                loja_cliente: i.idCliente.substr(6,2),
                nome_cliente: i.nomeCliente
            })
        })

        return formatedObj
    },
    type: 'AA_Carteira'
});
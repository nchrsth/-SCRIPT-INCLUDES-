var AA_Generico = Class.create();
AA_Generico.prototype = Object.extendsObject(AbstractAjaxProcessor, {
     /*
        function: 	getCodFilialBySysID
        author:		ciro.chagas
        date:		16-07-2020
        example:	var filial = new AA_Generico().getCodFilialBySysID('b708cb24db02d810bd02be2df396196a');
        return:		[String] > '010101..010102';
    */
    getCodFilialBySysID: function (sysIdFilial) {
        if (sysIdFilial) {
            var grCL = new GlideRecord('cmn_location');
            grCL.addEncodedQuery("u_is_subsidiary=true^sys_id=" + sysIdFilial);
            grCL.query();
            if (grCL.next()) {
                return grCL.getValue('u_subsidiary');
            }
        }
    },
    /*
        function: 	GetSysUserByName
        author:		ciro.chagas
        date:		16-07-2020
        example:	var user = new AA_Generico().GetSysUserByName('ciro.chagas');
        return:		[object GlideRecord] > user.name;
    */
    GetSysUserByName: function (user) {
        var grSysUser = new GlideRecord('sys_user');
        grSysUser.addEncodedQuery("user_name=" + user);
        grSysUser.query();
        if (grSysUser.next()) {
            return grSysUser;
        }
    },

    isDepartmentHead: function () {
        var sysIdUser = this.getParameter('sysparm_user_name');
        var grSysUser = new GlideRecord('sys_user');
        var sysIdDptHead = '';
        grSysUser.addEncodedQuery("sys_id=" + sysIdUser);
        grSysUser.query();
        if (grSysUser.next()) {
            sysIdDptHead = grSysUser.department.dept_head.getValue('sys_id');
        }
        return sysIdDptHead;
    },

    /*
    getDaysWithoutWeekends: function(endDateSrvSide) {
        var endDate = endDateSrvSide ? endDateSrvSide : this.getParameter('sysparm_enddate');
        var todayDateTime = new GlideDate();
        var vencimento = new GlideDate();
        var newVencimento = new GlideDate();
        vencimento.setValue(endDate);
        var mes = vencimento.monthUTC;
        var dia = vencimento.dayOfMonthUTC;
        if(dia >= 0 && dia <= 9){
            newVencimento.setDisplayValue(vencimento);
            newVencimento.addMonthsUTC(-1);
            if(newVencimento.monthUTC == 2){
                newVencimento.setDisplayValue(newVencimento.toString().substring(0,8) + '28');  
            } else {
                newVencimento.setDisplayValue(newVencimento.toString().substring(0,8) + '30');
            }
        } else if (dia >= '10' && dia <= '19') {
            newVencimento.setDisplayValue(vencimento.toString().substring(0,8) + '10');
        } else {
            newVencimento.setDisplayValue(vencimento.toString().substring(0,8) + '20');
        }

        var days_between = parseInt(gs.dateDiff(todayDateTime.getDate(),newVencimento.getDate())) + 1;
        var day_of_the_week = todayDateTime.getDayOfWeekUTC() - 1;

        var number_of_weekends = parseInt((days_between+day_of_the_week)/7);
        var days_between_without_weekends =  days_between - (number_of_weekends*2);

        return {
            daysBetweenWithoutWeekends: days_between_without_weekends, 
            fixedDueDate: newVencimento, 
            dueDate: vencimento, 
            daysBetween: days_between, 
            referenceDate: todayDateTime
        };

        return days_between_without_weekends;
    },
    */
    getDaysWithoutWeekends: function (endDateSrvSide, referencia) {
        var newVenc;
        var that = this;
        var date = referencia ? referencia : new Date();
        date.setHours('00', '00', '00');
        var endDate = endDateSrvSide ? endDateSrvSide : this.getParameter('sysparm_enddate');
        var endDateParsed = Date.parse(endDate);
        var venc = new Date(endDateParsed);
        //var lastDayVenc = new Date(venc.getUTCFullYear(), venc.getUTCMonth() + 1, 0);
        // Se o dia do vencimento está entre 1 e 9 então assume o ultimo dia do mes anterior
        if (venc.getDate() < 9) {
            /*(venc.getDate() == lastDayVenc.getDate()) {*/
            if (venc.getUTCMonth() !== 0) {
                newVenc = new Date(venc.getUTCFullYear(), venc.getUTCMonth() - 1, 30, 0); /*venc;*/
            } else if (venc.getUTCMonth() == 0) {
                newVenc = new Date(venc.getUTCFullYear() - 1, 11, 30, 0);
            }
            // Se o vencimento é o último dia do mês, assume ele mesmo	
        } else if (venc.getDate() == 30 || venc.getDate() == 31) {
            newVenc = venc; //new Date(venc.getUTCFullYear(), venc.getUTCMonth(), venc.getDay());
            // Se o dia do vencimento está entre 10 e 19 então assume o dia 10 do mes
        } else if (venc.getDate() >= 9 && venc.getDate() < 19) {
            newVenc = new Date(venc.getUTCFullYear(), venc.getUTCMonth(), 10);
            // Se o dia do vencimento é maior que dia 19 então assume o dia 20 do mes
        } else if (venc.getDate() >= 19 && venc.getDate() < 29) {
            newVenc = new Date(venc.getUTCFullYear(), venc.getUTCMonth(), 20);
        }
        var data = {
            venc: newVenc,
            workdayCount: that.calcBusinessDays(date, newVenc),
            date: date,
            dayCount: new Date(newVenc - date).getDate()
        };
        var ret = data.workdayCount;
        return ret;
    },


    calcBusinessDays: function (startDate, endDate) {
        var count = 0;
        var curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
            var dayOfWeek = curDate.getDay();
            if (!(dayOfWeek in [0, 6])) count++;
            curDate.setDate(curDate.getDate() + 1);
        }

        return count;
    },

    createCatalogItem: function (body) {

        var catItemSysId = "";
        var ret = {};

        if (body) {

            if (body.cat_item) {
                var cat_item = body.cat_item;
                var grCatItem = new GlideRecord('sc_cat_item');

                grCatItem.addEncodedQuery('name=' + cat_item.name);
                grCatItem.query();

                if (grCatItem.next()) {

                    grCatItem.short_description = cat_item.short_description;

                    grCatItem.availability = cat_item.availability ? cat_item.availability : 'on_both';
                    grCatItem.request_method = cat_item.request_method ? cat_item.request_method : 'submit';
                    grCatItem.no_cart_v2 = cat_item.no_cart_v2 ? cat_item.no_cart_v2 : true;
                    grCatItem.no_quantity_v2 = cat_item.no_quantity_v2 ? cat_item.no_quantity_v2 : true;
                    grCatItem.no_delivery_time_v2 = cat_item.no_delivery_time_v2 ? cat_item.no_delivery_time_v2 : true;
                    grCatItem.no_wishlist_v2 = cat_item.no_wishlist_v2 ? cat_item.no_wishlist_v2 : true;

                    catItemSysId = grCatItem.update();

                } else {
                    grCatItem.initialize();

                    grCatItem.name = cat_item.name;
                    grCatItem.short_description = cat_item.short_description;

                    grCatItem.availability = cat_item.availability ? cat_item.availability : 'on_both';
                    grCatItem.request_method = cat_item.request_method ? cat_item.request_method : 'submit';
                    grCatItem.no_cart_v2 = cat_item.no_cart_v2 ? cat_item.no_cart_v2 : true;
                    grCatItem.no_quantity_v2 = cat_item.no_quantity_v2 ? cat_item.no_quantity_v2 : true;
                    grCatItem.no_delivery_time_v2 = cat_item.no_delivery_time_v2 ? cat_item.no_delivery_time_v2 : true;
                    grCatItem.no_wishlist_v2 = cat_item.no_wishlist_v2 ? cat_item.no_wishlist_v2 : true;

                    catItemSysId = grCatItem.insert();
                }

                ret.catItemSysId = catItemSysId;

                if (catItemSysId) {

                    var grIoSetItem = new GlideRecord('io_set_item');

                    grIoSetItem.addEncodedQuery('variable_set=65dffb8edb39ff00bd02be2df3961991^sc_cat_item=' + catItemSysId);
                    grIoSetItem.query();
                    if (!grIoSetItem.next()) {
                        grIoSetItem.initialize();

                        grIoSetItem.variable_set = '65dffb8edb39ff00bd02be2df3961991';
                        grIoSetItem.sc_cat_item = catItemSysId;
                        grIoSetItem.insert();
                    }

                    var grUserCriteria = new GlideRecord('sc_cat_item_user_criteria_mtom');

                    grUserCriteria.addEncodedQuery('sc_cat_item=' + catItemSysId + '^user_criteria=f02c5d7bdb2af340c134a7b2149619ac');
                    grUserCriteria.query();
                    if (!grUserCriteria.next()) {

                        grUserCriteria.initialize();
                        grUserCriteria.sc_cat_item = catItemSysId;
                        grUserCriteria.user_criteria = 'f02c5d7bdb2af340c134a7b2149619ac';
                        grUserCriteria.insert();

                    }

                    if (cat_item.variables) {

                        var lastOrder = 100;
                        var grLastOrder = new GlideRecord('item_option_new');
                        grLastOrder.addEncodedQuery("cat_item=" + catItemSysId);
                        grLastOrder.orderByDesc('order');
                        grLastOrder.setLimit(1);
                        grLastOrder.query();
                        if (grLastOrder.next()) {
                            lastOrder = grLastOrder.order;
                        }

                        ret.variables = [];

                        cat_item.variables.forEach(function (variable) {


                            var sysIdVariable = "";

                            var grVariable = new GlideRecord('item_option_new');

                            grVariable.addEncodedQuery('name=' + variable.name + "^cat_item=" + catItemSysId);
                            grVariable.query();
                            if (grVariable.next()) {
                                grVariable.question_text = variable.question_text;

                                if (variable.type == 'multi_text') {
                                    grVariable.type = 2;
                                } else if (variable.type == 'date') {
                                    grVariable.type = 9;
                                } else if (variable.type == 'custom_filial') {
                                    grVariable.type = 18;
                                    grVariable.lookup_table = 'cmn_location';
                                    grVariable.lookup_value = 'sys_id';
                                    grVariable.lookup_label = 'u_subsidiary_description';
                                    grVariable.reference_qual = 'u_is_subsidiary=true^EQ';
                                } else {
                                    grVariable.type = 6;
                                }

                                sysIdVariable = grVariable.update();
                                ret.variables.push({
                                    sys_id: sysIdVariable,
                                    status: 'updated'
                                });

                            } else {
                                grVariable.initialize();

                                grVariable.name = variable.name;
                                grVariable.question_text = variable.question_text;
                                grVariable.cat_item = catItemSysId;

                                if (variable.type == 'multi_text') {
                                    grVariable.type = 2;
                                } else if (variable.type == 'date') {
                                    grVariable.type = 9;
                                } else if (variable.type == 'custom_filial') {
                                    grVariable.type = 18;
                                    grVariable.lookup_table = 'cmn_location';
                                    grVariable.lookup_value = 'sys_id';
                                    grVariable.lookup_label = 'u_subsidiary_description';
                                    grVariable.reference_qual = 'u_is_subsidiary=true^EQ';
                                } else {
                                    grVariable.type = 6;
                                }
                                lastOrder = (parseFloat(lastOrder) + 10).toString()

                                grVariable.order = lastOrder;

                                sysIdVariable = grVariable.insert()

                                ret.variables.push({
                                    sys_id: sysIdVariable,
                                    status: 'inserted'
                                });

                            }

                        })
                    }
                }

            }

        }

        return ret;

    },

  
    getBase64FromAttachment: function (grAttachment) {
        var gsu = GlideStringUtil;
        var gsa = new GlideSysAttachment();
        var data = gsa.getBytes(grAttachment);
        var base64 = GlideStringUtil.base64Encode(data);
        return {
            fileName: grAttachment.getDisplayValue(),
            base64: base64
        };
    },

    getCompanyTime: function () {
        var admissao = new GlideDateTime(this.getParameter('sysparm_admissao'));
        var hoje = new GlideDateTime();
        var dur = GlideDateTime.subtract(admissao, hoje);
        var days = dur.getDayPart();
        var y = days / 360;
        var m = (days % 360) / 30;
        var d = (days % 30) % 30;
        var resp = Math.floor(y) + ' ano(s) ' + Math.floor(m) + ' mes(es) e ' + Math.floor(d) + ' dia(s)';
        return resp;
    },

    getDiffTime: function () {
        var start = this.getParameter('sysparm_start');
        //var start = new GlideDateTime(this.getParameter('sysparm_start'));
        //var end = new GlideDateTime(this.getParameter('sysparm_end'));
        // Duration in hours
        //var dataCom = start ? start : new GlideDateTime();
        //var dataFim = end ? end : new GlideDateTime();
        var diffDays = Math.floor((new GlideDateTime(start).getNumericValue() - new GlideDateTime().getNumericValue()) / (1000 * 60 * 60 * 24));

        /*var dur_seconds = gs.dateDiff(dataCom, dataFim, true); // returns the number of seconds as String
        var resp  = Math.round(dur_seconds / 3600); // Math.round() is optional and will round the number to the nearest integer ****** duration in hours
                 */
        //return resp;
        return diffDays;
    },

    addYears: function () {
        var date = this.getParameter('sysparm_date');
        var years = this.getParameter('sysparm_years');
        var gdt = new GlideDateTime(date);
        gdt.addYears(years);

        return gdt;

    },

    version: '4',

    type: 'AA_Generico'
});
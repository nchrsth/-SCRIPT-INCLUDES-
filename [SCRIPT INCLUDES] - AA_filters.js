
//Client Callable
var AA_Filters = Class.create();
AA_Filters.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	calcBusinessDays: function () {
		var startDate = this.getParameter('sysparm_startDate');
		var endDate = this.getParameter('sysparm_endDate');
		//var startDateParsed = Date.parse(startDate);
		//var endDateParsed = Date.parse(endDate);		
		var curDate = new Date(startDate.getTime());
		var count = 0;
		while (curDate <= endDate) {
			var dayOfWeek = curDate.getDay();
			if (!(dayOfWeek in [0, 6])) count++;
			curDate.setDate(curDate.getDate() + 1);
		}

		return count;
	},
    type: 'AA_Filters'
});
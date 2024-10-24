looker.plugins.visualizations.add({
    options: {
        html_template: {
            type: "string",
            label: "HTML Template",
            default: `<div style="text-align: center; color: #5A2FC2; font-family: 'Open Sans'; font-size: 5rem; font-weight: 700;">{{ value }}</div>`
        }
    },

    create: function(element, config) {},

    updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
        this.clearErrors();

        let htmlTemplate = config && config.html_template || this.options.html_template.default;

        const firstRow = data[0];
        const qFields = queryResponse.fields;

        if (qFields.dimension_like.length === 0 &&
            qFields.measure_like.length === 0) {
            this.addError({
                title: `No visible fields`,
                message: `At least one dimension, measure or table calculation needs to be visible.`
            })
        }

        const firstRowFields = qFields.dimension_like.concat(qFields.measure_like);
        for(field in firstRowFields) {
            const columnIndex = parseInt(field) + 1;
            const columnRef = `column_${columnIndex}`;
            const columnRexExpSingleVal = new RegExp("{{( *)value ( *)}}", "g");
            const columnRexExpNumeric = new RegExp("{{( *)" + columnRef + "( *)}}", "g");
            const columnRexExpByRef = new RegExp("{{( *)" + firstRowFields[field].name + "( *)}}", "g");
            const columnValue = LookerCharts.Utils.filterableValueForCell(firstRow[firstRowFields[field].name]);
            

			
			if (isNaN(parseFloat(columnValue)) || !isFinite(columnValue)) {
        // Handle non-numeric values (e.g., display an error message or leave the value unchanged)
        htmlTemplate = htmlTemplate.replace(columnRexExpSingleVal, columnValue);
        htmlTemplate = htmlTemplate.replace(columnRexExpNumeric, columnValue);
        htmlTemplate = htmlTemplate.replace(columnRexExpByRef, columnValue);   

      } else {
        const roundedColumnValue = parseFloat(columnValue).toFixed(2);
        htmlTemplate = htmlTemplate.replace(columnRexExpSingleVal, roundedColumnValue);
        htmlTemplate = htmlTemplate.replace(columnRexExpNumeric, roundedColumnValue);
        htmlTemplate = htmlTemplate.replace(columnRexExpByRef, roundedColumnValue);
      }
        }

        element.innerHTML = htmlTemplate;

        doneRendering();
    }
});
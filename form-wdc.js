(function () {
	var myConnector = tableau.makeConnector();

	myConnector.getSchema = function (schemaCallback) {
		var submission_cols = [{
			id: "id",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "formId",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "createdByPersonId",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "createdDateTime",
			dataType: tableau.dataTypeEnum.datetime
		}, {
			id: "lastModifiedDateTime",
			dataType: tableau.dataTypeEnum.datetime
		}];

		var submissionTable = {
			id: "submission",
			alias: "Submission Data",
			columns: submission_cols
		};

		var answer_cols = [{
			id: "submissionid",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "questionid",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "type",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "date",
			dataType: tableau.dataTypeEnum.date
		}, {
			id: "datetime",
			dataType: tableau.dataTypeEnum.datetime
		}, {
			id: "usemgrs",
			dataType: tableau.dataTypeEnum.bool
		}, {
			id: "mgrs",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "degreesLatitude",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "degreesLongitude",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "text",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "numeric",
			dataType: tableau.dataTypeEnum.string
		}];

		var answerTable = {
			id: "answer",
			alias: "Answer Data",
			columns: answer_cols
		};

		var answer_selection_cols = [{
			id: "submissionid",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "questionid",
			dataType: tableau.dataTypeEnum.string
		}, {
            id: "type",
            dataType: tableau.dataTypeEnum.string
        }, {
			id: "selection",
			dataType: tableau.dataTypeEnum.string
		}, {
            id: "other",
            dataType: tableau.dataTypeEnum.string
        }];
		
		var answerSelectionTable = {
			id: "answerselection",
			alias: "Answer Selection Data",
			columns: answer_selection_cols
		};

		schemaCallback([submissionTable, answerTable, answerSelectionTable]);
	}; 

	myConnector.getData = function (table, doneCallback) {
		var responseQueryParams = JSON.parse(tableau.connectionData);
        // TODO: make it understand paging?
        queryString = "formId=" + responseQueryParams.formId + "&page=0&size=1000";
//        apiCall = "https://www.pixtoday.net/form/response?" + queryString;
        apiCall = "http://localhost:7784/submission?" + queryString;

        var auth = '{"emailAddress":"joefitz@teslagov.com","password":"yourpasswordhere"}';

        $.ajax({
            type: "POST",
//            url: "https://api.pixtoday.net/rampart/token",
            url: "http://localhost:7773/token",
            data: auth,
            cache: false,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8"
            },
            dataType: 'json',
            success: function (data) {
                $.ajax({
                    type: "GET",
                    url: apiCall,
                    cache: false,
                    dataType: 'json',
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(resp) {
                        var feat = resp.content,
                            tableData = [];

                        var i = 0;
                        var j = 0;
                        var k = 0;

                        if (table.tableInfo.id == "submission") {
                            for (i = 0, len = feat.length; i < len; i++) {
                                tableData.push({
                                    "id": feat[i].id,
                                    "formId": feat[i].formId,
                                    "createdByPersonId": feat[i].createdByPersonId,
                                    "createdDateTime": new Date(feat[i].createdDateTime),
                                    "lastModifiedDateTime": new Date(feat[i].lastModifiedDateTime)
                                });
                            }
                        } else if (table.tableInfo.id == "answer") {
                            for (i = 0; i < feat.length; i++) {
                                if (typeof feat[i].answers !== 'undefined') {
                                    for (j = 0; j < feat[i].answers.length; j++) {
                                        if ('date-answer' == feat[i].answers[j].type)
                                        {
                                            tableData.push({
                                                "submissionid": feat[i].id,
                                                "questionid": feat[i].answers[j].questionId,
                                                "type": feat[i].answers[j].type,
                                                "date": new Date(feat[i].answers[j].value)
                                            });
                                        }
                                        else if ('date-time-answer' == feat[i].answers[j].type)
                                        {
                                            tableData.push({
                                                "submissionid": feat[i].id,
                                                "questionid": feat[i].answers[j].questionId,
                                                "type": feat[i].answers[j].type,
                                                "datetime": new Date(feat[i].answers[j].value)
                                            });
                                        }
                                        else if ('geography-answer' == feat[i].answers[j].type)
                                        {
                                            tableData.push({
                                                "submissionid": feat[i].id,
                                                "questionid": feat[i].answers[j].questionId,
                                                "type": feat[i].answers[j].type,
                                                "usemgrs": feat[i].answers[j].useMgrs,
                                                "mgrs": feat[i].answers[j].mgrs,
                                                "degreesLatitude": feat[i].answers[j].degreesLatitude,
                                                "degreesLongitude": feat[i].answers[j].degreesLongitude
                                            });
                                        }
                                        else if ('text-answer' == feat[i].answers[j].type)
                                        {
                                            tableData.push({
                                                "submissionid": feat[i].id,
                                                "questionid": feat[i].answers[j].questionId,
                                                "type": feat[i].answers[j].type,
                                                "text": feat[i].answers[j].value
                                            });
                                        }
                                        else if ('numeric-answer' == feat[i].answers[j].type)
                                        {
                                            tableData.push({
                                                "submissionid": feat[i].id,
                                                "questionid": feat[i].answers[j].questionId,
                                                "type": feat[i].answers[j].type,
                                                "numeric": feat[i].answers[j].value
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        else if (table.tableInfo.id == "answerselection") {
                            for (i = 0; i < feat.length; i++) {
                                if (typeof feat[i].answers !== 'undefined') {
                                    for (j = 0; j < feat[i].answers.length; j++) {
                                        if ('choice-answer' == feat[i].answers[j].type) {
                                            if (typeof feat[i].answers[j].selections !== 'undefined') {
                                                for (k = 0; k < feat[i].answers[j].selections.length; k++) {
                                                    tableData.push({
                                                        "submissionid": feat[i].id,
                                                        "questionid": feat[i].answers[j].questionId,
                                                        "type": feat[i].answers[j].type,
                                                        "selection": feat[i].answers[j].selections[k],
                                                        "other": feat[i].answers[j].other
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        table.appendRows(tableData);
                        doneCallback();
                    }
                });
            }
        });
    };

	tableau.registerConnector(myConnector);

	$(document).ready(function () {
		$("#submitButton").click(function () {
            var responseQueryParams = {
                formId: $('#formid').val().trim()
            };

            if (isNormalInteger(responseQueryParams.formId)) {
                tableau.connectionData = JSON.stringify(responseQueryParams);
                tableau.connectionName = "ClaraKM Form Feed";
                tableau.submit();
            } else {
                $('#errorMsg').html("FormId should be an interger.");
            }
		});
	});

    function isNormalInteger(str) 
    {
        return /^\+?([1-9][0-9]*)$/.test(str);
    }
})();


var Todoist = function (token, projectId) {
  this.token = token;
  this.projectId = projectId;
}

Todoist.prototype.getTasks = function () {
  var opts = {
    method: 'post',
    payload: {
      token: this.token,
      project_id: this.projectId
    },
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch('https://todoist.com/API/v7/projects/get_data', opts);
  return {
    isError: response.getResponseCode() != 200 ? true : false,
    content: JSON.parse(response.getContentText())
  }
};

module.exports = Todoist;

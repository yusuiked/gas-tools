var Slack = require('./slack');
var Todoist = require('./todoist');

global.notifyTodaySchedule = function () {
  var props = PropertiesService.getScriptProperties();

  var calendarIds = props.getProperty('GOOGLE_CALENDAR_ID').split(',');
  var events = {};
  calendarIds.forEach(function(calendarId) {
    var calendar = CalendarApp.getCalendarById(calendarId);
    events[calendar.getName()] = calendar.getEventsForDay(new Date());
  });

  var slack = new Slack(props.getProperty('SLACK_WEBHOOK_URL'));
  Object.keys(events).forEach(function (key) {
    slack.postEvents(key, events[key]);
  });
}

global.notifyTomorrowTodo = function() {
  var props = PropertiesService.getScriptProperties();

  var token = props.getProperty('TODOIST_TOKEN');
  var projectId = props.getProperty('TODOIST_PROJECT_ID');
  var todoist = new Todoist(token, projectId);
  var tasks = todoist.getTasks();
  var slack = new Slack(props.getProperty('SLACK_WEBHOOK_URL'));
  slack.postTodos(tasks);
}

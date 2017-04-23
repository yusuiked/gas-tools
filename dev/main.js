var Slack = require('./slack');
global.notifyTodaySchedule = function () {
  var props = PropertiesService.getScriptProperties();
  // 自分のカレンダーの今日のイベントを取得
  var events = CalendarApp.getCalendarById(props.getProperty('GOOGLE_CALENDAR_ID')).getEventsForDay(new Date());
  // Slack へ通知
  var slack = new Slack(props.getProperty('SLACK_WEBHOOK_URL'));
  slack.postEvents(events);
}

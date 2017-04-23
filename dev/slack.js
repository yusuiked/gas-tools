var Slack = function (webhookUrl) {
  this.webhookUrl = webhookUrl;
}

Slack.prototype.postEvents = function (calendarName, events) {
  var payload = buildPayload(calendarName, events);
  var opts = {
    method: 'POST',
    payload: JSON.stringify(payload)
  }
  var response = UrlFetchApp.fetch(this.webhookUrl, opts);
  Logger.log('HTTP Response Status: ' + response.getResponseCode + ', Response: ' + response.getContentText());
}

function buildPayload(calendarName, events) {
  var text = (events.length > 0
    ? '@here :fire::shuzo: 今日はカレンダー <' + calendarName + '> に ' + events.length + ' 件の予定があります :shuzo::fire:'
    : '@here カレンダー <' + calendarName + '> に :white_check_mark::free: 今日の予定はありません :tada::sparkles:'
  );
  var payload = {
    username: '本日のご予定 Bot',
    icon_emoji: ':calendar:',
    text: text,
    link_names: 1,
    attachments: []
  };
  if (events.length > 0) {
    events.forEach(function (event) {
      var attachment = {
        fallback: text,
        color: '#36a64f',
        author_name: calendarName,
        author_icon: 'https://secure.gravatar.com/avatar/ff937dd20d07581fd996a4669b6c8c81.jpg?s=16&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0012-16.png',
        title: event.getTitle(),
        fields: [
          {
            title: '予定時刻',
            value: event.isAllDayEvent() ? '終日' : formatTime(event.getStartTime(), event.getEndTime()),
            short: true
          },
          {
            title: '場所',
            value: event.getLocation(),
            short: true
          }
        ]
      };
      payload.attachments.push(attachment);
    });
  }
  return payload;
}

function formatTime(from, to) {
  return Utilities.formatDate(from, 'JST', 'HH:mm') + ' - ' + Utilities.formatDate(to, 'JST', 'HH:mm');
}

module.exports = Slack;

var Slack = function (webhookUrl) {
  this.webhookUrl = webhookUrl;
}

Slack.prototype.postEvents = function (events) {
  var payload = buildPayload(events);
  var opts = {
    method: 'POST',
    payload: JSON.stringify(payload)
  }
  var response = UrlFetchApp.fetch(this.webhookUrl, opts);
  Logger.log('HTTP Response Status: ' + response.getResponseCode + ', Response: ' + response.getContentText());
}

function buildPayload(events) {
  var text = (events.length > 0
    ? ':fire::shuzo: 今日は ' + events.length + ' 件の予定があります :shuzo::fire:'
    : ':white_check_mark::free: 今日は予定がありません :tada::sparkles:'
  );
  var payload = {
    username: '本日のご予定 Bot',
    icon_emoji: ':calendar:',
    text: text,
    attachments: []
  };
  if (events.length > 0) {
    events.forEach(function (event) {
      var attachment = {
        fallback: text,
        color: '#36a64f',
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

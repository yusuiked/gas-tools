var Slack = function (webhookUrl) {
  this.webhookUrl = webhookUrl;
}

Slack.prototype.postEvents = function (calendarName, events) {
  var payload = buildPayloadForEvents(calendarName, events);
  var opts = {
    method: 'POST',
    payload: JSON.stringify(payload)
  }
  var response = UrlFetchApp.fetch(this.webhookUrl, opts);
  Logger.log('HTTP Response Status: ' + response.getResponseCode + ', Response: ' + response.getContentText());
}

Slack.prototype.postTodos = function (tasks) {
  var payload = buildPayloadForTodos(tasks);
  var opts = {
    method: 'POST',
    payload: JSON.stringify(payload)
  }
  var response = UrlFetchApp.fetch(this.webhookUrl, opts);
  Logger.log('HTTP Response Status: ' + response.getResponseCode + ', Response: ' + response.getContentText());
}

function buildPayloadForTodos(tasks) {
  var payload = {
    username: '本日のToDo Bot',
    channel: '#todo',
    icon_emoji: ':memo:',
    link_names: 1,
    attachments: []
  };
  if (tasks.isError) {
    payload.text = ':warning: ToDo の取得に失敗しました :stuck_out_tongue_closed_eyes:';
  } else {
    payload.text = '@here 明日までが期限の ToDo リスト（' + tasks.content.project.name + '）のタスクだよ :memo:'
    tasks.content.items.forEach(function (item) {
      // 期限が設定されており、明日までのタスクのみ対象
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23);
      tomorrow.setMinutes(59);
      tomorrow.setSeconds(59);
      tomorrow.setMilliseconds(999);
      if (!item.due_date_utc || Date.parse(item.due_date_utc) > tomorrow.valueOf()) return;
      // item.indent がトップレベルかつ未完了のタスクのみ対象
      if (item.indent !== 1 || item.checked !== 0) return;
      var color;
      switch (item.priority) {
        case 1:
          color = '#cfcfcf';
          priorityText = '急いでない';
          break;
        case 2:
          color = 'good';
          priorityText = 'なるはや';
          break;
        case 3:
          color = 'warning';
          priorityText = '高';
          break;
        case 4:
          color = 'danger';
          priorityText = '至急';
          break;
        default:
          priorityText = '不明';
      }
      var attachment = {
        fallback: payload.text,
        color: color,
        title: item.content,
        fields: [
          {
            title: '優先度',
            value: priorityText,
            short: true
          },
          {
            title: '期限',
            value: Utilities.formatDate(new Date(Date.parse(item.due_date_utc)), 'JST', 'yyyy-MM-dd'),
            short: true
          }
        ]
      };
      payload.attachments.push(attachment);
    });
  }
  // 期限の降順
  payload.attachments.sort(function (a, b) {
    if (a.fields[1].value > b.fields[1].value) return -1;
    if (a.fields[1].value < b.fields[1].value) return 1;
    return 0;
  });
  payload.attachments = payload.attachments.slice(0, 6);
  return payload;
}

function buildPayloadForEvents(calendarName, events) {
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

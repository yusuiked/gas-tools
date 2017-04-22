var hello = require('./hello');
global.callHello = function () {
  Logger.log(hello('yukung'));
}

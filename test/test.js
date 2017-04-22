var assert = require('power-assert');
var hello = require('../../dev/hello');
describe('Array', function () {
    describe('#hello()', function() {
      it('should return Hello yukung when the value is yukung', function (){
        assert(hello('yukung') === 'Hello yukung');
      })
    })
});

window.Test =
Test = function () {

  var stats = {
    pass: 0,
    fail: 0,
    run: 0,
  };

  var context = '';

  var asserts = [];
  var yes = '<span style="color: rgb(40, 180, 0);">✔</span> ';
  var no = '<span style="color: rgb(180, 0, 0);">✘</span> '

  function assert(bool, message) {
    if (bool) stats.pass++;
    if (!bool) stats.fail++;
    stats.run++;

    message = '['+ context + '] ' + message;

    console.assert(bool, message);
    asserts.push((bool ? yes : no) + message);

    report();
  }

  function assertEqual(a, b, message) {
    assert(a == b, message);
  }

  function report() {
    document.body.innerHTML = asserts.join('<br>');
  }

  function done() {
    asserts.push('<strong>Tests: ' + stats.pass + ' / ' + stats.run + '</strong> &nbsp;–&nbsp; ' + stats.fail + ' failed ');
    report();
  }

  function run() {
    var t = 1;
    for (i in Test.Tests) {
      context = i;
      ++t;
      Test.Tests[i](function () {
        if (--t == 0) {
          done();
        }
      });
    }
    if (--t == 0) {
      done();
    }
  }

  window.assert = assert;
  window.assertEqual = assertEqual;

  run();
};

Test.Tests = {};
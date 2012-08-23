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

  function report() {
    document.body.innerHTML = asserts.join('<br>');
  }

  function done() {
    asserts.push('<strong>Tests: ' + stats.pass + ' / ' + stats.run + '</strong> &nbsp;–&nbsp; ' + stats.fail + ' failed ');
    document.body.style.backgroundColor = stats.pass == stats.run ? '#eeffee' : '#ffeeee';
    report();
  }

  function run() {
    var t = 1;
    for (i in Test.Tests) {
      context = i;
      ++t;
      try {
        Test.Tests[i](assert, function () {
          if (--t == 0) {
            done();
          }
        });
      }
      catch (e) {
        assert(false, 'Exception: ' + e);
        if (--t == 0) {
          done();
        }
        throw e;
      }
    }
    if (--t == 0) {
      done();
    }
  }

  run();
};

Test.Tests = {};
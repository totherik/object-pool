'use strict';

var test = require('tape');
var pool = require('../');


function once(fn) {
    return function () {
        var f = fn;
        fn = undefined;
        return f();
    };
}

function parallel(fns, cb) {
    var len;

    len = fns.length;
    fns.forEach(function (fn, i) {
        fn(function (err) {
            len -= 1;

            if (err) {
                cb(err);
                return;
            }

            if (len === 0) {
                cb();
            }
        })
    });
}

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

test('pool', function (t) {
    var gizmo, gizmos;

    gizmo = {};

    gizmos = pool(once(function factory() {
        return gizmo;
    }), 1);

    gizmos.acquire(function (err, acquired) {
        t.error(err);
        t.strictEqual(gizmo, acquired);
        setTimeout(function () {
            gizmos.release(acquired);
        }, 500);
    });

    gizmos.acquire(function (err, acquired) {
        t.error(err);
        t.strictEqual(gizmo, acquired);
        gizmos.release(acquired);
        t.end();
    });
});

test('available', function (t) {
    var gizmo, gizmos;

    gizmo = {};

    gizmos = pool(once(function factory() {
        return gizmo;
    }), 1);

    gizmos.acquire(function (err, acquired) {
        t.error(err);
        t.strictEqual(gizmo, acquired);
        gizmos.release(acquired);

        setTimeout(function () {
            gizmos.acquire(function (err, acquired) {
                t.error(err);
                t.strictEqual(gizmo, acquired);
                gizmos.release(acquired);
                t.end();
            });
        }, 500);
    });
});



test('size', function (t) {
    var maxObjects, gizmoPool, maxTasks, tasks;

    function task(rnd) {
        return function (done) {
            gizmoPool.acquire(function (err, gizmo) {
                if (err) {
                    done(err);
                    return;
                }
                setTimeout(function () {
                    gizmoPool.release(gizmo);
                    done();
                }, rnd);
            });
        };
    }


    maxObjects = 10;
    gizmoPool = pool(function () {
        maxObjects -= 1;
        t.ok(maxObjects >= 0);
        return { idx: maxObjects };
    }, maxObjects);


    maxTasks = 100;
    tasks = [];
    while (maxTasks--) {
        tasks[maxTasks] = task(rnd(0, 50));
    }

    parallel(tasks, function (err) {
        t.error(err);
        t.end();
    });
});


test('maxsize', function (t) {
    var objects, gizmoPool, maxTasks, tasks;

    function task(rnd) {
        return function (done) {
            gizmoPool.acquire(function (err, gizmo) {
                if (err) {
                    done(err);
                    return;
                }
                setTimeout(function () {
                    gizmoPool.release(gizmo);
                    done();
                }, rnd);
            });
        };
    }

    objects = 100;
    gizmoPool = pool(function () {
        objects -= 1;
        t.ok(objects >= 0);
        return { idx: objects };
    });

    maxTasks = 100;
    tasks = [];
    while (maxTasks--) {
        tasks[maxTasks] = task(rnd(0, 50));
    }

    parallel(tasks, function (err) {
        t.error(err);
        t.end();
    });
});




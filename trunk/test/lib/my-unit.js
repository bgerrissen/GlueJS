define(function(){

    var defaultTime = 100;

    function UnitTest( id, expect, allocatedTime ){
        var test = this;
        test.id = id;
        test.expect = expect || null;
        test.passed = 0;
        test.failed = 0;
        test.ran = 0;
        test.hasPassed = false;
        setTimeout(function(){
            done( test );
        },allocatedTime||defaultTime);
    }

    function fail( test, description, expected, value ) {
        UnitTest.on.fail({
            id: test.id,
            description: description,
            expected: expected,
            value: value
        });
        test.failed++;
        test.ran++;
    }

    function pass( test, description ) {
        UnitTest.on.pass({
            id: test.id,
            description: description
        });
        test.passed++;
        test.ran++;
    }

    function done( test ){
        var passed = !test.failed && ( !test.expect || test.expect === test.passed );
        UnitTest.on.done({
            id: test.id,
            nrFailed: test.failed,
            nrPassed: test.passed,
            ran: test.ran,
            expected: test.expect,
            passed: passed,
            failed: !passed
        });
    }

    UnitTest.prototype = {

        assert: function( expect, description ){
            if ( "boolean" != typeof expect || !expect ) {
                fail( this, description, true, expect );
            } else if ( expect ) {
                pass( this, description );
            }
        },

        equals: function( expect, value, description ){
            if ( expect !== value ) {
                fail( this, description, expect, value );
            } else {
                pass( this, description );
            }
        }

    };

    UnitTest.on = {

        done: function( result ){
            console.log( "********************" );
            console.log( ( result.failed ? "* FAILED" : "* PASSED" ) + " " + result.id );
            console.log([
                "* ran: " + result.ran,
                "expected: " + result.expected,
                "passed: " + result.nrPassed,
                "failed: " + result.nrFailed
            ].join(", "));
            console.log( "********************" );
        },

        fail: function( result ){
            console.warn( "* fail: " + result.description );
            console.warn( "* - expected: " + result.expected );
            console.warn( "* - was: " + result.value );
        },

        pass: function( result ){
            console.log( "* " + result.id + " -> pass: " + result.description );
        }

    };

    return UnitTest;


});
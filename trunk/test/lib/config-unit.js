define(function(){

    var doc = document;

    return function( unit ){

        unit.on = {

            pass: function( res ){
                var el = doc.getElementById( res.id );
                var div = doc.createElement("div");
                div.className = "pass";
                div.innerHTML = "PASS -> " + res.description;
                el.appendChild( div );
            },

            fail: function( res ){
                var el = doc.getElementById( res.id );
                var div = doc.createElement("div");
                div.className = "fail";
                div.innerHTML = [
                    "FAILED -> " + res.description,
                    "expectd " + res.expected + " received " + res.value
                ].join("<br />");
                el.appendChild( div );
            },

            done: function( res ){
                var el = doc.getElementById( res.id );
                var flag = el.getElementsByTagName("span")[0];
                if ( res.passed ) {
                    flag.className = "pass";
                } else {
                    flag.className = "fail";
                }
                var p = doc.createElement("p");
                p.innerHTML = [
                    "ran: " + res.ran,
                    "expected: " + res.expected,
                    "passed: " + res.nrPassed,
                    "failed: " + res.nrFailed
                ].join(", ");
                el.appendChild( p );
            }

        };

    }

});
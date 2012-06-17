(function(){

    var toString = Object.prototype.toString;

    function extractConfig( str ) {

        var re = /\/\/\s*@([^=\s]+)\s*=\s*([^\n\r]+)/mg
        , m
        , ns
        , val
        , config = {};

        while( ( m = re.exec( str ) ) !== null ) {

            ns = m[ 1 ].split( "." );
            val = m[ 2 ].replace( /^\s+|\s+$/ , "" );

            if ( ns.length === 1 ) {

                extractConfig.setValue( config , m[ 1 ] , val );

            } else {

                extractConfig.resolveNamespace( config , ns , val );

            }

        }

        return config;

    }

    extractConfig.setValue = function( obj , key , val ) {

        var cur = obj[ key ];

        val = isNaN( val ) ? val : +val;

        if ( !cur ) {

            obj[ key ] = val;

        } else if ( toString.call( cur ) != "[object Array]" ) {

            obj[ key ] = [ cur , val ];

        } else {

            obj[ key ].push( val );

        }

    };

    extractConfig.resolveNamespace = function( obj , ns , val ){

        var n, isArray, cur;

        while ( ns.length > 1 ) {

            n = ns.shift();
            obj = obj[ n ] || ( obj[ n ] = {} );

        }

        extractConfig.setValue( obj , ns.shift() , val );

        return obj;

    };

    var o = extractConfig( document.getElementById( "GlueJS" ).innerHTML );

    console.log( o );
    console.log( o.baseUrl );
    console.log( o.deps );
    console.log( o.paths.vpro );
    console.log( o.paths.ext );
    console.log( o.foo.bar );



}());

/** @author Ben Gerrissen
 *  @license MIT, GPL
 *  @version 0.2 ( 1 - 11 - 2010 )
 */
(function( global , doc ){

    // constants, tiny minification boost and no need to write quotes.
    var FUNCTION = "function"
    , ARRAY = "array"
    , STRING = "string"
    , OBJECT = "object"
    , BOOLEAN = "boolean"
    , FAILED = -1
    , NEW = 0
    , LOADING = 1
    , PENDING = 2
    , COMPLETE = 3

    , UID = +new Date()

    // utilities

    , slice = Array.prototype.slice
    , toTypeString = Object.prototype.toString
    , type = function ( obj ) {

        return toTypeString.call( obj ).replace( /\[object\s|\]/g , "" ).toLowerCase();

    }
    , mixin = function ( /* deep , receiver , provider , override */ ) {

        var args = slice.call( arguments )
        , deep = false
        , receiver = args[ 0 ]
        , provider = args[ 1 ]
        , override = args[ 2 ]
        , property;

        if ( type( args[ 0 ] ) === BOOLEAN ) {

            deep = args[ 0 ];
            receiver = args[ 1 ];
            provider = args[ 2 ];
            override = args[ 3 ];

        }

        for ( property in provider ) {

            if ( !provider.hasOwnProperty( property ) ) {

                continue;

            }

            if ( deep && type( provider[ property ] ) === OBJECT ) {

                if ( type( receiver[ property ] ) !== "object" ) {

                    receiver[ property ] = {};

                }

                mixin( deep , receiver[ property ] , provider[ property ] );

            } else if ( override || !receiver[ property ] ) {

                receiver[ property ] = provider[ property ];

            }

        }

        return receiver;

    }

    /**Event engine
     *
     */
    , eventRegistry = {}
    , listen = function ( eventType , listener ) {

        if ( !eventRegistry[ eventType ] ) {

            eventRegistry[ eventType ] = [];

        }

        eventRegistry[ eventType ].push( listener );

    }
    , deafen = function( eventType , listener ) {

        var list = eventRegistry[ eventType ]
        , i;

        if ( list ) {

            i = list.length;

            while ( i && i-- ) {

                if ( list[ i ] === listener ) {

                    list.splice( i , 1 );
                    i--;

                }

            }

        }

    }
    , notify = function ( eventType , data ) {

        var eventObject
        , list = eventRegistry[ eventType ]
        , i
        , len
        , listener;

        if ( list && list.length ) {

            list = [].concat( list );

            eventObject = mixin( true , {
                type : eventType,
                deafen : function () {

                    deafen( eventType , eventObject.currentListener );

                }
            } , data , false );

            for ( i = 0 , len = list.length ; i < len ; i++ ) {

                listener = list[ i ];

                eventObject.currentListener = listener;

                try {

                    if ( typeof listener === FUNCTION ) {

                        listener( eventObject );

                    } else if ( listener.handleEvent ) {

                        listener.handleEvent( eventObject );

                    }

                } catch ( e ) {

                    notify( "glue:error" , {
                        message : e
                    } );

                }

            }

        }

    }

    /**Public domain
     *
     */
    , publicSettings = {}
    , set = function ( varName , varValue ) {

        var objType = type( arguments[ 0 ] );

        if ( arguments.length === 1 && objType === OBJECT ) {

            mixin( publicSettings , arguments[ 0 ] , true );

        } else if ( objType === STRING ) {

            publicSettings[ arguments[ 0 ] ] = arguments[ 1 ];

        }

    }

    , get = function ( varName ) {

        return publicSettings[ varName ];

    }

    /** Glue Expressions
     *
     */
    , regExp = /([^\s]*)(?:\s?\(([^\)]+)\))?/
    , parse = function ( obj ) {

        if ( type( obj ) !== STRING ) {

            return obj;

        }

        var m = obj.match( regExp )
        , result = {};

        if ( m[ 1 ] ) {

            result.path = m[ 1 ];

        }

        if ( m[ 2 ] ) {

            result.lookup = m[ 2 ].replace( /\s/g , "" ).split( "," );

        }

        return result;

    }

    /**Path resolving
     *
     */
    , forced = {}
    , force = function ( originalPath , forcedPath ) {

        forced[ originalPath ] = forcedPath;

    }
    , finalExpr = function ( glueExp ) {

        var hash = {}
        , path = parse( glueExp ).path
        , newExp = glueExp;

        while ( forced[ path ] ) {

            if ( hash[ path ] ) {

                notify( "glue:error" , {
                    message : "CircularReferenceError: forced path '" + glueExp + "' lead to a cirular reference, operation cancelled."
                } );

                return glueExp;

            }

            newExp = forced[ path ];
            path = parse( newExp ).path;
            hash[ path ] = true;

        }

        return newExp;

    }
    , getSource = function ( path ) {

        var postFix = publicSettings.debug ? "?" + (++UID) : "";

        for ( var context in mappings ) {

            if ( mappings.hasOwnProperty( context ) && mappings[ context ].test( path ) ) {

                return path.replace( mappings[ context ] , context ) + ".js" + postFix;

            }

        }

        return publicSettings.defaultContext + path + ".js" + postFix;

    }
    , mappings = {}
    , map = function ( prefix /* , context */ ) {

        var objType = type( prefix )
        , context = arguments[ 1 ]
        , key;

        if ( objType === STRING ) {

            prefix = new RegExp( "^" + prefix );
            mappings[ context ] = prefix;

        } else if ( objType === OBJECT ) {

            for( key in prefix ) {

                map( key , prefix[key] );

            }

        }

    }

    /** Module management
     *
     */
    , registry = {}
    , insertStack = []
    , getRecord = function ( glueExp ) {

        glueExp = parse( glueExp );

        if ( !glueExp.path ) {

            return null;

        }

        if ( registry[ glueExp.path ] ) {

            return registry[ glueExp.path ];

        }

        return registry[ glueExp.path ] = mixin( {
            status : NEW,
            needs : [],
            fetch : [],
            exports : [],
            source : getSource( glueExp.path ),
            data : glueExp
        } , glueExp );

    }
    , cleanRecord = function ( record ) {

        delete record.data;
        delete record.needs;
        delete record.fetch;
        delete record.source;
        delete record.imports;
        delete record.node;
        delete record.callback;

    }
    , filter = function ( list ) {

        var missing = []
        , i = list.length;

        while ( i && i-- ) {

            if ( list[ i ].status !== COMPLETE ) {

                missing.push( list[ i ] );

            }

        }

        return missing;

    }
    , format = function ( list ) {

        var i = list.length
        , parsed;

        while ( i && i-- ) {

            parsed = parse( finalExpr( list[ i ] ) );

            if ( parsed.path ) {

                list[ i ] = getRecord( parsed );

            } else {

                list.splice( i , 1 );

            }

        }

        return list;

    }
    , resolve = function ( e ) {

        var record = getRecord( e.path )
        , data = insertStack.pop()
        , i
        , name;

        if ( !record ) {

            return;

        }

        if ( data ) {

            mixin( record , data , true );

        } else if ( e.lookup ) {

            i = e.lookup.length;

            while ( i && i-- ) {

                name = e.lookup[ i ];

                record.exports[ i ] = global[ name ];

                if ( publicSettings.cleanGlobal ) {

                    delete global[ name ];

                }

            }

        }

        if ( !record.fetch.length ) {

            complete( record );

        } else {

            record.status = PENDING;

            listen( "glue:complete" , function ( e ) {

                record.fetch = filter( record.fetch );

                if ( !record.fetch.length && record.status !== 3 ) {

                    e.deafen();

                    complete( record );

                }

            } );

        }

        insertStack = [];


    }
    , complete = function ( record ) {

        if ( !record ) {

            return;

        }

        if ( record.needs.length ) {

            record.imports = getImports( record.needs );

        }

        if ( record.callback ) {

            try {

                record.exports.push( record.callback.apply( null , record.imports ) );

            } catch ( e ) {

                notify( "glue:error" , {
                    message : e
                } );

            }

        }

        record.status = COMPLETE;

        cleanRecord( record );

        notify( "glue:complete" , {
            path : record.path,
            exports : record.exports
        } );

    }
    , getImports = function ( list ) {

        var i = list.length
        , imports = [];

        while ( i && i-- ) {

            imports = [].concat( imports , list[ i ].exports );

        }

        return imports;

    }

    /**Script loader
     *
     */
    , scripts = doc.getElementsByTagName( "script" )
    , scriptNode = doc.createElement( "script" )
    , scriptAnchor = scripts[ scripts.length - 1 ]
    , defaultContext = scriptAnchor.src.replace( /[^\\\/]*\.js[^\\\/]?$/ , "" )
    , load = function ( list ) {

        if ( list && list.length ) {

            scriptAnchor.parentNode.insertBefore(
                appendNodes( list , doc.createDocumentFragment() ) ,
                scriptAnchor
            );

        }

    }
    , appendNodes = function ( list , fragment ) {

        var i = list.length
        , node
        , record;

        while ( i && i-- ) {

            record = list[ i ];

            if ( record.status === NEW ) {

                node = setNode( record , fragment );

            }

            record.status = LOADING;

        }

        node = null;

        return fragment;

    }
    , startTimeout = function( record ) {

        record.timeoutID = setTimeout( function () {

            fail( record );

        } , publicSettings.scriptTimeout );

    }
    , fail = function( record ) {

        record.status = FAILED;

        notify( "glue:error" , {
            message : "LoadError: Failed to load resource '"+record.path+"' at '"+record.source+"'"
        } );

    }
    , setNode = function ( record , fragment ) {

        var node = record.node = scriptNode.cloneNode( false );

        node.src = record.source;

        fragment.appendChild( node );

        var listener = function () {

            var node = record.node;

            if ( !node.readyState || /complete|loaded/i.test( node.readyState ) ) {

                if ( !publicSettings.debug ) {

                    node.parentNode.removeChild( node );

                }

                record.node = node.onreadystatechange = node.onload = null;

                notify( "glue:loaded" , record.data );

                clearTimeout( record.timeoutID );

            }

            node = null;

        };

        node.onreadystatechange = node.onload = listener;

        node = null;

        startTimeout( record );

        notify( "glue:loading" , record.data );

    }

    /*
    , manifest = {}
    , fullNeeds = function ( list ) {

        var result = []
        , i
        , needs;

        if ( !list ) {

            return result;

        }

        i = list.length;

        while ( i-- ) {

            needs = manifest[ list[ i ].path ].needs;

            if ( needs && needs.length ) {

                result = result.concat( needs );

            }

        }

        if ( result.length ) {

            return list.concat( fullNeeds( result ) );

        } else {

            return list;

        }

    }
    , addBundle = function ( bundle ) {

        var obj
        , needs
        , exp
        , inserted = [];

        for ( exp in bundle.contains ) {

            obj = parse( exp );
            needs = bundle.contains[ exp ];

            if ( !obj.path ) {

                continue;

            }

            manifest[ obj.path ] = obj;
            inserted.push( obj );

            if ( needs ) {

                needs = [].concat( needs );

                format( needs );

                obj.needs = needs;

            }

        }

        while ( ( obj = inserted.pop() ) ) {

            obj.needs = fullNeeds( obj.needs );

        }

        // todo: remove duplicates, can leave it for now.

    }
    */

    /**Glue implementation
     *
     */
    , formatArguments = function ( args ) {

        var data = {}
        , needs = []
        , i = args.length
        , obj
        , objType;

        while ( i && i-- ) {

            obj = args[ i ];
            objType = type( obj );

            if ( objType === STRING ) {

                needs.push( obj );

            } else if ( objType === ARRAY ) {

                needs = needs.concat( obj );

            } else if ( objType === FUNCTION ) {

                data.callback = obj;

            }

        }

        data.needs = format( needs );
        data.fetch = filter( needs );

        return data;

    }

    , glue = function ( /* [ needs* ] [ , callback ] */ ) {

        var data = formatArguments( arguments );

        insertStack.push( data );

        if ( data.fetch ) {

            load( data.fetch );

        }

    }
    , use = function ( /* [ needs* , ] , callback*/ ){

        var data = formatArguments( arguments );

        if ( data.fetch.length ) {

            listen( "glue:complete" , function ( e ) {

                data.fetch = filter( data.fetch );

                if ( !data.fetch.length ) {

                    e.deafen();
                    data.callback.apply( null , getImports( data.needs ) );

                }

            } );

            load( data.fetch );

        } else {

            data.callback.apply( null , getImports( data.needs ) );

        }

    };

    listen( "glue:loaded" , resolve );

    set( {
        defaultContext : defaultContext,
        cleanGlobal : true,
        debug : false,
        scriptTimeout : 5000
    } );

    glue.map = map;
    glue.set = set;
    glue.get = get;
    glue.use = use;
    glue.force = force;
    glue.listen = listen;
    glue.deafen = deafen;
    glue.notify = notify;

    global.glue = glue;

}( window , document ));
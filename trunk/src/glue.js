/** @author Ben Gerrissen
 *  @license MIT, GPL
 *  @version 0.1 ( 31 - 10 - 2010 )
 *
 * 
 * 
 */

(function( global , doc ){

    // constants, tiny minification boost and no need to write quotes.
    var FUNCTION = "function"
    , ARRAY = "array"
    , STRING = "string"
    , OBJECT = "object"
    , REGEXP = "regexp"
    , BOOLEAN = "boolean"

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

    // event engine
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

        if ( eventRegistry[ eventType ] ) {

            i = list.length;

            while ( i-- ) {

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

                    deafen( eventType , this.currentListener );

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

    // used to store public objects
    , publicSettings = {}
    , set = function ( varName , varValue ) {

        var args = arguments
        , objType = type( args[ 0 ] );

        if ( args.length === 1 && objType === OBJECT ) {

            mixin( publicSettings , args[ 0 ] , true );

        } else if ( objType === STRING ) {

            publicSettings[ args[ 0 ] ] = args[ 1 ];

        }

    }
    , get = function ( varName ) {

        return publicSettings[ varName ];

    }

    //glue expressions, keeping it small for now
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

    // module management
    , registry = {}
    , pending = {}
    , insertStack = []
    , filter = function ( list ) {

        var missing = []
        , i = list.length
        , path
        , record;

        while ( i-- ) {

            path = list[ i ].path;
            record = registry[ path ];

            if ( path && ( !record || !record.ready ) ) {

                missing.push( list[ i ] );

            }

        }

        return missing;

    }
    , register = function ( record ) {

        if ( record.path && !registry[ record.path ] ) {

            registry[ record.path ] = record;

            if ( record.fetch && record.fetch.length ) {

                record.ready = false;

                listen( "glue:complete" , function ( e ) {

                    record.fetch = filter( record.fetch );

                    if ( !record.fetch.length ) {

                        e.deafen();
                        complete( record );

                    }

                } );

                load( record.fetch );

            } else {

                complete( record );

            }

        } else {

            insertStack.push( record );

        }

    }
    , getImports = function ( needs ) {

        var i = needs.length
        , resource
        , imports = [];

        while ( i-- ) {

            resource = needs[ i ];
            imports = [].concat( imports , registry[ resource.path ].exports );

        }

        return imports;

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

                record.exports = record.callback.apply( null , record.imports );

            } catch ( e ) {

                notify( "glue:error" , {
                    message : e
                } );

            }
        }

        delete record.imports;
        delete record.callback;
        delete record.fetch;
        delete record.needs;

        record.ready = true;

        notify( "glue:complete" , {

            path : record.path,
            exports : record.exports

        } );

    }
    , resolve = function ( e ) {

        var record
        , i
        , objName;

        if ( insertStack.length === 1 && e.path ) {

            record = insertStack.pop();
            record.path = e.path;

        } else if ( e.lookup ) {

            i = e.lookup.length;
            record = {
                path : e.path,
                exports : [],
                needs : []
            };

            while ( i-- ) {

                objName = e.lookup[ i ];

                record.exports[ i ] = global[ objName ];

                if ( publicSettings.cleanGlobal ) {

                    delete global[ objName ];

                }

            }

        }

        if ( record ) {

            register( record );

        }

        insertStack = [];

    }

    // path resolving
    , forced = {}
    , force = function ( originalPath , forcedPath ) {

        forced[ originalPath ] = forcedPath;

    }
    , finalFormat = function ( obj ) {

        if ( forced[ obj.path ] ) {

            return finalFormat( parse( forced[ obj.path ] ) );

        }

        return obj;

    }
    , format = function ( list ) {

        var i = list.length
        , obj;

        while ( i-- ) {

            obj = parse( list[ i ] );

            if ( obj.path ) {

                obj = list[ i ] = finalFormat( obj );
                obj.src = getSource( obj.path );

            } else {

                // useless bullshit!
                list.splice( i , 1 );

            }

        }

        return list;

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

    // script loading
    , scripts = doc.getElementsByTagName( "script" )
    , scriptNode = doc.createElement( "script" )
    , scriptAnchor = scripts[ scripts.length - 1 ]
    , defaultContext = scriptAnchor.src.replace( /[^\\\/]*\.js[^\\\/]?$/ , "" )
    , load = function ( list ) {

        if ( list && list.length ) {

            scriptAnchor.parentNode.insertBefore( appendNodes( list , doc.createDocumentFragment() ) , scriptAnchor );

        }
    }
    , appendNodes = function ( list , fragment ) {

        var i = list.length
        , node
        , obj;

        while ( i-- ) {

            obj = list[ i ];

            if ( !pending[ obj.path ] ) {

                node = setNode( obj , fragment );

            }

            pending[ obj.path ] = true;

        }

        node = null;

        return fragment;

    }
    , startTimeout = function( obj ) {

        obj.timeoutID = setTimeout( function () {

            fail( obj );

        } , publicSettings.scriptTimeout );

    }
    , fail = function( obj ) {

        delete pending[ obj.path ];

        notify( "glue:error" , {
            message : "LoadError: Failed to load resource '"+obj.src+"'"
        } );

    }
    , setNode = function ( obj , fragment ) {

        var objData = mixin( {} , obj )
        , node = obj.node = scriptNode.cloneNode( false );

        node.src = obj.src;

        fragment.appendChild( node );

        var listener = function () {

            var node = obj.node;

            if ( !node.readyState || /complete|loaded/i.test( node.readyState ) ) {

                if ( !publicSettings.debug ) {

                    node.parentNode.removeChild( node );

                }

                obj.node = node.onreadystatechange = node.onload = null;

                delete pending[ obj.path ];

                notify( "glue:loaded" , objData );

                clearTimeout( obj.timeoutID );

            }

            node = null;

        };

        node.onreadystatechange = node.onload = listener;

        node = null;

        startTimeout( obj );

        notify( "glue:loading" , objData );

    }

    // bundles
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

    , createRecordFromArguments = function ( args ) {

        var record = {}
        , needs = []
        , i = args.length
        , obj
        , objType;

        while ( i-- ) {

            obj = args[ i ];
            objType = type( obj );

            if ( objType === STRING ) {

                needs.push( obj );

            } else if ( objType === ARRAY ) {

                needs = needs.concat( obj );

            } else if ( objType === FUNCTION ) {

                record.callback = obj;

            }

        }

        record.needs = format( needs );
        record.fetch = filter( needs );

        return record;

    }

    // TEH GLUE
    , glue = function ( /* [ needs* , ] callback */) {

        var record = createRecordFromArguments( arguments );

        if ( record.callback ) {

            register( record );

        } else {

            load( record.fetch );

        }

    }
    , use = function ( /* [ needs* , ] , callback*/ ){

        var record = createRecordFromArguments( arguments );

        if ( record.fetch.length ) {

            listen( "glue:complete" , function ( e ) {

                record.fetch = filter( record.fetch );

                if ( !record.fetch.length ) {

                    e.deafen();
                    record.callback.apply( null , getImports( record.needs ) );

                }

            } );

            load( record.fetch );

        } else {

            record.callback.apply( null , getImports( record.needs ) );

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
    // glue.bundle = addBundle; // not ready yet
    glue.listen = listen;
    glue.deafen = deafen;
    glue.notify = notify;

    global.glue = glue;


}( this , document ));
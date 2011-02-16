/*
    Author : Ben Gerrissen
    License : MIT
    Version : 0.2.0
*/

define( function(){

    var config = {
        toolkit : "jquery"
    }
    , currentCommand // command
    , queue = []
    , registry = {} // stored instances
    , shelved = {} // lazy commands
    , reserved = {} // reserved ID's
    , now = {} // commands that need to be resolve in the future.
    , onStoreListeners = {}

    , glueReady

    , idReg = /^@/

    , slice = Array.prototype.slice

    , clone = ( "__proto__" in {} ) ? function ( obj , newProperties ) {

        obj = {
            __proto__ : obj
        };

        return newProperties ? inject( obj , newProperties ) : obj;

    } : function ( obj , newProperties ) {

        function Empty(){}
        Empty.prototype = obj;
        obj = new Empty;

        return newProperties ? inject( obj , newProperties ) : obj;

    }

    , toolkit = {
        JQUERY : "jquery"
    }

    , toolkitConfig = {
        jquery : {
            test : function(){
                return !!window.jQuery;
            },
            url : [ "http://code.jquery.com/jquery-1.5.min.js" ],
            adapter : {
                find : function ( expr ) {
                    return jQuery( expr );
                },
                node : function( node ){
                    return jQuery( node );
                },
                listen : function ( obj , eventType , listener ) {
                    return obj.bind( eventType , listener );
                },
                deafen : function ( obj , eventType , listener ) {
                    return obj.unbind( eventType , listener );
                }
            }
        }
    }

    // will be set later on if require.isBrowser is true.
    , getToolkit

    ;

    function type( obj ) {

        return toString.call( obj ).replace( /^\[\s*object\s*|\]$/g , "" ).toLowerCase();

    }

    function Command( src ) {

        this.src = src;
        this.set = [];
        this.args = [];
        this.run = [];

    }

    /**Registers current (command) as final.
     */
    function register() {

        console.log( "@register" );
        console.log( currentCommand );

        if ( !currentCommand ) {

            return;

        }

        if ( !glueReady ) {

            queue.push( currentCommand );

        } else {

            resolve( currentCommand );

        }

        currentCommand = null;

    }

    function store( id , instance ) {

        registry[ id ] = instance;

        if ( onStoreListeners[ id ] ) {

            while ( onStoreListeners[ id ].length ) {

                onStoreListeners[ id ].pop()( instance );

            }

            delete onStoreListeners[ id ];

        }

    }

    function onStore( id , listener ) {

        if ( registry[ id ] ) {

            listener( registry[ id ] );
            return;

        }

        if ( !onStoreListeners[ id ] ) {

            onStoreListeners[ id ] = [];

        }

        onStoreListeners[ id ].push( listener );

    }

    function shelf( command ) {

        shelved[ command.id ] = command;

    }

    function unshelf( id ) {

        console.log( "@unshelf" );

        if ( shelved[ id ] ) {

            shelved[ id ].now = true;
            resolve( shelved[ id ] );
            delete shelved[ id ];

        } else {

            now[ id ] = true;

        }

    }

    function resolve( command ) {

        console.log( "@resolve" );
        console.log( command );

        if ( command.now || ( command.id && now[ command.id ] ) ) {

            assemble( command );

        } else if ( command.when ) {

            resolve.when( command );

        } else if ( command.id ) {

            shelf( command );

        } else {

            throw "Glue Command is useless!";

        }

    }

    resolve.when = function( command ){



    };

    /**Once source is complete, obj.module property will be set.
     *
     * @param obj Object with .src attribute
     */
    function fetch( obj , completed , ns ) {

        console.log( "@fetch" );
        console.log( obj );

        function setter( res ) {

            console.log( "@fetch@setter" );
            console.log( res );

            var i, len;

            if ( ns ) {

                i = 0;
                len = ns.length;

                for ( i ; i < len ; i++ ) {

                    if ( !res[ ns[ i ] ] ) {

                        throw "Resolving namespace failed. Namespace: '" + ns.join( "." ) + "' at module: '" + obj.src + "'";

                    }

                    res = res[ ns[ i ] ];

                }

            }


            obj.module = res;
            completed();

        }

        if ( idReg.test( obj.src ) ) {

            onStore( obj.src , setter );
            unshelf( obj.src );

        } else {

            require( [ obj.src ] , setter );
            
        }

    }

    function assemble( command ) {

        console.log( "@assemble" );
        console.log( command );

        var pending = 1 + command.set.length
        , i = command.set.length
        , received = function(){

            console.log( "@received" );
            console.log( pending - 1 )

            if ( --pending === 0 ) {

                execute( command );

            }

        };

        fetch( command , received , command.ns );

        while( i-- ) {

            if ( typeof command.set[ i ].src == "string" ) {

                fetch( command.set[ i ] , received , command.ns );

            }

        }

    }

    function inject( obj , list ) {

        console.log( "@inject" );
        console.log( obj );
        console.log( list );

        var c,o;

        while ( list.length ) {

            c = list.pop();
            o = c.preserve ? c.module : createInstance( o );

            if ( obj[ c.set ] ) {

                obj[ c.set ]( o );

            } else {

                obj[ c.key ] = o;

            }

        }

    }

    function createInstance( obj , set , args ) {

        var newObj;

        if ( typeof obj == "function" ) {

            newObj = clone( obj.prototype );
            newObj.constructor = obj


        } else if ( type( obj ) == "object" ) {

            newObj = clone( obj );

        } else {

            return null;

        }

        if ( set.length ) {

            inject( newObj , set );

        }

        if ( typeof newObj.constructor == "function" ) {

            newObj.constructor.apply( newObj , args );

        }

        return newObj;

    }

    function execute( command ) {

        var instance = createInstance( command.module , command.set , command.args );

        console.log( "@execute" );
        console.log( instance );

        if ( command.id ) {

            store( command.id , instance );

        }

    }

    function commandBuilder( src , ns ) {

        register();

        currentCommand = new Command( src );

        return ns ? commandBuilder.ns( ns ) : commandBuilder;

    }

    commandBuilder.args = function(){

        currentCommand.args = currentCommand.args.concat( slice.call( arguments ) );

        return commandBuilder;

    };

    commandBuilder.as = function ( id ) {

        if ( typeof id == "string" ) {

            id = "@" + id;

            if ( reserved[ id ] ) {

                throw "ID " + id + " is already taken."

            }

            if ( now[ id ] ) {

                currentCommand.now = true;

            }

            currentCommand.id = id;
            reserved[ id ] = true;

        }

        return commandBuilder;

    };

    commandBuilder.set = function ( key , value ) {

        if ( typeof key == "string" && value ) {

            currentCommand.set.push( {

                key : key,
                set : "set" + key.replace( /^\w/ , key[ 0 ].toUpperCase() ),
                src : value,
                preserve : typeof value == "string" &&  idReg.test( value )

            } );

        }

        return commandBuilder;

    };

    commandBuilder.run = function ( method , args ) {

        if ( typeof key == "string" && value ) {

            currentCommand.run.push( {

                method : method,
                args : [].concat( args )

            } );

        }

        return commandBuilder;

    };

    commandBuilder.now = function () {

        currentCommand.now = true;

        return commandBuilder;

    };

    commandBuilder.ns = function ( ns ) {

        if ( typeof ns == "string" ) {

            currentCommand.ns = ns.replace( /^\.|\.$/g , "" ).split( "." );

        }

        return commandBuilder;

    }

    commandBuilder.on = {

        find : function () {},

        http : function () {},

        event : function () {}

    };

    function glue ( src , ns ) {

        if ( getToolkit ) {

            getToolkit();

        }

        // timeout will actually only fire once thread is clear
        // which will be after the glue dot chaining is done.
        setTimeout( register , 10 );

        return commandBuilder( src , ns );

    }

    glue.config = function( settings ){

        var setting;

        for ( setting in settings ) {

            if ( config[ setting ] && typeof config[ setting ] == typeof settings[ setting ] ) {

                config[ setting ] = settings[ setting ];

            }

        }

        return glue;

    };

    if ( require.isBrowser ) {

        getToolkit = function(){

            var cfg = toolkitConfig[ config.toolkit ]

            , setup = function(){

                tool = cfg.adapter;
                glueReady = true;

                while ( queue.length ) {

                    resolve( queue.pop() );

                }

            };

            if ( !cfg ) {

                throw "Toolkit '" + config.toolkit + "' is not supported by GlueJS.";

            }

            if ( cfg.test() ) {

                setup();

            } else {

                require( cfg.url , function ( maybe ) {

                    if ( !cfg.test() ) {

                        throw "Toolkit loaded but no toolkit found in global scope.";

                    }

                    setup();

                } );

            }
            
            // can only be called once!
            getToolkit = null;

        }

    }

    return glue;

} );
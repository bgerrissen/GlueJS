/*

    @version: 0.1.0
    @author: Ben Gerrissen - bgerrissen@gmail.com
    @license: MIT

    @notice:

        gluejs is currently in development, whilst working in primetime browsers, it hasn't been
        tested in all browsers, legacy or otherwise.
        If you are considering using gluejs, try it out first in a clickmodel or hobby project
        and keep an eye on gluejs news (no sources yet)

    @roadmap

        * question mark means uncertain
        * premilinary, can change

        VERSION 0.1.1
        - optimise and clean up code
        - documentation
        - code comments (should've done this before writing the method/functions...
        - more unit tests
        - fix bugs

        VERSION 0.2.0
        - run checker on DOM mutation events (incl. legacy browser fallbacks)
        - ? engineer .connect() method
        - DOM helper plugins (use NWMatcher to expand cssExpression capabilities for example)
        - ? instance modifier plugin possibility, adding new methods to glueCommandAPI.
        - glueExpressions (do more with @id, like .set("prop","@id.child") )

        VERSION 0.2.1
        - optimise and clean code
        - update documentation
        - more unit tests
        - fix bugs

        ??? etc

        VERSION 1
        - stable and ready for production



 */

(function( global, doc ){

    var root = "documentElement" in doc ? doc.documentElement : doc;
    var slice = Array.prototype.slice;

    var plugins = {};
    var runStack = [];

    var W3C_EVENTS = "addEventListener" in doc;
    var IE_EVENTS = "attachEvent" in doc;

    // utils
    function mixin( receiver, provider ){
        var key;
        for ( key in provider ) {
            receiver[ key ] = provider[ key ];
        }
        return receiver;
    }


    /**Creates an instance without running the constructor.
     * The constructor has to be manually applied.
     *
     * @param object (Object or Function) Object or function to be instantiated
     * @return instance {Object}
     */
    function createUninitialisedInstance( object ){
        function fn(){}
        if ( "function" == typeof object ) {
            object.prototype.constructor = object;
            object = object.prototype;
        } else {
            object.constructor = object.constructor || fn;
        }
        fn.prototype = object;
        return new fn();
    }

    /**Validates an ID string, must only be alphanumeric + dash and undescore.
     *
     * @param id {String}
     * @return {*}
     */
    function validateId( id ) {
        if ( !/^[\w\d\-_]+$/i.test( id ) ) {
            throw "ID; '"+id+"' is invalid, can only be alphanumeric plus '-_'.";
        }
        return id;
    }

    var listeners = {};

    function listen( event, listener ){
        deafen( event, listener );
        listeners[ event ].push( listener );
    }

    function deafen( event, listener ){
        var list = listeners[ event ];
        if ( !listeners[ event ] ) {
            listeners[ event ] = [];
            return;
        }
        var i = list.length;
        while( i-- ) {
            if ( list[ i ] === listener ) {
                list.splice( i, 1 );
            }
        }
    }

    function emit( event ){
        var args = slice.call( arguments, 1 );
        var list = listeners[ event ];
        if ( !list ) {
            return;
        }
        var size = list.length;
        var i = 0;
        for( i; i< size; i++ ){
            list[ i ].apply( null, args );
        }
    }

    function clearListeners( event ){
        listeners[ event ] = [];
    }

    var storage = {};

    function store( id, value ){
        if ( storage[ id ] ) {
            throw "ID '"+id+"' is already taken."
        }
        var event = "stored."+id;
        storage[ id ] = value;
        emit( event );
        clearListeners( event );
    }

    function fetch( id, handler ){
        if ( storage[ id ] ) {
            handler( storage[ id ] );
        } else {
            listen( "stored."+id, function(){
                handler( storage[ id ] );
            });
        }
    }

    // mechanism to keep track of module/DomElement bindings
    var domBindings = [];

    function isBound( module, element ){
        var i = domBindings.length;
        var b;
        while( i-- ) {
            b = domBindings[ i ];
            if ( b.module === module && b.element === element ) {
                return ( element = true );
            }
        }
        return ( element = false );
    }

    /**Registers an relation between module and DOM element.
     * A module can only be bound to a DOM element once.
     *
     * @param module
     * @param element
     */
    function registerBinding( module, element ){
        if ( isBound( module, element ) ) {
            return;
        }
        domBindings.push({
            module: module,
            element: element
        });
    }

    function Resource( src, id ){
        this.type = /^@/.test( src ) ? "ref" : "path";
        this.complete = false;
        this.properties = {};
        this.src = src;
        this.id = validateId( id ) || null;
        this.pending = 1;
        this.instances = [];
        this.arguments = [];
        this.on = [];
        this.runMethods = [];
        this.cssExpression = null;
        this.singleton = null;
        if ( this.id ) {
            store( "@" + this.id, this );
        }
    }

    Resource.prototype = {
        set: function( key, value ){
            if ( this.properties.hasOwnProperty( key ) ) {
                this.pending--;
            }
            this.properties[ key ] = {
                type: "set",
                resource: new Resource( value )
            };
            this.pending++;
        },
        preset: function( key, value ){
            if ( this.properties.hasOwnProperty( key ) ) {
                this.pending--;
            }
            this.properties[ key ] = {
                type: "preset",
                resource: new Resource( value )
            };
            this.pending++;
        },
        create: function( args ){
            if ( !this.module ) {
                throw "No module defined!";
            }
            if ( this.instance ) {
                return this.instance;
            }
            var instance = createUninitialisedInstance( this.module );
            args = args ? args.concat( this.arguments ) : this.arguments;

            // presets
            this.inject( "preset", instance, this.properties );

            // apply constructor
            instance.constructor.apply( instance, args );

            // set
            this.inject( "set", instance, this.properties );

            if ( this.singleton ) {
                this.instance = instance;
            } else {
                this.instances.push( instance );
            }

            if ( this.runMethods.length ) {
                this.applyMethods( instance );
            }

            return instance;
        },
        applyMethods: function( instance ){
            var list = this.runMethods;
            var i = 0;
            var size = list.length;
            var methodName, args;
            for ( i;i<size;i++ ) {
                methodName = list[ i ].methodName;
                args = list[ i ].arguments;
                if ( "function" == typeof instance[ methodName ] ) {
                    instance[ methodName ].apply( instance, args );
                } else {
                    // throw error?
                }
            }
        },
        inject: function( type, instance, properties ){
            var property,setMethod,resource;
            for( property in properties ) {
                if ( !properties.hasOwnProperty( property) || type !== properties[ property ].type ) {
                    continue;
                }
                resource = properties[ property ].resource;
                setMethod = "set" + property[ 0 ].toUpperCase() + property.substr(1);
                if ( setMethod in instance && "function" == typeof instance[ setMethod ] ) {
                    instance[ setMethod ]( resource.create() );
                } else {
                    instance[ property ] = resource.create();
                }
            }
        },
        gather: function( completeHandler ){
            var resource = this;
            var properties = resource.properties;
            resource.gathering = true;
            function readyCheck(){
                if ( --resource.pending === 0) {
                    resource.complete = true;
                    resource.gathering = false;
                    completeHandler && completeHandler();
                }
            }
            if ( resource.complete ) {
                completeHandler && completeHandler();
            } else if ( resource.type === "path" ) {
                require([ resource.src ], function( module ){
                    resource.module = module;
                    readyCheck();
                });
            } else {
                fetch( resource.src, function( original ){

                    if ( original.pending ) {
                        original.gather(function(){
                            resource.copyFrom( original );
                            readyCheck();
                        });
                    } else {
                        resource.copyFrom( original );
                        readyCheck();
                    }
                });
            }
            for( var key in properties ) {
                if ( properties.hasOwnProperty( key ) ) {
                    properties[ key ].resource.gather( readyCheck );
                }
            }
        },
        copyFrom: function( resource ){
            if ( this.arguments.length === 0 ) {
                this.arguments = resource.arguments;
            }
            if ( this.singleton === null ) {
                this.singleton = resource.singleton;
            }
            if ( this.on.length === 0 ) {
                this.on = resource.on;
            }

            this.module = resource.module;
            /*
                Only copy properties from original resource that this resource doesn't have.
                Since these resource properties override properties from the original resource.
             */
            for ( var key in resource.properties ) {
                if ( key in this.properties ) {
                    continue;
                }
                this.properties[ key ] = resource.properties[ key ];
            }
        }
    };

    function execute( resource, elementArg ){
        function create(){
            if ( !elementArg ) {
                resource.create();
            } else if ( !isBound( resource.module, elementArg[ 0 ] )) {
                resource.create( elementArg );
                registerBinding( resource.module, elementArg[ 0 ] );
            }
        }
        if ( resource.pending ) {
            resource.gather( create );
        } else {
            create();
        }
    }

    var core = {

        find: function( expr, context ) {
            var found, result = [];
            context = context || doc;
            if ( expr[ 0 ] == "#" ) {
                found = context.getElementById( expr.substr(1) );
                found = found ? [ found ] : [];
                return found;
            } else if ( expr[ 0 ] == ".") {
                return core.findByClass( expr.substr( 1 ), context );
            }
        },

        findByClass : "getElementsByClassName" in doc ? function( cls, context ){
            context = context || doc;
            return context.getElementsByClassName( cls );
        } : function( cls, context ){
            context = context || doc;
            var re = new RegExp( "(?:^|\s*)"+cls+"(?:\s*|$)" );
            var list = context.getElementsByTagName( "*" );
            var size = list.length;
            var i = 0;
            var result = [];
            for(i;i<size;i++){
                if ( "className" in list[ i ] && re.test( list[ i ].className ) ) {
                    result.push( list[ i ] );
                }
            }
            return result;
        },

        match: function( element, cssExpression ){
            if ( /^#/.test( cssExpression ) ) {
                return element.id == cssExpression.substr( 1 );
            } else {
                return new RegExp("(?:^|\s)"+ cssExpression.substr( 1 ) +"(?:\s|$)").test( element.className );
            }
        },

        listen: W3C_EVENTS ? function( element, event, listener ){
            element.addEventListener( event, listener, false );
        } : IE_EVENTS ? function( element, event, listener ){
            element.attachEvent( "on" + event, listener );
            element = null;
        } : function(){
            // todo: fallback?
        },

        deafen: W3C_EVENTS ? function( element, event, listener ){
            element.removeEventListener( event, listener, false );
        } : IE_EVENTS ? function( element, event, listener ){
            element.detachEvent( "on" + event, listener );
            element = null;
        } : function(){
            // todo: fallback?
        }

    };

    var dom = createUninitialisedInstance( core );

    function run( domContext ){
        var i = 0;
        var size = runStack.length;
        for(i;i<size;i++){
            process( runStack[ i ], domContext );
        }
    }

    /**Determines when to execute a given resource.
     * Binding relevant event handlers.
     *
     * @param resource {Resource}
     */
    function process( resource, domContext ) {
        if ( resource.gathering ) {
            return;
        }
        if ( resource.cssExpression ) {
            var find = plugins.find || dom.find;
            var list = find( resource.cssExpression, domContext );
            var size = list.length;
            var i = 0;
            for( i; i < size; i++ ) {
                execute( resource, [ list[ i ] ] );
            }
        }
    }

    function processEvented( resource ){
        var on = resource.on;
        var i = on.length;
        while ( i-- ) {
            dom.listen( doc, on[ i ], function( e ){
                e = e || global.event;
                var target = e.target || e.srcElement;
                if ( dom.match( target, resource.cssExpression ) ){
                    execute( resource, [ target ] );
                }
            });
        }
    }

    // api
    function API( src, id ){
        var resource = new Resource( src, id );

        var api = this;
        mixin(this,{
            set: function( key, value ){
                resource.set( key, value );
                return this;
            },
            preset: function( key, value ){
                resource.preset( key, value );
                return this;
            },
            args: function(){
                resource.arguments = slice.call( arguments );
                return this;
            },
            on: function( /* events */){
                resource.on = slice.call( arguments );
                return this;
            },
            to: function( cssExpression ){
                resource.cssExpression = cssExpression;
                return this;
            },
            run: function( methodName /* method arguments */ ){
                resource.runMethods.push({
                    methodName: methodName,
                    arguments: slice.call( arguments, 1 )
                });
                return this;
            },
            singleton: function(){
                resource.singleton = true;
                return this;
            }
        });
        setTimeout(function(){
            API.kill( api );
            if ( resource.on.length ) {
                processEvented( resource );
            } else {
                runStack.push( resource );
            }
            run();
        },9);
    }


    API.expired = function(){
        throw "This glue Command has expired, it has been processed already.";
    };

    API.prototype = {
        set: API.expired,
        preset: API.expired,
        args: API.expired,
        to: API.expired,
        on: API.expired,
        singleton: API.expired
    };

    API.kill = function( api ){
        var key;
        for ( key in api ) {
            delete api[ key ];
        }
    };

    function glue( /* id, */ src ){
        var args = arguments;
        if ( args.length === 2 ) {
            return new API( args[ 1 ], args[ 0 ] );
        } else {
            return new API( src );
        }

    }

    glue.run = run;

    /*
        This next bit requires a lot of work and thought.
        Todo list:
        X run glue every 10ms until DOM is fully ready
        - run glue everytime a DOM mutation occurs
        - create a fallback when DOM mutation events are missing
     */

    (function(){

        var intervalId = setInterval(run,10);
        var fn;

        if ( /c|ed/i.test( doc.readyState ) ) {
            return clearInterval( intervalId );
        }


        if ( W3C_EVENTS ) {
            dom.listen(doc,"DOMContentLoaded",fn = function(){
                clearInterval( intervalId );
                dom.deafen( doc, "DOMContentLoaded", fn );
            },false);
        } else if ( IE_EVENTS ) {
            dom.listen(doc,"readystatechange",fn = function(){
                if ( /^loade|c/.text(doc.readyState) ){
                    clearInterval( intervalId );
                    dom.deafen( doc, "DOMContentLoaded", fn );
                }
            });
        } else if ( "doScroll" in root ) {
            var hackId = setInterval(function(){
                try {
                    root.doScroll('left');
                    clearInterval( intervalId );
                    clearInterval( hackId );
                } catch(e){}
            },50);
        }

    }());

    define(function(){
        return glue;
    });

}( this, document ));
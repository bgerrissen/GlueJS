/**
 * Author: bgerrissen
 * Date: 1-nov-2010
 * Time: 23:02:39
 * License: MIT
 */
glue( function ( ) {

    var slice = Array.prototype.slice
    , toTypeString = Object.prototype.toString
    , FUNCTION = "function"
    , ARRAY = "array"
    , STRING = "string"
    , OBJECT = "object"
    , BOOLEAN = "boolean"

    , type = function ( obj ) {

        return toTypeString.call( obj ).replace( /\[object\s|\]/g , "" ).toLowerCase();

    }
    , isType = function ( obj , type ) {

        return toTypeString.call( obj ).replace( /\[object\s|\]/g , "" ).toLowerCase() === type;

    }
    , each = function ( obj , handler /* , scope */ ) {

        var i , len , scope = arguments[2] || obj;

        if ( "length" in obj ) {

            if ( scope ) {

                for ( i = 0 , len = obj.length ; i < len ; i++ ) {

                    if ( handler.call( scope , obj[ i ] , i , obj ) === "break" ) {

                        break;

                    }

                }

            }

        } else {

            for ( i in obj ) {

                if ( obj.hasOwnProperty( i ) ) {

                    if ( handler.call( scope , obj[ i ] , i , obj ) === "break" ) {

                        break;

                    }

                }

            }

        }

    }
    , map = function ( obj , mapper , scope ) {

        var objType = type( obj)
        , result = ( objType === "array" ) ? [] : {};

        if( type === "array" ) {

            result.length = obj.length;

        }

        each( obj , function( value , key ){

            result[ key ] = mapper.call( scope , value , key ,  obj );

        } , scope );

        return result;

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
    , clone = function ( obj , properties , override ) {

        var fn = function(){}
        fn.prototype = obj;
        obj = new fn();

        if ( type( properties ) === OBJECT ) {

            mixin( obj , properties , override );

        }

        return obj;

    }

    ;

    return {
        each : each,
        map : map,
        type : type,
        isType : isType,
        mixin : mixin
    };


} );
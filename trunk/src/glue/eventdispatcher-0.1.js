/**
 * Author: bgerrissen
 * Date: 1-nov-2010
 * Time: 22:48:24
 * License: MIT
 */
glue( "glue/utils-0.1" , function ( utils ) {

    var mixin = utils.mixin
    , type = utils.type

    , EventDispatcher = function ( obj ) {

        this.eventRegistry = {};
        this.eventGroups = {};

        if ( obj ) {

            return mixin( obj , this , true );

        }

    };

    EventDispatcher.prototype = {

        listen : function ( eventType , listener ) {

            if ( !this.eventRegistry[ eventType ] ) {

                this.eventRegistry[ eventType ] = [];

            }

            this.eventRegistry[ eventType ].push( listener );

        },

        deafen : function( eventType , listener ) {

            var list = this.eventRegistry[ eventType ]
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

        },

        notify : function ( eventType , data ) {

            var eventObject
            , list = this.eventRegistry[ eventType ]
            , i
            , len
            , listener
            , self = this;

            if ( list && list.length ) {

                list = [].concat( list );

                eventObject = mixin( true , {
                    type : eventType,
                    target : self,
                    deafen : function () {

                        self.deafen( eventType , eventObject.currentListener );

                    }
                } , data , false );

                for ( i = 0 , len = list.length ; i < len ; i++ ) {

                    listener = list[ i ];

                    eventObject.currentListener = listener;

                    try {

                        if ( typeof listener === "function" ) {

                            listener( eventObject );

                        } else if ( listener.handleEvent ) {

                            listener.handleEvent( eventObject );

                        }

                    } catch ( e ) {

                        glue.notify( "Error: " , {
                            message : e,
                            target : this
                        } );

                    }

                }

            }

        }

    }

});
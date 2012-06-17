var FunctionDSL = {

    contexts: {},

    uuid: 0,

    create: function( entryFunction , methods ){

        var base = {};

        var dsl = function(){



        };

        for ( var key in methods ) {

            if ( methods.hasOwnProperty( key ) ) {

                base[ key ] = (function( method ){

                    return function(){
                        
                    }

                }( methods[ key ] ) );

            }

        }

        this.contexts[ id ] = context;

        dsl[ "FDSL:STORAGE:ID" ] = id;

        return dsl;

    }

};

var MyDSL = FunctionDSL.create( function( name ){

    this.name = name;

} , {

    speak: function( msg ){
        console.log( this.name + " says: " + msg );
    },

    intro: function(){
        console.log( this.speak( "Hi, my name is " + this.name ) );
    }

} );

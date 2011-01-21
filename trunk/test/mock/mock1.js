define( {

    constructor : function ( config ) {

        if ( this.$elements && this.$elements.length ) {

            console.log( "setNodeCollection injected a jQuery collection" );

        }

        console.log( this );

        if ( config ) {

            console.log( "config received" );

        }

        if ( this.dependency ) {

            console.log( "HAS INJECTED DEPENDENCY!" );

        }



    },

    setNodeCollection : function ( collection ) {

        this.$elements = collection;

    },

    speak : function ( msg ) {

        console.log( msg );

    }

} );
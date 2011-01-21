define( function () {

    function CLASS( config ){

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

    }

    CLASS.prototype = {

        setNodeCollection : function ( collection ) {
    
            this.$elements = collection;

        }

    };

    return CLASS;

} );
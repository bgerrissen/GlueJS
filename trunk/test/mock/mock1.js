define( {

    constructor : function ( config ) {

        if ( this.$elements && this.$elements.length ) {

            this.$elements.css( "background-color" , "red" ).text( "node dependency sorted." );

        }

        if ( config ) {

            console.log( "config received" );

        }

        if ( this.dependency ) {

            console.log( "HAS INJECTED DEPENDENCY!" );

        }



    },

    setNodeList : function ( list ) {

        this.$elements = list;

    },

    speak : function ( msg ) {

        this.$elements.append( $( "<div>"+msg+"</div>" ).css( {
            background : "white",
            margin : "10px"
        } ) )

    }

} );
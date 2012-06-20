define({

    constructor : function () {
        this.books = {};
        this.repos = {};
    },

    addRepo: function( name, repo ){
        this.repos[ name ] = repo;
    },

    get: function( name, handler ){
        if ( this.books[ name ] ) {
            handler( this.books[ name ] );
        } else if ( !this.repos[ name ] ) {
            throw "No known addressbook for " + name;
        } else {
            require( this.repos[ name ], function( book ){
                this.books[ name ] = book;
                handler( book );
            });
        }
    }

});
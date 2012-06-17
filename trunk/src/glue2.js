define(function(){

    var slice = Array.prototype.slice
    , store = {}
    , live = {}
    ;
    
    function Record( src ){
           this.src = src;
           this.applied = [];
           // this.cssExpression; // set dynamically
           // this.id; // set dynamically
           this.setters = [];
           this.run = [];
           this.on = [];
    }
    
    Record.prototype = {
        appliedTo: function( element ) {
            return this.applied.indexOf( element ) > -1;
        }
    };
    
    function validateID( str , referal ) {
        // todo: validation
        return str;   
    }
    
    function getAPI( record ){
        return (record.api = {
            to: function( cssExpression ){
                record.cssExpression = cssExpression;
            },
            as: function( id ){
                record.id = validateID( id , false );
            },
            on: function( /* events */ ){
                var args = arguments, i = args.length;
                while( i-- ) {
                    record.on.push( args[ i ] );
                }
            },
            set: function( key , value ){
                record.setters.push({
                    key: key,
                    value: value
                });    
            },
            run: function( method /* arguments */ ){
                record.run.push({
                    method: method,
                    args: slice.call( arguments , 1 )
                });
            }
        });
    }
    
    function killed(){
        throw "This glue allocation has been finalised and cannot be altered.";
    }
    
    function killAPI( api ){
        for( var key in api ) {
            if ( api.hasOwnProperty( key ) ) {
                api[ key ] = killed;
            }
        }
    }
    
    function process( record ) {
        
    }
    
    function glue( src ){
        var rec = new Record( src );
        setTimeout( process , 0 , rec );
        return getAPI( rec );
    }
    
    
    
    return glue;

});
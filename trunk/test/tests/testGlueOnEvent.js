define([
    "lib/my-unit"
],function(UnitTest){

    /*

     glue( "tests/testGlueOnEvent" ).to( "#testGlueOnEvent" )
        .on( "mouseover" )
     ;

     */

    var test = new UnitTest("testGlueOnEvent", 1 );

    return {

        constructor: function( node ){

            test.equals( "testGlueOnEvent", node.id, "should be bound on correct element" );

        }

    };

});
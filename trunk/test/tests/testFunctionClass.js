define([
    "lib/my-unit"
],function(UnitTest){

    /*

     glue("tests/testFunctionClass").to("#testFunctionClass")
         .args(1,2)
         .set("mock","mocks/mock1")
         .set("mock1","mocks/mock1")
         .preset("mock2","mocks/mock2")
         .run("runThisFirst",5,6)
         .run("runThisSecond",7,8)
     ;

     */

    var test = new UnitTest("testFunctionClass", 12 );

    function Class( node, a, b ){

        var instance = this;

        test.assert( instance instanceof Class, "should be an instance" );
        test.equals( "testFunctionClass", node.id, "should be bound to correct element ( first argument )" );
        test.equals( 1, a, "second argument should be correct" );
        test.equals( 2, b, "third argument should be correct" );

        test.equals( "mock2", instance.mock2.id, "preset should work correctly" );

        setTimeout(function(){
            // use timeout because '.set()' happens AFTER constructor call.
            test.equals( "mock1", instance.mock1.id, "set should work correctly" );

        },10);

    }

    Class.prototype = {

        setMock: function( mock ){

            test.equals( "mock1", mock.id, "setter method should work" );

        },

        runThisFirst: function( a, b ){
            this.firstRun = true;
            test.equals( 5, a, "first argument should be passed correctly" );
            test.equals( 6, b, "second argument should be passed correctly" );
        },

        runThisSecond: function( a, b ){
            test.assert( this.firstRun, "should be called after method 'runThisFirst'" );
            test.equals( 7, a, "first argument should be passed correctly" );
            test.equals( 8, b, "second argument should be passed correctly" );
        }

    };

    return Class;

});
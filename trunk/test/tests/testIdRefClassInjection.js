define([
    "lib/my-unit"
],function(UnitTest){

    /*

     glue("mock1","mocks/mock1")
         .args(1,2)
         .set("mock2","mocks/mock2")
     ;

     glue("tests/testIdRefClassInjection").to("#testIdRefClassInjection")
        .set("mock","@mock1")
     ;

     */

    var test = new UnitTest("testIdRefClassInjection", 4 );

    return {

        setMock: function( mock ){

            test.equals( "mock1", mock.id, "injected mock should be instance of the right class" );
            test.equals( "1,2", mock.args.join(), "injected mock should be constructed properly" );

        },

        setOtherMock: function( mock ){

            test.equals( "mock1", mock.id, "2nd injected mock should be instance of the right class" );
            test.equals( "3,4", mock.args.join(), "2nd injected mock should be constructed properly" );

        }

    };

});
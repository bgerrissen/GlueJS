require( {

    urlArgs:+new Date(),
    baseUrl: "../",
    paths: {
        "mock" : "test/mock"
    }

}, [ "src/chain" ] , function( glue ){

    glue

    ( "mock/mock2" )
        .as( "mock2" )

    ( "mock/mock1" )
        .as( "mock1" )
        .set( "dependency" , "@mock2" )

    ( "@mock1" )
        .when.find( ".hoverMe" )
        .when.event( "click" )
        .set( "foo" , {foo:"bar"} )
        .run( "speak" , [ "Hello world!" ] )
        .run( "speak" , [ "How are you?" ] )
        .run( "speak" , [ "I am fine thank you, how are you?" ] )
        .run( "speak" , [ "Great thanks for asking." ] )

    ;

} );

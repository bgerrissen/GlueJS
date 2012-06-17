require([
    "../src/glue",
    "lib/my-unit",
    "lib/config-unit"
],function( glue, unit, configUnit ){

    configUnit( unit );

    glue( "busOne", "@glue-bus" );
    glue( "busTwo", "@glue-bus" );

    glue("tests/testFunctionClass").to("#testFunctionClass")
        .args(1,2)
        .set("mock","mocks/mock1")
        .set("mock1","mocks/mock1")
        .preset("mock2","mocks/mock2")
        .run("runThisFirst",5,6)
        .run("runThisSecond",7,8)
    ;

    glue("tests/testObjectClass").to("#testObjectClass")
        .args(1,2)
        .set("mock","mocks/mock1")
        .set("mock1","mocks/mock1")
        .preset("mock2","mocks/mock2")
        .run("runThisFirst",5,6)
        .run("runThisSecond",7,8)
    ;

    glue("mock1","mocks/mock1")
        .args(1,2)
        .set("mock2","mocks/mock2")
    ;

    glue("diffMock1","mocks/mock1")
        .args(3,4)
        .set("mock2","mocks/mock2")
    ;

    glue("tests/testIdRefClassInjection").to("#testIdRefClassInjection")
        .set("mock","@mock1")
        .set("otherMock","@diffMock1")
    ;

    glue( "tests/testGlueOnEvent" ).to( "#testGlueOnEvent" )
        .on( "mouseover" )
    ;

    var refAPI = glue("mocks/mock1");
    var testAPIExpires = new unit("testAPIExpires",1);

    setTimeout(function(){
        try {
            refAPI.to(".className");
            testAPIExpires.assert(false,"calling a glue method should NOT be successful");
        } catch(e){
            testAPIExpires.assert(true,"calling a glue method should throw an error");
        }
    },10);


});
require([
    "../src/glue.js"
],function( glue ){

    glue("lib/dataService", "dataService")
        .run("add","bart","data/bart.js")
        .run("add","lisa","data/lisa.js")
    ;

    glue("lib/addressbook")
        .to(".addressbook")
        .preset("dataService","@dataService")
        .on("click")
    ;

    glue("lib/controller")
        .set("mock","lib/mockClass")
        .set("model",...)
        .set("prop",123)
    ;

    var Model = Stapes.create();

    Model.foo = true;
    Model.set('foo', true);

    var obj = {};
    Stapes.mixin(obj, Stapes.Events);

    obj.foo = function() {
        this.emit('foo');
    }

    Stapes.on('foo', function() {

    })

    {
        mock: mockInstance
    }

});
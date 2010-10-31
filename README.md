### usage glue module

    // module.js
    glue(
        // import
        "foo" ,
        "bar" ,
        "dirty ( dirtyOne , dirtyTwo )" , // glue expression

        function( foo , bar , dirtyOne , dirtyTwo ){

            return {
                fn : function(){ ... }
                val : 42
            };

        }

    );

1.) foo.js, bar.js and dirty.js are loaded. 'foo' and 'bar' are defined using glue. 'dirty' does not use glue.
2.) Once dirty.js is loaded, glue looks up 'dirtyOne' and 'dirtyTwo' in the global scope and assigns them to the 'dirty' stack.
3.) When all files are loaded and references made, the callback is fired with the loaded dependencies as arguments.
4.) Since 'dirty' contains two resources, both are passed as seperate arguments, exploding the argument stack to four.
5.) The returned value will be assigned to the 'module' stack.

*When nothing is returned in the callback, a module will not be inserted into the arguments, for example if 'foo' never returned
an object, then foo would've been omitted in the argument stack.*

### Initializing a dependency chain

    <script>
        glue( "path/to/application" );
    </script>

1.) Glue just loads application.js which in turn loads other dependencies and contains code to start up the application.

*Glue always loads given resources wether there's a callback or not*




require({
    paths : {}
});

glue(

    { lazy: false, src : "mock/mock2", id : "mock2" },

    { src : "mock/mock1", create : {} , id : "mock1" , inject : {
        dependency : "#mock2"
    } },

    {
        find : ".hoverMe",
        on : "click",
        src : "#mock1", // require module
        createEach : true,
        create : {}, // value passed to constructor method.
        invoke : [
            { speak : [ "hello world!" ] },
            { speak : [ "How are you?" ] },
            { speak : [ "I am fine thank you, how are you?" ] },
            { speak : [ "Great thanks for asking." ] }
        ]

    }   

);
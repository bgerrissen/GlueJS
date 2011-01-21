require({
    paths : {}
});

glue(

    { lazy : true , source : "mock/mock2", as : "mock2" },
    { lazy : true , source : "mock/mock1", create : {} , as : "mock1" , inject : {
        dependency : "#mock2"
    } },

    {
        find : ".hoverMe",
        on : "mouseout click",
        source : "#mock1", // require module
        create : {}, // value passed to constructor method.
        invoke : [
            { speak : [ "hello world!" ] },
            { speak : [ "How are you?" ] },
            { speak : [ "I am fine thank you, how are you?" ] },
            { speak : [ "Great thanks for asking." ] }
        ]

    }   

);
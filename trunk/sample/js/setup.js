glue(

    { source : "lib/addressbook" , as : "addressbook" },
    { source : "lib/dataService" , as : "dataService" },

    {
        find : ".addressbook",
        on : "click",
        create : [],
        source : "#addressbook",
        inject : {
            jsonService : "#dataService"
        }
    }
        
);
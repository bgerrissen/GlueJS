/*
 RequireJS 0.22.0 Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var require,define;
(function(){function N(e){return ba.call(e)==="[object Function]"}function T(e){return ba.call(e)==="[object Array]"}function U(e,f,k){for(var j in f)if(!(j in D)&&(!(j in e)||k))e[j]=f[j];return h}function ca(e,f,k){var j,r,m;for(j=0;m=f[j];j++){m=typeof m==="string"?{name:m}:m;r=m.location;if(k&&(!r||r.indexOf("/")!==0&&r.indexOf(":")===-1))m.location=k+"/"+(m.location||m.name);m.location=m.location||m.name;m.lib=m.lib||"mock";m.main=(m.main||"mock/main").replace(pa,"");e[m.name]=m}}function qa(e){function f(a){var b,
c;for(b=0;c=a[b];b++)if(c==="."){a.splice(b,1);b-=1}else if(c==="..")if(b===1&&(a[2]===".."||a[0]===".."))break;else if(b>0){a.splice(b-1,2);b-=2}}function k(a,b){var c;if(a.charAt(0)===".")if(b){if(t.packages[b])b=[b];else{b=b.split("/");b=b.slice(0,b.length-1)}a=b.concat(a.split("/"));f(a);c=t.packages[b=a[0]];a=a.join("/");if(c&&a===b+"/"+c.main)a=b}return a}function j(a,b){var c=a?a.indexOf("!"):-1,d=null,g=b?b.name:null,n=a,l,o;if(c!==-1){d=a.substring(0,c);a=a.substring(c+1,a.length)}if(d){d=
k(d,g);d=ra[d]||d}if(a){if(d)l=(c=q[d])?c.normalize?c.normalize(a,function(s){return k(s,g)}):k(a,g):"__$p"+g+"@"+a;else l=k(a,g);o=V[l];if(!o){o=h.toModuleUrl?h.toModuleUrl(i,a,b):i.nameToUrl(a,null,b);V[l]=o}}return{prefix:d,name:l,parentMap:b,url:o,originalName:n,fullName:d?d+"!"+l:l}}function r(){var a=true,b=t.priorityWait,c,d;if(b){for(d=0;c=b[d];d++)if(!w[c]){a=false;break}a&&delete t.priorityWait}return a}function m(a){return function(b){a.exports=b}}function O(a,b,c){return function(){var d=
[].concat(sa.call(arguments,0)),g;if(c&&N(g=d[d.length-1]))g.__requireJsBuild=true;d.push(b);return a.apply(null,d)}}function da(a,b){b=O(i.require,a,b);U(b,{nameToUrl:O(i.nameToUrl,a),toUrl:O(i.toUrl,a),isDefined:O(i.isDefined,a),ready:h.ready,isBrowser:h.isBrowser});if(h.paths)b.paths=h.paths;return b}function ta(a){var b,c,d,g,n,l,o,s=P[a];if(s)for(g=0;c=s[g];g++){b=c.fullName;c=j(c.originalName,c.parentMap);c=c.fullName;d=v[b];if(c!==b){v[c]=d;delete v[b];for(n=0;n<d.length;n++){o=d[n].depArray;
for(l=0;l<o.length;l++)if(o[l]===b)o[l]=c}}}delete P[a]}function ea(a){var b=a.prefix,c=a.fullName;if(!(G[c]||c in q)){if(b&&!E[b]){E[b]=undefined;(P[b]||(P[b]=[])).push(a);(v[b]||(v[b]=[])).push({onDep:function(d){d===b&&ta(b)}});ea(j(b))}i.paused.push(a)}}function W(a){var b,c,d;b=a.callback;var g=a.fullName;d=[];var n=a.depArray;if(b&&N(b)){if(n)for(b=0;b<n.length;b++)d.push(a.deps[n[b]]);c=h.execCb(g,a.callback,d);if(g)if(a.usingExports&&c===undefined&&(!a.cjsModule||!("exports"in a.cjsModule)))c=
q[g];else if(a.cjsModule&&"exports"in a.cjsModule)c=q[g]=a.cjsModule.exports;else{if(g in q&&!a.usingExports)return h.onError(new Error(g+" has already been defined"));q[g]=c}}else if(g)c=q[g]=b;if(g)if(d=v[g]){for(b=0;b<d.length;b++)d[b].onDep(g,c);delete v[g]}if(z[a.waitId]){delete z[a.waitId];a.isDone=true;i.waitCount-=1;if(i.waitCount===0)X=[]}}function fa(a,b,c,d){a=j(a,d);var g=a.name,n=a.fullName,l={waitId:g||ua+va++,depCount:0,depMax:0,prefix:a.prefix,name:g,fullName:n,deps:{},depArray:b,
callback:c,onDep:function(ga,wa){if(!(ga in l.deps)){l.deps[ga]=wa;l.depCount+=1;l.depCount===l.depMax&&W(l)}}},o,s;if(n){if(n in q||w[n]===true)return;G[n]=true;w[n]=true;i.jQueryDef=n==="jquery"}for(c=0;c<b.length;c++)if(o=b[c]){o=j(o,g?a:d);s=o.fullName;b[c]=s;if(s==="require")l.deps[s]=da(a);else if(s==="exports"){l.deps[s]=q[n]={};l.usingExports=true}else if(s==="module"){l.cjsModule=o=l.deps[s]={id:g,uri:g?i.nameToUrl(g,null,d):undefined};o.setExports=m(o)}else if(s in q&&!(s in z))l.deps[s]=
q[s];else{l.depMax+=1;ea(o);(v[s]||(v[s]=[])).push(l)}}if(l.depCount===l.depMax)W(l);else{z[l.waitId]=l;X.push(l);i.waitCount+=1}}function H(a){fa.apply(null,a);w[a[0]]=true}function ha(a){if(!i.jQuery)if((a=a||(typeof jQuery!=="undefined"?jQuery:null))&&"readyWait"in a){i.jQuery=a;H(["jquery",[],function(){return jQuery}]);if(i.scriptCount){a.readyWait+=1;i.jQueryIncremented=true}}}function ia(a,b){if(!a.isDone){var c=a.fullName,d=a.depArray,g,n;if(c){if(b[c])return q[c];b[c]=true}for(n=0;n<d.length;n++)(g=
d[n])&&!a.deps[g]&&z[g]&&a.onDep(g,ia(z[g],b));return c?q[c]:undefined}}function Y(){var a=t.waitSeconds*1E3,b=a&&i.startTime+a<(new Date).getTime();a="";var c=false,d=false,g;if(t.priorityWait)if(r())I();else return;for(g in w)if(!(g in D)){c=true;if(!w[g])if(b)a+=g+" ";else{d=true;break}}if(c||i.waitCount){if(b&&a){g=new Error("require.js load timeout for modules: "+a);g.requireType="timeout";g.requireModules=a;return h.onError(g)}if(d||i.scriptCount){if(y||ja)setTimeout(Y,50)}else if(i.waitCount){for(A=
0;a=X[A];A++)ia(a,{});Y()}else h.checkReadyState()}}function ka(a,b){var c=b.name,d=b.fullName;if(!(d in q)){E[a]||(E[a]=q[a]);w[d]||(w[d]=false);E[a].load(c,da(b.parentMap,true),function(g){require.onPluginLoad&&require.onPluginLoad(i,a,c,g);W({prefix:b.prefix,name:b.name,fullName:b.fullName,callback:g});w[d]=true},t)}}function xa(a){if(a.prefix&&a.name.indexOf("__$p")===0&&q[a.prefix])a=j(a.originalName,a.parentMap);var b=a.prefix,c=a.fullName;if(!(G[c]||c in q)){G[c]=true;if(b)if(q[b])ka(b,a);
else{if(!J[b]){J[b]=[];(v[b]||(v[b]=[])).push({onDep:function(d){if(d===b){var g,n=J[b];for(d=0;d<n.length;d++){g=n[d];ka(b,j(g.originalName,g.parentMap))}delete J[b]}}})}J[b].push(a)}else h.load(i,c,a.url)}}var i,I,t={waitSeconds:7,baseUrl:p.baseUrl||"./",paths:{},packages:{}},K=[],G={require:true,exports:true,module:true},V={},q={},w={},z={},X=[],va=0,v={},E={},J={},P={};I=function(){var a,b,c;if(i.scriptCount<=0)i.scriptCount=0;for(;K.length;){a=K.shift();if(a[0]===null)return h.onError(new Error("Mismatched anonymous require.def modules"));
else H(a)}if(!(t.priorityWait&&!r())){for(;i.paused.length;){c=i.paused;i.paused=[];for(b=0;a=c[b];b++)xa(a);i.startTime=(new Date).getTime()}Y()}};i={contextName:e,config:t,defQueue:K,waiting:z,waitCount:0,specified:G,loaded:w,urlMap:V,scriptCount:0,urlFetched:{},defined:q,paused:[],plugins:E,managerCallbacks:v,makeModuleMap:j,normalize:k,configure:function(a){var b,c,d;if(a.baseUrl)if(a.baseUrl.charAt(a.baseUrl.length-1)!=="/")a.baseUrl+="/";b=t.paths;c=t.packages;U(t,a,true);if(a.paths){for(d in a.paths)d in
D||(b[d]=a.paths[d]);t.paths=b}if((b=a.packagePaths)||a.packages){if(b)for(d in b)d in D||ca(c,b[d],d);a.packages&&ca(c,a.packages);t.packages=c}if(a.priority){c=i.requireWait;i.requireWait=false;i.require(a.priority);i.requireWait=c;t.priorityWait=a.priority}if(a.deps||a.callback)i.require(a.deps||[],a.callback);a.ready&&h.ready(a.ready)},isDefined:function(a,b){return j(a,b).fullName in q},require:function(a,b,c){if(typeof a==="string"){if(h.get)return h.get(i,a,b);c=b;b=j(a,c);a=q[b.fullName];
if(a===undefined)return h.onError(new Error("require: module name '"+b.fullName+"' has not been loaded yet for context: "+e));return a}fa(null,a,b,c);if(!i.requireWait)for(;!i.scriptCount&&i.paused.length;)I()},takeGlobalQueue:function(){if(Q.length){ya.apply(i.defQueue,[i.defQueue.length-1,0].concat(Q));Q=[]}},completeLoad:function(a){var b;for(i.takeGlobalQueue();K.length;){b=K.shift();if(b[0]===null){b[0]=a;break}else if(b[0]===a)break;else{H(b);b=null}}b?H(b):H([a,[],a==="jquery"&&typeof jQuery!==
"undefined"?function(){return jQuery}:null]);w[a]=true;ha();if(h.isAsync)i.scriptCount-=1;I();h.isAsync||(i.scriptCount-=1)},toUrl:function(a,b){var c=a.lastIndexOf("."),d=null;if(c!==-1){d=a.substring(c,a.length);a=a.substring(0,c)}return i.nameToUrl(a,d,b)},nameToUrl:function(a,b,c){var d,g,n,l,o=i.config;if(a.indexOf("./")===0||a.indexOf("../")===0){c=c&&c.url?c.url.split("/"):[];c.length&&c.pop();c=c.concat(a.split("/"));f(c);b=c.join("/")+(b?b:h.jsExtRegExp.test(a)?"":".js")}else{a=k(a,c);if(h.jsExtRegExp.test(a))b=
a+(b?b:"");else{d=o.paths;g=o.packages;c=a.split("/");for(l=c.length;l>0;l--){n=c.slice(0,l).join("/");if(d[n]){c.splice(0,l,d[n]);break}else if(n=g[n]){a=a===n.name?n.location+"/"+n.main:n.location+"/"+n.lib;c.splice(0,l,a);break}}b=c.join("/")+(b||".js");b=(b.charAt(0)==="/"||b.match(/^\w+:/)?"":o.baseUrl)+b}}return o.urlArgs?b+((b.indexOf("?")===-1?"?":"&")+o.urlArgs):b}};i.jQueryCheck=ha;i.resume=I;return i}function za(){var e,f,k;if(L&&L.readyState==="interactive")return L;e=document.getElementsByTagName("script");
for(f=e.length-1;f>-1&&(k=e[f]);f--)if(k.readyState==="interactive")return L=k;return null}var Aa=/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,Ba=/require\(["']([^'"\s]+)["']\)/g,pa=/^\.\//,ba=Object.prototype.toString,u=Array.prototype,sa=u.slice,ya=u.splice,y=!!(typeof window!=="undefined"&&navigator&&document),ja=!y&&typeof importScripts!=="undefined",Ca=y&&navigator.platform==="PLAYSTATION 3"?/^complete$/:/^(complete|loaded)$/,ua="_r@@",D={},F={},Q=[],L=null,Da=false,la=false,ra={text:"require/text",i18n:"require/i18n",
order:"require/order"},h;u={};var Z,p,B,R,$,M,ma,x,na,S,A,aa,oa,C;if(typeof require!=="undefined")if(N(require))return;else u=require;h=require=function(e,f,k){var j="_",r;if(!T(e)&&typeof e!=="string"){r=e;if(T(f)){e=f;f=k}else e=[]}if(r&&r.context)j=r.context;k=F[j]||(F[j]=qa(j));r&&k.configure(r);return k.require(e,f)};h.version="0.22.0";h.isArray=T;h.isFunction=N;h.mixin=U;h.jsExtRegExp=/^\/|:|\?|\.js$/;p=h.s={contexts:F,skipAsync:{},isPageLoaded:!y,readyCalls:[]};if(h.isAsync=h.isBrowser=y){B=
p.head=document.getElementsByTagName("head")[0];if(R=document.getElementsByTagName("base")[0])B=p.head=R.parentNode}h.onError=function(e){throw e;};h.load=function(e,f,k){var j=e.contextName,r=e.urlFetched,m=e.loaded;Da=false;m[f]||(m[f]=false);if(!r[k]){e.scriptCount+=1;h.attach(k,j,f);r[k]=true;if(e.jQuery&&!e.jQueryIncremented){e.jQuery.readyWait+=1;e.jQueryIncremented=true}}};define=h.def=function(e,f,k){var j;if(typeof e!=="string"){k=f;f=e;e=null}if(!h.isArray(f)){k=f;f=[]}if(!e&&!f.length&&
h.isFunction(k))if(k.length){k.toString().replace(Aa,"").replace(Ba,function(r,m){f.push(m)});f=["require","exports","module"].concat(f)}if(la){j=Z||za();if(!j)return h.onError(new Error("ERROR: No matching script interactive for "+k));e||(e=j.getAttribute("data-requiremodule"));j=F[j.getAttribute("data-requirecontext")]}(j?j.defQueue:Q).push([e,f,k])};h.execCb=function(e,f,k){return f.apply(null,k)};h.onScriptLoad=function(e){var f=e.currentTarget||e.srcElement,k;if(e.type==="load"||Ca.test(f.readyState)){L=
null;e=f.getAttribute("data-requirecontext");k=f.getAttribute("data-requiremodule");F[e].completeLoad(k);f.removeEventListener?f.removeEventListener("load",h.onScriptLoad,false):f.detachEvent("onreadystatechange",h.onScriptLoad)}};h.attach=function(e,f,k,j,r){var m;if(y){j=j||h.onScriptLoad;m=document.createElement("script");m.type=r||"text/javascript";m.charset="utf-8";m.async=!p.skipAsync[e];m.setAttribute("data-requirecontext",f);m.setAttribute("data-requiremodule",k);if(m.addEventListener)m.addEventListener("load",
j,false);else{la=true;m.attachEvent("onreadystatechange",j)}m.src=e;Z=m;R?B.insertBefore(m,R):B.appendChild(m);Z=null;return m}else if(ja){j=F[f];f=j.loaded;f[k]=false;importScripts(e);j.completeLoad(k)}return null};p.baseUrl=u.baseUrl;if(y&&(!p.baseUrl||!B)){$=document.getElementsByTagName("script");ma=u.baseUrlMatch?u.baseUrlMatch:/(allplugins-)?require\.js(\W|$)/i;for(A=$.length-1;A>-1&&(M=$[A]);A--){if(!B)B=M.parentNode;if(!S&&(S=M.getAttribute("data-main"))){u.deps=u.deps?u.deps.concat(S):[S];
if(!u.baseUrl&&(x=M.src)){x=x.split("/");x.pop();p.baseUrl=u.baseUrl=x.length?x.join("/"):"./"}}if(!p.baseUrl&&(x=M.src))if(na=x.match(ma)){p.baseUrl=x.substring(0,na.index);break}}}h.pageLoaded=function(){if(!p.isPageLoaded){p.isPageLoaded=true;aa&&clearInterval(aa);if(oa)document.readyState="complete";h.callReady()}};h.checkReadyState=function(){var e=p.contexts,f;for(f in e)if(!(f in D))if(e[f].waitCount)return;p.isDone=true;h.callReady()};h.callReady=function(){var e=p.readyCalls,f,k,j;if(p.isPageLoaded&&
p.isDone){if(e.length){p.readyCalls=[];for(f=0;k=e[f];f++)k()}e=p.contexts;for(j in e)if(!(j in D)){f=e[j];if(f.jQueryIncremented){f.jQuery.readyWait-=1;f.jQueryIncremented=false}}}};h.ready=function(e){p.isPageLoaded&&p.isDone?e():p.readyCalls.push(e);return h};if(y){if(document.addEventListener){document.addEventListener("DOMContentLoaded",h.pageLoaded,false);window.addEventListener("load",h.pageLoaded,false);if(!document.readyState){oa=true;document.readyState="loading"}}else if(window.attachEvent){window.attachEvent("onload",
h.pageLoaded);if(self===self.top)aa=setInterval(function(){try{if(document.body){document.documentElement.doScroll("left");h.pageLoaded()}}catch(e){}},30)}document.readyState==="complete"&&h.pageLoaded()}h(u);if(typeof setTimeout!=="undefined"){C=p.contexts[u.context||"_"];C.requireWait=true;setTimeout(function(){C.requireWait=false;C.takeGlobalQueue();C.jQueryCheck();C.scriptCount||C.resume();h.checkReadyState()},0)}})();

/*
    Author : Ben Gerrissen
    License : MIT
*/

(function( global , doc , undefined ){

    var currentCommand
    , commandTimeout
    , queue = []
    , registry = {}
    , shelved = {}
    , dontShelf = {}
    , reserved = {}
    , onStoreListeners = {}

    , isBrowser = !!doc
    , isDomReady
    , isToolkitLoaded
    , isToolkitLoading
    , domTool

    , idReg = /^#/

    , slice = Array.prototype.slice
    , toString = Object.prototype.toString

    , toolkit = {

        JQUERY : "jquery",
        PROTOTYPE : "prototype",
        MOOTOOLS : "mootools",
        DOJO : "dojo"

    }

    , config = {

        toolkit : toolkit.JQUERY,
        baseUrlMatch : /(?:\\|\/)glue(?:[^\\\/]+)?\.js/

    }

    , toolkitUrl = {

        jquery : "https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js",
        prototype : "https://ajax.googleapis.com/ajax/libs/prototype/1.7.0.0/prototype.js",
        mootools : "https://ajax.googleapis.com/ajax/libs/mootools/1.3.0/mootools-yui-compressed.js",
        dojo : "https://ajax.googleapis.com/ajax/libs/dojo/1.5/dojo/dojo.xd.js"

    }

    , adapter = {
        jquery : {
            find : function ( expr ) {
                return jQuery( expr );
            },
            node : function( node ){
                return jQuery( node );
            },
            listen : function ( obj , eventType , listener ) {
                return obj.bind( eventType , listener );
            },
            deafen : function ( obj , eventType , listener ) {
                return obj.unbind( eventType , listener );
            }
        },
        prototype : {
            find : function ( expr ) {
                return $$( expr );
            },
            node : function ( node ) {
                return [ node ];
            },
            listen : function ( obj , eventType , listener ) {
                eventType.split( /\s+/ ).each( function ( evt ) {
                    $A( obj ).invoke( "observe" , evt , listener );
                } );
                return obj;
            },
            deafen : function ( obj , eventType , listener ) {
                eventType.split( /\s+/ ).each( function ( evt ) {
                    $A( obj ).invoke( "stopObserving" , evt , listener );
                } );
                return obj;
            }
        },
        mootools : {
            find : function ( expr ) {
                return $$( expr );
            },
            node : function ( node ) {
                return $$( node );
            },
            listen : function ( obj , eventType , listener ) {
                eventType.split( /\s+/ ).each( function ( evt ) {
                    obj.addEvent( evt , listener );
                } );
                return obj;
            },
            deafen : function ( obj , eventType , listener ) {
                eventType.split( /\s+/ ).each( function ( evt ) {
                    obj.removeEvent( evt , listener );
                } );
                return obj;
            }
        },
        dojo : {
            find : function ( expr ) {
                return dojo.query( expr );
            },
            node : function ( obj ) {
                return new dojo.NodeList( obj );
            },
            listen : function ( obj , eventType , listener ) {
                dojo.forEach( eventType.split( /\s+/ ) , function ( evt ) {
                    obj.forEach( function ( node ) {
                        dojo.connect( node , evt , listener );
                    } );
                } );
            },
            deafen : function ( obj , eventType , listener ) {
                dojo.forEach( eventType.split( /\s+/ ) , function ( evt ) {
                    obj.forEach( function ( node ) {
                        dojo.disconnect( [ node , evt , listener , 1 ] );
                    } );
                } );
            }
        }
    }

    , clone = ( "__proto__" in {} ) ? function ( obj , newProperties ) {

        obj = {
            __proto__ : obj
        };

        return newProperties ? inject( obj , newProperties ) : obj;

    } : function ( obj , newProperties ) {

        function Empty(){}
        Empty.prototype = obj;
        obj = new Empty;

        return newProperties ? inject( obj , newProperties ) : obj;

    }

    ;

    function type( obj ) {

        return toString.call( obj ).replace( /^\[\s*object\s*|\]$/g , "" ).toLowerCase();

    }

    function getToolkit() {

        if ( !config.toolkitUrl ) {

            throw "No CDN present for " + config.toolkit + ", requires manual 'data-toolkitUrl' setting on script tag.";

        }

        isToolkitLoading = true;

        require( [].concat( config.toolkitUrl ) , function () {

            tool = adapter[ config.toolkit ];
            isToolkitLoaded = true;
            handleQueue();

        } );

    }

    function register() {

        clearTimeout( commandTimeout );

        if ( !isToolkitLoading && !isToolkitLoaded ) {

            getToolkit();

        }

        if ( currentCommand && isBrowser && !isToolkitLoaded ) {

            queue.push( currentCommand );

        } else if ( currentCommand ) {

            resolve( currentCommand , false );

        }
        
        currentCommand = null;

    }

    function shelf( command ) {

        shelved[ command.id ] = command;


    }

    function unshelf( id ) {

        if ( shelved[ id ] ) {

            resolve( shelved[ id ] , true );
            delete shelved[ id ];

        } else {

            dontShelf[ id ] = true;

        }

    }

    function store( id , obj ) {

        if ( registry[ id ] ) {

            throw "Key '" + key + "' already defined in registry."

        }

        registry[ id ] = obj;

        fireOnStore( id , obj );

    }

    function onStore( id , callback ) {

        if ( registry[ id ] ) {

            return callback( registry[ id ] );

        }

        if ( !onStoreListeners[ id ] ) {

            onStoreListeners[ id ] = [];

        }

        onStoreListeners[ id ].push( callback );

        unshelf( id );

    }

    function fireOnStore( id , obj ) {

        var list = onStoreListeners[ id ] , i , len;

        if ( !list ) {

            return;

        }

        while( list.length ) {

            list.pop()( id , obj );

        }

    }

    function fetch( src , callback ) {

        console.log( src )

        if ( idReg.test( src ) ) {

            onStore( src.replace( idReg , "" ) , function( obj ) {

                console.log( " ON STORE CALLBACK" )

                command.set[ key ] = obj;
                checkDependencies( command );

            } );

        } else {

            require( [ src ] , function( obj ){

                callback( obj );

            } );

        }



    }

    function handleQueue() {

        var com;

        while ( com = queue.pop() ) {

            resolve( com , false );

        }

    }

    function resolve( command , notLazy ) {

        if ( command.when ) {

            resolve.when( command );

        } else if ( !notLazy && !dontShelf[ command.id ] ) {

            shelf( command );

        } else {

            prepare( command );

        }
        
    }

    resolve.when = function ( command ) {

        if ( command.when.now === true ) {

            command.when = null;
            return resolve( command , true );

        }

        if ( command.when.find ) {

            return require.ready( function () {

                command.found = tool.find( command.when.find );

                if ( command.found.length ) {

                    command.when.find = null;
                    resolve.when( command );

                }

            } );

        }

        if ( command.when.event ) {

            command.listener = function () {

                tool.deafen( command.found , command.when.event , command.listener );
                command.when.event = null;
                resolve.when( command );

            }

            return tool.listen( command.found , command.when.event , command.listener );

        }

        command.when = null;

        resolve( command , true );

    };

    function prepare( command ) {

        var key
        , map = command.set
        , check = function(){

            if ( --command.resourceCount === 0 ) {

                execute( command );

            }

        };

        if ( typeof command.src == "string" ) {

            fetch( command.src , function( obj ){

                command.module = obj;
                check();

            });

        }

        for ( key in map ) {

            if ( map.hasOwnProperty( key ) && typeof map[ key ] == "string" ) {

                (function(){
                    fetch( map[ key ] , function( obj ){
                        map[ key ] = obj;
                        check();
                    });
                }( key ));

            }

        }

    }

    function inject( obj , map ) {

        var key , setterName;

        for ( key in map ) {

            if ( !map.hasOwnProperty( key ) ) {

                continue;
                
            }

            setterName = "set" + key.replace( /^\w/ , key[ 0 ].toUpperCase() );

            if ( typeof obj[ setterName ] == "function" ) {

                obj[ setterName ]( map[ key ] );

            } else {

                obj[ key ] = map[ key ];

            }

        }

    }

    function createInstance( obj , command ) {

        var newObj;

        if ( typeof obj == "function" ) {

            newObj = clone( obj.prototype );
            newObj.constructor = obj


        } else if ( type( obj ) == "object" ) {

            newObj = clone( obj );

        } else {

            throw "Module of '" + command.src + "' is not instantiable.";

        }

        inject( newObj , command.set );

        console.log( "@createInstance after inject()");
        console.log( command.set );
        console.log( newObj );

        if ( typeof newObj.constructor == "function" ) {

            newObj.constructor.apply( newObj , command.create );

        }

        return newObj;

    }

    function execute( command ) {

        var obj = command.module;
        
        if ( command.create ) {

            obj = createInstance( obj , command );

        }

        if ( command.id ) {

            store( command.id , obj );

        }

        command.isExecuted = true;

        console.log( "@execute result")
        console.log( obj )

    }

    /**Starts a new command configuration for source path or id.
     * glue() is the global interface for CommandAPI.
     * @param {String} src Source path or glue-ID of target module.
     * @return {Function} CommandAPI
     */
    function glue( src ){

        if ( typeof src == "string" ) {

            return CommandAPI( src );

        }

    }

    /**Starts a new command configuration for source path or id.
     * @param {String} src Source path or glue-ID of target module.
     * @return {Function} CommandAPI
     */
    function CommandAPI( src ){

        register();

        currentCommand = {
            src : src,
            set : {},
            run : [],
            resourceCount: typeof src == "string" ? 1 : 0
        };

        commandTimeout = setTimeout( register , 10 );

        return CommandAPI;

    }

    /**Injects dependencies (Class/Objects) before constructor method is invoked.
     * GlueJS resolves dependencies before instance is created.
     * @param {String} key Property name for dependency, defined in target Class/Object
     * @param {String} value Value to be injected
     * @return {Function} CommandAPI
     */
    CommandAPI.set = function( key , value ){

        var k;

        if ( typeof key == "string" ) {

            currentCommand.set[ key ] = value;
            currentCommand.resourceCount++;

        } else if ( type( key ) == "object" ) {

            for ( k in key ) {

                if ( key.hasOwnProperty( k ) ) {

                    currentCommand.set[ k ] = key[ k ];
                    currentCommand.resourceCount++;

                }

            }

        }

        return CommandAPI;

    };

    /**
     *
     */
    CommandAPI.create = function( /* arguments */){

        currentCommand.create = slice.call( arguments );

        return CommandAPI;

    };

    CommandAPI.run = function( key , value ){

        currentCommand.run.push( {
            key : key,
            value : value
        } );

        return CommandAPI;

    };

    /**Store result of command under given id.
     *
     * @param {String} id
     * @return {Function} CommandAPI
     */
    CommandAPI.as = function( id ){

        if ( !reserved[ id ] ) {

            currentCommand.id = id;
            reserved[ id ] = true;

        } else {

            throw "ID '" + command.id + "' is already reserved.";

        }

        return CommandAPI;

    };

    CommandAPI.when = {

        /**Condition, execute command when elements exist in the DOM that match given
         * cssExpression
         * @param {String} cssExpression CSS Expression, see configured toolkit for support
         * @return {Function} CommandAPI
         */

        find : function ( cssExpression ) {

            if ( !currentCommand.when ) {

                currentCommand.when = {};

            }

            currentCommand.when.find = cssExpression;

            return CommandAPI;

        },

        /**Condition, execute command as soon as possible.
         * Dependencies are loaded and instantiated first if applicable.
         * @return {Function} CommandAPI
         */
        now : function () {

            if ( !currentCommand.when ) {

                currentCommand.when = {};

            }

            currentCommand.when.now = true;

            return CommandAPI;

        },

        /**Condition, execute command when one of the given event is fired.
         * Attaches listeners to .find() result if given, otherwise to the document element.
         * @return {Function} CommandAPI
         */
        event : function ( /* eventTypes */ ) {

            if ( !currentCommand.when ) {

                currentCommand.when = {};

            }

            currentCommand.when.event = slice.call( arguments ).join( " " ).split( /\s+/ );

            return CommandAPI;

        }

    };

    CommandAPI.each = {

        node : function () {

            if ( !currentCommand.each ) {

                currentCommand.each = {};

            }

            currentCommand.each.node = true;

            return CommandAPI;

        },

        instance : function ( ) {

            if ( !currentCommand.each ) {

                currentCommand.each = {};

            }

            currentCommand.each.instance = true;

        }

    };

    glue._Command = CommandAPI;
    glue._commands = queue;

    global.glue = glue;

    if ( isBrowser ) {

        var scripts = doc.getElementsByTagName( "script" )
        , i = scripts.length
        , node , requireConfig = {urlArgs:""};

        while ( i-- ) {

            if ( config.baseUrlMatch.test( scripts[ i ].src ) ) {

                node = scripts[ i ];
                break;

            }

        }

        if ( node ) {

            config.cacheKey     = node.getAttribute( "data-cacheKey" );
            config.load         = node.getAttribute( "data-load" );
            config.debug        = node.getAttribute( "data-debug" );
            config.baseUrl      = node.getAttribute( "data-baseUrl" );
            config.toolkit      = ( node.getAttribute( "data-toolkit" ) || config.toolkit ).toUpperCase();
            config.toolkit      = toolkit[ config.toolkit ];
            config.toolkitUrl   = node.getAttribute( "data-jqueryUrl" );

            if ( !config.toolkitUrl ) {

                config.toolkitUrl = toolkitUrl[ config.toolkit ];

            }

            if ( config.cacheKey ) {

                requireConfig.urlArgs = "cacheKey=" + config.cacheKey;

            }

            if ( config.debug == "true" ) {

                requireConfig.urlArgs += "-debugmode-" + ( +new Date() );

            }

            requireConfig.baseUrl = config.baseUrl || node.src.split( config.baseUrlMatch )[ 0 ];

            require( requireConfig );

            if ( config.load ) {

                require( config.load.replace( /\s+/g , "" ).split( "," ) );

            }

        }

        require.ready( function () {

            isDomReady = true;

        } );

    }

}( this , document ));
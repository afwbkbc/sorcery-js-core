Sorcery.define([
  'class/class',
  'service/globals',
  'service/algorithms',
  'service/dom'
],function(
  Class,
  Globals,
  Algorithms,
  Dom
){
  
  return Class.extend({
  
    class_name : 'controller',
    
    register : function(Router) {
      // override it and add routes
    },
    
    set_views : Sorcery.method(function(views,path,baseel) {

      //console.log('SET_VIEWS',views,path,baseel);
      
      var sid=Sorcery.begin();
      if (typeof(baseel)==='undefined')
        baseel=document;
      
      if (typeof(views.length)==='undefined')
        views=[views];
      
      if (typeof(path)==='undefined')
        path='';
      
      var viewskey='views/'+path;
      
      var self=this;
      
      Globals.retrieve(viewskey,function(currentviews){
        if (currentviews===null)
          currentviews=[];

        var collect=[];

        var toadd=[];
        var toremove=[];
        var torerender=[];
        var collectchildren=[];

        var i;
        Sorcery.loop.for(
          function(){ i=0 },
          function(){ return i<views.length },
          function(){ i++ },
          function(cont) {
            var view=views[i];
            //console.log('VIEW',view);
            var s=view.selector;
            if (typeof(s)==='undefined') {
              s='body > .container';
              if (!baseel.querySelector(s)) {
                var container=document.createElement('div');
                container.className="container";
                document.body.appendChild(container);
              }
            }
            var t=view.template;
            var a=view.arguments;
            if (typeof(a)==='undefined')
              a={};
            var p=path+'/'+s;
            
            var clt={
              selector:s,
              template:t,
              arguments:a
            };
            
            if (typeof(view.style)!=='undefined')
              clt.style=view.style;
            
            collect.push(clt);

            if (view.children) {
              collectchildren.push({
                view:collect[collect.length-1],
                children:view.children
              });
            }
            
            return cont();
          },
          function(){
            var sameviews=function(v,vv){
              return (v.selector===vv.selector)&&(v.template===vv.template)&&(v.style===vv.style);
            };

            for (var ii in currentviews) {
              var v=currentviews[ii];
              var match=false;
              for (var iii in collect) {
                var vv=collect[iii];
                if (v.selector===vv.selector) {
                  if (sameviews(v,vv)) {
                    if (typeof(v.view)!=='undefined') {
                      if (v.view._destroyed||!Dom.is_in_tree(v.view.el))
                        break;
                    }
                    match=true;
                  }
                  break;
                }
              }
              if (!match) {
                toremove.push(ii);
              }
            }
            for (var ii in collect) {
              var v=collect[ii];
              var match=false;
              for (var iii in currentviews) {
                var vv=currentviews[iii];
                if (v.selector===vv.selector) {
                  if (sameviews(v,vv)) {
                    if (typeof(vv.view)!=='undefined') {
                      if (vv.view._destroyed||!Dom.is_in_tree(vv.view.el)) {
                        break;
                      }
                    }
                    match=true;
                    v.view=vv.view;
                    if (!Algorithms.objects_equal(v.arguments,vv.arguments))
                      torerender.push(ii);
                  }
                  break;
                }
              }
              if (!match) {
                toadd.push(ii);
              }
            }

            //console.log('RA',toremove,toadd,torerender,collect);

            var i;
            Sorcery.loop.for(
              function(){ i=0; },
              function(){ return i<toremove.length; },
              function(){ i++; },
              function(cont){
                var k=toremove[i];
                var v=currentviews[k];
                var ii=toadd.indexOf(k);
                if (!v.view._destroyed)
                  v.view.remove(cont);
                else return cont();
              },
              function(){
                var ii;
                Sorcery.loop.for(
                  function(){ ii=0; },
                  function(){ return ii<toadd.length; },
                  function(){ ii++; },
                  function(cont){
                    var k=toadd[ii];
                    var v=collect[k];
                    var viewfunc=function(ViewTemplate) {
                      var selector=v.selector;
                      if (baseel!==document)
                        selector='[data-view="'+baseel.getAttribute('data-view')+'"] '+selector;
                      Sorcery.construct(ViewTemplate,baseel.querySelector(selector),function(vo){
                        collect[k].view=vo;
                        return vo.clear(function(){
                          return vo.set(collect[k].arguments,function(){
                            return vo.render(function(){
                              return cont();
                            });
                          });
                        });
                      });
                    };
                    var resolve=Sorcery.resolve_path(v.template,'js');
                    if (resolve===null) {
                      resolve=Sorcery.resolve_path(v.template,'template/*');
                      if (resolve===null)
                        throw new Error('neither view nor template exist for "'+v.template+'"');
                      Sorcery.require('class/view',function(View){
                        var template=View.extend();
                        template.module_name='#defaultview';
                        template.template=v.template;
                        if (typeof(v.style)!=='undefined')
                          template.style=v.style;
                        else {
                          var trystyle=v.template.replace(/template\/|view\//,'style/');
                          resolve=Sorcery.resolve_path(trystyle,'style/*');
                          if (resolve!==null)
                            template.style=trystyle;
                        }
                        return viewfunc(template);
                      });
                    }
                    else
                      Sorcery.require(v.template,function(ViewTemplate){
                        return viewfunc(ViewTemplate);
                      });
                  },
                  function(){
                    
                    var iiii;
                    Sorcery.loop.for(
                      function(){ iiii=0; },
                      function(){ return iiii<torerender.length; },
                      function(){ iiii++; },
                      function(cont){
                        var k=torerender[iiii];
                        var v=collect[k];
                        var vv=v.view;
                        return vv.clear(function(){
                          return vv.set(v.arguments,function(){
                            return vv.render(function(){
                              return cont();
                            });
                          });
                        });
                        
                      },
                      function(){
                        
                        //console.log('UPDATE',viewskey,currentviews,collect);

                        Globals.store(viewskey,collect,function(){

                          var iii;
                          Sorcery.loop.for(
                            function(){ iii=0 },
                            function(){ return iii<collectchildren.length },
                            function(){ iii++ },
                            function(cont) {
                              var c=collectchildren[iii];
                              if (typeof(c.view.view)!=='undefined') {
                                var p=c.view.selector;
                                if (path!=='')
                                  p=path+'/'+p;
                                var children;
                                if (typeof(c.children)==='object') {
                                  if (typeof(c.children[0])==='object')
                                    children=c.children;
                                  else {
                                    children=[];
                                    for (var iiii in c.children) {
                                      var child;
                                      if (typeof(c.children[iiii])==='string')
                                        child={
                                          template:c.children[iiii]
                                        };
                                      else
                                        child=c.children[iiii];
                                      child.selector=iiii;
                                      children.push(child);
                                    }
                                  }
                                }
                                else
                                  throw new Error('children is not an object');
                                //console.log('PROCESS',p,c.view,c.children);
                                self.set_views(children,p,c.view.view.el,cont);
                              }
                              else
                                return cont();
                            },
                            function() {
                              //console.log('DONE');
                              return Sorcery.end(sid);
                            }
                          );

                        });
                      }
                    );
                    
                  }
                );

              }
            );

            
          }
        );


      });
    })
    
  });
  
});
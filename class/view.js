Sorcery.define([
  'class/class',
  'service/fetcher',
  'service/dom',
  'service/globals',
//  'library/jquery',
],function(
    Class,
    Fetcher,
    Dom,
    Globals
//    jQuery
){
  
  return Class.extend({

    construct : Sorcery.method(function(viewel) {
      var sid=Sorcery.begin();
      
      if (viewel===null)
        throw new Error('view container is null');

      var self=this;
      
      self.data={}; 
      
      var todo=2;
      
      var final_func = function() {
        
        todo--;
        if (!todo) {
          //console.log('FF',viewel);
        
          if (viewel.getAttribute('data-view')!==null)
            throw new Error('duplicate view on single element');

          Dom.set_unique_attribute(viewel,'data-view','view',function(id){

            self.id=id;
            Globals.store(id,self,function(){

              self.el=viewel;
              //self.$el=jQuery(self.el);
              
              return Sorcery.end(sid);

            });

          });
          
        }
        
      };
      
      var init_template = function() {
      
        if (typeof(self.template)==='undefined')
          self.template=self.module_name.replace('view/','template/');
        
        self.template_engine=null;
        
        var templatepath=null;
        for (var i in Sorcery.engines.template) {
          templatepath=Sorcery.resolve_path(self.template,'template/'+i);
          if (templatepath!==null) {
            self.template_engine=i;
            break;
          }
        }
        if (templatepath===null)
          throw new Error('unable to find template "'+self.template+'"');
        else {
          templatepath+=Sorcery.engines.template[self.template_engine];
        }
//console.log('INITTEMPLATE',(new Error).stack);
        Fetcher.get_file(templatepath,function(content){
          self.template_data=content;
          return final_func();
        });
        
      };
      
      var init_style = function() {
        
        if (self.style===true)
          self.style=self.module_name.replace('view/','style/');
        else if (self.style===false)
          delete self.style;
        
        if (typeof(self.style)!=='undefined') {
        
          self.style_engine=null;

          var stylepath=null;
          for (var i in Sorcery.engines.style) {
            stylepath=Sorcery.resolve_path(self.style,'style/'+i);
            if (stylepath!==null) {
              self.style_engine=i;
              break;
            }
          }
          if (stylepath===null)
            throw new Error('unable to find style "'+self.style+'"');
          else {
            stylepath+=Sorcery.engines.style[self.style_engine];
          }

          Fetcher.get_file(stylepath,function(content){
            self.style_data=content;
            return final_func();
          });
        }
        else {
          return final_func();
        }
      };
      
      init_template();
      init_style();
      
    }),
    
    clear : Sorcery.method(function() {
      var sid=Sorcery.begin();
      
      var k=[];
      for (var i in this.data)
        k.push(i);
      
      this.unset(k,function(){
        return Sorcery.end(sid);
      });
      
    }),
    
    unset : Sorcery.method(function(keys) {
      var sid=Sorcery.begin();
      
      if (typeof(keys)==='string')
        keys=[keys];
      
      for (var i in keys) {
        var key=keys[i];
        if (typeof(this.data[key])!=='undefined') {
          
          //console.log('UNSET',key);
          
          // ...
          
          delete this.data[key];
        }
      }
      
      return Sorcery.end(sid);
    }),
    
    set : Sorcery.method(function(values,v2) {
      var sid=Sorcery.begin();
      
      if ((typeof(values)==='string')&&typeof(v2)!=='undefined') {
        v={};
        v[values]=v2;
        values=v;
      }
      
      for (var i in values) {
        
        //console.log('SET',i,values[i]);
        
        // ...
        
        this.data[i]=values[i];
      }
      
      return Sorcery.end(sid);
    }),
    
    get : Sorcery.method(function(key) {
      var sid=Sorcery.begin();
      
      if (isset)
      
      return Sorcery.end(sid);
    }),
    
    render : Sorcery.method(function() {
      var sid=Sorcery.begin();
      
      var self=this;
      
      self.el.innerHTML='';
      // TODO: "loading" stuff?
      
      Sorcery.require([
        'service/template_engine/'+self.template_engine,
      ],function(TemplateEngine){
        
        var finalfunc=function() {
          
          self.trigger('prerender');
          
          TemplateEngine.render(self.template_data,self.data,function(processed_data){

            self.el.innerHTML=processed_data;

            self.trigger('postrender');

            return Sorcery.end(sid);
          });
        
        };
        
        var myid=self.el.getAttribute('data-view');
        var el=document.head.querySelector('style[data-view="'+myid+'"]');
        
        if ((el!==null)||(typeof(self.style)==='undefined')) {
          return finalfunc();
        }
        else {
          
          var stylefinalfunc=function() {
            var el=document.createElement('STYLE');
            el.setAttribute('data-view',myid);
            el.innerHTML=self.style_cache;
            document.head.appendChild(el);
            return finalfunc();
          };
          
          if (typeof(self.style_cache)==='undefined') {
            
            Sorcery.require([
              'service/style_engine/'+self.style_engine,
            ],function(StyleEngine){

              StyleEngine.render(self.style_data,function(processed_data){

                var stylestart='{';
                var styleend='}';
                var startpos,endpos;

                var final_data='';
                do {
                  startpos=processed_data.indexOf(stylestart);
                  if (startpos>=0) {
                    final_data+='[data-view="'+self.id+'"] '+processed_data.substring(0,startpos);
                    processed_data=processed_data.substring(startpos);
                    endpos=processed_data.indexOf(styleend);
                    if (endpos>=0) {
                      final_data+=processed_data.substring(0,endpos+1);
                      processed_data=processed_data.substring(endpos+1);
                    }
                  }
                } while (startpos>=0);
                final_data+=processed_data;

                self.style_cache=final_data;

                return stylefinalfunc();

              });
              
            });
          }
          else
            return stylefinalfunc();
          
        }
        
      });
      
    }),
    
    remove_children : Sorcery.method(function(){
      var sid=Sorcery.begin();
      var self=this;
      if (self.el) {
        var els=self.el.querySelectorAll('[data-view]');
        var childels=[];
        for (var i in els) {
          var el=els[i];
          if (Dom.is_element(el)) {
            var chk=el.parentNode;
            while ((chk!==document)&&(chk!==null)) {
              var a=chk.getAttribute('data-view');
              if (a!==null) {
                if (a===self.id) // only accept direct children
                  childels.push(el);
                break;
              }
              chk=chk.parentNode;
            }
          }
        }
        
        //console.log('ELS',childels);
        
        var i;
        Sorcery.loop.for(
          function(){ i=0 },
          function(){ return i<childels.length },
          function(){ i++ },
          function(cont){
            var el=childels[i];
            Globals.retrieve(el.getAttribute('data-view'),function(v){
              //console.log('TRY',el,v,Globals);
              if (typeof(v.remove)==='function') {
                v.remove(function(){
                  return cont();
                });
              }
              else {
                el.removeAttribute('data-view');
                return cont();
              }
            });
          },
          function(){
            //console.log('ALL DONE');
            return Sorcery.end(sid);
          }
        );
        
        
      }
      else
        return Sorcery.end(sid);
    }),
    
    remove : Sorcery.method(function(){
      var sid=Sorcery.begin();
      
      var self=this;
      
      this.remove_children(function(){
        Sorcery.destroy(self,function(){
          return Sorcery.end(sid);
        });
      });
    }),
    
    destroy : Sorcery.method(function() {
      var sid=Sorcery.begin();

      var self=this;

      this.remove_children(function(){
        
        if (self.el) {
          var myid=self.el.getAttribute('data-view');
          var style=document.head.querySelector('style[data-view="'+myid+'"]');
          if (style!==null)
            style.remove();
          self.el.innerHTML='';
          self.el.removeAttribute('data-view');
          self.el=null;
        }
        
        return Sorcery.end(sid);
      });

    })
    
  });
});
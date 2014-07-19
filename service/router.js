Sorcery.define([
  'class/service',
  'class/controller'
],function(
  Service,
  Controller
){
  
  return Service.extend({
    
    routes : [],
    
    current_path : window.location.pathname.substring(1),
    
    initialize : function(controllers) {
      var self=this;
      if (controllers) {
        for (var i in controllers) {
          var c=controllers[i];
          if (c&&(c.class_name==='controller')) {
            c.register(this);
          }
        }
      }
      
      document.onclick = function(e) {
        e = e || window.event;
        var element = e.target || e.srcElement;
        if (element.tagName === 'A') {
          var url=element.getAttribute('href');
          if (url.indexOf(Sorcery.root_path)===0)
            url=url.substring(Sorcery.root_path.length);
          if (url[0]==='/') {
            try {
              var ret=self.redirect(url.substring(1));
            } catch (e) {
              console.error(e);
              return false;
            }
            return ret;
          }
          else {
            if (element.target==='')
              element.target='_blank';
            return true;
          }
        }
      };
      
      window.addEventListener("popstate", function(e) {
        self.redirect(window.location.pathname,true);
      });
      
      this.handle_path(this.current_path);
    },
    
    route : function(route) {
      this.routes.push(route);
    },
    
    generate : function(name,parameters) {
      for (var i in this.routes) {
        var route=this.routes[i];
        if (route.name==name) {
          var path='/'+route.pattern+'/';
          if (!parameters)
            parameters={};
          if (route.defaults)
            for (var ii in route.defaults)
              if (typeof(parameters[ii])==='undefined')
                parameters[ii]=route.defaults[ii];
          for (var ii in parameters)
            path=path.replace('/:'+ii+'/','/'+parameters[ii]+'/');
          var chk=path.indexOf(':');
          if (chk>=0) {
            var p=path.substring(chk);
            chk=p.indexOf('/');
            if (chk>=0)
              p=p.substring(0,chk);
            throw new Error('Missing argument '+p+' for route "'+name+'" and no default value was provided!');
          }
          return path.substring(0,path.length-1);
        }
      }
      throw new Error('Route "'+name+'" does not exist!');
    },
    
    handle_path : function(path,previous_path) {
      
      var match=this.match_path(this.current_path);
      
      if (match===null) {
        // 404
      }
      else {
        var route=match.route;
        var type=route.type;
        if (typeof(type)==='undefined')
          type='controller';
        if (type==='controller') {
          var ret=match.route.handler.apply(null,match.args);
          if ((typeof(ret)==='array')||(typeof(ret)==='object')) {
            Controller.set_views(ret);
          }
        }
        else if (type==='resource') {
          
          if (typeof(previous_path)==='undefined')
            throw new Error('internal error: missing rewrite rule for resource');
          
          return true;
          //window.open('/'+route.pattern,'');
          //history.back();
        }
        else {
          throw new Error('unknown route type "'+type+'"');
        }
      }
      return false;
    },
    
    // TODO: optimize
    match_path : function(path) {
      if (path[0]==='/')
        path=path.substring(1);
      for (var i in this.routes) {
        var route=this.routes[i];
        var pattern=route.pattern;
        var args=[];
        
        var rarr=pattern.split('/');
        var uarr=path.split('/');
        
        if (uarr.length>rarr.length)
          continue;
        
        var match=true;
        
        while (rarr.length) {
          var rv=rarr[0];
          rarr=rarr.splice(1);
          if (!uarr.length) {
            if ((rv[0]===':')&&((typeof(route.defaults)!=='undefined')&&(typeof(route.defaults[rv.substring(1)])!=='undefined'))) {
              uarr.push(route.defaults[rv.substring(1)]);
            }
            else {
              match=false;
              break;
            }
          }
          var uv=uarr[0];
          uarr=uarr.splice(1);
          if (rv[0]===':')
            args.push(uv);
          else if (rv!=uv) {
            match=false;
            break;
          }
        }
        
        if (match) {
          return {
            route:route,
            args:args,
          };
        }
        
      }
      return null;
    },
    
    redirect : function(path,nopushstate) {
      if (path[0]==='/')
        path=path.substring(1);
      if (this.current_path!=path) {
        var previous_path=this.current_path;
        this.current_path=path;
        var ret=this.handle_path(this.current_path,previous_path);
        if ((!nopushstate)&&(ret===false)) {
          history.pushState(null ,null, '/'+path);
        }
        else if (ret===true) {
          this.current_path=previous_path;
        }
        return ret;
      }
      else
        return false;
    },
    
  });
  
});
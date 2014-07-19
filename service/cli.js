Sorcery.define([
  'class/service',
],function(Service){
  
  var service=Service.extend({

    arguments : [],
    parameters : {},
    
    muted : false,
    
    mute : function() {
      this.muted=true;
    },
    
    unmute : function() {
      this.muted=false;
    },
    
    get_arguments : function() {
      return this.arguments;
    },
  
    get_parameters : function() {
      return this.parameters;
    },
    
    get_parameter : function(key) {
      if (typeof(this.parameters[key])!=='undefined')
        return this.parameters[key];
      else return null;
    },
    
    get_node_path : function() {
      return this.node_path;
    },
    
    get_app_path : function() {
      return this.app_path;
    },
    
    print : function(text) {
      if (!this.muted) {
        process.stdout.write(text);
      }
    },
    
  });
  
  service.node_path=process.argv[0];
  service.app_path=process.argv[1];
  service.arguments=process.argv.splice(2);
  
  var paramindex=0;
  
  for (var i in service.arguments) {
    var a=service.arguments[i];
    if (a.indexOf('--')===0) {
      a=a.substring(2);
      var v=null;
      var pos=a.indexOf('=');
      if (pos>=0) {
        v=a.substring(pos+1);
        a=a.substring(0,pos);
      }
      else {
        if (a.indexOf('no-')===0) {
          a=a.substring(3);
          v=false;
        }
        else if (a.indexOf('with-')===0) {
          a=a.substring(5);
          v=true;
        }
        else if ((a.indexOf('without-')===0)||(a.indexOf('disable-')===0)) {
          a=a.substring(8);
          v=false;
        }
        else if (a.indexOf('enable-')===0) {
          a=a.substring(7);
          v=true;
        }
        else
          v=true;
      }
      if (v==='true')
        v=true;
      else if (v==='false')
        v=false;
      else {
        var vnum=parseInt(v);
        if (!isNaN(vnum))
          v=vnum;
      }
      service.parameters[a]=v;
    }
    else
      service.parameters[paramindex++]=a;
  }
  
  return service;
  
});
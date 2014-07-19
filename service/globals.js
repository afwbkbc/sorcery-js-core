Sorcery.define([
  'class/service',
],function(Service){
  
  return Service.extend({

    data : {},
    
    store : Sorcery.method(function(key,value){
      var sid=Sorcery.begin();
      
      this.data[key]=value;
      
      Sorcery.end(sid);
    }),
    
    retrieve : Sorcery.method(function(key){
      var sid=Sorcery.begin();

      var ret=null;
      
      if (typeof(this.data[key])!=='undefined')
        ret=this.data[key];
      
      Sorcery.end(sid,ret);
    }),
    
    remove : Sorcery.method(function(key){
      var sid=Sorcery.begin();
      
      if (typeof(this.data[key])==='undefined')
        throw new Error('attempted to remove non-existent key "'+key+'"');
      delete this.data[key];
      
      Sorcery.end(sid);
    }),
    
  });
  
});
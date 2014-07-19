Sorcery.define([
  'class/service'
],function(Service){
  
  return Service.extend({
    
    render : Sorcery.method(function(content,values){
      var sid=Sorcery.begin();
      
      // override it in descendant classes
      
      return Sorcery.end(sid);
    }),
    
  });
  
});
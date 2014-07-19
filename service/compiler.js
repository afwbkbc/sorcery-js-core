Sorcery.define([
  'class/service'
],function(Service){
  
  return Service.extend({
    
    compile : Sorcery.method(function(source){
      var sid=Sorcery.begin();
      
      // override it in descendant classes
      
      return Sorcery.end(sid);
    })
    
  });
  
});

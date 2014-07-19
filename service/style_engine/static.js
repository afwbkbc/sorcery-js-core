Sorcery.define([
  'service/style_engine'
],function(StyleEngine){
  
  return StyleEngine.extend({
    
    render : Sorcery.method(function(content){
      var sid=Sorcery.begin();
      
      // just output as-is
      Sorcery.end(sid,content);
    }),
    
  });
  
});

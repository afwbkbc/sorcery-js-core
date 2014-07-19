Sorcery.define([
  'service/template_engine'
],function(TemplateEngine){
  
  return TemplateEngine.extend({
    
    render : Sorcery.method(function(content,values){
      var sid=Sorcery.begin();
      
      // just output as-is
      Sorcery.end(sid,content);
    }),
    
  });
  
});
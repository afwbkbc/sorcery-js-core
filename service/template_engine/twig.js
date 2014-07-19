Sorcery.define([
  'service/template_engine',
  'library/twig',
],function(TemplateEngine,Twig){
  
  return TemplateEngine.extend({
    
    render : Sorcery.method(function(content,values){
      var sid=Sorcery.begin();
      
      var template=Twig.twig({
        data:content,
      });
      
      var html=template.render(values);
      
      if (typeof(html)==='undefined')
        throw new Error('template rendering failed');
      
      return Sorcery.end(sid,html);
    }),
    
  });
  
});
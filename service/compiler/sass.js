Sorcery.define([
  'service/compiler'
],function(Compiler){

  return Compiler.extend({
    
    sass : require('node-sass'),
    
    compile : Sorcery.method(function(source){
      var sid=Sorcery.begin();
      
      this.sass.render({
        data:source,
        success:function(compiled) {
          return Sorcery.end(sid,compiled);
        }
      });
    })
    
  });

});

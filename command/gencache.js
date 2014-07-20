Sorcery.define([
  'class/command',
  'service/aux'
],function(Command,Aux){
  
  return Command.extend({
    
    run : function() {
      Aux.update_cache();
    },
    
    description : function() {
      return '(re)generate cache.js file';
    },
    
  });
  
});
Sorcery.define([
  'class/command',
  'service/aux',
],function(Command,Aux){
  
  return Command.extend({
    
    run : function() {
      Aux.update_rewrites();
    },
    
    description : function() {
      return 'update .htaccess with currently enable routes';
    }
    
  });
  
});
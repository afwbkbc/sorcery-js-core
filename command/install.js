Sorcery.define([
  'class/command'
],function(Command){
  
  return Command.extend({
    
    run : function() {
      console.log('INSTALL');
    },
    
    description : function() {
      return 'install a package';
    }
    
  });
  
});

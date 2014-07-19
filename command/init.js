Sorcery.define([
  'class/command',
  'service/aux',
  'service/cli',
],function(Command,Aux,Cli){

  return Command.extend({
    
    run : function() {
      
      var ret=Aux.init_app(Cli.get_parameter('force')===true);
      if (!ret)
        Cli.print('Unable to initialize - app/ is not empty. use --force to force initialization\n');

      
    },
    
    description : function() {
      return 'initialize basic app structure';
    }
    
  });

});

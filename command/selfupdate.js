Sorcery.define([
  'class/command',
  'service/origin',
  'service/fs',
  'service/cli'
],function(Command,Origin,Fs,Cli){

  return Command.extend({
    
    run : Sorcery.method(function() {
      var sid=Sorcery.begin();
      
      Cli.print('downloading latest sorcery.js...');
      Origin.download_script(function(contents){
        Cli.print('done\n');
        Fs.write_file('./sorcery.js',contents);
        return Sorcery.end(sid);
      });
      
    }),
    
    description : function() {
      return 'update sorcery.js script';
    }
    
  });

});

Sorcery.define([
  'class/command',
  'service/fs',
  'service/git',
  'service/cli'
],function(Command,Fs,Git,Cli){
  
  return Command.extend({
    
    run : Sorcery.method(function() {
      var sid=Sorcery.begin();
      
      var packages=Sorcery.packages;
      var versions={};
      
      var i;
      Sorcery.loop.for(
        function() { i=0; },
        function() { return i<packages.length; },
        function() { i++; },
        function(cont) {
          var p=packages[i];
          var path='./packages/'+p;
          
          if (Fs.file_exists(path)) {
            if (Fs.file_exists(path+'/.git')) {
              Git.query(path,'last_commit',function(commit){
                versions[p]={
                  oid:commit.toString(),
                  date:commit.date()
                };
                return cont();
              });
            }
            else {
              versions[p]={
                oid:'unknown',
                date:'not managed by git'
              };
              return cont();
            }
          }
          else
            return cont();
        },
        function() {
          
          for (var i in versions) {
            var v=versions[i];
            Cli.print(i+' : '+v.oid+' ('+v.date+')\n');
          }
          
          return Sorcery.end(sid);
          
        }
      );
      
      /*for (var i in packages) {
        var p=packages[i];
        var path='./packages/'+p;
        var version;
        
        if (Fs.file_exists(path+'/.git')) {
          Git.query(path,'last_commit',function(commit){
            console.log('B',commit.toString());
            return Sorcery.end(sid);
          });
        }
        else
          version='unknown (not managed by git)';
        versions[p]=version;
      }*/
      
    }),
    
    description : function() {
      return 'list installed packages with their versions';
    }
    
  });
  
});

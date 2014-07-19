Sorcery.define([
  'class/service',
],function(Service){
  
  return Service.extend({
    
    git : require("nodegit"),
    
    query : function(path,request,callback) {
      
      if (typeof(request)==='string')
        request=[request];
      
      this.git.Repo.open(path,function(err,repo){
        
        var result=[];
        
        var i;
        Sorcery.loop.for(
          function(){ i=0; },
          function(){ return i<request.length; },
          function(){ i++; },
          function(cont) {
            var r=request[i];
            if (r==='last_commit') {
              repo.getBranch('master',function(err,commit){ // TODO: alternative branches
                result.push(commit);
                return cont();
              });
            }
            else
              throw new Error('unknown query "'+r+'"');
          },
          function(){
            if (typeof(callback)==='function')
              return callback.apply(null,result);
          }
        );
        
      });
      
    }
    
  });
  
});
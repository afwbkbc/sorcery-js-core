Sorcery.define([
  'class/service'
],function(Service){
  
  return Service.extend({
    
    http : require("http"),
    
    get : Sorcery.method(function(url){
      var sid=Sorcery.begin();
      
      this.http.get(url,function(http){
        
        var accum='';
        http.on('data',function(data){
          accum+=data;
        }).on('end',function(){
          return Sorcery.end(sid,accum);
        });
        
      });
      
    })
    
  });
  
});

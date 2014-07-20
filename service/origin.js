Sorcery.define([
  'class/service',
  'service/http'
],function(Service,Http){

  return Service.extend({
    
    download_script : Sorcery.method(function() {
      var sid=Sorcery.begin();
      
      Http.get(Sorcery.origin_url+'/download/sorcery.js',function(contents){
        return Sorcery.end(sid,contents);
      });
      
    })
    
  });

});

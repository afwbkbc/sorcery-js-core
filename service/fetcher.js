Sorcery.define([
  'class/service',
],function(Service){
  
  return Service.extend({
    
    file_cache : {},
    fetch_queue : {},
    
    get_file : function(path,success,error) {
      //console.log('GET FILE',path,success,error,(new Error).stack);
      if (typeof(this.file_cache[path])!=='undefined')
        return success(this.file_cache[path]);
      
      if (typeof(this.fetch_queue[path])==='undefined') {
        this.fetch_queue[path]=[];
        var self=this;
        
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 ) {
             if (xmlhttp.status == 200) {
               var ret=xmlhttp.responseText;
               self.file_cache[path]=ret;
               for (var i in self.fetch_queue[path]) {
                 var q=self.fetch_queue[path][i];
                 if (typeof(q.success)==='function')
                   q.success(ret);
               }
               delete self.fetch_queue[path];
             }
             else {
               for (var i in self.fetch_queue[path]) {
                 var q=self.fetch_queue[path][i];
                 if (typeof(q.error)==='function')
                   q.error();
               }
               delete self.fetch_queue[path];
             }
          }
        };
        xmlhttp.open('GET', path, true);
        xmlhttp.send();
      }
      
      this.fetch_queue[path].push({
        success:success,
        error:error,
      });
    },
    
    js_loaded : {},
    
    get_js : function(path,success,error) {
      
      if (typeof(this.js_loaded[path])!=='undefined')
        return;
      
      this.js_loaded[path]=true;
      
      var script = document.createElement('script');
      script.src=path;
      script.onload=function(){
        if (typeof(success)==='function')
          return success();
      };
      script.onerror=function(e){
        if (typeof(error)==='function')
          return error();
      };
      document.head.appendChild(script);
      return script;
      
    },
    
  });
});
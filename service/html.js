Sorcery.define([
  'class/service'
],function(Service){
  
  return Service.extend({
    
      global : {
        
        set_title : function(title) {
          document.querySelector('head > title').innerHTML=title;
        },
        
        add_css : function(href,attributes) {
         
          var link=document.createElement('LINK');
          link.rel='stylesheet';
          link.type='text/css';
          link.media='screen';
          link.href=href;
          if (typeof(attributes)!=='undefined')
            for (var i in attributes)
              link[i]=attributes[i];
          
          document.head.appendChild(link);
          
        }
        
      }
    
  });
  
});
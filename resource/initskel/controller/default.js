Sorcery.define([
  'class/controller'
],function(Controller){
  
  return Controller.extend({
    
    register : function(Router) {
      
      Router.route({
        name : 'default',
        pattern : '',
        handler : function() {
          
          return {
            template:'view/default',
          };
          
        }
      })
      
    }
    
  });
  
});
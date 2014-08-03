Sorcery.define([
  'class/class'
],function(Class){
  
  return Class.extend({
    
    class_name : 'model',
    
    construct : function(){
      var fields=this.fields();
      if (typeof(fields)!=='object')
        throw new Error('"fields" method in model "'+this.module_name+'" must return an object, '+typeof(fields)+' returned');
      this.data=[];
      for (var i in fields) {
        
      }
    },
    
    fields : function() {
      throw new Error('Please specify "fields" method in model "'+this.module_name+'"!');
    }
    
  });
  
});
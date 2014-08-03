Sorcery.define([
  'class/class'
],function(Class){
  
  return Class.extend({
    
    class_name : 'model',
    
    construct : function(){
      var fields=this.fields();
      console.log('F',fields);
    },
    
    fields : function() {
      console.log('adasdsad',this);
    }
    
  });
  
});
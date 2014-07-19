Sorcery.define([
  'class/service',
  'service/algorithms',
],function(Service,Algorithms){
  
  return Service.extend({

    is_in_tree : function(el) {
      do {
        el=el.parentNode;
        if (el===document)
          return true;
      } while (el!==null);
      return false;
    },

    is_element : function(obj){
      try {
        //Using W3 DOM2 (works for FF, Opera and Chrom)
        return obj instanceof HTMLElement;
      }
      catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have. (works on IE7)
        return (typeof obj==="object") &&
          (obj.nodeType===1) && (typeof obj.style === "object") &&
          (typeof obj.ownerDocument ==="object");
      }
    },

    set_unique_attribute : Sorcery.method(function(element,attribute,prefix){
      var sid=Sorcery.begin();
      
      this.get_unique_attribute(attribute,prefix,function(value){
        element.setAttribute(attribute,value);
        Sorcery.end(sid,value);
      });
      
    }),
    
    get_unique_attribute : Sorcery.method(function(attribute,prefix){
      var self=this;
      
      var sid=Sorcery.begin();
      
      if (prefix)
        prefix+='_';
      else prefix='';
      
      var tryfunc=function(){
        Algorithms.get_random_ascii_string(16,function(value){
          value=prefix+value;
          var chk=document.querySelector('['+attribute+'="'+value+'"]');
          if (chk===null)
            Sorcery.end(sid,value);
          else return tryfunc();
        });
      };
      tryfunc();
      
    }),
    
  });
  
});
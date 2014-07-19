Sorcery.define([
  'class/service',
],function(Service){

  return Service.extend({
   
    objects_equal : function(o1,o2) {
      var self=this;
      var eqfunc=function(obj1,obj2) {
        for (var i in obj1) {
          var v1=obj1[i];
          var v2=obj2[i];
          if (typeof(v1)!==typeof(v2))
            return false;
          if (typeof(v1)==='array') {
            if (!self.arrays_equal(v1,v2))
              return false;
          }
          else if ((typeof(v1)==='object')&&(v1!==null)&&(v2!==null)) {
            if (!self.objects_equal(v1,v2))
              return false;
          }
          else if (v1!==v2)
            return false;
        }
        return true;
      };
      return eqfunc(o1,o2)&&eqfunc(o2,o1);
    },
   
    arrays_equal : function(a1,a2) {
      if (a1.length!==a2.length)
        return false;
      for (var i=0;i<a1.length;i++) {
        var v1=a1[i];
        var v2=a2[i];
        if (typeof(v1)!==typeof(v2))
          return false;
        if (typeof(v1)==='array') {
          if (!this.arrays_equal(v1,v2))
            return false;
        }
        else if ((typeof(v1)==='object')&&(v1!==null)&&(v2!==null)) {
          if (!this.objects_equal(v1,v2))
            return false;
        }
        else if (v1!==v2)
          return false;
      }
      return true;
    },
  
    get_random_ascii_string : Sorcery.method(function(length,chars){
      var sid=Sorcery.begin();
      if (!chars)
        chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      Sorcery.end(sid,result);
    }),
  
  });
  
});
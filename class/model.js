Sorcery.define([
  'class/class'
],function(Class){
  
  return Class.extend({
    
    class_name : 'model',
    
    construct : Sorcery.method(function(){
      var sid=Sorcery.begin();
      var fields=this.fields();
      if (typeof(fields)!=='object')
        throw new Error('"fields" method in model "'+this.module_name+'" must return an object, '+typeof(fields)+' returned');
      this.data={};
      var self=this;
      Sorcery.loop.in(
        fields,
        function(key,value,cont) {
          var v=null;
          if (typeof(value.default_value)!=='undefined')
            v=value.default_value;
          Sorcery.call(self.set,key,v,cont);
        },
        function() {
          self.fields_cache=fields;
          return Sorcery.end(sid);
        }
      );
    }),
    
    destroy : Sorcery.method(function(){
      var sid=Sorcery.begin();
      var keys=[];
      for (var i in this.data)
        keys.push(i);
      Sorcery.call(this.unset,keys,function(){
        return Sorcery.end(sid);
      });
    }),
    
    fields : function() {
      throw new Error('Please specify "fields" method in model "'+this.module_name+'"!');
    },
    
    unset : Sorcery.method(function(k) {
      var sid=Sorcery.begin();
      if (typeof(k)!=='object') {
        if (typeof(k)==='string')
          k=[k];
        else
          throw new Error('Invalid parameter passed to unset() in model "'+this.module_name+'"!');
      }
      else if (k.constructor !== Array)
        throw new Error('Invalid parameter passed to unset() in model "'+this.module_name+'"!');
      
      var self=this;
      
      Sorcery.loop.in(
        k,
        function(index,key,cont) {
          Sorcery.call(self.get,key,function(value){
            if (typeof(value)==='undefined')
              return cont();
            Sorcery.call(self.trigger,'unset',{
              key:key,
              value:value
            },function(ret){
              if (ret!==false)
                delete self.data[key];
              return cont();
            });
          });
        },
        function() {
          return Sorcery.end(sid);
        }
      );
      
    }),
    
    get : Sorcery.method(function(k){
      var sid=Sorcery.begin();
      return Sorcery.end(sid,this.data[k]);
    }),
    
    set : Sorcery.method(function(k,v) {
      var sid=Sorcery.begin();
      
      var self=this;
      
      if (typeof(k)!=='object') {
        if ((typeof(k)==='string')&&(typeof(v)!=='undefined')) {
          var ko=k;
          k={};
          k[ko]=v;
        }
        else
          throw new Error('Invalid parameter(s) passed to set() in model "'+this.module_name+'"!');
      }

      Sorcery.loop.in(
        k,
        function(key,value,cont) {
          Sorcery.call(self.get,key,function(oldvalue){
            Sorcery.call(self.trigger,'set',{
              key:key,
              value:value,
              oldvalue:oldvalue
            },function(ret){
              if (ret!==false) {
                var func1=function(){
                  var func2=function(){
                    self.data[key]=value;
                    return cont();
                  };

                  if (typeof(oldvalue)!=='undefined')
                    Sorcery.call(self.unset,key,func2);
                  else
                    return func2();
                };
                if (value&&typeof(value.trigger)==='function') {
                  Sorcery.call(value.trigger,'setme',{
                    key:key,
                    to:self,
                    oldvalue:oldvalue
                  },function(ret){
                    if (ret!==false)
                      return func1();
                    else return cont();
                  });
                }
                else
                  return func1();
              }
              else
                return cont();
            });
          });
        },
        function() {
          return Sorcery.end(sid);
        }
      );
    
    })
    
  });
  
});
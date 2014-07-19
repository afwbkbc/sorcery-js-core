Sorcery.define([],function(){
  var cls={
    //listeners:[],
    extend : function(additional) {
      if (typeof(additional)==='undefined')
        additional={};
      var ret=additional;
      for (var i in this) {
        if (typeof(ret[i])==='undefined')
          ret[i]=this[i];
      }
      ret.this_class=ret;
      ret.parent_class=this;
      return ret;
    },
    on : function(events,callback) {
      if (typeof(this.listeners)==='undefined')
        this.listeners=[];
      events=' '+events+' ';
      var pos=events.indexOf(' ');
      while (pos>=0) {
        var evt=events.substring(0,pos);
        if (evt) {
          if (typeof(this.listeners[evt])==='undefined')
            this.listeners[evt]=[];
          this.listeners[evt].push(callback);
        }
        events=events.substring(pos+1);
        pos=events.indexOf(' ');
      }
    },
    trigger : function(event,args) {
      if ((typeof(this.listeners)!=='undefined')&&(typeof(this.listeners[event])!=='undefined')) {
        if (typeof(args)==='undefined')
          args={};
        for (var i in this.listeners[event]) {
          var l=this.listeners[event][i];
          l.call(this,args);
        }
      }
    }
  };
  cls.this_class=cls;
  cls.parent_class=null;
  return cls;
});
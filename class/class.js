Sorcery.define([],function(){
  var cls={
    extend : function(additional) {
      if (typeof(additional)==='undefined')
        additional={};
      var ret=additional;
      for (var i in this) {
        if (typeof(ret[i])==='undefined') {
          ret[i]=this[i];
          if (typeof(ret[i])==='function') {
            ret[i]._s_owner=ret;
            ret[i]._s_name=i;
          }
        }
      }
      for (var i in ret) {
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
    },
    depend_on : function(obj) {
      if (typeof(this.depends_on)==='undefined')
        this.depends_on=[];
      if (typeof(obj.depends)==='undefined')
        obj.depends=[];
      if (this.depends_on.indexOf(obj)<0)
        this.depends_on.push(obj);
      if (obj.depends.indexOf(this)<0)
        obj.depends.push(this);
    },
    construct : function() {
      
    },
    destroy : Sorcery.method(function() {
      var sid=Sorcery.begin();
      
      if (typeof(this.depends_on)!=='undefined') {
        for (var i in this.depends_on) {
          var v=this.depends_on[i];
          var iof=v.depends.indexOf(this);
          if (iof>=0) {
            v.depends.splice(iof,1);
            break;
          }
        }
      }
      if (typeof(this.depends)!=='undefined') {
        var self=this;
        var i;
        Sorcery.loop.for(
          function() { i=0; },
          function() { return i<self.depends.length; },
          function() { i++; },
          function(cont) {
            var v=self.depends[i];
            Sorcery.call(v.destroy,cont);
          },
          function() {
            return Sorcery.end(sid);
          }
        );
      }
      else
        return Sorcery.end(sid);
      /*if (typeof(this.depends)!=='undefined') {
        for (var i in this.depends) {
          var v=this.depends[i];
          
        }
      }*/
    })
  };
  cls.this_class=cls;
  cls.parent_class=null;
  return cls;
});
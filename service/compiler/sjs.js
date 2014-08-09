Sorcery.define([
  'service/compiler'
],function(Compiler){

  return Compiler.extend({
    
    parse_stack : function(source) {
      
      //console.log('parse stack',source);
      
      var parsed='';
      var requires=[];
      var pos;
      
      var require={};
      var extend={};
      
      var stack=[];
      
      var rlevel=1;
      var pos1=source.indexOf('{');
      if (pos1>=0) {
        stack.push(source.substring(0,pos1));
        source=source.substring(pos1);
        var pos2;
        var oldpos=1;
        do {
          pos1=source.indexOf('{',oldpos);
          pos2=source.indexOf('}',oldpos);
          if (pos2<0)
            throw new Error('compile error: unclosed "{"');
          if ((pos1>=0)&&(pos1<pos2)) {
            rlevel++;
            oldpos=pos1+1;
          }
          else {
            rlevel--;
            oldpos=pos2+1;
          }
        } while (rlevel>0);
        stack.push(source.substring(0,pos2+1));
        source=source.substring(pos2+1);
      }
      stack.push(source);
      
      for (var i in stack) {
        var source=stack[i];
        
        pos=0;
        var c=source[pos];
        while (c===' ')
          c=source[++pos];
        if (c==='{') {
          var rpos=source.length-1;
          var cc=source[rpos];
          while (cc===' ')
            cc=source[--rpos];
          parsed+=' {'+this.parse_stack(' '+source.substring(pos+1,rpos-1)+' ')+'}';
          continue;
        }
        
        while ((pos=source.indexOf(' ~ '))>=0) {
          var ppos=pos;
          var op1,op2;
          do {
            ppos=source.lastIndexOf(' ',ppos-1);
            if (ppos<0)
              throw new Error('compile error: ~ without first operand');
            op1=source.substring(ppos+1,pos);
          } while (op1==='');
          var npos=pos+3;
          do {
            npos=source.indexOf(' ',npos+1);
            if (npos<0)
              throw new Error('compile error: ~ without second operand');
            op2=source.substring(pos+3,npos);
          } while (op2==='');
          source=source.substring(0,ppos)+' '+source.substring(npos+1);
          require[op1]=op2;
        }

        while ((pos=source.indexOf(' :: '))>=0) {
          var ppos=pos;
          var op1,op2;
          do {
            ppos=source.lastIndexOf(' ',ppos-1);
            if (ppos<0)
              throw new Error('compile error: ~ without first operand');
            op1=source.substring(ppos+1,pos);
          } while (op1==='');
          var npos=pos+3;
          do {
            npos=source.indexOf(' ',npos+1);
            if (npos<0)
              throw new Error('compile error: ~ without second operand');
            op2=source.substring(pos+3,npos);
          } while (op2==='');
          
          var spos=npos;
          var c=source[spos];
          while (typeof(c)!=='undefined') {
            if (c!==' ')
              throw new Error('compile error: expected "{", found "'+c+'"');
            spos++;
            c=source[spos];
          }
          
          source=source.substring(spos);

        }
        
        parsed+=' '+source;
      
      }
      
      
      return parsed;
    },
    
    compile : Sorcery.method(function(source){
      var sid=Sorcery.begin();
      
      source=source.replace(/\n/g,' ').replace(/\r/g,' ');
      
      while (source.indexOf('  ')>=0)
        source=source.replace(/  /g,' ');
      
      var compiled=this.parse_stack(' '+source+' ');
      
      console.log('compiled',compiled);
      
      //return Sorcery.end(sid,compiled);
    })
    
  });

});

/**
 * ! -
 * # - (comment?)
 * $ -
 * @ - events
 * & - fork
 */
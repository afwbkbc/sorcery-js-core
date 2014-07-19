Sorcery.define([
  'class/service',
],function(Service){

  return Service.extend({
    
    fs : require('fs'),
    path : require('path'),

    file_info : function(path,key) {
      var info=this.fs.statSync(path);
      if (typeof(key)!=='undefined') {
        if (typeof(info[key])==='undefined')
          return null;
        else return info[key];
      }
      else
        return info;
    },

    remove_directory : function(path) {
      
      return this.fs.rmdirSync(path);
      
    },

    remove_file : function(path) {
      
      return this.fs.unlinkSync(path);
      
    },
  
    copy_file : function(src,dest,callback) {
      
      var pos=dest.lastIndexOf('/');
      if (pos>=0) {
        this.mkdir_recursive(dest.substring(0,pos+1));
      }
      
      var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
      BUF_LENGTH = 64 * 1024;
      buff = new Buffer(BUF_LENGTH);
      fdr = this.fs.openSync(src, 'r');
      fdw = this.fs.openSync(dest, 'w');
      bytesRead = 1;
      pos = 0;
      while (bytesRead > 0) {
        bytesRead = this.fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
        this.fs.writeSync(fdw, buff, 0, bytesRead);
        pos += bytesRead;
      }
      this.fs.closeSync(fdr);
      return this.fs.closeSync(fdw);
      
   /*   var dirname=this.path.dirname;
      
      var self=this;
      this.mkdirp(dirname(dest),function(err){
        if (err) {
          throw new Error('unable to create directories');
        }
        var r=self.fs.createReadStream(src);
        var w=self.fs.createWriteStream(dest);
        w.on('close',function(){
          if (typeof(callback)==='function')
            callback();
        });
        r.pipe(w);
      });*/
      
    },

    mkdir : function(path) {
      this.fs.mkdirSync(path);
    },
  
    mkdir_recursive : function(path,root) {

      var dirs = path.split('/'), dir = dirs.shift(), root = (root||'')+dir+'/';

      try {
        this.mkdir(root);
      }
      catch (e) {
          //dir wasn't made, something went wrong
          if(!this.fs.statSync(root).isDirectory()) throw new Error(e);
      }

      return !dirs.length||this.mkdir_recursive(dirs.join('/'), root);
    },

    file_exists : function(path) {
      return this.fs.existsSync(path);
    },
    
    watch_directory : function(dir,options) {
      if (typeof(options)==='undefined')
        options={permanent:true};
      var chokidar=require('chokidar');
      var watcher=chokidar.watch(dir,options);
      return watcher;
    },
    
    list_directory : function(path) {
      return this.fs.readdirSync(path);
    },
    
    list_directory_recursive : function(path) {
      var self=this;
      var walk = function(dir) {
        var results = [];
        var list = self.fs.readdirSync(dir);
        list.forEach(function(file) {
            file = dir + '/' + file;
            var stat = self.fs.statSync(file);
            if (stat && stat.isDirectory()) results = results.concat(walk(file));
            else results.push(file);
        });
        return results;
      };
      return walk(path);
    },
    
    write_file : function(path,contents) {
      var pos=path.lastIndexOf('/');
      if (pos>=0) {
        this.mkdir_recursive(path.substring(0,pos+1));
      }
      this.fs.writeFileSync(path,contents,'utf8');
    },
    
    read_file : function(path) {
      return this.fs.readFileSync(path,'utf8');
    },
    
    read_resource : function(path) {
      var resolved=Sorcery.resolve_resource(path);
      if (resolved===null)
        throw new Error('resource "'+path+'" does not exist');
      return this.read_file(resolved);
    }
    
  });
  
});
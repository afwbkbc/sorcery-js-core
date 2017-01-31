Sorcery.define([
  'class/service',
  'service/fs',
  'service/cli',
],function(Service,Fs,Cli){

  return Service.extend({

    init_app : Sorcery.method(function(force) {
      
      var sid=Sorcery.begin();
      
      var chk=Fs.list_directory('./app');
      if ((chk.length>0)&&!force) {
        return false;
      }
      
      var files=[
        'frontend.js',
        'backend.js',
        'controller/default.js',
        'view/default.js',
        'template/default.html',
        'style/default.css',
        'global/css/normalize.css',
        'global/css/main.css',
      ];
      
      Cli.print('initializing default app/ structure...\n');
      
      var src='initskel/';
      var dst='app/';
      
      for (var i in files) {
        var f=files[i];
        var r=Sorcery.resolve_resource(src+f);
        if (r!==null) {
          Cli.print('\t'+dst+f+'\n');
          Fs.copy_file(r,dst+f);
        }
      }
      
      Cli.print('done\n');
      
      return Sorcery.end(sid,null);
    }),

    reload_cache : function() {
      var data=Fs.read_file('./cache.js');
      if (data)
        eval(data);
    },

    update_cache : function() {
      
      var filedata='';

      var resourcecache={};
      
      var getcache = function(extensions) {
        if (typeof(extensions)==='string')
          extensions=[extensions];
        // parse bundles and generate path cache
        var pathcache={};

        var paths=Sorcery.get_require_paths();
        var appstr='./app/';
        var packagestr='./packages/';
        var resourcestr='resource/';
        for (var i in paths) {
          var path=paths[i];
          var files=Fs.list_directory_recursive(path);
          for (var ii in files) {
            var f=files[ii].substring(path.length);
            if (f[0]==='/')
              f=f.substring(1);
            var fpath=path+f;
            var vendor,package,ipath,basedir;
            if (fpath.indexOf(appstr)===0) {
              vendor=null;
              package=null;
              ipath=fpath.substring(appstr.length);
            }
            else if (fpath.indexOf(packagestr)===0) {
              fpath=fpath.substring(packagestr.length);
              var pos=fpath.indexOf('/');
              if (pos<0)
                continue; // no vendor dir or package dir
              vendor=fpath.substring(0,pos);
              if (!vendor)
                continue; // something's wrong
              package=fpath.substring(pos+1);
              if (!package)
                continue; // something's wrong
              pos=package.indexOf('/');
              if (pos>=0) {
                ipath=package.substring(pos+1);
                package=package.substring(0,pos);
              }
              else {
                ipath='';
              }
            }
            else
              continue;
            var pos=ipath.indexOf('/');
            if (pos>=0)
              basedir=ipath.substring(0,pos);
            else basedir='';
            if (basedir==='resource') {
              if (f.indexOf(resourcestr)===0) {
                f=f.substring(resourcestr.length);
                if (typeof(resourcecache[f])==='undefined')
                  resourcecache[f]=[];
                if (resourcecache[f].indexOf(path+resourcestr)<0)
                  resourcecache[f].push(path+resourcestr);
              }
            }
            else {
              if (f.length>3) {
                for (var iii in extensions) {
                  var ext=extensions[iii];
                  var ei=f.indexOf(ext);
                  var fl=f.length;
                  var el=ext.length;
                  var flel=fl-el;
                  if ((ei>=0)&&(ei===flel)) {
                    f=f.substring(0,flel);
                    if (typeof(pathcache[f])==='undefined')
                      pathcache[f]=[];
                    if (pathcache[f].indexOf(path)<0)
                      pathcache[f].push(path);
                  }
                }
              }
            }
          }
        }
        return pathcache;
      };
      
      var pathcache={
          js:getcache('.js'),
      };
      
      for (var i in Sorcery.engines.template)
        pathcache['template/'+i]=getcache(Sorcery.engines.template[i]);
      
      for (var i in Sorcery.engines.style)
        pathcache['style/'+i]=getcache(Sorcery.engines.style[i]);
      
      for (var i in Sorcery.compilers) {
        compiler=Sorcery.compilers[i];
        compiled=getcache(compiler.source);
        var pck=compiler.type+'/'+compiler.engine;
        for (var ii in compiled) {
          if (typeof(pathcache[pck][ii])==='undefined')
            pathcache[pck][ii]=[];
          for (var iii in compiled[ii]) {
            var c=compiled[ii][iii].replace(/\.\//,'./compiled/');
            if (pathcache[pck][ii].indexOf(c)<0)
              pathcache[pck][ii].push(c);
          }
        }
      }
      
      var packages=[];
      var dirs1=Fs.list_directory('./packages');
      for (var i in dirs1) {
        var dirs2=Fs.list_directory('./packages/'+dirs1[i]);
        for (var ii in dirs2)
          packages.push(dirs1[i]+'/'+dirs2[ii]);
      }
      
      filedata+='Sorcery.set_packages('+JSON.stringify(packages)+');Sorcery.set_path_cache('+JSON.stringify(pathcache)+');Sorcery.set_resource_cache('+JSON.stringify(resourcecache)+');';
      
      // other
      Fs.write_file('cache.js',filedata);
      
    },
    
    update_rewrites : function() {

      Sorcery.unrequire([
        'controller/*'
      ]);
      
      var routemasks={};

      var htmlpath='sorcery.html';

      var pseudo_router={

        route : function(data) {
          var pattern=data.pattern;
          if (typeof(pattern)!=='string')
            return;
          var pos;
          while ((pos=pattern.indexOf(':'))>=0) {
            var subpattern=pattern.substring(pos);
            var pos2=subpattern.indexOf('/');
            if (pos2>=0)
              subpattern=subpattern.substring(0,pos2);
            pattern=pattern.replace(subpattern,'([^/]+)');
          }
          var type=data.type;
          if (typeof(type)==='undefined')
            type='controller';
          
          var target;
          if (type==='controller')
            target=htmlpath;
          else if (type==='resource') {
            var rpath=data.resource;
            if (typeof(rpath)==='undefined')
              rpath=data.pattern;
            var resolve=Sorcery.resolve_resource(rpath);
            if (resolve!==null) {
              target=resolve;
            }
            else
              target=null;
          }
          else
            target=null;
          
          if (target!==null)
            routemasks[pattern]=target;
        }

      };

      var cpaths=Sorcery.path_preparse('controller/*');
      
      var i;
      Sorcery.loop.for(
        function(){ i=0; },
        function(){ return i<cpaths.length; },
        function(){ i++; },
        function(cont) {
          var cpath=cpaths[i];
          
          try {
            Sorcery.require(cpath,function(Controller){
              
              if ((typeof(Controller)!=='undefined')&&(Controller.class_name==='controller'))
                Controller.register(pseudo_router);
              
              return cont();
            });
          } catch (e) {
            return cont();
          }
          
        },
        function() {
          
          //console.log('ASD',routemasks);

          var string=Fs.read_resource('base_htaccess');

          //var string='RewriteEngine on\nDirectorySlash off\n';
          for (var i in routemasks)
            string+='RewriteRule ^'+i+'$ /'+routemasks[i]+' [QSA,L]\n';

          Fs.write_file('./.htaccess',string);
          
        }
      );
      
    },

    debug : function(text) {
      Cli.print(text+'\n');
    },
  
    maintain : function() {
      
      var bases=['','compiled/'];
      
      var paths=[];
      
      for (var i in bases) {
        var base=bases[i];
        paths.push(base+'app');
        paths.push(base+'packages');

        /*for (var ii in Sorcery.packages) {
          paths.push(base+'/packages/'+Sorcery.packages[ii]);
        }*/
      }
      
      var todos=[];
      
      var todotimeout=false;
      var todofunc=function(){
        todotimeout=false;
        
        for (var i in todos) {
          var todo=todos[i];
          
          if (todo==='writecache') {
            var filedata='Sorcery.set_packages('+JSON.stringify(Sorcery.packages)+');Sorcery.set_path_cache('+JSON.stringify(Sorcery.path_cache)+');Sorcery.set_resource_cache('+JSON.stringify(Sorcery.resource_cache)+');';
            Fs.write_file('./cache.js',filedata);
          }
          else if (todo==='writehtaccess') {
            Fs.write_file('./.htaccess',htaccess);
          }
          
        }
        
        todos=[];
      };
      
      var addtodo=function(todo) {
        if (todos.indexOf(todo)<0)
          todos.push(todo);
        if (todotimeout!==false)
          clearTimeout(todotimeout);
        todotimeout=setTimeout(todofunc,100);
      };

      var htaccess='';
      var htaccess_cache={};
      var updhtaccess=function() {
        htaccess=Fs.read_resource('base_htaccess');
        for (var i in htaccess_cache) {
          var v=htaccess_cache[i];
          for (var ii in v) {
            var vv=v[ii];
            htaccess+=vv;
          }
        }
        addtodo('writehtaccess');
      };
      
      var actions={
        '':[
          {
            action:'package'
          }
        ],
        '.js':[
          {
            action:'path',
            key:'js'
          },
       // 'htaccess'
        ]
      };
      
      for (var i in Sorcery.engines) {
        var engine=Sorcery.engines[i];
        for (var ii in engine) {
          var extension=engine[ii];
          if (typeof(actions[extension])==='undefined')
            actions[extension]=[];
          actions[extension].push({
            action:'path',
            key:i+'/'+ii
          });
        }
      }
      
      for (var i in Sorcery.compilers) {
        var compiler=Sorcery.compilers[i];
        var extension=compiler.source;
        if (typeof(actions[extension])==='undefined')
          actions[extension]=[];
        actions[extension].push({
          action:'compile',
          compiler:i,
          options:compiler
        });
      }
      
      var cache={
        routes:[]
      };
      
      var me=this;
      
      var actionfuncs={
        
        package : function(event,path) {
          
          if (['addDir','unlinkDir'].indexOf(event)<0)
            return;
          
          var action=null;
          
          var pkg;
          
          var packagesstr='packages/';
          var packagesstrl=packagesstr.length;
          if (path.substring(0,packagesstrl)===packagesstr) {
            path=path.substring(packagesstrl);
            var pos=path.indexOf('/');
            if (pos>=0) {
              pkg=path.substring(0,pos);
              path=path.substring(pos+1);
              if (path.indexOf('/')<0) {
                pkg+='/'+path;
                var iof=Sorcery.packages.indexOf(pkg);
                if (event==='addDir') {
                  if (iof<0) {
                    Sorcery.packages.push(pkg);
                    action='+PKG';
                  }
                }
                else if (event==='unlinkDir') {
                  if (iof>=0) {
                    Sorcery.packages.splice(iof,1);
                    action='-PKG';
                  }
                }
              }
            }
            
          }
          
          if (action!==null) {
            me.debug('['+action+'] '+pkg);
            addtodo('writecache');
          }
          
        },
        
        path : function(event,path,options) {
          
          if (['add','unlink'].indexOf(event)<0)
            return;
          
          var origpath=path;
          
          if (!options.resource) {
            var lio=path.lastIndexOf(options.extension);
            path=path.substring(0,lio);
          }
          
          var cache={};
          if (options.resource) {
            var resourcestr='/resource/';
            var pos=path.indexOf(resourcestr);
            if (pos>=0) {
              pos+=resourcestr.length;
              cache[path.substring(pos)]='./'+path.substring(0,pos);
            }
          }
          else {
            
            var pth='./';
            
            var compiledstr='compiled/';
            var compiledstrl=compiledstr.length;
            if (path.substring(0,compiledstrl)===compiledstr) {
              path=path.substring(compiledstrl);
              pth+=compiledstr;
            }
            
            cache[path]=pth;
            var appstr='app/';
            var appstrl=appstr.length;
            if (path.substring(0,appstrl)===appstr) {
              path=path.substring(appstrl);
              pth=pth+appstr;
              cache[path]=pth;
            }
            else {
              var packagesstr='packages/';
              var packagesstrl=packagesstr.length;
              if (path.substring(0,packagesstrl)===packagesstr) {
                path=path.substring(packagesstrl);
                pth=pth+packagesstr;
                cache[path]=pth;
                var pos=path.indexOf('/');
                if (pos>=0) {
                  pth=pth+path.substring(0,pos+1);
                  path=path.substring(pos+1);
                  pos=path.indexOf('/');
                  if (pos>=0) {
                    pth=pth+path.substring(0,pos+1);
                    path=path.substring(pos+1);
                    cache[path]=pth;
                  }
                }
              }
            }
          }

          var source;
          if (options.resource)
            source=Sorcery.resource_cache;
          else
            source=Sorcery.path_cache[options.key];
          
          var compiledstr='compiled/';
          var compiledstrl=compiledstr.length;
          
          var action=null;
          
          for (var i in cache) {
            var v=cache[i];
            var chk=source[i];
            if (typeof(chk)==='undefined') {
              source[i]=[];
              chk=source[i];
            }
            var iof=chk.indexOf(v);
            if (event==='add') {
              if (iof<0) {
                action='+';
                chk.push(v);
              }
            }
            else if (event==='unlink') {
              if (iof>=0) {
                action='-';
                source[i].splice(iof,1);
              }
            }
          }
          
          if (action!==null) {
            me.debug('['+action+'] '+origpath);
            addtodo('writecache');
          }
          
        },
        
        htaccess : function(event,path) {
          
          if (['add','unlink','change'].indexOf(event)<0)
            return;
          
          if (event==='unlink') {
            var htcache=htaccess_cache[path];
            if (typeof(htcache)!=='undefined') {
              for (var i in htcache)
                me.debug('[-URL] /'+i);
              delete htaccess_cache[path];
              updhtaccess();
            }
          }
          else {
          
            try {
              Sorcery.unrequire('./'+path);
              Sorcery.require('./'+path,function(Module){
                if (Module.parent_class.class_name==='controller') {

                  var htmlpath='sorcery.html';

                  var routemasks={};

                  var pseudo_router={

                    route : function(data) {

                      var pattern=data.pattern;
                      if (typeof(pattern)!=='string')
                        return;
                      var pos;
                      while ((pos=pattern.indexOf(':'))>=0) {
                        var subpattern=pattern.substring(pos);
                        var pos2=subpattern.indexOf('/');
                        if (pos2>=0)
                          subpattern=subpattern.substring(0,pos2);
                        pattern=pattern.replace(subpattern,'([^/]+)');
                      }
                      var type=data.type;
                      if (typeof(type)==='undefined')
                        type='controller';

                      var target;
                      if (type==='controller')
                        target=htmlpath;
                      else if (type==='resource') {
                        var rpath=data.resource;
                        if (typeof(rpath)==='undefined')
                          rpath=data.pattern;

                        var resolve=Sorcery.resolve_resource(rpath);
                        if (resolve!==null) {
                          target=resolve;
                        }
                        else
                          target=null;
                      }
                      else
                        target=null;

                      if (target!==null)
                        routemasks[pattern]=target;
                    }

                  };

                  Module.register(pseudo_router);

                  var rewrites={};
                  for (var i in routemasks)
                    rewrites[i]='RewriteRule ^'+i+'$ /'+routemasks[i]+' [QSA,L]\n';

                  if (typeof(htaccess_cache[path])==='undefined')
                    htaccess_cache[path]={};

                  var htcache=htaccess_cache[path];

                  for (var i in htcache) {
                    var v=htcache[i];
                    var vv=rewrites[i];
                    var action=null;
                    if (typeof(vv)==='undefined') {
                      action='-';
                      delete htcache[i];
                    }
                    if (action!==null) {
                      me.debug('['+action+'URL] /'+i);
                      updhtaccess();
                    }
                  }

                  for (var i in rewrites) {
                    var v=rewrites[i];
                    var vv=htcache[i];
                    var action=null;
                    if (typeof(vv)==='undefined') {
                      action='+';
                      htcache[i]=v;
                    }
                    else if (vv!==v) {
                      action='~';
                      htcache[i]=v;
                    }
                    if (action!==null) {
                      me.debug('['+action+'URL] /'+i);
                      updhtaccess();
                    }
                  }

                }
              });
            } catch (e) {
              return false;
            }
          }
          
        },
        
        compile : function(event,path,options) {
          
          if (['add','change','unlink'].indexOf(event)<0)
            return;
          
          var dpath='compiled/'+path.substring(0,path.length-options.extension.length)+options.options.dest;
          
          if (event==='unlink') {

            Fs.remove_file(dpath);
            var spos=dpath.lastIndexOf('/');
            if (spos>=0) {
              var fdir=dpath.substring(0,spos);
              var files=Fs.list_directory(fdir);
              if (!files.length)
                Fs.remove_directory(fdir);
            }

          }
          else {
            
            var m1=Fs.file_info(path,'mtime');
            var m2;
            if (Fs.file_exists(dpath))
              m2=Fs.file_info(dpath,'mtime');
            else m2='';

            if (m1>m2) {
            
              Sorcery.require([
                'service/compiler/'+options.compiler
              ],function(Compiler){
                var src=Fs.read_file('./'+path);
                Compiler.compile(src,function(dst){
                  var exists=Fs.file_exists(dpath);
                  Fs.write_file(dpath,dst);
                  if (exists)
                    me.debug('[~] '+dpath);
                });
              });
              
            }
            
          }
          
          
        }
        
      };
      
      var onfunc=function(event,path) {

        var pos=path.indexOf('/resource/');
        if (pos>=0) {
          var prepath=path.substring(0,pos);
          var isresource=prepath==='app';
          if (!isresource) {
            var packagesstr='packages/';
            var packagesstrl=packagesstr.length;
            if (prepath.substring(0,packagesstrl)===packagesstr) {
              prepath=prepath.substring(packagesstrl);
              pos=prepath.indexOf('/');
              if (pos>=0) {
                prepath=prepath.substring(pos+1);
                if (prepath.indexOf('/')<0)
                  isresource=true;
              }
            }
          }
          if (isresource) {
            actionfuncs.path(event,path,{
              resource:true
            });
            return;
          }
        }

        var isdir=event==='addDir'||event==='unlinkDir';

        for (var extension in actions) {
          
          if ((!extension)&&(!isdir))
            continue;
          if (extension&&isdir)
            continue;
          
          if (path.substring(path.length-extension.length)===extension) {
            
            var a=actions[extension];
            
            for (var i in a) {
              var action=a[i];
              var actionname='';
              var options={};
              if (typeof(action)==='string')
                actionname=action;
              else {
                for (var ii in action) {
                  var vv=action[ii];
                  if (ii==='action')
                    actionname=vv;
                  else
                    options[ii]=vv;
                }
              }
              options['extension']=extension;
              if (actionfuncs[actionname](event,path,options)===false)
                break;
              
            }
            
          }
        }

      };
      
      for (var i in paths)
        Fs.watch_directory(paths[i],{ignored: /[\/\\]\./}).on('all',onfunc);

      Cli.print('[*] maintainer initialized\n');

    }
    
  });

});

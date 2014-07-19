Sorcery.require([
  'service/router',
  'service/html',
  'app/controller/*',
],function(Router,Html){
  
  Html.global.set_title('Ready!');
  Html.global.add_css(Sorcery.resolve_file('global/css/normalize.css'));
  Html.global.add_css(Sorcery.resolve_file('global/css/main.css'));
  
  Router.initialize([].splice.call(arguments,2));
  
});

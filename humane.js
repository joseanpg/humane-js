/**
 * HumaneJS
 * Humanized Messages for Notifications
 * @example
 *  humane('hello world');
 */
;(function(win,doc){

    var eventOn, eventOff;
    if (win.addEventListener) {
      eventOn  = function(type,fn){win.addEventListener(type,fn,false);
      eventOff = function(type,fn){win.removeEventListener(type,fn,false);
    }
    else {
      eventOn  = function(type,fn){win.attachEvent('on'+type,fn)};
      eventOff = function(type,fn){win.detachEvent('on'+type,fn)};
    }

    animationInProgress = false,
    transitionSupported = false,
    humaneEl = null,
    timeout = 2000,
    useFilter = /msie [678]/i.test(navigator.userAgent), // ua sniff for filter support
    isSetup = false,
    queue = [];

    eventOn('load',function(){
      var prefixes = ['MozT','WebkitT','OT','msT','KhtmlT','t'];
      var style = doc.body.style; 
      for(var i = 0, prefix; prefix = prefixes[i]; i++){
        if(prefix+'ransition' in style) {
           transitionSupported = true;
           break;
        }
      }
      setup();
    });

   function setup() {
     humaneEl = doc.createElement('div');
     humaneEl.id = 'humane';
     humaneEl.className = 'humane';
     doc.body.appendChild(humaneEl);
     if(!transitionSupported && useFilter) humaneEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = 0; // reset value so hover states work
     isSetup = true;
     setupEvents();
     run();
   }

   function setupEvents() {
     tearDownEvents(); // ensure we have no events already
     eventOn('mousemove',remove);
     eventOn('click',remove);
     eventOn('keypress',remove);
   }


   function run(){
     if(!queue.length || animationInProgress) return;
     humaneEl.innerHTML = queue.pop();
     if (transitionSupported) animate(1);
     else {
       jsAnimateOpacity(1);
       if(useFilter) remove();
     }
   }


    // if CSS Transitions not supported, fallback to JS Animation
    function jsAnimateOpacity(level,callback){
      if(animationInProgress) return;

      animationInProgress = true;
      var opacity = useFilter ? 
                    humaneEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity :
                    (humaneEl.style.opacity * 100)|0;
      level = (level *= 100)|0; // avoid floating point issues
      var isLess = opacity > level;

      if(level == 100) {
         humaneEl.style.visibility = "visible";
      }

      var interval = setInterval(function(){
         if(opacity == level) {
           clearInterval(interval);
           animationInProgress = false;
           if(level == 0) humaneEl.style.visibility = "hidden";
           run();
         }
         opacity += isLess ? -10 : 10;
         if(useFilter) humaneEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity;
         else humaneEl.style.opacity = opacity / 100;
      },500 / 20);
    }

    function animate(level){
        if(animationInProgress) return;

        animationInProgress = true;
        humaneEl.className = level ? "humane humane-show" : "humane";
        setTimeout(function(){
            animationInProgress = false;
            run();
        },500);
    }

    function tearDownEvents() {
       eventOff('mousemove',remove);
       eventOff('click',remove);
       eventOff('keypress',remove);
    }

    function remove() {
       tearDownEvents();
       if(timeout){
          clearTimeout(timeout);
          timeout = null;
       }
       timeout = setTimeout(function(){
            transitionSupported ? animate(0) : jsAnimateOpacity(0)
       },timeout);
    }

    /////////////////////////// Export //////////////////////////////////////

    function notify(message) {
      queue.push(message);
      if(isSetup === false) return; // if not setup, don't try to notify yet
      setupEvents();
      run();
    };

    win.humane = notify;
}(window,document));

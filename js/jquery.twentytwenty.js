(function($){

  $.fn.twentytwenty = function(options) {
    // 옵션 병합
    options = $.extend({
      default_offset_pct: 0.5,
      orientation: 'horizontal',
      before_label: 'Before',
      after_label: 'After',
      no_overlay: false,
      move_slider_on_hover: false,
      move_with_handle_only: true,
      click_to_move: false
    }, options);

    return this.each(function() {
      var $ct     = $(this);
      var beforeImg = $ct.find("img:first");
      var afterImg  = $ct.find("img:last");
      var loadCount = 0;

      // 두 이미지가 모두 load 되었을 때만 초기화할 함수
      function tryInit() {
        if (++loadCount !== 2) return;

        var sliderPct = options.default_offset_pct;
        var sliderOrientation = options.orientation;
        var beforeDirection = (sliderOrientation === 'vertical') ? 'down' : 'left';
        var afterDirection  = (sliderOrientation === 'vertical') ? 'up'   : 'right';

        // ==== 기존 초기화 로직 시작 ====
        $ct.wrap("<div class='twentytwenty-wrapper twentytwenty-" + sliderOrientation + "'></div>");

        if (!options.no_overlay) {
          $ct.append("<div class='twentytwenty-overlay'></div>");
          var overlay = $ct.find(".twentytwenty-overlay");
          overlay.append("<div class='twentytwenty-before-label' data-content='" + options.before_label + "'></div>");
          overlay.append("<div class='twentytwenty-after-label'  data-content='" + options.after_label  + "'></div>");
        }

        $ct.append("<div class='twentytwenty-handle'></div>");
        var slider = $ct.find(".twentytwenty-handle");
        slider.append("<span class='twentytwenty-" + beforeDirection + "-arrow'></span>");
        slider.append("<span class='twentytwenty-" + afterDirection  + "-arrow'></span>");

        $ct.addClass("twentytwenty-container");
        beforeImg.addClass("twentytwenty-before");
        afterImg.addClass("twentytwenty-after");

        // helper 함수들
        function calcOffset(pct) {
          var w = beforeImg.width(), h = beforeImg.height();
          return { w: w+"px", h: h+"px", cw: (pct*w)+"px", ch: (pct*h)+"px" };
        }
        function adjustContainer(offset) {
          if (sliderOrientation === 'vertical') {
            beforeImg.css("clip", "rect(0,"+offset.w+","+offset.ch+",0)");
            afterImg.css("clip", "rect("+offset.ch+","+offset.w+","+offset.h+",0)");
          } else {
            beforeImg.css("clip", "rect(0,"+offset.cw+","+offset.h+",0)");
            afterImg.css("clip", "rect(0,"+offset.w+","+offset.h+","+offset.cw+")");
          }
          $ct.css("height", offset.h);
        }
        function adjustSlider(pct) {
          var offset = calcOffset(pct);
          var prop   = (sliderOrientation==="vertical") ? "top" : "left";
          slider.css(prop, (sliderOrientation==="vertical") ? offset.ch : offset.cw);
          adjustContainer(offset);
        }
        function minMax(num,min,max){ return Math.max(min,Math.min(max,num)); }
        var offsetX=0, offsetY=0, imgW=0, imgH=0;
        function getPct(x,y){
          var pct = (sliderOrientation==='vertical')
            ? (y-offsetY)/imgH
            : (x-offsetX)/imgW;
          return minMax(pct,0,1);
        }

        // 이벤트 바인딩
        $(window).on("resize.twentytwenty", function(){ adjustSlider(sliderPct); });

        function onMoveStart(e){
          $ct.addClass("active");
          offsetX = $ct.offset().left;
          offsetY = $ct.offset().top;
          imgW    = beforeImg.width();
          imgH    = beforeImg.height();
        }
        function onMove(e){
          if ($ct.hasClass("active")) {
            sliderPct = getPct(e.pageX, e.pageY);
            adjustSlider(sliderPct);
          }
        }
        function onMoveEnd(){
          $ct.removeClass("active");
        }

        var moveTarget = options.move_with_handle_only ? slider : $ct;
        moveTarget.on("movestart", onMoveStart);
        moveTarget.on("move",      onMove);
        moveTarget.on("moveend",   onMoveEnd);

        if (options.move_slider_on_hover) {
          $ct.on("mouseenter", onMoveStart);
          $ct.on("mousemove",  onMove);
          $ct.on("mouseleave", onMoveEnd);
        }

        slider.on("touchmove", e=>e.preventDefault());
        $ct.find("img").on("mousedown", e=>e.preventDefault());

        if (options.click_to_move) {
          $ct.on("click", function(e){
            onMoveStart(e);
            onMove(e);
            onMoveEnd();
          });
        }

        // 초기 위치 세팅
        $(window).trigger("resize.twentytwenty");
        // ==== 기존 초기화 로직 끝 ====
      }

      // 로드된 경우 즉시, 아니면 load 이벤트로
      if (beforeImg.prop('complete')) tryInit();
      else beforeImg.on('load', tryInit);

      if (afterImg.prop('complete'))  tryInit();
      else afterImg.on('load',  tryInit);
    });
  };

})(jQuery);

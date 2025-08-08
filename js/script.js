// --------------------------------------------------
// [1] 기본 이벤트 방지
// --------------------------------------------------
$(document).on('click', 'a[href="#"]', e => e.preventDefault());

$(function() {
  var isMobileView = window.matchMedia('(max-width: 500px)').matches;

  $('.animate').scrolla({
    mobile: true,
    once: isMobileView
  });
});

// --------------------------------------------------
// [2] 실시간 시계 업데이트
// --------------------------------------------------
function updateClock() {
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  hours = hours % 12 || 12;
  clockEl.textContent = `${period} ${String(hours).padStart(2, '0')}:${minutes}`;
}

// --------------------------------------------------
// [3] 홈 이미지 애니메이션
// --------------------------------------------------
function animateHomeImage() {
  const img  = document.querySelector('.fixed-image img');
  const span = document.querySelector('span.Mgleft');
  if (!img) return;

  // ① matchMedia 컨텍스트 생성
  const mm = gsap.matchMedia();

  // ② 겹치지 않는 브레이크포인트 정의
  mm.add({
    desktop      : "(min-width: 1367px)",                      // 1367px 이상
    largeTablet  : "(min-width: 1181px) and (max-width: 1366px)", // 1181px ~ 1366px
    standardTablet: "(min-width: 1025px) and (max-width: 1180px)",// 1025px ~ 1180px
    smallTablet  : "(min-width: 768px) and (max-width: 1024px)",  // **768px ~ 1024px**
    mobile       : "(max-width: 767px)"                          // 767px 이하
  }, (context) => {
    const { desktop, largeTablet, standardTablet, smallTablet } = context.conditions;
    let vars;

    if (desktop) {
      vars = { x: 490, y: 60,  width: 520, height: 520, borderRadius: 40 };
    } else if (largeTablet) {
      vars = { x: 400, y: 50,  width: 360, height: 360, borderRadius: 40 };
    } else if (standardTablet) {
      vars = { x: 350, y: 50,  width: 340, height: 340, borderRadius: 40 };
    } else if (smallTablet) {        // <= 1024px
      vars = { x: 200, y: -100, width: 280, height: 280, borderRadius: 40 };
    } else { // mobile
      vars = { x: -40, y: -20,  width: 110, height: 110, borderRadius: 10 };
    }

    // ③ img 애니메이션
    gsap.to(img, {
      duration: 2.0,
      ...vars,
      ease: 'power2.out'
    });

    // ④ span 애니메이션
    if (span) {
      gsap.to(span, {
        duration: 1,
        opacity: 0,
        margin: 0,
        ease: 'power1.out',
        delay: 1.5
      });
    }

    // (자동으로 컨텍스트 정리됨)
    return () => {};
  });
}





// --------------------------------------------------
// [4] intro → home 전환 (전부 GSAP 타임라인)
// --------------------------------------------------
function animateIntroToHome() {
  gsap.registerPlugin(ScrollTrigger);

  // 1) Intro 글자 요소와 Home 카피 요소 선택
  const introEls = [
    document.querySelector('.intro .y'),
    document.querySelector('.intro .h'),
    document.querySelector('.intro .pf')
  ].filter(Boolean);

  const homeEls = [
    document.querySelector('.home .y-copy'),
    document.querySelector('.home .h-copy'),
    document.querySelector('.home .pf-copy')
  ].filter(Boolean);

  const introSection = document.querySelector('.intro');
  const homeSection  = document.querySelector('.home');

  // 2) 초기 상태 세팅
  gsap.set(introEls, { clearProps: 'all' });
  gsap.set(homeSection, { autoAlpha: 0 });
  gsap.set(homeEls, { autoAlpha: 0 });

  // 3) Intro → Home 글자 위치 차이 계산 (센터 기준)
  const deltas = introEls.map((el, i) => {
    const homeEl = homeEls[i];
    const from = el.getBoundingClientRect();
    const to   = homeEl.getBoundingClientRect();

    const deltaX = (to.left + to.width  / 2) - (from.left + from.width  / 2);
    const deltaY = (to.top  + to.height / 2) - (from.top  + from.height / 2);

    return { el, deltaX, deltaY };
  });

  // 4) 타임라인 구성
  const tl = gsap.timeline({
    defaults: { duration: 1.2, ease: 'power2.inOut' }
  });

  // 4-1) Intro 글자 이동만 수행 (opacity 변화 없음)
  deltas.forEach(({ el, deltaX, deltaY }) => {
    tl.to(el, { x: deltaX, y: deltaY }, 0);
  });

  // [삭제] ▶ Intro 개별 글자 페이드아웃
  // tl.to(introEls, {
  //   autoAlpha: 0,
  //   duration: 0.6,
  //   ease:     'power1.out'
  // }, 1.2);

  // 4-2) Intro 섹션 전체를 페이드아웃 (1.4~2.0초)
  tl.to(introSection, { 
    autoAlpha: 0,
    duration: 1.2,
    ease:     'power1.out'
  }, 1.5);

  // 4-3) Home 섹션 자체를 페이드인 (Intro가 거의 사라지는 시점에 시작, 1.4~2.2초 겹침)
  tl.to(homeSection, {
    autoAlpha: 1,
    duration: 0.8,
    ease:     'power1.out'
  }, 1);

  // 4-4) Home 카피 요소는 약간 딜레이를 준 뒤 한꺼번에 페이드인 (1.6~2.4초)
  tl.to(homeEls, {
    autoAlpha: 1,
    duration: 0.8,
    ease:     'power1.out',
    stagger:  0.1
  }, 2.0);

  // 5) 완료 콜백
  tl.add(() => {
    gsap.set(introSection, { pointerEvents: 'none' });
    document.body.style.overflow = 'auto';
    ScrollTrigger.refresh();
    animateHomeImage();
    startScrollTriggerAnimation();
  });
}










// --------------------------------------------------
// [5] ScrollTrigger 애니메이션 시작
// --------------------------------------------------
function startScrollTriggerAnimation() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.timeline({
    scrollTrigger: {
      trigger:    ".home",
      start:      "top top",
      end:        "+=50%",
      scrub:      true,
      pin:        true,
      pinSpacing: true,
      markers:    false,
      onLeave: () => {}
    }
  })
  .to(".home-titleBox", { opacity: 0, y: -50, ease: "power1.out" })
  .to(".scroll-textBox", { opacity: 1, y: 0, ease: "power1.out", pointerEvents: "auto" }, "<");
}

// --------------------------------------------------
// [6] 초기화
// --------------------------------------------------
function init() {
  updateClock();
  setInterval(updateClock, 1000);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';
  setTimeout(animateIntroToHome, 500);
});




// circle
// circle 아래 줄 스크롤 애니메이션
window.addEventListener('load', () => {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.work .bottomBox .container').forEach(container => {
    const circle = container.querySelector('.circle');
    const line   = container.querySelector('.line');
    if (!circle || !line) return;

    const maxH = container.clientHeight - (circle.clientHeight / 2);

    gsap.to(line, {
      height: maxH,
      ease:   'none',
      scrollTrigger: {
        trigger: container,
        start:   'top top',    // ← container.top이 뷰포트.top에 닿을 때 시작
        end:     'bottom top', // ← container.bottom이 뷰포트.top에 닿을 때 끝
        scrub:   1,            
        // markers: true,         // 디버그용
      }
    });
  });
});



// --------------------------------------------------
// [8] Hobbies 섹션: 스크롤 진행도에 따라 점진적 퍼짐 (onUpdate 방식)
// --------------------------------------------------
window.addEventListener('load', () => {
  gsap.registerPlugin(ScrollTrigger);

  // 1) 아이템, CSS 변수 위치 읽기
  const items = gsap.utils.toArray('.hobbies-item');
  const root  = getComputedStyle(document.documentElement);
  const targets = items.map((_, i) => ({
    top:  parseFloat(root.getPropertyValue(`--hobby-${i+1}-top`)),
    left: parseFloat(root.getPropertyValue(`--hobby-${i+1}-left`))
  }));

  // 2) 초기 중앙 세팅
  items.forEach(item => {
    gsap.set(item, { top:'50%', left:'50%', xPercent: -50, yPercent: -50 });
  });

  // 3) ScrollTrigger 하나로 onUpdate 처리
  ScrollTrigger.create({
    trigger:   '.hobbies',
    start:     'top 30%',
    end:       'bottom 70%',
    scrub:     true,
    markers:   false,  // 디버그 뒤 false
    onUpdate: self => {
      // 0 → 1 사이 진행도
      const p = self.progress;
      items.forEach((item, i) => {
        // 중앙(50) 과 목표(targets[i].top) 사이 보간
        const newTop  = 50  + (targets[i].top  - 50) * p;
        const newLeft = 50  + (targets[i].left - 50) * p;
        gsap.set(item, {
          top:      `${newTop}%`,
          left:     `${newLeft}%`,
          xPercent: 0,
          yPercent: 0
        });
      });
    }
  });
});

// swiper
var swiper = new Swiper(".mySwiper", {
  // ↓ ↓ ↓ 초기화를 지연시키기
  init: false,

  // ↓ ↓ ↓ lazy load 설정
  preloadImages: false,
  lazy: {
    loadPrevNext: true,     // 현재 슬라이드와 주변 슬라이드만 로드
    loadPrevNextAmount: 1,
  },

  // ↓ ↓ ↓ 퍼포먼스 최적화 옵션
  watchSlidesProgress: true,
  watchSlidesVisibility: true,

  // pagination / navigation 은 그대로
  centeredSlides: true,
  pagination: {
    el: ".swiper-pagination",
    type: "fraction",
    formatFractionCurrent: number => ("0" + number).slice(-2),
    formatFractionTotal:   number => ("0" + number).slice(-2),
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  // breakpoint 설정 그대로
  breakpoints: {
    320:  { slidesPerView: 1, spaceBetween: 10, centeredSlides: false },
    640:  { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
    1024: { slidesPerView: 3, spaceBetween: 40, centeredSlides: true  },
    1440: { slidesPerView: 4, spaceBetween: 75, centeredSlides: true  },
  },

  // init 콜백: 초기화 후 .swiper-initialized 클래스 붙이기
  on: {
    init: function() {
      this.el.classList.add("swiper-initialized");
    }
  }
});

// 3) DOM & 리소스 로드 완료 시점에 Swiper 초기화
window.addEventListener("load", function() {
  swiper.init();
});


// containerBox 360도 회전
document.querySelectorAll('.containerBox').forEach(box => {
  const maxAngle = 5;
  let rafId = null;

  const update = (clientX, clientY) => {
    const rect = box.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const normX = (x / rect.width)  * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;
    const rotateY = normX * maxAngle;
    const rotateX = -normY * maxAngle;

    box.style.transform =
      `perspective(360px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    
    rafId = null;
  };

  box.addEventListener('mousemove', e => {
    // 이전에 예약된 콜백이 있으면 취소
    if (rafId) cancelAnimationFrame(rafId);

    // 한 프레임 뒤에 update 실행
    rafId = requestAnimationFrame(() => update(e.clientX, e.clientY));
  });

  box.addEventListener('mouseleave', () => {
    // 남아 있는 콜백 취소
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    // 회전 초기화
    box.style.transform = 'perspective(360px) rotateX(0deg) rotateY(0deg)';
  });
});



// var x;
// var $cards = $(".card");
// var $style = $(".hover");

// $cards
//   .on("mousemove touchmove", function(e) { 
//     // normalise touch/mouse
//     var pos = [e.offsetX,e.offsetY];
//     e.preventDefault();
//     if ( e.type === "touchmove" ) {
//       pos = [ e.touches[0].clientX, e.touches[0].clientY ];
//     }
//     var $card = $(this);
//     // math for mouse position
//     var l = pos[0];
//     var t = pos[1];
//     var h = $card.height();
//     var w = $card.width();
//     var px = Math.abs(Math.floor(100 / w * l)-100);
//     var py = Math.abs(Math.floor(100 / h * t)-100);
//     var pa = (50-px)+(50-py);
//     // math for gradient / background positions
//     var lp = (50+(px - 50)/1.5);
//     var tp = (50+(py - 50)/1.5);
//     var px_spark = (50+(px - 50)/7);
//     var py_spark = (50+(py - 50)/7);
//     var p_opc = 20+(Math.abs(pa)*1.5);
//     var ty = ((tp - 50)/2) * -1;
//     var tx = ((lp - 50)/1.5) * .5;
//     // css to apply for active card
//     var grad_pos = `background-position: ${lp}% ${tp}%;`
//     var sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`
//     var opc = `opacity: ${p_opc/100};`
//     var tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`
//     // need to use a <style> tag for psuedo elements
//     var style = `
//       .card:hover:before { ${grad_pos} }  /* gradient */
//       .card:hover:after { ${sprk_pos} ${opc} }   /* sparkles */ 
//     `
//     // set / apply css class and style
//     $cards.removeClass("active");
//     $card.removeClass("animated");
//     $card.attr( "style", tf );
//     $style.html(style);
//     if ( e.type === "touchmove" ) {
//       return false; 
//     }
//     clearTimeout(x);
//   }).on("mouseout touchend touchcancel", function() {
//     // remove css, apply custom animation on end
//     var $card = $(this);
//     $style.html("");
//     $card.removeAttr("style");
//     x = setTimeout(function() {
//       $card.addClass("animated");
//     },1000);
//   });


// 글자 애니메이션

$(function(){
  // ----------------------------------------------------------
  // 1) 먼저, SVG path들을 모두 찾아서 “length” 정보를 미리 구해두고 배열에 저장합니다.
  //    이렇게 하면 나갈 때(reset)에도 같은 길이를 쉽게 참조할 수 있습니다.
  // ----------------------------------------------------------
  const svgPaths = []; // { el: SVGPathElement, length: number } 객체를 담을 배열
  for (let i = 1; i <= 10; i++) {
    const selector = '#svgAni' + String(i).padStart(2, '0');
    const $el = $(selector);
    if ($el.length) {
      const pathEl = $el[0];
      const totalLen = pathEl.getTotalLength();
      // SVG path 초기 상태를 “전체 길이만큼 dashoffset”으로 세팅해 두기
      pathEl.style.strokeDasharray = totalLen;
      pathEl.style.strokeDashoffset = totalLen;
      svgPaths.push({ el: pathEl, length: totalLen });
    }
  }

  // ----------------------------------------------------------
  // 2) “애니메이션 실행 함수”
  //    : 들어올 때마다 호출되며, 각 path에 대해 순차적으로 dashoffset을 0까지 애니메이션합니다.
  // ----------------------------------------------------------
  function startAnimation() {
    const speedFactor = 0.8;
    let totalDelay = 0.5;

    // paths 배열을 사용해서, 각 path마다 setTimeout으로 순차 애니메이션 트리거
    svgPaths.forEach(({ el, length }) => {
      // 애니메이션 시작 직전에 dashoffset을 다시 전체 길이로 초기화(안 하면 이전 애니메이션이 일부 남아있을 수 있음)
      el.style.strokeDashoffset = length;

      setTimeout(() => {
        animateStroke(el, length, 2000 * (length / (speedFactor * 2000)));
      }, totalDelay);

      // 다음 path 애니메이션을 위한 누적 지연 시간 계산
      totalDelay += 100 * (length / (speedFactor * 1000)) + 100;
    });

    // 실제 애니메이션 로직 (requestAnimationFrame 기반 easeOut)
    function animateStroke(path, length, duration) {
      let startTime = null;

      function easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOut(progress);
        path.style.strokeDashoffset = length * (1 - eased);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }
  }

  // ----------------------------------------------------------
  // 3) “리셋 함수”
  //    : 뷰포트에서 나갈 때 호출되어, 모든 path의 dashoffset을 다시 전체 길이로 되돌려 놓음.
  // ----------------------------------------------------------
  function resetAnimation() {
    svgPaths.forEach(({ el, length }) => {
      el.style.strokeDashoffset = length;
    });
  }

  // ----------------------------------------------------------
  // 4) IntersectionObserver 콜백
  //    - entry.isIntersecting === true → 애니메이션 시작
  //    - entry.isIntersecting === false → 애니메이션 리셋
  //    - unobserve 하지 않고, 계속 관찰을 유지
  // ----------------------------------------------------------
  const observerOptions = {
    root: null,       // 브라우저 뷰포트
    threshold: 0.85   // 요소가 10% 보이기 시작하면 콜백 실행
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 뷰포트에 걸리면 애니메이션 실행
        startAnimation();
      } else {
        // 뷰포트에서 벗어나면 바로 리셋
        resetAnimation();
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // ----------------------------------------------------------
  // 5) 실제 관찰 대상(Observer.observe)에 연결
  //    - section.contact 내부의 #svgWrapper 요소를 지정
  // ----------------------------------------------------------
  const targetEl = document.querySelector('section.contact #svgWrapper');
  if (targetEl) {
    observer.observe(targetEl);
  }
});









// 네비바


document.addEventListener('DOMContentLoaded', function() {
  const nav       = document.querySelector('.main-nav');
  const menuItems = document.querySelectorAll('.main-nav ul li');

  // 1) 메뉴 클릭 시 .active 토글
  menuItems.forEach(li => {
    li.addEventListener('click', function(e) {
      menuItems.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      e.stopPropagation();
    });
  });

  // 2) 네비 바 외부 클릭 시 .active 모두 제거
  // document.addEventListener('click', function(e) {
  //   if (!nav.contains(e.target)) {
  //     menuItems.forEach(item => item.classList.remove('active'));
  //   }
  // });

  // 3) Intro 섹션 관찰 → Intro 보이면 숨김, 벗어나면 보이기
  const introSection = document.querySelector('#intro');
  if (introSection && nav) {
    const introObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nav.classList.remove('visible');
        } else {
          nav.classList.add('visible');
        }
      });
    }, { root: null, threshold: 0 });
    introObserver.observe(introSection);
  }

  // 4) 각 섹션 관찰 → 화면 중앙에 진입할 때만 해당 메뉴 활성화
  const sections = document.querySelectorAll('section[id]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        // Intro는 제외
        if (id === 'intro') return;

        // 모든 .active 제거
        menuItems.forEach(item => item.classList.remove('active'));

        // 해당 id에 맞는 <a>를 찾아서, 부모 <li>에 .active
        const selector = `.main-nav ul li a[href="#${id}"]`;
        const linkEl = document.querySelector(selector);
        if (linkEl) {
          linkEl.parentElement.classList.add('active');
        }
      }
    });
  }, {
    root: null,
    threshold: 0,
    rootMargin: '-50% 0px -50% 0px'
  });

  sections.forEach(sec => {
    if (sec.id !== 'intro') {
      sectionObserver.observe(sec);
    }
  });
});













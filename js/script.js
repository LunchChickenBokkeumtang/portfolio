// --------------------------------------------------
// [1] 기본 이벤트 방지
// --------------------------------------------------
$(document).on('click', 'a[href="#"]', e => e.preventDefault());

$(function() {
	$('.animate').scrolla({
		mobile: true, //모바일버전시 활성화
		once: false //스크롤시 딱 한번만 하고싶을땐 true
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

  // ① 이미지 애니메이션
  gsap.to(img, {
    duration: 1.8,
    x: 490,
    y: 60,
    width: 520,
    height: 520,
    ease: 'power2.out',
    borderRadius: 40
  });

  // ② span 애니메이션 (delay를 줘서 img 애니메이션 중간에 실행)
  if (span) {
    gsap.to(span, {
      duration: 0.8,
      opacity: 0,
      margin: 0,
      ease: 'power1.out',
      delay: 1 // 이미지 시작 후 1초 뒤 바로 작동 (이미지 끝나기 0.8초 전에)
    });
  }
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
  }, 1.0);

  // 4-3) Home 섹션 자체를 페이드인 (Intro가 거의 사라지는 시점에 시작, 1.4~2.2초 겹침)
  tl.to(homeSection, {
    autoAlpha: 1,
    duration: 0.8,
    ease:     'power1.out'
  }, 1.0);

  // 4-4) Home 카피 요소는 약간 딜레이를 준 뒤 한꺼번에 페이드인 (1.6~2.4초)
  tl.to(homeEls, {
    autoAlpha: 1,
    duration: 0.8,
    ease:     'power1.out',
    stagger:  0.1
  }, 1.6);

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
      markers:    false
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
  setTimeout(animateIntroToHome, 1000);
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
  slidesPerView: 4,
  spaceBetween: 75,
  centeredSlides: true,
  pagination: {
    el: ".swiper-pagination",
    type: "fraction",
    formatFractionCurrent: function (number) {
      return ('0' + number).slice(-2);
    },
    formatFractionTotal: function (number) {
      return ('0' + number).slice(-2);
    },
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});



// containerBox 360도 회전
document.querySelectorAll('.containerBox').forEach(box => {
  let rafId = null;
  let lastX = 0, lastY = 0;
  const width  = box.clientWidth;
  const height = box.clientHeight;
  const maxAngle = 10;

  box.addEventListener('mousemove', function(e) {
    const rect = box.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    if (!rafId) {
      rafId = requestAnimationFrame(updateTransform);
    }
  });

  box.addEventListener('mouseleave', function() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    box.style.transform = 'perspective(350px) rotateX(0deg) rotateY(0deg)';
  });

  function updateTransform() {
    const normX = (lastX / width) * 2 - 1;
    const normY = (lastY / height) * 2 - 1;
    const rotateY = normX * maxAngle;
    const rotateX = -normY * maxAngle;
    box.style.transform = `perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    rafId = requestAnimationFrame(updateTransform);
  }
});

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
  document.addEventListener('click', function(e) {
    if (!nav.contains(e.target)) {
      menuItems.forEach(item => item.classList.remove('active'));
    }
  });

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













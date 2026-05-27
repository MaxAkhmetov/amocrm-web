// ========== UTM ==========
(function(){
  var p=new URLSearchParams(location.search),keys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'],u={};
  keys.forEach(function(k){if(p.get(k))u[k]=p.get(k)});
  if(Object.keys(u).length)try{localStorage.setItem('_utm',JSON.stringify(u))}catch(e){}
})();
function getUTM(){try{return JSON.parse(localStorage.getItem('_utm')||'{}')}catch(e){return{}}}

// ========== CONFIG (можно переопределить в HTML до загрузки скрипта) ==========
if(typeof WEBHOOK==='undefined')var WEBHOOK='';

// ========== SEND ==========
async function send(data){
  var payload=Object.assign({},data,{region:window.REGION||'',utm:getUTM(),url:location.href,ts:new Date().toISOString()});
  console.log('Заявка:',payload);
  if(!WEBHOOK)return true;
  try{await fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});return true}catch(e){return false}
}
function ymG(g){if(typeof ym!=='undefined')ym(92129012,'reachGoal',g)}
function showToast(){var t=document.getElementById('toast');t.style.display='block';setTimeout(function(){t.style.display='none'},3500)}

// ========== QUIZ ==========
function goQ(s){
  document.querySelectorAll('.qstep').forEach(function(el){el.classList.remove('act')});
  ['dot1','dot2','dot3'].forEach(function(id,i){
    var d=document.getElementById(id);
    d.classList.remove('act','dn');
    if(i+1<s)d.classList.add('dn');
    if(i+1===s)d.classList.add('act');
  });
  document.getElementById('qs'+s).classList.add('act');
  document.getElementById('qptx').textContent='Шаг '+s+' из 3';
}
async function submitQ(){
  var ph=document.getElementById('qphone').value;
  if(!ph||ph.replace(/\D/g,'').length<10){document.getElementById('qphone').style.borderColor='red';document.getElementById('qphone').focus();return}
  var prob=document.querySelector('input[name="prob"]:checked');
  var wt=document.querySelector('input[name="wt"]:checked');
  await send({form:'quiz',name:document.getElementById('qname').value,phone:ph,problem:prob?prob.value:'не указана',win_type:wt?wt.value:'не указан'});
  ymG('quiz_submit');
  document.getElementById('quiz-wrap').querySelector('.quiz-prog').style.display='none';
  document.getElementById('quiz-body').style.display='none';
  document.getElementById('qsuc').classList.add('show');
}

// ========== MODAL ==========
var curSvc='';
function openM(svc){curSvc=svc;document.getElementById('mtit').textContent=svc;document.getElementById('modal-ov').classList.add('open');document.body.style.overflow='hidden'}
function closeM(){document.getElementById('modal-ov').classList.remove('open');document.body.style.overflow=''}
function closeMBg(e){if(e.target===document.getElementById('modal-ov'))closeM()}
async function submitM(){
  var ph=document.getElementById('mphone').value;
  if(!ph||ph.replace(/\D/g,'').length<10){document.getElementById('mphone').style.borderColor='red';document.getElementById('mphone').focus();return}
  await send({form:'modal',service:curSvc,name:document.getElementById('mname').value,phone:ph});
  ymG('modal_submit');closeM();showToast();
  document.getElementById('mname').value='';document.getElementById('mphone').value='';
}

// ========== VIDEO ==========
async function submitVid(){
  var ph=document.getElementById('vphone').value;
  if(!ph||ph.replace(/\D/g,'').length<10){document.getElementById('vphone').style.borderColor='rgba(255,0,0,.5)';document.getElementById('vphone').focus();return}
  await send({form:'video',name:document.getElementById('vname').value,phone:ph});
  ymG('video_submit');
  document.getElementById('vid-form').innerHTML='<div style="color:#5dea8c;font-size:18px;font-weight:700;padding:20px;text-align:center">✅ Заявка принята!<br><small style="font-weight:400;font-size:14px;color:rgba(255,255,255,.7)">Мастер позвонит в течение 15 минут</small></div>';
}

// ========== CONTACT FORM ==========
async function submitCon(){
  var ph=document.getElementById('cphone').value;
  if(!ph||ph.replace(/\D/g,'').length<10){document.getElementById('cphone').style.borderColor='red';document.getElementById('cphone').focus();return}
  await send({form:'contact',name:document.getElementById('cname').value,phone:ph,msg:document.getElementById('cmsg').value});
  ymG('contact_submit');showToast();
  document.getElementById('cname').value='';document.getElementById('cphone').value='';document.getElementById('cmsg').value='';
}

// ========== COOKIE ==========
function acceptCk(){document.getElementById('cbar').classList.add('hid');try{localStorage.setItem('ck','1')}catch(e){}}
(function(){try{if(localStorage.getItem('ck'))document.getElementById('cbar').classList.add('hid')}catch(e){}})();

// ========== MOBILE MENU ==========
document.getElementById('burger').onclick=function(){document.getElementById('mmenu').classList.add('open');document.body.style.overflow='hidden'};
document.getElementById('mmclose').onclick=function(){closeMM()};
function closeMM(){document.getElementById('mmenu').classList.remove('open');document.body.style.overflow=''}

// ========== SCROLL ANIMATIONS ==========
var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){
  if(e.isIntersecting){var el=e.target;requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('vis')})});obs.unobserve(el)}
})},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.fu').forEach(function(el){obs.observe(el)});

// ========== STICKY HEADER ==========
window.addEventListener('scroll',function(){
  document.getElementById('site-hdr').classList.toggle('scr',window.scrollY>60);
},{passive:true});

// ========== PHONE MASK ==========
document.querySelectorAll('input[type="tel"]').forEach(function(inp){
  inp.addEventListener('input',function(){
    var v=this.value.replace(/\D/g,'');
    if(v.length>0){
      if(v[0]==='7'||v[0]==='8')v=v.slice(1);
      var m='+7 (';
      if(v.length>0)m+=v.slice(0,3);
      if(v.length>=4)m+=') '+v.slice(3,6);
      if(v.length>=7)m+='-'+v.slice(6,8);
      if(v.length>=9)m+='-'+v.slice(8,10);
      this.value=m;
    }
    this.style.borderColor='';
  });
});

// ===== WOW EFFECTS =====
(function(){
  if('ontouchstart' in window)return;
  document.body.classList.add('has-cursor');

  // --- Custom cursor ---
  var dot=document.createElement('div');dot.className='cur-dot';
  var ring=document.createElement('div');ring.className='cur-ring';
  document.body.append(dot,ring);
  var mx=window.innerWidth/2,my=window.innerHeight/2,rx=mx,ry=my;
  dot.style.left=mx+'px';dot.style.top=my+'px';
  ring.style.left=mx+'px';ring.style.top=my+'px';
  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
  });
  (function raf(){rx+=(mx-rx)*.11;ry+=(my-ry)*.11;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(raf)})();
  document.querySelectorAll('a,button,.svc-cta,.qlbl,.qwlbl,.brand-tag,.float-btn,.adv-card,.rev-card,.svc-card,.wt-card,.why-stat,.step-n,.hero-card,.hero-stat,.msgr-btn,.ft-soc-btn').forEach(function(el){
    el.addEventListener('mouseenter',function(){document.body.classList.add('cur-hover')});
    el.addEventListener('mouseleave',function(){document.body.classList.remove('cur-hover')});
  });
  document.querySelectorAll('input,textarea').forEach(function(el){
    el.addEventListener('focus',function(){document.body.classList.add('cur-text')});
    el.addEventListener('blur',function(){document.body.classList.remove('cur-text')});
  });
  document.addEventListener('mousedown',function(){dot.style.width='6px';dot.style.height='6px'});
  document.addEventListener('mouseup',function(){dot.style.width='';dot.style.height=''});

  // --- Scroll progress bar ---
  var prog=document.createElement('div');prog.className='scr-prog';document.body.prepend(prog);
  window.addEventListener('scroll',function(){
    var pct=Math.min(window.scrollY/(document.documentElement.scrollHeight-innerHeight)*100,100);
    prog.style.width=pct+'%';
  },{passive:true});

  // --- Hero particles ---
  var heroEl=document.getElementById('hero');
  if(heroEl){
    var cv=document.createElement('canvas');cv.id='hero-canvas';
    heroEl.insertBefore(cv,heroEl.firstChild);
    var cx=cv.getContext('2d'),pts=[];
    function rsz(){cv.width=heroEl.offsetWidth;cv.height=heroEl.offsetHeight}rsz();
    window.addEventListener('resize',rsz,{passive:true});
    for(var i=0;i<58;i++)pts.push({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*2+.5,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,o:Math.random()*.35+.08});
    (function drawPts(){
      cx.clearRect(0,0,cv.width,cv.height);
      for(var i=0;i<pts.length;i++){
        var p=pts[i];
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0)p.x=cv.width;if(p.x>cv.width)p.x=0;
        if(p.y<0)p.y=cv.height;if(p.y>cv.height)p.y=0;
        cx.beginPath();cx.arc(p.x,p.y,p.r,0,Math.PI*2);cx.fillStyle='rgba(255,255,255,'+p.o+')';cx.fill();
        for(var j=i+1;j<pts.length;j++){
          var q=pts[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<105){cx.beginPath();cx.strokeStyle='rgba(255,255,255,'+(0.09*(1-d/105))+')';cx.lineWidth=.7;cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke()}
        }
      }
      requestAnimationFrame(drawPts);
    })();
    heroEl.addEventListener('mousemove',function(e){
      var spark=document.createElement('div');
      var rect=heroEl.getBoundingClientRect();
      spark.style.cssText='position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(255,107,26,.7);left:'+(e.clientX-rect.left-3)+'px;top:'+(e.clientY-rect.top-3)+'px;pointer-events:none;z-index:2;animation:rpl .5s linear forwards;transform:scale(0)';
      heroEl.appendChild(spark);setTimeout(function(){spark.remove()},600);
    });
  }

  // --- 3D tilt on cards ---
  document.querySelectorAll('.adv-card,.rev-card,.svc-card,.wt-card,.hero-stat').forEach(function(card){
    card.addEventListener('mousemove',function(e){
      var r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transition='box-shadow .15s,border-color .15s';
      card.style.transform='translateY(-8px) perspective(700px) rotateY('+(x*13)+'deg) rotateX('+(-y*13)+'deg)';
      card.style.boxShadow='0 20px 50px rgba(13,59,110,.22)';
    });
    card.addEventListener('mouseleave',function(){
      card.style.transition='all .55s cubic-bezier(.23,1,.32,1)';
      card.style.transform='';card.style.boxShadow='';
    });
  });

  // --- Animated counters ---
  var cntObs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      e.target.querySelectorAll('.hero-stat-n').forEach(function(el){
        if(el.dataset.a)return;el.dataset.a='1';
        var orig=el.textContent,num=parseFloat(orig.replace(/[^\d.]/g,'')),suf=orig.replace(/[\d.]/g,'');
        if(!num)return;
        var dur=1800,t0=null;
        (function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/dur,1),ease=1-Math.pow(1-p,3);el.textContent=Math.round(num*ease)+suf;if(p<1)requestAnimationFrame(step);})(performance.now());
      });
      cntObs.unobserve(e.target);
    });
  },{threshold:.5});
  var hs=document.querySelector('.hero-stats');if(hs)cntObs.observe(hs);

  // --- Ripple on buttons ---
  document.querySelectorAll('.btn,.qnxt,.svc-cta,.cookie-ok,.msgr-btn').forEach(function(btn){
    btn.style.position='relative';btn.style.overflow='hidden';
    btn.addEventListener('click',function(e){
      var r=document.createElement('span');r.className='ripple';
      var rect=btn.getBoundingClientRect(),sz=Math.max(rect.width,rect.height)*2.6;
      r.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(e.clientX-rect.left-sz/2)+'px;top:'+(e.clientY-rect.top-sz/2)+'px';
      btn.appendChild(r);setTimeout(function(){r.remove()},800);
    });
  });

  // --- Magnetic CTA ---
  document.querySelectorAll('.hero-cta .btn').forEach(function(btn){
    btn.addEventListener('mousemove',function(e){
      var r=btn.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.2,y=(e.clientY-r.top-r.height/2)*.2;
      btn.style.transform='translateY(-2px) translate('+x+'px,'+y+'px)';
    });
    btn.addEventListener('mouseleave',function(){btn.style.transform=''});
  });
})();

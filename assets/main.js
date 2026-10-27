(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.documentElement.classList.add('js');

  var nav=$('#nav'),b=$('#burger'),m=$('#menu'),top=$('#top'),bar=$('#progress'),hero=$('.hero-img');
  if(b){
    b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)});
    m.addEventListener('click',function(e){if(e.target.tagName==='A'){m.classList.remove('open');b.setAttribute('aria-expanded','false')}});
  }
  $$('.has-mega').forEach(function(h){
    var bt=$('.mg-b',h);
    bt.addEventListener('click',function(e){e.stopPropagation();var o=h.classList.toggle('open');bt.setAttribute('aria-expanded',o);$$('.has-mega').forEach(function(x){if(x!==h){x.classList.remove('open');$('.mg-b',x).setAttribute('aria-expanded','false')}})});
    h.addEventListener('mouseleave',function(){h.classList.remove('open');bt.setAttribute('aria-expanded','false')});
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){var ae=document.activeElement;if(ae&&ae.closest&&ae.closest('.has-mega')){var tg=ae.closest('.has-mega').querySelector('.mg-b');if(tg)tg.focus();ae.blur&&ae.blur()}$$('.has-mega.open').forEach(function(h){h.classList.remove('open');$('.mg-b',h).setAttribute('aria-expanded','false')})}});
  var ticking=false;
  function onScroll(){
    var y=window.scrollY||0,h=document.documentElement.scrollHeight-innerHeight;
    if(nav)nav.classList.toggle('stuck',y>10);
    if(top)top.classList.toggle('show',y>900);
    if(bar&&h>0)bar.style.transform='scaleX('+Math.min(y/h,1)+')';
    if(hero&&!reduce&&y<1200)hero.style.setProperty('--py',(y*.18)+'px');
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();
  if(top)top.addEventListener('click',function(){scrollTo({top:0})});
  var yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();

  /* tilt on hover (fine pointers only) */
  var canTilt=!reduce&&window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
  function addTilt(el){
    if(!canTilt||el._t)return;el._t=1;el.classList.add('tilt');
    el.addEventListener('mousemove',function(e){
      var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.setProperty('--ry',(x*8)+'deg');el.style.setProperty('--rx',(-y*8)+'deg');
    });
    el.addEventListener('mouseleave',function(){el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg')});
  }

  /* reveal on scroll, with variants */
  $$('.badge').forEach(function(el,i){el.classList.add('rv-z')});
  $$('.step').forEach(function(el){el.classList.add('rv-z')});
  $$('.about-g>.media,.q-g>.q-photo,.split>.rv:first-child').forEach(function(el){el.classList.add('rv-l')});
  $$('.about-g>div:last-child,.q-g>div:last-child,.split>.rv:last-child').forEach(function(el){el.classList.add('rv-r')});
  var els=$$('.rv');
  function reveal(el){
    el.classList.add('in');
    if(/\b(card|badge|tile|ben|step|mini)\b/.test(el.className)){
      setTimeout(function(){el.classList.remove('rv','in','rv-z','rv-l','rv-r');addTilt(el)},1500);
    }
  }
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){reveal(e.target);io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(el){io.observe(el)});
    var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in2');io2.unobserve(e.target)}})},{threshold:.25});
    $$('.steps').forEach(function(el){io2.observe(el)});
  }else{
    els.forEach(function(el){el.classList.add('in')});
    $$('.steps').forEach(function(el){el.classList.add('in2')});
  }
  $$('.q-card,.loc').forEach(addTilt);

  /* before / after slider */
  var rng=$('#ba-range'),box=$('#ba'),bi=$('#ba-before'),gr=$('#ba-grime');
  if(rng){
    var setPos=function(v){rng.value=v;box.style.setProperty('--pos',v+'%')};
    rng.addEventListener('input',function(){box.style.setProperty('--pos',rng.value+'%')});
    bi.addEventListener('load',function(){
      var real=/before-lobby\.jpg/.test(bi.currentSrc||bi.src);
      bi.classList.toggle('dirty',!real);gr.style.display=real?'none':'';
    });
    if(!reduce&&'IntersectionObserver' in window){
      var hinted=false;
      new IntersectionObserver(function(es,o){
        if(es[0].isIntersecting&&!hinted){
          hinted=true;o.disconnect();
          var t0=null,dur=2600;
          (function step(t){
            if(!t0)t0=t;var p=Math.min((t-t0)/dur,1);
            setPos(Math.round(50+Math.sin(p*Math.PI*2)*(1-p*.4)*28));
            if(p<1)requestAnimationFrame(step);else setPos(50);
          })(performance.now());
        }
      },{threshold:.5}).observe(box);
    }
  }

  /* privacy dialog */
  var pd=$('#priv');
  if(pd){
    $$('[data-priv]').forEach(function(x){x.addEventListener('click',function(){pd.showModal?pd.showModal():pd.setAttribute('open','')})});
    $('#priv-x').addEventListener('click',function(){pd.close?pd.close():pd.removeAttribute('open')});
  }

  /* quote form
     Set ENDPOINT to a form service URL (Formspree, Basin, a WordPress handler, etc.) to send submissions directly.
     While ENDPOINT is empty the form opens a pre-filled email to the address below, and never shows a false success message. */
  var ENDPOINT='';
  var TO='raman.mann@zemclean.com';
  var f=$('#qf'),msg=$('#msg');
  if(f){
    var show=function(t,c){msg.textContent=t;msg.className='msg '+c};
    var files=[],inp=$('#f-img'),list=$('#up-list'),box=$('#up'),MAXN=5,MAXB=5*1024*1024;
    var draw=function(note){
      list.innerHTML='';
      files.forEach(function(x,i){
        var li=document.createElement('li'),im=document.createElement('img'),b=document.createElement('button');
        im.alt=x.name;im.src=URL.createObjectURL(x);
        b.type='button';b.textContent='\u00d7';b.setAttribute('aria-label','Remove '+x.name);
        b.addEventListener('click',function(){files.splice(i,1);draw()});
        li.appendChild(im);li.appendChild(b);list.appendChild(li);
      });
      if(note){var n=document.createElement('li');n.className='bad';n.textContent=note;list.appendChild(n)}
    };
    var add=function(fl){
      var note='';
      Array.prototype.forEach.call(fl,function(x){
        if(!/^image\/(jpeg|png|webp)$/.test(x.type)){note='Only JPG, PNG or WebP images can be added.';return}
        if(x.size>MAXB){note=x.name+' is over 5 MB.';return}
        if(files.length>=MAXN){note='You can add up to 5 photos.';return}
        files.push(x);
      });
      draw(note);
    };
    if(inp&&list&&box){
      inp.addEventListener('change',function(){add(inp.files);inp.value=''});
      ['dragenter','dragover'].forEach(function(t){box.addEventListener(t,function(){box.classList.add('drag')})});
      ['dragleave','drop'].forEach(function(t){box.addEventListener(t,function(){box.classList.remove('drag')})});
    }
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(f.website.value){return}
      if(!f.checkValidity()){f.reportValidity();return}
      var d={};new FormData(f).forEach(function(v,k){if(k!=='website'&&k!=='photos')d[k]=v});
      if(ENDPOINT){
        var fd=new FormData();Object.keys(d).forEach(function(k){fd.append(k,d[k])});
        files.forEach(function(x){fd.append('photos',x,x.name)});
        fetch(ENDPOINT,{method:'POST',headers:{'Accept':'application/json'},body:fd})
          .then(function(r){if(!r.ok)throw 0;show('Thank you. Your request has been sent and we will be in touch shortly.','ok');f.reset();files=[];draw()})
          .catch(function(){show('Sorry, something went wrong. Please call 780-289-4650 or email '+TO+'.','err')});
      }else{
        var body=['Name: '+d.name,'Company: '+(d.company||''),'Email: '+d.email,'Phone: '+d.phone,'Property location: '+(d.location||''),'Facility type: '+d.facility,'Service required: '+(d.service||''),'Frequency: '+(d.frequency||''),'','Details:',d.message||''];
        if(files.length){body.push('','Photos to attach: '+files.map(function(x){return x.name}).join(', '))}
        location.href='mailto:'+TO+'?subject='+encodeURIComponent('Cleaning quote request from '+d.name)+'&body='+encodeURIComponent(body.join('\n'));
        show(files.length?'Your email app should open with your request ready. Please attach your photos to that email before sending, or call 780-289-4650.':'Your email app should open with your request ready to send. If it does not, please call 780-289-4650 or email '+TO+'.','ok');
      }
    });
  }
})();

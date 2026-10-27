(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var f=$('#bk');if(!f)return;
  /* Set ENDPOINT to a form service URL (Formspree, Basin, a WordPress handler) to send requests and photos directly.
     While it is empty the request opens as a pre-filled email and never shows a false success message. */
  var ENDPOINT='',TO='raman.mann@zemclean.com';
  var step=1,files=[],MAXN=5,MAXB=5*1024*1024;
  var panels=$$('.bk-p'),dots=$$('#bk-steps li');
  var esc=function(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var val=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};

  /* dates */
  var d=new Date();d.setDate(d.getDate()+1);
  var iso=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  $$('input[type=date]',f).forEach(function(i){i.min=iso});

  /* services: preselect from ?service=slug */
  var q=(location.search.match(/[?&]service=([a-z0-9-]+)/)||[])[1];
  if(q){var pre=$('input[name=svc][value="'+q+'"]');if(pre)pre.checked=true}
  var chosen=function(){return $$('input[name=svc]:checked').map(function(i){return i.getAttribute('data-t')})};
  function sum(){
    var c=chosen(),l=$('#bk-list');
    l.innerHTML=c.length?c.map(function(t){return '<li>'+esc(t)+'</li>'}).join(''):'<li class="empty">No services selected yet.</li>';
    $('#bk-count').textContent=c.length?c.length+(c.length===1?' service selected':' services selected'):'';
  }
  f.addEventListener('change',function(e){if(e.target.name==='svc')sum()});sum();

  /* steps */
  function go(n){
    step=n;
    panels.forEach(function(p){p.classList.toggle('on',+p.getAttribute('data-p')===n)});
    dots.forEach(function(s){var k=+s.getAttribute('data-s');s.classList.toggle('on',k===n);s.classList.toggle('done',k<n)});
    if(n===4)review();
    var top=$('#bk-steps').getBoundingClientRect().top+window.scrollY-120;window.scrollTo({top:top,behavior:'smooth'});
  }
  function err(i,t){var e=$('#e'+i);e.textContent=t||''}
  function valid(n){
    err(n,'');
    if(n===1){if(!chosen().length){err(1,'Please choose at least one service.');return false}return true}
    var req=n===2?['name','phone','email','address','facility']:n===3?['start','frequency','time']:[];
    for(var i=0;i<req.length;i++){var el=f.elements[req[i]];if(!el.value.trim()){err(n,'Please complete the required fields marked *.');el.focus();return false}}
    if(n===2){
      if(!f.elements.email.checkValidity()){err(2,'Please enter a valid email address.');f.elements.email.focus();return false}
      if(val('phone').replace(/\D/g,'').length<10){err(2,'Please enter a phone number with area code.');f.elements.phone.focus();return false}
    }
    if(n===3&&val('walk')&&val('start')&&val('walk')>val('start')){err(3,'Your walk-through date should be on or before your start date.');return false}
    return true;
  }
  $$('[data-next]').forEach(function(b){b.addEventListener('click',function(){if(valid(step))go(step+1)})});
  $$('[data-back]').forEach(function(b){b.addEventListener('click',function(){go(step-1)})});
  dots.forEach(function(s){s.addEventListener('click',function(){var k=+s.getAttribute('data-s');if(k<step)go(k)})});

  /* photos */
  var inp=$('#f-img'),list=$('#up-list'),box=$('#up');
  function draw(note){
    list.innerHTML='';
    files.forEach(function(x,i){
      var li=document.createElement('li'),im=document.createElement('img'),b=document.createElement('button');
      im.alt=x.name;im.src=URL.createObjectURL(x);b.type='button';b.textContent='×';b.setAttribute('aria-label','Remove '+x.name);
      b.addEventListener('click',function(){files.splice(i,1);draw()});li.appendChild(im);li.appendChild(b);list.appendChild(li);
    });
    if(note){var n=document.createElement('li');n.className='bad';n.textContent=note;list.appendChild(n)}
  }
  function add(fl){
    var note='';
    [].forEach.call(fl,function(x){
      if(!/^image\/(jpeg|png|webp)$/.test(x.type)){note='Only JPG, PNG or WebP images can be added.';return}
      if(x.size>MAXB){note=x.name+' is over 5 MB.';return}
      if(files.length>=MAXN){note='You can add up to 5 photos.';return}
      files.push(x);
    });draw(note);
  }
  inp.addEventListener('change',function(){add(inp.files);inp.value=''});
  ['dragenter','dragover'].forEach(function(t){box.addEventListener(t,function(){box.classList.add('drag')})});
  ['dragleave','drop'].forEach(function(t){box.addEventListener(t,function(){box.classList.remove('drag')})});

  /* review + summary text */
  function lines(){
    var L=[];
    L.push(['Services',chosen().join(', ')]);
    L.push(['Name',val('name')]);L.push(['Company',val('company')]);L.push(['Phone',val('phone')]);L.push(['Email',val('email')]);
    L.push(['Facility address',val('address')]);L.push(['Facility type',val('facility')]);L.push(['Approx. size',val('size')]);
    L.push(['Preferred start date',val('start')]);L.push(['Walk-through date',val('walk')]);L.push(['Frequency',val('frequency')]);L.push(['Preferred cleaning time',val('time')]);
    L.push(['Photos',files.length?files.map(function(x){return x.name}).join(', '):'']);
    L.push(['Notes',val('notes')]);
    return L.filter(function(r){return r[1]});
  }
  function review(){
    $('#bk-rev').innerHTML='<dl>'+lines().map(function(r){return '<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join('')+'</dl>';
  }
  function text(){return 'Commercial cleaning booking request\n\n'+lines().map(function(r){return r[0]+': '+r[1]}).join('\n')}
  function copy(btn){
    var t=text(),ok=function(){var o=btn.textContent;btn.textContent='Copied';setTimeout(function(){btn.textContent=o},1800)};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){window.prompt('Copy your details',t)})}else{window.prompt('Copy your details',t)}
  }
  $('#bk-copy').addEventListener('click',function(){copy(this)});
  $('#bk-copy2').addEventListener('click',function(){copy(this)});

  /* submit */
  function done(sent){
    f.hidden=true;$('#bk-steps').hidden=true;
    var dn=$('#bk-done');dn.hidden=false;
    $('#bk-dt').textContent=sent?'Booking request submitted':'Your booking request is ready';
    $('#bk-dp').textContent=sent?'Thank you. We have your request and will be in touch shortly.':'Your email app should have opened with your request written for you. '+(files.length?'Please attach your photos to that email before sending. ':'')+'If it did not open, use Copy details or call 780-289-4650.';
    dn.focus();window.scrollTo({top:dn.getBoundingClientRect().top+window.scrollY-140,behavior:'smooth'});
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(val('website'))return;
    for(var i=1;i<=3;i++){if(!valid(i)){go(i);return}}
    if(!f.elements.consent.checked){err(4,'Please tick the box to agree before sending.');return}
    err(4,'');
    if(ENDPOINT){
      var fd=new FormData();lines().forEach(function(r){fd.append(r[0],r[1])});
      files.forEach(function(x){fd.append('photos',x,x.name)});
      fetch(ENDPOINT,{method:'POST',headers:{'Accept':'application/json'},body:fd})
        .then(function(r){if(!r.ok)throw 0;done(true)})
        .catch(function(){err(4,'Sorry, something went wrong. Please call 780-289-4650 or email '+TO+'.')});
    }else{
      location.href='mailto:'+TO+'?subject='+encodeURIComponent('Booking request from '+val('name')+(val('company')?' ('+val('company')+')':''))+'&body='+encodeURIComponent(text()+(files.length?'\n\n(Photos to attach: '+files.length+')':''));
      done(false);
    }
  });
})();

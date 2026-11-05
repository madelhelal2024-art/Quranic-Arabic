/* Arabic Light Academy — Surah An-Nas learning app.
 * All lesson wording, tables, questions, and answers are imported from the
 * approved three source books. Only interaction/layout text is app-authored.
 */
const contentEl = document.getElementById('app-content');
const pageLabel = document.getElementById('current-page');
const nav = document.getElementById('primary-nav');
const toastEl = document.getElementById('toast');
const installButton = document.getElementById('install-button');
let data;
let installPrompt = null;
let toastTimer;
const KEY = 'arabic-light-quranic-arabic-lesson01-v1';

const labels = {
  ar: {home:'الرئيسية',student:'كتاب الطالب',workbook:'كتاب التدريبات',irab:'كتاب الإعراب',progress:'تقدّمي',open:'ابدأ التعلّم',continue:'استكمل رحلتك',units:'محتويات الكتاب',complete:'أنهيت هذا القسم',completed:'تم إنجاز القسم',previous:'السابق',next:'التالي',check:'تحقق من الإجابة',pick:'اختر إجابة أولًا',right:'إجابة صحيحة، أحسنت!',wrong:'حاول مرة أخرى',saved:'إجابتك محفوظة على هذا الجهاز',done:'تم حفظ تقدّمك',learn:'الدرس الأول · سورة الناس',module:'أقسام المنهج',quiz:'سؤال اختيار من متعدد',answers:'إجابات صحيحة',written:'تدريب كتابي',revealing:'اضغط الكلمة لإظهار المعنى',local:'يُحفظ تقدّمك على هذا الجهاز فقط',review:'تعلّم · تدرّب · حلّل'},
  en: {home:'Overview',student:'Student Book',workbook:'Workbook',irab:'Iʿrāb Book',progress:'My Progress',open:'Start learning',continue:'Continue learning',units:'Book contents',complete:'Mark section complete',completed:'Section completed',previous:'Previous',next:'Next',check:'Check answer',pick:'Choose an answer first',right:'Correct! Well done.',wrong:'Try again',saved:'Saved on this device',done:'Progress saved',learn:'Lesson 01 · Surah An-Nās',module:'Study modules',quiz:'Multiple-choice question',answers:'Correct answers',written:'Written exercise',revealing:'Tap a word to reveal its meaning',local:'Your progress is saved on this device only',review:'Study · Practise · Analyse'}
};

function loadStore(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}}
const saved = loadStore();
const progress = {done:saved.done||{},chosen:saved.chosen||{},checked:saved.checked||{},written:saved.written||{}};
const ui = {book:'home',index:0,versePart:null,lang:saved.lang==='en'?'en':'ar'};
const t = key => labels[ui.lang][key]||key;
const say = (ar,en) => ui.lang==='en'?en:ar;
function store(){try{localStorage.setItem(KEY,JSON.stringify({...progress,lang:ui.lang}))}catch{}}
function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dir(text){return /^[\s\d\p{P}\p{S}]*[\u0600-\u06ff]/u.test(text)?'rtl':'ltr'}
function fmt(text){return esc(text).replace(/https?:\/\/[^\s<]+/g,url=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)}
function toast(message){clearTimeout(toastTimer);toastEl.textContent=message;toastEl.classList.add('show');toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2300)}
function bookName(book){return t(book)}
function sectionKey(book,index){return `${book}-${index}`}
function jump(book,index=0,scroll=true){
  ui.book=book;ui.index=Math.max(0,Math.min(index,(data?.books[book]?.length||1)-1));ui.versePart=null;
  const next=book==='home'?'#home':book==='progress'?'#progress':`#${book}/${ui.index+1}`;
  if(location.hash!==next)history.replaceState(null,'',next);
  render();if(scroll)window.scrollTo({top:0,behavior:'smooth'});
}

function parseLocation(){
  const match=location.hash.match(/^#(home|progress|student|workbook|irab)(?:\/(\d+))?$/);
  if(!match)return;
  ui.book=match[1];ui.index=Math.max(0,(Number(match[2])||1)-1);ui.versePart=null;
}

function metric(value,title,en){return `<div class="metric"><div class="metric-value">${esc(value)}</div><div>${esc(title)}<small>${esc(en)}</small></div></div>`}

function quizStats(){
  const total=Object.values(data.books).flatMap(sections=>sections.flatMap(section=>section.blocks)).filter(block=>block.type==='quiz');
  const attempted=total.filter(q=>progress.chosen[q.id]);
  const correct=total.filter(q=>progress.checked[q.id]&&progress.chosen[q.id]===data.answerKey[q.id]);
  return {total:total.length,attempted:attempted.length,correct:correct.length};
}

function completion(){
  const sections=Object.entries(data.books).flatMap(([book,list])=>list.map((_,index)=>sectionKey(book,index)));
  const done=sections.filter(k=>progress.done[k]).length;
  return {done,total:sections.length,percent:Math.round(100*done/sections.length)};
}

function home(){
  const p=completion();const q=quizStats();
  const modules=[
    ['student','▤','01','دراسة الآيات','Student Book',say('معاني الكلمات، والمعنى الإجمالي، والنحو والصرف، واللمسات البلاغية والفوائد اللغوية.','Word meanings, overall meaning, grammar, morphology, rhetorical features and language benefits.')],
    ['workbook','✓','02','التدريبات التفاعلية','Workbook',say('تدريبات كتابية وأسئلة اختيار من متعدد مع التصحيح الفوري ومراجعة السورة.','Written exercises and multiple-choice quizzes with instant checks and a surah review.')],
    ['irab','۞','03','الإعراب التفصيلي','Iʿrāb Book',say('تحليل نحوي كلمةً كلمة، وترابط التراكيب، وفهرس للصيغ الصرفية.','Detailed grammatical analysis, connected syntax, and a morphology index.')]
  ];
  return `<section class="hero"><div class="hero-copy"><div class="hero-tag">ARABIC LIGHT ACADEMY / LESSON 01</div><h1>عَرَبِيَّةُ الْقُرْآنِ</h1><div class="english">QUR'ANIC ARABIC</div><p>${say('ابدأ رحلتك في تعلّم العربية من القرآن الكريم، من خلال سورة الناس. دراسة منظّمة، وتطبيق عملي، وإعراب تفصيلي في مكان واحد.','Begin learning Arabic through Sūrat al-Nās, with structured study, interactive practice, and detailed grammar in one place.')}</p><button class="primary-button" data-open="student">${t('open')} <span aria-hidden="true">←</span></button><div class="hero-short">سُورَةُ النَّاسِ <span>·</span> Chapter 114 <span>·</span> Juzʾ 30</div></div><div class="hero-art" aria-hidden="true"><div class="hero-flower">✤</div><div class="hero-arch">۞</div></div></section>
  <div class="section-header"><div><div class="overline">YOUR LEARNING PATH</div><h2>${say('رحلتك التعليمية','Your learning path')}</h2><p>${say('ثلاثة كتب متكاملة في درس واحد','Three companion books in one lesson')}</p></div><span class="pill">${t('review')}</span></div>
  <section class="module-grid">${modules.map(([key,symbol,num,ar,en,description])=>`<article class="module-card"><div class="module-index"><span class="module-symbol" aria-hidden="true">${symbol}</span><span class="module-num">${num} / 03</span></div><h3>${say(ar,en)}</h3><div class="module-en">${en}</div><p>${description}</p><button class="card-link" data-open="${key}">${say('افتح الكتاب','Open book')} <span aria-hidden="true">←</span></button></article>`).join('')}</section>
  <div class="section-header"><div><div class="overline">AT A GLANCE</div><h2>${say('لمحة عن تقدّمك','Your progress')}</h2></div><button class="card-link" data-open="progress">${say('عرض التفاصيل','See details')} ←</button></div>
  <section class="metrics">${metric('6',say('آيات السورة','Verses'),'Verses')}${metric(q.total,say('سؤالًا تفاعليًا','Quiz questions'),'Multiple-choice')}${metric(p.percent+'%',say('إنجاز المحتوى','Completed'),'Completed')}</section>
  <div class="note-banner"><p><strong>${say('ملاحظة للدارس:','Study note:')}</strong> ${say('المحتوى العلمي مستمد من الكتب الثلاثة المعتمدة. يُحفظ تقدّمك وإجاباتك على الجهاز الذي تستخدمه، دون الحاجة إلى إنشاء حساب.','The academic content comes from the three approved books. Your progress and answers are saved on this device; no account is needed.')}</p><button class="secondary-button" data-open="student">${say('ابدأ الآن','Get started')}</button></div>`;
}

function blockHTML(block,book){
  if(block.type==='paragraph')return `<p class="body-paragraph" dir="${dir(block.text)}">${fmt(block.text)}</p>`;
  if(block.type==='bullet')return `<p class="body-bullet" dir="${dir(block.text)}">${fmt(block.text)}</p>`;
  if(block.type==='subheading')return `<div class="content-subheading"><span>${esc(block.title.ar||block.title.en)}</span><span>${esc(block.title.en)}</span></div>`;
  if(block.type==='table'){
    const vocab=block.rows[0]?.[0]?.toLowerCase().includes('qur')&&block.rows[0]?.length===3;
    return `${vocab?`<p class="vocab-tip">${t('revealing')}</p>`:''}<div class="table-scroll"><table class="study-table"><thead><tr>${(block.rows[0]||[]).map(cell=>`<th scope="col" dir="${dir(cell)}">${esc(cell)}</th>`).join('')}</tr></thead><tbody>${block.rows.slice(1).map((row)=>`<tr ${vocab?'class="vocab-row" tabindex="0" role="button" aria-label="Reveal word meaning"':''}>${row.map((cell,i)=>`<td dir="${dir(cell)}" ${i===0?'class="arabic-cell"':''}>${esc(cell).replace(/\n/g,'<span class="cell-line"> </span>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  if(block.type==='written'){
    const value=progress.written[block.id]||'';
    return `<article class="written-card"><div class="question-tag">${esc(block.id)} · ${t('written')}</div><h4 dir="${dir(block.question)}">${esc(block.question)}</h4><textarea data-written="${esc(block.id)}" aria-label="${esc(block.question)}" placeholder="${say('اكتب إجابتك هنا…','Write your answer here…')}" spellcheck="false">${esc(value)}</textarea><p class="autosave">${t('saved')}</p></article>`;
  }
  if(block.type==='quiz'){
    const chosen=progress.chosen[block.id];const checked=progress.checked[block.id];
    const isCorrect=chosen===data.answerKey[block.id];
    const feedback=checked?`<span class="feedback ${isCorrect?'correct':'incorrect'}">${isCorrect?'✓ '+t('right'):'↻ '+t('wrong')}</span>`:'';
    return `<article class="quiz-card"><div class="question-tag">${esc(block.id)} · ${t('quiz')}</div><h4 dir="${dir(block.question)}">${esc(block.question)}</h4><div class="choices" role="radiogroup" aria-label="${esc(block.question)}">${block.options.map(o=>`<label class="choice" dir="${dir(o.text)}"><input type="radio" name="q-${esc(block.id)}" data-quiz="${esc(block.id)}" value="${o.letter}" ${chosen===o.letter?'checked':''}><span class="choice-letter">${o.letter}.</span><span>${esc(o.text)}</span></label>`).join('')}</div><div class="quiz-footer"><button class="mini-button" data-check="${esc(block.id)}">${t('check')}</button><span class="feedback-wrap" id="feedback-${esc(block.id)}">${feedback}</span></div></article>`;
  }
  return '';
}

function verseGroups(blocks){
  const groups=[];
  for(const block of blocks){
    if(block.type==='subheading')groups.push({title:block.title,blocks:[]});
    else if(groups.length)groups[groups.length-1].blocks.push(block);
  }
  return groups;
}

function versePanel(groups){
  if(ui.versePart===null)return `<div class="verse-prompt"><span aria-hidden="true">✧</span><p>${say('اختر أحد الأزرار بالأعلى لعرض هذا الجزء من الدرس وحده.','Choose a button above to study one part of the lesson at a time.')}</p></div>`;
  const selected=groups[ui.versePart];
  if(!selected)return '';
  return `<div class="verse-detail-heading"><span>${esc(selected.title.ar||selected.title.en)}</span><small>${esc(selected.title.en)}</small></div>${selected.blocks.map(block=>blockHTML(block,'student')).join('')}`;
}

function verseTools(verseNumber,blocks){
  const groups=verseGroups(blocks);
  const audioNumber=6230+verseNumber;
  const audioUrl=`https://cdn.islamic.network/quran/audio/128/ar.minshawi/${audioNumber}.mp3`;
  const tabs=groups.map((group,i)=>`<button class="verse-tab ${ui.versePart===i?'selected':''}" id="verse-tab-${i}" data-verse-part="${i}" role="tab" aria-selected="${ui.versePart===i?'true':'false'}" aria-controls="verse-content-panel"><span class="tab-number">${String(i+1).padStart(2,'0')}</span><span class="tab-ar">${esc(group.title.ar||group.title.en)}</span><small>${esc(group.title.en)}</small></button>`).join('');
  return `<div class="recitation-box"><div class="recitation-identity"><span class="sound-mark" aria-hidden="true">♫</span><div><strong>${say('استمع إلى الآية','Listen to this verse')}</strong><small>${say('محمد صديق المنشاوي · تلاوة مرتّلة','Mohamed Siddiq al-Minshawi · Murattal')}</small></div></div><button class="audio-button" data-audio-play aria-label="${say('تشغيل تلاوة الآية','Play verse recitation')}" aria-pressed="false"><span class="audio-symbol" aria-hidden="true">▶</span><span class="audio-caption">${say('استمع للآية','Play verse')}</span></button><audio id="verse-audio" src="${audioUrl}" preload="none"></audio></div><div class="audio-attribution"><span id="audio-status" role="status" aria-live="polite">${say('يحتاج الصوت إلى اتصال بالإنترنت','Audio needs an internet connection')}</span><a href="https://alquran.cloud/cdn" target="_blank" rel="noopener noreferrer">Al Quran Cloud / Islamic Network</a></div>
  <section class="verse-study"><div class="verse-study-heading"><div><strong>${say('استكشف الآية خطوة بخطوة','Explore the verse step by step')}</strong><p>${say('كل زر يعرض قسمًا واحدًا فقط من شرح الآية.','Each button opens just one part of the verse study.')}</p></div><span class="study-decoration" aria-hidden="true">۞</span></div><div class="verse-tabs" role="tablist" aria-label="${say('أقسام شرح الآية','Verse study sections')}">${tabs}</div><div class="verse-content-panel" id="verse-content-panel" role="tabpanel" aria-live="polite">${versePanel(groups)}</div></section>`;
}

function book(){
  const sections=data.books[ui.book]||[];
  ui.index=Math.min(ui.index,sections.length-1);
  const section=sections[ui.index];if(!section)return `<p class="empty">لا يوجد محتوى.</p>`;
  const verseMatch=ui.book==='student'?section.title.en.match(/^Verse (\d+)$/):null;
  const isVerse=!!verseMatch;
  const blocks=section.blocks.slice();let introduction='';
  if(isVerse&&blocks[0]?.type==='paragraph'){
    const original=blocks.shift().text;
    introduction=`<div class="quran-verse" dir="rtl">${esc(original)}</div>`;
    if(blocks[0]?.type==='paragraph')introduction+=`<p class="translation">${esc(blocks.shift().text)}</p>`;
  }
  const key=sectionKey(ui.book,ui.index);const isDone=!!progress.done[key];
  return `<header class="book-heading"><div><div class="eyebrow">LESSON 01 / SURAH AN-NĀS</div><h1>${bookName(ui.book)}</h1><p>${ui.book==='student'?'STUDENT BOOK':ui.book==='workbook'?'WORKBOOK':'DETAILED IʿRĀB BOOK'} · Arabic Light Academy</p></div><span class="pill">${sections.length} ${say('أقسام','sections')}</span></header>
    <div class="book-layout"><aside class="chapter-panel" aria-label="${t('units')}"><h3>${t('units')}</h3>${sections.map((s,i)=>`<button class="chapter-button ${ui.index===i?'selected':''}" data-section="${i}" aria-current="${ui.index===i?'true':'false'}"><span class="chapter-no">${String(i+1).padStart(2,'0')}</span><span>${esc((ui.lang==='en'?s.title.en:s.title.ar)||s.title.en)}</span>${progress.done[sectionKey(ui.book,i)]?'<span class="chapter-done">✓</span>':''}</button>`).join('')}</aside>
    <article class="lesson-paper"><div class="lesson-header"><div class="lesson-pretitle"><span>عَرَبِيَّةُ الْقُرْآنِ · سُورَةُ النَّاسِ</span><span>0${ui.index+1} / ${sections.length}</span></div><h2>${esc((ui.lang==='en'?section.title.en:section.title.ar)||section.title.en)}</h2><div class="lesson-en">${esc(section.title.en)}</div></div>
    ${introduction}${isVerse?verseTools(Number(verseMatch[1]),blocks):blocks.map(b=>blockHTML(b,ui.book)).join('')}
    <div class="complete-row"><button class="mark-done ${isDone?'is-done':''}" data-done="${ui.index}">${isDone?'✓ '+t('completed'):'○ '+t('complete')}</button><div class="lesson-controls"><button class="step-button" data-step="-1" ${ui.index===0?'disabled':''}>→ ${t('previous')}</button><button class="step-button" data-step="1" ${ui.index===sections.length-1?'disabled':''}>${t('next')} ←</button></div></div></article></div>`;
}

function progressPage(){
  const p=completion();const q=quizStats();
  const names=[['student','كتاب الطالب','Student Book'],['workbook','كتاب التدريبات','Workbook'],['irab','كتاب الإعراب','Iʿrāb Book']];
  return `<div class="eyebrow">YOUR LEARNING JOURNEY</div><h1 class="section-title">تقدّمك في سورة الناس</h1><p class="lead">تابع الأقسام التي درستها والأسئلة التي أجبت عنها. ويمكنك العودة إلى أي قسم في أي وقت.</p>
    <section class="summary-grid" style="margin-top:28px">${metric(p.percent+'%','إنجاز الأقسام','Completion')}${metric(q.attempted+'/'+q.total,'الأسئلة المُجابة','Attempted')}${metric(q.correct,'الإجابات الصحيحة المُتحقَّق منها','Correct answers')}</section>
    <div class="progress-card"><div class="progress-top"><strong>التقدّم الإجمالي</strong><span>${p.percent}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${p.percent}%"></div></div><p class="progress-caption">${p.done} من أصل ${p.total} قسمًا من الكتب الثلاثة تم تحديدها مكتملة.</p></div>
    <div class="section-header"><div><h2>تفاصيل الكتب</h2><p>يمكنك متابعة كل كتاب على حدة</p></div></div>
    <div class="progress-list">${names.map(([key,ar,en])=>{const total=data.books[key].length;const count=data.books[key].filter((_,i)=>progress.done[sectionKey(key,i)]).length;return `<button class="progress-line" data-open="${key}" style="width:100%;text-align:right"><span>${ar} <small style="color:#999;direction:ltr;display:inline-block">${en}</small></span><strong>${count} / ${total} ←</strong></button>`}).join('')}</div>
    <div class="note-banner"><p><strong>الخصوصية:</strong> ${t('local')}؛ لا تُرسَل إجاباتك إلى خادم، ولا تُزامَن بين الأجهزة.</p></div>`;
}

function render(){
  const titles={home:t('home'),student:t('student'),workbook:t('workbook'),irab:t('irab'),progress:t('progress')};
  pageLabel.textContent=titles[ui.book];
  nav.querySelectorAll('[data-book]').forEach(btn=>{
    const active=btn.dataset.book===ui.book;btn.classList.toggle('active',active);btn.setAttribute('aria-current',active?'page':'false');
    btn.querySelector('span:nth-child(2)').textContent=t(btn.dataset.book);
  });
  document.getElementById('lang-toggle').textContent=ui.lang==='ar'?'EN':'ع';
  contentEl.innerHTML=ui.book==='home'?home():ui.book==='progress'?progressPage():book();
  const verseAudio=document.getElementById('verse-audio');
  if(verseAudio){
    verseAudio.addEventListener('ended',()=>setAudioButton(false));
    verseAudio.addEventListener('error',()=>{
      setAudioButton(false);
      const status=document.getElementById('audio-status');
      if(status)status.textContent=say('تعذّر تحميل التلاوة. تحقّق من اتصال الإنترنت.','Could not load the recitation. Check your internet connection.');
    });
  }
}

function setAudioButton(playing){
  const button=document.querySelector('[data-audio-play]');if(!button)return;
  button.setAttribute('aria-pressed',playing?'true':'false');
  button.classList.toggle('playing',playing);
  button.querySelector('.audio-symbol').textContent=playing?'Ⅱ':'▶';
  button.querySelector('.audio-caption').textContent=playing?say('إيقاف مؤقت','Pause'):say('استمع للآية','Play verse');
  const status=document.getElementById('audio-status');
  if(status)status.textContent=playing?say('جارٍ تشغيل التلاوة','Playing recitation'):say('يمكنك إعادة الاستماع في أي وقت','Replay whenever you like');
}

async function toggleAudio(){
  const audio=document.getElementById('verse-audio');if(!audio)return;
  if(!audio.paused){audio.pause();setAudioButton(false);return}
  const status=document.getElementById('audio-status');
  if(status)status.textContent=say('جارٍ تحميل التلاوة…','Loading recitation…');
  try{await audio.play();setAudioButton(true)}
  catch{setAudioButton(false);if(status)status.textContent=say('لم يبدأ الصوت. تحقق من الإنترنت ثم حاول مجددًا.','Playback could not start. Check your connection and try again.')}
}

nav.addEventListener('click',e=>{const btn=e.target.closest('[data-book]');if(btn)jump(btn.dataset.book)});
contentEl.addEventListener('click',e=>{
  const open=e.target.closest('[data-open]');if(open){jump(open.dataset.open);return}
  const section=e.target.closest('[data-section]');if(section){jump(ui.book,Number(section.dataset.section));return}
  const step=e.target.closest('[data-step]');if(step){jump(ui.book,ui.index+Number(step.dataset.step));return}
  const part=e.target.closest('[data-verse-part]');if(part){
    const next=Number(part.dataset.versePart);
    ui.versePart=ui.versePart===next?null:next;
    const groups=verseGroups(data.books.student[ui.index].blocks);
    contentEl.querySelectorAll('[data-verse-part]').forEach(button=>{
      const selected=Number(button.dataset.versePart)===ui.versePart;
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-selected',selected?'true':'false');
    });
    const panel=document.getElementById('verse-content-panel');
    if(panel)panel.innerHTML=versePanel(groups);
    return;
  }
  if(e.target.closest('[data-audio-play]')){toggleAudio();return}
  const done=e.target.closest('[data-done]');if(done){const key=sectionKey(ui.book,ui.index);progress.done[key]=!progress.done[key];store();render();toast(t('done'));return}
  const check=e.target.closest('[data-check]');if(check){const id=check.dataset.check;if(!progress.chosen[id]){toast(t('pick'));return}progress.checked[id]=true;store();const good=progress.chosen[id]===data.answerKey[id];document.getElementById(`feedback-${id}`).innerHTML=`<span class="feedback ${good?'correct':'incorrect'}">${good?'✓ '+t('right'):'↻ '+t('wrong')}</span>`;return}
  const row=e.target.closest('.vocab-row');if(row){row.classList.toggle('revealed');row.setAttribute('aria-pressed',row.classList.contains('revealed')?'true':'false')}
});
contentEl.addEventListener('keydown',e=>{const row=e.target.closest('.vocab-row');if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();row.click()}});
contentEl.addEventListener('change',e=>{if(e.target.matches('[data-quiz]')){const id=e.target.dataset.quiz;progress.chosen[id]=e.target.value;delete progress.checked[id];store();const f=document.getElementById(`feedback-${id}`);if(f)f.innerHTML=''}});
contentEl.addEventListener('input',e=>{if(e.target.matches('[data-written]')){progress.written[e.target.dataset.written]=e.target.value;store()}});
document.getElementById('lang-toggle').addEventListener('click',()=>{ui.lang=ui.lang==='ar'?'en':'ar';store();render()});
window.addEventListener('hashchange',()=>{parseLocation();render()});
window.addEventListener('online',updateOnline);window.addEventListener('offline',updateOnline);
function updateOnline(){document.getElementById('offline-status').hidden=navigator.onLine}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installButton.hidden=false});
installButton.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installButton.hidden=true});
window.addEventListener('appinstalled',()=>{installButton.hidden=true;toast('تم تثبيت التطبيق')});

async function init(){
  try{
    const response=await fetch('./content.json');if(!response.ok)throw new Error('Failed to load content');
    data=await response.json();parseLocation();render();updateOnline();
    if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }catch(error){contentEl.innerHTML='<div class="empty">تعذّر تحميل بيانات الكتاب. رجاءً تحقق من الاتصال وأعد فتح التطبيق.</div>';console.error(error)}
}
init();

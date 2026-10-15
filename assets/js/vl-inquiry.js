/* Visit Locals — Central Inquiry Layer
 * One reusable frontend bridge for every inquiry form.
 * Backend: https://cms.visitindonesia.co.id/api
 */
(function () {
  'use strict';

  window.VL_CONFIG = Object.assign({
    API_BASE: 'https://cms.visitindonesia.co.id/api',
    API_TIMEOUT_MS: 15000,
    SITE_KEY: 'visit-locals-alpha'
  }, window.VL_CONFIG || {});

  const state = {
    context: JSON.parse(sessionStorage.getItem('vl_inquiry_context') || 'null') || {}
  };

  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function setContext(context) {
    state.context = Object.assign({}, state.context, context || {});
    sessionStorage.setItem('vl_inquiry_context', JSON.stringify(state.context));
    return state.context;
  }

  function clearContext() {
    state.context = {};
    sessionStorage.removeItem('vl_inquiry_context');
  }

  function pageName() {
    const p = location.pathname.replace(/\/+$/, '') || '/';
    if (p === '/') return 'home';
    return p.split('/').filter(Boolean)[0] || 'home';
  }

  function addHoneypot(form) {
    if (!form || form.querySelector('[name="website"]')) return;
    const hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    form.appendChild(hp);
  }

  function fieldMap(form) {
    const data = {};
    [...form.elements].forEach((el) => {
      if (!el.name || el.disabled || el.type === 'submit' || el.type === 'button' || el.type === 'checkbox' && !el.checked) return;
      if (el.type === 'checkbox') {
        data[el.name] = data[el.name] ? [].concat(data[el.name], el.value || true) : (el.value || true);
      } else if (el.type === 'select-multiple') {
        data[el.name] = [...el.selectedOptions].map(o => o.value);
      } else {
        data[el.name] = el.value;
      }
    });
    return data;
  }

  function labelText(el) {
    const parent = el.closest('div');
    const label = parent && parent.querySelector('label');
    return label ? label.textContent.replace(/\*/g, '').trim() : '';
  }

  function ensureNames() {
    const q = (sel) => document.querySelector(sel);

    const home = q('#inquiry-form');
    if (home) {
      const inputs = [...home.querySelectorAll('input,select,textarea')];
      const names = ['full_name','email','whatsapp','destination','message'];
      inputs.forEach((el,i) => { if (!el.name && names[i]) el.name = names[i]; });
    }

    const explore = q('#quick-inquiry-form');
    if (explore) {
      const inputs = [...explore.querySelectorAll('input,select,textarea')];
      const names = ['full_name','contact','destination','message'];
      inputs.forEach((el,i) => { if (!el.name && names[i]) el.name = names[i]; });
    }

    const business = q('#businessInquiryForm');
    if (business) {
      const map = [
        ['input[type="text"]','full_name'], ['input[type="email"]','email'],
        ['input[type="text"]','company'], ['#business-primary-need','primary_need'],
        ['textarea','message'], ['#ndaCheck','nda_requested']
      ];
      const els = [...business.querySelectorAll('input,select,textarea')];
      els.forEach(el => {
        if (el.name) return;
        if (el.id === 'business-primary-need') el.name='primary_need';
        else if (el.id === 'ndaCheck') el.name='nda_requested';
        else if (el.tagName === 'TEXTAREA') el.name='message';
        else if (el.type === 'email') el.name='email';
        else if (el.type === 'text') {
          const used = els.filter(x => x.name === 'full_name' || x.name === 'company').length;
          el.name = used === 0 ? 'full_name' : 'company';
        }
      });
      const sectors=[...business.querySelectorAll('.sector-tag')];
      sectors.forEach(b => b.dataset.formSector='true');
    }

    const journey = q('#journey-planner-form');
    if (journey) {
      const textInputs=[...journey.querySelectorAll('input[type="text"]')];
      if (textInputs[0] && !textInputs[0].name) textInputs[0].name='preferred_regions';
      if (textInputs[1] && !textInputs[1].name) textInputs[1].name='contact';
      const ta=journey.querySelector('textarea'); if (ta && !ta.name) ta.name='message';
      const hidden=journey.querySelector('#selected-journey'); if (hidden && !hidden.name) hidden.name='selected_journey';
    }

    const partner = q('#partner-form');
    if (partner) {
      const ids={ 'full-name':'full_name','business-name':'business_name','email':'email','phone':'phone','location':'location','category':'category','story':'message' };
      Object.entries(ids).forEach(([id,name])=>{const el=document.getElementById(id);if(el&&!el.name)el.name=name;});
      [...partner.querySelectorAll('input[name="interest"]')].forEach(el=>el.name='interests[]');
    }

    const newsletter = q('#insight-subscribe-form');
    if (newsletter) { const el=newsletter.querySelector('input[type="email"]'); if(el && !el.name) el.name='email'; }
  }

  function inferContext(form) {
    if (form.id === 'booking-form') return Object.assign({inquiry_type:'experience_booking',content_type:'experience'}, state.context);
    if (form.id === 'businessInquiryForm') return Object.assign({inquiry_type:'business_advisory',content_type:'business_service'}, state.context);
    if (form.id === 'journey-planner-form') return Object.assign({inquiry_type:'custom_journey',content_type:'journey'}, state.context);
    if (form.id === 'quick-inquiry-form') return Object.assign({inquiry_type:'custom_experience',content_type:'explore_request'}, state.context);
    if (form.id === 'partner-form') return {inquiry_type:'partner_application',content_type:'partner'};
    if (form.id === 'insight-subscribe-form') return {inquiry_type:'newsletter_subscription',content_type:'newsletter'};
    return Object.assign({inquiry_type:'general_inquiry',content_type:'inquiry'}, state.context);
  }

  function normalize(form) {
    const raw=fieldMap(form);
    const context=inferContext(form);
    const sectors=[...form.querySelectorAll('.sector-tag.active,[data-form-sector="true"].is-selected')].map(b=>b.dataset.sector).filter(Boolean);
    const checkedSectors=[...form.querySelectorAll('.sector-tag')].filter(b=>b.classList.contains('bg-primary') || b.classList.contains('is-selected')).map(b=>b.dataset.sector).filter(Boolean);
    const journeyInterests=[...form.querySelectorAll('#interests-container .interest-btn')].filter(b=>b.classList.contains('bg-primary')).map(b=>b.textContent.trim());
    const duration=[...form.querySelectorAll('#duration-container .duration-btn')].find(b=>b.classList.contains('bg-primary'))?.textContent.trim() || '';
    const payload={
      site_key: VL_CONFIG.SITE_KEY,
      page: location.pathname,
      source_page: pageName(),
      inquiry_type: context.inquiry_type || 'general_inquiry',
      content_type: context.content_type || null,
      content_id: context.content_id || null,
      content_title: context.content_title || null,
      service_id: context.service_id || null,
      service_title: context.service_title || null,
      destination: context.destination || raw.destination || raw.preferred_regions || null,
      visitor: {
        full_name: raw.full_name || null,
        email: raw.email || null,
        phone: raw.phone || raw.whatsapp || raw.contact || null,
        company: raw.company || raw.business_name || null
      },
      details: Object.assign({}, raw, {
        sectors: checkedSectors.length ? checkedSectors : sectors,
        journey_interests: journeyInterests,
        duration,
        nda_requested: !!raw.nda_requested
      })
    };
    return payload;
  }

  function toast(form, type, message) {
    let box=form.parentElement.querySelector('.vl-api-status');
    if(!box){box=document.createElement('div');box.className='vl-api-status mt-4 p-3 rounded-lg text-sm';form.insertAdjacentElement('afterend',box);}
    box.className='vl-api-status mt-4 p-3 rounded-lg text-sm '+(type==='ok'?'bg-secondary-fixed text-on-secondary-fixed':'bg-error-container text-on-error-container');
    box.innerHTML=escapeHtml(message);
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  async function post(endpoint, payload) {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(), VL_CONFIG.API_TIMEOUT_MS);
    try {
      const res=await fetch(`${VL_CONFIG.API_BASE}/${endpoint}`,{
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload), signal:controller.signal, credentials:'omit'
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok || !data.success) throw new Error(data.message || `Request failed (${res.status})`);
      return data;
    } finally { clearTimeout(timer); }
  }

  function afterSuccess(form, result) {
    form.dataset.submitted='true';
    if (form.id==='businessInquiryForm') {
      const m=document.getElementById('formSuccessModal'); if(m)m.classList.remove('hidden');
    } else if (form.id==='partner-form') {
      const s=document.getElementById('form-success'); if(s){form.classList.add('hidden');s.classList.remove('hidden');s.classList.add('flex');}
    } else if (form.id==='journey-planner-form') {
      const btn=document.getElementById('planner-submit-btn'),s=document.getElementById('planner-success-msg'); if(btn)btn.classList.add('hidden'); if(s)s.classList.remove('hidden');
    } else if (form.id==='quick-inquiry-form') {
      const s=document.getElementById('form-success-note'); if(s)s.classList.remove('hidden');
    } else if (form.id==='booking-form') {
      const s=document.getElementById('quote-success'); if(s)s.classList.remove('hidden');
    } else if (form.id==='insight-subscribe-form') {
      const input=form.querySelector('input[type="email"]'); if(input)input.value='';
      toast(form,'ok','You are on the journal list. Thank you.');
    } else {
      const s=document.getElementById('form-success-banner'); if(s)s.classList.remove('hidden');
      toast(form,'ok','Your inquiry has been received. Our Visit Locals team will follow up shortly.');
    }
    if (form.id!=='insight-subscribe-form') form.reset();
    clearContext();
    return result;
  }

  async function handleFormSubmit(form) {
    addHoneypot(form);
    const hp=form.querySelector('[name="website"]');
    if(hp && hp.value) return;
    if(!form.checkValidity()){form.reportValidity();return;}
    const submit=form.querySelector('button[type="submit"]');
    const old=submit?.innerHTML;
    if(submit){submit.disabled=true;submit.dataset.oldHtml=old;submit.innerHTML='Sending securely…';}
    try {
      const endpoint=form.id==='insight-subscribe-form'?'subscribe.php':'inquiry.php';
      const result=await post(endpoint, normalize(form));
      afterSuccess(form,result);
    } catch(err) {
      toast(form,'error', err.name==='AbortError' ? 'The request timed out. Please try again.' : (err.message || 'Could not send your request. Please try again.'));
    } finally {
      if(submit){submit.disabled=false;submit.innerHTML=submit.dataset.oldHtml || old || 'Submit';}
    }
  }

  function wrapContextFunctions() {
    const oldQuote=window.openQuoteModal;
    if(typeof oldQuote==='function' && !oldQuote.__vlWrapped){
      const wrapped=function(title,location,duration,price,rating,description){
        setContext({inquiry_type:'experience_booking',content_type:'experience',content_id:(title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),content_title:title||'',destination:location||''});
        return oldQuote.apply(this,arguments);
      }; wrapped.__vlWrapped=true; window.openQuoteModal=wrapped;
    }
    const oldBiz=window.openBusinessServiceModal;
    if(typeof oldBiz==='function' && !oldBiz.__vlWrapped){
      const wrapped=function(key){
        const result=oldBiz.apply(this,arguments);
        const title=(document.getElementById('business-service-modal-title')||document.querySelector('#business-service-modal h3'))?.textContent?.trim() || '';
        setContext({inquiry_type:'business_advisory',content_type:'business_service',service_id:key||null,service_title:title});
        return result;
      }; wrapped.__vlWrapped=true; window.openBusinessServiceModal=wrapped;
    }
    const oldDetail=window.openExperienceDetail;
    if(typeof oldDetail==='function' && !oldDetail.__vlWrapped){
      const wrapped=function(kind,index){
        const result=oldDetail.apply(this,arguments);
        const title=document.getElementById('detail-title')?.textContent?.trim() || '';
        setContext({content_type:kind==='business'?'business_journey':'experience',content_id:`${kind||'experience'}-${index}`,content_title:title,inquiry_type:kind==='business'?'business_advisory':'custom_journey'});
        return result;
      }; wrapped.__vlWrapped=true; window.openExperienceDetail=wrapped;
    }
    const oldBook=window.bookExperienceFromModal;
    if(typeof oldBook==='function' && !oldBook.__vlWrapped){
      const wrapped=function(){
        const title=document.getElementById('quote-title')?.textContent?.trim() || '';
        const location=document.getElementById('modal-location')?.textContent?.trim() || '';
        setContext({inquiry_type:'experience_booking',content_type:'experience',content_id:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),content_title:title,destination:location});
        const form=document.getElementById('booking-form');
        return form ? handleFormSubmit(form) : oldBook.apply(this,arguments);
      }; wrapped.__vlWrapped=true; window.bookExperienceFromModal=wrapped;
    }
  }

  document.addEventListener('submit', function(e){
    const form=e.target;
    if(!form || !['inquiry-form','booking-form','quick-inquiry-form','businessInquiryForm','journey-planner-form','partner-form','insight-subscribe-form'].includes(form.id)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    handleFormSubmit(form);
  }, true);

  document.addEventListener('click', function(e){
    const b=e.target.closest?.('.sector-tag');
    if(b){setTimeout(()=>{b.classList.toggle('is-selected', b.classList.contains('bg-primary'));},0);}
  }, true);

  window.VLInquiry={setContext,clearContext,submit:(formOrId)=>handleFormSubmit(typeof formOrId==='string'?document.getElementById(formOrId):formOrId)};

  document.addEventListener('click', function(e){
    const mode=e.target.closest?.('#mode-travel-btn,#mode-business-btn');
    if(mode){
      setContext({inquiry_type:mode.id==='mode-business-btn'?'business_advisory':'custom_experience',content_type:mode.id==='mode-business-btn'?'business':'travel_request'});
    }
  }, true);

  function boot(){
    ensureNames();
    ['#inquiry-form','#booking-form','#quick-inquiry-form','#businessInquiryForm','#journey-planner-form','#partner-form'].forEach(sel=>{const f=document.querySelector(sel);if(f)addHoneypot(f);});
    const newsletter=document.querySelector('form#insight-subscribe-form');if(newsletter)addHoneypot(newsletter);
    wrapContextFunctions();
    setTimeout(wrapContextFunctions, 250);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

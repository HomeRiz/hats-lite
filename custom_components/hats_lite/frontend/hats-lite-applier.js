function Y(e,t){return t<e.try_until?"trying":t<e.confirm_until?"confirming":"expired"}function G(e,t){let n=Y(e,t);if(n==="expired")return 0;let s=n==="trying"?e.try_until:e.confirm_until;return Math.max(0,Math.ceil(s-t))}function B(e,t){return e-t}function Q(e,t){return t+e}function S(e,t){return e.connection.sendMessagePromise(t)}function V(e,t,n){return e.connection.subscribeMessage(n,t)}var X=[["all","initial"],["display","flex"],["justify-content","center"],["position","fixed"],["left","0"],["right","0"],["bottom","24px"],["top","auto"],["width","fit-content"],["height","auto"],["margin","0 auto"],["padding","0"],["z-index","2147483647"],["visibility","visible"],["opacity","1"],["transform","none"],["translate","none"],["scale","none"],["rotate","none"],["zoom","1"],["filter","none"],["clip-path","none"],["clip","auto"],["mask","none"],["mix-blend-mode","normal"],["isolation","isolate"],["content-visibility","visible"],["pointer-events","auto"],["max-width","none"],["max-height","none"],["overflow","visible"],["contain","none"]],pe=X.map(([e,t])=>`${e}: ${t} !important;`).join(" "),ve=`
:host { ${pe} }
:host::before, :host::after { content: none !important; display: none !important; }
.box {
  pointer-events: auto;
  box-sizing: border-box;
  max-width: calc(100vw - 32px);
  padding: 20px 24px;
  background: #111111;
  color: #ffffff;
  border: 2px solid #ffffff;
  border-radius: 12px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  line-height: 1.4;
  text-align: center;
  text-indent: 0;
  letter-spacing: normal;
  word-spacing: normal;
  text-shadow: none;
  -webkit-text-fill-color: currentcolor;
  text-transform: none;
  white-space: normal;
  writing-mode: horizontal-tb;
  direction: ltr;
}
.title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
}
.countdown {
  margin: 0 0 16px;
  font-size: 20px;
  color: #ffffff;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
button {
  min-width: 120px;
  min-height: 48px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  text-indent: 0;
  letter-spacing: normal;
  word-spacing: normal;
  text-shadow: none;
  -webkit-text-fill-color: currentcolor;
  text-transform: none;
  white-space: normal;
  writing-mode: horizontal-tb;
  direction: ltr;
}
button.keep {
  background: #ffffff;
  color: #111111;
}
button.revert {
  background: #111111;
  color: #ffffff;
}
button:focus-visible {
  outline: 4px solid #ffd400;
  outline-offset: 3px;
}
`,be=["style","hidden","class","popover","inert"];function he(e){return typeof e=="object"&&e!==null&&e.name==="InvalidStateError"}function Z(e){let t=e.trustedOnly??!0,n=null,s=null,r=null,l=null,u=null,c=null,h=!1,y=!1;function w(m,v){t&&!m.isTrusted||v()}function N(){let m=document.createElement("div");m.setAttribute("data-hats-lite-confirm",""),s=m.attachShadow({mode:"closed"});let v=document.createElement("style");v.textContent=ve;let g=document.createElement("div");g.className="box",g.setAttribute("role","alertdialog"),g.setAttribute("aria-label","Keep this theme?");let M=document.createElement("p");M.className="title",M.textContent="Keep this theme?";let b=document.createElement("p");b.className="countdown",b.setAttribute("data-role","countdown"),b.setAttribute("aria-live","polite"),b.setAttribute("aria-atomic","true");let P=document.createElement("div");P.className="actions";let T=document.createElement("button");T.type="button",T.className="keep",T.textContent="Keep",T.addEventListener("click",L=>w(L,()=>e.onKeep()));let O=document.createElement("button");return O.type="button",O.className="revert",O.textContent="Revert",O.addEventListener("click",L=>w(L,()=>e.onRevert())),P.append(T,O),g.append(M,b,P),s.append(v,g),r=b,l=T,m}function A(m){try{return m.matches(":popover-open")}catch{return y}}function x(){if(n){n.removeAttribute("hidden"),n.removeAttribute("class"),n.removeAttribute("inert");for(let[m,v]of X)n.style.setProperty(m,v,"important");if(typeof n.showPopover=="function"&&(n.setAttribute("popover","manual"),!A(n)))try{n.showPopover(),y=!0}catch(m){he(m)||n.removeAttribute("popover")}}}function I(){n&&u?.observe(n,{attributes:!0,attributeFilter:be})}function f(){!h||!n||(u?.disconnect(),x(),I())}function E(){!h||!n||n.parentNode!==document.documentElement&&(u?.disconnect(),e.mount(n),x(),I())}function k(){u=new MutationObserver(f),c=new MutationObserver(E),I(),c.observe(document.documentElement,{childList:!0})}function H(){u?.disconnect(),c?.disconnect(),u=null,c=null}function z(m){n||(n=N()),r&&(r.textContent=m),!h&&(h=!0,e.mount(n),x(),k(),l?.focus())}function D(){if(h=!1,H(),n){try{n.hidePopover?.()}catch{n.removeAttribute("popover")}y=!1,n.remove()}}function C(){return s}return{show:z,hide:D,shadowRoot:C}}var W="hats_lite_pending",ye=["accepted","cancelled","reverted"],ee=["primaryColor","accentColor"];function F(e){if(typeof e!="object"||e===null)return null;let t=e;if(typeof t.theme!="string")return null;let n={theme:t.theme};if(t.dark!==void 0){if(typeof t.dark!="boolean")return null;n.dark=t.dark}for(let s of ee){let r=t[s];if(r!==void 0){if(typeof r!="string")return null;n[s]=r}}return n}function we(e){if(typeof e!="object"||e===null)return null;let t=e;if(typeof t.started_at!="number"||!Number.isFinite(t.started_at))return null;let n=F(t.previous),s=F(t.candidate);return!n||!s?null:{started_at:t.started_at,previous:n,candidate:s}}function $(e){if(typeof e!="object"||e===null)return null;let t=e;if(typeof t.started_at!="number"||!Number.isFinite(t.started_at)||typeof t.outcome!="string"||!ye.includes(t.outcome))return null;let n={started_at:t.started_at,outcome:t.outcome};for(let s of["previous","candidate"]){let r=t[s];if(r===void 0)continue;let l=F(r);if(!l)return null;n[s]=l}return n}function U(){try{let e=window.localStorage.getItem(W);return e===null?null:we(JSON.parse(e))}catch{return null}}function te(e){try{window.localStorage.setItem(W,JSON.stringify(e))}catch{return}}function R(e){try{if(e!==void 0){let t=U();if(t&&t.started_at!==e)return}window.localStorage.removeItem(W)}catch{return}}function J(e,t){return e.theme!==t.theme||typeof e.dark=="boolean"&&typeof t.dark=="boolean"&&e.dark!==t.dark?!1:ee.every(n=>(e[n]??null)===(t[n]??null))}function ge(e){let{pending:t,trial:n,outcome:s,current:r}=e;if(!t||r==null)return"none";if(n){if(n.started_at===t.started_at)return"resume";if(n.started_at>t.started_at)return"clear"}else if(s&&s.outcome==="accepted"&&s.started_at>=t.started_at)return"clear";return J(r,t.candidate)?"revert":"clear"}function ne(e,t,n,s){let r=U(),l=ge({pending:r,trial:e,outcome:$(t),current:n});return r&&l==="revert"&&s(r.previous),r&&(l==="revert"||l==="clear")&&R(r.started_at),l}function q(e){return{dark:void 0,primaryColor:void 0,accentColor:void 0,...e}}function re(e,t){if(e)try{S(e,{type:"hats_lite/outcome_ack",started_at:t}).catch(()=>{})}catch{return}}var oe="hats_lite_handled_outcome";function _e(){try{let e=window.localStorage.getItem(oe);if(e===null)return null;let t=JSON.parse(e);return typeof t=="number"&&Number.isFinite(t)?t:null}catch{return null}}function xe(e){try{window.localStorage.setItem(oe,JSON.stringify(e))}catch{return}}function j(e,t){xe(e),re(t,e)}function ie(e){let t=$(e.outcome);if(!t||_e()===t.started_at||e.current==null)return;let n=U(),s=n!==null&&n.started_at<t.started_at&&t.outcome!=="accepted",r=n!==null&&n.started_at===t.started_at,l=!e.trial&&!r&&t.outcome!=="accepted"&&t.previous!==void 0&&t.candidate!==void 0&&J(e.current,t.candidate);j(t.started_at,e.hass),n&&s&&!e.trial&&R(n.started_at),l&&t.previous&&e.revertTo(t.previous)}var Te=3,Se=5e3,Ee=5,ke=3e3,He=8e3,ae="Home Assistant is not ready",se="Home Assistant did not answer in time",le="disposed";function ue(e){if(typeof e=="object"&&e!==null&&"code"in e)return String(e.code)}function Pe(e,t){let n=`Reverting in ${e} ${e===1?"second":"seconds"}`;return t?`Could not reach Home Assistant. ${n}.`:n}function Oe(e){let t,n=[],s=!1,r=null,l=0,u=0,c=null,h=!1,y=null,w=new Set,N=o=>e.fire("settheme",q(o)),A=new Set,x=null,I=!1,f=!1,E=Z({mount:o=>e.mount(o),onKeep:()=>void T(),onRevert:()=>void P(),trustedOnly:e.trustedOnly??!0});function k(){return t??e.getHass()}function H(o){if(f)return Promise.reject(new Error(le));let i=0,a=()=>{},p=new Promise((d,_)=>{a=_,i=e.setTimer(()=>_(new Error(se)),He),w.add(i),A.add(_)});return Promise.race([o,p]).finally(()=>{A.delete(a),w.delete(i),e.clearTimer(i)})}function z(){let o=k();return o?Promise.resolve(o):s?Promise.reject(new Error(ae)):new Promise((i,a)=>n.push({resolve:i,reject:a}))}function D(o,i){if(f)return;let a=e.setTimer(()=>{w.delete(a),f||o()},i);w.add(a)}function C(){y!==null&&(e.clearTimer(y),y=null)}function m(o){y=e.setTimer(()=>g(!0),Math.max(1,Math.min(1e3,Math.ceil(o))))}function v(){C(),r=null,h=!1,E.hide()}function g(o){if(y=null,f||!r)return;let i=Q(l,e.now()),a=Y(r,i);a==="trying"?(E.hide(),m((r.try_until-i)*1e3)):a==="confirming"?(E.show(Pe(G(r,i),h)),m((r.confirm_until-i)*1e3)):o?P():v()}function M(o,i){C(),r=o,g(i)}async function b(o=!0){let i=k();if(!i||f)return!1;let a=c===u,p=u,d;try{d=await H(S(i,{type:"hats_lite/trial_state"}))}catch{return!1}if(f||a||c===u||u!==p)return!0;let _=e.getHass()?.selectedTheme;return ie({outcome:d.outcome,trial:d.trial,current:_,revertTo:N,hass:i}),ne(d.trial,d.outcome,_,N),d.trial?(l=B(d.now,e.now()),r!==null&&r.started_at===d.trial.started_at||(u+=1),M(d.trial,o),!0):(v(),!0)}async function P(){if(!r||c===u)return;let o=u,i=r.previous,a=r.started_at;c=o,v();try{let p=k(),d=i;if(p)try{d=(await H(S(p,{type:"hats_lite/trial_cancel",started_at:a}))).revert??i,j(a,p)}catch(_){if(ue(_)==="no_trial"){c===o&&(c=null),await K(0);return}}!f&&o===u&&(e.fire("settheme",q(d)),R(a))}finally{c===o&&(c=null)}}async function T(){if(!r||c===u)return;let o=r.started_at,i=k();if(!i)return;let a=u;c=a;try{await H(S(i,{type:"hats_lite/trial_accept",started_at:o})),j(o,i)}catch(p){if(c===a&&(c=null),f||a!==u)return;let d=ue(p);if(d==="too_late"){await P();return}if(d==="no_trial"){await b(!0);return}h=!0,r&&(C(),g(!0)),await b(!0);return}c===a&&(c=null),a===u&&(v(),R(o))}function O(o){f||o.type!=="revert"||!o.selection||r&&typeof o.started_at=="number"&&o.started_at<r.started_at||(u+=1,c=null,v(),N(o.selection),R(typeof o.started_at=="number"?o.started_at:void 0),typeof o.started_at=="number"&&j(o.started_at,k()))}async function L(o,i){try{let a=await V(o,{type:"hats_lite/subscribe"},O);f?a():x=a}catch{i<Te&&D(()=>void L(o,i+1),Se)}}async function K(o){!await b(!0)&&o<Ee&&D(()=>void K(o+1),ke)}function ce(o){if(f)return;t=o;let i=n;n=[],i.forEach(a=>a.resolve(o)),I||(I=!0,K(0),L(o,0))}function de(){s=!0;let o=n;n=[],o.forEach(i=>i.reject(new Error(ae)))}async function fe(o,i){let a=await z(),p;try{p=await H(S(a,{type:"hats_lite/trial_start",previous:o,candidate:i}))}catch(d){if(f)return;if(d instanceof Error&&d.message===se)try{await H(S(a,{type:"hats_lite/trial_cancel"}))}catch{if(f)return}throw d}f||(te({started_at:p.trial.started_at,previous:p.trial.previous,candidate:p.trial.candidate}),l=B(p.trial.started_at,e.now()),u+=1,h=!1,M(p.trial,!0),e.fire("settheme",i))}function me(){f=!0,C(),w.forEach(i=>e.clearTimer(i)),w.clear();let o=Array.from(A);A.clear(),o.forEach(i=>i(new Error(le))),r=null,E.hide(),n=[],x&&(x(),x=null)}return{onHass:ce,dispose:me,startTrial:fe,refresh:b,markUnavailable:de,overlayRoot:()=>E.shadowRoot()}}function Re(){let e=null,t=Oe({getHass:()=>(e=e??document.querySelector("home-assistant"),e?.hass),fire:(r,l)=>{(e??document.querySelector("home-assistant")??document).dispatchEvent(new CustomEvent(r,{detail:l,bubbles:!0,composed:!0}))},now:()=>Date.now()/1e3,mount:r=>{document.documentElement.appendChild(r)},setTimer:(r,l)=>window.setTimeout(r,l),clearTimer:r=>window.clearTimeout(r)});window.hatsLite={startTrial:(r,l)=>t.startTrial(r,l)};let n=0,s=()=>{let r=e??document.querySelector("home-assistant");if(r&&(e=r),r?.hass){t.onHass(r.hass);return}n+=1,n<240?window.setTimeout(s,500):t.markUnavailable()};s()}Re();export{Oe as createApplier};

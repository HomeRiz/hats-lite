function $(e,t){return t<e.try_until?"trying":t<e.confirm_until?"confirming":"expired"}function te(e,t){let n=$(e,t);if(n==="expired")return 0;let s=n==="trying"?e.try_until:e.confirm_until;return Math.max(0,Math.ceil(s-t))}function V(e,t){return e-t}function ne(e,t){return t+e}function P(e,t){return e.connection.sendMessagePromise(t)}function re(e,t,n){return e.connection.subscribeMessage(n,t)}function J(e){let t=[],n=!1,s=null;function o(){let d=Date.now();t.push(d);let l=0;for(;l<t.length&&t[l]<=d-1e3;)l+=1;if(t.length-l>200&&(l=t.length-200),l>0&&(t=t.slice(l)),t.length>50?n=!0:n&&t.length<=50/5&&(n=!1),!n){e();return}s===null&&(s=setTimeout(()=>{s=null,e()},250))}function f(){s!==null&&clearTimeout(s),s=null,t=[],n=!1}return{trigger:o,cancel:f}}var oe=[["all","initial"],["display","flex"],["justify-content","center"],["position","fixed"],["left","0"],["right","0"],["bottom","24px"],["top","auto"],["width","fit-content"],["height","auto"],["margin","0 auto"],["padding","0"],["z-index","2147483647"],["visibility","visible"],["opacity","1"],["transform","none"],["translate","none"],["scale","none"],["rotate","none"],["zoom","1"],["filter","none"],["clip-path","none"],["clip","auto"],["mask","none"],["mix-blend-mode","normal"],["isolation","isolate"],["content-visibility","visible"],["pointer-events","auto"],["max-width","none"],["max-height","none"],["overflow","visible"],["contain","none"]],be=oe.map(([e,t])=>`${e}: ${t} !important;`).join(" "),he=`
:host { ${be} }
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
`,ye=["style","hidden","class","popover","inert"],ge=["style","class"],we=["opacity","filter","transform","zoom"],Te=Element.prototype.attachShadow;function Se(e){return typeof e=="object"&&e!==null&&e.name==="InvalidStateError"}function ie(e){let t=e.trustedOnly??!0,n=null,s=null,o=null,f=null,d=null,l=null,_=null,w=null,y=new Map,h=!1,g=!1,T=J(C),A=J(U);function v(u,m){t&&!u.isTrusted||m()}function O(){let u=document.createElement("div");u.setAttribute("data-hats-lite-confirm",""),s=Te.call(u,{mode:"closed"});let m=document.createElement("style");m.textContent=he;let r=document.createElement("div");r.className="box",r.setAttribute("role","alertdialog"),r.setAttribute("aria-label","Keep this theme?");let i=document.createElement("p");i.className="title",i.textContent="Keep this theme?";let a=document.createElement("p");a.className="countdown",a.setAttribute("data-role","countdown"),a.setAttribute("aria-live","polite"),a.setAttribute("aria-atomic","true");let p=document.createElement("div");p.className="actions";let c=document.createElement("button");c.type="button",c.className="keep",c.textContent="Keep",c.addEventListener("click",W=>v(W,()=>e.onKeep()));let b=document.createElement("button");return b.type="button",b.className="revert",b.textContent="Revert",b.addEventListener("click",W=>v(W,()=>e.onRevert())),p.append(c,b),r.append(i,a,p),s.append(m,r),o=a,f=c,u}function E(u){try{return u.matches(":popover-open")}catch{return g}}function S(){if(n){n.removeAttribute("hidden"),n.removeAttribute("class"),n.removeAttribute("inert");for(let[u,m]of oe)n.style.setProperty(u,m,"important");if(typeof n.showPopover=="function"&&(n.setAttribute("popover","manual"),!E(n)))try{n.showPopover(),g=!0}catch(u){Se(u)||n.removeAttribute("popover")}}}function M(){n&&d?.observe(n,{attributes:!0,attributeFilter:ye})}function j(){!h||!n||(d?.disconnect(),S(),M())}function I(){!h||!n||n.parentNode!==document.documentElement&&(d?.disconnect(),e.mount(n),S(),M())}function L(){let u=document.documentElement.style;for(let m of we){let r=u.getPropertyValue(m);r!==""&&(y.has(m)||y.set(m,{value:r,priority:u.getPropertyPriority(m)}),u.removeProperty(m))}}function k(){let u=document.documentElement.style;for(let[m,r]of y)u.setProperty(m,r.value,r.priority);y.clear()}function C(){!h||!n||(I(),j(),L())}function U(){if(!(!h||!n||typeof n.showPopover!="function")){d?.disconnect();try{n.hidePopover?.()}catch{g=!1}g=!1,S(),M()}}function H(u){if(!h||!n)return;u.newState==="closed"&&(g=!1),E(n)||T.trigger()}function x(u){!h||!n||u.target===n||typeof n.showPopover=="function"&&A.trigger()}function K(u){if(!(!h||!n||typeof n.showPopover!="function"))for(let m of u){let r=m.target;if(!(r.localName!=="dialog"||m.oldValue!==null)&&r.hasAttribute("open")){A.trigger();return}}}function F(){d=new MutationObserver(()=>T.trigger()),l=new MutationObserver(()=>T.trigger()),_=new MutationObserver(()=>T.trigger()),w=new MutationObserver(K),w.observe(document.documentElement,{attributes:!0,attributeFilter:["open"],attributeOldValue:!0,subtree:!0}),M(),l.observe(document.documentElement,{childList:!0}),n?.addEventListener("toggle",H),document.addEventListener("toggle",x,!0),document.addEventListener("close",x,!0),L(),_.observe(document.documentElement,{attributes:!0,attributeFilter:ge})}function z(){d?.disconnect(),l?.disconnect(),_?.disconnect(),w?.disconnect(),w=null,d=null,l=null,_=null,T.cancel(),A.cancel(),n?.removeEventListener("toggle",H),document.removeEventListener("toggle",x,!0),document.removeEventListener("close",x,!0),k()}function N(u){n||(n=O()),o&&(o.textContent=u),!h&&(h=!0,e.mount(n),S(),F(),f?.focus())}function G(){if(h=!1,z(),n){try{n.hidePopover?.()}catch{n.removeAttribute("popover")}g=!1,n.remove()}}function Y(){return s}return{show:N,hide:G,shadowRoot:Y}}var X="hats_lite_pending",_e=["accepted","cancelled","reverted"],ae=["primaryColor","accentColor"];function q(e){if(typeof e!="object"||e===null)return null;let t=e;if(typeof t.theme!="string")return null;let n={theme:t.theme};if(t.dark!==void 0){if(typeof t.dark!="boolean")return null;n.dark=t.dark}for(let s of ae){let o=t[s];if(o!==void 0){if(typeof o!="string")return null;n[s]=o}}return n}function Ee(e){if(typeof e!="object"||e===null)return null;let t=e;if(typeof t.started_at!="number"||!Number.isFinite(t.started_at))return null;let n=q(t.previous),s=q(t.candidate);return!n||!s?null:{started_at:t.started_at,previous:n,candidate:s}}function Q(e){if(typeof e!="object"||e===null)return null;let t=e;if(typeof t.started_at!="number"||!Number.isFinite(t.started_at)||typeof t.outcome!="string"||!_e.includes(t.outcome))return null;let n={started_at:t.started_at,outcome:t.outcome};for(let s of["previous","candidate"]){let o=t[s];if(o===void 0)continue;let f=q(o);if(!f)return null;n[s]=f}return n}function B(){try{let e=window.localStorage.getItem(X);return e===null?null:Ee(JSON.parse(e))}catch{return null}}function se(e){try{window.localStorage.setItem(X,JSON.stringify(e))}catch{return}}function R(e){try{if(e!==void 0){let t=B();if(t&&t.started_at!==e)return}window.localStorage.removeItem(X)}catch{return}}function Z(e,t){return e.theme!==t.theme||typeof e.dark=="boolean"&&typeof t.dark=="boolean"&&e.dark!==t.dark?!1:ae.every(n=>(e[n]??null)===(t[n]??null))}function xe(e){let{pending:t,trial:n,outcome:s,current:o}=e;if(!t||o==null)return"none";if(n){if(n.started_at===t.started_at)return"resume";if(n.started_at>t.started_at)return"clear"}else if(s&&s.outcome==="accepted"&&s.started_at>=t.started_at)return"clear";return Z(o,t.candidate)?"revert":"clear"}function le(e,t,n,s){let o=B(),f=xe({pending:o,trial:e,outcome:Q(t),current:n});return o&&f==="revert"&&s(o.previous),o&&(f==="revert"||f==="clear")&&R(o.started_at),f}function ee(e){return{dark:void 0,primaryColor:void 0,accentColor:void 0,...e}}function ue(e,t){if(e)try{P(e,{type:"hats_lite/outcome_ack",started_at:t}).catch(()=>{})}catch{return}}var ce="hats_lite_handled_outcome";function Pe(){try{let e=window.localStorage.getItem(ce);if(e===null)return null;let t=JSON.parse(e);return typeof t=="number"&&Number.isFinite(t)?t:null}catch{return null}}function Oe(e){try{window.localStorage.setItem(ce,JSON.stringify(e))}catch{return}}function D(e,t){Oe(e),ue(t,e)}function de(e){let t=Q(e.outcome);if(!t||Pe()===t.started_at||e.current==null)return;let n=B(),s=n!==null&&n.started_at<t.started_at&&t.outcome!=="accepted",o=n!==null&&n.started_at===t.started_at,f=!e.trial&&!o&&t.outcome!=="accepted"&&t.previous!==void 0&&t.candidate!==void 0&&Z(e.current,t.candidate);D(t.started_at,e.hass),n&&s&&!e.trial&&R(n.started_at),f&&t.previous&&e.revertTo(t.previous)}var ke=3,He=5e3,Re=5,Ae=3e3,Me=8e3,fe="Home Assistant is not ready",me="Home Assistant did not answer in time",pe="disposed";function ve(e){if(typeof e=="object"&&e!==null&&"code"in e)return String(e.code)}function Ie(e,t){let n=`Reverting in ${e} ${e===1?"second":"seconds"}`;return t?`Could not reach Home Assistant. ${n}.`:n}function Le(e){let t,n=[],s=!1,o=null,f=0,d=0,l=null,_=!1,w=null,y=new Set,h=r=>e.fire("settheme",ee(r)),g=new Set,T=null,A=!1,v=!1,O=ie({mount:r=>e.mount(r),onKeep:()=>void K(),onRevert:()=>void x(),trustedOnly:e.trustedOnly??!0});function E(){return t??e.getHass()}function S(r){if(v)return Promise.reject(new Error(pe));let i=0,a=()=>{},p=new Promise((c,b)=>{a=b,i=e.setTimer(()=>b(new Error(me)),Me),y.add(i),g.add(b)});return Promise.race([r,p]).finally(()=>{g.delete(a),y.delete(i),e.clearTimer(i)})}function M(){let r=E();return r?Promise.resolve(r):s?Promise.reject(new Error(fe)):new Promise((i,a)=>n.push({resolve:i,reject:a}))}function j(r,i){if(v)return;let a=e.setTimer(()=>{y.delete(a),v||r()},i);y.add(a)}function I(){w!==null&&(e.clearTimer(w),w=null)}function L(r){w=e.setTimer(()=>C(!0),Math.max(1,Math.min(1e3,Math.ceil(r))))}function k(){I(),o=null,_=!1,O.hide()}function C(r){if(w=null,v||!o)return;let i=ne(f,e.now()),a=$(o,i);a==="trying"?(O.hide(),L((o.try_until-i)*1e3)):a==="confirming"?(O.show(Ie(te(o,i),_)),L((o.confirm_until-i)*1e3)):r?x():k()}function U(r,i){I(),o=r,C(i)}async function H(r=!0){let i=E();if(!i||v)return!1;let a=l===d,p=d,c;try{c=await S(P(i,{type:"hats_lite/trial_state"}))}catch{return!1}if(v||a||l===d||d!==p)return!0;let b=e.getHass()?.selectedTheme;return de({outcome:c.outcome,trial:c.trial,current:b,revertTo:h,hass:i}),le(c.trial,c.outcome,b,h),c.trial?(f=V(c.now,e.now()),o!==null&&o.started_at===c.trial.started_at||(d+=1),U(c.trial,r),!0):(k(),!0)}async function x(){if(!o||l===d)return;let r=d,i=o.previous,a=o.started_at;l=r,k();try{let p=E(),c=i;if(p)try{c=(await S(P(p,{type:"hats_lite/trial_cancel",started_at:a}))).revert??i,D(a,p)}catch(b){if(ve(b)==="no_trial"){l===r&&(l=null),await N(0);return}}!v&&r===d&&(e.fire("settheme",ee(c)),R(a))}finally{l===r&&(l=null)}}async function K(){if(!o||l===d)return;let r=o.started_at,i=E();if(!i)return;let a=d;l=a;try{await S(P(i,{type:"hats_lite/trial_accept",started_at:r})),D(r,i)}catch(p){if(l===a&&(l=null),v||a!==d)return;let c=ve(p);if(c==="too_late"){await x();return}if(c==="no_trial"){await H(!0);return}_=!0,o&&(I(),C(!0)),await H(!0);return}l===a&&(l=null),a===d&&(k(),R(r))}function F(r){v||r.type!=="revert"||!r.selection||o&&typeof r.started_at=="number"&&r.started_at<o.started_at||(d+=1,l=null,k(),h(r.selection),R(typeof r.started_at=="number"?r.started_at:void 0),typeof r.started_at=="number"&&D(r.started_at,E()))}async function z(r,i){try{let a=await re(r,{type:"hats_lite/subscribe"},F);v?a():T=a}catch{i<ke&&j(()=>void z(r,i+1),He)}}async function N(r){!await H(!0)&&r<Re&&j(()=>void N(r+1),Ae)}function G(r){if(v)return;t=r;let i=n;n=[],i.forEach(a=>a.resolve(r)),A||(A=!0,N(0),z(r,0))}function Y(){s=!0;let r=n;n=[],r.forEach(i=>i.reject(new Error(fe)))}async function u(r,i){let a=await M(),p;try{p=await S(P(a,{type:"hats_lite/trial_start",previous:r,candidate:i}))}catch(c){if(v)return;if(c instanceof Error&&c.message===me)try{await S(P(a,{type:"hats_lite/trial_cancel"}))}catch{if(v)return}throw c}v||(se({started_at:p.trial.started_at,previous:p.trial.previous,candidate:p.trial.candidate}),f=V(p.trial.started_at,e.now()),d+=1,_=!1,U(p.trial,!0),e.fire("settheme",i))}function m(){v=!0,I(),y.forEach(i=>e.clearTimer(i)),y.clear();let r=Array.from(g);g.clear(),r.forEach(i=>i(new Error(pe))),o=null,O.hide(),n=[],T&&(T(),T=null)}return{onHass:G,dispose:m,startTrial:u,refresh:H,markUnavailable:Y,overlayRoot:()=>O.shadowRoot()}}function Ce(){let e=null,t=Le({getHass:()=>(e=e??document.querySelector("home-assistant"),e?.hass),fire:(o,f)=>{(e??document.querySelector("home-assistant")??document).dispatchEvent(new CustomEvent(o,{detail:f,bubbles:!0,composed:!0}))},now:()=>Date.now()/1e3,mount:o=>{document.documentElement.appendChild(o)},setTimer:(o,f)=>window.setTimeout(o,f),clearTimer:o=>window.clearTimeout(o)});window.hatsLite={startTrial:(o,f)=>t.startTrial(o,f)};let n=0,s=()=>{let o=e??document.querySelector("home-assistant");if(o&&(e=o),o?.hass){t.onHass(o.hass);return}n+=1,n<240?window.setTimeout(s,500):t.markUnavailable()};s()}Ce();export{Le as createApplier};

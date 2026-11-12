var Yt=globalThis,Zt=Yt.ShadowRoot&&(Yt.ShadyCSS===void 0||Yt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,kr=Symbol(),Ks=new WeakMap,gt=class{constructor(n,t,r){if(this._$cssResult$=!0,r!==kr)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=n,this.t=t}get styleSheet(){let n=this.o,t=this.t;if(Zt&&n===void 0){let r=t!==void 0&&t.length===1;r&&(n=Ks.get(t)),n===void 0&&((this.o=n=new CSSStyleSheet).replaceSync(this.cssText),r&&Ks.set(t,n))}return n}toString(){return this.cssText}},Jt=e=>new gt(typeof e=="string"?e:e+"",void 0,kr),T=(e,...n)=>{let t=e.length===1?e[0]:n.reduce((r,o,s)=>r+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[s+1],e[0]);return new gt(t,e,kr)},Vs=(e,n)=>{if(Zt)e.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of n){let r=document.createElement("style"),o=Yt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=t.cssText,e.appendChild(r)}},$r=Zt?e=>e:e=>e instanceof CSSStyleSheet?(n=>{let t="";for(let r of n.cssRules)t+=r.cssText;return Jt(t)})(e):e;var{is:Fp,defineProperty:Bp,getOwnPropertyDescriptor:Up,getOwnPropertyNames:jp,getOwnPropertySymbols:zp,getPrototypeOf:Kp}=Object,Qt=globalThis,Ws=Qt.trustedTypes,Vp=Ws?Ws.emptyScript:"",Wp=Qt.reactiveElementPolyfillSupport,bt=(e,n)=>e,Er={toAttribute(e,n){switch(n){case Boolean:e=e?Vp:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,n){let t=e;switch(n){case Boolean:t=e!==null;break;case Number:t=e===null?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch{t=null}}return t}},Gs=(e,n)=>!Fp(e,n),qs={attribute:!0,type:String,converter:Er,reflect:!1,useDefault:!1,hasChanged:Gs};Symbol.metadata??=Symbol("metadata"),Qt.litPropertyMetadata??=new WeakMap;var de=class extends HTMLElement{static addInitializer(n){this._$Ei(),(this.l??=[]).push(n)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(n,t=qs){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(n)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(n,t),!t.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(n,r,t);o!==void 0&&Bp(this.prototype,n,o)}}static getPropertyDescriptor(n,t,r){let{get:o,set:s}=Up(this.prototype,n)??{get(){return this[t]},set(i){this[t]=i}};return{get:o,set(i){let a=o?.call(this);s?.call(this,i),this.requestUpdate(n,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(n){return this.elementProperties.get(n)??qs}static _$Ei(){if(this.hasOwnProperty(bt("elementProperties")))return;let n=Kp(this);n.finalize(),n.l!==void 0&&(this.l=[...n.l]),this.elementProperties=new Map(n.elementProperties)}static finalize(){if(this.hasOwnProperty(bt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(bt("properties"))){let t=this.properties,r=[...jp(t),...zp(t)];for(let o of r)this.createProperty(o,t[o])}let n=this[Symbol.metadata];if(n!==null){let t=litPropertyMetadata.get(n);if(t!==void 0)for(let[r,o]of t)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let o=this._$Eu(t,r);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(n){let t=[];if(Array.isArray(n)){let r=new Set(n.flat(1/0).reverse());for(let o of r)t.unshift($r(o))}else n!==void 0&&t.push($r(n));return t}static _$Eu(n,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof n=="string"?n.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(n=>n(this))}addController(n){(this._$EO??=new Set).add(n),this.renderRoot!==void 0&&this.isConnected&&n.hostConnected?.()}removeController(n){this._$EO?.delete(n)}_$E_(){let n=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(n.set(r,this[r]),delete this[r]);n.size>0&&(this._$Ep=n)}createRenderRoot(){let n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Vs(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(n=>n.hostConnected?.())}enableUpdating(n){}disconnectedCallback(){this._$EO?.forEach(n=>n.hostDisconnected?.())}attributeChangedCallback(n,t,r){this._$AK(n,r)}_$ET(n,t){let r=this.constructor.elementProperties.get(n),o=this.constructor._$Eu(n,r);if(o!==void 0&&r.reflect===!0){let s=(r.converter?.toAttribute!==void 0?r.converter:Er).toAttribute(t,r.type);this._$Em=n,s==null?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(n,t){let r=this.constructor,o=r._$Eh.get(n);if(o!==void 0&&this._$Em!==o){let s=r.getPropertyOptions(o),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Er;this._$Em=o;let a=i.fromAttribute(t,s.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(n,t,r,o=!1,s){if(n!==void 0){let i=this.constructor;if(o===!1&&(s=this[n]),r??=i.getPropertyOptions(n),!((r.hasChanged??Gs)(s,t)||r.useDefault&&r.reflect&&s===this._$Ej?.get(n)&&!this.hasAttribute(i._$Eu(n,r))))return;this.C(n,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(n,t,{useDefault:r,reflect:o,wrapped:s},i){r&&!(this._$Ej??=new Map).has(n)&&(this._$Ej.set(n,i??t??this[n]),s!==!0||i!==void 0)||(this._$AL.has(n)||(this.hasUpdated||r||(t=void 0),this._$AL.set(n,t)),o===!0&&this._$Em!==n&&(this._$Eq??=new Set).add(n))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let n=this.scheduleUpdate();return n!=null&&await n,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,s]of this._$Ep)this[o]=s;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,s]of r){let{wrapped:i}=s,a=this[o];i!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,s,a)}}let n=!1,t=this._$AL;try{n=this.shouldUpdate(t),n?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw n=!1,this._$EM(),r}n&&this._$AE(t)}willUpdate(n){}_$AE(n){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(n)),this.updated(n)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(n){return!0}update(n){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(n){}firstUpdated(n){}};de.elementStyles=[],de.shadowRootOptions={mode:"open"},de[bt("elementProperties")]=new Map,de[bt("finalized")]=new Map,Wp?.({ReactiveElement:de}),(Qt.reactiveElementVersions??=[]).push("2.1.2");var Pr=globalThis,Xs=e=>e,en=Pr.trustedTypes,Ys=en?en.createPolicy("lit-html",{createHTML:e=>e}):void 0,ni="$lit$",be=`lit$${Math.random().toFixed(9).slice(2)}$`,ri="?"+be,qp=`<${ri}>`,Le=document,vt=()=>Le.createComment(""),wt=e=>e===null||typeof e!="object"&&typeof e!="function",Rr=Array.isArray,Gp=e=>Rr(e)||typeof e?.[Symbol.iterator]=="function",Tr=`[ 	
\f\r]`,yt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Zs=/-->/g,Js=/>/g,Re=RegExp(`>|${Tr}(?:([^\\s"'>=/]+)(${Tr}*=${Tr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Qs=/'/g,ei=/"/g,oi=/^(?:script|style|textarea|title)$/i,Dr=e=>(n,...t)=>({_$litType$:e,strings:n,values:t}),l=Dr(1),si=Dr(2),yv=Dr(3),ce=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ti=new WeakMap,De=Le.createTreeWalker(Le,129);function ii(e,n){if(!Rr(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ys!==void 0?Ys.createHTML(n):n}var Xp=(e,n)=>{let t=e.length-1,r=[],o,s=n===2?"<svg>":n===3?"<math>":"",i=yt;for(let a=0;a<t;a++){let d=e[a],c,h,p=-1,g=0;for(;g<d.length&&(i.lastIndex=g,h=i.exec(d),h!==null);)g=i.lastIndex,i===yt?h[1]==="!--"?i=Zs:h[1]!==void 0?i=Js:h[2]!==void 0?(oi.test(h[2])&&(o=RegExp("</"+h[2],"g")),i=Re):h[3]!==void 0&&(i=Re):i===Re?h[0]===">"?(i=o??yt,p=-1):h[1]===void 0?p=-2:(p=i.lastIndex-h[2].length,c=h[1],i=h[3]===void 0?Re:h[3]==='"'?ei:Qs):i===ei||i===Qs?i=Re:i===Zs||i===Js?i=yt:(i=Re,o=void 0);let y=i===Re&&e[a+1].startsWith("/>")?" ":"";s+=i===yt?d+qp:p>=0?(r.push(c),d.slice(0,p)+ni+d.slice(p)+be+y):d+be+(p===-2?a:y)}return[ii(e,s+(e[t]||"<?>")+(n===2?"</svg>":n===3?"</math>":"")),r]},xt=class e{constructor({strings:n,_$litType$:t},r){let o;this.parts=[];let s=0,i=0,a=n.length-1,d=this.parts,[c,h]=Xp(n,t);if(this.el=e.createElement(c,r),De.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(o=De.nextNode())!==null&&d.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let p of o.getAttributeNames())if(p.endsWith(ni)){let g=h[i++],y=o.getAttribute(p).split(be),E=/([.?@])?(.*)/.exec(g);d.push({type:1,index:s,name:E[2],strings:y,ctor:E[1]==="."?Sr:E[1]==="?"?Mr:E[1]==="@"?Ar:We}),o.removeAttribute(p)}else p.startsWith(be)&&(d.push({type:6,index:s}),o.removeAttribute(p));if(oi.test(o.tagName)){let p=o.textContent.split(be),g=p.length-1;if(g>0){o.textContent=en?en.emptyScript:"";for(let y=0;y<g;y++)o.append(p[y],vt()),De.nextNode(),d.push({type:2,index:++s});o.append(p[g],vt())}}}else if(o.nodeType===8)if(o.data===ri)d.push({type:2,index:s});else{let p=-1;for(;(p=o.data.indexOf(be,p+1))!==-1;)d.push({type:7,index:s}),p+=be.length-1}s++}}static createElement(n,t){let r=Le.createElement("template");return r.innerHTML=n,r}};function Ve(e,n,t=e,r){if(n===ce)return n;let o=r!==void 0?t._$Co?.[r]:t._$Cl,s=wt(n)?void 0:n._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),s===void 0?o=void 0:(o=new s(e),o._$AT(e,t,r)),r!==void 0?(t._$Co??=[])[r]=o:t._$Cl=o),o!==void 0&&(n=Ve(e,o._$AS(e,n.values),o,r)),n}var _r=class{constructor(n,t){this._$AV=[],this._$AN=void 0,this._$AD=n,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(n){let{el:{content:t},parts:r}=this._$AD,o=(n?.creationScope??Le).importNode(t,!0);De.currentNode=o;let s=De.nextNode(),i=0,a=0,d=r[0];for(;d!==void 0;){if(i===d.index){let c;d.type===2?c=new kt(s,s.nextSibling,this,n):d.type===1?c=new d.ctor(s,d.name,d.strings,this,n):d.type===6&&(c=new Cr(s,this,n)),this._$AV.push(c),d=r[++a]}i!==d?.index&&(s=De.nextNode(),i++)}return De.currentNode=Le,o}p(n){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(n,r,t),t+=r.strings.length-2):r._$AI(n[t])),t++}},kt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(n,t,r,o){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=n,this._$AB=t,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let n=this._$AA.parentNode,t=this._$AM;return t!==void 0&&n?.nodeType===11&&(n=t.parentNode),n}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(n,t=this){n=Ve(this,n,t),wt(n)?n===u||n==null||n===""?(this._$AH!==u&&this._$AR(),this._$AH=u):n!==this._$AH&&n!==ce&&this._(n):n._$litType$!==void 0?this.$(n):n.nodeType!==void 0?this.T(n):Gp(n)?this.k(n):this._(n)}O(n){return this._$AA.parentNode.insertBefore(n,this._$AB)}T(n){this._$AH!==n&&(this._$AR(),this._$AH=this.O(n))}_(n){this._$AH!==u&&wt(this._$AH)?this._$AA.nextSibling.data=n:this.T(Le.createTextNode(n)),this._$AH=n}$(n){let{values:t,_$litType$:r}=n,o=typeof r=="number"?this._$AC(n):(r.el===void 0&&(r.el=xt.createElement(ii(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(t);else{let s=new _r(o,this),i=s.u(this.options);s.p(t),this.T(i),this._$AH=s}}_$AC(n){let t=ti.get(n.strings);return t===void 0&&ti.set(n.strings,t=new xt(n)),t}k(n){Rr(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,o=0;for(let s of n)o===t.length?t.push(r=new e(this.O(vt()),this.O(vt()),this,this.options)):r=t[o],r._$AI(s),o++;o<t.length&&(this._$AR(r&&r._$AB.nextSibling,o),t.length=o)}_$AR(n=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);n!==this._$AB;){let r=Xs(n).nextSibling;Xs(n).remove(),n=r}}setConnected(n){this._$AM===void 0&&(this._$Cv=n,this._$AP?.(n))}},We=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(n,t,r,o,s){this.type=1,this._$AH=u,this._$AN=void 0,this.element=n,this.name=t,this._$AM=o,this.options=s,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=u}_$AI(n,t=this,r,o){let s=this.strings,i=!1;if(s===void 0)n=Ve(this,n,t,0),i=!wt(n)||n!==this._$AH&&n!==ce,i&&(this._$AH=n);else{let a=n,d,c;for(n=s[0],d=0;d<s.length-1;d++)c=Ve(this,a[r+d],t,d),c===ce&&(c=this._$AH[d]),i||=!wt(c)||c!==this._$AH[d],c===u?n=u:n!==u&&(n+=(c??"")+s[d+1]),this._$AH[d]=c}i&&!o&&this.j(n)}j(n){n===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,n??"")}},Sr=class extends We{constructor(){super(...arguments),this.type=3}j(n){this.element[this.name]=n===u?void 0:n}},Mr=class extends We{constructor(){super(...arguments),this.type=4}j(n){this.element.toggleAttribute(this.name,!!n&&n!==u)}},Ar=class extends We{constructor(n,t,r,o,s){super(n,t,r,o,s),this.type=5}_$AI(n,t=this){if((n=Ve(this,n,t,0)??u)===ce)return;let r=this._$AH,o=n===u&&r!==u||n.capture!==r.capture||n.once!==r.once||n.passive!==r.passive,s=n!==u&&(r===u||o);o&&this.element.removeEventListener(this.name,this,r),s&&this.element.addEventListener(this.name,this,n),this._$AH=n}handleEvent(n){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,n):this._$AH.handleEvent(n)}},Cr=class{constructor(n,t,r){this.element=n,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(n){Ve(this,n)}};var Yp=Pr.litHtmlPolyfillSupport;Yp?.(xt,kt),(Pr.litHtmlVersions??=[]).push("3.3.3");var ai=(e,n,t)=>{let r=t?.renderBefore??n,o=r._$litPart$;if(o===void 0){let s=t?.renderBefore??null;r._$litPart$=o=new kt(n.insertBefore(vt(),s),s,void 0,t??{})}return o._$AI(e),o};var Lr=globalThis,M=class extends de{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let n=super.createRenderRoot();return this.renderOptions.renderBefore??=n.firstChild,n}update(n){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(n),this._$Do=ai(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ce}};M._$litElement$=!0,M.finalized=!0,Lr.litElementHydrateSupport?.({LitElement:M});var Zp=Lr.litElementPolyfillSupport;Zp?.({LitElement:M});(Lr.litElementVersions??=[]).push("4.2.2");function P(e,n){return e.connection.sendMessagePromise(n)}var li="hats-lite-theme-selected",di="hats-lite-theme-saved",ci="hats-lite-mode-change",Or="hats_lite_catalog",Ir="/api/hats_lite/background";var ui=["image/png","image/jpeg","image/webp","image/gif"];var b={title:"Themes",searchLabel:"Search themes",searchPlaceholder:"Search themes",loading:"Loading themes...",loadError:"Could not load the theme list.",cachedNote:"Showing the saved list from your last successful load.",noThemes:"No themes available.",retry:"Try again",previewsLoading:"Loading previews",apply:"Apply",noMatches:"No themes match your search.",noFilterMatches:"No themes match this filter yet. Previews load as you scroll.",installed:"Installed",inUse:"In use",otherCopy:"Other copy installed",licenseUnknown:"License unknown to HATS Lite",licenseShort:"License unknown",licenseKnown:"License detected when the thumbnails were built",starsLabel:"Stars",starGlyph:"★",themeErrorDefault:"Could not open this theme. Try again.",preview:"Preview",defaultName:"Home Assistant",defaultDescription:"The standard Home Assistant look",openPreview:"Open preview of",filterLabel:"Filter themes",filterAll:"All",filterInstalled:"Installed",filterDark:"Dark",filterLight:"Light",filterGlass:"Glass",thumbUnavailable:"Preview not available",thumbRateLimited:"Rate limited, try again later",thumbLoading:"Loading preview",thumbRoom:"Living room thermostat",thumbTemp:"20.5 °C",thumbHeating:"Heating to 21",thumbEnergy:"Energy today",thumbGarage:"Garage door",thumbClosed:"Closed",thumbLocked:"Locked since 18:30",thumbLights:"Lights and doors",thumbLight:"Living room light",thumbDoor:"Front door",thumbPorch:"Porch timer",thumbGreeting:"Good evening",thumbSunset:"Sunset 18:42",thumbChipLight:"Light on",thumbChipFan:"Fan on",thumbChipHeat:"Heat"};function hi(e){if(!e||typeof e!="object")return null;let n=e;return typeof n.full_name!="string"?null:{full_name:n.full_name,description:typeof n.description=="string"?n.description:"",stars:typeof n.stars=="number"?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"?n.hacs_id:null}}function Hr(e){return Array.isArray(e)?e.flatMap(n=>{let t=hi(n);return t?[t]:[]}):[]}function mi(){try{let e=localStorage.getItem(Or);if(e===null)return null;let n=JSON.parse(e);return!Array.isArray(n)||!n.every(t=>hi(t)!==null)?null:Hr(n)}catch{return null}}function fi(e){try{localStorage.setItem(Or,JSON.stringify(e))}catch{return}}function gi(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function bi(e){if(e&&typeof e=="object"&&"message"in e){let n=e.message;if(typeof n=="string"&&n)return n}return b.themeErrorDefault}function yi(e,n){return e.full_name.toLowerCase().includes(n)||e.description.toLowerCase().includes(n)}var Jp=new Set(["invalid_theme","theme_too_large","not_found","invalid_request","not_in_catalog"]);function pi(e,n){if(!e||typeof e!="object"||!(n in e))return"";let t=e[n];return typeof t=="string"?t:""}function tn(e){let n=pi(e,"code");return Jp.has(n)?"permanent":n==="rate_limited"||/\bstatus (403|429)\b/.test(pi(e,"message"))?"limited":"transient"}var Qp=/^[A-Za-z0-9_-]+$/,eh=/[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i,th=/['"]/,nh=["lovelace-background","background-image"];function Z(e,n){return{...e.vars,...e.modes?.[n]??{}}}function rh(e){return Qp.test(e)?!e.startsWith("card-mod-")&&!e.startsWith("uix-"):!1}function oh(e,n){return typeof n!="string"||eh.test(n)?!1:!th.test(n)||nh.includes(e)}function sh(e){return Object.entries(e).filter(([n,t])=>rh(n)&&oh(n,t))}var ih=["lovelace-background","background-image"],ah=/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi,lh=/(^|[\s,/)])fixed(?=$|[\s,/(])/gi,dh=/^\s*(?:(?:fixed|scroll|local)\s*(?:,\s*|$))+$/i;function vi(e){return e.replace(lh,"$1scroll")}function ch(e){let n="",t=0;for(let r of e.matchAll(ah)){let o=r.index??0;n+=vi(e.slice(t,o))+r[0],t=o+r[0].length}return n+vi(e.slice(t))}function uh(e,n){return ih.includes(e)||/url\(/i.test(n)||dh.test(n)?ch(n):n}function $t(e,n){for(let[t,r]of sh(n))e.style.setProperty(`--${t}`,uh(t,r))}var f={title:"Theme preview",dashboard:"Dashboard",defaultDashboard:"Overview",view:"View",device:"Device",desktop:"Desktop",tablet:"Tablet",phone:"Phone",density:"Density",normal:"Normal",compact:"Compact",mode:"Mode",dark:"Dark",light:"Light",current:"Current",candidate:"Candidate",sheet:"Preview options",divider:"Drag to compare current and candidate",splitAt:"Split at {percent} percent",apply:"Apply",navGroup:"Browse themes",navPrev:"Previous theme",navNext:"Next theme",navCount:"{index} of {total}",navPosition:"{name}, {index} of {total}",navLoading:"Loading theme...",navFailed:"Could not load {name}. Try again.",installButton:"Install",installBusy:"Installing...",installConfirmTitle:"Install this theme?",installConfirmBody:"The files of {repo} will be downloaded from GitHub by {store} into your Home Assistant configuration. Only install themes you trust.",installConfirmYes:"Download and install",installCancel:"Cancel",installLoading:"Loading theme...",uninstallButton:"Uninstall",uninstallBusy:"Uninstalling...",uninstallUpdating:"Updating...",uninstallConfirmTitle:"Uninstall this theme?",uninstallConfirmBody:"The theme files of {repo} will be deleted from your Home Assistant configuration by {store}.",uninstallConfirmYes:"Delete theme files",uninstallSwitchFirst:"Change the theme before uninstalling it.",inUseChip:"In use",uninstallWaiting:"Removed. Waiting for Home Assistant to unload the theme.",uninstallTimeout:"Removed, but Home Assistant still lists the theme. Reload the page or check {store}.",installWaiting:"Installed. Waiting for Home Assistant to load the theme.",installTimeout:"Installed, but Home Assistant has not loaded the theme yet. Reload the page or check {store}.",installViaStore:"This theme is not installed yet. Open it in {store} to download it, then come back here.",adminOnly:"Not installed yet. Only an administrator can install themes. Ask one to install this theme with {store}.",openInStore:"Open in {label}",installErrors:{unauthorized:"Only an administrator can install themes.",hacs_unavailable:"Installing needs {store}, which is not available here. Open the repository in {store} to install it.",invalid_repository:"This theme cannot be installed from here. Open it in {store} instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",install_failed:"This theme could not be downloaded by {store}. Try again, or open it in {store}.",reload_failed:"The theme was downloaded but Home Assistant could not reload its themes. Reload themes or restart Home Assistant.",operation_timeout:"This theme is still being handled by {store}. Check {store}, then reload the page.",not_installed:"This theme is not installed.",rate_limited:"Too many changes through {store} in a short time. Try again in a few minutes.",marketplace_warning:"Open the Marketplace once and accept its warning, then try again.",unknown:"The install did not complete. Try again, or open the theme in {store}."},uninstallErrors:{unauthorized:"Only an administrator can uninstall themes.",hacs_unavailable:"Removing needs {store}, which is not available here. Remove the theme in {store} instead.",invalid_repository:"This theme cannot be removed from here. Open it in {store} instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",uninstall_failed:"This theme could not be removed by {store}. Try again, or open it in {store}.",reload_failed:"The theme files were removed but Home Assistant could not reload its themes. Reload the page or restart Home Assistant.",operation_timeout:"This theme is still being handled by {store}. Check {store}, then reload the page.",not_installed:"This theme is not installed.",theme_in_use:"This theme is still used by an assignment, holiday, birthday or trial, or it is a default theme. Switch those to another theme first.",names_unknown:"The theme files could not be read, so removal was not safe. Remove it in {store} instead.",rate_limited:"Too many changes through {store} in a short time. Try again in a few minutes.",marketplace_warning:"Open the Marketplace once and accept its warning, then try again.",unknown:"The uninstall did not complete. Try again, or open the theme in {store}."},nameCollision:"The installed copy of {name} has other values than this preview, so Apply and Try are turned off for the previewed one.",nameTaken:"Name already used",repoLink:"View repository",tryButton:"Try for 30 seconds",placeholderCard:"Preview unavailable for card type",loading:"Loading dashboard...",loadError:"Could not load this dashboard.",noViews:"This dashboard has no views.",noCards:"This dashboard has no cards to preview.",generatedSuffix:"(generated by Home Assistant)",generatedDefault:"This dashboard is generated by Home Assistant and has no stored layout to read. Pick another dashboard.",sampleView:"Sample from your entities",sampleNote:"This is a sample built from your entities. The real Overview is generated by Home Assistant and cannot be read.",domainTitles:{light:"Lights",switch:"Switches",climate:"Climate",cover:"Covers",media_player:"Media players",sensor:"Sensors",binary_sensor:"Binary sensors"},compare:"Compare",compareLabel:"Show",themeOnly:"Theme only",menu:"Menu",on:"On",off:"Off",lookLabel:"Look",realLook:"Real look",livePreview:"Live preview",realAlt:"Screenshot of {name} in Home Assistant, {mode} mode",realCaption:"Screenshot of the real theme in Home Assistant (version {commit})",compareHint:"Compare works with the live preview only.",modNote:"Menu and header styling done with card-mod is not shown here.",shell:{title:"Home Assistant",overview:"Overview",map:"Map",logbook:"Logbook",history:"History",energy:"Energy",settings:"Settings",bell:"Notifications",profile:"Profile",menu:"Menu",search:"Search",more:"More"},footnote:"Drawn from your own dashboard with read-only data and scoped colors. Nothing changes until you press Apply.",emptyView:"This view has no cards.",tooManyCards:"This view has more than 200 cards, so it is not previewed.",noCandidate:"Select a theme to compare.",noModeBlock:"This theme has no {mode} block, so the candidate uses the current colors.",trialUnavailable:"Trial mode is not ready. Reload the page and try again.",trialFailed:"The trial could not start."};var ki=200,ph=3,hh=60,mh=1500,fh=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,gh=3e3;function L(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function rn(e){if(!L(e))return{};let n=Object.create(null);for(let[t,r]of Object.entries(e))typeof r=="string"&&(n[t]=r);return n}function wi(e){if(L(e))return{dark:rn(e.dark),light:rn(e.light)}}function oe(e){return L(e.vars)?{vars:rn(e.vars),modes:wi(e.modes)}:{vars:rn(e),modes:wi(e.modes)}}function $i(e){let n=e?.selectedTheme?.theme??e?.themes?.theme,t=e?.themes?.themes;if(!n||!t||!Object.prototype.hasOwnProperty.call(t,n))return;let r=t[n];return L(r)?oe(r):void 0}function xi(e){let n=e.trim().replace(/[\s;]+$/,"").replace(/\s*!important$/i,"").replace(/[\s;]+$/,"").replace(/\s+/g," ");return/^#[0-9a-f]+$/i.test(n)?n.toLowerCase():n}function bh(e,n){return Object.keys(e).some(t=>Object.prototype.hasOwnProperty.call(n,t)&&xi(e[t])!==xi(n[t]))}function Ur(e,n){return["dark","light"].some(t=>bh(Z(e,t),Z(n,t)))}function Ei(e,n){return L(e)?Ur(oe(e),n):!1}function jr(e){return e?[...Object.keys(e.vars),...Object.keys(e.modes?.dark??{}),...Object.keys(e.modes?.light??{})]:[]}function Ti(e){let n=e?.selectedTheme,t=n?.theme??e?.themes?.theme??"default";if(!n)return{theme:t};let r={theme:t};return typeof n.dark=="boolean"&&(r.dark=e?.themes?.darkMode??!1),typeof n.primaryColor=="string"&&(r.primaryColor=n.primaryColor),typeof n.accentColor=="string"&&(r.accentColor=n.accentColor),r}function _i(e,n){let t={theme:e.name};return n&&(t.dark=n==="dark"),t}function on(e){return e.installed&&e.canApply&&!e.nameCollision}function sn(e){return e.installed&&!e.nameCollision}function Si(e){if(!(!fh.test(e)||e.split("/").some(t=>t==="."||t==="..")))return`https://github.com/${e}`}function an(e,n){return e?e.entry?Z(e.entry,n):e.vars:{}}function Mi(e){return e&&/^https:\/\//i.test(e)?e:void 0}async function Ai(e){let n=await e.connection.sendMessagePromise({type:"lovelace/dashboards/list"}),t=[{url_path:null,title:f.defaultDashboard}];if(!Array.isArray(n))return t;for(let r of n)L(r)&&typeof r.url_path=="string"&&t.push({url_path:r.url_path,title:typeof r.title=="string"?r.title:r.url_path});return t}async function Ci(e,n){let t=await e.connection.sendMessagePromise({type:"lovelace/config",url_path:n});return L(t)?t:{}}function zr(e){return Array.isArray(e.views)?e.views.filter(L):[]}function Pi(e,n){return typeof e.title=="string"&&e.title?e.title:typeof e.path=="string"&&e.path?e.path:`${f.view} ${n+1}`}function Ri(e,n){if(!Array.isArray(e.cards))return e;if(n>=ph)return{...e,cards:[]};let t=e.cards.filter(L).map(r=>Ri(r,n+1));return{...e,cards:t}}function Kr(e){let n=Array.isArray(e.cards)?e.cards:[],r=(Array.isArray(e.sections)?e.sections:[]).flatMap(o=>L(o)&&Array.isArray(o.cards)?o.cards:[]);return[...n,...r].filter(L).map(o=>Ri(o,0))}function Vr(e){return e.reduce((n,t)=>{let r=Array.isArray(t.cards)?Vr(t.cards.filter(L)):0;return n+1+r},0)}var Nr,Et,Fr;function Br(){let e=window.loadCardHelpers;return typeof e=="function"?e:void 0}async function yh(){let e=customElements.whenDefined("partial-panel-resolver"),n=new Promise(r=>setTimeout(r,gh));if(await Promise.race([e,n]),!customElements.get("partial-panel-resolver"))return;let t=document.createElement("partial-panel-resolver");t.hass={panels:{tmp:{url_path:"tmp",component_name:"lovelace"}}},t._updateRoutes?.(),await t.routerOptions?.routes?.tmp?.load?.()}async function vh(){return Br()?!0:(Fr??=yh().catch(()=>{}).finally(()=>{Fr=void 0}),await Fr,Br()!==void 0)}async function ln(){if(!await vh())return;let e=Br();if(e)return Et&&Nr===e||(Nr=e,Et=Promise.resolve().then(()=>e()).catch(()=>{Et=void 0,Nr=void 0})),Et}function wh(e){let n=typeof e.type=="string"?e.type:"unknown";return Array.from(n).slice(0,hh).join("")}function nn(e){let n=document.createElement("div");return n.className="placeholder",n.textContent=`${f.placeholderCard} ${e}`,n}function xh(e){return e.localName==="hui-error-card"||e instanceof HTMLUnknownElement}function kh(e){return new Promise(n=>{let t=setTimeout(()=>n(!1),mh),r=o=>{clearTimeout(t),n(o)};try{customElements.whenDefined(e).then(()=>r(!0),()=>r(!1))}catch{r(!1)}})}async function dn(e,n){let t=wh(n);if(!e)return nn(t);let r;try{r=e.createCardElement(n)}catch{return nn(t)}if(xh(r))return nn(t);let o=r.localName;return o.includes("-")&&customElements.get(o)===void 0&&!await kh(o)?nn(t):r}function Di(e){let n=[];for(let t=0;t<e.style.length;t+=1){let r=e.style.item(t);r.startsWith("--")&&n.push(r)}for(let t of n)e.style.removeProperty(t)}var qe=class{constructor(){this.byRepo=new Map}add(n,t){let r=this.byRepo.get(n)??new Set;for(let o of t)r.add(o);this.byRepo.set(n,r)}of(n,t){let r=new Set(this.byRepo.get(n));for(let o of t)o&&r.add(o);return[...r]}};function Li(e,n){let t=new Set(Object.keys(e));if(Array.isArray(n))for(let r of n)typeof r=="string"&&t.add(r);return[...t]}function Oi(e,n,t){return e.installed||n.some(r=>t.has(r))}function Ii(e,n){return e.includes(n)}function cn(e,n){return e.length===n.length&&e.every((t,r)=>t===n[r])}function Hi(e,n,t,r,o){if(e.installed)return"match";if(!n.some(a=>t.has(a)))return"none";if(!o||!r||!Object.prototype.hasOwnProperty.call(r,o.name))return"unverified";let s=r[o.name];if(!L(s))return"unverified";let i={vars:o.vars,modes:o.modes};return Ur(oe(s),i)?"different":"match"}var Ni="hats_lite/catalog",$h="hats_lite/theme",Wr=5e3,qr=6e4;function Fi(e,n){let t=tn(e);return t==="permanent"?null:t==="limited"?qr:Wr*2**n}function Eh(e){if(typeof e!="object"||e===null)return!1;let n=e.code;return n==="invalid_format"||n==="invalid_request"||n==="unknown_error"}function Oe(e,n,t,r=!1,o){if(!e)return Promise.reject(new Error(b.themeErrorDefault));let s={type:$h,full_name:t.full_name,commit:t.last_commit||"HEAD"};return r?s.summary=!0:o&&(s.theme=o),P(e,s).then(i=>{if(!gi(i?.themes))throw new Error(b.themeErrorDefault);let a=Li(i.themes,i.names);return n.add(t.full_name,a),{themes:i.themes,summary:i.summary===!0,names:a}},i=>{if(s.theme!==void 0&&Eh(i))return Oe(e,n,t);throw i})}var Bi="hats_lite_theme_cache",Xr=120,Th=2e4;function Gr(e){if(!L(e))return null;let n=Object.create(null);for(let[t,r]of Object.entries(e)){if(typeof r!="string")return null;n[t]=r}return n}function _h(e){if(!L(e)||typeof e.name!="string")return null;let n=Gr(e.vars);if(!n)return null;let t={name:e.name,vars:n};if(e.modes!==void 0&&e.modes!==null){if(!L(e.modes))return null;let r=Gr(e.modes.dark??{}),o=Gr(e.modes.light??{});if(!r||!o)return null;t.modes={dark:r,light:o}}return t}function Ge(e){let n=Object.keys(e)[0];if(n===void 0)return null;let t=e[n];if(!L(t))return null;let r=oe(t);return{name:n,vars:r.vars,modes:r.modes}}var Ui=new WeakMap;function zi(e,n){let t=Ui.get(e)??{};return Ui.set(e,t),t[n]??=Z(e,n),t[n]}function ji(e){return JSON.stringify(e).length>Th}var un=class{constructor(){this.slots=new Map;this.load()}load(){try{let n=localStorage.getItem(Bi);if(n===null)return;let t=JSON.parse(n);if(!Array.isArray(t))return;for(let r of t){if(!Array.isArray(r)||typeof r[0]!="string")continue;let o=_h(r[1]);o&&!ji(o)&&this.slots.set(r[0],{theme:o})}this.trim()}catch{this.slots.clear()}}trim(){let n=[];for(;this.slots.size>Xr;){let t=this.slots.keys().next().value;if(t===void 0)break;this.slots.delete(t),n.push(t)}return n}get size(){return this.slots.size}has(n){return this.slots.has(n)}touch(n){let t=this.slots.get(n);t&&(this.slots.delete(n),this.slots.set(n,t))}get(n){return this.slots.get(n)?.theme}bundle(n){return this.slots.get(n)?.bundle}set(n,t,r){this.slots.delete(n),this.slots.set(n,{theme:t,bundle:r});let o=this.trim();return this.persist(),o}persist(){try{let n=[...this.slots.entries()].filter(([,t])=>!ji(t.theme)).map(([t,r])=>[t,r.theme]);localStorage.setItem(Bi,JSON.stringify(n))}catch{return}}};var Wi=["all","installed","dark","light","glass"];function qi(e,n){return e==="dark"||e==="light"?e:n}function Gi(e){let n=e.split("/");return n[n.length-1]||e}function Xi(e){let n=e.indexOf("/");return n>0?e.slice(0,n):""}function ye(e){return`${e.full_name}@${e.last_commit||"HEAD"}`}function Sh(e){return`${e.full_name} ${e.description}`.toLowerCase()}function Ki(e,n){return new RegExp(`(^|[^a-z0-9])${n}([^a-z0-9]|$)`).test(e)}function Vi(e){return!!e&&Object.keys(e).length>0}function Mh(e){return[e.vars,e.modes?.dark,e.modes?.light].some(t=>Object.entries(t??{}).some(([r,o])=>/backdrop-filter|blur/i.test(r)||/blur\(/i.test(o)))}function Yi(e,n,t,r,o=n.installed){let s=t===void 0?r:void 0,i=Sh(n);return e==="all"?!0:e==="installed"?o:e==="dark"?Ki(i,"dark")||Vi(t?.modes?.dark)||s?.dark===!0:e==="light"?Ki(i,"light")||Vi(t?.modes?.light)||s?.light===!0:/glass|frost|blur/.test(i)||t!==void 0&&Mh(t)||s?.glass===!0}var Ah={all:b.filterAll,installed:b.filterInstalled,dark:b.filterDark,light:b.filterLight,glass:b.filterGlass};function Zi(e){return l`
    <div class="toolbar">
      <div class="filters" role="group" aria-label=${b.filterLabel}>
        ${Wi.map(n=>l`
            <button
              type="button"
              class="chip-btn"
              data-filter=${n}
              aria-pressed=${e.filter===n?"true":"false"}
              @click=${()=>e.onFilter(n)}
            >
              ${Ah[n]}
            </button>
          `)}
      </div>
      <input
        class="search"
        type="search"
        aria-label=${b.searchLabel}
        placeholder=${b.searchPlaceholder}
        .value=${e.query}
        @input=${e.onSearch}
      />
    </div>
  `}var Ji={width:440,height:275};function Yr(e,n,t){let r=e%n,o=Math.floor(e/n);return{sizeX:n*100,sizeY:t*100,posX:n>1?r/(n-1)*100:0,posY:t>1?o/(t-1)*100:0}}function Qi(e,n){return typeof e=="number"&&Number.isInteger(e)&&e>0&&e<=n}function Ch(e,n,t){if(typeof e!="object"||e===null)return null;let r=e,o=r.index;return typeof r.full_name!="string"||typeof r.name!="string"||typeof o!="number"||!Number.isInteger(o)||o<0||o>=n||t.has(o)?null:(t.add(o),{full_name:r.full_name,name:r.name,index:o,commit:typeof r.commit=="string"&&r.commit?r.commit:null,license:typeof r.license=="string"&&r.license?r.license:null,dark:r.dark===!0,light:r.light===!0,glass:r.glass===!0})}function Ph(e,n){for(let r of[e,n])if(typeof r=="string"&&r)return r;let t=r=>r!=null;return t(e)||t(n)?null:""}function pn(e){if(typeof e!="object"||e===null)return null;let n=e,{columns:t,rows:r,themes:o}=n;if(n.version!==1||!Qi(t,64)||!Qi(r,2e3)||!Array.isArray(o))return null;let s=new Set,i=new Map;for(let d of o){let c=Ch(d,t*r,s);c&&i.set(c.full_name,c)}let a=Ph(n.hash,n.generated);return a===null?null:{columns:t,rows:r,version:a,tile:Rh(n.tile),themes:i}}function Rh(e){if(typeof e!="object"||e===null)return Ji;let{width:n,height:t}=e,r=o=>typeof o=="number"&&Number.isInteger(o)&&o>=16&&o<=4096;return r(n)&&r(t)?{width:n,height:t}:Ji}function ea(e,n){return n.width===e.columns*e.tile.width&&n.height===e.rows*e.tile.height}var ra="/hats_lite_static/thumbs",ta=6e3,Dh=2e4,na=3e4,hn=class extends Error{},Ye=class extends Error{},Lh=2,Xe={recovery:{succeeded:!1,failures:0},fetchIndex(e,n="no-cache"){return fetch(`${ra}/index.json`,{credentials:"same-origin",cache:n,signal:e}).then(t=>{if(t.status===404)throw new hn("index missing");if(!t.ok)throw new Error("index unavailable");return t.json()})},loadImage(e,n){return new Promise(t=>{let r=new Image,o=i=>{n?.removeEventListener("abort",s),t(i)},s=()=>{r.src="",o(!1)};r.onload=()=>{o({width:r.naturalWidth,height:r.naturalHeight})},r.onerror=()=>o(!1),n?.addEventListener("abort",s),r.src=e})}};function Zr(e,n,t){let r=new AbortController;return new Promise((o,s)=>{let i=()=>{clearTimeout(d),e.delete(a)},a=()=>{i(),r.abort(),s(new Ye)},d=setTimeout(()=>{i(),r.abort(),s(new Error("timeout"))},n);e.add(a);let c=h=>p=>{i(),h(p)};try{t(r.signal).then(c(o),c(s))}catch(h){c(s)(h)}})}var mn=class{constructor(n){this.onChange=n;this.started=!1;this.images=new Map;this.wanted=new Set;this.generation=0;this.recovering=!1;this.retries=new Map;this.active=new Set;this.disposed=!1;this.ticket=0}ensure(n){if(this.wanted.add(n),!this.disposed){if(this.started){this.pump();return}this.startIndex()}}startIndex(){this.started=!0;let n=++this.ticket;Promise.resolve().then(()=>{n===this.ticket&&!this.disposed&&this.loadIndex(!0)})}later(n){let t=()=>{this.retries.delete(t),n()};this.retries.set(t,this.disposed?void 0:setTimeout(t,na))}dispose(){this.disposed=!0,this.ticket+=1;for(let[n,t]of this.retries)t!==void 0&&clearTimeout(t),this.retries.set(n,void 0);for(let n of[...this.active])n();this.index===void 0&&(this.started=!1);for(let[n,t]of this.images)t===void 0&&this.images.delete(n)}resume(){this.disposed=!1;for(let[n,t]of this.retries)t===void 0&&this.retries.set(n,setTimeout(n,na));!this.started&&this.wanted.size>0?this.startIndex():this.pump()}async loadIndex(n){let t=null,r=!1;try{t=pn(await Zr(this.active,ta,o=>Xe.fetchIndex(o)))}catch(o){if(o instanceof Ye)return;r=!(o instanceof hn)}this.index=t,this.pump(),this.onChange(),!t&&r&&n&&this.later(()=>{this.loadIndex(!1)})}pump(){if(this.index)for(let n of this.wanted)this.images.has(n)||(this.images.set(n,void 0),this.loadImage(n,!0))}async loadImage(n,t){let r=this.index,o=this.generation;if(!r)return;let s=this.imageUrl(n),i=!1;try{i=await Zr(this.active,Dh,d=>Xe.loadImage(s,d))}catch(d){if(d instanceof Ye)return}if(o!==this.generation)return;let a=i!==!1;if(a&&typeof i=="object"&&!ea(r,i)){this.mismatch(n);return}this.images.set(n,a),this.onChange(),!a&&t&&this.later(()=>{this.loadImage(n,!1)})}mismatch(n){this.images.set(n,!1),this.onChange();let t=Xe.recovery;this.recovering||this.disposed||t.succeeded||t.failures>=Lh||this.recover()}async recover(){this.recovering=!0;let n=null,t=!1;try{n=pn(await Zr(this.active,ta,r=>Xe.fetchIndex(r,"reload")))}catch(r){t=r instanceof Ye}if(this.recovering=!1,!(t||this.disposed)){if(n===null){Xe.recovery.failures+=1,this.onChange();return}Xe.recovery.succeeded=!0,this.index=n,this.generation+=1;for(let r of this.wanted)this.images.delete(r);this.pump(),this.onChange()}}imageUrl(n){let t=this.index?.version??"",r=t?`?v=${encodeURIComponent(t)}`:"";return`${ra}/atlas-${n}.webp${r}`}theme(n,t){let r=this.index?.themes.get(n);if(!r)return;let o=r.commit;if(!(t&&o&&o!=="HEAD"&&o!==t))return r}state(n,t,r){if(this.ensure(t),this.index===void 0)return"pending";if(!this.theme(n,r))return"none";if(!this.images.has(t))return"pending";let o=this.images.get(t);return o===void 0?"pending":o?"ok":"none"}tile(n,t){let r=this.theme(n,t);return!r||!this.index?null:Yr(r.index,this.index.columns,this.index.rows)}};var oa={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},sa=e=>(...n)=>({_$litDirective$:e,values:n}),fn=class{constructor(n){}get _$AU(){return this._$AM._$AU}_$AT(n,t,r){this._$Ct=n,this._$AM=t,this._$Ci=r}_$AS(n,t){return this.update(n,t)}update(n,t){return this.render(...t)}};var ia="important",Oh=" !"+ia,se=sa(class extends fn{constructor(e){if(super(e),e.type!==oa.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((n,t)=>{let r=e[t];return r==null?n:n+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[n]){let{style:t}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(n)),this.render(n);for(let r of this.ft)n[r]==null&&(this.ft.delete(r),r.includes("-")?t.removeProperty(r):t[r]=null);for(let r in n){let o=n[r];if(o!=null){this.ft.add(r);let s=typeof o=="string"&&o.endsWith(Oh);r.includes("-")||s?t.setProperty(r,s?o.slice(0,-11):o,s?ia:""):t[r]=o}}return ce}});function aa(e,n,t,r){let o=e.tile(n,r),s=e.theme(n,r);if(!o||!s)return u;let i={backgroundImage:`url("${e.imageUrl(t)}")`,backgroundSize:`${o.sizeX}% ${o.sizeY}%`,backgroundPosition:`${o.posX}% ${o.posY}%`};return l`<div
    class="atlas-thumb"
    role="img"
    aria-label=${s.name}
    data-atlas="true"
    style=${se(i)}
  ></div>`}function la(e){if(!e)return l`<span
      class="chip"
      title=${b.licenseUnknown}
      aria-label=${b.licenseUnknown}
      >${b.licenseShort}</span
    >`;let n=`${b.licenseKnown}: ${e}`;return l`<span class="chip" title=${n} aria-label=${n}>${e}</span>`}function Ih(e){e.preventDefault()}function Hh(e){return e==="match"?l`<span class="chip ok">${b.installed}</span>`:e==="unverified"?l`<span class="chip">${b.installed}</span>`:e==="different"?l`<span class="chip warn">${b.otherCopy}</span>`:u}function da(e,n){let t=Gi(e.entry.full_name),r=Xi(e.entry.full_name),o=`${b.starsLabel}: ${e.entry.stars}`;return l`
    <article class="card" data-key=${e.key}>
      <button
        class="thumb-btn"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        ?disabled=${e.busy}
        @mousedown=${Ih}
        @click=${n}
      >
        ${e.atlased?aa(e.atlas,e.entry.full_name,e.mode,e.entry.last_commit):l`<hats-lite-thumb
              .vars=${e.vars}
              .mode=${e.mode}
              ?failed=${e.failed}
              ?limited=${e.limited}
            ></hats-lite-thumb>`}
      </button>
      <div class="body">
        <span class="name">${t}</span>
        ${r?l`<span class="owner">${r}</span>`:u}
        <div class="chips">
          ${Hh(e.installedKind)}
          ${e.active?l`<span class="chip ok">${b.inUse}</span>`:u}
          <span class="chip" title=${o} aria-label=${o}
            >${b.starGlyph} ${e.entry.stars}</span
          >
          ${la(e.license)}
        </div>
        ${e.error?l`<p class="card-error" role="alert">${e.error}</p>`:u}
        <div class="actions">
          <button
            class="btn primary"
            type="button"
            aria-label="${b.openPreview} ${t}"
            aria-busy=${e.opening?"true":"false"}
            ?disabled=${e.busy}
            @click=${n}
          >
            ${b.preview}
          </button>
        </div>
      </div>
    </article>
  `}var Ze="default",ca="",Jr={full_name:ca,description:b.defaultDescription,stars:0,installed:!0,last_commit:null,hacs_id:null};function Tt(e){return e?.full_name===ca}function Nh(e){return e===""||e.includes("default")||e.includes("home assistant")||"home assistant".includes(e)&&e.length>=4}function gn(e,n){return e==="all"&&Nh(n)}function Qr(e){return Tt(e)?b.defaultName:e.full_name}function ua(){return{[Ze]:{vars:{}}}}function pa(){return{name:Ze,vars:{},installed:!0,canApply:!0}}function ha(e,n){let t=b.defaultName;return l`
    <article class="card" data-key="default">
      <button class="thumb-btn" type="button" tabindex="-1" aria-hidden="true" @click=${n}>
        <hats-lite-thumb .vars=${{}} .mode=${e}></hats-lite-thumb>
      </button>
      <div class="body">
        <span class="name">${t}</span>
        <p class="desc">${b.defaultDescription}</p>
        <div class="actions">
          <button class="btn primary" type="button" aria-label="${b.openPreview} ${t}" @click=${n}>${b.preview}</button>
        </div>
      </div>
    </article>
  `}function ma(e){return!e.ready||e.count>0?"":e.catalog>0?e.defaultShown?"":e.query?b.noMatches:b.noFilterMatches:e.error?"":b.noThemes}var Fh=6,Je=class{constructor(){this.slots=new Map}key(n,t){return`${ye(n)}@${t}`}get(n,t){let r=this.key(n,t),o=this.slots.get(r);return o&&(this.slots.delete(r),this.slots.set(r,o)),o}set(n,t,r){let o=this.key(n,t);for(this.slots.delete(o),this.slots.set(o,r);this.slots.size>Fh;){let s=this.slots.keys().next().value;if(s===void 0)break;this.slots.delete(s)}}};async function eo(e,n,t,r,o){let s=t.get(r,o);if(s)return s;let i=await Oe(e,n,r,!1,o),a={themes:i.themes,names:i.names,theme:o};return Object.prototype.hasOwnProperty.call(i.themes,o)&&t.set(r,o,a),a}async function fa(e,n,t,r,o,s){let i=ye(o),a=t.get(i)?.name??s,d=t.bundle(i);if(d&&(!a||Object.prototype.hasOwnProperty.call(d,a))){t.touch(i);let p=n.of(o.full_name,Object.keys(d));return{themes:d,names:p,theme:a??Object.keys(d)[0]}}if(!a){let p=await Oe(e,n,o,!0);if(a=Ge(p.themes)?.name,!p.summary){let g=Ge(p.themes);return g&&t.set(i,g,p.themes),{themes:p.themes,names:p.names,theme:a}}}if(!a){let p=await Oe(e,n,o);return{themes:p.themes,names:p.names,theme:Object.keys(p.themes)[0]}}let c=await eo(e,n,r,o,a),h=Ge(c.themes);return h&&!t.has(i)&&t.set(i,h),c}var ve=class extends Error{},bn=class{constructor(n=3,t=5e3,r=1,o=()=>t){this.limit=n;this.retryMs=t;this.retries=r;this.delayFor=o;this.running=0;this.waiting=[];this.pending=new Set;this.epoch=0}get active(){return this.running}add(n){return this.attempt(n,this.retries)}dispose(){this.epoch+=1;let n=this.waiting;this.waiting=[];for(let r of n)r.reject(new ve);let t=[...this.pending];this.pending.clear();for(let r of t)clearTimeout(r.timer),r.reject(new ve)}acquire(){return this.running<this.limit?(this.running+=1,Promise.resolve()):new Promise((n,t)=>this.waiting.push({resolve:n,reject:t}))}release(){let n=this.waiting.shift();n?n.resolve():this.running-=1}pause(n){return new Promise((t,r)=>{let o={timer:setTimeout(()=>{this.pending.delete(o),t()},n),reject:r};this.pending.add(o)})}async attempt(n,t){let r=this.epoch;if(await this.acquire(),r!==this.epoch)throw this.release(),new ve;let o=this.retryMs;try{return await n()}catch(s){if(r!==this.epoch)throw new ve;let i=t>0?this.delayFor(s,this.retries-t):null;if(i===null)throw s;o=i}finally{this.release()}return await this.pause(o),this.attempt(n,t-1)}};var ga=T`
  :host {
    display: block;
    box-sizing: border-box;
    padding: 20px;
    max-width: 100%;
    overflow-x: hidden;
  }
  * {
    box-sizing: border-box;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  .inuse {
    padding: 4px 12px;
    min-height: 32px;
    color: var(--hl-muted);
  }
  .inuse strong {
    color: var(--hl-text);
    font-weight: 600;
  }
  .toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 16px;
    padding-bottom: 16px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--hl-line);
  }
  .filters {
    display: flex;
    gap: 4px;
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    padding: 2px 12px 2px 2px;
    scroll-padding-inline-end: 12px;
  }
  .filters .chip-btn {
    flex: none;
  }
  .search {
    flex: 0 1 260px;
    min-width: 0;
    padding: 8px 14px;
    min-height: 40px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-edge);
    background: var(--hl-surface);
    color: var(--hl-text);
    font: inherit;
  }
  .search:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  .card {
    content-visibility: auto;
    contain-intrinsic-size: auto 320px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    border-radius: var(--hl-radius-lg);
    border: 1px solid var(--hl-line);
    background: var(--hl-surface);
  }
  .card:hover,
  .card:focus-within {
    box-shadow: var(--hl-shadow);
    border-color: color-mix(in srgb, var(--hl-accent) 55%, var(--hl-line));
  }
  .thumb-btn {
    appearance: none;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    border-radius: var(--hl-radius-lg) var(--hl-radius-lg) 0 0;
    overflow: hidden;
    background: var(--hl-surface-raised);
    cursor: pointer;
  }
  .atlas-thumb {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    background-repeat: no-repeat;
    background-color: var(--hl-surface-raised);
  }
  .thumb-btn:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: -2px;
  }
  .thumb-btn:disabled {
    cursor: progress;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px 16px;
  }
  .name {
    font-size: 16px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .owner {
    color: var(--hl-muted);
    overflow-wrap: anywhere;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
  .card-error {
    margin: 0;
    color: var(--error-color, #db4437);
    font-size: 13px;
    overflow-wrap: anywhere;
  }
  .banner {
    color: var(--error-color, #db4437);
  }
  .retry {
    margin-bottom: 12px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
  .note {
    color: var(--hl-muted);
  }
  @media (prefers-reduced-motion: no-preference) {
    .card {
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
  }
  @media (max-width: 560px) {
    :host {
      padding: 12px;
    }
    .grid {
      grid-template-columns: 1fr;
    }
    .filters {
      order: 3;
      flex: 1 1 100%;
    }
    .search {
      flex: 1 1 100%;
    }
  }
`;var Bh={dark:{"primary-background-color":"#111111","card-background-color":"#1c1c1c","primary-text-color":"#e1e1e1","secondary-text-color":"#9b9b9b","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#e1e1e11f","text-primary-color":"#ffffff","secondary-background-color":"#282828","disabled-text-color":"#6f6f6f"},light:{"primary-background-color":"#fafafa","card-background-color":"#ffffff","primary-text-color":"#141414","secondary-text-color":"#5e5e5e","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#0000001f","text-primary-color":"#ffffff","secondary-background-color":"#e5e5e5","disabled-text-color":"#bdbdbd"}},Uh={"paper-item-icon-color":"#44739e","light-primary-color":"#b3e5fc","dark-primary-color":"#0288d1"},jh=["primary-color","accent-color","primary-text-color","secondary-text-color","card-background-color","primary-background-color"];function zh(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16)).join(", ")}function ba(e){let n=Bh[e],t={...n,...Uh};for(let r of jh)t[`rgb-${r}`]=zh(n[r]);return t}var yn={dark:ba("dark"),light:ba("light")};function ya(e,n){if(e===n)return!0;if(!e||!n)return!1;let t=Object.keys(e);return t.length===Object.keys(n).length&&t.every(r=>e[r]===n[r])}var to=class extends M{constructor(){super(...arguments);this.vars=null;this.mode="dark";this.failed=!1;this.limited=!1}static{this.properties={vars:{attribute:!1,hasChanged:(t,r)=>!ya(t,r)},mode:{attribute:!1},failed:{type:Boolean},limited:{type:Boolean}}}static{this.styles=T`
    :host {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      container-type: inline-size;
      position: relative;
      color: var(--primary-text-color);
      background-color: var(--primary-background-color);
    }
    .stage {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding: 3cqw;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: auto auto 1fr;
      gap: 2cqw;
      align-content: start;
      font-size: 2.3cqw;
      line-height: 1.3;
      background: var(--lovelace-background, var(--primary-background-color));
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: scroll;
    }
    .box {
      min-width: 0;
      padding: 2cqw;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--ha-card-background, var(--card-background-color));
      border: var(--ha-card-border-width, 1px) solid var(--divider-color);
      box-shadow: var(--ha-card-box-shadow, none);
      backdrop-filter: var(--ha-card-backdrop-filter, none);
      -webkit-backdrop-filter: var(--ha-card-backdrop-filter, none);
      color: var(--primary-text-color);
    }
    .sub {
      color: var(--secondary-text-color);
      font-size: 0.85em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .big {
      font-size: 2.6em;
      font-weight: 500;
      margin: 0.2em 0 0.4em;
    }
    .bar {
      height: 2.2cqw;
      border-radius: 99px;
      background: var(--divider-color);
      overflow: hidden;
    }
    .bar i {
      display: block;
      width: 60%;
      height: 100%;
      background: var(--primary-color);
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1cqw;
      margin-top: 1.2cqw;
      white-space: nowrap;
    }
    .row span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tog {
      flex: none;
      width: 5cqw;
      height: 2.6cqw;
      border-radius: 99px;
      background: var(--primary-color);
      position: relative;
    }
    .tog::after {
      content: "";
      position: absolute;
      top: 0.3cqw;
      right: 0.3cqw;
      width: 2cqw;
      height: 2cqw;
      border-radius: 50%;
      background: var(--card-background-color);
    }
    .tog.off {
      background: var(--divider-color);
      opacity: 0.8;
    }
    .tog.off::after {
      right: auto;
      left: 0.3cqw;
      background: var(--secondary-text-color);
    }
    .tile {
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 2cqw;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
      color: var(--text-primary-color, #fff);
      min-width: 0;
    }
    .tile .g {
      font-size: 0.85em;
      opacity: 0.85;
    }
    .tile .t {
      font-size: 1.1em;
      font-weight: 600;
    }
    .wide {
      grid-column: span 2;
    }
    .spark {
      display: flex;
      align-items: flex-end;
      gap: 1.2cqw;
      height: 9cqw;
      margin-top: 1.4cqw;
    }
    .spark i {
      flex: 1;
      border-radius: 0.8cqw 0.8cqw 0 0;
      background: var(--primary-color);
      opacity: 0.85;
    }
    .spark i:nth-child(3n) {
      background: var(--accent-color);
    }
    .small {
      font-size: 1.7em;
      margin-bottom: 0;
    }
    .chips {
      grid-column: 1 / -1;
      display: flex;
      gap: 1.5cqw;
      align-items: flex-start;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 1cqw;
      padding: 1cqw 2cqw;
      border-radius: 99px;
      background: var(--ha-card-background, var(--card-background-color));
      border: 1px solid var(--divider-color);
      backdrop-filter: var(--ha-card-backdrop-filter, none);
      -webkit-backdrop-filter: var(--ha-card-backdrop-filter, none);
      color: var(--primary-text-color);
      white-space: nowrap;
    }
    .pill i {
      width: 1.6cqw;
      height: 1.6cqw;
      border-radius: 50%;
      background: var(--accent-color);
    }
    .state {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 8px;
      font-size: 13px;
    }
    .reason {
      font-size: 12px;
      opacity: 0.85;
    }
    .skeleton {
      background: var(--hl-line, rgba(127, 127, 127, 0.18));
    }
    .unavailable {
      background: var(--hl-surface, #1f2937);
      color: var(--hl-muted, #9ca3af);
    }
    @media (prefers-reduced-motion: no-preference) {
      .skeleton {
        background: linear-gradient(
          100deg,
          var(--hl-line, rgba(127, 127, 127, 0.18)) 30%,
          rgba(127, 127, 127, 0.32) 50%,
          var(--hl-line, rgba(127, 127, 127, 0.18)) 70%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s linear infinite;
      }
    }
    @keyframes shimmer {
      from {
        background-position: 100% 0;
      }
      to {
        background-position: -100% 0;
      }
    }
  `}updated(t){if(!t.has("vars")&&!t.has("mode"))return;let r=this.painted;r&&r.mode===this.mode&&ya(r.vars,this.vars)||(this.painted={vars:this.vars,mode:this.mode},this.style.cssText="",this.vars&&($t(this,yn[this.mode]),$t(this,this.vars)))}render(){if(this.failed){let t=this.limited?b.thumbRateLimited:b.thumbUnavailable;return l`<div class="state unavailable"><span class="reason">${t}</span></div>`}return this.vars?l`
      <div class="stage" aria-hidden="true">
        <div class="box">
          <div class="sub">${b.thumbRoom}</div>
          <div class="big">${b.thumbTemp}</div>
          <div class="bar"><i></i></div>
          <div class="sub">${b.thumbHeating}</div>
        </div>
        <div class="box">
          <div class="sub">${b.thumbLights}</div>
          <div class="row"><span>${b.thumbLight}</span><i class="tog"></i></div>
          <div class="row"><span>${b.thumbDoor}</span><i class="tog"></i></div>
          <div class="row"><span>${b.thumbPorch}</span><i class="tog off"></i></div>
        </div>
        <div class="tile">
          <span class="g">${b.thumbGreeting}</span>
          <span class="t">${b.thumbSunset}</span>
        </div>
        <div class="chips">
          <span class="pill"><i></i>${b.thumbChipLight}</span>
          <span class="pill"><i></i>${b.thumbChipFan}</span>
          <span class="pill"><i></i>${b.thumbChipHeat}</span>
        </div>
        <div class="box wide">
          <div class="sub">${b.thumbEnergy}</div>
          <div class="spark">
            <i style="height: 35%"></i><i style="height: 55%"></i><i style="height: 80%"></i
            ><i style="height: 45%"></i><i style="height: 65%"></i><i style="height: 95%"></i
            ><i style="height: 50%"></i><i style="height: 70%"></i>
          </div>
        </div>
        <div class="box">
          <div class="sub">${b.thumbGarage}</div>
          <div class="big small">${b.thumbClosed}</div>
          <div class="sub">${b.thumbLocked}</div>
        </div>
      </div>
    `:l`<div class="state skeleton" aria-hidden="true"></div>`}};customElements.get("hats-lite-thumb")||customElements.define("hats-lite-thumb",to);var K=T`
  :host {
    --hl-src-bg: var(--primary-background-color, #0f1722);
    --hl-src-surface: var(--card-background-color, #172233);
    --hl-src-raised: var(--secondary-background-color, #1d2b40);
    --hl-src-line: var(--divider-color, rgba(255, 255, 255, 0.12));
    --hl-src-text: var(--primary-text-color, #e8eef7);
    --hl-src-muted: var(--secondary-text-color, #9fb0c7);
    --hl-src-accent: var(--primary-color, #39a9e5);
    --hl-src-accent-ink: var(--text-primary-color, #06121f);
    --hl-src-ok: var(--success-color, #43a047);
    --hl-src-warn: var(--warning-color, #f5a524);
    --hl-bg: var(--hl-src-bg);
    --hl-surface: var(--hl-src-surface);
    --hl-surface-raised: var(--hl-src-raised);
    --hl-line: var(--hl-src-line);
    --hl-edge: var(--hl-edge-ink, var(--hl-src-line));
    --hl-text: var(--hl-text-ink, var(--hl-src-text));
    --hl-muted: var(--hl-muted-ink, var(--hl-src-muted));
    --hl-page-text: var(--hl-bg-text-ink, var(--hl-src-text));
    --hl-page-muted: var(--hl-bg-muted-ink, var(--hl-src-muted));
    --hl-accent: var(--hl-src-accent);
    --hl-accent-ink: var(--hl-on-accent, var(--hl-src-accent-ink));
    --hl-accent-text: var(--hl-accent-text-ink, var(--hl-src-accent));
    --hl-focus: var(--hl-focus-ink, var(--hl-src-accent));
    --hl-ok: var(--hl-src-ok);
    --hl-ok-text: var(--hl-ok-ink, var(--hl-src-ok));
    --hl-warn: var(--hl-src-warn);
    --hl-warn-text: var(--hl-warn-ink, var(--hl-src-warn));
    --hl-radius-lg: 18px;
    --hl-radius-md: 12px;
    --hl-radius-sm: 8px;
    --hl-radius-pill: 999px;
    --hl-gap: 16px;
    --hl-shadow: 0 1px 2px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.18);
    color: var(--hl-text);
    font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
    font-size: 14px;
    line-height: 1.45;
  }
`,V=T`
  .seg {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: var(--hl-radius-pill);
    background: var(--hl-surface);
    border: 1px solid var(--hl-edge);
  }
  .seg button {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--hl-muted);
    font: inherit;
    font-weight: 500;
    padding: 6px 14px;
    min-height: 32px;
    border-radius: var(--hl-radius-pill);
    cursor: pointer;
  }
  .seg button[aria-pressed="true"] {
    background: var(--hl-accent);
    color: var(--hl-accent-ink);
    box-shadow: inset 0 0 0 1px var(--hl-focus);
  }
  .seg button:focus-visible,
  .chip-btn:focus-visible,
  .btn:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    min-height: 24px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-line);
    color: var(--hl-muted);
    font-size: 12px;
    background: transparent;
    white-space: nowrap;
  }
  .chip.ok {
    color: var(--hl-ok-text);
    border-color: color-mix(in srgb, var(--hl-ok) 50%, transparent);
  }
  .chip.warn {
    color: var(--hl-warn-text);
    border-color: color-mix(in srgb, var(--hl-warn) 50%, transparent);
  }
  .chip-btn {
    appearance: none;
    cursor: pointer;
    font: inherit;
    font-weight: 500;
    padding: 6px 16px;
    min-height: 34px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-edge);
    background: transparent;
    color: var(--hl-text);
  }
  .chip-btn[aria-pressed="true"] {
    background: color-mix(in srgb, var(--hl-accent) 22%, transparent);
    border-color: var(--hl-accent);
    color: var(--hl-text);
  }
  .btn {
    appearance: none;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    min-height: 40px;
    padding: 8px 20px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-edge);
    background: var(--hl-surface-raised);
    color: var(--hl-text);
  }
  .btn.primary {
    background: var(--hl-accent);
    border-color: var(--hl-focus);
    color: var(--hl-accent-ink);
  }
  .btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--hl-muted);
    opacity: 1;
  }
  .swatches {
    display: inline-flex;
    gap: 3px;
  }
  .swatches i {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.35);
    display: inline-block;
  }
  @media (prefers-reduced-motion: no-preference) {
    .seg button,
    .chip-btn,
    .btn {
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
  }
`;var Kh=6,no=class extends M{constructor(){super(...arguments);this.installedThemes=[];this.currentTheme="default";this.entries=[];this.query="";this.loading=!1;this.loaded=!1;this.error="";this.fromCache=!1;this.busyName="";this.cardError=null;this.filter="all";this.mode="dark";this.states=new Map;this.started=!1;this.modeTouched=!1;this.installedSet=new Set;this.entryIndex=new Map;this.cache=new un;this.bundles=new Je;this.visible=new Set;this.known=new qe;this.queue=new bn(3,Wr,1,Fi);this.atlas=new mn(()=>this.onAtlasChange());this.seen=new Set;this.inflight=new Set;this.permanent=new Set;this.limitedUntil=new Map;this.watched=new WeakMap;this.onIntersect=t=>{for(let r of t){let o=r.target.dataset.key??"";if(!r.isIntersecting){this.visible.delete(o);continue}this.visible.add(o),this.cache.touch(o);let s=this.entryIndex.get(o);s&&this.requestVars(s,!0)}};this.onSearch=t=>{this.query=t.target.value}}static{this.properties={installedThemes:{attribute:!1},currentTheme:{attribute:!1},darkMode:{attribute:!1},entries:{state:!0},query:{state:!0},loading:{state:!0},loaded:{state:!0},error:{state:!0},fromCache:{state:!0},busyName:{state:!0},cardError:{state:!0},filter:{state:!0},mode:{state:!0},states:{state:!0}}}static{this.styles=[K,V,ga]}get hass(){return this.hassRef}set hass(t){this.hassRef=t;let r=t?.themes,o=Object.keys(r?.themes??{});cn(o,this.installedThemes)||(this.installedThemes=o);let s=t?.selectedTheme?.theme??r?.theme??"default";s!==this.currentTheme&&(this.currentTheme=s),r?.darkMode!==this.darkMode&&(this.darkMode=r?.darkMode),this.started||this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.atlas.resume(),this.hasUpdated&&queueMicrotask(()=>this.watchCards())}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0,this.watched=new WeakMap,this.visible.clear(),this.queue.dispose(),this.atlas.dispose()}willUpdate(t){t.has("installedThemes")&&(this.installedSet=new Set(this.installedThemes)),t.has("entries")&&(this.entryIndex=new Map(this.entries.map(r=>[ye(r),r]))),t.has("darkMode")&&!this.modeTouched&&this.darkMode!==void 0&&(this.mode=this.darkMode?"dark":"light"),!this.started&&this.hassRef&&(this.started=!0,this.loadCatalog())}updated(){queueMicrotask(()=>this.watchCards())}async loadCatalog(){let t=this.hassRef;if(t){this.loading=!0;try{let r=await P(t,{type:Ni});this.entries=Hr(r?.themes),this.fromCache=!1,this.error="",fi(this.entries)}catch{let r=mi();this.entries=r??[],this.fromCache=r!==null,this.error=b.loadError}finally{this.loading=!1,this.loaded=!0}}}setState(t,r){let o=new Map(this.states);r===null?o.delete(t):o.set(t,r),this.states=o}requestVars(t,r=!1){let o=ye(t);if(!this.hassRef||this.inflight.has(o)||this.cache.has(o))return;let s=this.states.get(o);(s==="failed"||s==="limited")&&!(r&&!this.permanent.has(o))||s==="limited"&&(this.limitedUntil.get(o)??0)>Date.now()||(this.seen.add(o),this.atlas.state(t.full_name,this.mode,t.last_commit)==="none"&&(this.inflight.add(o),this.setState(o,"loading"),this.queue.add(()=>Oe(this.hassRef,this.known,t,!0)).then(a=>{let d=Ge(a.themes);if(!d)throw new Error(b.themeErrorDefault);let c=this.cache.set(o,d,a.summary?void 0:a.themes);this.refill(c),this.setState(o,null)}).catch(a=>{if(a instanceof ve){this.setState(o,null);return}let d=tn(a);d==="permanent"&&this.permanent.add(o),d==="limited"&&this.limitedUntil.set(o,Date.now()+qr),this.setState(o,d==="limited"?"limited":"failed")}).finally(()=>this.inflight.delete(o))))}refill(t){if(!(this.visible.size>=Xr))for(let r of t){let o=this.visible.has(r)?this.entryIndex.get(r):void 0;o&&this.requestVars(o)}}onAtlasChange(){this.requestUpdate();for(let t of this.seen){let r=this.entryIndex.get(t);r&&this.requestVars(r)}}watchCards(){let t=Array.from(this.renderRoot.querySelectorAll('.card[data-key]:not([data-key="default"])'));if(typeof IntersectionObserver>"u"){for(let r of t.slice(0,Kh)){let o=this.entryIndex.get(r.dataset.key??"");o&&this.requestVars(o)}return}this.observer??=new IntersectionObserver(this.onIntersect,{rootMargin:"200px"});for(let r of t){let o=r.dataset.key??"";this.watched.get(r)!==o&&(this.watched.has(r)&&this.observer.unobserve(r),this.watched.set(r,o),this.observer.observe(r))}}async openEntry(t){if(Tt(t))return{entry:t,themes:ua()};let r=this.atlas.theme(t.full_name,t.last_commit)?.name,o=await fa(this.hassRef,this.known,this.cache,this.bundles,t,r);return{entry:t,...o}}async refreshCatalog(){return await this.loadCatalog(),this.entries}visibleEntries(){let t=this.query.trim().toLowerCase();return[...gn(this.filter,t)?[Jr]:[],...this.filtered(t).map(r=>r.entry)]}async selectTheme(t){if(!(this.busyName||!this.hassRef)){this.busyName=t.full_name,this.cardError=null;try{let r=await this.openEntry(t);this.dispatchEvent(new CustomEvent(li,{bubbles:!0,composed:!0,detail:r}))}catch(r){this.cardError={name:t.full_name,text:bi(r)}}finally{this.busyName=""}}}pickFilter(t){let r=qi(t,this.mode);r!==this.mode&&(this.modeTouched=!0,this.mode=r),this.filter=t}cardModel(t,r,o){let s=this.hassRef?.themes?.themes,i=ye(t),a=this.cache.get(i),d=a?void 0:this.states.get(i),c=this.atlas.state(t.full_name,this.mode,t.last_commit)==="ok";return{entry:t,key:i,mode:this.mode,vars:a?zi(a,this.mode):null,atlas:this.atlas,atlased:c,failed:d==="failed"||d==="limited",limited:d==="limited",installed:o,installedKind:Hi(t,r,this.installedSet,s,a),active:Ii(r,this.currentTheme),license:this.atlas.theme(t.full_name,t.last_commit)?.license,busy:this.busyName!=="",opening:this.busyName===t.full_name,error:this.cardError?.name===t.full_name?this.cardError.text:""}}filtered(t){let r=[];for(let o of this.entries){if(t&&!yi(o,t))continue;let s=this.cache.get(ye(o)),i=this.atlas.theme(o.full_name,o.last_commit),a=this.known.of(o.full_name,[i?.name,s?.name]),d=Oi(o,a,this.installedSet);Yi(this.filter,o,s,i,d)&&r.push({entry:o,names:a,installed:d})}return r}visibleCards(t){return[...gn(this.filter,t)?[ha(this.mode,()=>this.selectTheme(Jr))]:[],...this.filtered(t).map(({entry:o,names:s,installed:i})=>da(this.cardModel(o,s,i),()=>this.selectTheme(o)))]}render(){let t=this.query.trim().toLowerCase(),r=this.visibleCards(t),o=ma({count:this.filtered(t).length,ready:this.loaded&&!this.loading,catalog:this.entries.length,error:this.error,query:t,defaultShown:gn(this.filter,t)}),s=[...this.states.values()].includes("loading");return l`
      <section>
        ${this.error?l`<p class="banner" role="alert">${this.error}</p>`:u}
        ${this.error&&!this.fromCache&&!this.loading?l`<button
              class="btn retry"
              type="button"
              @click=${()=>{this.loadCatalog()}}
            >
              ${b.retry}
            </button>`:u}
        ${Zi({filter:this.filter,query:this.query,onFilter:i=>this.pickFilter(i),onSearch:this.onSearch})}
        <div class="live" role="status" aria-live="polite">
          ${this.fromCache?l`<p class="note">${b.cachedNote}</p>`:u}
          ${this.loading?l`<p>${b.loading}</p>`:u}
          ${o?l`<p>${o}</p>`:u}
          ${s?l`<span class="sr-only">${b.previewsLoading}</span>`:u}
        </div>
        <div class="grid">${r}</div>
      </section>
    `}};customElements.get("hats-lite-browse")||customElements.define("hats-lite-browse",no);var _t=[];var Vh=0,va=200;function F(e){Vh+=1,_t.length>=100&&_t.shift(),_t[_t.length]=e.length>va?e.slice(0,va):e}var Wh=new Set(["loadBackendTranslation","loadFragmentTranslation"]),qh=new Set(["call","send","set","fire","dispatch","post","put","patch","delete","remove","add","create","update","save","store","subscribe","unsubscribe","fetch","load","open","close","toggle","reload","restart","navigate","run","execute","invoke","emit","trigger","notify","turn","ws","api","login","logout","signout","upload","write","clear","reset","connect","disconnect","install","uninstall","enable","disable","start","stop","play","pause","push","publish","request","submit","register","revoke","refresh","resume","suspend","play","mute","press","click","dismiss","show","hide","edit","apply","change","select","activate","deactivate","cancel","confirm","reboot","shutdown","retry","sync","download","listen","attach","detach","mount","unmount","replace","insert","append","prepend","move","rename","copy","paste","kill","destroy","dispose","init","bootstrap","migrate","mutate"]),Gh=/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;function St(e){if(Wh.has(e))return"loader";if(typeof e!="string")return"blocked";let n=e.match(Gh);if(n===null)return"blocked";for(let t of n)if(qh.has(t.toLowerCase()))return"blocked";return"read"}var Xh=/^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|config\/entity_registry\/list_for_display$|auth\/current_user$|render_template$|history\/stream$|logbook\/event_stream$|subscribe_entities$|subscribe_events$|energy\/get_prefs$|energy\/info$|energy\/fossil_energy_consumption$|energy\/solar_forecast$|weather\/subscribe_forecast$|todo\/item\/list$|todo\/item\/subscribe$|calendar\/event\/subscribe$|recorder\/statistics_during_period$|recorder\/statistic_during_period$|recorder\/get_statistics_metadata$)/,Yh=new Set(["state_changed","entity_registry_updated","device_registry_updated","area_registry_updated","label_registry_updated","floor_registry_updated","lovelace_updated"]);function oo(e){return typeof e=="string"&&Yh.has(e)}var Zh=["/api/states","/api/config","/api/history","/api/logbook","/api/camera_proxy","/api/image_proxy","/api/media_player_proxy"],ro="x-http-method-override";function Qe(e){if(typeof e!="object"||e===null)return;let n={...e},t=n.type;if(typeof t=="string")return{type:t,msg:n}}function et(e){return e===void 0||!Xh.test(e.type)?!1:e.type==="subscribe_events"?oo(e.msg.event_type):!0}function tt(e){return`ws:${e?e.type:"invalid"}`}var Jh=/\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i,Qh=/@|%2f/i,em=/^[A-Za-z][A-Za-z0-9+.-]*:/;function vn(e,n=!1){return typeof e!="string"||e===""||Jh.test(e)||e.startsWith("//")||Qh.test(e.split(/[?#]/,1)[0])?!1:e.startsWith("/")?!0:n&&!em.test(e)}function tm(e){return`/api/${e.split(/[?#]/,1)[0].replace(/^\/+/,"").replace(/^api\//,"")}`}function wn(e){let n=tm(e);return Zh.some(t=>n===t||n.startsWith(`${t}/`))}function so(e){if(e==null)return!1;let n=e;return typeof Headers<"u"&&e instanceof Headers?e.has(ro):Array.isArray(e)?e.some(t=>Array.isArray(t)&&String(t[0]).toLowerCase()===ro):typeof n=="object"?Object.keys(e).some(t=>t.toLowerCase()===ro):!1}function xn(e){return typeof e=="string"?e:"invalid"}function kn(e){return e==null||typeof e=="string"&&e.toUpperCase()==="GET"?"GET":null}function $n(e){return typeof e=="string"?e.toUpperCase():"invalid"}var x=Reflect.apply,we=Reflect.has,ie=Reflect.ownKeys,xe=Reflect.getOwnPropertyDescriptor,Tn=Reflect.getPrototypeOf,wa=Object.setPrototypeOf,xa=Object.freeze,ka=Reflect.defineProperty,At=Array.isArray,$a=Math.trunc,nm=WeakMap.prototype.get,rm=WeakMap.prototype.set,ux=WeakMap.prototype.has,om=WeakSet.prototype.has,sm=WeakSet.prototype.add,im=Object.prototype.hasOwnProperty,am=Object.prototype.propertyIsEnumerable,lm=Function.prototype.bind,dm=Object.getOwnPropertyDescriptor(Map.prototype,"size")?.get,cm=Object.getOwnPropertyDescriptor(Set.prototype,"size")?.get,Ea=Date.prototype.getTime,Ta=Object.prototype.toString;function Q(e,n){return x(nm,e,[n])}function ue(e,n,t){x(rm,e,[n,t])}function Mt(e,n){return x(om,e,[n])}function En(e,n){x(sm,e,[n])}function ke(e,n){return x(im,e,[n])}function _a(e,n){return x(am,e,[n])}function Sa(e,n){return x(lm,e,[n])}function io(e,n){try{return x(e,n,[]),!0}catch{return!1}}function ao(e){try{return x(Ta,e,[])}catch{return""}}function _n(e){return ao(e)==="[object Map]"&&io(dm,e)}function Sn(e){return ao(e)==="[object Set]"&&io(cm,e)}function Ma(e){return ao(e)==="[object Date]"&&io(Ea,e)}function Aa(e){return x(Ea,e,[])}function Ca(e){try{return x(Ta,e,[])==="[object Promise]"}catch{return!1}}var Pa=new WeakSet,Ra=new WeakSet;function Da(e){if(!(typeof e!="object"||e===null)){En(Pa,e);for(let n of ie(e)){let t=xe(e,n);t&&typeof t.get=="function"&&En(Ra,t.get)}}}for(let e of[Object,Function,Array,Map,Set,WeakMap,WeakSet,Date,Promise,RegExp,Error,String,Number,Boolean,Symbol,ArrayBuffer,DataView])Da(e.prototype);for(let e of["URL","URLSearchParams","Headers","Request","Response","Blob","EventTarget"]){let n=globalThis[e];typeof n=="function"&&Da(n.prototype)}function R(e,n,t){let r=e;for(;r!==null;){let o=xe(r,n);if(o){if(ke(o,"value"))return o.value;let s=o.get;if(typeof s!="function")return;let i=Mt(Pa,r)&&!Mt(Ra,s);return x(s,i?t:e,[])}r=Tn(r)}}function La(){return{disposed:!1,unsubs:new Set,epoch:0,connections:new WeakMap}}function Oa(e){e.epoch+=1;for(let n of[...e.unsubs])try{n()}catch{continue}e.unsubs.clear()}var um=new Set(["ready","disconnected"]);function Ia(e,n){if(typeof e!="object"||e===null)return;let t=Q(n.connections,e);if(t)return t;let r=e,o=n,s=()=>{},i=(h,...p)=>{let g=R(r,h,void 0);if(typeof g!="function")throw new TypeError(`Connection has no ${h}`);return x(g,r,p)},a=new Map;async function d(h,p){if(n.disposed)return s;let g=o.epoch,E=await p((...S)=>{!n.disposed&&typeof h=="function"&&x(h,void 0,S)});if(typeof E!="function")return s;if(n.disposed||o.epoch!==g)return E(),s;let A=()=>{o.unsubs.delete(A)&&E()};return o.unsubs.add(A),A}let c={get connected(){return R(r,"connected",void 0)},get haVersion(){return R(r,"haVersion",void 0)},socket:void 0,suspendReconnectUntil:s,async sendMessagePromise(h){let p=Qe(h);if(et(p)&&!n.disposed)return i("sendMessagePromise",p.msg);F(tt(p))},sendMessage(h,p){let g=Qe(h);if(et(g)&&!n.disposed)return i("sendMessage",g.msg,p);F(tt(g))},async subscribeMessage(h,p,g){let y=Qe(p);return et(y)?d(h,E=>i("subscribeMessage",E,y.msg,g)):(F(tt(y)),s)},async subscribeEvents(h,p){return oo(p)?d(h,g=>i("subscribeEvents",g,p)):(F(`ws:subscribe_events:${typeof p=="string"?p:"invalid"}`),s)},addEventListener(h,p){if(typeof h!="string"||!um.has(h)||typeof p!="function"){F(`event-listener:${typeof h=="string"?h:"invalid"}`);return}if(n.disposed)return;let g=a.get(h);if(g||(g=new Map,a.set(h,g)),g.has(p))return;let y=(S,...U)=>{n.disposed||x(p,c,[c,...U])},E=g,A=()=>{o.unsubs.delete(A)&&(E.delete(p),i("removeEventListener",h,y))};E.set(p,{forward:y,release:A}),i("addEventListener",h,y),o.unsubs.add(A)},removeEventListener(h,p){if(typeof h!="string")return;let g=a.get(h)?.get(p);g&&(a.get(h)?.delete(p),o.unsubs.delete(g.release),i("removeEventListener",h,g.forward))}};return pm(c),ue(n.connections,e,c),c}function pm(e){for(let n of ie(e)){let t=xe(e,n);if(!t)continue;let r=Object.create(null);r.configurable=!1,r.enumerable=t.enumerable,ke(t,"value")?(r.value=t.value,r.writable=!1):(r.get=t.get,r.set=t.set),ka(e,n,r)}}var Pt=Set.prototype,Ba=Map.prototype,Ua=Pt.has,Ct=Pt.add,hm=Pt.delete,ja=Pt.values,mm=Object.getOwnPropertyDescriptor(Pt,"size")?.get,fm=Object.getOwnPropertyDescriptor(Ba,"size")?.get,gm=Ba.keys,za=Object.getPrototypeOf(new Set().values()).next,bm=Object.getPrototypeOf(new Map().keys()).next,uo=["union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"];function lo(e){return typeof e=="object"&&e!==null||typeof e=="function"}function co(e,n,t){let r=[];for(;;){let o=x(n,e,[]);if(o.done)return r;r[r.length]=t(o.value)}}function ym(e){return co(x(ja,e,[]),za,n=>n)}function Ha(e,n){let t=new Set;for(let r=0;r<n.length;r+=1)x(Ct,t,[n[r]]);return{size:e,has:r=>x(Ua,t,[r]),open(){let r=0;return{step:()=>r<n.length?{done:!1,value:n[r++]}:{done:!0},close(){}}}}}function vm(e){let n=+e;if(n!==n)throw new TypeError("Set-like size is invalid");let t=$a(n);if(t<0)throw new RangeError("Set-like size is negative");return t}function wm(e,n){if(!lo(e))throw new TypeError("Set-like expected");let t=n.ownerOf(e),r=t??e;if(typeof r=="object"&&Sn(r)){let a=co(x(ja,r,[]),za,n.unwrap);return Ha(x(mm,r,[]),a)}if(typeof r=="object"&&_n(r)){let a=co(x(gm,r,[]),bm,n.unwrap);return Ha(x(fm,r,[]),a)}let o=vm(R(r,"size",e)),s=R(r,"has",e);if(typeof s!="function")throw new TypeError("Set-like has must be a function");let i=R(r,"keys",e);if(typeof i!="function")throw new TypeError("Set-like keys must be a function");return{size:o,has:a=>!!x(s,r,[t?a:n.view(a)]),open(){let a=x(i,r,[]);if(!lo(a))throw new TypeError("Set-like keys must return an object");let d=R(a,"next",a);if(typeof d!="function")throw new TypeError("Set-like iterator next must be a function");return{step(){let c=x(d,a,[]);if(!lo(c))throw new TypeError("Set-like iterator result must be an object");return R(c,"done",c)?{done:!0}:{done:!1,value:n.unwrap(R(c,"value",c))}},close(){let c=R(a,"return",a);typeof c=="function"&&x(c,a,[])}}}}}function xm(e){let n=new Set;for(let t=0;t<e.length;t+=1)x(Ct,n,[e[t]]);return n}function Mn(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return;n(r.value)}}function Na(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return!1;if(n(r.value))return t.close(),!0}}function Fa(e,n){for(let t=0;t<e.length;t+=1)if(n(e[t]))return!0;return!1}function Ka(e,n,t,r){let o=wm(t,r),s=ym(n),i=s.length<=o.size,a=p=>x(Ua,n,[p]),d=xm(s),c=p=>{x(Ct,d,[p])},h=p=>{x(hm,d,[p])};switch(e){case"union":return Mn(o,c),d;case"intersection":{let p=new Set;if(i)for(let g=0;g<s.length;g+=1)o.has(s[g])&&x(Ct,p,[s[g]]);else Mn(o,g=>{a(g)&&x(Ct,p,[g])});return p}case"difference":if(i)for(let p=0;p<s.length;p+=1)o.has(s[p])&&h(s[p]);else Mn(o,h);return d;case"symmetricDifference":return Mn(o,p=>a(p)?h(p):c(p)),d;case"isSubsetOf":return s.length<=o.size&&!Fa(s,p=>!o.has(p));case"isSupersetOf":return s.length>=o.size&&!Na(o,p=>!a(p));default:return i?!Fa(s,o.has):!Na(o,a)}}var po=new WeakMap,Xa=new WeakSet,ho=new WeakMap,Va=new WeakMap,$e=Map.prototype,Ie=Set.prototype,Ya=new Map([["has",$e.has],["get",$e.get],["keys",$e.keys],["values",$e.values],["entries",$e.entries],["forEach",$e.forEach],[Symbol.iterator,$e[Symbol.iterator]]]),Za=new Map([["has",Ie.has],["keys",Ie.keys],["values",Ie.values],["entries",Ie.entries],["forEach",Ie.forEach],[Symbol.iterator,Ie[Symbol.iterator]]]),km=Object.getOwnPropertyDescriptor($e,"size")?.get,$m=Object.getOwnPropertyDescriptor(Ie,"size")?.get,Em=Object.getPrototypeOf(new Map().entries()).next,Tm=Object.getPrototypeOf(new Set().values()).next,_m=Promise.prototype.then,Ja=new Map,Qa=new WeakSet,el=new Map,tl=new Map;function nl(e,n){for(let t of ie(e)){if(t==="constructor")continue;let r=xe(e,t);r&&typeof r.value=="function"&&(Qa.add(r.value),n.set(t,r.value))}}nl(Object.prototype,tl);nl(Array.prototype,el);function Wa(e,n){let t=xe(e,n);return t&&ke(t,"value")?t.value:void 0}function rl(e,n,t){if(t){let o=el.get(n);if(o!==void 0&&Wa(Array.prototype,n)===e)return o}let r=tl.get(n);if(r!==void 0&&Wa(Object.prototype,n)===e)return r}for(let e of["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"])Ja.set(e,Object.prototype[e]);var qa=xa(Object.create(null)),Sm=new Set(["toString","toJSON","toLocaleString","valueOf"]),Mm=new Set(["get","getAll","has","toISOString"]);function Am(e){if(typeof e!="object"||e===null)return!1;if(At(e))return!0;let n=Tn(e);return n===Object.prototype||n===null}function Cm(){throw new TypeError("Read-only")}function ol(e){let n=Q(Va,e);if(n)return n;let t=function(){throw new TypeError("Read-only view: functions on this value cannot be called")};return wa(t,null),ue(Va,e,t),t}function Cn(e){return typeof e!="object"||e===null?e:Q(ho,e)??e}function Pm(e,n){return(...t)=>{let r=[];for(let o=0;o<t.length;o+=1)r[o]=Cn(t[o]);return D(x(e,n,r))}}function sl(e,n,t,r){let o=R(e,n,r);if(typeof o!="function")return D(o);if(Mt(Qa,o))return o;let s=rl(o,n,At(e));return s!==void 0?s:Sm.has(n)||!t&&Mm.has(n)?Pm(o,e):ol(o)}function*Rm(e,n){for(;;){let t=x(n,e,[]);if(t.done)return;yield D(t.value)}}function Dm(e,n,t){let r=xe(e,n);if(r)return At(t)&&n==="length"?{value:R(e,n,void 0),writable:!0,enumerable:!1,configurable:!1}:ke(r,"value")?{value:D(r.value),writable:!1,enumerable:r.enumerable,configurable:!0}:{get:()=>D(R(e,n,Q(po,e))),set:void 0,enumerable:r.enumerable,configurable:!0}}function mo(e){return{has:(n,t)=>we(e,t),ownKeys:()=>ie(e),getOwnPropertyDescriptor:(n,t)=>Dm(e,t,n),getPrototypeOf:()=>Tn(e),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1}}function Lm(e){return{...mo(e),get:(n,t,r)=>sl(e,t,!0,r)}}function Om(e){let n=Ca(e),t=(r,o)=>x(_m,e,[s=>typeof r=="function"?r(D(s)):D(s),s=>{if(typeof o=="function")return o(D(s));throw D(s)}]);return{...mo(e),getPrototypeOf:()=>qa,get(r,o,s){return o==="constructor"||o==="__proto__"?qa:n&&o==="then"?t:n&&o==="catch"?i=>t(void 0,i):n&&o==="finally"?i=>t(a=>(typeof i=="function"&&i(),a),a=>{throw typeof i=="function"&&i(),a}):sl(e,o,!1,s)}}}var Im=new Set([...Ya.keys()]),Hm=new Set([...Za.keys(),...uo]),Nm=new Set(uo),Fm=new Set(["keys","values","entries",Symbol.iterator]),Bm={unwrap:Cn,view:e=>D(e),ownerOf:e=>Q(ho,e)};function Ga(e,n,t){let r=t?Hm:Im,o=t?Za:Ya,s=t?$m:km,i=t?Tm:Em,a=new Proxy(n,{...mo(e),get(d,c){if(c==="constructor"||c===Symbol.species)return R(e,c,a);if(c==="size")return x(s,e,[]);if(r.has(c)){if(Nm.has(c))return y=>{let E=Ka(c,e,y,Bm);return typeof E=="boolean"?E:D(E)};let g=o.get(c);return c==="get"?y=>D(x(g,e,[Cn(y)])):c==="has"?y=>x(g,e,[Cn(y)]):Fm.has(c)?()=>Rm(x(g,e,[]),i):(y,E)=>x(g,e,[(A,S)=>x(y,E,[D(A),D(S),a])])}let h=R(e,c,a);if(typeof h!="function")return D(h);let p=Ja.get(c);return p!==void 0&&(p===h||rl(h,c,!1)===p)?c==="valueOf"?()=>a:(...g)=>x(p,e,g):Cm}});return a}function An(e,n){return ue(po,e,n),En(Xa,n),ue(ho,n,e),n}function D(e){if(typeof e=="function")return ol(e);if(typeof e!="object"||e===null||Mt(Xa,e))return e;let n=Q(po,e);if(n)return n;if(Ma(e))return new Date(Aa(e));if(_n(e))return An(e,Ga(e,new Map,!1));if(Sn(e))return An(e,Ga(e,new Set,!0));if(!Am(e))return An(e,new Proxy({},Om(e)));let t=At(e)?[]:{};return An(e,new Proxy(t,Lm(e)))}var ll=new WeakMap,il=new WeakMap,Um=Symbol("shared");function dl(e){let n=Q(ll,e);n&&(n.state.disposed=!0,Oa(n.state))}function jm(e,n){let t=R(e,"connection",void 0),r=typeof t=="object"&&t!==null?t:e,o=Q(il,r);o||(o=new Map,ue(il,r,o));let s=o.get(n);if(s&&!s.disposed)return s;let i=La();return o.set(n,i),i}var al=new Map(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"].map(e=>[e,Object.prototype[e]])),zm="Preview closed: this read-only hass has been disposed";function cl(e,n=Um){let t=e,r=jm(t,n),o=()=>{if(r.disposed)throw new Error(zm)},s=new Proxy({},{has(i,a){return a!=="auth"&&we(t,a)},ownKeys(){return ie(t).filter(i=>i!=="auth")},getOwnPropertyDescriptor(i,a){if(!(a==="auth"||!we(t,a)))return{value:s[a],enumerable:!0,configurable:!0,writable:!1}},get(i,a){if(a==="auth")return;let d=R(t,a,s);if(a==="connection")return Ia(d,r);if(al.has(a)&&d===al.get(a))return a==="hasOwnProperty"?h=>h!=="auth"&&ke(t,h):a==="valueOf"?()=>s:a==="toString"||a==="toLocaleString"?()=>"[object Object]":a==="isPrototypeOf"?()=>!1:h=>h!=="auth"&&_a(t,h);if(typeof d!="function")return D(d);let c=d;switch(a){case"callService":return async(h,p)=>{F(`service:${String(h)}.${String(p)}`)};case"callWS":return async h=>{o();let p=Qe(h);if(et(p))return x(c,t,[p.msg]);F(tt(p))};case"callApi":return async(h,p,...g)=>{if(o(),typeof h=="string"&&kn(h)){if(!vn(p,!0)||!wn(p)){F(`api-path:${xn(p)}`);return}return x(c,t,[h,p,...g])}F(`api:${$n(h)}`)};case"callApiRaw":return async(h,p,g,y,...E)=>{if(o(),typeof h!="string"||!kn(h)){F(`api:${$n(h)}`);return}if(!vn(p,!0)||!wn(p)){F(`api-path:${xn(p)}`);return}let A=typeof y=="object"&&y!==null?{...y}:y;if(so(A)){F("api-header:method-override");return}return x(c,t,[h,p,g,A,...E])};case"fetchWithAuth":return async(h,p)=>{if(o(),!vn(h)||!wn(h)){F(`fetch-path:${xn(h)}`);return}if(p==null)return x(c,t,[h,p]);let g={...p};if(so(g.headers)){F("fetch-header:method-override");return}let y=g.method;if(!kn(y)){F(`fetch:${$n(y)}`);return}return x(c,t,[h,g])};default:return St(a)==="loader"?Sa(c,t):St(a)==="read"?(...h)=>D(x(c,t,h)):async()=>{F(String(a))}}},set(){return!1},defineProperty(){return!1},deleteProperty(){return!1},setPrototypeOf(){return!1},preventExtensions(){return!1}});return ue(ll,s,{state:r}),s}function Pn(e){return Number.isFinite(e)?Math.min(98,Math.max(2,e)):50}function ul(e,n){return n.width>0?Pn((e-n.left)/n.width*100):50}function pl(e){return`inset(0 0 0 ${e}%)`}var Km="__default__",Vm=6,Wm=8,qm=160,hl=["light","switch","climate","cover","media_player","sensor","binary_sensor"],Gm=new Set(["person","zone","sun","update","event","conversation","tts","todo","weather"]);function fo(e){return e??Km}function Xm(e){return L(e)&&e.code==="config_not_found"}function Ym(e){let n=L(e)?e.message:e;return typeof n=="string"?Array.from(n).slice(0,qm).join(""):""}async function ml(e,n){try{return{status:"ok",config:await Ci(e,n)}}catch(t){return Xm(t)?{status:"notfound"}:{status:"error",reason:Ym(t)}}}async function fl(e,n,t){let r=[];for(let o of e){let s=await n(o.url_path);if(t())return{entries:r,stale:!0};if(r.push(s),s.status==="ok"&&Rt(s.config))return{hit:{entry:s,urlPath:o.url_path},entries:r,stale:!1}}return{entries:r,stale:!1}}function Rt(e){return e?zr(e).some(n=>Kr(n).length>0):!1}function gl(e){let n=new Map;for(let i of Object.keys(e??{})){let a=i.indexOf(".");if(a<=0)continue;let d=i.slice(0,a),c=n.get(d)??[];c.push(i),n.set(d,c)}let t=[...n.keys()].filter(i=>!hl.includes(i)&&!Gm.has(i)).sort(),r=[...hl.filter(i=>n.has(i)),...t];r.length===0&&(r=[...n.keys()].sort());let o=new Map(Object.entries(f.domainTitles)),s=r.slice(0,Vm).map(i=>({type:"entities",title:o.get(i)??i,entities:(n.get(i)??[]).sort().slice(0,Wm)}));if(s.length!==0)return{views:[{title:f.sampleView,cards:s}]}}function bl(e){return e.status==="notfound"?f.generatedDefault:e.reason?`${f.loadError} ${e.reason}`:f.loadError}function yl(e,n){let t=e?zr(e):[];if(t.length===0)return{views:t,cards:[],notice:f.noViews};if(!Rt(e))return{views:t,cards:[],notice:f.noCards};let r=Kr(t[n]??t[0]);return Vr(r)>ki?{views:t,cards:[],notice:f.tooManyCards}:{views:t,cards:r,notice:r.length===0?f.emptyView:""}}function vl(e,n){return e.find(t=>t.url_path===n)?.title??f.defaultDashboard}var Zm="hats_lite_compare",Jm="hats_lite_compare_designer";function wl(e){return e?Zm:Jm}function xl(e=!0){try{let n=window.localStorage.getItem(wl(e));return n===null?e:n!=="0"}catch{return e}}function kl(e,n=!0){try{window.localStorage.setItem(wl(n),e?"1":"0")}catch{return}}var El="hats_lite_preview_menu";var Tl={menu:"M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z",overview:"M13 3v6h8V3zM13 21h8V11h-8zM3 21h8v-6H3zM3 13h8V3H3z",map:"M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z",logbook:"M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 11h2v2H3zM3 17h2v2H3z",history:"M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z",energy:"M13 2 4 14h6l-1 8 9-12h-6z",settings:"M10.5 2h3l.5 2.6 1.8.8 2.2-1.5 2.1 2.1-1.5 2.2.8 1.8 2.6.5v3l-2.6.5-.8 1.8 1.5 2.2-2.1 2.1-2.2-1.5-1.8.8-.5 2.6h-3L10 20.4l-1.8-.8-2.2 1.5-2.1-2.1 1.5-2.2-.8-1.8L2 13.5v-3l2.6-.5.8-1.8-1.5-2.2L6 3.9l2.2 1.5 1.8-.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",bell:"M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4.5-5.8V4.5a1.5 1.5 0 0 0-3 0v.7A6 6 0 0 0 6 11v5l-2 2v1h16v-1z",search:"M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3zm0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z",more:"M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"},_l=["overview","map","logbook","history","energy"],Sl=["settings","bell"];function Ml(){try{return window.localStorage.getItem(El)!=="0"}catch{return!0}}function Al(e){try{window.localStorage.setItem(El,e?"1":"0")}catch{return}}function Cl(e,n){return n&&e!=="phone"}var $l={desktop:0,tablet:820,phone:390};function Pl(e,n){return e==="desktop"?"100%":n?`calc(${$l[e]}px + var(--hats-lite-sidebar-width))`:`${$l[e]}px`}function Rl(e){return e?"calc(256px * var(--hats-lite-density-scale, 1))":"0px"}function Qm(e){return e.startsWith("card-mod-")||e.startsWith("uix-")}function Dt(e){if(!e)return!1;let n=e.entry;return(n?[n.vars,n.modes?.dark,n.modes?.light]:[e.vars]).some(r=>Object.keys(r??{}).some(Qm))}var Dl=/^[A-Za-z0-9_.-]+$/,ef={marketplace:"the Marketplace",hacs:"HACS",generic:"the Marketplace or HACS"},tf={marketplace:"Marketplace",hacs:"HACS",generic:"Marketplace or HACS"};function He(e){let n=e?.config?.components;return Array.isArray(n)?n.includes("marketplace")?"marketplace":n.includes("hacs")?"hacs":"generic":"generic"}function nf(e){return ef[e]}function rf(e){return tf[e]}function ee(e,n){return e.replaceAll("{store}",nf(n)).replaceAll("{label}",rf(n))}function Rn(e,n,t,r){if(!Dl.test(n)||!Dl.test(t))return;let o=new URLSearchParams({owner:n,repository:t,category:r});return e==="marketplace"?`/marketplace/repository?${o.toString()}`:`https://my.home-assistant.io/redirect/hacs_repository/?${o.toString()}`}var of="hats_lite/install_theme",sf="hats_lite/uninstall_theme",Ll="hats-lite-theme-installed",af=12e3,Lt=0,lf=/^https:\/\/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;function Ol(e,n){let t=n?lf.exec(n):null;if(t)return Rn(e,t[1],t[2],"theme")}function Il(e){if(typeof e!="object"||e===null)return"";let n=e.code;return typeof n=="string"?n:""}function df(e,n="install",t="generic"){let r=Il(e),o=n==="install"?f.installErrors:f.uninstallErrors,s=Object.prototype.hasOwnProperty.call(o,r)?o[r]:o.unknown;return ee(s,t)}function Hl(){return Lt>0}var Dn=class{constructor(n){this.host=n;this.phase="idle";this.op="install";this.error="";this.stale=!1;this.epoch=0}set(n,t=""){this.phase=n,this.error=t,this.host.requestUpdate()}focus(n){this.host.updateComplete.then(()=>this.host.renderRoot.querySelector(n)?.focus())}button(){return this.op==="install"?".install":".uninstall"}clearTimer(){this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}dispose(){this.epoch+=1,this.clearTimer()}clearStale(){this.stale=!1}settle(n){this.phase!=="done"||this.op!==n||(this.clearTimer(),this.set("idle"))}begin(n){this.phase!=="idle"||Lt>0||(this.op=n,this.set("confirm"),this.focus(".install-confirm"))}cancel(){this.phase==="confirm"&&(this.set("idle"),this.focus(this.button()))}reset(){this.stale=!1,this.epoch+=1,this.clearTimer(),(this.phase!=="idle"||this.error)&&this.set("idle")}async run(n,t,r,o){if(this.phase!=="confirm"||!n||Lt>0)return;let s=He(n),i=this.epoch,a=this.op;this.set("busy"),this.focus(this.button()),Lt+=1;let d=!1,c="",h;try{let p={type:a==="install"?of:sf,full_name:t.fullName,hacs_id:t.hacsId};a==="uninstall"&&o&&(p.selected_theme=o);let g=await P(n,p);typeof g?.reset_selected=="boolean"&&(h=g.reset_selected)}catch(p){if(d=Il(p)==="reload_failed",c=df(p,a,s),!d){i===this.epoch&&this.set("idle",c),this.focus(this.button());return}}finally{Lt-=1,this.host.requestUpdate()}r({fullName:t.fullName,partial:d,...a==="uninstall"?{removed:!0,resetSelected:h}:{}}),i===this.epoch&&(a==="uninstall"&&(this.stale=!0),this.set(d?"idle":"done",c),!d&&(this.focus(this.button()),this.timer=setTimeout(()=>{this.timer=void 0,!(i!==this.epoch||this.phase!=="done")&&(this.set("idle",ee(a==="install"?f.installTimeout:f.uninstallTimeout,s)),r({fullName:t.fullName,partial:!0}))},af)))}};var Nl="hats-lite-preview-nav",cf="select, input, textarea, [role='slider'], [contenteditable]";function Fl(e){if(e.defaultPrevented||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return 0;let n=e.composedPath()[0];return n instanceof Element&&n.closest(cf)?0:e.key==="ArrowLeft"?-1:1}function nt(e,n,t){let r=e+t;return r<0||r>=n?null:r}function uf(e){return f.navPosition.replace("{name}",e.name).replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}function pf(e,n){return e.locked===!0||nt(e.index,e.total,n)===null}function Bl(e){return l`
    <div class="nav" role="group" aria-label=${f.navGroup}>
      <span class="nav-info">
        <span class="nav-name">${e.name}</span>
        <span class="nav-pos">${f.navCount.replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}</span>
      </span>
      <span class="sr-only" role="status" aria-live="polite">${e.pending?f.navLoading:e.error||uf(e)}</span>
    </div>`}function go(e,n,t){let r=pf(e,n),o=n===-1;return l`
    <div class=${o?"nav-side nav-side-prev":"nav-side nav-side-next"}>
      <button type="button" class=${o?"nav-btn nav-prev":"nav-btn nav-next"}
        aria-label=${o?f.navPrev:f.navNext} aria-disabled=${r?"true":"false"}
        @click=${()=>{r||t(n)}}>${o?"←":"→"}</button>
    </div>`}async function Ul(e,n,t){let r=window.hatsLite;if(!r)return f.trialUnavailable;try{return await r.startTrial(Ti(e),_i(n,t)),""}catch{return f.trialFailed}}function bo(e,n,t){if(e)return e;if(!n)return;let r=t?.themes?.darkMode?"dark":"light";return n===r?void 0:n}var rt=e=>e??u;function yo(e){return e.show&&e.admin&&e.hasTarget}function vo(e){return e.stale||e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done")}function hf(e){return e.op==="install"&&e.phase==="busy"?f.installBusy:e.op==="install"&&e.phase==="done"?f.installLoading:f.installButton}function jl(e,n){let t=e.op==="install"&&(e.phase==="busy"||e.phase==="done"),r=t||e.locked||e.phase==="confirm";return l`<button type="button" class="btn primary success install" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} @click=${()=>{r||n.onBegin("install")}}>${hf(e)}</button>`}function mf(e){return e.op!=="uninstall"?f.uninstallButton:e.phase==="busy"?f.uninstallBusy:e.phase==="done"?f.uninstallUpdating:f.uninstallButton}function zl(e,n){if(!e.canUninstall)return u;let t=e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done"),r=vo(e)||e.locked||e.inUse||e.phase==="confirm",o=()=>{r||n.onBegin("uninstall")};return l`
    <button type="button" class="btn danger uninstall" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} aria-describedby=${rt(e.inUse?"uninstall-hint":void 0)} @click=${o}>${mf(e)}</button>
    ${e.inUse?l`<p id="uninstall-hint" class="chip note">${f.uninstallSwitchFirst}</p>`:u}`}function ff(e){return e.storeHref?l`<a class="chip link store-link" href=${e.storeHref} target="_blank" rel="noopener noreferrer">${ee(f.openInStore,e.store)}</a>`:u}function gf(e){return n=>{if(n.key==="Escape"){n.stopPropagation(),e.onCancel();return}if(n.key!=="Tab")return;let t=n.currentTarget,r=Array.from(t.querySelectorAll("button")),o=r[0],s=r[r.length-1],i=t.getRootNode().activeElement;n.shiftKey&&i===o?(n.preventDefault(),s.focus()):!n.shiftKey&&i===s&&(n.preventDefault(),o.focus())}}function bf(e,n){let t=e.op==="uninstall",r=()=>{e.locked||n.onConfirm()},o=ee(t?f.uninstallConfirmBody:f.installConfirmBody,e.store);return l`
    <div class="install-dialog" role="alertdialog" aria-labelledby="install-title" aria-describedby="install-body" @keydown=${gf(n)}>
      <strong id="install-title">${t?f.uninstallConfirmTitle:f.installConfirmTitle}</strong>
      <p id="install-body">${o.replace("{repo}",e.repoName)}</p>
      <button type="button" class="btn install-confirm ${t?"danger":"primary success"}" aria-disabled=${e.locked?"true":"false"} @click=${r}>${t?f.uninstallConfirmYes:f.installConfirmYes}</button>
      <button type="button" class="btn install-cancel" @click=${n.onCancel}>${f.installCancel}</button>
    </div>`}function yf(e){return e.phase==="busy"?e.op==="install"?f.installBusy:f.uninstallBusy:e.phase==="done"?e.op==="install"?f.installWaiting:f.uninstallWaiting:""}function Kl(e,n){let t=e.phase==="confirm"&&(yo(e)||e.canUninstall)?bf(e,n):u,r=yf(e),o=l`<span class="sr-only install-status" role="status">${r}</span>`,s=u;e.show&&!e.admin?s=l`<p class="chip note">${ee(f.adminOnly,e.store)}</p>`:e.show&&!e.hasTarget&&(s=l`<p class="chip note">${ee(f.installViaStore,e.store)}</p>`);let i=e.show&&(!e.admin||!e.hasTarget||e.error!=="");return l`${s}${t}${o}${i?ff(e):u}`}var ql="/hats_lite_static/real",vf="/hats_lite_real",Vl=/^\w[\w.-]*\/\w[\w.-]*\.webp$/,wf=/^[0-9a-f]{7,40}$/,Gl={fetchIndex(){return fetch(`${ql}/index.json`,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(String(e.status));return e.json()})},fetchRemote(e){return e.connection.sendMessagePromise({type:"hats_lite/real_index"})}},xf=300*1e3,Wl=null,pe=null;function kf(e,n=ql){let t=e;return!t||t.version!==1||!Array.isArray(t.items)?[]:Xl(t.items,n)}function $f(e){let n=e;return!n||!Array.isArray(n.items)?[]:Xl(n.items,vf)}function Xl(e,n){let t=[];for(let r of e){if(!r||typeof r!="object")continue;let{full_name:o,name:s,commit:i,dark:a,light:d}=r;if(typeof o!="string"||typeof s!="string"||typeof i!="string"||!wf.test(i))continue;let c=typeof a=="string"&&Vl.test(a),h=typeof d=="string"&&Vl.test(d);!c&&!h||t.push({full_name:o,name:s,base:n,commit:i,dark:c?a:"",light:h?d:""})}return t}function Ef(){return Promise.resolve().then(()=>Gl.fetchIndex()).then(e=>kf(e)).catch(()=>[])}function Tf(e){let n={at:Date.now(),settled:!1,empty:!0,promise:Promise.resolve([])};return n.promise=Promise.resolve().then(()=>Gl.fetchRemote(e)).then($f).catch(()=>[]).then(t=>(n.settled=!0,n.empty=t.length===0,t)),n}function _f(e){let n=pe&&pe.settled&&pe.empty&&Date.now()-pe.at>=xf;return(!pe||n)&&(pe=Tf(e)),pe}function Yl(e){Wl??=Ef();let n=e?_f(e).promise:pe?pe.promise:Promise.resolve([]);return Promise.all([Wl,n]).then(([t,r])=>{let o=new Set(t.map(s=>`${s.full_name}
${s.name}`));return[...t,...r.filter(s=>!o.has(`${s.full_name}
${s.name}`))]})}function Zl(e,n,t){if(!(!n||!t))return e.find(r=>r.full_name===n&&r.name===t)}function Jl(e,n){let t=n==="dark"?"light":"dark";for(let r of[n,t])if(e[r])return{url:`${e.base}/${e[r]}`,mode:r};return null}function Ql(e,n){if(!e.available)return u;let t=r=>()=>{e.real!==r&&n(r)};return l`
    <div class="field look-switch">${f.lookLabel}
      <div class="seg" role="group" aria-label=${f.lookLabel}>
        <button type="button" class="look-real" aria-pressed=${e.real?"true":"false"} @click=${t(!0)}>${f.realLook}</button>
        <button type="button" class="look-live" aria-pressed=${e.real?"false":"true"} @click=${t(!1)}>${f.livePreview}</button>
      </div>
    </div>`}function ed(e,n,t){let r=Jl(e,n);if(!r)return u;let o=f.realAlt.replace("{name}",e.name).replace("{mode}",f[r.mode].toLowerCase());return l`
    <figure class="real-look">
      <img src=${r.url} alt=${o} decoding="async" @error=${t} />
      <figcaption class="footnote real-caption">${f.realCaption.replace("{commit}",e.commit)}</figcaption>
    </figure>`}var td=T`
  .real-look {
    margin: 0;
  }
  .real-look img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: var(--hl-radius-lg);
    border: 1px solid var(--hl-line);
    box-shadow: var(--hl-shadow);
    background: var(--hl-bg);
  }
  .compare-hint {
    font-size: 13px;
    color: var(--hl-muted);
    align-self: center;
  }
`;function Ot(e){return l`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${si`<path d=${Tl[e]} fill="currentColor" fill-rule="evenodd"></path>`}</svg>`}function nd(e,n){return l`<div class=${n?"item selected":"item"}>${Ot(e)}<span class="text">${f.shell[e]}</span></div>`}function Sf(){return l`
    <div class="sidebar">
      <div class="side-menu"><span class="side-burger">${Ot("menu")}</span><span class="side-title">${f.shell.title}</span></div>
      <div class="side-list">${_l.map((e,n)=>nd(e,n===0))}</div>
      <div class="side-list fixed">
        ${Sl.map(e=>nd(e,!1))}
        <div class="item user"><span class="avatar">${f.shell.profile.charAt(0)}</span><span class="text">${f.shell.profile}</span></div>
      </div>
    </div>`}function Mf(e){return l`
    <div class="appbar">
      <span class="hamburger">${Ot("menu")}</span>
      <span class="title">${e}</span>
      <span class="tools">${Ot("search")}${Ot("more")}</span>
    </div>`}function wo(e){return l`
    <div class="shell" aria-hidden="true" inert>
      ${Sf()}
      <div class="main">${Mf(e)}<div class="cards" inert></div></div>
    </div>`}function rd(e,n){let t=e.frame==="phone",r=o=>()=>{e.menu!==o&&n.onMenu(o)};return l`
    <div class="field menu-switch">${f.menu}
      <div class="seg" role="group" aria-label=${f.menu}>
        <button type="button" class="menu-on" aria-pressed=${e.menu?"true":"false"} ?disabled=${t} @click=${r(!0)}>${f.on}</button>
        <button type="button" class="menu-off" aria-pressed=${e.menu?"false":"true"} ?disabled=${t} @click=${r(!1)}>${f.off}</button>
      </div>
    </div>`}function od(e){return e?l`<p class="footnote mod-note" role="status">${f.modNote}</p>`:u}var Af=600,sd=`(max-width: ${Af}px)`,ae=Jt(`@media ${sd}`);function id(e){if(typeof window.matchMedia!="function")return()=>{};let n=window.matchMedia(sd),t=r=>e(r.matches);return n.addEventListener("change",t),()=>n.removeEventListener("change",t)}var Ee=44,Cf="--hl-kb",ld=T`
  .divider {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 3;
    width: 44px;
    margin-left: -22px;
    cursor: ew-resize;
    touch-action: none;
    outline: none;
  }
  .divider::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 21px;
    width: 2px;
    background: var(--hl-accent);
  }
  .divider::before {
    content: "";
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 8px;
    width: 28px;
    height: 28px;
    margin-top: -14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  .divider:focus-visible::before,
  .divider:active::before {
    box-shadow: 0 0 0 3px var(--hl-focus), 0 2px 8px rgba(0, 0, 0, 0.35);
  }
`,dd=T`
  .toolbar {
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }
  ${ae} {
    .actions {
      bottom: var(--hl-kb, env(keyboard-inset-height, 0px));
      padding-top: 10px;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
    }
  }
`;function Pf(e,n){let t=n-e.height-e.offsetTop;return Number.isFinite(t)&&t>0?Math.round(t):0}var ad=!1;function xo(e=window){let n=e.visualViewport;if(ad||!n)return!1;ad=!0;let t=e.document.documentElement,r=()=>{t.style.setProperty(Cf,`${Pf(n,e.innerHeight)}px`)};return n.addEventListener("resize",r),n.addEventListener("scroll",r),r(),!0}xo();var ko=class extends M{constructor(){super(...arguments);this.open=!1;this.label="";this.stopWatching=()=>{};this.onKey=t=>{t.key!=="Escape"||!this.open||(t.stopPropagation(),this.close(!0))}}static{this.properties={open:{type:Boolean,reflect:!0},label:{type:String}}}static{this.styles=T`
    :host,
    .sheet {
      display: contents;
    }
    .toggle {
      display: none;
    }
    ${ae} {
      :host {
        display: block;
        flex: 1 1 100%;
        min-width: 0;
      }
      .toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: ${Ee}px;
        padding: 0 16px;
        font: inherit;
        font-weight: 500;
        color: var(--hl-text);
        background: var(--hl-surface);
        border: 1px solid var(--hl-edge);
        border-radius: var(--hl-radius-pill);
        cursor: pointer;
      }
      .toggle:focus-visible {
        outline: 2px solid var(--hl-focus);
        outline-offset: 2px;
      }
      .chevron {
        width: 8px;
        height: 8px;
        margin-top: -4px;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(45deg);
      }
      :host([open]) .chevron {
        margin-top: 4px;
        transform: rotate(225deg);
      }
      .sheet {
        display: none;
      }
      .sheet:focus {
        outline: none;
      }
      :host([open]) .sheet {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
        padding: 12px;
        max-height: 60dvh;
        overflow-y: auto;
        border-radius: var(--hl-radius-lg);
        background: var(--hl-surface);
        border: 1px solid var(--hl-line);
      }
    }
  `}connectedCallback(){super.connectedCallback(),xo(),this.addEventListener("keydown",this.onKey),this.stopWatching=id(t=>{t||(this.open=!1)})}disconnectedCallback(){this.removeEventListener("keydown",this.onKey),this.stopWatching(),this.stopWatching=()=>{},super.disconnectedCallback()}close(t){this.open=!1,t&&this.renderRoot.querySelector(".toggle")?.focus()}async toggle(){if(this.open)return this.close(!1);this.open=!0,await this.updateComplete,this.renderRoot.querySelector("#sheet")?.focus()}render(){return l`
      <button type="button" class="toggle" aria-expanded=${this.open?"true":"false"} aria-controls="sheet" @click=${()=>this.toggle()}>
        <span>${this.label}</span><span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="sheet" id="sheet" role="group" tabindex="-1" aria-label=${this.label}><slot></slot></div>
    `}};customElements.get("hats-lite-sheet")||customElements.define("hats-lite-sheet",ko);var Rf={normal:"1",compact:"0.85"},Df=["desktop","tablet","phone"],Lf=["normal","compact"],Of=["dark","light"];function cd(e,n,t,r){return{applicable:on(e),tryable:sn(e),trying:n,collision:e.nameCollision?f.nameCollision.replace("{name}",e.name):"",repo:Mi(e.repoUrl),error:t,pending:r.pending,install:r.install}}function ud(e,n){return!e||Object.keys(an(e,n)).length>0?"":f.noModeBlock.replace("{mode}",f[n].toLowerCase())}function $o(e,n,t){return l`<button type="button" aria-pressed=${n?"true":"false"} @click=${t}>${e}</button>`}function If(e,n){return e.url_path===null&&n?`${e.title} ${f.generatedSuffix}`:e.title}function Hf(e,n){let t=r=>()=>{e.compare!==r&&n.onCompare()};return l`
    <div class="field view-switch">${f.compareLabel}
      <div class="seg" role="group" aria-label=${f.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${e.compare?"true":"false"}
          ?disabled=${!e.canCompare||e.real} aria-describedby=${rt(e.real?"compare-hint":void 0)} @click=${t(!0)}>${f.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${e.compare?"false":"true"}
          ?disabled=${!e.canCompare||e.real} @click=${t(!1)}>${f.themeOnly}</button>
      </div>
      ${e.real?l`<span id="compare-hint" class="compare-hint">${f.compareHint}</span>`:u}
    </div>`}function pd(e,n){return l`
    <div class="toolbar">
      <hats-lite-sheet .label=${f.sheet}>
      <label class="field">${f.dashboard}
        <select class="pill" @change=${n.onDashboard}>
          ${e.dashboards.map((t,r)=>l`<option value=${String(r)} .selected=${t.url_path===e.dashboardUrl}>${If(t,e.generatedDefault)}</option>`)}
        </select>
      </label>
      ${e.showViews?l`<label class="field">${f.view}
            <select class="pill" @change=${n.onView}>
              ${e.views.map((t,r)=>l`<option value=${String(r)} .selected=${r===e.viewIndex}>${Pi(t,r)}</option>`)}
            </select>
          </label>`:u}
      <div class="seg" role="group" aria-label=${f.device}>
        ${Df.filter(t=>!(t==="tablet"&&e.hide?.includes("tablet"))).map(t=>$o(f[t],e.frame===t,()=>n.onFrame(t)))}
      </div>
      <div class="seg" role="group" aria-label=${f.density}>
        ${Lf.map(t=>$o(f[t],e.density===t,()=>n.onDensity(t)))}
      </div>
      ${e.hide?.includes("mode")?u:l`<div class="seg" role="group" aria-label=${f.mode}>
        ${Of.map(t=>$o(f[t],e.mode===t,()=>n.onMode(t)))}
      </div>`}
      ${rd({frame:e.frame,menu:e.menu},n)}
      ${Ql({available:e.realAvailable,real:e.real},n.onLook)}
      ${Hf(e,n)}
      </hats-lite-sheet>
    </div>`}function hd(e,n){let t=Cl(e.frame,e.menu);return l`
    <div class="frame" data-sidebar=${t?"on":"off"} style=${se({"--hats-lite-frame-width":Pl(e.frame,t),"--hats-lite-sidebar-width":Rl(t),"--hats-lite-density-scale":Rf[e.density]})}>
      <div class=${e.comparing?"stage":"stage solo"}>
        <div class="pane current">${wo(e.title)}</div>
        <div class="pane candidate" style=${se(e.comparing?{clipPath:pl(e.split)}:{})}>${wo(e.title)}</div>
        <div class="shield"></div>
        ${e.comparing?l`<div class="divider" role="slider" tabindex="0"
              aria-label=${f.divider}
              aria-valuemin="2" aria-valuemax="98"
              aria-valuenow=${String(Math.round(e.split))}
              aria-valuetext=${f.splitAt.replace("{percent}",String(Math.round(e.split)))}
              style=${se({left:`${e.split}%`})}
              @keydown=${n.onKey}
              @pointerdown=${n.onPointerDown}
              @pointermove=${n.onPointerMove}
              @pointerup=${n.onPointerUp}
              @pointercancel=${n.onPointerUp}></div>`:u}
        <div class="badges">
          ${e.comparing?l`<span class="badge">${f.current}</span>`:l`<span></span>`}
          <span class="badge">${e.candidateName}</span>
        </div>
      </div>
      ${e.note?l`<p class="empty-note" role="status">${e.note}</p>`:u}
    </div>
    <p class="footnote">${f.footnote}</p>
    ${od(e.modNote)}`}function md(e,n,t){return e?l`
    <div class="nav-frame">
      ${Bl(e)}
      ${go(e,-1,n)}
      ${go(e,1,n)}
      <div class="nav-content">${t}</div>
    </div>`:t}function fd(e,n){let t=vo(e.install),r=e.collision?"collision-note":void 0,o=e.install.inUse&&!e.collision,s=l`<button type="button" class="btn primary success apply" aria-describedby=${rt(r)} ?disabled=${!e.applicable||e.pending||t} @click=${n.onApply}>${e.collision&&!e.applicable?f.nameTaken:f.apply}</button>`;return l`
    <div class="actions">
      ${o?u:yo(e.install)?jl(e.install,n.install):s}
      ${o?u:l`<button type="button" class="btn try" aria-describedby=${rt(r)} ?disabled=${!e.tryable||e.trying||e.pending||t} @click=${n.onTry}>${f.tryButton}</button>`}
      ${o&&!e.install.canUninstall?l`<span class="chip ok in-use-chip">${f.inUseChip}</span>`:u}
      ${zl(e.install,n.install)}
      ${!e.applicable&&e.repo?l`<a class="chip link" href=${e.repo} target="_blank" rel="noopener noreferrer">${f.repoLink}</a>`:u}
      ${Kl(e.install,n.install)}
      ${e.collision?l`<p id="collision-note" class="chip warn collision" role="status">${e.collision}</p>`:u}
      ${e.error?l`<p class="error" role="alert">${e.error}</p>`:u}
    </div>`}var Ln=class{constructor(n){this.host=n;this.onKeyDown=n=>{let t=Fl(n),r=this.host.nav;t===0||!r||this.host.trying||nt(r.index,r.total,t)===null||(n.preventDefault(),this.moveBy(t))};this.flow=new Dn(n),n.addController(this)}hostConnected(){this.host.addEventListener("keydown",this.onKeyDown)}hostDisconnected(){this.flow.dispose(),this.host.removeEventListener("keydown",this.onKeyDown)}hostUpdate(){let{candidate:n,install:t}=this.host;n&&this.flow.settle(n.installed?"install":"uninstall"),n&&!n.installed&&this.flow.clearStale();let r=(t??this.host.uninstall)?.fullName;if(n!==this.watched||r!==this.watchedKey){let o=n?.name===this.watched?.name&&r===this.watchedKey;this.watched=n,this.watchedKey=r,o||this.flow.reset()}}moveBy(n){let t=this.host.nav;!t||this.host.trying||nt(t.index,t.total,n)===null||this.host.dispatchEvent(new CustomEvent(Nl,{detail:{direction:n},bubbles:!0,composed:!0}))}apply(){let{candidate:n,hass:t}=this.host;if(!n||!on(n)||this.host.nav?.pending)return;let r={theme:n.name},o=bo(this.host.userMode,this.host.mode,t);o&&(r.dark=o==="dark"),this.host.dispatchEvent(new CustomEvent("settheme",{detail:r,bubbles:!0,composed:!0}))}async tryTheme(){let{candidate:n,hass:t}=this.host;!n||!sn(n)||this.host.trying||this.host.nav?.pending||(this.host.error="",this.host.trying=!0,this.host.error=await Ul(t,n,bo(this.host.userMode,this.host.mode,t)),this.host.trying=!1)}selected(){let n=this.host.hass;return n?.selectedTheme?.theme??n?.themes?.theme??"default"}installModel(n){let t=this.host.hass?.user?.is_admin===!0,r=this.host.install??this.host.uninstall,o=this.host.nav?.pending===!0,s=He(this.host.hass);return{show:!n.installed&&!n.nameCollision,admin:t,hasTarget:!!this.host.install,phase:this.flow.phase,op:this.flow.op,locked:Hl()||o,error:this.flow.error,repoName:r?.fullName??n.name,store:s,storeHref:Ol(s,n.repoUrl),canUninstall:t&&!!this.host.uninstall&&n.installed&&!n.nameCollision,stale:this.flow.stale,inUse:this.selected().toLowerCase()===n.name.toLowerCase()}}confirm(){let n=this.flow.op,t=n==="install"?this.host.install:this.host.uninstall;if(!t)return;let r=n==="uninstall"?this.selected():void 0;this.flow.run(this.host.hass,t,o=>this.host.dispatchEvent(new CustomEvent(Ll,{detail:o,bubbles:!0,composed:!0})),r)}render(){let n=this.host.candidate;if(!this.host.showActions||!n)return u;let t=cd(n,this.host.trying,this.host.error||this.flow.error,{pending:this.host.nav?.pending===!0,install:this.installModel(n)});return fd(t,{onApply:()=>this.apply(),onTry:()=>{this.tryTheme()},install:{onBegin:r=>this.flow.begin(r),onCancel:()=>this.flow.cancel(),onConfirm:()=>this.confirm()}})}};var gd=T`
  .nav {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }
  .nav-frame {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  .nav-frame > .nav {
    grid-column: 1;
    justify-self: center;
    min-width: 0;
    max-width: 100%;
    margin-bottom: 8px;
    text-align: center;
  }
  .nav-frame > .nav-content {
    grid-column: 1;
    min-width: 0;
  }
  .nav-side {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    z-index: 3;
  }
  .nav-side-prev {
    left: 0;
  }
  .nav-side-next {
    right: 0;
  }
  .nav-side .nav-btn {
    position: sticky;
    top: calc(50vh - 28px);
    width: 56px;
    height: 56px;
    font-size: 28px;
    line-height: 1;
    box-shadow: var(--hl-shadow);
  }
  .nav-side-prev .nav-btn {
    transform: translateX(calc(-100% - 8px));
  }
  .nav-side-next .nav-btn {
    transform: translateX(8px);
  }
  @media (max-width: 1400px) {
    .nav-frame {
      grid-template-columns: auto minmax(0, 1fr) auto;
      column-gap: 8px;
      align-items: center;
    }
    .nav-frame > .nav {
      grid-column: 2;
      grid-row: 1;
    }
    .nav-frame > .nav-content {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    .nav-side {
      position: static;
      width: auto;
      grid-row: 1;
      margin-bottom: 8px;
    }
    .nav-side-prev {
      grid-column: 1;
    }
    .nav-side-next {
      grid-column: 3;
    }
    .nav-side .nav-btn {
      position: static;
      transform: none;
      width: 48px;
      height: 48px;
      font-size: 24px;
    }
  }
  .nav-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-edge);
    background: var(--hl-surface);
    color: var(--hl-text);
    font: inherit;
    cursor: pointer;
  }
  .nav-btn[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .nav-btn:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .nav-info {
    display: inline-flex;
    flex-direction: column;
    min-width: 0;
    max-width: 100%;
    line-height: 1.2;
  }
  .nav-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    font-weight: 600;
  }
  .nav-pos {
    color: var(--hl-muted);
    font-size: 12px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .install-dialog {
    flex-basis: 100%;
    padding: 12px 14px;
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
  }
  .install-dialog p {
    margin: 6px 0 10px;
    color: var(--hl-muted);
  }
  .install-dialog .btn + .btn {
    margin-inline-start: 8px;
  }
  .chip.note {
    margin: 0;
  }
  :host {
    --hl-success: #1b6e2a;
    --hl-on-success: #ffffff;
    --hl-danger: #b3261e;
    --hl-on-danger: #ffffff;
  }
  :host([data-scheme="dark"]) {
    --hl-success: #8fdc9a;
    --hl-on-success: #0a2a10;
    --hl-danger: #ffb4ab;
    --hl-on-danger: #410002;
  }
  .btn.success {
    background: var(--hl-success);
    border-color: var(--hl-success);
    color: var(--hl-on-success);
  }
  .btn.danger {
    background: var(--hl-danger);
    border-color: var(--hl-danger);
    color: var(--hl-on-danger);
  }
  .btn.success:focus-visible,
  .btn.danger:focus-visible {
    outline: 3px solid var(--hl-text);
    outline-offset: 2px;
  }
  .btn[aria-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;var Nf="lovelace";async function bd(e){if(typeof e!="object"||e===null)return;let n=e,t=n.loadFragmentTranslation;if(typeof t!="function")return;let r,o=new Promise(s=>{r=setTimeout(s,3e3)});try{await Promise.race([Promise.resolve(t.call(n,Nf)).then(()=>{}),o])}catch{return}finally{clearTimeout(r)}}var vd=new Set(["states","entities","devices","areas","floors","labels","extendedEntities","config","themes","selectedTheme","user","panels","narrowViewport","hassRegistries","hassConfig"]),Ff=new Set(["localize","locale","hassInternationalization","hassFormatters","hassUi"]);function Bf(e){return typeof e=="string"&&(vd.has(e)||Ff.has(e))}function wd(e){if(typeof e!="object"||e===null||Array.isArray(e))return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null}function yd(e,n,t){let r=R(e,n,t);if(typeof r=="function"){let o=r;return St(n)!=="read"?async()=>{F(`context:${String(n)}`)}:(...s)=>D(x(o,e,s))}return wd(r)?xd(r):D(r)}function xd(e){let n=new Proxy({},{has:(t,r)=>we(e,r),ownKeys:()=>ie(e),getOwnPropertyDescriptor:(t,r)=>we(e,r)?{value:yd(e,r,n),enumerable:!0,configurable:!0,writable:!1}:void 0,get:(t,r)=>yd(e,r,n),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1});return n}function Uf(e,n){return vd.has(e)?D(n):typeof n=="object"&&n!==null?wd(n)?xd(n):D(n):n}function jf(e){let n=e.getRootNode();return typeof ShadowRoot<"u"&&n instanceof ShadowRoot?n.host:e.parentElement}function kd(e){let n=new Set,t=!0,r=s=>{let i=s,{context:a,callback:d}=i;if(!t||!Bf(a)||typeof d!="function")return;let c=jf(e);if(!c)return;s.stopPropagation();let h=s.composedPath()[0],p=d,g=new Map,y=(A,S)=>{if(!t)return;let U=S;if(typeof S=="function"){let I=S,X=g.get(I);if(!X){let j=()=>{n.delete(j),g.delete(I),I()};X=j,g.set(I,j),n.add(j)}U=X}p(Uf(a,A),U)},E=new Event("context-request",{bubbles:!0,composed:!0});Object.assign(E,{context:a,callback:y,subscribe:i.subscribe===!0,contextTarget:h}),c.dispatchEvent(E)};return e.addEventListener("context-request",r),Object.assign(()=>{t=!1,e.removeEventListener("context-request",r);for(let s of n)try{s()}catch{continue}n.clear()},{pending:()=>n.size})}var zf=["hass-action","hass-more-info","show-dialog","hass-toggle-menu","location-changed","hass-dock-sidebar","hass-edit-sidebar","hass-set-theme","hass-service-called","hass-reload-themes","hass-open-link","popstate","iron-overlay-opened","ll-show-dashboard","hass-kiosk-mode","hass-language-select","hass-vibrate","hass-suspend-when-hidden","hass-enable-shortcuts","hass-time-zone-select","hass-date-format-select","hass-time-format-select","hass-first-weekday-select","hass-number-format-select","hass-refresh-current-user","hass-quick-bar-trigger","hass-show-notifications"],Kf=["context-request","ll-custom","hass-notification","settheme","navigate","ll-open-dialog","hass-quick-bar","show-edit-card","ll-rebuild","hass-logout","config-refresh","dialog-closed","haptic"],Vf=new Set(["value-changed","iron-resize","iron-select","iron-deselect","iron-activate","iron-items-changed","selected","selected-changed","expanded-changed","opened-changed","input","change","load","error","focus","blur","focusin","focusout","click","dblclick","auxclick","contextmenu","mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave","pointerdown","pointerup","pointermove","pointerover","pointerout","pointerenter","pointerleave","pointercancel","gotpointercapture","lostpointercapture","touchstart","touchmove","touchend","touchcancel","keydown","keyup","keypress","wheel","scroll","resize","select","submit","reset","toggle","slotchange","transitionend","animationend","dragstart","dragend","dragenter","dragover","dragleave","drop"]),Wf=new Set,qf=/^(hass-|ll-|show-)/;function Sd(e){return qf.test(e)&&!Wf.has(e)}var Gf=200,It=EventTarget.prototype.dispatchEvent,Md=EventTarget.prototype.addEventListener,Ad=EventTarget.prototype.removeEventListener,Xf=window.addEventListener,Yf=window.removeEventListener,Zf=Event.prototype.composedPath,Jf=Object.getOwnPropertyDescriptor(Node.prototype,"parentNode")?.get,Qf=Object.getOwnPropertyDescriptor(Node.prototype,"nodeType")?.get,$d=typeof ShadowRoot>"u"?void 0:Object.getOwnPropertyDescriptor(ShadowRoot.prototype,"host")?.get,eg=11,G=Reflect.apply,Ht=new WeakSet,Cd=new Set,In=new WeakMap,On=new Set,Eo=new Map,Pd=0,Nt=0,ot=null;function Rd(e){e.stopPropagation()}function Hn(e,n,t){let r=In.get(e);r||(r=new Map,In.set(e,r)),!r.has(n)&&(r.set(n,t),G(Md,e,[n,Rd,{capture:t}]))}function Ed(e){try{if(G(Qf,e,[])===eg&&$d)return G($d,e,[])}catch{return e}return e}function Dd(e){if(typeof e!="object"||e===null)return null;let n=Ed(e);for(;n;){if(Ht.has(n))return n;let t=null;try{t=G(Jf,n,[])}catch{return null}n=t===null?null:Ed(t)}return null}function Td(e){if(Nt===0)return;let n=G(Zf,e,[]),t=Dd(n.length>0?n[0]:e.target);t&&Hn(t,e.type,Sd(e.type))}function tg(e,n){if(!On.has(n)){if(On.size>=Gf)return!1;On.add(n),Eo.set(n,Td),G(Xf,window,[n,Td,{capture:!0}])}return Hn(e,n,!1),!0}function _d(e,n,t){let r=t.type,o=s=>s.stopPropagation();G(Md,e,[r,o,{capture:!0}]);try{return G(It,n,[t])}finally{G(Ad,e,[r,o,{capture:!0}])}}function ng(){ot||(ot=function(n){if(Nt===0||!n||typeof n.type!="string"||Vf.has(n.type))return G(It,this,[n]);let t=Dd(this);return t?Sd(n.type)?_d(t,this,n):tg(t,n.type)?G(It,this,[n]):(Pd+=1,_d(t,this,n)):G(It,this,[n])},Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:ot}))}function rg(){for(let[e,n]of Eo)G(Yf,window,[e,n,{capture:!0}]);Eo.clear(),On.clear(),Pd=0,ot&&EventTarget.prototype.dispatchEvent===ot&&(Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:It}),ot=null)}function Ld(e){if(!Ht.has(e)){Ht.add(e),Cd.add(e),Nt+=1;for(let n of zf)Hn(e,n,!0);for(let n of Kf)Hn(e,n,!1);ng()}}function Od(e){if(!Ht.has(e))return;Ht.delete(e),Cd.delete(e);let n=In.get(e);if(n){for(let[t,r]of n)G(Ad,e,[t,Rd,{capture:r}]);In.delete(e)}Nt-=1,Nt===0&&rg()}var Nn=class{sync(n){let t=n?.querySelector(".stage"),r=t instanceof HTMLElement?t:void 0;return r===this.current?!1:(this.release(),r&&(this.current=r,Ld(r),this.stopRelay=kd(r)),r!==void 0)}release(){this.stopRelay?.(),this.stopRelay=void 0,this.current&&Od(this.current),this.current=void 0}};var og={"markdown-code-background-color":"var(--primary-background-color)","table-row-background-color":"var(--primary-background-color)","table-row-alternative-background-color":"var(--secondary-background-color)","table-header-background-color":"var(--secondary-background-color)","data-table-background-color":"var(--card-background-color)","input-ink-color":"var(--primary-text-color)","input-label-ink-color":"var(--secondary-text-color)","input-idle-line-color":"color-mix(in srgb, var(--primary-text-color) 42%, transparent)","input-hover-line-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-disabled-ink-color":"var(--disabled-text-color)","input-disabled-fill-color":"color-mix(in srgb, var(--primary-text-color) 2%, var(--card-background-color))","input-disabled-line-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-outlined-idle-border-color":"color-mix(in srgb, var(--primary-text-color) 38%, transparent)","input-outlined-hover-border-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-outlined-disabled-border-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-dropdown-icon-color":"var(--secondary-text-color)","mdc-text-field-fill-color":"var(--input-fill-color)","mdc-text-field-ink-color":"var(--input-ink-color)","mdc-text-field-label-ink-color":"var(--input-label-ink-color)","mdc-text-field-idle-line-color":"var(--input-idle-line-color)","mdc-text-field-hover-line-color":"var(--input-hover-line-color)","mdc-text-field-disabled-fill-color":"var(--input-disabled-fill-color)","mdc-text-field-disabled-ink-color":"var(--input-disabled-ink-color)","mdc-text-field-disabled-line-color":"var(--input-disabled-line-color)","mdc-text-field-outlined-idle-border-color":"var(--input-outlined-idle-border-color)","mdc-text-field-outlined-hover-border-color":"var(--input-outlined-hover-border-color)","mdc-text-field-outlined-disabled-border-color":"var(--input-outlined-disabled-border-color)","chip-background-color":"color-mix(in srgb, var(--primary-text-color) 15%, transparent)","label-badge-background-color":"var(--card-background-color)","label-badge-text-color":"var(--primary-text-color)","state-inactive-color":"var(--disabled-text-color)","ha-color-text-primary":"var(--primary-text-color)","ha-color-text-secondary":"var(--secondary-text-color)","ha-color-text-disabled":"var(--disabled-text-color)","ha-color-border-neutral-quiet":"var(--divider-color)","ha-color-fill-neutral-quiet-resting":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))"},Hd={...og,"state-active-color":"var(--amber-color, #ffc107)","state-light-active-color":"var(--state-active-color, #ffc107)","slider-color":"var(--primary-color)","paper-slider-active-color":"var(--primary-color)","mdc-theme-surface":"var(--card-background-color)","mdc-theme-on-surface":"var(--primary-text-color)","mdc-theme-primary":"var(--primary-color)","mdc-theme-secondary":"var(--accent-color)","input-fill-color":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))","mdc-select-fill-color":"var(--input-fill-color)","outline-color":"var(--divider-color)","switch-checked-color":"var(--primary-color)","switch-checked-button-color":"var(--switch-checked-color, var(--primary-color))","switch-checked-track-color":"var(--switch-checked-color, var(--primary-color))","state-icon-color":"var(--paper-item-icon-color, #44739e)"},sg={"primary-color":"rgb-primary-color","accent-color":"rgb-accent-color","primary-text-color":"rgb-primary-text-color","secondary-text-color":"rgb-secondary-text-color","card-background-color":"rgb-card-background-color","primary-background-color":"rgb-primary-background-color"},ig=/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,ag=/^(rgba?|hsla?)\(\s*([^)]*)\)$/i,lg=/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)$/i;function Nd(e){return Math.max(0,Math.min(255,Math.round(e)))}function dg(e){let n=ig.exec(e);if(!n)return null;let t=n[1];return t.length<=4&&(t=[...t].map(r=>r+r).join("")),[0,2,4].map(r=>parseInt(t.slice(r,r+2),16))}function cg(e){let n=e.endsWith("%"),t=Number(n?e.slice(0,-1):e);return Number.isFinite(t)?n?t/100*255:t:null}function ug(e){let n=Number(e[0].replace(/deg$/i,"")),t=Number(e[1].replace(/%$/,""))/100,r=Number(e[2].replace(/%$/,""))/100;if(![n,t,r].every(Number.isFinite))return null;let o=a=>(a+n/30)%12,s=t*Math.min(r,1-r),i=a=>r-s*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[i(0),i(8),i(4)].map(a=>Nd(a*255))}function pg(e,n){let t=n.split(/[\s,/]+/).filter(Boolean).slice(0,3);if(t.length<3)return null;if(e.startsWith("hsl"))return ug(t);let r=t.map(cg);return r.some(o=>o===null)?null:r.map(Nd)}function Id(e){let n=e.trim().replace(/\s*!important$/i,""),t=dg(n);if(t)return t;let r=ag.exec(n);return r?pg(r[1].toLowerCase(),r[2]):null}function hg(e,n){let t=lg.exec(e.trim());if(!t)return Id(e);let r=n[t[1]];return typeof r=="string"?Id(r):null}function Fd(e){let n={};for(let[t,r]of Object.entries(sg)){if(!(t in e)||r in e)continue;let o=hg(e[t],e);o&&(n[r]=o.join(", "))}return n}var Bd=new WeakMap;function Ud(e,n){let t=JSON.stringify(n);Bd.get(e)!==t&&(Bd.set(e,t),Di(e),$t(e,n))}var mg=["lovelace-background","ha-card-border-radius","ha-card-box-shadow","ha-card-border-width","ha-card-border-color","ha-card-background","ha-card-backdrop-filter","primary-font-family","paper-font-body1_-_font-family","text-primary-color","rgb-primary-color","rgb-accent-color","rgb-primary-text-color","rgb-secondary-text-color","rgb-card-background-color","rgb-primary-background-color","light-primary-color","dark-primary-color","secondary-background-color","state-icon-color","paper-item-icon-color","disabled-text-color","divider-color","card-background-color","primary-background-color","primary-text-color","secondary-text-color","primary-color","accent-color","app-header-background-color","app-header-text-color","app-header-selection-bar-color","app-header-edit-background-color","app-header-edit-text-color","app-header-border-bottom","sidebar-background-color","sidebar-text-color","sidebar-icon-color","sidebar-selected-background-color","sidebar-selected-text-color","sidebar-selected-icon-color"];function jd(e,n,t){let r={};for(let o of t)r[o]="initial";return{...r,...Hd,...yn[n],...Fd(e),...e}}function zd(e,n,t,r){let o=e.querySelector(".pane.current"),s=e.querySelector(".pane.candidate"),i=$i(n),a=i?Z(i,r):{},d=t?an(t,r):a,c=new Set([...mg,...jr(i),...jr(t?.entry),...Object.keys(t?.vars??{}),...Object.keys(d)]);o instanceof HTMLElement&&Ud(o,jd(a,r,c)),s instanceof HTMLElement&&Ud(s,jd(d,r,c))}function Kd(e,n){e.querySelectorAll(".cards > *").forEach(t=>{t.hass=n})}var Vd=T`
  .frame {
    container-type: inline-size;
    container-name: hl-frame;
  }
  .pane {
    display: flex;
    flex-direction: column;
  }
  .shell {
    flex: 1;
    --hl-sb-bg: var(--sidebar-background-color, var(--card-background-color, #fff));
    --hl-sb-text: var(--sidebar-text-color, var(--primary-text-color, #141414));
    --hl-sb-icon: var(--sidebar-icon-color, rgba(var(--rgb-primary-text-color, 20, 20, 20), 0.6));
    --hl-sb-sel: var(--sidebar-selected-icon-color, var(--primary-color, #03a9f4));
    --hl-hd-bg: var(--app-header-background-color, var(--hl-sb-bg));
    --hl-hd-text: var(--app-header-text-color, var(--hl-sb-text));
    --hl-hd-border: var(--app-header-border-bottom, 1px solid var(--divider-color, #0000001f));
    --hl-scale: var(--hats-lite-density-scale, 1);
    display: flex;
    align-items: stretch;
    min-height: 360px;
  }
  .sidebar {
    flex: none;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: var(--hats-lite-sidebar-width, 0px);
    min-height: 100%;
    overflow: hidden;
    background-color: var(--hl-sb-bg);
    border-right: 1px solid var(--divider-color, #0000001f);
    font-size: calc(14px * var(--hl-scale));
  }
  .frame[data-sidebar="off"] .sidebar {
    display: none;
  }
  .side-menu {
    display: flex;
    flex: none;
    align-items: center;
    box-sizing: border-box;
    height: calc(56px * var(--hl-scale));
    padding: 0 4px;
    white-space: nowrap;
    font-size: calc(20px * var(--hl-scale));
    color: var(--sidebar-menu-button-text-color, var(--primary-text-color, #141414));
    background-color: var(--sidebar-menu-button-background-color, inherit);
    border-bottom: 1px solid var(--divider-color, #0000001f);
  }
  .side-burger {
    display: inline-flex;
    flex: none;
    padding: 8px;
    color: var(--hl-sb-icon);
  }
  .side-title {
    margin-left: 3px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .side-list {
    display: flex;
    flex-direction: column;
    margin-block: 8px;
    overflow: hidden;
  }
  .side-list.fixed {
    margin-top: auto;
    margin-bottom: 40px;
  }
  .item {
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    height: calc(40px * var(--hl-scale));
    margin: 0 4px 4px;
    padding: 0 12px;
    border-radius: 4px;
    color: var(--hl-sb-text);
    font-weight: 500;
  }
  .side-burger .icon,
  .appbar .hamburger .icon,
  .item .icon {
    flex: none;
    width: 24px;
    height: 24px;
    color: var(--hl-sb-icon);
  }
  .item .text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item.selected {
    color: var(--hl-sb-sel);
  }
  .item.selected .icon {
    color: var(--hl-sb-sel);
  }
  .item.selected::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 4px;
    background-color: var(--hl-sb-sel);
    opacity: var(--dark-divider-opacity, 0.12);
    pointer-events: none;
  }
  .item.user {
    padding-left: 4px;
    height: calc(48px * var(--hl-scale));
  }
  .avatar {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: calc(40px * var(--hl-scale));
    height: calc(40px * var(--hl-scale));
    box-sizing: border-box;
    border-radius: 50%;
    background: var(--light-primary-color, #b3e5fc);
    color: #212121;
    font-size: calc(16px * var(--hl-scale));
    font-weight: 400;
  }
  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .appbar {
    display: flex;
    flex: none;
    align-items: center;
    box-sizing: border-box;
    height: calc(56px * var(--hl-scale));
    padding: 0 12px;
    background-color: var(--hl-hd-bg);
    color: var(--hl-hd-text);
    border-bottom: var(--hl-hd-border);
    font-size: calc(20px * var(--hl-scale));
    font-weight: 400;
  }
  .appbar .hamburger {
    display: none;
    flex: none;
    padding: 12px;
    color: var(--hl-sb-icon);
  }
  .frame[data-sidebar="off"] .appbar .hamburger {
    display: inline-flex;
  }
  .appbar .title {
    flex: 1;
    min-width: 0;
    margin-inline-start: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .appbar .tools {
    display: inline-flex;
    flex: none;
    color: var(--hl-hd-text);
  }
  .appbar .tools .icon {
    padding: 12px;
  }
  .appbar .icon {
    width: 24px;
    height: 24px;
    flex: none;
  }
  .frame[data-sidebar="off"] .appbar .hamburger + .title {
    margin-inline-start: 8px;
  }
  @container hl-frame (max-width: 699px) {
    .sidebar {
      display: none;
    }
    .appbar .hamburger {
      display: inline-flex;
    }
    .appbar .hamburger + .title {
      margin-inline-start: 8px;
    }
  }
`;var Wd=T`
  ${ae} {
    .toolbar {
      display: block;
    }
    hats-lite-sheet .field {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      min-width: 0;
    }
    hats-lite-sheet select.pill {
      min-width: 0;
      max-width: 100%;
      height: ${Ee}px;
    }
    hats-lite-sheet .seg {
      display: flex;
    }
    hats-lite-sheet .seg button {
      flex: 1 1 0;
      min-height: ${Ee}px;
    }
    .actions .btn {
      min-height: ${Ee}px;
    }
  }
`,qd=T`
  .page {
    padding-left: max(24px, env(safe-area-inset-left, 0px));
    padding-right: max(24px, env(safe-area-inset-right, 0px));
  }
  ${ae} {
    .page {
      padding-left: max(16px, env(safe-area-inset-left, 0px));
      padding-right: max(16px, env(safe-area-inset-right, 0px));
    }
    .tabs.seg {
      display: flex;
      width: 100%;
      overflow: visible;
    }
    .tabs.seg button {
      flex: 1 1 0;
      min-width: 0;
      min-height: ${Ee}px;
      padding: 6px 2px;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`,Gd=T`
  ${ae} {
    .layout {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    .controls {
      display: contents;
    }
    .bar {
      position: sticky;
      bottom: var(--hl-kb, env(keyboard-inset-height, 0px));
      z-index: 5;
      padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      box-shadow: var(--hl-shadow);
    }
    .bar input[type="text"],
    .bar .btn {
      min-height: ${Ee}px;
    }
  }
`;var fg=T`
  :host {
    display: block;
    background: var(--hl-bg);
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    margin-bottom: 14px;
  }
  .field {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    color: var(--hl-muted);
    font-size: 13px;
  }
  select.pill {
    appearance: none;
    height: 36px;
    padding: 0 34px 0 14px;
    font: inherit;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-edge);
    background-color: var(--hl-surface);
    background-image: linear-gradient(45deg, transparent 50%, var(--hl-muted) 50%),
      linear-gradient(135deg, var(--hl-muted) 50%, transparent 50%);
    background-position: calc(100% - 18px) 15px, calc(100% - 13px) 15px;
    background-size: 5px 5px;
    background-repeat: no-repeat;
    color: var(--hl-text);
    cursor: pointer;
  }
  select.pill:focus-visible,
  .chip-btn:focus-visible,
  .chip.link:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .chip-btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .frame {
    width: var(--hats-lite-frame-width, 100%);
    max-width: 100%;
    margin: 0 auto;
    --hats-lite-card-padding: calc(16px * var(--hats-lite-density-scale, 1));
  }
  .stage {
    position: relative;
    display: grid;
    min-height: 360px;
    overflow: hidden;
    border-radius: var(--hl-radius-lg);
    border: 1px solid var(--hl-line);
    box-shadow: var(--hl-shadow);
    background: var(--hl-bg);
  }
  .pane {
    grid-area: 1 / 1;
    position: relative;
    min-width: 0;
    overflow: visible;
    isolation: isolate;
    background-color: var(--primary-background-color, #fafafa);
    color: var(--primary-text-color, #1c1c1c);
    font-family: var(--primary-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
  }
  .pane::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--lovelace-background, transparent);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: scroll;
    pointer-events: none;
  }
  .pane.current {
    z-index: 0;
  }
  .pane.candidate {
    z-index: 1;
  }
  .stage.solo .pane.current {
    visibility: hidden;
  }
  .cards {
    display: flex;
    flex-direction: column;
    gap: calc(8px * var(--hats-lite-density-scale, 1));
    padding: var(--hats-lite-card-padding);
    font-size: calc(14px * var(--hats-lite-density-scale, 1));
  }
  .cards > * {
    display: block;
  }
  .placeholder {
    padding: var(--hats-lite-card-padding);
    border-radius: var(--hl-radius-md);
    background: var(--card-background-color, #fff);
    border: 1px dashed var(--divider-color, #c8c8c8);
    font-size: 13px;
  }
  .shield {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: transparent;
  }
  .badges {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 10px;
    pointer-events: none;
  }
  .badge {
    padding: 3px 10px;
    border-radius: var(--hl-radius-pill);
    background: rgba(0, 0, 0, 0.78);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .notice {
    margin: 8px 0;
    font-size: 14px;
    color: var(--hl-muted);
  }
  .empty-note {
    margin: 10px 0 0;
    font-size: 13px;
    color: var(--hl-muted);
  }
  .footnote {
    margin: 12px 0 0;
    font-size: 13px;
    color: var(--hl-muted);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-top: 14px;
    padding: 10px 0;
    background: var(--hl-bg);
  }
  .chip.link {
    color: var(--hl-text);
    text-decoration: none;
  }
  .chip.warn {
    margin: 0;
    color: var(--hl-text);
    white-space: normal;
    background: color-mix(in srgb, var(--hl-warn) 16%, transparent);
  }
  .error {
    margin: 0;
    font-size: 14px;
    color: var(--error-color, #db4437);
  }
  ${ae} {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 5;
    }
  }
`,Xd=[K,V,fg,Vd,ld,dd,Wd];var gg=2,bg=98,yg=5,vg=10;function Yd(e,n,t=!1,r=!1){if(r)return null;let o=t?vg:yg;switch(e){case"ArrowLeft":case"ArrowDown":return Pn(n-o);case"ArrowRight":case"ArrowUp":return Pn(n+o);case"Home":return gg;case"End":return bg;default:return null}}function Zd(e){let n=e.currentTarget;typeof n.setPointerCapture=="function"&&n.setPointerCapture(e.pointerId)}function Jd(e){let n=e.currentTarget;typeof n.releasePointerCapture=="function"&&n.releasePointerCapture(e.pointerId)}var wg=300*1e3,Fn=class{constructor(n){this.host=n;this.items=[];this.requested=!1;this.withHass=!1;this.failed=new Set;this.loading=!1;this.at=0;this.shown=!1}sync(n){if(!Dt(n))return;let t=this.host.hass,r=this.requested&&this.withHass&&!!t&&Date.now()-this.at>=wg;this.loading||this.requested&&(this.withHass||!t)&&!r||(this.requested=!0,this.withHass=!!t,this.loading=!0,this.at=Date.now(),Yl(t).then(o=>{this.items=o,o.length&&this.host.requestUpdate()}).finally(()=>{this.loading=!1}))}item(n){if(!Dt(n))return;let t=Zl(this.items,n?.fullName,n?.name);return t&&!this.failed.has(t)?t:void 0}active(n){return!!this.item(n)&&this.pick!==!1}choose(n){this.pick=n,this.host.requestUpdate()}fail(n){let t=this.item(n);t&&(this.failed.add(t),this.host.requestUpdate())}leftReal(n){let t=this.active(n),r=this.shown&&!t;return this.shown=t,r}};var Qd=[".pane.current .cards",".pane.candidate .cards"],To=class extends M{constructor(){super(...arguments);this.showActions=!0;this.dashboards=[];this.dashboardUrl=null;this.views=[];this.viewIndex=0;this.cards=[];this.notice=f.loading;this.frame="desktop";this.density="normal";this.split=50;this.error="";this.trying=!1;this.defaultCompare=!0;this.menu=Ml();this.defaultGenerated=!1;this.usingSample=!1;this.cache=new Map;this.dashboardsLoaded=!1;this.configToken=0;this.buildToken=0;this.dragging=!1;this.actions=new Ln(this);this.guard=new Nn;this.real=new Fn(this)}static{this.properties={hass:{attribute:!1},candidate:{attribute:!1},mode:{attribute:!1},showActions:{type:Boolean,attribute:"show-actions"},defaultCompare:{attribute:!1},hideControls:{attribute:!1},install:{attribute:!1},uninstall:{attribute:!1},nav:{attribute:!1},dashboards:{state:!0},dashboardUrl:{state:!0},views:{state:!0},viewIndex:{state:!0},cards:{state:!0},notice:{state:!0},frame:{state:!0},density:{state:!0},split:{state:!0},error:{state:!0},trying:{state:!0},compare:{state:!0},menu:{state:!0},defaultGenerated:{state:!0},usingSample:{state:!0}}}static{this.styles=[Xd,gd,td]}connectedCallback(){super.connectedCallback(),this.readOnlySource=void 0,this.hasUpdated&&this.attachHass(),this.guard.sync(this.renderRoot)}disconnectedCallback(){super.disconnectedCallback(),this.readOnly&&dl(this.readOnly),this.readOnly=void 0,this.guard.release()}willUpdate(t){t.has("mode")&&this.mode!==this.userMode&&(this.userMode=void 0)}updated(t){t.has("hass")&&this.hass&&!this.dashboardsLoaded&&this.loadDashboards(),this.attachHass(),this.applyVars(),this.real.sync(this.candidate),this.real.leftReal(this.candidate)&&!t.has("cards")&&this.buildCards(),this.dataset.scheme=this.hass?.themes?.darkMode?"dark":"light",t.has("cards")&&this.buildCards(),this.guard.sync(this.renderRoot)&&!t.has("cards")&&this.buildCards()}comparing(){return this.real.active(this.candidate)?!1:this.compare??xl(this.defaultCompare)}effectiveMode(){return this.mode??(this.hass?.themes?.darkMode?"dark":"light")}async loadDashboards(){let t=this.hass;if(!t)return;this.dashboardsLoaded=!0;try{this.dashboards=await Ai(t)}catch{this.dashboards=[{url_path:null,title:f.defaultDashboard}]}let r=++this.configToken;this.notice=f.loading;let o=await fl(this.dashboards,i=>this.entryFor(i),()=>r!==this.configToken);if(o.stale)return;if(o.hit){this.dashboardUrl=o.hit.urlPath,this.applyEntry(o.hit.entry,o.hit.urlPath);return}this.dashboardUrl=null;let s=gl(t.states);if(s&&!o.entries.every(i=>i.status==="error")){this.sample=s,this.useSample();return}o.entries[0]&&this.applyEntry(o.entries[0],null)}async entryFor(t){let r=fo(t),o=this.cache.get(r);if(o)return o;let s=this.hass,i=s?await ml(s,t):{status:"error",reason:""};return i.status!=="error"&&this.cache.set(r,i),t===null&&i.status==="notfound"&&(this.defaultGenerated=!0),i}async showDashboard(t){let r=++this.configToken;this.cache.has(fo(t))||(this.notice=f.loading);let s=await this.entryFor(t);r===this.configToken&&this.applyEntry(s,t)}applyEntry(t,r){let o=t.status!=="ok"||!Rt(t.config);if(this.sample&&r===null&&o){this.useSample();return}this.usingSample=!1,this.viewIndex=0,this.config=t.status==="ok"?t.config:void 0,t.status==="ok"?this.selectView():this.setState({views:[],cards:[],notice:bl(t)})}useSample(){this.usingSample=!0,this.config=this.sample,this.viewIndex=0,this.selectView()}selectView(){this.setState(yl(this.config,this.viewIndex))}setState(t){this.views=t.views,this.cards=t.cards,this.notice=t.notice}async buildCards(){let t=++this.buildToken,[r]=await Promise.all([ln(),bd(this.hass)]),o=await Promise.all(Qd.map(()=>this.buildPane(r)));t===this.buildToken&&(Qd.forEach((s,i)=>{let a=this.renderRoot.querySelector(s);a instanceof HTMLElement&&a.replaceChildren(...o[i])}),this.attachHass(!0))}buildPane(t){return Promise.all(this.cards.map(r=>dn(t,r)))}attachHass(t=!1){let r=this.hass;r&&(r!==this.readOnlySource&&(this.readOnlySource=r,this.readOnly=cl(r,this),t=!0),t&&this.readOnly&&Kd(this.renderRoot,this.readOnly))}applyVars(){zd(this.renderRoot,this.hass,this.candidate,this.effectiveMode())}onDashboard(t){let r=Number(t.target.value);this.dashboardUrl=this.dashboards[r]?.url_path??null,this.showDashboard(this.dashboardUrl)}onView(t){this.viewIndex=Number(t.target.value),this.selectView()}onKey(t){let r=Yd(t.key,this.split,t.shiftKey,t.altKey||t.ctrlKey||t.metaKey);r!==null&&(t.preventDefault(),this.split=r)}onPointerDown(t){Zd(t),this.dragging=!0}onPointerMove(t){if(!this.dragging)return;let r=this.renderRoot.querySelector(".stage");r instanceof HTMLElement&&(this.split=ul(t.clientX,r.getBoundingClientRect()))}onPointerUp(t){this.dragging=!1,Jd(t)}setMode(t){this.userMode=t,this.mode=t;let r={detail:{mode:t},bubbles:!0,composed:!0};this.dispatchEvent(new CustomEvent(ci,r))}renderStageView(){let t=this.candidate;return hd({frame:this.frame,density:this.density,split:this.split,comparing:this.comparing()||!t,candidateName:t?t.name:f.noCandidate,note:ud(t,this.effectiveMode()),title:vl(this.dashboards,this.dashboardUrl),menu:this.menu,modNote:Dt(t)},{onKey:r=>this.onKey(r),onPointerDown:r=>this.onPointerDown(r),onPointerMove:r=>this.onPointerMove(r),onPointerUp:r=>this.onPointerUp(r)})}renderBody(){let t=this.real.active(this.candidate)&&this.real.item(this.candidate);return t?ed(t,this.effectiveMode(),()=>this.real.fail(this.candidate)):this.notice?l`<p class="notice" role="status">${this.notice}</p>`:this.renderStageView()}render(){let t=this.views.length>0&&Rt(this.config);return l`
      ${md(this.nav?{...this.nav,locked:this.trying}:null,r=>this.actions.moveBy(r),l`
          ${pd({dashboards:this.dashboards,dashboardUrl:this.dashboardUrl,generatedDefault:this.defaultGenerated,views:this.views,viewIndex:this.viewIndex,showViews:t,frame:this.frame,density:this.density,mode:this.effectiveMode(),compare:this.comparing()||!this.candidate,canCompare:!!this.candidate,hide:this.hideControls,menu:this.menu,realAvailable:!!this.real.item(this.candidate),real:this.real.active(this.candidate)},{onDashboard:r=>this.onDashboard(r),onView:r=>this.onView(r),onFrame:r=>{this.frame=r},onDensity:r=>{this.density=r},onMode:r=>this.setMode(r),onMenu:r=>{this.menu=r,Al(r)},onLook:r=>this.real.choose(r),onCompare:()=>{this.candidate&&(this.compare=!this.comparing(),kl(this.compare,this.defaultCompare))}})}
          ${this.usingSample?l`<p class="notice" role="status">${f.sampleNote}</p>`:u}
          ${this.renderBody()}
        `)}
      ${this.actions.render()}
    `}};customElements.get("hats-lite-preview")||customElements.define("hats-lite-preview",To);function Ne(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16))}function _o(e){return Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")}function O(e){return`#${_o(e[0])}${_o(e[1])}${_o(e[2])}`}function Y(e,n,t){return[0,1,2].map(r=>Math.round(e[r]*t+n[r]*(1-t)))}function Un(e,n,t){return[0,1,2].map(r=>e[r]*t+n[r]*(1-t))}function So(e){let n=e/255;return n<=.03928?n/12.92:((n+.055)/1.055)**2.4}function ec(e){return .2126*So(e[0])+.7152*So(e[1])+.0722*So(e[2])}function Te(e,n){let[t,r]=[ec(e),ec(n)].sort((o,s)=>s-o);return(t+.05)/(r+.05)}var W=[255,255,255],st=[0,0,0];function Mo(e){return Te(W,e)>=Te(st,e)?W:st}function Bn(e,n){return Math.min(...n.map(t=>Te(e,t)))}function _e(e,n,t){if(Bn(e,n)>=t)return e;let r=Bn(W,n)>=Bn(st,n)?W:st;for(let o=1;o<=20;o+=1){let s=Y(r,e,o/20);if(Bn(s,n)>=t)return s}return r}function jn(e,n){return`rgba(${e[0]},${e[1]},${e[2]},${Number(n.toFixed(4))})`}var xg=[15,17,21],kg=[27,30,36],$g=[240,242,245],Eg=[170,176,186],Tg=[20,23,27],_g=[84,91,101],Sg=7.2,tc=7.1,Mg=4.55,Ao=3.05,Ag=4.55;function Cg(e){return Number.isFinite(e)?Math.min(60,Math.max(2,e)):2}function Pg(e,n,t){let r=Cg(n)/100;if(e==="light")return Math.min(1,.4+r);let o=r;for(;o>.02&&Te(W,Un(W,t,o))<Sg;)o=Math.max(.02,Number((o-.005).toFixed(4)));return o}var nc=/^#[0-9a-fA-F]{6}$/,it=2,Co=60;function Ft(e,n){if(n==="light"||!nc.test(e))return Co;let t=Bt(e,"dark",Co).alpha;return Math.min(Co,Math.max(it,Math.floor(t*100+1e-9)))}function zn(e,n){let t=Math.min(100,Math.max(0,Number.isFinite(e)?e:0));return Math.round(it+t/100*(n-it))}function rc(e,n){if(n<=it)return 0;let t=(e-it)/(n-it)*100;return Math.min(100,Math.max(0,Math.round(t)))}function oc(e,n,t){return nc.test(e)?Math.round(Bt(e,n,t).alpha*100):0}function Bt(e,n,t){let r=Ne(e),o=n==="dark",s=o?Y(r,xg,.09):Y(r,W,.055),i=o?Y(r,kg,.1):Y(r,W,.1),a=o?Y(r,Y(W,s,.05),.05):Y(r,W,.025),d=Number(Pg(n,t,s).toFixed(4));return{background:s,secondary:i,card:a,glass:Un(W,s,d),alpha:d}}function sc(e,n,t,r=20){let o=Ne(e),s=Ne(n),i=t==="dark",{background:a,secondary:d,card:c,glass:h,alpha:p}=Bt(e,t,r),g=[a,d,c,h],y=_e(Y(o,i?$g:Tg,.06),g,tc),E=_e(Y(o,i?Eg:_g,.1),g,Mg),A=Mo(o),S=_e(s,g,Ao),U=_e(o,g,Ao),I=i?Y(o,[10,12,15],.07):Y(o,W,.075),X=Un(o,I,.18),j=_e(o,[I,X],Ag);return{"primary-color":O(o),"accent-color":O(s),"primary-background-color":O(a),"secondary-background-color":O(d),"card-background-color":O(c),"ha-card-background":jn(W,p),"primary-text-color":O(y),"secondary-text-color":O(E),"divider-color":jn(i?W:st,.12),"app-header-background-color":O(o),"app-header-text-color":O(A),"text-primary-color":O(A),"paper-tabs-selection-bar-color":O(_e(s,[o],Ao)),"switch-checked-color":O(S),"switch-checked-button-color":O(Mo(S)),"paper-slider-active-color":O(U),"state-icon-color":O(S),"sidebar-background-color":O(I),"sidebar-text-color":O(_e(y,[I],tc)),"sidebar-selected-background-color":jn(o,.18),"sidebar-selected-text-color":O(j),"sidebar-selected-icon-color":O(j)}}var Po=/^#[0-9a-fA-F]{6}$/,ac=/^\/local\/hats_lite\/[0-9a-fA-F]{32}\.(png|jpg|webp|gif)$/,Rg=/^https:\/\/[^\s'"`\\(){}<>;]+$/,Dg=/\.\.|!important/i,Lg=2e3;function lc(e){return typeof e=="string"&&ac.test(e)}function Kn(e,n,t){return typeof e!="number"||!Number.isFinite(e)?n:Math.min(t,Math.max(n,e))}function ic(e){if(typeof e!="string"||!Po.test(e))throw new Error("Invalid color");return e}function Og(e,n){if(typeof e!="string"||Dg.test(e))throw new Error("Invalid background");if(n==="url"&&e.length>Lg)throw new Error("Background too long");if(!(n==="url"?Rg.test(e):ac.test(e)))throw new Error("Invalid background");return e}function Ro(e){let n=ic(e.main),t=ic(e.accent),r=Kn(e.radius,0,48),o=Kn(e.blur,0,40),s=Kn(e.tint,2,60),i={...sc(n,t,e.mode,s),"primary-color":n,"accent-color":t,"ha-card-border-radius":`${r}px`,"ha-card-backdrop-filter":`blur(${o}px)`},a=e.background;return a&&a.kind!=="none"&&(i["lovelace-background"]=`center / cover no-repeat fixed url('${Og(a.value,a.kind)}')`),i}var Ig=3;function dc(e){if(!Po.test(e.main)||!Po.test(e.accent))return[];let n=Ne(e.main),t=Ne(e.accent),{glass:r}=Bt(e.main,e.mode,Kn(e.tint,2,60));return[{id:"main-card",ratio:Te(n,r)},{id:"accent-card",ratio:Te(t,r)}].filter(s=>s.ratio<Ig).map(s=>({id:s.id,ratio:Number(s.ratio.toFixed(2))}))}var Hg=/^[A-Za-z0-9_-]{1,80}$/,Ng=new Set(["__proto__","constructor","prototype","tostring","hasownproperty","valueof","__definegetter__","__definesetter__","__lookupgetter__","__lookupsetter__","isprototypeof","propertyisenumerable","tolocalestring"]),Fg=["javascript:","vbscript:","@import","expression(","behavior:","-moz-binding","image-set(","imageset(","src(","<","&#"],Bg=/&[a-z#]/i,Ug=/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/,jg=/\/\*[\s\S]*?\*\//g,cc=/[\p{Z}\p{C}\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\u3164\u1160\u180e\u00ad\ufe00-\ufe0f]/gu,zg=/!\s*important\s*$/i,Kg="lovelace-background";function uc(e){let n=e.toLowerCase();return n.startsWith("card-mod-")||n.startsWith("uix-")}function Vg(e,n){let t=e;for(let r=0;r<4;r+=1){let o=t.replace(zg,"").trimEnd(),s=uc(n)?o:o.replace(/;+\s*$/,"").trimEnd();if(s===t)break;t=s}return t}function Wg(e){return e.replace(cc,"").normalize("NFKC").replace(jg,"").replace(cc,"").toLowerCase()}function pc(e,n){if(!Hg.test(e)||Ng.has(e.toLowerCase()))return"skip";if(e===Kg)return"background";let t=Vg(n,e);if(!t||n.includes("\0")||Ug.test(n)||t.includes("\\"))return"skip";let r=Wg(t);return Fg.some(o=>r.includes(o))||Bg.test(r)?"skip":r.includes("url(")?"background":!uc(e)&&/[{};]/.test(r)?"skip":"ok"}var at={main:"#03a9f4",accent:"#ff9800",radius:12,blur:10,tint:30,mode:"dark"},qg=["dark","light"],Gg=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,Xg=/^#([0-9a-f]{6})([0-9a-f]{2})?$/i,Yg=/^rgba?\(\s*([^)]*?)\s*\)$/i,Zg=/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i,Jg=/blur\(\s*(\d*\.?\d+)\s*(px|rem|em)?\s*\)/i,hc=16,Qg=300,eb=4096;function Fe(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ut(e,n,t){return Math.min(t,Math.max(n,e))}function tb(e){let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n);return Number.isFinite(t)?Ut(Math.round(t),0,255):null}function nb(e){if(e===void 0)return;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?Ut(t,0,1):null}function Do(e){if(typeof e!="string")return null;let n=e.trim(),t=Gg.exec(n);if(t)return{hex:`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toLowerCase(),alpha:void 0};let r=Xg.exec(n);if(r)return{hex:`#${r[1]}`.toLowerCase(),alpha:r[2]?parseInt(r[2],16)/255:void 0};let o=Yg.exec(n);if(!o)return null;let s=o[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);if(s.length<3||s.length>4)return null;let i=s.slice(0,3).map(tb),a=nb(s[3]);return i.some(d=>d===null)||a===null?null:{hex:O(i),alpha:a}}function rb(e){return typeof e=="string"?e:typeof e=="number"&&Number.isFinite(e)?String(e):null}function ob(e,n){if(!Fe(e)||!Fe(e.modes))return{};let t=e.modes[n];return Fe(t)?t:{}}function sb(e,n){let t=rb(n),r=t===null||t.length>eb?"skip":pc(e,t);return{text:t,verdict:r}}function Vn(e,n){let t={},r=new Map;if(!Fe(e))return{vars:t,skipped:0,skippedKeys:[],wallpaper:0,wallpaperKeys:[]};for(let i of[e,ob(e,n)])for(let[a,d]of Object.entries(i)){if(a==="modes")continue;let{text:c,verdict:h}=sb(a,d);r.set(a,h),h==="ok"?t[a]=c:delete t[a]}let o=[...r].filter(([,i])=>i==="skip").map(([i])=>i),s=[...r].filter(([,i])=>i==="background").map(([i])=>i);return{vars:t,skipped:o.length,skippedKeys:o,wallpaper:s.length,wallpaperKeys:s}}function mc(e,n){return Vn(e,n).vars}function Lo(e){return!Fe(e)||!Fe(e.modes)?[]:qg.filter(n=>Fe(e.modes[n]))}function ib(e){let n=e===void 0?null:Zg.exec(e.trim());if(!n)return null;let t=(n[2]??"px").toLowerCase();return parseFloat(n[1])*(t==="px"?1:hc)}function ab(e){for(let n of["ha-card-backdrop-filter","backdrop-filter"]){let t=Jg.exec(e[n]??"");if(t)return parseFloat(t[1])*((t[2]??"px").toLowerCase()==="px"?1:hc)}return null}function lb(e){for(let n of["ha-card-background","card-background-color"]){let t=Do(e[n])?.alpha;if(t!==void 0)return t}return null}function db(e,n){let t=Lo(e);return t.length===1?t[0]:n}function cb(e,n,t){let r=n==="light"?(e-.4)*100:e*100,o=Ut(Math.round(r),2,60);return rc(o,Ft(t,n))}function fc(e,n,t){let r=db(e,n),o=mc(e,r),s=Do(o["primary-color"])?.hex??t.main,i=Do(o["accent-color"])?.hex??t.accent,a=ib(o["ha-card-border-radius"]),d=ab(o),c=lb(o);return{main:s,accent:i,mode:r,radius:a===null?t.radius:Math.round(Ut(a,0,48)),blur:d===null?t.blur:Math.round(Ut(d,0,40)),tint:c===null?t.tint:cb(c,r,s)}}function ub(e,n,t,r){let o=mc(e,n);for(let[s,i]of Object.entries(r))t[s]!==i&&(o[s]=i);return o}function pb(e,n){return{main:e.main,accent:e.accent,radius:e.radius,blur:e.blur,tint:zn(e.tint,Ft(e.main,n)),background:{kind:"none"},mode:n}}function gc(e,n,t){let r=Ro(t);return e?ub(e,t.mode,Ro(pb(n,t.mode)),r):r}function Wn(e){return Object.keys(e).length>Qg}var qn={button:"Advanced",withDraft:"Open the full HATS designer. Your draft values travel in the address fragment; HATS must treat them as untrusted input.",plain:"Open the full HATS designer."};var hb=700,mb=2048,fb=200,bc=/^#[0-9a-fA-F]{6}$/,gb={radius:[0,48],blur:[0,40],tint:[0,100]},bb=3e4,Gn={available:!1,path:null},yc=new WeakMap;function vc(e){return typeof e!="string"||e.length===0||e.length>fb||!e.startsWith("/")||e.startsWith("//")||e.includes("\\")||e.includes("#")||e.includes("?")?!1:/^[\x21-\x7e]+$/.test(e)}function Oo(e,n){let[t,r]=gb[n];return typeof e=="number"&&Number.isFinite(e)&&e>=t&&e<=r}function wc(e){let n=e;return!n||typeof n.main!="string"||typeof n.accent!="string"||!bc.test(n.main)||!bc.test(n.accent)||!Oo(n.radius,"radius")||!Oo(n.blur,"blur")||!Oo(n.tint,"tint")?null:{main:n.main.toLowerCase(),accent:n.accent.toLowerCase(),radius:Math.round(n.radius),blur:Math.round(n.blur),tint:Math.round(n.tint)}}function yb(e){let n=wc(e);if(!n)return null;let t=JSON.stringify(n),r=btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");return`#lite=${r}`.length>mb?null:`#lite=${r}`}function vb(e,n){return vc(e)?e+(yb(n)??""):null}function wb(e,n,t=window){let r=vb(e,n);return r?(t.innerWidth<hb?t.location.assign(r):t.open(r,"_blank","noopener"),!0):!1}function xb(e,n){return Object.keys(e).every(r=>e[r]===n[r])?null:e}function xc(e){let n={main:e.main,accent:e.accent,radius:e.radius,blur:e.glassBlur,tint:e.tint};return xb(n,e.baseControls)}function kb(e){return typeof e=="object"&&e!==null&&e.code==="unknown_command"}function $b(e){let n=yc.get(e.connection);if(n&&(n.failedAt===null||Date.now()-n.failedAt<bb))return n.pending;let t={pending:Promise.resolve(Gn),failedAt:null};return t.pending=P(e,{type:"hats_lite/advanced_info"}).then(r=>r&&r.available===!0&&vc(r.path)?{available:!0,path:r.path}:(t.failedAt=Date.now(),Gn),r=>(kb(r)||(t.failedAt=Date.now()),Gn)),yc.set(e.connection,t),t.pending}var Io=class extends M{constructor(){super(...arguments);this.info=Gn;this.onFocus=()=>{this.info.available||this.ask()}}static{this.properties={hass:{attribute:!1},draft:{attribute:!1},info:{state:!0}}}static{this.styles=T`
    button {
      font: inherit;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--divider-color, #888);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--hl-focus, currentColor);
      outline-offset: 2px;
    }
  `}connectedCallback(){super.connectedCallback(),window.addEventListener("focus",this.onFocus)}disconnectedCallback(){window.removeEventListener("focus",this.onFocus),super.disconnectedCallback()}ask(){let t=this.hass,r=t?.connection;!t||!r||(this.asked=r,$b(t).then(o=>{this.asked===r&&(this.info=o)}))}willUpdate(){this.hass?.connection&&this.asked!==this.hass.connection&&this.ask()}render(){let t=this.info.available?this.info.path:null;if(!t)return u;let r=wc(this.draft)!==null;return l`<button type="button" data-action="advanced"
      title=${r?qn.withDraft:qn.plain}
      @click=${()=>wb(t,this.draft)}>${qn.button}</button>`}};customElements.get("hats-lite-advanced")||customElements.define("hats-lite-advanced",Io);var v={baseLabel:"Start from",baseDefault:"Default",baseTooLarge:"This theme has too many variables (300 at most, counting the base plus the Designer keys). Pick another base.",baseMissing:"The base theme is no longer installed. The Designer went back to Default.",baseSkipped:"{count} variables of the base theme were left out because they cannot be saved safely.",wallpaperOne:"1 wallpaper entry was removed.",wallpaperMany:"{count} wallpaper entries were removed.",valueRejected:"Some values were rejected as unsafe. Pick another base or change the values.",colors:"Colors",glance:"At a glance",onDashboard:"On your dashboard",shape:"Shape and glass",draftName:"Designer draft",mainColor:"Main color",accentColor:"Accent color",radius:"Corner radius",blur:"Glass blur",tint:"Card tint",mode:"Mode",modeDark:"Dark",modeLight:"Light",background:"Background",backgroundNone:"None",uploadLabel:"Upload a background image",uploadHint:"PNG, JPEG, WebP or GIF, up to 8 MiB",uploading:"Uploading...",uploadAdminOnly:"Only administrators can upload backgrounds.",uploadTooLarge:"Pick an image up to 8 MiB.",uploadType:"Pick a PNG, JPEG, WebP or GIF image.",uploadFailed:"Upload failed. The previous background is kept.",invalidColor:"Pick a valid color",invalidBackground:"This background is not allowed",backgroundTooLong:"This background address is too long (2000 characters at most).",restartReminder:"This theme uses an uploaded background. Backgrounds need a Home Assistant restart before they are served.",invalidInput:"Some values are not valid",saveTitle:"Save as theme",saveAdminOnly:"Only administrators can save themes.",nameLabel:"Theme name",nameInvalid:"Use 1 to 60 letters, digits, spaces, hyphens or underscores, starting with a letter or digit",saveButton:"Save as theme",saving:"Saving...",saved:"Theme saved",saveFailed:"Could not save the theme.",nameReserved:"This name is reserved. Pick another name.",nameExists:"A theme with this name already exists. Pick another name.",formatInvalid:"The theme could not be written in a valid format.",overwrote:"Saved. An existing theme with this name was replaced.",needsRestart:"Background uploaded. Backgrounds need a Home Assistant restart before they are served.",warnMainCard:"The main color is hard to see on cards (contrast {ratio}:1, 3:1 recommended).",warnAccentCard:"The accent color is hard to see on cards (contrast {ratio}:1, 3:1 recommended)."};var Eb=/\bdo not (use|modify)\b/i;function Tb(e){return typeof e=="string"&&Eb.test(e)}function te(e,n){return e.filter(t=>!Tb(t)||t===n)}function kc(e){let n=e?.themes?.themes;return!n||typeof n!="object"?[]:Object.keys(n).sort((t,r)=>t.localeCompare(r))}function $c(e,n,t){return l`
    <label class="field base">
      <span>${v.baseLabel}</span>
      <select class="pill" data-field="base" @change=${t}>
        <option value="" .selected=${n===""}>${v.baseDefault}</option>
        ${te(e,n).map(r=>l`<option value=${r} .selected=${n===r}>${r}</option>`)}
      </select>
    </label>
  `}function Ho(e,n){if(!n)return;let t=e?.themes?.themes?.[n];if(t==null)throw new Error("Base theme missing");return t}function Xn(e,n){return n!==""&&!e?.themes?.themes?.[n]}function No(e){let n=Lo(e);return n.length?n:["dark","light"]}function Ec(e,n,t){if(!n||Xn(e,n))return 0;let r=e?.themes?.themes?.[n],o=new Set;for(let s of No(r))Vn(r,s).skippedKeys.forEach(i=>o.add(i));return o.size}function Tc(e,n){if(!n||Xn(e,n))return 0;let t=e?.themes?.themes?.[n],r=new Set;for(let o of No(t))Vn(t,o).wallpaperKeys.forEach(s=>r.add(s));return r.size}function _c(e,n){let t=e?No(e):["dark","light"],r={};for(let o of t){let s=n(o);if(Wn(s))throw new Error("Too many variables");r[o]=s}return{variables:r[t[0]],modes:r}}function Sc(e,n,t){let r=n?e?.themes?.themes?.[n]:void 0;return r?{base:n,controls:fc(r,t,at)}:{base:"",controls:at}}function Mc(e,n,t,r,o=0){return l`
    ${e?l`<p class="hint" data-notice="base">${e}</p>`:u}
    ${n>0?l`<p class="hint" data-notice="skipped">${v.baseSkipped.replace("{count}",String(n))}</p>`:u}
    ${o>0?l`<p class="hint" data-notice="wallpaper">${o===1?v.wallpaperOne:v.wallpaperMany.replace("{count}",String(o))}</p>`:u}
    ${t===""&&r?l`<p class="error" role="alert">${r}</p>`:u}
  `}function Ac(e,n){return l`
    <section class="group">
      <h3>${v.mode}</h3>
      <div class="seg" role="group" aria-label=${v.mode}>
        ${["dark","light"].map(t=>l`<button type="button" data-field="mode" data-mode=${t}
            aria-pressed=${String(e===t)}
            @click=${()=>n(t)}>${t==="dark"?v.modeDark:v.modeLight}</button>`)}
      </div>
    </section>
  `}function Fo(e){return l`
    <label class="range">
      <span class="range-head">
        <span>${e.label}</span>
        <span class="range-value" data-readout=${e.field}>${e.readout}</span>
      </span>
      <input type="range" min=${e.min} max=${e.max} step="1" data-field=${e.field}
        .value=${String(e.value)}
        @input=${e.onInput} />
    </label>
  `}function Cc(e,n,t,r){return l`
    <label class="color-row">
      <input type="color" data-field=${e} .value=${t} @input=${r} />
      <span class="color-text">
        <span>${n}</span>
        <span class="hex" data-readout=${e}>${t}</span>
      </span>
    </label>
  `}function Pc(e){return l`
    <button type="button" class=${e.over?"drop over":"drop"} data-action="upload"
      ?disabled=${e.uploading}
      @click=${e.onPick}
      @dragover=${e.onDragOver}
      @dragleave=${e.onDragLeave}
      @drop=${e.onDrop}>
      <span class="drop-title">${e.uploading?v.uploading:v.uploadLabel}</span>
      <span class="drop-hint">${v.uploadHint}</span>
    </button>
    <input class="visually-hidden" type="file" tabindex="-1" aria-hidden="true"
      accept="image/png,image/jpeg,image/webp,image/gif"
      ?disabled=${e.uploading}
      @change=${e.onFile} />
    ${e.error?l`<p class="error" role="alert">${e.error}</p>`:u}
    ${e.notice?l`<p class="hint" role="status" data-notice="restart">${e.notice}</p>`:u}
  `}function Rc(e){return l`
    <div class="bar">
      <label>
        <span class="visually-hidden">${v.nameLabel}</span>
        <input type="text" maxlength="60" data-field="name" placeholder=${v.nameLabel}
          .value=${e.name}
          @input=${e.onName} />
      </label>
      <button type="button" class="btn primary" data-action="save" ?disabled=${e.saving}
        @click=${e.onSave}>
        ${e.saving?v.saving:v.saveButton}
      </button>
      ${e.message?l`<span class=${e.failed?"chip warn message":"chip ok message"}
            role=${e.failed?"alert":"status"}>${e.message}</span>`:u}
    </div>
  `}var Dc=[K,V,T`
  :host {
    display: block;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .layout {
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .stage {
    position: sticky;
    top: 16px;
    min-width: 0;
  }
  .stage h3 {
    margin: 0 0 10px;
  }
  .glance {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  .glance hats-lite-thumb {
    width: min(100%, 512px);
    max-height: 320px;
    border-radius: var(--hl-radius-lg);
    border: 1px solid var(--hl-line);
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }
  .color-row {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
  }
  .color-row input[type="color"] {
    width: 48px;
    height: 48px;
    padding: 0;
    border: 2px solid var(--hl-line);
    border-radius: 50%;
    background: none;
    cursor: pointer;
    overflow: hidden;
  }
  .color-row input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .color-row input[type="color"]::-webkit-color-swatch {
    border: 0;
    border-radius: 50%;
  }
  .color-row input[type="color"]::-moz-color-swatch {
    border: 0;
    border-radius: 50%;
  }
  .color-text {
    display: flex;
    flex-direction: column;
  }
  .hex {
    color: var(--hl-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-transform: uppercase;
  }
  .range {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .range-head {
    display: flex;
    justify-content: space-between;
  }
  .range-value {
    color: var(--hl-muted);
    font-variant-numeric: tabular-nums;
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--hl-accent);
  }
  .drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 18px 12px;
    border: 2px dashed var(--hl-line);
    border-radius: var(--hl-radius-md);
    background: transparent;
    color: var(--hl-text);
    font: inherit;
    cursor: pointer;
  }
  .drop:hover,
  .drop.over {
    border-color: var(--hl-accent);
  }
  .drop:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .drop[disabled] {
    opacity: 0.6;
    cursor: progress;
  }
  .drop-title {
    font-weight: 600;
  }
  .drop-hint,
  .hint {
    color: var(--hl-muted);
    font-size: 12px;
    margin: 0;
  }
  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .error {
    margin: 0;
    color: var(--error-color, #db4437);
    font-size: 13px;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: var(--hl-radius-lg);
    background: color-mix(in srgb, var(--hl-surface) 90%, var(--hl-text));
    border: 1px solid var(--hl-edge);
  }
  .bar label {
    flex: 1 1 140px;
    min-width: 0;
  }
  .bar input[type="text"] {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-line);
    background: var(--hl-bg);
    color: var(--hl-text);
    font: inherit;
  }
  .base {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 600;
  }
  .base select {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-line);
    background: var(--hl-bg);
    color: var(--hl-text);
    font: inherit;
    font-weight: 400;
  }
  .bar .message {
    flex-basis: 100%;
    white-space: normal;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  @media (max-width: 899px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .stage {
      position: static;
    }
  }
`,Gd];function Bo(e,n){if(e&&typeof e=="object"&&"message"in e){let t=e.message;if(typeof t=="string"&&t.length>0)return t}return n}function Lc(e){return e.size>8388608?v.uploadTooLarge:ui.includes(e.type)?null:v.uploadType}function Sb(e,n){let t={method:"POST",body:n};if(typeof e.fetchWithAuth=="function")return e.fetchWithAuth(Ir,t);let r=e.auth?.data?.access_token??"";return fetch(Ir,{...t,headers:{Authorization:`Bearer ${r}`}})}async function Oc(e,n){let t=new FormData;t.append("file",n);let r,o;try{r=await Sb(e,t),o=await r.json().catch(()=>({}))}catch{return{error:v.uploadFailed}}if(!r.ok)return{error:Bo(o,v.uploadFailed)};let{url:s,needs_restart:i}=o;return lc(s)?{url:s,needsRestart:i===!0}:{error:v.uploadFailed}}var Mb=/^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/,Ab={"main-card":v.warnMainCard,"accent-card":v.warnAccentCard};function Ic(e){return e.toLowerCase()==="default"?v.nameReserved:Mb.test(e)?null:v.nameInvalid}function Hc(e){let n=e&&typeof e=="object"?e.code:void 0;return n==="name_exists"?v.nameExists:n==="reserved_name"?v.nameReserved:n==="invalid_format"?v.formatInvalid:n==="invalid_value"?v.valueRejected:Bo(e,v.saveFailed)}function Nc(e){return e&&typeof e=="object"&&e.overwrote===!0?v.overwrote:v.saved}function Fc(e){return dc(e).map(n=>Ab[n.id].replace("{ratio}",n.ratio.toFixed(1)))}function Uo(e){let n=e instanceof Error?e.message:"";return n==="Invalid color"?{field:"color",message:v.invalidColor}:n==="Invalid background"?{field:"background",message:v.invalidBackground}:n==="Background too long"?{field:"background",message:v.backgroundTooLong}:n==="Base theme missing"?{field:"",message:v.baseMissing}:n==="Too many variables"?{field:"",message:v.baseTooLarge}:{field:"color",message:v.invalidInput}}function Bc(e,n){return n.kind==="upload"?`${e} ${v.restartReminder}`:e}var Cb=[],Pb=["tablet","mode"],Rb=["base","main","accent","radius","glassBlur","tint","mode","background"],Uc={radius:{label:v.radius,min:0,max:48,unit:"px"},glassBlur:{label:v.blur,min:0,max:40,unit:"px"}},jo=class extends M{constructor(){super(...arguments);this.dragOver=!1;this.base="";this.baseControls=at;this.main="#03a9f4";this.accent="#ff9800";this.radius=12;this.glassBlur=10;this.tint=30;this.mode="dark";this.background={kind:"none"};this.errorField="";this.errorMessage="";this.themeName="";this.uploading=!1;this.uploadError="";this.uploadNotice="";this.saving=!1;this.saveMessage="";this.saveFailed=!1;this.baseNotice=""}static{this.properties={hass:{attribute:!1},base:{state:!0},main:{state:!0},accent:{state:!0},radius:{state:!0},glassBlur:{state:!0},tint:{state:!0},mode:{state:!0},background:{state:!0},candidate:{state:!0},errorField:{state:!0},errorMessage:{state:!0},themeName:{state:!0},uploading:{state:!0},uploadError:{state:!0},uploadNotice:{state:!0},saving:{state:!0},saveMessage:{state:!0},saveFailed:{state:!0},baseNotice:{state:!0},dragOver:{state:!0}}}static{this.styles=Dc}willUpdate(t){if(Xn(this.hass,this.base)){this.base="",this.baseControls=at,this.baseNotice=v.baseMissing,this.rebuild();return}(!this.candidate||Rb.some(r=>t.has(r)))&&this.rebuild()}render(){let t=this.hass?.user?.is_admin===!0;return l`
      <div class="layout">
        <div class="controls">
          <hats-lite-advanced .hass=${this.hass} .draft=${xc(this)}></hats-lite-advanced>
          ${$c(kc(this.hass),this.base,r=>this.onBase(r))}
          ${Mc(this.baseNotice,Ec(this.hass,this.base,this.mode),this.errorField,this.errorMessage,Tc(this.hass,this.base))}
          <section class="group">
            <h3>${v.colors}</h3>
            ${this.renderColor("main",v.mainColor)}
            ${this.renderColor("accent",v.accentColor)}
            ${this.errorField==="color"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${this.warnings().map(r=>l`<p class="hint" data-warning>${r}</p>`)}
          </section>
          <section class="group">
            <h3>${v.shape}</h3>
            ${Object.keys(Uc).map(r=>this.renderSlider(r))}
            ${this.renderTint()}
          </section>
          <section class="group">
            <h3>${v.background}</h3>
            <div class="choices">
              <button type="button" class="chip-btn" data-action="background-none"
                aria-pressed=${String(this.background.kind==="none")}
                @click=${()=>this.setBackground({kind:"none"})}>${v.backgroundNone}</button>
              ${Cb.map(r=>l`<button type="button" class="chip-btn"
                  aria-pressed=${String(this.background.kind==="preset"&&this.background.value===r.value)}
                  @click=${()=>this.setBackground({kind:"preset",value:r.value})}>${r.label}</button>`)}
            </div>
            ${this.errorField==="background"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${t?this.renderUpload():l`<p class="hint">${v.uploadAdminOnly}</p>`}
          </section>
          ${Ac(this.mode,r=>this.setMode(r))}
          ${t?this.renderSave():l`<p class="hint">${v.saveAdminOnly}</p>`}
        </div>
        <div class="stage">
          <h3>${v.glance}</h3>
          <div class="glance">
            <hats-lite-thumb .vars=${this.candidate?.vars??null} .mode=${this.mode}></hats-lite-thumb>
          </div>
          <h3>${v.onDashboard}</h3>
          <hats-lite-preview
            .hass=${this.hass}
            .candidate=${this.candidate}
            .mode=${this.mode}
            .showActions=${!1}
            .hideControls=${Pb}
            .defaultCompare=${!1}
            @hats-lite-mode-change=${r=>this.onPreviewMode(r)}
          ></hats-lite-preview>
        </div>
      </div>
    `}renderColor(t,r){return Cc(t,r,this[t],o=>this.setText(t,o))}renderSlider(t){let r=Uc[t];return Fo({label:r.label,readout:`${this[t]}${r.unit}`,field:t,min:r.min,max:r.max,value:this[t],onInput:o=>this.setNumber(t,o)})}renderTint(){let t=oc(this.main,this.mode,this.tintValue(this.mode));return Fo({label:v.tint,readout:`${t}%`,field:"tint",min:0,max:100,value:this.tint,onInput:r=>this.setTint(r)})}tintValue(t){return zn(this.tint,Ft(this.main,t))}setTint(t){this.tint=Number(t.target.value)}renderUpload(){return Pc({over:this.dragOver,uploading:this.uploading,error:this.uploadError,notice:this.uploadNotice,onPick:()=>this.fileInput()?.click(),onDragOver:t=>this.onDragOver(t),onDragLeave:()=>{this.dragOver=!1},onDrop:t=>this.onDrop(t),onFile:t=>this.onFile(t)})}renderSave(){return Rc({name:this.themeName,saving:this.saving,message:this.saveMessage,failed:this.saveFailed,onName:t=>this.setName(t),onSave:()=>this.onSave()})}designerInput(t){return{main:this.main,accent:this.accent,radius:this.radius,blur:this.glassBlur,tint:this.tintValue(t),background:this.background,mode:t}}finalVars(t){let r=Ho(this.hass,this.base),o=gc(r,this.baseControls,this.designerInput(t));if(Wn(o))throw new Error("Too many variables");return o}warnings(){return Fc(this.designerInput(this.mode))}rebuild(){try{let t=this.finalVars(this.mode);this.candidate={name:v.draftName,vars:t,installed:!1,canApply:!1},this.errorField="",this.errorMessage=""}catch(t){let r=Uo(t);this.errorField=r.field,this.errorMessage=r.message}}buildModes(){try{return _c(Ho(this.hass,this.base),t=>this.finalVars(t))}catch(t){this.saveFailed=!0,this.saveMessage=Uo(t).message;return}}onBase(t){let r=t.target.value,o=Sc(this.hass,r,this.mode),s=o.controls;this.base=o.base,this.baseNotice="",this.baseControls=s,this.main=s.main,this.accent=s.accent,this.radius=s.radius,this.glassBlur=s.blur,this.tint=s.tint,this.mode=s.mode,this.background={kind:"none"},this.uploadNotice="",this.saveMessage=""}setText(t,r){this[t]=r.target.value}setNumber(t,r){this[t]=Number(r.target.value)}onPreviewMode(t){let r=t.detail?.mode;(r==="dark"||r==="light")&&(this.mode=r)}setMode(t){this.mode=t}fileInput(){return this.renderRoot.querySelector('input[type="file"]')}onDragOver(t){t.preventDefault(),this.dragOver=!0}onDrop(t){t.preventDefault(),this.dragOver=!1;let r=t.dataTransfer?.files?.[0];r&&this.handleFile(r,null)}setBackground(t){this.background=t,this.uploadNotice=""}setName(t){this.themeName=t.target.value}async onFile(t){let r=t.target,o=r.files?.[0];o&&await this.handleFile(o,r)}async handleFile(t,r){let o=this.hass;if(!o||this.uploading)return;let s=Lc(t);if(s){this.uploadError=s,r&&(r.value="");return}this.uploading=!0,this.uploadError="",this.uploadNotice="";try{let i=await Oc(o,t);"error"in i?this.uploadError=i.error:(this.background={kind:"upload",value:i.url},i.needsRestart&&(this.uploadNotice=v.needsRestart))}finally{this.uploading=!1,r&&(r.value="")}}async onSave(){let t=this.hass;if(!t)return;let r=this.themeName.trim(),o=Ic(r);if(o){this.saveFailed=!0,this.saveMessage=o;return}let s=this.buildModes();if(s){this.saving=!0,this.saveMessage="";try{let i=await P(t,{type:"hats_lite/save_theme",name:r,variables:s.variables,modes:s.modes});this.dispatchEvent(new CustomEvent(di,{bubbles:!0,composed:!0,detail:{name:r}})),this.saveFailed=!1,this.saveMessage=Bc(Nc(i),this.background)}catch(i){this.saveFailed=!0,this.saveMessage=Hc(i)}finally{this.saving=!1}}}};customElements.get("hats-lite-designer")||customElements.define("hats-lite-designer",jo);function q(e){let n=e&&typeof e=="object"?e.code:void 0;return typeof n=="string"?n:"unknown"}var he="hats_lite/";async function zo(e){let n=await P(e,{type:`${he}people`});return Array.isArray(n?.people)?n.people:[]}function jc(e,n){let t={type:`${he}assign`,user_id:n.user_id,theme:n.theme};return n.dark!==void 0&&(t.dark=n.dark),n.ends!==void 0&&n.ends!==null&&(t.ends=n.ends),P(e,t)}function zc(e,n){return P(e,{type:`${he}unassign`,override_id:n})}function Kc(e,n){return P(e,{type:`${he}set_opt_out`,opt_out:n})}function Vc(e,n,t){return P(e,{type:`${he}set_birthday`,user_id:n,...t})}function Wc(e,n){return P(e,{type:`${he}set_birthday`,user_id:n,clear:!0})}async function qc(e){let n=await P(e,{type:`${he}holidays_list`});return Array.isArray(n?.holidays)?n.holidays:[]}async function Gc(e,n){let t=await P(e,{type:`${he}holidays_set`,holidays:n});return Array.isArray(t?.holidays)?t.holidays:n}function Xc(e,n){return P(e,{type:`${he}assigners_set`,user_ids:n})}async function Yc(e){try{return await zo(e),!0}catch(n){return q(n)!=="unknown_command"}}function Yn(){window.hatsLite?.refreshEffective?.()}function Zn(e){return{dark:void 0,primaryColor:void 0,accentColor:void 0,...e}}var lt=[31,29,31,30,31,30,31,31,30,31,30,31];function Qn(e,n){return!Number.isInteger(e)||!Number.isInteger(n)||e<1||e>12?!1:n>=1&&n<=lt[e-1]}function Ko(e){let n=e.name.trim();return n.length===0||n.length>60?"name":!Qn(e.month_start,e.day_start)||!Qn(e.month_end,e.day_end)?"date":e.theme.length===0?"theme":null}function Db(e,n){if(n)try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,year:"numeric",month:"numeric",day:"numeric"}).formatToParts(e),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("year"),r("month"),r("day")]}catch{return[e.getFullYear(),e.getMonth()+1,e.getDate()]}return[e.getFullYear(),e.getMonth()+1,e.getDate()]}function Lb(e){return e.month_start*32+e.day_start>e.month_end*32+e.day_end}function Zc(e,n=new Date,t){let[r,o,s]=Db(n,t),i=r*1e4+o*100+s,a=Lb(e)?1:0;for(let d of[r-1,r,r+1])if((d+a)*1e4+e.month_end*100+e.day_end>=i)return d;return r+1}function Jc(e,n){return!Number.isFinite(e)||e<=n||e>n+31622400?"invalid_range":null}function Ob(e,n,t,r){let o=n*32+t,s=e.month_start*32+e.day_start,i=e.month_end*32+e.day_end,a=e.year!==void 0&&r!==void 0;return s<=i?o>=s&&o<=i&&(!a||r===e.year):a?o>=s&&r===e.year||o<=i&&r===e.year+1:o>=s||o<=i}function Vo(e,n,t){if(e.enabled===!1||Ko(e)==="date")return[];let r=[],o=null;for(let s=1;s<=lt[n-1];s+=1)Ob(e,n,s,t)?o?o.to=s:(o={from:s,to:s},r.push(o)):o=null;return r}var Se=e=>String(e).padStart(2,"0");function Qc(e,n){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"}).formatToParts(new Date(e)),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("year"),r("month"),r("day"),r("hour"),r("minute")]}catch{return null}}function Jn(e,n){let t=Qc(e,n);return t?Date.UTC(t[0],t[1]-1,t[2],t[3],t[4])-Math.floor(e/6e4)*6e4:null}function eu(e,n){let t=Date.parse(`${e}Z`);if(!n||Number.isNaN(t))return Date.parse(e)/1e3;let r=864e5,o=Jn(t-r,n),s=Jn(t+r,n);if(o===null||s===null)return Date.parse(e)/1e3;let i=t-o;if(Jn(i,n)===o)return i/1e3;let a=t-s;return Jn(a,n)===s?a/1e3:i/1e3}function Wo(e,n){let t=n?Qc(e*1e3,n):null;if(t)return`${String(t[0]).padStart(4,"0")}-${Se(t[1])}-${Se(t[2])}T${Se(t[3])}:${Se(t[4])}`;let r=new Date(e*1e3);return`${r.getFullYear()}-${Se(r.getMonth()+1)}-${Se(r.getDate())}T${Se(r.getHours())}:${Se(r.getMinutes())}`}var jt=[K,V,T`
  :host {
    display: block;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.5);
  }
  .dialog {
    width: min(560px, 100%);
    max-height: 100%;
    overflow: auto;
    padding: 20px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
    box-shadow: var(--hl-shadow);
    color: var(--hl-text);
  }
  .dialog h2 {
    margin: 0 0 12px;
    font-size: 18px;
  }
  .field,
  fieldset {
    display: grid;
    gap: 4px;
    margin: 0 0 12px;
    padding: 0;
    border: 0;
    min-width: 0;
  }
  legend {
    padding: 0;
    color: var(--hl-muted);
  }
  label {
    color: var(--hl-muted);
  }
  .choice {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--hl-text);
  }
  select,
  input[type="text"],
  input[type="number"],
  input[type="datetime-local"] {
    font: inherit;
    min-height: 36px;
    padding: 4px 8px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-edge);
    background: var(--hl-bg);
    color: var(--hl-text);
    min-width: 0;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: end;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  .error {
    margin: 8px 0;
    color: var(--error-color, #e5484d);
  }
  .holiday-list {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
    max-height: min(320px, 45vh);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .holiday-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 0;
    border-top: 1px solid var(--hl-line);
  }
  .holiday-main {
    flex: 1 1 160px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .holiday-actions {
    display: flex;
    gap: 8px;
  }
  .chip {
    margin-left: 6px;
    padding: 1px 8px;
    border-radius: 999px;
    border: 1px solid var(--hl-line);
    font-size: 11px;
    color: var(--hl-muted);
  }
  .form-title {
    margin: 0 0 12px;
    font-size: 16px;
  }
  .muted {
    color: var(--hl-muted);
  }
  .timeline {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 2px;
    margin: 8px 0 12px;
    padding: 0;
    list-style: none;
  }
  .timeline .month {
    min-width: 0;
    font-size: 11px;
    color: var(--hl-muted);
  }
  .timeline .track {
    position: relative;
    height: 22px;
    margin-top: 2px;
    border-radius: 4px;
    background: var(--hl-surface-raised);
    overflow: hidden;
  }
  .timeline .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    background: var(--hl-accent);
    opacity: 0.85;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  @media (max-width: 899px) {
    .row {
      flex-direction: column;
      align-items: stretch;
    }
  }
`],tu=[K,V,T`
  :host {
    display: block;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: var(--hl-gap);
  }
  .card {
    min-width: 0;
    padding: 16px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  h2 {
    margin: 0 0 8px;
    font-size: 16px;
  }
  .muted {
    color: var(--hl-muted);
  }
  ul.people,
  ul.holidays {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .person {
    display: grid;
    gap: 6px;
    padding: 12px 0;
    border-top: 1px solid var(--hl-line);
  }
  .person:first-child {
    border-top: 0;
  }
  .head,
  .tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .name {
    font-weight: 600;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .switch {
    appearance: none;
    cursor: pointer;
    font: inherit;
    min-height: 34px;
    padding: 4px 14px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-edge);
    background: transparent;
    color: var(--hl-text);
  }
  .switch[aria-checked="true"] {
    background: color-mix(in srgb, var(--hl-accent) 22%, transparent);
    border-color: var(--hl-accent);
  }
  .switch:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .notice {
    margin: 0 0 12px;
    padding: 8px 12px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-line);
  }
  .notice.error {
    color: var(--error-color, #e5484d);
  }
  .timeline {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 2px;
    margin: 8px 0 12px;
    padding: 0;
    list-style: none;
  }
  .timeline .month {
    font-size: 11px;
    color: var(--hl-muted);
  }
  .timeline .track {
    position: relative;
    height: 22px;
    margin-top: 2px;
    border-radius: 4px;
    background: var(--hl-surface-raised);
    overflow: hidden;
  }
  .timeline .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    background: var(--hl-accent);
    opacity: 0.85;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  @media (max-width: 899px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`];var m={title:"People",intro:"Choose who gets which theme, and when.",loading:"Loading people...",loadFailed:"Could not load the people list.",retry:"Try again",you:"You",admin:"Admin",optedOutChip:"Opted out",optOutLabel:"Do not let others change my theme",optOutOn:"Others can no longer change your theme.",optOutOff:"Others can change your theme again.",optOutShortcut:"Opt out",noOverride:"Using their own theme",setBy:e=>e?`Set by ${e}`:"Set by an administrator",overrideLine:e=>`Theme ${e}`,until:e=>`until ${e}`,noEnd:"until removed",assign:"Assign theme",startsNow:"This theme starts immediately and stays until the end time below.",unassign:"Remove",birthday:"Birthday",close:"Close",cancel:"Cancel",save:"Save",saving:"Saving...",assignTitle:e=>`Assign a theme to ${e}`,theme:"Theme",defaultTheme:"default",mode:"Mode",modeAuto:"Auto",modeDark:"Dark",modeLight:"Light",duration:"Until",untilNone:"Until removed",untilDate:"Until a date and time",untilInput:"End date and time",assigned:"Theme assigned.",selfApplied:"That is your own account, so the theme was applied to you directly.",unassigned:"Assignment removed.",birthdayTitle:e=>`Birthday for ${e}`,month:"Month",day:"Day",clear:"Clear birthday",birthdaySaved:"Birthday saved.",birthdayCleared:"Birthday cleared.",holidays:"Holidays",holidaysIntro:"Each holiday switches everyone to its theme during the range.",holidaysEmpty:"No holidays yet.",editHolidays:"Edit holidays",holidayEditorTitle:"Holidays and events",holidayName:"Name",holidayStart:"Starts",holidayEnd:"Ends",holidayEnabled:"Enabled",holidayRemove:"Remove",holidayEdit:"Edit",holidayAdd:"Add holiday",eventAdd:"Add event",holidayKind:"Holiday",eventKind:"Event",eventName:"Event name",eventNamePlaceholder:"For example, Anna's birthday",eventYearly:"Repeat every year",holidayNewTitle:"New holiday",eventNewTitle:"New event",holidayEditTitle:e=>`Edit ${e}`,holidayListLabel:"Holidays and events",holidayOff:"off",holidayPreset:"Preset",holidayPresetPick:"Choose a preset",holidayBack:"Back to list",holidaysSaved:"Holidays saved.",timeline:"Next 12 months",holidayRowLabel:(e,n)=>`${n}: ${e}`,timelineHoliday:(e,n)=>`${e}, ${n}`,problemName:"Enter a name of up to 60 characters.",problemDate:"This date does not exist in that month.",problemTheme:"Choose a theme.",problemUntil:"Pick a time in the future, within 366 days.",assigners:"Assigners",assignersTitle:"Who may assign themes",assignersHelp:"Assigners can set the theme of other non-admin users. Saving replaces the whole list.",assignersEmpty:"There are no non-admin users.",assignersSaved:"Assigners saved.",months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],errors:{unauthorized:"You are not allowed to do that.",invalid_user:"That user is no longer available.",unknown_theme:"That theme is not installed.",invalid_range:"That date range is not allowed.",limit_reached:"A limit was reached. Remove something and try again.",invalid_request:"The server did not accept those values.",not_found:"That item no longer exists.",save_failed:"The change could not be saved. Try again.",unknown_command:"This server does not support the People tab.",not_loaded:"The server is still starting. Try again in a moment.",rate_limited:"Too many requests. Wait a moment and try again.",invalid_format:"Those values are not in a valid format.",unknown:"Something went wrong. Try again."},missingTheme:e=>`missing: ${e}`,holidaysLoadFailed:"Could not load the holidays. Editing is off until they load.",unknownCode:e=>`Something went wrong (${e}). Try again.`,optedOut:e=>`${e} chose not to have their theme changed.`};function dt(e,n){if(e==="opted_out")return m.optedOut(n??"This person");let t=m.errors[e];return t||(e==="unknown"?m.errors.unknown:m.unknownCode(e))}var Hb='button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',qo=class extends M{constructor(){super(...arguments);this.heading="";this.busy=!1;this.onKey=t=>{if(t.key==="Escape"){if(t.stopPropagation(),this.busy)return;this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}));return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=this.getRootNode().activeElement,s=t.shiftKey?r[0]:r[r.length-1];(o===s||!o||!this.contains(o))&&(t.preventDefault(),(t.shiftKey?r[r.length-1]:r[0]).focus())}}static{this.properties={heading:{type:String},busy:{type:Boolean}}}static{this.styles=jt}firstUpdated(){this.focusables()[0]?.focus()}focusables(){return[...this.querySelectorAll(Hb)].filter(t=>!t.disabled)}render(){return l`
      <div class="backdrop">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="title" @keydown=${this.onKey}>
          <h2 id="title">${this.heading}</h2>
          <slot></slot>
        </div>
      </div>
    `}},ne=class extends M{constructor(){super(...arguments);this.themes=[];this.installed=[];this.busy=!1;this.error=""}static{this.properties={hass:{attribute:!1},themes:{attribute:!1},installed:{attribute:!1},busy:{state:!0},error:{state:!0}}}static{this.styles=jt}done(t){this.dispatchEvent(new CustomEvent("people-done",{detail:t,bubbles:!0,composed:!0}))}close(){this.busy||this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}))}async run(t,r){if(!(this.busy||!this.hass)){this.busy=!0,this.error="";try{let o=await t();o&&this.done(o)}catch(o){this.error=dt(q(o),r)}finally{this.busy=!1}}}themeOptions(t){let r=[m.defaultTheme,...te(this.themes,t).filter(s=>s!==m.defaultTheme)],o=r.map(s=>l`<option value=${s} ?selected=${s===t}>${s}</option>`);if(t&&!r.includes(t)){let s=this.installed.includes(t)?t:m.missingTheme(t);o.push(l`<option value=${t} selected>${s}</option>`)}return o}renderError(){return this.error?l`<p class="error" role="alert">${this.error}</p>`:u}renderActions(t,r=!1){return l`
      <div class="actions">
        <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${m.cancel}</button>
        <button class="btn primary" type="submit" ?disabled=${this.busy||r}>
          ${this.busy?m.saving:t}
        </button>
      </div>
    `}},Go=class extends ne{constructor(){super(...arguments);this.mode="auto";this.limited=!1;this.until="";this.startsNow=!1;this.theme=m.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(!r)return;let o=this.mode==="auto"?void 0:this.mode==="dark",s=Date.now()/1e3,i=null;if(this.limited&&(i=eu(this.until,this.zone),Jc(i,s))){this.error=m.problemUntil;return}this.run(async()=>{if((await jc(this.hass,{user_id:r.id,theme:this.theme,dark:o,ends:i}))?.self){let d=o===void 0?{theme:this.theme}:{theme:this.theme,dark:o};return{message:m.selfApplied,selfApply:Zn(d)}}return{message:m.assigned}},r.name)}}static{this.properties={...ne.properties,person:{attribute:!1},mode:{state:!0},limited:{state:!0},until:{state:!0},theme:{state:!0},startsNow:{attribute:!1}}}get zone(){return this.hass?.config?.time_zone||void 0}render(){let t=this.person;if(!t)return u;let r=Wo(Date.now()/1e3+60,this.zone),o=Wo(Date.now()/1e3+31622400-3600,this.zone);return l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${m.assignTitle(t.name)}>
        <form @submit=${this.onSubmit}>
          <div class="field">
            <label for="theme">${m.theme}</label>
            <select id="theme" @change=${s=>this.theme=s.target.value}>
              ${this.themeOptions(this.theme)}
            </select>
          </div>
          <fieldset>
            <legend>${m.mode}</legend>
            ${["auto","dark","light"].map(s=>l`<label class="choice">
                <input type="radio" name="mode" .checked=${this.mode===s} @change=${()=>this.mode=s} />
                ${s==="auto"?m.modeAuto:s==="dark"?m.modeDark:m.modeLight}
              </label>`)}
          </fieldset>
          ${this.startsNow?l`<p class="muted" id="starts-now" role="note">${m.startsNow}</p>`:u}
          <fieldset>
            <legend>${m.duration}</legend>
            <label class="choice">
              <input type="radio" name="until" .checked=${!this.limited} @change=${()=>this.limited=!1} />
              ${m.untilNone}
            </label>
            <label class="choice">
              <input type="radio" name="until" .checked=${this.limited} @change=${()=>this.limited=!0} />
              ${m.untilDate}
            </label>
            ${this.limited?l`<label class="sr" for="until">${m.untilInput}</label>
                  <input
                    id="until"
                    type="datetime-local"
                    min=${r}
                    max=${o}
                    .value=${this.until}
                    @input=${s=>this.until=s.target.value}
                  />`:u}
          </fieldset>
          ${this.renderError()}${this.renderActions(m.assign)}
        </form>
      </hats-lite-dialog-shell>
    `}},Xo=class extends ne{constructor(){super(...arguments);this.month=1;this.day=1;this.theme=m.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(r){if(!Qn(this.month,this.day)){this.error=m.problemDate;return}this.run(async()=>(await Vc(this.hass,r.id,{month:this.month,day:this.day,theme:this.theme,...this.dark===void 0?{}:{dark:this.dark}}),{message:m.birthdaySaved}),r.name)}};this.onClear=()=>{let t=this.person;t&&this.run(async()=>(await Wc(this.hass,t.id),{message:m.birthdayCleared}),t.name)}}static{this.properties={...ne.properties,person:{attribute:!1},month:{state:!0},day:{state:!0}}}willUpdate(t){let r=this.person?.birthday;t.has("person")&&r&&(this.month=r.month,this.day=r.day,this.theme=r.theme,this.dark=r.dark)}render(){let t=this.person;return t?l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${m.birthdayTitle(t.name)}>
        <form @submit=${this.onSubmit}>
          <div class="row">
            <div class="field">
              <label for="month">${m.month}</label>
              <select id="month" @change=${r=>this.month=Number(r.target.value)}>
                ${m.months.map((r,o)=>l`<option value=${o+1} ?selected=${this.month===o+1}>${r}</option>`)}
              </select>
            </div>
            <div class="field">
              <label for="day">${m.day}</label>
              <input
                id="day"
                type="number"
                min="1"
                max=${lt[this.month-1]}
                .value=${String(this.day)}
                @input=${r=>this.day=Number(r.target.value)}
              />
            </div>
          </div>
          <div class="field">
            <label for="theme">${m.theme}</label>
            <select id="theme" @change=${r=>this.theme=r.target.value}>
              ${this.themeOptions(this.theme)}
            </select>
          </div>
          ${this.renderError()}
          <div class="actions">
            <button class="btn" type="button" id="clear" ?disabled=${this.busy} @click=${this.onClear}>${m.clear}</button>
            <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${m.cancel}</button>
            <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy?m.saving:m.save}</button>
          </div>
        </form>
      </hats-lite-dialog-shell>
    `:u}},Yo=class extends ne{constructor(){super(...arguments);this.candidates=[];this.picked=new Set;this.onSubmit=t=>{t.preventDefault(),this.run(async()=>(await Xc(this.hass,[...this.picked]),{message:m.assignersSaved}))}}static{this.properties={...ne.properties,candidates:{attribute:!1},picked:{state:!0}}}willUpdate(t){t.has("candidates")&&(this.picked=new Set(this.candidates.filter(r=>r.is_assigner).map(r=>r.id)))}toggle(t,r){let o=new Set(this.picked);r?o.add(t):o.delete(t),this.picked=o}render(){let t=this.candidates.filter(r=>!r.is_admin);return l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${m.assignersTitle}>
        <form @submit=${this.onSubmit}>
          <p class="muted">${m.assignersHelp}</p>
          ${t.length===0?l`<p>${m.assignersEmpty}</p>`:l`<fieldset>
                <legend class="sr">${m.assignersTitle}</legend>
                ${t.map(r=>l`<label class="choice">
                    <input
                      type="checkbox"
                      .checked=${this.picked.has(r.id)}
                      @change=${o=>this.toggle(r.id,o.target.checked)}
                    />
                    ${r.name}
                  </label>`)}
              </fieldset>`}
          ${this.renderError()}${this.renderActions(m.save)}
        </form>
      </hats-lite-dialog-shell>
    `}},Nb=[["hats-lite-dialog-shell",qo],["hats-lite-assign-dialog",Go],["hats-lite-birthday-dialog",Xo],["hats-lite-assigners-dialog",Yo]];for(let[e,n]of Nb)customElements.get(e)||customElements.define(e,n);function zt(e){return Object.keys(e?.themes?.themes??{}).sort()}function nu(e){return e?.config?.time_zone||void 0}var Zo=[{key:"new-year",name:"New Year",month_start:12,day_start:30,month_end:1,day_end:2},{key:"valentines",name:"Valentine's Day",month_start:2,day_start:13,month_end:2,day_end:14},{key:"st-patricks",name:"St. Patrick's Day",month_start:3,day_start:16,month_end:3,day_end:17},{key:"earth-day",name:"Earth Day",month_start:4,day_start:22,month_end:4,day_end:22},{key:"halloween",name:"Halloween",month_start:10,day_start:24,month_end:10,day_end:31},{key:"christmas",name:"Christmas",month_start:12,day_start:20,month_end:12,day_end:26}];function ru(e,n){if(!n.includes(e))return e;let t=2;for(;n.includes(`${e}-${t}`);)t+=1;return`${e}-${t}`}var Bb={name:m.problemName,date:m.problemDate,theme:m.problemTheme};function Kt(e){let n=`${m.months[e.month_start-1]} ${e.day_start}`,t=`${m.months[e.month_end-1]} ${e.day_end}`;return n===t?n:`${n} - ${t}`}var Jo=class extends M{constructor(){super(...arguments);this.item=null;this.kind="holiday";this.themes=[];this.taken=[];this.zone=void 0;this.busy=!1;this.draft=this.blank();this.yearly=!0;this.problem=null;this.presetKey="";this.onPreset=t=>{this.presetKey=t.target.value;let r=Zo.find(i=>i.key===this.presetKey);if(!r)return;let{key:o,...s}=r;this.patch(s)};this.onSubmit=t=>{t.preventDefault();let r=Ko(this.draft);if(this.problem=r,r||this.busy)return;let o={...this.draft,name:this.draft.name.trim()};this.item||(o.id=ru(this.presetKey||this.kind,this.taken)),this.kind==="event"&&(o.kind="event",this.yearly?delete o.year:o.year=Zc(o,new Date,this.zone)),this.dispatchEvent(new CustomEvent("holiday-save",{detail:o,bubbles:!0,composed:!0}))};this.onCancel=()=>{this.dispatchEvent(new CustomEvent("holiday-cancel",{bubbles:!0,composed:!0}))}}static{this.properties={item:{attribute:!1},kind:{type:String},themes:{attribute:!1},taken:{attribute:!1},zone:{attribute:!1},busy:{type:Boolean},draft:{state:!0},yearly:{state:!0},problem:{state:!0}}}static{this.styles=jt}blank(){return{id:"",name:"",month_start:1,day_start:1,month_end:1,day_end:1,theme:m.defaultTheme,enabled:!0}}willUpdate(t){(t.has("item")||t.has("kind"))&&(this.draft=this.item?{...this.item}:this.blank(),this.yearly=this.item?.year===void 0,this.problem=null,this.presetKey="")}patch(t){this.draft={...this.draft,...t},this.problem=null}num(t){return r=>this.patch({[t]:Number(r.target.value)})}monthSelect(t,r){return l`<select aria-label=${r} @change=${this.num(t)}>
      ${m.months.map((o,s)=>l`<option value=${s+1} ?selected=${this.draft[t]===s+1}>${o}</option>`)}
    </select>`}dateRow(t,r,o){return l`<div class="field">
      <span>${t}</span>
      <div class="row">
        ${this.monthSelect(r,`${t} ${m.month}`)}
        <input type="number" min="1" max="31" aria-label=${`${t} ${m.day}`} .value=${String(this.draft[o])} @input=${this.num(o)} />
      </div>
    </div>`}themeOptions(){let t=this.draft.theme,r=[m.defaultTheme,...te(this.themes,t).filter(s=>s!==m.defaultTheme)],o=r.map(s=>l`<option value=${s} ?selected=${s===t}>${s}</option>`);return t&&!r.includes(t)&&o.push(l`<option value=${t} selected>${m.missingTheme(t)}</option>`),o}renderPreset(){return this.item||this.kind==="event"?u:l`<div class="field">
      <label for="preset">${m.holidayPreset}</label>
      <select id="preset" @change=${this.onPreset}>
        <option value="">${m.holidayPresetPick}</option>
        ${Zo.map(t=>l`<option value=${t.key}>${t.name} (${Kt(t)})</option>`)}
      </select>
    </div>`}heading(){return this.item?m.holidayEditTitle(this.item.name):this.kind==="event"?m.eventNewTitle:m.holidayNewTitle}render(){let t=this.kind==="event";return l`
      <form @submit=${this.onSubmit}>
        <h3 class="form-title">${this.heading()}</h3>
        ${this.renderPreset()}
        <div class="field">
          <label for="f-name">${t?m.eventName:m.holidayName}</label>
          <input
            id="f-name"
            type="text"
            maxlength=${60}
            placeholder=${t?m.eventNamePlaceholder:""}
            .value=${this.draft.name}
            @input=${r=>this.patch({name:r.target.value})}
          />
        </div>
        <div class="row">
          ${this.dateRow(m.holidayStart,"month_start","day_start")}${this.dateRow(m.holidayEnd,"month_end","day_end")}
        </div>
        <div class="field">
          <label for="f-theme">${m.theme}</label>
          <select id="f-theme" @change=${r=>this.patch({theme:r.target.value})}>
            ${this.themeOptions()}
          </select>
        </div>
        ${t?l`<label class="choice">
              <input id="f-yearly" type="checkbox" .checked=${this.yearly} @change=${r=>this.yearly=r.target.checked} />
              ${m.eventYearly}
            </label>`:u}
        <label class="choice">
          <input type="checkbox" .checked=${this.draft.enabled!==!1} @change=${r=>this.patch({enabled:r.target.checked})} />
          ${m.holidayEnabled}
        </label>
        ${this.problem?l`<p class="error" role="alert">${Bb[this.problem]}</p>`:u}
        <div class="actions">
          <button class="btn cancel" type="button" ?disabled=${this.busy} @click=${this.onCancel}>${m.cancel}</button>
          <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy?m.saving:m.save}</button>
        </div>
      </form>
    `}};customElements.get("hats-lite-holiday-form")||customElements.define("hats-lite-holiday-form",Jo);function Ub(e){return e.kind==="event"?m.eventKind:m.holidayKind}function jb(e,n){return l`<li class="holiday-row">
    <div class="holiday-main">
      <strong>${e.name}</strong>
      <span class="chip">${Ub(e)}</span>
      ${e.enabled===!1?l`<span class="chip">${m.holidayOff}</span>`:u}
      <div class="muted">${Kt(e)}</div>
      <div class="muted">${m.theme}: ${e.theme}</div>
    </div>
    <div class="holiday-actions">
      <button class="btn edit" type="button" aria-label=${`${m.holidayEdit} ${e.name}`} ?disabled=${n.busy} @click=${()=>n.onEdit(e)}>
        ${m.holidayEdit}
      </button>
      <button class="btn remove" type="button" aria-label=${`${m.holidayRemove} ${e.name}`} ?disabled=${n.busy} @click=${()=>n.onRemove(e)}>
        ${m.holidayRemove}
      </button>
    </div>
  </li>`}function ou(e,n){return e.length===0?l`<p class="muted">${m.holidaysEmpty}</p>`:l`<ul class="holiday-list" aria-label=${m.holidayListLabel}>${e.map(t=>jb(t,n))}</ul>`}var es=Kt;function ts(e,n=new Date){let t=Array.from({length:12},(r,o)=>{let s=n.getMonth()+o;return{month:s%12+1,year:n.getFullYear()+Math.floor(s/12)}});return l`
    <ol class="timeline" aria-label=${m.timeline}>
      ${t.map(({month:r,year:o})=>{let s=lt[r-1],i=e.filter(a=>Vo(a,r,o).length>0);return l`<li class="month">
          <span>${m.months[r-1]}</span>
          <div class="track">
            ${i.flatMap(a=>Vo(a,r,o).map(d=>l`<i
                  class="bar"
                  style=${se({left:`${(d.from-1)/s*100}%`,width:`${(d.to-d.from+1)/s*100}%`})}
                ></i>`))}
          </div>
          ${i.map(a=>l`<span class="sr">${m.timelineHoliday(a.name,es(a))}</span>`)}
        </li>`})}
    </ol>
  `}var Qo=class extends ne{constructor(){super(...arguments);this.loaded=!0;this.holidays=[];this.items=[];this.view={kind:"list"};this.onSave=t=>{let r=t.detail,o=this.items.some(s=>s.id===r.id);this.persist(o?this.items.map(s=>s.id===r.id?r:s):[...this.items,r])};this.backToList=()=>{this.error="",this.view={kind:"list"}}}static{this.properties={...ne.properties,loaded:{type:Boolean},holidays:{attribute:!1},items:{state:!0},view:{state:!0}}}willUpdate(t){t.has("holidays")&&(this.items=this.holidays.map(r=>({...r})))}persist(t){this.loaded&&this.run(async()=>{let r=await Gc(this.hass,t);this.items=r,this.view={kind:"list"},this.dispatchEvent(new CustomEvent("holidays-changed",{detail:r,bubbles:!0,composed:!0}))})}open(t,r){this.error="",this.view={kind:"form",entry:t,item:r}}renderList(){return l`
      <div class="row">
        <button class="btn" type="button" id="add-holiday" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("holiday",null)}>${m.holidayAdd}</button>
        <button class="btn" type="button" id="add-event" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("event",null)}>${m.eventAdd}</button>
      </div>
      ${ts(this.items)}
      ${ou(this.items,{busy:this.busy||!this.loaded,onEdit:t=>this.open(t.kind==="event"?"event":"holiday",t),onRemove:t=>this.persist(this.items.filter(r=>r.id!==t.id))})}
      ${this.renderError()}
      <div class="actions"><button class="btn primary" type="button" @click=${()=>this.close()}>${m.close}</button></div>
    `}renderForm(t){return l`
      <hats-lite-holiday-form
        .item=${t.item}
        .kind=${t.entry}
        .themes=${this.themes}
        .zone=${nu(this.hass)}
        .taken=${this.items.map(r=>r.id)}
        .busy=${this.busy}
        @holiday-save=${this.onSave}
        @holiday-cancel=${this.backToList}
      ></hats-lite-holiday-form>
      ${this.renderError()}
    `}render(){return l`
      <hats-lite-dialog-shell .heading=${m.holidayEditorTitle}>
        ${this.view.kind==="form"?this.renderForm(this.view):this.renderList()}
      </hats-lite-dialog-shell>
    `}};customElements.get("hats-lite-holidays-dialog")||customElements.define("hats-lite-holidays-dialog",Qo);var zb=["override","birthday","holiday"],iu=/^(\d{4})-(\d{2})-(\d{2})$/,Kb=/^([01][0-9]|2[0-3]):[0-5][0-9]$/,Vb=/^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$/,au=/^(\d{4})-(\d{2})$/;function me(e,n=2){return String(e).padStart(n,"0")}function ns(e,n,t){return`${me(e,4)}-${me(n)}-${me(t)}`}function Be(e){return e.slice(0,7)}function Me(e){let n=iu.exec(e);return n?[Number(n[1]),Number(n[2]),Number(n[3])]:null}function tr(e){let n=au.exec(e);return n?[Number(n[1]),Number(n[2])]:null}function nr(e){let[n,t]=tr(e)??[1970,1];return new Date(Date.UTC(n,t,0)).getUTCDate()}function rs(e,n){let[t,r]=tr(e)??[1970,1],o=t*12+(r-1)+n;return`${me(Math.floor(o/12),4)}-${me(o%12+1)}`}function ct(e,n){let[t,r,o]=Me(e)??[1970,1,1],s=new Date(Date.UTC(t,r-1,o+n));return ns(s.getUTCFullYear(),s.getUTCMonth()+1,s.getUTCDate())}function lu(e){let[n,t,r]=Me(e)??[1970,1,1];return new Date(Date.UTC(n,t-1,r)).getUTCDay()}function er(e,n){let[,,t]=Me(e)??[1970,1,1],r=rs(Be(e),n);return`${r}-${me(Math.min(t,nr(r)))}`}var Wb={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};function os(e){let n=e?.locale,t=Wb[n?.first_weekday??""];if(t!==void 0)return t;if(!n?.language)return 1;try{let r=new Intl.Locale(n.language).getWeekInfo?.();if(r&&r.firstDay>=1&&r.firstDay<=7)return r.firstDay%7}catch{return 1}return 1}function du(e,n=new Date){let t=e?.config?.time_zone;try{let r=new Intl.DateTimeFormat("en-US",{timeZone:t||void 0,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(n),o=s=>Number(r.find(i=>i.type===s)?.value);return ns(o("year"),o("month"),o("day"))}catch{return ns(n.getFullYear(),n.getMonth()+1,n.getDate())}}function ss(e){let[n]=Me(e)??[1970];return{min:`${me(n-1,4)}-01`,max:`${me(n+2,4)}-12`}}function cu(e,n){return(lu(`${e}-01`)-n+7)%7}function su(e,n){let t=(lu(e)-n+7)%7;return{first:ct(e,-t),last:ct(e,6-t)}}function uu(e,n,t){switch(n){case"ArrowLeft":return ct(e,-1);case"ArrowRight":return ct(e,1);case"ArrowUp":return ct(e,-7);case"ArrowDown":return ct(e,7);case"Home":return su(e,t).first;case"End":return su(e,t).last;case"PageUp":return er(e,-1);case"PageDown":return er(e,1);default:return null}}function qb(e){let n=e;if(!n||typeof n!="object"||!zb.includes(n.kind)||typeof n.theme!="string")return null;let t={...n,kind:n.kind,source:String(n.source??n.kind),theme:n.theme};return delete t.partial,delete t.active_from,delete t.active_until,n.partial===!0&&Kb.test(String(n.active_from))&&Vb.test(String(n.active_until))&&(t.partial=!0,t.active_from=n.active_from,t.active_until=n.active_until),t}function Gb(e){let n=e;if(!n||typeof n.date!="string"||!iu.test(n.date)||!Array.isArray(n.items))return null;let t=n.winner,r=t?.selection?.theme;return{date:n.date,winner:t&&typeof r=="string"?t:null,items:n.items.map(qb).filter(o=>o!==null),conflict:n.conflict===!0}}function Xb(e){let n=e;if(!n||typeof n.month!="string"||!au.test(n.month)||!Array.isArray(n.days)||n.days.length!==nr(n.month))return null;let t=n.days.map(Gb);return t.some((r,o)=>r===null||r.date!==`${n.month}-${me(o+1)}`)?null:{month:n.month,user:String(n.user??""),time_zone:String(n.time_zone??""),opt_out:n.opt_out===!0,trial:n.trial===!0,days:t}}async function pu(e,n,t){let r={type:"hats_lite/calendar",month:n};t&&(r.user=t);let o=Xb(await P(e,r));if(!o||o.month!==n)throw{code:"unknown"};return o}function hu(e,n=new Date){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:e||void 0,hourCycle:"h23",hour:"numeric",minute:"numeric",second:"numeric"}).formatToParts(n),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("hour"),r("minute"),r("second")]}catch{return[n.getHours(),n.getMinutes(),n.getSeconds()]}}var k={viewLabel:"People view",list:"List",calendar:"Calendar",loading:"Loading the calendar...",loadFailed:"Could not load the calendar.",retry:"Try again",prev:"Previous month",next:"Next month",today:"Today",person:"Person",grid:e=>`Calendar for ${e}`,optedOut:"This person opted out of assigned themes, so nothing here is applied.",none:"No scheduled theme",detailTitle:"Selected day",noSelection:"Pick a day to see what applies.",effective:"Theme that applies",noEffective:"None, the person's own theme is used.",setBy:e=>`Set by ${e}`,setByAdmin:"an administrator",itemsHeading:"Everything on this day",wins:"Applies",loses:"Not applied",until:e=>`until ${e}`,untilRemoved:"until removed",conflict:"Conflict",conflictNote:"More than one item wants a different theme on this day.",preview:"Preview this day",previewMissing:"This theme is not installed, so it cannot be previewed.",assignNow:e=>`Assign now, until the end of ${e}`,assignLate:"There is less than two minutes left today. Pick another day to assign a theme.",trial:"A try is running; the schedule applies again when it ends",partialOnly:"Only part of the day has an assigned theme",appliesFrom:e=>`applies from ${e}`,untilTime:e=>`until ${e}`,partial:"Part of the day",editHolidays:"Edit holidays",kinds:{override:"Assignment",birthday:"Birthday",holiday:"Holiday"},itemName:e=>e.kind==="holiday"?e.name?`Holiday ${e.name}`:"Holiday":e.kind==="birthday"?"Birthday":e.assigned_by_name?`Assignment by ${e.assigned_by_name}`:"Assignment",cellLabel:(e,n)=>`${e}. ${n}`,winnerSummary:(e,n)=>`Theme ${e} from ${n}`,conflictSummary:(e,n,t)=>`Conflict: theme ${e} from ${n} wins over ${t}`,errors:{unauthorized:"You are not allowed to see that calendar.",invalid_user:"That user is no longer available.",invalid_request:"That month is outside the range the calendar can show.",not_loaded:"The server is still starting. Try again in a moment.",unknown:"Something went wrong. Try again."}};function mu(e){return k.errors[e]??k.loadFailed}function rr(e,n){let t=Me(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{dateStyle:"full",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,t[2])))}catch{return e}}function is(e,n){let t=tr(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,1)))}catch{return e}}function fu(e,n){let t=(r,o)=>{try{return new Intl.DateTimeFormat(n,{weekday:r,timeZone:"UTC"}).format(new Date(Date.UTC(2024,0,7+o)))}catch{return String(o)}};return Array.from({length:7},(r,o)=>{let s=(e+o)%7;return{short:t("short",s),long:t("long",s)}})}function gu(e){return e?["override","birthday","holiday"].filter(n=>e.items.some(t=>t.kind===n)):[]}function bu(e){return e.items.find(n=>n.wins===!0&&n.partial!==!0)}function Yb(e){return e.items.filter(n=>n!==bu(e)).map(n=>`${k.itemName(n)} (${n.theme})`).join(", ")}function yu(e,n){if(!e||e.items.length===0)return k.none;if(n)return k.optedOut;if(!e.winner)return k.partialOnly;let t=bu(e),r=t?k.itemName(t):e.winner.source,o=e.winner.selection.theme;return e.conflict?k.conflictSummary(o,r,Yb(e)):k.winnerSummary(o,r)}function Zb(e,n,t){try{return e.toLocaleString(n,t?{timeZone:t}:void 0)}catch{return e.toLocaleString(n)}}function as(e,n,t){return e.kind!=="override"?"":e.until===null||e.until===void 0?k.untilRemoved:k.until(Zb(new Date(e.until*1e3),n,t))}function ls(e){if(e.partial!==!0||!e.active_from||!e.active_until||e.active_from===e.active_until)return"";let n=e.active_from==="00:00"?"":k.appliesFrom(e.active_from),t=e.active_until==="24:00"?"":k.untilTime(e.active_until);return[n,t].filter(Boolean).join(" ")}function Jb(e){let n=e.day?.winner;if(!n||e.optOut)return l`<p class="muted" id="effective">${k.noEffective}</p>`;let t=e.day?.items.find(i=>i.wins===!0&&i.partial!==!0),r=n.selection.theme,o=n.selection.dark??e.darkMode,s=e.installed.includes(r);return l`
    <p id="effective"><strong>${r}</strong>${t?l` - ${k.itemName(t)}`:u}</p>
    ${t?.kind==="override"?l`<p class="muted">${k.setBy(t.assigned_by_name??k.setByAdmin)}</p>`:u}
    <div class="tools">
      <button class="btn" type="button" id="preview-day" ?disabled=${!s} @click=${()=>e.onPreview(r,o)}>${k.preview}</button>
    </div>
    ${s?u:l`<p class="muted">${k.previewMissing}</p>`}
  `}function Qb(e){let n=e.day?.items??[];return n.length===0?u:l`
    <h4>${k.itemsHeading}</h4>
    ${e.day?.conflict?l`<p class="notice" id="conflict-note" role="status">${k.conflictNote}</p>`:u}
    <ul class="items">
      ${n.map(t=>l`<li class=${t.wins&&!t.partial?"won":"lost"} data-wins=${t.wins&&!t.partial?"true":"false"}>
          <span class="name">${k.itemName(t)}</span> - ${t.theme}
          <span class="chip ${t.wins?"ok":"warn"}">${t.partial?k.partial:t.wins?k.wins:k.loses}</span>
          ${ls(t)?l`<div class="muted">${ls(t)}</div>`:u}
          ${as(t,e.locale,e.zone)?l`<div class="muted">${as(t,e.locale,e.zone)}</div>`:u}
        </li>`)}
    </ul>
  `}function vu(e){return e.key?l`
    <h3 id="detail-title">${e.title}</h3>
    <h4>${k.effective}</h4>
    ${Jb(e)} ${Qb(e)}
    <div class="tools">
      ${e.canAssign?l`<button class="btn" type="button" id="assign-until" ?disabled=${e.assignLate} @click=${e.onAssign}>${e.assignLabel}</button>`:u}
      ${e.canHolidays?l`<button class="btn" type="button" id="edit-holidays-cal" @click=${e.onHolidays}>${k.editHolidays}</button>`:u}
    </div>
    ${e.canAssign&&e.assignLate?l`<p class="muted" id="assign-hint">${k.assignLate}</p>`:u}
  `:l`<h3>${k.detailTitle}</h3><p class="muted">${k.noSelection}</p>`}var wu=[K,V,T`
  :host {
    display: block;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .bar .grow {
    flex: 1 1 auto;
  }
  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: var(--hl-gap);
  }
  .card {
    min-width: 0;
    padding: 16px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  .muted {
    color: var(--hl-muted);
  }
  .notice {
    padding: 8px 12px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-line);
  }
  .notice.error {
    color: var(--hl-warn-text);
    border-color: var(--hl-warn);
  }
  .grid {
    display: grid;
    gap: 4px;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
  }
  .head {
    color: var(--hl-muted);
    font-size: 12px;
    text-align: center;
  }
  .cell {
    min-width: 0;
    min-height: 56px;
  }
  .day {
    appearance: none;
    width: 100%;
    height: 100%;
    min-height: 56px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    padding: 6px;
    font: inherit;
    color: var(--hl-text);
    background: var(--hl-surface-raised);
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-sm);
    cursor: pointer;
  }
  .day:focus-visible {
    outline: 3px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .day[aria-selected="true"] {
    border-color: var(--hl-focus);
    box-shadow: inset 0 0 0 1px var(--hl-focus);
  }
  .day.today .num {
    font-weight: 700;
    text-decoration: underline;
  }
  .marks {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-height: 12px;
  }
  .dot {
    width: 9px;
    height: 9px;
    background: var(--hl-accent);
  }
  .dot.override {
    border-radius: 50%;
  }
  .dot.birthday {
    background: var(--hl-warn);
    transform: rotate(45deg);
  }
  .dot.holiday {
    background: var(--hl-ok);
    border-radius: 2px;
  }
  .conflict {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    border-radius: var(--hl-radius-pill);
    background: var(--hl-warn);
    color: var(--hl-accent-ink);
    font-size: 10px;
    font-weight: 700;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
    color: var(--hl-muted);
    font-size: 12px;
  }
  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .items {
    margin: 8px 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
  }
  .items li {
    padding: 8px 10px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-line);
  }
  .items li.lost {
    opacity: 0.75;
    border-style: dashed;
  }
  .items .name {
    font-weight: 600;
  }
  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  select {
    min-height: 32px;
    font: inherit;
    color: var(--hl-text);
    background: var(--hl-surface);
    border: 1px solid var(--hl-edge);
    border-radius: var(--hl-radius-sm);
    padding: 4px 8px;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  @media (max-width: 699px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .cell,
    .day {
      min-height: 48px;
    }
    .card {
      padding: 10px;
    }
  }
`];var ds=class extends M{constructor(){super(...arguments);this.people=[];this.view="list";this.status="idle";this.failure="";this.month="";this.data=null;this.selected="";this.focusKey="";this.userId="";this.token=0;this.stale=!1;this.onKey=t=>{let r=this.focusKey;if(t.key==="Enter"||t.key===" "){t.preventDefault(),this.selected=r;return}let o=uu(r,t.key,os(this.hass));o!==null&&(t.preventDefault(),Be(o)===this.month?(this.focusKey=o,this.updateComplete.then(()=>this.cellOf(o)?.focus())):this.goTo(Be(o),o))};this.onPerson=t=>{this.userId=t.target.value,this.selected="",this.data=null,this.load()}}static{this.properties={hass:{attribute:!1},people:{attribute:!1},view:{state:!0},status:{state:!0},failure:{state:!0},month:{state:!0},data:{state:!0},selected:{state:!0},focusKey:{state:!0},userId:{state:!0}}}static{this.styles=wu}get language(){return this.hass?.locale?.language}get zone(){return this.hass?.config?.time_zone||void 0}minutesLeft(){let[t,r,o]=hu(this.zone);return 1440-(t*60+r+o/60)}get today(){return du(this.hass)}willUpdate(t){t.has("hass")&&this.hass&&this.month===""?(this.userId=this.hass.user?.id??"",this.month=Be(this.today),this.focusKey=this.today):t.has("people")&&t.get("people")!==void 0&&this.status!=="idle"&&(this.view==="calendar"?this.load():this.stale=!0)}async load(){let t=this.hass;if(!t)return;let r=++this.token,o=this.month;this.stale=!1,this.status="loading";try{let s=await pu(t,o,this.userId||void 0);if(r!==this.token)return;this.data=s,this.failure="",this.status="ready"}catch(s){if(r!==this.token)return;let i=q(s);this.data=null,this.failure=mu(i),this.status=i==="unknown_command"?"unsupported":"error",this.status==="unsupported"&&this.setView("list")}}setView(t){t!==this.view&&(this.view=t,this.dispatchEvent(new CustomEvent("schedule-view",{detail:{view:t},bubbles:!0,composed:!0})),t==="calendar"&&(this.status==="idle"||this.stale)&&this.load())}async goTo(t,r){let o=ss(this.today);t<o.min||t>o.max||(this.month=t,this.focusKey=r,Be(this.selected)!==t&&(this.selected=""),this.data=null,await this.load(),await this.updateComplete,this.cellOf(r)?.focus())}cellOf(t){return this.renderRoot.querySelector(`[data-day="${t}"]`)}onPick(t){this.selected=t,this.focusKey=t}dayOf(t){return this.data?.days.find(r=>r.date===t)}canAssign(){let t=this.hass?.user,r=this.people.find(o=>o.id===this.userId);return r?r.id===t?.id?!0:t?.is_admin===!0||!r.is_admin&&this.people.some(o=>o.id!==t?.id):!1}detailModel(){let t=this.selected,r=this.dayOf(t),o=zt(this.hass),s=t>=this.today,i=this.zone;return{key:t,day:r,title:rr(t,this.language),optOut:this.data?.opt_out===!0,installed:o,locale:this.language,zone:i,assignLabel:k.assignNow(rr(t,this.language)),assignLate:t===this.today&&this.minutesLeft()<2,canAssign:s&&this.canAssign(),canHolidays:this.hass?.user?.is_admin===!0,darkMode:this.hass?.themes?.darkMode,onPreview:(a,d)=>this.dispatchEvent(new CustomEvent("hats-lite-preview-theme",{detail:{theme:a,dark:d},bubbles:!0,composed:!0})),onAssign:()=>{let a=r?.winner?.selection,d={userId:this.userId,until:`${t}T23:59`};a?.theme&&(d.theme=a.theme),a?.dark!==void 0&&(d.dark=a.dark),this.dispatchEvent(new CustomEvent("schedule-assign",{detail:d,bubbles:!0,composed:!0}))},onHolidays:()=>this.dispatchEvent(new CustomEvent("schedule-holidays",{bubbles:!0,composed:!0}))}}renderSwitch(){return l`
      <div class="seg" role="group" aria-label=${k.viewLabel}>
        <button type="button" id="view-list" aria-pressed=${this.view==="list"?"true":"false"} @click=${()=>this.setView("list")}>${k.list}</button>
        <button type="button" id="view-calendar" aria-pressed=${this.view==="calendar"?"true":"false"} @click=${()=>this.setView("calendar")}>${k.calendar}</button>
      </div>
    `}renderCell(t,r){let o=this.dayOf(t),s=Me(t)?.[2]??0,i=gu(o),a=yu(o,this.data?.opt_out===!0);return l`<div class="cell" role="gridcell" aria-selected=${this.selected===t?"true":"false"}>
      <button
        type="button"
        class="day ${t===r?"today":""}"
        data-day=${t}
        tabindex=${this.focusKey===t?"0":"-1"}
        aria-current=${t===r?"date":u}
        aria-label=${k.cellLabel(rr(t,this.language),a)}
        @click=${()=>this.onPick(t)}
      >
        <span class="num" aria-hidden="true">${s}</span>
        <span class="marks" aria-hidden="true">
          ${i.map(d=>l`<i class="dot ${d}" data-kind=${d}></i>`)}
          ${o?.conflict?l`<span class="conflict" data-conflict="true">!</span>`:u}
        </span>
      </button>
    </div>`}renderGrid(){let t=os(this.hass),r=this.today,o=cu(this.month,t),s=nr(this.month),i=[...Array.from({length:o},()=>null),...Array.from({length:s},(d,c)=>`${this.month}-${String(c+1).padStart(2,"0")}`)];for(;i.length%7!==0;)i.push(null);let a=Array.from({length:i.length/7},(d,c)=>i.slice(c*7,c*7+7));return l`<div class="grid" role="grid" aria-label=${k.grid(is(this.month,this.language))} @keydown=${this.onKey}>
      <div class="row" role="row">
        ${fu(t,this.language).map(d=>l`<div class="head" role="columnheader" aria-label=${d.long}>${d.short}</div>`)}
      </div>
      ${a.map(d=>l`<div class="row" role="row">
          ${d.map(c=>c===null?l`<div class="cell" role="gridcell" aria-hidden="true"></div>`:this.renderCell(c,r))}
        </div>`)}
    </div>`}renderNav(){let t=ss(this.today),r=o=>{this.goTo(rs(this.month,o),er(this.focusKey||`${this.month}-01`,o))};return l`<div class="bar">
      <button class="btn" type="button" id="prev" aria-label=${k.prev} ?disabled=${this.month<=t.min} @click=${()=>r(-1)}>&lsaquo;</button>
      <h3 class="title grow" id="month-title" aria-live="polite">${is(this.month,this.language)}</h3>
      <button class="btn" type="button" id="today" @click=${()=>{this.goTo(Be(this.today),this.today)}}>${k.today}</button>
      <button class="btn" type="button" id="next" aria-label=${k.next} ?disabled=${this.month>=t.max} @click=${()=>r(1)}>&rsaquo;</button>
      ${this.people.length>1?l`<label class="muted" for="person">${k.person}</label>
            <select id="person" @change=${this.onPerson}>
              ${this.people.map(o=>l`<option value=${o.id} ?selected=${o.id===this.userId}>${o.name}</option>`)}
            </select>`:u}
    </div>`}renderCalendar(){return this.status==="error"?l`${this.renderNav()}
        <p class="notice error" role="alert">${this.failure||k.loadFailed}</p>
        <button class="btn" type="button" id="retry-calendar" @click=${()=>{this.load()}}>${k.retry}</button>`:this.data===null?l`${this.renderNav()}<p class="muted" role="status">${k.loading}</p>`:l`
      ${this.renderNav()}
      ${this.data?.trial?l`<p class="notice" id="trial-note" role="status">${k.trial}</p>`:u}
      ${this.data?.opt_out?l`<p class="notice" role="status">${k.optedOut}</p>`:u}
      ${this.status==="loading"?l`<p class="muted" role="status">${k.loading}</p>`:u}
      <div class="layout">
        <section class="card">
          ${this.renderGrid()}
          <ul class="legend">
            <li><i class="dot override"></i>${k.kinds.override}</li>
            <li><i class="dot birthday"></i>${k.kinds.birthday}</li>
            <li><i class="dot holiday"></i>${k.kinds.holiday}</li>
            <li><span class="conflict">!</span>${k.conflict}</li>
          </ul>
        </section>
        <section class="card" aria-live="polite">${vu(this.detailModel())}</section>
      </div>
    `}render(){return!this.hass||this.status==="unsupported"?u:l`<div class="bar">${this.renderSwitch()}</div>
      ${this.view==="calendar"?this.renderCalendar():u}`}};customElements.get("hats-lite-schedule")||customElements.define("hats-lite-schedule",ds);var cs=class extends M{constructor(){super(...arguments);this.people=[];this.holidays=[];this.status="idle";this.message="";this.failure="";this.dialog=null;this.holidaysLoaded=!1;this.holidaysFailure="";this.removing=new Set;this.calendarView=!1;this.opener=null;this.onClose=()=>{this.dialog=null;let t=this.opener;this.updateComplete.then(()=>t?.focus?.())};this.onScheduleAssign=t=>{let{userId:r,until:o,theme:s,dark:i}=t.detail,a=this.people.find(d=>d.id===r);a&&this.open({kind:"assign",person:a,until:o,theme:s,dark:i})};this.onHolidaysChanged=t=>{this.holidays=t.detail,this.message=m.holidaysSaved,Yn()};this.onDone=t=>{let r=t.detail;this.dialog=null,this.message=r.message,this.failure="",r.selfApply&&(this.dispatchEvent(new CustomEvent("settheme",{detail:r.selfApply,bubbles:!0,composed:!0})),Yn()),this.load();let o=this.opener;this.updateComplete.then(()=>o?.focus?.())}}static{this.properties={hass:{attribute:!1},people:{state:!0},holidays:{state:!0},status:{state:!0},message:{state:!0},failure:{state:!0},dialog:{state:!0},holidaysLoaded:{state:!0},holidaysFailure:{state:!0},removing:{state:!0},calendarView:{state:!0}}}static{this.styles=tu}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load()}async load(){let t=this.hass;if(t){this.status!=="ready"&&(this.status="loading");try{this.people=await zo(t),this.status="ready"}catch(r){this.failure=dt(q(r)),this.status="error";return}await this.loadHolidays()}}async loadHolidays(){let t=this.hass;if(t)try{this.holidays=await qc(t),this.holidaysLoaded=!0,this.holidaysFailure=""}catch(r){this.holidaysLoaded=!1,this.holidaysFailure=dt(q(r))}}get selfId(){return this.hass?.user?.id}get isAdmin(){return this.hass?.user?.is_admin===!0}get canAssign(){return this.isAdmin||this.people.some(t=>t.id!==this.selfId)}themeNames(){return zt(this.hass)}open(t){this.opener=this.shadowRoot?.activeElement,this.dialog=t}async act(t,r,o,s=!1){this.message="",this.failure="";try{await t(),this.message=r,s&&Yn()}catch(i){this.failure=dt(q(i),o)}await this.load()}optOut(t,r){let o=this.hass;o&&this.act(()=>Kc(o,r),r?m.optOutOn:m.optOutOff,t.name,!0)}mayUnassign(t){let r=t.active_override;if(!r)return!1;if(this.isAdmin||t.id===this.selfId)return!0;let o=this.selfId;return o!==void 0&&r.assigned_by===o}removeOverride(t,r){let o=this.hass;!o||this.removing.has(t)||(this.removing=new Set(this.removing).add(t),this.act(()=>zc(o,t),m.unassigned,r).finally(()=>{let s=new Set(this.removing);s.delete(t),this.removing=s}))}renderOverride(t){let r=t.active_override;if(!r)return l`<span class="muted">${m.noOverride}</span>`;let o=r.ends===null?m.noEnd:m.until(new Date(r.ends*1e3).toLocaleString());return l`<span class="override">${m.overrideLine(r.theme)} ${o}. ${m.setBy(r.assigned_by_name)}</span>`}renderPerson(t){let r=t.id===this.selfId,o=this.hass,s=r||this.isAdmin,i=this.canAssign&&(this.isAdmin||!t.is_admin);return l`
      <li class="person">
        <div class="head">
          <span class="name">${t.name}</span>
          ${r?l`<span class="chip">${m.you}</span>`:u}
          ${t.is_admin?l`<span class="chip">${m.admin}</span>`:u}
          ${!r&&t.opt_out?l`<span class="chip warn">${m.optedOutChip}</span>`:u}
        </div>
        <div>${this.renderOverride(t)}</div>
        <div class="tools">
          ${r?l`<button class="switch" type="button" role="switch" aria-checked=${t.opt_out?"true":"false"} @click=${()=>this.optOut(t,!t.opt_out)}>
                ${m.optOutLabel}
              </button>`:u}
          ${r&&t.active_override&&!t.opt_out?l`<button class="btn" type="button" id="opt-out-shortcut" @click=${()=>this.optOut(t,!0)}>${m.optOutShortcut}</button>`:u}
          ${i?l`<button class="btn" type="button" aria-label="${m.assign}: ${t.name}" @click=${()=>this.open({kind:"assign",person:t})}>${m.assign}</button>`:u}
          ${this.mayUnassign(t)&&o?l`<button
                class="btn"
                type="button"
                aria-label="${m.unassign}: ${t.name}"
                ?disabled=${this.removing.has(t.active_override.id)}
                @click=${()=>this.removeOverride(t.active_override.id,t.name)}
              >
                ${m.unassign}
              </button>`:u}
          ${s?l`<button class="btn" type="button" aria-label="${m.birthday}: ${t.name}" @click=${()=>this.open({kind:"birthday",person:t})}>${m.birthday}</button>`:u}
        </div>
      </li>
    `}renderHolidays(){return l`
      <section class="card" aria-labelledby="holidays-h">
        <h2 id="holidays-h">${m.holidays}</h2>
        <p class="muted">${m.holidaysIntro}</p>
        ${ts(this.holidays)}
        ${this.holidaysLoaded?this.holidays.length===0?l`<p class="muted">${m.holidaysEmpty}</p>`:l`<ul class="holidays">
              ${this.holidays.map(t=>l`<li>${m.holidayRowLabel(t.name,t.kind==="event"?m.eventKind:m.holidayKind)}: ${es(t)} (${t.theme})${t.enabled===!1?" - off":""}</li>`)}
            </ul>`:l`<p class="notice error" id="holidays-error" role="alert">
                ${this.holidaysFailure||m.holidaysLoadFailed}
              </p>
              <button class="btn" type="button" id="retry-holidays" @click=${()=>{this.loadHolidays()}}>${m.retry}</button>`}
        ${this.isAdmin?l`<div class="tools">
              <button class="btn" type="button" id="edit-holidays" ?disabled=${!this.holidaysLoaded} @click=${()=>this.open({kind:"holidays"})}>${m.editHolidays}</button>
              <button class="btn" type="button" id="edit-assigners" @click=${()=>this.open({kind:"assigners"})}>${m.assigners}</button>
            </div>`:u}
      </section>
    `}renderDialog(){let t=this.dialog;if(!t)return u;let r={hass:this.hass,themes:this.themeNames(),installed:zt(this.hass)};switch(t.kind){case"assign":return l`<hats-lite-assign-dialog
          .hass=${r.hass}
          .themes=${r.themes}
          .installed=${r.installed}
          .person=${t.person}
          .limited=${t.until!==void 0}
          .until=${t.until??""}
          .theme=${t.theme??m.defaultTheme}
          .mode=${t.dark===void 0?"auto":t.dark?"dark":"light"}
          .startsNow=${t.until!==void 0}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-assign-dialog>`;case"birthday":return l`<hats-lite-birthday-dialog
          .hass=${r.hass}
          .themes=${r.themes}
          .installed=${r.installed}
          .person=${t.person}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-birthday-dialog>`;case"holidays":return l`<hats-lite-holidays-dialog
          .hass=${r.hass}
          .themes=${r.themes}
          .installed=${r.installed}
          .holidays=${this.holidays}
          .loaded=${this.holidaysLoaded}
          @holidays-changed=${this.onHolidaysChanged}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-holidays-dialog>`;default:return l`<hats-lite-assigners-dialog
          .hass=${r.hass}
          .candidates=${this.people}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-assigners-dialog>`}}render(){return this.status==="idle"||this.status==="loading"?l`<p class="muted" role="status">${m.loading}</p>`:this.status==="error"?l`<p class="notice error" role="alert">${this.failure||m.loadFailed}</p>
        <button class="btn" type="button" @click=${()=>{this.load()}}>${m.retry}</button>`:l`
      <p class="muted">${m.intro}</p>
      ${this.failure?l`<p class="notice error" role="alert">${this.failure}</p>`:u}
      ${this.message?l`<p class="notice" role="status">${this.message}</p>`:u}
      <hats-lite-schedule
        .hass=${this.hass}
        .people=${this.people}
        @schedule-view=${t=>this.calendarView=t.detail.view==="calendar"}
        @schedule-assign=${this.onScheduleAssign}
        @schedule-holidays=${()=>this.open({kind:"holidays"})}
      ></hats-lite-schedule>
      <div class="layout" style=${this.calendarView?"display:none":""}>
        <section class="card" aria-labelledby="people-h">
          <h2 id="people-h">${m.title}</h2>
          <ul class="people">${this.people.map(t=>this.renderPerson(t))}</ul>
        </section>
        ${this.renderHolidays()}
      </div>
      ${this.renderDialog()}
    `}};customElements.get("hats-lite-people")||customElements.define("hats-lite-people",cs);var ps=["styling","cards","layout","templating","chrome"],ey=4096,hs="hats_lite/",ms=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,us=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function Ue(e){return typeof e=="string"?e:""}function ty(e){if(!e||typeof e!="object")return null;let n=e,t=Ue(n.full_name);if(!ms.test(t))return null;let r=ps.find(o=>o===n.kind)??"cards";return{category:n.category==="integration"?"integration":"plugin",kind:r,full_name:t,description:Ue(n.description),stars:typeof n.stars=="number"&&Number.isFinite(n.stars)?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"||typeof n.hacs_id=="number"?n.hacs_id:null,filename:Ue(n.filename)||null,pinned:n.pinned===!0,license:Ue(n.license)||null,tag:Ue(n.tag)||null}}async function xu(e){let n=await P(e,{type:`${hs}mods`}),t=Array.isArray(n?.mods)?n.mods:[];return{source:Ue(n?.source),mods:t.map(ty).filter(r=>r!==null),truncated:n?.truncated===!0}}async function ku(e,n){let t=await P(e,{type:`${hs}mod_asset`,full_name:n});if(typeof t?.source!="string")throw{code:"fetch_failed"};return{full_name:Ue(t.full_name)||n,source:t.source}}async function fs(e){try{let n=await P(e,{type:`${hs}mods`,probe:!0});return Array.isArray(n?.mods)}catch(n){return q(n)!=="unknown_command"}}function $u(e){return ms.test(e)?`https://github.com/${e}`:null}function Eu(e){return e.pinned&&e.category==="plugin"}function Tu(e,n,t){if(!ms.test(n))return;let[r="",o=""]=n.split("/");return Rn(e,r,o,t)}function ny(e){if(e.tag&&us.test(e.tag))return e.tag;let n=(e.filename??"").replace(/\.js$/i,"").toLowerCase();return us.test(n)?n:""}function _u(e){let n=ny(e);return JSON.stringify({type:`custom:${n||"my-card"}`},null,2)}function gs(e){if(e.trim()==="")return{ok:!1,problem:"empty"};if(new TextEncoder().encode(e).length>ey)return{ok:!1,problem:"too_large"};let n;try{n=JSON.parse(e)}catch{return{ok:!1,problem:"invalid"}}if(!n||typeof n!="object"||Array.isArray(n))return{ok:!1,problem:"not_object"};let t=n;if(typeof t.type!="string"||t.type==="")return{ok:!1,problem:"no_type"};let r=t.type.startsWith("custom:")?t.type.slice(7):"";return us.test(r)?{ok:!0,config:t,tag:r}:{ok:!1,problem:"bad_type"}}function Su(e,n,t,r="all"){let o=n.trim().toLowerCase();return e.filter(s=>r!=="all"&&s.kind!==r||t==="installed"&&!s.installed?!1:o===""?!0:s.full_name.toLowerCase().includes(o)||s.description.toLowerCase().includes(o))}var ir={maxEntities:100,maxBytes:1048576,maxString:2048,maxAttrBytes:4096},bs=/^[a-z0-9_]+\.[a-z0-9_]+$/,ry=/token|access|auth|password|passwd|secret|credential|api[_-]?key/i,oy=/(?:^|[?&;#]|%3F|%26)(access_token|token|auth|authsig|signature|sig|key|password)(?:=|%3D)/i,sy=/^[a-z][a-z0-9+.-]*:\/\/[^/?#\s]*@/i,iy=/eyJ[A-Za-z0-9_-]{10,}/,ay=/[0-9a-f]{32,}/i,ly=/[A-Za-z0-9+/_-]{32,}/g,dy=5,cy=12,ys=200,Ru=500,or=100,uy=12,re=Symbol("drop"),Du=new Set(["person","device_tracker","camera","lock","alarm_control_panel","tag","notify","input_text","text"]),py=new Set(["friendly_name","unit_of_measurement","device_class","state_class","icon","supported_features","min","max","step","options","brightness","color_temp","current_temperature","temperature","humidity","hvac_action","hvac_mode","hvac_modes","battery_level","volume_level","is_volume_muted","media_title","media_artist","source","source_list","percentage","current_position","entity_id"]),hy=/^(entity|entities|entity_id|camera_image|.+_entity|.+_entities|.+_entity_id)$/,Mu=typeof TextEncoder>"u"?null:new TextEncoder;function Lu(e){return Mu===null?e.length:Mu.encode(e).length}function my(e){try{let n=JSON.stringify(e);return n===void 0?1/0:Lu(n)}catch{return 1/0}}function ut(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Au(e){if(sy.test(e)||oy.test(e)||iy.test(e)||ay.test(e))return!0;for(let n of e.match(ly)??[])if(/\d/.test(n)&&/[A-Za-z]/.test(n))return!0;return!1}function sr(e,n=ir.maxString){let t=e.length>n?e.slice(0,n):e;if(Au(t))return null;if(t.includes("%"))try{if(Au(decodeURIComponent(t)))return null}catch{return t}return t}function pt(e,n,t,r,o=dy){if(e===null)return null;if(typeof e=="string"){let s=sr(e,t);return s===null?re:s}if(typeof e=="number")return Number.isFinite(e)?e:re;if(typeof e=="boolean")return e;if(n>=o)return re;if(Array.isArray(e)){let s=[];if(e.length>Ru)return re;for(let i of e){let a=pt(i,n+1,t,r,o);a!==re&&s.push(a)}return s}if(ut(e)){let s={},i=0;for(let a of Object.keys(e)){if(a==="__proto__"||a==="constructor"||a==="prototype"||r&&ry.test(a))continue;if(i>=ys)break;let d=pt(e[a],n+1,t,r,o);d!==re&&(s[a]=d,i+=1)}return s}return re}function fy(e){if(!Array.isArray(e))return[];let n=[];for(let t of e.slice(0,or))typeof t=="string"&&bs.test(t)&&!Du.has(t.slice(0,t.indexOf(".")))&&n.push(t);return n}function gy(e,n){let t={};for(let r of Object.keys(e).slice(0,ys)){if(!py.has(r))continue;let o=r==="entity_id"?fy(e[r]):pt(e[r],0,n.maxString,!0);o!==re&&(my(o)>n.maxAttrBytes||(t[r]=o))}return t}function Cu(e){if(typeof e=="string")return sr(e.slice(0,64),64)??void 0}function Pu(e,n){return typeof e=="string"?e.slice(0,n):void 0}function by(e){return e.slice(0,e.indexOf("."))}function Ou(e){let n=[],t=new Set,r=s=>{typeof s=="string"&&bs.test(s)&&!t.has(s)&&n.length<or&&(t.add(s),n.push(s))},o=(s,i,a)=>{if(!(i>uy||n.length>=or)){if(typeof s=="string"){a&&r(s);return}if(Array.isArray(s)){for(let d of s.slice(0,Ru))o(d,i+1,a);return}if(ut(s))for(let d of Object.keys(s).slice(0,ys))d!=="__proto__"&&o(s[d],i+1,hy.test(d))}};return o(e,0,!1),n}function yy(e,n={}){let t={...ir,...n},r={};if(!ut(e))return r;let o=(n.entityIds??[]).slice(0,or),s=0,i=0;for(let a of o){if(typeof a!="string"||!bs.test(a)||a in r)continue;if(s>=t.maxEntities)break;let d=Object.prototype.hasOwnProperty.call(e,a)?e[a]:void 0;if(!ut(d))continue;let c=ut(d.attributes)?d.attributes:{},h;if(Du.has(by(a))||"latitude"in c||"longitude"in c){let g=typeof c.friendly_name=="string"?sr(c.friendly_name,255):null;h={entity_id:a,state:"unknown",attributes:g===null?{}:{friendly_name:g}}}else{let g=d.state,y=typeof g=="string"?g:g==null?"unknown":String(g);h={entity_id:a,state:sr(y,t.maxString)??"unknown",attributes:gy(c,t)};let E=Cu(d.last_changed),A=Cu(d.last_updated);E!==void 0&&(h.last_changed=E),A!==void 0&&(h.last_updated=A)}let p=Lu(JSON.stringify(h));i+p>t.maxBytes||(i+=p,r[a]=h,s+=1)}return r}function Iu(e,n={}){let t=n.maxString??ir.maxString,r=pt(e,0,t,!1,cy);return r===re?{}:r}function vs(e,n={}){let t={...ir,...n},r=ut(e)?e:{},o=Pu(r.language,32)??"en",s=Pu(r.selectedLanguage,32)??o,i=pt(r.themes,0,t.maxString,!1),a=pt(r.locale,0,t.maxString,!1);return{states:yy(r.states,n),themes:i===re?{}:i,language:o,selectedLanguage:s,locale:a===re?{}:a,userData:{language:s}}}function Hu(e,n=1e3){let t=-1/0,r=null,o=null,s=a=>{t=Date.now(),e(...a)},i=((...a)=>{let d=t+n-Date.now();if(d<=0&&r===null){s(a);return}o=a,r===null&&(r=setTimeout(()=>{r=null;let c=o;o=null,c!==null&&s(c)},Math.max(d,0)))});return i.cancel=()=>{r!==null&&clearTimeout(r),r=null,o=null},i}var Nu="read only preview",Fu="allow-scripts",Bu="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'",Uu="The preview runs third party code in a sandboxed frame. A mod that loops forever can still freeze this browser tab, because the frame may share the page's renderer thread. Reload the page if that happens.",ju="The mod author's code runs in a locked frame, but this cannot stop it from sending what it receives to the author. Both modes also receive your theme and language.",zu="Own config: it receives the config of the card you entered and the state of the entities that card uses. Sensitive entities such as person, camera, lock and device_tracker have their state hidden.",Ku="Mock mode: the entities and states it receives are fake.",vy=["mod_error","set_config","unhandled_rejection","runtime_error","not_defined"];var wy=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function ws(e){return typeof e=="string"&&e.length<=100&&wy.test(e)}function Vu(e=globalThis.crypto){let n=new Uint8Array(16);e.getRandomValues(n);let t="";for(let r of n)t+=r.toString(16).padStart(2,"0");return t}function Wu(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Vt(e){return typeof e=="string"&&e.length<=500?e:null}function xy(e){if(!Array.isArray(e)||e.length>100)return null;let n=[];for(let t of e){if(!Wu(t))return null;let r=Vt(t.type),o=Vt(t.name),s=Vt(t.description);if(r===null||o===null||s===null)return null;n.push({type:r,name:o,description:s})}return n}function xs(e,n){if(!Wu(e)||typeof e.type!="string"||typeof e.token!="string")return null;if(e.type==="ready")return e.token===""?{type:"ready"}:null;if(n===""||e.token!==n)return null;switch(e.type){case"heartbeat":return{type:"heartbeat"};case"rendered":return{type:"rendered"};case"defined":return ws(e.tag)?{type:"defined",tag:e.tag}:null;case"cards":{let t=xy(e.cards);return t===null?null:{type:"cards",cards:t}}case"error":{let t=Vt(e.message),r=vy.find(o=>o===e.code);return t===null||r===void 0?null:{type:"error",code:r,message:t}}case"request":{let t=Vt(e.method),r=e.id;return t===null||typeof r!="number"||!Number.isSafeInteger(r)?null:{type:"request",id:r,method:t}}default:return null}}function ky(e){let n=e.document,t=e.parent.postMessage.bind(e.parent),r=e.customElements,o=r.define.bind(r),s="read only preview",i=500,a="",d=null,c=!1,h=null,p=0,g=$=>{if(d!==null)try{d.postMessage({...$,token:a})}catch{return}},y=$=>String($??"").slice(0,i),E=($,_)=>{let C=_&&_.message!==void 0?_.message:_;g({type:"error",code:$,message:y(C)})},A=$=>(p+=1,g({type:"request",id:p,method:y($)}),Promise.reject(new Error(s))),S=$=>()=>A($),U=$=>({states:$.states,themes:$.themes,language:$.language,selectedLanguage:$.selectedLanguage,locale:$.locale,userData:$.userData,callService:S("callService"),callWS:S("callWS"),callApi:S("callApi"),fetchWithAuth:S("fetchWithAuth"),connection:Object.freeze({sendMessagePromise:S("connection.sendMessagePromise"),subscribeMessage:S("connection.subscribeMessage"),subscribeEvents:S("connection.subscribeEvents"),sendMessage:S("connection.sendMessage")}),auth:Object.freeze({data:Object.freeze({}),refreshAccessToken:S("auth.refreshAccessToken"),wsUrl:""})});e.customCards=[];let I=()=>{let $=[],_=Array.isArray(e.customCards)?e.customCards:[];for(let C=0;C<_.length&&$.length<100;C+=1){let H=_[C];H&&typeof H=="object"&&$.push({type:y(H.type),name:y(H.name),description:y(H.description)})}g({type:"cards",cards:$})};e.customElements.define=function($,_,C){o($,_,C),g({type:"defined",tag:y($)})};class X extends e.HTMLElement{constructor(){super();let _=this.attachShadow({mode:"open"}),C=n.createElement("style");C.textContent=":host{display:block;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color,#212121);border-radius:var(--ha-card-border-radius,12px);box-shadow:var(--ha-card-box-shadow,none);overflow:hidden;box-sizing:border-box}",_.appendChild(C),_.appendChild(n.createElement("slot"))}}o("ha-card",X);let j=($,_,C)=>{let H;try{H=n.createElement($),typeof H.setConfig=="function"&&H.setConfig(_)}catch(z){E("set_config",z);return}h=H;try{H.hass=C,n.body.appendChild(H)}catch(z){E("mod_error",z);return}g({type:"rendered"})},Pe=$=>{c=!0,a=$.token,e.hass=U($.hass),e.setInterval(()=>g({type:"heartbeat"}),1e3);let _=n.createElement("script");_.textContent=String($.modSource);try{n.head.appendChild(_)}catch(H){E("mod_error",H);return}I();let C=String($.tag);if(r.get(C)!==void 0){j(C,$.config,e.hass);return}r.whenDefined(C).then(()=>j(C,$.config,e.hass),H=>E("not_defined",H))};e.onerror=($,_,C,H,z)=>(E("mod_error",z||$),!0),e.addEventListener("unhandledrejection",$=>{typeof $.preventDefault=="function"&&$.preventDefault()});let le=$=>{let _=$.data;if(!(!c||!_||typeof _!="object"||_.token!==a)&&_.type==="hass"&&_.hass&&typeof _.hass=="object"&&(e.hass=U(_.hass),h!==null))try{h.hass=e.hass}catch(C){E("mod_error",C)}};e.addEventListener("message",$=>{if(c||$.source!==e.parent)return;let _=$.data;if(!_||typeof _!="object"||_.type!=="init")return;let C=$.ports;!C||C.length!==1||!C[0]||typeof _.token!="string"||_.token===""||(d=C[0],d.onmessage=le,Pe(_))}),t({type:"ready",token:""},"*")}var qu=`(${ky.toString()})(window);`;var Ty=1e3,_y=3e3,Sy=50,My=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${Bu}"></head><body><script>${qu}<\/script></body></html>`;function Gu(e){let{modSource:n,tag:t,config:r,onError:o,onReady:s,onBlocked:i}=e,a=Ou(r),d=e.timeoutMs??5e3,c=Vu(),h=document.createElement("iframe");h.setAttribute("sandbox",Fu),h.setAttribute("referrerpolicy","no-referrer"),h.setAttribute("allow",""),h.setAttribute("loading","eager"),h.setAttribute("title","Mod preview"),h.srcdoc=My;let p=new MessageChannel,g=p.port1,y=!1,E=!1,A=!1,S=0,U=e.hass,I=Date.now(),X=0,j=[],Pe=[],le=null,$=null,_=B=>y||!E?!1:(g.postMessage(B),!0),C=Hu(B=>{if(y||!E)return;let N;try{N=vs(B,{entityIds:a})}catch{z("mirror_error","state mirror failed");return}try{_({type:"hass",token:c,hass:N})}catch{return}},1e3),H=()=>{if(!y){y=!0,window.removeEventListener("message",js),g.onmessage=null;for(let B of[p.port1,p.port2])try{B.close()}catch{continue}le!==null&&clearTimeout(le),$!==null&&clearInterval($),le=null,$=null,C.cancel(),h.remove()}},z=(B,N)=>{if(!y){H();try{o({code:B,message:N})}catch{return}}},Hp=()=>{let B,N;try{B=vs(U,{entityIds:a}),N=Iu(r)}catch{z("mirror_error","state mirror failed");return}let Gt=h.contentWindow;if(Gt===null){z("post_failed","sandbox window unavailable");return}E=!0;let Xt={type:"init",token:c,modSource:n,tag:t,config:N,hass:B};try{Gt.postMessage(Xt,"*",[p.port2])}catch(zs){z("post_failed",zs instanceof Error?zs.message:"post failed")}};function js(B){if(y)return;let N=h.contentWindow,Gt=B.source;if(N===null||Gt!==N)return;let Xt=xs(B.data,"");if(!(Xt===null||Xt.type!=="ready")){if(E){z("navigated","sandbox frame sent a second ready");return}I=Date.now(),Hp()}}function Np(B){if(y||!E)return;let N=xs(B.data,c);if(!(N===null||N.type==="ready"))switch(I=Date.now(),N.type){case"heartbeat":return;case"defined":j.length<200&&!j.includes(N.tag)&&j.push(N.tag);return;case"cards":Pe=N.cards;return;case"rendered":if(le!==null&&clearTimeout(le),le=null,A)return;A=!0,s!==void 0&&s({tags:[...j],cards:[...Pe]});return;case"error":z(N.code,N.message);return;case"request":if(X+=1,X>Sy)return;try{_({type:"refused",token:c,id:N.id,error:Nu})}catch{return}return}}return h.addEventListener("load",()=>{S+=1,S>1&&z("navigated","sandbox frame navigated")}),typeof n!="string"||n.length>4194304?queueMicrotask(()=>z("too_large","mod source rejected")):ws(t)?(window.addEventListener("message",js),g.onmessage=Np,le=setTimeout(()=>z("timeout","mod did not render in time"),d),$=setInterval(()=>{Date.now()-I>_y&&(z("heartbeat_lost","sandbox stopped responding"),i!==void 0&&i())},Ty)):queueMicrotask(()=>z("invalid_tag","invalid custom element name")),{element:h,update(B){y||(U=B,E&&C(B))},destroy:H}}var ht=[K,V,T`
  :host {
    display: block;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .card {
    min-width: 0;
    padding: 16px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  h2,
  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    overflow-wrap: anywhere;
  }
  .muted {
    color: var(--hl-muted);
  }
  .toolbar,
  .head,
  .tools,
  .links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .links {
    margin: 4px 0;
  }
  .kinds {
    display: flex;
    flex-wrap: wrap;
    width: fit-content;
    max-width: 100%;
    margin-top: 8px;
    border-radius: var(--hl-radius-md);
  }
  .field {
    display: grid;
    gap: 4px;
    min-width: 0;
    flex: 1 1 200px;
  }
  input,
  textarea {
    width: 100%;
    font: inherit;
    color: var(--hl-text);
    background: var(--hl-bg);
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-sm);
    padding: 8px 10px;
  }
  textarea {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    resize: vertical;
  }
  ul.mods {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }
  .mod {
    padding: 12px 0;
    border-top: 1px solid var(--hl-line);
  }
  .mod:first-child {
    border-top: 0;
  }
  .pick {
    appearance: none;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    text-align: left;
    padding: 4px 8px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid transparent;
    background: transparent;
    color: var(--hl-text);
    overflow-wrap: anywhere;
  }
  .pick {
    text-decoration: underline;
  }
  .advanced {
    margin-top: 12px;
  }
  .advanced summary {
    cursor: pointer;
    padding: 8px 0;
  }
  .pick:focus-visible,
  .link:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .desc {
    margin: 4px 0;
    color: var(--hl-muted);
    overflow-wrap: anywhere;
  }
  .link {
    color: var(--hl-accent-text);
  }
  .notice {
    margin: 8px 0;
    padding: 8px 12px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-line);
  }
  .notice.error {
    border-color: var(--hl-warn-text);
    color: var(--hl-warn-text);
  }
  .stage {
    margin-top: 12px;
    overflow: auto;
    max-width: 100%;
  }
  .confirm {
    padding: 12px;
    border: 1px solid var(--hl-warn);
    border-radius: var(--hl-radius-md);
  }
`];var w={title:"Mods",intro:"Add-ons that change how your dashboard looks: styling, cards, layouts and chrome. Previews run in an isolated frame and nothing is installed from here.",loading:"Loading mods...",loadFailed:"Could not load the mods list.",retry:"Try again",search:"Search mods",searchPlaceholder:"Name or description",filters:"Filter",filterAll:"All",filterInstalled:"Installed",kinds:"Kind",kindAll:"All kinds",kindLabels:{styling:"Styling",cards:"Cards",layout:"Layout",templating:"Templating",chrome:"Chrome"},integrationChip:"Integration",integrationNote:"This integration comes from {store}. It acts on your real dashboard and cannot be previewed in the sandbox. Install it through {store}.",empty:"No mods match.",truncated:"The list is incomplete. Narrow the search to find more.",installedChip:"Installed",pinnedChip:"Preview available",stars:e=>`${e} stars`,license:e=>`License: ${e}`,repository:"Repository",openInStore:"Open in {label}",select:e=>`Preview ${e}`,nothingSelected:"Select a mod to see its preview.",installedNote:"Already in your dashboard resources",installedHint:"This card is already loaded in your dashboard, so it is previewed with the real card helpers.",installedUnavailable:"The real card could not be created here. Check it in the Preview tab or on a dashboard.",unpinned:"Preview unavailable: this mod is not in the pinned set",configLabel:"Your card config (JSON)",configHelp:"Up to 4 KB. The type must be custom: followed by the card tag.",configProblems:{empty:"Enter a card config.",too_large:"The card config is larger than 4 KB.",invalid:"The card config is not valid JSON.",not_object:"The card config must be an object.",no_type:"The card config needs a type such as custom:my-card.",bad_type:"The type must start with custom: followed by a valid card tag."},run:"Show preview",runOwn:"Run my card",advancedTitle:"Advanced: try your own card",noLiveMock:"This mod works on other cards, so it cannot be shown on its own here.",close:"Close",showCard:"Show real card",confirmTitle:"Before running third party code",isolation:Uu,disclosureAuthor:ju,disclosureOwn:zu,disclosureMock:Ku,confirm:"Run in sandbox",cancel:"Cancel",fetching:"Fetching the pinned release...",starting:"Starting the sandbox...",running:"Preview running.",reset:"Reset",width:"Width",height:"Height 480 px",widths:{phone:"Phone",tablet:"Tablet",desktop:"Desktop"},stageLabel:"Sandboxed mod preview",errors:{not_pinned:"This mod is not in the pinned set.",hash_mismatch:"The downloaded file does not match the pinned hash, so it was refused.",too_large:"The mod file is too large to preview.",bad_content_type:"The server returned an unexpected content type.",redirect_refused:"The download tried to redirect and was refused.",network:"The network request failed.",timeout:"The request or the mod timed out.",invalid_encoding:"The mod file is not valid text.",not_found:"The mod file was not found.",fetch_failed:"The mod file could not be fetched.",rate_limited:"Too many requests. Wait a moment and try again.",catalog_unavailable:"The mod catalog is unavailable right now.",unauthorized:"You are not allowed to do that.",unknown_command:"This server does not support the Mods tab.",navigated:"The mod tried to navigate the preview frame and was stopped.",heartbeat_lost:"The preview stopped responding and was removed.",mirror_error:"The card state could not be copied into the preview.",mod_error:"The mod failed while loading.",set_config:"The card rejected this config.",unhandled_rejection:"The mod raised an unhandled error.",runtime_error:"The mod raised a runtime error.",not_defined:"The mod did not define that card tag.",invalid_tag:"That is not a valid custom card tag.",post_failed:"The preview frame could not be started.",unknown:"Something went wrong. Try again."},unknownCode:e=>`Something went wrong (${e}). Try again.`};function ar(e){let n=w.errors[e];return n||(e==="unknown"?w.errors.unknown:w.unknownCode(e))}var Xu="2024-01-01T12:00:00+00:00",Ay={"light.mock_lamp":{entity_id:"light.mock_lamp",state:"on",attributes:{friendly_name:"Living room lamp",brightness:180,icon:"mdi:lamp"}},"switch.mock_fan":{entity_id:"switch.mock_fan",state:"off",attributes:{friendly_name:"Bedroom fan",icon:"mdi:fan"}},"sensor.mock_temperature":{entity_id:"sensor.mock_temperature",state:"21.5",attributes:{friendly_name:"Room temperature",unit_of_measurement:"C",device_class:"temperature"}},"climate.mock_thermostat":{entity_id:"climate.mock_thermostat",state:"heat",attributes:{friendly_name:"Thermostat",current_temperature:20.5,temperature:22,hvac_action:"heating",hvac_modes:["off","heat","cool"]}},"cover.mock_blind":{entity_id:"cover.mock_blind",state:"open",attributes:{friendly_name:"Window blind",icon:"mdi:blinds"}}},mt=["light.mock_lamp","switch.mock_fan","sensor.mock_temperature"],ks={styling:{tag:null,config:{type:"entities",title:"Example card",entities:mt,card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An entities card with three example rows. This mod restyles cards like this one."},cards:{tag:null,config:{type:"entities",title:"Example card",entities:mt},summary:"An entities card with three example rows."},layout:{tag:null,config:{type:"vertical-stack",cards:[{type:"entity",entity:"sensor.mock_temperature"},{type:"entities",entities:mt}]},summary:"Two example cards arranged together. This mod controls how cards are laid out."},templating:{tag:null,config:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"},summary:"One example card. This mod lets you reuse a card design in many places."},chrome:{tag:null,config:{type:"entities",title:"Example dashboard",entities:mt},summary:"An example dashboard. This mod changes the header and sidebar around your cards."}},Yu={"piitaya/lovelace-mushroom":{tag:"mushroom-entity-card",config:{type:"custom:mushroom-entity-card",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Mushroom entity card for an example lamp."},"custom-cards/button-card":{tag:"button-card",config:{type:"custom:button-card",entity:"light.mock_lamp",name:"Living room lamp",show_state:!0},summary:"A button card for an example lamp."},"Clooos/Bubble-Card":{tag:"bubble-card",config:{type:"custom:bubble-card",card_type:"button",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Bubble button for an example lamp."},"jcwillox/lovelace-paper-buttons-row":{tag:"paper-buttons-row",config:{type:"custom:paper-buttons-row",buttons:[{entity:"light.mock_lamp"},{entity:"switch.mock_fan"},{entity:"cover.mock_blind"}]},summary:"A row of three example buttons."},"ofekashery/vertical-stack-in-card":{tag:null,config:{type:"custom:vertical-stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:mt}]},summary:"Two example cards merged into one panel."},"custom-cards/stack-in-card":{tag:null,config:{type:"custom:stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:mt}]},summary:"Two example cards merged into one panel."},"ownbee/bootstrap-grid-card":{tag:null,config:{type:"custom:bootstrap-grid-card",cards:[{type:"row",cards:[{type:"entity",entity:"light.mock_lamp"},{type:"entity",entity:"switch.mock_fan"}]}]},summary:"Two example cards side by side in a grid."},"iantrich/config-template-card":{tag:null,config:{type:"custom:config-template-card",entities:["sensor.mock_temperature"],card:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"}},summary:"An example card whose settings come from a template."},"thomasloven/lovelace-card-mod":{...ks.styling,config:{type:"thermostat",entity:"climate.mock_thermostat",card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An example thermostat card with rounded corners applied by this mod."}};function lr(e){return(Object.prototype.hasOwnProperty.call(Yu,e.full_name)?Yu[e.full_name]:null)??ks[e.kind]??ks.cards}var Cy=["language","locale","themes","selectedTheme","localize"];function $s(e){let n=e&&typeof e=="object"?e:{},t={};for(let s of Cy)n[s]!==void 0&&(t[s]=n[s]);let r={};for(let[s,i]of Object.entries(Ay))r[s]={...i,attributes:{...i.attributes},last_changed:Xu,last_updated:Xu};let o=async()=>{};return{...t,states:r,entities:{},devices:{},areas:{},user:{id:"mock",name:"Guest",is_admin:!1},callService:o,callWS:o}}var Py=[["phone",390],["tablet",768],["desktop",1024]],Ry=480,Zu=new Set;function Ju(e,n){return`${e.full_name.toLowerCase()}@${e.tag??""}:${n?"own":"mock"}`}var Dy=async(e,n)=>{let t=await ln();return dn(t,n)};function Ts(e,n){let t=$u(e.full_name),r=n?Tu(n,e.full_name,e.category):void 0;return l`
    ${t?l`<a class="link" href=${t} target="_blank" rel="noopener noreferrer">${w.repository}</a>`:u}
    ${r&&n?l`<a class="link" id="store-link" href=${r} target="_blank" rel="noopener noreferrer">${ee(w.openInStore,n)}</a>`:u}
  `}var Es=class extends M{constructor(){super(...arguments);this.mod=null;this.createSandbox=Gu;this.cardFactory=Dy;this.configText="";this.problem="";this.phase="idle";this.failure="";this.width=390;this.installedFailed=!1;this.sandbox=null;this.card=null;this.token=0;this.own=!1;this.pending=null;this.focusTarget=null;this.onConfigInput=t=>{this.configText=t.target.value,this.problem=""};this.onRun=()=>{this.begin(this.mockTarget())};this.onRunOwn=()=>{let t=gs(this.configText);if(!t.ok){this.problem=t.problem;return}this.begin(this.ownTarget())};this.onConfirm=()=>{this.mod&&this.pending&&Zu.add(Ju(this.mod,this.pending.own)),this.start()};this.onCancel=()=>{this.focusTarget="run",this.phase="idle"};this.onReset=()=>{this.stop(),this.focusTarget="run",this.phase="idle",this.failure=""}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1},createSandbox:{attribute:!1},cardFactory:{attribute:!1},configText:{state:!0},problem:{state:!0},phase:{state:!0},failure:{state:!0},width:{state:!0},installedFailed:{state:!0}}}static{this.styles=ht}disconnectedCallback(){super.disconnectedCallback(),this.stop()}willUpdate(t){t.has("mod")&&(this.stop(),this.phase="idle",this.problem="",this.failure="",this.installedFailed=!1,this.configText=this.mod?_u(this.mod):"")}mockTarget(){let t=this.mod;if(!t||!this.hass)return null;let r=lr(t);return{tag:r.tag??"",config:r.config,hass:$s(this.hass),own:!1}}ownTarget(){let t=gs(this.configText);return!t.ok||!this.hass?null:{tag:t.tag,config:t.config,hass:this.hass,own:!0}}updated(t){t.has("mod")&&this.mod?.installed&&this.mod.category==="plugin"&&this.showInstalled(this.mockTarget()),t.has("hass")&&this.hass&&this.sandbox&&this.sandbox.update(this.own?this.hass:$s(this.hass));let r=this.stage();r&&this.sandbox&&this.sandbox.element.parentNode!==r&&r.append(this.sandbox.element),this.sandbox&&this.sizeFrame(),this.applyFocus()}applyFocus(){let t=this.focusTarget;if(!t)return;let r=this.renderRoot.querySelector(t==="confirm"?"#confirm-h":"#run, #run-own");r&&(this.focusTarget=null,r.focus())}stage(){return this.renderRoot.querySelector(".stage")}sizeFrame(){let t=this.sandbox?.element;t&&(t.style.width=`${this.width}px`,t.style.height=`${Ry}px`,t.style.maxWidth="100%",t.style.border="0")}stop(){this.token+=1,this.sandbox?.destroy(),this.sandbox=null,this.card?.remove(),this.card=null}async showInstalled(t){if(!t)return;this.own=t.own;let r=++this.token;this.card?.remove(),this.card=null,this.installedFailed=!1;let o;try{o=await this.cardFactory(t.hass,t.config)}catch{r===this.token&&(this.installedFailed=!0);return}r===this.token&&(o.hass=t.hass,this.card=o,await this.updateComplete,this.stage()?.append(o))}begin(t){t&&(this.pending=t,this.problem="",this.mod&&Zu.has(Ju(this.mod,t.own))?this.start():(this.focusTarget="confirm",this.phase="confirm"))}fail(t){this.stop(),this.failure=ar(t),this.phase="error"}async start(){let t=this.mod,r=this.hass,o=this.pending;if(!t||!r||!o)return;this.own=o.own,this.stop();let s=this.token;this.phase="fetching";let i;try{i=(await ku(r,t.full_name)).source}catch(a){s===this.token&&this.fail(q(a));return}s===this.token&&(this.phase="starting",this.sandbox=this.createSandbox({modSource:i,tag:o.tag,config:o.config,hass:o.hass,onReady:()=>{s===this.token&&(this.phase="running")},onError:a=>{s===this.token&&this.fail(a.code)}}))}renderAdvanced(t,r,o){return l`
      <details class="advanced" id="advanced">
        <summary>${w.advancedTitle}</summary>
        <label class="field">
          <span>${w.configLabel}</span>
          <textarea
            id="config"
            rows="5"
            spellcheck="false"
            .value=${this.configText}
            @input=${this.onConfigInput}
          ></textarea>
        </label>
        <p class="muted">${w.configHelp}</p>
        ${this.problem?l`<p class="notice error" id="config-problem" role="alert">${w.configProblems[this.problem]??this.problem}</p>`:u}
        <div class="tools">
          <button class="btn" type="button" id=${o} aria-label=${t} @click=${r}>${t}</button>
        </div>
      </details>
    `}renderWidths(){return l`
      <div class="seg" role="group" aria-label=${w.width}>
        ${Py.map(([t,r])=>l`<button
            type="button"
            data-width=${r}
            aria-pressed=${this.width===r?"true":"false"}
            @click=${()=>{this.width=r}}
          >
            ${w.widths[t]} ${r}
          </button>`)}
      </div>
      <span class="muted">${w.height}</span>
    `}renderSandbox(){let t=this.phase==="fetching"||this.phase==="starting";if(this.phase==="idle"){let r=this.mod?lr(this.mod):null;return l`
        <p class="muted" id="mock-summary">${r?.summary}</p>
        ${r?.tag?l`<div class="tools"><button class="btn primary" type="button" id="run" @click=${this.onRun}>${w.run}</button></div>`:l`<p class="notice" id="no-mock">${w.noLiveMock}</p>`}
        ${this.renderAdvanced(w.runOwn,this.onRunOwn,"run-own")}
      `}return this.phase==="confirm"?l`
        <section class="confirm" role="region" aria-labelledby="confirm-h">
          <h3 id="confirm-h" tabindex="-1">${w.confirmTitle}</h3>
          <p id="confirm-status" role="status" aria-live="polite">${this.problem}</p>
          <p id="isolation">${w.isolation}</p>
          <p id="disclosure">${w.disclosureAuthor}</p>
          <p id="disclosure-mode">${this.pending?.own?w.disclosureOwn:w.disclosureMock}</p>
          <div class="tools">
            <button class="btn primary" type="button" id="confirm" @click=${this.onConfirm}>${w.confirm}</button>
            <button class="btn" type="button" id="cancel" @click=${this.onCancel}>${w.cancel}</button>
          </div>
        </section>
      `:this.phase==="error"?l`
        <p class="notice error" id="failure" role="status" aria-live="polite">${this.failure}</p>
        <div class="tools"><button class="btn" type="button" id="reset" @click=${this.onReset}>${w.reset}</button></div>
      `:l`
      <p class="muted" role="status">${t?this.phase==="fetching"?w.fetching:w.starting:w.running}</p>
      <div class="tools">${this.renderWidths()}
        <button class="btn" type="button" id="reset" @click=${this.onReset}>${w.reset}</button>
      </div>
      <div class="stage" role="region" aria-label=${w.stageLabel}></div>
    `}renderBody(t){return t.category==="integration"?l`<p class="notice" id="integration-note">${ee(w.integrationNote,He(this.hass))}</p>`:t.installed?l`
        <p class="notice" id="installed-note">${w.installedNote}</p>
        <p class="muted">${w.installedHint}</p>
        ${this.installedFailed?l`<p class="notice error" id="installed-failed" role="alert">${w.installedUnavailable}</p>`:u}
        <p class="muted" id="mock-summary">${this.mod?lr(this.mod).summary:""}</p>
        <div class="stage" role="region" aria-label=${w.stageLabel}></div>
        ${this.renderAdvanced(w.showCard,()=>{this.showInstalled(this.ownTarget())},"show-card")}
      `:Eu(t)?this.renderSandbox():l`<p class="notice" id="unpinned">${w.unpinned}</p>`}render(){let t=this.mod;return t?l`
      ${t.pinned&&t.license?l`<p class="muted" id="license">${w.license(t.license)}</p>`:u}
      <p class="links">${Ts(t,He(this.hass))}</p>
      ${this.renderBody(t)}
    `:l`<p class="muted">${w.nothingSelected}</p>`}};customElements.get("hats-lite-mods-preview")||customElements.define("hats-lite-mods-preview",Es);var Qu='a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',Ly=T`
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.55);
  }
  .dialog {
    display: flex;
    flex-direction: column;
    width: min(840px, 100%);
    max-height: 100%;
    max-height: calc(100dvh - 32px);
    overflow: hidden;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
    box-shadow: var(--hl-shadow);
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--hl-line);
  }
  .bar h2 {
    margin: 0;
  }
  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 16px;
    -webkit-overflow-scrolling: touch;
  }
`;function Oy(e){let n=e.activeElement;for(;n?.shadowRoot?.activeElement;)n=n.shadowRoot.activeElement;return n}var _s=class extends M{constructor(){super(...arguments);this.mod=null;this.onKey=t=>{if(t.key==="Escape"){t.stopPropagation(),t.preventDefault(),this.close();return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=Oy(document),s=r.findIndex(a=>a===o),i=r.length-1;t.shiftKey&&s<=0?(t.preventDefault(),r[i].focus()):!t.shiftKey&&(s===-1||s===i)&&(t.preventDefault(),r[0].focus())};this.downOnBackdrop=!1;this.onBackdropDown=t=>{this.downOnBackdrop=t.target===t.currentTarget};this.onBackdrop=t=>{let r=this.downOnBackdrop;this.downOnBackdrop=!1,r&&t.target===t.currentTarget&&this.close()}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1}}}static{this.styles=[ht,Ly]}firstUpdated(){this.renderRoot.querySelector("#close")?.focus()}close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}focusables(){let t=Array.from(this.renderRoot.querySelectorAll(Qu)),r=this.renderRoot.querySelector("hats-lite-mods-preview")?.shadowRoot,o=r?Array.from(r.querySelectorAll(Qu)):[];return[...t,...o].filter(s=>!s.closest("details:not([open])")||s.tagName==="SUMMARY")}render(){let t=this.mod;return t?l`
      <div class="backdrop" @mousedown=${this.onBackdropDown} @click=${this.onBackdrop}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          @keydown=${this.onKey}
        >
          <div class="bar">
            <h2 id="dialog-title">${t.full_name}</h2>
            <button class="btn" type="button" id="close" aria-label=${w.close} @click=${()=>this.close()}>${w.close}</button>
          </div>
          <div class="body">
            <hats-lite-mods-preview .hass=${this.hass} .mod=${t}></hats-lite-mods-preview>
          </div>
        </div>
      </div>
    `:l``}};customElements.get("hats-lite-mods-dialog")||customElements.define("hats-lite-mods-dialog",_s);var Ms=["browse","preview","designer","people","mods"],Iy=["theme","plugin","integration"],Hy=/^[A-Za-z0-9_.-]{1,100}$/,Ny=/^\/[a-z0-9-]{1,40}$/,Fy=/^\/([a-z]+)\/?$/,By=new Map([["gallery","browse"],["preview","preview"],["designer","designer"],["people","people"],["mods","mods"]]);function Uy(e){return e==="browse"?"gallery":e}function jy(e){return Ms.includes(e)}function dr(e){return typeof e=="string"&&Hy.test(e)&&e!=="."&&e!==".."}function ep(e){return Iy.includes(e)}function zy(e,n){return e==="preview"?n==="theme":e==="mods"?n!=="theme":!1}function tp(e,n){if(typeof n!="object"||n===null)return!1;let t=n,{owner:r,repository:o,category:s}=t;return dr(r)&&dr(o)&&ep(s)&&zy(e,s)}function Ss(e,n){let t=e.getAll(n);return t.length===1?t[0]:null}function Ky(e,n){let t=new URLSearchParams(n),r={owner:Ss(t,"owner"),repository:Ss(t,"repository"),category:Ss(t,"category")};return tp(e,r)?r:null}function np(e){return e===null?"":`?${new URLSearchParams({owner:e.owner,repository:e.repository,category:e.category}).toString()}`}function As(e,n){if(typeof e!="string")return{tab:"browse",item:null,canonical:!1};let t="browse",r=!1;if(e!==""&&e!=="/"){let i=Fy.exec(e),a=i===null?void 0:By.get(i[1]);if(i===null||a===void 0)return{tab:"browse",item:null,canonical:!1};t=a,r=e===`/${i[1]}`}let o=typeof n=="string"?Ky(t,n):null,s=r&&typeof n=="string"&&n===np(o);return{tab:t,item:o,canonical:s}}function Cs(e){return typeof e=="string"&&Ny.test(e)}function cr(e,n,t){if(!Cs(e))throw new Error("Invalid route prefix");if(!jy(n))throw new Error("Invalid route tab");let r=tp(n,t)?np(t):"";return`${e}/${Uy(n)}${r}`}function je(e,n){if(typeof e!="string"||!ep(n))return null;let t=e.split("/");if(t.length!==2)return null;let[r,o]=t;return!dr(r)||!dr(o)?null:{owner:r,repository:o,category:n}}function rp(e){return`${e.owner}/${e.repository}`}function ur(e,n){return e===null||n===null?e===n:e.category===n.category&&e.owner.toLowerCase()===n.owner.toLowerCase()&&e.repository.toLowerCase()===n.repository.toLowerCase()}var Vy=[["all",w.filterAll],["installed",w.filterInstalled]],Ps=class extends M{constructor(){super(...arguments);this.active=!0;this.mods=[];this.truncated=!1;this.status="idle";this.failure="";this.query="";this.filter="all";this.kind="all";this.selected="";this.deepLink=null;this.closeDialog=()=>{let t=this.selected;this.selected="",this.updateComplete.then(()=>{Array.from(this.renderRoot.querySelectorAll("[data-name]")).find(o=>o.dataset.name===t)?.querySelector(".pick")?.focus()}),this.dispatchEvent(new CustomEvent("hats-lite-mod-closed",{bubbles:!0,composed:!0}))}}static{this.properties={hass:{attribute:!1},active:{type:Boolean},mods:{state:!0},truncated:{state:!0},status:{state:!0},failure:{state:!0},query:{state:!0},filter:{state:!0},kind:{state:!0},selected:{state:!0},deepLink:{attribute:!1}}}static{this.styles=ht}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load(),(t.has("deepLink")||t.has("status"))&&this.status==="ready"&&this.syncDeepLink()}syncDeepLink(){let t=this.deepLink;if(t===null){this.selected="";return}let r=rp(t).toLowerCase(),o=this.mods.find(s=>s.full_name.toLowerCase()===r&&s.category===t.category);o&&(this.selected=o.full_name)}openMod(t){this.selected=t.full_name,this.dispatchEvent(new CustomEvent("hats-lite-mod-opened",{bubbles:!0,composed:!0,detail:{fullName:t.full_name,category:t.category}}))}async load(){let t=this.hass;if(t){this.status="loading";try{let r=await xu(t);this.mods=r.mods,this.truncated=r.truncated,this.status="ready"}catch(r){this.failure=ar(q(r)),this.status="error"}}}renderItem(t){return l`
      <li class="mod" data-name=${t.full_name}>
        <div class="head">
          <button
            class="pick"
            type="button"
            aria-haspopup="dialog"
            aria-label=${w.select(t.full_name)}
            @click=${()=>this.openMod(t)}
          >
            ${t.full_name}
          </button>
          <span class="chip">${w.kindLabels[t.kind]??t.kind}</span>
          ${t.category==="integration"?l`<span class="chip">${w.integrationChip}</span>`:u}
          ${t.installed?l`<span class="chip ok">${w.installedChip}</span>`:u}
          ${t.pinned?l`<span class="chip">${w.pinnedChip}</span>`:u}
          ${t.stars>0?l`<span class="chip">${w.stars(t.stars)}</span>`:u}
        </div>
        ${t.description?l`<p class="desc">${t.description}</p>`:u}
        <p class="links">${Ts(t,null)}</p>
      </li>
    `}renderList(){let t=Su(this.mods,this.query,this.filter,this.kind),r=ps.filter(s=>this.mods.some(i=>i.kind===s)),o=[["all",w.kindAll],...r.map(s=>[s,w.kindLabels[s]])];return l`
      <div class="toolbar">
        <label class="field">
          <span>${w.search}</span>
          <input
            type="search"
            id="search"
            placeholder=${w.searchPlaceholder}
            .value=${this.query}
            @input=${s=>{this.query=s.target.value}}
          />
        </label>
        <div class="seg" role="group" aria-label=${w.filters}>
          ${Vy.map(([s,i])=>l`<button
              type="button"
              data-filter=${s}
              aria-pressed=${this.filter===s?"true":"false"}
              @click=${()=>{this.filter=s}}
            >
              ${i}
            </button>`)}
        </div>
      </div>
      <div class="seg kinds" role="group" aria-label=${w.kinds} data-group="kind">
        ${o.map(([s,i])=>l`<button
            type="button"
            data-kind=${s}
            aria-pressed=${this.kind===s?"true":"false"}
            @click=${()=>{this.kind=s}}
          >
            ${i}
          </button>`)}
      </div>
      ${this.truncated?l`<p class="notice" id="truncated" role="status">${w.truncated}</p>`:u}
      ${t.length===0?l`<p class="muted" id="empty">${w.empty}</p>`:l`<ul class="mods">${t.map(s=>this.renderItem(s))}</ul>`}
    `}render(){if(this.status==="idle"||this.status==="loading")return l`<p class="muted" role="status">${w.loading}</p>`;if(this.status==="error")return l`<p class="notice error" role="alert">${this.failure||w.loadFailed}</p>
        <button class="btn" type="button" id="retry" @click=${()=>{this.load()}}>${w.retry}</button>`;let t=this.mods.find(r=>r.full_name===this.selected)??null;return l`
      <p class="muted">${w.intro}</p>
      <section class="card" aria-labelledby="mods-h">
        <h2 id="mods-h">${w.title}</h2>
        ${this.renderList()}
      </section>
      ${this.active&&t?l`<hats-lite-mods-dialog .hass=${this.hass} .mod=${t} @close=${this.closeDialog}></hats-lite-mods-dialog>`:u}
    `}};customElements.get("hats-lite-mods")||customElements.define("hats-lite-mods",Ps);function pr(e,n,t){let r=e?.themes?.themes;if(typeof n!="string"||!r||!Object.prototype.hasOwnProperty.call(r,n))return null;let o=r[n];if(!o||typeof o!="object")return null;let s=oe(o),a=(typeof t=="boolean"?t:e?.themes?.darkMode===!0)?"dark":"light";return{mode:a,candidate:{name:n,vars:Z(s,a),entry:s,installed:!0,canApply:!0}}}function op(e,n,t,r,o){if(!e||!Object.prototype.hasOwnProperty.call(n,t))return null;let s=oe(n[t]),i=r?.themes?.darkMode?"dark":"light",a=o.includes(t),d=r?.themes?.themes,c=d&&Object.prototype.hasOwnProperty.call(d,t)?d[t]:void 0,h=a&&!e.installed&&Ei(c,s);return{name:t,fullName:e.full_name,vars:Z(s,i),entry:s,installed:a,nameCollision:h,repoUrl:Si(e.full_name),canApply:a&&!h}}function Rs(e,n){return e.installed===n.installed&&e.nameCollision===n.nameCollision&&e.canApply===n.canApply&&JSON.stringify(e.vars)===JSON.stringify(n.vars)}function sp(e,n){return!e||!n||n.installed||!e.hacs_id?null:{fullName:e.full_name,hacsId:e.hacs_id}}function ip(e,n){return!e||!n||!n.installed||n.nameCollision||!e.installed||!e.hacs_id?null:{fullName:e.full_name,hacsId:e.hacs_id}}function ap(e,n,t){if(n.name===Ze&&!n.entry)return n;let r=t==="dark"?!0:t==="light"?!1:void 0,o=pr(e,n.name,r)?.candidate??null;return o&&Rs(n,o)?n:o}var Wy=150,hr=class{constructor(n){this.options=n;this.list=[];this.loaded=-1;this.index=-1;this.error="";this.token=0}start(n,t){this.cancel();let r=n.findIndex(o=>o.full_name===t.full_name);this.list=r<0?[t]:[...n],this.loaded=this.index=Math.max(r,0),this.error="",this.options.onChange()}clear(){this.cancel(),this.list=[],this.loaded=this.index=-1,this.error="",this.options.onChange()}cancel(){this.token+=1,this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}model(){let n=this.list[this.index];return n?{index:this.index,total:this.list.length,name:Qr(n),pending:this.index!==this.loaded,error:this.error}:null}move(n){let t=nt(this.index,this.list.length,n);if(t!==null){if(this.cancel(),this.index=t,this.error="",t!==this.loaded){let r=this.token;this.timer=setTimeout(()=>{this.load(r)},Wy)}this.options.onChange()}}async load(n){this.timer=void 0;let t=this.list[this.index],r=this.index;try{let o=await this.options.open(t);if(n!==this.token)return;this.loaded=r,this.options.apply(o)}catch{if(n!==this.token)return;this.index=this.loaded,this.error=f.navFailed.replace("{name}",Qr(t))}this.options.onChange()}};var Is={r:0,g:0,b:0,a:1},gr={r:255,g:255,b:255,a:1},cp=()=>({...Is}),up=()=>({...gr}),Ae=(e,n,t)=>Math.min(t,Math.max(n,e));function Ds(e){let n=e.trim();return n==="none"?0:n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n)}function mr(e){if(e===void 0)return 1;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?Ae(t,0,1):1}function qy(e){if(!/^[0-9a-f]+$/i.test(e)||![3,4,6,8].includes(e.length))return null;let n=e.length<=4?e.replace(/./g,r=>r+r):e,t=r=>parseInt(n.slice(r,r+2),16);return{r:t(0),g:t(2),b:t(4),a:n.length===8?t(6)/255:1}}function pp(e){return e.replace(/\s*\/\s*/g," / ").split(/[\s,]+/).filter(n=>n!=="")}function Gy(e){let n=pp(e),t=n.indexOf("/");return t>=0?{values:n.slice(0,t),alpha:n[t+1]}:{values:n.slice(0,3),alpha:n[3]}}function lp(e){let n=e.trim(),t=parseFloat(n);return n.endsWith("turn")?t*360:n.endsWith("rad")?t*180/Math.PI:n.endsWith("grad")?t*.9:t}function Xy(e,n,t){let r=(e%360+360)%360,o=a=>(a+r/30)%12,s=n*Math.min(t,1-t),i=a=>t-s*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[i(0)*255,i(8)*255,i(4)*255]}function Ls(e){let n=Ae(e,0,1);return n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055}function Yy(e,n,t){let r=e+.3963377774*n+.2158037573*t,o=e-.1055613458*n-.0638541728*t,s=e-.0894841775*n-1.291485548*t,[i,a,d]=[r**3,o**3,s**3],c=[4.0767416621*i-3.3077115913*a+.2309699292*d,-1.2684380046*i+2.6097574011*a-.3413193965*d,-.0041960863*i-.7034186147*a+1.707614701*d];return[Ls(c[0])*255,Ls(c[1])*255,Ls(c[2])*255]}function Zy(e){let n=e.trim();return n.endsWith("%")?parseFloat(n)/100:parseFloat(n)}function Jy(e,n){if(e==="color"){let[o,...s]=pp(n.replace(/\/.*$/,""));if(o!=="srgb"||s.length!==3)return null;let[i,a,d]=s.map(c=>(c.endsWith("%")?parseFloat(c)/100:parseFloat(c))*255);return{r:i,g:a,b:d,a:mr(n.split("/")[1])}}let{values:t,alpha:r}=Gy(n);if(t.length<3)return null;if(e==="rgb"||e==="rgba")return{r:Ds(t[0]),g:Ds(t[1]),b:Ds(t[2]),a:mr(r)};if(e==="hsl"||e==="hsla"){let[o,s,i]=Xy(lp(t[0]),Ae(parseFloat(t[1])/100,0,1),Ae(parseFloat(t[2])/100,0,1));return{r:o,g:s,b:i,a:mr(r)}}if(e==="oklab"||e==="oklch"){let o=Zy(t[0]),s=parseFloat(t[1]),i=parseFloat(t[2]);if(e==="oklch"){let h=parseFloat(t[1]),p=lp(t[2])*Math.PI/180;s=h*Math.cos(p),i=h*Math.sin(p)}let[a,d,c]=Yy(o,s,i);return{r:a,g:d,b:c,a:mr(r)}}return null}function ze(e){let n=(e??"").trim().toLowerCase();if(n==="")return null;if(n==="transparent")return{r:0,g:0,b:0,a:0};if(n.startsWith("#"))return qy(n.slice(1));let t=/^([a-z]+)\(([^)]*)\)$/.exec(n);if(!t)return null;let r=Jy(t[1],t[2]);return!r||![r.r,r.g,r.b,r.a].every(Number.isFinite)?null:{r:Ae(r.r,0,255),g:Ae(r.g,0,255),b:Ae(r.b,0,255),a:r.a}}function fe(e,n){if(e.a>=1)return e;let t=e.a;return{r:e.r*t+n.r*(1-t),g:e.g*t+n.g*(1-t),b:e.b*t+n.b*(1-t),a:1}}function Hs(e,n,t){return{r:e.r+(n.r-e.r)*t,g:e.g+(n.g-e.g)*t,b:e.b+(n.b-e.b)*t,a:1}}function Os(e){let n=e/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function ft(e){return .2126*Os(e.r)+.7152*Os(e.g)+.0722*Os(e.b)}function hp(e,n){let t=ft(e),r=ft(n);return(Math.max(t,r)+.05)/(Math.min(t,r)+.05)}function Wt(e,n){return n.length===0?1/0:Math.min(...n.map(t=>hp(fe(e,t),t)))}function fr(e){let n=t=>Math.round(Ae(t,0,255)).toString(16).padStart(2,"0");return`#${n(e.r)}${n(e.g)}${n(e.b)}`}function Ns(e){return Wt(Is,e)>=Wt(gr,e)?"#000000":"#ffffff"}function mp(e,n,t=4.5){if(n&&e.length>0){let r=fe(n,e[0]);if(e.every(o=>hp(r,o)>=t))return fr(r)}return Ns(e)}function dp(e,n,t,r){let o=e,s=Wt(e,t);for(let i=1;i<=50;i+=1){let a=Hs(e,n,i/50),d=Wt(a,t);if(d>=r)return{found:a,best:a,bestRatio:d};d>s&&(o=a,s=d)}return{found:null,best:o,bestRatio:s}}function fp(e,n,t){if(Wt(e,n)>=t)return null;let r=fe(e,n[0]??gr),o=dp(r,Is,n,t),s=dp(r,gr,n,t);if(o.found&&s.found){let i=Math.abs(ft(o.found)-ft(r)),a=Math.abs(ft(s.found)-ft(r));return fr(i<=a?o.found:s.found)}return o.found||s.found?fr(o.found??s.found):fr(o.bestRatio>=s.bestRatio?o.best:s.best)}var Fs={bg:"var(--hl-src-bg)",surface:"var(--hl-src-surface)",raised:"var(--hl-src-raised)",text:"var(--hl-src-text)",muted:"var(--hl-src-muted)",line:"var(--hl-src-line)",accent:"var(--hl-src-accent)",accentInk:"var(--hl-src-accent-ink)",ok:"var(--hl-src-ok)",warn:"var(--hl-src-warn)"},Bs=["--hl-on-accent","--hl-text-ink","--hl-muted-ink","--hl-bg-text-ink","--hl-bg-muted-ink","--hl-ok-ink","--hl-warn-ink","--hl-accent-text-ink","--hl-edge-ink","--hl-focus-ink"],Ce=4.5,gp=3;function bp(){return Object.fromEntries(Bs.map(e=>[e,null]))}function br(e){let n=ze(e);return n&&n.a>0?n:null}function yp(e){let n=e.dark?cp():up(),t=br(e.accent),r=!t&&e.accent!==""&&ze(e.accent)===null;if(!t&&!r)return bp();let o=br(e.bg),s=o?fe(o,n):null,i=s??n,a=br(e.surface),d=br(e.raised),c=a?fe(a,i):i,h=d?fe(d,c):c,p=[c,h],g=[s??c],y=[...p,...s?[s]:[]],E=t?Hs(c,fe(t,c),.22):c,A=bp();if(t){let U=y.map(I=>fe(t,I));A["--hl-on-accent"]=mp(U,ze(e.accentInk),Ce)}let S=(U,I,X,j)=>{let Pe=ze(I);Pe?A[U]=fp(Pe,X,j):A[U]=I===""?null:Ns(X)};return S("--hl-text-ink",e.text,[...y,E],Ce),S("--hl-muted-ink",e.muted,y,Ce),S("--hl-bg-text-ink",e.text,g,Ce),S("--hl-bg-muted-ink",e.muted,g,Ce),S("--hl-ok-ink",e.ok,p,Ce),S("--hl-warn-ink",e.warn,p,Ce),S("--hl-accent-text-ink",e.accent,y,Ce),S("--hl-edge-ink",e.line,y,gp),S("--hl-focus-ink",e.accent,y,gp),A}function Qy(e){let n=e?.themes;return`${e?.selectedTheme?.theme??n?.theme??""}|${n?.darkMode===!1?"light":"dark"}`}var ev=/^(rgba?\(|color\(\s*srgb[\s)])/i,qt;function tv(){if(qt!==void 0)return qt;try{qt=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})}catch{qt=null}return qt}var nv="unparseable";function vp(e,n,t){return e.clearRect(0,0,1,1),e.fillStyle=n,e.fillStyle=t,e.fillRect(0,0,1,1),Array.from(e.getImageData(0,0,1,1).data)}function rv(e){if(e==="transparent")return"";if(e===""||ev.test(e))return e;let n=tv();if(!n)return e;try{let[t,r,o,s]=vp(n,"#000000",e);return vp(n,"#ffffff",e).some((a,d)=>a!==[t,r,o,s][d])?nv:s===0?"":`rgba(${t}, ${r}, ${o}, ${Math.round(s/255*1e3)/1e3})`}catch{return e}}var yr=class{constructor(n){this.host=n;this.probe=null;this.observer=null;this.media=null;this.frame=0;this.signature="";this.applied="";this.onScheme=()=>this.schedule();n.addController(this)}hostConnected(){this.observer=new MutationObserver(()=>this.schedule()),this.observer.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),this.media=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):null,this.media?.addEventListener("change",this.onScheme),this.schedule()}hostDisconnected(){this.observer?.disconnect(),this.observer=null,this.media?.removeEventListener("change",this.onScheme),this.media=null,this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.probe?.remove(),this.probe=null,this.applied=""}hostUpdated(){let n=Qy(this.host.hass);n!==this.signature&&(this.signature=n,this.schedule())}refresh(){this.schedule()}schedule(){this.frame||!this.host.isConnected||(this.frame=requestAnimationFrame(()=>{this.frame=0,this.run()}))}ensureProbe(){if(this.probe?.isConnected)return this.probe;let n=document.createElement("span");n.setAttribute("aria-hidden","true"),n.style.display="none";for(let t=0;t<Object.keys(Fs).length;t+=1)n.appendChild(document.createElement("i"));return this.host.renderRoot.appendChild(n),this.probe=n,n}readAll(n){let t=Object.entries(Fs),r=Array.from(n.children);return t.forEach(([,o],s)=>{r[s].style.backgroundColor="",r[s].style.backgroundColor=o}),Object.fromEntries(t.map(([o],s)=>{let i=rv(getComputedStyle(r[s]).backgroundColor.trim()),a=ze(i);return[o,a&&a.a===0?"":i]}))}run(){if(!this.host.isConnected)return;let n=this.ensureProbe(),t={dark:this.host.hass?.themes?.darkMode!==!1,...this.readAll(n)},r=JSON.stringify(t);if(r===this.applied)return;this.applied=r;let o=yp(t);for(let s of Bs){let i=o[s];i?this.host.style.setProperty(s,i):this.host.style.removeProperty(s)}}};var wp=[K,V,T`
  :host {
    display: block;
    box-sizing: border-box;
    min-height: 100%;
    background: var(--hl-bg);
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  [hidden] {
    display: none !important;
  }
  .page {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
    min-width: 0;
  }
  .header {
    --hl-text: var(--hl-page-text);
    --hl-muted: var(--hl-page-muted);
    color: var(--hl-page-text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }
  .heading {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }
  .in-use {
    color: var(--hl-text);
    min-width: 0;
  }
  .in-use .label {
    color: var(--hl-muted);
  }
  .in-use .name {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  .swatches i.neutral {
    background: var(--hl-line);
  }
  .tabs {
    display: flex;
    width: fit-content;
    max-width: 100%;
    margin-bottom: 20px;
    overflow-x: auto;
  }
  .tabs button[aria-selected="true"] {
    background: var(--hl-accent);
    color: var(--hl-accent-ink);
    box-shadow: inset 0 0 0 1px var(--hl-focus);
  }
  .menu:focus-visible,
  .tabs button:focus-visible,
  .file-theme select:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .content {
    display: block;
    min-width: 0;
  }
  .panel {
    display: block;
    min-width: 0;
  }
  .file-theme {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 0 12px;
    font-size: 14px;
  }
  .file-theme .file-status {
    color: var(--hl-muted);
  }
  .file-theme .file-status.error {
    color: var(--error-color, #db4437);
  }
  .file-theme select {
    padding: 6px 10px;
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-sm);
    background: var(--hl-surface);
    color: inherit;
    font: inherit;
  }
  @media (max-width: 599px) {
    .page {
      padding: 16px;
    }
  }
`,qd];function vr(e,n){if(!e||typeof e!="object")return"";let t=e[n];return typeof t=="string"?t:""}function xp(e,n,t){if(!e||typeof e!="object")return"";let r=e,o=r.modes,s=t?["dark","light"]:["light","dark"];return vr(o?.[s[0]],n)||vr(r,n)||vr(r.vars,n)||vr(o?.[s[1]],n)}function kp(e){let n=e?.selectedTheme?.theme??e?.themes?.theme??"default",t=e?.themes?.themes,o=t&&Object.prototype.hasOwnProperty.call(t,n)?t[n]:void 0,s=e?.themes?.darkMode!==!1;return{name:n,primary:xp(o,"primary-color",s),accent:xp(o,"accent-color",s)}}var J={shell:{title:"Themes",tabs:{browse:"Gallery",preview:"Preview",designer:"Designer",people:"People",mods:"Mods"},tabList:"HATS Lite sections",inUse:"In use",menu:"Open navigation menu",fileTheme:"Theme in file",fileLoading:"Loading theme...",fileError:"Could not load this theme.",resetApplied:"The removed theme was in use, so the Home Assistant theme is applied now"},browse:b,preview:f,designer:v};var ge=e=>`tab-${e}`,Ke=e=>`panel-${e}`;function $p(e,n,t,r){return l`
    <nav class="tabs seg" role="tablist" aria-label=${J.shell.tabList} @keydown=${r}>
      ${e.map(o=>{let s=n===o;return l`
          <button
            type="button"
            role="tab"
            id=${ge(o)}
            aria-controls=${Ke(o)}
            aria-selected=${s?"true":"false"}
            tabindex=${s?"0":"-1"}
            @click=${()=>t(o)}
          >
            ${J.shell.tabs[o]}
          </button>
        `})}
    </nav>
  `}function Ep(e){let n=kp(e),t=r=>r?l`<i style=${se({background:r})}></i>`:l`<i class="neutral"></i>`;return l`
    <span class="chip in-use">
      <span class="label">${J.shell.inUse}</span>
      <span class="name">${n.name}</span>
      <span class="swatches" aria-hidden="true">${t(n.primary)}${t(n.accent)}</span>
    </span>
  `}var Tp=l`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;function _p(e,n,t){switch(e){case"ArrowRight":return(n+1)%t;case"ArrowLeft":return(n-1+t)%t;case"Home":return 0;case"End":return t-1;default:return null}}function ov(e){return e==="loading"?l`<span class="file-status" role="status">${J.shell.fileLoading}</span>`:e==="error"?l`<span class="file-status error" role="alert">${J.shell.fileError}</span>`:u}function Sp(e,n,t,r){return e.length<2?u:l`
    <label class="file-theme">
      ${J.shell.fileTheme}
      <select @change=${r}>
        ${e.map(o=>l`<option value=${o} ?selected=${o===n}>${o}</option>`)}
      </select>
      ${ov(t)}
    </label>
  `}function Mp(e){return l`<p class="notice" role="status">${e}</p>`}function Ap(e){return l`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${e.narrow?l`<button class="menu" type="button" aria-label=${J.shell.menu} @click=${e.onMenu}>${Tp}</button>`:u}
          <h1 class="title">${J.shell.title}</h1>
        </div>
        ${Ep(e.hass)}
      </header>
      ${$p(e.tabs,e.tab,n=>e.select(n,!0),e.onTabKey)}
      ${e.resetNotice?Mp(e.resetNotice):u}
      <main
        class="content"
        @hats-lite-theme-selected=${e.onThemeSelected}
        @hats-lite-theme-saved=${e.onThemeSaved}
        @hats-lite-preview-theme=${e.onPreviewTheme}
        @hats-lite-mod-opened=${e.onModOpened}
        @hats-lite-mod-closed=${e.onModClosed}
      >
        <section
          class="panel"
          id=${Ke("browse")}
          role="tabpanel"
          aria-labelledby=${ge("browse")}
          tabindex="-1"
          ?hidden=${e.tab!=="browse"}
        >
          <hats-lite-browse
            .hass=${e.hass}
            .installedThemes=${e.installedNames}
            .currentTheme=${e.hass?.selectedTheme?.theme??e.hass?.themes?.theme??"default"}
            .darkMode=${e.hass?.themes?.darkMode}
          ></hats-lite-browse>
        </section>
        <section
          class="panel"
          id=${Ke("preview")}
          role="tabpanel"
          aria-labelledby=${ge("preview")}
          tabindex="-1"
          ?hidden=${e.tab!=="preview"}
        >
          ${e.rendered.has("preview")?l`${Sp(te(e.fileNames,e.chosenName),e.chosenName,e.fileStatus,e.onFileThemeChange)}
              <hats-lite-preview
                .hass=${e.hass}
                .candidate=${e.candidate}
                .mode=${e.previewMode}
                .nav=${e.navigator.model()}
                .install=${sp(e.entry,e.candidate)}
                .uninstall=${ip(e.entry,e.candidate)}
                @hats-lite-mode-change=${e.onPreviewMode}
                @hats-lite-preview-nav=${e.onNav}
                @hats-lite-theme-installed=${e.onInstalled}
              ></hats-lite-preview>`:u}
        </section>
        <section
          class="panel"
          id=${Ke("designer")}
          role="tabpanel"
          aria-labelledby=${ge("designer")}
          tabindex="-1"
          ?hidden=${e.tab!=="designer"}
        >
          ${e.rendered.has("designer")?l`<hats-lite-designer .hass=${e.hass}></hats-lite-designer>`:u}
        </section>
        <section class="panel" id=${Ke("people")} role="tabpanel" aria-labelledby=${ge("people")} tabindex="-1" ?hidden=${e.tab!=="people"}>
          ${e.rendered.has("people")&&e.peopleOk?l`<hats-lite-people .hass=${e.hass}></hats-lite-people>`:u}
        </section>
        <section class="panel" id=${Ke("mods")} role="tabpanel" aria-labelledby=${ge("mods")} tabindex="-1" ?hidden=${e.tab!=="mods"}>
          ${e.rendered.has("mods")&&e.modsOk?l`<hats-lite-mods .hass=${e.hass} .active=${e.tab==="mods"} .deepLink=${e.modsLink}></hats-lite-mods>`:u}
        </section>
      </main>
      </div>
    `}function Cp(e,n,t){return e!==void 0?e:n!==void 0&&t.includes(n)}var Pp="/themes",sv="/hats-lite",iv=/^(\/[a-z]*\/?)?$/,av=["owner","repository","category"],lv="hats-lite-panel",wr=class{constructor(n){this.host=n;this.prefix=null;this.applying=!1;this.pending=null}read(n){if(this.pending=null,typeof n!="object"||n===null)return;let{prefix:t,path:r}=n;if(Cs(t)){if(t===sv){if(this.host.hass()===void 0){this.pending=n;return}if(this.hasOurThemesPanel()){this.redirectLegacy(r);return}}this.prefix=t,this.settle(As(r,window.location.search))}}retry(){let n=this.pending;n!==null&&this.read(n)}go(n,t=null,r=!1){if(this.applying||this.prefix===null)return;let o=cr(this.prefix,n,t);o!==window.location.pathname+window.location.search&&this.write(o,r)}settle(n){let t=this.apply(n);this.go(t.tab,t.item,!0)}apply(n){this.applying=!0;try{return this.host.apply(n)??n}finally{this.applying=!1}}hasOurThemesPanel(){let n=this.host.hass()?.panels;return typeof n!="object"||n===null||!Object.prototype.hasOwnProperty.call(n,"themes")?!1:n.themes?.config?._panel_custom?.name===lv}redirectLegacy(n){let t=window.location.search,r=new URLSearchParams(t),o=typeof n=="string"&&iv.test(n)?As(n,t):null,s=o!==null&&o.item===null&&av.some(a=>r.has(a)),i=o===null||s?cr(Pp,"browse"):cr(Pp,o.tab,o.item);this.write(i,!0)}write(n,t){t?window.history.replaceState(null,"",n):window.history.pushState(null,"",n),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:t}}))}};var dv=100,cv=50;function uv(e){return new Promise(n=>setTimeout(n,e))}async function Rp(e,n){for(let t=0;t<cv;t+=1){if(!n())return null;let r=e();if(r&&(await r.updateComplete,r.loaded))return r;await uv(dv)}return null}function pv(e,n){return e.find(t=>ur(je(t.full_name,"theme"),n))??null}async function Dp(e,n,t){try{let r=await e.openEntry(n);return t()?Object.keys(r?.themes??{}).length>0?{status:"opened",detail:r}:{status:"missing"}:{status:"stale"}}catch{return t()?{status:"missing"}:{status:"stale"}}}async function Lp(e,n,t){let r=await Rp(t,n);if(!n())return{status:"stale"};let o=r?pv(r.entries,e):null;return!r||!o?{status:"missing"}:Dp(r,o,n)}async function Op(e,n){let t=await Rp(n,e);if(!e())return{status:"stale"};let r=t?.visibleEntries()[0];return!t||!r?{status:"missing"}:Dp(t,r,e)}var Ip=4,hv={tab:"browse",item:null,canonical:!0},xr=class{constructor(n){this.host=n;this.probes={people:!1,mods:!1};this.waiting=null;this.linkToken=0;this.liveDeep=null;this.linkRun=Promise.resolve();this.running=0;this.visited=!1;this.retries=0;this.gone=!1;this.timer=null;this.router=new wr({apply:t=>this.apply(t),hass:()=>n.hass()})}read(n){this.router.read(n)}hassChanged(){this.router.retry(),this.settle()}attach(){this.gone=!1}dispose(){this.gone=!0,this.cancel(),this.timer!==null&&clearTimeout(this.timer),this.timer=null}settle(){if(this.gone)return;if(this.host.tab()!=="preview"){this.visited=!1,this.retries=0;return}if(this.visited||this.running>0||this.retries>=Ip||this.host.previewing())return;this.host.gallery()?.loaded&&this.openFirst()}later(){this.timer!==null||this.retries>=Ip||(this.timer=setTimeout(()=>{this.timer=null,this.visited=!1,this.settle()},1500))}go(n,t=null,r=!1){this.cancel(),this.router.go(n,t,r)}choose(n,t,r){let o=this.host.tab()!==n;o&&(this.visited=!1,this.retries=0),this.host.show(n),this.go(n,t),r&&o&&n==="preview"&&this.openFirst()}probed(n,t){this.probes[n]=!0;let r=this.waiting;r?.tab===n?(this.waiting=null,this.host.tabs().includes(n)?this.showRoute(r):this.fallback()):!t&&this.host.tab()===n&&this.fallback()}cancel(){this.linkToken+=1,this.waiting=null}apply(n){return(n.tab!=="preview"||n.item!==null)&&(this.linkToken+=1),this.waiting=null,this.probing(n.tab)?(this.waiting=n,this.host.show("browse"),this.host.setModsLink(null),n):this.host.tabs().includes(n.tab)?(this.showRoute(n),n):(this.host.show("browse"),this.host.setModsLink(null),hv)}showRoute(n){let t=this.host.tab()!==n.tab;t&&(this.visited=!1,this.retries=0),this.host.show(n.tab),this.host.setModsLink(n.tab==="mods"?n.item:null),n.tab==="preview"&&(n.item!==null?(!this.host.previewing()||!ur(n.item,this.host.previewed()))&&this.startLink(n.item):t&&!this.host.previewing()&&this.openFirst())}probing(n){return(n==="people"||n==="mods")&&!this.probes[n]}fallback(){this.host.show("browse"),this.router.go("browse",null,!0)}openFirst(){this.host.previewing()||this.liveDeep!==null&&this.liveDeep===this.linkToken||this.startLink(null)}startLink(n){let t=++this.linkToken;this.visited=!0,this.running+=1,n===null&&(this.retries+=1),n!==null&&(this.liveDeep=t),this.linkRun=this.linkRun.then(()=>this.runLink(n,t)).catch(()=>{})}async runLink(n,t){let r=()=>t===this.linkToken,o=()=>this.host.gallery();try{let s=n===null?await Op(r,o):await Lp(n,r,o);if(s.status==="opened"){let i=je(s.detail.entry.full_name,"theme");this.host.openLinked(s.detail,i),this.router.go("preview",i,!0)}else s.status==="missing"&&n!==null?this.fallback():n===null&&(this.visited=!1,this.later())}catch{n!==null?r()&&this.fallback():(this.visited=!1,this.later())}finally{this.running-=1,this.liveDeep===t&&(this.liveDeep=null)}}};var Us=class extends M{constructor(){super(...arguments);this.narrow=!1;this.tab="browse";this.entry=null;this.fileThemes={};this.fileNames=[];this.fileStatus="";this.chosenName="";this.candidate=null;this.peopleOk=!0;this.modsOk=!1;this.modsLink=null;this.resetNotice="";this.ink=new yr(this);this.probed=!1;this.previewItem=null;this.installedNames=[];this.bundles=new Je;this.known=new qe;this.pickToken=0;this.routes=new xr({tabs:()=>this.tabs,tab:()=>this.tab,hass:()=>this.hass,show:t=>this.showTab(t),setModsLink:t=>{this.modsLink=t},previewing:()=>this.candidate!==null,previewed:()=>this.previewItem,gallery:()=>this.gallery(),openLinked:(t,r)=>{this.openDetail(t),this.previewItem=r}});this.rendered=new Set(["browse"]);this.onTabKey=t=>{let r=this.tabs,o=_p(t.key,r.indexOf(this.tab),r.length);if(o===null)return;t.preventDefault();let s=r[o];this.select(s,!0),this.focusTab(s)};this.onMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};this.navigator=new hr({open:t=>{let r=this.gallery();return r?r.openEntry(r.entries.find(o=>o.full_name===t.full_name)??t):Promise.reject(new Error("gallery missing"))},apply:t=>this.showBundle(t),onChange:()=>this.requestUpdate()});this.onThemeSelected=t=>{let r=t.detail;Object.keys(r?.themes??{}).length!==0&&(this.openDetail(r),this.previewItem=je(r.entry.full_name,"theme"),this.select("preview"),this.focusTab("preview"))};this.onPreviewTheme=t=>{let r=t.detail,o=pr(this.hass,r?.theme,r?.dark);o&&(this.navigator.clear(),this.showUnlisted(o.candidate,o.mode),this.select("preview"),this.focusTab("preview"))};this.onModOpened=t=>{let r=t.detail;this.routes.go("mods",je(r?.fullName,r?.category))};this.onModClosed=()=>{this.routes.go("mods",null)};this.onNav=t=>{let r=t.detail?.direction;(r===1||r===-1)&&this.navigator.move(r)};this.onInstalled=async t=>{let r=t.detail,o=r?.fullName,s=this.entry?.full_name===o?this.fileNames:[];r?.removed&&Cp(r.resetSelected,this.hass?.themes?.theme,s)&&(this.setTheme(Ze),this.resetNotice=J.shell.resetApplied);let a=(await this.gallery()?.refreshCatalog())?.find(d=>d.full_name===o);a&&this.entry?.full_name===o&&(this.entry=a,this.refreshCandidate())};this.onPreviewMode=t=>{let r=t.detail?.mode;r&&(this.previewMode=r)};this.onFileThemeChange=t=>{let r=t.target.value;if(Object.prototype.hasOwnProperty.call(this.fileThemes,r)){this.pickToken+=1,this.fileStatus="",this.setCandidate(r);return}this.fetchFileTheme(r)};this.onThemeSaved=t=>{let r=t.detail;typeof r?.name=="string"&&(this.setTheme(r.name),this.select("preview"))}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0},entry:{state:!0},fileThemes:{state:!0},fileNames:{state:!0},fileStatus:{state:!0},chosenName:{state:!0},candidate:{state:!0},previewMode:{state:!0},peopleOk:{state:!0},modsOk:{state:!0},modsLink:{state:!0},resetNotice:{state:!0}}}static{this.styles=wp}get tabs(){return Ms.filter(t=>t==="people"?this.peopleOk:t==="mods"?this.modsOk:!0)}showTab(t){this.rendered.add(t),this.resetNotice="",this.tab=t}select(t,r=!1){this.routes.choose(t,t==="preview"?this.previewItem:null,r)}onProbe(t,r){t==="people"?this.peopleOk=r:this.modsOk=r,this.routes.probed(t,r)}async focusTab(t){await this.updateComplete,this.renderRoot.querySelector(`#${ge(t)}`)?.focus()}connectedCallback(){super.connectedCallback(),this.routes.attach()}disconnectedCallback(){super.disconnectedCallback(),this.routes.dispose(),this.navigator.clear()}willUpdate(t){if(t.has("route")&&this.routes.read(this.route),!t.has("hass"))return;this.routes.hassChanged(),this.hass&&!this.probed&&(this.probed=!0,fs(this.hass).then(o=>this.onProbe("mods",o)),Yc(this.hass).then(o=>this.onProbe("people",o)));let r=Object.keys(this.hass?.themes?.themes??{});cn(r,this.installedNames)||(this.installedNames=r),this.candidate&&this.refreshCandidate()}build(t){return op(this.entry,this.fileThemes,t,this.hass,this.installedNames)}refreshCandidate(){let t=this.candidate;if(t&&!this.entry){this.candidate=ap(this.hass,t,this.previewMode),this.chosenName=this.candidate?this.chosenName:"";return}let r=this.build(this.chosenName);t&&r&&!Rs(t,r)&&(this.candidate=r)}setCandidate(t){let r=this.build(t);r&&([this.chosenName,this.candidate]=[t,r])}gallery(){return this.renderRoot.querySelector("hats-lite-browse")}showUnlisted(t,r){this.pickToken+=1,this.fileStatus="",this.entry=null,this.fileThemes={},this.fileNames=[],this.chosenName=t.name,this.candidate=t,this.previewMode=r,this.previewItem=null}setTheme(t){let r=this.hass?.themes?.darkMode;this.dispatchEvent(new CustomEvent("settheme",{bubbles:!0,composed:!0,detail:Zn(r===void 0?{theme:t}:{theme:t,dark:r})}))}showBundle(t){if(Tt(t?.entry))return this.showUnlisted(pa(),this.previewMode);let r=Object.keys(t?.themes??{});if(r.length===0)return;let o=t.theme&&r.includes(t.theme)?t.theme:te(r)[0]??r[0];this.pickToken+=1,this.fileStatus="",this.entry=t.entry,this.fileThemes=t.themes,this.fileNames=[...new Set([...t.names??[],...r])],this.bundles.set(t.entry,o,{themes:t.themes,names:this.fileNames,theme:o}),this.setCandidate(o)}openDetail(t){let r=this.gallery();this.previewMode=t.mode??r?.mode,this.navigator.start(r?.visibleEntries()??[],t.entry),this.showBundle(t)}async fetchFileTheme(t){let r=this.entry;if(!r)return;let o=++this.pickToken;this.fileStatus="loading";try{let s=await eo(this.hass,this.known,this.bundles,r,t);if(o!==this.pickToken||r!==this.entry)return;this.fileStatus="",this.fileThemes=s.themes,this.setCandidate(t)}catch{o===this.pickToken&&(this.fileStatus="error")}}render(){return Ap(this)}};customElements.get("hats-lite-panel")||customElements.define("hats-lite-panel",Us);export{Us as HatsLitePanel};

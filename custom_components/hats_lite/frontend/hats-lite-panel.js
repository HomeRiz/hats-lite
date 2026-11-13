var Jt=globalThis,Qt=Jt.ShadowRoot&&(Jt.ShadyCSS===void 0||Jt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,_r=Symbol(),Yi=new WeakMap,wt=class{constructor(n,t,r){if(this._$cssResult$=!0,r!==_r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=n,this.t=t}get styleSheet(){let n=this.o,t=this.t;if(Qt&&n===void 0){let r=t!==void 0&&t.length===1;r&&(n=Yi.get(t)),n===void 0&&((this.o=n=new CSSStyleSheet).replaceSync(this.cssText),r&&Yi.set(t,n))}return n}toString(){return this.cssText}},en=e=>new wt(typeof e=="string"?e:e+"",void 0,_r),T=(e,...n)=>{let t=e.length===1?e[0]:n.reduce((r,o,i)=>r+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1],e[0]);return new wt(t,e,_r)},Xi=(e,n)=>{if(Qt)e.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of n){let r=document.createElement("style"),o=Jt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=t.cssText,e.appendChild(r)}},Sr=Qt?e=>e:e=>e instanceof CSSStyleSheet?(n=>{let t="";for(let r of n.cssRules)t+=r.cssText;return en(t)})(e):e;var{is:Vp,defineProperty:Wp,getOwnPropertyDescriptor:qp,getOwnPropertyNames:Gp,getOwnPropertySymbols:Yp,getPrototypeOf:Xp}=Object,tn=globalThis,Zi=tn.trustedTypes,Zp=Zi?Zi.emptyScript:"",Jp=tn.reactiveElementPolyfillSupport,xt=(e,n)=>e,Ar={toAttribute(e,n){switch(n){case Boolean:e=e?Zp:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,n){let t=e;switch(n){case Boolean:t=e!==null;break;case Number:t=e===null?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch{t=null}}return t}},Qi=(e,n)=>!Vp(e,n),Ji={attribute:!0,type:String,converter:Ar,reflect:!1,useDefault:!1,hasChanged:Qi};Symbol.metadata??=Symbol("metadata"),tn.litPropertyMetadata??=new WeakMap;var ce=class extends HTMLElement{static addInitializer(n){this._$Ei(),(this.l??=[]).push(n)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(n,t=Ji){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(n)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(n,t),!t.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(n,r,t);o!==void 0&&Wp(this.prototype,n,o)}}static getPropertyDescriptor(n,t,r){let{get:o,set:i}=qp(this.prototype,n)??{get(){return this[t]},set(s){this[t]=s}};return{get:o,set(s){let a=o?.call(this);i?.call(this,s),this.requestUpdate(n,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(n){return this.elementProperties.get(n)??Ji}static _$Ei(){if(this.hasOwnProperty(xt("elementProperties")))return;let n=Xp(this);n.finalize(),n.l!==void 0&&(this.l=[...n.l]),this.elementProperties=new Map(n.elementProperties)}static finalize(){if(this.hasOwnProperty(xt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(xt("properties"))){let t=this.properties,r=[...Gp(t),...Yp(t)];for(let o of r)this.createProperty(o,t[o])}let n=this[Symbol.metadata];if(n!==null){let t=litPropertyMetadata.get(n);if(t!==void 0)for(let[r,o]of t)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let o=this._$Eu(t,r);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(n){let t=[];if(Array.isArray(n)){let r=new Set(n.flat(1/0).reverse());for(let o of r)t.unshift(Sr(o))}else n!==void 0&&t.push(Sr(n));return t}static _$Eu(n,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof n=="string"?n.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(n=>n(this))}addController(n){(this._$EO??=new Set).add(n),this.renderRoot!==void 0&&this.isConnected&&n.hostConnected?.()}removeController(n){this._$EO?.delete(n)}_$E_(){let n=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(n.set(r,this[r]),delete this[r]);n.size>0&&(this._$Ep=n)}createRenderRoot(){let n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Xi(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(n=>n.hostConnected?.())}enableUpdating(n){}disconnectedCallback(){this._$EO?.forEach(n=>n.hostDisconnected?.())}attributeChangedCallback(n,t,r){this._$AK(n,r)}_$ET(n,t){let r=this.constructor.elementProperties.get(n),o=this.constructor._$Eu(n,r);if(o!==void 0&&r.reflect===!0){let i=(r.converter?.toAttribute!==void 0?r.converter:Ar).toAttribute(t,r.type);this._$Em=n,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(n,t){let r=this.constructor,o=r._$Eh.get(n);if(o!==void 0&&this._$Em!==o){let i=r.getPropertyOptions(o),s=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Ar;this._$Em=o;let a=s.fromAttribute(t,i.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(n,t,r,o=!1,i){if(n!==void 0){let s=this.constructor;if(o===!1&&(i=this[n]),r??=s.getPropertyOptions(n),!((r.hasChanged??Qi)(i,t)||r.useDefault&&r.reflect&&i===this._$Ej?.get(n)&&!this.hasAttribute(s._$Eu(n,r))))return;this.C(n,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(n,t,{useDefault:r,reflect:o,wrapped:i},s){r&&!(this._$Ej??=new Map).has(n)&&(this._$Ej.set(n,s??t??this[n]),i!==!0||s!==void 0)||(this._$AL.has(n)||(this.hasUpdated||r||(t=void 0),this._$AL.set(n,t)),o===!0&&this._$Em!==n&&(this._$Eq??=new Set).add(n))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let n=this.scheduleUpdate();return n!=null&&await n,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,i]of r){let{wrapped:s}=i,a=this[o];s!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,i,a)}}let n=!1,t=this._$AL;try{n=this.shouldUpdate(t),n?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw n=!1,this._$EM(),r}n&&this._$AE(t)}willUpdate(n){}_$AE(n){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(n)),this.updated(n)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(n){return!0}update(n){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(n){}firstUpdated(n){}};ce.elementStyles=[],ce.shadowRootOptions={mode:"open"},ce[xt("elementProperties")]=new Map,ce[xt("finalized")]=new Map,Jp?.({ReactiveElement:ce}),(tn.reactiveElementVersions??=[]).push("2.1.2");var Lr=globalThis,es=e=>e,nn=Lr.trustedTypes,ts=nn?nn.createPolicy("lit-html",{createHTML:e=>e}):void 0,as="$lit$",ye=`lit$${Math.random().toFixed(9).slice(2)}$`,ls="?"+ye,Qp=`<${ls}>`,Le=document,$t=()=>Le.createComment(""),Et=e=>e===null||typeof e!="object"&&typeof e!="function",Ir=Array.isArray,eh=e=>Ir(e)||typeof e?.[Symbol.iterator]=="function",Mr=`[ 	
\f\r]`,kt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ns=/-->/g,rs=/>/g,De=RegExp(`>|${Mr}(?:([^\\s"'>=/]+)(${Mr}*=${Mr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),os=/'/g,is=/"/g,ds=/^(?:script|style|textarea|title)$/i,Hr=e=>(n,...t)=>({_$litType$:e,strings:n,values:t}),l=Hr(1),cs=Hr(2),Pv=Hr(3),ue=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),ss=new WeakMap,Oe=Le.createTreeWalker(Le,129);function us(e,n){if(!Ir(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ts!==void 0?ts.createHTML(n):n}var th=(e,n)=>{let t=e.length-1,r=[],o,i=n===2?"<svg>":n===3?"<math>":"",s=kt;for(let a=0;a<t;a++){let d=e[a],u,m,p=-1,g=0;for(;g<d.length&&(s.lastIndex=g,m=s.exec(d),m!==null);)g=s.lastIndex,s===kt?m[1]==="!--"?s=ns:m[1]!==void 0?s=rs:m[2]!==void 0?(ds.test(m[2])&&(o=RegExp("</"+m[2],"g")),s=De):m[3]!==void 0&&(s=De):s===De?m[0]===">"?(s=o??kt,p=-1):m[1]===void 0?p=-2:(p=s.lastIndex-m[2].length,u=m[1],s=m[3]===void 0?De:m[3]==='"'?is:os):s===is||s===os?s=De:s===ns||s===rs?s=kt:(s=De,o=void 0);let v=s===De&&e[a+1].startsWith("/>")?" ":"";i+=s===kt?d+Qp:p>=0?(r.push(u),d.slice(0,p)+as+d.slice(p)+ye+v):d+ye+(p===-2?a:v)}return[us(e,i+(e[t]||"<?>")+(n===2?"</svg>":n===3?"</math>":"")),r]},Tt=class e{constructor({strings:n,_$litType$:t},r){let o;this.parts=[];let i=0,s=0,a=n.length-1,d=this.parts,[u,m]=th(n,t);if(this.el=e.createElement(u,r),Oe.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(o=Oe.nextNode())!==null&&d.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let p of o.getAttributeNames())if(p.endsWith(as)){let g=m[s++],v=o.getAttribute(p).split(ye),E=/([.?@])?(.*)/.exec(g);d.push({type:1,index:i,name:E[2],strings:v,ctor:E[1]==="."?Pr:E[1]==="?"?Rr:E[1]==="@"?Dr:Ge}),o.removeAttribute(p)}else p.startsWith(ye)&&(d.push({type:6,index:i}),o.removeAttribute(p));if(ds.test(o.tagName)){let p=o.textContent.split(ye),g=p.length-1;if(g>0){o.textContent=nn?nn.emptyScript:"";for(let v=0;v<g;v++)o.append(p[v],$t()),Oe.nextNode(),d.push({type:2,index:++i});o.append(p[g],$t())}}}else if(o.nodeType===8)if(o.data===ls)d.push({type:2,index:i});else{let p=-1;for(;(p=o.data.indexOf(ye,p+1))!==-1;)d.push({type:7,index:i}),p+=ye.length-1}i++}}static createElement(n,t){let r=Le.createElement("template");return r.innerHTML=n,r}};function qe(e,n,t=e,r){if(n===ue)return n;let o=r!==void 0?t._$Co?.[r]:t._$Cl,i=Et(n)?void 0:n._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(e),o._$AT(e,t,r)),r!==void 0?(t._$Co??=[])[r]=o:t._$Cl=o),o!==void 0&&(n=qe(e,o._$AS(e,n.values),o,r)),n}var Cr=class{constructor(n,t){this._$AV=[],this._$AN=void 0,this._$AD=n,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(n){let{el:{content:t},parts:r}=this._$AD,o=(n?.creationScope??Le).importNode(t,!0);Oe.currentNode=o;let i=Oe.nextNode(),s=0,a=0,d=r[0];for(;d!==void 0;){if(s===d.index){let u;d.type===2?u=new _t(i,i.nextSibling,this,n):d.type===1?u=new d.ctor(i,d.name,d.strings,this,n):d.type===6&&(u=new Or(i,this,n)),this._$AV.push(u),d=r[++a]}s!==d?.index&&(i=Oe.nextNode(),s++)}return Oe.currentNode=Le,o}p(n){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(n,r,t),t+=r.strings.length-2):r._$AI(n[t])),t++}},_t=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(n,t,r,o){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=n,this._$AB=t,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let n=this._$AA.parentNode,t=this._$AM;return t!==void 0&&n?.nodeType===11&&(n=t.parentNode),n}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(n,t=this){n=qe(this,n,t),Et(n)?n===c||n==null||n===""?(this._$AH!==c&&this._$AR(),this._$AH=c):n!==this._$AH&&n!==ue&&this._(n):n._$litType$!==void 0?this.$(n):n.nodeType!==void 0?this.T(n):eh(n)?this.k(n):this._(n)}O(n){return this._$AA.parentNode.insertBefore(n,this._$AB)}T(n){this._$AH!==n&&(this._$AR(),this._$AH=this.O(n))}_(n){this._$AH!==c&&Et(this._$AH)?this._$AA.nextSibling.data=n:this.T(Le.createTextNode(n)),this._$AH=n}$(n){let{values:t,_$litType$:r}=n,o=typeof r=="number"?this._$AC(n):(r.el===void 0&&(r.el=Tt.createElement(us(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(t);else{let i=new Cr(o,this),s=i.u(this.options);i.p(t),this.T(s),this._$AH=i}}_$AC(n){let t=ss.get(n.strings);return t===void 0&&ss.set(n.strings,t=new Tt(n)),t}k(n){Ir(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,o=0;for(let i of n)o===t.length?t.push(r=new e(this.O($t()),this.O($t()),this,this.options)):r=t[o],r._$AI(i),o++;o<t.length&&(this._$AR(r&&r._$AB.nextSibling,o),t.length=o)}_$AR(n=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);n!==this._$AB;){let r=es(n).nextSibling;es(n).remove(),n=r}}setConnected(n){this._$AM===void 0&&(this._$Cv=n,this._$AP?.(n))}},Ge=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(n,t,r,o,i){this.type=1,this._$AH=c,this._$AN=void 0,this.element=n,this.name=t,this._$AM=o,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=c}_$AI(n,t=this,r,o){let i=this.strings,s=!1;if(i===void 0)n=qe(this,n,t,0),s=!Et(n)||n!==this._$AH&&n!==ue,s&&(this._$AH=n);else{let a=n,d,u;for(n=i[0],d=0;d<i.length-1;d++)u=qe(this,a[r+d],t,d),u===ue&&(u=this._$AH[d]),s||=!Et(u)||u!==this._$AH[d],u===c?n=c:n!==c&&(n+=(u??"")+i[d+1]),this._$AH[d]=u}s&&!o&&this.j(n)}j(n){n===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,n??"")}},Pr=class extends Ge{constructor(){super(...arguments),this.type=3}j(n){this.element[this.name]=n===c?void 0:n}},Rr=class extends Ge{constructor(){super(...arguments),this.type=4}j(n){this.element.toggleAttribute(this.name,!!n&&n!==c)}},Dr=class extends Ge{constructor(n,t,r,o,i){super(n,t,r,o,i),this.type=5}_$AI(n,t=this){if((n=qe(this,n,t,0)??c)===ue)return;let r=this._$AH,o=n===c&&r!==c||n.capture!==r.capture||n.once!==r.once||n.passive!==r.passive,i=n!==c&&(r===c||o);o&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,n),this._$AH=n}handleEvent(n){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,n):this._$AH.handleEvent(n)}},Or=class{constructor(n,t,r){this.element=n,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(n){qe(this,n)}};var nh=Lr.litHtmlPolyfillSupport;nh?.(Tt,_t),(Lr.litHtmlVersions??=[]).push("3.3.3");var ps=(e,n,t)=>{let r=t?.renderBefore??n,o=r._$litPart$;if(o===void 0){let i=t?.renderBefore??null;r._$litPart$=o=new _t(n.insertBefore($t(),i),i,void 0,t??{})}return o._$AI(e),o};var Nr=globalThis,A=class extends ce{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let n=super.createRenderRoot();return this.renderOptions.renderBefore??=n.firstChild,n}update(n){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(n),this._$Do=ps(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ue}};A._$litElement$=!0,A.finalized=!0,Nr.litElementHydrateSupport?.({LitElement:A});var rh=Nr.litElementPolyfillSupport;rh?.({LitElement:A});(Nr.litElementVersions??=[]).push("4.2.2");function P(e,n){return e.connection.sendMessagePromise(n)}var hs="hats-lite-theme-selected",ms="hats-lite-theme-saved",fs="hats-lite-mode-change",Fr="hats_lite_catalog",Br="/api/hats_lite/background";var gs=["image/png","image/jpeg","image/webp","image/gif"];var b={title:"Themes",searchLabel:"Search themes",searchPlaceholder:"Search themes",loading:"Loading themes...",loadError:"Could not load the theme list.",cachedNote:"Showing the saved list from your last successful load.",noThemes:"No themes available.",retry:"Try again",previewsLoading:"Loading previews",apply:"Apply",noMatches:"No themes match your search.",noFilterMatches:"No themes match this filter yet. Previews load as you scroll.",installed:"Installed",inUse:"In use",otherCopy:"Other copy installed",licenseUnknown:"License unknown to HATS Lite",licenseShort:"License unknown",licenseKnown:"License detected when the thumbnails were built",starsLabel:"Stars",starGlyph:"★",themeErrorDefault:"Could not open this theme. Try again.",preview:"Preview",defaultName:"Home Assistant",defaultDescription:"The standard Home Assistant look",openPreview:"Open preview of",filterLabel:"Filter themes",filterAll:"All",filterInstalled:"Installed",filterDark:"Dark",filterLight:"Light",filterGlass:"Glass",thumbUnavailable:"Preview not available",thumbRateLimited:"Rate limited, try again later",thumbLoading:"Loading preview",thumbRoom:"Living room thermostat",thumbTemp:"20.5 °C",thumbHeating:"Heating to 21",thumbEnergy:"Energy today",thumbGarage:"Garage door",thumbClosed:"Closed",thumbLocked:"Locked since 18:30",thumbLights:"Lights and doors",thumbLight:"Living room light",thumbDoor:"Front door",thumbPorch:"Porch timer",thumbGreeting:"Good evening",thumbSunset:"Sunset 18:42",thumbChipLight:"Light on",thumbChipFan:"Fan on",thumbChipHeat:"Heat"};function ys(e){if(!e||typeof e!="object")return null;let n=e;return typeof n.full_name!="string"?null:{full_name:n.full_name,description:typeof n.description=="string"?n.description:"",stars:typeof n.stars=="number"?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"?n.hacs_id:null}}function Ur(e){return Array.isArray(e)?e.flatMap(n=>{let t=ys(n);return t?[t]:[]}):[]}function vs(){try{let e=localStorage.getItem(Fr);if(e===null)return null;let n=JSON.parse(e);return!Array.isArray(n)||!n.every(t=>ys(t)!==null)?null:Ur(n)}catch{return null}}function ws(e){try{localStorage.setItem(Fr,JSON.stringify(e))}catch{return}}function xs(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ks(e){if(e&&typeof e=="object"&&"message"in e){let n=e.message;if(typeof n=="string"&&n)return n}return b.themeErrorDefault}function $s(e,n){return e.full_name.toLowerCase().includes(n)||e.description.toLowerCase().includes(n)}var oh=new Set(["invalid_theme","theme_too_large","not_found","invalid_request","not_in_catalog"]);function bs(e,n){if(!e||typeof e!="object"||!(n in e))return"";let t=e[n];return typeof t=="string"?t:""}function rn(e){let n=bs(e,"code");return oh.has(n)?"permanent":n==="rate_limited"||/\bstatus (403|429)\b/.test(bs(e,"message"))?"limited":"transient"}var ih=/^[A-Za-z0-9_-]+$/,sh=/[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i,ah=/['"]/,lh=["lovelace-background","background-image"];function J(e,n){return{...e.vars,...e.modes?.[n]??{}}}function dh(e){return ih.test(e)?!e.startsWith("card-mod-")&&!e.startsWith("uix-"):!1}function ch(e,n){return typeof n!="string"||sh.test(n)?!1:!ah.test(n)||lh.includes(e)}function uh(e){return Object.entries(e).filter(([n,t])=>dh(n)&&ch(n,t))}var ph=["lovelace-background","background-image"],hh=/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi,mh=/(^|[\s,/)])fixed(?=$|[\s,/(])/gi,fh=/^\s*(?:(?:fixed|scroll|local)\s*(?:,\s*|$))+$/i;function Es(e){return e.replace(mh,"$1scroll")}function gh(e){let n="",t=0;for(let r of e.matchAll(hh)){let o=r.index??0;n+=Es(e.slice(t,o))+r[0],t=o+r[0].length}return n+Es(e.slice(t))}function bh(e,n){return ph.includes(e)||/url\(/i.test(n)||fh.test(n)?gh(n):n}function Ye(e,n){for(let[t,r]of uh(n))e.style.setProperty(`--${t}`,bh(t,r))}var f={title:"Theme preview",dashboard:"Dashboard",defaultDashboard:"Overview",view:"View",device:"Device",desktop:"Desktop",tablet:"Tablet",phone:"Phone",density:"Density",normal:"Normal",compact:"Compact",mode:"Mode",dark:"Dark",light:"Light",current:"Current",candidate:"Candidate",sheet:"Preview options",divider:"Drag to compare current and candidate",splitAt:"Split at {percent} percent",apply:"Apply",navGroup:"Browse themes",navPrev:"Previous theme",navNext:"Next theme",navCount:"{index} of {total}",navPosition:"{name}, {index} of {total}",navLoading:"Loading theme...",navFailed:"Could not load {name}. Try again.",installButton:"Install",installBusy:"Installing...",installConfirmTitle:"Install this theme?",installConfirmBody:"The files of {repo} will be downloaded from GitHub by {store} into your Home Assistant configuration. Only install themes you trust.",installConfirmYes:"Download and install",installCancel:"Cancel",installLoading:"Loading theme...",uninstallButton:"Uninstall",uninstallBusy:"Uninstalling...",uninstallUpdating:"Updating...",uninstallConfirmTitle:"Uninstall this theme?",uninstallConfirmBody:"The theme files of {repo} will be deleted from your Home Assistant configuration by {store}.",uninstallConfirmYes:"Delete theme files",uninstallSwitchFirst:"Change the theme before uninstalling it.",inUseChip:"In use",uninstallWaiting:"Removed. Waiting for Home Assistant to unload the theme.",uninstallTimeout:"Removed, but Home Assistant still lists the theme. Reload the page or check {store}.",installWaiting:"Installed. Waiting for Home Assistant to load the theme.",installTimeout:"Installed, but Home Assistant has not loaded the theme yet. Reload the page or check {store}.",installViaStore:"This theme is not installed yet. Open it in {store} to download it, then come back here.",adminOnly:"Not installed yet. Only an administrator can install themes. Ask one to install this theme with {store}.",openInStore:"Open in {label}",installErrors:{unauthorized:"Only an administrator can install themes.",hacs_unavailable:"Installing needs {store}, which is not available here. Open the repository in {store} to install it.",invalid_repository:"This theme cannot be installed from here. Open it in {store} instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",install_failed:"This theme could not be downloaded by {store}. Try again, or open it in {store}.",reload_failed:"The theme was downloaded but Home Assistant could not reload its themes. Reload themes or restart Home Assistant.",operation_timeout:"This theme is still being handled by {store}. Check {store}, then reload the page.",not_installed:"This theme is not installed.",rate_limited:"Too many changes through {store} in a short time. Try again in a few minutes.",marketplace_warning:"Open the Marketplace once and accept its warning, then try again.",unknown:"The install did not complete. Try again, or open the theme in {store}."},uninstallErrors:{unauthorized:"Only an administrator can uninstall themes.",hacs_unavailable:"Removing needs {store}, which is not available here. Remove the theme in {store} instead.",invalid_repository:"This theme cannot be removed from here. Open it in {store} instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",uninstall_failed:"This theme could not be removed by {store}. Try again, or open it in {store}.",reload_failed:"The theme files were removed but Home Assistant could not reload its themes. Reload the page or restart Home Assistant.",operation_timeout:"This theme is still being handled by {store}. Check {store}, then reload the page.",not_installed:"This theme is not installed.",theme_in_use:"This theme is still used by an assignment, holiday, birthday or trial, or it is a default theme. Switch those to another theme first.",names_unknown:"The theme files could not be read, so removal was not safe. Remove it in {store} instead.",rate_limited:"Too many changes through {store} in a short time. Try again in a few minutes.",marketplace_warning:"Open the Marketplace once and accept its warning, then try again.",unknown:"The uninstall did not complete. Try again, or open the theme in {store}."},originalAdd:"Add to my themes",originalBusy:"Adding...",originalDone:"Added to your themes. You can apply it now.",originalWaiting:"Added, but Home Assistant has not loaded the theme yet. Reload the page to see it.",originalAdminOnly:"Only an administrator can add themes to this Home Assistant.",originalErrors:{name_exists:"A theme with this name is already in your themes.",rate_limited:"Too many changes in a short time. Try again in a few minutes.",unauthorized:"Only an administrator can add themes to this Home Assistant.",unknown:"The theme was not added. Try again."},nameCollision:"The installed copy of {name} has other values than this preview, so Apply and Try are turned off for the previewed one.",nameTaken:"Name already used",repoLink:"View repository",tryButton:"Try for 30 seconds",placeholderCard:"Preview unavailable for card type",loading:"Loading dashboard...",loadError:"Could not load this dashboard.",noViews:"This dashboard has no views.",noCards:"This dashboard has no cards to preview.",generatedSuffix:"(generated by Home Assistant)",generatedDefault:"This dashboard is generated by Home Assistant and has no stored layout to read. Pick another dashboard.",sampleView:"Sample from your entities",sampleNote:"This is a sample built from your entities. The real Overview is generated by Home Assistant and cannot be read.",domainTitles:{light:"Lights",switch:"Switches",climate:"Climate",cover:"Covers",media_player:"Media players",sensor:"Sensors",binary_sensor:"Binary sensors"},compare:"Compare",compareLabel:"Show",themeOnly:"Theme only",menu:"Menu",on:"On",off:"Off",lookLabel:"Look",realLook:"Real look",livePreview:"Live preview",realAlt:"Screenshot of {name} in Home Assistant, {mode} mode",realCaption:"Screenshot of the real theme in Home Assistant (version {commit})",compareHint:"Compare works with the live preview only.",modNote:"Menu and header styling done with card-mod is not shown here.",shell:{title:"Home Assistant",overview:"Overview",map:"Map",logbook:"Logbook",history:"History",energy:"Energy",settings:"Settings",bell:"Notifications",profile:"Profile",menu:"Menu",search:"Search",more:"More"},footnote:"Drawn from your own dashboard with read-only data and scoped colors. Nothing changes until you press Apply.",emptyView:"This view has no cards.",tooManyCards:"This view has more than 200 cards, so it is not previewed.",noCandidate:"Select a theme to compare.",noModeBlock:"This theme has no {mode} block, so the candidate uses the current colors.",trialUnavailable:"Trial mode is not ready. Reload the page and try again.",trialFailed:"The trial could not start."};var As=200,yh=3,vh=60,wh=1500,xh=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,kh=3e3;function O(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function sn(e){if(!O(e))return{};let n=Object.create(null);for(let[t,r]of Object.entries(e))typeof r=="string"&&(n[t]=r);return n}function Ts(e){if(O(e))return{dark:sn(e.dark),light:sn(e.light)}}function ie(e){return O(e.vars)?{vars:sn(e.vars),modes:Ts(e.modes)}:{vars:sn(e),modes:Ts(e.modes)}}function Ms(e){let n=e?.selectedTheme?.theme??e?.themes?.theme,t=e?.themes?.themes;if(!n||!t||!Object.prototype.hasOwnProperty.call(t,n))return;let r=t[n];return O(r)?ie(r):void 0}function _s(e){let n=e.trim().replace(/[\s;]+$/,"").replace(/\s*!important$/i,"").replace(/[\s;]+$/,"").replace(/\s+/g," ");return/^#[0-9a-f]+$/i.test(n)?n.toLowerCase():n}function $h(e,n){return Object.keys(e).some(t=>Object.prototype.hasOwnProperty.call(n,t)&&_s(e[t])!==_s(n[t]))}function Vr(e,n){return["dark","light"].some(t=>$h(J(e,t),J(n,t)))}function Cs(e,n){return O(e)?Vr(ie(e),n):!1}function Wr(e){return e?[...Object.keys(e.vars),...Object.keys(e.modes?.dark??{}),...Object.keys(e.modes?.light??{})]:[]}function Ps(e){let n=e?.selectedTheme,t=n?.theme??e?.themes?.theme??"default";if(!n)return{theme:t};let r={theme:t};return typeof n.dark=="boolean"&&(r.dark=e?.themes?.darkMode??!1),typeof n.primaryColor=="string"&&(r.primaryColor=n.primaryColor),typeof n.accentColor=="string"&&(r.accentColor=n.accentColor),r}function Rs(e,n){let t={theme:e.name};return n&&(t.dark=n==="dark"),t}function an(e){return e.installed&&e.canApply&&!e.nameCollision}function ln(e){return e.installed&&!e.nameCollision}function Ds(e){if(!(!xh.test(e)||e.split("/").some(t=>t==="."||t==="..")))return`https://github.com/${e}`}function dn(e,n){return e?e.entry?J(e.entry,n):e.vars:{}}function Os(e){return e&&/^https:\/\//i.test(e)?e:void 0}var Ss="map";async function Ls(e){let n=await e.connection.sendMessagePromise({type:"lovelace/dashboards/list"}),t=[{url_path:null,title:f.defaultDashboard}];if(!Array.isArray(n))return t;for(let r of n)O(r)&&typeof r.url_path=="string"&&t.push({url_path:r.url_path,title:typeof r.title=="string"?r.title:r.url_path});return[...t.filter(r=>r.url_path!==Ss),...t.filter(r=>r.url_path===Ss)]}async function Is(e,n){let t=await e.connection.sendMessagePromise({type:"lovelace/config",url_path:n});return O(t)?t:{}}function qr(e){return Array.isArray(e.views)?e.views.filter(O):[]}function Hs(e,n){return typeof e.title=="string"&&e.title?e.title:typeof e.path=="string"&&e.path?e.path:`${f.view} ${n+1}`}function Ns(e,n){if(!Array.isArray(e.cards))return e;if(n>=yh)return{...e,cards:[]};let t=e.cards.filter(O).map(r=>Ns(r,n+1));return{...e,cards:t}}function Gr(e){let n=Array.isArray(e.cards)?e.cards:[],r=(Array.isArray(e.sections)?e.sections:[]).flatMap(o=>O(o)&&Array.isArray(o.cards)?o.cards:[]);return[...n,...r].filter(O).map(o=>Ns(o,0))}function Yr(e){return e.reduce((n,t)=>{let r=Array.isArray(t.cards)?Yr(t.cards.filter(O)):0;return n+1+r},0)}var jr,St,zr;function Kr(){let e=window.loadCardHelpers;return typeof e=="function"?e:void 0}async function Eh(){let e=customElements.whenDefined("partial-panel-resolver"),n=new Promise(r=>setTimeout(r,kh));if(await Promise.race([e,n]),!customElements.get("partial-panel-resolver"))return;let t=document.createElement("partial-panel-resolver");t.hass={panels:{tmp:{url_path:"tmp",component_name:"lovelace"}}},t._updateRoutes?.(),await t.routerOptions?.routes?.tmp?.load?.()}async function Th(){return Kr()?!0:(zr??=Eh().catch(()=>{}).finally(()=>{zr=void 0}),await zr,Kr()!==void 0)}async function cn(){if(!await Th())return;let e=Kr();if(e)return St&&jr===e||(jr=e,St=Promise.resolve().then(()=>e()).catch(()=>{St=void 0,jr=void 0})),St}function _h(e){let n=typeof e.type=="string"?e.type:"unknown";return Array.from(n).slice(0,vh).join("")}function on(e){let n=document.createElement("div");return n.className="placeholder",n.textContent=`${f.placeholderCard} ${e}`,n}function Sh(e){return e.localName==="hui-error-card"||e instanceof HTMLUnknownElement}function Ah(e){return new Promise(n=>{let t=setTimeout(()=>n(!1),wh),r=o=>{clearTimeout(t),n(o)};try{customElements.whenDefined(e).then(()=>r(!0),()=>r(!1))}catch{r(!1)}})}async function un(e,n){let t=_h(n);if(!e)return on(t);let r;try{r=e.createCardElement(n)}catch{return on(t)}if(Sh(r))return on(t);let o=r.localName;return o.includes("-")&&customElements.get(o)===void 0&&!await Ah(o)?on(t):r}function Fs(e){let n=[];for(let t=0;t<e.style.length;t+=1){let r=e.style.item(t);r.startsWith("--")&&n.push(r)}for(let t of n)e.style.removeProperty(t)}var Xe=class{constructor(){this.byRepo=new Map}add(n,t){let r=this.byRepo.get(n)??new Set;for(let o of t)r.add(o);this.byRepo.set(n,r)}of(n,t){let r=new Set(this.byRepo.get(n));for(let o of t)o&&r.add(o);return[...r]}};function Bs(e,n){let t=new Set(Object.keys(e));if(Array.isArray(n))for(let r of n)typeof r=="string"&&t.add(r);return[...t]}function Us(e,n,t){return e.installed||n.some(r=>t.has(r))}function js(e,n){return e.includes(n)}function pn(e,n){return e.length===n.length&&e.every((t,r)=>t===n[r])}function zs(e,n,t,r,o){if(e.installed)return"match";if(!n.some(a=>t.has(a)))return"none";if(!o||!r||!Object.prototype.hasOwnProperty.call(r,o.name))return"unverified";let i=r[o.name];if(!O(i))return"unverified";let s={vars:o.vars,modes:o.modes};return Vr(ie(i),s)?"different":"match"}var Ks="hats_lite/catalog",Mh="hats_lite/theme",Xr=5e3,Zr=6e4;function Vs(e,n){let t=rn(e);return t==="permanent"?null:t==="limited"?Zr:Xr*2**n}function Ch(e){if(typeof e!="object"||e===null)return!1;let n=e.code;return n==="invalid_format"||n==="invalid_request"||n==="unknown_error"}function Ie(e,n,t,r=!1,o){if(!e)return Promise.reject(new Error(b.themeErrorDefault));let i={type:Mh,full_name:t.full_name,commit:t.last_commit||"HEAD"};return r?i.summary=!0:o&&(i.theme=o),P(e,i).then(s=>{if(!xs(s?.themes))throw new Error(b.themeErrorDefault);let a=Bs(s.themes,s.names);return n.add(t.full_name,a),{themes:s.themes,summary:s.summary===!0,names:a}},s=>{if(i.theme!==void 0&&Ch(s))return Ie(e,n,t);throw s})}var Ws="hats_lite_theme_cache",Qr=120,Ph=2e4;function Jr(e){if(!O(e))return null;let n=Object.create(null);for(let[t,r]of Object.entries(e)){if(typeof r!="string")return null;n[t]=r}return n}function Rh(e){if(!O(e)||typeof e.name!="string")return null;let n=Jr(e.vars);if(!n)return null;let t={name:e.name,vars:n};if(e.modes!==void 0&&e.modes!==null){if(!O(e.modes))return null;let r=Jr(e.modes.dark??{}),o=Jr(e.modes.light??{});if(!r||!o)return null;t.modes={dark:r,light:o}}return t}function Ze(e){let n=Object.keys(e)[0];if(n===void 0)return null;let t=e[n];if(!O(t))return null;let r=ie(t);return{name:n,vars:r.vars,modes:r.modes}}var qs=new WeakMap;function Ys(e,n){let t=qs.get(e)??{};return qs.set(e,t),t[n]??=J(e,n),t[n]}function Gs(e){return JSON.stringify(e).length>Ph}var hn=class{constructor(){this.slots=new Map;this.load()}load(){try{let n=localStorage.getItem(Ws);if(n===null)return;let t=JSON.parse(n);if(!Array.isArray(t))return;for(let r of t){if(!Array.isArray(r)||typeof r[0]!="string")continue;let o=Rh(r[1]);o&&!Gs(o)&&this.slots.set(r[0],{theme:o})}this.trim()}catch{this.slots.clear()}}trim(){let n=[];for(;this.slots.size>Qr;){let t=this.slots.keys().next().value;if(t===void 0)break;this.slots.delete(t),n.push(t)}return n}get size(){return this.slots.size}has(n){return this.slots.has(n)}touch(n){let t=this.slots.get(n);t&&(this.slots.delete(n),this.slots.set(n,t))}get(n){return this.slots.get(n)?.theme}bundle(n){return this.slots.get(n)?.bundle}set(n,t,r){this.slots.delete(n),this.slots.set(n,{theme:t,bundle:r});let o=this.trim();return this.persist(),o}persist(){try{let n=[...this.slots.entries()].filter(([,t])=>!Gs(t.theme)).map(([t,r])=>[t,r.theme]);localStorage.setItem(Ws,JSON.stringify(n))}catch{return}}};var Js=["all","installed","dark","light","glass"];function Qs(e,n){return e==="dark"||e==="light"?e:n}function ea(e){let n=e.split("/");return n[n.length-1]||e}function ta(e){let n=e.indexOf("/");return n>0?e.slice(0,n):""}function ve(e){return`${e.full_name}@${e.last_commit||"HEAD"}`}function Dh(e){return`${e.full_name} ${e.description}`.toLowerCase()}function Xs(e,n){return new RegExp(`(^|[^a-z0-9])${n}([^a-z0-9]|$)`).test(e)}function Zs(e){return!!e&&Object.keys(e).length>0}function Oh(e){return[e.vars,e.modes?.dark,e.modes?.light].some(t=>Object.entries(t??{}).some(([r,o])=>/backdrop-filter|blur/i.test(r)||/blur\(/i.test(o)))}function na(e,n,t,r,o=n.installed){let i=t===void 0?r:void 0,s=Dh(n);return e==="all"?!0:e==="installed"?o:e==="dark"?Xs(s,"dark")||Zs(t?.modes?.dark)||i?.dark===!0:e==="light"?Xs(s,"light")||Zs(t?.modes?.light)||i?.light===!0:/glass|frost|blur/.test(s)||t!==void 0&&Oh(t)||i?.glass===!0}var Lh={all:b.filterAll,installed:b.filterInstalled,dark:b.filterDark,light:b.filterLight,glass:b.filterGlass};function ra(e){return l`
    <div class="toolbar">
      <div class="filters" role="group" aria-label=${b.filterLabel}>
        ${Js.map(n=>l`
            <button
              type="button"
              class="chip-btn"
              data-filter=${n}
              aria-pressed=${e.filter===n?"true":"false"}
              @click=${()=>e.onFilter(n)}
            >
              ${Lh[n]}
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
  `}var oa={width:440,height:275};function eo(e,n,t){let r=e%n,o=Math.floor(e/n);return{sizeX:n*100,sizeY:t*100,posX:n>1?r/(n-1)*100:0,posY:t>1?o/(t-1)*100:0}}function ia(e,n){return typeof e=="number"&&Number.isInteger(e)&&e>0&&e<=n}function Ih(e,n,t){if(typeof e!="object"||e===null)return null;let r=e,o=r.index;return typeof r.full_name!="string"||typeof r.name!="string"||typeof o!="number"||!Number.isInteger(o)||o<0||o>=n||t.has(o)?null:(t.add(o),{full_name:r.full_name,name:r.name,index:o,commit:typeof r.commit=="string"&&r.commit?r.commit:null,license:typeof r.license=="string"&&r.license?r.license:null,dark:r.dark===!0,light:r.light===!0,glass:r.glass===!0})}function Hh(e,n){for(let r of[e,n])if(typeof r=="string"&&r)return r;let t=r=>r!=null;return t(e)||t(n)?null:""}function mn(e){if(typeof e!="object"||e===null)return null;let n=e,{columns:t,rows:r,themes:o}=n;if(n.version!==1||!ia(t,64)||!ia(r,2e3)||!Array.isArray(o))return null;let i=new Set,s=new Map;for(let d of o){let u=Ih(d,t*r,i);u&&s.set(u.full_name,u)}let a=Hh(n.hash,n.generated);return a===null?null:{columns:t,rows:r,version:a,tile:Nh(n.tile),themes:s}}function Nh(e){if(typeof e!="object"||e===null)return oa;let{width:n,height:t}=e,r=o=>typeof o=="number"&&Number.isInteger(o)&&o>=16&&o<=4096;return r(n)&&r(t)?{width:n,height:t}:oa}function sa(e,n){return n.width===e.columns*e.tile.width&&n.height===e.rows*e.tile.height}var da="/hats_lite_static/thumbs",aa=6e3,Fh=2e4,la=3e4,fn=class extends Error{},Qe=class extends Error{},Bh=2,Je={recovery:{succeeded:!1,failures:0},fetchIndex(e,n="no-cache"){return fetch(`${da}/index.json`,{credentials:"same-origin",cache:n,signal:e}).then(t=>{if(t.status===404)throw new fn("index missing");if(!t.ok)throw new Error("index unavailable");return t.json()})},loadImage(e,n){return new Promise(t=>{let r=new Image,o=s=>{n?.removeEventListener("abort",i),t(s)},i=()=>{r.src="",o(!1)};r.onload=()=>{o({width:r.naturalWidth,height:r.naturalHeight})},r.onerror=()=>o(!1),n?.addEventListener("abort",i),r.src=e})}};function to(e,n,t){let r=new AbortController;return new Promise((o,i)=>{let s=()=>{clearTimeout(d),e.delete(a)},a=()=>{s(),r.abort(),i(new Qe)},d=setTimeout(()=>{s(),r.abort(),i(new Error("timeout"))},n);e.add(a);let u=m=>p=>{s(),m(p)};try{t(r.signal).then(u(o),u(i))}catch(m){u(i)(m)}})}var gn=class{constructor(n){this.onChange=n;this.started=!1;this.images=new Map;this.wanted=new Set;this.generation=0;this.recovering=!1;this.retries=new Map;this.active=new Set;this.disposed=!1;this.ticket=0}ensure(n){if(this.wanted.add(n),!this.disposed){if(this.started){this.pump();return}this.startIndex()}}startIndex(){this.started=!0;let n=++this.ticket;Promise.resolve().then(()=>{n===this.ticket&&!this.disposed&&this.loadIndex(!0)})}later(n){let t=()=>{this.retries.delete(t),n()};this.retries.set(t,this.disposed?void 0:setTimeout(t,la))}dispose(){this.disposed=!0,this.ticket+=1;for(let[n,t]of this.retries)t!==void 0&&clearTimeout(t),this.retries.set(n,void 0);for(let n of[...this.active])n();this.index===void 0&&(this.started=!1);for(let[n,t]of this.images)t===void 0&&this.images.delete(n)}resume(){this.disposed=!1;for(let[n,t]of this.retries)t===void 0&&this.retries.set(n,setTimeout(n,la));!this.started&&this.wanted.size>0?this.startIndex():this.pump()}async loadIndex(n){let t=null,r=!1;try{t=mn(await to(this.active,aa,o=>Je.fetchIndex(o)))}catch(o){if(o instanceof Qe)return;r=!(o instanceof fn)}this.index=t,this.pump(),this.onChange(),!t&&r&&n&&this.later(()=>{this.loadIndex(!1)})}pump(){if(this.index)for(let n of this.wanted)this.images.has(n)||(this.images.set(n,void 0),this.loadImage(n,!0))}async loadImage(n,t){let r=this.index,o=this.generation;if(!r)return;let i=this.imageUrl(n),s=!1;try{s=await to(this.active,Fh,d=>Je.loadImage(i,d))}catch(d){if(d instanceof Qe)return}if(o!==this.generation)return;let a=s!==!1;if(a&&typeof s=="object"&&!sa(r,s)){this.mismatch(n);return}this.images.set(n,a),this.onChange(),!a&&t&&this.later(()=>{this.loadImage(n,!1)})}mismatch(n){this.images.set(n,!1),this.onChange();let t=Je.recovery;this.recovering||this.disposed||t.succeeded||t.failures>=Bh||this.recover()}async recover(){this.recovering=!0;let n=null,t=!1;try{n=mn(await to(this.active,aa,r=>Je.fetchIndex(r,"reload")))}catch(r){t=r instanceof Qe}if(this.recovering=!1,!(t||this.disposed)){if(n===null){Je.recovery.failures+=1,this.onChange();return}Je.recovery.succeeded=!0,this.index=n,this.generation+=1;for(let r of this.wanted)this.images.delete(r);this.pump(),this.onChange()}}imageUrl(n){let t=this.index?.version??"",r=t?`?v=${encodeURIComponent(t)}`:"";return`${da}/atlas-${n}.webp${r}`}theme(n,t){let r=this.index?.themes.get(n);if(!r)return;let o=r.commit;if(!(t&&o&&o!=="HEAD"&&o!==t))return r}state(n,t,r){if(this.ensure(t),this.index===void 0)return"pending";if(!this.theme(n,r))return"none";if(!this.images.has(t))return"pending";let o=this.images.get(t);return o===void 0?"pending":o?"ok":"none"}tile(n,t){let r=this.theme(n,t);return!r||!this.index?null:eo(r.index,this.index.columns,this.index.rows)}};var ca={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ua=e=>(...n)=>({_$litDirective$:e,values:n}),bn=class{constructor(n){}get _$AU(){return this._$AM._$AU}_$AT(n,t,r){this._$Ct=n,this._$AM=t,this._$Ci=r}_$AS(n,t){return this.update(n,t)}update(n,t){return this.render(...t)}};var pa="important",Uh=" !"+pa,se=ua(class extends bn{constructor(e){if(super(e),e.type!==ca.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((n,t)=>{let r=e[t];return r==null?n:n+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[n]){let{style:t}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(n)),this.render(n);for(let r of this.ft)n[r]==null&&(this.ft.delete(r),r.includes("-")?t.removeProperty(r):t[r]=null);for(let r in n){let o=n[r];if(o!=null){this.ft.add(r);let i=typeof o=="string"&&o.endsWith(Uh);r.includes("-")||i?t.setProperty(r,i?o.slice(0,-11):o,i?pa:""):t[r]=o}}return ue}});function ha(e,n,t,r){let o=e.tile(n,r),i=e.theme(n,r);if(!o||!i)return c;let s={backgroundImage:`url("${e.imageUrl(t)}")`,backgroundSize:`${o.sizeX}% ${o.sizeY}%`,backgroundPosition:`${o.posX}% ${o.posY}%`};return l`<div
    class="atlas-thumb"
    role="img"
    aria-label=${i.name}
    data-atlas="true"
    style=${se(s)}
  ></div>`}function ma(e){if(!e)return l`<span
      class="chip"
      title=${b.licenseUnknown}
      aria-label=${b.licenseUnknown}
      >${b.licenseShort}</span
    >`;let n=`${b.licenseKnown}: ${e}`;return l`<span class="chip" title=${n} aria-label=${n}>${e}</span>`}function jh(e){e.preventDefault()}function zh(e){return e==="match"?l`<span class="chip ok">${b.installed}</span>`:e==="unverified"?l`<span class="chip">${b.installed}</span>`:e==="different"?l`<span class="chip warn">${b.otherCopy}</span>`:c}function fa(e,n){let t=ea(e.entry.full_name),r=ta(e.entry.full_name),o=`${b.starsLabel}: ${e.entry.stars}`;return l`
    <article class="card" data-key=${e.key}>
      <button
        class="thumb-btn"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        ?disabled=${e.busy}
        @mousedown=${jh}
        @click=${n}
      >
        ${e.atlased?ha(e.atlas,e.entry.full_name,e.mode,e.entry.last_commit):l`<hats-lite-thumb
              .vars=${e.vars}
              .mode=${e.mode}
              ?failed=${e.failed}
              ?limited=${e.limited}
            ></hats-lite-thumb>`}
      </button>
      <div class="body">
        <span class="name">${t}</span>
        ${r?l`<span class="owner">${r}</span>`:c}
        <div class="chips">
          ${zh(e.installedKind)}
          ${e.active?l`<span class="chip ok">${b.inUse}</span>`:c}
          <span class="chip" title=${o} aria-label=${o}
            >${b.starGlyph} ${e.entry.stars}</span
          >
          ${ma(e.license)}
        </div>
        ${e.error?l`<p class="card-error" role="alert">${e.error}</p>`:c}
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
  `}var et="default",ga="",no={full_name:ga,description:b.defaultDescription,stars:0,installed:!0,last_commit:null,hacs_id:null};function At(e){return e?.full_name===ga}function Kh(e){return e===""||e.includes("default")||e.includes("home assistant")||"home assistant".includes(e)&&e.length>=4}function yn(e,n){return e==="all"&&Kh(n)}function ro(e){return At(e)?b.defaultName:e.full_name}function ba(){return{[et]:{vars:{}}}}function ya(){return{name:et,vars:{},installed:!0,canApply:!0}}function va(e,n){let t=b.defaultName;return l`
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
  `}function wa(e){return!e.ready||e.count>0?"":e.catalog>0?e.defaultShown?"":e.query?b.noMatches:b.noFilterMatches:e.error?"":b.noThemes}var Vh=6,tt=class{constructor(){this.slots=new Map}key(n,t){return`${ve(n)}@${t}`}get(n,t){let r=this.key(n,t),o=this.slots.get(r);return o&&(this.slots.delete(r),this.slots.set(r,o)),o}set(n,t,r){let o=this.key(n,t);for(this.slots.delete(o),this.slots.set(o,r);this.slots.size>Vh;){let i=this.slots.keys().next().value;if(i===void 0)break;this.slots.delete(i)}}};async function oo(e,n,t,r,o){let i=t.get(r,o);if(i)return i;let s=await Ie(e,n,r,!1,o),a={themes:s.themes,names:s.names,theme:o};return Object.prototype.hasOwnProperty.call(s.themes,o)&&t.set(r,o,a),a}async function xa(e,n,t,r,o,i){let s=ve(o),a=t.get(s)?.name??i,d=t.bundle(s);if(d&&(!a||Object.prototype.hasOwnProperty.call(d,a))){t.touch(s);let p=n.of(o.full_name,Object.keys(d));return{themes:d,names:p,theme:a??Object.keys(d)[0]}}if(!a){let p=await Ie(e,n,o,!0);if(a=Ze(p.themes)?.name,!p.summary){let g=Ze(p.themes);return g&&t.set(s,g,p.themes),{themes:p.themes,names:p.names,theme:a}}}if(!a){let p=await Ie(e,n,o);return{themes:p.themes,names:p.names,theme:Object.keys(p.themes)[0]}}let u=await oo(e,n,r,o,a),m=Ze(u.themes);return m&&!t.has(s)&&t.set(s,m),u}var we=class extends Error{},vn=class{constructor(n=3,t=5e3,r=1,o=()=>t){this.limit=n;this.retryMs=t;this.retries=r;this.delayFor=o;this.running=0;this.waiting=[];this.pending=new Set;this.epoch=0}get active(){return this.running}add(n){return this.attempt(n,this.retries)}dispose(){this.epoch+=1;let n=this.waiting;this.waiting=[];for(let r of n)r.reject(new we);let t=[...this.pending];this.pending.clear();for(let r of t)clearTimeout(r.timer),r.reject(new we)}acquire(){return this.running<this.limit?(this.running+=1,Promise.resolve()):new Promise((n,t)=>this.waiting.push({resolve:n,reject:t}))}release(){let n=this.waiting.shift();n?n.resolve():this.running-=1}pause(n){return new Promise((t,r)=>{let o={timer:setTimeout(()=>{this.pending.delete(o),t()},n),reject:r};this.pending.add(o)})}async attempt(n,t){let r=this.epoch;if(await this.acquire(),r!==this.epoch)throw this.release(),new we;let o=this.retryMs;try{return await n()}catch(i){if(r!==this.epoch)throw new we;let s=t>0?this.delayFor(i,this.retries-t):null;if(s===null)throw i;o=s}finally{this.release()}return await this.pause(o),this.attempt(n,t-1)}};var ka=T`
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
`;var Wh={dark:{"primary-background-color":"#111111","card-background-color":"#1c1c1c","primary-text-color":"#e1e1e1","secondary-text-color":"#9b9b9b","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#e1e1e11f","text-primary-color":"#ffffff","secondary-background-color":"#282828","disabled-text-color":"#6f6f6f"},light:{"primary-background-color":"#fafafa","card-background-color":"#ffffff","primary-text-color":"#141414","secondary-text-color":"#5e5e5e","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#0000001f","text-primary-color":"#ffffff","secondary-background-color":"#e5e5e5","disabled-text-color":"#bdbdbd"}},qh={"paper-item-icon-color":"#44739e","light-primary-color":"#b3e5fc","dark-primary-color":"#0288d1"},Gh=["primary-color","accent-color","primary-text-color","secondary-text-color","card-background-color","primary-background-color"];function Yh(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16)).join(", ")}function $a(e){let n=Wh[e],t={...n,...qh};for(let r of Gh)t[`rgb-${r}`]=Yh(n[r]);return t}var wn={dark:$a("dark"),light:$a("light")},Xh=["lovelace-background","ha-card-background","ha-card-border-radius","ha-card-border-width","ha-card-border-color","ha-card-box-shadow","ha-card-backdrop-filter","state-icon-color","primary-font-family"],Ea=Object.fromEntries(Xh.map(e=>[e,"initial"]));function Ta(e,n){if(e===n)return!0;if(!e||!n)return!1;let t=Object.keys(e);return t.length===Object.keys(n).length&&t.every(r=>e[r]===n[r])}var io=class extends A{constructor(){super(...arguments);this.vars=null;this.mode="dark";this.failed=!1;this.limited=!1}static{this.properties={vars:{attribute:!1,hasChanged:(t,r)=>!Ta(t,r)},mode:{attribute:!1},failed:{type:Boolean},limited:{type:Boolean}}}static{this.styles=T`
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
  `}updated(t){if(!t.has("vars")&&!t.has("mode"))return;let r=this.painted;r&&r.mode===this.mode&&Ta(r.vars,this.vars)||(this.painted={vars:this.vars,mode:this.mode},this.style.cssText="",this.vars&&(Ye(this,Ea),Ye(this,wn[this.mode]),Ye(this,this.vars)))}render(){if(this.failed){let t=this.limited?b.thumbRateLimited:b.thumbUnavailable;return l`<div class="state unavailable"><span class="reason">${t}</span></div>`}return this.vars?l`
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
    `:l`<div class="state skeleton" aria-hidden="true"></div>`}};customElements.get("hats-lite-thumb")||customElements.define("hats-lite-thumb",io);var V=T`
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
`,W=T`
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
`;var Zh=6,so=class extends A{constructor(){super(...arguments);this.installedThemes=[];this.currentTheme="default";this.entries=[];this.query="";this.loading=!1;this.loaded=!1;this.error="";this.fromCache=!1;this.busyName="";this.cardError=null;this.filter="all";this.mode="dark";this.states=new Map;this.started=!1;this.modeTouched=!1;this.installedSet=new Set;this.entryIndex=new Map;this.cache=new hn;this.bundles=new tt;this.visible=new Set;this.known=new Xe;this.queue=new vn(3,Xr,1,Vs);this.atlas=new gn(()=>this.onAtlasChange());this.seen=new Set;this.inflight=new Set;this.permanent=new Set;this.limitedUntil=new Map;this.watched=new WeakMap;this.onIntersect=t=>{for(let r of t){let o=r.target.dataset.key??"";if(!r.isIntersecting){this.visible.delete(o);continue}this.visible.add(o),this.cache.touch(o);let i=this.entryIndex.get(o);i&&this.requestVars(i,!0)}};this.onSearch=t=>{this.query=t.target.value}}static{this.properties={installedThemes:{attribute:!1},currentTheme:{attribute:!1},darkMode:{attribute:!1},entries:{state:!0},query:{state:!0},loading:{state:!0},loaded:{state:!0},error:{state:!0},fromCache:{state:!0},busyName:{state:!0},cardError:{state:!0},filter:{state:!0},mode:{state:!0},states:{state:!0}}}static{this.styles=[V,W,ka]}get hass(){return this.hassRef}set hass(t){this.hassRef=t;let r=t?.themes,o=Object.keys(r?.themes??{});pn(o,this.installedThemes)||(this.installedThemes=o);let i=t?.selectedTheme?.theme??r?.theme??"default";i!==this.currentTheme&&(this.currentTheme=i),r?.darkMode!==this.darkMode&&(this.darkMode=r?.darkMode),this.started||this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.atlas.resume(),this.hasUpdated&&queueMicrotask(()=>this.watchCards())}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0,this.watched=new WeakMap,this.visible.clear(),this.queue.dispose(),this.atlas.dispose()}willUpdate(t){t.has("installedThemes")&&(this.installedSet=new Set(this.installedThemes)),t.has("entries")&&(this.entryIndex=new Map(this.entries.map(r=>[ve(r),r]))),t.has("darkMode")&&!this.modeTouched&&this.darkMode!==void 0&&(this.mode=this.darkMode?"dark":"light"),!this.started&&this.hassRef&&(this.started=!0,this.loadCatalog())}updated(){queueMicrotask(()=>this.watchCards())}async loadCatalog(){let t=this.hassRef;if(t){this.loading=!0;try{let r=await P(t,{type:Ks});this.entries=Ur(r?.themes),this.fromCache=!1,this.error="",ws(this.entries)}catch{let r=vs();this.entries=r??[],this.fromCache=r!==null,this.error=b.loadError}finally{this.loading=!1,this.loaded=!0}}}setState(t,r){let o=new Map(this.states);r===null?o.delete(t):o.set(t,r),this.states=o}requestVars(t,r=!1){let o=ve(t);if(!this.hassRef||this.inflight.has(o)||this.cache.has(o))return;let i=this.states.get(o);(i==="failed"||i==="limited")&&!(r&&!this.permanent.has(o))||i==="limited"&&(this.limitedUntil.get(o)??0)>Date.now()||(this.seen.add(o),this.atlas.state(t.full_name,this.mode,t.last_commit)==="none"&&(this.inflight.add(o),this.setState(o,"loading"),this.queue.add(()=>Ie(this.hassRef,this.known,t,!0)).then(a=>{let d=Ze(a.themes);if(!d)throw new Error(b.themeErrorDefault);let u=this.cache.set(o,d,a.summary?void 0:a.themes);this.refill(u),this.setState(o,null)}).catch(a=>{if(a instanceof we){this.setState(o,null);return}let d=rn(a);d==="permanent"&&this.permanent.add(o),d==="limited"&&this.limitedUntil.set(o,Date.now()+Zr),this.setState(o,d==="limited"?"limited":"failed")}).finally(()=>this.inflight.delete(o))))}refill(t){if(!(this.visible.size>=Qr))for(let r of t){let o=this.visible.has(r)?this.entryIndex.get(r):void 0;o&&this.requestVars(o)}}onAtlasChange(){this.requestUpdate();for(let t of this.seen){let r=this.entryIndex.get(t);r&&this.requestVars(r)}}watchCards(){let t=Array.from(this.renderRoot.querySelectorAll('.card[data-key]:not([data-key="default"])'));if(typeof IntersectionObserver>"u"){for(let r of t.slice(0,Zh)){let o=this.entryIndex.get(r.dataset.key??"");o&&this.requestVars(o)}return}this.observer??=new IntersectionObserver(this.onIntersect,{rootMargin:"200px"});for(let r of t){let o=r.dataset.key??"";this.watched.get(r)!==o&&(this.watched.has(r)&&this.observer.unobserve(r),this.watched.set(r,o),this.observer.observe(r))}}async openEntry(t){if(At(t))return{entry:t,themes:ba()};let r=this.atlas.theme(t.full_name,t.last_commit)?.name,o=await xa(this.hassRef,this.known,this.cache,this.bundles,t,r);return{entry:t,...o}}async refreshCatalog(){return await this.loadCatalog(),this.entries}visibleEntries(){let t=this.query.trim().toLowerCase();return[...yn(this.filter,t)?[no]:[],...this.filtered(t).map(r=>r.entry)]}async selectTheme(t){if(!(this.busyName||!this.hassRef)){this.busyName=t.full_name,this.cardError=null;try{let r=await this.openEntry(t);this.dispatchEvent(new CustomEvent(hs,{bubbles:!0,composed:!0,detail:r}))}catch(r){this.cardError={name:t.full_name,text:ks(r)}}finally{this.busyName=""}}}pickFilter(t){let r=Qs(t,this.mode);r!==this.mode&&(this.modeTouched=!0,this.mode=r),this.filter=t}cardModel(t,r,o){let i=this.hassRef?.themes?.themes,s=ve(t),a=this.cache.get(s),d=a?void 0:this.states.get(s),u=this.atlas.state(t.full_name,this.mode,t.last_commit)==="ok";return{entry:t,key:s,mode:this.mode,vars:a?Ys(a,this.mode):null,atlas:this.atlas,atlased:u,failed:d==="failed"||d==="limited",limited:d==="limited",installed:o,installedKind:zs(t,r,this.installedSet,i,a),active:js(r,this.currentTheme),license:this.atlas.theme(t.full_name,t.last_commit)?.license,busy:this.busyName!=="",opening:this.busyName===t.full_name,error:this.cardError?.name===t.full_name?this.cardError.text:""}}filtered(t){let r=[];for(let o of this.entries){if(t&&!$s(o,t))continue;let i=this.cache.get(ve(o)),s=this.atlas.theme(o.full_name,o.last_commit),a=this.known.of(o.full_name,[s?.name,i?.name]),d=Us(o,a,this.installedSet);na(this.filter,o,i,s,d)&&r.push({entry:o,names:a,installed:d})}return r}visibleCards(t){return[...yn(this.filter,t)?[va(this.mode,()=>this.selectTheme(no))]:[],...this.filtered(t).map(({entry:o,names:i,installed:s})=>fa(this.cardModel(o,i,s),()=>this.selectTheme(o)))]}render(){let t=this.query.trim().toLowerCase(),r=this.visibleCards(t),o=wa({count:this.filtered(t).length,ready:this.loaded&&!this.loading,catalog:this.entries.length,error:this.error,query:t,defaultShown:yn(this.filter,t)}),i=[...this.states.values()].includes("loading");return l`
      <section>
        ${this.error?l`<p class="banner" role="alert">${this.error}</p>`:c}
        ${this.error&&!this.fromCache&&!this.loading?l`<button
              class="btn retry"
              type="button"
              @click=${()=>{this.loadCatalog()}}
            >
              ${b.retry}
            </button>`:c}
        ${ra({filter:this.filter,query:this.query,onFilter:s=>this.pickFilter(s),onSearch:this.onSearch})}
        <div class="live" role="status" aria-live="polite">
          ${this.fromCache?l`<p class="note">${b.cachedNote}</p>`:c}
          ${this.loading?l`<p>${b.loading}</p>`:c}
          ${o?l`<p>${o}</p>`:c}
          ${i?l`<span class="sr-only">${b.previewsLoading}</span>`:c}
        </div>
        <div class="grid">${r}</div>
      </section>
    `}};customElements.get("hats-lite-browse")||customElements.define("hats-lite-browse",so);var Mt=[];var Jh=0,_a=200;function F(e){Jh+=1,Mt.length>=100&&Mt.shift(),Mt[Mt.length]=e.length>_a?e.slice(0,_a):e}var Qh=new Set(["loadBackendTranslation","loadFragmentTranslation"]),em=new Set(["call","send","set","fire","dispatch","post","put","patch","delete","remove","add","create","update","save","store","subscribe","unsubscribe","fetch","load","open","close","toggle","reload","restart","navigate","run","execute","invoke","emit","trigger","notify","turn","ws","api","login","logout","signout","upload","write","clear","reset","connect","disconnect","install","uninstall","enable","disable","start","stop","play","pause","push","publish","request","submit","register","revoke","refresh","resume","suspend","play","mute","press","click","dismiss","show","hide","edit","apply","change","select","activate","deactivate","cancel","confirm","reboot","shutdown","retry","sync","download","listen","attach","detach","mount","unmount","replace","insert","append","prepend","move","rename","copy","paste","kill","destroy","dispose","init","bootstrap","migrate","mutate"]),tm=/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;function Ct(e){if(Qh.has(e))return"loader";if(typeof e!="string")return"blocked";let n=e.match(tm);if(n===null)return"blocked";for(let t of n)if(em.has(t.toLowerCase()))return"blocked";return"read"}var nm=/^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|config\/entity_registry\/list_for_display$|auth\/current_user$|render_template$|history\/stream$|logbook\/event_stream$|subscribe_entities$|subscribe_events$|energy\/get_prefs$|energy\/info$|energy\/fossil_energy_consumption$|energy\/solar_forecast$|weather\/subscribe_forecast$|todo\/item\/list$|todo\/item\/subscribe$|calendar\/event\/subscribe$|recorder\/statistics_during_period$|recorder\/statistic_during_period$|recorder\/get_statistics_metadata$)/,rm=new Set(["state_changed","entity_registry_updated","device_registry_updated","area_registry_updated","label_registry_updated","floor_registry_updated","lovelace_updated"]);function lo(e){return typeof e=="string"&&rm.has(e)}var om=["/api/states","/api/config","/api/history","/api/logbook","/api/camera_proxy","/api/image_proxy","/api/media_player_proxy"],ao="x-http-method-override";function nt(e){if(typeof e!="object"||e===null)return;let n={...e},t=n.type;if(typeof t=="string")return{type:t,msg:n}}function rt(e){return e===void 0||!nm.test(e.type)?!1:e.type==="subscribe_events"?lo(e.msg.event_type):!0}function ot(e){return`ws:${e?e.type:"invalid"}`}var im=/\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i,sm=/@|%2f/i,am=/^[A-Za-z][A-Za-z0-9+.-]*:/;function xn(e,n=!1){return typeof e!="string"||e===""||im.test(e)||e.startsWith("//")||sm.test(e.split(/[?#]/,1)[0])?!1:e.startsWith("/")?!0:n&&!am.test(e)}function lm(e){return`/api/${e.split(/[?#]/,1)[0].replace(/^\/+/,"").replace(/^api\//,"")}`}function kn(e){let n=lm(e);return om.some(t=>n===t||n.startsWith(`${t}/`))}function co(e){if(e==null)return!1;let n=e;return typeof Headers<"u"&&e instanceof Headers?e.has(ao):Array.isArray(e)?e.some(t=>Array.isArray(t)&&String(t[0]).toLowerCase()===ao):typeof n=="object"?Object.keys(e).some(t=>t.toLowerCase()===ao):!1}function $n(e){return typeof e=="string"?e:"invalid"}function En(e){return e==null||typeof e=="string"&&e.toUpperCase()==="GET"?"GET":null}function Tn(e){return typeof e=="string"?e.toUpperCase():"invalid"}var x=Reflect.apply,xe=Reflect.has,ae=Reflect.ownKeys,ke=Reflect.getOwnPropertyDescriptor,Sn=Reflect.getPrototypeOf,Sa=Object.setPrototypeOf,Aa=Object.freeze,Ma=Reflect.defineProperty,Rt=Array.isArray,Ca=Math.trunc,dm=WeakMap.prototype.get,cm=WeakMap.prototype.set,Ex=WeakMap.prototype.has,um=WeakSet.prototype.has,pm=WeakSet.prototype.add,hm=Object.prototype.hasOwnProperty,mm=Object.prototype.propertyIsEnumerable,fm=Function.prototype.bind,gm=Object.getOwnPropertyDescriptor(Map.prototype,"size")?.get,bm=Object.getOwnPropertyDescriptor(Set.prototype,"size")?.get,Pa=Date.prototype.getTime,Ra=Object.prototype.toString;function ee(e,n){return x(dm,e,[n])}function pe(e,n,t){x(cm,e,[n,t])}function Pt(e,n){return x(um,e,[n])}function _n(e,n){x(pm,e,[n])}function $e(e,n){return x(hm,e,[n])}function Da(e,n){return x(mm,e,[n])}function Oa(e,n){return x(fm,e,[n])}function uo(e,n){try{return x(e,n,[]),!0}catch{return!1}}function po(e){try{return x(Ra,e,[])}catch{return""}}function An(e){return po(e)==="[object Map]"&&uo(gm,e)}function Mn(e){return po(e)==="[object Set]"&&uo(bm,e)}function La(e){return po(e)==="[object Date]"&&uo(Pa,e)}function Ia(e){return x(Pa,e,[])}function Ha(e){try{return x(Ra,e,[])==="[object Promise]"}catch{return!1}}var Na=new WeakSet,Fa=new WeakSet;function Ba(e){if(!(typeof e!="object"||e===null)){_n(Na,e);for(let n of ae(e)){let t=ke(e,n);t&&typeof t.get=="function"&&_n(Fa,t.get)}}}for(let e of[Object,Function,Array,Map,Set,WeakMap,WeakSet,Date,Promise,RegExp,Error,String,Number,Boolean,Symbol,ArrayBuffer,DataView])Ba(e.prototype);for(let e of["URL","URLSearchParams","Headers","Request","Response","Blob","EventTarget"]){let n=globalThis[e];typeof n=="function"&&Ba(n.prototype)}function R(e,n,t){let r=e;for(;r!==null;){let o=ke(r,n);if(o){if($e(o,"value"))return o.value;let i=o.get;if(typeof i!="function")return;let s=Pt(Na,r)&&!Pt(Fa,i);return x(i,s?t:e,[])}r=Sn(r)}}function Ua(){return{disposed:!1,unsubs:new Set,epoch:0,connections:new WeakMap}}function ja(e){e.epoch+=1;for(let n of[...e.unsubs])try{n()}catch{continue}e.unsubs.clear()}var ym=new Set(["ready","disconnected"]);function za(e,n){if(typeof e!="object"||e===null)return;let t=ee(n.connections,e);if(t)return t;let r=e,o=n,i=()=>{},s=(m,...p)=>{let g=R(r,m,void 0);if(typeof g!="function")throw new TypeError(`Connection has no ${m}`);return x(g,r,p)},a=new Map;async function d(m,p){if(n.disposed)return i;let g=o.epoch,E=await p((...S)=>{!n.disposed&&typeof m=="function"&&x(m,void 0,S)});if(typeof E!="function")return i;if(n.disposed||o.epoch!==g)return E(),i;let M=()=>{o.unsubs.delete(M)&&E()};return o.unsubs.add(M),M}let u={get connected(){return R(r,"connected",void 0)},get haVersion(){return R(r,"haVersion",void 0)},socket:void 0,suspendReconnectUntil:i,async sendMessagePromise(m){let p=nt(m);if(rt(p)&&!n.disposed)return s("sendMessagePromise",p.msg);F(ot(p))},sendMessage(m,p){let g=nt(m);if(rt(g)&&!n.disposed)return s("sendMessage",g.msg,p);F(ot(g))},async subscribeMessage(m,p,g){let v=nt(p);return rt(v)?d(m,E=>s("subscribeMessage",E,v.msg,g)):(F(ot(v)),i)},async subscribeEvents(m,p){return lo(p)?d(m,g=>s("subscribeEvents",g,p)):(F(`ws:subscribe_events:${typeof p=="string"?p:"invalid"}`),i)},addEventListener(m,p){if(typeof m!="string"||!ym.has(m)||typeof p!="function"){F(`event-listener:${typeof m=="string"?m:"invalid"}`);return}if(n.disposed)return;let g=a.get(m);if(g||(g=new Map,a.set(m,g)),g.has(p))return;let v=(S,...U)=>{n.disposed||x(p,u,[u,...U])},E=g,M=()=>{o.unsubs.delete(M)&&(E.delete(p),s("removeEventListener",m,v))};E.set(p,{forward:v,release:M}),s("addEventListener",m,v),o.unsubs.add(M)},removeEventListener(m,p){if(typeof m!="string")return;let g=a.get(m)?.get(p);g&&(a.get(m)?.delete(p),o.unsubs.delete(g.release),s("removeEventListener",m,g.forward))}};return vm(u),pe(n.connections,e,u),u}function vm(e){for(let n of ae(e)){let t=ke(e,n);if(!t)continue;let r=Object.create(null);r.configurable=!1,r.enumerable=t.enumerable,$e(t,"value")?(r.value=t.value,r.writable=!1):(r.get=t.get,r.set=t.set),Ma(e,n,r)}}var Ot=Set.prototype,qa=Map.prototype,Ga=Ot.has,Dt=Ot.add,wm=Ot.delete,Ya=Ot.values,xm=Object.getOwnPropertyDescriptor(Ot,"size")?.get,km=Object.getOwnPropertyDescriptor(qa,"size")?.get,$m=qa.keys,Xa=Object.getPrototypeOf(new Set().values()).next,Em=Object.getPrototypeOf(new Map().keys()).next,fo=["union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"];function ho(e){return typeof e=="object"&&e!==null||typeof e=="function"}function mo(e,n,t){let r=[];for(;;){let o=x(n,e,[]);if(o.done)return r;r[r.length]=t(o.value)}}function Tm(e){return mo(x(Ya,e,[]),Xa,n=>n)}function Ka(e,n){let t=new Set;for(let r=0;r<n.length;r+=1)x(Dt,t,[n[r]]);return{size:e,has:r=>x(Ga,t,[r]),open(){let r=0;return{step:()=>r<n.length?{done:!1,value:n[r++]}:{done:!0},close(){}}}}}function _m(e){let n=+e;if(n!==n)throw new TypeError("Set-like size is invalid");let t=Ca(n);if(t<0)throw new RangeError("Set-like size is negative");return t}function Sm(e,n){if(!ho(e))throw new TypeError("Set-like expected");let t=n.ownerOf(e),r=t??e;if(typeof r=="object"&&Mn(r)){let a=mo(x(Ya,r,[]),Xa,n.unwrap);return Ka(x(xm,r,[]),a)}if(typeof r=="object"&&An(r)){let a=mo(x($m,r,[]),Em,n.unwrap);return Ka(x(km,r,[]),a)}let o=_m(R(r,"size",e)),i=R(r,"has",e);if(typeof i!="function")throw new TypeError("Set-like has must be a function");let s=R(r,"keys",e);if(typeof s!="function")throw new TypeError("Set-like keys must be a function");return{size:o,has:a=>!!x(i,r,[t?a:n.view(a)]),open(){let a=x(s,r,[]);if(!ho(a))throw new TypeError("Set-like keys must return an object");let d=R(a,"next",a);if(typeof d!="function")throw new TypeError("Set-like iterator next must be a function");return{step(){let u=x(d,a,[]);if(!ho(u))throw new TypeError("Set-like iterator result must be an object");return R(u,"done",u)?{done:!0}:{done:!1,value:n.unwrap(R(u,"value",u))}},close(){let u=R(a,"return",a);typeof u=="function"&&x(u,a,[])}}}}}function Am(e){let n=new Set;for(let t=0;t<e.length;t+=1)x(Dt,n,[e[t]]);return n}function Cn(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return;n(r.value)}}function Va(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return!1;if(n(r.value))return t.close(),!0}}function Wa(e,n){for(let t=0;t<e.length;t+=1)if(n(e[t]))return!0;return!1}function Za(e,n,t,r){let o=Sm(t,r),i=Tm(n),s=i.length<=o.size,a=p=>x(Ga,n,[p]),d=Am(i),u=p=>{x(Dt,d,[p])},m=p=>{x(wm,d,[p])};switch(e){case"union":return Cn(o,u),d;case"intersection":{let p=new Set;if(s)for(let g=0;g<i.length;g+=1)o.has(i[g])&&x(Dt,p,[i[g]]);else Cn(o,g=>{a(g)&&x(Dt,p,[g])});return p}case"difference":if(s)for(let p=0;p<i.length;p+=1)o.has(i[p])&&m(i[p]);else Cn(o,m);return d;case"symmetricDifference":return Cn(o,p=>a(p)?m(p):u(p)),d;case"isSubsetOf":return i.length<=o.size&&!Wa(i,p=>!o.has(p));case"isSupersetOf":return i.length>=o.size&&!Va(o,p=>!a(p));default:return s?!Wa(i,o.has):!Va(o,a)}}var go=new WeakMap,nl=new WeakSet,bo=new WeakMap,Ja=new WeakMap,Ee=Map.prototype,He=Set.prototype,rl=new Map([["has",Ee.has],["get",Ee.get],["keys",Ee.keys],["values",Ee.values],["entries",Ee.entries],["forEach",Ee.forEach],[Symbol.iterator,Ee[Symbol.iterator]]]),ol=new Map([["has",He.has],["keys",He.keys],["values",He.values],["entries",He.entries],["forEach",He.forEach],[Symbol.iterator,He[Symbol.iterator]]]),Mm=Object.getOwnPropertyDescriptor(Ee,"size")?.get,Cm=Object.getOwnPropertyDescriptor(He,"size")?.get,Pm=Object.getPrototypeOf(new Map().entries()).next,Rm=Object.getPrototypeOf(new Set().values()).next,Dm=Promise.prototype.then,il=new Map,sl=new WeakSet,al=new Map,ll=new Map;function dl(e,n){for(let t of ae(e)){if(t==="constructor")continue;let r=ke(e,t);r&&typeof r.value=="function"&&(sl.add(r.value),n.set(t,r.value))}}dl(Object.prototype,ll);dl(Array.prototype,al);function Qa(e,n){let t=ke(e,n);return t&&$e(t,"value")?t.value:void 0}function cl(e,n,t){if(t){let o=al.get(n);if(o!==void 0&&Qa(Array.prototype,n)===e)return o}let r=ll.get(n);if(r!==void 0&&Qa(Object.prototype,n)===e)return r}for(let e of["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"])il.set(e,Object.prototype[e]);var el=Aa(Object.create(null)),Om=new Set(["toString","toJSON","toLocaleString","valueOf"]),Lm=new Set(["get","getAll","has","toISOString"]);function Im(e){if(typeof e!="object"||e===null)return!1;if(Rt(e))return!0;let n=Sn(e);return n===Object.prototype||n===null}function Hm(){throw new TypeError("Read-only")}function ul(e){let n=ee(Ja,e);if(n)return n;let t=function(){throw new TypeError("Read-only view: functions on this value cannot be called")};return Sa(t,null),pe(Ja,e,t),t}function Rn(e){return typeof e!="object"||e===null?e:ee(bo,e)??e}function Nm(e,n){return(...t)=>{let r=[];for(let o=0;o<t.length;o+=1)r[o]=Rn(t[o]);return D(x(e,n,r))}}function pl(e,n,t,r){let o=R(e,n,r);if(typeof o!="function")return D(o);if(Pt(sl,o))return o;let i=cl(o,n,Rt(e));return i!==void 0?i:Om.has(n)||!t&&Lm.has(n)?Nm(o,e):ul(o)}function*Fm(e,n){for(;;){let t=x(n,e,[]);if(t.done)return;yield D(t.value)}}function Bm(e,n,t){let r=ke(e,n);if(r)return Rt(t)&&n==="length"?{value:R(e,n,void 0),writable:!0,enumerable:!1,configurable:!1}:$e(r,"value")?{value:D(r.value),writable:!1,enumerable:r.enumerable,configurable:!0}:{get:()=>D(R(e,n,ee(go,e))),set:void 0,enumerable:r.enumerable,configurable:!0}}function yo(e){return{has:(n,t)=>xe(e,t),ownKeys:()=>ae(e),getOwnPropertyDescriptor:(n,t)=>Bm(e,t,n),getPrototypeOf:()=>Sn(e),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1}}function Um(e){return{...yo(e),get:(n,t,r)=>pl(e,t,!0,r)}}function jm(e){let n=Ha(e),t=(r,o)=>x(Dm,e,[i=>typeof r=="function"?r(D(i)):D(i),i=>{if(typeof o=="function")return o(D(i));throw D(i)}]);return{...yo(e),getPrototypeOf:()=>el,get(r,o,i){return o==="constructor"||o==="__proto__"?el:n&&o==="then"?t:n&&o==="catch"?s=>t(void 0,s):n&&o==="finally"?s=>t(a=>(typeof s=="function"&&s(),a),a=>{throw typeof s=="function"&&s(),a}):pl(e,o,!1,i)}}}var zm=new Set([...rl.keys()]),Km=new Set([...ol.keys(),...fo]),Vm=new Set(fo),Wm=new Set(["keys","values","entries",Symbol.iterator]),qm={unwrap:Rn,view:e=>D(e),ownerOf:e=>ee(bo,e)};function tl(e,n,t){let r=t?Km:zm,o=t?ol:rl,i=t?Cm:Mm,s=t?Rm:Pm,a=new Proxy(n,{...yo(e),get(d,u){if(u==="constructor"||u===Symbol.species)return R(e,u,a);if(u==="size")return x(i,e,[]);if(r.has(u)){if(Vm.has(u))return v=>{let E=Za(u,e,v,qm);return typeof E=="boolean"?E:D(E)};let g=o.get(u);return u==="get"?v=>D(x(g,e,[Rn(v)])):u==="has"?v=>x(g,e,[Rn(v)]):Wm.has(u)?()=>Fm(x(g,e,[]),s):(v,E)=>x(g,e,[(M,S)=>x(v,E,[D(M),D(S),a])])}let m=R(e,u,a);if(typeof m!="function")return D(m);let p=il.get(u);return p!==void 0&&(p===m||cl(m,u,!1)===p)?u==="valueOf"?()=>a:(...g)=>x(p,e,g):Hm}});return a}function Pn(e,n){return pe(go,e,n),_n(nl,n),pe(bo,n,e),n}function D(e){if(typeof e=="function")return ul(e);if(typeof e!="object"||e===null||Pt(nl,e))return e;let n=ee(go,e);if(n)return n;if(La(e))return new Date(Ia(e));if(An(e))return Pn(e,tl(e,new Map,!1));if(Mn(e))return Pn(e,tl(e,new Set,!0));if(!Im(e))return Pn(e,new Proxy({},jm(e)));let t=Rt(e)?[]:{};return Pn(e,new Proxy(t,Um(e)))}var fl=new WeakMap,hl=new WeakMap,Gm=Symbol("shared");function gl(e){let n=ee(fl,e);n&&(n.state.disposed=!0,ja(n.state))}function Ym(e,n){let t=R(e,"connection",void 0),r=typeof t=="object"&&t!==null?t:e,o=ee(hl,r);o||(o=new Map,pe(hl,r,o));let i=o.get(n);if(i&&!i.disposed)return i;let s=Ua();return o.set(n,s),s}var ml=new Map(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"].map(e=>[e,Object.prototype[e]])),Xm="Preview closed: this read-only hass has been disposed";function bl(e,n=Gm){let t=e,r=Ym(t,n),o=()=>{if(r.disposed)throw new Error(Xm)},i=new Proxy({},{has(s,a){return a!=="auth"&&xe(t,a)},ownKeys(){return ae(t).filter(s=>s!=="auth")},getOwnPropertyDescriptor(s,a){if(!(a==="auth"||!xe(t,a)))return{value:i[a],enumerable:!0,configurable:!0,writable:!1}},get(s,a){if(a==="auth")return;let d=R(t,a,i);if(a==="connection")return za(d,r);if(ml.has(a)&&d===ml.get(a))return a==="hasOwnProperty"?m=>m!=="auth"&&$e(t,m):a==="valueOf"?()=>i:a==="toString"||a==="toLocaleString"?()=>"[object Object]":a==="isPrototypeOf"?()=>!1:m=>m!=="auth"&&Da(t,m);if(typeof d!="function")return D(d);let u=d;switch(a){case"callService":return async(m,p)=>{F(`service:${String(m)}.${String(p)}`)};case"callWS":return async m=>{o();let p=nt(m);if(rt(p))return x(u,t,[p.msg]);F(ot(p))};case"callApi":return async(m,p,...g)=>{if(o(),typeof m=="string"&&En(m)){if(!xn(p,!0)||!kn(p)){F(`api-path:${$n(p)}`);return}return x(u,t,[m,p,...g])}F(`api:${Tn(m)}`)};case"callApiRaw":return async(m,p,g,v,...E)=>{if(o(),typeof m!="string"||!En(m)){F(`api:${Tn(m)}`);return}if(!xn(p,!0)||!kn(p)){F(`api-path:${$n(p)}`);return}let M=typeof v=="object"&&v!==null?{...v}:v;if(co(M)){F("api-header:method-override");return}return x(u,t,[m,p,g,M,...E])};case"fetchWithAuth":return async(m,p)=>{if(o(),!xn(m)||!kn(m)){F(`fetch-path:${$n(m)}`);return}if(p==null)return x(u,t,[m,p]);let g={...p};if(co(g.headers)){F("fetch-header:method-override");return}let v=g.method;if(!En(v)){F(`fetch:${Tn(v)}`);return}return x(u,t,[m,g])};default:return Ct(a)==="loader"?Oa(u,t):Ct(a)==="read"?(...m)=>D(x(u,t,m)):async()=>{F(String(a))}}},set(){return!1},defineProperty(){return!1},deleteProperty(){return!1},setPrototypeOf(){return!1},preventExtensions(){return!1}});return pe(fl,i,{state:r}),i}function Dn(e){return Number.isFinite(e)?Math.min(98,Math.max(2,e)):50}function yl(e,n){return n.width>0?Dn((e-n.left)/n.width*100):50}function vl(e){return`inset(0 0 0 ${e}%)`}var Zm="__default__",Jm=6,Qm=8,ef=160,wl=["light","switch","climate","cover","media_player","sensor","binary_sensor"],tf=new Set(["person","zone","sun","update","event","conversation","tts","todo","weather"]);function vo(e){return e??Zm}function nf(e){return O(e)&&e.code==="config_not_found"}function rf(e){let n=O(e)?e.message:e;return typeof n=="string"?Array.from(n).slice(0,ef).join(""):""}async function xl(e,n){try{return{status:"ok",config:await Is(e,n)}}catch(t){return nf(t)?{status:"notfound"}:{status:"error",reason:rf(t)}}}function of(e){return e!==void 0&&(e.status==="notfound"||e.status==="ok"&&!it(e.config))}async function kl(e,n,t){let r=[];for(let o of e){let i=await n(o.url_path);if(t())return{entries:r,options:e,stale:!0};if(r.push(i),i.status==="ok"&&it(i.config)){let a=o.url_path!==null&&e[0]?.url_path===null&&of(r[0])?e.filter(d=>d.url_path!==null):e;return{hit:{entry:i,urlPath:o.url_path},entries:r,options:a,stale:!1}}}return{entries:r,options:e,stale:!1}}function it(e){return e?qr(e).some(n=>Gr(n).length>0):!1}function $l(e){let n=new Map;for(let s of Object.keys(e??{})){let a=s.indexOf(".");if(a<=0)continue;let d=s.slice(0,a),u=n.get(d)??[];u.push(s),n.set(d,u)}let t=[...n.keys()].filter(s=>!wl.includes(s)&&!tf.has(s)).sort(),r=[...wl.filter(s=>n.has(s)),...t];r.length===0&&(r=[...n.keys()].sort());let o=new Map(Object.entries(f.domainTitles)),i=r.slice(0,Jm).map(s=>({type:"entities",title:o.get(s)??s,entities:(n.get(s)??[]).sort().slice(0,Qm)}));if(i.length!==0)return{views:[{title:f.sampleView,cards:i}]}}function El(e){return e.status==="notfound"?f.generatedDefault:e.reason?`${f.loadError} ${e.reason}`:f.loadError}function Tl(e,n){let t=e?qr(e):[];if(t.length===0)return{views:t,cards:[],notice:f.noViews};if(!it(e))return{views:t,cards:[],notice:f.noCards};let r=Gr(t[n]??t[0]);return Yr(r)>As?{views:t,cards:[],notice:f.tooManyCards}:{views:t,cards:r,notice:r.length===0?f.emptyView:""}}function _l(e,n){return e.find(t=>t.url_path===n)?.title??f.defaultDashboard}var sf="hats_lite_compare",af="hats_lite_compare_designer";function Sl(e){return e?sf:af}function Al(e=!0){try{let n=window.localStorage.getItem(Sl(e));return n===null?e:n!=="0"}catch{return e}}function Ml(e,n=!0){try{window.localStorage.setItem(Sl(n),e?"1":"0")}catch{return}}var Pl="hats_lite_preview_menu";var Rl={menu:"M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z",overview:"M13 3v6h8V3zM13 21h8V11h-8zM3 21h8v-6H3zM3 13h8V3H3z",map:"M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z",logbook:"M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 11h2v2H3zM3 17h2v2H3z",history:"M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z",energy:"M13 2 4 14h6l-1 8 9-12h-6z",settings:"M10.5 2h3l.5 2.6 1.8.8 2.2-1.5 2.1 2.1-1.5 2.2.8 1.8 2.6.5v3l-2.6.5-.8 1.8 1.5 2.2-2.1 2.1-2.2-1.5-1.8.8-.5 2.6h-3L10 20.4l-1.8-.8-2.2 1.5-2.1-2.1 1.5-2.2-.8-1.8L2 13.5v-3l2.6-.5.8-1.8-1.5-2.2L6 3.9l2.2 1.5 1.8-.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",bell:"M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4.5-5.8V4.5a1.5 1.5 0 0 0-3 0v.7A6 6 0 0 0 6 11v5l-2 2v1h16v-1z",search:"M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3zm0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z",more:"M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"},Dl=["overview","map","logbook","history","energy"],Ol=["settings","bell"];function Ll(){try{return window.localStorage.getItem(Pl)!=="0"}catch{return!0}}function Il(e){try{window.localStorage.setItem(Pl,e?"1":"0")}catch{return}}function Hl(e,n){return n&&e!=="phone"}var Cl={desktop:0,tablet:820,phone:390};function Nl(e,n){return e==="desktop"?"100%":n?`calc(${Cl[e]}px + var(--hats-lite-sidebar-width))`:`${Cl[e]}px`}function Fl(e){return e?"calc(256px * var(--hats-lite-density-scale, 1))":"0px"}function lf(e){return e.startsWith("card-mod-")||e.startsWith("uix-")}function Lt(e){if(!e)return!1;let n=e.entry;return(n?[n.vars,n.modes?.dark,n.modes?.light]:[e.vars]).some(r=>Object.keys(r??{}).some(lf))}var df="HomeRiz/hats";function Ne(e){let n=typeof e=="string"?e:e?.full_name;return typeof n=="string"&&n.toLowerCase()===df.toLowerCase()}var Bl=/^[A-Za-z0-9_.-]+$/,cf={marketplace:"the Marketplace",hacs:"HACS",generic:"the Marketplace or HACS"},uf={marketplace:"Marketplace",hacs:"HACS",generic:"Marketplace or HACS"};function Fe(e){let n=e?.config?.components;return Array.isArray(n)?n.includes("marketplace")?"marketplace":n.includes("hacs")?"hacs":"generic":"generic"}function pf(e){return cf[e]}function hf(e){return uf[e]}function te(e,n){return e.replaceAll("{store}",pf(n)).replaceAll("{label}",hf(n))}function On(e,n,t,r){if(!Bl.test(n)||!Bl.test(t))return;let o=new URLSearchParams({owner:n,repository:t,category:r});return e==="marketplace"?`/marketplace/repository?${o.toString()}`:`https://my.home-assistant.io/redirect/hacs_repository/?${o.toString()}`}var mf="hats_lite/install_theme",ff="hats_lite/uninstall_theme",wo="hats-lite-theme-installed",gf=12e3,It=0,bf=/^https:\/\/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;function Ul(e,n){let t=n?bf.exec(n):null;if(t)return On(e,t[1],t[2],"theme")}function In(e){if(typeof e!="object"||e===null)return"";let n=e.code;return typeof n=="string"?n:""}function yf(e,n="install",t="generic"){let r=In(e),o=n==="install"?f.installErrors:f.uninstallErrors,i=Object.prototype.hasOwnProperty.call(o,r)?o[r]:o.unknown;return te(i,t)}function jl(){return It>0}var Ln=class{constructor(n){this.host=n;this.phase="idle";this.op="install";this.error="";this.stale=!1;this.epoch=0}set(n,t=""){this.phase=n,this.error=t,this.host.requestUpdate()}focus(n){this.host.updateComplete.then(()=>this.host.renderRoot.querySelector(n)?.focus())}button(){return this.op==="install"?".install":".uninstall"}clearTimer(){this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}dispose(){this.epoch+=1,this.clearTimer()}clearStale(){this.stale=!1}settle(n){this.phase!=="done"||this.op!==n||(this.clearTimer(),this.set("idle"))}begin(n){this.phase!=="idle"||It>0||(this.op=n,this.set("confirm"),this.focus(".install-confirm"))}cancel(){this.phase==="confirm"&&(this.set("idle"),this.focus(this.button()))}reset(){this.stale=!1,this.epoch+=1,this.clearTimer(),(this.phase!=="idle"||this.error)&&this.set("idle")}async run(n,t,r,o){if(this.phase!=="confirm"||!n||It>0)return;let i=Fe(n),s=this.epoch,a=this.op;this.set("busy"),this.focus(this.button()),It+=1;let d=!1,u="",m;try{let p={type:a==="install"?mf:ff,full_name:t.fullName,hacs_id:t.hacsId};a==="uninstall"&&o&&(p.selected_theme=o);let g=await P(n,p);typeof g?.reset_selected=="boolean"&&(m=g.reset_selected)}catch(p){if(d=In(p)==="reload_failed",u=yf(p,a,i),!d){s===this.epoch&&this.set("idle",u),this.focus(this.button());return}}finally{It-=1,this.host.requestUpdate()}r({fullName:t.fullName,partial:d,...a==="uninstall"?{removed:!0,resetSelected:m}:{}}),s===this.epoch&&(a==="uninstall"&&(this.stale=!0),this.set(d?"idle":"done",u),!d&&(this.focus(this.button()),this.timer=setTimeout(()=>{this.timer=void 0,!(s!==this.epoch||this.phase!=="done")&&(this.set("idle",te(a==="install"?f.installTimeout:f.uninstallTimeout,i)),r({fullName:t.fullName,partial:!0}))},gf)))}};var vf="hats_lite/add_original",wf=3e3;function xf(e){let n=In(e),t=f.originalErrors;return Object.prototype.hasOwnProperty.call(t,n)?t[n]:t.unknown}function kf(e,n){let t=e?.themes?.themes;return!!t&&Object.prototype.hasOwnProperty.call(t,n)}var Hn=class{constructor(n){this.host=n;this.phase="idle";this.error="";this.epoch=0}clearTimer(){this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}set(n,t=""){this.phase=n,this.error=t,this.host.requestUpdate()}reset(){this.epoch+=1,this.clearTimer(),(this.phase!=="idle"||this.error)&&this.set("idle")}dispose(){this.epoch+=1,this.clearTimer()}async run(n,t){let r=this.host.hass;if(this.phase==="busy"||!r)return;let o=this.epoch;this.set("busy");try{await P(r,{type:vf,name:n})}catch(i){o===this.epoch&&this.set("idle",xf(i));return}o===this.epoch&&(this.set("done"),this.clearTimer(),this.timer=setTimeout(()=>{this.timer=void 0,!(o!==this.epoch||this.phase!=="done"||kf(this.host.hass,n))&&(this.set("idle",f.originalWaiting),t())},wf))}};var zl="hats-lite-preview-nav",$f="select, input, textarea, [role='slider'], [contenteditable]";function Kl(e){if(e.defaultPrevented||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return 0;let n=e.composedPath()[0];return n instanceof Element&&n.closest($f)?0:e.key==="ArrowLeft"?-1:1}function st(e,n,t){let r=e+t;return r<0||r>=n?null:r}function Ef(e){return f.navPosition.replace("{name}",e.name).replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}function Tf(e,n){return e.locked===!0||st(e.index,e.total,n)===null}function Vl(e){return l`
    <div class="nav" role="group" aria-label=${f.navGroup}>
      <span class="nav-info">
        <span class="nav-name">${e.name}</span>
        <span class="nav-pos">${f.navCount.replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}</span>
      </span>
      <span class="sr-only" role="status" aria-live="polite">${e.pending?f.navLoading:e.error||Ef(e)}</span>
    </div>`}function xo(e,n,t){let r=Tf(e,n),o=n===-1;return l`
    <div class=${o?"nav-side nav-side-prev":"nav-side nav-side-next"}>
      <button type="button" class=${o?"nav-btn nav-prev":"nav-btn nav-next"}
        aria-label=${o?f.navPrev:f.navNext} aria-disabled=${r?"true":"false"}
        @click=${()=>{r||t(n)}}>${o?"←":"→"}</button>
    </div>`}async function Wl(e,n,t){let r=window.hatsLite;if(!r)return f.trialUnavailable;try{return await r.startTrial(Ps(e),Rs(n,t)),""}catch{return f.trialFailed}}function ko(e,n,t){if(e)return e;if(!n)return;let r=t?.themes?.darkMode?"dark":"light";return n===r?void 0:n}var at=e=>e??c;function $o(e){return e.show&&e.admin&&e.hasTarget}function Eo(e){return e.stale||e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done")}function _f(e){return e.op==="install"&&e.phase==="busy"?f.installBusy:e.op==="install"&&e.phase==="done"?f.installLoading:f.installButton}function ql(e,n){let t=e.op==="install"&&(e.phase==="busy"||e.phase==="done"),r=t||e.locked||e.phase==="confirm";return l`<button type="button" class="btn primary success install" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} @click=${()=>{r||n.onBegin("install")}}>${_f(e)}</button>`}function Sf(e){return e.op!=="uninstall"?f.uninstallButton:e.phase==="busy"?f.uninstallBusy:e.phase==="done"?f.uninstallUpdating:f.uninstallButton}function Gl(e,n){if(!e.canUninstall)return c;let t=e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done"),r=Eo(e)||e.locked||e.inUse||e.phase==="confirm",o=()=>{r||n.onBegin("uninstall")};return l`
    <button type="button" class="btn danger uninstall" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} aria-describedby=${at(e.inUse?"uninstall-hint":void 0)} @click=${o}>${Sf(e)}</button>
    ${e.inUse?l`<p id="uninstall-hint" class="chip note">${f.uninstallSwitchFirst}</p>`:c}`}function Af(e){return e.storeHref?l`<a class="chip link store-link" href=${e.storeHref} target="_blank" rel="noopener noreferrer">${te(f.openInStore,e.store)}</a>`:c}function Mf(e){return n=>{if(n.key==="Escape"){n.stopPropagation(),e.onCancel();return}if(n.key!=="Tab")return;let t=n.currentTarget,r=Array.from(t.querySelectorAll("button")),o=r[0],i=r[r.length-1],s=t.getRootNode().activeElement;n.shiftKey&&s===o?(n.preventDefault(),i.focus()):!n.shiftKey&&s===i&&(n.preventDefault(),o.focus())}}function Cf(e,n){let t=e.op==="uninstall",r=()=>{e.locked||n.onConfirm()},o=te(t?f.uninstallConfirmBody:f.installConfirmBody,e.store);return l`
    <div class="install-dialog" role="alertdialog" aria-labelledby="install-title" aria-describedby="install-body" @keydown=${Mf(n)}>
      <strong id="install-title">${t?f.uninstallConfirmTitle:f.installConfirmTitle}</strong>
      <p id="install-body">${o.replace("{repo}",e.repoName)}</p>
      <button type="button" class="btn install-confirm ${t?"danger":"primary success"}" aria-disabled=${e.locked?"true":"false"} @click=${r}>${t?f.uninstallConfirmYes:f.installConfirmYes}</button>
      <button type="button" class="btn install-cancel" @click=${n.onCancel}>${f.installCancel}</button>
    </div>`}function Pf(e){return e.phase==="busy"?e.op==="install"?f.installBusy:f.uninstallBusy:e.phase==="done"?e.op==="install"?f.installWaiting:f.uninstallWaiting:""}function Yl(e,n){let t=e.phase==="confirm"&&($o(e)||e.canUninstall)?Cf(e,n):c,r=Pf(e),o=l`<span class="sr-only install-status" role="status">${r}</span>`,i=c;e.show&&!e.admin?i=l`<p class="chip note">${te(f.adminOnly,e.store)}</p>`:e.show&&!e.hasTarget&&(i=l`<p class="chip note">${te(f.installViaStore,e.store)}</p>`);let s=e.show&&(!e.admin||!e.hasTarget||e.error!=="");return l`${i}${t}${o}${s?Af(e):c}`}var Jl="/hats_lite_static/real",Rf="/hats_lite_real",Xl=/^\w[\w.-]*\/\w[\w.-]*\.webp$/,Df=/^[0-9a-f]{7,40}$/,Ql={fetchIndex(){return fetch(`${Jl}/index.json`,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(String(e.status));return e.json()})},fetchRemote(e){return e.connection.sendMessagePromise({type:"hats_lite/real_index"})}},Of=300*1e3,Zl=null,he=null;function Lf(e,n=Jl){let t=e;return!t||t.version!==1||!Array.isArray(t.items)?[]:ed(t.items,n)}function If(e){let n=e;return!n||!Array.isArray(n.items)?[]:ed(n.items,Rf)}function ed(e,n){let t=[];for(let r of e){if(!r||typeof r!="object")continue;let{full_name:o,name:i,commit:s,dark:a,light:d}=r;if(typeof o!="string"||typeof i!="string"||typeof s!="string"||!Df.test(s))continue;let u=typeof a=="string"&&Xl.test(a),m=typeof d=="string"&&Xl.test(d);!u&&!m||t.push({full_name:o,name:i,base:n,commit:s,dark:u?a:"",light:m?d:""})}return t}function Hf(){return Promise.resolve().then(()=>Ql.fetchIndex()).then(e=>Lf(e)).catch(()=>[])}function Nf(e){let n={at:Date.now(),settled:!1,empty:!0,promise:Promise.resolve([])};return n.promise=Promise.resolve().then(()=>Ql.fetchRemote(e)).then(If).catch(()=>[]).then(t=>(n.settled=!0,n.empty=t.length===0,t)),n}function Ff(e){let n=he&&he.settled&&he.empty&&Date.now()-he.at>=Of;return(!he||n)&&(he=Nf(e)),he}function td(e){Zl??=Hf();let n=e?Ff(e).promise:he?he.promise:Promise.resolve([]);return Promise.all([Zl,n]).then(([t,r])=>{let o=new Set(t.map(i=>`${i.full_name}
${i.name}`));return[...t,...r.filter(i=>!o.has(`${i.full_name}
${i.name}`))]})}function nd(e,n,t){if(!(!n||!t))return e.find(r=>r.full_name===n&&r.name===t)}function rd(e,n){let t=n==="dark"?"light":"dark";for(let r of[n,t])if(e[r])return{url:`${e.base}/${e[r]}`,mode:r};return null}function od(e,n){if(!e.available)return c;let t=r=>()=>{e.real!==r&&n(r)};return l`
    <div class="field look-switch">${f.lookLabel}
      <div class="seg" role="group" aria-label=${f.lookLabel}>
        <button type="button" class="look-real" aria-pressed=${e.real?"true":"false"} @click=${t(!0)}>${f.realLook}</button>
        <button type="button" class="look-live" aria-pressed=${e.real?"false":"true"} @click=${t(!1)}>${f.livePreview}</button>
      </div>
    </div>`}function id(e,n,t){let r=rd(e,n);if(!r)return c;let o=f.realAlt.replace("{name}",e.name).replace("{mode}",f[r.mode].toLowerCase());return l`
    <figure class="real-look">
      <img src=${r.url} alt=${o} decoding="async" @error=${t} />
      <figcaption class="footnote real-caption">${f.realCaption.replace("{commit}",e.commit)}</figcaption>
    </figure>`}var sd=T`
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
`;function Ht(e){return l`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${cs`<path d=${Rl[e]} fill="currentColor" fill-rule="evenodd"></path>`}</svg>`}function ad(e,n){return l`<div class=${n?"item selected":"item"}>${Ht(e)}<span class="text">${f.shell[e]}</span></div>`}function Bf(){return l`
    <div class="sidebar">
      <div class="side-menu"><span class="side-burger">${Ht("menu")}</span><span class="side-title">${f.shell.title}</span></div>
      <div class="side-list">${Dl.map((e,n)=>ad(e,n===0))}</div>
      <div class="side-list fixed">
        ${Ol.map(e=>ad(e,!1))}
        <div class="item user"><span class="avatar">${f.shell.profile.charAt(0)}</span><span class="text">${f.shell.profile}</span></div>
      </div>
    </div>`}function Uf(e){return l`
    <div class="appbar">
      <span class="hamburger">${Ht("menu")}</span>
      <span class="title">${e}</span>
      <span class="tools">${Ht("search")}${Ht("more")}</span>
    </div>`}function To(e){return l`
    <div class="shell" aria-hidden="true" inert>
      ${Bf()}
      <div class="main">${Uf(e)}<div class="cards" inert></div></div>
    </div>`}function ld(e,n){let t=e.frame==="phone",r=o=>()=>{e.menu!==o&&n.onMenu(o)};return l`
    <div class="field menu-switch">${f.menu}
      <div class="seg" role="group" aria-label=${f.menu}>
        <button type="button" class="menu-on" aria-pressed=${e.menu?"true":"false"} ?disabled=${t} @click=${r(!0)}>${f.on}</button>
        <button type="button" class="menu-off" aria-pressed=${e.menu?"false":"true"} ?disabled=${t} @click=${r(!1)}>${f.off}</button>
      </div>
    </div>`}function dd(e){return e?l`<p class="footnote mod-note" role="status">${f.modNote}</p>`:c}function cd(e,n){if(!e.original)return c;if(e.phase==="done")return l`<p class="chip ok add-original-done" role="status">${f.originalDone}</p>`;if(e.installed)return c;if(!e.admin)return l`<p class="chip note">${f.originalAdminOnly}</p>`;let t=e.phase==="busy",r=t||e.locked;return l`
    <button type="button" class="btn primary success add-original" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} @click=${()=>{r||n.onAdd()}}>${t?f.originalBusy:f.originalAdd}</button>
    ${e.error?l`<p class="error" role="alert">${e.error}</p>`:c}`}var jf=600,ud=`(max-width: ${jf}px)`,le=en(`@media ${ud}`);function pd(e){if(typeof window.matchMedia!="function")return()=>{};let n=window.matchMedia(ud),t=r=>e(r.matches);return n.addEventListener("change",t),()=>n.removeEventListener("change",t)}var Te=44,zf="--hl-kb",md=T`
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
`,fd=T`
  .toolbar {
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }
  ${le} {
    .actions {
      bottom: var(--hl-kb, env(keyboard-inset-height, 0px));
      padding-top: 10px;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
    }
  }
`;function Kf(e,n){let t=n-e.height-e.offsetTop;return Number.isFinite(t)&&t>0?Math.round(t):0}var hd=!1;function _o(e=window){let n=e.visualViewport;if(hd||!n)return!1;hd=!0;let t=e.document.documentElement,r=()=>{t.style.setProperty(zf,`${Kf(n,e.innerHeight)}px`)};return n.addEventListener("resize",r),n.addEventListener("scroll",r),r(),!0}_o();var So=class extends A{constructor(){super(...arguments);this.open=!1;this.label="";this.stopWatching=()=>{};this.onKey=t=>{t.key!=="Escape"||!this.open||(t.stopPropagation(),this.close(!0))}}static{this.properties={open:{type:Boolean,reflect:!0},label:{type:String}}}static{this.styles=T`
    :host,
    .sheet {
      display: contents;
    }
    .toggle {
      display: none;
    }
    ${le} {
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
        min-height: ${Te}px;
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
  `}connectedCallback(){super.connectedCallback(),_o(),this.addEventListener("keydown",this.onKey),this.stopWatching=pd(t=>{t||(this.open=!1)})}disconnectedCallback(){this.removeEventListener("keydown",this.onKey),this.stopWatching(),this.stopWatching=()=>{},super.disconnectedCallback()}close(t){this.open=!1,t&&this.renderRoot.querySelector(".toggle")?.focus()}async toggle(){if(this.open)return this.close(!1);this.open=!0,await this.updateComplete,this.renderRoot.querySelector("#sheet")?.focus()}render(){return l`
      <button type="button" class="toggle" aria-expanded=${this.open?"true":"false"} aria-controls="sheet" @click=${()=>this.toggle()}>
        <span>${this.label}</span><span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="sheet" id="sheet" role="group" tabindex="-1" aria-label=${this.label}><slot></slot></div>
    `}};customElements.get("hats-lite-sheet")||customElements.define("hats-lite-sheet",So);var Vf={normal:"1",compact:"0.85"},Wf=["desktop","tablet","phone"],qf=["normal","compact"],Gf=["dark","light"];function gd(e,n,t,r){return{applicable:an(e),tryable:ln(e),trying:n,collision:e.nameCollision?f.nameCollision.replace("{name}",e.name):"",repo:Os(e.repoUrl),error:t,pending:r.pending,install:r.install,original:r.original}}function bd(e,n){return!e||Object.keys(dn(e,n)).length>0?"":f.noModeBlock.replace("{mode}",f[n].toLowerCase())}function Ao(e,n,t){return l`<button type="button" aria-pressed=${n?"true":"false"} @click=${t}>${e}</button>`}function Yf(e,n){return e.url_path===null&&n?`${e.title} ${f.generatedSuffix}`:e.title}function Xf(e,n){let t=r=>()=>{e.compare!==r&&n.onCompare()};return l`
    <div class="field view-switch">${f.compareLabel}
      <div class="seg" role="group" aria-label=${f.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${e.compare?"true":"false"}
          ?disabled=${!e.canCompare||e.real} aria-describedby=${at(e.real?"compare-hint":void 0)} @click=${t(!0)}>${f.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${e.compare?"false":"true"}
          ?disabled=${!e.canCompare||e.real} @click=${t(!1)}>${f.themeOnly}</button>
      </div>
      ${e.real?l`<span id="compare-hint" class="compare-hint">${f.compareHint}</span>`:c}
    </div>`}function yd(e,n){return l`
    <div class="toolbar">
      <hats-lite-sheet .label=${f.sheet}>
      <label class="field">${f.dashboard}
        <select class="pill" @change=${n.onDashboard}>
          ${e.dashboards.map((t,r)=>l`<option value=${String(r)} .selected=${t.url_path===e.dashboardUrl}>${Yf(t,e.generatedDefault)}</option>`)}
        </select>
      </label>
      ${e.showViews?l`<label class="field">${f.view}
            <select class="pill" @change=${n.onView}>
              ${e.views.map((t,r)=>l`<option value=${String(r)} .selected=${r===e.viewIndex}>${Hs(t,r)}</option>`)}
            </select>
          </label>`:c}
      <div class="seg" role="group" aria-label=${f.device}>
        ${Wf.filter(t=>!(t==="tablet"&&e.hide?.includes("tablet"))).map(t=>Ao(f[t],e.frame===t,()=>n.onFrame(t)))}
      </div>
      <div class="seg" role="group" aria-label=${f.density}>
        ${qf.map(t=>Ao(f[t],e.density===t,()=>n.onDensity(t)))}
      </div>
      ${e.hide?.includes("mode")?c:l`<div class="seg" role="group" aria-label=${f.mode}>
        ${Gf.map(t=>Ao(f[t],e.mode===t,()=>n.onMode(t)))}
      </div>`}
      ${ld({frame:e.frame,menu:e.menu},n)}
      ${od({available:e.realAvailable,real:e.real},n.onLook)}
      ${Xf(e,n)}
      </hats-lite-sheet>
    </div>`}function vd(e,n){let t=Hl(e.frame,e.menu);return l`
    <div class="frame" data-sidebar=${t?"on":"off"} style=${se({"--hats-lite-frame-width":Nl(e.frame,t),"--hats-lite-sidebar-width":Fl(t),"--hats-lite-density-scale":Vf[e.density]})}>
      <div class=${e.comparing?"stage":"stage solo"}>
        <div class="pane current">${To(e.title)}</div>
        <div class="pane candidate" style=${se(e.comparing?{clipPath:vl(e.split)}:{})}>${To(e.title)}</div>
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
              @pointercancel=${n.onPointerUp}></div>`:c}
        <div class="badges">
          ${e.comparing?l`<span class="badge">${f.current}</span>`:l`<span></span>`}
          <span class="badge">${e.candidateName}</span>
        </div>
      </div>
      ${e.note?l`<p class="empty-note" role="status">${e.note}</p>`:c}
    </div>
    <p class="footnote">${f.footnote}</p>
    ${dd(e.modNote)}`}function wd(e,n,t){return e?l`
    <div class="nav-frame">
      ${Vl(e)}
      ${xo(e,-1,n)}
      ${xo(e,1,n)}
      <div class="nav-content">${t}</div>
    </div>`:t}function xd(e,n){let t=Eo(e.install)||e.original.phase==="busy",r=e.collision?"collision-note":void 0,o=e.install.inUse&&!e.collision,i=l`<button type="button" class="btn primary success apply" aria-describedby=${at(r)} ?disabled=${!e.applicable||e.pending||t} @click=${n.onApply}>${e.collision&&!e.applicable?f.nameTaken:f.apply}</button>`;return l`
    <div class="actions">
      ${o?c:$o(e.install)?ql(e.install,n.install):i}
      ${o?c:l`<button type="button" class="btn try" aria-describedby=${at(r)} ?disabled=${!e.tryable||e.trying||e.pending||t} @click=${n.onTry}>${f.tryButton}</button>`}
      ${o&&!e.install.canUninstall?l`<span class="chip ok in-use-chip">${f.inUseChip}</span>`:c}
      ${Gl(e.install,n.install)}
      ${!e.applicable&&e.repo?l`<a class="chip link" href=${e.repo} target="_blank" rel="noopener noreferrer">${f.repoLink}</a>`:c}
      ${Yl(e.install,n.install)}
      ${cd(e.original,n.original)}
      ${e.collision?l`<p id="collision-note" class="chip warn collision" role="status">${e.collision}</p>`:c}
      ${e.error?l`<p class="error" role="alert">${e.error}</p>`:c}
    </div>`}var Nn=class{constructor(n){this.host=n;this.onKeyDown=n=>{let t=Kl(n),r=this.host.nav;t===0||!r||this.host.trying||st(r.index,r.total,t)===null||(n.preventDefault(),this.moveBy(t))};this.flow=new Ln(n),this.add=new Hn(n),n.addController(this)}hostConnected(){this.host.addEventListener("keydown",this.onKeyDown)}hostDisconnected(){this.flow.dispose(),this.add.dispose(),this.host.removeEventListener("keydown",this.onKeyDown)}hostUpdate(){let{candidate:n,install:t}=this.host;n&&this.flow.settle(n.installed?"install":"uninstall"),n&&!n.installed&&this.flow.clearStale();let r=(t??this.host.uninstall)?.fullName;if(n!==this.watched||r!==this.watchedKey){let o=n?.name===this.watched?.name&&r===this.watchedKey;this.watched=n,this.watchedKey=r,o||(this.flow.reset(),this.add.reset())}}moveBy(n){let t=this.host.nav;!t||this.host.trying||st(t.index,t.total,n)===null||this.host.dispatchEvent(new CustomEvent(zl,{detail:{direction:n},bubbles:!0,composed:!0}))}apply(){let{candidate:n,hass:t}=this.host;if(!n||!an(n)||this.host.nav?.pending)return;let r={theme:n.name},o=ko(this.host.userMode,this.host.mode,t);o&&(r.dark=o==="dark"),this.host.dispatchEvent(new CustomEvent("settheme",{detail:r,bubbles:!0,composed:!0}))}async tryTheme(){let{candidate:n,hass:t}=this.host;!n||!ln(n)||this.host.trying||this.host.nav?.pending||(this.host.error="",this.host.trying=!0,this.host.error=await Wl(t,n,ko(this.host.userMode,this.host.mode,t)),this.host.trying=!1)}selected(){let n=this.host.hass;return n?.selectedTheme?.theme??n?.themes?.theme??"default"}installModel(n){let t=this.host.hass?.user?.is_admin===!0,r=this.host.install??this.host.uninstall,o=this.host.nav?.pending===!0,i=Fe(this.host.hass),s=Ne(n.fullName);return{show:!n.installed&&!n.nameCollision&&!s,admin:t,hasTarget:!!this.host.install,phase:this.flow.phase,op:this.flow.op,locked:jl()||o,error:this.flow.error,repoName:r?.fullName??n.name,store:i,storeHref:Ul(i,n.repoUrl),canUninstall:t&&!!this.host.uninstall&&n.installed&&!n.nameCollision,stale:this.flow.stale,inUse:this.selected().toLowerCase()===n.name.toLowerCase()}}originalModel(n){return{original:Ne(n.fullName),installed:n.installed,admin:this.host.hass?.user?.is_admin===!0,locked:this.host.trying||this.host.nav?.pending===!0,phase:this.add.phase,error:this.add.error}}addOriginal(){let n=this.host.candidate,t=n?.fullName;!n||!t||!Ne(t)||this.add.run(n.name,()=>this.host.dispatchEvent(new CustomEvent(wo,{detail:{fullName:t,partial:!0},bubbles:!0,composed:!0})))}confirm(){let n=this.flow.op,t=n==="install"?this.host.install:this.host.uninstall;if(!t)return;let r=n==="uninstall"?this.selected():void 0;this.flow.run(this.host.hass,t,o=>this.host.dispatchEvent(new CustomEvent(wo,{detail:o,bubbles:!0,composed:!0})),r)}render(){let n=this.host.candidate;if(!this.host.showActions||!n)return c;let t=gd(n,this.host.trying,this.host.error||this.flow.error,{pending:this.host.nav?.pending===!0,install:this.installModel(n),original:this.originalModel(n)});return xd(t,{onApply:()=>this.apply(),onTry:()=>{this.tryTheme()},install:{onBegin:r=>this.flow.begin(r),onCancel:()=>this.flow.cancel(),onConfirm:()=>this.confirm()},original:{onAdd:()=>this.addOriginal()}})}};var kd=T`
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
`;var Zf="lovelace";async function $d(e){if(typeof e!="object"||e===null)return;let n=e,t=n.loadFragmentTranslation;if(typeof t!="function")return;let r,o=new Promise(i=>{r=setTimeout(i,3e3)});try{await Promise.race([Promise.resolve(t.call(n,Zf)).then(()=>{}),o])}catch{return}finally{clearTimeout(r)}}var Td=new Set(["states","entities","devices","areas","floors","labels","extendedEntities","config","themes","selectedTheme","user","panels","narrowViewport","hassRegistries","hassConfig"]),Jf=new Set(["localize","locale","hassInternationalization","hassFormatters","hassUi"]);function Qf(e){return typeof e=="string"&&(Td.has(e)||Jf.has(e))}function _d(e){if(typeof e!="object"||e===null||Array.isArray(e))return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null}function Ed(e,n,t){let r=R(e,n,t);if(typeof r=="function"){let o=r;return Ct(n)!=="read"?async()=>{F(`context:${String(n)}`)}:(...i)=>D(x(o,e,i))}return _d(r)?Sd(r):D(r)}function Sd(e){let n=new Proxy({},{has:(t,r)=>xe(e,r),ownKeys:()=>ae(e),getOwnPropertyDescriptor:(t,r)=>xe(e,r)?{value:Ed(e,r,n),enumerable:!0,configurable:!0,writable:!1}:void 0,get:(t,r)=>Ed(e,r,n),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1});return n}function eg(e,n){return Td.has(e)?D(n):typeof n=="object"&&n!==null?_d(n)?Sd(n):D(n):n}function tg(e){let n=e.getRootNode();return typeof ShadowRoot<"u"&&n instanceof ShadowRoot?n.host:e.parentElement}function Ad(e){let n=new Set,t=!0,r=i=>{let s=i,{context:a,callback:d}=s;if(!t||!Qf(a)||typeof d!="function")return;let u=tg(e);if(!u)return;i.stopPropagation();let m=i.composedPath()[0],p=d,g=new Map,v=(M,S)=>{if(!t)return;let U=S;if(typeof S=="function"){let I=S,X=g.get(I);if(!X){let j=()=>{n.delete(j),g.delete(I),I()};X=j,g.set(I,j),n.add(j)}U=X}p(eg(a,M),U)},E=new Event("context-request",{bubbles:!0,composed:!0});Object.assign(E,{context:a,callback:v,subscribe:s.subscribe===!0,contextTarget:m}),u.dispatchEvent(E)};return e.addEventListener("context-request",r),Object.assign(()=>{t=!1,e.removeEventListener("context-request",r);for(let i of n)try{i()}catch{continue}n.clear()},{pending:()=>n.size})}var ng=["hass-action","hass-more-info","show-dialog","hass-toggle-menu","location-changed","hass-dock-sidebar","hass-edit-sidebar","hass-set-theme","hass-service-called","hass-reload-themes","hass-open-link","popstate","iron-overlay-opened","ll-show-dashboard","hass-kiosk-mode","hass-language-select","hass-vibrate","hass-suspend-when-hidden","hass-enable-shortcuts","hass-time-zone-select","hass-date-format-select","hass-time-format-select","hass-first-weekday-select","hass-number-format-select","hass-refresh-current-user","hass-quick-bar-trigger","hass-show-notifications"],rg=["context-request","ll-custom","hass-notification","settheme","navigate","ll-open-dialog","hass-quick-bar","show-edit-card","ll-rebuild","hass-logout","config-refresh","dialog-closed","haptic"],og=new Set(["value-changed","iron-resize","iron-select","iron-deselect","iron-activate","iron-items-changed","selected","selected-changed","expanded-changed","opened-changed","input","change","load","error","focus","blur","focusin","focusout","click","dblclick","auxclick","contextmenu","mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave","pointerdown","pointerup","pointermove","pointerover","pointerout","pointerenter","pointerleave","pointercancel","gotpointercapture","lostpointercapture","touchstart","touchmove","touchend","touchcancel","keydown","keyup","keypress","wheel","scroll","resize","select","submit","reset","toggle","slotchange","transitionend","animationend","dragstart","dragend","dragenter","dragover","dragleave","drop"]),ig=new Set,sg=/^(hass-|ll-|show-)/;function Dd(e){return sg.test(e)&&!ig.has(e)}var ag=200,Nt=EventTarget.prototype.dispatchEvent,Od=EventTarget.prototype.addEventListener,Ld=EventTarget.prototype.removeEventListener,lg=window.addEventListener,dg=window.removeEventListener,cg=Event.prototype.composedPath,ug=Object.getOwnPropertyDescriptor(Node.prototype,"parentNode")?.get,pg=Object.getOwnPropertyDescriptor(Node.prototype,"nodeType")?.get,Md=typeof ShadowRoot>"u"?void 0:Object.getOwnPropertyDescriptor(ShadowRoot.prototype,"host")?.get,hg=11,Y=Reflect.apply,Ft=new WeakSet,Id=new Set,Bn=new WeakMap,Fn=new Set,Mo=new Map,Hd=0,Bt=0,lt=null;function Nd(e){e.stopPropagation()}function Un(e,n,t){let r=Bn.get(e);r||(r=new Map,Bn.set(e,r)),!r.has(n)&&(r.set(n,t),Y(Od,e,[n,Nd,{capture:t}]))}function Cd(e){try{if(Y(pg,e,[])===hg&&Md)return Y(Md,e,[])}catch{return e}return e}function Fd(e){if(typeof e!="object"||e===null)return null;let n=Cd(e);for(;n;){if(Ft.has(n))return n;let t=null;try{t=Y(ug,n,[])}catch{return null}n=t===null?null:Cd(t)}return null}function Pd(e){if(Bt===0)return;let n=Y(cg,e,[]),t=Fd(n.length>0?n[0]:e.target);t&&Un(t,e.type,Dd(e.type))}function mg(e,n){if(!Fn.has(n)){if(Fn.size>=ag)return!1;Fn.add(n),Mo.set(n,Pd),Y(lg,window,[n,Pd,{capture:!0}])}return Un(e,n,!1),!0}function Rd(e,n,t){let r=t.type,o=i=>i.stopPropagation();Y(Od,e,[r,o,{capture:!0}]);try{return Y(Nt,n,[t])}finally{Y(Ld,e,[r,o,{capture:!0}])}}function fg(){lt||(lt=function(n){if(Bt===0||!n||typeof n.type!="string"||og.has(n.type))return Y(Nt,this,[n]);let t=Fd(this);return t?Dd(n.type)?Rd(t,this,n):mg(t,n.type)?Y(Nt,this,[n]):(Hd+=1,Rd(t,this,n)):Y(Nt,this,[n])},Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:lt}))}function gg(){for(let[e,n]of Mo)Y(dg,window,[e,n,{capture:!0}]);Mo.clear(),Fn.clear(),Hd=0,lt&&EventTarget.prototype.dispatchEvent===lt&&(Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:Nt}),lt=null)}function Bd(e){if(!Ft.has(e)){Ft.add(e),Id.add(e),Bt+=1;for(let n of ng)Un(e,n,!0);for(let n of rg)Un(e,n,!1);fg()}}function Ud(e){if(!Ft.has(e))return;Ft.delete(e),Id.delete(e);let n=Bn.get(e);if(n){for(let[t,r]of n)Y(Ld,e,[t,Nd,{capture:r}]);Bn.delete(e)}Bt-=1,Bt===0&&gg()}var jn=class{sync(n){let t=n?.querySelector(".stage"),r=t instanceof HTMLElement?t:void 0;return r===this.current?!1:(this.release(),r&&(this.current=r,Bd(r),this.stopRelay=Ad(r)),r!==void 0)}release(){this.stopRelay?.(),this.stopRelay=void 0,this.current&&Ud(this.current),this.current=void 0}};var bg={"markdown-code-background-color":"var(--primary-background-color)","table-row-background-color":"var(--primary-background-color)","table-row-alternative-background-color":"var(--secondary-background-color)","table-header-background-color":"var(--secondary-background-color)","data-table-background-color":"var(--card-background-color)","input-ink-color":"var(--primary-text-color)","input-label-ink-color":"var(--secondary-text-color)","input-idle-line-color":"color-mix(in srgb, var(--primary-text-color) 42%, transparent)","input-hover-line-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-disabled-ink-color":"var(--disabled-text-color)","input-disabled-fill-color":"color-mix(in srgb, var(--primary-text-color) 2%, var(--card-background-color))","input-disabled-line-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-outlined-idle-border-color":"color-mix(in srgb, var(--primary-text-color) 38%, transparent)","input-outlined-hover-border-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-outlined-disabled-border-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-dropdown-icon-color":"var(--secondary-text-color)","mdc-text-field-fill-color":"var(--input-fill-color)","mdc-text-field-ink-color":"var(--input-ink-color)","mdc-text-field-label-ink-color":"var(--input-label-ink-color)","mdc-text-field-idle-line-color":"var(--input-idle-line-color)","mdc-text-field-hover-line-color":"var(--input-hover-line-color)","mdc-text-field-disabled-fill-color":"var(--input-disabled-fill-color)","mdc-text-field-disabled-ink-color":"var(--input-disabled-ink-color)","mdc-text-field-disabled-line-color":"var(--input-disabled-line-color)","mdc-text-field-outlined-idle-border-color":"var(--input-outlined-idle-border-color)","mdc-text-field-outlined-hover-border-color":"var(--input-outlined-hover-border-color)","mdc-text-field-outlined-disabled-border-color":"var(--input-outlined-disabled-border-color)","chip-background-color":"color-mix(in srgb, var(--primary-text-color) 15%, transparent)","label-badge-background-color":"var(--card-background-color)","label-badge-text-color":"var(--primary-text-color)","state-inactive-color":"var(--disabled-text-color)","ha-color-text-primary":"var(--primary-text-color)","ha-color-text-secondary":"var(--secondary-text-color)","ha-color-text-disabled":"var(--disabled-text-color)","ha-color-border-neutral-quiet":"var(--divider-color)","ha-color-fill-neutral-quiet-resting":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))"},zd={...bg,"state-active-color":"var(--amber-color, #ffc107)","state-light-active-color":"var(--state-active-color, #ffc107)","slider-color":"var(--primary-color)","paper-slider-active-color":"var(--primary-color)","mdc-theme-surface":"var(--card-background-color)","mdc-theme-on-surface":"var(--primary-text-color)","mdc-theme-primary":"var(--primary-color)","mdc-theme-secondary":"var(--accent-color)","input-fill-color":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))","mdc-select-fill-color":"var(--input-fill-color)","outline-color":"var(--divider-color)","switch-checked-color":"var(--primary-color)","switch-checked-button-color":"var(--switch-checked-color, var(--primary-color))","switch-checked-track-color":"var(--switch-checked-color, var(--primary-color))","state-icon-color":"var(--paper-item-icon-color, #44739e)"},yg={"primary-color":"rgb-primary-color","accent-color":"rgb-accent-color","primary-text-color":"rgb-primary-text-color","secondary-text-color":"rgb-secondary-text-color","card-background-color":"rgb-card-background-color","primary-background-color":"rgb-primary-background-color"},vg=/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,wg=/^(rgba?|hsla?)\(\s*([^)]*)\)$/i,xg=/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)$/i;function Kd(e){return Math.max(0,Math.min(255,Math.round(e)))}function kg(e){let n=vg.exec(e);if(!n)return null;let t=n[1];return t.length<=4&&(t=[...t].map(r=>r+r).join("")),[0,2,4].map(r=>parseInt(t.slice(r,r+2),16))}function $g(e){let n=e.endsWith("%"),t=Number(n?e.slice(0,-1):e);return Number.isFinite(t)?n?t/100*255:t:null}function Eg(e){let n=Number(e[0].replace(/deg$/i,"")),t=Number(e[1].replace(/%$/,""))/100,r=Number(e[2].replace(/%$/,""))/100;if(![n,t,r].every(Number.isFinite))return null;let o=a=>(a+n/30)%12,i=t*Math.min(r,1-r),s=a=>r-i*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[s(0),s(8),s(4)].map(a=>Kd(a*255))}function Tg(e,n){let t=n.split(/[\s,/]+/).filter(Boolean).slice(0,3);if(t.length<3)return null;if(e.startsWith("hsl"))return Eg(t);let r=t.map($g);return r.some(o=>o===null)?null:r.map(Kd)}function jd(e){let n=e.trim().replace(/\s*!important$/i,""),t=kg(n);if(t)return t;let r=wg.exec(n);return r?Tg(r[1].toLowerCase(),r[2]):null}function _g(e,n){let t=xg.exec(e.trim());if(!t)return jd(e);let r=n[t[1]];return typeof r=="string"?jd(r):null}function Vd(e){let n={};for(let[t,r]of Object.entries(yg)){if(!(t in e)||r in e)continue;let o=_g(e[t],e);o&&(n[r]=o.join(", "))}return n}var Wd=new WeakMap;function qd(e,n){let t=JSON.stringify(n);Wd.get(e)!==t&&(Wd.set(e,t),Fs(e),Ye(e,n))}var Sg=["lovelace-background","ha-card-border-radius","ha-card-box-shadow","ha-card-border-width","ha-card-border-color","ha-card-background","ha-card-backdrop-filter","primary-font-family","paper-font-body1_-_font-family","text-primary-color","rgb-primary-color","rgb-accent-color","rgb-primary-text-color","rgb-secondary-text-color","rgb-card-background-color","rgb-primary-background-color","light-primary-color","dark-primary-color","secondary-background-color","state-icon-color","paper-item-icon-color","disabled-text-color","divider-color","card-background-color","primary-background-color","primary-text-color","secondary-text-color","primary-color","accent-color","app-header-background-color","app-header-text-color","app-header-selection-bar-color","app-header-edit-background-color","app-header-edit-text-color","app-header-border-bottom","sidebar-background-color","sidebar-text-color","sidebar-icon-color","sidebar-selected-background-color","sidebar-selected-text-color","sidebar-selected-icon-color"];function Gd(e,n,t){let r={};for(let o of t)r[o]="initial";return{...r,...zd,...wn[n],...Vd(e),...e}}function Yd(e,n,t,r){let o=e.querySelector(".pane.current"),i=e.querySelector(".pane.candidate"),s=Ms(n),a=s?J(s,r):{},d=t?dn(t,r):a,u=new Set([...Sg,...Wr(s),...Wr(t?.entry),...Object.keys(t?.vars??{}),...Object.keys(d)]);o instanceof HTMLElement&&qd(o,Gd(a,r,u)),i instanceof HTMLElement&&qd(i,Gd(d,r,u))}function Xd(e,n){e.querySelectorAll(".cards > *").forEach(t=>{t.hass=n})}var Zd=T`
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
`;var Jd=T`
  ${le} {
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
      height: ${Te}px;
    }
    hats-lite-sheet .seg {
      display: flex;
    }
    hats-lite-sheet .seg button {
      flex: 1 1 0;
      min-height: ${Te}px;
    }
    .actions .btn {
      min-height: ${Te}px;
    }
  }
`,Qd=T`
  .page {
    padding-left: max(24px, env(safe-area-inset-left, 0px));
    padding-right: max(24px, env(safe-area-inset-right, 0px));
  }
  ${le} {
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
      min-height: ${Te}px;
      padding: 6px 2px;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`,ec=T`
  ${le} {
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
      min-height: ${Te}px;
    }
  }
`;var Ag=T`
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
  ${le} {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 5;
    }
  }
`,tc=[V,W,Ag,Zd,md,fd,Jd];var Mg=2,Cg=98,Pg=5,Rg=10;function nc(e,n,t=!1,r=!1){if(r)return null;let o=t?Rg:Pg;switch(e){case"ArrowLeft":case"ArrowDown":return Dn(n-o);case"ArrowRight":case"ArrowUp":return Dn(n+o);case"Home":return Mg;case"End":return Cg;default:return null}}function rc(e){let n=e.currentTarget;typeof n.setPointerCapture=="function"&&n.setPointerCapture(e.pointerId)}function oc(e){let n=e.currentTarget;typeof n.releasePointerCapture=="function"&&n.releasePointerCapture(e.pointerId)}var Dg=300*1e3,zn=class{constructor(n){this.host=n;this.items=[];this.requested=!1;this.withHass=!1;this.failed=new Set;this.loading=!1;this.at=0;this.shown=!1}sync(n){if(!Lt(n))return;let t=this.host.hass,r=this.requested&&this.withHass&&!!t&&Date.now()-this.at>=Dg;this.loading||this.requested&&(this.withHass||!t)&&!r||(this.requested=!0,this.withHass=!!t,this.loading=!0,this.at=Date.now(),td(t).then(o=>{this.items=o,o.length&&this.host.requestUpdate()}).finally(()=>{this.loading=!1}))}item(n){if(!Lt(n))return;let t=nd(this.items,n?.fullName,n?.name);return t&&!this.failed.has(t)?t:void 0}active(n){return!!this.item(n)&&this.pick!==!1}choose(n){this.pick=n,this.host.requestUpdate()}fail(n){let t=this.item(n);t&&(this.failed.add(t),this.host.requestUpdate())}leftReal(n){let t=this.active(n),r=this.shown&&!t;return this.shown=t,r}};var ic=[".pane.current .cards",".pane.candidate .cards"],Co=class extends A{constructor(){super(...arguments);this.showActions=!0;this.dashboards=[];this.dashboardUrl=null;this.views=[];this.viewIndex=0;this.cards=[];this.notice=f.loading;this.frame="desktop";this.density="normal";this.split=50;this.error="";this.trying=!1;this.defaultCompare=!0;this.menu=Ll();this.defaultGenerated=!1;this.usingSample=!1;this.cache=new Map;this.dashboardsLoaded=!1;this.configToken=0;this.buildToken=0;this.dragging=!1;this.actions=new Nn(this);this.guard=new jn;this.real=new zn(this)}static{this.properties={hass:{attribute:!1},candidate:{attribute:!1},mode:{attribute:!1},showActions:{type:Boolean,attribute:"show-actions"},defaultCompare:{attribute:!1},hideControls:{attribute:!1},install:{attribute:!1},uninstall:{attribute:!1},nav:{attribute:!1},dashboards:{state:!0},dashboardUrl:{state:!0},views:{state:!0},viewIndex:{state:!0},cards:{state:!0},notice:{state:!0},frame:{state:!0},density:{state:!0},split:{state:!0},error:{state:!0},trying:{state:!0},compare:{state:!0},menu:{state:!0},defaultGenerated:{state:!0},usingSample:{state:!0}}}static{this.styles=[tc,kd,sd]}connectedCallback(){super.connectedCallback(),this.readOnlySource=void 0,this.hasUpdated&&this.attachHass(),this.guard.sync(this.renderRoot)}disconnectedCallback(){super.disconnectedCallback(),this.readOnly&&gl(this.readOnly),this.readOnly=void 0,this.guard.release()}willUpdate(t){t.has("mode")&&this.mode!==this.userMode&&(this.userMode=void 0)}updated(t){t.has("hass")&&this.hass&&!this.dashboardsLoaded&&this.loadDashboards(),this.attachHass(),this.applyVars(),this.real.sync(this.candidate),this.real.leftReal(this.candidate)&&!t.has("cards")&&this.buildCards(),this.dataset.scheme=this.hass?.themes?.darkMode?"dark":"light",t.has("cards")&&this.buildCards(),this.guard.sync(this.renderRoot)&&!t.has("cards")&&this.buildCards()}comparing(){return this.real.active(this.candidate)?!1:this.compare??Al(this.defaultCompare)}effectiveMode(){return this.mode??(this.hass?.themes?.darkMode?"dark":"light")}async loadDashboards(){let t=this.hass;if(!t)return;this.dashboardsLoaded=!0;try{this.dashboards=await Ls(t)}catch{this.dashboards=[{url_path:null,title:f.defaultDashboard}]}let r=++this.configToken;this.notice=f.loading;let o=await kl(this.dashboards,s=>this.entryFor(s),()=>r!==this.configToken);if(o.stale)return;if(o.hit){[this.dashboardUrl,this.dashboards]=[o.hit.urlPath,o.options],this.applyEntry(o.hit.entry,o.hit.urlPath);return}this.dashboardUrl=null;let i=$l(t.states);if(i&&!o.entries.every(s=>s.status==="error")){this.sample=i,this.useSample();return}o.entries[0]&&this.applyEntry(o.entries[0],null)}async entryFor(t){let r=vo(t),o=this.cache.get(r);if(o)return o;let i=this.hass,s=i?await xl(i,t):{status:"error",reason:""};return s.status!=="error"&&this.cache.set(r,s),t===null&&s.status==="notfound"&&(this.defaultGenerated=!0),s}async showDashboard(t){let r=++this.configToken;this.cache.has(vo(t))||(this.notice=f.loading);let i=await this.entryFor(t);r===this.configToken&&this.applyEntry(i,t)}applyEntry(t,r){let o=t.status!=="ok"||!it(t.config);if(this.sample&&r===null&&o){this.useSample();return}this.usingSample=!1,this.viewIndex=0,this.config=t.status==="ok"?t.config:void 0,t.status==="ok"?this.selectView():this.setState({views:[],cards:[],notice:El(t)})}useSample(){this.usingSample=!0,this.config=this.sample,this.viewIndex=0,this.selectView()}selectView(){this.setState(Tl(this.config,this.viewIndex))}setState(t){this.views=t.views,this.cards=t.cards,this.notice=t.notice}async buildCards(){let t=++this.buildToken,[r]=await Promise.all([cn(),$d(this.hass)]),o=await Promise.all(ic.map(()=>this.buildPane(r)));t===this.buildToken&&(ic.forEach((i,s)=>{let a=this.renderRoot.querySelector(i);a instanceof HTMLElement&&a.replaceChildren(...o[s])}),this.attachHass(!0))}buildPane(t){return Promise.all(this.cards.map(r=>un(t,r)))}attachHass(t=!1){let r=this.hass;r&&(r!==this.readOnlySource&&(this.readOnlySource=r,this.readOnly=bl(r,this),t=!0),t&&this.readOnly&&Xd(this.renderRoot,this.readOnly))}applyVars(){Yd(this.renderRoot,this.hass,this.candidate,this.effectiveMode())}onDashboard(t){let r=Number(t.target.value);this.dashboardUrl=this.dashboards[r]?.url_path??null,this.showDashboard(this.dashboardUrl)}onView(t){this.viewIndex=Number(t.target.value),this.selectView()}onKey(t){let r=nc(t.key,this.split,t.shiftKey,t.altKey||t.ctrlKey||t.metaKey);r!==null&&(t.preventDefault(),this.split=r)}onPointerDown(t){rc(t),this.dragging=!0}onPointerMove(t){if(!this.dragging)return;let r=this.renderRoot.querySelector(".stage");r instanceof HTMLElement&&(this.split=yl(t.clientX,r.getBoundingClientRect()))}onPointerUp(t){this.dragging=!1,oc(t)}setMode(t){this.userMode=t,this.mode=t;let r={detail:{mode:t},bubbles:!0,composed:!0};this.dispatchEvent(new CustomEvent(fs,r))}renderStageView(){let t=this.candidate;return vd({frame:this.frame,density:this.density,split:this.split,comparing:this.comparing()||!t,candidateName:t?t.name:f.noCandidate,note:bd(t,this.effectiveMode()),title:_l(this.dashboards,this.dashboardUrl),menu:this.menu,modNote:Lt(t)},{onKey:r=>this.onKey(r),onPointerDown:r=>this.onPointerDown(r),onPointerMove:r=>this.onPointerMove(r),onPointerUp:r=>this.onPointerUp(r)})}renderBody(){let t=this.real.active(this.candidate)&&this.real.item(this.candidate);return t?id(t,this.effectiveMode(),()=>this.real.fail(this.candidate)):this.notice?l`<p class="notice" role="status">${this.notice}</p>`:this.renderStageView()}render(){let t=this.views.length>0&&it(this.config);return l`
      ${wd(this.nav?{...this.nav,locked:this.trying}:null,r=>this.actions.moveBy(r),l`
          ${yd({dashboards:this.dashboards,dashboardUrl:this.dashboardUrl,generatedDefault:this.defaultGenerated,views:this.views,viewIndex:this.viewIndex,showViews:t,frame:this.frame,density:this.density,mode:this.effectiveMode(),compare:this.comparing()||!this.candidate,canCompare:!!this.candidate,hide:this.hideControls,menu:this.menu,realAvailable:!!this.real.item(this.candidate),real:this.real.active(this.candidate)},{onDashboard:r=>this.onDashboard(r),onView:r=>this.onView(r),onFrame:r=>{this.frame=r},onDensity:r=>{this.density=r},onMode:r=>this.setMode(r),onMenu:r=>{this.menu=r,Il(r)},onLook:r=>this.real.choose(r),onCompare:()=>{this.candidate&&(this.compare=!this.comparing(),Ml(this.compare,this.defaultCompare))}})}
          ${this.usingSample?l`<p class="notice" role="status">${f.sampleNote}</p>`:c}
          ${this.renderBody()}
        `)}
      ${this.actions.render()}
    `}};customElements.get("hats-lite-preview")||customElements.define("hats-lite-preview",Co);function Be(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16))}function Po(e){return Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")}function L(e){return`#${Po(e[0])}${Po(e[1])}${Po(e[2])}`}function Z(e,n,t){return[0,1,2].map(r=>Math.round(e[r]*t+n[r]*(1-t)))}function Vn(e,n,t){return[0,1,2].map(r=>e[r]*t+n[r]*(1-t))}function Ro(e){let n=e/255;return n<=.03928?n/12.92:((n+.055)/1.055)**2.4}function sc(e){return .2126*Ro(e[0])+.7152*Ro(e[1])+.0722*Ro(e[2])}function _e(e,n){let[t,r]=[sc(e),sc(n)].sort((o,i)=>i-o);return(t+.05)/(r+.05)}var q=[255,255,255],dt=[0,0,0];function Do(e){return _e(q,e)>=_e(dt,e)?q:dt}function Kn(e,n){return Math.min(...n.map(t=>_e(e,t)))}function Se(e,n,t){if(Kn(e,n)>=t)return e;let r=Kn(q,n)>=Kn(dt,n)?q:dt;for(let o=1;o<=20;o+=1){let i=Z(r,e,o/20);if(Kn(i,n)>=t)return i}return r}function Wn(e,n){return`rgba(${e[0]},${e[1]},${e[2]},${Number(n.toFixed(4))})`}var Og=[15,17,21],Lg=[27,30,36],Ig=[240,242,245],Hg=[170,176,186],Ng=[20,23,27],Fg=[84,91,101],Bg=7.2,ac=7.1,Ug=4.55,Oo=3.05,jg=4.55;function zg(e){return Number.isFinite(e)?Math.min(60,Math.max(2,e)):2}function Kg(e,n,t){let r=zg(n)/100;if(e==="light")return Math.min(1,.4+r);let o=r;for(;o>.02&&_e(q,Vn(q,t,o))<Bg;)o=Math.max(.02,Number((o-.005).toFixed(4)));return o}var lc=/^#[0-9a-fA-F]{6}$/,ct=2,Lo=60;function Ut(e,n){if(n==="light"||!lc.test(e))return Lo;let t=jt(e,"dark",Lo).alpha;return Math.min(Lo,Math.max(ct,Math.floor(t*100+1e-9)))}function qn(e,n){let t=Math.min(100,Math.max(0,Number.isFinite(e)?e:0));return Math.round(ct+t/100*(n-ct))}function dc(e,n){if(n<=ct)return 0;let t=(e-ct)/(n-ct)*100;return Math.min(100,Math.max(0,Math.round(t)))}function cc(e,n,t){return lc.test(e)?Math.round(jt(e,n,t).alpha*100):0}function jt(e,n,t){let r=Be(e),o=n==="dark",i=o?Z(r,Og,.09):Z(r,q,.055),s=o?Z(r,Lg,.1):Z(r,q,.1),a=o?Z(r,Z(q,i,.05),.05):Z(r,q,.025),d=Number(Kg(n,t,i).toFixed(4));return{background:i,secondary:s,card:a,glass:Vn(q,i,d),alpha:d}}function uc(e,n,t,r=20){let o=Be(e),i=Be(n),s=t==="dark",{background:a,secondary:d,card:u,glass:m,alpha:p}=jt(e,t,r),g=[a,d,u,m],v=Se(Z(o,s?Ig:Ng,.06),g,ac),E=Se(Z(o,s?Hg:Fg,.1),g,Ug),M=Do(o),S=Se(i,g,Oo),U=Se(o,g,Oo),I=s?Z(o,[10,12,15],.07):Z(o,q,.075),X=Vn(o,I,.18),j=Se(o,[I,X],jg);return{"primary-color":L(o),"accent-color":L(i),"primary-background-color":L(a),"secondary-background-color":L(d),"card-background-color":L(u),"ha-card-background":Wn(q,p),"primary-text-color":L(v),"secondary-text-color":L(E),"divider-color":Wn(s?q:dt,.12),"app-header-background-color":L(o),"app-header-text-color":L(M),"text-primary-color":L(M),"paper-tabs-selection-bar-color":L(Se(i,[o],Oo)),"switch-checked-color":L(S),"switch-checked-button-color":L(Do(S)),"paper-slider-active-color":L(U),"state-icon-color":L(S),"sidebar-background-color":L(I),"sidebar-text-color":L(Se(v,[I],ac)),"sidebar-selected-background-color":Wn(o,.18),"sidebar-selected-text-color":L(j),"sidebar-selected-icon-color":L(j)}}var Io=/^#[0-9a-fA-F]{6}$/,hc=/^\/local\/hats_lite\/[0-9a-fA-F]{32}\.(png|jpg|webp|gif)$/,Vg=/^https:\/\/[^\s'"`\\(){}<>;]+$/,Wg=/\.\.|!important/i,qg=2e3;function mc(e){return typeof e=="string"&&hc.test(e)}function Gn(e,n,t){return typeof e!="number"||!Number.isFinite(e)?n:Math.min(t,Math.max(n,e))}function pc(e){if(typeof e!="string"||!Io.test(e))throw new Error("Invalid color");return e}function Gg(e,n){if(typeof e!="string"||Wg.test(e))throw new Error("Invalid background");if(n==="url"&&e.length>qg)throw new Error("Background too long");if(!(n==="url"?Vg.test(e):hc.test(e)))throw new Error("Invalid background");return e}function Ho(e){let n=pc(e.main),t=pc(e.accent),r=Gn(e.radius,0,48),o=Gn(e.blur,0,40),i=Gn(e.tint,2,60),s={...uc(n,t,e.mode,i),"primary-color":n,"accent-color":t,"ha-card-border-radius":`${r}px`,"ha-card-backdrop-filter":`blur(${o}px)`},a=e.background;return a&&a.kind!=="none"&&(s["lovelace-background"]=`center / cover no-repeat fixed url('${Gg(a.value,a.kind)}')`),s}var Yg=3;function fc(e){if(!Io.test(e.main)||!Io.test(e.accent))return[];let n=Be(e.main),t=Be(e.accent),{glass:r}=jt(e.main,e.mode,Gn(e.tint,2,60));return[{id:"main-card",ratio:_e(n,r)},{id:"accent-card",ratio:_e(t,r)}].filter(i=>i.ratio<Yg).map(i=>({id:i.id,ratio:Number(i.ratio.toFixed(2))}))}var Xg=/^[A-Za-z0-9_-]{1,80}$/,Zg=new Set(["__proto__","constructor","prototype","tostring","hasownproperty","valueof","__definegetter__","__definesetter__","__lookupgetter__","__lookupsetter__","isprototypeof","propertyisenumerable","tolocalestring"]),Jg=["javascript:","vbscript:","@import","expression(","behavior:","-moz-binding","image-set(","imageset(","src(","<","&#"],Qg=/&[a-z#]/i,eb=/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/,tb=/\/\*[\s\S]*?\*\//g,gc=/[\p{Z}\p{C}\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\u3164\u1160\u180e\u00ad\ufe00-\ufe0f]/gu,nb=/!\s*important\s*$/i,rb="lovelace-background";function bc(e){let n=e.toLowerCase();return n.startsWith("card-mod-")||n.startsWith("uix-")}function ob(e,n){let t=e;for(let r=0;r<4;r+=1){let o=t.replace(nb,"").trimEnd(),i=bc(n)?o:o.replace(/;+\s*$/,"").trimEnd();if(i===t)break;t=i}return t}function ib(e){return e.replace(gc,"").normalize("NFKC").replace(tb,"").replace(gc,"").toLowerCase()}function yc(e,n){if(!Xg.test(e)||Zg.has(e.toLowerCase()))return"skip";if(e===rb)return"background";let t=ob(n,e);if(!t||n.includes("\0")||eb.test(n)||t.includes("\\"))return"skip";let r=ib(t);return Jg.some(o=>r.includes(o))||Qg.test(r)?"skip":r.includes("url(")?"background":!bc(e)&&/[{};]/.test(r)?"skip":"ok"}var ut={main:"#03a9f4",accent:"#ff9800",radius:12,blur:10,tint:30,mode:"dark"},sb=["dark","light"],ab=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,lb=/^#([0-9a-f]{6})([0-9a-f]{2})?$/i,db=/^rgba?\(\s*([^)]*?)\s*\)$/i,cb=/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i,ub=/blur\(\s*(\d*\.?\d+)\s*(px|rem|em)?\s*\)/i,vc=16,pb=300,hb=4096;function Ue(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function zt(e,n,t){return Math.min(t,Math.max(n,e))}function mb(e){let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n);return Number.isFinite(t)?zt(Math.round(t),0,255):null}function fb(e){if(e===void 0)return;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?zt(t,0,1):null}function No(e){if(typeof e!="string")return null;let n=e.trim(),t=ab.exec(n);if(t)return{hex:`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toLowerCase(),alpha:void 0};let r=lb.exec(n);if(r)return{hex:`#${r[1]}`.toLowerCase(),alpha:r[2]?parseInt(r[2],16)/255:void 0};let o=db.exec(n);if(!o)return null;let i=o[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);if(i.length<3||i.length>4)return null;let s=i.slice(0,3).map(mb),a=fb(i[3]);return s.some(d=>d===null)||a===null?null:{hex:L(s),alpha:a}}function gb(e){return typeof e=="string"?e:typeof e=="number"&&Number.isFinite(e)?String(e):null}function bb(e,n){if(!Ue(e)||!Ue(e.modes))return{};let t=e.modes[n];return Ue(t)?t:{}}function yb(e,n){let t=gb(n),r=t===null||t.length>hb?"skip":yc(e,t);return{text:t,verdict:r}}function Yn(e,n){let t={},r=new Map;if(!Ue(e))return{vars:t,skipped:0,skippedKeys:[],wallpaper:0,wallpaperKeys:[]};for(let s of[e,bb(e,n)])for(let[a,d]of Object.entries(s)){if(a==="modes")continue;let{text:u,verdict:m}=yb(a,d);r.set(a,m),m==="ok"?t[a]=u:delete t[a]}let o=[...r].filter(([,s])=>s==="skip").map(([s])=>s),i=[...r].filter(([,s])=>s==="background").map(([s])=>s);return{vars:t,skipped:o.length,skippedKeys:o,wallpaper:i.length,wallpaperKeys:i}}function wc(e,n){return Yn(e,n).vars}function Fo(e){return!Ue(e)||!Ue(e.modes)?[]:sb.filter(n=>Ue(e.modes[n]))}function vb(e){let n=e===void 0?null:cb.exec(e.trim());if(!n)return null;let t=(n[2]??"px").toLowerCase();return parseFloat(n[1])*(t==="px"?1:vc)}function wb(e){for(let n of["ha-card-backdrop-filter","backdrop-filter"]){let t=ub.exec(e[n]??"");if(t)return parseFloat(t[1])*((t[2]??"px").toLowerCase()==="px"?1:vc)}return null}function xb(e){for(let n of["ha-card-background","card-background-color"]){let t=No(e[n])?.alpha;if(t!==void 0)return t}return null}function kb(e,n){let t=Fo(e);return t.length===1?t[0]:n}function $b(e,n,t){let r=n==="light"?(e-.4)*100:e*100,o=zt(Math.round(r),2,60);return dc(o,Ut(t,n))}function xc(e,n,t){let r=kb(e,n),o=wc(e,r),i=No(o["primary-color"])?.hex??t.main,s=No(o["accent-color"])?.hex??t.accent,a=vb(o["ha-card-border-radius"]),d=wb(o),u=xb(o);return{main:i,accent:s,mode:r,radius:a===null?t.radius:Math.round(zt(a,0,48)),blur:d===null?t.blur:Math.round(zt(d,0,40)),tint:u===null?t.tint:$b(u,r,i)}}function Eb(e,n,t,r){let o=wc(e,n);for(let[i,s]of Object.entries(r))t[i]!==s&&(o[i]=s);return o}function Tb(e,n){return{main:e.main,accent:e.accent,radius:e.radius,blur:e.blur,tint:qn(e.tint,Ut(e.main,n)),background:{kind:"none"},mode:n}}function kc(e,n,t){let r=Ho(t);return e?Eb(e,t.mode,Ho(Tb(n,t.mode)),r):r}function Xn(e){return Object.keys(e).length>pb}var Zn={button:"Advanced",withDraft:"Open the full HATS designer. Your draft values travel in the address fragment; HATS must treat them as untrusted input.",plain:"Open the full HATS designer."};var _b=700,Sb=2048,Ab=200,$c=/^#[0-9a-fA-F]{6}$/,Mb={radius:[0,48],blur:[0,40],tint:[0,100]},Cb=3e4,Jn={available:!1,path:null},Ec=new WeakMap;function Tc(e){return typeof e!="string"||e.length===0||e.length>Ab||!e.startsWith("/")||e.startsWith("//")||e.includes("\\")||e.includes("#")||e.includes("?")?!1:/^[\x21-\x7e]+$/.test(e)}function Bo(e,n){let[t,r]=Mb[n];return typeof e=="number"&&Number.isFinite(e)&&e>=t&&e<=r}function _c(e){let n=e;return!n||typeof n.main!="string"||typeof n.accent!="string"||!$c.test(n.main)||!$c.test(n.accent)||!Bo(n.radius,"radius")||!Bo(n.blur,"blur")||!Bo(n.tint,"tint")?null:{main:n.main.toLowerCase(),accent:n.accent.toLowerCase(),radius:Math.round(n.radius),blur:Math.round(n.blur),tint:Math.round(n.tint)}}function Pb(e){let n=_c(e);if(!n)return null;let t=JSON.stringify(n),r=btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");return`#lite=${r}`.length>Sb?null:`#lite=${r}`}function Rb(e,n){return Tc(e)?e+(Pb(n)??""):null}function Db(e,n,t=window){let r=Rb(e,n);return r?(t.innerWidth<_b?t.location.assign(r):t.open(r,"_blank","noopener"),!0):!1}function Ob(e,n){return Object.keys(e).every(r=>e[r]===n[r])?null:e}function Sc(e){let n={main:e.main,accent:e.accent,radius:e.radius,blur:e.glassBlur,tint:e.tint};return Ob(n,e.baseControls)}function Lb(e){return typeof e=="object"&&e!==null&&e.code==="unknown_command"}function Ib(e){let n=Ec.get(e.connection);if(n&&(n.failedAt===null||Date.now()-n.failedAt<Cb))return n.pending;let t={pending:Promise.resolve(Jn),failedAt:null};return t.pending=P(e,{type:"hats_lite/advanced_info"}).then(r=>r&&r.available===!0&&Tc(r.path)?{available:!0,path:r.path}:(t.failedAt=Date.now(),Jn),r=>(Lb(r)||(t.failedAt=Date.now()),Jn)),Ec.set(e.connection,t),t.pending}var Uo=class extends A{constructor(){super(...arguments);this.info=Jn;this.onFocus=()=>{this.info.available||this.ask()}}static{this.properties={hass:{attribute:!1},draft:{attribute:!1},info:{state:!0}}}static{this.styles=T`
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
  `}connectedCallback(){super.connectedCallback(),window.addEventListener("focus",this.onFocus)}disconnectedCallback(){window.removeEventListener("focus",this.onFocus),super.disconnectedCallback()}ask(){let t=this.hass,r=t?.connection;!t||!r||(this.asked=r,Ib(t).then(o=>{this.asked===r&&(this.info=o)}))}willUpdate(){this.hass?.connection&&this.asked!==this.hass.connection&&this.ask()}render(){let t=this.info.available?this.info.path:null;if(!t)return c;let r=_c(this.draft)!==null;return l`<button type="button" data-action="advanced"
      title=${r?Zn.withDraft:Zn.plain}
      @click=${()=>Db(t,this.draft)}>${Zn.button}</button>`}};customElements.get("hats-lite-advanced")||customElements.define("hats-lite-advanced",Uo);var y={baseLabel:"Start from",baseDefault:"Home Assistant",themeHint:"Only installed themes are listed. Install more from the Gallery.",baseTooLarge:"This theme has too many variables (300 at most, counting the base plus the Designer keys). Pick another base.",baseMissing:"The base theme is no longer installed. The Designer went back to Home Assistant.",baseSkipped:"{count} variables of the base theme were left out because they cannot be saved safely.",wallpaperOne:"1 wallpaper entry was removed.",wallpaperMany:"{count} wallpaper entries were removed.",valueRejected:"Some values were rejected as unsafe. Pick another base or change the values.",colors:"Colors",glance:"At a glance",onDashboard:"On your dashboard",shape:"Shape and glass",draftName:"Designer draft",mainColor:"Main color",accentColor:"Accent color",radius:"Corner radius",blur:"Glass blur",tint:"Card tint",mode:"Mode",modeDark:"Dark",modeLight:"Light",background:"Background",backgroundNone:"None",uploadLabel:"Upload a background image",uploadHint:"PNG, JPEG, WebP or GIF, up to 8 MiB",uploading:"Uploading...",uploadAdminOnly:"Only administrators can upload backgrounds.",uploadTooLarge:"Pick an image up to 8 MiB.",uploadType:"Pick a PNG, JPEG, WebP or GIF image.",uploadFailed:"Upload failed. The previous background is kept.",invalidColor:"Pick a valid color",invalidBackground:"This background is not allowed",backgroundTooLong:"This background address is too long (2000 characters at most).",restartReminder:"This theme uses an uploaded background. Backgrounds need a Home Assistant restart before they are served.",invalidInput:"Some values are not valid",saveTitle:"Save as theme",saveAdminOnly:"Only administrators can save themes.",nameLabel:"Theme name",nameInvalid:"Use 1 to 60 letters, digits, spaces, hyphens or underscores, starting with a letter or digit",saveButton:"Save as theme",saving:"Saving...",saved:"Theme saved",saveFailed:"Could not save the theme.",nameReserved:"This name is reserved. Pick another name.",nameExists:"A theme with this name already exists. Pick another name.",formatInvalid:"The theme could not be written in a valid format.",overwrote:"Saved. An existing theme with this name was replaced.",needsRestart:"Background uploaded. Backgrounds need a Home Assistant restart before they are served.",warnMainCard:"The main color is hard to see on cards (contrast {ratio}:1, 3:1 recommended).",warnAccentCard:"The accent color is hard to see on cards (contrast {ratio}:1, 3:1 recommended)."};var Hb=/\bdo not (use|modify)\b/i;function Nb(e){return typeof e=="string"&&Hb.test(e)}function ne(e,n){return e.filter(t=>!Nb(t)||t===n)}function Ac(e){let n=e?.themes?.themes;return!n||typeof n!="object"?[]:Object.keys(n).sort((t,r)=>t.localeCompare(r))}function Mc(e,n,t){return l`
    <label class="field base">
      <span>${y.baseLabel}</span>
      <select class="pill" data-field="base" aria-describedby="base-hint" @change=${t}>
        <option value="" .selected=${n===""}>${y.baseDefault}</option>
        ${ne(e,n).map(r=>l`<option value=${r} .selected=${n===r}>${r}</option>`)}
      </select>
    </label>
    <p class="hint" id="base-hint">${y.themeHint}</p>
  `}function jo(e,n){if(!n)return;let t=e?.themes?.themes?.[n];if(t==null)throw new Error("Base theme missing");return t}function Qn(e,n){return n!==""&&!e?.themes?.themes?.[n]}function zo(e){let n=Fo(e);return n.length?n:["dark","light"]}function Cc(e,n,t){if(!n||Qn(e,n))return 0;let r=e?.themes?.themes?.[n],o=new Set;for(let i of zo(r))Yn(r,i).skippedKeys.forEach(s=>o.add(s));return o.size}function Pc(e,n){if(!n||Qn(e,n))return 0;let t=e?.themes?.themes?.[n],r=new Set;for(let o of zo(t))Yn(t,o).wallpaperKeys.forEach(i=>r.add(i));return r.size}function Rc(e,n){let t=e?zo(e):["dark","light"],r={};for(let o of t){let i=n(o);if(Xn(i))throw new Error("Too many variables");r[o]=i}return{variables:r[t[0]],modes:r}}function Dc(e,n,t){let r=n?e?.themes?.themes?.[n]:void 0;return r?{base:n,controls:xc(r,t,ut)}:{base:"",controls:ut}}function Oc(e,n,t,r,o=0){return l`
    ${e?l`<p class="hint" data-notice="base">${e}</p>`:c}
    ${n>0?l`<p class="hint" data-notice="skipped">${y.baseSkipped.replace("{count}",String(n))}</p>`:c}
    ${o>0?l`<p class="hint" data-notice="wallpaper">${o===1?y.wallpaperOne:y.wallpaperMany.replace("{count}",String(o))}</p>`:c}
    ${t===""&&r?l`<p class="error" role="alert">${r}</p>`:c}
  `}function Lc(e,n){return l`
    <section class="group">
      <h3>${y.mode}</h3>
      <div class="seg" role="group" aria-label=${y.mode}>
        ${["dark","light"].map(t=>l`<button type="button" data-field="mode" data-mode=${t}
            aria-pressed=${String(e===t)}
            @click=${()=>n(t)}>${t==="dark"?y.modeDark:y.modeLight}</button>`)}
      </div>
    </section>
  `}function Ko(e){return l`
    <label class="range">
      <span class="range-head">
        <span>${e.label}</span>
        <span class="range-value" data-readout=${e.field}>${e.readout}</span>
      </span>
      <input type="range" min=${e.min} max=${e.max} step="1" data-field=${e.field}
        .value=${String(e.value)}
        @input=${e.onInput} />
    </label>
  `}function Ic(e,n,t,r){return l`
    <label class="color-row">
      <input type="color" data-field=${e} .value=${t} @input=${r} />
      <span class="color-text">
        <span>${n}</span>
        <span class="hex" data-readout=${e}>${t}</span>
      </span>
    </label>
  `}function Hc(e){return l`
    <button type="button" class=${e.over?"drop over":"drop"} data-action="upload"
      ?disabled=${e.uploading}
      @click=${e.onPick}
      @dragover=${e.onDragOver}
      @dragleave=${e.onDragLeave}
      @drop=${e.onDrop}>
      <span class="drop-title">${e.uploading?y.uploading:y.uploadLabel}</span>
      <span class="drop-hint">${y.uploadHint}</span>
    </button>
    <input class="visually-hidden" type="file" tabindex="-1" aria-hidden="true"
      accept="image/png,image/jpeg,image/webp,image/gif"
      ?disabled=${e.uploading}
      @change=${e.onFile} />
    ${e.error?l`<p class="error" role="alert">${e.error}</p>`:c}
    ${e.notice?l`<p class="hint" role="status" data-notice="restart">${e.notice}</p>`:c}
  `}function Nc(e){return l`
    <div class="bar">
      <label>
        <span class="visually-hidden">${y.nameLabel}</span>
        <input type="text" maxlength="60" data-field="name" placeholder=${y.nameLabel}
          .value=${e.name}
          @input=${e.onName} />
      </label>
      <button type="button" class="btn primary" data-action="save" ?disabled=${e.saving}
        @click=${e.onSave}>
        ${e.saving?y.saving:y.saveButton}
      </button>
      ${e.message?l`<span class=${e.failed?"chip warn message":"chip ok message"}
            role=${e.failed?"alert":"status"}>${e.message}</span>`:c}
    </div>
  `}var Fc=[V,W,T`
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
`,ec];function Vo(e,n){if(e&&typeof e=="object"&&"message"in e){let t=e.message;if(typeof t=="string"&&t.length>0)return t}return n}function Bc(e){return e.size>8388608?y.uploadTooLarge:gs.includes(e.type)?null:y.uploadType}function Bb(e,n){let t={method:"POST",body:n};if(typeof e.fetchWithAuth=="function")return e.fetchWithAuth(Br,t);let r=e.auth?.data?.access_token??"";return fetch(Br,{...t,headers:{Authorization:`Bearer ${r}`}})}async function Uc(e,n){let t=new FormData;t.append("file",n);let r,o;try{r=await Bb(e,t),o=await r.json().catch(()=>({}))}catch{return{error:y.uploadFailed}}if(!r.ok)return{error:Vo(o,y.uploadFailed)};let{url:i,needs_restart:s}=o;return mc(i)?{url:i,needsRestart:s===!0}:{error:y.uploadFailed}}var Ub=/^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/,jb={"main-card":y.warnMainCard,"accent-card":y.warnAccentCard};function jc(e){return e.toLowerCase()==="default"?y.nameReserved:Ub.test(e)?null:y.nameInvalid}function zc(e){let n=e&&typeof e=="object"?e.code:void 0;return n==="name_exists"?y.nameExists:n==="reserved_name"?y.nameReserved:n==="invalid_format"?y.formatInvalid:n==="invalid_value"?y.valueRejected:Vo(e,y.saveFailed)}function Kc(e){return e&&typeof e=="object"&&e.overwrote===!0?y.overwrote:y.saved}function Vc(e){return fc(e).map(n=>jb[n.id].replace("{ratio}",n.ratio.toFixed(1)))}function Wo(e){let n=e instanceof Error?e.message:"";return n==="Invalid color"?{field:"color",message:y.invalidColor}:n==="Invalid background"?{field:"background",message:y.invalidBackground}:n==="Background too long"?{field:"background",message:y.backgroundTooLong}:n==="Base theme missing"?{field:"",message:y.baseMissing}:n==="Too many variables"?{field:"",message:y.baseTooLarge}:{field:"color",message:y.invalidInput}}function Wc(e,n){return n.kind==="upload"?`${e} ${y.restartReminder}`:e}var zb=[],Kb=["tablet","mode"],Vb=["base","main","accent","radius","glassBlur","tint","mode","background"],qc={radius:{label:y.radius,min:0,max:48,unit:"px"},glassBlur:{label:y.blur,min:0,max:40,unit:"px"}},qo=class extends A{constructor(){super(...arguments);this.dragOver=!1;this.base="";this.baseControls=ut;this.main="#03a9f4";this.accent="#ff9800";this.radius=12;this.glassBlur=10;this.tint=30;this.mode="dark";this.background={kind:"none"};this.errorField="";this.errorMessage="";this.themeName="";this.uploading=!1;this.uploadError="";this.uploadNotice="";this.saving=!1;this.saveMessage="";this.saveFailed=!1;this.baseNotice=""}static{this.properties={hass:{attribute:!1},base:{state:!0},main:{state:!0},accent:{state:!0},radius:{state:!0},glassBlur:{state:!0},tint:{state:!0},mode:{state:!0},background:{state:!0},candidate:{state:!0},errorField:{state:!0},errorMessage:{state:!0},themeName:{state:!0},uploading:{state:!0},uploadError:{state:!0},uploadNotice:{state:!0},saving:{state:!0},saveMessage:{state:!0},saveFailed:{state:!0},baseNotice:{state:!0},dragOver:{state:!0}}}static{this.styles=Fc}willUpdate(t){if(Qn(this.hass,this.base)){this.base="",this.baseControls=ut,this.baseNotice=y.baseMissing,this.rebuild();return}(!this.candidate||Vb.some(r=>t.has(r)))&&this.rebuild()}render(){let t=this.hass?.user?.is_admin===!0;return l`
      <div class="layout">
        <div class="controls">
          <hats-lite-advanced .hass=${this.hass} .draft=${Sc(this)}></hats-lite-advanced>
          ${Mc(Ac(this.hass),this.base,r=>this.onBase(r))}
          ${Oc(this.baseNotice,Cc(this.hass,this.base,this.mode),this.errorField,this.errorMessage,Pc(this.hass,this.base))}
          <section class="group">
            <h3>${y.colors}</h3>
            ${this.renderColor("main",y.mainColor)}
            ${this.renderColor("accent",y.accentColor)}
            ${this.errorField==="color"?l`<p class="error" role="alert">${this.errorMessage}</p>`:c}
            ${this.warnings().map(r=>l`<p class="hint" data-warning>${r}</p>`)}
          </section>
          <section class="group">
            <h3>${y.shape}</h3>
            ${Object.keys(qc).map(r=>this.renderSlider(r))}
            ${this.renderTint()}
          </section>
          <section class="group">
            <h3>${y.background}</h3>
            <div class="choices">
              <button type="button" class="chip-btn" data-action="background-none"
                aria-pressed=${String(this.background.kind==="none")}
                @click=${()=>this.setBackground({kind:"none"})}>${y.backgroundNone}</button>
              ${zb.map(r=>l`<button type="button" class="chip-btn"
                  aria-pressed=${String(this.background.kind==="preset"&&this.background.value===r.value)}
                  @click=${()=>this.setBackground({kind:"preset",value:r.value})}>${r.label}</button>`)}
            </div>
            ${this.errorField==="background"?l`<p class="error" role="alert">${this.errorMessage}</p>`:c}
            ${t?this.renderUpload():l`<p class="hint">${y.uploadAdminOnly}</p>`}
          </section>
          ${Lc(this.mode,r=>this.setMode(r))}
          ${t?this.renderSave():l`<p class="hint">${y.saveAdminOnly}</p>`}
        </div>
        <div class="stage">
          <h3>${y.glance}</h3>
          <div class="glance">
            <hats-lite-thumb .vars=${this.candidate?.vars??null} .mode=${this.mode}></hats-lite-thumb>
          </div>
          <h3>${y.onDashboard}</h3>
          <hats-lite-preview
            .hass=${this.hass}
            .candidate=${this.candidate}
            .mode=${this.mode}
            .showActions=${!1}
            .hideControls=${Kb}
            .defaultCompare=${!1}
            @hats-lite-mode-change=${r=>this.onPreviewMode(r)}
          ></hats-lite-preview>
        </div>
      </div>
    `}renderColor(t,r){return Ic(t,r,this[t],o=>this.setText(t,o))}renderSlider(t){let r=qc[t];return Ko({label:r.label,readout:`${this[t]}${r.unit}`,field:t,min:r.min,max:r.max,value:this[t],onInput:o=>this.setNumber(t,o)})}renderTint(){let t=cc(this.main,this.mode,this.tintValue(this.mode));return Ko({label:y.tint,readout:`${t}%`,field:"tint",min:0,max:100,value:this.tint,onInput:r=>this.setTint(r)})}tintValue(t){return qn(this.tint,Ut(this.main,t))}setTint(t){this.tint=Number(t.target.value)}renderUpload(){return Hc({over:this.dragOver,uploading:this.uploading,error:this.uploadError,notice:this.uploadNotice,onPick:()=>this.fileInput()?.click(),onDragOver:t=>this.onDragOver(t),onDragLeave:()=>{this.dragOver=!1},onDrop:t=>this.onDrop(t),onFile:t=>this.onFile(t)})}renderSave(){return Nc({name:this.themeName,saving:this.saving,message:this.saveMessage,failed:this.saveFailed,onName:t=>this.setName(t),onSave:()=>this.onSave()})}designerInput(t){return{main:this.main,accent:this.accent,radius:this.radius,blur:this.glassBlur,tint:this.tintValue(t),background:this.background,mode:t}}finalVars(t){let r=jo(this.hass,this.base),o=kc(r,this.baseControls,this.designerInput(t));if(Xn(o))throw new Error("Too many variables");return o}warnings(){return Vc(this.designerInput(this.mode))}rebuild(){try{let t=this.finalVars(this.mode);this.candidate={name:y.draftName,vars:t,installed:!1,canApply:!1},this.errorField="",this.errorMessage=""}catch(t){let r=Wo(t);this.errorField=r.field,this.errorMessage=r.message}}buildModes(){try{return Rc(jo(this.hass,this.base),t=>this.finalVars(t))}catch(t){this.saveFailed=!0,this.saveMessage=Wo(t).message;return}}onBase(t){let r=t.target.value,o=Dc(this.hass,r,this.mode),i=o.controls;this.base=o.base,this.baseNotice="",this.baseControls=i,this.main=i.main,this.accent=i.accent,this.radius=i.radius,this.glassBlur=i.blur,this.tint=i.tint,this.mode=i.mode,this.background={kind:"none"},this.uploadNotice="",this.saveMessage=""}setText(t,r){this[t]=r.target.value}setNumber(t,r){this[t]=Number(r.target.value)}onPreviewMode(t){let r=t.detail?.mode;(r==="dark"||r==="light")&&(this.mode=r)}setMode(t){this.mode=t}fileInput(){return this.renderRoot.querySelector('input[type="file"]')}onDragOver(t){t.preventDefault(),this.dragOver=!0}onDrop(t){t.preventDefault(),this.dragOver=!1;let r=t.dataTransfer?.files?.[0];r&&this.handleFile(r,null)}setBackground(t){this.background=t,this.uploadNotice=""}setName(t){this.themeName=t.target.value}async onFile(t){let r=t.target,o=r.files?.[0];o&&await this.handleFile(o,r)}async handleFile(t,r){let o=this.hass;if(!o||this.uploading)return;let i=Bc(t);if(i){this.uploadError=i,r&&(r.value="");return}this.uploading=!0,this.uploadError="",this.uploadNotice="";try{let s=await Uc(o,t);"error"in s?this.uploadError=s.error:(this.background={kind:"upload",value:s.url},s.needsRestart&&(this.uploadNotice=y.needsRestart))}finally{this.uploading=!1,r&&(r.value="")}}async onSave(){let t=this.hass;if(!t)return;let r=this.themeName.trim(),o=jc(r);if(o){this.saveFailed=!0,this.saveMessage=o;return}let i=this.buildModes();if(i){this.saving=!0,this.saveMessage="";try{let s=await P(t,{type:"hats_lite/save_theme",name:r,variables:i.variables,modes:i.modes});this.dispatchEvent(new CustomEvent(ms,{bubbles:!0,composed:!0,detail:{name:r}})),this.saveFailed=!1,this.saveMessage=Wc(Kc(s),this.background)}catch(s){this.saveFailed=!0,this.saveMessage=zc(s)}finally{this.saving=!1}}}};customElements.get("hats-lite-designer")||customElements.define("hats-lite-designer",qo);function G(e){let n=e&&typeof e=="object"?e.code:void 0;return typeof n=="string"?n:"unknown"}var me="hats_lite/";async function Go(e){let n=await P(e,{type:`${me}people`});return Array.isArray(n?.people)?n.people:[]}function Gc(e,n){let t={type:`${me}assign`,user_id:n.user_id,theme:n.theme};return n.dark!==void 0&&(t.dark=n.dark),n.ends!==void 0&&n.ends!==null&&(t.ends=n.ends),P(e,t)}function Yc(e,n){return P(e,{type:`${me}unassign`,override_id:n})}function Xc(e,n){return P(e,{type:`${me}set_opt_out`,opt_out:n})}function Zc(e,n,t){return P(e,{type:`${me}set_birthday`,user_id:n,...t})}function Jc(e,n){return P(e,{type:`${me}set_birthday`,user_id:n,clear:!0})}async function Qc(e){let n=await P(e,{type:`${me}holidays_list`});return Array.isArray(n?.holidays)?n.holidays:[]}async function eu(e,n){let t=await P(e,{type:`${me}holidays_set`,holidays:n});return Array.isArray(t?.holidays)?t.holidays:n}function tu(e,n){return P(e,{type:`${me}assigners_set`,user_ids:n})}async function nu(e){try{return await Go(e),!0}catch(n){return G(n)!=="unknown_command"}}function er(){window.hatsLite?.refreshEffective?.()}function tr(e){return{dark:void 0,primaryColor:void 0,accentColor:void 0,...e}}var pt=[31,29,31,30,31,30,31,31,30,31,30,31];function rr(e,n){return!Number.isInteger(e)||!Number.isInteger(n)||e<1||e>12?!1:n>=1&&n<=pt[e-1]}function Yo(e){let n=e.name.trim();return n.length===0||n.length>60?"name":!rr(e.month_start,e.day_start)||!rr(e.month_end,e.day_end)?"date":e.theme.length===0?"theme":null}function Wb(e,n){if(n)try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,year:"numeric",month:"numeric",day:"numeric"}).formatToParts(e),r=o=>Number(t.find(i=>i.type===o)?.value);return[r("year"),r("month"),r("day")]}catch{return[e.getFullYear(),e.getMonth()+1,e.getDate()]}return[e.getFullYear(),e.getMonth()+1,e.getDate()]}function qb(e){return e.month_start*32+e.day_start>e.month_end*32+e.day_end}function ru(e,n=new Date,t){let[r,o,i]=Wb(n,t),s=r*1e4+o*100+i,a=qb(e)?1:0;for(let d of[r-1,r,r+1])if((d+a)*1e4+e.month_end*100+e.day_end>=s)return d;return r+1}function ou(e,n){return!Number.isFinite(e)||e<=n||e>n+31622400?"invalid_range":null}function Gb(e,n,t,r){let o=n*32+t,i=e.month_start*32+e.day_start,s=e.month_end*32+e.day_end,a=e.year!==void 0&&r!==void 0;return i<=s?o>=i&&o<=s&&(!a||r===e.year):a?o>=i&&r===e.year||o<=s&&r===e.year+1:o>=i||o<=s}function Xo(e,n,t){if(e.enabled===!1||Yo(e)==="date")return[];let r=[],o=null;for(let i=1;i<=pt[n-1];i+=1)Gb(e,n,i,t)?o?o.to=i:(o={from:i,to:i},r.push(o)):o=null;return r}var Ae=e=>String(e).padStart(2,"0");function iu(e,n){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"}).formatToParts(new Date(e)),r=o=>Number(t.find(i=>i.type===o)?.value);return[r("year"),r("month"),r("day"),r("hour"),r("minute")]}catch{return null}}function nr(e,n){let t=iu(e,n);return t?Date.UTC(t[0],t[1]-1,t[2],t[3],t[4])-Math.floor(e/6e4)*6e4:null}function su(e,n){let t=Date.parse(`${e}Z`);if(!n||Number.isNaN(t))return Date.parse(e)/1e3;let r=864e5,o=nr(t-r,n),i=nr(t+r,n);if(o===null||i===null)return Date.parse(e)/1e3;let s=t-o;if(nr(s,n)===o)return s/1e3;let a=t-i;return nr(a,n)===i?a/1e3:s/1e3}function Zo(e,n){let t=n?iu(e*1e3,n):null;if(t)return`${String(t[0]).padStart(4,"0")}-${Ae(t[1])}-${Ae(t[2])}T${Ae(t[3])}:${Ae(t[4])}`;let r=new Date(e*1e3);return`${r.getFullYear()}-${Ae(r.getMonth()+1)}-${Ae(r.getDate())}T${Ae(r.getHours())}:${Ae(r.getMinutes())}`}var Kt=[V,W,T`
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
`],au=[V,W,T`
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
`];var h={title:"People",intro:"Choose who gets which theme, and when.",loading:"Loading people...",loadFailed:"Could not load the people list.",retry:"Try again",you:"You",admin:"Admin",optedOutChip:"Opted out",optOutLabel:"Do not let others change my theme",optOutOn:"Others can no longer change your theme.",optOutOff:"Others can change your theme again.",optOutShortcut:"Opt out",noOverride:"Using their own theme",setBy:e=>e?`Set by ${e}`:"Set by an administrator",overrideLine:e=>`Theme ${e}`,until:e=>`until ${e}`,noEnd:"until removed",assign:"Assign theme",startsNow:"This theme starts immediately and stays until the end time below.",unassign:"Remove",birthday:"Birthday",close:"Close",cancel:"Cancel",save:"Save",saving:"Saving...",assignTitle:e=>`Assign a theme to ${e}`,theme:"Theme",defaultTheme:"default",defaultThemeLabel:"Home Assistant",themeHint:"Only installed themes are listed. Install more from the Gallery.",mode:"Mode",modeAuto:"Auto",modeDark:"Dark",modeLight:"Light",duration:"Until",untilNone:"Until removed",untilDate:"Until a date and time",untilInput:"End date and time",assigned:"Theme assigned.",selfApplied:"That is your own account, so the theme was applied to you directly.",unassigned:"Assignment removed.",birthdayTitle:e=>`Birthday for ${e}`,month:"Month",day:"Day",clear:"Clear birthday",birthdaySaved:"Birthday saved.",birthdayCleared:"Birthday cleared.",holidays:"Holidays",holidaysIntro:"Each holiday switches everyone to its theme during the range.",holidaysEmpty:"No holidays yet.",editHolidays:"Edit holidays",holidayEditorTitle:"Holidays and events",holidayName:"Name",holidayStart:"Starts",holidayEnd:"Ends",holidayEnabled:"Enabled",holidayRemove:"Remove",holidayEdit:"Edit",holidayAdd:"Add holiday",eventAdd:"Add event",holidayKind:"Holiday",eventKind:"Event",eventName:"Event name",eventNamePlaceholder:"For example, Anna's birthday",eventYearly:"Repeat every year",holidayNewTitle:"New holiday",eventNewTitle:"New event",holidayEditTitle:e=>`Edit ${e}`,holidayListLabel:"Holidays and events",holidayOff:"off",holidayPreset:"Preset",holidayPresetPick:"Choose a preset",holidayBack:"Back to list",holidaysSaved:"Holidays saved.",timeline:"Next 12 months",holidayRowLabel:(e,n)=>`${n}: ${e}`,timelineHoliday:(e,n)=>`${e}, ${n}`,problemName:"Enter a name of up to 60 characters.",problemDate:"This date does not exist in that month.",problemTheme:"Choose a theme.",problemUntil:"Pick a time in the future, within 366 days.",assigners:"Assigners",assignersTitle:"Who may assign themes",assignersHelp:"Assigners can set the theme of other non-admin users. Saving replaces the whole list.",assignersEmpty:"There are no non-admin users.",assignersSaved:"Assigners saved.",months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],errors:{unauthorized:"You are not allowed to do that.",invalid_user:"That user is no longer available.",unknown_theme:"That theme is not installed.",invalid_range:"That date range is not allowed.",limit_reached:"A limit was reached. Remove something and try again.",invalid_request:"The server did not accept those values.",not_found:"That item no longer exists.",save_failed:"The change could not be saved. Try again.",unknown_command:"This server does not support the People tab.",not_loaded:"The server is still starting. Try again in a moment.",rate_limited:"Too many requests. Wait a moment and try again.",invalid_format:"Those values are not in a valid format.",unknown:"Something went wrong. Try again."},missingTheme:e=>`missing: ${e}`,holidaysLoadFailed:"Could not load the holidays. Editing is off until they load.",unknownCode:e=>`Something went wrong (${e}). Try again.`,optedOut:e=>`${e} chose not to have their theme changed.`};function ht(e,n){if(e==="opted_out")return h.optedOut(n??"This person");let t=h.errors[e];return t||(e==="unknown"?h.errors.unknown:h.unknownCode(e))}function K(e){return e===h.defaultTheme?h.defaultThemeLabel:e}function Vt(e){return Object.keys(e?.themes?.themes??{}).sort()}function lu(e){return e?.config?.time_zone||void 0}var Xb='button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',Jo=class extends A{constructor(){super(...arguments);this.heading="";this.busy=!1;this.onKey=t=>{if(t.key==="Escape"){if(t.stopPropagation(),this.busy)return;this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}));return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=this.getRootNode().activeElement,i=t.shiftKey?r[0]:r[r.length-1];(o===i||!o||!this.contains(o))&&(t.preventDefault(),(t.shiftKey?r[r.length-1]:r[0]).focus())}}static{this.properties={heading:{type:String},busy:{type:Boolean}}}static{this.styles=Kt}firstUpdated(){this.focusables()[0]?.focus()}focusables(){return[...this.querySelectorAll(Xb)].filter(t=>!t.disabled)}render(){return l`
      <div class="backdrop">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="title" @keydown=${this.onKey}>
          <h2 id="title">${this.heading}</h2>
          <slot></slot>
        </div>
      </div>
    `}},re=class extends A{constructor(){super(...arguments);this.themes=[];this.installed=[];this.busy=!1;this.error=""}static{this.properties={hass:{attribute:!1},themes:{attribute:!1},installed:{attribute:!1},busy:{state:!0},error:{state:!0}}}static{this.styles=Kt}done(t){this.dispatchEvent(new CustomEvent("people-done",{detail:t,bubbles:!0,composed:!0}))}close(){this.busy||this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}))}async run(t,r){if(!(this.busy||!this.hass)){this.busy=!0,this.error="";try{let o=await t();o&&this.done(o)}catch(o){this.error=ht(G(o),r)}finally{this.busy=!1}}}themeOptions(t){let r=[h.defaultTheme,...ne(this.themes,t).filter(i=>i!==h.defaultTheme)],o=r.map(i=>l`<option value=${i} ?selected=${i===t}>${K(i)}</option>`);if(t&&!r.includes(t)){let i=this.installed.includes(t)?K(t):h.missingTheme(t);o.push(l`<option value=${t} selected>${i}</option>`)}return o}renderError(){return this.error?l`<p class="error" role="alert">${this.error}</p>`:c}renderActions(t,r=!1){return l`
      <div class="actions">
        <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${h.cancel}</button>
        <button class="btn primary" type="submit" ?disabled=${this.busy||r}>
          ${this.busy?h.saving:t}
        </button>
      </div>
    `}},Qo=class extends re{constructor(){super(...arguments);this.mode="auto";this.limited=!1;this.until="";this.startsNow=!1;this.theme=h.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(!r)return;let o=this.mode==="auto"?void 0:this.mode==="dark",i=Date.now()/1e3,s=null;if(this.limited&&(s=su(this.until,this.zone),ou(s,i))){this.error=h.problemUntil;return}this.run(async()=>{if((await Gc(this.hass,{user_id:r.id,theme:this.theme,dark:o,ends:s}))?.self){let d=o===void 0?{theme:this.theme}:{theme:this.theme,dark:o};return{message:h.selfApplied,selfApply:tr(d)}}return{message:h.assigned}},r.name)}}static{this.properties={...re.properties,person:{attribute:!1},mode:{state:!0},limited:{state:!0},until:{state:!0},theme:{state:!0},startsNow:{attribute:!1}}}get zone(){return this.hass?.config?.time_zone||void 0}render(){let t=this.person;if(!t)return c;let r=Zo(Date.now()/1e3+60,this.zone),o=Zo(Date.now()/1e3+31622400-3600,this.zone);return l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${h.assignTitle(t.name)}>
        <form @submit=${this.onSubmit}>
          <div class="field">
            <label for="theme">${h.theme}</label>
            <select id="theme" aria-describedby="theme-hint" @change=${i=>this.theme=i.target.value}>
              ${this.themeOptions(this.theme)}
            </select>
            <p class="muted" id="theme-hint">${h.themeHint}</p>
          </div>
          <fieldset>
            <legend>${h.mode}</legend>
            ${["auto","dark","light"].map(i=>l`<label class="choice">
                <input type="radio" name="mode" .checked=${this.mode===i} @change=${()=>this.mode=i} />
                ${i==="auto"?h.modeAuto:i==="dark"?h.modeDark:h.modeLight}
              </label>`)}
          </fieldset>
          ${this.startsNow?l`<p class="muted" id="starts-now" role="note">${h.startsNow}</p>`:c}
          <fieldset>
            <legend>${h.duration}</legend>
            <label class="choice">
              <input type="radio" name="until" .checked=${!this.limited} @change=${()=>this.limited=!1} />
              ${h.untilNone}
            </label>
            <label class="choice">
              <input type="radio" name="until" .checked=${this.limited} @change=${()=>this.limited=!0} />
              ${h.untilDate}
            </label>
            ${this.limited?l`<label class="sr" for="until">${h.untilInput}</label>
                  <input
                    id="until"
                    type="datetime-local"
                    min=${r}
                    max=${o}
                    .value=${this.until}
                    @input=${i=>this.until=i.target.value}
                  />`:c}
          </fieldset>
          ${this.renderError()}${this.renderActions(h.assign)}
        </form>
      </hats-lite-dialog-shell>
    `}},ei=class extends re{constructor(){super(...arguments);this.month=1;this.day=1;this.theme=h.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(r){if(!rr(this.month,this.day)){this.error=h.problemDate;return}this.run(async()=>(await Zc(this.hass,r.id,{month:this.month,day:this.day,theme:this.theme,...this.dark===void 0?{}:{dark:this.dark}}),{message:h.birthdaySaved}),r.name)}};this.onClear=()=>{let t=this.person;t&&this.run(async()=>(await Jc(this.hass,t.id),{message:h.birthdayCleared}),t.name)}}static{this.properties={...re.properties,person:{attribute:!1},month:{state:!0},day:{state:!0}}}willUpdate(t){let r=this.person?.birthday;t.has("person")&&r&&(this.month=r.month,this.day=r.day,this.theme=r.theme,this.dark=r.dark)}render(){let t=this.person;return t?l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${h.birthdayTitle(t.name)}>
        <form @submit=${this.onSubmit}>
          <div class="row">
            <div class="field">
              <label for="month">${h.month}</label>
              <select id="month" @change=${r=>this.month=Number(r.target.value)}>
                ${h.months.map((r,o)=>l`<option value=${o+1} ?selected=${this.month===o+1}>${r}</option>`)}
              </select>
            </div>
            <div class="field">
              <label for="day">${h.day}</label>
              <input
                id="day"
                type="number"
                min="1"
                max=${pt[this.month-1]}
                .value=${String(this.day)}
                @input=${r=>this.day=Number(r.target.value)}
              />
            </div>
          </div>
          <div class="field">
            <label for="theme">${h.theme}</label>
            <select id="theme" aria-describedby="theme-hint" @change=${r=>this.theme=r.target.value}>
              ${this.themeOptions(this.theme)}
            </select>
            <p class="muted" id="theme-hint">${h.themeHint}</p>
          </div>
          ${this.renderError()}
          <div class="actions">
            <button class="btn" type="button" id="clear" ?disabled=${this.busy} @click=${this.onClear}>${h.clear}</button>
            <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${h.cancel}</button>
            <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy?h.saving:h.save}</button>
          </div>
        </form>
      </hats-lite-dialog-shell>
    `:c}},ti=class extends re{constructor(){super(...arguments);this.candidates=[];this.picked=new Set;this.onSubmit=t=>{t.preventDefault(),this.run(async()=>(await tu(this.hass,[...this.picked]),{message:h.assignersSaved}))}}static{this.properties={...re.properties,candidates:{attribute:!1},picked:{state:!0}}}willUpdate(t){t.has("candidates")&&(this.picked=new Set(this.candidates.filter(r=>r.is_assigner).map(r=>r.id)))}toggle(t,r){let o=new Set(this.picked);r?o.add(t):o.delete(t),this.picked=o}render(){let t=this.candidates.filter(r=>!r.is_admin);return l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${h.assignersTitle}>
        <form @submit=${this.onSubmit}>
          <p class="muted">${h.assignersHelp}</p>
          ${t.length===0?l`<p>${h.assignersEmpty}</p>`:l`<fieldset>
                <legend class="sr">${h.assignersTitle}</legend>
                ${t.map(r=>l`<label class="choice">
                    <input
                      type="checkbox"
                      .checked=${this.picked.has(r.id)}
                      @change=${o=>this.toggle(r.id,o.target.checked)}
                    />
                    ${r.name}
                  </label>`)}
              </fieldset>`}
          ${this.renderError()}${this.renderActions(h.save)}
        </form>
      </hats-lite-dialog-shell>
    `}},Zb=[["hats-lite-dialog-shell",Jo],["hats-lite-assign-dialog",Qo],["hats-lite-birthday-dialog",ei],["hats-lite-assigners-dialog",ti]];for(let[e,n]of Zb)customElements.get(e)||customElements.define(e,n);var ni=[{key:"new-year",name:"New Year",month_start:12,day_start:30,month_end:1,day_end:2},{key:"valentines",name:"Valentine's Day",month_start:2,day_start:13,month_end:2,day_end:14},{key:"st-patricks",name:"St. Patrick's Day",month_start:3,day_start:16,month_end:3,day_end:17},{key:"earth-day",name:"Earth Day",month_start:4,day_start:22,month_end:4,day_end:22},{key:"halloween",name:"Halloween",month_start:10,day_start:24,month_end:10,day_end:31},{key:"christmas",name:"Christmas",month_start:12,day_start:20,month_end:12,day_end:26}];function du(e,n){if(!n.includes(e))return e;let t=2;for(;n.includes(`${e}-${t}`);)t+=1;return`${e}-${t}`}var Qb={name:h.problemName,date:h.problemDate,theme:h.problemTheme};function Wt(e){let n=`${h.months[e.month_start-1]} ${e.day_start}`,t=`${h.months[e.month_end-1]} ${e.day_end}`;return n===t?n:`${n} - ${t}`}var ri=class extends A{constructor(){super(...arguments);this.item=null;this.kind="holiday";this.themes=[];this.taken=[];this.zone=void 0;this.busy=!1;this.draft=this.blank();this.yearly=!0;this.problem=null;this.presetKey="";this.onPreset=t=>{this.presetKey=t.target.value;let r=ni.find(s=>s.key===this.presetKey);if(!r)return;let{key:o,...i}=r;this.patch(i)};this.onSubmit=t=>{t.preventDefault();let r=Yo(this.draft);if(this.problem=r,r||this.busy)return;let o={...this.draft,name:this.draft.name.trim()};this.item||(o.id=du(this.presetKey||this.kind,this.taken)),this.kind==="event"&&(o.kind="event",this.yearly?delete o.year:o.year=ru(o,new Date,this.zone)),this.dispatchEvent(new CustomEvent("holiday-save",{detail:o,bubbles:!0,composed:!0}))};this.onCancel=()=>{this.dispatchEvent(new CustomEvent("holiday-cancel",{bubbles:!0,composed:!0}))}}static{this.properties={item:{attribute:!1},kind:{type:String},themes:{attribute:!1},taken:{attribute:!1},zone:{attribute:!1},busy:{type:Boolean},draft:{state:!0},yearly:{state:!0},problem:{state:!0}}}static{this.styles=Kt}blank(){return{id:"",name:"",month_start:1,day_start:1,month_end:1,day_end:1,theme:h.defaultTheme,enabled:!0}}willUpdate(t){(t.has("item")||t.has("kind"))&&(this.draft=this.item?{...this.item}:this.blank(),this.yearly=this.item?.year===void 0,this.problem=null,this.presetKey="")}patch(t){this.draft={...this.draft,...t},this.problem=null}num(t){return r=>this.patch({[t]:Number(r.target.value)})}monthSelect(t,r){return l`<select aria-label=${r} @change=${this.num(t)}>
      ${h.months.map((o,i)=>l`<option value=${i+1} ?selected=${this.draft[t]===i+1}>${o}</option>`)}
    </select>`}dateRow(t,r,o){return l`<div class="field">
      <span>${t}</span>
      <div class="row">
        ${this.monthSelect(r,`${t} ${h.month}`)}
        <input type="number" min="1" max="31" aria-label=${`${t} ${h.day}`} .value=${String(this.draft[o])} @input=${this.num(o)} />
      </div>
    </div>`}themeOptions(){let t=this.draft.theme,r=[h.defaultTheme,...ne(this.themes,t).filter(i=>i!==h.defaultTheme)],o=r.map(i=>l`<option value=${i} ?selected=${i===t}>${K(i)}</option>`);return t&&!r.includes(t)&&o.push(l`<option value=${t} selected>${h.missingTheme(t)}</option>`),o}renderPreset(){return this.item||this.kind==="event"?c:l`<div class="field">
      <label for="preset">${h.holidayPreset}</label>
      <select id="preset" @change=${this.onPreset}>
        <option value="">${h.holidayPresetPick}</option>
        ${ni.map(t=>l`<option value=${t.key}>${t.name} (${Wt(t)})</option>`)}
      </select>
    </div>`}heading(){return this.item?h.holidayEditTitle(this.item.name):this.kind==="event"?h.eventNewTitle:h.holidayNewTitle}render(){let t=this.kind==="event";return l`
      <form @submit=${this.onSubmit}>
        <h3 class="form-title">${this.heading()}</h3>
        ${this.renderPreset()}
        <div class="field">
          <label for="f-name">${t?h.eventName:h.holidayName}</label>
          <input
            id="f-name"
            type="text"
            maxlength=${60}
            placeholder=${t?h.eventNamePlaceholder:""}
            .value=${this.draft.name}
            @input=${r=>this.patch({name:r.target.value})}
          />
        </div>
        <div class="row">
          ${this.dateRow(h.holidayStart,"month_start","day_start")}${this.dateRow(h.holidayEnd,"month_end","day_end")}
        </div>
        <div class="field">
          <label for="f-theme">${h.theme}</label>
          <select id="f-theme" aria-describedby="f-theme-hint" @change=${r=>this.patch({theme:r.target.value})}>
            ${this.themeOptions()}
          </select>
          <p class="muted" id="f-theme-hint">${h.themeHint}</p>
        </div>
        ${t?l`<label class="choice">
              <input id="f-yearly" type="checkbox" .checked=${this.yearly} @change=${r=>this.yearly=r.target.checked} />
              ${h.eventYearly}
            </label>`:c}
        <label class="choice">
          <input type="checkbox" .checked=${this.draft.enabled!==!1} @change=${r=>this.patch({enabled:r.target.checked})} />
          ${h.holidayEnabled}
        </label>
        ${this.problem?l`<p class="error" role="alert">${Qb[this.problem]}</p>`:c}
        <div class="actions">
          <button class="btn cancel" type="button" ?disabled=${this.busy} @click=${this.onCancel}>${h.cancel}</button>
          <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy?h.saving:h.save}</button>
        </div>
      </form>
    `}};customElements.get("hats-lite-holiday-form")||customElements.define("hats-lite-holiday-form",ri);function ey(e){return e.kind==="event"?h.eventKind:h.holidayKind}function ty(e,n){return l`<li class="holiday-row">
    <div class="holiday-main">
      <strong>${e.name}</strong>
      <span class="chip">${ey(e)}</span>
      ${e.enabled===!1?l`<span class="chip">${h.holidayOff}</span>`:c}
      <div class="muted">${Wt(e)}</div>
      <div class="muted">${h.theme}: ${K(e.theme)}</div>
    </div>
    <div class="holiday-actions">
      <button class="btn edit" type="button" aria-label=${`${h.holidayEdit} ${e.name}`} ?disabled=${n.busy} @click=${()=>n.onEdit(e)}>
        ${h.holidayEdit}
      </button>
      <button class="btn remove" type="button" aria-label=${`${h.holidayRemove} ${e.name}`} ?disabled=${n.busy} @click=${()=>n.onRemove(e)}>
        ${h.holidayRemove}
      </button>
    </div>
  </li>`}function cu(e,n){return e.length===0?l`<p class="muted">${h.holidaysEmpty}</p>`:l`<ul class="holiday-list" aria-label=${h.holidayListLabel}>${e.map(t=>ty(t,n))}</ul>`}var ii=Wt;function si(e,n=new Date){let t=Array.from({length:12},(r,o)=>{let i=n.getMonth()+o;return{month:i%12+1,year:n.getFullYear()+Math.floor(i/12)}});return l`
    <ol class="timeline" aria-label=${h.timeline}>
      ${t.map(({month:r,year:o})=>{let i=pt[r-1],s=e.filter(a=>Xo(a,r,o).length>0);return l`<li class="month">
          <span>${h.months[r-1]}</span>
          <div class="track">
            ${s.flatMap(a=>Xo(a,r,o).map(d=>l`<i
                  class="bar"
                  style=${se({left:`${(d.from-1)/i*100}%`,width:`${(d.to-d.from+1)/i*100}%`})}
                ></i>`))}
          </div>
          ${s.map(a=>l`<span class="sr">${h.timelineHoliday(a.name,ii(a))}</span>`)}
        </li>`})}
    </ol>
  `}var oi=class extends re{constructor(){super(...arguments);this.loaded=!0;this.holidays=[];this.items=[];this.view={kind:"list"};this.onSave=t=>{let r=t.detail,o=this.items.some(i=>i.id===r.id);this.persist(o?this.items.map(i=>i.id===r.id?r:i):[...this.items,r])};this.backToList=()=>{this.error="",this.view={kind:"list"}}}static{this.properties={...re.properties,loaded:{type:Boolean},holidays:{attribute:!1},items:{state:!0},view:{state:!0}}}willUpdate(t){t.has("holidays")&&(this.items=this.holidays.map(r=>({...r})))}persist(t){this.loaded&&this.run(async()=>{let r=await eu(this.hass,t);this.items=r,this.view={kind:"list"},this.dispatchEvent(new CustomEvent("holidays-changed",{detail:r,bubbles:!0,composed:!0}))})}open(t,r){this.error="",this.view={kind:"form",entry:t,item:r}}renderList(){return l`
      <div class="row">
        <button class="btn" type="button" id="add-holiday" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("holiday",null)}>${h.holidayAdd}</button>
        <button class="btn" type="button" id="add-event" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("event",null)}>${h.eventAdd}</button>
      </div>
      ${si(this.items)}
      ${cu(this.items,{busy:this.busy||!this.loaded,onEdit:t=>this.open(t.kind==="event"?"event":"holiday",t),onRemove:t=>this.persist(this.items.filter(r=>r.id!==t.id))})}
      ${this.renderError()}
      <div class="actions"><button class="btn primary" type="button" @click=${()=>this.close()}>${h.close}</button></div>
    `}renderForm(t){return l`
      <hats-lite-holiday-form
        .item=${t.item}
        .kind=${t.entry}
        .themes=${this.themes}
        .zone=${lu(this.hass)}
        .taken=${this.items.map(r=>r.id)}
        .busy=${this.busy}
        @holiday-save=${this.onSave}
        @holiday-cancel=${this.backToList}
      ></hats-lite-holiday-form>
      ${this.renderError()}
    `}render(){return l`
      <hats-lite-dialog-shell .heading=${h.holidayEditorTitle}>
        ${this.view.kind==="form"?this.renderForm(this.view):this.renderList()}
      </hats-lite-dialog-shell>
    `}};customElements.get("hats-lite-holidays-dialog")||customElements.define("hats-lite-holidays-dialog",oi);var ny=["override","birthday","holiday"],pu=/^(\d{4})-(\d{2})-(\d{2})$/,ry=/^([01][0-9]|2[0-3]):[0-5][0-9]$/,oy=/^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$/,hu=/^(\d{4})-(\d{2})$/;function fe(e,n=2){return String(e).padStart(n,"0")}function ai(e,n,t){return`${fe(e,4)}-${fe(n)}-${fe(t)}`}function je(e){return e.slice(0,7)}function Me(e){let n=pu.exec(e);return n?[Number(n[1]),Number(n[2]),Number(n[3])]:null}function ir(e){let n=hu.exec(e);return n?[Number(n[1]),Number(n[2])]:null}function sr(e){let[n,t]=ir(e)??[1970,1];return new Date(Date.UTC(n,t,0)).getUTCDate()}function li(e,n){let[t,r]=ir(e)??[1970,1],o=t*12+(r-1)+n;return`${fe(Math.floor(o/12),4)}-${fe(o%12+1)}`}function mt(e,n){let[t,r,o]=Me(e)??[1970,1,1],i=new Date(Date.UTC(t,r-1,o+n));return ai(i.getUTCFullYear(),i.getUTCMonth()+1,i.getUTCDate())}function mu(e){let[n,t,r]=Me(e)??[1970,1,1];return new Date(Date.UTC(n,t-1,r)).getUTCDay()}function or(e,n){let[,,t]=Me(e)??[1970,1,1],r=li(je(e),n);return`${r}-${fe(Math.min(t,sr(r)))}`}var iy={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};function di(e){let n=e?.locale,t=iy[n?.first_weekday??""];if(t!==void 0)return t;if(!n?.language)return 1;try{let r=new Intl.Locale(n.language).getWeekInfo?.();if(r&&r.firstDay>=1&&r.firstDay<=7)return r.firstDay%7}catch{return 1}return 1}function fu(e,n=new Date){let t=e?.config?.time_zone;try{let r=new Intl.DateTimeFormat("en-US",{timeZone:t||void 0,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(n),o=i=>Number(r.find(s=>s.type===i)?.value);return ai(o("year"),o("month"),o("day"))}catch{return ai(n.getFullYear(),n.getMonth()+1,n.getDate())}}function ci(e){let[n]=Me(e)??[1970];return{min:`${fe(n-1,4)}-01`,max:`${fe(n+2,4)}-12`}}function gu(e,n){return(mu(`${e}-01`)-n+7)%7}function uu(e,n){let t=(mu(e)-n+7)%7;return{first:mt(e,-t),last:mt(e,6-t)}}function bu(e,n,t){switch(n){case"ArrowLeft":return mt(e,-1);case"ArrowRight":return mt(e,1);case"ArrowUp":return mt(e,-7);case"ArrowDown":return mt(e,7);case"Home":return uu(e,t).first;case"End":return uu(e,t).last;case"PageUp":return or(e,-1);case"PageDown":return or(e,1);default:return null}}function sy(e){let n=e;if(!n||typeof n!="object"||!ny.includes(n.kind)||typeof n.theme!="string")return null;let t={...n,kind:n.kind,source:String(n.source??n.kind),theme:n.theme};return delete t.partial,delete t.active_from,delete t.active_until,n.partial===!0&&ry.test(String(n.active_from))&&oy.test(String(n.active_until))&&(t.partial=!0,t.active_from=n.active_from,t.active_until=n.active_until),t}function ay(e){let n=e;if(!n||typeof n.date!="string"||!pu.test(n.date)||!Array.isArray(n.items))return null;let t=n.winner,r=t?.selection?.theme;return{date:n.date,winner:t&&typeof r=="string"?t:null,items:n.items.map(sy).filter(o=>o!==null),conflict:n.conflict===!0}}function ly(e){let n=e;if(!n||typeof n.month!="string"||!hu.test(n.month)||!Array.isArray(n.days)||n.days.length!==sr(n.month))return null;let t=n.days.map(ay);return t.some((r,o)=>r===null||r.date!==`${n.month}-${fe(o+1)}`)?null:{month:n.month,user:String(n.user??""),time_zone:String(n.time_zone??""),opt_out:n.opt_out===!0,trial:n.trial===!0,days:t}}async function yu(e,n,t){let r={type:"hats_lite/calendar",month:n};t&&(r.user=t);let o=ly(await P(e,r));if(!o||o.month!==n)throw{code:"unknown"};return o}function vu(e,n=new Date){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:e||void 0,hourCycle:"h23",hour:"numeric",minute:"numeric",second:"numeric"}).formatToParts(n),r=o=>Number(t.find(i=>i.type===o)?.value);return[r("hour"),r("minute"),r("second")]}catch{return[n.getHours(),n.getMinutes(),n.getSeconds()]}}var k={viewLabel:"People view",list:"List",calendar:"Calendar",loading:"Loading the calendar...",loadFailed:"Could not load the calendar.",retry:"Try again",prev:"Previous month",next:"Next month",today:"Today",person:"Person",grid:e=>`Calendar for ${e}`,optedOut:"This person opted out of assigned themes, so nothing here is applied.",none:"No scheduled theme",detailTitle:"Selected day",noSelection:"Pick a day to see what applies.",effective:"Theme that applies",noEffective:"None, the person's own theme is used.",setBy:e=>`Set by ${e}`,setByAdmin:"an administrator",itemsHeading:"Everything on this day",wins:"Applies",loses:"Not applied",until:e=>`until ${e}`,untilRemoved:"until removed",conflict:"Conflict",conflictNote:"More than one item wants a different theme on this day.",preview:"Preview this day",previewMissing:"This theme is not installed, so it cannot be previewed.",assignNow:e=>`Assign now, until the end of ${e}`,assignLate:"There is less than two minutes left today. Pick another day to assign a theme.",trial:"A try is running; the schedule applies again when it ends",partialOnly:"Only part of the day has an assigned theme",appliesFrom:e=>`applies from ${e}`,untilTime:e=>`until ${e}`,partial:"Part of the day",editHolidays:"Edit holidays",kinds:{override:"Assignment",birthday:"Birthday",holiday:"Holiday"},itemName:e=>e.kind==="holiday"?e.name?`Holiday ${e.name}`:"Holiday":e.kind==="birthday"?"Birthday":e.assigned_by_name?`Assignment by ${e.assigned_by_name}`:"Assignment",cellLabel:(e,n)=>`${e}. ${n}`,winnerSummary:(e,n)=>`Theme ${e} from ${n}`,conflictSummary:(e,n,t)=>`Conflict: theme ${e} from ${n} wins over ${t}`,errors:{unauthorized:"You are not allowed to see that calendar.",invalid_user:"That user is no longer available.",invalid_request:"That month is outside the range the calendar can show.",not_loaded:"The server is still starting. Try again in a moment.",unknown:"Something went wrong. Try again."}};function wu(e){return k.errors[e]??k.loadFailed}function ar(e,n){let t=Me(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{dateStyle:"full",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,t[2])))}catch{return e}}function ui(e,n){let t=ir(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,1)))}catch{return e}}function xu(e,n){let t=(r,o)=>{try{return new Intl.DateTimeFormat(n,{weekday:r,timeZone:"UTC"}).format(new Date(Date.UTC(2024,0,7+o)))}catch{return String(o)}};return Array.from({length:7},(r,o)=>{let i=(e+o)%7;return{short:t("short",i),long:t("long",i)}})}function ku(e){return e?["override","birthday","holiday"].filter(n=>e.items.some(t=>t.kind===n)):[]}function $u(e){return e.items.find(n=>n.wins===!0&&n.partial!==!0)}function dy(e){return e.items.filter(n=>n!==$u(e)).map(n=>`${k.itemName(n)} (${K(n.theme)})`).join(", ")}function Eu(e,n){if(!e||e.items.length===0)return k.none;if(n)return k.optedOut;if(!e.winner)return k.partialOnly;let t=$u(e),r=t?k.itemName(t):e.winner.source,o=e.winner.selection.theme;return e.conflict?k.conflictSummary(K(o),r,dy(e)):k.winnerSummary(K(o),r)}function cy(e,n,t){try{return e.toLocaleString(n,t?{timeZone:t}:void 0)}catch{return e.toLocaleString(n)}}function pi(e,n,t){return e.kind!=="override"?"":e.until===null||e.until===void 0?k.untilRemoved:k.until(cy(new Date(e.until*1e3),n,t))}function hi(e){if(e.partial!==!0||!e.active_from||!e.active_until||e.active_from===e.active_until)return"";let n=e.active_from==="00:00"?"":k.appliesFrom(e.active_from),t=e.active_until==="24:00"?"":k.untilTime(e.active_until);return[n,t].filter(Boolean).join(" ")}function uy(e){let n=e.day?.winner;if(!n||e.optOut)return l`<p class="muted" id="effective">${k.noEffective}</p>`;let t=e.day?.items.find(s=>s.wins===!0&&s.partial!==!0),r=n.selection.theme,o=n.selection.dark??e.darkMode,i=e.installed.includes(r);return l`
    <p id="effective"><strong>${K(r)}</strong>${t?l` - ${k.itemName(t)}`:c}</p>
    ${t?.kind==="override"?l`<p class="muted">${k.setBy(t.assigned_by_name??k.setByAdmin)}</p>`:c}
    <div class="tools">
      <button class="btn" type="button" id="preview-day" ?disabled=${!i} @click=${()=>e.onPreview(r,o)}>${k.preview}</button>
    </div>
    ${i?c:l`<p class="muted">${k.previewMissing}</p>`}
  `}function py(e){let n=e.day?.items??[];return n.length===0?c:l`
    <h4>${k.itemsHeading}</h4>
    ${e.day?.conflict?l`<p class="notice" id="conflict-note" role="status">${k.conflictNote}</p>`:c}
    <ul class="items">
      ${n.map(t=>l`<li class=${t.wins&&!t.partial?"won":"lost"} data-wins=${t.wins&&!t.partial?"true":"false"}>
          <span class="name">${k.itemName(t)}</span> - ${K(t.theme)}
          <span class="chip ${t.wins?"ok":"warn"}">${t.partial?k.partial:t.wins?k.wins:k.loses}</span>
          ${hi(t)?l`<div class="muted">${hi(t)}</div>`:c}
          ${pi(t,e.locale,e.zone)?l`<div class="muted">${pi(t,e.locale,e.zone)}</div>`:c}
        </li>`)}
    </ul>
  `}function Tu(e){return e.key?l`
    <h3 id="detail-title">${e.title}</h3>
    <h4>${k.effective}</h4>
    ${uy(e)} ${py(e)}
    <div class="tools">
      ${e.canAssign?l`<button class="btn" type="button" id="assign-until" ?disabled=${e.assignLate} @click=${e.onAssign}>${e.assignLabel}</button>`:c}
      ${e.canHolidays?l`<button class="btn" type="button" id="edit-holidays-cal" @click=${e.onHolidays}>${k.editHolidays}</button>`:c}
    </div>
    ${e.canAssign&&e.assignLate?l`<p class="muted" id="assign-hint">${k.assignLate}</p>`:c}
  `:l`<h3>${k.detailTitle}</h3><p class="muted">${k.noSelection}</p>`}var _u=[V,W,T`
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
`];var mi=class extends A{constructor(){super(...arguments);this.people=[];this.view="list";this.status="idle";this.failure="";this.month="";this.data=null;this.selected="";this.focusKey="";this.userId="";this.token=0;this.stale=!1;this.onKey=t=>{let r=this.focusKey;if(t.key==="Enter"||t.key===" "){t.preventDefault(),this.selected=r;return}let o=bu(r,t.key,di(this.hass));o!==null&&(t.preventDefault(),je(o)===this.month?(this.focusKey=o,this.updateComplete.then(()=>this.cellOf(o)?.focus())):this.goTo(je(o),o))};this.onPerson=t=>{this.userId=t.target.value,this.selected="",this.data=null,this.load()}}static{this.properties={hass:{attribute:!1},people:{attribute:!1},view:{state:!0},status:{state:!0},failure:{state:!0},month:{state:!0},data:{state:!0},selected:{state:!0},focusKey:{state:!0},userId:{state:!0}}}static{this.styles=_u}get language(){return this.hass?.locale?.language}get zone(){return this.hass?.config?.time_zone||void 0}minutesLeft(){let[t,r,o]=vu(this.zone);return 1440-(t*60+r+o/60)}get today(){return fu(this.hass)}willUpdate(t){t.has("hass")&&this.hass&&this.month===""?(this.userId=this.hass.user?.id??"",this.month=je(this.today),this.focusKey=this.today):t.has("people")&&t.get("people")!==void 0&&this.status!=="idle"&&(this.view==="calendar"?this.load():this.stale=!0)}async load(){let t=this.hass;if(!t)return;let r=++this.token,o=this.month;this.stale=!1,this.status="loading";try{let i=await yu(t,o,this.userId||void 0);if(r!==this.token)return;this.data=i,this.failure="",this.status="ready"}catch(i){if(r!==this.token)return;let s=G(i);this.data=null,this.failure=wu(s),this.status=s==="unknown_command"?"unsupported":"error",this.status==="unsupported"&&this.setView("list")}}setView(t){t!==this.view&&(this.view=t,this.dispatchEvent(new CustomEvent("schedule-view",{detail:{view:t},bubbles:!0,composed:!0})),t==="calendar"&&(this.status==="idle"||this.stale)&&this.load())}async goTo(t,r){let o=ci(this.today);t<o.min||t>o.max||(this.month=t,this.focusKey=r,je(this.selected)!==t&&(this.selected=""),this.data=null,await this.load(),await this.updateComplete,this.cellOf(r)?.focus())}cellOf(t){return this.renderRoot.querySelector(`[data-day="${t}"]`)}onPick(t){this.selected=t,this.focusKey=t}dayOf(t){return this.data?.days.find(r=>r.date===t)}canAssign(){let t=this.hass?.user,r=this.people.find(o=>o.id===this.userId);return r?r.id===t?.id?!0:t?.is_admin===!0||!r.is_admin&&this.people.some(o=>o.id!==t?.id):!1}detailModel(){let t=this.selected,r=this.dayOf(t),o=Vt(this.hass),i=t>=this.today,s=this.zone;return{key:t,day:r,title:ar(t,this.language),optOut:this.data?.opt_out===!0,installed:o,locale:this.language,zone:s,assignLabel:k.assignNow(ar(t,this.language)),assignLate:t===this.today&&this.minutesLeft()<2,canAssign:i&&this.canAssign(),canHolidays:this.hass?.user?.is_admin===!0,darkMode:this.hass?.themes?.darkMode,onPreview:(a,d)=>this.dispatchEvent(new CustomEvent("hats-lite-preview-theme",{detail:{theme:a,dark:d},bubbles:!0,composed:!0})),onAssign:()=>{let a=r?.winner?.selection,d={userId:this.userId,until:`${t}T23:59`};a?.theme&&(d.theme=a.theme),a?.dark!==void 0&&(d.dark=a.dark),this.dispatchEvent(new CustomEvent("schedule-assign",{detail:d,bubbles:!0,composed:!0}))},onHolidays:()=>this.dispatchEvent(new CustomEvent("schedule-holidays",{bubbles:!0,composed:!0}))}}renderSwitch(){return l`
      <div class="seg" role="group" aria-label=${k.viewLabel}>
        <button type="button" id="view-list" aria-pressed=${this.view==="list"?"true":"false"} @click=${()=>this.setView("list")}>${k.list}</button>
        <button type="button" id="view-calendar" aria-pressed=${this.view==="calendar"?"true":"false"} @click=${()=>this.setView("calendar")}>${k.calendar}</button>
      </div>
    `}renderCell(t,r){let o=this.dayOf(t),i=Me(t)?.[2]??0,s=ku(o),a=Eu(o,this.data?.opt_out===!0);return l`<div class="cell" role="gridcell" aria-selected=${this.selected===t?"true":"false"}>
      <button
        type="button"
        class="day ${t===r?"today":""}"
        data-day=${t}
        tabindex=${this.focusKey===t?"0":"-1"}
        aria-current=${t===r?"date":c}
        aria-label=${k.cellLabel(ar(t,this.language),a)}
        @click=${()=>this.onPick(t)}
      >
        <span class="num" aria-hidden="true">${i}</span>
        <span class="marks" aria-hidden="true">
          ${s.map(d=>l`<i class="dot ${d}" data-kind=${d}></i>`)}
          ${o?.conflict?l`<span class="conflict" data-conflict="true">!</span>`:c}
        </span>
      </button>
    </div>`}renderGrid(){let t=di(this.hass),r=this.today,o=gu(this.month,t),i=sr(this.month),s=[...Array.from({length:o},()=>null),...Array.from({length:i},(d,u)=>`${this.month}-${String(u+1).padStart(2,"0")}`)];for(;s.length%7!==0;)s.push(null);let a=Array.from({length:s.length/7},(d,u)=>s.slice(u*7,u*7+7));return l`<div class="grid" role="grid" aria-label=${k.grid(ui(this.month,this.language))} @keydown=${this.onKey}>
      <div class="row" role="row">
        ${xu(t,this.language).map(d=>l`<div class="head" role="columnheader" aria-label=${d.long}>${d.short}</div>`)}
      </div>
      ${a.map(d=>l`<div class="row" role="row">
          ${d.map(u=>u===null?l`<div class="cell" role="gridcell" aria-hidden="true"></div>`:this.renderCell(u,r))}
        </div>`)}
    </div>`}renderNav(){let t=ci(this.today),r=o=>{this.goTo(li(this.month,o),or(this.focusKey||`${this.month}-01`,o))};return l`<div class="bar">
      <button class="btn" type="button" id="prev" aria-label=${k.prev} ?disabled=${this.month<=t.min} @click=${()=>r(-1)}>&lsaquo;</button>
      <h3 class="title grow" id="month-title" aria-live="polite">${ui(this.month,this.language)}</h3>
      <button class="btn" type="button" id="today" @click=${()=>{this.goTo(je(this.today),this.today)}}>${k.today}</button>
      <button class="btn" type="button" id="next" aria-label=${k.next} ?disabled=${this.month>=t.max} @click=${()=>r(1)}>&rsaquo;</button>
      ${this.people.length>1?l`<label class="muted" for="person">${k.person}</label>
            <select id="person" @change=${this.onPerson}>
              ${this.people.map(o=>l`<option value=${o.id} ?selected=${o.id===this.userId}>${o.name}</option>`)}
            </select>`:c}
    </div>`}renderCalendar(){return this.status==="error"?l`${this.renderNav()}
        <p class="notice error" role="alert">${this.failure||k.loadFailed}</p>
        <button class="btn" type="button" id="retry-calendar" @click=${()=>{this.load()}}>${k.retry}</button>`:this.data===null?l`${this.renderNav()}<p class="muted" role="status">${k.loading}</p>`:l`
      ${this.renderNav()}
      ${this.data?.trial?l`<p class="notice" id="trial-note" role="status">${k.trial}</p>`:c}
      ${this.data?.opt_out?l`<p class="notice" role="status">${k.optedOut}</p>`:c}
      ${this.status==="loading"?l`<p class="muted" role="status">${k.loading}</p>`:c}
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
        <section class="card" aria-live="polite">${Tu(this.detailModel())}</section>
      </div>
    `}render(){return!this.hass||this.status==="unsupported"?c:l`<div class="bar">${this.renderSwitch()}</div>
      ${this.view==="calendar"?this.renderCalendar():c}`}};customElements.get("hats-lite-schedule")||customElements.define("hats-lite-schedule",mi);var fi=class extends A{constructor(){super(...arguments);this.people=[];this.holidays=[];this.status="idle";this.message="";this.failure="";this.dialog=null;this.holidaysLoaded=!1;this.holidaysFailure="";this.removing=new Set;this.calendarView=!1;this.opener=null;this.onClose=()=>{this.dialog=null;let t=this.opener;this.updateComplete.then(()=>t?.focus?.())};this.onScheduleAssign=t=>{let{userId:r,until:o,theme:i,dark:s}=t.detail,a=this.people.find(d=>d.id===r);a&&this.open({kind:"assign",person:a,until:o,theme:i,dark:s})};this.onHolidaysChanged=t=>{this.holidays=t.detail,this.message=h.holidaysSaved,er()};this.onDone=t=>{let r=t.detail;this.dialog=null,this.message=r.message,this.failure="",r.selfApply&&(this.dispatchEvent(new CustomEvent("settheme",{detail:r.selfApply,bubbles:!0,composed:!0})),er()),this.load();let o=this.opener;this.updateComplete.then(()=>o?.focus?.())}}static{this.properties={hass:{attribute:!1},people:{state:!0},holidays:{state:!0},status:{state:!0},message:{state:!0},failure:{state:!0},dialog:{state:!0},holidaysLoaded:{state:!0},holidaysFailure:{state:!0},removing:{state:!0},calendarView:{state:!0}}}static{this.styles=au}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load()}async load(){let t=this.hass;if(t){this.status!=="ready"&&(this.status="loading");try{this.people=await Go(t),this.status="ready"}catch(r){this.failure=ht(G(r)),this.status="error";return}await this.loadHolidays()}}async loadHolidays(){let t=this.hass;if(t)try{this.holidays=await Qc(t),this.holidaysLoaded=!0,this.holidaysFailure=""}catch(r){this.holidaysLoaded=!1,this.holidaysFailure=ht(G(r))}}get selfId(){return this.hass?.user?.id}get isAdmin(){return this.hass?.user?.is_admin===!0}get canAssign(){return this.isAdmin||this.people.some(t=>t.id!==this.selfId)}themeNames(){return Vt(this.hass)}open(t){this.opener=this.shadowRoot?.activeElement,this.dialog=t}async act(t,r,o,i=!1){this.message="",this.failure="";try{await t(),this.message=r,i&&er()}catch(s){this.failure=ht(G(s),o)}await this.load()}optOut(t,r){let o=this.hass;o&&this.act(()=>Xc(o,r),r?h.optOutOn:h.optOutOff,t.name,!0)}mayUnassign(t){let r=t.active_override;if(!r)return!1;if(this.isAdmin||t.id===this.selfId)return!0;let o=this.selfId;return o!==void 0&&r.assigned_by===o}removeOverride(t,r){let o=this.hass;!o||this.removing.has(t)||(this.removing=new Set(this.removing).add(t),this.act(()=>Yc(o,t),h.unassigned,r).finally(()=>{let i=new Set(this.removing);i.delete(t),this.removing=i}))}renderOverride(t){let r=t.active_override;if(!r)return l`<span class="muted">${h.noOverride}</span>`;let o=r.ends===null?h.noEnd:h.until(new Date(r.ends*1e3).toLocaleString());return l`<span class="override">${h.overrideLine(r.theme)} ${o}. ${h.setBy(r.assigned_by_name)}</span>`}renderPerson(t){let r=t.id===this.selfId,o=this.hass,i=r||this.isAdmin,s=this.canAssign&&(this.isAdmin||!t.is_admin);return l`
      <li class="person">
        <div class="head">
          <span class="name">${t.name}</span>
          ${r?l`<span class="chip">${h.you}</span>`:c}
          ${t.is_admin?l`<span class="chip">${h.admin}</span>`:c}
          ${!r&&t.opt_out?l`<span class="chip warn">${h.optedOutChip}</span>`:c}
        </div>
        <div>${this.renderOverride(t)}</div>
        <div class="tools">
          ${r?l`<button class="switch" type="button" role="switch" aria-checked=${t.opt_out?"true":"false"} @click=${()=>this.optOut(t,!t.opt_out)}>
                ${h.optOutLabel}
              </button>`:c}
          ${r&&t.active_override&&!t.opt_out?l`<button class="btn" type="button" id="opt-out-shortcut" @click=${()=>this.optOut(t,!0)}>${h.optOutShortcut}</button>`:c}
          ${s?l`<button class="btn" type="button" aria-label="${h.assign}: ${t.name}" @click=${()=>this.open({kind:"assign",person:t})}>${h.assign}</button>`:c}
          ${this.mayUnassign(t)&&o?l`<button
                class="btn"
                type="button"
                aria-label="${h.unassign}: ${t.name}"
                ?disabled=${this.removing.has(t.active_override.id)}
                @click=${()=>this.removeOverride(t.active_override.id,t.name)}
              >
                ${h.unassign}
              </button>`:c}
          ${i?l`<button class="btn" type="button" aria-label="${h.birthday}: ${t.name}" @click=${()=>this.open({kind:"birthday",person:t})}>${h.birthday}</button>`:c}
        </div>
      </li>
    `}renderHolidays(){return l`
      <section class="card" aria-labelledby="holidays-h">
        <h2 id="holidays-h">${h.holidays}</h2>
        <p class="muted">${h.holidaysIntro}</p>
        ${si(this.holidays)}
        ${this.holidaysLoaded?this.holidays.length===0?l`<p class="muted">${h.holidaysEmpty}</p>`:l`<ul class="holidays">
              ${this.holidays.map(t=>l`<li>${h.holidayRowLabel(t.name,t.kind==="event"?h.eventKind:h.holidayKind)}: ${ii(t)} (${K(t.theme)})${t.enabled===!1?" - off":""}</li>`)}
            </ul>`:l`<p class="notice error" id="holidays-error" role="alert">
                ${this.holidaysFailure||h.holidaysLoadFailed}
              </p>
              <button class="btn" type="button" id="retry-holidays" @click=${()=>{this.loadHolidays()}}>${h.retry}</button>`}
        ${this.isAdmin?l`<div class="tools">
              <button class="btn" type="button" id="edit-holidays" ?disabled=${!this.holidaysLoaded} @click=${()=>this.open({kind:"holidays"})}>${h.editHolidays}</button>
              <button class="btn" type="button" id="edit-assigners" @click=${()=>this.open({kind:"assigners"})}>${h.assigners}</button>
            </div>`:c}
      </section>
    `}renderDialog(){let t=this.dialog;if(!t)return c;let r={hass:this.hass,themes:this.themeNames(),installed:Vt(this.hass)};switch(t.kind){case"assign":return l`<hats-lite-assign-dialog
          .hass=${r.hass}
          .themes=${r.themes}
          .installed=${r.installed}
          .person=${t.person}
          .limited=${t.until!==void 0}
          .until=${t.until??""}
          .theme=${t.theme??h.defaultTheme}
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
        ></hats-lite-assigners-dialog>`}}render(){return this.status==="idle"||this.status==="loading"?l`<p class="muted" role="status">${h.loading}</p>`:this.status==="error"?l`<p class="notice error" role="alert">${this.failure||h.loadFailed}</p>
        <button class="btn" type="button" @click=${()=>{this.load()}}>${h.retry}</button>`:l`
      <p class="muted">${h.intro}</p>
      ${this.failure?l`<p class="notice error" role="alert">${this.failure}</p>`:c}
      ${this.message?l`<p class="notice" role="status">${this.message}</p>`:c}
      <hats-lite-schedule
        .hass=${this.hass}
        .people=${this.people}
        @schedule-view=${t=>this.calendarView=t.detail.view==="calendar"}
        @schedule-assign=${this.onScheduleAssign}
        @schedule-holidays=${()=>this.open({kind:"holidays"})}
      ></hats-lite-schedule>
      <div class="layout" style=${this.calendarView?"display:none":""}>
        <section class="card" aria-labelledby="people-h">
          <h2 id="people-h">${h.title}</h2>
          <ul class="people">${this.people.map(t=>this.renderPerson(t))}</ul>
        </section>
        ${this.renderHolidays()}
      </div>
      ${this.renderDialog()}
    `}};customElements.get("hats-lite-people")||customElements.define("hats-lite-people",fi);var bi=["styling","cards","layout","templating","chrome"],hy=4096,yi="hats_lite/",vi=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,gi=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function ze(e){return typeof e=="string"?e:""}function my(e){if(!e||typeof e!="object")return null;let n=e,t=ze(n.full_name);if(!vi.test(t))return null;let r=bi.find(o=>o===n.kind)??"cards";return{category:n.category==="integration"?"integration":"plugin",kind:r,full_name:t,description:ze(n.description),stars:typeof n.stars=="number"&&Number.isFinite(n.stars)?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"||typeof n.hacs_id=="number"?n.hacs_id:null,filename:ze(n.filename)||null,pinned:n.pinned===!0,license:ze(n.license)||null,tag:ze(n.tag)||null}}async function Su(e){let n=await P(e,{type:`${yi}mods`}),t=Array.isArray(n?.mods)?n.mods:[];return{source:ze(n?.source),mods:t.map(my).filter(r=>r!==null),truncated:n?.truncated===!0}}async function Au(e,n){let t=await P(e,{type:`${yi}mod_asset`,full_name:n});if(typeof t?.source!="string")throw{code:"fetch_failed"};return{full_name:ze(t.full_name)||n,source:t.source}}async function wi(e){try{let n=await P(e,{type:`${yi}mods`,probe:!0});return Array.isArray(n?.mods)}catch(n){return G(n)!=="unknown_command"}}function Mu(e){return vi.test(e)?`https://github.com/${e}`:null}function Cu(e){return e.pinned&&e.category==="plugin"}function Pu(e,n,t){if(!vi.test(n))return;let[r="",o=""]=n.split("/");return On(e,r,o,t)}function fy(e){if(e.tag&&gi.test(e.tag))return e.tag;let n=(e.filename??"").replace(/\.js$/i,"").toLowerCase();return gi.test(n)?n:""}function Ru(e){let n=fy(e);return JSON.stringify({type:`custom:${n||"my-card"}`},null,2)}function xi(e){if(e.trim()==="")return{ok:!1,problem:"empty"};if(new TextEncoder().encode(e).length>hy)return{ok:!1,problem:"too_large"};let n;try{n=JSON.parse(e)}catch{return{ok:!1,problem:"invalid"}}if(!n||typeof n!="object"||Array.isArray(n))return{ok:!1,problem:"not_object"};let t=n;if(typeof t.type!="string"||t.type==="")return{ok:!1,problem:"no_type"};let r=t.type.startsWith("custom:")?t.type.slice(7):"";return gi.test(r)?{ok:!0,config:t,tag:r}:{ok:!1,problem:"bad_type"}}function Du(e,n,t,r="all"){let o=n.trim().toLowerCase();return e.filter(i=>r!=="all"&&i.kind!==r||t==="installed"&&!i.installed?!1:o===""?!0:i.full_name.toLowerCase().includes(o)||i.description.toLowerCase().includes(o))}var cr={maxEntities:100,maxBytes:1048576,maxString:2048,maxAttrBytes:4096},ki=/^[a-z0-9_]+\.[a-z0-9_]+$/,gy=/token|access|auth|password|passwd|secret|credential|api[_-]?key/i,by=/(?:^|[?&;#]|%3F|%26)(access_token|token|auth|authsig|signature|sig|key|password)(?:=|%3D)/i,yy=/^[a-z][a-z0-9+.-]*:\/\/[^/?#\s]*@/i,vy=/eyJ[A-Za-z0-9_-]{10,}/,wy=/[0-9a-f]{32,}/i,xy=/[A-Za-z0-9+/_-]{32,}/g,ky=5,$y=12,$i=200,Nu=500,lr=100,Ey=12,oe=Symbol("drop"),Fu=new Set(["person","device_tracker","camera","lock","alarm_control_panel","tag","notify","input_text","text"]),Ty=new Set(["friendly_name","unit_of_measurement","device_class","state_class","icon","supported_features","min","max","step","options","brightness","color_temp","current_temperature","temperature","humidity","hvac_action","hvac_mode","hvac_modes","battery_level","volume_level","is_volume_muted","media_title","media_artist","source","source_list","percentage","current_position","entity_id"]),_y=/^(entity|entities|entity_id|camera_image|.+_entity|.+_entities|.+_entity_id)$/,Ou=typeof TextEncoder>"u"?null:new TextEncoder;function Bu(e){return Ou===null?e.length:Ou.encode(e).length}function Sy(e){try{let n=JSON.stringify(e);return n===void 0?1/0:Bu(n)}catch{return 1/0}}function ft(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Lu(e){if(yy.test(e)||by.test(e)||vy.test(e)||wy.test(e))return!0;for(let n of e.match(xy)??[])if(/\d/.test(n)&&/[A-Za-z]/.test(n))return!0;return!1}function dr(e,n=cr.maxString){let t=e.length>n?e.slice(0,n):e;if(Lu(t))return null;if(t.includes("%"))try{if(Lu(decodeURIComponent(t)))return null}catch{return t}return t}function gt(e,n,t,r,o=ky){if(e===null)return null;if(typeof e=="string"){let i=dr(e,t);return i===null?oe:i}if(typeof e=="number")return Number.isFinite(e)?e:oe;if(typeof e=="boolean")return e;if(n>=o)return oe;if(Array.isArray(e)){let i=[];if(e.length>Nu)return oe;for(let s of e){let a=gt(s,n+1,t,r,o);a!==oe&&i.push(a)}return i}if(ft(e)){let i={},s=0;for(let a of Object.keys(e)){if(a==="__proto__"||a==="constructor"||a==="prototype"||r&&gy.test(a))continue;if(s>=$i)break;let d=gt(e[a],n+1,t,r,o);d!==oe&&(i[a]=d,s+=1)}return i}return oe}function Ay(e){if(!Array.isArray(e))return[];let n=[];for(let t of e.slice(0,lr))typeof t=="string"&&ki.test(t)&&!Fu.has(t.slice(0,t.indexOf(".")))&&n.push(t);return n}function My(e,n){let t={};for(let r of Object.keys(e).slice(0,$i)){if(!Ty.has(r))continue;let o=r==="entity_id"?Ay(e[r]):gt(e[r],0,n.maxString,!0);o!==oe&&(Sy(o)>n.maxAttrBytes||(t[r]=o))}return t}function Iu(e){if(typeof e=="string")return dr(e.slice(0,64),64)??void 0}function Hu(e,n){return typeof e=="string"?e.slice(0,n):void 0}function Cy(e){return e.slice(0,e.indexOf("."))}function Uu(e){let n=[],t=new Set,r=i=>{typeof i=="string"&&ki.test(i)&&!t.has(i)&&n.length<lr&&(t.add(i),n.push(i))},o=(i,s,a)=>{if(!(s>Ey||n.length>=lr)){if(typeof i=="string"){a&&r(i);return}if(Array.isArray(i)){for(let d of i.slice(0,Nu))o(d,s+1,a);return}if(ft(i))for(let d of Object.keys(i).slice(0,$i))d!=="__proto__"&&o(i[d],s+1,_y.test(d))}};return o(e,0,!1),n}function Py(e,n={}){let t={...cr,...n},r={};if(!ft(e))return r;let o=(n.entityIds??[]).slice(0,lr),i=0,s=0;for(let a of o){if(typeof a!="string"||!ki.test(a)||a in r)continue;if(i>=t.maxEntities)break;let d=Object.prototype.hasOwnProperty.call(e,a)?e[a]:void 0;if(!ft(d))continue;let u=ft(d.attributes)?d.attributes:{},m;if(Fu.has(Cy(a))||"latitude"in u||"longitude"in u){let g=typeof u.friendly_name=="string"?dr(u.friendly_name,255):null;m={entity_id:a,state:"unknown",attributes:g===null?{}:{friendly_name:g}}}else{let g=d.state,v=typeof g=="string"?g:g==null?"unknown":String(g);m={entity_id:a,state:dr(v,t.maxString)??"unknown",attributes:My(u,t)};let E=Iu(d.last_changed),M=Iu(d.last_updated);E!==void 0&&(m.last_changed=E),M!==void 0&&(m.last_updated=M)}let p=Bu(JSON.stringify(m));s+p>t.maxBytes||(s+=p,r[a]=m,i+=1)}return r}function ju(e,n={}){let t=n.maxString??cr.maxString,r=gt(e,0,t,!1,$y);return r===oe?{}:r}function Ei(e,n={}){let t={...cr,...n},r=ft(e)?e:{},o=Hu(r.language,32)??"en",i=Hu(r.selectedLanguage,32)??o,s=gt(r.themes,0,t.maxString,!1),a=gt(r.locale,0,t.maxString,!1);return{states:Py(r.states,n),themes:s===oe?{}:s,language:o,selectedLanguage:i,locale:a===oe?{}:a,userData:{language:i}}}function zu(e,n=1e3){let t=-1/0,r=null,o=null,i=a=>{t=Date.now(),e(...a)},s=((...a)=>{let d=t+n-Date.now();if(d<=0&&r===null){i(a);return}o=a,r===null&&(r=setTimeout(()=>{r=null;let u=o;o=null,u!==null&&i(u)},Math.max(d,0)))});return s.cancel=()=>{r!==null&&clearTimeout(r),r=null,o=null},s}var Ku="read only preview",Vu="allow-scripts",Wu="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'",qu="The preview runs third party code in a sandboxed frame. A mod that loops forever can still freeze this browser tab, because the frame may share the page's renderer thread. Reload the page if that happens.",Gu="The mod author's code runs in a locked frame, but this cannot stop it from sending what it receives to the author. Both modes also receive your theme and language.",Yu="Own config: it receives the config of the card you entered and the state of the entities that card uses. Sensitive entities such as person, camera, lock and device_tracker have their state hidden.",Xu="Mock mode: the entities and states it receives are fake.",Ry=["mod_error","set_config","unhandled_rejection","runtime_error","not_defined"];var Dy=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function Ti(e){return typeof e=="string"&&e.length<=100&&Dy.test(e)}function Zu(e=globalThis.crypto){let n=new Uint8Array(16);e.getRandomValues(n);let t="";for(let r of n)t+=r.toString(16).padStart(2,"0");return t}function Ju(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function qt(e){return typeof e=="string"&&e.length<=500?e:null}function Oy(e){if(!Array.isArray(e)||e.length>100)return null;let n=[];for(let t of e){if(!Ju(t))return null;let r=qt(t.type),o=qt(t.name),i=qt(t.description);if(r===null||o===null||i===null)return null;n.push({type:r,name:o,description:i})}return n}function _i(e,n){if(!Ju(e)||typeof e.type!="string"||typeof e.token!="string")return null;if(e.type==="ready")return e.token===""?{type:"ready"}:null;if(n===""||e.token!==n)return null;switch(e.type){case"heartbeat":return{type:"heartbeat"};case"rendered":return{type:"rendered"};case"defined":return Ti(e.tag)?{type:"defined",tag:e.tag}:null;case"cards":{let t=Oy(e.cards);return t===null?null:{type:"cards",cards:t}}case"error":{let t=qt(e.message),r=Ry.find(o=>o===e.code);return t===null||r===void 0?null:{type:"error",code:r,message:t}}case"request":{let t=qt(e.method),r=e.id;return t===null||typeof r!="number"||!Number.isSafeInteger(r)?null:{type:"request",id:r,method:t}}default:return null}}function Ly(e){let n=e.document,t=e.parent.postMessage.bind(e.parent),r=e.customElements,o=r.define.bind(r),i="read only preview",s=500,a="",d=null,u=!1,m=null,p=0,g=$=>{if(d!==null)try{d.postMessage({...$,token:a})}catch{return}},v=$=>String($??"").slice(0,s),E=($,_)=>{let C=_&&_.message!==void 0?_.message:_;g({type:"error",code:$,message:v(C)})},M=$=>(p+=1,g({type:"request",id:p,method:v($)}),Promise.reject(new Error(i))),S=$=>()=>M($),U=$=>({states:$.states,themes:$.themes,language:$.language,selectedLanguage:$.selectedLanguage,locale:$.locale,userData:$.userData,callService:S("callService"),callWS:S("callWS"),callApi:S("callApi"),fetchWithAuth:S("fetchWithAuth"),connection:Object.freeze({sendMessagePromise:S("connection.sendMessagePromise"),subscribeMessage:S("connection.subscribeMessage"),subscribeEvents:S("connection.subscribeEvents"),sendMessage:S("connection.sendMessage")}),auth:Object.freeze({data:Object.freeze({}),refreshAccessToken:S("auth.refreshAccessToken"),wsUrl:""})});e.customCards=[];let I=()=>{let $=[],_=Array.isArray(e.customCards)?e.customCards:[];for(let C=0;C<_.length&&$.length<100;C+=1){let H=_[C];H&&typeof H=="object"&&$.push({type:v(H.type),name:v(H.name),description:v(H.description)})}g({type:"cards",cards:$})};e.customElements.define=function($,_,C){o($,_,C),g({type:"defined",tag:v($)})};class X extends e.HTMLElement{constructor(){super();let _=this.attachShadow({mode:"open"}),C=n.createElement("style");C.textContent=":host{display:block;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color,#212121);border-radius:var(--ha-card-border-radius,12px);box-shadow:var(--ha-card-box-shadow,none);overflow:hidden;box-sizing:border-box}",_.appendChild(C),_.appendChild(n.createElement("slot"))}}o("ha-card",X);let j=($,_,C)=>{let H;try{H=n.createElement($),typeof H.setConfig=="function"&&H.setConfig(_)}catch(z){E("set_config",z);return}m=H;try{H.hass=C,n.body.appendChild(H)}catch(z){E("mod_error",z);return}g({type:"rendered"})},Re=$=>{u=!0,a=$.token,e.hass=U($.hass),e.setInterval(()=>g({type:"heartbeat"}),1e3);let _=n.createElement("script");_.textContent=String($.modSource);try{n.head.appendChild(_)}catch(H){E("mod_error",H);return}I();let C=String($.tag);if(r.get(C)!==void 0){j(C,$.config,e.hass);return}r.whenDefined(C).then(()=>j(C,$.config,e.hass),H=>E("not_defined",H))};e.onerror=($,_,C,H,z)=>(E("mod_error",z||$),!0),e.addEventListener("unhandledrejection",$=>{typeof $.preventDefault=="function"&&$.preventDefault()});let de=$=>{let _=$.data;if(!(!u||!_||typeof _!="object"||_.token!==a)&&_.type==="hass"&&_.hass&&typeof _.hass=="object"&&(e.hass=U(_.hass),m!==null))try{m.hass=e.hass}catch(C){E("mod_error",C)}};e.addEventListener("message",$=>{if(u||$.source!==e.parent)return;let _=$.data;if(!_||typeof _!="object"||_.type!=="init")return;let C=$.ports;!C||C.length!==1||!C[0]||typeof _.token!="string"||_.token===""||(d=C[0],d.onmessage=de,Re(_))}),t({type:"ready",token:""},"*")}var Qu=`(${Ly.toString()})(window);`;var Ny=1e3,Fy=3e3,By=50,Uy=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${Wu}"></head><body><script>${Qu}<\/script></body></html>`;function ep(e){let{modSource:n,tag:t,config:r,onError:o,onReady:i,onBlocked:s}=e,a=Uu(r),d=e.timeoutMs??5e3,u=Zu(),m=document.createElement("iframe");m.setAttribute("sandbox",Vu),m.setAttribute("referrerpolicy","no-referrer"),m.setAttribute("allow",""),m.setAttribute("loading","eager"),m.setAttribute("title","Mod preview"),m.srcdoc=Uy;let p=new MessageChannel,g=p.port1,v=!1,E=!1,M=!1,S=0,U=e.hass,I=Date.now(),X=0,j=[],Re=[],de=null,$=null,_=B=>v||!E?!1:(g.postMessage(B),!0),C=zu(B=>{if(v||!E)return;let N;try{N=Ei(B,{entityIds:a})}catch{z("mirror_error","state mirror failed");return}try{_({type:"hass",token:u,hass:N})}catch{return}},1e3),H=()=>{if(!v){v=!0,window.removeEventListener("message",qi),g.onmessage=null;for(let B of[p.port1,p.port2])try{B.close()}catch{continue}de!==null&&clearTimeout(de),$!==null&&clearInterval($),de=null,$=null,C.cancel(),m.remove()}},z=(B,N)=>{if(!v){H();try{o({code:B,message:N})}catch{return}}},zp=()=>{let B,N;try{B=Ei(U,{entityIds:a}),N=ju(r)}catch{z("mirror_error","state mirror failed");return}let Xt=m.contentWindow;if(Xt===null){z("post_failed","sandbox window unavailable");return}E=!0;let Zt={type:"init",token:u,modSource:n,tag:t,config:N,hass:B};try{Xt.postMessage(Zt,"*",[p.port2])}catch(Gi){z("post_failed",Gi instanceof Error?Gi.message:"post failed")}};function qi(B){if(v)return;let N=m.contentWindow,Xt=B.source;if(N===null||Xt!==N)return;let Zt=_i(B.data,"");if(!(Zt===null||Zt.type!=="ready")){if(E){z("navigated","sandbox frame sent a second ready");return}I=Date.now(),zp()}}function Kp(B){if(v||!E)return;let N=_i(B.data,u);if(!(N===null||N.type==="ready"))switch(I=Date.now(),N.type){case"heartbeat":return;case"defined":j.length<200&&!j.includes(N.tag)&&j.push(N.tag);return;case"cards":Re=N.cards;return;case"rendered":if(de!==null&&clearTimeout(de),de=null,M)return;M=!0,i!==void 0&&i({tags:[...j],cards:[...Re]});return;case"error":z(N.code,N.message);return;case"request":if(X+=1,X>By)return;try{_({type:"refused",token:u,id:N.id,error:Ku})}catch{return}return}}return m.addEventListener("load",()=>{S+=1,S>1&&z("navigated","sandbox frame navigated")}),typeof n!="string"||n.length>4194304?queueMicrotask(()=>z("too_large","mod source rejected")):Ti(t)?(window.addEventListener("message",qi),g.onmessage=Kp,de=setTimeout(()=>z("timeout","mod did not render in time"),d),$=setInterval(()=>{Date.now()-I>Fy&&(z("heartbeat_lost","sandbox stopped responding"),s!==void 0&&s())},Ny)):queueMicrotask(()=>z("invalid_tag","invalid custom element name")),{element:m,update(B){v||(U=B,E&&C(B))},destroy:H}}var bt=[V,W,T`
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
`];var w={title:"Mods",intro:"Add-ons that change how your dashboard looks: styling, cards, layouts and chrome. Previews run in an isolated frame and nothing is installed from here.",loading:"Loading mods...",loadFailed:"Could not load the mods list.",retry:"Try again",search:"Search mods",searchPlaceholder:"Name or description",filters:"Filter",filterAll:"All",filterInstalled:"Installed",kinds:"Kind",kindAll:"All kinds",kindLabels:{styling:"Styling",cards:"Cards",layout:"Layout",templating:"Templating",chrome:"Chrome"},integrationChip:"Integration",integrationNote:"This integration comes from {store}. It acts on your real dashboard and cannot be previewed in the sandbox. Install it through {store}.",empty:"No mods match.",truncated:"The list is incomplete. Narrow the search to find more.",installedChip:"Installed",pinnedChip:"Preview available",stars:e=>`${e} stars`,license:e=>`License: ${e}`,repository:"Repository",openInStore:"Open in {label}",select:e=>`Preview ${e}`,nothingSelected:"Select a mod to see its preview.",installedNote:"Already in your dashboard resources",installedHint:"This card is already loaded in your dashboard, so it is previewed with the real card helpers.",installedUnavailable:"The real card could not be created here. Check it in the Preview tab or on a dashboard.",unpinned:"Preview unavailable: this mod is not in the pinned set",configLabel:"Your card config (JSON)",configHelp:"Up to 4 KB. The type must be custom: followed by the card tag.",configProblems:{empty:"Enter a card config.",too_large:"The card config is larger than 4 KB.",invalid:"The card config is not valid JSON.",not_object:"The card config must be an object.",no_type:"The card config needs a type such as custom:my-card.",bad_type:"The type must start with custom: followed by a valid card tag."},run:"Show preview",runOwn:"Run my card",advancedTitle:"Advanced: try your own card",noLiveMock:"This mod works on other cards, so it cannot be shown on its own here.",close:"Close",showCard:"Show real card",confirmTitle:"Before running third party code",isolation:qu,disclosureAuthor:Gu,disclosureOwn:Yu,disclosureMock:Xu,confirm:"Run in sandbox",cancel:"Cancel",fetching:"Fetching the pinned release...",starting:"Starting the sandbox...",running:"Preview running.",reset:"Reset",width:"Width",height:"Height 480 px",widths:{phone:"Phone",tablet:"Tablet",desktop:"Desktop"},stageLabel:"Sandboxed mod preview",errors:{not_pinned:"This mod is not in the pinned set.",hash_mismatch:"The downloaded file does not match the pinned hash, so it was refused.",too_large:"The mod file is too large to preview.",bad_content_type:"The server returned an unexpected content type.",redirect_refused:"The download tried to redirect and was refused.",network:"The network request failed.",timeout:"The request or the mod timed out.",invalid_encoding:"The mod file is not valid text.",not_found:"The mod file was not found.",fetch_failed:"The mod file could not be fetched.",rate_limited:"Too many requests. Wait a moment and try again.",catalog_unavailable:"The mod catalog is unavailable right now.",unauthorized:"You are not allowed to do that.",unknown_command:"This server does not support the Mods tab.",navigated:"The mod tried to navigate the preview frame and was stopped.",heartbeat_lost:"The preview stopped responding and was removed.",mirror_error:"The card state could not be copied into the preview.",mod_error:"The mod failed while loading.",set_config:"The card rejected this config.",unhandled_rejection:"The mod raised an unhandled error.",runtime_error:"The mod raised a runtime error.",not_defined:"The mod did not define that card tag.",invalid_tag:"That is not a valid custom card tag.",post_failed:"The preview frame could not be started.",unknown:"Something went wrong. Try again."},unknownCode:e=>`Something went wrong (${e}). Try again.`};function ur(e){let n=w.errors[e];return n||(e==="unknown"?w.errors.unknown:w.unknownCode(e))}var tp="2024-01-01T12:00:00+00:00",jy={"light.mock_lamp":{entity_id:"light.mock_lamp",state:"on",attributes:{friendly_name:"Living room lamp",brightness:180,icon:"mdi:lamp"}},"switch.mock_fan":{entity_id:"switch.mock_fan",state:"off",attributes:{friendly_name:"Bedroom fan",icon:"mdi:fan"}},"sensor.mock_temperature":{entity_id:"sensor.mock_temperature",state:"21.5",attributes:{friendly_name:"Room temperature",unit_of_measurement:"C",device_class:"temperature"}},"climate.mock_thermostat":{entity_id:"climate.mock_thermostat",state:"heat",attributes:{friendly_name:"Thermostat",current_temperature:20.5,temperature:22,hvac_action:"heating",hvac_modes:["off","heat","cool"]}},"cover.mock_blind":{entity_id:"cover.mock_blind",state:"open",attributes:{friendly_name:"Window blind",icon:"mdi:blinds"}}},yt=["light.mock_lamp","switch.mock_fan","sensor.mock_temperature"],Si={styling:{tag:null,config:{type:"entities",title:"Example card",entities:yt,card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An entities card with three example rows. This mod restyles cards like this one."},cards:{tag:null,config:{type:"entities",title:"Example card",entities:yt},summary:"An entities card with three example rows."},layout:{tag:null,config:{type:"vertical-stack",cards:[{type:"entity",entity:"sensor.mock_temperature"},{type:"entities",entities:yt}]},summary:"Two example cards arranged together. This mod controls how cards are laid out."},templating:{tag:null,config:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"},summary:"One example card. This mod lets you reuse a card design in many places."},chrome:{tag:null,config:{type:"entities",title:"Example dashboard",entities:yt},summary:"An example dashboard. This mod changes the header and sidebar around your cards."}},np={"piitaya/lovelace-mushroom":{tag:"mushroom-entity-card",config:{type:"custom:mushroom-entity-card",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Mushroom entity card for an example lamp."},"custom-cards/button-card":{tag:"button-card",config:{type:"custom:button-card",entity:"light.mock_lamp",name:"Living room lamp",show_state:!0},summary:"A button card for an example lamp."},"Clooos/Bubble-Card":{tag:"bubble-card",config:{type:"custom:bubble-card",card_type:"button",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Bubble button for an example lamp."},"jcwillox/lovelace-paper-buttons-row":{tag:"paper-buttons-row",config:{type:"custom:paper-buttons-row",buttons:[{entity:"light.mock_lamp"},{entity:"switch.mock_fan"},{entity:"cover.mock_blind"}]},summary:"A row of three example buttons."},"ofekashery/vertical-stack-in-card":{tag:null,config:{type:"custom:vertical-stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:yt}]},summary:"Two example cards merged into one panel."},"custom-cards/stack-in-card":{tag:null,config:{type:"custom:stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:yt}]},summary:"Two example cards merged into one panel."},"ownbee/bootstrap-grid-card":{tag:null,config:{type:"custom:bootstrap-grid-card",cards:[{type:"row",cards:[{type:"entity",entity:"light.mock_lamp"},{type:"entity",entity:"switch.mock_fan"}]}]},summary:"Two example cards side by side in a grid."},"iantrich/config-template-card":{tag:null,config:{type:"custom:config-template-card",entities:["sensor.mock_temperature"],card:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"}},summary:"An example card whose settings come from a template."},"thomasloven/lovelace-card-mod":{...Si.styling,config:{type:"thermostat",entity:"climate.mock_thermostat",card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An example thermostat card with rounded corners applied by this mod."}};function pr(e){return(Object.prototype.hasOwnProperty.call(np,e.full_name)?np[e.full_name]:null)??Si[e.kind]??Si.cards}var zy=["language","locale","themes","selectedTheme","localize"];function Ai(e){let n=e&&typeof e=="object"?e:{},t={};for(let i of zy)n[i]!==void 0&&(t[i]=n[i]);let r={};for(let[i,s]of Object.entries(jy))r[i]={...s,attributes:{...s.attributes},last_changed:tp,last_updated:tp};let o=async()=>{};return{...t,states:r,entities:{},devices:{},areas:{},user:{id:"mock",name:"Guest",is_admin:!1},callService:o,callWS:o}}var Ky=[["phone",390],["tablet",768],["desktop",1024]],Vy=480,rp=new Set;function op(e,n){return`${e.full_name.toLowerCase()}@${e.tag??""}:${n?"own":"mock"}`}var Wy=async(e,n)=>{let t=await cn();return un(t,n)};function Ci(e,n){let t=Mu(e.full_name),r=n?Pu(n,e.full_name,e.category):void 0;return l`
    ${t?l`<a class="link" href=${t} target="_blank" rel="noopener noreferrer">${w.repository}</a>`:c}
    ${r&&n?l`<a class="link" id="store-link" href=${r} target="_blank" rel="noopener noreferrer">${te(w.openInStore,n)}</a>`:c}
  `}var Mi=class extends A{constructor(){super(...arguments);this.mod=null;this.createSandbox=ep;this.cardFactory=Wy;this.configText="";this.problem="";this.phase="idle";this.failure="";this.width=390;this.installedFailed=!1;this.sandbox=null;this.card=null;this.token=0;this.own=!1;this.pending=null;this.focusTarget=null;this.onConfigInput=t=>{this.configText=t.target.value,this.problem=""};this.onRun=()=>{this.begin(this.mockTarget())};this.onRunOwn=()=>{let t=xi(this.configText);if(!t.ok){this.problem=t.problem;return}this.begin(this.ownTarget())};this.onConfirm=()=>{this.mod&&this.pending&&rp.add(op(this.mod,this.pending.own)),this.start()};this.onCancel=()=>{this.focusTarget="run",this.phase="idle"};this.onReset=()=>{this.stop(),this.focusTarget="run",this.phase="idle",this.failure=""}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1},createSandbox:{attribute:!1},cardFactory:{attribute:!1},configText:{state:!0},problem:{state:!0},phase:{state:!0},failure:{state:!0},width:{state:!0},installedFailed:{state:!0}}}static{this.styles=bt}disconnectedCallback(){super.disconnectedCallback(),this.stop()}willUpdate(t){t.has("mod")&&(this.stop(),this.phase="idle",this.problem="",this.failure="",this.installedFailed=!1,this.configText=this.mod?Ru(this.mod):"")}mockTarget(){let t=this.mod;if(!t||!this.hass)return null;let r=pr(t);return{tag:r.tag??"",config:r.config,hass:Ai(this.hass),own:!1}}ownTarget(){let t=xi(this.configText);return!t.ok||!this.hass?null:{tag:t.tag,config:t.config,hass:this.hass,own:!0}}updated(t){t.has("mod")&&this.mod?.installed&&this.mod.category==="plugin"&&this.showInstalled(this.mockTarget()),t.has("hass")&&this.hass&&this.sandbox&&this.sandbox.update(this.own?this.hass:Ai(this.hass));let r=this.stage();r&&this.sandbox&&this.sandbox.element.parentNode!==r&&r.append(this.sandbox.element),this.sandbox&&this.sizeFrame(),this.applyFocus()}applyFocus(){let t=this.focusTarget;if(!t)return;let r=this.renderRoot.querySelector(t==="confirm"?"#confirm-h":"#run, #run-own");r&&(this.focusTarget=null,r.focus())}stage(){return this.renderRoot.querySelector(".stage")}sizeFrame(){let t=this.sandbox?.element;t&&(t.style.width=`${this.width}px`,t.style.height=`${Vy}px`,t.style.maxWidth="100%",t.style.border="0")}stop(){this.token+=1,this.sandbox?.destroy(),this.sandbox=null,this.card?.remove(),this.card=null}async showInstalled(t){if(!t)return;this.own=t.own;let r=++this.token;this.card?.remove(),this.card=null,this.installedFailed=!1;let o;try{o=await this.cardFactory(t.hass,t.config)}catch{r===this.token&&(this.installedFailed=!0);return}r===this.token&&(o.hass=t.hass,this.card=o,await this.updateComplete,this.stage()?.append(o))}begin(t){t&&(this.pending=t,this.problem="",this.mod&&rp.has(op(this.mod,t.own))?this.start():(this.focusTarget="confirm",this.phase="confirm"))}fail(t){this.stop(),this.failure=ur(t),this.phase="error"}async start(){let t=this.mod,r=this.hass,o=this.pending;if(!t||!r||!o)return;this.own=o.own,this.stop();let i=this.token;this.phase="fetching";let s;try{s=(await Au(r,t.full_name)).source}catch(a){i===this.token&&this.fail(G(a));return}i===this.token&&(this.phase="starting",this.sandbox=this.createSandbox({modSource:s,tag:o.tag,config:o.config,hass:o.hass,onReady:()=>{i===this.token&&(this.phase="running")},onError:a=>{i===this.token&&this.fail(a.code)}}))}renderAdvanced(t,r,o){return l`
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
        ${this.problem?l`<p class="notice error" id="config-problem" role="alert">${w.configProblems[this.problem]??this.problem}</p>`:c}
        <div class="tools">
          <button class="btn" type="button" id=${o} aria-label=${t} @click=${r}>${t}</button>
        </div>
      </details>
    `}renderWidths(){return l`
      <div class="seg" role="group" aria-label=${w.width}>
        ${Ky.map(([t,r])=>l`<button
            type="button"
            data-width=${r}
            aria-pressed=${this.width===r?"true":"false"}
            @click=${()=>{this.width=r}}
          >
            ${w.widths[t]} ${r}
          </button>`)}
      </div>
      <span class="muted">${w.height}</span>
    `}renderSandbox(){let t=this.phase==="fetching"||this.phase==="starting";if(this.phase==="idle"){let r=this.mod?pr(this.mod):null;return l`
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
    `}renderBody(t){return t.category==="integration"?l`<p class="notice" id="integration-note">${te(w.integrationNote,Fe(this.hass))}</p>`:t.installed?l`
        <p class="notice" id="installed-note">${w.installedNote}</p>
        <p class="muted">${w.installedHint}</p>
        ${this.installedFailed?l`<p class="notice error" id="installed-failed" role="alert">${w.installedUnavailable}</p>`:c}
        <p class="muted" id="mock-summary">${this.mod?pr(this.mod).summary:""}</p>
        <div class="stage" role="region" aria-label=${w.stageLabel}></div>
        ${this.renderAdvanced(w.showCard,()=>{this.showInstalled(this.ownTarget())},"show-card")}
      `:Cu(t)?this.renderSandbox():l`<p class="notice" id="unpinned">${w.unpinned}</p>`}render(){let t=this.mod;return t?l`
      ${t.pinned&&t.license?l`<p class="muted" id="license">${w.license(t.license)}</p>`:c}
      <p class="links">${Ci(t,Fe(this.hass))}</p>
      ${this.renderBody(t)}
    `:l`<p class="muted">${w.nothingSelected}</p>`}};customElements.get("hats-lite-mods-preview")||customElements.define("hats-lite-mods-preview",Mi);var ip='a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',qy=T`
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
`;function Gy(e){let n=e.activeElement;for(;n?.shadowRoot?.activeElement;)n=n.shadowRoot.activeElement;return n}var Pi=class extends A{constructor(){super(...arguments);this.mod=null;this.onKey=t=>{if(t.key==="Escape"){t.stopPropagation(),t.preventDefault(),this.close();return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=Gy(document),i=r.findIndex(a=>a===o),s=r.length-1;t.shiftKey&&i<=0?(t.preventDefault(),r[s].focus()):!t.shiftKey&&(i===-1||i===s)&&(t.preventDefault(),r[0].focus())};this.downOnBackdrop=!1;this.onBackdropDown=t=>{this.downOnBackdrop=t.target===t.currentTarget};this.onBackdrop=t=>{let r=this.downOnBackdrop;this.downOnBackdrop=!1,r&&t.target===t.currentTarget&&this.close()}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1}}}static{this.styles=[bt,qy]}firstUpdated(){this.renderRoot.querySelector("#close")?.focus()}close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}focusables(){let t=Array.from(this.renderRoot.querySelectorAll(ip)),r=this.renderRoot.querySelector("hats-lite-mods-preview")?.shadowRoot,o=r?Array.from(r.querySelectorAll(ip)):[];return[...t,...o].filter(i=>!i.closest("details:not([open])")||i.tagName==="SUMMARY")}render(){let t=this.mod;return t?l`
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
    `:l``}};customElements.get("hats-lite-mods-dialog")||customElements.define("hats-lite-mods-dialog",Pi);var Di=["browse","preview","designer","people","mods"],Yy=["theme","plugin","integration"],Xy=/^[A-Za-z0-9_.-]{1,100}$/,Zy=/^\/[a-z0-9-]{1,40}$/,Jy=/^\/([a-z]+)\/?$/,Qy=new Map([["gallery","browse"],["preview","preview"],["designer","designer"],["people","people"],["mods","mods"]]);function ev(e){return e==="browse"?"gallery":e}function tv(e){return Di.includes(e)}function hr(e){return typeof e=="string"&&Xy.test(e)&&e!=="."&&e!==".."}function sp(e){return Yy.includes(e)}function nv(e,n){return e==="preview"?n==="theme":e==="mods"?n!=="theme":!1}function ap(e,n){if(typeof n!="object"||n===null)return!1;let t=n,{owner:r,repository:o,category:i}=t;return hr(r)&&hr(o)&&sp(i)&&nv(e,i)}function Ri(e,n){let t=e.getAll(n);return t.length===1?t[0]:null}function rv(e,n){let t=new URLSearchParams(n),r={owner:Ri(t,"owner"),repository:Ri(t,"repository"),category:Ri(t,"category")};return ap(e,r)?r:null}function lp(e){return e===null?"":`?${new URLSearchParams({owner:e.owner,repository:e.repository,category:e.category}).toString()}`}function Oi(e,n){if(typeof e!="string")return{tab:"browse",item:null,canonical:!1};let t="browse",r=!1;if(e!==""&&e!=="/"){let s=Jy.exec(e),a=s===null?void 0:Qy.get(s[1]);if(s===null||a===void 0)return{tab:"browse",item:null,canonical:!1};t=a,r=e===`/${s[1]}`}let o=typeof n=="string"?rv(t,n):null,i=r&&typeof n=="string"&&n===lp(o);return{tab:t,item:o,canonical:i}}function Li(e){return typeof e=="string"&&Zy.test(e)}function mr(e,n,t){if(!Li(e))throw new Error("Invalid route prefix");if(!tv(n))throw new Error("Invalid route tab");let r=ap(n,t)?lp(t):"";return`${e}/${ev(n)}${r}`}function Ke(e,n){if(typeof e!="string"||!sp(n))return null;let t=e.split("/");if(t.length!==2)return null;let[r,o]=t;return!hr(r)||!hr(o)?null:{owner:r,repository:o,category:n}}function dp(e){return`${e.owner}/${e.repository}`}function fr(e,n){return e===null||n===null?e===n:e.category===n.category&&e.owner.toLowerCase()===n.owner.toLowerCase()&&e.repository.toLowerCase()===n.repository.toLowerCase()}var ov=[["all",w.filterAll],["installed",w.filterInstalled]],Ii=class extends A{constructor(){super(...arguments);this.active=!0;this.mods=[];this.truncated=!1;this.status="idle";this.failure="";this.query="";this.filter="all";this.kind="all";this.selected="";this.deepLink=null;this.closeDialog=()=>{let t=this.selected;this.selected="",this.updateComplete.then(()=>{Array.from(this.renderRoot.querySelectorAll("[data-name]")).find(o=>o.dataset.name===t)?.querySelector(".pick")?.focus()}),this.dispatchEvent(new CustomEvent("hats-lite-mod-closed",{bubbles:!0,composed:!0}))}}static{this.properties={hass:{attribute:!1},active:{type:Boolean},mods:{state:!0},truncated:{state:!0},status:{state:!0},failure:{state:!0},query:{state:!0},filter:{state:!0},kind:{state:!0},selected:{state:!0},deepLink:{attribute:!1}}}static{this.styles=bt}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load(),(t.has("deepLink")||t.has("status"))&&this.status==="ready"&&this.syncDeepLink()}syncDeepLink(){let t=this.deepLink;if(t===null){this.selected="";return}let r=dp(t).toLowerCase(),o=this.mods.find(i=>i.full_name.toLowerCase()===r&&i.category===t.category);o&&(this.selected=o.full_name)}openMod(t){this.selected=t.full_name,this.dispatchEvent(new CustomEvent("hats-lite-mod-opened",{bubbles:!0,composed:!0,detail:{fullName:t.full_name,category:t.category}}))}async load(){let t=this.hass;if(t){this.status="loading";try{let r=await Su(t);this.mods=r.mods,this.truncated=r.truncated,this.status="ready"}catch(r){this.failure=ur(G(r)),this.status="error"}}}renderItem(t){return l`
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
          ${t.category==="integration"?l`<span class="chip">${w.integrationChip}</span>`:c}
          ${t.installed?l`<span class="chip ok">${w.installedChip}</span>`:c}
          ${t.pinned?l`<span class="chip">${w.pinnedChip}</span>`:c}
          ${t.stars>0?l`<span class="chip">${w.stars(t.stars)}</span>`:c}
        </div>
        ${t.description?l`<p class="desc">${t.description}</p>`:c}
        <p class="links">${Ci(t,null)}</p>
      </li>
    `}renderList(){let t=Du(this.mods,this.query,this.filter,this.kind),r=bi.filter(i=>this.mods.some(s=>s.kind===i)),o=[["all",w.kindAll],...r.map(i=>[i,w.kindLabels[i]])];return l`
      <div class="toolbar">
        <label class="field">
          <span>${w.search}</span>
          <input
            type="search"
            id="search"
            placeholder=${w.searchPlaceholder}
            .value=${this.query}
            @input=${i=>{this.query=i.target.value}}
          />
        </label>
        <div class="seg" role="group" aria-label=${w.filters}>
          ${ov.map(([i,s])=>l`<button
              type="button"
              data-filter=${i}
              aria-pressed=${this.filter===i?"true":"false"}
              @click=${()=>{this.filter=i}}
            >
              ${s}
            </button>`)}
        </div>
      </div>
      <div class="seg kinds" role="group" aria-label=${w.kinds} data-group="kind">
        ${o.map(([i,s])=>l`<button
            type="button"
            data-kind=${i}
            aria-pressed=${this.kind===i?"true":"false"}
            @click=${()=>{this.kind=i}}
          >
            ${s}
          </button>`)}
      </div>
      ${this.truncated?l`<p class="notice" id="truncated" role="status">${w.truncated}</p>`:c}
      ${t.length===0?l`<p class="muted" id="empty">${w.empty}</p>`:l`<ul class="mods">${t.map(i=>this.renderItem(i))}</ul>`}
    `}render(){if(this.status==="idle"||this.status==="loading")return l`<p class="muted" role="status">${w.loading}</p>`;if(this.status==="error")return l`<p class="notice error" role="alert">${this.failure||w.loadFailed}</p>
        <button class="btn" type="button" id="retry" @click=${()=>{this.load()}}>${w.retry}</button>`;let t=this.mods.find(r=>r.full_name===this.selected)??null;return l`
      <p class="muted">${w.intro}</p>
      <section class="card" aria-labelledby="mods-h">
        <h2 id="mods-h">${w.title}</h2>
        ${this.renderList()}
      </section>
      ${this.active&&t?l`<hats-lite-mods-dialog .hass=${this.hass} .mod=${t} @close=${this.closeDialog}></hats-lite-mods-dialog>`:c}
    `}};customElements.get("hats-lite-mods")||customElements.define("hats-lite-mods",Ii);function gr(e,n,t){let r=e?.themes?.themes;if(typeof n!="string"||!r||!Object.prototype.hasOwnProperty.call(r,n))return null;let o=r[n];if(!o||typeof o!="object")return null;let i=ie(o),a=(typeof t=="boolean"?t:e?.themes?.darkMode===!0)?"dark":"light";return{mode:a,candidate:{name:n,vars:J(i,a),entry:i,installed:!0,canApply:!0}}}function cp(e,n,t,r,o){if(!e||!Object.prototype.hasOwnProperty.call(n,t))return null;let i=ie(n[t]),s=r?.themes?.darkMode?"dark":"light",a=o.includes(t),d=r?.themes?.themes,u=d&&Object.prototype.hasOwnProperty.call(d,t)?d[t]:void 0,m=a&&!e.installed&&Cs(u,i);return{name:t,fullName:e.full_name,vars:J(i,s),entry:i,installed:a,nameCollision:m,repoUrl:Ds(e.full_name),canApply:a&&!m}}function Hi(e,n){return e.installed===n.installed&&e.nameCollision===n.nameCollision&&e.canApply===n.canApply&&JSON.stringify(e.vars)===JSON.stringify(n.vars)}function up(e,n){return!e||!n||n.installed||!e.hacs_id||Ne(e)?null:{fullName:e.full_name,hacsId:e.hacs_id}}function pp(e,n){return!e||!n||!n.installed||n.nameCollision||!e.installed||!e.hacs_id||Ne(e)?null:{fullName:e.full_name,hacsId:e.hacs_id}}function hp(e,n,t){if(n.name===et&&!n.entry)return n;let r=t==="dark"?!0:t==="light"?!1:void 0,o=gr(e,n.name,r)?.candidate??null;return o&&Hi(n,o)?n:o}var iv=150,br=class{constructor(n){this.options=n;this.list=[];this.loaded=-1;this.index=-1;this.error="";this.token=0}start(n,t){this.cancel();let r=n.findIndex(o=>o.full_name===t.full_name);this.list=r<0?[t]:[...n],this.loaded=this.index=Math.max(r,0),this.error="",this.options.onChange()}clear(){this.cancel(),this.list=[],this.loaded=this.index=-1,this.error="",this.options.onChange()}cancel(){this.token+=1,this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}model(){let n=this.list[this.index];return n?{index:this.index,total:this.list.length,name:ro(n),pending:this.index!==this.loaded,error:this.error}:null}move(n){let t=st(this.index,this.list.length,n);if(t!==null){if(this.cancel(),this.index=t,this.error="",t!==this.loaded){let r=this.token;this.timer=setTimeout(()=>{this.load(r)},iv)}this.options.onChange()}}async load(n){this.timer=void 0;let t=this.list[this.index],r=this.index;try{let o=await this.options.open(t);if(n!==this.token)return;this.loaded=r,this.options.apply(o)}catch{if(n!==this.token)return;this.index=this.loaded,this.error=f.navFailed.replace("{name}",ro(t))}this.options.onChange()}};var Ui={r:0,g:0,b:0,a:1},wr={r:255,g:255,b:255,a:1},gp=()=>({...Ui}),bp=()=>({...wr}),Ce=(e,n,t)=>Math.min(t,Math.max(n,e));function Ni(e){let n=e.trim();return n==="none"?0:n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n)}function yr(e){if(e===void 0)return 1;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?Ce(t,0,1):1}function sv(e){if(!/^[0-9a-f]+$/i.test(e)||![3,4,6,8].includes(e.length))return null;let n=e.length<=4?e.replace(/./g,r=>r+r):e,t=r=>parseInt(n.slice(r,r+2),16);return{r:t(0),g:t(2),b:t(4),a:n.length===8?t(6)/255:1}}function yp(e){return e.replace(/\s*\/\s*/g," / ").split(/[\s,]+/).filter(n=>n!=="")}function av(e){let n=yp(e),t=n.indexOf("/");return t>=0?{values:n.slice(0,t),alpha:n[t+1]}:{values:n.slice(0,3),alpha:n[3]}}function mp(e){let n=e.trim(),t=parseFloat(n);return n.endsWith("turn")?t*360:n.endsWith("rad")?t*180/Math.PI:n.endsWith("grad")?t*.9:t}function lv(e,n,t){let r=(e%360+360)%360,o=a=>(a+r/30)%12,i=n*Math.min(t,1-t),s=a=>t-i*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[s(0)*255,s(8)*255,s(4)*255]}function Fi(e){let n=Ce(e,0,1);return n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055}function dv(e,n,t){let r=e+.3963377774*n+.2158037573*t,o=e-.1055613458*n-.0638541728*t,i=e-.0894841775*n-1.291485548*t,[s,a,d]=[r**3,o**3,i**3],u=[4.0767416621*s-3.3077115913*a+.2309699292*d,-1.2684380046*s+2.6097574011*a-.3413193965*d,-.0041960863*s-.7034186147*a+1.707614701*d];return[Fi(u[0])*255,Fi(u[1])*255,Fi(u[2])*255]}function cv(e){let n=e.trim();return n.endsWith("%")?parseFloat(n)/100:parseFloat(n)}function uv(e,n){if(e==="color"){let[o,...i]=yp(n.replace(/\/.*$/,""));if(o!=="srgb"||i.length!==3)return null;let[s,a,d]=i.map(u=>(u.endsWith("%")?parseFloat(u)/100:parseFloat(u))*255);return{r:s,g:a,b:d,a:yr(n.split("/")[1])}}let{values:t,alpha:r}=av(n);if(t.length<3)return null;if(e==="rgb"||e==="rgba")return{r:Ni(t[0]),g:Ni(t[1]),b:Ni(t[2]),a:yr(r)};if(e==="hsl"||e==="hsla"){let[o,i,s]=lv(mp(t[0]),Ce(parseFloat(t[1])/100,0,1),Ce(parseFloat(t[2])/100,0,1));return{r:o,g:i,b:s,a:yr(r)}}if(e==="oklab"||e==="oklch"){let o=cv(t[0]),i=parseFloat(t[1]),s=parseFloat(t[2]);if(e==="oklch"){let m=parseFloat(t[1]),p=mp(t[2])*Math.PI/180;i=m*Math.cos(p),s=m*Math.sin(p)}let[a,d,u]=dv(o,i,s);return{r:a,g:d,b:u,a:yr(r)}}return null}function Ve(e){let n=(e??"").trim().toLowerCase();if(n==="")return null;if(n==="transparent")return{r:0,g:0,b:0,a:0};if(n.startsWith("#"))return sv(n.slice(1));let t=/^([a-z]+)\(([^)]*)\)$/.exec(n);if(!t)return null;let r=uv(t[1],t[2]);return!r||![r.r,r.g,r.b,r.a].every(Number.isFinite)?null:{r:Ce(r.r,0,255),g:Ce(r.g,0,255),b:Ce(r.b,0,255),a:r.a}}function ge(e,n){if(e.a>=1)return e;let t=e.a;return{r:e.r*t+n.r*(1-t),g:e.g*t+n.g*(1-t),b:e.b*t+n.b*(1-t),a:1}}function ji(e,n,t){return{r:e.r+(n.r-e.r)*t,g:e.g+(n.g-e.g)*t,b:e.b+(n.b-e.b)*t,a:1}}function Bi(e){let n=e/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function vt(e){return .2126*Bi(e.r)+.7152*Bi(e.g)+.0722*Bi(e.b)}function vp(e,n){let t=vt(e),r=vt(n);return(Math.max(t,r)+.05)/(Math.min(t,r)+.05)}function Gt(e,n){return n.length===0?1/0:Math.min(...n.map(t=>vp(ge(e,t),t)))}function vr(e){let n=t=>Math.round(Ce(t,0,255)).toString(16).padStart(2,"0");return`#${n(e.r)}${n(e.g)}${n(e.b)}`}function zi(e){return Gt(Ui,e)>=Gt(wr,e)?"#000000":"#ffffff"}function wp(e,n,t=4.5){if(n&&e.length>0){let r=ge(n,e[0]);if(e.every(o=>vp(r,o)>=t))return vr(r)}return zi(e)}function fp(e,n,t,r){let o=e,i=Gt(e,t);for(let s=1;s<=50;s+=1){let a=ji(e,n,s/50),d=Gt(a,t);if(d>=r)return{found:a,best:a,bestRatio:d};d>i&&(o=a,i=d)}return{found:null,best:o,bestRatio:i}}function xp(e,n,t){if(Gt(e,n)>=t)return null;let r=ge(e,n[0]??wr),o=fp(r,Ui,n,t),i=fp(r,wr,n,t);if(o.found&&i.found){let s=Math.abs(vt(o.found)-vt(r)),a=Math.abs(vt(i.found)-vt(r));return vr(s<=a?o.found:i.found)}return o.found||i.found?vr(o.found??i.found):vr(o.bestRatio>=i.bestRatio?o.best:i.best)}var Ki={bg:"var(--hl-src-bg)",surface:"var(--hl-src-surface)",raised:"var(--hl-src-raised)",text:"var(--hl-src-text)",muted:"var(--hl-src-muted)",line:"var(--hl-src-line)",accent:"var(--hl-src-accent)",accentInk:"var(--hl-src-accent-ink)",ok:"var(--hl-src-ok)",warn:"var(--hl-src-warn)"},Vi=["--hl-on-accent","--hl-text-ink","--hl-muted-ink","--hl-bg-text-ink","--hl-bg-muted-ink","--hl-ok-ink","--hl-warn-ink","--hl-accent-text-ink","--hl-edge-ink","--hl-focus-ink"],Pe=4.5,kp=3;function $p(){return Object.fromEntries(Vi.map(e=>[e,null]))}function xr(e){let n=Ve(e);return n&&n.a>0?n:null}function Ep(e){let n=e.dark?gp():bp(),t=xr(e.accent),r=!t&&e.accent!==""&&Ve(e.accent)===null;if(!t&&!r)return $p();let o=xr(e.bg),i=o?ge(o,n):null,s=i??n,a=xr(e.surface),d=xr(e.raised),u=a?ge(a,s):s,m=d?ge(d,u):u,p=[u,m],g=[i??u],v=[...p,...i?[i]:[]],E=t?ji(u,ge(t,u),.22):u,M=$p();if(t){let U=v.map(I=>ge(t,I));M["--hl-on-accent"]=wp(U,Ve(e.accentInk),Pe)}let S=(U,I,X,j)=>{let Re=Ve(I);Re?M[U]=xp(Re,X,j):M[U]=I===""?null:zi(X)};return S("--hl-text-ink",e.text,[...v,E],Pe),S("--hl-muted-ink",e.muted,v,Pe),S("--hl-bg-text-ink",e.text,g,Pe),S("--hl-bg-muted-ink",e.muted,g,Pe),S("--hl-ok-ink",e.ok,p,Pe),S("--hl-warn-ink",e.warn,p,Pe),S("--hl-accent-text-ink",e.accent,v,Pe),S("--hl-edge-ink",e.line,v,kp),S("--hl-focus-ink",e.accent,v,kp),M}function pv(e){let n=e?.themes;return`${e?.selectedTheme?.theme??n?.theme??""}|${n?.darkMode===!1?"light":"dark"}`}var hv=/^(rgba?\(|color\(\s*srgb[\s)])/i,Yt;function mv(){if(Yt!==void 0)return Yt;try{Yt=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})}catch{Yt=null}return Yt}var fv="unparseable";function Tp(e,n,t){return e.clearRect(0,0,1,1),e.fillStyle=n,e.fillStyle=t,e.fillRect(0,0,1,1),Array.from(e.getImageData(0,0,1,1).data)}function gv(e){if(e==="transparent")return"";if(e===""||hv.test(e))return e;let n=mv();if(!n)return e;try{let[t,r,o,i]=Tp(n,"#000000",e);return Tp(n,"#ffffff",e).some((a,d)=>a!==[t,r,o,i][d])?fv:i===0?"":`rgba(${t}, ${r}, ${o}, ${Math.round(i/255*1e3)/1e3})`}catch{return e}}var kr=class{constructor(n){this.host=n;this.probe=null;this.observer=null;this.media=null;this.frame=0;this.signature="";this.applied="";this.onScheme=()=>this.schedule();n.addController(this)}hostConnected(){this.observer=new MutationObserver(()=>this.schedule()),this.observer.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),this.media=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):null,this.media?.addEventListener("change",this.onScheme),this.schedule()}hostDisconnected(){this.observer?.disconnect(),this.observer=null,this.media?.removeEventListener("change",this.onScheme),this.media=null,this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.probe?.remove(),this.probe=null,this.applied=""}hostUpdated(){let n=pv(this.host.hass);n!==this.signature&&(this.signature=n,this.schedule())}refresh(){this.schedule()}schedule(){this.frame||!this.host.isConnected||(this.frame=requestAnimationFrame(()=>{this.frame=0,this.run()}))}ensureProbe(){if(this.probe?.isConnected)return this.probe;let n=document.createElement("span");n.setAttribute("aria-hidden","true"),n.style.display="none";for(let t=0;t<Object.keys(Ki).length;t+=1)n.appendChild(document.createElement("i"));return this.host.renderRoot.appendChild(n),this.probe=n,n}readAll(n){let t=Object.entries(Ki),r=Array.from(n.children);return t.forEach(([,o],i)=>{r[i].style.backgroundColor="",r[i].style.backgroundColor=o}),Object.fromEntries(t.map(([o],i)=>{let s=gv(getComputedStyle(r[i]).backgroundColor.trim()),a=Ve(s);return[o,a&&a.a===0?"":s]}))}run(){if(!this.host.isConnected)return;let n=this.ensureProbe(),t={dark:this.host.hass?.themes?.darkMode!==!1,...this.readAll(n)},r=JSON.stringify(t);if(r===this.applied)return;this.applied=r;let o=Ep(t);for(let i of Vi){let s=o[i];s?this.host.style.setProperty(i,s):this.host.style.removeProperty(i)}}};var _p=[V,W,T`
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
`,Qd];function $r(e,n){if(!e||typeof e!="object")return"";let t=e[n];return typeof t=="string"?t:""}function Sp(e,n,t){if(!e||typeof e!="object")return"";let r=e,o=r.modes,i=t?["dark","light"]:["light","dark"];return $r(o?.[i[0]],n)||$r(r,n)||$r(r.vars,n)||$r(o?.[i[1]],n)}function Ap(e){let n=e?.selectedTheme?.theme??e?.themes?.theme??"default",t=e?.themes?.themes,o=t&&Object.prototype.hasOwnProperty.call(t,n)?t[n]:void 0,i=e?.themes?.darkMode!==!1;return{name:n,primary:Sp(o,"primary-color",i),accent:Sp(o,"accent-color",i)}}var Q={shell:{title:"Themes",tabs:{browse:"Gallery",preview:"Preview",designer:"Designer",people:"People",mods:"Mods"},tabList:"HATS Lite sections",inUse:"In use",menu:"Open navigation menu",fileTheme:"Theme in file",fileLoading:"Loading theme...",fileError:"Could not load this theme.",resetApplied:"The removed theme was in use, so the Home Assistant theme is applied now"},browse:b,preview:f,designer:y};var be=e=>`tab-${e}`,We=e=>`panel-${e}`;function Mp(e,n,t,r){return l`
    <nav class="tabs seg" role="tablist" aria-label=${Q.shell.tabList} @keydown=${r}>
      ${e.map(o=>{let i=n===o;return l`
          <button
            type="button"
            role="tab"
            id=${be(o)}
            aria-controls=${We(o)}
            aria-selected=${i?"true":"false"}
            tabindex=${i?"0":"-1"}
            @click=${()=>t(o)}
          >
            ${Q.shell.tabs[o]}
          </button>
        `})}
    </nav>
  `}function Cp(e){let n=Ap(e),t=r=>r?l`<i style=${se({background:r})}></i>`:l`<i class="neutral"></i>`;return l`
    <span class="chip in-use">
      <span class="label">${Q.shell.inUse}</span>
      <span class="name">${n.name}</span>
      <span class="swatches" aria-hidden="true">${t(n.primary)}${t(n.accent)}</span>
    </span>
  `}var Pp=l`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;function Rp(e,n,t){switch(e){case"ArrowRight":return(n+1)%t;case"ArrowLeft":return(n-1+t)%t;case"Home":return 0;case"End":return t-1;default:return null}}function bv(e){return e==="loading"?l`<span class="file-status" role="status">${Q.shell.fileLoading}</span>`:e==="error"?l`<span class="file-status error" role="alert">${Q.shell.fileError}</span>`:c}function Dp(e,n,t,r){return e.length<2?c:l`
    <label class="file-theme">
      ${Q.shell.fileTheme}
      <select @change=${r}>
        ${e.map(o=>l`<option value=${o} ?selected=${o===n}>${o}</option>`)}
      </select>
      ${bv(t)}
    </label>
  `}function Op(e){return l`<p class="notice" role="status">${e}</p>`}function Lp(e){return l`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${e.narrow?l`<button class="menu" type="button" aria-label=${Q.shell.menu} @click=${e.onMenu}>${Pp}</button>`:c}
          <h1 class="title">${Q.shell.title}</h1>
        </div>
        ${Cp(e.hass)}
      </header>
      ${Mp(e.tabs,e.tab,n=>e.select(n,!0),e.onTabKey)}
      ${e.resetNotice?Op(e.resetNotice):c}
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
          id=${We("browse")}
          role="tabpanel"
          aria-labelledby=${be("browse")}
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
          id=${We("preview")}
          role="tabpanel"
          aria-labelledby=${be("preview")}
          tabindex="-1"
          ?hidden=${e.tab!=="preview"}
        >
          ${e.rendered.has("preview")?l`${Dp(ne(e.fileNames,e.chosenName),e.chosenName,e.fileStatus,e.onFileThemeChange)}
              <hats-lite-preview
                .hass=${e.hass}
                .candidate=${e.candidate}
                .mode=${e.previewMode}
                .nav=${e.navigator.model()}
                .install=${up(e.entry,e.candidate)}
                .uninstall=${pp(e.entry,e.candidate)}
                @hats-lite-mode-change=${e.onPreviewMode}
                @hats-lite-preview-nav=${e.onNav}
                @hats-lite-theme-installed=${e.onInstalled}
              ></hats-lite-preview>`:c}
        </section>
        <section
          class="panel"
          id=${We("designer")}
          role="tabpanel"
          aria-labelledby=${be("designer")}
          tabindex="-1"
          ?hidden=${e.tab!=="designer"}
        >
          ${e.rendered.has("designer")?l`<hats-lite-designer .hass=${e.hass}></hats-lite-designer>`:c}
        </section>
        <section class="panel" id=${We("people")} role="tabpanel" aria-labelledby=${be("people")} tabindex="-1" ?hidden=${e.tab!=="people"}>
          ${e.rendered.has("people")&&e.peopleOk?l`<hats-lite-people .hass=${e.hass}></hats-lite-people>`:c}
        </section>
        <section class="panel" id=${We("mods")} role="tabpanel" aria-labelledby=${be("mods")} tabindex="-1" ?hidden=${e.tab!=="mods"}>
          ${e.rendered.has("mods")&&e.modsOk?l`<hats-lite-mods .hass=${e.hass} .active=${e.tab==="mods"} .deepLink=${e.modsLink}></hats-lite-mods>`:c}
        </section>
      </main>
      </div>
    `}function Ip(e,n,t){return e!==void 0?e:n!==void 0&&t.includes(n)}var Hp="/themes",yv="/hats-lite",vv=/^(\/[a-z]*\/?)?$/,wv=["owner","repository","category"],xv="hats-lite-panel",Er=class{constructor(n){this.host=n;this.prefix=null;this.applying=!1;this.pending=null}read(n){if(this.pending=null,typeof n!="object"||n===null)return;let{prefix:t,path:r}=n;if(Li(t)){if(t===yv){if(this.host.hass()===void 0){this.pending=n;return}if(this.hasOurThemesPanel()){this.redirectLegacy(r);return}}this.prefix=t,this.settle(Oi(r,window.location.search))}}retry(){let n=this.pending;n!==null&&this.read(n)}go(n,t=null,r=!1){if(this.applying||this.prefix===null)return;let o=mr(this.prefix,n,t);o!==window.location.pathname+window.location.search&&this.write(o,r)}settle(n){let t=this.apply(n);this.go(t.tab,t.item,!0)}apply(n){this.applying=!0;try{return this.host.apply(n)??n}finally{this.applying=!1}}hasOurThemesPanel(){let n=this.host.hass()?.panels;return typeof n!="object"||n===null||!Object.prototype.hasOwnProperty.call(n,"themes")?!1:n.themes?.config?._panel_custom?.name===xv}redirectLegacy(n){let t=window.location.search,r=new URLSearchParams(t),o=typeof n=="string"&&vv.test(n)?Oi(n,t):null,i=o!==null&&o.item===null&&wv.some(a=>r.has(a)),s=o===null||i?mr(Hp,"browse"):mr(Hp,o.tab,o.item);this.write(s,!0)}write(n,t){t?window.history.replaceState(null,"",n):window.history.pushState(null,"",n),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:t}}))}};var kv=100,$v=50;function Ev(e){return new Promise(n=>setTimeout(n,e))}async function Np(e,n){for(let t=0;t<$v;t+=1){if(!n())return null;let r=e();if(r&&(await r.updateComplete,r.loaded))return r;await Ev(kv)}return null}function Tv(e,n){return e.find(t=>fr(Ke(t.full_name,"theme"),n))??null}async function Fp(e,n,t){try{let r=await e.openEntry(n);return t()?Object.keys(r?.themes??{}).length>0?{status:"opened",detail:r}:{status:"missing"}:{status:"stale"}}catch{return t()?{status:"missing"}:{status:"stale"}}}async function Bp(e,n,t){let r=await Np(t,n);if(!n())return{status:"stale"};let o=r?Tv(r.entries,e):null;return!r||!o?{status:"missing"}:Fp(r,o,n)}async function Up(e,n){let t=await Np(n,e);if(!e())return{status:"stale"};let r=t?.visibleEntries()[0];return!t||!r?{status:"missing"}:Fp(t,r,e)}var jp=4,_v={tab:"browse",item:null,canonical:!0},Tr=class{constructor(n){this.host=n;this.probes={people:!1,mods:!1};this.waiting=null;this.linkToken=0;this.liveDeep=null;this.linkRun=Promise.resolve();this.running=0;this.visited=!1;this.retries=0;this.gone=!1;this.timer=null;this.router=new Er({apply:t=>this.apply(t),hass:()=>n.hass()})}read(n){this.router.read(n)}hassChanged(){this.router.retry(),this.settle()}attach(){this.gone=!1}dispose(){this.gone=!0,this.cancel(),this.timer!==null&&clearTimeout(this.timer),this.timer=null}settle(){if(this.gone)return;if(this.host.tab()!=="preview"){this.visited=!1,this.retries=0;return}if(this.visited||this.running>0||this.retries>=jp||this.host.previewing())return;this.host.gallery()?.loaded&&this.openFirst()}later(){this.timer!==null||this.retries>=jp||(this.timer=setTimeout(()=>{this.timer=null,this.visited=!1,this.settle()},1500))}go(n,t=null,r=!1){this.cancel(),this.router.go(n,t,r)}choose(n,t,r){let o=this.host.tab()!==n;o&&(this.visited=!1,this.retries=0),this.host.show(n),this.go(n,t),r&&o&&n==="preview"&&this.openFirst()}probed(n,t){this.probes[n]=!0;let r=this.waiting;r?.tab===n?(this.waiting=null,this.host.tabs().includes(n)?this.showRoute(r):this.fallback()):!t&&this.host.tab()===n&&this.fallback()}cancel(){this.linkToken+=1,this.waiting=null}apply(n){return(n.tab!=="preview"||n.item!==null)&&(this.linkToken+=1),this.waiting=null,this.probing(n.tab)?(this.waiting=n,this.host.show("browse"),this.host.setModsLink(null),n):this.host.tabs().includes(n.tab)?(this.showRoute(n),n):(this.host.show("browse"),this.host.setModsLink(null),_v)}showRoute(n){let t=this.host.tab()!==n.tab;t&&(this.visited=!1,this.retries=0),this.host.show(n.tab),this.host.setModsLink(n.tab==="mods"?n.item:null),n.tab==="preview"&&(n.item!==null?(!this.host.previewing()||!fr(n.item,this.host.previewed()))&&this.startLink(n.item):t&&!this.host.previewing()&&this.openFirst())}probing(n){return(n==="people"||n==="mods")&&!this.probes[n]}fallback(){this.host.show("browse"),this.router.go("browse",null,!0)}openFirst(){this.host.previewing()||this.liveDeep!==null&&this.liveDeep===this.linkToken||this.startLink(null)}startLink(n){let t=++this.linkToken;this.visited=!0,this.running+=1,n===null&&(this.retries+=1),n!==null&&(this.liveDeep=t),this.linkRun=this.linkRun.then(()=>this.runLink(n,t)).catch(()=>{})}async runLink(n,t){let r=()=>t===this.linkToken,o=()=>this.host.gallery();try{let i=n===null?await Up(r,o):await Bp(n,r,o);if(i.status==="opened"){let s=Ke(i.detail.entry.full_name,"theme");this.host.openLinked(i.detail,s),this.router.go("preview",s,!0)}else i.status==="missing"&&n!==null?this.fallback():n===null&&(this.visited=!1,this.later())}catch{n!==null?r()&&this.fallback():(this.visited=!1,this.later())}finally{this.running-=1,this.liveDeep===t&&(this.liveDeep=null)}}};var Wi=class extends A{constructor(){super(...arguments);this.narrow=!1;this.tab="browse";this.entry=null;this.fileThemes={};this.fileNames=[];this.fileStatus="";this.chosenName="";this.candidate=null;this.peopleOk=!0;this.modsOk=!1;this.modsLink=null;this.resetNotice="";this.ink=new kr(this);this.probed=!1;this.previewItem=null;this.installedNames=[];this.bundles=new tt;this.known=new Xe;this.pickToken=0;this.routes=new Tr({tabs:()=>this.tabs,tab:()=>this.tab,hass:()=>this.hass,show:t=>this.showTab(t),setModsLink:t=>{this.modsLink=t},previewing:()=>this.candidate!==null,previewed:()=>this.previewItem,gallery:()=>this.gallery(),openLinked:(t,r)=>{this.openDetail(t),this.previewItem=r}});this.rendered=new Set(["browse"]);this.onTabKey=t=>{let r=this.tabs,o=Rp(t.key,r.indexOf(this.tab),r.length);if(o===null)return;t.preventDefault();let i=r[o];this.select(i,!0),this.focusTab(i)};this.onMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};this.navigator=new br({open:t=>{let r=this.gallery();return r?r.openEntry(r.entries.find(o=>o.full_name===t.full_name)??t):Promise.reject(new Error("gallery missing"))},apply:t=>this.showBundle(t),onChange:()=>this.requestUpdate()});this.onThemeSelected=t=>{let r=t.detail;Object.keys(r?.themes??{}).length!==0&&(this.openDetail(r),this.previewItem=Ke(r.entry.full_name,"theme"),this.select("preview"),this.focusTab("preview"))};this.onPreviewTheme=t=>{let r=t.detail,o=gr(this.hass,r?.theme,r?.dark);o&&(this.navigator.clear(),this.showUnlisted(o.candidate,o.mode),this.select("preview"),this.focusTab("preview"))};this.onModOpened=t=>{let r=t.detail;this.routes.go("mods",Ke(r?.fullName,r?.category))};this.onModClosed=()=>{this.routes.go("mods",null)};this.onNav=t=>{let r=t.detail?.direction;(r===1||r===-1)&&this.navigator.move(r)};this.onInstalled=async t=>{let r=t.detail,o=r?.fullName,i=this.entry?.full_name===o?this.fileNames:[];r?.removed&&Ip(r.resetSelected,this.hass?.themes?.theme,i)&&(this.setTheme(et),this.resetNotice=Q.shell.resetApplied);let a=(await this.gallery()?.refreshCatalog())?.find(d=>d.full_name===o);a&&this.entry?.full_name===o&&(this.entry=a,this.refreshCandidate())};this.onPreviewMode=t=>{let r=t.detail?.mode;r&&(this.previewMode=r)};this.onFileThemeChange=t=>{let r=t.target.value;if(Object.prototype.hasOwnProperty.call(this.fileThemes,r)){this.pickToken+=1,this.fileStatus="",this.setCandidate(r);return}this.fetchFileTheme(r)};this.onThemeSaved=t=>{let r=t.detail;typeof r?.name=="string"&&(this.setTheme(r.name),this.select("preview"))}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0},entry:{state:!0},fileThemes:{state:!0},fileNames:{state:!0},fileStatus:{state:!0},chosenName:{state:!0},candidate:{state:!0},previewMode:{state:!0},peopleOk:{state:!0},modsOk:{state:!0},modsLink:{state:!0},resetNotice:{state:!0}}}static{this.styles=_p}get tabs(){return Di.filter(t=>t==="people"?this.peopleOk:t==="mods"?this.modsOk:!0)}showTab(t){this.rendered.add(t),this.resetNotice="",this.tab=t}select(t,r=!1){this.routes.choose(t,t==="preview"?this.previewItem:null,r)}onProbe(t,r){t==="people"?this.peopleOk=r:this.modsOk=r,this.routes.probed(t,r)}async focusTab(t){await this.updateComplete,this.renderRoot.querySelector(`#${be(t)}`)?.focus()}connectedCallback(){super.connectedCallback(),this.routes.attach()}disconnectedCallback(){super.disconnectedCallback(),this.routes.dispose(),this.navigator.clear()}willUpdate(t){if(t.has("route")&&this.routes.read(this.route),!t.has("hass"))return;this.routes.hassChanged(),this.hass&&!this.probed&&(this.probed=!0,wi(this.hass).then(o=>this.onProbe("mods",o)),nu(this.hass).then(o=>this.onProbe("people",o)));let r=Object.keys(this.hass?.themes?.themes??{});pn(r,this.installedNames)||(this.installedNames=r),this.candidate&&this.refreshCandidate()}build(t){return cp(this.entry,this.fileThemes,t,this.hass,this.installedNames)}refreshCandidate(){let t=this.candidate;if(t&&!this.entry){this.candidate=hp(this.hass,t,this.previewMode),this.chosenName=this.candidate?this.chosenName:"";return}let r=this.build(this.chosenName);t&&r&&!Hi(t,r)&&(this.candidate=r)}setCandidate(t){let r=this.build(t);r&&([this.chosenName,this.candidate]=[t,r])}gallery(){return this.renderRoot.querySelector("hats-lite-browse")}showUnlisted(t,r){this.pickToken+=1,this.fileStatus="",this.entry=null,this.fileThemes={},this.fileNames=[],this.chosenName=t.name,this.candidate=t,this.previewMode=r,this.previewItem=null}setTheme(t){let r=this.hass?.themes?.darkMode;this.dispatchEvent(new CustomEvent("settheme",{bubbles:!0,composed:!0,detail:tr(r===void 0?{theme:t}:{theme:t,dark:r})}))}showBundle(t){if(At(t?.entry))return this.showUnlisted(ya(),this.previewMode);let r=Object.keys(t?.themes??{});if(r.length===0)return;let o=t.theme&&r.includes(t.theme)?t.theme:ne(r)[0]??r[0];this.pickToken+=1,this.fileStatus="",this.entry=t.entry,this.fileThemes=t.themes,this.fileNames=[...new Set([...t.names??[],...r])],this.bundles.set(t.entry,o,{themes:t.themes,names:this.fileNames,theme:o}),this.setCandidate(o)}openDetail(t){let r=this.gallery();this.previewMode=t.mode??r?.mode,this.navigator.start(r?.visibleEntries()??[],t.entry),this.showBundle(t)}async fetchFileTheme(t){let r=this.entry;if(!r)return;let o=++this.pickToken;this.fileStatus="loading";try{let i=await oo(this.hass,this.known,this.bundles,r,t);if(o!==this.pickToken||r!==this.entry)return;this.fileStatus="",this.fileThemes=i.themes,this.setCandidate(t)}catch{o===this.pickToken&&(this.fileStatus="error")}}render(){return Lp(this)}};customElements.get("hats-lite-panel")||customElements.define("hats-lite-panel",Wi);export{Wi as HatsLitePanel};

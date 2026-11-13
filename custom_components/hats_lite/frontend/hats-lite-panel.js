var on=globalThis,sn=on.ShadowRoot&&(on.ShadyCSS===void 0||on.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Rr=Symbol(),si=new WeakMap,Tt=class{constructor(n,t,r){if(this._$cssResult$=!0,r!==Rr)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=n,this.t=t}get styleSheet(){let n=this.o,t=this.t;if(sn&&n===void 0){let r=t!==void 0&&t.length===1;r&&(n=si.get(t)),n===void 0&&((this.o=n=new CSSStyleSheet).replaceSync(this.cssText),r&&si.set(t,n))}return n}toString(){return this.cssText}},an=e=>new Tt(typeof e=="string"?e:e+"",void 0,Rr),T=(e,...n)=>{let t=e.length===1?e[0]:n.reduce((r,o,s)=>r+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[s+1],e[0]);return new Tt(t,e,Rr)},ii=(e,n)=>{if(sn)e.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of n){let r=document.createElement("style"),o=on.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=t.cssText,e.appendChild(r)}},Lr=sn?e=>e:e=>e instanceof CSSStyleSheet?(n=>{let t="";for(let r of n.cssRules)t+=r.cssText;return an(t)})(e):e;var{is:ah,defineProperty:lh,getOwnPropertyDescriptor:dh,getOwnPropertyNames:ch,getOwnPropertySymbols:uh,getPrototypeOf:ph}=Object,ln=globalThis,ai=ln.trustedTypes,hh=ai?ai.emptyScript:"",mh=ln.reactiveElementPolyfillSupport,_t=(e,n)=>e,Or={toAttribute(e,n){switch(n){case Boolean:e=e?hh:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,n){let t=e;switch(n){case Boolean:t=e!==null;break;case Number:t=e===null?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch{t=null}}return t}},di=(e,n)=>!ah(e,n),li={attribute:!0,type:String,converter:Or,reflect:!1,useDefault:!1,hasChanged:di};Symbol.metadata??=Symbol("metadata"),ln.litPropertyMetadata??=new WeakMap;var ue=class extends HTMLElement{static addInitializer(n){this._$Ei(),(this.l??=[]).push(n)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(n,t=li){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(n)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(n,t),!t.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(n,r,t);o!==void 0&&lh(this.prototype,n,o)}}static getPropertyDescriptor(n,t,r){let{get:o,set:s}=dh(this.prototype,n)??{get(){return this[t]},set(i){this[t]=i}};return{get:o,set(i){let a=o?.call(this);s?.call(this,i),this.requestUpdate(n,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(n){return this.elementProperties.get(n)??li}static _$Ei(){if(this.hasOwnProperty(_t("elementProperties")))return;let n=ph(this);n.finalize(),n.l!==void 0&&(this.l=[...n.l]),this.elementProperties=new Map(n.elementProperties)}static finalize(){if(this.hasOwnProperty(_t("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_t("properties"))){let t=this.properties,r=[...ch(t),...uh(t)];for(let o of r)this.createProperty(o,t[o])}let n=this[Symbol.metadata];if(n!==null){let t=litPropertyMetadata.get(n);if(t!==void 0)for(let[r,o]of t)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let o=this._$Eu(t,r);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(n){let t=[];if(Array.isArray(n)){let r=new Set(n.flat(1/0).reverse());for(let o of r)t.unshift(Lr(o))}else n!==void 0&&t.push(Lr(n));return t}static _$Eu(n,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof n=="string"?n.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(n=>n(this))}addController(n){(this._$EO??=new Set).add(n),this.renderRoot!==void 0&&this.isConnected&&n.hostConnected?.()}removeController(n){this._$EO?.delete(n)}_$E_(){let n=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(n.set(r,this[r]),delete this[r]);n.size>0&&(this._$Ep=n)}createRenderRoot(){let n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ii(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(n=>n.hostConnected?.())}enableUpdating(n){}disconnectedCallback(){this._$EO?.forEach(n=>n.hostDisconnected?.())}attributeChangedCallback(n,t,r){this._$AK(n,r)}_$ET(n,t){let r=this.constructor.elementProperties.get(n),o=this.constructor._$Eu(n,r);if(o!==void 0&&r.reflect===!0){let s=(r.converter?.toAttribute!==void 0?r.converter:Or).toAttribute(t,r.type);this._$Em=n,s==null?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(n,t){let r=this.constructor,o=r._$Eh.get(n);if(o!==void 0&&this._$Em!==o){let s=r.getPropertyOptions(o),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Or;this._$Em=o;let a=i.fromAttribute(t,s.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(n,t,r,o=!1,s){if(n!==void 0){let i=this.constructor;if(o===!1&&(s=this[n]),r??=i.getPropertyOptions(n),!((r.hasChanged??di)(s,t)||r.useDefault&&r.reflect&&s===this._$Ej?.get(n)&&!this.hasAttribute(i._$Eu(n,r))))return;this.C(n,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(n,t,{useDefault:r,reflect:o,wrapped:s},i){r&&!(this._$Ej??=new Map).has(n)&&(this._$Ej.set(n,i??t??this[n]),s!==!0||i!==void 0)||(this._$AL.has(n)||(this.hasUpdated||r||(t=void 0),this._$AL.set(n,t)),o===!0&&this._$Em!==n&&(this._$Eq??=new Set).add(n))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let n=this.scheduleUpdate();return n!=null&&await n,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,s]of this._$Ep)this[o]=s;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,s]of r){let{wrapped:i}=s,a=this[o];i!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,s,a)}}let n=!1,t=this._$AL;try{n=this.shouldUpdate(t),n?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw n=!1,this._$EM(),r}n&&this._$AE(t)}willUpdate(n){}_$AE(n){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(n)),this.updated(n)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(n){return!0}update(n){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(n){}firstUpdated(n){}};ue.elementStyles=[],ue.shadowRootOptions={mode:"open"},ue[_t("elementProperties")]=new Map,ue[_t("finalized")]=new Map,mh?.({ReactiveElement:ue}),(ln.reactiveElementVersions??=[]).push("2.1.2");var Ur=globalThis,ci=e=>e,dn=Ur.trustedTypes,ui=dn?dn.createPolicy("lit-html",{createHTML:e=>e}):void 0,bi="$lit$",we=`lit$${Math.random().toFixed(9).slice(2)}$`,yi="?"+we,fh=`<${yi}>`,Fe=document,At=()=>Fe.createComment(""),Mt=e=>e===null||typeof e!="object"&&typeof e!="function",jr=Array.isArray,gh=e=>jr(e)||typeof e?.[Symbol.iterator]=="function",Dr=`[ 	
\f\r]`,St=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pi=/--!?>/g,hi=/>/g,He=RegExp(`>|${Dr}(?:([^\\s"'>=/]+)(${Dr}*=${Dr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),mi=/'/g,fi=/"/g,vi=/^(?:script|style|textarea|title)$/i,zr=e=>(n,...t)=>({_$litType$:e,strings:n,values:t}),l=zr(1),wi=zr(2),Jv=zr(3),pe=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),gi=new WeakMap,Ne=Fe.createTreeWalker(Fe,129);function xi(e,n){if(!jr(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ui!==void 0?ui.createHTML(n):n}var bh=(e,n)=>{let t=e.length-1,r=[],o,s=n===2?"<svg>":n===3?"<math>":"",i=St;for(let a=0;a<t;a++){let d=e[a],c,m,p=-1,g=0;for(;g<d.length&&(i.lastIndex=g,m=i.exec(d),m!==null);)g=i.lastIndex,i===St?m[1]==="!--"?i=pi:m[1]!==void 0?i=hi:m[2]!==void 0?(vi.test(m[2])&&(o=RegExp("</"+m[2],"g")),i=He):m[3]!==void 0&&(i=He):i===He?m[0]===">"?(i=o??St,p=-1):m[1]===void 0?p=-2:(p=i.lastIndex-m[2].length,c=m[1],i=m[3]===void 0?He:m[3]==='"'?fi:mi):i===fi||i===mi?i=He:i===pi||i===hi?i=St:(i=He,o=void 0);let v=i===He&&e[a+1].startsWith("/>")?" ":"";s+=i===St?d+fh:p>=0?(r.push(c),d.slice(0,p)+bi+d.slice(p)+we+v):d+we+(p===-2?a:v)}return[xi(e,s+(e[t]||"<?>")+(n===2?"</svg>":n===3?"</math>":"")),r]},Ct=class e{constructor({strings:n,_$litType$:t},r){let o;this.parts=[];let s=0,i=0,a=n.length-1,d=this.parts,[c,m]=bh(n,t);if(this.el=e.createElement(c,r),Ne.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(o=Ne.nextNode())!==null&&d.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let p of o.getAttributeNames())if(p.endsWith(bi)){let g=m[i++],v=o.getAttribute(p).split(we),E=/([.?@])?(.*)/.exec(g);d.push({type:1,index:s,name:E[2],strings:v,ctor:E[1]==="."?Hr:E[1]==="?"?Nr:E[1]==="@"?Fr:Ze}),o.removeAttribute(p)}else p.startsWith(we)&&(d.push({type:6,index:s}),o.removeAttribute(p));if(vi.test(o.tagName)){let p=o.textContent.split(we),g=p.length-1;if(g>0){o.textContent=dn?dn.emptyScript:"";for(let v=0;v<g;v++)o.append(p[v],At()),Ne.nextNode(),d.push({type:2,index:++s});o.append(p[g],At())}}}else if(o.nodeType===8)if(o.data===yi)d.push({type:2,index:s});else{let p=-1;for(;(p=o.data.indexOf(we,p+1))!==-1;)d.push({type:7,index:s}),p+=we.length-1}s++}}static createElement(n,t){let r=Fe.createElement("template");return r.innerHTML=n,r}};function Ye(e,n,t=e,r){if(n===pe)return n;let o=r!==void 0?t._$Co?.[r]:t._$Cl,s=Mt(n)?void 0:n._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),s===void 0?o=void 0:(o=new s(e),o._$AT(e,t,r)),r!==void 0?(t._$Co??=[])[r]=o:t._$Cl=o),o!==void 0&&(n=Ye(e,o._$AS(e,n.values),o,r)),n}var Ir=class{constructor(n,t){this._$AV=[],this._$AN=void 0,this._$AD=n,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(n){let{el:{content:t},parts:r}=this._$AD,o=(n?.creationScope??Fe).importNode(t,!0);Ne.currentNode=o;let s=Ne.nextNode(),i=0,a=0,d=r[0];for(;d!==void 0;){if(i===d.index){let c;d.type===2?c=new Pt(s,s.nextSibling,this,n):d.type===1?c=new d.ctor(s,d.name,d.strings,this,n):d.type===6&&(c=new Br(s,this,n)),this._$AV.push(c),d=r[++a]}i!==d?.index&&(s=Ne.nextNode(),i++)}return Ne.currentNode=Fe,o}p(n){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(n,r,t),t+=r.strings.length-2):r._$AI(n[t])),t++}},Pt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(n,t,r,o){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=n,this._$AB=t,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let n=this._$AA.parentNode,t=this._$AM;return t!==void 0&&n?.nodeType===11&&(n=t.parentNode),n}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(n,t=this){n=Ye(this,n,t),Mt(n)?n===u||n==null||n===""?(this._$AH!==u&&this._$AR(),this._$AH=u):n!==this._$AH&&n!==pe&&this._(n):n._$litType$!==void 0?this.$(n):n.nodeType!==void 0?this.T(n):gh(n)?this.k(n):this._(n)}O(n){return this._$AA.parentNode.insertBefore(n,this._$AB)}T(n){this._$AH!==n&&(this._$AR(),this._$AH=this.O(n))}_(n){this._$AH!==u&&Mt(this._$AH)?this._$AA.nextSibling.data=n:this.T(Fe.createTextNode(n)),this._$AH=n}$(n){let{values:t,_$litType$:r}=n,o=typeof r=="number"?this._$AC(n):(r.el===void 0&&(r.el=Ct.createElement(xi(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(t);else{let s=new Ir(o,this),i=s.u(this.options);s.p(t),this.T(i),this._$AH=s}}_$AC(n){let t=gi.get(n.strings);return t===void 0&&gi.set(n.strings,t=new Ct(n)),t}k(n){jr(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,o=0;for(let s of n)o===t.length?t.push(r=new e(this.O(At()),this.O(At()),this,this.options)):r=t[o],r._$AI(s),o++;o<t.length&&(this._$AR(r&&r._$AB.nextSibling,o),t.length=o)}_$AR(n=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);n!==this._$AB;){let r=ci(n).nextSibling;ci(n).remove(),n=r}}setConnected(n){this._$AM===void 0&&(this._$Cv=n,this._$AP?.(n))}},Ze=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(n,t,r,o,s){this.type=1,this._$AH=u,this._$AN=void 0,this.element=n,this.name=t,this._$AM=o,this.options=s,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=u}_$AI(n,t=this,r,o){let s=this.strings,i=!1;if(s===void 0)n=Ye(this,n,t,0),i=!Mt(n)||n!==this._$AH&&n!==pe,i&&(this._$AH=n);else{let a=n,d,c;for(n=s[0],d=0;d<s.length-1;d++)c=Ye(this,a[r+d],t,d),c===pe&&(c=this._$AH[d]),i||=!Mt(c)||c!==this._$AH[d],c===u?n=u:n!==u&&(n+=(c??"")+s[d+1]),this._$AH[d]=c}i&&!o&&this.j(n)}j(n){n===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,n??"")}},Hr=class extends Ze{constructor(){super(...arguments),this.type=3}j(n){this.element[this.name]=n===u?void 0:n}},Nr=class extends Ze{constructor(){super(...arguments),this.type=4}j(n){this.element.toggleAttribute(this.name,!!n&&n!==u)}},Fr=class extends Ze{constructor(n,t,r,o,s){super(n,t,r,o,s),this.type=5}_$AI(n,t=this){if((n=Ye(this,n,t,0)??u)===pe)return;let r=this._$AH,o=n===u&&r!==u||n.capture!==r.capture||n.once!==r.once||n.passive!==r.passive,s=n!==u&&(r===u||o);o&&this.element.removeEventListener(this.name,this,r),s&&this.element.addEventListener(this.name,this,n),this._$AH=n}handleEvent(n){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,n):this._$AH.handleEvent(n)}},Br=class{constructor(n,t,r){this.element=n,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(n){Ye(this,n)}};var yh=Ur.litHtmlPolyfillSupport;yh?.(Ct,Pt),(Ur.litHtmlVersions??=[]).push("3.3.3");var ki=(e,n,t)=>{let r=t?.renderBefore??n,o=r._$litPart$;if(o===void 0){let s=t?.renderBefore??null;r._$litPart$=o=new Pt(n.insertBefore(At(),s),s,void 0,t??{})}return o._$AI(e),o};var Kr=globalThis,A=class extends ue{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let n=super.createRenderRoot();return this.renderOptions.renderBefore??=n.firstChild,n}update(n){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(n),this._$Do=ki(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return pe}};A._$litElement$=!0,A.finalized=!0,Kr.litElementHydrateSupport?.({LitElement:A});var vh=Kr.litElementPolyfillSupport;vh?.({LitElement:A});(Kr.litElementVersions??=[]).push("4.2.2");function M(e,n){return e.connection.sendMessagePromise(n)}var $i="hats-lite-theme-selected",Ei="hats-lite-theme-saved",Ti="hats-lite-mode-change",Vr="hats_lite_catalog",Wr="/api/hats_lite/background";var _i=["image/png","image/jpeg","image/webp","image/gif"];var b={title:"Themes",searchLabel:"Search themes",searchPlaceholder:"Search themes",loading:"Loading themes...",loadError:"Could not load the theme list.",cachedNote:"Showing the saved list from your last successful load.",noThemes:"No themes available.",retry:"Try again",previewsLoading:"Loading previews",apply:"Apply",noMatches:"No themes match your search.",noFilterMatches:"No themes match this filter yet. Previews load as you scroll.",installed:"Installed",inUse:"In use",otherCopy:"Other copy installed",licenseUnknown:"License unknown to HATS Lite",licenseShort:"License unknown",licenseKnown:"License detected when the thumbnails were built",starsLabel:"Stars",starGlyph:"★",themeErrorDefault:"Could not open this theme. Try again.",preview:"Preview",defaultName:"Home Assistant",defaultDescription:"The standard Home Assistant look",openPreview:"Open preview of",filterLabel:"Filter themes",filterAll:"All",filterInstalled:"Installed",filterDark:"Dark",filterLight:"Light",filterGlass:"Glass",thumbUnavailable:"Preview not available",thumbRateLimited:"Rate limited, try again later",thumbLoading:"Loading preview",thumbRoom:"Living room thermostat",thumbTemp:"20.5 °C",thumbHeating:"Heating to 21",thumbEnergy:"Energy today",thumbGarage:"Garage door",thumbClosed:"Closed",thumbLocked:"Locked since 18:30",thumbLights:"Lights and doors",thumbLight:"Living room light",thumbDoor:"Front door",thumbPorch:"Porch timer",thumbGreeting:"Good evening",thumbSunset:"Sunset 18:42",thumbChipLight:"Light on",thumbChipFan:"Fan on",thumbChipHeat:"Heat"};function Ai(e){if(!e||typeof e!="object")return null;let n=e;return typeof n.full_name!="string"?null:{full_name:n.full_name,description:typeof n.description=="string"?n.description:"",stars:typeof n.stars=="number"?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"?n.hacs_id:null}}function qr(e){return Array.isArray(e)?e.flatMap(n=>{let t=Ai(n);return t?[t]:[]}):[]}function Mi(){try{let e=localStorage.getItem(Vr);if(e===null)return null;let n=JSON.parse(e);return!Array.isArray(n)||!n.every(t=>Ai(t)!==null)?null:qr(n)}catch{return null}}function Ci(e){try{localStorage.setItem(Vr,JSON.stringify(e))}catch{return}}function Pi(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ri(e){if(e&&typeof e=="object"&&"message"in e){let n=e.message;if(typeof n=="string"&&n)return n}return b.themeErrorDefault}function Li(e,n){return e.full_name.toLowerCase().includes(n)||e.description.toLowerCase().includes(n)}var wh=new Set(["invalid_theme","theme_too_large","not_found","invalid_request","not_in_catalog"]);function Si(e,n){if(!e||typeof e!="object"||!(n in e))return"";let t=e[n];return typeof t=="string"?t:""}function cn(e){let n=Si(e,"code");return wh.has(n)?"permanent":n==="rate_limited"||/\bstatus (403|429)\b/.test(Si(e,"message"))?"limited":"transient"}var xh=/^[A-Za-z0-9_-]+$/,kh=/[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i,$h=/['"]/,Eh=["lovelace-background","background-image"];function J(e,n){return{...e.vars,...e.modes?.[n]??{}}}function Th(e){return xh.test(e)?!e.startsWith("card-mod-")&&!e.startsWith("uix-"):!1}function _h(e,n){return typeof n!="string"||kh.test(n)?!1:!$h.test(n)||Eh.includes(e)}function Sh(e){return Object.entries(e).filter(([n,t])=>Th(n)&&_h(n,t))}var Ah=["lovelace-background","background-image"],Mh=/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi,Ch=/(^|[\s,/)])fixed(?=$|[\s,/(])/gi,Ph=/^\s*(?:(?:fixed|scroll|local)\s*(?:,\s*|$))+$/i;function Oi(e){return e.replace(Ch,"$1scroll")}function Rh(e){let n="",t=0;for(let r of e.matchAll(Mh)){let o=r.index??0;n+=Oi(e.slice(t,o))+r[0],t=o+r[0].length}return n+Oi(e.slice(t))}function Lh(e,n){return Ah.includes(e)||/url\(/i.test(n)||Ph.test(n)?Rh(n):n}function Je(e,n){for(let[t,r]of Sh(n))e.style.setProperty(`--${t}`,Lh(t,r))}var f={title:"Theme preview",dashboard:"Dashboard",defaultDashboard:"Overview",view:"View",device:"Device",desktop:"Desktop",tablet:"Tablet",phone:"Phone",density:"Density",normal:"Normal",compact:"Compact",mode:"Mode",dark:"Dark",light:"Light",current:"Current",candidate:"Candidate",sheet:"Preview options",divider:"Drag to compare current and candidate",splitAt:"Split at {percent} percent",apply:"Apply",navGroup:"Browse themes",navPrev:"Previous theme",navNext:"Next theme",navCount:"{index} of {total}",navPosition:"{name}, {index} of {total}",navLoading:"Loading theme...",navFailed:"Could not load {name}. Try again.",installButton:"Install",installBusy:"Installing...",installConfirmTitle:"Install this theme?",installConfirmBody:"The files of {repo} will be downloaded from GitHub by {store} into your Home Assistant configuration. Only install themes you trust.",installConfirmYes:"Download and install",installCancel:"Cancel",installLoading:"Loading theme...",uninstallButton:"Uninstall",uninstallBusy:"Uninstalling...",uninstallUpdating:"Updating...",uninstallConfirmTitle:"Uninstall this theme?",uninstallConfirmBody:"The theme files of {repo} will be deleted from your Home Assistant configuration by {store}.",uninstallConfirmYes:"Delete theme files",uninstallSwitchFirst:"Change the theme before uninstalling it.",inUseChip:"In use",uninstallWaiting:"Removed. Waiting for Home Assistant to unload the theme.",uninstallTimeout:"Removed, but Home Assistant still lists the theme. Reload the page or check {store}.",installWaiting:"Installed. Waiting for Home Assistant to load the theme.",installTimeout:"Installed, but Home Assistant has not loaded the theme yet. Reload the page or check {store}.",installViaStore:"This theme is not installed yet. Open it in {store} to download it, then come back here.",adminOnly:"Not installed yet. Only an administrator can install themes. Ask one to install this theme with {store}.",openInStore:"Open in {label}",installErrors:{unauthorized:"Only an administrator can install themes.",hacs_unavailable:"Installing needs {store}, which is not available here. Open the repository in {store} to install it.",invalid_repository:"This theme cannot be installed from here. Open it in {store} instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",install_failed:"This theme could not be downloaded by {store}. Try again, or open it in {store}.",reload_failed:"The theme was downloaded but Home Assistant could not reload its themes. Reload themes or restart Home Assistant.",operation_timeout:"This theme is still being handled by {store}. Check {store}, then reload the page.",not_installed:"This theme is not installed.",rate_limited:"Too many changes through {store} in a short time. Try again in a few minutes.",marketplace_warning:"Open the Marketplace once and accept its warning, then try again.",unknown:"The install did not complete. Try again, or open the theme in {store}."},uninstallErrors:{unauthorized:"Only an administrator can uninstall themes.",hacs_unavailable:"Removing needs {store}, which is not available here. Remove the theme in {store} instead.",invalid_repository:"This theme cannot be removed from here. Open it in {store} instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",uninstall_failed:"This theme could not be removed by {store}. Try again, or open it in {store}.",reload_failed:"The theme files were removed but Home Assistant could not reload its themes. Reload the page or restart Home Assistant.",operation_timeout:"This theme is still being handled by {store}. Check {store}, then reload the page.",not_installed:"This theme is not installed.",theme_in_use:"This theme is still used by an assignment, holiday, birthday or trial, or it is a default theme. Switch those to another theme first.",names_unknown:"The theme files could not be read, so removal was not safe. Remove it in {store} instead.",rate_limited:"Too many changes through {store} in a short time. Try again in a few minutes.",marketplace_warning:"Open the Marketplace once and accept its warning, then try again.",unknown:"The uninstall did not complete. Try again, or open the theme in {store}."},originalAdd:"Add to my themes",originalBusy:"Adding...",originalDone:"Added to your themes. You can apply it now.",originalWaiting:"Added, but Home Assistant has not loaded the theme yet. Reload the page to see it.",originalAdminOnly:"Only an administrator can add themes to this Home Assistant.",originalErrors:{name_exists:"A theme with this name is already in your themes.",rate_limited:"Too many changes in a short time. Try again in a few minutes.",unauthorized:"Only an administrator can add themes to this Home Assistant.",unknown:"The theme was not added. Try again."},nameCollision:"The installed copy of {name} has other values than this preview, so Apply and Try are turned off for the previewed one.",nameTaken:"Name already used",repoLink:"View repository",tryButton:"Try for 30 seconds",placeholderCard:"Preview unavailable for card type",loading:"Loading dashboard...",loadError:"Could not load this dashboard.",noViews:"This dashboard has no views.",noCards:"This dashboard has no cards to preview.",generatedSuffix:"(generated by Home Assistant)",generatedDefault:"This dashboard is generated by Home Assistant and has no stored layout to read. Pick another dashboard.",sampleView:"Sample from your entities",sampleNote:"This is a sample built from your entities. The real Overview is generated by Home Assistant and cannot be read.",domainTitles:{light:"Lights",switch:"Switches",climate:"Climate",cover:"Covers",media_player:"Media players",sensor:"Sensors",binary_sensor:"Binary sensors"},compare:"Compare",compareLabel:"Show",themeOnly:"Theme only",menu:"Menu",on:"On",off:"Off",lookLabel:"Look",realLook:"Real look",livePreview:"Live preview",realAlt:"Screenshot of {name} in Home Assistant, {mode} mode",realCaption:"Screenshot of the real theme in Home Assistant (version {commit})",compareHint:"Compare works with the live preview only.",modNote:"Menu and header styling done with card-mod is not shown here.",shell:{title:"Home Assistant",overview:"Overview",map:"Map",logbook:"Logbook",history:"History",energy:"Energy",settings:"Settings",bell:"Notifications",profile:"Profile",menu:"Menu",search:"Search",more:"More"},footnote:"Drawn from your own dashboard with read-only data and scoped colors. Nothing changes until you press Apply.",emptyView:"This view has no cards.",tooManyCards:"This view has more than 200 cards, so it is not previewed.",noCandidate:"Select a theme to compare.",noModeBlock:"This theme has no {mode} block, so the candidate uses the current colors.",trialUnavailable:"Trial mode is not ready. Reload the page and try again.",trialFailed:"The trial could not start."};var Ni=200,Oh=3,Dh=60,Ih=1500,Hh=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,Nh=3e3;function O(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function pn(e){if(!O(e))return{};let n=Object.create(null);for(let[t,r]of Object.entries(e))typeof r=="string"&&(n[t]=r);return n}function Di(e){if(O(e))return{dark:pn(e.dark),light:pn(e.light)}}function ie(e){return O(e.vars)?{vars:pn(e.vars),modes:Di(e.modes)}:{vars:pn(e),modes:Di(e.modes)}}function Fi(e){let n=e?.selectedTheme?.theme??e?.themes?.theme,t=e?.themes?.themes;if(!n||!t||!Object.prototype.hasOwnProperty.call(t,n))return;let r=t[n];return O(r)?ie(r):void 0}function Ii(e){let n=e.trim().replace(/[\s;]+$/,"").replace(/\s*!important$/i,"").replace(/[\s;]+$/,"").replace(/\s+/g," ");return/^#[0-9a-f]+$/i.test(n)?n.toLowerCase():n}function Fh(e,n){return Object.keys(e).some(t=>Object.prototype.hasOwnProperty.call(n,t)&&Ii(e[t])!==Ii(n[t]))}function Zr(e,n){return["dark","light"].some(t=>Fh(J(e,t),J(n,t)))}function Bi(e,n){return O(e)?Zr(ie(e),n):!1}function Jr(e){return e?[...Object.keys(e.vars),...Object.keys(e.modes?.dark??{}),...Object.keys(e.modes?.light??{})]:[]}function Ui(e){let n=e?.selectedTheme,t=n?.theme??e?.themes?.theme??"default";if(!n)return{theme:t};let r={theme:t};return typeof n.dark=="boolean"&&(r.dark=e?.themes?.darkMode??!1),typeof n.primaryColor=="string"&&(r.primaryColor=n.primaryColor),typeof n.accentColor=="string"&&(r.accentColor=n.accentColor),r}function ji(e,n){let t={theme:e.name};return n&&(t.dark=n==="dark"),t}function hn(e){return e.installed&&e.canApply&&!e.nameCollision}function mn(e){return e.installed&&!e.nameCollision}function zi(e){if(!(!Hh.test(e)||e.split("/").some(t=>t==="."||t==="..")))return`https://github.com/${e}`}function fn(e,n){return e?e.entry?J(e.entry,n):e.vars:{}}function Ki(e){return e&&/^https:\/\//i.test(e)?e:void 0}var Hi="map";async function Vi(e){let n=await e.connection.sendMessagePromise({type:"lovelace/dashboards/list"}),t=[{url_path:null,title:f.defaultDashboard}];if(!Array.isArray(n))return t;for(let r of n)O(r)&&typeof r.url_path=="string"&&t.push({url_path:r.url_path,title:typeof r.title=="string"?r.title:r.url_path});return[...t.filter(r=>r.url_path!==Hi),...t.filter(r=>r.url_path===Hi)]}async function Wi(e,n){let t=await e.connection.sendMessagePromise({type:"lovelace/config",url_path:n});return O(t)?t:{}}function Qr(e){return Array.isArray(e.views)?e.views.filter(O):[]}function qi(e,n){return typeof e.title=="string"&&e.title?e.title:typeof e.path=="string"&&e.path?e.path:`${f.view} ${n+1}`}function Gi(e,n){if(!Array.isArray(e.cards))return e;if(n>=Oh)return{...e,cards:[]};let t=e.cards.filter(O).map(r=>Gi(r,n+1));return{...e,cards:t}}function eo(e){let n=Array.isArray(e.cards)?e.cards:[],r=(Array.isArray(e.sections)?e.sections:[]).flatMap(o=>O(o)&&Array.isArray(o.cards)?o.cards:[]);return[...n,...r].filter(O).map(o=>Gi(o,0))}function to(e){return e.reduce((n,t)=>{let r=Array.isArray(t.cards)?to(t.cards.filter(O)):0;return n+1+r},0)}var Gr,Rt,Xr;function Yr(){let e=window.loadCardHelpers;return typeof e=="function"?e:void 0}async function Bh(){let e=customElements.whenDefined("partial-panel-resolver"),n=new Promise(r=>setTimeout(r,Nh));if(await Promise.race([e,n]),!customElements.get("partial-panel-resolver"))return;let t=document.createElement("partial-panel-resolver");t.hass={panels:{tmp:{url_path:"tmp",component_name:"lovelace"}}},t._updateRoutes?.(),await t.routerOptions?.routes?.tmp?.load?.()}async function Uh(){return Yr()?!0:(Xr??=Bh().catch(()=>{}).finally(()=>{Xr=void 0}),await Xr,Yr()!==void 0)}async function gn(){if(!await Uh())return;let e=Yr();if(e)return Rt&&Gr===e||(Gr=e,Rt=Promise.resolve().then(()=>e()).catch(()=>{Rt=void 0,Gr=void 0})),Rt}function jh(e){let n=typeof e.type=="string"?e.type:"unknown";return Array.from(n).slice(0,Dh).join("")}function un(e){let n=document.createElement("div");return n.className="placeholder",n.textContent=`${f.placeholderCard} ${e}`,n}function zh(e){return e.localName==="hui-error-card"||e instanceof HTMLUnknownElement}function Kh(e){return new Promise(n=>{let t=setTimeout(()=>n(!1),Ih),r=o=>{clearTimeout(t),n(o)};try{customElements.whenDefined(e).then(()=>r(!0),()=>r(!1))}catch{r(!1)}})}async function bn(e,n){let t=jh(n);if(!e)return un(t);let r;try{r=e.createCardElement(n)}catch{return un(t)}if(zh(r))return un(t);let o=r.localName;return o.includes("-")&&customElements.get(o)===void 0&&!await Kh(o)?un(t):r}function Xi(e){let n=[];for(let t=0;t<e.style.length;t+=1){let r=e.style.item(t);r.startsWith("--")&&n.push(r)}for(let t of n)e.style.removeProperty(t)}var Qe=class{constructor(){this.byRepo=new Map}add(n,t){let r=this.byRepo.get(n)??new Set;for(let o of t)r.add(o);this.byRepo.set(n,r)}of(n,t){let r=new Set(this.byRepo.get(n));for(let o of t)o&&r.add(o);return[...r]}};function Yi(e,n){let t=new Set(Object.keys(e));if(Array.isArray(n))for(let r of n)typeof r=="string"&&t.add(r);return[...t]}function Zi(e,n,t){return e.installed||n.some(r=>t.has(r))}function Ji(e,n){return e.includes(n)}function yn(e,n){return e.length===n.length&&e.every((t,r)=>t===n[r])}function Qi(e,n,t,r,o){if(e.installed)return"match";if(!n.some(a=>t.has(a)))return"none";if(!o||!r||!Object.prototype.hasOwnProperty.call(r,o.name))return"unverified";let s=r[o.name];if(!O(s))return"unverified";let i={vars:o.vars,modes:o.modes};return Zr(ie(s),i)?"different":"match"}var Vh="Local-Only-Theme",ro="hats_lite/local_themes",oo=`${Vh}/`;function xe(e){return typeof e?.full_name=="string"&&e.full_name.startsWith(oo)}function vn(e){return e.full_name.slice(oo.length)}function Wh(e,n){let t=JSON.stringify(e.themes?.themes?.[n]??null),r=0;for(let o=0;o<t.length;o+=1)r=r*31+t.charCodeAt(o)>>>0;return r.toString(16)}function qh(e,n){return{full_name:`${oo}${n}`,description:"",stars:0,installed:!0,last_commit:Wh(e,n),hacs_id:null}}var ea=e=>`${e.full_name}@${e.last_commit}`;function ta(e,n){return e.filter(xe).map(ea).join(`
`)===n.map(ea).join(`
`)?e:[...e.filter(r=>!xe(r)),...n]}async function na(e){if(!e)return[];try{let n=await M(e,{type:ro});return(Array.isArray(n?.names)?n.names:[]).filter(r=>typeof r=="string"&&r!==""&&!r.includes("/")).map(r=>qh(e,r))}catch{return[]}}function no(e){let n={};if(typeof e!="object"||e===null)return n;for(let[t,r]of Object.entries(e))t!=="modes"&&typeof r=="string"&&(n[t]=r);return n}function ra(e,n){let t=vn(n),r=e?.themes?.themes;if(!r||!Object.prototype.hasOwnProperty.call(r,t))return null;let o=r[t],s={vars:no(o)},i={};return o?.modes?.dark&&(i.dark=no(o.modes.dark)),o?.modes?.light&&(i.light=no(o.modes.light)),(i.dark||i.light)&&(s.modes=i),{[t]:s}}var oa="hats_lite/catalog",Gh="hats_lite/theme",so=5e3,io=6e4;function sa(e,n){let t=cn(e);return t==="permanent"?null:t==="limited"?io:so*2**n}function Xh(e){if(typeof e!="object"||e===null)return!1;let n=e.code;return n==="invalid_format"||n==="invalid_request"||n==="unknown_error"}function Be(e,n,t,r=!1,o){if(!e)return Promise.reject(new Error(b.themeErrorDefault));if(xe(t)){let i=ra(e,t);return i?(n.add(t.full_name,[vn(t)]),Promise.resolve({themes:i,summary:!1,names:[vn(t)]})):Promise.reject(new Error(b.themeErrorDefault))}let s={type:Gh,full_name:t.full_name,commit:t.last_commit||"HEAD"};return r?s.summary=!0:o&&(s.theme=o),M(e,s).then(i=>{if(!Pi(i?.themes))throw new Error(b.themeErrorDefault);let a=Yi(i.themes,i.names);return n.add(t.full_name,a),{themes:i.themes,summary:i.summary===!0,names:a}},i=>{if(s.theme!==void 0&&Xh(i))return Be(e,n,t);throw i})}var ia="hats_lite_theme_cache",lo=120,Yh=2e4;function ao(e){if(!O(e))return null;let n=Object.create(null);for(let[t,r]of Object.entries(e)){if(typeof r!="string")return null;n[t]=r}return n}function Zh(e){if(!O(e)||typeof e.name!="string")return null;let n=ao(e.vars);if(!n)return null;let t={name:e.name,vars:n};if(e.modes!==void 0&&e.modes!==null){if(!O(e.modes))return null;let r=ao(e.modes.dark??{}),o=ao(e.modes.light??{});if(!r||!o)return null;t.modes={dark:r,light:o}}return t}function et(e){let n=Object.keys(e)[0];if(n===void 0)return null;let t=e[n];if(!O(t))return null;let r=ie(t);return{name:n,vars:r.vars,modes:r.modes}}var aa=new WeakMap;function da(e,n){let t=aa.get(e)??{};return aa.set(e,t),t[n]??=J(e,n),t[n]}function la(e){return JSON.stringify(e).length>Yh}var wn=class{constructor(){this.slots=new Map;this.load()}load(){try{let n=localStorage.getItem(ia);if(n===null)return;let t=JSON.parse(n);if(!Array.isArray(t))return;for(let r of t){if(!Array.isArray(r)||typeof r[0]!="string")continue;let o=Zh(r[1]);o&&!la(o)&&this.slots.set(r[0],{theme:o})}this.trim()}catch{this.slots.clear()}}trim(){let n=[];for(;this.slots.size>lo;){let t=this.slots.keys().next().value;if(t===void 0)break;this.slots.delete(t),n.push(t)}return n}get size(){return this.slots.size}has(n){return this.slots.has(n)}touch(n){let t=this.slots.get(n);t&&(this.slots.delete(n),this.slots.set(n,t))}get(n){return this.slots.get(n)?.theme}bundle(n){return this.slots.get(n)?.bundle}set(n,t,r){this.slots.delete(n),this.slots.set(n,{theme:t,bundle:r});let o=this.trim();return this.persist(),o}persist(){try{let n=[...this.slots.entries()].filter(([,t])=>!la(t.theme)).map(([t,r])=>[t,r.theme]);localStorage.setItem(ia,JSON.stringify(n))}catch{return}}};var pa=["all","installed","dark","light","glass"];function ha(e,n){return e==="dark"||e==="light"?e:n}function ma(e){let n=e.split("/");return n[n.length-1]||e}function fa(e){let n=e.indexOf("/");return n>0?e.slice(0,n):""}function ke(e){return`${e.full_name}@${e.last_commit||"HEAD"}`}function Jh(e){return`${e.full_name} ${e.description}`.toLowerCase()}function ca(e,n){return new RegExp(`(^|[^a-z0-9])${n}([^a-z0-9]|$)`).test(e)}function ua(e){return!!e&&Object.keys(e).length>0}function Qh(e){return[e.vars,e.modes?.dark,e.modes?.light].some(t=>Object.entries(t??{}).some(([r,o])=>/backdrop-filter|blur/i.test(r)||/blur\(/i.test(o)))}function ga(e,n,t,r,o=n.installed){let s=t===void 0?r:void 0,i=Jh(n);return e==="all"?!0:e==="installed"?o:e==="dark"?ca(i,"dark")||ua(t?.modes?.dark)||s?.dark===!0:e==="light"?ca(i,"light")||ua(t?.modes?.light)||s?.light===!0:/glass|frost|blur/.test(i)||t!==void 0&&Qh(t)||s?.glass===!0}var em={all:b.filterAll,installed:b.filterInstalled,dark:b.filterDark,light:b.filterLight,glass:b.filterGlass};function ba(e){return l`
    <div class="toolbar">
      <div class="filters" role="group" aria-label=${b.filterLabel}>
        ${pa.map(n=>l`
            <button
              type="button"
              class="chip-btn"
              data-filter=${n}
              aria-pressed=${e.filter===n?"true":"false"}
              @click=${()=>e.onFilter(n)}
            >
              ${em[n]}
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
  `}var ya={width:440,height:275};function co(e,n,t){let r=e%n,o=Math.floor(e/n);return{sizeX:n*100,sizeY:t*100,posX:n>1?r/(n-1)*100:0,posY:t>1?o/(t-1)*100:0}}function va(e,n){return typeof e=="number"&&Number.isInteger(e)&&e>0&&e<=n}function tm(e,n,t){if(typeof e!="object"||e===null)return null;let r=e,o=r.index;return typeof r.full_name!="string"||typeof r.name!="string"||typeof o!="number"||!Number.isInteger(o)||o<0||o>=n||t.has(o)?null:(t.add(o),{full_name:r.full_name,name:r.name,index:o,commit:typeof r.commit=="string"&&r.commit?r.commit:null,license:typeof r.license=="string"&&r.license?r.license:null,dark:r.dark===!0,light:r.light===!0,glass:r.glass===!0})}function nm(e,n){for(let r of[e,n])if(typeof r=="string"&&r)return r;let t=r=>r!=null;return t(e)||t(n)?null:""}function xn(e){if(typeof e!="object"||e===null)return null;let n=e,{columns:t,rows:r,themes:o}=n;if(n.version!==1||!va(t,64)||!va(r,2e3)||!Array.isArray(o))return null;let s=new Set,i=new Map;for(let d of o){let c=tm(d,t*r,s);c&&i.set(c.full_name,c)}let a=nm(n.hash,n.generated);return a===null?null:{columns:t,rows:r,version:a,tile:rm(n.tile),themes:i}}function rm(e){if(typeof e!="object"||e===null)return ya;let{width:n,height:t}=e,r=o=>typeof o=="number"&&Number.isInteger(o)&&o>=16&&o<=4096;return r(n)&&r(t)?{width:n,height:t}:ya}function wa(e,n){return n.width===e.columns*e.tile.width&&n.height===e.rows*e.tile.height}var $a="/hats_lite_static/thumbs",xa=6e3,om=2e4,ka=3e4,kn=class extends Error{},nt=class extends Error{},sm=2,tt={recovery:{succeeded:!1,failures:0},fetchIndex(e,n="no-cache"){return fetch(`${$a}/index.json`,{credentials:"same-origin",cache:n,signal:e}).then(t=>{if(t.status===404)throw new kn("index missing");if(!t.ok)throw new Error("index unavailable");return t.json()})},loadImage(e,n){return new Promise(t=>{let r=new Image,o=i=>{n?.removeEventListener("abort",s),t(i)},s=()=>{r.src="",o(!1)};r.onload=()=>{o({width:r.naturalWidth,height:r.naturalHeight})},r.onerror=()=>o(!1),n?.addEventListener("abort",s),r.src=e})}};function uo(e,n,t){let r=new AbortController;return new Promise((o,s)=>{let i=()=>{clearTimeout(d),e.delete(a)},a=()=>{i(),r.abort(),s(new nt)},d=setTimeout(()=>{i(),r.abort(),s(new Error("timeout"))},n);e.add(a);let c=m=>p=>{i(),m(p)};try{t(r.signal).then(c(o),c(s))}catch(m){c(s)(m)}})}var $n=class{constructor(n){this.onChange=n;this.started=!1;this.images=new Map;this.wanted=new Set;this.generation=0;this.recovering=!1;this.retries=new Map;this.active=new Set;this.disposed=!1;this.ticket=0}ensure(n){if(this.wanted.add(n),!this.disposed){if(this.started){this.pump();return}this.startIndex()}}startIndex(){this.started=!0;let n=++this.ticket;Promise.resolve().then(()=>{n===this.ticket&&!this.disposed&&this.loadIndex(!0)})}later(n){let t=()=>{this.retries.delete(t),n()};this.retries.set(t,this.disposed?void 0:setTimeout(t,ka))}dispose(){this.disposed=!0,this.ticket+=1;for(let[n,t]of this.retries)t!==void 0&&clearTimeout(t),this.retries.set(n,void 0);for(let n of[...this.active])n();this.index===void 0&&(this.started=!1);for(let[n,t]of this.images)t===void 0&&this.images.delete(n)}resume(){this.disposed=!1;for(let[n,t]of this.retries)t===void 0&&this.retries.set(n,setTimeout(n,ka));!this.started&&this.wanted.size>0?this.startIndex():this.pump()}async loadIndex(n){let t=null,r=!1;try{t=xn(await uo(this.active,xa,o=>tt.fetchIndex(o)))}catch(o){if(o instanceof nt)return;r=!(o instanceof kn)}this.index=t,this.pump(),this.onChange(),!t&&r&&n&&this.later(()=>{this.loadIndex(!1)})}pump(){if(this.index)for(let n of this.wanted)this.images.has(n)||(this.images.set(n,void 0),this.loadImage(n,!0))}async loadImage(n,t){let r=this.index,o=this.generation;if(!r)return;let s=this.imageUrl(n),i=!1;try{i=await uo(this.active,om,d=>tt.loadImage(s,d))}catch(d){if(d instanceof nt)return}if(o!==this.generation)return;let a=i!==!1;if(a&&typeof i=="object"&&!wa(r,i)){this.mismatch(n);return}this.images.set(n,a),this.onChange(),!a&&t&&this.later(()=>{this.loadImage(n,!1)})}mismatch(n){this.images.set(n,!1),this.onChange();let t=tt.recovery;this.recovering||this.disposed||t.succeeded||t.failures>=sm||this.recover()}async recover(){this.recovering=!0;let n=null,t=!1;try{n=xn(await uo(this.active,xa,r=>tt.fetchIndex(r,"reload")))}catch(r){t=r instanceof nt}if(this.recovering=!1,!(t||this.disposed)){if(n===null){tt.recovery.failures+=1,this.onChange();return}tt.recovery.succeeded=!0,this.index=n,this.generation+=1;for(let r of this.wanted)this.images.delete(r);this.pump(),this.onChange()}}imageUrl(n){let t=this.index?.version??"",r=t?`?v=${encodeURIComponent(t)}`:"";return`${$a}/atlas-${n}.webp${r}`}theme(n,t){let r=this.index?.themes.get(n);if(!r)return;let o=r.commit;if(!(t&&o&&o!=="HEAD"&&o!==t))return r}state(n,t,r){if(this.ensure(t),this.index===void 0)return"pending";if(!this.theme(n,r))return"none";if(!this.images.has(t))return"pending";let o=this.images.get(t);return o===void 0?"pending":o?"ok":"none"}tile(n,t){let r=this.theme(n,t);return!r||!this.index?null:co(r.index,this.index.columns,this.index.rows)}};var Ea={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ta=e=>(...n)=>({_$litDirective$:e,values:n}),En=class{constructor(n){}get _$AU(){return this._$AM._$AU}_$AT(n,t,r){this._$Ct=n,this._$AM=t,this._$Ci=r}_$AS(n,t){return this.update(n,t)}update(n,t){return this.render(...t)}};var _a="important",im=" !"+_a,ae=Ta(class extends En{constructor(e){if(super(e),e.type!==Ea.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((n,t)=>{let r=e[t];return r==null?n:n+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[n]){let{style:t}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(n)),this.render(n);for(let r of this.ft)n[r]==null&&(this.ft.delete(r),r.includes("-")?t.removeProperty(r):t[r]=null);for(let r in n){let o=n[r];if(o!=null){this.ft.add(r);let s=typeof o=="string"&&o.endsWith(im);r.includes("-")||s?t.setProperty(r,s?o.slice(0,-11):o,s?_a:""):t[r]=o}}return pe}});function Sa(e,n,t,r){let o=e.tile(n,r),s=e.theme(n,r);if(!o||!s)return u;let i={backgroundImage:`url("${e.imageUrl(t)}")`,backgroundSize:`${o.sizeX}% ${o.sizeY}%`,backgroundPosition:`${o.posX}% ${o.posY}%`};return l`<div
    class="atlas-thumb"
    role="img"
    aria-label=${s.name}
    data-atlas="true"
    style=${ae(i)}
  ></div>`}function Aa(e){if(!e)return l`<span
      class="chip"
      title=${b.licenseUnknown}
      aria-label=${b.licenseUnknown}
      >${b.licenseShort}</span
    >`;let n=`${b.licenseKnown}: ${e}`;return l`<span class="chip" title=${n} aria-label=${n}>${e}</span>`}function am(e){e.preventDefault()}function lm(e){return e==="match"?l`<span class="chip ok">${b.installed}</span>`:e==="unverified"?l`<span class="chip">${b.installed}</span>`:e==="different"?l`<span class="chip warn">${b.otherCopy}</span>`:u}function Ma(e,n){let t=ma(e.entry.full_name),r=fa(e.entry.full_name),o=xe(e.entry),s=`${b.starsLabel}: ${e.entry.stars}`;return l`
    <article class="card" data-key=${e.key}>
      <button
        class="thumb-btn"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        ?disabled=${e.busy}
        @mousedown=${am}
        @click=${n}
      >
        ${e.atlased?Sa(e.atlas,e.entry.full_name,e.mode,e.entry.last_commit):l`<hats-lite-thumb
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
          ${lm(e.installedKind)}
          ${e.active?l`<span class="chip ok">${b.inUse}</span>`:u}
          ${o?u:l`<span class="chip" title=${s} aria-label=${s}
                  >${b.starGlyph} ${e.entry.stars}</span
                >
                ${Aa(e.license)}`}
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
  `}var rt="default",Ca="",po={full_name:Ca,description:b.defaultDescription,stars:0,installed:!0,last_commit:null,hacs_id:null};function Lt(e){return e?.full_name===Ca}function dm(e){return e===""||e.includes("default")||e.includes("home assistant")||"home assistant".includes(e)&&e.length>=4}function Tn(e,n){return e==="all"&&dm(n)}function ho(e){return Lt(e)?b.defaultName:e.full_name}function Pa(){return{[rt]:{vars:{}}}}function Ra(){return{name:rt,vars:{},installed:!0,canApply:!0}}function La(e,n){let t=b.defaultName;return l`
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
  `}function Oa(e){return!e.ready||e.count>0?"":e.catalog>0?e.defaultShown?"":e.query?b.noMatches:b.noFilterMatches:e.error?"":b.noThemes}var cm=6,ot=class{constructor(){this.slots=new Map}key(n,t){return`${ke(n)}@${t}`}get(n,t){let r=this.key(n,t),o=this.slots.get(r);return o&&(this.slots.delete(r),this.slots.set(r,o)),o}set(n,t,r){let o=this.key(n,t);for(this.slots.delete(o),this.slots.set(o,r);this.slots.size>cm;){let s=this.slots.keys().next().value;if(s===void 0)break;this.slots.delete(s)}}};async function mo(e,n,t,r,o){let s=t.get(r,o);if(s)return s;let i=await Be(e,n,r,!1,o),a={themes:i.themes,names:i.names,theme:o};return Object.prototype.hasOwnProperty.call(i.themes,o)&&t.set(r,o,a),a}async function Da(e,n,t,r,o,s){let i=ke(o),a=t.get(i)?.name??s,d=t.bundle(i);if(d&&(!a||Object.prototype.hasOwnProperty.call(d,a))){t.touch(i);let p=n.of(o.full_name,Object.keys(d));return{themes:d,names:p,theme:a??Object.keys(d)[0]}}if(!a){let p=await Be(e,n,o,!0);if(a=et(p.themes)?.name,!p.summary){let g=et(p.themes);return g&&t.set(i,g,p.themes),{themes:p.themes,names:p.names,theme:a}}}if(!a){let p=await Be(e,n,o);return{themes:p.themes,names:p.names,theme:Object.keys(p.themes)[0]}}let c=await mo(e,n,r,o,a),m=et(c.themes);return m&&!t.has(i)&&t.set(i,m),c}var $e=class extends Error{},_n=class{constructor(n=3,t=5e3,r=1,o=()=>t){this.limit=n;this.retryMs=t;this.retries=r;this.delayFor=o;this.running=0;this.waiting=[];this.pending=new Set;this.epoch=0}get active(){return this.running}add(n){return this.attempt(n,this.retries)}dispose(){this.epoch+=1;let n=this.waiting;this.waiting=[];for(let r of n)r.reject(new $e);let t=[...this.pending];this.pending.clear();for(let r of t)clearTimeout(r.timer),r.reject(new $e)}acquire(){return this.running<this.limit?(this.running+=1,Promise.resolve()):new Promise((n,t)=>this.waiting.push({resolve:n,reject:t}))}release(){let n=this.waiting.shift();n?n.resolve():this.running-=1}pause(n){return new Promise((t,r)=>{let o={timer:setTimeout(()=>{this.pending.delete(o),t()},n),reject:r};this.pending.add(o)})}async attempt(n,t){let r=this.epoch;if(await this.acquire(),r!==this.epoch)throw this.release(),new $e;let o=this.retryMs;try{return await n()}catch(s){if(r!==this.epoch)throw new $e;let i=t>0?this.delayFor(s,this.retries-t):null;if(i===null)throw s;o=i}finally{this.release()}return await this.pause(o),this.attempt(n,t-1)}};var Ia=T`
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
`;var um={dark:{"primary-background-color":"#111111","card-background-color":"#1c1c1c","primary-text-color":"#e1e1e1","secondary-text-color":"#9b9b9b","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#e1e1e11f","text-primary-color":"#ffffff","secondary-background-color":"#282828","disabled-text-color":"#6f6f6f"},light:{"primary-background-color":"#fafafa","card-background-color":"#ffffff","primary-text-color":"#141414","secondary-text-color":"#5e5e5e","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#0000001f","text-primary-color":"#ffffff","secondary-background-color":"#e5e5e5","disabled-text-color":"#bdbdbd"}},pm={"paper-item-icon-color":"#44739e","light-primary-color":"#b3e5fc","dark-primary-color":"#0288d1"},hm=["primary-color","accent-color","primary-text-color","secondary-text-color","card-background-color","primary-background-color"];function mm(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16)).join(", ")}function Ha(e){let n=um[e],t={...n,...pm};for(let r of hm)t[`rgb-${r}`]=mm(n[r]);return t}var Sn={dark:Ha("dark"),light:Ha("light")},fm=["lovelace-background","ha-card-background","ha-card-border-radius","ha-card-border-width","ha-card-border-color","ha-card-box-shadow","ha-card-backdrop-filter","state-icon-color","primary-font-family"],Na=Object.fromEntries(fm.map(e=>[e,"initial"]));function Fa(e,n){if(e===n)return!0;if(!e||!n)return!1;let t=Object.keys(e);return t.length===Object.keys(n).length&&t.every(r=>e[r]===n[r])}var fo=class extends A{constructor(){super(...arguments);this.vars=null;this.mode="dark";this.failed=!1;this.limited=!1}static{this.properties={vars:{attribute:!1,hasChanged:(t,r)=>!Fa(t,r)},mode:{attribute:!1},failed:{type:Boolean},limited:{type:Boolean}}}static{this.styles=T`
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
  `}updated(t){if(!t.has("vars")&&!t.has("mode"))return;let r=this.painted;r&&r.mode===this.mode&&Fa(r.vars,this.vars)||(this.painted={vars:this.vars,mode:this.mode},this.style.cssText="",this.vars&&(Je(this,Na),Je(this,Sn[this.mode]),Je(this,this.vars)))}render(){if(this.failed){let t=this.limited?b.thumbRateLimited:b.thumbUnavailable;return l`<div class="state unavailable"><span class="reason">${t}</span></div>`}return this.vars?l`
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
    `:l`<div class="state skeleton" aria-hidden="true"></div>`}};customElements.get("hats-lite-thumb")||customElements.define("hats-lite-thumb",fo);var V=T`
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
`;var gm=6,go=class extends A{constructor(){super(...arguments);this.installedThemes=[];this.currentTheme="default";this.entries=[];this.query="";this.loading=!1;this.loaded=!1;this.error="";this.fromCache=!1;this.busyName="";this.cardError=null;this.filter="all";this.mode="dark";this.states=new Map;this.started=!1;this.modeTouched=!1;this.installedSet=new Set;this.entryIndex=new Map;this.cache=new wn;this.bundles=new ot;this.visible=new Set;this.known=new Qe;this.queue=new _n(3,so,1,sa);this.atlas=new $n(()=>this.onAtlasChange());this.seen=new Set;this.inflight=new Set;this.permanent=new Set;this.limitedUntil=new Map;this.watched=new WeakMap;this.onIntersect=t=>{for(let r of t){let o=r.target.dataset.key??"";if(!r.isIntersecting){this.visible.delete(o);continue}this.visible.add(o),this.cache.touch(o);let s=this.entryIndex.get(o);s&&this.requestVars(s,!0)}};this.onSearch=t=>{this.query=t.target.value}}static{this.properties={installedThemes:{attribute:!1},currentTheme:{attribute:!1},darkMode:{attribute:!1},entries:{state:!0},query:{state:!0},loading:{state:!0},loaded:{state:!0},error:{state:!0},fromCache:{state:!0},busyName:{state:!0},cardError:{state:!0},filter:{state:!0},mode:{state:!0},states:{state:!0}}}static{this.styles=[V,W,Ia]}get hass(){return this.hassRef}set hass(t){this.hassRef=t;let r=t?.themes,o=Object.keys(r?.themes??{});yn(o,this.installedThemes)||(this.installedThemes=o),this.started&&r?.themes!==this.themesRef&&this.loadLocal(),this.themesRef=r?.themes;let s=t?.selectedTheme?.theme??r?.theme??"default";s!==this.currentTheme&&(this.currentTheme=s),r?.darkMode!==this.darkMode&&(this.darkMode=r?.darkMode),this.started||this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.atlas.resume(),this.hasUpdated&&queueMicrotask(()=>this.watchCards())}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0,this.watched=new WeakMap,this.visible.clear(),this.queue.dispose(),this.atlas.dispose()}willUpdate(t){t.has("installedThemes")&&(this.installedSet=new Set(this.installedThemes)),t.has("entries")&&(this.entryIndex=new Map(this.entries.map(r=>[ke(r),r]))),t.has("darkMode")&&!this.modeTouched&&this.darkMode!==void 0&&(this.mode=this.darkMode?"dark":"light"),!this.started&&this.hassRef&&(this.started=!0,this.loadCatalog())}updated(){queueMicrotask(()=>this.watchCards())}async loadCatalog(){let t=this.hassRef;if(t){this.loading=!0;try{let r=await M(t,{type:oa});this.entries=qr(r?.themes),this.loadLocal(),this.fromCache=!1,this.error="",Ci(this.entries.filter(o=>!xe(o)))}catch{let r=Mi();this.entries=r??[],this.fromCache=r!==null,this.error=b.loadError,this.loadLocal()}finally{this.loading=!1,this.loaded=!0}}}async loadLocal(){let t=await na(this.hassRef);this.entries=ta(this.entries,t)}setState(t,r){let o=new Map(this.states);r===null?o.delete(t):o.set(t,r),this.states=o}requestVars(t,r=!1){let o=ke(t);if(!this.hassRef||this.inflight.has(o)||this.cache.has(o))return;let s=this.states.get(o);(s==="failed"||s==="limited")&&!(r&&!this.permanent.has(o))||s==="limited"&&(this.limitedUntil.get(o)??0)>Date.now()||(this.seen.add(o),this.atlas.state(t.full_name,this.mode,t.last_commit)==="none"&&(this.inflight.add(o),this.setState(o,"loading"),this.queue.add(()=>Be(this.hassRef,this.known,t,!0)).then(a=>{let d=et(a.themes);if(!d)throw new Error(b.themeErrorDefault);let c=this.cache.set(o,d,a.summary?void 0:a.themes);this.refill(c),this.setState(o,null)}).catch(a=>{if(a instanceof $e){this.setState(o,null);return}let d=cn(a);d==="permanent"&&this.permanent.add(o),d==="limited"&&this.limitedUntil.set(o,Date.now()+io),this.setState(o,d==="limited"?"limited":"failed")}).finally(()=>this.inflight.delete(o))))}refill(t){if(!(this.visible.size>=lo))for(let r of t){let o=this.visible.has(r)?this.entryIndex.get(r):void 0;o&&this.requestVars(o)}}onAtlasChange(){this.requestUpdate();for(let t of this.seen){let r=this.entryIndex.get(t);r&&this.requestVars(r)}}watchCards(){let t=Array.from(this.renderRoot.querySelectorAll('.card[data-key]:not([data-key="default"])'));if(typeof IntersectionObserver>"u"){for(let r of t.slice(0,gm)){let o=this.entryIndex.get(r.dataset.key??"");o&&this.requestVars(o)}return}this.observer??=new IntersectionObserver(this.onIntersect,{rootMargin:"200px"});for(let r of t){let o=r.dataset.key??"";this.watched.get(r)!==o&&(this.watched.has(r)&&this.observer.unobserve(r),this.watched.set(r,o),this.observer.observe(r))}}async openEntry(t){if(Lt(t))return{entry:t,themes:Pa()};let r=this.atlas.theme(t.full_name,t.last_commit)?.name,o=await Da(this.hassRef,this.known,this.cache,this.bundles,t,r);return{entry:t,...o}}async refreshCatalog(){return await this.loadCatalog(),this.entries}visibleEntries(){let t=this.query.trim().toLowerCase();return[...Tn(this.filter,t)?[po]:[],...this.filtered(t).map(r=>r.entry)]}async selectTheme(t){if(!(this.busyName||!this.hassRef)){this.busyName=t.full_name,this.cardError=null;try{let r=await this.openEntry(t);this.dispatchEvent(new CustomEvent($i,{bubbles:!0,composed:!0,detail:r}))}catch(r){this.cardError={name:t.full_name,text:Ri(r)}}finally{this.busyName=""}}}pickFilter(t){let r=ha(t,this.mode);r!==this.mode&&(this.modeTouched=!0,this.mode=r),this.filter=t}cardModel(t,r,o){let s=this.hassRef?.themes?.themes,i=ke(t),a=this.cache.get(i),d=a?void 0:this.states.get(i),c=this.atlas.state(t.full_name,this.mode,t.last_commit)==="ok";return{entry:t,key:i,mode:this.mode,vars:a?da(a,this.mode):null,atlas:this.atlas,atlased:c,failed:d==="failed"||d==="limited",limited:d==="limited",installed:o,installedKind:Qi(t,r,this.installedSet,s,a),active:Ji(r,this.currentTheme),license:this.atlas.theme(t.full_name,t.last_commit)?.license,busy:this.busyName!=="",opening:this.busyName===t.full_name,error:this.cardError?.name===t.full_name?this.cardError.text:""}}filtered(t){let r=[];for(let o of this.entries){if(t&&!Li(o,t))continue;let s=this.cache.get(ke(o)),i=this.atlas.theme(o.full_name,o.last_commit),a=this.known.of(o.full_name,[i?.name,s?.name]),d=Zi(o,a,this.installedSet);ga(this.filter,o,s,i,d)&&r.push({entry:o,names:a,installed:d})}return r}visibleCards(t){return[...Tn(this.filter,t)?[La(this.mode,()=>this.selectTheme(po))]:[],...this.filtered(t).map(({entry:o,names:s,installed:i})=>Ma(this.cardModel(o,s,i),()=>this.selectTheme(o)))]}render(){let t=this.query.trim().toLowerCase(),r=this.visibleCards(t),o=Oa({count:this.filtered(t).length,ready:this.loaded&&!this.loading,catalog:this.entries.length,error:this.error,query:t,defaultShown:Tn(this.filter,t)}),s=[...this.states.values()].includes("loading");return l`
      <section>
        ${this.error?l`<p class="banner" role="alert">${this.error}</p>`:u}
        ${this.error&&!this.fromCache&&!this.loading?l`<button
              class="btn retry"
              type="button"
              @click=${()=>{this.loadCatalog()}}
            >
              ${b.retry}
            </button>`:u}
        ${ba({filter:this.filter,query:this.query,onFilter:i=>this.pickFilter(i),onSearch:this.onSearch})}
        <div class="live" role="status" aria-live="polite">
          ${this.fromCache?l`<p class="note">${b.cachedNote}</p>`:u}
          ${this.loading?l`<p>${b.loading}</p>`:u}
          ${o?l`<p>${o}</p>`:u}
          ${s?l`<span class="sr-only">${b.previewsLoading}</span>`:u}
        </div>
        <div class="grid">${r}</div>
      </section>
    `}};customElements.get("hats-lite-browse")||customElements.define("hats-lite-browse",go);var Ot=[];var bm=0,Ba=200;function F(e){bm+=1,Ot.length>=100&&Ot.shift(),Ot[Ot.length]=e.length>Ba?e.slice(0,Ba):e}var ym=new Set(["loadBackendTranslation","loadFragmentTranslation"]),vm=new Set(["call","send","set","fire","dispatch","post","put","patch","delete","remove","add","create","update","save","store","subscribe","unsubscribe","fetch","load","open","close","toggle","reload","restart","navigate","run","execute","invoke","emit","trigger","notify","turn","ws","api","login","logout","signout","upload","write","clear","reset","connect","disconnect","install","uninstall","enable","disable","start","stop","play","pause","push","publish","request","submit","register","revoke","refresh","resume","suspend","play","mute","press","click","dismiss","show","hide","edit","apply","change","select","activate","deactivate","cancel","confirm","reboot","shutdown","retry","sync","download","listen","attach","detach","mount","unmount","replace","insert","append","prepend","move","rename","copy","paste","kill","destroy","dispose","init","bootstrap","migrate","mutate"]),wm=/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;function Dt(e){if(ym.has(e))return"loader";if(typeof e!="string")return"blocked";let n=e.match(wm);if(n===null)return"blocked";for(let t of n)if(vm.has(t.toLowerCase()))return"blocked";return"read"}var xm=/^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|config\/entity_registry\/list_for_display$|auth\/current_user$|render_template$|history\/stream$|logbook\/event_stream$|subscribe_entities$|subscribe_events$|energy\/get_prefs$|energy\/info$|energy\/fossil_energy_consumption$|energy\/solar_forecast$|weather\/subscribe_forecast$|todo\/item\/list$|todo\/item\/subscribe$|calendar\/event\/subscribe$|recorder\/statistics_during_period$|recorder\/statistic_during_period$|recorder\/get_statistics_metadata$)/,km=new Set(["state_changed","entity_registry_updated","device_registry_updated","area_registry_updated","label_registry_updated","floor_registry_updated","lovelace_updated"]);function yo(e){return typeof e=="string"&&km.has(e)}var $m=["/api/states","/api/config","/api/history","/api/logbook","/api/camera_proxy","/api/image_proxy","/api/media_player_proxy"],bo="x-http-method-override";function st(e){if(typeof e!="object"||e===null)return;let n={...e},t=n.type;if(typeof t=="string")return{type:t,msg:n}}function it(e){return e===void 0||!xm.test(e.type)?!1:e.type==="subscribe_events"?yo(e.msg.event_type):!0}function at(e){return`ws:${e?e.type:"invalid"}`}var Em=/\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i,Tm=/@|%2f/i,_m=/^[A-Za-z][A-Za-z0-9+.-]*:/;function An(e,n=!1){return typeof e!="string"||e===""||Em.test(e)||e.startsWith("//")||Tm.test(e.split(/[?#]/,1)[0])?!1:e.startsWith("/")?!0:n&&!_m.test(e)}function Sm(e){return`/api/${e.split(/[?#]/,1)[0].replace(/^\/+/,"").replace(/^api\//,"")}`}function Mn(e){let n=Sm(e);return $m.some(t=>n===t||n.startsWith(`${t}/`))}function vo(e){if(e==null)return!1;let n=e;return typeof Headers<"u"&&e instanceof Headers?e.has(bo):Array.isArray(e)?e.some(t=>Array.isArray(t)&&String(t[0]).toLowerCase()===bo):typeof n=="object"?Object.keys(e).some(t=>t.toLowerCase()===bo):!1}function Cn(e){return typeof e=="string"?e:"invalid"}function Pn(e){return e==null||typeof e=="string"&&e.toUpperCase()==="GET"?"GET":null}function Rn(e){return typeof e=="string"?e.toUpperCase():"invalid"}var x=Reflect.apply,Ee=Reflect.has,le=Reflect.ownKeys,Te=Reflect.getOwnPropertyDescriptor,On=Reflect.getPrototypeOf,Ua=Object.setPrototypeOf,ja=Object.freeze,za=Reflect.defineProperty,Ht=Array.isArray,Ka=Math.trunc,Am=WeakMap.prototype.get,Mm=WeakMap.prototype.set,Yx=WeakMap.prototype.has,Cm=WeakSet.prototype.has,Pm=WeakSet.prototype.add,Rm=Object.prototype.hasOwnProperty,Lm=Object.prototype.propertyIsEnumerable,Om=Function.prototype.bind,Dm=Object.getOwnPropertyDescriptor(Map.prototype,"size")?.get,Im=Object.getOwnPropertyDescriptor(Set.prototype,"size")?.get,Va=Date.prototype.getTime,Wa=Object.prototype.toString;function ee(e,n){return x(Am,e,[n])}function he(e,n,t){x(Mm,e,[n,t])}function It(e,n){return x(Cm,e,[n])}function Ln(e,n){x(Pm,e,[n])}function _e(e,n){return x(Rm,e,[n])}function qa(e,n){return x(Lm,e,[n])}function Ga(e,n){return x(Om,e,[n])}function wo(e,n){try{return x(e,n,[]),!0}catch{return!1}}function xo(e){try{return x(Wa,e,[])}catch{return""}}function Dn(e){return xo(e)==="[object Map]"&&wo(Dm,e)}function In(e){return xo(e)==="[object Set]"&&wo(Im,e)}function Xa(e){return xo(e)==="[object Date]"&&wo(Va,e)}function Ya(e){return x(Va,e,[])}function Za(e){try{return x(Wa,e,[])==="[object Promise]"}catch{return!1}}var Ja=new WeakSet,Qa=new WeakSet;function el(e){if(!(typeof e!="object"||e===null)){Ln(Ja,e);for(let n of le(e)){let t=Te(e,n);t&&typeof t.get=="function"&&Ln(Qa,t.get)}}}for(let e of[Object,Function,Array,Map,Set,WeakMap,WeakSet,Date,Promise,RegExp,Error,String,Number,Boolean,Symbol,ArrayBuffer,DataView])el(e.prototype);for(let e of["URL","URLSearchParams","Headers","Request","Response","Blob","EventTarget"]){let n=globalThis[e];typeof n=="function"&&el(n.prototype)}function R(e,n,t){let r=e;for(;r!==null;){let o=Te(r,n);if(o){if(_e(o,"value"))return o.value;let s=o.get;if(typeof s!="function")return;let i=It(Ja,r)&&!It(Qa,s);return x(s,i?t:e,[])}r=On(r)}}function tl(){return{disposed:!1,unsubs:new Set,epoch:0,connections:new WeakMap}}function nl(e){e.epoch+=1;for(let n of[...e.unsubs])try{n()}catch{continue}e.unsubs.clear()}var Hm=new Set(["ready","disconnected"]);function rl(e,n){if(typeof e!="object"||e===null)return;let t=ee(n.connections,e);if(t)return t;let r=e,o=n,s=()=>{},i=(m,...p)=>{let g=R(r,m,void 0);if(typeof g!="function")throw new TypeError(`Connection has no ${m}`);return x(g,r,p)},a=new Map;async function d(m,p){if(n.disposed)return s;let g=o.epoch,E=await p((...S)=>{!n.disposed&&typeof m=="function"&&x(m,void 0,S)});if(typeof E!="function")return s;if(n.disposed||o.epoch!==g)return E(),s;let C=()=>{o.unsubs.delete(C)&&E()};return o.unsubs.add(C),C}let c={get connected(){return R(r,"connected",void 0)},get haVersion(){return R(r,"haVersion",void 0)},socket:void 0,suspendReconnectUntil:s,async sendMessagePromise(m){let p=st(m);if(it(p)&&!n.disposed)return i("sendMessagePromise",p.msg);F(at(p))},sendMessage(m,p){let g=st(m);if(it(g)&&!n.disposed)return i("sendMessage",g.msg,p);F(at(g))},async subscribeMessage(m,p,g){let v=st(p);return it(v)?d(m,E=>i("subscribeMessage",E,v.msg,g)):(F(at(v)),s)},async subscribeEvents(m,p){return yo(p)?d(m,g=>i("subscribeEvents",g,p)):(F(`ws:subscribe_events:${typeof p=="string"?p:"invalid"}`),s)},addEventListener(m,p){if(typeof m!="string"||!Hm.has(m)||typeof p!="function"){F(`event-listener:${typeof m=="string"?m:"invalid"}`);return}if(n.disposed)return;let g=a.get(m);if(g||(g=new Map,a.set(m,g)),g.has(p))return;let v=(S,...U)=>{n.disposed||x(p,c,[c,...U])},E=g,C=()=>{o.unsubs.delete(C)&&(E.delete(p),i("removeEventListener",m,v))};E.set(p,{forward:v,release:C}),i("addEventListener",m,v),o.unsubs.add(C)},removeEventListener(m,p){if(typeof m!="string")return;let g=a.get(m)?.get(p);g&&(a.get(m)?.delete(p),o.unsubs.delete(g.release),i("removeEventListener",m,g.forward))}};return Nm(c),he(n.connections,e,c),c}function Nm(e){for(let n of le(e)){let t=Te(e,n);if(!t)continue;let r=Object.create(null);r.configurable=!1,r.enumerable=t.enumerable,_e(t,"value")?(r.value=t.value,r.writable=!1):(r.get=t.get,r.set=t.set),za(e,n,r)}}var Ft=Set.prototype,al=Map.prototype,ll=Ft.has,Nt=Ft.add,Fm=Ft.delete,dl=Ft.values,Bm=Object.getOwnPropertyDescriptor(Ft,"size")?.get,Um=Object.getOwnPropertyDescriptor(al,"size")?.get,jm=al.keys,cl=Object.getPrototypeOf(new Set().values()).next,zm=Object.getPrototypeOf(new Map().keys()).next,Eo=["union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"];function ko(e){return typeof e=="object"&&e!==null||typeof e=="function"}function $o(e,n,t){let r=[];for(;;){let o=x(n,e,[]);if(o.done)return r;r[r.length]=t(o.value)}}function Km(e){return $o(x(dl,e,[]),cl,n=>n)}function ol(e,n){let t=new Set;for(let r=0;r<n.length;r+=1)x(Nt,t,[n[r]]);return{size:e,has:r=>x(ll,t,[r]),open(){let r=0;return{step:()=>r<n.length?{done:!1,value:n[r++]}:{done:!0},close(){}}}}}function Vm(e){let n=+e;if(n!==n)throw new TypeError("Set-like size is invalid");let t=Ka(n);if(t<0)throw new RangeError("Set-like size is negative");return t}function Wm(e,n){if(!ko(e))throw new TypeError("Set-like expected");let t=n.ownerOf(e),r=t??e;if(typeof r=="object"&&In(r)){let a=$o(x(dl,r,[]),cl,n.unwrap);return ol(x(Bm,r,[]),a)}if(typeof r=="object"&&Dn(r)){let a=$o(x(jm,r,[]),zm,n.unwrap);return ol(x(Um,r,[]),a)}let o=Vm(R(r,"size",e)),s=R(r,"has",e);if(typeof s!="function")throw new TypeError("Set-like has must be a function");let i=R(r,"keys",e);if(typeof i!="function")throw new TypeError("Set-like keys must be a function");return{size:o,has:a=>!!x(s,r,[t?a:n.view(a)]),open(){let a=x(i,r,[]);if(!ko(a))throw new TypeError("Set-like keys must return an object");let d=R(a,"next",a);if(typeof d!="function")throw new TypeError("Set-like iterator next must be a function");return{step(){let c=x(d,a,[]);if(!ko(c))throw new TypeError("Set-like iterator result must be an object");return R(c,"done",c)?{done:!0}:{done:!1,value:n.unwrap(R(c,"value",c))}},close(){let c=R(a,"return",a);typeof c=="function"&&x(c,a,[])}}}}}function qm(e){let n=new Set;for(let t=0;t<e.length;t+=1)x(Nt,n,[e[t]]);return n}function Hn(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return;n(r.value)}}function sl(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return!1;if(n(r.value))return t.close(),!0}}function il(e,n){for(let t=0;t<e.length;t+=1)if(n(e[t]))return!0;return!1}function ul(e,n,t,r){let o=Wm(t,r),s=Km(n),i=s.length<=o.size,a=p=>x(ll,n,[p]),d=qm(s),c=p=>{x(Nt,d,[p])},m=p=>{x(Fm,d,[p])};switch(e){case"union":return Hn(o,c),d;case"intersection":{let p=new Set;if(i)for(let g=0;g<s.length;g+=1)o.has(s[g])&&x(Nt,p,[s[g]]);else Hn(o,g=>{a(g)&&x(Nt,p,[g])});return p}case"difference":if(i)for(let p=0;p<s.length;p+=1)o.has(s[p])&&m(s[p]);else Hn(o,m);return d;case"symmetricDifference":return Hn(o,p=>a(p)?m(p):c(p)),d;case"isSubsetOf":return s.length<=o.size&&!il(s,p=>!o.has(p));case"isSupersetOf":return s.length>=o.size&&!sl(o,p=>!a(p));default:return i?!il(s,o.has):!sl(o,a)}}var To=new WeakMap,gl=new WeakSet,_o=new WeakMap,pl=new WeakMap,Se=Map.prototype,Ue=Set.prototype,bl=new Map([["has",Se.has],["get",Se.get],["keys",Se.keys],["values",Se.values],["entries",Se.entries],["forEach",Se.forEach],[Symbol.iterator,Se[Symbol.iterator]]]),yl=new Map([["has",Ue.has],["keys",Ue.keys],["values",Ue.values],["entries",Ue.entries],["forEach",Ue.forEach],[Symbol.iterator,Ue[Symbol.iterator]]]),Gm=Object.getOwnPropertyDescriptor(Se,"size")?.get,Xm=Object.getOwnPropertyDescriptor(Ue,"size")?.get,Ym=Object.getPrototypeOf(new Map().entries()).next,Zm=Object.getPrototypeOf(new Set().values()).next,Jm=Promise.prototype.then,vl=new Map,wl=new WeakSet,xl=new Map,kl=new Map;function $l(e,n){for(let t of le(e)){if(t==="constructor")continue;let r=Te(e,t);r&&typeof r.value=="function"&&(wl.add(r.value),n.set(t,r.value))}}$l(Object.prototype,kl);$l(Array.prototype,xl);function hl(e,n){let t=Te(e,n);return t&&_e(t,"value")?t.value:void 0}function El(e,n,t){if(t){let o=xl.get(n);if(o!==void 0&&hl(Array.prototype,n)===e)return o}let r=kl.get(n);if(r!==void 0&&hl(Object.prototype,n)===e)return r}for(let e of["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"])vl.set(e,Object.prototype[e]);var ml=ja(Object.create(null)),Qm=new Set(["toString","toJSON","toLocaleString","valueOf"]),ef=new Set(["get","getAll","has","toISOString"]);function tf(e){if(typeof e!="object"||e===null)return!1;if(Ht(e))return!0;let n=On(e);return n===Object.prototype||n===null}function nf(){throw new TypeError("Read-only")}function Tl(e){let n=ee(pl,e);if(n)return n;let t=function(){throw new TypeError("Read-only view: functions on this value cannot be called")};return Ua(t,null),he(pl,e,t),t}function Fn(e){return typeof e!="object"||e===null?e:ee(_o,e)??e}function rf(e,n){return(...t)=>{let r=[];for(let o=0;o<t.length;o+=1)r[o]=Fn(t[o]);return L(x(e,n,r))}}function _l(e,n,t,r){let o=R(e,n,r);if(typeof o!="function")return L(o);if(It(wl,o))return o;let s=El(o,n,Ht(e));return s!==void 0?s:Qm.has(n)||!t&&ef.has(n)?rf(o,e):Tl(o)}function*of(e,n){for(;;){let t=x(n,e,[]);if(t.done)return;yield L(t.value)}}function sf(e,n,t){let r=Te(e,n);if(r)return Ht(t)&&n==="length"?{value:R(e,n,void 0),writable:!0,enumerable:!1,configurable:!1}:_e(r,"value")?{value:L(r.value),writable:!1,enumerable:r.enumerable,configurable:!0}:{get:()=>L(R(e,n,ee(To,e))),set:void 0,enumerable:r.enumerable,configurable:!0}}function So(e){return{has:(n,t)=>Ee(e,t),ownKeys:()=>le(e),getOwnPropertyDescriptor:(n,t)=>sf(e,t,n),getPrototypeOf:()=>On(e),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1}}function af(e){return{...So(e),get:(n,t,r)=>_l(e,t,!0,r)}}function lf(e){let n=Za(e),t=(r,o)=>x(Jm,e,[s=>typeof r=="function"?r(L(s)):L(s),s=>{if(typeof o=="function")return o(L(s));throw L(s)}]);return{...So(e),getPrototypeOf:()=>ml,get(r,o,s){return o==="constructor"||o==="__proto__"?ml:n&&o==="then"?t:n&&o==="catch"?i=>t(void 0,i):n&&o==="finally"?i=>t(a=>(typeof i=="function"&&i(),a),a=>{throw typeof i=="function"&&i(),a}):_l(e,o,!1,s)}}}var df=new Set([...bl.keys()]),cf=new Set([...yl.keys(),...Eo]),uf=new Set(Eo),pf=new Set(["keys","values","entries",Symbol.iterator]),hf={unwrap:Fn,view:e=>L(e),ownerOf:e=>ee(_o,e)};function fl(e,n,t){let r=t?cf:df,o=t?yl:bl,s=t?Xm:Gm,i=t?Zm:Ym,a=new Proxy(n,{...So(e),get(d,c){if(c==="constructor"||c===Symbol.species)return R(e,c,a);if(c==="size")return x(s,e,[]);if(r.has(c)){if(uf.has(c))return v=>{let E=ul(c,e,v,hf);return typeof E=="boolean"?E:L(E)};let g=o.get(c);return c==="get"?v=>L(x(g,e,[Fn(v)])):c==="has"?v=>x(g,e,[Fn(v)]):pf.has(c)?()=>of(x(g,e,[]),i):(v,E)=>x(g,e,[(C,S)=>x(v,E,[L(C),L(S),a])])}let m=R(e,c,a);if(typeof m!="function")return L(m);let p=vl.get(c);return p!==void 0&&(p===m||El(m,c,!1)===p)?c==="valueOf"?()=>a:(...g)=>x(p,e,g):nf}});return a}function Nn(e,n){return he(To,e,n),Ln(gl,n),he(_o,n,e),n}function L(e){if(typeof e=="function")return Tl(e);if(typeof e!="object"||e===null||It(gl,e))return e;let n=ee(To,e);if(n)return n;if(Xa(e))return new Date(Ya(e));if(Dn(e))return Nn(e,fl(e,new Map,!1));if(In(e))return Nn(e,fl(e,new Set,!0));if(!tf(e))return Nn(e,new Proxy({},lf(e)));let t=Ht(e)?[]:{};return Nn(e,new Proxy(t,af(e)))}var Ml=new WeakMap,Sl=new WeakMap,mf=Symbol("shared");function Cl(e){let n=ee(Ml,e);n&&(n.state.disposed=!0,nl(n.state))}function ff(e,n){let t=R(e,"connection",void 0),r=typeof t=="object"&&t!==null?t:e,o=ee(Sl,r);o||(o=new Map,he(Sl,r,o));let s=o.get(n);if(s&&!s.disposed)return s;let i=tl();return o.set(n,i),i}var Al=new Map(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"].map(e=>[e,Object.prototype[e]])),gf="Preview closed: this read-only hass has been disposed";function Pl(e,n=mf){let t=e,r=ff(t,n),o=()=>{if(r.disposed)throw new Error(gf)},s=new Proxy({},{has(i,a){return a!=="auth"&&Ee(t,a)},ownKeys(){return le(t).filter(i=>i!=="auth")},getOwnPropertyDescriptor(i,a){if(!(a==="auth"||!Ee(t,a)))return{value:s[a],enumerable:!0,configurable:!0,writable:!1}},get(i,a){if(a==="auth")return;let d=R(t,a,s);if(a==="connection")return rl(d,r);if(Al.has(a)&&d===Al.get(a))return a==="hasOwnProperty"?m=>m!=="auth"&&_e(t,m):a==="valueOf"?()=>s:a==="toString"||a==="toLocaleString"?()=>"[object Object]":a==="isPrototypeOf"?()=>!1:m=>m!=="auth"&&qa(t,m);if(typeof d!="function")return L(d);let c=d;switch(a){case"callService":return async(m,p)=>{F(`service:${String(m)}.${String(p)}`)};case"callWS":return async m=>{o();let p=st(m);if(it(p))return x(c,t,[p.msg]);F(at(p))};case"callApi":return async(m,p,...g)=>{if(o(),typeof m=="string"&&Pn(m)){if(!An(p,!0)||!Mn(p)){F(`api-path:${Cn(p)}`);return}return x(c,t,[m,p,...g])}F(`api:${Rn(m)}`)};case"callApiRaw":return async(m,p,g,v,...E)=>{if(o(),typeof m!="string"||!Pn(m)){F(`api:${Rn(m)}`);return}if(!An(p,!0)||!Mn(p)){F(`api-path:${Cn(p)}`);return}let C=typeof v=="object"&&v!==null?{...v}:v;if(vo(C)){F("api-header:method-override");return}return x(c,t,[m,p,g,C,...E])};case"fetchWithAuth":return async(m,p)=>{if(o(),!An(m)||!Mn(m)){F(`fetch-path:${Cn(m)}`);return}if(p==null)return x(c,t,[m,p]);let g={...p};if(vo(g.headers)){F("fetch-header:method-override");return}let v=g.method;if(!Pn(v)){F(`fetch:${Rn(v)}`);return}return x(c,t,[m,g])};default:return Dt(a)==="loader"?Ga(c,t):Dt(a)==="read"?(...m)=>L(x(c,t,m)):async()=>{F(String(a))}}},set(){return!1},defineProperty(){return!1},deleteProperty(){return!1},setPrototypeOf(){return!1},preventExtensions(){return!1}});return he(Ml,s,{state:r}),s}function Bn(e){return Number.isFinite(e)?Math.min(98,Math.max(2,e)):50}function Rl(e,n){return n.width>0?Bn((e-n.left)/n.width*100):50}function Ll(e){return`inset(0 0 0 ${e}%)`}var bf="__default__",yf=6,vf=8,wf=160,Ol=["light","switch","climate","cover","media_player","sensor","binary_sensor"],xf=new Set(["person","zone","sun","update","event","conversation","tts","todo","weather"]);function Ao(e){return e??bf}function kf(e){return O(e)&&e.code==="config_not_found"}function $f(e){let n=O(e)?e.message:e;return typeof n=="string"?Array.from(n).slice(0,wf).join(""):""}async function Dl(e,n){try{return{status:"ok",config:await Wi(e,n)}}catch(t){return kf(t)?{status:"notfound"}:{status:"error",reason:$f(t)}}}function Ef(e){return e!==void 0&&(e.status==="notfound"||e.status==="ok"&&!lt(e.config))}async function Il(e,n,t){let r=[];for(let o of e){let s=await n(o.url_path);if(t())return{entries:r,options:e,stale:!0};if(r.push(s),s.status==="ok"&&lt(s.config)){let a=o.url_path!==null&&e[0]?.url_path===null&&Ef(r[0])?e.filter(d=>d.url_path!==null):e;return{hit:{entry:s,urlPath:o.url_path},entries:r,options:a,stale:!1}}}return{entries:r,options:e,stale:!1}}function lt(e){return e?Qr(e).some(n=>eo(n).length>0):!1}function Hl(e){let n=new Map;for(let i of Object.keys(e??{})){let a=i.indexOf(".");if(a<=0)continue;let d=i.slice(0,a),c=n.get(d)??[];c.push(i),n.set(d,c)}let t=[...n.keys()].filter(i=>!Ol.includes(i)&&!xf.has(i)).sort(),r=[...Ol.filter(i=>n.has(i)),...t];r.length===0&&(r=[...n.keys()].sort());let o=new Map(Object.entries(f.domainTitles)),s=r.slice(0,yf).map(i=>({type:"entities",title:o.get(i)??i,entities:(n.get(i)??[]).sort().slice(0,vf)}));if(s.length!==0)return{views:[{title:f.sampleView,cards:s}]}}function Nl(e){return e.status==="notfound"?f.generatedDefault:e.reason?`${f.loadError} ${e.reason}`:f.loadError}function Fl(e,n){let t=e?Qr(e):[];if(t.length===0)return{views:t,cards:[],notice:f.noViews};if(!lt(e))return{views:t,cards:[],notice:f.noCards};let r=eo(t[n]??t[0]);return to(r)>Ni?{views:t,cards:[],notice:f.tooManyCards}:{views:t,cards:r,notice:r.length===0?f.emptyView:""}}function Bl(e,n){return e.find(t=>t.url_path===n)?.title??f.defaultDashboard}var Tf="hats_lite_compare",_f="hats_lite_compare_designer";function Ul(e){return e?Tf:_f}function jl(e=!0){try{let n=window.localStorage.getItem(Ul(e));return n===null?e:n!=="0"}catch{return e}}function zl(e,n=!0){try{window.localStorage.setItem(Ul(n),e?"1":"0")}catch{return}}var Vl="hats_lite_preview_menu";var Wl={menu:"M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z",overview:"M13 3v6h8V3zM13 21h8V11h-8zM3 21h8v-6H3zM3 13h8V3H3z",map:"M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z",logbook:"M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 11h2v2H3zM3 17h2v2H3z",history:"M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z",energy:"M13 2 4 14h6l-1 8 9-12h-6z",settings:"M10.5 2h3l.5 2.6 1.8.8 2.2-1.5 2.1 2.1-1.5 2.2.8 1.8 2.6.5v3l-2.6.5-.8 1.8 1.5 2.2-2.1 2.1-2.2-1.5-1.8.8-.5 2.6h-3L10 20.4l-1.8-.8-2.2 1.5-2.1-2.1 1.5-2.2-.8-1.8L2 13.5v-3l2.6-.5.8-1.8-1.5-2.2L6 3.9l2.2 1.5 1.8-.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",bell:"M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4.5-5.8V4.5a1.5 1.5 0 0 0-3 0v.7A6 6 0 0 0 6 11v5l-2 2v1h16v-1z",search:"M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3zm0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z",more:"M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"},ql=["overview","map","logbook","history","energy"],Gl=["settings","bell"];function Xl(){try{return window.localStorage.getItem(Vl)!=="0"}catch{return!0}}function Yl(e){try{window.localStorage.setItem(Vl,e?"1":"0")}catch{return}}function Zl(e,n){return n&&e!=="phone"}var Kl={desktop:0,tablet:820,phone:390};function Jl(e,n){return e==="desktop"?"100%":n?`calc(${Kl[e]}px + var(--hats-lite-sidebar-width))`:`${Kl[e]}px`}function Ql(e){return e?"calc(256px * var(--hats-lite-density-scale, 1))":"0px"}function Sf(e){return e.startsWith("card-mod-")||e.startsWith("uix-")}function Bt(e){if(!e)return!1;let n=e.entry;return(n?[n.vars,n.modes?.dark,n.modes?.light]:[e.vars]).some(r=>Object.keys(r??{}).some(Sf))}var Af="HomeRiz/hats";function je(e){let n=typeof e=="string"?e:e?.full_name;return typeof n=="string"&&n.toLowerCase()===Af.toLowerCase()}var ed=/^[A-Za-z0-9_.-]+$/,Mf={marketplace:"the Marketplace",hacs:"HACS",generic:"the Marketplace or HACS"},Cf={marketplace:"Marketplace",hacs:"HACS",generic:"Marketplace or HACS"};function ze(e){let n=e?.config?.components;return Array.isArray(n)?n.includes("marketplace")?"marketplace":n.includes("hacs")?"hacs":"generic":"generic"}function Pf(e){return Mf[e]}function Rf(e){return Cf[e]}function te(e,n){return e.replaceAll("{store}",Pf(n)).replaceAll("{label}",Rf(n))}function Un(e,n,t,r){if(!ed.test(n)||!ed.test(t))return;let o=new URLSearchParams({owner:n,repository:t,category:r});return e==="marketplace"?`/marketplace/repository?${o.toString()}`:`https://my.home-assistant.io/redirect/hacs_repository/?${o.toString()}`}var Lf="hats_lite/install_theme",Of="hats_lite/uninstall_theme",Mo="hats-lite-theme-installed",Df=12e3,Ut=0,If=/^https:\/\/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;function td(e,n){let t=n?If.exec(n):null;if(t)return Un(e,t[1],t[2],"theme")}function zn(e){if(typeof e!="object"||e===null)return"";let n=e.code;return typeof n=="string"?n:""}function Hf(e,n="install",t="generic"){let r=zn(e),o=n==="install"?f.installErrors:f.uninstallErrors,s=Object.prototype.hasOwnProperty.call(o,r)?o[r]:o.unknown;return te(s,t)}function nd(){return Ut>0}var jn=class{constructor(n){this.host=n;this.phase="idle";this.op="install";this.error="";this.stale=!1;this.epoch=0}set(n,t=""){this.phase=n,this.error=t,this.host.requestUpdate()}focus(n){this.host.updateComplete.then(()=>this.host.renderRoot.querySelector(n)?.focus())}button(){return this.op==="install"?".install":".uninstall"}clearTimer(){this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}dispose(){this.epoch+=1,this.clearTimer()}clearStale(){this.stale=!1}settle(n){this.phase!=="done"||this.op!==n||(this.clearTimer(),this.set("idle"))}begin(n){this.phase!=="idle"||Ut>0||(this.op=n,this.set("confirm"),this.focus(".install-confirm"))}cancel(){this.phase==="confirm"&&(this.set("idle"),this.focus(this.button()))}reset(){this.stale=!1,this.epoch+=1,this.clearTimer(),(this.phase!=="idle"||this.error)&&this.set("idle")}async run(n,t,r,o){if(this.phase!=="confirm"||!n||Ut>0)return;let s=ze(n),i=this.epoch,a=this.op;this.set("busy"),this.focus(this.button()),Ut+=1;let d=!1,c="",m;try{let p={type:a==="install"?Lf:Of,full_name:t.fullName,hacs_id:t.hacsId};a==="uninstall"&&o&&(p.selected_theme=o);let g=await M(n,p);typeof g?.reset_selected=="boolean"&&(m=g.reset_selected)}catch(p){if(d=zn(p)==="reload_failed",c=Hf(p,a,s),!d){i===this.epoch&&this.set("idle",c),this.focus(this.button());return}}finally{Ut-=1,this.host.requestUpdate()}r({fullName:t.fullName,partial:d,...a==="uninstall"?{removed:!0,resetSelected:m}:{}}),i===this.epoch&&(a==="uninstall"&&(this.stale=!0),this.set(d?"idle":"done",c),!d&&(this.focus(this.button()),this.timer=setTimeout(()=>{this.timer=void 0,!(i!==this.epoch||this.phase!=="done")&&(this.set("idle",te(a==="install"?f.installTimeout:f.uninstallTimeout,s)),r({fullName:t.fullName,partial:!0}))},Df)))}};var Nf="hats_lite/add_original",Ff=3e3;function Bf(e){let n=zn(e),t=f.originalErrors;return Object.prototype.hasOwnProperty.call(t,n)?t[n]:t.unknown}function Uf(e,n){let t=e?.themes?.themes;return!!t&&Object.prototype.hasOwnProperty.call(t,n)}var Kn=class{constructor(n){this.host=n;this.phase="idle";this.error="";this.epoch=0}clearTimer(){this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}set(n,t=""){this.phase=n,this.error=t,this.host.requestUpdate()}reset(){this.epoch+=1,this.clearTimer(),(this.phase!=="idle"||this.error)&&this.set("idle")}dispose(){this.epoch+=1,this.clearTimer()}async run(n,t){let r=this.host.hass;if(this.phase==="busy"||!r)return;let o=this.epoch;this.set("busy");try{await M(r,{type:Nf,name:n})}catch(s){o===this.epoch&&this.set("idle",Bf(s));return}o===this.epoch&&(this.set("done"),this.clearTimer(),this.timer=setTimeout(()=>{this.timer=void 0,!(o!==this.epoch||this.phase!=="done"||Uf(this.host.hass,n))&&(this.set("idle",f.originalWaiting),t())},Ff))}};var rd="hats-lite-preview-nav",jf="select, input, textarea, [role='slider'], [contenteditable]";function od(e){if(e.defaultPrevented||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return 0;let n=e.composedPath()[0];return n instanceof Element&&n.closest(jf)?0:e.key==="ArrowLeft"?-1:1}function dt(e,n,t){let r=e+t;return r<0||r>=n?null:r}function zf(e){return f.navPosition.replace("{name}",e.name).replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}function Kf(e,n){return e.locked===!0||dt(e.index,e.total,n)===null}function sd(e){return l`
    <div class="nav" role="group" aria-label=${f.navGroup}>
      <span class="nav-info">
        <span class="nav-name">${e.name}</span>
        <span class="nav-pos">${f.navCount.replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}</span>
      </span>
      <span class="sr-only" role="status" aria-live="polite">${e.pending?f.navLoading:e.error||zf(e)}</span>
    </div>`}function Co(e,n,t){let r=Kf(e,n),o=n===-1;return l`
    <div class=${o?"nav-side nav-side-prev":"nav-side nav-side-next"}>
      <button type="button" class=${o?"nav-btn nav-prev":"nav-btn nav-next"}
        aria-label=${o?f.navPrev:f.navNext} aria-disabled=${r?"true":"false"}
        @click=${()=>{r||t(n)}}>${o?"←":"→"}</button>
    </div>`}async function id(e,n,t){let r=window.hatsLite;if(!r)return f.trialUnavailable;try{return await r.startTrial(Ui(e),ji(n,t)),""}catch{return f.trialFailed}}function Po(e,n,t){if(e)return e;if(!n)return;let r=t?.themes?.darkMode?"dark":"light";return n===r?void 0:n}var ct=e=>e??u;function Ro(e){return e.show&&e.admin&&e.hasTarget}function Lo(e){return e.stale||e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done")}function Vf(e){return e.op==="install"&&e.phase==="busy"?f.installBusy:e.op==="install"&&e.phase==="done"?f.installLoading:f.installButton}function ad(e,n){let t=e.op==="install"&&(e.phase==="busy"||e.phase==="done"),r=t||e.locked||e.phase==="confirm";return l`<button type="button" class="btn primary success install" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} @click=${()=>{r||n.onBegin("install")}}>${Vf(e)}</button>`}function Wf(e){return e.op!=="uninstall"?f.uninstallButton:e.phase==="busy"?f.uninstallBusy:e.phase==="done"?f.uninstallUpdating:f.uninstallButton}function ld(e,n){if(!e.canUninstall)return u;let t=e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done"),r=Lo(e)||e.locked||e.inUse||e.phase==="confirm",o=()=>{r||n.onBegin("uninstall")};return l`
    <button type="button" class="btn danger uninstall" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} aria-describedby=${ct(e.inUse?"uninstall-hint":void 0)} @click=${o}>${Wf(e)}</button>
    ${e.inUse?l`<p id="uninstall-hint" class="chip note">${f.uninstallSwitchFirst}</p>`:u}`}function qf(e){return e.storeHref?l`<a class="chip link store-link" href=${e.storeHref} target="_blank" rel="noopener noreferrer">${te(f.openInStore,e.store)}</a>`:u}function Gf(e){return n=>{if(n.key==="Escape"){n.stopPropagation(),e.onCancel();return}if(n.key!=="Tab")return;let t=n.currentTarget,r=Array.from(t.querySelectorAll("button")),o=r[0],s=r[r.length-1],i=t.getRootNode().activeElement;n.shiftKey&&i===o?(n.preventDefault(),s.focus()):!n.shiftKey&&i===s&&(n.preventDefault(),o.focus())}}function Xf(e,n){let t=e.op==="uninstall",r=()=>{e.locked||n.onConfirm()},o=te(t?f.uninstallConfirmBody:f.installConfirmBody,e.store);return l`
    <div class="install-dialog" role="alertdialog" aria-labelledby="install-title" aria-describedby="install-body" @keydown=${Gf(n)}>
      <strong id="install-title">${t?f.uninstallConfirmTitle:f.installConfirmTitle}</strong>
      <p id="install-body">${o.replace("{repo}",e.repoName)}</p>
      <button type="button" class="btn install-confirm ${t?"danger":"primary success"}" aria-disabled=${e.locked?"true":"false"} @click=${r}>${t?f.uninstallConfirmYes:f.installConfirmYes}</button>
      <button type="button" class="btn install-cancel" @click=${n.onCancel}>${f.installCancel}</button>
    </div>`}function Yf(e){return e.phase==="busy"?e.op==="install"?f.installBusy:f.uninstallBusy:e.phase==="done"?e.op==="install"?f.installWaiting:f.uninstallWaiting:""}function dd(e,n){let t=e.phase==="confirm"&&(Ro(e)||e.canUninstall)?Xf(e,n):u,r=Yf(e),o=l`<span class="sr-only install-status" role="status">${r}</span>`,s=u;e.show&&!e.admin?s=l`<p class="chip note">${te(f.adminOnly,e.store)}</p>`:e.show&&!e.hasTarget&&(s=l`<p class="chip note">${te(f.installViaStore,e.store)}</p>`);let i=e.show&&(!e.admin||!e.hasTarget||e.error!=="");return l`${s}${t}${o}${i?qf(e):u}`}var pd="/hats_lite_static/real",Zf="/hats_lite_real",cd=/^\w[\w.-]*\/\w[\w.-]*\.webp$/,Jf=/^[0-9a-f]{7,40}$/,hd={fetchIndex(){return fetch(`${pd}/index.json`,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(String(e.status));return e.json()})},fetchRemote(e){return e.connection.sendMessagePromise({type:"hats_lite/real_index"})}},Qf=300*1e3,ud=null,me=null;function eg(e,n=pd){let t=e;return!t||t.version!==1||!Array.isArray(t.items)?[]:md(t.items,n)}function tg(e){let n=e;return!n||!Array.isArray(n.items)?[]:md(n.items,Zf)}function md(e,n){let t=[];for(let r of e){if(!r||typeof r!="object")continue;let{full_name:o,name:s,commit:i,dark:a,light:d}=r;if(typeof o!="string"||typeof s!="string"||typeof i!="string"||!Jf.test(i))continue;let c=typeof a=="string"&&cd.test(a),m=typeof d=="string"&&cd.test(d);!c&&!m||t.push({full_name:o,name:s,base:n,commit:i,dark:c?a:"",light:m?d:""})}return t}function ng(){return Promise.resolve().then(()=>hd.fetchIndex()).then(e=>eg(e)).catch(()=>[])}function rg(e){let n={at:Date.now(),settled:!1,empty:!0,promise:Promise.resolve([])};return n.promise=Promise.resolve().then(()=>hd.fetchRemote(e)).then(tg).catch(()=>[]).then(t=>(n.settled=!0,n.empty=t.length===0,t)),n}function og(e){let n=me&&me.settled&&me.empty&&Date.now()-me.at>=Qf;return(!me||n)&&(me=rg(e)),me}function fd(e){ud??=ng();let n=e?og(e).promise:me?me.promise:Promise.resolve([]);return Promise.all([ud,n]).then(([t,r])=>{let o=new Set(t.map(s=>`${s.full_name}
${s.name}`));return[...t,...r.filter(s=>!o.has(`${s.full_name}
${s.name}`))]})}function gd(e,n,t){if(!(!n||!t))return e.find(r=>r.full_name===n&&r.name===t)}function bd(e,n){let t=n==="dark"?"light":"dark";for(let r of[n,t])if(e[r])return{url:`${e.base}/${e[r]}`,mode:r};return null}function yd(e,n){if(!e.available)return u;let t=r=>()=>{e.real!==r&&n(r)};return l`
    <div class="field look-switch">${f.lookLabel}
      <div class="seg" role="group" aria-label=${f.lookLabel}>
        <button type="button" class="look-real" aria-pressed=${e.real?"true":"false"} @click=${t(!0)}>${f.realLook}</button>
        <button type="button" class="look-live" aria-pressed=${e.real?"false":"true"} @click=${t(!1)}>${f.livePreview}</button>
      </div>
    </div>`}function vd(e,n,t){let r=bd(e,n);if(!r)return u;let o=f.realAlt.replace("{name}",e.name).replace("{mode}",f[r.mode].toLowerCase());return l`
    <figure class="real-look">
      <img src=${r.url} alt=${o} decoding="async" @error=${t} />
      <figcaption class="footnote real-caption">${f.realCaption.replace("{commit}",e.commit)}</figcaption>
    </figure>`}var wd=T`
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
`;function jt(e){return l`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${wi`<path d=${Wl[e]} fill="currentColor" fill-rule="evenodd"></path>`}</svg>`}function xd(e,n){return l`<div class=${n?"item selected":"item"}>${jt(e)}<span class="text">${f.shell[e]}</span></div>`}function sg(){return l`
    <div class="sidebar">
      <div class="side-menu"><span class="side-burger">${jt("menu")}</span><span class="side-title">${f.shell.title}</span></div>
      <div class="side-list">${ql.map((e,n)=>xd(e,n===0))}</div>
      <div class="side-list fixed">
        ${Gl.map(e=>xd(e,!1))}
        <div class="item user"><span class="avatar">${f.shell.profile.charAt(0)}</span><span class="text">${f.shell.profile}</span></div>
      </div>
    </div>`}function ig(e){return l`
    <div class="appbar">
      <span class="hamburger">${jt("menu")}</span>
      <span class="title">${e}</span>
      <span class="tools">${jt("search")}${jt("more")}</span>
    </div>`}function Oo(e){return l`
    <div class="shell" aria-hidden="true" inert>
      ${sg()}
      <div class="main">${ig(e)}<div class="cards" inert></div></div>
    </div>`}function kd(e,n){let t=e.frame==="phone",r=o=>()=>{e.menu!==o&&n.onMenu(o)};return l`
    <div class="field menu-switch">${f.menu}
      <div class="seg" role="group" aria-label=${f.menu}>
        <button type="button" class="menu-on" aria-pressed=${e.menu?"true":"false"} ?disabled=${t} @click=${r(!0)}>${f.on}</button>
        <button type="button" class="menu-off" aria-pressed=${e.menu?"false":"true"} ?disabled=${t} @click=${r(!1)}>${f.off}</button>
      </div>
    </div>`}function $d(e){return e?l`<p class="footnote mod-note" role="status">${f.modNote}</p>`:u}function Ed(e,n){if(!e.original)return u;if(e.phase==="done")return l`<p class="chip ok add-original-done" role="status">${f.originalDone}</p>`;if(e.installed)return u;if(!e.admin)return l`<p class="chip note">${f.originalAdminOnly}</p>`;let t=e.phase==="busy",r=t||e.locked;return l`
    <button type="button" class="btn primary success add-original" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} @click=${()=>{r||n.onAdd()}}>${t?f.originalBusy:f.originalAdd}</button>
    ${e.error?l`<p class="error" role="alert">${e.error}</p>`:u}`}var ag=600,Td=`(max-width: ${ag}px)`,de=an(`@media ${Td}`);function _d(e){if(typeof window.matchMedia!="function")return()=>{};let n=window.matchMedia(Td),t=r=>e(r.matches);return n.addEventListener("change",t),()=>n.removeEventListener("change",t)}var Ae=44,lg="--hl-kb",Ad=T`
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
`,Md=T`
  .toolbar {
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }
  ${de} {
    .actions {
      bottom: var(--hl-kb, env(keyboard-inset-height, 0px));
      padding-top: 10px;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
    }
  }
`;function dg(e,n){let t=n-e.height-e.offsetTop;return Number.isFinite(t)&&t>0?Math.round(t):0}var Sd=!1;function Do(e=window){let n=e.visualViewport;if(Sd||!n)return!1;Sd=!0;let t=e.document.documentElement,r=()=>{t.style.setProperty(lg,`${dg(n,e.innerHeight)}px`)};return n.addEventListener("resize",r),n.addEventListener("scroll",r),r(),!0}Do();var Io=class extends A{constructor(){super(...arguments);this.open=!1;this.label="";this.stopWatching=()=>{};this.onKey=t=>{t.key!=="Escape"||!this.open||(t.stopPropagation(),this.close(!0))}}static{this.properties={open:{type:Boolean,reflect:!0},label:{type:String}}}static{this.styles=T`
    :host,
    .sheet {
      display: contents;
    }
    .toggle {
      display: none;
    }
    ${de} {
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
        min-height: ${Ae}px;
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
  `}connectedCallback(){super.connectedCallback(),Do(),this.addEventListener("keydown",this.onKey),this.stopWatching=_d(t=>{t||(this.open=!1)})}disconnectedCallback(){this.removeEventListener("keydown",this.onKey),this.stopWatching(),this.stopWatching=()=>{},super.disconnectedCallback()}close(t){this.open=!1,t&&this.renderRoot.querySelector(".toggle")?.focus()}async toggle(){if(this.open)return this.close(!1);this.open=!0,await this.updateComplete,this.renderRoot.querySelector("#sheet")?.focus()}render(){return l`
      <button type="button" class="toggle" aria-expanded=${this.open?"true":"false"} aria-controls="sheet" @click=${()=>this.toggle()}>
        <span>${this.label}</span><span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="sheet" id="sheet" role="group" tabindex="-1" aria-label=${this.label}><slot></slot></div>
    `}};customElements.get("hats-lite-sheet")||customElements.define("hats-lite-sheet",Io);var cg={normal:"1",compact:"0.85"},ug=["desktop","tablet","phone"],pg=["normal","compact"],hg=["dark","light"];function Cd(e,n,t,r){return{applicable:hn(e),tryable:mn(e),trying:n,collision:e.nameCollision?f.nameCollision.replace("{name}",e.name):"",repo:Ki(e.repoUrl),error:t,pending:r.pending,install:r.install,original:r.original}}function Pd(e,n){return!e||Object.keys(fn(e,n)).length>0?"":f.noModeBlock.replace("{mode}",f[n].toLowerCase())}function Ho(e,n,t){return l`<button type="button" aria-pressed=${n?"true":"false"} @click=${t}>${e}</button>`}function mg(e,n){return e.url_path===null&&n?`${e.title} ${f.generatedSuffix}`:e.title}function fg(e,n){let t=r=>()=>{e.compare!==r&&n.onCompare()};return l`
    <div class="field view-switch">${f.compareLabel}
      <div class="seg" role="group" aria-label=${f.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${e.compare?"true":"false"}
          ?disabled=${!e.canCompare||e.real} aria-describedby=${ct(e.real?"compare-hint":void 0)} @click=${t(!0)}>${f.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${e.compare?"false":"true"}
          ?disabled=${!e.canCompare||e.real} @click=${t(!1)}>${f.themeOnly}</button>
      </div>
      ${e.real?l`<span id="compare-hint" class="compare-hint">${f.compareHint}</span>`:u}
    </div>`}function Rd(e,n){return l`
    <div class="toolbar">
      <hats-lite-sheet .label=${f.sheet}>
      <label class="field">${f.dashboard}
        <select class="pill" @change=${n.onDashboard}>
          ${e.dashboards.map((t,r)=>l`<option value=${String(r)} .selected=${t.url_path===e.dashboardUrl}>${mg(t,e.generatedDefault)}</option>`)}
        </select>
      </label>
      ${e.showViews?l`<label class="field">${f.view}
            <select class="pill" @change=${n.onView}>
              ${e.views.map((t,r)=>l`<option value=${String(r)} .selected=${r===e.viewIndex}>${qi(t,r)}</option>`)}
            </select>
          </label>`:u}
      <div class="seg" role="group" aria-label=${f.device}>
        ${ug.filter(t=>!(t==="tablet"&&e.hide?.includes("tablet"))).map(t=>Ho(f[t],e.frame===t,()=>n.onFrame(t)))}
      </div>
      <div class="seg" role="group" aria-label=${f.density}>
        ${pg.map(t=>Ho(f[t],e.density===t,()=>n.onDensity(t)))}
      </div>
      ${e.hide?.includes("mode")?u:l`<div class="seg" role="group" aria-label=${f.mode}>
        ${hg.map(t=>Ho(f[t],e.mode===t,()=>n.onMode(t)))}
      </div>`}
      ${kd({frame:e.frame,menu:e.menu},n)}
      ${yd({available:e.realAvailable,real:e.real},n.onLook)}
      ${fg(e,n)}
      </hats-lite-sheet>
    </div>`}function Ld(e,n){let t=Zl(e.frame,e.menu);return l`
    <div class="frame" data-sidebar=${t?"on":"off"} style=${ae({"--hats-lite-frame-width":Jl(e.frame,t),"--hats-lite-sidebar-width":Ql(t),"--hats-lite-density-scale":cg[e.density]})}>
      <div class=${e.comparing?"stage":"stage solo"}>
        <div class="pane current">${Oo(e.title)}</div>
        <div class="pane candidate" style=${ae(e.comparing?{clipPath:Ll(e.split)}:{})}>${Oo(e.title)}</div>
        <div class="shield"></div>
        ${e.comparing?l`<div class="divider" role="slider" tabindex="0"
              aria-label=${f.divider}
              aria-valuemin="2" aria-valuemax="98"
              aria-valuenow=${String(Math.round(e.split))}
              aria-valuetext=${f.splitAt.replace("{percent}",String(Math.round(e.split)))}
              style=${ae({left:`${e.split}%`})}
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
    ${$d(e.modNote)}`}function Od(e,n,t){return e?l`
    <div class="nav-frame">
      ${sd(e)}
      ${Co(e,-1,n)}
      ${Co(e,1,n)}
      <div class="nav-content">${t}</div>
    </div>`:t}function Dd(e,n){let t=Lo(e.install)||e.original.phase==="busy",r=e.collision?"collision-note":void 0,o=e.install.inUse&&!e.collision,s=l`<button type="button" class="btn primary success apply" aria-describedby=${ct(r)} ?disabled=${!e.applicable||e.pending||t} @click=${n.onApply}>${e.collision&&!e.applicable?f.nameTaken:f.apply}</button>`;return l`
    <div class="actions">
      ${o?u:Ro(e.install)?ad(e.install,n.install):s}
      ${o?u:l`<button type="button" class="btn try" aria-describedby=${ct(r)} ?disabled=${!e.tryable||e.trying||e.pending||t} @click=${n.onTry}>${f.tryButton}</button>`}
      ${o&&!e.install.canUninstall?l`<span class="chip ok in-use-chip">${f.inUseChip}</span>`:u}
      ${ld(e.install,n.install)}
      ${!e.applicable&&e.repo?l`<a class="chip link" href=${e.repo} target="_blank" rel="noopener noreferrer">${f.repoLink}</a>`:u}
      ${dd(e.install,n.install)}
      ${Ed(e.original,n.original)}
      ${e.collision?l`<p id="collision-note" class="chip warn collision" role="status">${e.collision}</p>`:u}
      ${e.error?l`<p class="error" role="alert">${e.error}</p>`:u}
    </div>`}var Vn=class{constructor(n){this.host=n;this.onKeyDown=n=>{let t=od(n),r=this.host.nav;t===0||!r||this.host.trying||dt(r.index,r.total,t)===null||(n.preventDefault(),this.moveBy(t))};this.flow=new jn(n),this.add=new Kn(n),n.addController(this)}hostConnected(){this.host.addEventListener("keydown",this.onKeyDown)}hostDisconnected(){this.flow.dispose(),this.add.dispose(),this.host.removeEventListener("keydown",this.onKeyDown)}hostUpdate(){let{candidate:n,install:t}=this.host;n&&this.flow.settle(n.installed?"install":"uninstall"),n&&!n.installed&&this.flow.clearStale();let r=(t??this.host.uninstall)?.fullName;if(n!==this.watched||r!==this.watchedKey){let o=n?.name===this.watched?.name&&r===this.watchedKey;this.watched=n,this.watchedKey=r,o||(this.flow.reset(),this.add.reset())}}moveBy(n){let t=this.host.nav;!t||this.host.trying||dt(t.index,t.total,n)===null||this.host.dispatchEvent(new CustomEvent(rd,{detail:{direction:n},bubbles:!0,composed:!0}))}apply(){let{candidate:n,hass:t}=this.host;if(!n||!hn(n)||this.host.nav?.pending)return;let r={theme:n.name},o=Po(this.host.userMode,this.host.mode,t);o&&(r.dark=o==="dark"),this.host.dispatchEvent(new CustomEvent("settheme",{detail:r,bubbles:!0,composed:!0}))}async tryTheme(){let{candidate:n,hass:t}=this.host;!n||!mn(n)||this.host.trying||this.host.nav?.pending||(this.host.error="",this.host.trying=!0,this.host.error=await id(t,n,Po(this.host.userMode,this.host.mode,t)),this.host.trying=!1)}selected(){let n=this.host.hass;return n?.selectedTheme?.theme??n?.themes?.theme??"default"}installModel(n){let t=this.host.hass?.user?.is_admin===!0,r=this.host.install??this.host.uninstall,o=this.host.nav?.pending===!0,s=ze(this.host.hass),i=je(n.fullName);return{show:!n.installed&&!n.nameCollision&&!i,admin:t,hasTarget:!!this.host.install,phase:this.flow.phase,op:this.flow.op,locked:nd()||o,error:this.flow.error,repoName:r?.fullName??n.name,store:s,storeHref:td(s,n.repoUrl),canUninstall:t&&!!this.host.uninstall&&n.installed&&!n.nameCollision,stale:this.flow.stale,inUse:this.selected().toLowerCase()===n.name.toLowerCase()}}originalModel(n){return{original:je(n.fullName),installed:n.installed,admin:this.host.hass?.user?.is_admin===!0,locked:this.host.trying||this.host.nav?.pending===!0,phase:this.add.phase,error:this.add.error}}addOriginal(){let n=this.host.candidate,t=n?.fullName;!n||!t||!je(t)||this.add.run(n.name,()=>this.host.dispatchEvent(new CustomEvent(Mo,{detail:{fullName:t,partial:!0},bubbles:!0,composed:!0})))}confirm(){let n=this.flow.op,t=n==="install"?this.host.install:this.host.uninstall;if(!t)return;let r=n==="uninstall"?this.selected():void 0;this.flow.run(this.host.hass,t,o=>this.host.dispatchEvent(new CustomEvent(Mo,{detail:o,bubbles:!0,composed:!0})),r)}render(){let n=this.host.candidate;if(!this.host.showActions||!n)return u;let t=Cd(n,this.host.trying,this.host.error||this.flow.error,{pending:this.host.nav?.pending===!0,install:this.installModel(n),original:this.originalModel(n)});return Dd(t,{onApply:()=>this.apply(),onTry:()=>{this.tryTheme()},install:{onBegin:r=>this.flow.begin(r),onCancel:()=>this.flow.cancel(),onConfirm:()=>this.confirm()},original:{onAdd:()=>this.addOriginal()}})}};var Id=T`
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
`;var gg="lovelace";async function Hd(e){if(typeof e!="object"||e===null)return;let n=e,t=n.loadFragmentTranslation;if(typeof t!="function")return;let r,o=new Promise(s=>{r=setTimeout(s,3e3)});try{await Promise.race([Promise.resolve(t.call(n,gg)).then(()=>{}),o])}catch{return}finally{clearTimeout(r)}}var Fd=new Set(["states","entities","devices","areas","floors","labels","extendedEntities","config","themes","selectedTheme","user","panels","narrowViewport","hassRegistries","hassConfig"]),bg=new Set(["localize","locale","hassInternationalization","hassFormatters","hassUi"]);function yg(e){return typeof e=="string"&&(Fd.has(e)||bg.has(e))}function Bd(e){if(typeof e!="object"||e===null||Array.isArray(e))return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null}function Nd(e,n,t){let r=R(e,n,t);if(typeof r=="function"){let o=r;return Dt(n)!=="read"?async()=>{F(`context:${String(n)}`)}:(...s)=>L(x(o,e,s))}return Bd(r)?Ud(r):L(r)}function Ud(e){let n=new Proxy({},{has:(t,r)=>Ee(e,r),ownKeys:()=>le(e),getOwnPropertyDescriptor:(t,r)=>Ee(e,r)?{value:Nd(e,r,n),enumerable:!0,configurable:!0,writable:!1}:void 0,get:(t,r)=>Nd(e,r,n),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1});return n}function vg(e,n){return Fd.has(e)?L(n):typeof n=="object"&&n!==null?Bd(n)?Ud(n):L(n):n}function wg(e){let n=e.getRootNode();return typeof ShadowRoot<"u"&&n instanceof ShadowRoot?n.host:e.parentElement}function jd(e){let n=new Set,t=!0,r=s=>{let i=s,{context:a,callback:d}=i;if(!t||!yg(a)||typeof d!="function")return;let c=wg(e);if(!c)return;s.stopPropagation();let m=s.composedPath()[0],p=d,g=new Map,v=(C,S)=>{if(!t)return;let U=S;if(typeof S=="function"){let I=S,Y=g.get(I);if(!Y){let j=()=>{n.delete(j),g.delete(I),I()};Y=j,g.set(I,j),n.add(j)}U=Y}p(vg(a,C),U)},E=new Event("context-request",{bubbles:!0,composed:!0});Object.assign(E,{context:a,callback:v,subscribe:i.subscribe===!0,contextTarget:m}),c.dispatchEvent(E)};return e.addEventListener("context-request",r),Object.assign(()=>{t=!1,e.removeEventListener("context-request",r);for(let s of n)try{s()}catch{continue}n.clear()},{pending:()=>n.size})}var xg=["hass-action","hass-more-info","show-dialog","hass-toggle-menu","location-changed","hass-dock-sidebar","hass-edit-sidebar","hass-set-theme","hass-service-called","hass-reload-themes","hass-open-link","popstate","iron-overlay-opened","ll-show-dashboard","hass-kiosk-mode","hass-language-select","hass-vibrate","hass-suspend-when-hidden","hass-enable-shortcuts","hass-time-zone-select","hass-date-format-select","hass-time-format-select","hass-first-weekday-select","hass-number-format-select","hass-refresh-current-user","hass-quick-bar-trigger","hass-show-notifications"],kg=["context-request","ll-custom","hass-notification","settheme","navigate","ll-open-dialog","hass-quick-bar","show-edit-card","ll-rebuild","hass-logout","config-refresh","dialog-closed","haptic"],$g=new Set(["value-changed","iron-resize","iron-select","iron-deselect","iron-activate","iron-items-changed","selected","selected-changed","expanded-changed","opened-changed","input","change","load","error","focus","blur","focusin","focusout","click","dblclick","auxclick","contextmenu","mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave","pointerdown","pointerup","pointermove","pointerover","pointerout","pointerenter","pointerleave","pointercancel","gotpointercapture","lostpointercapture","touchstart","touchmove","touchend","touchcancel","keydown","keyup","keypress","wheel","scroll","resize","select","submit","reset","toggle","slotchange","transitionend","animationend","dragstart","dragend","dragenter","dragover","dragleave","drop"]),Eg=new Set,Tg=/^(hass-|ll-|show-)/;function qd(e){return Tg.test(e)&&!Eg.has(e)}var _g=200,zt=EventTarget.prototype.dispatchEvent,Gd=EventTarget.prototype.addEventListener,Xd=EventTarget.prototype.removeEventListener,Sg=window.addEventListener,Ag=window.removeEventListener,Mg=Event.prototype.composedPath,Cg=Object.getOwnPropertyDescriptor(Node.prototype,"parentNode")?.get,Pg=Object.getOwnPropertyDescriptor(Node.prototype,"nodeType")?.get,zd=typeof ShadowRoot>"u"?void 0:Object.getOwnPropertyDescriptor(ShadowRoot.prototype,"host")?.get,Rg=11,X=Reflect.apply,Kt=new WeakSet,Yd=new Set,qn=new WeakMap,Wn=new Set,No=new Map,Zd=0,Vt=0,ut=null;function Jd(e){e.stopPropagation()}function Gn(e,n,t){let r=qn.get(e);r||(r=new Map,qn.set(e,r)),!r.has(n)&&(r.set(n,t),X(Gd,e,[n,Jd,{capture:t}]))}function Kd(e){try{if(X(Pg,e,[])===Rg&&zd)return X(zd,e,[])}catch{return e}return e}function Qd(e){if(typeof e!="object"||e===null)return null;let n=Kd(e);for(;n;){if(Kt.has(n))return n;let t=null;try{t=X(Cg,n,[])}catch{return null}n=t===null?null:Kd(t)}return null}function Vd(e){if(Vt===0)return;let n=X(Mg,e,[]),t=Qd(n.length>0?n[0]:e.target);t&&Gn(t,e.type,qd(e.type))}function Lg(e,n){if(!Wn.has(n)){if(Wn.size>=_g)return!1;Wn.add(n),No.set(n,Vd),X(Sg,window,[n,Vd,{capture:!0}])}return Gn(e,n,!1),!0}function Wd(e,n,t){let r=t.type,o=s=>s.stopPropagation();X(Gd,e,[r,o,{capture:!0}]);try{return X(zt,n,[t])}finally{X(Xd,e,[r,o,{capture:!0}])}}function Og(){ut||(ut=function(n){if(Vt===0||!n||typeof n.type!="string"||$g.has(n.type))return X(zt,this,[n]);let t=Qd(this);return t?qd(n.type)?Wd(t,this,n):Lg(t,n.type)?X(zt,this,[n]):(Zd+=1,Wd(t,this,n)):X(zt,this,[n])},Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:ut}))}function Dg(){for(let[e,n]of No)X(Ag,window,[e,n,{capture:!0}]);No.clear(),Wn.clear(),Zd=0,ut&&EventTarget.prototype.dispatchEvent===ut&&(Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:zt}),ut=null)}function ec(e){if(!Kt.has(e)){Kt.add(e),Yd.add(e),Vt+=1;for(let n of xg)Gn(e,n,!0);for(let n of kg)Gn(e,n,!1);Og()}}function tc(e){if(!Kt.has(e))return;Kt.delete(e),Yd.delete(e);let n=qn.get(e);if(n){for(let[t,r]of n)X(Xd,e,[t,Jd,{capture:r}]);qn.delete(e)}Vt-=1,Vt===0&&Dg()}var Xn=class{sync(n){let t=n?.querySelector(".stage"),r=t instanceof HTMLElement?t:void 0;return r===this.current?!1:(this.release(),r&&(this.current=r,ec(r),this.stopRelay=jd(r)),r!==void 0)}release(){this.stopRelay?.(),this.stopRelay=void 0,this.current&&tc(this.current),this.current=void 0}};var Ig={"markdown-code-background-color":"var(--primary-background-color)","table-row-background-color":"var(--primary-background-color)","table-row-alternative-background-color":"var(--secondary-background-color)","table-header-background-color":"var(--secondary-background-color)","data-table-background-color":"var(--card-background-color)","input-ink-color":"var(--primary-text-color)","input-label-ink-color":"var(--secondary-text-color)","input-idle-line-color":"color-mix(in srgb, var(--primary-text-color) 42%, transparent)","input-hover-line-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-disabled-ink-color":"var(--disabled-text-color)","input-disabled-fill-color":"color-mix(in srgb, var(--primary-text-color) 2%, var(--card-background-color))","input-disabled-line-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-outlined-idle-border-color":"color-mix(in srgb, var(--primary-text-color) 38%, transparent)","input-outlined-hover-border-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-outlined-disabled-border-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-dropdown-icon-color":"var(--secondary-text-color)","mdc-text-field-fill-color":"var(--input-fill-color)","mdc-text-field-ink-color":"var(--input-ink-color)","mdc-text-field-label-ink-color":"var(--input-label-ink-color)","mdc-text-field-idle-line-color":"var(--input-idle-line-color)","mdc-text-field-hover-line-color":"var(--input-hover-line-color)","mdc-text-field-disabled-fill-color":"var(--input-disabled-fill-color)","mdc-text-field-disabled-ink-color":"var(--input-disabled-ink-color)","mdc-text-field-disabled-line-color":"var(--input-disabled-line-color)","mdc-text-field-outlined-idle-border-color":"var(--input-outlined-idle-border-color)","mdc-text-field-outlined-hover-border-color":"var(--input-outlined-hover-border-color)","mdc-text-field-outlined-disabled-border-color":"var(--input-outlined-disabled-border-color)","chip-background-color":"color-mix(in srgb, var(--primary-text-color) 15%, transparent)","label-badge-background-color":"var(--card-background-color)","label-badge-text-color":"var(--primary-text-color)","state-inactive-color":"var(--disabled-text-color)","ha-color-text-primary":"var(--primary-text-color)","ha-color-text-secondary":"var(--secondary-text-color)","ha-color-text-disabled":"var(--disabled-text-color)","ha-color-border-neutral-quiet":"var(--divider-color)","ha-color-fill-neutral-quiet-resting":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))"},rc={...Ig,"state-active-color":"var(--amber-color, #ffc107)","state-light-active-color":"var(--state-active-color, #ffc107)","slider-color":"var(--primary-color)","paper-slider-active-color":"var(--primary-color)","mdc-theme-surface":"var(--card-background-color)","mdc-theme-on-surface":"var(--primary-text-color)","mdc-theme-primary":"var(--primary-color)","mdc-theme-secondary":"var(--accent-color)","input-fill-color":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))","mdc-select-fill-color":"var(--input-fill-color)","outline-color":"var(--divider-color)","switch-checked-color":"var(--primary-color)","switch-checked-button-color":"var(--switch-checked-color, var(--primary-color))","switch-checked-track-color":"var(--switch-checked-color, var(--primary-color))","state-icon-color":"var(--paper-item-icon-color, #44739e)"},Hg={"primary-color":"rgb-primary-color","accent-color":"rgb-accent-color","primary-text-color":"rgb-primary-text-color","secondary-text-color":"rgb-secondary-text-color","card-background-color":"rgb-card-background-color","primary-background-color":"rgb-primary-background-color"},Ng=/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,Fg=/^(rgba?|hsla?)\(\s*([^)]*)\)$/i,Bg=/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)$/i;function oc(e){return Math.max(0,Math.min(255,Math.round(e)))}function Ug(e){let n=Ng.exec(e);if(!n)return null;let t=n[1];return t.length<=4&&(t=[...t].map(r=>r+r).join("")),[0,2,4].map(r=>parseInt(t.slice(r,r+2),16))}function jg(e){let n=e.endsWith("%"),t=Number(n?e.slice(0,-1):e);return Number.isFinite(t)?n?t/100*255:t:null}function zg(e){let n=Number(e[0].replace(/deg$/i,"")),t=Number(e[1].replace(/%$/,""))/100,r=Number(e[2].replace(/%$/,""))/100;if(![n,t,r].every(Number.isFinite))return null;let o=a=>(a+n/30)%12,s=t*Math.min(r,1-r),i=a=>r-s*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[i(0),i(8),i(4)].map(a=>oc(a*255))}function Kg(e,n){let t=n.split(/[\s,/]+/).filter(Boolean).slice(0,3);if(t.length<3)return null;if(e.startsWith("hsl"))return zg(t);let r=t.map(jg);return r.some(o=>o===null)?null:r.map(oc)}function nc(e){let n=e.trim().replace(/\s*!important$/i,""),t=Ug(n);if(t)return t;let r=Fg.exec(n);return r?Kg(r[1].toLowerCase(),r[2]):null}function Vg(e,n){let t=Bg.exec(e.trim());if(!t)return nc(e);let r=n[t[1]];return typeof r=="string"?nc(r):null}function sc(e){let n={};for(let[t,r]of Object.entries(Hg)){if(!(t in e)||r in e)continue;let o=Vg(e[t],e);o&&(n[r]=o.join(", "))}return n}var ic=new WeakMap;function ac(e,n){let t=JSON.stringify(n);ic.get(e)!==t&&(ic.set(e,t),Xi(e),Je(e,n))}var Wg=["lovelace-background","ha-card-border-radius","ha-card-box-shadow","ha-card-border-width","ha-card-border-color","ha-card-background","ha-card-backdrop-filter","primary-font-family","paper-font-body1_-_font-family","text-primary-color","rgb-primary-color","rgb-accent-color","rgb-primary-text-color","rgb-secondary-text-color","rgb-card-background-color","rgb-primary-background-color","light-primary-color","dark-primary-color","secondary-background-color","state-icon-color","paper-item-icon-color","disabled-text-color","divider-color","card-background-color","primary-background-color","primary-text-color","secondary-text-color","primary-color","accent-color","app-header-background-color","app-header-text-color","app-header-selection-bar-color","app-header-edit-background-color","app-header-edit-text-color","app-header-border-bottom","sidebar-background-color","sidebar-text-color","sidebar-icon-color","sidebar-selected-background-color","sidebar-selected-text-color","sidebar-selected-icon-color"];function lc(e,n,t){let r={};for(let o of t)r[o]="initial";return{...r,...rc,...Sn[n],...sc(e),...e}}function dc(e,n,t,r){let o=e.querySelector(".pane.current"),s=e.querySelector(".pane.candidate"),i=Fi(n),a=i?J(i,r):{},d=t?fn(t,r):a,c=new Set([...Wg,...Jr(i),...Jr(t?.entry),...Object.keys(t?.vars??{}),...Object.keys(d)]);o instanceof HTMLElement&&ac(o,lc(a,r,c)),s instanceof HTMLElement&&ac(s,lc(d,r,c))}function cc(e,n){e.querySelectorAll(".cards > *").forEach(t=>{t.hass=n})}var uc=T`
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
`;var pc=T`
  ${de} {
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
      height: ${Ae}px;
    }
    hats-lite-sheet .seg {
      display: flex;
    }
    hats-lite-sheet .seg button {
      flex: 1 1 0;
      min-height: ${Ae}px;
    }
    .actions .btn {
      min-height: ${Ae}px;
    }
  }
`,hc=T`
  .page {
    padding-left: max(24px, env(safe-area-inset-left, 0px));
    padding-right: max(24px, env(safe-area-inset-right, 0px));
  }
  ${de} {
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
      min-height: ${Ae}px;
      padding: 6px 2px;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`,mc=T`
  ${de} {
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
      min-height: ${Ae}px;
    }
  }
`;var qg=T`
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
  ${de} {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 5;
    }
  }
`,fc=[V,W,qg,uc,Ad,Md,pc];var Gg=2,Xg=98,Yg=5,Zg=10;function gc(e,n,t=!1,r=!1){if(r)return null;let o=t?Zg:Yg;switch(e){case"ArrowLeft":case"ArrowDown":return Bn(n-o);case"ArrowRight":case"ArrowUp":return Bn(n+o);case"Home":return Gg;case"End":return Xg;default:return null}}function bc(e){let n=e.currentTarget;typeof n.setPointerCapture=="function"&&n.setPointerCapture(e.pointerId)}function yc(e){let n=e.currentTarget;typeof n.releasePointerCapture=="function"&&n.releasePointerCapture(e.pointerId)}var Jg=300*1e3,Yn=class{constructor(n){this.host=n;this.items=[];this.requested=!1;this.withHass=!1;this.failed=new Set;this.loading=!1;this.at=0;this.shown=!1}sync(n){if(!Bt(n))return;let t=this.host.hass,r=this.requested&&this.withHass&&!!t&&Date.now()-this.at>=Jg;this.loading||this.requested&&(this.withHass||!t)&&!r||(this.requested=!0,this.withHass=!!t,this.loading=!0,this.at=Date.now(),fd(t).then(o=>{this.items=o,o.length&&this.host.requestUpdate()}).finally(()=>{this.loading=!1}))}item(n){if(!Bt(n))return;let t=gd(this.items,n?.fullName,n?.name);return t&&!this.failed.has(t)?t:void 0}active(n){return!!this.item(n)&&this.pick!==!1}choose(n){this.pick=n,this.host.requestUpdate()}fail(n){let t=this.item(n);t&&(this.failed.add(t),this.host.requestUpdate())}leftReal(n){let t=this.active(n),r=this.shown&&!t;return this.shown=t,r}};var vc=[".pane.current .cards",".pane.candidate .cards"],Fo=class extends A{constructor(){super(...arguments);this.showActions=!0;this.dashboards=[];this.dashboardUrl=null;this.views=[];this.viewIndex=0;this.cards=[];this.notice=f.loading;this.frame="desktop";this.density="normal";this.split=50;this.error="";this.trying=!1;this.defaultCompare=!0;this.menu=Xl();this.defaultGenerated=!1;this.usingSample=!1;this.cache=new Map;this.dashboardsLoaded=!1;this.configToken=0;this.buildToken=0;this.dragging=!1;this.actions=new Vn(this);this.guard=new Xn;this.real=new Yn(this)}static{this.properties={hass:{attribute:!1},candidate:{attribute:!1},mode:{attribute:!1},showActions:{type:Boolean,attribute:"show-actions"},defaultCompare:{attribute:!1},hideControls:{attribute:!1},install:{attribute:!1},uninstall:{attribute:!1},nav:{attribute:!1},dashboards:{state:!0},dashboardUrl:{state:!0},views:{state:!0},viewIndex:{state:!0},cards:{state:!0},notice:{state:!0},frame:{state:!0},density:{state:!0},split:{state:!0},error:{state:!0},trying:{state:!0},compare:{state:!0},menu:{state:!0},defaultGenerated:{state:!0},usingSample:{state:!0}}}static{this.styles=[fc,Id,wd]}connectedCallback(){super.connectedCallback(),this.readOnlySource=void 0,this.hasUpdated&&this.attachHass(),this.guard.sync(this.renderRoot)}disconnectedCallback(){super.disconnectedCallback(),this.readOnly&&Cl(this.readOnly),this.readOnly=void 0,this.guard.release()}willUpdate(t){t.has("mode")&&this.mode!==this.userMode&&(this.userMode=void 0)}updated(t){t.has("hass")&&this.hass&&!this.dashboardsLoaded&&this.loadDashboards(),this.attachHass(),this.applyVars(),this.real.sync(this.candidate),this.real.leftReal(this.candidate)&&!t.has("cards")&&this.buildCards(),this.dataset.scheme=this.hass?.themes?.darkMode?"dark":"light",t.has("cards")&&this.buildCards(),this.guard.sync(this.renderRoot)&&!t.has("cards")&&this.buildCards()}comparing(){return this.real.active(this.candidate)?!1:this.compare??jl(this.defaultCompare)}effectiveMode(){return this.mode??(this.hass?.themes?.darkMode?"dark":"light")}async loadDashboards(){let t=this.hass;if(!t)return;this.dashboardsLoaded=!0;try{this.dashboards=await Vi(t)}catch{this.dashboards=[{url_path:null,title:f.defaultDashboard}]}let r=++this.configToken;this.notice=f.loading;let o=await Il(this.dashboards,i=>this.entryFor(i),()=>r!==this.configToken);if(o.stale)return;if(o.hit){[this.dashboardUrl,this.dashboards]=[o.hit.urlPath,o.options],this.applyEntry(o.hit.entry,o.hit.urlPath);return}this.dashboardUrl=null;let s=Hl(t.states);if(s&&!o.entries.every(i=>i.status==="error")){this.sample=s,this.useSample();return}o.entries[0]&&this.applyEntry(o.entries[0],null)}async entryFor(t){let r=Ao(t),o=this.cache.get(r);if(o)return o;let s=this.hass,i=s?await Dl(s,t):{status:"error",reason:""};return i.status!=="error"&&this.cache.set(r,i),t===null&&i.status==="notfound"&&(this.defaultGenerated=!0),i}async showDashboard(t){let r=++this.configToken;this.cache.has(Ao(t))||(this.notice=f.loading);let s=await this.entryFor(t);r===this.configToken&&this.applyEntry(s,t)}applyEntry(t,r){let o=t.status!=="ok"||!lt(t.config);if(this.sample&&r===null&&o){this.useSample();return}this.usingSample=!1,this.viewIndex=0,this.config=t.status==="ok"?t.config:void 0,t.status==="ok"?this.selectView():this.setState({views:[],cards:[],notice:Nl(t)})}useSample(){this.usingSample=!0,this.config=this.sample,this.viewIndex=0,this.selectView()}selectView(){this.setState(Fl(this.config,this.viewIndex))}setState(t){this.views=t.views,this.cards=t.cards,this.notice=t.notice}async buildCards(){let t=++this.buildToken,[r]=await Promise.all([gn(),Hd(this.hass)]),o=await Promise.all(vc.map(()=>this.buildPane(r)));t===this.buildToken&&(vc.forEach((s,i)=>{let a=this.renderRoot.querySelector(s);a instanceof HTMLElement&&a.replaceChildren(...o[i])}),this.attachHass(!0))}buildPane(t){return Promise.all(this.cards.map(r=>bn(t,r)))}attachHass(t=!1){let r=this.hass;r&&(r!==this.readOnlySource&&(this.readOnlySource=r,this.readOnly=Pl(r,this),t=!0),t&&this.readOnly&&cc(this.renderRoot,this.readOnly))}applyVars(){dc(this.renderRoot,this.hass,this.candidate,this.effectiveMode())}onDashboard(t){let r=Number(t.target.value);this.dashboardUrl=this.dashboards[r]?.url_path??null,this.showDashboard(this.dashboardUrl)}onView(t){this.viewIndex=Number(t.target.value),this.selectView()}onKey(t){let r=gc(t.key,this.split,t.shiftKey,t.altKey||t.ctrlKey||t.metaKey);r!==null&&(t.preventDefault(),this.split=r)}onPointerDown(t){bc(t),this.dragging=!0}onPointerMove(t){if(!this.dragging)return;let r=this.renderRoot.querySelector(".stage");r instanceof HTMLElement&&(this.split=Rl(t.clientX,r.getBoundingClientRect()))}onPointerUp(t){this.dragging=!1,yc(t)}setMode(t){this.userMode=t,this.mode=t;let r={detail:{mode:t},bubbles:!0,composed:!0};this.dispatchEvent(new CustomEvent(Ti,r))}renderStageView(){let t=this.candidate;return Ld({frame:this.frame,density:this.density,split:this.split,comparing:this.comparing()||!t,candidateName:t?t.name:f.noCandidate,note:Pd(t,this.effectiveMode()),title:Bl(this.dashboards,this.dashboardUrl),menu:this.menu,modNote:Bt(t)},{onKey:r=>this.onKey(r),onPointerDown:r=>this.onPointerDown(r),onPointerMove:r=>this.onPointerMove(r),onPointerUp:r=>this.onPointerUp(r)})}renderBody(){let t=this.real.active(this.candidate)&&this.real.item(this.candidate);return t?vd(t,this.effectiveMode(),()=>this.real.fail(this.candidate)):this.notice?l`<p class="notice" role="status">${this.notice}</p>`:this.renderStageView()}render(){let t=this.views.length>0&&lt(this.config);return l`
      ${Od(this.nav?{...this.nav,locked:this.trying}:null,r=>this.actions.moveBy(r),l`
          ${Rd({dashboards:this.dashboards,dashboardUrl:this.dashboardUrl,generatedDefault:this.defaultGenerated,views:this.views,viewIndex:this.viewIndex,showViews:t,frame:this.frame,density:this.density,mode:this.effectiveMode(),compare:this.comparing()||!this.candidate,canCompare:!!this.candidate,hide:this.hideControls,menu:this.menu,realAvailable:!!this.real.item(this.candidate),real:this.real.active(this.candidate)},{onDashboard:r=>this.onDashboard(r),onView:r=>this.onView(r),onFrame:r=>{this.frame=r},onDensity:r=>{this.density=r},onMode:r=>this.setMode(r),onMenu:r=>{this.menu=r,Yl(r)},onLook:r=>this.real.choose(r),onCompare:()=>{this.candidate&&(this.compare=!this.comparing(),zl(this.compare,this.defaultCompare))}})}
          ${this.usingSample?l`<p class="notice" role="status">${f.sampleNote}</p>`:u}
          ${this.renderBody()}
        `)}
      ${this.actions.render()}
    `}};customElements.get("hats-lite-preview")||customElements.define("hats-lite-preview",Fo);function ne(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16))}function Bo(e){return Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")}function D(e){return`#${Bo(e[0])}${Bo(e[1])}${Bo(e[2])}`}function Z(e,n,t){return[0,1,2].map(r=>Math.round(e[r]*t+n[r]*(1-t)))}function Jn(e,n,t){return[0,1,2].map(r=>e[r]*t+n[r]*(1-t))}function Uo(e){let n=e/255;return n<=.03928?n/12.92:((n+.055)/1.055)**2.4}function wc(e){return .2126*Uo(e[0])+.7152*Uo(e[1])+.0722*Uo(e[2])}function Me(e,n){let[t,r]=[wc(e),wc(n)].sort((o,s)=>s-o);return(t+.05)/(r+.05)}var q=[255,255,255],pt=[0,0,0];function jo(e){return Me(q,e)>=Me(pt,e)?q:pt}function Zn(e,n){return Math.min(...n.map(t=>Me(e,t)))}function Ce(e,n,t){if(Zn(e,n)>=t)return e;let r=Zn(q,n)>=Zn(pt,n)?q:pt;for(let o=1;o<=20;o+=1){let s=Z(r,e,o/20);if(Zn(s,n)>=t)return s}return r}function fe(e,n){return`rgba(${e[0]},${e[1]},${e[2]},${Number(n.toFixed(4))})`}var Qg=[15,17,21],eb=[27,30,36],tb=[240,242,245],nb=[170,176,186],rb=[20,23,27],ob=[84,91,101],sb=7.2,xc=7.1,ib=4.55,zo=3.05,ab=4.55;function lb(e){return Number.isFinite(e)?Math.min(60,Math.max(2,e)):2}function db(e,n,t){let r=lb(n)/100;if(e==="light")return Math.min(1,.4+r);let o=r;for(;o>.02&&Me(q,Jn(q,t,o))<sb;)o=Math.max(.02,Number((o-.005).toFixed(4)));return o}var kc=/^#[0-9a-fA-F]{6}$/,ht=2,Ko=60;function Wt(e,n){if(n==="light"||!kc.test(e))return Ko;let t=qt(e,"dark",Ko).alpha;return Math.min(Ko,Math.max(ht,Math.floor(t*100+1e-9)))}function Qn(e,n){let t=Math.min(100,Math.max(0,Number.isFinite(e)?e:0));return Math.round(ht+t/100*(n-ht))}function $c(e,n){if(n<=ht)return 0;let t=(e-ht)/(n-ht)*100;return Math.min(100,Math.max(0,Math.round(t)))}function Ec(e,n,t){return kc.test(e)?Math.round(qt(e,n,t).alpha*100):0}function qt(e,n,t){let r=ne(e),o=n==="dark",s=o?Z(r,Qg,.09):Z(r,q,.055),i=o?Z(r,eb,.1):Z(r,q,.1),a=o?Z(r,Z(q,s,.05),.05):Z(r,q,.025),d=Number(db(n,t,s).toFixed(4));return{background:s,secondary:i,card:a,glass:Jn(q,s,d),alpha:d}}function Tc(e,n,t,r=20){let o=ne(e),s=ne(n),i=t==="dark",{background:a,secondary:d,card:c,glass:m,alpha:p}=qt(e,t,r),g=[a,d,c,m],v=Ce(Z(o,i?tb:rb,.06),g,xc),E=Ce(Z(o,i?nb:ob,.1),g,ib),C=jo(o),S=Ce(s,g,zo),U=Ce(o,g,zo),I=i?Z(o,[10,12,15],.07):Z(o,q,.075),Y=Jn(o,I,.18),j=Ce(o,[I,Y],ab);return{"primary-color":D(o),"accent-color":D(s),"primary-background-color":D(a),"secondary-background-color":D(d),"card-background-color":D(c),"ha-card-background":fe(q,p),"primary-text-color":D(v),"secondary-text-color":D(E),"divider-color":fe(i?q:pt,.12),"app-header-background-color":D(o),"app-header-text-color":D(C),"text-primary-color":D(C),"paper-tabs-selection-bar-color":D(Ce(s,[o],zo)),"switch-checked-color":D(S),"switch-checked-button-color":D(jo(S)),"paper-slider-active-color":D(U),"state-icon-color":D(S),"sidebar-background-color":D(I),"sidebar-text-color":D(Ce(v,[I],xc)),"sidebar-selected-background-color":fe(o,.18),"sidebar-selected-text-color":D(j),"sidebar-selected-icon-color":D(j)}}var Vo=/^#[0-9a-fA-F]{6}$/,Sc=/^\/local\/hats_lite\/[0-9a-fA-F]{32}\.(png|jpg|webp|gif)$/,cb=/^https:\/\/[^\s'"`\\(){}<>;]+$/,ub=/\.\.|!important/i,pb=2e3,Xt=90,Wo=["app-header-background-color","sidebar-background-color"];function Ac(e){return typeof e=="string"&&Sc.test(e)}function Gt(e,n,t){return typeof e!="number"||!Number.isFinite(e)?n:Math.min(t,Math.max(n,e))}function _c(e){if(typeof e!="string"||!Vo.test(e))throw new Error("Invalid color");return e}function hb(e,n){if(typeof e!="string"||ub.test(e))throw new Error("Invalid background");if(n==="url"&&e.length>pb)throw new Error("Background too long");if(!(n==="url"?cb.test(e):Sc.test(e)))throw new Error("Invalid background");return e}function er(e){let n=_c(e.main),t=_c(e.accent),r=Gt(e.radius,0,48),o=Gt(e.blur,0,40),s=Gt(e.tint,2,60),i={...Tc(n,t,e.mode,s),"primary-color":n,"accent-color":t,"ha-card-border-radius":`${r}px`,"ha-card-backdrop-filter":`blur(${o}px)`},a=Gt(e.menu??0,0,Xt);if(a>0){let c=Number((1-a/100).toFixed(2));i["app-header-background-color"]=fe(ne(n),c),i["sidebar-background-color"]=fe(ne(i["sidebar-background-color"]),c)}let d=e.background;return d&&d.kind!=="none"&&(i["lovelace-background"]=`center / cover no-repeat fixed url('${hb(d.value,d.kind)}')`),i}var mb=3;function Mc(e){if(!Vo.test(e.main)||!Vo.test(e.accent))return[];let n=ne(e.main),t=ne(e.accent),{glass:r}=qt(e.main,e.mode,Gt(e.tint,2,60));return[{id:"main-card",ratio:Me(n,r)},{id:"accent-card",ratio:Me(t,r)}].filter(s=>s.ratio<mb).map(s=>({id:s.id,ratio:Number(s.ratio.toFixed(2))}))}var fb=/^[A-Za-z0-9_-]{1,80}$/,gb=new Set(["__proto__","constructor","prototype","tostring","hasownproperty","valueof","__definegetter__","__definesetter__","__lookupgetter__","__lookupsetter__","isprototypeof","propertyisenumerable","tolocalestring"]),bb=["javascript:","vbscript:","@import","expression(","behavior:","-moz-binding","image-set(","imageset(","src(","<","&#"],yb=/&[a-z#]/i,vb=/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/,wb=/\/\*[\s\S]*?\*\//g,Cc=/[\p{Z}\p{C}\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\u3164\u1160\u180e\u00ad\ufe00-\ufe0f]/gu,xb=/!\s*important\s*$/i,kb="lovelace-background";function Pc(e){let n=e.toLowerCase();return n.startsWith("card-mod-")||n.startsWith("uix-")}function $b(e,n){let t=e;for(let r=0;r<4;r+=1){let o=t.replace(xb,"").trimEnd(),s=Pc(n)?o:o.replace(/;+\s*$/,"").trimEnd();if(s===t)break;t=s}return t}function Eb(e){return e.replace(Cc,"").normalize("NFKC").replace(wb,"").replace(Cc,"").toLowerCase()}function Rc(e,n){if(!fb.test(e)||gb.has(e.toLowerCase()))return"skip";if(e===kb)return"background";let t=$b(n,e);if(!t||n.includes("\0")||vb.test(n)||t.includes("\\"))return"skip";let r=Eb(t);return bb.some(o=>r.includes(o))||yb.test(r)?"skip":r.includes("url(")?"background":!Pc(e)&&/[{};]/.test(r)?"skip":"ok"}var gt={main:"#03a9f4",accent:"#ff9800",radius:12,blur:10,tint:30,mode:"dark"},Tb=["dark","light"],_b=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,Sb=/^#([0-9a-f]{6})([0-9a-f]{2})?$/i,Ab=/^rgba?\(\s*([^)]*?)\s*\)$/i,Mb=/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i,Cb=/blur\(\s*(\d*\.?\d+)\s*(px|rem|em)?\s*\)/i,Oc=16,Pb=300,mt="ha-card-background",Rb=4096;function Ke(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ft(e,n,t){return Math.min(t,Math.max(n,e))}function Lb(e){let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n);return Number.isFinite(t)?ft(Math.round(t),0,255):null}function Ob(e){if(e===void 0)return;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?ft(t,0,1):null}function Pe(e){if(typeof e!="string")return null;let n=e.trim(),t=_b.exec(n);if(t)return{hex:`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toLowerCase(),alpha:void 0};let r=Sb.exec(n);if(r)return{hex:`#${r[1]}`.toLowerCase(),alpha:r[2]?parseInt(r[2],16)/255:void 0};let o=Ab.exec(n);if(!o)return null;let s=o[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);if(s.length<3||s.length>4)return null;let i=s.slice(0,3).map(Lb),a=Ob(s[3]);return i.some(d=>d===null)||a===null?null:{hex:D(i),alpha:a}}function Db(e){return typeof e=="string"?e:typeof e=="number"&&Number.isFinite(e)?String(e):null}function Ib(e,n){if(!Ke(e)||!Ke(e.modes))return{};let t=e.modes[n];return Ke(t)?t:{}}function Hb(e,n){let t=Db(n),r=t===null||t.length>Rb?"skip":Rc(e,t);return{text:t,verdict:r}}function tr(e,n){let t={},r=new Map;if(!Ke(e))return{vars:t,skipped:0,skippedKeys:[],wallpaper:0,wallpaperKeys:[]};for(let i of[e,Ib(e,n)])for(let[a,d]of Object.entries(i)){if(a==="modes")continue;let{text:c,verdict:m}=Hb(a,d);r.set(a,m),m==="ok"?t[a]=c:delete t[a]}let o=[...r].filter(([,i])=>i==="skip").map(([i])=>i),s=[...r].filter(([,i])=>i==="background").map(([i])=>i);return{vars:t,skipped:o.length,skippedKeys:o,wallpaper:s.length,wallpaperKeys:s}}function qo(e,n){return tr(e,n).vars}function Go(e){return!Ke(e)||!Ke(e.modes)?[]:Tb.filter(n=>Ke(e.modes[n]))}function Nb(e){let n=e===void 0?null:Mb.exec(e.trim());if(!n)return null;let t=(n[2]??"px").toLowerCase();return parseFloat(n[1])*(t==="px"?1:Oc)}function Fb(e){for(let n of["ha-card-backdrop-filter","backdrop-filter"]){let t=Cb.exec(e[n]??"");if(t)return parseFloat(t[1])*((t[2]??"px").toLowerCase()==="px"?1:Oc)}return null}function Bb(e){for(let n of["ha-card-background","card-background-color"]){let t=Pe(e[n])?.alpha;if(t!==void 0)return t}return null}function Ub(e){let n=Pe(e[Wo[0]])?.alpha,t=n===void 0?0:ft(Math.round((1-n)*100),0,Xt);return t>0?{menu:t}:{}}function jb(e,n){let t=Go(e);return t.length===1?t[0]:n}function zb(e,n,t){let r=n==="light"?(e-.4)*100:e*100,o=ft(Math.round(r),2,60);return $c(o,Wt(t,n))}function Dc(e,n,t){let r=jb(e,n),o=qo(e,r),s=Pe(o["primary-color"])?.hex??t.main,i=Pe(o["accent-color"])?.hex??t.accent,a=Nb(o["ha-card-border-radius"]),d=Fb(o),c=Bb(o);return{main:s,accent:i,mode:r,radius:a===null?t.radius:Math.round(ft(a,0,48)),blur:d===null?t.blur:Math.round(ft(d,0,40)),tint:c===null?t.tint:zb(c,r,s),...Ub(o)}}function Kb(e,n,t,r){let o=qo(e,n);for(let[s,i]of Object.entries(r))t[s]!==i&&(o[s]=i);return o}function Vb(e,n){return{main:e.main,accent:e.accent,radius:e.radius,blur:e.blur,tint:Qn(e.tint,Wt(e.main,n)),menu:e.menu,background:{kind:"none"},mode:n}}function Lc(e,n,t,r,o){let s=Pe(e[t])?.hex;s&&o!==void 0&&(n[r]=fe(ne(s),o))}function Ic(e,n,t){let r=er(t);if(!e)return r;let o=Vb(n,t.mode),s=er(o),i=Kb(e,t.mode,s,er({...t,tint:o.tint})),a=qo(e,t.mode);if(r[mt]!==s[mt]){let d=[mt,"card-background-color"].find(c=>Pe(a[c]))??mt;Lc(a,i,d,mt,Pe(r[mt])?.alpha)}for(let d of Wo)r[d]!==s[d]&&Lc(a,i,d,d,Pe(r[d])?.alpha);return i}function nr(e){return Object.keys(e).length>Pb}var rr={button:"Advanced",withDraft:"Open the full HATS designer. Your draft values travel in the address fragment; HATS must treat them as untrusted input.",plain:"Open the full HATS designer."};var Wb=700,qb=2048,Gb=200,Hc=/^#[0-9a-fA-F]{6}$/,Xb={radius:[0,48],blur:[0,40],tint:[0,100]},Yb=3e4,or={available:!1,path:null},Nc=new WeakMap;function Fc(e){return typeof e!="string"||e.length===0||e.length>Gb||!e.startsWith("/")||e.startsWith("//")||e.includes("\\")||e.includes("#")||e.includes("?")?!1:/^[\x21-\x7e]+$/.test(e)}function Xo(e,n){let[t,r]=Xb[n];return typeof e=="number"&&Number.isFinite(e)&&e>=t&&e<=r}function Bc(e){let n=e;return!n||typeof n.main!="string"||typeof n.accent!="string"||!Hc.test(n.main)||!Hc.test(n.accent)||!Xo(n.radius,"radius")||!Xo(n.blur,"blur")||!Xo(n.tint,"tint")?null:{main:n.main.toLowerCase(),accent:n.accent.toLowerCase(),radius:Math.round(n.radius),blur:Math.round(n.blur),tint:Math.round(n.tint)}}function Zb(e){let n=Bc(e);if(!n)return null;let t=JSON.stringify(n),r=btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");return`#lite=${r}`.length>qb?null:`#lite=${r}`}function Jb(e,n){return Fc(e)?e+(Zb(n)??""):null}function Qb(e,n,t=window){let r=Jb(e,n);return r?(t.innerWidth<Wb?t.location.assign(r):t.open(r,"_blank","noopener"),!0):!1}function ey(e,n){return Object.keys(e).every(r=>e[r]===n[r])?null:e}function Uc(e){let n={main:e.main,accent:e.accent,radius:e.radius,blur:e.glassBlur,tint:e.tint};return ey(n,e.baseControls)}function ty(e){return typeof e=="object"&&e!==null&&e.code==="unknown_command"}function ny(e){let n=Nc.get(e.connection);if(n&&(n.failedAt===null||Date.now()-n.failedAt<Yb))return n.pending;let t={pending:Promise.resolve(or),failedAt:null};return t.pending=M(e,{type:"hats_lite/advanced_info"}).then(r=>r&&r.available===!0&&Fc(r.path)?{available:!0,path:r.path}:(t.failedAt=Date.now(),or),r=>(ty(r)||(t.failedAt=Date.now()),or)),Nc.set(e.connection,t),t.pending}var Yo=class extends A{constructor(){super(...arguments);this.info=or;this.onFocus=()=>{this.info.available||this.ask()}}static{this.properties={hass:{attribute:!1},draft:{attribute:!1},info:{state:!0}}}static{this.styles=T`
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
  `}connectedCallback(){super.connectedCallback(),window.addEventListener("focus",this.onFocus)}disconnectedCallback(){window.removeEventListener("focus",this.onFocus),super.disconnectedCallback()}ask(){let t=this.hass,r=t?.connection;!t||!r||(this.asked=r,ny(t).then(o=>{this.asked===r&&(this.info=o)}))}willUpdate(){this.hass?.connection&&this.asked!==this.hass.connection&&this.ask()}render(){let t=this.info.available?this.info.path:null;if(!t)return u;let r=Bc(this.draft)!==null;return l`<button type="button" data-action="advanced"
      title=${r?rr.withDraft:rr.plain}
      @click=${()=>Qb(t,this.draft)}>${rr.button}</button>`}};customElements.get("hats-lite-advanced")||customElements.define("hats-lite-advanced",Yo);var y={baseLabel:"Start from",baseDefault:"Home Assistant",themeHint:"Only installed themes are listed. Install more from the Gallery.",baseTooLarge:"This theme has too many variables (300 at most, counting the base plus the Designer keys). Pick another base.",baseMissing:"The base theme is no longer installed. The Designer went back to Home Assistant.",baseSkipped:"{count} variables of the base theme were left out because they cannot be saved safely.",wallpaperOne:"1 wallpaper entry was removed.",wallpaperMany:"{count} wallpaper entries were removed.",valueRejected:"Some values were rejected as unsafe. Pick another base or change the values.",colors:"Colors",glance:"At a glance",onDashboard:"On your dashboard",shape:"Shape and glass",draftName:"Designer draft",mainColor:"Main color",accentColor:"Accent color",radius:"Corner radius",blur:"Glass blur",tint:"Card tint",menu:"Menu transparency",mode:"Mode",modeDark:"Dark",modeLight:"Light",background:"Background",backgroundNone:"None",uploadLabel:"Upload a background image",uploadHint:"PNG, JPEG, WebP or GIF, up to 8 MiB",uploading:"Uploading...",uploadAdminOnly:"Only administrators can upload backgrounds.",uploadTooLarge:"Pick an image up to 8 MiB.",uploadType:"Pick a PNG, JPEG, WebP or GIF image.",uploadFailed:"Upload failed. The previous background is kept.",invalidColor:"Pick a valid color",invalidBackground:"This background is not allowed",backgroundTooLong:"This background address is too long (2000 characters at most).",restartReminder:"This theme uses an uploaded background. Backgrounds need a Home Assistant restart before they are served.",invalidInput:"Some values are not valid",saveTitle:"Save as theme",saveAdminOnly:"Only administrators can save themes.",nameLabel:"Theme name",nameInvalid:"Use 1 to 60 letters, digits, spaces, hyphens or underscores, starting with a letter or digit",saveButton:"Save as theme",saving:"Saving...",saved:"Theme saved",saveFailed:"Could not save the theme.",nameReserved:"This name is reserved. Pick another name.",nameIsBase:"This is an installed theme. Give your copy a new name.",nameExists:"A theme with this name already exists. Pick another name.",formatInvalid:"The theme could not be written in a valid format.",overwrote:"Saved. An existing theme with this name was replaced.",needsRestart:"Background uploaded. Backgrounds need a Home Assistant restart before they are served.",warnMainCard:"The main color is hard to see on cards (contrast {ratio}:1, 3:1 recommended).",warnAccentCard:"The accent color is hard to see on cards (contrast {ratio}:1, 3:1 recommended)."};var ry=/\bdo not (use|modify)\b/i;function oy(e){return typeof e=="string"&&ry.test(e)}function re(e,n){return e.filter(t=>!oy(t)||t===n)}function jc(e){let n=e?.themes?.themes;return!n||typeof n!="object"?[]:Object.keys(n).sort((t,r)=>t.localeCompare(r))}function zc(e,n,t){return l`
    <label class="field base">
      <span>${y.baseLabel}</span>
      <select class="pill" data-field="base" aria-describedby="base-hint" @change=${t}>
        <option value="" .selected=${n===""}>${y.baseDefault}</option>
        ${re(e,n).map(r=>l`<option value=${r} .selected=${n===r}>${r}</option>`)}
      </select>
    </label>
    <p class="hint" id="base-hint">${y.themeHint}</p>
  `}function Zo(e,n){if(!n)return;let t=e?.themes?.themes?.[n];if(t==null)throw new Error("Base theme missing");return t}function sr(e,n){return n!==""&&!e?.themes?.themes?.[n]}function Jo(e){let n=Go(e);return n.length?n:["dark","light"]}function Kc(e,n,t){if(!n||sr(e,n))return 0;let r=e?.themes?.themes?.[n],o=new Set;for(let s of Jo(r))tr(r,s).skippedKeys.forEach(i=>o.add(i));return o.size}function Vc(e,n){if(!n||sr(e,n))return 0;let t=e?.themes?.themes?.[n],r=new Set;for(let o of Jo(t))tr(t,o).wallpaperKeys.forEach(s=>r.add(s));return r.size}function Wc(e,n){let t=e?Jo(e):["dark","light"],r={};for(let o of t){let s=n(o);if(nr(s))throw new Error("Too many variables");r[o]=s}return{variables:r[t[0]],modes:r}}function qc(e,n,t){let r=n?e?.themes?.themes?.[n]:void 0;return r?{base:n,controls:Dc(r,t,gt)}:{base:"",controls:gt}}async function Gc(e){try{let n=await M(e,{type:ro});return Array.isArray(n?.names)?n.names.filter(t=>typeof t=="string"):[]}catch{return[]}}function Qo(e,n){return e!==""&&n.includes(e)?e:""}function Xc(e,n,t){return n===""||t.includes(n)?null:e.toLowerCase()===n.toLowerCase()?y.nameIsBase:null}function Yc(e,n,t,r,o=0){return l`
    ${e?l`<p class="hint" data-notice="base">${e}</p>`:u}
    ${n>0?l`<p class="hint" data-notice="skipped">${y.baseSkipped.replace("{count}",String(n))}</p>`:u}
    ${o>0?l`<p class="hint" data-notice="wallpaper">${o===1?y.wallpaperOne:y.wallpaperMany.replace("{count}",String(o))}</p>`:u}
    ${t===""&&r?l`<p class="error" role="alert">${r}</p>`:u}
  `}function Zc(e,n){return l`
    <section class="group">
      <h3>${y.mode}</h3>
      <div class="seg" role="group" aria-label=${y.mode}>
        ${["dark","light"].map(t=>l`<button type="button" data-field="mode" data-mode=${t}
            aria-pressed=${String(e===t)}
            @click=${()=>n(t)}>${t==="dark"?y.modeDark:y.modeLight}</button>`)}
      </div>
    </section>
  `}function es(e){return l`
    <label class="range">
      <span class="range-head">
        <span>${e.label}</span>
        <span class="range-value" data-readout=${e.field}>${e.readout}</span>
      </span>
      <input type="range" min=${e.min} max=${e.max} step="1" data-field=${e.field}
        .value=${String(e.value)}
        @input=${e.onInput} />
    </label>
  `}function Jc(e,n,t,r){return l`
    <label class="color-row">
      <input type="color" data-field=${e} .value=${t} @input=${r} />
      <span class="color-text">
        <span>${n}</span>
        <span class="hex" data-readout=${e}>${t}</span>
      </span>
    </label>
  `}function Qc(e){return l`
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
    ${e.error?l`<p class="error" role="alert">${e.error}</p>`:u}
    ${e.notice?l`<p class="hint" role="status" data-notice="restart">${e.notice}</p>`:u}
  `}function eu(e){return l`
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
            role=${e.failed?"alert":"status"}>${e.message}</span>`:u}
    </div>
  `}function tu(e,n,t,r,o){return l`<div class="choices">
    <button type="button" class="chip-btn" data-action="background-none"
      aria-pressed=${String(e==="none")} @click=${()=>o({kind:"none"})}>${r}</button>
    ${t.map(s=>l`<button type="button" class="chip-btn"
        aria-pressed=${String(e==="preset"&&n===s.value)}
        @click=${()=>o({kind:"preset",value:s.value})}>${s.label}</button>`)}
  </div>`}var nu=[V,W,T`
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
`,mc];function ts(e,n){if(e&&typeof e=="object"&&"message"in e){let t=e.message;if(typeof t=="string"&&t.length>0)return t}return n}function ru(e){return e.size>8388608?y.uploadTooLarge:_i.includes(e.type)?null:y.uploadType}function iy(e,n){let t={method:"POST",body:n};if(typeof e.fetchWithAuth=="function")return e.fetchWithAuth(Wr,t);let r=e.auth?.data?.access_token??"";return fetch(Wr,{...t,headers:{Authorization:`Bearer ${r}`}})}async function ou(e,n){let t=new FormData;t.append("file",n);let r,o;try{r=await iy(e,t),o=await r.json().catch(()=>({}))}catch{return{error:y.uploadFailed}}if(!r.ok)return{error:ts(o,y.uploadFailed)};let{url:s,needs_restart:i}=o;return Ac(s)?{url:s,needsRestart:i===!0}:{error:y.uploadFailed}}var ay=/^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/,ly={"main-card":y.warnMainCard,"accent-card":y.warnAccentCard};function su(e){return e.toLowerCase()==="default"?y.nameReserved:ay.test(e)?null:y.nameInvalid}function iu(e){let n=e&&typeof e=="object"?e.code:void 0;return n==="name_exists"?y.nameExists:n==="reserved_name"?y.nameReserved:n==="invalid_format"?y.formatInvalid:n==="invalid_value"?y.valueRejected:ts(e,y.saveFailed)}function au(e){return e&&typeof e=="object"&&e.overwrote===!0?y.overwrote:y.saved}function lu(e){return Mc(e).map(n=>ly[n.id].replace("{ratio}",n.ratio.toFixed(1)))}function ns(e){let n=e instanceof Error?e.message:"";return n==="Invalid color"?{field:"color",message:y.invalidColor}:n==="Invalid background"?{field:"background",message:y.invalidBackground}:n==="Background too long"?{field:"background",message:y.backgroundTooLong}:n==="Base theme missing"?{field:"",message:y.baseMissing}:n==="Too many variables"?{field:"",message:y.baseTooLarge}:{field:"color",message:y.invalidInput}}function du(e,n){return n.kind==="upload"?`${e} ${y.restartReminder}`:e}var dy=[],cy=["tablet","mode"],uy=["base","main","accent","radius","glassBlur","tint","menu","mode","background"],py={radius:{label:y.radius,min:0,max:48,unit:"px"},glassBlur:{label:y.blur,min:0,max:40,unit:"px"},menu:{label:y.menu,min:0,max:Xt,unit:"%"}},rs=class extends A{constructor(){super(...arguments);this.dragOver=!1;this.base="";this.baseControls=gt;this.main="#03a9f4";this.accent="#ff9800";this.radius=12;this.glassBlur=10;this.tint=30;this.menu=0;this.mode="dark";this.background={kind:"none"};this.errorField="";this.errorMessage="";this.themeName="";this.localNames=[];this.localLoaded=!1;this.uploading=!1;this.uploadError="";this.uploadNotice="";this.saving=!1;this.saveMessage="";this.saveFailed=!1;this.baseNotice=""}static{this.properties={hass:{attribute:!1},base:{state:!0},main:{state:!0},accent:{state:!0},radius:{state:!0},glassBlur:{state:!0},tint:{state:!0},menu:{state:!0},mode:{state:!0},background:{state:!0},candidate:{state:!0},errorField:{state:!0},errorMessage:{state:!0},themeName:{state:!0},uploading:{state:!0},uploadError:{state:!0},uploadNotice:{state:!0},saving:{state:!0},saveMessage:{state:!0},saveFailed:{state:!0},baseNotice:{state:!0},dragOver:{state:!0}}}static{this.styles=nu}willUpdate(t){if(this.hass&&!this.localLoaded&&this.loadLocalNames(this.hass),sr(this.hass,this.base)){this.base="",this.baseControls=gt,this.baseNotice=y.baseMissing,this.rebuild();return}(!this.candidate||uy.some(r=>t.has(r)))&&this.rebuild()}render(){let t=this.hass?.user?.is_admin===!0;return l`
      <div class="layout">
        <div class="controls">
          <hats-lite-advanced .hass=${this.hass} .draft=${Uc(this)}></hats-lite-advanced>
          ${zc(jc(this.hass),this.base,r=>this.onBase(r))}
          ${Yc(this.baseNotice,Kc(this.hass,this.base,this.mode),this.errorField,this.errorMessage,Vc(this.hass,this.base))}
          <section class="group">
            <h3>${y.colors}</h3>
            ${this.renderColor("main",y.mainColor)}
            ${this.renderColor("accent",y.accentColor)}
            ${this.errorField==="color"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${this.warnings().map(r=>l`<p class="hint" data-warning>${r}</p>`)}
          </section>
          <section class="group">
            <h3>${y.shape}</h3>
            ${["radius","glassBlur"].map(r=>this.renderSlider(r))}
            ${this.renderTint()}
            ${this.renderSlider("menu")}
          </section>
          <section class="group">
            <h3>${y.background}</h3>
            ${tu(this.background.kind,this.background.value,dy,y.backgroundNone,r=>this.setBackground(r))}
            ${this.errorField==="background"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${t?this.renderUpload():l`<p class="hint">${y.uploadAdminOnly}</p>`}
          </section>
          ${Zc(this.mode,r=>this.setMode(r))}
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
            .hideControls=${cy}
            .defaultCompare=${!1}
            @hats-lite-mode-change=${r=>this.onPreviewMode(r)}
          ></hats-lite-preview>
        </div>
      </div>
    `}renderColor(t,r){return Jc(t,r,this[t],o=>this.setText(t,o))}renderSlider(t){let r=py[t];return es({label:r.label,readout:`${this[t]}${r.unit}`,field:t,min:r.min,max:r.max,value:this[t],onInput:o=>this.setNumber(t,o)})}renderTint(){let t=Ec(this.main,this.mode,this.tintValue(this.mode));return es({label:y.tint,readout:`${t}%`,field:"tint",min:0,max:100,value:this.tint,onInput:r=>this.setTint(r)})}tintValue(t){return Qn(this.tint,Wt(this.main,t))}setTint(t){this.tint=Number(t.target.value)}renderUpload(){return Qc({over:this.dragOver,uploading:this.uploading,error:this.uploadError,notice:this.uploadNotice,onPick:()=>this.fileInput()?.click(),onDragOver:t=>{t.preventDefault(),this.dragOver=!0},onDragLeave:()=>{this.dragOver=!1},onDrop:t=>{t.preventDefault(),this.dragOver=!1;let r=t.dataTransfer?.files?.[0];r&&this.handleFile(r,null)},onFile:t=>this.onFile(t)})}renderSave(){return eu({name:this.themeName,saving:this.saving,message:this.saveMessage,failed:this.saveFailed,onName:t=>this.setName(t),onSave:()=>this.onSave()})}designerInput(t){return{main:this.main,accent:this.accent,radius:this.radius,blur:this.glassBlur,tint:this.tintValue(t),menu:this.menu,background:this.background,mode:t}}finalVars(t){let r=Zo(this.hass,this.base),o=Ic(r,this.baseControls,this.designerInput(t));if(nr(o))throw new Error("Too many variables");return o}warnings(){return lu(this.designerInput(this.mode))}async loadLocalNames(t){this.localLoaded=!0,this.localNames=await Gc(t),this.themeName||(this.themeName=Qo(this.base,this.localNames))}rebuild(){try{let t=this.finalVars(this.mode);this.candidate={name:y.draftName,vars:t,installed:!1,canApply:!1},this.errorField="",this.errorMessage=""}catch(t){let r=ns(t);this.errorField=r.field,this.errorMessage=r.message}}buildModes(){try{return Wc(Zo(this.hass,this.base),t=>this.finalVars(t))}catch(t){this.saveFailed=!0,this.saveMessage=ns(t).message;return}}onBase(t){let r=t.target.value,o=qc(this.hass,r,this.mode),s=o.controls;this.base=o.base,this.baseNotice="",this.baseControls=s,this.main=s.main,this.accent=s.accent,this.radius=s.radius,this.glassBlur=s.blur,this.tint=s.tint,this.menu=s.menu??0,this.mode=s.mode,this.background={kind:"none"},this.uploadNotice="",this.saveMessage="",this.themeName=Qo(this.base,this.localNames)}setText(t,r){this[t]=r.target.value}setNumber(t,r){this[t]=Number(r.target.value)}onPreviewMode(t){let r=t.detail?.mode;(r==="dark"||r==="light")&&(this.mode=r)}setMode(t){this.mode=t}fileInput(){return this.renderRoot.querySelector('input[type="file"]')}setBackground(t){this.background=t,this.uploadNotice=""}setName(t){this.themeName=t.target.value}async onFile(t){let r=t.target,o=r.files?.[0];o&&await this.handleFile(o,r)}async handleFile(t,r){let o=this.hass;if(!o||this.uploading)return;let s=ru(t);if(s){this.uploadError=s,r&&(r.value="");return}this.uploading=!0,this.uploadError="",this.uploadNotice="";try{let i=await ou(o,t);"error"in i?this.uploadError=i.error:(this.background={kind:"upload",value:i.url},i.needsRestart&&(this.uploadNotice=y.needsRestart))}finally{this.uploading=!1,r&&(r.value="")}}async onSave(){let t=this.hass;if(!t)return;let r=this.themeName.trim(),o=su(r)??Xc(r,this.base,this.localNames);if(o){this.saveFailed=!0,this.saveMessage=o;return}let s=this.buildModes();if(s){this.saving=!0,this.saveMessage="";try{let i=await M(t,{type:"hats_lite/save_theme",name:r,variables:s.variables,modes:s.modes});this.dispatchEvent(new CustomEvent(Ei,{bubbles:!0,composed:!0,detail:{name:r}})),this.saveFailed=!1,this.localNames.includes(r)||(this.localNames=[...this.localNames,r]),this.saveMessage=du(au(i),this.background)}catch(i){this.saveFailed=!0,this.saveMessage=iu(i)}finally{this.saving=!1}}}};customElements.get("hats-lite-designer")||customElements.define("hats-lite-designer",rs);function G(e){let n=e&&typeof e=="object"?e.code:void 0;return typeof n=="string"?n:"unknown"}var ge="hats_lite/";async function os(e){let n=await M(e,{type:`${ge}people`});return Array.isArray(n?.people)?n.people:[]}function cu(e,n){let t={type:`${ge}assign`,user_id:n.user_id,theme:n.theme};return n.dark!==void 0&&(t.dark=n.dark),n.ends!==void 0&&n.ends!==null&&(t.ends=n.ends),M(e,t)}function uu(e,n){return M(e,{type:`${ge}unassign`,override_id:n})}function pu(e,n){return M(e,{type:`${ge}set_opt_out`,opt_out:n})}function hu(e,n,t){return M(e,{type:`${ge}set_birthday`,user_id:n,...t})}function mu(e,n){return M(e,{type:`${ge}set_birthday`,user_id:n,clear:!0})}async function fu(e){let n=await M(e,{type:`${ge}holidays_list`});return Array.isArray(n?.holidays)?n.holidays:[]}async function gu(e,n){let t=await M(e,{type:`${ge}holidays_set`,holidays:n});return Array.isArray(t?.holidays)?t.holidays:n}function bu(e,n){return M(e,{type:`${ge}assigners_set`,user_ids:n})}async function yu(e){try{return await os(e),!0}catch(n){return G(n)!=="unknown_command"}}function ir(){window.hatsLite?.refreshEffective?.()}function ar(e){return{dark:void 0,primaryColor:void 0,accentColor:void 0,...e}}var bt=[31,29,31,30,31,30,31,31,30,31,30,31];function dr(e,n){return!Number.isInteger(e)||!Number.isInteger(n)||e<1||e>12?!1:n>=1&&n<=bt[e-1]}function ss(e){let n=e.name.trim();return n.length===0||n.length>60?"name":!dr(e.month_start,e.day_start)||!dr(e.month_end,e.day_end)?"date":e.theme.length===0?"theme":null}function hy(e,n){if(n)try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,year:"numeric",month:"numeric",day:"numeric"}).formatToParts(e),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("year"),r("month"),r("day")]}catch{return[e.getFullYear(),e.getMonth()+1,e.getDate()]}return[e.getFullYear(),e.getMonth()+1,e.getDate()]}function my(e){return e.month_start*32+e.day_start>e.month_end*32+e.day_end}function vu(e,n=new Date,t){let[r,o,s]=hy(n,t),i=r*1e4+o*100+s,a=my(e)?1:0;for(let d of[r-1,r,r+1])if((d+a)*1e4+e.month_end*100+e.day_end>=i)return d;return r+1}function wu(e,n){return!Number.isFinite(e)||e<=n||e>n+31622400?"invalid_range":null}function fy(e,n,t,r){let o=n*32+t,s=e.month_start*32+e.day_start,i=e.month_end*32+e.day_end,a=e.year!==void 0&&r!==void 0;return s<=i?o>=s&&o<=i&&(!a||r===e.year):a?o>=s&&r===e.year||o<=i&&r===e.year+1:o>=s||o<=i}function is(e,n,t){if(e.enabled===!1||ss(e)==="date")return[];let r=[],o=null;for(let s=1;s<=bt[n-1];s+=1)fy(e,n,s,t)?o?o.to=s:(o={from:s,to:s},r.push(o)):o=null;return r}var Re=e=>String(e).padStart(2,"0");function xu(e,n){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"}).formatToParts(new Date(e)),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("year"),r("month"),r("day"),r("hour"),r("minute")]}catch{return null}}function lr(e,n){let t=xu(e,n);return t?Date.UTC(t[0],t[1]-1,t[2],t[3],t[4])-Math.floor(e/6e4)*6e4:null}function ku(e,n){let t=Date.parse(`${e}Z`);if(!n||Number.isNaN(t))return Date.parse(e)/1e3;let r=864e5,o=lr(t-r,n),s=lr(t+r,n);if(o===null||s===null)return Date.parse(e)/1e3;let i=t-o;if(lr(i,n)===o)return i/1e3;let a=t-s;return lr(a,n)===s?a/1e3:i/1e3}function as(e,n){let t=n?xu(e*1e3,n):null;if(t)return`${String(t[0]).padStart(4,"0")}-${Re(t[1])}-${Re(t[2])}T${Re(t[3])}:${Re(t[4])}`;let r=new Date(e*1e3);return`${r.getFullYear()}-${Re(r.getMonth()+1)}-${Re(r.getDate())}T${Re(r.getHours())}:${Re(r.getMinutes())}`}var Yt=[V,W,T`
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
`],$u=[V,W,T`
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
`];var h={title:"People",intro:"Choose who gets which theme, and when.",loading:"Loading people...",loadFailed:"Could not load the people list.",retry:"Try again",you:"You",admin:"Admin",optedOutChip:"Opted out",optOutLabel:"Do not let others change my theme",optOutOn:"Others can no longer change your theme.",optOutOff:"Others can change your theme again.",optOutShortcut:"Opt out",noOverride:"Using their own theme",setBy:e=>e?`Set by ${e}`:"Set by an administrator",overrideLine:e=>`Theme ${e}`,until:e=>`until ${e}`,noEnd:"until removed",assign:"Assign theme",startsNow:"This theme starts immediately and stays until the end time below.",unassign:"Remove",birthday:"Birthday",close:"Close",cancel:"Cancel",save:"Save",saving:"Saving...",assignTitle:e=>`Assign a theme to ${e}`,theme:"Theme",defaultTheme:"default",defaultThemeLabel:"Home Assistant",themeHint:"Only installed themes are listed. Install more from the Gallery.",mode:"Mode",modeAuto:"Auto",modeDark:"Dark",modeLight:"Light",duration:"Until",untilNone:"Until removed",untilDate:"Until a date and time",untilInput:"End date and time",assigned:"Theme assigned.",selfApplied:"That is your own account, so the theme was applied to you directly.",unassigned:"Assignment removed.",birthdayTitle:e=>`Birthday for ${e}`,month:"Month",day:"Day",clear:"Clear birthday",birthdaySaved:"Birthday saved.",birthdayCleared:"Birthday cleared.",holidays:"Holidays",holidaysIntro:"Each holiday switches everyone to its theme during the range.",holidaysEmpty:"No holidays yet.",editHolidays:"Edit holidays",holidayEditorTitle:"Holidays and events",holidayName:"Name",holidayStart:"Starts",holidayEnd:"Ends",holidayEnabled:"Enabled",holidayRemove:"Remove",holidayEdit:"Edit",holidayAdd:"Add holiday",eventAdd:"Add event",holidayKind:"Holiday",eventKind:"Event",eventName:"Event name",eventNamePlaceholder:"For example, Anna's birthday",eventYearly:"Repeat every year",holidayNewTitle:"New holiday",eventNewTitle:"New event",holidayEditTitle:e=>`Edit ${e}`,holidayListLabel:"Holidays and events",holidayOff:"off",holidayPreset:"Preset",holidayPresetPick:"Choose a preset",holidayBack:"Back to list",holidaysSaved:"Holidays saved.",timeline:"Next 12 months",holidayRowLabel:(e,n)=>`${n}: ${e}`,timelineHoliday:(e,n)=>`${e}, ${n}`,problemName:"Enter a name of up to 60 characters.",problemDate:"This date does not exist in that month.",problemTheme:"Choose a theme.",problemUntil:"Pick a time in the future, within 366 days.",assigners:"Assigners",assignersTitle:"Who may assign themes",assignersHelp:"Assigners can set the theme of other non-admin users. Saving replaces the whole list.",assignersEmpty:"There are no non-admin users.",assignersSaved:"Assigners saved.",months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],errors:{unauthorized:"You are not allowed to do that.",invalid_user:"That user is no longer available.",unknown_theme:"That theme is not installed.",invalid_range:"That date range is not allowed.",limit_reached:"A limit was reached. Remove something and try again.",invalid_request:"The server did not accept those values.",not_found:"That item no longer exists.",save_failed:"The change could not be saved. Try again.",unknown_command:"This server does not support the People tab.",not_loaded:"The server is still starting. Try again in a moment.",rate_limited:"Too many requests. Wait a moment and try again.",invalid_format:"Those values are not in a valid format.",unknown:"Something went wrong. Try again."},missingTheme:e=>`missing: ${e}`,holidaysLoadFailed:"Could not load the holidays. Editing is off until they load.",unknownCode:e=>`Something went wrong (${e}). Try again.`,optedOut:e=>`${e} chose not to have their theme changed.`};function yt(e,n){if(e==="opted_out")return h.optedOut(n??"This person");let t=h.errors[e];return t||(e==="unknown"?h.errors.unknown:h.unknownCode(e))}function K(e){return e===h.defaultTheme?h.defaultThemeLabel:e}function Zt(e){return Object.keys(e?.themes?.themes??{}).sort()}function Eu(e){return e?.config?.time_zone||void 0}var by='button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',ls=class extends A{constructor(){super(...arguments);this.heading="";this.busy=!1;this.onKey=t=>{if(t.key==="Escape"){if(t.stopPropagation(),this.busy)return;this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}));return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=this.getRootNode().activeElement,s=t.shiftKey?r[0]:r[r.length-1];(o===s||!o||!this.contains(o))&&(t.preventDefault(),(t.shiftKey?r[r.length-1]:r[0]).focus())}}static{this.properties={heading:{type:String},busy:{type:Boolean}}}static{this.styles=Yt}firstUpdated(){this.focusables()[0]?.focus()}focusables(){return[...this.querySelectorAll(by)].filter(t=>!t.disabled)}render(){return l`
      <div class="backdrop">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="title" @keydown=${this.onKey}>
          <h2 id="title">${this.heading}</h2>
          <slot></slot>
        </div>
      </div>
    `}},oe=class extends A{constructor(){super(...arguments);this.themes=[];this.installed=[];this.busy=!1;this.error=""}static{this.properties={hass:{attribute:!1},themes:{attribute:!1},installed:{attribute:!1},busy:{state:!0},error:{state:!0}}}static{this.styles=Yt}done(t){this.dispatchEvent(new CustomEvent("people-done",{detail:t,bubbles:!0,composed:!0}))}close(){this.busy||this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}))}async run(t,r){if(!(this.busy||!this.hass)){this.busy=!0,this.error="";try{let o=await t();o&&this.done(o)}catch(o){this.error=yt(G(o),r)}finally{this.busy=!1}}}themeOptions(t){let r=[h.defaultTheme,...re(this.themes,t).filter(s=>s!==h.defaultTheme)],o=r.map(s=>l`<option value=${s} ?selected=${s===t}>${K(s)}</option>`);if(t&&!r.includes(t)){let s=this.installed.includes(t)?K(t):h.missingTheme(t);o.push(l`<option value=${t} selected>${s}</option>`)}return o}renderError(){return this.error?l`<p class="error" role="alert">${this.error}</p>`:u}renderActions(t,r=!1){return l`
      <div class="actions">
        <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${h.cancel}</button>
        <button class="btn primary" type="submit" ?disabled=${this.busy||r}>
          ${this.busy?h.saving:t}
        </button>
      </div>
    `}},ds=class extends oe{constructor(){super(...arguments);this.mode="auto";this.limited=!1;this.until="";this.startsNow=!1;this.theme=h.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(!r)return;let o=this.mode==="auto"?void 0:this.mode==="dark",s=Date.now()/1e3,i=null;if(this.limited&&(i=ku(this.until,this.zone),wu(i,s))){this.error=h.problemUntil;return}this.run(async()=>{if((await cu(this.hass,{user_id:r.id,theme:this.theme,dark:o,ends:i}))?.self){let d=o===void 0?{theme:this.theme}:{theme:this.theme,dark:o};return{message:h.selfApplied,selfApply:ar(d)}}return{message:h.assigned}},r.name)}}static{this.properties={...oe.properties,person:{attribute:!1},mode:{state:!0},limited:{state:!0},until:{state:!0},theme:{state:!0},startsNow:{attribute:!1}}}get zone(){return this.hass?.config?.time_zone||void 0}render(){let t=this.person;if(!t)return u;let r=as(Date.now()/1e3+60,this.zone),o=as(Date.now()/1e3+31622400-3600,this.zone);return l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${h.assignTitle(t.name)}>
        <form @submit=${this.onSubmit}>
          <div class="field">
            <label for="theme">${h.theme}</label>
            <select id="theme" aria-describedby="theme-hint" @change=${s=>this.theme=s.target.value}>
              ${this.themeOptions(this.theme)}
            </select>
            <p class="muted" id="theme-hint">${h.themeHint}</p>
          </div>
          <fieldset>
            <legend>${h.mode}</legend>
            ${["auto","dark","light"].map(s=>l`<label class="choice">
                <input type="radio" name="mode" .checked=${this.mode===s} @change=${()=>this.mode=s} />
                ${s==="auto"?h.modeAuto:s==="dark"?h.modeDark:h.modeLight}
              </label>`)}
          </fieldset>
          ${this.startsNow?l`<p class="muted" id="starts-now" role="note">${h.startsNow}</p>`:u}
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
                    @input=${s=>this.until=s.target.value}
                  />`:u}
          </fieldset>
          ${this.renderError()}${this.renderActions(h.assign)}
        </form>
      </hats-lite-dialog-shell>
    `}},cs=class extends oe{constructor(){super(...arguments);this.month=1;this.day=1;this.theme=h.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(r){if(!dr(this.month,this.day)){this.error=h.problemDate;return}this.run(async()=>(await hu(this.hass,r.id,{month:this.month,day:this.day,theme:this.theme,...this.dark===void 0?{}:{dark:this.dark}}),{message:h.birthdaySaved}),r.name)}};this.onClear=()=>{let t=this.person;t&&this.run(async()=>(await mu(this.hass,t.id),{message:h.birthdayCleared}),t.name)}}static{this.properties={...oe.properties,person:{attribute:!1},month:{state:!0},day:{state:!0}}}willUpdate(t){let r=this.person?.birthday;t.has("person")&&r&&(this.month=r.month,this.day=r.day,this.theme=r.theme,this.dark=r.dark)}render(){let t=this.person;return t?l`
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
                max=${bt[this.month-1]}
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
    `:u}},us=class extends oe{constructor(){super(...arguments);this.candidates=[];this.picked=new Set;this.onSubmit=t=>{t.preventDefault(),this.run(async()=>(await bu(this.hass,[...this.picked]),{message:h.assignersSaved}))}}static{this.properties={...oe.properties,candidates:{attribute:!1},picked:{state:!0}}}willUpdate(t){t.has("candidates")&&(this.picked=new Set(this.candidates.filter(r=>r.is_assigner).map(r=>r.id)))}toggle(t,r){let o=new Set(this.picked);r?o.add(t):o.delete(t),this.picked=o}render(){let t=this.candidates.filter(r=>!r.is_admin);return l`
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
    `}},yy=[["hats-lite-dialog-shell",ls],["hats-lite-assign-dialog",ds],["hats-lite-birthday-dialog",cs],["hats-lite-assigners-dialog",us]];for(let[e,n]of yy)customElements.get(e)||customElements.define(e,n);var ps=[{key:"new-year",name:"New Year",month_start:12,day_start:30,month_end:1,day_end:2},{key:"valentines",name:"Valentine's Day",month_start:2,day_start:13,month_end:2,day_end:14},{key:"st-patricks",name:"St. Patrick's Day",month_start:3,day_start:16,month_end:3,day_end:17},{key:"earth-day",name:"Earth Day",month_start:4,day_start:22,month_end:4,day_end:22},{key:"halloween",name:"Halloween",month_start:10,day_start:24,month_end:10,day_end:31},{key:"christmas",name:"Christmas",month_start:12,day_start:20,month_end:12,day_end:26}];function Tu(e,n){if(!n.includes(e))return e;let t=2;for(;n.includes(`${e}-${t}`);)t+=1;return`${e}-${t}`}var wy={name:h.problemName,date:h.problemDate,theme:h.problemTheme};function Jt(e){let n=`${h.months[e.month_start-1]} ${e.day_start}`,t=`${h.months[e.month_end-1]} ${e.day_end}`;return n===t?n:`${n} - ${t}`}var hs=class extends A{constructor(){super(...arguments);this.item=null;this.kind="holiday";this.themes=[];this.taken=[];this.zone=void 0;this.busy=!1;this.draft=this.blank();this.yearly=!0;this.problem=null;this.presetKey="";this.onPreset=t=>{this.presetKey=t.target.value;let r=ps.find(i=>i.key===this.presetKey);if(!r)return;let{key:o,...s}=r;this.patch(s)};this.onSubmit=t=>{t.preventDefault();let r=ss(this.draft);if(this.problem=r,r||this.busy)return;let o={...this.draft,name:this.draft.name.trim()};this.item||(o.id=Tu(this.presetKey||this.kind,this.taken)),this.kind==="event"&&(o.kind="event",this.yearly?delete o.year:o.year=vu(o,new Date,this.zone)),this.dispatchEvent(new CustomEvent("holiday-save",{detail:o,bubbles:!0,composed:!0}))};this.onCancel=()=>{this.dispatchEvent(new CustomEvent("holiday-cancel",{bubbles:!0,composed:!0}))}}static{this.properties={item:{attribute:!1},kind:{type:String},themes:{attribute:!1},taken:{attribute:!1},zone:{attribute:!1},busy:{type:Boolean},draft:{state:!0},yearly:{state:!0},problem:{state:!0}}}static{this.styles=Yt}blank(){return{id:"",name:"",month_start:1,day_start:1,month_end:1,day_end:1,theme:h.defaultTheme,enabled:!0}}willUpdate(t){(t.has("item")||t.has("kind"))&&(this.draft=this.item?{...this.item}:this.blank(),this.yearly=this.item?.year===void 0,this.problem=null,this.presetKey="")}patch(t){this.draft={...this.draft,...t},this.problem=null}num(t){return r=>this.patch({[t]:Number(r.target.value)})}monthSelect(t,r){return l`<select aria-label=${r} @change=${this.num(t)}>
      ${h.months.map((o,s)=>l`<option value=${s+1} ?selected=${this.draft[t]===s+1}>${o}</option>`)}
    </select>`}dateRow(t,r,o){return l`<div class="field">
      <span>${t}</span>
      <div class="row">
        ${this.monthSelect(r,`${t} ${h.month}`)}
        <input type="number" min="1" max="31" aria-label=${`${t} ${h.day}`} .value=${String(this.draft[o])} @input=${this.num(o)} />
      </div>
    </div>`}themeOptions(){let t=this.draft.theme,r=[h.defaultTheme,...re(this.themes,t).filter(s=>s!==h.defaultTheme)],o=r.map(s=>l`<option value=${s} ?selected=${s===t}>${K(s)}</option>`);return t&&!r.includes(t)&&o.push(l`<option value=${t} selected>${h.missingTheme(t)}</option>`),o}renderPreset(){return this.item||this.kind==="event"?u:l`<div class="field">
      <label for="preset">${h.holidayPreset}</label>
      <select id="preset" @change=${this.onPreset}>
        <option value="">${h.holidayPresetPick}</option>
        ${ps.map(t=>l`<option value=${t.key}>${t.name} (${Jt(t)})</option>`)}
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
            </label>`:u}
        <label class="choice">
          <input type="checkbox" .checked=${this.draft.enabled!==!1} @change=${r=>this.patch({enabled:r.target.checked})} />
          ${h.holidayEnabled}
        </label>
        ${this.problem?l`<p class="error" role="alert">${wy[this.problem]}</p>`:u}
        <div class="actions">
          <button class="btn cancel" type="button" ?disabled=${this.busy} @click=${this.onCancel}>${h.cancel}</button>
          <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy?h.saving:h.save}</button>
        </div>
      </form>
    `}};customElements.get("hats-lite-holiday-form")||customElements.define("hats-lite-holiday-form",hs);function xy(e){return e.kind==="event"?h.eventKind:h.holidayKind}function ky(e,n){return l`<li class="holiday-row">
    <div class="holiday-main">
      <strong>${e.name}</strong>
      <span class="chip">${xy(e)}</span>
      ${e.enabled===!1?l`<span class="chip">${h.holidayOff}</span>`:u}
      <div class="muted">${Jt(e)}</div>
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
  </li>`}function _u(e,n){return e.length===0?l`<p class="muted">${h.holidaysEmpty}</p>`:l`<ul class="holiday-list" aria-label=${h.holidayListLabel}>${e.map(t=>ky(t,n))}</ul>`}var fs=Jt;function gs(e,n=new Date){let t=Array.from({length:12},(r,o)=>{let s=n.getMonth()+o;return{month:s%12+1,year:n.getFullYear()+Math.floor(s/12)}});return l`
    <ol class="timeline" aria-label=${h.timeline}>
      ${t.map(({month:r,year:o})=>{let s=bt[r-1],i=e.filter(a=>is(a,r,o).length>0);return l`<li class="month">
          <span>${h.months[r-1]}</span>
          <div class="track">
            ${i.flatMap(a=>is(a,r,o).map(d=>l`<i
                  class="bar"
                  style=${ae({left:`${(d.from-1)/s*100}%`,width:`${(d.to-d.from+1)/s*100}%`})}
                ></i>`))}
          </div>
          ${i.map(a=>l`<span class="sr">${h.timelineHoliday(a.name,fs(a))}</span>`)}
        </li>`})}
    </ol>
  `}var ms=class extends oe{constructor(){super(...arguments);this.loaded=!0;this.holidays=[];this.items=[];this.view={kind:"list"};this.onSave=t=>{let r=t.detail,o=this.items.some(s=>s.id===r.id);this.persist(o?this.items.map(s=>s.id===r.id?r:s):[...this.items,r])};this.backToList=()=>{this.error="",this.view={kind:"list"}}}static{this.properties={...oe.properties,loaded:{type:Boolean},holidays:{attribute:!1},items:{state:!0},view:{state:!0}}}willUpdate(t){t.has("holidays")&&(this.items=this.holidays.map(r=>({...r})))}persist(t){this.loaded&&this.run(async()=>{let r=await gu(this.hass,t);this.items=r,this.view={kind:"list"},this.dispatchEvent(new CustomEvent("holidays-changed",{detail:r,bubbles:!0,composed:!0}))})}open(t,r){this.error="",this.view={kind:"form",entry:t,item:r}}renderList(){return l`
      <div class="row">
        <button class="btn" type="button" id="add-holiday" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("holiday",null)}>${h.holidayAdd}</button>
        <button class="btn" type="button" id="add-event" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("event",null)}>${h.eventAdd}</button>
      </div>
      ${gs(this.items)}
      ${_u(this.items,{busy:this.busy||!this.loaded,onEdit:t=>this.open(t.kind==="event"?"event":"holiday",t),onRemove:t=>this.persist(this.items.filter(r=>r.id!==t.id))})}
      ${this.renderError()}
      <div class="actions"><button class="btn primary" type="button" @click=${()=>this.close()}>${h.close}</button></div>
    `}renderForm(t){return l`
      <hats-lite-holiday-form
        .item=${t.item}
        .kind=${t.entry}
        .themes=${this.themes}
        .zone=${Eu(this.hass)}
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
    `}};customElements.get("hats-lite-holidays-dialog")||customElements.define("hats-lite-holidays-dialog",ms);var $y=["override","birthday","holiday"],Au=/^(\d{4})-(\d{2})-(\d{2})$/,Ey=/^([01][0-9]|2[0-3]):[0-5][0-9]$/,Ty=/^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$/,Mu=/^(\d{4})-(\d{2})$/;function be(e,n=2){return String(e).padStart(n,"0")}function bs(e,n,t){return`${be(e,4)}-${be(n)}-${be(t)}`}function Ve(e){return e.slice(0,7)}function Le(e){let n=Au.exec(e);return n?[Number(n[1]),Number(n[2]),Number(n[3])]:null}function ur(e){let n=Mu.exec(e);return n?[Number(n[1]),Number(n[2])]:null}function pr(e){let[n,t]=ur(e)??[1970,1];return new Date(Date.UTC(n,t,0)).getUTCDate()}function ys(e,n){let[t,r]=ur(e)??[1970,1],o=t*12+(r-1)+n;return`${be(Math.floor(o/12),4)}-${be(o%12+1)}`}function vt(e,n){let[t,r,o]=Le(e)??[1970,1,1],s=new Date(Date.UTC(t,r-1,o+n));return bs(s.getUTCFullYear(),s.getUTCMonth()+1,s.getUTCDate())}function Cu(e){let[n,t,r]=Le(e)??[1970,1,1];return new Date(Date.UTC(n,t-1,r)).getUTCDay()}function cr(e,n){let[,,t]=Le(e)??[1970,1,1],r=ys(Ve(e),n);return`${r}-${be(Math.min(t,pr(r)))}`}var _y={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};function vs(e){let n=e?.locale,t=_y[n?.first_weekday??""];if(t!==void 0)return t;if(!n?.language)return 1;try{let r=new Intl.Locale(n.language).getWeekInfo?.();if(r&&r.firstDay>=1&&r.firstDay<=7)return r.firstDay%7}catch{return 1}return 1}function Pu(e,n=new Date){let t=e?.config?.time_zone;try{let r=new Intl.DateTimeFormat("en-US",{timeZone:t||void 0,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(n),o=s=>Number(r.find(i=>i.type===s)?.value);return bs(o("year"),o("month"),o("day"))}catch{return bs(n.getFullYear(),n.getMonth()+1,n.getDate())}}function ws(e){let[n]=Le(e)??[1970];return{min:`${be(n-1,4)}-01`,max:`${be(n+2,4)}-12`}}function Ru(e,n){return(Cu(`${e}-01`)-n+7)%7}function Su(e,n){let t=(Cu(e)-n+7)%7;return{first:vt(e,-t),last:vt(e,6-t)}}function Lu(e,n,t){switch(n){case"ArrowLeft":return vt(e,-1);case"ArrowRight":return vt(e,1);case"ArrowUp":return vt(e,-7);case"ArrowDown":return vt(e,7);case"Home":return Su(e,t).first;case"End":return Su(e,t).last;case"PageUp":return cr(e,-1);case"PageDown":return cr(e,1);default:return null}}function Sy(e){let n=e;if(!n||typeof n!="object"||!$y.includes(n.kind)||typeof n.theme!="string")return null;let t={...n,kind:n.kind,source:String(n.source??n.kind),theme:n.theme};return delete t.partial,delete t.active_from,delete t.active_until,n.partial===!0&&Ey.test(String(n.active_from))&&Ty.test(String(n.active_until))&&(t.partial=!0,t.active_from=n.active_from,t.active_until=n.active_until),t}function Ay(e){let n=e;if(!n||typeof n.date!="string"||!Au.test(n.date)||!Array.isArray(n.items))return null;let t=n.winner,r=t?.selection?.theme;return{date:n.date,winner:t&&typeof r=="string"?t:null,items:n.items.map(Sy).filter(o=>o!==null),conflict:n.conflict===!0}}function My(e){let n=e;if(!n||typeof n.month!="string"||!Mu.test(n.month)||!Array.isArray(n.days)||n.days.length!==pr(n.month))return null;let t=n.days.map(Ay);return t.some((r,o)=>r===null||r.date!==`${n.month}-${be(o+1)}`)?null:{month:n.month,user:String(n.user??""),time_zone:String(n.time_zone??""),opt_out:n.opt_out===!0,trial:n.trial===!0,days:t}}async function Ou(e,n,t){let r={type:"hats_lite/calendar",month:n};t&&(r.user=t);let o=My(await M(e,r));if(!o||o.month!==n)throw{code:"unknown"};return o}function Du(e,n=new Date){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:e||void 0,hourCycle:"h23",hour:"numeric",minute:"numeric",second:"numeric"}).formatToParts(n),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("hour"),r("minute"),r("second")]}catch{return[n.getHours(),n.getMinutes(),n.getSeconds()]}}var k={viewLabel:"People view",list:"List",calendar:"Calendar",loading:"Loading the calendar...",loadFailed:"Could not load the calendar.",retry:"Try again",prev:"Previous month",next:"Next month",today:"Today",person:"Person",grid:e=>`Calendar for ${e}`,optedOut:"This person opted out of assigned themes, so nothing here is applied.",none:"No scheduled theme",detailTitle:"Selected day",noSelection:"Pick a day to see what applies.",effective:"Theme that applies",noEffective:"None, the person's own theme is used.",setBy:e=>`Set by ${e}`,setByAdmin:"an administrator",itemsHeading:"Everything on this day",wins:"Applies",loses:"Not applied",until:e=>`until ${e}`,untilRemoved:"until removed",conflict:"Conflict",conflictNote:"More than one item wants a different theme on this day.",preview:"Preview this day",previewMissing:"This theme is not installed, so it cannot be previewed.",assignNow:e=>`Assign now, until the end of ${e}`,assignLate:"There is less than two minutes left today. Pick another day to assign a theme.",trial:"A try is running; the schedule applies again when it ends",partialOnly:"Only part of the day has an assigned theme",appliesFrom:e=>`applies from ${e}`,untilTime:e=>`until ${e}`,partial:"Part of the day",editHolidays:"Edit holidays",kinds:{override:"Assignment",birthday:"Birthday",holiday:"Holiday"},itemName:e=>e.kind==="holiday"?e.name?`Holiday ${e.name}`:"Holiday":e.kind==="birthday"?"Birthday":e.assigned_by_name?`Assignment by ${e.assigned_by_name}`:"Assignment",cellLabel:(e,n)=>`${e}. ${n}`,winnerSummary:(e,n)=>`Theme ${e} from ${n}`,conflictSummary:(e,n,t)=>`Conflict: theme ${e} from ${n} wins over ${t}`,errors:{unauthorized:"You are not allowed to see that calendar.",invalid_user:"That user is no longer available.",invalid_request:"That month is outside the range the calendar can show.",not_loaded:"The server is still starting. Try again in a moment.",unknown:"Something went wrong. Try again."}};function Iu(e){return k.errors[e]??k.loadFailed}function hr(e,n){let t=Le(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{dateStyle:"full",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,t[2])))}catch{return e}}function xs(e,n){let t=ur(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,1)))}catch{return e}}function Hu(e,n){let t=(r,o)=>{try{return new Intl.DateTimeFormat(n,{weekday:r,timeZone:"UTC"}).format(new Date(Date.UTC(2024,0,7+o)))}catch{return String(o)}};return Array.from({length:7},(r,o)=>{let s=(e+o)%7;return{short:t("short",s),long:t("long",s)}})}function Nu(e){return e?["override","birthday","holiday"].filter(n=>e.items.some(t=>t.kind===n)):[]}function Fu(e){return e.items.find(n=>n.wins===!0&&n.partial!==!0)}function Cy(e){return e.items.filter(n=>n!==Fu(e)).map(n=>`${k.itemName(n)} (${K(n.theme)})`).join(", ")}function Bu(e,n){if(!e||e.items.length===0)return k.none;if(n)return k.optedOut;if(!e.winner)return k.partialOnly;let t=Fu(e),r=t?k.itemName(t):e.winner.source,o=e.winner.selection.theme;return e.conflict?k.conflictSummary(K(o),r,Cy(e)):k.winnerSummary(K(o),r)}function Py(e,n,t){try{return e.toLocaleString(n,t?{timeZone:t}:void 0)}catch{return e.toLocaleString(n)}}function ks(e,n,t){return e.kind!=="override"?"":e.until===null||e.until===void 0?k.untilRemoved:k.until(Py(new Date(e.until*1e3),n,t))}function $s(e){if(e.partial!==!0||!e.active_from||!e.active_until||e.active_from===e.active_until)return"";let n=e.active_from==="00:00"?"":k.appliesFrom(e.active_from),t=e.active_until==="24:00"?"":k.untilTime(e.active_until);return[n,t].filter(Boolean).join(" ")}function Ry(e){let n=e.day?.winner;if(!n||e.optOut)return l`<p class="muted" id="effective">${k.noEffective}</p>`;let t=e.day?.items.find(i=>i.wins===!0&&i.partial!==!0),r=n.selection.theme,o=n.selection.dark??e.darkMode,s=e.installed.includes(r);return l`
    <p id="effective"><strong>${K(r)}</strong>${t?l` - ${k.itemName(t)}`:u}</p>
    ${t?.kind==="override"?l`<p class="muted">${k.setBy(t.assigned_by_name??k.setByAdmin)}</p>`:u}
    <div class="tools">
      <button class="btn" type="button" id="preview-day" ?disabled=${!s} @click=${()=>e.onPreview(r,o)}>${k.preview}</button>
    </div>
    ${s?u:l`<p class="muted">${k.previewMissing}</p>`}
  `}function Ly(e){let n=e.day?.items??[];return n.length===0?u:l`
    <h4>${k.itemsHeading}</h4>
    ${e.day?.conflict?l`<p class="notice" id="conflict-note" role="status">${k.conflictNote}</p>`:u}
    <ul class="items">
      ${n.map(t=>l`<li class=${t.wins&&!t.partial?"won":"lost"} data-wins=${t.wins&&!t.partial?"true":"false"}>
          <span class="name">${k.itemName(t)}</span> - ${K(t.theme)}
          <span class="chip ${t.wins?"ok":"warn"}">${t.partial?k.partial:t.wins?k.wins:k.loses}</span>
          ${$s(t)?l`<div class="muted">${$s(t)}</div>`:u}
          ${ks(t,e.locale,e.zone)?l`<div class="muted">${ks(t,e.locale,e.zone)}</div>`:u}
        </li>`)}
    </ul>
  `}function Uu(e){return e.key?l`
    <h3 id="detail-title">${e.title}</h3>
    <h4>${k.effective}</h4>
    ${Ry(e)} ${Ly(e)}
    <div class="tools">
      ${e.canAssign?l`<button class="btn" type="button" id="assign-until" ?disabled=${e.assignLate} @click=${e.onAssign}>${e.assignLabel}</button>`:u}
      ${e.canHolidays?l`<button class="btn" type="button" id="edit-holidays-cal" @click=${e.onHolidays}>${k.editHolidays}</button>`:u}
    </div>
    ${e.canAssign&&e.assignLate?l`<p class="muted" id="assign-hint">${k.assignLate}</p>`:u}
  `:l`<h3>${k.detailTitle}</h3><p class="muted">${k.noSelection}</p>`}var ju=[V,W,T`
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
`];var Es=class extends A{constructor(){super(...arguments);this.people=[];this.view="list";this.status="idle";this.failure="";this.month="";this.data=null;this.selected="";this.focusKey="";this.userId="";this.token=0;this.stale=!1;this.onKey=t=>{let r=this.focusKey;if(t.key==="Enter"||t.key===" "){t.preventDefault(),this.selected=r;return}let o=Lu(r,t.key,vs(this.hass));o!==null&&(t.preventDefault(),Ve(o)===this.month?(this.focusKey=o,this.updateComplete.then(()=>this.cellOf(o)?.focus())):this.goTo(Ve(o),o))};this.onPerson=t=>{this.userId=t.target.value,this.selected="",this.data=null,this.load()}}static{this.properties={hass:{attribute:!1},people:{attribute:!1},view:{state:!0},status:{state:!0},failure:{state:!0},month:{state:!0},data:{state:!0},selected:{state:!0},focusKey:{state:!0},userId:{state:!0}}}static{this.styles=ju}get language(){return this.hass?.locale?.language}get zone(){return this.hass?.config?.time_zone||void 0}minutesLeft(){let[t,r,o]=Du(this.zone);return 1440-(t*60+r+o/60)}get today(){return Pu(this.hass)}willUpdate(t){t.has("hass")&&this.hass&&this.month===""?(this.userId=this.hass.user?.id??"",this.month=Ve(this.today),this.focusKey=this.today):t.has("people")&&t.get("people")!==void 0&&this.status!=="idle"&&(this.view==="calendar"?this.load():this.stale=!0)}async load(){let t=this.hass;if(!t)return;let r=++this.token,o=this.month;this.stale=!1,this.status="loading";try{let s=await Ou(t,o,this.userId||void 0);if(r!==this.token)return;this.data=s,this.failure="",this.status="ready"}catch(s){if(r!==this.token)return;let i=G(s);this.data=null,this.failure=Iu(i),this.status=i==="unknown_command"?"unsupported":"error",this.status==="unsupported"&&this.setView("list")}}setView(t){t!==this.view&&(this.view=t,this.dispatchEvent(new CustomEvent("schedule-view",{detail:{view:t},bubbles:!0,composed:!0})),t==="calendar"&&(this.status==="idle"||this.stale)&&this.load())}async goTo(t,r){let o=ws(this.today);t<o.min||t>o.max||(this.month=t,this.focusKey=r,Ve(this.selected)!==t&&(this.selected=""),this.data=null,await this.load(),await this.updateComplete,this.cellOf(r)?.focus())}cellOf(t){return this.renderRoot.querySelector(`[data-day="${t}"]`)}onPick(t){this.selected=t,this.focusKey=t}dayOf(t){return this.data?.days.find(r=>r.date===t)}canAssign(){let t=this.hass?.user,r=this.people.find(o=>o.id===this.userId);return r?r.id===t?.id?!0:t?.is_admin===!0||!r.is_admin&&this.people.some(o=>o.id!==t?.id):!1}detailModel(){let t=this.selected,r=this.dayOf(t),o=Zt(this.hass),s=t>=this.today,i=this.zone;return{key:t,day:r,title:hr(t,this.language),optOut:this.data?.opt_out===!0,installed:o,locale:this.language,zone:i,assignLabel:k.assignNow(hr(t,this.language)),assignLate:t===this.today&&this.minutesLeft()<2,canAssign:s&&this.canAssign(),canHolidays:this.hass?.user?.is_admin===!0,darkMode:this.hass?.themes?.darkMode,onPreview:(a,d)=>this.dispatchEvent(new CustomEvent("hats-lite-preview-theme",{detail:{theme:a,dark:d},bubbles:!0,composed:!0})),onAssign:()=>{let a=r?.winner?.selection,d={userId:this.userId,until:`${t}T23:59`};a?.theme&&(d.theme=a.theme),a?.dark!==void 0&&(d.dark=a.dark),this.dispatchEvent(new CustomEvent("schedule-assign",{detail:d,bubbles:!0,composed:!0}))},onHolidays:()=>this.dispatchEvent(new CustomEvent("schedule-holidays",{bubbles:!0,composed:!0}))}}renderSwitch(){return l`
      <div class="seg" role="group" aria-label=${k.viewLabel}>
        <button type="button" id="view-list" aria-pressed=${this.view==="list"?"true":"false"} @click=${()=>this.setView("list")}>${k.list}</button>
        <button type="button" id="view-calendar" aria-pressed=${this.view==="calendar"?"true":"false"} @click=${()=>this.setView("calendar")}>${k.calendar}</button>
      </div>
    `}renderCell(t,r){let o=this.dayOf(t),s=Le(t)?.[2]??0,i=Nu(o),a=Bu(o,this.data?.opt_out===!0);return l`<div class="cell" role="gridcell" aria-selected=${this.selected===t?"true":"false"}>
      <button
        type="button"
        class="day ${t===r?"today":""}"
        data-day=${t}
        tabindex=${this.focusKey===t?"0":"-1"}
        aria-current=${t===r?"date":u}
        aria-label=${k.cellLabel(hr(t,this.language),a)}
        @click=${()=>this.onPick(t)}
      >
        <span class="num" aria-hidden="true">${s}</span>
        <span class="marks" aria-hidden="true">
          ${i.map(d=>l`<i class="dot ${d}" data-kind=${d}></i>`)}
          ${o?.conflict?l`<span class="conflict" data-conflict="true">!</span>`:u}
        </span>
      </button>
    </div>`}renderGrid(){let t=vs(this.hass),r=this.today,o=Ru(this.month,t),s=pr(this.month),i=[...Array.from({length:o},()=>null),...Array.from({length:s},(d,c)=>`${this.month}-${String(c+1).padStart(2,"0")}`)];for(;i.length%7!==0;)i.push(null);let a=Array.from({length:i.length/7},(d,c)=>i.slice(c*7,c*7+7));return l`<div class="grid" role="grid" aria-label=${k.grid(xs(this.month,this.language))} @keydown=${this.onKey}>
      <div class="row" role="row">
        ${Hu(t,this.language).map(d=>l`<div class="head" role="columnheader" aria-label=${d.long}>${d.short}</div>`)}
      </div>
      ${a.map(d=>l`<div class="row" role="row">
          ${d.map(c=>c===null?l`<div class="cell" role="gridcell" aria-hidden="true"></div>`:this.renderCell(c,r))}
        </div>`)}
    </div>`}renderNav(){let t=ws(this.today),r=o=>{this.goTo(ys(this.month,o),cr(this.focusKey||`${this.month}-01`,o))};return l`<div class="bar">
      <button class="btn" type="button" id="prev" aria-label=${k.prev} ?disabled=${this.month<=t.min} @click=${()=>r(-1)}>&lsaquo;</button>
      <h3 class="title grow" id="month-title" aria-live="polite">${xs(this.month,this.language)}</h3>
      <button class="btn" type="button" id="today" @click=${()=>{this.goTo(Ve(this.today),this.today)}}>${k.today}</button>
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
        <section class="card" aria-live="polite">${Uu(this.detailModel())}</section>
      </div>
    `}render(){return!this.hass||this.status==="unsupported"?u:l`<div class="bar">${this.renderSwitch()}</div>
      ${this.view==="calendar"?this.renderCalendar():u}`}};customElements.get("hats-lite-schedule")||customElements.define("hats-lite-schedule",Es);var Ts=class extends A{constructor(){super(...arguments);this.people=[];this.holidays=[];this.status="idle";this.message="";this.failure="";this.dialog=null;this.holidaysLoaded=!1;this.holidaysFailure="";this.removing=new Set;this.calendarView=!1;this.opener=null;this.onClose=()=>{this.dialog=null;let t=this.opener;this.updateComplete.then(()=>t?.focus?.())};this.onScheduleAssign=t=>{let{userId:r,until:o,theme:s,dark:i}=t.detail,a=this.people.find(d=>d.id===r);a&&this.open({kind:"assign",person:a,until:o,theme:s,dark:i})};this.onHolidaysChanged=t=>{this.holidays=t.detail,this.message=h.holidaysSaved,ir()};this.onDone=t=>{let r=t.detail;this.dialog=null,this.message=r.message,this.failure="",r.selfApply&&(this.dispatchEvent(new CustomEvent("settheme",{detail:r.selfApply,bubbles:!0,composed:!0})),ir()),this.load();let o=this.opener;this.updateComplete.then(()=>o?.focus?.())}}static{this.properties={hass:{attribute:!1},people:{state:!0},holidays:{state:!0},status:{state:!0},message:{state:!0},failure:{state:!0},dialog:{state:!0},holidaysLoaded:{state:!0},holidaysFailure:{state:!0},removing:{state:!0},calendarView:{state:!0}}}static{this.styles=$u}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load()}async load(){let t=this.hass;if(t){this.status!=="ready"&&(this.status="loading");try{this.people=await os(t),this.status="ready"}catch(r){this.failure=yt(G(r)),this.status="error";return}await this.loadHolidays()}}async loadHolidays(){let t=this.hass;if(t)try{this.holidays=await fu(t),this.holidaysLoaded=!0,this.holidaysFailure=""}catch(r){this.holidaysLoaded=!1,this.holidaysFailure=yt(G(r))}}get selfId(){return this.hass?.user?.id}get isAdmin(){return this.hass?.user?.is_admin===!0}get canAssign(){return this.isAdmin||this.people.some(t=>t.id!==this.selfId)}themeNames(){return Zt(this.hass)}open(t){this.opener=this.shadowRoot?.activeElement,this.dialog=t}async act(t,r,o,s=!1){this.message="",this.failure="";try{await t(),this.message=r,s&&ir()}catch(i){this.failure=yt(G(i),o)}await this.load()}optOut(t,r){let o=this.hass;o&&this.act(()=>pu(o,r),r?h.optOutOn:h.optOutOff,t.name,!0)}mayUnassign(t){let r=t.active_override;if(!r)return!1;if(this.isAdmin||t.id===this.selfId)return!0;let o=this.selfId;return o!==void 0&&r.assigned_by===o}removeOverride(t,r){let o=this.hass;!o||this.removing.has(t)||(this.removing=new Set(this.removing).add(t),this.act(()=>uu(o,t),h.unassigned,r).finally(()=>{let s=new Set(this.removing);s.delete(t),this.removing=s}))}renderOverride(t){let r=t.active_override;if(!r)return l`<span class="muted">${h.noOverride}</span>`;let o=r.ends===null?h.noEnd:h.until(new Date(r.ends*1e3).toLocaleString());return l`<span class="override">${h.overrideLine(r.theme)} ${o}. ${h.setBy(r.assigned_by_name)}</span>`}renderPerson(t){let r=t.id===this.selfId,o=this.hass,s=r||this.isAdmin,i=this.canAssign&&(this.isAdmin||!t.is_admin);return l`
      <li class="person">
        <div class="head">
          <span class="name">${t.name}</span>
          ${r?l`<span class="chip">${h.you}</span>`:u}
          ${t.is_admin?l`<span class="chip">${h.admin}</span>`:u}
          ${!r&&t.opt_out?l`<span class="chip warn">${h.optedOutChip}</span>`:u}
        </div>
        <div>${this.renderOverride(t)}</div>
        <div class="tools">
          ${r?l`<button class="switch" type="button" role="switch" aria-checked=${t.opt_out?"true":"false"} @click=${()=>this.optOut(t,!t.opt_out)}>
                ${h.optOutLabel}
              </button>`:u}
          ${r&&t.active_override&&!t.opt_out?l`<button class="btn" type="button" id="opt-out-shortcut" @click=${()=>this.optOut(t,!0)}>${h.optOutShortcut}</button>`:u}
          ${i?l`<button class="btn" type="button" aria-label="${h.assign}: ${t.name}" @click=${()=>this.open({kind:"assign",person:t})}>${h.assign}</button>`:u}
          ${this.mayUnassign(t)&&o?l`<button
                class="btn"
                type="button"
                aria-label="${h.unassign}: ${t.name}"
                ?disabled=${this.removing.has(t.active_override.id)}
                @click=${()=>this.removeOverride(t.active_override.id,t.name)}
              >
                ${h.unassign}
              </button>`:u}
          ${s?l`<button class="btn" type="button" aria-label="${h.birthday}: ${t.name}" @click=${()=>this.open({kind:"birthday",person:t})}>${h.birthday}</button>`:u}
        </div>
      </li>
    `}renderHolidays(){return l`
      <section class="card" aria-labelledby="holidays-h">
        <h2 id="holidays-h">${h.holidays}</h2>
        <p class="muted">${h.holidaysIntro}</p>
        ${gs(this.holidays)}
        ${this.holidaysLoaded?this.holidays.length===0?l`<p class="muted">${h.holidaysEmpty}</p>`:l`<ul class="holidays">
              ${this.holidays.map(t=>l`<li>${h.holidayRowLabel(t.name,t.kind==="event"?h.eventKind:h.holidayKind)}: ${fs(t)} (${K(t.theme)})${t.enabled===!1?" - off":""}</li>`)}
            </ul>`:l`<p class="notice error" id="holidays-error" role="alert">
                ${this.holidaysFailure||h.holidaysLoadFailed}
              </p>
              <button class="btn" type="button" id="retry-holidays" @click=${()=>{this.loadHolidays()}}>${h.retry}</button>`}
        ${this.isAdmin?l`<div class="tools">
              <button class="btn" type="button" id="edit-holidays" ?disabled=${!this.holidaysLoaded} @click=${()=>this.open({kind:"holidays"})}>${h.editHolidays}</button>
              <button class="btn" type="button" id="edit-assigners" @click=${()=>this.open({kind:"assigners"})}>${h.assigners}</button>
            </div>`:u}
      </section>
    `}renderDialog(){let t=this.dialog;if(!t)return u;let r={hass:this.hass,themes:this.themeNames(),installed:Zt(this.hass)};switch(t.kind){case"assign":return l`<hats-lite-assign-dialog
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
          <h2 id="people-h">${h.title}</h2>
          <ul class="people">${this.people.map(t=>this.renderPerson(t))}</ul>
        </section>
        ${this.renderHolidays()}
      </div>
      ${this.renderDialog()}
    `}};customElements.get("hats-lite-people")||customElements.define("hats-lite-people",Ts);var Ss=["styling","cards","layout","templating","chrome"],Oy=4096,As="hats_lite/",Ms=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,_s=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function We(e){return typeof e=="string"?e:""}function Dy(e){if(!e||typeof e!="object")return null;let n=e,t=We(n.full_name);if(!Ms.test(t))return null;let r=Ss.find(o=>o===n.kind)??"cards";return{category:n.category==="integration"?"integration":"plugin",kind:r,full_name:t,description:We(n.description),stars:typeof n.stars=="number"&&Number.isFinite(n.stars)?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"||typeof n.hacs_id=="number"?n.hacs_id:null,filename:We(n.filename)||null,pinned:n.pinned===!0,license:We(n.license)||null,tag:We(n.tag)||null}}async function zu(e){let n=await M(e,{type:`${As}mods`}),t=Array.isArray(n?.mods)?n.mods:[];return{source:We(n?.source),mods:t.map(Dy).filter(r=>r!==null),truncated:n?.truncated===!0}}async function Ku(e,n){let t=await M(e,{type:`${As}mod_asset`,full_name:n});if(typeof t?.source!="string")throw{code:"fetch_failed"};return{full_name:We(t.full_name)||n,source:t.source}}async function Cs(e){try{let n=await M(e,{type:`${As}mods`,probe:!0});return Array.isArray(n?.mods)}catch(n){return G(n)!=="unknown_command"}}function Vu(e){return Ms.test(e)?`https://github.com/${e}`:null}function Wu(e){return e.pinned&&e.category==="plugin"}function qu(e,n,t){if(!Ms.test(n))return;let[r="",o=""]=n.split("/");return Un(e,r,o,t)}function Iy(e){if(e.tag&&_s.test(e.tag))return e.tag;let n=(e.filename??"").replace(/\.js$/i,"").toLowerCase();return _s.test(n)?n:""}function Gu(e){let n=Iy(e);return JSON.stringify({type:`custom:${n||"my-card"}`},null,2)}function Ps(e){if(e.trim()==="")return{ok:!1,problem:"empty"};if(new TextEncoder().encode(e).length>Oy)return{ok:!1,problem:"too_large"};let n;try{n=JSON.parse(e)}catch{return{ok:!1,problem:"invalid"}}if(!n||typeof n!="object"||Array.isArray(n))return{ok:!1,problem:"not_object"};let t=n;if(typeof t.type!="string"||t.type==="")return{ok:!1,problem:"no_type"};let r=t.type.startsWith("custom:")?t.type.slice(7):"";return _s.test(r)?{ok:!0,config:t,tag:r}:{ok:!1,problem:"bad_type"}}function Xu(e,n,t,r="all"){let o=n.trim().toLowerCase();return e.filter(s=>r!=="all"&&s.kind!==r||t==="installed"&&!s.installed?!1:o===""?!0:s.full_name.toLowerCase().includes(o)||s.description.toLowerCase().includes(o))}var gr={maxEntities:100,maxBytes:1048576,maxString:2048,maxAttrBytes:4096},Rs=/^[a-z0-9_]+\.[a-z0-9_]+$/,Hy=/token|access|auth|password|passwd|secret|credential|api[_-]?key/i,Ny=/(?:^|[?&;#]|%3F|%26)(access_token|token|auth|authsig|signature|sig|key|password)(?:=|%3D)/i,Fy=/^[a-z][a-z0-9+.-]*:\/\/[^/?#\s]*@/i,By=/eyJ[A-Za-z0-9_-]{10,}/,Uy=/[0-9a-f]{32,}/i,jy=/[A-Za-z0-9+/_-]{32,}/g,zy=5,Ky=12,Ls=200,ep=500,mr=100,Vy=12,se=Symbol("drop"),tp=new Set(["person","device_tracker","camera","lock","alarm_control_panel","tag","notify","input_text","text"]),Wy=new Set(["friendly_name","unit_of_measurement","device_class","state_class","icon","supported_features","min","max","step","options","brightness","color_temp","current_temperature","temperature","humidity","hvac_action","hvac_mode","hvac_modes","battery_level","volume_level","is_volume_muted","media_title","media_artist","source","source_list","percentage","current_position","entity_id"]),qy=/^(entity|entities|entity_id|camera_image|.+_entity|.+_entities|.+_entity_id)$/,Yu=typeof TextEncoder>"u"?null:new TextEncoder;function np(e){return Yu===null?e.length:Yu.encode(e).length}function Gy(e){try{let n=JSON.stringify(e);return n===void 0?1/0:np(n)}catch{return 1/0}}function wt(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Zu(e){if(Fy.test(e)||Ny.test(e)||By.test(e)||Uy.test(e))return!0;for(let n of e.match(jy)??[])if(/\d/.test(n)&&/[A-Za-z]/.test(n))return!0;return!1}function fr(e,n=gr.maxString){let t=e.length>n?e.slice(0,n):e;if(Zu(t))return null;if(t.includes("%"))try{if(Zu(decodeURIComponent(t)))return null}catch{return t}return t}function xt(e,n,t,r,o=zy){if(e===null)return null;if(typeof e=="string"){let s=fr(e,t);return s===null?se:s}if(typeof e=="number")return Number.isFinite(e)?e:se;if(typeof e=="boolean")return e;if(n>=o)return se;if(Array.isArray(e)){let s=[];if(e.length>ep)return se;for(let i of e){let a=xt(i,n+1,t,r,o);a!==se&&s.push(a)}return s}if(wt(e)){let s={},i=0;for(let a of Object.keys(e)){if(a==="__proto__"||a==="constructor"||a==="prototype"||r&&Hy.test(a))continue;if(i>=Ls)break;let d=xt(e[a],n+1,t,r,o);d!==se&&(s[a]=d,i+=1)}return s}return se}function Xy(e){if(!Array.isArray(e))return[];let n=[];for(let t of e.slice(0,mr))typeof t=="string"&&Rs.test(t)&&!tp.has(t.slice(0,t.indexOf(".")))&&n.push(t);return n}function Yy(e,n){let t={};for(let r of Object.keys(e).slice(0,Ls)){if(!Wy.has(r))continue;let o=r==="entity_id"?Xy(e[r]):xt(e[r],0,n.maxString,!0);o!==se&&(Gy(o)>n.maxAttrBytes||(t[r]=o))}return t}function Ju(e){if(typeof e=="string")return fr(e.slice(0,64),64)??void 0}function Qu(e,n){return typeof e=="string"?e.slice(0,n):void 0}function Zy(e){return e.slice(0,e.indexOf("."))}function rp(e){let n=[],t=new Set,r=s=>{typeof s=="string"&&Rs.test(s)&&!t.has(s)&&n.length<mr&&(t.add(s),n.push(s))},o=(s,i,a)=>{if(!(i>Vy||n.length>=mr)){if(typeof s=="string"){a&&r(s);return}if(Array.isArray(s)){for(let d of s.slice(0,ep))o(d,i+1,a);return}if(wt(s))for(let d of Object.keys(s).slice(0,Ls))d!=="__proto__"&&o(s[d],i+1,qy.test(d))}};return o(e,0,!1),n}function Jy(e,n={}){let t={...gr,...n},r={};if(!wt(e))return r;let o=(n.entityIds??[]).slice(0,mr),s=0,i=0;for(let a of o){if(typeof a!="string"||!Rs.test(a)||a in r)continue;if(s>=t.maxEntities)break;let d=Object.prototype.hasOwnProperty.call(e,a)?e[a]:void 0;if(!wt(d))continue;let c=wt(d.attributes)?d.attributes:{},m;if(tp.has(Zy(a))||"latitude"in c||"longitude"in c){let g=typeof c.friendly_name=="string"?fr(c.friendly_name,255):null;m={entity_id:a,state:"unknown",attributes:g===null?{}:{friendly_name:g}}}else{let g=d.state,v=typeof g=="string"?g:g==null?"unknown":String(g);m={entity_id:a,state:fr(v,t.maxString)??"unknown",attributes:Yy(c,t)};let E=Ju(d.last_changed),C=Ju(d.last_updated);E!==void 0&&(m.last_changed=E),C!==void 0&&(m.last_updated=C)}let p=np(JSON.stringify(m));i+p>t.maxBytes||(i+=p,r[a]=m,s+=1)}return r}function op(e,n={}){let t=n.maxString??gr.maxString,r=xt(e,0,t,!1,Ky);return r===se?{}:r}function Os(e,n={}){let t={...gr,...n},r=wt(e)?e:{},o=Qu(r.language,32)??"en",s=Qu(r.selectedLanguage,32)??o,i=xt(r.themes,0,t.maxString,!1),a=xt(r.locale,0,t.maxString,!1);return{states:Jy(r.states,n),themes:i===se?{}:i,language:o,selectedLanguage:s,locale:a===se?{}:a,userData:{language:s}}}function sp(e,n=1e3){let t=-1/0,r=null,o=null,s=a=>{t=Date.now(),e(...a)},i=((...a)=>{let d=t+n-Date.now();if(d<=0&&r===null){s(a);return}o=a,r===null&&(r=setTimeout(()=>{r=null;let c=o;o=null,c!==null&&s(c)},Math.max(d,0)))});return i.cancel=()=>{r!==null&&clearTimeout(r),r=null,o=null},i}var ip="read only preview",ap="allow-scripts",lp="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'",dp="The preview runs third party code in a sandboxed frame. A mod that loops forever can still freeze this browser tab, because the frame may share the page's renderer thread. Reload the page if that happens.",cp="The mod author's code runs in a locked frame, but this cannot stop it from sending what it receives to the author. Both modes also receive your theme and language.",up="Own config: it receives the config of the card you entered and the state of the entities that card uses. Sensitive entities such as person, camera, lock and device_tracker have their state hidden.",pp="Mock mode: the entities and states it receives are fake.",Qy=["mod_error","set_config","unhandled_rejection","runtime_error","not_defined"];var ev=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function Ds(e){return typeof e=="string"&&e.length<=100&&ev.test(e)}function hp(e=globalThis.crypto){let n=new Uint8Array(16);e.getRandomValues(n);let t="";for(let r of n)t+=r.toString(16).padStart(2,"0");return t}function mp(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Qt(e){return typeof e=="string"&&e.length<=500?e:null}function tv(e){if(!Array.isArray(e)||e.length>100)return null;let n=[];for(let t of e){if(!mp(t))return null;let r=Qt(t.type),o=Qt(t.name),s=Qt(t.description);if(r===null||o===null||s===null)return null;n.push({type:r,name:o,description:s})}return n}function Is(e,n){if(!mp(e)||typeof e.type!="string"||typeof e.token!="string")return null;if(e.type==="ready")return e.token===""?{type:"ready"}:null;if(n===""||e.token!==n)return null;switch(e.type){case"heartbeat":return{type:"heartbeat"};case"rendered":return{type:"rendered"};case"defined":return Ds(e.tag)?{type:"defined",tag:e.tag}:null;case"cards":{let t=tv(e.cards);return t===null?null:{type:"cards",cards:t}}case"error":{let t=Qt(e.message),r=Qy.find(o=>o===e.code);return t===null||r===void 0?null:{type:"error",code:r,message:t}}case"request":{let t=Qt(e.method),r=e.id;return t===null||typeof r!="number"||!Number.isSafeInteger(r)?null:{type:"request",id:r,method:t}}default:return null}}function nv(e){let n=e.document,t=e.parent.postMessage.bind(e.parent),r=e.customElements,o=r.define.bind(r),s="read only preview",i=500,a="",d=null,c=!1,m=null,p=0,g=$=>{if(d!==null)try{d.postMessage({...$,token:a})}catch{return}},v=$=>String($??"").slice(0,i),E=($,_)=>{let P=_&&_.message!==void 0?_.message:_;g({type:"error",code:$,message:v(P)})},C=$=>(p+=1,g({type:"request",id:p,method:v($)}),Promise.reject(new Error(s))),S=$=>()=>C($),U=$=>({states:$.states,themes:$.themes,language:$.language,selectedLanguage:$.selectedLanguage,locale:$.locale,userData:$.userData,callService:S("callService"),callWS:S("callWS"),callApi:S("callApi"),fetchWithAuth:S("fetchWithAuth"),connection:Object.freeze({sendMessagePromise:S("connection.sendMessagePromise"),subscribeMessage:S("connection.subscribeMessage"),subscribeEvents:S("connection.subscribeEvents"),sendMessage:S("connection.sendMessage")}),auth:Object.freeze({data:Object.freeze({}),refreshAccessToken:S("auth.refreshAccessToken"),wsUrl:""})});e.customCards=[];let I=()=>{let $=[],_=Array.isArray(e.customCards)?e.customCards:[];for(let P=0;P<_.length&&$.length<100;P+=1){let H=_[P];H&&typeof H=="object"&&$.push({type:v(H.type),name:v(H.name),description:v(H.description)})}g({type:"cards",cards:$})};e.customElements.define=function($,_,P){o($,_,P),g({type:"defined",tag:v($)})};class Y extends e.HTMLElement{constructor(){super();let _=this.attachShadow({mode:"open"}),P=n.createElement("style");P.textContent=":host{display:block;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color,#212121);border-radius:var(--ha-card-border-radius,12px);box-shadow:var(--ha-card-box-shadow,none);overflow:hidden;box-sizing:border-box}",_.appendChild(P),_.appendChild(n.createElement("slot"))}}o("ha-card",Y);let j=($,_,P)=>{let H;try{H=n.createElement($),typeof H.setConfig=="function"&&H.setConfig(_)}catch(z){E("set_config",z);return}m=H;try{H.hass=P,n.body.appendChild(H)}catch(z){E("mod_error",z);return}g({type:"rendered"})},Ie=$=>{c=!0,a=$.token,e.hass=U($.hass),e.setInterval(()=>g({type:"heartbeat"}),1e3);let _=n.createElement("script");_.textContent=String($.modSource);try{n.head.appendChild(_)}catch(H){E("mod_error",H);return}I();let P=String($.tag);if(r.get(P)!==void 0){j(P,$.config,e.hass);return}r.whenDefined(P).then(()=>j(P,$.config,e.hass),H=>E("not_defined",H))};e.onerror=($,_,P,H,z)=>(E("mod_error",z||$),!0),e.addEventListener("unhandledrejection",$=>{typeof $.preventDefault=="function"&&$.preventDefault()});let ce=$=>{let _=$.data;if(!(!c||!_||typeof _!="object"||_.token!==a)&&_.type==="hass"&&_.hass&&typeof _.hass=="object"&&(e.hass=U(_.hass),m!==null))try{m.hass=e.hass}catch(P){E("mod_error",P)}};e.addEventListener("message",$=>{if(c||$.source!==e.parent)return;let _=$.data;if(!_||typeof _!="object"||_.type!=="init")return;let P=$.ports;!P||P.length!==1||!P[0]||typeof _.token!="string"||_.token===""||(d=P[0],d.onmessage=ce,Ie(_))}),t({type:"ready",token:""},"*")}var fp=`(${nv.toString()})(window);`;var sv=1e3,iv=3e3,av=50,lv=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${lp}"></head><body><script>${fp}<\/script></body></html>`;function gp(e){let{modSource:n,tag:t,config:r,onError:o,onReady:s,onBlocked:i}=e,a=rp(r),d=e.timeoutMs??5e3,c=hp(),m=document.createElement("iframe");m.setAttribute("sandbox",ap),m.setAttribute("referrerpolicy","no-referrer"),m.setAttribute("allow",""),m.setAttribute("loading","eager"),m.setAttribute("title","Mod preview"),m.srcdoc=lv;let p=new MessageChannel,g=p.port1,v=!1,E=!1,C=!1,S=0,U=e.hass,I=Date.now(),Y=0,j=[],Ie=[],ce=null,$=null,_=B=>v||!E?!1:(g.postMessage(B),!0),P=sp(B=>{if(v||!E)return;let N;try{N=Os(B,{entityIds:a})}catch{z("mirror_error","state mirror failed");return}try{_({type:"hass",token:c,hass:N})}catch{return}},1e3),H=()=>{if(!v){v=!0,window.removeEventListener("message",ri),g.onmessage=null;for(let B of[p.port1,p.port2])try{B.close()}catch{continue}ce!==null&&clearTimeout(ce),$!==null&&clearInterval($),ce=null,$=null,P.cancel(),m.remove()}},z=(B,N)=>{if(!v){H();try{o({code:B,message:N})}catch{return}}},sh=()=>{let B,N;try{B=Os(U,{entityIds:a}),N=op(r)}catch{z("mirror_error","state mirror failed");return}let nn=m.contentWindow;if(nn===null){z("post_failed","sandbox window unavailable");return}E=!0;let rn={type:"init",token:c,modSource:n,tag:t,config:N,hass:B};try{nn.postMessage(rn,"*",[p.port2])}catch(oi){z("post_failed",oi instanceof Error?oi.message:"post failed")}};function ri(B){if(v)return;let N=m.contentWindow,nn=B.source;if(N===null||nn!==N)return;let rn=Is(B.data,"");if(!(rn===null||rn.type!=="ready")){if(E){z("navigated","sandbox frame sent a second ready");return}I=Date.now(),sh()}}function ih(B){if(v||!E)return;let N=Is(B.data,c);if(!(N===null||N.type==="ready"))switch(I=Date.now(),N.type){case"heartbeat":return;case"defined":j.length<200&&!j.includes(N.tag)&&j.push(N.tag);return;case"cards":Ie=N.cards;return;case"rendered":if(ce!==null&&clearTimeout(ce),ce=null,C)return;C=!0,s!==void 0&&s({tags:[...j],cards:[...Ie]});return;case"error":z(N.code,N.message);return;case"request":if(Y+=1,Y>av)return;try{_({type:"refused",token:c,id:N.id,error:ip})}catch{return}return}}return m.addEventListener("load",()=>{S+=1,S>1&&z("navigated","sandbox frame navigated")}),typeof n!="string"||n.length>4194304?queueMicrotask(()=>z("too_large","mod source rejected")):Ds(t)?(window.addEventListener("message",ri),g.onmessage=ih,ce=setTimeout(()=>z("timeout","mod did not render in time"),d),$=setInterval(()=>{Date.now()-I>iv&&(z("heartbeat_lost","sandbox stopped responding"),i!==void 0&&i())},sv)):queueMicrotask(()=>z("invalid_tag","invalid custom element name")),{element:m,update(B){v||(U=B,E&&P(B))},destroy:H}}var kt=[V,W,T`
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
`];var w={title:"Mods",intro:"Add-ons that change how your dashboard looks: styling, cards, layouts and chrome. Previews run in an isolated frame and nothing is installed from here.",loading:"Loading mods...",loadFailed:"Could not load the mods list.",retry:"Try again",search:"Search mods",searchPlaceholder:"Name or description",filters:"Filter",filterAll:"All",filterInstalled:"Installed",kinds:"Kind",kindAll:"All kinds",kindLabels:{styling:"Styling",cards:"Cards",layout:"Layout",templating:"Templating",chrome:"Chrome"},integrationChip:"Integration",integrationNote:"This integration comes from {store}. It acts on your real dashboard and cannot be previewed in the sandbox. Install it through {store}.",empty:"No mods match.",truncated:"The list is incomplete. Narrow the search to find more.",installedChip:"Installed",pinnedChip:"Preview available",stars:e=>`${e} stars`,license:e=>`License: ${e}`,repository:"Repository",openInStore:"Open in {label}",select:e=>`Preview ${e}`,nothingSelected:"Select a mod to see its preview.",installedNote:"Already in your dashboard resources",installedHint:"This card is already loaded in your dashboard, so it is previewed with the real card helpers.",installedUnavailable:"The real card could not be created here. Check it in the Preview tab or on a dashboard.",unpinned:"Preview unavailable: this mod is not in the pinned set",configLabel:"Your card config (JSON)",configHelp:"Up to 4 KB. The type must be custom: followed by the card tag.",configProblems:{empty:"Enter a card config.",too_large:"The card config is larger than 4 KB.",invalid:"The card config is not valid JSON.",not_object:"The card config must be an object.",no_type:"The card config needs a type such as custom:my-card.",bad_type:"The type must start with custom: followed by a valid card tag."},run:"Show preview",runOwn:"Run my card",advancedTitle:"Advanced: try your own card",noLiveMock:"This mod works on other cards, so it cannot be shown on its own here.",close:"Close",showCard:"Show real card",confirmTitle:"Before running third party code",isolation:dp,disclosureAuthor:cp,disclosureOwn:up,disclosureMock:pp,confirm:"Run in sandbox",cancel:"Cancel",fetching:"Fetching the pinned release...",starting:"Starting the sandbox...",running:"Preview running.",reset:"Reset",width:"Width",height:"Height 480 px",widths:{phone:"Phone",tablet:"Tablet",desktop:"Desktop"},stageLabel:"Sandboxed mod preview",errors:{not_pinned:"This mod is not in the pinned set.",hash_mismatch:"The downloaded file does not match the pinned hash, so it was refused.",too_large:"The mod file is too large to preview.",bad_content_type:"The server returned an unexpected content type.",redirect_refused:"The download tried to redirect and was refused.",network:"The network request failed.",timeout:"The request or the mod timed out.",invalid_encoding:"The mod file is not valid text.",not_found:"The mod file was not found.",fetch_failed:"The mod file could not be fetched.",rate_limited:"Too many requests. Wait a moment and try again.",catalog_unavailable:"The mod catalog is unavailable right now.",unauthorized:"You are not allowed to do that.",unknown_command:"This server does not support the Mods tab.",navigated:"The mod tried to navigate the preview frame and was stopped.",heartbeat_lost:"The preview stopped responding and was removed.",mirror_error:"The card state could not be copied into the preview.",mod_error:"The mod failed while loading.",set_config:"The card rejected this config.",unhandled_rejection:"The mod raised an unhandled error.",runtime_error:"The mod raised a runtime error.",not_defined:"The mod did not define that card tag.",invalid_tag:"That is not a valid custom card tag.",post_failed:"The preview frame could not be started.",unknown:"Something went wrong. Try again."},unknownCode:e=>`Something went wrong (${e}). Try again.`};function br(e){let n=w.errors[e];return n||(e==="unknown"?w.errors.unknown:w.unknownCode(e))}var bp="2024-01-01T12:00:00+00:00",dv={"light.mock_lamp":{entity_id:"light.mock_lamp",state:"on",attributes:{friendly_name:"Living room lamp",brightness:180,icon:"mdi:lamp"}},"switch.mock_fan":{entity_id:"switch.mock_fan",state:"off",attributes:{friendly_name:"Bedroom fan",icon:"mdi:fan"}},"sensor.mock_temperature":{entity_id:"sensor.mock_temperature",state:"21.5",attributes:{friendly_name:"Room temperature",unit_of_measurement:"C",device_class:"temperature"}},"climate.mock_thermostat":{entity_id:"climate.mock_thermostat",state:"heat",attributes:{friendly_name:"Thermostat",current_temperature:20.5,temperature:22,hvac_action:"heating",hvac_modes:["off","heat","cool"]}},"cover.mock_blind":{entity_id:"cover.mock_blind",state:"open",attributes:{friendly_name:"Window blind",icon:"mdi:blinds"}}},$t=["light.mock_lamp","switch.mock_fan","sensor.mock_temperature"],Hs={styling:{tag:null,config:{type:"entities",title:"Example card",entities:$t,card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An entities card with three example rows. This mod restyles cards like this one."},cards:{tag:null,config:{type:"entities",title:"Example card",entities:$t},summary:"An entities card with three example rows."},layout:{tag:null,config:{type:"vertical-stack",cards:[{type:"entity",entity:"sensor.mock_temperature"},{type:"entities",entities:$t}]},summary:"Two example cards arranged together. This mod controls how cards are laid out."},templating:{tag:null,config:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"},summary:"One example card. This mod lets you reuse a card design in many places."},chrome:{tag:null,config:{type:"entities",title:"Example dashboard",entities:$t},summary:"An example dashboard. This mod changes the header and sidebar around your cards."}},yp={"piitaya/lovelace-mushroom":{tag:"mushroom-entity-card",config:{type:"custom:mushroom-entity-card",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Mushroom entity card for an example lamp."},"custom-cards/button-card":{tag:"button-card",config:{type:"custom:button-card",entity:"light.mock_lamp",name:"Living room lamp",show_state:!0},summary:"A button card for an example lamp."},"Clooos/Bubble-Card":{tag:"bubble-card",config:{type:"custom:bubble-card",card_type:"button",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Bubble button for an example lamp."},"jcwillox/lovelace-paper-buttons-row":{tag:"paper-buttons-row",config:{type:"custom:paper-buttons-row",buttons:[{entity:"light.mock_lamp"},{entity:"switch.mock_fan"},{entity:"cover.mock_blind"}]},summary:"A row of three example buttons."},"ofekashery/vertical-stack-in-card":{tag:null,config:{type:"custom:vertical-stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:$t}]},summary:"Two example cards merged into one panel."},"custom-cards/stack-in-card":{tag:null,config:{type:"custom:stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:$t}]},summary:"Two example cards merged into one panel."},"ownbee/bootstrap-grid-card":{tag:null,config:{type:"custom:bootstrap-grid-card",cards:[{type:"row",cards:[{type:"entity",entity:"light.mock_lamp"},{type:"entity",entity:"switch.mock_fan"}]}]},summary:"Two example cards side by side in a grid."},"iantrich/config-template-card":{tag:null,config:{type:"custom:config-template-card",entities:["sensor.mock_temperature"],card:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"}},summary:"An example card whose settings come from a template."},"thomasloven/lovelace-card-mod":{...Hs.styling,config:{type:"thermostat",entity:"climate.mock_thermostat",card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An example thermostat card with rounded corners applied by this mod."}};function yr(e){return(Object.prototype.hasOwnProperty.call(yp,e.full_name)?yp[e.full_name]:null)??Hs[e.kind]??Hs.cards}var cv=["language","locale","themes","selectedTheme","localize"];function Ns(e){let n=e&&typeof e=="object"?e:{},t={};for(let s of cv)n[s]!==void 0&&(t[s]=n[s]);let r={};for(let[s,i]of Object.entries(dv))r[s]={...i,attributes:{...i.attributes},last_changed:bp,last_updated:bp};let o=async()=>{};return{...t,states:r,entities:{},devices:{},areas:{},user:{id:"mock",name:"Guest",is_admin:!1},callService:o,callWS:o}}var uv=[["phone",390],["tablet",768],["desktop",1024]],pv=480,vp=new Set;function wp(e,n){return`${e.full_name.toLowerCase()}@${e.tag??""}:${n?"own":"mock"}`}var hv=async(e,n)=>{let t=await gn();return bn(t,n)};function Bs(e,n){let t=Vu(e.full_name),r=n?qu(n,e.full_name,e.category):void 0;return l`
    ${t?l`<a class="link" href=${t} target="_blank" rel="noopener noreferrer">${w.repository}</a>`:u}
    ${r&&n?l`<a class="link" id="store-link" href=${r} target="_blank" rel="noopener noreferrer">${te(w.openInStore,n)}</a>`:u}
  `}var Fs=class extends A{constructor(){super(...arguments);this.mod=null;this.createSandbox=gp;this.cardFactory=hv;this.configText="";this.problem="";this.phase="idle";this.failure="";this.width=390;this.installedFailed=!1;this.sandbox=null;this.card=null;this.token=0;this.own=!1;this.pending=null;this.focusTarget=null;this.onConfigInput=t=>{this.configText=t.target.value,this.problem=""};this.onRun=()=>{this.begin(this.mockTarget())};this.onRunOwn=()=>{let t=Ps(this.configText);if(!t.ok){this.problem=t.problem;return}this.begin(this.ownTarget())};this.onConfirm=()=>{this.mod&&this.pending&&vp.add(wp(this.mod,this.pending.own)),this.start()};this.onCancel=()=>{this.focusTarget="run",this.phase="idle"};this.onReset=()=>{this.stop(),this.focusTarget="run",this.phase="idle",this.failure=""}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1},createSandbox:{attribute:!1},cardFactory:{attribute:!1},configText:{state:!0},problem:{state:!0},phase:{state:!0},failure:{state:!0},width:{state:!0},installedFailed:{state:!0}}}static{this.styles=kt}disconnectedCallback(){super.disconnectedCallback(),this.stop()}willUpdate(t){t.has("mod")&&(this.stop(),this.phase="idle",this.problem="",this.failure="",this.installedFailed=!1,this.configText=this.mod?Gu(this.mod):"")}mockTarget(){let t=this.mod;if(!t||!this.hass)return null;let r=yr(t);return{tag:r.tag??"",config:r.config,hass:Ns(this.hass),own:!1}}ownTarget(){let t=Ps(this.configText);return!t.ok||!this.hass?null:{tag:t.tag,config:t.config,hass:this.hass,own:!0}}updated(t){t.has("mod")&&this.mod?.installed&&this.mod.category==="plugin"&&this.showInstalled(this.mockTarget()),t.has("hass")&&this.hass&&this.sandbox&&this.sandbox.update(this.own?this.hass:Ns(this.hass));let r=this.stage();r&&this.sandbox&&this.sandbox.element.parentNode!==r&&r.append(this.sandbox.element),this.sandbox&&this.sizeFrame(),this.applyFocus()}applyFocus(){let t=this.focusTarget;if(!t)return;let r=this.renderRoot.querySelector(t==="confirm"?"#confirm-h":"#run, #run-own");r&&(this.focusTarget=null,r.focus())}stage(){return this.renderRoot.querySelector(".stage")}sizeFrame(){let t=this.sandbox?.element;t&&(t.style.width=`${this.width}px`,t.style.height=`${pv}px`,t.style.maxWidth="100%",t.style.border="0")}stop(){this.token+=1,this.sandbox?.destroy(),this.sandbox=null,this.card?.remove(),this.card=null}async showInstalled(t){if(!t)return;this.own=t.own;let r=++this.token;this.card?.remove(),this.card=null,this.installedFailed=!1;let o;try{o=await this.cardFactory(t.hass,t.config)}catch{r===this.token&&(this.installedFailed=!0);return}r===this.token&&(o.hass=t.hass,this.card=o,await this.updateComplete,this.stage()?.append(o))}begin(t){t&&(this.pending=t,this.problem="",this.mod&&vp.has(wp(this.mod,t.own))?this.start():(this.focusTarget="confirm",this.phase="confirm"))}fail(t){this.stop(),this.failure=br(t),this.phase="error"}async start(){let t=this.mod,r=this.hass,o=this.pending;if(!t||!r||!o)return;this.own=o.own,this.stop();let s=this.token;this.phase="fetching";let i;try{i=(await Ku(r,t.full_name)).source}catch(a){s===this.token&&this.fail(G(a));return}s===this.token&&(this.phase="starting",this.sandbox=this.createSandbox({modSource:i,tag:o.tag,config:o.config,hass:o.hass,onReady:()=>{s===this.token&&(this.phase="running")},onError:a=>{s===this.token&&this.fail(a.code)}}))}renderAdvanced(t,r,o){return l`
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
        ${uv.map(([t,r])=>l`<button
            type="button"
            data-width=${r}
            aria-pressed=${this.width===r?"true":"false"}
            @click=${()=>{this.width=r}}
          >
            ${w.widths[t]} ${r}
          </button>`)}
      </div>
      <span class="muted">${w.height}</span>
    `}renderSandbox(){let t=this.phase==="fetching"||this.phase==="starting";if(this.phase==="idle"){let r=this.mod?yr(this.mod):null;return l`
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
    `}renderBody(t){return t.category==="integration"?l`<p class="notice" id="integration-note">${te(w.integrationNote,ze(this.hass))}</p>`:t.installed?l`
        <p class="notice" id="installed-note">${w.installedNote}</p>
        <p class="muted">${w.installedHint}</p>
        ${this.installedFailed?l`<p class="notice error" id="installed-failed" role="alert">${w.installedUnavailable}</p>`:u}
        <p class="muted" id="mock-summary">${this.mod?yr(this.mod).summary:""}</p>
        <div class="stage" role="region" aria-label=${w.stageLabel}></div>
        ${this.renderAdvanced(w.showCard,()=>{this.showInstalled(this.ownTarget())},"show-card")}
      `:Wu(t)?this.renderSandbox():l`<p class="notice" id="unpinned">${w.unpinned}</p>`}render(){let t=this.mod;return t?l`
      ${t.pinned&&t.license?l`<p class="muted" id="license">${w.license(t.license)}</p>`:u}
      <p class="links">${Bs(t,ze(this.hass))}</p>
      ${this.renderBody(t)}
    `:l`<p class="muted">${w.nothingSelected}</p>`}};customElements.get("hats-lite-mods-preview")||customElements.define("hats-lite-mods-preview",Fs);var xp='a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',mv=T`
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
`;function fv(e){let n=e.activeElement;for(;n?.shadowRoot?.activeElement;)n=n.shadowRoot.activeElement;return n}var Us=class extends A{constructor(){super(...arguments);this.mod=null;this.onKey=t=>{if(t.key==="Escape"){t.stopPropagation(),t.preventDefault(),this.close();return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=fv(document),s=r.findIndex(a=>a===o),i=r.length-1;t.shiftKey&&s<=0?(t.preventDefault(),r[i].focus()):!t.shiftKey&&(s===-1||s===i)&&(t.preventDefault(),r[0].focus())};this.downOnBackdrop=!1;this.onBackdropDown=t=>{this.downOnBackdrop=t.target===t.currentTarget};this.onBackdrop=t=>{let r=this.downOnBackdrop;this.downOnBackdrop=!1,r&&t.target===t.currentTarget&&this.close()}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1}}}static{this.styles=[kt,mv]}firstUpdated(){this.renderRoot.querySelector("#close")?.focus()}close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}focusables(){let t=Array.from(this.renderRoot.querySelectorAll(xp)),r=this.renderRoot.querySelector("hats-lite-mods-preview")?.shadowRoot,o=r?Array.from(r.querySelectorAll(xp)):[];return[...t,...o].filter(s=>!s.closest("details:not([open])")||s.tagName==="SUMMARY")}render(){let t=this.mod;return t?l`
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
    `:l``}};customElements.get("hats-lite-mods-dialog")||customElements.define("hats-lite-mods-dialog",Us);var zs=["browse","preview","designer","people","mods"],gv=["theme","plugin","integration"],bv=/^[A-Za-z0-9_.-]{1,100}$/,yv=/^\/[a-z0-9-]{1,40}$/,vv=/^\/([a-z]+)\/?$/,wv=new Map([["gallery","browse"],["preview","preview"],["designer","designer"],["people","people"],["mods","mods"]]);function xv(e){return e==="browse"?"gallery":e}function kv(e){return zs.includes(e)}function vr(e){return typeof e=="string"&&bv.test(e)&&e!=="."&&e!==".."}function kp(e){return gv.includes(e)}function $v(e,n){return e==="preview"?n==="theme":e==="mods"?n!=="theme":!1}function $p(e,n){if(typeof n!="object"||n===null)return!1;let t=n,{owner:r,repository:o,category:s}=t;return vr(r)&&vr(o)&&kp(s)&&$v(e,s)}function js(e,n){let t=e.getAll(n);return t.length===1?t[0]:null}function Ev(e,n){let t=new URLSearchParams(n),r={owner:js(t,"owner"),repository:js(t,"repository"),category:js(t,"category")};return $p(e,r)?r:null}function Ep(e){return e===null?"":`?${new URLSearchParams({owner:e.owner,repository:e.repository,category:e.category}).toString()}`}function Ks(e,n){if(typeof e!="string")return{tab:"browse",item:null,canonical:!1};let t="browse",r=!1;if(e!==""&&e!=="/"){let i=vv.exec(e),a=i===null?void 0:wv.get(i[1]);if(i===null||a===void 0)return{tab:"browse",item:null,canonical:!1};t=a,r=e===`/${i[1]}`}let o=typeof n=="string"?Ev(t,n):null,s=r&&typeof n=="string"&&n===Ep(o);return{tab:t,item:o,canonical:s}}function Vs(e){return typeof e=="string"&&yv.test(e)}function wr(e,n,t){if(!Vs(e))throw new Error("Invalid route prefix");if(!kv(n))throw new Error("Invalid route tab");let r=$p(n,t)?Ep(t):"";return`${e}/${xv(n)}${r}`}function qe(e,n){if(typeof e!="string"||!kp(n))return null;let t=e.split("/");if(t.length!==2)return null;let[r,o]=t;return!vr(r)||!vr(o)?null:{owner:r,repository:o,category:n}}function Tp(e){return`${e.owner}/${e.repository}`}function xr(e,n){return e===null||n===null?e===n:e.category===n.category&&e.owner.toLowerCase()===n.owner.toLowerCase()&&e.repository.toLowerCase()===n.repository.toLowerCase()}var Tv=[["all",w.filterAll],["installed",w.filterInstalled]],Ws=class extends A{constructor(){super(...arguments);this.active=!0;this.mods=[];this.truncated=!1;this.status="idle";this.failure="";this.query="";this.filter="all";this.kind="all";this.selected="";this.deepLink=null;this.closeDialog=()=>{let t=this.selected;this.selected="",this.updateComplete.then(()=>{Array.from(this.renderRoot.querySelectorAll("[data-name]")).find(o=>o.dataset.name===t)?.querySelector(".pick")?.focus()}),this.dispatchEvent(new CustomEvent("hats-lite-mod-closed",{bubbles:!0,composed:!0}))}}static{this.properties={hass:{attribute:!1},active:{type:Boolean},mods:{state:!0},truncated:{state:!0},status:{state:!0},failure:{state:!0},query:{state:!0},filter:{state:!0},kind:{state:!0},selected:{state:!0},deepLink:{attribute:!1}}}static{this.styles=kt}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load(),(t.has("deepLink")||t.has("status"))&&this.status==="ready"&&this.syncDeepLink()}syncDeepLink(){let t=this.deepLink;if(t===null){this.selected="";return}let r=Tp(t).toLowerCase(),o=this.mods.find(s=>s.full_name.toLowerCase()===r&&s.category===t.category);o&&(this.selected=o.full_name)}openMod(t){this.selected=t.full_name,this.dispatchEvent(new CustomEvent("hats-lite-mod-opened",{bubbles:!0,composed:!0,detail:{fullName:t.full_name,category:t.category}}))}async load(){let t=this.hass;if(t){this.status="loading";try{let r=await zu(t);this.mods=r.mods,this.truncated=r.truncated,this.status="ready"}catch(r){this.failure=br(G(r)),this.status="error"}}}renderItem(t){return l`
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
        <p class="links">${Bs(t,null)}</p>
      </li>
    `}renderList(){let t=Xu(this.mods,this.query,this.filter,this.kind),r=Ss.filter(s=>this.mods.some(i=>i.kind===s)),o=[["all",w.kindAll],...r.map(s=>[s,w.kindLabels[s]])];return l`
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
          ${Tv.map(([s,i])=>l`<button
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
    `}};customElements.get("hats-lite-mods")||customElements.define("hats-lite-mods",Ws);function kr(e,n,t){let r=e?.themes?.themes;if(typeof n!="string"||!r||!Object.prototype.hasOwnProperty.call(r,n))return null;let o=r[n];if(!o||typeof o!="object")return null;let s=ie(o),a=(typeof t=="boolean"?t:e?.themes?.darkMode===!0)?"dark":"light";return{mode:a,candidate:{name:n,vars:J(s,a),entry:s,installed:!0,canApply:!0}}}function _p(e,n,t,r,o){if(!e||!Object.prototype.hasOwnProperty.call(n,t))return null;let s=ie(n[t]),i=r?.themes?.darkMode?"dark":"light",a=o.includes(t),d=r?.themes?.themes,c=d&&Object.prototype.hasOwnProperty.call(d,t)?d[t]:void 0,m=a&&!e.installed&&Bi(c,s);return{name:t,fullName:e.full_name,vars:J(s,i),entry:s,installed:a,nameCollision:m,repoUrl:zi(e.full_name),canApply:a&&!m}}function qs(e,n){return e.installed===n.installed&&e.nameCollision===n.nameCollision&&e.canApply===n.canApply&&JSON.stringify(e.vars)===JSON.stringify(n.vars)}function Sp(e,n){return!e||!n||n.installed||!e.hacs_id||je(e)?null:{fullName:e.full_name,hacsId:e.hacs_id}}function Ap(e,n){return!e||!n||!n.installed||n.nameCollision||!e.installed||!e.hacs_id||je(e)?null:{fullName:e.full_name,hacsId:e.hacs_id}}function Mp(e,n,t){if(n.name===rt&&!n.entry)return n;let r=t==="dark"?!0:t==="light"?!1:void 0,o=kr(e,n.name,r)?.candidate??null;return o&&qs(n,o)?n:o}var _v=150,$r=class{constructor(n){this.options=n;this.list=[];this.loaded=-1;this.index=-1;this.error="";this.token=0}start(n,t){this.cancel();let r=n.findIndex(o=>o.full_name===t.full_name);this.list=r<0?[t]:[...n],this.loaded=this.index=Math.max(r,0),this.error="",this.options.onChange()}clear(){this.cancel(),this.list=[],this.loaded=this.index=-1,this.error="",this.options.onChange()}cancel(){this.token+=1,this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}model(){let n=this.list[this.index];return n?{index:this.index,total:this.list.length,name:ho(n),pending:this.index!==this.loaded,error:this.error}:null}move(n){let t=dt(this.index,this.list.length,n);if(t!==null){if(this.cancel(),this.index=t,this.error="",t!==this.loaded){let r=this.token;this.timer=setTimeout(()=>{this.load(r)},_v)}this.options.onChange()}}async load(n){this.timer=void 0;let t=this.list[this.index],r=this.index;try{let o=await this.options.open(t);if(n!==this.token)return;this.loaded=r,this.options.apply(o)}catch{if(n!==this.token)return;this.index=this.loaded,this.error=f.navFailed.replace("{name}",ho(t))}this.options.onChange()}};var Zs={r:0,g:0,b:0,a:1},_r={r:255,g:255,b:255,a:1},Rp=()=>({...Zs}),Lp=()=>({..._r}),Oe=(e,n,t)=>Math.min(t,Math.max(n,e));function Gs(e){let n=e.trim();return n==="none"?0:n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n)}function Er(e){if(e===void 0)return 1;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?Oe(t,0,1):1}function Sv(e){if(!/^[0-9a-f]+$/i.test(e)||![3,4,6,8].includes(e.length))return null;let n=e.length<=4?e.replace(/./g,r=>r+r):e,t=r=>parseInt(n.slice(r,r+2),16);return{r:t(0),g:t(2),b:t(4),a:n.length===8?t(6)/255:1}}function Op(e){return e.replace(/\s*\/\s*/g," / ").split(/[\s,]+/).filter(n=>n!=="")}function Av(e){let n=Op(e),t=n.indexOf("/");return t>=0?{values:n.slice(0,t),alpha:n[t+1]}:{values:n.slice(0,3),alpha:n[3]}}function Cp(e){let n=e.trim(),t=parseFloat(n);return n.endsWith("turn")?t*360:n.endsWith("rad")?t*180/Math.PI:n.endsWith("grad")?t*.9:t}function Mv(e,n,t){let r=(e%360+360)%360,o=a=>(a+r/30)%12,s=n*Math.min(t,1-t),i=a=>t-s*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[i(0)*255,i(8)*255,i(4)*255]}function Xs(e){let n=Oe(e,0,1);return n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055}function Cv(e,n,t){let r=e+.3963377774*n+.2158037573*t,o=e-.1055613458*n-.0638541728*t,s=e-.0894841775*n-1.291485548*t,[i,a,d]=[r**3,o**3,s**3],c=[4.0767416621*i-3.3077115913*a+.2309699292*d,-1.2684380046*i+2.6097574011*a-.3413193965*d,-.0041960863*i-.7034186147*a+1.707614701*d];return[Xs(c[0])*255,Xs(c[1])*255,Xs(c[2])*255]}function Pv(e){let n=e.trim();return n.endsWith("%")?parseFloat(n)/100:parseFloat(n)}function Rv(e,n){if(e==="color"){let[o,...s]=Op(n.replace(/\/.*$/,""));if(o!=="srgb"||s.length!==3)return null;let[i,a,d]=s.map(c=>(c.endsWith("%")?parseFloat(c)/100:parseFloat(c))*255);return{r:i,g:a,b:d,a:Er(n.split("/")[1])}}let{values:t,alpha:r}=Av(n);if(t.length<3)return null;if(e==="rgb"||e==="rgba")return{r:Gs(t[0]),g:Gs(t[1]),b:Gs(t[2]),a:Er(r)};if(e==="hsl"||e==="hsla"){let[o,s,i]=Mv(Cp(t[0]),Oe(parseFloat(t[1])/100,0,1),Oe(parseFloat(t[2])/100,0,1));return{r:o,g:s,b:i,a:Er(r)}}if(e==="oklab"||e==="oklch"){let o=Pv(t[0]),s=parseFloat(t[1]),i=parseFloat(t[2]);if(e==="oklch"){let m=parseFloat(t[1]),p=Cp(t[2])*Math.PI/180;s=m*Math.cos(p),i=m*Math.sin(p)}let[a,d,c]=Cv(o,s,i);return{r:a,g:d,b:c,a:Er(r)}}return null}function Ge(e){let n=(e??"").trim().toLowerCase();if(n==="")return null;if(n==="transparent")return{r:0,g:0,b:0,a:0};if(n.startsWith("#"))return Sv(n.slice(1));let t=/^([a-z]+)\(([^)]*)\)$/.exec(n);if(!t)return null;let r=Rv(t[1],t[2]);return!r||![r.r,r.g,r.b,r.a].every(Number.isFinite)?null:{r:Oe(r.r,0,255),g:Oe(r.g,0,255),b:Oe(r.b,0,255),a:r.a}}function ye(e,n){if(e.a>=1)return e;let t=e.a;return{r:e.r*t+n.r*(1-t),g:e.g*t+n.g*(1-t),b:e.b*t+n.b*(1-t),a:1}}function Js(e,n,t){return{r:e.r+(n.r-e.r)*t,g:e.g+(n.g-e.g)*t,b:e.b+(n.b-e.b)*t,a:1}}function Ys(e){let n=e/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function Et(e){return .2126*Ys(e.r)+.7152*Ys(e.g)+.0722*Ys(e.b)}function Dp(e,n){let t=Et(e),r=Et(n);return(Math.max(t,r)+.05)/(Math.min(t,r)+.05)}function en(e,n){return n.length===0?1/0:Math.min(...n.map(t=>Dp(ye(e,t),t)))}function Tr(e){let n=t=>Math.round(Oe(t,0,255)).toString(16).padStart(2,"0");return`#${n(e.r)}${n(e.g)}${n(e.b)}`}function Qs(e){return en(Zs,e)>=en(_r,e)?"#000000":"#ffffff"}function Ip(e,n,t=4.5){if(n&&e.length>0){let r=ye(n,e[0]);if(e.every(o=>Dp(r,o)>=t))return Tr(r)}return Qs(e)}function Pp(e,n,t,r){let o=e,s=en(e,t);for(let i=1;i<=50;i+=1){let a=Js(e,n,i/50),d=en(a,t);if(d>=r)return{found:a,best:a,bestRatio:d};d>s&&(o=a,s=d)}return{found:null,best:o,bestRatio:s}}function Hp(e,n,t){if(en(e,n)>=t)return null;let r=ye(e,n[0]??_r),o=Pp(r,Zs,n,t),s=Pp(r,_r,n,t);if(o.found&&s.found){let i=Math.abs(Et(o.found)-Et(r)),a=Math.abs(Et(s.found)-Et(r));return Tr(i<=a?o.found:s.found)}return o.found||s.found?Tr(o.found??s.found):Tr(o.bestRatio>=s.bestRatio?o.best:s.best)}var ei={bg:"var(--hl-src-bg)",surface:"var(--hl-src-surface)",raised:"var(--hl-src-raised)",text:"var(--hl-src-text)",muted:"var(--hl-src-muted)",line:"var(--hl-src-line)",accent:"var(--hl-src-accent)",accentInk:"var(--hl-src-accent-ink)",ok:"var(--hl-src-ok)",warn:"var(--hl-src-warn)"},ti=["--hl-on-accent","--hl-text-ink","--hl-muted-ink","--hl-bg-text-ink","--hl-bg-muted-ink","--hl-ok-ink","--hl-warn-ink","--hl-accent-text-ink","--hl-edge-ink","--hl-focus-ink"],De=4.5,Np=3;function Fp(){return Object.fromEntries(ti.map(e=>[e,null]))}function Sr(e){let n=Ge(e);return n&&n.a>0?n:null}function Bp(e){let n=e.dark?Rp():Lp(),t=Sr(e.accent),r=!t&&e.accent!==""&&Ge(e.accent)===null;if(!t&&!r)return Fp();let o=Sr(e.bg),s=o?ye(o,n):null,i=s??n,a=Sr(e.surface),d=Sr(e.raised),c=a?ye(a,i):i,m=d?ye(d,c):c,p=[c,m],g=[s??c],v=[...p,...s?[s]:[]],E=t?Js(c,ye(t,c),.22):c,C=Fp();if(t){let U=v.map(I=>ye(t,I));C["--hl-on-accent"]=Ip(U,Ge(e.accentInk),De)}let S=(U,I,Y,j)=>{let Ie=Ge(I);Ie?C[U]=Hp(Ie,Y,j):C[U]=I===""?null:Qs(Y)};return S("--hl-text-ink",e.text,[...v,E],De),S("--hl-muted-ink",e.muted,v,De),S("--hl-bg-text-ink",e.text,g,De),S("--hl-bg-muted-ink",e.muted,g,De),S("--hl-ok-ink",e.ok,p,De),S("--hl-warn-ink",e.warn,p,De),S("--hl-accent-text-ink",e.accent,v,De),S("--hl-edge-ink",e.line,v,Np),S("--hl-focus-ink",e.accent,v,Np),C}function Lv(e){let n=e?.themes;return`${e?.selectedTheme?.theme??n?.theme??""}|${n?.darkMode===!1?"light":"dark"}`}var Ov=/^(rgba?\(|color\(\s*srgb[\s)])/i,tn;function Dv(){if(tn!==void 0)return tn;try{tn=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})}catch{tn=null}return tn}var Iv="unparseable";function Up(e,n,t){return e.clearRect(0,0,1,1),e.fillStyle=n,e.fillStyle=t,e.fillRect(0,0,1,1),Array.from(e.getImageData(0,0,1,1).data)}function Hv(e){if(e==="transparent")return"";if(e===""||Ov.test(e))return e;let n=Dv();if(!n)return e;try{let[t,r,o,s]=Up(n,"#000000",e);return Up(n,"#ffffff",e).some((a,d)=>a!==[t,r,o,s][d])?Iv:s===0?"":`rgba(${t}, ${r}, ${o}, ${Math.round(s/255*1e3)/1e3})`}catch{return e}}var Ar=class{constructor(n){this.host=n;this.probe=null;this.observer=null;this.media=null;this.frame=0;this.signature="";this.applied="";this.onScheme=()=>this.schedule();n.addController(this)}hostConnected(){this.observer=new MutationObserver(()=>this.schedule()),this.observer.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),this.media=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):null,this.media?.addEventListener("change",this.onScheme),this.schedule()}hostDisconnected(){this.observer?.disconnect(),this.observer=null,this.media?.removeEventListener("change",this.onScheme),this.media=null,this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.probe?.remove(),this.probe=null,this.applied=""}hostUpdated(){let n=Lv(this.host.hass);n!==this.signature&&(this.signature=n,this.schedule())}refresh(){this.schedule()}schedule(){this.frame||!this.host.isConnected||(this.frame=requestAnimationFrame(()=>{this.frame=0,this.run()}))}ensureProbe(){if(this.probe?.isConnected)return this.probe;let n=document.createElement("span");n.setAttribute("aria-hidden","true"),n.style.display="none";for(let t=0;t<Object.keys(ei).length;t+=1)n.appendChild(document.createElement("i"));return this.host.renderRoot.appendChild(n),this.probe=n,n}readAll(n){let t=Object.entries(ei),r=Array.from(n.children);return t.forEach(([,o],s)=>{r[s].style.backgroundColor="",r[s].style.backgroundColor=o}),Object.fromEntries(t.map(([o],s)=>{let i=Hv(getComputedStyle(r[s]).backgroundColor.trim()),a=Ge(i);return[o,a&&a.a===0?"":i]}))}run(){if(!this.host.isConnected)return;let n=this.ensureProbe(),t={dark:this.host.hass?.themes?.darkMode!==!1,...this.readAll(n)},r=JSON.stringify(t);if(r===this.applied)return;this.applied=r;let o=Bp(t);for(let s of ti){let i=o[s];i?this.host.style.setProperty(s,i):this.host.style.removeProperty(s)}}};var jp=[V,W,T`
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
`,hc];function Mr(e,n){if(!e||typeof e!="object")return"";let t=e[n];return typeof t=="string"?t:""}function zp(e,n,t){if(!e||typeof e!="object")return"";let r=e,o=r.modes,s=t?["dark","light"]:["light","dark"];return Mr(o?.[s[0]],n)||Mr(r,n)||Mr(r.vars,n)||Mr(o?.[s[1]],n)}function Kp(e){let n=e?.selectedTheme?.theme??e?.themes?.theme??"default",t=e?.themes?.themes,o=t&&Object.prototype.hasOwnProperty.call(t,n)?t[n]:void 0,s=e?.themes?.darkMode!==!1;return{name:n,primary:zp(o,"primary-color",s),accent:zp(o,"accent-color",s)}}var Q={shell:{title:"Themes",tabs:{browse:"Gallery",preview:"Preview",designer:"Designer",people:"People",mods:"Mods"},tabList:"HATS Lite sections",inUse:"In use",menu:"Open navigation menu",fileTheme:"Theme in file",fileLoading:"Loading theme...",fileError:"Could not load this theme.",resetApplied:"The removed theme was in use, so the Home Assistant theme is applied now"},browse:b,preview:f,designer:y};var ve=e=>`tab-${e}`,Xe=e=>`panel-${e}`;function Vp(e,n,t,r){return l`
    <nav class="tabs seg" role="tablist" aria-label=${Q.shell.tabList} @keydown=${r}>
      ${e.map(o=>{let s=n===o;return l`
          <button
            type="button"
            role="tab"
            id=${ve(o)}
            aria-controls=${Xe(o)}
            aria-selected=${s?"true":"false"}
            tabindex=${s?"0":"-1"}
            @click=${()=>t(o)}
          >
            ${Q.shell.tabs[o]}
          </button>
        `})}
    </nav>
  `}function Wp(e){let n=Kp(e),t=r=>r?l`<i style=${ae({background:r})}></i>`:l`<i class="neutral"></i>`;return l`
    <span class="chip in-use">
      <span class="label">${Q.shell.inUse}</span>
      <span class="name">${n.name}</span>
      <span class="swatches" aria-hidden="true">${t(n.primary)}${t(n.accent)}</span>
    </span>
  `}var qp=l`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;function Gp(e,n,t){switch(e){case"ArrowRight":return(n+1)%t;case"ArrowLeft":return(n-1+t)%t;case"Home":return 0;case"End":return t-1;default:return null}}function Nv(e){return e==="loading"?l`<span class="file-status" role="status">${Q.shell.fileLoading}</span>`:e==="error"?l`<span class="file-status error" role="alert">${Q.shell.fileError}</span>`:u}function Xp(e,n,t,r){return e.length<2?u:l`
    <label class="file-theme">
      ${Q.shell.fileTheme}
      <select @change=${r}>
        ${e.map(o=>l`<option value=${o} ?selected=${o===n}>${o}</option>`)}
      </select>
      ${Nv(t)}
    </label>
  `}function Yp(e){return l`<p class="notice" role="status">${e}</p>`}function Zp(e){return l`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${e.narrow?l`<button class="menu" type="button" aria-label=${Q.shell.menu} @click=${e.onMenu}>${qp}</button>`:u}
          <h1 class="title">${Q.shell.title}</h1>
        </div>
        ${Wp(e.hass)}
      </header>
      ${Vp(e.tabs,e.tab,n=>e.select(n,!0),e.onTabKey)}
      ${e.resetNotice?Yp(e.resetNotice):u}
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
          id=${Xe("browse")}
          role="tabpanel"
          aria-labelledby=${ve("browse")}
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
          id=${Xe("preview")}
          role="tabpanel"
          aria-labelledby=${ve("preview")}
          tabindex="-1"
          ?hidden=${e.tab!=="preview"}
        >
          ${e.rendered.has("preview")?l`${Xp(re(e.fileNames,e.chosenName),e.chosenName,e.fileStatus,e.onFileThemeChange)}
              <hats-lite-preview
                .hass=${e.hass}
                .candidate=${e.candidate}
                .mode=${e.previewMode}
                .nav=${e.navigator.model()}
                .install=${Sp(e.entry,e.candidate)}
                .uninstall=${Ap(e.entry,e.candidate)}
                @hats-lite-mode-change=${e.onPreviewMode}
                @hats-lite-preview-nav=${e.onNav}
                @hats-lite-theme-installed=${e.onInstalled}
              ></hats-lite-preview>`:u}
        </section>
        <section
          class="panel"
          id=${Xe("designer")}
          role="tabpanel"
          aria-labelledby=${ve("designer")}
          tabindex="-1"
          ?hidden=${e.tab!=="designer"}
        >
          ${e.rendered.has("designer")?l`<hats-lite-designer .hass=${e.hass}></hats-lite-designer>`:u}
        </section>
        <section class="panel" id=${Xe("people")} role="tabpanel" aria-labelledby=${ve("people")} tabindex="-1" ?hidden=${e.tab!=="people"}>
          ${e.rendered.has("people")&&e.peopleOk?l`<hats-lite-people .hass=${e.hass}></hats-lite-people>`:u}
        </section>
        <section class="panel" id=${Xe("mods")} role="tabpanel" aria-labelledby=${ve("mods")} tabindex="-1" ?hidden=${e.tab!=="mods"}>
          ${e.rendered.has("mods")&&e.modsOk?l`<hats-lite-mods .hass=${e.hass} .active=${e.tab==="mods"} .deepLink=${e.modsLink}></hats-lite-mods>`:u}
        </section>
      </main>
      </div>
    `}function Jp(e,n,t){return e!==void 0?e:n!==void 0&&t.includes(n)}var Qp="/themes",Fv="/hats-lite",Bv=/^(\/[a-z]*\/?)?$/,Uv=["owner","repository","category"],jv="hats-lite-panel",Cr=class{constructor(n){this.host=n;this.prefix=null;this.applying=!1;this.pending=null}read(n){if(this.pending=null,typeof n!="object"||n===null)return;let{prefix:t,path:r}=n;if(Vs(t)){if(t===Fv){if(this.host.hass()===void 0){this.pending=n;return}if(this.hasOurThemesPanel()){this.redirectLegacy(r);return}}this.prefix=t,this.settle(Ks(r,window.location.search))}}retry(){let n=this.pending;n!==null&&this.read(n)}go(n,t=null,r=!1){if(this.applying||this.prefix===null)return;let o=wr(this.prefix,n,t);o!==window.location.pathname+window.location.search&&this.write(o,r)}settle(n){let t=this.apply(n);this.go(t.tab,t.item,!0)}apply(n){this.applying=!0;try{return this.host.apply(n)??n}finally{this.applying=!1}}hasOurThemesPanel(){let n=this.host.hass()?.panels;return typeof n!="object"||n===null||!Object.prototype.hasOwnProperty.call(n,"themes")?!1:n.themes?.config?._panel_custom?.name===jv}redirectLegacy(n){let t=window.location.search,r=new URLSearchParams(t),o=typeof n=="string"&&Bv.test(n)?Ks(n,t):null,s=o!==null&&o.item===null&&Uv.some(a=>r.has(a)),i=o===null||s?wr(Qp,"browse"):wr(Qp,o.tab,o.item);this.write(i,!0)}write(n,t){t?window.history.replaceState(null,"",n):window.history.pushState(null,"",n),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:t}}))}};var zv=100,Kv=50;function Vv(e){return new Promise(n=>setTimeout(n,e))}async function eh(e,n){for(let t=0;t<Kv;t+=1){if(!n())return null;let r=e();if(r&&(await r.updateComplete,r.loaded))return r;await Vv(zv)}return null}function Wv(e,n){return e.find(t=>xr(qe(t.full_name,"theme"),n))??null}async function th(e,n,t){try{let r=await e.openEntry(n);return t()?Object.keys(r?.themes??{}).length>0?{status:"opened",detail:r}:{status:"missing"}:{status:"stale"}}catch{return t()?{status:"missing"}:{status:"stale"}}}async function nh(e,n,t){let r=await eh(t,n);if(!n())return{status:"stale"};let o=r?Wv(r.entries,e):null;return!r||!o?{status:"missing"}:th(r,o,n)}async function rh(e,n){let t=await eh(n,e);if(!e())return{status:"stale"};let r=t?.visibleEntries()[0];return!t||!r?{status:"missing"}:th(t,r,e)}var oh=4,qv={tab:"browse",item:null,canonical:!0},Pr=class{constructor(n){this.host=n;this.probes={people:!1,mods:!1};this.waiting=null;this.linkToken=0;this.liveDeep=null;this.linkRun=Promise.resolve();this.running=0;this.visited=!1;this.retries=0;this.gone=!1;this.timer=null;this.router=new Cr({apply:t=>this.apply(t),hass:()=>n.hass()})}read(n){this.router.read(n)}hassChanged(){this.router.retry(),this.settle()}attach(){this.gone=!1}dispose(){this.gone=!0,this.cancel(),this.timer!==null&&clearTimeout(this.timer),this.timer=null}settle(){if(this.gone)return;if(this.host.tab()!=="preview"){this.visited=!1,this.retries=0;return}if(this.visited||this.running>0||this.retries>=oh||this.host.previewing())return;this.host.gallery()?.loaded&&this.openFirst()}later(){this.timer!==null||this.retries>=oh||(this.timer=setTimeout(()=>{this.timer=null,this.visited=!1,this.settle()},1500))}go(n,t=null,r=!1){this.cancel(),this.router.go(n,t,r)}choose(n,t,r){let o=this.host.tab()!==n;o&&(this.visited=!1,this.retries=0),this.host.show(n),this.go(n,t),r&&o&&n==="preview"&&this.openFirst()}probed(n,t){this.probes[n]=!0;let r=this.waiting;r?.tab===n?(this.waiting=null,this.host.tabs().includes(n)?this.showRoute(r):this.fallback()):!t&&this.host.tab()===n&&this.fallback()}cancel(){this.linkToken+=1,this.waiting=null}apply(n){return(n.tab!=="preview"||n.item!==null)&&(this.linkToken+=1),this.waiting=null,this.probing(n.tab)?(this.waiting=n,this.host.show("browse"),this.host.setModsLink(null),n):this.host.tabs().includes(n.tab)?(this.showRoute(n),n):(this.host.show("browse"),this.host.setModsLink(null),qv)}showRoute(n){let t=this.host.tab()!==n.tab;t&&(this.visited=!1,this.retries=0),this.host.show(n.tab),this.host.setModsLink(n.tab==="mods"?n.item:null),n.tab==="preview"&&(n.item!==null?(!this.host.previewing()||!xr(n.item,this.host.previewed()))&&this.startLink(n.item):t&&!this.host.previewing()&&this.openFirst())}probing(n){return(n==="people"||n==="mods")&&!this.probes[n]}fallback(){this.host.show("browse"),this.router.go("browse",null,!0)}openFirst(){this.host.previewing()||this.liveDeep!==null&&this.liveDeep===this.linkToken||this.startLink(null)}startLink(n){let t=++this.linkToken;this.visited=!0,this.running+=1,n===null&&(this.retries+=1),n!==null&&(this.liveDeep=t),this.linkRun=this.linkRun.then(()=>this.runLink(n,t)).catch(()=>{})}async runLink(n,t){let r=()=>t===this.linkToken,o=()=>this.host.gallery();try{let s=n===null?await rh(r,o):await nh(n,r,o);if(s.status==="opened"){let i=qe(s.detail.entry.full_name,"theme");this.host.openLinked(s.detail,i),this.router.go("preview",i,!0)}else s.status==="missing"&&n!==null?this.fallback():n===null&&(this.visited=!1,this.later())}catch{n!==null?r()&&this.fallback():(this.visited=!1,this.later())}finally{this.running-=1,this.liveDeep===t&&(this.liveDeep=null)}}};var ni=class extends A{constructor(){super(...arguments);this.narrow=!1;this.tab="browse";this.entry=null;this.fileThemes={};this.fileNames=[];this.fileStatus="";this.chosenName="";this.candidate=null;this.peopleOk=!0;this.modsOk=!1;this.modsLink=null;this.resetNotice="";this.ink=new Ar(this);this.probed=!1;this.previewItem=null;this.installedNames=[];this.bundles=new ot;this.known=new Qe;this.pickToken=0;this.routes=new Pr({tabs:()=>this.tabs,tab:()=>this.tab,hass:()=>this.hass,show:t=>this.showTab(t),setModsLink:t=>{this.modsLink=t},previewing:()=>this.candidate!==null,previewed:()=>this.previewItem,gallery:()=>this.gallery(),openLinked:(t,r)=>{this.openDetail(t),this.previewItem=r}});this.rendered=new Set(["browse"]);this.onTabKey=t=>{let r=this.tabs,o=Gp(t.key,r.indexOf(this.tab),r.length);if(o===null)return;t.preventDefault();let s=r[o];this.select(s,!0),this.focusTab(s)};this.onMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};this.navigator=new $r({open:t=>{let r=this.gallery();return r?r.openEntry(r.entries.find(o=>o.full_name===t.full_name)??t):Promise.reject(new Error("gallery missing"))},apply:t=>this.showBundle(t),onChange:()=>this.requestUpdate()});this.onThemeSelected=t=>{let r=t.detail;Object.keys(r?.themes??{}).length!==0&&(this.openDetail(r),this.previewItem=qe(r.entry.full_name,"theme"),this.select("preview"),this.focusTab("preview"))};this.onPreviewTheme=t=>{let r=t.detail,o=kr(this.hass,r?.theme,r?.dark);o&&(this.navigator.clear(),this.showUnlisted(o.candidate,o.mode),this.select("preview"),this.focusTab("preview"))};this.onModOpened=t=>{let r=t.detail;this.routes.go("mods",qe(r?.fullName,r?.category))};this.onModClosed=()=>{this.routes.go("mods",null)};this.onNav=t=>{let r=t.detail?.direction;(r===1||r===-1)&&this.navigator.move(r)};this.onInstalled=async t=>{let r=t.detail,o=r?.fullName,s=this.entry?.full_name===o?this.fileNames:[];r?.removed&&Jp(r.resetSelected,this.hass?.themes?.theme,s)&&(this.setTheme(rt),this.resetNotice=Q.shell.resetApplied);let a=(await this.gallery()?.refreshCatalog())?.find(d=>d.full_name===o);a&&this.entry?.full_name===o&&(this.entry=a,this.refreshCandidate())};this.onPreviewMode=t=>{let r=t.detail?.mode;r&&(this.previewMode=r)};this.onFileThemeChange=t=>{let r=t.target.value;if(Object.prototype.hasOwnProperty.call(this.fileThemes,r)){this.pickToken+=1,this.fileStatus="",this.setCandidate(r);return}this.fetchFileTheme(r)};this.onThemeSaved=t=>{let r=t.detail;typeof r?.name=="string"&&(this.setTheme(r.name),this.select("preview"))}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0},entry:{state:!0},fileThemes:{state:!0},fileNames:{state:!0},fileStatus:{state:!0},chosenName:{state:!0},candidate:{state:!0},previewMode:{state:!0},peopleOk:{state:!0},modsOk:{state:!0},modsLink:{state:!0},resetNotice:{state:!0}}}static{this.styles=jp}get tabs(){return zs.filter(t=>t==="people"?this.peopleOk:t==="mods"?this.modsOk:!0)}showTab(t){this.rendered.add(t),this.resetNotice="",this.tab=t}select(t,r=!1){this.routes.choose(t,t==="preview"?this.previewItem:null,r)}onProbe(t,r){t==="people"?this.peopleOk=r:this.modsOk=r,this.routes.probed(t,r)}async focusTab(t){await this.updateComplete,this.renderRoot.querySelector(`#${ve(t)}`)?.focus()}connectedCallback(){super.connectedCallback(),this.routes.attach()}disconnectedCallback(){super.disconnectedCallback(),this.routes.dispose(),this.navigator.clear()}willUpdate(t){if(t.has("route")&&this.routes.read(this.route),!t.has("hass"))return;this.routes.hassChanged(),this.hass&&!this.probed&&(this.probed=!0,Cs(this.hass).then(o=>this.onProbe("mods",o)),yu(this.hass).then(o=>this.onProbe("people",o)));let r=Object.keys(this.hass?.themes?.themes??{});yn(r,this.installedNames)||(this.installedNames=r),this.candidate&&this.refreshCandidate()}build(t){return _p(this.entry,this.fileThemes,t,this.hass,this.installedNames)}refreshCandidate(){let t=this.candidate;if(t&&!this.entry){this.candidate=Mp(this.hass,t,this.previewMode),this.chosenName=this.candidate?this.chosenName:"";return}let r=this.build(this.chosenName);t&&r&&!qs(t,r)&&(this.candidate=r)}setCandidate(t){let r=this.build(t);r&&([this.chosenName,this.candidate]=[t,r])}gallery(){return this.renderRoot.querySelector("hats-lite-browse")}showUnlisted(t,r){this.pickToken+=1,this.fileStatus="",this.entry=null,this.fileThemes={},this.fileNames=[],this.chosenName=t.name,this.candidate=t,this.previewMode=r,this.previewItem=null}setTheme(t){let r=this.hass?.themes?.darkMode;this.dispatchEvent(new CustomEvent("settheme",{bubbles:!0,composed:!0,detail:ar(r===void 0?{theme:t}:{theme:t,dark:r})}))}showBundle(t){if(Lt(t?.entry))return this.showUnlisted(Ra(),this.previewMode);let r=Object.keys(t?.themes??{});if(r.length===0)return;let o=t.theme&&r.includes(t.theme)?t.theme:re(r)[0]??r[0];this.pickToken+=1,this.fileStatus="",this.entry=t.entry,this.fileThemes=t.themes,this.fileNames=[...new Set([...t.names??[],...r])],this.bundles.set(t.entry,o,{themes:t.themes,names:this.fileNames,theme:o}),this.setCandidate(o)}openDetail(t){let r=this.gallery();this.previewMode=t.mode??r?.mode,this.navigator.start(r?.visibleEntries()??[],t.entry),this.showBundle(t)}async fetchFileTheme(t){let r=this.entry;if(!r)return;let o=++this.pickToken;this.fileStatus="loading";try{let s=await mo(this.hass,this.known,this.bundles,r,t);if(o!==this.pickToken||r!==this.entry)return;this.fileStatus="",this.fileThemes=s.themes,this.setCandidate(t)}catch{o===this.pickToken&&(this.fileStatus="error")}}render(){return Zp(this)}};customElements.get("hats-lite-panel")||customElements.define("hats-lite-panel",ni);export{ni as HatsLitePanel};

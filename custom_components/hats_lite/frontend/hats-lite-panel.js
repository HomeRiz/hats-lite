var Bt=globalThis,Ut=Bt.ShadowRoot&&(Bt.ShadyCSS===void 0||Bt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ir=Symbol(),wi=new WeakMap,st=class{constructor(n,t,r){if(this._$cssResult$=!0,r!==ir)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=n,this.t=t}get styleSheet(){let n=this.o,t=this.t;if(Ut&&n===void 0){let r=t!==void 0&&t.length===1;r&&(n=wi.get(t)),n===void 0&&((this.o=n=new CSSStyleSheet).replaceSync(this.cssText),r&&wi.set(t,n))}return n}toString(){return this.cssText}},Kt=e=>new st(typeof e=="string"?e:e+"",void 0,ir),_=(e,...n)=>{let t=e.length===1?e[0]:n.reduce((r,o,i)=>r+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1],e[0]);return new st(t,e,ir)},xi=(e,n)=>{if(Ut)e.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of n){let r=document.createElement("style"),o=Bt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=t.cssText,e.appendChild(r)}},sr=Ut?e=>e:e=>e instanceof CSSStyleSheet?(n=>{let t="";for(let r of n.cssRules)t+=r.cssText;return Kt(t)})(e):e;var{is:Ku,defineProperty:zu,getOwnPropertyDescriptor:Vu,getOwnPropertyNames:Wu,getOwnPropertySymbols:qu,getPrototypeOf:Gu}=Object,zt=globalThis,ki=zt.trustedTypes,Xu=ki?ki.emptyScript:"",Yu=zt.reactiveElementPolyfillSupport,at=(e,n)=>e,ar={toAttribute(e,n){switch(n){case Boolean:e=e?Xu:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,n){let t=e;switch(n){case Boolean:t=e!==null;break;case Number:t=e===null?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch{t=null}}return t}},Ei=(e,n)=>!Ku(e,n),$i={attribute:!0,type:String,converter:ar,reflect:!1,useDefault:!1,hasChanged:Ei};Symbol.metadata??=Symbol("metadata"),zt.litPropertyMetadata??=new WeakMap;var ae=class extends HTMLElement{static addInitializer(n){this._$Ei(),(this.l??=[]).push(n)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(n,t=$i){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(n)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(n,t),!t.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(n,r,t);o!==void 0&&zu(this.prototype,n,o)}}static getPropertyDescriptor(n,t,r){let{get:o,set:i}=Vu(this.prototype,n)??{get(){return this[t]},set(s){this[t]=s}};return{get:o,set(s){let a=o?.call(this);i?.call(this,s),this.requestUpdate(n,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(n){return this.elementProperties.get(n)??$i}static _$Ei(){if(this.hasOwnProperty(at("elementProperties")))return;let n=Gu(this);n.finalize(),n.l!==void 0&&(this.l=[...n.l]),this.elementProperties=new Map(n.elementProperties)}static finalize(){if(this.hasOwnProperty(at("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(at("properties"))){let t=this.properties,r=[...Wu(t),...qu(t)];for(let o of r)this.createProperty(o,t[o])}let n=this[Symbol.metadata];if(n!==null){let t=litPropertyMetadata.get(n);if(t!==void 0)for(let[r,o]of t)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let o=this._$Eu(t,r);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(n){let t=[];if(Array.isArray(n)){let r=new Set(n.flat(1/0).reverse());for(let o of r)t.unshift(sr(o))}else n!==void 0&&t.push(sr(n));return t}static _$Eu(n,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof n=="string"?n.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(n=>n(this))}addController(n){(this._$EO??=new Set).add(n),this.renderRoot!==void 0&&this.isConnected&&n.hostConnected?.()}removeController(n){this._$EO?.delete(n)}_$E_(){let n=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(n.set(r,this[r]),delete this[r]);n.size>0&&(this._$Ep=n)}createRenderRoot(){let n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xi(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(n=>n.hostConnected?.())}enableUpdating(n){}disconnectedCallback(){this._$EO?.forEach(n=>n.hostDisconnected?.())}attributeChangedCallback(n,t,r){this._$AK(n,r)}_$ET(n,t){let r=this.constructor.elementProperties.get(n),o=this.constructor._$Eu(n,r);if(o!==void 0&&r.reflect===!0){let i=(r.converter?.toAttribute!==void 0?r.converter:ar).toAttribute(t,r.type);this._$Em=n,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(n,t){let r=this.constructor,o=r._$Eh.get(n);if(o!==void 0&&this._$Em!==o){let i=r.getPropertyOptions(o),s=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:ar;this._$Em=o;let a=s.fromAttribute(t,i.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(n,t,r,o=!1,i){if(n!==void 0){let s=this.constructor;if(o===!1&&(i=this[n]),r??=s.getPropertyOptions(n),!((r.hasChanged??Ei)(i,t)||r.useDefault&&r.reflect&&i===this._$Ej?.get(n)&&!this.hasAttribute(s._$Eu(n,r))))return;this.C(n,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(n,t,{useDefault:r,reflect:o,wrapped:i},s){r&&!(this._$Ej??=new Map).has(n)&&(this._$Ej.set(n,s??t??this[n]),i!==!0||s!==void 0)||(this._$AL.has(n)||(this.hasUpdated||r||(t=void 0),this._$AL.set(n,t)),o===!0&&this._$Em!==n&&(this._$Eq??=new Set).add(n))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let n=this.scheduleUpdate();return n!=null&&await n,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,i]of r){let{wrapped:s}=i,a=this[o];s!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,i,a)}}let n=!1,t=this._$AL;try{n=this.shouldUpdate(t),n?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw n=!1,this._$EM(),r}n&&this._$AE(t)}willUpdate(n){}_$AE(n){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(n)),this.updated(n)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(n){return!0}update(n){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(n){}firstUpdated(n){}};ae.elementStyles=[],ae.shadowRootOptions={mode:"open"},ae[at("elementProperties")]=new Map,ae[at("finalized")]=new Map,Yu?.({ReactiveElement:ae}),(zt.reactiveElementVersions??=[]).push("2.1.2");var mr=globalThis,_i=e=>e,Vt=mr.trustedTypes,Ti=Vt?Vt.createPolicy("lit-html",{createHTML:e=>e}):void 0,Ri="$lit$",he=`lit$${Math.random().toFixed(9).slice(2)}$`,Di="?"+he,Zu=`<${Di}>`,Ce=document,dt=()=>Ce.createComment(""),ct=e=>e===null||typeof e!="object"&&typeof e!="function",fr=Array.isArray,Ju=e=>fr(e)||typeof e?.[Symbol.iterator]=="function",lr=`[ 	
\f\r]`,lt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Si=/-->/g,Ai=/>/g,Ae=RegExp(`>|${lr}(?:([^\\s"'>=/]+)(${lr}*=${lr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Mi=/'/g,Ci=/"/g,Oi=/^(?:script|style|textarea|title)$/i,gr=e=>(n,...t)=>({_$litType$:e,strings:n,values:t}),l=gr(1),Ii=gr(2),Yb=gr(3),le=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Pi=new WeakMap,Me=Ce.createTreeWalker(Ce,129);function Li(e,n){if(!fr(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ti!==void 0?Ti.createHTML(n):n}var Qu=(e,n)=>{let t=e.length-1,r=[],o,i=n===2?"<svg>":n===3?"<math>":"",s=lt;for(let a=0;a<t;a++){let d=e[a],c,m,p=-1,g=0;for(;g<d.length&&(s.lastIndex=g,m=s.exec(d),m!==null);)g=s.lastIndex,s===lt?m[1]==="!--"?s=Si:m[1]!==void 0?s=Ai:m[2]!==void 0?(Oi.test(m[2])&&(o=RegExp("</"+m[2],"g")),s=Ae):m[3]!==void 0&&(s=Ae):s===Ae?m[0]===">"?(s=o??lt,p=-1):m[1]===void 0?p=-2:(p=s.lastIndex-m[2].length,c=m[1],s=m[3]===void 0?Ae:m[3]==='"'?Ci:Mi):s===Ci||s===Mi?s=Ae:s===Si||s===Ai?s=lt:(s=Ae,o=void 0);let b=s===Ae&&e[a+1].startsWith("/>")?" ":"";i+=s===lt?d+Zu:p>=0?(r.push(c),d.slice(0,p)+Ri+d.slice(p)+he+b):d+he+(p===-2?a:b)}return[Li(e,i+(e[t]||"<?>")+(n===2?"</svg>":n===3?"</math>":"")),r]},ut=class e{constructor({strings:n,_$litType$:t},r){let o;this.parts=[];let i=0,s=0,a=n.length-1,d=this.parts,[c,m]=Qu(n,t);if(this.el=e.createElement(c,r),Me.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(o=Me.nextNode())!==null&&d.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let p of o.getAttributeNames())if(p.endsWith(Ri)){let g=m[s++],b=o.getAttribute(p).split(he),E=/([.?@])?(.*)/.exec(g);d.push({type:1,index:i,name:E[2],strings:b,ctor:E[1]==="."?cr:E[1]==="?"?ur:E[1]==="@"?pr:Fe}),o.removeAttribute(p)}else p.startsWith(he)&&(d.push({type:6,index:i}),o.removeAttribute(p));if(Oi.test(o.tagName)){let p=o.textContent.split(he),g=p.length-1;if(g>0){o.textContent=Vt?Vt.emptyScript:"";for(let b=0;b<g;b++)o.append(p[b],dt()),Me.nextNode(),d.push({type:2,index:++i});o.append(p[g],dt())}}}else if(o.nodeType===8)if(o.data===Di)d.push({type:2,index:i});else{let p=-1;for(;(p=o.data.indexOf(he,p+1))!==-1;)d.push({type:7,index:i}),p+=he.length-1}i++}}static createElement(n,t){let r=Ce.createElement("template");return r.innerHTML=n,r}};function Ne(e,n,t=e,r){if(n===le)return n;let o=r!==void 0?t._$Co?.[r]:t._$Cl,i=ct(n)?void 0:n._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(e),o._$AT(e,t,r)),r!==void 0?(t._$Co??=[])[r]=o:t._$Cl=o),o!==void 0&&(n=Ne(e,o._$AS(e,n.values),o,r)),n}var dr=class{constructor(n,t){this._$AV=[],this._$AN=void 0,this._$AD=n,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(n){let{el:{content:t},parts:r}=this._$AD,o=(n?.creationScope??Ce).importNode(t,!0);Me.currentNode=o;let i=Me.nextNode(),s=0,a=0,d=r[0];for(;d!==void 0;){if(s===d.index){let c;d.type===2?c=new pt(i,i.nextSibling,this,n):d.type===1?c=new d.ctor(i,d.name,d.strings,this,n):d.type===6&&(c=new hr(i,this,n)),this._$AV.push(c),d=r[++a]}s!==d?.index&&(i=Me.nextNode(),s++)}return Me.currentNode=Ce,o}p(n){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(n,r,t),t+=r.strings.length-2):r._$AI(n[t])),t++}},pt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(n,t,r,o){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=n,this._$AB=t,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let n=this._$AA.parentNode,t=this._$AM;return t!==void 0&&n?.nodeType===11&&(n=t.parentNode),n}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(n,t=this){n=Ne(this,n,t),ct(n)?n===u||n==null||n===""?(this._$AH!==u&&this._$AR(),this._$AH=u):n!==this._$AH&&n!==le&&this._(n):n._$litType$!==void 0?this.$(n):n.nodeType!==void 0?this.T(n):Ju(n)?this.k(n):this._(n)}O(n){return this._$AA.parentNode.insertBefore(n,this._$AB)}T(n){this._$AH!==n&&(this._$AR(),this._$AH=this.O(n))}_(n){this._$AH!==u&&ct(this._$AH)?this._$AA.nextSibling.data=n:this.T(Ce.createTextNode(n)),this._$AH=n}$(n){let{values:t,_$litType$:r}=n,o=typeof r=="number"?this._$AC(n):(r.el===void 0&&(r.el=ut.createElement(Li(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(t);else{let i=new dr(o,this),s=i.u(this.options);i.p(t),this.T(s),this._$AH=i}}_$AC(n){let t=Pi.get(n.strings);return t===void 0&&Pi.set(n.strings,t=new ut(n)),t}k(n){fr(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,o=0;for(let i of n)o===t.length?t.push(r=new e(this.O(dt()),this.O(dt()),this,this.options)):r=t[o],r._$AI(i),o++;o<t.length&&(this._$AR(r&&r._$AB.nextSibling,o),t.length=o)}_$AR(n=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);n!==this._$AB;){let r=_i(n).nextSibling;_i(n).remove(),n=r}}setConnected(n){this._$AM===void 0&&(this._$Cv=n,this._$AP?.(n))}},Fe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(n,t,r,o,i){this.type=1,this._$AH=u,this._$AN=void 0,this.element=n,this.name=t,this._$AM=o,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=u}_$AI(n,t=this,r,o){let i=this.strings,s=!1;if(i===void 0)n=Ne(this,n,t,0),s=!ct(n)||n!==this._$AH&&n!==le,s&&(this._$AH=n);else{let a=n,d,c;for(n=i[0],d=0;d<i.length-1;d++)c=Ne(this,a[r+d],t,d),c===le&&(c=this._$AH[d]),s||=!ct(c)||c!==this._$AH[d],c===u?n=u:n!==u&&(n+=(c??"")+i[d+1]),this._$AH[d]=c}s&&!o&&this.j(n)}j(n){n===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,n??"")}},cr=class extends Fe{constructor(){super(...arguments),this.type=3}j(n){this.element[this.name]=n===u?void 0:n}},ur=class extends Fe{constructor(){super(...arguments),this.type=4}j(n){this.element.toggleAttribute(this.name,!!n&&n!==u)}},pr=class extends Fe{constructor(n,t,r,o,i){super(n,t,r,o,i),this.type=5}_$AI(n,t=this){if((n=Ne(this,n,t,0)??u)===le)return;let r=this._$AH,o=n===u&&r!==u||n.capture!==r.capture||n.once!==r.once||n.passive!==r.passive,i=n!==u&&(r===u||o);o&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,n),this._$AH=n}handleEvent(n){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,n):this._$AH.handleEvent(n)}},hr=class{constructor(n,t,r){this.element=n,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(n){Ne(this,n)}};var ep=mr.litHtmlPolyfillSupport;ep?.(ut,pt),(mr.litHtmlVersions??=[]).push("3.3.3");var Hi=(e,n,t)=>{let r=t?.renderBefore??n,o=r._$litPart$;if(o===void 0){let i=t?.renderBefore??null;r._$litPart$=o=new pt(n.insertBefore(dt(),i),i,void 0,t??{})}return o._$AI(e),o};var br=globalThis,A=class extends ae{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let n=super.createRenderRoot();return this.renderOptions.renderBefore??=n.firstChild,n}update(n){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(n),this._$Do=Hi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return le}};A._$litElement$=!0,A.finalized=!0,br.litElementHydrateSupport?.({LitElement:A});var tp=br.litElementPolyfillSupport;tp?.({LitElement:A});(br.litElementVersions??=[]).push("4.2.2");var Ni={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Fi=e=>(...n)=>({_$litDirective$:e,values:n}),Wt=class{constructor(n){}get _$AU(){return this._$AM._$AU}_$AT(n,t,r){this._$Ct=n,this._$AM=t,this._$Ci=r}_$AS(n,t){return this.update(n,t)}update(n,t){return this.render(...t)}};var ji="important",np=" !"+ji,te=Fi(class extends Wt{constructor(e){if(super(e),e.type!==Ni.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((n,t)=>{let r=e[t];return r==null?n:n+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[n]){let{style:t}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(n)),this.render(n);for(let r of this.ft)n[r]==null&&(this.ft.delete(r),r.includes("-")?t.removeProperty(r):t[r]=null);for(let r in n){let o=n[r];if(o!=null){this.ft.add(r);let i=typeof o=="string"&&o.endsWith(np);r.includes("-")||i?t.setProperty(r,i?o.slice(0,-11):o,i?ji:""):t[r]=o}}return le}});function P(e,n){return e.connection.sendMessagePromise(n)}var Bi="hats-lite-theme-selected",Ui="hats-lite-theme-saved",Ki="hats-lite-mode-change",yr="hats_lite_catalog",vr="/api/hats_lite/background";var zi=["image/png","image/jpeg","image/webp","image/gif"];var w={title:"Themes",searchLabel:"Search themes",searchPlaceholder:"Search themes",loading:"Loading themes...",loadError:"Could not load the theme list.",cachedNote:"Showing the saved list from your last successful load.",noThemes:"No themes available.",retry:"Try again",previewsLoading:"Loading previews",apply:"Apply",noMatches:"No themes match your search.",noFilterMatches:"No themes match this filter yet. Previews load as you scroll.",installed:"Installed",inUse:"In use",otherCopy:"Other copy installed",licenseUnknown:"License unknown to HATS Lite",licenseShort:"License unknown",licenseKnown:"License detected when the thumbnails were built",starsLabel:"Stars",starGlyph:"★",themeErrorDefault:"Could not open this theme. Try again.",preview:"Preview",openPreview:"Open preview of",filterLabel:"Filter themes",filterAll:"All",filterInstalled:"Installed",filterDark:"Dark",filterLight:"Light",filterGlass:"Glass",thumbUnavailable:"Preview not available",thumbRateLimited:"Rate limited, try again later",thumbLoading:"Loading preview",thumbRoom:"Living room thermostat",thumbTemp:"20.5 °C",thumbHeating:"Heating to 21",thumbEnergy:"Energy today",thumbGarage:"Garage door",thumbClosed:"Closed",thumbLocked:"Locked since 18:30",thumbLights:"Lights and doors",thumbLight:"Living room light",thumbDoor:"Front door",thumbPorch:"Porch timer",thumbGreeting:"Good evening",thumbSunset:"Sunset 18:42",thumbChipLight:"Light on",thumbChipFan:"Fan on",thumbChipHeat:"Heat"};function Wi(e){if(!e||typeof e!="object")return null;let n=e;return typeof n.full_name!="string"?null:{full_name:n.full_name,description:typeof n.description=="string"?n.description:"",stars:typeof n.stars=="number"?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"?n.hacs_id:null}}function wr(e){return Array.isArray(e)?e.flatMap(n=>{let t=Wi(n);return t?[t]:[]}):[]}function qi(){try{let e=localStorage.getItem(yr);if(e===null)return null;let n=JSON.parse(e);return!Array.isArray(n)||!n.every(t=>Wi(t)!==null)?null:wr(n)}catch{return null}}function Gi(e){try{localStorage.setItem(yr,JSON.stringify(e))}catch{return}}function Xi(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Yi(e){if(e&&typeof e=="object"&&"message"in e){let n=e.message;if(typeof n=="string"&&n)return n}return w.themeErrorDefault}function Zi(e,n){return e.full_name.toLowerCase().includes(n)||e.description.toLowerCase().includes(n)}var rp=new Set(["invalid_theme","theme_too_large","not_found","invalid_request","not_in_catalog"]);function Vi(e,n){if(!e||typeof e!="object"||!(n in e))return"";let t=e[n];return typeof t=="string"?t:""}function qt(e){let n=Vi(e,"code");return rp.has(n)?"permanent":n==="rate_limited"||/\bstatus (403|429)\b/.test(Vi(e,"message"))?"limited":"transient"}var op=/^[A-Za-z0-9_-]+$/,ip=/[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i,sp=/['"]/,ap=["lovelace-background","background-image"];function Z(e,n){return{...e.vars,...e.modes?.[n]??{}}}function lp(e){return op.test(e)?!e.startsWith("card-mod-")&&!e.startsWith("uix-"):!1}function dp(e,n){return typeof n!="string"||ip.test(n)?!1:!sp.test(n)||ap.includes(e)}function cp(e){return Object.entries(e).filter(([n,t])=>lp(n)&&dp(n,t))}var up=["lovelace-background","background-image"],pp=/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi,hp=/(^|[\s,/)])fixed(?=$|[\s,/(])/gi,mp=/^\s*(?:(?:fixed|scroll|local)\s*(?:,\s*|$))+$/i;function Ji(e){return e.replace(hp,"$1scroll")}function fp(e){let n="",t=0;for(let r of e.matchAll(pp)){let o=r.index??0;n+=Ji(e.slice(t,o))+r[0],t=o+r[0].length}return n+Ji(e.slice(t))}function gp(e,n){return up.includes(e)||/url\(/i.test(n)||mp.test(n)?fp(n):n}function ht(e,n){for(let[t,r]of cp(n))e.style.setProperty(`--${t}`,gp(t,r))}var f={title:"Theme preview",dashboard:"Dashboard",defaultDashboard:"Overview",view:"View",device:"Device",desktop:"Desktop",tablet:"Tablet",phone:"Phone",density:"Density",normal:"Normal",compact:"Compact",mode:"Mode",dark:"Dark",light:"Light",current:"Current",candidate:"Candidate",sheet:"Preview options",divider:"Drag to compare current and candidate",splitAt:"Split at {percent} percent",apply:"Apply",navGroup:"Browse themes",navPrev:"Previous theme",navNext:"Next theme",navCount:"{index} of {total}",navPosition:"{name}, {index} of {total}",navLoading:"Loading theme...",navFailed:"Could not load {name}. Try again.",installButton:"Install",installBusy:"Installing...",installConfirmTitle:"Install this theme?",installConfirmBody:"HACS will download the files of {repo} from GitHub into your Home Assistant configuration. Only install themes you trust.",installConfirmYes:"Download and install",installCancel:"Cancel",installLoading:"Loading theme...",uninstallButton:"Uninstall",uninstallBusy:"Uninstalling...",uninstallUpdating:"Updating...",uninstallConfirmTitle:"Uninstall this theme?",uninstallConfirmBody:"HACS will delete the theme files of {repo} from your Home Assistant configuration.",uninstallConfirmYes:"Delete theme files",uninstallSwitchFirst:"Change the theme before uninstalling it.",inUseChip:"In use",uninstallWaiting:"Removed. Waiting for Home Assistant to unload the theme.",uninstallTimeout:"Removed, but Home Assistant still lists the theme. Reload the page or check HACS.",installWaiting:"Installed. Waiting for Home Assistant to load the theme.",installTimeout:"Installed, but Home Assistant has not loaded the theme yet. Reload the page or check HACS.",installViaHacs:"This theme is not installed yet. Open it in HACS to download it, then come back here.",adminOnly:"Not installed yet. Only an administrator can install themes. Ask one to install this theme with HACS.",hacsLink:"Open in HACS",installErrors:{unauthorized:"Only an administrator can install themes.",hacs_unavailable:"HACS is not available here. Open the repository in HACS to install it.",invalid_repository:"This theme cannot be installed from here. Open it in HACS instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",install_failed:"HACS could not download this theme. Try again, or open it in HACS.",reload_failed:"The theme was downloaded but Home Assistant could not reload its themes. Reload themes or restart Home Assistant.",operation_timeout:"HACS is still working on this theme. Check HACS, then reload the page.",not_installed:"This theme is not installed.",rate_limited:"Too many HACS changes in a short time. Try again in a few minutes.",unknown:"The install did not complete. Try again, or open the theme in HACS."},uninstallErrors:{unauthorized:"Only an administrator can uninstall themes.",hacs_unavailable:"HACS is not available here. Remove the theme in HACS instead.",invalid_repository:"This theme cannot be removed from here. Open it in HACS instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",uninstall_failed:"HACS could not remove this theme. Try again, or open it in HACS.",reload_failed:"The theme files were removed but Home Assistant could not reload its themes. Reload the page or restart Home Assistant.",operation_timeout:"HACS is still working on this theme. Check HACS, then reload the page.",not_installed:"This theme is not installed.",theme_in_use:"This theme is still used by an assignment, holiday, birthday or trial, or it is a default theme. Switch those to another theme first.",names_unknown:"The theme files could not be read, so removal was not safe. Remove it in HACS instead.",rate_limited:"Too many HACS changes in a short time. Try again in a few minutes.",unknown:"The uninstall did not complete. Try again, or open the theme in HACS."},nameCollision:"The installed copy of {name} has other values than this preview, so Apply and Try are turned off for the previewed one.",nameTaken:"Name already used",repoLink:"View repository",tryButton:"Try for 30 seconds",placeholderCard:"Preview unavailable for card type",loading:"Loading dashboard...",loadError:"Could not load this dashboard.",noViews:"This dashboard has no views.",noCards:"This dashboard has no cards to preview.",generatedSuffix:"(generated by Home Assistant)",generatedDefault:"This dashboard is generated by Home Assistant and has no stored layout to read. Pick another dashboard.",sampleView:"Sample from your entities",sampleNote:"This is a sample built from your entities. The real Overview is generated by Home Assistant and cannot be read.",domainTitles:{light:"Lights",switch:"Switches",climate:"Climate",cover:"Covers",media_player:"Media players",sensor:"Sensors",binary_sensor:"Binary sensors"},compare:"Compare",compareLabel:"Show",themeOnly:"Theme only",menu:"Menu",on:"On",off:"Off",lookLabel:"Look",realLook:"Real look",livePreview:"Live preview",realAlt:"Screenshot of {name} in Home Assistant, {mode} mode",realCaption:"Screenshot of the real theme in Home Assistant (version {commit})",compareHint:"Compare works with the live preview only.",modNote:"Menu and header styling done with card-mod is not shown here.",shell:{title:"Home Assistant",overview:"Overview",map:"Map",logbook:"Logbook",history:"History",energy:"Energy",settings:"Settings",bell:"Notifications",profile:"Profile",menu:"Menu",search:"Search",more:"More"},footnote:"Drawn from your own dashboard with read-only data and scoped colors. Nothing changes until you press Apply.",emptyView:"This view has no cards.",tooManyCards:"This view has more than 200 cards, so it is not previewed.",noCandidate:"Select a theme to compare.",noModeBlock:"This theme has no {mode} block, so the candidate uses the current colors.",trialUnavailable:"Trial mode is not ready. Reload the page and try again.",trialFailed:"The trial could not start."};var ts=200,bp=3,yp=60,vp=1500,wp=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,xp=3e3;function O(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Xt(e){if(!O(e))return{};let n=Object.create(null);for(let[t,r]of Object.entries(e))typeof r=="string"&&(n[t]=r);return n}function Qi(e){if(O(e))return{dark:Xt(e.dark),light:Xt(e.light)}}function ne(e){return O(e.vars)?{vars:Xt(e.vars),modes:Qi(e.modes)}:{vars:Xt(e),modes:Qi(e.modes)}}function ns(e){let n=e?.selectedTheme?.theme??e?.themes?.theme,t=e?.themes?.themes;if(!n||!t||!Object.prototype.hasOwnProperty.call(t,n))return;let r=t[n];return O(r)?ne(r):void 0}function es(e){let n=e.trim().replace(/[\s;]+$/,"").replace(/\s*!important$/i,"").replace(/[\s;]+$/,"").replace(/\s+/g," ");return/^#[0-9a-f]+$/i.test(n)?n.toLowerCase():n}function kp(e,n){return Object.keys(e).some(t=>Object.prototype.hasOwnProperty.call(n,t)&&es(e[t])!==es(n[t]))}function Er(e,n){return["dark","light"].some(t=>kp(Z(e,t),Z(n,t)))}function rs(e,n){return O(e)?Er(ne(e),n):!1}function _r(e){return e?[...Object.keys(e.vars),...Object.keys(e.modes?.dark??{}),...Object.keys(e.modes?.light??{})]:[]}function os(e){let n=e?.selectedTheme,t=n?.theme??e?.themes?.theme??"default";if(!n)return{theme:t};let r={theme:t};return typeof n.dark=="boolean"&&(r.dark=e?.themes?.darkMode??!1),typeof n.primaryColor=="string"&&(r.primaryColor=n.primaryColor),typeof n.accentColor=="string"&&(r.accentColor=n.accentColor),r}function is(e,n){let t={theme:e.name};return n&&(t.dark=n==="dark"),t}function Yt(e){return e.installed&&e.canApply&&!e.nameCollision}function Zt(e){return e.installed&&!e.nameCollision}function ss(e){if(!(!wp.test(e)||e.split("/").some(t=>t==="."||t==="..")))return`https://github.com/${e}`}function Jt(e,n){return e?e.entry?Z(e.entry,n):e.vars:{}}function as(e){return e&&/^https:\/\//i.test(e)?e:void 0}async function ls(e){let n=await e.connection.sendMessagePromise({type:"lovelace/dashboards/list"}),t=[{url_path:null,title:f.defaultDashboard}];if(!Array.isArray(n))return t;for(let r of n)O(r)&&typeof r.url_path=="string"&&t.push({url_path:r.url_path,title:typeof r.title=="string"?r.title:r.url_path});return t}async function ds(e,n){let t=await e.connection.sendMessagePromise({type:"lovelace/config",url_path:n});return O(t)?t:{}}function Tr(e){return Array.isArray(e.views)?e.views.filter(O):[]}function cs(e,n){return typeof e.title=="string"&&e.title?e.title:typeof e.path=="string"&&e.path?e.path:`${f.view} ${n+1}`}function us(e,n){if(!Array.isArray(e.cards))return e;if(n>=bp)return{...e,cards:[]};let t=e.cards.filter(O).map(r=>us(r,n+1));return{...e,cards:t}}function Sr(e){let n=Array.isArray(e.cards)?e.cards:[],r=(Array.isArray(e.sections)?e.sections:[]).flatMap(o=>O(o)&&Array.isArray(o.cards)?o.cards:[]);return[...n,...r].filter(O).map(o=>us(o,0))}function Ar(e){return e.reduce((n,t)=>{let r=Array.isArray(t.cards)?Ar(t.cards.filter(O)):0;return n+1+r},0)}var xr,mt,kr;function $r(){let e=window.loadCardHelpers;return typeof e=="function"?e:void 0}async function $p(){let e=customElements.whenDefined("partial-panel-resolver"),n=new Promise(r=>setTimeout(r,xp));if(await Promise.race([e,n]),!customElements.get("partial-panel-resolver"))return;let t=document.createElement("partial-panel-resolver");t.hass={panels:{tmp:{url_path:"tmp",component_name:"lovelace"}}},t._updateRoutes?.(),await t.routerOptions?.routes?.tmp?.load?.()}async function Ep(){return $r()?!0:(kr??=$p().catch(()=>{}).finally(()=>{kr=void 0}),await kr,$r()!==void 0)}async function Qt(){if(!await Ep())return;let e=$r();if(e)return mt&&xr===e||(xr=e,mt=Promise.resolve().then(()=>e()).catch(()=>{mt=void 0,xr=void 0})),mt}function _p(e){let n=typeof e.type=="string"?e.type:"unknown";return Array.from(n).slice(0,yp).join("")}function Gt(e){let n=document.createElement("div");return n.className="placeholder",n.textContent=`${f.placeholderCard} ${e}`,n}function Tp(e){return e.localName==="hui-error-card"||e instanceof HTMLUnknownElement}function Sp(e){return new Promise(n=>{let t=setTimeout(()=>n(!1),vp),r=o=>{clearTimeout(t),n(o)};try{customElements.whenDefined(e).then(()=>r(!0),()=>r(!1))}catch{r(!1)}})}async function en(e,n){let t=_p(n);if(!e)return Gt(t);let r;try{r=e.createCardElement(n)}catch{return Gt(t)}if(Tp(r))return Gt(t);let o=r.localName;return o.includes("-")&&customElements.get(o)===void 0&&!await Sp(o)?Gt(t):r}function ps(e){let n=[];for(let t=0;t<e.style.length;t+=1){let r=e.style.item(t);r.startsWith("--")&&n.push(r)}for(let t of n)e.style.removeProperty(t)}var je=class{constructor(){this.byRepo=new Map}add(n,t){let r=this.byRepo.get(n)??new Set;for(let o of t)r.add(o);this.byRepo.set(n,r)}of(n,t){let r=new Set(this.byRepo.get(n));for(let o of t)o&&r.add(o);return[...r]}};function hs(e,n){let t=new Set(Object.keys(e));if(Array.isArray(n))for(let r of n)typeof r=="string"&&t.add(r);return[...t]}function ms(e,n,t){return e.installed||n.some(r=>t.has(r))}function fs(e,n){return e.includes(n)}function tn(e,n){return e.length===n.length&&e.every((t,r)=>t===n[r])}function gs(e,n,t,r,o){if(e.installed)return"match";if(!n.some(a=>t.has(a)))return"none";if(!o||!r||!Object.prototype.hasOwnProperty.call(r,o.name))return"unverified";let i=r[o.name];if(!O(i))return"unverified";let s={vars:o.vars,modes:o.modes};return Er(ne(i),s)?"different":"match"}var bs="hats_lite/catalog",Ap="hats_lite/theme",Mr=5e3,Cr=6e4;function ys(e,n){let t=qt(e);return t==="permanent"?null:t==="limited"?Cr:Mr*2**n}function Mp(e){if(typeof e!="object"||e===null)return!1;let n=e.code;return n==="invalid_format"||n==="invalid_request"||n==="unknown_error"}function Pe(e,n,t,r=!1,o){if(!e)return Promise.reject(new Error(w.themeErrorDefault));let i={type:Ap,full_name:t.full_name,commit:t.last_commit||"HEAD"};return r?i.summary=!0:o&&(i.theme=o),P(e,i).then(s=>{if(!Xi(s?.themes))throw new Error(w.themeErrorDefault);let a=hs(s.themes,s.names);return n.add(t.full_name,a),{themes:s.themes,summary:s.summary===!0,names:a}},s=>{if(i.theme!==void 0&&Mp(s))return Pe(e,n,t);throw s})}var vs="hats_lite_theme_cache",Rr=120,Cp=2e4;function Pr(e){if(!O(e))return null;let n=Object.create(null);for(let[t,r]of Object.entries(e)){if(typeof r!="string")return null;n[t]=r}return n}function Pp(e){if(!O(e)||typeof e.name!="string")return null;let n=Pr(e.vars);if(!n)return null;let t={name:e.name,vars:n};if(e.modes!==void 0&&e.modes!==null){if(!O(e.modes))return null;let r=Pr(e.modes.dark??{}),o=Pr(e.modes.light??{});if(!r||!o)return null;t.modes={dark:r,light:o}}return t}function Be(e){let n=Object.keys(e)[0];if(n===void 0)return null;let t=e[n];if(!O(t))return null;let r=ne(t);return{name:n,vars:r.vars,modes:r.modes}}var ws=new WeakMap;function ks(e,n){let t=ws.get(e)??{};return ws.set(e,t),t[n]??=Z(e,n),t[n]}function xs(e){return JSON.stringify(e).length>Cp}var nn=class{constructor(){this.slots=new Map;this.load()}load(){try{let n=localStorage.getItem(vs);if(n===null)return;let t=JSON.parse(n);if(!Array.isArray(t))return;for(let r of t){if(!Array.isArray(r)||typeof r[0]!="string")continue;let o=Pp(r[1]);o&&!xs(o)&&this.slots.set(r[0],{theme:o})}this.trim()}catch{this.slots.clear()}}trim(){let n=[];for(;this.slots.size>Rr;){let t=this.slots.keys().next().value;if(t===void 0)break;this.slots.delete(t),n.push(t)}return n}get size(){return this.slots.size}has(n){return this.slots.has(n)}touch(n){let t=this.slots.get(n);t&&(this.slots.delete(n),this.slots.set(n,t))}get(n){return this.slots.get(n)?.theme}bundle(n){return this.slots.get(n)?.bundle}set(n,t,r){this.slots.delete(n),this.slots.set(n,{theme:t,bundle:r});let o=this.trim();return this.persist(),o}persist(){try{let n=[...this.slots.entries()].filter(([,t])=>!xs(t.theme)).map(([t,r])=>[t,r.theme]);localStorage.setItem(vs,JSON.stringify(n))}catch{return}}};var _s=["all","installed","dark","light","glass"];function Ts(e,n){return e==="dark"||e==="light"?e:n}function Ss(e){let n=e.split("/");return n[n.length-1]||e}function As(e){let n=e.indexOf("/");return n>0?e.slice(0,n):""}function me(e){return`${e.full_name}@${e.last_commit||"HEAD"}`}function Rp(e){return`${e.full_name} ${e.description}`.toLowerCase()}function $s(e,n){return new RegExp(`(^|[^a-z0-9])${n}([^a-z0-9]|$)`).test(e)}function Es(e){return!!e&&Object.keys(e).length>0}function Dp(e){return[e.vars,e.modes?.dark,e.modes?.light].some(t=>Object.entries(t??{}).some(([r,o])=>/backdrop-filter|blur/i.test(r)||/blur\(/i.test(o)))}function Ms(e,n,t,r,o=n.installed){let i=t===void 0?r:void 0,s=Rp(n);return e==="all"?!0:e==="installed"?o:e==="dark"?$s(s,"dark")||Es(t?.modes?.dark)||i?.dark===!0:e==="light"?$s(s,"light")||Es(t?.modes?.light)||i?.light===!0:/glass|frost|blur/.test(s)||t!==void 0&&Dp(t)||i?.glass===!0}var Op={all:w.filterAll,installed:w.filterInstalled,dark:w.filterDark,light:w.filterLight,glass:w.filterGlass};function Cs(e){return l`
    <div class="toolbar">
      <div class="filters" role="group" aria-label=${w.filterLabel}>
        ${_s.map(n=>l`
            <button
              type="button"
              class="chip-btn"
              data-filter=${n}
              aria-pressed=${e.filter===n?"true":"false"}
              @click=${()=>e.onFilter(n)}
            >
              ${Op[n]}
            </button>
          `)}
      </div>
      <input
        class="search"
        type="search"
        aria-label=${w.searchLabel}
        placeholder=${w.searchPlaceholder}
        .value=${e.query}
        @input=${e.onSearch}
      />
    </div>
  `}var Is="/hats_lite_static/thumbs";function Ip(e,n,t){let r=e%n,o=Math.floor(e/n);return{sizeX:n*100,sizeY:t*100,posX:n>1?r/(n-1)*100:0,posY:t>1?o/(t-1)*100:0}}function Ps(e,n){return typeof e=="number"&&Number.isInteger(e)&&e>0&&e<=n}function Lp(e,n,t){if(typeof e!="object"||e===null)return null;let r=e,o=r.index;return typeof r.full_name!="string"||typeof r.name!="string"||typeof o!="number"||!Number.isInteger(o)||o<0||o>=n||t.has(o)?null:(t.add(o),{full_name:r.full_name,name:r.name,index:o,commit:typeof r.commit=="string"&&r.commit?r.commit:null,license:typeof r.license=="string"&&r.license?r.license:null,dark:r.dark===!0,light:r.light===!0,glass:r.glass===!0})}function Hp(e,n){for(let r of[e,n])if(typeof r=="string"&&r)return r;let t=r=>r!=null;return t(e)||t(n)?null:""}function Np(e){if(typeof e!="object"||e===null)return null;let n=e,{columns:t,rows:r,themes:o}=n;if(n.version!==1||!Ps(t,64)||!Ps(r,2e3)||!Array.isArray(o))return null;let i=new Set,s=new Map;for(let d of o){let c=Lp(d,t*r,i);c&&s.set(c.full_name,c)}let a=Hp(n.hash,n.generated);return a===null?null:{columns:t,rows:r,version:a,themes:s}}var Fp=6e3,jp=2e4,Rs=3e4,rn=class extends Error{},ft=class extends Error{},Ds={fetchIndex(e){return fetch(`${Is}/index.json`,{credentials:"same-origin",signal:e}).then(n=>{if(n.status===404)throw new rn("index missing");if(!n.ok)throw new Error("index unavailable");return n.json()})},loadImage(e,n){return new Promise(t=>{let r=new Image,o=s=>{n?.removeEventListener("abort",i),t(s)},i=()=>{r.src="",o(!1)};r.onload=()=>o(!0),r.onerror=()=>o(!1),n?.addEventListener("abort",i),r.src=e})}};function Os(e,n,t){let r=new AbortController;return new Promise((o,i)=>{let s=()=>{clearTimeout(d),e.delete(a)},a=()=>{s(),r.abort(),i(new ft)},d=setTimeout(()=>{s(),r.abort(),i(new Error("timeout"))},n);e.add(a);let c=m=>p=>{s(),m(p)};try{t(r.signal).then(c(o),c(i))}catch(m){c(i)(m)}})}var on=class{constructor(n){this.onChange=n;this.started=!1;this.images=new Map;this.wanted=new Set;this.retries=new Map;this.active=new Set;this.disposed=!1;this.ticket=0}ensure(n){if(this.wanted.add(n),!this.disposed){if(this.started){this.pump();return}this.startIndex()}}startIndex(){this.started=!0;let n=++this.ticket;Promise.resolve().then(()=>{n===this.ticket&&!this.disposed&&this.loadIndex(!0)})}later(n){let t=()=>{this.retries.delete(t),n()};this.retries.set(t,this.disposed?void 0:setTimeout(t,Rs))}dispose(){this.disposed=!0,this.ticket+=1;for(let[n,t]of this.retries)t!==void 0&&clearTimeout(t),this.retries.set(n,void 0);for(let n of[...this.active])n();this.index===void 0&&(this.started=!1);for(let[n,t]of this.images)t===void 0&&this.images.delete(n)}resume(){this.disposed=!1;for(let[n,t]of this.retries)t===void 0&&this.retries.set(n,setTimeout(n,Rs));!this.started&&this.wanted.size>0?this.startIndex():this.pump()}async loadIndex(n){let t=null,r=!1;try{t=Np(await Os(this.active,Fp,o=>Ds.fetchIndex(o)))}catch(o){if(o instanceof ft)return;r=!(o instanceof rn)}this.index=t,this.pump(),this.onChange(),!t&&r&&n&&this.later(()=>void this.loadIndex(!1))}pump(){if(this.index)for(let n of this.wanted)this.images.has(n)||(this.images.set(n,void 0),this.loadImage(n,!0))}async loadImage(n,t){let r=this.imageUrl(n),o=!1;try{o=await Os(this.active,jp,i=>Ds.loadImage(r,i))}catch(i){if(i instanceof ft)return}this.images.set(n,o),this.onChange(),!o&&t&&this.later(()=>void this.loadImage(n,!1))}imageUrl(n){let t=this.index?.version??"",r=t?`?v=${encodeURIComponent(t)}`:"";return`${Is}/atlas-${n}.webp${r}`}theme(n,t){let r=this.index?.themes.get(n);if(!r)return;let o=r.commit;if(!(t&&o&&o!=="HEAD"&&o!==t))return r}state(n,t,r){if(this.ensure(t),this.index===void 0)return"pending";if(!this.theme(n,r))return"none";if(!this.images.has(t))return"pending";let o=this.images.get(t);return o===void 0?"pending":o?"ok":"none"}tile(n,t){let r=this.theme(n,t);return!r||!this.index?null:Ip(r.index,this.index.columns,this.index.rows)}};function Ls(e,n,t,r){let o=e.tile(n,r),i=e.theme(n,r);if(!o||!i)return u;let s={backgroundImage:`url("${e.imageUrl(t)}")`,backgroundSize:`${o.sizeX}% ${o.sizeY}%`,backgroundPosition:`${o.posX}% ${o.posY}%`};return l`<div
    class="atlas-thumb"
    role="img"
    aria-label=${i.name}
    data-atlas="true"
    style=${te(s)}
  ></div>`}function Hs(e){if(!e)return l`<span
      class="chip"
      title=${w.licenseUnknown}
      aria-label=${w.licenseUnknown}
      >${w.licenseShort}</span
    >`;let n=`${w.licenseKnown}: ${e}`;return l`<span class="chip" title=${n} aria-label=${n}>${e}</span>`}function Bp(e){e.preventDefault()}function Up(e){return e==="match"?l`<span class="chip ok">${w.installed}</span>`:e==="unverified"?l`<span class="chip">${w.installed}</span>`:e==="different"?l`<span class="chip warn">${w.otherCopy}</span>`:u}function Ns(e,n){let t=Ss(e.entry.full_name),r=As(e.entry.full_name),o=`${w.starsLabel}: ${e.entry.stars}`;return l`
    <article class="card" data-key=${e.key}>
      <button
        class="thumb-btn"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        ?disabled=${e.busy}
        @mousedown=${Bp}
        @click=${n}
      >
        ${e.atlased?Ls(e.atlas,e.entry.full_name,e.mode,e.entry.last_commit):l`<hats-lite-thumb
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
          ${Up(e.installedKind)}
          ${e.active?l`<span class="chip ok">${w.inUse}</span>`:u}
          <span class="chip" title=${o} aria-label=${o}
            >${w.starGlyph} ${e.entry.stars}</span
          >
          ${Hs(e.license)}
        </div>
        ${e.error?l`<p class="card-error" role="alert">${e.error}</p>`:u}
        <div class="actions">
          <button
            class="btn primary"
            type="button"
            aria-label="${w.openPreview} ${t}"
            aria-busy=${e.opening?"true":"false"}
            ?disabled=${e.busy}
            @click=${n}
          >
            ${w.preview}
          </button>
        </div>
      </div>
    </article>
  `}var Kp=6,Ue=class{constructor(){this.slots=new Map}key(n,t){return`${me(n)}@${t}`}get(n,t){let r=this.key(n,t),o=this.slots.get(r);return o&&(this.slots.delete(r),this.slots.set(r,o)),o}set(n,t,r){let o=this.key(n,t);for(this.slots.delete(o),this.slots.set(o,r);this.slots.size>Kp;){let i=this.slots.keys().next().value;if(i===void 0)break;this.slots.delete(i)}}};async function Dr(e,n,t,r,o){let i=t.get(r,o);if(i)return i;let s=await Pe(e,n,r,!1,o),a={themes:s.themes,names:s.names,theme:o};return Object.prototype.hasOwnProperty.call(s.themes,o)&&t.set(r,o,a),a}async function Fs(e,n,t,r,o,i){let s=me(o),a=t.get(s)?.name??i,d=t.bundle(s);if(d&&(!a||Object.prototype.hasOwnProperty.call(d,a))){t.touch(s);let p=n.of(o.full_name,Object.keys(d));return{themes:d,names:p,theme:a??Object.keys(d)[0]}}if(!a){let p=await Pe(e,n,o,!0);if(a=Be(p.themes)?.name,!p.summary){let g=Be(p.themes);return g&&t.set(s,g,p.themes),{themes:p.themes,names:p.names,theme:a}}}if(!a){let p=await Pe(e,n,o);return{themes:p.themes,names:p.names,theme:Object.keys(p.themes)[0]}}let c=await Dr(e,n,r,o,a),m=Be(c.themes);return m&&!t.has(s)&&t.set(s,m),c}var fe=class extends Error{},sn=class{constructor(n=3,t=5e3,r=1,o=()=>t){this.limit=n;this.retryMs=t;this.retries=r;this.delayFor=o;this.running=0;this.waiting=[];this.pending=new Set;this.epoch=0}get active(){return this.running}add(n){return this.attempt(n,this.retries)}dispose(){this.epoch+=1;let n=this.waiting;this.waiting=[];for(let r of n)r.reject(new fe);let t=[...this.pending];this.pending.clear();for(let r of t)clearTimeout(r.timer),r.reject(new fe)}acquire(){return this.running<this.limit?(this.running+=1,Promise.resolve()):new Promise((n,t)=>this.waiting.push({resolve:n,reject:t}))}release(){let n=this.waiting.shift();n?n.resolve():this.running-=1}pause(n){return new Promise((t,r)=>{let o={timer:setTimeout(()=>{this.pending.delete(o),t()},n),reject:r};this.pending.add(o)})}async attempt(n,t){let r=this.epoch;if(await this.acquire(),r!==this.epoch)throw this.release(),new fe;let o=this.retryMs;try{return await n()}catch(i){if(r!==this.epoch)throw new fe;let s=t>0?this.delayFor(i,this.retries-t):null;if(s===null)throw i;o=s}finally{this.release()}return await this.pause(o),this.attempt(n,t-1)}};var js=_`
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
`;var zp={dark:{"primary-background-color":"#111111","card-background-color":"#1c1c1c","primary-text-color":"#e1e1e1","secondary-text-color":"#9b9b9b","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#e1e1e11f","text-primary-color":"#ffffff","secondary-background-color":"#282828","disabled-text-color":"#6f6f6f"},light:{"primary-background-color":"#fafafa","card-background-color":"#ffffff","primary-text-color":"#141414","secondary-text-color":"#5e5e5e","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#0000001f","text-primary-color":"#ffffff","secondary-background-color":"#e5e5e5","disabled-text-color":"#bdbdbd"}},Vp={"paper-item-icon-color":"#44739e","light-primary-color":"#b3e5fc","dark-primary-color":"#0288d1"},Wp=["primary-color","accent-color","primary-text-color","secondary-text-color","card-background-color","primary-background-color"];function qp(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16)).join(", ")}function Bs(e){let n=zp[e],t={...n,...Vp};for(let r of Wp)t[`rgb-${r}`]=qp(n[r]);return t}var an={dark:Bs("dark"),light:Bs("light")};function Us(e,n){if(e===n)return!0;if(!e||!n)return!1;let t=Object.keys(e);return t.length===Object.keys(n).length&&t.every(r=>e[r]===n[r])}var Or=class extends A{constructor(){super(...arguments);this.vars=null;this.mode="dark";this.failed=!1;this.limited=!1}static{this.properties={vars:{attribute:!1,hasChanged:(t,r)=>!Us(t,r)},mode:{attribute:!1},failed:{type:Boolean},limited:{type:Boolean}}}static{this.styles=_`
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
  `}updated(t){if(!t.has("vars")&&!t.has("mode"))return;let r=this.painted;r&&r.mode===this.mode&&Us(r.vars,this.vars)||(this.painted={vars:this.vars,mode:this.mode},this.style.cssText="",this.vars&&(ht(this,an[this.mode]),ht(this,this.vars)))}render(){if(this.failed){let t=this.limited?w.thumbRateLimited:w.thumbUnavailable;return l`<div class="state unavailable"><span class="reason">${t}</span></div>`}return this.vars?l`
      <div class="stage" aria-hidden="true">
        <div class="box">
          <div class="sub">${w.thumbRoom}</div>
          <div class="big">${w.thumbTemp}</div>
          <div class="bar"><i></i></div>
          <div class="sub">${w.thumbHeating}</div>
        </div>
        <div class="box">
          <div class="sub">${w.thumbLights}</div>
          <div class="row"><span>${w.thumbLight}</span><i class="tog"></i></div>
          <div class="row"><span>${w.thumbDoor}</span><i class="tog"></i></div>
          <div class="row"><span>${w.thumbPorch}</span><i class="tog off"></i></div>
        </div>
        <div class="tile">
          <span class="g">${w.thumbGreeting}</span>
          <span class="t">${w.thumbSunset}</span>
        </div>
        <div class="chips">
          <span class="pill"><i></i>${w.thumbChipLight}</span>
          <span class="pill"><i></i>${w.thumbChipFan}</span>
          <span class="pill"><i></i>${w.thumbChipHeat}</span>
        </div>
        <div class="box wide">
          <div class="sub">${w.thumbEnergy}</div>
          <div class="spark">
            <i style="height: 35%"></i><i style="height: 55%"></i><i style="height: 80%"></i
            ><i style="height: 45%"></i><i style="height: 65%"></i><i style="height: 95%"></i
            ><i style="height: 50%"></i><i style="height: 70%"></i>
          </div>
        </div>
        <div class="box">
          <div class="sub">${w.thumbGarage}</div>
          <div class="big small">${w.thumbClosed}</div>
          <div class="sub">${w.thumbLocked}</div>
        </div>
      </div>
    `:l`<div class="state skeleton" aria-hidden="true"></div>`}};customElements.get("hats-lite-thumb")||customElements.define("hats-lite-thumb",Or);var z=_`
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
`,V=_`
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
`;var Gp=6,Ir=class extends A{constructor(){super(...arguments);this.installedThemes=[];this.currentTheme="default";this.entries=[];this.query="";this.loading=!1;this.loaded=!1;this.error="";this.fromCache=!1;this.busyName="";this.cardError=null;this.filter="all";this.mode="dark";this.states=new Map;this.started=!1;this.modeTouched=!1;this.installedSet=new Set;this.entryIndex=new Map;this.cache=new nn;this.bundles=new Ue;this.visible=new Set;this.known=new je;this.queue=new sn(3,Mr,1,ys);this.atlas=new on(()=>this.onAtlasChange());this.seen=new Set;this.inflight=new Set;this.permanent=new Set;this.limitedUntil=new Map;this.watched=new WeakMap;this.onIntersect=t=>{for(let r of t){let o=r.target.dataset.key??"";if(!r.isIntersecting){this.visible.delete(o);continue}this.visible.add(o),this.cache.touch(o);let i=this.entryIndex.get(o);i&&this.requestVars(i,!0)}};this.onSearch=t=>{this.query=t.target.value}}static{this.properties={installedThemes:{attribute:!1},currentTheme:{attribute:!1},darkMode:{attribute:!1},entries:{state:!0},query:{state:!0},loading:{state:!0},loaded:{state:!0},error:{state:!0},fromCache:{state:!0},busyName:{state:!0},cardError:{state:!0},filter:{state:!0},mode:{state:!0},states:{state:!0}}}static{this.styles=[z,V,js]}get hass(){return this.hassRef}set hass(t){this.hassRef=t;let r=t?.themes,o=Object.keys(r?.themes??{});tn(o,this.installedThemes)||(this.installedThemes=o);let i=t?.selectedTheme?.theme??r?.theme??"default";i!==this.currentTheme&&(this.currentTheme=i),r?.darkMode!==this.darkMode&&(this.darkMode=r?.darkMode),this.started||this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.atlas.resume(),this.hasUpdated&&queueMicrotask(()=>this.watchCards())}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0,this.watched=new WeakMap,this.visible.clear(),this.queue.dispose(),this.atlas.dispose()}willUpdate(t){t.has("installedThemes")&&(this.installedSet=new Set(this.installedThemes)),t.has("entries")&&(this.entryIndex=new Map(this.entries.map(r=>[me(r),r]))),t.has("darkMode")&&!this.modeTouched&&this.darkMode!==void 0&&(this.mode=this.darkMode?"dark":"light"),!this.started&&this.hassRef&&(this.started=!0,this.loadCatalog())}updated(){queueMicrotask(()=>this.watchCards())}async loadCatalog(){let t=this.hassRef;if(t){this.loading=!0;try{let r=await P(t,{type:bs});this.entries=wr(r?.themes),this.fromCache=!1,this.error="",Gi(this.entries)}catch{let r=qi();this.entries=r??[],this.fromCache=r!==null,this.error=w.loadError}finally{this.loading=!1,this.loaded=!0}}}setState(t,r){let o=new Map(this.states);r===null?o.delete(t):o.set(t,r),this.states=o}requestVars(t,r=!1){let o=me(t);if(!this.hassRef||this.inflight.has(o)||this.cache.has(o))return;let i=this.states.get(o);(i==="failed"||i==="limited")&&!(r&&!this.permanent.has(o))||i==="limited"&&(this.limitedUntil.get(o)??0)>Date.now()||(this.seen.add(o),this.atlas.state(t.full_name,this.mode,t.last_commit)==="none"&&(this.inflight.add(o),this.setState(o,"loading"),this.queue.add(()=>Pe(this.hassRef,this.known,t,!0)).then(a=>{let d=Be(a.themes);if(!d)throw new Error(w.themeErrorDefault);let c=this.cache.set(o,d,a.summary?void 0:a.themes);this.refill(c),this.setState(o,null)}).catch(a=>{if(a instanceof fe){this.setState(o,null);return}let d=qt(a);d==="permanent"&&this.permanent.add(o),d==="limited"&&this.limitedUntil.set(o,Date.now()+Cr),this.setState(o,d==="limited"?"limited":"failed")}).finally(()=>this.inflight.delete(o))))}refill(t){if(!(this.visible.size>=Rr))for(let r of t){let o=this.visible.has(r)?this.entryIndex.get(r):void 0;o&&this.requestVars(o)}}onAtlasChange(){this.requestUpdate();for(let t of this.seen){let r=this.entryIndex.get(t);r&&this.requestVars(r)}}watchCards(){let t=Array.from(this.renderRoot.querySelectorAll(".card[data-key]"));if(typeof IntersectionObserver>"u"){for(let r of t.slice(0,Gp)){let o=this.entryIndex.get(r.dataset.key??"");o&&this.requestVars(o)}return}this.observer??=new IntersectionObserver(this.onIntersect,{rootMargin:"200px"});for(let r of t){let o=r.dataset.key??"";this.watched.get(r)!==o&&(this.watched.has(r)&&this.observer.unobserve(r),this.watched.set(r,o),this.observer.observe(r))}}async openEntry(t){let r=this.atlas.theme(t.full_name,t.last_commit)?.name,o=await Fs(this.hassRef,this.known,this.cache,this.bundles,t,r);return{entry:t,...o}}async refreshCatalog(){return await this.loadCatalog(),this.entries}visibleEntries(){return this.filtered(this.query.trim().toLowerCase()).map(t=>t.entry)}async selectTheme(t){if(!(this.busyName||!this.hassRef)){this.busyName=t.full_name,this.cardError=null;try{let r=await this.openEntry(t);this.dispatchEvent(new CustomEvent(Bi,{bubbles:!0,composed:!0,detail:r}))}catch(r){this.cardError={name:t.full_name,text:Yi(r)}}finally{this.busyName=""}}}pickFilter(t){let r=Ts(t,this.mode);r!==this.mode&&(this.modeTouched=!0,this.mode=r),this.filter=t}cardModel(t,r,o){let i=this.hassRef?.themes?.themes,s=me(t),a=this.cache.get(s),d=a?void 0:this.states.get(s),c=this.atlas.state(t.full_name,this.mode,t.last_commit)==="ok";return{entry:t,key:s,mode:this.mode,vars:a?ks(a,this.mode):null,atlas:this.atlas,atlased:c,failed:d==="failed"||d==="limited",limited:d==="limited",installed:o,installedKind:gs(t,r,this.installedSet,i,a),active:fs(r,this.currentTheme),license:this.atlas.theme(t.full_name,t.last_commit)?.license,busy:this.busyName!=="",opening:this.busyName===t.full_name,error:this.cardError?.name===t.full_name?this.cardError.text:""}}filtered(t){let r=[];for(let o of this.entries){if(t&&!Zi(o,t))continue;let i=this.cache.get(me(o)),s=this.atlas.theme(o.full_name,o.last_commit),a=this.known.of(o.full_name,[s?.name,i?.name]),d=ms(o,a,this.installedSet);Ms(this.filter,o,i,s,d)&&r.push({entry:o,names:a,installed:d})}return r}visibleCards(t){return this.filtered(t).map(({entry:r,names:o,installed:i})=>Ns(this.cardModel(r,o,i),()=>this.selectTheme(r)))}emptyText(t,r){return!this.loaded||this.loading||t>0?"":this.entries.length>0?r?w.noMatches:w.noFilterMatches:this.error?"":w.noThemes}render(){let t=this.query.trim().toLowerCase(),r=this.visibleCards(t),o=this.emptyText(r.length,t),i=[...this.states.values()].includes("loading");return l`
      <section>
        ${this.error?l`<p class="banner" role="alert">${this.error}</p>`:u}
        ${this.error&&!this.fromCache&&!this.loading?l`<button
              class="btn retry"
              type="button"
              @click=${()=>void this.loadCatalog()}
            >
              ${w.retry}
            </button>`:u}
        ${Cs({filter:this.filter,query:this.query,onFilter:s=>this.pickFilter(s),onSearch:this.onSearch})}
        <div class="live" role="status" aria-live="polite">
          ${this.fromCache?l`<p class="note">${w.cachedNote}</p>`:u}
          ${this.loading?l`<p>${w.loading}</p>`:u}
          ${o?l`<p>${o}</p>`:u}
          ${i?l`<span class="sr-only">${w.previewsLoading}</span>`:u}
        </div>
        <div class="grid">${r}</div>
      </section>
    `}};customElements.get("hats-lite-browse")||customElements.define("hats-lite-browse",Ir);var gt=[];var Xp=0,Ks=200;function F(e){Xp+=1,gt.length>=100&&gt.shift(),gt[gt.length]=e.length>Ks?e.slice(0,Ks):e}var Yp=new Set(["loadBackendTranslation","loadFragmentTranslation"]),Zp=new Set(["call","send","set","fire","dispatch","post","put","patch","delete","remove","add","create","update","save","store","subscribe","unsubscribe","fetch","load","open","close","toggle","reload","restart","navigate","run","execute","invoke","emit","trigger","notify","turn","ws","api","login","logout","signout","upload","write","clear","reset","connect","disconnect","install","uninstall","enable","disable","start","stop","play","pause","push","publish","request","submit","register","revoke","refresh","resume","suspend","play","mute","press","click","dismiss","show","hide","edit","apply","change","select","activate","deactivate","cancel","confirm","reboot","shutdown","retry","sync","download","listen","attach","detach","mount","unmount","replace","insert","append","prepend","move","rename","copy","paste","kill","destroy","dispose","init","bootstrap","migrate","mutate"]),Jp=/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;function bt(e){if(Yp.has(e))return"loader";if(typeof e!="string")return"blocked";let n=e.match(Jp);if(n===null)return"blocked";for(let t of n)if(Zp.has(t.toLowerCase()))return"blocked";return"read"}var Qp=/^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|config\/entity_registry\/list_for_display$|auth\/current_user$|render_template$|history\/stream$|logbook\/event_stream$|subscribe_entities$|subscribe_events$|energy\/get_prefs$|energy\/info$|energy\/fossil_energy_consumption$|energy\/solar_forecast$|weather\/subscribe_forecast$|todo\/item\/list$|todo\/item\/subscribe$|calendar\/event\/subscribe$|recorder\/statistics_during_period$|recorder\/statistic_during_period$|recorder\/get_statistics_metadata$)/,eh=new Set(["state_changed","entity_registry_updated","device_registry_updated","area_registry_updated","label_registry_updated","floor_registry_updated","lovelace_updated"]);function Hr(e){return typeof e=="string"&&eh.has(e)}var th=["/api/states","/api/config","/api/history","/api/logbook","/api/camera_proxy","/api/image_proxy","/api/media_player_proxy"],Lr="x-http-method-override";function Ke(e){if(typeof e!="object"||e===null)return;let n={...e},t=n.type;if(typeof t=="string")return{type:t,msg:n}}function ze(e){return e===void 0||!Qp.test(e.type)?!1:e.type==="subscribe_events"?Hr(e.msg.event_type):!0}function Ve(e){return`ws:${e?e.type:"invalid"}`}var nh=/\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i,rh=/@|%2f/i,oh=/^[A-Za-z][A-Za-z0-9+.-]*:/;function ln(e,n=!1){return typeof e!="string"||e===""||nh.test(e)||e.startsWith("//")||rh.test(e.split(/[?#]/,1)[0])?!1:e.startsWith("/")?!0:n&&!oh.test(e)}function ih(e){return`/api/${e.split(/[?#]/,1)[0].replace(/^\/+/,"").replace(/^api\//,"")}`}function dn(e){let n=ih(e);return th.some(t=>n===t||n.startsWith(`${t}/`))}function Nr(e){if(e==null)return!1;let n=e;return typeof Headers<"u"&&e instanceof Headers?e.has(Lr):Array.isArray(e)?e.some(t=>Array.isArray(t)&&String(t[0]).toLowerCase()===Lr):typeof n=="object"?Object.keys(e).some(t=>t.toLowerCase()===Lr):!1}function cn(e){return typeof e=="string"?e:"invalid"}function un(e){return e==null||typeof e=="string"&&e.toUpperCase()==="GET"?"GET":null}function pn(e){return typeof e=="string"?e.toUpperCase():"invalid"}var x=Reflect.apply,ge=Reflect.has,re=Reflect.ownKeys,be=Reflect.getOwnPropertyDescriptor,mn=Reflect.getPrototypeOf,zs=Object.setPrototypeOf,Vs=Object.freeze,Ws=Reflect.defineProperty,vt=Array.isArray,qs=Math.trunc,sh=WeakMap.prototype.get,ah=WeakMap.prototype.set,Dv=WeakMap.prototype.has,lh=WeakSet.prototype.has,dh=WeakSet.prototype.add,ch=Object.prototype.hasOwnProperty,uh=Object.prototype.propertyIsEnumerable,ph=Function.prototype.bind,hh=Object.getOwnPropertyDescriptor(Map.prototype,"size")?.get,mh=Object.getOwnPropertyDescriptor(Set.prototype,"size")?.get,Gs=Date.prototype.getTime,Xs=Object.prototype.toString;function J(e,n){return x(sh,e,[n])}function de(e,n,t){x(ah,e,[n,t])}function yt(e,n){return x(lh,e,[n])}function hn(e,n){x(dh,e,[n])}function ye(e,n){return x(ch,e,[n])}function Ys(e,n){return x(uh,e,[n])}function Zs(e,n){return x(ph,e,[n])}function Fr(e,n){try{return x(e,n,[]),!0}catch{return!1}}function jr(e){try{return x(Xs,e,[])}catch{return""}}function fn(e){return jr(e)==="[object Map]"&&Fr(hh,e)}function gn(e){return jr(e)==="[object Set]"&&Fr(mh,e)}function Js(e){return jr(e)==="[object Date]"&&Fr(Gs,e)}function Qs(e){return x(Gs,e,[])}function ea(e){try{return x(Xs,e,[])==="[object Promise]"}catch{return!1}}var ta=new WeakSet,na=new WeakSet;function ra(e){if(!(typeof e!="object"||e===null)){hn(ta,e);for(let n of re(e)){let t=be(e,n);t&&typeof t.get=="function"&&hn(na,t.get)}}}for(let e of[Object,Function,Array,Map,Set,WeakMap,WeakSet,Date,Promise,RegExp,Error,String,Number,Boolean,Symbol,ArrayBuffer,DataView])ra(e.prototype);for(let e of["URL","URLSearchParams","Headers","Request","Response","Blob","EventTarget"]){let n=globalThis[e];typeof n=="function"&&ra(n.prototype)}function R(e,n,t){let r=e;for(;r!==null;){let o=be(r,n);if(o){if(ye(o,"value"))return o.value;let i=o.get;if(typeof i!="function")return;let s=yt(ta,r)&&!yt(na,i);return x(i,s?t:e,[])}r=mn(r)}}function oa(){return{disposed:!1,unsubs:new Set,epoch:0,connections:new WeakMap}}function ia(e){e.epoch+=1;for(let n of[...e.unsubs])try{n()}catch{continue}e.unsubs.clear()}var fh=new Set(["ready","disconnected"]);function sa(e,n){if(typeof e!="object"||e===null)return;let t=J(n.connections,e);if(t)return t;let r=e,o=n,i=()=>{},s=(m,...p)=>{let g=R(r,m,void 0);if(typeof g!="function")throw new TypeError(`Connection has no ${m}`);return x(g,r,p)},a=new Map;async function d(m,p){if(n.disposed)return i;let g=o.epoch,E=await p((...S)=>{!n.disposed&&typeof m=="function"&&x(m,void 0,S)});if(typeof E!="function")return i;if(n.disposed||o.epoch!==g)return E(),i;let M=()=>{o.unsubs.delete(M)&&E()};return o.unsubs.add(M),M}let c={get connected(){return R(r,"connected",void 0)},get haVersion(){return R(r,"haVersion",void 0)},socket:void 0,suspendReconnectUntil:i,async sendMessagePromise(m){let p=Ke(m);if(ze(p)&&!n.disposed)return s("sendMessagePromise",p.msg);F(Ve(p))},sendMessage(m,p){let g=Ke(m);if(ze(g)&&!n.disposed)return s("sendMessage",g.msg,p);F(Ve(g))},async subscribeMessage(m,p,g){let b=Ke(p);return ze(b)?d(m,E=>s("subscribeMessage",E,b.msg,g)):(F(Ve(b)),i)},async subscribeEvents(m,p){return Hr(p)?d(m,g=>s("subscribeEvents",g,p)):(F(`ws:subscribe_events:${typeof p=="string"?p:"invalid"}`),i)},addEventListener(m,p){if(typeof m!="string"||!fh.has(m)||typeof p!="function"){F(`event-listener:${typeof m=="string"?m:"invalid"}`);return}if(n.disposed)return;let g=a.get(m);if(g||(g=new Map,a.set(m,g)),g.has(p))return;let b=(S,...B)=>{n.disposed||x(p,c,[c,...B])},E=g,M=()=>{o.unsubs.delete(M)&&(E.delete(p),s("removeEventListener",m,b))};E.set(p,{forward:b,release:M}),s("addEventListener",m,b),o.unsubs.add(M)},removeEventListener(m,p){if(typeof m!="string")return;let g=a.get(m)?.get(p);g&&(a.get(m)?.delete(p),o.unsubs.delete(g.release),s("removeEventListener",m,g.forward))}};return gh(c),de(n.connections,e,c),c}function gh(e){for(let n of re(e)){let t=be(e,n);if(!t)continue;let r=Object.create(null);r.configurable=!1,r.enumerable=t.enumerable,ye(t,"value")?(r.value=t.value,r.writable=!1):(r.get=t.get,r.set=t.set),Ws(e,n,r)}}var xt=Set.prototype,ca=Map.prototype,ua=xt.has,wt=xt.add,bh=xt.delete,pa=xt.values,yh=Object.getOwnPropertyDescriptor(xt,"size")?.get,vh=Object.getOwnPropertyDescriptor(ca,"size")?.get,wh=ca.keys,ha=Object.getPrototypeOf(new Set().values()).next,xh=Object.getPrototypeOf(new Map().keys()).next,Kr=["union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"];function Br(e){return typeof e=="object"&&e!==null||typeof e=="function"}function Ur(e,n,t){let r=[];for(;;){let o=x(n,e,[]);if(o.done)return r;r[r.length]=t(o.value)}}function kh(e){return Ur(x(pa,e,[]),ha,n=>n)}function aa(e,n){let t=new Set;for(let r=0;r<n.length;r+=1)x(wt,t,[n[r]]);return{size:e,has:r=>x(ua,t,[r]),open(){let r=0;return{step:()=>r<n.length?{done:!1,value:n[r++]}:{done:!0},close(){}}}}}function $h(e){let n=+e;if(n!==n)throw new TypeError("Set-like size is invalid");let t=qs(n);if(t<0)throw new RangeError("Set-like size is negative");return t}function Eh(e,n){if(!Br(e))throw new TypeError("Set-like expected");let t=n.ownerOf(e),r=t??e;if(typeof r=="object"&&gn(r)){let a=Ur(x(pa,r,[]),ha,n.unwrap);return aa(x(yh,r,[]),a)}if(typeof r=="object"&&fn(r)){let a=Ur(x(wh,r,[]),xh,n.unwrap);return aa(x(vh,r,[]),a)}let o=$h(R(r,"size",e)),i=R(r,"has",e);if(typeof i!="function")throw new TypeError("Set-like has must be a function");let s=R(r,"keys",e);if(typeof s!="function")throw new TypeError("Set-like keys must be a function");return{size:o,has:a=>!!x(i,r,[t?a:n.view(a)]),open(){let a=x(s,r,[]);if(!Br(a))throw new TypeError("Set-like keys must return an object");let d=R(a,"next",a);if(typeof d!="function")throw new TypeError("Set-like iterator next must be a function");return{step(){let c=x(d,a,[]);if(!Br(c))throw new TypeError("Set-like iterator result must be an object");return R(c,"done",c)?{done:!0}:{done:!1,value:n.unwrap(R(c,"value",c))}},close(){let c=R(a,"return",a);typeof c=="function"&&x(c,a,[])}}}}}function _h(e){let n=new Set;for(let t=0;t<e.length;t+=1)x(wt,n,[e[t]]);return n}function bn(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return;n(r.value)}}function la(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return!1;if(n(r.value))return t.close(),!0}}function da(e,n){for(let t=0;t<e.length;t+=1)if(n(e[t]))return!0;return!1}function ma(e,n,t,r){let o=Eh(t,r),i=kh(n),s=i.length<=o.size,a=p=>x(ua,n,[p]),d=_h(i),c=p=>{x(wt,d,[p])},m=p=>{x(bh,d,[p])};switch(e){case"union":return bn(o,c),d;case"intersection":{let p=new Set;if(s)for(let g=0;g<i.length;g+=1)o.has(i[g])&&x(wt,p,[i[g]]);else bn(o,g=>{a(g)&&x(wt,p,[g])});return p}case"difference":if(s)for(let p=0;p<i.length;p+=1)o.has(i[p])&&m(i[p]);else bn(o,m);return d;case"symmetricDifference":return bn(o,p=>a(p)?m(p):c(p)),d;case"isSubsetOf":return i.length<=o.size&&!da(i,p=>!o.has(p));case"isSupersetOf":return i.length>=o.size&&!la(o,p=>!a(p));default:return s?!da(i,o.has):!la(o,a)}}var zr=new WeakMap,va=new WeakSet,Vr=new WeakMap,fa=new WeakMap,ve=Map.prototype,Re=Set.prototype,wa=new Map([["has",ve.has],["get",ve.get],["keys",ve.keys],["values",ve.values],["entries",ve.entries],["forEach",ve.forEach],[Symbol.iterator,ve[Symbol.iterator]]]),xa=new Map([["has",Re.has],["keys",Re.keys],["values",Re.values],["entries",Re.entries],["forEach",Re.forEach],[Symbol.iterator,Re[Symbol.iterator]]]),Th=Object.getOwnPropertyDescriptor(ve,"size")?.get,Sh=Object.getOwnPropertyDescriptor(Re,"size")?.get,Ah=Object.getPrototypeOf(new Map().entries()).next,Mh=Object.getPrototypeOf(new Set().values()).next,Ch=Promise.prototype.then,ka=new Map,$a=new WeakSet,Ea=new Map,_a=new Map;function Ta(e,n){for(let t of re(e)){if(t==="constructor")continue;let r=be(e,t);r&&typeof r.value=="function"&&($a.add(r.value),n.set(t,r.value))}}Ta(Object.prototype,_a);Ta(Array.prototype,Ea);function ga(e,n){let t=be(e,n);return t&&ye(t,"value")?t.value:void 0}function Sa(e,n,t){if(t){let o=Ea.get(n);if(o!==void 0&&ga(Array.prototype,n)===e)return o}let r=_a.get(n);if(r!==void 0&&ga(Object.prototype,n)===e)return r}for(let e of["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"])ka.set(e,Object.prototype[e]);var ba=Vs(Object.create(null)),Ph=new Set(["toString","toJSON","toLocaleString","valueOf"]),Rh=new Set(["get","getAll","has","toISOString"]);function Dh(e){if(typeof e!="object"||e===null)return!1;if(vt(e))return!0;let n=mn(e);return n===Object.prototype||n===null}function Oh(){throw new TypeError("Read-only")}function Aa(e){let n=J(fa,e);if(n)return n;let t=function(){throw new TypeError("Read-only view: functions on this value cannot be called")};return zs(t,null),de(fa,e,t),t}function vn(e){return typeof e!="object"||e===null?e:J(Vr,e)??e}function Ih(e,n){return(...t)=>{let r=[];for(let o=0;o<t.length;o+=1)r[o]=vn(t[o]);return D(x(e,n,r))}}function Ma(e,n,t,r){let o=R(e,n,r);if(typeof o!="function")return D(o);if(yt($a,o))return o;let i=Sa(o,n,vt(e));return i!==void 0?i:Ph.has(n)||!t&&Rh.has(n)?Ih(o,e):Aa(o)}function*Lh(e,n){for(;;){let t=x(n,e,[]);if(t.done)return;yield D(t.value)}}function Hh(e,n,t){let r=be(e,n);if(r)return vt(t)&&n==="length"?{value:R(e,n,void 0),writable:!0,enumerable:!1,configurable:!1}:ye(r,"value")?{value:D(r.value),writable:!1,enumerable:r.enumerable,configurable:!0}:{get:()=>D(R(e,n,J(zr,e))),set:void 0,enumerable:r.enumerable,configurable:!0}}function Wr(e){return{has:(n,t)=>ge(e,t),ownKeys:()=>re(e),getOwnPropertyDescriptor:(n,t)=>Hh(e,t,n),getPrototypeOf:()=>mn(e),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1}}function Nh(e){return{...Wr(e),get:(n,t,r)=>Ma(e,t,!0,r)}}function Fh(e){let n=ea(e),t=(r,o)=>x(Ch,e,[i=>typeof r=="function"?r(D(i)):D(i),i=>{if(typeof o=="function")return o(D(i));throw D(i)}]);return{...Wr(e),getPrototypeOf:()=>ba,get(r,o,i){return o==="constructor"||o==="__proto__"?ba:n&&o==="then"?t:n&&o==="catch"?s=>t(void 0,s):n&&o==="finally"?s=>t(a=>(typeof s=="function"&&s(),a),a=>{throw typeof s=="function"&&s(),a}):Ma(e,o,!1,i)}}}var jh=new Set([...wa.keys()]),Bh=new Set([...xa.keys(),...Kr]),Uh=new Set(Kr),Kh=new Set(["keys","values","entries",Symbol.iterator]),zh={unwrap:vn,view:e=>D(e),ownerOf:e=>J(Vr,e)};function ya(e,n,t){let r=t?Bh:jh,o=t?xa:wa,i=t?Sh:Th,s=t?Mh:Ah,a=new Proxy(n,{...Wr(e),get(d,c){if(c==="constructor"||c===Symbol.species)return R(e,c,a);if(c==="size")return x(i,e,[]);if(r.has(c)){if(Uh.has(c))return b=>{let E=ma(c,e,b,zh);return typeof E=="boolean"?E:D(E)};let g=o.get(c);return c==="get"?b=>D(x(g,e,[vn(b)])):c==="has"?b=>x(g,e,[vn(b)]):Kh.has(c)?()=>Lh(x(g,e,[]),s):(b,E)=>x(g,e,[(M,S)=>x(b,E,[D(M),D(S),a])])}let m=R(e,c,a);if(typeof m!="function")return D(m);let p=ka.get(c);return p!==void 0&&(p===m||Sa(m,c,!1)===p)?c==="valueOf"?()=>a:(...g)=>x(p,e,g):Oh}});return a}function yn(e,n){return de(zr,e,n),hn(va,n),de(Vr,n,e),n}function D(e){if(typeof e=="function")return Aa(e);if(typeof e!="object"||e===null||yt(va,e))return e;let n=J(zr,e);if(n)return n;if(Js(e))return new Date(Qs(e));if(fn(e))return yn(e,ya(e,new Map,!1));if(gn(e))return yn(e,ya(e,new Set,!0));if(!Dh(e))return yn(e,new Proxy({},Fh(e)));let t=vt(e)?[]:{};return yn(e,new Proxy(t,Nh(e)))}var Ra=new WeakMap,Ca=new WeakMap,Vh=Symbol("shared");function Da(e){let n=J(Ra,e);n&&(n.state.disposed=!0,ia(n.state))}function Wh(e,n){let t=R(e,"connection",void 0),r=typeof t=="object"&&t!==null?t:e,o=J(Ca,r);o||(o=new Map,de(Ca,r,o));let i=o.get(n);if(i&&!i.disposed)return i;let s=oa();return o.set(n,s),s}var Pa=new Map(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"].map(e=>[e,Object.prototype[e]])),qh="Preview closed: this read-only hass has been disposed";function Oa(e,n=Vh){let t=e,r=Wh(t,n),o=()=>{if(r.disposed)throw new Error(qh)},i=new Proxy({},{has(s,a){return a!=="auth"&&ge(t,a)},ownKeys(){return re(t).filter(s=>s!=="auth")},getOwnPropertyDescriptor(s,a){if(!(a==="auth"||!ge(t,a)))return{value:i[a],enumerable:!0,configurable:!0,writable:!1}},get(s,a){if(a==="auth")return;let d=R(t,a,i);if(a==="connection")return sa(d,r);if(Pa.has(a)&&d===Pa.get(a))return a==="hasOwnProperty"?m=>m!=="auth"&&ye(t,m):a==="valueOf"?()=>i:a==="toString"||a==="toLocaleString"?()=>"[object Object]":a==="isPrototypeOf"?()=>!1:m=>m!=="auth"&&Ys(t,m);if(typeof d!="function")return D(d);let c=d;switch(a){case"callService":return async(m,p)=>{F(`service:${String(m)}.${String(p)}`)};case"callWS":return async m=>{o();let p=Ke(m);if(ze(p))return x(c,t,[p.msg]);F(Ve(p))};case"callApi":return async(m,p,...g)=>{if(o(),typeof m=="string"&&un(m)){if(!ln(p,!0)||!dn(p)){F(`api-path:${cn(p)}`);return}return x(c,t,[m,p,...g])}F(`api:${pn(m)}`)};case"callApiRaw":return async(m,p,g,b,...E)=>{if(o(),typeof m!="string"||!un(m)){F(`api:${pn(m)}`);return}if(!ln(p,!0)||!dn(p)){F(`api-path:${cn(p)}`);return}let M=typeof b=="object"&&b!==null?{...b}:b;if(Nr(M)){F("api-header:method-override");return}return x(c,t,[m,p,g,M,...E])};case"fetchWithAuth":return async(m,p)=>{if(o(),!ln(m)||!dn(m)){F(`fetch-path:${cn(m)}`);return}if(p==null)return x(c,t,[m,p]);let g={...p};if(Nr(g.headers)){F("fetch-header:method-override");return}let b=g.method;if(!un(b)){F(`fetch:${pn(b)}`);return}return x(c,t,[m,g])};default:return bt(a)==="loader"?Zs(c,t):bt(a)==="read"?(...m)=>D(x(c,t,m)):async()=>{F(String(a))}}},set(){return!1},defineProperty(){return!1},deleteProperty(){return!1},setPrototypeOf(){return!1},preventExtensions(){return!1}});return de(Ra,i,{state:r}),i}function wn(e){return Number.isFinite(e)?Math.min(98,Math.max(2,e)):50}function Ia(e,n){return n.width>0?wn((e-n.left)/n.width*100):50}function La(e){return`inset(0 0 0 ${e}%)`}var Gh="__default__",Xh=6,Yh=8,Zh=160,Ha=["light","switch","climate","cover","media_player","sensor","binary_sensor"],Jh=new Set(["person","zone","sun","update","event","conversation","tts","todo","weather"]);function qr(e){return e??Gh}function Qh(e){return O(e)&&e.code==="config_not_found"}function em(e){let n=O(e)?e.message:e;return typeof n=="string"?Array.from(n).slice(0,Zh).join(""):""}async function Na(e,n){try{return{status:"ok",config:await ds(e,n)}}catch(t){return Qh(t)?{status:"notfound"}:{status:"error",reason:em(t)}}}async function Fa(e,n,t){let r=[];for(let o of e){let i=await n(o.url_path);if(t())return{entries:r,stale:!0};if(r.push(i),i.status==="ok"&&kt(i.config))return{hit:{entry:i,urlPath:o.url_path},entries:r,stale:!1}}return{entries:r,stale:!1}}function kt(e){return e?Tr(e).some(n=>Sr(n).length>0):!1}function ja(e){let n=new Map;for(let s of Object.keys(e??{})){let a=s.indexOf(".");if(a<=0)continue;let d=s.slice(0,a),c=n.get(d)??[];c.push(s),n.set(d,c)}let t=[...n.keys()].filter(s=>!Ha.includes(s)&&!Jh.has(s)).sort(),r=[...Ha.filter(s=>n.has(s)),...t];r.length===0&&(r=[...n.keys()].sort());let o=new Map(Object.entries(f.domainTitles)),i=r.slice(0,Xh).map(s=>({type:"entities",title:o.get(s)??s,entities:(n.get(s)??[]).sort().slice(0,Yh)}));if(i.length!==0)return{views:[{title:f.sampleView,cards:i}]}}function Ba(e){return e.status==="notfound"?f.generatedDefault:e.reason?`${f.loadError} ${e.reason}`:f.loadError}function Ua(e,n){let t=e?Tr(e):[];if(t.length===0)return{views:t,cards:[],notice:f.noViews};if(!kt(e))return{views:t,cards:[],notice:f.noCards};let r=Sr(t[n]??t[0]);return Ar(r)>ts?{views:t,cards:[],notice:f.tooManyCards}:{views:t,cards:r,notice:r.length===0?f.emptyView:""}}function Ka(e,n){return e.find(t=>t.url_path===n)?.title??f.defaultDashboard}var tm="hats_lite_compare",nm="hats_lite_compare_designer";function za(e){return e?tm:nm}function Va(e=!0){try{let n=window.localStorage.getItem(za(e));return n===null?e:n!=="0"}catch{return e}}function Wa(e,n=!0){try{window.localStorage.setItem(za(n),e?"1":"0")}catch{return}}var Ga="hats_lite_preview_menu";var Xa={menu:"M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z",overview:"M13 3v6h8V3zM13 21h8V11h-8zM3 21h8v-6H3zM3 13h8V3H3z",map:"M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z",logbook:"M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 11h2v2H3zM3 17h2v2H3z",history:"M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z",energy:"M13 2 4 14h6l-1 8 9-12h-6z",settings:"M10.5 2h3l.5 2.6 1.8.8 2.2-1.5 2.1 2.1-1.5 2.2.8 1.8 2.6.5v3l-2.6.5-.8 1.8 1.5 2.2-2.1 2.1-2.2-1.5-1.8.8-.5 2.6h-3L10 20.4l-1.8-.8-2.2 1.5-2.1-2.1 1.5-2.2-.8-1.8L2 13.5v-3l2.6-.5.8-1.8-1.5-2.2L6 3.9l2.2 1.5 1.8-.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",bell:"M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4.5-5.8V4.5a1.5 1.5 0 0 0-3 0v.7A6 6 0 0 0 6 11v5l-2 2v1h16v-1z",search:"M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3zm0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z",more:"M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"},Ya=["overview","map","logbook","history","energy"],Za=["settings","bell"];function Ja(){try{return window.localStorage.getItem(Ga)!=="0"}catch{return!0}}function Qa(e){try{window.localStorage.setItem(Ga,e?"1":"0")}catch{return}}function el(e,n){return n&&e!=="phone"}var qa={desktop:0,tablet:820,phone:390};function tl(e,n){return e==="desktop"?"100%":n?`calc(${qa[e]}px + var(--hats-lite-sidebar-width))`:`${qa[e]}px`}function nl(e){return e?"calc(256px * var(--hats-lite-density-scale, 1))":"0px"}function rm(e){return e.startsWith("card-mod-")||e.startsWith("uix-")}function $t(e){if(!e)return!1;let n=e.entry;return(n?[n.vars,n.modes?.dark,n.modes?.light]:[e.vars]).some(r=>Object.keys(r??{}).some(rm))}var om="hats_lite/install_theme",im="hats_lite/uninstall_theme",rl="hats-lite-theme-installed",sm=12e3,Et=0,am=/^https:\/\/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;function ol(e){let n=e?am.exec(e):null;return n?`https://my.home-assistant.io/redirect/hacs_repository/?${new URLSearchParams({owner:n[1],repository:n[2],category:"theme"}).toString()}`:void 0}function il(e){if(typeof e!="object"||e===null)return"";let n=e.code;return typeof n=="string"?n:""}function lm(e,n="install"){let t=il(e),r=n==="install"?f.installErrors:f.uninstallErrors;return Object.prototype.hasOwnProperty.call(r,t)?r[t]:r.unknown}function sl(){return Et>0}var xn=class{constructor(n){this.host=n;this.phase="idle";this.op="install";this.error="";this.stale=!1;this.epoch=0}set(n,t=""){this.phase=n,this.error=t,this.host.requestUpdate()}focus(n){this.host.updateComplete.then(()=>this.host.renderRoot.querySelector(n)?.focus())}button(){return this.op==="install"?".install":".uninstall"}clearTimer(){this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}dispose(){this.epoch+=1,this.clearTimer()}clearStale(){this.stale=!1}settle(n){this.phase!=="done"||this.op!==n||(this.clearTimer(),this.set("idle"))}begin(n){this.phase!=="idle"||Et>0||(this.op=n,this.set("confirm"),this.focus(".install-confirm"))}cancel(){this.phase==="confirm"&&(this.set("idle"),this.focus(this.button()))}reset(){this.stale=!1,this.epoch+=1,this.clearTimer(),(this.phase!=="idle"||this.error)&&this.set("idle")}async run(n,t,r,o){if(this.phase!=="confirm"||!n||Et>0)return;let i=this.epoch,s=this.op;this.set("busy"),this.focus(this.button()),Et+=1;let a=!1,d="";try{let c={type:s==="install"?om:im,full_name:t.fullName,hacs_id:t.hacsId};s==="uninstall"&&o&&(c.selected_theme=o),await P(n,c)}catch(c){if(a=il(c)==="reload_failed",d=lm(c,s),!a){i===this.epoch&&this.set("idle",d),this.focus(this.button());return}}finally{Et-=1,this.host.requestUpdate()}r({fullName:t.fullName,partial:a}),i===this.epoch&&(s==="uninstall"&&(this.stale=!0),this.set(a?"idle":"done",d),!a&&(this.focus(this.button()),this.timer=setTimeout(()=>{this.timer=void 0,!(i!==this.epoch||this.phase!=="done")&&(this.set("idle",s==="install"?f.installTimeout:f.uninstallTimeout),r({fullName:t.fullName,partial:!0}))},sm)))}};var al="hats-lite-preview-nav",dm="select, input, textarea, [role='slider'], [contenteditable]";function ll(e){if(e.defaultPrevented||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return 0;let n=e.composedPath()[0];return n instanceof Element&&n.closest(dm)?0:e.key==="ArrowLeft"?-1:1}function We(e,n,t){let r=e+t;return r<0||r>=n?null:r}function cm(e){return f.navPosition.replace("{name}",e.name).replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}function um(e,n){return e.locked===!0||We(e.index,e.total,n)===null}function dl(e){return l`
    <div class="nav" role="group" aria-label=${f.navGroup}>
      <span class="nav-info">
        <span class="nav-name">${e.name}</span>
        <span class="nav-pos">${f.navCount.replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}</span>
      </span>
      <span class="sr-only" role="status" aria-live="polite">${e.pending?f.navLoading:e.error||cm(e)}</span>
    </div>`}function Gr(e,n,t){let r=um(e,n),o=n===-1;return l`
    <div class=${o?"nav-side nav-side-prev":"nav-side nav-side-next"}>
      <button type="button" class=${o?"nav-btn nav-prev":"nav-btn nav-next"}
        aria-label=${o?f.navPrev:f.navNext} aria-disabled=${r?"true":"false"}
        @click=${()=>{r||t(n)}}>${o?"←":"→"}</button>
    </div>`}async function cl(e,n,t){let r=window.hatsLite;if(!r)return f.trialUnavailable;try{return await r.startTrial(os(e),is(n,t)),""}catch{return f.trialFailed}}function Xr(e,n,t){if(e)return e;if(!n)return;let r=t?.themes?.darkMode?"dark":"light";return n===r?void 0:n}var qe=e=>e??u;function Yr(e){return e.show&&e.admin&&e.hasTarget}function Zr(e){return e.stale||e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done")}function pm(e){return e.op==="install"&&e.phase==="busy"?f.installBusy:e.op==="install"&&e.phase==="done"?f.installLoading:f.installButton}function ul(e,n){let t=e.op==="install"&&(e.phase==="busy"||e.phase==="done"),r=t||e.locked||e.phase==="confirm";return l`<button type="button" class="btn primary success install" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} @click=${()=>{r||n.onBegin("install")}}>${pm(e)}</button>`}function hm(e){return e.op!=="uninstall"?f.uninstallButton:e.phase==="busy"?f.uninstallBusy:e.phase==="done"?f.uninstallUpdating:f.uninstallButton}function pl(e,n){if(!e.canUninstall)return u;let t=e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done"),r=Zr(e)||e.locked||e.inUse||e.phase==="confirm",o=()=>{r||n.onBegin("uninstall")};return l`
    <button type="button" class="btn danger uninstall" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} aria-describedby=${qe(e.inUse?"uninstall-hint":void 0)} @click=${o}>${hm(e)}</button>
    ${e.inUse?l`<p id="uninstall-hint" class="chip note">${f.uninstallSwitchFirst}</p>`:u}`}function mm(e){return e?l`<a class="chip link hacs-link" href=${e} target="_blank" rel="noopener noreferrer">${f.hacsLink}</a>`:u}function fm(e){return n=>{if(n.key==="Escape"){n.stopPropagation(),e.onCancel();return}if(n.key!=="Tab")return;let t=n.currentTarget,r=Array.from(t.querySelectorAll("button")),o=r[0],i=r[r.length-1],s=t.getRootNode().activeElement;n.shiftKey&&s===o?(n.preventDefault(),i.focus()):!n.shiftKey&&s===i&&(n.preventDefault(),o.focus())}}function gm(e,n){let t=e.op==="uninstall",r=()=>{e.locked||n.onConfirm()},o=t?f.uninstallConfirmBody:f.installConfirmBody;return l`
    <div class="install-dialog" role="alertdialog" aria-labelledby="install-title" aria-describedby="install-body" @keydown=${fm(n)}>
      <strong id="install-title">${t?f.uninstallConfirmTitle:f.installConfirmTitle}</strong>
      <p id="install-body">${o.replace("{repo}",e.repoName)}</p>
      <button type="button" class="btn install-confirm ${t?"danger":"primary success"}" aria-disabled=${e.locked?"true":"false"} @click=${r}>${t?f.uninstallConfirmYes:f.installConfirmYes}</button>
      <button type="button" class="btn install-cancel" @click=${n.onCancel}>${f.installCancel}</button>
    </div>`}function bm(e){return e.phase==="busy"?e.op==="install"?f.installBusy:f.uninstallBusy:e.phase==="done"?e.op==="install"?f.installWaiting:f.uninstallWaiting:""}function hl(e,n){let t=e.phase==="confirm"&&(Yr(e)||e.canUninstall)?gm(e,n):u,r=bm(e),o=l`<span class="sr-only install-status" role="status">${r}</span>`,i=u;e.show&&!e.admin?i=l`<p class="chip note">${f.adminOnly}</p>`:e.show&&!e.hasTarget&&(i=l`<p class="chip note">${f.installViaHacs}</p>`);let s=e.show&&(!e.admin||!e.hasTarget||e.error!=="");return l`${i}${t}${o}${s?mm(e.hacs):u}`}var fl="/hats_lite_static/real",ml=/^\w[\w.-]*\/\w[\w.-]*\.webp$/,ym=/^[0-9a-f]{7,40}$/,vm={fetchIndex(){return fetch(`${fl}/index.json`,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(String(e.status));return e.json()})}},Jr=null;function wm(e){let n=e;if(!n||n.version!==1||!Array.isArray(n.items))return[];let t=[];for(let r of n.items){if(!r||typeof r!="object")continue;let{full_name:o,name:i,commit:s,dark:a,light:d}=r;if(typeof o!="string"||typeof i!="string"||typeof s!="string"||!ym.test(s))continue;let c=typeof a=="string"&&ml.test(a),m=typeof d=="string"&&ml.test(d);!c&&!m||t.push({full_name:o,name:i,commit:s,dark:c?a:"",light:m?d:""})}return t}function gl(){return Jr||(Jr=Promise.resolve().then(()=>vm.fetchIndex()).then(wm).catch(()=>[])),Jr}function bl(e,n,t){if(!(!n||!t))return e.find(r=>r.full_name===n&&r.name===t)}function yl(e,n){let t=n==="dark"?"light":"dark";for(let r of[n,t])if(e[r])return{url:`${fl}/${e[r]}`,mode:r};return null}function vl(e,n){if(!e.available)return u;let t=r=>()=>{e.real!==r&&n(r)};return l`
    <div class="field look-switch">${f.lookLabel}
      <div class="seg" role="group" aria-label=${f.lookLabel}>
        <button type="button" class="look-real" aria-pressed=${e.real?"true":"false"} @click=${t(!0)}>${f.realLook}</button>
        <button type="button" class="look-live" aria-pressed=${e.real?"false":"true"} @click=${t(!1)}>${f.livePreview}</button>
      </div>
    </div>`}function wl(e,n,t){let r=yl(e,n);if(!r)return u;let o=f.realAlt.replace("{name}",e.name).replace("{mode}",f[r.mode].toLowerCase());return l`
    <figure class="real-look">
      <img src=${r.url} alt=${o} decoding="async" @error=${t} />
      <figcaption class="footnote real-caption">${f.realCaption.replace("{commit}",e.commit)}</figcaption>
    </figure>`}var xl=_`
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
`;function _t(e){return l`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${Ii`<path d=${Xa[e]} fill="currentColor" fill-rule="evenodd"></path>`}</svg>`}function kl(e,n){return l`<div class=${n?"item selected":"item"}>${_t(e)}<span class="text">${f.shell[e]}</span></div>`}function xm(){return l`
    <div class="sidebar">
      <div class="side-menu"><span class="side-burger">${_t("menu")}</span><span class="side-title">${f.shell.title}</span></div>
      <div class="side-list">${Ya.map((e,n)=>kl(e,n===0))}</div>
      <div class="side-list fixed">
        ${Za.map(e=>kl(e,!1))}
        <div class="item user"><span class="avatar">${f.shell.profile.charAt(0)}</span><span class="text">${f.shell.profile}</span></div>
      </div>
    </div>`}function km(e){return l`
    <div class="appbar">
      <span class="hamburger">${_t("menu")}</span>
      <span class="title">${e}</span>
      <span class="tools">${_t("search")}${_t("more")}</span>
    </div>`}function Qr(e){return l`
    <div class="shell" aria-hidden="true" inert>
      ${xm()}
      <div class="main">${km(e)}<div class="cards" inert></div></div>
    </div>`}function $l(e,n){let t=e.frame==="phone",r=o=>()=>{e.menu!==o&&n.onMenu(o)};return l`
    <div class="field menu-switch">${f.menu}
      <div class="seg" role="group" aria-label=${f.menu}>
        <button type="button" class="menu-on" aria-pressed=${e.menu?"true":"false"} ?disabled=${t} @click=${r(!0)}>${f.on}</button>
        <button type="button" class="menu-off" aria-pressed=${e.menu?"false":"true"} ?disabled=${t} @click=${r(!1)}>${f.off}</button>
      </div>
    </div>`}function El(e){return e?l`<p class="footnote mod-note" role="status">${f.modNote}</p>`:u}var $m=600,_l=`(max-width: ${$m}px)`,oe=Kt(`@media ${_l}`);function Tl(e){if(typeof window.matchMedia!="function")return()=>{};let n=window.matchMedia(_l),t=r=>e(r.matches);return n.addEventListener("change",t),()=>n.removeEventListener("change",t)}var we=44,Em="--hl-kb",Al=_`
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
`,Ml=_`
  .toolbar {
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }
  ${oe} {
    .actions {
      bottom: var(--hl-kb, env(keyboard-inset-height, 0px));
      padding-top: 10px;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
    }
  }
`;function _m(e,n){let t=n-e.height-e.offsetTop;return Number.isFinite(t)&&t>0?Math.round(t):0}var Sl=!1;function eo(e=window){let n=e.visualViewport;if(Sl||!n)return!1;Sl=!0;let t=e.document.documentElement,r=()=>{t.style.setProperty(Em,`${_m(n,e.innerHeight)}px`)};return n.addEventListener("resize",r),n.addEventListener("scroll",r),r(),!0}eo();var Tm="select, input, button:not([disabled]), a[href]",to=class extends A{constructor(){super(...arguments);this.open=!1;this.label="";this.stopWatching=()=>{};this.onKey=t=>{t.key!=="Escape"||!this.open||(t.stopPropagation(),this.close(!0))}}static{this.properties={open:{type:Boolean,reflect:!0},label:{type:String}}}static{this.styles=_`
    :host,
    .sheet {
      display: contents;
    }
    .toggle {
      display: none;
    }
    ${oe} {
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
        min-height: ${we}px;
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
  `}connectedCallback(){super.connectedCallback(),eo(),this.addEventListener("keydown",this.onKey),this.stopWatching=Tl(t=>{t||(this.open=!1)})}disconnectedCallback(){this.removeEventListener("keydown",this.onKey),this.stopWatching(),this.stopWatching=()=>{},super.disconnectedCallback()}close(t){this.open=!1,t&&this.renderRoot.querySelector(".toggle")?.focus()}async toggle(){if(this.open)return this.close(!1);this.open=!0,await this.updateComplete,this.querySelector(Tm)?.focus()}render(){return l`
      <button type="button" class="toggle" aria-expanded=${this.open?"true":"false"} aria-controls="sheet" @click=${()=>this.toggle()}>
        <span>${this.label}</span><span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="sheet" id="sheet" role="group" aria-label=${this.label}><slot></slot></div>
    `}};customElements.get("hats-lite-sheet")||customElements.define("hats-lite-sheet",to);var Sm={normal:"1",compact:"0.85"},Am=["desktop","tablet","phone"],Mm=["normal","compact"],Cm=["dark","light"];function Cl(e,n,t,r){return{applicable:Yt(e),tryable:Zt(e),trying:n,collision:e.nameCollision?f.nameCollision.replace("{name}",e.name):"",repo:as(e.repoUrl),error:t,pending:r.pending,install:r.install}}function Pl(e,n){return!e||Object.keys(Jt(e,n)).length>0?"":f.noModeBlock.replace("{mode}",f[n].toLowerCase())}function no(e,n,t){return l`<button type="button" aria-pressed=${n?"true":"false"} @click=${t}>${e}</button>`}function Pm(e,n){return e.url_path===null&&n?`${e.title} ${f.generatedSuffix}`:e.title}function Rm(e,n){let t=r=>()=>{e.compare!==r&&n.onCompare()};return l`
    <div class="field view-switch">${f.compareLabel}
      <div class="seg" role="group" aria-label=${f.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${e.compare?"true":"false"}
          ?disabled=${!e.canCompare||e.real} aria-describedby=${qe(e.real?"compare-hint":void 0)} @click=${t(!0)}>${f.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${e.compare?"false":"true"}
          ?disabled=${!e.canCompare||e.real} @click=${t(!1)}>${f.themeOnly}</button>
      </div>
      ${e.real?l`<span id="compare-hint" class="compare-hint">${f.compareHint}</span>`:u}
    </div>`}function Rl(e,n){return l`
    <div class="toolbar">
      <hats-lite-sheet .label=${f.sheet}>
      <label class="field">${f.dashboard}
        <select class="pill" @change=${n.onDashboard}>
          ${e.dashboards.map((t,r)=>l`<option value=${String(r)} .selected=${t.url_path===e.dashboardUrl}>${Pm(t,e.generatedDefault)}</option>`)}
        </select>
      </label>
      ${e.showViews?l`<label class="field">${f.view}
            <select class="pill" @change=${n.onView}>
              ${e.views.map((t,r)=>l`<option value=${String(r)} .selected=${r===e.viewIndex}>${cs(t,r)}</option>`)}
            </select>
          </label>`:u}
      <div class="seg" role="group" aria-label=${f.device}>
        ${Am.filter(t=>!(t==="tablet"&&e.hide?.includes("tablet"))).map(t=>no(f[t],e.frame===t,()=>n.onFrame(t)))}
      </div>
      <div class="seg" role="group" aria-label=${f.density}>
        ${Mm.map(t=>no(f[t],e.density===t,()=>n.onDensity(t)))}
      </div>
      ${e.hide?.includes("mode")?u:l`<div class="seg" role="group" aria-label=${f.mode}>
        ${Cm.map(t=>no(f[t],e.mode===t,()=>n.onMode(t)))}
      </div>`}
      ${$l({frame:e.frame,menu:e.menu},n)}
      ${vl({available:e.realAvailable,real:e.real},n.onLook)}
      ${Rm(e,n)}
      </hats-lite-sheet>
    </div>`}function Dl(e,n){let t=el(e.frame,e.menu);return l`
    <div class="frame" data-sidebar=${t?"on":"off"} style=${te({"--hats-lite-frame-width":tl(e.frame,t),"--hats-lite-sidebar-width":nl(t),"--hats-lite-density-scale":Sm[e.density]})}>
      <div class=${e.comparing?"stage":"stage solo"}>
        <div class="pane current">${Qr(e.title)}</div>
        <div class="pane candidate" style=${te(e.comparing?{clipPath:La(e.split)}:{})}>${Qr(e.title)}</div>
        <div class="shield"></div>
        ${e.comparing?l`<div class="divider" role="slider" tabindex="0"
              aria-label=${f.divider}
              aria-valuemin="2" aria-valuemax="98"
              aria-valuenow=${String(Math.round(e.split))}
              aria-valuetext=${f.splitAt.replace("{percent}",String(Math.round(e.split)))}
              style=${te({left:`${e.split}%`})}
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
    ${El(e.modNote)}`}function Ol(e,n,t){return e?l`
    <div class="nav-frame">
      ${dl(e)}
      ${Gr(e,-1,n)}
      ${Gr(e,1,n)}
      <div class="nav-content">${t}</div>
    </div>`:t}function Il(e,n){let t=Zr(e.install),r=e.collision?"collision-note":void 0,o=e.install.inUse&&!e.collision,i=l`<button type="button" class="btn primary success apply" aria-describedby=${qe(r)} ?disabled=${!e.applicable||e.pending||t} @click=${n.onApply}>${e.collision&&!e.applicable?f.nameTaken:f.apply}</button>`;return l`
    <div class="actions">
      ${o?u:Yr(e.install)?ul(e.install,n.install):i}
      ${o?u:l`<button type="button" class="btn try" aria-describedby=${qe(r)} ?disabled=${!e.tryable||e.trying||e.pending||t} @click=${n.onTry}>${f.tryButton}</button>`}
      ${o&&!e.install.canUninstall?l`<span class="chip ok in-use-chip">${f.inUseChip}</span>`:u}
      ${pl(e.install,n.install)}
      ${!e.applicable&&e.repo?l`<a class="chip link" href=${e.repo} target="_blank" rel="noopener noreferrer">${f.repoLink}</a>`:u}
      ${hl(e.install,n.install)}
      ${e.collision?l`<p id="collision-note" class="chip warn collision" role="status">${e.collision}</p>`:u}
      ${e.error?l`<p class="error" role="alert">${e.error}</p>`:u}
    </div>`}var kn=class{constructor(n){this.host=n;this.onKeyDown=n=>{let t=ll(n),r=this.host.nav;t===0||!r||this.host.trying||We(r.index,r.total,t)===null||(n.preventDefault(),this.moveBy(t))};this.flow=new xn(n),n.addController(this)}hostConnected(){this.host.addEventListener("keydown",this.onKeyDown)}hostDisconnected(){this.flow.dispose(),this.host.removeEventListener("keydown",this.onKeyDown)}hostUpdate(){let{candidate:n,install:t}=this.host;n&&this.flow.settle(n.installed?"install":"uninstall"),n&&!n.installed&&this.flow.clearStale();let r=(t??this.host.uninstall)?.fullName;if(n!==this.watched||r!==this.watchedKey){let o=n?.name===this.watched?.name&&r===this.watchedKey;this.watched=n,this.watchedKey=r,o||this.flow.reset()}}moveBy(n){let t=this.host.nav;!t||this.host.trying||We(t.index,t.total,n)===null||this.host.dispatchEvent(new CustomEvent(al,{detail:{direction:n},bubbles:!0,composed:!0}))}apply(){let{candidate:n,hass:t}=this.host;if(!n||!Yt(n)||this.host.nav?.pending)return;let r={theme:n.name},o=Xr(this.host.userMode,this.host.mode,t);o&&(r.dark=o==="dark"),this.host.dispatchEvent(new CustomEvent("settheme",{detail:r,bubbles:!0,composed:!0}))}async tryTheme(){let{candidate:n,hass:t}=this.host;!n||!Zt(n)||this.host.trying||this.host.nav?.pending||(this.host.error="",this.host.trying=!0,this.host.error=await cl(t,n,Xr(this.host.userMode,this.host.mode,t)),this.host.trying=!1)}selected(){let n=this.host.hass;return n?.selectedTheme?.theme??n?.themes?.theme??"default"}installModel(n){let t=this.host.hass?.user?.is_admin===!0,r=this.host.install??this.host.uninstall,o=this.host.nav?.pending===!0;return{show:!n.installed&&!n.nameCollision,admin:t,hasTarget:!!this.host.install,phase:this.flow.phase,op:this.flow.op,locked:sl()||o,error:this.flow.error,repoName:r?.fullName??n.name,hacs:ol(n.repoUrl),canUninstall:t&&!!this.host.uninstall&&n.installed&&!n.nameCollision,stale:this.flow.stale,inUse:this.selected().toLowerCase()===n.name.toLowerCase()}}confirm(){let n=this.flow.op,t=n==="install"?this.host.install:this.host.uninstall;if(!t)return;let r=n==="uninstall"?this.selected():void 0;this.flow.run(this.host.hass,t,o=>this.host.dispatchEvent(new CustomEvent(rl,{detail:o,bubbles:!0,composed:!0})),r)}render(){let n=this.host.candidate;if(!this.host.showActions||!n)return u;let t=Cl(n,this.host.trying,this.host.error||this.flow.error,{pending:this.host.nav?.pending===!0,install:this.installModel(n)});return Il(t,{onApply:()=>this.apply(),onTry:()=>void this.tryTheme(),install:{onBegin:r=>this.flow.begin(r),onCancel:()=>this.flow.cancel(),onConfirm:()=>this.confirm()}})}};var Ll=_`
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
`;var Dm="lovelace";async function Hl(e){if(typeof e!="object"||e===null)return;let n=e,t=n.loadFragmentTranslation;if(typeof t!="function")return;let r,o=new Promise(i=>{r=setTimeout(i,3e3)});try{await Promise.race([Promise.resolve(t.call(n,Dm)).then(()=>{}),o])}catch{return}finally{clearTimeout(r)}}var Fl=new Set(["states","entities","devices","areas","floors","labels","extendedEntities","config","themes","selectedTheme","user","panels","narrowViewport","hassRegistries","hassConfig"]),Om=new Set(["localize","locale","hassInternationalization","hassFormatters","hassUi"]);function Im(e){return typeof e=="string"&&(Fl.has(e)||Om.has(e))}function jl(e){if(typeof e!="object"||e===null||Array.isArray(e))return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null}function Nl(e,n,t){let r=R(e,n,t);if(typeof r=="function"){let o=r;return bt(n)!=="read"?async()=>{F(`context:${String(n)}`)}:(...i)=>D(x(o,e,i))}return jl(r)?Bl(r):D(r)}function Bl(e){let n=new Proxy({},{has:(t,r)=>ge(e,r),ownKeys:()=>re(e),getOwnPropertyDescriptor:(t,r)=>ge(e,r)?{value:Nl(e,r,n),enumerable:!0,configurable:!0,writable:!1}:void 0,get:(t,r)=>Nl(e,r,n),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1});return n}function Lm(e,n){return Fl.has(e)?D(n):typeof n=="object"&&n!==null?jl(n)?Bl(n):D(n):n}function Hm(e){let n=e.getRootNode();return typeof ShadowRoot<"u"&&n instanceof ShadowRoot?n.host:e.parentElement}function Ul(e){let n=new Set,t=!0,r=i=>{let s=i,{context:a,callback:d}=s;if(!t||!Im(a)||typeof d!="function")return;let c=Hm(e);if(!c)return;i.stopPropagation();let m=i.composedPath()[0],p=d,g=new Map,b=(M,S)=>{if(!t)return;let B=S;if(typeof S=="function"){let L=S,X=g.get(L);if(!X){let U=()=>{n.delete(U),g.delete(L),L()};X=U,g.set(L,U),n.add(U)}B=X}p(Lm(a,M),B)},E=new Event("context-request",{bubbles:!0,composed:!0});Object.assign(E,{context:a,callback:b,subscribe:s.subscribe===!0,contextTarget:m}),c.dispatchEvent(E)};return e.addEventListener("context-request",r),Object.assign(()=>{t=!1,e.removeEventListener("context-request",r);for(let i of n)try{i()}catch{continue}n.clear()},{pending:()=>n.size})}var Nm=["hass-action","hass-more-info","show-dialog","hass-toggle-menu","location-changed","hass-dock-sidebar","hass-edit-sidebar","hass-set-theme","hass-service-called","hass-reload-themes","hass-open-link","popstate","iron-overlay-opened","ll-show-dashboard","hass-kiosk-mode","hass-language-select","hass-vibrate","hass-suspend-when-hidden","hass-enable-shortcuts","hass-time-zone-select","hass-date-format-select","hass-time-format-select","hass-first-weekday-select","hass-number-format-select","hass-refresh-current-user","hass-quick-bar-trigger","hass-show-notifications"],Fm=["context-request","ll-custom","hass-notification","settheme","navigate","ll-open-dialog","hass-quick-bar","show-edit-card","ll-rebuild","hass-logout","config-refresh","dialog-closed","haptic"],jm=new Set(["value-changed","iron-resize","iron-select","iron-deselect","iron-activate","iron-items-changed","selected","selected-changed","expanded-changed","opened-changed","input","change","load","error","focus","blur","focusin","focusout","click","dblclick","auxclick","contextmenu","mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave","pointerdown","pointerup","pointermove","pointerover","pointerout","pointerenter","pointerleave","pointercancel","gotpointercapture","lostpointercapture","touchstart","touchmove","touchend","touchcancel","keydown","keyup","keypress","wheel","scroll","resize","select","submit","reset","toggle","slotchange","transitionend","animationend","dragstart","dragend","dragenter","dragover","dragleave","drop"]),Bm=new Set,Um=/^(hass-|ll-|show-)/;function ql(e){return Um.test(e)&&!Bm.has(e)}var Km=200,Tt=EventTarget.prototype.dispatchEvent,Gl=EventTarget.prototype.addEventListener,Xl=EventTarget.prototype.removeEventListener,zm=window.addEventListener,Vm=window.removeEventListener,Wm=Event.prototype.composedPath,qm=Object.getOwnPropertyDescriptor(Node.prototype,"parentNode")?.get,Gm=Object.getOwnPropertyDescriptor(Node.prototype,"nodeType")?.get,Kl=typeof ShadowRoot>"u"?void 0:Object.getOwnPropertyDescriptor(ShadowRoot.prototype,"host")?.get,Xm=11,G=Reflect.apply,St=new WeakSet,Yl=new Set,En=new WeakMap,$n=new Set,ro=new Map,Zl=0,At=0,Ge=null;function Jl(e){e.stopPropagation()}function _n(e,n,t){let r=En.get(e);r||(r=new Map,En.set(e,r)),!r.has(n)&&(r.set(n,t),G(Gl,e,[n,Jl,{capture:t}]))}function zl(e){try{if(G(Gm,e,[])===Xm&&Kl)return G(Kl,e,[])}catch{return e}return e}function Ql(e){if(typeof e!="object"||e===null)return null;let n=zl(e);for(;n;){if(St.has(n))return n;let t=null;try{t=G(qm,n,[])}catch{return null}n=t===null?null:zl(t)}return null}function Vl(e){if(At===0)return;let n=G(Wm,e,[]),t=Ql(n.length>0?n[0]:e.target);t&&_n(t,e.type,ql(e.type))}function Ym(e,n){if(!$n.has(n)){if($n.size>=Km)return!1;$n.add(n),ro.set(n,Vl),G(zm,window,[n,Vl,{capture:!0}])}return _n(e,n,!1),!0}function Wl(e,n,t){let r=t.type,o=i=>i.stopPropagation();G(Gl,e,[r,o,{capture:!0}]);try{return G(Tt,n,[t])}finally{G(Xl,e,[r,o,{capture:!0}])}}function Zm(){Ge||(Ge=function(n){if(At===0||!n||typeof n.type!="string"||jm.has(n.type))return G(Tt,this,[n]);let t=Ql(this);return t?ql(n.type)?Wl(t,this,n):Ym(t,n.type)?G(Tt,this,[n]):(Zl+=1,Wl(t,this,n)):G(Tt,this,[n])},Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:Ge}))}function Jm(){for(let[e,n]of ro)G(Vm,window,[e,n,{capture:!0}]);ro.clear(),$n.clear(),Zl=0,Ge&&EventTarget.prototype.dispatchEvent===Ge&&(Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:Tt}),Ge=null)}function ed(e){if(!St.has(e)){St.add(e),Yl.add(e),At+=1;for(let n of Nm)_n(e,n,!0);for(let n of Fm)_n(e,n,!1);Zm()}}function td(e){if(!St.has(e))return;St.delete(e),Yl.delete(e);let n=En.get(e);if(n){for(let[t,r]of n)G(Xl,e,[t,Jl,{capture:r}]);En.delete(e)}At-=1,At===0&&Jm()}var Tn=class{sync(n){let t=n?.querySelector(".stage"),r=t instanceof HTMLElement?t:void 0;return r===this.current?!1:(this.release(),r&&(this.current=r,ed(r),this.stopRelay=Ul(r)),r!==void 0)}release(){this.stopRelay?.(),this.stopRelay=void 0,this.current&&td(this.current),this.current=void 0}};var Qm={"markdown-code-background-color":"var(--primary-background-color)","table-row-background-color":"var(--primary-background-color)","table-row-alternative-background-color":"var(--secondary-background-color)","table-header-background-color":"var(--secondary-background-color)","data-table-background-color":"var(--card-background-color)","input-ink-color":"var(--primary-text-color)","input-label-ink-color":"var(--secondary-text-color)","input-idle-line-color":"color-mix(in srgb, var(--primary-text-color) 42%, transparent)","input-hover-line-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-disabled-ink-color":"var(--disabled-text-color)","input-disabled-fill-color":"color-mix(in srgb, var(--primary-text-color) 2%, var(--card-background-color))","input-disabled-line-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-outlined-idle-border-color":"color-mix(in srgb, var(--primary-text-color) 38%, transparent)","input-outlined-hover-border-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-outlined-disabled-border-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-dropdown-icon-color":"var(--secondary-text-color)","mdc-text-field-fill-color":"var(--input-fill-color)","mdc-text-field-ink-color":"var(--input-ink-color)","mdc-text-field-label-ink-color":"var(--input-label-ink-color)","mdc-text-field-idle-line-color":"var(--input-idle-line-color)","mdc-text-field-hover-line-color":"var(--input-hover-line-color)","mdc-text-field-disabled-fill-color":"var(--input-disabled-fill-color)","mdc-text-field-disabled-ink-color":"var(--input-disabled-ink-color)","mdc-text-field-disabled-line-color":"var(--input-disabled-line-color)","mdc-text-field-outlined-idle-border-color":"var(--input-outlined-idle-border-color)","mdc-text-field-outlined-hover-border-color":"var(--input-outlined-hover-border-color)","mdc-text-field-outlined-disabled-border-color":"var(--input-outlined-disabled-border-color)","chip-background-color":"color-mix(in srgb, var(--primary-text-color) 15%, transparent)","label-badge-background-color":"var(--card-background-color)","label-badge-text-color":"var(--primary-text-color)","state-inactive-color":"var(--disabled-text-color)","ha-color-text-primary":"var(--primary-text-color)","ha-color-text-secondary":"var(--secondary-text-color)","ha-color-text-disabled":"var(--disabled-text-color)","ha-color-border-neutral-quiet":"var(--divider-color)","ha-color-fill-neutral-quiet-resting":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))"},rd={...Qm,"state-active-color":"var(--amber-color, #ffc107)","state-light-active-color":"var(--state-active-color, #ffc107)","slider-color":"var(--primary-color)","paper-slider-active-color":"var(--primary-color)","mdc-theme-surface":"var(--card-background-color)","mdc-theme-on-surface":"var(--primary-text-color)","mdc-theme-primary":"var(--primary-color)","mdc-theme-secondary":"var(--accent-color)","input-fill-color":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))","mdc-select-fill-color":"var(--input-fill-color)","outline-color":"var(--divider-color)","switch-checked-color":"var(--primary-color)","switch-checked-button-color":"var(--switch-checked-color, var(--primary-color))","switch-checked-track-color":"var(--switch-checked-color, var(--primary-color))","state-icon-color":"var(--paper-item-icon-color, #44739e)"},ef={"primary-color":"rgb-primary-color","accent-color":"rgb-accent-color","primary-text-color":"rgb-primary-text-color","secondary-text-color":"rgb-secondary-text-color","card-background-color":"rgb-card-background-color","primary-background-color":"rgb-primary-background-color"},tf=/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,nf=/^(rgba?|hsla?)\(\s*([^)]*)\)$/i,rf=/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)$/i;function od(e){return Math.max(0,Math.min(255,Math.round(e)))}function of(e){let n=tf.exec(e);if(!n)return null;let t=n[1];return t.length<=4&&(t=[...t].map(r=>r+r).join("")),[0,2,4].map(r=>parseInt(t.slice(r,r+2),16))}function sf(e){let n=e.endsWith("%"),t=Number(n?e.slice(0,-1):e);return Number.isFinite(t)?n?t/100*255:t:null}function af(e){let n=Number(e[0].replace(/deg$/i,"")),t=Number(e[1].replace(/%$/,""))/100,r=Number(e[2].replace(/%$/,""))/100;if(![n,t,r].every(Number.isFinite))return null;let o=a=>(a+n/30)%12,i=t*Math.min(r,1-r),s=a=>r-i*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[s(0),s(8),s(4)].map(a=>od(a*255))}function lf(e,n){let t=n.split(/[\s,/]+/).filter(Boolean).slice(0,3);if(t.length<3)return null;if(e.startsWith("hsl"))return af(t);let r=t.map(sf);return r.some(o=>o===null)?null:r.map(od)}function nd(e){let n=e.trim().replace(/\s*!important$/i,""),t=of(n);if(t)return t;let r=nf.exec(n);return r?lf(r[1].toLowerCase(),r[2]):null}function df(e,n){let t=rf.exec(e.trim());if(!t)return nd(e);let r=n[t[1]];return typeof r=="string"?nd(r):null}function id(e){let n={};for(let[t,r]of Object.entries(ef)){if(!(t in e)||r in e)continue;let o=df(e[t],e);o&&(n[r]=o.join(", "))}return n}var sd=new WeakMap;function ad(e,n){let t=JSON.stringify(n);sd.get(e)!==t&&(sd.set(e,t),ps(e),ht(e,n))}var cf=["lovelace-background","ha-card-border-radius","ha-card-box-shadow","ha-card-border-width","ha-card-border-color","ha-card-background","ha-card-backdrop-filter","primary-font-family","paper-font-body1_-_font-family","text-primary-color","rgb-primary-color","rgb-accent-color","rgb-primary-text-color","rgb-secondary-text-color","rgb-card-background-color","rgb-primary-background-color","light-primary-color","dark-primary-color","secondary-background-color","state-icon-color","paper-item-icon-color","disabled-text-color","divider-color","card-background-color","primary-background-color","primary-text-color","secondary-text-color","primary-color","accent-color","app-header-background-color","app-header-text-color","app-header-selection-bar-color","app-header-edit-background-color","app-header-edit-text-color","app-header-border-bottom","sidebar-background-color","sidebar-text-color","sidebar-icon-color","sidebar-selected-background-color","sidebar-selected-text-color","sidebar-selected-icon-color"];function ld(e,n,t){let r={};for(let o of t)r[o]="initial";return{...r,...rd,...an[n],...id(e),...e}}function dd(e,n,t,r){let o=e.querySelector(".pane.current"),i=e.querySelector(".pane.candidate"),s=ns(n),a=s?Z(s,r):{},d=t?Jt(t,r):a,c=new Set([...cf,..._r(s),..._r(t?.entry),...Object.keys(t?.vars??{}),...Object.keys(d)]);o instanceof HTMLElement&&ad(o,ld(a,r,c)),i instanceof HTMLElement&&ad(i,ld(d,r,c))}function cd(e,n){e.querySelectorAll(".cards > *").forEach(t=>{t.hass=n})}var ud=_`
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
`;var pd=_`
  ${oe} {
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
      height: ${we}px;
    }
    hats-lite-sheet .seg {
      display: flex;
    }
    hats-lite-sheet .seg button {
      flex: 1 1 0;
      min-height: ${we}px;
    }
    .actions .btn {
      min-height: ${we}px;
    }
  }
`,hd=_`
  .page {
    padding-left: max(24px, env(safe-area-inset-left, 0px));
    padding-right: max(24px, env(safe-area-inset-right, 0px));
  }
  ${oe} {
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
      min-height: ${we}px;
      padding: 6px 2px;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`,md=_`
  ${oe} {
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
      min-height: ${we}px;
    }
  }
`;var uf=_`
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
  ${oe} {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 5;
    }
  }
`,fd=[z,V,uf,ud,Al,Ml,pd];var pf=2,hf=98,mf=5,ff=10;function gd(e,n,t=!1,r=!1){if(r)return null;let o=t?ff:mf;switch(e){case"ArrowLeft":case"ArrowDown":return wn(n-o);case"ArrowRight":case"ArrowUp":return wn(n+o);case"Home":return pf;case"End":return hf;default:return null}}function bd(e){let n=e.currentTarget;typeof n.setPointerCapture=="function"&&n.setPointerCapture(e.pointerId)}function yd(e){let n=e.currentTarget;typeof n.releasePointerCapture=="function"&&n.releasePointerCapture(e.pointerId)}var Sn=class{constructor(n){this.host=n;this.items=[];this.requested=!1;this.failed=new Set;this.shown=!1}sync(n){this.requested||!$t(n)||(this.requested=!0,gl().then(t=>{this.items=t,t.length&&this.host.requestUpdate()}))}item(n){if(!$t(n))return;let t=bl(this.items,n?.fullName,n?.name);return t&&!this.failed.has(t)?t:void 0}active(n){return!!this.item(n)&&this.pick!==!1}choose(n){this.pick=n,this.host.requestUpdate()}fail(n){let t=this.item(n);t&&(this.failed.add(t),this.host.requestUpdate())}leftReal(n){let t=this.active(n),r=this.shown&&!t;return this.shown=t,r}};var vd=[".pane.current .cards",".pane.candidate .cards"],oo=class extends A{constructor(){super(...arguments);this.showActions=!0;this.dashboards=[];this.dashboardUrl=null;this.views=[];this.viewIndex=0;this.cards=[];this.notice=f.loading;this.frame="desktop";this.density="normal";this.split=50;this.error="";this.trying=!1;this.defaultCompare=!0;this.menu=Ja();this.defaultGenerated=!1;this.usingSample=!1;this.cache=new Map;this.dashboardsLoaded=!1;this.configToken=0;this.buildToken=0;this.dragging=!1;this.actions=new kn(this);this.guard=new Tn;this.real=new Sn(this)}static{this.properties={hass:{attribute:!1},candidate:{attribute:!1},mode:{attribute:!1},showActions:{type:Boolean,attribute:"show-actions"},defaultCompare:{attribute:!1},hideControls:{attribute:!1},install:{attribute:!1},uninstall:{attribute:!1},nav:{attribute:!1},dashboards:{state:!0},dashboardUrl:{state:!0},views:{state:!0},viewIndex:{state:!0},cards:{state:!0},notice:{state:!0},frame:{state:!0},density:{state:!0},split:{state:!0},error:{state:!0},trying:{state:!0},compare:{state:!0},menu:{state:!0},defaultGenerated:{state:!0},usingSample:{state:!0}}}static{this.styles=[fd,Ll,xl]}connectedCallback(){super.connectedCallback(),this.readOnlySource=void 0,this.hasUpdated&&this.attachHass(),this.guard.sync(this.renderRoot)}disconnectedCallback(){super.disconnectedCallback(),this.readOnly&&Da(this.readOnly),this.readOnly=void 0,this.guard.release()}willUpdate(t){t.has("mode")&&this.mode!==this.userMode&&(this.userMode=void 0)}updated(t){t.has("hass")&&this.hass&&!this.dashboardsLoaded&&this.loadDashboards(),this.attachHass(),this.applyVars(),this.real.sync(this.candidate),this.real.leftReal(this.candidate)&&!t.has("cards")&&this.buildCards(),this.dataset.scheme=this.hass?.themes?.darkMode?"dark":"light",t.has("cards")&&this.buildCards(),this.guard.sync(this.renderRoot)&&!t.has("cards")&&this.buildCards()}comparing(){return this.real.active(this.candidate)?!1:this.compare??Va(this.defaultCompare)}effectiveMode(){return this.mode??(this.hass?.themes?.darkMode?"dark":"light")}async loadDashboards(){let t=this.hass;if(!t)return;this.dashboardsLoaded=!0;try{this.dashboards=await ls(t)}catch{this.dashboards=[{url_path:null,title:f.defaultDashboard}]}let r=++this.configToken;this.notice=f.loading;let o=await Fa(this.dashboards,s=>this.entryFor(s),()=>r!==this.configToken);if(o.stale)return;if(o.hit){this.dashboardUrl=o.hit.urlPath,this.applyEntry(o.hit.entry,o.hit.urlPath);return}this.dashboardUrl=null;let i=ja(t.states);if(i&&!o.entries.every(s=>s.status==="error")){this.sample=i,this.useSample();return}o.entries[0]&&this.applyEntry(o.entries[0],null)}async entryFor(t){let r=qr(t),o=this.cache.get(r);if(o)return o;let i=this.hass,s=i?await Na(i,t):{status:"error",reason:""};return s.status!=="error"&&this.cache.set(r,s),t===null&&s.status==="notfound"&&(this.defaultGenerated=!0),s}async showDashboard(t){let r=++this.configToken;this.cache.has(qr(t))||(this.notice=f.loading);let i=await this.entryFor(t);r===this.configToken&&this.applyEntry(i,t)}applyEntry(t,r){let o=t.status!=="ok"||!kt(t.config);if(this.sample&&r===null&&o){this.useSample();return}this.usingSample=!1,this.viewIndex=0,this.config=t.status==="ok"?t.config:void 0,t.status==="ok"?this.selectView():this.setState({views:[],cards:[],notice:Ba(t)})}useSample(){this.usingSample=!0,this.config=this.sample,this.viewIndex=0,this.selectView()}selectView(){this.setState(Ua(this.config,this.viewIndex))}setState(t){this.views=t.views,this.cards=t.cards,this.notice=t.notice}async buildCards(){let t=++this.buildToken,[r]=await Promise.all([Qt(),Hl(this.hass)]),o=await Promise.all(vd.map(()=>this.buildPane(r)));t===this.buildToken&&(vd.forEach((i,s)=>{let a=this.renderRoot.querySelector(i);a instanceof HTMLElement&&a.replaceChildren(...o[s])}),this.attachHass(!0))}buildPane(t){return Promise.all(this.cards.map(r=>en(t,r)))}attachHass(t=!1){let r=this.hass;r&&(r!==this.readOnlySource&&(this.readOnlySource=r,this.readOnly=Oa(r,this),t=!0),t&&this.readOnly&&cd(this.renderRoot,this.readOnly))}applyVars(){dd(this.renderRoot,this.hass,this.candidate,this.effectiveMode())}onDashboard(t){let r=Number(t.target.value);this.dashboardUrl=this.dashboards[r]?.url_path??null,this.showDashboard(this.dashboardUrl)}onView(t){this.viewIndex=Number(t.target.value),this.selectView()}onKey(t){let r=gd(t.key,this.split,t.shiftKey,t.altKey||t.ctrlKey||t.metaKey);r!==null&&(t.preventDefault(),this.split=r)}onPointerDown(t){bd(t),this.dragging=!0}onPointerMove(t){if(!this.dragging)return;let r=this.renderRoot.querySelector(".stage");r instanceof HTMLElement&&(this.split=Ia(t.clientX,r.getBoundingClientRect()))}onPointerUp(t){this.dragging=!1,yd(t)}setMode(t){this.userMode=t,this.mode=t;let r={detail:{mode:t},bubbles:!0,composed:!0};this.dispatchEvent(new CustomEvent(Ki,r))}renderStageView(){let t=this.candidate;return Dl({frame:this.frame,density:this.density,split:this.split,comparing:this.comparing()||!t,candidateName:t?t.name:f.noCandidate,note:Pl(t,this.effectiveMode()),title:Ka(this.dashboards,this.dashboardUrl),menu:this.menu,modNote:$t(t)},{onKey:r=>this.onKey(r),onPointerDown:r=>this.onPointerDown(r),onPointerMove:r=>this.onPointerMove(r),onPointerUp:r=>this.onPointerUp(r)})}renderBody(){let t=this.real.active(this.candidate)&&this.real.item(this.candidate);return t?wl(t,this.effectiveMode(),()=>this.real.fail(this.candidate)):this.notice?l`<p class="notice" role="status">${this.notice}</p>`:this.renderStageView()}render(){let t=this.views.length>0&&kt(this.config);return l`
      ${Ol(this.nav?{...this.nav,locked:this.trying}:null,r=>this.actions.moveBy(r),l`
          ${Rl({dashboards:this.dashboards,dashboardUrl:this.dashboardUrl,generatedDefault:this.defaultGenerated,views:this.views,viewIndex:this.viewIndex,showViews:t,frame:this.frame,density:this.density,mode:this.effectiveMode(),compare:this.comparing(),canCompare:!!this.candidate,hide:this.hideControls,menu:this.menu,realAvailable:!!this.real.item(this.candidate),real:this.real.active(this.candidate)},{onDashboard:r=>this.onDashboard(r),onView:r=>this.onView(r),onFrame:r=>{this.frame=r},onDensity:r=>{this.density=r},onMode:r=>this.setMode(r),onMenu:r=>{this.menu=r,Qa(r)},onLook:r=>this.real.choose(r),onCompare:()=>{this.candidate&&(this.compare=!this.comparing(),Wa(this.compare,this.defaultCompare))}})}
          ${this.usingSample?l`<p class="notice" role="status">${f.sampleNote}</p>`:u}
          ${this.renderBody()}
        `)}
      ${this.actions.render()}
    `}};customElements.get("hats-lite-preview")||customElements.define("hats-lite-preview",oo);function De(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16))}function io(e){return Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")}function I(e){return`#${io(e[0])}${io(e[1])}${io(e[2])}`}function Y(e,n,t){return[0,1,2].map(r=>Math.round(e[r]*t+n[r]*(1-t)))}function Mn(e,n,t){return[0,1,2].map(r=>e[r]*t+n[r]*(1-t))}function so(e){let n=e/255;return n<=.03928?n/12.92:((n+.055)/1.055)**2.4}function wd(e){return .2126*so(e[0])+.7152*so(e[1])+.0722*so(e[2])}function xe(e,n){let[t,r]=[wd(e),wd(n)].sort((o,i)=>i-o);return(t+.05)/(r+.05)}var W=[255,255,255],Xe=[0,0,0];function ao(e){return xe(W,e)>=xe(Xe,e)?W:Xe}function An(e,n){return Math.min(...n.map(t=>xe(e,t)))}function ke(e,n,t){if(An(e,n)>=t)return e;let r=An(W,n)>=An(Xe,n)?W:Xe;for(let o=1;o<=20;o+=1){let i=Y(r,e,o/20);if(An(i,n)>=t)return i}return r}function Cn(e,n){return`rgba(${e[0]},${e[1]},${e[2]},${Number(n.toFixed(4))})`}var gf=[15,17,21],bf=[27,30,36],yf=[240,242,245],vf=[170,176,186],wf=[20,23,27],xf=[84,91,101],kf=7.2,xd=7.1,$f=4.55,lo=3.05,Ef=4.55;function _f(e){return Number.isFinite(e)?Math.min(60,Math.max(2,e)):2}function Tf(e,n,t){let r=_f(n)/100;if(e==="light")return Math.min(1,.4+r);let o=r;for(;o>.02&&xe(W,Mn(W,t,o))<kf;)o=Math.max(.02,Number((o-.005).toFixed(4)));return o}var kd=/^#[0-9a-fA-F]{6}$/,Ye=2,co=60;function Mt(e,n){if(n==="light"||!kd.test(e))return co;let t=Ct(e,"dark",co).alpha;return Math.min(co,Math.max(Ye,Math.floor(t*100+1e-9)))}function Pn(e,n){let t=Math.min(100,Math.max(0,Number.isFinite(e)?e:0));return Math.round(Ye+t/100*(n-Ye))}function $d(e,n){if(n<=Ye)return 0;let t=(e-Ye)/(n-Ye)*100;return Math.min(100,Math.max(0,Math.round(t)))}function Ed(e,n,t){return kd.test(e)?Math.round(Ct(e,n,t).alpha*100):0}function Ct(e,n,t){let r=De(e),o=n==="dark",i=o?Y(r,gf,.09):Y(r,W,.055),s=o?Y(r,bf,.1):Y(r,W,.1),a=o?Y(r,Y(W,i,.05),.05):Y(r,W,.025),d=Number(Tf(n,t,i).toFixed(4));return{background:i,secondary:s,card:a,glass:Mn(W,i,d),alpha:d}}function _d(e,n,t,r=20){let o=De(e),i=De(n),s=t==="dark",{background:a,secondary:d,card:c,glass:m,alpha:p}=Ct(e,t,r),g=[a,d,c,m],b=ke(Y(o,s?yf:wf,.06),g,xd),E=ke(Y(o,s?vf:xf,.1),g,$f),M=ao(o),S=ke(i,g,lo),B=ke(o,g,lo),L=s?Y(o,[10,12,15],.07):Y(o,W,.075),X=Mn(o,L,.18),U=ke(o,[L,X],Ef);return{"primary-color":I(o),"accent-color":I(i),"primary-background-color":I(a),"secondary-background-color":I(d),"card-background-color":I(c),"ha-card-background":Cn(W,p),"primary-text-color":I(b),"secondary-text-color":I(E),"divider-color":Cn(s?W:Xe,.12),"app-header-background-color":I(o),"app-header-text-color":I(M),"text-primary-color":I(M),"paper-tabs-selection-bar-color":I(ke(i,[o],lo)),"switch-checked-color":I(S),"switch-checked-button-color":I(ao(S)),"paper-slider-active-color":I(B),"state-icon-color":I(S),"sidebar-background-color":I(L),"sidebar-text-color":I(ke(b,[L],xd)),"sidebar-selected-background-color":Cn(o,.18),"sidebar-selected-text-color":I(U),"sidebar-selected-icon-color":I(U)}}var uo=/^#[0-9a-fA-F]{6}$/,Sd=/^\/local\/hats_lite\/[0-9a-fA-F]{32}\.(png|jpg|webp|gif)$/,Sf=/^https:\/\/[^\s'"`\\(){}<>;]+$/,Af=/\.\.|!important/i,Mf=2e3;function Ad(e){return typeof e=="string"&&Sd.test(e)}function Rn(e,n,t){return typeof e!="number"||!Number.isFinite(e)?n:Math.min(t,Math.max(n,e))}function Td(e){if(typeof e!="string"||!uo.test(e))throw new Error("Invalid color");return e}function Cf(e,n){if(typeof e!="string"||Af.test(e))throw new Error("Invalid background");if(n==="url"&&e.length>Mf)throw new Error("Background too long");if(!(n==="url"?Sf.test(e):Sd.test(e)))throw new Error("Invalid background");return e}function po(e){let n=Td(e.main),t=Td(e.accent),r=Rn(e.radius,0,48),o=Rn(e.blur,0,40),i=Rn(e.tint,2,60),s={..._d(n,t,e.mode,i),"primary-color":n,"accent-color":t,"ha-card-border-radius":`${r}px`,"ha-card-backdrop-filter":`blur(${o}px)`},a=e.background;return a&&a.kind!=="none"&&(s["lovelace-background"]=`center / cover no-repeat fixed url('${Cf(a.value,a.kind)}')`),s}var Pf=3;function Md(e){if(!uo.test(e.main)||!uo.test(e.accent))return[];let n=De(e.main),t=De(e.accent),{glass:r}=Ct(e.main,e.mode,Rn(e.tint,2,60));return[{id:"main-card",ratio:xe(n,r)},{id:"accent-card",ratio:xe(t,r)}].filter(i=>i.ratio<Pf).map(i=>({id:i.id,ratio:Number(i.ratio.toFixed(2))}))}var Rf=/^[A-Za-z0-9_-]{1,80}$/,Df=new Set(["__proto__","constructor","prototype","tostring","hasownproperty","valueof","__definegetter__","__definesetter__","__lookupgetter__","__lookupsetter__","isprototypeof","propertyisenumerable","tolocalestring"]),Of=["javascript:","vbscript:","@import","expression(","behavior:","-moz-binding","image-set(","imageset(","src(","<","&#"],If=/&[a-z#]/i,Lf=/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/,Hf=/\/\*[\s\S]*?\*\//g,Cd=/[\p{Z}\p{C}\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\u3164\u1160\u180e\u00ad\ufe00-\ufe0f]/gu,Nf=/!\s*important\s*$/i,Ff="lovelace-background";function Pd(e){let n=e.toLowerCase();return n.startsWith("card-mod-")||n.startsWith("uix-")}function jf(e,n){let t=e;for(let r=0;r<4;r+=1){let o=t.replace(Nf,"").trimEnd(),i=Pd(n)?o:o.replace(/;+\s*$/,"").trimEnd();if(i===t)break;t=i}return t}function Bf(e){return e.replace(Cd,"").normalize("NFKC").replace(Hf,"").replace(Cd,"").toLowerCase()}function Rd(e,n){if(!Rf.test(e)||Df.has(e.toLowerCase()))return"skip";if(e===Ff)return"background";let t=jf(n,e);if(!t||n.includes("\0")||Lf.test(n)||t.includes("\\"))return"skip";let r=Bf(t);return Of.some(o=>r.includes(o))||If.test(r)?"skip":r.includes("url(")?"background":!Pd(e)&&/[{};]/.test(r)?"skip":"ok"}var Ze={main:"#03a9f4",accent:"#ff9800",radius:12,blur:10,tint:30,mode:"dark"},Uf=["dark","light"],Kf=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,zf=/^#([0-9a-f]{6})([0-9a-f]{2})?$/i,Vf=/^rgba?\(\s*([^)]*?)\s*\)$/i,Wf=/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i,qf=/blur\(\s*(\d*\.?\d+)\s*(px|rem|em)?\s*\)/i,Dd=16,Gf=300,Xf=4096;function Oe(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Pt(e,n,t){return Math.min(t,Math.max(n,e))}function Yf(e){let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n);return Number.isFinite(t)?Pt(Math.round(t),0,255):null}function Zf(e){if(e===void 0)return;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?Pt(t,0,1):null}function ho(e){if(typeof e!="string")return null;let n=e.trim(),t=Kf.exec(n);if(t)return{hex:`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toLowerCase(),alpha:void 0};let r=zf.exec(n);if(r)return{hex:`#${r[1]}`.toLowerCase(),alpha:r[2]?parseInt(r[2],16)/255:void 0};let o=Vf.exec(n);if(!o)return null;let i=o[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);if(i.length<3||i.length>4)return null;let s=i.slice(0,3).map(Yf),a=Zf(i[3]);return s.some(d=>d===null)||a===null?null:{hex:I(s),alpha:a}}function Jf(e){return typeof e=="string"?e:typeof e=="number"&&Number.isFinite(e)?String(e):null}function Qf(e,n){if(!Oe(e)||!Oe(e.modes))return{};let t=e.modes[n];return Oe(t)?t:{}}function eg(e,n){let t=Jf(n),r=t===null||t.length>Xf?"skip":Rd(e,t);return{text:t,verdict:r}}function Dn(e,n){let t={},r=new Map;if(!Oe(e))return{vars:t,skipped:0,skippedKeys:[],wallpaper:0,wallpaperKeys:[]};for(let s of[e,Qf(e,n)])for(let[a,d]of Object.entries(s)){if(a==="modes")continue;let{text:c,verdict:m}=eg(a,d);r.set(a,m),m==="ok"?t[a]=c:delete t[a]}let o=[...r].filter(([,s])=>s==="skip").map(([s])=>s),i=[...r].filter(([,s])=>s==="background").map(([s])=>s);return{vars:t,skipped:o.length,skippedKeys:o,wallpaper:i.length,wallpaperKeys:i}}function Od(e,n){return Dn(e,n).vars}function mo(e){return!Oe(e)||!Oe(e.modes)?[]:Uf.filter(n=>Oe(e.modes[n]))}function tg(e){let n=e===void 0?null:Wf.exec(e.trim());if(!n)return null;let t=(n[2]??"px").toLowerCase();return parseFloat(n[1])*(t==="px"?1:Dd)}function ng(e){for(let n of["ha-card-backdrop-filter","backdrop-filter"]){let t=qf.exec(e[n]??"");if(t)return parseFloat(t[1])*((t[2]??"px").toLowerCase()==="px"?1:Dd)}return null}function rg(e){for(let n of["ha-card-background","card-background-color"]){let t=ho(e[n])?.alpha;if(t!==void 0)return t}return null}function og(e,n){let t=mo(e);return t.length===1?t[0]:n}function ig(e,n,t){let r=n==="light"?(e-.4)*100:e*100,o=Pt(Math.round(r),2,60);return $d(o,Mt(t,n))}function Id(e,n,t){let r=og(e,n),o=Od(e,r),i=ho(o["primary-color"])?.hex??t.main,s=ho(o["accent-color"])?.hex??t.accent,a=tg(o["ha-card-border-radius"]),d=ng(o),c=rg(o);return{main:i,accent:s,mode:r,radius:a===null?t.radius:Math.round(Pt(a,0,48)),blur:d===null?t.blur:Math.round(Pt(d,0,40)),tint:c===null?t.tint:ig(c,r,i)}}function sg(e,n,t,r){let o=Od(e,n);for(let[i,s]of Object.entries(r))t[i]!==s&&(o[i]=s);return o}function ag(e,n){return{main:e.main,accent:e.accent,radius:e.radius,blur:e.blur,tint:Pn(e.tint,Mt(e.main,n)),background:{kind:"none"},mode:n}}function Ld(e,n,t){let r=po(t);return e?sg(e,t.mode,po(ag(n,t.mode)),r):r}function On(e){return Object.keys(e).length>Gf}var In={button:"Advanced",withDraft:"Open the full HATS designer. Your draft values travel in the address fragment; HATS must treat them as untrusted input.",plain:"Open the full HATS designer."};var lg=700,dg=2048,cg=200,Hd=/^#[0-9a-fA-F]{6}$/,ug={radius:[0,48],blur:[0,40],tint:[0,100]},pg=3e4,Ln={available:!1,path:null},Nd=new WeakMap;function Fd(e){return typeof e!="string"||e.length===0||e.length>cg||!e.startsWith("/")||e.startsWith("//")||e.includes("\\")||e.includes("#")||e.includes("?")?!1:/^[\x21-\x7e]+$/.test(e)}function fo(e,n){let[t,r]=ug[n];return typeof e=="number"&&Number.isFinite(e)&&e>=t&&e<=r}function jd(e){let n=e;return!n||typeof n.main!="string"||typeof n.accent!="string"||!Hd.test(n.main)||!Hd.test(n.accent)||!fo(n.radius,"radius")||!fo(n.blur,"blur")||!fo(n.tint,"tint")?null:{main:n.main.toLowerCase(),accent:n.accent.toLowerCase(),radius:Math.round(n.radius),blur:Math.round(n.blur),tint:Math.round(n.tint)}}function hg(e){let n=jd(e);if(!n)return null;let t=JSON.stringify(n),r=btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");return`#lite=${r}`.length>dg?null:`#lite=${r}`}function mg(e,n){return Fd(e)?e+(hg(n)??""):null}function fg(e,n,t=window){let r=mg(e,n);return r?(t.innerWidth<lg?t.location.assign(r):t.open(r,"_blank","noopener"),!0):!1}function gg(e,n){return Object.keys(e).every(r=>e[r]===n[r])?null:e}function Bd(e){let n={main:e.main,accent:e.accent,radius:e.radius,blur:e.glassBlur,tint:e.tint};return gg(n,e.baseControls)}function bg(e){return typeof e=="object"&&e!==null&&e.code==="unknown_command"}function yg(e){let n=Nd.get(e.connection);if(n&&(n.failedAt===null||Date.now()-n.failedAt<pg))return n.pending;let t={pending:Promise.resolve(Ln),failedAt:null};return t.pending=P(e,{type:"hats_lite/advanced_info"}).then(r=>r&&r.available===!0&&Fd(r.path)?{available:!0,path:r.path}:(t.failedAt=Date.now(),Ln),r=>(bg(r)||(t.failedAt=Date.now()),Ln)),Nd.set(e.connection,t),t.pending}var go=class extends A{constructor(){super(...arguments);this.info=Ln;this.onFocus=()=>{this.info.available||this.ask()}}static{this.properties={hass:{attribute:!1},draft:{attribute:!1},info:{state:!0}}}static{this.styles=_`
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
  `}connectedCallback(){super.connectedCallback(),window.addEventListener("focus",this.onFocus)}disconnectedCallback(){window.removeEventListener("focus",this.onFocus),super.disconnectedCallback()}ask(){let t=this.hass,r=t?.connection;!t||!r||(this.asked=r,yg(t).then(o=>{this.asked===r&&(this.info=o)}))}willUpdate(){this.hass?.connection&&this.asked!==this.hass.connection&&this.ask()}render(){let t=this.info.available?this.info.path:null;if(!t)return u;let r=jd(this.draft)!==null;return l`<button type="button" data-action="advanced"
      title=${r?In.withDraft:In.plain}
      @click=${()=>fg(t,this.draft)}>${In.button}</button>`}};customElements.get("hats-lite-advanced")||customElements.define("hats-lite-advanced",go);var y={baseLabel:"Start from",baseDefault:"Default",baseTooLarge:"This theme has too many variables (300 at most, counting the base plus the Designer keys). Pick another base.",baseMissing:"The base theme is no longer installed. The Designer went back to Default.",baseSkipped:"{count} variables of the base theme were left out because they cannot be saved safely.",wallpaperOne:"1 wallpaper entry was removed.",wallpaperMany:"{count} wallpaper entries were removed.",valueRejected:"Some values were rejected as unsafe. Pick another base or change the values.",colors:"Colors",glance:"At a glance",onDashboard:"On your dashboard",shape:"Shape and glass",draftName:"Designer draft",mainColor:"Main color",accentColor:"Accent color",radius:"Corner radius",blur:"Glass blur",tint:"Card tint",mode:"Mode",modeDark:"Dark",modeLight:"Light",background:"Background",backgroundNone:"None",uploadLabel:"Upload a background image",uploadHint:"PNG, JPEG, WebP or GIF, up to 8 MiB",uploading:"Uploading...",uploadAdminOnly:"Only administrators can upload backgrounds.",uploadTooLarge:"Pick an image up to 8 MiB.",uploadType:"Pick a PNG, JPEG, WebP or GIF image.",uploadFailed:"Upload failed. The previous background is kept.",invalidColor:"Pick a valid color",invalidBackground:"This background is not allowed",backgroundTooLong:"This background address is too long (2000 characters at most).",restartReminder:"This theme uses an uploaded background. Backgrounds need a Home Assistant restart before they are served.",invalidInput:"Some values are not valid",saveTitle:"Save as theme",saveAdminOnly:"Only administrators can save themes.",nameLabel:"Theme name",nameInvalid:"Use 1 to 60 letters, digits, spaces, hyphens or underscores, starting with a letter or digit",saveButton:"Save as theme",saving:"Saving...",saved:"Theme saved",saveFailed:"Could not save the theme.",nameReserved:"This name is reserved. Pick another name.",nameExists:"A theme with this name already exists. Pick another name.",formatInvalid:"The theme could not be written in a valid format.",overwrote:"Saved. An existing theme with this name was replaced.",needsRestart:"Background uploaded. Backgrounds need a Home Assistant restart before they are served.",warnMainCard:"The main color is hard to see on cards (contrast {ratio}:1, 3:1 recommended).",warnAccentCard:"The accent color is hard to see on cards (contrast {ratio}:1, 3:1 recommended)."};function Ud(e){let n=e?.themes?.themes;return!n||typeof n!="object"?[]:Object.keys(n).sort((t,r)=>t.localeCompare(r))}function Kd(e,n,t){return l`
    <label class="field base">
      <span>${y.baseLabel}</span>
      <select class="pill" data-field="base" @change=${t}>
        <option value="" .selected=${n===""}>${y.baseDefault}</option>
        ${e.map(r=>l`<option value=${r} .selected=${n===r}>${r}</option>`)}
      </select>
    </label>
  `}function bo(e,n){if(!n)return;let t=e?.themes?.themes?.[n];if(t==null)throw new Error("Base theme missing");return t}function Hn(e,n){return n!==""&&!e?.themes?.themes?.[n]}function yo(e){let n=mo(e);return n.length?n:["dark","light"]}function zd(e,n,t){if(!n||Hn(e,n))return 0;let r=e?.themes?.themes?.[n],o=new Set;for(let i of yo(r))Dn(r,i).skippedKeys.forEach(s=>o.add(s));return o.size}function Vd(e,n){if(!n||Hn(e,n))return 0;let t=e?.themes?.themes?.[n],r=new Set;for(let o of yo(t))Dn(t,o).wallpaperKeys.forEach(i=>r.add(i));return r.size}function Wd(e,n){let t=e?yo(e):["dark","light"],r={};for(let o of t){let i=n(o);if(On(i))throw new Error("Too many variables");r[o]=i}return{variables:r[t[0]],modes:r}}function qd(e,n,t){let r=n?e?.themes?.themes?.[n]:void 0;return r?{base:n,controls:Id(r,t,Ze)}:{base:"",controls:Ze}}function Gd(e,n,t,r,o=0){return l`
    ${e?l`<p class="hint" data-notice="base">${e}</p>`:u}
    ${n>0?l`<p class="hint" data-notice="skipped">${y.baseSkipped.replace("{count}",String(n))}</p>`:u}
    ${o>0?l`<p class="hint" data-notice="wallpaper">${o===1?y.wallpaperOne:y.wallpaperMany.replace("{count}",String(o))}</p>`:u}
    ${t===""&&r?l`<p class="error" role="alert">${r}</p>`:u}
  `}function Xd(e,n){return l`
    <section class="group">
      <h3>${y.mode}</h3>
      <div class="seg" role="group" aria-label=${y.mode}>
        ${["dark","light"].map(t=>l`<button type="button" data-field="mode" data-mode=${t}
            aria-pressed=${String(e===t)}
            @click=${()=>n(t)}>${t==="dark"?y.modeDark:y.modeLight}</button>`)}
      </div>
    </section>
  `}function vo(e){return l`
    <label class="range">
      <span class="range-head">
        <span>${e.label}</span>
        <span class="range-value" data-readout=${e.field}>${e.readout}</span>
      </span>
      <input type="range" min=${e.min} max=${e.max} step="1" data-field=${e.field}
        .value=${String(e.value)}
        @input=${e.onInput} />
    </label>
  `}function Yd(e,n,t,r){return l`
    <label class="color-row">
      <input type="color" data-field=${e} .value=${t} @input=${r} />
      <span class="color-text">
        <span>${n}</span>
        <span class="hex" data-readout=${e}>${t}</span>
      </span>
    </label>
  `}function Zd(e){return l`
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
  `}function Jd(e){return l`
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
  `}var Qd=[z,V,_`
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
`,md];function wo(e,n){if(e&&typeof e=="object"&&"message"in e){let t=e.message;if(typeof t=="string"&&t.length>0)return t}return n}function ec(e){return e.size>8388608?y.uploadTooLarge:zi.includes(e.type)?null:y.uploadType}function wg(e,n){let t={method:"POST",body:n};if(typeof e.fetchWithAuth=="function")return e.fetchWithAuth(vr,t);let r=e.auth?.data?.access_token??"";return fetch(vr,{...t,headers:{Authorization:`Bearer ${r}`}})}async function tc(e,n){let t=new FormData;t.append("file",n);let r,o;try{r=await wg(e,t),o=await r.json().catch(()=>({}))}catch{return{error:y.uploadFailed}}if(!r.ok)return{error:wo(o,y.uploadFailed)};let{url:i,needs_restart:s}=o;return Ad(i)?{url:i,needsRestart:s===!0}:{error:y.uploadFailed}}var xg=/^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/,kg={"main-card":y.warnMainCard,"accent-card":y.warnAccentCard};function nc(e){return e.toLowerCase()==="default"?y.nameReserved:xg.test(e)?null:y.nameInvalid}function rc(e){let n=e&&typeof e=="object"?e.code:void 0;return n==="name_exists"?y.nameExists:n==="reserved_name"?y.nameReserved:n==="invalid_format"?y.formatInvalid:n==="invalid_value"?y.valueRejected:wo(e,y.saveFailed)}function oc(e){return e&&typeof e=="object"&&e.overwrote===!0?y.overwrote:y.saved}function ic(e){return Md(e).map(n=>kg[n.id].replace("{ratio}",n.ratio.toFixed(1)))}function xo(e){let n=e instanceof Error?e.message:"";return n==="Invalid color"?{field:"color",message:y.invalidColor}:n==="Invalid background"?{field:"background",message:y.invalidBackground}:n==="Background too long"?{field:"background",message:y.backgroundTooLong}:n==="Base theme missing"?{field:"",message:y.baseMissing}:n==="Too many variables"?{field:"",message:y.baseTooLarge}:{field:"color",message:y.invalidInput}}function sc(e,n){return n.kind==="upload"?`${e} ${y.restartReminder}`:e}var $g=[],Eg=["tablet","mode"],_g=["base","main","accent","radius","glassBlur","tint","mode","background"],ac={radius:{label:y.radius,min:0,max:48,unit:"px"},glassBlur:{label:y.blur,min:0,max:40,unit:"px"}},ko=class extends A{constructor(){super(...arguments);this.dragOver=!1;this.base="";this.baseControls=Ze;this.main="#03a9f4";this.accent="#ff9800";this.radius=12;this.glassBlur=10;this.tint=30;this.mode="dark";this.background={kind:"none"};this.errorField="";this.errorMessage="";this.themeName="";this.uploading=!1;this.uploadError="";this.uploadNotice="";this.saving=!1;this.saveMessage="";this.saveFailed=!1;this.baseNotice=""}static{this.properties={hass:{attribute:!1},base:{state:!0},main:{state:!0},accent:{state:!0},radius:{state:!0},glassBlur:{state:!0},tint:{state:!0},mode:{state:!0},background:{state:!0},candidate:{state:!0},errorField:{state:!0},errorMessage:{state:!0},themeName:{state:!0},uploading:{state:!0},uploadError:{state:!0},uploadNotice:{state:!0},saving:{state:!0},saveMessage:{state:!0},saveFailed:{state:!0},baseNotice:{state:!0},dragOver:{state:!0}}}static{this.styles=Qd}willUpdate(t){if(Hn(this.hass,this.base)){this.base="",this.baseControls=Ze,this.baseNotice=y.baseMissing,this.rebuild();return}(!this.candidate||_g.some(r=>t.has(r)))&&this.rebuild()}render(){let t=this.hass?.user?.is_admin===!0;return l`
      <div class="layout">
        <div class="controls">
          <hats-lite-advanced .hass=${this.hass} .draft=${Bd(this)}></hats-lite-advanced>
          ${Kd(Ud(this.hass),this.base,r=>this.onBase(r))}
          ${Gd(this.baseNotice,zd(this.hass,this.base,this.mode),this.errorField,this.errorMessage,Vd(this.hass,this.base))}
          <section class="group">
            <h3>${y.colors}</h3>
            ${this.renderColor("main",y.mainColor)}
            ${this.renderColor("accent",y.accentColor)}
            ${this.errorField==="color"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${this.warnings().map(r=>l`<p class="hint" data-warning>${r}</p>`)}
          </section>
          <section class="group">
            <h3>${y.shape}</h3>
            ${Object.keys(ac).map(r=>this.renderSlider(r))}
            ${this.renderTint()}
          </section>
          <section class="group">
            <h3>${y.background}</h3>
            <div class="choices">
              <button type="button" class="chip-btn" data-action="background-none"
                aria-pressed=${String(this.background.kind==="none")}
                @click=${()=>this.setBackground({kind:"none"})}>${y.backgroundNone}</button>
              ${$g.map(r=>l`<button type="button" class="chip-btn"
                  aria-pressed=${String(this.background.kind==="preset"&&this.background.value===r.value)}
                  @click=${()=>this.setBackground({kind:"preset",value:r.value})}>${r.label}</button>`)}
            </div>
            ${this.errorField==="background"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${t?this.renderUpload():l`<p class="hint">${y.uploadAdminOnly}</p>`}
          </section>
          ${Xd(this.mode,r=>this.setMode(r))}
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
            .hideControls=${Eg}
            .defaultCompare=${!1}
            @hats-lite-mode-change=${r=>this.onPreviewMode(r)}
          ></hats-lite-preview>
        </div>
      </div>
    `}renderColor(t,r){return Yd(t,r,this[t],o=>this.setText(t,o))}renderSlider(t){let r=ac[t];return vo({label:r.label,readout:`${this[t]}${r.unit}`,field:t,min:r.min,max:r.max,value:this[t],onInput:o=>this.setNumber(t,o)})}renderTint(){let t=Ed(this.main,this.mode,this.tintValue(this.mode));return vo({label:y.tint,readout:`${t}%`,field:"tint",min:0,max:100,value:this.tint,onInput:r=>this.setTint(r)})}tintValue(t){return Pn(this.tint,Mt(this.main,t))}setTint(t){this.tint=Number(t.target.value)}renderUpload(){return Zd({over:this.dragOver,uploading:this.uploading,error:this.uploadError,notice:this.uploadNotice,onPick:()=>this.fileInput()?.click(),onDragOver:t=>this.onDragOver(t),onDragLeave:()=>{this.dragOver=!1},onDrop:t=>this.onDrop(t),onFile:t=>this.onFile(t)})}renderSave(){return Jd({name:this.themeName,saving:this.saving,message:this.saveMessage,failed:this.saveFailed,onName:t=>this.setName(t),onSave:()=>this.onSave()})}designerInput(t){return{main:this.main,accent:this.accent,radius:this.radius,blur:this.glassBlur,tint:this.tintValue(t),background:this.background,mode:t}}finalVars(t){let r=bo(this.hass,this.base),o=Ld(r,this.baseControls,this.designerInput(t));if(On(o))throw new Error("Too many variables");return o}warnings(){return ic(this.designerInput(this.mode))}rebuild(){try{let t=this.finalVars(this.mode);this.candidate={name:y.draftName,vars:t,installed:!1,canApply:!1},this.errorField="",this.errorMessage=""}catch(t){let r=xo(t);this.errorField=r.field,this.errorMessage=r.message}}buildModes(){try{return Wd(bo(this.hass,this.base),t=>this.finalVars(t))}catch(t){this.saveFailed=!0,this.saveMessage=xo(t).message;return}}onBase(t){let r=t.target.value,o=qd(this.hass,r,this.mode),i=o.controls;this.base=o.base,this.baseNotice="",this.baseControls=i,this.main=i.main,this.accent=i.accent,this.radius=i.radius,this.glassBlur=i.blur,this.tint=i.tint,this.mode=i.mode,this.background={kind:"none"},this.uploadNotice="",this.saveMessage=""}setText(t,r){this[t]=r.target.value}setNumber(t,r){this[t]=Number(r.target.value)}onPreviewMode(t){let r=t.detail?.mode;(r==="dark"||r==="light")&&(this.mode=r)}setMode(t){this.mode=t}fileInput(){return this.renderRoot.querySelector('input[type="file"]')}onDragOver(t){t.preventDefault(),this.dragOver=!0}onDrop(t){t.preventDefault(),this.dragOver=!1;let r=t.dataTransfer?.files?.[0];r&&this.handleFile(r,null)}setBackground(t){this.background=t,this.uploadNotice=""}setName(t){this.themeName=t.target.value}async onFile(t){let r=t.target,o=r.files?.[0];o&&await this.handleFile(o,r)}async handleFile(t,r){let o=this.hass;if(!o||this.uploading)return;let i=ec(t);if(i){this.uploadError=i,r&&(r.value="");return}this.uploading=!0,this.uploadError="",this.uploadNotice="";try{let s=await tc(o,t);"error"in s?this.uploadError=s.error:(this.background={kind:"upload",value:s.url},s.needsRestart&&(this.uploadNotice=y.needsRestart))}finally{this.uploading=!1,r&&(r.value="")}}async onSave(){let t=this.hass;if(!t)return;let r=this.themeName.trim(),o=nc(r);if(o){this.saveFailed=!0,this.saveMessage=o;return}let i=this.buildModes();if(i){this.saving=!0,this.saveMessage="";try{let s=await P(t,{type:"hats_lite/save_theme",name:r,variables:i.variables,modes:i.modes});this.dispatchEvent(new CustomEvent(Ui,{bubbles:!0,composed:!0,detail:{name:r}})),this.saveFailed=!1,this.saveMessage=sc(oc(s),this.background)}catch(s){this.saveFailed=!0,this.saveMessage=rc(s)}finally{this.saving=!1}}}};customElements.get("hats-lite-designer")||customElements.define("hats-lite-designer",ko);function q(e){let n=e&&typeof e=="object"?e.code:void 0;return typeof n=="string"?n:"unknown"}var ce="hats_lite/";async function $o(e){let n=await P(e,{type:`${ce}people`});return Array.isArray(n?.people)?n.people:[]}function lc(e,n){let t={type:`${ce}assign`,user_id:n.user_id,theme:n.theme};return n.dark!==void 0&&(t.dark=n.dark),n.ends!==void 0&&n.ends!==null&&(t.ends=n.ends),P(e,t)}function dc(e,n){return P(e,{type:`${ce}unassign`,override_id:n})}function cc(e,n){return P(e,{type:`${ce}set_opt_out`,opt_out:n})}function uc(e,n,t){return P(e,{type:`${ce}set_birthday`,user_id:n,...t})}function pc(e,n){return P(e,{type:`${ce}set_birthday`,user_id:n,clear:!0})}async function hc(e){let n=await P(e,{type:`${ce}holidays_list`});return Array.isArray(n?.holidays)?n.holidays:[]}async function mc(e,n){let t=await P(e,{type:`${ce}holidays_set`,holidays:n});return Array.isArray(t?.holidays)?t.holidays:n}function fc(e,n){return P(e,{type:`${ce}assigners_set`,user_ids:n})}async function gc(e){try{return await $o(e),!0}catch(n){return q(n)!=="unknown_command"}}function Nn(){window.hatsLite?.refreshEffective?.()}function Fn(e){return{dark:void 0,primaryColor:void 0,accentColor:void 0,...e}}var Je=[31,29,31,30,31,30,31,31,30,31,30,31];function Bn(e,n){return!Number.isInteger(e)||!Number.isInteger(n)||e<1||e>12?!1:n>=1&&n<=Je[e-1]}function Eo(e){let n=e.name.trim();return n.length===0||n.length>60?"name":!Bn(e.month_start,e.day_start)||!Bn(e.month_end,e.day_end)?"date":e.theme.length===0?"theme":null}function Tg(e,n){if(n)try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,year:"numeric",month:"numeric",day:"numeric"}).formatToParts(e),r=o=>Number(t.find(i=>i.type===o)?.value);return[r("year"),r("month"),r("day")]}catch{return[e.getFullYear(),e.getMonth()+1,e.getDate()]}return[e.getFullYear(),e.getMonth()+1,e.getDate()]}function Sg(e){return e.month_start*32+e.day_start>e.month_end*32+e.day_end}function bc(e,n=new Date,t){let[r,o,i]=Tg(n,t),s=r*1e4+o*100+i,a=Sg(e)?1:0;for(let d of[r-1,r,r+1])if((d+a)*1e4+e.month_end*100+e.day_end>=s)return d;return r+1}function yc(e,n){return!Number.isFinite(e)||e<=n||e>n+31622400?"invalid_range":null}function Ag(e,n,t,r){let o=n*32+t,i=e.month_start*32+e.day_start,s=e.month_end*32+e.day_end,a=e.year!==void 0&&r!==void 0;return i<=s?o>=i&&o<=s&&(!a||r===e.year):a?o>=i&&r===e.year||o<=s&&r===e.year+1:o>=i||o<=s}function _o(e,n,t){if(e.enabled===!1||Eo(e)==="date")return[];let r=[],o=null;for(let i=1;i<=Je[n-1];i+=1)Ag(e,n,i,t)?o?o.to=i:(o={from:i,to:i},r.push(o)):o=null;return r}var $e=e=>String(e).padStart(2,"0");function vc(e,n){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"}).formatToParts(new Date(e)),r=o=>Number(t.find(i=>i.type===o)?.value);return[r("year"),r("month"),r("day"),r("hour"),r("minute")]}catch{return null}}function jn(e,n){let t=vc(e,n);return t?Date.UTC(t[0],t[1]-1,t[2],t[3],t[4])-Math.floor(e/6e4)*6e4:null}function wc(e,n){let t=Date.parse(`${e}Z`);if(!n||Number.isNaN(t))return Date.parse(e)/1e3;let r=864e5,o=jn(t-r,n),i=jn(t+r,n);if(o===null||i===null)return Date.parse(e)/1e3;let s=t-o;if(jn(s,n)===o)return s/1e3;let a=t-i;return jn(a,n)===i?a/1e3:s/1e3}function To(e,n){let t=n?vc(e*1e3,n):null;if(t)return`${String(t[0]).padStart(4,"0")}-${$e(t[1])}-${$e(t[2])}T${$e(t[3])}:${$e(t[4])}`;let r=new Date(e*1e3);return`${r.getFullYear()}-${$e(r.getMonth()+1)}-${$e(r.getDate())}T${$e(r.getHours())}:${$e(r.getMinutes())}`}var Rt=[z,V,_`
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
`],xc=[z,V,_`
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
`];var h={title:"People",intro:"Choose who gets which theme, and when.",loading:"Loading people...",loadFailed:"Could not load the people list.",retry:"Try again",you:"You",admin:"Admin",optedOutChip:"Opted out",optOutLabel:"Do not let others change my theme",optOutOn:"Others can no longer change your theme.",optOutOff:"Others can change your theme again.",optOutShortcut:"Opt out",noOverride:"Using their own theme",setBy:e=>e?`Set by ${e}`:"Set by an administrator",overrideLine:e=>`Theme ${e}`,until:e=>`until ${e}`,noEnd:"until removed",assign:"Assign theme",startsNow:"This theme starts immediately and stays until the end time below.",unassign:"Remove",birthday:"Birthday",close:"Close",cancel:"Cancel",save:"Save",saving:"Saving...",assignTitle:e=>`Assign a theme to ${e}`,theme:"Theme",defaultTheme:"default",mode:"Mode",modeAuto:"Auto",modeDark:"Dark",modeLight:"Light",duration:"Until",untilNone:"Until removed",untilDate:"Until a date and time",untilInput:"End date and time",assigned:"Theme assigned.",selfApplied:"That is your own account, so the theme was applied to you directly.",unassigned:"Assignment removed.",birthdayTitle:e=>`Birthday for ${e}`,month:"Month",day:"Day",clear:"Clear birthday",birthdaySaved:"Birthday saved.",birthdayCleared:"Birthday cleared.",holidays:"Holidays",holidaysIntro:"Each holiday switches everyone to its theme during the range.",holidaysEmpty:"No holidays yet.",editHolidays:"Edit holidays",holidayEditorTitle:"Holidays and events",holidayName:"Name",holidayStart:"Starts",holidayEnd:"Ends",holidayEnabled:"Enabled",holidayRemove:"Remove",holidayEdit:"Edit",holidayAdd:"Add holiday",eventAdd:"Add event",holidayKind:"Holiday",eventKind:"Event",eventName:"Event name",eventNamePlaceholder:"For example, Anna's birthday",eventYearly:"Repeat every year",holidayNewTitle:"New holiday",eventNewTitle:"New event",holidayEditTitle:e=>`Edit ${e}`,holidayListLabel:"Holidays and events",holidayOff:"off",holidayPreset:"Preset",holidayPresetPick:"Choose a preset",holidayBack:"Back to list",holidaysSaved:"Holidays saved.",timeline:"Next 12 months",holidayRowLabel:(e,n)=>`${n}: ${e}`,timelineHoliday:(e,n)=>`${e}, ${n}`,problemName:"Enter a name of up to 60 characters.",problemDate:"This date does not exist in that month.",problemTheme:"Choose a theme.",problemUntil:"Pick a time in the future, within 366 days.",assigners:"Assigners",assignersTitle:"Who may assign themes",assignersHelp:"Assigners can set the theme of other non-admin users. Saving replaces the whole list.",assignersEmpty:"There are no non-admin users.",assignersSaved:"Assigners saved.",months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],errors:{unauthorized:"You are not allowed to do that.",invalid_user:"That user is no longer available.",unknown_theme:"That theme is not installed.",invalid_range:"That date range is not allowed.",limit_reached:"A limit was reached. Remove something and try again.",invalid_request:"The server did not accept those values.",not_found:"That item no longer exists.",save_failed:"The change could not be saved. Try again.",unknown_command:"This server does not support the People tab.",not_loaded:"The server is still starting. Try again in a moment.",rate_limited:"Too many requests. Wait a moment and try again.",invalid_format:"Those values are not in a valid format.",unknown:"Something went wrong. Try again."},missingTheme:e=>`missing: ${e}`,holidaysLoadFailed:"Could not load the holidays. Editing is off until they load.",unknownCode:e=>`Something went wrong (${e}). Try again.`,optedOut:e=>`${e} chose not to have their theme changed.`};function Qe(e,n){if(e==="opted_out")return h.optedOut(n??"This person");let t=h.errors[e];return t||(e==="unknown"?h.errors.unknown:h.unknownCode(e))}var Cg='button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',So=class extends A{constructor(){super(...arguments);this.heading="";this.busy=!1;this.onKey=t=>{if(t.key==="Escape"){if(t.stopPropagation(),this.busy)return;this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}));return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=this.getRootNode().activeElement,i=t.shiftKey?r[0]:r[r.length-1];(o===i||!o||!this.contains(o))&&(t.preventDefault(),(t.shiftKey?r[r.length-1]:r[0]).focus())}}static{this.properties={heading:{type:String},busy:{type:Boolean}}}static{this.styles=Rt}firstUpdated(){this.focusables()[0]?.focus()}focusables(){return[...this.querySelectorAll(Cg)].filter(t=>!t.disabled)}render(){return l`
      <div class="backdrop">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="title" @keydown=${this.onKey}>
          <h2 id="title">${this.heading}</h2>
          <slot></slot>
        </div>
      </div>
    `}},Q=class extends A{constructor(){super(...arguments);this.themes=[];this.installed=[];this.busy=!1;this.error=""}static{this.properties={hass:{attribute:!1},themes:{attribute:!1},installed:{attribute:!1},busy:{state:!0},error:{state:!0}}}static{this.styles=Rt}done(t){this.dispatchEvent(new CustomEvent("people-done",{detail:t,bubbles:!0,composed:!0}))}close(){this.busy||this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}))}async run(t,r){if(!(this.busy||!this.hass)){this.busy=!0,this.error="";try{let o=await t();o&&this.done(o)}catch(o){this.error=Qe(q(o),r)}finally{this.busy=!1}}}themeOptions(t){let r=[h.defaultTheme,...this.themes.filter(i=>i!==h.defaultTheme)],o=r.map(i=>l`<option value=${i} ?selected=${i===t}>${i}</option>`);if(t&&!r.includes(t)){let i=this.installed.includes(t)?t:h.missingTheme(t);o.push(l`<option value=${t} selected>${i}</option>`)}return o}renderError(){return this.error?l`<p class="error" role="alert">${this.error}</p>`:u}renderActions(t,r=!1){return l`
      <div class="actions">
        <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${h.cancel}</button>
        <button class="btn primary" type="submit" ?disabled=${this.busy||r}>
          ${this.busy?h.saving:t}
        </button>
      </div>
    `}},Ao=class extends Q{constructor(){super(...arguments);this.mode="auto";this.limited=!1;this.until="";this.startsNow=!1;this.theme=h.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(!r)return;let o=this.mode==="auto"?void 0:this.mode==="dark",i=Date.now()/1e3,s=null;if(this.limited&&(s=wc(this.until,this.zone),yc(s,i))){this.error=h.problemUntil;return}this.run(async()=>{if((await lc(this.hass,{user_id:r.id,theme:this.theme,dark:o,ends:s}))?.self){let d=o===void 0?{theme:this.theme}:{theme:this.theme,dark:o};return{message:h.selfApplied,selfApply:Fn(d)}}return{message:h.assigned}},r.name)}}static{this.properties={...Q.properties,person:{attribute:!1},mode:{state:!0},limited:{state:!0},until:{state:!0},theme:{state:!0},startsNow:{attribute:!1}}}get zone(){return this.hass?.config?.time_zone||void 0}render(){let t=this.person;if(!t)return u;let r=To(Date.now()/1e3+60,this.zone),o=To(Date.now()/1e3+31622400-3600,this.zone);return l`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${h.assignTitle(t.name)}>
        <form @submit=${this.onSubmit}>
          <div class="field">
            <label for="theme">${h.theme}</label>
            <select id="theme" @change=${i=>this.theme=i.target.value}>
              ${this.themeOptions(this.theme)}
            </select>
          </div>
          <fieldset>
            <legend>${h.mode}</legend>
            ${["auto","dark","light"].map(i=>l`<label class="choice">
                <input type="radio" name="mode" .checked=${this.mode===i} @change=${()=>this.mode=i} />
                ${i==="auto"?h.modeAuto:i==="dark"?h.modeDark:h.modeLight}
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
                    @input=${i=>this.until=i.target.value}
                  />`:u}
          </fieldset>
          ${this.renderError()}${this.renderActions(h.assign)}
        </form>
      </hats-lite-dialog-shell>
    `}},Mo=class extends Q{constructor(){super(...arguments);this.month=1;this.day=1;this.theme=h.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(r){if(!Bn(this.month,this.day)){this.error=h.problemDate;return}this.run(async()=>(await uc(this.hass,r.id,{month:this.month,day:this.day,theme:this.theme,...this.dark===void 0?{}:{dark:this.dark}}),{message:h.birthdaySaved}),r.name)}};this.onClear=()=>{let t=this.person;t&&this.run(async()=>(await pc(this.hass,t.id),{message:h.birthdayCleared}),t.name)}}static{this.properties={...Q.properties,person:{attribute:!1},month:{state:!0},day:{state:!0}}}willUpdate(t){let r=this.person?.birthday;t.has("person")&&r&&(this.month=r.month,this.day=r.day,this.theme=r.theme,this.dark=r.dark)}render(){let t=this.person;return t?l`
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
                max=${Je[this.month-1]}
                .value=${String(this.day)}
                @input=${r=>this.day=Number(r.target.value)}
              />
            </div>
          </div>
          <div class="field">
            <label for="theme">${h.theme}</label>
            <select id="theme" @change=${r=>this.theme=r.target.value}>
              ${this.themeOptions(this.theme)}
            </select>
          </div>
          ${this.renderError()}
          <div class="actions">
            <button class="btn" type="button" id="clear" ?disabled=${this.busy} @click=${this.onClear}>${h.clear}</button>
            <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${h.cancel}</button>
            <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy?h.saving:h.save}</button>
          </div>
        </form>
      </hats-lite-dialog-shell>
    `:u}},Co=class extends Q{constructor(){super(...arguments);this.candidates=[];this.picked=new Set;this.onSubmit=t=>{t.preventDefault(),this.run(async()=>(await fc(this.hass,[...this.picked]),{message:h.assignersSaved}))}}static{this.properties={...Q.properties,candidates:{attribute:!1},picked:{state:!0}}}willUpdate(t){t.has("candidates")&&(this.picked=new Set(this.candidates.filter(r=>r.is_assigner).map(r=>r.id)))}toggle(t,r){let o=new Set(this.picked);r?o.add(t):o.delete(t),this.picked=o}render(){let t=this.candidates.filter(r=>!r.is_admin);return l`
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
    `}},Pg=[["hats-lite-dialog-shell",So],["hats-lite-assign-dialog",Ao],["hats-lite-birthday-dialog",Mo],["hats-lite-assigners-dialog",Co]];for(let[e,n]of Pg)customElements.get(e)||customElements.define(e,n);var Rg=/do not (use|modify)/i;function Dg(e){return Rg.test(e)}function Dt(e){return e.filter(n=>!Dg(n))}function Ot(e){return Object.keys(e?.themes?.themes??{}).sort()}function kc(e){return Dt(Ot(e))}function $c(e){return e?.config?.time_zone||void 0}var Po=[{key:"new-year",name:"New Year",month_start:12,day_start:30,month_end:1,day_end:2},{key:"valentines",name:"Valentine's Day",month_start:2,day_start:13,month_end:2,day_end:14},{key:"st-patricks",name:"St. Patrick's Day",month_start:3,day_start:16,month_end:3,day_end:17},{key:"earth-day",name:"Earth Day",month_start:4,day_start:22,month_end:4,day_end:22},{key:"halloween",name:"Halloween",month_start:10,day_start:24,month_end:10,day_end:31},{key:"christmas",name:"Christmas",month_start:12,day_start:20,month_end:12,day_end:26}];function Ec(e,n){if(!n.includes(e))return e;let t=2;for(;n.includes(`${e}-${t}`);)t+=1;return`${e}-${t}`}var Ig={name:h.problemName,date:h.problemDate,theme:h.problemTheme};function It(e){let n=`${h.months[e.month_start-1]} ${e.day_start}`,t=`${h.months[e.month_end-1]} ${e.day_end}`;return n===t?n:`${n} - ${t}`}var Ro=class extends A{constructor(){super(...arguments);this.item=null;this.kind="holiday";this.themes=[];this.taken=[];this.zone=void 0;this.busy=!1;this.draft=this.blank();this.yearly=!0;this.problem=null;this.presetKey="";this.onPreset=t=>{this.presetKey=t.target.value;let r=Po.find(s=>s.key===this.presetKey);if(!r)return;let{key:o,...i}=r;this.patch(i)};this.onSubmit=t=>{t.preventDefault();let r=Eo(this.draft);if(this.problem=r,r||this.busy)return;let o={...this.draft,name:this.draft.name.trim()};this.item||(o.id=Ec(this.presetKey||this.kind,this.taken)),this.kind==="event"&&(o.kind="event",this.yearly?delete o.year:o.year=bc(o,new Date,this.zone)),this.dispatchEvent(new CustomEvent("holiday-save",{detail:o,bubbles:!0,composed:!0}))};this.onCancel=()=>{this.dispatchEvent(new CustomEvent("holiday-cancel",{bubbles:!0,composed:!0}))}}static{this.properties={item:{attribute:!1},kind:{type:String},themes:{attribute:!1},taken:{attribute:!1},zone:{attribute:!1},busy:{type:Boolean},draft:{state:!0},yearly:{state:!0},problem:{state:!0}}}static{this.styles=Rt}blank(){return{id:"",name:"",month_start:1,day_start:1,month_end:1,day_end:1,theme:h.defaultTheme,enabled:!0}}willUpdate(t){(t.has("item")||t.has("kind"))&&(this.draft=this.item?{...this.item}:this.blank(),this.yearly=this.item?.year===void 0,this.problem=null,this.presetKey="")}patch(t){this.draft={...this.draft,...t},this.problem=null}num(t){return r=>this.patch({[t]:Number(r.target.value)})}monthSelect(t,r){return l`<select aria-label=${r} @change=${this.num(t)}>
      ${h.months.map((o,i)=>l`<option value=${i+1} ?selected=${this.draft[t]===i+1}>${o}</option>`)}
    </select>`}dateRow(t,r,o){return l`<div class="field">
      <span>${t}</span>
      <div class="row">
        ${this.monthSelect(r,`${t} ${h.month}`)}
        <input type="number" min="1" max="31" aria-label=${`${t} ${h.day}`} .value=${String(this.draft[o])} @input=${this.num(o)} />
      </div>
    </div>`}themeOptions(){let t=[h.defaultTheme,...Dt(this.themes).filter(i=>i!==h.defaultTheme)],r=this.draft.theme,o=t.map(i=>l`<option value=${i} ?selected=${i===r}>${i}</option>`);return r&&!t.includes(r)&&o.push(l`<option value=${r} selected>${h.missingTheme(r)}</option>`),o}renderPreset(){return this.item||this.kind==="event"?u:l`<div class="field">
      <label for="preset">${h.holidayPreset}</label>
      <select id="preset" @change=${this.onPreset}>
        <option value="">${h.holidayPresetPick}</option>
        ${Po.map(t=>l`<option value=${t.key}>${t.name} (${It(t)})</option>`)}
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
          <select id="f-theme" @change=${r=>this.patch({theme:r.target.value})}>
            ${this.themeOptions()}
          </select>
        </div>
        ${t?l`<label class="choice">
              <input id="f-yearly" type="checkbox" .checked=${this.yearly} @change=${r=>this.yearly=r.target.checked} />
              ${h.eventYearly}
            </label>`:u}
        <label class="choice">
          <input type="checkbox" .checked=${this.draft.enabled!==!1} @change=${r=>this.patch({enabled:r.target.checked})} />
          ${h.holidayEnabled}
        </label>
        ${this.problem?l`<p class="error" role="alert">${Ig[this.problem]}</p>`:u}
        <div class="actions">
          <button class="btn cancel" type="button" ?disabled=${this.busy} @click=${this.onCancel}>${h.cancel}</button>
          <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy?h.saving:h.save}</button>
        </div>
      </form>
    `}};customElements.get("hats-lite-holiday-form")||customElements.define("hats-lite-holiday-form",Ro);function Lg(e){return e.kind==="event"?h.eventKind:h.holidayKind}function Hg(e,n){return l`<li class="holiday-row">
    <div class="holiday-main">
      <strong>${e.name}</strong>
      <span class="chip">${Lg(e)}</span>
      ${e.enabled===!1?l`<span class="chip">${h.holidayOff}</span>`:u}
      <div class="muted">${It(e)}</div>
      <div class="muted">${h.theme}: ${e.theme}</div>
    </div>
    <div class="holiday-actions">
      <button class="btn edit" type="button" aria-label=${`${h.holidayEdit} ${e.name}`} ?disabled=${n.busy} @click=${()=>n.onEdit(e)}>
        ${h.holidayEdit}
      </button>
      <button class="btn remove" type="button" aria-label=${`${h.holidayRemove} ${e.name}`} ?disabled=${n.busy} @click=${()=>n.onRemove(e)}>
        ${h.holidayRemove}
      </button>
    </div>
  </li>`}function _c(e,n){return e.length===0?l`<p class="muted">${h.holidaysEmpty}</p>`:l`<ul class="holiday-list" aria-label=${h.holidayListLabel}>${e.map(t=>Hg(t,n))}</ul>`}var Oo=It;function Io(e,n=new Date){let t=Array.from({length:12},(r,o)=>{let i=n.getMonth()+o;return{month:i%12+1,year:n.getFullYear()+Math.floor(i/12)}});return l`
    <ol class="timeline" aria-label=${h.timeline}>
      ${t.map(({month:r,year:o})=>{let i=Je[r-1],s=e.filter(a=>_o(a,r,o).length>0);return l`<li class="month">
          <span>${h.months[r-1]}</span>
          <div class="track">
            ${s.flatMap(a=>_o(a,r,o).map(d=>l`<i
                  class="bar"
                  style=${te({left:`${(d.from-1)/i*100}%`,width:`${(d.to-d.from+1)/i*100}%`})}
                ></i>`))}
          </div>
          ${s.map(a=>l`<span class="sr">${h.timelineHoliday(a.name,Oo(a))}</span>`)}
        </li>`})}
    </ol>
  `}var Do=class extends Q{constructor(){super(...arguments);this.loaded=!0;this.holidays=[];this.items=[];this.view={kind:"list"};this.onSave=t=>{let r=t.detail,o=this.items.some(i=>i.id===r.id);this.persist(o?this.items.map(i=>i.id===r.id?r:i):[...this.items,r])};this.backToList=()=>{this.error="",this.view={kind:"list"}}}static{this.properties={...Q.properties,loaded:{type:Boolean},holidays:{attribute:!1},items:{state:!0},view:{state:!0}}}willUpdate(t){t.has("holidays")&&(this.items=this.holidays.map(r=>({...r})))}persist(t){this.loaded&&this.run(async()=>{let r=await mc(this.hass,t);this.items=r,this.view={kind:"list"},this.dispatchEvent(new CustomEvent("holidays-changed",{detail:r,bubbles:!0,composed:!0}))})}open(t,r){this.error="",this.view={kind:"form",entry:t,item:r}}renderList(){return l`
      <div class="row">
        <button class="btn" type="button" id="add-holiday" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("holiday",null)}>${h.holidayAdd}</button>
        <button class="btn" type="button" id="add-event" ?disabled=${!this.loaded||this.busy} @click=${()=>this.open("event",null)}>${h.eventAdd}</button>
      </div>
      ${Io(this.items)}
      ${_c(this.items,{busy:this.busy||!this.loaded,onEdit:t=>this.open(t.kind==="event"?"event":"holiday",t),onRemove:t=>this.persist(this.items.filter(r=>r.id!==t.id))})}
      ${this.renderError()}
      <div class="actions"><button class="btn primary" type="button" @click=${()=>this.close()}>${h.close}</button></div>
    `}renderForm(t){return l`
      <hats-lite-holiday-form
        .item=${t.item}
        .kind=${t.entry}
        .themes=${Dt(this.themes)}
        .zone=${$c(this.hass)}
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
    `}};customElements.get("hats-lite-holidays-dialog")||customElements.define("hats-lite-holidays-dialog",Do);var Ng=["override","birthday","holiday"],Sc=/^(\d{4})-(\d{2})-(\d{2})$/,Fg=/^([01][0-9]|2[0-3]):[0-5][0-9]$/,jg=/^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$/,Ac=/^(\d{4})-(\d{2})$/;function ue(e,n=2){return String(e).padStart(n,"0")}function Lo(e,n,t){return`${ue(e,4)}-${ue(n)}-${ue(t)}`}function Ie(e){return e.slice(0,7)}function Ee(e){let n=Sc.exec(e);return n?[Number(n[1]),Number(n[2]),Number(n[3])]:null}function Kn(e){let n=Ac.exec(e);return n?[Number(n[1]),Number(n[2])]:null}function zn(e){let[n,t]=Kn(e)??[1970,1];return new Date(Date.UTC(n,t,0)).getUTCDate()}function Ho(e,n){let[t,r]=Kn(e)??[1970,1],o=t*12+(r-1)+n;return`${ue(Math.floor(o/12),4)}-${ue(o%12+1)}`}function et(e,n){let[t,r,o]=Ee(e)??[1970,1,1],i=new Date(Date.UTC(t,r-1,o+n));return Lo(i.getUTCFullYear(),i.getUTCMonth()+1,i.getUTCDate())}function Mc(e){let[n,t,r]=Ee(e)??[1970,1,1];return new Date(Date.UTC(n,t-1,r)).getUTCDay()}function Un(e,n){let[,,t]=Ee(e)??[1970,1,1],r=Ho(Ie(e),n);return`${r}-${ue(Math.min(t,zn(r)))}`}var Bg={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};function No(e){let n=e?.locale,t=Bg[n?.first_weekday??""];if(t!==void 0)return t;if(!n?.language)return 1;try{let r=new Intl.Locale(n.language).getWeekInfo?.();if(r&&r.firstDay>=1&&r.firstDay<=7)return r.firstDay%7}catch{return 1}return 1}function Cc(e,n=new Date){let t=e?.config?.time_zone;try{let r=new Intl.DateTimeFormat("en-US",{timeZone:t||void 0,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(n),o=i=>Number(r.find(s=>s.type===i)?.value);return Lo(o("year"),o("month"),o("day"))}catch{return Lo(n.getFullYear(),n.getMonth()+1,n.getDate())}}function Fo(e){let[n]=Ee(e)??[1970];return{min:`${ue(n-1,4)}-01`,max:`${ue(n+2,4)}-12`}}function Pc(e,n){return(Mc(`${e}-01`)-n+7)%7}function Tc(e,n){let t=(Mc(e)-n+7)%7;return{first:et(e,-t),last:et(e,6-t)}}function Rc(e,n,t){switch(n){case"ArrowLeft":return et(e,-1);case"ArrowRight":return et(e,1);case"ArrowUp":return et(e,-7);case"ArrowDown":return et(e,7);case"Home":return Tc(e,t).first;case"End":return Tc(e,t).last;case"PageUp":return Un(e,-1);case"PageDown":return Un(e,1);default:return null}}function Ug(e){let n=e;if(!n||typeof n!="object"||!Ng.includes(n.kind)||typeof n.theme!="string")return null;let t={...n,kind:n.kind,source:String(n.source??n.kind),theme:n.theme};return delete t.partial,delete t.active_from,delete t.active_until,n.partial===!0&&Fg.test(String(n.active_from))&&jg.test(String(n.active_until))&&(t.partial=!0,t.active_from=n.active_from,t.active_until=n.active_until),t}function Kg(e){let n=e;if(!n||typeof n.date!="string"||!Sc.test(n.date)||!Array.isArray(n.items))return null;let t=n.winner,r=t?.selection?.theme;return{date:n.date,winner:t&&typeof r=="string"?t:null,items:n.items.map(Ug).filter(o=>o!==null),conflict:n.conflict===!0}}function zg(e){let n=e;if(!n||typeof n.month!="string"||!Ac.test(n.month)||!Array.isArray(n.days)||n.days.length!==zn(n.month))return null;let t=n.days.map(Kg);return t.some((r,o)=>r===null||r.date!==`${n.month}-${ue(o+1)}`)?null:{month:n.month,user:String(n.user??""),time_zone:String(n.time_zone??""),opt_out:n.opt_out===!0,trial:n.trial===!0,days:t}}async function Dc(e,n,t){let r={type:"hats_lite/calendar",month:n};t&&(r.user=t);let o=zg(await P(e,r));if(!o||o.month!==n)throw{code:"unknown"};return o}function Oc(e,n=new Date){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:e||void 0,hourCycle:"h23",hour:"numeric",minute:"numeric",second:"numeric"}).formatToParts(n),r=o=>Number(t.find(i=>i.type===o)?.value);return[r("hour"),r("minute"),r("second")]}catch{return[n.getHours(),n.getMinutes(),n.getSeconds()]}}var k={viewLabel:"People view",list:"List",calendar:"Calendar",loading:"Loading the calendar...",loadFailed:"Could not load the calendar.",retry:"Try again",prev:"Previous month",next:"Next month",today:"Today",person:"Person",grid:e=>`Calendar for ${e}`,optedOut:"This person opted out of assigned themes, so nothing here is applied.",none:"No scheduled theme",detailTitle:"Selected day",noSelection:"Pick a day to see what applies.",effective:"Theme that applies",noEffective:"None, the person's own theme is used.",setBy:e=>`Set by ${e}`,setByAdmin:"an administrator",itemsHeading:"Everything on this day",wins:"Applies",loses:"Not applied",until:e=>`until ${e}`,untilRemoved:"until removed",conflict:"Conflict",conflictNote:"More than one item wants a different theme on this day.",preview:"Preview this day",previewMissing:"This theme is not installed, so it cannot be previewed.",assignNow:e=>`Assign now, until the end of ${e}`,assignLate:"There is less than two minutes left today. Pick another day to assign a theme.",trial:"A try is running; the schedule applies again when it ends",partialOnly:"Only part of the day has an assigned theme",appliesFrom:e=>`applies from ${e}`,untilTime:e=>`until ${e}`,partial:"Part of the day",editHolidays:"Edit holidays",kinds:{override:"Assignment",birthday:"Birthday",holiday:"Holiday"},itemName:e=>e.kind==="holiday"?e.name?`Holiday ${e.name}`:"Holiday":e.kind==="birthday"?"Birthday":e.assigned_by_name?`Assignment by ${e.assigned_by_name}`:"Assignment",cellLabel:(e,n)=>`${e}. ${n}`,winnerSummary:(e,n)=>`Theme ${e} from ${n}`,conflictSummary:(e,n,t)=>`Conflict: theme ${e} from ${n} wins over ${t}`,errors:{unauthorized:"You are not allowed to see that calendar.",invalid_user:"That user is no longer available.",invalid_request:"That month is outside the range the calendar can show.",not_loaded:"The server is still starting. Try again in a moment.",unknown:"Something went wrong. Try again."}};function Ic(e){return k.errors[e]??k.loadFailed}function Vn(e,n){let t=Ee(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{dateStyle:"full",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,t[2])))}catch{return e}}function jo(e,n){let t=Kn(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,1)))}catch{return e}}function Lc(e,n){let t=(r,o)=>{try{return new Intl.DateTimeFormat(n,{weekday:r,timeZone:"UTC"}).format(new Date(Date.UTC(2024,0,7+o)))}catch{return String(o)}};return Array.from({length:7},(r,o)=>{let i=(e+o)%7;return{short:t("short",i),long:t("long",i)}})}function Hc(e){return e?["override","birthday","holiday"].filter(n=>e.items.some(t=>t.kind===n)):[]}function Nc(e){return e.items.find(n=>n.wins===!0&&n.partial!==!0)}function Vg(e){return e.items.filter(n=>n!==Nc(e)).map(n=>`${k.itemName(n)} (${n.theme})`).join(", ")}function Fc(e,n){if(!e||e.items.length===0)return k.none;if(n)return k.optedOut;if(!e.winner)return k.partialOnly;let t=Nc(e),r=t?k.itemName(t):e.winner.source,o=e.winner.selection.theme;return e.conflict?k.conflictSummary(o,r,Vg(e)):k.winnerSummary(o,r)}function Wg(e,n,t){try{return e.toLocaleString(n,t?{timeZone:t}:void 0)}catch{return e.toLocaleString(n)}}function Bo(e,n,t){return e.kind!=="override"?"":e.until===null||e.until===void 0?k.untilRemoved:k.until(Wg(new Date(e.until*1e3),n,t))}function Uo(e){if(e.partial!==!0||!e.active_from||!e.active_until||e.active_from===e.active_until)return"";let n=e.active_from==="00:00"?"":k.appliesFrom(e.active_from),t=e.active_until==="24:00"?"":k.untilTime(e.active_until);return[n,t].filter(Boolean).join(" ")}function qg(e){let n=e.day?.winner;if(!n||e.optOut)return l`<p class="muted" id="effective">${k.noEffective}</p>`;let t=e.day?.items.find(s=>s.wins===!0&&s.partial!==!0),r=n.selection.theme,o=n.selection.dark??e.darkMode,i=e.installed.includes(r);return l`
    <p id="effective"><strong>${r}</strong>${t?l` - ${k.itemName(t)}`:u}</p>
    ${t?.kind==="override"?l`<p class="muted">${k.setBy(t.assigned_by_name??k.setByAdmin)}</p>`:u}
    <div class="tools">
      <button class="btn" type="button" id="preview-day" ?disabled=${!i} @click=${()=>e.onPreview(r,o)}>${k.preview}</button>
    </div>
    ${i?u:l`<p class="muted">${k.previewMissing}</p>`}
  `}function Gg(e){let n=e.day?.items??[];return n.length===0?u:l`
    <h4>${k.itemsHeading}</h4>
    ${e.day?.conflict?l`<p class="notice" id="conflict-note" role="status">${k.conflictNote}</p>`:u}
    <ul class="items">
      ${n.map(t=>l`<li class=${t.wins&&!t.partial?"won":"lost"} data-wins=${t.wins&&!t.partial?"true":"false"}>
          <span class="name">${k.itemName(t)}</span> - ${t.theme}
          <span class="chip ${t.wins?"ok":"warn"}">${t.partial?k.partial:t.wins?k.wins:k.loses}</span>
          ${Uo(t)?l`<div class="muted">${Uo(t)}</div>`:u}
          ${Bo(t,e.locale,e.zone)?l`<div class="muted">${Bo(t,e.locale,e.zone)}</div>`:u}
        </li>`)}
    </ul>
  `}function jc(e){return e.key?l`
    <h3 id="detail-title">${e.title}</h3>
    <h4>${k.effective}</h4>
    ${qg(e)} ${Gg(e)}
    <div class="tools">
      ${e.canAssign?l`<button class="btn" type="button" id="assign-until" ?disabled=${e.assignLate} @click=${e.onAssign}>${e.assignLabel}</button>`:u}
      ${e.canHolidays?l`<button class="btn" type="button" id="edit-holidays-cal" @click=${e.onHolidays}>${k.editHolidays}</button>`:u}
    </div>
    ${e.canAssign&&e.assignLate?l`<p class="muted" id="assign-hint">${k.assignLate}</p>`:u}
  `:l`<h3>${k.detailTitle}</h3><p class="muted">${k.noSelection}</p>`}var Bc=[z,V,_`
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
`];var Ko=class extends A{constructor(){super(...arguments);this.people=[];this.view="list";this.status="idle";this.failure="";this.month="";this.data=null;this.selected="";this.focusKey="";this.userId="";this.token=0;this.stale=!1;this.onKey=t=>{let r=this.focusKey;if(t.key==="Enter"||t.key===" "){t.preventDefault(),this.selected=r;return}let o=Rc(r,t.key,No(this.hass));o!==null&&(t.preventDefault(),Ie(o)===this.month?(this.focusKey=o,this.updateComplete.then(()=>this.cellOf(o)?.focus())):this.goTo(Ie(o),o))};this.onPerson=t=>{this.userId=t.target.value,this.selected="",this.data=null,this.load()}}static{this.properties={hass:{attribute:!1},people:{attribute:!1},view:{state:!0},status:{state:!0},failure:{state:!0},month:{state:!0},data:{state:!0},selected:{state:!0},focusKey:{state:!0},userId:{state:!0}}}static{this.styles=Bc}get language(){return this.hass?.locale?.language}get zone(){return this.hass?.config?.time_zone||void 0}minutesLeft(){let[t,r,o]=Oc(this.zone);return 1440-(t*60+r+o/60)}get today(){return Cc(this.hass)}willUpdate(t){t.has("hass")&&this.hass&&this.month===""?(this.userId=this.hass.user?.id??"",this.month=Ie(this.today),this.focusKey=this.today):t.has("people")&&t.get("people")!==void 0&&this.status!=="idle"&&(this.view==="calendar"?this.load():this.stale=!0)}async load(){let t=this.hass;if(!t)return;let r=++this.token,o=this.month;this.stale=!1,this.status="loading";try{let i=await Dc(t,o,this.userId||void 0);if(r!==this.token)return;this.data=i,this.failure="",this.status="ready"}catch(i){if(r!==this.token)return;let s=q(i);this.data=null,this.failure=Ic(s),this.status=s==="unknown_command"?"unsupported":"error",this.status==="unsupported"&&this.setView("list")}}setView(t){t!==this.view&&(this.view=t,this.dispatchEvent(new CustomEvent("schedule-view",{detail:{view:t},bubbles:!0,composed:!0})),t==="calendar"&&(this.status==="idle"||this.stale)&&this.load())}async goTo(t,r){let o=Fo(this.today);t<o.min||t>o.max||(this.month=t,this.focusKey=r,Ie(this.selected)!==t&&(this.selected=""),this.data=null,await this.load(),await this.updateComplete,this.cellOf(r)?.focus())}cellOf(t){return this.renderRoot.querySelector(`[data-day="${t}"]`)}onPick(t){this.selected=t,this.focusKey=t}dayOf(t){return this.data?.days.find(r=>r.date===t)}canAssign(){let t=this.hass?.user,r=this.people.find(o=>o.id===this.userId);return r?r.id===t?.id?!0:t?.is_admin===!0||!r.is_admin&&this.people.some(o=>o.id!==t?.id):!1}detailModel(){let t=this.selected,r=this.dayOf(t),o=Ot(this.hass),i=t>=this.today,s=this.zone;return{key:t,day:r,title:Vn(t,this.language),optOut:this.data?.opt_out===!0,installed:o,locale:this.language,zone:s,assignLabel:k.assignNow(Vn(t,this.language)),assignLate:t===this.today&&this.minutesLeft()<2,canAssign:i&&this.canAssign(),canHolidays:this.hass?.user?.is_admin===!0,darkMode:this.hass?.themes?.darkMode,onPreview:(a,d)=>this.dispatchEvent(new CustomEvent("hats-lite-preview-theme",{detail:{theme:a,dark:d},bubbles:!0,composed:!0})),onAssign:()=>{let a=r?.winner?.selection,d={userId:this.userId,until:`${t}T23:59`};a?.theme&&(d.theme=a.theme),a?.dark!==void 0&&(d.dark=a.dark),this.dispatchEvent(new CustomEvent("schedule-assign",{detail:d,bubbles:!0,composed:!0}))},onHolidays:()=>this.dispatchEvent(new CustomEvent("schedule-holidays",{bubbles:!0,composed:!0}))}}renderSwitch(){return l`
      <div class="seg" role="group" aria-label=${k.viewLabel}>
        <button type="button" id="view-list" aria-pressed=${this.view==="list"?"true":"false"} @click=${()=>this.setView("list")}>${k.list}</button>
        <button type="button" id="view-calendar" aria-pressed=${this.view==="calendar"?"true":"false"} @click=${()=>this.setView("calendar")}>${k.calendar}</button>
      </div>
    `}renderCell(t,r){let o=this.dayOf(t),i=Ee(t)?.[2]??0,s=Hc(o),a=Fc(o,this.data?.opt_out===!0);return l`<div class="cell" role="gridcell" aria-selected=${this.selected===t?"true":"false"}>
      <button
        type="button"
        class="day ${t===r?"today":""}"
        data-day=${t}
        tabindex=${this.focusKey===t?"0":"-1"}
        aria-current=${t===r?"date":u}
        aria-label=${k.cellLabel(Vn(t,this.language),a)}
        @click=${()=>this.onPick(t)}
      >
        <span class="num" aria-hidden="true">${i}</span>
        <span class="marks" aria-hidden="true">
          ${s.map(d=>l`<i class="dot ${d}" data-kind=${d}></i>`)}
          ${o?.conflict?l`<span class="conflict" data-conflict="true">!</span>`:u}
        </span>
      </button>
    </div>`}renderGrid(){let t=No(this.hass),r=this.today,o=Pc(this.month,t),i=zn(this.month),s=[...Array.from({length:o},()=>null),...Array.from({length:i},(d,c)=>`${this.month}-${String(c+1).padStart(2,"0")}`)];for(;s.length%7!==0;)s.push(null);let a=Array.from({length:s.length/7},(d,c)=>s.slice(c*7,c*7+7));return l`<div class="grid" role="grid" aria-label=${k.grid(jo(this.month,this.language))} @keydown=${this.onKey}>
      <div class="row" role="row">
        ${Lc(t,this.language).map(d=>l`<div class="head" role="columnheader" aria-label=${d.long}>${d.short}</div>`)}
      </div>
      ${a.map(d=>l`<div class="row" role="row">
          ${d.map(c=>c===null?l`<div class="cell" role="gridcell" aria-hidden="true"></div>`:this.renderCell(c,r))}
        </div>`)}
    </div>`}renderNav(){let t=Fo(this.today),r=o=>void this.goTo(Ho(this.month,o),Un(this.focusKey||`${this.month}-01`,o));return l`<div class="bar">
      <button class="btn" type="button" id="prev" aria-label=${k.prev} ?disabled=${this.month<=t.min} @click=${()=>r(-1)}>&lsaquo;</button>
      <h3 class="title grow" id="month-title" aria-live="polite">${jo(this.month,this.language)}</h3>
      <button class="btn" type="button" id="today" @click=${()=>void this.goTo(Ie(this.today),this.today)}>${k.today}</button>
      <button class="btn" type="button" id="next" aria-label=${k.next} ?disabled=${this.month>=t.max} @click=${()=>r(1)}>&rsaquo;</button>
      ${this.people.length>1?l`<label class="muted" for="person">${k.person}</label>
            <select id="person" @change=${this.onPerson}>
              ${this.people.map(o=>l`<option value=${o.id} ?selected=${o.id===this.userId}>${o.name}</option>`)}
            </select>`:u}
    </div>`}renderCalendar(){return this.status==="error"?l`${this.renderNav()}
        <p class="notice error" role="alert">${this.failure||k.loadFailed}</p>
        <button class="btn" type="button" id="retry-calendar" @click=${()=>void this.load()}>${k.retry}</button>`:this.data===null?l`${this.renderNav()}<p class="muted" role="status">${k.loading}</p>`:l`
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
        <section class="card" aria-live="polite">${jc(this.detailModel())}</section>
      </div>
    `}render(){return!this.hass||this.status==="unsupported"?u:l`<div class="bar">${this.renderSwitch()}</div>
      ${this.view==="calendar"?this.renderCalendar():u}`}};customElements.get("hats-lite-schedule")||customElements.define("hats-lite-schedule",Ko);var zo=class extends A{constructor(){super(...arguments);this.people=[];this.holidays=[];this.status="idle";this.message="";this.failure="";this.dialog=null;this.holidaysLoaded=!1;this.holidaysFailure="";this.removing=new Set;this.calendarView=!1;this.opener=null;this.onClose=()=>{this.dialog=null;let t=this.opener;this.updateComplete.then(()=>t?.focus?.())};this.onScheduleAssign=t=>{let{userId:r,until:o,theme:i,dark:s}=t.detail,a=this.people.find(d=>d.id===r);a&&this.open({kind:"assign",person:a,until:o,theme:i,dark:s})};this.onHolidaysChanged=t=>{this.holidays=t.detail,this.message=h.holidaysSaved,Nn()};this.onDone=t=>{let r=t.detail;this.dialog=null,this.message=r.message,this.failure="",r.selfApply&&(this.dispatchEvent(new CustomEvent("settheme",{detail:r.selfApply,bubbles:!0,composed:!0})),Nn()),this.load();let o=this.opener;this.updateComplete.then(()=>o?.focus?.())}}static{this.properties={hass:{attribute:!1},people:{state:!0},holidays:{state:!0},status:{state:!0},message:{state:!0},failure:{state:!0},dialog:{state:!0},holidaysLoaded:{state:!0},holidaysFailure:{state:!0},removing:{state:!0},calendarView:{state:!0}}}static{this.styles=xc}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load()}async load(){let t=this.hass;if(t){this.status!=="ready"&&(this.status="loading");try{this.people=await $o(t),this.status="ready"}catch(r){this.failure=Qe(q(r)),this.status="error";return}await this.loadHolidays()}}async loadHolidays(){let t=this.hass;if(t)try{this.holidays=await hc(t),this.holidaysLoaded=!0,this.holidaysFailure=""}catch(r){this.holidaysLoaded=!1,this.holidaysFailure=Qe(q(r))}}get selfId(){return this.hass?.user?.id}get isAdmin(){return this.hass?.user?.is_admin===!0}get canAssign(){return this.isAdmin||this.people.some(t=>t.id!==this.selfId)}themeNames(){return kc(this.hass)}open(t){this.opener=this.shadowRoot?.activeElement,this.dialog=t}async act(t,r,o,i=!1){this.message="",this.failure="";try{await t(),this.message=r,i&&Nn()}catch(s){this.failure=Qe(q(s),o)}await this.load()}optOut(t,r){let o=this.hass;o&&this.act(()=>cc(o,r),r?h.optOutOn:h.optOutOff,t.name,!0)}mayUnassign(t){let r=t.active_override;if(!r)return!1;if(this.isAdmin||t.id===this.selfId)return!0;let o=this.selfId;return o!==void 0&&r.assigned_by===o}removeOverride(t,r){let o=this.hass;!o||this.removing.has(t)||(this.removing=new Set(this.removing).add(t),this.act(()=>dc(o,t),h.unassigned,r).finally(()=>{let i=new Set(this.removing);i.delete(t),this.removing=i}))}renderOverride(t){let r=t.active_override;if(!r)return l`<span class="muted">${h.noOverride}</span>`;let o=r.ends===null?h.noEnd:h.until(new Date(r.ends*1e3).toLocaleString());return l`<span class="override">${h.overrideLine(r.theme)} ${o}. ${h.setBy(r.assigned_by_name)}</span>`}renderPerson(t){let r=t.id===this.selfId,o=this.hass,i=r||this.isAdmin,s=this.canAssign&&(this.isAdmin||!t.is_admin);return l`
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
          ${s?l`<button class="btn" type="button" aria-label="${h.assign}: ${t.name}" @click=${()=>this.open({kind:"assign",person:t})}>${h.assign}</button>`:u}
          ${this.mayUnassign(t)&&o?l`<button
                class="btn"
                type="button"
                aria-label="${h.unassign}: ${t.name}"
                ?disabled=${this.removing.has(t.active_override.id)}
                @click=${()=>this.removeOverride(t.active_override.id,t.name)}
              >
                ${h.unassign}
              </button>`:u}
          ${i?l`<button class="btn" type="button" aria-label="${h.birthday}: ${t.name}" @click=${()=>this.open({kind:"birthday",person:t})}>${h.birthday}</button>`:u}
        </div>
      </li>
    `}renderHolidays(){return l`
      <section class="card" aria-labelledby="holidays-h">
        <h2 id="holidays-h">${h.holidays}</h2>
        <p class="muted">${h.holidaysIntro}</p>
        ${Io(this.holidays)}
        ${this.holidaysLoaded?this.holidays.length===0?l`<p class="muted">${h.holidaysEmpty}</p>`:l`<ul class="holidays">
              ${this.holidays.map(t=>l`<li>${h.holidayRowLabel(t.name,t.kind==="event"?h.eventKind:h.holidayKind)}: ${Oo(t)} (${t.theme})${t.enabled===!1?" - off":""}</li>`)}
            </ul>`:l`<p class="notice error" id="holidays-error" role="alert">
                ${this.holidaysFailure||h.holidaysLoadFailed}
              </p>
              <button class="btn" type="button" id="retry-holidays" @click=${()=>void this.loadHolidays()}>${h.retry}</button>`}
        ${this.isAdmin?l`<div class="tools">
              <button class="btn" type="button" id="edit-holidays" ?disabled=${!this.holidaysLoaded} @click=${()=>this.open({kind:"holidays"})}>${h.editHolidays}</button>
              <button class="btn" type="button" id="edit-assigners" @click=${()=>this.open({kind:"assigners"})}>${h.assigners}</button>
            </div>`:u}
      </section>
    `}renderDialog(){let t=this.dialog;if(!t)return u;let r={hass:this.hass,themes:this.themeNames(),installed:Ot(this.hass)};switch(t.kind){case"assign":return l`<hats-lite-assign-dialog
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
        <button class="btn" type="button" @click=${()=>void this.load()}>${h.retry}</button>`:l`
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
    `}};customElements.get("hats-lite-people")||customElements.define("hats-lite-people",zo);var Wo=["styling","cards","layout","templating","chrome"],Xg=4096,qo="hats_lite/",Go=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,Vo=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function Le(e){return typeof e=="string"?e:""}function Yg(e){if(!e||typeof e!="object")return null;let n=e,t=Le(n.full_name);if(!Go.test(t))return null;let r=Wo.find(o=>o===n.kind)??"cards";return{category:n.category==="integration"?"integration":"plugin",kind:r,full_name:t,description:Le(n.description),stars:typeof n.stars=="number"&&Number.isFinite(n.stars)?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"||typeof n.hacs_id=="number"?n.hacs_id:null,filename:Le(n.filename)||null,pinned:n.pinned===!0,license:Le(n.license)||null,tag:Le(n.tag)||null}}async function Uc(e){let n=await P(e,{type:`${qo}mods`}),t=Array.isArray(n?.mods)?n.mods:[];return{source:Le(n?.source),mods:t.map(Yg).filter(r=>r!==null),truncated:n?.truncated===!0}}async function Kc(e,n){let t=await P(e,{type:`${qo}mod_asset`,full_name:n});if(typeof t?.source!="string")throw{code:"fetch_failed"};return{full_name:Le(t.full_name)||n,source:t.source}}async function Xo(e){try{let n=await P(e,{type:`${qo}mods`,probe:!0});return Array.isArray(n?.mods)}catch(n){return q(n)!=="unknown_command"}}function zc(e){return Go.test(e)?`https://github.com/${e}`:null}function Vc(e){return e.pinned&&e.category==="plugin"}function Wc(e,n="plugin"){if(!Go.test(e))return null;let[t,r]=e.split("/");return`https://my.home-assistant.io/redirect/hacs_repository/?owner=${encodeURIComponent(t)}&repository=${encodeURIComponent(r)}&category=${n}`}function Zg(e){if(e.tag&&Vo.test(e.tag))return e.tag;let n=(e.filename??"").replace(/\.js$/i,"").toLowerCase();return Vo.test(n)?n:""}function qc(e){let n=Zg(e);return JSON.stringify({type:`custom:${n||"my-card"}`},null,2)}function Yo(e){if(e.trim()==="")return{ok:!1,problem:"empty"};if(new TextEncoder().encode(e).length>Xg)return{ok:!1,problem:"too_large"};let n;try{n=JSON.parse(e)}catch{return{ok:!1,problem:"invalid"}}if(!n||typeof n!="object"||Array.isArray(n))return{ok:!1,problem:"not_object"};let t=n;if(typeof t.type!="string"||t.type==="")return{ok:!1,problem:"no_type"};let r=t.type.startsWith("custom:")?t.type.slice(7):"";return Vo.test(r)?{ok:!0,config:t,tag:r}:{ok:!1,problem:"bad_type"}}function Gc(e,n,t,r="all"){let o=n.trim().toLowerCase();return e.filter(i=>r!=="all"&&i.kind!==r||t==="installed"&&!i.installed?!1:o===""?!0:i.full_name.toLowerCase().includes(o)||i.description.toLowerCase().includes(o))}var Gn={maxEntities:100,maxBytes:1048576,maxString:2048,maxAttrBytes:4096},Zo=/^[a-z0-9_]+\.[a-z0-9_]+$/,Jg=/token|access|auth|password|passwd|secret|credential|api[_-]?key/i,Qg=/(?:^|[?&;#]|%3F|%26)(access_token|token|auth|authsig|signature|sig|key|password)(?:=|%3D)/i,eb=/^[a-z][a-z0-9+.-]*:\/\/[^/?#\s]*@/i,tb=/eyJ[A-Za-z0-9_-]{10,}/,nb=/[0-9a-f]{32,}/i,rb=/[A-Za-z0-9+/_-]{32,}/g,ob=5,ib=12,Jo=200,Qc=500,Wn=100,sb=12,ee=Symbol("drop"),eu=new Set(["person","device_tracker","camera","lock","alarm_control_panel","tag","notify","input_text","text"]),ab=new Set(["friendly_name","unit_of_measurement","device_class","state_class","icon","supported_features","min","max","step","options","brightness","color_temp","current_temperature","temperature","humidity","hvac_action","hvac_mode","hvac_modes","battery_level","volume_level","is_volume_muted","media_title","media_artist","source","source_list","percentage","current_position","entity_id"]),lb=/^(entity|entities|entity_id|camera_image|.+_entity|.+_entities|.+_entity_id)$/,Xc=typeof TextEncoder>"u"?null:new TextEncoder;function tu(e){return Xc===null?e.length:Xc.encode(e).length}function db(e){try{let n=JSON.stringify(e);return n===void 0?1/0:tu(n)}catch{return 1/0}}function tt(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Yc(e){if(eb.test(e)||Qg.test(e)||tb.test(e)||nb.test(e))return!0;for(let n of e.match(rb)??[])if(/\d/.test(n)&&/[A-Za-z]/.test(n))return!0;return!1}function qn(e,n=Gn.maxString){let t=e.length>n?e.slice(0,n):e;if(Yc(t))return null;if(t.includes("%"))try{if(Yc(decodeURIComponent(t)))return null}catch{return t}return t}function nt(e,n,t,r,o=ob){if(e===null)return null;if(typeof e=="string"){let i=qn(e,t);return i===null?ee:i}if(typeof e=="number")return Number.isFinite(e)?e:ee;if(typeof e=="boolean")return e;if(n>=o)return ee;if(Array.isArray(e)){let i=[];if(e.length>Qc)return ee;for(let s of e){let a=nt(s,n+1,t,r,o);a!==ee&&i.push(a)}return i}if(tt(e)){let i={},s=0;for(let a of Object.keys(e)){if(a==="__proto__"||a==="constructor"||a==="prototype"||r&&Jg.test(a))continue;if(s>=Jo)break;let d=nt(e[a],n+1,t,r,o);d!==ee&&(i[a]=d,s+=1)}return i}return ee}function cb(e){if(!Array.isArray(e))return[];let n=[];for(let t of e.slice(0,Wn))typeof t=="string"&&Zo.test(t)&&!eu.has(t.slice(0,t.indexOf(".")))&&n.push(t);return n}function ub(e,n){let t={};for(let r of Object.keys(e).slice(0,Jo)){if(!ab.has(r))continue;let o=r==="entity_id"?cb(e[r]):nt(e[r],0,n.maxString,!0);o!==ee&&(db(o)>n.maxAttrBytes||(t[r]=o))}return t}function Zc(e){if(typeof e=="string")return qn(e.slice(0,64),64)??void 0}function Jc(e,n){return typeof e=="string"?e.slice(0,n):void 0}function pb(e){return e.slice(0,e.indexOf("."))}function nu(e){let n=[],t=new Set,r=i=>{typeof i=="string"&&Zo.test(i)&&!t.has(i)&&n.length<Wn&&(t.add(i),n.push(i))},o=(i,s,a)=>{if(!(s>sb||n.length>=Wn)){if(typeof i=="string"){a&&r(i);return}if(Array.isArray(i)){for(let d of i.slice(0,Qc))o(d,s+1,a);return}if(tt(i))for(let d of Object.keys(i).slice(0,Jo))d!=="__proto__"&&o(i[d],s+1,lb.test(d))}};return o(e,0,!1),n}function hb(e,n={}){let t={...Gn,...n},r={};if(!tt(e))return r;let o=(n.entityIds??[]).slice(0,Wn),i=0,s=0;for(let a of o){if(typeof a!="string"||!Zo.test(a)||a in r)continue;if(i>=t.maxEntities)break;let d=Object.prototype.hasOwnProperty.call(e,a)?e[a]:void 0;if(!tt(d))continue;let c=tt(d.attributes)?d.attributes:{},m;if(eu.has(pb(a))||"latitude"in c||"longitude"in c){let g=typeof c.friendly_name=="string"?qn(c.friendly_name,255):null;m={entity_id:a,state:"unknown",attributes:g===null?{}:{friendly_name:g}}}else{let g=d.state,b=typeof g=="string"?g:g==null?"unknown":String(g);m={entity_id:a,state:qn(b,t.maxString)??"unknown",attributes:ub(c,t)};let E=Zc(d.last_changed),M=Zc(d.last_updated);E!==void 0&&(m.last_changed=E),M!==void 0&&(m.last_updated=M)}let p=tu(JSON.stringify(m));s+p>t.maxBytes||(s+=p,r[a]=m,i+=1)}return r}function ru(e,n={}){let t=n.maxString??Gn.maxString,r=nt(e,0,t,!1,ib);return r===ee?{}:r}function Qo(e,n={}){let t={...Gn,...n},r=tt(e)?e:{},o=Jc(r.language,32)??"en",i=Jc(r.selectedLanguage,32)??o,s=nt(r.themes,0,t.maxString,!1),a=nt(r.locale,0,t.maxString,!1);return{states:hb(r.states,n),themes:s===ee?{}:s,language:o,selectedLanguage:i,locale:a===ee?{}:a,userData:{language:i}}}function ou(e,n=1e3){let t=-1/0,r=null,o=null,i=a=>{t=Date.now(),e(...a)},s=((...a)=>{let d=t+n-Date.now();if(d<=0&&r===null){i(a);return}o=a,r===null&&(r=setTimeout(()=>{r=null;let c=o;o=null,c!==null&&i(c)},Math.max(d,0)))});return s.cancel=()=>{r!==null&&clearTimeout(r),r=null,o=null},s}var iu="read only preview",su="allow-scripts",au="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'",lu="The preview runs third party code in a sandboxed frame. A mod that loops forever can still freeze this browser tab, because the frame may share the page's renderer thread. Reload the page if that happens.",du="Everything sent to the preview is readable by the mod author: the card config, the states of the entities the card references (allowlisted attributes only), themes and language. Entities such as people, trackers, cameras and locks are replaced by placeholders. The shown data may leave the browser if the mod author wishes, and no isolation is perfect.",mb=["mod_error","set_config","unhandled_rejection","runtime_error","not_defined"];var fb=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function ei(e){return typeof e=="string"&&e.length<=100&&fb.test(e)}function cu(e=globalThis.crypto){let n=new Uint8Array(16);e.getRandomValues(n);let t="";for(let r of n)t+=r.toString(16).padStart(2,"0");return t}function uu(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Lt(e){return typeof e=="string"&&e.length<=500?e:null}function gb(e){if(!Array.isArray(e)||e.length>100)return null;let n=[];for(let t of e){if(!uu(t))return null;let r=Lt(t.type),o=Lt(t.name),i=Lt(t.description);if(r===null||o===null||i===null)return null;n.push({type:r,name:o,description:i})}return n}function ti(e,n){if(!uu(e)||typeof e.type!="string"||typeof e.token!="string")return null;if(e.type==="ready")return e.token===""?{type:"ready"}:null;if(n===""||e.token!==n)return null;switch(e.type){case"heartbeat":return{type:"heartbeat"};case"rendered":return{type:"rendered"};case"defined":return ei(e.tag)?{type:"defined",tag:e.tag}:null;case"cards":{let t=gb(e.cards);return t===null?null:{type:"cards",cards:t}}case"error":{let t=Lt(e.message),r=mb.find(o=>o===e.code);return t===null||r===void 0?null:{type:"error",code:r,message:t}}case"request":{let t=Lt(e.method),r=e.id;return t===null||typeof r!="number"||!Number.isSafeInteger(r)?null:{type:"request",id:r,method:t}}default:return null}}function bb(e){let n=e.document,t=e.parent.postMessage.bind(e.parent),r=e.customElements,o=r.define.bind(r),i="read only preview",s=500,a="",d=null,c=!1,m=null,p=0,g=$=>{if(d!==null)try{d.postMessage({...$,token:a})}catch{return}},b=$=>String($??"").slice(0,s),E=($,T)=>{let C=T&&T.message!==void 0?T.message:T;g({type:"error",code:$,message:b(C)})},M=$=>(p+=1,g({type:"request",id:p,method:b($)}),Promise.reject(new Error(i))),S=$=>()=>M($),B=$=>({states:$.states,themes:$.themes,language:$.language,selectedLanguage:$.selectedLanguage,locale:$.locale,userData:$.userData,callService:S("callService"),callWS:S("callWS"),callApi:S("callApi"),fetchWithAuth:S("fetchWithAuth"),connection:Object.freeze({sendMessagePromise:S("connection.sendMessagePromise"),subscribeMessage:S("connection.subscribeMessage"),subscribeEvents:S("connection.subscribeEvents"),sendMessage:S("connection.sendMessage")}),auth:Object.freeze({data:Object.freeze({}),refreshAccessToken:S("auth.refreshAccessToken"),wsUrl:""})});e.customCards=[];let L=()=>{let $=[],T=Array.isArray(e.customCards)?e.customCards:[];for(let C=0;C<T.length&&$.length<100;C+=1){let H=T[C];H&&typeof H=="object"&&$.push({type:b(H.type),name:b(H.name),description:b(H.description)})}g({type:"cards",cards:$})};e.customElements.define=function($,T,C){o($,T,C),g({type:"defined",tag:b($)})};class X extends e.HTMLElement{constructor(){super();let T=this.attachShadow({mode:"open"}),C=n.createElement("style");C.textContent=":host{display:block;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color,#212121);border-radius:var(--ha-card-border-radius,12px);box-shadow:var(--ha-card-box-shadow,none);overflow:hidden;box-sizing:border-box}",T.appendChild(C),T.appendChild(n.createElement("slot"))}}o("ha-card",X);let U=($,T,C)=>{let H;try{H=n.createElement($),typeof H.setConfig=="function"&&H.setConfig(T)}catch(K){E("set_config",K);return}m=H;try{H.hass=C,n.body.appendChild(H)}catch(K){E("mod_error",K);return}g({type:"rendered"})},Se=$=>{c=!0,a=$.token,e.hass=B($.hass),e.setInterval(()=>g({type:"heartbeat"}),1e3);let T=n.createElement("script");T.textContent=String($.modSource);try{n.head.appendChild(T)}catch(H){E("mod_error",H);return}L();let C=String($.tag);if(r.get(C)!==void 0){U(C,$.config,e.hass);return}r.whenDefined(C).then(()=>U(C,$.config,e.hass),H=>E("not_defined",H))};e.onerror=($,T,C,H,K)=>(E("mod_error",K||$),!0),e.addEventListener("unhandledrejection",$=>{typeof $.preventDefault=="function"&&$.preventDefault()});let se=$=>{let T=$.data;if(!(!c||!T||typeof T!="object"||T.token!==a)&&T.type==="hass"&&T.hass&&typeof T.hass=="object"&&(e.hass=B(T.hass),m!==null))try{m.hass=e.hass}catch(C){E("mod_error",C)}};e.addEventListener("message",$=>{if(c||$.source!==e.parent)return;let T=$.data;if(!T||typeof T!="object"||T.type!=="init")return;let C=$.ports;!C||C.length!==1||!C[0]||typeof T.token!="string"||T.token===""||(d=C[0],d.onmessage=se,Se(T))}),t({type:"ready",token:""},"*")}var pu=`(${bb.toString()})(window);`;var wb=1e3,xb=3e3,kb=50,$b=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${au}"></head><body><script>${pu}<\/script></body></html>`;function hu(e){let{modSource:n,tag:t,config:r,onError:o,onReady:i,onBlocked:s}=e,a=nu(r),d=e.timeoutMs??5e3,c=cu(),m=document.createElement("iframe");m.setAttribute("sandbox",su),m.setAttribute("referrerpolicy","no-referrer"),m.setAttribute("allow",""),m.setAttribute("loading","eager"),m.setAttribute("title","Mod preview"),m.srcdoc=$b;let p=new MessageChannel,g=p.port1,b=!1,E=!1,M=!1,S=0,B=e.hass,L=Date.now(),X=0,U=[],Se=[],se=null,$=null,T=j=>b||!E?!1:(g.postMessage(j),!0),C=ou(j=>{if(b||!E)return;let N;try{N=Qo(j,{entityIds:a})}catch{K("mirror_error","state mirror failed");return}try{T({type:"hass",token:c,hass:N})}catch{return}},1e3),H=()=>{if(!b){b=!0,window.removeEventListener("message",yi),g.onmessage=null;for(let j of[p.port1,p.port2])try{j.close()}catch{continue}se!==null&&clearTimeout(se),$!==null&&clearInterval($),se=null,$=null,C.cancel(),m.remove()}},K=(j,N)=>{if(!b){H();try{o({code:j,message:N})}catch{return}}},Bu=()=>{let j,N;try{j=Qo(B,{entityIds:a}),N=ru(r)}catch{K("mirror_error","state mirror failed");return}let Ft=m.contentWindow;if(Ft===null){K("post_failed","sandbox window unavailable");return}E=!0;let jt={type:"init",token:c,modSource:n,tag:t,config:N,hass:j};try{Ft.postMessage(jt,"*",[p.port2])}catch(vi){K("post_failed",vi instanceof Error?vi.message:"post failed")}};function yi(j){if(b)return;let N=m.contentWindow,Ft=j.source;if(N===null||Ft!==N)return;let jt=ti(j.data,"");if(!(jt===null||jt.type!=="ready")){if(E){K("navigated","sandbox frame sent a second ready");return}L=Date.now(),Bu()}}function Uu(j){if(b||!E)return;let N=ti(j.data,c);if(!(N===null||N.type==="ready"))switch(L=Date.now(),N.type){case"heartbeat":return;case"defined":U.length<200&&!U.includes(N.tag)&&U.push(N.tag);return;case"cards":Se=N.cards;return;case"rendered":if(se!==null&&clearTimeout(se),se=null,M)return;M=!0,i!==void 0&&i({tags:[...U],cards:[...Se]});return;case"error":K(N.code,N.message);return;case"request":if(X+=1,X>kb)return;try{T({type:"refused",token:c,id:N.id,error:iu})}catch{return}return}}return m.addEventListener("load",()=>{S+=1,S>1&&K("navigated","sandbox frame navigated")}),typeof n!="string"||n.length>4194304?queueMicrotask(()=>K("too_large","mod source rejected")):ei(t)?(window.addEventListener("message",yi),g.onmessage=Uu,se=setTimeout(()=>K("timeout","mod did not render in time"),d),$=setInterval(()=>{Date.now()-L>xb&&(K("heartbeat_lost","sandbox stopped responding"),s!==void 0&&s())},wb)):queueMicrotask(()=>K("invalid_tag","invalid custom element name")),{element:m,update(j){b||(B=j,E&&C(j))},destroy:H}}var rt=[z,V,_`
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
`];var v={title:"Mods",intro:"Add-ons that change how your dashboard looks: styling, cards, layouts and chrome. Previews run in an isolated frame and nothing is installed from here.",loading:"Loading mods...",loadFailed:"Could not load the mods list.",retry:"Try again",search:"Search mods",searchPlaceholder:"Name or description",filters:"Filter",filterAll:"All",filterInstalled:"Installed",kinds:"Kind",kindAll:"All kinds",kindLabels:{styling:"Styling",cards:"Cards",layout:"Layout",templating:"Templating",chrome:"Chrome"},integrationChip:"Integration",integrationNote:"This is a HACS integration. It acts on your real dashboard and cannot be previewed in the sandbox. Install it through HACS.",empty:"No mods match.",truncated:"The list is incomplete. Narrow the search to find more.",installedChip:"Installed",pinnedChip:"Preview available",stars:e=>`${e} stars`,license:e=>`License: ${e}`,repository:"Repository",openInHacs:"Open in HACS",select:e=>`Preview ${e}`,nothingSelected:"Select a mod to see its preview.",installedNote:"Already in your dashboard resources",installedHint:"This card is already loaded in your dashboard, so it is previewed with the real card helpers.",installedUnavailable:"The real card could not be created here. Check it in the Preview tab or on a dashboard.",unpinned:"Preview unavailable: this mod is not in the pinned set",configLabel:"Your card config (JSON)",configHelp:"Up to 4 KB. The type must be custom: followed by the card tag.",configProblems:{empty:"Enter a card config.",too_large:"The card config is larger than 4 KB.",invalid:"The card config is not valid JSON.",not_object:"The card config must be an object.",no_type:"The card config needs a type such as custom:my-card.",bad_type:"The type must start with custom: followed by a valid card tag."},run:"Show preview",runOwn:"Run my card",advancedTitle:"Advanced: try your own card",noLiveMock:"This mod works on other cards, so it cannot be shown on its own here.",close:"Close",showCard:"Show real card",confirmTitle:"Before running third party code",isolation:lu,disclosure:du,confirm:"Run in sandbox",cancel:"Cancel",fetching:"Fetching the pinned release...",starting:"Starting the sandbox...",running:"Preview running.",reset:"Reset",width:"Width",height:"Height 480 px",widths:{phone:"Phone",tablet:"Tablet",desktop:"Desktop"},stageLabel:"Sandboxed mod preview",errors:{not_pinned:"This mod is not in the pinned set.",hash_mismatch:"The downloaded file does not match the pinned hash, so it was refused.",too_large:"The mod file is too large to preview.",bad_content_type:"The server returned an unexpected content type.",redirect_refused:"The download tried to redirect and was refused.",network:"The network request failed.",timeout:"The request or the mod timed out.",invalid_encoding:"The mod file is not valid text.",not_found:"The mod file was not found.",fetch_failed:"The mod file could not be fetched.",rate_limited:"Too many requests. Wait a moment and try again.",catalog_unavailable:"The mod catalog is unavailable right now.",unauthorized:"You are not allowed to do that.",unknown_command:"This server does not support the Mods tab.",navigated:"The mod tried to navigate the preview frame and was stopped.",heartbeat_lost:"The preview stopped responding and was removed.",mirror_error:"The card state could not be copied into the preview.",mod_error:"The mod failed while loading.",set_config:"The card rejected this config.",unhandled_rejection:"The mod raised an unhandled error.",runtime_error:"The mod raised a runtime error.",not_defined:"The mod did not define that card tag.",invalid_tag:"That is not a valid custom card tag.",post_failed:"The preview frame could not be started.",unknown:"Something went wrong. Try again."},unknownCode:e=>`Something went wrong (${e}). Try again.`};function Xn(e){let n=v.errors[e];return n||(e==="unknown"?v.errors.unknown:v.unknownCode(e))}var mu="2024-01-01T12:00:00+00:00",Eb={"light.mock_lamp":{entity_id:"light.mock_lamp",state:"on",attributes:{friendly_name:"Living room lamp",brightness:180,icon:"mdi:lamp"}},"switch.mock_fan":{entity_id:"switch.mock_fan",state:"off",attributes:{friendly_name:"Bedroom fan",icon:"mdi:fan"}},"sensor.mock_temperature":{entity_id:"sensor.mock_temperature",state:"21.5",attributes:{friendly_name:"Room temperature",unit_of_measurement:"C",device_class:"temperature"}},"climate.mock_thermostat":{entity_id:"climate.mock_thermostat",state:"heat",attributes:{friendly_name:"Thermostat",current_temperature:20.5,temperature:22,hvac_action:"heating",hvac_modes:["off","heat","cool"]}},"cover.mock_blind":{entity_id:"cover.mock_blind",state:"open",attributes:{friendly_name:"Window blind",icon:"mdi:blinds"}}},ot=["light.mock_lamp","switch.mock_fan","sensor.mock_temperature"],ni={styling:{tag:null,config:{type:"entities",title:"Example card",entities:ot,card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An entities card with three example rows. This mod restyles cards like this one."},cards:{tag:null,config:{type:"entities",title:"Example card",entities:ot},summary:"An entities card with three example rows."},layout:{tag:null,config:{type:"vertical-stack",cards:[{type:"entity",entity:"sensor.mock_temperature"},{type:"entities",entities:ot}]},summary:"Two example cards arranged together. This mod controls how cards are laid out."},templating:{tag:null,config:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"},summary:"One example card. This mod lets you reuse a card design in many places."},chrome:{tag:null,config:{type:"entities",title:"Example dashboard",entities:ot},summary:"An example dashboard. This mod changes the header and sidebar around your cards."}},fu={"piitaya/lovelace-mushroom":{tag:"mushroom-entity-card",config:{type:"custom:mushroom-entity-card",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Mushroom entity card for an example lamp."},"custom-cards/button-card":{tag:"button-card",config:{type:"custom:button-card",entity:"light.mock_lamp",name:"Living room lamp",show_state:!0},summary:"A button card for an example lamp."},"Clooos/Bubble-Card":{tag:"bubble-card",config:{type:"custom:bubble-card",card_type:"button",entity:"light.mock_lamp",name:"Living room lamp"},summary:"A Bubble button for an example lamp."},"jcwillox/lovelace-paper-buttons-row":{tag:"paper-buttons-row",config:{type:"custom:paper-buttons-row",buttons:[{entity:"light.mock_lamp"},{entity:"switch.mock_fan"},{entity:"cover.mock_blind"}]},summary:"A row of three example buttons."},"ofekashery/vertical-stack-in-card":{tag:null,config:{type:"custom:vertical-stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:ot}]},summary:"Two example cards merged into one panel."},"custom-cards/stack-in-card":{tag:null,config:{type:"custom:stack-in-card",cards:[{type:"entity",entity:"climate.mock_thermostat"},{type:"entities",entities:ot}]},summary:"Two example cards merged into one panel."},"ownbee/bootstrap-grid-card":{tag:null,config:{type:"custom:bootstrap-grid-card",cards:[{type:"row",cards:[{type:"entity",entity:"light.mock_lamp"},{type:"entity",entity:"switch.mock_fan"}]}]},summary:"Two example cards side by side in a grid."},"iantrich/config-template-card":{tag:null,config:{type:"custom:config-template-card",entities:["sensor.mock_temperature"],card:{type:"entity",entity:"sensor.mock_temperature",name:"Example reading"}},summary:"An example card whose settings come from a template."},"thomasloven/lovelace-card-mod":{...ni.styling,config:{type:"thermostat",entity:"climate.mock_thermostat",card_mod:{style:"ha-card { border-radius: 24px; }"}},summary:"An example thermostat card with rounded corners applied by this mod."}};function Yn(e){return(Object.prototype.hasOwnProperty.call(fu,e.full_name)?fu[e.full_name]:null)??ni[e.kind]??ni.cards}var _b=["language","locale","themes","selectedTheme","localize"];function ri(e){let n=e&&typeof e=="object"?e:{},t={};for(let i of _b)n[i]!==void 0&&(t[i]=n[i]);let r={};for(let[i,s]of Object.entries(Eb))r[i]={...s,attributes:{...s.attributes},last_changed:mu,last_updated:mu};let o=async()=>{};return{...t,states:r,entities:{},devices:{},areas:{},user:{id:"mock",name:"Guest",is_admin:!1},callService:o,callWS:o}}var Tb=[["phone",390],["tablet",768],["desktop",1024]],Sb=480,gu=new Set;function bu(e){return`${e.full_name.toLowerCase()}@${e.tag??""}`}var Ab=async(e,n)=>{let t=await Qt();return en(t,n)};function ii(e,n){let t=zc(e.full_name),r=n?Wc(e.full_name,e.category):null;return l`
    ${t?l`<a class="link" href=${t} target="_blank" rel="noopener noreferrer">${v.repository}</a>`:u}
    ${r?l`<a class="link" id="hacs-link" href=${r} target="_blank" rel="noopener noreferrer">${v.openInHacs}</a>`:u}
  `}var oi=class extends A{constructor(){super(...arguments);this.mod=null;this.createSandbox=hu;this.cardFactory=Ab;this.configText="";this.problem="";this.phase="idle";this.failure="";this.width=390;this.installedFailed=!1;this.sandbox=null;this.card=null;this.token=0;this.own=!1;this.pending=null;this.focusTarget=null;this.onConfigInput=t=>{this.configText=t.target.value,this.problem=""};this.onRun=()=>{this.begin(this.mockTarget())};this.onRunOwn=()=>{let t=Yo(this.configText);if(!t.ok){this.problem=t.problem;return}this.begin(this.ownTarget())};this.onConfirm=()=>{this.mod&&gu.add(bu(this.mod)),this.start()};this.onCancel=()=>{this.focusTarget="run",this.phase="idle"};this.onReset=()=>{this.stop(),this.focusTarget="run",this.phase="idle",this.failure=""}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1},createSandbox:{attribute:!1},cardFactory:{attribute:!1},configText:{state:!0},problem:{state:!0},phase:{state:!0},failure:{state:!0},width:{state:!0},installedFailed:{state:!0}}}static{this.styles=rt}disconnectedCallback(){super.disconnectedCallback(),this.stop()}willUpdate(t){t.has("mod")&&(this.stop(),this.phase="idle",this.problem="",this.failure="",this.installedFailed=!1,this.configText=this.mod?qc(this.mod):"")}mockTarget(){let t=this.mod;if(!t||!this.hass)return null;let r=Yn(t);return{tag:r.tag??"",config:r.config,hass:ri(this.hass)}}ownTarget(){let t=Yo(this.configText);return!t.ok||!this.hass?null:{tag:t.tag,config:t.config,hass:this.hass}}updated(t){t.has("mod")&&this.mod?.installed&&this.mod.category==="plugin"&&this.showInstalled(this.mockTarget()),t.has("hass")&&this.hass&&this.sandbox&&this.sandbox.update(this.own?this.hass:ri(this.hass));let r=this.stage();r&&this.sandbox&&this.sandbox.element.parentNode!==r&&r.append(this.sandbox.element),this.sandbox&&this.sizeFrame(),this.applyFocus()}applyFocus(){let t=this.focusTarget;if(!t)return;let r=this.renderRoot.querySelector(t==="confirm"?"#confirm-h":"#run, #run-own");r&&(this.focusTarget=null,r.focus())}stage(){return this.renderRoot.querySelector(".stage")}sizeFrame(){let t=this.sandbox?.element;t&&(t.style.width=`${this.width}px`,t.style.height=`${Sb}px`,t.style.maxWidth="100%",t.style.border="0")}stop(){this.token+=1,this.sandbox?.destroy(),this.sandbox=null,this.card?.remove(),this.card=null}async showInstalled(t){if(!t)return;this.own=t.hass===this.hass;let r=++this.token;this.card?.remove(),this.card=null,this.installedFailed=!1;let o;try{o=await this.cardFactory(t.hass,t.config)}catch{r===this.token&&(this.installedFailed=!0);return}r===this.token&&(o.hass=t.hass,this.card=o,await this.updateComplete,this.stage()?.append(o))}begin(t){t&&(this.pending=t,this.problem="",this.mod&&gu.has(bu(this.mod))?this.start():(this.focusTarget="confirm",this.phase="confirm"))}fail(t){this.stop(),this.failure=Xn(t),this.phase="error"}async start(){let t=this.mod,r=this.hass,o=this.pending;if(!t||!r||!o)return;this.own=o.hass===r,this.stop();let i=this.token;this.phase="fetching";let s;try{s=(await Kc(r,t.full_name)).source}catch(a){i===this.token&&this.fail(q(a));return}i===this.token&&(this.phase="starting",this.sandbox=this.createSandbox({modSource:s,tag:o.tag,config:o.config,hass:o.hass,onReady:()=>{i===this.token&&(this.phase="running")},onError:a=>{i===this.token&&this.fail(a.code)}}))}renderAdvanced(t,r,o){return l`
      <details class="advanced" id="advanced">
        <summary>${v.advancedTitle}</summary>
        <label class="field">
          <span>${v.configLabel}</span>
          <textarea
            id="config"
            rows="5"
            spellcheck="false"
            .value=${this.configText}
            @input=${this.onConfigInput}
          ></textarea>
        </label>
        <p class="muted">${v.configHelp}</p>
        ${this.problem?l`<p class="notice error" id="config-problem" role="alert">${v.configProblems[this.problem]??this.problem}</p>`:u}
        <div class="tools">
          <button class="btn" type="button" id=${o} aria-label=${t} @click=${r}>${t}</button>
        </div>
      </details>
    `}renderWidths(){return l`
      <div class="seg" role="group" aria-label=${v.width}>
        ${Tb.map(([t,r])=>l`<button
            type="button"
            data-width=${r}
            aria-pressed=${this.width===r?"true":"false"}
            @click=${()=>{this.width=r}}
          >
            ${v.widths[t]} ${r}
          </button>`)}
      </div>
      <span class="muted">${v.height}</span>
    `}renderSandbox(){let t=this.phase==="fetching"||this.phase==="starting";if(this.phase==="idle"){let r=this.mod?Yn(this.mod):null;return l`
        <p class="muted" id="mock-summary">${r?.summary}</p>
        ${r?.tag?l`<div class="tools"><button class="btn primary" type="button" id="run" @click=${this.onRun}>${v.run}</button></div>`:l`<p class="notice" id="no-mock">${v.noLiveMock}</p>`}
        ${this.renderAdvanced(v.runOwn,this.onRunOwn,"run-own")}
      `}return this.phase==="confirm"?l`
        <section class="confirm" role="region" aria-labelledby="confirm-h">
          <h3 id="confirm-h" tabindex="-1">${v.confirmTitle}</h3>
          <p id="confirm-status" role="status" aria-live="polite">${this.problem}</p>
          <p id="isolation">${v.isolation}</p>
          <p id="disclosure">${v.disclosure}</p>
          <div class="tools">
            <button class="btn primary" type="button" id="confirm" @click=${this.onConfirm}>${v.confirm}</button>
            <button class="btn" type="button" id="cancel" @click=${this.onCancel}>${v.cancel}</button>
          </div>
        </section>
      `:this.phase==="error"?l`
        <p class="notice error" id="failure" role="status" aria-live="polite">${this.failure}</p>
        <div class="tools"><button class="btn" type="button" id="reset" @click=${this.onReset}>${v.reset}</button></div>
      `:l`
      <p class="muted" role="status">${t?this.phase==="fetching"?v.fetching:v.starting:v.running}</p>
      <div class="tools">${this.renderWidths()}
        <button class="btn" type="button" id="reset" @click=${this.onReset}>${v.reset}</button>
      </div>
      <div class="stage" role="region" aria-label=${v.stageLabel}></div>
    `}renderBody(t){return t.category==="integration"?l`<p class="notice" id="integration-note">${v.integrationNote}</p>`:t.installed?l`
        <p class="notice" id="installed-note">${v.installedNote}</p>
        <p class="muted">${v.installedHint}</p>
        ${this.installedFailed?l`<p class="notice error" id="installed-failed" role="alert">${v.installedUnavailable}</p>`:u}
        <p class="muted" id="mock-summary">${this.mod?Yn(this.mod).summary:""}</p>
        <div class="stage" role="region" aria-label=${v.stageLabel}></div>
        ${this.renderAdvanced(v.showCard,()=>void this.showInstalled(this.ownTarget()),"show-card")}
      `:Vc(t)?this.renderSandbox():l`<p class="notice" id="unpinned">${v.unpinned}</p>`}render(){let t=this.mod;return t?l`
      ${t.pinned&&t.license?l`<p class="muted" id="license">${v.license(t.license)}</p>`:u}
      <p class="links">${ii(t,!0)}</p>
      ${this.renderBody(t)}
    `:l`<p class="muted">${v.nothingSelected}</p>`}};customElements.get("hats-lite-mods-preview")||customElements.define("hats-lite-mods-preview",oi);var yu='a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',Mb=_`
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
`;function Cb(e){let n=e.activeElement;for(;n?.shadowRoot?.activeElement;)n=n.shadowRoot.activeElement;return n}var si=class extends A{constructor(){super(...arguments);this.mod=null;this.onKey=t=>{if(t.key==="Escape"){t.stopPropagation(),t.preventDefault(),this.close();return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=Cb(document),i=r.findIndex(a=>a===o),s=r.length-1;t.shiftKey&&i<=0?(t.preventDefault(),r[s].focus()):!t.shiftKey&&(i===-1||i===s)&&(t.preventDefault(),r[0].focus())};this.downOnBackdrop=!1;this.onBackdropDown=t=>{this.downOnBackdrop=t.target===t.currentTarget};this.onBackdrop=t=>{let r=this.downOnBackdrop;this.downOnBackdrop=!1,r&&t.target===t.currentTarget&&this.close()}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1}}}static{this.styles=[rt,Mb]}firstUpdated(){this.renderRoot.querySelector("#close")?.focus()}close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}focusables(){let t=Array.from(this.renderRoot.querySelectorAll(yu)),r=this.renderRoot.querySelector("hats-lite-mods-preview")?.shadowRoot,o=r?Array.from(r.querySelectorAll(yu)):[];return[...t,...o].filter(i=>!i.closest("details:not([open])")||i.tagName==="SUMMARY")}render(){let t=this.mod;return t?l`
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
            <button class="btn" type="button" id="close" aria-label=${v.close} @click=${()=>this.close()}>${v.close}</button>
          </div>
          <div class="body">
            <hats-lite-mods-preview .hass=${this.hass} .mod=${t}></hats-lite-mods-preview>
          </div>
        </div>
      </div>
    `:l``}};customElements.get("hats-lite-mods-dialog")||customElements.define("hats-lite-mods-dialog",si);var Pb=[["all",v.filterAll],["installed",v.filterInstalled]],ai=class extends A{constructor(){super(...arguments);this.active=!0;this.mods=[];this.truncated=!1;this.status="idle";this.failure="";this.query="";this.filter="all";this.kind="all";this.selected="";this.closeDialog=()=>{let t=this.selected;this.selected="",this.updateComplete.then(()=>{Array.from(this.renderRoot.querySelectorAll("[data-name]")).find(o=>o.dataset.name===t)?.querySelector(".pick")?.focus()})}}static{this.properties={hass:{attribute:!1},active:{type:Boolean},mods:{state:!0},truncated:{state:!0},status:{state:!0},failure:{state:!0},query:{state:!0},filter:{state:!0},kind:{state:!0},selected:{state:!0}}}static{this.styles=rt}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load()}async load(){let t=this.hass;if(t){this.status="loading";try{let r=await Uc(t);this.mods=r.mods,this.truncated=r.truncated,this.status="ready"}catch(r){this.failure=Xn(q(r)),this.status="error"}}}renderItem(t){return l`
      <li class="mod" data-name=${t.full_name}>
        <div class="head">
          <button
            class="pick"
            type="button"
            aria-haspopup="dialog"
            aria-label=${v.select(t.full_name)}
            @click=${()=>{this.selected=t.full_name}}
          >
            ${t.full_name}
          </button>
          <span class="chip">${v.kindLabels[t.kind]??t.kind}</span>
          ${t.category==="integration"?l`<span class="chip">${v.integrationChip}</span>`:u}
          ${t.installed?l`<span class="chip ok">${v.installedChip}</span>`:u}
          ${t.pinned?l`<span class="chip">${v.pinnedChip}</span>`:u}
          ${t.stars>0?l`<span class="chip">${v.stars(t.stars)}</span>`:u}
        </div>
        ${t.description?l`<p class="desc">${t.description}</p>`:u}
        <p class="links">${ii(t,!1)}</p>
      </li>
    `}renderList(){let t=Gc(this.mods,this.query,this.filter,this.kind),r=Wo.filter(i=>this.mods.some(s=>s.kind===i)),o=[["all",v.kindAll],...r.map(i=>[i,v.kindLabels[i]])];return l`
      <div class="toolbar">
        <label class="field">
          <span>${v.search}</span>
          <input
            type="search"
            id="search"
            placeholder=${v.searchPlaceholder}
            .value=${this.query}
            @input=${i=>{this.query=i.target.value}}
          />
        </label>
        <div class="seg" role="group" aria-label=${v.filters}>
          ${Pb.map(([i,s])=>l`<button
              type="button"
              data-filter=${i}
              aria-pressed=${this.filter===i?"true":"false"}
              @click=${()=>{this.filter=i}}
            >
              ${s}
            </button>`)}
        </div>
      </div>
      <div class="seg kinds" role="group" aria-label=${v.kinds} data-group="kind">
        ${o.map(([i,s])=>l`<button
            type="button"
            data-kind=${i}
            aria-pressed=${this.kind===i?"true":"false"}
            @click=${()=>{this.kind=i}}
          >
            ${s}
          </button>`)}
      </div>
      ${this.truncated?l`<p class="notice" id="truncated" role="status">${v.truncated}</p>`:u}
      ${t.length===0?l`<p class="muted" id="empty">${v.empty}</p>`:l`<ul class="mods">${t.map(i=>this.renderItem(i))}</ul>`}
    `}render(){if(this.status==="idle"||this.status==="loading")return l`<p class="muted" role="status">${v.loading}</p>`;if(this.status==="error")return l`<p class="notice error" role="alert">${this.failure||v.loadFailed}</p>
        <button class="btn" type="button" id="retry" @click=${()=>void this.load()}>${v.retry}</button>`;let t=this.mods.find(r=>r.full_name===this.selected)??null;return l`
      <p class="muted">${v.intro}</p>
      <section class="card" aria-labelledby="mods-h">
        <h2 id="mods-h">${v.title}</h2>
        ${this.renderList()}
      </section>
      ${this.active&&t?l`<hats-lite-mods-dialog .hass=${this.hass} .mod=${t} @close=${this.closeDialog}></hats-lite-mods-dialog>`:u}
    `}};customElements.get("hats-lite-mods")||customElements.define("hats-lite-mods",ai);function Zn(e,n,t){let r=e?.themes?.themes;if(typeof n!="string"||!r||!Object.prototype.hasOwnProperty.call(r,n))return null;let o=r[n];if(!o||typeof o!="object")return null;let i=ne(o),a=(typeof t=="boolean"?t:e?.themes?.darkMode===!0)?"dark":"light";return{mode:a,candidate:{name:n,vars:Z(i,a),entry:i,installed:!0,canApply:!0}}}function vu(e,n,t,r,o){if(!e||!Object.prototype.hasOwnProperty.call(n,t))return null;let i=ne(n[t]),s=r?.themes?.darkMode?"dark":"light",a=o.includes(t),d=r?.themes?.themes,c=d&&Object.prototype.hasOwnProperty.call(d,t)?d[t]:void 0,m=a&&!e.installed&&rs(c,i);return{name:t,fullName:e.full_name,vars:Z(i,s),entry:i,installed:a,nameCollision:m,repoUrl:ss(e.full_name),canApply:a&&!m}}function li(e,n){return e.installed===n.installed&&e.nameCollision===n.nameCollision&&e.canApply===n.canApply&&JSON.stringify(e.vars)===JSON.stringify(n.vars)}function wu(e,n){return!e||!n||n.installed||!e.hacs_id?null:{fullName:e.full_name,hacsId:e.hacs_id}}function xu(e,n){return!e||!n||!n.installed||n.nameCollision||!e.installed||!e.hacs_id?null:{fullName:e.full_name,hacsId:e.hacs_id}}function ku(e,n,t){let r=t==="dark"?!0:t==="light"?!1:void 0,o=Zn(e,n.name,r)?.candidate??null;return o&&li(n,o)?n:o}var Rb=150,Jn=class{constructor(n){this.options=n;this.list=[];this.loaded=-1;this.index=-1;this.error="";this.token=0}start(n,t){this.cancel();let r=n.findIndex(o=>o.full_name===t.full_name);this.list=r<0?[t]:[...n],this.loaded=this.index=Math.max(r,0),this.error="",this.options.onChange()}clear(){this.cancel(),this.list=[],this.loaded=this.index=-1,this.error="",this.options.onChange()}cancel(){this.token+=1,this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}model(){let n=this.list[this.index];return n?{index:this.index,total:this.list.length,name:n.full_name,pending:this.index!==this.loaded,error:this.error}:null}move(n){let t=We(this.index,this.list.length,n);if(t!==null){if(this.cancel(),this.index=t,this.error="",t!==this.loaded){let r=this.token;this.timer=setTimeout(()=>void this.load(r),Rb)}this.options.onChange()}}async load(n){this.timer=void 0;let t=this.list[this.index],r=this.index;try{let o=await this.options.open(t);if(n!==this.token)return;this.loaded=r,this.options.apply(o)}catch{if(n!==this.token)return;this.index=this.loaded,this.error=f.navFailed.replace("{name}",t.full_name)}this.options.onChange()}};var pi={r:0,g:0,b:0,a:1},tr={r:255,g:255,b:255,a:1},_u=()=>({...pi}),Tu=()=>({...tr}),_e=(e,n,t)=>Math.min(t,Math.max(n,e));function di(e){let n=e.trim();return n==="none"?0:n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n)}function Qn(e){if(e===void 0)return 1;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?_e(t,0,1):1}function Db(e){if(!/^[0-9a-f]+$/i.test(e)||![3,4,6,8].includes(e.length))return null;let n=e.length<=4?e.replace(/./g,r=>r+r):e,t=r=>parseInt(n.slice(r,r+2),16);return{r:t(0),g:t(2),b:t(4),a:n.length===8?t(6)/255:1}}function Su(e){return e.replace(/\s*\/\s*/g," / ").split(/[\s,]+/).filter(n=>n!=="")}function Ob(e){let n=Su(e),t=n.indexOf("/");return t>=0?{values:n.slice(0,t),alpha:n[t+1]}:{values:n.slice(0,3),alpha:n[3]}}function $u(e){let n=e.trim(),t=parseFloat(n);return n.endsWith("turn")?t*360:n.endsWith("rad")?t*180/Math.PI:n.endsWith("grad")?t*.9:t}function Ib(e,n,t){let r=(e%360+360)%360,o=a=>(a+r/30)%12,i=n*Math.min(t,1-t),s=a=>t-i*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[s(0)*255,s(8)*255,s(4)*255]}function ci(e){let n=_e(e,0,1);return n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055}function Lb(e,n,t){let r=e+.3963377774*n+.2158037573*t,o=e-.1055613458*n-.0638541728*t,i=e-.0894841775*n-1.291485548*t,[s,a,d]=[r**3,o**3,i**3],c=[4.0767416621*s-3.3077115913*a+.2309699292*d,-1.2684380046*s+2.6097574011*a-.3413193965*d,-.0041960863*s-.7034186147*a+1.707614701*d];return[ci(c[0])*255,ci(c[1])*255,ci(c[2])*255]}function Hb(e){let n=e.trim();return n.endsWith("%")?parseFloat(n)/100:parseFloat(n)}function Nb(e,n){if(e==="color"){let[o,...i]=Su(n.replace(/\/.*$/,""));if(o!=="srgb"||i.length!==3)return null;let[s,a,d]=i.map(c=>(c.endsWith("%")?parseFloat(c)/100:parseFloat(c))*255);return{r:s,g:a,b:d,a:Qn(n.split("/")[1])}}let{values:t,alpha:r}=Ob(n);if(t.length<3)return null;if(e==="rgb"||e==="rgba")return{r:di(t[0]),g:di(t[1]),b:di(t[2]),a:Qn(r)};if(e==="hsl"||e==="hsla"){let[o,i,s]=Ib($u(t[0]),_e(parseFloat(t[1])/100,0,1),_e(parseFloat(t[2])/100,0,1));return{r:o,g:i,b:s,a:Qn(r)}}if(e==="oklab"||e==="oklch"){let o=Hb(t[0]),i=parseFloat(t[1]),s=parseFloat(t[2]);if(e==="oklch"){let m=parseFloat(t[1]),p=$u(t[2])*Math.PI/180;i=m*Math.cos(p),s=m*Math.sin(p)}let[a,d,c]=Lb(o,i,s);return{r:a,g:d,b:c,a:Qn(r)}}return null}function He(e){let n=(e??"").trim().toLowerCase();if(n==="")return null;if(n==="transparent")return{r:0,g:0,b:0,a:0};if(n.startsWith("#"))return Db(n.slice(1));let t=/^([a-z]+)\(([^)]*)\)$/.exec(n);if(!t)return null;let r=Nb(t[1],t[2]);return!r||![r.r,r.g,r.b,r.a].every(Number.isFinite)?null:{r:_e(r.r,0,255),g:_e(r.g,0,255),b:_e(r.b,0,255),a:r.a}}function pe(e,n){if(e.a>=1)return e;let t=e.a;return{r:e.r*t+n.r*(1-t),g:e.g*t+n.g*(1-t),b:e.b*t+n.b*(1-t),a:1}}function hi(e,n,t){return{r:e.r+(n.r-e.r)*t,g:e.g+(n.g-e.g)*t,b:e.b+(n.b-e.b)*t,a:1}}function ui(e){let n=e/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function it(e){return .2126*ui(e.r)+.7152*ui(e.g)+.0722*ui(e.b)}function Au(e,n){let t=it(e),r=it(n);return(Math.max(t,r)+.05)/(Math.min(t,r)+.05)}function Ht(e,n){return n.length===0?1/0:Math.min(...n.map(t=>Au(pe(e,t),t)))}function er(e){let n=t=>Math.round(_e(t,0,255)).toString(16).padStart(2,"0");return`#${n(e.r)}${n(e.g)}${n(e.b)}`}function mi(e){return Ht(pi,e)>=Ht(tr,e)?"#000000":"#ffffff"}function Mu(e,n,t=4.5){if(n&&e.length>0){let r=pe(n,e[0]);if(e.every(o=>Au(r,o)>=t))return er(r)}return mi(e)}function Eu(e,n,t,r){let o=e,i=Ht(e,t);for(let s=1;s<=50;s+=1){let a=hi(e,n,s/50),d=Ht(a,t);if(d>=r)return{found:a,best:a,bestRatio:d};d>i&&(o=a,i=d)}return{found:null,best:o,bestRatio:i}}function Cu(e,n,t){if(Ht(e,n)>=t)return null;let r=pe(e,n[0]??tr),o=Eu(r,pi,n,t),i=Eu(r,tr,n,t);if(o.found&&i.found){let s=Math.abs(it(o.found)-it(r)),a=Math.abs(it(i.found)-it(r));return er(s<=a?o.found:i.found)}return o.found||i.found?er(o.found??i.found):er(o.bestRatio>=i.bestRatio?o.best:i.best)}var fi={bg:"var(--hl-src-bg)",surface:"var(--hl-src-surface)",raised:"var(--hl-src-raised)",text:"var(--hl-src-text)",muted:"var(--hl-src-muted)",line:"var(--hl-src-line)",accent:"var(--hl-src-accent)",accentInk:"var(--hl-src-accent-ink)",ok:"var(--hl-src-ok)",warn:"var(--hl-src-warn)"},gi=["--hl-on-accent","--hl-text-ink","--hl-muted-ink","--hl-bg-text-ink","--hl-bg-muted-ink","--hl-ok-ink","--hl-warn-ink","--hl-accent-text-ink","--hl-edge-ink","--hl-focus-ink"],Te=4.5,Pu=3;function Ru(){return Object.fromEntries(gi.map(e=>[e,null]))}function nr(e){let n=He(e);return n&&n.a>0?n:null}function Du(e){let n=e.dark?_u():Tu(),t=nr(e.accent),r=!t&&e.accent!==""&&He(e.accent)===null;if(!t&&!r)return Ru();let o=nr(e.bg),i=o?pe(o,n):null,s=i??n,a=nr(e.surface),d=nr(e.raised),c=a?pe(a,s):s,m=d?pe(d,c):c,p=[c,m],g=[i??c],b=[...p,...i?[i]:[]],E=t?hi(c,pe(t,c),.22):c,M=Ru();if(t){let B=b.map(L=>pe(t,L));M["--hl-on-accent"]=Mu(B,He(e.accentInk),Te)}let S=(B,L,X,U)=>{let Se=He(L);Se?M[B]=Cu(Se,X,U):M[B]=L===""?null:mi(X)};return S("--hl-text-ink",e.text,[...b,E],Te),S("--hl-muted-ink",e.muted,b,Te),S("--hl-bg-text-ink",e.text,g,Te),S("--hl-bg-muted-ink",e.muted,g,Te),S("--hl-ok-ink",e.ok,p,Te),S("--hl-warn-ink",e.warn,p,Te),S("--hl-accent-text-ink",e.accent,b,Te),S("--hl-edge-ink",e.line,b,Pu),S("--hl-focus-ink",e.accent,b,Pu),M}function Fb(e){let n=e?.themes;return`${e?.selectedTheme?.theme??n?.theme??""}|${n?.darkMode===!1?"light":"dark"}`}var jb=/^(rgba?\(|color\(\s*srgb[\s)])/i,Nt;function Bb(){if(Nt!==void 0)return Nt;try{Nt=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})}catch{Nt=null}return Nt}var Ub="unparseable";function Ou(e,n,t){return e.clearRect(0,0,1,1),e.fillStyle=n,e.fillStyle=t,e.fillRect(0,0,1,1),Array.from(e.getImageData(0,0,1,1).data)}function Kb(e){if(e==="transparent")return"";if(e===""||jb.test(e))return e;let n=Bb();if(!n)return e;try{let[t,r,o,i]=Ou(n,"#000000",e);return Ou(n,"#ffffff",e).some((a,d)=>a!==[t,r,o,i][d])?Ub:i===0?"":`rgba(${t}, ${r}, ${o}, ${Math.round(i/255*1e3)/1e3})`}catch{return e}}var rr=class{constructor(n){this.host=n;this.probe=null;this.observer=null;this.media=null;this.frame=0;this.signature="";this.applied="";this.onScheme=()=>this.schedule();n.addController(this)}hostConnected(){this.observer=new MutationObserver(()=>this.schedule()),this.observer.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),this.media=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):null,this.media?.addEventListener("change",this.onScheme),this.schedule()}hostDisconnected(){this.observer?.disconnect(),this.observer=null,this.media?.removeEventListener("change",this.onScheme),this.media=null,this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.probe?.remove(),this.probe=null,this.applied=""}hostUpdated(){let n=Fb(this.host.hass);n!==this.signature&&(this.signature=n,this.schedule())}refresh(){this.schedule()}schedule(){this.frame||!this.host.isConnected||(this.frame=requestAnimationFrame(()=>{this.frame=0,this.run()}))}ensureProbe(){if(this.probe?.isConnected)return this.probe;let n=document.createElement("span");n.setAttribute("aria-hidden","true"),n.style.display="none";for(let t=0;t<Object.keys(fi).length;t+=1)n.appendChild(document.createElement("i"));return this.host.renderRoot.appendChild(n),this.probe=n,n}readAll(n){let t=Object.entries(fi),r=Array.from(n.children);return t.forEach(([,o],i)=>{r[i].style.backgroundColor="",r[i].style.backgroundColor=o}),Object.fromEntries(t.map(([o],i)=>{let s=Kb(getComputedStyle(r[i]).backgroundColor.trim()),a=He(s);return[o,a&&a.a===0?"":s]}))}run(){if(!this.host.isConnected)return;let n=this.ensureProbe(),t={dark:this.host.hass?.themes?.darkMode!==!1,...this.readAll(n)},r=JSON.stringify(t);if(r===this.applied)return;this.applied=r;let o=Du(t);for(let i of gi){let s=o[i];s?this.host.style.setProperty(i,s):this.host.style.removeProperty(i)}}};function or(e,n){if(!e||typeof e!="object")return"";let t=e[n];return typeof t=="string"?t:""}function Iu(e,n,t){if(!e||typeof e!="object")return"";let r=e,o=r.modes,i=t?["dark","light"]:["light","dark"];return or(o?.[i[0]],n)||or(r,n)||or(r.vars,n)||or(o?.[i[1]],n)}function Lu(e){let n=e?.selectedTheme?.theme??e?.themes?.theme??"default",t=e?.themes?.themes,o=t&&Object.prototype.hasOwnProperty.call(t,n)?t[n]:void 0,i=e?.themes?.darkMode!==!1;return{name:n,primary:Iu(o,"primary-color",i),accent:Iu(o,"accent-color",i)}}var Hu=[z,V,_`
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
`,hd];var ie={shell:{title:"Themes",tabs:{browse:"Gallery",preview:"Preview",designer:"Designer",people:"People",mods:"Mods"},tabList:"HATS Lite sections",inUse:"In use",menu:"Open navigation menu",fileTheme:"Theme in file",fileLoading:"Loading theme...",fileError:"Could not load this theme."},browse:w,preview:f,designer:y};var Nu=l`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;function Fu(e,n,t){switch(e){case"ArrowRight":return(n+1)%t;case"ArrowLeft":return(n-1+t)%t;case"Home":return 0;case"End":return t-1;default:return null}}function zb(e){return e==="loading"?l`<span class="file-status" role="status">${ie.shell.fileLoading}</span>`:e==="error"?l`<span class="file-status error" role="alert">${ie.shell.fileError}</span>`:u}function ju(e,n,t,r){return e.length<2?u:l`
    <label class="file-theme">
      ${ie.shell.fileTheme}
      <select @change=${r}>
        ${e.map(o=>l`<option value=${o} ?selected=${o===n}>${o}</option>`)}
      </select>
      ${zb(t)}
    </label>
  `}var Vb=["browse","preview","designer","people","mods"],bi=class extends A{constructor(){super(...arguments);this.narrow=!1;this.tab="browse";this.entry=null;this.fileThemes={};this.fileNames=[];this.fileStatus="";this.chosenName="";this.candidate=null;this.peopleOk=!0;this.modsOk=!1;this.ink=new rr(this);this.probed=!1;this.installedNames=[];this.bundles=new Ue;this.known=new je;this.pickToken=0;this.rendered=new Set(["browse"]);this.onTabKey=t=>{let r=this.tabs,o=Fu(t.key,r.indexOf(this.tab),r.length);if(o===null)return;t.preventDefault();let i=r[o];this.select(i),this.focusTab(i)};this.onMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};this.navigator=new Jn({open:t=>{let r=this.gallery();return r?r.openEntry(r.entries.find(o=>o.full_name===t.full_name)??t):Promise.reject(new Error("gallery missing"))},apply:t=>this.showBundle(t),onChange:()=>this.requestUpdate()});this.onThemeSelected=t=>{let r=t.detail;if(Object.keys(r?.themes??{}).length===0)return;let o=this.gallery();this.previewMode=r.mode??o?.mode,this.navigator.start(o?.visibleEntries()??[],r.entry),this.showBundle(r),this.select("preview"),this.focusTab("preview")};this.onPreviewTheme=t=>{let r=t.detail,o=Zn(this.hass,r?.theme,r?.dark);o&&(this.navigator.clear(),this.pickToken+=1,this.fileStatus="",this.entry=null,this.fileThemes={},this.fileNames=[],this.chosenName=o.candidate.name,this.candidate=o.candidate,this.previewMode=o.mode,this.select("preview"),this.focusTab("preview"))};this.onNav=t=>{let r=t.detail?.direction;(r===1||r===-1)&&this.navigator.move(r)};this.onInstalled=async t=>{let r=t.detail?.fullName,i=(await this.gallery()?.refreshCatalog())?.find(s=>s.full_name===r);i&&this.entry?.full_name===r&&(this.entry=i,this.refreshCandidate())};this.onPreviewMode=t=>{let r=t.detail?.mode;r&&(this.previewMode=r)};this.onFileThemeChange=t=>{let r=t.target.value;if(Object.prototype.hasOwnProperty.call(this.fileThemes,r)){this.pickToken+=1,this.fileStatus="",this.setCandidate(r);return}this.fetchFileTheme(r)};this.onThemeSaved=t=>{let r=t.detail;if(typeof r?.name!="string")return;let o=this.hass?.themes?.darkMode;this.dispatchEvent(new CustomEvent("settheme",{bubbles:!0,composed:!0,detail:Fn(o===void 0?{theme:r.name}:{theme:r.name,dark:o})})),this.select("preview")}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0},entry:{state:!0},fileThemes:{state:!0},fileNames:{state:!0},fileStatus:{state:!0},chosenName:{state:!0},candidate:{state:!0},previewMode:{state:!0},peopleOk:{state:!0},modsOk:{state:!0}}}static{this.styles=Hu}tabId(t){return`tab-${t}`}panelId(t){return`panel-${t}`}get tabs(){return Vb.filter(t=>t==="people"?this.peopleOk:t==="mods"?this.modsOk:!0)}select(t){this.rendered.add(t),this.tab=t}async focusTab(t){await this.updateComplete,this.renderRoot.querySelector(`#${this.tabId(t)}`)?.focus()}disconnectedCallback(){super.disconnectedCallback(),this.navigator.clear()}willUpdate(t){if(!t.has("hass"))return;this.hass&&!this.probed&&(this.probed=!0,Xo(this.hass).then(o=>this.modsOk=o),gc(this.hass).then(o=>{this.peopleOk=o,!o&&this.tab==="people"&&(this.tab="browse")}));let r=Object.keys(this.hass?.themes?.themes??{});tn(r,this.installedNames)||(this.installedNames=r),this.candidate&&this.refreshCandidate()}build(t){return vu(this.entry,this.fileThemes,t,this.hass,this.installedNames)}refreshCandidate(){let t=this.candidate;if(t&&!this.entry){this.candidate=ku(this.hass,t,this.previewMode),this.chosenName=this.candidate?this.chosenName:"";return}let r=this.build(this.chosenName);t&&r&&!li(t,r)&&(this.candidate=r)}setCandidate(t){let r=this.build(t);r&&([this.chosenName,this.candidate]=[t,r])}gallery(){return this.renderRoot.querySelector("hats-lite-browse")}showBundle(t){let r=Object.keys(t?.themes??{});if(r.length===0)return;let o=t.theme&&r.includes(t.theme)?t.theme:r[0];this.pickToken+=1,this.fileStatus="",this.entry=t.entry,this.fileThemes=t.themes,this.fileNames=[...new Set([...t.names??[],...r])],this.bundles.set(t.entry,o,{themes:t.themes,names:this.fileNames,theme:o}),this.setCandidate(o)}async fetchFileTheme(t){let r=this.entry;if(!r)return;let o=++this.pickToken;this.fileStatus="loading";try{let i=await Dr(this.hass,this.known,this.bundles,r,t);if(o!==this.pickToken||r!==this.entry)return;this.fileStatus="",this.fileThemes=i.themes,this.setCandidate(t)}catch{o===this.pickToken&&(this.fileStatus="error")}}renderTabs(){return l`
      <nav class="tabs seg" role="tablist" aria-label=${ie.shell.tabList} @keydown=${this.onTabKey}>
        ${this.tabs.map(t=>{let r=this.tab===t;return l`
            <button
              type="button"
              role="tab"
              id=${this.tabId(t)}
              aria-controls=${this.panelId(t)}
              aria-selected=${r?"true":"false"}
              tabindex=${r?"0":"-1"}
              @click=${()=>this.select(t)}
            >
              ${ie.shell.tabs[t]}
            </button>
          `})}
      </nav>
    `}renderInUse(){let t=Lu(this.hass),r=o=>o?l`<i style=${te({background:o})}></i>`:l`<i class="neutral"></i>`;return l`
      <span class="chip in-use">
        <span class="label">${ie.shell.inUse}</span>
        <span class="name">${t.name}</span>
        <span class="swatches" aria-hidden="true">${r(t.primary)}${r(t.accent)}</span>
      </span>
    `}render(){return l`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${this.narrow?l`<button class="menu" type="button" aria-label=${ie.shell.menu} @click=${this.onMenu}>${Nu}</button>`:u}
          <h1 class="title">${ie.shell.title}</h1>
        </div>
        ${this.renderInUse()}
      </header>
      ${this.renderTabs()}
      <main
        class="content"
        @hats-lite-theme-selected=${this.onThemeSelected}
        @hats-lite-theme-saved=${this.onThemeSaved}
        @hats-lite-preview-theme=${this.onPreviewTheme}
      >
        <section
          class="panel"
          id=${this.panelId("browse")}
          role="tabpanel"
          aria-labelledby=${this.tabId("browse")}
          tabindex="-1"
          ?hidden=${this.tab!=="browse"}
        >
          <hats-lite-browse
            .hass=${this.hass}
            .installedThemes=${this.installedNames}
            .currentTheme=${this.hass?.selectedTheme?.theme??this.hass?.themes?.theme??"default"}
            .darkMode=${this.hass?.themes?.darkMode}
          ></hats-lite-browse>
        </section>
        <section
          class="panel"
          id=${this.panelId("preview")}
          role="tabpanel"
          aria-labelledby=${this.tabId("preview")}
          tabindex="-1"
          ?hidden=${this.tab!=="preview"}
        >
          ${this.rendered.has("preview")?l`${ju(this.fileNames,this.chosenName,this.fileStatus,this.onFileThemeChange)}
              <hats-lite-preview
                .hass=${this.hass}
                .candidate=${this.candidate}
                .mode=${this.previewMode}
                .nav=${this.navigator.model()}
                .install=${wu(this.entry,this.candidate)}
                .uninstall=${xu(this.entry,this.candidate)}
                @hats-lite-mode-change=${this.onPreviewMode}
                @hats-lite-preview-nav=${this.onNav}
                @hats-lite-theme-installed=${this.onInstalled}
              ></hats-lite-preview>`:u}
        </section>
        <section
          class="panel"
          id=${this.panelId("designer")}
          role="tabpanel"
          aria-labelledby=${this.tabId("designer")}
          tabindex="-1"
          ?hidden=${this.tab!=="designer"}
        >
          ${this.rendered.has("designer")?l`<hats-lite-designer .hass=${this.hass}></hats-lite-designer>`:u}
        </section>
        <section class="panel" id=${this.panelId("people")} role="tabpanel" aria-labelledby=${this.tabId("people")} tabindex="-1" ?hidden=${this.tab!=="people"}>
          ${this.rendered.has("people")&&this.peopleOk?l`<hats-lite-people .hass=${this.hass}></hats-lite-people>`:u}
        </section>
        <section class="panel" id=${this.panelId("mods")} role="tabpanel" aria-labelledby=${this.tabId("mods")} tabindex="-1" ?hidden=${this.tab!=="mods"}>
          ${this.rendered.has("mods")&&this.modsOk?l`<hats-lite-mods .hass=${this.hass} .active=${this.tab==="mods"}></hats-lite-mods>`:u}
        </section>
      </main>
      </div>
    `}};customElements.get("hats-lite-panel")||customElements.define("hats-lite-panel",bi);export{bi as HatsLitePanel};

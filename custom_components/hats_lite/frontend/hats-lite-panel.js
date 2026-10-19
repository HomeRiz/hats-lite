var Rt=globalThis,Dt=Rt.ShadowRoot&&(Rt.ShadyCSS===void 0||Rt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Gn=Symbol(),ss=new WeakMap,nt=class{constructor(n,t,r){if(this._$cssResult$=!0,r!==Gn)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=n,this.t=t}get styleSheet(){let n=this.o,t=this.t;if(Dt&&n===void 0){let r=t!==void 0&&t.length===1;r&&(n=ss.get(t)),n===void 0&&((this.o=n=new CSSStyleSheet).replaceSync(this.cssText),r&&ss.set(t,n))}return n}toString(){return this.cssText}},is=e=>new nt(typeof e=="string"?e:e+"",void 0,Gn),M=(e,...n)=>{let t=e.length===1?e[0]:n.reduce((r,o,s)=>r+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[s+1],e[0]);return new nt(t,e,Gn)},as=(e,n)=>{if(Dt)e.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of n){let r=document.createElement("style"),o=Rt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=t.cssText,e.appendChild(r)}},Xn=Dt?e=>e:e=>e instanceof CSSStyleSheet?(n=>{let t="";for(let r of n.cssRules)t+=r.cssText;return is(t)})(e):e;var{is:pu,defineProperty:hu,getOwnPropertyDescriptor:mu,getOwnPropertyNames:fu,getOwnPropertySymbols:gu,getPrototypeOf:bu}=Object,Ot=globalThis,ls=Ot.trustedTypes,yu=ls?ls.emptyScript:"",vu=Ot.reactiveElementPolyfillSupport,rt=(e,n)=>e,Yn={toAttribute(e,n){switch(n){case Boolean:e=e?yu:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,n){let t=e;switch(n){case Boolean:t=e!==null;break;case Number:t=e===null?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch{t=null}}return t}},cs=(e,n)=>!pu(e,n),ds={attribute:!0,type:String,converter:Yn,reflect:!1,useDefault:!1,hasChanged:cs};Symbol.metadata??=Symbol("metadata"),Ot.litPropertyMetadata??=new WeakMap;var ie=class extends HTMLElement{static addInitializer(n){this._$Ei(),(this.l??=[]).push(n)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(n,t=ds){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(n)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(n,t),!t.noAccessor){let r=Symbol(),o=this.getPropertyDescriptor(n,r,t);o!==void 0&&hu(this.prototype,n,o)}}static getPropertyDescriptor(n,t,r){let{get:o,set:s}=mu(this.prototype,n)??{get(){return this[t]},set(i){this[t]=i}};return{get:o,set(i){let a=o?.call(this);s?.call(this,i),this.requestUpdate(n,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(n){return this.elementProperties.get(n)??ds}static _$Ei(){if(this.hasOwnProperty(rt("elementProperties")))return;let n=bu(this);n.finalize(),n.l!==void 0&&(this.l=[...n.l]),this.elementProperties=new Map(n.elementProperties)}static finalize(){if(this.hasOwnProperty(rt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(rt("properties"))){let t=this.properties,r=[...fu(t),...gu(t)];for(let o of r)this.createProperty(o,t[o])}let n=this[Symbol.metadata];if(n!==null){let t=litPropertyMetadata.get(n);if(t!==void 0)for(let[r,o]of t)this.elementProperties.set(r,o)}this._$Eh=new Map;for(let[t,r]of this.elementProperties){let o=this._$Eu(t,r);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(n){let t=[];if(Array.isArray(n)){let r=new Set(n.flat(1/0).reverse());for(let o of r)t.unshift(Xn(o))}else n!==void 0&&t.push(Xn(n));return t}static _$Eu(n,t){let r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof n=="string"?n.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(n=>n(this))}addController(n){(this._$EO??=new Set).add(n),this.renderRoot!==void 0&&this.isConnected&&n.hostConnected?.()}removeController(n){this._$EO?.delete(n)}_$E_(){let n=new Map,t=this.constructor.elementProperties;for(let r of t.keys())this.hasOwnProperty(r)&&(n.set(r,this[r]),delete this[r]);n.size>0&&(this._$Ep=n)}createRenderRoot(){let n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return as(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(n=>n.hostConnected?.())}enableUpdating(n){}disconnectedCallback(){this._$EO?.forEach(n=>n.hostDisconnected?.())}attributeChangedCallback(n,t,r){this._$AK(n,r)}_$ET(n,t){let r=this.constructor.elementProperties.get(n),o=this.constructor._$Eu(n,r);if(o!==void 0&&r.reflect===!0){let s=(r.converter?.toAttribute!==void 0?r.converter:Yn).toAttribute(t,r.type);this._$Em=n,s==null?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(n,t){let r=this.constructor,o=r._$Eh.get(n);if(o!==void 0&&this._$Em!==o){let s=r.getPropertyOptions(o),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Yn;this._$Em=o;let a=i.fromAttribute(t,s.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(n,t,r,o=!1,s){if(n!==void 0){let i=this.constructor;if(o===!1&&(s=this[n]),r??=i.getPropertyOptions(n),!((r.hasChanged??cs)(s,t)||r.useDefault&&r.reflect&&s===this._$Ej?.get(n)&&!this.hasAttribute(i._$Eu(n,r))))return;this.C(n,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(n,t,{useDefault:r,reflect:o,wrapped:s},i){r&&!(this._$Ej??=new Map).has(n)&&(this._$Ej.set(n,i??t??this[n]),s!==!0||i!==void 0)||(this._$AL.has(n)||(this.hasUpdated||r||(t=void 0),this._$AL.set(n,t)),o===!0&&this._$Em!==n&&(this._$Eq??=new Set).add(n))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let n=this.scheduleUpdate();return n!=null&&await n,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,s]of this._$Ep)this[o]=s;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[o,s]of r){let{wrapped:i}=s,a=this[o];i!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,s,a)}}let n=!1,t=this._$AL;try{n=this.shouldUpdate(t),n?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw n=!1,this._$EM(),r}n&&this._$AE(t)}willUpdate(n){}_$AE(n){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(n)),this.updated(n)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(n){return!0}update(n){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(n){}firstUpdated(n){}};ie.elementStyles=[],ie.shadowRootOptions={mode:"open"},ie[rt("elementProperties")]=new Map,ie[rt("finalized")]=new Map,vu?.({ReactiveElement:ie}),(Ot.reactiveElementVersions??=[]).push("2.1.2");var rr=globalThis,us=e=>e,It=rr.trustedTypes,ps=It?It.createPolicy("lit-html",{createHTML:e=>e}):void 0,ys="$lit$",pe=`lit$${Math.random().toFixed(9).slice(2)}$`,vs="?"+pe,wu=`<${vs}>`,Me=document,st=()=>Me.createComment(""),it=e=>e===null||typeof e!="object"&&typeof e!="function",or=Array.isArray,xu=e=>or(e)||typeof e?.[Symbol.iterator]=="function",Zn=`[ 	
\f\r]`,ot=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,hs=/-->/g,ms=/>/g,Te=RegExp(`>|${Zn}(?:([^\\s"'>=/]+)(${Zn}*=${Zn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),fs=/'/g,gs=/"/g,ws=/^(?:script|style|textarea|title)$/i,sr=e=>(n,...t)=>({_$litType$:e,strings:n,values:t}),l=sr(1),xs=sr(2),nb=sr(3),ae=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),bs=new WeakMap,Se=Me.createTreeWalker(Me,129);function ks(e,n){if(!or(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ps!==void 0?ps.createHTML(n):n}var ku=(e,n)=>{let t=e.length-1,r=[],o,s=n===2?"<svg>":n===3?"<math>":"",i=ot;for(let a=0;a<t;a++){let d=e[a],c,h,p=-1,g=0;for(;g<d.length&&(i.lastIndex=g,h=i.exec(d),h!==null);)g=i.lastIndex,i===ot?h[1]==="!--"?i=hs:h[1]!==void 0?i=ms:h[2]!==void 0?(ws.test(h[2])&&(o=RegExp("</"+h[2],"g")),i=Te):h[3]!==void 0&&(i=Te):i===Te?h[0]===">"?(i=o??ot,p=-1):h[1]===void 0?p=-2:(p=i.lastIndex-h[2].length,c=h[1],i=h[3]===void 0?Te:h[3]==='"'?gs:fs):i===gs||i===fs?i=Te:i===hs||i===ms?i=ot:(i=Te,o=void 0);let v=i===Te&&e[a+1].startsWith("/>")?" ":"";s+=i===ot?d+wu:p>=0?(r.push(c),d.slice(0,p)+ys+d.slice(p)+pe+v):d+pe+(p===-2?a:v)}return[ks(e,s+(e[t]||"<?>")+(n===2?"</svg>":n===3?"</math>":"")),r]},at=class e{constructor({strings:n,_$litType$:t},r){let o;this.parts=[];let s=0,i=0,a=n.length-1,d=this.parts,[c,h]=ku(n,t);if(this.el=e.createElement(c,r),Se.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(o=Se.nextNode())!==null&&d.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let p of o.getAttributeNames())if(p.endsWith(ys)){let g=h[i++],v=o.getAttribute(p).split(pe),E=/([.?@])?(.*)/.exec(g);d.push({type:1,index:s,name:E[2],strings:v,ctor:E[1]==="."?Qn:E[1]==="?"?er:E[1]==="@"?tr:Ie}),o.removeAttribute(p)}else p.startsWith(pe)&&(d.push({type:6,index:s}),o.removeAttribute(p));if(ws.test(o.tagName)){let p=o.textContent.split(pe),g=p.length-1;if(g>0){o.textContent=It?It.emptyScript:"";for(let v=0;v<g;v++)o.append(p[v],st()),Se.nextNode(),d.push({type:2,index:++s});o.append(p[g],st())}}}else if(o.nodeType===8)if(o.data===vs)d.push({type:2,index:s});else{let p=-1;for(;(p=o.data.indexOf(pe,p+1))!==-1;)d.push({type:7,index:s}),p+=pe.length-1}s++}}static createElement(n,t){let r=Me.createElement("template");return r.innerHTML=n,r}};function Oe(e,n,t=e,r){if(n===ae)return n;let o=r!==void 0?t._$Co?.[r]:t._$Cl,s=it(n)?void 0:n._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),s===void 0?o=void 0:(o=new s(e),o._$AT(e,t,r)),r!==void 0?(t._$Co??=[])[r]=o:t._$Cl=o),o!==void 0&&(n=Oe(e,o._$AS(e,n.values),o,r)),n}var Jn=class{constructor(n,t){this._$AV=[],this._$AN=void 0,this._$AD=n,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(n){let{el:{content:t},parts:r}=this._$AD,o=(n?.creationScope??Me).importNode(t,!0);Se.currentNode=o;let s=Se.nextNode(),i=0,a=0,d=r[0];for(;d!==void 0;){if(i===d.index){let c;d.type===2?c=new lt(s,s.nextSibling,this,n):d.type===1?c=new d.ctor(s,d.name,d.strings,this,n):d.type===6&&(c=new nr(s,this,n)),this._$AV.push(c),d=r[++a]}i!==d?.index&&(s=Se.nextNode(),i++)}return Se.currentNode=Me,o}p(n){let t=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(n,r,t),t+=r.strings.length-2):r._$AI(n[t])),t++}},lt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(n,t,r,o){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=n,this._$AB=t,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let n=this._$AA.parentNode,t=this._$AM;return t!==void 0&&n?.nodeType===11&&(n=t.parentNode),n}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(n,t=this){n=Oe(this,n,t),it(n)?n===u||n==null||n===""?(this._$AH!==u&&this._$AR(),this._$AH=u):n!==this._$AH&&n!==ae&&this._(n):n._$litType$!==void 0?this.$(n):n.nodeType!==void 0?this.T(n):xu(n)?this.k(n):this._(n)}O(n){return this._$AA.parentNode.insertBefore(n,this._$AB)}T(n){this._$AH!==n&&(this._$AR(),this._$AH=this.O(n))}_(n){this._$AH!==u&&it(this._$AH)?this._$AA.nextSibling.data=n:this.T(Me.createTextNode(n)),this._$AH=n}$(n){let{values:t,_$litType$:r}=n,o=typeof r=="number"?this._$AC(n):(r.el===void 0&&(r.el=at.createElement(ks(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(t);else{let s=new Jn(o,this),i=s.u(this.options);s.p(t),this.T(i),this._$AH=s}}_$AC(n){let t=bs.get(n.strings);return t===void 0&&bs.set(n.strings,t=new at(n)),t}k(n){or(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,r,o=0;for(let s of n)o===t.length?t.push(r=new e(this.O(st()),this.O(st()),this,this.options)):r=t[o],r._$AI(s),o++;o<t.length&&(this._$AR(r&&r._$AB.nextSibling,o),t.length=o)}_$AR(n=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);n!==this._$AB;){let r=us(n).nextSibling;us(n).remove(),n=r}}setConnected(n){this._$AM===void 0&&(this._$Cv=n,this._$AP?.(n))}},Ie=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(n,t,r,o,s){this.type=1,this._$AH=u,this._$AN=void 0,this.element=n,this.name=t,this._$AM=o,this.options=s,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=u}_$AI(n,t=this,r,o){let s=this.strings,i=!1;if(s===void 0)n=Oe(this,n,t,0),i=!it(n)||n!==this._$AH&&n!==ae,i&&(this._$AH=n);else{let a=n,d,c;for(n=s[0],d=0;d<s.length-1;d++)c=Oe(this,a[r+d],t,d),c===ae&&(c=this._$AH[d]),i||=!it(c)||c!==this._$AH[d],c===u?n=u:n!==u&&(n+=(c??"")+s[d+1]),this._$AH[d]=c}i&&!o&&this.j(n)}j(n){n===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,n??"")}},Qn=class extends Ie{constructor(){super(...arguments),this.type=3}j(n){this.element[this.name]=n===u?void 0:n}},er=class extends Ie{constructor(){super(...arguments),this.type=4}j(n){this.element.toggleAttribute(this.name,!!n&&n!==u)}},tr=class extends Ie{constructor(n,t,r,o,s){super(n,t,r,o,s),this.type=5}_$AI(n,t=this){if((n=Oe(this,n,t,0)??u)===ae)return;let r=this._$AH,o=n===u&&r!==u||n.capture!==r.capture||n.once!==r.once||n.passive!==r.passive,s=n!==u&&(r===u||o);o&&this.element.removeEventListener(this.name,this,r),s&&this.element.addEventListener(this.name,this,n),this._$AH=n}handleEvent(n){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,n):this._$AH.handleEvent(n)}},nr=class{constructor(n,t,r){this.element=n,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(n){Oe(this,n)}};var $u=rr.litHtmlPolyfillSupport;$u?.(at,lt),(rr.litHtmlVersions??=[]).push("3.3.3");var $s=(e,n,t)=>{let r=t?.renderBefore??n,o=r._$litPart$;if(o===void 0){let s=t?.renderBefore??null;r._$litPart$=o=new lt(n.insertBefore(st(),s),s,void 0,t??{})}return o._$AI(e),o};var ir=globalThis,A=class extends ie{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let n=super.createRenderRoot();return this.renderOptions.renderBefore??=n.firstChild,n}update(n){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(n),this._$Do=$s(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ae}};A._$litElement$=!0,A.finalized=!0,ir.litElementHydrateSupport?.({LitElement:A});var Eu=ir.litElementPolyfillSupport;Eu?.({LitElement:A});(ir.litElementVersions??=[]).push("4.2.2");var Es={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},_s=e=>(...n)=>({_$litDirective$:e,values:n}),Lt=class{constructor(n){}get _$AU(){return this._$AM._$AU}_$AT(n,t,r){this._$Ct=n,this._$AM=t,this._$Ci=r}_$AS(n,t){return this.update(n,t)}update(n,t){return this.render(...t)}};var Ts="important",_u=" !"+Ts,te=_s(class extends Lt{constructor(e){if(super(e),e.type!==Es.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((n,t)=>{let r=e[t];return r==null?n:n+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[n]){let{style:t}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(n)),this.render(n);for(let r of this.ft)n[r]==null&&(this.ft.delete(r),r.includes("-")?t.removeProperty(r):t[r]=null);for(let r in n){let o=n[r];if(o!=null){this.ft.add(r);let s=typeof o=="string"&&o.endsWith(_u);r.includes("-")||s?t.setProperty(r,s?o.slice(0,-11):o,s?Ts:""):t[r]=o}}return ae}});function P(e,n){return e.connection.sendMessagePromise(n)}var Ss="hats-lite-theme-selected",Ms="hats-lite-theme-saved",As="hats-lite-mode-change",ar="hats_lite_catalog",lr="/api/hats_lite/background";var Cs=["image/png","image/jpeg","image/webp","image/gif"];var b={title:"Themes",searchLabel:"Search themes",searchPlaceholder:"Search themes",loading:"Loading themes...",loadError:"Could not load the theme list.",cachedNote:"Showing the saved list from your last successful load.",noThemes:"No themes available.",retry:"Try again",previewsLoading:"Loading previews",apply:"Apply",noMatches:"No themes match your search.",noFilterMatches:"No themes match this filter yet. Previews load as you scroll.",installed:"Installed",inUse:"In use",otherCopy:"Other copy installed",licenseUnknown:"License unknown to HATS Lite",licenseShort:"License unknown",licenseKnown:"License detected when the thumbnails were built",starsLabel:"Stars",starGlyph:"★",themeErrorDefault:"Could not open this theme. Try again.",preview:"Preview",openPreview:"Open preview of",showing:"Showing",modeLabel:"Thumbnail mode",modeDark:"Dark",modeLight:"Light",filterLabel:"Filter themes",filterAll:"All",filterInstalled:"Installed",filterDark:"Dark",filterLight:"Light",filterGlass:"Glass",thumbUnavailable:"Preview not available",thumbRateLimited:"Rate limited, try again later",thumbLoading:"Loading preview",thumbRoom:"Living room thermostat",thumbTemp:"20.5 °C",thumbHeating:"Heating to 21",thumbEnergy:"Energy today",thumbGarage:"Garage door",thumbClosed:"Closed",thumbLocked:"Locked since 18:30",thumbLights:"Lights and doors",thumbLight:"Living room light",thumbDoor:"Front door",thumbPorch:"Porch timer",thumbGreeting:"Good evening",thumbSunset:"Sunset 18:42",thumbChipLight:"Light on",thumbChipFan:"Fan on",thumbChipHeat:"Heat"};function Rs(e){if(!e||typeof e!="object")return null;let n=e;return typeof n.full_name!="string"?null:{full_name:n.full_name,description:typeof n.description=="string"?n.description:"",stars:typeof n.stars=="number"?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"?n.hacs_id:null}}function dr(e){return Array.isArray(e)?e.flatMap(n=>{let t=Rs(n);return t?[t]:[]}):[]}function Ds(){try{let e=localStorage.getItem(ar);if(e===null)return null;let n=JSON.parse(e);return!Array.isArray(n)||!n.every(t=>Rs(t)!==null)?null:dr(n)}catch{return null}}function Os(e){try{localStorage.setItem(ar,JSON.stringify(e))}catch{return}}function Is(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ls(e){if(e&&typeof e=="object"&&"message"in e){let n=e.message;if(typeof n=="string"&&n)return n}return b.themeErrorDefault}function Hs(e,n){return e.full_name.toLowerCase().includes(n)||e.description.toLowerCase().includes(n)}var Tu=new Set(["invalid_theme","theme_too_large","not_found","invalid_request","not_in_catalog"]);function Ps(e,n){if(!e||typeof e!="object"||!(n in e))return"";let t=e[n];return typeof t=="string"?t:""}function Ht(e){let n=Ps(e,"code");return Tu.has(n)?"permanent":n==="rate_limited"||/\bstatus (403|429)\b/.test(Ps(e,"message"))?"limited":"transient"}var Su=/^[A-Za-z0-9_-]+$/,Mu=/[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i,Au=/['"]/,Cu=["lovelace-background","background-image"];function Z(e,n){return{...e.vars,...e.modes?.[n]??{}}}function Pu(e){return Su.test(e)?!e.startsWith("card-mod-")&&!e.startsWith("uix-"):!1}function Ru(e,n){return typeof n!="string"||Mu.test(n)?!1:!Au.test(n)||Cu.includes(e)}function Du(e){return Object.entries(e).filter(([n,t])=>Pu(n)&&Ru(n,t))}var Ou=["lovelace-background","background-image"],Iu=/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi,Lu=/(^|[\s,/)])fixed(?=$|[\s,/(])/gi,Hu=/^\s*(?:(?:fixed|scroll|local)\s*(?:,\s*|$))+$/i;function Ns(e){return e.replace(Lu,"$1scroll")}function Nu(e){let n="",t=0;for(let r of e.matchAll(Iu)){let o=r.index??0;n+=Ns(e.slice(t,o))+r[0],t=o+r[0].length}return n+Ns(e.slice(t))}function Fu(e,n){return Ou.includes(e)||/url\(/i.test(n)||Hu.test(n)?Nu(n):n}function dt(e,n){for(let[t,r]of Du(n))e.style.setProperty(`--${t}`,Fu(t,r))}var f={title:"Theme preview",dashboard:"Dashboard",defaultDashboard:"Overview",view:"View",device:"Device",desktop:"Desktop",tablet:"Tablet",phone:"Phone",density:"Density",normal:"Normal",compact:"Compact",mode:"Mode",dark:"Dark",light:"Light",current:"Current",candidate:"Candidate",divider:"Drag to compare current and candidate",splitAt:"Split at {percent} percent",apply:"Apply",navGroup:"Browse themes",navPrev:"Previous theme",navNext:"Next theme",navCount:"{index} of {total}",navPosition:"{name}, {index} of {total}",navLoading:"Loading theme...",navFailed:"Could not load {name}. Try again.",installButton:"Install",installBusy:"Installing...",installConfirmTitle:"Install this theme?",installConfirmBody:"HACS will download the files of {repo} from GitHub into your Home Assistant configuration. Only install themes you trust.",installConfirmYes:"Download and install",installCancel:"Cancel",installLoading:"Loading theme...",uninstallButton:"Uninstall",uninstallBusy:"Uninstalling...",uninstallUpdating:"Updating...",uninstallConfirmTitle:"Uninstall this theme?",uninstallConfirmBody:"HACS will delete the theme files of {repo} from your Home Assistant configuration.",uninstallConfirmYes:"Delete theme files",uninstallSwitchFirst:"Change the theme before uninstalling it.",inUseChip:"In use",uninstallWaiting:"Removed. Waiting for Home Assistant to unload the theme.",uninstallTimeout:"Removed, but Home Assistant still lists the theme. Reload the page or check HACS.",installWaiting:"Installed. Waiting for Home Assistant to load the theme.",installTimeout:"Installed, but Home Assistant has not loaded the theme yet. Reload the page or check HACS.",installViaHacs:"This theme is not installed yet. Open it in HACS to download it, then come back here.",adminOnly:"Not installed yet. Only an administrator can install themes. Ask one to install this theme with HACS.",hacsLink:"Open in HACS",installErrors:{unauthorized:"Only an administrator can install themes.",hacs_unavailable:"HACS is not available here. Open the repository in HACS to install it.",invalid_repository:"This theme cannot be installed from here. Open it in HACS instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",install_failed:"HACS could not download this theme. Try again, or open it in HACS.",reload_failed:"The theme was downloaded but Home Assistant could not reload its themes. Reload themes or restart Home Assistant.",operation_timeout:"HACS is still working on this theme. Check HACS, then reload the page.",not_installed:"This theme is not installed.",rate_limited:"Too many HACS changes in a short time. Try again in a few minutes.",unknown:"The install did not complete. Try again, or open the theme in HACS."},uninstallErrors:{unauthorized:"Only an administrator can uninstall themes.",hacs_unavailable:"HACS is not available here. Remove the theme in HACS instead.",invalid_repository:"This theme cannot be removed from here. Open it in HACS instead.",install_in_progress:"Another install or uninstall is already running. Try again when it has finished.",uninstall_failed:"HACS could not remove this theme. Try again, or open it in HACS.",reload_failed:"The theme files were removed but Home Assistant could not reload its themes. Reload the page or restart Home Assistant.",operation_timeout:"HACS is still working on this theme. Check HACS, then reload the page.",not_installed:"This theme is not installed.",theme_in_use:"This theme is still used by an assignment, holiday, birthday or trial, or it is a default theme. Switch those to another theme first.",names_unknown:"The theme files could not be read, so removal was not safe. Remove it in HACS instead.",rate_limited:"Too many HACS changes in a short time. Try again in a few minutes.",unknown:"The uninstall did not complete. Try again, or open the theme in HACS."},nameCollision:"The installed copy of {name} has other values than this preview, so Apply and Try are turned off for the previewed one.",nameTaken:"Name already used",repoLink:"View repository",tryButton:"Try for 30 seconds",placeholderCard:"Preview unavailable for card type",loading:"Loading dashboard...",loadError:"Could not load this dashboard.",noViews:"This dashboard has no views.",noCards:"This dashboard has no cards to preview.",generatedSuffix:"(generated by Home Assistant)",generatedDefault:"This dashboard is generated by Home Assistant and has no stored layout to read. Pick another dashboard.",sampleView:"Sample from your entities",sampleNote:"This is a sample built from your entities. The real Overview is generated by Home Assistant and cannot be read.",domainTitles:{light:"Lights",switch:"Switches",climate:"Climate",cover:"Covers",media_player:"Media players",sensor:"Sensors",binary_sensor:"Binary sensors"},compare:"Compare",compareLabel:"Show",themeOnly:"Theme only",menu:"Menu",on:"On",off:"Off",lookLabel:"Look",realLook:"Real look",livePreview:"Live preview",realAlt:"Screenshot of {name} in Home Assistant, {mode} mode",realCaption:"Screenshot of the real theme in Home Assistant (version {commit})",compareHint:"Compare works with the live preview only.",modNote:"Menu and header styling done with card-mod is not shown here.",shell:{title:"Home Assistant",overview:"Overview",map:"Map",logbook:"Logbook",history:"History",energy:"Energy",settings:"Settings",bell:"Notifications",profile:"Profile",menu:"Menu",search:"Search",more:"More"},footnote:"Drawn from your own dashboard with read-only data and scoped colors. Nothing changes until you press Apply.",emptyView:"This view has no cards.",tooManyCards:"This view has more than 200 cards, so it is not previewed.",noCandidate:"Select a theme to compare.",noModeBlock:"This theme has no {mode} block, so the candidate uses the current colors.",trialUnavailable:"Trial mode is not ready. Reload the page and try again.",trialFailed:"The trial could not start."};var Us=200,ju=3,Uu=60,Bu=1500,zu=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,Ku=3e3;function O(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ft(e){if(!O(e))return{};let n=Object.create(null);for(let[t,r]of Object.entries(e))typeof r=="string"&&(n[t]=r);return n}function Fs(e){if(O(e))return{dark:Ft(e.dark),light:Ft(e.light)}}function ne(e){return O(e.vars)?{vars:Ft(e.vars),modes:Fs(e.modes)}:{vars:Ft(e),modes:Fs(e.modes)}}function Bs(e){let n=e?.selectedTheme?.theme??e?.themes?.theme,t=e?.themes?.themes;if(!n||!t||!Object.prototype.hasOwnProperty.call(t,n))return;let r=t[n];return O(r)?ne(r):void 0}function js(e){let n=e.trim().replace(/[\s;]+$/,"").replace(/\s*!important$/i,"").replace(/[\s;]+$/,"").replace(/\s+/g," ");return/^#[0-9a-f]+$/i.test(n)?n.toLowerCase():n}function Vu(e,n){return Object.keys(e).some(t=>Object.prototype.hasOwnProperty.call(n,t)&&js(e[t])!==js(n[t]))}function hr(e,n){return["dark","light"].some(t=>Vu(Z(e,t),Z(n,t)))}function zs(e,n){return O(e)?hr(ne(e),n):!1}function mr(e){return e?[...Object.keys(e.vars),...Object.keys(e.modes?.dark??{}),...Object.keys(e.modes?.light??{})]:[]}function Ks(e){let n=e?.selectedTheme,t=n?.theme??e?.themes?.theme??"default";if(!n)return{theme:t};let r={theme:t};return typeof n.dark=="boolean"&&(r.dark=e?.themes?.darkMode??!1),typeof n.primaryColor=="string"&&(r.primaryColor=n.primaryColor),typeof n.accentColor=="string"&&(r.accentColor=n.accentColor),r}function Vs(e,n){let t={theme:e.name};return n&&(t.dark=n==="dark"),t}function jt(e){return e.installed&&e.canApply&&!e.nameCollision}function Ut(e){return e.installed&&!e.nameCollision}function Ws(e){if(!(!zu.test(e)||e.split("/").some(t=>t==="."||t==="..")))return`https://github.com/${e}`}function Bt(e,n){return e?e.entry?Z(e.entry,n):e.vars:{}}function qs(e){return e&&/^https:\/\//i.test(e)?e:void 0}async function Gs(e){let n=await e.connection.sendMessagePromise({type:"lovelace/dashboards/list"}),t=[{url_path:null,title:f.defaultDashboard}];if(!Array.isArray(n))return t;for(let r of n)O(r)&&typeof r.url_path=="string"&&t.push({url_path:r.url_path,title:typeof r.title=="string"?r.title:r.url_path});return t}async function Xs(e,n){let t=await e.connection.sendMessagePromise({type:"lovelace/config",url_path:n});return O(t)?t:{}}function fr(e){return Array.isArray(e.views)?e.views.filter(O):[]}function Ys(e,n){return typeof e.title=="string"&&e.title?e.title:typeof e.path=="string"&&e.path?e.path:`${f.view} ${n+1}`}function Zs(e,n){if(!Array.isArray(e.cards))return e;if(n>=ju)return{...e,cards:[]};let t=e.cards.filter(O).map(r=>Zs(r,n+1));return{...e,cards:t}}function gr(e){let n=Array.isArray(e.cards)?e.cards:[],r=(Array.isArray(e.sections)?e.sections:[]).flatMap(o=>O(o)&&Array.isArray(o.cards)?o.cards:[]);return[...n,...r].filter(O).map(o=>Zs(o,0))}function br(e){return e.reduce((n,t)=>{let r=Array.isArray(t.cards)?br(t.cards.filter(O)):0;return n+1+r},0)}var cr,ct,ur;function pr(){let e=window.loadCardHelpers;return typeof e=="function"?e:void 0}async function Wu(){let e=customElements.whenDefined("partial-panel-resolver"),n=new Promise(r=>setTimeout(r,Ku));if(await Promise.race([e,n]),!customElements.get("partial-panel-resolver"))return;let t=document.createElement("partial-panel-resolver");t.hass={panels:{tmp:{url_path:"tmp",component_name:"lovelace"}}},t._updateRoutes?.(),await t.routerOptions?.routes?.tmp?.load?.()}async function qu(){return pr()?!0:(ur??=Wu().catch(()=>{}).finally(()=>{ur=void 0}),await ur,pr()!==void 0)}async function zt(){if(!await qu())return;let e=pr();if(e)return ct&&cr===e||(cr=e,ct=Promise.resolve().then(()=>e()).catch(()=>{ct=void 0,cr=void 0})),ct}function Gu(e){let n=typeof e.type=="string"?e.type:"unknown";return Array.from(n).slice(0,Uu).join("")}function Nt(e){let n=document.createElement("div");return n.className="placeholder",n.textContent=`${f.placeholderCard} ${e}`,n}function Xu(e){return e.localName==="hui-error-card"||e instanceof HTMLUnknownElement}function Yu(e){return new Promise(n=>{let t=setTimeout(()=>n(!1),Bu),r=o=>{clearTimeout(t),n(o)};try{customElements.whenDefined(e).then(()=>r(!0),()=>r(!1))}catch{r(!1)}})}async function Kt(e,n){let t=Gu(n);if(!e)return Nt(t);let r;try{r=e.createCardElement(n)}catch{return Nt(t)}if(Xu(r))return Nt(t);let o=r.localName;return o.includes("-")&&customElements.get(o)===void 0&&!await Yu(o)?Nt(t):r}function Js(e){let n=[];for(let t=0;t<e.style.length;t+=1){let r=e.style.item(t);r.startsWith("--")&&n.push(r)}for(let t of n)e.style.removeProperty(t)}var Le=class{constructor(){this.byRepo=new Map}add(n,t){let r=this.byRepo.get(n)??new Set;for(let o of t)r.add(o);this.byRepo.set(n,r)}of(n,t){let r=new Set(this.byRepo.get(n));for(let o of t)o&&r.add(o);return[...r]}};function Qs(e,n){let t=new Set(Object.keys(e));if(Array.isArray(n))for(let r of n)typeof r=="string"&&t.add(r);return[...t]}function ei(e,n,t){return e.installed||n.some(r=>t.has(r))}function ti(e,n){return e.includes(n)}function Vt(e,n){return e.length===n.length&&e.every((t,r)=>t===n[r])}function ni(e,n,t,r,o){if(e.installed)return"match";if(!n.some(a=>t.has(a)))return"none";if(!o||!r||!Object.prototype.hasOwnProperty.call(r,o.name))return"unverified";let s=r[o.name];if(!O(s))return"unverified";let i={vars:o.vars,modes:o.modes};return hr(ne(s),i)?"different":"match"}var ri="hats_lite/catalog",Zu="hats_lite/theme",yr=5e3,vr=6e4;function oi(e,n){let t=Ht(e);return t==="permanent"?null:t==="limited"?vr:yr*2**n}function Ju(e){if(typeof e!="object"||e===null)return!1;let n=e.code;return n==="invalid_format"||n==="invalid_request"||n==="unknown_error"}function Ae(e,n,t,r=!1,o){if(!e)return Promise.reject(new Error(b.themeErrorDefault));let s={type:Zu,full_name:t.full_name,commit:t.last_commit||"HEAD"};return r?s.summary=!0:o&&(s.theme=o),P(e,s).then(i=>{if(!Is(i?.themes))throw new Error(b.themeErrorDefault);let a=Qs(i.themes,i.names);return n.add(t.full_name,a),{themes:i.themes,summary:i.summary===!0,names:a}},i=>{if(s.theme!==void 0&&Ju(i))return Ae(e,n,t);throw i})}var si="hats_lite_theme_cache",xr=120,Qu=2e4;function wr(e){if(!O(e))return null;let n=Object.create(null);for(let[t,r]of Object.entries(e)){if(typeof r!="string")return null;n[t]=r}return n}function ep(e){if(!O(e)||typeof e.name!="string")return null;let n=wr(e.vars);if(!n)return null;let t={name:e.name,vars:n};if(e.modes!==void 0&&e.modes!==null){if(!O(e.modes))return null;let r=wr(e.modes.dark??{}),o=wr(e.modes.light??{});if(!r||!o)return null;t.modes={dark:r,light:o}}return t}function He(e){let n=Object.keys(e)[0];if(n===void 0)return null;let t=e[n];if(!O(t))return null;let r=ne(t);return{name:n,vars:r.vars,modes:r.modes}}var ii=new WeakMap;function li(e,n){let t=ii.get(e)??{};return ii.set(e,t),t[n]??=Z(e,n),t[n]}function ai(e){return JSON.stringify(e).length>Qu}var Wt=class{constructor(){this.slots=new Map;this.load()}load(){try{let n=localStorage.getItem(si);if(n===null)return;let t=JSON.parse(n);if(!Array.isArray(t))return;for(let r of t){if(!Array.isArray(r)||typeof r[0]!="string")continue;let o=ep(r[1]);o&&!ai(o)&&this.slots.set(r[0],{theme:o})}this.trim()}catch{this.slots.clear()}}trim(){let n=[];for(;this.slots.size>xr;){let t=this.slots.keys().next().value;if(t===void 0)break;this.slots.delete(t),n.push(t)}return n}get size(){return this.slots.size}has(n){return this.slots.has(n)}touch(n){let t=this.slots.get(n);t&&(this.slots.delete(n),this.slots.set(n,t))}get(n){return this.slots.get(n)?.theme}bundle(n){return this.slots.get(n)?.bundle}set(n,t,r){this.slots.delete(n),this.slots.set(n,{theme:t,bundle:r});let o=this.trim();return this.persist(),o}persist(){try{let n=[...this.slots.entries()].filter(([,t])=>!ai(t.theme)).map(([t,r])=>[t,r.theme]);localStorage.setItem(si,JSON.stringify(n))}catch{return}}};var ui=["all","installed","dark","light","glass"];function pi(e){let n=e.split("/");return n[n.length-1]||e}function hi(e){let n=e.indexOf("/");return n>0?e.slice(0,n):""}function he(e){return`${e.full_name}@${e.last_commit||"HEAD"}`}function tp(e){return`${e.full_name} ${e.description}`.toLowerCase()}function di(e,n){return new RegExp(`(^|[^a-z0-9])${n}([^a-z0-9]|$)`).test(e)}function ci(e){return!!e&&Object.keys(e).length>0}function np(e){return[e.vars,e.modes?.dark,e.modes?.light].some(t=>Object.entries(t??{}).some(([r,o])=>/backdrop-filter|blur/i.test(r)||/blur\(/i.test(o)))}function mi(e,n,t,r,o=n.installed){let s=t===void 0?r:void 0,i=tp(n);return e==="all"?!0:e==="installed"?o:e==="dark"?di(i,"dark")||ci(t?.modes?.dark)||s?.dark===!0:e==="light"?di(i,"light")||ci(t?.modes?.light)||s?.light===!0:/glass|frost|blur/.test(i)||t!==void 0&&np(t)||s?.glass===!0}var rp={all:b.filterAll,installed:b.filterInstalled,dark:b.filterDark,light:b.filterLight,glass:b.filterGlass};function fi(e){return l`
    <div class="toolbar">
      <span class="showing">${b.showing}</span>
      <div class="seg" role="group" aria-label=${b.modeLabel}>
        ${["dark","light"].map(n=>l`
            <button
              type="button"
              data-mode=${n}
              aria-pressed=${e.mode===n?"true":"false"}
              @click=${()=>e.onMode(n)}
            >
              ${n==="dark"?b.modeDark:b.modeLight}
            </button>
          `)}
      </div>
      <div class="filters" role="group" aria-label=${b.filterLabel}>
        ${ui.map(n=>l`
            <button
              type="button"
              class="chip-btn"
              data-filter=${n}
              aria-pressed=${e.filter===n?"true":"false"}
              @click=${()=>e.onFilter(n)}
            >
              ${rp[n]}
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
  `}var wi="/hats_lite_static/thumbs";function op(e,n,t){let r=e%n,o=Math.floor(e/n);return{sizeX:n*100,sizeY:t*100,posX:n>1?r/(n-1)*100:0,posY:t>1?o/(t-1)*100:0}}function gi(e,n){return typeof e=="number"&&Number.isInteger(e)&&e>0&&e<=n}function sp(e,n,t){if(typeof e!="object"||e===null)return null;let r=e,o=r.index;return typeof r.full_name!="string"||typeof r.name!="string"||typeof o!="number"||!Number.isInteger(o)||o<0||o>=n||t.has(o)?null:(t.add(o),{full_name:r.full_name,name:r.name,index:o,commit:typeof r.commit=="string"&&r.commit?r.commit:null,license:typeof r.license=="string"&&r.license?r.license:null,dark:r.dark===!0,light:r.light===!0,glass:r.glass===!0})}function ip(e,n){for(let r of[e,n])if(typeof r=="string"&&r)return r;let t=r=>r!=null;return t(e)||t(n)?null:""}function ap(e){if(typeof e!="object"||e===null)return null;let n=e,{columns:t,rows:r,themes:o}=n;if(n.version!==1||!gi(t,64)||!gi(r,2e3)||!Array.isArray(o))return null;let s=new Set,i=new Map;for(let d of o){let c=sp(d,t*r,s);c&&i.set(c.full_name,c)}let a=ip(n.hash,n.generated);return a===null?null:{columns:t,rows:r,version:a,themes:i}}var lp=6e3,dp=2e4,bi=3e4,qt=class extends Error{},ut=class extends Error{},yi={fetchIndex(e){return fetch(`${wi}/index.json`,{credentials:"same-origin",signal:e}).then(n=>{if(n.status===404)throw new qt("index missing");if(!n.ok)throw new Error("index unavailable");return n.json()})},loadImage(e,n){return new Promise(t=>{let r=new Image,o=i=>{n?.removeEventListener("abort",s),t(i)},s=()=>{r.src="",o(!1)};r.onload=()=>o(!0),r.onerror=()=>o(!1),n?.addEventListener("abort",s),r.src=e})}};function vi(e,n,t){let r=new AbortController;return new Promise((o,s)=>{let i=()=>{clearTimeout(d),e.delete(a)},a=()=>{i(),r.abort(),s(new ut)},d=setTimeout(()=>{i(),r.abort(),s(new Error("timeout"))},n);e.add(a);let c=h=>p=>{i(),h(p)};try{t(r.signal).then(c(o),c(s))}catch(h){c(s)(h)}})}var Gt=class{constructor(n){this.onChange=n;this.started=!1;this.images=new Map;this.wanted=new Set;this.retries=new Map;this.active=new Set;this.disposed=!1;this.ticket=0}ensure(n){if(this.wanted.add(n),!this.disposed){if(this.started){this.pump();return}this.startIndex()}}startIndex(){this.started=!0;let n=++this.ticket;Promise.resolve().then(()=>{n===this.ticket&&!this.disposed&&this.loadIndex(!0)})}later(n){let t=()=>{this.retries.delete(t),n()};this.retries.set(t,this.disposed?void 0:setTimeout(t,bi))}dispose(){this.disposed=!0,this.ticket+=1;for(let[n,t]of this.retries)t!==void 0&&clearTimeout(t),this.retries.set(n,void 0);for(let n of[...this.active])n();this.index===void 0&&(this.started=!1);for(let[n,t]of this.images)t===void 0&&this.images.delete(n)}resume(){this.disposed=!1;for(let[n,t]of this.retries)t===void 0&&this.retries.set(n,setTimeout(n,bi));!this.started&&this.wanted.size>0?this.startIndex():this.pump()}async loadIndex(n){let t=null,r=!1;try{t=ap(await vi(this.active,lp,o=>yi.fetchIndex(o)))}catch(o){if(o instanceof ut)return;r=!(o instanceof qt)}this.index=t,this.pump(),this.onChange(),!t&&r&&n&&this.later(()=>void this.loadIndex(!1))}pump(){if(this.index)for(let n of this.wanted)this.images.has(n)||(this.images.set(n,void 0),this.loadImage(n,!0))}async loadImage(n,t){let r=this.imageUrl(n),o=!1;try{o=await vi(this.active,dp,s=>yi.loadImage(r,s))}catch(s){if(s instanceof ut)return}this.images.set(n,o),this.onChange(),!o&&t&&this.later(()=>void this.loadImage(n,!1))}imageUrl(n){let t=this.index?.version??"",r=t?`?v=${encodeURIComponent(t)}`:"";return`${wi}/atlas-${n}.webp${r}`}theme(n,t){let r=this.index?.themes.get(n);if(!r)return;let o=r.commit;if(!(t&&o&&o!=="HEAD"&&o!==t))return r}state(n,t,r){if(this.ensure(t),this.index===void 0)return"pending";if(!this.theme(n,r))return"none";if(!this.images.has(t))return"pending";let o=this.images.get(t);return o===void 0?"pending":o?"ok":"none"}tile(n,t){let r=this.theme(n,t);return!r||!this.index?null:op(r.index,this.index.columns,this.index.rows)}};function xi(e,n,t,r){let o=e.tile(n,r),s=e.theme(n,r);if(!o||!s)return u;let i={backgroundImage:`url("${e.imageUrl(t)}")`,backgroundSize:`${o.sizeX}% ${o.sizeY}%`,backgroundPosition:`${o.posX}% ${o.posY}%`};return l`<div
    class="atlas-thumb"
    role="img"
    aria-label=${s.name}
    data-atlas="true"
    style=${te(i)}
  ></div>`}function ki(e){if(!e)return l`<span
      class="chip"
      title=${b.licenseUnknown}
      aria-label=${b.licenseUnknown}
      >${b.licenseShort}</span
    >`;let n=`${b.licenseKnown}: ${e}`;return l`<span class="chip" title=${n} aria-label=${n}>${e}</span>`}function cp(e){e.preventDefault()}function up(e){return e==="match"?l`<span class="chip ok">${b.installed}</span>`:e==="unverified"?l`<span class="chip">${b.installed}</span>`:e==="different"?l`<span class="chip warn">${b.otherCopy}</span>`:u}function $i(e,n){let t=pi(e.entry.full_name),r=hi(e.entry.full_name),o=`${b.starsLabel}: ${e.entry.stars}`;return l`
    <article class="card" data-key=${e.key}>
      <button
        class="thumb-btn"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        ?disabled=${e.busy}
        @mousedown=${cp}
        @click=${n}
      >
        ${e.atlased?xi(e.atlas,e.entry.full_name,e.mode,e.entry.last_commit):l`<hats-lite-thumb
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
          ${up(e.installedKind)}
          ${e.active?l`<span class="chip ok">${b.inUse}</span>`:u}
          <span class="chip" title=${o} aria-label=${o}
            >${b.starGlyph} ${e.entry.stars}</span
          >
          ${ki(e.license)}
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
  `}var pp=6,Ne=class{constructor(){this.slots=new Map}key(n,t){return`${he(n)}@${t}`}get(n,t){let r=this.key(n,t),o=this.slots.get(r);return o&&(this.slots.delete(r),this.slots.set(r,o)),o}set(n,t,r){let o=this.key(n,t);for(this.slots.delete(o),this.slots.set(o,r);this.slots.size>pp;){let s=this.slots.keys().next().value;if(s===void 0)break;this.slots.delete(s)}}};async function kr(e,n,t,r,o){let s=t.get(r,o);if(s)return s;let i=await Ae(e,n,r,!1,o),a={themes:i.themes,names:i.names,theme:o};return Object.prototype.hasOwnProperty.call(i.themes,o)&&t.set(r,o,a),a}async function Ei(e,n,t,r,o,s){let i=he(o),a=t.get(i)?.name??s,d=t.bundle(i);if(d&&(!a||Object.prototype.hasOwnProperty.call(d,a))){t.touch(i);let p=n.of(o.full_name,Object.keys(d));return{themes:d,names:p,theme:a??Object.keys(d)[0]}}if(!a){let p=await Ae(e,n,o,!0);if(a=He(p.themes)?.name,!p.summary){let g=He(p.themes);return g&&t.set(i,g,p.themes),{themes:p.themes,names:p.names,theme:a}}}if(!a){let p=await Ae(e,n,o);return{themes:p.themes,names:p.names,theme:Object.keys(p.themes)[0]}}let c=await kr(e,n,r,o,a),h=He(c.themes);return h&&!t.has(i)&&t.set(i,h),c}var me=class extends Error{},Xt=class{constructor(n=3,t=5e3,r=1,o=()=>t){this.limit=n;this.retryMs=t;this.retries=r;this.delayFor=o;this.running=0;this.waiting=[];this.pending=new Set;this.epoch=0}get active(){return this.running}add(n){return this.attempt(n,this.retries)}dispose(){this.epoch+=1;let n=this.waiting;this.waiting=[];for(let r of n)r.reject(new me);let t=[...this.pending];this.pending.clear();for(let r of t)clearTimeout(r.timer),r.reject(new me)}acquire(){return this.running<this.limit?(this.running+=1,Promise.resolve()):new Promise((n,t)=>this.waiting.push({resolve:n,reject:t}))}release(){let n=this.waiting.shift();n?n.resolve():this.running-=1}pause(n){return new Promise((t,r)=>{let o={timer:setTimeout(()=>{this.pending.delete(o),t()},n),reject:r};this.pending.add(o)})}async attempt(n,t){let r=this.epoch;if(await this.acquire(),r!==this.epoch)throw this.release(),new me;let o=this.retryMs;try{return await n()}catch(s){if(r!==this.epoch)throw new me;let i=t>0?this.delayFor(s,this.retries-t):null;if(i===null)throw s;o=i}finally{this.release()}return await this.pause(o),this.attempt(n,t-1)}};var _i=M`
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
  .showing {
    color: var(--hl-muted);
  }
  .filters {
    display: flex;
    gap: 8px;
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    padding: 2px;
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
`;var hp={dark:{"primary-background-color":"#111111","card-background-color":"#1c1c1c","primary-text-color":"#e1e1e1","secondary-text-color":"#9b9b9b","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#e1e1e11f","text-primary-color":"#ffffff","secondary-background-color":"#282828","disabled-text-color":"#6f6f6f"},light:{"primary-background-color":"#fafafa","card-background-color":"#ffffff","primary-text-color":"#141414","secondary-text-color":"#5e5e5e","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#0000001f","text-primary-color":"#ffffff","secondary-background-color":"#e5e5e5","disabled-text-color":"#bdbdbd"}},mp={"paper-item-icon-color":"#44739e","light-primary-color":"#b3e5fc","dark-primary-color":"#0288d1"},fp=["primary-color","accent-color","primary-text-color","secondary-text-color","card-background-color","primary-background-color"];function gp(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16)).join(", ")}function Ti(e){let n=hp[e],t={...n,...mp};for(let r of fp)t[`rgb-${r}`]=gp(n[r]);return t}var Yt={dark:Ti("dark"),light:Ti("light")};function Si(e,n){if(e===n)return!0;if(!e||!n)return!1;let t=Object.keys(e);return t.length===Object.keys(n).length&&t.every(r=>e[r]===n[r])}var $r=class extends A{constructor(){super(...arguments);this.vars=null;this.mode="dark";this.failed=!1;this.limited=!1}static{this.properties={vars:{attribute:!1,hasChanged:(t,r)=>!Si(t,r)},mode:{attribute:!1},failed:{type:Boolean},limited:{type:Boolean}}}static{this.styles=M`
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
  `}updated(t){if(!t.has("vars")&&!t.has("mode"))return;let r=this.painted;r&&r.mode===this.mode&&Si(r.vars,this.vars)||(this.painted={vars:this.vars,mode:this.mode},this.style.cssText="",this.vars&&(dt(this,Yt[this.mode]),dt(this,this.vars)))}render(){if(this.failed){let t=this.limited?b.thumbRateLimited:b.thumbUnavailable;return l`<div class="state unavailable"><span class="reason">${t}</span></div>`}return this.vars?l`
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
    `:l`<div class="state skeleton" aria-hidden="true"></div>`}};customElements.get("hats-lite-thumb")||customElements.define("hats-lite-thumb",$r);var z=M`
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
`,K=M`
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
    border: 1px solid var(--hl-edge);
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
`;var bp=6,Er=class extends A{constructor(){super(...arguments);this.installedThemes=[];this.currentTheme="default";this.entries=[];this.query="";this.loading=!1;this.loaded=!1;this.error="";this.fromCache=!1;this.busyName="";this.cardError=null;this.filter="all";this.mode="dark";this.states=new Map;this.started=!1;this.modeTouched=!1;this.installedSet=new Set;this.entryIndex=new Map;this.cache=new Wt;this.bundles=new Ne;this.visible=new Set;this.known=new Le;this.queue=new Xt(3,yr,1,oi);this.atlas=new Gt(()=>this.onAtlasChange());this.seen=new Set;this.inflight=new Set;this.permanent=new Set;this.limitedUntil=new Map;this.watched=new WeakMap;this.onIntersect=t=>{for(let r of t){let o=r.target.dataset.key??"";if(!r.isIntersecting){this.visible.delete(o);continue}this.visible.add(o),this.cache.touch(o);let s=this.entryIndex.get(o);s&&this.requestVars(s,!0)}};this.onSearch=t=>{this.query=t.target.value}}static{this.properties={installedThemes:{attribute:!1},currentTheme:{attribute:!1},darkMode:{attribute:!1},entries:{state:!0},query:{state:!0},loading:{state:!0},loaded:{state:!0},error:{state:!0},fromCache:{state:!0},busyName:{state:!0},cardError:{state:!0},filter:{state:!0},mode:{state:!0},states:{state:!0}}}static{this.styles=[z,K,_i]}get hass(){return this.hassRef}set hass(t){this.hassRef=t;let r=t?.themes,o=Object.keys(r?.themes??{});Vt(o,this.installedThemes)||(this.installedThemes=o);let s=t?.selectedTheme?.theme??r?.theme??"default";s!==this.currentTheme&&(this.currentTheme=s),r?.darkMode!==this.darkMode&&(this.darkMode=r?.darkMode),this.started||this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.atlas.resume(),this.hasUpdated&&queueMicrotask(()=>this.watchCards())}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0,this.watched=new WeakMap,this.visible.clear(),this.queue.dispose(),this.atlas.dispose()}willUpdate(t){t.has("installedThemes")&&(this.installedSet=new Set(this.installedThemes)),t.has("entries")&&(this.entryIndex=new Map(this.entries.map(r=>[he(r),r]))),t.has("darkMode")&&!this.modeTouched&&this.darkMode!==void 0&&(this.mode=this.darkMode?"dark":"light"),!this.started&&this.hassRef&&(this.started=!0,this.loadCatalog())}updated(){queueMicrotask(()=>this.watchCards())}async loadCatalog(){let t=this.hassRef;if(t){this.loading=!0;try{let r=await P(t,{type:ri});this.entries=dr(r?.themes),this.fromCache=!1,this.error="",Os(this.entries)}catch{let r=Ds();this.entries=r??[],this.fromCache=r!==null,this.error=b.loadError}finally{this.loading=!1,this.loaded=!0}}}setState(t,r){let o=new Map(this.states);r===null?o.delete(t):o.set(t,r),this.states=o}requestVars(t,r=!1){let o=he(t);if(!this.hassRef||this.inflight.has(o)||this.cache.has(o))return;let s=this.states.get(o);(s==="failed"||s==="limited")&&!(r&&!this.permanent.has(o))||s==="limited"&&(this.limitedUntil.get(o)??0)>Date.now()||(this.seen.add(o),this.atlas.state(t.full_name,this.mode,t.last_commit)==="none"&&(this.inflight.add(o),this.setState(o,"loading"),this.queue.add(()=>Ae(this.hassRef,this.known,t,!0)).then(a=>{let d=He(a.themes);if(!d)throw new Error(b.themeErrorDefault);let c=this.cache.set(o,d,a.summary?void 0:a.themes);this.refill(c),this.setState(o,null)}).catch(a=>{if(a instanceof me){this.setState(o,null);return}let d=Ht(a);d==="permanent"&&this.permanent.add(o),d==="limited"&&this.limitedUntil.set(o,Date.now()+vr),this.setState(o,d==="limited"?"limited":"failed")}).finally(()=>this.inflight.delete(o))))}refill(t){if(!(this.visible.size>=xr))for(let r of t){let o=this.visible.has(r)?this.entryIndex.get(r):void 0;o&&this.requestVars(o)}}onAtlasChange(){this.requestUpdate();for(let t of this.seen){let r=this.entryIndex.get(t);r&&this.requestVars(r)}}watchCards(){let t=Array.from(this.renderRoot.querySelectorAll(".card[data-key]"));if(typeof IntersectionObserver>"u"){for(let r of t.slice(0,bp)){let o=this.entryIndex.get(r.dataset.key??"");o&&this.requestVars(o)}return}this.observer??=new IntersectionObserver(this.onIntersect,{rootMargin:"200px"});for(let r of t){let o=r.dataset.key??"";this.watched.get(r)!==o&&(this.watched.has(r)&&this.observer.unobserve(r),this.watched.set(r,o),this.observer.observe(r))}}async openEntry(t){let r=this.atlas.theme(t.full_name,t.last_commit)?.name,o=await Ei(this.hassRef,this.known,this.cache,this.bundles,t,r);return{entry:t,...o}}async refreshCatalog(){return await this.loadCatalog(),this.entries}visibleEntries(){return this.filtered(this.query.trim().toLowerCase()).map(t=>t.entry)}async selectTheme(t){if(!(this.busyName||!this.hassRef)){this.busyName=t.full_name,this.cardError=null;try{let r=await this.openEntry(t);this.dispatchEvent(new CustomEvent(Ss,{bubbles:!0,composed:!0,detail:r}))}catch(r){this.cardError={name:t.full_name,text:Ls(r)}}finally{this.busyName=""}}}setMode(t){this.modeTouched=!0,this.mode=t}cardModel(t,r,o){let s=this.hassRef?.themes?.themes,i=he(t),a=this.cache.get(i),d=a?void 0:this.states.get(i),c=this.atlas.state(t.full_name,this.mode,t.last_commit)==="ok";return{entry:t,key:i,mode:this.mode,vars:a?li(a,this.mode):null,atlas:this.atlas,atlased:c,failed:d==="failed"||d==="limited",limited:d==="limited",installed:o,installedKind:ni(t,r,this.installedSet,s,a),active:ti(r,this.currentTheme),license:this.atlas.theme(t.full_name,t.last_commit)?.license,busy:this.busyName!=="",opening:this.busyName===t.full_name,error:this.cardError?.name===t.full_name?this.cardError.text:""}}filtered(t){let r=[];for(let o of this.entries){if(t&&!Hs(o,t))continue;let s=this.cache.get(he(o)),i=this.atlas.theme(o.full_name,o.last_commit),a=this.known.of(o.full_name,[i?.name,s?.name]),d=ei(o,a,this.installedSet);mi(this.filter,o,s,i,d)&&r.push({entry:o,names:a,installed:d})}return r}visibleCards(t){return this.filtered(t).map(({entry:r,names:o,installed:s})=>$i(this.cardModel(r,o,s),()=>this.selectTheme(r)))}emptyText(t,r){return!this.loaded||this.loading||t>0?"":this.entries.length>0?r?b.noMatches:b.noFilterMatches:this.error?"":b.noThemes}render(){let t=this.query.trim().toLowerCase(),r=this.visibleCards(t),o=this.emptyText(r.length,t),s=[...this.states.values()].includes("loading");return l`
      <section>
        ${this.error?l`<p class="banner" role="alert">${this.error}</p>`:u}
        ${this.error&&!this.fromCache&&!this.loading?l`<button
              class="btn retry"
              type="button"
              @click=${()=>void this.loadCatalog()}
            >
              ${b.retry}
            </button>`:u}
        ${fi({mode:this.mode,filter:this.filter,query:this.query,onMode:i=>this.setMode(i),onFilter:i=>{this.filter=i},onSearch:this.onSearch})}
        <div class="live" role="status" aria-live="polite">
          ${this.fromCache?l`<p class="note">${b.cachedNote}</p>`:u}
          ${this.loading?l`<p>${b.loading}</p>`:u}
          ${o?l`<p>${o}</p>`:u}
          ${s?l`<span class="sr-only">${b.previewsLoading}</span>`:u}
        </div>
        <div class="grid">${r}</div>
      </section>
    `}};customElements.get("hats-lite-browse")||customElements.define("hats-lite-browse",Er);var pt=[];var yp=0,Mi=200;function N(e){yp+=1,pt.length>=100&&pt.shift(),pt[pt.length]=e.length>Mi?e.slice(0,Mi):e}var vp=new Set(["loadBackendTranslation","loadFragmentTranslation"]),wp=new Set(["call","send","set","fire","dispatch","post","put","patch","delete","remove","add","create","update","save","store","subscribe","unsubscribe","fetch","load","open","close","toggle","reload","restart","navigate","run","execute","invoke","emit","trigger","notify","turn","ws","api","login","logout","signout","upload","write","clear","reset","connect","disconnect","install","uninstall","enable","disable","start","stop","play","pause","push","publish","request","submit","register","revoke","refresh","resume","suspend","play","mute","press","click","dismiss","show","hide","edit","apply","change","select","activate","deactivate","cancel","confirm","reboot","shutdown","retry","sync","download","listen","attach","detach","mount","unmount","replace","insert","append","prepend","move","rename","copy","paste","kill","destroy","dispose","init","bootstrap","migrate","mutate"]),xp=/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;function ht(e){if(vp.has(e))return"loader";if(typeof e!="string")return"blocked";let n=e.match(xp);if(n===null)return"blocked";for(let t of n)if(wp.has(t.toLowerCase()))return"blocked";return"read"}var kp=/^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|config\/entity_registry\/list_for_display$|auth\/current_user$|render_template$|history\/stream$|logbook\/event_stream$|subscribe_entities$|subscribe_events$|energy\/get_prefs$|energy\/info$|energy\/fossil_energy_consumption$|energy\/solar_forecast$|weather\/subscribe_forecast$|todo\/item\/list$|todo\/item\/subscribe$|calendar\/event\/subscribe$|recorder\/statistics_during_period$|recorder\/statistic_during_period$|recorder\/get_statistics_metadata$)/,$p=new Set(["state_changed","entity_registry_updated","device_registry_updated","area_registry_updated","label_registry_updated","floor_registry_updated","lovelace_updated"]);function Tr(e){return typeof e=="string"&&$p.has(e)}var Ep=["/api/states","/api/config","/api/history","/api/logbook","/api/camera_proxy","/api/image_proxy","/api/media_player_proxy"],_r="x-http-method-override";function Fe(e){if(typeof e!="object"||e===null)return;let n={...e},t=n.type;if(typeof t=="string")return{type:t,msg:n}}function je(e){return e===void 0||!kp.test(e.type)?!1:e.type==="subscribe_events"?Tr(e.msg.event_type):!0}function Ue(e){return`ws:${e?e.type:"invalid"}`}var _p=/\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i,Tp=/@|%2f/i,Sp=/^[A-Za-z][A-Za-z0-9+.-]*:/;function Zt(e,n=!1){return typeof e!="string"||e===""||_p.test(e)||e.startsWith("//")||Tp.test(e.split(/[?#]/,1)[0])?!1:e.startsWith("/")?!0:n&&!Sp.test(e)}function Mp(e){return`/api/${e.split(/[?#]/,1)[0].replace(/^\/+/,"").replace(/^api\//,"")}`}function Jt(e){let n=Mp(e);return Ep.some(t=>n===t||n.startsWith(`${t}/`))}function Sr(e){if(e==null)return!1;let n=e;return typeof Headers<"u"&&e instanceof Headers?e.has(_r):Array.isArray(e)?e.some(t=>Array.isArray(t)&&String(t[0]).toLowerCase()===_r):typeof n=="object"?Object.keys(e).some(t=>t.toLowerCase()===_r):!1}function Qt(e){return typeof e=="string"?e:"invalid"}function en(e){return e==null||typeof e=="string"&&e.toUpperCase()==="GET"?"GET":null}function tn(e){return typeof e=="string"?e.toUpperCase():"invalid"}var x=Reflect.apply,fe=Reflect.has,re=Reflect.ownKeys,ge=Reflect.getOwnPropertyDescriptor,rn=Reflect.getPrototypeOf,Ai=Object.setPrototypeOf,Ci=Object.freeze,Pi=Reflect.defineProperty,ft=Array.isArray,Ri=Math.trunc,Ap=WeakMap.prototype.get,Cp=WeakMap.prototype.set,Fy=WeakMap.prototype.has,Pp=WeakSet.prototype.has,Rp=WeakSet.prototype.add,Dp=Object.prototype.hasOwnProperty,Op=Object.prototype.propertyIsEnumerable,Ip=Function.prototype.bind,Lp=Object.getOwnPropertyDescriptor(Map.prototype,"size")?.get,Hp=Object.getOwnPropertyDescriptor(Set.prototype,"size")?.get,Di=Date.prototype.getTime,Oi=Object.prototype.toString;function J(e,n){return x(Ap,e,[n])}function le(e,n,t){x(Cp,e,[n,t])}function mt(e,n){return x(Pp,e,[n])}function nn(e,n){x(Rp,e,[n])}function be(e,n){return x(Dp,e,[n])}function Ii(e,n){return x(Op,e,[n])}function Li(e,n){return x(Ip,e,[n])}function Mr(e,n){try{return x(e,n,[]),!0}catch{return!1}}function Ar(e){try{return x(Oi,e,[])}catch{return""}}function on(e){return Ar(e)==="[object Map]"&&Mr(Lp,e)}function sn(e){return Ar(e)==="[object Set]"&&Mr(Hp,e)}function Hi(e){return Ar(e)==="[object Date]"&&Mr(Di,e)}function Ni(e){return x(Di,e,[])}function Fi(e){try{return x(Oi,e,[])==="[object Promise]"}catch{return!1}}var ji=new WeakSet,Ui=new WeakSet;function Bi(e){if(!(typeof e!="object"||e===null)){nn(ji,e);for(let n of re(e)){let t=ge(e,n);t&&typeof t.get=="function"&&nn(Ui,t.get)}}}for(let e of[Object,Function,Array,Map,Set,WeakMap,WeakSet,Date,Promise,RegExp,Error,String,Number,Boolean,Symbol,ArrayBuffer,DataView])Bi(e.prototype);for(let e of["URL","URLSearchParams","Headers","Request","Response","Blob","EventTarget"]){let n=globalThis[e];typeof n=="function"&&Bi(n.prototype)}function R(e,n,t){let r=e;for(;r!==null;){let o=ge(r,n);if(o){if(be(o,"value"))return o.value;let s=o.get;if(typeof s!="function")return;let i=mt(ji,r)&&!mt(Ui,s);return x(s,i?t:e,[])}r=rn(r)}}function zi(){return{disposed:!1,unsubs:new Set,epoch:0,connections:new WeakMap}}function Ki(e){e.epoch+=1;for(let n of[...e.unsubs])try{n()}catch{continue}e.unsubs.clear()}var Np=new Set(["ready","disconnected"]);function Vi(e,n){if(typeof e!="object"||e===null)return;let t=J(n.connections,e);if(t)return t;let r=e,o=n,s=()=>{},i=(h,...p)=>{let g=R(r,h,void 0);if(typeof g!="function")throw new TypeError(`Connection has no ${h}`);return x(g,r,p)},a=new Map;async function d(h,p){if(n.disposed)return s;let g=o.epoch,E=await p((...T)=>{!n.disposed&&typeof h=="function"&&x(h,void 0,T)});if(typeof E!="function")return s;if(n.disposed||o.epoch!==g)return E(),s;let S=()=>{o.unsubs.delete(S)&&E()};return o.unsubs.add(S),S}let c={get connected(){return R(r,"connected",void 0)},get haVersion(){return R(r,"haVersion",void 0)},socket:void 0,suspendReconnectUntil:s,async sendMessagePromise(h){let p=Fe(h);if(je(p)&&!n.disposed)return i("sendMessagePromise",p.msg);N(Ue(p))},sendMessage(h,p){let g=Fe(h);if(je(g)&&!n.disposed)return i("sendMessage",g.msg,p);N(Ue(g))},async subscribeMessage(h,p,g){let v=Fe(p);return je(v)?d(h,E=>i("subscribeMessage",E,v.msg,g)):(N(Ue(v)),s)},async subscribeEvents(h,p){return Tr(p)?d(h,g=>i("subscribeEvents",g,p)):(N(`ws:subscribe_events:${typeof p=="string"?p:"invalid"}`),s)},addEventListener(h,p){if(typeof h!="string"||!Np.has(h)||typeof p!="function"){N(`event-listener:${typeof h=="string"?h:"invalid"}`);return}if(n.disposed)return;let g=a.get(h);if(g||(g=new Map,a.set(h,g)),g.has(p))return;let v=(T,...q)=>{n.disposed||x(p,c,[c,...q])},E=g,S=()=>{o.unsubs.delete(S)&&(E.delete(p),i("removeEventListener",h,v))};E.set(p,{forward:v,release:S}),i("addEventListener",h,v),o.unsubs.add(S)},removeEventListener(h,p){if(typeof h!="string")return;let g=a.get(h)?.get(p);g&&(a.get(h)?.delete(p),o.unsubs.delete(g.release),i("removeEventListener",h,g.forward))}};return Fp(c),le(n.connections,e,c),c}function Fp(e){for(let n of re(e)){let t=ge(e,n);if(!t)continue;let r=Object.create(null);r.configurable=!1,r.enumerable=t.enumerable,be(t,"value")?(r.value=t.value,r.writable=!1):(r.get=t.get,r.set=t.set),Pi(e,n,r)}}var bt=Set.prototype,Xi=Map.prototype,Yi=bt.has,gt=bt.add,jp=bt.delete,Zi=bt.values,Up=Object.getOwnPropertyDescriptor(bt,"size")?.get,Bp=Object.getOwnPropertyDescriptor(Xi,"size")?.get,zp=Xi.keys,Ji=Object.getPrototypeOf(new Set().values()).next,Kp=Object.getPrototypeOf(new Map().keys()).next,Rr=["union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"];function Cr(e){return typeof e=="object"&&e!==null||typeof e=="function"}function Pr(e,n,t){let r=[];for(;;){let o=x(n,e,[]);if(o.done)return r;r[r.length]=t(o.value)}}function Vp(e){return Pr(x(Zi,e,[]),Ji,n=>n)}function Wi(e,n){let t=new Set;for(let r=0;r<n.length;r+=1)x(gt,t,[n[r]]);return{size:e,has:r=>x(Yi,t,[r]),open(){let r=0;return{step:()=>r<n.length?{done:!1,value:n[r++]}:{done:!0},close(){}}}}}function Wp(e){let n=+e;if(n!==n)throw new TypeError("Set-like size is invalid");let t=Ri(n);if(t<0)throw new RangeError("Set-like size is negative");return t}function qp(e,n){if(!Cr(e))throw new TypeError("Set-like expected");let t=n.ownerOf(e),r=t??e;if(typeof r=="object"&&sn(r)){let a=Pr(x(Zi,r,[]),Ji,n.unwrap);return Wi(x(Up,r,[]),a)}if(typeof r=="object"&&on(r)){let a=Pr(x(zp,r,[]),Kp,n.unwrap);return Wi(x(Bp,r,[]),a)}let o=Wp(R(r,"size",e)),s=R(r,"has",e);if(typeof s!="function")throw new TypeError("Set-like has must be a function");let i=R(r,"keys",e);if(typeof i!="function")throw new TypeError("Set-like keys must be a function");return{size:o,has:a=>!!x(s,r,[t?a:n.view(a)]),open(){let a=x(i,r,[]);if(!Cr(a))throw new TypeError("Set-like keys must return an object");let d=R(a,"next",a);if(typeof d!="function")throw new TypeError("Set-like iterator next must be a function");return{step(){let c=x(d,a,[]);if(!Cr(c))throw new TypeError("Set-like iterator result must be an object");return R(c,"done",c)?{done:!0}:{done:!1,value:n.unwrap(R(c,"value",c))}},close(){let c=R(a,"return",a);typeof c=="function"&&x(c,a,[])}}}}}function Gp(e){let n=new Set;for(let t=0;t<e.length;t+=1)x(gt,n,[e[t]]);return n}function an(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return;n(r.value)}}function qi(e,n){let t=e.open();for(;;){let r=t.step();if(r.done)return!1;if(n(r.value))return t.close(),!0}}function Gi(e,n){for(let t=0;t<e.length;t+=1)if(n(e[t]))return!0;return!1}function Qi(e,n,t,r){let o=qp(t,r),s=Vp(n),i=s.length<=o.size,a=p=>x(Yi,n,[p]),d=Gp(s),c=p=>{x(gt,d,[p])},h=p=>{x(jp,d,[p])};switch(e){case"union":return an(o,c),d;case"intersection":{let p=new Set;if(i)for(let g=0;g<s.length;g+=1)o.has(s[g])&&x(gt,p,[s[g]]);else an(o,g=>{a(g)&&x(gt,p,[g])});return p}case"difference":if(i)for(let p=0;p<s.length;p+=1)o.has(s[p])&&h(s[p]);else an(o,h);return d;case"symmetricDifference":return an(o,p=>a(p)?h(p):c(p)),d;case"isSubsetOf":return s.length<=o.size&&!Gi(s,p=>!o.has(p));case"isSupersetOf":return s.length>=o.size&&!qi(o,p=>!a(p));default:return i?!Gi(s,o.has):!qi(o,a)}}var Dr=new WeakMap,oa=new WeakSet,Or=new WeakMap,ea=new WeakMap,ye=Map.prototype,Ce=Set.prototype,sa=new Map([["has",ye.has],["get",ye.get],["keys",ye.keys],["values",ye.values],["entries",ye.entries],["forEach",ye.forEach],[Symbol.iterator,ye[Symbol.iterator]]]),ia=new Map([["has",Ce.has],["keys",Ce.keys],["values",Ce.values],["entries",Ce.entries],["forEach",Ce.forEach],[Symbol.iterator,Ce[Symbol.iterator]]]),Xp=Object.getOwnPropertyDescriptor(ye,"size")?.get,Yp=Object.getOwnPropertyDescriptor(Ce,"size")?.get,Zp=Object.getPrototypeOf(new Map().entries()).next,Jp=Object.getPrototypeOf(new Set().values()).next,Qp=Promise.prototype.then,aa=new Map,la=new WeakSet,da=new Map,ca=new Map;function ua(e,n){for(let t of re(e)){if(t==="constructor")continue;let r=ge(e,t);r&&typeof r.value=="function"&&(la.add(r.value),n.set(t,r.value))}}ua(Object.prototype,ca);ua(Array.prototype,da);function ta(e,n){let t=ge(e,n);return t&&be(t,"value")?t.value:void 0}function pa(e,n,t){if(t){let o=da.get(n);if(o!==void 0&&ta(Array.prototype,n)===e)return o}let r=ca.get(n);if(r!==void 0&&ta(Object.prototype,n)===e)return r}for(let e of["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"])aa.set(e,Object.prototype[e]);var na=Ci(Object.create(null)),eh=new Set(["toString","toJSON","toLocaleString","valueOf"]),th=new Set(["get","getAll","has","toISOString"]);function nh(e){if(typeof e!="object"||e===null)return!1;if(ft(e))return!0;let n=rn(e);return n===Object.prototype||n===null}function rh(){throw new TypeError("Read-only")}function ha(e){let n=J(ea,e);if(n)return n;let t=function(){throw new TypeError("Read-only view: functions on this value cannot be called")};return Ai(t,null),le(ea,e,t),t}function dn(e){return typeof e!="object"||e===null?e:J(Or,e)??e}function oh(e,n){return(...t)=>{let r=[];for(let o=0;o<t.length;o+=1)r[o]=dn(t[o]);return D(x(e,n,r))}}function ma(e,n,t,r){let o=R(e,n,r);if(typeof o!="function")return D(o);if(mt(la,o))return o;let s=pa(o,n,ft(e));return s!==void 0?s:eh.has(n)||!t&&th.has(n)?oh(o,e):ha(o)}function*sh(e,n){for(;;){let t=x(n,e,[]);if(t.done)return;yield D(t.value)}}function ih(e,n,t){let r=ge(e,n);if(r)return ft(t)&&n==="length"?{value:R(e,n,void 0),writable:!0,enumerable:!1,configurable:!1}:be(r,"value")?{value:D(r.value),writable:!1,enumerable:r.enumerable,configurable:!0}:{get:()=>D(R(e,n,J(Dr,e))),set:void 0,enumerable:r.enumerable,configurable:!0}}function Ir(e){return{has:(n,t)=>fe(e,t),ownKeys:()=>re(e),getOwnPropertyDescriptor:(n,t)=>ih(e,t,n),getPrototypeOf:()=>rn(e),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1}}function ah(e){return{...Ir(e),get:(n,t,r)=>ma(e,t,!0,r)}}function lh(e){let n=Fi(e),t=(r,o)=>x(Qp,e,[s=>typeof r=="function"?r(D(s)):D(s),s=>{if(typeof o=="function")return o(D(s));throw D(s)}]);return{...Ir(e),getPrototypeOf:()=>na,get(r,o,s){return o==="constructor"||o==="__proto__"?na:n&&o==="then"?t:n&&o==="catch"?i=>t(void 0,i):n&&o==="finally"?i=>t(a=>(typeof i=="function"&&i(),a),a=>{throw typeof i=="function"&&i(),a}):ma(e,o,!1,s)}}}var dh=new Set([...sa.keys()]),ch=new Set([...ia.keys(),...Rr]),uh=new Set(Rr),ph=new Set(["keys","values","entries",Symbol.iterator]),hh={unwrap:dn,view:e=>D(e),ownerOf:e=>J(Or,e)};function ra(e,n,t){let r=t?ch:dh,o=t?ia:sa,s=t?Yp:Xp,i=t?Jp:Zp,a=new Proxy(n,{...Ir(e),get(d,c){if(c==="constructor"||c===Symbol.species)return R(e,c,a);if(c==="size")return x(s,e,[]);if(r.has(c)){if(uh.has(c))return v=>{let E=Qi(c,e,v,hh);return typeof E=="boolean"?E:D(E)};let g=o.get(c);return c==="get"?v=>D(x(g,e,[dn(v)])):c==="has"?v=>x(g,e,[dn(v)]):ph.has(c)?()=>sh(x(g,e,[]),i):(v,E)=>x(g,e,[(S,T)=>x(v,E,[D(S),D(T),a])])}let h=R(e,c,a);if(typeof h!="function")return D(h);let p=aa.get(c);return p!==void 0&&(p===h||pa(h,c,!1)===p)?c==="valueOf"?()=>a:(...g)=>x(p,e,g):rh}});return a}function ln(e,n){return le(Dr,e,n),nn(oa,n),le(Or,n,e),n}function D(e){if(typeof e=="function")return ha(e);if(typeof e!="object"||e===null||mt(oa,e))return e;let n=J(Dr,e);if(n)return n;if(Hi(e))return new Date(Ni(e));if(on(e))return ln(e,ra(e,new Map,!1));if(sn(e))return ln(e,ra(e,new Set,!0));if(!nh(e))return ln(e,new Proxy({},lh(e)));let t=ft(e)?[]:{};return ln(e,new Proxy(t,ah(e)))}var ba=new WeakMap,fa=new WeakMap,mh=Symbol("shared");function ya(e){let n=J(ba,e);n&&(n.state.disposed=!0,Ki(n.state))}function fh(e,n){let t=R(e,"connection",void 0),r=typeof t=="object"&&t!==null?t:e,o=J(fa,r);o||(o=new Map,le(fa,r,o));let s=o.get(n);if(s&&!s.disposed)return s;let i=zi();return o.set(n,i),i}var ga=new Map(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"].map(e=>[e,Object.prototype[e]])),gh="Preview closed: this read-only hass has been disposed";function va(e,n=mh){let t=e,r=fh(t,n),o=()=>{if(r.disposed)throw new Error(gh)},s=new Proxy({},{has(i,a){return a!=="auth"&&fe(t,a)},ownKeys(){return re(t).filter(i=>i!=="auth")},getOwnPropertyDescriptor(i,a){if(!(a==="auth"||!fe(t,a)))return{value:s[a],enumerable:!0,configurable:!0,writable:!1}},get(i,a){if(a==="auth")return;let d=R(t,a,s);if(a==="connection")return Vi(d,r);if(ga.has(a)&&d===ga.get(a))return a==="hasOwnProperty"?h=>h!=="auth"&&be(t,h):a==="valueOf"?()=>s:a==="toString"||a==="toLocaleString"?()=>"[object Object]":a==="isPrototypeOf"?()=>!1:h=>h!=="auth"&&Ii(t,h);if(typeof d!="function")return D(d);let c=d;switch(a){case"callService":return async(h,p)=>{N(`service:${String(h)}.${String(p)}`)};case"callWS":return async h=>{o();let p=Fe(h);if(je(p))return x(c,t,[p.msg]);N(Ue(p))};case"callApi":return async(h,p,...g)=>{if(o(),typeof h=="string"&&en(h)){if(!Zt(p,!0)||!Jt(p)){N(`api-path:${Qt(p)}`);return}return x(c,t,[h,p,...g])}N(`api:${tn(h)}`)};case"callApiRaw":return async(h,p,g,v,...E)=>{if(o(),typeof h!="string"||!en(h)){N(`api:${tn(h)}`);return}if(!Zt(p,!0)||!Jt(p)){N(`api-path:${Qt(p)}`);return}let S=typeof v=="object"&&v!==null?{...v}:v;if(Sr(S)){N("api-header:method-override");return}return x(c,t,[h,p,g,S,...E])};case"fetchWithAuth":return async(h,p)=>{if(o(),!Zt(h)||!Jt(h)){N(`fetch-path:${Qt(h)}`);return}if(p==null)return x(c,t,[h,p]);let g={...p};if(Sr(g.headers)){N("fetch-header:method-override");return}let v=g.method;if(!en(v)){N(`fetch:${tn(v)}`);return}return x(c,t,[h,g])};default:return ht(a)==="loader"?Li(c,t):ht(a)==="read"?(...h)=>D(x(c,t,h)):async()=>{N(String(a))}}},set(){return!1},defineProperty(){return!1},deleteProperty(){return!1},setPrototypeOf(){return!1},preventExtensions(){return!1}});return le(ba,s,{state:r}),s}function cn(e){return Number.isFinite(e)?Math.min(98,Math.max(2,e)):50}function wa(e,n){return n.width>0?cn((e-n.left)/n.width*100):50}function xa(e){return`inset(0 0 0 ${e}%)`}var bh="__default__",yh=6,vh=8,wh=160,ka=["light","switch","climate","cover","media_player","sensor","binary_sensor"],xh=new Set(["person","zone","sun","update","event","conversation","tts","todo","weather"]);function Lr(e){return e??bh}function kh(e){return O(e)&&e.code==="config_not_found"}function $h(e){let n=O(e)?e.message:e;return typeof n=="string"?Array.from(n).slice(0,wh).join(""):""}async function $a(e,n){try{return{status:"ok",config:await Xs(e,n)}}catch(t){return kh(t)?{status:"notfound"}:{status:"error",reason:$h(t)}}}async function Ea(e,n,t){let r=[];for(let o of e){let s=await n(o.url_path);if(t())return{entries:r,stale:!0};if(r.push(s),s.status==="ok"&&yt(s.config))return{hit:{entry:s,urlPath:o.url_path},entries:r,stale:!1}}return{entries:r,stale:!1}}function yt(e){return e?fr(e).some(n=>gr(n).length>0):!1}function _a(e){let n=new Map;for(let i of Object.keys(e??{})){let a=i.indexOf(".");if(a<=0)continue;let d=i.slice(0,a),c=n.get(d)??[];c.push(i),n.set(d,c)}let t=[...n.keys()].filter(i=>!ka.includes(i)&&!xh.has(i)).sort(),r=[...ka.filter(i=>n.has(i)),...t];r.length===0&&(r=[...n.keys()].sort());let o=new Map(Object.entries(f.domainTitles)),s=r.slice(0,yh).map(i=>({type:"entities",title:o.get(i)??i,entities:(n.get(i)??[]).sort().slice(0,vh)}));if(s.length!==0)return{views:[{title:f.sampleView,cards:s}]}}function Ta(e){return e.status==="notfound"?f.generatedDefault:e.reason?`${f.loadError} ${e.reason}`:f.loadError}function Sa(e,n){let t=e?fr(e):[];if(t.length===0)return{views:t,cards:[],notice:f.noViews};if(!yt(e))return{views:t,cards:[],notice:f.noCards};let r=gr(t[n]??t[0]);return br(r)>Us?{views:t,cards:[],notice:f.tooManyCards}:{views:t,cards:r,notice:r.length===0?f.emptyView:""}}function Ma(e,n){return e.find(t=>t.url_path===n)?.title??f.defaultDashboard}var Eh="hats_lite_compare",_h="hats_lite_compare_designer";function Aa(e){return e?Eh:_h}function Ca(e=!0){try{let n=window.localStorage.getItem(Aa(e));return n===null?e:n!=="0"}catch{return e}}function Pa(e,n=!0){try{window.localStorage.setItem(Aa(n),e?"1":"0")}catch{return}}var Da="hats_lite_preview_menu";var Oa={menu:"M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z",overview:"M13 3v6h8V3zM13 21h8V11h-8zM3 21h8v-6H3zM3 13h8V3H3z",map:"M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z",logbook:"M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 11h2v2H3zM3 17h2v2H3z",history:"M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z",energy:"M13 2 4 14h6l-1 8 9-12h-6z",settings:"M10.5 2h3l.5 2.6 1.8.8 2.2-1.5 2.1 2.1-1.5 2.2.8 1.8 2.6.5v3l-2.6.5-.8 1.8 1.5 2.2-2.1 2.1-2.2-1.5-1.8.8-.5 2.6h-3L10 20.4l-1.8-.8-2.2 1.5-2.1-2.1 1.5-2.2-.8-1.8L2 13.5v-3l2.6-.5.8-1.8-1.5-2.2L6 3.9l2.2 1.5 1.8-.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",bell:"M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4.5-5.8V4.5a1.5 1.5 0 0 0-3 0v.7A6 6 0 0 0 6 11v5l-2 2v1h16v-1z",search:"M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3zm0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z",more:"M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"},Ia=["overview","map","logbook","history","energy"],La=["settings","bell"];function Ha(){try{return window.localStorage.getItem(Da)!=="0"}catch{return!0}}function Na(e){try{window.localStorage.setItem(Da,e?"1":"0")}catch{return}}function Fa(e,n){return n&&e!=="phone"}var Ra={desktop:0,tablet:820,phone:390};function ja(e,n){return e==="desktop"?"100%":n?`calc(${Ra[e]}px + var(--hats-lite-sidebar-width))`:`${Ra[e]}px`}function Ua(e){return e?"calc(256px * var(--hats-lite-density-scale, 1))":"0px"}function Th(e){return e.startsWith("card-mod-")||e.startsWith("uix-")}function vt(e){if(!e)return!1;let n=e.entry;return(n?[n.vars,n.modes?.dark,n.modes?.light]:[e.vars]).some(r=>Object.keys(r??{}).some(Th))}var Sh="hats_lite/install_theme",Mh="hats_lite/uninstall_theme",Ba="hats-lite-theme-installed",Ah=12e3,wt=0,Ch=/^https:\/\/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;function za(e){let n=e?Ch.exec(e):null;return n?`https://my.home-assistant.io/redirect/hacs_repository/?${new URLSearchParams({owner:n[1],repository:n[2],category:"theme"}).toString()}`:void 0}function Ka(e){if(typeof e!="object"||e===null)return"";let n=e.code;return typeof n=="string"?n:""}function Ph(e,n="install"){let t=Ka(e),r=n==="install"?f.installErrors:f.uninstallErrors;return Object.prototype.hasOwnProperty.call(r,t)?r[t]:r.unknown}function Va(){return wt>0}var un=class{constructor(n){this.host=n;this.phase="idle";this.op="install";this.error="";this.stale=!1;this.epoch=0}set(n,t=""){this.phase=n,this.error=t,this.host.requestUpdate()}focus(n){this.host.updateComplete.then(()=>this.host.renderRoot.querySelector(n)?.focus())}button(){return this.op==="install"?".install":".uninstall"}clearTimer(){this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}dispose(){this.epoch+=1,this.clearTimer()}clearStale(){this.stale=!1}settle(n){this.phase!=="done"||this.op!==n||(this.clearTimer(),this.set("idle"))}begin(n){this.phase!=="idle"||wt>0||(this.op=n,this.set("confirm"),this.focus(".install-confirm"))}cancel(){this.phase==="confirm"&&(this.set("idle"),this.focus(this.button()))}reset(){this.stale=!1,this.epoch+=1,this.clearTimer(),(this.phase!=="idle"||this.error)&&this.set("idle")}async run(n,t,r,o){if(this.phase!=="confirm"||!n||wt>0)return;let s=this.epoch,i=this.op;this.set("busy"),this.focus(this.button()),wt+=1;let a=!1,d="";try{let c={type:i==="install"?Sh:Mh,full_name:t.fullName,hacs_id:t.hacsId};i==="uninstall"&&o&&(c.selected_theme=o),await P(n,c)}catch(c){if(a=Ka(c)==="reload_failed",d=Ph(c,i),!a){s===this.epoch&&this.set("idle",d),this.focus(this.button());return}}finally{wt-=1,this.host.requestUpdate()}r({fullName:t.fullName,partial:a}),s===this.epoch&&(i==="uninstall"&&(this.stale=!0),this.set(a?"idle":"done",d),!a&&(this.focus(this.button()),this.timer=setTimeout(()=>{this.timer=void 0,!(s!==this.epoch||this.phase!=="done")&&(this.set("idle",i==="install"?f.installTimeout:f.uninstallTimeout),r({fullName:t.fullName,partial:!0}))},Ah)))}};var Wa="hats-lite-preview-nav",Rh="select, input, textarea, [role='slider'], [contenteditable]";function qa(e){if(e.defaultPrevented||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return 0;let n=e.composedPath()[0];return n instanceof Element&&n.closest(Rh)?0:e.key==="ArrowLeft"?-1:1}function Be(e,n,t){let r=e+t;return r<0||r>=n?null:r}function Dh(e){return f.navPosition.replace("{name}",e.name).replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}function Oh(e,n){return e.locked===!0||Be(e.index,e.total,n)===null}function Ga(e){return l`
    <div class="nav" role="group" aria-label=${f.navGroup}>
      <span class="nav-info">
        <span class="nav-name">${e.name}</span>
        <span class="nav-pos">${f.navCount.replace("{index}",String(e.index+1)).replace("{total}",String(e.total))}</span>
      </span>
      <span class="sr-only" role="status" aria-live="polite">${e.pending?f.navLoading:e.error||Dh(e)}</span>
    </div>`}function Hr(e,n,t){let r=Oh(e,n),o=n===-1;return l`
    <div class=${o?"nav-side nav-side-prev":"nav-side nav-side-next"}>
      <button type="button" class=${o?"nav-btn nav-prev":"nav-btn nav-next"}
        aria-label=${o?f.navPrev:f.navNext} aria-disabled=${r?"true":"false"}
        @click=${()=>{r||t(n)}}>${o?"←":"→"}</button>
    </div>`}async function Xa(e,n,t){let r=window.hatsLite;if(!r)return f.trialUnavailable;try{return await r.startTrial(Ks(e),Vs(n,t)),""}catch{return f.trialFailed}}function Nr(e,n,t){if(e)return e;if(!n)return;let r=t?.themes?.darkMode?"dark":"light";return n===r?void 0:n}var ze=e=>e??u;function Fr(e){return e.show&&e.admin&&e.hasTarget}function jr(e){return e.stale||e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done")}function Ih(e){return e.op==="install"&&e.phase==="busy"?f.installBusy:e.op==="install"&&e.phase==="done"?f.installLoading:f.installButton}function Ya(e,n){let t=e.op==="install"&&(e.phase==="busy"||e.phase==="done"),r=t||e.locked||e.phase==="confirm";return l`<button type="button" class="btn primary success install" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} @click=${()=>{r||n.onBegin("install")}}>${Ih(e)}</button>`}function Lh(e){return e.op!=="uninstall"?f.uninstallButton:e.phase==="busy"?f.uninstallBusy:e.phase==="done"?f.uninstallUpdating:f.uninstallButton}function Za(e,n){if(!e.canUninstall)return u;let t=e.op==="uninstall"&&(e.phase==="busy"||e.phase==="done"),r=jr(e)||e.locked||e.inUse||e.phase==="confirm",o=()=>{r||n.onBegin("uninstall")};return l`
    <button type="button" class="btn danger uninstall" aria-busy=${t?"true":"false"} aria-disabled=${r?"true":"false"} aria-describedby=${ze(e.inUse?"uninstall-hint":void 0)} @click=${o}>${Lh(e)}</button>
    ${e.inUse?l`<p id="uninstall-hint" class="chip note">${f.uninstallSwitchFirst}</p>`:u}`}function Hh(e){return e?l`<a class="chip link hacs-link" href=${e} target="_blank" rel="noopener noreferrer">${f.hacsLink}</a>`:u}function Nh(e){return n=>{if(n.key==="Escape"){n.stopPropagation(),e.onCancel();return}if(n.key!=="Tab")return;let t=n.currentTarget,r=Array.from(t.querySelectorAll("button")),o=r[0],s=r[r.length-1],i=t.getRootNode().activeElement;n.shiftKey&&i===o?(n.preventDefault(),s.focus()):!n.shiftKey&&i===s&&(n.preventDefault(),o.focus())}}function Fh(e,n){let t=e.op==="uninstall",r=()=>{e.locked||n.onConfirm()},o=t?f.uninstallConfirmBody:f.installConfirmBody;return l`
    <div class="install-dialog" role="alertdialog" aria-labelledby="install-title" aria-describedby="install-body" @keydown=${Nh(n)}>
      <strong id="install-title">${t?f.uninstallConfirmTitle:f.installConfirmTitle}</strong>
      <p id="install-body">${o.replace("{repo}",e.repoName)}</p>
      <button type="button" class="btn install-confirm ${t?"danger":"primary success"}" aria-disabled=${e.locked?"true":"false"} @click=${r}>${t?f.uninstallConfirmYes:f.installConfirmYes}</button>
      <button type="button" class="btn install-cancel" @click=${n.onCancel}>${f.installCancel}</button>
    </div>`}function jh(e){return e.phase==="busy"?e.op==="install"?f.installBusy:f.uninstallBusy:e.phase==="done"?e.op==="install"?f.installWaiting:f.uninstallWaiting:""}function Ja(e,n){let t=e.phase==="confirm"&&(Fr(e)||e.canUninstall)?Fh(e,n):u,r=jh(e),o=l`<span class="sr-only install-status" role="status">${r}</span>`,s=u;e.show&&!e.admin?s=l`<p class="chip note">${f.adminOnly}</p>`:e.show&&!e.hasTarget&&(s=l`<p class="chip note">${f.installViaHacs}</p>`);let i=e.show&&(!e.admin||!e.hasTarget||e.error!=="");return l`${s}${t}${o}${i?Hh(e.hacs):u}`}var el="/hats_lite_static/real",Qa=/^\w[\w.-]*\/\w[\w.-]*\.webp$/,Uh=/^[0-9a-f]{7,40}$/,Bh={fetchIndex(){return fetch(`${el}/index.json`,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error(String(e.status));return e.json()})}},Ur=null;function zh(e){let n=e;if(!n||n.version!==1||!Array.isArray(n.items))return[];let t=[];for(let r of n.items){if(!r||typeof r!="object")continue;let{full_name:o,name:s,commit:i,dark:a,light:d}=r;if(typeof o!="string"||typeof s!="string"||typeof i!="string"||!Uh.test(i))continue;let c=typeof a=="string"&&Qa.test(a),h=typeof d=="string"&&Qa.test(d);!c&&!h||t.push({full_name:o,name:s,commit:i,dark:c?a:"",light:h?d:""})}return t}function tl(){return Ur||(Ur=Promise.resolve().then(()=>Bh.fetchIndex()).then(zh).catch(()=>[])),Ur}function nl(e,n,t){if(!(!n||!t))return e.find(r=>r.full_name===n&&r.name===t)}function rl(e,n){let t=n==="dark"?"light":"dark";for(let r of[n,t])if(e[r])return{url:`${el}/${e[r]}`,mode:r};return null}function ol(e,n){if(!e.available)return u;let t=r=>()=>{e.real!==r&&n(r)};return l`
    <div class="field look-switch">${f.lookLabel}
      <div class="seg" role="group" aria-label=${f.lookLabel}>
        <button type="button" class="look-real" aria-pressed=${e.real?"true":"false"} @click=${t(!0)}>${f.realLook}</button>
        <button type="button" class="look-live" aria-pressed=${e.real?"false":"true"} @click=${t(!1)}>${f.livePreview}</button>
      </div>
    </div>`}function sl(e,n,t){let r=rl(e,n);if(!r)return u;let o=f.realAlt.replace("{name}",e.name).replace("{mode}",f[r.mode].toLowerCase());return l`
    <figure class="real-look">
      <img src=${r.url} alt=${o} decoding="async" @error=${t} />
      <figcaption class="footnote real-caption">${f.realCaption.replace("{commit}",e.commit)}</figcaption>
    </figure>`}var il=M`
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
`;function xt(e){return l`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${xs`<path d=${Oa[e]} fill="currentColor" fill-rule="evenodd"></path>`}</svg>`}function al(e,n){return l`<div class=${n?"item selected":"item"}>${xt(e)}<span class="text">${f.shell[e]}</span></div>`}function Kh(){return l`
    <div class="sidebar">
      <div class="side-menu"><span class="side-burger">${xt("menu")}</span><span class="side-title">${f.shell.title}</span></div>
      <div class="side-list">${Ia.map((e,n)=>al(e,n===0))}</div>
      <div class="side-list fixed">
        ${La.map(e=>al(e,!1))}
        <div class="item user"><span class="avatar">${f.shell.profile.charAt(0)}</span><span class="text">${f.shell.profile}</span></div>
      </div>
    </div>`}function Vh(e){return l`
    <div class="appbar">
      <span class="hamburger">${xt("menu")}</span>
      <span class="title">${e}</span>
      <span class="tools">${xt("search")}${xt("more")}</span>
    </div>`}function Br(e){return l`
    <div class="shell" aria-hidden="true" inert>
      ${Kh()}
      <div class="main">${Vh(e)}<div class="cards" inert></div></div>
    </div>`}function ll(e,n){let t=e.frame==="phone",r=o=>()=>{e.menu!==o&&n.onMenu(o)};return l`
    <div class="field menu-switch">${f.menu}
      <div class="seg" role="group" aria-label=${f.menu}>
        <button type="button" class="menu-on" aria-pressed=${e.menu?"true":"false"} ?disabled=${t} @click=${r(!0)}>${f.on}</button>
        <button type="button" class="menu-off" aria-pressed=${e.menu?"false":"true"} ?disabled=${t} @click=${r(!1)}>${f.off}</button>
      </div>
    </div>`}function dl(e){return e?l`<p class="footnote mod-note" role="status">${f.modNote}</p>`:u}var Wh={normal:"1",compact:"0.85"},qh=["desktop","tablet","phone"],Gh=["normal","compact"],Xh=["dark","light"];function cl(e,n,t,r){return{applicable:jt(e),tryable:Ut(e),trying:n,collision:e.nameCollision?f.nameCollision.replace("{name}",e.name):"",repo:qs(e.repoUrl),error:t,pending:r.pending,install:r.install}}function ul(e,n){return!e||Object.keys(Bt(e,n)).length>0?"":f.noModeBlock.replace("{mode}",f[n].toLowerCase())}function zr(e,n,t){return l`<button type="button" aria-pressed=${n?"true":"false"} @click=${t}>${e}</button>`}function Yh(e,n){return e.url_path===null&&n?`${e.title} ${f.generatedSuffix}`:e.title}function Zh(e,n){let t=r=>()=>{e.compare!==r&&n.onCompare()};return l`
    <div class="field view-switch">${f.compareLabel}
      <div class="seg" role="group" aria-label=${f.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${e.compare?"true":"false"}
          ?disabled=${!e.canCompare||e.real} aria-describedby=${ze(e.real?"compare-hint":void 0)} @click=${t(!0)}>${f.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${e.compare?"false":"true"}
          ?disabled=${!e.canCompare||e.real} @click=${t(!1)}>${f.themeOnly}</button>
      </div>
      ${e.real?l`<span id="compare-hint" class="compare-hint">${f.compareHint}</span>`:u}
    </div>`}function pl(e,n){return l`
    <div class="toolbar">
      <label class="field">${f.dashboard}
        <select class="pill" @change=${n.onDashboard}>
          ${e.dashboards.map((t,r)=>l`<option value=${String(r)} .selected=${t.url_path===e.dashboardUrl}>${Yh(t,e.generatedDefault)}</option>`)}
        </select>
      </label>
      ${e.showViews?l`<label class="field">${f.view}
            <select class="pill" @change=${n.onView}>
              ${e.views.map((t,r)=>l`<option value=${String(r)} .selected=${r===e.viewIndex}>${Ys(t,r)}</option>`)}
            </select>
          </label>`:u}
      <div class="seg" role="group" aria-label=${f.device}>
        ${qh.filter(t=>!(t==="tablet"&&e.hide?.includes("tablet"))).map(t=>zr(f[t],e.frame===t,()=>n.onFrame(t)))}
      </div>
      <div class="seg" role="group" aria-label=${f.density}>
        ${Gh.map(t=>zr(f[t],e.density===t,()=>n.onDensity(t)))}
      </div>
      ${e.hide?.includes("mode")?u:l`<div class="seg" role="group" aria-label=${f.mode}>
        ${Xh.map(t=>zr(f[t],e.mode===t,()=>n.onMode(t)))}
      </div>`}
      ${ll({frame:e.frame,menu:e.menu},n)}
      ${ol({available:e.realAvailable,real:e.real},n.onLook)}
      ${Zh(e,n)}
    </div>`}function hl(e,n){let t=Fa(e.frame,e.menu);return l`
    <div class="frame" data-sidebar=${t?"on":"off"} style=${te({"--hats-lite-frame-width":ja(e.frame,t),"--hats-lite-sidebar-width":Ua(t),"--hats-lite-density-scale":Wh[e.density]})}>
      <div class=${e.comparing?"stage":"stage solo"}>
        <div class="pane current">${Br(e.title)}</div>
        <div class="pane candidate" style=${te(e.comparing?{clipPath:xa(e.split)}:{})}>${Br(e.title)}</div>
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
    ${dl(e.modNote)}`}function ml(e,n,t){return e?l`
    <div class="nav-frame">
      ${Ga(e)}
      ${Hr(e,-1,n)}
      ${Hr(e,1,n)}
      <div class="nav-content">${t}</div>
    </div>`:t}function fl(e,n){let t=jr(e.install),r=e.collision?"collision-note":void 0,o=e.install.inUse&&!e.collision,s=l`<button type="button" class="btn primary success apply" aria-describedby=${ze(r)} ?disabled=${!e.applicable||e.pending||t} @click=${n.onApply}>${e.collision&&!e.applicable?f.nameTaken:f.apply}</button>`;return l`
    <div class="actions">
      ${o?u:Fr(e.install)?Ya(e.install,n.install):s}
      ${o?u:l`<button type="button" class="btn try" aria-describedby=${ze(r)} ?disabled=${!e.tryable||e.trying||e.pending||t} @click=${n.onTry}>${f.tryButton}</button>`}
      ${o&&!e.install.canUninstall?l`<span class="chip ok in-use-chip">${f.inUseChip}</span>`:u}
      ${Za(e.install,n.install)}
      ${!e.applicable&&e.repo?l`<a class="chip link" href=${e.repo} target="_blank" rel="noopener noreferrer">${f.repoLink}</a>`:u}
      ${Ja(e.install,n.install)}
      ${e.collision?l`<p id="collision-note" class="chip warn collision" role="status">${e.collision}</p>`:u}
      ${e.error?l`<p class="error" role="alert">${e.error}</p>`:u}
    </div>`}var pn=class{constructor(n){this.host=n;this.onKeyDown=n=>{let t=qa(n),r=this.host.nav;t===0||!r||this.host.trying||Be(r.index,r.total,t)===null||(n.preventDefault(),this.moveBy(t))};this.flow=new un(n),n.addController(this)}hostConnected(){this.host.addEventListener("keydown",this.onKeyDown)}hostDisconnected(){this.flow.dispose(),this.host.removeEventListener("keydown",this.onKeyDown)}hostUpdate(){let{candidate:n,install:t}=this.host;n&&this.flow.settle(n.installed?"install":"uninstall"),n&&!n.installed&&this.flow.clearStale();let r=(t??this.host.uninstall)?.fullName;if(n!==this.watched||r!==this.watchedKey){let o=n?.name===this.watched?.name&&r===this.watchedKey;this.watched=n,this.watchedKey=r,o||this.flow.reset()}}moveBy(n){let t=this.host.nav;!t||this.host.trying||Be(t.index,t.total,n)===null||this.host.dispatchEvent(new CustomEvent(Wa,{detail:{direction:n},bubbles:!0,composed:!0}))}apply(){let{candidate:n,hass:t}=this.host;if(!n||!jt(n)||this.host.nav?.pending)return;let r={theme:n.name},o=Nr(this.host.userMode,this.host.mode,t);o&&(r.dark=o==="dark"),this.host.dispatchEvent(new CustomEvent("settheme",{detail:r,bubbles:!0,composed:!0}))}async tryTheme(){let{candidate:n,hass:t}=this.host;!n||!Ut(n)||this.host.trying||this.host.nav?.pending||(this.host.error="",this.host.trying=!0,this.host.error=await Xa(t,n,Nr(this.host.userMode,this.host.mode,t)),this.host.trying=!1)}selected(){let n=this.host.hass;return n?.selectedTheme?.theme??n?.themes?.theme??"default"}installModel(n){let t=this.host.hass?.user?.is_admin===!0,r=this.host.install??this.host.uninstall,o=this.host.nav?.pending===!0;return{show:!n.installed&&!n.nameCollision,admin:t,hasTarget:!!this.host.install,phase:this.flow.phase,op:this.flow.op,locked:Va()||o,error:this.flow.error,repoName:r?.fullName??n.name,hacs:za(n.repoUrl),canUninstall:t&&!!this.host.uninstall&&n.installed&&!n.nameCollision,stale:this.flow.stale,inUse:this.selected().toLowerCase()===n.name.toLowerCase()}}confirm(){let n=this.flow.op,t=n==="install"?this.host.install:this.host.uninstall;if(!t)return;let r=n==="uninstall"?this.selected():void 0;this.flow.run(this.host.hass,t,o=>this.host.dispatchEvent(new CustomEvent(Ba,{detail:o,bubbles:!0,composed:!0})),r)}render(){let n=this.host.candidate;if(!this.host.showActions||!n)return u;let t=cl(n,this.host.trying,this.host.error||this.flow.error,{pending:this.host.nav?.pending===!0,install:this.installModel(n)});return fl(t,{onApply:()=>this.apply(),onTry:()=>void this.tryTheme(),install:{onBegin:r=>this.flow.begin(r),onCancel:()=>this.flow.cancel(),onConfirm:()=>this.confirm()}})}};var gl=M`
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
`;var Jh="lovelace";async function bl(e){if(typeof e!="object"||e===null)return;let n=e,t=n.loadFragmentTranslation;if(typeof t!="function")return;let r,o=new Promise(s=>{r=setTimeout(s,3e3)});try{await Promise.race([Promise.resolve(t.call(n,Jh)).then(()=>{}),o])}catch{return}finally{clearTimeout(r)}}var vl=new Set(["states","entities","devices","areas","floors","labels","extendedEntities","config","themes","selectedTheme","user","panels","narrowViewport","hassRegistries","hassConfig"]),Qh=new Set(["localize","locale","hassInternationalization","hassFormatters","hassUi"]);function em(e){return typeof e=="string"&&(vl.has(e)||Qh.has(e))}function wl(e){if(typeof e!="object"||e===null||Array.isArray(e))return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null}function yl(e,n,t){let r=R(e,n,t);if(typeof r=="function"){let o=r;return ht(n)!=="read"?async()=>{N(`context:${String(n)}`)}:(...s)=>D(x(o,e,s))}return wl(r)?xl(r):D(r)}function xl(e){let n=new Proxy({},{has:(t,r)=>fe(e,r),ownKeys:()=>re(e),getOwnPropertyDescriptor:(t,r)=>fe(e,r)?{value:yl(e,r,n),enumerable:!0,configurable:!0,writable:!1}:void 0,get:(t,r)=>yl(e,r,n),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1});return n}function tm(e,n){return vl.has(e)?D(n):typeof n=="object"&&n!==null?wl(n)?xl(n):D(n):n}function nm(e){let n=e.getRootNode();return typeof ShadowRoot<"u"&&n instanceof ShadowRoot?n.host:e.parentElement}function kl(e){let n=new Set,t=!0,r=s=>{let i=s,{context:a,callback:d}=i;if(!t||!em(a)||typeof d!="function")return;let c=nm(e);if(!c)return;s.stopPropagation();let h=s.composedPath()[0],p=d,g=new Map,v=(S,T)=>{if(!t)return;let q=T;if(typeof T=="function"){let j=T,Y=g.get(j);if(!Y){let U=()=>{n.delete(U),g.delete(j),j()};Y=U,g.set(j,U),n.add(U)}q=Y}p(tm(a,S),q)},E=new Event("context-request",{bubbles:!0,composed:!0});Object.assign(E,{context:a,callback:v,subscribe:i.subscribe===!0,contextTarget:h}),c.dispatchEvent(E)};return e.addEventListener("context-request",r),Object.assign(()=>{t=!1,e.removeEventListener("context-request",r);for(let s of n)try{s()}catch{continue}n.clear()},{pending:()=>n.size})}var rm=["hass-action","hass-more-info","show-dialog","hass-toggle-menu","location-changed","hass-dock-sidebar","hass-edit-sidebar","hass-set-theme","hass-service-called","hass-reload-themes","hass-open-link","popstate","iron-overlay-opened","ll-show-dashboard","hass-kiosk-mode","hass-language-select","hass-vibrate","hass-suspend-when-hidden","hass-enable-shortcuts","hass-time-zone-select","hass-date-format-select","hass-time-format-select","hass-first-weekday-select","hass-number-format-select","hass-refresh-current-user","hass-quick-bar-trigger","hass-show-notifications"],om=["context-request","ll-custom","hass-notification","settheme","navigate","ll-open-dialog","hass-quick-bar","show-edit-card","ll-rebuild","hass-logout","config-refresh","dialog-closed","haptic"],sm=new Set(["value-changed","iron-resize","iron-select","iron-deselect","iron-activate","iron-items-changed","selected","selected-changed","expanded-changed","opened-changed","input","change","load","error","focus","blur","focusin","focusout","click","dblclick","auxclick","contextmenu","mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave","pointerdown","pointerup","pointermove","pointerover","pointerout","pointerenter","pointerleave","pointercancel","gotpointercapture","lostpointercapture","touchstart","touchmove","touchend","touchcancel","keydown","keyup","keypress","wheel","scroll","resize","select","submit","reset","toggle","slotchange","transitionend","animationend","dragstart","dragend","dragenter","dragover","dragleave","drop"]),im=new Set,am=/^(hass-|ll-|show-)/;function Sl(e){return am.test(e)&&!im.has(e)}var lm=200,kt=EventTarget.prototype.dispatchEvent,Ml=EventTarget.prototype.addEventListener,Al=EventTarget.prototype.removeEventListener,dm=window.addEventListener,cm=window.removeEventListener,um=Event.prototype.composedPath,pm=Object.getOwnPropertyDescriptor(Node.prototype,"parentNode")?.get,hm=Object.getOwnPropertyDescriptor(Node.prototype,"nodeType")?.get,$l=typeof ShadowRoot>"u"?void 0:Object.getOwnPropertyDescriptor(ShadowRoot.prototype,"host")?.get,mm=11,G=Reflect.apply,$t=new WeakSet,Cl=new Set,mn=new WeakMap,hn=new Set,Kr=new Map,Pl=0,Et=0,Ke=null;function Rl(e){e.stopPropagation()}function fn(e,n,t){let r=mn.get(e);r||(r=new Map,mn.set(e,r)),!r.has(n)&&(r.set(n,t),G(Ml,e,[n,Rl,{capture:t}]))}function El(e){try{if(G(hm,e,[])===mm&&$l)return G($l,e,[])}catch{return e}return e}function Dl(e){if(typeof e!="object"||e===null)return null;let n=El(e);for(;n;){if($t.has(n))return n;let t=null;try{t=G(pm,n,[])}catch{return null}n=t===null?null:El(t)}return null}function _l(e){if(Et===0)return;let n=G(um,e,[]),t=Dl(n.length>0?n[0]:e.target);t&&fn(t,e.type,Sl(e.type))}function fm(e,n){if(!hn.has(n)){if(hn.size>=lm)return!1;hn.add(n),Kr.set(n,_l),G(dm,window,[n,_l,{capture:!0}])}return fn(e,n,!1),!0}function Tl(e,n,t){let r=t.type,o=s=>s.stopPropagation();G(Ml,e,[r,o,{capture:!0}]);try{return G(kt,n,[t])}finally{G(Al,e,[r,o,{capture:!0}])}}function gm(){Ke||(Ke=function(n){if(Et===0||!n||typeof n.type!="string"||sm.has(n.type))return G(kt,this,[n]);let t=Dl(this);return t?Sl(n.type)?Tl(t,this,n):fm(t,n.type)?G(kt,this,[n]):(Pl+=1,Tl(t,this,n)):G(kt,this,[n])},Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:Ke}))}function bm(){for(let[e,n]of Kr)G(cm,window,[e,n,{capture:!0}]);Kr.clear(),hn.clear(),Pl=0,Ke&&EventTarget.prototype.dispatchEvent===Ke&&(Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:kt}),Ke=null)}function Ol(e){if(!$t.has(e)){$t.add(e),Cl.add(e),Et+=1;for(let n of rm)fn(e,n,!0);for(let n of om)fn(e,n,!1);gm()}}function Il(e){if(!$t.has(e))return;$t.delete(e),Cl.delete(e);let n=mn.get(e);if(n){for(let[t,r]of n)G(Al,e,[t,Rl,{capture:r}]);mn.delete(e)}Et-=1,Et===0&&bm()}var gn=class{sync(n){let t=n?.querySelector(".stage"),r=t instanceof HTMLElement?t:void 0;r!==this.current&&(this.release(),r&&(this.current=r,Ol(r),this.stopRelay=kl(r)))}release(){this.stopRelay?.(),this.stopRelay=void 0,this.current&&Il(this.current),this.current=void 0}};var ym={"markdown-code-background-color":"var(--primary-background-color)","table-row-background-color":"var(--primary-background-color)","table-row-alternative-background-color":"var(--secondary-background-color)","table-header-background-color":"var(--secondary-background-color)","data-table-background-color":"var(--card-background-color)","input-ink-color":"var(--primary-text-color)","input-label-ink-color":"var(--secondary-text-color)","input-idle-line-color":"color-mix(in srgb, var(--primary-text-color) 42%, transparent)","input-hover-line-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-disabled-ink-color":"var(--disabled-text-color)","input-disabled-fill-color":"color-mix(in srgb, var(--primary-text-color) 2%, var(--card-background-color))","input-disabled-line-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-outlined-idle-border-color":"color-mix(in srgb, var(--primary-text-color) 38%, transparent)","input-outlined-hover-border-color":"color-mix(in srgb, var(--primary-text-color) 87%, transparent)","input-outlined-disabled-border-color":"color-mix(in srgb, var(--primary-text-color) 6%, transparent)","input-dropdown-icon-color":"var(--secondary-text-color)","mdc-text-field-fill-color":"var(--input-fill-color)","mdc-text-field-ink-color":"var(--input-ink-color)","mdc-text-field-label-ink-color":"var(--input-label-ink-color)","mdc-text-field-idle-line-color":"var(--input-idle-line-color)","mdc-text-field-hover-line-color":"var(--input-hover-line-color)","mdc-text-field-disabled-fill-color":"var(--input-disabled-fill-color)","mdc-text-field-disabled-ink-color":"var(--input-disabled-ink-color)","mdc-text-field-disabled-line-color":"var(--input-disabled-line-color)","mdc-text-field-outlined-idle-border-color":"var(--input-outlined-idle-border-color)","mdc-text-field-outlined-hover-border-color":"var(--input-outlined-hover-border-color)","mdc-text-field-outlined-disabled-border-color":"var(--input-outlined-disabled-border-color)","chip-background-color":"color-mix(in srgb, var(--primary-text-color) 15%, transparent)","label-badge-background-color":"var(--card-background-color)","label-badge-text-color":"var(--primary-text-color)","state-inactive-color":"var(--disabled-text-color)","ha-color-text-primary":"var(--primary-text-color)","ha-color-text-secondary":"var(--secondary-text-color)","ha-color-text-disabled":"var(--disabled-text-color)","ha-color-border-neutral-quiet":"var(--divider-color)","ha-color-fill-neutral-quiet-resting":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))"},Hl={...ym,"state-active-color":"var(--amber-color, #ffc107)","state-light-active-color":"var(--state-active-color, #ffc107)","slider-color":"var(--primary-color)","paper-slider-active-color":"var(--primary-color)","mdc-theme-surface":"var(--card-background-color)","mdc-theme-on-surface":"var(--primary-text-color)","mdc-theme-primary":"var(--primary-color)","mdc-theme-secondary":"var(--accent-color)","input-fill-color":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))","mdc-select-fill-color":"var(--input-fill-color)","outline-color":"var(--divider-color)","switch-checked-color":"var(--primary-color)","switch-checked-button-color":"var(--switch-checked-color, var(--primary-color))","switch-checked-track-color":"var(--switch-checked-color, var(--primary-color))","state-icon-color":"var(--paper-item-icon-color, #44739e)"},vm={"primary-color":"rgb-primary-color","accent-color":"rgb-accent-color","primary-text-color":"rgb-primary-text-color","secondary-text-color":"rgb-secondary-text-color","card-background-color":"rgb-card-background-color","primary-background-color":"rgb-primary-background-color"},wm=/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,xm=/^(rgba?|hsla?)\(\s*([^)]*)\)$/i,km=/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)$/i;function Nl(e){return Math.max(0,Math.min(255,Math.round(e)))}function $m(e){let n=wm.exec(e);if(!n)return null;let t=n[1];return t.length<=4&&(t=[...t].map(r=>r+r).join("")),[0,2,4].map(r=>parseInt(t.slice(r,r+2),16))}function Em(e){let n=e.endsWith("%"),t=Number(n?e.slice(0,-1):e);return Number.isFinite(t)?n?t/100*255:t:null}function _m(e){let n=Number(e[0].replace(/deg$/i,"")),t=Number(e[1].replace(/%$/,""))/100,r=Number(e[2].replace(/%$/,""))/100;if(![n,t,r].every(Number.isFinite))return null;let o=a=>(a+n/30)%12,s=t*Math.min(r,1-r),i=a=>r-s*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[i(0),i(8),i(4)].map(a=>Nl(a*255))}function Tm(e,n){let t=n.split(/[\s,/]+/).filter(Boolean).slice(0,3);if(t.length<3)return null;if(e.startsWith("hsl"))return _m(t);let r=t.map(Em);return r.some(o=>o===null)?null:r.map(Nl)}function Ll(e){let n=e.trim().replace(/\s*!important$/i,""),t=$m(n);if(t)return t;let r=xm.exec(n);return r?Tm(r[1].toLowerCase(),r[2]):null}function Sm(e,n){let t=km.exec(e.trim());if(!t)return Ll(e);let r=n[t[1]];return typeof r=="string"?Ll(r):null}function Fl(e){let n={};for(let[t,r]of Object.entries(vm)){if(!(t in e)||r in e)continue;let o=Sm(e[t],e);o&&(n[r]=o.join(", "))}return n}var jl=new WeakMap;function Ul(e,n){let t=JSON.stringify(n);jl.get(e)!==t&&(jl.set(e,t),Js(e),dt(e,n))}var Mm=["lovelace-background","ha-card-border-radius","ha-card-box-shadow","ha-card-border-width","ha-card-border-color","ha-card-background","ha-card-backdrop-filter","primary-font-family","paper-font-body1_-_font-family","text-primary-color","rgb-primary-color","rgb-accent-color","rgb-primary-text-color","rgb-secondary-text-color","rgb-card-background-color","rgb-primary-background-color","light-primary-color","dark-primary-color","secondary-background-color","state-icon-color","paper-item-icon-color","disabled-text-color","divider-color","card-background-color","primary-background-color","primary-text-color","secondary-text-color","primary-color","accent-color","app-header-background-color","app-header-text-color","app-header-selection-bar-color","app-header-edit-background-color","app-header-edit-text-color","app-header-border-bottom","sidebar-background-color","sidebar-text-color","sidebar-icon-color","sidebar-selected-background-color","sidebar-selected-text-color","sidebar-selected-icon-color"];function Bl(e,n,t){let r={};for(let o of t)r[o]="initial";return{...r,...Hl,...Yt[n],...Fl(e),...e}}function zl(e,n,t,r){let o=e.querySelector(".pane.current"),s=e.querySelector(".pane.candidate"),i=Bs(n),a=i?Z(i,r):{},d=t?Bt(t,r):a,c=new Set([...Mm,...mr(i),...mr(t?.entry),...Object.keys(t?.vars??{}),...Object.keys(d)]);o instanceof HTMLElement&&Ul(o,Bl(a,r,c)),s instanceof HTMLElement&&Ul(s,Bl(d,r,c))}function Kl(e,n){e.querySelectorAll(".cards > *").forEach(t=>{t.hass=n})}var Vl=M`
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
`;var Am=M`
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
  .divider {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 3;
    width: 28px;
    margin-left: -14px;
    cursor: ew-resize;
    touch-action: none;
    outline: none;
  }
  .divider::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 13px;
    width: 2px;
    background: var(--hl-accent);
  }
  .divider::before {
    content: "";
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 0;
    width: 28px;
    height: 28px;
    margin-top: -14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  .divider:focus-visible::before {
    box-shadow: 0 0 0 3px var(--hl-focus), 0 2px 8px rgba(0, 0, 0, 0.35);
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
  @media (max-width: 899px) {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 5;
    }
  }
`,Wl=[z,K,Am,Vl];var Cm=2,Pm=98,Rm=5,Dm=10;function ql(e,n,t=!1,r=!1){if(r)return null;let o=t?Dm:Rm;switch(e){case"ArrowLeft":case"ArrowDown":return cn(n-o);case"ArrowRight":case"ArrowUp":return cn(n+o);case"Home":return Cm;case"End":return Pm;default:return null}}function Gl(e){let n=e.currentTarget;typeof n.setPointerCapture=="function"&&n.setPointerCapture(e.pointerId)}function Xl(e){let n=e.currentTarget;typeof n.releasePointerCapture=="function"&&n.releasePointerCapture(e.pointerId)}var bn=class{constructor(n){this.host=n;this.items=[];this.requested=!1;this.failed=new Set;this.shown=!1}sync(n){this.requested||!vt(n)||(this.requested=!0,tl().then(t=>{this.items=t,t.length&&this.host.requestUpdate()}))}item(n){if(!vt(n))return;let t=nl(this.items,n?.fullName,n?.name);return t&&!this.failed.has(t)?t:void 0}active(n){return!!this.item(n)&&this.pick!==!1}choose(n){this.pick=n,this.host.requestUpdate()}fail(n){let t=this.item(n);t&&(this.failed.add(t),this.host.requestUpdate())}leftReal(n){let t=this.active(n),r=this.shown&&!t;return this.shown=t,r}};var Yl=[".pane.current .cards",".pane.candidate .cards"],Vr=class extends A{constructor(){super(...arguments);this.showActions=!0;this.dashboards=[];this.dashboardUrl=null;this.views=[];this.viewIndex=0;this.cards=[];this.notice=f.loading;this.frame="desktop";this.density="normal";this.split=50;this.error="";this.trying=!1;this.defaultCompare=!0;this.menu=Ha();this.defaultGenerated=!1;this.usingSample=!1;this.cache=new Map;this.dashboardsLoaded=!1;this.configToken=0;this.buildToken=0;this.dragging=!1;this.actions=new pn(this);this.guard=new gn;this.real=new bn(this)}static{this.properties={hass:{attribute:!1},candidate:{attribute:!1},mode:{attribute:!1},showActions:{type:Boolean,attribute:"show-actions"},defaultCompare:{attribute:!1},hideControls:{attribute:!1},install:{attribute:!1},uninstall:{attribute:!1},nav:{attribute:!1},dashboards:{state:!0},dashboardUrl:{state:!0},views:{state:!0},viewIndex:{state:!0},cards:{state:!0},notice:{state:!0},frame:{state:!0},density:{state:!0},split:{state:!0},error:{state:!0},trying:{state:!0},compare:{state:!0},menu:{state:!0},defaultGenerated:{state:!0},usingSample:{state:!0}}}static{this.styles=[Wl,gl,il]}connectedCallback(){super.connectedCallback(),this.readOnlySource=void 0,this.hasUpdated&&this.attachHass(),this.guard.sync(this.renderRoot)}disconnectedCallback(){super.disconnectedCallback(),this.readOnly&&ya(this.readOnly),this.readOnly=void 0,this.guard.release()}willUpdate(t){t.has("mode")&&this.mode!==this.userMode&&(this.userMode=void 0)}updated(t){t.has("hass")&&this.hass&&!this.dashboardsLoaded&&this.loadDashboards(),this.attachHass(),this.applyVars(),this.real.sync(this.candidate),this.real.leftReal(this.candidate)&&!t.has("cards")&&this.buildCards(),this.dataset.scheme=this.hass?.themes?.darkMode?"dark":"light",t.has("cards")&&this.buildCards(),this.guard.sync(this.renderRoot)}comparing(){return this.real.active(this.candidate)?!1:this.compare??Ca(this.defaultCompare)}effectiveMode(){return this.mode??(this.hass?.themes?.darkMode?"dark":"light")}async loadDashboards(){let t=this.hass;if(!t)return;this.dashboardsLoaded=!0;try{this.dashboards=await Gs(t)}catch{this.dashboards=[{url_path:null,title:f.defaultDashboard}]}let r=++this.configToken;this.notice=f.loading;let o=await Ea(this.dashboards,i=>this.entryFor(i),()=>r!==this.configToken);if(o.stale)return;if(o.hit){this.dashboardUrl=o.hit.urlPath,this.applyEntry(o.hit.entry,o.hit.urlPath);return}this.dashboardUrl=null;let s=_a(t.states);if(s&&!o.entries.every(i=>i.status==="error")){this.sample=s,this.useSample();return}o.entries[0]&&this.applyEntry(o.entries[0],null)}async entryFor(t){let r=Lr(t),o=this.cache.get(r);if(o)return o;let s=this.hass,i=s?await $a(s,t):{status:"error",reason:""};return i.status!=="error"&&this.cache.set(r,i),t===null&&i.status==="notfound"&&(this.defaultGenerated=!0),i}async showDashboard(t){let r=++this.configToken;this.cache.has(Lr(t))||(this.notice=f.loading);let s=await this.entryFor(t);r===this.configToken&&this.applyEntry(s,t)}applyEntry(t,r){let o=t.status!=="ok"||!yt(t.config);if(this.sample&&r===null&&o){this.useSample();return}this.usingSample=!1,this.viewIndex=0,this.config=t.status==="ok"?t.config:void 0,t.status==="ok"?this.selectView():this.setState({views:[],cards:[],notice:Ta(t)})}useSample(){this.usingSample=!0,this.config=this.sample,this.viewIndex=0,this.selectView()}selectView(){this.setState(Sa(this.config,this.viewIndex))}setState(t){this.views=t.views,this.cards=t.cards,this.notice=t.notice}async buildCards(){let t=++this.buildToken,[r]=await Promise.all([zt(),bl(this.hass)]),o=await Promise.all(Yl.map(()=>this.buildPane(r)));t===this.buildToken&&(Yl.forEach((s,i)=>{let a=this.renderRoot.querySelector(s);a instanceof HTMLElement&&a.replaceChildren(...o[i])}),this.attachHass(!0))}buildPane(t){return Promise.all(this.cards.map(r=>Kt(t,r)))}attachHass(t=!1){let r=this.hass;r&&(r!==this.readOnlySource&&(this.readOnlySource=r,this.readOnly=va(r,this),t=!0),t&&this.readOnly&&Kl(this.renderRoot,this.readOnly))}applyVars(){zl(this.renderRoot,this.hass,this.candidate,this.effectiveMode())}onDashboard(t){let r=Number(t.target.value);this.dashboardUrl=this.dashboards[r]?.url_path??null,this.showDashboard(this.dashboardUrl)}onView(t){this.viewIndex=Number(t.target.value),this.selectView()}onKey(t){let r=ql(t.key,this.split,t.shiftKey,t.altKey||t.ctrlKey||t.metaKey);r!==null&&(t.preventDefault(),this.split=r)}onPointerDown(t){Gl(t),this.dragging=!0}onPointerMove(t){if(!this.dragging)return;let r=this.renderRoot.querySelector(".stage");r instanceof HTMLElement&&(this.split=wa(t.clientX,r.getBoundingClientRect()))}onPointerUp(t){this.dragging=!1,Xl(t)}setMode(t){this.userMode=t,this.mode=t;let r={detail:{mode:t},bubbles:!0,composed:!0};this.dispatchEvent(new CustomEvent(As,r))}renderStageView(){let t=this.candidate;return hl({frame:this.frame,density:this.density,split:this.split,comparing:this.comparing()||!t,candidateName:t?t.name:f.noCandidate,note:ul(t,this.effectiveMode()),title:Ma(this.dashboards,this.dashboardUrl),menu:this.menu,modNote:vt(t)},{onKey:r=>this.onKey(r),onPointerDown:r=>this.onPointerDown(r),onPointerMove:r=>this.onPointerMove(r),onPointerUp:r=>this.onPointerUp(r)})}renderBody(){let t=this.real.active(this.candidate)&&this.real.item(this.candidate);return t?sl(t,this.effectiveMode(),()=>this.real.fail(this.candidate)):this.notice?l`<p class="notice" role="status">${this.notice}</p>`:this.renderStageView()}render(){let t=this.views.length>0&&yt(this.config);return l`
      ${ml(this.nav?{...this.nav,locked:this.trying}:null,r=>this.actions.moveBy(r),l`
          ${pl({dashboards:this.dashboards,dashboardUrl:this.dashboardUrl,generatedDefault:this.defaultGenerated,views:this.views,viewIndex:this.viewIndex,showViews:t,frame:this.frame,density:this.density,mode:this.effectiveMode(),compare:this.comparing(),canCompare:!!this.candidate,hide:this.hideControls,menu:this.menu,realAvailable:!!this.real.item(this.candidate),real:this.real.active(this.candidate)},{onDashboard:r=>this.onDashboard(r),onView:r=>this.onView(r),onFrame:r=>{this.frame=r},onDensity:r=>{this.density=r},onMode:r=>this.setMode(r),onMenu:r=>{this.menu=r,Na(r)},onLook:r=>this.real.choose(r),onCompare:()=>{this.candidate&&(this.compare=!this.comparing(),Pa(this.compare,this.defaultCompare))}})}
          ${this.usingSample?l`<p class="notice" role="status">${f.sampleNote}</p>`:u}
          ${this.renderBody()}
        `)}
      ${this.actions.render()}
    `}};customElements.get("hats-lite-preview")||customElements.define("hats-lite-preview",Vr);function Pe(e){return[1,3,5].map(n=>parseInt(e.slice(n,n+2),16))}function Wr(e){return Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")}function I(e){return`#${Wr(e[0])}${Wr(e[1])}${Wr(e[2])}`}function X(e,n,t){return[0,1,2].map(r=>Math.round(e[r]*t+n[r]*(1-t)))}function vn(e,n,t){return[0,1,2].map(r=>e[r]*t+n[r]*(1-t))}function qr(e){let n=e/255;return n<=.03928?n/12.92:((n+.055)/1.055)**2.4}function Zl(e){return .2126*qr(e[0])+.7152*qr(e[1])+.0722*qr(e[2])}function ve(e,n){let[t,r]=[Zl(e),Zl(n)].sort((o,s)=>s-o);return(t+.05)/(r+.05)}var V=[255,255,255],Ve=[0,0,0];function Gr(e){return ve(V,e)>=ve(Ve,e)?V:Ve}function yn(e,n){return Math.min(...n.map(t=>ve(e,t)))}function we(e,n,t){if(yn(e,n)>=t)return e;let r=yn(V,n)>=yn(Ve,n)?V:Ve;for(let o=1;o<=20;o+=1){let s=X(r,e,o/20);if(yn(s,n)>=t)return s}return r}function wn(e,n){return`rgba(${e[0]},${e[1]},${e[2]},${Number(n.toFixed(4))})`}var Om=[15,17,21],Im=[27,30,36],Lm=[240,242,245],Hm=[170,176,186],Nm=[20,23,27],Fm=[84,91,101],jm=7.2,Jl=7.1,Um=4.55,Xr=3.05,Bm=4.55;function zm(e){return Number.isFinite(e)?Math.min(60,Math.max(2,e)):2}function Km(e,n,t){let r=zm(n)/100;if(e==="light")return Math.min(1,.4+r);let o=r;for(;o>.02&&ve(V,vn(V,t,o))<jm;)o=Math.max(.02,Number((o-.005).toFixed(4)));return o}var Ql=/^#[0-9a-fA-F]{6}$/,We=2,Yr=60;function _t(e,n){if(n==="light"||!Ql.test(e))return Yr;let t=Tt(e,"dark",Yr).alpha;return Math.min(Yr,Math.max(We,Math.floor(t*100+1e-9)))}function xn(e,n){let t=Math.min(100,Math.max(0,Number.isFinite(e)?e:0));return Math.round(We+t/100*(n-We))}function ed(e,n){if(n<=We)return 0;let t=(e-We)/(n-We)*100;return Math.min(100,Math.max(0,Math.round(t)))}function td(e,n,t){return Ql.test(e)?Math.round(Tt(e,n,t).alpha*100):0}function Tt(e,n,t){let r=Pe(e),o=n==="dark",s=o?X(r,Om,.09):X(r,V,.055),i=o?X(r,Im,.1):X(r,V,.1),a=o?X(r,X(V,s,.05),.05):X(r,V,.025),d=Number(Km(n,t,s).toFixed(4));return{background:s,secondary:i,card:a,glass:vn(V,s,d),alpha:d}}function nd(e,n,t,r=20){let o=Pe(e),s=Pe(n),i=t==="dark",{background:a,secondary:d,card:c,glass:h,alpha:p}=Tt(e,t,r),g=[a,d,c,h],v=we(X(o,i?Lm:Nm,.06),g,Jl),E=we(X(o,i?Hm:Fm,.1),g,Um),S=Gr(o),T=we(s,g,Xr),q=we(o,g,Xr),j=i?X(o,[10,12,15],.07):X(o,V,.075),Y=vn(o,j,.18),U=we(o,[j,Y],Bm);return{"primary-color":I(o),"accent-color":I(s),"primary-background-color":I(a),"secondary-background-color":I(d),"card-background-color":I(c),"ha-card-background":wn(V,p),"primary-text-color":I(v),"secondary-text-color":I(E),"divider-color":wn(i?V:Ve,.12),"app-header-background-color":I(o),"app-header-text-color":I(S),"text-primary-color":I(S),"paper-tabs-selection-bar-color":I(we(s,[o],Xr)),"switch-checked-color":I(T),"switch-checked-button-color":I(Gr(T)),"paper-slider-active-color":I(q),"state-icon-color":I(T),"sidebar-background-color":I(j),"sidebar-text-color":I(we(v,[j],Jl)),"sidebar-selected-background-color":wn(o,.18),"sidebar-selected-text-color":I(U),"sidebar-selected-icon-color":I(U)}}var Zr=/^#[0-9a-fA-F]{6}$/,od=/^\/local\/hats_lite\/[0-9a-fA-F]{32}\.(png|jpg|webp|gif)$/,Vm=/^https:\/\/[^\s'"`\\(){}<>;]+$/,Wm=/\.\.|!important/i,qm=2e3;function sd(e){return typeof e=="string"&&od.test(e)}function kn(e,n,t){return typeof e!="number"||!Number.isFinite(e)?n:Math.min(t,Math.max(n,e))}function rd(e){if(typeof e!="string"||!Zr.test(e))throw new Error("Invalid color");return e}function Gm(e,n){if(typeof e!="string"||Wm.test(e))throw new Error("Invalid background");if(n==="url"&&e.length>qm)throw new Error("Background too long");if(!(n==="url"?Vm.test(e):od.test(e)))throw new Error("Invalid background");return e}function Jr(e){let n=rd(e.main),t=rd(e.accent),r=kn(e.radius,0,48),o=kn(e.blur,0,40),s=kn(e.tint,2,60),i={...nd(n,t,e.mode,s),"primary-color":n,"accent-color":t,"ha-card-border-radius":`${r}px`,"ha-card-backdrop-filter":`blur(${o}px)`},a=e.background;return a&&a.kind!=="none"&&(i["lovelace-background"]=`center / cover no-repeat fixed url('${Gm(a.value,a.kind)}')`),i}var Xm=3;function id(e){if(!Zr.test(e.main)||!Zr.test(e.accent))return[];let n=Pe(e.main),t=Pe(e.accent),{glass:r}=Tt(e.main,e.mode,kn(e.tint,2,60));return[{id:"main-card",ratio:ve(n,r)},{id:"accent-card",ratio:ve(t,r)}].filter(s=>s.ratio<Xm).map(s=>({id:s.id,ratio:Number(s.ratio.toFixed(2))}))}var Ym=/^[A-Za-z0-9_-]{1,80}$/,Zm=new Set(["__proto__","constructor","prototype","tostring","hasownproperty","valueof","__definegetter__","__definesetter__","__lookupgetter__","__lookupsetter__","isprototypeof","propertyisenumerable","tolocalestring"]),Jm=["javascript:","vbscript:","@import","expression(","behavior:","-moz-binding","image-set(","imageset(","src(","<","&#"],Qm=/&[a-z#]/i,ef=/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/,tf=/\/\*[\s\S]*?\*\//g,ad=/[\p{Z}\p{C}\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\u3164\u1160\u180e\u00ad\ufe00-\ufe0f]/gu,nf=/!\s*important\s*$/i,rf="lovelace-background";function ld(e){let n=e.toLowerCase();return n.startsWith("card-mod-")||n.startsWith("uix-")}function of(e,n){let t=e;for(let r=0;r<4;r+=1){let o=t.replace(nf,"").trimEnd(),s=ld(n)?o:o.replace(/;+\s*$/,"").trimEnd();if(s===t)break;t=s}return t}function sf(e){return e.replace(ad,"").normalize("NFKC").replace(tf,"").replace(ad,"").toLowerCase()}function dd(e,n){if(!Ym.test(e)||Zm.has(e.toLowerCase()))return"skip";if(e===rf)return"background";let t=of(n,e);if(!t||n.includes("\0")||ef.test(n)||t.includes("\\"))return"skip";let r=sf(t);return Jm.some(o=>r.includes(o))||Qm.test(r)?"skip":r.includes("url(")?"background":!ld(e)&&/[{};]/.test(r)?"skip":"ok"}var qe={main:"#03a9f4",accent:"#ff9800",radius:12,blur:10,tint:30,mode:"dark"},af=["dark","light"],lf=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,df=/^#([0-9a-f]{6})([0-9a-f]{2})?$/i,cf=/^rgba?\(\s*([^)]*?)\s*\)$/i,uf=/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i,pf=/blur\(\s*(\d*\.?\d+)\s*(px|rem|em)?\s*\)/i,cd=16,hf=300,mf=4096;function Re(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function St(e,n,t){return Math.min(t,Math.max(n,e))}function ff(e){let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n);return Number.isFinite(t)?St(Math.round(t),0,255):null}function gf(e){if(e===void 0)return;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?St(t,0,1):null}function Qr(e){if(typeof e!="string")return null;let n=e.trim(),t=lf.exec(n);if(t)return{hex:`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toLowerCase(),alpha:void 0};let r=df.exec(n);if(r)return{hex:`#${r[1]}`.toLowerCase(),alpha:r[2]?parseInt(r[2],16)/255:void 0};let o=cf.exec(n);if(!o)return null;let s=o[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);if(s.length<3||s.length>4)return null;let i=s.slice(0,3).map(ff),a=gf(s[3]);return i.some(d=>d===null)||a===null?null:{hex:I(i),alpha:a}}function bf(e){return typeof e=="string"?e:typeof e=="number"&&Number.isFinite(e)?String(e):null}function yf(e,n){if(!Re(e)||!Re(e.modes))return{};let t=e.modes[n];return Re(t)?t:{}}function vf(e,n){let t=bf(n),r=t===null||t.length>mf?"skip":dd(e,t);return{text:t,verdict:r}}function eo(e,n){let t={},r=new Map;if(!Re(e))return{vars:t,skipped:0,skippedKeys:[],wallpaper:0};for(let i of[e,yf(e,n)])for(let[a,d]of Object.entries(i)){if(a==="modes")continue;let{text:c,verdict:h}=vf(a,d);r.set(a,h),h==="ok"?t[a]=c:delete t[a]}let o=[...r].filter(([,i])=>i==="skip").map(([i])=>i),s=[...r.values()].filter(i=>i==="background").length;return{vars:t,skipped:o.length,skippedKeys:o,wallpaper:s}}function ud(e,n){return eo(e,n).vars}function to(e){return!Re(e)||!Re(e.modes)?[]:af.filter(n=>Re(e.modes[n]))}function wf(e){let n=e===void 0?null:uf.exec(e.trim());if(!n)return null;let t=(n[2]??"px").toLowerCase();return parseFloat(n[1])*(t==="px"?1:cd)}function xf(e){for(let n of["ha-card-backdrop-filter","backdrop-filter"]){let t=pf.exec(e[n]??"");if(t)return parseFloat(t[1])*((t[2]??"px").toLowerCase()==="px"?1:cd)}return null}function kf(e){for(let n of["ha-card-background","card-background-color"]){let t=Qr(e[n])?.alpha;if(t!==void 0)return t}return null}function $f(e,n){let t=to(e);return t.length===1?t[0]:n}function Ef(e,n,t){let r=n==="light"?(e-.4)*100:e*100,o=St(Math.round(r),2,60);return ed(o,_t(t,n))}function pd(e,n,t){let r=$f(e,n),o=ud(e,r),s=Qr(o["primary-color"])?.hex??t.main,i=Qr(o["accent-color"])?.hex??t.accent,a=wf(o["ha-card-border-radius"]),d=xf(o),c=kf(o);return{main:s,accent:i,mode:r,radius:a===null?t.radius:Math.round(St(a,0,48)),blur:d===null?t.blur:Math.round(St(d,0,40)),tint:c===null?t.tint:Ef(c,r,s)}}function _f(e,n,t,r){let o=ud(e,n);for(let[s,i]of Object.entries(r))t[s]!==i&&(o[s]=i);return o}function Tf(e,n){return{main:e.main,accent:e.accent,radius:e.radius,blur:e.blur,tint:xn(e.tint,_t(e.main,n)),background:{kind:"none"},mode:n}}function hd(e,n,t){let r=Jr(t);return e?_f(e,t.mode,Jr(Tf(n,t.mode)),r):r}function $n(e){return Object.keys(e).length>hf}var En={button:"Advanced",withDraft:"Open the full HATS designer. Your draft values travel in the address fragment; HATS must treat them as untrusted input.",plain:"Open the full HATS designer."};var Sf=700,Mf=2048,Af=200,md=/^#[0-9a-fA-F]{6}$/,Cf={radius:[0,48],blur:[0,40],tint:[0,100]},Pf=3e4,_n={available:!1,path:null},fd=new WeakMap;function gd(e){return typeof e!="string"||e.length===0||e.length>Af||!e.startsWith("/")||e.startsWith("//")||e.includes("\\")||e.includes("#")||e.includes("?")?!1:/^[\x21-\x7e]+$/.test(e)}function no(e,n){let[t,r]=Cf[n];return typeof e=="number"&&Number.isFinite(e)&&e>=t&&e<=r}function bd(e){let n=e;return!n||typeof n.main!="string"||typeof n.accent!="string"||!md.test(n.main)||!md.test(n.accent)||!no(n.radius,"radius")||!no(n.blur,"blur")||!no(n.tint,"tint")?null:{main:n.main.toLowerCase(),accent:n.accent.toLowerCase(),radius:Math.round(n.radius),blur:Math.round(n.blur),tint:Math.round(n.tint)}}function Rf(e){let n=bd(e);if(!n)return null;let t=JSON.stringify(n),r=btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");return`#lite=${r}`.length>Mf?null:`#lite=${r}`}function Df(e,n){return gd(e)?e+(Rf(n)??""):null}function Of(e,n,t=window){let r=Df(e,n);return r?(t.innerWidth<Sf?t.location.assign(r):t.open(r,"_blank","noopener"),!0):!1}function If(e,n){return Object.keys(e).every(r=>e[r]===n[r])?null:e}function yd(e){let n={main:e.main,accent:e.accent,radius:e.radius,blur:e.glassBlur,tint:e.tint};return If(n,e.baseControls)}function Lf(e){return typeof e=="object"&&e!==null&&e.code==="unknown_command"}function Hf(e){let n=fd.get(e.connection);if(n&&(n.failedAt===null||Date.now()-n.failedAt<Pf))return n.pending;let t={pending:Promise.resolve(_n),failedAt:null};return t.pending=P(e,{type:"hats_lite/advanced_info"}).then(r=>r&&r.available===!0&&gd(r.path)?{available:!0,path:r.path}:(t.failedAt=Date.now(),_n),r=>(Lf(r)||(t.failedAt=Date.now()),_n)),fd.set(e.connection,t),t.pending}var ro=class extends A{constructor(){super(...arguments);this.info=_n;this.onFocus=()=>{this.info.available||this.ask()}}static{this.properties={hass:{attribute:!1},draft:{attribute:!1},info:{state:!0}}}static{this.styles=M`
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
  `}connectedCallback(){super.connectedCallback(),window.addEventListener("focus",this.onFocus)}disconnectedCallback(){window.removeEventListener("focus",this.onFocus),super.disconnectedCallback()}ask(){let t=this.hass,r=t?.connection;!t||!r||(this.asked=r,Hf(t).then(o=>{this.asked===r&&(this.info=o)}))}willUpdate(){this.hass?.connection&&this.asked!==this.hass.connection&&this.ask()}render(){let t=this.info.available?this.info.path:null;if(!t)return u;let r=bd(this.draft)!==null;return l`<button type="button" data-action="advanced"
      title=${r?En.withDraft:En.plain}
      @click=${()=>Of(t,this.draft)}>${En.button}</button>`}};customElements.get("hats-lite-advanced")||customElements.define("hats-lite-advanced",ro);var y={baseLabel:"Start from",baseDefault:"Default",baseTooLarge:"This theme has too many variables (300 at most, counting the base plus the Designer keys). Pick another base.",baseMissing:"The base theme is no longer installed. The Designer went back to Default.",baseSkipped:"{count} variables of the base theme were left out because they cannot be saved safely.",valueRejected:"Some values were rejected as unsafe. Pick another base or change the values.",colors:"Colors",glance:"At a glance",onDashboard:"On your dashboard",shape:"Shape and glass",draftName:"Designer draft",mainColor:"Main color",accentColor:"Accent color",radius:"Corner radius",blur:"Glass blur",tint:"Card tint",mode:"Mode",modeDark:"Dark",modeLight:"Light",background:"Background",backgroundNone:"None",uploadLabel:"Upload a background image",uploadHint:"PNG, JPEG, WebP or GIF, up to 8 MiB",uploading:"Uploading...",uploadAdminOnly:"Only administrators can upload backgrounds.",uploadTooLarge:"Pick an image up to 8 MiB.",uploadType:"Pick a PNG, JPEG, WebP or GIF image.",uploadFailed:"Upload failed. The previous background is kept.",invalidColor:"Pick a valid color",invalidBackground:"This background is not allowed",backgroundTooLong:"This background address is too long (2000 characters at most).",restartReminder:"This theme uses an uploaded background. Backgrounds need a Home Assistant restart before they are served.",invalidInput:"Some values are not valid",saveTitle:"Save as theme",saveAdminOnly:"Only administrators can save themes.",nameLabel:"Theme name",nameInvalid:"Use 1 to 60 letters, digits, spaces, hyphens or underscores, starting with a letter or digit",saveButton:"Save as theme",saving:"Saving...",saved:"Theme saved",saveFailed:"Could not save the theme.",nameReserved:"This name is reserved. Pick another name.",nameExists:"A theme with this name already exists. Pick another name.",formatInvalid:"The theme could not be written in a valid format.",overwrote:"Saved. An existing theme with this name was replaced.",needsRestart:"Background uploaded. Backgrounds need a Home Assistant restart before they are served.",warnMainCard:"The main color is hard to see on cards (contrast {ratio}:1, 3:1 recommended).",warnAccentCard:"The accent color is hard to see on cards (contrast {ratio}:1, 3:1 recommended)."};function vd(e){let n=e?.themes?.themes;return!n||typeof n!="object"?[]:Object.keys(n).sort((t,r)=>t.localeCompare(r))}function wd(e,n,t){return l`
    <label class="field base">
      <span>${y.baseLabel}</span>
      <select class="pill" data-field="base" @change=${t}>
        <option value="" .selected=${n===""}>${y.baseDefault}</option>
        ${e.map(r=>l`<option value=${r} .selected=${n===r}>${r}</option>`)}
      </select>
    </label>
  `}function oo(e,n){if(!n)return;let t=e?.themes?.themes?.[n];if(t==null)throw new Error("Base theme missing");return t}function so(e,n){return n!==""&&!e?.themes?.themes?.[n]}function xd(e){let n=to(e);return n.length?n:["dark","light"]}function kd(e,n,t){if(!n||so(e,n))return 0;let r=e?.themes?.themes?.[n],o=new Set;for(let s of xd(r))eo(r,s).skippedKeys.forEach(i=>o.add(i));return o.size}function $d(e,n){let t=e?xd(e):["dark","light"],r={};for(let o of t){let s=n(o);if($n(s))throw new Error("Too many variables");r[o]=s}return{variables:r[t[0]],modes:r}}function Ed(e,n,t){let r=n?e?.themes?.themes?.[n]:void 0;return r?{base:n,controls:pd(r,t,qe)}:{base:"",controls:qe}}function _d(e,n,t,r){return l`
    ${e?l`<p class="hint" data-notice="base">${e}</p>`:u}
    ${n>0?l`<p class="hint" data-notice="skipped">${y.baseSkipped.replace("{count}",String(n))}</p>`:u}
    ${t===""&&r?l`<p class="error" role="alert">${r}</p>`:u}
  `}function Td(e,n){return l`
    <section class="group">
      <h3>${y.mode}</h3>
      <div class="seg" role="group" aria-label=${y.mode}>
        ${["dark","light"].map(t=>l`<button type="button" data-field="mode" data-mode=${t}
            aria-pressed=${String(e===t)}
            @click=${()=>n(t)}>${t==="dark"?y.modeDark:y.modeLight}</button>`)}
      </div>
    </section>
  `}function io(e){return l`
    <label class="range">
      <span class="range-head">
        <span>${e.label}</span>
        <span class="range-value" data-readout=${e.field}>${e.readout}</span>
      </span>
      <input type="range" min=${e.min} max=${e.max} step="1" data-field=${e.field}
        .value=${String(e.value)}
        @input=${e.onInput} />
    </label>
  `}function Sd(e,n,t,r){return l`
    <label class="color-row">
      <input type="color" data-field=${e} .value=${t} @input=${r} />
      <span class="color-text">
        <span>${n}</span>
        <span class="hex" data-readout=${e}>${t}</span>
      </span>
    </label>
  `}function Md(e){return l`
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
  `}function Ad(e){return l`
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
  `}var Cd=[z,K,M`
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
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
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
`];function ao(e,n){if(e&&typeof e=="object"&&"message"in e){let t=e.message;if(typeof t=="string"&&t.length>0)return t}return n}function Pd(e){return e.size>8388608?y.uploadTooLarge:Cs.includes(e.type)?null:y.uploadType}function Ff(e,n){let t={method:"POST",body:n};if(typeof e.fetchWithAuth=="function")return e.fetchWithAuth(lr,t);let r=e.auth?.data?.access_token??"";return fetch(lr,{...t,headers:{Authorization:`Bearer ${r}`}})}async function Rd(e,n){let t=new FormData;t.append("file",n);let r,o;try{r=await Ff(e,t),o=await r.json().catch(()=>({}))}catch{return{error:y.uploadFailed}}if(!r.ok)return{error:ao(o,y.uploadFailed)};let{url:s,needs_restart:i}=o;return sd(s)?{url:s,needsRestart:i===!0}:{error:y.uploadFailed}}var jf=/^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/,Uf={"main-card":y.warnMainCard,"accent-card":y.warnAccentCard};function Dd(e){return e.toLowerCase()==="default"?y.nameReserved:jf.test(e)?null:y.nameInvalid}function Od(e){let n=e&&typeof e=="object"?e.code:void 0;return n==="name_exists"?y.nameExists:n==="reserved_name"?y.nameReserved:n==="invalid_format"?y.formatInvalid:n==="invalid_value"?y.valueRejected:ao(e,y.saveFailed)}function Id(e){return e&&typeof e=="object"&&e.overwrote===!0?y.overwrote:y.saved}function Ld(e){return id(e).map(n=>Uf[n.id].replace("{ratio}",n.ratio.toFixed(1)))}function lo(e){let n=e instanceof Error?e.message:"";return n==="Invalid color"?{field:"color",message:y.invalidColor}:n==="Invalid background"?{field:"background",message:y.invalidBackground}:n==="Background too long"?{field:"background",message:y.backgroundTooLong}:n==="Base theme missing"?{field:"",message:y.baseMissing}:n==="Too many variables"?{field:"",message:y.baseTooLarge}:{field:"color",message:y.invalidInput}}function Hd(e,n){return n.kind==="upload"?`${e} ${y.restartReminder}`:e}var Bf=[],zf=["tablet","mode"],Kf=["base","main","accent","radius","glassBlur","tint","mode","background"],Nd={radius:{label:y.radius,min:0,max:48,unit:"px"},glassBlur:{label:y.blur,min:0,max:40,unit:"px"}},co=class extends A{constructor(){super(...arguments);this.dragOver=!1;this.base="";this.baseControls=qe;this.main="#03a9f4";this.accent="#ff9800";this.radius=12;this.glassBlur=10;this.tint=30;this.mode="dark";this.background={kind:"none"};this.errorField="";this.errorMessage="";this.themeName="";this.uploading=!1;this.uploadError="";this.uploadNotice="";this.saving=!1;this.saveMessage="";this.saveFailed=!1;this.baseNotice=""}static{this.properties={hass:{attribute:!1},base:{state:!0},main:{state:!0},accent:{state:!0},radius:{state:!0},glassBlur:{state:!0},tint:{state:!0},mode:{state:!0},background:{state:!0},candidate:{state:!0},errorField:{state:!0},errorMessage:{state:!0},themeName:{state:!0},uploading:{state:!0},uploadError:{state:!0},uploadNotice:{state:!0},saving:{state:!0},saveMessage:{state:!0},saveFailed:{state:!0},baseNotice:{state:!0},dragOver:{state:!0}}}static{this.styles=Cd}willUpdate(t){if(so(this.hass,this.base)){this.base="",this.baseControls=qe,this.baseNotice=y.baseMissing,this.rebuild();return}(!this.candidate||Kf.some(r=>t.has(r)))&&this.rebuild()}render(){let t=this.hass?.user?.is_admin===!0;return l`
      <div class="layout">
        <div class="controls">
          <hats-lite-advanced .hass=${this.hass} .draft=${yd(this)}></hats-lite-advanced>
          ${wd(vd(this.hass),this.base,r=>this.onBase(r))}
          ${_d(this.baseNotice,kd(this.hass,this.base,this.mode),this.errorField,this.errorMessage)}
          <section class="group">
            <h3>${y.colors}</h3>
            ${this.renderColor("main",y.mainColor)}
            ${this.renderColor("accent",y.accentColor)}
            ${this.errorField==="color"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${this.warnings().map(r=>l`<p class="hint" data-warning>${r}</p>`)}
          </section>
          <section class="group">
            <h3>${y.shape}</h3>
            ${Object.keys(Nd).map(r=>this.renderSlider(r))}
            ${this.renderTint()}
          </section>
          <section class="group">
            <h3>${y.background}</h3>
            <div class="choices">
              <button type="button" class="chip-btn" data-action="background-none"
                aria-pressed=${String(this.background.kind==="none")}
                @click=${()=>this.setBackground({kind:"none"})}>${y.backgroundNone}</button>
              ${Bf.map(r=>l`<button type="button" class="chip-btn"
                  aria-pressed=${String(this.background.kind==="preset"&&this.background.value===r.value)}
                  @click=${()=>this.setBackground({kind:"preset",value:r.value})}>${r.label}</button>`)}
            </div>
            ${this.errorField==="background"?l`<p class="error" role="alert">${this.errorMessage}</p>`:u}
            ${t?this.renderUpload():l`<p class="hint">${y.uploadAdminOnly}</p>`}
          </section>
          ${Td(this.mode,r=>this.setMode(r))}
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
            .hideControls=${zf}
            .defaultCompare=${!1}
            @hats-lite-mode-change=${r=>this.onPreviewMode(r)}
          ></hats-lite-preview>
        </div>
      </div>
    `}renderColor(t,r){return Sd(t,r,this[t],o=>this.setText(t,o))}renderSlider(t){let r=Nd[t];return io({label:r.label,readout:`${this[t]}${r.unit}`,field:t,min:r.min,max:r.max,value:this[t],onInput:o=>this.setNumber(t,o)})}renderTint(){let t=td(this.main,this.mode,this.tintValue(this.mode));return io({label:y.tint,readout:`${t}%`,field:"tint",min:0,max:100,value:this.tint,onInput:r=>this.setTint(r)})}tintValue(t){return xn(this.tint,_t(this.main,t))}setTint(t){this.tint=Number(t.target.value)}renderUpload(){return Md({over:this.dragOver,uploading:this.uploading,error:this.uploadError,notice:this.uploadNotice,onPick:()=>this.fileInput()?.click(),onDragOver:t=>this.onDragOver(t),onDragLeave:()=>{this.dragOver=!1},onDrop:t=>this.onDrop(t),onFile:t=>this.onFile(t)})}renderSave(){return Ad({name:this.themeName,saving:this.saving,message:this.saveMessage,failed:this.saveFailed,onName:t=>this.setName(t),onSave:()=>this.onSave()})}designerInput(t){return{main:this.main,accent:this.accent,radius:this.radius,blur:this.glassBlur,tint:this.tintValue(t),background:this.background,mode:t}}finalVars(t){let r=oo(this.hass,this.base),o=hd(r,this.baseControls,this.designerInput(t));if($n(o))throw new Error("Too many variables");return o}warnings(){return Ld(this.designerInput(this.mode))}rebuild(){try{let t=this.finalVars(this.mode);this.candidate={name:y.draftName,vars:t,installed:!1,canApply:!1},this.errorField="",this.errorMessage=""}catch(t){let r=lo(t);this.errorField=r.field,this.errorMessage=r.message}}buildModes(){try{return $d(oo(this.hass,this.base),t=>this.finalVars(t))}catch(t){this.saveFailed=!0,this.saveMessage=lo(t).message;return}}onBase(t){let r=t.target.value,o=Ed(this.hass,r,this.mode),s=o.controls;this.base=o.base,this.baseNotice="",this.baseControls=s,this.main=s.main,this.accent=s.accent,this.radius=s.radius,this.glassBlur=s.blur,this.tint=s.tint,this.mode=s.mode,this.background={kind:"none"},this.uploadNotice="",this.saveMessage=""}setText(t,r){this[t]=r.target.value}setNumber(t,r){this[t]=Number(r.target.value)}onPreviewMode(t){let r=t.detail?.mode;(r==="dark"||r==="light")&&(this.mode=r)}setMode(t){this.mode=t}fileInput(){return this.renderRoot.querySelector('input[type="file"]')}onDragOver(t){t.preventDefault(),this.dragOver=!0}onDrop(t){t.preventDefault(),this.dragOver=!1;let r=t.dataTransfer?.files?.[0];r&&this.handleFile(r,null)}setBackground(t){this.background=t,this.uploadNotice=""}setName(t){this.themeName=t.target.value}async onFile(t){let r=t.target,o=r.files?.[0];o&&await this.handleFile(o,r)}async handleFile(t,r){let o=this.hass;if(!o||this.uploading)return;let s=Pd(t);if(s){this.uploadError=s,r&&(r.value="");return}this.uploading=!0,this.uploadError="",this.uploadNotice="";try{let i=await Rd(o,t);"error"in i?this.uploadError=i.error:(this.background={kind:"upload",value:i.url},i.needsRestart&&(this.uploadNotice=y.needsRestart))}finally{this.uploading=!1,r&&(r.value="")}}async onSave(){let t=this.hass;if(!t)return;let r=this.themeName.trim(),o=Dd(r);if(o){this.saveFailed=!0,this.saveMessage=o;return}let s=this.buildModes();if(s){this.saving=!0,this.saveMessage="";try{let i=await P(t,{type:"hats_lite/save_theme",name:r,variables:s.variables,modes:s.modes});this.dispatchEvent(new CustomEvent(Ms,{bubbles:!0,composed:!0,detail:{name:r}})),this.saveFailed=!1,this.saveMessage=Hd(Id(i),this.background)}catch(i){this.saveFailed=!0,this.saveMessage=Od(i)}finally{this.saving=!1}}}};customElements.get("hats-lite-designer")||customElements.define("hats-lite-designer",co);function W(e){let n=e&&typeof e=="object"?e.code:void 0;return typeof n=="string"?n:"unknown"}var de="hats_lite/";async function uo(e){let n=await P(e,{type:`${de}people`});return Array.isArray(n?.people)?n.people:[]}function Fd(e,n){let t={type:`${de}assign`,user_id:n.user_id,theme:n.theme};return n.dark!==void 0&&(t.dark=n.dark),n.ends!==void 0&&n.ends!==null&&(t.ends=n.ends),P(e,t)}function jd(e,n){return P(e,{type:`${de}unassign`,override_id:n})}function Ud(e,n){return P(e,{type:`${de}set_opt_out`,opt_out:n})}function Bd(e,n,t){return P(e,{type:`${de}set_birthday`,user_id:n,...t})}function zd(e,n){return P(e,{type:`${de}set_birthday`,user_id:n,clear:!0})}async function Kd(e){let n=await P(e,{type:`${de}holidays_list`});return Array.isArray(n?.holidays)?n.holidays:[]}async function Vd(e,n){let t=await P(e,{type:`${de}holidays_set`,holidays:n});return Array.isArray(t?.holidays)?t.holidays:n}function Wd(e,n){return P(e,{type:`${de}assigners_set`,user_ids:n})}async function qd(e){try{return await uo(e),!0}catch(n){return W(n)!=="unknown_command"}}function po(){window.hatsLite?.refreshEffective?.()}function Tn(e){return{dark:void 0,primaryColor:void 0,accentColor:void 0,...e}}var Ge=[31,29,31,30,31,30,31,31,30,31,30,31];function Sn(e,n){return!Number.isInteger(e)||!Number.isInteger(n)||e<1||e>12?!1:n>=1&&n<=Ge[e-1]}function ho(e){let n=e.name.trim();return n.length===0||n.length>60?"name":!Sn(e.month_start,e.day_start)||!Sn(e.month_end,e.day_end)?"date":e.theme.length===0?"theme":null}function Xd(e,n){return!Number.isFinite(e)||e<=n||e>n+31622400?"invalid_range":null}function Vf(e,n,t){let r=n*32+t,o=e.month_start*32+e.day_start,s=e.month_end*32+e.day_end;return o<=s?r>=o&&r<=s:r>=o||r<=s}function mo(e,n){if(e.enabled===!1||ho(e)==="date")return[];let t=[],r=null;for(let o=1;o<=Ge[n-1];o+=1)Vf(e,n,o)?r?r.to=o:(r={from:o,to:o},t.push(r)):r=null;return t}var xe=e=>String(e).padStart(2,"0");function Yd(e,n){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:n,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"}).formatToParts(new Date(e)),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("year"),r("month"),r("day"),r("hour"),r("minute")]}catch{return null}}function Gd(e,n){let t=Yd(e,n);return t?Date.UTC(t[0],t[1]-1,t[2],t[3],t[4])-Math.floor(e/6e4)*6e4:null}function Zd(e,n){let t=Date.parse(`${e}Z`);if(!n||Number.isNaN(t))return Date.parse(e)/1e3;let r=Gd(t,n);if(r===null)return Date.parse(e)/1e3;let o=t-r,s=Gd(o,n)??r;return(t-s)/1e3}function fo(e,n){let t=n?Yd(e*1e3,n):null;if(t)return`${String(t[0]).padStart(4,"0")}-${xe(t[1])}-${xe(t[2])}T${xe(t[3])}:${xe(t[4])}`;let r=new Date(e*1e3);return`${r.getFullYear()}-${xe(r.getMonth()+1)}-${xe(r.getDate())}T${xe(r.getHours())}:${xe(r.getMinutes())}`}var go=[z,K,M`
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
  .holiday {
    padding: 12px 0;
    border-top: 1px solid var(--hl-line);
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
`],Jd=[z,K,M`
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
`];var m={title:"People",intro:"Choose who gets which theme, and when.",loading:"Loading people...",loadFailed:"Could not load the people list.",retry:"Try again",you:"You",admin:"Admin",optedOutChip:"Opted out",optOutLabel:"Do not let others change my theme",optOutOn:"Others can no longer change your theme.",optOutOff:"Others can change your theme again.",optOutShortcut:"Opt out",noOverride:"Using their own theme",setBy:e=>e?`Set by ${e}`:"Set by an administrator",overrideLine:e=>`Theme ${e}`,until:e=>`until ${e}`,noEnd:"until removed",assign:"Assign theme",startsNow:"This theme starts immediately and stays until the end time below.",unassign:"Remove",birthday:"Birthday",close:"Close",cancel:"Cancel",save:"Save",saving:"Saving...",assignTitle:e=>`Assign a theme to ${e}`,theme:"Theme",defaultTheme:"default",mode:"Mode",modeAuto:"Auto",modeDark:"Dark",modeLight:"Light",duration:"Until",untilNone:"Until removed",untilDate:"Until a date and time",untilInput:"End date and time",assigned:"Theme assigned.",selfApplied:"That is your own account, so the theme was applied to you directly.",unassigned:"Assignment removed.",birthdayTitle:e=>`Birthday for ${e}`,month:"Month",day:"Day",clear:"Clear birthday",birthdaySaved:"Birthday saved.",birthdayCleared:"Birthday cleared.",holidays:"Holidays",holidaysIntro:"Each holiday switches everyone to its theme during the range.",holidaysEmpty:"No holidays yet.",editHolidays:"Edit holidays",holidayEditorTitle:"Edit holidays",holidayName:"Name",holidayStart:"Starts",holidayEnd:"Ends",holidayEnabled:"Enabled",holidayRemove:"Remove holiday",holidayAdd:"Add holiday",holidayPreset:"Preset",holidayPresetPick:"Choose a preset",holidayPresetAdd:"Add preset",holidayCustom:"Add custom holiday",holidayCustomName:"New holiday",holidaysSaved:"Holidays saved.",timeline:"Next 12 months",timelineHoliday:(e,n)=>`${e}, ${n}`,problemName:"Enter a name of up to 60 characters.",problemDate:"This date does not exist in that month.",problemTheme:"Choose a theme.",problemUntil:"Pick a time in the future, within 366 days.",assigners:"Assigners",assignersTitle:"Who may assign themes",assignersHelp:"Assigners can set the theme of other non-admin users. Saving replaces the whole list.",assignersEmpty:"There are no non-admin users.",assignersSaved:"Assigners saved.",months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],errors:{unauthorized:"You are not allowed to do that.",invalid_user:"That user is no longer available.",unknown_theme:"That theme is not installed.",invalid_range:"That date range is not allowed.",limit_reached:"A limit was reached. Remove something and try again.",invalid_request:"The server did not accept those values.",not_found:"That item no longer exists.",save_failed:"The change could not be saved. Try again.",unknown_command:"This server does not support the People tab.",not_loaded:"The server is still starting. Try again in a moment.",rate_limited:"Too many requests. Wait a moment and try again.",invalid_format:"Those values are not in a valid format.",unknown:"Something went wrong. Try again."},missingTheme:e=>`missing: ${e}`,holidaysLoadFailed:"Could not load the holidays. Editing is off until they load.",unknownCode:e=>`Something went wrong (${e}). Try again.`,optedOut:e=>`${e} chose not to have their theme changed.`};function Xe(e,n){if(e==="opted_out")return m.optedOut(n??"This person");let t=m.errors[e];return t||(e==="unknown"?m.errors.unknown:m.unknownCode(e))}var qf='button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',bo=class extends A{constructor(){super(...arguments);this.heading="";this.busy=!1;this.onKey=t=>{if(t.key==="Escape"){if(t.stopPropagation(),this.busy)return;this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}));return}if(t.key!=="Tab")return;let r=this.focusables();if(r.length===0)return;let o=this.getRootNode().activeElement,s=t.shiftKey?r[0]:r[r.length-1];(o===s||!o||!this.contains(o))&&(t.preventDefault(),(t.shiftKey?r[r.length-1]:r[0]).focus())}}static{this.properties={heading:{type:String},busy:{type:Boolean}}}static{this.styles=go}firstUpdated(){this.focusables()[0]?.focus()}focusables(){return[...this.querySelectorAll(qf)].filter(t=>!t.disabled)}render(){return l`
      <div class="backdrop">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="title" @keydown=${this.onKey}>
          <h2 id="title">${this.heading}</h2>
          <slot></slot>
        </div>
      </div>
    `}},Q=class extends A{constructor(){super(...arguments);this.themes=[];this.busy=!1;this.error=""}static{this.properties={hass:{attribute:!1},themes:{attribute:!1},busy:{state:!0},error:{state:!0}}}static{this.styles=go}done(t){this.dispatchEvent(new CustomEvent("people-done",{detail:t,bubbles:!0,composed:!0}))}close(){this.busy||this.dispatchEvent(new CustomEvent("people-close",{bubbles:!0,composed:!0}))}async run(t,r){if(!(this.busy||!this.hass)){this.busy=!0,this.error="";try{let o=await t();o&&this.done(o)}catch(o){this.error=Xe(W(o),r)}finally{this.busy=!1}}}themeOptions(t){let r=[m.defaultTheme,...this.themes.filter(s=>s!==m.defaultTheme)],o=r.map(s=>l`<option value=${s} ?selected=${s===t}>${s}</option>`);return t&&!r.includes(t)&&o.push(l`<option value=${t} selected>${m.missingTheme(t)}</option>`),o}renderError(){return this.error?l`<p class="error" role="alert">${this.error}</p>`:u}renderActions(t,r=!1){return l`
      <div class="actions">
        <button class="btn" type="button" ?disabled=${this.busy} @click=${()=>this.close()}>${m.cancel}</button>
        <button class="btn primary" type="submit" ?disabled=${this.busy||r}>
          ${this.busy?m.saving:t}
        </button>
      </div>
    `}},yo=class extends Q{constructor(){super(...arguments);this.mode="auto";this.limited=!1;this.until="";this.startsNow=!1;this.theme=m.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(!r)return;let o=this.mode==="auto"?void 0:this.mode==="dark",s=Date.now()/1e3,i=null;if(this.limited&&(i=Zd(this.until,this.zone),Xd(i,s))){this.error=m.problemUntil;return}this.run(async()=>{if((await Fd(this.hass,{user_id:r.id,theme:this.theme,dark:o,ends:i}))?.self){let d=o===void 0?{theme:this.theme}:{theme:this.theme,dark:o};return{message:m.selfApplied,selfApply:Tn(d)}}return{message:m.assigned}},r.name)}}static{this.properties={...Q.properties,person:{attribute:!1},mode:{state:!0},limited:{state:!0},until:{state:!0},startsNow:{attribute:!1}}}get zone(){return this.hass?.config?.time_zone||void 0}render(){let t=this.person;if(!t)return u;let r=fo(Date.now()/1e3+60,this.zone),o=fo(Date.now()/1e3+31622400-3600,this.zone);return l`
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
    `}},vo=class extends Q{constructor(){super(...arguments);this.month=1;this.day=1;this.theme=m.defaultTheme;this.onSubmit=t=>{t.preventDefault();let r=this.person;if(r){if(!Sn(this.month,this.day)){this.error=m.problemDate;return}this.run(async()=>(await Bd(this.hass,r.id,{month:this.month,day:this.day,theme:this.theme,...this.dark===void 0?{}:{dark:this.dark}}),{message:m.birthdaySaved}),r.name)}};this.onClear=()=>{let t=this.person;t&&this.run(async()=>(await zd(this.hass,t.id),{message:m.birthdayCleared}),t.name)}}static{this.properties={...Q.properties,person:{attribute:!1},month:{state:!0},day:{state:!0}}}willUpdate(t){let r=this.person?.birthday;t.has("person")&&r&&(this.month=r.month,this.day=r.day,this.theme=r.theme,this.dark=r.dark)}render(){let t=this.person;return t?l`
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
                max=${Ge[this.month-1]}
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
    `:u}},wo=class extends Q{constructor(){super(...arguments);this.candidates=[];this.picked=new Set;this.onSubmit=t=>{t.preventDefault(),this.run(async()=>(await Wd(this.hass,[...this.picked]),{message:m.assignersSaved}))}}static{this.properties={...Q.properties,candidates:{attribute:!1},picked:{state:!0}}}willUpdate(t){t.has("candidates")&&(this.picked=new Set(this.candidates.filter(r=>r.is_assigner).map(r=>r.id)))}toggle(t,r){let o=new Set(this.picked);r?o.add(t):o.delete(t),this.picked=o}render(){let t=this.candidates.filter(r=>!r.is_admin);return l`
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
    `}},Gf=[["hats-lite-dialog-shell",bo],["hats-lite-assign-dialog",yo],["hats-lite-birthday-dialog",vo],["hats-lite-assigners-dialog",wo]];for(let[e,n]of Gf)customElements.get(e)||customElements.define(e,n);var xo=[{key:"new-year",name:"New Year",month_start:12,day_start:30,month_end:1,day_end:2},{key:"valentines",name:"Valentine's Day",month_start:2,day_start:13,month_end:2,day_end:14},{key:"st-patricks",name:"St. Patrick's Day",month_start:3,day_start:16,month_end:3,day_end:17},{key:"earth-day",name:"Earth Day",month_start:4,day_start:22,month_end:4,day_end:22},{key:"halloween",name:"Halloween",month_start:10,day_start:24,month_end:10,day_end:31},{key:"christmas",name:"Christmas",month_start:12,day_start:20,month_end:12,day_end:26}];function ko(e,n){if(!n.includes(e))return e;let t=2;for(;n.includes(`${e}-${t}`);)t+=1;return`${e}-${t}`}function Mn(e){let n=`${m.months[e.month_start-1]} ${e.day_start}`,t=`${m.months[e.month_end-1]} ${e.day_end}`;return n===t?n:`${n} - ${t}`}function Eo(e,n=new Date){let t=Array.from({length:12},(r,o)=>(n.getMonth()+o)%12+1);return l`
    <ol class="timeline" aria-label=${m.timeline}>
      ${t.map(r=>{let o=Ge[r-1],s=e.filter(i=>mo(i,r).length>0);return l`<li class="month">
          <span>${m.months[r-1]}</span>
          <div class="track">
            ${s.flatMap(i=>mo(i,r).map(a=>l`<i
                  class="bar"
                  style=${te({left:`${(a.from-1)/o*100}%`,width:`${(a.to-a.from+1)/o*100}%`})}
                ></i>`))}
          </div>
          ${s.map(i=>l`<span class="sr">${m.timelineHoliday(i.name,Mn(i))}</span>`)}
        </li>`})}
    </ol>
  `}var Yf={name:m.problemName,date:m.problemDate,theme:m.problemTheme},$o=class extends Q{constructor(){super(...arguments);this.loaded=!0;this.holidays=[];this.items=[];this.problems={};this.preset="";this.custom=0;this.addPreset=()=>{let t=xo.find(s=>s.key===this.preset);if(!t)return;let{key:r,...o}=t;this.items=[...this.items,{...o,id:ko(r,this.ids()),theme:m.defaultTheme,enabled:!0}]};this.addCustom=()=>{this.custom+=1;let t=ko(`custom-${this.custom}`,this.ids());this.items=[...this.items,{id:t,name:m.holidayCustomName,month_start:1,day_start:1,month_end:1,day_end:1,theme:m.defaultTheme,enabled:!0}]};this.onSubmit=t=>{t.preventDefault();let r={};for(let s of this.items){let i=ho(s);i&&(r[s.id]=i)}if(this.problems=r,Object.keys(r).length>0||!this.loaded)return;let o=this.items.map(s=>({...s,name:s.name.trim()}));this.run(async()=>(await Vd(this.hass,o),{message:m.holidaysSaved}))}}static{this.properties={...Q.properties,loaded:{type:Boolean},holidays:{attribute:!1},items:{state:!0},problems:{state:!0}}}willUpdate(t){t.has("holidays")&&(this.items=this.holidays.map(r=>({...r})))}ids(){return this.items.map(t=>t.id)}patch(t,r){this.items=this.items.map(i=>i.id===t?{...i,...r}:i);let{[t]:o,...s}=this.problems;this.problems=s}num(t,r){return o=>this.patch(t,{[r]:Number(o.target.value)})}monthSelect(t,r,o){return l`<select aria-label=${o} @change=${this.num(t.id,r)}>
      ${m.months.map((s,i)=>l`<option value=${i+1} ?selected=${t[r]===i+1}>${s}</option>`)}
    </select>`}renderItem(t){let r=this.problems[t.id],o=s=>`${s}: ${t.name}`;return l`
      <li class="holiday">
        <div class="row">
          <div class="field">
            <label for="n-${t.id}">${m.holidayName}</label>
            <input
              id="n-${t.id}"
              type="text"
              maxlength=${60}
              .value=${t.name}
              @input=${s=>this.patch(t.id,{name:s.target.value})}
            />
          </div>
          <div class="field">
            <span>${m.holidayStart}</span>
            <div class="row">
              ${this.monthSelect(t,"month_start",o(m.holidayStart+" "+m.month))}
              <input type="number" min="1" max="31" aria-label=${o(m.holidayStart+" "+m.day)} .value=${String(t.day_start)} @input=${this.num(t.id,"day_start")} />
            </div>
          </div>
          <div class="field">
            <span>${m.holidayEnd}</span>
            <div class="row">
              ${this.monthSelect(t,"month_end",o(m.holidayEnd+" "+m.month))}
              <input type="number" min="1" max="31" aria-label=${o(m.holidayEnd+" "+m.day)} .value=${String(t.day_end)} @input=${this.num(t.id,"day_end")} />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label for="t-${t.id}">${m.theme}</label>
            <select id="t-${t.id}" @change=${s=>this.patch(t.id,{theme:s.target.value})}>
              ${this.themeOptions(t.theme)}
            </select>
          </div>
          <label class="choice">
            <input type="checkbox" .checked=${t.enabled!==!1} @change=${s=>this.patch(t.id,{enabled:s.target.checked})} />
            ${m.holidayEnabled}
          </label>
          <button class="btn" type="button" aria-label=${o(m.holidayRemove)} @click=${()=>this.items=this.items.filter(s=>s.id!==t.id)}>
            ${m.holidayRemove}
          </button>
        </div>
        ${r?l`<p class="error" role="alert">${Yf[r]}</p>`:u}
      </li>
    `}render(){return l`
      <hats-lite-dialog-shell .heading=${m.holidayEditorTitle}>
        <form @submit=${this.onSubmit}>
          <div class="row">
            <div class="field">
              <label for="preset">${m.holidayPreset}</label>
              <select id="preset" @change=${t=>this.preset=t.target.value}>
                <option value="">${m.holidayPresetPick}</option>
                ${xo.map(t=>l`<option value=${t.key}>${t.name} (${Mn({...t,id:t.key,theme:""})})</option>`)}
              </select>
            </div>
            <button class="btn" type="button" id="add-preset" ?disabled=${!this.loaded} @click=${this.addPreset}>${m.holidayPresetAdd}</button>
            <button class="btn" type="button" id="add-custom" ?disabled=${!this.loaded} @click=${this.addCustom}>${m.holidayCustom}</button>
          </div>
          ${Eo(this.items)}
          <ul style="margin:0;padding:0;list-style:none">${this.items.map(t=>this.renderItem(t))}</ul>
          ${this.renderError()}${this.renderActions(m.save,!this.loaded)}
        </form>
      </hats-lite-dialog-shell>
    `}};customElements.get("hats-lite-holidays-dialog")||customElements.define("hats-lite-holidays-dialog",$o);var Zf=["override","birthday","holiday"],tc=/^(\d{4})-(\d{2})-(\d{2})$/,Qd=/^([01][0-9]|2[0-4]):[0-5][0-9]$/,nc=/^(\d{4})-(\d{2})$/;function ce(e,n=2){return String(e).padStart(n,"0")}function _o(e,n,t){return`${ce(e,4)}-${ce(n)}-${ce(t)}`}function Ze(e){return e.slice(0,7)}function ke(e){let n=tc.exec(e);return n?[Number(n[1]),Number(n[2]),Number(n[3])]:null}function Cn(e){let n=nc.exec(e);return n?[Number(n[1]),Number(n[2])]:null}function Pn(e){let[n,t]=Cn(e)??[1970,1];return new Date(Date.UTC(n,t,0)).getUTCDate()}function To(e,n){let[t,r]=Cn(e)??[1970,1],o=t*12+(r-1)+n;return`${ce(Math.floor(o/12),4)}-${ce(o%12+1)}`}function Ye(e,n){let[t,r,o]=ke(e)??[1970,1,1],s=new Date(Date.UTC(t,r-1,o+n));return _o(s.getUTCFullYear(),s.getUTCMonth()+1,s.getUTCDate())}function rc(e){let[n,t,r]=ke(e)??[1970,1,1];return new Date(Date.UTC(n,t-1,r)).getUTCDay()}function An(e,n){let[,,t]=ke(e)??[1970,1,1],r=To(Ze(e),n);return`${r}-${ce(Math.min(t,Pn(r)))}`}var Jf={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};function So(e){let n=e?.locale,t=Jf[n?.first_weekday??""];if(t!==void 0)return t;if(!n?.language)return 1;try{let r=new Intl.Locale(n.language).getWeekInfo?.();if(r&&r.firstDay>=1&&r.firstDay<=7)return r.firstDay%7}catch{return 1}return 1}function oc(e,n=new Date){let t=e?.config?.time_zone;try{let r=new Intl.DateTimeFormat("en-US",{timeZone:t||void 0,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(n),o=s=>Number(r.find(i=>i.type===s)?.value);return _o(o("year"),o("month"),o("day"))}catch{return _o(n.getFullYear(),n.getMonth()+1,n.getDate())}}function Mo(e){let[n]=ke(e)??[1970];return{min:`${ce(n-1,4)}-01`,max:`${ce(n+2,4)}-12`}}function sc(e,n){return(rc(`${e}-01`)-n+7)%7}function ec(e,n){let t=(rc(e)-n+7)%7;return{first:Ye(e,-t),last:Ye(e,6-t)}}function ic(e,n,t){switch(n){case"ArrowLeft":return Ye(e,-1);case"ArrowRight":return Ye(e,1);case"ArrowUp":return Ye(e,-7);case"ArrowDown":return Ye(e,7);case"Home":return ec(e,t).first;case"End":return ec(e,t).last;case"PageUp":return An(e,-1);case"PageDown":return An(e,1);default:return null}}function Qf(e){let n=e;if(!n||typeof n!="object"||!Zf.includes(n.kind)||typeof n.theme!="string")return null;let t={...n,kind:n.kind,source:String(n.source??n.kind),theme:n.theme};return delete t.partial,delete t.active_from,delete t.active_until,n.partial===!0&&Qd.test(String(n.active_from))&&Qd.test(String(n.active_until))&&(t.partial=!0,t.active_from=n.active_from,t.active_until=n.active_until),t}function eg(e){let n=e;if(!n||typeof n.date!="string"||!tc.test(n.date)||!Array.isArray(n.items))return null;let t=n.winner,r=t?.selection?.theme;return{date:n.date,winner:t&&typeof r=="string"?t:null,items:n.items.map(Qf).filter(o=>o!==null),conflict:n.conflict===!0}}function tg(e){let n=e;if(!n||typeof n.month!="string"||!nc.test(n.month)||!Array.isArray(n.days)||n.days.length!==Pn(n.month))return null;let t=n.days.map(eg);return t.some((r,o)=>r===null||r.date!==`${n.month}-${ce(o+1)}`)?null:{month:n.month,user:String(n.user??""),time_zone:String(n.time_zone??""),opt_out:n.opt_out===!0,trial:n.trial===!0,days:t}}async function ac(e,n,t){let r={type:"hats_lite/calendar",month:n};t&&(r.user=t);let o=tg(await P(e,r));if(!o||o.month!==n)throw{code:"unknown"};return o}function lc(e,n=new Date){try{let t=new Intl.DateTimeFormat("en-US",{timeZone:e||void 0,hourCycle:"h23",hour:"numeric",minute:"numeric",second:"numeric"}).formatToParts(n),r=o=>Number(t.find(s=>s.type===o)?.value);return[r("hour"),r("minute"),r("second")]}catch{return[n.getHours(),n.getMinutes(),n.getSeconds()]}}var k={viewLabel:"People view",list:"List",calendar:"Calendar",loading:"Loading the calendar...",loadFailed:"Could not load the calendar.",retry:"Try again",prev:"Previous month",next:"Next month",today:"Today",person:"Person",grid:e=>`Calendar for ${e}`,optedOut:"This person opted out of assigned themes, so nothing here is applied.",none:"No scheduled theme",detailTitle:"Selected day",noSelection:"Pick a day to see what applies.",effective:"Theme that applies",noEffective:"None, the person's own theme is used.",setBy:e=>`Set by ${e}`,setByAdmin:"an administrator",itemsHeading:"Everything on this day",wins:"Applies",loses:"Not applied",until:e=>`until ${e}`,untilRemoved:"until removed",conflict:"Conflict",conflictNote:"More than one item wants a different theme on this day.",preview:"Preview this day",previewMissing:"This theme is not installed, so it cannot be previewed.",assignNow:e=>`Assign now, until the end of ${e}`,assignLate:"There is less than two minutes left today. Pick another day to assign a theme.",trial:"A try is running; the schedule applies again when it ends",partialOnly:"Only part of the day has an assigned theme",appliesFrom:e=>`applies from ${e}`,untilTime:e=>`until ${e}`,partial:"Part of the day",editHolidays:"Edit holidays",kinds:{override:"Assignment",birthday:"Birthday",holiday:"Holiday"},itemName:e=>e.kind==="holiday"?e.name?`Holiday ${e.name}`:"Holiday":e.kind==="birthday"?"Birthday":e.assigned_by_name?`Assignment by ${e.assigned_by_name}`:"Assignment",cellLabel:(e,n)=>`${e}. ${n}`,winnerSummary:(e,n)=>`Theme ${e} from ${n}`,conflictSummary:(e,n,t)=>`Conflict: theme ${e} from ${n} wins over ${t}`,errors:{unauthorized:"You are not allowed to see that calendar.",invalid_user:"That user is no longer available.",invalid_request:"That month is outside the range the calendar can show.",not_loaded:"The server is still starting. Try again in a moment.",unknown:"Something went wrong. Try again."}};function dc(e){return k.errors[e]??k.loadFailed}function Rn(e,n){let t=ke(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{dateStyle:"full",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,t[2])))}catch{return e}}function Ao(e,n){let t=Cn(e);if(!t)return e;try{return new Intl.DateTimeFormat(n,{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(t[0],t[1]-1,1)))}catch{return e}}function cc(e,n){let t=(r,o)=>{try{return new Intl.DateTimeFormat(n,{weekday:r,timeZone:"UTC"}).format(new Date(Date.UTC(2024,0,7+o)))}catch{return String(o)}};return Array.from({length:7},(r,o)=>{let s=(e+o)%7;return{short:t("short",s),long:t("long",s)}})}function uc(e){return e?["override","birthday","holiday"].filter(n=>e.items.some(t=>t.kind===n)):[]}function pc(e){return e.items.find(n=>n.wins===!0&&n.partial!==!0)}function ng(e){return e.items.filter(n=>n!==pc(e)).map(n=>`${k.itemName(n)} (${n.theme})`).join(", ")}function hc(e,n){if(!e||e.items.length===0)return k.none;if(n)return k.optedOut;if(!e.winner)return k.partialOnly;let t=pc(e),r=t?k.itemName(t):e.winner.source,o=e.winner.selection.theme;return e.conflict?k.conflictSummary(o,r,ng(e)):k.winnerSummary(o,r)}function rg(e,n,t){try{return e.toLocaleString(n,t?{timeZone:t}:void 0)}catch{return e.toLocaleString(n)}}function Co(e,n,t){return e.kind!=="override"?"":e.until===null||e.until===void 0?k.untilRemoved:k.until(rg(new Date(e.until*1e3),n,t))}function Po(e){if(e.partial!==!0||!e.active_from||!e.active_until)return"";let n=e.active_from==="00:00"?"":k.appliesFrom(e.active_from),t=e.active_until==="24:00"?"":k.untilTime(e.active_until);return[n,t].filter(Boolean).join(" ")}function og(e){let n=e.day?.winner;if(!n||e.optOut)return l`<p class="muted" id="effective">${k.noEffective}</p>`;let t=e.day?.items.find(i=>i.wins===!0&&i.partial!==!0),r=n.selection.theme,o=n.selection.dark??e.darkMode,s=e.installed.includes(r);return l`
    <p id="effective"><strong>${r}</strong>${t?l` - ${k.itemName(t)}`:u}</p>
    ${t?.kind==="override"?l`<p class="muted">${k.setBy(t.assigned_by_name??k.setByAdmin)}</p>`:u}
    <div class="tools">
      <button class="btn" type="button" id="preview-day" ?disabled=${!s} @click=${()=>e.onPreview(r,o)}>${k.preview}</button>
    </div>
    ${s?u:l`<p class="muted">${k.previewMissing}</p>`}
  `}function sg(e){let n=e.day?.items??[];return n.length===0?u:l`
    <h4>${k.itemsHeading}</h4>
    ${e.day?.conflict?l`<p class="notice" id="conflict-note" role="status">${k.conflictNote}</p>`:u}
    <ul class="items">
      ${n.map(t=>l`<li class=${t.wins&&!t.partial?"won":"lost"} data-wins=${t.wins&&!t.partial?"true":"false"}>
          <span class="name">${k.itemName(t)}</span> - ${t.theme}
          <span class="chip ${t.wins?"ok":"warn"}">${t.partial?k.partial:t.wins?k.wins:k.loses}</span>
          ${Po(t)?l`<div class="muted">${Po(t)}</div>`:u}
          ${Co(t,e.locale,e.zone)?l`<div class="muted">${Co(t,e.locale,e.zone)}</div>`:u}
        </li>`)}
    </ul>
  `}function mc(e){return e.key?l`
    <h3 id="detail-title">${e.title}</h3>
    <h4>${k.effective}</h4>
    ${og(e)} ${sg(e)}
    <div class="tools">
      ${e.canAssign?l`<button class="btn" type="button" id="assign-until" ?disabled=${e.assignLate} @click=${e.onAssign}>${e.assignLabel}</button>`:u}
      ${e.canHolidays?l`<button class="btn" type="button" id="edit-holidays-cal" @click=${e.onHolidays}>${k.editHolidays}</button>`:u}
    </div>
    ${e.canAssign&&e.assignLate?l`<p class="muted" id="assign-hint">${k.assignLate}</p>`:u}
  `:l`<h3>${k.detailTitle}</h3><p class="muted">${k.noSelection}</p>`}var fc=[z,K,M`
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
    border: 1px solid var(--hl-edge);
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
`];var Ro=class extends A{constructor(){super(...arguments);this.people=[];this.view="list";this.status="idle";this.failure="";this.month="";this.data=null;this.selected="";this.focusKey="";this.userId="";this.token=0;this.stale=!1;this.onKey=t=>{let r=this.focusKey;if(t.key==="Enter"||t.key===" "){t.preventDefault(),this.selected=r;return}let o=ic(r,t.key,So(this.hass));o!==null&&(t.preventDefault(),Ze(o)===this.month?(this.focusKey=o,this.updateComplete.then(()=>this.cellOf(o)?.focus())):this.goTo(Ze(o),o))};this.onPerson=t=>{this.userId=t.target.value,this.data=null,this.load()}}static{this.properties={hass:{attribute:!1},people:{attribute:!1},view:{state:!0},status:{state:!0},failure:{state:!0},month:{state:!0},data:{state:!0},selected:{state:!0},focusKey:{state:!0},userId:{state:!0}}}static{this.styles=fc}get language(){return this.hass?.locale?.language}get zone(){return this.hass?.config?.time_zone||void 0}minutesLeft(){let[t,r,o]=lc(this.zone);return 1440-(t*60+r+o/60)}get today(){return oc(this.hass)}willUpdate(t){t.has("hass")&&this.hass&&this.month===""?(this.userId=this.hass.user?.id??"",this.month=Ze(this.today),this.focusKey=this.today):t.has("people")&&t.get("people")!==void 0&&this.status!=="idle"&&(this.view==="calendar"?this.load():this.stale=!0)}async load(){let t=this.hass;if(!t)return;let r=++this.token,o=this.month;this.stale=!1,this.status="loading";try{let s=await ac(t,o,this.userId||void 0);if(r!==this.token)return;this.data=s,this.failure="",this.status="ready"}catch(s){if(r!==this.token)return;let i=W(s);this.data=null,this.failure=dc(i),this.status=i==="unknown_command"?"unsupported":"error",this.status==="unsupported"&&this.setView("list")}}setView(t){t!==this.view&&(this.view=t,this.dispatchEvent(new CustomEvent("schedule-view",{detail:{view:t},bubbles:!0,composed:!0})),t==="calendar"&&(this.status==="idle"||this.stale)&&this.load())}async goTo(t,r){let o=Mo(this.today);t<o.min||t>o.max||(this.month=t,this.focusKey=r,this.data=null,await this.load(),await this.updateComplete,this.cellOf(r)?.focus())}cellOf(t){return this.renderRoot.querySelector(`[data-day="${t}"]`)}onPick(t){this.selected=t,this.focusKey=t}dayOf(t){return this.data?.days.find(r=>r.date===t)}canAssign(){let t=this.hass?.user,r=this.people.find(o=>o.id===this.userId);return r?r.id===t?.id?!0:t?.is_admin===!0||!r.is_admin&&this.people.some(o=>o.id!==t?.id):!1}detailModel(){let t=this.selected,r=this.dayOf(t),o=Object.keys(this.hass?.themes?.themes??{}),s=t>=this.today,i=this.zone;return{key:t,day:r,title:Rn(t,this.language),optOut:this.data?.opt_out===!0,installed:o,locale:this.language,zone:i,assignLabel:k.assignNow(Rn(t,this.language)),assignLate:t===this.today&&this.minutesLeft()<2,canAssign:s&&this.canAssign(),canHolidays:this.hass?.user?.is_admin===!0,darkMode:this.hass?.themes?.darkMode,onPreview:(a,d)=>this.dispatchEvent(new CustomEvent("hats-lite-preview-theme",{detail:{theme:a,dark:d},bubbles:!0,composed:!0})),onAssign:()=>this.dispatchEvent(new CustomEvent("schedule-assign",{detail:{userId:this.userId,until:`${t}T23:59`},bubbles:!0,composed:!0})),onHolidays:()=>this.dispatchEvent(new CustomEvent("schedule-holidays",{bubbles:!0,composed:!0}))}}renderSwitch(){return l`
      <div class="seg" role="group" aria-label=${k.viewLabel}>
        <button type="button" id="view-list" aria-pressed=${this.view==="list"?"true":"false"} @click=${()=>this.setView("list")}>${k.list}</button>
        <button type="button" id="view-calendar" aria-pressed=${this.view==="calendar"?"true":"false"} @click=${()=>this.setView("calendar")}>${k.calendar}</button>
      </div>
    `}renderCell(t,r){let o=this.dayOf(t),s=ke(t)?.[2]??0,i=uc(o),a=hc(o,this.data?.opt_out===!0);return l`<div class="cell" role="gridcell" aria-selected=${this.selected===t?"true":"false"}>
      <button
        type="button"
        class="day ${t===r?"today":""}"
        data-day=${t}
        tabindex=${this.focusKey===t?"0":"-1"}
        aria-current=${t===r?"date":u}
        aria-label=${k.cellLabel(Rn(t,this.language),a)}
        @click=${()=>this.onPick(t)}
      >
        <span class="num" aria-hidden="true">${s}</span>
        <span class="marks" aria-hidden="true">
          ${i.map(d=>l`<i class="dot ${d}" data-kind=${d}></i>`)}
          ${o?.conflict?l`<span class="conflict" data-conflict="true">!</span>`:u}
        </span>
      </button>
    </div>`}renderGrid(){let t=So(this.hass),r=this.today,o=sc(this.month,t),s=Pn(this.month),i=[...Array.from({length:o},()=>null),...Array.from({length:s},(d,c)=>`${this.month}-${String(c+1).padStart(2,"0")}`)];for(;i.length%7!==0;)i.push(null);let a=Array.from({length:i.length/7},(d,c)=>i.slice(c*7,c*7+7));return l`<div class="grid" role="grid" aria-label=${k.grid(Ao(this.month,this.language))} @keydown=${this.onKey}>
      <div class="row" role="row">
        ${cc(t,this.language).map(d=>l`<div class="head" role="columnheader" aria-label=${d.long}>${d.short}</div>`)}
      </div>
      ${a.map(d=>l`<div class="row" role="row">
          ${d.map(c=>c===null?l`<div class="cell" role="gridcell" aria-hidden="true"></div>`:this.renderCell(c,r))}
        </div>`)}
    </div>`}renderNav(){let t=Mo(this.today),r=o=>void this.goTo(To(this.month,o),An(this.focusKey||`${this.month}-01`,o));return l`<div class="bar">
      <button class="btn" type="button" id="prev" aria-label=${k.prev} ?disabled=${this.month<=t.min} @click=${()=>r(-1)}>&lsaquo;</button>
      <h3 class="title grow" id="month-title" aria-live="polite">${Ao(this.month,this.language)}</h3>
      <button class="btn" type="button" id="today" @click=${()=>void this.goTo(Ze(this.today),this.today)}>${k.today}</button>
      <button class="btn" type="button" id="next" aria-label=${k.next} ?disabled=${this.month>=t.max} @click=${()=>r(1)}>&rsaquo;</button>
      ${this.people.length>1?l`<label class="muted" for="person">${k.person}</label>
            <select id="person" @change=${this.onPerson}>
              ${this.people.map(o=>l`<option value=${o.id} ?selected=${o.id===this.userId}>${o.name}</option>`)}
            </select>`:u}
    </div>`}renderCalendar(){return this.status==="error"?l`${this.renderNav()}
        <p class="notice error" role="alert">${this.failure||k.loadFailed}</p>
        <button class="btn" type="button" id="retry-calendar" @click=${()=>void this.load()}>${k.retry}</button>`:l`
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
        <section class="card" aria-live="polite">${mc(this.detailModel())}</section>
      </div>
    `}render(){return!this.hass||this.status==="unsupported"?u:l`<div class="bar">${this.renderSwitch()}</div>
      ${this.view==="calendar"?this.renderCalendar():u}`}};customElements.get("hats-lite-schedule")||customElements.define("hats-lite-schedule",Ro);var Do=class extends A{constructor(){super(...arguments);this.people=[];this.holidays=[];this.status="idle";this.message="";this.failure="";this.dialog=null;this.holidaysLoaded=!1;this.holidaysFailure="";this.removing=new Set;this.calendarView=!1;this.opener=null;this.onClose=()=>{this.dialog=null;let t=this.opener;this.updateComplete.then(()=>t?.focus?.())};this.onScheduleAssign=t=>{let{userId:r,until:o}=t.detail,s=this.people.find(i=>i.id===r);s&&this.open({kind:"assign",person:s,until:o})};this.onDone=t=>{let r=t.detail;this.dialog=null,this.message=r.message,this.failure="",r.selfApply&&(this.dispatchEvent(new CustomEvent("settheme",{detail:r.selfApply,bubbles:!0,composed:!0})),po()),this.load();let o=this.opener;this.updateComplete.then(()=>o?.focus?.())}}static{this.properties={hass:{attribute:!1},people:{state:!0},holidays:{state:!0},status:{state:!0},message:{state:!0},failure:{state:!0},dialog:{state:!0},holidaysLoaded:{state:!0},holidaysFailure:{state:!0},removing:{state:!0},calendarView:{state:!0}}}static{this.styles=Jd}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load()}async load(){let t=this.hass;if(t){this.status!=="ready"&&(this.status="loading");try{this.people=await uo(t),this.status="ready"}catch(r){this.failure=Xe(W(r)),this.status="error";return}await this.loadHolidays()}}async loadHolidays(){let t=this.hass;if(t)try{this.holidays=await Kd(t),this.holidaysLoaded=!0,this.holidaysFailure=""}catch(r){this.holidaysLoaded=!1,this.holidaysFailure=Xe(W(r))}}get selfId(){return this.hass?.user?.id}get isAdmin(){return this.hass?.user?.is_admin===!0}get canAssign(){return this.isAdmin||this.people.some(t=>t.id!==this.selfId)}themeNames(){return Object.keys(this.hass?.themes?.themes??{}).sort()}open(t){this.opener=this.shadowRoot?.activeElement,this.dialog=t}async act(t,r,o,s=!1){this.message="",this.failure="";try{await t(),this.message=r,s&&po()}catch(i){this.failure=Xe(W(i),o)}await this.load()}optOut(t,r){let o=this.hass;o&&this.act(()=>Ud(o,r),r?m.optOutOn:m.optOutOff,t.name,!0)}mayUnassign(t){let r=t.active_override;if(!r)return!1;if(this.isAdmin||t.id===this.selfId)return!0;let o=this.selfId;return o!==void 0&&r.assigned_by===o}removeOverride(t,r){let o=this.hass;!o||this.removing.has(t)||(this.removing=new Set(this.removing).add(t),this.act(()=>jd(o,t),m.unassigned,r).finally(()=>{let s=new Set(this.removing);s.delete(t),this.removing=s}))}renderOverride(t){let r=t.active_override;if(!r)return l`<span class="muted">${m.noOverride}</span>`;let o=r.ends===null?m.noEnd:m.until(new Date(r.ends*1e3).toLocaleString());return l`<span class="override">${m.overrideLine(r.theme)} ${o}. ${m.setBy(r.assigned_by_name)}</span>`}renderPerson(t){let r=t.id===this.selfId,o=this.hass,s=r||this.isAdmin,i=this.canAssign&&(this.isAdmin||!t.is_admin);return l`
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
        ${Eo(this.holidays)}
        ${this.holidaysLoaded?this.holidays.length===0?l`<p class="muted">${m.holidaysEmpty}</p>`:l`<ul class="holidays">
              ${this.holidays.map(t=>l`<li>${t.name}: ${Mn(t)} (${t.theme})${t.enabled===!1?" - off":""}</li>`)}
            </ul>`:l`<p class="notice error" id="holidays-error" role="alert">
                ${this.holidaysFailure||m.holidaysLoadFailed}
              </p>
              <button class="btn" type="button" id="retry-holidays" @click=${()=>void this.loadHolidays()}>${m.retry}</button>`}
        ${this.isAdmin?l`<div class="tools">
              <button class="btn" type="button" id="edit-holidays" ?disabled=${!this.holidaysLoaded} @click=${()=>this.open({kind:"holidays"})}>${m.editHolidays}</button>
              <button class="btn" type="button" id="edit-assigners" @click=${()=>this.open({kind:"assigners"})}>${m.assigners}</button>
            </div>`:u}
      </section>
    `}renderDialog(){let t=this.dialog;if(!t)return u;let r={hass:this.hass,themes:this.themeNames()};switch(t.kind){case"assign":return l`<hats-lite-assign-dialog
          .hass=${r.hass}
          .themes=${r.themes}
          .person=${t.person}
          .limited=${t.until!==void 0}
          .until=${t.until??""}
          .startsNow=${t.until!==void 0}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-assign-dialog>`;case"birthday":return l`<hats-lite-birthday-dialog
          .hass=${r.hass}
          .themes=${r.themes}
          .person=${t.person}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-birthday-dialog>`;case"holidays":return l`<hats-lite-holidays-dialog
          .hass=${r.hass}
          .themes=${r.themes}
          .holidays=${this.holidays}
          .loaded=${this.holidaysLoaded}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-holidays-dialog>`;default:return l`<hats-lite-assigners-dialog
          .hass=${r.hass}
          .candidates=${this.people}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-assigners-dialog>`}}render(){return this.status==="idle"||this.status==="loading"?l`<p class="muted" role="status">${m.loading}</p>`:this.status==="error"?l`<p class="notice error" role="alert">${this.failure||m.loadFailed}</p>
        <button class="btn" type="button" @click=${()=>void this.load()}>${m.retry}</button>`:l`
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
    `}};customElements.get("hats-lite-people")||customElements.define("hats-lite-people",Do);var Io=["styling","cards","layout","templating","chrome"],ig=4096,Lo="hats_lite/",Ho=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,Oo=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function De(e){return typeof e=="string"?e:""}function ag(e){if(!e||typeof e!="object")return null;let n=e,t=De(n.full_name);if(!Ho.test(t))return null;let r=Io.find(o=>o===n.kind)??"cards";return{category:n.category==="integration"?"integration":"plugin",kind:r,full_name:t,description:De(n.description),stars:typeof n.stars=="number"&&Number.isFinite(n.stars)?n.stars:0,installed:n.installed===!0,last_commit:typeof n.last_commit=="string"?n.last_commit:null,hacs_id:typeof n.hacs_id=="string"||typeof n.hacs_id=="number"?n.hacs_id:null,filename:De(n.filename)||null,pinned:n.pinned===!0,license:De(n.license)||null,tag:De(n.tag)||null}}async function gc(e){let n=await P(e,{type:`${Lo}mods`}),t=Array.isArray(n?.mods)?n.mods:[];return{source:De(n?.source),mods:t.map(ag).filter(r=>r!==null),truncated:n?.truncated===!0}}async function bc(e,n){let t=await P(e,{type:`${Lo}mod_asset`,full_name:n});if(typeof t?.source!="string")throw{code:"fetch_failed"};return{full_name:De(t.full_name)||n,source:t.source}}async function No(e){try{let n=await P(e,{type:`${Lo}mods`,probe:!0});return Array.isArray(n?.mods)}catch(n){return W(n)!=="unknown_command"}}function yc(e){return Ho.test(e)?`https://github.com/${e}`:null}function vc(e){return e.pinned&&e.category==="plugin"}function wc(e,n="plugin"){if(!Ho.test(e))return null;let[t,r]=e.split("/");return`https://my.home-assistant.io/redirect/hacs_repository/?owner=${encodeURIComponent(t)}&repository=${encodeURIComponent(r)}&category=${n}`}function lg(e){if(e.tag&&Oo.test(e.tag))return e.tag;let n=(e.filename??"").replace(/\.js$/i,"").toLowerCase();return Oo.test(n)?n:""}function xc(e){let n=lg(e);return JSON.stringify({type:`custom:${n||"my-card"}`},null,2)}function Dn(e){if(e.trim()==="")return{ok:!1,problem:"empty"};if(new TextEncoder().encode(e).length>ig)return{ok:!1,problem:"too_large"};let n;try{n=JSON.parse(e)}catch{return{ok:!1,problem:"invalid"}}if(!n||typeof n!="object"||Array.isArray(n))return{ok:!1,problem:"not_object"};let t=n;if(typeof t.type!="string"||t.type==="")return{ok:!1,problem:"no_type"};let r=t.type.startsWith("custom:")?t.type.slice(7):"";return Oo.test(r)?{ok:!0,config:t,tag:r}:{ok:!1,problem:"bad_type"}}function kc(e,n,t,r="all"){let o=n.trim().toLowerCase();return e.filter(s=>r!=="all"&&s.kind!==r||t==="installed"&&!s.installed||t==="pinned"&&!s.pinned?!1:o===""?!0:s.full_name.toLowerCase().includes(o)||s.description.toLowerCase().includes(o))}var Ln={maxEntities:100,maxBytes:1048576,maxString:2048,maxAttrBytes:4096},Fo=/^[a-z0-9_]+\.[a-z0-9_]+$/,dg=/token|access|auth|password|passwd|secret|credential|api[_-]?key/i,cg=/(?:^|[?&;#]|%3F|%26)(access_token|token|auth|authsig|signature|sig|key|password)(?:=|%3D)/i,ug=/^[a-z][a-z0-9+.-]*:\/\/[^/?#\s]*@/i,pg=/eyJ[A-Za-z0-9_-]{10,}/,hg=/[0-9a-f]{32,}/i,mg=/[A-Za-z0-9+/_-]{32,}/g,fg=5,gg=12,jo=200,Sc=500,On=100,bg=12,ee=Symbol("drop"),Mc=new Set(["person","device_tracker","camera","lock","alarm_control_panel","tag","notify","input_text","text"]),yg=new Set(["friendly_name","unit_of_measurement","device_class","state_class","icon","supported_features","min","max","step","options","brightness","color_temp","current_temperature","temperature","humidity","hvac_action","hvac_mode","hvac_modes","battery_level","volume_level","is_volume_muted","media_title","media_artist","source","source_list","percentage","current_position","entity_id"]),vg=/^(entity|entities|entity_id|camera_image|.+_entity|.+_entities|.+_entity_id)$/,$c=typeof TextEncoder>"u"?null:new TextEncoder;function Ac(e){return $c===null?e.length:$c.encode(e).length}function wg(e){try{let n=JSON.stringify(e);return n===void 0?1/0:Ac(n)}catch{return 1/0}}function Je(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ec(e){if(ug.test(e)||cg.test(e)||pg.test(e)||hg.test(e))return!0;for(let n of e.match(mg)??[])if(/\d/.test(n)&&/[A-Za-z]/.test(n))return!0;return!1}function In(e,n=Ln.maxString){let t=e.length>n?e.slice(0,n):e;if(Ec(t))return null;if(t.includes("%"))try{if(Ec(decodeURIComponent(t)))return null}catch{return t}return t}function Qe(e,n,t,r,o=fg){if(e===null)return null;if(typeof e=="string"){let s=In(e,t);return s===null?ee:s}if(typeof e=="number")return Number.isFinite(e)?e:ee;if(typeof e=="boolean")return e;if(n>=o)return ee;if(Array.isArray(e)){let s=[];if(e.length>Sc)return ee;for(let i of e){let a=Qe(i,n+1,t,r,o);a!==ee&&s.push(a)}return s}if(Je(e)){let s={},i=0;for(let a of Object.keys(e)){if(a==="__proto__"||a==="constructor"||a==="prototype"||r&&dg.test(a))continue;if(i>=jo)break;let d=Qe(e[a],n+1,t,r,o);d!==ee&&(s[a]=d,i+=1)}return s}return ee}function xg(e){if(!Array.isArray(e))return[];let n=[];for(let t of e.slice(0,On))typeof t=="string"&&Fo.test(t)&&!Mc.has(t.slice(0,t.indexOf(".")))&&n.push(t);return n}function kg(e,n){let t={};for(let r of Object.keys(e).slice(0,jo)){if(!yg.has(r))continue;let o=r==="entity_id"?xg(e[r]):Qe(e[r],0,n.maxString,!0);o!==ee&&(wg(o)>n.maxAttrBytes||(t[r]=o))}return t}function _c(e){if(typeof e=="string")return In(e.slice(0,64),64)??void 0}function Tc(e,n){return typeof e=="string"?e.slice(0,n):void 0}function $g(e){return e.slice(0,e.indexOf("."))}function Cc(e){let n=[],t=new Set,r=s=>{typeof s=="string"&&Fo.test(s)&&!t.has(s)&&n.length<On&&(t.add(s),n.push(s))},o=(s,i,a)=>{if(!(i>bg||n.length>=On)){if(typeof s=="string"){a&&r(s);return}if(Array.isArray(s)){for(let d of s.slice(0,Sc))o(d,i+1,a);return}if(Je(s))for(let d of Object.keys(s).slice(0,jo))d!=="__proto__"&&o(s[d],i+1,vg.test(d))}};return o(e,0,!1),n}function Eg(e,n={}){let t={...Ln,...n},r={};if(!Je(e))return r;let o=(n.entityIds??[]).slice(0,On),s=0,i=0;for(let a of o){if(typeof a!="string"||!Fo.test(a)||a in r)continue;if(s>=t.maxEntities)break;let d=Object.prototype.hasOwnProperty.call(e,a)?e[a]:void 0;if(!Je(d))continue;let c=Je(d.attributes)?d.attributes:{},h;if(Mc.has($g(a))||"latitude"in c||"longitude"in c){let g=typeof c.friendly_name=="string"?In(c.friendly_name,255):null;h={entity_id:a,state:"unknown",attributes:g===null?{}:{friendly_name:g}}}else{let g=d.state,v=typeof g=="string"?g:g==null?"unknown":String(g);h={entity_id:a,state:In(v,t.maxString)??"unknown",attributes:kg(c,t)};let E=_c(d.last_changed),S=_c(d.last_updated);E!==void 0&&(h.last_changed=E),S!==void 0&&(h.last_updated=S)}let p=Ac(JSON.stringify(h));i+p>t.maxBytes||(i+=p,r[a]=h,s+=1)}return r}function Pc(e,n={}){let t=n.maxString??Ln.maxString,r=Qe(e,0,t,!1,gg);return r===ee?{}:r}function Uo(e,n={}){let t={...Ln,...n},r=Je(e)?e:{},o=Tc(r.language,32)??"en",s=Tc(r.selectedLanguage,32)??o,i=Qe(r.themes,0,t.maxString,!1),a=Qe(r.locale,0,t.maxString,!1);return{states:Eg(r.states,n),themes:i===ee?{}:i,language:o,selectedLanguage:s,locale:a===ee?{}:a,userData:{language:s}}}function Rc(e,n=1e3){let t=-1/0,r=null,o=null,s=a=>{t=Date.now(),e(...a)},i=((...a)=>{let d=t+n-Date.now();if(d<=0&&r===null){s(a);return}o=a,r===null&&(r=setTimeout(()=>{r=null;let c=o;o=null,c!==null&&s(c)},Math.max(d,0)))});return i.cancel=()=>{r!==null&&clearTimeout(r),r=null,o=null},i}var Dc="read only preview",Oc="allow-scripts",Ic="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'",Lc="The preview runs third party code in a sandboxed frame. A mod that loops forever can still freeze this browser tab, because the frame may share the page's renderer thread. Reload the page if that happens.",Hc="Everything sent to the preview is readable by the mod author: the card config, the states of the entities the card references (allowlisted attributes only), themes and language. Entities such as people, trackers, cameras and locks are replaced by placeholders. The shown data may leave the browser if the mod author wishes, and no isolation is perfect.",_g=["mod_error","set_config","unhandled_rejection","runtime_error","not_defined"];var Tg=/^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;function Bo(e){return typeof e=="string"&&e.length<=100&&Tg.test(e)}function Nc(e=globalThis.crypto){let n=new Uint8Array(16);e.getRandomValues(n);let t="";for(let r of n)t+=r.toString(16).padStart(2,"0");return t}function Fc(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Mt(e){return typeof e=="string"&&e.length<=500?e:null}function Sg(e){if(!Array.isArray(e)||e.length>100)return null;let n=[];for(let t of e){if(!Fc(t))return null;let r=Mt(t.type),o=Mt(t.name),s=Mt(t.description);if(r===null||o===null||s===null)return null;n.push({type:r,name:o,description:s})}return n}function zo(e,n){if(!Fc(e)||typeof e.type!="string"||typeof e.token!="string")return null;if(e.type==="ready")return e.token===""?{type:"ready"}:null;if(n===""||e.token!==n)return null;switch(e.type){case"heartbeat":return{type:"heartbeat"};case"rendered":return{type:"rendered"};case"defined":return Bo(e.tag)?{type:"defined",tag:e.tag}:null;case"cards":{let t=Sg(e.cards);return t===null?null:{type:"cards",cards:t}}case"error":{let t=Mt(e.message),r=_g.find(o=>o===e.code);return t===null||r===void 0?null:{type:"error",code:r,message:t}}case"request":{let t=Mt(e.method),r=e.id;return t===null||typeof r!="number"||!Number.isSafeInteger(r)?null:{type:"request",id:r,method:t}}default:return null}}function Mg(e){let n=e.document,t=e.parent.postMessage.bind(e.parent),r=e.customElements,o=r.define.bind(r),s="read only preview",i=500,a="",d=null,c=!1,h=null,p=0,g=$=>{if(d!==null)try{d.postMessage({...$,token:a})}catch{return}},v=$=>String($??"").slice(0,i),E=($,_)=>{let C=_&&_.message!==void 0?_.message:_;g({type:"error",code:$,message:v(C)})},S=$=>(p+=1,g({type:"request",id:p,method:v($)}),Promise.reject(new Error(s))),T=$=>()=>S($),q=$=>({states:$.states,themes:$.themes,language:$.language,selectedLanguage:$.selectedLanguage,locale:$.locale,userData:$.userData,callService:T("callService"),callWS:T("callWS"),callApi:T("callApi"),fetchWithAuth:T("fetchWithAuth"),connection:Object.freeze({sendMessagePromise:T("connection.sendMessagePromise"),subscribeMessage:T("connection.subscribeMessage"),subscribeEvents:T("connection.subscribeEvents"),sendMessage:T("connection.sendMessage")}),auth:Object.freeze({data:Object.freeze({}),refreshAccessToken:T("auth.refreshAccessToken"),wsUrl:""})});e.customCards=[];let j=()=>{let $=[],_=Array.isArray(e.customCards)?e.customCards:[];for(let C=0;C<_.length&&$.length<100;C+=1){let L=_[C];L&&typeof L=="object"&&$.push({type:v(L.type),name:v(L.name),description:v(L.description)})}g({type:"cards",cards:$})};e.customElements.define=function($,_,C){o($,_,C),g({type:"defined",tag:v($)})};class Y extends e.HTMLElement{constructor(){super();let _=this.attachShadow({mode:"open"}),C=n.createElement("style");C.textContent=":host{display:block;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color,#212121);border-radius:var(--ha-card-border-radius,12px);box-shadow:var(--ha-card-box-shadow,none);overflow:hidden;box-sizing:border-box}",_.appendChild(C),_.appendChild(n.createElement("slot"))}}o("ha-card",Y);let U=($,_,C)=>{let L;try{L=n.createElement($),typeof L.setConfig=="function"&&L.setConfig(_)}catch(B){E("set_config",B);return}h=L;try{L.hass=C,n.body.appendChild(L)}catch(B){E("mod_error",B);return}g({type:"rendered"})},_e=$=>{c=!0,a=$.token,e.hass=q($.hass),e.setInterval(()=>g({type:"heartbeat"}),1e3);let _=n.createElement("script");_.textContent=String($.modSource);try{n.head.appendChild(_)}catch(L){E("mod_error",L);return}j();let C=String($.tag);if(r.get(C)!==void 0){U(C,$.config,e.hass);return}r.whenDefined(C).then(()=>U(C,$.config,e.hass),L=>E("not_defined",L))};e.onerror=($,_,C,L,B)=>(E("mod_error",B||$),!0),e.addEventListener("unhandledrejection",$=>{typeof $.preventDefault=="function"&&$.preventDefault()});let se=$=>{let _=$.data;if(!(!c||!_||typeof _!="object"||_.token!==a)&&_.type==="hass"&&_.hass&&typeof _.hass=="object"&&(e.hass=q(_.hass),h!==null))try{h.hass=e.hass}catch(C){E("mod_error",C)}};e.addEventListener("message",$=>{if(c||$.source!==e.parent)return;let _=$.data;if(!_||typeof _!="object"||_.type!=="init")return;let C=$.ports;!C||C.length!==1||!C[0]||typeof _.token!="string"||_.token===""||(d=C[0],d.onmessage=se,_e(_))}),t({type:"ready",token:""},"*")}var jc=`(${Mg.toString()})(window);`;var Pg=1e3,Rg=3e3,Dg=50,Og=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${Ic}"></head><body><script>${jc}<\/script></body></html>`;function Uc(e){let{modSource:n,tag:t,config:r,onError:o,onReady:s,onBlocked:i}=e,a=Cc(r),d=e.timeoutMs??5e3,c=Nc(),h=document.createElement("iframe");h.setAttribute("sandbox",Oc),h.setAttribute("referrerpolicy","no-referrer"),h.setAttribute("allow",""),h.setAttribute("loading","eager"),h.setAttribute("title","Mod preview"),h.srcdoc=Og;let p=new MessageChannel,g=p.port1,v=!1,E=!1,S=!1,T=0,q=e.hass,j=Date.now(),Y=0,U=[],_e=[],se=null,$=null,_=F=>v||!E?!1:(g.postMessage(F),!0),C=Rc(F=>{if(v||!E)return;let H;try{H=Uo(F,{entityIds:a})}catch{B("mirror_error","state mirror failed");return}try{_({type:"hass",token:c,hass:H})}catch{return}},1e3),L=()=>{if(!v){v=!0,window.removeEventListener("message",rs),g.onmessage=null;for(let F of[p.port1,p.port2])try{F.close()}catch{continue}se!==null&&clearTimeout(se),$!==null&&clearInterval($),se=null,$=null,C.cancel(),h.remove()}},B=(F,H)=>{if(!v){L();try{o({code:F,message:H})}catch{return}}},cu=()=>{let F,H;try{F=Uo(q,{entityIds:a}),H=Pc(r)}catch{B("mirror_error","state mirror failed");return}let Ct=h.contentWindow;if(Ct===null){B("post_failed","sandbox window unavailable");return}E=!0;let Pt={type:"init",token:c,modSource:n,tag:t,config:H,hass:F};try{Ct.postMessage(Pt,"*",[p.port2])}catch(os){B("post_failed",os instanceof Error?os.message:"post failed")}};function rs(F){if(v)return;let H=h.contentWindow,Ct=F.source;if(H===null||Ct!==H)return;let Pt=zo(F.data,"");if(!(Pt===null||Pt.type!=="ready")){if(E){B("navigated","sandbox frame sent a second ready");return}j=Date.now(),cu()}}function uu(F){if(v||!E)return;let H=zo(F.data,c);if(!(H===null||H.type==="ready"))switch(j=Date.now(),H.type){case"heartbeat":return;case"defined":U.length<200&&!U.includes(H.tag)&&U.push(H.tag);return;case"cards":_e=H.cards;return;case"rendered":if(se!==null&&clearTimeout(se),se=null,S)return;S=!0,s!==void 0&&s({tags:[...U],cards:[..._e]});return;case"error":B(H.code,H.message);return;case"request":if(Y+=1,Y>Dg)return;try{_({type:"refused",token:c,id:H.id,error:Dc})}catch{return}return}}return h.addEventListener("load",()=>{T+=1,T>1&&B("navigated","sandbox frame navigated")}),typeof n!="string"||n.length>4194304?queueMicrotask(()=>B("too_large","mod source rejected")):Bo(t)?(window.addEventListener("message",rs),g.onmessage=uu,se=setTimeout(()=>B("timeout","mod did not render in time"),d),$=setInterval(()=>{Date.now()-j>Rg&&(B("heartbeat_lost","sandbox stopped responding"),i!==void 0&&i())},Pg)):queueMicrotask(()=>B("invalid_tag","invalid custom element name")),{element:h,update(F){v||(q=F,E&&C(F))},destroy:L}}var Hn=[z,K,M`
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
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    gap: var(--hl-gap);
  }
  @media (max-width: 899px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
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
  .pick[aria-pressed="true"] {
    border-color: var(--hl-accent);
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
`];var w={title:"Mods",intro:"Add-ons that change how your dashboard looks: styling, cards, layouts and chrome. Previews run in an isolated frame and nothing is installed from here.",loading:"Loading mods...",loadFailed:"Could not load the mods list.",retry:"Try again",search:"Search mods",searchPlaceholder:"Name or description",filters:"Filter",filterAll:"All",filterInstalled:"Installed",kinds:"Kind",kindAll:"All kinds",kindLabels:{styling:"Styling",cards:"Cards",layout:"Layout",templating:"Templating",chrome:"Chrome"},integrationChip:"Integration",integrationNote:"This is a HACS integration. It acts on your real dashboard and cannot be previewed in the sandbox. Install it through HACS.",filterPinned:"Preview available",empty:"No mods match.",truncated:"The list is incomplete. Narrow the search to find more.",installedChip:"Installed",pinnedChip:"Preview available",stars:e=>`${e} stars`,license:e=>`License: ${e}`,repository:"Repository",openInHacs:"Open in HACS",select:e=>`Open ${e}`,detailsTitle:"Mod details",nothingSelected:"Select a mod to see its preview options.",installedNote:"Already in your dashboard resources",installedHint:"This card is already loaded in your dashboard, so it is previewed with the real card helpers.",installedUnavailable:"The real card could not be created here. Check it in the Preview tab or on a dashboard.",unpinned:"Preview unavailable: this mod is not in the pinned set",configLabel:"Card config (JSON)",configHelp:"Up to 4 KB. The type must be custom: followed by the card tag.",configProblems:{empty:"Enter a card config.",too_large:"The card config is larger than 4 KB.",invalid:"The card config is not valid JSON.",not_object:"The card config must be an object.",no_type:"The card config needs a type such as custom:my-card.",bad_type:"The type must start with custom: followed by a valid card tag."},run:"Run preview in sandbox",showCard:"Show real card",confirmTitle:"Before running third party code",isolation:Lc,disclosure:Hc,confirm:"Run in sandbox",cancel:"Cancel",fetching:"Fetching the pinned release...",starting:"Starting the sandbox...",running:"Preview running.",reset:"Reset",width:"Width",height:"Height 480 px",widths:{phone:"Phone",tablet:"Tablet",desktop:"Desktop"},stageLabel:"Sandboxed mod preview",errors:{not_pinned:"This mod is not in the pinned set.",hash_mismatch:"The downloaded file does not match the pinned hash, so it was refused.",too_large:"The mod file is too large to preview.",bad_content_type:"The server returned an unexpected content type.",redirect_refused:"The download tried to redirect and was refused.",network:"The network request failed.",timeout:"The request or the mod timed out.",invalid_encoding:"The mod file is not valid text.",not_found:"The mod file was not found.",fetch_failed:"The mod file could not be fetched.",rate_limited:"Too many requests. Wait a moment and try again.",catalog_unavailable:"The mod catalog is unavailable right now.",unauthorized:"You are not allowed to do that.",unknown_command:"This server does not support the Mods tab.",navigated:"The mod tried to navigate the preview frame and was stopped.",heartbeat_lost:"The preview stopped responding and was removed.",mirror_error:"The card state could not be copied into the preview.",mod_error:"The mod failed while loading.",set_config:"The card rejected this config.",unhandled_rejection:"The mod raised an unhandled error.",runtime_error:"The mod raised a runtime error.",not_defined:"The mod did not define that card tag.",invalid_tag:"That is not a valid custom card tag.",post_failed:"The preview frame could not be started.",unknown:"Something went wrong. Try again."},unknownCode:e=>`Something went wrong (${e}). Try again.`};function Nn(e){let n=w.errors[e];return n||(e==="unknown"?w.errors.unknown:w.unknownCode(e))}var Ig=[["phone",390],["tablet",768],["desktop",1024]],Lg=480,Bc=new Set;function zc(e){return`${e.full_name.toLowerCase()}@${e.tag??""}`}var Hg=async(e,n)=>{let t=await zt();return Kt(t,n)};function Vo(e,n){let t=yc(e.full_name),r=n?wc(e.full_name,e.category):null;return l`
    ${t?l`<a class="link" href=${t} target="_blank" rel="noopener noreferrer">${w.repository}</a>`:u}
    ${r?l`<a class="link" id="hacs-link" href=${r} target="_blank" rel="noopener noreferrer">${w.openInHacs}</a>`:u}
  `}var Ko=class extends A{constructor(){super(...arguments);this.mod=null;this.createSandbox=Uc;this.cardFactory=Hg;this.configText="";this.problem="";this.phase="idle";this.failure="";this.width=390;this.installedFailed=!1;this.sandbox=null;this.card=null;this.token=0;this.focusTarget=null;this.onConfigInput=t=>{this.configText=t.target.value,this.problem=""};this.onRun=()=>{let t=Dn(this.configText);if(!t.ok){this.problem=t.problem;return}this.problem="",this.mod&&Bc.has(zc(this.mod))?this.start():(this.focusTarget="confirm",this.phase="confirm")};this.onConfirm=()=>{this.mod&&Bc.add(zc(this.mod)),this.start()};this.onCancel=()=>{this.focusTarget="run",this.phase="idle"};this.onReset=()=>{this.stop(),this.focusTarget="run",this.phase="idle",this.failure=""}}static{this.properties={hass:{attribute:!1},mod:{attribute:!1},createSandbox:{attribute:!1},cardFactory:{attribute:!1},configText:{state:!0},problem:{state:!0},phase:{state:!0},failure:{state:!0},width:{state:!0},installedFailed:{state:!0}}}static{this.styles=Hn}disconnectedCallback(){super.disconnectedCallback(),this.stop()}willUpdate(t){t.has("mod")&&(this.stop(),this.phase="idle",this.problem="",this.failure="",this.installedFailed=!1,this.configText=this.mod?xc(this.mod):"")}updated(t){t.has("mod")&&this.mod?.installed&&this.showInstalled(),t.has("hass")&&this.hass&&(this.sandbox?.update(this.hass),this.card&&(this.card.hass=this.hass));let r=this.stage();r&&this.sandbox&&this.sandbox.element.parentNode!==r&&r.append(this.sandbox.element),this.sandbox&&this.sizeFrame(),this.applyFocus()}applyFocus(){let t=this.focusTarget;if(!t)return;let r=this.renderRoot.querySelector(t==="confirm"?"#confirm-h":"#run");r&&(this.focusTarget=null,r.focus())}stage(){return this.renderRoot.querySelector(".stage")}sizeFrame(){let t=this.sandbox?.element;t&&(t.style.width=`${this.width}px`,t.style.height=`${Lg}px`,t.style.maxWidth="100%",t.style.border="0")}stop(){this.token+=1,this.sandbox?.destroy(),this.sandbox=null,this.card?.remove(),this.card=null}async showInstalled(){let t=Dn(this.configText);if(!t.ok||!this.hass)return;let r=++this.token;this.card?.remove(),this.card=null,this.installedFailed=!1;let o;try{o=await this.cardFactory(this.hass,t.config)}catch{r===this.token&&(this.installedFailed=!0);return}r===this.token&&(o.hass=this.hass,this.card=o,await this.updateComplete,this.stage()?.append(o))}fail(t){this.stop(),this.failure=Nn(t),this.phase="error"}async start(){let t=this.mod,r=this.hass,o=Dn(this.configText);if(!t||!r||!o.ok)return;this.stop();let s=this.token;this.phase="fetching";let i;try{i=(await bc(r,t.full_name)).source}catch(a){s===this.token&&this.fail(W(a));return}s===this.token&&(this.phase="starting",this.sandbox=this.createSandbox({modSource:i,tag:o.tag,config:o.config,hass:r,onReady:()=>{s===this.token&&(this.phase="running")},onError:a=>{s===this.token&&this.fail(a.code)}}))}renderEditor(t,r,o){return l`
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
        <button class="btn primary" type="button" id=${o} aria-label=${t} @click=${r}>${t}</button>
      </div>
    `}renderWidths(){return l`
      <div class="seg" role="group" aria-label=${w.width}>
        ${Ig.map(([t,r])=>l`<button
            type="button"
            data-width=${r}
            aria-pressed=${this.width===r?"true":"false"}
            @click=${()=>{this.width=r}}
          >
            ${w.widths[t]} ${r}
          </button>`)}
      </div>
      <span class="muted">${w.height}</span>
    `}renderSandbox(){let t=this.phase==="fetching"||this.phase==="starting";return this.phase==="idle"?this.renderEditor(w.run,this.onRun,"run"):this.phase==="confirm"?l`
        <section class="confirm" role="region" aria-labelledby="confirm-h">
          <h3 id="confirm-h" tabindex="-1">${w.confirmTitle}</h3>
          <p id="confirm-status" role="status" aria-live="polite">${this.problem}</p>
          <p id="isolation">${w.isolation}</p>
          <p id="disclosure">${w.disclosure}</p>
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
    `}renderBody(t){return t.category==="integration"?l`<p class="notice" id="integration-note">${w.integrationNote}</p>`:t.installed?l`
        <p class="notice" id="installed-note">${w.installedNote}</p>
        <p class="muted">${w.installedHint}</p>
        ${this.installedFailed?l`<p class="notice error" id="installed-failed" role="alert">${w.installedUnavailable}</p>`:u}
        ${this.renderEditor(w.showCard,()=>void this.showInstalled(),"show-card")}
        <div class="stage" role="region" aria-label=${w.stageLabel}></div>
      `:vc(t)?this.renderSandbox():l`<p class="notice" id="unpinned">${w.unpinned}</p>`}render(){let t=this.mod;return t?l`
      <h2>${t.full_name}</h2>
      ${t.pinned&&t.license?l`<p class="muted" id="license">${w.license(t.license)}</p>`:u}
      <p class="links">${Vo(t,!0)}</p>
      ${this.renderBody(t)}
    `:l`<p class="muted">${w.nothingSelected}</p>`}};customElements.get("hats-lite-mods-preview")||customElements.define("hats-lite-mods-preview",Ko);var Ng=[["all",w.filterAll],["installed",w.filterInstalled],["pinned",w.filterPinned]],Wo=class extends A{constructor(){super(...arguments);this.active=!0;this.mods=[];this.truncated=!1;this.status="idle";this.failure="";this.query="";this.filter="all";this.kind="all";this.selected=""}static{this.properties={hass:{attribute:!1},active:{type:Boolean},mods:{state:!0},truncated:{state:!0},status:{state:!0},failure:{state:!0},query:{state:!0},filter:{state:!0},kind:{state:!0},selected:{state:!0}}}static{this.styles=Hn}willUpdate(t){t.has("hass")&&this.hass&&this.status==="idle"&&this.load()}async load(){let t=this.hass;if(t){this.status="loading";try{let r=await gc(t);this.mods=r.mods,this.truncated=r.truncated,this.status="ready"}catch(r){this.failure=Nn(W(r)),this.status="error"}}}renderItem(t){let r=this.selected===t.full_name;return l`
      <li class="mod" data-name=${t.full_name}>
        <div class="head">
          <button
            class="pick"
            type="button"
            aria-pressed=${r?"true":"false"}
            aria-label=${w.select(t.full_name)}
            @click=${()=>{this.selected=t.full_name}}
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
        <p class="links">${Vo(t,!1)}</p>
      </li>
    `}renderList(){let t=kc(this.mods,this.query,this.filter,this.kind),r=Io.filter(s=>this.mods.some(i=>i.kind===s)),o=[["all",w.kindAll],...r.map(s=>[s,w.kindLabels[s]])];return l`
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
          ${Ng.map(([s,i])=>l`<button
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
        <button class="btn" type="button" id="retry" @click=${()=>void this.load()}>${w.retry}</button>`;let t=this.mods.find(r=>r.full_name===this.selected)??null;return l`
      <p class="muted">${w.intro}</p>
      <div class="layout">
        <section class="card" aria-labelledby="mods-h">
          <h2 id="mods-h">${w.title}</h2>
          ${this.renderList()}
        </section>
        <section class="card" aria-label=${w.detailsTitle}>
          ${this.active?l`<hats-lite-mods-preview .hass=${this.hass} .mod=${t}></hats-lite-mods-preview>`:u}
        </section>
      </div>
    `}};customElements.get("hats-lite-mods")||customElements.define("hats-lite-mods",Wo);function Fn(e,n,t){let r=e?.themes?.themes;if(typeof n!="string"||!r||!Object.prototype.hasOwnProperty.call(r,n))return null;let o=r[n];if(!o||typeof o!="object")return null;let s=ne(o),a=(typeof t=="boolean"?t:e?.themes?.darkMode===!0)?"dark":"light";return{mode:a,candidate:{name:n,vars:Z(s,a),entry:s,installed:!0,canApply:!0}}}function Kc(e,n,t,r,o){if(!e||!Object.prototype.hasOwnProperty.call(n,t))return null;let s=ne(n[t]),i=r?.themes?.darkMode?"dark":"light",a=o.includes(t),d=r?.themes?.themes,c=d&&Object.prototype.hasOwnProperty.call(d,t)?d[t]:void 0,h=a&&!e.installed&&zs(c,s);return{name:t,fullName:e.full_name,vars:Z(s,i),entry:s,installed:a,nameCollision:h,repoUrl:Ws(e.full_name),canApply:a&&!h}}function qo(e,n){return e.installed===n.installed&&e.nameCollision===n.nameCollision&&e.canApply===n.canApply&&JSON.stringify(e.vars)===JSON.stringify(n.vars)}function Vc(e,n){return!e||!n||n.installed||!e.hacs_id?null:{fullName:e.full_name,hacsId:e.hacs_id}}function Wc(e,n){return!e||!n||!n.installed||n.nameCollision||!e.installed||!e.hacs_id?null:{fullName:e.full_name,hacsId:e.hacs_id}}function qc(e,n,t){let r=t==="dark"?!0:t==="light"?!1:void 0,o=Fn(e,n.name,r)?.candidate??null;return o&&qo(n,o)?n:o}var Fg=150,jn=class{constructor(n){this.options=n;this.list=[];this.loaded=-1;this.index=-1;this.error="";this.token=0}start(n,t){this.cancel();let r=n.findIndex(o=>o.full_name===t.full_name);this.list=r<0?[t]:[...n],this.loaded=this.index=Math.max(r,0),this.error="",this.options.onChange()}clear(){this.cancel(),this.list=[],this.loaded=this.index=-1,this.error="",this.options.onChange()}cancel(){this.token+=1,this.timer!==void 0&&clearTimeout(this.timer),this.timer=void 0}model(){let n=this.list[this.index];return n?{index:this.index,total:this.list.length,name:n.full_name,pending:this.index!==this.loaded,error:this.error}:null}move(n){let t=Be(this.index,this.list.length,n);if(t!==null){if(this.cancel(),this.index=t,this.error="",t!==this.loaded){let r=this.token;this.timer=setTimeout(()=>void this.load(r),Fg)}this.options.onChange()}}async load(n){this.timer=void 0;let t=this.list[this.index],r=this.index;try{let o=await this.options.open(t);if(n!==this.token)return;this.loaded=r,this.options.apply(o)}catch{if(n!==this.token)return;this.index=this.loaded,this.error=f.navFailed.replace("{name}",t.full_name)}this.options.onChange()}};var Jo={r:0,g:0,b:0,a:1},Kn={r:255,g:255,b:255,a:1},Yc=()=>({...Jo}),Zc=()=>({...Kn}),$e=(e,n,t)=>Math.min(t,Math.max(n,e));function Go(e){let n=e.trim();return n==="none"?0:n.endsWith("%")?parseFloat(n)/100*255:parseFloat(n)}function Un(e){if(e===void 0)return 1;let n=e.trim(),t=n.endsWith("%")?parseFloat(n)/100:parseFloat(n);return Number.isFinite(t)?$e(t,0,1):1}function jg(e){if(!/^[0-9a-f]+$/i.test(e)||![3,4,6,8].includes(e.length))return null;let n=e.length<=4?e.replace(/./g,r=>r+r):e,t=r=>parseInt(n.slice(r,r+2),16);return{r:t(0),g:t(2),b:t(4),a:n.length===8?t(6)/255:1}}function Jc(e){return e.replace(/\s*\/\s*/g," / ").split(/[\s,]+/).filter(n=>n!=="")}function Ug(e){let n=Jc(e),t=n.indexOf("/");return t>=0?{values:n.slice(0,t),alpha:n[t+1]}:{values:n.slice(0,3),alpha:n[3]}}function Gc(e){let n=e.trim(),t=parseFloat(n);return n.endsWith("turn")?t*360:n.endsWith("rad")?t*180/Math.PI:n.endsWith("grad")?t*.9:t}function Bg(e,n,t){let r=(e%360+360)%360,o=a=>(a+r/30)%12,s=n*Math.min(t,1-t),i=a=>t-s*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[i(0)*255,i(8)*255,i(4)*255]}function Xo(e){let n=$e(e,0,1);return n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055}function zg(e,n,t){let r=e+.3963377774*n+.2158037573*t,o=e-.1055613458*n-.0638541728*t,s=e-.0894841775*n-1.291485548*t,[i,a,d]=[r**3,o**3,s**3],c=[4.0767416621*i-3.3077115913*a+.2309699292*d,-1.2684380046*i+2.6097574011*a-.3413193965*d,-.0041960863*i-.7034186147*a+1.707614701*d];return[Xo(c[0])*255,Xo(c[1])*255,Xo(c[2])*255]}function Kg(e){let n=e.trim();return n.endsWith("%")?parseFloat(n)/100:parseFloat(n)}function Vg(e,n){if(e==="color"){let[o,...s]=Jc(n.replace(/\/.*$/,""));if(o!=="srgb"||s.length!==3)return null;let[i,a,d]=s.map(c=>(c.endsWith("%")?parseFloat(c)/100:parseFloat(c))*255);return{r:i,g:a,b:d,a:Un(n.split("/")[1])}}let{values:t,alpha:r}=Ug(n);if(t.length<3)return null;if(e==="rgb"||e==="rgba")return{r:Go(t[0]),g:Go(t[1]),b:Go(t[2]),a:Un(r)};if(e==="hsl"||e==="hsla"){let[o,s,i]=Bg(Gc(t[0]),$e(parseFloat(t[1])/100,0,1),$e(parseFloat(t[2])/100,0,1));return{r:o,g:s,b:i,a:Un(r)}}if(e==="oklab"||e==="oklch"){let o=Kg(t[0]),s=parseFloat(t[1]),i=parseFloat(t[2]);if(e==="oklch"){let h=parseFloat(t[1]),p=Gc(t[2])*Math.PI/180;s=h*Math.cos(p),i=h*Math.sin(p)}let[a,d,c]=zg(o,s,i);return{r:a,g:d,b:c,a:Un(r)}}return null}function tt(e){let n=(e??"").trim().toLowerCase();if(n==="")return null;if(n==="transparent")return{r:0,g:0,b:0,a:0};if(n.startsWith("#"))return jg(n.slice(1));let t=/^([a-z]+)\(([^)]*)\)$/.exec(n);if(!t)return null;let r=Vg(t[1],t[2]);return!r||![r.r,r.g,r.b,r.a].every(Number.isFinite)?null:{r:$e(r.r,0,255),g:$e(r.g,0,255),b:$e(r.b,0,255),a:r.a}}function ue(e,n){if(e.a>=1)return e;let t=e.a;return{r:e.r*t+n.r*(1-t),g:e.g*t+n.g*(1-t),b:e.b*t+n.b*(1-t),a:1}}function Qo(e,n,t){return{r:e.r+(n.r-e.r)*t,g:e.g+(n.g-e.g)*t,b:e.b+(n.b-e.b)*t,a:1}}function Yo(e){let n=e/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function et(e){return .2126*Yo(e.r)+.7152*Yo(e.g)+.0722*Yo(e.b)}function Bn(e,n){let t=et(e),r=et(n);return(Math.max(t,r)+.05)/(Math.min(t,r)+.05)}function Zo(e,n){return n.length===0?1/0:Math.min(...n.map(t=>Bn(ue(e,t),t)))}function zn(e){let n=t=>Math.round($e(t,0,255)).toString(16).padStart(2,"0");return`#${n(e.r)}${n(e.g)}${n(e.b)}`}function Qc(e,n,t=4.5){return n&&Bn(ue(n,e),e)>=t?zn(ue(n,e)):Bn(Jo,e)>=Bn(Kn,e)?"#000000":"#ffffff"}function Xc(e,n,t,r){let o=e,s=Zo(e,t);for(let i=1;i<=50;i+=1){let a=Qo(e,n,i/50),d=Zo(a,t);if(d>=r)return{found:a,best:a,bestRatio:d};d>s&&(o=a,s=d)}return{found:null,best:o,bestRatio:s}}function eu(e,n,t){if(Zo(e,n)>=t)return null;let r=ue(e,n[0]??Kn),o=Xc(r,Jo,n,t),s=Xc(r,Kn,n,t);if(o.found&&s.found){let i=Math.abs(et(o.found)-et(r)),a=Math.abs(et(s.found)-et(r));return zn(i<=a?o.found:s.found)}return o.found||s.found?zn(o.found??s.found):zn(o.bestRatio>=s.bestRatio?o.best:s.best)}var es={bg:"var(--hl-src-bg)",surface:"var(--hl-src-surface)",raised:"var(--hl-src-raised)",text:"var(--hl-src-text)",muted:"var(--hl-src-muted)",line:"var(--hl-src-line)",accent:"var(--hl-src-accent)",accentInk:"var(--hl-src-accent-ink)",ok:"var(--hl-src-ok)",warn:"var(--hl-src-warn)"},ts=["--hl-on-accent","--hl-text-ink","--hl-muted-ink","--hl-bg-text-ink","--hl-bg-muted-ink","--hl-ok-ink","--hl-warn-ink","--hl-accent-text-ink","--hl-edge-ink","--hl-focus-ink"],Ee=4.5,tu=3;function nu(){return Object.fromEntries(ts.map(e=>[e,null]))}function Vn(e){let n=tt(e);return n&&n.a>0?n:null}function ru(e){let n=e.dark?Yc():Zc(),t=Vn(e.accent);if(!t)return nu();let r=Vn(e.bg),o=r?ue(r,n):null,s=o??n,i=Vn(e.surface),a=Vn(e.raised),d=i?ue(i,s):s,c=a?ue(a,s):d,h=[d,c],p=[o??d],g=[...h,...o?[o]:[]],v=ue(t,d),E=Qo(d,v,.22),S=nu();S["--hl-on-accent"]=Qc(v,tt(e.accentInk),Ee);let T=(q,j,Y,U)=>{let _e=tt(j);S[q]=_e?eu(_e,Y,U):null};return T("--hl-text-ink",e.text,[...g,E],Ee),T("--hl-muted-ink",e.muted,g,Ee),T("--hl-bg-text-ink",e.text,p,Ee),T("--hl-bg-muted-ink",e.muted,p,Ee),T("--hl-ok-ink",e.ok,h,Ee),T("--hl-warn-ink",e.warn,h,Ee),T("--hl-accent-text-ink",e.accent,g,Ee),T("--hl-edge-ink",e.line,g,tu),T("--hl-focus-ink",e.accent,g,tu),S}function Wg(e){let n=e?.themes;return`${e?.selectedTheme?.theme??n?.theme??""}|${n?.darkMode===!1?"light":"dark"}`}var qg=/^(rgba?\(|color\(\s*srgb[\s)])/i,At;function Gg(){if(At!==void 0)return At;try{At=document.createElement("canvas").getContext("2d",{willReadFrequently:!0})}catch{At=null}return At}function Xg(e){if(e==="transparent")return"";if(e===""||qg.test(e))return e;let n=Gg();if(!n)return e;try{n.clearRect(0,0,1,1),n.fillStyle="#000000",n.fillStyle=e,n.fillRect(0,0,1,1);let[t,r,o,s]=n.getImageData(0,0,1,1).data;return s===0?"":`rgba(${t}, ${r}, ${o}, ${Math.round(s/255*1e3)/1e3})`}catch{return e}}var Wn=class{constructor(n){this.host=n;this.probe=null;this.observer=null;this.media=null;this.frame=0;this.signature="";this.applied="";this.onScheme=()=>this.schedule();n.addController(this)}hostConnected(){this.observer=new MutationObserver(()=>this.schedule()),this.observer.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),this.media=typeof matchMedia=="function"?matchMedia("(prefers-color-scheme: dark)"):null,this.media?.addEventListener("change",this.onScheme),this.schedule()}hostDisconnected(){this.observer?.disconnect(),this.observer=null,this.media?.removeEventListener("change",this.onScheme),this.media=null,this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.probe?.remove(),this.probe=null,this.applied=""}hostUpdated(){let n=Wg(this.host.hass);n!==this.signature&&(this.signature=n,this.schedule())}refresh(){this.schedule()}schedule(){this.frame||!this.host.isConnected||(this.frame=requestAnimationFrame(()=>{this.frame=0,this.run()}))}ensureProbe(){if(this.probe?.isConnected)return this.probe;let n=document.createElement("span");n.setAttribute("aria-hidden","true"),n.style.display="none";for(let t=0;t<Object.keys(es).length;t+=1)n.appendChild(document.createElement("i"));return this.host.renderRoot.appendChild(n),this.probe=n,n}readAll(n){let t=Object.entries(es),r=Array.from(n.children);return t.forEach(([,o],s)=>{r[s].style.backgroundColor="",r[s].style.backgroundColor=o}),Object.fromEntries(t.map(([o],s)=>{let i=Xg(getComputedStyle(r[s]).backgroundColor.trim()),a=tt(i);return[o,a&&a.a===0?"":i]}))}run(){if(!this.host.isConnected)return;let n=this.ensureProbe(),t={dark:this.host.hass?.themes?.darkMode!==!1,...this.readAll(n)},r=JSON.stringify(t);if(r===this.applied)return;this.applied=r;let o=ru(t);for(let s of ts){let i=o[s];i?this.host.style.setProperty(s,i):this.host.style.removeProperty(s)}}};function qn(e,n){if(!e||typeof e!="object")return"";let t=e[n];return typeof t=="string"?t:""}function ou(e,n,t){if(!e||typeof e!="object")return"";let r=e,o=r.modes,s=t?["dark","light"]:["light","dark"];return qn(o?.[s[0]],n)||qn(r,n)||qn(r.vars,n)||qn(o?.[s[1]],n)}function su(e){let n=e?.selectedTheme?.theme??e?.themes?.theme??"default",t=e?.themes?.themes,o=t&&Object.prototype.hasOwnProperty.call(t,n)?t[n]:void 0,s=e?.themes?.darkMode!==!1;return{name:n,primary:ou(o,"primary-color",s),accent:ou(o,"accent-color",s)}}var iu=[z,K,M`
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
`];var oe={shell:{title:"Themes",tabs:{browse:"Gallery",preview:"Preview",designer:"Designer",people:"People",mods:"Mods"},tabList:"HATS Lite sections",inUse:"In use",menu:"Open navigation menu",fileTheme:"Theme in file",fileLoading:"Loading theme...",fileError:"Could not load this theme."},browse:b,preview:f,designer:y};var au=l`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;function lu(e,n,t){switch(e){case"ArrowRight":return(n+1)%t;case"ArrowLeft":return(n-1+t)%t;case"Home":return 0;case"End":return t-1;default:return null}}function Yg(e){return e==="loading"?l`<span class="file-status" role="status">${oe.shell.fileLoading}</span>`:e==="error"?l`<span class="file-status error" role="alert">${oe.shell.fileError}</span>`:u}function du(e,n,t,r){return e.length<2?u:l`
    <label class="file-theme">
      ${oe.shell.fileTheme}
      <select @change=${r}>
        ${e.map(o=>l`<option value=${o} ?selected=${o===n}>${o}</option>`)}
      </select>
      ${Yg(t)}
    </label>
  `}var Zg=["browse","preview","designer","people","mods"],ns=class extends A{constructor(){super(...arguments);this.narrow=!1;this.tab="browse";this.entry=null;this.fileThemes={};this.fileNames=[];this.fileStatus="";this.chosenName="";this.candidate=null;this.peopleOk=!0;this.modsOk=!1;this.ink=new Wn(this);this.probed=!1;this.installedNames=[];this.bundles=new Ne;this.known=new Le;this.pickToken=0;this.rendered=new Set(["browse"]);this.onTabKey=t=>{let r=this.tabs,o=lu(t.key,r.indexOf(this.tab),r.length);if(o===null)return;t.preventDefault();let s=r[o];this.select(s),this.focusTab(s)};this.onMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};this.navigator=new jn({open:t=>{let r=this.gallery();return r?r.openEntry(r.entries.find(o=>o.full_name===t.full_name)??t):Promise.reject(new Error("gallery missing"))},apply:t=>this.showBundle(t),onChange:()=>this.requestUpdate()});this.onThemeSelected=t=>{let r=t.detail;if(Object.keys(r?.themes??{}).length===0)return;let o=this.gallery();this.previewMode=r.mode??o?.mode,this.navigator.start(o?.visibleEntries()??[],r.entry),this.showBundle(r),this.select("preview"),this.focusTab("preview")};this.onPreviewTheme=t=>{let r=t.detail,o=Fn(this.hass,r?.theme,r?.dark);o&&(this.navigator.clear(),this.pickToken+=1,this.fileStatus="",this.entry=null,this.fileThemes={},this.fileNames=[],this.chosenName=o.candidate.name,this.candidate=o.candidate,this.previewMode=o.mode,this.select("preview"),this.focusTab("preview"))};this.onNav=t=>{let r=t.detail?.direction;(r===1||r===-1)&&this.navigator.move(r)};this.onInstalled=async t=>{let r=t.detail?.fullName,s=(await this.gallery()?.refreshCatalog())?.find(i=>i.full_name===r);s&&this.entry?.full_name===r&&(this.entry=s,this.refreshCandidate())};this.onPreviewMode=t=>{let r=t.detail?.mode;r&&(this.previewMode=r)};this.onFileThemeChange=t=>{let r=t.target.value;if(Object.prototype.hasOwnProperty.call(this.fileThemes,r)){this.pickToken+=1,this.fileStatus="",this.setCandidate(r);return}this.fetchFileTheme(r)};this.onThemeSaved=t=>{let r=t.detail;if(typeof r?.name!="string")return;let o=this.hass?.themes?.darkMode;this.dispatchEvent(new CustomEvent("settheme",{bubbles:!0,composed:!0,detail:Tn(o===void 0?{theme:r.name}:{theme:r.name,dark:o})})),this.select("preview")}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0},entry:{state:!0},fileThemes:{state:!0},fileNames:{state:!0},fileStatus:{state:!0},chosenName:{state:!0},candidate:{state:!0},previewMode:{state:!0},peopleOk:{state:!0},modsOk:{state:!0}}}static{this.styles=iu}tabId(t){return`tab-${t}`}panelId(t){return`panel-${t}`}get tabs(){return Zg.filter(t=>t==="people"?this.peopleOk:t==="mods"?this.modsOk:!0)}select(t){this.rendered.add(t),this.tab=t}async focusTab(t){await this.updateComplete,this.renderRoot.querySelector(`#${this.tabId(t)}`)?.focus()}disconnectedCallback(){super.disconnectedCallback(),this.navigator.clear()}willUpdate(t){if(!t.has("hass"))return;this.hass&&!this.probed&&(this.probed=!0,No(this.hass).then(o=>this.modsOk=o),qd(this.hass).then(o=>{this.peopleOk=o,!o&&this.tab==="people"&&(this.tab="browse")}));let r=Object.keys(this.hass?.themes?.themes??{});Vt(r,this.installedNames)||(this.installedNames=r),this.candidate&&this.refreshCandidate()}build(t){return Kc(this.entry,this.fileThemes,t,this.hass,this.installedNames)}refreshCandidate(){let t=this.candidate;if(t&&!this.entry){this.candidate=qc(this.hass,t,this.previewMode),this.chosenName=this.candidate?this.chosenName:"";return}let r=this.build(this.chosenName);t&&r&&!qo(t,r)&&(this.candidate=r)}setCandidate(t){let r=this.build(t);r&&([this.chosenName,this.candidate]=[t,r])}gallery(){return this.renderRoot.querySelector("hats-lite-browse")}showBundle(t){let r=Object.keys(t?.themes??{});if(r.length===0)return;let o=t.theme&&r.includes(t.theme)?t.theme:r[0];this.pickToken+=1,this.fileStatus="",this.entry=t.entry,this.fileThemes=t.themes,this.fileNames=[...new Set([...t.names??[],...r])],this.bundles.set(t.entry,o,{themes:t.themes,names:this.fileNames,theme:o}),this.setCandidate(o)}async fetchFileTheme(t){let r=this.entry;if(!r)return;let o=++this.pickToken;this.fileStatus="loading";try{let s=await kr(this.hass,this.known,this.bundles,r,t);if(o!==this.pickToken||r!==this.entry)return;this.fileStatus="",this.fileThemes=s.themes,this.setCandidate(t)}catch{o===this.pickToken&&(this.fileStatus="error")}}renderTabs(){return l`
      <nav class="tabs seg" role="tablist" aria-label=${oe.shell.tabList} @keydown=${this.onTabKey}>
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
              ${oe.shell.tabs[t]}
            </button>
          `})}
      </nav>
    `}renderInUse(){let t=su(this.hass),r=o=>o?l`<i style=${te({background:o})}></i>`:l`<i class="neutral"></i>`;return l`
      <span class="chip in-use">
        <span class="label">${oe.shell.inUse}</span>
        <span class="name">${t.name}</span>
        <span class="swatches" aria-hidden="true">${r(t.primary)}${r(t.accent)}</span>
      </span>
    `}render(){return l`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${this.narrow?l`<button class="menu" type="button" aria-label=${oe.shell.menu} @click=${this.onMenu}>${au}</button>`:u}
          <h1 class="title">${oe.shell.title}</h1>
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
          ${this.rendered.has("preview")?l`${du(this.fileNames,this.chosenName,this.fileStatus,this.onFileThemeChange)}
              <hats-lite-preview
                .hass=${this.hass}
                .candidate=${this.candidate}
                .mode=${this.previewMode}
                .nav=${this.navigator.model()}
                .install=${Vc(this.entry,this.candidate)}
                .uninstall=${Wc(this.entry,this.candidate)}
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
    `}};customElements.get("hats-lite-panel")||customElements.define("hats-lite-panel",ns);export{ns as HatsLitePanel};

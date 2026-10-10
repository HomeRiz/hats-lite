var Fe=globalThis,je=Fe.ShadowRoot&&(Fe.ShadyCSS===void 0||Fe.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,xt=Symbol(),Rr=new WeakMap,be=class{constructor(t,r,n){if(this._$cssResult$=!0,n!==xt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=r}get styleSheet(){let t=this.o,r=this.t;if(je&&t===void 0){let n=r!==void 0&&r.length===1;n&&(t=Rr.get(r)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&Rr.set(r,t))}return t}toString(){return this.cssText}},Or=e=>new be(typeof e=="string"?e:e+"",void 0,xt),_=(e,...t)=>{let r=e.length===1?e[0]:t.reduce((n,o,s)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[s+1],e[0]);return new be(r,e,xt)},Dr=(e,t)=>{if(je)e.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(let r of t){let n=document.createElement("style"),o=Fe.litNonce;o!==void 0&&n.setAttribute("nonce",o),n.textContent=r.cssText,e.appendChild(n)}},kt=je?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let r="";for(let n of t.cssRules)r+=n.cssText;return Or(r)})(e):e;var{is:hi,defineProperty:fi,getOwnPropertyDescriptor:mi,getOwnPropertyNames:gi,getOwnPropertySymbols:bi,getPrototypeOf:yi}=Object,Ue=globalThis,Lr=Ue.trustedTypes,vi=Lr?Lr.emptyScript:"",wi=Ue.reactiveElementPolyfillSupport,ye=(e,t)=>e,Et={toAttribute(e,t){switch(t){case Boolean:e=e?vi:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch{r=null}}return r}},Hr=(e,t)=>!hi(e,t),Ir={attribute:!0,type:String,converter:Et,reflect:!1,useDefault:!1,hasChanged:Hr};Symbol.metadata??=Symbol("metadata"),Ue.litPropertyMetadata??=new WeakMap;var L=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,r=Ir){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(t,r),!r.noAccessor){let n=Symbol(),o=this.getPropertyDescriptor(t,n,r);o!==void 0&&fi(this.prototype,t,o)}}static getPropertyDescriptor(t,r,n){let{get:o,set:s}=mi(this.prototype,t)??{get(){return this[r]},set(i){this[r]=i}};return{get:o,set(i){let a=o?.call(this);s?.call(this,i),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Ir}static _$Ei(){if(this.hasOwnProperty(ye("elementProperties")))return;let t=yi(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(ye("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ye("properties"))){let r=this.properties,n=[...gi(r),...bi(r)];for(let o of n)this.createProperty(o,r[o])}let t=this[Symbol.metadata];if(t!==null){let r=litPropertyMetadata.get(t);if(r!==void 0)for(let[n,o]of r)this.elementProperties.set(n,o)}this._$Eh=new Map;for(let[r,n]of this.elementProperties){let o=this._$Eu(r,n);o!==void 0&&this._$Eh.set(o,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let r=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let o of n)r.unshift(kt(o))}else t!==void 0&&r.push(kt(t));return r}static _$Eu(t,r){let n=r.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,r=this.constructor.elementProperties;for(let n of r.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Dr(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,r,n){this._$AK(t,n)}_$ET(t,r){let n=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,n);if(o!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:Et).toAttribute(r,n.type);this._$Em=t,s==null?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(t,r){let n=this.constructor,o=n._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let s=n.getPropertyOptions(o),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Et;this._$Em=o;let a=i.fromAttribute(r,s.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(t,r,n,o=!1,s){if(t!==void 0){let i=this.constructor;if(o===!1&&(s=this[t]),n??=i.getPropertyOptions(t),!((n.hasChanged??Hr)(s,r)||n.useDefault&&n.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,n))))return;this.C(t,r,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,r,{useDefault:n,reflect:o,wrapped:s},i){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,i??r??this[t]),s!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(r=void 0),this._$AL.set(t,r)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,s]of this._$Ep)this[o]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[o,s]of n){let{wrapped:i}=s,a=this[o];i!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,s,a)}}let t=!1,r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(r)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(r)}willUpdate(t){}_$AE(t){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(t){}firstUpdated(t){}};L.elementStyles=[],L.shadowRootOptions={mode:"open"},L[ye("elementProperties")]=new Map,L[ye("finalized")]=new Map,wi?.({ReactiveElement:L}),(Ue.reactiveElementVersions??=[]).push("2.1.2");var Mt=globalThis,Nr=e=>e,Be=Mt.trustedTypes,Fr=Be?Be.createPolicy("lit-html",{createHTML:e=>e}):void 0,zr="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,Wr="?"+N,xi=`<${Wr}>`,Y=document,we=()=>Y.createComment(""),xe=e=>e===null||typeof e!="object"&&typeof e!="function",Ct=Array.isArray,ki=e=>Ct(e)||typeof e?.[Symbol.iterator]=="function",$t=`[ 	
\f\r]`,ve=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,jr=/-->/g,Ur=/>/g,q=RegExp(`>|${$t}(?:([^\\s"'>=/]+)(${$t}*=${$t}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Br=/'/g,Vr=/"/g,Gr=/^(?:script|style|textarea|title)$/i,Rt=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),u=Rt(1),Oc=Rt(2),Dc=Rt(3),I=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),Kr=new WeakMap,X=Y.createTreeWalker(Y,129);function qr(e,t){if(!Ct(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Fr!==void 0?Fr.createHTML(t):t}var Ei=(e,t)=>{let r=e.length-1,n=[],o,s=t===2?"<svg>":t===3?"<math>":"",i=ve;for(let a=0;a<r;a++){let c=e[a],d,f,l=-1,p=0;for(;p<c.length&&(i.lastIndex=p,f=i.exec(c),f!==null);)p=i.lastIndex,i===ve?f[1]==="!--"?i=jr:f[1]!==void 0?i=Ur:f[2]!==void 0?(Gr.test(f[2])&&(o=RegExp("</"+f[2],"g")),i=q):f[3]!==void 0&&(i=q):i===q?f[0]===">"?(i=o??ve,l=-1):f[1]===void 0?l=-2:(l=i.lastIndex-f[2].length,d=f[1],i=f[3]===void 0?q:f[3]==='"'?Vr:Br):i===Vr||i===Br?i=q:i===jr||i===Ur?i=ve:(i=q,o=void 0);let v=i===q&&e[a+1].startsWith("/>")?" ":"";s+=i===ve?c+xi:l>=0?(n.push(d),c.slice(0,l)+zr+c.slice(l)+N+v):c+N+(l===-2?a:v)}return[qr(e,s+(e[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},ke=class e{constructor({strings:t,_$litType$:r},n){let o;this.parts=[];let s=0,i=0,a=t.length-1,c=this.parts,[d,f]=Ei(t,r);if(this.el=e.createElement(d,n),X.currentNode=this.el.content,r===2||r===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(o=X.nextNode())!==null&&c.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let l of o.getAttributeNames())if(l.endsWith(zr)){let p=f[i++],v=o.getAttribute(l).split(N),x=/([.?@])?(.*)/.exec(p);c.push({type:1,index:s,name:x[2],strings:v,ctor:x[1]==="."?At:x[1]==="?"?St:x[1]==="@"?_t:oe}),o.removeAttribute(l)}else l.startsWith(N)&&(c.push({type:6,index:s}),o.removeAttribute(l));if(Gr.test(o.tagName)){let l=o.textContent.split(N),p=l.length-1;if(p>0){o.textContent=Be?Be.emptyScript:"";for(let v=0;v<p;v++)o.append(l[v],we()),X.nextNode(),c.push({type:2,index:++s});o.append(l[p],we())}}}else if(o.nodeType===8)if(o.data===Wr)c.push({type:2,index:s});else{let l=-1;for(;(l=o.data.indexOf(N,l+1))!==-1;)c.push({type:7,index:s}),l+=N.length-1}s++}}static createElement(t,r){let n=Y.createElement("template");return n.innerHTML=t,n}};function ne(e,t,r=e,n){if(t===I)return t;let o=n!==void 0?r._$Co?.[n]:r._$Cl,s=xe(t)?void 0:t._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),s===void 0?o=void 0:(o=new s(e),o._$AT(e,r,n)),n!==void 0?(r._$Co??=[])[n]=o:r._$Cl=o),o!==void 0&&(t=ne(e,o._$AS(e,t.values),o,n)),t}var Tt=class{constructor(t,r){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:r},parts:n}=this._$AD,o=(t?.creationScope??Y).importNode(r,!0);X.currentNode=o;let s=X.nextNode(),i=0,a=0,c=n[0];for(;c!==void 0;){if(i===c.index){let d;c.type===2?d=new Ee(s,s.nextSibling,this,t):c.type===1?d=new c.ctor(s,c.name,c.strings,this,t):c.type===6&&(d=new Pt(s,this,t)),this._$AV.push(d),c=n[++a]}i!==c?.index&&(s=X.nextNode(),i++)}return X.currentNode=Y,o}p(t){let r=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,r),r+=n.strings.length-2):n._$AI(t[r])),r++}},Ee=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,r,n,o){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=n,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,r=this._$AM;return r!==void 0&&t?.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=ne(this,t,r),xe(t)?t===m||t==null||t===""?(this._$AH!==m&&this._$AR(),this._$AH=m):t!==this._$AH&&t!==I&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ki(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==m&&xe(this._$AH)?this._$AA.nextSibling.data=t:this.T(Y.createTextNode(t)),this._$AH=t}$(t){let{values:r,_$litType$:n}=t,o=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=ke.createElement(qr(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===o)this._$AH.p(r);else{let s=new Tt(o,this),i=s.u(this.options);s.p(r),this.T(i),this._$AH=s}}_$AC(t){let r=Kr.get(t.strings);return r===void 0&&Kr.set(t.strings,r=new ke(t)),r}k(t){Ct(this._$AH)||(this._$AH=[],this._$AR());let r=this._$AH,n,o=0;for(let s of t)o===r.length?r.push(n=new e(this.O(we()),this.O(we()),this,this.options)):n=r[o],n._$AI(s),o++;o<r.length&&(this._$AR(n&&n._$AB.nextSibling,o),r.length=o)}_$AR(t=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);t!==this._$AB;){let n=Nr(t).nextSibling;Nr(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},oe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,r,n,o,s){this.type=1,this._$AH=m,this._$AN=void 0,this.element=t,this.name=r,this._$AM=o,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=m}_$AI(t,r=this,n,o){let s=this.strings,i=!1;if(s===void 0)t=ne(this,t,r,0),i=!xe(t)||t!==this._$AH&&t!==I,i&&(this._$AH=t);else{let a=t,c,d;for(t=s[0],c=0;c<s.length-1;c++)d=ne(this,a[n+c],r,c),d===I&&(d=this._$AH[c]),i||=!xe(d)||d!==this._$AH[c],d===m?t=m:t!==m&&(t+=(d??"")+s[c+1]),this._$AH[c]=d}i&&!o&&this.j(t)}j(t){t===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},At=class extends oe{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===m?void 0:t}},St=class extends oe{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==m)}},_t=class extends oe{constructor(t,r,n,o,s){super(t,r,n,o,s),this.type=5}_$AI(t,r=this){if((t=ne(this,t,r,0)??m)===I)return;let n=this._$AH,o=t===m&&n!==m||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==m&&(n===m||o);o&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Pt=class{constructor(t,r,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){ne(this,t)}};var $i=Mt.litHtmlPolyfillSupport;$i?.(ke,Ee),(Mt.litHtmlVersions??=[]).push("3.3.3");var Xr=(e,t,r)=>{let n=r?.renderBefore??t,o=n._$litPart$;if(o===void 0){let s=r?.renderBefore??null;n._$litPart$=o=new Ee(t.insertBefore(we(),s),s,void 0,r??{})}return o._$AI(e),o};var Ot=globalThis,T=class extends L{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Xr(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};T._$litElement$=!0,T.finalized=!0,Ot.litElementHydrateSupport?.({LitElement:T});var Ti=Ot.litElementPolyfillSupport;Ti?.({LitElement:T});(Ot.litElementVersions??=[]).push("4.2.2");var Yr={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Zr=e=>(...t)=>({_$litDirective$:e,values:t}),Ve=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,r,n){this._$Ct=t,this._$AM=r,this._$Ci=n}_$AS(t,r){return this.update(t,r)}update(t,r){return this.render(...r)}};var Jr="important",Ai=" !"+Jr,F=Zr(class extends Ve{constructor(e){if(super(e),e.type!==Yr.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{let n=e[r];return n==null?t:t+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${n};`},"")}update(e,[t]){let{style:r}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let n of this.ft)t[n]==null&&(this.ft.delete(n),n.includes("-")?r.removeProperty(n):r[n]=null);for(let n in t){let o=t[n];if(o!=null){this.ft.add(n);let s=typeof o=="string"&&o.endsWith(Ai);n.includes("-")||s?r.setProperty(n,s?o.slice(0,-11):o,s?Jr:""):r[n]=o}}return I}});function se(e,t){return e.connection.sendMessagePromise(t)}var Qr="hats-lite-theme-selected",en="hats-lite-theme-saved",tn="hats-lite-mode-change",Dt="hats_lite_catalog",Lt="/api/hats_lite/background";var rn=["image/png","image/jpeg","image/webp","image/gif"];var h={title:"Themes",searchLabel:"Search themes",searchPlaceholder:"Search themes",loading:"Loading themes...",loadError:"Could not load the theme list.",cachedNote:"Showing the saved list from your last successful load.",noThemes:"No themes available.",retry:"Try again",previewsLoading:"Loading previews",apply:"Apply",noMatches:"No themes match your search.",noFilterMatches:"No themes match this filter yet. Previews load as you scroll.",installed:"Installed",inUse:"In use",otherCopy:"Other copy installed",licenseUnknown:"License unknown to HATS Lite",licenseShort:"License unknown",licenseKnown:"License detected when the thumbnails were built",starsLabel:"Stars",starGlyph:"★",themeErrorDefault:"Could not open this theme. Try again.",preview:"Preview",openPreview:"Open preview of",showing:"Showing",modeLabel:"Thumbnail mode",modeDark:"Dark",modeLight:"Light",filterLabel:"Filter themes",filterAll:"All",filterInstalled:"Installed",filterDark:"Dark",filterLight:"Light",filterGlass:"Glass",thumbUnavailable:"Preview not available",thumbRateLimited:"Rate limited, try again later",thumbLoading:"Loading preview",thumbRoom:"Living room thermostat",thumbTemp:"20.5 °C",thumbHeating:"Heating to 21",thumbEnergy:"Energy today",thumbGarage:"Garage door",thumbClosed:"Closed",thumbLocked:"Locked since 18:30",thumbLights:"Lights and doors",thumbLight:"Living room light",thumbDoor:"Front door",thumbPorch:"Porch timer",thumbGreeting:"Good evening",thumbSunset:"Sunset 18:42",thumbChipLight:"Light on",thumbChipFan:"Fan on",thumbChipHeat:"Heat"};function on(e){if(!e||typeof e!="object")return null;let t=e;return typeof t.full_name!="string"?null:{full_name:t.full_name,description:typeof t.description=="string"?t.description:"",stars:typeof t.stars=="number"?t.stars:0,installed:t.installed===!0,last_commit:typeof t.last_commit=="string"?t.last_commit:null,hacs_id:typeof t.hacs_id=="string"?t.hacs_id:null}}function It(e){return Array.isArray(e)?e.flatMap(t=>{let r=on(t);return r?[r]:[]}):[]}function sn(){try{let e=localStorage.getItem(Dt);if(e===null)return null;let t=JSON.parse(e);return!Array.isArray(t)||!t.every(r=>on(r)!==null)?null:It(t)}catch{return null}}function an(e){try{localStorage.setItem(Dt,JSON.stringify(e))}catch{return}}function ln(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function cn(e){if(e&&typeof e=="object"&&"message"in e){let t=e.message;if(typeof t=="string"&&t)return t}return h.themeErrorDefault}function dn(e,t){return e.full_name.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)}var Si=new Set(["invalid_theme","theme_too_large","not_found","invalid_request","not_in_catalog"]);function nn(e,t){if(!e||typeof e!="object"||!(t in e))return"";let r=e[t];return typeof r=="string"?r:""}function Ke(e){let t=nn(e,"code");return Si.has(t)?"permanent":t==="rate_limited"||/\bstatus (403|429)\b/.test(nn(e,"message"))?"limited":"transient"}var _i=/^[A-Za-z0-9_-]+$/,Pi=/[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i,Mi=/['"]/,Ci=["lovelace-background","background-image"];function D(e,t){return{...e.vars,...e.modes?.[t]??{}}}function Ri(e){return _i.test(e)?!e.startsWith("card-mod-")&&!e.startsWith("uix-"):!1}function Oi(e,t){return typeof t!="string"||Pi.test(t)?!1:!Mi.test(t)||Ci.includes(e)}function Di(e){return Object.entries(e).filter(([t,r])=>Ri(t)&&Oi(t,r))}var Li=["lovelace-background","background-image"],Ii=/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi,Hi=/(^|[\s,/)])fixed(?=$|[\s,/(])/gi,Ni=/^\s*(?:(?:fixed|scroll|local)\s*(?:,\s*|$))+$/i;function un(e){return e.replace(Hi,"$1scroll")}function Fi(e){let t="",r=0;for(let n of e.matchAll(Ii)){let o=n.index??0;t+=un(e.slice(r,o))+n[0],r=o+n[0].length}return t+un(e.slice(r))}function ji(e,t){return Li.includes(e)||/url\(/i.test(t)||Ni.test(t)?Fi(t):t}function $e(e,t){for(let[r,n]of Di(t))e.style.setProperty(`--${r}`,ji(r,n))}var g={title:"Theme preview",dashboard:"Dashboard",defaultDashboard:"Overview",view:"View",device:"Device",desktop:"Desktop",tablet:"Tablet",phone:"Phone",density:"Density",normal:"Normal",compact:"Compact",mode:"Mode",dark:"Dark",light:"Light",current:"Current",candidate:"Candidate",divider:"Drag to compare current and candidate",splitAt:"Split at {percent} percent",apply:"Apply",installFirst:"Install first",nameCollision:"The installed copy of {name} has other values than this preview, so Apply and Try are turned off for the previewed one.",nameTaken:"Name already used",repoLink:"View repository",tryButton:"Try for 30 seconds",placeholderCard:"Preview unavailable for card type",loading:"Loading dashboard...",loadError:"Could not load this dashboard.",noViews:"This dashboard has no views.",noCards:"This dashboard has no cards to preview.",generatedSuffix:"(generated by Home Assistant)",generatedDefault:"This dashboard is generated by Home Assistant and has no stored layout to read. Pick another dashboard.",sampleView:"Sample from your entities",sampleNote:"This is a sample built from your entities. The real Overview is generated by Home Assistant and cannot be read.",domainTitles:{light:"Lights",switch:"Switches",climate:"Climate",cover:"Covers",media_player:"Media players",sensor:"Sensors",binary_sensor:"Binary sensors"},compare:"Compare",compareLabel:"Show",themeOnly:"Theme only",footnote:"Drawn from your own dashboard with read-only data and scoped colors. Nothing changes until you press Apply.",emptyView:"This view has no cards.",tooManyCards:"This view has more than 200 cards, so it is not previewed.",noCandidate:"Select a theme to compare.",noModeBlock:"This theme has no {mode} block, so the candidate uses the current colors.",trialUnavailable:"Trial mode is not ready. Reload the page and try again.",trialFailed:"The trial could not start."};var fn=200,Ui=3,Bi=60,Vi=1500,Ki=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,zi=3e3;function w(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function We(e){if(!w(e))return{};let t=Object.create(null);for(let[r,n]of Object.entries(e))typeof n=="string"&&(t[r]=n);return t}function pn(e){if(w(e))return{dark:We(e.dark),light:We(e.light)}}function j(e){return w(e.vars)?{vars:We(e.vars),modes:pn(e.modes)}:{vars:We(e),modes:pn(e.modes)}}function mn(e){let t=e?.selectedTheme?.theme??e?.themes?.theme,r=e?.themes?.themes;if(!t||!r||!Object.prototype.hasOwnProperty.call(r,t))return;let n=r[t];return w(n)?j(n):void 0}function hn(e){let t=e.trim().replace(/[\s;]+$/,"").replace(/\s*!important$/i,"").replace(/[\s;]+$/,"").replace(/\s+/g," ");return/^#[0-9a-f]+$/i.test(t)?t.toLowerCase():t}function Wi(e,t){return Object.keys(e).some(r=>Object.prototype.hasOwnProperty.call(t,r)&&hn(e[r])!==hn(t[r]))}function jt(e,t){return["dark","light"].some(r=>Wi(D(e,r),D(t,r)))}function gn(e,t){return w(e)?jt(j(e),t):!1}function Ut(e){return e?[...Object.keys(e.vars),...Object.keys(e.modes?.dark??{}),...Object.keys(e.modes?.light??{})]:[]}function bn(e){let t=e?.selectedTheme,r=t?.theme??e?.themes?.theme??"default";if(!t)return{theme:r};let n={theme:r};return typeof t.dark=="boolean"&&(n.dark=e?.themes?.darkMode??!1),typeof t.primaryColor=="string"&&(n.primaryColor=t.primaryColor),typeof t.accentColor=="string"&&(n.accentColor=t.accentColor),n}function yn(e,t){let r={theme:e.name};return t&&(r.dark=t==="dark"),r}function Ge(e){return e.installed&&e.canApply&&!e.nameCollision}function qe(e){return e.installed&&!e.nameCollision}function vn(e){if(!(!Ki.test(e)||e.split("/").some(r=>r==="."||r==="..")))return`https://github.com/${e}`}function Xe(e,t){return e?e.entry?D(e.entry,t):e.vars:{}}function wn(e){return e&&/^https:\/\//i.test(e)?e:void 0}async function xn(e){let t=await e.connection.sendMessagePromise({type:"lovelace/dashboards/list"}),r=[{url_path:null,title:g.defaultDashboard}];if(!Array.isArray(t))return r;for(let n of t)w(n)&&typeof n.url_path=="string"&&r.push({url_path:n.url_path,title:typeof n.title=="string"?n.title:n.url_path});return r}async function kn(e,t){let r=await e.connection.sendMessagePromise({type:"lovelace/config",url_path:t});return w(r)?r:{}}function Bt(e){return Array.isArray(e.views)?e.views.filter(w):[]}function En(e,t){return typeof e.title=="string"&&e.title?e.title:typeof e.path=="string"&&e.path?e.path:`${g.view} ${t+1}`}function $n(e,t){if(!Array.isArray(e.cards))return e;if(t>=Ui)return{...e,cards:[]};let r=e.cards.filter(w).map(n=>$n(n,t+1));return{...e,cards:r}}function Vt(e){let t=Array.isArray(e.cards)?e.cards:[],n=(Array.isArray(e.sections)?e.sections:[]).flatMap(o=>w(o)&&Array.isArray(o.cards)?o.cards:[]);return[...t,...n].filter(w).map(o=>$n(o,0))}function Kt(e){return e.reduce((t,r)=>{let n=Array.isArray(r.cards)?Kt(r.cards.filter(w)):0;return t+1+n},0)}var Ht,Te,Nt;function Ft(){let e=window.loadCardHelpers;return typeof e=="function"?e:void 0}async function Gi(){let e=customElements.whenDefined("partial-panel-resolver"),t=new Promise(n=>setTimeout(n,zi));if(await Promise.race([e,t]),!customElements.get("partial-panel-resolver"))return;let r=document.createElement("partial-panel-resolver");r.hass={panels:{tmp:{url_path:"tmp",component_name:"lovelace"}}},r._updateRoutes?.(),await r.routerOptions?.routes?.tmp?.load?.()}async function qi(){return Ft()?!0:(Nt??=Gi().catch(()=>{}).finally(()=>{Nt=void 0}),await Nt,Ft()!==void 0)}async function Tn(){if(!await qi())return;let e=Ft();if(e)return Te&&Ht===e||(Ht=e,Te=Promise.resolve().then(()=>e()).catch(()=>{Te=void 0,Ht=void 0})),Te}function Xi(e){let t=typeof e.type=="string"?e.type:"unknown";return Array.from(t).slice(0,Bi).join("")}function ze(e){let t=document.createElement("div");return t.className="placeholder",t.textContent=`${g.placeholderCard} ${e}`,t}function Yi(e){return e.localName==="hui-error-card"||e instanceof HTMLUnknownElement}function Zi(e){return new Promise(t=>{let r=setTimeout(()=>t(!1),Vi),n=o=>{clearTimeout(r),t(o)};try{customElements.whenDefined(e).then(()=>n(!0),()=>n(!1))}catch{n(!1)}})}async function An(e,t){let r=Xi(t);if(!e)return ze(r);let n;try{n=e.createCardElement(t)}catch{return ze(r)}if(Yi(n))return ze(r);let o=n.localName;return o.includes("-")&&customElements.get(o)===void 0&&!await Zi(o)?ze(r):n}function Sn(e){let t=[];for(let r=0;r<e.style.length;r+=1){let n=e.style.item(r);n.startsWith("--")&&t.push(n)}for(let r of t)e.style.removeProperty(r)}var ie=class{constructor(){this.byRepo=new Map}add(t,r){let n=this.byRepo.get(t)??new Set;for(let o of r)n.add(o);this.byRepo.set(t,n)}of(t,r){let n=new Set(this.byRepo.get(t));for(let o of r)o&&n.add(o);return[...n]}};function _n(e,t){let r=new Set(Object.keys(e));if(Array.isArray(t))for(let n of t)typeof n=="string"&&r.add(n);return[...r]}function Pn(e,t,r){return e.installed||t.some(n=>r.has(n))}function Mn(e,t){return e.includes(t)}function Ye(e,t){return e.length===t.length&&e.every((r,n)=>r===t[n])}function Cn(e,t,r,n,o){if(e.installed)return"match";if(!t.some(a=>r.has(a)))return"none";if(!o||!n||!Object.prototype.hasOwnProperty.call(n,o.name))return"unverified";let s=n[o.name];if(!w(s))return"unverified";let i={vars:o.vars,modes:o.modes};return jt(j(s),i)?"different":"match"}var Rn="hats_lite/catalog",Ji="hats_lite/theme",zt=5e3,Wt=6e4;function On(e,t){let r=Ke(e);return r==="permanent"?null:r==="limited"?Wt:zt*2**t}function Qi(e){if(typeof e!="object"||e===null)return!1;let t=e.code;return t==="invalid_format"||t==="invalid_request"||t==="unknown_error"}function Z(e,t,r,n=!1,o){if(!e)return Promise.reject(new Error(h.themeErrorDefault));let s={type:Ji,full_name:r.full_name,commit:r.last_commit||"HEAD"};return n?s.summary=!0:o&&(s.theme=o),se(e,s).then(i=>{if(!ln(i?.themes))throw new Error(h.themeErrorDefault);let a=_n(i.themes,i.names);return t.add(r.full_name,a),{themes:i.themes,summary:i.summary===!0,names:a}},i=>{if(s.theme!==void 0&&Qi(i))return Z(e,t,r);throw i})}var Dn="hats_lite_theme_cache",qt=120,ea=2e4;function Gt(e){if(!w(e))return null;let t=Object.create(null);for(let[r,n]of Object.entries(e)){if(typeof n!="string")return null;t[r]=n}return t}function ta(e){if(!w(e)||typeof e.name!="string")return null;let t=Gt(e.vars);if(!t)return null;let r={name:e.name,vars:t};if(e.modes!==void 0&&e.modes!==null){if(!w(e.modes))return null;let n=Gt(e.modes.dark??{}),o=Gt(e.modes.light??{});if(!n||!o)return null;r.modes={dark:n,light:o}}return r}function ae(e){let t=Object.keys(e)[0];if(t===void 0)return null;let r=e[t];if(!w(r))return null;let n=j(r);return{name:t,vars:n.vars,modes:n.modes}}var Ln=new WeakMap;function Hn(e,t){let r=Ln.get(e)??{};return Ln.set(e,r),r[t]??=D(e,t),r[t]}function In(e){return JSON.stringify(e).length>ea}var Ze=class{constructor(){this.slots=new Map;this.load()}load(){try{let t=localStorage.getItem(Dn);if(t===null)return;let r=JSON.parse(t);if(!Array.isArray(r))return;for(let n of r){if(!Array.isArray(n)||typeof n[0]!="string")continue;let o=ta(n[1]);o&&!In(o)&&this.slots.set(n[0],{theme:o})}this.trim()}catch{this.slots.clear()}}trim(){let t=[];for(;this.slots.size>qt;){let r=this.slots.keys().next().value;if(r===void 0)break;this.slots.delete(r),t.push(r)}return t}get size(){return this.slots.size}has(t){return this.slots.has(t)}touch(t){let r=this.slots.get(t);r&&(this.slots.delete(t),this.slots.set(t,r))}get(t){return this.slots.get(t)?.theme}bundle(t){return this.slots.get(t)?.bundle}set(t,r,n){this.slots.delete(t),this.slots.set(t,{theme:r,bundle:n});let o=this.trim();return this.persist(),o}persist(){try{let t=[...this.slots.entries()].filter(([,r])=>!In(r.theme)).map(([r,n])=>[r,n.theme]);localStorage.setItem(Dn,JSON.stringify(t))}catch{return}}};var jn=["all","installed","dark","light","glass"];function Un(e){let t=e.split("/");return t[t.length-1]||e}function Bn(e){let t=e.indexOf("/");return t>0?e.slice(0,t):""}function U(e){return`${e.full_name}@${e.last_commit||"HEAD"}`}function ra(e){return`${e.full_name} ${e.description}`.toLowerCase()}function Nn(e,t){return new RegExp(`(^|[^a-z0-9])${t}([^a-z0-9]|$)`).test(e)}function Fn(e){return!!e&&Object.keys(e).length>0}function na(e){return[e.vars,e.modes?.dark,e.modes?.light].some(r=>Object.entries(r??{}).some(([n,o])=>/backdrop-filter|blur/i.test(n)||/blur\(/i.test(o)))}function Vn(e,t,r,n,o=t.installed){let s=r===void 0?n:void 0,i=ra(t);return e==="all"?!0:e==="installed"?o:e==="dark"?Nn(i,"dark")||Fn(r?.modes?.dark)||s?.dark===!0:e==="light"?Nn(i,"light")||Fn(r?.modes?.light)||s?.light===!0:/glass|frost|blur/.test(i)||r!==void 0&&na(r)||s?.glass===!0}var oa={all:h.filterAll,installed:h.filterInstalled,dark:h.filterDark,light:h.filterLight,glass:h.filterGlass};function Kn(e){return u`
    <div class="toolbar">
      <span class="showing">${h.showing}</span>
      <div class="seg" role="group" aria-label=${h.modeLabel}>
        ${["dark","light"].map(t=>u`
            <button
              type="button"
              data-mode=${t}
              aria-pressed=${e.mode===t?"true":"false"}
              @click=${()=>e.onMode(t)}
            >
              ${t==="dark"?h.modeDark:h.modeLight}
            </button>
          `)}
      </div>
      <div class="filters" role="group" aria-label=${h.filterLabel}>
        ${jn.map(t=>u`
            <button
              type="button"
              class="chip-btn"
              data-filter=${t}
              aria-pressed=${e.filter===t?"true":"false"}
              @click=${()=>e.onFilter(t)}
            >
              ${oa[t]}
            </button>
          `)}
      </div>
      <input
        class="search"
        type="search"
        aria-label=${h.searchLabel}
        placeholder=${h.searchPlaceholder}
        .value=${e.query}
        @input=${e.onSearch}
      />
    </div>
  `}var Xn="/hats_lite_static/thumbs";function sa(e,t,r){let n=e%t,o=Math.floor(e/t);return{sizeX:t*100,sizeY:r*100,posX:t>1?n/(t-1)*100:0,posY:r>1?o/(r-1)*100:0}}function zn(e,t){return typeof e=="number"&&Number.isInteger(e)&&e>0&&e<=t}function ia(e,t,r){if(typeof e!="object"||e===null)return null;let n=e,o=n.index;return typeof n.full_name!="string"||typeof n.name!="string"||typeof o!="number"||!Number.isInteger(o)||o<0||o>=t||r.has(o)?null:(r.add(o),{full_name:n.full_name,name:n.name,index:o,commit:typeof n.commit=="string"&&n.commit?n.commit:null,license:typeof n.license=="string"&&n.license?n.license:null,dark:n.dark===!0,light:n.light===!0,glass:n.glass===!0})}function aa(e,t){for(let n of[e,t])if(typeof n=="string"&&n)return n;let r=n=>n!=null;return r(e)||r(t)?null:""}function la(e){if(typeof e!="object"||e===null)return null;let t=e,{columns:r,rows:n,themes:o}=t;if(t.version!==1||!zn(r,64)||!zn(n,2e3)||!Array.isArray(o))return null;let s=new Set,i=new Map;for(let c of o){let d=ia(c,r*n,s);d&&i.set(d.full_name,d)}let a=aa(t.hash,t.generated);return a===null?null:{columns:r,rows:n,version:a,themes:i}}var ca=6e3,da=2e4,Wn=3e4,Je=class extends Error{},Ae=class extends Error{},Gn={fetchIndex(e){return fetch(`${Xn}/index.json`,{credentials:"same-origin",signal:e}).then(t=>{if(t.status===404)throw new Je("index missing");if(!t.ok)throw new Error("index unavailable");return t.json()})},loadImage(e,t){return new Promise(r=>{let n=new Image,o=i=>{t?.removeEventListener("abort",s),r(i)},s=()=>{n.src="",o(!1)};n.onload=()=>o(!0),n.onerror=()=>o(!1),t?.addEventListener("abort",s),n.src=e})}};function qn(e,t,r){let n=new AbortController;return new Promise((o,s)=>{let i=()=>{clearTimeout(c),e.delete(a)},a=()=>{i(),n.abort(),s(new Ae)},c=setTimeout(()=>{i(),n.abort(),s(new Error("timeout"))},t);e.add(a);let d=f=>l=>{i(),f(l)};try{r(n.signal).then(d(o),d(s))}catch(f){d(s)(f)}})}var Qe=class{constructor(t){this.onChange=t;this.started=!1;this.images=new Map;this.wanted=new Set;this.retries=new Map;this.active=new Set;this.disposed=!1;this.ticket=0}ensure(t){if(this.wanted.add(t),!this.disposed){if(this.started){this.pump();return}this.startIndex()}}startIndex(){this.started=!0;let t=++this.ticket;Promise.resolve().then(()=>{t===this.ticket&&!this.disposed&&this.loadIndex(!0)})}later(t){let r=()=>{this.retries.delete(r),t()};this.retries.set(r,this.disposed?void 0:setTimeout(r,Wn))}dispose(){this.disposed=!0,this.ticket+=1;for(let[t,r]of this.retries)r!==void 0&&clearTimeout(r),this.retries.set(t,void 0);for(let t of[...this.active])t();this.index===void 0&&(this.started=!1);for(let[t,r]of this.images)r===void 0&&this.images.delete(t)}resume(){this.disposed=!1;for(let[t,r]of this.retries)r===void 0&&this.retries.set(t,setTimeout(t,Wn));!this.started&&this.wanted.size>0?this.startIndex():this.pump()}async loadIndex(t){let r=null,n=!1;try{r=la(await qn(this.active,ca,o=>Gn.fetchIndex(o)))}catch(o){if(o instanceof Ae)return;n=!(o instanceof Je)}this.index=r,this.pump(),this.onChange(),!r&&n&&t&&this.later(()=>void this.loadIndex(!1))}pump(){if(this.index)for(let t of this.wanted)this.images.has(t)||(this.images.set(t,void 0),this.loadImage(t,!0))}async loadImage(t,r){let n=this.imageUrl(t),o=!1;try{o=await qn(this.active,da,s=>Gn.loadImage(n,s))}catch(s){if(s instanceof Ae)return}this.images.set(t,o),this.onChange(),!o&&r&&this.later(()=>void this.loadImage(t,!1))}imageUrl(t){let r=this.index?.version??"",n=r?`?v=${encodeURIComponent(r)}`:"";return`${Xn}/atlas-${t}.webp${n}`}theme(t,r){let n=this.index?.themes.get(t);if(!n)return;let o=n.commit;if(!(r&&o&&o!=="HEAD"&&o!==r))return n}state(t,r,n){if(this.ensure(r),this.index===void 0)return"pending";if(!this.theme(t,n))return"none";if(!this.images.has(r))return"pending";let o=this.images.get(r);return o===void 0?"pending":o?"ok":"none"}tile(t,r){let n=this.theme(t,r);return!n||!this.index?null:sa(n.index,this.index.columns,this.index.rows)}};function Yn(e,t,r,n){let o=e.tile(t,n),s=e.theme(t,n);if(!o||!s)return m;let i={backgroundImage:`url("${e.imageUrl(r)}")`,backgroundSize:`${o.sizeX}% ${o.sizeY}%`,backgroundPosition:`${o.posX}% ${o.posY}%`};return u`<div
    class="atlas-thumb"
    role="img"
    aria-label=${s.name}
    data-atlas="true"
    style=${F(i)}
  ></div>`}function Zn(e){if(!e)return u`<span
      class="chip"
      title=${h.licenseUnknown}
      aria-label=${h.licenseUnknown}
      >${h.licenseShort}</span
    >`;let t=`${h.licenseKnown}: ${e}`;return u`<span class="chip" title=${t} aria-label=${t}>${e}</span>`}function ua(e){e.preventDefault()}function pa(e){return e==="match"?u`<span class="chip ok">${h.installed}</span>`:e==="unverified"?u`<span class="chip">${h.installed}</span>`:e==="different"?u`<span class="chip warn">${h.otherCopy}</span>`:m}function Jn(e,t){let r=Un(e.entry.full_name),n=Bn(e.entry.full_name),o=`${h.starsLabel}: ${e.entry.stars}`;return u`
    <article class="card" data-key=${e.key}>
      <button
        class="thumb-btn"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        ?disabled=${e.busy}
        @mousedown=${ua}
        @click=${t}
      >
        ${e.atlased?Yn(e.atlas,e.entry.full_name,e.mode,e.entry.last_commit):u`<hats-lite-thumb
              .vars=${e.vars}
              .mode=${e.mode}
              ?failed=${e.failed}
              ?limited=${e.limited}
            ></hats-lite-thumb>`}
      </button>
      <div class="body">
        <span class="name">${r}</span>
        ${n?u`<span class="owner">${n}</span>`:m}
        <div class="chips">
          ${pa(e.installedKind)}
          ${e.active?u`<span class="chip ok">${h.inUse}</span>`:m}
          <span class="chip" title=${o} aria-label=${o}
            >${h.starGlyph} ${e.entry.stars}</span
          >
          ${Zn(e.license)}
        </div>
        ${e.error?u`<p class="card-error" role="alert">${e.error}</p>`:m}
        <div class="actions">
          <button
            class="btn primary"
            type="button"
            aria-label="${h.openPreview} ${r}"
            aria-busy=${e.opening?"true":"false"}
            ?disabled=${e.busy}
            @click=${t}
          >
            ${h.preview}
          </button>
        </div>
      </div>
    </article>
  `}var ha=6,le=class{constructor(){this.slots=new Map}key(t,r){return`${U(t)}@${r}`}get(t,r){let n=this.key(t,r),o=this.slots.get(n);return o&&(this.slots.delete(n),this.slots.set(n,o)),o}set(t,r,n){let o=this.key(t,r);for(this.slots.delete(o),this.slots.set(o,n);this.slots.size>ha;){let s=this.slots.keys().next().value;if(s===void 0)break;this.slots.delete(s)}}};async function Xt(e,t,r,n,o){let s=r.get(n,o);if(s)return s;let i=await Z(e,t,n,!1,o),a={themes:i.themes,names:i.names,theme:o};return Object.prototype.hasOwnProperty.call(i.themes,o)&&r.set(n,o,a),a}async function Qn(e,t,r,n,o,s){let i=U(o),a=r.get(i)?.name??s,c=r.bundle(i);if(c&&(!a||Object.prototype.hasOwnProperty.call(c,a))){r.touch(i);let l=t.of(o.full_name,Object.keys(c));return{themes:c,names:l,theme:a??Object.keys(c)[0]}}if(!a){let l=await Z(e,t,o,!0);if(a=ae(l.themes)?.name,!l.summary){let p=ae(l.themes);return p&&r.set(i,p,l.themes),{themes:l.themes,names:l.names,theme:a}}}if(!a){let l=await Z(e,t,o);return{themes:l.themes,names:l.names,theme:Object.keys(l.themes)[0]}}let d=await Xt(e,t,n,o,a),f=ae(d.themes);return f&&!r.has(i)&&r.set(i,f),d}var B=class extends Error{},et=class{constructor(t=3,r=5e3,n=1,o=()=>r){this.limit=t;this.retryMs=r;this.retries=n;this.delayFor=o;this.running=0;this.waiting=[];this.pending=new Set;this.epoch=0}get active(){return this.running}add(t){return this.attempt(t,this.retries)}dispose(){this.epoch+=1;let t=this.waiting;this.waiting=[];for(let n of t)n.reject(new B);let r=[...this.pending];this.pending.clear();for(let n of r)clearTimeout(n.timer),n.reject(new B)}acquire(){return this.running<this.limit?(this.running+=1,Promise.resolve()):new Promise((t,r)=>this.waiting.push({resolve:t,reject:r}))}release(){let t=this.waiting.shift();t?t.resolve():this.running-=1}pause(t){return new Promise((r,n)=>{let o={timer:setTimeout(()=>{this.pending.delete(o),r()},t),reject:n};this.pending.add(o)})}async attempt(t,r){let n=this.epoch;if(await this.acquire(),n!==this.epoch)throw this.release(),new B;let o=this.retryMs;try{return await t()}catch(s){if(n!==this.epoch)throw new B;let i=r>0?this.delayFor(s,this.retries-r):null;if(i===null)throw s;o=i}finally{this.release()}return await this.pause(o),this.attempt(t,r-1)}};var eo=_`
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
    border: 1px solid var(--hl-line);
    background: var(--hl-surface);
    color: var(--hl-text);
    font: inherit;
  }
  .search:focus-visible {
    outline: 2px solid var(--hl-accent);
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
    outline: 2px solid var(--hl-accent);
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
`;var fa={dark:{"primary-background-color":"#111111","card-background-color":"#1c1c1c","primary-text-color":"#e1e1e1","secondary-text-color":"#9b9b9b","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#e1e1e11f","text-primary-color":"#ffffff","secondary-background-color":"#282828","disabled-text-color":"#6f6f6f"},light:{"primary-background-color":"#fafafa","card-background-color":"#ffffff","primary-text-color":"#141414","secondary-text-color":"#5e5e5e","primary-color":"#009ac7","accent-color":"#ff9800","divider-color":"#0000001f","text-primary-color":"#ffffff","secondary-background-color":"#e5e5e5","disabled-text-color":"#bdbdbd"}},ma={"paper-item-icon-color":"#44739e","light-primary-color":"#b3e5fc","dark-primary-color":"#0288d1"},ga=["primary-color","accent-color","primary-text-color","secondary-text-color","card-background-color","primary-background-color"];function ba(e){return[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)).join(", ")}function to(e){let t=fa[e],r={...t,...ma};for(let n of ga)r[`rgb-${n}`]=ba(t[n]);return r}var tt={dark:to("dark"),light:to("light")};function ro(e,t){if(e===t)return!0;if(!e||!t)return!1;let r=Object.keys(e);return r.length===Object.keys(t).length&&r.every(n=>e[n]===t[n])}var Yt=class extends T{constructor(){super(...arguments);this.vars=null;this.mode="dark";this.failed=!1;this.limited=!1}static{this.properties={vars:{attribute:!1,hasChanged:(r,n)=>!ro(r,n)},mode:{attribute:!1},failed:{type:Boolean},limited:{type:Boolean}}}static{this.styles=_`
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
  `}updated(r){if(!r.has("vars")&&!r.has("mode"))return;let n=this.painted;n&&n.mode===this.mode&&ro(n.vars,this.vars)||(this.painted={vars:this.vars,mode:this.mode},this.style.cssText="",this.vars&&($e(this,tt[this.mode]),$e(this,this.vars)))}render(){if(this.failed){let r=this.limited?h.thumbRateLimited:h.thumbUnavailable;return u`<div class="state unavailable"><span class="reason">${r}</span></div>`}return this.vars?u`
      <div class="stage" aria-hidden="true">
        <div class="box">
          <div class="sub">${h.thumbRoom}</div>
          <div class="big">${h.thumbTemp}</div>
          <div class="bar"><i></i></div>
          <div class="sub">${h.thumbHeating}</div>
        </div>
        <div class="box">
          <div class="sub">${h.thumbLights}</div>
          <div class="row"><span>${h.thumbLight}</span><i class="tog"></i></div>
          <div class="row"><span>${h.thumbDoor}</span><i class="tog"></i></div>
          <div class="row"><span>${h.thumbPorch}</span><i class="tog off"></i></div>
        </div>
        <div class="tile">
          <span class="g">${h.thumbGreeting}</span>
          <span class="t">${h.thumbSunset}</span>
        </div>
        <div class="chips">
          <span class="pill"><i></i>${h.thumbChipLight}</span>
          <span class="pill"><i></i>${h.thumbChipFan}</span>
          <span class="pill"><i></i>${h.thumbChipHeat}</span>
        </div>
        <div class="box wide">
          <div class="sub">${h.thumbEnergy}</div>
          <div class="spark">
            <i style="height: 35%"></i><i style="height: 55%"></i><i style="height: 80%"></i
            ><i style="height: 45%"></i><i style="height: 65%"></i><i style="height: 95%"></i
            ><i style="height: 50%"></i><i style="height: 70%"></i>
          </div>
        </div>
        <div class="box">
          <div class="sub">${h.thumbGarage}</div>
          <div class="big small">${h.thumbClosed}</div>
          <div class="sub">${h.thumbLocked}</div>
        </div>
      </div>
    `:u`<div class="state skeleton" aria-hidden="true"></div>`}};customElements.get("hats-lite-thumb")||customElements.define("hats-lite-thumb",Yt);var V=_`
  :host {
    --hl-bg: var(--primary-background-color, #0f1722);
    --hl-surface: var(--card-background-color, #172233);
    --hl-surface-raised: var(--secondary-background-color, #1d2b40);
    --hl-line: var(--divider-color, rgba(255, 255, 255, 0.12));
    --hl-text: var(--primary-text-color, #e8eef7);
    --hl-muted: var(--secondary-text-color, #9fb0c7);
    --hl-accent: var(--primary-color, #39a9e5);
    --hl-accent-ink: var(--text-primary-color, #06121f);
    --hl-ok: var(--success-color, #43a047);
    --hl-warn: var(--warning-color, #f5a524);
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
`,K=_`
  .seg {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: var(--hl-radius-pill);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
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
  }
  .seg button:focus-visible,
  .chip-btn:focus-visible,
  .btn:focus-visible {
    outline: 2px solid var(--hl-accent);
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
    color: var(--hl-ok);
    border-color: color-mix(in srgb, var(--hl-ok) 50%, transparent);
  }
  .chip.warn {
    color: var(--hl-warn);
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
    border: 1px solid var(--hl-line);
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
    border: 1px solid var(--hl-line);
    background: var(--hl-surface-raised);
    color: var(--hl-text);
  }
  .btn.primary {
    background: var(--hl-accent);
    border-color: var(--hl-accent);
    color: var(--hl-accent-ink);
  }
  .btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
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
`;var ya=6,Zt=class extends T{constructor(){super(...arguments);this.installedThemes=[];this.currentTheme="default";this.entries=[];this.query="";this.loading=!1;this.loaded=!1;this.error="";this.fromCache=!1;this.busyName="";this.cardError=null;this.filter="all";this.mode="dark";this.states=new Map;this.started=!1;this.modeTouched=!1;this.installedSet=new Set;this.entryIndex=new Map;this.cache=new Ze;this.bundles=new le;this.visible=new Set;this.known=new ie;this.queue=new et(3,zt,1,On);this.atlas=new Qe(()=>this.onAtlasChange());this.seen=new Set;this.inflight=new Set;this.permanent=new Set;this.limitedUntil=new Map;this.watched=new WeakMap;this.onIntersect=r=>{for(let n of r){let o=n.target.dataset.key??"";if(!n.isIntersecting){this.visible.delete(o);continue}this.visible.add(o),this.cache.touch(o);let s=this.entryIndex.get(o);s&&this.requestVars(s,!0)}};this.onSearch=r=>{this.query=r.target.value}}static{this.properties={installedThemes:{attribute:!1},currentTheme:{attribute:!1},darkMode:{attribute:!1},entries:{state:!0},query:{state:!0},loading:{state:!0},loaded:{state:!0},error:{state:!0},fromCache:{state:!0},busyName:{state:!0},cardError:{state:!0},filter:{state:!0},mode:{state:!0},states:{state:!0}}}static{this.styles=[V,K,eo]}get hass(){return this.hassRef}set hass(r){this.hassRef=r;let n=r?.themes,o=Object.keys(n?.themes??{});Ye(o,this.installedThemes)||(this.installedThemes=o);let s=r?.selectedTheme?.theme??n?.theme??"default";s!==this.currentTheme&&(this.currentTheme=s),n?.darkMode!==this.darkMode&&(this.darkMode=n?.darkMode),this.started||this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.atlas.resume(),this.hasUpdated&&queueMicrotask(()=>this.watchCards())}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0,this.watched=new WeakMap,this.visible.clear(),this.queue.dispose(),this.atlas.dispose()}willUpdate(r){r.has("installedThemes")&&(this.installedSet=new Set(this.installedThemes)),r.has("entries")&&(this.entryIndex=new Map(this.entries.map(n=>[U(n),n]))),r.has("darkMode")&&!this.modeTouched&&this.darkMode!==void 0&&(this.mode=this.darkMode?"dark":"light"),!this.started&&this.hassRef&&(this.started=!0,this.loadCatalog())}updated(){queueMicrotask(()=>this.watchCards())}async loadCatalog(){let r=this.hassRef;if(r){this.loading=!0;try{let n=await se(r,{type:Rn});this.entries=It(n?.themes),this.fromCache=!1,this.error="",an(this.entries)}catch{let n=sn();this.entries=n??[],this.fromCache=n!==null,this.error=h.loadError}finally{this.loading=!1,this.loaded=!0}}}setState(r,n){let o=new Map(this.states);n===null?o.delete(r):o.set(r,n),this.states=o}requestVars(r,n=!1){let o=U(r);if(!this.hassRef||this.inflight.has(o)||this.cache.has(o))return;let s=this.states.get(o);(s==="failed"||s==="limited")&&!(n&&!this.permanent.has(o))||s==="limited"&&(this.limitedUntil.get(o)??0)>Date.now()||(this.seen.add(o),this.atlas.state(r.full_name,this.mode,r.last_commit)==="none"&&(this.inflight.add(o),this.setState(o,"loading"),this.queue.add(()=>Z(this.hassRef,this.known,r,!0)).then(a=>{let c=ae(a.themes);if(!c)throw new Error(h.themeErrorDefault);let d=this.cache.set(o,c,a.summary?void 0:a.themes);this.refill(d),this.setState(o,null)}).catch(a=>{if(a instanceof B){this.setState(o,null);return}let c=Ke(a);c==="permanent"&&this.permanent.add(o),c==="limited"&&this.limitedUntil.set(o,Date.now()+Wt),this.setState(o,c==="limited"?"limited":"failed")}).finally(()=>this.inflight.delete(o))))}refill(r){if(!(this.visible.size>=qt))for(let n of r){let o=this.visible.has(n)?this.entryIndex.get(n):void 0;o&&this.requestVars(o)}}onAtlasChange(){this.requestUpdate();for(let r of this.seen){let n=this.entryIndex.get(r);n&&this.requestVars(n)}}watchCards(){let r=Array.from(this.renderRoot.querySelectorAll(".card[data-key]"));if(typeof IntersectionObserver>"u"){for(let n of r.slice(0,ya)){let o=this.entryIndex.get(n.dataset.key??"");o&&this.requestVars(o)}return}this.observer??=new IntersectionObserver(this.onIntersect,{rootMargin:"200px"});for(let n of r){let o=n.dataset.key??"";this.watched.get(n)!==o&&(this.watched.has(n)&&this.observer.unobserve(n),this.watched.set(n,o),this.observer.observe(n))}}async selectTheme(r){if(!(this.busyName||!this.hassRef)){this.busyName=r.full_name,this.cardError=null;try{let n=this.atlas.theme(r.full_name,r.last_commit)?.name,o=await Qn(this.hassRef,this.known,this.cache,this.bundles,r,n),s={entry:r,...o};this.dispatchEvent(new CustomEvent(Qr,{bubbles:!0,composed:!0,detail:s}))}catch(n){this.cardError={name:r.full_name,text:cn(n)}}finally{this.busyName=""}}}setMode(r){this.modeTouched=!0,this.mode=r}cardModel(r,n,o){let s=this.hassRef?.themes?.themes,i=U(r),a=this.cache.get(i),c=a?void 0:this.states.get(i),d=this.atlas.state(r.full_name,this.mode,r.last_commit)==="ok";return{entry:r,key:i,mode:this.mode,vars:a?Hn(a,this.mode):null,atlas:this.atlas,atlased:d,failed:c==="failed"||c==="limited",limited:c==="limited",installed:o,installedKind:Cn(r,n,this.installedSet,s,a),active:Mn(n,this.currentTheme),license:this.atlas.theme(r.full_name,r.last_commit)?.license,busy:this.busyName!=="",opening:this.busyName===r.full_name,error:this.cardError?.name===r.full_name?this.cardError.text:""}}visibleCards(r){let n=[];for(let o of this.entries){if(r&&!dn(o,r))continue;let s=this.cache.get(U(o)),i=this.atlas.theme(o.full_name,o.last_commit),a=this.known.of(o.full_name,[i?.name,s?.name]),c=Pn(o,a,this.installedSet);Vn(this.filter,o,s,i,c)&&n.push(Jn(this.cardModel(o,a,c),()=>this.selectTheme(o)))}return n}emptyText(r,n){return!this.loaded||this.loading||r>0?"":this.entries.length>0?n?h.noMatches:h.noFilterMatches:this.error?"":h.noThemes}render(){let r=this.query.trim().toLowerCase(),n=this.visibleCards(r),o=this.emptyText(n.length,r),s=[...this.states.values()].includes("loading");return u`
      <section>
        ${this.error?u`<p class="banner" role="alert">${this.error}</p>`:m}
        ${this.error&&!this.fromCache&&!this.loading?u`<button
              class="btn retry"
              type="button"
              @click=${()=>void this.loadCatalog()}
            >
              ${h.retry}
            </button>`:m}
        ${Kn({mode:this.mode,filter:this.filter,query:this.query,onMode:i=>this.setMode(i),onFilter:i=>{this.filter=i},onSearch:this.onSearch})}
        <div class="live" role="status" aria-live="polite">
          ${this.fromCache?u`<p class="note">${h.cachedNote}</p>`:m}
          ${this.loading?u`<p>${h.loading}</p>`:m}
          ${o?u`<p>${o}</p>`:m}
          ${s?u`<span class="sr-only">${h.previewsLoading}</span>`:m}
        </div>
        <div class="grid">${n}</div>
      </section>
    `}};customElements.get("hats-lite-browse")||customElements.define("hats-lite-browse",Zt);var Se=[];var va=0,no=200;function A(e){va+=1,Se.length>=100&&Se.shift(),Se[Se.length]=e.length>no?e.slice(0,no):e}var wa=new Set(["loadBackendTranslation","loadFragmentTranslation"]),xa=new Set(["call","send","set","fire","dispatch","post","put","patch","delete","remove","add","create","update","save","store","subscribe","unsubscribe","fetch","load","open","close","toggle","reload","restart","navigate","run","execute","invoke","emit","trigger","notify","turn","ws","api","login","logout","signout","upload","write","clear","reset","connect","disconnect","install","uninstall","enable","disable","start","stop","play","pause","push","publish","request","submit","register","revoke","refresh","resume","suspend","play","mute","press","click","dismiss","show","hide","edit","apply","change","select","activate","deactivate","cancel","confirm","reboot","shutdown","retry","sync","download","listen","attach","detach","mount","unmount","replace","insert","append","prepend","move","rename","copy","paste","kill","destroy","dispose","init","bootstrap","migrate","mutate"]),ka=/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;function Qt(e){if(wa.has(e))return"loader";if(typeof e!="string")return"blocked";let t=e.match(ka);if(t===null)return"blocked";for(let r of t)if(xa.has(r.toLowerCase()))return"blocked";return"read"}var Ea=/^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|config\/entity_registry\/list_for_display$|auth\/current_user$|render_template$|history\/stream$|logbook\/event_stream$|subscribe_entities$|subscribe_events$|energy\/get_prefs$|energy\/info$|weather\/subscribe_forecast$|todo\/item\/list$|recorder\/statistics_during_period$)/,$a=["/api/states","/api/config","/api/history","/api/logbook","/api/camera_proxy","/api/image_proxy","/api/media_player_proxy"],Jt="x-http-method-override";function ce(e){if(typeof e!="object"||e===null)return;let t={...e},r=t.type;if(typeof r=="string")return{type:r,msg:t}}function de(e){return e===void 0||!Ea.test(e.type)?!1:e.type==="subscribe_events"?e.msg.event_type==="state_changed":!0}function ue(e){return`ws:${e?e.type:"invalid"}`}var Ta=/\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i,Aa=/@|%2f/i,Sa=/^[A-Za-z][A-Za-z0-9+.-]*:/;function er(e,t=!1){return typeof e!="string"||e===""||Ta.test(e)||e.startsWith("//")||Aa.test(e.split(/[?#]/,1)[0])?!1:e.startsWith("/")?!0:t&&!Sa.test(e)}function _a(e){return`/api/${e.split(/[?#]/,1)[0].replace(/^\/+/,"").replace(/^api\//,"")}`}function tr(e){let t=_a(e);return $a.some(r=>t===r||t.startsWith(`${r}/`))}function oo(e){if(e==null)return!1;let t=e;return typeof Headers<"u"&&e instanceof Headers?e.has(Jt):Array.isArray(e)?e.some(r=>Array.isArray(r)&&String(r[0]).toLowerCase()===Jt):typeof t=="object"?Object.keys(e).some(r=>r.toLowerCase()===Jt):!1}function rr(e){return typeof e=="string"?e:"invalid"}function nr(e){return e==null||typeof e=="string"&&e.toUpperCase()==="GET"?"GET":null}function or(e){return typeof e=="string"?e.toUpperCase():"invalid"}var b=Reflect.apply,Pe=Reflect.has,pe=Reflect.ownKeys,he=Reflect.getOwnPropertyDescriptor,nt=Reflect.getPrototypeOf,so=Object.setPrototypeOf,ot=Object.freeze,Me=Array.isArray,io=Math.trunc,Pa=WeakMap.prototype.get,Ma=WeakMap.prototype.set,bu=WeakMap.prototype.has,Ca=WeakSet.prototype.has,Ra=WeakSet.prototype.add,Oa=Object.prototype.hasOwnProperty,Da=Object.prototype.propertyIsEnumerable,La=Function.prototype.bind,Ia=Object.getOwnPropertyDescriptor(Map.prototype,"size")?.get,Ha=Object.getOwnPropertyDescriptor(Set.prototype,"size")?.get,ao=Date.prototype.getTime,lo=Object.prototype.toString;function O(e,t){return b(Pa,e,[t])}function H(e,t,r){b(Ma,e,[t,r])}function _e(e,t){return b(Ca,e,[t])}function rt(e,t){b(Ra,e,[t])}function fe(e,t){return b(Oa,e,[t])}function co(e,t){return b(Da,e,[t])}function uo(e,t){return b(La,e,[t])}function sr(e,t){try{return b(e,t,[]),!0}catch{return!1}}function ir(e){try{return b(lo,e,[])}catch{return""}}function st(e){return ir(e)==="[object Map]"&&sr(Ia,e)}function it(e){return ir(e)==="[object Set]"&&sr(Ha,e)}function po(e){return ir(e)==="[object Date]"&&sr(ao,e)}function ho(e){return b(ao,e,[])}function fo(e){try{return b(lo,e,[])==="[object Promise]"}catch{return!1}}var mo=new WeakSet,go=new WeakSet;function bo(e){if(!(typeof e!="object"||e===null)){rt(mo,e);for(let t of pe(e)){let r=he(e,t);r&&typeof r.get=="function"&&rt(go,r.get)}}}for(let e of[Object,Function,Array,Map,Set,WeakMap,WeakSet,Date,Promise,RegExp,Error,String,Number,Boolean,Symbol,ArrayBuffer,DataView])bo(e.prototype);for(let e of["URL","URLSearchParams","Headers","Request","Response","Blob","EventTarget"]){let t=globalThis[e];typeof t=="function"&&bo(t.prototype)}function k(e,t,r){let n=e;for(;n!==null;){let o=he(n,t);if(o){if(fe(o,"value"))return o.value;let s=o.get;if(typeof s!="function")return;let i=_e(mo,n)&&!_e(go,s);return b(s,i?r:e,[])}n=nt(n)}}function yo(){return{disposed:!1,unsubs:new Set,epoch:0,connections:new WeakMap}}function vo(e){e.epoch+=1;for(let t of[...e.unsubs])try{t()}catch{continue}e.unsubs.clear()}var Na=new Set(["ready","disconnected"]);function wo(e,t){if(typeof e!="object"||e===null)return;let r=O(t.connections,e);if(r)return r;let n=e,o=t,s=()=>{},i=(l,...p)=>{let v=k(n,l,void 0);if(typeof v!="function")throw new TypeError(`Connection has no ${l}`);return b(v,n,p)},a=new Map;async function c(l,p){if(t.disposed)return s;let v=o.epoch,M=await p((...Ne)=>{!t.disposed&&typeof l=="function"&&b(l,void 0,Ne)});if(typeof M!="function")return s;if(t.disposed||o.epoch!==v)return M(),s;let C=()=>{o.unsubs.delete(C)&&M()};return o.unsubs.add(C),C}let d={get connected(){return k(n,"connected",void 0)},get haVersion(){return k(n,"haVersion",void 0)},socket:void 0,suspendReconnectUntil:s,async sendMessagePromise(l){let p=ce(l);if(de(p)&&!t.disposed)return i("sendMessagePromise",p.msg);A(ue(p))},sendMessage(l,p){let v=ce(l);if(de(v)&&!t.disposed)return i("sendMessage",v.msg,p);A(ue(v))},async subscribeMessage(l,p,v){let x=ce(p);return de(x)?c(l,M=>i("subscribeMessage",M,x.msg,v)):(A(ue(x)),s)},async subscribeEvents(l,p){return p!=="state_changed"?(A(`ws:subscribe_events:${typeof p=="string"?p:"invalid"}`),s):c(l,v=>i("subscribeEvents",v,"state_changed"))},addEventListener(l,p){if(typeof l!="string"||!Na.has(l)||typeof p!="function"){A(`event-listener:${typeof l=="string"?l:"invalid"}`);return}if(t.disposed)return;let v=a.get(l);if(v||(v=new Map,a.set(l,v)),v.has(p))return;let x=(Ne,...re)=>{t.disposed||b(p,d,[d,...re])},M=v,C=()=>{o.unsubs.delete(C)&&(M.delete(p),i("removeEventListener",l,x))};M.set(p,{forward:x,release:C}),i("addEventListener",l,x),o.unsubs.add(C)},removeEventListener(l,p){if(typeof l!="string")return;let v=a.get(l)?.get(p);v&&(a.get(l)?.delete(p),o.unsubs.delete(v.release),i("removeEventListener",l,v.forward))}},f=ot(d);return H(t.connections,e,f),f}var Re=Set.prototype,$o=Map.prototype,To=Re.has,Ce=Re.add,Fa=Re.delete,Ao=Re.values,ja=Object.getOwnPropertyDescriptor(Re,"size")?.get,Ua=Object.getOwnPropertyDescriptor($o,"size")?.get,Ba=$o.keys,So=Object.getPrototypeOf(new Set().values()).next,Va=Object.getPrototypeOf(new Map().keys()).next,cr=["union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"];function ar(e){return typeof e=="object"&&e!==null||typeof e=="function"}function lr(e,t,r){let n=[];for(;;){let o=b(t,e,[]);if(o.done)return n;n[n.length]=r(o.value)}}function Ka(e){return lr(b(Ao,e,[]),So,t=>t)}function xo(e,t){let r=new Set;for(let n=0;n<t.length;n+=1)b(Ce,r,[t[n]]);return{size:e,has:n=>b(To,r,[n]),open(){let n=0;return{step:()=>n<t.length?{done:!1,value:t[n++]}:{done:!0},close(){}}}}}function za(e){let t=+e;if(t!==t)throw new TypeError("Set-like size is invalid");let r=io(t);if(r<0)throw new RangeError("Set-like size is negative");return r}function Wa(e,t){if(!ar(e))throw new TypeError("Set-like expected");let r=t.ownerOf(e),n=r??e;if(typeof n=="object"&&it(n)){let a=lr(b(Ao,n,[]),So,t.unwrap);return xo(b(ja,n,[]),a)}if(typeof n=="object"&&st(n)){let a=lr(b(Ba,n,[]),Va,t.unwrap);return xo(b(Ua,n,[]),a)}let o=za(k(n,"size",e)),s=k(n,"has",e);if(typeof s!="function")throw new TypeError("Set-like has must be a function");let i=k(n,"keys",e);if(typeof i!="function")throw new TypeError("Set-like keys must be a function");return{size:o,has:a=>!!b(s,n,[r?a:t.view(a)]),open(){let a=b(i,n,[]);if(!ar(a))throw new TypeError("Set-like keys must return an object");let c=k(a,"next",a);if(typeof c!="function")throw new TypeError("Set-like iterator next must be a function");return{step(){let d=b(c,a,[]);if(!ar(d))throw new TypeError("Set-like iterator result must be an object");return k(d,"done",d)?{done:!0}:{done:!1,value:t.unwrap(k(d,"value",d))}},close(){let d=k(a,"return",a);typeof d=="function"&&b(d,a,[])}}}}}function Ga(e){let t=new Set;for(let r=0;r<e.length;r+=1)b(Ce,t,[e[r]]);return t}function at(e,t){let r=e.open();for(;;){let n=r.step();if(n.done)return;t(n.value)}}function ko(e,t){let r=e.open();for(;;){let n=r.step();if(n.done)return!1;if(t(n.value))return r.close(),!0}}function Eo(e,t){for(let r=0;r<e.length;r+=1)if(t(e[r]))return!0;return!1}function _o(e,t,r,n){let o=Wa(r,n),s=Ka(t),i=s.length<=o.size,a=l=>b(To,t,[l]),c=Ga(s),d=l=>{b(Ce,c,[l])},f=l=>{b(Fa,c,[l])};switch(e){case"union":return at(o,d),c;case"intersection":{let l=new Set;if(i)for(let p=0;p<s.length;p+=1)o.has(s[p])&&b(Ce,l,[s[p]]);else at(o,p=>{a(p)&&b(Ce,l,[p])});return l}case"difference":if(i)for(let l=0;l<s.length;l+=1)o.has(s[l])&&f(s[l]);else at(o,f);return c;case"symmetricDifference":return at(o,l=>a(l)?f(l):d(l)),c;case"isSubsetOf":return s.length<=o.size&&!Eo(s,l=>!o.has(l));case"isSupersetOf":return s.length>=o.size&&!ko(o,l=>!a(l));default:return i?!Eo(s,o.has):!ko(o,a)}}var dr=new WeakMap,Oo=new WeakSet,ur=new WeakMap,Po=new WeakMap,z=Map.prototype,J=Set.prototype,Do=new Map([["has",z.has],["get",z.get],["keys",z.keys],["values",z.values],["entries",z.entries],["forEach",z.forEach],[Symbol.iterator,z[Symbol.iterator]]]),Lo=new Map([["has",J.has],["keys",J.keys],["values",J.values],["entries",J.entries],["forEach",J.forEach],[Symbol.iterator,J[Symbol.iterator]]]),qa=Object.getOwnPropertyDescriptor(z,"size")?.get,Xa=Object.getOwnPropertyDescriptor(J,"size")?.get,Ya=Object.getPrototypeOf(new Map().entries()).next,Za=Object.getPrototypeOf(new Set().values()).next,Ja=Promise.prototype.then,Io=new Map,Ho=new WeakSet,No=new Map,Fo=new Map;function jo(e,t){for(let r of pe(e)){if(r==="constructor")continue;let n=he(e,r);n&&typeof n.value=="function"&&(Ho.add(n.value),t.set(r,n.value))}}jo(Object.prototype,Fo);jo(Array.prototype,No);function Mo(e,t){let r=he(e,t);return r&&fe(r,"value")?r.value:void 0}function Uo(e,t,r){if(r){let o=No.get(t);if(o!==void 0&&Mo(Array.prototype,t)===e)return o}let n=Fo.get(t);if(n!==void 0&&Mo(Object.prototype,t)===e)return n}for(let e of["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"])Io.set(e,Object.prototype[e]);var Co=ot(Object.create(null)),Qa=new Set(["toString","toJSON","toLocaleString","valueOf"]),el=new Set(["get","getAll","has","toISOString"]);function tl(e){if(typeof e!="object"||e===null)return!1;if(Me(e))return!0;let t=nt(e);return t===Object.prototype||t===null}function rl(){throw new TypeError("Read-only")}function Bo(e){let t=O(Po,e);if(t)return t;let r=function(){throw new TypeError("Read-only view: functions on this value cannot be called")};return so(r,null),H(Po,e,r),r}function ct(e){return typeof e!="object"||e===null?e:O(ur,e)??e}function nl(e,t){return(...r)=>{let n=[];for(let o=0;o<r.length;o+=1)n[o]=ct(r[o]);return $(b(e,t,n))}}function Vo(e,t,r,n){let o=k(e,t,n);if(typeof o!="function")return $(o);if(_e(Ho,o))return o;let s=Uo(o,t,Me(e));return s!==void 0?s:Qa.has(t)||!r&&el.has(t)?nl(o,e):Bo(o)}function*ol(e,t){for(;;){let r=b(t,e,[]);if(r.done)return;yield $(r.value)}}function sl(e,t,r){let n=he(e,t);if(n)return Me(r)&&t==="length"?{value:k(e,t,void 0),writable:!0,enumerable:!1,configurable:!1}:fe(n,"value")?{value:$(n.value),writable:!1,enumerable:n.enumerable,configurable:!0}:{get:()=>$(k(e,t,O(dr,e))),set:void 0,enumerable:n.enumerable,configurable:!0}}function pr(e){return{has:(t,r)=>Pe(e,r),ownKeys:()=>pe(e),getOwnPropertyDescriptor:(t,r)=>sl(e,r,t),getPrototypeOf:()=>nt(e),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1}}function il(e){return{...pr(e),get:(t,r,n)=>Vo(e,r,!0,n)}}function al(e){let t=fo(e),r=(n,o)=>b(Ja,e,[s=>typeof n=="function"?n($(s)):$(s),s=>{if(typeof o=="function")return o($(s));throw $(s)}]);return{...pr(e),getPrototypeOf:()=>Co,get(n,o,s){return o==="constructor"||o==="__proto__"?Co:t&&o==="then"?r:t&&o==="catch"?i=>r(void 0,i):t&&o==="finally"?i=>r(a=>(typeof i=="function"&&i(),a),a=>{throw typeof i=="function"&&i(),a}):Vo(e,o,!1,s)}}}var ll=new Set([...Do.keys()]),cl=new Set([...Lo.keys(),...cr]),dl=new Set(cr),ul=new Set(["keys","values","entries",Symbol.iterator]),pl={unwrap:ct,view:e=>$(e),ownerOf:e=>O(ur,e)};function Ro(e,t,r){let n=r?cl:ll,o=r?Lo:Do,s=r?Xa:qa,i=r?Za:Ya,a=new Proxy(t,{...pr(e),get(c,d){if(d==="constructor"||d===Symbol.species)return k(e,d,a);if(d==="size")return b(s,e,[]);if(n.has(d)){if(dl.has(d))return v=>{let x=_o(d,e,v,pl);return typeof x=="boolean"?x:$(x)};let p=o.get(d);return d==="get"?v=>$(b(p,e,[ct(v)])):d==="has"?v=>b(p,e,[ct(v)]):ul.has(d)?()=>ol(b(p,e,[]),i):(v,x)=>b(p,e,[(M,C)=>b(v,x,[$(M),$(C),a])])}let f=k(e,d,a);if(typeof f!="function")return $(f);let l=Io.get(d);return l!==void 0&&(l===f||Uo(f,d,!1)===l)?d==="valueOf"?()=>a:(...p)=>b(l,e,p):rl}});return a}function lt(e,t){return H(dr,e,t),rt(Oo,t),H(ur,t,e),t}function $(e){if(typeof e=="function")return Bo(e);if(typeof e!="object"||e===null||_e(Oo,e))return e;let t=O(dr,e);if(t)return t;if(po(e))return new Date(ho(e));if(st(e))return lt(e,Ro(e,new Map,!1));if(it(e))return lt(e,Ro(e,new Set,!0));if(!tl(e))return lt(e,new Proxy({},al(e)));let r=Me(e)?[]:{};return lt(e,new Proxy(r,il(e)))}var Wo=new WeakMap,Ko=new WeakMap,hl=Symbol("shared");function Go(e){let t=O(Wo,e);t&&(t.state.disposed=!0,vo(t.state))}function fl(e,t){let r=k(e,"connection",void 0),n=typeof r=="object"&&r!==null?r:e,o=O(Ko,n);o||(o=new Map,H(Ko,n,o));let s=o.get(t);if(s&&!s.disposed)return s;let i=yo();return o.set(t,i),i}var zo=new Map(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"].map(e=>[e,Object.prototype[e]])),ml="Preview closed: this read-only hass has been disposed";function qo(e,t=hl){let r=e,n=fl(r,t),o=()=>{if(n.disposed)throw new Error(ml)},s=new Proxy({},{has(i,a){return a!=="auth"&&Pe(r,a)},ownKeys(){return pe(r).filter(i=>i!=="auth")},getOwnPropertyDescriptor(i,a){if(!(a==="auth"||!Pe(r,a)))return{value:s[a],enumerable:!0,configurable:!0,writable:!1}},get(i,a){if(a==="auth")return;let c=k(r,a,s);if(a==="connection")return wo(c,n);if(zo.has(a)&&c===zo.get(a))return a==="hasOwnProperty"?f=>f!=="auth"&&fe(r,f):a==="valueOf"?()=>s:a==="toString"||a==="toLocaleString"?()=>"[object Object]":a==="isPrototypeOf"?()=>!1:f=>f!=="auth"&&co(r,f);if(typeof c!="function")return $(c);let d=c;switch(a){case"callService":return async(f,l)=>{A(`service:${String(f)}.${String(l)}`)};case"callWS":return async f=>{o();let l=ce(f);if(de(l))return b(d,r,[l.msg]);A(ue(l))};case"callApi":return async(f,l,...p)=>{if(o(),typeof f=="string"&&nr(f)){if(!er(l,!0)||!tr(l)){A(`api-path:${rr(l)}`);return}return b(d,r,[f,l,...p])}A(`api:${or(f)}`)};case"fetchWithAuth":return async(f,l)=>{if(o(),!er(f)||!tr(f)){A(`fetch-path:${rr(f)}`);return}if(l==null)return b(d,r,[f,l]);let p={...l};if(oo(p.headers)){A("fetch-header:method-override");return}let v=p.method;if(!nr(v)){A(`fetch:${or(v)}`);return}return b(d,r,[f,p])};default:return Qt(a)==="loader"?uo(d,r):Qt(a)==="read"?(...f)=>$(b(d,r,f)):async()=>{A(String(a))}}},set(){return!1},defineProperty(){return!1},deleteProperty(){return!1},setPrototypeOf(){return!1},preventExtensions(){return!1}});return H(Wo,s,{state:n}),s}function dt(e){return Number.isFinite(e)?Math.min(98,Math.max(2,e)):50}function Xo(e,t){return t.width>0?dt((e-t.left)/t.width*100):50}function Yo(e){return`inset(0 0 0 ${e}%)`}var gl="__default__",bl=6,yl=8,vl=160,Zo=["light","switch","climate","cover","media_player","sensor","binary_sensor"],wl=new Set(["person","zone","sun","update","event","conversation","tts","todo","weather"]);function hr(e){return e??gl}function xl(e){return w(e)&&e.code==="config_not_found"}function kl(e){let t=w(e)?e.message:e;return typeof t=="string"?Array.from(t).slice(0,vl).join(""):""}async function Jo(e,t){try{return{status:"ok",config:await kn(e,t)}}catch(r){return xl(r)?{status:"notfound"}:{status:"error",reason:kl(r)}}}async function Qo(e,t,r){let n=[];for(let o of e){let s=await t(o.url_path);if(r())return{entries:n,stale:!0};if(n.push(s),s.status==="ok"&&Oe(s.config))return{hit:{entry:s,urlPath:o.url_path},entries:n,stale:!1}}return{entries:n,stale:!1}}function Oe(e){return e?Bt(e).some(t=>Vt(t).length>0):!1}function es(e){let t=new Map;for(let i of Object.keys(e??{})){let a=i.indexOf(".");if(a<=0)continue;let c=i.slice(0,a),d=t.get(c)??[];d.push(i),t.set(c,d)}let r=[...t.keys()].filter(i=>!Zo.includes(i)&&!wl.has(i)).sort(),n=[...Zo.filter(i=>t.has(i)),...r];n.length===0&&(n=[...t.keys()].sort());let o=new Map(Object.entries(g.domainTitles)),s=n.slice(0,bl).map(i=>({type:"entities",title:o.get(i)??i,entities:(t.get(i)??[]).sort().slice(0,yl)}));if(s.length!==0)return{views:[{title:g.sampleView,cards:s}]}}function ts(e){return e.status==="notfound"?g.generatedDefault:e.reason?`${g.loadError} ${e.reason}`:g.loadError}function rs(e,t){let r=e?Bt(e):[];if(r.length===0)return{views:r,cards:[],notice:g.noViews};if(!Oe(e))return{views:r,cards:[],notice:g.noCards};let n=Vt(r[t]??r[0]);return Kt(n)>fn?{views:r,cards:[],notice:g.tooManyCards}:{views:r,cards:n,notice:n.length===0?g.emptyView:""}}function ns(e,t){return e.find(r=>r.url_path===t)?.title??g.defaultDashboard}var El="hats_lite_compare",$l="hats_lite_compare_designer";function os(e){return e?El:$l}function ss(e=!0){try{let t=window.localStorage.getItem(os(e));return t===null?e:t!=="0"}catch{return e}}function is(e,t=!0){try{window.localStorage.setItem(os(t),e?"1":"0")}catch{return}}var fr=e=>e??m;var Tl={desktop:"100%",tablet:"820px",phone:"390px"},Al={normal:"1",compact:"0.85"},Sl=["desktop","tablet","phone"],_l=["normal","compact"],Pl=["dark","light"];function ls(e,t,r){return{applicable:Ge(e),tryable:qe(e),trying:t,collision:e.nameCollision?g.nameCollision.replace("{name}",e.name):"",repo:wn(e.repoUrl),error:r}}function cs(e,t){return!e||Object.keys(Xe(e,t)).length>0?"":g.noModeBlock.replace("{mode}",g[t].toLowerCase())}function mr(e,t,r){return u`<button type="button" aria-pressed=${t?"true":"false"} @click=${r}>${e}</button>`}function Ml(e,t){return e.url_path===null&&t?`${e.title} ${g.generatedSuffix}`:e.title}function as(e){return u`<div class="appbar" aria-hidden="true"><i class="menu"></i><span class="title">${e}</span></div>`}function Cl(e,t){let r=n=>()=>{e.compare!==n&&t.onCompare()};return u`
    <div class="field view-switch">${g.compareLabel}
      <div class="seg" role="group" aria-label=${g.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${e.compare?"true":"false"}
          ?disabled=${!e.canCompare} @click=${r(!0)}>${g.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${e.compare?"false":"true"}
          ?disabled=${!e.canCompare} @click=${r(!1)}>${g.themeOnly}</button>
      </div>
    </div>`}function ds(e,t){return u`
    <div class="toolbar">
      <label class="field">${g.dashboard}
        <select class="pill" @change=${t.onDashboard}>
          ${e.dashboards.map((r,n)=>u`<option value=${String(n)} .selected=${r.url_path===e.dashboardUrl}>${Ml(r,e.generatedDefault)}</option>`)}
        </select>
      </label>
      ${e.showViews?u`<label class="field">${g.view}
            <select class="pill" @change=${t.onView}>
              ${e.views.map((r,n)=>u`<option value=${String(n)} .selected=${n===e.viewIndex}>${En(r,n)}</option>`)}
            </select>
          </label>`:m}
      <div class="seg" role="group" aria-label=${g.device}>
        ${Sl.map(r=>mr(g[r],e.frame===r,()=>t.onFrame(r)))}
      </div>
      <div class="seg" role="group" aria-label=${g.density}>
        ${_l.map(r=>mr(g[r],e.density===r,()=>t.onDensity(r)))}
      </div>
      <div class="seg" role="group" aria-label=${g.mode}>
        ${Pl.map(r=>mr(g[r],e.mode===r,()=>t.onMode(r)))}
      </div>
      ${Cl(e,t)}
    </div>`}function us(e,t){return u`
    <div class="frame" style=${F({"--hats-lite-frame-width":Tl[e.frame],"--hats-lite-density-scale":Al[e.density]})}>
      <div class=${e.comparing?"stage":"stage solo"}>
        <div class="pane current">${as(e.title)}<div class="cards" inert></div></div>
        <div class="pane candidate" style=${F(e.comparing?{clipPath:Yo(e.split)}:{})}>${as(e.title)}<div class="cards" inert></div></div>
        <div class="shield"></div>
        ${e.comparing?u`<div class="divider" role="slider" tabindex="0"
              aria-label=${g.divider}
              aria-valuemin="2" aria-valuemax="98"
              aria-valuenow=${String(Math.round(e.split))}
              aria-valuetext=${g.splitAt.replace("{percent}",String(Math.round(e.split)))}
              style=${F({left:`${e.split}%`})}
              @keydown=${t.onKey}
              @pointerdown=${t.onPointerDown}
              @pointermove=${t.onPointerMove}
              @pointerup=${t.onPointerUp}
              @pointercancel=${t.onPointerUp}></div>`:m}
        <div class="badges">
          ${e.comparing?u`<span class="badge">${g.current}</span>`:u`<span></span>`}
          <span class="badge">${e.candidateName}</span>
        </div>
      </div>
      ${e.note?u`<p class="empty-note" role="status">${e.note}</p>`:m}
    </div>
    <p class="footnote">${g.footnote}</p>`}function ps(e,t){return u`
    <div class="actions">
      <button type="button" class="btn primary apply" aria-describedby=${fr(e.collision?"collision-note":void 0)} ?disabled=${!e.applicable} @click=${t.onApply}>${e.applicable?g.apply:e.collision?g.nameTaken:g.installFirst}</button>
      <button type="button" class="btn try" aria-describedby=${fr(e.collision?"collision-note":void 0)} ?disabled=${!e.tryable||e.trying} @click=${t.onTry}>${g.tryButton}</button>
      ${!e.applicable&&e.repo?u`<a class="chip link" href=${e.repo} target="_blank" rel="noopener noreferrer">${g.repoLink}</a>`:m}
      ${e.collision?u`<p id="collision-note" class="chip warn collision" role="status">${e.collision}</p>`:m}
      ${e.error?u`<p class="error" role="alert">${e.error}</p>`:m}
    </div>`}var Rl=["hass-action","hass-more-info","show-dialog","hass-toggle-menu","location-changed","hass-dock-sidebar","hass-edit-sidebar","hass-set-theme","hass-service-called","hass-reload-themes","hass-open-link","popstate","iron-overlay-opened","ll-show-dashboard","hass-kiosk-mode","hass-language-select","hass-vibrate","hass-suspend-when-hidden","hass-enable-shortcuts","hass-time-zone-select","hass-date-format-select","hass-time-format-select","hass-first-weekday-select","hass-number-format-select","hass-refresh-current-user","hass-quick-bar-trigger","hass-show-notifications"],Ol=["context-request","ll-custom","hass-notification","settheme","navigate","ll-open-dialog","hass-quick-bar","show-edit-card","ll-rebuild","hass-logout","config-refresh","dialog-closed","haptic"],Dl=new Set(["value-changed","iron-resize","iron-select","iron-deselect","iron-activate","iron-items-changed","selected","selected-changed","expanded-changed","opened-changed","input","change","load","error","focus","blur","focusin","focusout","click","dblclick","auxclick","contextmenu","mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave","pointerdown","pointerup","pointermove","pointerover","pointerout","pointerenter","pointerleave","pointercancel","gotpointercapture","lostpointercapture","touchstart","touchmove","touchend","touchcancel","keydown","keyup","keypress","wheel","scroll","resize","select","submit","reset","toggle","slotchange","transitionend","animationend","dragstart","dragend","dragenter","dragover","dragleave","drop"]),Ll=new Set,Il=/^(hass-|ll-|show-)/;function bs(e){return Il.test(e)&&!Ll.has(e)}var Hl=200,De=EventTarget.prototype.dispatchEvent,ys=EventTarget.prototype.addEventListener,vs=EventTarget.prototype.removeEventListener,Nl=window.addEventListener,Fl=window.removeEventListener,jl=Event.prototype.composedPath,Ul=Object.getOwnPropertyDescriptor(Node.prototype,"parentNode")?.get,Bl=Object.getOwnPropertyDescriptor(Node.prototype,"nodeType")?.get,hs=typeof ShadowRoot>"u"?void 0:Object.getOwnPropertyDescriptor(ShadowRoot.prototype,"host")?.get,Vl=11,P=Reflect.apply,Le=new WeakSet,ws=new Set,pt=new WeakMap,ut=new Set,gr=new Map,xs=0,Ie=0,me=null;function ks(e){e.stopPropagation()}function ht(e,t,r){let n=pt.get(e);n||(n=new Map,pt.set(e,n)),!n.has(t)&&(n.set(t,r),P(ys,e,[t,ks,{capture:r}]))}function fs(e){try{if(P(Bl,e,[])===Vl&&hs)return P(hs,e,[])}catch{return e}return e}function Es(e){if(typeof e!="object"||e===null)return null;let t=fs(e);for(;t;){if(Le.has(t))return t;let r=null;try{r=P(Ul,t,[])}catch{return null}t=r===null?null:fs(r)}return null}function ms(e){if(Ie===0)return;let t=P(jl,e,[]),r=Es(t.length>0?t[0]:e.target);r&&ht(r,e.type,bs(e.type))}function Kl(e,t){if(!ut.has(t)){if(ut.size>=Hl)return!1;ut.add(t),gr.set(t,ms),P(Nl,window,[t,ms,{capture:!0}])}return ht(e,t,!1),!0}function gs(e,t,r){let n=r.type,o=s=>s.stopPropagation();P(ys,e,[n,o,{capture:!0}]);try{return P(De,t,[r])}finally{P(vs,e,[n,o,{capture:!0}])}}function zl(){me||(me=function(t){if(Ie===0||!t||typeof t.type!="string"||Dl.has(t.type))return P(De,this,[t]);let r=Es(this);return r?bs(t.type)?gs(r,this,t):Kl(r,t.type)?P(De,this,[t]):(xs+=1,gs(r,this,t)):P(De,this,[t])},Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:me}))}function Wl(){for(let[e,t]of gr)P(Fl,window,[e,t,{capture:!0}]);gr.clear(),ut.clear(),xs=0,me&&EventTarget.prototype.dispatchEvent===me&&(Object.defineProperty(EventTarget.prototype,"dispatchEvent",{configurable:!0,writable:!0,value:De}),me=null)}function $s(e){if(!Le.has(e)){Le.add(e),ws.add(e),Ie+=1;for(let t of Rl)ht(e,t,!0);for(let t of Ol)ht(e,t,!1);zl()}}function Ts(e){if(!Le.has(e))return;Le.delete(e),ws.delete(e);let t=pt.get(e);if(t){for(let[r,n]of t)P(vs,e,[r,ks,{capture:n}]);pt.delete(e)}Ie-=1,Ie===0&&Wl()}var ft=class{sync(t){let r=t?.querySelector(".stage"),n=r instanceof HTMLElement?r:void 0;n!==this.current&&(this.release(),n&&(this.current=n,$s(n)))}release(){this.current&&Ts(this.current),this.current=void 0}};var Ss={"state-active-color":"var(--amber-color, #ffc107)","state-light-active-color":"var(--state-active-color, #ffc107)","slider-color":"var(--primary-color)","paper-slider-active-color":"var(--primary-color)","mdc-theme-surface":"var(--card-background-color)","mdc-theme-on-surface":"var(--primary-text-color)","mdc-theme-primary":"var(--primary-color)","mdc-theme-secondary":"var(--accent-color)","input-fill-color":"color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))","mdc-select-fill-color":"var(--input-fill-color)","outline-color":"var(--divider-color)","switch-checked-color":"var(--primary-color)","switch-checked-button-color":"var(--switch-checked-color, var(--primary-color))","switch-checked-track-color":"var(--switch-checked-color, var(--primary-color))","state-icon-color":"var(--paper-item-icon-color, #44739e)"},Gl={"primary-color":"rgb-primary-color","accent-color":"rgb-accent-color","primary-text-color":"rgb-primary-text-color","secondary-text-color":"rgb-secondary-text-color","card-background-color":"rgb-card-background-color","primary-background-color":"rgb-primary-background-color"},ql=/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,Xl=/^(rgba?|hsla?)\(\s*([^)]*)\)$/i,Yl=/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)$/i;function _s(e){return Math.max(0,Math.min(255,Math.round(e)))}function Zl(e){let t=ql.exec(e);if(!t)return null;let r=t[1];return r.length<=4&&(r=[...r].map(n=>n+n).join("")),[0,2,4].map(n=>parseInt(r.slice(n,n+2),16))}function Jl(e){let t=e.endsWith("%"),r=Number(t?e.slice(0,-1):e);return Number.isFinite(r)?t?r/100*255:r:null}function Ql(e){let t=Number(e[0].replace(/deg$/i,"")),r=Number(e[1].replace(/%$/,""))/100,n=Number(e[2].replace(/%$/,""))/100;if(![t,r,n].every(Number.isFinite))return null;let o=a=>(a+t/30)%12,s=r*Math.min(n,1-n),i=a=>n-s*Math.max(-1,Math.min(o(a)-3,Math.min(9-o(a),1)));return[i(0),i(8),i(4)].map(a=>_s(a*255))}function ec(e,t){let r=t.split(/[\s,/]+/).filter(Boolean).slice(0,3);if(r.length<3)return null;if(e.startsWith("hsl"))return Ql(r);let n=r.map(Jl);return n.some(o=>o===null)?null:n.map(_s)}function As(e){let t=e.trim().replace(/\s*!important$/i,""),r=Zl(t);if(r)return r;let n=Xl.exec(t);return n?ec(n[1].toLowerCase(),n[2]):null}function tc(e,t){let r=Yl.exec(e.trim());if(!r)return As(e);let n=t[r[1]];return typeof n=="string"?As(n):null}function Ps(e){let t={};for(let[r,n]of Object.entries(Gl)){if(!(r in e)||n in e)continue;let o=tc(e[r],e);o&&(t[n]=o.join(", "))}return t}var Ms=new WeakMap;function Cs(e,t){let r=JSON.stringify(t);Ms.get(e)!==r&&(Ms.set(e,r),Sn(e),$e(e,t))}var rc=["lovelace-background","ha-card-border-radius","ha-card-box-shadow","ha-card-border-width","ha-card-border-color","ha-card-background","ha-card-backdrop-filter","primary-font-family","paper-font-body1_-_font-family","text-primary-color","rgb-primary-color","rgb-accent-color","rgb-primary-text-color","rgb-secondary-text-color","rgb-card-background-color","rgb-primary-background-color","light-primary-color","dark-primary-color","secondary-background-color","state-icon-color","paper-item-icon-color","disabled-text-color","divider-color","card-background-color","primary-background-color","primary-text-color","secondary-text-color","primary-color","accent-color","app-header-background-color","app-header-text-color","app-header-selection-bar-color","app-header-edit-background-color","app-header-edit-text-color","app-header-border-bottom","sidebar-background-color","sidebar-text-color","sidebar-icon-color","sidebar-selected-background-color","sidebar-selected-text-color","sidebar-selected-icon-color"];function Rs(e,t,r){let n={};for(let o of r)n[o]="initial";return{...n,...Ss,...tt[t],...Ps(e),...e}}function Os(e,t,r,n){let o=e.querySelector(".pane.current"),s=e.querySelector(".pane.candidate"),i=mn(t),a=i?D(i,n):{},c=r?Xe(r,n):a,d=new Set([...rc,...Ut(i),...Ut(r?.entry),...Object.keys(r?.vars??{}),...Object.keys(c)]);o instanceof HTMLElement&&Cs(o,Rs(a,n,d)),s instanceof HTMLElement&&Cs(s,Rs(c,n,d))}function Ds(e,t){e.querySelectorAll(".cards > *").forEach(r=>{r.hass=t})}var nc=_`
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
    border: 1px solid var(--hl-line);
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
    outline: 2px solid var(--hl-accent);
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
  .appbar {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 28px;
    margin: 8px 8px 0;
    padding: 0 10px;
    border-radius: 10px 10px 4px 4px;
    background: var(--app-header-background-color, var(--primary-color, #03a9f4));
    color: var(--app-header-text-color, var(--text-primary-color, #fff));
    font-size: 13px;
    font-weight: 600;
    overflow: hidden;
  }
  .appbar .menu {
    flex: none;
    width: 14px;
    height: 10px;
    background: linear-gradient(currentColor 0 2px, transparent 2px 4px, currentColor 4px 6px, transparent 6px 8px, currentColor 8px 10px);
  }
  .appbar .title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    box-shadow: 0 0 0 3px var(--hl-accent), 0 2px 8px rgba(0, 0, 0, 0.35);
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
`,Ls=[V,K,nc];var oc=2,sc=98,Is=2;function Hs(e,t){switch(e){case"ArrowLeft":case"ArrowDown":return dt(t-Is);case"ArrowRight":case"ArrowUp":return dt(t+Is);case"Home":return oc;case"End":return sc;default:return null}}function Ns(e){let t=e.currentTarget;typeof t.setPointerCapture=="function"&&t.setPointerCapture(e.pointerId)}function Fs(e){let t=e.currentTarget;typeof t.releasePointerCapture=="function"&&t.releasePointerCapture(e.pointerId)}async function js(e,t,r){let n=window.hatsLite;if(!n)return g.trialUnavailable;try{return await n.startTrial(bn(e),yn(t,r)),""}catch{return g.trialFailed}}function br(e,t,r){if(e)return e;if(!t)return;let n=r?.themes?.darkMode?"dark":"light";return t===n?void 0:t}var Us=[".pane.current .cards",".pane.candidate .cards"],yr=class extends T{constructor(){super(...arguments);this.showActions=!0;this.dashboards=[];this.dashboardUrl=null;this.views=[];this.viewIndex=0;this.cards=[];this.notice=g.loading;this.frame="desktop";this.density="normal";this.split=50;this.error="";this.trying=!1;this.defaultCompare=!0;this.defaultGenerated=!1;this.usingSample=!1;this.cache=new Map;this.dashboardsLoaded=!1;this.configToken=0;this.buildToken=0;this.dragging=!1;this.guard=new ft}static{this.properties={hass:{attribute:!1},candidate:{attribute:!1},mode:{attribute:!1},showActions:{type:Boolean,attribute:"show-actions"},defaultCompare:{attribute:!1},dashboards:{state:!0},dashboardUrl:{state:!0},views:{state:!0},viewIndex:{state:!0},cards:{state:!0},notice:{state:!0},frame:{state:!0},density:{state:!0},split:{state:!0},error:{state:!0},trying:{state:!0},compare:{state:!0},defaultGenerated:{state:!0},usingSample:{state:!0}}}static{this.styles=Ls}connectedCallback(){super.connectedCallback(),this.readOnlySource=void 0,this.hasUpdated&&this.attachHass(),this.guard.sync(this.renderRoot)}disconnectedCallback(){super.disconnectedCallback(),this.readOnly&&Go(this.readOnly),this.readOnly=void 0,this.guard.release()}willUpdate(r){r.has("mode")&&this.mode!==this.userMode&&(this.userMode=void 0)}updated(r){r.has("hass")&&this.hass&&!this.dashboardsLoaded&&this.loadDashboards(),this.attachHass(),this.applyVars(),r.has("cards")&&this.buildCards(),this.guard.sync(this.renderRoot)}comparing(){return this.compare??ss(this.defaultCompare)}effectiveMode(){return this.mode??(this.hass?.themes?.darkMode?"dark":"light")}async loadDashboards(){let r=this.hass;if(!r)return;this.dashboardsLoaded=!0;try{this.dashboards=await xn(r)}catch{this.dashboards=[{url_path:null,title:g.defaultDashboard}]}let n=++this.configToken;this.notice=g.loading;let o=await Qo(this.dashboards,i=>this.entryFor(i),()=>n!==this.configToken);if(o.stale)return;if(o.hit){this.dashboardUrl=o.hit.urlPath,this.applyEntry(o.hit.entry,o.hit.urlPath);return}this.dashboardUrl=null;let s=es(r.states);if(s&&!o.entries.every(i=>i.status==="error")){this.sample=s,this.useSample();return}o.entries[0]&&this.applyEntry(o.entries[0],null)}async entryFor(r){let n=hr(r),o=this.cache.get(n);if(o)return o;let s=this.hass,i=s?await Jo(s,r):{status:"error",reason:""};return i.status!=="error"&&this.cache.set(n,i),r===null&&i.status==="notfound"&&(this.defaultGenerated=!0),i}async showDashboard(r){let n=++this.configToken;this.cache.has(hr(r))||(this.notice=g.loading);let s=await this.entryFor(r);n===this.configToken&&this.applyEntry(s,r)}applyEntry(r,n){let o=r.status!=="ok"||!Oe(r.config);if(this.sample&&n===null&&o){this.useSample();return}this.usingSample=!1,this.viewIndex=0,this.config=r.status==="ok"?r.config:void 0,r.status==="ok"?this.selectView():this.setState({views:[],cards:[],notice:ts(r)})}useSample(){this.usingSample=!0,this.config=this.sample,this.viewIndex=0,this.selectView()}selectView(){this.setState(rs(this.config,this.viewIndex))}setState(r){this.views=r.views,this.cards=r.cards,this.notice=r.notice}async buildCards(){let r=++this.buildToken,n=await Tn(),o=await Promise.all(Us.map(()=>this.buildPane(n)));r===this.buildToken&&(Us.forEach((s,i)=>{let a=this.renderRoot.querySelector(s);a instanceof HTMLElement&&a.replaceChildren(...o[i])}),this.attachHass(!0))}buildPane(r){return Promise.all(this.cards.map(n=>An(r,n)))}attachHass(r=!1){let n=this.hass;n&&(n!==this.readOnlySource&&(this.readOnlySource=n,this.readOnly=qo(n,this),r=!0),r&&this.readOnly&&Ds(this.renderRoot,this.readOnly))}applyVars(){Os(this.renderRoot,this.hass,this.candidate,this.effectiveMode())}onDashboard(r){let n=Number(r.target.value);this.dashboardUrl=this.dashboards[n]?.url_path??null,this.showDashboard(this.dashboardUrl)}onView(r){this.viewIndex=Number(r.target.value),this.selectView()}onKey(r){let n=Hs(r.key,this.split);n!==null&&(r.preventDefault(),this.split=n)}onPointerDown(r){Ns(r),this.dragging=!0}onPointerMove(r){if(!this.dragging)return;let n=this.renderRoot.querySelector(".stage");n instanceof HTMLElement&&(this.split=Xo(r.clientX,n.getBoundingClientRect()))}onPointerUp(r){this.dragging=!1,Fs(r)}onApply(){let r=this.candidate;if(!r||!Ge(r))return;let n={theme:r.name},o=br(this.userMode,this.mode,this.hass);o&&(n.dark=o==="dark"),this.dispatchEvent(new CustomEvent("settheme",{detail:n,bubbles:!0,composed:!0}))}async onTry(){let r=this.candidate;!r||!qe(r)||this.trying||(this.error="",this.trying=!0,this.error=await js(this.hass,r,br(this.userMode,this.mode,this.hass)),this.trying=!1)}setMode(r){this.userMode=r,this.mode=r,this.dispatchEvent(new CustomEvent(tn,{detail:{mode:r},bubbles:!0,composed:!0}))}renderCandidateActions(){let r=this.candidate;return!this.showActions||!r?m:ps(ls(r,this.trying,this.error),{onApply:()=>this.onApply(),onTry:()=>void this.onTry()})}renderStageView(){let r=this.candidate,n=this.effectiveMode(),o=cs(r,n);return us({frame:this.frame,density:this.density,split:this.split,comparing:this.comparing()||!r,candidateName:r?r.name:g.noCandidate,note:o,title:ns(this.dashboards,this.dashboardUrl)},{onKey:s=>this.onKey(s),onPointerDown:s=>this.onPointerDown(s),onPointerMove:s=>this.onPointerMove(s),onPointerUp:s=>this.onPointerUp(s)})}render(){let r=this.views.length>0&&Oe(this.config);return u`
      ${ds({dashboards:this.dashboards,dashboardUrl:this.dashboardUrl,generatedDefault:this.defaultGenerated,views:this.views,viewIndex:this.viewIndex,showViews:r,frame:this.frame,density:this.density,mode:this.effectiveMode(),compare:this.comparing(),canCompare:!!this.candidate},{onDashboard:n=>this.onDashboard(n),onView:n=>this.onView(n),onFrame:n=>{this.frame=n},onDensity:n=>{this.density=n},onMode:n=>this.setMode(n),onCompare:()=>{this.candidate&&(this.compare=!this.comparing(),is(this.compare,this.defaultCompare))}})}
      ${this.usingSample?u`<p class="notice" role="status">${g.sampleNote}</p>`:m}
      ${this.notice?u`<p class="notice" role="status">${this.notice}</p>`:this.renderStageView()}
      ${this.renderCandidateActions()}
    `}};customElements.get("hats-lite-preview")||customElements.define("hats-lite-preview",yr);function Q(e){return[1,3,5].map(t=>parseInt(e.slice(t,t+2),16))}function vr(e){return Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")}function E(e){return`#${vr(e[0])}${vr(e[1])}${vr(e[2])}`}function R(e,t,r){return[0,1,2].map(n=>Math.round(e[n]*r+t[n]*(1-r)))}function gt(e,t,r){return[0,1,2].map(n=>e[n]*r+t[n]*(1-r))}function wr(e){let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4}function Bs(e){return .2126*wr(e[0])+.7152*wr(e[1])+.0722*wr(e[2])}function W(e,t){let[r,n]=[Bs(e),Bs(t)].sort((o,s)=>s-o);return(r+.05)/(n+.05)}var S=[255,255,255],ge=[0,0,0];function xr(e){return W(S,e)>=W(ge,e)?S:ge}function mt(e,t){return Math.min(...t.map(r=>W(e,r)))}function G(e,t,r){if(mt(e,t)>=r)return e;let n=mt(S,t)>=mt(ge,t)?S:ge;for(let o=1;o<=20;o+=1){let s=R(n,e,o/20);if(mt(s,t)>=r)return s}return n}function bt(e,t){return`rgba(${e[0]},${e[1]},${e[2]},${Number(t.toFixed(4))})`}var ic=[15,17,21],ac=[27,30,36],lc=[240,242,245],cc=[170,176,186],dc=[20,23,27],uc=[84,91,101],pc=7.2,Vs=7.1,hc=4.55,kr=3.05,fc=4.55;function mc(e){return Number.isFinite(e)?Math.min(60,Math.max(2,e)):2}function gc(e,t,r){let n=mc(t)/100;if(e==="light")return Math.min(1,.4+n);let o=n;for(;o>.02&&W(S,gt(S,r,o))<pc;)o=Math.max(.02,Number((o-.005).toFixed(4)));return o}var Ks=/^#[0-9a-fA-F]{6}$/,$r=2,Er=60;function zs(e,t){if(t==="light"||!Ks.test(e))return Er;let r=He(e,"dark",Er).alpha;return Math.min(Er,Math.max($r,Math.floor(r*100+1e-9)))}function Ws(e,t){let r=Math.min(100,Math.max(0,Number.isFinite(e)?e:0));return Math.round($r+r/100*(t-$r))}function Gs(e,t,r){return Ks.test(e)?Math.round(He(e,t,r).alpha*100):0}function He(e,t,r){let n=Q(e),o=t==="dark",s=o?R(n,ic,.09):R(n,S,.055),i=o?R(n,ac,.1):R(n,S,.1),a=o?R(n,R(S,s,.05),.05):R(n,S,.025),c=Number(gc(t,r,s).toFixed(4));return{background:s,secondary:i,card:a,glass:gt(S,s,c),alpha:c}}function qs(e,t,r,n=20){let o=Q(e),s=Q(t),i=r==="dark",{background:a,secondary:c,card:d,glass:f,alpha:l}=He(e,r,n),p=[a,c,d,f],v=G(R(o,i?lc:dc,.06),p,Vs),x=G(R(o,i?cc:uc,.1),p,hc),M=xr(o),C=G(s,p,kr),Ne=G(o,p,kr),re=i?R(o,[10,12,15],.07):R(o,S,.075),pi=gt(o,re,.18),Cr=G(o,[re,pi],fc);return{"primary-color":E(o),"accent-color":E(s),"primary-background-color":E(a),"secondary-background-color":E(c),"card-background-color":E(d),"ha-card-background":bt(S,l),"primary-text-color":E(v),"secondary-text-color":E(x),"divider-color":bt(i?S:ge,.12),"app-header-background-color":E(o),"app-header-text-color":E(M),"text-primary-color":E(M),"paper-tabs-selection-bar-color":E(G(s,[o],kr)),"switch-checked-color":E(C),"switch-checked-button-color":E(xr(C)),"paper-slider-active-color":E(Ne),"state-icon-color":E(C),"sidebar-background-color":E(re),"sidebar-text-color":E(G(v,[re],Vs)),"sidebar-selected-background-color":bt(o,.18),"sidebar-selected-text-color":E(Cr),"sidebar-selected-icon-color":E(Cr)}}var Tr=/^#[0-9a-fA-F]{6}$/,Ys=/^\/local\/hats_lite\/[0-9a-fA-F]{32}\.(png|jpg|webp|gif)$/,bc=/^https:\/\/[^\s'"`\\(){}<>;]+$/,yc=/\.\.|!important/i,vc=2e3;function Zs(e){return typeof e=="string"&&Ys.test(e)}function yt(e,t,r){return typeof e!="number"||!Number.isFinite(e)?t:Math.min(r,Math.max(t,e))}function Xs(e){if(typeof e!="string"||!Tr.test(e))throw new Error("Invalid color");return e}function wc(e,t){if(typeof e!="string"||yc.test(e))throw new Error("Invalid background");if(t==="url"&&e.length>vc)throw new Error("Background too long");if(!(t==="url"?bc.test(e):Ys.test(e)))throw new Error("Invalid background");return e}function vt(e){let t=Xs(e.main),r=Xs(e.accent),n=yt(e.radius,0,48),o=yt(e.blur,0,40),s=yt(e.tint,2,60),i={...qs(t,r,e.mode,s),"primary-color":t,"accent-color":r,"ha-card-border-radius":`${n}px`,"ha-card-backdrop-filter":`blur(${o}px)`},a=e.background;return a&&a.kind!=="none"&&(i["lovelace-background"]=`center / cover no-repeat fixed url('${wc(a.value,a.kind)}')`),i}var xc=3;function Js(e){if(!Tr.test(e.main)||!Tr.test(e.accent))return[];let t=Q(e.main),r=Q(e.accent),{glass:n}=He(e.main,e.mode,yt(e.tint,2,60));return[{id:"main-card",ratio:W(t,n)},{id:"accent-card",ratio:W(r,n)}].filter(s=>s.ratio<xc).map(s=>({id:s.id,ratio:Number(s.ratio.toFixed(2))}))}function Ar(e){return u`
    <label class="range">
      <span class="range-head">
        <span>${e.label}</span>
        <span class="range-value" data-readout=${e.field}>${e.readout}</span>
      </span>
      <input type="range" min=${e.min} max=${e.max} step="1" data-field=${e.field}
        .value=${String(e.value)}
        @input=${e.onInput} />
    </label>
  `}function Qs(e,t,r,n){return u`
    <label class="color-row">
      <input type="color" data-field=${e} .value=${r} @input=${n} />
      <span class="color-text">
        <span>${t}</span>
        <span class="hex" data-readout=${e}>${r}</span>
      </span>
    </label>
  `}var ei=[V,K,_`
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
    outline: 2px solid var(--hl-accent);
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
`];var y={colors:"Colors",glance:"At a glance",onDashboard:"On your dashboard",shape:"Shape and glass",draftName:"Designer draft",mainColor:"Main color",accentColor:"Accent color",radius:"Corner radius",blur:"Glass blur",tint:"Card tint",mode:"Mode",modeDark:"Dark",modeLight:"Light",background:"Background",backgroundNone:"None",uploadLabel:"Upload a background image",uploadHint:"PNG, JPEG, WebP or GIF, up to 8 MiB",uploading:"Uploading...",uploadAdminOnly:"Only administrators can upload backgrounds.",uploadTooLarge:"Pick an image up to 8 MiB.",uploadType:"Pick a PNG, JPEG, WebP or GIF image.",uploadFailed:"Upload failed. The previous background is kept.",invalidColor:"Pick a valid color",invalidBackground:"This background is not allowed",backgroundTooLong:"This background address is too long (2000 characters at most).",restartReminder:"This theme uses an uploaded background. Backgrounds need a Home Assistant restart before they are served.",invalidInput:"Some values are not valid",saveTitle:"Save as theme",saveAdminOnly:"Only administrators can save themes.",nameLabel:"Theme name",nameInvalid:"Use 1 to 60 letters, digits, spaces, hyphens or underscores, starting with a letter or digit",saveButton:"Save as theme",saving:"Saving...",saved:"Theme saved",saveFailed:"Could not save the theme.",nameReserved:"This name is reserved. Pick another name.",nameExists:"A theme with this name already exists. Pick another name.",formatInvalid:"The theme could not be written in a valid format.",overwrote:"Saved. An existing theme with this name was replaced.",needsRestart:"Background uploaded. Backgrounds need a Home Assistant restart before they are served.",warnMainCard:"The main color is hard to see on cards (contrast {ratio}:1, 3:1 recommended).",warnAccentCard:"The accent color is hard to see on cards (contrast {ratio}:1, 3:1 recommended)."};function Sr(e,t){if(e&&typeof e=="object"&&"message"in e){let r=e.message;if(typeof r=="string"&&r.length>0)return r}return t}function ti(e){return e.size>8388608?y.uploadTooLarge:rn.includes(e.type)?null:y.uploadType}function Ec(e,t){let r={method:"POST",body:t};if(typeof e.fetchWithAuth=="function")return e.fetchWithAuth(Lt,r);let n=e.auth?.data?.access_token??"";return fetch(Lt,{...r,headers:{Authorization:`Bearer ${n}`}})}async function ri(e,t){let r=new FormData;r.append("file",t);let n,o;try{n=await Ec(e,r),o=await n.json().catch(()=>({}))}catch{return{error:y.uploadFailed}}if(!n.ok)return{error:Sr(o,y.uploadFailed)};let{url:s,needs_restart:i}=o;return Zs(s)?{url:s,needsRestart:i===!0}:{error:y.uploadFailed}}var $c=/^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/,Tc={"main-card":y.warnMainCard,"accent-card":y.warnAccentCard};function ni(e){return e.toLowerCase()==="default"?y.nameReserved:$c.test(e)?null:y.nameInvalid}function oi(e){let t=e&&typeof e=="object"?e.code:void 0;return t==="name_exists"?y.nameExists:t==="reserved_name"?y.nameReserved:t==="invalid_format"?y.formatInvalid:Sr(e,y.saveFailed)}function si(e){return e&&typeof e=="object"&&e.overwrote===!0?y.overwrote:y.saved}function ii(e){return Js(e).map(t=>Tc[t.id].replace("{ratio}",t.ratio.toFixed(1)))}function _r(e){let t=e instanceof Error?e.message:"";return t==="Invalid color"?{field:"color",message:y.invalidColor}:t==="Invalid background"?{field:"background",message:y.invalidBackground}:t==="Background too long"?{field:"background",message:y.backgroundTooLong}:{field:"color",message:y.invalidInput}}function ai(e,t){return t.kind==="upload"?`${e} ${y.restartReminder}`:e}var Ac=[],Sc=["main","accent","radius","glassBlur","tint","mode","background"],li={radius:{label:y.radius,min:0,max:48,unit:"px"},glassBlur:{label:y.blur,min:0,max:40,unit:"px"}},Pr=class extends T{constructor(){super(...arguments);this.dragOver=!1;this.main="#03a9f4";this.accent="#ff9800";this.radius=12;this.glassBlur=10;this.tint=30;this.mode="dark";this.background={kind:"none"};this.errorField="";this.errorMessage="";this.themeName="";this.uploading=!1;this.uploadError="";this.uploadNotice="";this.saving=!1;this.saveMessage="";this.saveFailed=!1}static{this.properties={hass:{attribute:!1},main:{state:!0},accent:{state:!0},radius:{state:!0},glassBlur:{state:!0},tint:{state:!0},mode:{state:!0},background:{state:!0},candidate:{state:!0},errorField:{state:!0},errorMessage:{state:!0},themeName:{state:!0},uploading:{state:!0},uploadError:{state:!0},uploadNotice:{state:!0},saving:{state:!0},saveMessage:{state:!0},saveFailed:{state:!0},dragOver:{state:!0}}}static{this.styles=ei}willUpdate(r){(!this.candidate||Sc.some(n=>r.has(n)))&&this.rebuild()}render(){let r=this.hass?.user?.is_admin===!0;return u`
      <div class="layout">
        <div class="controls">
          <section class="group">
            <h3>${y.colors}</h3>
            ${this.renderColor("main",y.mainColor)}
            ${this.renderColor("accent",y.accentColor)}
            ${this.errorField==="color"?u`<p class="error" role="alert">${this.errorMessage}</p>`:m}
            ${this.warnings().map(n=>u`<p class="hint" data-warning>${n}</p>`)}
          </section>
          <section class="group">
            <h3>${y.shape}</h3>
            ${Object.keys(li).map(n=>this.renderSlider(n))}
            ${this.renderTint()}
          </section>
          <section class="group">
            <h3>${y.background}</h3>
            <div class="choices">
              <button type="button" class="chip-btn" data-action="background-none"
                aria-pressed=${String(this.background.kind==="none")}
                @click=${()=>this.setBackground({kind:"none"})}>${y.backgroundNone}</button>
              ${Ac.map(n=>u`<button type="button" class="chip-btn"
                  aria-pressed=${String(this.background.kind==="preset"&&this.background.value===n.value)}
                  @click=${()=>this.setBackground({kind:"preset",value:n.value})}>${n.label}</button>`)}
            </div>
            ${this.errorField==="background"?u`<p class="error" role="alert">${this.errorMessage}</p>`:m}
            ${r?this.renderUpload():u`<p class="hint">${y.uploadAdminOnly}</p>`}
          </section>
          <section class="group">
            <h3>${y.mode}</h3>
            <div class="seg" role="group" aria-label=${y.mode}>
              ${["dark","light"].map(n=>u`<button type="button" data-field="mode" data-mode=${n}
                  aria-pressed=${String(this.mode===n)}
                  @click=${()=>this.setMode(n)}>${n==="dark"?y.modeDark:y.modeLight}</button>`)}
            </div>
          </section>
          ${r?this.renderSave():u`<p class="hint">${y.saveAdminOnly}</p>`}
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
            .defaultCompare=${!1}
            @hats-lite-mode-change=${n=>this.onPreviewMode(n)}
          ></hats-lite-preview>
        </div>
      </div>
    `}renderColor(r,n){return Qs(r,n,this[r],o=>this.setText(r,o))}renderSlider(r){let n=li[r];return Ar({label:n.label,readout:`${this[r]}${n.unit}`,field:r,min:n.min,max:n.max,value:this[r],onInput:o=>this.setNumber(r,o)})}renderTint(){let r=Gs(this.main,this.mode,this.tintValue(this.mode));return Ar({label:y.tint,readout:`${r}%`,field:"tint",min:0,max:100,value:this.tint,onInput:n=>this.setTint(n)})}tintValue(r){return Ws(this.tint,zs(this.main,r))}setTint(r){this.tint=Number(r.target.value)}renderUpload(){return u`
      <button type="button" class=${this.dragOver?"drop over":"drop"} data-action="upload"
        ?disabled=${this.uploading}
        @click=${()=>this.fileInput()?.click()}
        @dragover=${r=>this.onDragOver(r)}
        @dragleave=${()=>{this.dragOver=!1}}
        @drop=${r=>this.onDrop(r)}>
        <span class="drop-title">${this.uploading?y.uploading:y.uploadLabel}</span>
        <span class="drop-hint">${y.uploadHint}</span>
      </button>
      <input class="visually-hidden" type="file" tabindex="-1" aria-hidden="true"
        accept="image/png,image/jpeg,image/webp,image/gif"
        ?disabled=${this.uploading}
        @change=${r=>this.onFile(r)} />
      ${this.uploadError?u`<p class="error" role="alert">${this.uploadError}</p>`:m}
      ${this.uploadNotice?u`<p class="hint" role="status" data-notice="restart">${this.uploadNotice}</p>`:m}
    `}renderSave(){let r=this.saveFailed;return u`
      <div class="bar">
        <label>
          <span class="visually-hidden">${y.nameLabel}</span>
          <input type="text" maxlength="60" data-field="name" placeholder=${y.nameLabel}
            .value=${this.themeName}
            @input=${n=>this.setName(n)} />
        </label>
        <button type="button" class="btn primary" data-action="save" ?disabled=${this.saving}
          @click=${()=>this.onSave()}>
          ${this.saving?y.saving:y.saveButton}
        </button>
        ${this.saveMessage?u`<span class=${r?"chip warn message":"chip ok message"}
              role=${r?"alert":"status"}>${this.saveMessage}</span>`:m}
      </div>
    `}designerInput(r){return{main:this.main,accent:this.accent,radius:this.radius,blur:this.glassBlur,tint:this.tintValue(r),background:this.background,mode:r}}warnings(){return ii(this.designerInput(this.mode))}rebuild(){try{let r=vt(this.designerInput(this.mode));this.candidate={name:y.draftName,vars:r,installed:!1,canApply:!1},this.errorField="",this.errorMessage=""}catch(r){let n=_r(r);this.errorField=n.field,this.errorMessage=n.message}}buildModes(){try{return{dark:vt(this.designerInput("dark")),light:vt(this.designerInput("light"))}}catch(r){this.saveFailed=!0,this.saveMessage=_r(r).message;return}}setText(r,n){this[r]=n.target.value}setNumber(r,n){this[r]=Number(n.target.value)}onPreviewMode(r){let n=r.detail?.mode;(n==="dark"||n==="light")&&(this.mode=n)}setMode(r){this.mode=r}fileInput(){return this.renderRoot.querySelector('input[type="file"]')}onDragOver(r){r.preventDefault(),this.dragOver=!0}onDrop(r){r.preventDefault(),this.dragOver=!1;let n=r.dataTransfer?.files?.[0];n&&this.handleFile(n,null)}setBackground(r){this.background=r,this.uploadNotice=""}setName(r){this.themeName=r.target.value}async onFile(r){let n=r.target,o=n.files?.[0];o&&await this.handleFile(o,n)}async handleFile(r,n){let o=this.hass;if(!o||this.uploading)return;let s=ti(r);if(s){this.uploadError=s,n&&(n.value="");return}this.uploading=!0,this.uploadError="",this.uploadNotice="";try{let i=await ri(o,r);"error"in i?this.uploadError=i.error:(this.background={kind:"upload",value:i.url},i.needsRestart&&(this.uploadNotice=y.needsRestart))}finally{this.uploading=!1,n&&(n.value="")}}async onSave(){let r=this.hass;if(!r)return;let n=this.themeName.trim(),o=ni(n);if(o){this.saveFailed=!0,this.saveMessage=o;return}let s=this.buildModes();if(s){this.saving=!0,this.saveMessage="";try{let i=await se(r,{type:"hats_lite/save_theme",name:n,variables:s.dark,modes:s});this.dispatchEvent(new CustomEvent(en,{bubbles:!0,composed:!0,detail:{name:n}})),this.saveFailed=!1,this.saveMessage=ai(si(i),this.background)}catch(i){this.saveFailed=!0,this.saveMessage=oi(i)}finally{this.saving=!1}}}};customElements.get("hats-lite-designer")||customElements.define("hats-lite-designer",Pr);function wt(e,t){if(!e||typeof e!="object")return"";let r=e[t];return typeof r=="string"?r:""}function ci(e,t,r){if(!e||typeof e!="object")return"";let n=e,o=n.modes,s=r?["dark","light"]:["light","dark"];return wt(o?.[s[0]],t)||wt(n,t)||wt(n.vars,t)||wt(o?.[s[1]],t)}function di(e){let t=e?.selectedTheme?.theme??e?.themes?.theme??"default",r=e?.themes?.themes,o=r&&Object.prototype.hasOwnProperty.call(r,t)?r[t]:void 0,s=e?.themes?.darkMode!==!1;return{name:t,primary:ci(o,"primary-color",s),accent:ci(o,"accent-color",s)}}var ui=[V,K,_`
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
  }
  .menu:focus-visible,
  .tabs button:focus-visible,
  .file-theme select:focus-visible {
    outline: 2px solid var(--hl-accent);
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
`];var ee={shell:{title:"Themes",tabs:{browse:"Gallery",preview:"Preview",designer:"Designer"},tabList:"HATS Lite sections",inUse:"In use",menu:"Open navigation menu",fileTheme:"Theme in file"},browse:h,preview:g,designer:y};var te=["browse","preview","designer"],_c=u`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`,Mr=class extends T{constructor(){super(...arguments);this.narrow=!1;this.tab="browse";this.entry=null;this.fileThemes={};this.fileNames=[];this.chosenName="";this.candidate=null;this.installedNames=[];this.bundles=new le;this.known=new ie;this.pickToken=0;this.rendered=new Set(["browse"]);this.onTabKey=r=>{let n=te.indexOf(this.tab),o;switch(r.key){case"ArrowRight":o=(n+1)%te.length;break;case"ArrowLeft":o=(n-1+te.length)%te.length;break;case"Home":o=0;break;case"End":o=te.length-1;break;default:return}r.preventDefault();let s=te[o];this.select(s),this.focusTab(s)};this.onMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};this.onThemeSelected=r=>{let n=r.detail,o=Object.keys(n?.themes??{});if(o.length===0)return;let s=this.renderRoot.querySelector("hats-lite-browse");this.previewMode=n.mode??s?.mode;let i=n.theme&&o.includes(n.theme)?n.theme:o[0];this.pickToken+=1,this.entry=n.entry,this.fileThemes=n.themes,this.fileNames=[...new Set([...n.names??[],...o])],this.bundles.set(n.entry,i,{themes:n.themes,names:this.fileNames,theme:i}),this.setCandidate(i),this.select("preview"),this.focusTab("preview")};this.onPreviewMode=r=>{let n=r.detail?.mode;n&&(this.previewMode=n)};this.onFileThemeChange=r=>{let n=r.target.value;if(Object.prototype.hasOwnProperty.call(this.fileThemes,n)){this.pickToken+=1,this.setCandidate(n);return}this.fetchFileTheme(n)};this.onThemeSaved=r=>{let n=r.detail;if(typeof n?.name!="string")return;let o=this.hass?.themes?.darkMode;this.dispatchEvent(new CustomEvent("settheme",{bubbles:!0,composed:!0,detail:o===void 0?{theme:n.name}:{theme:n.name,dark:o}})),this.select("preview")}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0},entry:{state:!0},fileThemes:{state:!0},fileNames:{state:!0},chosenName:{state:!0},candidate:{state:!0},previewMode:{state:!0}}}static{this.styles=ui}tabId(r){return`tab-${r}`}panelId(r){return`panel-${r}`}select(r){this.rendered.add(r),this.tab=r}async focusTab(r){await this.updateComplete,this.renderRoot.querySelector(`#${this.tabId(r)}`)?.focus()}willUpdate(r){if(!r.has("hass"))return;let n=Object.keys(this.hass?.themes?.themes??{});Ye(n,this.installedNames)||(this.installedNames=n),this.candidate&&this.refreshCandidate()}buildCandidate(r){let n=this.entry;if(!n||!Object.prototype.hasOwnProperty.call(this.fileThemes,r))return null;let o=j(this.fileThemes[r]),s=this.hass?.themes?.darkMode?"dark":"light",i=this.installedNames.includes(r),a=this.hass?.themes?.themes,c=a&&Object.prototype.hasOwnProperty.call(a,r)?a[r]:void 0,d=i&&!n.installed&&gn(c,o);return{name:r,vars:D(o,s),entry:o,installed:i,nameCollision:d,repoUrl:vn(n.full_name),canApply:i&&!d}}refreshCandidate(){let r=this.candidate,n=this.buildCandidate(this.chosenName);if(!r||!n)return;r.installed===n.installed&&r.nameCollision===n.nameCollision&&r.canApply===n.canApply&&JSON.stringify(r.vars)===JSON.stringify(n.vars)||(this.candidate=n)}setCandidate(r){let n=this.buildCandidate(r);n&&(this.chosenName=r,this.candidate=n)}async fetchFileTheme(r){let n=this.entry;if(!n)return;let o=++this.pickToken;try{let s=await Xt(this.hass,this.known,this.bundles,n,r);if(o!==this.pickToken||n!==this.entry)return;this.fileThemes=s.themes,this.setCandidate(r)}catch{o===this.pickToken&&this.requestUpdate()}}renderTabs(){return u`
      <nav class="tabs seg" role="tablist" aria-label=${ee.shell.tabList} @keydown=${this.onTabKey}>
        ${te.map(r=>{let n=this.tab===r;return u`
            <button
              type="button"
              role="tab"
              id=${this.tabId(r)}
              aria-controls=${this.panelId(r)}
              aria-selected=${n?"true":"false"}
              tabindex=${n?"0":"-1"}
              @click=${()=>this.select(r)}
            >
              ${ee.shell.tabs[r]}
            </button>
          `})}
      </nav>
    `}renderInUse(){let r=di(this.hass),n=o=>o?u`<i style=${F({background:o})}></i>`:u`<i class="neutral"></i>`;return u`
      <span class="chip in-use">
        <span class="label">${ee.shell.inUse}</span>
        <span class="name">${r.name}</span>
        <span class="swatches" aria-hidden="true">${n(r.primary)}${n(r.accent)}</span>
      </span>
    `}renderFileThemes(){let r=this.fileNames;return r.length<2?m:u`
      <label class="file-theme">
        ${ee.shell.fileTheme}
        <select @change=${this.onFileThemeChange}>
          ${r.map(n=>u`<option value=${n} ?selected=${n===this.chosenName}>${n}</option>`)}
        </select>
      </label>
    `}render(){return u`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${this.narrow?u`<button class="menu" type="button" aria-label=${ee.shell.menu} @click=${this.onMenu}>${_c}</button>`:m}
          <h1 class="title">${ee.shell.title}</h1>
        </div>
        ${this.renderInUse()}
      </header>
      ${this.renderTabs()}
      <main
        class="content"
        @hats-lite-theme-selected=${this.onThemeSelected}
        @hats-lite-theme-saved=${this.onThemeSaved}
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
          ${this.rendered.has("preview")?u`${this.renderFileThemes()}
              <hats-lite-preview
                .hass=${this.hass}
                .candidate=${this.candidate}
                .mode=${this.previewMode}
                @hats-lite-mode-change=${this.onPreviewMode}
              ></hats-lite-preview>`:m}
        </section>
        <section
          class="panel"
          id=${this.panelId("designer")}
          role="tabpanel"
          aria-labelledby=${this.tabId("designer")}
          tabindex="-1"
          ?hidden=${this.tab!=="designer"}
        >
          ${this.rendered.has("designer")?u`<hats-lite-designer .hass=${this.hass}></hats-lite-designer>`:m}
        </section>
      </main>
      </div>
    `}};customElements.get("hats-lite-panel")||customElements.define("hats-lite-panel",Mr);export{Mr as HatsLitePanel};

var se=globalThis,ie=se.ShadowRoot&&(se.ShadyCSS===void 0||se.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ke=Symbol(),pt=new WeakMap,q=class{constructor(t,r,n){if(this._$cssResult$=!0,n!==ke)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=r}get styleSheet(){let t=this.o,r=this.t;if(ie&&t===void 0){let n=r!==void 0&&r.length===1;n&&(t=pt.get(r)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&pt.set(r,t))}return t}toString(){return this.cssText}},ut=e=>new q(typeof e=="string"?e:e+"",void 0,ke),$=(e,...t)=>{let r=e.length===1?e[0]:t.reduce((n,s,i)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1],e[0]);return new q(r,e,ke)},ht=(e,t)=>{if(ie)e.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(let r of t){let n=document.createElement("style"),s=se.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=r.cssText,e.appendChild(n)}},Ee=ie?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let r="";for(let n of t.cssRules)r+=n.cssText;return ut(r)})(e):e;var{is:fn,defineProperty:gn,getOwnPropertyDescriptor:bn,getOwnPropertyNames:vn,getOwnPropertySymbols:yn,getPrototypeOf:wn}=Object,oe=globalThis,mt=oe.trustedTypes,xn=mt?mt.emptyScript:"",$n=oe.reactiveElementPolyfillSupport,G=(e,t)=>e,Te={toAttribute(e,t){switch(t){case Boolean:e=e?xn:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch{r=null}}return r}},gt=(e,t)=>!fn(e,t),ft={attribute:!0,type:String,converter:Te,reflect:!1,useDefault:!1,hasChanged:gt};Symbol.metadata??=Symbol("metadata"),oe.litPropertyMetadata??=new WeakMap;var S=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,r=ft){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(t,r),!r.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,r);s!==void 0&&gn(this.prototype,t,s)}}static getPropertyDescriptor(t,r,n){let{get:s,set:i}=bn(this.prototype,t)??{get(){return this[r]},set(o){this[r]=o}};return{get:s,set(o){let d=s?.call(this);i?.call(this,o),this.requestUpdate(t,d,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ft}static _$Ei(){if(this.hasOwnProperty(G("elementProperties")))return;let t=wn(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(G("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(G("properties"))){let r=this.properties,n=[...vn(r),...yn(r)];for(let s of n)this.createProperty(s,r[s])}let t=this[Symbol.metadata];if(t!==null){let r=litPropertyMetadata.get(t);if(r!==void 0)for(let[n,s]of r)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[r,n]of this.elementProperties){let s=this._$Eu(r,n);s!==void 0&&this._$Eh.set(s,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let r=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)r.unshift(Ee(s))}else t!==void 0&&r.push(Ee(t));return r}static _$Eu(t,r){let n=r.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,r=this.constructor.elementProperties;for(let n of r.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ht(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,r,n){this._$AK(t,n)}_$ET(t,r){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let i=(n.converter?.toAttribute!==void 0?n.converter:Te).toAttribute(r,n.type);this._$Em=t,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(t,r){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let i=n.getPropertyOptions(s),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Te;this._$Em=s;let d=o.fromAttribute(r,i.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(t,r,n,s=!1,i){if(t!==void 0){let o=this.constructor;if(s===!1&&(i=this[t]),n??=o.getPropertyOptions(t),!((n.hasChanged??gt)(i,r)||n.useDefault&&n.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,n))))return;this.C(t,r,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,r,{useDefault:n,reflect:s,wrapped:i},o){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??r??this[t]),i!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(r=void 0),this._$AL.set(t,r)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,i]of this._$Ep)this[s]=i;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,i]of n){let{wrapped:o}=i,d=this[s];o!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,i,d)}}let t=!1,r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(r)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(r)}willUpdate(t){}_$AE(t){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(t){}firstUpdated(t){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[G("elementProperties")]=new Map,S[G("finalized")]=new Map,$n?.({ReactiveElement:S}),(oe.reactiveElementVersions??=[]).push("2.1.2");var Re=globalThis,bt=e=>e,ae=Re.trustedTypes,vt=ae?ae.createPolicy("lit-html",{createHTML:e=>e}):void 0,Et="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,Tt="?"+P,kn=`<${Tt}>`,I=document,X=()=>I.createComment(""),Y=e=>e===null||typeof e!="object"&&typeof e!="function",Le=Array.isArray,En=e=>Le(e)||typeof e?.[Symbol.iterator]=="function",_e=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,yt=/-->/g,wt=/>/g,H=RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),xt=/'/g,$t=/"/g,_t=/^(?:script|style|textarea|title)$/i,De=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),l=De(1),pi=De(2),ui=De(3),A=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),kt=new WeakMap,O=I.createTreeWalker(I,129);function Ct(e,t){if(!Le(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return vt!==void 0?vt.createHTML(t):t}var Tn=(e,t)=>{let r=e.length-1,n=[],s,i=t===2?"<svg>":t===3?"<math>":"",o=W;for(let d=0;d<r;d++){let a=e[d],p,g,f=-1,y=0;for(;y<a.length&&(o.lastIndex=y,g=o.exec(a),g!==null);)y=o.lastIndex,o===W?g[1]==="!--"?o=yt:g[1]!==void 0?o=wt:g[2]!==void 0?(_t.test(g[2])&&(s=RegExp("</"+g[2],"g")),o=H):g[3]!==void 0&&(o=H):o===H?g[0]===">"?(o=s??W,f=-1):g[1]===void 0?f=-2:(f=o.lastIndex-g[2].length,p=g[1],o=g[3]===void 0?H:g[3]==='"'?$t:xt):o===$t||o===xt?o=H:o===yt||o===wt?o=W:(o=H,s=void 0);let x=o===H&&e[d+1].startsWith("/>")?" ":"";i+=o===W?a+kn:f>=0?(n.push(p),a.slice(0,f)+Et+a.slice(f)+P+x):a+P+(f===-2?d:x)}return[Ct(e,i+(e[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},J=class e{constructor({strings:t,_$litType$:r},n){let s;this.parts=[];let i=0,o=0,d=t.length-1,a=this.parts,[p,g]=Tn(t,r);if(this.el=e.createElement(p,n),O.currentNode=this.el.content,r===2||r===3){let f=this.el.content.firstChild;f.replaceWith(...f.childNodes)}for(;(s=O.nextNode())!==null&&a.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let f of s.getAttributeNames())if(f.endsWith(Et)){let y=g[o++],x=s.getAttribute(f).split(P),_=/([.?@])?(.*)/.exec(y);a.push({type:1,index:i,name:_[2],strings:x,ctor:_[1]==="."?Se:_[1]==="?"?Ae:_[1]==="@"?Pe:j}),s.removeAttribute(f)}else f.startsWith(P)&&(a.push({type:6,index:i}),s.removeAttribute(f));if(_t.test(s.tagName)){let f=s.textContent.split(P),y=f.length-1;if(y>0){s.textContent=ae?ae.emptyScript:"";for(let x=0;x<y;x++)s.append(f[x],X()),O.nextNode(),a.push({type:2,index:++i});s.append(f[y],X())}}}else if(s.nodeType===8)if(s.data===Tt)a.push({type:2,index:i});else{let f=-1;for(;(f=s.data.indexOf(P,f+1))!==-1;)a.push({type:7,index:i}),f+=P.length-1}i++}}static createElement(t,r){let n=I.createElement("template");return n.innerHTML=t,n}};function V(e,t,r=e,n){if(t===A)return t;let s=n!==void 0?r._$Co?.[n]:r._$Cl,i=Y(t)?void 0:t._$litDirective$;return s?.constructor!==i&&(s?._$AO?.(!1),i===void 0?s=void 0:(s=new i(e),s._$AT(e,r,n)),n!==void 0?(r._$Co??=[])[n]=s:r._$Cl=s),s!==void 0&&(t=V(e,s._$AS(e,t.values),s,n)),t}var Ce=class{constructor(t,r){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:r},parts:n}=this._$AD,s=(t?.creationScope??I).importNode(r,!0);O.currentNode=s;let i=O.nextNode(),o=0,d=0,a=n[0];for(;a!==void 0;){if(o===a.index){let p;a.type===2?p=new Z(i,i.nextSibling,this,t):a.type===1?p=new a.ctor(i,a.name,a.strings,this,t):a.type===6&&(p=new Me(i,this,t)),this._$AV.push(p),a=n[++d]}o!==a?.index&&(i=O.nextNode(),o++)}return O.currentNode=I,s}p(t){let r=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,r),r+=n.strings.length-2):n._$AI(t[r])),r++}},Z=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,r,n,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,r=this._$AM;return r!==void 0&&t?.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=V(this,t,r),Y(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==A&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):En(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&Y(this._$AH)?this._$AA.nextSibling.data=t:this.T(I.createTextNode(t)),this._$AH=t}$(t){let{values:r,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=J.createElement(Ct(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(r);else{let i=new Ce(s,this),o=i.u(this.options);i.p(r),this.T(o),this._$AH=i}}_$AC(t){let r=kt.get(t.strings);return r===void 0&&kt.set(t.strings,r=new J(t)),r}k(t){Le(this._$AH)||(this._$AH=[],this._$AR());let r=this._$AH,n,s=0;for(let i of t)s===r.length?r.push(n=new e(this.O(X()),this.O(X()),this,this.options)):n=r[s],n._$AI(i),s++;s<r.length&&(this._$AR(n&&n._$AB.nextSibling,s),r.length=s)}_$AR(t=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);t!==this._$AB;){let n=bt(t).nextSibling;bt(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},j=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,r,n,s,i){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=r,this._$AM=s,this.options=i,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=h}_$AI(t,r=this,n,s){let i=this.strings,o=!1;if(i===void 0)t=V(this,t,r,0),o=!Y(t)||t!==this._$AH&&t!==A,o&&(this._$AH=t);else{let d=t,a,p;for(t=i[0],a=0;a<i.length-1;a++)p=V(this,d[n+a],r,a),p===A&&(p=this._$AH[a]),o||=!Y(p)||p!==this._$AH[a],p===h?t=h:t!==h&&(t+=(p??"")+i[a+1]),this._$AH[a]=p}o&&!s&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Se=class extends j{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},Ae=class extends j{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},Pe=class extends j{constructor(t,r,n,s,i){super(t,r,n,s,i),this.type=5}_$AI(t,r=this){if((t=V(this,t,r,0)??h)===A)return;let n=this._$AH,s=t===h&&n!==h||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,i=t!==h&&(n===h||s);s&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Me=class{constructor(t,r,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){V(this,t)}};var _n=Re.litHtmlPolyfillSupport;_n?.(J,Z),(Re.litHtmlVersions??=[]).push("3.3.3");var St=(e,t,r)=>{let n=r?.renderBefore??t,s=n._$litPart$;if(s===void 0){let i=r?.renderBefore??null;n._$litPart$=s=new Z(t.insertBefore(X(),i),i,void 0,r??{})}return s._$AI(e),s};var He=globalThis,w=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=St(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};w._$litElement$=!0,w.finalized=!0,He.litElementHydrateSupport?.({LitElement:w});var Cn=He.litElementPolyfillSupport;Cn?.({LitElement:w});(He.litElementVersions??=[]).push("4.2.2");var At={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Pt=e=>(...t)=>({_$litDirective$:e,values:t}),le=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,r,n){this._$Ct=t,this._$AM=r,this._$Ci=n}_$AS(t,r){return this.update(t,r)}update(t,r){return this.render(...r)}};var Mt="important",Sn=" !"+Mt,M=Pt(class extends le{constructor(e){if(super(e),e.type!==At.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{let n=e[r];return n==null?t:t+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${n};`},"")}update(e,[t]){let{style:r}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let n of this.ft)t[n]==null&&(this.ft.delete(n),n.includes("-")?r.removeProperty(n):r[n]=null);for(let n in t){let s=t[n];if(s!=null){this.ft.add(n);let i=typeof s=="string"&&s.endsWith(Sn);n.includes("-")||i?r.setProperty(n,i?s.slice(0,-11):s,i?Mt:""):r[n]=s}}return A}});var An=/^[A-Za-z0-9_-]+$/,Pn=/[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i,Mn=/['"]/,Rn=["lovelace-background","background-image"];function R(e,t){return{...e.vars,...e.modes?.[t]??{}}}function Ln(e){return An.test(e)?!e.startsWith("card-mod-")&&!e.startsWith("uix-"):!1}function Dn(e,t){return typeof t!="string"||Pn.test(t)?!1:!Mn.test(t)||Rn.includes(e)}function Hn(e){return Object.entries(e).filter(([t,r])=>Ln(t)&&Dn(t,r))}var On=["lovelace-background","background-image"];function In(e,t){return On.includes(e)||/url\(/i.test(t)?t.replace(/\bfixed\b/gi,"scroll"):t}function N(e,t){for(let[r,n]of Hn(t))e.style.setProperty(`--${r}`,In(r,n))}function Q(e,t){return e.connection.sendMessagePromise(t)}var u={title:"Theme preview",dashboard:"Dashboard",defaultDashboard:"Overview",view:"View",device:"Device",desktop:"Desktop",tablet:"Tablet",phone:"Phone",density:"Density",normal:"Normal",compact:"Compact",mode:"Mode",dark:"Dark",light:"Light",current:"Current",candidate:"Candidate",divider:"Drag to compare current and candidate",splitAt:"Split at {percent} percent",apply:"Apply",installFirst:"Install first",nameCollision:"A different local theme named {name} exists and will be applied.",repoLink:"View repository",tryButton:"Try for 30 seconds",placeholderCard:"Preview unavailable for card type",loading:"Loading dashboard...",loadError:"Could not load this dashboard.",noViews:"This dashboard has no views.",noCards:"This dashboard has no cards to preview.",generatedSuffix:"(generated by Home Assistant)",generatedDefault:"This dashboard is generated by Home Assistant and has no stored layout to read. Pick another dashboard.",sampleView:"Sample from your entities",sampleNote:"This is a sample built from your entities. The real Overview is generated by Home Assistant and cannot be read.",domainTitles:{light:"Lights",switch:"Switches",climate:"Climate",cover:"Covers",media_player:"Media players",sensor:"Sensors",binary_sensor:"Binary sensors"},compare:"Compare",compareLabel:"Show",themeOnly:"Theme only",footnote:"Drawn from your own dashboard with read-only data and scoped colors. Nothing changes until you press Apply.",emptyView:"This view has no cards.",tooManyCards:"This view has more than 200 cards, so it is not previewed.",noCandidate:"Select a theme to compare.",noModeBlock:"This theme has no {mode} block, so the candidate uses the current colors.",trialUnavailable:"Trial mode is not ready. Reload the page and try again.",trialFailed:"The trial could not start."};var Lt=200,Nn=3,Un=60,Fn=1500,Bn=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,Vn=3e3;function b(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ce(e){if(!b(e))return{};let t={};for(let[r,n]of Object.entries(e))typeof n=="string"&&(t[r]=n);return t}function Rt(e){if(b(e))return{dark:ce(e.dark),light:ce(e.light)}}function U(e){return b(e.vars)?{vars:ce(e.vars),modes:Rt(e.modes)}:{vars:ce(e),modes:Rt(e.modes)}}function Dt(e,t){let r=e?.selectedTheme?.theme??e?.themes?.theme;if(!r)return{};let n=e?.themes?.themes?.[r];return b(n)?R(U(n),t):{}}function Ht(e){let t=e?.selectedTheme,r=t?.theme??e?.themes?.theme??"default";if(!t)return{theme:r};let n={theme:r};return typeof t.dark=="boolean"&&(n.dark=e?.themes?.darkMode??!1),typeof t.primaryColor=="string"&&(n.primaryColor=t.primaryColor),typeof t.accentColor=="string"&&(n.accentColor=t.accentColor),n}function Ot(e,t){return{theme:e.name,dark:t==="dark"}}function Ue(e){return e.installed&&e.canApply}function It(e){if(!(!Bn.test(e)||e.split("/").some(r=>r==="."||r==="..")))return`https://github.com/${e}`}function pe(e,t){return e?e.entry?R(e.entry,t):e.vars:{}}function Nt(e){return e&&/^https:\/\//i.test(e)?e:void 0}async function Ut(e){let t=await e.connection.sendMessagePromise({type:"lovelace/dashboards/list"}),r=[{url_path:null,title:u.defaultDashboard}];if(!Array.isArray(t))return r;for(let n of t)b(n)&&typeof n.url_path=="string"&&r.push({url_path:n.url_path,title:typeof n.title=="string"?n.title:n.url_path});return r}async function Ft(e,t){let r=await e.connection.sendMessagePromise({type:"lovelace/config",url_path:t});return b(r)?r:{}}function Fe(e){return Array.isArray(e.views)?e.views.filter(b):[]}function Bt(e,t){return typeof e.title=="string"&&e.title?e.title:typeof e.path=="string"&&e.path?e.path:`${u.view} ${t+1}`}function Vt(e,t){if(!Array.isArray(e.cards))return e;if(t>=Nn)return{...e,cards:[]};let r=e.cards.filter(b).map(n=>Vt(n,t+1));return{...e,cards:r}}function Be(e){let t=Array.isArray(e.cards)?e.cards:[],n=(Array.isArray(e.sections)?e.sections:[]).flatMap(s=>b(s)&&Array.isArray(s.cards)?s.cards:[]);return[...t,...n].filter(b).map(s=>Vt(s,0))}function Ve(e){return e.reduce((t,r)=>{let n=Array.isArray(r.cards)?Ve(r.cards.filter(b)):0;return t+1+n},0)}var Oe,ee,Ie;function Ne(){let e=window.loadCardHelpers;return typeof e=="function"?e:void 0}async function jn(){let e=customElements.whenDefined("partial-panel-resolver"),t=new Promise(n=>setTimeout(n,Vn));if(await Promise.race([e,t]),!customElements.get("partial-panel-resolver"))return;let r=document.createElement("partial-panel-resolver");r.hass={panels:{tmp:{url_path:"tmp",component_name:"lovelace"}}},r._updateRoutes?.(),await r.routerOptions?.routes?.tmp?.load?.()}async function zn(){return Ne()?!0:(Ie??=jn().catch(()=>{}).finally(()=>{Ie=void 0}),await Ie,Ne()!==void 0)}async function jt(){if(!await zn())return;let e=Ne();if(e)return ee&&Oe===e||(Oe=e,ee=Promise.resolve().then(()=>e()).catch(()=>{ee=void 0,Oe=void 0})),ee}function Kn(e){let t=typeof e.type=="string"?e.type:"unknown";return Array.from(t).slice(0,Un).join("")}function de(e){let t=document.createElement("div");return t.className="placeholder",t.textContent=`${u.placeholderCard} ${e}`,t}function qn(e){return e.localName==="hui-error-card"||e instanceof HTMLUnknownElement}function Gn(e){return new Promise(t=>{let r=setTimeout(()=>t(!1),Fn),n=s=>{clearTimeout(r),t(s)};try{customElements.whenDefined(e).then(()=>n(!0),()=>n(!1))}catch{n(!1)}})}async function zt(e,t){let r=Kn(t);if(!e)return de(r);let n;try{n=e.createCardElement(t)}catch{return de(r)}if(qn(n))return de(r);let s=n.localName;return s.includes("-")&&customElements.get(s)===void 0&&!await Gn(s)?de(r):n}function Kt(e){let t=[];for(let r=0;r<e.style.length;r+=1){let n=e.style.item(r);n.startsWith("--")&&t.push(n)}for(let r of t)e.style.removeProperty(r)}var qt="hats_lite_theme_cache",Wn=120,Xn=2e4;function je(e){if(!b(e))return null;let t={};for(let[r,n]of Object.entries(e)){if(typeof n!="string")return null;t[r]=n}return t}function Yn(e){if(!b(e)||typeof e.name!="string")return null;let t=je(e.vars);if(!t)return null;let r={name:e.name,vars:t};if(e.modes!==void 0&&e.modes!==null){if(!b(e.modes))return null;let n=je(e.modes.dark??{}),s=je(e.modes.light??{});if(!n||!s)return null;r.modes={dark:n,light:s}}return r}function ze(e){let t=Object.keys(e)[0];if(t===void 0)return null;let r=e[t];if(!b(r))return null;let n=U(r);return{name:t,vars:n.vars,modes:n.modes}}function Gt(e){return JSON.stringify(e).length>Xn}var ue=class{constructor(){this.slots=new Map;this.load()}load(){try{let t=localStorage.getItem(qt);if(t===null)return;let r=JSON.parse(t);if(!Array.isArray(r))return;for(let n of r){if(!Array.isArray(n)||typeof n[0]!="string")continue;let s=Yn(n[1]);s&&!Gt(s)&&this.slots.set(n[0],{theme:s})}this.trim()}catch{this.slots.clear()}}trim(){for(;this.slots.size>Wn;){let t=this.slots.keys().next().value;if(t===void 0)return;this.slots.delete(t)}}touch(t){let r=this.slots.get(t);if(r)return this.slots.delete(t),this.slots.set(t,r),r}get(t){return this.touch(t)?.theme}bundle(t){return this.slots.get(t)?.bundle}set(t,r,n){this.slots.delete(t),this.slots.set(t,{theme:r,bundle:n}),this.trim(),this.persist()}persist(){try{let t=[...this.slots.entries()].filter(([,r])=>!Gt(r.theme)).map(([r,n])=>[r,n.theme]);localStorage.setItem(qt,JSON.stringify(t))}catch{return}}};var Wt="hats-lite-theme-selected",Xt="hats-lite-theme-saved",Yt="hats-lite-mode-change",Ke="hats_lite_catalog",qe="/api/hats_lite/background";var Jt=["image/png","image/jpeg","image/webp","image/gif"];var c={title:"Themes",searchLabel:"Search themes",searchPlaceholder:"Search themes",loading:"Loading themes...",loadError:"Could not load the theme list.",cachedNote:"Showing the saved list from your last successful load.",noThemes:"No themes available.",noMatches:"No themes match your search.",noFilterMatches:"No themes match this filter yet. Previews load as you scroll.",installed:"Installed",inUse:"In use",licenseUnknown:"License unknown to HATS Lite",licenseShort:"License unknown",licenseKnown:"License detected when the thumbnails were built",starsLabel:"Stars",starGlyph:"★",themeErrorDefault:"Could not open this theme. Try again.",preview:"Preview",showing:"Showing",modeLabel:"Thumbnail mode",modeDark:"Dark",modeLight:"Light",filterLabel:"Filter themes",filterAll:"All",filterInstalled:"Installed",filterDark:"Dark",filterLight:"Light",filterGlass:"Glass",thumbUnavailable:"Preview not available",thumbRateLimited:"Rate limited, try again later",thumbLoading:"Loading preview",thumbRoom:"Living room thermostat",thumbTemp:"20.5 °C",thumbHeating:"Heating to 21",thumbEnergy:"Energy today",thumbGarage:"Garage door",thumbClosed:"Closed",thumbLocked:"Locked since 18:30",thumbLights:"Lights and doors",thumbLight:"Living room light",thumbDoor:"Front door",thumbPorch:"Porch timer",thumbGreeting:"Good evening",thumbSunset:"Sunset 18:42",thumbChipLight:"Light on",thumbChipFan:"Fan on",thumbChipHeat:"Heat"};function Zt(e){if(!e||typeof e!="object")return null;let t=e;return typeof t.full_name!="string"?null:{full_name:t.full_name,description:typeof t.description=="string"?t.description:"",stars:typeof t.stars=="number"?t.stars:0,installed:t.installed===!0,last_commit:typeof t.last_commit=="string"?t.last_commit:null,hacs_id:typeof t.hacs_id=="string"?t.hacs_id:null}}function Ge(e){return Array.isArray(e)?e.flatMap(t=>{let r=Zt(t);return r?[r]:[]}):[]}function Qt(){try{let e=localStorage.getItem(Ke);if(e===null)return null;let t=JSON.parse(e);return!Array.isArray(t)||!t.every(r=>Zt(r)!==null)?null:Ge(t)}catch{return null}}function er(e){try{localStorage.setItem(Ke,JSON.stringify(e))}catch{return}}function tr(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function rr(e){if(e&&typeof e=="object"&&"message"in e){let t=e.message;if(typeof t=="string"&&t)return t}return c.themeErrorDefault}function nr(e,t){return e.full_name.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)}function We(e){if(!e||typeof e!="object"||!("message"in e))return!1;let t=e.message;return typeof t=="string"&&/\bstatus (403|429)\b/.test(t)}var ir=["all","installed","dark","light","glass"];function or(e){let t=e.split("/");return t[t.length-1]||e}function ar(e){let t=e.indexOf("/");return t>0?e.slice(0,t):""}function z(e){return`${e.full_name}@${e.last_commit||"HEAD"}`}function Jn(e){return`${e.full_name} ${e.description}`.toLowerCase()}function sr(e){return!!e&&Object.keys(e).length>0}function Zn(e){return[e.vars,e.modes?.dark,e.modes?.light].some(r=>Object.entries(r??{}).some(([n,s])=>/backdrop-filter|blur/i.test(n)||/blur\(/i.test(s)))}function lr(e,t,r,n){let s=r===void 0?n:void 0,i=Jn(t);return e==="all"?!0:e==="installed"?t.installed:e==="dark"?i.includes("dark")||sr(r?.modes?.dark)||s?.dark===!0:e==="light"?i.includes("light")||sr(r?.modes?.light)||s?.light===!0:/glass|frost|blur/.test(i)||r!==void 0&&Zn(r)||s?.glass===!0}var Qn={all:c.filterAll,installed:c.filterInstalled,dark:c.filterDark,light:c.filterLight,glass:c.filterGlass};function dr(e){return l`
    <div class="toolbar">
      <span class="showing">${c.showing}</span>
      <div class="seg" role="group" aria-label=${c.modeLabel}>
        ${["dark","light"].map(t=>l`
            <button
              type="button"
              data-mode=${t}
              aria-pressed=${e.mode===t?"true":"false"}
              @click=${()=>e.onMode(t)}
            >
              ${t==="dark"?c.modeDark:c.modeLight}
            </button>
          `)}
      </div>
      <div class="filters" role="group" aria-label=${c.filterLabel}>
        ${ir.map(t=>l`
            <button
              type="button"
              class="chip-btn"
              data-filter=${t}
              aria-pressed=${e.filter===t?"true":"false"}
              @click=${()=>e.onFilter(t)}
            >
              ${Qn[t]}
            </button>
          `)}
      </div>
      <input
        class="search"
        type="search"
        aria-label=${c.searchLabel}
        placeholder=${c.searchPlaceholder}
        .value=${e.query}
        @input=${e.onSearch}
      />
    </div>
  `}var ur="/hats_lite_static/thumbs";function es(e,t,r){let n=e%t,s=Math.floor(e/t);return{sizeX:t*100,sizeY:r*100,posX:t>1?n/(t-1)*100:0,posY:r>1?s/(r-1)*100:0}}function cr(e,t){return typeof e=="number"&&Number.isInteger(e)&&e>0&&e<=t}function ts(e,t,r){if(typeof e!="object"||e===null)return null;let n=e,s=n.index;return typeof n.full_name!="string"||typeof n.name!="string"||typeof s!="number"||!Number.isInteger(s)||s<0||s>=t||r.has(s)?null:(r.add(s),{full_name:n.full_name,name:n.name,index:s,license:typeof n.license=="string"&&n.license?n.license:null,dark:n.dark===!0,light:n.light===!0,glass:n.glass===!0})}function rs(e){if(typeof e!="object"||e===null)return null;let t=e,{columns:r,rows:n,themes:s}=t;if(t.version!==1||!cr(r,64)||!cr(n,2e3)||!Array.isArray(s))return null;let i=new Set,o=new Map;for(let a of s){let p=ts(a,r*n,i);if(!p)return null;o.set(p.full_name,p)}let d=typeof t.generated=="string"?t.generated:"";return{columns:r,rows:n,generated:d,themes:o}}var pr={fetchIndex(){return fetch(`${ur}/index.json`,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw new Error("index unavailable");return e.json()})},loadImage(e){return new Promise(t=>{let r=new Image;r.onload=()=>t(!0),r.onerror=()=>t(!1),r.src=e})}},he=class{constructor(t){this.onChange=t;this.images=new Map;this.wanted=new Set}ensure(t){if(this.wanted.add(t),this.promise){this.pump();return}this.promise=Promise.resolve().then(()=>pr.fetchIndex()).then(rs,()=>null).then(r=>{this.index=r,this.pump(),this.onChange()})}pump(){if(this.index)for(let t of this.wanted)this.images.has(t)||(this.images.set(t,void 0),pr.loadImage(this.imageUrl(t)).then(r=>{this.images.set(t,r),this.onChange()}))}imageUrl(t){let r=this.index?.generated??"",n=r?`?v=${encodeURIComponent(r)}`:"";return`${ur}/atlas-${t}.webp${n}`}theme(t){return this.index?.themes.get(t)}state(t,r){if(this.ensure(r),this.index===void 0)return"pending";if(!this.index?.themes.has(t))return"none";if(!this.images.has(r))return"pending";let n=this.images.get(r);return n===void 0?"pending":n?"ok":"none"}tile(t){let r=this.theme(t);return!r||!this.index?null:es(r.index,this.index.columns,this.index.rows)}};function hr(e,t,r){let n=e.tile(t),s=e.theme(t);if(!n||!s)return h;let i={backgroundImage:`url("${e.imageUrl(r)}")`,backgroundSize:`${n.sizeX}% ${n.sizeY}%`,backgroundPosition:`${n.posX}% ${n.posY}%`};return l`<div
    class="atlas-thumb"
    role="img"
    aria-label=${s.name}
    data-atlas="true"
    style=${M(i)}
  ></div>`}function mr(e){if(!e)return l`<span
      class="chip"
      title=${c.licenseUnknown}
      aria-label=${c.licenseUnknown}
      >${c.licenseShort}</span
    >`;let t=`${c.licenseKnown}: ${e}`;return l`<span class="chip" title=${t} aria-label=${t}>${e}</span>`}var me=class{constructor(t=3,r=5e3,n=1,s=()=>r){this.limit=t;this.retryMs=r;this.retries=n;this.delayFor=s;this.running=0;this.waiting=[]}get active(){return this.running}add(t){return this.attempt(t,this.retries)}acquire(){return this.running<this.limit?(this.running+=1,Promise.resolve()):new Promise(t=>this.waiting.push(t))}release(){let t=this.waiting.shift();t?t():this.running-=1}async attempt(t,r){await this.acquire();let n=this.retryMs;try{return await t()}catch(s){if(r<=0)throw s;n=this.delayFor(s)}finally{this.release()}return await new Promise(s=>setTimeout(s,n)),this.attempt(t,r-1)}};var fr=$`
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
`;var fe={dark:{"primary-background-color":"#111827","card-background-color":"#1f2937","primary-text-color":"#f3f4f6","secondary-text-color":"#9ca3af","primary-color":"#38bdf8","accent-color":"#fb923c","divider-color":"rgba(255,255,255,.12)"},light:{"primary-background-color":"#f3f4f6","card-background-color":"#ffffff","primary-text-color":"#111827","secondary-text-color":"#4b5563","primary-color":"#0284c7","accent-color":"#ea580c","divider-color":"rgba(0,0,0,.12)"}};var Xe=class extends w{constructor(){super(...arguments);this.vars=null;this.mode="dark";this.failed=!1;this.limited=!1}static{this.properties={vars:{attribute:!1},mode:{attribute:!1},failed:{type:Boolean},limited:{type:Boolean}}}static{this.styles=$`
    :host {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      container-type: inline-size;
      position: relative;
      color: var(--primary-text-color);
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
  `}updated(r){!r.has("vars")&&!r.has("mode")||(this.style.cssText="",this.vars&&(N(this,fe[this.mode]),N(this,this.vars)))}render(){if(this.failed){let r=this.limited?c.thumbRateLimited:c.thumbUnavailable;return l`<div class="state unavailable"><span class="reason">${r}</span></div>`}return this.vars?l`
      <div class="stage" aria-hidden="true">
        <div class="box">
          <div class="sub">${c.thumbRoom}</div>
          <div class="big">${c.thumbTemp}</div>
          <div class="bar"><i></i></div>
          <div class="sub">${c.thumbHeating}</div>
        </div>
        <div class="box">
          <div class="sub">${c.thumbLights}</div>
          <div class="row"><span>${c.thumbLight}</span><i class="tog"></i></div>
          <div class="row"><span>${c.thumbDoor}</span><i class="tog"></i></div>
          <div class="row"><span>${c.thumbPorch}</span><i class="tog off"></i></div>
        </div>
        <div class="tile">
          <span class="g">${c.thumbGreeting}</span>
          <span class="t">${c.thumbSunset}</span>
        </div>
        <div class="chips">
          <span class="pill"><i></i>${c.thumbChipLight}</span>
          <span class="pill"><i></i>${c.thumbChipFan}</span>
          <span class="pill"><i></i>${c.thumbChipHeat}</span>
        </div>
        <div class="box wide">
          <div class="sub">${c.thumbEnergy}</div>
          <div class="spark">
            <i style="height: 35%"></i><i style="height: 55%"></i><i style="height: 80%"></i
            ><i style="height: 45%"></i><i style="height: 65%"></i><i style="height: 95%"></i
            ><i style="height: 50%"></i><i style="height: 70%"></i>
          </div>
        </div>
        <div class="box">
          <div class="sub">${c.thumbGarage}</div>
          <div class="big small">${c.thumbClosed}</div>
          <div class="sub">${c.thumbLocked}</div>
        </div>
      </div>
    `:l`<div class="state skeleton" role="status" aria-label=${c.thumbLoading}></div>`}};customElements.get("hats-lite-thumb")||customElements.define("hats-lite-thumb",Xe);var L=$`
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
`,D=$`
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
`;var ns="hats_lite/catalog",ss="hats_lite/theme",is=6,os=6e4,Ye=class extends w{constructor(){super(...arguments);this.entries=[];this.query="";this.loading=!1;this.error="";this.fromCache=!1;this.busyName="";this.cardError=null;this.filter="all";this.mode="dark";this.states={};this.started=!1;this.modeTouched=!1;this.cache=new ue;this.queue=new me(3,5e3,1,r=>We(r)?os:5e3);this.atlas=new he(()=>this.onAtlasChange());this.seen=new Set;this.inflight=new Set;this.watched=new WeakMap;this.onIntersect=r=>{for(let n of r){if(!n.isIntersecting)continue;this.observer?.unobserve(n.target);let s=this.entryFor(n.target.dataset.key);s&&this.requestVars(s)}};this.onSearch=r=>{this.query=r.target.value}}static{this.properties={hass:{attribute:!1},entries:{state:!0},query:{state:!0},loading:{state:!0},error:{state:!0},fromCache:{state:!0},busyName:{state:!0},cardError:{state:!0},filter:{state:!0},mode:{state:!0},states:{state:!0}}}static{this.styles=[L,D,fr]}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0,this.watched=new WeakMap}willUpdate(r){r.has("hass")&&this.hass&&(!this.modeTouched&&this.hass.themes?.darkMode!==void 0&&(this.mode=this.hass.themes.darkMode?"dark":"light"),this.started||(this.started=!0,this.loadCatalog(this.hass)))}updated(){this.paintSwatches(),queueMicrotask(()=>this.watchCards())}async loadCatalog(r){this.loading=!0;try{let n=await Q(r,{type:ns});this.entries=Ge(n?.themes),this.fromCache=!1,this.error="",er(this.entries)}catch{let n=Qt();this.entries=n??[],this.fromCache=n!==null,this.error=c.loadError}finally{this.loading=!1}}fetchBundle(r,n=!1){let s=this.hass;if(!s)return Promise.reject(new Error(c.themeErrorDefault));let i={type:ss,full_name:r.full_name,commit:r.last_commit||"HEAD"};return n&&(i.summary=!0),Q(s,i).then(o=>{if(!tr(o?.themes))throw new Error(c.themeErrorDefault);return{themes:o.themes,summary:o.summary===!0}})}setState(r,n){let s={...this.states};n===null?delete s[r]:s[r]=n,this.states=s}requestVars(r){let n=z(r);!this.hass||this.inflight.has(n)||this.cache.get(n)||this.states[n]==="failed"||this.states[n]==="limited"||(this.seen.add(n),this.atlas.state(r.full_name,this.mode)==="none"&&(this.inflight.add(n),this.setState(n,"loading"),this.queue.add(()=>this.fetchBundle(r,!0)).then(s=>{let i=ze(s.themes);if(!i)throw new Error(c.themeErrorDefault);this.cache.set(n,i,s.summary?void 0:s.themes),this.setState(n,null)}).catch(s=>this.setState(n,We(s)?"limited":"failed")).finally(()=>this.inflight.delete(n))))}onAtlasChange(){this.requestUpdate();for(let r of this.seen){let n=this.entryFor(r);n&&this.requestVars(n)}}entryFor(r){return this.entries.find(n=>z(n)===r)}watchCards(){let r=Array.from(this.renderRoot.querySelectorAll(".card[data-key]"));if(typeof IntersectionObserver>"u"){for(let n of r.slice(0,is)){let s=this.entryFor(n.dataset.key);s&&this.requestVars(s)}return}this.observer??=new IntersectionObserver(this.onIntersect,{rootMargin:"200px"});for(let n of r){let s=n.dataset.key??"";this.watched.get(n)!==s&&(this.watched.has(n)&&this.observer.unobserve(n),this.watched.set(n,s),this.observer.observe(n))}}inUseName(){return this.hass?.selectedTheme?.theme??this.hass?.themes?.theme??"default"}paintSwatches(){let r=this.renderRoot.querySelector("[data-swatches]");if(!r)return;r.removeAttribute("style");let n=this.hass?.themes?.themes?.[this.inUseName()];if(!b(n))return;let s=R(U(n),this.mode),i={};s["primary-color"]&&(i["hl-sw-primary"]=s["primary-color"]),s["accent-color"]&&(i["hl-sw-accent"]=s["accent-color"]),N(r,i)}async selectTheme(r){if(this.busyName||!this.hass)return;let n=z(r);this.busyName=r.full_name,this.cardError=null;try{let s=this.cache.bundle(n);if(!s){s=(await this.fetchBundle(r)).themes;let o=ze(s);o&&this.cache.set(n,o,s)}let i={entry:r,themes:s};this.dispatchEvent(new CustomEvent(Wt,{bubbles:!0,composed:!0,detail:i}))}catch(s){this.cardError={name:r.full_name,text:rr(s)}}finally{this.busyName=""}}setMode(r){this.modeTouched=!0,this.mode=r}renderCard(r,n){let s=z(r),i=this.cache.get(s),o=or(r.full_name),d=ar(r.full_name),a=this.cardError?.name===r.full_name?this.cardError.text:"",p=i?R(i,this.mode):null,g=o===n||i!==void 0&&i.name===n,f=this.busyName!=="",y=this.atlas.state(r.full_name,this.mode)==="ok",x=this.atlas.theme(r.full_name)?.license,_=`${c.preview} ${o}`,ct=()=>this.selectTheme(r);return l`
      <article class="card" data-key=${s}>
        <button
          class="thumb-btn"
          type="button"
          aria-label=${_}
          ?disabled=${f}
          @click=${ct}
        >
          ${y?hr(this.atlas,r.full_name,this.mode):l`<hats-lite-thumb
                .vars=${p}
                .mode=${this.mode}
                ?failed=${(this.states[s]==="failed"||this.states[s]==="limited")&&!i}
                ?limited=${this.states[s]==="limited"&&!i}
              ></hats-lite-thumb>`}
        </button>
        <div class="body">
          <span class="name">${o}</span>
          ${d?l`<span class="owner">${d}</span>`:h}
          <div class="chips">
            ${r.installed?l`<span class="chip ok">${c.installed}</span>`:h}
            ${g?l`<span class="chip ok">${c.inUse}</span>`:h}
            <span
              class="chip"
              title="${c.starsLabel}: ${r.stars}"
              aria-label="${c.starsLabel}: ${r.stars}"
              >${c.starGlyph} ${r.stars}</span
            >
            ${mr(x)}
          </div>
          ${a?l`<p class="card-error" role="alert">${a}</p>`:h}
          <div class="actions">
            <button
              class="btn primary"
              type="button"
              aria-label=${_}
              aria-busy=${this.busyName===r.full_name?"true":"false"}
              ?disabled=${f}
              @click=${ct}
            >
              ${c.preview}
            </button>
          </div>
        </div>
      </article>
    `}render(){let r=this.query.trim().toLowerCase(),n=this.inUseName(),s=this.entries.filter(o=>(!r||nr(o,r))&&lr(this.filter,o,this.cache.get(z(o)),this.atlas.theme(o.full_name))),i="";return!this.loading&&s.length===0&&(this.entries.length===0?i=c.noThemes:i=r?c.noMatches:c.noFilterMatches),l`
      <section>
        ${this.error?l`<p class="banner" role="alert">${this.error}</p>`:h}
        ${this.fromCache?l`<p class="note" role="status">${c.cachedNote}</p>`:h}
        ${dr({mode:this.mode,filter:this.filter,query:this.query,onMode:o=>this.setMode(o),onFilter:o=>{this.filter=o},onSearch:this.onSearch})}
        ${this.loading?l`<p role="status">${c.loading}</p>`:h}
        ${i?l`<p role="status">${i}</p>`:h}
        <div class="grid">${s.map(o=>this.renderCard(o,n))}</div>
      </section>
    `}};customElements.get("hats-lite-browse")||customElements.define("hats-lite-browse",Ye);var yr=new WeakMap,wr=new WeakSet,Ze=new WeakMap,as=new Set(["keys","values","entries",Symbol.iterator]);function ls(e){if(typeof e!="object"||e===null)return!1;if(Array.isArray(e))return!0;let t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function gr(){throw new TypeError("Read-only")}function*ds(e){for(let t of e)yield E(t)}function cs(e,t,r){let n=Reflect.getOwnPropertyDescriptor(e,t);if(!n)return;if(Array.isArray(r)&&t==="length")return{value:Reflect.get(e,t,e),writable:!0,enumerable:!1,configurable:!1};if("value"in n)return{value:E(n.value),writable:!1,enumerable:n.enumerable,configurable:!0};let s=n.get;return{get:()=>E(s?s.call(e):void 0),set:void 0,enumerable:n.enumerable,configurable:!0}}function xr(e){return{get:(t,r)=>E(Reflect.get(e,r,e)),has:(t,r)=>Reflect.has(e,r),ownKeys:()=>Reflect.ownKeys(e),getOwnPropertyDescriptor:(t,r)=>cs(e,r,t),getPrototypeOf:()=>Reflect.getPrototypeOf(e),set:()=>!1,defineProperty:()=>!1,deleteProperty:()=>!1,setPrototypeOf:()=>!1,preventExtensions:()=>!1}}var $r=["has","keys","values","entries","forEach",Symbol.iterator],ps=new Set([...$r,"get"]),us=new Set([...$r,"union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"]),hs=new Set(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toString","toLocaleString","valueOf"]),ms=new Set(["union","intersection","difference","symmetricDifference","isSubsetOf","isSupersetOf","isDisjointFrom"]);function br(e){return typeof e!="object"||e===null?e:Ze.get(e)??e}function vr(e,t,r){let n=xr(e),s=new Proxy(t,{...n,get(i,o){if(o==="constructor"||o===Symbol.species)return Reflect.get(e,o,e);let d=Reflect.get(e,o,e);if(typeof d!="function")return E(d);let a=d;return r.has(o)?o==="get"?p=>E(a.call(e,br(p))):o==="has"?p=>a.call(e,br(p)):as.has(o)?()=>ds(a.call(e)):o==="forEach"?(p,g)=>a.call(e,(f,y)=>p.call(g,E(f),E(y),s)):ms.has(o)?p=>{let f=(typeof p=="object"&&p!==null?Ze.get(p):void 0)??new Set(Set.prototype.values.call(p));return E(a.call(e,f))}:gr:hs.has(o)&&d===Object.prototype[o]?o==="valueOf"?()=>s:(...p)=>a.apply(e,p):gr}});return s}function Je(e,t){return yr.set(e,t),wr.add(t),Ze.set(t,e),t}function E(e){if(e instanceof Date)return new Date(e.getTime());if(typeof e!="object"||e===null||wr.has(e))return e;let t=yr.get(e);if(t)return t;if(e instanceof Map)return Je(e,vr(e,new Map,ps));if(e instanceof Set)return Je(e,vr(e,new Set,us));if(!ls(e))return e;let r=Array.isArray(e)?[]:{};return Je(e,new Proxy(r,xr(e)))}var C=[];var fs=/^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|auth\/current_user$|render_template$)/;function ge(e){if(typeof e!="object"||e===null)return;let t={...e},r=t.type;if(typeof r=="string")return{type:r,msg:t}}function be(e){return e!==void 0&&fs.test(e.type)}function ve(e){return`ws:${e?e.type:"invalid"}`}var gs=new Set(["localize","formatEntityState","formatEntityAttributeName","formatEntityAttributeValue","formatEntityName","loadBackendTranslation","loadFragmentTranslation","hassUrl"]),bs=/\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i,vs=/@|%2f/i,ys=/^[A-Za-z][A-Za-z0-9+.-]*:/;function kr(e,t=!1){return typeof e!="string"||e===""||bs.test(e)||e.startsWith("//")||vs.test(e.split(/[?#]/,1)[0])?!1:e.startsWith("/")?!0:t&&!ys.test(e)}function Er(e){return typeof e=="string"?e:"invalid"}var Tr=new WeakMap;function _r(e){return e==null||typeof e=="string"&&e.toUpperCase()==="GET"?"GET":null}function Cr(e){return typeof e=="string"?e.toUpperCase():"invalid"}function ws(e){if(typeof e!="object"||e===null)return;let t=Tr.get(e);if(t)return t;let r=e,n=(o,...d)=>r[o].apply(r,d),i=Object.freeze({get connected(){return r.connected},get haVersion(){return r.haVersion},async sendMessagePromise(o){let d=ge(o);if(be(d))return n("sendMessagePromise",d.msg);C.push(ve(d))},sendMessage(o,d){let a=ge(o);if(be(a))return n("sendMessage",a.msg,d);C.push(ve(a))},async subscribeMessage(o,d,a){let p=ge(d);return be(p)?n("subscribeMessage",o,p.msg,a):(C.push(ve(p)),()=>{})}});return Tr.set(e,i),i}function Sr(e){let t=e,r=new Proxy({},{has(n,s){return s!=="auth"&&Reflect.has(t,s)},ownKeys(){return Reflect.ownKeys(t).filter(n=>n!=="auth")},getOwnPropertyDescriptor(n,s){if(!(s==="auth"||!Reflect.has(t,s)))return{value:Reflect.get(r,s),enumerable:!0,configurable:!0,writable:!1}},get(n,s){if(s==="auth")return;let i=Reflect.get(t,s,t);if(s==="connection")return ws(i);if(typeof i!="function")return E(i);let o=i;switch(s){case"callService":return async(d,a)=>{C.push(`service:${String(d)}.${String(a)}`)};case"callWS":return async d=>{let a=ge(d);if(be(a))return o.call(t,a.msg);C.push(ve(a))};case"callApi":return async(d,a,...p)=>{if(typeof d=="string"&&_r(d)){if(!kr(a,!0)){C.push(`api-path:${Er(a)}`);return}return o.call(t,d,a,...p)}C.push(`api:${Cr(d)}`)};case"fetchWithAuth":return async(d,a)=>{if(!kr(d)){C.push(`fetch-path:${Er(d)}`);return}if(a==null)return o.call(t,d,a);let p={...a},g=p.method;if(!_r(g)){C.push(`fetch:${Cr(g)}`);return}return o.call(t,d,p)};default:return gs.has(s)?o.bind(t):async()=>{C.push(String(s))}}},set(){return!1},defineProperty(){return!1},deleteProperty(){return!1},setPrototypeOf(){return!1},preventExtensions(){return!1}});return r}function ye(e){return Number.isFinite(e)?Math.min(98,Math.max(2,e)):50}function Ar(e,t){return t.width>0?ye((e-t.left)/t.width*100):50}function Pr(e){return`inset(0 0 0 ${e}%)`}var xs="__default__",$s=6,ks=8,Es=160,Mr=["light","switch","climate","cover","media_player","sensor","binary_sensor"],Ts=new Set(["person","zone","sun","update","event","conversation","tts","todo","weather"]);function we(e){return e??xs}function _s(e){return b(e)&&e.code==="config_not_found"}function Cs(e){let t=b(e)?e.message:e;return typeof t=="string"?Array.from(t).slice(0,Es).join(""):""}async function Rr(e,t){try{return{status:"ok",config:await Ft(e,t)}}catch(r){return _s(r)?{status:"notfound"}:{status:"error",reason:Cs(r)}}}function te(e){return e?Fe(e).some(t=>Be(t).length>0):!1}function Lr(e){let t=new Map;for(let o of Object.keys(e??{})){let d=o.indexOf(".");if(d<=0)continue;let a=o.slice(0,d),p=t.get(a)??[];p.push(o),t.set(a,p)}let r=[...t.keys()].filter(o=>!Mr.includes(o)&&!Ts.has(o)).sort(),n=[...Mr.filter(o=>t.has(o)),...r];n.length===0&&(n=[...t.keys()].sort());let s=u.domainTitles,i=n.slice(0,$s).map(o=>({type:"entities",title:s[o]??o,entities:(t.get(o)??[]).sort().slice(0,ks)}));if(i.length!==0)return{views:[{title:u.sampleView,cards:i}]}}function Dr(e){return e.status==="notfound"?u.generatedDefault:e.reason?`${u.loadError} ${e.reason}`:u.loadError}function Hr(e,t){let r=e?Fe(e):[];if(r.length===0)return{views:r,cards:[],notice:u.noViews};if(!te(e))return{views:r,cards:[],notice:u.noCards};let n=Be(r[t]??r[0]);return Ve(n)>Lt?{views:r,cards:[],notice:u.tooManyCards}:{views:r,cards:n,notice:n.length===0?u.emptyView:""}}function Or(e,t){return e.find(r=>r.url_path===t)?.title??u.defaultDashboard}var Ss="hats_lite_compare",As="hats_lite_compare_designer";function Ir(e){return e?Ss:As}function Nr(e=!0){try{let t=window.localStorage.getItem(Ir(e));return t===null?e:t!=="0"}catch{return e}}function Ur(e,t=!0){try{window.localStorage.setItem(Ir(t),e?"1":"0")}catch{return}}var Ps={desktop:"100%",tablet:"820px",phone:"390px"},Ms={normal:"1",compact:"0.85"},Rs=["desktop","tablet","phone"],Ls=["normal","compact"],Ds=["dark","light"];function Qe(e,t,r){return l`<button type="button" aria-pressed=${t?"true":"false"} @click=${r}>${e}</button>`}function Hs(e,t){return e.url_path===null&&t?`${e.title} ${u.generatedSuffix}`:e.title}function Fr(e){return l`<div class="appbar" aria-hidden="true"><i class="menu"></i><span class="title">${e}</span></div>`}function Os(e,t){let r=n=>()=>{e.compare!==n&&t.onCompare()};return l`
    <div class="field view-switch">${u.compareLabel}
      <div class="seg" role="group" aria-label=${u.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${e.compare?"true":"false"}
          ?disabled=${!e.canCompare} @click=${r(!0)}>${u.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${e.compare?"false":"true"}
          ?disabled=${!e.canCompare} @click=${r(!1)}>${u.themeOnly}</button>
      </div>
    </div>`}function Br(e,t){return l`
    <div class="toolbar">
      <label class="field">${u.dashboard}
        <select class="pill" @change=${t.onDashboard}>
          ${e.dashboards.map((r,n)=>l`<option value=${String(n)} .selected=${r.url_path===e.dashboardUrl}>${Hs(r,e.generatedDefault)}</option>`)}
        </select>
      </label>
      ${e.showViews?l`<label class="field">${u.view}
            <select class="pill" @change=${t.onView}>
              ${e.views.map((r,n)=>l`<option value=${String(n)} .selected=${n===e.viewIndex}>${Bt(r,n)}</option>`)}
            </select>
          </label>`:h}
      <div class="seg" role="group" aria-label=${u.device}>
        ${Rs.map(r=>Qe(u[r],e.frame===r,()=>t.onFrame(r)))}
      </div>
      <div class="seg" role="group" aria-label=${u.density}>
        ${Ls.map(r=>Qe(u[r],e.density===r,()=>t.onDensity(r)))}
      </div>
      <div class="seg" role="group" aria-label=${u.mode}>
        ${Ds.map(r=>Qe(u[r],e.mode===r,()=>t.onMode(r)))}
      </div>
      ${Os(e,t)}
    </div>`}function Vr(e,t){return l`
    <div class="frame" style=${M({"--hats-lite-frame-width":Ps[e.frame],"--hats-lite-density-scale":Ms[e.density]})}>
      <div class=${e.comparing?"stage":"stage solo"}>
        <div class="pane current">${Fr(e.title)}<div class="cards" inert></div></div>
        <div class="pane candidate" style=${M(e.comparing?{clipPath:Pr(e.split)}:{})}>
          ${Fr(e.title)}<div class="cards" inert></div>
        </div>
        <div class="shield"></div>
        ${e.comparing?l`<div class="divider" role="slider" tabindex="0"
              aria-label=${u.divider}
              aria-valuemin="2" aria-valuemax="98"
              aria-valuenow=${String(Math.round(e.split))}
              aria-valuetext=${u.splitAt.replace("{percent}",String(Math.round(e.split)))}
              style=${M({left:`${e.split}%`})}
              @keydown=${t.onKey}
              @pointerdown=${t.onPointerDown}
              @pointermove=${t.onPointerMove}
              @pointerup=${t.onPointerUp}
              @pointercancel=${t.onPointerUp}></div>`:h}
        <div class="badges">
          ${e.comparing?l`<span class="badge">${u.current}</span>`:l`<span></span>`}
          <span class="badge">${e.candidateName}</span>
        </div>
      </div>
      ${e.note?l`<p class="empty-note" role="status">${e.note}</p>`:h}
    </div>
    <p class="footnote">${u.footnote}</p>`}function jr(e,t){return l`
    <div class="actions">
      <button type="button" class="btn primary apply" ?disabled=${!e.applicable} @click=${t.onApply}>${e.applicable?u.apply:u.installFirst}</button>
      <button type="button" class="btn try" ?disabled=${!e.installed||e.trying} @click=${t.onTry}>${u.tryButton}</button>
      ${!e.applicable&&e.repo?l`<a class="chip link" href=${e.repo} target="_blank" rel="noopener noreferrer">${u.repoLink}</a>`:h}
      ${e.collision?l`<p class="chip warn collision" role="status">${e.collision}</p>`:h}
      ${e.error?l`<p class="error" role="alert">${e.error}</p>`:h}
    </div>`}var Is=["hass-action","hass-more-info","show-dialog","hass-toggle-menu","location-changed","context-request"],zr=new WeakSet;function Ns(e){e.stopPropagation()}function Kr(e){if(!zr.has(e)){zr.add(e);for(let t of Is)e.addEventListener(t,Ns,{capture:t!=="context-request"})}}var qr=new WeakMap;function Gr(e,t){let r=JSON.stringify(t);qr.get(e)!==r&&(qr.set(e,r),Kt(e),N(e,t))}function Us(e,t){return Object.keys(e).length===0?e:{...fe[t],...e}}function Wr(e,t,r,n){let s=e.querySelector(".pane.current"),i=e.querySelector(".pane.candidate");s instanceof HTMLElement&&Gr(s,Dt(t,n)),i instanceof HTMLElement&&Gr(i,Us(pe(r,n),n))}function Xr(e,t){e.querySelectorAll(".cards > *").forEach(r=>{r.hass=t})}var Fs=$`
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
    background: var(--lovelace-background, var(--primary-background-color, #fafafa));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: scroll;
    color: var(--primary-text-color, #1c1c1c);
    font-family: var(--primary-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
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
`,Yr=[L,D,Fs];var Bs=2,Vs=98,Jr=2;function Zr(e,t){switch(e){case"ArrowLeft":case"ArrowDown":return ye(t-Jr);case"ArrowRight":case"ArrowUp":return ye(t+Jr);case"Home":return Bs;case"End":return Vs;default:return null}}function Qr(e){let t=e.currentTarget;typeof t.setPointerCapture=="function"&&t.setPointerCapture(e.pointerId)}function en(e){let t=e.currentTarget;typeof t.releasePointerCapture=="function"&&t.releasePointerCapture(e.pointerId)}async function tn(e,t,r){let n=window.hatsLite;if(!n)return u.trialUnavailable;try{return await n.startTrial(Ht(e),Ot(t,r)),""}catch{return u.trialFailed}}var rn=[".pane.current .cards",".pane.candidate .cards"],et=class extends w{constructor(){super(...arguments);this.showActions=!0;this.dashboards=[];this.dashboardUrl=null;this.views=[];this.viewIndex=0;this.cards=[];this.notice=u.loading;this.frame="desktop";this.density="normal";this.split=50;this.error="";this.trying=!1;this.defaultCompare=!0;this.defaultGenerated=!1;this.usingSample=!1;this.cache=new Map;this.dashboardsLoaded=!1;this.configToken=0;this.buildToken=0;this.dragging=!1}static{this.properties={hass:{attribute:!1},candidate:{attribute:!1},mode:{attribute:!1},showActions:{type:Boolean,attribute:"show-actions"},defaultCompare:{attribute:!1},dashboards:{state:!0},dashboardUrl:{state:!0},views:{state:!0},viewIndex:{state:!0},cards:{state:!0},notice:{state:!0},frame:{state:!0},density:{state:!0},split:{state:!0},error:{state:!0},trying:{state:!0},compare:{state:!0},defaultGenerated:{state:!0},usingSample:{state:!0}}}static{this.styles=Yr}updated(r){r.has("hass")&&this.hass&&!this.dashboardsLoaded&&this.loadDashboards(),this.attachHass(),this.applyVars(),r.has("cards")&&this.buildCards();let n=this.renderRoot.querySelector(".stage");n instanceof HTMLElement&&Kr(n)}comparing(){return this.compare??Nr(this.defaultCompare)}effectiveMode(){return this.mode??(this.hass?.themes?.darkMode?"dark":"light")}async loadDashboards(){let r=this.hass;if(!r)return;this.dashboardsLoaded=!0;try{this.dashboards=await Ut(r)}catch{this.dashboards=[{url_path:null,title:u.defaultDashboard}]}let n=++this.configToken;this.notice=u.loading;for(let d of this.dashboards){let a=await this.entryFor(d.url_path);if(n!==this.configToken)return;if(a.status==="ok"&&te(a.config)){this.dashboardUrl=d.url_path,this.applyEntry(a,d.url_path);return}}this.dashboardUrl=null;let s=[...this.cache.values()],i=Lr(r.states);if(i&&!s.every(d=>d.status==="error")){this.sample=i,this.useSample();return}let o=this.cache.get(we(null));o&&this.applyEntry(o,null)}async entryFor(r){let n=we(r),s=this.cache.get(n);if(s)return s;let i=this.hass,o=i?await Rr(i,r):{status:"error",reason:""};return this.cache.set(n,o),r===null&&o.status==="notfound"&&(this.defaultGenerated=!0),o}async showDashboard(r){let n=++this.configToken;this.cache.has(we(r))||(this.notice=u.loading);let i=await this.entryFor(r);n===this.configToken&&this.applyEntry(i,r)}applyEntry(r,n){let s=r.status!=="ok"||!te(r.config);if(this.sample&&n===null&&s){this.useSample();return}this.usingSample=!1,this.viewIndex=0,this.config=r.status==="ok"?r.config:void 0,r.status==="ok"?this.selectView():this.setState({views:[],cards:[],notice:Dr(r)})}useSample(){this.usingSample=!0,this.config=this.sample,this.viewIndex=0,this.selectView()}selectView(){this.setState(Hr(this.config,this.viewIndex))}setState(r){this.views=r.views,this.cards=r.cards,this.notice=r.notice}async buildCards(){let r=++this.buildToken,n=await jt(),s=await Promise.all(rn.map(()=>this.buildPane(n)));r===this.buildToken&&(rn.forEach((i,o)=>{let d=this.renderRoot.querySelector(i);d instanceof HTMLElement&&d.replaceChildren(...s[o])}),this.attachHass(!0))}buildPane(r){return Promise.all(this.cards.map(n=>zt(r,n)))}attachHass(r=!1){let n=this.hass;n&&(n!==this.readOnlySource&&(this.readOnlySource=n,this.readOnly=Sr(n),r=!0),r&&this.readOnly&&Xr(this.renderRoot,this.readOnly))}applyVars(){Wr(this.renderRoot,this.hass,this.candidate,this.effectiveMode())}onDashboard(r){let n=Number(r.target.value);this.dashboardUrl=this.dashboards[n]?.url_path??null,this.showDashboard(this.dashboardUrl)}onView(r){this.viewIndex=Number(r.target.value),this.selectView()}onKey(r){let n=Zr(r.key,this.split);n!==null&&(r.preventDefault(),this.split=n)}onPointerDown(r){Qr(r),this.dragging=!0}onPointerMove(r){if(!this.dragging)return;let n=this.renderRoot.querySelector(".stage");n instanceof HTMLElement&&(this.split=Ar(r.clientX,n.getBoundingClientRect()))}onPointerUp(r){this.dragging=!1,en(r)}onApply(){let r=this.candidate;!r||!Ue(r)||this.dispatchEvent(new CustomEvent("settheme",{detail:{theme:r.name,dark:this.effectiveMode()==="dark"},bubbles:!0,composed:!0}))}async onTry(){let r=this.candidate;!r||!r.installed||this.trying||(this.error="",this.trying=!0,this.error=await tn(this.hass,r,this.effectiveMode()),this.trying=!1)}setMode(r){this.mode=r,this.dispatchEvent(new CustomEvent(Yt,{detail:{mode:r},bubbles:!0,composed:!0}))}renderCandidateActions(){let r=this.candidate;return!this.showActions||!r?h:jr({applicable:Ue(r),installed:r.installed,trying:this.trying,collision:r.nameCollision?u.nameCollision.replace("{name}",r.name):"",repo:Nt(r.repoUrl),error:this.error},{onApply:()=>this.onApply(),onTry:()=>void this.onTry()})}renderStageView(){let r=this.candidate,n=this.effectiveMode(),s=r&&Object.keys(pe(r,n)).length===0?u.noModeBlock.replace("{mode}",u[n].toLowerCase()):"";return Vr({frame:this.frame,density:this.density,split:this.split,comparing:this.comparing()||!r,candidateName:r?r.name:u.noCandidate,note:s,title:Or(this.dashboards,this.dashboardUrl)},{onKey:i=>this.onKey(i),onPointerDown:i=>this.onPointerDown(i),onPointerMove:i=>this.onPointerMove(i),onPointerUp:i=>this.onPointerUp(i)})}render(){let r=this.views.length>0&&te(this.config);return l`
      ${Br({dashboards:this.dashboards,dashboardUrl:this.dashboardUrl,generatedDefault:this.defaultGenerated,views:this.views,viewIndex:this.viewIndex,showViews:r,frame:this.frame,density:this.density,mode:this.effectiveMode(),compare:this.comparing(),canCompare:!!this.candidate},{onDashboard:n=>this.onDashboard(n),onView:n=>this.onView(n),onFrame:n=>{this.frame=n},onDensity:n=>{this.density=n},onMode:n=>this.setMode(n),onCompare:()=>{this.candidate&&(this.compare=!this.comparing(),Ur(this.compare,this.defaultCompare))}})}
      ${this.usingSample?l`<p class="notice" role="status">${u.sampleNote}</p>`:h}
      ${this.notice?l`<p class="notice" role="status">${this.notice}</p>`:this.renderStageView()}
      ${this.renderCandidateActions()}
    `}};customElements.get("hats-lite-preview")||customElements.define("hats-lite-preview",et);function nt(e){return[1,3,5].map(t=>parseInt(e.slice(t,t+2),16))}function tt(e){return Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0")}function v(e){return`#${tt(e[0])}${tt(e[1])}${tt(e[2])}`}function k(e,t,r){return[0,1,2].map(n=>Math.round(e[n]*r+t[n]*(1-r)))}function rt(e){let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4}function nn(e){return .2126*rt(e[0])+.7152*rt(e[1])+.0722*rt(e[2])}function re(e,t){let[r,n]=[nn(e),nn(t)].sort((s,i)=>i-s);return(r+.05)/(n+.05)}var T=[255,255,255],K=[0,0,0];function st(e){return re(T,e)>=re(K,e)?T:K}function ne(e,t,r){let n=i=>t.every(o=>re(i,o)>=r);if(n(e))return e;let s=t.every(i=>re(T,i)>=re(K,i))?T:K;for(let i=1;i<=20;i+=1){let o=k(s,e,i/20);if(n(o))return o}return s}function it(e,t){return`rgba(${e[0]},${e[1]},${e[2]},${Number(t.toFixed(4))})`}var js=[15,17,21],zs=[27,30,36],Ks=[240,242,245],qs=[170,176,186],Gs=[20,23,27],Ws=[84,91,101];function sn(e,t,r){let n=nt(e),s=nt(t),i=r==="dark",o=i?k(n,js,.09):k(n,T,.055),d=i?k(n,zs,.1):k(n,T,.1),a=i?k(n,k(T,o,.05),.05):k(n,T,.025),p=[o,d,a],g=ne(k(n,i?Ks:Gs,.06),p,7),f=ne(k(n,i?qs:Ws,.1),p,4.5),y=st(n),x=i?k(n,[10,12,15],.07):k(n,T,.075),_=ne(n,[x],4.5);return{"primary-color":v(n),"accent-color":v(s),"primary-background-color":v(o),"secondary-background-color":v(d),"card-background-color":v(a),"primary-text-color":v(g),"secondary-text-color":v(f),"divider-color":it(i?T:K,.12),"app-header-background-color":v(n),"app-header-text-color":v(y),"text-primary-color":v(y),"switch-checked-color":v(s),"switch-checked-button-color":v(st(s)),"paper-slider-active-color":v(n),"state-icon-color":v(s),"sidebar-background-color":v(x),"sidebar-text-color":v(ne(g,[x],7)),"sidebar-selected-background-color":it(n,.18),"sidebar-selected-text-color":v(_),"sidebar-selected-icon-color":v(_)}}var Xs=/^#[0-9a-fA-F]{6}$/,Ys=/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/,Js=/^https:\/\/[^\s'"\\(){}<>;]+$/,Zs=/^\/local\/[^\s'"\\(){}<>;]*$/;function ot(e,t,r){return typeof e!="number"||!Number.isFinite(e)?t:Math.min(r,Math.max(t,e))}function Qs(e){return Number(e.toFixed(4))}function on(e){if(typeof e!="string"||!Xs.test(e))throw new Error("Invalid color");return e}function ei(e,t){if(typeof e!="string"||!(Ys.test(e)||Zs.test(e)||t&&Js.test(e)))throw new Error("Invalid background");return e}function xe(e){let t=on(e.main),r=on(e.accent),n=ot(e.radius,0,48),s=ot(e.blur,0,40),i=ot(e.tint,2,60),o=e.mode==="dark"?i/100:.4+i/50,d={...sn(t,r,e.mode),"primary-color":t,"accent-color":r,"ha-card-border-radius":`${n}px`,"ha-card-backdrop-filter":`blur(${s}px)`,"ha-card-background":`rgba(255,255,255,${Qs(o)})`},a=e.background;return a&&a.kind!=="none"&&(d["lovelace-background"]=`center / cover no-repeat fixed url('${ei(a.value,a.kind==="upload")}')`),d}var an=[L,D,$`
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
`];var m={colors:"Colors",glance:"At a glance",onDashboard:"On your dashboard",shape:"Shape and glass",draftName:"Designer draft",mainColor:"Main color",accentColor:"Accent color",radius:"Corner radius",blur:"Glass blur",tint:"Card tint",mode:"Mode",modeDark:"Dark",modeLight:"Light",background:"Background",backgroundNone:"None",uploadLabel:"Upload a background image",uploadHint:"PNG, JPEG, WebP or GIF, up to 8 MiB",uploading:"Uploading...",uploadAdminOnly:"Only administrators can upload backgrounds.",uploadTooLarge:"Pick an image up to 8 MiB.",uploadType:"Pick a PNG, JPEG, WebP or GIF image.",uploadFailed:"Upload failed. The previous background is kept.",invalidColor:"Pick a valid color",invalidBackground:"This background is not allowed",invalidInput:"Some values are not valid",saveTitle:"Save as theme",saveAdminOnly:"Only administrators can save themes.",nameLabel:"Theme name",nameInvalid:"Use 1 to 60 letters, digits, spaces, hyphens or underscores, starting with a letter or digit",saveButton:"Save as theme",saving:"Saving...",saved:"Theme saved",saveFailed:"Could not save the theme."};function at(e,t){if(e&&typeof e=="object"&&"message"in e){let r=e.message;if(typeof r=="string"&&r.length>0)return r}return t}function ln(e){return e.size>8388608?m.uploadTooLarge:Jt.includes(e.type)?null:m.uploadType}function ri(e,t){let r={method:"POST",body:t};if(typeof e.fetchWithAuth=="function")return e.fetchWithAuth(qe,r);let n=e.auth?.data?.access_token??"";return fetch(qe,{...r,headers:{Authorization:`Bearer ${n}`}})}async function dn(e,t){let r=new FormData;r.append("file",t);let n,s;try{n=await ri(e,r),s=await n.json().catch(()=>({}))}catch{return{error:m.uploadFailed}}if(!n.ok)return{error:at(s,m.uploadFailed)};let i=s.url;return typeof i!="string"?{error:m.uploadFailed}:{url:i}}var ni=[],si=["main","accent","radius","glassBlur","tint","mode","background"],ii=/^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/,cn={radius:{label:m.radius,min:0,max:48,unit:"px"},glassBlur:{label:m.blur,min:0,max:40,unit:"px"},tint:{label:m.tint,min:2,max:60,unit:"%"}};function pn(e){let t=e instanceof Error?e.message:"";return t==="Invalid color"?{field:"color",message:m.invalidColor}:t==="Invalid background"?{field:"background",message:m.invalidBackground}:{field:"color",message:m.invalidInput}}var lt=class extends w{constructor(){super(...arguments);this.dragOver=!1;this.main="#03a9f4";this.accent="#ff9800";this.radius=12;this.glassBlur=10;this.tint=20;this.mode="dark";this.background={kind:"none"};this.errorField="";this.errorMessage="";this.themeName="";this.uploading=!1;this.uploadError="";this.saving=!1;this.saveMessage="";this.saveFailed=!1}static{this.properties={hass:{attribute:!1},main:{state:!0},accent:{state:!0},radius:{state:!0},glassBlur:{state:!0},tint:{state:!0},mode:{state:!0},background:{state:!0},candidate:{state:!0},errorField:{state:!0},errorMessage:{state:!0},themeName:{state:!0},uploading:{state:!0},uploadError:{state:!0},saving:{state:!0},saveMessage:{state:!0},saveFailed:{state:!0},dragOver:{state:!0}}}static{this.styles=an}willUpdate(r){(!this.candidate||si.some(n=>r.has(n)))&&this.rebuild()}render(){let r=this.hass?.user?.is_admin===!0;return l`
      <div class="layout">
        <div class="controls">
          <section class="group">
            <h3>${m.colors}</h3>
            ${this.renderColor("main",m.mainColor)}
            ${this.renderColor("accent",m.accentColor)}
            ${this.errorField==="color"?l`<p class="error" role="alert">${this.errorMessage}</p>`:h}
          </section>
          <section class="group">
            <h3>${m.shape}</h3>
            ${Object.keys(cn).map(n=>this.renderSlider(n))}
          </section>
          <section class="group">
            <h3>${m.background}</h3>
            <div class="choices">
              <button type="button" class="chip-btn" data-action="background-none"
                aria-pressed=${String(this.background.kind==="none")}
                @click=${()=>this.setBackground({kind:"none"})}>${m.backgroundNone}</button>
              ${ni.map(n=>l`<button type="button" class="chip-btn"
                  aria-pressed=${String(this.background.kind==="preset"&&this.background.value===n.value)}
                  @click=${()=>this.setBackground({kind:"preset",value:n.value})}>${n.label}</button>`)}
            </div>
            ${this.errorField==="background"?l`<p class="error" role="alert">${this.errorMessage}</p>`:h}
            ${r?this.renderUpload():l`<p class="hint">${m.uploadAdminOnly}</p>`}
          </section>
          <section class="group">
            <h3>${m.mode}</h3>
            <div class="seg" role="group" aria-label=${m.mode}>
              ${["dark","light"].map(n=>l`<button type="button" data-field="mode" data-mode=${n}
                  aria-pressed=${String(this.mode===n)}
                  @click=${()=>this.setMode(n)}>${n==="dark"?m.modeDark:m.modeLight}</button>`)}
            </div>
          </section>
          ${r?this.renderSave():l`<p class="hint">${m.saveAdminOnly}</p>`}
        </div>
        <div class="stage">
          <h3>${m.glance}</h3>
          <div class="glance">
            <hats-lite-thumb .vars=${this.candidate?.vars??null} .mode=${this.mode}></hats-lite-thumb>
          </div>
          <h3>${m.onDashboard}</h3>
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
    `}renderColor(r,n){return l`
      <label class="color-row">
        <input type="color" data-field=${r} .value=${this[r]}
          @input=${s=>this.setText(r,s)} />
        <span class="color-text">
          <span>${n}</span>
          <span class="hex" data-readout=${r}>${this[r]}</span>
        </span>
      </label>
    `}renderSlider(r){let n=cn[r];return l`
      <label class="range">
        <span class="range-head">
          <span>${n.label}</span>
          <span class="range-value">${this[r]}${n.unit}</span>
        </span>
        <input type="range" min=${n.min} max=${n.max} step="1" data-field=${r}
          .value=${String(this[r])}
          @input=${s=>this.setNumber(r,s)} />
      </label>
    `}renderUpload(){return l`
      <button type="button" class=${this.dragOver?"drop over":"drop"} data-action="upload"
        ?disabled=${this.uploading}
        @click=${()=>this.fileInput()?.click()}
        @dragover=${r=>this.onDragOver(r)}
        @dragleave=${()=>{this.dragOver=!1}}
        @drop=${r=>this.onDrop(r)}>
        <span class="drop-title">${this.uploading?m.uploading:m.uploadLabel}</span>
        <span class="drop-hint">${m.uploadHint}</span>
      </button>
      <input class="visually-hidden" type="file" tabindex="-1" aria-hidden="true"
        accept="image/png,image/jpeg,image/webp,image/gif"
        ?disabled=${this.uploading}
        @change=${r=>this.onFile(r)} />
      ${this.uploadError?l`<p class="error" role="alert">${this.uploadError}</p>`:h}
    `}renderSave(){let r=this.saveFailed;return l`
      <div class="bar">
        <label>
          <span class="visually-hidden">${m.nameLabel}</span>
          <input type="text" maxlength="60" data-field="name" placeholder=${m.nameLabel}
            .value=${this.themeName}
            @input=${n=>this.setName(n)} />
        </label>
        <button type="button" class="btn primary" data-action="save" ?disabled=${this.saving}
          @click=${()=>this.onSave()}>
          ${this.saving?m.saving:m.saveButton}
        </button>
        ${this.saveMessage?l`<span class=${r?"chip warn message":"chip ok message"}
              role=${r?"alert":"status"}>${this.saveMessage}</span>`:h}
      </div>
    `}designerInput(r){return{main:this.main,accent:this.accent,radius:this.radius,blur:this.glassBlur,tint:this.tint,background:this.background,mode:r}}rebuild(){try{let r=xe(this.designerInput(this.mode));this.candidate={name:m.draftName,vars:r,installed:!1,canApply:!1},this.errorField="",this.errorMessage=""}catch(r){let n=pn(r);this.errorField=n.field,this.errorMessage=n.message}}buildModes(){try{return{dark:xe(this.designerInput("dark")),light:xe(this.designerInput("light"))}}catch(r){this.saveFailed=!0,this.saveMessage=pn(r).message;return}}setText(r,n){this[r]=n.target.value}setNumber(r,n){this[r]=Number(n.target.value)}onPreviewMode(r){let n=r.detail?.mode;(n==="dark"||n==="light")&&(this.mode=n)}setMode(r){this.mode=r}fileInput(){return this.renderRoot.querySelector('input[type="file"]')}onDragOver(r){r.preventDefault(),this.dragOver=!0}onDrop(r){r.preventDefault(),this.dragOver=!1;let n=r.dataTransfer?.files?.[0];n&&this.handleFile(n,null)}setBackground(r){this.background=r}setName(r){this.themeName=r.target.value}async onFile(r){let n=r.target,s=n.files?.[0];s&&await this.handleFile(s,n)}async handleFile(r,n){let s=this.hass;if(!s||this.uploading)return;let i=ln(r);if(i){this.uploadError=i,n&&(n.value="");return}this.uploading=!0,this.uploadError="";try{let o=await dn(s,r);"error"in o?this.uploadError=o.error:this.background={kind:"upload",value:o.url}}finally{this.uploading=!1,n&&(n.value="")}}async onSave(){let r=this.hass;if(!r)return;let n=this.themeName.trim();if(!ii.test(n)){this.saveFailed=!0,this.saveMessage=m.nameInvalid;return}let s=this.buildModes();if(s){this.saving=!0,this.saveMessage="";try{await Q(r,{type:"hats_lite/save_theme",name:n,variables:s.dark,modes:s}),this.dispatchEvent(new CustomEvent(Xt,{bubbles:!0,composed:!0,detail:{name:n}})),this.saveFailed=!1,this.saveMessage=m.saved}catch(i){this.saveFailed=!0,this.saveMessage=at(i,m.saveFailed)}finally{this.saving=!1}}}};customElements.get("hats-lite-designer")||customElements.define("hats-lite-designer",lt);function $e(e,t){if(!e||typeof e!="object")return"";let r=e[t];return typeof r=="string"?r:""}function un(e,t,r){if(!e||typeof e!="object")return"";let n=e,s=n.modes,i=r?["dark","light"]:["light","dark"];return $e(n,t)||$e(n.vars,t)||$e(s?.[i[0]],t)||$e(s?.[i[1]],t)}function hn(e){let t=e?.selectedTheme?.theme??e?.themes?.theme??"default",r=e?.themes?.themes,s=r&&Object.prototype.hasOwnProperty.call(r,t)?r[t]:void 0,i=e?.themes?.darkMode!==!1;return{name:t,primary:un(s,"primary-color",i),accent:un(s,"accent-color",i)}}var mn=[L,D,$`
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
`];var F={shell:{title:"Themes",tabs:{browse:"Gallery",preview:"Preview",designer:"Designer"},tabList:"HATS Lite sections",inUse:"In use",menu:"Open navigation menu",fileTheme:"Theme in file"},browse:c,preview:u,designer:m};var B=["browse","preview","designer"],oi=l`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`,dt=class extends w{constructor(){super(...arguments);this.narrow=!1;this.tab="browse";this.entry=null;this.fileThemes={};this.chosenName="";this.candidate=null;this.rendered=new Set(["browse"]);this.onTabKey=r=>{let n=B.indexOf(this.tab),s;switch(r.key){case"ArrowRight":s=(n+1)%B.length;break;case"ArrowLeft":s=(n-1+B.length)%B.length;break;case"Home":s=0;break;case"End":s=B.length-1;break;default:return}r.preventDefault();let i=B[s];this.select(i),this.focusTab(i)};this.onMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};this.onThemeSelected=r=>{let n=r.detail,s=Object.keys(n?.themes??{});s.length!==0&&(this.entry=n.entry,this.fileThemes=n.themes,this.setCandidate(s[0]),this.select("preview"),this.focusTab("preview"))};this.onFileThemeChange=r=>{this.setCandidate(r.target.value)};this.onThemeSaved=r=>{let n=r.detail;if(typeof n?.name!="string")return;let s=this.hass?.themes?.darkMode;this.dispatchEvent(new CustomEvent("settheme",{bubbles:!0,composed:!0,detail:s===void 0?{theme:n.name}:{theme:n.name,dark:s}})),this.select("preview")}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0},entry:{state:!0},fileThemes:{state:!0},chosenName:{state:!0},candidate:{state:!0}}}static{this.styles=mn}tabId(r){return`tab-${r}`}panelId(r){return`panel-${r}`}select(r){this.rendered.add(r),this.tab=r}async focusTab(r){await this.updateComplete,this.renderRoot.querySelector(`#${this.tabId(r)}`)?.focus()}setCandidate(r){if(!this.entry)return;let n=this.fileThemes[r];if(!n)return;let s=U(n),i=this.hass?.themes?.darkMode?"dark":"light",o=Object.prototype.hasOwnProperty.call(this.hass?.themes?.themes??{},r);this.chosenName=r,this.candidate={name:r,vars:R(s,i),entry:s,installed:o,nameCollision:o&&!this.entry.installed,repoUrl:It(this.entry.full_name),canApply:o}}renderTabs(){return l`
      <nav class="tabs seg" role="tablist" aria-label=${F.shell.tabList} @keydown=${this.onTabKey}>
        ${B.map(r=>{let n=this.tab===r;return l`
            <button
              type="button"
              role="tab"
              id=${this.tabId(r)}
              aria-controls=${this.panelId(r)}
              aria-selected=${n?"true":"false"}
              tabindex=${n?"0":"-1"}
              @click=${()=>this.select(r)}
            >
              ${F.shell.tabs[r]}
            </button>
          `})}
      </nav>
    `}renderInUse(){let r=hn(this.hass),n=s=>s?l`<i style=${M({background:s})}></i>`:l`<i class="neutral"></i>`;return l`
      <span class="chip in-use">
        <span class="label">${F.shell.inUse}</span>
        <span class="name">${r.name}</span>
        <span class="swatches" aria-hidden="true">${n(r.primary)}${n(r.accent)}</span>
      </span>
    `}renderFileThemes(){let r=Object.keys(this.fileThemes);return r.length<2?h:l`
      <label class="file-theme">
        ${F.shell.fileTheme}
        <select @change=${this.onFileThemeChange}>
          ${r.map(n=>l`<option value=${n} ?selected=${n===this.chosenName}>${n}</option>`)}
        </select>
      </label>
    `}render(){return l`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${this.narrow?l`<button class="menu" type="button" aria-label=${F.shell.menu} @click=${this.onMenu}>${oi}</button>`:h}
          <h1 class="title">${F.shell.title}</h1>
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
          <hats-lite-browse .hass=${this.hass}></hats-lite-browse>
        </section>
        <section
          class="panel"
          id=${this.panelId("preview")}
          role="tabpanel"
          aria-labelledby=${this.tabId("preview")}
          tabindex="-1"
          ?hidden=${this.tab!=="preview"}
        >
          ${this.rendered.has("preview")?l`${this.renderFileThemes()}
              <hats-lite-preview .hass=${this.hass} .candidate=${this.candidate}></hats-lite-preview>`:h}
        </section>
        <section
          class="panel"
          id=${this.panelId("designer")}
          role="tabpanel"
          aria-labelledby=${this.tabId("designer")}
          tabindex="-1"
          ?hidden=${this.tab!=="designer"}
        >
          ${this.rendered.has("designer")?l`<hats-lite-designer .hass=${this.hass}></hats-lite-designer>`:h}
        </section>
      </main>
      </div>
    `}};customElements.get("hats-lite-panel")||customElements.define("hats-lite-panel",dt);export{dt as HatsLitePanel};

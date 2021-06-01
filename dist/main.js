/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/preact-devtools/dist/preact-devtools.module.js":
/*!*********************************************************************!*\
  !*** ./node_modules/preact-devtools/dist/preact-devtools.module.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "attach": () => (/* binding */ attach),
/* harmony export */   "createRenderer": () => (/* binding */ createRenderer),
/* harmony export */   "renderDevtools": () => (/* binding */ renderDevtools)
/* harmony export */ });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.module.js");


/**
 * The string table holds a mapping of strings to ids. This saves a lot of space
 * in messaging because we can only need to declare a string once and can later
 * refer to its id. This is especially true for component or element names which
 * expectedoccur multiple times.
 */
/**
 * Convert a string to an id. Works similar to a gzip dictionary.
 */
function getStringId(table, input) {
    if (input === null)
        return 0;
    if (!table.has(input)) {
        table.set(input, table.size + 1);
    }
    return table.get(input);
}
/**
 * Convert string table to something the extension understands
 * @param {import('./devtools').AdapterState["stringTable"]} table
 * @returns {number[]}
 */
function flushTable(table) {
    let ops = [0];
    table.forEach((_, k) => {
        ops[0] += k.length + 1;
        ops.push(k.length, ...encode(k));
    });
    return ops;
}
// TODO: Use a proper LRU cache?
const encoded = new Map();
const toCodePoint = (s) => s.codePointAt(0) || 124; // "|"" symbol;
/**
 * Convert a string to an array of codepoints
 */
function encode(input) {
    if (!encoded.has(input)) {
        encoded.set(input, input.split("").map(toCodePoint));
    }
    return encoded.get(input);
}

// Mangle accessors
/**
 * Get the direct parent of a `vnode`
 */
function getVNodeParent(vnode) {
    return vnode._parent || vnode.__p || null;
}
/**
 * Check if a `vnode` is the root of a tree
 */
function isRoot(vnode) {
    // TODO: This may break with bundling due to a different
    // reference to `Fragment`
    return getVNodeParent(vnode) == null && vnode.type === preact__WEBPACK_IMPORTED_MODULE_0__.Fragment;
}
/**
 * Return the component instance of a `vnode`
 */
function getComponent(vnode) {
    return vnode._component || vnode.__c || null;
}
/**
 * Get a `vnode`'s _dom reference.
 */
function getDom(vnode) {
    return vnode._dom || vnode.__e || null;
}
/**
 * Get the last dom child of a `vnode`
 */
function getLastDomChild(vnode) {
    return vnode._lastDomChild || vnode.__z || null;
}
/**
 * Check if a `vnode` represents a `Suspense` component
 */
function isSuspenseVNode(vnode) {
    const c = getComponent(vnode);
    // FIXME: Mangling of `_childDidSuspend` is not stable in Preact
    return c != null && c._childDidSuspend;
}
/**
 * Get the internal hooks state of a component
 */
function getComponentHooks(c) {
    return c.__hooks || c.__H || null;
}
/**
 * Get teh diffed children of a `vnode`
 */
function getActualChildren(vnode) {
    return vnode._children || vnode.__k || [];
}
// End Mangle accessors
/**
 * Get the root of a `vnode`
 */
function findRoot(vnode) {
    let next = vnode;
    while ((next = getVNodeParent(next)) != null) {
        if (isRoot(next)) {
            return next;
        }
    }
    return vnode;
}
/**
 * Get the ancestor component that rendered the current vnode
 */
function getAncestor(vnode) {
    let next = vnode;
    while ((next = getVNodeParent(next)) != null) {
        return next;
    }
    return null;
}
/**
 * Get human readable name of the component/dom element
 */
function getDisplayName(vnode) {
    if (vnode.type === preact__WEBPACK_IMPORTED_MODULE_0__.Fragment)
        return "Fragment";
    else if (typeof vnode.type === "function")
        return vnode.type.displayName || vnode.type.name;
    else if (typeof vnode.type === "string")
        return vnode.type;
    return "#text";
}

var MsgTypes;
(function (MsgTypes) {
    MsgTypes[MsgTypes["ADD_ROOT"] = 1] = "ADD_ROOT";
    MsgTypes[MsgTypes["ADD_VNODE"] = 2] = "ADD_VNODE";
    MsgTypes[MsgTypes["REMOVE_VNODE"] = 3] = "REMOVE_VNODE";
    MsgTypes[MsgTypes["UPDATE_VNODE_TIMINGS"] = 4] = "UPDATE_VNODE_TIMINGS";
})(MsgTypes || (MsgTypes = {}));
/**
 * Collect all relevant data from a commit and convert it to a message
 * the detools can understand
 */
function flush(commit) {
    const { rootId, unmountIds, operations, strings } = commit;
    if (unmountIds.length === 0 && operations.length === 0)
        return;
    let msg = [rootId, ...flushTable(strings)];
    if (unmountIds.length > 0) {
        msg.push(MsgTypes.REMOVE_VNODE, unmountIds.length, ...unmountIds);
    }
    msg.push(...operations);
    return { name: "operation", data: msg };
}
function jsonify(data) {
    if (isVNode(data)) {
        return {
            type: "vnode",
            name: getDisplayName(data),
        };
    }
    switch (typeof data) {
        case "string":
            return data.length > 300 ? data.slice(300) : data;
        case "function": {
            return {
                type: "function",
                name: data.displayName || data.name,
            };
        }
        case "object":
            if (data == null)
                return null;
            const out = { ...data };
            Object.keys(out).forEach(key => {
                out[key] = jsonify(out[key]);
            });
            return out;
        default:
            return data;
    }
}
function cleanProps(props) {
    if (typeof props === "string" || !props)
        return null;
    const out = { ...props };
    delete out.children;
    if (!Object.keys(out).length)
        return null;
    console.log("props", out, props);
    return out;
}
function isVNode(x) {
    return x != null && x.type !== undefined && x._dom !== undefined;
}

/**
 * VNode relationships are encoded as simple numbers for the devtools. We use
 * this function to keep track of existing id's and create new ones if needed.
 */
function createIdMapper() {
    const vnodeToId = new WeakMap();
    const idToVNode = new Map();
    // Must never be 0, otherwise an infinite loop will be trigger inside
    // the devtools extension ¯\_(ツ)_/¯
    let uuid = 1;
    const getVNode = (id) => idToVNode.get(id) || null;
    const hasId = (vnode) => {
        if (vnode != null) {
            if (vnodeToId.has(vnode))
                return true;
            // if (vnode.old != null) return vnodeToId.has(vnode.old);
        }
        return false;
    };
    const getId = (vnode) => {
        let id = -1;
        if (!vnodeToId.has(vnode)) ;
        return id;
    };
    const remove = (vnode) => {
        if (hasId(vnode)) {
            const id = getId(vnode);
            idToVNode.delete(id);
        }
        vnodeToId.delete(vnode);
    };
    const createId = (vnode) => {
        const id = uuid++;
        vnodeToId.set(vnode, id);
        idToVNode.set(id, vnode);
        return id;
    };
    const has = (id) => idToVNode.has(id);
    return { has, getVNode, hasId, createId, getId, remove };
}

var Elements;
(function (Elements) {
    Elements[Elements["HTML_ELEMENT"] = 1] = "HTML_ELEMENT";
    Elements[Elements["CLASS_COMPONENT"] = 2] = "CLASS_COMPONENT";
    Elements[Elements["FUNCTION_COMPONENT"] = 3] = "FUNCTION_COMPONENT";
    Elements[Elements["FORWARD_REF"] = 4] = "FORWARD_REF";
    Elements[Elements["MEMO"] = 5] = "MEMO";
    Elements[Elements["SUSPENSE"] = 6] = "SUSPENSE";
})(Elements || (Elements = {}));
let memoReg = /^Memo\(/;
let forwardRefReg = /^ForwardRef\(/;
/**
 * Get the type of a vnode. The devtools uses these constants to differentiate
 * between the various forms of components.
 */
function getDevtoolsType(vnode) {
    if (typeof vnode.type == "function" && vnode.type !== preact__WEBPACK_IMPORTED_MODULE_0__.Fragment) {
        const name = vnode.type.displayName || "";
        if (memoReg.test(name))
            return Elements.MEMO;
        if (forwardRefReg.test(name))
            return Elements.FORWARD_REF;
        if (isSuspenseVNode(vnode))
            return Elements.SUSPENSE;
        // TODO: Provider and Consumer
        return vnode.type.prototype && vnode.type.prototype.render
            ? Elements.CLASS_COMPONENT
            : Elements.FUNCTION_COMPONENT;
    }
    return Elements.HTML_ELEMENT;
}
function createRenderer(hook) {
    const ids = createIdMapper();
    const roots = new Set();
    /** Queue events until the extension is connected */
    let queue = [];
    return {
        getVNodeById: id => ids.getVNode(id),
        has: id => ids.has(id),
        log(id) {
            const vnode = ids.getVNode(id);
            if (vnode == null) {
                console.warn(`Could not find vnode with id ${id}`);
                return;
            }
            logVNode(vnode, id);
        },
        inspect(id) {
            const vnode = ids.getVNode(id);
            if (!vnode)
                return null;
            const hasState = typeof vnode.type === "function" && vnode.type !== preact__WEBPACK_IMPORTED_MODULE_0__.Fragment;
            const c = getComponent(vnode);
            const hasHooks = c != null && getComponentHooks(c) != null;
            return {
                context: null,
                canEditHooks: hasHooks,
                hooks: null,
                id,
                name: getDisplayName(vnode),
                canEditProps: true,
                props: vnode.type !== null ? jsonify(cleanProps(vnode.props)) : null,
                canEditState: false,
                state: hasState && Object.keys(c.state).length > 0
                    ? jsonify(c.state)
                    : null,
                type: 2,
            };
        },
        findDomForVNode(id) {
            const vnode = ids.getVNode(id);
            return vnode ? [getDom(vnode), getLastDomChild(vnode)] : null;
        },
        flushInitial() {
            queue.forEach(ev => hook.emit(ev.name, ev.data));
            hook.connected = true;
            queue = [];
        },
        onCommit(vnode) {
            const commit = createCommit(ids, roots, vnode);
            const ev = flush(commit);
            if (!ev)
                return;
            if (hook.connected) {
                hook.emit(ev.name, ev.data);
            }
            else {
                queue.push(ev);
            }
        },
        onUnmount(vnode) {
            console.log("TODO: Unmount vnode");
        },
    };
}
/**
 * Print an element to console
 */
function logVNode(vnode, id) {
    const display = getDisplayName(vnode);
    const name = display === "#text" ? display : `<${display || "Component"} />`;
    /* eslint-disable no-console */
    console.group(`LOG %c${name}`, "color: #ea88fd; font-weight: normal");
    console.log("props:", vnode.props);
    const c = getComponent(vnode);
    if (c != null) {
        console.log("state:", c.state);
    }
    console.log("vnode:", vnode);
    console.log("devtools id:", id);
    console.groupEnd();
    /* eslint-enable no-console */
}
function createCommit(ids, roots, vnode) {
    const commit = {
        operations: [],
        rootId: -1,
        strings: new Map(),
        unmountIds: [],
    };
    let parentId = -1;
    const isNew = !ids.hasId(vnode);
    if (isRoot(vnode)) {
        const rootId = ids.hasId(vnode) ? ids.getId(vnode) : ids.createId(vnode);
        parentId = commit.rootId = rootId;
        roots.add(vnode);
    }
    else {
        const root = findRoot(vnode);
        commit.rootId = ids.getId(root);
        parentId = ids.getId(getAncestor(vnode));
    }
    if (isNew) {
        mount(ids, commit, vnode, parentId);
    }
    else {
        console.log("UPDATE", ids.getId(vnode));
    }
    return commit;
}
function mount(ids, commit, vnode, ancestorId) {
    const id = ids.createId(vnode);
    if (isRoot(vnode)) {
        commit.operations.push(MsgTypes.ADD_ROOT, id);
    }
    commit.operations.push(MsgTypes.ADD_VNODE, id, getDevtoolsType(vnode), // Type
    ancestorId, 9999, // owner
    getStringId(commit.strings, getDisplayName(vnode)), vnode.key ? getStringId(commit.strings, vnode.key) : 0);
    const children = getActualChildren(vnode);
    for (let i = 0; i < children.length; i++) {
        if (children[i] !== null) {
            mount(ids, commit, children[i], id);
        }
    }
}

var n,l,u,t,i,r={},f=[],o=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;function e(n,l){for(var u in l)n[u]=l[u];return n}function c(n){var l=n.parentNode;l&&l.removeChild(n);}function s(n,l,u){var t,i,r,f,o=arguments;if(l=e({},l),arguments.length>3)for(u=[u],t=3;t<arguments.length;t++)u.push(o[t]);if(null!=u&&(l.children=u),null!=n&&null!=n.defaultProps)for(i in n.defaultProps)void 0===l[i]&&(l[i]=n.defaultProps[i]);return f=l.key,null!=(r=l.ref)&&delete l.ref,null!=f&&delete l.key,a(n,l,f,r)}function a(l,u,t,i){var r={type:l,props:u,key:t,ref:i,__k:null,__p:null,__b:0,__e:null,l:null,__c:null,constructor:void 0};return n.vnode&&n.vnode(r),r}function v(n){return n.children}function p(n){if(null==n||"boolean"==typeof n)return null;if("string"==typeof n||"number"==typeof n)return a(null,n,null,null);if(null!=n.__e||null!=n.__c){var l=a(n.type,n.props,n.key,null);return l.__e=n.__e,l}return n}function y(n,l){this.props=n,this.context=l;}function d(n,l){if(null==l)return n.__p?d(n.__p,n.__p.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?d(n):null}function m(n){var l,u;if(null!=(n=n.__p)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return m(n)}}function w(t){!t.__d&&(t.__d=!0)&&1===l.push(t)&&(n.debounceRendering||u)(g);}function g(){var n;for(l.sort(function(n,l){return l.__v.__b-n.__v.__b});n=l.pop();)n.__d&&n.forceUpdate(!1);}function k(n,l,u,t,i,o,e,s,a){var h,v,y,m,w,g,k,b,x=l.__k||_(l.props.children,l.__k=[],p,!0),C=u&&u.__k||f,P=C.length;for(s==r&&(s=null!=o?o[0]:P?d(u,0):null),v=0;v<x.length;v++)if(null!=(h=x[v]=p(x[v]))){if(h.__p=l,h.__b=l.__b+1,null===(m=C[v])||m&&h.key==m.key&&h.type===m.type)C[v]=void 0;else for(y=0;y<P;y++){if((m=C[y])&&h.key==m.key&&h.type===m.type){C[y]=void 0;break}m=null;}if(w=N(n,h,m=m||r,t,i,o,e,null,s,a),(y=h.ref)&&m.ref!=y&&(b||(b=[])).push(y,h.__c||w,h),null!=w){if(null==k&&(k=w),null!=h.l)w=h.l,h.l=null;else if(o==m||w!=s||null==w.parentNode)n:if(null==s||s.parentNode!==n)n.appendChild(w);else{for(g=s,y=0;(g=g.nextSibling)&&y<P;y+=2)if(g==w)break n;n.insertBefore(w,s);}s=w.nextSibling,"function"==typeof l.type&&(l.l=w);}}if(l.__e=k,null!=o&&"function"!=typeof l.type)for(v=o.length;v--;)null!=o[v]&&c(o[v]);for(v=P;v--;)null!=C[v]&&z(C[v],C[v]);if(b)for(v=0;v<b.length;v++)j(b[v],b[++v],b[++v]);}function _(n,l,u,t){if(null==l&&(l=[]),null==n||"boolean"==typeof n)t&&l.push(null);else if(Array.isArray(n))for(var i=0;i<n.length;i++)_(n[i],l,u,t);else l.push(u?u(n):n);return l}function b(n,l,u,t,i){var r;for(r in u)r in l||C(n,r,null,u[r],t);for(r in l)i&&"function"!=typeof l[r]||"value"===r||"checked"===r||u[r]===l[r]||C(n,r,l[r],u[r],t);}function x(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]="number"==typeof u&&!1===o.test(l)?u+"px":u;}function C(n,l,u,t,i){var r,f,o,e,c;if("key"===(l=i?"className"===l?"class":l:"class"===l?"className":l)||"children"===l);else if("style"===l)if(r=n.style,"string"==typeof u)r.cssText=u;else{if("string"==typeof t&&(r.cssText="",t=null),t)for(f in t)u&&f in u||x(r,f,"");if(u)for(o in u)t&&u[o]===t[o]||x(r,o,u[o]);}else if("o"===l[0]&&"n"===l[1])e=l!==(l=l.replace(/Capture$/,"")),c=l.toLowerCase(),l=(c in n?c:l).slice(2),u?(t||n.addEventListener(l,P,e),(n.u||(n.u={}))[l]=u):n.removeEventListener(l,P,e);else if("list"!==l&&"tagName"!==l&&!i&&l in n)if(n.length&&"value"==l)for(l=n.length;l--;)n.options[l].selected=n.options[l].value==u;else n[l]=null==u?"":u;else"function"!=typeof u&&"dangerouslySetInnerHTML"!==l&&(l!==(l=l.replace(/^xlink:?/,""))?null==u||!1===u?n.removeAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase()):n.setAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase(),u):null==u||!1===u?n.removeAttribute(l):n.setAttribute(l,u));}function P(l){return this.u[l.type](n.event?n.event(l):l)}function N(l,u,t,i,r,f,o,c,s,a){var h,d,m,w,g,b,x,C,P,N,T=u.type;if(void 0!==u.constructor)return null;(h=n.__b)&&h(u);try{n:if("function"==typeof T){if(C=u.props,P=(h=T.contextType)&&i[h.__c],N=h?P?P.props.value:h.__p:i,t.__c?x=(d=u.__c=t.__c).__p=d.__E:(T.prototype&&T.prototype.render?u.__c=d=new T(C,N):(u.__c=d=new y(C,N),d.constructor=T,d.render=A),P&&P.sub(d),d.props=C,d.state||(d.state={}),d.context=N,d.__n=i,m=d.__d=!0,d.__h=[]),null==d.__s&&(d.__s=d.state),null!=T.getDerivedStateFromProps&&e(d.__s==d.state?d.__s=e({},d.__s):d.__s,T.getDerivedStateFromProps(C,d.__s)),m)null==T.getDerivedStateFromProps&&null!=d.componentWillMount&&d.componentWillMount(),null!=d.componentDidMount&&o.push(d);else{if(null==T.getDerivedStateFromProps&&null==c&&null!=d.componentWillReceiveProps&&d.componentWillReceiveProps(C,N),!c&&null!=d.shouldComponentUpdate&&!1===d.shouldComponentUpdate(C,d.__s,N)){d.props=C,d.state=d.__s,d.__d=!1,d.__v=u,u.__e=t.__e,u.__k=t.__k;break n}null!=d.componentWillUpdate&&d.componentWillUpdate(C,d.__s,N);}for(w=d.props,g=d.state,d.context=N,d.props=C,d.state=d.__s,(h=n.__r)&&h(u),d.__d=!1,d.__v=u,d.__P=l,_(null!=(h=d.render(d.props,d.state,d.context))&&h.type==v&&null==h.key?h.props.children:h,u.__k=[],p,!0),null!=d.getChildContext&&(i=e(e({},i),d.getChildContext())),m||null==d.getSnapshotBeforeUpdate||(b=d.getSnapshotBeforeUpdate(w,g)),k(l,u,t,i,r,f,o,s,a),d.base=u.__e;h=d.__h.pop();)h.call(d);m||null==w||null==d.componentDidUpdate||d.componentDidUpdate(w,g,b),x&&(d.__E=d.__p=null);}else u.__e=$(t.__e,u,t,i,r,f,o,a);(h=n.diffed)&&h(u);}catch(l){n.__e(l,u,t);}return u.__e}function T(l,u){for(var t;t=l.pop();)try{t.componentDidMount();}catch(l){n.__e(l,t.__v);}n.__c&&n.__c(u);}function $(n,l,u,t,i,o,e,c){var s,a,h,v,p=u.props,y=l.props;if(i="svg"===l.type||i,null==n&&null!=o)for(s=0;s<o.length;s++)if(null!=(a=o[s])&&(null===l.type?3===a.nodeType:a.localName===l.type)){n=a,o[s]=null;break}if(null==n){if(null===l.type)return document.createTextNode(y);n=i?document.createElementNS("http://www.w3.org/2000/svg",l.type):document.createElement(l.type),o=null;}return null===l.type?p!==y&&(n.data=y):l!==u&&(null!=o&&(o=f.slice.call(n.childNodes)),h=(p=u.props||r).dangerouslySetInnerHTML,v=y.dangerouslySetInnerHTML,c||(v||h)&&(v&&h&&v.__html==h.__html||(n.innerHTML=v&&v.__html||"")),b(n,y,p,i,c),v||k(n,l,u,t,"foreignObject"!==l.type&&i,o,e,r,c),c||("value"in y&&void 0!==y.value&&y.value!==n.value&&(n.value=null==y.value?"":y.value),"checked"in y&&void 0!==y.checked&&y.checked!==n.checked&&(n.checked=y.checked))),n}function j(l,u,t){try{"function"==typeof l?l(u):l.current=u;}catch(l){n.__e(l,t);}}function z(l,u,t){var i,r,f;if(n.unmount&&n.unmount(l),(i=l.ref)&&j(i,null,u),t||"function"==typeof l.type||(t=null!=(r=l.__e)),l.__e=l.l=null,null!=(i=l.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount();}catch(l){n.__e(l,u);}i.base=i.__P=null;}if(i=l.__k)for(f=0;f<i.length;f++)i[f]&&z(i[f],u,t);null!=r&&c(r);}function A(n,l,u){return this.constructor(n,u)}function D(l,u,i){var o,e,c;n.__p&&n.__p(l,u),e=(o=i===t)?null:i&&i.__k||u.__k,l=s(v,null,[l]),c=[],N(u,o?u.__k=l:(i||u).__k=l,e||r,r,void 0!==u.ownerSVGElement,i&&!o?[i]:e?null:f.slice.call(u.childNodes),c,!1,i||r,o),T(c,l);}function L(n){var l={},u={__c:"__cC"+i++,__p:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var t,i=this;return this.getChildContext||(t=[],this.getChildContext=function(){return l[u.__c]=i,l},this.shouldComponentUpdate=function(n){t.some(function(l){l.__P&&(l.context=n.value,w(l));});},this.sub=function(n){t.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){t.splice(t.indexOf(n),1),l&&l.call(n);};}),n.children}};return u.Consumer.contextType=u,u}n={},y.prototype.setState=function(n,l){var u=this.__s!==this.state&&this.__s||(this.__s=e({},this.state));("function"!=typeof n||(n=n(u,this.props)))&&e(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),w(this));},y.prototype.forceUpdate=function(n){var l,u,t,i=this.__v,r=this.__v.__e,f=this.__P;f&&(l=!1!==n,u=[],t=N(f,i,e({},i),this.__n,void 0!==f.ownerSVGElement,null,u,l,null==r?d(i):r),T(u,i),t!=r&&m(i)),n&&n();},y.prototype.render=v,l=[],u="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,n.__e=function(n,l,u){for(var t;l=l.__p;)if((t=l.__c)&&!t.__p)try{if(t.constructor&&null!=t.constructor.getDerivedStateFromError)t.setState(t.constructor.getDerivedStateFromError(n));else{if(null==t.componentDidCatch)continue;t.componentDidCatch(n);}return w(t.__E=t)}catch(l){n=l;}throw n},t=r,i=0;

var t$1,r$1,u$1=[],i$1=n.__r;n.__r=function(n){i$1&&i$1(n),t$1=0,(r$1=n.__c).__H&&(r$1.__H.t=w$1(r$1.__H.t));};var o$1=n.diffed;n.diffed=function(n){o$1&&o$1(n);var t=n.__c;if(t){var r=t.__H;r&&(r.u=w$1(r.u));}};var f$1=n.unmount;function c$1(t){n.__h&&n.__h(r$1);var u=r$1.__H||(r$1.__H={i:[],t:[],u:[]});return t>=u.i.length&&u.i.push({}),u.i[t]}function e$1(n){return a$1(q,n)}function a$1(n,u,i){var o=c$1(t$1++);return o.__c||(o.__c=r$1,o.o=[i?i(u):q(null,u),function(t){var r=n(o.o[0],t);o.o[0]!==r&&(o.o[0]=r,o.__c.setState({}));}]),o.o}function v$1(n,u){var i=c$1(t$1++);F(i.v,u)&&(i.o=n,i.v=u,r$1.__H.t.push(i),_$1(r$1));}function y$1(n){var u=r$1.context[n.__c];if(!u)return n.__p;var i=c$1(t$1++);return null==i.o&&(i.o=!0,u.sub(r$1)),u.props.value}n.unmount=function(n){f$1&&f$1(n);var t=n.__c;if(t){var r=t.__H;r&&r.i.forEach(function(n){return n.p&&n.p()});}};var _$1=function(){};function g$1(){u$1.some(function(n){n.l=!1,n.__P&&(n.__H.t=w$1(n.__H.t));}),u$1=[];}function w$1(n){return n.forEach(A$1),n.forEach(E),[]}function A$1(n){n.p&&n.p();}function E(n){var t=n.o();"function"==typeof t&&(n.p=t);}function F(n,t){return !n||t.some(function(t,r){return t!==n[r]})}function q(n,t){return "function"==typeof t?t(n):t}"undefined"!=typeof window&&(_$1=function(t){!t.l&&(t.l=!0)&&1===u$1.push(t)&&(n.requestAnimationFrame||function(n){var t=function(){clearTimeout(r),cancelAnimationFrame(u),setTimeout(n);},r=setTimeout(t,100),u=requestAnimationFrame(t);})(g$1);});

// TODO: This is fine for an MVP but not a goid choice for production due to
// missing features like proper unsubscription handling
function valoo(v) {
    const cb = [];
    function value(c) {
        if (arguments.length)
            cb.map(f => {
                f && f((v = c));
            });
        return v;
    }
    value.on = (c) => {
        const i = cb.push(c) - 1;
        return () => {
            cb[i] = 0;
        };
    };
    return value;
}
function track(fn, subs) {
    let v = subs.map(x => x());
    let out = valoo(fn());
    subs.forEach(x => {
        x.on(n => {
            const idx = subs.indexOf(x);
            v[idx] = n;
            out(fn());
        });
    });
    return out;
}
// export function proxify<T extends object>(obj: T): T {
// 	for (const key in obj) {
//     const desc = Object.getOwnPropertyDescriptor(obj, key)!;
//     if (desc.get) {
//       const fn = desc.get;
//       Object.defineProperty(obj, key, {
//         get() {
//           return fn
//         }
//       })
//       // computed
//     }
//     else if (typeof obj[key] !== "function") {
//     }
//   }
// }

var DevNodeType;
(function (DevNodeType) {
    DevNodeType[DevNodeType["FunctionComponent"] = 0] = "FunctionComponent";
    DevNodeType[DevNodeType["ClassComponent"] = 1] = "ClassComponent";
    DevNodeType[DevNodeType["Element"] = 2] = "Element";
    DevNodeType[DevNodeType["ForwardRef"] = 3] = "ForwardRef";
    DevNodeType[DevNodeType["Memo"] = 4] = "Memo";
    DevNodeType[DevNodeType["Context"] = 5] = "Context";
    DevNodeType[DevNodeType["Consumer"] = 6] = "Consumer";
    DevNodeType[DevNodeType["Suspense"] = 7] = "Suspense";
})(DevNodeType || (DevNodeType = {}));
const EMPTY_INSPECT = {
    context: null,
    hooks: null,
    canEditState: false,
    canEditHooks: false,
    canEditProps: false,
    id: -1,
    name: ".",
    props: null,
    state: null,
    type: 2,
};
function createStore() {
    let listeners = [];
    const notify = (name, data) => {
        listeners.forEach(fn => fn && fn(name, data));
    };
    const nodes = valoo(new Map());
    const roots = valoo([]);
    const rootToChild = valoo(new Map());
    // Selection
    const selectedNode = valoo(null);
    const selectedRef = valoo(null);
    // Toggle
    const collapsed = valoo(new Set());
    const hidden = track(() => {
        const out = new Set();
        collapsed().forEach(id => getAllChildren(nodes(), id).forEach(child => out.add(child)));
        return out;
    }, [collapsed, nodes]);
    const inspectData = valoo(EMPTY_INSPECT);
    return {
        inspectData,
        roots,
        rootToChild,
        nodes,
        selected: selectedNode,
        selectedRef,
        visiblity: {
            collapsed,
            hidden,
        },
        actions: {
            collapseNode: id => {
                if (!collapsed().has(id)) {
                    collapsed().add(id);
                }
                else {
                    collapsed().delete(id);
                }
                collapsed(collapsed());
            },
            selectNode: (id, ref) => {
                if (selectedNode() !== null) {
                    if (selectedNode().id === id)
                        return;
                    selectedNode().selected(false);
                }
                const node = nodes().get(id);
                node.selected(true);
                selectedRef(ref);
                selectedNode(node);
                notify("inspect", id);
            },
            highlightNode: id => {
                notify("highlight", id);
            },
            logNode: id => {
                notify("log", id);
            },
            updateNode(id, type, path, value) {
                notify("update-node", { id, type, path, value });
                notify("inspect", id);
            },
            clear() {
                inspectData(EMPTY_INSPECT);
                nodes(new Map());
                roots([]);
                rootToChild(new Map());
                selectedNode(null);
                selectedRef(null);
                collapsed(new Set());
                listeners = [];
            },
        },
        subscribe(fn) {
            const idx = listeners.push(fn);
            return () => (listeners[idx] = null);
        },
    };
}
function getAllChildren(tree, id) {
    const out = [];
    const visited = new Set();
    let item;
    let stack = [id];
    while ((item = stack.pop())) {
        const node = tree.get(item);
        if (node) {
            if (!visited.has(node.id)) {
                out.push(node.id);
                visited.add(node.id);
            }
            node.children.reverse().forEach(x => stack.push(x));
        }
    }
    return out;
}
const AppCtx = L(null);
const useStore = () => y$1(AppCtx);
function useObserver(fn, deps) {
    let [i, setI] = e$1(0);
    v$1(() => {
        const subs = deps.map(x => x.on(() => setI(++i)));
        return () => subs.forEach(x => x());
    }, []);
    return fn();
}

var s$1 = {"tree":"Tree_tree__2do0f","item":"Tree_item__18L8F","itemHeader":"Tree_itemHeader__3Tghr","toggle":"Tree_toggle__34FGY","noToggle":"Tree_noToggle__rhopv","dimmer":"Tree_dimmer__1q9JT"};

/**
 * Get's the last DOM child by depth in the rendered tree list. Assumes
 * that all items have a numeric `data-depth` attribute.
 */
function getLastDomChild$1(dom) {
    const depth = dom.getAttribute("data-depth") || 0;
    let item = dom;
    let last = null;
    while ((item = item.nextSibling) &&
        +(item.getAttribute("data-depth") || 0) > +depth) {
        last = item;
    }
    return last;
}

function TreeView(props) {
    const store = useStore();
    const nodes = useObserver(() => {
        return getAllChildren(store.nodes(), store.rootToChild().get(props.rootId));
    }, [store.nodes, store.rootToChild]);
    return (s("div", { class: s$1.tree, onMouseLeave: () => store.actions.highlightNode(null) },
        nodes.map(id => (s(TreeItem, { key: id, id: id }))),
        s(HighlightPane, null)));
}
function TreeItem(props) {
    const { id } = props;
    const store = useStore();
    const { onSelect, collapsed, onToggle, node, hidden, selected, onHover, } = useObserver(() => {
        const node = store.nodes().get(id);
        return {
            selected: node ? node.selected() : false,
            onSelect: store.actions.selectNode,
            collapsed: store.visiblity.collapsed().has(id),
            hidden: store.visiblity.hidden().has(id),
            onToggle: store.actions.collapseNode,
            onHover: store.actions.highlightNode,
            node,
        };
    }, [
        store.nodes,
        store.nodes().get(id).selected,
        store.visiblity.collapsed,
        store.visiblity.hidden,
    ]);
    if (!node || hidden)
        return null;
    return (s("div", { class: s$1.item, onClick: ev => onSelect(id, ev.currentTarget), onMouseEnter: () => onHover(id), "data-selected": selected, "data-depth": node.depth, style: `padding-left: calc(var(--indent-depth) * ${node.depth})` },
        s("div", { class: s$1.itemHeader },
            node.children.length > 0 && (s("button", { class: s$1.toggle, "data-collapsed": collapsed, onClick: () => onToggle(id) },
                s(Arrow, null))),
            node.children.length === 0 && s("div", { class: s$1.noToggle }),
            s("span", { class: s$1.name }, node.name))));
}
function Arrow() {
    return (s("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 4.233 4.233" },
        s("path", { d: "M1.124 1.627H3.11l-.992 1.191-.993-1.19", fill: "currentColor" })));
}
function HighlightPane() {
    const store = useStore();
    const ref = useObserver(() => store.selectedRef(), [store.selectedRef]);
    let [pos, setPos] = e$1({ top: 0, height: 0 });
    v$1(() => {
        if (ref) {
            const last = getLastDomChild$1(ref);
            const rect = ref.getBoundingClientRect();
            const top = ref.offsetTop + rect.height;
            let height = 0;
            if (last) {
                const lastRect = last.getBoundingClientRect();
                height = last.offsetTop + lastRect.height - top;
            }
            setPos({ top, height });
        }
        else {
            setPos({ top: 0, height: 0 });
        }
    }, [ref]);
    return (s("div", { class: s$1.dimmer, style: `top: ${pos.top}px; height: ${pos.height}px;` }));
}

var s$2 = {"root":"Sidebar_root__24lga","title":"Sidebar_title__1kWF4","body":"Sidebar_body__3AP1m"};

var s$3 = {"panel":"SidebarPanel_panel__2U89F","empty":"SidebarPanel_empty__1cziE","title":"SidebarPanel_title__2ETXj","content":"SidebarPanel_content__2rBKc"};

function SidebarPanel(props) {
    return (s("div", { class: s$3.panel },
        s("h3", { class: s$3.title }, props.title),
        s("div", { class: s$3.content }, props.children == null ? (s("span", { class: s$3.empty }, props.empty)) : (props.children))));
}

var s$4 = {"actions":"Actions_actions__pKKcm"};

function Actions(props) {
    return s("div", { class: s$4.actions }, props.children);
}

var s$5 = {"root":"IconBtn_root__6jPcB"};

function IconBtn(props) {
    return (s("button", { class: s$5.root, "data-active": props.active, title: props.title, onClick: props.onClick }, props.children));
}

var s$6 = {"root":"ElementProps_root__V692X","form":"ElementProps_form__2vCXn","row":"ElementProps_row__2nrB0","name":"ElementProps_name__3BUvl","property":"ElementProps_property__33L8_","noCollapse":"ElementProps_noCollapse__2VmHD","toggle":"ElementProps_toggle__2lm6A","input":"ElementProps_input__2Ql4z","mask":"ElementProps_mask__1fbUM","string":"ElementProps_string__DQGi5","function":"ElementProps_function__1wwez","number":"ElementProps_number__384ol","boolean":"ElementProps_boolean__2mjbe","array":"ElementProps_array__1zZLB","object":"ElementProps_object__21oYZ","null":"ElementProps_null__3ki6o"};

function flatten(data, path, limit, out = []) {
    let depth = path.length > 0 ? path.length - 1 : 0;
    const name = path.length > 0 ? path[depth] + "" : "";
    if (Array.isArray(data)) {
        out.push({
            depth,
            name,
            type: "array",
            collapsable: true,
            editable: false,
            path,
            value: "Array",
        });
        data.forEach((item, i) => flatten(item, path.concat(i), limit, out));
    }
    else if (data instanceof Set) {
        out.push({
            depth,
            name,
            type: "set",
            collapsable: false,
            editable: false,
            path,
            value: "Set",
        });
    }
    else if (typeof data === "object") {
        if (data === null) {
            out.push({
                depth,
                name,
                type: "null",
                collapsable: false,
                editable: false,
                path,
                value: data,
            });
        }
        else {
            // Functions are encoded as objects
            if (Object.keys(data).length === 2 &&
                typeof data.name === "string" &&
                data.type === "function") {
                out.push({
                    depth,
                    name,
                    type: "function",
                    collapsable: false,
                    editable: false,
                    path,
                    value: data.name + "()",
                });
            }
            else {
                // Filter out initial object
                if (path.length > 0) {
                    out.push({
                        depth,
                        name,
                        type: "object",
                        collapsable: Object.keys(data).length > 0,
                        editable: false,
                        path,
                        value: "Object",
                    });
                }
                Object.keys(data).forEach(key => flatten(data[key], path.concat(key), limit, out));
            }
        }
    }
    else {
        const type = typeof data;
        out.push({
            depth,
            name,
            type: type,
            collapsable: false,
            editable: type !== "undefined",
            path,
            value: data,
        });
    }
    return out;
}

function ElementProps(props) {
    const { data, editable, path = [], onInput } = props;
    const parsed = flatten(data, [], 7, []);
    return (s("div", { class: s$6.root },
        s("form", { class: s$6.form, onSubmit: e => {
                e.preventDefault();
            } }, parsed.map(item => {
            return (s(SingleItem, { key: item.name, type: item.type, name: item.name, collapseable: item.collapsable, editable: (editable && item.editable) || false, value: item.value, path: item.path, onInput: onInput, depth: item.depth }));
        }))));
}
function SingleItem(props) {
    const { onInput, path, editable = false, name, type, collapseable = false, depth, } = props;
    const css = {
        string: s$6.string,
        number: s$6.number,
        function: s$6.function,
        boolean: s$6.boolean,
        null: s$6.null,
        array: s$6.array,
        object: s$6.object,
    };
    const v = props.value;
    const update = (v) => {
        onInput && onInput(v, path);
    };
    return (s("div", { key: path.join("."), class: s$6.row, "data-depth": depth, style: `padding-left: calc(var(--indent-depth) * ${depth})` },
        collapseable && (s("button", { class: s$6.toggle, "data-collapsed": false, onClick: () => console.log(path) },
            s(Arrow, null))),
        s("div", { class: `${s$6.name} ${!collapseable ? s$6.noCollapse : ""}` }, name),
        s("div", { class: `${s$6.property} ${css[type] || ""}` }, editable ? (s(DataInput, { value: v, onChange: update })) : (s("div", { class: s$6.mask }, v + "")))));
}
function DataInput({ value, onChange }) {
    // let [focus, setFocus] = useState(false);
    const setFocus = (v) => null;
    let inputType = "text";
    if (typeof value === "string") {
        inputType = "text";
        // if (!focus) value = `"${value}"`;
    }
    else if (typeof value === "number") {
        inputType = "number";
    }
    else {
        inputType = "checkbox";
    }
    const onCommit = (e) => {
        onChange(getEventValue(e));
    };
    return inputType === "checkbox" ? (s("input", { class: s$6.input, type: "checkbox", checked: value, onBlur: onCommit })) : (s("input", { class: s$6.input, type: inputType, onFocus: () => setFocus(), onBlur: () => setFocus(), value: value, onKeyUp: e => {
            if (e.keyCode === 13) {
                e.currentTarget.blur();
                onCommit(e);
            }
        } }));
}
function getEventValue(ev) {
    return ev.currentTarget.checked || ev.currentTarget.value;
}

function Sidebar() {
    const store = useStore();
    const node = useObserver(() => store.selected(), [store.selected]);
    const inspect = useObserver(() => store.inspectData(), [store.inspectData]);
    return (s("aside", { class: s$2.root },
        s(Actions, null,
            s("span", { class: s$2.title }, node ? node.name : "-"),
            node && (s(v, null,
                s(IconBtn, { onClick: () => store.actions.logNode(node.id) }, "Log")))),
        s("div", { class: s$2.body },
            s(SidebarPanel, { title: "props", empty: "None" }, inspect.props ? (s(ElementProps, { path: [], data: inspect.props, editable: inspect.canEditProps, onInput: (v, path) => node && store.actions.updateNode(node.id, "props", path, v) })) : null),
            inspect.state && (s(SidebarPanel, { title: "state", empty: "None" }, inspect.state ? (s(ElementProps, { path: [], data: inspect.state, editable: inspect.canEditState, onInput: (v, path) => node && store.actions.updateNode(node.id, "state", path, v) })) : null)),
            inspect.context && (s(SidebarPanel, { title: "context", empty: "None" })),
            inspect.hooks && (s(SidebarPanel, { title: "hooks", empty: "None" })))));
}

var s$7 = {"root":"Devtools_root__dMesj","components":"Devtools_components__3ybwK","sidebar":"Devtools_sidebar__1hYGj"};

function TreeBar() {
    const [inspect, setInspect] = e$1(false);
    const [settings, setSettings] = e$1(false);
    return (s(Actions, null,
        s(IconBtn, { "data-active": inspect, title: "Inspect Element", onClick: () => setInspect(!inspect) },
            s("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 4.233 4.233" },
                s("g", { stroke: "currentColor" },
                    s("path", { d: "M3.969 3.292V.794a.528.528 0 0 0-.53-.53H.795a.528.528 0 0 0-.53.53V3.44c0 .293.237.529.53.529h2.532", opacity: ".893", fill: "none", "stroke-linejoin": "round", "stroke-dashoffset": "8.791", "stroke-width": ".26458" }),
                    s("path", { d: "M1.323 1.323l.873 2.037L3.36 2.196z", "stroke-width": ".291", "stroke-linecap": "round", "stroke-linejoin": "round", fill: "currentColor" }),
                    s("path", { d: "M2.87 2.87L3.93 3.93", fill: "none", "stroke-width": ".265" })))),
        s("div", { style: "width: 100%" }, "foo"),
        s(IconBtn, { "data-active": settings, title: "Settings", onClick: () => setSettings(!settings) },
            s("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 3.733 3.921", height: "14.82", width: "14.109" },
                s("path", { d: "M2.456.423c-.172.17-.34.438-.585.437-.243-.001-.41-.271-.58-.443L.829.682c.062.234.21.514.087.724-.123.21-.44.22-.673.281L.24 2.22c.294.053.517-.036.671.288.154.324-.03.49-.093.723l.46.268c.171-.17.23-.419.584-.437.353-.018.43.273.58.443l.462-.265c-.062-.234-.21-.513-.087-.724.123-.21.44-.22.673-.281l.003-.532c-.233-.064-.55-.076-.671-.288-.12-.211.03-.49.093-.723zm-.327 1.09c.252.142.338.459.193.706a.53.53 0 0 1-.718.19.513.513 0 0 1-.193-.707.53.53 0 0 1 .718-.19z", fill: "none", stroke: "currentColor", "stroke-width": ".235", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dashoffset": "8.791" })))));
}

function DevTools(props) {
    return (s(AppCtx.Provider, { value: props.store },
        s("div", { class: s$7.root },
            s("div", { class: s$7.components },
                s(TreeBar, null),
                s(TreeView, { rootId: 1 })),
            s("div", { class: s$7.sidebar },
                s(Sidebar, { title: "Hydrator" })))));
}

function setupOptions(options, renderer) {
    const o = options;
    // Store (possible) previous hooks so that we don't overwrite them
    let prevVNodeHook = options.vnode;
    let prevCommitRoot = o._commit || o.__c;
    let prevBeforeUnmount = options.unmount;
    let prevBeforeDiff = o._diff || o.__b;
    let prevAfterDiff = options.diffed;
    options.vnode = vnode => {
        // Tiny performance improvement by initializing fields as doubles
        // from the start. `performance.now()` will always return a double.
        // See https://github.com/facebook/react/issues/14365
        // and https://slidr.io/bmeurer/javascript-engine-fundamentals-the-good-the-bad-and-the-ugly
        vnode.startTime = NaN;
        vnode.endTime = NaN;
        vnode.startTime = 0;
        vnode.endTime = -1;
        if (prevVNodeHook)
            prevVNodeHook(vnode);
        vnode.old = null;
    };
    o._diff = o.__b = (vnode) => {
        vnode.startTime = performance.now();
        if (prevBeforeDiff != null)
            prevBeforeDiff(vnode);
    };
    options.diffed = vnode => {
        vnode.endTime = performance.now();
        // let c;
        // if (vnode != null && (c = vnode._component) != null) {
        // 	c._prevProps = oldVNode != null ? oldVNode.props : null;
        // 	c._prevContext =
        // 		oldVNode != null && oldVNode._component != null
        // 			? oldVNode._component._context
        // 			: null;
        // 	if (c.__hooks != null) {
        // 		c._prevHooksRevision = c._currentHooksRevision;
        // 		c._currentHooksRevision = c.__hooks._list.reduce(
        // 			(acc, x) => acc + x._revision,
        // 			0,
        // 		);
        // 	}
        // }
        if (prevAfterDiff)
            prevAfterDiff(vnode);
    };
    o._commit = o.__c = (vnode) => {
        if (prevCommitRoot)
            prevCommitRoot(vnode);
        // These cases are already handled by `unmount`
        if (vnode == null)
            return;
        renderer.onCommit(vnode);
    };
    options.unmount = vnode => {
        if (prevBeforeUnmount)
            prevBeforeUnmount(vnode);
        renderer.onUnmount(vnode);
    };
    // Inject tracking into setState
    // const setState = Component.prototype.setState;
    // Component.prototype.setState = function(update, callback) {
    // 	// Duplicated in setState() but doesn't matter due to the guard.
    // 	let s =
    // 		(this._nextState !== this.state && this._nextState) ||
    // 		(this._nextState = Object.assign({}, this.state));
    // 	// Needed in order to check if state has changed after the tree has been committed:
    // 	this._prevState = Object.assign({}, s);
    // 	return setState.call(this, update, callback);
    // };
    // Teardown devtools options. Mainly used for testing
    return () => {
        options.unmount = prevBeforeUnmount;
        o._commit = o.__c = prevCommitRoot;
        options.diffed = prevAfterDiff;
        o._diff = o.__b = prevBeforeDiff;
        options.vnode = prevVNodeHook;
    };
}

/**
 * The string table holds a mapping of strings to ids. This saves a lot of space
 * in messaging because we can only need to declare a string once and can later
 * refer to its id. This is especially true for component or element names which
 * expectedoccur multiple times.
 */
/**
 * Parse message to strings
 */
function parseTable(data) {
    const len = data[0];
    const strings = [];
    if (len > 0) {
        for (let i = 1; i < len + 1; i++) {
            const strLen = data[i];
            const start = i + 1;
            const end = i + strLen + 1;
            const str = String.fromCodePoint(...data.slice(start, end));
            strings.push(str);
            i += strLen;
        }
    }
    return strings;
}

var MsgTypes$1;
(function (MsgTypes) {
    MsgTypes[MsgTypes["ADD_ROOT"] = 1] = "ADD_ROOT";
    MsgTypes[MsgTypes["ADD_VNODE"] = 2] = "ADD_VNODE";
    MsgTypes[MsgTypes["REMOVE_VNODE"] = 3] = "REMOVE_VNODE";
    MsgTypes[MsgTypes["UPDATE_VNODE_TIMINGS"] = 4] = "UPDATE_VNODE_TIMINGS";
})(MsgTypes$1 || (MsgTypes$1 = {}));
function applyOperations(store, data) {
    const rootId = data[0];
    let i = data[1] + 1;
    const strings = parseTable(data.slice(1, i + 1));
    let newRoot = false;
    for (; i < data.length; i++) {
        switch (data[i]) {
            case MsgTypes$1.ADD_ROOT:
                const id = data[i++];
                newRoot = true;
                store.roots(store.roots()).push(id);
                break;
            case MsgTypes$1.ADD_VNODE: {
                const id = data[i + 1];
                const type = data[i + 2];
                const name = strings[data[i + 5] - 1];
                const key = data[i + 6] > 0 ? ` key="${strings[i + 6 - 1]}" ` : "";
                let parentId = data[i + 3];
                if (newRoot) {
                    newRoot = false;
                    store.rootToChild().set(rootId, id);
                    store.rootToChild(store.rootToChild());
                }
                if (store.nodes().has(id)) {
                    throw new Error(`Node ${id} already present in store.`);
                }
                if (store.roots().indexOf(parentId) === -1) {
                    const parent = store.nodes().get(parentId);
                    if (!parent) {
                        // throw new Error(`Parent node ${parentId} not found in store.`);
                        console.warn(`Parent node ${parentId} not found in store.`);
                        parentId = -1;
                    }
                    else {
                        parent.children.push(id);
                    }
                }
                store.nodes().set(id, {
                    children: [],
                    depth: getDepth(store, parentId),
                    id,
                    name,
                    parentId,
                    type,
                    key,
                    selected: valoo(false),
                });
                i += 6;
                break;
            }
            case MsgTypes$1.REMOVE_VNODE: {
                const unmounts = data[i + 1];
                i += 2;
                const len = i + unmounts;
                console.log(`total unmounts: ${unmounts}`);
                for (; i < len; i++) {
                    console.log(`  Remove: %c${data[i]}`, "color: red");
                }
            }
        }
    }
    store.nodes(store.nodes());
}
function applyEvent(store, name, data) {
    switch (name) {
        case "operation":
            return applyOperations(store, data);
        case "inspect-result":
            return store.inspectData(data);
    }
}
function getDepth(store, id) {
    let parent = store.nodes().get(id);
    return parent ? parent.depth + 1 : 0;
}

function attach(options, rendererFn) {
    const store = createStore();
    const fakeHook = {
        attach: () => 1,
        connected: true,
        detach: () => null,
        emit: (name, data) => {
            applyEvent(store, name, data);
        },
        renderers: new Map(),
    };
    const renderer = rendererFn(fakeHook);
    const destroy = setupOptions(options, renderer);
    return {
        store,
        destroy,
    };
}
function renderDevtools(store, container) {
    D(s(DevTools, { store }), container);
}


//# sourceMappingURL=preact-devtools.module.js.map


/***/ }),

/***/ "./node_modules/preact/debug/dist/debug.module.js":
/*!********************************************************!*\
  !*** ./node_modules/preact/debug/dist/debug.module.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resetPropWarnings": () => (/* binding */ r)
/* harmony export */ });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.module.js");
/* harmony import */ var preact_devtools__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! preact/devtools */ "./node_modules/preact/devtools/dist/devtools.module.js");
var o={};function r(){o={}}function a(n){return n.type===preact__WEBPACK_IMPORTED_MODULE_0__.Fragment?"Fragment":"function"==typeof n.type?n.type.displayName||n.type.name:"string"==typeof n.type?n.type:"#text"}var i=[],s=[];function c(){return i.length>0?i[i.length-1]:null}var l=!1;function u(n){return"function"==typeof n.type&&n.type!=preact__WEBPACK_IMPORTED_MODULE_0__.Fragment}function f(n){for(var t=[n],e=n;null!=e.__o;)t.push(e.__o),e=e.__o;return t.reduce(function(n,t){n+="  in "+a(t);var e=t.__source;return e?n+=" (at "+e.fileName+":"+e.lineNumber+")":l||(l=!0,console.warn("Add @babel/plugin-transform-react-jsx-source to get a more detailed component stack. Note that you should not add it to production builds of your App for bundle size reasons.")),n+"\n"},"")}var p="function"==typeof WeakMap,d=preact__WEBPACK_IMPORTED_MODULE_0__.Component.prototype.setState;preact__WEBPACK_IMPORTED_MODULE_0__.Component.prototype.setState=function(n,t){return null==this.__v?null==this.state&&console.warn('Calling "this.setState" inside the constructor of a component is a no-op and might be a bug in your application. Instead, set "this.state = {}" directly.\n\n'+f(c())):null==this.__P&&console.warn('Can\'t call "this.setState" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n'+f(this.__v)),d.call(this,n,t)};var h=preact__WEBPACK_IMPORTED_MODULE_0__.Component.prototype.forceUpdate;function y(n){var t=n.props,e=a(n),o="";for(var r in t)if(t.hasOwnProperty(r)&&"children"!==r){var i=t[r];"function"==typeof i&&(i="function "+(i.displayName||i.name)+"() {}"),i=Object(i)!==i||i.toString?i+"":Object.prototype.toString.call(i),o+=" "+r+"="+JSON.stringify(i)}var s=t.children;return"<"+e+o+(s&&s.length?">..</"+e+">":" />")}preact__WEBPACK_IMPORTED_MODULE_0__.Component.prototype.forceUpdate=function(n){return null==this.__v?console.warn('Calling "this.forceUpdate" inside the constructor of a component is a no-op and might be a bug in your application.\n\n'+f(c())):null==this.__P&&console.warn('Can\'t call "this.forceUpdate" on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.\n\n'+f(this.__v)),h.call(this,n)},function(){!function(){var t=preact__WEBPACK_IMPORTED_MODULE_0__.options.__b,e=preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed,o=preact__WEBPACK_IMPORTED_MODULE_0__.options.__,r=preact__WEBPACK_IMPORTED_MODULE_0__.options.vnode,a=preact__WEBPACK_IMPORTED_MODULE_0__.options.__r;preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed=function(n){u(n)&&s.pop(),i.pop(),e&&e(n)},preact__WEBPACK_IMPORTED_MODULE_0__.options.__b=function(n){u(n)&&i.push(n),t&&t(n)},preact__WEBPACK_IMPORTED_MODULE_0__.options.__=function(n,t){s=[],o&&o(n,t)},preact__WEBPACK_IMPORTED_MODULE_0__.options.vnode=function(n){n.__o=s.length>0?s[s.length-1]:null,r&&r(n)},preact__WEBPACK_IMPORTED_MODULE_0__.options.__r=function(n){u(n)&&s.push(n),a&&a(n)}}();var t=!1,e=preact__WEBPACK_IMPORTED_MODULE_0__.options.__b,r=preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed,c=preact__WEBPACK_IMPORTED_MODULE_0__.options.vnode,l=preact__WEBPACK_IMPORTED_MODULE_0__.options.__e,d=preact__WEBPACK_IMPORTED_MODULE_0__.options.__,h=preact__WEBPACK_IMPORTED_MODULE_0__.options.__h,m=p?{useEffect:new WeakMap,useLayoutEffect:new WeakMap,lazyPropTypes:new WeakMap}:null,v=[];preact__WEBPACK_IMPORTED_MODULE_0__.options.__e=function(n,t,e){if(t&&t.__c&&"function"==typeof n.then){var o=n;n=new Error("Missing Suspense. The throwing component was: "+a(t));for(var r=t;r;r=r.__)if(r.__c&&r.__c.__c){n=o;break}if(n instanceof Error)throw n}try{l(n,t,e),"function"!=typeof n.then&&setTimeout(function(){throw n})}catch(n){throw n}},preact__WEBPACK_IMPORTED_MODULE_0__.options.__=function(n,t){if(!t)throw new Error("Undefined parent passed to render(), this is the second argument.\nCheck if the element is available in the DOM/has the correct id.");var e;switch(t.nodeType){case 1:case 11:case 9:e=!0;break;default:e=!1}if(!e){var o=a(n);throw new Error("Expected a valid HTML node as a second argument to render.\tReceived "+t+" instead: render(<"+o+" />, "+t+");")}d&&d(n,t)},preact__WEBPACK_IMPORTED_MODULE_0__.options.__b=function(n){var r=n.type,i=function n(t){return t?"function"==typeof t.type?n(t.__):t:{}}(n.__);if(t=!0,void 0===r)throw new Error("Undefined component passed to createElement()\n\nYou likely forgot to export your component or might have mixed up default and named imports"+y(n)+"\n\n"+f(n));if(null!=r&&"object"==typeof r){if(void 0!==r.__k&&void 0!==r.__e)throw new Error("Invalid type passed to createElement(): "+r+"\n\nDid you accidentally pass a JSX literal as JSX twice?\n\n  let My"+a(n)+" = "+y(r)+";\n  let vnode = <My"+a(n)+" />;\n\nThis usually happens when you export a JSX literal and not the component.\n\n"+f(n));throw new Error("Invalid type passed to createElement(): "+(Array.isArray(r)?"array":r))}if("thead"!==r&&"tfoot"!==r&&"tbody"!==r||"table"===i.type?"tr"===r&&"thead"!==i.type&&"tfoot"!==i.type&&"tbody"!==i.type&&"table"!==i.type?console.error("Improper nesting of table. Your <tr> should have a <thead/tbody/tfoot/table> parent."+y(n)+"\n\n"+f(n)):"td"===r&&"tr"!==i.type?console.error("Improper nesting of table. Your <td> should have a <tr> parent."+y(n)+"\n\n"+f(n)):"th"===r&&"tr"!==i.type&&console.error("Improper nesting of table. Your <th> should have a <tr>."+y(n)+"\n\n"+f(n)):console.error("Improper nesting of table. Your <thead/tbody/tfoot> should have a <table> parent."+y(n)+"\n\n"+f(n)),void 0!==n.ref&&"function"!=typeof n.ref&&"object"!=typeof n.ref&&!("$$typeof"in n))throw new Error('Component\'s "ref" property should be a function, or an object created by createRef(), but got ['+typeof n.ref+"] instead\n"+y(n)+"\n\n"+f(n));if("string"==typeof n.type)for(var s in n.props)if("o"===s[0]&&"n"===s[1]&&"function"!=typeof n.props[s]&&null!=n.props[s])throw new Error("Component's \""+s+'" property should be a function, but got ['+typeof n.props[s]+"] instead\n"+y(n)+"\n\n"+f(n));if("function"==typeof n.type&&n.type.propTypes){if("Lazy"===n.type.displayName&&m&&!m.lazyPropTypes.has(n.type)){var c="PropTypes are not supported on lazy(). Use propTypes on the wrapped component itself. ";try{var l=n.type();m.lazyPropTypes.set(n.type,!0),console.warn(c+"Component wrapped in lazy() is "+a(l))}catch(n){console.warn(c+"We will log the wrapped component's name once it is loaded.")}}var u=n.props;n.type.__f&&delete(u=function(n,t){for(var e in t)n[e]=t[e];return n}({},u)).ref,function(n,t,e,r,a){Object.keys(n).forEach(function(e){var i;try{i=n[e](t,e,r,"prop",null,"SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED")}catch(n){i=n}!i||i.message in o||(o[i.message]=!0,console.error("Failed prop type: "+i.message+(a&&"\n"+a()||"")))})}(n.type.propTypes,u,0,a(n),function(){return f(n)})}e&&e(n)},preact__WEBPACK_IMPORTED_MODULE_0__.options.__h=function(n,e,o){if(!n||!t)throw new Error("Hook can only be invoked from render methods.");h&&h(n,e,o)};var b=function(n,t){return{get:function(){var e="get"+n+t;v&&v.indexOf(e)<0&&(v.push(e),console.warn("getting vnode."+n+" is deprecated, "+t))},set:function(){var e="set"+n+t;v&&v.indexOf(e)<0&&(v.push(e),console.warn("setting vnode."+n+" is not allowed, "+t))}}},w={nodeName:b("nodeName","use vnode.type"),attributes:b("attributes","use vnode.props"),children:b("children","use vnode.props.children")},g=Object.create({},w);preact__WEBPACK_IMPORTED_MODULE_0__.options.vnode=function(n){var t=n.props;if(null!==n.type&&null!=t&&("__source"in t||"__self"in t)){var e=n.props={};for(var o in t){var r=t[o];"__source"===o?n.__source=r:"__self"===o?n.__self=r:e[o]=r}}n.__proto__=g,c&&c(n)},preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed=function(n){if(n.__k&&n.__k.forEach(function(t){if(t&&void 0===t.type){delete t.__,delete t.__b;var e=Object.keys(t).join(",");throw new Error("Objects are not valid as a child. Encountered an object with the keys {"+e+"}.\n\n"+f(n))}}),t=!1,r&&r(n),null!=n.__k)for(var e=[],o=0;o<n.__k.length;o++){var a=n.__k[o];if(a&&null!=a.key){var i=a.key;if(-1!==e.indexOf(i)){console.error('Following component has two or more children with the same key attribute: "'+i+'". This may cause glitches and misbehavior in rendering process. Component: \n\n'+y(n)+"\n\n"+f(n));break}e.push(i)}}}}();
//# sourceMappingURL=debug.module.js.map


/***/ }),

/***/ "./node_modules/preact/devtools/dist/devtools.module.js":
/*!**************************************************************!*\
  !*** ./node_modules/preact/devtools/dist/devtools.module.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addHookName": () => (/* binding */ t)
/* harmony export */ });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.module.js");
function t(o,e){return preact__WEBPACK_IMPORTED_MODULE_0__.options.__a&&preact__WEBPACK_IMPORTED_MODULE_0__.options.__a(e),o}"undefined"!=typeof window&&window.__PREACT_DEVTOOLS__&&window.__PREACT_DEVTOOLS__.attachPreact("10.5.13",preact__WEBPACK_IMPORTED_MODULE_0__.options,{Fragment:preact__WEBPACK_IMPORTED_MODULE_0__.Fragment,Component:preact__WEBPACK_IMPORTED_MODULE_0__.Component});
//# sourceMappingURL=devtools.module.js.map


/***/ }),

/***/ "./node_modules/preact/dist/preact.module.js":
/*!***************************************************!*\
  !*** ./node_modules/preact/dist/preact.module.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ N),
/* harmony export */   "hydrate": () => (/* binding */ O),
/* harmony export */   "createElement": () => (/* binding */ a),
/* harmony export */   "h": () => (/* binding */ a),
/* harmony export */   "Fragment": () => (/* binding */ y),
/* harmony export */   "createRef": () => (/* binding */ h),
/* harmony export */   "isValidElement": () => (/* binding */ l),
/* harmony export */   "Component": () => (/* binding */ p),
/* harmony export */   "cloneElement": () => (/* binding */ S),
/* harmony export */   "createContext": () => (/* binding */ q),
/* harmony export */   "toChildArray": () => (/* binding */ w),
/* harmony export */   "options": () => (/* binding */ n)
/* harmony export */ });
var n,l,u,i,t,o,r={},f=[],e=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function c(n,l){for(var u in l)n[u]=l[u];return n}function s(n){var l=n.parentNode;l&&l.removeChild(n)}function a(n,l,u){var i,t,o,r=arguments,f={};for(o in l)"key"==o?i=l[o]:"ref"==o?t=l[o]:f[o]=l[o];if(arguments.length>3)for(u=[u],o=3;o<arguments.length;o++)u.push(r[o]);if(null!=u&&(f.children=u),"function"==typeof n&&null!=n.defaultProps)for(o in n.defaultProps)void 0===f[o]&&(f[o]=n.defaultProps[o]);return v(n,f,i,t,null)}function v(l,u,i,t,o){var r={type:l,props:u,key:i,ref:t,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++n.__v:o};return null!=n.vnode&&n.vnode(r),r}function h(){return{current:null}}function y(n){return n.children}function p(n,l){this.props=n,this.context=l}function d(n,l){if(null==l)return n.__?d(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?d(n):null}function _(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return _(n)}}function k(l){(!l.__d&&(l.__d=!0)&&u.push(l)&&!b.__r++||t!==n.debounceRendering)&&((t=n.debounceRendering)||i)(b)}function b(){for(var n;b.__r=u.length;)n=u.sort(function(n,l){return n.__v.__b-l.__v.__b}),u=[],n.some(function(n){var l,u,i,t,o,r;n.__d&&(o=(t=(l=n).__v).__e,(r=l.__P)&&(u=[],(i=c({},t)).__v=t.__v+1,I(r,t,i,l.__n,void 0!==r.ownerSVGElement,null!=t.__h?[o]:null,u,null==o?d(t):o,t.__h),T(u,t),t.__e!=o&&_(t)))})}function m(n,l,u,i,t,o,e,c,s,a){var h,p,_,k,b,m,w,A=i&&i.__k||f,P=A.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(k=u.__k[h]=null==(k=l[h])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k||"bigint"==typeof k?v(null,k,null,null,k):Array.isArray(k)?v(y,{children:k},null,null,null):k.__b>0?v(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(_=A[h])||_&&k.key==_.key&&k.type===_.type)A[h]=void 0;else for(p=0;p<P;p++){if((_=A[p])&&k.key==_.key&&k.type===_.type){A[p]=void 0;break}_=null}I(n,k,_=_||r,t,o,e,c,s,a),b=k.__e,(p=k.ref)&&_.ref!=p&&(w||(w=[]),_.ref&&w.push(_.ref,null,k),w.push(p,k.__c||b,k)),null!=b?(null==m&&(m=b),"function"==typeof k.type&&null!=k.__k&&k.__k===_.__k?k.__d=s=g(k,s,n):s=x(n,k,_,A,b,s),a||"option"!==u.type?"function"==typeof u.type&&(u.__d=s):n.value=""):s&&_.__e==s&&s.parentNode!=n&&(s=d(_))}for(u.__e=m,h=P;h--;)null!=A[h]&&("function"==typeof u.type&&null!=A[h].__e&&A[h].__e==u.__d&&(u.__d=d(i,h+1)),L(A[h],A[h]));if(w)for(h=0;h<w.length;h++)z(w[h],w[++h],w[++h])}function g(n,l,u){var i,t;for(i=0;i<n.__k.length;i++)(t=n.__k[i])&&(t.__=n,l="function"==typeof t.type?g(t,l,u):x(u,t,t,n.__k,t.__e,l));return l}function w(n,l){return l=l||[],null==n||"boolean"==typeof n||(Array.isArray(n)?n.some(function(n){w(n,l)}):l.push(n)),l}function x(n,l,u,i,t,o){var r,f,e;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||t!=o||null==t.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(t),r=null;else{for(f=o,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,o),r=o}return void 0!==r?r:t.nextSibling}function A(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||C(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||C(n,o,l[o],u[o],i)}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||e.test(l)?u:u+"px"}function C(n,l,u,i,t){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||P(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||P(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?i||n.addEventListener(l,o?H:$,o):n.removeEventListener(l,o?H:$,o);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l))}}function $(l){this.l[l.type+!1](n.event?n.event(l):l)}function H(l){this.l[l.type+!0](n.event?n.event(l):l)}function I(l,u,i,t,o,r,f,e,s){var a,v,h,d,_,k,b,g,w,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(s=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(a=n.__b)&&a(u);try{n:if("function"==typeof P){if(g=u.props,w=(a=P.contextType)&&t[a.__c],x=a?w?w.props.value:a.__:t,i.__c?b=(v=u.__c=i.__c).__=v.__E:("prototype"in P&&P.prototype.render?u.__c=v=new P(g,x):(u.__c=v=new p(g,x),v.constructor=P,v.render=M),w&&w.sub(v),v.props=g,v.state||(v.state={}),v.context=x,v.__n=t,h=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=P.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=c({},v.__s)),c(v.__s,P.getDerivedStateFromProps(g,v.__s))),d=v.props,_=v.state,h)null==P.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==P.getDerivedStateFromProps&&g!==d&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(g,x),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(g,v.__s,x)||u.__v===i.__v){v.props=g,v.state=v.__s,u.__v!==i.__v&&(v.__d=!1),v.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u)}),v.__h.length&&f.push(v);break n}null!=v.componentWillUpdate&&v.componentWillUpdate(g,v.__s,x),null!=v.componentDidUpdate&&v.__h.push(function(){v.componentDidUpdate(d,_,k)})}v.context=x,v.props=g,v.state=v.__s,(a=n.__r)&&a(u),v.__d=!1,v.__v=u,v.__P=l,a=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(t=c(c({},t),v.getChildContext())),h||null==v.getSnapshotBeforeUpdate||(k=v.getSnapshotBeforeUpdate(d,_)),A=null!=a&&a.type===y&&null==a.key?a.props.children:a,m(l,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,s),v.base=u.__e,u.__h=null,v.__h.length&&f.push(v),b&&(v.__E=v.__=null),v.__e=!1}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=j(i.__e,u,i,t,o,r,f,s);(a=n.diffed)&&a(u)}catch(l){u.__v=null,(s||null!=r)&&(u.__e=e,u.__h=!!s,r[r.indexOf(e)]=null),n.__e(l,u,i)}}function T(l,u){n.__c&&n.__c(u,l),l.some(function(u){try{l=u.__h,u.__h=[],l.some(function(n){n.call(u)})}catch(l){n.__e(l,u.__v)}})}function j(n,l,u,i,t,o,e,c){var a,v,h,y,p=u.props,d=l.props,_=l.type,k=0;if("svg"===_&&(t=!0),null!=o)for(;k<o.length;k++)if((a=o[k])&&(a===n||(_?a.localName==_:3==a.nodeType))){n=a,o[k]=null;break}if(null==n){if(null===_)return document.createTextNode(d);n=t?document.createElementNS("http://www.w3.org/2000/svg",_):document.createElement(_,d.is&&d),o=null,c=!1}if(null===_)p===d||c&&n.data===d||(n.data=d);else{if(o=o&&f.slice.call(n.childNodes),v=(p=u.props||r).dangerouslySetInnerHTML,h=d.dangerouslySetInnerHTML,!c){if(null!=o)for(p={},y=0;y<n.attributes.length;y++)p[n.attributes[y].name]=n.attributes[y].value;(h||v)&&(h&&(v&&h.__html==v.__html||h.__html===n.innerHTML)||(n.innerHTML=h&&h.__html||""))}if(A(n,d,p,t,c),h)l.__k=[];else if(k=l.props.children,m(n,Array.isArray(k)?k:[k],l,u,i,t&&"foreignObject"!==_,o,e,n.firstChild,c),null!=o)for(k=o.length;k--;)null!=o[k]&&s(o[k]);c||("value"in d&&void 0!==(k=d.value)&&(k!==n.value||"progress"===_&&!k)&&C(n,"value",k,p.value,!1),"checked"in d&&void 0!==(k=d.checked)&&k!==n.checked&&C(n,"checked",k,p.checked,!1))}return n}function z(l,u,i){try{"function"==typeof l?l(u):l.current=u}catch(l){n.__e(l,i)}}function L(l,u,i){var t,o,r;if(n.unmount&&n.unmount(l),(t=l.ref)&&(t.current&&t.current!==l.__e||z(t,null,u)),i||"function"==typeof l.type||(i=null!=(o=l.__e)),l.__e=l.__d=void 0,null!=(t=l.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount()}catch(l){n.__e(l,u)}t.base=t.__P=null}if(t=l.__k)for(r=0;r<t.length;r++)t[r]&&L(t[r],u,i);null!=o&&s(o)}function M(n,l,u){return this.constructor(n,u)}function N(l,u,i){var t,o,e;n.__&&n.__(l,u),o=(t="function"==typeof i)?null:i&&i.__k||u.__k,e=[],I(u,l=(!t&&i||u).__k=a(y,null,[l]),o||r,r,void 0!==u.ownerSVGElement,!t&&i?[i]:o?null:u.firstChild?f.slice.call(u.childNodes):null,e,!t&&i?i:o?o.__e:u.firstChild,t),T(e,l)}function O(n,l){N(n,l,O)}function S(n,l,u){var i,t,o,r=arguments,f=c({},n.props);for(o in l)"key"==o?i=l[o]:"ref"==o?t=l[o]:f[o]=l[o];if(arguments.length>3)for(u=[u],o=3;o<arguments.length;o++)u.push(r[o]);return null!=u&&(f.children=u),v(n.type,f,i||n.key,t||n.ref,null)}function q(n,l){var u={__c:l="__cC"+o++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,i;return this.getChildContext||(u=[],(i={})[l]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(k)},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n={__e:function(n,l){for(var u,i,t;l=l.__;)if((u=l.__c)&&!u.__)try{if((i=u.constructor)&&null!=i.getDerivedStateFromError&&(u.setState(i.getDerivedStateFromError(n)),t=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),t=u.__d),t)return u.__E=u}catch(l){n=l}throw n},__v:0},l=function(n){return null!=n&&void 0===n.constructor},p.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=c({},this.state),"function"==typeof n&&(n=n(c({},u),this.props)),n&&c(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),k(this))},p.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),k(this))},p.prototype.render=y,u=[],i="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,b.__r=0,o=0;
//# sourceMappingURL=preact.module.js.map


/***/ }),

/***/ "./node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js":
/*!*******************************************************************!*\
  !*** ./node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Fragment": () => (/* reexport safe */ preact__WEBPACK_IMPORTED_MODULE_0__.Fragment),
/* harmony export */   "jsx": () => (/* binding */ o),
/* harmony export */   "jsxs": () => (/* binding */ o),
/* harmony export */   "jsxDEV": () => (/* binding */ o)
/* harmony export */ });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.module.js");
function o(_,o,e,n,t){var f={};for(var l in o)"ref"!=l&&(f[l]=o[l]);var s,u,a={type:_,props:f,key:e,ref:o&&o.ref,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:++preact__WEBPACK_IMPORTED_MODULE_0__.options.__v,__source:n,__self:t};if("function"==typeof _&&(s=_.defaultProps))for(u in s)void 0===f[u]&&(f[u]=s[u]);return preact__WEBPACK_IMPORTED_MODULE_0__.options.vnode&&preact__WEBPACK_IMPORTED_MODULE_0__.options.vnode(a),a}
//# sourceMappingURL=jsxRuntime.module.js.map


/***/ }),

/***/ "./src/app.tsx":
/*!*********************!*\
  !*** ./src/app.tsx ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var jsx_runtime_1 = __webpack_require__(/*! preact/jsx-runtime */ "./node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js");
var App = function (props) { return (jsx_runtime_1.jsxs("h1", { children: ["Hi ", props.userName, "sdf! Welcome to ", props.lang, "! xxxx"] }, void 0)); };
exports.default = App;


/***/ }),

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var jsx_runtime_1 = __webpack_require__(/*! preact/jsx-runtime */ "./node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js");
var preact_1 = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.module.js");
window.__ctx = {};
if (true) {
    __webpack_require__(/*! preact/debug */ "./node_modules/preact/debug/dist/debug.module.js");
    __webpack_require__(/*! preact-devtools */ "./node_modules/preact-devtools/dist/preact-devtools.module.js");
    window.__ctx.isDev = true;
}
else {}
var root;
if (false) {}
var init = function () {
    var App = __webpack_require__(/*! ./app */ "./src/app.tsx").default;
    root = preact_1.render(jsx_runtime_1.jsx(App, __assign({ userName: "Beveloper", lang: "TypeScript" }, { children: " " }), void 0), document.body, root);
};
init();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.tsx");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zaXRlXzA1MjEvLi9ub2RlX21vZHVsZXMvcHJlYWN0LWRldnRvb2xzL2Rpc3QvcHJlYWN0LWRldnRvb2xzLm1vZHVsZS5qcyIsIndlYnBhY2s6Ly9zaXRlXzA1MjEvLi9ub2RlX21vZHVsZXMvcHJlYWN0L2RlYnVnL2Rpc3QvZGVidWcubW9kdWxlLmpzIiwid2VicGFjazovL3NpdGVfMDUyMS8uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGV2dG9vbHMvZGlzdC9kZXZ0b29scy5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vc2l0ZV8wNTIxLy4vbm9kZV9tb2R1bGVzL3ByZWFjdC9kaXN0L3ByZWFjdC5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vc2l0ZV8wNTIxLy4vbm9kZV9tb2R1bGVzL3ByZWFjdC9qc3gtcnVudGltZS9kaXN0L2pzeFJ1bnRpbWUubW9kdWxlLmpzIiwid2VicGFjazovL3NpdGVfMDUyMS8uL3NyYy9hcHAudHN4Iiwid2VicGFjazovL3NpdGVfMDUyMS8uL3NyYy9pbmRleC50c3giLCJ3ZWJwYWNrOi8vc2l0ZV8wNTIxL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NpdGVfMDUyMS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc2l0ZV8wNTIxL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vc2l0ZV8wNTIxL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc2l0ZV8wNTIxL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFrQzs7QUFFbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLGlEQUFp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VUNOQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRnJhZ21lbnQgfSBmcm9tICdwcmVhY3QnO1xuXG4vKipcclxuICogVGhlIHN0cmluZyB0YWJsZSBob2xkcyBhIG1hcHBpbmcgb2Ygc3RyaW5ncyB0byBpZHMuIFRoaXMgc2F2ZXMgYSBsb3Qgb2Ygc3BhY2VcclxuICogaW4gbWVzc2FnaW5nIGJlY2F1c2Ugd2UgY2FuIG9ubHkgbmVlZCB0byBkZWNsYXJlIGEgc3RyaW5nIG9uY2UgYW5kIGNhbiBsYXRlclxyXG4gKiByZWZlciB0byBpdHMgaWQuIFRoaXMgaXMgZXNwZWNpYWxseSB0cnVlIGZvciBjb21wb25lbnQgb3IgZWxlbWVudCBuYW1lcyB3aGljaFxyXG4gKiBleHBlY3RlZG9jY3VyIG11bHRpcGxlIHRpbWVzLlxyXG4gKi9cclxuLyoqXHJcbiAqIENvbnZlcnQgYSBzdHJpbmcgdG8gYW4gaWQuIFdvcmtzIHNpbWlsYXIgdG8gYSBnemlwIGRpY3Rpb25hcnkuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTdHJpbmdJZCh0YWJsZSwgaW5wdXQpIHtcclxuICAgIGlmIChpbnB1dCA9PT0gbnVsbClcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIGlmICghdGFibGUuaGFzKGlucHV0KSkge1xyXG4gICAgICAgIHRhYmxlLnNldChpbnB1dCwgdGFibGUuc2l6ZSArIDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhYmxlLmdldChpbnB1dCk7XHJcbn1cclxuLyoqXHJcbiAqIENvbnZlcnQgc3RyaW5nIHRhYmxlIHRvIHNvbWV0aGluZyB0aGUgZXh0ZW5zaW9uIHVuZGVyc3RhbmRzXHJcbiAqIEBwYXJhbSB7aW1wb3J0KCcuL2RldnRvb2xzJykuQWRhcHRlclN0YXRlW1wic3RyaW5nVGFibGVcIl19IHRhYmxlXHJcbiAqIEByZXR1cm5zIHtudW1iZXJbXX1cclxuICovXHJcbmZ1bmN0aW9uIGZsdXNoVGFibGUodGFibGUpIHtcclxuICAgIGxldCBvcHMgPSBbMF07XHJcbiAgICB0YWJsZS5mb3JFYWNoKChfLCBrKSA9PiB7XHJcbiAgICAgICAgb3BzWzBdICs9IGsubGVuZ3RoICsgMTtcclxuICAgICAgICBvcHMucHVzaChrLmxlbmd0aCwgLi4uZW5jb2RlKGspKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG9wcztcclxufVxyXG4vLyBUT0RPOiBVc2UgYSBwcm9wZXIgTFJVIGNhY2hlP1xyXG5jb25zdCBlbmNvZGVkID0gbmV3IE1hcCgpO1xyXG5jb25zdCB0b0NvZGVQb2ludCA9IChzKSA9PiBzLmNvZGVQb2ludEF0KDApIHx8IDEyNDsgLy8gXCJ8XCJcIiBzeW1ib2w7XHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgc3RyaW5nIHRvIGFuIGFycmF5IG9mIGNvZGVwb2ludHNcclxuICovXHJcbmZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xyXG4gICAgaWYgKCFlbmNvZGVkLmhhcyhpbnB1dCkpIHtcclxuICAgICAgICBlbmNvZGVkLnNldChpbnB1dCwgaW5wdXQuc3BsaXQoXCJcIikubWFwKHRvQ29kZVBvaW50KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZW5jb2RlZC5nZXQoaW5wdXQpO1xyXG59XG5cbi8vIE1hbmdsZSBhY2Nlc3NvcnNcclxuLyoqXHJcbiAqIEdldCB0aGUgZGlyZWN0IHBhcmVudCBvZiBhIGB2bm9kZWBcclxuICovXHJcbmZ1bmN0aW9uIGdldFZOb2RlUGFyZW50KHZub2RlKSB7XHJcbiAgICByZXR1cm4gdm5vZGUuX3BhcmVudCB8fCB2bm9kZS5fX3AgfHwgbnVsbDtcclxufVxyXG4vKipcclxuICogQ2hlY2sgaWYgYSBgdm5vZGVgIGlzIHRoZSByb290IG9mIGEgdHJlZVxyXG4gKi9cclxuZnVuY3Rpb24gaXNSb290KHZub2RlKSB7XHJcbiAgICAvLyBUT0RPOiBUaGlzIG1heSBicmVhayB3aXRoIGJ1bmRsaW5nIGR1ZSB0byBhIGRpZmZlcmVudFxyXG4gICAgLy8gcmVmZXJlbmNlIHRvIGBGcmFnbWVudGBcclxuICAgIHJldHVybiBnZXRWTm9kZVBhcmVudCh2bm9kZSkgPT0gbnVsbCAmJiB2bm9kZS50eXBlID09PSBGcmFnbWVudDtcclxufVxyXG4vKipcclxuICogUmV0dXJuIHRoZSBjb21wb25lbnQgaW5zdGFuY2Ugb2YgYSBgdm5vZGVgXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRDb21wb25lbnQodm5vZGUpIHtcclxuICAgIHJldHVybiB2bm9kZS5fY29tcG9uZW50IHx8IHZub2RlLl9fYyB8fCBudWxsO1xyXG59XHJcbi8qKlxyXG4gKiBHZXQgYSBgdm5vZGVgJ3MgX2RvbSByZWZlcmVuY2UuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXREb20odm5vZGUpIHtcclxuICAgIHJldHVybiB2bm9kZS5fZG9tIHx8IHZub2RlLl9fZSB8fCBudWxsO1xyXG59XHJcbi8qKlxyXG4gKiBHZXQgdGhlIGxhc3QgZG9tIGNoaWxkIG9mIGEgYHZub2RlYFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0TGFzdERvbUNoaWxkKHZub2RlKSB7XHJcbiAgICByZXR1cm4gdm5vZGUuX2xhc3REb21DaGlsZCB8fCB2bm9kZS5fX3ogfHwgbnVsbDtcclxufVxyXG4vKipcclxuICogQ2hlY2sgaWYgYSBgdm5vZGVgIHJlcHJlc2VudHMgYSBgU3VzcGVuc2VgIGNvbXBvbmVudFxyXG4gKi9cclxuZnVuY3Rpb24gaXNTdXNwZW5zZVZOb2RlKHZub2RlKSB7XHJcbiAgICBjb25zdCBjID0gZ2V0Q29tcG9uZW50KHZub2RlKTtcclxuICAgIC8vIEZJWE1FOiBNYW5nbGluZyBvZiBgX2NoaWxkRGlkU3VzcGVuZGAgaXMgbm90IHN0YWJsZSBpbiBQcmVhY3RcclxuICAgIHJldHVybiBjICE9IG51bGwgJiYgYy5fY2hpbGREaWRTdXNwZW5kO1xyXG59XHJcbi8qKlxyXG4gKiBHZXQgdGhlIGludGVybmFsIGhvb2tzIHN0YXRlIG9mIGEgY29tcG9uZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRDb21wb25lbnRIb29rcyhjKSB7XHJcbiAgICByZXR1cm4gYy5fX2hvb2tzIHx8IGMuX19IIHx8IG51bGw7XHJcbn1cclxuLyoqXHJcbiAqIEdldCB0ZWggZGlmZmVkIGNoaWxkcmVuIG9mIGEgYHZub2RlYFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0QWN0dWFsQ2hpbGRyZW4odm5vZGUpIHtcclxuICAgIHJldHVybiB2bm9kZS5fY2hpbGRyZW4gfHwgdm5vZGUuX19rIHx8IFtdO1xyXG59XHJcbi8vIEVuZCBNYW5nbGUgYWNjZXNzb3JzXHJcbi8qKlxyXG4gKiBHZXQgdGhlIHJvb3Qgb2YgYSBgdm5vZGVgXHJcbiAqL1xyXG5mdW5jdGlvbiBmaW5kUm9vdCh2bm9kZSkge1xyXG4gICAgbGV0IG5leHQgPSB2bm9kZTtcclxuICAgIHdoaWxlICgobmV4dCA9IGdldFZOb2RlUGFyZW50KG5leHQpKSAhPSBudWxsKSB7XHJcbiAgICAgICAgaWYgKGlzUm9vdChuZXh0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV4dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdm5vZGU7XHJcbn1cclxuLyoqXHJcbiAqIEdldCB0aGUgYW5jZXN0b3IgY29tcG9uZW50IHRoYXQgcmVuZGVyZWQgdGhlIGN1cnJlbnQgdm5vZGVcclxuICovXHJcbmZ1bmN0aW9uIGdldEFuY2VzdG9yKHZub2RlKSB7XHJcbiAgICBsZXQgbmV4dCA9IHZub2RlO1xyXG4gICAgd2hpbGUgKChuZXh0ID0gZ2V0Vk5vZGVQYXJlbnQobmV4dCkpICE9IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbmV4dDtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG59XHJcbi8qKlxyXG4gKiBHZXQgaHVtYW4gcmVhZGFibGUgbmFtZSBvZiB0aGUgY29tcG9uZW50L2RvbSBlbGVtZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXREaXNwbGF5TmFtZSh2bm9kZSkge1xyXG4gICAgaWYgKHZub2RlLnR5cGUgPT09IEZyYWdtZW50KVxyXG4gICAgICAgIHJldHVybiBcIkZyYWdtZW50XCI7XHJcbiAgICBlbHNlIGlmICh0eXBlb2Ygdm5vZGUudHlwZSA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIHJldHVybiB2bm9kZS50eXBlLmRpc3BsYXlOYW1lIHx8IHZub2RlLnR5cGUubmFtZTtcclxuICAgIGVsc2UgaWYgKHR5cGVvZiB2bm9kZS50eXBlID09PSBcInN0cmluZ1wiKVxyXG4gICAgICAgIHJldHVybiB2bm9kZS50eXBlO1xyXG4gICAgcmV0dXJuIFwiI3RleHRcIjtcclxufVxuXG52YXIgTXNnVHlwZXM7XHJcbihmdW5jdGlvbiAoTXNnVHlwZXMpIHtcclxuICAgIE1zZ1R5cGVzW01zZ1R5cGVzW1wiQUREX1JPT1RcIl0gPSAxXSA9IFwiQUREX1JPT1RcIjtcclxuICAgIE1zZ1R5cGVzW01zZ1R5cGVzW1wiQUREX1ZOT0RFXCJdID0gMl0gPSBcIkFERF9WTk9ERVwiO1xyXG4gICAgTXNnVHlwZXNbTXNnVHlwZXNbXCJSRU1PVkVfVk5PREVcIl0gPSAzXSA9IFwiUkVNT1ZFX1ZOT0RFXCI7XHJcbiAgICBNc2dUeXBlc1tNc2dUeXBlc1tcIlVQREFURV9WTk9ERV9USU1JTkdTXCJdID0gNF0gPSBcIlVQREFURV9WTk9ERV9USU1JTkdTXCI7XHJcbn0pKE1zZ1R5cGVzIHx8IChNc2dUeXBlcyA9IHt9KSk7XHJcbi8qKlxyXG4gKiBDb2xsZWN0IGFsbCByZWxldmFudCBkYXRhIGZyb20gYSBjb21taXQgYW5kIGNvbnZlcnQgaXQgdG8gYSBtZXNzYWdlXHJcbiAqIHRoZSBkZXRvb2xzIGNhbiB1bmRlcnN0YW5kXHJcbiAqL1xyXG5mdW5jdGlvbiBmbHVzaChjb21taXQpIHtcclxuICAgIGNvbnN0IHsgcm9vdElkLCB1bm1vdW50SWRzLCBvcGVyYXRpb25zLCBzdHJpbmdzIH0gPSBjb21taXQ7XHJcbiAgICBpZiAodW5tb3VudElkcy5sZW5ndGggPT09IDAgJiYgb3BlcmF0aW9ucy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgbGV0IG1zZyA9IFtyb290SWQsIC4uLmZsdXNoVGFibGUoc3RyaW5ncyldO1xyXG4gICAgaWYgKHVubW91bnRJZHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIG1zZy5wdXNoKE1zZ1R5cGVzLlJFTU9WRV9WTk9ERSwgdW5tb3VudElkcy5sZW5ndGgsIC4uLnVubW91bnRJZHMpO1xyXG4gICAgfVxyXG4gICAgbXNnLnB1c2goLi4ub3BlcmF0aW9ucyk7XHJcbiAgICByZXR1cm4geyBuYW1lOiBcIm9wZXJhdGlvblwiLCBkYXRhOiBtc2cgfTtcclxufVxyXG5mdW5jdGlvbiBqc29uaWZ5KGRhdGEpIHtcclxuICAgIGlmIChpc1ZOb2RlKGRhdGEpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogXCJ2bm9kZVwiLFxyXG4gICAgICAgICAgICBuYW1lOiBnZXREaXNwbGF5TmFtZShkYXRhKSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgc3dpdGNoICh0eXBlb2YgZGF0YSkge1xyXG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoID4gMzAwID8gZGF0YS5zbGljZSgzMDApIDogZGF0YTtcclxuICAgICAgICBjYXNlIFwiZnVuY3Rpb25cIjoge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZGF0YS5kaXNwbGF5TmFtZSB8fCBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcclxuICAgICAgICAgICAgaWYgKGRhdGEgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICBjb25zdCBvdXQgPSB7IC4uLmRhdGEgfTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMob3V0KS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgICAgICAgICBvdXRba2V5XSA9IGpzb25pZnkob3V0W2tleV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIG91dDtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBjbGVhblByb3BzKHByb3BzKSB7XHJcbiAgICBpZiAodHlwZW9mIHByb3BzID09PSBcInN0cmluZ1wiIHx8ICFwcm9wcylcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIGNvbnN0IG91dCA9IHsgLi4ucHJvcHMgfTtcclxuICAgIGRlbGV0ZSBvdXQuY2hpbGRyZW47XHJcbiAgICBpZiAoIU9iamVjdC5rZXlzKG91dCkubGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgY29uc29sZS5sb2coXCJwcm9wc1wiLCBvdXQsIHByb3BzKTtcclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuZnVuY3Rpb24gaXNWTm9kZSh4KSB7XHJcbiAgICByZXR1cm4geCAhPSBudWxsICYmIHgudHlwZSAhPT0gdW5kZWZpbmVkICYmIHguX2RvbSAhPT0gdW5kZWZpbmVkO1xyXG59XG5cbi8qKlxyXG4gKiBWTm9kZSByZWxhdGlvbnNoaXBzIGFyZSBlbmNvZGVkIGFzIHNpbXBsZSBudW1iZXJzIGZvciB0aGUgZGV2dG9vbHMuIFdlIHVzZVxyXG4gKiB0aGlzIGZ1bmN0aW9uIHRvIGtlZXAgdHJhY2sgb2YgZXhpc3RpbmcgaWQncyBhbmQgY3JlYXRlIG5ldyBvbmVzIGlmIG5lZWRlZC5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUlkTWFwcGVyKCkge1xyXG4gICAgY29uc3Qgdm5vZGVUb0lkID0gbmV3IFdlYWtNYXAoKTtcclxuICAgIGNvbnN0IGlkVG9WTm9kZSA9IG5ldyBNYXAoKTtcclxuICAgIC8vIE11c3QgbmV2ZXIgYmUgMCwgb3RoZXJ3aXNlIGFuIGluZmluaXRlIGxvb3Agd2lsbCBiZSB0cmlnZ2VyIGluc2lkZVxyXG4gICAgLy8gdGhlIGRldnRvb2xzIGV4dGVuc2lvbiDCr1xcXyjjg4QpXy/Cr1xyXG4gICAgbGV0IHV1aWQgPSAxO1xyXG4gICAgY29uc3QgZ2V0Vk5vZGUgPSAoaWQpID0+IGlkVG9WTm9kZS5nZXQoaWQpIHx8IG51bGw7XHJcbiAgICBjb25zdCBoYXNJZCA9ICh2bm9kZSkgPT4ge1xyXG4gICAgICAgIGlmICh2bm9kZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmICh2bm9kZVRvSWQuaGFzKHZub2RlKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAvLyBpZiAodm5vZGUub2xkICE9IG51bGwpIHJldHVybiB2bm9kZVRvSWQuaGFzKHZub2RlLm9sZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICBjb25zdCBnZXRJZCA9ICh2bm9kZSkgPT4ge1xyXG4gICAgICAgIGxldCBpZCA9IC0xO1xyXG4gICAgICAgIGlmICghdm5vZGVUb0lkLmhhcyh2bm9kZSkpIDtcclxuICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgcmVtb3ZlID0gKHZub2RlKSA9PiB7XHJcbiAgICAgICAgaWYgKGhhc0lkKHZub2RlKSkge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGdldElkKHZub2RlKTtcclxuICAgICAgICAgICAgaWRUb1ZOb2RlLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZub2RlVG9JZC5kZWxldGUodm5vZGUpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGNyZWF0ZUlkID0gKHZub2RlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSB1dWlkKys7XHJcbiAgICAgICAgdm5vZGVUb0lkLnNldCh2bm9kZSwgaWQpO1xyXG4gICAgICAgIGlkVG9WTm9kZS5zZXQoaWQsIHZub2RlKTtcclxuICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgaGFzID0gKGlkKSA9PiBpZFRvVk5vZGUuaGFzKGlkKTtcclxuICAgIHJldHVybiB7IGhhcywgZ2V0Vk5vZGUsIGhhc0lkLCBjcmVhdGVJZCwgZ2V0SWQsIHJlbW92ZSB9O1xyXG59XG5cbnZhciBFbGVtZW50cztcclxuKGZ1bmN0aW9uIChFbGVtZW50cykge1xyXG4gICAgRWxlbWVudHNbRWxlbWVudHNbXCJIVE1MX0VMRU1FTlRcIl0gPSAxXSA9IFwiSFRNTF9FTEVNRU5UXCI7XHJcbiAgICBFbGVtZW50c1tFbGVtZW50c1tcIkNMQVNTX0NPTVBPTkVOVFwiXSA9IDJdID0gXCJDTEFTU19DT01QT05FTlRcIjtcclxuICAgIEVsZW1lbnRzW0VsZW1lbnRzW1wiRlVOQ1RJT05fQ09NUE9ORU5UXCJdID0gM10gPSBcIkZVTkNUSU9OX0NPTVBPTkVOVFwiO1xyXG4gICAgRWxlbWVudHNbRWxlbWVudHNbXCJGT1JXQVJEX1JFRlwiXSA9IDRdID0gXCJGT1JXQVJEX1JFRlwiO1xyXG4gICAgRWxlbWVudHNbRWxlbWVudHNbXCJNRU1PXCJdID0gNV0gPSBcIk1FTU9cIjtcclxuICAgIEVsZW1lbnRzW0VsZW1lbnRzW1wiU1VTUEVOU0VcIl0gPSA2XSA9IFwiU1VTUEVOU0VcIjtcclxufSkoRWxlbWVudHMgfHwgKEVsZW1lbnRzID0ge30pKTtcclxubGV0IG1lbW9SZWcgPSAvXk1lbW9cXCgvO1xyXG5sZXQgZm9yd2FyZFJlZlJlZyA9IC9eRm9yd2FyZFJlZlxcKC87XHJcbi8qKlxyXG4gKiBHZXQgdGhlIHR5cGUgb2YgYSB2bm9kZS4gVGhlIGRldnRvb2xzIHVzZXMgdGhlc2UgY29uc3RhbnRzIHRvIGRpZmZlcmVudGlhdGVcclxuICogYmV0d2VlbiB0aGUgdmFyaW91cyBmb3JtcyBvZiBjb21wb25lbnRzLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RGV2dG9vbHNUeXBlKHZub2RlKSB7XHJcbiAgICBpZiAodHlwZW9mIHZub2RlLnR5cGUgPT0gXCJmdW5jdGlvblwiICYmIHZub2RlLnR5cGUgIT09IEZyYWdtZW50KSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IHZub2RlLnR5cGUuZGlzcGxheU5hbWUgfHwgXCJcIjtcclxuICAgICAgICBpZiAobWVtb1JlZy50ZXN0KG5hbWUpKVxyXG4gICAgICAgICAgICByZXR1cm4gRWxlbWVudHMuTUVNTztcclxuICAgICAgICBpZiAoZm9yd2FyZFJlZlJlZy50ZXN0KG5hbWUpKVxyXG4gICAgICAgICAgICByZXR1cm4gRWxlbWVudHMuRk9SV0FSRF9SRUY7XHJcbiAgICAgICAgaWYgKGlzU3VzcGVuc2VWTm9kZSh2bm9kZSkpXHJcbiAgICAgICAgICAgIHJldHVybiBFbGVtZW50cy5TVVNQRU5TRTtcclxuICAgICAgICAvLyBUT0RPOiBQcm92aWRlciBhbmQgQ29uc3VtZXJcclxuICAgICAgICByZXR1cm4gdm5vZGUudHlwZS5wcm90b3R5cGUgJiYgdm5vZGUudHlwZS5wcm90b3R5cGUucmVuZGVyXHJcbiAgICAgICAgICAgID8gRWxlbWVudHMuQ0xBU1NfQ09NUE9ORU5UXHJcbiAgICAgICAgICAgIDogRWxlbWVudHMuRlVOQ1RJT05fQ09NUE9ORU5UO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEVsZW1lbnRzLkhUTUxfRUxFTUVOVDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVSZW5kZXJlcihob29rKSB7XHJcbiAgICBjb25zdCBpZHMgPSBjcmVhdGVJZE1hcHBlcigpO1xyXG4gICAgY29uc3Qgcm9vdHMgPSBuZXcgU2V0KCk7XHJcbiAgICAvKiogUXVldWUgZXZlbnRzIHVudGlsIHRoZSBleHRlbnNpb24gaXMgY29ubmVjdGVkICovXHJcbiAgICBsZXQgcXVldWUgPSBbXTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0Vk5vZGVCeUlkOiBpZCA9PiBpZHMuZ2V0Vk5vZGUoaWQpLFxyXG4gICAgICAgIGhhczogaWQgPT4gaWRzLmhhcyhpZCksXHJcbiAgICAgICAgbG9nKGlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZub2RlID0gaWRzLmdldFZOb2RlKGlkKTtcclxuICAgICAgICAgICAgaWYgKHZub2RlID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ291bGQgbm90IGZpbmQgdm5vZGUgd2l0aCBpZCAke2lkfWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxvZ1ZOb2RlKHZub2RlLCBpZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbnNwZWN0KGlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZub2RlID0gaWRzLmdldFZOb2RlKGlkKTtcclxuICAgICAgICAgICAgaWYgKCF2bm9kZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICBjb25zdCBoYXNTdGF0ZSA9IHR5cGVvZiB2bm9kZS50eXBlID09PSBcImZ1bmN0aW9uXCIgJiYgdm5vZGUudHlwZSAhPT0gRnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIGNvbnN0IGMgPSBnZXRDb21wb25lbnQodm5vZGUpO1xyXG4gICAgICAgICAgICBjb25zdCBoYXNIb29rcyA9IGMgIT0gbnVsbCAmJiBnZXRDb21wb25lbnRIb29rcyhjKSAhPSBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGNhbkVkaXRIb29rczogaGFzSG9va3MsXHJcbiAgICAgICAgICAgICAgICBob29rczogbnVsbCxcclxuICAgICAgICAgICAgICAgIGlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZ2V0RGlzcGxheU5hbWUodm5vZGUpLFxyXG4gICAgICAgICAgICAgICAgY2FuRWRpdFByb3BzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IHZub2RlLnR5cGUgIT09IG51bGwgPyBqc29uaWZ5KGNsZWFuUHJvcHModm5vZGUucHJvcHMpKSA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBjYW5FZGl0U3RhdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IGhhc1N0YXRlICYmIE9iamVjdC5rZXlzKGMuc3RhdGUpLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgICAgICA/IGpzb25pZnkoYy5zdGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAyLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmluZERvbUZvclZOb2RlKGlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZub2RlID0gaWRzLmdldFZOb2RlKGlkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZub2RlID8gW2dldERvbSh2bm9kZSksIGdldExhc3REb21DaGlsZCh2bm9kZSldIDogbnVsbDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZsdXNoSW5pdGlhbCgpIHtcclxuICAgICAgICAgICAgcXVldWUuZm9yRWFjaChldiA9PiBob29rLmVtaXQoZXYubmFtZSwgZXYuZGF0YSkpO1xyXG4gICAgICAgICAgICBob29rLmNvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHF1ZXVlID0gW107XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkNvbW1pdCh2bm9kZSkge1xyXG4gICAgICAgICAgICBjb25zdCBjb21taXQgPSBjcmVhdGVDb21taXQoaWRzLCByb290cywgdm5vZGUpO1xyXG4gICAgICAgICAgICBjb25zdCBldiA9IGZsdXNoKGNvbW1pdCk7XHJcbiAgICAgICAgICAgIGlmICghZXYpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmIChob29rLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgaG9vay5lbWl0KGV2Lm5hbWUsIGV2LmRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChldik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uVW5tb3VudCh2bm9kZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRPRE86IFVubW91bnQgdm5vZGVcIik7XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn1cclxuLyoqXHJcbiAqIFByaW50IGFuIGVsZW1lbnQgdG8gY29uc29sZVxyXG4gKi9cclxuZnVuY3Rpb24gbG9nVk5vZGUodm5vZGUsIGlkKSB7XHJcbiAgICBjb25zdCBkaXNwbGF5ID0gZ2V0RGlzcGxheU5hbWUodm5vZGUpO1xyXG4gICAgY29uc3QgbmFtZSA9IGRpc3BsYXkgPT09IFwiI3RleHRcIiA/IGRpc3BsYXkgOiBgPCR7ZGlzcGxheSB8fCBcIkNvbXBvbmVudFwifSAvPmA7XHJcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXHJcbiAgICBjb25zb2xlLmdyb3VwKGBMT0cgJWMke25hbWV9YCwgXCJjb2xvcjogI2VhODhmZDsgZm9udC13ZWlnaHQ6IG5vcm1hbFwiKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJvcHM6XCIsIHZub2RlLnByb3BzKTtcclxuICAgIGNvbnN0IGMgPSBnZXRDb21wb25lbnQodm5vZGUpO1xyXG4gICAgaWYgKGMgIT0gbnVsbCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3RhdGU6XCIsIGMuc3RhdGUpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJ2bm9kZTpcIiwgdm5vZGUpO1xyXG4gICAgY29uc29sZS5sb2coXCJkZXZ0b29scyBpZDpcIiwgaWQpO1xyXG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlQ29tbWl0KGlkcywgcm9vdHMsIHZub2RlKSB7XHJcbiAgICBjb25zdCBjb21taXQgPSB7XHJcbiAgICAgICAgb3BlcmF0aW9uczogW10sXHJcbiAgICAgICAgcm9vdElkOiAtMSxcclxuICAgICAgICBzdHJpbmdzOiBuZXcgTWFwKCksXHJcbiAgICAgICAgdW5tb3VudElkczogW10sXHJcbiAgICB9O1xyXG4gICAgbGV0IHBhcmVudElkID0gLTE7XHJcbiAgICBjb25zdCBpc05ldyA9ICFpZHMuaGFzSWQodm5vZGUpO1xyXG4gICAgaWYgKGlzUm9vdCh2bm9kZSkpIHtcclxuICAgICAgICBjb25zdCByb290SWQgPSBpZHMuaGFzSWQodm5vZGUpID8gaWRzLmdldElkKHZub2RlKSA6IGlkcy5jcmVhdGVJZCh2bm9kZSk7XHJcbiAgICAgICAgcGFyZW50SWQgPSBjb21taXQucm9vdElkID0gcm9vdElkO1xyXG4gICAgICAgIHJvb3RzLmFkZCh2bm9kZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCByb290ID0gZmluZFJvb3Qodm5vZGUpO1xyXG4gICAgICAgIGNvbW1pdC5yb290SWQgPSBpZHMuZ2V0SWQocm9vdCk7XHJcbiAgICAgICAgcGFyZW50SWQgPSBpZHMuZ2V0SWQoZ2V0QW5jZXN0b3Iodm5vZGUpKTtcclxuICAgIH1cclxuICAgIGlmIChpc05ldykge1xyXG4gICAgICAgIG1vdW50KGlkcywgY29tbWl0LCB2bm9kZSwgcGFyZW50SWQpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJVUERBVEVcIiwgaWRzLmdldElkKHZub2RlKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY29tbWl0O1xyXG59XHJcbmZ1bmN0aW9uIG1vdW50KGlkcywgY29tbWl0LCB2bm9kZSwgYW5jZXN0b3JJZCkge1xyXG4gICAgY29uc3QgaWQgPSBpZHMuY3JlYXRlSWQodm5vZGUpO1xyXG4gICAgaWYgKGlzUm9vdCh2bm9kZSkpIHtcclxuICAgICAgICBjb21taXQub3BlcmF0aW9ucy5wdXNoKE1zZ1R5cGVzLkFERF9ST09ULCBpZCk7XHJcbiAgICB9XHJcbiAgICBjb21taXQub3BlcmF0aW9ucy5wdXNoKE1zZ1R5cGVzLkFERF9WTk9ERSwgaWQsIGdldERldnRvb2xzVHlwZSh2bm9kZSksIC8vIFR5cGVcclxuICAgIGFuY2VzdG9ySWQsIDk5OTksIC8vIG93bmVyXHJcbiAgICBnZXRTdHJpbmdJZChjb21taXQuc3RyaW5ncywgZ2V0RGlzcGxheU5hbWUodm5vZGUpKSwgdm5vZGUua2V5ID8gZ2V0U3RyaW5nSWQoY29tbWl0LnN0cmluZ3MsIHZub2RlLmtleSkgOiAwKTtcclxuICAgIGNvbnN0IGNoaWxkcmVuID0gZ2V0QWN0dWFsQ2hpbGRyZW4odm5vZGUpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChjaGlsZHJlbltpXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBtb3VudChpZHMsIGNvbW1pdCwgY2hpbGRyZW5baV0sIGlkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cblxudmFyIG4sbCx1LHQsaSxyPXt9LGY9W10sbz0vYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofGdyaWR8b3dzfG1uY3xudHd8aW5lW2NoXXx6b298Xm9yZHxeLS0vaTtmdW5jdGlvbiBlKG4sbCl7Zm9yKHZhciB1IGluIGwpblt1XT1sW3VdO3JldHVybiBufWZ1bmN0aW9uIGMobil7dmFyIGw9bi5wYXJlbnROb2RlO2wmJmwucmVtb3ZlQ2hpbGQobik7fWZ1bmN0aW9uIHMobixsLHUpe3ZhciB0LGkscixmLG89YXJndW1lbnRzO2lmKGw9ZSh7fSxsKSxhcmd1bWVudHMubGVuZ3RoPjMpZm9yKHU9W3VdLHQ9Mzt0PGFyZ3VtZW50cy5sZW5ndGg7dCsrKXUucHVzaChvW3RdKTtpZihudWxsIT11JiYobC5jaGlsZHJlbj11KSxudWxsIT1uJiZudWxsIT1uLmRlZmF1bHRQcm9wcylmb3IoaSBpbiBuLmRlZmF1bHRQcm9wcyl2b2lkIDA9PT1sW2ldJiYobFtpXT1uLmRlZmF1bHRQcm9wc1tpXSk7cmV0dXJuIGY9bC5rZXksbnVsbCE9KHI9bC5yZWYpJiZkZWxldGUgbC5yZWYsbnVsbCE9ZiYmZGVsZXRlIGwua2V5LGEobixsLGYscil9ZnVuY3Rpb24gYShsLHUsdCxpKXt2YXIgcj17dHlwZTpsLHByb3BzOnUsa2V5OnQscmVmOmksX19rOm51bGwsX19wOm51bGwsX19iOjAsX19lOm51bGwsbDpudWxsLF9fYzpudWxsLGNvbnN0cnVjdG9yOnZvaWQgMH07cmV0dXJuIG4udm5vZGUmJm4udm5vZGUocikscn1mdW5jdGlvbiB2KG4pe3JldHVybiBuLmNoaWxkcmVufWZ1bmN0aW9uIHAobil7aWYobnVsbD09bnx8XCJib29sZWFuXCI9PXR5cGVvZiBuKXJldHVybiBudWxsO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBufHxcIm51bWJlclwiPT10eXBlb2YgbilyZXR1cm4gYShudWxsLG4sbnVsbCxudWxsKTtpZihudWxsIT1uLl9fZXx8bnVsbCE9bi5fX2Mpe3ZhciBsPWEobi50eXBlLG4ucHJvcHMsbi5rZXksbnVsbCk7cmV0dXJuIGwuX19lPW4uX19lLGx9cmV0dXJuIG59ZnVuY3Rpb24geShuLGwpe3RoaXMucHJvcHM9bix0aGlzLmNvbnRleHQ9bDt9ZnVuY3Rpb24gZChuLGwpe2lmKG51bGw9PWwpcmV0dXJuIG4uX19wP2Qobi5fX3Asbi5fX3AuX19rLmluZGV4T2YobikrMSk6bnVsbDtmb3IodmFyIHU7bDxuLl9fay5sZW5ndGg7bCsrKWlmKG51bGwhPSh1PW4uX19rW2xdKSYmbnVsbCE9dS5fX2UpcmV0dXJuIHUuX19lO3JldHVybiBcImZ1bmN0aW9uXCI9PXR5cGVvZiBuLnR5cGU/ZChuKTpudWxsfWZ1bmN0aW9uIG0obil7dmFyIGwsdTtpZihudWxsIT0obj1uLl9fcCkmJm51bGwhPW4uX19jKXtmb3Iobi5fX2U9bi5fX2MuYmFzZT1udWxsLGw9MDtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSl7bi5fX2U9bi5fX2MuYmFzZT11Ll9fZTticmVha31yZXR1cm4gbShuKX19ZnVuY3Rpb24gdyh0KXshdC5fX2QmJih0Ll9fZD0hMCkmJjE9PT1sLnB1c2godCkmJihuLmRlYm91bmNlUmVuZGVyaW5nfHx1KShnKTt9ZnVuY3Rpb24gZygpe3ZhciBuO2ZvcihsLnNvcnQoZnVuY3Rpb24obixsKXtyZXR1cm4gbC5fX3YuX19iLW4uX192Ll9fYn0pO249bC5wb3AoKTspbi5fX2QmJm4uZm9yY2VVcGRhdGUoITEpO31mdW5jdGlvbiBrKG4sbCx1LHQsaSxvLGUscyxhKXt2YXIgaCx2LHksbSx3LGcsayxiLHg9bC5fX2t8fF8obC5wcm9wcy5jaGlsZHJlbixsLl9faz1bXSxwLCEwKSxDPXUmJnUuX19rfHxmLFA9Qy5sZW5ndGg7Zm9yKHM9PXImJihzPW51bGwhPW8/b1swXTpQP2QodSwwKTpudWxsKSx2PTA7djx4Lmxlbmd0aDt2KyspaWYobnVsbCE9KGg9eFt2XT1wKHhbdl0pKSl7aWYoaC5fX3A9bCxoLl9fYj1sLl9fYisxLG51bGw9PT0obT1DW3ZdKXx8bSYmaC5rZXk9PW0ua2V5JiZoLnR5cGU9PT1tLnR5cGUpQ1t2XT12b2lkIDA7ZWxzZSBmb3IoeT0wO3k8UDt5Kyspe2lmKChtPUNbeV0pJiZoLmtleT09bS5rZXkmJmgudHlwZT09PW0udHlwZSl7Q1t5XT12b2lkIDA7YnJlYWt9bT1udWxsO31pZih3PU4obixoLG09bXx8cix0LGksbyxlLG51bGwscyxhKSwoeT1oLnJlZikmJm0ucmVmIT15JiYoYnx8KGI9W10pKS5wdXNoKHksaC5fX2N8fHcsaCksbnVsbCE9dyl7aWYobnVsbD09ayYmKGs9dyksbnVsbCE9aC5sKXc9aC5sLGgubD1udWxsO2Vsc2UgaWYobz09bXx8dyE9c3x8bnVsbD09dy5wYXJlbnROb2RlKW46aWYobnVsbD09c3x8cy5wYXJlbnROb2RlIT09biluLmFwcGVuZENoaWxkKHcpO2Vsc2V7Zm9yKGc9cyx5PTA7KGc9Zy5uZXh0U2libGluZykmJnk8UDt5Kz0yKWlmKGc9PXcpYnJlYWsgbjtuLmluc2VydEJlZm9yZSh3LHMpO31zPXcubmV4dFNpYmxpbmcsXCJmdW5jdGlvblwiPT10eXBlb2YgbC50eXBlJiYobC5sPXcpO319aWYobC5fX2U9ayxudWxsIT1vJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBsLnR5cGUpZm9yKHY9by5sZW5ndGg7di0tOyludWxsIT1vW3ZdJiZjKG9bdl0pO2Zvcih2PVA7di0tOyludWxsIT1DW3ZdJiZ6KENbdl0sQ1t2XSk7aWYoYilmb3Iodj0wO3Y8Yi5sZW5ndGg7disrKWooYlt2XSxiWysrdl0sYlsrK3ZdKTt9ZnVuY3Rpb24gXyhuLGwsdSx0KXtpZihudWxsPT1sJiYobD1bXSksbnVsbD09bnx8XCJib29sZWFuXCI9PXR5cGVvZiBuKXQmJmwucHVzaChudWxsKTtlbHNlIGlmKEFycmF5LmlzQXJyYXkobikpZm9yKHZhciBpPTA7aTxuLmxlbmd0aDtpKyspXyhuW2ldLGwsdSx0KTtlbHNlIGwucHVzaCh1P3Uobik6bik7cmV0dXJuIGx9ZnVuY3Rpb24gYihuLGwsdSx0LGkpe3ZhciByO2ZvcihyIGluIHUpciBpbiBsfHxDKG4scixudWxsLHVbcl0sdCk7Zm9yKHIgaW4gbClpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBsW3JdfHxcInZhbHVlXCI9PT1yfHxcImNoZWNrZWRcIj09PXJ8fHVbcl09PT1sW3JdfHxDKG4scixsW3JdLHVbcl0sdCk7fWZ1bmN0aW9uIHgobixsLHUpe1wiLVwiPT09bFswXT9uLnNldFByb3BlcnR5KGwsdSk6bltsXT1cIm51bWJlclwiPT10eXBlb2YgdSYmITE9PT1vLnRlc3QobCk/dStcInB4XCI6dTt9ZnVuY3Rpb24gQyhuLGwsdSx0LGkpe3ZhciByLGYsbyxlLGM7aWYoXCJrZXlcIj09PShsPWk/XCJjbGFzc05hbWVcIj09PWw/XCJjbGFzc1wiOmw6XCJjbGFzc1wiPT09bD9cImNsYXNzTmFtZVwiOmwpfHxcImNoaWxkcmVuXCI9PT1sKTtlbHNlIGlmKFwic3R5bGVcIj09PWwpaWYocj1uLnN0eWxlLFwic3RyaW5nXCI9PXR5cGVvZiB1KXIuY3NzVGV4dD11O2Vsc2V7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQmJihyLmNzc1RleHQ9XCJcIix0PW51bGwpLHQpZm9yKGYgaW4gdCl1JiZmIGluIHV8fHgocixmLFwiXCIpO2lmKHUpZm9yKG8gaW4gdSl0JiZ1W29dPT09dFtvXXx8eChyLG8sdVtvXSk7fWVsc2UgaWYoXCJvXCI9PT1sWzBdJiZcIm5cIj09PWxbMV0pZT1sIT09KGw9bC5yZXBsYWNlKC9DYXB0dXJlJC8sXCJcIikpLGM9bC50b0xvd2VyQ2FzZSgpLGw9KGMgaW4gbj9jOmwpLnNsaWNlKDIpLHU/KHR8fG4uYWRkRXZlbnRMaXN0ZW5lcihsLFAsZSksKG4udXx8KG4udT17fSkpW2xdPXUpOm4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihsLFAsZSk7ZWxzZSBpZihcImxpc3RcIiE9PWwmJlwidGFnTmFtZVwiIT09bCYmIWkmJmwgaW4gbilpZihuLmxlbmd0aCYmXCJ2YWx1ZVwiPT1sKWZvcihsPW4ubGVuZ3RoO2wtLTspbi5vcHRpb25zW2xdLnNlbGVjdGVkPW4ub3B0aW9uc1tsXS52YWx1ZT09dTtlbHNlIG5bbF09bnVsbD09dT9cIlwiOnU7ZWxzZVwiZnVuY3Rpb25cIiE9dHlwZW9mIHUmJlwiZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUxcIiE9PWwmJihsIT09KGw9bC5yZXBsYWNlKC9eeGxpbms6Py8sXCJcIikpP251bGw9PXV8fCExPT09dT9uLnJlbW92ZUF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLGwudG9Mb3dlckNhc2UoKSk6bi5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixsLnRvTG93ZXJDYXNlKCksdSk6bnVsbD09dXx8ITE9PT11P24ucmVtb3ZlQXR0cmlidXRlKGwpOm4uc2V0QXR0cmlidXRlKGwsdSkpO31mdW5jdGlvbiBQKGwpe3JldHVybiB0aGlzLnVbbC50eXBlXShuLmV2ZW50P24uZXZlbnQobCk6bCl9ZnVuY3Rpb24gTihsLHUsdCxpLHIsZixvLGMscyxhKXt2YXIgaCxkLG0sdyxnLGIseCxDLFAsTixUPXUudHlwZTtpZih2b2lkIDAhPT11LmNvbnN0cnVjdG9yKXJldHVybiBudWxsOyhoPW4uX19iKSYmaCh1KTt0cnl7bjppZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBUKXtpZihDPXUucHJvcHMsUD0oaD1ULmNvbnRleHRUeXBlKSYmaVtoLl9fY10sTj1oP1A/UC5wcm9wcy52YWx1ZTpoLl9fcDppLHQuX19jP3g9KGQ9dS5fX2M9dC5fX2MpLl9fcD1kLl9fRTooVC5wcm90b3R5cGUmJlQucHJvdG90eXBlLnJlbmRlcj91Ll9fYz1kPW5ldyBUKEMsTik6KHUuX19jPWQ9bmV3IHkoQyxOKSxkLmNvbnN0cnVjdG9yPVQsZC5yZW5kZXI9QSksUCYmUC5zdWIoZCksZC5wcm9wcz1DLGQuc3RhdGV8fChkLnN0YXRlPXt9KSxkLmNvbnRleHQ9TixkLl9fbj1pLG09ZC5fX2Q9ITAsZC5fX2g9W10pLG51bGw9PWQuX19zJiYoZC5fX3M9ZC5zdGF0ZSksbnVsbCE9VC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJmUoZC5fX3M9PWQuc3RhdGU/ZC5fX3M9ZSh7fSxkLl9fcyk6ZC5fX3MsVC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoQyxkLl9fcykpLG0pbnVsbD09VC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm51bGwhPWQuY29tcG9uZW50V2lsbE1vdW50JiZkLmNvbXBvbmVudFdpbGxNb3VudCgpLG51bGwhPWQuY29tcG9uZW50RGlkTW91bnQmJm8ucHVzaChkKTtlbHNle2lmKG51bGw9PVQuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzJiZudWxsPT1jJiZudWxsIT1kLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMmJmQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhDLE4pLCFjJiZudWxsIT1kLnNob3VsZENvbXBvbmVudFVwZGF0ZSYmITE9PT1kLnNob3VsZENvbXBvbmVudFVwZGF0ZShDLGQuX19zLE4pKXtkLnByb3BzPUMsZC5zdGF0ZT1kLl9fcyxkLl9fZD0hMSxkLl9fdj11LHUuX19lPXQuX19lLHUuX19rPXQuX19rO2JyZWFrIG59bnVsbCE9ZC5jb21wb25lbnRXaWxsVXBkYXRlJiZkLmNvbXBvbmVudFdpbGxVcGRhdGUoQyxkLl9fcyxOKTt9Zm9yKHc9ZC5wcm9wcyxnPWQuc3RhdGUsZC5jb250ZXh0PU4sZC5wcm9wcz1DLGQuc3RhdGU9ZC5fX3MsKGg9bi5fX3IpJiZoKHUpLGQuX19kPSExLGQuX192PXUsZC5fX1A9bCxfKG51bGwhPShoPWQucmVuZGVyKGQucHJvcHMsZC5zdGF0ZSxkLmNvbnRleHQpKSYmaC50eXBlPT12JiZudWxsPT1oLmtleT9oLnByb3BzLmNoaWxkcmVuOmgsdS5fX2s9W10scCwhMCksbnVsbCE9ZC5nZXRDaGlsZENvbnRleHQmJihpPWUoZSh7fSxpKSxkLmdldENoaWxkQ29udGV4dCgpKSksbXx8bnVsbD09ZC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZXx8KGI9ZC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZSh3LGcpKSxrKGwsdSx0LGkscixmLG8scyxhKSxkLmJhc2U9dS5fX2U7aD1kLl9faC5wb3AoKTspaC5jYWxsKGQpO218fG51bGw9PXd8fG51bGw9PWQuY29tcG9uZW50RGlkVXBkYXRlfHxkLmNvbXBvbmVudERpZFVwZGF0ZSh3LGcsYikseCYmKGQuX19FPWQuX19wPW51bGwpO31lbHNlIHUuX19lPSQodC5fX2UsdSx0LGkscixmLG8sYSk7KGg9bi5kaWZmZWQpJiZoKHUpO31jYXRjaChsKXtuLl9fZShsLHUsdCk7fXJldHVybiB1Ll9fZX1mdW5jdGlvbiBUKGwsdSl7Zm9yKHZhciB0O3Q9bC5wb3AoKTspdHJ5e3QuY29tcG9uZW50RGlkTW91bnQoKTt9Y2F0Y2gobCl7bi5fX2UobCx0Ll9fdik7fW4uX19jJiZuLl9fYyh1KTt9ZnVuY3Rpb24gJChuLGwsdSx0LGksbyxlLGMpe3ZhciBzLGEsaCx2LHA9dS5wcm9wcyx5PWwucHJvcHM7aWYoaT1cInN2Z1wiPT09bC50eXBlfHxpLG51bGw9PW4mJm51bGwhPW8pZm9yKHM9MDtzPG8ubGVuZ3RoO3MrKylpZihudWxsIT0oYT1vW3NdKSYmKG51bGw9PT1sLnR5cGU/Mz09PWEubm9kZVR5cGU6YS5sb2NhbE5hbWU9PT1sLnR5cGUpKXtuPWEsb1tzXT1udWxsO2JyZWFrfWlmKG51bGw9PW4pe2lmKG51bGw9PT1sLnR5cGUpcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHkpO249aT9kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLGwudHlwZSk6ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChsLnR5cGUpLG89bnVsbDt9cmV0dXJuIG51bGw9PT1sLnR5cGU/cCE9PXkmJihuLmRhdGE9eSk6bCE9PXUmJihudWxsIT1vJiYobz1mLnNsaWNlLmNhbGwobi5jaGlsZE5vZGVzKSksaD0ocD11LnByb3BzfHxyKS5kYW5nZXJvdXNseVNldElubmVySFRNTCx2PXkuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsY3x8KHZ8fGgpJiYodiYmaCYmdi5fX2h0bWw9PWguX19odG1sfHwobi5pbm5lckhUTUw9diYmdi5fX2h0bWx8fFwiXCIpKSxiKG4seSxwLGksYyksdnx8ayhuLGwsdSx0LFwiZm9yZWlnbk9iamVjdFwiIT09bC50eXBlJiZpLG8sZSxyLGMpLGN8fChcInZhbHVlXCJpbiB5JiZ2b2lkIDAhPT15LnZhbHVlJiZ5LnZhbHVlIT09bi52YWx1ZSYmKG4udmFsdWU9bnVsbD09eS52YWx1ZT9cIlwiOnkudmFsdWUpLFwiY2hlY2tlZFwiaW4geSYmdm9pZCAwIT09eS5jaGVja2VkJiZ5LmNoZWNrZWQhPT1uLmNoZWNrZWQmJihuLmNoZWNrZWQ9eS5jaGVja2VkKSkpLG59ZnVuY3Rpb24gaihsLHUsdCl7dHJ5e1wiZnVuY3Rpb25cIj09dHlwZW9mIGw/bCh1KTpsLmN1cnJlbnQ9dTt9Y2F0Y2gobCl7bi5fX2UobCx0KTt9fWZ1bmN0aW9uIHoobCx1LHQpe3ZhciBpLHIsZjtpZihuLnVubW91bnQmJm4udW5tb3VudChsKSwoaT1sLnJlZikmJmooaSxudWxsLHUpLHR8fFwiZnVuY3Rpb25cIj09dHlwZW9mIGwudHlwZXx8KHQ9bnVsbCE9KHI9bC5fX2UpKSxsLl9fZT1sLmw9bnVsbCxudWxsIT0oaT1sLl9fYykpe2lmKGkuY29tcG9uZW50V2lsbFVubW91bnQpdHJ5e2kuY29tcG9uZW50V2lsbFVubW91bnQoKTt9Y2F0Y2gobCl7bi5fX2UobCx1KTt9aS5iYXNlPWkuX19QPW51bGw7fWlmKGk9bC5fX2spZm9yKGY9MDtmPGkubGVuZ3RoO2YrKylpW2ZdJiZ6KGlbZl0sdSx0KTtudWxsIT1yJiZjKHIpO31mdW5jdGlvbiBBKG4sbCx1KXtyZXR1cm4gdGhpcy5jb25zdHJ1Y3RvcihuLHUpfWZ1bmN0aW9uIEQobCx1LGkpe3ZhciBvLGUsYztuLl9fcCYmbi5fX3AobCx1KSxlPShvPWk9PT10KT9udWxsOmkmJmkuX19rfHx1Ll9fayxsPXModixudWxsLFtsXSksYz1bXSxOKHUsbz91Ll9faz1sOihpfHx1KS5fX2s9bCxlfHxyLHIsdm9pZCAwIT09dS5vd25lclNWR0VsZW1lbnQsaSYmIW8/W2ldOmU/bnVsbDpmLnNsaWNlLmNhbGwodS5jaGlsZE5vZGVzKSxjLCExLGl8fHIsbyksVChjLGwpO31mdW5jdGlvbiBMKG4pe3ZhciBsPXt9LHU9e19fYzpcIl9fY0NcIitpKyssX19wOm4sQ29uc3VtZXI6ZnVuY3Rpb24obixsKXtyZXR1cm4gbi5jaGlsZHJlbihsKX0sUHJvdmlkZXI6ZnVuY3Rpb24obil7dmFyIHQsaT10aGlzO3JldHVybiB0aGlzLmdldENoaWxkQ29udGV4dHx8KHQ9W10sdGhpcy5nZXRDaGlsZENvbnRleHQ9ZnVuY3Rpb24oKXtyZXR1cm4gbFt1Ll9fY109aSxsfSx0aGlzLnNob3VsZENvbXBvbmVudFVwZGF0ZT1mdW5jdGlvbihuKXt0LnNvbWUoZnVuY3Rpb24obCl7bC5fX1AmJihsLmNvbnRleHQ9bi52YWx1ZSx3KGwpKTt9KTt9LHRoaXMuc3ViPWZ1bmN0aW9uKG4pe3QucHVzaChuKTt2YXIgbD1uLmNvbXBvbmVudFdpbGxVbm1vdW50O24uY29tcG9uZW50V2lsbFVubW91bnQ9ZnVuY3Rpb24oKXt0LnNwbGljZSh0LmluZGV4T2YobiksMSksbCYmbC5jYWxsKG4pO307fSksbi5jaGlsZHJlbn19O3JldHVybiB1LkNvbnN1bWVyLmNvbnRleHRUeXBlPXUsdX1uPXt9LHkucHJvdG90eXBlLnNldFN0YXRlPWZ1bmN0aW9uKG4sbCl7dmFyIHU9dGhpcy5fX3MhPT10aGlzLnN0YXRlJiZ0aGlzLl9fc3x8KHRoaXMuX19zPWUoe30sdGhpcy5zdGF0ZSkpOyhcImZ1bmN0aW9uXCIhPXR5cGVvZiBufHwobj1uKHUsdGhpcy5wcm9wcykpKSYmZSh1LG4pLG51bGwhPW4mJnRoaXMuX192JiYobCYmdGhpcy5fX2gucHVzaChsKSx3KHRoaXMpKTt9LHkucHJvdG90eXBlLmZvcmNlVXBkYXRlPWZ1bmN0aW9uKG4pe3ZhciBsLHUsdCxpPXRoaXMuX192LHI9dGhpcy5fX3YuX19lLGY9dGhpcy5fX1A7ZiYmKGw9ITEhPT1uLHU9W10sdD1OKGYsaSxlKHt9LGkpLHRoaXMuX19uLHZvaWQgMCE9PWYub3duZXJTVkdFbGVtZW50LG51bGwsdSxsLG51bGw9PXI/ZChpKTpyKSxUKHUsaSksdCE9ciYmbShpKSksbiYmbigpO30seS5wcm90b3R5cGUucmVuZGVyPXYsbD1bXSx1PVwiZnVuY3Rpb25cIj09dHlwZW9mIFByb21pc2U/UHJvbWlzZS5wcm90b3R5cGUudGhlbi5iaW5kKFByb21pc2UucmVzb2x2ZSgpKTpzZXRUaW1lb3V0LG4uX19lPWZ1bmN0aW9uKG4sbCx1KXtmb3IodmFyIHQ7bD1sLl9fcDspaWYoKHQ9bC5fX2MpJiYhdC5fX3ApdHJ5e2lmKHQuY29uc3RydWN0b3ImJm51bGwhPXQuY29uc3RydWN0b3IuZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKXQuc2V0U3RhdGUodC5jb25zdHJ1Y3Rvci5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IobikpO2Vsc2V7aWYobnVsbD09dC5jb21wb25lbnREaWRDYXRjaCljb250aW51ZTt0LmNvbXBvbmVudERpZENhdGNoKG4pO31yZXR1cm4gdyh0Ll9fRT10KX1jYXRjaChsKXtuPWw7fXRocm93IG59LHQ9cixpPTA7XG5cbnZhciB0JDEsciQxLHUkMT1bXSxpJDE9bi5fX3I7bi5fX3I9ZnVuY3Rpb24obil7aSQxJiZpJDEobiksdCQxPTAsKHIkMT1uLl9fYykuX19IJiYociQxLl9fSC50PXckMShyJDEuX19ILnQpKTt9O3ZhciBvJDE9bi5kaWZmZWQ7bi5kaWZmZWQ9ZnVuY3Rpb24obil7byQxJiZvJDEobik7dmFyIHQ9bi5fX2M7aWYodCl7dmFyIHI9dC5fX0g7ciYmKHIudT13JDEoci51KSk7fX07dmFyIGYkMT1uLnVubW91bnQ7ZnVuY3Rpb24gYyQxKHQpe24uX19oJiZuLl9faChyJDEpO3ZhciB1PXIkMS5fX0h8fChyJDEuX19IPXtpOltdLHQ6W10sdTpbXX0pO3JldHVybiB0Pj11LmkubGVuZ3RoJiZ1LmkucHVzaCh7fSksdS5pW3RdfWZ1bmN0aW9uIGUkMShuKXtyZXR1cm4gYSQxKHEsbil9ZnVuY3Rpb24gYSQxKG4sdSxpKXt2YXIgbz1jJDEodCQxKyspO3JldHVybiBvLl9fY3x8KG8uX19jPXIkMSxvLm89W2k/aSh1KTpxKG51bGwsdSksZnVuY3Rpb24odCl7dmFyIHI9bihvLm9bMF0sdCk7by5vWzBdIT09ciYmKG8ub1swXT1yLG8uX19jLnNldFN0YXRlKHt9KSk7fV0pLG8ub31mdW5jdGlvbiB2JDEobix1KXt2YXIgaT1jJDEodCQxKyspO0YoaS52LHUpJiYoaS5vPW4saS52PXUsciQxLl9fSC50LnB1c2goaSksXyQxKHIkMSkpO31mdW5jdGlvbiB5JDEobil7dmFyIHU9ciQxLmNvbnRleHRbbi5fX2NdO2lmKCF1KXJldHVybiBuLl9fcDt2YXIgaT1jJDEodCQxKyspO3JldHVybiBudWxsPT1pLm8mJihpLm89ITAsdS5zdWIociQxKSksdS5wcm9wcy52YWx1ZX1uLnVubW91bnQ9ZnVuY3Rpb24obil7ZiQxJiZmJDEobik7dmFyIHQ9bi5fX2M7aWYodCl7dmFyIHI9dC5fX0g7ciYmci5pLmZvckVhY2goZnVuY3Rpb24obil7cmV0dXJuIG4ucCYmbi5wKCl9KTt9fTt2YXIgXyQxPWZ1bmN0aW9uKCl7fTtmdW5jdGlvbiBnJDEoKXt1JDEuc29tZShmdW5jdGlvbihuKXtuLmw9ITEsbi5fX1AmJihuLl9fSC50PXckMShuLl9fSC50KSk7fSksdSQxPVtdO31mdW5jdGlvbiB3JDEobil7cmV0dXJuIG4uZm9yRWFjaChBJDEpLG4uZm9yRWFjaChFKSxbXX1mdW5jdGlvbiBBJDEobil7bi5wJiZuLnAoKTt9ZnVuY3Rpb24gRShuKXt2YXIgdD1uLm8oKTtcImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobi5wPXQpO31mdW5jdGlvbiBGKG4sdCl7cmV0dXJuICFufHx0LnNvbWUoZnVuY3Rpb24odCxyKXtyZXR1cm4gdCE9PW5bcl19KX1mdW5jdGlvbiBxKG4sdCl7cmV0dXJuIFwiZnVuY3Rpb25cIj09dHlwZW9mIHQ/dChuKTp0fVwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3cmJihfJDE9ZnVuY3Rpb24odCl7IXQubCYmKHQubD0hMCkmJjE9PT11JDEucHVzaCh0KSYmKG4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHxmdW5jdGlvbihuKXt2YXIgdD1mdW5jdGlvbigpe2NsZWFyVGltZW91dChyKSxjYW5jZWxBbmltYXRpb25GcmFtZSh1KSxzZXRUaW1lb3V0KG4pO30scj1zZXRUaW1lb3V0KHQsMTAwKSx1PXJlcXVlc3RBbmltYXRpb25GcmFtZSh0KTt9KShnJDEpO30pO1xuXG4vLyBUT0RPOiBUaGlzIGlzIGZpbmUgZm9yIGFuIE1WUCBidXQgbm90IGEgZ29pZCBjaG9pY2UgZm9yIHByb2R1Y3Rpb24gZHVlIHRvXHJcbi8vIG1pc3NpbmcgZmVhdHVyZXMgbGlrZSBwcm9wZXIgdW5zdWJzY3JpcHRpb24gaGFuZGxpbmdcclxuZnVuY3Rpb24gdmFsb28odikge1xyXG4gICAgY29uc3QgY2IgPSBbXTtcclxuICAgIGZ1bmN0aW9uIHZhbHVlKGMpIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgY2IubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICAgICAgZiAmJiBmKCh2ID0gYykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdjtcclxuICAgIH1cclxuICAgIHZhbHVlLm9uID0gKGMpID0+IHtcclxuICAgICAgICBjb25zdCBpID0gY2IucHVzaChjKSAtIDE7XHJcbiAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgICAgY2JbaV0gPSAwO1xyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbmZ1bmN0aW9uIHRyYWNrKGZuLCBzdWJzKSB7XHJcbiAgICBsZXQgdiA9IHN1YnMubWFwKHggPT4geCgpKTtcclxuICAgIGxldCBvdXQgPSB2YWxvbyhmbigpKTtcclxuICAgIHN1YnMuZm9yRWFjaCh4ID0+IHtcclxuICAgICAgICB4Lm9uKG4gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpZHggPSBzdWJzLmluZGV4T2YoeCk7XHJcbiAgICAgICAgICAgIHZbaWR4XSA9IG47XHJcbiAgICAgICAgICAgIG91dChmbigpKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gcHJveGlmeTxUIGV4dGVuZHMgb2JqZWN0PihvYmo6IFQpOiBUIHtcclxuLy8gXHRmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcclxuLy8gICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KSE7XHJcbi8vICAgICBpZiAoZGVzYy5nZXQpIHtcclxuLy8gICAgICAgY29uc3QgZm4gPSBkZXNjLmdldDtcclxuLy8gICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XHJcbi8vICAgICAgICAgZ2V0KCkge1xyXG4vLyAgICAgICAgICAgcmV0dXJuIGZuXHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICB9KVxyXG4vLyAgICAgICAvLyBjb21wdXRlZFxyXG4vLyAgICAgfVxyXG4vLyAgICAgZWxzZSBpZiAodHlwZW9mIG9ialtrZXldICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuLy8gICAgIH1cclxuLy8gICB9XHJcbi8vIH1cblxudmFyIERldk5vZGVUeXBlO1xyXG4oZnVuY3Rpb24gKERldk5vZGVUeXBlKSB7XHJcbiAgICBEZXZOb2RlVHlwZVtEZXZOb2RlVHlwZVtcIkZ1bmN0aW9uQ29tcG9uZW50XCJdID0gMF0gPSBcIkZ1bmN0aW9uQ29tcG9uZW50XCI7XHJcbiAgICBEZXZOb2RlVHlwZVtEZXZOb2RlVHlwZVtcIkNsYXNzQ29tcG9uZW50XCJdID0gMV0gPSBcIkNsYXNzQ29tcG9uZW50XCI7XHJcbiAgICBEZXZOb2RlVHlwZVtEZXZOb2RlVHlwZVtcIkVsZW1lbnRcIl0gPSAyXSA9IFwiRWxlbWVudFwiO1xyXG4gICAgRGV2Tm9kZVR5cGVbRGV2Tm9kZVR5cGVbXCJGb3J3YXJkUmVmXCJdID0gM10gPSBcIkZvcndhcmRSZWZcIjtcclxuICAgIERldk5vZGVUeXBlW0Rldk5vZGVUeXBlW1wiTWVtb1wiXSA9IDRdID0gXCJNZW1vXCI7XHJcbiAgICBEZXZOb2RlVHlwZVtEZXZOb2RlVHlwZVtcIkNvbnRleHRcIl0gPSA1XSA9IFwiQ29udGV4dFwiO1xyXG4gICAgRGV2Tm9kZVR5cGVbRGV2Tm9kZVR5cGVbXCJDb25zdW1lclwiXSA9IDZdID0gXCJDb25zdW1lclwiO1xyXG4gICAgRGV2Tm9kZVR5cGVbRGV2Tm9kZVR5cGVbXCJTdXNwZW5zZVwiXSA9IDddID0gXCJTdXNwZW5zZVwiO1xyXG59KShEZXZOb2RlVHlwZSB8fCAoRGV2Tm9kZVR5cGUgPSB7fSkpO1xyXG5jb25zdCBFTVBUWV9JTlNQRUNUID0ge1xyXG4gICAgY29udGV4dDogbnVsbCxcclxuICAgIGhvb2tzOiBudWxsLFxyXG4gICAgY2FuRWRpdFN0YXRlOiBmYWxzZSxcclxuICAgIGNhbkVkaXRIb29rczogZmFsc2UsXHJcbiAgICBjYW5FZGl0UHJvcHM6IGZhbHNlLFxyXG4gICAgaWQ6IC0xLFxyXG4gICAgbmFtZTogXCIuXCIsXHJcbiAgICBwcm9wczogbnVsbCxcclxuICAgIHN0YXRlOiBudWxsLFxyXG4gICAgdHlwZTogMixcclxufTtcclxuZnVuY3Rpb24gY3JlYXRlU3RvcmUoKSB7XHJcbiAgICBsZXQgbGlzdGVuZXJzID0gW107XHJcbiAgICBjb25zdCBub3RpZnkgPSAobmFtZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZuID0+IGZuICYmIGZuKG5hbWUsIGRhdGEpKTtcclxuICAgIH07XHJcbiAgICBjb25zdCBub2RlcyA9IHZhbG9vKG5ldyBNYXAoKSk7XHJcbiAgICBjb25zdCByb290cyA9IHZhbG9vKFtdKTtcclxuICAgIGNvbnN0IHJvb3RUb0NoaWxkID0gdmFsb28obmV3IE1hcCgpKTtcclxuICAgIC8vIFNlbGVjdGlvblxyXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gdmFsb28obnVsbCk7XHJcbiAgICBjb25zdCBzZWxlY3RlZFJlZiA9IHZhbG9vKG51bGwpO1xyXG4gICAgLy8gVG9nZ2xlXHJcbiAgICBjb25zdCBjb2xsYXBzZWQgPSB2YWxvbyhuZXcgU2V0KCkpO1xyXG4gICAgY29uc3QgaGlkZGVuID0gdHJhY2soKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG91dCA9IG5ldyBTZXQoKTtcclxuICAgICAgICBjb2xsYXBzZWQoKS5mb3JFYWNoKGlkID0+IGdldEFsbENoaWxkcmVuKG5vZGVzKCksIGlkKS5mb3JFYWNoKGNoaWxkID0+IG91dC5hZGQoY2hpbGQpKSk7XHJcbiAgICAgICAgcmV0dXJuIG91dDtcclxuICAgIH0sIFtjb2xsYXBzZWQsIG5vZGVzXSk7XHJcbiAgICBjb25zdCBpbnNwZWN0RGF0YSA9IHZhbG9vKEVNUFRZX0lOU1BFQ1QpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbnNwZWN0RGF0YSxcclxuICAgICAgICByb290cyxcclxuICAgICAgICByb290VG9DaGlsZCxcclxuICAgICAgICBub2RlcyxcclxuICAgICAgICBzZWxlY3RlZDogc2VsZWN0ZWROb2RlLFxyXG4gICAgICAgIHNlbGVjdGVkUmVmLFxyXG4gICAgICAgIHZpc2libGl0eToge1xyXG4gICAgICAgICAgICBjb2xsYXBzZWQsXHJcbiAgICAgICAgICAgIGhpZGRlbixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjdGlvbnM6IHtcclxuICAgICAgICAgICAgY29sbGFwc2VOb2RlOiBpZCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbGxhcHNlZCgpLmhhcyhpZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQoKS5hZGQoaWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkKCkuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbGxhcHNlZChjb2xsYXBzZWQoKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdE5vZGU6IChpZCwgcmVmKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKCkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKCkuaWQgPT09IGlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2RlKCkuc2VsZWN0ZWQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzKCkuZ2V0KGlkKTtcclxuICAgICAgICAgICAgICAgIG5vZGUuc2VsZWN0ZWQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFJlZihyZWYpO1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWROb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgbm90aWZ5KFwiaW5zcGVjdFwiLCBpZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodE5vZGU6IGlkID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShcImhpZ2hsaWdodFwiLCBpZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGxvZ05vZGU6IGlkID0+IHtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShcImxvZ1wiLCBpZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHVwZGF0ZU5vZGUoaWQsIHR5cGUsIHBhdGgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBub3RpZnkoXCJ1cGRhdGUtbm9kZVwiLCB7IGlkLCB0eXBlLCBwYXRoLCB2YWx1ZSB9KTtcclxuICAgICAgICAgICAgICAgIG5vdGlmeShcImluc3BlY3RcIiwgaWQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjbGVhcigpIHtcclxuICAgICAgICAgICAgICAgIGluc3BlY3REYXRhKEVNUFRZX0lOU1BFQ1QpO1xyXG4gICAgICAgICAgICAgICAgbm9kZXMobmV3IE1hcCgpKTtcclxuICAgICAgICAgICAgICAgIHJvb3RzKFtdKTtcclxuICAgICAgICAgICAgICAgIHJvb3RUb0NoaWxkKG5ldyBNYXAoKSk7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE5vZGUobnVsbCk7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFJlZihudWxsKTtcclxuICAgICAgICAgICAgICAgIGNvbGxhcHNlZChuZXcgU2V0KCkpO1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJzY3JpYmUoZm4pIHtcclxuICAgICAgICAgICAgY29uc3QgaWR4ID0gbGlzdGVuZXJzLnB1c2goZm4pO1xyXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gKGxpc3RlbmVyc1tpZHhdID0gbnVsbCk7XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn1cclxuZnVuY3Rpb24gZ2V0QWxsQ2hpbGRyZW4odHJlZSwgaWQpIHtcclxuICAgIGNvbnN0IG91dCA9IFtdO1xyXG4gICAgY29uc3QgdmlzaXRlZCA9IG5ldyBTZXQoKTtcclxuICAgIGxldCBpdGVtO1xyXG4gICAgbGV0IHN0YWNrID0gW2lkXTtcclxuICAgIHdoaWxlICgoaXRlbSA9IHN0YWNrLnBvcCgpKSkge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSB0cmVlLmdldChpdGVtKTtcclxuICAgICAgICBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKG5vZGUuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBvdXQucHVzaChub2RlLmlkKTtcclxuICAgICAgICAgICAgICAgIHZpc2l0ZWQuYWRkKG5vZGUuaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4ucmV2ZXJzZSgpLmZvckVhY2goeCA9PiBzdGFjay5wdXNoKHgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3V0O1xyXG59XHJcbmNvbnN0IEFwcEN0eCA9IEwobnVsbCk7XHJcbmNvbnN0IHVzZVN0b3JlID0gKCkgPT4geSQxKEFwcEN0eCk7XHJcbmZ1bmN0aW9uIHVzZU9ic2VydmVyKGZuLCBkZXBzKSB7XHJcbiAgICBsZXQgW2ksIHNldEldID0gZSQxKDApO1xyXG4gICAgdiQxKCgpID0+IHtcclxuICAgICAgICBjb25zdCBzdWJzID0gZGVwcy5tYXAoeCA9PiB4Lm9uKCgpID0+IHNldEkoKytpKSkpO1xyXG4gICAgICAgIHJldHVybiAoKSA9PiBzdWJzLmZvckVhY2goeCA9PiB4KCkpO1xyXG4gICAgfSwgW10pO1xyXG4gICAgcmV0dXJuIGZuKCk7XHJcbn1cblxudmFyIHMkMSA9IHtcInRyZWVcIjpcIlRyZWVfdHJlZV9fMmRvMGZcIixcIml0ZW1cIjpcIlRyZWVfaXRlbV9fMThMOEZcIixcIml0ZW1IZWFkZXJcIjpcIlRyZWVfaXRlbUhlYWRlcl9fM1RnaHJcIixcInRvZ2dsZVwiOlwiVHJlZV90b2dnbGVfXzM0RkdZXCIsXCJub1RvZ2dsZVwiOlwiVHJlZV9ub1RvZ2dsZV9fcmhvcHZcIixcImRpbW1lclwiOlwiVHJlZV9kaW1tZXJfXzFxOUpUXCJ9O1xuXG4vKipcclxuICogR2V0J3MgdGhlIGxhc3QgRE9NIGNoaWxkIGJ5IGRlcHRoIGluIHRoZSByZW5kZXJlZCB0cmVlIGxpc3QuIEFzc3VtZXNcclxuICogdGhhdCBhbGwgaXRlbXMgaGF2ZSBhIG51bWVyaWMgYGRhdGEtZGVwdGhgIGF0dHJpYnV0ZS5cclxuICovXHJcbmZ1bmN0aW9uIGdldExhc3REb21DaGlsZCQxKGRvbSkge1xyXG4gICAgY29uc3QgZGVwdGggPSBkb20uZ2V0QXR0cmlidXRlKFwiZGF0YS1kZXB0aFwiKSB8fCAwO1xyXG4gICAgbGV0IGl0ZW0gPSBkb207XHJcbiAgICBsZXQgbGFzdCA9IG51bGw7XHJcbiAgICB3aGlsZSAoKGl0ZW0gPSBpdGVtLm5leHRTaWJsaW5nKSAmJlxyXG4gICAgICAgICsoaXRlbS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWRlcHRoXCIpIHx8IDApID4gK2RlcHRoKSB7XHJcbiAgICAgICAgbGFzdCA9IGl0ZW07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbGFzdDtcclxufVxuXG5mdW5jdGlvbiBUcmVlVmlldyhwcm9wcykge1xyXG4gICAgY29uc3Qgc3RvcmUgPSB1c2VTdG9yZSgpO1xyXG4gICAgY29uc3Qgbm9kZXMgPSB1c2VPYnNlcnZlcigoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGdldEFsbENoaWxkcmVuKHN0b3JlLm5vZGVzKCksIHN0b3JlLnJvb3RUb0NoaWxkKCkuZ2V0KHByb3BzLnJvb3RJZCkpO1xyXG4gICAgfSwgW3N0b3JlLm5vZGVzLCBzdG9yZS5yb290VG9DaGlsZF0pO1xyXG4gICAgcmV0dXJuIChzKFwiZGl2XCIsIHsgY2xhc3M6IHMkMS50cmVlLCBvbk1vdXNlTGVhdmU6ICgpID0+IHN0b3JlLmFjdGlvbnMuaGlnaGxpZ2h0Tm9kZShudWxsKSB9LFxyXG4gICAgICAgIG5vZGVzLm1hcChpZCA9PiAocyhUcmVlSXRlbSwgeyBrZXk6IGlkLCBpZDogaWQgfSkpKSxcclxuICAgICAgICBzKEhpZ2hsaWdodFBhbmUsIG51bGwpKSk7XHJcbn1cclxuZnVuY3Rpb24gVHJlZUl0ZW0ocHJvcHMpIHtcclxuICAgIGNvbnN0IHsgaWQgfSA9IHByb3BzO1xyXG4gICAgY29uc3Qgc3RvcmUgPSB1c2VTdG9yZSgpO1xyXG4gICAgY29uc3QgeyBvblNlbGVjdCwgY29sbGFwc2VkLCBvblRvZ2dsZSwgbm9kZSwgaGlkZGVuLCBzZWxlY3RlZCwgb25Ib3ZlciwgfSA9IHVzZU9ic2VydmVyKCgpID0+IHtcclxuICAgICAgICBjb25zdCBub2RlID0gc3RvcmUubm9kZXMoKS5nZXQoaWQpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkOiBub2RlID8gbm9kZS5zZWxlY3RlZCgpIDogZmFsc2UsXHJcbiAgICAgICAgICAgIG9uU2VsZWN0OiBzdG9yZS5hY3Rpb25zLnNlbGVjdE5vZGUsXHJcbiAgICAgICAgICAgIGNvbGxhcHNlZDogc3RvcmUudmlzaWJsaXR5LmNvbGxhcHNlZCgpLmhhcyhpZCksXHJcbiAgICAgICAgICAgIGhpZGRlbjogc3RvcmUudmlzaWJsaXR5LmhpZGRlbigpLmhhcyhpZCksXHJcbiAgICAgICAgICAgIG9uVG9nZ2xlOiBzdG9yZS5hY3Rpb25zLmNvbGxhcHNlTm9kZSxcclxuICAgICAgICAgICAgb25Ib3Zlcjogc3RvcmUuYWN0aW9ucy5oaWdobGlnaHROb2RlLFxyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgIH07XHJcbiAgICB9LCBbXHJcbiAgICAgICAgc3RvcmUubm9kZXMsXHJcbiAgICAgICAgc3RvcmUubm9kZXMoKS5nZXQoaWQpLnNlbGVjdGVkLFxyXG4gICAgICAgIHN0b3JlLnZpc2libGl0eS5jb2xsYXBzZWQsXHJcbiAgICAgICAgc3RvcmUudmlzaWJsaXR5LmhpZGRlbixcclxuICAgIF0pO1xyXG4gICAgaWYgKCFub2RlIHx8IGhpZGRlbilcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIHJldHVybiAocyhcImRpdlwiLCB7IGNsYXNzOiBzJDEuaXRlbSwgb25DbGljazogZXYgPT4gb25TZWxlY3QoaWQsIGV2LmN1cnJlbnRUYXJnZXQpLCBvbk1vdXNlRW50ZXI6ICgpID0+IG9uSG92ZXIoaWQpLCBcImRhdGEtc2VsZWN0ZWRcIjogc2VsZWN0ZWQsIFwiZGF0YS1kZXB0aFwiOiBub2RlLmRlcHRoLCBzdHlsZTogYHBhZGRpbmctbGVmdDogY2FsYyh2YXIoLS1pbmRlbnQtZGVwdGgpICogJHtub2RlLmRlcHRofSlgIH0sXHJcbiAgICAgICAgcyhcImRpdlwiLCB7IGNsYXNzOiBzJDEuaXRlbUhlYWRlciB9LFxyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgKHMoXCJidXR0b25cIiwgeyBjbGFzczogcyQxLnRvZ2dsZSwgXCJkYXRhLWNvbGxhcHNlZFwiOiBjb2xsYXBzZWQsIG9uQ2xpY2s6ICgpID0+IG9uVG9nZ2xlKGlkKSB9LFxyXG4gICAgICAgICAgICAgICAgcyhBcnJvdywgbnVsbCkpKSxcclxuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5sZW5ndGggPT09IDAgJiYgcyhcImRpdlwiLCB7IGNsYXNzOiBzJDEubm9Ub2dnbGUgfSksXHJcbiAgICAgICAgICAgIHMoXCJzcGFuXCIsIHsgY2xhc3M6IHMkMS5uYW1lIH0sIG5vZGUubmFtZSkpKSk7XHJcbn1cclxuZnVuY3Rpb24gQXJyb3coKSB7XHJcbiAgICByZXR1cm4gKHMoXCJzdmdcIiwgeyB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCB3aWR0aDogXCIxNlwiLCBoZWlnaHQ6IFwiMTZcIiwgdmlld0JveDogXCIwIDAgNC4yMzMgNC4yMzNcIiB9LFxyXG4gICAgICAgIHMoXCJwYXRoXCIsIHsgZDogXCJNMS4xMjQgMS42MjdIMy4xMWwtLjk5MiAxLjE5MS0uOTkzLTEuMTlcIiwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiB9KSkpO1xyXG59XHJcbmZ1bmN0aW9uIEhpZ2hsaWdodFBhbmUoKSB7XHJcbiAgICBjb25zdCBzdG9yZSA9IHVzZVN0b3JlKCk7XHJcbiAgICBjb25zdCByZWYgPSB1c2VPYnNlcnZlcigoKSA9PiBzdG9yZS5zZWxlY3RlZFJlZigpLCBbc3RvcmUuc2VsZWN0ZWRSZWZdKTtcclxuICAgIGxldCBbcG9zLCBzZXRQb3NdID0gZSQxKHsgdG9wOiAwLCBoZWlnaHQ6IDAgfSk7XHJcbiAgICB2JDEoKCkgPT4ge1xyXG4gICAgICAgIGlmIChyZWYpIHtcclxuICAgICAgICAgICAgY29uc3QgbGFzdCA9IGdldExhc3REb21DaGlsZCQxKHJlZik7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSByZWYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRvcCA9IHJlZi5vZmZzZXRUb3AgKyByZWN0LmhlaWdodDtcclxuICAgICAgICAgICAgbGV0IGhlaWdodCA9IDA7XHJcbiAgICAgICAgICAgIGlmIChsYXN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0UmVjdCA9IGxhc3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBsYXN0Lm9mZnNldFRvcCArIGxhc3RSZWN0LmhlaWdodCAtIHRvcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRQb3MoeyB0b3AsIGhlaWdodCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFBvcyh7IHRvcDogMCwgaGVpZ2h0OiAwIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sIFtyZWZdKTtcclxuICAgIHJldHVybiAocyhcImRpdlwiLCB7IGNsYXNzOiBzJDEuZGltbWVyLCBzdHlsZTogYHRvcDogJHtwb3MudG9wfXB4OyBoZWlnaHQ6ICR7cG9zLmhlaWdodH1weDtgIH0pKTtcclxufVxuXG52YXIgcyQyID0ge1wicm9vdFwiOlwiU2lkZWJhcl9yb290X18yNGxnYVwiLFwidGl0bGVcIjpcIlNpZGViYXJfdGl0bGVfXzFrV0Y0XCIsXCJib2R5XCI6XCJTaWRlYmFyX2JvZHlfXzNBUDFtXCJ9O1xuXG52YXIgcyQzID0ge1wicGFuZWxcIjpcIlNpZGViYXJQYW5lbF9wYW5lbF9fMlU4OUZcIixcImVtcHR5XCI6XCJTaWRlYmFyUGFuZWxfZW1wdHlfXzFjemlFXCIsXCJ0aXRsZVwiOlwiU2lkZWJhclBhbmVsX3RpdGxlX18yRVRYalwiLFwiY29udGVudFwiOlwiU2lkZWJhclBhbmVsX2NvbnRlbnRfXzJyQktjXCJ9O1xuXG5mdW5jdGlvbiBTaWRlYmFyUGFuZWwocHJvcHMpIHtcclxuICAgIHJldHVybiAocyhcImRpdlwiLCB7IGNsYXNzOiBzJDMucGFuZWwgfSxcclxuICAgICAgICBzKFwiaDNcIiwgeyBjbGFzczogcyQzLnRpdGxlIH0sIHByb3BzLnRpdGxlKSxcclxuICAgICAgICBzKFwiZGl2XCIsIHsgY2xhc3M6IHMkMy5jb250ZW50IH0sIHByb3BzLmNoaWxkcmVuID09IG51bGwgPyAocyhcInNwYW5cIiwgeyBjbGFzczogcyQzLmVtcHR5IH0sIHByb3BzLmVtcHR5KSkgOiAocHJvcHMuY2hpbGRyZW4pKSkpO1xyXG59XG5cbnZhciBzJDQgPSB7XCJhY3Rpb25zXCI6XCJBY3Rpb25zX2FjdGlvbnNfX3BLS2NtXCJ9O1xuXG5mdW5jdGlvbiBBY3Rpb25zKHByb3BzKSB7XHJcbiAgICByZXR1cm4gcyhcImRpdlwiLCB7IGNsYXNzOiBzJDQuYWN0aW9ucyB9LCBwcm9wcy5jaGlsZHJlbik7XHJcbn1cblxudmFyIHMkNSA9IHtcInJvb3RcIjpcIkljb25CdG5fcm9vdF9fNmpQY0JcIn07XG5cbmZ1bmN0aW9uIEljb25CdG4ocHJvcHMpIHtcclxuICAgIHJldHVybiAocyhcImJ1dHRvblwiLCB7IGNsYXNzOiBzJDUucm9vdCwgXCJkYXRhLWFjdGl2ZVwiOiBwcm9wcy5hY3RpdmUsIHRpdGxlOiBwcm9wcy50aXRsZSwgb25DbGljazogcHJvcHMub25DbGljayB9LCBwcm9wcy5jaGlsZHJlbikpO1xyXG59XG5cbnZhciBzJDYgPSB7XCJyb290XCI6XCJFbGVtZW50UHJvcHNfcm9vdF9fVjY5MlhcIixcImZvcm1cIjpcIkVsZW1lbnRQcm9wc19mb3JtX18ydkNYblwiLFwicm93XCI6XCJFbGVtZW50UHJvcHNfcm93X18ybnJCMFwiLFwibmFtZVwiOlwiRWxlbWVudFByb3BzX25hbWVfXzNCVXZsXCIsXCJwcm9wZXJ0eVwiOlwiRWxlbWVudFByb3BzX3Byb3BlcnR5X18zM0w4X1wiLFwibm9Db2xsYXBzZVwiOlwiRWxlbWVudFByb3BzX25vQ29sbGFwc2VfXzJWbUhEXCIsXCJ0b2dnbGVcIjpcIkVsZW1lbnRQcm9wc190b2dnbGVfXzJsbTZBXCIsXCJpbnB1dFwiOlwiRWxlbWVudFByb3BzX2lucHV0X18yUWw0elwiLFwibWFza1wiOlwiRWxlbWVudFByb3BzX21hc2tfXzFmYlVNXCIsXCJzdHJpbmdcIjpcIkVsZW1lbnRQcm9wc19zdHJpbmdfX0RRR2k1XCIsXCJmdW5jdGlvblwiOlwiRWxlbWVudFByb3BzX2Z1bmN0aW9uX18xd3dlelwiLFwibnVtYmVyXCI6XCJFbGVtZW50UHJvcHNfbnVtYmVyX18zODRvbFwiLFwiYm9vbGVhblwiOlwiRWxlbWVudFByb3BzX2Jvb2xlYW5fXzJtamJlXCIsXCJhcnJheVwiOlwiRWxlbWVudFByb3BzX2FycmF5X18xelpMQlwiLFwib2JqZWN0XCI6XCJFbGVtZW50UHJvcHNfb2JqZWN0X18yMW9ZWlwiLFwibnVsbFwiOlwiRWxlbWVudFByb3BzX251bGxfXzNraTZvXCJ9O1xuXG5mdW5jdGlvbiBmbGF0dGVuKGRhdGEsIHBhdGgsIGxpbWl0LCBvdXQgPSBbXSkge1xyXG4gICAgbGV0IGRlcHRoID0gcGF0aC5sZW5ndGggPiAwID8gcGF0aC5sZW5ndGggLSAxIDogMDtcclxuICAgIGNvbnN0IG5hbWUgPSBwYXRoLmxlbmd0aCA+IDAgPyBwYXRoW2RlcHRoXSArIFwiXCIgOiBcIlwiO1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICBvdXQucHVzaCh7XHJcbiAgICAgICAgICAgIGRlcHRoLFxyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXHJcbiAgICAgICAgICAgIGNvbGxhcHNhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHBhdGgsXHJcbiAgICAgICAgICAgIHZhbHVlOiBcIkFycmF5XCIsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKChpdGVtLCBpKSA9PiBmbGF0dGVuKGl0ZW0sIHBhdGguY29uY2F0KGkpLCBsaW1pdCwgb3V0KSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgU2V0KSB7XHJcbiAgICAgICAgb3V0LnB1c2goe1xyXG4gICAgICAgICAgICBkZXB0aCxcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcclxuICAgICAgICAgICAgY29sbGFwc2FibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHBhdGgsXHJcbiAgICAgICAgICAgIHZhbHVlOiBcIlNldFwiLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBvdXQucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBkZXB0aCxcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm51bGxcIixcclxuICAgICAgICAgICAgICAgIGNvbGxhcHNhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHBhdGgsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogZGF0YSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBGdW5jdGlvbnMgYXJlIGVuY29kZWQgYXMgb2JqZWN0c1xyXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09PSAyICYmXHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgZGF0YS5uYW1lID09PSBcInN0cmluZ1wiICYmXHJcbiAgICAgICAgICAgICAgICBkYXRhLnR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgb3V0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBlZGl0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aCxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZGF0YS5uYW1lICsgXCIoKVwiLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgb3V0IGluaXRpYWwgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2FibGU6IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA+IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiT2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGtleSA9PiBmbGF0dGVuKGRhdGFba2V5XSwgcGF0aC5jb25jYXQoa2V5KSwgbGltaXQsIG91dCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgdHlwZSA9IHR5cGVvZiBkYXRhO1xyXG4gICAgICAgIG91dC5wdXNoKHtcclxuICAgICAgICAgICAgZGVwdGgsXHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgIGNvbGxhcHNhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgZWRpdGFibGU6IHR5cGUgIT09IFwidW5kZWZpbmVkXCIsXHJcbiAgICAgICAgICAgIHBhdGgsXHJcbiAgICAgICAgICAgIHZhbHVlOiBkYXRhLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dDtcclxufVxuXG5mdW5jdGlvbiBFbGVtZW50UHJvcHMocHJvcHMpIHtcclxuICAgIGNvbnN0IHsgZGF0YSwgZWRpdGFibGUsIHBhdGggPSBbXSwgb25JbnB1dCB9ID0gcHJvcHM7XHJcbiAgICBjb25zdCBwYXJzZWQgPSBmbGF0dGVuKGRhdGEsIFtdLCA3LCBbXSk7XHJcbiAgICByZXR1cm4gKHMoXCJkaXZcIiwgeyBjbGFzczogcyQ2LnJvb3QgfSxcclxuICAgICAgICBzKFwiZm9ybVwiLCB7IGNsYXNzOiBzJDYuZm9ybSwgb25TdWJtaXQ6IGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9IH0sIHBhcnNlZC5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAocyhTaW5nbGVJdGVtLCB7IGtleTogaXRlbS5uYW1lLCB0eXBlOiBpdGVtLnR5cGUsIG5hbWU6IGl0ZW0ubmFtZSwgY29sbGFwc2VhYmxlOiBpdGVtLmNvbGxhcHNhYmxlLCBlZGl0YWJsZTogKGVkaXRhYmxlICYmIGl0ZW0uZWRpdGFibGUpIHx8IGZhbHNlLCB2YWx1ZTogaXRlbS52YWx1ZSwgcGF0aDogaXRlbS5wYXRoLCBvbklucHV0OiBvbklucHV0LCBkZXB0aDogaXRlbS5kZXB0aCB9KSk7XHJcbiAgICAgICAgfSkpKSk7XHJcbn1cclxuZnVuY3Rpb24gU2luZ2xlSXRlbShwcm9wcykge1xyXG4gICAgY29uc3QgeyBvbklucHV0LCBwYXRoLCBlZGl0YWJsZSA9IGZhbHNlLCBuYW1lLCB0eXBlLCBjb2xsYXBzZWFibGUgPSBmYWxzZSwgZGVwdGgsIH0gPSBwcm9wcztcclxuICAgIGNvbnN0IGNzcyA9IHtcclxuICAgICAgICBzdHJpbmc6IHMkNi5zdHJpbmcsXHJcbiAgICAgICAgbnVtYmVyOiBzJDYubnVtYmVyLFxyXG4gICAgICAgIGZ1bmN0aW9uOiBzJDYuZnVuY3Rpb24sXHJcbiAgICAgICAgYm9vbGVhbjogcyQ2LmJvb2xlYW4sXHJcbiAgICAgICAgbnVsbDogcyQ2Lm51bGwsXHJcbiAgICAgICAgYXJyYXk6IHMkNi5hcnJheSxcclxuICAgICAgICBvYmplY3Q6IHMkNi5vYmplY3QsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgdiA9IHByb3BzLnZhbHVlO1xyXG4gICAgY29uc3QgdXBkYXRlID0gKHYpID0+IHtcclxuICAgICAgICBvbklucHV0ICYmIG9uSW5wdXQodiwgcGF0aCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIChzKFwiZGl2XCIsIHsga2V5OiBwYXRoLmpvaW4oXCIuXCIpLCBjbGFzczogcyQ2LnJvdywgXCJkYXRhLWRlcHRoXCI6IGRlcHRoLCBzdHlsZTogYHBhZGRpbmctbGVmdDogY2FsYyh2YXIoLS1pbmRlbnQtZGVwdGgpICogJHtkZXB0aH0pYCB9LFxyXG4gICAgICAgIGNvbGxhcHNlYWJsZSAmJiAocyhcImJ1dHRvblwiLCB7IGNsYXNzOiBzJDYudG9nZ2xlLCBcImRhdGEtY29sbGFwc2VkXCI6IGZhbHNlLCBvbkNsaWNrOiAoKSA9PiBjb25zb2xlLmxvZyhwYXRoKSB9LFxyXG4gICAgICAgICAgICBzKEFycm93LCBudWxsKSkpLFxyXG4gICAgICAgIHMoXCJkaXZcIiwgeyBjbGFzczogYCR7cyQ2Lm5hbWV9ICR7IWNvbGxhcHNlYWJsZSA/IHMkNi5ub0NvbGxhcHNlIDogXCJcIn1gIH0sIG5hbWUpLFxyXG4gICAgICAgIHMoXCJkaXZcIiwgeyBjbGFzczogYCR7cyQ2LnByb3BlcnR5fSAke2Nzc1t0eXBlXSB8fCBcIlwifWAgfSwgZWRpdGFibGUgPyAocyhEYXRhSW5wdXQsIHsgdmFsdWU6IHYsIG9uQ2hhbmdlOiB1cGRhdGUgfSkpIDogKHMoXCJkaXZcIiwgeyBjbGFzczogcyQ2Lm1hc2sgfSwgdiArIFwiXCIpKSkpKTtcclxufVxyXG5mdW5jdGlvbiBEYXRhSW5wdXQoeyB2YWx1ZSwgb25DaGFuZ2UgfSkge1xyXG4gICAgLy8gbGV0IFtmb2N1cywgc2V0Rm9jdXNdID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gICAgY29uc3Qgc2V0Rm9jdXMgPSAodikgPT4gbnVsbDtcclxuICAgIGxldCBpbnB1dFR5cGUgPSBcInRleHRcIjtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICBpbnB1dFR5cGUgPSBcInRleHRcIjtcclxuICAgICAgICAvLyBpZiAoIWZvY3VzKSB2YWx1ZSA9IGBcIiR7dmFsdWV9XCJgO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgaW5wdXRUeXBlID0gXCJudW1iZXJcIjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlucHV0VHlwZSA9IFwiY2hlY2tib3hcIjtcclxuICAgIH1cclxuICAgIGNvbnN0IG9uQ29tbWl0ID0gKGUpID0+IHtcclxuICAgICAgICBvbkNoYW5nZShnZXRFdmVudFZhbHVlKGUpKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gaW5wdXRUeXBlID09PSBcImNoZWNrYm94XCIgPyAocyhcImlucHV0XCIsIHsgY2xhc3M6IHMkNi5pbnB1dCwgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiB2YWx1ZSwgb25CbHVyOiBvbkNvbW1pdCB9KSkgOiAocyhcImlucHV0XCIsIHsgY2xhc3M6IHMkNi5pbnB1dCwgdHlwZTogaW5wdXRUeXBlLCBvbkZvY3VzOiAoKSA9PiBzZXRGb2N1cygpLCBvbkJsdXI6ICgpID0+IHNldEZvY3VzKCksIHZhbHVlOiB2YWx1ZSwgb25LZXlVcDogZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuYmx1cigpO1xyXG4gICAgICAgICAgICAgICAgb25Db21taXQoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IH0pKTtcclxufVxyXG5mdW5jdGlvbiBnZXRFdmVudFZhbHVlKGV2KSB7XHJcbiAgICByZXR1cm4gZXYuY3VycmVudFRhcmdldC5jaGVja2VkIHx8IGV2LmN1cnJlbnRUYXJnZXQudmFsdWU7XHJcbn1cblxuZnVuY3Rpb24gU2lkZWJhcigpIHtcclxuICAgIGNvbnN0IHN0b3JlID0gdXNlU3RvcmUoKTtcclxuICAgIGNvbnN0IG5vZGUgPSB1c2VPYnNlcnZlcigoKSA9PiBzdG9yZS5zZWxlY3RlZCgpLCBbc3RvcmUuc2VsZWN0ZWRdKTtcclxuICAgIGNvbnN0IGluc3BlY3QgPSB1c2VPYnNlcnZlcigoKSA9PiBzdG9yZS5pbnNwZWN0RGF0YSgpLCBbc3RvcmUuaW5zcGVjdERhdGFdKTtcclxuICAgIHJldHVybiAocyhcImFzaWRlXCIsIHsgY2xhc3M6IHMkMi5yb290IH0sXHJcbiAgICAgICAgcyhBY3Rpb25zLCBudWxsLFxyXG4gICAgICAgICAgICBzKFwic3BhblwiLCB7IGNsYXNzOiBzJDIudGl0bGUgfSwgbm9kZSA/IG5vZGUubmFtZSA6IFwiLVwiKSxcclxuICAgICAgICAgICAgbm9kZSAmJiAocyh2LCBudWxsLFxyXG4gICAgICAgICAgICAgICAgcyhJY29uQnRuLCB7IG9uQ2xpY2s6ICgpID0+IHN0b3JlLmFjdGlvbnMubG9nTm9kZShub2RlLmlkKSB9LCBcIkxvZ1wiKSkpKSxcclxuICAgICAgICBzKFwiZGl2XCIsIHsgY2xhc3M6IHMkMi5ib2R5IH0sXHJcbiAgICAgICAgICAgIHMoU2lkZWJhclBhbmVsLCB7IHRpdGxlOiBcInByb3BzXCIsIGVtcHR5OiBcIk5vbmVcIiB9LCBpbnNwZWN0LnByb3BzID8gKHMoRWxlbWVudFByb3BzLCB7IHBhdGg6IFtdLCBkYXRhOiBpbnNwZWN0LnByb3BzLCBlZGl0YWJsZTogaW5zcGVjdC5jYW5FZGl0UHJvcHMsIG9uSW5wdXQ6ICh2LCBwYXRoKSA9PiBub2RlICYmIHN0b3JlLmFjdGlvbnMudXBkYXRlTm9kZShub2RlLmlkLCBcInByb3BzXCIsIHBhdGgsIHYpIH0pKSA6IG51bGwpLFxyXG4gICAgICAgICAgICBpbnNwZWN0LnN0YXRlICYmIChzKFNpZGViYXJQYW5lbCwgeyB0aXRsZTogXCJzdGF0ZVwiLCBlbXB0eTogXCJOb25lXCIgfSwgaW5zcGVjdC5zdGF0ZSA/IChzKEVsZW1lbnRQcm9wcywgeyBwYXRoOiBbXSwgZGF0YTogaW5zcGVjdC5zdGF0ZSwgZWRpdGFibGU6IGluc3BlY3QuY2FuRWRpdFN0YXRlLCBvbklucHV0OiAodiwgcGF0aCkgPT4gbm9kZSAmJiBzdG9yZS5hY3Rpb25zLnVwZGF0ZU5vZGUobm9kZS5pZCwgXCJzdGF0ZVwiLCBwYXRoLCB2KSB9KSkgOiBudWxsKSksXHJcbiAgICAgICAgICAgIGluc3BlY3QuY29udGV4dCAmJiAocyhTaWRlYmFyUGFuZWwsIHsgdGl0bGU6IFwiY29udGV4dFwiLCBlbXB0eTogXCJOb25lXCIgfSkpLFxyXG4gICAgICAgICAgICBpbnNwZWN0Lmhvb2tzICYmIChzKFNpZGViYXJQYW5lbCwgeyB0aXRsZTogXCJob29rc1wiLCBlbXB0eTogXCJOb25lXCIgfSkpKSkpO1xyXG59XG5cbnZhciBzJDcgPSB7XCJyb290XCI6XCJEZXZ0b29sc19yb290X19kTWVzalwiLFwiY29tcG9uZW50c1wiOlwiRGV2dG9vbHNfY29tcG9uZW50c19fM3lid0tcIixcInNpZGViYXJcIjpcIkRldnRvb2xzX3NpZGViYXJfXzFoWUdqXCJ9O1xuXG5mdW5jdGlvbiBUcmVlQmFyKCkge1xyXG4gICAgY29uc3QgW2luc3BlY3QsIHNldEluc3BlY3RdID0gZSQxKGZhbHNlKTtcclxuICAgIGNvbnN0IFtzZXR0aW5ncywgc2V0U2V0dGluZ3NdID0gZSQxKGZhbHNlKTtcclxuICAgIHJldHVybiAocyhBY3Rpb25zLCBudWxsLFxyXG4gICAgICAgIHMoSWNvbkJ0biwgeyBcImRhdGEtYWN0aXZlXCI6IGluc3BlY3QsIHRpdGxlOiBcIkluc3BlY3QgRWxlbWVudFwiLCBvbkNsaWNrOiAoKSA9PiBzZXRJbnNwZWN0KCFpbnNwZWN0KSB9LFxyXG4gICAgICAgICAgICBzKFwic3ZnXCIsIHsgeG1sbnM6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgd2lkdGg6IFwiMTZcIiwgaGVpZ2h0OiBcIjE2XCIsIHZpZXdCb3g6IFwiMCAwIDQuMjMzIDQuMjMzXCIgfSxcclxuICAgICAgICAgICAgICAgIHMoXCJnXCIsIHsgc3Ryb2tlOiBcImN1cnJlbnRDb2xvclwiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgcyhcInBhdGhcIiwgeyBkOiBcIk0zLjk2OSAzLjI5MlYuNzk0YS41MjguNTI4IDAgMCAwLS41My0uNTNILjc5NWEuNTI4LjUyOCAwIDAgMC0uNTMuNTNWMy40NGMwIC4yOTMuMjM3LjUyOS41My41MjloMi41MzJcIiwgb3BhY2l0eTogXCIuODkzXCIsIGZpbGw6IFwibm9uZVwiLCBcInN0cm9rZS1saW5lam9pblwiOiBcInJvdW5kXCIsIFwic3Ryb2tlLWRhc2hvZmZzZXRcIjogXCI4Ljc5MVwiLCBcInN0cm9rZS13aWR0aFwiOiBcIi4yNjQ1OFwiIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIHMoXCJwYXRoXCIsIHsgZDogXCJNMS4zMjMgMS4zMjNsLjg3MyAyLjAzN0wzLjM2IDIuMTk2elwiLCBcInN0cm9rZS13aWR0aFwiOiBcIi4yOTFcIiwgXCJzdHJva2UtbGluZWNhcFwiOiBcInJvdW5kXCIsIFwic3Ryb2tlLWxpbmVqb2luXCI6IFwicm91bmRcIiwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiB9KSxcclxuICAgICAgICAgICAgICAgICAgICBzKFwicGF0aFwiLCB7IGQ6IFwiTTIuODcgMi44N0wzLjkzIDMuOTNcIiwgZmlsbDogXCJub25lXCIsIFwic3Ryb2tlLXdpZHRoXCI6IFwiLjI2NVwiIH0pKSkpLFxyXG4gICAgICAgIHMoXCJkaXZcIiwgeyBzdHlsZTogXCJ3aWR0aDogMTAwJVwiIH0sIFwiZm9vXCIpLFxyXG4gICAgICAgIHMoSWNvbkJ0biwgeyBcImRhdGEtYWN0aXZlXCI6IHNldHRpbmdzLCB0aXRsZTogXCJTZXR0aW5nc1wiLCBvbkNsaWNrOiAoKSA9PiBzZXRTZXR0aW5ncyghc2V0dGluZ3MpIH0sXHJcbiAgICAgICAgICAgIHMoXCJzdmdcIiwgeyB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCB2aWV3Qm94OiBcIjAgMCAzLjczMyAzLjkyMVwiLCBoZWlnaHQ6IFwiMTQuODJcIiwgd2lkdGg6IFwiMTQuMTA5XCIgfSxcclxuICAgICAgICAgICAgICAgIHMoXCJwYXRoXCIsIHsgZDogXCJNMi40NTYuNDIzYy0uMTcyLjE3LS4zNC40MzgtLjU4NS40MzctLjI0My0uMDAxLS40MS0uMjcxLS41OC0uNDQzTC44MjkuNjgyYy4wNjIuMjM0LjIxLjUxNC4wODcuNzI0LS4xMjMuMjEtLjQ0LjIyLS42NzMuMjgxTC4yNCAyLjIyYy4yOTQuMDUzLjUxNy0uMDM2LjY3MS4yODguMTU0LjMyNC0uMDMuNDktLjA5My43MjNsLjQ2LjI2OGMuMTcxLS4xNy4yMy0uNDE5LjU4NC0uNDM3LjM1My0uMDE4LjQzLjI3My41OC40NDNsLjQ2Mi0uMjY1Yy0uMDYyLS4yMzQtLjIxLS41MTMtLjA4Ny0uNzI0LjEyMy0uMjEuNDQtLjIyLjY3My0uMjgxbC4wMDMtLjUzMmMtLjIzMy0uMDY0LS41NS0uMDc2LS42NzEtLjI4OC0uMTItLjIxMS4wMy0uNDkuMDkzLS43MjN6bS0uMzI3IDEuMDljLjI1Mi4xNDIuMzM4LjQ1OS4xOTMuNzA2YS41My41MyAwIDAgMS0uNzE4LjE5LjUxMy41MTMgMCAwIDEtLjE5My0uNzA3LjUzLjUzIDAgMCAxIC43MTgtLjE5elwiLCBmaWxsOiBcIm5vbmVcIiwgc3Ryb2tlOiBcImN1cnJlbnRDb2xvclwiLCBcInN0cm9rZS13aWR0aFwiOiBcIi4yMzVcIiwgXCJzdHJva2UtbGluZWNhcFwiOiBcInJvdW5kXCIsIFwic3Ryb2tlLWxpbmVqb2luXCI6IFwicm91bmRcIiwgXCJzdHJva2UtZGFzaG9mZnNldFwiOiBcIjguNzkxXCIgfSkpKSkpO1xyXG59XG5cbmZ1bmN0aW9uIERldlRvb2xzKHByb3BzKSB7XHJcbiAgICByZXR1cm4gKHMoQXBwQ3R4LlByb3ZpZGVyLCB7IHZhbHVlOiBwcm9wcy5zdG9yZSB9LFxyXG4gICAgICAgIHMoXCJkaXZcIiwgeyBjbGFzczogcyQ3LnJvb3QgfSxcclxuICAgICAgICAgICAgcyhcImRpdlwiLCB7IGNsYXNzOiBzJDcuY29tcG9uZW50cyB9LFxyXG4gICAgICAgICAgICAgICAgcyhUcmVlQmFyLCBudWxsKSxcclxuICAgICAgICAgICAgICAgIHMoVHJlZVZpZXcsIHsgcm9vdElkOiAxIH0pKSxcclxuICAgICAgICAgICAgcyhcImRpdlwiLCB7IGNsYXNzOiBzJDcuc2lkZWJhciB9LFxyXG4gICAgICAgICAgICAgICAgcyhTaWRlYmFyLCB7IHRpdGxlOiBcIkh5ZHJhdG9yXCIgfSkpKSkpO1xyXG59XG5cbmZ1bmN0aW9uIHNldHVwT3B0aW9ucyhvcHRpb25zLCByZW5kZXJlcikge1xyXG4gICAgY29uc3QgbyA9IG9wdGlvbnM7XHJcbiAgICAvLyBTdG9yZSAocG9zc2libGUpIHByZXZpb3VzIGhvb2tzIHNvIHRoYXQgd2UgZG9uJ3Qgb3ZlcndyaXRlIHRoZW1cclxuICAgIGxldCBwcmV2Vk5vZGVIb29rID0gb3B0aW9ucy52bm9kZTtcclxuICAgIGxldCBwcmV2Q29tbWl0Um9vdCA9IG8uX2NvbW1pdCB8fCBvLl9fYztcclxuICAgIGxldCBwcmV2QmVmb3JlVW5tb3VudCA9IG9wdGlvbnMudW5tb3VudDtcclxuICAgIGxldCBwcmV2QmVmb3JlRGlmZiA9IG8uX2RpZmYgfHwgby5fX2I7XHJcbiAgICBsZXQgcHJldkFmdGVyRGlmZiA9IG9wdGlvbnMuZGlmZmVkO1xyXG4gICAgb3B0aW9ucy52bm9kZSA9IHZub2RlID0+IHtcclxuICAgICAgICAvLyBUaW55IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50IGJ5IGluaXRpYWxpemluZyBmaWVsZHMgYXMgZG91Ymxlc1xyXG4gICAgICAgIC8vIGZyb20gdGhlIHN0YXJ0LiBgcGVyZm9ybWFuY2Uubm93KClgIHdpbGwgYWx3YXlzIHJldHVybiBhIGRvdWJsZS5cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8xNDM2NVxyXG4gICAgICAgIC8vIGFuZCBodHRwczovL3NsaWRyLmlvL2JtZXVyZXIvamF2YXNjcmlwdC1lbmdpbmUtZnVuZGFtZW50YWxzLXRoZS1nb29kLXRoZS1iYWQtYW5kLXRoZS11Z2x5XHJcbiAgICAgICAgdm5vZGUuc3RhcnRUaW1lID0gTmFOO1xyXG4gICAgICAgIHZub2RlLmVuZFRpbWUgPSBOYU47XHJcbiAgICAgICAgdm5vZGUuc3RhcnRUaW1lID0gMDtcclxuICAgICAgICB2bm9kZS5lbmRUaW1lID0gLTE7XHJcbiAgICAgICAgaWYgKHByZXZWTm9kZUhvb2spXHJcbiAgICAgICAgICAgIHByZXZWTm9kZUhvb2sodm5vZGUpO1xyXG4gICAgICAgIHZub2RlLm9sZCA9IG51bGw7XHJcbiAgICB9O1xyXG4gICAgby5fZGlmZiA9IG8uX19iID0gKHZub2RlKSA9PiB7XHJcbiAgICAgICAgdm5vZGUuc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgaWYgKHByZXZCZWZvcmVEaWZmICE9IG51bGwpXHJcbiAgICAgICAgICAgIHByZXZCZWZvcmVEaWZmKHZub2RlKTtcclxuICAgIH07XHJcbiAgICBvcHRpb25zLmRpZmZlZCA9IHZub2RlID0+IHtcclxuICAgICAgICB2bm9kZS5lbmRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgLy8gbGV0IGM7XHJcbiAgICAgICAgLy8gaWYgKHZub2RlICE9IG51bGwgJiYgKGMgPSB2bm9kZS5fY29tcG9uZW50KSAhPSBudWxsKSB7XHJcbiAgICAgICAgLy8gXHRjLl9wcmV2UHJvcHMgPSBvbGRWTm9kZSAhPSBudWxsID8gb2xkVk5vZGUucHJvcHMgOiBudWxsO1xyXG4gICAgICAgIC8vIFx0Yy5fcHJldkNvbnRleHQgPVxyXG4gICAgICAgIC8vIFx0XHRvbGRWTm9kZSAhPSBudWxsICYmIG9sZFZOb2RlLl9jb21wb25lbnQgIT0gbnVsbFxyXG4gICAgICAgIC8vIFx0XHRcdD8gb2xkVk5vZGUuX2NvbXBvbmVudC5fY29udGV4dFxyXG4gICAgICAgIC8vIFx0XHRcdDogbnVsbDtcclxuICAgICAgICAvLyBcdGlmIChjLl9faG9va3MgIT0gbnVsbCkge1xyXG4gICAgICAgIC8vIFx0XHRjLl9wcmV2SG9va3NSZXZpc2lvbiA9IGMuX2N1cnJlbnRIb29rc1JldmlzaW9uO1xyXG4gICAgICAgIC8vIFx0XHRjLl9jdXJyZW50SG9va3NSZXZpc2lvbiA9IGMuX19ob29rcy5fbGlzdC5yZWR1Y2UoXHJcbiAgICAgICAgLy8gXHRcdFx0KGFjYywgeCkgPT4gYWNjICsgeC5fcmV2aXNpb24sXHJcbiAgICAgICAgLy8gXHRcdFx0MCxcclxuICAgICAgICAvLyBcdFx0KTtcclxuICAgICAgICAvLyBcdH1cclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgaWYgKHByZXZBZnRlckRpZmYpXHJcbiAgICAgICAgICAgIHByZXZBZnRlckRpZmYodm5vZGUpO1xyXG4gICAgfTtcclxuICAgIG8uX2NvbW1pdCA9IG8uX19jID0gKHZub2RlKSA9PiB7XHJcbiAgICAgICAgaWYgKHByZXZDb21taXRSb290KVxyXG4gICAgICAgICAgICBwcmV2Q29tbWl0Um9vdCh2bm9kZSk7XHJcbiAgICAgICAgLy8gVGhlc2UgY2FzZXMgYXJlIGFscmVhZHkgaGFuZGxlZCBieSBgdW5tb3VudGBcclxuICAgICAgICBpZiAodm5vZGUgPT0gbnVsbClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJlbmRlcmVyLm9uQ29tbWl0KHZub2RlKTtcclxuICAgIH07XHJcbiAgICBvcHRpb25zLnVubW91bnQgPSB2bm9kZSA9PiB7XHJcbiAgICAgICAgaWYgKHByZXZCZWZvcmVVbm1vdW50KVxyXG4gICAgICAgICAgICBwcmV2QmVmb3JlVW5tb3VudCh2bm9kZSk7XHJcbiAgICAgICAgcmVuZGVyZXIub25Vbm1vdW50KHZub2RlKTtcclxuICAgIH07XHJcbiAgICAvLyBJbmplY3QgdHJhY2tpbmcgaW50byBzZXRTdGF0ZVxyXG4gICAgLy8gY29uc3Qgc2V0U3RhdGUgPSBDb21wb25lbnQucHJvdG90eXBlLnNldFN0YXRlO1xyXG4gICAgLy8gQ29tcG9uZW50LnByb3RvdHlwZS5zZXRTdGF0ZSA9IGZ1bmN0aW9uKHVwZGF0ZSwgY2FsbGJhY2spIHtcclxuICAgIC8vIFx0Ly8gRHVwbGljYXRlZCBpbiBzZXRTdGF0ZSgpIGJ1dCBkb2Vzbid0IG1hdHRlciBkdWUgdG8gdGhlIGd1YXJkLlxyXG4gICAgLy8gXHRsZXQgcyA9XHJcbiAgICAvLyBcdFx0KHRoaXMuX25leHRTdGF0ZSAhPT0gdGhpcy5zdGF0ZSAmJiB0aGlzLl9uZXh0U3RhdGUpIHx8XHJcbiAgICAvLyBcdFx0KHRoaXMuX25leHRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUpKTtcclxuICAgIC8vIFx0Ly8gTmVlZGVkIGluIG9yZGVyIHRvIGNoZWNrIGlmIHN0YXRlIGhhcyBjaGFuZ2VkIGFmdGVyIHRoZSB0cmVlIGhhcyBiZWVuIGNvbW1pdHRlZDpcclxuICAgIC8vIFx0dGhpcy5fcHJldlN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgcyk7XHJcbiAgICAvLyBcdHJldHVybiBzZXRTdGF0ZS5jYWxsKHRoaXMsIHVwZGF0ZSwgY2FsbGJhY2spO1xyXG4gICAgLy8gfTtcclxuICAgIC8vIFRlYXJkb3duIGRldnRvb2xzIG9wdGlvbnMuIE1haW5seSB1c2VkIGZvciB0ZXN0aW5nXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgIG9wdGlvbnMudW5tb3VudCA9IHByZXZCZWZvcmVVbm1vdW50O1xyXG4gICAgICAgIG8uX2NvbW1pdCA9IG8uX19jID0gcHJldkNvbW1pdFJvb3Q7XHJcbiAgICAgICAgb3B0aW9ucy5kaWZmZWQgPSBwcmV2QWZ0ZXJEaWZmO1xyXG4gICAgICAgIG8uX2RpZmYgPSBvLl9fYiA9IHByZXZCZWZvcmVEaWZmO1xyXG4gICAgICAgIG9wdGlvbnMudm5vZGUgPSBwcmV2Vk5vZGVIb29rO1xyXG4gICAgfTtcclxufVxuXG4vKipcclxuICogVGhlIHN0cmluZyB0YWJsZSBob2xkcyBhIG1hcHBpbmcgb2Ygc3RyaW5ncyB0byBpZHMuIFRoaXMgc2F2ZXMgYSBsb3Qgb2Ygc3BhY2VcclxuICogaW4gbWVzc2FnaW5nIGJlY2F1c2Ugd2UgY2FuIG9ubHkgbmVlZCB0byBkZWNsYXJlIGEgc3RyaW5nIG9uY2UgYW5kIGNhbiBsYXRlclxyXG4gKiByZWZlciB0byBpdHMgaWQuIFRoaXMgaXMgZXNwZWNpYWxseSB0cnVlIGZvciBjb21wb25lbnQgb3IgZWxlbWVudCBuYW1lcyB3aGljaFxyXG4gKiBleHBlY3RlZG9jY3VyIG11bHRpcGxlIHRpbWVzLlxyXG4gKi9cclxuLyoqXHJcbiAqIFBhcnNlIG1lc3NhZ2UgdG8gc3RyaW5nc1xyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VUYWJsZShkYXRhKSB7XHJcbiAgICBjb25zdCBsZW4gPSBkYXRhWzBdO1xyXG4gICAgY29uc3Qgc3RyaW5ncyA9IFtdO1xyXG4gICAgaWYgKGxlbiA+IDApIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxlbiArIDE7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBzdHJMZW4gPSBkYXRhW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IGkgKyAxO1xyXG4gICAgICAgICAgICBjb25zdCBlbmQgPSBpICsgc3RyTGVuICsgMTtcclxuICAgICAgICAgICAgY29uc3Qgc3RyID0gU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uZGF0YS5zbGljZShzdGFydCwgZW5kKSk7XHJcbiAgICAgICAgICAgIHN0cmluZ3MucHVzaChzdHIpO1xyXG4gICAgICAgICAgICBpICs9IHN0ckxlbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyaW5ncztcclxufVxuXG52YXIgTXNnVHlwZXMkMTtcclxuKGZ1bmN0aW9uIChNc2dUeXBlcykge1xyXG4gICAgTXNnVHlwZXNbTXNnVHlwZXNbXCJBRERfUk9PVFwiXSA9IDFdID0gXCJBRERfUk9PVFwiO1xyXG4gICAgTXNnVHlwZXNbTXNnVHlwZXNbXCJBRERfVk5PREVcIl0gPSAyXSA9IFwiQUREX1ZOT0RFXCI7XHJcbiAgICBNc2dUeXBlc1tNc2dUeXBlc1tcIlJFTU9WRV9WTk9ERVwiXSA9IDNdID0gXCJSRU1PVkVfVk5PREVcIjtcclxuICAgIE1zZ1R5cGVzW01zZ1R5cGVzW1wiVVBEQVRFX1ZOT0RFX1RJTUlOR1NcIl0gPSA0XSA9IFwiVVBEQVRFX1ZOT0RFX1RJTUlOR1NcIjtcclxufSkoTXNnVHlwZXMkMSB8fCAoTXNnVHlwZXMkMSA9IHt9KSk7XHJcbmZ1bmN0aW9uIGFwcGx5T3BlcmF0aW9ucyhzdG9yZSwgZGF0YSkge1xyXG4gICAgY29uc3Qgcm9vdElkID0gZGF0YVswXTtcclxuICAgIGxldCBpID0gZGF0YVsxXSArIDE7XHJcbiAgICBjb25zdCBzdHJpbmdzID0gcGFyc2VUYWJsZShkYXRhLnNsaWNlKDEsIGkgKyAxKSk7XHJcbiAgICBsZXQgbmV3Um9vdCA9IGZhbHNlO1xyXG4gICAgZm9yICg7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgc3dpdGNoIChkYXRhW2ldKSB7XHJcbiAgICAgICAgICAgIGNhc2UgTXNnVHlwZXMkMS5BRERfUk9PVDpcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gZGF0YVtpKytdO1xyXG4gICAgICAgICAgICAgICAgbmV3Um9vdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBzdG9yZS5yb290cyhzdG9yZS5yb290cygpKS5wdXNoKGlkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIE1zZ1R5cGVzJDEuQUREX1ZOT0RFOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGRhdGFbaSArIDFdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGRhdGFbaSArIDJdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHN0cmluZ3NbZGF0YVtpICsgNV0gLSAxXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGRhdGFbaSArIDZdID4gMCA/IGAga2V5PVwiJHtzdHJpbmdzW2kgKyA2IC0gMV19XCIgYCA6IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyZW50SWQgPSBkYXRhW2kgKyAzXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdSb290KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3Um9vdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnJvb3RUb0NoaWxkKCkuc2V0KHJvb3RJZCwgaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnJvb3RUb0NoaWxkKHN0b3JlLnJvb3RUb0NoaWxkKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JlLm5vZGVzKCkuaGFzKGlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm9kZSAke2lkfSBhbHJlYWR5IHByZXNlbnQgaW4gc3RvcmUuYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmUucm9vdHMoKS5pbmRleE9mKHBhcmVudElkKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBzdG9yZS5ub2RlcygpLmdldChwYXJlbnRJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKGBQYXJlbnQgbm9kZSAke3BhcmVudElkfSBub3QgZm91bmQgaW4gc3RvcmUuYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgUGFyZW50IG5vZGUgJHtwYXJlbnRJZH0gbm90IGZvdW5kIGluIHN0b3JlLmApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJZCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLnB1c2goaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0b3JlLm5vZGVzKCkuc2V0KGlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiBnZXREZXB0aChzdG9yZSwgcGFyZW50SWQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHZhbG9vKGZhbHNlKSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaSArPSA2O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBNc2dUeXBlcyQxLlJFTU9WRV9WTk9ERToge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdW5tb3VudHMgPSBkYXRhW2kgKyAxXTtcclxuICAgICAgICAgICAgICAgIGkgKz0gMjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxlbiA9IGkgKyB1bm1vdW50cztcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGB0b3RhbCB1bm1vdW50czogJHt1bm1vdW50c31gKTtcclxuICAgICAgICAgICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICBSZW1vdmU6ICVjJHtkYXRhW2ldfWAsIFwiY29sb3I6IHJlZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0b3JlLm5vZGVzKHN0b3JlLm5vZGVzKCkpO1xyXG59XHJcbmZ1bmN0aW9uIGFwcGx5RXZlbnQoc3RvcmUsIG5hbWUsIGRhdGEpIHtcclxuICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJvcGVyYXRpb25cIjpcclxuICAgICAgICAgICAgcmV0dXJuIGFwcGx5T3BlcmF0aW9ucyhzdG9yZSwgZGF0YSk7XHJcbiAgICAgICAgY2FzZSBcImluc3BlY3QtcmVzdWx0XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5pbnNwZWN0RGF0YShkYXRhKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBnZXREZXB0aChzdG9yZSwgaWQpIHtcclxuICAgIGxldCBwYXJlbnQgPSBzdG9yZS5ub2RlcygpLmdldChpZCk7XHJcbiAgICByZXR1cm4gcGFyZW50ID8gcGFyZW50LmRlcHRoICsgMSA6IDA7XHJcbn1cblxuZnVuY3Rpb24gYXR0YWNoKG9wdGlvbnMsIHJlbmRlcmVyRm4pIHtcclxuICAgIGNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoKTtcclxuICAgIGNvbnN0IGZha2VIb29rID0ge1xyXG4gICAgICAgIGF0dGFjaDogKCkgPT4gMSxcclxuICAgICAgICBjb25uZWN0ZWQ6IHRydWUsXHJcbiAgICAgICAgZGV0YWNoOiAoKSA9PiBudWxsLFxyXG4gICAgICAgIGVtaXQ6IChuYW1lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGFwcGx5RXZlbnQoc3RvcmUsIG5hbWUsIGRhdGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVuZGVyZXJzOiBuZXcgTWFwKCksXHJcbiAgICB9O1xyXG4gICAgY29uc3QgcmVuZGVyZXIgPSByZW5kZXJlckZuKGZha2VIb29rKTtcclxuICAgIGNvbnN0IGRlc3Ryb3kgPSBzZXR1cE9wdGlvbnMob3B0aW9ucywgcmVuZGVyZXIpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzdG9yZSxcclxuICAgICAgICBkZXN0cm95LFxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiByZW5kZXJEZXZ0b29scyhzdG9yZSwgY29udGFpbmVyKSB7XHJcbiAgICBEKHMoRGV2VG9vbHMsIHsgc3RvcmUgfSksIGNvbnRhaW5lcik7XHJcbn1cblxuZXhwb3J0IHsgYXR0YWNoLCBjcmVhdGVSZW5kZXJlciwgcmVuZGVyRGV2dG9vbHMgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC1kZXZ0b29scy5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnR7b3B0aW9ucyBhcyBuLEZyYWdtZW50IGFzIHQsQ29tcG9uZW50IGFzIGV9ZnJvbVwicHJlYWN0XCI7aW1wb3J0XCJwcmVhY3QvZGV2dG9vbHNcIjt2YXIgbz17fTtmdW5jdGlvbiByKCl7bz17fX1mdW5jdGlvbiBhKG4pe3JldHVybiBuLnR5cGU9PT10P1wiRnJhZ21lbnRcIjpcImZ1bmN0aW9uXCI9PXR5cGVvZiBuLnR5cGU/bi50eXBlLmRpc3BsYXlOYW1lfHxuLnR5cGUubmFtZTpcInN0cmluZ1wiPT10eXBlb2Ygbi50eXBlP24udHlwZTpcIiN0ZXh0XCJ9dmFyIGk9W10scz1bXTtmdW5jdGlvbiBjKCl7cmV0dXJuIGkubGVuZ3RoPjA/aVtpLmxlbmd0aC0xXTpudWxsfXZhciBsPSExO2Z1bmN0aW9uIHUobil7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbi50eXBlJiZuLnR5cGUhPXR9ZnVuY3Rpb24gZihuKXtmb3IodmFyIHQ9W25dLGU9bjtudWxsIT1lLl9fbzspdC5wdXNoKGUuX19vKSxlPWUuX19vO3JldHVybiB0LnJlZHVjZShmdW5jdGlvbihuLHQpe24rPVwiICBpbiBcIithKHQpO3ZhciBlPXQuX19zb3VyY2U7cmV0dXJuIGU/bis9XCIgKGF0IFwiK2UuZmlsZU5hbWUrXCI6XCIrZS5saW5lTnVtYmVyK1wiKVwiOmx8fChsPSEwLGNvbnNvbGUud2FybihcIkFkZCBAYmFiZWwvcGx1Z2luLXRyYW5zZm9ybS1yZWFjdC1qc3gtc291cmNlIHRvIGdldCBhIG1vcmUgZGV0YWlsZWQgY29tcG9uZW50IHN0YWNrLiBOb3RlIHRoYXQgeW91IHNob3VsZCBub3QgYWRkIGl0IHRvIHByb2R1Y3Rpb24gYnVpbGRzIG9mIHlvdXIgQXBwIGZvciBidW5kbGUgc2l6ZSByZWFzb25zLlwiKSksbitcIlxcblwifSxcIlwiKX12YXIgcD1cImZ1bmN0aW9uXCI9PXR5cGVvZiBXZWFrTWFwLGQ9ZS5wcm90b3R5cGUuc2V0U3RhdGU7ZS5wcm90b3R5cGUuc2V0U3RhdGU9ZnVuY3Rpb24obix0KXtyZXR1cm4gbnVsbD09dGhpcy5fX3Y/bnVsbD09dGhpcy5zdGF0ZSYmY29uc29sZS53YXJuKCdDYWxsaW5nIFwidGhpcy5zZXRTdGF0ZVwiIGluc2lkZSB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgaXMgYSBuby1vcCBhbmQgbWlnaHQgYmUgYSBidWcgaW4geW91ciBhcHBsaWNhdGlvbi4gSW5zdGVhZCwgc2V0IFwidGhpcy5zdGF0ZSA9IHt9XCIgZGlyZWN0bHkuXFxuXFxuJytmKGMoKSkpOm51bGw9PXRoaXMuX19QJiZjb25zb2xlLndhcm4oJ0NhblxcJ3QgY2FsbCBcInRoaXMuc2V0U3RhdGVcIiBvbiBhbiB1bm1vdW50ZWQgY29tcG9uZW50LiBUaGlzIGlzIGEgbm8tb3AsIGJ1dCBpdCBpbmRpY2F0ZXMgYSBtZW1vcnkgbGVhayBpbiB5b3VyIGFwcGxpY2F0aW9uLiBUbyBmaXgsIGNhbmNlbCBhbGwgc3Vic2NyaXB0aW9ucyBhbmQgYXN5bmNocm9ub3VzIHRhc2tzIGluIHRoZSBjb21wb25lbnRXaWxsVW5tb3VudCBtZXRob2QuXFxuXFxuJytmKHRoaXMuX192KSksZC5jYWxsKHRoaXMsbix0KX07dmFyIGg9ZS5wcm90b3R5cGUuZm9yY2VVcGRhdGU7ZnVuY3Rpb24geShuKXt2YXIgdD1uLnByb3BzLGU9YShuKSxvPVwiXCI7Zm9yKHZhciByIGluIHQpaWYodC5oYXNPd25Qcm9wZXJ0eShyKSYmXCJjaGlsZHJlblwiIT09cil7dmFyIGk9dFtyXTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBpJiYoaT1cImZ1bmN0aW9uIFwiKyhpLmRpc3BsYXlOYW1lfHxpLm5hbWUpK1wiKCkge31cIiksaT1PYmplY3QoaSkhPT1pfHxpLnRvU3RyaW5nP2krXCJcIjpPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaSksbys9XCIgXCIrcitcIj1cIitKU09OLnN0cmluZ2lmeShpKX12YXIgcz10LmNoaWxkcmVuO3JldHVyblwiPFwiK2UrbysocyYmcy5sZW5ndGg/XCI+Li48L1wiK2UrXCI+XCI6XCIgLz5cIil9ZS5wcm90b3R5cGUuZm9yY2VVcGRhdGU9ZnVuY3Rpb24obil7cmV0dXJuIG51bGw9PXRoaXMuX192P2NvbnNvbGUud2FybignQ2FsbGluZyBcInRoaXMuZm9yY2VVcGRhdGVcIiBpbnNpZGUgdGhlIGNvbnN0cnVjdG9yIG9mIGEgY29tcG9uZW50IGlzIGEgbm8tb3AgYW5kIG1pZ2h0IGJlIGEgYnVnIGluIHlvdXIgYXBwbGljYXRpb24uXFxuXFxuJytmKGMoKSkpOm51bGw9PXRoaXMuX19QJiZjb25zb2xlLndhcm4oJ0NhblxcJ3QgY2FsbCBcInRoaXMuZm9yY2VVcGRhdGVcIiBvbiBhbiB1bm1vdW50ZWQgY29tcG9uZW50LiBUaGlzIGlzIGEgbm8tb3AsIGJ1dCBpdCBpbmRpY2F0ZXMgYSBtZW1vcnkgbGVhayBpbiB5b3VyIGFwcGxpY2F0aW9uLiBUbyBmaXgsIGNhbmNlbCBhbGwgc3Vic2NyaXB0aW9ucyBhbmQgYXN5bmNocm9ub3VzIHRhc2tzIGluIHRoZSBjb21wb25lbnRXaWxsVW5tb3VudCBtZXRob2QuXFxuXFxuJytmKHRoaXMuX192KSksaC5jYWxsKHRoaXMsbil9LGZ1bmN0aW9uKCl7IWZ1bmN0aW9uKCl7dmFyIHQ9bi5fX2IsZT1uLmRpZmZlZCxvPW4uX18scj1uLnZub2RlLGE9bi5fX3I7bi5kaWZmZWQ9ZnVuY3Rpb24obil7dShuKSYmcy5wb3AoKSxpLnBvcCgpLGUmJmUobil9LG4uX19iPWZ1bmN0aW9uKG4pe3UobikmJmkucHVzaChuKSx0JiZ0KG4pfSxuLl9fPWZ1bmN0aW9uKG4sdCl7cz1bXSxvJiZvKG4sdCl9LG4udm5vZGU9ZnVuY3Rpb24obil7bi5fX289cy5sZW5ndGg+MD9zW3MubGVuZ3RoLTFdOm51bGwsciYmcihuKX0sbi5fX3I9ZnVuY3Rpb24obil7dShuKSYmcy5wdXNoKG4pLGEmJmEobil9fSgpO3ZhciB0PSExLGU9bi5fX2Iscj1uLmRpZmZlZCxjPW4udm5vZGUsbD1uLl9fZSxkPW4uX18saD1uLl9faCxtPXA/e3VzZUVmZmVjdDpuZXcgV2Vha01hcCx1c2VMYXlvdXRFZmZlY3Q6bmV3IFdlYWtNYXAsbGF6eVByb3BUeXBlczpuZXcgV2Vha01hcH06bnVsbCx2PVtdO24uX19lPWZ1bmN0aW9uKG4sdCxlKXtpZih0JiZ0Ll9fYyYmXCJmdW5jdGlvblwiPT10eXBlb2Ygbi50aGVuKXt2YXIgbz1uO249bmV3IEVycm9yKFwiTWlzc2luZyBTdXNwZW5zZS4gVGhlIHRocm93aW5nIGNvbXBvbmVudCB3YXM6IFwiK2EodCkpO2Zvcih2YXIgcj10O3I7cj1yLl9fKWlmKHIuX19jJiZyLl9fYy5fX2Mpe249bzticmVha31pZihuIGluc3RhbmNlb2YgRXJyb3IpdGhyb3cgbn10cnl7bChuLHQsZSksXCJmdW5jdGlvblwiIT10eXBlb2Ygbi50aGVuJiZzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhyb3cgbn0pfWNhdGNoKG4pe3Rocm93IG59fSxuLl9fPWZ1bmN0aW9uKG4sdCl7aWYoIXQpdGhyb3cgbmV3IEVycm9yKFwiVW5kZWZpbmVkIHBhcmVudCBwYXNzZWQgdG8gcmVuZGVyKCksIHRoaXMgaXMgdGhlIHNlY29uZCBhcmd1bWVudC5cXG5DaGVjayBpZiB0aGUgZWxlbWVudCBpcyBhdmFpbGFibGUgaW4gdGhlIERPTS9oYXMgdGhlIGNvcnJlY3QgaWQuXCIpO3ZhciBlO3N3aXRjaCh0Lm5vZGVUeXBlKXtjYXNlIDE6Y2FzZSAxMTpjYXNlIDk6ZT0hMDticmVhaztkZWZhdWx0OmU9ITF9aWYoIWUpe3ZhciBvPWEobik7dGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBIVE1MIG5vZGUgYXMgYSBzZWNvbmQgYXJndW1lbnQgdG8gcmVuZGVyLlxcdFJlY2VpdmVkIFwiK3QrXCIgaW5zdGVhZDogcmVuZGVyKDxcIitvK1wiIC8+LCBcIit0K1wiKTtcIil9ZCYmZChuLHQpfSxuLl9fYj1mdW5jdGlvbihuKXt2YXIgcj1uLnR5cGUsaT1mdW5jdGlvbiBuKHQpe3JldHVybiB0P1wiZnVuY3Rpb25cIj09dHlwZW9mIHQudHlwZT9uKHQuX18pOnQ6e319KG4uX18pO2lmKHQ9ITAsdm9pZCAwPT09cil0aHJvdyBuZXcgRXJyb3IoXCJVbmRlZmluZWQgY29tcG9uZW50IHBhc3NlZCB0byBjcmVhdGVFbGVtZW50KClcXG5cXG5Zb3UgbGlrZWx5IGZvcmdvdCB0byBleHBvcnQgeW91ciBjb21wb25lbnQgb3IgbWlnaHQgaGF2ZSBtaXhlZCB1cCBkZWZhdWx0IGFuZCBuYW1lZCBpbXBvcnRzXCIreShuKStcIlxcblxcblwiK2YobikpO2lmKG51bGwhPXImJlwib2JqZWN0XCI9PXR5cGVvZiByKXtpZih2b2lkIDAhPT1yLl9fayYmdm9pZCAwIT09ci5fX2UpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0eXBlIHBhc3NlZCB0byBjcmVhdGVFbGVtZW50KCk6IFwiK3IrXCJcXG5cXG5EaWQgeW91IGFjY2lkZW50YWxseSBwYXNzIGEgSlNYIGxpdGVyYWwgYXMgSlNYIHR3aWNlP1xcblxcbiAgbGV0IE15XCIrYShuKStcIiA9IFwiK3kocikrXCI7XFxuICBsZXQgdm5vZGUgPSA8TXlcIithKG4pK1wiIC8+O1xcblxcblRoaXMgdXN1YWxseSBoYXBwZW5zIHdoZW4geW91IGV4cG9ydCBhIEpTWCBsaXRlcmFsIGFuZCBub3QgdGhlIGNvbXBvbmVudC5cXG5cXG5cIitmKG4pKTt0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHR5cGUgcGFzc2VkIHRvIGNyZWF0ZUVsZW1lbnQoKTogXCIrKEFycmF5LmlzQXJyYXkocik/XCJhcnJheVwiOnIpKX1pZihcInRoZWFkXCIhPT1yJiZcInRmb290XCIhPT1yJiZcInRib2R5XCIhPT1yfHxcInRhYmxlXCI9PT1pLnR5cGU/XCJ0clwiPT09ciYmXCJ0aGVhZFwiIT09aS50eXBlJiZcInRmb290XCIhPT1pLnR5cGUmJlwidGJvZHlcIiE9PWkudHlwZSYmXCJ0YWJsZVwiIT09aS50eXBlP2NvbnNvbGUuZXJyb3IoXCJJbXByb3BlciBuZXN0aW5nIG9mIHRhYmxlLiBZb3VyIDx0cj4gc2hvdWxkIGhhdmUgYSA8dGhlYWQvdGJvZHkvdGZvb3QvdGFibGU+IHBhcmVudC5cIit5KG4pK1wiXFxuXFxuXCIrZihuKSk6XCJ0ZFwiPT09ciYmXCJ0clwiIT09aS50eXBlP2NvbnNvbGUuZXJyb3IoXCJJbXByb3BlciBuZXN0aW5nIG9mIHRhYmxlLiBZb3VyIDx0ZD4gc2hvdWxkIGhhdmUgYSA8dHI+IHBhcmVudC5cIit5KG4pK1wiXFxuXFxuXCIrZihuKSk6XCJ0aFwiPT09ciYmXCJ0clwiIT09aS50eXBlJiZjb25zb2xlLmVycm9yKFwiSW1wcm9wZXIgbmVzdGluZyBvZiB0YWJsZS4gWW91ciA8dGg+IHNob3VsZCBoYXZlIGEgPHRyPi5cIit5KG4pK1wiXFxuXFxuXCIrZihuKSk6Y29uc29sZS5lcnJvcihcIkltcHJvcGVyIG5lc3Rpbmcgb2YgdGFibGUuIFlvdXIgPHRoZWFkL3Rib2R5L3Rmb290PiBzaG91bGQgaGF2ZSBhIDx0YWJsZT4gcGFyZW50LlwiK3kobikrXCJcXG5cXG5cIitmKG4pKSx2b2lkIDAhPT1uLnJlZiYmXCJmdW5jdGlvblwiIT10eXBlb2Ygbi5yZWYmJlwib2JqZWN0XCIhPXR5cGVvZiBuLnJlZiYmIShcIiQkdHlwZW9mXCJpbiBuKSl0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudFxcJ3MgXCJyZWZcIiBwcm9wZXJ0eSBzaG91bGQgYmUgYSBmdW5jdGlvbiwgb3IgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgY3JlYXRlUmVmKCksIGJ1dCBnb3QgWycrdHlwZW9mIG4ucmVmK1wiXSBpbnN0ZWFkXFxuXCIreShuKStcIlxcblxcblwiK2YobikpO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBuLnR5cGUpZm9yKHZhciBzIGluIG4ucHJvcHMpaWYoXCJvXCI9PT1zWzBdJiZcIm5cIj09PXNbMV0mJlwiZnVuY3Rpb25cIiE9dHlwZW9mIG4ucHJvcHNbc10mJm51bGwhPW4ucHJvcHNbc10pdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50J3MgXFxcIlwiK3MrJ1wiIHByb3BlcnR5IHNob3VsZCBiZSBhIGZ1bmN0aW9uLCBidXQgZ290IFsnK3R5cGVvZiBuLnByb3BzW3NdK1wiXSBpbnN0ZWFkXFxuXCIreShuKStcIlxcblxcblwiK2YobikpO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIG4udHlwZSYmbi50eXBlLnByb3BUeXBlcyl7aWYoXCJMYXp5XCI9PT1uLnR5cGUuZGlzcGxheU5hbWUmJm0mJiFtLmxhenlQcm9wVHlwZXMuaGFzKG4udHlwZSkpe3ZhciBjPVwiUHJvcFR5cGVzIGFyZSBub3Qgc3VwcG9ydGVkIG9uIGxhenkoKS4gVXNlIHByb3BUeXBlcyBvbiB0aGUgd3JhcHBlZCBjb21wb25lbnQgaXRzZWxmLiBcIjt0cnl7dmFyIGw9bi50eXBlKCk7bS5sYXp5UHJvcFR5cGVzLnNldChuLnR5cGUsITApLGNvbnNvbGUud2FybihjK1wiQ29tcG9uZW50IHdyYXBwZWQgaW4gbGF6eSgpIGlzIFwiK2EobCkpfWNhdGNoKG4pe2NvbnNvbGUud2FybihjK1wiV2Ugd2lsbCBsb2cgdGhlIHdyYXBwZWQgY29tcG9uZW50J3MgbmFtZSBvbmNlIGl0IGlzIGxvYWRlZC5cIil9fXZhciB1PW4ucHJvcHM7bi50eXBlLl9fZiYmZGVsZXRlKHU9ZnVuY3Rpb24obix0KXtmb3IodmFyIGUgaW4gdCluW2VdPXRbZV07cmV0dXJuIG59KHt9LHUpKS5yZWYsZnVuY3Rpb24obix0LGUscixhKXtPYmplY3Qua2V5cyhuKS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3ZhciBpO3RyeXtpPW5bZV0odCxlLHIsXCJwcm9wXCIsbnVsbCxcIlNFQ1JFVF9ET19OT1RfUEFTU19USElTX09SX1lPVV9XSUxMX0JFX0ZJUkVEXCIpfWNhdGNoKG4pe2k9bn0haXx8aS5tZXNzYWdlIGluIG98fChvW2kubWVzc2FnZV09ITAsY29uc29sZS5lcnJvcihcIkZhaWxlZCBwcm9wIHR5cGU6IFwiK2kubWVzc2FnZSsoYSYmXCJcXG5cIithKCl8fFwiXCIpKSl9KX0obi50eXBlLnByb3BUeXBlcyx1LDAsYShuKSxmdW5jdGlvbigpe3JldHVybiBmKG4pfSl9ZSYmZShuKX0sbi5fX2g9ZnVuY3Rpb24obixlLG8pe2lmKCFufHwhdCl0aHJvdyBuZXcgRXJyb3IoXCJIb29rIGNhbiBvbmx5IGJlIGludm9rZWQgZnJvbSByZW5kZXIgbWV0aG9kcy5cIik7aCYmaChuLGUsbyl9O3ZhciBiPWZ1bmN0aW9uKG4sdCl7cmV0dXJue2dldDpmdW5jdGlvbigpe3ZhciBlPVwiZ2V0XCIrbit0O3YmJnYuaW5kZXhPZihlKTwwJiYodi5wdXNoKGUpLGNvbnNvbGUud2FybihcImdldHRpbmcgdm5vZGUuXCIrbitcIiBpcyBkZXByZWNhdGVkLCBcIit0KSl9LHNldDpmdW5jdGlvbigpe3ZhciBlPVwic2V0XCIrbit0O3YmJnYuaW5kZXhPZihlKTwwJiYodi5wdXNoKGUpLGNvbnNvbGUud2FybihcInNldHRpbmcgdm5vZGUuXCIrbitcIiBpcyBub3QgYWxsb3dlZCwgXCIrdCkpfX19LHc9e25vZGVOYW1lOmIoXCJub2RlTmFtZVwiLFwidXNlIHZub2RlLnR5cGVcIiksYXR0cmlidXRlczpiKFwiYXR0cmlidXRlc1wiLFwidXNlIHZub2RlLnByb3BzXCIpLGNoaWxkcmVuOmIoXCJjaGlsZHJlblwiLFwidXNlIHZub2RlLnByb3BzLmNoaWxkcmVuXCIpfSxnPU9iamVjdC5jcmVhdGUoe30sdyk7bi52bm9kZT1mdW5jdGlvbihuKXt2YXIgdD1uLnByb3BzO2lmKG51bGwhPT1uLnR5cGUmJm51bGwhPXQmJihcIl9fc291cmNlXCJpbiB0fHxcIl9fc2VsZlwiaW4gdCkpe3ZhciBlPW4ucHJvcHM9e307Zm9yKHZhciBvIGluIHQpe3ZhciByPXRbb107XCJfX3NvdXJjZVwiPT09bz9uLl9fc291cmNlPXI6XCJfX3NlbGZcIj09PW8/bi5fX3NlbGY9cjplW29dPXJ9fW4uX19wcm90b19fPWcsYyYmYyhuKX0sbi5kaWZmZWQ9ZnVuY3Rpb24obil7aWYobi5fX2smJm4uX19rLmZvckVhY2goZnVuY3Rpb24odCl7aWYodCYmdm9pZCAwPT09dC50eXBlKXtkZWxldGUgdC5fXyxkZWxldGUgdC5fX2I7dmFyIGU9T2JqZWN0LmtleXModCkuam9pbihcIixcIik7dGhyb3cgbmV3IEVycm9yKFwiT2JqZWN0cyBhcmUgbm90IHZhbGlkIGFzIGEgY2hpbGQuIEVuY291bnRlcmVkIGFuIG9iamVjdCB3aXRoIHRoZSBrZXlzIHtcIitlK1wifS5cXG5cXG5cIitmKG4pKX19KSx0PSExLHImJnIobiksbnVsbCE9bi5fX2spZm9yKHZhciBlPVtdLG89MDtvPG4uX19rLmxlbmd0aDtvKyspe3ZhciBhPW4uX19rW29dO2lmKGEmJm51bGwhPWEua2V5KXt2YXIgaT1hLmtleTtpZigtMSE9PWUuaW5kZXhPZihpKSl7Y29uc29sZS5lcnJvcignRm9sbG93aW5nIGNvbXBvbmVudCBoYXMgdHdvIG9yIG1vcmUgY2hpbGRyZW4gd2l0aCB0aGUgc2FtZSBrZXkgYXR0cmlidXRlOiBcIicraSsnXCIuIFRoaXMgbWF5IGNhdXNlIGdsaXRjaGVzIGFuZCBtaXNiZWhhdmlvciBpbiByZW5kZXJpbmcgcHJvY2Vzcy4gQ29tcG9uZW50OiBcXG5cXG4nK3kobikrXCJcXG5cXG5cIitmKG4pKTticmVha31lLnB1c2goaSl9fX19KCk7ZXhwb3J0e3IgYXMgcmVzZXRQcm9wV2FybmluZ3N9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVidWcubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0e29wdGlvbnMgYXMgbixGcmFnbWVudCBhcyBvLENvbXBvbmVudCBhcyBlfWZyb21cInByZWFjdFwiO2Z1bmN0aW9uIHQobyxlKXtyZXR1cm4gbi5fX2EmJm4uX19hKGUpLG99XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyYmd2luZG93Ll9fUFJFQUNUX0RFVlRPT0xTX18mJndpbmRvdy5fX1BSRUFDVF9ERVZUT09MU19fLmF0dGFjaFByZWFjdChcIjEwLjUuMTNcIixuLHtGcmFnbWVudDpvLENvbXBvbmVudDplfSk7ZXhwb3J0e3QgYXMgYWRkSG9va05hbWV9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGV2dG9vbHMubW9kdWxlLmpzLm1hcFxuIiwidmFyIG4sbCx1LGksdCxvLHI9e30sZj1bXSxlPS9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8Z3JpZHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkfGl0ZXJhL2k7ZnVuY3Rpb24gYyhuLGwpe2Zvcih2YXIgdSBpbiBsKW5bdV09bFt1XTtyZXR1cm4gbn1mdW5jdGlvbiBzKG4pe3ZhciBsPW4ucGFyZW50Tm9kZTtsJiZsLnJlbW92ZUNoaWxkKG4pfWZ1bmN0aW9uIGEobixsLHUpe3ZhciBpLHQsbyxyPWFyZ3VtZW50cyxmPXt9O2ZvcihvIGluIGwpXCJrZXlcIj09bz9pPWxbb106XCJyZWZcIj09bz90PWxbb106ZltvXT1sW29dO2lmKGFyZ3VtZW50cy5sZW5ndGg+Mylmb3IodT1bdV0sbz0zO288YXJndW1lbnRzLmxlbmd0aDtvKyspdS5wdXNoKHJbb10pO2lmKG51bGwhPXUmJihmLmNoaWxkcmVuPXUpLFwiZnVuY3Rpb25cIj09dHlwZW9mIG4mJm51bGwhPW4uZGVmYXVsdFByb3BzKWZvcihvIGluIG4uZGVmYXVsdFByb3BzKXZvaWQgMD09PWZbb10mJihmW29dPW4uZGVmYXVsdFByb3BzW29dKTtyZXR1cm4gdihuLGYsaSx0LG51bGwpfWZ1bmN0aW9uIHYobCx1LGksdCxvKXt2YXIgcj17dHlwZTpsLHByb3BzOnUsa2V5OmkscmVmOnQsX19rOm51bGwsX186bnVsbCxfX2I6MCxfX2U6bnVsbCxfX2Q6dm9pZCAwLF9fYzpudWxsLF9faDpudWxsLGNvbnN0cnVjdG9yOnZvaWQgMCxfX3Y6bnVsbD09bz8rK24uX192Om99O3JldHVybiBudWxsIT1uLnZub2RlJiZuLnZub2RlKHIpLHJ9ZnVuY3Rpb24gaCgpe3JldHVybntjdXJyZW50Om51bGx9fWZ1bmN0aW9uIHkobil7cmV0dXJuIG4uY2hpbGRyZW59ZnVuY3Rpb24gcChuLGwpe3RoaXMucHJvcHM9bix0aGlzLmNvbnRleHQ9bH1mdW5jdGlvbiBkKG4sbCl7aWYobnVsbD09bClyZXR1cm4gbi5fXz9kKG4uX18sbi5fXy5fX2suaW5kZXhPZihuKSsxKTpudWxsO2Zvcih2YXIgdTtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSlyZXR1cm4gdS5fX2U7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbi50eXBlP2Qobik6bnVsbH1mdW5jdGlvbiBfKG4pe3ZhciBsLHU7aWYobnVsbCE9KG49bi5fXykmJm51bGwhPW4uX19jKXtmb3Iobi5fX2U9bi5fX2MuYmFzZT1udWxsLGw9MDtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSl7bi5fX2U9bi5fX2MuYmFzZT11Ll9fZTticmVha31yZXR1cm4gXyhuKX19ZnVuY3Rpb24gayhsKXsoIWwuX19kJiYobC5fX2Q9ITApJiZ1LnB1c2gobCkmJiFiLl9fcisrfHx0IT09bi5kZWJvdW5jZVJlbmRlcmluZykmJigodD1uLmRlYm91bmNlUmVuZGVyaW5nKXx8aSkoYil9ZnVuY3Rpb24gYigpe2Zvcih2YXIgbjtiLl9fcj11Lmxlbmd0aDspbj11LnNvcnQoZnVuY3Rpb24obixsKXtyZXR1cm4gbi5fX3YuX19iLWwuX192Ll9fYn0pLHU9W10sbi5zb21lKGZ1bmN0aW9uKG4pe3ZhciBsLHUsaSx0LG8scjtuLl9fZCYmKG89KHQ9KGw9bikuX192KS5fX2UsKHI9bC5fX1ApJiYodT1bXSwoaT1jKHt9LHQpKS5fX3Y9dC5fX3YrMSxJKHIsdCxpLGwuX19uLHZvaWQgMCE9PXIub3duZXJTVkdFbGVtZW50LG51bGwhPXQuX19oP1tvXTpudWxsLHUsbnVsbD09bz9kKHQpOm8sdC5fX2gpLFQodSx0KSx0Ll9fZSE9byYmXyh0KSkpfSl9ZnVuY3Rpb24gbShuLGwsdSxpLHQsbyxlLGMscyxhKXt2YXIgaCxwLF8sayxiLG0sdyxBPWkmJmkuX19rfHxmLFA9QS5sZW5ndGg7Zm9yKHUuX19rPVtdLGg9MDtoPGwubGVuZ3RoO2grKylpZihudWxsIT0oaz11Ll9fa1toXT1udWxsPT0oaz1sW2hdKXx8XCJib29sZWFuXCI9PXR5cGVvZiBrP251bGw6XCJzdHJpbmdcIj09dHlwZW9mIGt8fFwibnVtYmVyXCI9PXR5cGVvZiBrfHxcImJpZ2ludFwiPT10eXBlb2Ygaz92KG51bGwsayxudWxsLG51bGwsayk6QXJyYXkuaXNBcnJheShrKT92KHkse2NoaWxkcmVuOmt9LG51bGwsbnVsbCxudWxsKTprLl9fYj4wP3Yoay50eXBlLGsucHJvcHMsay5rZXksbnVsbCxrLl9fdik6aykpe2lmKGsuX189dSxrLl9fYj11Ll9fYisxLG51bGw9PT0oXz1BW2hdKXx8XyYmay5rZXk9PV8ua2V5JiZrLnR5cGU9PT1fLnR5cGUpQVtoXT12b2lkIDA7ZWxzZSBmb3IocD0wO3A8UDtwKyspe2lmKChfPUFbcF0pJiZrLmtleT09Xy5rZXkmJmsudHlwZT09PV8udHlwZSl7QVtwXT12b2lkIDA7YnJlYWt9Xz1udWxsfUkobixrLF89X3x8cix0LG8sZSxjLHMsYSksYj1rLl9fZSwocD1rLnJlZikmJl8ucmVmIT1wJiYod3x8KHc9W10pLF8ucmVmJiZ3LnB1c2goXy5yZWYsbnVsbCxrKSx3LnB1c2gocCxrLl9fY3x8YixrKSksbnVsbCE9Yj8obnVsbD09bSYmKG09YiksXCJmdW5jdGlvblwiPT10eXBlb2Ygay50eXBlJiZudWxsIT1rLl9fayYmay5fX2s9PT1fLl9faz9rLl9fZD1zPWcoayxzLG4pOnM9eChuLGssXyxBLGIscyksYXx8XCJvcHRpb25cIiE9PXUudHlwZT9cImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJih1Ll9fZD1zKTpuLnZhbHVlPVwiXCIpOnMmJl8uX19lPT1zJiZzLnBhcmVudE5vZGUhPW4mJihzPWQoXykpfWZvcih1Ll9fZT1tLGg9UDtoLS07KW51bGwhPUFbaF0mJihcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJm51bGwhPUFbaF0uX19lJiZBW2hdLl9fZT09dS5fX2QmJih1Ll9fZD1kKGksaCsxKSksTChBW2hdLEFbaF0pKTtpZih3KWZvcihoPTA7aDx3Lmxlbmd0aDtoKyspeih3W2hdLHdbKytoXSx3WysraF0pfWZ1bmN0aW9uIGcobixsLHUpe3ZhciBpLHQ7Zm9yKGk9MDtpPG4uX19rLmxlbmd0aDtpKyspKHQ9bi5fX2tbaV0pJiYodC5fXz1uLGw9XCJmdW5jdGlvblwiPT10eXBlb2YgdC50eXBlP2codCxsLHUpOngodSx0LHQsbi5fX2ssdC5fX2UsbCkpO3JldHVybiBsfWZ1bmN0aW9uIHcobixsKXtyZXR1cm4gbD1sfHxbXSxudWxsPT1ufHxcImJvb2xlYW5cIj09dHlwZW9mIG58fChBcnJheS5pc0FycmF5KG4pP24uc29tZShmdW5jdGlvbihuKXt3KG4sbCl9KTpsLnB1c2gobikpLGx9ZnVuY3Rpb24geChuLGwsdSxpLHQsbyl7dmFyIHIsZixlO2lmKHZvaWQgMCE9PWwuX19kKXI9bC5fX2QsbC5fX2Q9dm9pZCAwO2Vsc2UgaWYobnVsbD09dXx8dCE9b3x8bnVsbD09dC5wYXJlbnROb2RlKW46aWYobnVsbD09b3x8by5wYXJlbnROb2RlIT09biluLmFwcGVuZENoaWxkKHQpLHI9bnVsbDtlbHNle2ZvcihmPW8sZT0wOyhmPWYubmV4dFNpYmxpbmcpJiZlPGkubGVuZ3RoO2UrPTIpaWYoZj09dClicmVhayBuO24uaW5zZXJ0QmVmb3JlKHQsbykscj1vfXJldHVybiB2b2lkIDAhPT1yP3I6dC5uZXh0U2libGluZ31mdW5jdGlvbiBBKG4sbCx1LGksdCl7dmFyIG87Zm9yKG8gaW4gdSlcImNoaWxkcmVuXCI9PT1vfHxcImtleVwiPT09b3x8byBpbiBsfHxDKG4sbyxudWxsLHVbb10saSk7Zm9yKG8gaW4gbCl0JiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBsW29dfHxcImNoaWxkcmVuXCI9PT1vfHxcImtleVwiPT09b3x8XCJ2YWx1ZVwiPT09b3x8XCJjaGVja2VkXCI9PT1vfHx1W29dPT09bFtvXXx8QyhuLG8sbFtvXSx1W29dLGkpfWZ1bmN0aW9uIFAobixsLHUpe1wiLVwiPT09bFswXT9uLnNldFByb3BlcnR5KGwsdSk6bltsXT1udWxsPT11P1wiXCI6XCJudW1iZXJcIiE9dHlwZW9mIHV8fGUudGVzdChsKT91OnUrXCJweFwifWZ1bmN0aW9uIEMobixsLHUsaSx0KXt2YXIgbztuOmlmKFwic3R5bGVcIj09PWwpaWYoXCJzdHJpbmdcIj09dHlwZW9mIHUpbi5zdHlsZS5jc3NUZXh0PXU7ZWxzZXtpZihcInN0cmluZ1wiPT10eXBlb2YgaSYmKG4uc3R5bGUuY3NzVGV4dD1pPVwiXCIpLGkpZm9yKGwgaW4gaSl1JiZsIGluIHV8fFAobi5zdHlsZSxsLFwiXCIpO2lmKHUpZm9yKGwgaW4gdSlpJiZ1W2xdPT09aVtsXXx8UChuLnN0eWxlLGwsdVtsXSl9ZWxzZSBpZihcIm9cIj09PWxbMF0mJlwiblwiPT09bFsxXSlvPWwhPT0obD1sLnJlcGxhY2UoL0NhcHR1cmUkLyxcIlwiKSksbD1sLnRvTG93ZXJDYXNlKClpbiBuP2wudG9Mb3dlckNhc2UoKS5zbGljZSgyKTpsLnNsaWNlKDIpLG4ubHx8KG4ubD17fSksbi5sW2wrb109dSx1P2l8fG4uYWRkRXZlbnRMaXN0ZW5lcihsLG8/SDokLG8pOm4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihsLG8/SDokLG8pO2Vsc2UgaWYoXCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiIT09bCl7aWYodClsPWwucmVwbGFjZSgveGxpbmtbSDpoXS8sXCJoXCIpLnJlcGxhY2UoL3NOYW1lJC8sXCJzXCIpO2Vsc2UgaWYoXCJocmVmXCIhPT1sJiZcImxpc3RcIiE9PWwmJlwiZm9ybVwiIT09bCYmXCJ0YWJJbmRleFwiIT09bCYmXCJkb3dubG9hZFwiIT09bCYmbCBpbiBuKXRyeXtuW2xdPW51bGw9PXU/XCJcIjp1O2JyZWFrIG59Y2F0Y2gobil7fVwiZnVuY3Rpb25cIj09dHlwZW9mIHV8fChudWxsIT11JiYoITEhPT11fHxcImFcIj09PWxbMF0mJlwiclwiPT09bFsxXSk/bi5zZXRBdHRyaWJ1dGUobCx1KTpuLnJlbW92ZUF0dHJpYnV0ZShsKSl9fWZ1bmN0aW9uICQobCl7dGhpcy5sW2wudHlwZSshMV0obi5ldmVudD9uLmV2ZW50KGwpOmwpfWZ1bmN0aW9uIEgobCl7dGhpcy5sW2wudHlwZSshMF0obi5ldmVudD9uLmV2ZW50KGwpOmwpfWZ1bmN0aW9uIEkobCx1LGksdCxvLHIsZixlLHMpe3ZhciBhLHYsaCxkLF8sayxiLGcsdyx4LEEsUD11LnR5cGU7aWYodm9pZCAwIT09dS5jb25zdHJ1Y3RvcilyZXR1cm4gbnVsbDtudWxsIT1pLl9faCYmKHM9aS5fX2gsZT11Ll9fZT1pLl9fZSx1Ll9faD1udWxsLHI9W2VdKSwoYT1uLl9fYikmJmEodSk7dHJ5e246aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUCl7aWYoZz11LnByb3BzLHc9KGE9UC5jb250ZXh0VHlwZSkmJnRbYS5fX2NdLHg9YT93P3cucHJvcHMudmFsdWU6YS5fXzp0LGkuX19jP2I9KHY9dS5fX2M9aS5fX2MpLl9fPXYuX19FOihcInByb3RvdHlwZVwiaW4gUCYmUC5wcm90b3R5cGUucmVuZGVyP3UuX19jPXY9bmV3IFAoZyx4KToodS5fX2M9dj1uZXcgcChnLHgpLHYuY29uc3RydWN0b3I9UCx2LnJlbmRlcj1NKSx3JiZ3LnN1Yih2KSx2LnByb3BzPWcsdi5zdGF0ZXx8KHYuc3RhdGU9e30pLHYuY29udGV4dD14LHYuX19uPXQsaD12Ll9fZD0hMCx2Ll9faD1bXSksbnVsbD09di5fX3MmJih2Ll9fcz12LnN0YXRlKSxudWxsIT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmKHYuX19zPT12LnN0YXRlJiYodi5fX3M9Yyh7fSx2Ll9fcykpLGModi5fX3MsUC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoZyx2Ll9fcykpKSxkPXYucHJvcHMsXz12LnN0YXRlLGgpbnVsbD09UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm51bGwhPXYuY29tcG9uZW50V2lsbE1vdW50JiZ2LmNvbXBvbmVudFdpbGxNb3VudCgpLG51bGwhPXYuY29tcG9uZW50RGlkTW91bnQmJnYuX19oLnB1c2godi5jb21wb25lbnREaWRNb3VudCk7ZWxzZXtpZihudWxsPT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmZyE9PWQmJm51bGwhPXYuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyYmdi5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKGcseCksIXYuX19lJiZudWxsIT12LnNob3VsZENvbXBvbmVudFVwZGF0ZSYmITE9PT12LnNob3VsZENvbXBvbmVudFVwZGF0ZShnLHYuX19zLHgpfHx1Ll9fdj09PWkuX192KXt2LnByb3BzPWcsdi5zdGF0ZT12Ll9fcyx1Ll9fdiE9PWkuX192JiYodi5fX2Q9ITEpLHYuX192PXUsdS5fX2U9aS5fX2UsdS5fX2s9aS5fX2ssdS5fX2suZm9yRWFjaChmdW5jdGlvbihuKXtuJiYobi5fXz11KX0pLHYuX19oLmxlbmd0aCYmZi5wdXNoKHYpO2JyZWFrIG59bnVsbCE9di5jb21wb25lbnRXaWxsVXBkYXRlJiZ2LmNvbXBvbmVudFdpbGxVcGRhdGUoZyx2Ll9fcyx4KSxudWxsIT12LmNvbXBvbmVudERpZFVwZGF0ZSYmdi5fX2gucHVzaChmdW5jdGlvbigpe3YuY29tcG9uZW50RGlkVXBkYXRlKGQsXyxrKX0pfXYuY29udGV4dD14LHYucHJvcHM9Zyx2LnN0YXRlPXYuX19zLChhPW4uX19yKSYmYSh1KSx2Ll9fZD0hMSx2Ll9fdj11LHYuX19QPWwsYT12LnJlbmRlcih2LnByb3BzLHYuc3RhdGUsdi5jb250ZXh0KSx2LnN0YXRlPXYuX19zLG51bGwhPXYuZ2V0Q2hpbGRDb250ZXh0JiYodD1jKGMoe30sdCksdi5nZXRDaGlsZENvbnRleHQoKSkpLGh8fG51bGw9PXYuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGV8fChrPXYuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUoZCxfKSksQT1udWxsIT1hJiZhLnR5cGU9PT15JiZudWxsPT1hLmtleT9hLnByb3BzLmNoaWxkcmVuOmEsbShsLEFycmF5LmlzQXJyYXkoQSk/QTpbQV0sdSxpLHQsbyxyLGYsZSxzKSx2LmJhc2U9dS5fX2UsdS5fX2g9bnVsbCx2Ll9faC5sZW5ndGgmJmYucHVzaCh2KSxiJiYodi5fX0U9di5fXz1udWxsKSx2Ll9fZT0hMX1lbHNlIG51bGw9PXImJnUuX192PT09aS5fX3Y/KHUuX19rPWkuX19rLHUuX19lPWkuX19lKTp1Ll9fZT1qKGkuX19lLHUsaSx0LG8scixmLHMpOyhhPW4uZGlmZmVkKSYmYSh1KX1jYXRjaChsKXt1Ll9fdj1udWxsLChzfHxudWxsIT1yKSYmKHUuX19lPWUsdS5fX2g9ISFzLHJbci5pbmRleE9mKGUpXT1udWxsKSxuLl9fZShsLHUsaSl9fWZ1bmN0aW9uIFQobCx1KXtuLl9fYyYmbi5fX2ModSxsKSxsLnNvbWUoZnVuY3Rpb24odSl7dHJ5e2w9dS5fX2gsdS5fX2g9W10sbC5zb21lKGZ1bmN0aW9uKG4pe24uY2FsbCh1KX0pfWNhdGNoKGwpe24uX19lKGwsdS5fX3YpfX0pfWZ1bmN0aW9uIGoobixsLHUsaSx0LG8sZSxjKXt2YXIgYSx2LGgseSxwPXUucHJvcHMsZD1sLnByb3BzLF89bC50eXBlLGs9MDtpZihcInN2Z1wiPT09XyYmKHQ9ITApLG51bGwhPW8pZm9yKDtrPG8ubGVuZ3RoO2srKylpZigoYT1vW2tdKSYmKGE9PT1ufHwoXz9hLmxvY2FsTmFtZT09XzozPT1hLm5vZGVUeXBlKSkpe249YSxvW2tdPW51bGw7YnJlYWt9aWYobnVsbD09bil7aWYobnVsbD09PV8pcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGQpO249dD9kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLF8pOmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXyxkLmlzJiZkKSxvPW51bGwsYz0hMX1pZihudWxsPT09XylwPT09ZHx8YyYmbi5kYXRhPT09ZHx8KG4uZGF0YT1kKTtlbHNle2lmKG89byYmZi5zbGljZS5jYWxsKG4uY2hpbGROb2Rlcyksdj0ocD11LnByb3BzfHxyKS5kYW5nZXJvdXNseVNldElubmVySFRNTCxoPWQuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsIWMpe2lmKG51bGwhPW8pZm9yKHA9e30seT0wO3k8bi5hdHRyaWJ1dGVzLmxlbmd0aDt5KyspcFtuLmF0dHJpYnV0ZXNbeV0ubmFtZV09bi5hdHRyaWJ1dGVzW3ldLnZhbHVlOyhofHx2KSYmKGgmJih2JiZoLl9faHRtbD09di5fX2h0bWx8fGguX19odG1sPT09bi5pbm5lckhUTUwpfHwobi5pbm5lckhUTUw9aCYmaC5fX2h0bWx8fFwiXCIpKX1pZihBKG4sZCxwLHQsYyksaClsLl9faz1bXTtlbHNlIGlmKGs9bC5wcm9wcy5jaGlsZHJlbixtKG4sQXJyYXkuaXNBcnJheShrKT9rOltrXSxsLHUsaSx0JiZcImZvcmVpZ25PYmplY3RcIiE9PV8sbyxlLG4uZmlyc3RDaGlsZCxjKSxudWxsIT1vKWZvcihrPW8ubGVuZ3RoO2stLTspbnVsbCE9b1trXSYmcyhvW2tdKTtjfHwoXCJ2YWx1ZVwiaW4gZCYmdm9pZCAwIT09KGs9ZC52YWx1ZSkmJihrIT09bi52YWx1ZXx8XCJwcm9ncmVzc1wiPT09XyYmIWspJiZDKG4sXCJ2YWx1ZVwiLGsscC52YWx1ZSwhMSksXCJjaGVja2VkXCJpbiBkJiZ2b2lkIDAhPT0oaz1kLmNoZWNrZWQpJiZrIT09bi5jaGVja2VkJiZDKG4sXCJjaGVja2VkXCIsayxwLmNoZWNrZWQsITEpKX1yZXR1cm4gbn1mdW5jdGlvbiB6KGwsdSxpKXt0cnl7XCJmdW5jdGlvblwiPT10eXBlb2YgbD9sKHUpOmwuY3VycmVudD11fWNhdGNoKGwpe24uX19lKGwsaSl9fWZ1bmN0aW9uIEwobCx1LGkpe3ZhciB0LG8scjtpZihuLnVubW91bnQmJm4udW5tb3VudChsKSwodD1sLnJlZikmJih0LmN1cnJlbnQmJnQuY3VycmVudCE9PWwuX19lfHx6KHQsbnVsbCx1KSksaXx8XCJmdW5jdGlvblwiPT10eXBlb2YgbC50eXBlfHwoaT1udWxsIT0obz1sLl9fZSkpLGwuX19lPWwuX19kPXZvaWQgMCxudWxsIT0odD1sLl9fYykpe2lmKHQuY29tcG9uZW50V2lsbFVubW91bnQpdHJ5e3QuY29tcG9uZW50V2lsbFVubW91bnQoKX1jYXRjaChsKXtuLl9fZShsLHUpfXQuYmFzZT10Ll9fUD1udWxsfWlmKHQ9bC5fX2spZm9yKHI9MDtyPHQubGVuZ3RoO3IrKyl0W3JdJiZMKHRbcl0sdSxpKTtudWxsIT1vJiZzKG8pfWZ1bmN0aW9uIE0obixsLHUpe3JldHVybiB0aGlzLmNvbnN0cnVjdG9yKG4sdSl9ZnVuY3Rpb24gTihsLHUsaSl7dmFyIHQsbyxlO24uX18mJm4uX18obCx1KSxvPSh0PVwiZnVuY3Rpb25cIj09dHlwZW9mIGkpP251bGw6aSYmaS5fX2t8fHUuX19rLGU9W10sSSh1LGw9KCF0JiZpfHx1KS5fX2s9YSh5LG51bGwsW2xdKSxvfHxyLHIsdm9pZCAwIT09dS5vd25lclNWR0VsZW1lbnQsIXQmJmk/W2ldOm8/bnVsbDp1LmZpcnN0Q2hpbGQ/Zi5zbGljZS5jYWxsKHUuY2hpbGROb2Rlcyk6bnVsbCxlLCF0JiZpP2k6bz9vLl9fZTp1LmZpcnN0Q2hpbGQsdCksVChlLGwpfWZ1bmN0aW9uIE8obixsKXtOKG4sbCxPKX1mdW5jdGlvbiBTKG4sbCx1KXt2YXIgaSx0LG8scj1hcmd1bWVudHMsZj1jKHt9LG4ucHJvcHMpO2ZvcihvIGluIGwpXCJrZXlcIj09bz9pPWxbb106XCJyZWZcIj09bz90PWxbb106ZltvXT1sW29dO2lmKGFyZ3VtZW50cy5sZW5ndGg+Mylmb3IodT1bdV0sbz0zO288YXJndW1lbnRzLmxlbmd0aDtvKyspdS5wdXNoKHJbb10pO3JldHVybiBudWxsIT11JiYoZi5jaGlsZHJlbj11KSx2KG4udHlwZSxmLGl8fG4ua2V5LHR8fG4ucmVmLG51bGwpfWZ1bmN0aW9uIHEobixsKXt2YXIgdT17X19jOmw9XCJfX2NDXCIrbysrLF9fOm4sQ29uc3VtZXI6ZnVuY3Rpb24obixsKXtyZXR1cm4gbi5jaGlsZHJlbihsKX0sUHJvdmlkZXI6ZnVuY3Rpb24obil7dmFyIHUsaTtyZXR1cm4gdGhpcy5nZXRDaGlsZENvbnRleHR8fCh1PVtdLChpPXt9KVtsXT10aGlzLHRoaXMuZ2V0Q2hpbGRDb250ZXh0PWZ1bmN0aW9uKCl7cmV0dXJuIGl9LHRoaXMuc2hvdWxkQ29tcG9uZW50VXBkYXRlPWZ1bmN0aW9uKG4pe3RoaXMucHJvcHMudmFsdWUhPT1uLnZhbHVlJiZ1LnNvbWUoayl9LHRoaXMuc3ViPWZ1bmN0aW9uKG4pe3UucHVzaChuKTt2YXIgbD1uLmNvbXBvbmVudFdpbGxVbm1vdW50O24uY29tcG9uZW50V2lsbFVubW91bnQ9ZnVuY3Rpb24oKXt1LnNwbGljZSh1LmluZGV4T2YobiksMSksbCYmbC5jYWxsKG4pfX0pLG4uY2hpbGRyZW59fTtyZXR1cm4gdS5Qcm92aWRlci5fXz11LkNvbnN1bWVyLmNvbnRleHRUeXBlPXV9bj17X19lOmZ1bmN0aW9uKG4sbCl7Zm9yKHZhciB1LGksdDtsPWwuX187KWlmKCh1PWwuX19jKSYmIXUuX18pdHJ5e2lmKChpPXUuY29uc3RydWN0b3IpJiZudWxsIT1pLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvciYmKHUuc2V0U3RhdGUoaS5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IobikpLHQ9dS5fX2QpLG51bGwhPXUuY29tcG9uZW50RGlkQ2F0Y2gmJih1LmNvbXBvbmVudERpZENhdGNoKG4pLHQ9dS5fX2QpLHQpcmV0dXJuIHUuX19FPXV9Y2F0Y2gobCl7bj1sfXRocm93IG59LF9fdjowfSxsPWZ1bmN0aW9uKG4pe3JldHVybiBudWxsIT1uJiZ2b2lkIDA9PT1uLmNvbnN0cnVjdG9yfSxwLnByb3RvdHlwZS5zZXRTdGF0ZT1mdW5jdGlvbihuLGwpe3ZhciB1O3U9bnVsbCE9dGhpcy5fX3MmJnRoaXMuX19zIT09dGhpcy5zdGF0ZT90aGlzLl9fczp0aGlzLl9fcz1jKHt9LHRoaXMuc3RhdGUpLFwiZnVuY3Rpb25cIj09dHlwZW9mIG4mJihuPW4oYyh7fSx1KSx0aGlzLnByb3BzKSksbiYmYyh1LG4pLG51bGwhPW4mJnRoaXMuX192JiYobCYmdGhpcy5fX2gucHVzaChsKSxrKHRoaXMpKX0scC5wcm90b3R5cGUuZm9yY2VVcGRhdGU9ZnVuY3Rpb24obil7dGhpcy5fX3YmJih0aGlzLl9fZT0hMCxuJiZ0aGlzLl9faC5wdXNoKG4pLGsodGhpcykpfSxwLnByb3RvdHlwZS5yZW5kZXI9eSx1PVtdLGk9XCJmdW5jdGlvblwiPT10eXBlb2YgUHJvbWlzZT9Qcm9taXNlLnByb3RvdHlwZS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpOnNldFRpbWVvdXQsYi5fX3I9MCxvPTA7ZXhwb3J0e04gYXMgcmVuZGVyLE8gYXMgaHlkcmF0ZSxhIGFzIGNyZWF0ZUVsZW1lbnQsYSBhcyBoLHkgYXMgRnJhZ21lbnQsaCBhcyBjcmVhdGVSZWYsbCBhcyBpc1ZhbGlkRWxlbWVudCxwIGFzIENvbXBvbmVudCxTIGFzIGNsb25lRWxlbWVudCxxIGFzIGNyZWF0ZUNvbnRleHQsdyBhcyB0b0NoaWxkQXJyYXksbiBhcyBvcHRpb25zfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnR7b3B0aW9ucyBhcyByLEZyYWdtZW50IGFzIF99ZnJvbVwicHJlYWN0XCI7ZXhwb3J0e0ZyYWdtZW50fWZyb21cInByZWFjdFwiO2Z1bmN0aW9uIG8oXyxvLGUsbix0KXt2YXIgZj17fTtmb3IodmFyIGwgaW4gbylcInJlZlwiIT1sJiYoZltsXT1vW2xdKTt2YXIgcyx1LGE9e3R5cGU6Xyxwcm9wczpmLGtleTplLHJlZjpvJiZvLnJlZixfX2s6bnVsbCxfXzpudWxsLF9fYjowLF9fZTpudWxsLF9fZDp2b2lkIDAsX19jOm51bGwsX19oOm51bGwsY29uc3RydWN0b3I6dm9pZCAwLF9fdjorK3IuX192LF9fc291cmNlOm4sX19zZWxmOnR9O2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIF8mJihzPV8uZGVmYXVsdFByb3BzKSlmb3IodSBpbiBzKXZvaWQgMD09PWZbdV0mJihmW3VdPXNbdV0pO3JldHVybiByLnZub2RlJiZyLnZub2RlKGEpLGF9ZXhwb3J0e28gYXMganN4LG8gYXMganN4cyxvIGFzIGpzeERFVn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1qc3hSdW50aW1lLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCBwcmVhY3QsIHsgaCwgcmVuZGVyIH0gZnJvbSAncHJlYWN0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSGVsbG9Xb3JsZFByb3BzIHtcclxuICB1c2VyTmFtZTogc3RyaW5nO1xyXG4gIGxhbmc6IHN0cmluZztcclxufVxyXG5cclxuXHJcbmNvbnN0IEFwcCA9IChwcm9wczogSGVsbG9Xb3JsZFByb3BzKSA9PiAoXHJcbiAgICA8aDE+XHJcbiAgICAgIEhpIHtwcm9wcy51c2VyTmFtZX1zZGYhIFdlbGNvbWUgdG8ge3Byb3BzLmxhbmd9IVxyXG4gICAgICAgIHh4eHhcclxuICAgIDwvaDE+XHJcbik7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXBwOyIsIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyAqL1xyXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXHJcbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXMgKi9cclxuaW1wb3J0IHByZWFjdCwgeyBoLCByZW5kZXIgfSBmcm9tICdwcmVhY3QnO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG5cdGludGVyZmFjZSBXaW5kb3cge1xyXG5cdFx0X19jdHg6IGFueTtcclxuXHR9XHJcblxyXG5cclxufVxyXG4vLyBjb25zdCBkID0gKCkgPT4gKCA8YSBwb3BpIC8+KTtcclxud2luZG93Ll9fY3R4ID0ge307XHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nIC8qJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiRXhwbG9yZXJcIikgPT0gLTEqLykge1xyXG5cdHJlcXVpcmUoXCJwcmVhY3QvZGVidWdcIik7XHJcblx0cmVxdWlyZSgncHJlYWN0LWRldnRvb2xzJyk7ICAvLyBhdXRvLXBhdGNoZXMuXHJcblxyXG5cdHdpbmRvdy5fX2N0eC5pc0RldiA9IHRydWU7XHJcbn1cclxuZWxzZSB7XHJcblx0d2luZG93Ll9fY3R4LmlzRGV2ID0gZmFsc2U7XHJcbn1cclxuXHJcbmxldCByb290O1xyXG5cclxuXHJcbmlmICgobW9kdWxlIGFzIGFueSkuaG90KSB7XHJcblxyXG5cdChtb2R1bGUgYXMgYW55KS5ob3QuYWNjZXB0KFwiLi9hcHBcIiwgKCkgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGluaXQpKTtcclxuXHJcblxyXG59XHJcblxyXG5cclxuY29uc3QgaW5pdCA9ICgpID0+IHtcclxuXHRjb25zdCBBcHAgPSByZXF1aXJlKFwiLi9hcHBcIikuZGVmYXVsdDtcclxuXHRyb290ID0gcmVuZGVyKDxBcHAgdXNlck5hbWU9XCJCZXZlbG9wZXJcIiBsYW5nPVwiVHlwZVNjcmlwdFwiPiA8L0FwcD4sIGRvY3VtZW50LmJvZHksIHJvb3QpO1xyXG5cclxufVxyXG5pbml0KCk7XHJcblxyXG4vKlxyXG5mdW5jdGlvbiBpbml0KCkge1xyXG5cdGFkanVzdEZvbnRTaXplKCk7XHJcblx0ZmV0Y2goXCIvc3RyaW5ncy5qc29uXCIpXHJcblx0XHQudGhlbihyID0+IHIuanNvbigpKVxyXG5cdFx0LnRoZW4odiA9PiB7XHJcblx0XHRcdHdpbmRvdy5fX2N0eC5zdHJpbmdzID0gdlxyXG5cdFx0XHRsZXQgYmFzZVVybCA9IHdpbmRvdy5fX2N0eC5pc0RldiA/IFwiaHR0cDovL2xvY2FsaG9zdDoyOTBcIiA6IFwiaHR0cDovL3Rlc3QuZ28tZXgubmV0XCI7XHJcblx0XHRcdGNvbnN0IHBvcnRmb2xpb1VybCA9IChsb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoXCIjcHJldmlld1wiKSkgPyBiYXNlVXJsICsgXCIvcGhwL3BvcnRmb2xpby5wcmV2Lmpzb24/XCIgKyBEYXRlLm5vdygpIDogXCIvcG9ydGZvbGlvLmpzb25cIjtcclxuXHJcblx0XHRcdC8vIGlmIChsb2NhdGlvbi5oYXNoID09IFwiI3ByZXZpZXdcIikgbG9jYXRpb24uaGFzaCA9IFwiXCI7XHJcblx0XHRcdGZldGNoKHBvcnRmb2xpb1VybClcclxuXHRcdFx0XHQudGhlbihyID0+IHIuanNvbigpKVxyXG5cdFx0XHRcdC50aGVuKHYgPT4ge1xyXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coXCJpbml0dHRcIik7XHJcblx0XHRcdFx0XHR3aW5kb3cuX19jdHgucG9ydGZvbGlvID0gdjtcclxuXHRcdFx0XHRcdGNvbnN0IEFwcCA9IHJlcXVpcmUoXCIuL3BhZ2VzL2dlbmVyaWMvYXBwXCIpLmRlZmF1bHQ7XHJcblx0XHRcdFx0XHRyb290ID0gcmVuZGVyKDxBcHAgbmFtZT1cIlwiPiA8L0FwcD4sIGRvY3VtZW50LmJvZHksIHJvb3QpO1xyXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coXCJoYXNoIFwiLCBsb2NhdGlvbi5oYXNoKTtcclxuXHJcblx0XHRcdFx0XHR3aW5kb3cub25yZXNpemUgPSAoZSA9PiBhZGp1c3RGb250U2l6ZSgpKTtcclxuXHRcdFx0XHRcdHJlYWR5KGFkanVzdEZvbnRTaXplKTtcclxuXHJcblx0XHRcdFx0fSk7XHJcblx0XHR9KTtcclxufVxyXG5mdW5jdGlvbiByZWFkeShmbikge1xyXG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9ICdsb2FkaW5nJykge1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcclxuXHR9XHJcbn1cclxuZnVuY3Rpb24gYWRqdXN0Rm9udFNpemUoKSB7XHJcblx0Y29uc3QgcmF0aW9zID0gW1xyXG5cdFx0MyAvIDQsIDkgLyAxNiwgMTAgLyAxNiwgOSAvIDIxXHJcblx0XTtcclxuXHRjb25zdCByYXRpb05hbWVzID0gW1wiM3k0XCIsIFwiOXkxNlwiLCBcIjEweTE2XCIsIFwiOXkyMVwiXTtcclxuXHJcblx0Y29uc3QgY3VycmVudFJhdGlvID0gd2luZG93LnNjcmVlbi5oZWlnaHQgLyB3aW5kb3cuc2NyZWVuLndpZHRoO1xyXG5cdGxldCBydE5hbWU7XHJcblx0cmF0aW9zLmZvckVhY2goKGVsLCBpeCkgPT4geyBpZiAoY3VycmVudFJhdGlvIDw9IGVsICsgMC4wMSAmJiBjdXJyZW50UmF0aW8gPj0gZWwgLSAwLjAxKSBydE5hbWUgPSByYXRpb05hbWVzW2l4XSB9KTtcclxuXHJcblx0Y29uc3QgYmFzZUZvbnRTaXplID0gMTY7IC8vcHhcclxuXHRsZXQgZm9udFNpemUgPSAxNjtcclxuXHRpZiAod2luZG93LnNjcmVlbi53aWR0aCA+PSAxMDI1KSB7XHJcblx0XHRzd2l0Y2ggKHJ0TmFtZSkge1xyXG5cdFx0XHRjYXNlIFwiM3k0XCI6XHJcblx0XHRcdFx0Zm9udFNpemUgPSB3aW5kb3cuc2NyZWVuLndpZHRoIC8gMTkyMCAqIGJhc2VGb250U2l6ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcIjEweTE2XCI6XHJcblx0XHRcdFx0Zm9udFNpemUgPSB3aW5kb3cuc2NyZWVuLndpZHRoIC8gMTkyMCAqIGJhc2VGb250U2l6ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcIjl5MjFcIjpcclxuXHRcdFx0XHRmb250U2l6ZSA9IHdpbmRvdy5zY3JlZW4uaGVpZ2h0IC8gMTA4MCAqIGJhc2VGb250U2l6ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDogLy85eTE2XHJcblx0XHRcdFx0Zm9udFNpemUgPSB3aW5kb3cuc2NyZWVuLndpZHRoIC8gMTkyMCAqIGJhc2VGb250U2l6ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHQoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJodG1sXCIpIGFzIEhUTUxDb2xsZWN0aW9uT2Y8SFRNTEh0bWxFbGVtZW50PilbMF0uc3R5bGUuZm9udFNpemUgPSBmb250U2l6ZSArIFwicHhcIjtcclxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiQk9EWVwiKVswXS5jbGFzc0xpc3QuYWRkKFwieFwiICsgcnROYW1lKTtcclxuXHRcdC8vIGNvbnN0IHBhcnRpY2xlcyA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRpY2xlc1wiKSBhcyBIVE1MRWxlbWVudCk7XHJcblx0XHR3aW5kb3cuX19jdHguaXNNb2JpbGUgPSBmYWxzZTtcclxuXHRcdHdpbmRvdy5fX2N0eC5pc1RhYmxldCA9IGZhbHNlO1xyXG5cdH1cclxuXHRlbHNlIGlmICh3aW5kb3cuc2NyZWVuLndpZHRoID49IDc2NyAmJiB3aW5kb3cuc2NyZWVuLndpZHRoIDwgMTAyNSkge1xyXG5cdFx0d2luZG93Ll9fY3R4LmlzTW9iaWxlID0gZmFsc2U7XHJcblx0XHR3aW5kb3cuX19jdHguaXNUYWJsZXQgPSB0cnVlO1xyXG5cdH1cclxuXHRlbHNlIHtcclxuXHRcdHdpbmRvdy5fX2N0eC5pc01vYmlsZSA9IHRydWU7XHJcblx0XHR3aW5kb3cuX19jdHguaXNUYWJsZXQgPSBmYWxzZTtcclxuXHJcblx0fVxyXG5cdC8vIGNvbnNvbGUubG9nKHJ0TmFtZSxNYXRoLnJvdW5kKHdpbmRvdy5fX2N0eC5mb250UmF0aW8pKTtcclxuXHR3aW5kb3cuX19jdHguZm9udFJhdGlvID0gZm9udFNpemUgLyBiYXNlRm9udFNpemU7XHJcblxyXG59XHJcbiovIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c3hcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9
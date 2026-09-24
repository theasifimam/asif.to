(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,631171,e=>{"use strict";let t=(0,e.i(475254).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["default",()=>t])},664659,e=>{"use strict";var t=e.i(631171);e.s(["ChevronDown",()=>t.default])},862749,e=>{"use strict";let t=(0,e.i(475254).default)("file-code-corner",[["path",{d:"M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35",key:"1wthlu"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"m5 16-3 3 3 3",key:"331omg"}],["path",{d:"m9 22 3-3-3-3",key:"lsp7cz"}]]);e.s(["FileCode2",()=>t],862749)},878894,e=>{"use strict";let t=(0,e.i(475254).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);e.s(["AlertTriangle",()=>t],878894)},778917,e=>{"use strict";let t=(0,e.i(475254).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);e.s(["ExternalLink",()=>t],778917)},662031,e=>{"use strict";let t=(0,e.i(475254).default)("share-2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);e.s(["Share2",()=>t],662031)},678745,e=>{"use strict";let t=(0,e.i(475254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["default",()=>t])},643531,e=>{"use strict";var t=e.i(678745);e.s(["Check",()=>t.default])},555436,e=>{"use strict";let t=(0,e.i(475254).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",()=>t],555436)},667585,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"BailoutToCSR",{enumerable:!0,get:function(){return o}});let r=e.r(132061);function o({reason:e,children:t}){if("u"<typeof window)throw Object.defineProperty(new r.BailoutToCSRError(e),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return t}},309885,(e,t,n)=>{"use strict";function r(e){return e.split("/").map(e=>encodeURIComponent(e)).join("/")}Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"encodeURIPath",{enumerable:!0,get:function(){return r}})},652157,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"PreloadChunks",{enumerable:!0,get:function(){return l}});let r=e.r(843476),o=e.r(174080),i=e.r(563599),a=e.r(309885),s=e.r(543369);function l({moduleIds:e}){if("u">typeof window)return null;let t=i.workAsyncStorage.getStore();if(void 0===t)return null;let n=[];if(t.reactLoadableManifest&&e){let r=t.reactLoadableManifest;for(let t of e){if(!r[t])continue;let e=r[t].files;n.push(...e)}}if(0===n.length)return null;let l=(0,s.getDeploymentIdQueryOrEmptyString)();return(0,r.jsx)(r.Fragment,{children:n.map(e=>{let n=`${t.assetPrefix}/_next/${(0,a.encodeURIPath)(e)}${l}`;return e.endsWith(".css")?(0,r.jsx)("link",{precedence:"dynamic",href:n,rel:"stylesheet",as:"style",nonce:t.nonce},e):((0,o.preload)(n,{as:"script",fetchPriority:"low",nonce:t.nonce}),null)})})}},869093,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"default",{enumerable:!0,get:function(){return c}});let r=e.r(843476),o=e.r(271645),i=e.r(667585),a=e.r(652157);function s(e){return{default:e&&"default"in e?e.default:e}}let l={loader:()=>Promise.resolve(s(()=>null)),loading:null,ssr:!0},c=function(e){let t={...l,...e},n=(0,o.lazy)(()=>t.loader().then(s)),c=t.loading;function u(e){let s=c?(0,r.jsx)(c,{isLoading:!0,pastDelay:!0,error:null}):null,l=!t.ssr||!!t.loading,u=l?o.Suspense:o.Fragment,d=t.ssr?(0,r.jsxs)(r.Fragment,{children:["u"<typeof window?(0,r.jsx)(a.PreloadChunks,{moduleIds:t.modules}):null,(0,r.jsx)(n,{...e})]}):(0,r.jsx)(i.BailoutToCSR,{reason:"next/dynamic",children:(0,r.jsx)(n,{...e})});return(0,r.jsx)(u,{...l?{fallback:s}:{},children:d})}return u.displayName="LoadableComponent",u}},770703,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"default",{enumerable:!0,get:function(){return o}});let r=e.r(555682)._(e.r(869093));function o(e,t){let n={};"function"==typeof e&&(n.loader=e);let o={...n,...t};return(0,r.default)({...o,modules:o.loadableGenerated?.modules})}("function"==typeof n.default||"object"==typeof n.default&&null!==n.default)&&void 0===n.default.__esModule&&(Object.defineProperty(n.default,"__esModule",{value:!0}),Object.assign(n.default,n),t.exports=n.default)},551348,e=>{"use strict";let t=(0,e.i(475254).default)("linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);e.s(["Linkedin",()=>t],551348)},571930,e=>{"use strict";let t=(0,e.i(475254).default)("bookmark",[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]]);e.s(["Bookmark",()=>t],571930)},132912,e=>{"use strict";var t=e.i(843476),n=e.i(770703),r=e.i(271645);let o=(0,n.default)(()=>e.A(152423),{loadableGenerated:{modules:[936582]},ssr:!1,loading:()=>(0,t.jsx)(i,{label:"Loading secure playground…"})});function i({label:e="Playground ready when you scroll here"}){return(0,t.jsxs)("div",{className:"min-h-72 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",role:"status",children:[(0,t.jsx)("div",{className:"h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"}),(0,t.jsx)("div",{className:"mt-6 h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-950"}),(0,t.jsx)("p",{className:"mt-4 text-xs font-semibold text-zinc-500",children:e})]})}function a(e){let n=(0,r.useRef)(null),[a,s]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{if(!n.current||a)return;if(!("IntersectionObserver"in window)){let e=window.requestAnimationFrame(()=>s(!0));return()=>window.cancelAnimationFrame(e)}let e=new IntersectionObserver(([t])=>{t.isIntersecting&&(s(!0),e.disconnect())},{rootMargin:"300px"});return e.observe(n.current),()=>e.disconnect()},[a]),(0,t.jsx)("div",{ref:n,children:a?(0,t.jsx)(o,{...e}):(0,t.jsx)(i,{})})}e.s(["default",()=>a])},690010,e=>{"use strict";var t=e.i(843476),n=e.i(271645),r=e.i(132912);let o={python:{label:"Python",description:"Run Python in an isolated browser WebAssembly worker, loaded only when needed.",files:{"/main.py":`for row in range(1, 6):
    print("*" * row)`}},c:{label:"C",description:"Compile C to WebAssembly entirely in your browser with lazy-loaded Clang.",files:{"/main.c":`#include <stdio.h>
int main(void) {
  for (int row = 1; row <= 5; row++) {
    for (int col = 0; col < row; col++) printf("*");
    printf("\\n");
  }
  return 0;
}`}},cpp:{label:"C++",description:"Compile C++ to WebAssembly entirely in your browser with lazy-loaded Clang.",files:{"/main.cpp":`#include <iostream>
using namespace std;
int main() {
  for (int row = 1; row <= 5; row++) {
    for (int col = 0; col < row; col++) cout << "*";
    cout << "\\n";
  }
  return 0;
}`}},java:{label:"Java",description:"Compile and run Java in an isolated browser OpenJDK runtime loaded on demand.",files:{"/Main.java":`public class Main {
  public static void main(String[] args) {
    for (int row = 1; row <= 5; row++) {
      for (int col = 0; col < row; col++) System.out.print("*");
      System.out.println();
    }
  }
}`}},javascript:{label:"JavaScript",description:"Practice variables, conditions, loops, functions, arrays, objects, promises, and algorithms.",files:{"/index.js":`const numbers = [1, 2, 3, 4, 5];

for (const number of numbers) {
  if (number % 2 === 0) {
    console.log(number, "is even");
  }
}

function double(value) {
  return value * 2;
}

console.log(numbers.map(double));`}},typescript:{label:"TypeScript",description:"Practice typed functions, arrays, objects, interfaces, unions, and generics.",files:{"/index.ts":`type User = {
  name: string;
  score: number;
};

const users: User[] = [
  { name: "Asha", score: 82 },
  { name: "Ravi", score: 64 },
];

function passed(user: User): boolean {
  return user.score >= 70;
}

console.log(users.filter(passed));`}},html:{label:"HTML + CSS + JavaScript",description:"Build and preview complete browser interfaces with separate HTML, CSS, and JavaScript files.",files:{"/index.html":`<main class="card">
  <h1>Browser Playground</h1>
  <p id="message">Edit any file, then press Run.</p>
  <button id="action">Click me</button>
</main>`,"/style.css":`body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #eff6ff;
}

.card {
  padding: 2rem;
  border-radius: 1.5rem;
  background: white;
  box-shadow: 0 1rem 3rem #2563eb22;
}`,"/index.js":`const button = document.querySelector("#action");
const message = document.querySelector("#message");

button.addEventListener("click", () => {
  message.textContent = "Your JavaScript is working!";
  console.log("Button clicked");
});`}},react:{label:"React.js",description:"Practice components, props, events, forms, state, hooks, context, and list rendering.",files:{"/App.js":`import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>React Playground</h1>
      <button onClick={() => setCount((value) => value + 1)}>
        Count: {count}
      </button>
    </main>
  );
}`}},"react-typescript":{label:"React + TypeScript",description:"Practice typed props, events, state, hooks, and reusable React components.",files:{"/App.tsx":`import { useState } from "react";

type CounterProps = {
  step?: number;
};

function Counter({ step = 1 }: CounterProps) {
  const [count, setCount] = useState<number>(0);
  return (
    <button onClick={() => setCount((value) => value + step)}>
      Count: {count}
    </button>
  );
}

export default function App() {
  return <Counter step={2} />;
}`}},nextjs:{label:"Next.js (Browser)",description:"Practice client-side Next.js pages and routing with browser-style Back, Forward, Refresh, and URL controls.",files:{"/pages/index.js":`import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Home page</h1>
      <p>Use this link, then use Back in the preview toolbar.</p>
      <Link href="/about">Open the About page →</Link>
    </main>
  );
}`,"/pages/about.js":`import Link from "next/link";

export default function About() {
  return (
    <main>
      <h1>About page</h1>
      <p>This is a second client-renderable route.</p>
      <Link href="/">Return home →</Link>
    </main>
  );
}`}}};function i({fillViewport:e=!1}){let[i,a]=(0,n.useState)("javascript"),s=o[i],l=(0,n.useMemo)(()=>Object.entries(o).map(([e,t])=>({value:e,label:t.label,description:t.description})),[]);return(0,t.jsxs)("section",{"aria-labelledby":"playground-workspace",className:"w-full",children:[(0,t.jsx)("h2",{id:"playground-workspace",className:"sr-only",children:"Editable code and output workspace"}),(0,t.jsx)(r.default,{language:i,languageOptions:l,onLanguageChange:a,files:s.files,title:`${s.label} Playground`,fillViewport:e})]})}e.s(["default",()=>i],690010)},322716,e=>{e.v(t=>Promise.all(["static/chunks/e34f5cd4cfd69578.js"].map(t=>e.l(t))).then(()=>t(377023)))},216654,e=>{e.v(t=>Promise.all(["static/chunks/002a086ef08efd5f.js"].map(t=>e.l(t))).then(()=>t(548760)))},152423,e=>{e.v(t=>Promise.all(["static/chunks/60d4f2988edbedbe.js"].map(t=>e.l(t))).then(()=>t(936582)))}]);
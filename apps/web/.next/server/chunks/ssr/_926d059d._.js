module.exports=[132245,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"BailoutToCSR",{enumerable:!0,get:function(){return e}});let d=a.r(441997);function e({reason:a,children:b}){throw Object.defineProperty(new d.BailoutToCSRError(a),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0})}},307773,(a,b,c)=>{"use strict";function d(a){return a.split("/").map(a=>encodeURIComponent(a)).join("/")}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"encodeURIPath",{enumerable:!0,get:function(){return d}})},297458,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"PreloadChunks",{enumerable:!0,get:function(){return i}});let d=a.r(187924),e=a.r(935112),f=a.r(556704),g=a.r(307773),h=a.r(68063);function i({moduleIds:a}){let b=f.workAsyncStorage.getStore();if(void 0===b)return null;let c=[];if(b.reactLoadableManifest&&a){let d=b.reactLoadableManifest;for(let b of a){if(!d[b])continue;let a=d[b].files;c.push(...a)}}if(0===c.length)return null;let i=(0,h.getDeploymentIdQueryOrEmptyString)();return(0,d.jsx)(d.Fragment,{children:c.map(a=>{let c=`${b.assetPrefix}/_next/${(0,g.encodeURIPath)(a)}${i}`;return a.endsWith(".css")?(0,d.jsx)("link",{precedence:"dynamic",href:c,rel:"stylesheet",as:"style",nonce:b.nonce},a):((0,e.preload)(c,{as:"script",fetchPriority:"low",nonce:b.nonce}),null)})})}},969853,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"default",{enumerable:!0,get:function(){return j}});let d=a.r(187924),e=a.r(572131),f=a.r(132245),g=a.r(297458);function h(a){return{default:a&&"default"in a?a.default:a}}let i={loader:()=>Promise.resolve(h(()=>null)),loading:null,ssr:!0},j=function(a){let b={...i,...a},c=(0,e.lazy)(()=>b.loader().then(h)),j=b.loading;function k(a){let h=j?(0,d.jsx)(j,{isLoading:!0,pastDelay:!0,error:null}):null,i=!b.ssr||!!b.loading,k=i?e.Suspense:e.Fragment,l=b.ssr?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(g.PreloadChunks,{moduleIds:b.modules}),(0,d.jsx)(c,{...a})]}):(0,d.jsx)(f.BailoutToCSR,{reason:"next/dynamic",children:(0,d.jsx)(c,{...a})});return(0,d.jsx)(k,{...i?{fallback:h}:{},children:l})}return k.displayName="LoadableComponent",k}},819721,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"default",{enumerable:!0,get:function(){return e}});let d=a.r(833354)._(a.r(969853));function e(a,b){let c={};"function"==typeof a&&(c.loader=a);let e={...c,...b};return(0,d.default)({...e,modules:e.loadableGenerated?.modules})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},73570,a=>{"use strict";let b=(0,a.i(170106).default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);a.s(["AlertTriangle",()=>b],73570)},585911,a=>{"use strict";let b=(0,a.i(170106).default)("linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]]);a.s(["Linkedin",()=>b],585911)},299437,a=>{"use strict";var b=a.i(187924),c=a.i(819721),d=a.i(572131);let e=(0,c.default)(async()=>{},{loadableGenerated:{modules:[936582]},ssr:!1,loading:()=>(0,b.jsx)(f,{label:"Loading secure playground…"})});function f({label:a="Playground ready when you scroll here"}){return(0,b.jsxs)("div",{className:"min-h-72 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",role:"status",children:[(0,b.jsx)("div",{className:"h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"}),(0,b.jsx)("div",{className:"mt-6 h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-950"}),(0,b.jsx)("p",{className:"mt-4 text-xs font-semibold text-zinc-500",children:a})]})}function g(a){let c=(0,d.useRef)(null),[g,h]=(0,d.useState)(!1);return(0,d.useEffect)(()=>{if(!c.current||g)return;if(!("IntersectionObserver"in window)){let a=window.requestAnimationFrame(()=>h(!0));return()=>window.cancelAnimationFrame(a)}let a=new IntersectionObserver(([b])=>{b.isIntersecting&&(h(!0),a.disconnect())},{rootMargin:"300px"});return a.observe(c.current),()=>a.disconnect()},[g]),(0,b.jsx)("div",{ref:c,children:g?(0,b.jsx)(e,{...a}):(0,b.jsx)(f,{})})}a.s(["default",()=>g])},383879,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(299437);let e={python:{label:"Python",description:"Run Python in an isolated browser WebAssembly worker, loaded only when needed.",files:{"/main.py":`for row in range(1, 6):
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
}`}}};function f({fillViewport:a=!1}){let[f,g]=(0,c.useState)("javascript"),h=e[f],i=(0,c.useMemo)(()=>Object.entries(e).map(([a,b])=>({value:a,label:b.label,description:b.description})),[]);return(0,b.jsxs)("section",{"aria-labelledby":"playground-workspace",className:"w-full",children:[(0,b.jsx)("h2",{id:"playground-workspace",className:"sr-only",children:"Editable code and output workspace"}),(0,b.jsx)(d.default,{language:f,languageOptions:i,onLanguageChange:g,files:h.files,title:`${h.label} Playground`,fillViewport:a})]})}a.s(["default",()=>f],383879)}];

//# sourceMappingURL=_926d059d._.js.map
export const FREE_PLAYGROUND_MODES = {
  python: {
    label: "Python",
    description: "Run Python in an isolated browser WebAssembly worker, loaded only when needed.",
    files: { "/main.py": `for row in range(1, 6):
    print("*" * row)` },
  },
  c: {
    label: "C",
    description: "Compile C to WebAssembly entirely in your browser with lazy-loaded Clang.",
    files: { "/main.c": `#include <stdio.h>
int main(void) {
  for (int row = 1; row <= 5; row++) {
    for (int col = 0; col < row; col++) printf("*");
    printf("\\n");
  }
  return 0;
}` },
  },
  cpp: {
    label: "C++",
    description: "Compile C++ to WebAssembly entirely in your browser with lazy-loaded Clang.",
    files: { "/main.cpp": `#include <iostream>
using namespace std;
int main() {
  for (int row = 1; row <= 5; row++) {
    for (int col = 0; col < row; col++) cout << "*";
    cout << "\\n";
  }
  return 0;
}` },
  },
  java: {
    label: "Java",
    description: "Compile and run Java in an isolated browser OpenJDK runtime loaded on demand.",
    files: { "/Main.java": `public class Main {
  public static void main(String[] args) {
    for (int row = 1; row <= 5; row++) {
      for (int col = 0; col < row; col++) System.out.print("*");
      System.out.println();
    }
  }
}` },
  },
  javascript: {
    label: "JavaScript",
    description: "Practice variables, conditions, loops, functions, arrays, objects, promises, and algorithms.",
    files: {
      "/index.js": `const numbers = [1, 2, 3, 4, 5];

for (const number of numbers) {
  if (number % 2 === 0) {
    console.log(number, "is even");
  }
}

function double(value) {
  return value * 2;
}

console.log(numbers.map(double));`,
    },
  },
  typescript: {
    label: "TypeScript",
    description: "Practice typed functions, arrays, objects, interfaces, unions, and generics.",
    files: {
      "/index.ts": `type User = {
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

console.log(users.filter(passed));`,
    },
  },
  html: {
    label: "HTML + CSS + JavaScript",
    description: "Build and preview complete browser interfaces with separate HTML, CSS, and JavaScript files.",
    files: {
      "/index.html": `<main class="card">
  <h1>Browser Playground</h1>
  <p id="message">Edit any file, then press Run.</p>
  <button id="action">Click me</button>
</main>`,
      "/style.css": `body {
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
}`,
      "/index.js": `const button = document.querySelector("#action");
const message = document.querySelector("#message");

button.addEventListener("click", () => {
  message.textContent = "Your JavaScript is working!";
  console.log("Button clicked");
});`,
    },
  },
  react: {
    label: "React.js",
    description: "Practice components, props, events, forms, state, hooks, context, and list rendering.",
    files: {
      "/App.js": `import { useState } from "react";

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
}`,
    },
  },
  "react-typescript": {
    label: "React + TypeScript",
    description: "Practice typed props, events, state, hooks, and reusable React components.",
    files: {
      "/App.tsx": `import { useState } from "react";

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
}`,
    },
  },
  nextjs: {
    label: "Next.js (Browser)",
    description: "Practice client-side Next.js pages and routing with browser-style Back, Forward, Refresh, and URL controls.",
    files: {
      "/pages/index.js": `import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Home page</h1>
      <p>Use this link, then use Back in the preview toolbar.</p>
      <Link href="/about">Open the About page →</Link>
    </main>
  );
}`,
      "/pages/about.js": `import Link from "next/link";

export default function About() {
  return (
    <main>
      <h1>About page</h1>
      <p>This is a second client-renderable route.</p>
      <Link href="/">Return home →</Link>
    </main>
  );
}`,
    },
  },
};

/**
 * Seeder script — seeds static tutorial content into MongoDB
 * Run: node src/scripts/seed-courses.js
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Cheatsheet from "../models/Cheatsheet.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const COURSES_SEED = [
  {
    slug: "typescript",
    title: "TypeScript Complete Course: Zero to Mastery",
    techId: "typescript",
    subtitle:
      "Master static typing in JavaScript. Learn types, interfaces, generics, and advanced compiler configurations to build bulletproof applications.",
    level: "Beginner - Advanced",
    duration: "4.5 Hours",
    order: 2,
    learningOutcomes: [
      "Understand the core differences between JavaScript and TypeScript architecture",
      "Master primitive types, unions, intersections, and type narrowing",
      "Design robust data contracts using Interfaces and Type Aliases",
      "Write highly reusable and scalable code using Generics",
      "Configure the TypeScript compiler (tsconfig.json) for optimal project strictness",
    ],
    chapters: [
      {
        slug: "ch-1-intro-basic-types",
        title: "1. Introduction to TypeScript & Basic Types",
        summary:
          "Understand why TypeScript exists, how the compiler works, and start using primitive types.",
        content: [
          "# What is TypeScript?\n\nTypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. While JavaScript is a dynamically typed language (types are checked at runtime), TypeScript introduces a ==static type system==, meaning errors are caught during development before your code ever runs in the browser.",
          "## The TypeScript Compiler (tsc)\n\nBrowsers and Node.js (traditionally) cannot execute TypeScript directly. Your `.ts` files must be compiled (or transpiled) down to regular JavaScript. This compilation step is where TypeScript performs its type-checking magic.",
          "### Basic Primitives & Type Inference\n\nTypeScript supports all JavaScript primitives: `string`, `number`, `boolean`. Furthermore, TS has a powerful feature called **Type Inference**. You don't always have to explicitly write the type; TypeScript can guess it based on the assigned value.",
          '```ts\n// Basic Types and Inference\nlet username: string = "Alex"; // Explicit typing\nlet age = 28; // Implicitly typed as \'number\' via inference\nlet isDeveloper: boolean = true;\n\n// Any and Unknown (Avoid \'any\' when possible!)\nlet mysteryValue: any = "Could be anything";\nmysteryValue = 42; // TS compiler allows this\n\nlet saferMystery: unknown = "I require type-checking first";\nif (typeof saferMystery === "string") {\n  console.log(saferMystery.toUpperCase()); // Safe!\n}\n```',
        ],
        codeSnippet: `let isActive: boolean = false;
let score: number = 95;
let firstName: string = "Jane";

// Inference in action
let lastName = "Doe"; // TS knows this is a string`,
        language: "ts",
        tryItChallenge:
          "Declare a variable explicitly as a `number`, assign it a string value, and observe the compiler error.",
        order: 0,
      },
      {
        slug: "ch-2-interfaces-type-aliases",
        title: "2. Object Shapes: Interfaces & Type Aliases",
        summary:
          "Define strict object shapes, extend interfaces, and understand the difference between types and interfaces.",
        content: [
          "# Defining Data Contracts\n\nIn JavaScript, objects are incredibly flexible, which can lead to bugs when properties are misspelled or missing. TypeScript solves this using `type` aliases and `interface` declarations to enforce a strict ==data contract==.",
          "## Interfaces vs Types\n\nAn `interface` is specifically used to describe the shape of an object. A `type` alias can describe an object, but it can also describe primitives, unions, and tuples. For objects, ==interfaces are generally preferred== because they can be easily extended and merged.",
          "### Optional and Readonly Modifiers\n\nYou can use `?` to mark a property as optional, meaning the object is still valid if that property is omitted. You can use the `readonly` modifier to prevent a property from being reassigned after creation.",
          '```ts\n// Defining and Extending Interfaces\ninterface User {\n  readonly id: string;\n  name: string;\n  email: string;\n  avatarUrl?: string; // Optional property\n}\n\n// Extending an interface\ninterface Admin extends User {\n  permissions: string[];\n  role: "superadmin" | "moderator";\n}\n\nconst createAdmin = (adminData: Admin) => {\n  console.log(`Created admin: <mark>${adminData.name}</mark>`);\n  // adminData.id = "123"; // ERROR: Cannot assign to \'id\' because it is a read-only property.\n};\n```',
        ],
        codeSnippet: `interface Product {
  name: string;
  price: number;
  inStock?: boolean;
}

const laptop: Product = { name: "MacBook", price: 1299 };`,
        language: "ts",
        tryItChallenge:
          "Create a `Vehicle` interface, then create a `Car` interface that extends it with a `numberOfDoors` property.",
        order: 1,
      },
      {
        slug: "ch-3-unions-intersections-narrowing",
        title: "3. Unions, Intersections, and Type Narrowing",
        summary:
          "Handle flexible data structures and narrow types safely using type guards and control flow analysis.",
        content: [
          "# Union and Intersection Types\n\nSometimes a variable can validly be more than one type. ==Union types== (using the `|` symbol) let you declare that a value can be 'this OR that'. Conversely, ==Intersection types== (using the `&` symbol) combine multiple types into one, meaning the value must have the properties of 'this AND that'.",
          "## Type Narrowing & Guards\n\nWhen dealing with Union types, TypeScript will only allow you to access properties or methods that are shared by *all* types in the union. To access specific properties, you must ==narrow== the type using conditional checks known as Type Guards (e.g., `typeof`, `instanceof`, or `in`).",
          "### Literal Types\n\nYou can also narrow types down to exact values, known as string or number literals. This is incredibly useful for creating strict state definitions.",
          '```ts\n// Union Types & Narrowing\ntype ID = string | number;\n\nfunction printId(id: ID) {\n  // We must narrow the type before we can use specific methods\n  if (typeof id === "string") {\n    console.log(id.toUpperCase());\n  } else {\n    console.log(id.toFixed(2));\n  }\n}\n\n// Literal Types & Intersections\ntype Status = "pending" | "success" | "error";\n\ninterface ErrorResponse {\n  status: "error";\n  errorMessage: string;\n}\n\ninterface SuccessResponse {\n  status: "success";\n  data: object;\n}\n\ntype ApiResponse = ErrorResponse | SuccessResponse;\n```',
        ],
        codeSnippet: `function getLength(val: string | string[]) {
  // TS knows 'length' exists on BOTH strings and arrays
  return val.length; 
}`,
        language: "ts",
        tryItChallenge:
          "Write a function that accepts a `string | number`, uses `typeof` to narrow the type, and returns the string length or the number squared.",
        order: 2,
      },
      {
        slug: "ch-4-functions-enums-tuples",
        title: "4. Advanced Functions, Enums, and Tuples",
        summary:
          "Type function signatures precisely, use Enums for discrete constants, and Tuples for fixed-length arrays.",
        content: [
          "# Typing Functions Strictly\n\nFunctions are the backbone of JavaScript. In TypeScript, you must define the types for parameters and, ideally, the return type. If a function returns nothing, its return type is `void`.",
          "## Tuples\n\nA ==Tuple== is an array where the exact length and the type of each element at specific indices are known. They are highly useful for returning multiple values from a function (like React's `useState`).",
          "## Enums\n\n`enum` is a feature specific to TypeScript that allows developers to define a set of named constants. Using enums can make it easier to document intent, or create a set of distinct cases.",
          '```ts\n// Typing Functions & Tuples\ntype Coordinate = [number, number, string]; // Tuple\n\nfunction getLocation(city: string): Coordinate {\n  if (city === "NYC") return [40.7128, -74.0060, "New York"];\n  return [0, 0, "Unknown"];\n}\n\n// Enums\nenum UserRole {\n  ADMIN = "ADMIN",\n  EDITOR = "EDITOR",\n  VIEWER = "VIEWER",\n}\n\nfunction checkAccess(role: UserRole): boolean {\n  // Enums prevent accidental typos in string comparisons\n  return role === UserRole.ADMIN || role === UserRole.EDITOR;\n}\n\nconsole.log(checkAccess(UserRole.VIEWER)); // false\n```',
        ],
        codeSnippet: `const point: [number, number] = [10, 20];

enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}`,
        language: "ts",
        tryItChallenge:
          "Create an Enum for HTTP methods (GET, POST, PUT, DELETE) and a function that accepts that Enum to log a message.",
        order: 3,
      },
      {
        slug: "ch-5-generics",
        title: "5. Reusable Logic with Generics",
        summary:
          "Create highly reusable, type-safe components and functions using Generics (Type Variables).",
        content: [
          "# What are Generics?\n\nGenerics are like ==variables for types==. They allow you to write functions, classes, and interfaces that work over a variety of types rather than a single fixed one, without losing strict type safety. If you've ever seen `<T>`, you've seen a Generic.",
          "## The Identity Problem\n\nImagine a function that returns whatever is passed to it. If you type the parameter as `any`, you lose all type information about the return value. If you type it as `string`, it only works for strings. Generics capture the type provided by the user and pass it through.",
          "### Generic Constraints\n\nSometimes you want a generic, but you want to guarantee it has certain properties. You can constrain a generic using the `extends` keyword.",
          '```ts\n// Generic Function capturing the type <T>\nfunction getFirstElement<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n\nconst numbers = [1, 2, 3];\n// TS infers <number> automatically\nconst firstNumber = getFirstElement(numbers); \n\nconst strings = ["apple", "banana"];\nconst firstString = getFirstElement(strings);\n\n// Generic Constraint\ninterface HasLength {\n  length: number;\n}\n\n// T must be an object/string/array that has a \'length\' property\nfunction logLength<T HasLength extends>(item: T): void {\n  console.log(`Length is: <mark>${item.length}</mark>`);\n}\n\nlogLength("Hello"); // Valid\nlogLength([1, 2, 3]); // Valid\n// logLength(50); // ERROR: number doesn\'t have a \'length\' property\n```',
        ],
        codeSnippet: `function wrapInArray<T>(value: T): T[] {
  return [value];
}

const stringArray = wrapInArray("Hello"); // Type is string[]`,
        language: "ts",
        tryItChallenge:
          "Write a generic `Box` interface that takes a type parameter `<T>` and has a `content` property of type `T`.",
        order: 4,
      },

      {
        slug: "ch-6-utility-types",
        title: "6. Supercharging Development with Utility Types",
        summary:
          "Transform existing types quickly using TypeScript's built-in global utility types like Partial, Omit, Pick, and Record.",
        content: [
          "# Built-in Utility Types\n\nTypeScript provides several global utility types that facilitate common type transformations. Instead of rewriting interfaces for every scenario (like a database update where fields are optional vs. creation where fields are required), you can compute them dynamically.",
          "## Partial & Required\n\n`Partial<T>` takes a type and makes all of its properties optional. This is perfect for update objects. Conversely, `Required<T>` does the opposite, stripping away the `?` modifiers.",
          "## Pick & Omit\n\n`Pick<T, Keys>` constructs a type by picking the set of properties `Keys` from `T`. `Omit<T, Keys>` creates a type by excluding the specified `Keys`. These are invaluable when deriving frontend UI shapes from massive database models.",
          '```ts\n// Utilizing Global Utility Types\ninterface UserProfile {\n  id: string;\n  username: string;\n  email: string;\n  avatarUrl?: string;\n}\n\n// 1. Partial: Great for update payloads\ntype UpdateUserPayload = Partial<UserProfile>;\n/* \nResult:\n{ id?: string; username?: string; email?: string; avatarUrl?: string; }\n*/\n\n// 2. Omit: Great for creation payloads (DB generates ID)\ntype CreateUserPayload = Omit<UserProfile, "id">;\n\n// 3. Record: Mapping keys to values\ntype UserRoles = "admin" | "editor" | "viewer";\nconst roleDescriptions: Record<UserRoles, string> = {\n  admin: "Full access",\n  editor: "Can edit content",\n  viewer: "Read-only access",\n};\n```',
        ],
        codeSnippet: `interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// Only keep 'title' and 'completed'
type TodoPreview = Pick<Todo, "title" | "completed">;`,
        language: "ts",
        tryItChallenge:
          "Create a `Product` interface, then use `Omit` to create a `NewProduct` type that removes the `id` and `createdAt` properties.",
        order: 5,
      },
      {
        slug: "ch-7-mapped-conditional-types",
        title: "7. Mapped and Conditional Types",
        summary:
          "Create powerful dynamic types by iterating over keys with Mapped Types and evaluating logic with Conditional Types.",
        content: [
          "# Dynamic Type Generation\n\nWhen your data structures become highly dynamic, hardcoded interfaces fall short. TypeScript offers a metaprogramming layer allowing you to generate types algorithmically.",
          "## Mapped Types\n\nMapped types allow you to create new types by iterating over the keys of an existing type. You use the `in` keyword (similar to a `for...in` loop in JavaScript) to iterate over a union of keys.",
          "## Conditional Types\n\nConditional types look like ternary expressions: `T extends U ? X : Y`. They determine types based on conditions evaluated by the compiler.",
          "```ts\n// Mapped Type: Making everything readonly\ninterface AppConfig {\n  theme: string;\n  apiEndpoint: string;\n  retries: number;\n}\n\n// Iterates over all keys of T and adds the 'readonly' modifier\ntype LockedConfig<T> = {\n  readonly [K in keyof T]: T[K];\n};\n\nconst config: LockedConfig<AppConfig> = {\n  theme: \"dark\",\n  apiEndpoint: \"[https://api.example.com](https://api.example.com)\",\n  retries: 3\n};\n// config.theme = \"light\"; // ERROR: Cannot assign to 'theme'\n\n// Conditional Type with 'infer'\ntype UnpackArray<T> = T extends Array<infer U> ? U : T;\n\ntype StringType = UnpackArray<string[]>; // Evaluates to 'string'\ntype NumberType = UnpackArray<number>;   // Evaluates to 'number' (not an array)\n```",
        ],
        codeSnippet: `// A mapped type that makes all properties optional\ntype MyPartial<T> = {
  [K in keyof T]?: T[K];
};`,
        language: "ts",
        tryItChallenge:
          "Write a Mapped Type called `Nullable<T>` that takes a type `T` and makes every property accept its original type OR `null`.",
        order: 6,
      },
      {
        slug: "ch-8-classes-oop",
        title: "8. Object-Oriented Programming with Classes",
        summary:
          "Implement robust OOP patterns using access modifiers (public/private/protected), getters, and abstract classes.",
        content: [
          "# Classes in TypeScript\n\nWhile JavaScript introduced the `class` keyword in ES6, TypeScript supercharges it with classic Object-Oriented features like ==access modifiers== and strict property initialization checks.",
          "## Access Modifiers\n\n1. **`public`** (default): Accessible anywhere.\n2. **`private`**: Only accessible within the class itself.\n3. **`protected`**: Accessible within the class and its subclasses.\n\n## Abstract Classes\n\nAn `abstract` class cannot be instantiated directly. It serves as a blueprint for other classes, allowing you to define default behavior while forcing child classes to implement specific methods.",
          '```ts\n// Class with modifiers, constructor shorthand, and implements\ninterface Logger {\n  log(message: string): void;\n}\n\nclass PaymentProcessor implements Logger {\n  // Parameter properties shorthand (automatically assigns to \'this\')\n  constructor(\n    private readonly apiKey: string,\n    public gatewayName: string\n  ) {}\n\n  public processPayment(amount: number) {\n    if (amount <= 0) throw new Error("Invalid amount");\n    this.log(`Processing $<mark>{amount}</mark> via ${this.gatewayName}`);\n    // Actual API call would use this.apiKey securely here\n  }\n\n  public log(message: string): void {\n    console.log(`[${new Date().toISOString()}] ${message}`);\n  }\n}\n\nconst stripe = new PaymentProcessor("sk_live_123", "Stripe");\nstripe.processPayment(150);\n// stripe.apiKey; // ERROR: Property \'apiKey\' is private\n```',
        ],
        codeSnippet: `abstract class Animal {
  abstract makeSound(): void; // Must be implemented by child
  
  move(): void {
    console.log("Roaming the earth...");
  }
}`,
        language: "ts",
        tryItChallenge:
          "Create a `BankAccount` class with a `private` balance property. Add a `public` method `deposit(amount: number)` that updates the balance.",
        order: 7,
      },
      {
        slug: "ch-9-type-declarations",
        title: "9. Declaration Files and Third-Party Libraries",
        summary:
          "Integrate TypeScript with untyped JS libraries using .d.ts files, ambient declarations, and DefinitelyTyped.",
        content: [
          "# Bridging JS and TS with Declarations\n\nWhen importing third-party libraries written in plain JavaScript, TypeScript often throws errors because it doesn't know the library's shapes or methods. This is solved by ==Declaration Files== (`.d.ts`).",
          "## DefinitelyTyped (@types)\n\nThe community maintains a massive repository of declaration files for popular JS libraries called DefinitelyTyped. You can install them as dev dependencies (e.g., `npm i -D @types/lodash`).",
          '## Ambient Declarations\n\nIf a library lacks official types or community types, you can write your own *ambient declarations* using the `declare` keyword. This tells the compiler, "Trust me, this variable or module exists in the runtime environment."',
          '```ts\n// global.d.ts - Extending the global Window object\nexport {}; // Ensure this is treated as a module\n\ndeclare global {\n  interface Window {\n    // Adding a custom property to the browser\'s window object\n    analyticsTracker: {\n      trackEvent: (eventName: string, data?: any) => void;\n    };\n  }\n}\n\n// app.ts - Usage\nif (typeof window !== "undefined") {\n  // TypeScript now knows analyticsTracker exists and is fully typed!\n  window.analyticsTracker.trackEvent("USER_SIGNUP", { method: "OAuth" });\n}\n\n// Declaring an untyped module\ndeclare module "untyped-legacy-library" {\n  export function legacyDoMath(a: number, b: number): number;\n}\n```',
        ],
        codeSnippet: `// If you import an image in Webpack/Vite, TS will complain.
// Fix it with a declaration file (images.d.ts):

declare module "*.png" {
  const value: string;
  export default value;
}`,
        language: "ts",
        tryItChallenge:
          'Create a `declare module "my-math-lib"` block that exports a single function `add(x: number, y: number): number`.',
        order: 8,
      },
      {
        slug: "ch-10-compiler-options",
        title: "10. Mastering the TypeScript Compiler (tsconfig.json)",
        summary:
          "Configure your project's tsconfig.json to enforce strict type checking, manage build output, and handle environments.",
        content: [
          "# Configuring TypeScript\n\nThe `tsconfig.json` file is the heart of any TypeScript project. It specifies the root files and the compiler options required to compile the project.",
          '## The Power of Strict Mode\n\nAlways aim to set `"strict": true`. This single flag turns on a suite of safety features, including:\n- `noImplicitAny`: Throws errors if TS cannot infer a type and defaults to `any`.\n- `strictNullChecks`: Prevents assigning `null` or `undefined` to variables unless explicitly allowed in the union.\n- `strictBindCallApply`: Ensures strictly typed arguments for `bind`, `call`, and `apply`.',
          "## Targets and Modules\n\nThe `target` determines which ECMAScript version your code compiles down to (e.g., `ES2015` or `ESNext`). The `module` setting determines how file imports/exports are structured in the compiled JS (e.g., `CommonJS` for older Node, `ESNext` for modern bundlers).",
          '```json\n// A robust base tsconfig.json for modern frontend projects\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "useDefineForClassFields": true,\n    "module": "ESNext",\n    "lib": ["ES2022", "DOM", "DOM.Iterable"],\n    \n    /* Strict Type-Checking Options */\n    "strict": true,\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "noImplicitReturns": true,\n    \n    /* Module Resolution Options */\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "react-jsx",\n    \n    /* Output */\n    "noEmit": true // Often used when Vite/Webpack handles actual compilation\n  },\n  "include": ["src/**/*.ts", "src/**/*.tsx"]\n}\n```',
        ],
        codeSnippet: `{
  "compilerOptions": {
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}`,
        language: "json",
        tryItChallenge:
          "Run `npx tsc --init` in a new folder, open the `tsconfig.json`, and find the `strictNullChecks` flag. Read its description in the generated comments.",
        order: 9,
      },
      {
        slug: "ch-11-decorators",
        title: "11. Meta-programming with Decorators",
        summary:
          "Learn how to use Decorators to modify classes, methods, and properties at design time, heavily used in frameworks like NestJS and Angular.",
        content: [
          "# What are Decorators?\n\nDecorators provide a way to add both annotations and a meta-programming syntax for class declarations and members. They are functions that are prefixed with an `@` symbol and are called at runtime with details about the decorated declaration.",
          "## Enabling Decorators\n\nTo use decorators, you must enable the `experimentalDecorators` compiler option in your `tsconfig.json`. While they started as an experimental feature, they are a cornerstone of many modern enterprise TypeScript frameworks.",
          "## Types of Decorators\n\nTypeScript supports decorators on ==Classes, Methods, Accessors, Properties, and Parameters==. A Class Decorator receives the constructor function, while a Method Decorator receives the target, property key, and property descriptor.",
          "```ts\n// A simple Class Decorator that adds a timestamp\nfunction WithTimestamp<T (...args: any[]): extends new { {} }>(constructor: T) {\n  return class extends constructor {\n    createdAt = new Date();\n  };\n}\n\n@WithTimestamp\nclass Document {\n  constructor(public title: string) {}\n}\n\nconst doc = new Document(\"Project Proposal\");\nconsole.log(doc.title);\n// TypeScript compiler doesn't know about 'createdAt' on 'Document' directly \n// without advanced typing, but it exists at runtime!\nconsole.log((doc as any).createdAt);\n\n// Method Decorator for logging\nfunction LogExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {\n  const originalMethod = descriptor.value;\n  descriptor.value = function (...args: any[]) {\n    console.log(`Executing <mark>${propertyKey}</mark> with arguments:`, args);\n    return originalMethod.apply(this, args);\n  };\n}\n```",
        ],
        codeSnippet: `function Sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@Sealed
class Greeter {
  greeting: string;
  constructor(message: string) { this.greeting = message; }
}`,
        language: "ts",
        tryItChallenge:
          "Create a `@Readonly` method decorator that sets `descriptor.writable = false` to prevent a method from being overridden.",
        order: 10,
      },
      {
        slug: "ch-12-advanced-inference-infer",
        title: "12. Advanced Type Inference & The 'infer' Keyword",
        summary:
          "Unlock the full power of conditional types by extracting inner types using the infer keyword.",
        content: [
          "# Extracting Types with 'infer'\n\nWe learned about conditional types earlier (`T extends U ? X : Y`). The `infer` keyword takes conditional types to the next level by allowing you to ==declare a type variable within a conditional type== and use it in the true branch.",
          "## Unwrapping Promises\n\nA common use case is extracting the resolved type of a `Promise`. If you have a function returning `Promise<User>`, how do you extract just the `User` type? You use `infer`.",
          "## ReturnType and Parameters\n\nTypeScript uses `infer` under the hood for built-in utility types like `ReturnType<T>` and `Parameters<T>` to extract what a function returns and what it accepts.",
          "```ts\n// Creating a custom Promise unwrapper using 'infer'\ntype UnpackPromise<T> = T extends Promise<infer U> ? U : T;\n\ntype UserData = { id: string; name: string };\ntype FetchUserResponse = Promise<UserData>;\n\n// Extracts the inner type from the Promise\ntype ResolvedUser = UnpackPromise<FetchUserResponse>; // Evaluates to UserData\n\n// Extracting function return types (How ReturnType works)\ntype MyReturnType<T> = T extends (...args: any[]) => infer R ? R : any;\n\nfunction createGreeting(name: string) {\n  return `Hello, <mark>${name}</mark>!`;\n}\n\ntype GreetingResult = MyReturnType<typeof createGreeting>; // Evaluates to 'string'\n```",
        ],
        codeSnippet: `// Extracting the first argument of a function
type FirstArg<T> = T extends (arg1: infer A, ...args: any[]) => any ? A : never;

function print(msg: string, count: number) {}
type MsgType = FirstArg<typeof print>; // string`,
        language: "ts",
        tryItChallenge:
          "Write a type `ExtractArrayType<T>` that uses `infer` to get the element type of an array, and returns `never` if it's not an array.",
        order: 11,
      },
      {
        slug: "ch-13-typescript-react",
        title: "13. Typing React: Hooks, Events, and Refs",
        summary:
          "Apply TypeScript to React applications by accurately typing functional components, events, refs, and custom hooks.",
        content: [
          "# Integrating TypeScript with React\n\nReact and TypeScript are a powerful combination. TypeScript prevents runtime errors like undefined props or incorrectly shaped state, making complex UIs much easier to maintain.",
          "## Typing Component Props\n\nInstead of `React.FC`, the modern standard is to type the parameters directly. Use interfaces to define the exact shape of your props, making them required or optional.",
          "## Typing Events and Hooks\n\nReact provides built-in types for events (like `React.ChangeEvent` or `React.MouseEvent`). For hooks like `useState` and `useRef`, you can pass a generic to explicitly define their type when inference isn't enough.",
          '```tsx\n// Typing a modern React Component, State, and Events\nimport { useState, useRef } from \'react\';\n\ninterface SearchFormProps {\n  onSearch: (query: string) => void;\n  placeholder?: string;\n}\n\nexport function SearchForm({ onSearch, placeholder = "Search..." }: SearchFormProps) {\n  // Explicitly typing state\n  const [query, setQuery] = useState<string>("");\n  // Typing a DOM ref to an HTMLInputElement\n  const inputRef = useRef<HTMLInputElement>(null);\n\n  // Typing the DOM event\n  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {\n    e.preventDefault();\n    onSearch(query);\n    // inputRef.current is strictly typed!\n    inputRef.current?.blur();\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input\n        ref={inputRef}\n        type="text"\n        value={query}\n        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}\n        placeholder={placeholder}\n      />\n      <button type="submit">Go</button>\n    </form>\n  );\n}\n```',
        ],
        codeSnippet: `import { useState } from 'react';

// Explicit union type for state
const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");`,
        language: "tsx",
        tryItChallenge:
          "Write a React component that accepts an `items` prop (array of strings) and maps over them. Type the props using an interface.",
        order: 12,
      },
      {
        slug: "ch-14-branded-types",
        title: "14. Domain-Driven Design with Branded Types",
        summary:
          "Overcome TypeScript's structural typing limitations by creating unique 'Nominal' or 'Branded' types for robust domains.",
        content: [
          "# Structural vs Nominal Typing\n\nTypeScript uses ==Structural Typing== (duck typing). If two objects have the same shape, they are considered the same type. While flexible, this causes issues in Domain-Driven Design. A `UserId` is structurally just a `string`, but passing an `EmailId` (also a string) into a `fetchUser(UserId)` function is a logical bug that TS won't catch.",
          '## Faking Nominal Types (Branding)\n\nWe can trick TypeScript into treating primitives uniquely by attaching a "brand" or "tag" using an Intersection type. The brand is purely for the compiler; it doesn\'t exist at runtime.',
          '```ts\n// Creating Branded Types\ntype UserId = string & { readonly __brand: "UserId" };\ntype OrderId = string & { readonly __brand: "OrderId" };\n\n// Helper functions to safely cast our primitives to branded types\nfunction createUserId(id: string): UserId {\n  return id as UserId;\n}\n\nfunction createOrderId(id: string): OrderId {\n  return id as OrderId;\n}\n\nfunction fetchUserOrders(userId: UserId) {\n  console.log(`Fetching orders for user: <mark>${userId}</mark>`);\n}\n\nconst myUserId = createUserId("user_99");\nconst myOrderId = createOrderId("order_42");\n\nfetchUserOrders(myUserId); // Valid\n// fetchUserOrders(myOrderId); // ERROR: Argument of type \'OrderId\' is not assignable to type \'UserId\'\n// fetchUserOrders("user_99"); // ERROR: Plain string is not assignable to \'UserId\'\n```',
        ],
        codeSnippet: `type USD = number & { readonly currency: unique symbol };
type EUR = number & { readonly currency: unique symbol };

const pay = (amount: USD) => console.log(amount);`,
        language: "ts",
        tryItChallenge:
          "Create Branded Types for `Celsius` and `Fahrenheit` (both numbers). Write a function `boilWater(temp: Celsius)` that rejects Fahrenheit.",
        order: 13,
      },
      {
        slug: "ch-15-type-guards-asserts",
        title: "15. Custom Type Guards and Assertion Functions",
        summary:
          "Build robust runtime validation pipelines using custom Type Predicates and the 'asserts' keyword.",
        content: [
          "# Advanced Runtime Validation\n\nTypeScript types are erased at compile time. To ensure that unknown data (like API responses) matches your types at runtime, you must write logic that validates the data and simultaneously narrows the TypeScript type.",
          "## Custom Type Guards (The 'is' keyword)\n\nA Type Guard is a function whose return type is a ==Type Predicate==: `parameterName is Type`. If the function returns `true`, TypeScript will narrow the variable to that specific type in the calling scope.",
          "## Assertion Functions (The 'asserts' keyword)\n\nSometimes you want a function to throw an error if validation fails. The `asserts` keyword tells the compiler: \"If this function finishes executing without throwing an error, you can safely assume the variable is this specific type.\"",
          '```ts\ninterface Admin {\n  role: "admin";\n  privileges: string[];\n}\n\n// 1. Custom Type Guard (returns boolean)\nfunction isAdmin(user: any): user is Admin {\n  return user && user.role === "admin" && Array.isArray(user.privileges);\n}\n\n// 2. Assertion Function (throws error or narrows type)\nfunction assertIsString(val: any): asserts val is string {\n  if (typeof val !== "string") {\n    throw new Error("Value is not a string!");\n  }\n}\n\nfunction processUnknownData(data: any, usernameData: any) {\n  // Using the type guard\n  if (isAdmin(data)) {\n    // TS knows \'data\' is Admin here\n    console.log(data.privileges.join(", "));\n  }\n\n  // Using the assertion\n  assertIsString(usernameData);\n  // TS knows \'usernameData\' is a string from this line forward\n  console.log(usernameData.toUpperCase());\n}\n```',
        ],
        codeSnippet: `function isStringArray(val: any[]): val is string[] {
  return val.every(item => typeof item === "string");
}`,
        language: "ts",
        tryItChallenge:
          "Write a type guard function `isNumber(val: any): val is number` that checks if a value is of type 'number' and not NaN.",
        order: 14,
      },
      {
        slug: "ch-16-template-literal-types",
        title: "16. Template Literal Types",
        summary:
          "Manipulate strings at the type level using template literals to create dynamic, highly restricted string unions.",
        content: [
          "# Template Literal Types\n\nTypeScript 4.1 introduced Template Literal Types, allowing you to build new string types by concatenating existing string literal types using the exact same syntax as JavaScript template strings.",
          "## Union Permutations\n\nWhen you use union types inside a template literal type, TypeScript automatically generates all possible ==permutations== (combinations) of those unions. This is incredibly powerful for typing things like CSS utility classes, event names, or routing paths.",
          "## Intrinsic String Manipulation\n\nTypeScript also provides built-in types to manipulate the casing of strings at the type level: `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, and `Uncapitalize<T>`.",
          '```ts\n// 1. Basic Template Literals\ntype World = "world";\ntype Greeting = `hello ${World}`; // Type is strictly "hello world"\n\n// 2. Generating Permutations\ntype VerticalAlignment = "top" | "middle" | "bottom";\ntype HorizontalAlignment = "left" | "center" | "right";\n\n// Creates 9 distinct string literals!\ntype Alignment = `${VerticalAlignment}-${HorizontalAlignment}`;\n\nfunction setAlignment(align: Alignment) {\n  console.log(`Setting alignment to: <mark>${align}</mark>`);\n}\nsetAlignment("top-left"); // Valid\n// setAlignment("bottom-middle"); // ERROR: Not a generated permutation\n\n// 3. Intrinsic string utilities combined with mapped types\ntype Entity = "user" | "post" | "comment";\ntype StoreActions = `fetch${Capitalize<Entity>}` | `add${Capitalize<Entity>}`;\n// Result: "fetchUser" | "addUser" | "fetchPost" | "addPost" | ...\n```',
        ],
        codeSnippet: `type Size = "sm" | "md" | "lg";
type Color = "primary" | "secondary";

// "btn-sm-primary" | "btn-sm-secondary" | "btn-md-primary" | ...
type ButtonClass = \`btn-\${Size}-\${Color}\`;`,
        language: "ts",
        tryItChallenge:
          "Create a type `HexColor` that uses template literals to ensure a string always starts with a `#` symbol.",
        order: 15,
      },
      {
        slug: "ch-17-satisfies-operator",
        title: "17. Safe Upcasting with the 'satisfies' Operator",
        summary:
          "Validate that an object matches a specific type without losing its exact inferred properties and literal types.",
        content: [
          "# The Problem with Explicit Typing\n\nHistorically in TypeScript, if you explicitly typed an object (e.g., `const config: Config = {...}`), you lost the specific information about exactly what keys and literal values you provided. The compiler only remembered it was a generic `Config`. If you didn't type it, you lost typo protection.",
          "## Enter the 'satisfies' Operator\n\nIntroduced in TypeScript 4.9, the `satisfies` operator gives you the best of both worlds. It validates that an expression matches a type, but it ==preserves the most specific type inferred== from the expression.",
          "```ts\ntype RGB = [number, number, number];\ntype ColorConfig = Record<string, string | RGB>;\n\n// The OLD way (Explicit Annotation)\nconst oldPalette: ColorConfig = {\n  red: [255, 0, 0],\n  green: \"#00ff00\",\n};\n// oldPalette.red.map(...) // ERROR: Property 'map' does not exist on type 'string | RGB'.\n// TS forgot that 'red' was specifically an array!\n\n// The NEW way (satisfies)\nconst newPalette = {\n  red: [255, 0, 0],\n  green: \"#00ff00\",\n  // blue: 123 // ERROR: Type 'number' is not assignable to 'string | RGB'\n} satisfies ColorConfig;\n\n// TypeScript remembers exactly what 'red' and 'green' are!\nnewPalette.red.map((val) => val / 255); // Totally valid, TS knows it's an array\nconsole.log(newPalette.green.toUpperCase()); // Totally valid, TS knows it's a string\n```",
        ],
        codeSnippet: `type Route = { path: string; children?: boolean };

const myRoute = {
  path: "/home",
  children: false,
} satisfies Route;

// TS knows myRoute.children is exactly 'false' (boolean literal)`,
        language: "ts",
        tryItChallenge:
          "Create a `User` object that `satisfies Record<string, unknown>` but keeps the exact inference so you can safely access `user.age`.",
        order: 16,
      },
      {
        slug: "ch-18-interface-merging",
        title: "18. Interface Merging and Module Augmentation",
        summary:
          "Learn how to extend existing types from third-party libraries globally using Declaration Merging.",
        content: [
          "# Declaration Merging\n\nUnlike `type` aliases, if you declare an `interface` multiple times in the same scope, TypeScript doesn't throw an error. Instead, it ==merges them together==. This is known as Declaration Merging.",
          "## Module Augmentation\n\nThis behavior is crucial when working with third-party libraries like Express.js or Redux. Often, middleware attaches custom properties to existing objects (like adding `req.user` in Express). Since you didn't write the Express typings, you must use module augmentation to tell TypeScript about these additions.",
          '```ts\n// 1. Basic Interface Merging\ninterface Car {\n  brand: string;\n}\ninterface Car {\n  year: number;\n}\nconst myCar: Car = { brand: "Toyota", year: 2023 }; // Merged seamlessly\n\n// 2. Module Augmentation (e.g., adding \'user\' to Express Request)\nimport * as express from \'express\';\n\n// We must wrap the interface in a module declaration that matches the library\ndeclare module \'express-serve-static-core\' {\n  interface Request {\n    user?: {\n      id: string;\n      role: "admin" | "user";\n    };\n  }\n}\n\nconst app = express();\n\napp.get("/profile", (req, res) => {\n  // TS now knows req.user exists and has an \'id\' property!\n  if (req.user) {\n    res.send(\`Welcome user: <mark>\${req.user.id}</mark>\`);\n  } else {\n    res.status(401).send("Unauthorized");\n  }\n});\n```',
        ],
        codeSnippet: `// Augmenting global window object\ndeclare global {\n  interface Window {\n    myCustomLibrary: any;\n  }\n}\n\nwindow.myCustomLibrary = {}; // No TS error`,
        language: "ts",
        tryItChallenge:
          "Use `declare global` to merge a new interface into the global `String` object, adding a definition for a custom method `toReverse(): string`.",
        order: 17,
      },
      {
        slug: "ch-19-variance-type-systems",
        title: "19. Type Variance (Covariance & Contravariance)",
        summary:
          "Dive deep into the theoretical underpinnings of TypeScript's type system and how function parameters are evaluated.",
        content: [
          "# Understanding Type Variance\n\nVariance describes how complex types (like functions or arrays) relate to one another when their underlying types have a subtyping relationship (e.g., `Dog` extends `Animal`).",
          "## Covariance (Outputs)\n\nReturn types in TypeScript are ==Covariant==. If a function expects a callback that returns an `Animal`, it is perfectly safe to pass a callback that returns a `Dog`. A Dog *is* an Animal. It fulfills the contract.",
          "## Contravariance (Inputs)\n\nFunction parameters, however, are ==Contravariant== (when strict mode is enabled). If a function expects a callback that takes a `Dog` as an argument, it is **unsafe** to pass a callback that takes an `Animal`. Why? Because the caller might pass a `Cat` into your callback, but your callback is specifically written to handle `Animals` that are `Dogs`.",
          '```ts\nclass Animal { name = "Animal"; }\nclass Dog extends Animal { bark() { console.log("Woof"); } }\nclass Cat extends Animal { meow() { console.log("Meow"); } }\n\n// Covariance: Return types (Safe to return a narrower type)\ntype AnimalGetter = () => Animal;\nconst getDog: AnimalGetter = () => new Dog(); // Safe!\n\n// Contravariance: Function Parameters (Must accept wider or exact type)\ntype DogHandler = (dog: Dog) => void;\n\n// SAFE: A handler that expects ANY animal can safely handle a Dog.\nconst handleAnimal: DogHandler = (animal: Animal) => console.log(animal.name);\n\n// UNSAFE: A handler expecting a Cat cannot be assigned to DogHandler.\n// TS catches this under strictFunctionTypes!\n// const handleCat: DogHandler = (cat: Cat) => cat.meow(); \n```',
        ],
        codeSnippet: `// To force TS to strictly check function parameters,
// ensure your tsconfig.json has:
{
  "compilerOptions": {
    "strictFunctionTypes": true
  }
}`,
        language: "ts",
        tryItChallenge:
          "Create a generic `EventHandler<T>` type and observe what happens when you try to assign an `EventHandler<Event>` to a variable typed as `EventHandler<MouseEvent>`.",
        order: 18,
      },
      {
        slug: "ch-20-project-references",
        title: "20. Scaling TypeScript: Project References",
        summary:
          "Architect massive TypeScript codebases efficiently using Project References and Monorepos to drastically reduce compilation times.",
        content: [
          "# The Scaling Problem\n\nAs a TypeScript project grows to thousands of files, type-checking and compiling can take minutes. Changing one file in a utility folder forces the entire application to recompile.",
          "## Project References\n\nTypeScript solves this with ==Project References==. By breaking your codebase into smaller, independent projects (e.g., `shared-ui`, `core-logic`, `web-app`), you can tell the compiler exactly how they depend on each other. If you change a file in `web-app`, TypeScript knows it doesn't need to rebuild `shared-ui`.",
          '## Configuration (`composite: true`)\n\nTo make a project referenceable, its `tsconfig.json` must have `"composite": true`. This forces TypeScript to output additional metadata (`.tsbuildinfo` files) so downstream projects can consume its types instantly without recompiling the source.',
          '```json\n// 1. Root tsconfig.json (The orchestrator)\n{\n  "files": [], // Root doesn\'t compile files directly\n  "references": [\n    { "path": "./packages/core" },\n    { "path": "./packages/api" },\n    { "path": "./packages/web" }\n  ]\n}\n\n// 2. packages/core/tsconfig.json (A referenced project)\n{\n  "compilerOptions": {\n    "composite": true,\n    "declaration": true,      // Must generate .d.ts files\n    "declarationMap": true,   // Enables IDE "Go to Definition" across boundaries\n    "outDir": "./dist",\n    "rootDir": "./src"\n  },\n  "include": ["src/**/*"]\n}\n\n// 3. packages/web/tsconfig.json (The consumer)\n{\n  "compilerOptions": {\n    "outDir": "./dist"\n  },\n  "references": [\n    { "path": "../core" } // Web depends on Core\n  ]\n}\n```',
        ],
        codeSnippet: `# Building a project with references requires the --build (-b) flag
npx tsc --build

# To force a clean rebuild of all referenced projects
npx tsc --build --force`,
        language: "json",
        tryItChallenge:
          "Set up a dummy directory with a `frontend` and `backend` folder. Create a `tsconfig.json` in the root that references both folders.",
        order: 19,
      },

      {
        slug: "ch-21-key-remapping",
        title: "21. Advanced Mapped Types: Key Remapping",
        summary:
          "Transform object keys dynamically using the 'as' clause in mapped types to build robust utility types.",
        content: [
          "# Key Remapping in Mapped Types\n\nTypeScript 4.1 introduced a powerful feature called ==Key Remapping==. Previously, when using mapped types (`[K in keyof T]`), you were strictly bound to the existing keys of the object. With key remapping via the `as` clause, you can rename, filter, or completely transform keys during the mapping process.",
          "## Renaming Keys with Template Literals\n\nBy combining key remapping with template literal types, you can automatically generate getter/setter types from an existing interface. For instance, transforming `name` into `getName`.",
          "## Filtering Keys\n\nIf the `as` clause resolves to `never`, that key is completely excluded from the resulting type. This allows you to create utility types that extract only properties matching a certain type, like extracting only the function properties from a class.",
          "```ts\n// 1. Renaming Keys (Generating Getters)\ninterface Person {\n  name: string;\n  age: number;\n}\n\n// Capitalize is a built-in string utility type\ntype Getters<T> = {\n  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K]\n};\n\ntype PersonGetters = Getters<Person>;\n/* \nResult:\n{\n  getName: () => string;\n  getAge: () => number;\n}\n*/\n\n// 2. Filtering Keys (Extracting only boolean properties)\ninterface AppState {\n  isActive: boolean;\n  username: string;\n  hasUnsavedChanges: boolean;\n  sessionTimeout: number;\n}\n\n// If the value extends boolean, keep the key K, otherwise map key to 'never' to drop it\ntype OnlyBooleans<T> = {\n  [K in keyof T as T[K] extends boolean ? K : never]: T[K]\n};\n\ntype BooleanState = OnlyBooleans<AppState>;\n/* \nResult:\n{\n  isActive: boolean;\n  hasUnsavedChanges: boolean;\n}\n*/\n```",
        ],
        codeSnippet: `// Drop properties that start with an underscore\ntype PublicProperties<T> = {\n  [K in keyof T as K extends \`_\${string}\` ? never : K]: T[K]\n};`,
        language: "ts",
        tryItChallenge:
          "Write a mapped type `Setters<T>` that transforms properties of an interface into setter functions, e.g., `name: string` becomes `setName: (val: string) => void`.",
        order: 20,
      },
      {
        slug: "ch-22-recursive-types",
        title: "22. Recursive Types and Deep Partials",
        summary:
          "Handle infinitely nested data structures like JSON trees and file systems using recursive type definitions.",
        content: [
          "# What are Recursive Types?\n\nA recursive type is a type that references itself within its own definition. This is absolutely essential when modeling data structures whose depth is unknown at compile time, such as a file directory tree, a nested comment section, or generic JSON data.",
          "## Modeling Trees and Graphs\n\nWhen defining a recursive type, you typically define a base case (a primitive or an object with flat properties) and a recursive case (an array or object containing the same type).",
          "## Deep Utility Types\n\nTypeScript's built-in `Partial<T>` only makes the top-level properties optional. If you are accepting a deeply nested configuration object, you need a recursive mapped type to make all nested properties optional as well.",
          '```ts\n// 1. Recursive Data Structures (File System)\ninterface FileNode {\n  type: "file";\n  name: string;\n  size: number;\n}\n\ninterface DirectoryNode {\n  type: "directory";\n  name: string;\n  // The type references itself here!\n  children: Array<FileNode DirectoryNode |>; \n}\n\ntype FileSystem = FileNode | DirectoryNode;\n\n// 2. A DeepPartial Utility Type\ntype DeepPartial<T> = T extends Function\n  ? T // Base case: Don\'t mess with functions\n  : T extends Array<infer U>\n  ? _DeepPartialArray<U> // Handle arrays\n  : T extends object\n  ? DeepPartialObject<T> // Recursive case for objects\n  : T | undefined; // Base case for primitives\n\ninterface DeepPartialArray<T> extends Array<DeepPartial<T>> {}\ntype DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };\n\n// Usage:\ninterface Theme {\n  colors: { primary: string; secondary: string };\n  fonts: { main: string };\n}\n\n// Valid! Only overriding one deep property.\nconst customTheme: DeepPartial<Theme> = {\n  colors: { primary: "#ff0000" }\n};\n```',
        ],
        codeSnippet: `// The ultimate generic JSON type\ntype JSONValue = \n  | string \n  | number \n  | boolean \n  | null \n  | JSONObject \n  | JSONArray;\n\ninterface JSONObject { [key: string]: JSONValue }\ninterface JSONArray extends Array<JSONValue> {}`,
        language: "ts",
        tryItChallenge:
          "Create a recursive `NestedReadonly<T>` type that makes all properties, including deeply nested ones, entirely immutable.",
        order: 21,
      },
      {
        slug: "ch-23-type-safe-errors",
        title: "23. Type-Safe Error Handling",
        summary:
          "Manage exceptions effectively using 'unknown' in catch blocks and the functional Result pattern.",
        content: [
          "# The Problem with try/catch\n\nHistorically, the `error` variable in a `catch(error)` block was implicitly typed as `any`. This meant you could access `error.message` without TS complaining, even if the error thrown was just a string or null (which is perfectly valid JS).",
          "## useUnknownInCatchVariables\n\nIn modern TypeScript, the compiler option `useUnknownInCatchVariables` (enabled by `strict`) forces the caught error to be `unknown`. You ==must narrow the type== before interacting with it, ensuring you don't crash your error handler.",
          "## The Result (Either) Pattern\n\nInstead of relying on `try/catch` which breaks control flow and hides return types, advanced TS developers often use the Discriminated Union pattern (sometimes called `Result` or `Either`) borrowed from functional languages like Rust.",
          '```ts\n// 1. Narrowing unknown errors\ntry {\n  throw new Error("Network failed");\n} catch (error: unknown) {\n  if (error instanceof Error) {\n    console.error(`Caught an Error: <mark>\\${error.message}</mark>`);\n  } else if (typeof error === "string") {\n    console.error(`Caught a string: \\${error}`);\n  } else {\n    console.error("Caught an unknown exception", error);\n  }\n}\n\n// 2. The Result Pattern (Discriminated Union)\ntype Success<T> = { success: true; data: T };\ntype Failure<E> = { success: false; error: E };\ntype Result<T, E="Error"> = Success<T> | Failure<E>;\n\n// Function explicitly states it can fail, and how\nfunction parseJSON(jsonString: string): Result<object, SyntaxError> {\n  try {\n    const data = JSON.parse(jsonString);\n    return { success: true, data };\n  } catch (err) {\n    return { \n      success: false, \n      error: err instanceof SyntaxError ? err : new SyntaxError("Unknown error") \n    };\n  }\n}\n\nconst response = parseJSON(\'{"name": "Alice"}\');\nif (response.success) {\n  console.log(response.data); // TS narrows to Success\n} else {\n  console.error(response.error.message); // TS narrows to Failure\n}\n```',
        ],
        codeSnippet: `// Helper for normalizing errors\nfunction ensureError(value: unknown): Error {\n  if (value instanceof Error) return value;\n  return new Error(String(value));\n}`,
        language: "ts",
        tryItChallenge:
          "Write an `async` function that wraps a `fetch` call and returns a `Result<unknown, Error>` instead of throwing an exception on failure.",
        order: 22,
      },
      {
        slug: "ch-24-polymorphic-react",
        title: "24. Polymorphic Components in React",
        summary:
          "Design ultra-flexible React components (like '<Box as=\"button\">') that dynamically change their HTML tag while retaining perfect typings.",
        content: [
          "# What is a Polymorphic Component?\n\nDesign systems often require components that can change their underlying DOM element while keeping their visual styles. For example, a `<Button>` that looks like a button but renders as an `<a>` tag when an `href` is provided. This is called a ==Polymorphic Component==.",
          "## The Generic `as` Prop\n\nTyping this correctly is one of the most complex tasks in React-TypeScript. You must capture the string tag (e.g., `'a'`, `'button'`, `'div'`) passed to the `as` prop using a Generic. Then, you use `React.ComponentPropsWithoutRef<T>` to extract the valid native HTML attributes for that specific tag.",
          '## Ensuring Type Safety\n\nIf the user passes `as="a"`, TypeScript should immediately complain if they omit the `href` attribute. If they pass `as="button"`, TypeScript should reject `href` and allow `disabled`.',
          '```tsx\nimport React from \'react\';\n\n// 1. Define custom props\ntype TextProps<E React.ElementType extends> = {\n  children: React.ReactNode;\n  color?: \'primary\' | \'secondary\' | \'danger\';\n  // The \'as\' prop determines the HTML tag. Defaults to \'span\'.\n  as?: E;\n};\n\n// 2. Merge custom props with native HTML props for the specific element.\n// Omit custom prop names from native props to prevent conflicts.\ntype PolymorphicProps<E React.ElementType extends> = React.PropsWithChildren<\n  TextProps<E> & Omit<React.ComponentPropsWithoutRef<E>, keyof TextProps<E>>\n>;\n\n// 3. The Component\nexport const Text = <E React.ElementType="span" extends>(\n  { as, color = \'primary\', children, ...rest }: PolymorphicProps<E>\n) => {\n  const Component = as || \'span\';\n  const className = \`text-base color-\${color}\`;\n  \n  return (\n    <Component className="{className}" {...rest}>\n      {children}\n    </Component>\n  );\n};\n\n// Usage:\n// <Text as=""h1\\">Heading</Text>  // Valid\n// <Text as=""a"" href=""[https://google.com](https://google.com)"">Link</Text> // Valid\n// <Text as=""button"" type=""submit"">Submit</Text> // Valid\n// <Text as=""a"" type=""submit"">Error</Text> // TS ERROR: Property \'type\' does not exist on type \'a\'.\n```',
        ],
        codeSnippet: `// Extracting native props easily:\ntype ButtonProps = React.ComponentPropsWithoutRef<'button'>;\ntype InputProps = React.ComponentPropsWithoutRef<'input'>;`,
        language: "tsx",
        tryItChallenge:
          'Create a polymorphic `<Box as="...">` component that accepts standard HTML attributes and a custom `padding` prop.',
        order: 23,
      },
      {
        slug: "ch-25-performance-debugging",
        title: "25. Compiler Performance and Type Debugging",
        summary:
          "Identify and resolve slow TypeScript compilation times by avoiding type bloat, limiting intersection depth, and using tracing tools.",
        content: [
          "# The Cost of Advanced Types\n\nTypeScript is a highly optimized compiler, but heavily nested mapped types, massive union permutations, and deep recursive types can cause a phenomenon known as ==Type Instantiation Explosion==. This results in the IDE freezing, autocomplete stalling, and CI/CD pipelines taking 10x longer.",
          "## Diagnosing Slow Compiles\n\nIf your project is slowing down, you can ask TypeScript to tell you exactly where it is spending its time by running the compiler with diagnostics flags: `tsc --generateTrace traceDir`.\n\nThis generates a trace file you can load into Chrome's `about:tracing` UI or Edge's `edge://tracing` to visually inspect the flame chart of the compilation process.",
          "## Best Practices for Type Performance\n\n1. **Prefer Interfaces over Intersections**: `interface A extends B` is cached much more efficiently by the compiler than `type A = B & C`.\n2. **Avoid Deep Permutations**: Template literal types like `` \`${A}-${B}-${C}-${D}\` `` where each variable is a union of 10 items creates 10,000 distinct types instantly.\n3. **Use Base Types for Large Data**: If an API returns a massive JSON object with 200 properties, avoid running mapped/utility types like `DeepPartial` over the entire thing if you only need 3 properties. Pick them out first.",
          '```json\n// tsconfig.json - Generating a Performance Trace\n{\n  "compilerOptions": {\n    "generateTrace": "./type-trace"\n  }\n}\n```\n\n```ts\n// ❌ BAD PERFORMANCE: Deep Intersection\ntype ConfigA = { a: string };\ntype ConfigB = { b: string };\ntype ConfigC = { c: string };\n// The compiler evaluates this dynamically every time it\'s used\ntype MegaConfig = ConfigA & ConfigB & ConfigC;\n\n// ✅ GOOD PERFORMANCE: Interface Extension\ninterface IConfigA { a: string }\ninterface IConfigB { b: string }\ninterface IConfigC { c: string }\n// The compiler resolves the shape once and caches it\ninterface IMegaConfig extends IConfigA, IConfigB, IConfigC {}\n```',
        ],
        codeSnippet: `// Run this in your terminal to see simple compiler stats\nnpx tsc --extendedDiagnostics`,
        language: "bash",
        tryItChallenge:
          "Run `npx tsc --extendedDiagnostics` on your current TypeScript project and examine the 'Instantiation count' and 'Total time' metrics.",
        order: 24,
      },
      {
        slug: "ch-26-zod-runtime-validation",
        title: "26. Schema Parsing and Runtime Validation with Zod",
        summary:
          "Bridge the gap between compile-time types and runtime realities by using Zod to parse, validate, and infer data.",
        content: [
          "# The Runtime Boundary Problem\n\nTypeScript is a design-time tool; its types are completely erased during compilation. When your application receives data from an external source (an API, a form submission, a database), TypeScript has no way of verifying if that data actually matches your interfaces at runtime. Simply casting data (`data as User`) is a dangerous lie to the compiler.",
          "## Enter Zod: Schema Validation\n\nZod is a TypeScript-first schema declaration and validation library. Instead of writing types and then writing separate validation logic, you ==define a Zod schema once==. Zod acts as the bouncer at the door of your application, throwing an error if the runtime data is malformed.",
          "## Type Inference (`z.infer`)\n\nThe magic of Zod lies in its ability to automatically extract static TypeScript types directly from your schemas. This completely eliminates code duplication.",
          '```ts\nimport { z } from "zod";\n\n// 1. Define the Runtime Schema\nconst UserSchema = z.object({\n  id: z.string().uuid(),\n  username: z.string().min(3, "Username must be at least 3 characters"),\n  email: z.string().email(),\n  age: z.number().int().gte(18).optional(),\n  role: z.enum(["ADMIN", "USER"]).default("USER"),\n});\n\n// 2. Infer the Compile-Time Type\n// Type is instantly generated: { id: string; username: string; email: string; ... }\ntype User = z.infer<typeof UserSchema>;\n\n// 3. Parse Unknown Runtime Data\nfunction processExternalData(unknownData: unknown) {\n  try {\n    // .parse() throws a descriptive ZodError if validation fails\n    // If it succeeds, \'validUser\' is strongly typed as \'User\' and strictly validated!\n    const validUser = UserSchema.parse(unknownData);\n    console.log(`Welcome, <mark>\${validUser.username}</mark>`);\n  } catch (error) {\n    if (error instanceof z.ZodError) {\n      console.error("Validation failed:", error.errors);\n    }\n  }\n}\n```',
        ],
        codeSnippet: `// Safe Parsing (doesn't throw, returns a Result object)\nconst result = UserSchema.safeParse(data);\n\nif (!result.success) {\n  console.error(result.error.format());\n} else {\n  console.log(result.data); // typed as User\n}`,
        language: "ts",
        tryItChallenge:
          "Create a Zod schema for a `Product` with a required string `name` and a `price` that must be a positive number. Use `z.infer` to extract its type.",
        order: 25,
      },
      {
        slug: "ch-27-fullstack-trpc",
        title: "27. End-to-End Type Safety with tRPC",
        summary:
          "Eliminate API contracts and REST boilerplates by sharing types seamlessly across your full-stack monorepo using tRPC.",
        content: [
          "# Rethinking the API Layer\n\nTraditionally, connecting a TypeScript backend to a TypeScript frontend requires generating types (via GraphQL or OpenAPI) or manually keeping shared interfaces in sync. ==tRPC (TypeScript Remote Procedure Call)== changes this entirely. It allows you to import your backend types directly into your frontend without compiling any intermediate schemas.",
          '## How tRPC Works\n\nYou define a "router" on your server consisting of queries (GET) and mutations (POST). You use Zod to validate the incoming inputs. The router\'s type definition is then exported and consumed by the frontend tRPC client.',
          "## React Query Integration\n\ntRPC wraps `@tanstack/react-query` under the hood. When you fetch data in React, the endpoint paths, arguments, and returned data are 100% strictly typed and autocompleted by your IDE.",
          "```ts\n// --- SERVER SIDE --- (server/router.ts)\nimport { initTRPC } from '@trpc/server';\nimport { z } from 'zod';\n\nconst t = initTRPC.create();\n\nexport const appRouter = t.router({\n  // Define a query endpoint\n  getUser: t.procedure\n    .input(z.object({ id: z.string() })) // Input validation\n    .query(async (opts) => {\n      // opts.input is strictly { id: string }\n      const user = await db.user.findById(opts.input.id);\n      return user; // Return type is automatically inferred!\n    }),\n});\n\n// Export ONLY the type, not the actual backend code!\nexport type AppRouter = typeof appRouter;\n\n\n// --- CLIENT SIDE --- (client/app.tsx)\nimport { createTRPCReact } from '@trpc/react-query';\nimport type { AppRouter } from '../server/router';\n\nconst trpc = createTRPCReact<AppRouter>();\n\nexport function UserProfile({ userId }: { userId: string }) {\n  // Autocomplete knows 'getUser' exists, requires an 'id', and returns a user object!\n  const { data, isLoading } = trpc.getUser.useQuery({ id: userId });\n\n  if (isLoading) return <div>Loading...</div>;\n  return <div><h1>{data?.name}</h1></div>;\n}\n```",
        ],
        codeSnippet: `// A tRPC mutation example\ncreateUser: t.procedure\n  .input(z.object({ name: z.string() }))\n  .mutation(async ({ input }) => {\n    return await db.user.create(input);\n  }),`,
        language: "ts",
        tryItChallenge:
          "Look at the tRPC documentation and identify the difference between `t.procedure.query()` and `t.procedure.mutation()`.",
        order: 26,
      },
      {
        slug: "ch-28-nextjs-server-components",
        title: "28. TypeScript in Next.js: Server Components & Routing",
        summary:
          "Master data fetching, page props, and API routes in the modern Next.js App Router ecosystem.",
        content: [
          "# Next.js and the App Router\n\nWith the introduction of the App Router (`app/` directory) and React Server Components (RSC), Next.js dramatically shifted how we write React. Server Components run natively on the Node.js server, allowing you to execute direct database queries within your UI components.",
          "## Typing Page Props\n\nPages in Next.js automatically receive props based on their URL structure (Dynamic Routes). You must type the `params` (the URL segments) and `searchParams` (the query string) accurately. Because these props are resolved asynchronously in newer Next.js versions, they should be typed as Promises.",
          "## Type-Safe Data Fetching\n\nBecause Server Components are `async`, you don't need `useEffect` or `useState` to fetch data. You just `await` your fetch call. TypeScript easily infers the return type of your database calls.",
          "```tsx\n// app/products/[slug]/page.tsx\nimport { notFound } from 'next/navigation';\nimport db from '@/lib/db';\n\n// 1. Define strict types for Next.js routing props\ninterface ProductPageProps {\n  params: Promise<{ slug: string }>;\n  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;\n}\n\n// 2. An Async React Server Component\nexport default async function ProductPage({ params, searchParams }: ProductPageProps) {\n  // Resolve the dynamic params\n  const { slug } = await params;\n  const { ref } = await searchParams; // e.g., ?ref=twitter\n\n  // 3. Direct, type-safe database call on the server\n  const product = await db.product.findBySlug(slug);\n\n  if (!product) {\n    notFound(); // Built-in Next.js control flow\n  }\n\n  return (\n    <main className=\"p-8\">\n      <h1 className=\"text-2xl font-bold\">{product.name}</h1>\n      <p>Price: $<mark>{product.price.toFixed(2)}</mark></p>\n      {ref === 'twitter' && <p>Thanks for visiting from Twitter!</p>}\n    </main>\n  );\n}\n```",
        ],
        codeSnippet: `// Typing a Next.js Route Handler (API Route)\nimport { NextResponse } from 'next/server';\n\nexport async function POST(request: Request) {\n  const body: { name: string } = await request.json();\n  return NextResponse.json({ message: \`Hello \${body.name}\` });\n}`,
        language: "tsx",
        tryItChallenge:
          "Write the `PageProps` interface for a route located at `app/users/[userId]/posts/[postId]/page.tsx`.",
        order: 27,
      },
      {
        slug: "ch-29-xstate-state-machines",
        title: "29. Bulletproof Logic with XState and Typegen",
        summary:
          "Move beyond 'useState' spaghetti. Model complex, strictly typed application states using finite state machines.",
        content: [
          "# The Problem with Boolean State\n\nAs UIs grow complex, developers often stack booleans: `isLoading`, `isError`, `isSuccess`. This leads to impossible states (e.g., `isLoading` and `isError` being true simultaneously). ==Finite State Machines (FSM)== solve this by ensuring an application can only exist in one distinct state at a time.",
          "## XState and TypeScript\n\nXState is the premier library for state machines in JavaScript. By combining XState with TypeScript, you can strictly type the machine's Context (its data), its Events (the triggers), and its valid States.",
          "## Typegen\n\nXState features a VS Code extension that automatically generates types for your machines, ensuring you cannot transition to an invalid state or send an event with the wrong payload.",
          "```ts\nimport { createMachine, assign } from 'xstate';\n\n// 1. Define the Context (Data)\ninterface FetchContext {\n  data: string | null;\n  errorMessage: string | null;\n}\n\n// 2. Define the Events (Actions)\ntype FetchEvent =\n  | { type: 'FETCH' }\n  | { type: 'RESOLVE'; payload: string }\n  | { type: 'REJECT'; message: string };\n\n// 3. Create the Strongly Typed Machine\nconst fetchMachine = createMachine({\n  id: 'fetch',\n  initial: 'idle',\n  types: {} as { context: FetchContext; events: FetchEvent },\n  context: {\n    data: null,\n    errorMessage: null,\n  },\n  states: {\n    idle: {\n      on: { FETCH: 'loading' }, // Can only go to loading\n    },\n    loading: {\n      on: {\n        RESOLVE: {\n          target: 'success',\n          // 'event' is strictly typed based on 'RESOLVE'\n          actions: assign({ data: ({ event }) => event.payload }),\n        },\n        REJECT: {\n          target: 'failure',\n          actions: assign({ errorMessage: ({ event }) => event.message }),\n        },\n      },\n    },\n    success: {}, // Final state\n    failure: { on: { FETCH: 'loading' } }, // Can retry\n  },\n});\n```",
        ],
        codeSnippet: `// Using the machine in React\nimport { useMachine } from '@xstate/react';\n\nconst [state, send] = useMachine(fetchMachine);\n// TS prevents: send({ type: 'RESOLVE' }); // Error: missing payload`,
        language: "ts",
        tryItChallenge:
          "Sketch out the 'states' for a Traffic Light machine (Red, Yellow, Green) and the event (`TIMER`) that transitions between them.",
        order: 28,
      },
      {
        slug: "ch-30-custom-eslint-ast",
        title: "30. Architecture Guardians: Writing Custom TS ESLint Rules",
        summary:
          "Enforce your team's unique architectural patterns by analyzing the Abstract Syntax Tree (AST) to write custom ESLint rules.",
        content: [
          '# Beyond Built-in Linting\n\nTypeScript catches type errors, and ESLint catches logical smells. But what if your team has a specific architectural rule? For example: "Never import a database model directly into a UI component." You can write a ==Custom ESLint Rule== using `@typescript-eslint/utils` to enforce this automatically in CI/CD.',
          "## The Abstract Syntax Tree (AST)\n\nWhen a compiler reads your code, it parses it into a tree structure called the AST. Every variable declaration, function call, and import statement is a node on this tree. Custom ESLint rules traverse this tree and inspect specific nodes.",
          "## Writing a Rule\n\nBy leveraging the TypeScript AST explorer (astexplorer.net), you can find the exact Node type you want to target (e.g., `ImportDeclaration`) and write logic to report violations.",
          "```ts\n// A custom ESLint rule preventing imports from a specific layer\nimport { ESLintUtils } from '@typescript-eslint/utils';\n\n// Create a rule creator with your documentation URL\nconst createRule = ESLintUtils.RuleCreator(\n  name => \`[https://my-docs.com/rules/](https://my-docs.com/rules/)\${name}\`\n);\n\nexport const noDbInUiRule = createRule({\n  name: 'no-db-in-ui',\n  meta: {\n    type: 'problem',\n    docs: {\n      description: 'UI components must not import directly from the @db layer.',\n    },\n    messages: {\n      layerViolation: 'Architecture Violation: Cannot import <mark>{{moduleName}}</mark> in the UI layer.',\n    },\n    schema: [], // Options schema\n  },\n  defaultOptions: [],\n  create(context) {\n    return {\n      // Target every ImportDeclaration node in the AST\n      ImportDeclaration(node) {\n        const importPath = node.source.value;\n        const currentFilename = context.getFilename();\n\n        // If the current file is a UI component, but imports from @db\n        if (currentFilename.includes('/ui/') && importPath.startsWith('@db/')) {\n          context.report({\n            node,\n            messageId: 'layerViolation',\n            data: { moduleName: importPath },\n          });\n        }\n      },\n    };\n  },\n});\n```",
        ],
        codeSnippet: `// AST Nodes are highly specific\n// A function declaration looks like this in the AST:\n{\n  "type": "FunctionDeclaration",\n  "id": { "type": "Identifier", "name": "calculateSum" }\n}`,
        language: "ts",
        tryItChallenge:
          "Go to astexplorer.net, paste in `const x = 5;`, and examine the JSON structure to find the `VariableDeclarator` node.",
        order: 29,
      },
    ],
  },
];

async function seed() {
  const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;
  if (!MONGO_URI) {
    console.error(
      "❌ MONGO_URI environment variable not found. Check your .env file.",
    );
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ── Seed Courses & Chapters ───────────────────────────────────────────────
  console.log("\n📚 Seeding Courses & Chapters...");
  for (const courseData of COURSES_SEED) {
    const { chapters, ...courseFields } = courseData;

    const course = await Course.findOneAndUpdate(
      { slug: courseFields.slug },
      courseFields,
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    console.log(`  ✅ Course upserted: ${course.title}`);

    // Delete existing React.js chapters as requested
    if (course.techId === "reactjs") {
      console.log("  🧹 Clearing existing React.js chapters...");
      await Chapter.deleteMany({ course: course._id });
    }

    for (const chapterData of chapters) {
      await Chapter.create({
        ...chapterData,
        course: course._id,
      });
      console.log(`     📖 Chapter created: ${chapterData.title}`);
    }
  }

  console.log(
    "\n🎉 React.js course seeded with 5 detailed chapters successfully!\n",
  );
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeder error:", err);
  mongoose.disconnect();
  process.exit(1);
});

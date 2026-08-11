/**
 * React.js Final Exam Question Bank
 * 60 questions — 20 randomly selected per attempt
 * Topics: JSX, Components, Hooks, Context, Performance, Lifecycle, Patterns
 */
export const REACTJS_EXAM_QUESTIONS = [
  // ── JSX & Rendering ──────────────────────────────────────────────────────
  {
    id: 1,
    question: "What does JSX stand for?",
    options: [
      "JavaScript XML",
      "JavaScript Extension",
      "Java Syntax Extension",
      "JavaScript Experimental",
    ],
    correctIndex: 0,
    explanation:
      "JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows you to write HTML-like code inside JavaScript files, which React then transforms into React.createElement() calls.",
  },
  {
    id: 2,
    question: "Which of the following is the correct way to embed a JavaScript expression inside JSX?",
    options: [
      "{{ expression }}",
      "<% expression %>",
      "{ expression }",
      "[ expression ]",
    ],
    correctIndex: 2,
    explanation:
      "In JSX, JavaScript expressions are embedded using single curly braces {}. Double curly braces are used only for inline style objects (the outer braces are JSX expression syntax, the inner are a JavaScript object literal).",
  },
  {
    id: 3,
    question: "What must every React component return?",
    options: [
      "A string of HTML",
      "A single root element or null",
      "An array of DOM nodes",
      "A JavaScript object",
    ],
    correctIndex: 1,
    explanation:
      "Every React component must return a single root element (or null to render nothing). If you need to return multiple elements without adding an extra DOM node, you can use React Fragments (<> </> or <React.Fragment>).",
  },
  {
    id: 4,
    question: "What is the purpose of the `key` prop in React lists?",
    options: [
      "It gives the element a unique CSS class",
      "It helps React identify which items have changed, been added, or removed",
      "It sets the tab order for accessibility",
      "It encrypts the element data",
    ],
    correctIndex: 1,
    explanation:
      "The key prop is a special React prop that helps React's reconciliation algorithm efficiently update the DOM by uniquely identifying list items. Using stable, unique keys (like IDs) avoids unnecessary re-renders.",
  },
  {
    id: 5,
    question: "What is wrong with using an array index as a key prop in a dynamic list?",
    options: [
      "Indexes are not valid key values in React",
      "It causes a syntax error",
      "It can cause bugs when items are reordered, inserted, or removed",
      "Indexes make the component slower to mount",
    ],
    correctIndex: 2,
    explanation:
      "Using array indexes as keys can cause rendering bugs when the list order changes. React uses keys to match components between renders, so unstable keys lead to incorrect component reuse and state corruption.",
  },
  // ── Components ────────────────────────────────────────────────────────────
  {
    id: 6,
    question: "What is the difference between a controlled and an uncontrolled component in React?",
    options: [
      "Controlled components use class syntax; uncontrolled use functions",
      "Controlled components manage their state via React state; uncontrolled manage state via the DOM",
      "Controlled components render faster than uncontrolled ones",
      "Uncontrolled components cannot use hooks",
    ],
    correctIndex: 1,
    explanation:
      "In a controlled component, form data is handled by React state (via onChange + value). In an uncontrolled component, form data is handled by the DOM itself, accessed via refs. Controlled components give you more fine-grained control.",
  },
  {
    id: 7,
    question: "What is a Pure Component in React?",
    options: [
      "A component written without any side effects",
      "A component that only uses functional syntax",
      "A class component that performs a shallow comparison of props and state to avoid unnecessary re-renders",
      "A component with no children",
    ],
    correctIndex: 2,
    explanation:
      "React.PureComponent implements shouldComponentUpdate() with a shallow prop and state comparison. If nothing changed, it skips re-rendering. The functional equivalent is React.memo().",
  },
  {
    id: 8,
    question: "What does `React.memo()` do?",
    options: [
      "It memoizes a return value from a function",
      "It prevents a functional component from re-rendering if its props haven't changed",
      "It caches API responses",
      "It stores component state between unmounts",
    ],
    correctIndex: 1,
    explanation:
      "React.memo() is a higher-order component that wraps a functional component. It performs a shallow comparison of the component's props and skips re-rendering if the props are the same as the previous render.",
  },
  {
    id: 9,
    question: "What are props in React?",
    options: [
      "Internal component state variables",
      "Read-only data passed from a parent component to a child component",
      "Mutable values managed inside a component",
      "Special HTML attributes in JSX",
    ],
    correctIndex: 1,
    explanation:
      "Props (short for properties) are read-only inputs passed from parent to child components. A component should never modify its own props — this is a core rule of React's unidirectional data flow.",
  },
  {
    id: 10,
    question: "What is the difference between state and props in React?",
    options: [
      "State is immutable; props can be changed by the component",
      "State is managed inside the component and can change; props are passed from outside and are read-only",
      "Props trigger re-renders; state does not",
      "There is no difference — they are aliases",
    ],
    correctIndex: 1,
    explanation:
      "State is local, mutable data managed inside a component using useState (or this.setState). Props are external, immutable data passed down from parent components. Changing state triggers re-renders; props changes are controlled by the parent.",
  },
  // ── useState ──────────────────────────────────────────────────────────────
  {
    id: 11,
    question: "What does the `useState` hook return?",
    options: [
      "A single state object",
      "An array with the current state value and a setter function",
      "A ref object",
      "A promise that resolves to state",
    ],
    correctIndex: 1,
    explanation:
      "useState returns a tuple (2-element array): [currentState, setterFunction]. By convention it's destructured like const [count, setCount] = useState(0).",
  },
  {
    id: 12,
    question: "What happens when you call a state setter function in React?",
    options: [
      "The state updates synchronously and the component re-renders immediately",
      "The state updates are batched and the component schedules a re-render",
      "Only child components re-render",
      "Nothing happens until the next lifecycle method",
    ],
    correctIndex: 1,
    explanation:
      "React batches state updates for performance. Calling setState schedules a re-render; the actual state value doesn't update immediately within the same event handler. React 18 introduced automatic batching even in async contexts.",
  },
  {
    id: 13,
    question: "How do you correctly update state that depends on the previous state value?",
    options: [
      "setCount(count + 1)",
      "setCount(prev => prev + 1)",
      "count = count + 1",
      "setState({ count: count + 1 })",
    ],
    correctIndex: 1,
    explanation:
      "When the new state depends on the previous state, pass a function (updater function) to the setter: setCount(prev => prev + 1). This ensures you always get the latest state value, especially when multiple updates are batched.",
  },
  // ── useEffect ─────────────────────────────────────────────────────────────
  {
    id: 14,
    question: "When does `useEffect` with an empty dependency array `[]` run?",
    options: [
      "On every render",
      "Only when a specific state changes",
      "Only once after the initial render (mount)",
      "Before each render",
    ],
    correctIndex: 2,
    explanation:
      "useEffect(() => {}, []) with an empty dependency array runs exactly once after the component mounts. It's the functional equivalent of componentDidMount in class components.",
  },
  {
    id: 15,
    question: "What is the purpose of the cleanup function returned from `useEffect`?",
    options: [
      "To update state before unmounting",
      "To cancel side effects like subscriptions, timers, or event listeners when the component unmounts or deps change",
      "To reset all state to initial values",
      "To force a re-render after the effect runs",
    ],
    correctIndex: 1,
    explanation:
      "The cleanup function returned from useEffect runs before the component unmounts AND before the effect re-runs (if dependencies change). It's used to avoid memory leaks by clearing timers, cancelling network requests, or removing event listeners.",
  },
  {
    id: 16,
    question: "What happens if you don't include a dependency in useEffect's dependency array when you use it inside the effect?",
    options: [
      "React throws an error",
      "The effect never runs",
      "The effect will use a stale (outdated) closure value of that dependency",
      "The dependency is automatically detected",
    ],
    correctIndex: 2,
    explanation:
      "If you omit a dependency from the array, the effect captures a stale closure — it will always reference the value from when the effect was created, not the latest value. The ESLint rule `exhaustive-deps` helps catch this.",
  },
  // ── useMemo & useCallback ─────────────────────────────────────────────────
  {
    id: 17,
    question: "What is the primary difference between `useMemo` and `useCallback`?",
    options: [
      "useMemo is for class components; useCallback is for functional components",
      "useMemo memoizes a computed value; useCallback memoizes a function reference",
      "useMemo runs asynchronously; useCallback runs synchronously",
      "They are identical and interchangeable",
    ],
    correctIndex: 1,
    explanation:
      "useMemo(() => computeExpensiveValue(a, b), [a, b]) memoizes the result of a computation. useCallback(() => fn(a, b), [a, b]) memoizes the function itself. useCallback(fn, deps) is equivalent to useMemo(() => fn, deps).",
  },
  {
    id: 18,
    question: "When should you use `useMemo`?",
    options: [
      "For every computation to maximize performance",
      "Only for expensive calculations that don't need to re-run unless specific dependencies change",
      "To prevent state updates",
      "To replace useState for complex state",
    ],
    correctIndex: 1,
    explanation:
      "useMemo should be used selectively for genuinely expensive computations. Using it everywhere adds overhead (comparison cost). Profile first, then optimize. Good use cases: filtering large lists, complex math, derived data from props.",
  },
  // ── useRef ────────────────────────────────────────────────────────────────
  {
    id: 19,
    question: "What is the key characteristic of `useRef` that makes it different from `useState`?",
    options: [
      "useRef values persist between renders but changing them does NOT trigger a re-render",
      "useRef can only store DOM node references",
      "useRef is only available in class components",
      "useRef values reset on every render",
    ],
    correctIndex: 0,
    explanation:
      "useRef returns a mutable ref object with a .current property. Unlike state, mutating ref.current does not cause a re-render. This makes it ideal for storing values you need to persist across renders without causing UI updates (like timers, previous values, or DOM references).",
  },
  {
    id: 20,
    question: "How do you attach a ref to a DOM element in React?",
    options: [
      "Pass the ref as a prop named `ref` to the JSX element: <input ref={myRef} />",
      "Call document.getElementById() and assign the ref",
      "Use setState to store the DOM element",
      "Add a `data-ref` attribute to the element",
    ],
    correctIndex: 0,
    explanation:
      "You pass the ref object created by useRef() as the `ref` prop to a JSX element. After the component mounts, ref.current will point to the corresponding DOM node. You can then call DOM methods like myRef.current.focus().",
  },
  // ── useContext ────────────────────────────────────────────────────────────
  {
    id: 21,
    question: "What problem does the React Context API solve?",
    options: [
      "Asynchronous state updates",
      "Prop drilling — passing data through many layers of components that don't need it",
      "Slow rendering performance",
      "Managing server-side state",
    ],
    correctIndex: 1,
    explanation:
      "The Context API provides a way to share values between components without explicitly passing props through every level of the component tree. It solves prop drilling by making data available to any consumer component directly.",
  },
  {
    id: 22,
    question: "What are the three main parts of the React Context API?",
    options: [
      "Provider, Consumer, Inject",
      "createContext, Provider, useContext",
      "Context, Store, Dispatch",
      "Context.create, Context.use, Context.subscribe",
    ],
    correctIndex: 1,
    explanation:
      "The Context API works with: (1) createContext() to create a context object, (2) <Context.Provider value={...}> to wrap components and supply the value, and (3) useContext(Context) hook in any descendant to consume the value.",
  },
  {
    id: 23,
    question: "What happens to components that consume a context when the context value changes?",
    options: [
      "Only the Provider component re-renders",
      "Nothing — context changes are passive",
      "All components that call useContext() for that context re-render",
      "Only the nearest consumer re-renders",
    ],
    correctIndex: 2,
    explanation:
      "When the context value changes, every component that calls useContext() for that context will re-render, even if it only uses a small part of the value. This is why splitting contexts or using memoization is important for performance.",
  },
  // ── useReducer ────────────────────────────────────────────────────────────
  {
    id: 24,
    question: "When should you prefer `useReducer` over `useState`?",
    options: [
      "Always — useReducer is a strict upgrade over useState",
      "When state logic is complex, involves multiple sub-values, or next state depends on previous",
      "Only when you need Redux-style global state",
      "When you want to avoid re-renders",
    ],
    correctIndex: 1,
    explanation:
      "useReducer is preferred when state logic is complex (multiple sub-values, intricate transitions), when the next state depends on the previous one, or when you want to separate state logic from component logic for testability.",
  },
  // ── Event Handling ────────────────────────────────────────────────────────
  {
    id: 25,
    question: "How do you prevent the default browser behavior in a React event handler?",
    options: [
      "return false from the handler",
      "Call event.preventDefault()",
      "Set event.stop = true",
      "Wrap the handler in try/catch",
    ],
    correctIndex: 1,
    explanation:
      "In React, you must call event.preventDefault() explicitly to prevent default browser behavior. Unlike in vanilla HTML, returning false from a React event handler does not stop the default behavior.",
  },
  {
    id: 26,
    question: "What is event delegation and does React use it?",
    options: [
      "React attaches individual event listeners to every DOM element — no delegation",
      "React attaches a single event listener to the root DOM node and delegates events to components",
      "React uses service workers for event delegation",
      "Event delegation is a CSS technique, not relevant to React",
    ],
    correctIndex: 1,
    explanation:
      "React uses event delegation by attaching a single event listener to the root container (the #root div in React 17+ or document in earlier versions). Events bubble up and React's synthetic event system dispatches them to the correct component.",
  },
  // ── Lifecycle & Rendering ─────────────────────────────────────────────────
  {
    id: 27,
    question: "What triggers a re-render in a React functional component?",
    options: [
      "Only setState calls",
      "State updates, prop changes, or a parent component re-rendering",
      "Only prop changes from the parent",
      "Changes to the DOM",
    ],
    correctIndex: 1,
    explanation:
      "A functional component re-renders when: (1) its own state changes via a setter, (2) its props change, or (3) its parent component re-renders (even if props didn't change, unless React.memo is used).",
  },
  {
    id: 28,
    question: "What is React's Reconciliation algorithm?",
    options: [
      "The process of converting JSX to HTML",
      "The algorithm React uses to diff the virtual DOM and determine the minimum DOM updates needed",
      "The method React uses to resolve component naming conflicts",
      "The system that handles async state updates",
    ],
    correctIndex: 1,
    explanation:
      "React's reconciliation algorithm compares the new virtual DOM tree with the previous one (diffing). It applies a set of heuristics (same element type, key matching) to compute the minimum set of DOM mutations required to update the UI efficiently.",
  },
  {
    id: 29,
    question: "What is the Virtual DOM?",
    options: [
      "A server-side representation of the DOM",
      "A lightweight JavaScript object tree that mirrors the real DOM structure",
      "A browser API for fast DOM updates",
      "A shadow DOM technique used for styling isolation",
    ],
    correctIndex: 1,
    explanation:
      "The Virtual DOM is a lightweight in-memory representation of the real DOM. React creates this virtual tree, diffs it against the previous version when state/props change, and batches the minimal real DOM mutations — making UI updates efficient.",
  },
  // ── Error Boundaries ─────────────────────────────────────────────────────
  {
    id: 30,
    question: "What is a React Error Boundary?",
    options: [
      "A try/catch block inside a component",
      "A class component that catches JavaScript errors in its child component tree and displays a fallback UI",
      "A special React hook for error handling",
      "A network error handler for API calls",
    ],
    correctIndex: 1,
    explanation:
      "Error Boundaries are class components that implement componentDidCatch() and/or getDerivedStateFromError(). They catch rendering errors in child components and display fallback UI instead of crashing the entire app. Functional error boundaries are not natively supported yet.",
  },
  // ── React Router / Navigation ─────────────────────────────────────────────
  {
    id: 31,
    question: "What hook from React Router v6 gives you access to URL parameters?",
    options: [
      "useLocation()",
      "useNavigate()",
      "useParams()",
      "useHistory()",
    ],
    correctIndex: 2,
    explanation:
      "useParams() returns an object of key-value pairs of URL parameters. For example, in a route defined as /users/:id, useParams() gives you { id: '...' }. useHistory() was replaced by useNavigate() in React Router v6.",
  },
  {
    id: 32,
    question: "How do you programmatically navigate to a route in React Router v6?",
    options: [
      "window.location.href = '/path'",
      "this.props.history.push('/path')",
      "const navigate = useNavigate(); navigate('/path')",
      "router.go('/path')",
    ],
    correctIndex: 2,
    explanation:
      "In React Router v6, you use the useNavigate() hook to get the navigate function, then call navigate('/path'). The older history.push() API was removed in v6.",
  },
  // ── Performance Patterns ──────────────────────────────────────────────────
  {
    id: 33,
    question: "What is code splitting in React and why is it useful?",
    options: [
      "Splitting a component into multiple files for readability",
      "Lazily loading parts of your JavaScript bundle so only the needed code is loaded for the current page",
      "Breaking CSS into separate files",
      "Splitting state management across multiple stores",
    ],
    correctIndex: 1,
    explanation:
      "Code splitting (via React.lazy + Suspense, or dynamic import()) breaks your bundle into smaller chunks that are loaded on demand. This reduces initial load time because users only download the code needed for the current route/feature.",
  },
  {
    id: 34,
    question: "What is the role of `React.Suspense`?",
    options: [
      "To pause rendering until data fetching is complete",
      "To show a fallback UI while a lazily-loaded component or async data is being resolved",
      "To catch errors in child components",
      "To defer state updates to the next event loop",
    ],
    correctIndex: 1,
    explanation:
      "React.Suspense wraps components that may need to 'wait' (lazy loaded components, data fetching with use()). It shows the fallback prop UI while waiting and then renders the actual component once it's ready.",
  },
  {
    id: 35,
    question: "What does `React.lazy()` do?",
    options: [
      "It delays component rendering by a configurable amount of time",
      "It dynamically imports a component, allowing it to be loaded on demand (code splitting)",
      "It makes a component render less frequently",
      "It wraps async functions to work in React",
    ],
    correctIndex: 1,
    explanation:
      "React.lazy(() => import('./MyComponent')) lets you render a dynamically imported component as a regular one. It must be wrapped in <Suspense> to handle the loading state. This is the standard way to implement client-side code splitting.",
  },
  // ── Component Patterns ────────────────────────────────────────────────────
  {
    id: 36,
    question: "What is a Higher-Order Component (HOC) in React?",
    options: [
      "A component rendered above all others in the tree",
      "A function that takes a component and returns a new component with additional props or logic",
      "A class component that extends another component",
      "A component with more than 10 props",
    ],
    correctIndex: 1,
    explanation:
      "A Higher-Order Component (HOC) is a function: (WrappedComponent) => EnhancedComponent. It's a pattern for reusing component logic by wrapping a component and returning a new one with extra behavior (like withAuth, withTheme). React.memo and connect() from Redux are HOCs.",
  },
  {
    id: 37,
    question: "What is the Render Props pattern in React?",
    options: [
      "Passing JSX as children to a component",
      "A technique where a component receives a function as a prop and calls it to determine what to render",
      "Rendering a component based on a boolean prop",
      "Using conditional rendering with ternary operators",
    ],
    correctIndex: 1,
    explanation:
      "The Render Props pattern involves a component that accepts a function prop (often called `render` or `children`) and calls it to know what to render. This allows the component to share its internal state/behavior with arbitrary UI. Hooks have largely replaced this pattern.",
  },
  {
    id: 38,
    question: "What is a Custom Hook in React?",
    options: [
      "A hook built into React that you can customize",
      "A JavaScript function whose name starts with 'use' that calls other React hooks to extract and reuse stateful logic",
      "A component that wraps other hooks",
      "A hook that can only be used in class components",
    ],
    correctIndex: 1,
    explanation:
      "A custom hook is a regular JavaScript function starting with 'use' (e.g., useFetch, useLocalStorage) that can call React's built-in hooks. It extracts component logic into a reusable function, keeping components clean without needing HOCs or render props.",
  },
  // ── State Management ──────────────────────────────────────────────────────
  {
    id: 39,
    question: "What is 'lifting state up' in React?",
    options: [
      "Moving state from a child component to a common ancestor so it can be shared between siblings",
      "Using Redux instead of local state",
      "Moving state to the top of the component file",
      "Converting class-based state to hooks",
    ],
    correctIndex: 0,
    explanation:
      "Lifting state up means moving state to the lowest common ancestor of the components that need it. This allows sibling components to share the same state, controlled by the parent, maintaining the single source of truth principle.",
  },
  {
    id: 40,
    question: "What is the issue with deeply nested state objects and React's `useState`?",
    options: [
      "React cannot store objects in state",
      "You must create a new object reference when updating (immutable updates) or React won't detect the change",
      "Deep objects cause React to throw errors",
      "useState only supports primitive values",
    ],
    correctIndex: 1,
    explanation:
      "React uses reference equality to detect state changes. If you mutate a nested object directly (state.user.name = 'John'), React won't detect the change because the object reference is the same. You must spread and create a new object: setState({...state, user: {...state.user, name: 'John'}}).",
  },
  // ── Forms & Validation ────────────────────────────────────────────────────
  {
    id: 41,
    question: "In a controlled form input, what combination of props is required?",
    options: [
      "name and id",
      "value and onChange",
      "defaultValue and onSubmit",
      "type and placeholder",
    ],
    correctIndex: 1,
    explanation:
      "A controlled input requires both `value` (bound to state) and `onChange` (to update state when user types). Without `onChange`, the input will be read-only. Without `value`, it becomes uncontrolled.",
  },
  // ── Strict Mode ───────────────────────────────────────────────────────────
  {
    id: 42,
    question: "What does `React.StrictMode` do in development?",
    options: [
      "It prevents the app from rendering until all type checks pass",
      "It intentionally double-invokes certain functions (like render and useState initializers) to detect side effects, and warns about deprecated APIs",
      "It enables performance profiling",
      "It enforces TypeScript types in JSX",
    ],
    correctIndex: 1,
    explanation:
      "React.StrictMode is a development-only tool. It double-invokes render methods and effect setup/cleanup to detect and surface impure renders or side effects. It also warns about deprecated lifecycle methods and other issues. It has no effect in production.",
  },
  // ── Portals ───────────────────────────────────────────────────────────────
  {
    id: 43,
    question: "What is a React Portal used for?",
    options: [
      "Fetching data from external APIs",
      "Rendering a component's children into a different DOM node outside the parent hierarchy",
      "Creating a context provider",
      "Lazy loading a route",
    ],
    correctIndex: 1,
    explanation:
      "ReactDOM.createPortal(children, domNode) renders children into a different DOM node than the parent component — useful for modals, tooltips, and dropdowns that need to escape CSS overflow or z-index constraints, while still participating in React's event bubbling.",
  },
  // ── Hooks Rules ───────────────────────────────────────────────────────────
  {
    id: 44,
    question: "Which of the following is a rule for using React Hooks?",
    options: [
      "Hooks can be called inside loops, conditions, or nested functions",
      "Hooks must only be called at the top level of a function component, not inside conditions or loops",
      "Hooks can only be used in class components",
      "You can only use one hook per component",
    ],
    correctIndex: 1,
    explanation:
      "The Rules of Hooks state: (1) Only call hooks at the top level — never inside loops, conditions, or nested functions; (2) Only call hooks from React function components or custom hooks. This ensures hooks are called in the same order every render.",
  },
  {
    id: 45,
    question: "Can you call hooks inside a regular JavaScript function (not a React component or custom hook)?",
    options: [
      "Yes, hooks work anywhere",
      "No — hooks can only be called from React functional components or other custom hooks",
      "Yes, if you import React at the top",
      "Yes, but only useState and useEffect",
    ],
    correctIndex: 1,
    explanation:
      "Hooks must only be called from React function components or custom hooks (functions starting with 'use'). Calling hooks inside regular JavaScript functions, event handlers, class components, or outside React violates the Rules of Hooks.",
  },
  // ── React 18 Features ─────────────────────────────────────────────────────
  {
    id: 46,
    question: "What is Concurrent Rendering in React 18?",
    options: [
      "Rendering multiple apps on the same page simultaneously",
      "The ability for React to pause, resume, or abandon renders to prioritize urgent UI updates",
      "Rendering components in parallel web workers",
      "Server-side rendering with multiple threads",
    ],
    correctIndex: 1,
    explanation:
      "Concurrent Rendering (React 18) allows React to work on multiple versions of the UI simultaneously. It can interrupt and resume renders, prioritizing urgent updates (like user input) over less urgent ones (like data loading), leading to more responsive UIs.",
  },
  {
    id: 47,
    question: "What does the `useTransition` hook do in React 18?",
    options: [
      "It adds CSS transition animations to component mounts",
      "It marks state updates as non-urgent, allowing React to keep the UI responsive while processing them",
      "It manages routing transitions between pages",
      "It defers effect execution to after the browser paint",
    ],
    correctIndex: 1,
    explanation:
      "useTransition() returns [isPending, startTransition]. Wrapping a state update in startTransition marks it as non-urgent. React will render urgent updates (like the current input value) first, then process the transition update when the browser is idle.",
  },
  // ── Batching ──────────────────────────────────────────────────────────────
  {
    id: 48,
    question: "What is automatic batching in React 18?",
    options: [
      "React automatically groups all state updates (even in setTimeout, promises, and native events) into a single re-render",
      "React automatically sorts state updates by priority",
      "React automatically creates batches of components for lazy loading",
      "React pre-batches data from APIs before setting state",
    ],
    correctIndex: 0,
    explanation:
      "React 18 introduced automatic batching: multiple state updates anywhere (including inside setTimeout, Promises, or native event handlers) are grouped into a single re-render. In React 17, this only happened inside React event handlers.",
  },
  // ── Composition ───────────────────────────────────────────────────────────
  {
    id: 49,
    question: "What is composition in React and why is it preferred over inheritance?",
    options: [
      "Composition means extending a base component class",
      "Composition means building complex UIs by combining smaller, reusable components — React recommends this over class inheritance for code reuse",
      "Composition means writing multiple components in the same file",
      "Composition is the process of merging prop objects",
    ],
    correctIndex: 1,
    explanation:
      "React recommends composition over inheritance. Composition means building UIs by nesting and combining components (e.g., using the `children` prop or specialized props). This is more flexible and avoids the pitfalls of deep inheritance hierarchies.",
  },
  // ── Fragment ──────────────────────────────────────────────────────────────
  {
    id: 50,
    question: "What is the purpose of React Fragments (`<>...</>`)?",
    options: [
      "To add CSS classes to multiple elements at once",
      "To group multiple elements without adding an extra DOM node to the output",
      "To create isolated rendering contexts",
      "To delay rendering of child components",
    ],
    correctIndex: 1,
    explanation:
      "React Fragments (<> </> or <React.Fragment>) let you group multiple elements without adding an extra <div> or other container to the real DOM. This keeps the DOM cleaner and avoids layout issues caused by unnecessary wrappers.",
  },
  // ── Conditional Rendering ─────────────────────────────────────────────────
  {
    id: 51,
    question: "Which of the following correctly conditionally renders a component?",
    options: [
      "if (show) { return <Component /> } else {}",
      "{show && <Component />}",
      "{show ? <Component /> : undefined}",
      "Both B and C are correct",
    ],
    correctIndex: 3,
    explanation:
      "Both `{show && <Component />}` (short-circuit evaluation) and `{show ? <Component /> : undefined}` are valid React patterns for conditional rendering. The ternary is preferred when you also need a fallback; && is more concise for show/hide cases.",
  },
  // ── Children Prop ─────────────────────────────────────────────────────────
  {
    id: 52,
    question: "What is `props.children` in React?",
    options: [
      "An array of all child component instances",
      "The JSX content nested between a component's opening and closing tags when it is used",
      "A list of DOM child nodes",
      "Child component state values",
    ],
    correctIndex: 1,
    explanation:
      "props.children is a special prop that contains whatever JSX is placed between the component's opening and closing tags. It can be a single element, multiple elements, a string, or even a function (in render props pattern).",
  },
  // ── forwardRef ────────────────────────────────────────────────────────────
  {
    id: 53,
    question: "What is `React.forwardRef()` used for?",
    options: [
      "To forward a component's props to its children",
      "To allow a parent component to attach a ref to a DOM node or child component instance",
      "To pass context values to nested components",
      "To defer component rendering",
    ],
    correctIndex: 1,
    explanation:
      "React.forwardRef() wraps a component so it can accept a ref prop and pass it down to a DOM element or another component. Without forwardRef, passing a ref as a prop doesn't work because refs are handled specially by React.",
  },
  // ── Server vs Client Components ────────────────────────────────────────────
  {
    id: 54,
    question: "What is the main benefit of Server Components (introduced in React 18/Next.js App Router)?",
    options: [
      "They can use all React hooks freely",
      "They run on the server, fetch data without API overhead, and send zero JavaScript to the client",
      "They replace Redux for state management",
      "They enable real-time two-way data binding",
    ],
    correctIndex: 1,
    explanation:
      "React Server Components execute on the server only, meaning their code never ships to the client bundle. They can directly access databases and file systems, reducing client-side JavaScript and improving performance. However, they cannot use hooks or browser APIs.",
  },
  // ── Immutability ──────────────────────────────────────────────────────────
  {
    id: 55,
    question: "Why is immutability important in React state management?",
    options: [
      "React requires all data to be frozen objects",
      "Immutability enables React to detect state changes via reference equality, making re-renders predictable and efficient",
      "Immutable objects use less memory",
      "React's Virtual DOM only works with immutable data",
    ],
    correctIndex: 1,
    explanation:
      "React compares previous and new state by reference (===). If you mutate state directly, the reference doesn't change, so React won't detect a change and won't re-render. Creating new objects/arrays on each update ensures React picks up the change.",
  },
  // ── PropTypes ─────────────────────────────────────────────────────────────
  {
    id: 56,
    question: "What is the purpose of PropTypes in React?",
    options: [
      "To enforce TypeScript types at compile time",
      "To validate the type and shape of props passed to a component at runtime (development only)",
      "To automatically generate prop documentation",
      "To restrict what props a component can accept",
    ],
    correctIndex: 1,
    explanation:
      "PropTypes is a runtime type-checking library for React props (development only). It logs console warnings when a component receives props of the wrong type. It's a lighter alternative to TypeScript for prop validation.",
  },
  // ── useLayoutEffect ───────────────────────────────────────────────────────
  {
    id: 57,
    question: "What is the difference between `useEffect` and `useLayoutEffect`?",
    options: [
      "useLayoutEffect runs before the component renders; useEffect runs after",
      "useEffect fires asynchronously after the browser has painted; useLayoutEffect fires synchronously after DOM mutations but before the browser paints",
      "useLayoutEffect is only available in class components",
      "They are identical — useLayoutEffect is an alias",
    ],
    correctIndex: 1,
    explanation:
      "useEffect is asynchronous and fires after the browser has painted. useLayoutEffect fires synchronously after all DOM mutations but before the browser paints — useful for measuring DOM nodes or preventing visual flickers. Prefer useEffect unless you need synchronous DOM reading.",
  },
  // ── Synthetic Events ──────────────────────────────────────────────────────
  {
    id: 58,
    question: "What are Synthetic Events in React?",
    options: [
      "Custom events created with CustomEvent API",
      "A cross-browser wrapper around the browser's native events with the same interface",
      "Events triggered programmatically via code",
      "Events that only fire in server-side rendering",
    ],
    correctIndex: 1,
    explanation:
      "React wraps browser native events in Synthetic Events — cross-browser compatible event objects that have the same interface (preventDefault, stopPropagation, etc.) regardless of the browser. In React 17+, they no longer pool event objects.",
  },
  // ── Derived State ─────────────────────────────────────────────────────────
  {
    id: 59,
    question: "What is 'derived state' in React and what is the recommended approach?",
    options: [
      "State copied from an API response — always store it in useState",
      "State that can be computed from existing state or props — it should be calculated during render rather than stored in state",
      "State inherited from a parent component",
      "State that is derived from localStorage",
    ],
    correctIndex: 1,
    explanation:
      "Derived state is data that can be computed from existing state or props. Instead of duplicating it in state (which can get out of sync), compute it during render or with useMemo. Storing derived state leads to bugs and the 'antipattern of derived state from props'.",
  },
  // ── Component Tree ────────────────────────────────────────────────────────
  {
    id: 60,
    question: "What is the correct order of mounting lifecycle equivalents in React functional components?",
    options: [
      "useEffect(cleanup) → render → useEffect(setup)",
      "render → useEffect(setup)",
      "useEffect(setup) → render → useEffect(cleanup)",
      "render → useLayoutEffect → useEffect",
    ],
    correctIndex: 1,
    explanation:
      "In React functional components on initial mount: the component renders (returns JSX) → the DOM is updated → useLayoutEffect runs → the browser paints → useEffect runs. On unmount, the cleanup functions of effects run. There is no separate 'mounting' phase like class components.",
  },
];

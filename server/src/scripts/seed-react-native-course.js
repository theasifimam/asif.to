import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SITE_URL = "https://asif.to";
const COURSE_SLUG = "react-native";
const courseData = {
  slug: COURSE_SLUG,
  title: "React Native: Ship Apps Without Losing Your Mind 📱",
  subtitle: "A practical React Native course for building iOS and Android apps with Expo, navigation, APIs, native features, and enough debugging to survive Monday.",
  seoTitle: "React Native Course: Build iOS & Android Apps | asif.to",
  seoDescription: "Learn React Native with Expo, components, navigation, APIs, storage, permissions, debugging, and a real cross-platform app project.",
  keywords: ["React Native", "Expo", "mobile development", "iOS", "Android", "JavaScript", "TypeScript"],
  canonicalUrl: `${SITE_URL}/courses/${COURSE_SLUG}`,
  techId: "react-native",
  level: "Beginner - Intermediate",
  duration: "Self-paced (12+ hours)",
  learningOutcomes: [
    "Build cross-platform mobile interfaces with React Native and Expo",
    "Use components, styling, lists, forms, gestures, and responsive layouts",
    "Navigate between screens and manage real app state",
    "Fetch API data, handle loading states, errors, caching, and offline moments",
    "Use device capabilities such as storage, images, notifications, and permissions",
    "Debug, test, build, and ship a polished mobile app",
  ],
  order: 12,
  status: "published",
  examEnabled: false,
};

const brandNote = "---\n✨ **Keep building:** find more practical tutorials and dev rabbit holes on [asif.to](https://asif.to). Your app can have a dark mode and a personality. It cannot have 47 console.logs in production. 😌";

const chapters = [
  {
    slug: "react-native-setup-expo-and-the-mobile-mental-model",
    title: "1. Welcome to Mobile: Expo Does the Setup Drama for You 📱",
    summary: "Understand React Native, Expo, the mobile runtime, and the fastest way to get a real app running.",
    content: [
      "## React Native, but make it mobile",
      "React Native lets you build iOS and Android interfaces with React and JavaScript or TypeScript. You write components; React Native maps them to real native views. Same React brain, new platform rules. The browser is no longer your emotional support rectangle. 😭",
      "## Expo is the sensible starting point",
      "Expo gives you a friendly toolchain for creating, running, debugging, and shipping React Native apps. Start with `npx create-expo-app@latest`, then run `npx expo start`. Scan the QR code with Expo Go and you are officially a mobile developer now. Please remain humble.",
      "## The mental model",
      "There is no DOM, no `div`, and no CSS file floating around waiting to save you. Use `View`, `Text`, `Pressable`, `Image`, and `ScrollView`. Styling is JavaScript objects with familiar names and a few platform-specific plot twists.",
      brandNote,
    ],
    codeSnippets: [{ title: "Create and run the app", language: "bash", code: `npx create-expo-app@latest pocket-pal\ncd pocket-pal\nnpx expo start` }],
    tryItChallenge: "Create an Expo app, change its first heading, and run it on a phone or simulator. Take the victory screenshot before the cache starts acting suspicious.",
  },
  {
    slug: "react-native-components-and-styling",
    title: "2. Components & Styling: No divs Were Harmed 🎨",
    summary: "Build clean mobile layouts with core components, StyleSheet, Flexbox, spacing, colors, and reusable UI.",
    content: [
      "## The component starter pack",
      "`View` is your layout container, `Text` renders text, `Image` renders images, and `Pressable` handles touch interactions. Use components for meaning, not one giant file called `App-final-final-2.jsx`.",
      "## Flexbox, but with opinions",
      "React Native uses Flexbox by default with `flexDirection: column`. That means your row is not a row until you say so. `gap`, `padding`, `margin`, `alignItems`, and `justifyContent` will carry most layouts while your old CSS assumptions quietly leave the chat.",
      "## Make reusable UI",
      "Extract repeated cards, buttons, and labels into components. A design system can start as three constants and a button. It does not need a 90-page Figma file to be useful.",
      brandNote,
    ],
    codeSnippets: [{ title: "A friendly card", language: "tsx", code: `import { StyleSheet, Text, View } from "react-native";\n\nexport function CourseCard() {\n  return (\n    <View style={styles.card}>\n      <Text style={styles.eyebrow}>TODAY'S QUEST</Text>\n      <Text style={styles.title}>Ship the tiny feature.</Text>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: { padding: 20, borderRadius: 24, backgroundColor: "#121215" },\n  eyebrow: { color: "#60a5fa", fontSize: 12, fontWeight: "700" },\n  title: { marginTop: 8, color: "#fff", fontSize: 22, fontWeight: "800" },\n});` }],
    tryItChallenge: "Build a reusable asif.to-inspired course card with a blue accent, rounded corners, a title, and a sarcastic micro-copy line.",
  },
  {
    slug: "react-native-navigation-and-screen-state",
    title: "3. Navigation: Because One Screen Is Not a Product 🧭",
    summary: "Create stacks, tabs, route parameters, and screen state without turning navigation into a haunted maze.",
    content: [
      "## Screens need addresses",
      "Use Expo Router or React Navigation to move between screens. A home screen, detail screen, and settings screen are already a small product. A single screen with twelve modals is a cry for help.",
      "## Route data and screen state",
      "Pass identifiers through routes, load the matching data in the destination screen, and keep transient UI state local. Keep global state for genuinely shared concerns such as authentication, theme, or a cart.",
      "## Loading is a state, not a personality",
      "Every screen that fetches data should handle loading, success, empty, and error states. The blank screen is not minimalist design; it is a bug wearing black jeans.",
      brandNote,
    ],
    codeSnippets: [{ title: "Expo Router navigation", language: "tsx", code: `import { Link, router } from "expo-router";\n\n<Link href={{ pathname: "/lesson/[id]", params: { id: "navigation" } }}>\n  Open lesson\n</Link>\n\nrouter.push("/settings");` }],
    tryItChallenge: "Create a home screen and a lesson detail screen. Pass a lesson id through navigation and display it on the detail screen.",
  },
  {
    slug: "react-native-lists-forms-and-inputs",
    title: "4. Lists & Forms: Let Users Tap Things Responsibly ✅",
    summary: "Render performant lists, build friendly forms, validate input, and make the keyboard less chaotic.",
    content: [
      "## FlatList is your list bestie",
      "Use `FlatList` for long or dynamic collections instead of mapping everything inside a `ScrollView`. Give rows stable keys, keep renderers small, and avoid recalculating the universe on every keystroke.",
      "## Forms need boundaries",
      "Track values, validate before submitting, show useful errors, and disable the submit button while work is in progress. A button that submits six times is not enthusiastic; it is a backend incident.",
      "## Keyboard-aware UX",
      "Use `KeyboardAvoidingView`, sensible input types, and a dismiss action. Test on a small phone because your giant simulator is lying to you about available space.",
      brandNote,
    ],
    codeSnippets: [{ title: "A tiny FlatList", language: "tsx", code: `<FlatList\n  data={lessons}\n  keyExtractor={(lesson) => lesson.id}\n  renderItem={({ item }) => (\n    <Pressable onPress={() => openLesson(item.id)}>\n      <Text>{item.title}</Text>\n    </Pressable>\n  )}\n/>` }],
    tryItChallenge: "Build a searchable lesson list with an empty state and a form that adds a new lesson only when the title is valid.",
  },
  {
    slug: "react-native-api-data-and-error-states",
    title: "5. APIs: Fetch Data, Not Emotional Damage 🌐",
    summary: "Connect a mobile app to an API with typed data, loading states, retries, and errors humans can understand.",
    content: [
      "## Network calls are strangers",
      "Treat every request as unreliable. The user may be offline, the server may be sleepy, or the API may return a surprise shape because apparently schemas are optional in some universes.",
      "## A useful request lifecycle",
      "Model `loading`, `data`, and `error`. Cancel or ignore stale requests when screens unmount, and show a retry action instead of a dead end. Good error UI turns panic into a button.",
      "## Keep secrets out of the app",
      "Anything shipped to a phone can be inspected. Put privileged API keys and business logic on your server. Mobile environment variables are configuration, not a vault guarded by dragons.",
      brandNote,
    ],
    codeSnippets: [{ title: "Simple request state", language: "tsx", code: `const [state, setState] = useState({ loading: true, data: null, error: null });\n\nasync function loadLessons() {\n  setState({ loading: true, data: null, error: null });\n  try {\n    const response = await fetch("https://api.example.com/lessons");\n    if (!response.ok) throw new Error("Could not load lessons");\n    setState({ loading: false, data: await response.json(), error: null });\n  } catch (error) {\n    setState({ loading: false, data: null, error });\n  }\n}` }],
    tryItChallenge: "Connect your lesson screen to a public or local API and build loading, empty, error, and retry states.",
  },
  {
    slug: "react-native-storage-device-features-and-permissions",
    title: "6. Device Features: Ask Nicely Before Taking the Camera 📸",
    summary: "Use storage, images, permissions, and device APIs without surprising users or making the OS judge you.",
    content: [
      "## Native features need permission",
      "Camera, photos, location, notifications, and contacts are sensitive. Explain why you need access before asking, handle denial gracefully, and let users continue when the feature is optional.",
      "## Local storage is useful, not magical",
      "Persist preferences, drafts, and small caches with a suitable storage library. Never store passwords or tokens in plain text. If the data would ruin your day when leaked, use secure storage and a server-side strategy.",
      "## Test the boring paths",
      "Test permission denied, permission revoked, no network, low storage, and the app reopening after a week. The happy path is doing unpaid marketing for your app; edge cases are the actual job.",
      brandNote,
    ],
    codeSnippets: [{ title: "Ask for a permission", language: "tsx", code: `const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();\n\nif (status !== "granted") {\n  Alert.alert("Photos permission needed", "You can still browse lessons without choosing a photo.");\n  return;\n}` }],
    tryItChallenge: "Add a profile avatar picker with a friendly permission explanation and a fallback avatar when access is denied.",
  },
  {
    slug: "react-native-debugging-performance-and-testing",
    title: "7. Debugging: The Bug Is Not ‘Probably React’ 🐛",
    summary: "Debug layouts, renders, network calls, and performance issues with a process instead of vibes.",
    content: [
      "## Reproduce before philosophizing",
      "Write down the device, steps, expected result, actual result, and logs. Then isolate the smallest failing component. Guessing is fun for horoscopes, less so for production bugs.",
      "## Performance basics",
      "Use stable keys, avoid unnecessary state, memoize only after measuring, and keep expensive work away from render. A 400-line component is not automatically slow, but it is definitely asking for a meeting.",
      "## Test behavior",
      "Test what the user can do: tap, type, submit, retry, and navigate. Unit tests are useful, but a small set of focused interaction tests catches the bugs users actually experience.",
      brandNote,
    ],
    codeSnippets: [{ title: "Render only what changed", language: "tsx", code: `const LessonRow = memo(function LessonRow({ lesson, onOpen }) {\n  return (\n    <Pressable onPress={() => onOpen(lesson.id)}>\n      <Text>{lesson.title}</Text>\n    </Pressable>\n  );\n});` }],
    tryItChallenge: "Take a deliberately broken screen, reproduce the issue, identify the smallest cause, fix it, and write one test for the behavior.",
  },
  {
    slug: "react-native-build-and-release-checklist",
    title: "8. Ship It: App Stores Are the Final Boss 🚀",
    summary: "Prepare icons, metadata, builds, environment configuration, and a release checklist for real users.",
    content: [
      "## A build is not a launch",
      "Before release, verify app name, icons, splash screen, version, permissions text, deep links, API URLs, analytics, and crash reporting. ‘It worked on my phone’ is a classic, not a strategy.",
      "## Development and production are different roommates",
      "Use separate environment configuration and backend behavior. Never point a production build at a local machine unless your business model is selling confusion.",
      "## Release small, learn quickly",
      "Ship a focused first version, watch errors and feedback, and improve from evidence. A small app that works beats a giant roadmap that exists only in Notion.",
      brandNote,
    ],
    codeSnippets: [{ title: "Build with Expo", language: "bash", code: `npx expo-doctor\nnpx eas build:configure\nnpx eas build --platform all\nnpx eas submit --platform all` }],
    tryItChallenge: "Create a release checklist for your app, run Expo Doctor, produce a preview build, and test it on a physical device.",
  },
  {
    slug: "react-native-typescript-and-project-architecture",
    title: "9. TypeScript: Put the Types Somewhere Useful 🧠",
    summary: "Add TypeScript to a React Native app, model API data, type navigation and props, and organize a codebase that can grow.",
    content: [
      "## JavaScript is fast; TypeScript is a helpful bouncer",
      "TypeScript checks your code before the app runs. It catches misspelled props, impossible states, and API assumptions while the bug is still cheap. It does not make your app correct by magic, but it does make many incorrect ideas uncomfortable earlier.",
      "## Type the boundaries first",
      "Start with component props, navigation params, form values, and API responses. Those are the places where data crosses from one part of the app into another. Avoid typing every local variable just to make the editor feel employed.",
      "## A scalable mobile structure",
      "A practical structure might use `app/` for routes, `components/` for shared UI, `features/` for domain modules, `lib/` for API and storage clients, and `types/` for shared contracts. Organize around user features instead of creating one folder called `utils-final`.",
      "## Runtime validation still matters",
      "TypeScript types disappear at runtime. If an API can be wrong, validate its response with Zod or a similar schema library. The compiler protects your code; runtime validation protects your users from the backend having a weird day.",
      brandNote,
    ],
    codeSnippets: [{ title: "Typed component and API model", language: "ts", code: `export type Lesson = {\n  id: string;\n  title: string;\n  durationMinutes: number;\n  completed: boolean;\n};\n\ntype LessonCardProps = {\n  lesson: Lesson;\n  onOpen: (id: string) => void;\n};\n\nexport function LessonCard({ lesson, onOpen }: LessonCardProps) {\n  return (\n    <Pressable onPress={() => onOpen(lesson.id)}>\n      <Text>{lesson.title}</Text>\n    </Pressable>\n  );\n}` }],
    tryItChallenge: "Convert a lesson list to TypeScript. Type its props, API response, navigation params, and form values. Add one intentional type error and fix it.",
  },
  {
    slug: "react-native-expo-router-deep-links-and-tabs",
    title: "10. Expo Router: Navigation Without the Ancient Rituals 🗺️",
    summary: "Build file-based routes, stacks, tabs, layouts, protected screens, dynamic routes, and deep links with Expo Router.",
    content: [
      "## File-based routing",
      "Expo Router turns files into routes. `app/index.tsx` becomes the home screen, `app/settings.tsx` becomes settings, and `app/lesson/[id].tsx` becomes a dynamic lesson route. The filesystem is now doing product management. Please name files like you mean it.",
      "## Layouts control navigation chrome",
      "Use `_layout.tsx` to define a Stack, Tabs, or shared providers. Keep route groups such as `(auth)` and `(app)` for organization without adding them to the URL. Put navigation decisions near the routes that own them.",
      "## Auth and protected routes",
      "Load the session in a provider, show a loading state while it is unknown, and redirect only after the session is resolved. Redirecting too early causes flicker; redirecting nowhere creates a premium app called ‘Access Denied’.",
      "## Deep links and params",
      "Dynamic routes let users open a specific lesson from a notification, email, or web link. Validate route params before fetching data and handle missing records with a useful not-found state.",
      brandNote,
    ],
    codeSnippets: [{ title: "Tabs with a protected app group", language: "tsx", code: `// app/(app)/_layout.tsx\nimport { Tabs } from "expo-router";\n\nexport default function AppLayout() {\n  return (\n    <Tabs>\n      <Tabs.Screen name="index" options={{ title: "Learn" }} />\n      <Tabs.Screen name="progress" options={{ title: "Progress" }} />\n      <Tabs.Screen name="settings" options={{ title: "Settings" }} />\n    </Tabs>\n  );\n}\n\n// app/lesson/[id].tsx\nexport default function LessonScreen() {\n  const { id } = useLocalSearchParams<{ id: string }>();\n  return <LessonDetail lessonId={id} />;\n}` }],
    tryItChallenge: "Create an Expo Router app with an auth group, tab navigation, a dynamic lesson route, and a deep link that opens a lesson by id.",
  },
  {
    slug: "react-native-tanstack-query-server-state",
    title: "11. TanStack Query: Stop Fetching in Every Component 🌊",
    summary: "Use TanStack Query for server state, caching, refetching, mutations, optimistic updates, and offline-aware mobile data.",
    content: [
      "## Server state is not local state",
      "Data owned by your API has a different lifecycle from a modal being open. TanStack Query handles caching, stale data, loading, retries, refetching, and request deduplication so your components can focus on displaying the data.",
      "## Query keys are contracts",
      "A query key such as `[\"lessons\", courseId]` identifies cached data. Include every value that changes the result. If the key is wrong, the app will confidently show the wrong data, which is honestly worse than a spinner.",
      "## Mutations and invalidation",
      "After completing a lesson, run a mutation and invalidate the related progress queries. For instant feedback, use an optimistic update with rollback when the server rejects the change.",
      "## Mobile network reality",
      "Configure retry behavior thoughtfully, refetch when the app becomes active, and provide pull-to-refresh. A phone can lose connectivity between two taps because the universe enjoys testing your error handling.",
      brandNote,
    ],
    codeSnippets: [{ title: "Query and mutation", language: "tsx", code: `const lessonsQuery = useQuery({\n  queryKey: ["lessons", courseId],\n  queryFn: () => api.getLessons(courseId),\n});\n\nconst queryClient = useQueryClient();\nconst completeLesson = useMutation({\n  mutationFn: (lessonId: string) => api.completeLesson(lessonId),\n  onSuccess: () => {\n    queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });\n    queryClient.invalidateQueries({ queryKey: ["progress"] });\n  },\n});` }],
    tryItChallenge: "Replace manual lesson loading state with TanStack Query. Add a complete-lesson mutation, cache invalidation, pull-to-refresh, and a retry button.",
  },
  {
    slug: "react-native-zustand-global-state",
    title: "12. Zustand: Global State Without Building a Parliament 🐻",
    summary: "Manage small, predictable pieces of global state with Zustand, persistence, selectors, and clean separation from server data.",
    content: [
      "## When global state earns its rent",
      "Use global state for concerns shared across distant screens: theme, onboarding completion, a draft cart, or a signed-in session snapshot. Do not put every input field in a global store because one component looked at it once.",
      "## Zustand’s small-store model",
      "A Zustand store is a hook with state and actions. Components subscribe to the slice they need, which keeps updates focused. Actions should describe user intent, not expose random setters like a public API with no documentation.",
      "## Persistence and hydration",
      "Persist only safe, necessary data. Hydration is asynchronous, so show a boot state before deciding whether to redirect or render the app. Secure tokens belong in SecureStore, not in a casually persisted JSON blob.",
      "## Store boundaries",
      "Keep server data in TanStack Query and client preferences in Zustand. Two tools can coexist peacefully when each owns a clear job. The real villain is duplicated sources of truth.",
      brandNote,
    ],
    codeSnippets: [{ title: "A focused Zustand store", language: "ts", code: `import { create } from "zustand";\n\ntype ThemeStore = {\n  mode: "light" | "dark";\n  toggle: () => void;\n};\n\nexport const useThemeStore = create<ThemeStore>((set) => ({\n  mode: "dark",\n  toggle: () => set((state) => ({\n    mode: state.mode === "dark" ? "light" : "dark",\n  })),\n}));\n\nconst mode = useThemeStore((state) => state.mode);` }],
    tryItChallenge: "Create a persisted theme and onboarding store. Add a hydration state and make sure components subscribe only to the values they render.",
  },
  {
    slug: "react-native-react-hook-form-zod-validation",
    title: "13. Forms with React Hook Form + Zod: Validation That Has Receipts 🧾",
    summary: "Build performant typed forms with React Hook Form, validate with Zod, show field errors, and submit safely.",
    content: [
      "## Why form libraries exist",
      "Forms have values, touched fields, dirty state, validation, submission, server errors, and keyboard behavior. You can manage it all manually, but so can you assemble a bicycle from raw metal. React Hook Form gives you a focused foundation with fewer rerenders.",
      "## One schema, multiple benefits",
      "Define a Zod schema for the form, infer its TypeScript type, and use the same rules at the boundary. Validate email format, password length, required fields, and cross-field rules before making a request.",
      "## Errors should help users recover",
      "Put the error next to the field, use accessible labels, focus the first invalid input when practical, and translate server errors into human language. ‘Invalid payload’ is a message from a server, not a user experience.",
      "## Submission is a state machine",
      "Disable duplicate submissions, show progress, handle server failure, and clear or navigate only after success. The form should make it obvious what happened without requiring detective work.",
      brandNote,
    ],
    codeSnippets: [{ title: "Typed form schema", language: "tsx", code: `const schema = z.object({\n  email: z.string().email("Enter a valid email"),\n  password: z.string().min(8, "Use at least 8 characters"),\n});\n\ntype LoginValues = z.infer<typeof schema>;\n\nconst { control, handleSubmit, formState: { errors, isSubmitting } } =\n  useForm<LoginValues>({ resolver: zodResolver(schema) });\n\nconst onSubmit = handleSubmit(async (values) => {\n  await signIn(values);\n});` }],
    tryItChallenge: "Build a typed sign-in form with email and password validation, server error handling, duplicate-submit protection, and a keyboard-friendly layout.",
  },
  {
    slug: "react-native-nativewind-design-system",
    title: "14. NativeWind: Tailwind Energy, Mobile Rules ⚡",
    summary: "Style React Native with NativeWind, build tokens and variants, and keep the asif.to aesthetic consistent across screens.",
    content: [
      "## Utility styling on native components",
      "NativeWind brings Tailwind-style classes to React Native. You still need to understand native layout and platform limitations, but utility classes make spacing and repeated visual decisions quick to scan.",
      "## Build tokens before vibes",
      "Define a small palette, spacing scale, radii, and typography hierarchy. For an asif.to-inspired UI, think deep ink surfaces, soft zinc borders, electric blue accents, generous rounded corners, and restrained shadows.",
      "## Variants beat class soup",
      "Create a Button component with variants such as primary, secondary, and destructive. Consumers should express intent; they should not rebuild twelve utility classes every time a button appears.",
      "## Dark mode is a product feature",
      "Check contrast, pressed states, disabled states, and empty states in both themes. Dark mode is not ‘replace white with black and pray’.",
      brandNote,
    ],
    codeSnippets: [{ title: "A branded button", language: "tsx", code: `export function Button({ label, variant = "primary", onPress }) {\n  const styles = variant === "primary"\n    ? "rounded-2xl bg-blue-600 px-5 py-3"\n    : "rounded-2xl border border-zinc-700 px-5 py-3";\n\n  return (\n    <Pressable className={styles} onPress={onPress}>\n      <Text className="text-center font-bold text-white">{label}</Text>\n    </Pressable>\n  );\n}` }],
    tryItChallenge: "Create a small mobile design system with Button, Card, Text, and Badge components. Add light/dark variants and a visual screen that uses only those primitives.",
  },
  {
    slug: "react-native-reanimated-gesture-handler-animations",
    title: "15. Reanimated & Gestures: Make It Move Without Making It Janky 🌀",
    summary: "Use Reanimated and Gesture Handler for smooth press, drag, swipe, and layout interactions that run well on devices.",
    content: [
      "## Why animation libraries matter",
      "JavaScript-driven animations can stutter when the JS thread is busy. Reanimated moves animation work closer to the UI thread, which makes gestures and transitions feel responsive when implemented correctly.",
      "## Shared values and animated styles",
      "A shared value changes over time; an animated style maps that value to a view. Keep the animation calculation small and use timing or spring physics intentionally. Not every card needs to launch itself into orbit.",
      "## Gesture Handler is the touch translator",
      "Use pan, tap, long press, and native gestures for interactions such as draggable cards, swipe actions, and bottom sheets. Define what happens when the gesture starts, updates, ends, or fails.",
      "## Accessibility and motion preferences",
      "Animations must not block essential actions. Provide clear pressed states, respect reduced-motion preferences where possible, and make sure the screen still makes sense when the animation is removed.",
      brandNote,
    ],
    codeSnippets: [{ title: "Press scale animation", language: "tsx", code: `const scale = useSharedValue(1);\nconst animatedStyle = useAnimatedStyle(() => ({\n  transform: [{ scale: scale.value }],\n}));\n\n<Pressable\n  onPressIn={() => { scale.value = withSpring(0.96); }}\n  onPressOut={() => { scale.value = withSpring(1); }}\n>\n  <Animated.View style={animatedStyle}>\n    <LessonCard />\n  </Animated.View>\n</Pressable>` }],
    tryItChallenge: "Build a pressable course card with a subtle spring scale, then add a swipe-to-complete interaction with a clear non-gesture fallback.",
  },
  {
    slug: "react-native-expo-device-modules",
    title: "16. Expo Modules: Camera, Images, Notifications & Secure Storage 🔐",
    summary: "Use Expo ImagePicker, Camera, Notifications, SecureStore, Location, and Linking with permissions and fallbacks.",
    content: [
      "## Expo is more than a starter command",
      "Expo Modules give you access to device capabilities without writing native Swift or Kotlin for every feature. Image selection, camera capture, haptics, notifications, location, secure storage, and linking are all common production needs.",
      "## Permissions are a conversation",
      "Request permission at the moment it makes sense, explain the benefit first, and handle denial. Never block the entire app because a user said no to notifications. The user is allowed to have boundaries; shocking, I know.",
      "## SecureStore has a specific job",
      "Use `expo-secure-store` for small secrets such as refresh tokens. Use regular storage for non-sensitive preferences. Secure storage is not a database and should not become one because someone wanted to save a 4 MB profile.",
      "## Notifications need architecture",
      "Handle permission, device tokens, notification listeners, foreground behavior, background taps, and deep-link routing. Test a cold launch from a notification because that is where the app likes to become philosophical.",
      brandNote,
    ],
    codeSnippets: [{ title: "Secure token storage", language: "tsx", code: `import * as SecureStore from "expo-secure-store";\n\nexport async function saveSession(token: string) {\n  await SecureStore.setItemAsync("session-token", token);\n}\n\nexport function readSession() {\n  return SecureStore.getItemAsync("session-token");\n}` }],
    tryItChallenge: "Add a profile photo picker, secure session storage, and a notification that deep-links to a lesson. Test permission denial and cold-start behavior.",
  },
  {
    slug: "react-native-eas-build-updates-and-submission",
    title: "17. EAS: Build, Update, Submit, Repeat 🚢",
    summary: "Use EAS Build, Submit, and Update with profiles, environment variables, app versions, and a release workflow.",
    content: [
      "## EAS Build is your cloud build room",
      "EAS Build creates installable Android and iOS binaries with the native configuration your app needs. Configure development, preview, and production profiles so you do not accidentally ship a debug build wearing a tiny moustache.",
      "## Environment variables are part of the build",
      "Separate public configuration from secrets. Public API URLs may be embedded in a mobile bundle; private server credentials must never be. Verify the active profile before building because a production app pointing at staging is a particularly expensive screenshot.",
      "## EAS Update for JavaScript changes",
      "EAS Update can deliver compatible JavaScript and asset changes without a full store submission. Use runtime versions and release channels carefully, and never deliver JavaScript that expects native code unavailable in the installed binary.",
      "## A professional release loop",
      "Run checks, build a preview, test on real devices, submit to internal testing, monitor crashes, then promote. Keep changelogs short and honest. ‘Various improvements’ is what people write when the release had a fight with reality.",
      brandNote,
    ],
    codeSnippets: [{ title: "Typical EAS workflow", language: "bash", code: `eas build:configure\neas build --profile preview --platform all\neas submit --profile production --platform all\neas update --branch production --message "Improve lesson progress"` }],
    tryItChallenge: "Create development, preview, and production profiles. Build a preview binary, test it on a physical device, and document the exact steps another developer would use to release it.",
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGO_URI or MONGODB_URI is required.");
  await mongoose.connect(mongoUri);

  let course = await Course.findOne({ slug: COURSE_SLUG });
  if (course) Object.assign(course, courseData);
  else course = new Course(courseData);
  await course.save();

  let created = 0;
  let updated = 0;
  for (const [index, chapter] of chapters.entries()) {
    const data = { ...chapter, course: course._id, order: index + 1, canonicalUrl: `${SITE_URL}/courses/${COURSE_SLUG}/${chapter.slug}`, seoTitle: `${chapter.title.replace(/\s+[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/gu, "")} | React Native Course`.slice(0, 70), seoDescription: chapter.summary.slice(0, 170), keywords: ["React Native", "Expo", "mobile development"], status: "published" };
    const existing = await Chapter.findOne({ course: course._id, slug: chapter.slug });
    if (existing) { Object.assign(existing, data); await existing.save(); updated += 1; }
    else { await Chapter.create(data); created += 1; }
  }

  console.log(JSON.stringify({ courseId: course._id, slug: course.slug, chaptersCreated: created, chaptersUpdated: updated }, null, 2));
  await mongoose.disconnect();
}

seed().catch(async (error) => { console.error("React Native course seed failed:", error); await mongoose.disconnect().catch(() => {}); process.exitCode = 1; });

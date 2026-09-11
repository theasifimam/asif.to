import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import TopicCategory from "../models/TopicCategory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const COURSE_SLUG = "csharp-dotnet-complete-course";
const SITE_URL = "https://asif.to";

if (!MONGO_URI) {
  console.error("Error: MONGO_URI or MONGODB_URI is not configured.");
  process.exit(1);
}

const courseData = {
  slug: COURSE_SLUG,
  title: "C# & .NET: Zero to Production Hero 🚀",
  subtitle:
    "A fun, practical C# journey from your first variable to OOP, LINQ, async code, databases, secure ASP.NET Core APIs, testing, Docker, and production-ready .NET apps.",
  seoTitle: "Free C# & .NET Course: Beginner to Advanced | asif.to",
  seoDescription:
    "Learn C# and .NET with fun lessons, examples, challenges, ASP.NET Core, EF Core, testing, security, Docker, and real projects.",
  keywords: [
    "C# course",
    "C sharp tutorial",
    ".NET course",
    "ASP.NET Core",
    "Entity Framework Core",
    "LINQ",
    "C# async await",
    "backend development",
    "asif.to",
  ],
  canonicalUrl: `${SITE_URL}/courses/${COURSE_SLUG}`,
  techId: "csharp",
  level: "Beginner - Advanced",
  duration: "Self-paced (35+ hours)",
  thumbnail: "",
  learningOutcomes: [
    "Understand how C#, modern .NET, the CLR, SDKs, runtimes, and legacy .NET Framework fit together",
    "Write confident C# with types, nullability, control flow, methods, collections, and pattern matching",
    "Model domains with classes, records, structs, interfaces, composition, inheritance, and generics",
    "Transform data cleanly with lambdas and LINQ",
    "Build responsive applications with async/await, cancellation, and safe concurrency",
    "Read files, serialize JSON, call HTTP APIs, and use configuration, logging, NuGet, and DI",
    "Persist relational data with Entity Framework Core and migrations",
    "Create secure, validated REST APIs with ASP.NET Core",
    "Test applications and organize maintainable .NET solutions",
    "Profile, containerize, and ship .NET applications with confidence",
    "Complete portfolio-ready console and web API projects",
  ],
  order: 8,
  status: "published",
  examEnabled: false,
};

const BRAND_NOTE =
  "---\n✨ **Keep the momentum:** explore more bite-sized developer content on [asif.to](https://asif.to), and follow **@theasifto** on Instagram and Facebook plus **asif.to** on LinkedIn. Build cool stuff, then flex it responsibly. 😄";

function lesson({ slug, title, summary, content, codeSnippets, tryItChallenge, keywords = [], build }) {
  return {
    slug,
    title,
    summary,
    seoTitle: `${title.replace(/^\d+\.\s*/, "").replace(/\s+[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/gu, "")} | C# Course`.slice(0, 70),
    seoDescription: summary.slice(0, 170),
    keywords: ["C#", ".NET", ...keywords],
    canonicalUrl: `${SITE_URL}/courses/${COURSE_SLUG}/${slug}`,
    content: [...content, BRAND_NOTE],
    codeSnippets,
    language: "csharp",
    tryItChallenge,
    ...(build
      ? { learningActivities: { build: { enabled: true, ...build } } }
      : {}),
    status: "published",
  };
}

const chaptersData = [
  lesson({
    slug: "csharp-dotnet-setup-and-mental-model",
    title: "1. C#, .NET & the Setup Quest 🗺️",
    summary:
      "Meet C#, understand modern .NET and legacy .NET Framework, install the SDK, and learn the everyday build-run loop.",
    keywords: ["CLR", ".NET SDK", ".NET Framework", "C# setup"],
    content: [
      "## Welcome, future C# wizard 🧙",
      "C# (pronounced **C-sharp**) is a strongly typed language used for APIs, cloud services, desktop software, games, and more. It gives you useful guardrails without turning every idea into paperwork.",
      "## C# and .NET are a duo, not twins",
      "**C#** is the language. **.NET** is the platform around it: the runtime, libraries, compiler, SDK, and tools. The **CLR** executes managed code, handles garbage collection, and provides runtime services. C# is the recipe; .NET is the fully stocked kitchen. 🍳",
      "## Modern .NET vs .NET Framework",
      "Modern **.NET** is cross-platform and the default for new work. **.NET Framework** is the older Windows-only product maintained mainly for existing apps. Recognize it in legacy codebases, but start new projects on modern .NET unless a real constraint says otherwise.",
      "## SDK, runtime, and CLI—quick decode",
      "The runtime runs apps. The SDK includes the runtime plus templates and build tools. `dotnet restore` resolves packages, `dotnet build` compiles, `dotnet run` launches, and `dotnet test` runs tests. IDE buttons call the same neighborhood of tools. 🔁",
    ],
    codeSnippets: [
      { title: "Create and run a project", language: "bash", code: `dotnet --info
dotnet new console -n HelloCSharp
cd HelloCSharp
dotnet run` },
      { title: "Hello from C#", language: "csharp", code: `Console.WriteLine("Hello, C# crew! 👋");
Console.WriteLine($"Runtime: {Environment.Version}");` },
    ],
    tryItChallenge:
      "Create a console project named DotnetLaunchpad, print your name and runtime version, then intentionally cause one compile error and read the message.",
  }),
  lesson({
    slug: "program-structure-and-csharp-syntax",
    title: "2. Syntax Without the Snooze 😴➡️⚡",
    summary:
      "Learn statements, expressions, comments, namespaces, top-level programs, and the classic C# application shape.",
    keywords: ["C# syntax", "namespaces", "top-level statements"],
    content: [
      "## Your code has grammar",
      "C# is case-sensitive: `score`, `Score`, and `SCORE` are different names. Statements usually end with `;`, while braces `{ }` group code. The compiler is strict, but its complaints are basically free code review. 🤝",
      "## Top-level statements",
      "Modern console templates let you write directly in `Program.cs`; the compiler generates the usual entry-point ceremony. Larger and older projects may show a namespace, `Program` class, and `static void Main`. Same language, more explicit outfit.",
      "## Expressions vs statements",
      "An expression produces a value, like `price * quantity`. A statement performs an action, like assigning or printing it. Spotting the difference makes error messages less cryptic.",
      "## Comments that earn their rent 📝",
      "Use `//` for one line and `/* ... */` for a block. Explain **why** a decision exists; do not narrate obvious code. Clear naming and small methods beat comment wallpaper.",
    ],
    codeSnippets: [
      { title: "Top-level program", language: "csharp", code: `const string AppName = "Focus Timer";
var sessions = 3;
Console.WriteLine($"{AppName} has {sessions} sessions ready.");` },
      { title: "Classic entry point", language: "csharp", code: `namespace Launchpad;

public static class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine($"Received {args.Length} arguments.");
    }
}` },
    ],
    tryItChallenge:
      "Write the same greeting app with top-level statements and with Program.Main. Add one useful why-comment.",
  }),
  lesson({
    slug: "types-variables-operators-and-conversions",
    title: "3. Types, Variables & Math Glow-Up 🔢",
    summary:
      "Use value and reference types, var, constants, operators, parsing, conversions, and decimal-safe money calculations.",
    keywords: ["C# data types", "variables", "operators", "conversion"],
    content: [
      "## Types are your safety squad 🛡️",
      "`int` stores whole numbers, `double` handles general floating-point work, `decimal` is preferred for money, `bool` stores truth values, `char` stores one UTF-16 code unit, and `string` stores text.",
      "## Explicit or inferred?",
      "Write `int lives = 3;` when the type adds clarity. Use `var score = 9001;` when the right side makes the type obvious. `var` is still statically typed—it cannot later become a string.",
      "## Operators and conversions",
      "Arithmetic uses `+ - * / %`; comparisons use `== != < > <= >=`; boolean logic uses `&& || !`; `??` supplies a null fallback. Integer division drops the remainder, so cast before dividing when decimals matter.",
      "## Parse without drama",
      "`int.Parse` throws on invalid text. `int.TryParse` reports success and is friendlier for user input. Use `decimal` with the `m` suffix for money, and checked arithmetic when overflow must never pass silently.",
    ],
    codeSnippets: [
      { title: "Safe checkout math", language: "csharp", code: `decimal price = 49.95m;
int quantity = 2;
const decimal TaxRate = 0.05m;
decimal total = price * quantity * (1 + TaxRate);
Console.WriteLine($"Total: {total:C}");` },
      { title: "Friendly parsing", language: "csharp", code: `Console.Write("How many tickets? ");
if (int.TryParse(Console.ReadLine(), out int tickets) && tickets > 0)
    Console.WriteLine($"Booked {tickets} ticket(s) 🎟️");
else
    Console.WriteLine("Please enter a positive whole number.");` },
    ],
    tryItChallenge:
      "Build a tip calculator with decimal and TryParse. Reject invalid values and format the answer as currency.",
  }),
  lesson({
    slug: "strings-nullability-and-console-input",
    title: "4. Strings, Nulls & Input That Behaves 💬",
    summary:
      "Master interpolation, formatting, string APIs, nullable reference types, validation, and clean console input.",
    keywords: ["C# strings", "nullable reference types", "interpolation"],
    content: [
      "## Strings are everywhere",
      "Use interpolation like `$\"Hey {name}\"`, verbatim strings for escape-heavy paths, and raw string literals for JSON or multi-line text. String methods return new values because strings are immutable.",
      "## Nullable reference types",
      "With nullability enabled, `string` promises a value and `string?` admits null is possible. Treat warnings as design feedback: validate, use `?.`, provide `??` fallback values, or prove the value exists.",
      "## `!` is not a fix",
      "The null-forgiving operator silences a warning but does not prevent a runtime null. Sprinkling `!` everywhere is putting tape over the check-engine light. 🚗",
      "## Validate at the boundary",
      "User input, API payloads, and file data are untrusted. Trim, check length and format, and return a friendly message before invalid values travel deeper into the app.",
    ],
    codeSnippets: [
      { title: "Null-safe greeting", language: "csharp", code: `Console.Write("Display name: ");
string? rawName = Console.ReadLine();
string name = string.IsNullOrWhiteSpace(rawName)
    ? "mysterious coder"
    : rawName.Trim();
Console.WriteLine($"Welcome, {name}! ✨");` },
      { title: "Raw string JSON", language: "csharp", code: `string json = """
{
  "course": "C# & .NET",
  "status": "learning"
}
""";
Console.WriteLine(json);` },
    ],
    tryItChallenge:
      "Create a username normalizer that trims input, rejects fewer than 3 characters, replaces spaces with hyphens, and handles null.",
  }),
  lesson({
    slug: "conditions-switch-and-pattern-matching",
    title: "5. Decisions & Pattern-Matching Plot Twists 🎭",
    summary:
      "Control flow with if, switch expressions, relational and property patterns, guards, and readable boolean logic.",
    keywords: ["if else", "switch expression", "pattern matching"],
    content: [
      "## Programs need opinions",
      "`if`, `else if`, and `else` choose a path. Put specific conditions first, name complicated booleans, and prefer guard clauses when they remove a pyramid of indentation.",
      "## Switch got a glow-up ✨",
      "A switch expression maps inputs to outputs concisely. Relational patterns test ranges, type patterns safely narrow types, property patterns inspect members, and `when` adds a guard. The discard pattern `_` catches the rest.",
      "## Short-circuiting matters",
      "`&&` stops when the left side is false; `||` stops when it is true. That makes `user is not null && user.IsActive` safe and avoids work that cannot change the answer.",
      "## Readability wins",
      "If a condition needs a decoder ring, extract `CanPublish(article, user)`. Clever code gets applause once; clear code pays rent forever. 🧾",
    ],
    codeSnippets: [
      { title: "Switch expression with ranges", language: "csharp", code: `int score = 86;
string rank = score switch
{
    >= 90 => "S-tier 🔥",
    >= 75 => "Strong run 💪",
    >= 60 => "Getting there 🌱",
    _ => "Training arc continues 🎬"
};
Console.WriteLine(rank);` },
      { title: "Property pattern", language: "csharp", code: `Order order = new(120m, true);
decimal discount = order switch
{
    { IsMember: true, Total: >= 100m } => 0.15m,
    { Total: >= 100m } => 0.10m,
    _ => 0m
};
record Order(decimal Total, bool IsMember);` },
    ],
    tryItChallenge:
      "Build a shipping-price switch expression based on destination, weight, and premium-member status. Include an invalid-input branch.",
  }),
  lesson({
    slug: "loops-iteration-and-control-flow",
    title: "6. Loops Without Infinite-Loop Lore 🔁",
    summary:
      "Repeat work safely with for, foreach, while, do-while, break, continue, and iteration-friendly thinking.",
    keywords: ["C# loops", "foreach", "iteration"],
    content: [
      "## Repeat yourself—strategically",
      "Use `for` when the index matters, `foreach` when you need each item, `while` when repetition depends on a condition, and `do-while` when the body must run at least once.",
      "## Off-by-one: the tiny boss battle 👾",
      "Most zero-based loops start at `0` and continue while `i < items.Length`. Using `<=` visits one imaginary item beyond the end and earns an exception.",
      "## break, continue, and collection safety",
      "`break` leaves; `continue` skips ahead. Do not add or remove items during a normal `foreach`; filter into a new collection or apply queued changes afterward.",
      "## Infinite loops need an exit plan",
      "Service loops may intentionally run forever, but still need cancellation and error handling. Accidental infinite loops are your CPU doing cardio without consent. 🏃",
    ],
    codeSnippets: [
      { title: "Filter scores", language: "csharp", code: `int[] scores = [42, 91, 77, 58, 100];
foreach (int score in scores)
{
    if (score < 60) continue;
    Console.WriteLine($"Passed with {score} ✅");
}` },
      { title: "Menu with an exit", language: "csharp", code: `while (true)
{
    Console.Write("Type help or exit: ");
    string command = Console.ReadLine()?.Trim().ToLowerInvariant() ?? "";
    if (command == "exit") break;
    Console.WriteLine(command == "help" ? "Commands: help, exit" : "Unknown command");
}` },
    ],
    tryItChallenge:
      "Create a number-guessing loop with limited attempts, warmer/colder feedback, validation, and clean win or game-over exits.",
  }),
  lesson({
    slug: "arrays-lists-dictionaries-and-sets",
    title: "7. Collections: Your Data Squad 🧺",
    summary:
      "Choose arrays, List<T>, Dictionary<TKey,TValue>, HashSet<T>, queues, stacks, and collection expressions.",
    keywords: ["C# collections", "List", "Dictionary", "HashSet"],
    content: [
      "## Pick the right container",
      "Arrays have fixed length. `List<T>` grows and preserves order. `Dictionary<TKey,TValue>` gives key-based lookup. `HashSet<T>` keeps unique values. `Queue<T>` is first-in-first-out; `Stack<T>` is last-in-first-out.",
      "## Generics keep collections honest",
      "The `<T>` states what a collection contains. A `List<string>` accepts strings and lets the compiler reject surprise integers before they become runtime chaos.",
      "## Lookup without jump scares",
      "A missing dictionary key throws through the indexer. Prefer `TryGetValue` when absence is normal. Hash sets and keys depend on equality and hash codes; records make lovely value-like keys.",
      "## Big-O, tiny intro 📈",
      "List lookup by value is generally linear; dictionary and hash-set lookup are generally constant-time on average. Choose by access pattern, not vibes alone.",
    ],
    codeSnippets: [
      { title: "Word frequency", language: "csharp", code: `string[] words = ["code", "ship", "code", "learn", "ship", "code"];
var counts = new Dictionary<string, int>();
foreach (string word in words)
    counts[word] = counts.GetValueOrDefault(word) + 1;
foreach (var (word, count) in counts)
    Console.WriteLine($"{word}: {count}");` },
      { title: "Unique tags", language: "csharp", code: `var tags = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "dotnet", "CSharp", "DOTNET"
};
Console.WriteLine(string.Join(", ", tags));` },
    ],
    tryItChallenge:
      "Build a contact book with a dictionary. Support add, find, list, and remove without crashing on missing names.",
    build: {
      title: "Build: CLI Contact Book 📇",
      description: "Combine loops, validation, and collections in a friendly menu-driven contact manager.",
      estimatedMinutes: 75,
      requirements: [
        "Use a case-insensitive Dictionary",
        "Support add, update, find, list, and remove",
        "Reject blank names and invalid choices",
        "Never crash on expected input",
      ],
    },
  }),
  lesson({
    slug: "methods-parameters-scope-and-tuples",
    title: "8. Methods: Make Code Reusable, Bestie 🧩",
    summary:
      "Design focused methods with parameters, returns, overloads, optional and named arguments, tuples, and sensible scope.",
    keywords: ["C# methods", "parameters", "tuples", "scope"],
    content: [
      "## One job per method",
      "A method packages behavior behind a name. Aim for a focused responsibility, clear inputs, and predictable output. `CalculateInvoiceTotal` beats `DoStuff2`—a name seen in the wild far too often. 😭",
      "## Parameters are contracts",
      "Required parameters make needs explicit. Optional parameters need safe defaults; named arguments clarify calls with similar values. Group long parameter parades into a real type.",
      "## Return values beat hidden side effects",
      "A calculation that returns a value is easy to test. A method that secretly changes global state, writes a file, sends email, and adjusts the thermostat is... ambitious.",
      "## out, ref, tuples, and scope",
      "`out` returns an additional assigned value; `ref` passes an existing variable by reference. Tuples suit small local multi-value results, while public domain concepts deserve records. Keep variables in the smallest useful scope.",
    ],
    codeSnippets: [
      { title: "Focused method", language: "csharp", code: `decimal CalculateTotal(decimal price, int quantity, decimal discount = 0m)
{
    if (price < 0 || quantity < 0) throw new ArgumentOutOfRangeException();
    return price * quantity * (1 - discount);
}
decimal total = CalculateTotal(price: 25m, quantity: 3, discount: 0.10m);` },
      { title: "Named tuple", language: "csharp", code: `(int Min, int Max) FindRange(IEnumerable<int> values) =>
    (values.Min(), values.Max());

var (minimum, maximum) = FindRange([8, 3, 21, 5]);
Console.WriteLine($"{minimum}..{maximum}");` },
    ],
    tryItChallenge:
      "Refactor the tip calculator into small methods for input, validation, calculation, and receipt formatting.",
  }),
  lesson({
    slug: "classes-records-structs-and-encapsulation",
    title: "9. Classes, Records & Encapsulation Energy 🏗️",
    summary:
      "Model data and behavior with classes, constructors, properties, records, structs, access modifiers, and invariants.",
    keywords: ["C# classes", "records", "structs", "encapsulation"],
    content: [
      "## Types model your world",
      "A class keeps data and the behavior protecting it together. Instead of letting any code set a wallet balance to nonsense, expose operations such as `Deposit` and preserve valid state.",
      "## Properties over public fields",
      "Properties provide controlled access. `init` permits values during construction but keeps them stable later; `required` tells callers an important member must be supplied.",
      "## Records and structs",
      "Records provide concise value-based equality and suit commands, events, and API contracts. Structs are copied by value and work best when small, immutable, and value-like. Huge mutable structs summon confusion. 🌀",
      "## Encapsulation is a promise",
      "Access modifiers define who can touch what. Hide implementation details, expose meaningful behavior, and keep every constructed object valid. 🤝",
    ],
    codeSnippets: [
      { title: "Protect state", language: "csharp", code: `public sealed class Wallet
{
    public decimal Balance { get; private set; }
    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        Balance += amount;
    }
}` },
      { title: "Immutable record", language: "csharp", code: `public sealed record CourseCard(string Title, string Slug, int Lessons);
var card = new CourseCard("C# & .NET", "csharp", 24);
var updated = card with { Lessons = 25 };
Console.WriteLine(updated);` },
    ],
    tryItChallenge:
      "Model a Playlist that prevents blank names, exposes tracks read-only, and provides AddTrack/RemoveTrack. Use a Track record.",
  }),
  lesson({
    slug: "interfaces-inheritance-and-composition",
    title: "10. OOP Without the Corporate Fog 🧠",
    summary:
      "Use abstraction, interfaces, inheritance, polymorphism, and composition without creating an inheritance maze.",
    keywords: ["C# OOP", "interfaces", "inheritance", "composition"],
    content: [
      "## The useful OOP idea",
      "Objects combine state and behavior; abstraction exposes what callers need while hiding details. The goal is understandable software—not collecting design-pattern badges.",
      "## Interfaces describe capabilities",
      "Depend on `INotifier` instead of one email class so tests can use a fake and production can use email, SMS, or a carrier-pigeon adapter. 🐦",
      "## Inheritance needs a real is-a",
      "Base classes share behavior and virtual members enable polymorphism. Keep hierarchies shallow. If subclasses override half the base, the relationship is probably fighting you.",
      "## Prefer composition for has-a",
      "An order **has a** payment processor; it is not one. Composition assembles focused collaborators and is usually easier to replace and test. Apply SOLID ideas when they reduce actual friction.",
    ],
    codeSnippets: [
      { title: "Interface-powered service", language: "csharp", code: `public interface INotifier
{
    Task SendAsync(string message, CancellationToken cancellationToken);
}

public sealed class WelcomeService(INotifier notifier)
{
    public Task WelcomeAsync(string name, CancellationToken ct) =>
        notifier.SendAsync($"Welcome, {name}!", ct);
}` },
      { title: "Polymorphic shapes", language: "csharp", code: `public abstract class Shape { public abstract double Area { get; } }
public sealed class Circle(double radius) : Shape
{
    public override double Area => Math.PI * radius * radius;
}` },
    ],
    tryItChallenge:
      "Create IPriceRule implementations for regular, member, and seasonal pricing. Compose one into CheckoutService instead of a giant switch.",
  }),
  lesson({
    slug: "generics-enums-and-type-safety",
    title: "11. Generics & Type-Safe Power-Ups 🧬",
    summary:
      "Write reusable type-safe code with generics, constraints, enums, nullable value types, and result patterns.",
    keywords: ["C# generics", "generic constraints", "enums"],
    content: [
      "## Reuse without losing types",
      "Generics let one implementation work across types while preserving compile-time safety. `List<T>` is one design, many element types, zero casting circus. 🎪",
      "## Constraints communicate needs",
      "`where T : IEntity` tells compiler and reader which capabilities an algorithm requires. Add constraints because the code needs them, not because angle brackets look advanced.",
      "## Enums name a closed set",
      "Enums suit stable states like `Pending`, `Paid`, and `Cancelled`. Validate numeric input because arbitrary underlying integers can be cast unless checked.",
      "## Expected failure can be data",
      "For expected failure, a small `Result<T>` can carry a value or error without throwing. Possible paths become obvious at the call site.",
    ],
    codeSnippets: [
      { title: "Generic result", language: "csharp", code: `public sealed record Result<T>(T? Value, string? Error)
{
    public bool IsSuccess => Error is null;
    public static Result<T> Success(T value) => new(value, null);
    public static Result<T> Failure(string error) => new(default, error);
}` },
      { title: "Constrained store", language: "csharp", code: `public interface IEntity { Guid Id { get; } }
public sealed class MemoryStore<T> where T : IEntity
{
    private readonly Dictionary<Guid, T> _items = [];
    public void Save(T item) => _items[item.Id] = item;
    public T? Find(Guid id) => _items.GetValueOrDefault(id);
}` },
    ],
    tryItChallenge:
      "Create a generic Cache<T> with Set, TryGet, and Remove. Add a constraint only if the design really needs one.",
  }),
  lesson({
    slug: "delegates-lambdas-and-events",
    title: "12. Delegates, Lambdas & Event Energy 🎤",
    summary:
      "Treat behavior as data with delegates, Func, Action, lambdas, predicates, closures, and publish-subscribe events.",
    keywords: ["C# delegates", "lambdas", "events", "Func", "Action"],
    content: [
      "## Pass behavior around",
      "A delegate describes a method signature. `Func<T,TResult>` returns a value, `Action<T>` returns nothing, and `Predicate<T>` returns bool. Callers can plug behavior into reusable algorithms.",
      "## Lambdas keep tiny behavior close",
      "`price => price * 0.9m` is an anonymous function. Lambdas shine in LINQ and callbacks, but a twelve-line lambda is a method begging for a name.",
      "## Closures capture variables",
      "A lambda can use surrounding variables. The captured variable stays alive and may change, so know what you capture—especially in loops and long-lived callbacks.",
      "## Events are controlled notifications 🔔",
      "Events let publishers notify subscribers without exposing direct invocation. Unsubscribe when lifetimes differ. For durable cross-service messaging, use a broker or outbox, not an in-memory event.",
    ],
    codeSnippets: [
      { title: "Behavior as an argument", language: "csharp", code: `static IEnumerable<T> Keep<T>(IEnumerable<T> items, Func<T, bool> rule)
{
    foreach (T item in items)
        if (rule(item)) yield return item;
}
var popular = Keep([12, 99, 51, 8], score => score >= 50);` },
      { title: "Simple event", language: "csharp", code: `public sealed class Download
{
    public event EventHandler? Completed;
    public void Finish() => Completed?.Invoke(this, EventArgs.Empty);
}
var download = new Download();
download.Completed += (_, _) => Console.WriteLine("Complete 🎉");
download.Finish();` },
    ],
    tryItChallenge:
      "Create a TaskBoard that raises TaskCompleted. Subscribe one handler for a message and another for an in-memory count.",
  }),
  lesson({
    slug: "linq-data-transformation",
    title: "13. LINQ: Data Choreography, Not Sorcery ✨",
    summary:
      "Filter, project, order, group, join, aggregate, and safely materialize data with expressive LINQ pipelines.",
    keywords: ["LINQ", "C# data querying", "IEnumerable"],
    content: [
      "## Query collections like a storyteller",
      "LINQ composes operations over sequences. `Where` filters, `Select` transforms, `OrderBy` sorts, `GroupBy` groups, and `Count`, `Sum`, or `Average` summarize.",
      "## Deferred execution",
      "Many operators build a recipe that runs when enumerated. Repeated enumeration repeats work and may see changed data. Use `ToList` or `ToArray` when you intentionally want a snapshot.",
      "## Choose safe element operators",
      "`First` throws when empty; `FirstOrDefault` returns a default. `Single` asserts exactly one item, so use it only when duplicates really indicate a bug.",
      "## IQueryable changes the game",
      "With EF Core, LINQ over `IQueryable` becomes SQL. Not every .NET method translates, and materializing early moves work into memory. Inspect generated queries when performance matters. 🔍",
    ],
    codeSnippets: [
      { title: "Readable LINQ pipeline", language: "csharp", code: `var orders = new[]
{
    new Order("Mina", 120m), new Order("Noor", 45m), new Order("Mina", 80m)
};

var totals = orders
    .Where(order => order.Total >= 50m)
    .GroupBy(order => order.Customer)
    .Select(group => new { Customer = group.Key, Total = group.Sum(x => x.Total) })
    .OrderByDescending(x => x.Total)
    .ToList();

record Order(string Customer, decimal Total);` },
    ],
    tryItChallenge:
      "Produce the top three in-stock products per category by rating, projected into a compact result type.",
    build: {
      title: "Build: Sales Dashboard 📊",
      description: "Turn raw sale records into useful summaries using records, collections, and LINQ.",
      estimatedMinutes: 90,
      requirements: [
        "Model immutable sales",
        "Calculate revenue by product and category",
        "Find top products and low-performing categories",
        "Handle empty data without exceptions",
      ],
    },
  }),
  lesson({
    slug: "exceptions-debugging-and-resource-cleanup",
    title: "14. Exceptions & Debugging Detective Mode 🕵️",
    summary:
      "Handle exceptional failures, preserve stack traces, clean resources, debug methodically, and log useful context.",
    keywords: ["C# exceptions", "debugging", "using statement", "logging"],
    content: [
      "## Exceptions are exceptional",
      "Throw when an operation cannot honor its contract. Do not use exceptions as a loop condition or hide everything behind `catch (Exception) { }`; that deletes evidence at the crime scene. 🧹",
      "## Catch what you can handle",
      "Catch a specific exception when you can recover, translate it at a boundary, or add context. Otherwise let centralized handling log it and return a safe response.",
      "## Preserve the stack trace",
      "Inside `catch`, use `throw;` to rethrow. `throw ex;` resets useful stack information. Use `using` or `await using` so disposable resources are cleaned even when an exception appears.",
      "## Debug with a hypothesis",
      "Reproduce, minimize, inspect inputs and state, form a theory, test one change, and add a regression test. Random edits are code roulette. 🎰",
    ],
    codeSnippets: [
      { title: "Specific exception handling", language: "csharp", code: `try
{
    string config = await File.ReadAllTextAsync("appsettings.json");
    Console.WriteLine(config);
}
catch (FileNotFoundException ex)
{
    Console.Error.WriteLine($"Config missing: {ex.FileName}");
}
catch (UnauthorizedAccessException)
{
    Console.Error.WriteLine("The config cannot be read.");
}` },
      { title: "Guaranteed disposal", language: "csharp", code: `await using FileStream stream = File.OpenRead("report.csv");
using var reader = new StreamReader(stream);
string contents = await reader.ReadToEndAsync();` },
    ],
    tryItChallenge:
      "Write a settings loader that distinguishes missing files, invalid JSON, and permission errors while logging unexpected failures.",
  }),
  lesson({
    slug: "async-await-cancellation-and-parallel-work",
    title: "15. Async/Await Without the Chaos 🌊",
    summary:
      "Build responsive I/O with Task, async/await, cancellation, timeouts, Task.WhenAll, and concurrency awareness.",
    keywords: ["C# async await", "Task", "CancellationToken", "concurrency"],
    content: [
      "## Async is waiting efficiently",
      "When an app waits for HTTP, a database, or a file, `await` lets the thread do other work. Async does not automatically speed CPU-heavy calculations; parallelism is separate.",
      "## Async all the way",
      "Return `Task` or `Task<T>` and await it. Avoid `.Result` and `.Wait()` in normal app code because they block threads and can help cause deadlocks. `async void` is mainly for event handlers.",
      "## Cancellation is a feature 🛑",
      "Accept a `CancellationToken`, pass it downstream, and treat cancellation as normal. Express timeouts with a cancellation source. Start independent tasks together and await `Task.WhenAll`, but cap large fan-outs.",
      "## Observe failures",
      "Await tasks so exceptions are observed. At background-worker boundaries, catch, log, and deliberately retry, stop, or quarantine the item.",
    ],
    codeSnippets: [
      { title: "Cancelable request", language: "csharp", code: `static async Task<string> FetchAsync(
    HttpClient client, string url, CancellationToken cancellationToken)
{
    using HttpResponseMessage response = await client.GetAsync(url, cancellationToken);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync(cancellationToken);
}` },
      { title: "Independent tasks together", language: "csharp", code: `Task<string> profileTask = FetchAsync(client, profileUrl, ct);
Task<string> feedTask = FetchAsync(client, feedUrl, ct);
string[] results = await Task.WhenAll(profileTask, feedTask);` },
    ],
    tryItChallenge:
      "Fetch three endpoints concurrently, add a five-second timeout, support Ctrl+C cancellation, and report partial failures.",
  }),
  lesson({
    slug: "files-json-and-http-clients",
    title: "16. Files, JSON & API Side Quests 📦",
    summary:
      "Use safe paths and streams, serialize JSON, call HTTP APIs, reuse HttpClient, and design resilient integrations.",
    keywords: ["System.Text.Json", "HttpClient", "file IO", "REST client"],
    content: [
      "## Portable, safe paths",
      "Use `Path.Combine`, `Path.GetFullPath`, and special-folder APIs instead of hand-built slashes. Validate user-controlled paths so they cannot escape the intended directory.",
      "## Stream chunky data",
      "Convenience methods are perfect for small files. For large inputs, process streams or lines incrementally instead of loading the whole universe into memory.",
      "## JSON with System.Text.Json",
      "Serialize typed records and deserialize to explicit contracts. Decide casing and enum behavior for external APIs, then validate the object—valid JSON can still contain invalid business data.",
      "## Reuse HTTP clients",
      "Creating one `HttpClient` per request can exhaust sockets. Use `IHttpClientFactory` in managed apps or reuse a client in small tools. Retry only transient, repeat-safe operations with bounded backoff—not forever like a determined toaster. 🍞",
    ],
    codeSnippets: [
      { title: "Typed JSON file", language: "csharp", code: `using System.Text.Json;
var settings = new AppSettings("dark", true);
string json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
await File.WriteAllTextAsync("settings.json", json);
AppSettings? loaded = JsonSerializer.Deserialize<AppSettings>(await File.ReadAllTextAsync("settings.json"));
record AppSettings(string Theme, bool Notifications);` },
      { title: "Typed HTTP JSON", language: "csharp", code: `using System.Net.Http.Json;
using var client = new HttpClient { BaseAddress = new Uri("https://api.example.com/") };
Weather? weather = await client.GetFromJsonAsync<Weather>("weather/dubai");
record Weather(decimal TemperatureC);` },
    ],
    tryItChallenge:
      "Build a weather client that fetches typed JSON, caches the last success to a file, and uses it during temporary network failure.",
  }),
  lesson({
    slug: "dotnet-solutions-nuget-configuration-logging-di",
    title: "17. The .NET Toolbox: NuGet, Config & DI 🧰",
    summary:
      "Organize projects, manage NuGet packages, configure environments, add structured logging, and use dependency injection.",
    keywords: ["NuGet", "dependency injection", "configuration", "ILogger"],
    content: [
      "## Solutions contain the neighborhood",
      "A solution groups projects such as API, core library, infrastructure adapters, and tests. Project references connect your assemblies; package references pull libraries from NuGet.",
      "## NuGet with receipts 🧾",
      "Review package source, maintenance, licensing, and versions. Fewer purposeful dependencies beat dependency confetti. Keep your dependency graph updated and scanned.",
      "## Configuration has layers",
      "Settings can come from JSON, environment-specific JSON, environment variables, command-line arguments, and secret providers. Later sources typically override earlier ones. Never commit production secrets.",
      "## Logging and dependency injection",
      "Use structured templates like `Processed order {OrderId}` and never log tokens or passwords. Register collaborators and request them through constructors. Choose transient, scoped, or singleton lifetime deliberately; a singleton must not directly consume a scoped service.",
    ],
    codeSnippets: [
      { title: "Create a solution", language: "bash", code: `dotnet new sln -n Shop
dotnet new classlib -n Shop.Core
dotnet new webapi -n Shop.Api
dotnet new xunit -n Shop.Tests
dotnet sln add Shop.Core Shop.Api Shop.Tests
dotnet add Shop.Api reference Shop.Core` },
      { title: "DI and logging", language: "csharp", code: `builder.Services.AddScoped<IOrderService, OrderService>();

public sealed class OrderService(ILogger<OrderService> logger)
{
    public void Process(Guid orderId) =>
        logger.LogInformation("Processing order {OrderId}", orderId);
}` },
    ],
    tryItChallenge:
      "Split an app into App and Core projects, register a service with DI, bind typed options, and emit a structured log without secrets.",
  }),
  lesson({
    slug: "entity-framework-core-and-relational-data",
    title: "18. EF Core: Databases Without SQL Amnesia 🗃️",
    summary:
      "Model relational data, use DbContext and migrations, query efficiently, track changes, and avoid EF Core traps.",
    keywords: ["Entity Framework Core", "EF Core", "DbContext", "migrations"],
    content: [
      "## An ORM, not a database replacement",
      "EF Core maps objects to relational tables and translates LINQ to SQL. Keys, constraints, indexes, transactions, and query costs remain very real.",
      "## DbContext is a unit of work",
      "A context tracks changes and writes them with `SaveChangesAsync`. It is commonly scoped per web request and is not thread-safe, so never share one across concurrent work.",
      "## Migrations version the schema",
      "Generate after model changes, review operations, test realistic data, then apply through controlled deployment. Blind production auto-migration can create an exciting outage. 🎢",
      "## Query only what you need",
      "Project required columns, use `AsNoTracking` for reads, paginate large lists, and align indexes with filters. Watch N+1 queries. Use constraints as the final integrity guard and concurrency tokens for conflicting edits.",
    ],
    codeSnippets: [
      { title: "DbContext and entity", language: "csharp", code: `public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
}
public sealed class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
}` },
      { title: "Efficient read", language: "csharp", code: `var products = await db.Products
    .AsNoTracking()
    .Where(product => product.Price >= minimumPrice)
    .OrderBy(product => product.Name)
    .Select(product => new ProductListItem(product.Id, product.Name, product.Price))
    .Take(50)
    .ToListAsync(cancellationToken);` },
    ],
    tryItChallenge:
      "Create a SQLite reading list with migrations, unique ISBN values, async CRUD, no-tracking reads, and pagination.",
    build: {
      title: "Build: Persistent Reading List 📚",
      description: "Upgrade an in-memory tracker into a relational EF Core app.",
      estimatedMinutes: 150,
      requirements: [
        "Use SQLite and a reviewed migration",
        "Enforce unique ISBN values",
        "Implement async CRUD",
        "Use projection, validation, and pagination",
      ],
    },
  }),
  lesson({
    slug: "aspnet-core-rest-apis",
    title: "19. ASP.NET Core APIs That Actually Slap 🌐",
    summary:
      "Build REST endpoints with ASP.NET Core, minimal APIs or controllers, routing, DTOs, status codes, OpenAPI, and middleware.",
    keywords: ["ASP.NET Core", "Web API", "REST", "minimal APIs", "OpenAPI"],
    content: [
      "## The request pipeline",
      "ASP.NET Core handles requests through ordered middleware. Each component acts before and after the next—or short-circuits. Order matters for exceptions, HTTPS, authentication, authorization, and routes.",
      "## Minimal APIs or controllers?",
      "Minimal APIs are compact and excellent for focused services. Controllers provide conventions for larger HTTP surfaces. Both use the same platform; choose based on app and team needs.",
      "## DTOs protect boundaries 🧱",
      "Do not expose database entities as public contracts. DTOs prevent over-posting, decouple persistence from API evolution, and document exactly what clients may send or receive.",
      "## Honest HTTP semantics",
      "Use `200` for reads, `201` plus a location for creation, `204` for success without content, `400` for invalid input, `404` for missing resources, and `409` for conflicts. Avoid `200` with an error body.",
      "## Document and observe",
      "Generate OpenAPI docs, centralize unexpected errors into safe problem responses, validate inputs, and carry correlation IDs through structured logs.",
    ],
    codeSnippets: [
      { title: "Small minimal API", language: "csharp", code: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
var app = builder.Build();
app.MapOpenApi();

app.MapGet("/api/v1/greetings/{name}", (string name) =>
    string.IsNullOrWhiteSpace(name)
        ? Results.BadRequest(new { error = "Name is required" })
        : Results.Ok(new { message = $"Hey, {name}! 👋" }));
app.Run();` },
      { title: "Create with DTO", language: "csharp", code: `app.MapPost("/api/v1/tasks", async (
    CreateTaskRequest request, AppDbContext db, CancellationToken ct) =>
{
    var task = new WorkTask { Title = request.Title.Trim() };
    db.Tasks.Add(task);
    await db.SaveChangesAsync(ct);
    return Results.Created($"/api/v1/tasks/{task.Id}",
        new TaskResponse(task.Id, task.Title));
});` },
    ],
    tryItChallenge:
      "Build versioned CRUD endpoints for a habit tracker with DTOs, validation, correct status codes, pagination, and OpenAPI.",
  }),
  lesson({
    slug: "validation-authentication-and-api-security",
    title: "20. Security: Lock the Door, Hide the Keys 🔐",
    summary:
      "Validate input, configure auth, protect secrets, prevent common API attacks, and apply practical security defaults.",
    keywords: ["ASP.NET Core security", "authentication", "authorization", "JWT"],
    content: [
      "## Identity and permission are different",
      "Authentication establishes who someone is. Authorization decides whether they may perform an action on a resource. A valid login does not grant access to everyone else's data.",
      "## Validate every boundary",
      "Check required values, lengths, formats, ranges, and domain rules. Reject dangerous input early, while still relying on parameterized data access and safe framework APIs.",
      "## Passwords, tokens, and secrets",
      "Never store plain passwords; use proven identity tooling and adaptive hashing. Validate token signature, issuer, audience, and expiry. Keep secrets outside Git and redact them from logs. 🚫",
      "## Practical defenses",
      "Require HTTPS, configure CORS narrowly, rate-limit abuse-prone routes, protect cookie-authenticated state changes from forgery, limit uploads, patch dependencies, and return safe error details.",
      "## Check the actual resource",
      "After loading a record, verify ownership or the required policy. Guessing another ID must never expose or modify another user's content.",
    ],
    codeSnippets: [
      { title: "Policy-protected route", language: "csharp", code: `builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanPublish", policy =>
        policy.RequireClaim("permission", "content:publish"));
});
app.MapPost("/api/articles/{id:guid}/publish", PublishArticleAsync)
    .RequireAuthorization("CanPublish");` },
      { title: "Ownership check", language: "csharp", code: `app.MapDelete("/api/notes/{id:guid}", async (
    Guid id, ClaimsPrincipal user, AppDbContext db, CancellationToken ct) =>
{
    string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    Note? note = await db.Notes.FindAsync([id], ct);
    if (note is null) return Results.NotFound();
    if (note.OwnerId != userId) return Results.Forbid();
    db.Remove(note);
    await db.SaveChangesAsync(ct);
    return Results.NoContent();
}).RequireAuthorization();` },
    ],
    tryItChallenge:
      "Threat-model the habit API, then add owner-only access, input limits, safe errors, secret handling, and rate limiting.",
  }),
  lesson({
    slug: "testing-and-maintainable-architecture",
    title: "21. Testing & Architecture, Minus the Ceremony 🧪",
    summary:
      "Write useful unit and integration tests, use doubles wisely, organize boundaries, and keep architecture proportional.",
    keywords: ["xUnit", "unit testing", "integration testing", "clean architecture"],
    content: [
      "## Test behavior people care about",
      "Arrange a meaningful scenario, act once, and assert an observable result. Test business rules, edge cases, permissions, and bug regressions—not trivial getters.",
      "## Unit vs integration",
      "Unit tests isolate focused logic. Integration tests exercise routing, middleware, serialization, EF Core, and a test database. You need both; mocking the universe mostly proves mocks exist. 🌌",
      "## Name the story",
      "`Withdraw_WhenFundsAreInsufficient_ReturnsFailure` documents scenario and expectation. Control time, randomness, file paths, and external services so tests stay deterministic.",
      "## Architecture creates direction",
      "Keep business rules independent of frameworks. Let outer adapters depend inward on domain/application abstractions. For a small app, clear folders may be enough—architecture is a tool, not a cosplay.",
      "## Red, green, refactor",
      "Watch the test fail for the expected reason, make it pass, then improve design while it stays green. This turns refactoring from bravery into routine.",
    ],
    codeSnippets: [
      { title: "xUnit rule test", language: "csharp", code: `public sealed class WalletTests
{
    [Fact]
    public void Deposit_WhenPositive_IncreasesBalance()
    {
        var wallet = new Wallet();
        wallet.Deposit(25m);
        Assert.Equal(25m, wallet.Balance);
    }
}` },
      { title: "API integration test", language: "csharp", code: `public sealed class HealthTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_ReturnsSuccess()
    {
        using HttpClient client = factory.CreateClient();
        (await client.GetAsync("/health")).EnsureSuccessStatusCode();
    }
}` },
    ],
    tryItChallenge:
      "Add unit tests for one service and integration tests for create, get, invalid, and unauthorized API paths.",
  }),
  lesson({
    slug: "performance-memory-and-concurrency",
    title: "22. Performance: Fast After It Works 🏎️",
    summary:
      "Measure before optimizing, understand allocations and GC, use spans carefully, and control concurrent work.",
    keywords: ["C# performance", "garbage collection", "Span", "concurrency"],
    content: [
      "## Measure, or it is fan fiction",
      "Start with latency, throughput, memory, CPU, database traces, and a reproducible workload. Profilers and benchmarks reveal bottlenecks; intuition reveals code you personally distrust. 📉",
      "## Allocations have a cost",
      "The garbage collector is efficient, but high allocation rates add pressure. Avoid needless strings and collections in hot paths, without contorting ordinary code before evidence exists.",
      "## Fix big costs first",
      "Database round trips, missing indexes, oversized responses, and N+1 queries often dwarf micro-optimizations. Cache only with an invalidation plan and observable hit rate.",
      "## Advanced memory tools",
      "`Span<T>` slices contiguous memory without allocation; pools reuse buffers. Both add constraints. Reach for them after profiling. Bound concurrency with semaphores and prefer immutable shared data.",
    ],
    codeSnippets: [
      { title: "Bound concurrency", language: "csharp", code: `using var gate = new SemaphoreSlim(4);
async Task<string> FetchBoundedAsync(string url, CancellationToken ct)
{
    await gate.WaitAsync(ct);
    try { return await client.GetStringAsync(url, ct); }
    finally { gate.Release(); }
}` },
      { title: "ReadOnlySpan slice", language: "csharp", code: `ReadOnlySpan<char> input = "order:12345";
int separator = input.IndexOf(':');
ReadOnlySpan<char> idText = input[(separator + 1)..];
if (int.TryParse(idText, out int orderId)) Console.WriteLine(orderId);` },
    ],
    tryItChallenge:
      "Benchmark two text parsers, compare time and allocations, and document whether the optimization is worth its readability cost.",
  }),
  lesson({
    slug: "deployment-docker-observability-and-ci",
    title: "23. Ship It: Docker, CI & Production Survival 🚢",
    summary:
      "Publish .NET apps, build secure containers, automate CI, expose health checks, observe production, and roll out safely.",
    keywords: ["Docker .NET", "CI/CD", "deployment", "observability"],
    content: [
      "## Publish deliberately",
      "`dotnet publish` prepares deployable output. Framework-dependent deployments use an installed runtime; self-contained deployments bundle one and are larger. Choose for your operations.",
      "## Containers are packages, not tiny VMs",
      "Use multi-stage builds, a small official runtime image, a non-root user, `.dockerignore`, and environment-provided secrets. Pin image versions and scan images and dependencies.",
      "## CI is the quality bouncer 🕶️",
      "On changes, restore, build, test, and optionally format, scan, package, and publish artifacts. Make deployment reproducible and credentials short-lived.",
      "## Observe and undo",
      "Combine structured logs, metrics, traces, and correlation IDs. Separate live from ready health checks. Use staged releases and backward-compatible database changes, with a rehearsed rollback button.",
    ],
    codeSnippets: [
      { title: "Multi-stage container", language: "dockerfile", code: `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish Shop.Api/Shop.Api.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "Shop.Api.dll"]` },
      { title: "Health checks", language: "csharp", code: `builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});
app.MapHealthChecks("/health/ready");` },
    ],
    tryItChallenge:
      "Containerize your API as non-root, add live/ready health checks, and create CI that restores, builds, tests, and publishes.",
  }),
  lesson({
    slug: "csharp-dotnet-capstone-roadmap",
    title: "24. Capstone: Your Portfolio Era Begins 🌟",
    summary:
      "Combine the course into a production-minded API with milestones, quality checks, and optional advanced upgrades.",
    keywords: ["C# project", ".NET capstone", "portfolio project"],
    content: [
      "## Pick a domain with behavior",
      "Build a job tracker, expense planner, learning API, or booking service. Choose users, validation, permissions, search, and state changes—not five identical CRUD screens.",
      "## Milestone 1: prove the core",
      "Write a problem statement, sketch endpoints and data, then implement one thin end-to-end feature. A working slice beats fourteen empty architecture projects. 🍰",
      "## Milestone 2: make it trustworthy",
      "Add database constraints, validation, centralized errors, authentication, ownership authorization, structured logs, unit tests, and API integration tests.",
      "## Milestone 3: make it shippable",
      "Add pagination, cancellation, OpenAPI, health checks, Docker, CI, environment config, and a deployment guide. Profile a realistic flow and document the result.",
      "## README = your trailer 🎬",
      "Explain the problem, architecture, tradeoffs, setup, configuration names (never values), migrations, tests, and API examples. Another human should reach a working app without telepathy.",
      "## Definition of done",
      "The app builds cleanly, tests pass, secrets stay outside Git, migrations are reviewed, errors are useful, permissions hold, and rollback exists. That is portfolio energy. 💼",
    ],
    codeSnippets: [
      { title: "Delivery checklist", language: "text", code: `[ ] Problem and users defined
[ ] One end-to-end feature works
[ ] Validation and errors are consistent
[ ] Authentication and ownership are tested
[ ] Constraints and migrations reviewed
[ ] Unit and integration tests pass
[ ] Logs, health, config, Docker, and CI ready
[ ] README works for a stranger` },
      { title: "Final checks", language: "bash", code: `dotnet restore
dotnet build --no-restore
dotnet test --no-build
dotnet publish src/MyApp.Api -c Release -o ./artifacts/publish
docker build -t myapp-api .` },
    ],
    tryItChallenge:
      "Choose a capstone, write five acceptance criteria, create milestone issues, and ship the first thin feature before bonus architecture.",
    build: {
      title: "Build: Production-Ready Portfolio API 🏆",
      description: "Design, secure, test, document, containerize, and ship a complete ASP.NET Core application.",
      estimatedMinutes: 600,
      requirements: [
        "Versioned documented API",
        "EF Core with reviewed migrations",
        "Authentication and resource authorization",
        "Unit and integration tests",
        "Logging, health checks, Docker, and CI",
        "Clear setup and tradeoff documentation",
      ],
    },
  }),
];

const categoryDefinitions = [
  {
    name: "Level 1: C# Launch Pad 🚀",
    slug: "csharp-launch-pad",
    description: "Start from zero with the C#/.NET mental model, syntax, types, strings, null safety, and setup.",
    keywords: ["C# basics", ".NET setup", "beginner C#"],
    chapterSlugs: [
      "csharp-dotnet-setup-and-mental-model",
      "program-structure-and-csharp-syntax",
      "types-variables-operators-and-conversions",
      "strings-nullability-and-console-input",
    ],
  },
  {
    name: "Level 2: Logic & Data Gym 🧠",
    slug: "csharp-logic-and-collections",
    description: "Train problem-solving with conditions, pattern matching, loops, and essential collections.",
    keywords: ["C# logic", "C# collections", "pattern matching"],
    chapterSlugs: [
      "conditions-switch-and-pattern-matching",
      "loops-iteration-and-control-flow",
      "arrays-lists-dictionaries-and-sets",
    ],
  },
  {
    name: "Level 3: Reusable Code & OOP 🏗️",
    slug: "csharp-methods-and-oop",
    description: "Build maintainable models with methods, classes, records, interfaces, composition, and generics.",
    keywords: ["C# OOP", "C# methods", "generics"],
    chapterSlugs: [
      "methods-parameters-scope-and-tuples",
      "classes-records-structs-and-encapsulation",
      "interfaces-inheritance-and-composition",
      "generics-enums-and-type-safety",
    ],
  },
  {
    name: "Level 4: Modern C# Superpowers ⚡",
    slug: "modern-csharp-superpowers",
    description: "Level up with delegates, events, lambdas, LINQ, robust failures, and async workflows.",
    keywords: ["modern C#", "LINQ", "async await"],
    chapterSlugs: [
      "delegates-lambdas-and-events",
      "linq-data-transformation",
      "exceptions-debugging-and-resource-cleanup",
      "async-await-cancellation-and-parallel-work",
    ],
  },
  {
    name: "Level 5: The .NET Ecosystem 🧰",
    slug: "dotnet-ecosystem",
    description: "Connect C# to files, JSON, HTTP, solutions, NuGet, configuration, logging, and DI.",
    keywords: [".NET ecosystem", "NuGet", "dependency injection"],
    chapterSlugs: [
      "files-json-and-http-clients",
      "dotnet-solutions-nuget-configuration-logging-di",
    ],
  },
  {
    name: "Level 6: Data & Web APIs 🌐",
    slug: "dotnet-data-and-web-apis",
    description: "Create database-backed secure services with EF Core, ASP.NET Core, auth, and tests.",
    keywords: ["EF Core", "ASP.NET Core", "API security", "testing"],
    chapterSlugs: [
      "entity-framework-core-and-relational-data",
      "aspnet-core-rest-apis",
      "validation-authentication-and-api-security",
      "testing-and-maintainable-architecture",
    ],
  },
  {
    name: "Level 7: Production & Portfolio Era 🏆",
    slug: "dotnet-production-and-capstone",
    description: "Measure performance, deploy with Docker and CI, observe production, and finish a capstone.",
    keywords: [".NET performance", "Docker", "CI/CD", "C# capstone"],
    chapterSlugs: [
      "performance-memory-and-concurrency",
      "deployment-docker-observability-and-ci",
      "csharp-dotnet-capstone-roadmap",
    ],
  },
];

async function upsertCourse() {
  const course = await Course.findOneAndUpdate(
    { slug: COURSE_SLUG },
    { $set: courseData },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  console.log(`Course ready: ${course.title} (${course._id})`);
  return course;
}

async function upsertCategories(course) {
  const categoryBySlug = new Map();
  for (const [index, definition] of categoryDefinitions.entries()) {
    const plainName = definition.name.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
    const category = await TopicCategory.findOneAndUpdate(
      { course: course._id, slug: definition.slug },
      { $set: {
        name: definition.name,
        description: definition.description,
        content: `${definition.description}\n\nPractical examples, friendly explanations, and hands-on challenges await on asif.to. ✨`,
        order: index + 1,
        status: "published",
        seoTitle: `${plainName} | asif.to`.slice(0, 70),
        seoDescription: definition.description,
        keywords: ["C#", ".NET", ...definition.keywords, "asif.to"],
        canonicalUrl: `${SITE_URL}/courses/${COURSE_SLUG}#${definition.slug}`,
        ogTitle: definition.name,
        ogDescription: definition.description,
        twitterTitle: definition.name,
        twitterDescription: definition.description,
        noindex: false,
        nofollow: false,
      } },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    categoryBySlug.set(definition.slug, category);
  }
  console.log(`Categories ready: ${categoryBySlug.size}`);
  return categoryBySlug;
}

async function upsertChapters(course, categoryBySlug) {
  const categorySlugByChapter = new Map();
  for (const category of categoryDefinitions) {
    for (const chapterSlug of category.chapterSlugs) {
      categorySlugByChapter.set(chapterSlug, category.slug);
    }
  }

  const chapterBySlug = new Map();
  let created = 0;
  let updated = 0;
  for (const [index, chapterData] of chaptersData.entries()) {
    const category = categoryBySlug.get(categorySlugByChapter.get(chapterData.slug));
    if (!category) throw new Error(`No category configured for ${chapterData.slug}`);

    const existing = await Chapter.exists({ course: course._id, slug: chapterData.slug });
    const chapter = await Chapter.findOneAndUpdate(
      { course: course._id, slug: chapterData.slug },
      {
        $set: { ...chapterData, category: category._id, order: index + 1 },
        $setOnInsert: { viewCount: 0 },
      },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    chapterBySlug.set(chapter.slug, chapter);
    existing ? updated++ : created++;
  }
  console.log(`Chapters ready: ${chaptersData.length} (${created} created, ${updated} updated)`);
  return chapterBySlug;
}

async function syncFeaturedChapters(categoryBySlug, chapterBySlug) {
  for (const definition of categoryDefinitions) {
    const category = categoryBySlug.get(definition.slug);
    category.featuredChapters = definition.chapterSlugs.map((slug) => chapterBySlug.get(slug)._id);
    await category.save();
  }
}

function validateSeedData() {
  const chapterSlugs = chaptersData.map((chapter) => chapter.slug);
  const categorySlugs = categoryDefinitions.map((category) => category.slug);
  const mappedSlugs = categoryDefinitions.flatMap((category) => category.chapterSlugs);
  const unique = (values) => new Set(values).size === values.length;
  const issues = [];

  if (!unique(chapterSlugs)) issues.push("chapter slugs must be unique");
  if (!unique(categorySlugs)) issues.push("category slugs must be unique");
  if (!unique(mappedSlugs)) issues.push("each chapter must belong to exactly one category");
  if (mappedSlugs.length !== chapterSlugs.length || chapterSlugs.some((slug) => !mappedSlugs.includes(slug))) {
    issues.push("category mapping must cover every chapter");
  }

  for (const chapter of chaptersData) {
    if (chapter.title.length > 180) issues.push(`${chapter.slug}: title exceeds 180 characters`);
    if (chapter.summary.length > 320) issues.push(`${chapter.slug}: summary exceeds 320 characters`);
    if (chapter.seoTitle.length > 70) issues.push(`${chapter.slug}: SEO title exceeds 70 characters`);
    if (chapter.seoDescription.length > 170) issues.push(`${chapter.slug}: SEO description exceeds 170 characters`);
    if (!chapter.content.at(-1)?.includes("@theasifto")) issues.push(`${chapter.slug}: branding note is missing`);
    if (!chapter.codeSnippets?.length) issues.push(`${chapter.slug}: code example is missing`);
  }

  if (issues.length) throw new Error(`Seed data is invalid:\n- ${issues.join("\n- ")}`);
  console.log(`Seed data valid: ${categoryDefinitions.length} categories and ${chaptersData.length} chapters.`);
}

async function verify(course) {
  const expectedSlugs = chaptersData.map((chapter) => chapter.slug);
  const [categories, chapters] = await Promise.all([
    TopicCategory.find({ course: course._id, slug: { $in: categoryDefinitions.map((item) => item.slug) } }).lean(),
    Chapter.find({ course: course._id, slug: { $in: expectedSlugs } }).sort({ order: 1 }).lean(),
  ]);
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const expectedCategorySlugByChapter = new Map(
    categoryDefinitions.flatMap((category) =>
      category.chapterSlugs.map((chapterSlug) => [chapterSlug, category.slug]),
    ),
  );
  const categorized = chapters.filter((chapter) => {
    const category = categoryBySlug.get(expectedCategorySlugByChapter.get(chapter.slug));
    return category && String(chapter.category) === String(category._id);
  }).length;
  const featuredSynced = categoryDefinitions.filter((definition) => {
    const category = categoryBySlug.get(definition.slug);
    return category?.featuredChapters?.length === definition.chapterSlugs.length;
  }).length;
  const published = chapters.filter((chapter) => chapter.status === "published").length;
  const branded = chapters.filter((chapter) => chapter.content.some((block) => block.includes("@theasifto"))).length;
  const emojiFriendly = chapters.filter((chapter) =>
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(`${chapter.title} ${chapter.content.join(" ")}`),
  ).length;

  console.log("\nVerification");
  console.table({ categories: categories.length, chapters: chapters.length, categorized, featuredSynced, published, branded, emojiFriendly });
  console.table(categoryDefinitions.map((item) => ({ category: item.name, chapters: item.chapterSlugs.length })));

  const expected = chaptersData.length;
  if (
    categories.length !== categoryDefinitions.length ||
    featuredSynced !== categoryDefinitions.length ||
    [chapters.length, categorized, published, branded, emojiFriendly].some((count) => count !== expected)
  ) {
    throw new Error("Verification failed: one or more C# course records are incomplete.");
  }
}

async function seedCSharpCourse() {
  try {
    validateSeedData();
    if (process.argv.includes("--validate-only")) return;

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");
    const course = await upsertCourse();
    const categoryBySlug = await upsertCategories(course);
    const chapterBySlug = await upsertChapters(course, categoryBySlug);
    await syncFeaturedChapters(categoryBySlug, chapterBySlug);
    await verify(course);
    console.log(`\nC# course published at: ${SITE_URL}/courses/${COURSE_SLUG}`);
  } catch (error) {
    console.error("C# course seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedCSharpCourse();

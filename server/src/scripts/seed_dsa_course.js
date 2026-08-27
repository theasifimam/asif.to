import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGODB_URI or MONGO_URI is not set in environment.");
  process.exit(1);
}

const courseData = {
  slug: "python-complete-course",
  title: "Python: The Complete Beginner to Advanced Guide",
  subtitle:
    "Learn Python from absolute basics to real-world programming with clear explanations, practical examples, object-oriented programming, files, APIs, databases, testing, automation, and projects.",
  techId: "python",
  level: "Beginner - Advanced",
  duration: "Self-paced (45+ hours)",
  thumbnail: "",
  learningOutcomes: [
    "Understand Python syntax, variables, data types, operators, and program flow from the ground up",
    "Write clean Python programs using conditions, loops, functions, modules, and reusable code",
    "Work confidently with strings, lists, tuples, sets, dictionaries, and nested data structures",
    "Understand scope, recursion, lambda functions, comprehensions, iterators, generators, and decorators",
    "Build object-oriented programs using classes, objects, inheritance, composition, and special methods",
    "Read, write, and process text, CSV, and JSON files safely",
    "Handle errors with exceptions and write programs that fail gracefully",
    "Use Python standard-library modules for dates, paths, collections, regular expressions, and utilities",
    "Create and manage virtual environments and project dependencies",
    "Consume REST APIs and work with HTTP and JSON data",
    "Store and query data using SQLite from Python",
    "Write tests, debug programs, and structure maintainable Python projects",
    "Understand concurrency fundamentals with threading, multiprocessing, and async programming",
    "Automate repetitive tasks and build practical command-line applications",
    "Complete realistic Python projects that combine multiple concepts",
  ],
  order: 7,
  status: "published",
  examEnabled: true,
  examSettings: {
    questionCount: 25,
    durationMinutes: 35,
    passingPercentage: 70,
    cooldownHours: 24,
  },
};

const chaptersData = [
  {
    slug: "python-introduction-and-setup",
    title: "1. Introduction to Python & Development Setup",
    summary:
      "Understand what Python is, why it is popular, how Python executes code, and how to set up a clean development environment.",
    content: [
      "## What Is Python?",
      "Python is a high-level, general-purpose programming language designed to make code readable and expressive. It is used for web development, automation, scripting, data analysis, artificial intelligence, testing, DevOps, cybersecurity tooling, desktop applications, and many other areas.",
      "## Why Python Is Beginner Friendly",
      "Python removes much of the punctuation and boilerplate found in many other languages. Blocks are defined using indentation instead of braces, variable declarations are concise, and many useful data structures are built into the language.",
      "## Python Is Still a Real Production Language",
      "Beginner-friendly does not mean limited. Python powers production systems, backend services, automation pipelines, scientific workloads, machine-learning systems, testing tools, and developer infrastructure. The same syntax you learn as a beginner scales into serious software engineering.",
      "## Python Implementations",
      "The most commonly used implementation is **CPython**, which is the reference implementation written primarily in C. Other implementations exist, but beginners should normally use the standard Python distribution unless a project specifically requires something else.",
      "## How Python Runs Your Code",
      "When using CPython, source code is parsed and compiled into an intermediate bytecode representation. That bytecode is executed by the Python virtual machine. You usually do not need to manage this process manually, but understanding that Python is more than simply 'reading source code line by line' gives a better mental model.",
      "## The Python REPL",
      "The interactive Python shell, commonly called the REPL, lets you type expressions and see results immediately. It is useful for experimenting with syntax, checking library behavior, and quickly testing small ideas.",
      "## Python Scripts",
      "A Python script is generally a `.py` file executed with a command such as `python app.py` or `python3 app.py`, depending on the operating system and installation.",
      "## Choosing an Editor",
      "Visual Studio Code, PyCharm, and other editors work well. The most important beginner features are syntax highlighting, automatic indentation, code completion, an integrated terminal, and readable error highlighting.",
      "## Indentation Is Syntax",
      "Python uses indentation to define code blocks. Mixing indentation levels carelessly can change program meaning or cause an `IndentationError`. A standard convention is four spaces per indentation level.",
      "## Comments",
      "Use `#` for single-line comments. Good comments explain *why* something is done when the reason is not obvious. Avoid comments that simply repeat what the code already says.",
      "## Your First Learning Goal",
      "Do not try to memorize the whole language. Learn how values are stored, how decisions are made, how repetition works, and how logic is organized into functions. Everything later builds on those foundations.",
    ],
    codeSnippets: [
      {
        title: "Your First Python Program",
        language: "python",
        code: `print("Hello, Python!")

name = "Asif"
print("Welcome,", name)

age = 25
print("Next year you will be", age + 1)`,
      },
      {
        title: "Using the Python REPL",
        language: "python",
        code: `print(2 + 3)

print("python".upper())

print(len([10, 20, 30]))`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a Python script that prints your name, your reason for learning Python, and the result of two arithmetic calculations. Run it from the terminal.",
    order: 1,
  },

  {
    slug: "variables-data-types-and-type-conversion",
    title: "2. Variables, Data Types & Type Conversion",
    summary:
      "Learn how Python stores values, how dynamic typing works, and how to use numbers, strings, booleans, None, and type conversion safely.",
    content: [
      "## What Is a Variable?",
      "A variable is a name that refers to a value. In Python, you do not declare a variable's type separately. The type belongs to the value itself, and a variable name can later refer to a value of another type.",
      "## Dynamic Typing",
      "Python is dynamically typed. This means type checking happens while the program runs, rather than requiring every variable type to be declared in advance.",
      "## Common Built-in Types",
      "Important beginner types include `int` for whole numbers, `float` for decimal numbers, `str` for text, `bool` for `True` or `False`, and `NoneType` whose only value is `None`.",
      "## Integers",
      "Python integers can represent very large whole numbers without the fixed-width limitations common in some languages. Operations such as addition, subtraction, multiplication, integer division, modulo, and exponentiation are built in.",
      "## Floating-Point Numbers",
      "Floats represent decimal values approximately using binary floating-point representation. This means expressions such as `0.1 + 0.2` may not equal exactly `0.3`. For financial calculations requiring exact decimal behavior, specialized tools such as `decimal.Decimal` are preferable.",
      "## Strings",
      "Strings are immutable sequences of Unicode characters. You can use single quotes, double quotes, or triple-quoted strings. Because strings are immutable, operations that appear to modify a string actually create a new string.",
      "## Booleans",
      "`True` and `False` represent truth values. Comparisons produce booleans, and booleans control conditional execution.",
      "## None",
      "`None` represents the absence of a value. It is not the same as `0`, an empty string, or `False`, even though some of those values are also considered falsy in boolean contexts.",
      "## type() and isinstance()",
      "`type(value)` shows the exact runtime type. `isinstance(value, SomeType)` is often more useful when checking whether a value belongs to a type or compatible subclass.",
      "## Type Conversion",
      "Use constructors such as `int()`, `float()`, `str()`, and `bool()` to convert compatible values. Conversion may fail when the input does not represent a valid target value.",
      "## Naming Conventions",
      "Python variables normally use `snake_case`. Names should describe meaning rather than implementation details. Constants are conventionally written using uppercase names such as `MAX_RETRIES`.",
      "## Multiple Assignment",
      "Python supports assigning multiple names at once and unpacking iterable values. This enables elegant swapping and structured assignment.",
      "## Mutable vs Immutable",
      "Numbers, strings, and tuples are immutable. Lists, dictionaries, and sets are mutable. This distinction becomes extremely important when passing values into functions and sharing references.",
    ],
    codeSnippets: [
      {
        title: "Basic Types",
        language: "python",
        code: `name = "Aisha"
age = 24
height = 1.67
is_learning = True
middle_name = None

print(type(name))
print(type(age))
print(type(height))
print(type(is_learning))
print(type(middle_name))`,
      },
      {
        title: "Safe Type Conversion",
        language: "python",
        code: `age_text = "25"
age = int(age_text)

price = float("199.50")
message = str(404)

print(age + 5)
print(price)
print(message)`,
      },
      {
        title: "Unpacking and Swapping",
        language: "python",
        code: `x = 10
y = 20

x, y = y, x
print(x, y)

name, age, city = ("Sara", 22, "Delhi")
print(name, age, city)`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Ask the user for their birth year using `input()`, convert it to an integer, calculate an approximate age, and print a readable result.",
    order: 2,
  },

  {
    slug: "operators-expressions-and-input-output",
    title: "3. Operators, Expressions & User Input",
    summary:
      "Master arithmetic, comparison, logical, membership, identity, assignment operators, precedence, and interactive input/output.",
    content: [
      "## Expressions",
      "An expression is code that produces a value. `2 + 3`, `name.upper()`, and `age >= 18` are all expressions.",
      "## Arithmetic Operators",
      "Python provides `+`, `-`, `*`, `/`, `//`, `%`, and `**`. Normal division `/` produces a float. Floor division `//` discards the fractional portion according to floor semantics.",
      "## Comparison Operators",
      "Use `==`, `!=`, `<`, `<=`, `>`, and `>=` to compare values. Comparison expressions return booleans.",
      "## Logical Operators",
      "`and`, `or`, and `not` combine or invert truth values. Python uses short-circuit evaluation, meaning the second part may not execute when the result is already known.",
      "## Assignment Operators",
      "Operators such as `+=`, `-=`, `*=`, and `/=` update a variable using its current value.",
      "## Membership Operators",
      "`in` and `not in` test whether a value exists in a collection or substring. They are heavily used with strings, lists, tuples, sets, and dictionaries.",
      "## Identity Operators",
      "`is` and `is not` compare object identity, not ordinary value equality. Use `==` for value comparison. A common legitimate use of `is` is checking `value is None`.",
      "## Truthy and Falsy Values",
      "Values such as `False`, `None`, numeric zero, empty strings, and empty collections are falsy. Most non-empty values are truthy.",
      "## Operator Precedence",
      "Python follows precedence rules, but parentheses are often preferable when an expression could be confusing. Readability matters more than showing that you memorized precedence.",
      "## input() Always Returns a String",
      "`input()` reads user text and returns a string. If you need a number, convert it explicitly and handle invalid input where appropriate.",
      "## f-Strings",
      "Formatted string literals provide a clean way to insert expressions into strings. They begin with `f` and place expressions inside braces.",
      "## Formatting Numbers",
      "f-strings can format decimal places, percentages, commas, alignment, and other presentation details.",
    ],
    codeSnippets: [
      {
        title: "Operators in Practice",
        language: "python",
        code: `a = 17
b = 5

print(a + b)   # 22
print(a - b)   # 12
print(a * b)   # 85
print(a / b)   # 3.4
print(a // b)  # 3
print(a % b)   # 2
print(a ** 2)  # 289

print(a > b)
print(a == b)
print(a != b)`,
      },
      {
        title: "Interactive Bill Calculator",
        language: "python",
        code: `price = float(input("Enter item price: "))
quantity = int(input("Enter quantity: "))

subtotal = price * quantity
tax_rate = 0.18
tax = subtotal * tax_rate
total = subtotal + tax

print(f"Subtotal: ₹{subtotal:.2f}")
print(f"Tax: ₹{tax:.2f}")
print(f"Total: ₹{total:.2f}")`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Build a BMI-style calculator that reads two numeric values from the user, performs a formula, and prints the answer rounded to two decimal places.",
    order: 3,
  },

  {
    slug: "conditional-statements-and-decision-making",
    title: "4. Conditional Statements & Decision Making",
    summary:
      "Learn if, elif, else, nested conditions, boolean reasoning, guard clauses, and Python's match statement.",
    content: [
      "## Why Conditions Matter",
      "Programs become useful when they can make decisions. Conditional statements allow different code paths to run depending on data and state.",
      "## if Statements",
      "An `if` block runs when its condition is truthy. The condition does not need to be literally `True`; Python evaluates its truth value.",
      "## elif",
      "`elif` adds mutually exclusive alternatives. Python checks branches from top to bottom and runs the first matching branch.",
      "## else",
      "`else` runs when no previous condition in the chain matched.",
      "## Ordering Conditions",
      "The order of conditions matters. More specific cases often need to be checked before broader ones, otherwise an earlier branch may capture them.",
      "## Nested Conditions",
      "Conditions can be nested, but excessive nesting makes programs hard to read. Combine related boolean expressions or use guard clauses when possible.",
      "## Guard Clauses",
      "A guard clause handles an exceptional or invalid case early and returns or exits, allowing the main logic to remain less indented.",
      "## Chained Comparisons",
      "Python allows expressions such as `18 <= age < 60`, which are both concise and readable.",
      "## Conditional Expressions",
      "Python supports a one-line conditional expression: `value_if_true if condition else value_if_false`. Use it for simple choices, not complex branching.",
      "## Structural Pattern Matching",
      "Modern Python supports `match` and `case` for structural pattern matching. It can provide clean branching for commands, shapes of data, and structured values.",
      "## Common Mistakes",
      "Typical mistakes include using `=` instead of comparison logic in languages where that is possible, writing conditions in the wrong order, confusing `is` with `==`, and creating deeply nested logic unnecessarily.",
    ],
    codeSnippets: [
      {
        title: "Grade Classifier",
        language: "python",
        code: `score = 84

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(grade)`,
      },
      {
        title: "Guard Clause Example",
        language: "python",
        code: `def withdraw(balance, amount):
    if amount <= 0:
        return "Amount must be positive"

    if amount > balance:
        return "Insufficient balance"

    balance -= amount
    return f"Remaining balance: {balance}"`,
      },
      {
        title: "match / case",
        language: "python",
        code: `command = "start"

match command:
    case "start":
        print("Starting application")
    case "stop":
        print("Stopping application")
    case "restart":
        print("Restarting application")
    case _:
        print("Unknown command")`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a ticket-price calculator where price depends on age, student status, and whether the booking is on a weekend.",
    order: 4,
  },

  {
    slug: "loops-and-iteration",
    title: "5. Loops & Iteration",
    summary:
      "Learn for loops, while loops, range, enumerate, zip, break, continue, nested loops, and practical iteration patterns.",
    content: [
      "## Why Loops Exist",
      "Loops repeat logic without duplicating code. The two main looping structures in Python are `for` and `while`.",
      "## for Loops",
      "Python's `for` loop iterates directly over items from an iterable rather than requiring a numeric counter in most cases.",
      "## range()",
      "`range()` generates integer sequences lazily. Common forms are `range(stop)`, `range(start, stop)`, and `range(start, stop, step)`.",
      "## while Loops",
      "A `while` loop repeats as long as its condition remains truthy. It is useful when the number of repetitions is unknown in advance.",
      "## Avoid Infinite Loops",
      "A while-loop condition must eventually become false unless an intentional infinite loop is being controlled with `break`.",
      "## break",
      "`break` exits the nearest loop immediately.",
      "## continue",
      "`continue` skips the rest of the current iteration and moves to the next iteration.",
      "## enumerate()",
      "`enumerate()` provides both an index and value while iterating, avoiding manual index bookkeeping.",
      "## zip()",
      "`zip()` pairs items from multiple iterables and stops when the shortest iterable is exhausted.",
      "## Nested Loops",
      "Nested loops are appropriate for grids, combinations, and pairwise work, but can increase time complexity quickly.",
      "## Loop else",
      "Python loops can have an `else` block that executes when the loop finishes normally rather than through `break`. It is less common but useful for search logic.",
      "## Common Mistakes",
      "Beginners often modify a list while iterating over it, forget to update while-loop state, use unnecessary index loops, or confuse `break` and `continue`.",
    ],
    codeSnippets: [
      {
        title: "for, range, enumerate, and zip",
        language: "python",
        code: `names = ["Aman", "Sara", "Ravi"]

for name in names:
    print(name)

for number in range(1, 6):
    print(number)

for index, name in enumerate(names, start=1):
    print(index, name)

scores = [88, 92, 75]

for name, score in zip(names, scores):
    print(f"{name}: {score}")`,
      },
      {
        title: "while Loop with Validation",
        language: "python",
        code: `attempts = 3

while attempts > 0:
    password = input("Password: ")

    if password == "python123":
        print("Access granted")
        break

    attempts -= 1
    print(f"{attempts} attempts remaining")
else:
    print("Account temporarily locked")`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a number-guessing loop that keeps asking until the user guesses correctly or reaches a maximum number of attempts.",
    order: 5,
  },

  {
    slug: "strings-in-depth",
    title: "6. Strings in Depth",
    summary:
      "Master indexing, slicing, immutability, common methods, formatting, parsing, searching, and text-processing patterns.",
    content: [
      "## Strings Are Sequences",
      "A Python string is a sequence of Unicode characters. This means you can index, slice, iterate, test membership, and use sequence operations.",
      "## Indexing",
      "Positive indexes start at zero. Negative indexes count backward from the end, so `text[-1]` is the last character.",
      "## Slicing",
      "The syntax `text[start:stop:step]` returns a new string. The stop index is excluded. Omitting boundaries lets Python infer the beginning or end.",
      "## Strings Are Immutable",
      "You cannot assign directly to a character position. To change text, create a new string using slicing, replacement, concatenation, or another transformation.",
      "## Useful Methods",
      "Important methods include `lower`, `upper`, `strip`, `replace`, `split`, `join`, `find`, `startswith`, `endswith`, `count`, and `title`.",
      "## split and join",
      "`split()` converts text into pieces. `join()` combines strings using a separator. Joining is often preferable to repeated concatenation when assembling many pieces.",
      "## Searching",
      "Use `in` for membership, `.find()` when you need an index with `-1` for absence, or `.index()` when absence should raise an error.",
      "## String Formatting",
      "f-strings are generally the clearest modern formatting approach. Expressions can be embedded directly and formatted using format specifiers.",
      "## Unicode Awareness",
      "Python strings represent Unicode text, but human text can contain characters whose visual appearance does not correspond one-to-one with simple byte counts. This matters more in internationalized and low-level text-processing applications.",
      "## Common Text Problems",
      "Typical exercises include palindrome checks, word counting, normalization, frequency analysis, parsing CSV-like text, validation, and extracting structured parts from strings.",
      "## Common Mistakes",
      "Remember that slicing returns new strings, `strip()` removes characters from the ends rather than the middle, and string comparison may be case-sensitive unless normalized.",
    ],
    codeSnippets: [
      {
        title: "Indexing and Slicing",
        language: "python",
        code: `text = "Python Programming"

print(text[0])
print(text[-1])
print(text[:6])
print(text[7:])
print(text[::-1])`,
      },
      {
        title: "Word Frequency",
        language: "python",
        code: `sentence = "python is simple and python is powerful"

words = sentence.lower().split()
counts = {}

for word in words:
    counts[word] = counts.get(word, 0) + 1

print(counts)`,
      },
      {
        title: "Normalize User Input",
        language: "python",
        code: `raw_email = "  USER@Example.COM  "

email = raw_email.strip().lower()

print(email)`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Write a function that accepts a sentence and returns the most frequently occurring word, ignoring letter case and extra spaces.",
    order: 6,
  },

  {
    slug: "lists-tuples-sets-and-dictionaries",
    title: "7. Lists, Tuples, Sets & Dictionaries",
    summary:
      "Develop a strong command of Python's essential collection types, their methods, complexity trade-offs, mutability, and common use cases.",
    content: [
      "## Python Collections",
      "Python provides powerful built-in collection types. Choosing the right one makes code simpler and often more efficient.",
      "## Lists",
      "Lists are ordered, mutable sequences. They can contain mixed types, duplicate values, and nested collections.",
      "## List Operations",
      "Important methods include `append`, `extend`, `insert`, `remove`, `pop`, `sort`, `reverse`, `count`, and `index`.",
      "## Copying Lists",
      "Assignment does not copy a list; it creates another reference to the same list. Use `.copy()`, slicing, or `list()` for a shallow copy. Nested mutable values still remain shared in a shallow copy.",
      "## Tuples",
      "Tuples are ordered and immutable. They are useful for fixed groups of values, returning multiple values, dictionary keys when contents are hashable, and communicating that a sequence should not be mutated.",
      "## Sets",
      "Sets store unique hashable values. They are ideal for membership checks, deduplication, intersections, unions, and set differences.",
      "## Dictionaries",
      "Dictionaries map unique hashable keys to values. They preserve insertion order in modern Python and are central to structured data processing.",
      "## Dictionary Methods",
      "Useful operations include `.get()`, `.items()`, `.keys()`, `.values()`, `.update()`, `.pop()`, and `.setdefault()`.",
      "## Nested Collections",
      "Real data often combines dictionaries and lists. Learning how to navigate nested structures is essential for JSON, APIs, configuration, and database results.",
      "## Mutability",
      "Lists, sets, and dictionaries are mutable. Tuples are immutable, though a tuple can contain mutable objects.",
      "## Hashability",
      "Dictionary keys and set elements must be hashable. Immutable scalar values and tuples of hashable values are commonly hashable; lists and dictionaries are not.",
      "## Choosing a Collection",
      "Use a list for ordered mutable items, a tuple for fixed records or immutable grouping, a set for uniqueness/membership, and a dictionary for key-value relationships.",
      "## Common Mistakes",
      "Common problems include aliasing instead of copying, modifying collections during iteration, assuming set order, accessing missing dictionary keys directly when absence is expected, and using mutable values as dictionary keys.",
    ],
    codeSnippets: [
      {
        title: "Working with Lists",
        language: "python",
        code: `numbers = [10, 20, 30]

numbers.append(40)
numbers.extend([50, 60])

removed = numbers.pop()

print(numbers)
print("Removed:", removed)

numbers.sort(reverse=True)
print(numbers)`,
      },
      {
        title: "Set Operations",
        language: "python",
        code: `frontend = {"html", "css", "javascript", "react"}
backend = {"python", "javascript", "sql"}

print(frontend & backend)  # intersection
print(frontend | backend)  # union
print(frontend - backend)  # difference`,
      },
      {
        title: "Nested Dictionary Data",
        language: "python",
        code: `user = {
    "name": "Asif",
    "skills": ["Python", "JavaScript", "MongoDB"],
    "address": {
        "city": "Delhi",
        "country": "India"
    }
}

print(user["name"])
print(user["skills"][0])
print(user["address"]["city"])`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a small inventory system using a dictionary where product names map to quantity and price. Add, update, remove, and calculate the total inventory value.",
    order: 7,
  },

  {
    slug: "functions-parameters-and-scope",
    title: "8. Functions, Parameters, Return Values & Scope",
    summary:
      "Learn to break programs into reusable functions and understand parameters, arguments, return values, scope, *args, **kwargs, and function design.",
    content: [
      "## Why Functions Matter",
      "Functions organize behavior into reusable units. They reduce duplication, improve readability, make testing easier, and help programs grow without becoming one giant script.",
      "## Defining Functions",
      "Functions are defined with `def`, followed by a name, parameters, and an indented body.",
      "## Parameters and Arguments",
      "Parameters are names in the function definition. Arguments are actual values passed when calling the function.",
      "## Return Values",
      "`return` sends a value back to the caller and immediately ends the function. A function without an explicit return returns `None`.",
      "## Positional Arguments",
      "Positional arguments are matched according to order.",
      "## Keyword Arguments",
      "Keyword arguments are matched by parameter name and can make calls more readable.",
      "## Default Parameters",
      "Parameters can have default values. Be careful with mutable defaults such as `[]` or `{}` because the same object is reused between calls.",
      "## *args",
      "`*args` collects extra positional arguments into a tuple.",
      "## **kwargs",
      "`**kwargs` collects extra keyword arguments into a dictionary.",
      "## Scope",
      "Names defined inside a function are normally local. Python resolves names using the LEGB model: Local, Enclosing, Global, Built-in.",
      "## global and nonlocal",
      "`global` and `nonlocal` can rebind names outside the current local scope, but overusing them often makes programs harder to reason about.",
      "## Pure Functions",
      "A function is easier to test when its output depends primarily on its inputs and it avoids unnecessary external side effects.",
      "## Function Documentation",
      "Docstrings explain what a function does, its parameters, return value, and important behavior. They are especially valuable for reusable public functions.",
      "## Common Mistakes",
      "Watch for printing when a function should return, mutable default arguments, overly large functions, unclear parameter names, and unexpected modification of mutable arguments.",
    ],
    codeSnippets: [
      {
        title: "A Clean Function",
        language: "python",
        code: `def calculate_total(price, quantity=1, discount=0):
    """Return the final price after applying a percentage discount."""
    subtotal = price * quantity
    discount_amount = subtotal * (discount / 100)
    return subtotal - discount_amount

total = calculate_total(
    price=500,
    quantity=2,
    discount=10
)

print(total)`,
      },
      {
        title: "*args and **kwargs",
        language: "python",
        code: `def total_numbers(*numbers):
    return sum(numbers)

print(total_numbers(10, 20, 30, 40))

def create_profile(**details):
    return details

profile = create_profile(
    name="Sara",
    role="Developer",
    city="Delhi"
)

print(profile)`,
      },
      {
        title: "Avoid Mutable Default Arguments",
        language: "python",
        code: `# Avoid this:
# def add_item(item, items=[]):
#     items.append(item)
#     return items

def add_item(item, items=None):
    if items is None:
        items = []

    items.append(item)
    return items`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Build a function-based shopping-cart calculator using separate functions for subtotal, discount, tax, and final total. Keep each function focused on one responsibility.",
    order: 8,
  },

  {
    slug: "comprehensions-lambda-and-functional-tools",
    title: "9. Comprehensions, Lambda Functions & Functional Tools",
    summary:
      "Write expressive transformations using list, set, and dictionary comprehensions, lambdas, map, filter, sorted, any, and all.",
    content: [
      "## Comprehensions",
      "Comprehensions create collections from iterables using compact declarative syntax. They are useful when transforming or filtering data in a readable way.",
      "## List Comprehensions",
      "A list comprehension typically combines an expression with a `for` clause and an optional condition.",
      "## Set Comprehensions",
      "Set comprehensions are useful when transformed results should remain unique.",
      "## Dictionary Comprehensions",
      "Dictionary comprehensions generate key-value pairs from existing data.",
      "## Nested Comprehensions",
      "Nested comprehensions can flatten or transform nested structures, but if they become difficult to read, ordinary loops are better.",
      "## Lambda Functions",
      "`lambda` creates a small anonymous function containing one expression. Lambdas are most useful as short callback functions for operations such as sorting.",
      "## sorted() and key",
      "`sorted()` returns a new sorted list. Its `key` argument can extract the property used for ordering.",
      "## map()",
      "`map()` lazily applies a function to each item. Comprehensions are often easier to read for simple transformations, but understanding map is useful.",
      "## filter()",
      "`filter()` lazily keeps values for which a predicate is truthy. Again, comprehensions are often more idiomatic for straightforward filtering.",
      "## any() and all()",
      "`any()` checks whether at least one item is truthy. `all()` checks whether every item is truthy.",
      "## Readability First",
      "Compact code is not automatically better code. Prefer a regular loop when a comprehension contains complex nested logic or side effects.",
    ],
    codeSnippets: [
      {
        title: "Comprehensions",
        language: "python",
        code: `numbers = [1, 2, 3, 4, 5, 6]

squares = [n * n for n in numbers]
even_squares = [n * n for n in numbers if n % 2 == 0]

unique_lengths = {len(word) for word in ["cat", "python", "dog", "code"]}

square_map = {n: n * n for n in numbers}

print(squares)
print(even_squares)
print(unique_lengths)
print(square_map)`,
      },
      {
        title: "Sorting Structured Data",
        language: "python",
        code: `users = [
    {"name": "Aman", "score": 76},
    {"name": "Sara", "score": 95},
    {"name": "Ravi", "score": 88},
]

ranked = sorted(
    users,
    key=lambda user: user["score"],
    reverse=True
)

print(ranked)`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Given a list of product dictionaries, create a new list containing only in-stock products priced below a chosen limit, sorted from cheapest to most expensive.",
    order: 9,
  },

  {
    slug: "modules-packages-and-virtual-environments",
    title: "10. Modules, Packages, Imports & Virtual Environments",
    summary:
      "Learn how Python projects are split across files, how imports work, how packages are organized, and how dependencies are isolated.",
    content: [
      "## Why Modules Matter",
      "As programs grow, placing everything in one file becomes difficult to maintain. A Python module is simply a Python file that can contain functions, classes, constants, and executable code.",
      "## import",
      "The `import` statement makes names from another module available. You can import a whole module or selected names.",
      "## Module Namespaces",
      "Using `import math` and then `math.sqrt()` makes the source of the function explicit. Importing selected names can be convenient but should not make code ambiguous.",
      "## __name__",
      'Every module has a `__name__`. When a file is executed directly, its value is usually `"__main__"`. When imported, it becomes the module name.',
      "## The Main Guard",
      '`if __name__ == "__main__":` allows code to run only when a file is executed directly, not when imported as a module.',
      "## Packages",
      "A package organizes multiple modules under a directory structure. Real applications often contain packages for models, services, utilities, configuration, and other concerns.",
      "## Standard Library",
      "Python ships with a large standard library. Before installing a package, check whether Python already provides what you need.",
      "## Third-Party Packages",
      "Packages can be installed from Python package repositories using package-management tooling such as `pip`.",
      "## Virtual Environments",
      "A virtual environment creates an isolated Python environment for one project so its dependencies do not conflict with other projects.",
      "## Dependency Files",
      "Projects often record dependencies in files or modern project configuration so others can reproduce the environment.",
      "## Import Design",
      "Avoid circular imports by organizing responsibilities clearly. Utility modules should not depend unnecessarily on high-level application modules.",
      "## Common Mistakes",
      "Beginners often name files after standard modules such as `random.py`, install dependencies globally, use wildcard imports, or execute side-effect-heavy code at import time.",
    ],
    codeSnippets: [
      {
        title: "A Simple Module",
        language: "python",
        code: `# math_utils.py
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b


# app.py
import math_utils

print(math_utils.add(2, 3))
print(math_utils.multiply(4, 5))`,
      },
      {
        title: "Main Guard",
        language: "python",
        code: `def main():
    print("Application started")

if __name__ == "__main__":
    main()`,
      },
      {
        title: "Virtual Environment Commands",
        language: "python",
        code: `# Create a virtual environment:
# python -m venv .venv

# Windows PowerShell:
# .venv\\Scripts\\Activate.ps1

# macOS/Linux:
# source .venv/bin/activate

# Install a package:
# python -m pip install requests

# Inspect installed packages:
# python -m pip list`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Split a calculator program into `calculator.py` containing reusable functions and `app.py` containing user interaction. Run user interaction only through the main guard.",
    order: 10,
  },

  {
    slug: "object-oriented-programming",
    title: "11. Object-Oriented Programming: Classes & Objects",
    summary:
      "Understand classes, instances, attributes, methods, constructors, class attributes, static methods, class methods, and encapsulation.",
    content: [
      "## What Is Object-Oriented Programming?",
      "Object-oriented programming organizes related data and behavior into objects. A class describes how objects are created and what behavior they provide.",
      "## Classes and Instances",
      "A class is a blueprint. An instance is a concrete object created from that class. Different instances can hold different attribute values while sharing method definitions.",
      "## __init__",
      "`__init__` initializes a newly created instance. The first parameter is conventionally named `self`, which refers to the instance receiving the method call.",
      "## Instance Attributes",
      "Attributes assigned through `self` belong to each instance.",
      "## Instance Methods",
      "Instance methods operate on instance state and receive `self` automatically.",
      "## Class Attributes",
      "Class attributes are stored on the class and are shared unless shadowed by an instance attribute.",
      "## Class Methods",
      "A `@classmethod` receives the class as `cls`. It is commonly used for alternate constructors or behavior tied to the class rather than one instance.",
      "## Static Methods",
      "A `@staticmethod` does not automatically receive an instance or class. It is useful when a helper logically belongs near the class but does not use object state.",
      "## Encapsulation in Python",
      "Python relies heavily on conventions rather than strict private enforcement. A leading underscore communicates that an attribute is intended for internal use.",
      "## Properties",
      "`@property` lets method logic be accessed using attribute syntax. This is useful for validation, computed values, or preserving an interface while implementation changes.",
      "## When to Use Classes",
      "Use classes when data and behavior naturally belong together and multiple instances or stateful objects make the domain clearer. Do not create classes merely because object-oriented programming exists.",
      "## Common Mistakes",
      "Typical mistakes include forgetting `self`, accidentally sharing mutable class attributes across instances, placing unrelated behavior inside classes, and writing classes that only hold data with no meaningful behavior.",
    ],
    codeSnippets: [
      {
        title: "A Beginner-Friendly BankAccount Class",
        language: "python",
        code: `class BankAccount:
    bank_name = "Python Bank"

    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")

        self._balance += amount

    def withdraw(self, amount):
        if amount > self._balance:
            raise ValueError("Insufficient balance")

        self._balance -= amount

account = BankAccount("Sara", 1000)
account.deposit(500)
account.withdraw(200)

print(account.balance)`,
      },
      {
        title: "Class Method as Alternate Constructor",
        language: "python",
        code: `class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    @classmethod
    def from_string(cls, text):
        name, email = text.split(",")
        return cls(name.strip(), email.strip())

user = User.from_string("Aman, aman@example.com")

print(user.name)
print(user.email)`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a `Product` class with name, price, stock, a `sell(quantity)` method, a `restock(quantity)` method, and a read-only property that returns current inventory value.",
    order: 11,
  },

  {
    slug: "inheritance-composition-and-dunder-methods",
    title: "12. Inheritance, Composition & Special Methods",
    summary:
      "Learn inheritance, method overriding, super(), composition, polymorphism, dataclasses, and Python's special dunder methods.",
    content: [
      "## Inheritance",
      "Inheritance lets one class reuse or specialize behavior from another class. The new class is often called a subclass, while the inherited class is a base or parent class.",
      "## Method Overriding",
      "A subclass can provide its own version of an inherited method.",
      "## super()",
      "`super()` provides access to behavior from the parent class and is commonly used when extending parent initialization.",
      "## Polymorphism",
      "Different objects can support the same operation with different implementations. Python often relies on behavior rather than requiring rigid inheritance hierarchies.",
      "## Duck Typing",
      "A common Python idea is that if an object provides the required behavior, its exact class may not matter. This supports flexible interfaces.",
      "## Composition",
      "Composition builds objects using other objects. It often produces more flexible designs than deep inheritance hierarchies.",
      "## Prefer Composition When Appropriate",
      "If the relationship is 'has-a' rather than 'is-a', composition is usually more natural. A `Car` has an `Engine`; it is not an Engine.",
      "## Special Methods",
      "Methods such as `__str__`, `__repr__`, `__len__`, `__eq__`, and `__iter__` let custom objects integrate naturally with Python syntax and built-in functions.",
      "## dataclasses",
      "The `dataclasses` module reduces boilerplate for classes mainly used to store structured data.",
      "## Equality",
      "Without custom equality behavior, instances are generally compared by identity. Defining suitable data models or dataclasses can provide value-based comparison.",
      "## Keep Hierarchies Shallow",
      "Very deep inheritance chains are difficult to understand and modify. Favor clear responsibilities and small abstractions.",
      "## Common Mistakes",
      "Common mistakes include inheritance for code reuse without a true subtype relationship, forgetting parent initialization, overusing magic methods, and creating classes with unclear ownership of responsibilities.",
    ],
    codeSnippets: [
      {
        title: "Inheritance and Method Overriding",
        language: "python",
        code: `class Employee:
    def __init__(self, name):
        self.name = name

    def describe_role(self):
        return "Employee"


class Developer(Employee):
    def __init__(self, name, language):
        super().__init__(name)
        self.language = language

    def describe_role(self):
        return f"Developer using {self.language}"


developer = Developer("Sara", "Python")
print(developer.describe_role())`,
      },
      {
        title: "Composition",
        language: "python",
        code: `class Engine:
    def start(self):
        return "Engine started"


class Car:
    def __init__(self, model, engine):
        self.model = model
        self.engine = engine

    def start(self):
        return self.engine.start()


car = Car("Demo Car", Engine())
print(car.start())`,
      },
      {
        title: "Dataclass",
        language: "python",
        code: `from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    stock: int = 0

    def inventory_value(self):
        return self.price * self.stock

product = Product("Keyboard", 1499.0, 10)
print(product)
print(product.inventory_value())`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Model an order system using composition: an `Order` contains multiple `OrderItem` objects. Use a dataclass for `OrderItem` and calculate the order total.",
    order: 12,
  },

  {
    slug: "exceptions-and-error-handling",
    title: "13. Exceptions & Error Handling",
    summary:
      "Learn how Python reports runtime problems and how to handle expected failures using try, except, else, finally, raise, and custom exceptions.",
    content: [
      "## What Is an Exception?",
      "An exception is an object representing an error or unusual condition that interrupts normal program flow.",
      "## Syntax Errors vs Exceptions",
      "A syntax error means Python cannot correctly parse the code. An exception happens while valid Python code is running.",
      "## try and except",
      "Place operations that may fail in a `try` block and handle specific expected exceptions using `except`.",
      "## Catch Specific Exceptions",
      "Avoid broad `except:` blocks unless there is a strong reason. Catching specific exceptions helps distinguish expected failures from programming bugs.",
      "## else",
      "The `else` block runs only when the `try` block succeeds without raising an exception.",
      "## finally",
      "`finally` executes whether an exception occurs or not. It is useful for cleanup, although context managers often provide cleaner resource management.",
      "## raise",
      "`raise` lets your own code signal invalid state or input using an exception.",
      "## Custom Exceptions",
      "Domain-specific exception classes can make errors clearer in larger applications.",
      "## EAFP",
      "Python code often follows the style 'Easier to Ask Forgiveness than Permission': attempt an operation and handle the expected exception rather than checking every precondition separately.",
      "## Exceptions Are Not for Normal Control Flow Everywhere",
      "Exceptions are useful for exceptional or failure conditions, but deliberately triggering exceptions for routine decisions can reduce clarity.",
      "## Error Messages",
      "Useful exceptions explain what went wrong and, when appropriate, what value or condition caused it.",
      "## Common Mistakes",
      "Do not silently ignore failures, catch `Exception` and discard useful debugging information, or use exceptions to hide logic bugs.",
    ],
    codeSnippets: [
      {
        title: "Handling Invalid User Input",
        language: "python",
        code: `try:
    age = int(input("Enter your age: "))
except ValueError:
    print("Please enter a valid whole number.")
else:
    print(f"You entered {age}.")`,
      },
      {
        title: "Raise a Meaningful Exception",
        language: "python",
        code: `def set_discount(percent):
    if not 0 <= percent <= 100:
        raise ValueError("Discount must be between 0 and 100")

    return percent

print(set_discount(20))`,
      },
      {
        title: "Custom Exception",
        language: "python",
        code: `class InsufficientBalanceError(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientBalanceError(
            f"Cannot withdraw {amount}; balance is {balance}"
        )

    return balance - amount`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a reusable function that repeatedly asks for an integer within a minimum and maximum range and handles invalid text without crashing.",
    order: 13,
  },

  {
    slug: "files-paths-csv-and-json",
    title: "14. Files, Paths, CSV & JSON",
    summary:
      "Learn safe file handling with context managers, pathlib, text files, CSV, JSON, encoding, and practical data-processing workflows.",
    content: [
      "## Why File Handling Matters",
      "Files allow programs to persist data beyond one execution and communicate with other tools. Common formats include plain text, CSV, and JSON.",
      "## Opening Files",
      "Python's `open()` can read or write files. Common modes include `r`, `w`, `a`, and binary variants.",
      "## Context Managers",
      "Use `with open(...) as file:` so the file is closed automatically even if an exception occurs.",
      "## Reading Text",
      "`read()` loads the entire file, `readline()` reads one line, and iteration over the file processes lines lazily.",
      "## Writing Text",
      "`write()` writes strings. Opening with `w` replaces existing contents, while `a` appends.",
      "## Encoding",
      'Specify encodings such as `encoding="utf-8"` when working with text files to make behavior more predictable across environments.',
      "## pathlib",
      "`pathlib.Path` provides an object-oriented, cross-platform way to construct, inspect, read, and write paths.",
      "## CSV",
      "The `csv` module handles comma-separated data while correctly dealing with quoting and delimiters.",
      "## JSON",
      "JSON maps naturally to Python dictionaries, lists, strings, numbers, booleans, and `None`. Use the `json` module rather than manually parsing JSON text.",
      "## Serialization",
      "Serialization converts in-memory data into a format that can be stored or transmitted. Deserialization reconstructs useful program values from that representation.",
      "## File Safety",
      "Validate paths and inputs when file names come from users, avoid overwriting important files accidentally, and handle missing-file conditions.",
      "## Common Mistakes",
      "Do not forget that JSON keys are strings in serialized form, CSV is not safely parsed by simple `.split(',')` in all cases, and file paths may differ across operating systems.",
    ],
    codeSnippets: [
      {
        title: "Read and Write Text with pathlib",
        language: "python",
        code: `from pathlib import Path

file_path = Path("notes.txt")

file_path.write_text(
    "Learning Python\\nPractice every day\\n",
    encoding="utf-8"
)

content = file_path.read_text(encoding="utf-8")
print(content)`,
      },
      {
        title: "Working with JSON",
        language: "python",
        code: `import json

user = {
    "name": "Sara",
    "skills": ["Python", "SQL"],
    "active": True
}

with open("user.json", "w", encoding="utf-8") as file:
    json.dump(user, file, indent=2)

with open("user.json", "r", encoding="utf-8") as file:
    loaded_user = json.load(file)

print(loaded_user["skills"])`,
      },
      {
        title: "CSV DictReader and DictWriter",
        language: "python",
        code: `import csv

rows = [
    {"name": "Aman", "score": 88},
    {"name": "Sara", "score": 94},
]

with open("scores.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=["name", "score"]
    )
    writer.writeheader()
    writer.writerows(rows)

with open("scores.csv", "r", encoding="utf-8") as file:
    reader = csv.DictReader(file)

    for row in reader:
        print(row)`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Build a small contact manager that stores contacts in JSON. It should load existing contacts, add a new contact, search by name, and save changes.",
    order: 14,
  },

  {
    slug: "iterators-generators-and-decorators",
    title: "15. Iterators, Generators & Decorators",
    summary:
      "Understand Python's iteration protocol, lazy generators, yield, generator expressions, closures, and function decorators.",
    content: [
      "## Iterable vs Iterator",
      "An iterable is an object you can iterate over, such as a list or string. An iterator produces items one at a time and keeps track of iteration state.",
      "## iter() and next()",
      "`iter()` obtains an iterator. `next()` asks that iterator for the next value. When no values remain, the iterator raises `StopIteration`.",
      "## for Loops Use Iterators",
      "A Python `for` loop automatically obtains an iterator and repeatedly requests values until iteration finishes.",
      "## Generators",
      "A generator function uses `yield` to produce values lazily. Execution pauses after each yielded value and resumes later with its local state preserved.",
      "## Why Generators Matter",
      "Generators avoid creating every result in memory at once. They are useful for large files, streams, pipelines, infinite sequences, and expensive data generation.",
      "## Generator Expressions",
      "Generator expressions resemble list comprehensions but use parentheses and produce values lazily.",
      "## Closures",
      "A closure is a function that remembers values from an enclosing scope even after that outer function has finished.",
      "## Decorators",
      "A decorator takes a callable and returns a callable, usually adding reusable behavior such as logging, timing, authorization, caching, or validation.",
      "## @ Syntax",
      "The `@decorator` syntax is a clean way to replace a function with the result of passing that function into a decorator.",
      "## functools.wraps",
      "Decorators should commonly use `functools.wraps` so metadata such as function name and documentation are preserved.",
      "## Do Not Overuse Decorators",
      "Decorators are powerful but can hide control flow. Use them for behavior that is genuinely cross-cutting and reusable.",
      "## Common Mistakes",
      "Beginners often expect a generator to be reusable after it is exhausted, forget to yield, accidentally return instead of yield, or write decorators that discard return values and arguments.",
    ],
    codeSnippets: [
      {
        title: "A Generator Function",
        language: "python",
        code: `def countdown(start):
    current = start

    while current > 0:
        yield current
        current -= 1

for number in countdown(3):
    print(number)`,
      },
      {
        title: "Lazy Processing",
        language: "python",
        code: `numbers = range(1_000_000)

squares = (
    number * number
    for number in numbers
    if number % 2 == 0
)

for value in squares:
    if value > 100:
        break

    print(value)`,
      },
      {
        title: "Simple Timing Decorator",
        language: "python",
        code: `from functools import wraps
from time import perf_counter

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = perf_counter()
        result = func(*args, **kwargs)
        elapsed = perf_counter() - start

        print(f"{func.__name__} took {elapsed:.6f}s")
        return result

    return wrapper

@timer
def calculate():
    return sum(range(100_000))

print(calculate())`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a decorator that logs a function's name, arguments, and return value without changing the function's behavior.",
    order: 15,
  },

  {
    slug: "standard-library-essentials",
    title: "16. Python Standard Library Essentials",
    summary:
      "Explore high-value standard-library modules for dates, collections, paths, math, randomization, regular expressions, statistics, and utilities.",
    content: [
      "## Batteries Included",
      "Python's standard library contains a large set of production-quality modules that solve common problems without third-party dependencies.",
      "## datetime",
      "Use `datetime` for dates and times, arithmetic with timedeltas, parsing, and formatting. Time-zone-aware programming requires careful handling of timezone information.",
      "## collections",
      "`collections` provides specialized structures such as `Counter`, `defaultdict`, `deque`, and `namedtuple`.",
      "## Counter",
      "`Counter` is ideal for frequency counting and exposes helpers for most-common values and arithmetic between counters.",
      "## defaultdict",
      "`defaultdict` creates missing values using a factory and can simplify grouping or adjacency-list code.",
      "## deque",
      "`deque` supports efficient additions and removals from both ends and is a better general-purpose queue than repeated list `pop(0)`.",
      "## re",
      "The `re` module provides regular-expression matching, searching, substitution, and extraction. Regex is powerful for pattern-based text work but should not replace simpler string operations when they are sufficient.",
      "## math and statistics",
      "`math` contains mathematical functions and constants, while `statistics` provides descriptive-statistics helpers.",
      "## random",
      "`random` is useful for simulations and ordinary pseudo-random behavior. It should not be used for security-sensitive secrets or tokens; the `secrets` module is designed for that purpose.",
      "## pathlib",
      "`pathlib` provides readable cross-platform file-system paths and should be part of a modern Python developer's toolkit.",
      "## itertools",
      "`itertools` provides memory-efficient iterator building blocks for combinations, permutations, chaining, grouping, and repeated iteration patterns.",
      "## Common Mistakes",
      "Do not reinvent functionality already provided by the standard library, use `random` for passwords, or parse dates manually when established library behavior is safer.",
    ],
    codeSnippets: [
      {
        title: "Counter and defaultdict",
        language: "python",
        code: `from collections import Counter, defaultdict

words = ["python", "js", "python", "sql", "python", "js"]

counts = Counter(words)
print(counts.most_common(2))

groups = defaultdict(list)

for word in words:
    groups[len(word)].append(word)

print(dict(groups))`,
      },
      {
        title: "Dates and Times",
        language: "python",
        code: `from datetime import datetime, timedelta

now = datetime.now()
next_week = now + timedelta(days=7)

print(now.strftime("%Y-%m-%d %H:%M"))
print(next_week.strftime("%Y-%m-%d"))`,
      },
      {
        title: "Regular Expression Search",
        language: "python",
        code: `import re

text = "Contact us at team@example.com"

match = re.search(
    r"[\\w.-]+@[\\w.-]+\\.\\w+",
    text
)

if match:
    print(match.group())`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Read a paragraph and use `Counter` to print the five most common normalized words. Then use `datetime` to timestamp the generated report.",
    order: 16,
  },

  {
    slug: "testing-debugging-and-code-quality",
    title: "17. Testing, Debugging & Code Quality",
    summary:
      "Learn assertions, unittest, debugging techniques, logging, type hints, docstrings, style, and strategies for finding bugs systematically.",
    content: [
      "## Why Testing Matters",
      "Testing gives confidence that code behaves as expected and continues behaving correctly after changes. Good tests also clarify intended behavior.",
      "## Assertions",
      "`assert` is useful for internal invariants and tests, but application input validation should not depend on assertions because they can be disabled.",
      "## Unit Tests",
      "Unit tests focus on small pieces of behavior in isolation. Python's standard `unittest` module provides test cases, assertions, setup hooks, and test discovery.",
      "## Arrange, Act, Assert",
      "A useful test structure is: arrange the initial data, act by calling the code, and assert the expected result.",
      "## Test Edge Cases",
      "Do not test only the happy path. Include empty input, boundaries, invalid values, duplicates, and known failure scenarios.",
      "## Debugging",
      "Debugging is the process of identifying why actual behavior differs from expected behavior. Reduce the problem, inspect assumptions, reproduce reliably, and observe program state.",
      "## print vs Debugger",
      "Print statements are useful for quick inspection, but an interactive debugger can pause execution, inspect variables, and move through code step-by-step.",
      "## Logging",
      "The `logging` module is preferable to scattered prints in production applications because it supports levels, formatting, destinations, and configuration.",
      "## Type Hints",
      "Type hints document expected types and help static-analysis tools catch mistakes. Python still remains dynamically typed at runtime unless additional validation is used.",
      "## Docstrings",
      "Docstrings document public modules, classes, and functions. Good documentation explains behavior, inputs, outputs, and exceptional cases.",
      "## Code Style",
      "Readable naming, small focused functions, consistent formatting, and clear module boundaries matter more than clever syntax.",
      "## Refactoring",
      "Refactoring improves structure without intentionally changing behavior. Tests make refactoring safer.",
      "## Common Mistakes",
      "Avoid tests that depend on one another, overly broad tests that fail for many reasons, debugging by random code changes, and ignoring error tracebacks.",
    ],
    codeSnippets: [
      {
        title: "A Testable Function",
        language: "python",
        code: `def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("b cannot be zero")

    return a / b`,
      },
      {
        title: "Unit Tests",
        language: "python",
        code: `import unittest

class DivideTests(unittest.TestCase):
    def test_divides_numbers(self):
        self.assertEqual(divide(10, 2), 5)

    def test_rejects_zero_divisor(self):
        with self.assertRaises(ValueError):
            divide(10, 0)

if __name__ == "__main__":
    unittest.main()`,
      },
      {
        title: "Basic Logging",
        language: "python",
        code: `import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:%(message)s"
)

logging.info("Application started")

try:
    result = 10 / 0
except ZeroDivisionError:
    logging.exception("Calculation failed")`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Write tests for a function that calculates shipping cost. Cover normal cost, free-shipping threshold, invalid negative amount, and a boundary value.",
    order: 17,
  },

  {
    slug: "http-apis-and-json",
    title: "18. HTTP, REST APIs & JSON with Python",
    summary:
      "Understand requests and responses, HTTP methods, status codes, JSON payloads, query parameters, headers, errors, and API consumption.",
    content: [
      "## What Is an API?",
      "An API provides a defined way for software systems to communicate. Web APIs commonly expose resources over HTTP and exchange JSON.",
      "## HTTP Requests and Responses",
      "A client sends a request containing a method, URL, headers, and sometimes a body. A server returns a status code, headers, and response body.",
      "## Common HTTP Methods",
      "`GET` retrieves data, `POST` commonly creates data, `PUT` replaces a resource, `PATCH` partially updates it, and `DELETE` removes it.",
      "## Status Codes",
      "2xx generally indicates success, 4xx indicates a client-side problem, and 5xx indicates a server-side problem. Specific status codes communicate more precise meaning.",
      "## JSON APIs",
      "JSON responses usually become Python dictionaries and lists after parsing.",
      "## Query Parameters",
      "Query parameters communicate filters, pagination, search terms, or other optional request values through the URL.",
      "## Headers",
      "Headers can contain metadata such as content type, authorization credentials, user agent, and caching information.",
      "## Timeouts",
      "Network calls should generally use reasonable timeouts so an application does not wait forever on an unavailable service.",
      "## API Errors",
      "Handle network failures, unsuccessful status codes, invalid JSON, and missing fields. External systems are outside your control.",
      "## Secrets",
      "API keys should not be hard-coded into source files committed to version control. Environment variables are a common approach for configuration secrets.",
      "## Pagination",
      "Many APIs return data in pages. Real clients often need to continue requesting pages until the required data has been collected.",
      "## Rate Limits",
      "APIs may restrict request frequency. Respect documented limits and retry guidance.",
      "## Common Mistakes",
      "Do not assume every response is JSON, ignore status codes, omit timeouts, log sensitive credentials, or trust remote data without validation.",
    ],
    codeSnippets: [
      {
        title: "GET Request with requests",
        language: "python",
        code: `import requests

url = "https://jsonplaceholder.typicode.com/users"

response = requests.get(
    url,
    timeout=10
)

response.raise_for_status()

users = response.json()

for user in users[:3]:
    print(user["name"])`,
      },
      {
        title: "Query Parameters and Error Handling",
        language: "python",
        code: `import requests

try:
    response = requests.get(
        "https://jsonplaceholder.typicode.com/posts",
        params={"userId": 1},
        timeout=10
    )

    response.raise_for_status()
    posts = response.json()

except requests.RequestException as error:
    print(f"Request failed: {error}")
else:
    print(f"Received {len(posts)} posts")`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Build a small CLI program that calls a public JSON API, accepts one search/filter input from the user, handles request failures, and displays selected fields cleanly.",
    order: 18,
  },

  {
    slug: "sqlite-and-database-programming",
    title: "19. SQLite & Database Programming",
    summary:
      "Learn database fundamentals, SQL operations, SQLite connections, parameters, transactions, and safe CRUD programming from Python.",
    content: [
      "## Why Databases?",
      "Files are useful, but databases provide structured querying, constraints, transactions, indexing, and reliable updates for growing applications.",
      "## Relational Databases",
      "Relational databases store structured data in tables composed of rows and columns. Relationships connect records across tables.",
      "## SQLite",
      "SQLite is a lightweight relational database stored in a local file. Python includes built-in SQLite support through the `sqlite3` module.",
      "## Connections and Cursors",
      "A connection manages communication with the database. SQL can be executed through the connection or cursor APIs.",
      "## Creating Tables",
      "`CREATE TABLE` defines columns, types, constraints, and primary keys.",
      "## CRUD",
      "CRUD means Create, Read, Update, and Delete. These operations map naturally to `INSERT`, `SELECT`, `UPDATE`, and `DELETE`.",
      "## Parameterized Queries",
      "Never build SQL by concatenating untrusted values into query strings. Use parameters so values are passed safely.",
      "## Transactions",
      "A transaction groups changes that should succeed or fail together. Committing makes changes durable; rolling back reverses uncommitted changes.",
      "## Constraints",
      "Primary keys, uniqueness, non-null requirements, foreign keys, and other constraints protect data integrity.",
      "## Row Mapping",
      "Database rows can be converted into tuples, mappings, or application objects depending on project needs.",
      "## Indexes",
      "Indexes can speed up common lookup patterns but consume storage and add write overhead. They should reflect actual query needs.",
      "## Closing Resources",
      "Database connections should be closed reliably. Context-manager patterns can simplify transaction and resource management.",
      "## Common Mistakes",
      "The most serious beginner mistakes are SQL string interpolation with user data, forgetting commits, ignoring uniqueness constraints, and treating database errors as impossible.",
    ],
    codeSnippets: [
      {
        title: "Create and Insert",
        language: "python",
        code: `import sqlite3

with sqlite3.connect("app.db") as connection:
    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )
    """)

    connection.execute(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        ("Sara", "sara@example.com")
    )`,
      },
      {
        title: "Read and Update Safely",
        language: "python",
        code: `import sqlite3

with sqlite3.connect("app.db") as connection:
    connection.row_factory = sqlite3.Row

    rows = connection.execute(
        "SELECT id, name, email FROM users"
    ).fetchall()

    for row in rows:
        print(dict(row))

    connection.execute(
        "UPDATE users SET name = ? WHERE email = ?",
        ("Sara Khan", "sara@example.com")
    )`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Build a SQLite-backed task manager supporting create, list, mark-complete, and delete operations. Use parameterized queries for every user-provided value.",
    order: 19,
  },

  {
    slug: "concurrency-threading-multiprocessing-and-asyncio",
    title: "20. Concurrency: Threading, Multiprocessing & Asyncio",
    summary:
      "Develop a beginner-friendly mental model for concurrent work, the GIL, threads, processes, async/await, and choosing the right approach.",
    content: [
      "## Concurrency vs Parallelism",
      "Concurrency means managing multiple tasks whose execution overlaps. Parallelism means tasks literally execute at the same time on different processing resources.",
      "## Why Concurrency Matters",
      "Programs often spend time waiting for files, networks, databases, or external services. Concurrency can let other work progress during those waits.",
      "## Threads",
      "Threads share process memory and are useful for many I/O-bound workloads. Shared mutable state introduces synchronization and correctness concerns.",
      "## The GIL",
      "In traditional CPython builds, the Global Interpreter Lock historically allows only one thread at a time to execute Python bytecode within a process. This means CPU-bound pure Python work does not usually scale across cores merely by adding threads.",
      "## Multiprocessing",
      "Multiple processes have separate memory spaces and can use multiple CPU cores. This makes multiprocessing useful for CPU-bound work, but process creation and data exchange have overhead.",
      "## Async Programming",
      "`asyncio` uses cooperative concurrency. Coroutines voluntarily yield control at `await` points, allowing an event loop to run other work while one operation waits.",
      "## async and await",
      "`async def` defines a coroutine function. Calling it creates a coroutine object; the coroutine must be awaited or scheduled by an event loop.",
      "## I/O-Bound vs CPU-Bound",
      "For I/O-heavy tasks, threading or asyncio can be effective. For CPU-intensive Python computations, processes may be more appropriate.",
      "## Race Conditions",
      "When threads modify shared state, results can depend on timing. Synchronization primitives can protect critical sections, though avoiding unnecessary shared mutable state is often simpler.",
      "## Do Not Add Concurrency Too Early",
      "Concurrent programs are harder to debug and reason about. First make the synchronous version correct, then add concurrency when measurements or requirements justify it.",
      "## Common Mistakes",
      "Typical mistakes include calling blocking code inside async functions, assuming threads always make CPU work faster, modifying shared state unsafely, and forgetting to await coroutines.",
    ],
    codeSnippets: [
      {
        title: "ThreadPool for I/O-Style Work",
        language: "python",
        code: `from concurrent.futures import ThreadPoolExecutor
from time import sleep

def fetch_item(item_id):
    sleep(1)
    return f"Item {item_id}"

with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(
        executor.map(fetch_item, range(4))
    )

print(results)`,
      },
      {
        title: "Basic asyncio",
        language: "python",
        code: `import asyncio

async def task(name, delay):
    await asyncio.sleep(delay)
    return f"{name} finished"

async def main():
    results = await asyncio.gather(
        task("A", 1),
        task("B", 1),
        task("C", 1)
    )

    print(results)

asyncio.run(main())`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Create a synchronous program that simulates five slow I/O tasks, then rewrite it with `asyncio.gather()` and compare the total runtime.",
    order: 20,
  },

  {
    slug: "automation-and-command-line-programs",
    title: "21. Automation & Command-Line Programs",
    summary:
      "Apply Python to practical automation using pathlib, shutil, subprocess concepts, command-line arguments, environment variables, and reusable scripts.",
    content: [
      "## Python as an Automation Language",
      "Python is excellent for automating repetitive computer tasks such as renaming files, moving data, generating reports, processing logs, transforming CSV files, and calling APIs.",
      "## Think in Pipelines",
      "Many automation scripts follow a simple pattern: discover input, validate it, transform data, perform an action, report the result, and handle failures.",
      "## pathlib for File Automation",
      "`Path.glob()` and `Path.rglob()` can discover matching files. Paths can be renamed, moved, inspected, and combined without hard-coding operating-system separators.",
      "## shutil",
      "The `shutil` module provides higher-level file and directory operations such as copying, moving, and archive handling.",
      "## Command-Line Arguments",
      "A useful automation tool should often accept inputs from the command line instead of requiring source-code edits.",
      "## argparse",
      "`argparse` provides structured command-line argument parsing, help messages, required arguments, defaults, and option validation.",
      "## Environment Variables",
      "Environment variables are useful for configuration that differs between machines or environments, especially credentials and deployment-specific settings.",
      "## Idempotency",
      "A well-designed automation may be safe to run repeatedly without producing duplicate or destructive results. Thinking about idempotency improves reliability.",
      "## Dry-Run Mode",
      "For destructive tasks, consider a dry-run mode that shows intended changes before applying them.",
      "## Logging Automation",
      "Automation scripts should report what changed and what failed. Logging makes scheduled and unattended scripts easier to diagnose.",
      "## Security",
      "Treat file names, external commands, environment values, and remote data as untrusted when applicable. Avoid blindly executing constructed shell commands.",
      "## Common Mistakes",
      "Avoid hard-coded absolute paths, destructive operations without validation, swallowing errors, and scripts that assume every machine has the same environment.",
    ],
    codeSnippets: [
      {
        title: "Rename Files with pathlib",
        language: "python",
        code: `from pathlib import Path

folder = Path("photos")

for index, file_path in enumerate(
    folder.glob("*.jpg"),
    start=1
):
    new_name = f"photo_{index:03}.jpg"
    destination = file_path.with_name(new_name)

    print(f"{file_path.name} -> {new_name}")
    file_path.rename(destination)`,
      },
      {
        title: "Command-Line Arguments with argparse",
        language: "python",
        code: `import argparse

parser = argparse.ArgumentParser(
    description="Simple greeting tool"
)

parser.add_argument("name")
parser.add_argument(
    "--uppercase",
    action="store_true"
)

args = parser.parse_args()

message = f"Hello, {args.name}!"

if args.uppercase:
    message = message.upper()

print(message)`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Build a CLI file-organizer that groups files by extension into folders. Add a `--dry-run` option that prints planned moves without modifying files.",
    order: 21,
  },

  {
    slug: "python-project-structure-and-best-practices",
    title: "22. Project Structure, Clean Code & Python Best Practices",
    summary:
      "Learn how to organize real Python applications with clear boundaries, configuration, reusable modules, tests, type hints, and maintainable design.",
    content: [
      "## From Scripts to Applications",
      "A one-file script is excellent for small tasks. As responsibilities grow, separate application logic, data access, configuration, utilities, and user interfaces into focused modules.",
      "## Separation of Concerns",
      "Code is easier to maintain when input/output, business logic, persistence, and external integrations are not tightly mixed together.",
      "## Keep the Core Testable",
      "Business rules should ideally be callable without requiring interactive input, a real database, or a live network request. This makes testing fast and reliable.",
      "## Configuration",
      "Configuration that changes by environment should be kept separate from application logic. Secrets should not be committed into source control.",
      "## Naming",
      "Use descriptive module, function, class, and variable names. Python conventions normally use `snake_case` for variables/functions and `PascalCase` for classes.",
      "## Type Hints",
      "Use type hints where they improve communication and tooling. Avoid treating type annotations as a replacement for tests or runtime validation.",
      "## Small Functions",
      "Functions should usually have a clear purpose. If a function performs unrelated jobs, it may need to be split.",
      "## Avoid Premature Abstraction",
      "Do not create complex frameworks for problems that have not appeared yet. Repetition can reveal where an abstraction is actually useful.",
      "## Error Boundaries",
      "Handle errors at layers that have enough context to respond meaningfully. Low-level functions may raise exceptions; higher-level interfaces may convert them into user-friendly messages.",
      "## Dependency Direction",
      "Core logic should avoid unnecessary dependence on UI or infrastructure details. This keeps code flexible and easier to test.",
      "## Documentation",
      "A project README should explain purpose, setup, dependencies, execution, tests, and important environment configuration.",
      "## Common Mistakes",
      "Common beginner architecture mistakes include one massive file, global mutable state, hard-coded credentials, duplicate logic, circular imports, and mixing database/UI code into every function.",
    ],
    codeSnippets: [
      {
        title: "Example Project Structure",
        language: "python",
        code: `# my_app/
# ├── app/
# │   ├── __init__.py
# │   ├── services.py
# │   ├── models.py
# │   ├── repository.py
# │   └── config.py
# ├── tests/
# │   ├── test_services.py
# │   └── test_repository.py
# ├── main.py
# ├── requirements.txt
# └── README.md`,
      },
      {
        title: "Separate Business Logic from Input",
        language: "python",
        code: `def calculate_order_total(items):
    return sum(
        item["price"] * item["quantity"]
        for item in items
    )

def main():
    items = [
        {"price": 100, "quantity": 2},
        {"price": 50, "quantity": 3},
    ]

    total = calculate_order_total(items)
    print(f"Total: {total}")

if __name__ == "__main__":
    main()`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Take one earlier single-file project from this course and refactor it into at least three modules: interface, business logic, and persistence/data handling.",
    order: 22,
  },

  {
    slug: "python-capstone-projects",
    title: "23. Python Capstone Projects: Build Real Applications",
    summary:
      "Bring the entire course together through practical projects that require planning, modular code, persistence, validation, testing, APIs, and clean structure.",
    content: [
      "## Why Capstone Projects Matter",
      "Tutorial examples teach individual concepts. Projects teach how those concepts interact. The goal is not merely to finish a project but to practice making design decisions.",
      "## Project 1: Expense Tracker",
      "Build a command-line expense tracker supporting categories, amounts, dates, filtering, monthly summaries, persistence, and input validation. Start with JSON and optionally migrate the persistence layer to SQLite.",
      "## Project 2: Task Manager",
      "Create tasks with title, priority, due date, and status. Support listing, filtering, completion, deletion, and persistence. Organize the program so domain logic is separate from storage and CLI input.",
      "## Project 3: API Dashboard",
      "Consume a public API, let users search or filter data, cache or store selected results, handle unavailable services, and present readable summaries.",
      "## Project 4: File Automation Tool",
      "Build a safe file organizer, duplicate-report generator, or batch-renaming tool. Include dry-run behavior, logs, and useful command-line arguments.",
      "## Project 5: Inventory Manager",
      "Use classes and SQLite to manage products, stock adjustments, low-stock reporting, and inventory value. Add tests for core business rules.",
      "## Plan Before Coding",
      "Write down requirements, core entities, data flow, storage approach, expected errors, and module boundaries before implementation.",
      "## Build in Iterations",
      "Start with the smallest useful feature. Add persistence, validation, tests, and advanced functionality only after the basic workflow works.",
      "## Test Business Rules",
      "For each project, identify logic that can be tested without user input or a network. Write tests for important calculations, validations, and edge cases.",
      "## Refactor After It Works",
      "Do not demand perfect architecture from the first line. Once behavior is correct, look for duplication, unclear responsibilities, long functions, and hidden dependencies.",
      "## Document the Project",
      "Add a README explaining what the project does, installation, how to run it, example commands, project structure, and important design choices.",
      "## Portfolio Standard",
      "A strong beginner portfolio project should be understandable, runnable, documented, reasonably tested, and demonstrate thoughtful error handling. A smaller polished project is often more valuable than a large unfinished one.",
      "## Final Learning Strategy",
      "After completing the course, keep building. Revisit weak topics, read other people's Python code, practice debugging, solve small problems, and gradually learn the frameworks required by the area of Python you want to pursue.",
    ],
    codeSnippets: [
      {
        title: "Capstone Planning Template",
        language: "python",
        code: `# 1. Define the user problem.
# 2. List required features.
# 3. Identify core data/entities.
# 4. Choose storage: memory / JSON / SQLite.
# 5. Separate:
#       - input/output
#       - business logic
#       - persistence
# 6. Identify expected errors.
# 7. Write the smallest working version.
# 8. Add tests.
# 9. Refactor.
# 10. Document usage.`,
      },
      {
        title: "Simple Application Entry Point",
        language: "python",
        code: `def main():
    print("Welcome to the Python capstone project")

    # Load application data
    # Show menu
    # Read user choice
    # Call service functions
    # Persist changes
    # Handle expected errors

if __name__ == "__main__":
    main()`,
      },
    ],
    language: "python",
    tryItChallenge:
      "Choose one capstone project and build it to portfolio quality. Require at least three modules, persistent storage, validation, exception handling, type hints, a README, and automated tests for core logic.",
    order: 23,
  },
];

async function seedPythonCourse() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    let course = await Course.findOne({ slug: courseData.slug });

    if (course) {
      console.log(
        `Course "${courseData.title}" already exists (ID: ${course._id}). Updating details...`,
      );
      Object.assign(course, courseData);
      await course.save();
    } else {
      console.log(`Creating new course: "${courseData.title}"...`);
      course = await Course.create(courseData);
      console.log(`Course created with ID: ${course._id}`);
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const chapterData of chaptersData) {
      const existingChapter = await Chapter.findOne({
        course: course._id,
        slug: chapterData.slug,
      });

      if (existingChapter) {
        Object.assign(existingChapter, chapterData);
        await existingChapter.save();
        updatedCount++;
      } else {
        await Chapter.create({
          ...chapterData,
          course: course._id,
        });
        createdCount++;
      }
    }

    console.log("Python course seeding complete!");
    console.log(`- Course ID: ${course._id}`);
    console.log(`- Course Slug: /courses/${course.slug}`);
    console.log(`- Chapters created: ${createdCount}`);
    console.log(`- Chapters updated: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding Python course:", error);
    process.exit(1);
  }
}

seedPythonCourse();

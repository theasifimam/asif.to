export const BROWSER_RUNTIME_CONFIG = {
  python: { label: "Python", file: "/main.py", worker: "/workers/python-runtime.mjs", loading: "Loading Python runtime...", note: "Python downloads only when you first press Run." },
  c: { label: "C", file: "/main.c", worker: "/workers/clang-runtime.mjs", loading: "Loading C compiler (large first download)...", note: "The browser Clang toolchain has a large one-time download." },
  cpp: { label: "C++", file: "/main.cpp", worker: "/workers/clang-runtime.mjs", loading: "Loading C++ compiler (large first download)...", note: "The browser Clang toolchain has a large one-time download." },
  java: { label: "Java", file: "/Main.java", iframe: "/runtimes/java.html", loading: "Loading Java runtime and compiler...", note: "The browser OpenJDK runtime has a large one-time download." },
};

export function initialRuntimeCode(language) {
  return {
    python: 'for row in range(1, 6):\n    print("*" * row)\n',
    c: '#include <stdio.h>\n\nint main(void) {\n  for (int row = 1; row <= 5; row++) {\n    for (int col = 0; col < row; col++) printf("*");\n    printf("\\n");\n  }\n  return 0;\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n  for (int row = 1; row <= 5; row++) {\n    for (int col = 0; col < row; col++) cout << "*";\n    cout << "\\n";\n  }\n  return 0;\n}\n',
    java: 'public class Main {\n  public static void main(String[] args) {\n    for (int row = 1; row <= 5; row++) {\n      for (int col = 0; col < row; col++) System.out.print("*");\n      System.out.println();\n    }\n  }\n}\n',
  }[language] || "";
}

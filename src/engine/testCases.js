export const TEST_CASES = [
    {
        id: 1,
        name: "Hello World",
        description: "Basic C program — tests directives, keywords, builtins, strings",
        code: `#include <stdio.h>

int main() {
    printf("Hello, World!");
    return 0;
}`
    },
    {
        id: 2,
        name: "Calculator",
        description: "Multiple functions — tests operators, numbers, identifiers",
        code: `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}

int main() {
    int x = 10;
    int y = 5;
    int result = 0;

    result = add(x, y);
    printf("Sum: %d", result);

    result = subtract(x, y);
    printf("Difference: %d", result);

    return 0;
}`
    },
    {
        id: 3,
        name: "String Operations",
        description: "String functions — tests comments, char arrays, string builtins",
        code: `#include <stdio.h>
#include <string.h>

int main() {
    /* string variables */
    char name[50];
    char greeting[100];

    // get input
    printf("Enter your name: ");
    scanf("%s", name);

    int len = strlen(name);
    printf("Length: %d", len);

    strcpy(greeting, "Hello ");
    strcat(greeting, name);
    printf("%s", greeting);

    return 0;
}`
    },
    {
        id: 4,
        name: "Error Detection",
        description: "Invalid tokens — tests error reporting with line and column numbers",
        code: `#include <stdio.h>

int main() {
    int x = 10;
    int 1invalid = 20;
    float y = 3.14;
    char @ = 'a';
    int z = x + y;
    return 0;
}`
    },
    {
        id: 4,
        name: "Error Detection",
        description: "Invalid tokens — tests error reporting with line and column numbers",
        code: `#include <stdio.h>

int main() {
    int x = 10;
    int 1invalid = 20;
    float y = 3.14;
    char ch = 'a';
    int z = x + @;
    return 0;
}`
    },
    {
        id: 5,
        name: "Advanced Operators",
        description: "Tests compound, logical, bitwise operators and hex numbers",
        code: `#include <stdio.h>

int main() {d
  // compound assignment
  int x = 10;
  x += 5;
  x -= 2;
  x *= 3;
  x /= 2;
  x %= 3;

  // increment decrement
  x++;
  x--;

  // logical operators
  if(x > 0 && x < 100){
    x = 1;
  }
  if(x == 0 || x == 1){
    x = 2;
  }

  // bitwise operators
  int mask = 0xFF;
  int hex  = 0x1A3F;
  int bits = mask & hex;
  bits = mask | hex;
  bits = mask ^ hex;
  bits = mask << 2;
  bits = mask >> 1;

  return 0;
}`
    }
]
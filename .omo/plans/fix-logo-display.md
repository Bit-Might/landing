## TL;DR (For humans)

**Что будет сделано:**

1.  **Исправлен файл `logo.svg`**: цвет логотипа больше не будет жёстко задан как белый, а будет наследоваться от родительского элемента. Это позволит легко менять его цвет через CSS.
2.  **Обновлён файл `index.html`**: для логотипа будет задана фиксированная высота в 42 пикселя, чтобы он корректно и предсказуемо отображался в шапке сайта.

**Результат:** Логотип будет правильно отображаться на странице, его размер и цвет будут соответствовать дизайну.

---
## Todos

1. [x] **[/Users/ta-nu-ki/Documents/Projects/landing/assets/logo.svg] .st0{fill:currentColor;} to make SVG color dynamic - expect SVG to inherit color from CSS**
2. [x] **[/Users/ta-nu-ki/Documents/Projects/landing/index.html] Add CSS rule for `.logo img` to set explicit height - expect logo to render at 42px height**

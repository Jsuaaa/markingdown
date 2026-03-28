# Documento de Prueba - Markingdown

Este documento contiene todos los elementos soportados por el editor para verificar que se renderizan correctamente.

## Encabezados

### Encabezado nivel 3

#### Encabezado nivel 4

---

## Formato de texto inline

Este parrafo contiene **texto en negrita**, *texto en italica*, ~~texto tachado~~ y `codigo inline`. Tambien se pueden combinar: ***negrita e italica***, `negrita con codigo` y **~~tachado en negrita~~**.

Aqui hay un [enlace a Google](https://www.google.com) y otro [enlace a GitHub](https://github.com) para verificar que los links funcionan.

---

## Blockquote

> Esta es una cita de bloque. Puede contener **formato** y *estilos* dentro.
>
> Incluso multiples parrafos dentro de la misma cita.

---

## Listas no ordenadas

- Primer item
- Segundo item
  - Sub-item 2.1
  - Sub-item 2.2
    - Sub-sub-item 2.2.1
- Tercer item

## Listas ordenadas

1. Primer paso
2. Segundo paso
   1. Sub-paso 2.1
   2. Sub-paso 2.2
3. Tercer paso

## Task Lists

- [ ] Tarea pendiente 1

- [ ] Tarea pendiente 2

  - [ ] Sub-tarea 2.1

  - [x] Sub-tarea 2.2 completada

- [x] Tarea completada 3

- [ ] Tarea pendiente 4

---

## Bloques de codigo

### JavaScript

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(`Fibonacci(10) = ${result}`);
```

### TypeScript

```typescript
interface Plan {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

function createPlan(title: string, content: string): Plan {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date(),
  };
}
```

### Python

```python
def quicksort(arr: list[int]) -> list[int]:
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```

### Bash

```bash
#!/bin/bash
echo "Verificando entorno..."
for pkg in node npm git; do
  if command -v $pkg &> /dev/null; then
    echo "  $pkg: $(command -v $pkg)"
  else
    echo "  $pkg: NO ENCONTRADO"
  fi
done
```

---

## Tablas

| Elemento | Tipo | Funciona |
| --- | --- | --- |
| Encabezados | Bloque | Si |
| Negrita | Inline | Si |
| Italica | Inline | Si |
| Tachado | Inline | Si |
| Codigo inline | Inline | Si |
| Bloque de codigo | Bloque | Si |
| Tablas | Bloque | Si |
| Listas | Bloque | Si |
| Task lists | Bloque | Si |
| Blockquote | Bloque | Si |
| Links | Inline | Si |
| Linea horizontal | Bloque | Si |

---

## Pruebas manuales

### Slash Commands

Escribir `/` en el editor y verificar que aparece el menu con:

- `/heading1`, `/heading2`, `/heading3`
- `/bold`, `/italic`, `/strikethrough`
- `/inline code`
- `/bullet list`, `/ordered list`, `/task list`
- `/blockquote`
- `/code block`
- `/table`
- `/divider`

### StatusBar

- Verificar conteo de palabras
- Verificar conteo de caracteres

### Export

- Probar export a PDF
- Probar export a HTML

### Atajos de teclado

| Atajo | Accion |
| --- | --- |
| Cmd+B | Negrita |
| Cmd+I | Italica |
| Cmd+Shift+X | Tachado |
| Cmd+E | Codigo inline |
| Escape | Limpiar formato activo |

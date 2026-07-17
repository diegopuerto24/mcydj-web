# MC&DJ ERP Engineering Standards

Versión 1.0

---

# Propósito

Este documento establece los estándares obligatorios para el desarrollo del MC&DJ ERP.

Su objetivo es garantizar que todo el código del proyecto mantenga:

- Calidad
- Consistencia
- Escalabilidad
- Seguridad
- Mantenibilidad

Estas reglas aplican tanto a desarrolladores humanos como a asistentes de Inteligencia Artificial.

Toda contribución deberá respetar este documento.

---

# Principio General

El código debe ser fácil de entender.

No se escribe código para la computadora.

Se escribe código para el siguiente desarrollador que lo mantendrá.

---

# Filosofía

El proyecto privilegia:

Claridad

sobre

Ingenio.

La solución más sencilla y mantenible siempre será preferible a la más compleja.

---

# Arquitectura

Toda funcionalidad deberá respetar la arquitectura definida del proyecto.

Nunca mezclar responsabilidades.

Separar claramente:

- Presentación
- Lógica de negocio
- Acceso a datos
- Configuración
- Servicios
- Utilidades

---

# Organización del proyecto

Mantener la estructura oficial del proyecto.

Nunca crear carpetas duplicadas.

Nunca crear componentes fuera de la estructura definida.

Toda nueva carpeta deberá responder a una necesidad permanente.

---

# Componentes

Todo componente deberá ser reutilizable.

Antes de crear un componente nuevo preguntar:

- ¿Ya existe uno similar?
- ¿Puede extenderse uno existente?

Si la respuesta es sí, reutilizar.

Nunca duplicar componentes.

---

# Props

Las props deberán ser explícitas.

Evitar props ambiguas.

Nombrar correctamente.

No utilizar nombres genéricos como:

- data
- temp
- obj
- item1
- item2

---

# Estado

Mantener el estado lo más cercano posible al componente que lo utiliza.

Evitar estado global innecesario.

No duplicar información.

---

# Hooks

Extraer lógica repetida hacia Hooks reutilizables.

No copiar lógica entre componentes.

---

# Servicios

Toda comunicación con Supabase deberá centralizarse.

Evitar consultas repetidas.

Evitar lógica SQL distribuida en múltiples componentes.

---

# Formularios

Utilizar siempre componentes reutilizables.

Toda validación deberá ser consistente.

Nunca duplicar reglas de validación.

---

# Manejo de errores

Todo error deberá:

- Registrarse.
- Mostrar un mensaje claro.
- Permitir recuperación cuando sea posible.

Nunca mostrar errores técnicos al usuario final.

---

# Logging

Registrar únicamente información útil.

No dejar `console.log()` en producción.

Los logs deberán tener un propósito claro.

---

# Base de datos

Toda modificación estructural deberá realizarse mediante migraciones.

Nunca modificar tablas manualmente en producción.

Toda migración deberá ser reversible cuando sea posible.

---

# Convenciones de tablas

- Nombres en inglés.
- snake_case.
- Plural.

Ejemplos:

- profiles
- reservations
- reservation_logs

Nunca mezclar idiomas.

---

# Convenciones de columnas

- snake_case.
- Evitar abreviaturas.
- Utilizar nombres descriptivos.

Ejemplos:

- created_at
- updated_at
- created_by
- updated_by

Nunca utilizar nombres como:

- crt
- upd
- usr
- tmp

---

# Llaves primarias

Utilizar UUID siempre que sea posible.

---

# Auditoría

Las tablas críticas deberán conservar cuando aplique:

- created_at
- updated_at
- created_by
- updated_by

---

# Supabase

Nunca utilizar `SUPABASE_SERVICE_ROLE_KEY` desde el cliente.

Toda operación privilegiada deberá ejecutarse únicamente en el servidor.

---

# Row Level Security (RLS)

Toda tabla sensible deberá tener políticas RLS.

Nunca deshabilitar RLS para resolver un problema.

Primero corregir la política.

---

# Autenticación

Toda pantalla privada deberá validar la existencia de una sesión.

Nunca asumir que la sesión existe.

---

# Permisos

Los permisos deberán aplicarse tanto en backend como en frontend.

La interfaz nunca deberá mostrar acciones que el usuario no puede ejecutar.

La seguridad nunca dependerá únicamente del frontend.

---

# API

Toda nueva API deberá:

- Validar entradas.
- Manejar errores.
- Devolver respuestas consistentes.
- Utilizar códigos HTTP correctos.

Nunca devolver información sensible innecesaria.

---

# Rendimiento

Evitar:

- Consultas repetidas.
- Renderizados innecesarios.
- Cálculos repetitivos.

Optimizar primero la simplicidad y después el rendimiento.

---

# Responsive

Toda pantalla nueva deberá funcionar correctamente en:

- Desktop
- Tablet
- Mobile

No se aceptarán pantallas únicamente para escritorio.

---

# Accesibilidad

Todos los componentes deberán cumplir:

- Contraste suficiente.
- Focus visible.
- Navegación por teclado.
- Etiquetas correctas.
- Mensajes claros.

---

# Design System

Todo componente visual deberá utilizar el Design System oficial.

Nunca utilizar estilos aislados.

Nunca copiar CSS entre módulos.

---

# CSS

No utilizar estilos inline salvo casos excepcionales.

Utilizar clases reutilizables.

Mantener consistencia.

---

# Colores

Nunca utilizar colores arbitrarios.

Todos los colores deberán provenir del sistema oficial de branding.

---

# Iconografía

Utilizar únicamente la librería oficial del proyecto.

Nunca mezclar estilos.

---

# Git

Todo cambio deberá realizarse mediante ramas.

Nunca trabajar directamente sobre `main`.

Todo cambio deberá pasar por Pull Request.

---

# Pull Requests

Todo PR deberá:

- Compilar correctamente.
- Pasar las pruebas.
- Respetar el Branding.
- Respetar el Design System.
- Mantener las políticas RLS.
- Mantener el comportamiento responsive.
- Actualizar la documentación cuando corresponda.

---

# Commits

Los mensajes deberán ser claros y describir la intención.

No utilizar mensajes como:

- update
- fix
- changes

Ejemplos correctos:

- Implementa agenda compartida
- Corrige permisos de reagendado
- Agrega vista mensual

---

# Testing

Antes de solicitar un Merge ejecutar como mínimo:

- npm run build
- Pruebas funcionales
- Pruebas responsive
- Pruebas de permisos

---

# Documentación

Toda nueva funcionalidad deberá actualizar la documentación correspondiente.

Nunca permitir que la documentación quede desactualizada.

---

# Inteligencia Artificial

Los asistentes de IA forman parte oficial del proceso de desarrollo.

Antes de comenzar cualquier tarea deberán leer como mínimo:

- docs/00_README.md
- docs/product/PRODUCT_VISION.md
- docs/branding/BRAND_GUIDELINES.md
- docs/branding/DESIGN_SYSTEM.md
- docs/development/CODING_STANDARDS.md

No deberán modificar arquitectura sin autorización.

No deberán eliminar documentación.

No deberán cambiar branding.

No deberán romper compatibilidad.

Toda mejora propuesta deberá mantener coherencia con la visión del producto.

---

# Flujo oficial de desarrollo

1. Analizar la documentación.
2. Comprender el objetivo.
3. Implementar.
4. Compilar.
5. Probar.
6. Actualizar documentación.
7. Crear Pull Request.
8. Revisión.
9. Merge.

---

# Definición de Terminado

Una funcionalidad únicamente podrá considerarse terminada cuando:

- Compila correctamente.
- Respeta el Design System.
- Respeta el Branding.
- Respeta las políticas RLS.
- Respeta los permisos.
- Es responsive.
- Es accesible.
- Actualiza la documentación.
- Pasa las pruebas funcionales.
- Es aprobada mediante Pull Request.

---

# Regla de Oro

Todo cambio deberá mejorar el proyecto.

Nunca únicamente agregar código.

Cada línea escrita deberá hacer al MC&DJ ERP más:

- Simple.
- Robusto.
- Escalable.
- Seguro.
- Mantenible.

---

# Principio Rector

El código es un activo estratégico del despacho.

Debe escribirse pensando que será mantenido durante muchos años por diferentes desarrolladores.

La calidad del software no se mide por la cantidad de funcionalidades implementadas, sino por la facilidad con la que puede evolucionar sin perder estabilidad.

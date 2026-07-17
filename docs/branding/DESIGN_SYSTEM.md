# MC&DJ ERP Design System

Versión 1.0

---

# Objetivo

El Design System del MC&DJ ERP define las reglas oficiales para construir todas las interfaces del sistema.

No es únicamente una guía visual.

Es el conjunto de principios que garantizan que cualquier módulo del ERP mantenga la misma identidad, comportamiento y experiencia de usuario.

Todo componente nuevo deberá formar parte del Design System.

Nunca deberán desarrollarse componentes aislados.

---

# Filosofía

El ERP deberá sentirse como un único producto.

Nunca como una colección de módulos desarrollados por diferentes personas.

Cada pantalla deberá transmitir:

- Profesionalismo
- Claridad
- Rapidez
- Precisión
- Confianza
- Orden

---

# Principios

## Simplicidad

Eliminar todo elemento que no aporte valor.

Cada componente deberá tener un propósito claro.

---

## Consistencia

Los mismos componentes deberán comportarse exactamente igual en toda la aplicación.

Un botón deberá comportarse igual en cualquier módulo.

Una tabla deberá verse igual en cualquier módulo.

---

## Escalabilidad

Todo componente deberá diseñarse pensando en ser reutilizado por decenas de módulos.

Nunca crear componentes específicos para una sola pantalla.

---

## Accesibilidad

Todo componente deberá ser accesible.

- Contraste.
- Focus.
- Navegación por teclado.
- Mensajes claros.

---

## Rendimiento

Nunca sacrificar rendimiento por efectos visuales.

Las animaciones deberán ser discretas.

---

# Estructura general

Toda pantalla seguirá la misma estructura.

Header

↓

Sidebar

↓

Contenido principal

↓

Panel lateral (cuando aplique)

↓

Modal (cuando aplique)

↓

Toast

Nunca modificar esta jerarquía.

---

# Sidebar

El Sidebar será permanente.

Debe contener únicamente navegación.

No colocar formularios.

No colocar información operacional.

No colocar indicadores.

Debe incluir:

- Logo.
- Nombre del ERP.
- Menú principal.
- Separadores.
- Usuario.
- Rol.
- Cerrar sesión.

---

# Header

Debe mantenerse limpio.

Contendrá:

- Título de la pantalla.
- Breadcrumb.
- Buscador.
- Notificaciones.
- Perfil.
- Acciones rápidas.

---

# Dashboard

El Dashboard será el centro operativo.

Nunca será un menú.

Nunca será un listado.

Debe responder:

- ¿Qué ocurrió?
- ¿Qué debo atender?
- ¿Qué viene después?

---

# Cards

Existen cuatro tipos oficiales.

## Estadística

KPIs.

Indicadores.

Totales.

---

## Operativa

Información resumida.

Acciones rápidas.

---

## Resumen

Información de consulta.

---

## Calendario

Reservas.

Eventos.

Agenda.

Nunca crear variantes adicionales sin necesidad.

---

# Botones

## Primario

Una única acción principal por pantalla.

---

## Secundario

Acciones alternativas.

---

## Texto

Acciones menores.

---

## Peligro

Eliminar.

Cancelar definitivamente.

Nunca utilizar varios botones primarios juntos.

---

# Formularios

Todos compartirán:

- Mismo espaciado.
- Misma alineación.
- Mismas validaciones.
- Mismos mensajes.
- Mismos botones.

---

# Inputs

Todos los inputs deberán tener:

- Label.
- Placeholder.
- Validación.
- Mensaje de error.
- Ayuda contextual cuando sea necesaria.

---

# Select

Buscar automáticamente cuando existan muchos registros.

Nunca utilizar listas enormes.

---

# DatePicker

Único componente reutilizable.

No crear calendarios distintos.

---

# TimePicker

Único componente reutilizable.

Formato consistente.

---

# Tablas

Toda tabla deberá permitir:

- Ordenamiento.
- Búsqueda.
- Paginación.
- Responsive.
- Exportación cuando tenga sentido.

Nunca saturar con columnas innecesarias.

---

# Modales

Los modales sólo deberán utilizarse para:

- Crear.
- Editar.
- Confirmar.

Nunca para navegación.

---

# Panel lateral

Será el componente preferido para consultar detalles.

Evitar abrir nuevas pantallas.

---

# Toasts

Todos los mensajes utilizarán el mismo componente.

Tipos:

- Éxito.
- Información.
- Advertencia.
- Error.

Duración consistente.

---

# Loader

Habrá un único estilo oficial.

- Pantalla.
- Botón.
- Tabla.
- Calendario.

Nunca utilizar loaders diferentes.

---

# Skeleton

Todas las cargas largas deberán utilizar Skeletons.

Evitar pantallas vacías.

---

# Calendario

El calendario será un componente institucional.

Todos los módulos futuros reutilizarán el mismo.

Vistas oficiales:

- Día.
- Semana.
- Mes.

Nunca desarrollar calendarios diferentes.

---

# Agenda NOMIPAQ

La Agenda NOMIPAQ será la referencia para cualquier agenda futura.

Las reservas deberán utilizar siempre el mismo componente visual.

---

# Tarjetas de reserva

Mostrar únicamente:

- Horario.
- Usuario.
- Área.
- Motivo.
- Estado.

Toda información adicional deberá mostrarse en el panel lateral.

---

# Permisos

La interfaz deberá respetar los permisos.

Nunca mostrar acciones que el usuario no puede ejecutar.

No utilizar botones deshabilitados.

Simplemente ocultarlos.

---

# Navegación

Toda navegación deberá ser consistente.

No abrir ventanas innecesarias.

Evitar profundidad mayor a tres niveles.

---

# Responsive

Desktop es la experiencia principal.

Tablet completamente funcional.

Mobile totalmente utilizable.

Nunca eliminar funcionalidades por tamaño de pantalla.

---

# Iconografía

Utilizar una única librería de iconos.

Todos los iconos deberán compartir estilo.

Nunca mezclar estilos.

---

# Animaciones

Muy discretas.

Duración corta.

Nunca utilizar animaciones decorativas.

Las animaciones deberán comunicar cambios de estado.

---

# Espacios en blanco

El espacio vacío es parte del diseño.

No intentar llenar todas las áreas.

Una interfaz limpia siempre será preferible.

---

# Errores

Los errores deberán indicar:

- Qué ocurrió.
- Por qué ocurrió.
- Cómo solucionarlo.

Nunca mostrar mensajes técnicos al usuario.

---

# Estados vacíos

Toda pantalla deberá contemplar:

- Sin información.
- Sin resultados.
- Sin conexión.
- Sin permisos.
- Error.

Cada estado deberá guiar al usuario.

---

# Componentes reutilizables

Todo componente nuevo deberá agregarse al Design System.

Nunca copiar código entre módulos.

Si un componente mejora, todos los módulos deberán beneficiarse automáticamente.

---

# Definición de terminado

Una pantalla sólo podrá considerarse terminada cuando:

- Respete el Manual de Marca.
- Respete BRAND_GUIDELINES.md.
- Respete este Design System.
- Sea responsive.
- Sea accesible.
- Utilice componentes reutilizables.
- No duplique código.
- Mantenga consistencia visual.
- No rompa funcionalidades existentes.

---

# Regla de oro

Antes de desarrollar una nueva pantalla, el desarrollador deberá preguntarse:

"¿Puedo construir esta pantalla utilizando únicamente componentes ya existentes?"

Si la respuesta es sí, deberá reutilizarlos.

Si la respuesta es no, deberá crear un nuevo componente reutilizable e incorporarlo al Design System antes de utilizarlo.

Nunca desarrollar soluciones específicas para una única pantalla.

---

# Principio rector

El Design System no pertenece a un módulo.

El ERP completo pertenece al Design System.

Todos los módulos presentes y futuros deberán construirse sobre estas mismas reglas.

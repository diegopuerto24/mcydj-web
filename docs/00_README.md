# MC&DJ ERP

## Plataforma Integral de Gestión Empresarial

Versión 1.0

---

# Bienvenido

MC&DJ ERP es la plataforma tecnológica desarrollada para integrar en un único sistema todos los procesos operativos, administrativos, financieros y estratégicos de MC&DJ Consultores y Evaluadores Profesionales.

No es únicamente un software administrativo.

Es la plataforma central desde la cual operará todo el despacho durante los próximos años.

Cada módulo nuevo deberá integrarse naturalmente con los existentes para evitar duplicidad de información, procesos y esfuerzos.

---

# Objetivo

Construir un ERP especializado para despachos profesionales que permita administrar desde una sola plataforma:

- Clientes
- Colaboradores
- Agenda
- Proyectos
- Servicios
- Documentos
- Facturación
- CFDI
- Finanzas
- Evaluación de proyectos
- Inteligencia de negocios
- Inteligencia Artificial

Todo el sistema deberá compartir una única fuente de información.

---

# Principios del proyecto

## Simplicidad

La interfaz siempre deberá ser sencilla.

Si una pantalla necesita explicación, probablemente debe rediseñarse.

---

## Consistencia

Todo el ERP deberá compartir el mismo lenguaje visual.

No deberán existir módulos que parezcan aplicaciones distintas.

Los componentes serán reutilizables.

---

## Seguridad

La seguridad nunca podrá sacrificarse por rapidez.

Toda la información deberá protegerse mediante autenticación, autorización y políticas RLS.

---

## Escalabilidad

Cada decisión deberá tomarse pensando en el crecimiento futuro.

Nunca desarrollar soluciones temporales.

Nunca duplicar lógica.

Nunca duplicar catálogos.

---

## Integración

La información debe existir una sola vez.

Todos los módulos compartirán los mismos catálogos y entidades maestras.

---

## Experiencia de usuario

Los usuarios deberán poder aprender el sistema sin necesidad de manuales.

La interfaz debe guiar naturalmente el trabajo.

---

# Tecnologías

## Frontend

- Next.js

## Backend

- Supabase

## Base de datos

- PostgreSQL

## Autenticación

- Supabase Auth

## Correo

- Resend

## Hosting

- Vercel

## Repositorio

- GitHub

---

# Arquitectura

El proyecto utiliza una arquitectura moderna basada en:

Frontend

↓

API

↓

Supabase

↓

PostgreSQL

↓

RLS

↓

Servicios externos

---

# Estado del proyecto

## Completado

- ✔ Gestión de usuarios
- ✔ Roles
- ✔ Áreas
- ✔ Invitaciones
- ✔ Activación de cuentas
- ✔ Agenda NOMIPAQ
- ✔ Seguridad RLS
- ✔ Despliegue continuo

---

## En desarrollo

- Design System
- Dashboard

---

## Planeado

- CRM
- Clientes
- Proyectos
- Capital Humano
- CFDI
- Finanzas
- Documentos
- Evaluación de proyectos
- BI
- IA

---

# Estándares

Todo Pull Request deberá:

- Compilar correctamente.
- Respetar el Manual de Marca.
- Respetar permisos.
- Mantener RLS.
- Ser responsive.
- Mantener accesibilidad.
- No romper funcionalidades existentes.
- Utilizar componentes reutilizables.

---

# Documentación

Antes de modificar cualquier parte del sistema deberán leerse como mínimo los siguientes documentos:

- docs/product/PRODUCT_VISION.md
- docs/branding/BRAND_GUIDELINES.md
- docs/branding/DESIGN_SYSTEM.md
- docs/development/CODING_STANDARDS.md
- docs/architecture/SYSTEM_ARCHITECTURE.md

---

# Filosofía

MC&DJ ERP no es un proyecto experimental.

Es el activo tecnológico más importante de MC&DJ.

Cada línea de código debe escribirse pensando que el sistema continuará creciendo durante muchos años.

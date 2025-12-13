# 🧩 FASE CLIENTE — SPRINT 1: Implementación del Formulario Interactivo y Preparación para el Futuro Back-End

## 📜 Descripción
Tras finalizar la **Landing Page** desarrollada en el módulo DIW, el siguiente paso del Proyecto Intermodular 
consiste en integrar el **formulario de registro** y el **formulario de login** correspondientes 
al módulo Cliente (DWEC). Este desarrollo debe respetar la estructura, estilo, jerarquía visual 
y decisiones del boceto aprobado en DIW, ampliando el escaparate virtual con nuevas funcionalidades interactivas.

**Historia de Usuario HU–CLIENTE–01: REGISTRO**  
Como cliente, quiero un formulario de registro, para poder crear una cuenta para recibir información y novedades
sobre la tienda.

---

## 🎯 Objetivo
Implementar formularios interactivos (registro y login) con validaciones personalizadas en JavaScript,  
integrados en la Landing Page y preparados para futura conexión con el Back-End (DWES).

---

## 💡 Motivación
Los formularios son la puerta de entrada para captar usuarios y generar comunidad. 
Una implementación clara, accesible y validada aumenta la confianza del cliente y prepara
el terreno para la gestión de cuentas en el servidor.

---

## 🔍 Análisis de Referentes

| Sitio / App | Elementos destacables | Lecciones para Raíces Viajeras |
|-------------|-----------------------|--------------------------------|
| **Amazon**  | Formularios simples, validaciones inmediatas | Mostrar errores sin recargar página |
| **Google**  | Login minimalista, accesibilidad WCAG | Etiquetas claras y navegación por teclado |
| **Facebook**| Registro con múltiples campos opcionales | Diferenciar visualmente obligatorios y opcionales |
| **LinkedIn**| Mensajes de error visibles y consistentes | Iconos de error + mensajes debajo del input |

---

## 🧠 Criterios de Aceptación

| ID   | Criterio    | Descripción                                           |
|------|-------------|-------------------------------------------------------|
| CA-1 | Registro completo | El formulario de registro debe incluir todos los campos especificados. |
| CA-2 | Login funcional | El formulario de login debe validar email y contraseña. |
| CA-3 | Validaciones JS | Validaciones personalizadas en módulos separados (`validaciones.js`, `formulario.js`). |
| CA-4 | Errores visibles | Mensajes de error claros debajo del input, sin recargar página. |
| CA-5 | Accesibilidad | Cumplir directrices WCAG 2.0 (etiquetas, contraste, navegación por teclado). |
| CA-6 | Preparación Back-End | Código modular y preparado para futuras llamadas al servidor. |

---

## 🧩 Requisitos Funcionales

1. Formulario de registro con campos obligatorios y opcionales.
2. Formulario de login con email y contraseña.
3. Validaciones personalizadas en JavaScript.
4. Mensajes de error visibles y campos resaltados.
5. Interactividad sin recargar página.
6. Preparación para futura conexión con Back-End.

---

## ⚙️ Requisitos Técnicos

- Diferenciar visualmente campos obligatorios y opcionales.
- Validaciones en módulos JS separados (`validaciones.js`, `formulario.js`).
- Errores mostrados con texto, estilo especial e icono.
- Mensajes de éxito sin recargar página.
- Prohibido el uso de frameworks JS.
- Cumplir directrices WCAG 2.0.
- Tests funcionales con Selenium/Katalon.
- Integración dentro del diseño DIW (colores, tipografías, espaciados).
- Código modular y reutilizable para futura conexión con servidor.

---

## 🧰 Tareas Técnicas

| ID  | Tarea                             | Responsable | Estado       |
|-----|-----------------------------------|-------------|--------------|
| T1  | Diseñar estructura de formularios | Equipo      | ✅ Terminado |
| T2  | Implementar registro en HTML/CSS  | Equipo      | ✅ Terminado |
| T3  | Implementar login en HTML/CSS     | Equipo      | ✅ Terminado |
| T4  | Crear validaciones en JS          | Equipo      | ✅ Terminado |
| T5  | Integrar mensajes de error        | Equipo      | ✅ Terminado |
| T6  | Ejecutar tests funcionales        | Equipo      | ⏳ Pendiente |
| T7  | Documentar accesibilidad WCAG     | Equipo      | ⏳ Pendiente |

---

## 🧭 Prioridad y Estimación

| Prioridad | Esfuerzo estimado | Dependencia                      |
|-----------|-------------------|----------------------------------|
| Alta      | 30h               | Boceto Landing-Page DIW aprobado |

---

## 🧩 Resultado Esperado

- Formulario de registro y login funcionales.
- Validaciones personalizadas en JS.
- Mensajes de error claros y accesibles.
- Preparación para futura conexión con Back-End.
- Integración coherente con la Landing Page DIW.

---

## 📎 Entregables

- **Formularios implementados:**  
  [index.html](../../../index.html)  
  [Carpeta CSS](../../../web/css/)  
  [Carpeta JS](../../../web/js/)  
  [Carpeta Imágenes](../../../web/img/)

- **Documentación ampliada:**  
  [Ver carpeta Documentación](../../../web/documentacion/).

- **Tests funcionales:**  
  [Ver carpeta Tests](../../../web/test/Katalon).

---

🌐 **Landing + Formularios publicados en GitHub Pages:**  
[Ver Proyecto en vivo](https://PageCrafters.github.io/Raices-Viajeras/)

---

## 🧾 Referencia
Proyecto: **Raíces Viajeras**  
Repositorio: (https://github.com/PageCrafters/Raices-Viajeras.git)  
Sprint: **Cliente — SPRINT 1**  
Estado: 🟢 *En desarrollo*

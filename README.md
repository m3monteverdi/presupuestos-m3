# Presupuestos M3 - Monteverdi Cúbico

Sistema web interno para la confección y gestión de presupuestos de hormigón elaborado.

## Acceso a la aplicación

https://m3monteverdi.github.io/presupuestos-m3/

## Funciones principales

- Presupuestos M3 sin IVA
- Presupuestos M3 + IVA
- Cálculo automático de importes
- Generación de PDF
- Historial de presupuestos
- Actualización de precios
- Inicio de sesión
- Almacenamiento de datos en Supabase

## Estructura

La aplicación está publicada mediante GitHub Pages.

Los datos variables se almacenan en Supabase:
- usuarios
- precios
- presupuestos
- historial

Las plantillas PDF se encuentran en la carpeta:

assets/

## Actualización del sistema

Los cambios de código se realizan en este repositorio.

Luego de modificar y guardar un archivo en la rama `main`, GitHub Pages publica automáticamente la nueva versión.

## Importante

No eliminar:
- supabase-config.js
- carpeta assets
- plantillas PDF
- tablas de Supabase

Las contraseñas de usuarios y accesos administrativos no deben almacenarse en este repositorio.

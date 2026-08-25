# Presupuestos Monteverdi Cúbico

Aplicación web interna para generar, guardar y consultar presupuestos de hormigón elaborado.

## Arquitectura

- Frontend estático: HTML, CSS y JavaScript.
- Hosting: GitHub Pages.
- Base de datos y autenticación: Supabase.
- PDFs: PDF-Lib sobre plantillas en `assets/`.

## Funciones principales

- Presupuesto M3 sin IVA.
- Presupuesto M3 + IVA.
- Numeración independiente; en IVA se utiliza el prefijo fijo `A0`.
- Fecha actual automática y editable.
- Visualización del último número de presupuesto guardado.
- Varios hormigones en un mismo presupuesto.
- Varios aditivos vinculados a cada hormigón.
- Aditivos con precio distinto según resistencia H8, H13, H17, H21, H25, H30 y H40.
- Precio de aditivo automático desde Supabase y posibilidad de sobrescribirlo manualmente en un presupuesto.
- Bomba y vibrador.
- Descuento editable.
- Guardado e historial en Supabase.
- PDF desde el formulario y desde el historial.
- Panel de actualización de precios.
- Panel de configuración administrativa sin modificar código.

## Configuración editable

La pantalla `Configuración` permite actualizar datos de la tabla `configuracion`:

- Forma de pago sin IVA.
- Validez sin IVA.
- Fecha de precios con IVA.
- Forma de pago con IVA.
- Validez con IVA.
- Cuenta, CBU y alias de Banco Credicoop.
- CBU y alias de Banco Nación.

Los nuevos PDFs toman esos valores automáticamente.

Al guardar un presupuesto se guarda también un **snapshot de configuración** dentro de `datos.configuracion`. Esto permite que un presupuesto histórico conserve los datos administrativos que tenía al momento de ser creado, aunque la configuración general cambie posteriormente.

Los presupuestos antiguos que no poseen snapshot utilizan la configuración actual de Supabase.

## Precios

La tabla `precios` utiliza estos códigos:

### Hormigones
`H8`, `H13`, `H17`, `H21`, `H25`, `H30`, `H40`.

### Aditivos por resistencia

- `mr120_H8` ... `mr120_H40`
- `macro_H8` ... `macro_H40`
- `hidrofugo_H8` ... `hidrofugo_H40`

### Servicios
`bomba`, `vibrador`.

Las filas antiguas `mr120`, `macro` e `hidrofugo` pueden permanecer en Supabase; la versión actual de la aplicación usa la matriz por resistencia.

## Configuración local

Desde la carpeta del proyecto:

```bash
python -m http.server 8002
```

Abrir:

`http://localhost:8002/`

## Publicación

El proyecto se publica desde el repositorio de GitHub Pages de Monteverdi. Antes de subir una versión nueva se recomienda probar localmente:

1. Login.
2. Actualización de precios.
3. Configuración administrativa.
4. Presupuesto M3.
5. Presupuesto M3+IVA.
6. Precio automático y manual de aditivos.
7. Guardado en historial.
8. Vista desde historial.
9. PDF desde formulario.
10. PDF desde historial.

## Seguridad

La clave incluida en `supabase-config.js` es una **publishable key** y puede estar en un frontend público. Nunca debe colocarse una `service_role` key en GitHub Pages.

Las tablas deben tener RLS activo. Como actualmente existe un único usuario administrador, las operaciones de edición deben requerir una sesión autenticada. Ver `supabase-configuracion-rls.sql`.

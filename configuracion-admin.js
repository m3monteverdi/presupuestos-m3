// =====================================
// PANEL DE CONFIGURACIÓN
// =====================================

const CAMPOS_CONFIGURACION = [
    "forma_pago_sin_iva",
    "validez_sin_iva",
    "fecha_precios_iva",
    "forma_pago_iva",
    "validez_iva",
    "banco_credicoop_cuenta",
    "banco_credicoop_cbu",
    "banco_credicoop_alias",
    "banco_nacion_cbu",
    "banco_nacion_alias"
];

const botonGuardarConfiguracion =
    document.getElementById("guardarConfiguracion");

const mensajeConfiguracion =
    document.getElementById("mensajeConfiguracion");

function setMensajeConfiguracion(texto, esError = false) {
    if (!mensajeConfiguracion) return;
    mensajeConfiguracion.textContent = texto;
    mensajeConfiguracion.classList.toggle("mensaje-error", esError);
}

async function cargarFormularioConfiguracion() {
    try {
        setMensajeConfiguracion("Cargando configuración...");

        const configuracion =
            await cargarConfiguracionMonteverdi({ forzar: true });

        CAMPOS_CONFIGURACION.forEach(clave => {
            const campo = document.getElementById(clave);
            if (campo) {
                campo.value = configuracion[clave] ?? "";
            }
        });

        setMensajeConfiguracion("");
    } catch (error) {
        console.error("Error cargando configuración:", error);
        setMensajeConfiguracion(
            "No se pudo cargar la configuración.",
            true
        );
    }
}

async function actualizarConfiguracion(clave, valor) {
    const { data, error } = await supabaseClient
        .from("configuracion")
        .update({
            valor: String(valor ?? ""),
            actualizado_en: new Date().toISOString()
        })
        .eq("clave", clave)
        .select("clave");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        throw new Error(
            `No se pudo actualizar la configuración "${clave}". ` +
            "Verifique que la fila exista y que las políticas RLS permitan UPDATE."
        );
    }
}

async function guardarConfiguracion() {
    if (!botonGuardarConfiguracion) return;

    botonGuardarConfiguracion.disabled = true;
    botonGuardarConfiguracion.textContent = "Guardando...";
    setMensajeConfiguracion("Guardando configuración...");

    try {
        for (const clave of CAMPOS_CONFIGURACION) {
            const campo = document.getElementById(clave);
            if (!campo) continue;
            await actualizarConfiguracion(clave, campo.value.trim());
        }

        invalidarConfiguracionMonteverdi();
        await cargarConfiguracionMonteverdi({ forzar: true });

        setMensajeConfiguracion(
            "Configuración actualizada correctamente."
        );
    } catch (error) {
        console.error("Error guardando configuración:", error);
        setMensajeConfiguracion(
            "No se pudo guardar la configuración. Revisá la consola y las políticas RLS.",
            true
        );
    } finally {
        botonGuardarConfiguracion.disabled = false;
        botonGuardarConfiguracion.textContent = "Guardar configuración";
    }
}

if (botonGuardarConfiguracion) {
    botonGuardarConfiguracion.addEventListener(
        "click",
        guardarConfiguracion
    );
}

document.addEventListener(
    "DOMContentLoaded",
    cargarFormularioConfiguracion
);

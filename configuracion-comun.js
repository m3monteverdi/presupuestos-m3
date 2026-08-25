// =====================================
// CONFIGURACIÓN GENERAL DE MONTEVERDI
// Lectura compartida desde Supabase
// =====================================

const CONFIGURACION_DEFAULTS = {
    banco_credicoop_alias: "",
    banco_credicoop_cbu: "",
    banco_credicoop_cuenta: "",
    banco_nacion_alias: "",
    banco_nacion_cbu: "",
    fecha_precios_iva: "",
    forma_pago_iva: "Contado / Cheque propio (+ IVA) / Tarjeta de credito (+ IVA) / Transferencia (+ IVA)",
    forma_pago_sin_iva: "Contado",
    validez_iva: "15 dias corridos",
    validez_sin_iva: "2 dias corridos"
};

let configuracionMonteverdiCache = null;

async function cargarConfiguracionMonteverdi(opciones = {}) {
    const forzar = Boolean(opciones.forzar);

    if (!forzar && configuracionMonteverdiCache) {
        return { ...configuracionMonteverdiCache };
    }

    const { data, error } = await supabaseClient
        .from("configuracion")
        .select("clave, valor");

    if (error) {
        console.error("Error cargando configuración:", error);
        throw error;
    }

    const configuracion = {
        ...CONFIGURACION_DEFAULTS
    };

    (data || []).forEach(fila => {
        if (!fila || !fila.clave) return;
        configuracion[fila.clave] = String(fila.valor ?? "");
    });

    configuracionMonteverdiCache = configuracion;
    return { ...configuracion };
}

function invalidarConfiguracionMonteverdi() {
    configuracionMonteverdiCache = null;
}

function aplicarConfiguracionEnDocumento(configuracion) {
    document
        .querySelectorAll("[data-config-clave]")
        .forEach(elemento => {
            const clave = elemento.dataset.configClave;
            const prefijo = elemento.dataset.configPrefijo || "";
            const sufijo = elemento.dataset.configSufijo || "";
            const valor = configuracion[clave] ?? "";
            elemento.textContent = `${prefijo}${valor}${sufijo}`;
        });
}

async function cargarYAplicarConfiguracionEnDocumento() {
    if (!document.querySelector("[data-config-clave]")) {
        return;
    }

    try {
        const configuracion = await cargarConfiguracionMonteverdi();
        aplicarConfiguracionEnDocumento(configuracion);
    } catch (error) {
        console.error("No se pudo aplicar la configuración en la página:", error);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    cargarYAplicarConfiguracionEnDocumento
);

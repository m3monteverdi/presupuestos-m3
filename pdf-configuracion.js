// =====================================
// CONFIGURACIÓN EDITABLE DEL PDF
// Usa snapshot del presupuesto si existe.
// Para presupuestos nuevos/no guardados usa Supabase.
// =====================================

async function cfgPdfObtenerConfiguracion(presupuesto) {
    const snapshot =
        presupuesto &&
        presupuesto.datos &&
        presupuesto.datos.configuracion;

    if (
        snapshot &&
        typeof snapshot === "object" &&
        Object.keys(snapshot).length > 0
    ) {
        return {
            ...CONFIGURACION_DEFAULTS,
            ...snapshot
        };
    }

    return await cargarConfiguracionMonteverdi({ forzar: true });
}

function cfgPdfTexto(valor) {
    return String(valor ?? "")
        .replace(/\u2013|\u2014/g, "-")
        .replace(/\u2018|\u2019/g, "'")
        .replace(/\u201C|\u201D/g, '"')
        .trim();
}

function cfgPdfEscribir(
    pagina,
    fuente,
    texto,
    x,
    y,
    size
) {
    const valor = cfgPdfTexto(texto);
    if (!valor) return;

    pagina.drawText(valor, {
        x,
        y,
        size,
        font: fuente,
        color: PDFLib.rgb(0, 0, 0)
    });
}

async function cfgPdfAplicar(bytes, conIVA, presupuesto) {
    const configuracion =
        await cfgPdfObtenerConfiguracion(presupuesto);

    const pdf = await PDFLib.PDFDocument.load(bytes);
    const pagina = pdf.getPages()[0];
    const fuente = await pdf.embedFont(
        PDFLib.StandardFonts.Helvetica
    );

    // =====================================
    // SIN IVA
    // =====================================
    if (!conIVA) {
        cfgPdfEscribir(
            pagina,
            fuente,
            "Forma de Pago: " +
                (configuracion.forma_pago_sin_iva || "Contado"),
            52.7,
            312.0,
            6.82
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "Validez de la oferta : " +
                (configuracion.validez_sin_iva || "2 dias corridos"),
            52.7,
            268.1,
            6.82
        );
    }

    // =====================================
    // CON IVA
    // =====================================
    if (conIVA) {
        cfgPdfEscribir(
            pagina,
            fuente,
            "Precios al " +
                (configuracion.fecha_precios_iva || ""),
            19.65,
            296.4,
            7.08
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "Forma de pago: " +
                (configuracion.forma_pago_iva || ""),
            19.65,
            279.4,
            7.08
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "Cuenta: " +
                (configuracion.banco_credicoop_cuenta || ""),
            19.65,
            240.6,
            7.08
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "CBU: " +
                (configuracion.banco_credicoop_cbu || ""),
            19.65,
            226.8,
            7.08
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "ALIAS:" +
                (configuracion.banco_credicoop_alias || ""),
            19.65,
            213.0,
            7.08
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "CBU: " +
                (configuracion.banco_nacion_cbu || ""),
            208.75,
            226.8,
            7.08
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "ALIAS: " +
                (configuracion.banco_nacion_alias || ""),
            208.75,
            213.0,
            7.08
        );

        cfgPdfEscribir(
            pagina,
            fuente,
            "Validez de la oferta : " +
                (configuracion.validez_iva || "15 dias corridos"),
            19.65,
            163.1,
            7.08
        );
    }

    return await pdf.save();
}

// =====================================
// INTERCEPTAR GENERACIÓN SIN IVA
// =====================================

const cfgPdfGenerarM3Original = generarM3;

generarM3 = async function (presupuesto) {
    const bytes = await cfgPdfGenerarM3Original(presupuesto);
    return await cfgPdfAplicar(bytes, false, presupuesto);
};

// =====================================
// INTERCEPTAR GENERACIÓN CON IVA
// =====================================

const cfgPdfGenerarM3IVAOriginal = generarM3IVA;

generarM3IVA = async function (presupuesto) {
    const bytes = await cfgPdfGenerarM3IVAOriginal(presupuesto);
    return await cfgPdfAplicar(bytes, true, presupuesto);
};

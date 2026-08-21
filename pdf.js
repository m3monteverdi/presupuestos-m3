// =====================================
// PDF MONTEVERDI - PLANTILLA ORIGINAL
// =====================================

const {
    PDFDocument,
    StandardFonts,
    rgb
} = PDFLib;


const NEGRO =
    rgb(0, 0, 0);

const BLANCO =
    rgb(1, 1, 1);


// =====================================
// FUNCIONES GENERALES
// =====================================

function textoSeguro(valor) {

    return String(valor ?? "")
        .replace(/\u2013|\u2014/g, "-")
        .replace(/\u2018|\u2019/g, "'")
        .replace(/\u201C|\u201D/g, '"')
        .trim();

}


function numeroAR(valor) {

    const numero =
        Number(valor || 0);


    return numero.toLocaleString(
        "es-AR",
        {
            minimumFractionDigits:
                Number.isInteger(numero)
                    ? 0
                    : 1,

            maximumFractionDigits: 2
        }
    );

}


function dineroNumero(valor) {

    const numero =
        Number(valor || 0);


    if (numero === 0) {

        return "-";

    }


    return numero.toLocaleString(
        "es-AR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function dineroCompleto(valor) {

    const numero =
        Number(valor || 0);


    if (numero === 0) {

        return "$ -";

    }


    return (
        "$ " +
        dineroNumero(numero)
    );

}


function fechaAR(fecha) {

    if (!fecha) {

        return "";

    }


    const partes =
        String(fecha).split("-");


    if (partes.length !== 3) {

        return String(fecha);

    }


    return (
        `${Number(partes[2])}/` +
        `${Number(partes[1])}/` +
        `${partes[0]}`
    );

}


function tipoHormigonPDF(tipo) {

    const texto =
        textoSeguro(tipo)
            .toUpperCase();


    const coincidencia =
        texto.match(
            /^H\s*(\d+)$/
        );


    if (coincidencia) {

        return (
            `H ${coincidencia[1]}`
        );

    }


    return texto;

}


function nombreAditivoPDF(
    tipo,
    conIVA
) {

    const codigo =
        textoSeguro(tipo)
            .toLowerCase();


    if (codigo === "mr120") {

        if (conIVA) {

            return (
                "ADITIVO EN OBRA   " +
                "MR120 superfluidificante"
            );

        }


        return (
            "MR120 superfluidificante"
        );

    }


    if (codigo === "macro") {

        return "MACRO FIBRAS";

    }


    if (codigo) {

        return textoSeguro(tipo);

    }


    return "";

}


// =====================================
// CANTIDADES DE PRESUPUESTOS ANTIGUOS
// =====================================

function cantidadInferida(
    cantidadGuardada,
    total,
    precio,
    alternativa = 0
) {

    if (
        cantidadGuardada !== undefined &&
        cantidadGuardada !== null &&
        cantidadGuardada !== ""
    ) {

        return (
            Number(cantidadGuardada) || 0
        );

    }


    const valorPrecio =
        Number(precio || 0);


    const valorTotal =
        Number(total || 0);


    if (
        valorPrecio > 0 &&
        valorTotal > 0
    ) {

        return (
            valorTotal /
            valorPrecio
        );

    }


    return (
        Number(alternativa || 0)
    );

}


// =====================================
// NOMBRE DEL ARCHIVO
// =====================================

function limpiarNombreArchivo(texto) {

    return String(texto || "")
        .replace(
            /[\\/:*?"<>|]/g,
            ""
        )
        .trim();

}


// =====================================
// DESCARGAR PDF
// =====================================

function descargarBytes(
    bytes,
    nombreArchivo
) {

    const blob =
        new Blob(
            [bytes],
            {
                type:
                    "application/pdf"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const enlace =
        document.createElement(
            "a"
        );


    enlace.href =
        url;


    enlace.download =
        nombreArchivo;


    document.body.appendChild(
        enlace
    );


    enlace.click();


    enlace.remove();


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


// =====================================
// OBTENER PRESUPUESTO DESDE SUPABASE
// =====================================

async function obtenerPresupuestoPDF() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get("id");


    if (!id) {

        throw new Error(
            "No se encontró el ID del presupuesto."
        );

    }


    const { data, error } =
        await supabaseClient
            .from("presupuestos")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (error) {

        throw error;

    }


    return data;

}


// =====================================
// FUNCIONES PARA ESCRIBIR
// =====================================

function dibujarTexto(
    page,
    font,
    texto,
    x,
    y,
    size = 7,
    color = NEGRO
) {

    const valor =
        textoSeguro(texto);


    if (!valor) {

        return;

    }


    page.drawText(
        valor,
        {
            x: x,
            y: y,
            size: size,
            font: font,
            color: color
        }
    );

}


function dibujarCentrado(
    page,
    font,
    texto,
    centroX,
    y,
    size = 7,
    color = NEGRO
) {

    const valor =
        textoSeguro(texto);


    if (!valor) {

        return;

    }


    const ancho =
        font.widthOfTextAtSize(
            valor,
            size
        );


    page.drawText(
        valor,
        {
            x:
                centroX -
                ancho / 2,

            y: y,

            size: size,

            font: font,

            color: color
        }
    );

}


function dibujarDerecha(
    page,
    font,
    texto,
    derechaX,
    y,
    size = 7,
    color = NEGRO
) {

    const valor =
        textoSeguro(texto);


    if (!valor) {

        return;

    }


    const ancho =
        font.widthOfTextAtSize(
            valor,
            size
        );


    page.drawText(
        valor,
        {
            x:
                derechaX -
                ancho,

            y: y,

            size: size,

            font: font,

            color: color
        }
    );

}


// =====================================
// DIBUJAR $ Y VALOR SEPARADOS
// =====================================

function dibujarDineroSeparado(
    page,
    font,
    valor,
    xPeso,
    derechaNumero,
    y,
    size = 7,
    color = NEGRO
) {

    const numero =
        Number(valor || 0);


    dibujarTexto(
        page,
        font,
        "$",
        xPeso,
        y,
        size,
        color
    );


    dibujarDerecha(
        page,
        font,
        numero === 0
            ? "-"
            : dineroNumero(numero),

        derechaNumero,
        y,
        size,
        color
    );

}


// =====================================
// NORMALIZAR DATOS
// =====================================

function datosNormalizados(
    presupuesto
) {

    const datos =
        presupuesto.datos || {};


    const hormigon =
        datos.hormigon || {};


    const aditivo =
        datos.aditivo || {};


    const servicios =
        datos.servicios || {};


    const bomba =
        servicios.bomba || {};


    const vibrador =
        servicios.vibrador || {};


    const cantidadHormigon =
        Number(
            hormigon.cantidad || 0
        );


    const cantidadAditivo =
        cantidadInferida(
            aditivo.cantidad,
            aditivo.total,
            aditivo.precioM3,
            aditivo.tipo
                ? cantidadHormigon
                : 0
        );


    const cantidadBomba =
        cantidadInferida(
            bomba.cantidad,
            bomba.total,
            bomba.precio,
            0
        );


    const cantidadVibrador =
        cantidadInferida(
            vibrador.cantidad,
            vibrador.total,
            vibrador.precio,
            0
        );


    const totalHormigon =
        Number(
            hormigon.total || 0
        );


    const totalAditivo =
        Number(
            aditivo.total || 0
        );


    const totalBomba =
        Number(
            bomba.total || 0
        );


    const totalVibrador =
        Number(
            vibrador.total || 0
        );


    const totalServicios =
        totalBomba +
        totalVibrador;


    const descuento =
        Number(
            datos.descuento || 0
        );


    const totalFinal =
        Number(
            presupuesto.total_final ||
            datos.totalFinal ||
            0
        );


    let subtotal =
        Number(
            datos.subtotalSinIVA || 0
        );


    if (!subtotal) {

        if (
            presupuesto.tipo_planilla ===
            "PresupuestosM3+IVA"
        ) {

            subtotal =
                totalFinal / 1.21;

        } else {

            subtotal =
                totalFinal;

        }

    }


    let iva =
        Number(
            datos.iva21 || 0
        );


    if (
        !iva &&
        presupuesto.tipo_planilla ===
        "PresupuestosM3+IVA"
    ) {

        iva =
            subtotal * 0.21;

    }


    return {

        datos:
            datos,

        hormigon:
            hormigon,

        aditivo:
            aditivo,

        bomba:
            bomba,

        vibrador:
            vibrador,

        cantidadHormigon:
            cantidadHormigon,

        cantidadAditivo:
            cantidadAditivo,

        cantidadBomba:
            cantidadBomba,

        cantidadVibrador:
            cantidadVibrador,

        totalHormigon:
            totalHormigon,

        totalAditivo:
            totalAditivo,

        totalBomba:
            totalBomba,

        totalVibrador:
            totalVibrador,

        totalServicios:
            totalServicios,

        descuento:
            descuento,

        subtotal:
            subtotal,

        iva:
            iva,

        totalFinal:
            totalFinal

    };

}


// =====================================
// ABRIR PLANTILLA
// =====================================

async function cargarPlantilla(ruta) {

    const respuesta = await fetch(
        ruta + "?v=" + Date.now(),
        {
            cache: "no-store"
        }
    );

    if (!respuesta.ok) {

        throw new Error(
            `No se pudo abrir la plantilla: ${ruta}`
        );

    }

    return await respuesta.arrayBuffer();
}


// =====================================
// GENERAR PRESUPUESTO M3 SIN IVA
// =====================================

async function generarM3(
    presupuesto
) {

    const plantilla =
        await cargarPlantilla(
            "assets/plantilla-m3.pdf"
        );


    const pdfDoc =
        await PDFDocument.load(
            plantilla
        );


    const page =
        pdfDoc.getPages()[0];


    const normal =
        await pdfDoc.embedFont(
            StandardFonts.Helvetica
        );


    const negrita =
        await pdfDoc.embedFont(
            StandardFonts.HelveticaBold
        );


    const d =
        datosNormalizados(
            presupuesto
        );


    // =====================================
    // DATOS GENERALES
    // =====================================

    dibujarTexto(
        page,
        normal,
        presupuesto.senores,
        89.1,
        687.4,
        6.8
    );


    dibujarTexto(
        page,
        normal,
        d.datos.atencion || "",
        89.1,
        672.5,
        6.8
    );


    dibujarTexto(
        page,
        normal,
        d.datos.destino || "",
        89.1,
        658.7,
        6.8
    );


    dibujarDerecha(
        page,
        normal,
        fechaAR(
            presupuesto.fecha
        ),
        542.6,
        687.4,
        6.8
    );


    dibujarDerecha(
        page,
        normal,
        presupuesto.presupuesto_numero,
        542.6,
        672.5,
        6.8
    );


    // =====================================
    // TOTAL BARRA HORMIGÓN
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalHormigon,
        480.9,
        540.3,
        623.9,
        6.8,
        BLANCO
    );


    // =====================================
    // FILA HORMIGÓN
    // =====================================

    dibujarCentrado(
        page,
        normal,
        tipoHormigonPDF(
            d.hormigon.tipo
        ),
        114.4,
        604.4,
        6.8
    );


    dibujarCentrado(
        page,
        normal,
        numeroAR(
            d.cantidadHormigon
        ),
        163.8,
        604.4,
        6.8
    );


    dibujarCentrado(
        page,
        normal,
        d.hormigon.cemento ||
        "CPP40 KG",
        211.7,
        604.4,
        6.8
    );


    dibujarCentrado(
        page,
        normal,
        `${numeroAR(
            d.hormigon.distancia
        )} KM`,
        257.8,
        604.4,
        6.8
    );


    dibujarDerecha(
        page,
        normal,
        dineroCompleto(
            d.hormigon.precioM3
        ),
        322.9,
        604.4,
        6.8
    );


    dibujarDineroSeparado(
        page,
        normal,
        d.totalHormigon,
        336.0,
        388.8,
        604.4,
        6.8
    );


    // =====================================
    // TOTAL BARRA ADITIVO
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalAditivo,
        480.9,
        540.3,
        551.2,
        6.8,
        BLANCO
    );


    // =====================================
    // FILA ADITIVO
    // =====================================

    dibujarCentrado(
        page,
        normal,
        tipoHormigonPDF(
            d.hormigon.tipo
        ),
        114.4,
        531.8,
        6.8
    );


    if (d.aditivo.tipo) {

        dibujarCentrado(
            page,
            normal,
            numeroAR(
                d.cantidadAditivo
            ),
            163.8,
            531.8,
            6.8
        );


        dibujarCentrado(
            page,
            normal,
            nombreAditivoPDF(
                d.aditivo.tipo,
                false
            ),
            232.0,
            532.5,
            5.45
        );


        dibujarDerecha(
            page,
            normal,
            dineroCompleto(
                d.aditivo.precioM3
            ),
            319.1,
            531.8,
            6.8
        );

    }


    dibujarDineroSeparado(
        page,
        normal,
        d.totalAditivo,
        336.0,
        388.8,
        531.8,
        6.8
    );


    // =====================================
    // TOTAL BARRA SERVICIOS
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalServicios,
        480.9,
        540.3,
        478.5,
        6.8,
        BLANCO
    );


    // =====================================
    // BOMBA
    // =====================================

    if (
        d.cantidadBomba > 0
    ) {

        dibujarCentrado(
            page,
            normal,
            numeroAR(
                d.cantidadBomba
            ),
            114.4,
            441.7,
            6.8
        );


        dibujarCentrado(
            page,
            normal,
            "De 01 m3 a 30 m3",
            210.0,
            441.7,
            6.8
        );


        dibujarDineroSeparado(
            page,
            normal,
            d.bomba.precio,
            282.3,
            327.9,
            441.7,
            6.8
        );

    } else {

        dibujarDineroSeparado(
            page,
            normal,
            0,
            282.3,
            327.9,
            441.7,
            6.8
        );

    }


    dibujarDineroSeparado(
        page,
        normal,
        d.totalBomba,
        336.0,
        388.8,
        441.7,
        6.8
    );


    // =====================================
    // VIBRADOR
    // =====================================

    if (
        d.cantidadVibrador > 0
    ) {

        dibujarCentrado(
            page,
            normal,
            numeroAR(
                d.cantidadVibrador
            ),
            114.4,
            394.1,
            6.8
        );


        dibujarCentrado(
            page,
            normal,
            "1",
            209.9,
            394.1,
            6.8
        );


        dibujarDineroSeparado(
            page,
            normal,
            d.vibrador.precio,
            282.3,
            327.9,
            394.1,
            6.8
        );

    } else {

        dibujarDineroSeparado(
            page,
            normal,
            0,
            282.3,
            327.9,
            394.1,
            6.8
        );

    }


    dibujarDineroSeparado(
        page,
        normal,
        d.totalVibrador,
        336.0,
        388.8,
        394.1,
        6.8
    );


    // =====================================
    // DESCUENTO
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.descuento,
        481.1,
        540.1,
        379.6,
        7.5,
        BLANCO
    );


    // =====================================
    // TOTAL SIN IVA
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalFinal,
        481.1,
        540.1,
        364.7,
        7.5,
        BLANCO
    );


    return await pdfDoc.save();

}


// =====================================
// GENERAR PRESUPUESTO M3 + IVA
// =====================================

async function generarM3IVA(
    presupuesto
) {

    const plantilla =
        await cargarPlantilla(
            "assets/plantilla-m3-iva.pdf"
        );


    const pdfDoc =
        await PDFDocument.load(
            plantilla
        );


    const page =
        pdfDoc.getPages()[0];


    const normal =
        await pdfDoc.embedFont(
            StandardFonts.Helvetica
        );


    const negrita =
        await pdfDoc.embedFont(
            StandardFonts.HelveticaBold
        );


    const d =
        datosNormalizados(
            presupuesto
        );


    // =====================================
    // DATOS GENERALES
    // =====================================

    dibujarTexto(
        page,
        normal,
        presupuesto.senores,
        60.6,
        696.9,
        7.08
    );


    dibujarTexto(
        page,
        normal,
        d.datos.cuit || "",
        330.0,
        696.9,
        7.08
    );


    dibujarTexto(
        page,
        normal,
        d.datos.atencion || "",
        60.6,
        681.5,
        7.08
    );


    dibujarTexto(
        page,
        normal,
        d.datos.destino || "",
        60.6,
        666.6,
        7.08
    );


    dibujarDerecha(
        page,
        normal,
        fechaAR(
            presupuesto.fecha
        ),
        526.4,
        696.9,
        7.08
    );


    dibujarDerecha(
        page,
        normal,
        presupuesto.presupuesto_numero,
        526.4,
        681.5,
        7.08
    );


    // =====================================
    // TOTAL BARRA HORMIGÓN
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalHormigon,
        462.3,
        524.0,
        633.7,
        7.08,
        BLANCO
    );


    // =====================================
    // FILA HORMIGÓN
    // =====================================

    dibujarCentrado(
        page,
        normal,
        tipoHormigonPDF(
            d.hormigon.tipo
        ),
        79.2,
        613.5,
        7.08
    );


    dibujarCentrado(
        page,
        normal,
        numeroAR(
            d.cantidadHormigon
        ),
        120.0,
        613.5,
        7.08
    );


    dibujarCentrado(
        page,
        normal,
        d.hormigon.cemento ||
        "CPP40 KG",
        173.7,
        613.5,
        7.08
    );


    dibujarCentrado(
        page,
        normal,
        `${numeroAR(
            d.hormigon.distancia
        )} KM`,
        232.9,
        613.5,
        7.08
    );


    dibujarDerecha(
        page,
        normal,
        dineroCompleto(
            d.hormigon.precioM3
        ),
        308.5,
        613.5,
        7.08
    );


    dibujarDineroSeparado(
        page,
        normal,
        d.totalHormigon,
        325.3,
        383.8,
        613.5,
        7.08
    );


    // =====================================
    // TOTAL BARRA ADITIVO
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalAditivo,
        462.3,
        524.0,
        572.1,
        7.08,
        BLANCO
    );


    // =====================================
    // FILA ADITIVO
    // =====================================

    dibujarCentrado(
        page,
        normal,
        tipoHormigonPDF(
            d.hormigon.tipo
        ),
        79.2,
        551.9,
        7.08
    );


    if (d.aditivo.tipo) {

        dibujarCentrado(
            page,
            normal,
            numeroAR(
                d.cantidadAditivo
            ),
            120.0,
            551.9,
            7.08
        );


        dibujarCentrado(
            page,
            normal,
            nombreAditivoPDF(
                d.aditivo.tipo,
                true
            ),
            199.7,
            552.7,
            5.65
        );


        dibujarDerecha(
            page,
            normal,
            dineroCompleto(
                d.aditivo.precioM3
            ),
            304.6,
            551.9,
            7.08
        );

    }


    dibujarDineroSeparado(
        page,
        normal,
        d.totalAditivo,
        325.3,
        383.8,
        551.9,
        7.08
    );


    // =====================================
    // TOTAL BARRA SERVICIOS
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalServicios,
        462.3,
        524.0,
        496.7,
        7.08,
        BLANCO
    );


    // =====================================
    // BOMBA
    // =====================================

    if (
        d.cantidadBomba > 0
    ) {

        dibujarCentrado(
            page,
            normal,
            numeroAR(
                d.cantidadBomba
            ),
            79.2,
            458.4,
            7.08
        );


        dibujarCentrado(
            page,
            normal,
            "De 01 m3 a 30 m3",
            179.2,
            458.4,
            7.08
        );


        dibujarDineroSeparado(
            page,
            normal,
            d.bomba.precio,
            263.2,
            316.9,
            458.4,
            7.08
        );

    } else {

        dibujarDineroSeparado(
            page,
            normal,
            0,
            263.2,
            316.9,
            458.4,
            7.08
        );

    }


    dibujarDineroSeparado(
        page,
        normal,
        d.totalBomba,
        325.3,
        383.8,
        458.4,
        7.08
    );


    // =====================================
    // VIBRADOR
    // =====================================

    if (
        d.cantidadVibrador > 0
    ) {

        dibujarCentrado(
            page,
            normal,
            numeroAR(
                d.cantidadVibrador
            ),
            79.2,
            409.0,
            7.08
        );


        dibujarCentrado(
            page,
            normal,
            "1",
            179.2,
            409.0,
            7.08
        );


        dibujarDineroSeparado(
            page,
            normal,
            d.vibrador.precio,
            263.2,
            316.9,
            409.0,
            7.08
        );

    } else {

        dibujarDineroSeparado(
            page,
            normal,
            0,
            263.2,
            316.9,
            409.0,
            7.08
        );

    }


    dibujarDineroSeparado(
        page,
        normal,
        d.totalVibrador,
        325.3,
        383.8,
        409.0,
        7.08
    );


    // =====================================
    // DESCUENTO
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.descuento,
        462.6,
        523.8,
        394.0,
        7.79,
        BLANCO
    );


    // =====================================
    // SUBTOTAL SIN IVA
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.subtotal,
        462.6,
        523.8,
        378.6,
        7.79,
        BLANCO
    );


    // =====================================
    // IVA
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.iva,
        462.6,
        523.8,
        362.3,
        7.79,
        BLANCO
    );


    // =====================================
    // TOTAL CON IVA
    // =====================================

    dibujarDineroSeparado(
        page,
        negrita,
        d.totalFinal,
        462.6,
        523.8,
        345.7,
        7.79,
        BLANCO
    );


    return await pdfDoc.save();

}


// =====================================
// GENERAR PDF
// =====================================

async function generarPDFMonteverdi(
    boton
) {

    const textoOriginal =
        boton.textContent;


    boton.disabled =
        true;


    boton.textContent =
        "Generando PDF...";


    try {

        // =====================================
        // COMPROBAR SESIÓN
        // =====================================

        const {
            data: sesionData,
            error: sesionError
        } =
            await supabaseClient
                .auth
                .getSession();


        if (
            sesionError ||
            !sesionData.session
        ) {

            alert(
                "Debe iniciar sesión para generar el PDF."
            );

            return;

        }


        // =====================================
        // CARGAR PRESUPUESTO
        // =====================================

        const presupuesto =
            await obtenerPresupuestoPDF();


        const conIVA =
            presupuesto.tipo_planilla ===
            "PresupuestosM3+IVA";


        // =====================================
        // ELEGIR PLANTILLA
        // =====================================

        let bytes;


        if (conIVA) {

            bytes =
                await generarM3IVA(
                    presupuesto
                );

        } else {

            bytes =
                await generarM3(
                    presupuesto
                );

        }


        // =====================================
        // NOMBRE
        // =====================================

        const nombreArchivo =
            limpiarNombreArchivo(

                `${presupuesto.senores} - ` +
                `Presupuesto ` +
                `${presupuesto.presupuesto_numero}.pdf`

            );


        // =====================================
        // DESCARGAR
        // =====================================

        descargarBytes(
            bytes,
            nombreArchivo
        );


    } catch (error) {

        console.error(
            "Error generando PDF:",
            error
        );


        alert(
            "No se pudo generar el PDF. Revisá la consola para ver el error."
        );


    } finally {

        boton.disabled =
            false;


        boton.textContent =
            textoOriginal;

    }

}


// =====================================
// BOTÓN GENERAR PDF
// =====================================

document.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                "#generarPDFHistorial"
            );


        if (!boton) {

            return;

        }


        generarPDFMonteverdi(
            boton
        );

    }
);
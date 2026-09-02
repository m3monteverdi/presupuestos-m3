// =====================================
// PDF MONTEVERDI
// VARIOS HORMIGONES + VARIOS ADITIVOS
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

    return String(
        valor ?? ""
    )
        .replace(
            /\u2013|\u2014/g,
            "-"
        )
        .replace(
            /\u2018|\u2019/g,
            "'"
        )
        .replace(
            /\u201C|\u201D/g,
            '"'
        )
        .trim();

}


function numeroAR(valor) {

    const numero =
        Number(
            valor || 0
        );


    return numero
        .toLocaleString(
            "es-AR",
            {
                minimumFractionDigits:
                    Number.isInteger(
                        numero
                    )
                        ? 0
                        : 1,

                maximumFractionDigits:
                    2
            }
        );

}


function dineroNumero(valor) {

    const numero =
        Number(
            valor || 0
        );


    if (
        numero ===
        0
    ) {

        return "-";

    }


    return numero
        .toLocaleString(
            "es-AR",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        );

}


function dineroCompleto(valor) {

    const numero =
        Number(
            valor || 0
        );


    return numero ===
        0
        ? "$ -"
        : "$ " +
            dineroNumero(
                numero
            );

}


function fechaAR(fecha) {

    if (!fecha) {

        return "";

    }


    const partes =
        String(
            fecha
        )
            .split("-");


    if (
        partes.length !==
        3
    ) {

        return String(
            fecha
        );

    }


    return (
        `${Number(
            partes[2]
        )}/` +
        `${Number(
            partes[1]
        )}/` +
        `${partes[0]}`
    );

}


function tipoHormigonPDF(
    tipo
) {

    const texto =
        textoSeguro(
            tipo
        )
            .toUpperCase();


    const coincidencia =
        texto.match(
            /^H\s*(\d+)$/
        );


    if (
        coincidencia
    ) {

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
        textoSeguro(
            tipo
        )
            .toLowerCase();


    if (
        codigo ===
        "mr120"
    ) {

        return conIVA
            ? (
                "ADITIVO EN OBRA " +
                "MR120 superfluidificante"
            )
            : (
                "MR120 superfluidificante"
            );

    }


    if (
        codigo ===
        "macro"
    ) {

        return (
            "MACROFIBRA / MICROFIBRA"
        );

    }


    if (
        codigo ===
        "hidrofugo"
    ) {

        return (
            "HIDROFUGO - IDROCRET HP"
        );

    }


    return codigo
        ? textoSeguro(
            tipo
        )
        : "";

}


function cantidadInferida(
    cantidad,
    total,
    precio,
    alternativa = 0
) {

    if (
        cantidad !==
            undefined &&
        cantidad !==
            null &&
        cantidad !==
            ""
    ) {

        return (
            Number(
                cantidad
            ) || 0
        );

    }


    const p =
        Number(
            precio || 0
        );


    const t =
        Number(
            total || 0
        );


    if (
        p > 0 &&
        t > 0
    ) {

        return (
            t /
            p
        );

    }


    return (
        Number(
            alternativa || 0
        )
    );

}


// =====================================
// ARCHIVO
// =====================================

function limpiarNombreArchivo(
    texto
) {

    return String(
        texto || ""
    )
        .replace(
            /[\\/:*?"<>|]/g,
            ""
        )
        .trim();

}


function descargarBytes(
    bytes,
    nombreArchivo
) {

    const blob =
        new Blob(
            [
                bytes
            ],
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
        document
            .createElement(
                "a"
            );


    enlace.href =
        url;


    enlace.download =
        nombreArchivo;


    document.body
        .appendChild(
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
// PRESUPUESTO DESDE SUPABASE
// =====================================

async function obtenerPresupuestoPDF() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get(
            "id"
        );


    if (!id) {

        throw new Error(
            "No se encontró el ID del presupuesto."
        );

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "presupuestos"
            )
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
// FUNCIONES DE DIBUJO
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
        textoSeguro(
            texto
        );


    if (!valor) {

        return;

    }


    page.drawText(
        valor,
        {
            x:
                x,

            y:
                y,

            size:
                size,

            font:
                font,

            color:
                color
        }
    );

}


function tamanoAjustado(
    font,
    texto,
    size,
    anchoMaximo,
    minimo = 4.2
) {

    const valor =
        textoSeguro(
            texto
        );


    if (
        !valor ||
        !anchoMaximo
    ) {

        return size;

    }


    let resultado =
        size;


    while (
        resultado >
            minimo &&
        font
            .widthOfTextAtSize(
                valor,
                resultado
            ) >
            anchoMaximo
    ) {

        resultado -=
            0.2;

    }


    return Math.max(
        resultado,
        minimo
    );

}


function dibujarCentrado(
    page,
    font,
    texto,
    centroX,
    y,
    size = 7,
    color = NEGRO,
    anchoMaximo = null
) {

    const valor =
        textoSeguro(
            texto
        );


    if (!valor) {

        return;

    }


    const sizeFinal =
        tamanoAjustado(
            font,
            valor,
            size,
            anchoMaximo
        );


    const ancho =
        font
            .widthOfTextAtSize(
                valor,
                sizeFinal
            );


    page.drawText(
        valor,
        {
            x:
                centroX -
                ancho /
                2,

            y:
                y,

            size:
                sizeFinal,

            font:
                font,

            color:
                color
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
    color = NEGRO,
    anchoMaximo = null
) {

    const valor =
        textoSeguro(
            texto
        );


    if (!valor) {

        return;

    }


    const sizeFinal =
        tamanoAjustado(
            font,
            valor,
            size,
            anchoMaximo
        );


    const ancho =
        font
            .widthOfTextAtSize(
                valor,
                sizeFinal
            );


    page.drawText(
        valor,
        {
            x:
                derechaX -
                ancho,

            y:
                y,

            size:
                sizeFinal,

            font:
                font,

            color:
                color
        }
    );

}


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
        Number(
            valor || 0
        );


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
        numero ===
            0
            ? "-"
            : dineroNumero(
                numero
            ),
        derechaNumero,
        y,
        size,
        color
    );

}


// =====================================
// ESPACIADO DE VARIAS FILAS
// =====================================

function parametrosFilas(
    cantidad,
    yInicial,
    yMinimo,
    sizeBase
) {

    if (
        cantidad <=
        1
    ) {

        return {

            paso:
                0,

            size:
                sizeBase

        };

    }


    const espacio =
        yInicial -
        yMinimo;


    const paso =
        Math.min(
            11,
            espacio /
            (
                cantidad -
                1
            )
        );


    const size =
        Math.min(
            sizeBase,
            Math.max(
                4.2,
                paso *
                0.68
            )
        );


    return {

        paso:
            paso,

        size:
            size

    };

}


// =====================================
// NORMALIZAR DATOS
// =====================================

function datosNormalizados(
    presupuesto
) {

    const datos =
        presupuesto.datos ||
        {};


    const servicios =
        datos.servicios ||
        {};


    const bomba =
        servicios.bomba ||
        {};


    const vibrador =
        servicios.vibrador ||
        {};


    let hormigones =
        [];


    if (
        Array.isArray(
            datos.hormigones
        ) &&
        datos.hormigones
            .length
    ) {

        hormigones =
            datos.hormigones;

    } else if (
        datos.hormigon &&
        datos.hormigon.tipo
    ) {

        hormigones = [
            datos.hormigon
        ];

    }


    hormigones =
        hormigones.map(
            h => ({

                ...h,

                cantidad:
                    Number(
                        h.cantidad ||
                        0
                    ),

                distancia:
                    Number(
                        h.distancia ||
                        0
                    ),

                precioM3:
                    Number(
                        h.precioM3 ||
                        0
                    ),

                total:
                    Number(
                        h.total ||
                        0
                    )

            })
        );


    let aditivos =
        [];


    if (
        Array.isArray(
            datos.aditivos
        )
    ) {

        aditivos =
            datos.aditivos;

    } else if (
        datos.aditivo &&
        datos.aditivo.tipo
    ) {

        aditivos = [

            {

                ...datos.aditivo,

                hormigonTipo:

                    datos.aditivo
                        .hormigonTipo ||

                    (
                        hormigones[0]
                            ? hormigones[0]
                                .tipo
                            : ""
                    )

            }

        ];

    }


    const cantidadPrimerHormigon =

        hormigones[0]

            ? Number(
                hormigones[0]
                    .cantidad ||
                0
            )

            : 0;


    aditivos =
        aditivos.map(
            a => ({

                ...a,

                cantidad:
                    cantidadInferida(

                        a.cantidad,

                        a.total,

                        a.precioM3,

                        a.tipo
                            ? cantidadPrimerHormigon
                            : 0

                    ),

                precioM3:
                    Number(
                        a.precioM3 ||
                        0
                    ),

                total:
                    Number(
                        a.total ||
                        0
                    )

            })
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
        hormigones.reduce(

            (
                suma,
                h
            ) =>
                suma +
                Number(
                    h.total ||
                    0
                ),

            0

        );


    const totalAditivo =
        aditivos.reduce(

            (
                suma,
                a
            ) =>
                suma +
                Number(
                    a.total ||
                    0
                ),

            0

        );


    const totalBomba =
        Number(
            bomba.total ||
            0
        );


    const totalVibrador =
        Number(
            vibrador.total ||
            0
        );


    const totalServicios =
        totalBomba +
        totalVibrador;


    const descuento =
        Number(
            datos.descuento ||
            0
        );


    const totalFinal =
        Number(

            presupuesto
                .total_final ||

            datos.totalFinal ||

            0

        );


    let subtotal =
        Number(
            datos.subtotalSinIVA ||
            0
        );


    if (!subtotal) {

        subtotal =

            presupuesto
                .tipo_planilla ===
            "PresupuestosM3+IVA"

                ? totalFinal /
                    1.21

                : totalFinal;

    }


    let iva =
        Number(
            datos.iva21 ||
            0
        );


    if (
        !iva &&
        presupuesto
            .tipo_planilla ===
        "PresupuestosM3+IVA"
    ) {

        iva =
            subtotal *
            0.21;

    }


    return {

        datos:
            datos,

        hormigones:
            hormigones,

        aditivos:
            aditivos,

        bomba:
            bomba,

        vibrador:
            vibrador,

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
// CARGAR PLANTILLA
// =====================================

async function cargarPlantilla(
    ruta
) {

    const respuesta =
        await fetch(

            ruta +
            "?v=" +
            Date.now(),

            {
                cache:
                    "no-store"
            }

        );


    if (
        !respuesta.ok
    ) {

        throw new Error(
            `No se pudo abrir la plantilla: ${ruta}`
        );

    }


    return await respuesta
        .arrayBuffer();

}


// =====================================
// CONFIGURACIÓN M3
// =====================================

const CONFIG_M3 = {

    conIVA:
        false,

    plantilla:
        "assets/plantilla-m3.pdf?v=2",


    general: {

        senores:
            [
                89.1,
                687.4,
                6.8
            ],

        atencion:
            [
                89.1,
                672.5,
                6.8
            ],

        destino:
            [
                89.1,
                658.7,
                6.8
            ],

        fecha:
            [
                542.6,
                687.4,
                6.8
            ],

        numero:
            [
                542.6,
                672.5,
                6.8
            ]

    },


    totalHormigon:
        [
            480.9,
            540.3,
            623.9,
            6.8
        ],


    totalAditivo:
        [
            480.9,
            540.3,
            551.2,
            6.8
        ],


    totalServicios:
        [
            480.9,
            540.3,
            478.5,
            6.8
        ],


    hormigon: {

        y:
            604.4,

        yMin:
            560.0,

        size:
            6.8,

        tipo:
            [
                114.4,
                55
            ],

        cantidad:
            163.8,

        cemento:
            [
                211.7,
                61
            ],

        distancia:
            [
                257.8,
                45
            ],

        precio:
            [
                322.9,
                61
            ],

        total:
            [
                336.0,
                388.8
            ]

    },


    aditivo: {

        y:
            531.8,

        yMin:
            488.5,

        size:
            6.8,

        tipoHormigon:
            [
                114.4,
                55
            ],

        cantidad:
            163.8,

        nombre:
            [
                232.0,
                108
            ],

        precio:
            [
                319.1,
                60
            ],

        total:
            [
                336.0,
                388.8
            ]

    },


    bomba: {

        y:
            441.7,

        cantidad:
            114.4,

        rango:
            210.0,

        precio:
            [
                282.3,
                327.9
            ],

        total:
            [
                336.0,
                388.8
            ],

        size:
            6.8

    },


    vibrador: {

        y:
            394.1,

        cantidad:
            114.4,

        unidad:
            209.9,

        precio:
            [
                282.3,
                327.9
            ],

        total:
            [
                336.0,
                388.8
            ],

        size:
            6.8

    },


    descuento:
        [
            481.1,
            540.1,
            379.6,
            7.5
        ],


    totalFinal:
        [
            481.1,
            540.1,
            364.7,
            7.5
        ]

};


// =====================================
// CONFIGURACIÓN IVA
// =====================================

const CONFIG_IVA = {

    conIVA:
        true,

    plantilla:
        "assets/plantilla-m3-iva.pdf?v=2",


    general: {

        senores:
            [
                60.6,
                696.9,
                7.08
            ],

        cuit:
            [
                330.0,
                696.9,
                7.08
            ],

        atencion:
            [
                60.6,
                681.5,
                7.08
            ],

        destino:
            [
                60.6,
                666.6,
                7.08
            ],

        fecha:
            [
                526.4,
                696.9,
                7.08
            ],

        numero:
            [
                526.4,
                681.5,
                7.08
            ]

    },


    totalHormigon:
        [
            462.3,
            524.0,
            633.7,
            7.08
        ],


    totalAditivo:
        [
            462.3,
            524.0,
            572.1,
            7.08
        ],


    totalServicios:
        [
            462.3,
            524.0,
            496.7,
            7.08
        ],


    hormigon: {

        y:
            613.5,

        yMin:
            580.5,

        size:
            7.08,

        tipo:
            [
                79.2,
                48
            ],

        cantidad:
            120.0,

        cemento:
            [
                173.7,
                64
            ],

        distancia:
            [
                232.9,
                51
            ],

        precio:
            [
                308.5,
                69
            ],

        total:
            [
                325.3,
                383.8
            ]

    },


    aditivo: {

        y:
            551.9,

        yMin:
            506.0,

        size:
            7.08,

        tipoHormigon:
            [
                79.2,
                48
            ],

        cantidad:
            120.0,

        nombre:
            [
                199.7,
                128
            ],

        precio:
            [
                304.6,
                69
            ],

        total:
            [
                325.3,
                383.8
            ]

    },


    bomba: {

        y:
            458.4,

        cantidad:
            79.2,

        rango:
            179.2,

        precio:
            [
                263.2,
                316.9
            ],

        total:
            [
                325.3,
                383.8
            ],

        size:
            7.08

    },


    vibrador: {

        y:
            409.0,

        cantidad:
            79.2,

        unidad:
            179.2,

        precio:
            [
                263.2,
                316.9
            ],

        total:
            [
                325.3,
                383.8
            ],

        size:
            7.08

    },


    descuento:
        [
            462.6,
            523.8,
            394.0,
            7.79
        ],


    subtotal:
        [
            462.6,
            523.8,
            378.6,
            7.79
        ],


    iva:
        [
            462.6,
            523.8,
            362.3,
            7.79
        ],


    totalFinal:
        [
            462.6,
            523.8,
            345.7,
            7.79
        ]

};


// =====================================
// DIBUJAR HORMIGONES
// =====================================

function dibujarHormigones(
    page,
    normal,
    d,
    config
) {

    const c =
        config.hormigon;


    const filas =
        parametrosFilas(

            d.hormigones
                .length,

            c.y,

            c.yMin,

            c.size

        );


    d.hormigones
        .forEach(
            (
                h,
                indice
            ) => {

                const y =
                    c.y -
                    indice *
                    filas.paso;


                const size =
                    filas.size;


                dibujarCentrado(

                    page,

                    normal,

                    tipoHormigonPDF(
                        h.tipo
                    ),

                    c.tipo[0],

                    y,

                    size,

                    NEGRO,

                    c.tipo[1]

                );


                dibujarCentrado(

                    page,

                    normal,

                    numeroAR(
                        h.cantidad
                    ),

                    c.cantidad,

                    y,

                    size

                );


                dibujarCentrado(

                    page,

                    normal,

                    h.cemento ||
                    "CPP40 KG",

                    c.cemento[0],

                    y,

                    size,

                    NEGRO,

                    c.cemento[1]

                );


                dibujarCentrado(

                    page,

                    normal,

                    `${numeroAR(
                        h.distancia
                    )} KM`,

                    c.distancia[0],

                    y,

                    size,

                    NEGRO,

                    c.distancia[1]

                );


                dibujarDerecha(

                    page,

                    normal,

                    dineroCompleto(
                        h.precioM3
                    ),

                    c.precio[0],

                    y,

                    size,

                    NEGRO,

                    c.precio[1]

                );


                dibujarDineroSeparado(

                    page,

                    normal,

                    h.total,

                    c.total[0],

                    c.total[1],

                    y,

                    size

                );

            }
        );

}


// =====================================
// DIBUJAR ADITIVOS
// =====================================

function dibujarAditivos(
    page,
    normal,
    d,
    config
) {

    const c =
        config.aditivo;


    const filas =
        parametrosFilas(

            d.aditivos
                .length,

            c.y,

            c.yMin,

            c.size

        );


    d.aditivos
        .forEach(
            (
                a,
                indice
            ) => {

                const y =
                    c.y -
                    indice *
                    filas.paso;


                const size =
                    filas.size;


                dibujarCentrado(

                    page,

                    normal,

                    tipoHormigonPDF(
                        a.hormigonTipo
                    ),

                    c.tipoHormigon[0],

                    y,

                    size,

                    NEGRO,

                    c.tipoHormigon[1]

                );


                dibujarCentrado(

                    page,

                    normal,

                    numeroAR(
                        a.cantidad
                    ),

                    c.cantidad,

                    y,

                    size

                );


                dibujarCentrado(

                    page,

                    normal,

                    nombreAditivoPDF(
                        a.tipo,
                        config.conIVA
                    ),

                    c.nombre[0],

                    y,

                    size,

                    NEGRO,

                    c.nombre[1]

                );


                dibujarDerecha(

                    page,

                    normal,

                    dineroCompleto(
                        a.precioM3
                    ),

                    c.precio[0],

                    y,

                    size,

                    NEGRO,

                    c.precio[1]

                );


                dibujarDineroSeparado(

                    page,

                    normal,

                    a.total,

                    c.total[0],

                    c.total[1],

                    y,

                    size

                );

            }
        );

}


// =====================================
// DIBUJAR SERVICIO
// =====================================

function dibujarServicio(
    page,
    normal,
    servicio,
    cantidad,
    config,
    esBomba
) {

    const y =
        config.y;


    const size =
        config.size;


    if (
        cantidad >
        0
    ) {

        dibujarCentrado(

            page,

            normal,

            numeroAR(
                cantidad
            ),

            config.cantidad,

            y,

            size

        );


        dibujarCentrado(

            page,

            normal,

            esBomba

                ? "De 01 m3 a 30 m3"

                : "1",

            esBomba

                ? config.rango

                : config.unidad,

            y,

            size

        );


        dibujarDineroSeparado(

            page,

            normal,

            servicio.precio,

            config.precio[0],

            config.precio[1],

            y,

            size

        );


    } else {


        dibujarDineroSeparado(

            page,

            normal,

            0,

            config.precio[0],

            config.precio[1],

            y,

            size

        );

    }


    dibujarDineroSeparado(

        page,

        normal,

        servicio.total,

        config.total[0],

        config.total[1],

        y,

        size

    );

}


// =====================================
// GENERADOR PRINCIPAL
// =====================================

async function generarConConfig(
    presupuesto,
    config
) {

    const plantilla =
        await cargarPlantilla(
            config.plantilla
        );


    const pdfDoc =
        await PDFDocument
            .load(
                plantilla
            );


    const page =
        pdfDoc
            .getPages()[0];


    const normal =
        await pdfDoc
            .embedFont(
                StandardFonts
                    .Helvetica
            );


    const negrita =
        await pdfDoc
            .embedFont(
                StandardFonts
                    .HelveticaBold
            );


    const d =
        datosNormalizados(
            presupuesto
        );


    const g =
        config.general;


    // =====================================
    // DATOS GENERALES
    // =====================================

    dibujarTexto(

        page,

        normal,

        presupuesto.senores,

        g.senores[0],

        g.senores[1],

        g.senores[2]

    );


    if (
        config.conIVA
    ) {

        dibujarTexto(

            page,

            normal,

            d.datos.cuit ||
            "",

            g.cuit[0],

            g.cuit[1],

            g.cuit[2]

        );

    }


    dibujarTexto(

        page,

        normal,

        d.datos.atencion ||
        "",

        g.atencion[0],

        g.atencion[1],

        g.atencion[2]

    );


    dibujarTexto(

        page,

        normal,

        d.datos.destino ||
        "",

        g.destino[0],

        g.destino[1],

        g.destino[2]

    );


    dibujarDerecha(

        page,

        normal,

        fechaAR(
            presupuesto.fecha
        ),

        g.fecha[0],

        g.fecha[1],

        g.fecha[2]

    );


    dibujarDerecha(

        page,

        normal,

        presupuesto
            .presupuesto_numero,

        g.numero[0],

        g.numero[1],

        g.numero[2]

    );


    // =====================================
    // HORMIGÓN
    // =====================================

    dibujarDineroSeparado(

        page,

        negrita,

        d.totalHormigon,

        config
            .totalHormigon[0],

        config
            .totalHormigon[1],

        config
            .totalHormigon[2],

        config
            .totalHormigon[3],

        BLANCO

    );


    dibujarHormigones(

        page,

        normal,

        d,

        config

    );


    // =====================================
    // ADITIVOS
    // =====================================

    dibujarDineroSeparado(

        page,

        negrita,

        d.totalAditivo,

        config
            .totalAditivo[0],

        config
            .totalAditivo[1],

        config
            .totalAditivo[2],

        config
            .totalAditivo[3],

        BLANCO

    );


    dibujarAditivos(

        page,

        normal,

        d,

        config

    );


    // =====================================
    // SERVICIOS
    // =====================================

    dibujarDineroSeparado(

        page,

        negrita,

        d.totalServicios,

        config
            .totalServicios[0],

        config
            .totalServicios[1],

        config
            .totalServicios[2],

        config
            .totalServicios[3],

        BLANCO

    );


    dibujarServicio(

        page,

        normal,

        d.bomba,

        d.cantidadBomba,

        config.bomba,

        true

    );


    dibujarServicio(

        page,

        normal,

        d.vibrador,

        d.cantidadVibrador,

        config.vibrador,

        false

    );


    // =====================================
    // DESCUENTO
    // =====================================

    dibujarDineroSeparado(

        page,

        negrita,

        d.descuento,

        config
            .descuento[0],

        config
            .descuento[1],

        config
            .descuento[2],

        config
            .descuento[3],

        BLANCO

    );


    // =====================================
    // IVA
    // =====================================

    if (
        config.conIVA
    ) {

        dibujarDineroSeparado(

            page,

            negrita,

            d.subtotal,

            config
                .subtotal[0],

            config
                .subtotal[1],

            config
                .subtotal[2],

            config
                .subtotal[3],

            BLANCO

        );


        dibujarDineroSeparado(

            page,

            negrita,

            d.iva,

            config
                .iva[0],

            config
                .iva[1],

            config
                .iva[2],

            config
                .iva[3],

            BLANCO

        );

    }


    // =====================================
    // TOTAL FINAL
    // =====================================

    dibujarDineroSeparado(

        page,

        negrita,

        d.totalFinal,

        config
            .totalFinal[0],

        config
            .totalFinal[1],

        config
            .totalFinal[2],

        config
            .totalFinal[3],

        BLANCO

    );


    return await pdfDoc
        .save({ useObjectStreams: false });

}


// =====================================
// FUNCIONES QUE YA USA LA APP
// =====================================

async function generarM3(
    presupuesto
) {

    return await generarConConfig(

        presupuesto,

        CONFIG_M3

    );

}


async function generarM3IVA(
    presupuesto
) {

    return await generarConConfig(

        presupuesto,

        CONFIG_IVA

    );

}


// =====================================
// GENERAR PDF DESDE HISTORIAL
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

        const {

            data:
                sesionData,

            error:
                sesionError

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


        const presupuesto =
            await obtenerPresupuestoPDF();


        const conIVA =

            presupuesto
                .tipo_planilla ===
            "PresupuestosM3+IVA";


        const bytes =

            conIVA

                ? await generarM3IVA(
                    presupuesto
                )

                : await generarM3(
                    presupuesto
                );


        const nombreArchivo =
            limpiarNombreArchivo(

                `${presupuesto.senores} - ` +
                `Presupuesto ` +
                `${presupuesto.presupuesto_numero}.pdf`

            );


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
// BOTÓN PDF DEL HISTORIAL
// =====================================

document.addEventListener(
    "click",
    function (
        evento
    ) {

        const boton =
            evento.target
                .closest(
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
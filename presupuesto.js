// =====================================
// PRESUPUESTOS MONTEVERDI
// =====================================

let precios = {
    hormigones: {
        H8: 0,
        H13: 0,
        H17: 0,
        H21: 0,
        H25: 0,
        H30: 0,
        H40: 0
    },

    aditivos: {
        mr120: {H8:0,H13:0,H17:0,H21:0,H25:0,H30:0,H40:0},
        macro: {H8:0,H13:0,H17:0,H21:0,H25:0,H30:0,H40:0},
        hidrofugo: {H8:0,H13:0,H17:0,H21:0,H25:0,H30:0,H40:0}
    },

    bomba: 0,
    vibrador: 0
};


let valorTotalHormigon = 0;
let valorTotalAditivo = 0;
let valorTotalBomba = 0;
let valorTotalVibrador = 0;

let cantidadBombaOtro = 0;
let cantidadVibradorOtro = 0;

let descuentoModificadoManualmente = false;

let contadorHormigon = 1;
let contadorAditivo = 1;


const $ = id =>
    document.getElementById(id);


const cantidadBomba =
    $("cantidadBomba");

const precioBomba =
    $("precioBomba");

const totalBomba =
    $("totalBomba");


const cantidadVibrador =
    $("cantidadVibrador");

const precioVibrador =
    $("precioVibrador");

const totalVibrador =
    $("totalVibrador");


const resumenHormigon =
    $("resumenHormigon");

const resumenAditivo =
    $("resumenAditivo");

const resumenServicios =
    $("resumenServicios");


const descuento =
    $("descuento");


const totalSinIVA =
    $("totalSinIVA");

const subtotalSinIVA =
    $("subtotalSinIVA");

const iva21 =
    $("iva21");

const totalConIVA =
    $("totalConIVA");


const filasHormigon =
    $("filasHormigon");

const filasAditivo =
    $("filasAditivo");


const botonAgregarHormigon =
    $("agregarHormigon");

const botonAgregarAditivo =
    $("agregarAditivo");


const botonGuardarPresupuesto =
    $("guardarPresupuesto");


// =====================================
// FORMATO PESOS
// =====================================

function formatoPesos(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2
        }
    );

}


// =====================================
// FECHA AUTOMÁTICA
// =====================================

function colocarFechaDeHoy() {

    const campoFecha =
        $("fecha");

    if (
        !campoFecha ||
        campoFecha.value
    ) {
        return;
    }

    const hoy =
        new Date();

    const anio =
        hoy.getFullYear();

    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            hoy.getDate()
        ).padStart(
            2,
            "0"
        );

    campoFecha.value =
        `${anio}-${mes}-${dia}`;

}


// =====================================
// ÚLTIMO PRESUPUESTO
// =====================================

async function mostrarUltimoPresupuesto() {

    const elemento =
        $("ultimoPresupuesto");

    if (!elemento) {
        return;
    }

    const tipoPlanilla =
        document.body.dataset.tipo;


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "presupuestos"
            )
            .select(
                "presupuesto_numero"
            )
            .eq(
                "tipo_planilla",
                tipoPlanilla
            )
            .order(
                "id",
                {
                    ascending: false
                }
            )
            .limit(1);


    if (error) {

        console.error(
            "Error al obtener último presupuesto:",
            error
        );

        elemento.textContent =
            "No se pudo consultar el último presupuesto";

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        elemento.textContent =
            "No hay presupuestos anteriores";

        return;

    }


    elemento.textContent =
        `Último presupuesto: ${data[0].presupuesto_numero}`;

}


// =====================================
// NÚMERO DE PRESUPUESTO
// A0 FIJO PARA IVA
// =====================================

function obtenerNumeroPresupuestoCompleto() {

    const campo =
        $("presupuestoNumero");

    const numero =
        campo
            ? String(
                campo.value
            ).trim()
            : "";


    if (!numero) {
        return "";
    }


    if (
        document.body.dataset.tipo ===
        "PresupuestosM3+IVA"
    ) {

        return `A0${numero}`;

    }


    return numero;

}


// =====================================
// CARGAR PRECIOS SUPABASE
// =====================================

async function cargarPreciosDesdeSupabase() {
    try {

        const {data,error} =
            await supabaseClient
                .from("precios")
                .select("codigo, valor");

        if(error){

            console.error(
                "Error cargando precios:",
                error
            );

            alert(
                "No se pudieron cargar los precios."
            );

            return;
        }

        data.forEach(f => {

            const codigo =
                String(f.codigo || "");

            const valor =
                Number(f.valor || 0);


            if(
                Object.prototype
                    .hasOwnProperty
                    .call(
                        precios.hormigones,
                        codigo
                    )
            ){

                precios.hormigones[
                    codigo
                ] = valor;

                return;
            }


            const coincidencia =
                codigo.match(
                    /^(mr120|macro|hidrofugo)_(H8|H13|H17|H21|H25|H30|H40)$/
                );


            if(coincidencia){

                precios.aditivos[
                    coincidencia[1]
                ][
                    coincidencia[2]
                ] = valor;

                return;
            }


            if(codigo === "bomba"){
                precios.bomba = valor;
            }


            if(codigo === "vibrador"){
                precios.vibrador = valor;
            }

        });


        console.log(
            "Precios cargados desde Supabase:",
            precios
        );


        recalcularTodo();


    } catch(error){

        console.error(
            "Error inesperado cargando precios:",
            error
        );

    }
}


// =====================================
// HORMIGONES
// =====================================

function obtenerFilasHormigon() {

    if (!filasHormigon) {
        return [];
    }


    return Array.from(
        filasHormigon
            .querySelectorAll(
                ".fila-hormigon-dinamica"
            )
    );

}


function obtenerTipoHormigonFila(
    fila
) {

    const select =
        fila.querySelector(
            ".tipo-hormigon"
        );


    if (!select) {
        return "";
    }


    if (
        select.value ===
        "otro"
    ) {

        return (
            fila.dataset
                .tipoPersonalizado ||
            "Otro"
        );

    }


    return select.value;

}


function obtenerPrecioHormigonFila(
    fila
) {

    const select =
        fila.querySelector(
            ".tipo-hormigon"
        );


    if (!select) {
        return 0;
    }


    if (
        select.value ===
        "otro"
    ) {

        return Number(
            fila.dataset
                .precioPersonalizado ||
            0
        );

    }


    return (
        precios.hormigones[
            select.value
        ] || 0
    );

}


// =====================================
// HORMIGÓN "OTRO"
// =====================================

function configurarHormigonOtro(
    fila
) {

    const select =
        fila.querySelector(
            ".tipo-hormigon"
        );


    if (!select) {
        return;
    }


    if (
        select.value !==
        "otro"
    ) {

        delete fila.dataset
            .tipoPersonalizado;

        delete fila.dataset
            .precioPersonalizado;

        return;

    }


    const nombre =
        prompt(
            "Ingrese el tipo de hormigón:"
        );


    if (
        nombre === null ||
        !nombre.trim()
    ) {

        select.value =
            "";

        return;

    }


    const precioIngresado =
        prompt(
            "Ingrese el valor por m3 para este hormigón:"
        );


    if (
        precioIngresado ===
        null
    ) {

        select.value =
            "";

        return;

    }


    const precio =
        Number(
            String(
                precioIngresado
            )
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                )
        ) || 0;


    fila.dataset
        .tipoPersonalizado =
        nombre.trim();


    fila.dataset
        .precioPersonalizado =
        String(
            precio
        );

}


// =====================================
// CALCULAR FILA HORMIGÓN
// =====================================

function calcularFilaHormigon(
    fila
) {

    const cantidadInput =
        fila.querySelector(
            ".cantidad-hormigon"
        );

    const precioInput =
        fila.querySelector(
            ".precio-hormigon"
        );

    const totalInput =
        fila.querySelector(
            ".total-hormigon"
        );


    const cantidad =
        Number(
            cantidadInput
                ? cantidadInput.value
                : 0
        ) || 0;


    const precio =
        obtenerPrecioHormigonFila(
            fila
        );


    const total =
        cantidad *
        precio;


    fila.dataset.precio =
        String(
            precio
        );

    fila.dataset.total =
        String(
            total
        );


    if (precioInput) {

        precioInput.value =
            formatoPesos(
                precio
            );

    }


    if (totalInput) {

        totalInput.value =
            formatoPesos(
                total
            );

    }


    return total;

}


// =====================================
// CALCULAR TODOS LOS HORMIGONES
// =====================================

function calcularHormigones() {

    valorTotalHormigon =
        0;


    obtenerFilasHormigon()
        .forEach(
            fila => {

                valorTotalHormigon +=
                    calcularFilaHormigon(
                        fila
                    );

            }
        );


    actualizarOpcionesHormigonAditivos();

    calcularAditivos();

}


// =====================================
// CREAR NUEVA FILA HORMIGÓN
// =====================================

function crearFilaHormigon() {

    contadorHormigon +=
        1;


    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "fila fila-hormigon-dinamica";


    fila.dataset.id =
        String(
            contadorHormigon
        );


    fila.innerHTML = `

        <div>

            <select class="tipo-hormigon">

                <option value="">
                    Seleccionar
                </option>

                <option value="H8">
                    H8
                </option>

                <option value="H13">
                    H13
                </option>

                <option value="H17">
                    H17
                </option>

                <option value="H21">
                    H21
                </option>

                <option value="H25">
                    H25
                </option>

                <option value="H30">
                    H30
                </option>

                <option value="H40">
                    H40
                </option>

                <option value="otro">
                    Otro...
                </option>

            </select>

        </div>


        <div>

            <input
                type="number"
                class="cantidad-hormigon"
                min="0"
                step="0.1"
            >

        </div>


        <div>

            <input
                type="text"
                class="cemento-hormigon"
                value="CPP40 KG"
                readonly
            >

        </div>


        <div>

            <input
                type="number"
                class="distancia-hormigon"
                min="0"
            >

        </div>


        <div>

            <input
                type="text"
                class="precio-hormigon"
                readonly
                placeholder="$ 0,00"
            >

        </div>


        <div class="celda-total-fila">

            <input
                type="text"
                class="total-hormigon"
                readonly
                placeholder="$ 0,00"
            >

            <button
                type="button"
                class="eliminar-fila eliminar-hormigon"
                title="Eliminar hormigón"
            >
                ×
            </button>

        </div>

    `;


    return fila;

}


// =====================================
// LIMPIAR FILA HORMIGÓN
// =====================================

function limpiarFilaHormigon(
    fila
) {

    const tipo =
        fila.querySelector(
            ".tipo-hormigon"
        );

    const cantidad =
        fila.querySelector(
            ".cantidad-hormigon"
        );

    const distancia =
        fila.querySelector(
            ".distancia-hormigon"
        );


    if (tipo) {
        tipo.value =
            "";
    }


    if (cantidad) {
        cantidad.value =
            "";
    }


    if (distancia) {
        distancia.value =
            "";
    }


    delete fila.dataset
        .tipoPersonalizado;

    delete fila.dataset
        .precioPersonalizado;


    calcularFilaHormigon(
        fila
    );

}


// =====================================
// ADITIVOS
// =====================================

function obtenerFilasAditivo() {

    if (!filasAditivo) {
        return [];
    }


    return Array.from(
        filasAditivo
            .querySelectorAll(
                ".fila-aditivo-dinamica"
            )
    );

}


function buscarHormigonPorId(
    id
) {

    return (
        obtenerFilasHormigon()
            .find(
                fila =>
                    String(
                        fila.dataset.id
                    ) ===
                    String(
                        id
                    )
            ) ||
        null
    );

}


// =====================================
// PRECIO ADITIVO POR RESISTENCIA
// =====================================

function obtenerResistenciaHormigonFila(fila) {

    if (!fila) return "";

    const select =
        fila.querySelector(
            ".tipo-hormigon"
        );

    if (!select) return "";

    return Object.prototype
        .hasOwnProperty
        .call(
            precios.hormigones,
            select.value
        )
            ? select.value
            : "";

}


function obtenerPrecioAditivoAutomatico(
    tipoAditivo,
    hormigon
) {

    const resistencia =
        obtenerResistenciaHormigonFila(
            hormigon
        );


    if (
        !tipoAditivo ||
        !resistencia ||
        !precios.aditivos[tipoAditivo]
    ) {

        return 0;

    }


    return Number(
        precios.aditivos[
            tipoAditivo
        ][
            resistencia
        ] || 0
    );

}


function parsearPrecioAditivoManual(valor) {

    let texto =
        String(
            valor ?? ""
        )
            .replace(/\$/g, "")
            .replace(/\s/g, "")
            .trim();


    if (!texto) return 0;


    if (texto.includes(",")) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    } else if (
        /^\d{1,3}(\.\d{3})+$/
            .test(texto)
    ) {

        texto =
            texto.replace(
                /\./g,
                ""
            );

    }


    const numero =
        Number(texto);


    return Number.isFinite(numero)
        ? numero
        : 0;

}


function obtenerPrecioAditivoFila(fila) {

    if (!fila) return 0;


    if (
        fila.dataset
            .precioManual ===
        "true"
    ) {

        return Number(
            fila.dataset
                .precioManualValor ||
            0
        ) || 0;

    }


    const selectHormigon =
        fila.querySelector(
            ".hormigon-aditivo"
        );


    const selectAditivo =
        fila.querySelector(
            ".tipo-aditivo"
        );


    const hormigon =
        selectHormigon
            ? buscarHormigonPorId(
                selectHormigon.value
            )
            : null;


    const tipoAditivo =
        selectAditivo
            ? selectAditivo.value
            : "";


    return obtenerPrecioAditivoAutomatico(
        tipoAditivo,
        hormigon
    );

}


function restablecerPrecioAutomaticoFilaAditivo(
    fila
) {

    if (!fila) return;

    delete fila.dataset
        .precioManual;

    delete fila.dataset
        .precioManualValor;

}


function restablecerPreciosAditivosVinculados(
    hormigonId
) {

    obtenerFilasAditivo()
        .forEach(fila => {

            const select =
                fila.querySelector(
                    ".hormigon-aditivo"
                );


            if (
                select &&
                String(select.value) ===
                String(hormigonId)
            ) {

                restablecerPrecioAutomaticoFilaAditivo(
                    fila
                );

            }

        });

}


function prepararFilaAditivoEditable(fila) {

    if (!fila) return;

    const input =
        fila.querySelector(
            ".precio-aditivo"
        );

    if (!input) return;


    input.readOnly =
        false;

    input.inputMode =
        "decimal";

    input.autocomplete =
        "off";

}


// =====================================

// =====================================
// ACTUALIZAR HORMIGONES DISPONIBLES
// EN LOS ADITIVOS
// =====================================

function actualizarOpcionesHormigonAditivos() {

    const hormigones =
        obtenerFilasHormigon();


    obtenerFilasAditivo()
        .forEach(
            filaAditivo => {

                const select =
                    filaAditivo
                        .querySelector(
                            ".hormigon-aditivo"
                        );


                if (!select) {
                    return;
                }


                const seleccionado =
                    select.value;


                select.innerHTML =
                    `
                    <option value="">
                        Seleccionar H°
                    </option>
                    `;


                hormigones.forEach(
                    filaHormigon => {

                        const tipo =
                            obtenerTipoHormigonFila(
                                filaHormigon
                            );


                        const cantidadInput =
                            filaHormigon
                                .querySelector(
                                    ".cantidad-hormigon"
                                );


                        const cantidad =
                            Number(
                                cantidadInput
                                    ? cantidadInput.value
                                    : 0
                            ) || 0;


                        if (
                            !tipo ||
                            cantidad <= 0
                        ) {

                            return;

                        }


                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            String(
                                filaHormigon
                                    .dataset.id
                            );


                        option.textContent =
                            `${tipo} - ${cantidad} m3`;


                        select.appendChild(
                            option
                        );

                    }
                );


                const existe =
                    Array.from(
                        select.options
                    )
                        .some(
                            option =>
                                option.value ===
                                seleccionado
                        );


                if (existe) {

                    select.value =
                        seleccionado;

                }

            }
        );

}


// =====================================
// CALCULAR FILA ADITIVO
// =====================================

function calcularFilaAditivo(
    fila
) {

    const selectHormigon =
        fila.querySelector(
            ".hormigon-aditivo"
        );

    const cantidadInput =
        fila.querySelector(
            ".cantidad-aditivo"
        );

    const precioInput =
        fila.querySelector(
            ".precio-aditivo"
        );

    const totalInput =
        fila.querySelector(
            ".total-aditivo"
        );


    const hormigon =
        selectHormigon
            ? buscarHormigonPorId(
                selectHormigon.value
            )
            : null;


    const cantidadHormigonInput =
        hormigon
            ? hormigon.querySelector(
                ".cantidad-hormigon"
            )
            : null;


    const cantidad =
        Number(
            cantidadHormigonInput
                ? cantidadHormigonInput.value
                : 0
        ) || 0;


    const precio =
        obtenerPrecioAditivoFila(
            fila
        );


    const total =
        cantidad *
        precio;


    if (cantidadInput) {

        cantidadInput.value =
            cantidad || "";

    }


    if (
        precioInput &&
        document.activeElement !==
        precioInput
    ) {

        precioInput.value =
            formatoPesos(
                precio
            );

    }


    if (totalInput) {

        totalInput.value =
            formatoPesos(
                total
            );

    }


    fila.dataset.cantidad =
        String(cantidad);

    fila.dataset.precio =
        String(precio);

    fila.dataset.total =
        String(total);


    return total;

}


// =====================================
// CALCULAR TODOS LOS ADITIVOS
// =====================================

function calcularAditivos() {

    valorTotalAditivo =
        0;


    obtenerFilasAditivo()
        .forEach(
            fila => {

                valorTotalAditivo +=
                    calcularFilaAditivo(
                        fila
                    );

            }
        );


    if (
        descuento &&
        !descuentoModificadoManualmente
    ) {

        descuento.value =
            valorTotalAditivo
                .toFixed(
                    2
                );

    }


    calcularTotales();

}


// =====================================
// CREAR FILA ADITIVO
// =====================================

function crearFilaAditivo() {

    contadorAditivo +=
        1;


    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "fila fila-aditivo fila-aditivo-dinamica";


    fila.dataset.id =
        String(
            contadorAditivo
        );


    fila.innerHTML = `

        <div>

            <select class="hormigon-aditivo">

                <option value="">
                    Seleccionar H°
                </option>

            </select>

        </div>


        <div>

            <input
                type="text"
                class="cantidad-aditivo"
                readonly
            >

        </div>


        <div>

            <select class="tipo-aditivo">

                <option value="">
                    Sin aditivo
                </option>

                <option value="mr120">
                    ADITIVO EN OBRA MR120 superfluidificante
                </option>

                <option value="macro">
                    MACROFIBRA / MICROFIBRA
                </option>

                <option value="hidrofugo">
                    HIDROFUGO - IDROCRET HP
                </option>

            </select>

        </div>


        <div>

            <input
                type="text"
                class="precio-aditivo"
                inputmode="decimal"
                autocomplete="off"
                placeholder="$ 0,00"
            >

        </div>


        <div class="celda-total-fila">

            <input
                type="text"
                class="total-aditivo"
                readonly
                placeholder="$ 0,00"
            >

            <button
                type="button"
                class="eliminar-fila eliminar-aditivo"
                title="Eliminar aditivo"
            >
                ×
            </button>

        </div>

    `;


    return fila;

}


// =====================================
// LIMPIAR FILA ADITIVO
// =====================================

function limpiarFilaAditivo(
    fila
) {

    const hormigon =
        fila.querySelector(
            ".hormigon-aditivo"
        );

    const tipo =
        fila.querySelector(
            ".tipo-aditivo"
        );


    if (hormigon) {

        hormigon.value =
            "";

    }


    if (tipo) {

        tipo.value =
            "";

    }


    restablecerPrecioAutomaticoFilaAditivo(
        fila
    );


    calcularFilaAditivo(
        fila
    );

}


// =====================================
// BOMBA
// =====================================

function obtenerCantidadBomba() {

    if (!cantidadBomba) {
        return 0;
    }


    if (
        cantidadBomba.value ===
        "otro"
    ) {

        return Number(
            cantidadBombaOtro
        ) || 0;

    }


    return Number(
        cantidadBomba.value
    ) || 0;

}


function calcularBomba() {

    const cantidad =
        obtenerCantidadBomba();


    valorTotalBomba =
        cantidad *
        precios.bomba;


    if (precioBomba) {

        precioBomba.value =
            formatoPesos(
                precios.bomba
            );

    }


    if (totalBomba) {

        totalBomba.value =
            formatoPesos(
                valorTotalBomba
            );

    }


    calcularTotales();

}


// =====================================
// VIBRADOR
// =====================================

function obtenerCantidadVibrador() {

    if (!cantidadVibrador) {
        return 0;
    }


    if (
        cantidadVibrador.value ===
        "otro"
    ) {

        return Number(
            cantidadVibradorOtro
        ) || 0;

    }


    return Number(
        cantidadVibrador.value
    ) || 0;

}


function calcularVibrador() {

    const cantidad =
        obtenerCantidadVibrador();


    valorTotalVibrador =
        cantidad *
        precios.vibrador;


    if (precioVibrador) {

        precioVibrador.value =
            formatoPesos(
                precios.vibrador
            );

    }


    if (totalVibrador) {

        totalVibrador.value =
            formatoPesos(
                valorTotalVibrador
            );

    }


    calcularTotales();

}


// =====================================
// TOTALES
// =====================================

function calcularTotales() {

    const valorDescuento =
        parseFloat(
            descuento
                ? descuento.value
                : 0
        ) || 0;


    const servicios =
        valorTotalBomba +
        valorTotalVibrador;


    const subtotal =
        valorTotalHormigon +
        valorTotalAditivo +
        servicios -
        valorDescuento;


    if (resumenHormigon) {

        resumenHormigon.textContent =
            formatoPesos(
                valorTotalHormigon
            );

    }


    if (resumenAditivo) {

        resumenAditivo.textContent =
            formatoPesos(
                valorTotalAditivo
            );

    }


    if (resumenServicios) {

        resumenServicios.textContent =
            formatoPesos(
                servicios
            );

    }


    if (totalSinIVA) {

        totalSinIVA.textContent =
            formatoPesos(
                subtotal
            );

    }


    if (subtotalSinIVA) {

        subtotalSinIVA.textContent =
            formatoPesos(
                subtotal
            );

    }


    const valorIVA =
        subtotal *
        0.21;


    if (iva21) {

        iva21.textContent =
            formatoPesos(
                valorIVA
            );

    }


    if (totalConIVA) {

        totalConIVA.textContent =
            formatoPesos(
                subtotal +
                valorIVA
            );

    }

}


// =====================================
// RECALCULAR TODO
// =====================================

function recalcularTodo() {

    calcularHormigones();

    calcularBomba();

    calcularVibrador();

    calcularTotales();

}


// =====================================
// EVENTOS HORMIGÓN
// =====================================

if (filasHormigon) {

    filasHormigon.addEventListener(
        "change",
        function (event) {

            const fila =
                event.target.closest(
                    ".fila-hormigon-dinamica"
                );


            if (!fila) {
                return;
            }


            if (
                event.target
                    .classList
                    .contains(
                        "tipo-hormigon"
                    )
            ) {

                configurarHormigonOtro(
                    fila
                );


                restablecerPreciosAditivosVinculados(
                    fila.dataset.id
                );

            }


            calcularHormigones();

        }
    );


    filasHormigon.addEventListener(
        "input",
        function (event) {

            const fila =
                event.target.closest(
                    ".fila-hormigon-dinamica"
                );


            if (!fila) {
                return;
            }


            calcularHormigones();

        }
    );


    filasHormigon.addEventListener(
        "click",
        function (event) {

            const boton =
                event.target.closest(
                    ".eliminar-hormigon"
                );


            if (!boton) {
                return;
            }


            const fila =
                boton.closest(
                    ".fila-hormigon-dinamica"
                );


            const filas =
                obtenerFilasHormigon();


            if (
                filas.length <=
                1
            ) {

                limpiarFilaHormigon(
                    fila
                );

            } else {

                fila.remove();

            }


            calcularHormigones();

        }
    );

}


// =====================================
// EVENTOS ADITIVOS
// =====================================

if (filasAditivo) {

    filasAditivo.addEventListener(
        "change",
        function (event) {

            const fila =
                event.target.closest(
                    ".fila-aditivo-dinamica"
                );


            if (!fila) return;


            if (
                event.target.classList
                    .contains(
                        "hormigon-aditivo"
                    ) ||
                event.target.classList
                    .contains(
                        "tipo-aditivo"
                    )
            ) {

                restablecerPrecioAutomaticoFilaAditivo(
                    fila
                );


                descuentoModificadoManualmente =
                    false;


                calcularAditivos();

            }

        }
    );


    filasAditivo.addEventListener(
        "input",
        function (event) {

            if (
                !event.target.classList
                    .contains(
                        "precio-aditivo"
                    )
            ) {

                return;

            }


            const fila =
                event.target.closest(
                    ".fila-aditivo-dinamica"
                );


            if (!fila) return;


            fila.dataset.precioManual =
                "true";


            fila.dataset.precioManualValor =
                String(
                    parsearPrecioAditivoManual(
                        event.target.value
                    )
                );


            calcularAditivos();

        }
    );


    filasAditivo.addEventListener(
        "focusin",
        function (event) {

            if (
                !event.target.classList
                    .contains(
                        "precio-aditivo"
                    )
            ) {

                return;

            }


            const fila =
                event.target.closest(
                    ".fila-aditivo-dinamica"
                );


            if (!fila) return;


            const precio =
                obtenerPrecioAditivoFila(
                    fila
                );


            event.target.value =
                precio
                    ? String(precio)
                    : "";

        }
    );


    filasAditivo.addEventListener(
        "focusout",
        function (event) {

            if (
                !event.target.classList
                    .contains(
                        "precio-aditivo"
                    )
            ) {

                return;

            }


            const fila =
                event.target.closest(
                    ".fila-aditivo-dinamica"
                );


            if (!fila) return;


            event.target.value =
                formatoPesos(
                    obtenerPrecioAditivoFila(
                        fila
                    )
                );

        }
    );


    filasAditivo.addEventListener(
        "click",
        function (event) {

            const boton =
                event.target.closest(
                    ".eliminar-aditivo"
                );


            if (!boton) return;


            const fila =
                boton.closest(
                    ".fila-aditivo-dinamica"
                );


            const filas =
                obtenerFilasAditivo();


            if (
                filas.length <=
                1
            ) {

                limpiarFilaAditivo(
                    fila
                );

            } else {

                fila.remove();

            }


            descuentoModificadoManualmente =
                false;


            calcularAditivos();

        }
    );

}


// =====================================
// BOTÓN AGREGAR HORMIGÓN
// =====================================

if (botonAgregarHormigon) {

    botonAgregarHormigon.addEventListener(
        "click",
        function () {

            filasHormigon
                .appendChild(
                    crearFilaHormigon()
                );


            actualizarOpcionesHormigonAditivos();

        }
    );

}


// =====================================
// BOTÓN AGREGAR ADITIVO
// =====================================

if (botonAgregarAditivo) {

    botonAgregarAditivo.addEventListener(
        "click",
        function () {

            const nuevaFila =
                crearFilaAditivo();


            prepararFilaAditivoEditable(
                nuevaFila
            );


            filasAditivo.appendChild(
                nuevaFila
            );


            actualizarOpcionesHormigonAditivos();

        }
    );

}


// =====================================
// EVENTO BOMBA
// =====================================

if (cantidadBomba) {

    cantidadBomba.addEventListener(
        "change",
        function () {

            if (
                cantidadBomba.value ===
                "otro"
            ) {

                const respuesta =
                    prompt(
                        "Ingrese la cantidad de servicios de bomba:"
                    );


                if (
                    respuesta ===
                    null
                ) {

                    cantidadBomba.value =
                        "0";

                    cantidadBombaOtro =
                        0;

                } else {

                    cantidadBombaOtro =
                        Number(
                            String(
                                respuesta
                            )
                                .replace(
                                    ",",
                                    "."
                                )
                        ) || 0;

                }

            } else {

                cantidadBombaOtro =
                    0;

            }


            calcularBomba();

        }
    );

}


// =====================================
// EVENTO VIBRADOR
// =====================================

if (cantidadVibrador) {

    cantidadVibrador.addEventListener(
        "change",
        function () {

            if (
                cantidadVibrador.value ===
                "otro"
            ) {

                const respuesta =
                    prompt(
                        "Ingrese la cantidad de vibradores:"
                    );


                if (
                    respuesta ===
                    null
                ) {

                    cantidadVibrador.value =
                        "0";

                    cantidadVibradorOtro =
                        0;

                } else {

                    cantidadVibradorOtro =
                        Number(
                            String(
                                respuesta
                            )
                                .replace(
                                    ",",
                                    "."
                                )
                        ) || 0;

                }

            } else {

                cantidadVibradorOtro =
                    0;

            }


            calcularVibrador();

        }
    );

}


// =====================================
// EVENTO DESCUENTO
// =====================================

if (descuento) {

    descuento.addEventListener(
        "input",
        function () {

            descuentoModificadoManualmente =
                true;


            calcularTotales();

        }
    );

}


// =====================================
// DATOS HORMIGONES PARA GUARDAR
// =====================================

function obtenerHormigonesParaGuardar() {

    return obtenerFilasHormigon()
        .map(
            fila => {

                const tipoSelect =
                    fila.querySelector(
                        ".tipo-hormigon"
                    );


                const cantidadInput =
                    fila.querySelector(
                        ".cantidad-hormigon"
                    );


                const cementoInput =
                    fila.querySelector(
                        ".cemento-hormigon"
                    );


                const distanciaInput =
                    fila.querySelector(
                        ".distancia-hormigon"
                    );


                const tipo =
                    obtenerTipoHormigonFila(
                        fila
                    );


                const cantidad =
                    Number(
                        cantidadInput
                            ? cantidadInput.value
                            : 0
                    ) || 0;


                const precioM3 =
                    obtenerPrecioHormigonFila(
                        fila
                    );


                return {

                    id:
                        String(
                            fila.dataset.id
                        ),

                    tipo:
                        tipo,

                    codigo:
                        tipoSelect
                            ? tipoSelect.value
                            : "",

                    cantidad:
                        cantidad,

                    cemento:
                        cementoInput
                            ? cementoInput.value
                            : "CPP40 KG",

                    distancia:
                        Number(
                            distanciaInput
                                ? distanciaInput.value
                                : 0
                        ) || 0,

                    precioM3:
                        precioM3,

                    total:
                        cantidad *
                        precioM3

                };

            }
        )
        .filter(
            item =>
                item.tipo &&
                item.cantidad > 0
        );

}


// =====================================
// DATOS ADITIVOS PARA GUARDAR
// =====================================

function obtenerAditivosParaGuardar() {

    return obtenerFilasAditivo()
        .map(
            fila => {

                const selectHormigon =
                    fila.querySelector(
                        ".hormigon-aditivo"
                    );


                const selectAditivo =
                    fila.querySelector(
                        ".tipo-aditivo"
                    );


                const hormigonId =
                    selectHormigon
                        ? selectHormigon.value
                        : "";


                const hormigon =
                    buscarHormigonPorId(
                        hormigonId
                    );


                const cantidadInput =
                    hormigon
                        ? hormigon.querySelector(
                            ".cantidad-hormigon"
                        )
                        : null;


                const cantidad =
                    Number(
                        cantidadInput
                            ? cantidadInput.value
                            : 0
                    ) || 0;


                const tipoAditivo =
                    selectAditivo
                        ? selectAditivo.value
                        : "";


                const resistencia =
                    obtenerResistenciaHormigonFila(
                        hormigon
                    );


                const precioM3 =
                    obtenerPrecioAditivoFila(
                        fila
                    );


                return {

                    id:
                        String(
                            fila.dataset.id
                        ),

                    hormigonId:
                        String(
                            hormigonId
                        ),

                    hormigonTipo:
                        hormigon
                            ? obtenerTipoHormigonFila(
                                hormigon
                            )
                            : "",

                    tipo:
                        tipoAditivo,

                    resistencia:
                        resistencia,

                    codigoPrecio:
                        (
                            tipoAditivo &&
                            resistencia
                        )
                            ? `${tipoAditivo}_${resistencia}`
                            : "",

                    precioManual:
                        fila.dataset
                            .precioManual ===
                        "true",

                    cantidad:
                        cantidad,

                    precioM3:
                        precioM3,

                    total:
                        cantidad *
                        precioM3

                };

            }
        )
        .filter(
            item =>
                item.tipo &&
                item.hormigonId &&
                item.cantidad > 0
        );

}


// =====================================
// GUARDAR PRESUPUESTO
// =====================================

async function guardarPresupuesto() {

    if (
        !botonGuardarPresupuesto
    ) {
        return;
    }


    botonGuardarPresupuesto.disabled =
        true;


    botonGuardarPresupuesto.textContent =
        "Guardando...";


    try {

        // =====================================
        // SESIÓN
        // =====================================

        const {
            data: sesionData,
            error: sesionError
        } =
            await supabaseClient
                .auth
                .getSession();


        if (sesionError) {

            console.error(
                "Error comprobando sesión:",
                sesionError
            );


            alert(
                "No se pudo comprobar la sesión."
            );

            return;

        }


        if (
            !sesionData.session
        ) {

            alert(
                "Debe iniciar sesión antes de guardar un presupuesto."
            );

            return;

        }


        // =====================================
        // DATOS GENERALES
        // =====================================

        const senores =
            $("senores")
                .value
                .trim();


        const atencion =
            $("atencion")
                .value
                .trim();


        const destino =
            $("destino")
                .value
                .trim();


        const fecha =
            $("fecha")
                .value;


        const presupuestoNumero =
            obtenerNumeroPresupuestoCompleto();


        const campoCUIT =
            $("cuit");


        const cuit =
            campoCUIT
                ? campoCUIT
                    .value
                    .trim()
                : "";


        const tipoPlanilla =
            document.body.dataset.tipo;


        // =====================================
        // VALIDACIONES
        // =====================================

        if (!senores) {

            alert(
                "Debe completar Señores."
            );

            return;

        }


        if (!presupuestoNumero) {

            alert(
                "Debe completar Presupuesto N°."
            );

            return;

        }


        const hormigonesGuardados =
            obtenerHormigonesParaGuardar();


        if (
            hormigonesGuardados.length ===
            0
        ) {

            alert(
                "Debe agregar al menos un hormigón con cantidad mayor a 0."
            );

            return;

        }


        const aditivosGuardados =
            obtenerAditivosParaGuardar();


        // =====================================
        // NOMBRE
        // =====================================

        const nombrePresupuesto =
            `${senores} - ${presupuestoNumero}`;


        // =====================================
        // SERVICIOS
        // =====================================

        const cantidadBombaGuardada =
            obtenerCantidadBomba();


        const cantidadVibradorGuardada =
            obtenerCantidadVibrador();


        // =====================================
        // TOTALES
        // =====================================

        const valorDescuento =
            parseFloat(
                descuento
                    ? descuento.value
                    : 0
            ) || 0;


        const subtotal =
            valorTotalHormigon +
            valorTotalAditivo +
            valorTotalBomba +
            valorTotalVibrador -
            valorDescuento;


        const valorIVA =
            tipoPlanilla ===
            "PresupuestosM3+IVA"
                ? subtotal *
                    0.21
                : 0;


        const totalFinal =
            tipoPlanilla ===
            "PresupuestosM3+IVA"
                ? subtotal +
                    valorIVA
                : subtotal;


        // =====================================
        // SNAPSHOT DE CONFIGURACIÓN
        // Conserva los datos administrativos usados
        // al momento de guardar el presupuesto.
        // =====================================

        const configuracionPresupuesto =
            await cargarConfiguracionMonteverdi({
                forzar: true
            });


        // =====================================
        // JSON COMPLETO
        // =====================================

        const datosCompletos = {

            configuracion:
                { ...configuracionPresupuesto },

            atencion:
                atencion,

            destino:
                destino,

            cuit:
                cuit,


            // NUEVO FORMATO
            // VARIOS HORMIGONES
            hormigones:
                hormigonesGuardados,


            // NUEVO FORMATO
            // VARIOS ADITIVOS
            aditivos:
                aditivosGuardados,


            // =================================
            // COMPATIBILIDAD CON LO ANTERIOR
            // =================================

            hormigon:
                hormigonesGuardados[
                    0
                ] || null,


            aditivo:
                aditivosGuardados[
                    0
                ] || {

                    tipo:
                        "",

                    cantidad:
                        0,

                    precioM3:
                        0,

                    total:
                        0

                },


            // =================================
            // SERVICIOS
            // =================================

            servicios: {

                bomba: {

                    cantidad:
                        cantidadBombaGuardada,

                    rango:
                        "De 01 m3 a 30 m3",

                    precio:
                        precios.bomba,

                    total:
                        valorTotalBomba

                },


                vibrador: {

                    cantidad:
                        cantidadVibradorGuardada,

                    porUnidad:
                        1,

                    precio:
                        precios.vibrador,

                    total:
                        valorTotalVibrador

                }

            },


            descuento:
                valorDescuento,


            subtotalSinIVA:
                subtotal,


            iva21:
                valorIVA,


            totalFinal:
                totalFinal

        };


        // =====================================
        // INSERTAR SUPABASE
        // =====================================

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "presupuestos"
                )
                .insert({

                    nombre:
                        nombrePresupuesto,

                    tipo_planilla:
                        tipoPlanilla,

                    senores:
                        senores,

                    presupuesto_numero:
                        presupuestoNumero,

                    fecha:
                        fecha || null,

                    total_final:
                        totalFinal,

                    datos:
                        datosCompletos

                })
                .select();


        if (error) {

            console.error(
                "Error guardando presupuesto:",
                error
            );


            alert(
                "No se pudo guardar el presupuesto."
            );

            return;

        }


        console.log(
            "Presupuesto guardado en Supabase:",
            data
        );


        alert(
            `Presupuesto "${nombrePresupuesto}" guardado correctamente.`
        );


        await mostrarUltimoPresupuesto();


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );


        alert(
            "Ocurrió un error al guardar el presupuesto."
        );


    } finally {

        botonGuardarPresupuesto.disabled =
            false;


        botonGuardarPresupuesto.textContent =
            "Guardar presupuesto";

    }

}


// =====================================
// BOTÓN GUARDAR
// =====================================

if (
    botonGuardarPresupuesto
) {

    botonGuardarPresupuesto
        .addEventListener(
            "click",
            guardarPresupuesto
        );

}


// =====================================
// INICIO
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        colocarFechaDeHoy();


        // =====================================
        // IDs HORMIGONES INICIALES
        // =====================================

        obtenerFilasHormigon()
            .forEach(
                (
                    fila,
                    indice
                ) => {

                    if (
                        !fila.dataset.id
                    ) {

                        fila.dataset.id =
                            String(
                                indice +
                                1
                            );

                    }


                    contadorHormigon =
                        Math.max(
                            contadorHormigon,
                            Number(
                                fila.dataset.id
                            ) || 1
                        );

                }
            );


        // =====================================
        // IDs ADITIVOS INICIALES
        // =====================================

        obtenerFilasAditivo()
            .forEach(
                (
                    fila,
                    indice
                ) => {

                    if (
                        !fila.dataset.id
                    ) {

                        fila.dataset.id =
                            String(
                                indice +
                                1
                            );

                    }


                    contadorAditivo =
                        Math.max(
                            contadorAditivo,
                            Number(
                                fila.dataset.id
                            ) || 1
                        );

                }
            );


        obtenerFilasAditivo()
            .forEach(
                fila =>
                    prepararFilaAditivoEditable(
                        fila
                    )
            );


        actualizarOpcionesHormigonAditivos();


        mostrarUltimoPresupuesto();


        cargarPreciosDesdeSupabase();

    }
);